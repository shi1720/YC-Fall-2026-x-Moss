"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquare, PhoneCall, Search, Send, ShieldAlert, Users } from "lucide-react";
import { RiskDial } from "@/components/shield/RiskDial";
import { Sparkline } from "@/components/shield/Sparkline";
import { TacticChip } from "@/components/shield/TacticChip";
import { FAMILY_INFO } from "@/lib/data/families";
import { createRiskState } from "@/lib/engine/risk";
import type { CoachAdvice, Intervention, RiskState, UtteranceAnalysis } from "@/lib/engine/types";
import { useRakshaSocket } from "@/lib/client/socket";
import { useStoredState } from "@/lib/client/storage";
import type { CallMeta, ServerMessage } from "@/lib/protocol";
import { cn, fmtClock, fmtMs, LEVEL_CHIP, LEVEL_LABEL } from "@/lib/utils";

interface CallView {
  meta: CallMeta;
  risk: RiskState;
  lines: UtteranceAnalysis[];
  interventions: Intervention[];
  advice?: CoachAdvice;
  ended?: { summary: string; durationMs: number };
}

interface State {
  joined?: string;
  calls: Record<string, CallView>;
  messages: Array<{ from: string; text: string; t: number }>;
  answers: Array<{ question: string; hits: Array<{ text: string; speaker: string; score: number; t: number }>; latencyMs: number; answer?: string }>;
  error?: string;
}

function reducer(state: State, msg: ServerMessage): State {
  const upsert = (callId: string, fn: (c: CallView) => CallView, meta?: CallMeta): State => {
    const existing = state.calls[callId] ?? (meta ? { meta, risk: createRiskState(), lines: [], interventions: [] } : undefined);
    if (!existing) return state;
    return { ...state, calls: { ...state.calls, [callId]: fn(existing) } };
  };
  switch (msg.type) {
    case "guardian.joined": {
      const calls = { ...state.calls };
      for (const m of msg.activeCalls) if (!calls[m.callId]) calls[m.callId] = { meta: m, risk: createRiskState(), lines: [], interventions: [] };
      return { ...state, joined: msg.familyCode, calls, error: undefined };
    }
    case "analysis":
      return upsert(msg.callId, (c) => (msg.analysis.utterance.final ? { ...c, risk: msg.analysis.risk, lines: [...c.lines.filter((l) => l.utterance.id !== msg.analysis.utterance.id), msg.analysis].slice(-200) } : c));
    case "risk":
      return upsert(msg.callId, (c) => ({ ...c, risk: msg.risk }));
    case "intervention":
      return upsert(msg.callId, (c) => ({ ...c, interventions: [...c.interventions, msg.intervention] }));
    case "coach":
      return upsert(msg.callId, (c) => ({ ...c, advice: msg.advice }));
    case "call.ended":
      return upsert(msg.callId, (c) => ({ ...c, risk: msg.risk, ended: { summary: msg.summary, durationMs: msg.durationMs } }));
    case "guardian.message":
      return { ...state, messages: [...state.messages, { from: msg.from, text: msg.text, t: Date.now() }] };
    case "guardian.answer":
      return { ...state, answers: [{ question: msg.question, hits: msg.hits, latencyMs: msg.latencyMs, answer: msg.answer }, ...state.answers].slice(0, 5) };
    case "error":
      return { ...state, error: msg.message };
    default:
      return state;
  }
}

