/**
 * Evaluation harness: replays every scenario in data/transcripts through the real engine
 * (Moss when credentials are present, otherwise the lexical mock) and reports:
 *   - detection: did scam calls reach DANGER, and by which turn?
 *   - false positives: did benign calls stay below DANGER?
 *   - time-to-detect vs the first "ask" in the script
 *   - latency percentiles for the retrieval hot path
 * Writes docs/eval/REPORT.md and docs/eval/results.json.
 */
import "dotenv/config";
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import path from "node:path";
import { analyzeUtterance, createRiskState } from "../src/lib/engine/risk";
import { LatencyTracker } from "../src/lib/engine/latency";
import type { RiskLevel, Utterance } from "../src/lib/engine/types";
import { getMossRuntime } from "../src/lib/moss/runtime";
import { FAMILY_INFO } from "../src/lib/data/families";

interface Scenario {
  id: string;
  title: string;
  family: string;
  expected: "scam" | "benign";
  expectDangerByTurn: number | null;
  turns: Array<{ speaker: "caller" | "user"; text: string }>;
}

interface ScenarioResult {
  id: string;
  title: string;
  expected: "scam" | "benign";
  finalLevel: RiskLevel;
  finalScore: number;
  dominantFamily: string | null;
  familyCorrect: boolean;
  firstCautionTurn: number | null;
  firstDangerTurn: number | null;
  expectDangerByTurn: number | null;
  turns: number;
  pass: boolean;
  perTurn: Array<{ turn: number; speaker: string; score: number; level: RiskLevel; tactics: string[]; topMatch: string; topScore: number; ms: number }>;
}

