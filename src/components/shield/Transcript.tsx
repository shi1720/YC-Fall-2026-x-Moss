"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PhoneIncoming, User, Mic } from "lucide-react";
import { TacticChip } from "@/components/shield/TacticChip";
import type { RiskLevel, Speaker, Tactic } from "@/lib/engine/types";
import { cn, fmtClock, fmtMs } from "@/lib/utils";

export interface TranscriptLine {
  id: string;
  speaker: Speaker;
  text: string;
  t: number;
  tactics: Tactic[];
  contribution: number;
  latencyMs?: number;
  level: RiskLevel;
  score: number;
  suppressed?: boolean;
  suppressionReason?: string;
  topMatch?: { text: string; score: number; family: string };
  /** Pending = sent to the engine, analysis not back yet. */
  pending?: boolean;
  fromGuardian?: string;
}

function SpeakerIcon({ speaker, fromGuardian }: { speaker: Speaker; fromGuardian?: string }) {
  if (fromGuardian) return <div className="flex h-7 w-7 items-center justify-center rounded-full bg-saffron/20 text-saffron text-[10px] font-bold">{fromGuardian.slice(0, 1).toUpperCase()}</div>;
  if (speaker === "user") return <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal/15 text-teal"><User className="h-3.5 w-3.5" /></div>;
  if (speaker === "caller") return <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-muted"><PhoneIncoming className="h-3.5 w-3.5" /></div>;
  return <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-muted"><Mic className="h-3.5 w-3.5" /></div>;
}

export function Transcript({ lines, interim, className }: { lines: TranscriptLine[]; interim?: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el || (lines.length === 0 && !interim)) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [lines.length, interim]);
  return (
    <div ref={box} className={cn("scrollbar-thin flex flex-col gap-2 overflow-y-auto pr-1", className)}>
      {lines.length === 0 && !interim && (
        <div className="flex h-full min-h-40 items-center justify-center text-center text-sm text-faint">
          The transcript appears here. Each line is checked against the scam playbook the moment it is spoken.
        </div>
      )}
      <AnimatePresence initial={false}>
        {lines.map((l) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl border px-3 py-2.5",
              l.fromGuardian ? "border-saffron/40 bg-saffron/10" : l.contribution > 0 && l.level === "danger" ? "border-danger/40 bg-danger/10" : l.contribution > 0 ? "border-caution/30 bg-caution/5" : "border-line bg-white/[0.02]",
            )}
          >
            <div className="flex items-start gap-2.5">
              <SpeakerIcon speaker={l.speaker} fromGuardian={l.fromGuardian} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[11px] text-faint">
                  <span className="uppercase tracking-wider">{l.fromGuardian ? `${l.fromGuardian} (guardian)` : l.speaker === "user" ? "You" : l.speaker === "caller" ? "Caller" : "Mic"}</span>
                  <span className="mono">{fmtClock(l.t)}</span>
                  {l.latencyMs !== undefined && (
                    <span className="mono ml-auto rounded-md bg-moss/10 px-1.5 py-0.5 text-moss" title="Time from speech to verdict (retrieval + scoring)">
                      {fmtMs(l.latencyMs)}
                    </span>
                  )}
                  {l.pending && <span className="ml-auto shimmer h-3 w-10 rounded" />}
                </div>
                <div className={cn("mt-0.5 text-[15px] leading-snug", l.fromGuardian ? "text-saffron-2" : "text-text")}>{l.text}</div>
                {(l.tactics.length > 0 || l.suppressed) && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {l.tactics.map((t) => (
                      <TacticChip key={t} tactic={t} />
                    ))}
                    {l.suppressed && <span className="chip chip-safe" title={l.suppressionReason}>sounds legitimate</span>}
                    {l.contribution > 0 && <span className="chip mono">+{l.contribution}</span>}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {interim && (
        <div className="rounded-2xl border border-dashed border-line px-3 py-2 text-[15px] text-muted">
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-teal align-middle" />
          {interim}
        </div>
      )}
    </div>
  );
}
