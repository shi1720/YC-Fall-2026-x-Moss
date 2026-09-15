"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mic, MicOff, PhoneOff, Play, Pause, Square, Upload, Volume2, VolumeX, Zap, FileAudio, Flag, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import { CoachCard } from "@/components/shield/CoachCard";
import { GuardianPanel } from "@/components/shield/GuardianPanel";
import { InterventionOverlay } from "@/components/shield/InterventionOverlay";
import { LatencyTicker } from "@/components/shield/LatencyTicker";
import { MatchPanel } from "@/components/shield/MatchPanel";
import { RiskDial } from "@/components/shield/RiskDial";
import { ScenarioPicker, type ScenarioMeta } from "@/components/shield/ScenarioPicker";
import { Sparkline } from "@/components/shield/Sparkline";
import { Transcript, type TranscriptLine } from "@/components/shield/Transcript";
import { FAMILY_INFO } from "@/lib/data/families";
import { createRiskState } from "@/lib/engine/risk";
import type { CoachAdvice, Intervention, RiskState, Speaker, UtteranceAnalysis } from "@/lib/engine/types";
import { useRakshaSocket } from "@/lib/client/socket";
import { useStoredState } from "@/lib/client/storage";
import { speak, speechRecognitionSupported, startRecognition, stopSpeaking, ttsSupported, type RecognitionHandle } from "@/lib/client/speech";
import type { CallMeta, LatencyStats, ServerMessage } from "@/lib/protocol";
import { cn, fmtClock, fmtMs } from "@/lib/utils";

type Mode = "simulation" | "live" | "upload";
type Phase = "idle" | "starting" | "active" | "ended";

interface State {
  hello?: Extract<ServerMessage, { type: "hello" }>;
  phase: Phase;
  call?: CallMeta;
  lines: TranscriptLine[];
  interim?: string;
  risk: RiskState;
  lastAnalysis?: UtteranceAnalysis;
  lastLatency?: number;
  stats?: LatencyStats;
  intervention: Intervention | null;
  interventionCount: number;
  advice?: CoachAdvice;
  guardianMessages: Array<{ text: string; from: string; t: number }>;
  ended?: { summary: string; durationMs: number; latencyStats: LatencyStats; risk: RiskState };
  reported?: { ok: boolean; added: number; message: string };
  error?: string;
}

type Action =
  | { type: "server"; msg: ServerMessage }
  | { type: "phase"; phase: Phase }
  | { type: "line.pending"; line: TranscriptLine }
  | { type: "interim"; text?: string }
  | { type: "intervention.dismiss" }
  | { type: "reset" };

const initial: State = { phase: "idle", lines: [], risk: createRiskState(), intervention: null, interventionCount: 0, guardianMessages: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return { ...initial, hello: state.hello };
    case "phase":
      return { ...state, phase: action.phase };
    case "interim":
      return { ...state, interim: action.text };
    case "line.pending":
      return { ...state, lines: [...state.lines, action.line] };
    case "intervention.dismiss":
      return { ...state, intervention: null };
    case "server": {
      const m = action.msg;
      switch (m.type) {
        case "hello":
          return { ...state, hello: m };
        case "call.started":
          return { ...initial, hello: state.hello, phase: "active", call: m.call };
        case "analysis": {
          const a = m.analysis;
          if (!a.utterance.final) return { ...state, lastAnalysis: a, lastLatency: a.latency.totalMs };
          const line: TranscriptLine = {
            id: a.utterance.id,
            speaker: a.utterance.speaker,
            text: a.utterance.text,
            t: a.utterance.t,
            tactics: a.tactics,
            contribution: a.contribution,
            latencyMs: a.latency.totalMs,
            level: a.risk.level,
            score: a.risk.score,
            suppressed: a.suppressed,
            suppressionReason: a.suppressionReason,
            topMatch: a.matches[0] ? { text: a.matches[0].text, score: a.matches[0].score, family: a.matches[0].family } : undefined,
          };
          // Replace a locally-added pending line with the same text, otherwise append.
          const idx = state.lines.findIndex((l) => l.pending && l.text === a.utterance.text);
          const lines = idx >= 0 ? state.lines.map((l, i) => (i === idx ? line : l)) : [...state.lines, line];
          return { ...state, lines, interim: undefined, lastAnalysis: a, lastLatency: a.latency.totalMs, stats: m.latencyStats, risk: a.risk };
        }
        case "risk":
          return { ...state, risk: m.risk };
        case "intervention":
          return { ...state, intervention: m.intervention, interventionCount: state.interventionCount + 1 };
        case "coach":
          return { ...state, advice: m.advice };
        case "guardian.message":
          return {
            ...state,
            guardianMessages: [...state.guardianMessages, { text: m.text, from: m.from, t: Date.now() }],
            lines: [...state.lines, { id: `g-${Date.now()}`, speaker: "unknown", text: m.text, t: state.call ? Date.now() - state.call.startedAt : 0, tactics: [], contribution: 0, level: state.risk.level, score: state.risk.score, fromGuardian: m.from }],
          };
        case "call.ended":
          return { ...state, phase: "ended", intervention: null, interim: undefined, ended: { summary: m.summary, durationMs: m.durationMs, latencyStats: m.latencyStats, risk: m.risk }, risk: m.risk };
        case "call.reported":
          return { ...state, reported: { ok: m.ok, added: m.added, message: m.message } };
        case "error":
          return { ...state, error: m.message };
        default:
          return state;
      }
    }
  }
}