export function GuardianApp({ initialCode }: { initialCode?: string }) {
  const [state, dispatch] = useReducer(reducer, { calls: {}, messages: [], answers: [] });
  const [storedCode, setStoredCode] = useStoredState("raksha.familyCode", "");
  const [name, setName] = useStoredState("raksha.guardianName", "");
  const [codeOverride, setCodeOverride] = useState<string | null>(initialCode ?? null);
  const code = codeOverride ?? storedCode;
  const setCode = (v: string) => {
    setCodeOverride(v);
    setStoredCode(v);
  };
  const [say, setSay] = useState("");
  const [question, setQuestion] = useState("");
  const onMessage = useCallback((m: ServerMessage) => dispatch(m), []);
  const { status, send } = useRakshaSocket(onMessage);

  const join = useCallback(() => {
    if (code.length < 3) return;
    send({ type: "guardian.join", familyCode: code, name: name || "Guardian" });
  }, [code, name, send]);

  useEffect(() => {
    if (status === "open" && initialCode && !state.joined) join();
  }, [status, initialCode, state.joined, join]);

  const calls = useMemo(() => Object.values(state.calls).sort((a, b) => b.meta.startedAt - a.meta.startedAt), [state.calls]);
  const live = calls.find((c) => !c.ended);
  const focus = live ?? calls[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
            <span className={cn("inline-block h-2 w-2 rounded-full", status === "open" ? "bg-safe" : "bg-caution")} />
            {state.joined ? `watching ${state.joined}` : "not joined"}
          </div>
          <h1 className="display mt-1 text-3xl text-text sm:text-4xl">Guardian</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">Live view of a protected phone. You see risk as it changes, can speak through the shield, and can ask the call’s memory a question.</p>
        </div>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            join();
          }}
        >
          <label className="text-xs text-muted">
            Your name
            <input className="input mt-1 w-36" value={name} onChange={(e) => setName(e.target.value)} placeholder="Anita" />
          </label>
          <label className="text-xs text-muted">
            Family code
            <input className="input mono mt-1 w-40 uppercase tracking-[0.25em]" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))} placeholder="ABC123" />
          </label>
          <button className="btn btn-primary" type="submit" disabled={code.length < 3 || status !== "open"}>
            <Users className="h-4 w-4" /> {state.joined === code ? "Joined" : "Join"}
          </button>
        </form>
      </div>
      {state.error && <div className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger-2">{state.error}</div>}

      {!focus ? (
        <div className="card mt-8 p-10 text-center text-muted">
          <PhoneCall className="mx-auto h-8 w-8 text-faint" />
          <div className="mt-3 text-text">{state.joined ? "No call in progress." : "Join a family code to start watching."}</div>
          <div className="mt-1 text-sm">Start a call on the Shield page with the same code (open it in another tab) and it will appear here instantly.</div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-4">
            <div className={cn("card card-strong p-5", focus.risk.level === "danger" && "border-danger/50")}>
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="uppercase tracking-[0.2em]">{focus.meta.displayName ?? "Protected phone"}</span>
                <span className={cn("chip", LEVEL_CHIP[focus.risk.level])}>{LEVEL_LABEL[focus.risk.level]}</span>
              </div>
              <div className="mt-4 flex justify-center">
                <RiskDial risk={focus.risk} size={190} />
              </div>
              <Sparkline points={focus.risk.timeline} className="mt-2" />
              {focus.ended && (
                <div className="mt-3 rounded-xl border border-line bg-white/[0.03] p-3 text-sm text-muted">
                  <div className="text-xs uppercase tracking-wider text-faint">Call ended · {fmtClock(focus.ended.durationMs)}</div>
                  <div className="mt-1 text-text">{focus.ended.summary}</div>
                </div>
              )}
            </div>

            <div className="card p-4">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
                <MessageSquare className="h-3.5 w-3.5 text-saffron" /> Speak through the shield
              </div>
              <p className="mb-3 text-sm text-muted">Your message is shown and read aloud on their phone, over the caller.</p>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!say.trim()) return;
                  send({ type: "guardian.say", text: say.trim() });
                  setSay("");
                }}
              >
                <input className="input" value={say} onChange={(e) => setSay(e.target.value)} placeholder="Mummy, hang up. I’m calling you now." />
                <button className="btn btn-primary btn-sm" type="submit" disabled={!state.joined || !say.trim()}>
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Hang up now, I’m calling you.", "Don’t share any OTP.", "Put the phone down and come outside."].map((q) => (
                  <button key={q} className="chip hover:border-saffron/50" onClick={() => setSay(q)}>
                    {q}
                  </button>
                ))}
              </div>
              {state.messages.length > 0 && (
                <div className="mt-3 space-y-1 text-sm">
                  {state.messages.slice(-3).map((m, i) => (
                    <div key={i} className="text-saffron-2">
                      <span className="font-semibold">{m.from}:</span> {m.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-4">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
                <Search className="h-3.5 w-3.5 text-moss" /> Ask the call
              </div>
              <p className="mb-3 text-sm text-muted">Semantic recall over this call’s own turns, from its Moss session.</p>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!question.trim()) return;
                  send({ type: "guardian.ask", question: question.trim() });
                  setQuestion("");
                }}
              >
                <input className="input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What did they ask for?" />
                <button className="btn btn-ghost btn-sm" type="submit" disabled={!state.joined || !question.trim()}>
                  Ask
                </button>
              </form>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["What money did they ask for?", "Who did they claim to be?", "Did they ask for an OTP?"].map((q) => (
                  <button key={q} className="chip hover:border-moss/50" onClick={() => setQuestion(q)}>
                    {q}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {state.answers.slice(0, 2).map((a) => (
                  <motion.div key={a.question + a.latencyMs} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-xl border border-line bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>“{a.question}”</span>
                      <span className="mono text-moss">{fmtMs(a.latencyMs)}</span>
                    </div>
                    {a.hits.length === 0 && <div className="mt-1 text-sm text-faint">{a.answer ?? "Nothing relevant yet."}</div>}
                    {a.hits.map((h, i) => (
                      <div key={i} className="mt-1.5 text-sm text-text">
                        <span className="mono mr-1 text-[10px] text-faint">{fmtClock(h.t)}</span>
                        <span className="text-faint">{h.speaker === "user" ? "Them: " : "Caller: "}</span>
                        {h.text}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-5 lg:col-span-8">
            {focus.interventions.length > 0 && (
              <div className="card border-danger/40 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-danger-2">
                  <ShieldAlert className="h-4 w-4" /> Interventions on their phone
                </div>
                <div className="space-y-2">
                  {focus.interventions.slice(-3).map((iv, i) => (
                    <div key={i} className="rounded-xl border border-line bg-white/[0.03] p-3">
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span className={cn("chip", LEVEL_CHIP[iv.level])}>{LEVEL_LABEL[iv.level]}</span>
                        <span className="mono">{fmtClock(iv.t)}</span>
                        {iv.family && <span className="chip">{FAMILY_INFO[iv.family].label}</span>}
                      </div>
                      <div className="mt-1 font-semibold text-text">{iv.headline}</div>
                      <div className="text-sm text-muted">{iv.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {focus.advice && (
              <div className="card p-4">
                <div className="mb-1 text-xs uppercase tracking-[0.2em] text-muted">Coach</div>
                <div className="text-[15px] text-text">{focus.advice.explanation}</div>
                <div className="mt-1 text-sm text-saffron-2">Told them to say: “{focus.advice.sayThis}”</div>
              </div>
            )}
            <div className="card p-4">
              <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">Transcript highlights</div>
              <div className="scrollbar-thin max-h-[36rem] space-y-2 overflow-y-auto pr-1">
                {focus.lines.length === 0 && <div className="text-sm text-faint">Waiting for the first words…</div>}
                {focus.lines.map((a) => (
                  <div key={a.utterance.id} className={cn("rounded-xl border px-3 py-2", a.contribution > 0 ? (a.risk.level === "danger" ? "border-danger/40 bg-danger/10" : "border-caution/30 bg-caution/5") : "border-line bg-white/[0.02]")}>
                    <div className="flex items-center gap-2 text-[11px] text-faint">
                      <span className="uppercase tracking-wider">{a.utterance.speaker === "user" ? "Them" : "Caller"}</span>
                      <span className="mono">{fmtClock(a.utterance.t)}</span>
                      <span className="mono ml-auto text-moss">{fmtMs(a.latency.totalMs)}</span>
                    </div>
                    <div className="mt-0.5 text-[15px] text-text">{a.utterance.text}</div>
                    {a.tactics.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {a.tactics.map((t) => (
                          <TacticChip key={t} tactic={t} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
