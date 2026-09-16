"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { FlaskConical, Play, Timer } from "lucide-react";
import { fmtMs } from "@/lib/utils";

interface EvalResults {
  summary: {
    generatedAt: string;
    scamDetectionRate: number;
    falsePositiveRate: number;
    familyAccuracy: number;
    meanDangerTurn: number;
    latency: { count: number; p50: number; p95: number; p99: number; meanRetrieval: number };
    runtime: { mode: string; runtime: string; docCount: number; model: string };
  };
  results: Array<{ id: string; title: string; expected: string; finalLevel: string; finalScore: number; firstDangerTurn: number | null; expectDangerByTurn: number | null; pass: boolean; dominantFamily: string | null; turns: number }>;
  bench?: { hardware: { cpu: string; vcpus: number; threads: string }; queries: number; embedPlusSearchMs: { p50: number; p95: number; p99: number }; shortFragmentsMs: { p50: number }; longFragmentsMs: { p50: number } } | null;
}

const PROBES = [
  "Sir, this is Inspector Sharma from Mumbai Cyber Crime, your Aadhaar is linked to a money laundering case.",
  "Your SBI account will be blocked in two hours unless you verify with the OTP.",
  "Please install AnyDesk so our engineer can fix the virus on your computer.",
  "Grandma, I've been in an accident, please don't tell mom, I need bail money.",
  "You have won twenty five lakh in the KBC lucky draw, pay the GST to release it.",
  "This is confidential, wire the vendor today and don't loop in anyone.",
  "Hi, this is Blue Dart, your parcel will be delivered between 2 and 6 today.",
  "Your appointment with Dr Mehta is confirmed for Thursday at 4:30.",
  "We will never ask for your OTP, you can hang up and call the number on your card.",
  "Beta, can you send two thousand rupees for the electricity bill, I'll pay you back Sunday.",
];

function pct(arr: number[], p: number) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
}