interface Scenario extends Omit<ScenarioMeta, "turns"> {
  turns: Array<{ speaker: Speaker; text: string }>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function ShieldApp({ initialScenario, initialSilent = false, initialFast = false }: { initialScenario?: string; initialSilent?: boolean; initialFast?: boolean }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [mode, setMode] = useState<Mode>("simulation");
  const [scenarios, setScenarios] = useState<ScenarioMeta[]>([]);
  const [scenarioId, setScenarioId] = useState<string | undefined>(initialScenario);
  const [audio, setAudio] = useState(!initialSilent);
  const [fast, setFast] = useState(initialFast);
  const [paused, setPaused] = useState(false);
  const [storedCode, setStoredCode] = useStoredState("raksha.familyCode", "");
  const familyCode = storedCode || "";
  const setFamilyCode = setStoredCode;
  const [region, setRegion] = useState<CallMeta["region"]>("IN");
  const [micError, setMicError] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [clock, setClock] = useState(0);

  const player = useRef<{ cancelled: boolean; paused: boolean; waiters: Array<() => void> }>({ cancelled: true, paused: false, waiters: [] });
  const recognition = useRef<RecognitionHandle | null>(null);
  const lastInterimSent = useRef(0);

  const onMessage = useCallback((msg: ServerMessage) => {
    dispatch({ type: "server", msg });
    if (msg.type === "intervention" && msg.intervention.level === "danger") {
      player.current.paused = true;
      setPaused(true);
      if (ttsSupported()) void speak(`${msg.intervention.headline} ${msg.intervention.sayThis}`, "shield", { interrupt: true });
    }
    if (msg.type === "guardian.message" && ttsSupported()) void speak(`Message from ${msg.from}: ${msg.text}`, "shield", { interrupt: true });
  }, []);
  const { status, send } = useRakshaSocket(onMessage);

  // Family code persisted per device; generate one the first time.
  useEffect(() => {
    if (!storedCode) setStoredCode(randomCode());
  }, [storedCode, setStoredCode]);

  useEffect(() => {
    fetch("/api/scenarios")
      .then((r) => r.json())
      .then((list: ScenarioMeta[]) => {
        setScenarios(list);
        setScenarioId((cur) => cur ?? list[0]?.id);
      })
      .catch(() => {});
  }, []);

  // Call clock.
  useEffect(() => {
    if (state.phase !== "active" || !state.call) return;
    const startedAt = state.call.startedAt;
    const id = setInterval(() => setClock(Date.now() - startedAt), 500);
    return () => clearInterval(id);
  }, [state.phase, state.call]);

  const resumePlayer = useCallback(() => {
    player.current.paused = false;
    setPaused(false);
    for (const w of player.current.waiters.splice(0)) w();
  }, []);

  const waitWhilePaused = () =>
    new Promise<void>((resolve) => {
      if (!player.current.paused) return resolve();
      player.current.waiters.push(resolve);
    });

  const stopEverything = useCallback(() => {
    player.current.cancelled = true;
    recognition.current?.stop();
    recognition.current = null;
    stopSpeaking();
    resumePlayer();
  }, [resumePlayer]);

  const endCall = useCallback(() => {
    stopEverything();
    dispatch({ type: "intervention.dismiss" });
    send({ type: "call.end" });
  }, [send, stopEverything]);

  useEffect(() => () => stopEverything(), [stopEverything]);

  const startCall = useCallback(
    (m: Mode, scenario?: string) => {
      dispatch({ type: "reset" });
      dispatch({ type: "phase", phase: "starting" });
      send({ type: "call.start", mode: m, scenarioId: scenario, familyCode, region, displayName: "Protected phone" });
    },
    [send, familyCode, region],
  );

  // ---------- Simulation player ----------
  const playTurns = useCallback(
    async (turns: Array<{ speaker: Speaker; text: string }>, opts: { tts: boolean; gapMs: number }) => {
      player.current = { cancelled: false, paused: false, waiters: [] };
      const p = player.current;
      let t = 0;
      for (const turn of turns) {
        if (p.cancelled) return;
        await waitWhilePaused();
        if (p.cancelled) return;
        const words = turn.text.split(/\s+/);
        const estMs = opts.tts ? Math.max(1200, (words.length / 2.7) * 1000) : fast ? 700 : Math.min(2600, 500 + words.length * 60);
        dispatch({ type: "line.pending", line: { id: `p-${t}-${Math.random()}`, speaker: turn.speaker, text: turn.text, t, tactics: [], contribution: 0, level: "safe", score: 0, pending: true } });
        const started = Date.now();
        const speaking = opts.tts ? speak(turn.text, turn.speaker === "user" ? "user" : "caller") : sleep(estMs);
        // Interim fragments: the shield reacts mid-sentence, not after it.
        const cuts = [0.45, 0.75];
        for (const c of cuts) {
          const n = Math.floor(words.length * c);
          if (n >= 4) {
            const delay = Math.max(0, estMs * c - (Date.now() - started));
            await Promise.race([sleep(delay), speaking]);
            if (p.cancelled) return;
            send({ type: "utterance", text: words.slice(0, n).join(" "), speaker: turn.speaker, final: false, t });
          }
        }
        await speaking;
        if (p.cancelled) return;
        send({ type: "utterance", text: turn.text, speaker: turn.speaker, final: true, t });
        t += Math.round(Date.now() - started) + opts.gapMs;
        await sleep(opts.gapMs);
      }
      await sleep(1500);
      if (!p.cancelled) endCall();
    },
    [endCall, fast, send],
  );

  const runSimulation = useCallback(async () => {
    if (!scenarioId) return;
    const sc = (await fetch(`/api/scenarios?id=${scenarioId}`).then((r) => r.json())) as Scenario;
    startCall("simulation", scenarioId);
    await sleep(400);
    void playTurns(sc.turns, { tts: audio && ttsSupported(), gapMs: fast ? 250 : 650 });
  }, [audio, fast, playTurns, scenarioId, startCall]);

  // ---------- Live microphone ----------
  const runLive = useCallback(() => {
    setMicError(null);
    if (!speechRecognitionSupported()) {
      setMicError("Live transcription needs the Web Speech API (Chrome, Edge or Safari). Use Simulation or Upload instead.");
      return;
    }
    startCall("live");
    const startedAt = Date.now();
    recognition.current = startRecognition({
      lang: region === "IN" ? "en-IN" : region === "UK" ? "en-GB" : region === "AU" ? "en-AU" : "en-US",
      onInterim: (text) => {
        dispatch({ type: "interim", text });
        const now = Date.now();
        if (now - lastInterimSent.current > 400 && text.split(/\s+/).length >= 4) {
          lastInterimSent.current = now;
          send({ type: "utterance", text, speaker: "unknown", final: false, t: now - startedAt });
        }
      },
      onFinal: (text) => {
        dispatch({ type: "interim", text: undefined });
        send({ type: "utterance", text, speaker: "unknown", final: true, t: Date.now() - startedAt });
      },
      onError: (err) => setMicError(err === "not-allowed" ? "Microphone permission was denied." : `Microphone error: ${err}`),
    });
  }, [region, send, startCall]);

  // ---------- Upload a recording ----------
  const runUpload = useCallback(
    async (file: File) => {
      setUploadBusy(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/transcribe", { method: "POST", body: fd });
        const data = (await res.json()) as { text?: string; segments?: Array<{ text: string }>; error?: string };
        if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);
        const turns = (data.segments?.length ? data.segments.map((s) => s.text.trim()) : (data.text ?? "").split(/(?<=[.?!])\s+/)).filter((t) => t.length > 2).map((text) => ({ speaker: "unknown" as Speaker, text }));
        startCall("upload");
        await sleep(400);
        void playTurns(turns, { tts: false, gapMs: 200 });
      } catch (err) {
        setMicError((err as Error).message);
      } finally {
        setUploadBusy(false);
      }
    },
    [playTurns, startCall],
  );

