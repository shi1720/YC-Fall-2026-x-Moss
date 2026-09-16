"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { TacticChip } from "@/components/shield/TacticChip";
import type { FamilyInfo } from "@/lib/data/families";
import type { Family, Match } from "@/lib/engine/types";
import { cn, fmtMs } from "@/lib/utils";

interface Catalog {
  docCount: number;
  families: Array<FamilyInfo & { count: number }>;
  runtime: { mode: string };
}

export function PlaybookApp() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [q, setQ] = useState("");
  const [result, setResult] = useState<{ q: string; matches: Match[]; engineMs: number; wallMs: number; roundTripMs: number; runtime: string } | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const seq = useRef(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/playbook").then((r) => r.json()).then(setCatalog).catch(() => {});
  }, []);

  const setQuery = (v: string) => {
    setQ(v);
    setError(null);
    if (!v.trim()) setResult(null);
  };

  useEffect(() => {
    const id = ++seq.current;
    if (!q.trim()) return;
    let cancelled = false;
    const t0 = performance.now();
    const timer = setTimeout(() => {
      fetch(`/api/playbook?q=${encodeURIComponent(q)}&k=8`)
        .then((r) => { if (!r.ok) throw new Error("Search is unavailable. Please try again."); return r.json(); })
        .then((d) => {
          if (!cancelled && id === seq.current) setResult({ ...d, roundTripMs: performance.now() - t0 });
        })
        .catch((err) => { if (!cancelled && id === seq.current) setError((err as Error).message); });
    }, 60);
    return () => { clearTimeout(timer); cancelled = true; };
  }, [q]);

  const famInfo = useMemo(() => catalog?.families.find((f) => f.id === family) ?? null, [catalog, family]);
  const regions = ["IN", "GLOBAL", "US", "UK", "AU"] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="max-w-3xl">
        <h1 className="display text-3xl text-text sm:text-4xl">The playbook</h1>
        <p className="mt-2 text-muted">
          {catalog ? `${catalog.docCount} lines` : "Hundreds of lines"} distilled from FTC, FBI, I4C, RBI and Action Fraud advisories, news reconstructions and scam-baiter transcripts, tagged with the
          persuasion tactic each one carries. This is what the shield compares every spoken fragment against. Type anything a scammer might say and watch it match.
        </p>
      </div>

      <div className="card card-strong mt-6 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" />
          <input aria-label="Search the scam playbook" maxLength={2000} className="input py-3.5 pl-12 pr-12 text-lg" value={q} onChange={(e) => setQuery(e.target.value)} placeholder="Try: your parcel has drugs, share the OTP to cancel, install AnyDesk…" autoFocus />
          {q && (
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-faint hover:text-text" onClick={() => setQuery("")} aria-label="Clear">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Sir your Aadhaar was used for money laundering", "You are under digital arrest, keep the camera on", "Read me the six digit code quickly", "We will never ask for your OTP on this call", "Grandma it's me, I've been in an accident, don't tell mom", "Wire the vendor today, this is confidential"].map((s) => (
            <button key={s} className="chip hover:border-saffron/50" onClick={() => setQuery(s)}>
              {s}
            </button>
          ))}
        </div>
        {(result?.runtime ?? catalog?.runtime.mode) === "mock" && <p className="mt-3 text-sm text-caution">Offline text detector active. Matches and timings below are not from Moss.</p>}
        {error && <p role="alert" className="mt-3 text-danger-2">{error}</p>}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div key={result.q} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
              <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span>
                  engine search <span className="mono text-moss">{fmtMs(result.engineMs)}</span>
                </span>
                <span>
                  {result.runtime === "moss" ? "embed + search in process" : "text search in process"} <span className="mono text-moss">{fmtMs(result.wallMs)}</span>
                </span>
                <span>
                  browser round-trip <span className="mono text-text">{fmtMs(result.roundTripMs)}</span>
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {result.matches.map((m) => {
                  const pct = Math.round(m.confidence * 100);
                  const benign = m.kind === "benign";
                  return (
                    <div key={m.docId} className={cn("rounded-xl border p-3", benign ? "border-safe/30 bg-safe/5" : "border-line bg-white/[0.02]")}>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className={benign ? "chip chip-safe" : "chip chip-saffron"}>{benign ? "Legitimate look-alike" : catalog?.families.find((f) => f.id === m.family)?.label ?? m.family}</span>
                        <span className="mono ml-auto text-muted">cos {m.score.toFixed(3)}</span>
                        <span className="mono text-text">{pct}%</span>
                      </div>
                      <div className="mt-1 text-sm text-text">“{m.text}”</div>
                      {m.tactics.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {m.tactics.map((t) => (
                            <TacticChip key={t} tactic={t} />
                          ))}
                          <span className="chip">sev {m.severity}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-10">
        <div className="text-xs uppercase tracking-[0.25em] text-muted">Scam families</div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) =>
            (catalog?.families ?? [])
              .filter((f) => f.region === region && f.id !== "benign")
              .map((f) => (
                <button key={f.id} onClick={() => setFamily(f.id)} className="card p-4 text-left transition hover:border-line-strong hover:bg-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text">{f.label}</span>
                    <span className="chip ml-auto">{f.region}</span>
                    <span className="mono text-xs text-faint">{f.count}</span>
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm text-muted">{f.short}</div>
                </button>
              )),
          )}
        </div>
      </div>

      <AnimatePresence>
        {famInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" onClick={() => setFamily(null)}>
            <motion.div initial={{ y: 30 }} animate={{ y: 0 }} exit={{ y: 30 }} className="card card-strong w-full max-w-2xl bg-surface p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="chip">{famInfo.region}</div>
                  <h2 className="display mt-2 text-3xl text-text">{famInfo.label}</h2>
                </div>
                <button className="text-faint hover:text-text" onClick={() => setFamily(null)} aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 leading-relaxed text-muted">{famInfo.description}</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-white/[0.03] p-3">
                  <div className="text-[11px] uppercase tracking-wider text-faint">Script arc</div>
                  <div className="mt-1 text-sm text-text">{famInfo.arc}</div>
                </div>
                <div className="rounded-xl border border-saffron/30 bg-saffron/10 p-3">
                  <div className="text-[11px] uppercase tracking-wider text-saffron">What the shield tells you</div>
                  <div className="mt-1 text-sm text-saffron-2">{famInfo.advice}</div>
                  <div className="mt-1 text-xs text-muted">Helpline: {famInfo.helpline}</div>
                </div>
              </div>
              <button className="btn btn-ghost mt-4" onClick={() => { setQuery(famInfo.short); setFamily(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                Search lines like this
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
