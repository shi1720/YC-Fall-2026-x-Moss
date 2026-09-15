"use client";

import { motion } from "motion/react";
import { FAMILY_INFO } from "@/lib/data/families";
import type { RiskState } from "@/lib/engine/types";
import { LEVEL_COLOR, LEVEL_LABEL, cn } from "@/lib/utils";

export function RiskDial({ risk, size = 220, compact = false }: { risk: RiskState; size?: number; compact?: boolean }) {
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, risk.score)) / 100;
  const color = LEVEL_COLOR[risk.level];
  const fam = risk.dominantFamily ? FAMILY_INFO[risk.dominantFamily] : null;
  return (
    <div className="relative flex flex-col items-center">
      <div className={cn("relative", risk.level === "danger" && "danger-flash rounded-full")} style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={12} fill="none" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct), stroke: color }}
            transition={{ type: "spring", stiffness: 60, damping: 18 }}
            style={{ filter: `drop-shadow(0 0 12px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={risk.score}
            initial={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mono text-5xl font-semibold leading-none"
            style={{ color }}
          >
            {risk.score}
          </motion.div>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">risk</div>
          <div className="mt-2 rounded-full px-3 py-1 text-sm font-semibold" style={{ background: `${color}22`, color }}>
            {LEVEL_LABEL[risk.level]}
          </div>
        </div>
      </div>
      {!compact && (
        <div className="mt-3 min-h-10 text-center">
          {fam ? (
            <div className="text-sm text-muted">
              Closest script: <span className="font-medium text-text">{fam.label}</span>
            </div>
          ) : (
            <div className="text-sm text-faint">No script recognised yet</div>
          )}
        </div>
      )}
    </div>
  );
}