  const active = state.phase === "active" || state.phase === "starting";
  const runtimeMode = state.hello?.runtime.mode;
  const fam = state.risk.dominantFamily ? FAMILY_INFO[state.risk.dominantFamily] : null;
  const dangerLines = useMemo(() => state.lines.filter((l) => l.contribution > 0).length, [state.lines]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <InterventionOverlay
        intervention={state.intervention}
        onHangUp={endCall}
        onDismiss={() => {
          dispatch({ type: "intervention.dismiss" });
          stopSpeaking();
          resumePlayer();
        }}
        onSpeak={() => state.intervention && void speak(`${state.intervention.headline} ${state.intervention.body} Say: ${state.intervention.sayThis}`, "shield", { interrupt: true })}
      />

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
            <span className={cn("inline-block h-2 w-2 rounded-full", status === "open" ? "bg-safe" : status === "connecting" ? "bg-caution" : "bg-danger")} />
            {status === "open" ? "connected" : status}
            {active && state.call && (
              <span className="mono ml-2 text-text">
                {fmtClock(clock)} · {state.call.mode}
              </span>
            )}
          </div>
          <h1 className="display mt-1 text-3xl text-text sm:text-4xl">The shield</h1>
        </div>
        <LatencyTicker last={state.lastLatency} stats={state.stats} mode={runtimeMode} />
      </div>

      {state.hello?.runtime.mode === "mock" && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-caution/30 bg-caution/10 p-3 text-sm text-caution">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Running on the offline fallback retriever. Set Moss credentials on the server to enable the real sub-10 ms semantic runtime.</span>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left: controls */}
        <div className="space-y-5 lg:col-span-3">
          <div className="card p-4">
            <div className="flex rounded-full border border-line bg-white/[0.03] p-1 text-sm">
              {(
                [
                  ["simulation", "Simulate", Play],
                  ["live", "Live mic", Mic],
                  ["upload", "Recording", Upload],
                ] as const
              ).map(([m, label, Icon]) => (
                <button
                  key={m}
                  disabled={active}
                  onClick={() => setMode(m)}
                  className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 transition disabled:opacity-50", mode === m ? "bg-white/10 text-text" : "text-muted hover:text-text")}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>

            {mode === "simulation" && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted">Replay a realistic scam call (both voices) and watch the shield recognise the script as it unfolds.</p>
                <ScenarioPicker scenarios={scenarios} selected={scenarioId} onSelect={setScenarioId} disabled={active} />
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <button className={cn("chip", audio && "chip-saffron")} onClick={() => setAudio((a) => !a)} disabled={active}>
                    {audio ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />} {audio ? "voices on" : "silent"}
                  </button>
                  <button className={cn("chip", fast && "chip-moss")} onClick={() => setFast((f) => !f)} disabled={active}>
                    <Zap className="h-3 w-3" /> {fast ? "fast" : "real-time"}
                  </button>
                </div>
                {!active ? (
                  <button className="btn btn-primary w-full" onClick={() => void runSimulation()} disabled={!scenarioId || status !== "open"}>
                    <Play className="h-4 w-4" /> Start the call
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button className="btn btn-ghost flex-1" onClick={() => (paused ? resumePlayer() : ((player.current.paused = true), setPaused(true), stopSpeaking()))}>
                      {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />} {paused ? "Resume" : "Pause"}
                    </button>
                    <button className="btn btn-danger flex-1" onClick={endCall}>
                      <Square className="h-4 w-4" /> End
                    </button>
                  </div>
                )}
              </div>
            )}

            {mode === "live" && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted">Put the phone on speaker next to this device. Your browser turns speech into text; only text reaches the shield, and it is forgotten when the call ends. Nothing is stored.</p>
                <label className="block text-xs text-muted">
                  Region
                  <select className="input mt-1" value={region} onChange={(e) => setRegion(e.target.value as CallMeta["region"])} disabled={active}>
                    <option value="IN">India (en-IN)</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </label>
                {micError && <div className="rounded-xl border border-danger/40 bg-danger/10 p-2 text-xs text-danger-2">{micError}</div>}
                {!active ? (
                  <button className="btn btn-primary w-full" onClick={runLive} disabled={status !== "open"}>
                    <Mic className="h-4 w-4" /> Start listening
                  </button>
                ) : (
                  <button className="btn btn-danger w-full" onClick={endCall}>
                    <MicOff className="h-4 w-4" /> Stop
                  </button>
                )}
              </div>
            )}

            {mode === "upload" && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted">Upload a call recording (mp3, m4a, wav, webm). It is transcribed by Whisper (hosted on Groq) and replayed through the shield. The audio is not stored by Raksha.</p>
                {micError && <div className="rounded-xl border border-danger/40 bg-danger/10 p-2 text-xs text-danger-2">{micError}</div>}
                <label className={cn("btn btn-primary w-full cursor-pointer", (active || uploadBusy) && "pointer-events-none opacity-50")}>
                  <FileAudio className="h-4 w-4" /> {uploadBusy ? "Transcribing…" : "Choose a recording"}
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && void runUpload(e.target.files[0])} />
                </label>
                {active && (
                  <button className="btn btn-danger w-full" onClick={endCall}>
                    <Square className="h-4 w-4" /> End
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="card p-4">
            <GuardianPanel familyCode={familyCode} onChangeCode={setFamilyCode} messages={state.guardianMessages} disabled={active} />
          </div>
        </div>

        {/* Centre: dial + transcript */}
        <div className="space-y-5 lg:col-span-6">
          <div className="card card-strong p-5">
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[auto_1fr]">
              <RiskDial risk={state.risk} />
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">Risk over time</div>
                  <Sparkline points={state.risk.timeline} className="mt-1" />
                </div>
                {fam ? (
                  <div className="rounded-2xl border border-line bg-white/[0.03] p-3 text-sm">
                    <div className="font-semibold text-text">{fam.label}</div>
                    <div className="mt-0.5 text-muted">{fam.short}</div>
                    <div className="mt-2 text-xs text-faint">Script arc: {fam.arc}</div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-line bg-white/[0.03] p-3 text-sm text-muted">
                    {active ? "Listening. The dial moves the moment a known tactic is heard." : "Start a call to see the shield at work."}
                  </div>
                )}
                {state.risk.reasons.length > 0 && (
                  <ul className="space-y-1 text-sm text-muted">
                    {state.risk.reasons.slice(0, 3).map((r) => (
                      <li key={r} className="flex gap-2">
                        <span className="text-caution">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
                <Activity className="h-3.5 w-3.5 text-teal" /> Live transcript
              </div>
              <div className="text-xs text-faint">
                {state.lines.length} lines · {dangerLines} flagged · {state.interventionCount} interventions
              </div>
            </div>
            <Transcript lines={state.lines} interim={state.interim} className="h-[28rem]" />
          </div>

          <AnimatePresence>
            {state.phase === "ended" && state.ended && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card card-strong p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
                  <CheckCircle2 className="h-4 w-4 text-safe" /> Call ended · {fmtClock(state.ended.durationMs)}
                </div>
                <p className="mt-2 text-[15px] text-text">{state.ended.summary}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted sm:grid-cols-4">
                  <Stat label="Final risk" value={`${state.ended.risk.score}/100`} />
                  <Stat label="Utterances" value={String(state.ended.latencyStats.count)} />
                  <Stat label="p50 latency" value={fmtMs(state.ended.latencyStats.p50)} />
                  <Stat label="p95 latency" value={fmtMs(state.ended.latencyStats.p95)} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {state.ended.risk.level !== "safe" && !state.reported && (
                    <button className="btn btn-ghost" onClick={() => send({ type: "call.report", consent: true })}>
                      <Flag className="h-4 w-4 text-saffron" /> Report this script to protect others
                    </button>
                  )}
                  {state.reported && <span className={cn("text-sm", state.reported.ok ? "text-moss" : "text-danger-2")}>{state.reported.message}</span>}
                  <button className="btn btn-primary ml-auto" onClick={() => dispatch({ type: "reset" })}>
                    New call
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: evidence + coach */}
        <div className="space-y-5 lg:col-span-3">
          <div className="card p-4">
            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">Coach</div>
            <CoachCard advice={state.advice} llmModel={state.hello?.llm.model} />
          </div>
          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted">
              <span>Playbook matches</span>
              <span className="mono normal-case tracking-normal text-faint">{state.hello?.runtime.docCount ?? "…"} docs</span>
            </div>
            <MatchPanel analysis={state.lastAnalysis} />
          </div>
          {active && state.phase === "active" && (
            <button className="btn btn-danger w-full" onClick={endCall}>
              <PhoneOff className="h-4 w-4" /> Hang up
            </button>
          )}
        </div>
      </div>
      {state.error && <div className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger-2">{state.error}</div>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.03] p-2.5">
      <div className="text-[11px] uppercase tracking-wider text-faint">{label}</div>
      <div className="mono mt-0.5 text-base text-text">{value}</div>
    </div>
  );
}
