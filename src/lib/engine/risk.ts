/**
 * Raksha risk engine — the *fast path*.
 *
 * Pure functions, no I/O, unit-tested. Given the retrieval hits for one transcript
 * fragment it updates a per-call RiskState using a noisy-OR over persuasion tactics,
 * plus two hard rules that mirror how scams actually end:
 *
 *   1. The triad: a *pressure* tactic (authority, fear, urgency, secrecy…) followed by an
 *      *ask* (OTP, transfer, remote access) is the signature of every phone scam. When both
 *      are present with confidence, risk jumps to at least DANGER.
 *   2. Victim compliance: if the person on the call starts reading out an OTP or says
 *      "I'm transferring now" while any pressure tactic is active, we intervene immediately.
 *
 * Evidence persists for the whole call (a scam does not un-happen because the caller
 * went quiet), which is why the model is a max-over-time per tactic, not a moving average.
 */
import { FAMILY_INFO, STAGE_ORDER, TACTIC_INFO } from "@/lib/data/families";
import type {
  Family,
  Match,
  RiskLevel,
  RiskState,
  Stage,
  Tactic,
  TacticEvidence,
  Utterance,
  UtteranceAnalysis,
  LatencySample,
} from "@/lib/engine/types";

export interface RiskConfig {
  /** Ignore matches whose calibrated confidence is below this. */
  minConfidence: number;
  /** A benign look-alike this close (raw score) to the best tactic hit suppresses the utterance. */
  benignMargin: number;
  /** Score thresholds. */
  levels: { caution: number; danger: number };
  /** Contribution scale so that one strong tactic alone tops out around ~30. */
  singleTacticCap: number;
  /** Confidence needed for a tactic to count toward the triad rule. */
  triadConfidence: number;
  /** Max number of matches credited per utterance. */
  creditTopN: number;
  /** Fragments shorter than this (in words) are never credited — "yes", "okay sir". */
  minWords: number;
}

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  minConfidence: 0.2,
  benignMargin: 0.02,
  levels: { caution: 25, danger: 60 },
  singleTacticCap: 0.32,
  triadConfidence: 0.45,
  creditTopN: 3,
  minWords: 4,
};

const PRESSURE = new Set<Tactic>(
  (Object.keys(TACTIC_INFO) as Tactic[]).filter((t) => TACTIC_INFO[t].pressure),
);
const ASK = new Set<Tactic>((Object.keys(TACTIC_INFO) as Tactic[]).filter((t) => TACTIC_INFO[t].ask));

export function createRiskState(now = 0): RiskState {
  return {
    score: 0,
    level: "safe",
    tactics: {},
    families: {},
    dominantFamily: null,
    stage: null,
    reasons: [],
    triad: false,
    timeline: [{ t: now, score: 0 }],
    updatedAt: now,
  };
}

export function levelFor(score: number, cfg: RiskConfig = DEFAULT_RISK_CONFIG): RiskLevel {
  if (score >= cfg.levels.danger) return "danger";
  if (score >= cfg.levels.caution) return "caution";
  return "safe";
}

/** Lower-ranked hits count less: the top hit is what the utterance *is*, the rest is what it *resembles*. */
const RANK_DISCOUNT = [1, 0.75, 0.55];

/**
 * Decide which matches get credited, applying benign suppression and speaker awareness.
 * The protected person's own words can only ever be evidence of *compliance* (reading an
 * OTP, agreeing to transfer) — never of the caller's pressure tactics.
 */
