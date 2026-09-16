/**
 * CallManager. owns every live call in this process.
 *
 * Per call we keep: the transcript, the fast-path RiskState, the call's turns in the
 * process's shared Moss *session* (a local, in-memory index; each turn is tagged with the
 * callId and recalled with a metadata filter. the "live-call context" pattern), the
 * interventions raised, and the coach's advice. Nothing is persisted; when the call ends
 * its turns are deleted from the session and the memory is gone unless the person reports.
 */
import { searchTranscript } from "@/lib/engine/transcriptSearch";
import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { FAMILY_INFO, TACTIC_INFO } from "@/lib/data/families";
import { LatencyTracker } from "@/lib/engine/latency";
import { analyzeUtterance, applyCoachVerdict, createRiskState, DEFAULT_RISK_CONFIG } from "@/lib/engine/risk";
import type { CoachAdvice, Intervention, Match, RiskLevel, RiskState, Tactic, Utterance, UtteranceAnalysis } from "@/lib/engine/types";
import { coach, summarizeCall } from "@/lib/llm/coach";
import { getMossRuntime } from "@/lib/moss/runtime";
import type { CallMeta, LatencyStats } from "@/lib/protocol";

export interface CallRecord {
  meta: CallMeta;
  transcript: Utterance[];
  analyses: UtteranceAnalysis[];
  risk: RiskState;
  interventions: Intervention[];
  advice: CoachAdvice[];
  latency: LatencyTracker;
  /** Ids of this call's turns in the shared memory session (deleted at call end). */
  memoryDocIds: string[];
  endedAt?: number;
  summary?: string;
  /** Guardian messages pushed into the call. */
  guardianMessages: Array<{ text: string; from: string; t: number }>;
  lastCoachAt: number;
  coachInFlight: boolean;
  utterancesSinceCoach: number;
  lastInterventionAt: number;
}

export type CallEvents = {
  analysis: [callId: string, analysis: UtteranceAnalysis, stats: LatencyStats];
  risk: [callId: string, risk: RiskState];
  intervention: [callId: string, intervention: Intervention];
  coach: [callId: string, advice: CoachAdvice];
  ended: [callId: string, record: CallRecord];
};

const ASK_MESSAGES: Partial<Record<Tactic, { headline: string; body: string }>> = {
  otp_request: { headline: "Do NOT read out the OTP.", body: "No bank, police or government officer ever needs your OTP. Reading it out sends them your money." },
  payment_method: { headline: "Do NOT transfer any money.", body: "There is no 'safe account', 'verification account' or 'refundable fee'. Money you send now will not come back." },
  remote_access: { headline: "Do NOT install any app.", body: "AnyDesk, TeamViewer or screen-share lets the caller see and control your phone and bank apps." },
  personal_info: { headline: "Do NOT share card, Aadhaar or PAN details.", body: "The caller is collecting details to empty your account or open one in your name." },
  victim_compliance: { headline: "STOP. Put the phone down.", body: "You are about to do exactly what the scam script is designed to make you do." },
};

export class CallManager extends EventEmitter<CallEvents> {
  private calls = new Map<string, CallRecord>();
  readonly global = new LatencyTracker(5000);

  list(): CallRecord[] {
    return [...this.calls.values()];
  }

  get(callId: string): CallRecord | undefined {
    return this.calls.get(callId);
  }

  activeForFamily(code: string): CallRecord[] {
    return this.list().filter((c) => c.meta.familyCode === code && !c.endedAt);
  }

  async start(opts: Omit<CallMeta, "callId" | "startedAt">): Promise<CallRecord> {
    if (this.list().filter(c => !c.endedAt).length >= 100) throw new Error("The shield is busy. Please try again shortly.");
    const meta: CallMeta = { ...opts, callId: randomUUID(), startedAt: Date.now() };
    const record: CallRecord = {
      meta,
      transcript: [],
      analyses: [],
      risk: createRiskState(0),
      interventions: [],
      advice: [],
      latency: new LatencyTracker(),
      memoryDocIds: [],
      guardianMessages: [],
      lastCoachAt: 0,
      coachInFlight: false,
      utterancesSinceCoach: 0,
      lastInterventionAt: -1e9,
    };
    this.calls.set(meta.callId, record);
    return record;
  }

