import "dotenv/config";
import { getMossRuntime } from "../src/lib/moss/runtime";
const qs = ["Sir, this is Inspector Sharma from Mumbai Cyber Crime, your Aadhaar is linked to a money laundering case.", "Your SBI account will be blocked in two hours unless you verify with the OTP.", "Please install AnyDesk so our engineer can fix the virus on your computer.", "Your appointment with Dr Mehta is confirmed for Thursday at 4:30."];
const rt = await getMossRuntime();
const pct = (a: number[], p: number) => [...a].sort((x, y) => x - y)[Math.floor(p * a.length)].toFixed(1);
async function burst(label: string, n: number, fn: (i: number) => Promise<number>) {
  const t0 = performance.now();
  const lat = await Promise.all(Array.from({ length: n }, (_, i) => fn(i)));
  const el = performance.now() - t0;
  console.log(`${label.padEnd(34)} n=${n} total=${el.toFixed(0)}ms thr=${(n / (el / 1000)).toFixed(1)}/s p50=${pct(lat, 0.5)} p95=${pct(lat, 0.95)}`);
}
await burst("search sequential warm", 8, async (i) => { const t = performance.now(); await rt.retriever.search(qs[i % 4]); return performance.now() - t; });
await burst("search concurrent x50", 50, async (i) => { const t = performance.now(); await rt.retriever.search(qs[i % 4]); return performance.now() - t; });
await burst("search concurrent x200", 200, async (i) => { const t = performance.now(); await rt.retriever.search(qs[i % 4]); return performance.now() - t; });
const t1 = performance.now(); const s = await rt.client!.session("raksha-probe-" + Date.now()); console.log("session open", (performance.now() - t1).toFixed(0), "ms");
await burst("session.addDocs sequential x8", 8, async (i) => { const t = performance.now(); await s.addDocs([{ id: "d" + i, text: qs[i % 4] + " " + i }]); return performance.now() - t; });
await burst("session.addDocs concurrent x50", 50, async (i) => { const t = performance.now(); await s.addDocs([{ id: "e" + i, text: qs[i % 4] + " " + i }]); return performance.now() - t; });
await burst("mixed search+addDocs x50", 50, async (i) => { const t = performance.now(); await Promise.all([rt.retriever.search(qs[i % 4]), s.addDocs([{ id: "f" + i, text: qs[i % 4] + " " + i }])]); return performance.now() - t; });
await burst("open 10 sessions concurrently", 10, async (i) => { const t = performance.now(); const x = await rt.client!.session("raksha-probe-" + Date.now() + "-" + i); await x.close(); return performance.now() - t; });
await s.close(); await rt.client!.close();
