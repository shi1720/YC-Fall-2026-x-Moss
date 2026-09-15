import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskLevel } from "@/lib/engine/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LEVEL_LABEL: Record<RiskLevel, string> = { safe: "Safe", caution: "Caution", danger: "Danger" };
export const LEVEL_COLOR: Record<RiskLevel, string> = { safe: "var(--safe)", caution: "var(--caution)", danger: "var(--danger)" };
export const LEVEL_CHIP: Record<RiskLevel, string> = { safe: "chip-safe", caution: "chip-caution", danger: "chip-danger" };

export function fmtMs(ms: number) {
  if (ms < 1) return `${(ms * 1000).toFixed(0)} µs`;
  if (ms < 10) return `${ms.toFixed(2)} ms`;
  if (ms < 1000) return `${ms.toFixed(0)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function fmtClock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function wsUrl(): string {
  if (typeof window === "undefined") return "";
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/ws`;
}