async function main() {
  const dir = path.join(process.cwd(), "data", "transcripts");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "index.json");
  const rt = await getMossRuntime();
  console.log(`Runtime: ${rt.info.runtime} (${rt.info.docCount} docs)`);
  const latency = new LatencyTracker(100000);
  const results: ScenarioResult[] = [];

  for (const f of files) {
    const sc = JSON.parse(readFileSync(path.join(dir, f), "utf8")) as Scenario;
    let state = createRiskState();
    let firstCaution: number | null = null;
    let firstDanger: number | null = null;
    const perTurn: ScenarioResult["perTurn"] = [];
    for (let i = 0; i < sc.turns.length; i++) {
      const turn = sc.turns[i];
      const t0 = performance.now();
      const { matches, engineMs } = await rt.retriever.search(turn.text);
      const total = performance.now() - t0;
      latency.add(total, engineMs);
      const u: Utterance = { id: `${sc.id}-${i + 1}`, speaker: turn.speaker, text: turn.text, t: i * 8000, final: true };
      const a = analyzeUtterance(state, u, matches, { retrievalMs: engineMs, totalMs: total });
      state = a.risk;
      if (state.level === "caution" && firstCaution === null) firstCaution = i + 1;
      if (state.level === "danger" && firstDanger === null) firstDanger = i + 1;
      perTurn.push({
        turn: i + 1,
        speaker: turn.speaker,
        score: state.score,
        level: state.level,
        tactics: a.tactics,
        topMatch: matches[0] ? `${matches[0].family}/${matches[0].kind}` : "-",
        topScore: matches[0] ? Number(matches[0].score.toFixed(3)) : 0,
        ms: Number(total.toFixed(2)),
      });
    }
    const familyCorrect = sc.expected === "benign" ? state.dominantFamily === null || state.level !== "danger" : state.dominantFamily === sc.family;
    const pass = sc.expected === "scam" ? firstDanger !== null && (sc.expectDangerByTurn === null || firstDanger <= sc.expectDangerByTurn + 4) : firstDanger === null;
    results.push({
      id: sc.id,
      title: sc.title,
      expected: sc.expected,
      finalLevel: state.level,
      finalScore: state.score,
      dominantFamily: state.dominantFamily,
      familyCorrect,
      firstCautionTurn: firstCaution,
      firstDangerTurn: firstDanger,
      expectDangerByTurn: sc.expectDangerByTurn,
      turns: sc.turns.length,
      pass,
      perTurn,
    });
    console.log(`${pass ? "✔" : "✘"} ${sc.title.padEnd(34)} ${state.level.padEnd(8)} ${String(state.score).padStart(3)}  danger@${firstDanger ?? "-"} (expect ≤${sc.expectDangerByTurn ?? "never"})  family=${state.dominantFamily ?? "-"}`);
  }

  // Fragment-level false-credit test: everyday sentences that are not in the index.
  const fragments = (JSON.parse(readFileSync(path.join(process.cwd(), "data", "benign-fragments.json"), "utf8")) as { fragments: string[] }).fragments;
  let credited = 0;
  const creditedExamples: Array<{ text: string; tactics: string[]; top: string; score: number }> = [];
  for (const [i, text] of fragments.entries()) {
    const { matches } = await rt.retriever.search(text);
    const a = analyzeUtterance(createRiskState(), { id: `frag-${i}`, speaker: "caller", text, t: 0, final: true }, matches, { retrievalMs: 0, totalMs: 0 });
    if (a.tactics.length > 0) {
      credited++;
      creditedExamples.push({ text, tactics: a.tactics, top: matches[0]?.text ?? "", score: Number((matches[0]?.score ?? 0).toFixed(3)) });
    }
  }
  const fragmentTest = { total: fragments.length, credited, rate: credited / Math.max(1, fragments.length), examples: creditedExamples };
  console.log(`\nBenign fragments: ${credited}/${fragments.length} credited with a tactic (${(fragmentTest.rate * 100).toFixed(1)}%)`);

  const stats = latency.stats();
  const scams = results.filter((r) => r.expected === "scam");
  const benign = results.filter((r) => r.expected === "benign");
  const detected = scams.filter((r) => r.firstDangerTurn !== null).length;
  const fp = benign.filter((r) => r.firstDangerTurn !== null).length;
  const famAcc = scams.filter((r) => r.familyCorrect).length;
  const summary = {
    runtime: rt.info,
    generatedAt: new Date().toISOString(),
    scenarios: results.length,
    scamDetectionRate: detected / Math.max(1, scams.length),
    falsePositiveRate: fp / Math.max(1, benign.length),
    familyAccuracy: famAcc / Math.max(1, scams.length),
    meanDangerTurn: scams.filter((r) => r.firstDangerTurn).reduce((s, r) => s + (r.firstDangerTurn ?? 0), 0) / Math.max(1, detected),
    latency: stats,
    benignFragments: fragmentTest,
    hardware: { cpu: cpus()[0]?.model ?? "unknown", vcpus: cpus().length, embeddingThreads: process.env.MOSS_EMBEDDING_INTRA_OP_THREADS ?? "2" },
  };
  console.log("\nSummary:", JSON.stringify({ ...summary, runtime: summary.runtime.mode }, null, 1));

  const out = path.join(process.cwd(), "docs", "eval");
  mkdirSync(out, { recursive: true });
  writeFileSync(path.join(out, "results.json"), JSON.stringify({ summary, results }, null, 2));
  writeFileSync(path.join(out, "REPORT.md"), renderReport(summary, results));
  console.log(`\nWrote ${path.join(out, "REPORT.md")}`);
  await rt.client?.close();
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function renderReport(
  summary: Record<string, unknown> & {
    latency: ReturnType<LatencyTracker["stats"]>;
    runtime: { mode: string; runtime: string; docCount: number; model: string };
    benignFragments: { total: number; credited: number; rate: number; examples: Array<{ text: string; tactics: string[]; top: string; score: number }> };
    hardware: { cpu: string; vcpus: number; embeddingThreads: string };
  },
  results: ScenarioResult[],
) {
  const lines: string[] = [];
  lines.push(`# Raksha evaluation report`);
  lines.push(``);
  lines.push(`Generated ${summary.generatedAt} · runtime **${summary.runtime.runtime}** · ${summary.runtime.docCount} playbook docs · model \`${summary.runtime.model}\``);
  lines.push(``);
  lines.push(`| Metric | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| Scam scenarios detected (reached DANGER) | ${pct(summary.scamDetectionRate as number)} |`);
  lines.push(`| Benign scenarios wrongly escalated to DANGER | ${pct(summary.falsePositiveRate as number)} |`);
  lines.push(`| Scam family identified correctly | ${pct(summary.familyAccuracy as number)} |`);
  lines.push(`| Mean turn at which DANGER fired | ${(summary.meanDangerTurn as number).toFixed(1)} |`);
  lines.push(`| Retrieval latency p50 / p95 / p99 (ms, end-to-end incl. embedding) | ${summary.latency.p50} / ${summary.latency.p95} / ${summary.latency.p99} |`);
  lines.push(`| Mean engine-reported search time (ms) | ${summary.latency.meanRetrieval} |`);
  lines.push(`| Utterances analysed | ${summary.latency.count} |`);
  lines.push(`| Benign everyday fragments (not in the index) credited with any tactic | ${summary.benignFragments.credited} / ${summary.benignFragments.total} (${(summary.benignFragments.rate * 100).toFixed(1)}%) |`);
  lines.push(`| Hardware | ${summary.hardware.cpu} × ${summary.hardware.vcpus} vCPU, embedding threads ${summary.hardware.embeddingThreads} |`);
  lines.push(``);
  lines.push(`Scenario counts: ${results.filter((r) => r.expected === "scam").length} scam calls, ${results.filter((r) => r.expected === "benign").length} genuine calls. Latency is wall-clock around \`retriever.search()\` (query embedding + multi-index cosine search + metadata decode); it excludes speech-to-text and network. See \`docs/eval/latency.json\` (\`npm run eval:bench\`) for the dedicated benchmark.`);
  lines.push(``);
  lines.push(`**Limitations.** Scenarios are scripted reconstructions paraphrased from public advisories, not recordings of real calls; accents, background noise and speech-recognition errors are not modelled here (the live-microphone mode exercises them). The benign fragment set is small (${summary.benignFragments.total} sentences) and English/Hinglish only.`);
  if (summary.benignFragments.examples.length) {
    lines.push(``);
    lines.push(`Benign fragments that were credited (to fix next):`);
    for (const e of summary.benignFragments.examples) lines.push(`- "${e.text}" → ${e.tactics.join(", ")} (top match ${e.score}: "${e.top.slice(0, 70)}")`);
  }
  lines.push(``);
  lines.push(`## Scenarios`);
  lines.push(``);
  lines.push(`| Scenario | Expected | Result | Score | DANGER at turn | Expected by | Family |`);
  lines.push(`|---|---|---|---|---|---|---|`);
  for (const r of results) {
    lines.push(
      `| ${r.title} | ${r.expected} | ${r.pass ? "✅" : "❌"} ${r.finalLevel} | ${r.finalScore} | ${r.firstDangerTurn ?? "never"} | ${r.expectDangerByTurn ?? "never"} | ${r.dominantFamily ? FAMILY_INFO[r.dominantFamily as keyof typeof FAMILY_INFO]?.label ?? r.dominantFamily : "—"} |`,
    );
  }
  lines.push(``);
  lines.push(`## Turn-by-turn`);
  for (const r of results) {
    lines.push(``);
    lines.push(`### ${r.title} (${r.expected})`);
    lines.push(``);
    lines.push(`| # | Who | Score | Level | Tactics credited | Top match | Top score | ms |`);
    lines.push(`|---|---|---|---|---|---|---|---|`);
    for (const t of r.perTurn) lines.push(`| ${t.turn} | ${t.speaker} | ${t.score} | ${t.level} | ${t.tactics.join(", ") || "—"} | ${t.topMatch} | ${t.topScore} | ${t.ms} |`);
  }
  lines.push(``);
  lines.push(`_Pass rule: scam scenarios must reach DANGER no later than 4 turns after the script's first extraction ask; benign scenarios must never reach DANGER._`);
  return lines.join("\n") + "\n";
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
