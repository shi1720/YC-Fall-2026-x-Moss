/**
 * Community intel: when a person reports a call, the caller's flagged lines are upserted
 * into a second Moss index. Every running Raksha instance has that index loaded with
 * auto-refresh, so the new script variant reaches every device on the next hot-swap —
 * no redeploy, no restart, no query downtime.
 */
import { randomUUID } from "node:crypto";
import type { Tactic } from "@/lib/engine/types";
import { getMossRuntime, INDEX_INTEL, reloadIntelIndex } from "@/lib/moss/runtime";

export interface IntelReport {
  lines: Array<{ text: string; tactics: Tactic[]; family: string }>;
  region?: string;
}

/** Abuse controls: one report per call, a global budget per hour, and no duplicate lines. */
const MAX_REPORTS_PER_HOUR = Number(process.env.RAKSHA_INTEL_REPORTS_PER_HOUR ?? 60);
const MAX_LINES_PER_REPORT = 25;
const recentReports: number[] = [];
const reportedCalls = new Set<string>();
const seenLines = new Set<string>();

function normalise(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

export async function reportToCommunity(report: IntelReport & { callId?: string }): Promise<{ ok: boolean; added: number; message: string }> {
  const rt = await getMossRuntime();
  const now = Date.now();
  while (recentReports.length && now - recentReports[0] > 3600_000) recentReports.shift();
  if (recentReports.length >= MAX_REPORTS_PER_HOUR) return { ok: false, added: 0, message: "Community reporting is busy right now; please try again later." };
  if (report.callId && reportedCalls.has(report.callId)) return { ok: false, added: 0, message: "This call has already been reported. Thank you." };
  const lines = report.lines
    .filter((l) => l.text.trim().length > 12 && l.text.trim().split(/\s+/).length >= 4)
    .filter((l) => !seenLines.has(normalise(l.text)))
    .slice(0, MAX_LINES_PER_REPORT);
  if (lines.length === 0) return { ok: false, added: 0, message: "Nothing flagged in this call to report." };
  if (!rt.client) {
    return { ok: true, added: lines.length, message: `Recorded ${lines.length} lines locally (mock runtime — Moss credentials not configured).` };
  }
  const docs = lines.map((l) => ({
    id: `intel-${randomUUID().slice(0, 12)}`,
    text: l.text,
    metadata: {
      family: l.family,
      tactics: l.tactics.join(","),
      severity: "4",
      kind: "tactic",
      stage: "pressure",
      region: report.region ?? "IN",
      source: "community",
      reportedAt: new Date().toISOString(),
    },
  }));
  try {
    let exists = false;
    try {
      await rt.client.getIndex(INDEX_INTEL);
      exists = true;
    } catch {
      exists = false;
    }
    if (exists) await rt.client.addDocs(INDEX_INTEL, docs, { upsert: true });
    else await rt.client.createIndex(INDEX_INTEL, docs, { modelId: "moss-minilm" });
    recentReports.push(now);
    if (report.callId) reportedCalls.add(report.callId);
    for (const l of lines) seenLines.add(normalise(l.text));
    await reloadIntelIndex();
    return { ok: true, added: docs.length, message: `${docs.length} caller lines added to community intel. Every Raksha device picks them up on its next auto-refresh.` };
  } catch (err) {
    return { ok: false, added: 0, message: `Could not publish to Moss: ${(err as Error).message.slice(0, 120)}` };
  }
}
