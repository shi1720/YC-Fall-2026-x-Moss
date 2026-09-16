"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Play, ShieldCheck } from "lucide-react";
import { FAMILY_INFO } from "@/lib/data/families";
import type { Family } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

export interface ScenarioMeta {
  id: string;
  title: string;
  family: Family;
  expected: "scam" | "benign";
  persona: string;
  blurb: string;
  turns: number;
}

export function ScenarioPicker({ scenarios, selected, onSelect, disabled }: { scenarios: ScenarioMeta[]; selected?: string; onSelect: (id: string) => void; disabled?: boolean }) {
  const [filter, setFilter] = useState("all");
  return (
    <div>
      <label className="text-xs text-muted">Choose a scenario
        <select aria-label="Scenario filter" className="input mt-1 mb-3 py-2" value={filter} onChange={e => setFilter(e.target.value)} disabled={disabled}>
          <option value="all">All 18 calls</option><option value="scam">Scam calls</option><option value="benign">Genuine calls</option>
        </select>
      </label>
    <div className="scrollbar-thin grid max-h-[13rem] grid-cols-1 gap-2 overflow-y-auto pr-1">
      {scenarios.filter(s => filter === "all" || s.expected === filter).map((s, i) => {
        const active = s.id === selected;
        const benign = s.expected === "benign";
        return (
          <motion.button
            key={s.id}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onSelect(s.id)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              "group rounded-2xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
              active ? "border-saffron/60 bg-saffron/10" : "border-line bg-white/[0.02] hover:border-line-strong hover:bg-white/[0.04]",
            )}
          >
            <div className="flex items-center gap-2">
              {benign ? <ShieldCheck className="h-4 w-4 shrink-0 text-safe" /> : <Play className="h-4 w-4 shrink-0 text-saffron" />}
              <span className="min-w-0 text-sm font-semibold text-text">{s.title}</span>
              <span className={cn("chip ml-auto shrink-0", benign ? "chip-safe" : "")}>{benign ? "legitimate" : FAMILY_INFO[s.family].region}</span>
            </div>
            <div className="mt-1 line-clamp-1 text-xs leading-snug text-muted">{s.blurb}</div>
            <div className="mt-1 text-[11px] text-faint">{s.persona} · {s.turns} turns</div>
          </motion.button>
        );
      })}
    </div>
    </div>
  );
}
