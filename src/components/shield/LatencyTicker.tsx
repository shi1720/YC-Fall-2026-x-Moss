"use client";

import { Gauge } from "lucide-react";
import type { LatencyStats } from "@/lib/protocol";
import { fmtMs } from "@/lib/utils";

export function LatencyTicker({ last, stats, mode }: { last?: number; stats?: LatencyStats; mode?: "moss" | "mock" }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
      <span className="inline-flex items-center gap-1.5">
        <Gauge className="h-3.5 w-3.5 text-moss" />
        <span className={mode === "moss" ? "chip chip-moss" : "chip"}>{mode === "moss" ? "Moss · in-process" : mode === "mock" ? "offline fallback" : "…"}</span>
      </span>
      <span>
        last <span className="mono text-text">{last !== undefined ? fmtMs(last) : "-"}</span>
      </span>
      <span>
        p50 <span className="mono text-text">{stats && stats.count ? fmtMs(stats.p50) : "-"}</span>
      </span>
      <span>
        p95 <span className="mono text-text">{stats && stats.count ? fmtMs(stats.p95) : "-"}</span>
      </span>
      <span>
        n <span className="mono text-text">{stats?.count ?? 0}</span>
      </span>
    </div>
  );
}
