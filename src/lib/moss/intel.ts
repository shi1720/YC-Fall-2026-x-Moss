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

export async function reportToCommunity(report: IntelReport): Promise<{ ok: boolean; added: number; message: string }> {
  const rt = await getMossRuntime();
  const lines = report.lines.filter((l) => l.text.trim().length > 12).slice(0, 25);
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
    await reloadIntelIndex();
    return { ok: true, added: docs.length, message: `${docs.length} caller lines added to community intel. Every Raksha device picks them up on its next auto-refresh.` };
  } catch (err) {
    return { ok: false, added: 0, message: `Could not publish to Moss: ${(err as Error).message.slice(0, 120)}` };
  }
}
