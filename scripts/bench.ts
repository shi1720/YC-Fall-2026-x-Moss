/**
 * Reproducible latency benchmark for the retrieval hot path (embed + search, in-process).
 *   npm run eval:bench            → prints a table and writes docs/eval/latency.json
 * Runs against the real Moss runtime when credentials are set, otherwise the offline fallback.
 */
import "dotenv/config";
import { cpus, totalmem } from "node:os";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getMossRuntime } from "../src/lib/moss/runtime";
import { LatencyTracker } from "../src/lib/engine/latency";

const PROBES = [
  "Sir, this is Inspector Sharma from Mumbai Cyber Crime, your Aadhaar is linked to a money laundering case.",
  "Your SBI account will be blocked in two hours unless you verify with the OTP.",
  "Please install AnyDesk so our engineer can fix the virus on your computer.",
  "Grandma, I've been in an accident, please don't tell mom, I need bail money.",
  "You have won twenty five lakh in the KBC lucky draw, pay the GST to release it.",
  "This is confidential, wire the vendor today and don't loop in anyone.",
  "Hi, this is Blue Dart, your parcel will be delivered between 2 and 6 today.",
  "Your appointment with Dr Mehta is confirmed for Thursday at 4:30.",
  "We will never ask for your OTP, you can hang up and call the number on your card.",
  "Beta, can you send two thousand rupees for the electricity bill, I'll pay you back Sunday.",
  "okay the OTP is four eight two one nine three",
  "yes what is this about",
];

async function main() {
  const rounds = Number(process.argv[2] ?? 25);
  const rt = await getMossRuntime();
  const warm = new LatencyTracker(1000);
  for (const q of PROBES) {
    const r = await rt.retriever.search(q);
    warm.add(r.wallMs, r.engineMs);
  }
  const t = new LatencyTracker(100000);
  const byLength: Record<string, number[]> = { short: [], long: [] };
  for (let i = 0; i < rounds; i++) {
    for (const q of PROBES) {
      const r = await rt.retriever.search(q);
      t.add(r.wallMs, r.engineMs);
      byLength[q.split(/\s+/).length < 8 ? "short" : "long"].push(r.wallMs);
    }
  }
  const stats = t.stats();
  const pct = (a: number[], p: number) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(p * a.length))];
  const cpu = cpus()[0]?.model ?? "unknown";
  const result = {
    generatedAt: new Date().toISOString(),
    runtime: rt.info,
    hardware: { cpu, vcpus: cpus().length, ramGB: Math.round(totalmem() / 1e9), threads: process.env.MOSS_EMBEDDING_INTRA_OP_THREADS ?? "default" },
    queries: PROBES.length * rounds,
    embedPlusSearchMs: { p50: stats.p50, p95: stats.p95, p99: stats.p99, max: stats.max },
    shortFragmentsMs: { p50: pct(byLength.short, 0.5), p95: pct(byLength.short, 0.95) },
    longFragmentsMs: { p50: pct(byLength.long, 0.5), p95: pct(byLength.long, 0.95) },
    note: "Wall-clock around retriever.search(): query embedding (moss-minilm, on-device) + multi-index cosine search + metadata decode. Excludes speech-to-text and network.",
  };
  console.log(`Runtime: ${rt.info.runtime}`);
  console.log(`Hardware: ${cpu} × ${cpus().length} vCPU, threads=${result.hardware.threads}`);
  console.log(`Queries: ${result.queries}`);
  console.log(`embed + search  p50 ${stats.p50} ms  p95 ${stats.p95} ms  p99 ${stats.p99} ms  max ${stats.max} ms`);
  console.log(`short fragments p50 ${result.shortFragmentsMs.p50.toFixed(2)} ms  p95 ${result.shortFragmentsMs.p95.toFixed(2)} ms`);
  console.log(`long fragments  p50 ${result.longFragmentsMs.p50.toFixed(2)} ms  p95 ${result.longFragmentsMs.p95.toFixed(2)} ms`);
  const out = path.join(process.cwd(), "docs", "eval");
  mkdirSync(out, { recursive: true });
  writeFileSync(path.join(out, "latency.json"), JSON.stringify(result, null, 2));
  console.log(`Wrote ${path.join(out, "latency.json")}`);
  await rt.client?.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