export function LabApp() {
  const [evalData, setEvalData] = useState<EvalResults | null>(null);
  const [running, setRunning] = useState(false);
  const [samples, setSamples] = useState<Array<{ engine: number; wall: number; rt: number; q: string; top: string; mode: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [rounds, setRounds] = useState(5);

  useEffect(() => {
    fetch("/api/eval").then((r) => (r.ok ? r.json() : null)).then(setEvalData).catch(() => {});
  }, []);

  const run = useCallback(async () => {
    setError(null);
    setRunning(true);
    setSamples([]);
    const out: typeof samples = [];
    try {
    for (let r = 0; r < rounds; r++) {
      for (const q of PROBES) {
        const t0 = performance.now();
        const d = (await fetch(`/api/playbook?q=${encodeURIComponent(q)}&k=5`).then((x) => { if (!x.ok) throw new Error("Benchmark request failed. Please try again."); return x.json(); })) as { engineMs: number; wallMs: number; matches: Array<{ text: string }>; runtime: string };
        out.push({ engine: d.engineMs, wall: d.wallMs, rt: performance.now() - t0, q, top: d.matches[0]?.text ?? "", mode: d.runtime });
        setSamples([...out]);
      }
    }
    } catch (err) { setError((err as Error).message); } finally { setRunning(false); }
  }, [rounds]);

  const stats = useMemo(() => {
    const e = samples.map((s) => s.engine);
    const w = samples.map((s) => s.wall);
    const rt = samples.map((s) => s.rt);
    return { n: samples.length, e50: pct(e, 0.5), e95: pct(e, 0.95), w50: pct(w, 0.5), w95: pct(w, 0.95), w99: pct(w, 0.99), rt50: pct(rt, 0.5), rt95: pct(rt, 0.95) };
  }, [samples]);

  const sentenceMs = 2500;
  const fallback = samples.some((s) => s.mode !== "moss");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="max-w-3xl">
        <h1 className="display text-3xl text-text sm:text-4xl">Latency lab</h1>
        <p className="mt-2 text-muted">
          Measured, not claimed. Fire real queries at the running retrieval layer and see how much of a spoken sentence the shield needs before it can answer. Then read the
          committed evaluation over eighteen full call transcripts.
        </p>
      </div>

      {error && <div role="alert" className="mt-4 text-danger-2">{error}</div>}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="card card-strong p-5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
              <Timer className="h-4 w-4 text-moss" /> Live benchmark
            </div>
            <div className="flex items-center gap-2">
              <select aria-label="Benchmark rounds" className="input w-auto py-1.5 text-sm" value={rounds} onChange={(e) => setRounds(Number(e.target.value))} disabled={running}>
                {[1, 5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {n} × {PROBES.length} queries
                  </option>
                ))}
              </select>
              <button className="btn btn-primary btn-sm" onClick={() => void run()} disabled={running}>
                <Play className="h-4 w-4" /> {running ? "Running…" : "Run"}
              </button>
            </div>
          </div>
          {stats.n > 0 && <p className="mt-3 text-sm text-muted">{fallback ? "Offline text detector active. These timings are not Moss benchmarks." : "Moss semantic runtime active. Timings below come from this server."}</p>}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label="Engine search p50" value={stats.n ? fmtMs(stats.e50) : "-"} accent />
            <Metric label={fallback ? "Text search p50" : "Embed + search p50"} value={stats.n ? fmtMs(stats.w50) : "-"} accent />
            <Metric label={fallback ? "Text search p95" : "Embed + search p95"} value={stats.n ? fmtMs(stats.w95) : "-"} accent />
            <Metric label="Browser round-trip p50" value={stats.n ? fmtMs(stats.rt50) : "-"} />
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>Share of one spoken sentence (~{sentenceMs} ms) consumed before the shield has an answer</span>
              <span className="mono text-text">{stats.n ? `${((stats.w95 / sentenceMs) * 100).toFixed(2)}%` : "-"}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div className="h-full rounded-full bg-moss" animate={{ width: `${Math.max(0.5, Math.min(100, (stats.w95 / sentenceMs) * 100))}%` }} />
            </div>
            <div className="mt-1 text-xs text-faint">Retrieval measured on this server. Illustrative comparison only: a 350 ms network request would consume 14% of this assumed sentence duration. This does not measure speech-to-warning latency.</div>
          </div>
          <div className="scrollbar-thin mt-4 max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-surface text-faint">
                <tr>
                  <th className="py-1 pr-2 font-medium">Query</th>
                  <th className="py-1 pr-2 font-medium">Top match</th>
                  <th className="py-1 pr-2 text-right font-medium">engine</th>
                  <th className="py-1 pr-2 text-right font-medium">in-proc</th>
                  <th className="py-1 text-right font-medium">round-trip</th>
                </tr>
              </thead>
              <tbody>
                {samples.slice(-40).reverse().map((s, i) => (
                  <tr key={i} className="border-t border-line text-muted">
                    <td className="max-w-[16rem] truncate py-1 pr-2 text-text">{s.q}</td>
                    <td className="max-w-[16rem] truncate py-1 pr-2">{s.top}</td>
                    <td className="mono py-1 pr-2 text-right text-moss">{fmtMs(s.engine)}</td>
                    <td className="mono py-1 pr-2 text-right text-moss">{fmtMs(s.wall)}</td>
                    <td className="mono py-1 text-right">{fmtMs(s.rt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {samples[0] && samples[0].mode !== "moss" && <div className="mt-3 text-xs text-caution">These numbers come from the offline lexical fallback, not Moss. Connect your own Moss project in Settings for the real runtime.</div>}
        </div>

        <div className="card p-5 lg:col-span-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
            <FlaskConical className="h-4 w-4 text-saffron" /> Detection evaluation
          </div>
          {!evalData ? (
            <div className="mt-3 text-sm text-faint">No committed evaluation found. Run <span className="mono">npm run eval</span>.</div>
          ) : (
            <>
              <div className="mt-1 text-xs text-faint">
                {new Date(evalData.summary.generatedAt).toLocaleString()} · {evalData.summary.runtime.mode === "moss" ? "Moss runtime" : "offline fallback"} · {evalData.summary.runtime.docCount} docs
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Metric label="Scam calls caught" value={`${Math.round(evalData.summary.scamDetectionRate * 100)}%`} accent />
                <Metric label="False alarms on benign calls" value={`${Math.round(evalData.summary.falsePositiveRate * 100)}%`} />
                <Metric label="Script named correctly" value={`${Math.round(evalData.summary.familyAccuracy * 100)}%`} />
                <Metric label="Mean turn to DANGER" value={evalData.summary.meanDangerTurn.toFixed(1)} />
                <Metric label="Eval p50 / p95" value={`${fmtMs(evalData.summary.latency.p50)} / ${fmtMs(evalData.summary.latency.p95)}`} accent />
                <Metric label="Utterances" value={String(evalData.summary.latency.count)} />
              </div>
              {evalData.bench && (
                <div className="mt-3 rounded-xl border border-line bg-white/[0.03] p-3 text-xs text-muted">
                  <div className="text-[11px] uppercase tracking-wider text-faint">Committed benchmark · npm run eval:bench</div>
                  <div className="mt-1">
                    {evalData.bench.queries} queries on {evalData.bench.hardware.cpu} × {evalData.bench.hardware.vcpus} vCPU: embed + search p50 <span className="mono text-moss">{fmtMs(evalData.bench.embedPlusSearchMs.p50)}</span>, p95{" "}
                    <span className="mono text-moss">{fmtMs(evalData.bench.embedPlusSearchMs.p95)}</span>, p99 <span className="mono text-moss">{fmtMs(evalData.bench.embedPlusSearchMs.p99)}</span>. Short fragments p50{" "}
                    <span className="mono text-text">{fmtMs(evalData.bench.shortFragmentsMs.p50)}</span>, long p50 <span className="mono text-text">{fmtMs(evalData.bench.longFragmentsMs.p50)}</span>.
                  </div>
                </div>
              )}
              <table className="mt-4 w-full text-left text-xs">
                <thead className="text-faint">
                  <tr>
                    <th className="py-1 font-medium">Scenario</th>
                    <th className="py-1 font-medium">Expected</th>
                    <th className="py-1 text-right font-medium">Danger at</th>
                    <th className="py-1 text-right font-medium">Pass</th>
                  </tr>
                </thead>
                <tbody>
                  {evalData.results.map((r) => (
                    <tr key={r.id} className="border-t border-line text-muted">
                      <td className="py-1.5 text-text">{r.title}</td>
                      <td className="py-1.5">{r.expected}</td>
                      <td className="mono py-1.5 text-right">{r.firstDangerTurn ?? "never"}{r.expectDangerByTurn ? ` / ≤${r.expectDangerByTurn}` : ""}</td>
                      <td className="py-1.5 text-right">{r.pass ? "✅" : "❌"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <a href="https://github.com/shi1720/YC-Fall-2026-x-Moss/blob/main/docs/eval/REPORT.md" target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-saffron hover:underline">
                Full turn-by-turn report →
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.03] p-3">
      <div className="text-[11px] uppercase tracking-wider text-faint">{label}</div>
      <div className={`mono mt-1 text-lg ${accent ? "text-moss" : "text-text"}`}>{value}</div>
    </div>
  );
}
