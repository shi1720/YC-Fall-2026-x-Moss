import type { Match } from "@/lib/engine/types";

/**
 * A retriever answers one question, fast: "which playbook lines does this utterance
 * sound like?". Moss is the production implementation; the lexical mock keeps the
 * whole app (and CI) runnable with zero credentials.
 */
export interface Retriever {
  readonly name: string;
  /** Human-readable description of the runtime (shown in the UI). */
  readonly runtime: string;
  search(text: string, opts?: SearchOptions): Promise<RetrievalResult>;
  /** Number of documents available across all loaded indexes. */
  docCount(): number;
  ready(): Promise<void>;
}

export interface SearchOptions {
  topK?: number;
  /** 1.0 = pure semantic, 0.0 = pure keyword. */
  alpha?: number;
}

export interface RetrievalResult {
  matches: Match[];
  /** Milliseconds reported by the engine itself (Moss `timeTakenMs`) or measured around the call. */
  engineMs: number;
  /** Wall-clock around the whole call including embedding. */
  wallMs: number;
}

/**
 * Map a raw semantic score to a 0..1 confidence. Thresholds are tuned on the eval set
 * (see docs/eval). `floor` is the score below which a hit is noise; `ceil` is a
 * near-paraphrase.
 */
export function calibrate(score: number, floor: number, ceil: number): number {
  if (!Number.isFinite(score)) return 0;
  const c = (score - floor) / (ceil - floor);
  return Math.max(0, Math.min(1, c));
}
