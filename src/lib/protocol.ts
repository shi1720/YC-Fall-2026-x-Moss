import { z } from "zod";
/**
 * WebSocket protocol shared by the browser and the server. Every message is JSON with a
 * `type` discriminator. Kept intentionally small and explicit.
 */
import type { CoachAdvice, Intervention, RiskState, Speaker, UtteranceAnalysis } from "@/lib/engine/types";

export type CallMode = "live" | "simulation" | "upload";

export interface CallMeta {
  callId: string;
  mode: CallMode;
  scenarioId?: string;
  familyCode?: string;
  startedAt: number;
  region: "IN" | "US" | "UK" | "AU" | "GLOBAL";
  /** Display name of the person being protected (for the guardian feed). */
  displayName?: string;
}

// ---- client → server ----
export type ClientMessage =
  | { type: "runtime.select"; token?: string }
  | { type: "call.start"; mode: CallMode; scenarioId?: string; familyCode?: string; region?: CallMeta["region"]; displayName?: string }
  | { type: "utterance"; text: string; speaker: Speaker; final: boolean; t?: number }
  | { type: "call.end" }
  | { type: "call.report"; consent: true }
  | { type: "guardian.join"; familyCode: string; name?: string }
  | { type: "guardian.say"; text: string }
  | { type: "guardian.ask"; question: string }
  | { type: "ping" };

// ---- server → client ----
export interface LatencyStats {
  count: number;
  p50: number;
  p95: number;
  p99: number;
  max: number;
  /** Mean engine-reported retrieval time. */
  meanRetrieval: number;
}

export type ServerMessage =
  | { type: "hello"; selected?: boolean; runtime: { mode: "moss" | "mock"; runtime: string; docCount: number; indexes: string[]; model: string; source?: "visitor" | "shared" }; llm: { enabled: boolean; model: string } }
  | { type: "call.started"; call: CallMeta }
  | { type: "analysis"; callId: string; analysis: UtteranceAnalysis; latencyStats: LatencyStats }
  | { type: "risk"; callId: string; risk: RiskState }
  | { type: "intervention"; callId: string; intervention: Intervention }
  | { type: "coach"; callId: string; advice: CoachAdvice }
  | { type: "call.ended"; callId: string; summary: string; risk: RiskState; durationMs: number; latencyStats: LatencyStats }
  | { type: "call.reported"; callId: string; added: number; ok: boolean; message: string }
  | { type: "guardian.joined"; familyCode: string; activeCalls: CallMeta[] }
  | { type: "guardian.message"; callId: string; text: string; from: string }
  | { type: "guardian.answer"; callId: string; question: string; hits: Array<{ text: string; speaker: Speaker; score: number; t: number }>; latencyMs: number; answer?: string }
  | { type: "error"; message: string }
  | { type: "pong"; t: number };

export function encode(msg: ServerMessage | ClientMessage): string {
  return JSON.stringify(msg);
}

/** Validate every untrusted socket message before it reaches the engine. */
export const clientMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("runtime.select"), token: z.string().regex(/^[a-f0-9]{64}$/).optional() }),
  z.object({ type: z.literal("call.start"), mode: z.enum(["live", "simulation", "upload"]), scenarioId: z.string().max(100).optional(), familyCode: z.string().regex(/^[A-Z0-9]{6,8}$/i).optional(), region: z.enum(["IN", "US", "UK", "AU", "GLOBAL"]).optional(), displayName: z.string().max(80).optional() }),
  z.object({ type: z.literal("utterance"), text: z.string().min(1).max(4000), speaker: z.enum(["caller", "user", "unknown"]), final: z.boolean(), t: z.number().finite().min(0).max(86400000).optional() }),
  z.object({ type: z.literal("call.end") }),
  z.object({ type: z.literal("call.report"), consent: z.literal(true) }),
  z.object({ type: z.literal("guardian.join"), familyCode: z.string().regex(/^[A-Z0-9]{6,8}$/i), name: z.string().max(80).optional() }),
  z.object({ type: z.literal("guardian.say"), text: z.string().trim().min(1).max(300) }),
  z.object({ type: z.literal("guardian.ask"), question: z.string().trim().min(1).max(500) }),
  z.object({ type: z.literal("ping") }),
]);
