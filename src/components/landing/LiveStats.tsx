"use client";

import { useEffect, useState } from "react";
import { fmtMs } from "@/lib/utils";

interface Health {
  retrieval: { mode: string; docCount: number; model: string; indexes: string[] };
  latency: { count: number; p50: number; p95: number };
  llm: { enabled: boolean; model: string };
}

export function LiveStats() {
  const [h, setH] = useState<Health | null>(null);
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setH)
      .catch(() => {});
  }, []);
  const items = [
    { label: "Retrieval runtime", value: h ? (h.retrieval.mode === "moss" ? "Moss · in-process" : "offline fallback") : "…" },
    { label: "Playbook lines loaded", value: h ? String(h.retrieval.docCount) : "…" },
    { label: "Live p50 / p95", value: h && h.latency.count ? `${fmtMs(h.latency.p50)} / ${fmtMs(h.latency.p95)}` : "no calls yet" },
    { label: "Coach model", value: h ? h.llm.model : "…" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="card p-4">
          <div className="text-[11px] uppercase tracking-wider text-faint">{i.label}</div>
          <div className="mono mt-1 truncate text-lg text-text">{i.value}</div>
        </div>
      ))}
    </div>
  );
}
