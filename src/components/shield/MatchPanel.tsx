"use client";

import { FAMILY_INFO } from "@/lib/data/families";
import type { UtteranceAnalysis } from "@/lib/engine/types";
import { TacticChip } from "@/components/shield/TacticChip";
import { fmtMs } from "@/lib/utils";

export function MatchPanel({ analysis }: { analysis?: UtteranceAnalysis }) {
  if (!analysis) {
    return <div className="text-sm text-faint">When someone speaks, the closest lines from the scam playbook show up here with their similarity scores.</div>;
  }
  const top = analysis.matches.slice(0, 4);
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="truncate">“{analysis.utterance.text.slice(0, 60)}{analysis.utterance.text.length > 60 ? "…" : ""}”</span>
        <span className="mono shrink-0 text-moss">search {fmtMs(analysis.latency.retrievalMs)}</span>
      </div>
      {top.length === 0 && <div className="text-sm text-faint">No playbook line is close to this.</div>}
      {top.map((m) => {
        const pct = Math.round(m.confidence * 100);
        const benign = m.kind === "benign";
        return (
          <div key={m.docId} className="rounded-xl border border-line bg-white/[0.02] p-2.5">
            <div className="flex items-center gap-2 text-[11px]">
              <span className={benign ? "chip chip-safe" : "chip chip-saffron"}>{benign ? "Legitimate look-alike" : FAMILY_INFO[m.family].label}</span>
              {m.source === "community" && <span className="chip chip-moss">community intel</span>}
              <span className="mono ml-auto text-muted">{m.score.toFixed(3)}</span>
            </div>
            <div className="mt-1 text-[13px] leading-snug text-text/90">“{m.text}”</div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: benign ? "var(--safe)" : pct > 60 ? "var(--danger)" : "var(--caution)" }} />
              </div>
              <span className="mono w-10 text-right text-[11px] text-muted">{pct}%</span>
            </div>
            {!benign && m.tactics.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {m.tactics.slice(0, 4).map((t) => (
                  <TacticChip key={t} tactic={t} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
