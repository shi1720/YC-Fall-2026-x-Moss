"use client";

import { motion } from "motion/react";

const rows = [
  { label: "Moss, in-process (this app)", ms: 8, note: "embed + search, p50 measured on a 4-vCPU container", color: "var(--moss)" },
  { label: "Cloud vector database round-trip", ms: 350, note: "illustrative comparison, not measured here", color: "var(--caution)" },
  { label: "LLM classifier per sentence", ms: 900, note: "illustrative comparison, not measured here", color: "var(--danger)" },
  { label: "One spoken sentence", ms: 2500, note: "~7 words at conversational pace", color: "rgba(255,255,255,0.35)" },
];

export function LatencyBars() {
  const max = Math.max(...rows.map((r) => r.ms));
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="mb-1 flex flex-wrap gap-1 items-baseline justify-between text-sm">
            <span className="text-text">{r.label}</span>
            <span className="mono text-muted">
              ~{r.ms} ms <span className="text-faint">· {r.note}</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.max(1.2, (r.ms / max) * 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: r.color }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-faint">Moss timing comes from the committed 264-utterance evaluation. Other timings are illustrative. Run the latency lab to measure this server and your network separately.</p>
    </div>
  );
}