export function creditMatches(
  matches: Match[],
  cfg: RiskConfig = DEFAULT_RISK_CONFIG,
  speaker: Utterance["speaker"] = "caller",
): { credited: Match[]; suppressed: boolean; reason?: string } {
  const sorted = [...matches].sort((a, b) => b.score - a.score);
  let tacticHits = sorted.filter((m) => m.kind === "tactic" && m.confidence >= cfg.minConfidence);
  if (speaker === "user") tacticHits = tacticHits.filter((m) => m.tactics.includes("victim_compliance"));
  // Conversely, "I'm reading you the OTP" lines describe the victim, so a caller cannot trigger them.
  if (speaker === "caller") tacticHits = tacticHits.filter((m) => !m.tactics.includes("victim_compliance"));
  if (tacticHits.length === 0) return { credited: [], suppressed: false };
  const bestTactic = tacticHits[0];
  const bestBenign = sorted.find((m) => m.kind === "benign");
  if (bestBenign && bestBenign.score >= bestTactic.score - cfg.benignMargin) {
    return {
      credited: [],
      suppressed: true,
      reason: `Sounds like a legitimate call: "${bestBenign.text.slice(0, 80)}"`,
    };
  }
  const credited = tacticHits
    .slice(0, cfg.creditTopN)
    .map((m, i) => ({ ...m, confidence: m.confidence * (RANK_DISCOUNT[i] ?? 0.5) }))
    .filter((m) => m.confidence >= cfg.minConfidence);
  return { credited, suppressed: false };
}

function tacticConfidence(m: Match): number {
  // Severity nudges confidence: a 5/5 line ("read me the OTP") counts fully, a 2/5 hook less.
  return Math.min(1, m.confidence * (0.6 + 0.4 * (m.severity / 5)));
}

function noisyOr(tactics: Partial<Record<Tactic, TacticEvidence>>, cfg: RiskConfig): number {
  let survive = 1;
  for (const ev of Object.values(tactics)) {
    if (!ev) continue;
    const w = TACTIC_INFO[ev.tactic].weight * cfg.singleTacticCap;
    survive *= 1 - Math.min(1, w * ev.confidence);
  }
  return (1 - survive) * 100;
}

function maxStage(a: Stage | null, b: Stage | undefined): Stage | null {
  if (!b) return a;
  if (!a) return b;
  return STAGE_ORDER[b] > STAGE_ORDER[a] ? b : a;
}

function buildReasons(state: RiskState): string[] {
  const evs = Object.values(state.tactics).filter((e): e is TacticEvidence => !!e);
  evs.sort((a, b) => b.confidence * TACTIC_INFO[b.tactic].weight - a.confidence * TACTIC_INFO[a.tactic].weight);
  const reasons = evs.slice(0, 4).map((e) => TACTIC_INFO[e.tactic].label + ": " + TACTIC_INFO[e.tactic].description);
  if (state.triad) reasons.unshift("Pressure followed by a request for money, codes or access — the signature of a scam.");
  if (state.dominantFamily && state.dominantFamily !== "benign") {
    reasons.unshift(`Matches the "${FAMILY_INFO[state.dominantFamily].label}" script.`);
  }
  return reasons;
}

/**
 * Update the risk state with the retrieval hits for one utterance.
 * Returns the analysis; the state passed in is NOT mutated.
 */
