/**
 * Process-wide Moss runtime.
 *
 * One MossClient per process; the curated playbook index (and, when present, the
 * community-intel index) are loaded into memory once and kept fresh with Moss
 * auto-refresh, which hot-swaps newer index versions with zero query downtime.
 *
 * Singletons live on `globalThis` because the custom server and Next.js route handlers
 * are bundled as separate module graphs in the same process.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { MossClient } from "@moss-js/moss";
import { validatePlaybook } from "@/lib/data/playbook";
import { MockRetriever } from "@/lib/engine/mockRetriever";
import type { Retriever } from "@/lib/engine/retriever";
import type { PlaybookDoc } from "@/lib/engine/types";
import { MossRetriever } from "@/lib/moss/retriever";

export const INDEX_PLAYBOOK = process.env.MOSS_INDEX_PLAYBOOK ?? "raksha-playbook";
export const INDEX_INTEL = process.env.MOSS_INDEX_INTEL ?? "raksha-intel";

export interface RuntimeInfo {
  mode: "moss" | "mock";
  runtime: string;
  indexes: string[];
  docCount: number;
  model: string;
  loadedAt: number;
  loadMs: number;
  version: string;
}

export interface MossRuntime {
  retriever: Retriever;
  client: MossClient | null;
  info: RuntimeInfo;
  playbook: PlaybookDoc[];
}

const KEY = "__raksha_moss_runtime__";
type G = typeof globalThis & { [KEY]?: Promise<MossRuntime> };

export function loadPlaybookFromDisk(): PlaybookDoc[] {
  const file = path.join(process.cwd(), "data", "playbook.json");
  const raw = JSON.parse(readFileSync(file, "utf8")) as { docs: unknown[] };
  return validatePlaybook(raw.docs);
}

export function hasMossCredentials(): boolean {
  return Boolean(process.env.MOSS_PROJECT_ID && process.env.MOSS_PROJECT_KEY);
}

async function build(): Promise<MossRuntime> {
  const playbook = loadPlaybookFromDisk();
  const t0 = Date.now();
  if (!hasMossCredentials()) {
    const retriever = new MockRetriever(playbook);
    return {
      retriever,
      client: null,
      playbook,
      info: {
        mode: "mock",
        runtime: retriever.runtime,
        indexes: [],
        docCount: retriever.docCount(),
        model: "lexical",
        loadedAt: Date.now(),
        loadMs: Date.now() - t0,
        version: "mock",
      },
    };
  }
  // Two intra-op threads gave the best p50/p95 for the embedding step on 2–4 vCPU hosts.
  process.env.MOSS_EMBEDDING_INTRA_OP_THREADS ??= "2";
  const { MossClient } = await import("@moss-js/moss");
  const client = new MossClient(process.env.MOSS_PROJECT_ID!, process.env.MOSS_PROJECT_KEY!, {
    cachePath: process.env.MOSS_CACHE_PATH ?? path.join(process.cwd(), ".moss-cache"),
    identity: { deviceId: process.env.RAKSHA_DEVICE_ID ?? "raksha-server" },
  });
  const pollingIntervalInSeconds = Number(process.env.MOSS_REFRESH_SECONDS ?? 120);
  const indexes: string[] = [];
  const docCounts: Record<string, number> = {};
  let model = "moss-minilm";

  await client.loadIndex(INDEX_PLAYBOOK, { autoRefresh: true, pollingIntervalInSeconds });
  indexes.push(INDEX_PLAYBOOK);
  try {
    const info = await client.getIndex(INDEX_PLAYBOOK);
    docCounts[INDEX_PLAYBOOK] = info.docCount;
    model = info.model?.id ?? model;
  } catch {
    docCounts[INDEX_PLAYBOOK] = playbook.length;
  }
  // Community intel is optional: it only exists once someone has reported a call.
  try {
    const intel = await client.getIndex(INDEX_INTEL);
    if (intel && intel.docCount > 0) {
      await client.loadIndex(INDEX_INTEL, { autoRefresh: true, pollingIntervalInSeconds });
      indexes.push(INDEX_INTEL);
      docCounts[INDEX_INTEL] = intel.docCount;
    }
  } catch {
    /* no intel index yet */
  }
  const retriever = new MossRetriever(client, {
    indexes,
    floor: Number(process.env.RAKSHA_SCORE_FLOOR ?? 0.38),
    ceil: Number(process.env.RAKSHA_SCORE_CEIL ?? 0.72),
    alpha: Number(process.env.RAKSHA_ALPHA ?? 1.0),
    topK: Number(process.env.RAKSHA_TOPK ?? 6),
    docCounts,
  });
  // Warm the embedding path so the first real utterance is not the slow one.
  await retriever.search("hello, who is calling?");
  return {
    retriever,
    client,
    playbook,
    info: {
      mode: "moss",
      runtime: retriever.runtime,
      indexes,
      docCount: retriever.docCount(),
      model,
      loadedAt: Date.now(),
      loadMs: Date.now() - t0,
      version: "@moss-js/moss",
    },
  };
}

export function getMossRuntime(): Promise<MossRuntime> {
  const g = globalThis as G;
  if (!g[KEY]) {
    g[KEY] = build().catch((err) => {
      g[KEY] = undefined;
      throw err;
    });
  }
  return g[KEY];
}

/** Whether the community-intel index is currently part of the multi-index query. */
export async function reloadIntelIndex(): Promise<boolean> {
  const rt = await getMossRuntime();
  if (!rt.client) return false;
  try {
    const intel = await rt.client.getIndex(INDEX_INTEL);
    if (intel.docCount > 0 && !rt.info.indexes.includes(INDEX_INTEL)) {
      await rt.client.loadIndex(INDEX_INTEL, { autoRefresh: true, pollingIntervalInSeconds: 120 });
      rt.info.indexes.push(INDEX_INTEL);
      // Rebuild the retriever with both indexes.
      const mr = rt.retriever as MossRetriever;
      const cfg = (mr as unknown as { cfg: { indexes: string[]; docCounts: Record<string, number> } }).cfg;
      cfg.indexes = [...rt.info.indexes];
      cfg.docCounts[INDEX_INTEL] = intel.docCount;
    }
    return true;
  } catch {
    return false;
  }
}