  async analyze(callId: string, input: { text: string; speaker: Utterance["speaker"]; final: boolean; t?: number }): Promise<UtteranceAnalysis | null> {
    const record = this.calls.get(callId);
    if (!record || record.endedAt) return null;
    if (record.transcript.length >= 1000 || Date.now() - record.meta.startedAt > 3600_000) {
      await this.end(callId); return null;
    }
    const text = input.text.trim();
    if (text.length < 3) return null;
    const t0 = performance.now();
    const rt = await getMossRuntime();
    const { matches, engineMs } = await rt.retriever.search(text);
    const utterance: Utterance = {
      id: randomUUID().slice(0, 8),
      speaker: input.speaker,
      text,
      t: input.t ?? Date.now() - record.meta.startedAt,
      final: input.final,
    };
    const totalMs = performance.now() - t0;
    const analysis = analyzeUtterance(record.risk, utterance, matches, { retrievalMs: round2(engineMs), totalMs: round2(totalMs) }, DEFAULT_RISK_CONFIG);

    // Interim fragments are analysed (so we can react mid-sentence) but only final ones
    // are committed to the transcript and the risk state.
    if (input.final) {
      const prevLevel = record.risk.level;
      record.transcript.push(utterance);
      record.analyses.push(analysis);
      record.risk = analysis.risk;
      record.latency.add(totalMs, engineMs);
      this.global.add(totalMs, engineMs);
      record.utterancesSinceCoach += 1;
      void this.indexTurn(record, utterance);
      this.emit("analysis", callId, analysis, record.latency.stats());
      this.emit("risk", callId, record.risk);
      this.maybeIntervene(record, prevLevel, analysis);
      void this.maybeCoach(record, prevLevel, analysis);
    } else {
      // Interim: emit an intervention early if the fragment alone crosses into danger.
      if (analysis.risk.level === "danger" && record.risk.level !== "danger") {
        const prevLevel = record.risk.level;
        record.risk = analysis.risk;
        this.emit("risk", callId, record.risk);
        this.maybeIntervene(record, prevLevel, analysis);
      }
    }
    return analysis;
  }

  /**
   * Index a turn into the shared memory session, tagged with the call id. Only the caller's
   * substantive turns are indexed: they are what a guardian asks about, and every indexed
   * turn costs one embedding (~10 ms of the process's single embedding executor).
   */
  private async indexTurn(record: CallRecord, u: Utterance) {
    if (u.speaker === "user" || u.text.split(/\s+/).length < 6) return;
    try {
      const rt = await getMossRuntime();
      if (!rt.memory || record.endedAt) return;
      const id = `${record.meta.callId}:${u.id}`;
      await rt.memory.addDocs([{ id, text: u.text, metadata: { callId: record.meta.callId, speaker: u.speaker, t: String(u.t) } }]);
      if (record.endedAt) await rt.memory.deleteDocs([id]);
      else record.memoryDocIds.push(id);
    } catch (err) {
      console.warn("[calls] memory addDocs failed:", (err as Error).message);
    }
  }

  private maybeIntervene(record: CallRecord, prevLevel: RiskLevel, analysis: UtteranceAnalysis) {
    const risk = record.risk;
    const now = analysis.utterance.t;
    const fam = risk.dominantFamily ? FAMILY_INFO[risk.dominantFamily] : null;
    const helpline = fam?.helpline && fam.helpline !== "-" ? fam.helpline : "1930";
    const emit = (i: Omit<Intervention, "t" | "reasons" | "family" | "level">) => {
      const intervention: Intervention = { ...i, level: risk.level, reasons: risk.reasons.slice(0, 3), family: risk.dominantFamily, t: now };
      record.interventions.push(intervention);
      record.lastInterventionAt = now;
      this.emit("intervention", record.meta.callId, intervention);
    };

    // 1. Level transitions.
    if (risk.level === "danger" && prevLevel !== "danger") {
      emit({
        headline: fam ? `Stop. this is the "${fam.label}" scam script.` : "Stop. this call follows a scam script.",
        body: fam ? fam.short : "The caller is combining pressure with a request for money, codes or access.",
        sayThis: "I will not continue this call. I am going to verify this myself. Goodbye.",
        action: fam ? fam.advice : `Hang up and call ${helpline}.`,
      });
      return;
    }
    if (risk.level === "caution" && prevLevel === "safe") {
      emit({
        headline: "Careful. this call is starting to sound like a scam.",
        body: fam ? `It resembles the "${fam.label}" script. ${fam.short}` : "The caller is using pressure tactics.",
        sayThis: "Please give me a reference number. I will call back on the official number.",
        action: "Do not share any code or send money until you have verified independently.",
      });
      return;
    }
    // 2. At danger, a new *ask* deserves its own targeted, louder warning (rate-limited).
    if (risk.level === "danger") {
      const newAsk = analysis.tactics.find((t) => ASK_MESSAGES[t] && TACTIC_INFO[t].ask);
      const urgent = newAsk === "victim_compliance" || newAsk === "otp_request";
      if (newAsk && (urgent || now - record.lastInterventionAt > 8000)) {
        const m = ASK_MESSAGES[newAsk]!;
        emit({ headline: m.headline, body: m.body, sayThis: "No. I am ending this call now.", action: `Hang up and call ${helpline}.` });
      }
    }
  }

