/**
 * Lexical fallback retriever (TF-IDF cosine). Used when no Moss credentials are
 * configured so the app, unit tests and CI stay runnable offline. It is deliberately
 * simple; the eval report is only ever produced against the real Moss runtime.
 */
import { calibrate, type Retriever, type RetrievalResult, type SearchOptions } from "@/lib/engine/retriever";
import type { Match, PlaybookDoc } from "@/lib/engine/types";

const STOP = new Set(
  "a an the and or but if then so to of in on at for from by with is are was were be been being am i you he she it we they me him her us them my your his its our their this that these those there here what which who whom when where why how do does did doing have has had having not no yes ok okay sir madam ma'am please hello hi hey yeah yes just very really can could will would should shall may might must about into over under again also too only own same than ever".split(
    /\s+/,
  ),
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9₹$ ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map((t) => (t.length > 5 ? t.slice(0, 5) : t)); // crude stemming
}

export class MockRetriever implements Retriever {
  readonly name = "lexical-mock";
  readonly runtime = "Offline lexical fallback (TF-IDF). Configure MOSS_PROJECT_ID / MOSS_PROJECT_KEY for the real Moss runtime.";
  private docs: Array<{ doc: PlaybookDoc; tokens: string[]; tf: Map<string, number> }> = [];
  private df = new Map<string, number>();
  private avgLen = 1;

  constructor(docs: PlaybookDoc[]) {
    for (const doc of docs) {
      const tokens = tokenize(doc.text);
      const tf = new Map<string, number>();
      for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
      for (const t of tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
      this.docs.push({ doc, tokens, tf });
    }
    this.avgLen = this.docs.reduce((s, d) => s + d.tokens.length, 0) / Math.max(1, this.docs.length);
  }

  docCount(): number {
    return this.docs.length;
  }

  async ready(): Promise<void> {}

  async search(text: string, opts: SearchOptions = {}): Promise<RetrievalResult> {
    const t0 = performance.now();
    const q = tokenize(text);
    const N = this.docs.length;
    const idf = (term: string) => Math.log(1 + N / (1 + (this.df.get(term) ?? 0)));
    const qtf = new Map<string, number>();
    for (const t of q) qtf.set(t, (qtf.get(t) ?? 0) + 1);
    let qnorm = 0;
    for (const [t, f] of qtf) qnorm += (f * idf(t)) ** 2;
    qnorm = Math.sqrt(qnorm) || 1;
    const scored: Array<{ doc: PlaybookDoc; score: number }> = [];
    for (const d of this.docs) {
      let dot = 0;
      for (const [t, f] of qtf) {
        const df = d.tf.get(t);
        if (df) dot += f * idf(t) * df * idf(t);
      }
      if (dot <= 0) continue;
      let dnorm = 0;
      for (const [t, f] of d.tf) dnorm += (f * idf(t)) ** 2;
      scored.push({ doc: d.doc, score: dot / (qnorm * (Math.sqrt(dnorm) || 1)) });
    }
    scored.sort((a, b2) => b2.score - a.score);
    const top = scored.slice(0, opts.topK ?? 5);
    const matches: Match[] = top.map(({ doc, score }) => ({
      docId: doc.id,
      text: doc.text,
      score,
      confidence: calibrate(score, 0.18, 0.55),
      family: doc.family,
      tactics: doc.tactics,
      severity: doc.severity,
      kind: doc.kind,
      stage: doc.stage,
      source: "playbook",
    }));
    const ms = performance.now() - t0;
    return { matches, engineMs: ms, wallMs: ms };
  }
}
