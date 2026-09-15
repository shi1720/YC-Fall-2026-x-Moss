import type { MossClient, QueryOptions } from "@moss-js/moss";
import { fromMossMetadata } from "@/lib/data/playbook";
import { calibrate, type Retriever, type RetrievalResult, type SearchOptions } from "@/lib/engine/retriever";
import type { Match } from "@/lib/engine/types";

export interface MossRetrieverConfig {
  /** Loaded index names, first is the curated playbook. */
  indexes: string[];
  /** Calibration floor/ceil for the raw cosine score. */
  floor: number;
  ceil: number;
  /** 1.0 = pure semantic (raw cosine, comparable across queries). */
  alpha: number;
  topK: number;
  docCounts: Record<string, number>;
}

/**
 * Production retriever: queries one or more Moss indexes that are already loaded in
 * this process. No network on the query path — embedding and search both run in the
 * Moss runtime, typically in single-digit milliseconds.
 */
export class MossRetriever implements Retriever {
  readonly name = "moss";
  readonly runtime: string;
  constructor(
    private readonly client: MossClient,
    private readonly cfg: MossRetrieverConfig,
  ) {
    this.runtime = `Moss runtime (in-process, ${cfg.indexes.length} index${cfg.indexes.length > 1 ? "es" : ""} loaded)`;
  }

  docCount(): number {
    return Object.values(this.cfg.docCounts).reduce((a, b) => a + b, 0);
  }

  async ready(): Promise<void> {}

  async search(text: string, opts: SearchOptions = {}): Promise<RetrievalResult> {
    const options: QueryOptions = {
      topK: opts.topK ?? this.cfg.topK,
      alpha: opts.alpha ?? this.cfg.alpha,
    };
    const t0 = performance.now();
    const result =
      this.cfg.indexes.length > 1
        ? await this.client.queryMultiIndex(this.cfg.indexes, text, options)
        : await this.client.query(this.cfg.indexes[0], text, options);
    const wallMs = performance.now() - t0;
    const engineMs = typeof result.timeTakenInMs === "number" ? result.timeTakenInMs : wallMs;
    const matches: Match[] = result.docs.map((d) => {
      const meta = fromMossMetadata(d.metadata as Record<string, string> | undefined);
      const indexName = (d as { indexName?: string }).indexName ?? this.cfg.indexes[0];
      return {
        docId: d.id,
        text: d.text,
        score: d.score,
        confidence: calibrate(d.score, this.cfg.floor, this.cfg.ceil),
        ...meta,
        source: indexName === this.cfg.indexes[0] ? "playbook" : "community",
      };
    });
    return { matches, engineMs, wallMs };
  }
}