  private async maybeCoach(record: CallRecord, prevLevel: RiskLevel, analysis: UtteranceAnalysis) {
    const risk = record.risk;
    const levelChanged = risk.level !== prevLevel && risk.level !== "safe";
    const periodic = risk.level !== "safe" && record.utterancesSinceCoach >= 5;
    if (!(levelChanged || periodic) || record.coachInFlight) return;
    record.coachInFlight = true;
    record.utterancesSinceCoach = 0;
    try {
      const topMatches: Match[] = record.analyses
        .flatMap((a) => a.matches.filter((m) => m.kind === "tactic"))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 6);
      const advice = await coach({ transcript: record.transcript, risk, topMatches, region: record.meta.region });
      if (record.endedAt) return;
      record.advice.push(advice);
      record.lastCoachAt = analysis.utterance.t;
      const before = record.risk.level;
      record.risk = applyCoachVerdict(record.risk, advice.verdict, advice.confidence);
      this.emit("coach", record.meta.callId, advice);
      if (record.risk.level !== before) this.emit("risk", record.meta.callId, record.risk);
    } catch (err) {
      console.warn("[calls] coach failed:", (err as Error).message);
    } finally {
      record.coachInFlight = false;
    }
  }

  /** Semantic recall over the call's own turns. used by the guardian's "what did they ask for?". */
  async ask(callId: string, question: string): Promise<{ hits: Array<{ text: string; speaker: Utterance["speaker"]; score: number; t: number }>; latencyMs: number }> {
    const record = this.calls.get(callId);
    if (!record || record.endedAt) return { hits: [], latencyMs: 0 };
    const t0 = performance.now();
    const rt = await getMossRuntime();
    if (rt.memory && record.memoryDocIds.length > 0) {
      try {
        const res = await rt.memory.query(question, { topK: 4, filter: { field: "callId", condition: { $eq: callId } } });
        return {
          hits: res.docs.map((d) => ({
            text: d.text,
            speaker: ((d.metadata as Record<string, string> | undefined)?.speaker as Utterance["speaker"]) ?? "unknown",
            score: d.score,
            t: Number((d.metadata as Record<string, string> | undefined)?.t ?? 0),
          })),
          latencyMs: round2(performance.now() - t0),
        };
      } catch (err) {
        console.warn("[calls] session query failed:", (err as Error).message);
      }
    }
    // Offline search expands the three suggested questions and ignores filler words.
    const hits = searchTranscript(record.transcript, question);
    return { hits, latencyMs: round2(performance.now() - t0) };
  }

  pushGuardianMessage(callId: string, text: string, from: string) {
    const record = this.calls.get(callId);
    if (!record) return;
    record.guardianMessages.push({ text, from, t: Date.now() - record.meta.startedAt });
  }

  async end(callId: string): Promise<CallRecord | undefined> {
    const record = this.calls.get(callId);
    if (!record || record.endedAt) return record;
    record.endedAt = Date.now();
    record.summary = await summarizeCall(record.transcript, record.risk);
    // Forget the call's memory: delete its turns from the shared session.
    if (record.memoryDocIds.length) {
      const ids = record.memoryDocIds.splice(0);
      void getMossRuntime()
        .then((rt) => rt.memory?.deleteDocs(ids))
        .catch(() => {});
    }
    this.emit("ended", callId, record);
    // Keep the record briefly so a guardian can still read the summary, then forget it.
    setTimeout(() => this.calls.delete(callId), 10 * 60 * 1000).unref?.();
    return record;
  }

  /** Flagged caller lines from this call, for community intel. */
  flaggedLines(callId: string): Array<{ text: string; tactics: Tactic[]; family: string }> {
    const record = this.calls.get(callId);
    if (!record) return [];
    return record.analyses
      .filter((a) => a.utterance.speaker !== "user" && a.tactics.length > 0 && a.contribution > 0)
      .map((a) => ({ text: a.utterance.text, tactics: a.tactics, family: record.risk.dominantFamily ?? "unknown" }));
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

const KEY = "__raksha_call_manager__";
type G = typeof globalThis & { [KEY]?: CallManager };
export function getCallManager(): CallManager {
  const g = globalThis as G;
  if (!g[KEY]) g[KEY] = new CallManager();
  return g[KEY];
}
