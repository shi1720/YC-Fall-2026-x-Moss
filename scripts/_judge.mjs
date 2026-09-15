import "dotenv/config";
import { readFileSync, appendFileSync, writeFileSync } from "node:fs";
const key = process.env.GROQ_API_KEY;
const out = "/tmp/claude-0/-home-user-YC-Fall-2026-x-Moss/2881a0c2-b091-5f80-bf82-8a9e661e2a78/scratchpad/judge1.md";
writeFileSync(out, "");
const rubric = `Hackathon: YC Fall 2026 x Moss — Zero Latency Builder Sprint. Build production-ready AI applications inspired by YC's Fall 2026 RFS using Moss for sub-10ms semantic search without a traditional vector DB. Judging criteria: (1) Product and User Experience — real problem, compelling experience; (2) Technical Execution — architecture and AI pipeline; (3) Speed and Latency — Moss used effectively for a fast, responsive experience; (4) Demo and Presentation — clearly show what was built and why it matters. Required: architecture diagram, PRD, GitHub repo, deployed link, video demo explaining how Moss contributes. Judge: Deepak Chawla, founder of HiDevs (Bengaluru). Winning entries are unique, have a story, and are commercially viable.`;
const docs = [
  ["README", readFileSync("README.md", "utf8")],
  ["PRD", readFileSync("docs/PRD.md", "utf8")],
  ["ARCHITECTURE", readFileSync("docs/ARCHITECTURE.md", "utf8")],
  ["DEVPOST + VIDEO_SCRIPT", readFileSync("docs/DEVPOST.md", "utf8") + "\n\n" + readFileSync("docs/VIDEO_SCRIPT.md", "utf8")],
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function ask(system, user, max = 2500) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: 0.3, max_tokens: max, reasoning_effort: "low" }) });
    const data = await res.json();
    if (res.ok) return data.choices[0].message.content;
    if (data.error?.code === "rate_limit_exceeded") { await sleep(65000); continue; }
    throw new Error(JSON.stringify(data).slice(0, 300));
  }
  return "(rate limited)";
}
const system = `You are a demanding but fair hackathon judge and startup mentor. Given the rubric and ONE document of a submission, critique it: what is strong, what is weak or unsupported, inconsistencies, and the 5 most valuable concrete edits (which section, what to change, why). Also note anything likely to trigger judge skepticism. Be specific; do not flatter. Markdown, under 500 words.`;
const summaries = [];
for (const [name, text] of docs) {
  const body = text.length > 18000 ? text.slice(0, 18000) + "\n…(truncated)" : text;
  const r = await ask(system, `RUBRIC:\n${rubric}\n\n===== ${name} =====\n${body}`);
  appendFileSync(out, `\n\n# Judge notes — ${name}\n\n${r}\n`);
  summaries.push(`## ${name}\n${r}`);
  await sleep(62000);
}
const final = await ask(`You are the head judge. Given the rubric and the per-document notes, score the submission on each of the 4 criteria (1-10) with a justification, give an overall score, estimate the probability of finishing in the top 5 of ~180 entries, and list the 8 highest-impact improvements across all deliverables, ordered by impact, each as an actionable edit. Markdown, under 700 words.`, `RUBRIC:\n${rubric}\n\nNOTES:\n${summaries.join("\n\n")}`, 3000);
appendFileSync(out, `\n\n# Head judge — overall\n\n${final}\n`);
console.log("done");