export function analyzeUtterance(
  prev: RiskState,
  utterance: Utterance,
  matches: Match[],
  latency: LatencySample,
  cfg: RiskConfig = DEFAULT_RISK_CONFIG,
): UtteranceAnalysis {
  const state: RiskState = {
    ...prev,
    tactics: { ...prev.tactics },
    families: { ...prev.families },
    timeline: [...prev.timeline],
  };
  const tooShort = utterance.text.trim().split(/\s+/).length < cfg.minWords;
  const { credited, suppressed, reason } = tooShort ? { credited: [], suppressed: false, reason: undefined } : creditMatches(matches, cfg, utterance.speaker);
  const creditedTactics = new Set<Tactic>();

  for (const m of credited) {
    const conf = tacticConfidence(m);
    state.families[m.family] = (state.families[m.family] ?? 0) + conf;
    state.stage = maxStage(state.stage, m.stage);
    for (const t of m.tactics) {
      creditedTactics.add(t);
      const existing = state.tactics[t];
      if (!existing) {
        state.tactics[t] = {
          tactic: t,
          confidence: conf,
          severity: m.severity,
          count: 1,
          firstAt: utterance.t,
          lastAt: utterance.t,
          evidence: [utterance.id],
        };
      } else {
        state.tactics[t] = {
          ...existing,
          confidence: Math.max(existing.confidence, conf),
          severity: Math.max(existing.severity, m.severity),
          count: existing.count + 1,
          lastAt: utterance.t,
          evidence: existing.evidence.includes(utterance.id) ? existing.evidence : [...existing.evidence, utterance.id],
        };
      }
    }
  }

  // Dominant family = largest confidence mass, ignoring benign, with hysteresis so the
  // label does not flip between sibling scripts (courier parcel → digital arrest) every turn.
  let dominant: Family | null = null;
  let best = 0;
  for (const [f, mass] of Object.entries(state.families) as Array<[Family, number]>) {
    if (f === "benign") continue;
    if (mass > best) {
      best = mass;
      dominant = f;
    }
  }
  const currentMass = prev.dominantFamily ? (state.families[prev.dominantFamily] ?? 0) : 0;
  state.dominantFamily = prev.dominantFamily && best <= currentMass * 1.3 ? prev.dominantFamily : dominant;

  // Base score: noisy-OR over persisted tactic evidence.
  let score = noisyOr(state.tactics, cfg);

  // Rule 1 — the triad.
  const strong = (set: Set<Tactic>) =>
    Object.values(state.tactics).some((e) => e && set.has(e.tactic) && e.confidence >= cfg.triadConfidence);
  const hasPressure = strong(PRESSURE);
  const hasAsk = strong(ASK);
  state.triad = hasPressure && hasAsk;
  if (state.triad) score = Math.max(score, cfg.levels.danger + 15);

  // Rule 2 — victim compliance while under pressure.
  const compliance = state.tactics.victim_compliance;
  if (compliance && compliance.confidence >= cfg.triadConfidence && hasPressure) score = Math.max(score, 85);

  // Distinct-tactic diversity: 4+ distinct tactics across 2+ utterances is never a normal conversation.
  const distinct = Object.keys(state.tactics).length;
  const evidenceUtterances = new Set(Object.values(state.tactics).flatMap((e) => e?.evidence ?? [])).size;
  if (evidenceUtterances >= 2) {
    if (distinct >= 4) score = Math.max(score, cfg.levels.danger);
    else if (distinct === 3) score = Math.max(score, cfg.levels.caution + 10);
  }

  score = Math.round(Math.max(0, Math.min(100, score)));
  const contribution = Math.max(0, score - prev.score);
  state.score = score;
  state.level = levelFor(score, cfg);
  state.reasons = buildReasons(state);
  state.updatedAt = utterance.t;
  state.timeline.push({ t: utterance.t, score });
  if (state.timeline.length > 400) state.timeline.splice(0, state.timeline.length - 400);

  return {
    utterance,
    matches,
    tactics: [...creditedTactics],
    contribution,
    suppressed,
    suppressionReason: reason,
    latency,
    risk: state,
  };
}

/**
 * Apply the slow-path coach's opinion. A confident "benign" verdict dampens a CAUTION
 * state (the fast path over-reacted); it never overrides DANGER, because by then the
 * triad has fired and the cost of a miss is the person's savings.
 */
export function applyCoachVerdict(
  prev: RiskState,
  verdict: "scam" | "suspicious" | "benign",
  confidence: number,
  cfg: RiskConfig = DEFAULT_RISK_CONFIG,
): RiskState {
  const state = { ...prev };
  if (verdict === "benign" && confidence >= 0.7 && prev.level === "caution") {
    state.score = Math.round(prev.score * 0.5);
    state.level = levelFor(state.score, cfg);
    state.reasons = ["AI coach reviewed the conversation and thinks it is probably legitimate.", ...prev.reasons];
  } else if (verdict === "scam" && confidence >= 0.8 && prev.level === "caution") {
    state.score = Math.max(prev.score, cfg.levels.danger);
    state.level = levelFor(state.score, cfg);
    state.reasons = ["AI coach reviewed the conversation and confirms it follows a scam script.", ...prev.reasons];
  }
  state.updatedAt = prev.updatedAt;
  return state;
}

/** Short, human summary used in prompts and the guardian feed. */
export function describeRisk(state: RiskState): string {
  const fam = state.dominantFamily ? FAMILY_INFO[state.dominantFamily].label : "unknown script";
  const tactics = Object.values(state.tactics)
    .filter((e): e is TacticEvidence => !!e)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map((e) => `${TACTIC_INFO[e.tactic].label} (${Math.round(e.confidence * 100)}%)`)
    .join(", ");
  return `${state.level.toUpperCase()} ${state.score}/100 — ${fam}; tactics: ${tactics || "none"}`;
}
