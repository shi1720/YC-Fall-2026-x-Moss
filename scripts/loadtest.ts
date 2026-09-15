/**
 * Load test: N concurrent simulated calls over WebSocket against a running server.
 *   npm run eval:load -- --calls 100 --url ws://localhost:3311/ws
 * Reports per-fragment analysis latency (server-reported) and end-to-end round-trip
 * percentiles, plus throughput. Writes docs/eval/load.json.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { cpus } from "node:os";
import WebSocket from "ws";

const args = process.argv.slice(2);
const opt = (k: string, d: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const CALLS = Number(opt("calls", "100"));
const URL = opt("url", "ws://localhost:3311/ws");
const TURNS = Number(opt("turns", "12"));
/** Gap between turns per call, ms (a real conversation is ~2.5–3.5 s per turn). */
const PACE = Number(opt("pace", "3000"));

const scenarios = ["digital-arrest", "bank-otp", "tech-support", "benign-bank", "benign-courier", "investment-group"].map((id) =>
  JSON.parse(readFileSync(path.join("data", "transcripts", `${id}.json`), "utf8")) as { turns: Array<{ speaker: string; text: string }> },
);

const pct = (a: number[], p: number) => (a.length ? [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(p * a.length))] : 0);

async function runCall(i: number, rtt: number[], server: number[]) {
  const sc = scenarios[i % scenarios.length];
  const ws = new WebSocket(URL);
  await new Promise<void>((res, rej) => { ws.once("open", () => res()); ws.once("error", rej); });
  const pending = new Map<string, number>();
  let done = 0;
  const finished = new Promise<void>((res) => {
    ws.on("message", (m) => {
      const d = JSON.parse(m.toString());
      if (d.type === "error") errors.push(d.message);
      if (d.type === "analysis" && d.analysis.utterance.final) {
        const sent = pending.get(d.analysis.utterance.text);
        if (sent !== undefined) { rtt.push(performance.now() - sent); pending.delete(d.analysis.utterance.text); }
        server.push(d.analysis.latency.totalMs);
        if (++done >= TURNS) res();
      }
    });
  });
  ws.send(JSON.stringify({ type: "call.start", mode: "simulation", region: "IN" }));
  await new Promise((r) => setTimeout(r, Math.random() * PACE)); // calls start at random phases
  for (let t = 0; t < TURNS; t++) {
    const turn = sc.turns[t % sc.turns.length];
    pending.set(turn.text, performance.now());
    ws.send(JSON.stringify({ type: "utterance", text: turn.text, speaker: turn.speaker, final: true, t: t * PACE }));
    await new Promise((r) => setTimeout(r, PACE * (0.8 + Math.random() * 0.4)));
  }
  await Promise.race([finished, new Promise((r) => setTimeout(r, 30000))]);
  ws.send(JSON.stringify({ type: "call.end" }));
  await new Promise((r) => setTimeout(r, 100));
  ws.close();
}

const errors: string[] = [];
async function main() {
  const rtt: number[] = [], server: number[] = [];
  const t0 = performance.now();
  await Promise.all(Array.from({ length: CALLS }, (_, i) => runCall(i, rtt, server)));
  const elapsed = (performance.now() - t0) / 1000;
  const result = {
    generatedAt: new Date().toISOString(),
    concurrentCalls: CALLS,
    fragmentsPerCall: TURNS,
    paceMs: PACE,
    errors: errors.length,
    missingAnalyses: CALLS * TURNS - server.length,
    fragmentsAnalysed: server.length,
    elapsedSeconds: Number(elapsed.toFixed(1)),
    fragmentsPerSecond: Number((server.length / elapsed).toFixed(1)),
    serverAnalysisMs: { p50: pct(server, 0.5), p95: pct(server, 0.95), p99: pct(server, 0.99), max: Math.max(...server) },
    roundTripMs: { p50: Number(pct(rtt, 0.5).toFixed(1)), p95: Number(pct(rtt, 0.95).toFixed(1)), p99: Number(pct(rtt, 0.99).toFixed(1)) },
    hardware: { cpu: cpus()[0]?.model ?? "unknown", vcpus: cpus().length },
    note: "Client and server on the same host. Each call sends one fragment every ~paceMs (conversational). Round-trip = WebSocket + JSON + queueing behind other calls' fragments; server analysis = retrieval + scoring for one fragment, including time queued for the process's embedding executor.",
  };
  console.log(JSON.stringify(result, null, 2));
  mkdirSync("docs/eval", { recursive: true });
  writeFileSync("docs/eval/load.json", JSON.stringify(result, null, 2));
}
main().catch((e) => { console.error(e); process.exit(1); });
