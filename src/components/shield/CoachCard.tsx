"use client";

import { Sparkles, MessageSquareQuote, ArrowRight } from "lucide-react";
import type { CoachAdvice } from "@/lib/engine/types";

export function CoachCard({ advice, llmModel }: { advice?: CoachAdvice; llmModel?: string }) {
  if (!advice) {
    return (
      <div className="text-sm text-faint">
        The coach speaks up when the risk changes: a plain-language explanation, the exact sentence to say, and what to do next.
        <div className="mt-2 text-[11px]">
          model: <span className="mono">{llmModel ?? "…"}</span>
        </div>
      </div>
    );
  }
  const tone = advice.verdict === "scam" ? "text-danger-2" : advice.verdict === "suspicious" ? "text-caution" : "text-safe";
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs">
        <Sparkles className="h-3.5 w-3.5 text-saffron" />
        <span className={`font-semibold uppercase tracking-wider ${tone}`}>{advice.verdict}</span>
        <span className="mono text-muted">{Math.round(advice.confidence * 100)}%</span>
        <span className="mono ml-auto text-faint" title={advice.model}>
          {advice.latencyMs ? `${advice.latencyMs} ms` : "template"}
        </span>
      </div>
      <p className="text-[15px] leading-snug text-text">{advice.explanation}</p>
      <div className="rounded-xl border border-saffron/30 bg-saffron/10 p-3">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-saffron">
          <MessageSquareQuote className="h-3.5 w-3.5" /> Say this
        </div>
        <div className="display text-lg leading-snug text-saffron-2">“{advice.sayThis}”</div>
      </div>
      <div className="flex items-start gap-2 text-sm text-text">
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
        <span>{advice.action}</span>
      </div>
    </div>
  );
}
