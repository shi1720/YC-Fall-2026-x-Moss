// Generates docs/deck/Raksha-Pitch.pptx. Run from a folder with pptxgenjs, react-icons, react, react-dom and sharp installed:
//   node docs/deck/build-deck.js

const pptxgen = require("pptxgenjs");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const sharp = require("sharp");
const Lu = require("react-icons/lu");
const fs = require("fs");
const path = require("path");

const REPO = "/home/user/YC-Fall-2026-x-Moss";
const OUT = path.join(REPO, "docs/deck/Raksha-Pitch.pptx");
const C = { ink: "06080F", ink2: "0B0F1A", surface: "0F1523", surface2: "151C2E", text: "E8EBF3", muted: "8F97AD", faint: "5B637A", saffron: "F5A524", saffron2: "FFC75F", moss: "34D399", moss2: "6EE7B7", danger: "EF4444", danger2: "FF6B6B", white: "FFFFFF", line: "26304A" };
const H = "Cambria";
const B = "Calibri";

async function icon(name, color, size = 256) {
  const Cmp = Lu[name];
  const svg = renderToStaticMarkup(React.createElement(Cmp, { color: "#" + color, size }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pres.author = "Shivam Gupta";
  pres.title = "Raksha — the real-time scam-call shield";

  const icons = {};
  for (const [k, n, c] of [
    ["shield", "LuShieldAlert", C.saffron], ["phone", "LuPhoneCall", C.saffron], ["gauge", "LuGauge", C.moss], ["ear", "LuEar", C.saffron],
    ["users", "LuUsers", C.saffron], ["sparkles", "LuSparkles", C.moss], ["lock", "LuLock", C.moss], ["refresh", "LuRefreshCw", C.moss],
    ["layers", "LuLayers", C.moss], ["brain", "LuBrainCircuit", C.saffron], ["bank", "LuLandmark", C.saffron], ["radio", "LuRadioTower", C.saffron],
    ["heart", "LuHeartHandshake", C.saffron], ["check", "LuCircleCheck", C.moss], ["x", "LuCircleX", C.danger], ["flask", "LuFlaskConical", C.moss],
    ["map", "LuMap", C.saffron], ["quote", "LuMessageSquareQuote", C.saffron],
  ]) icons[k] = await icon(n, c);

  const base = (slide, dark = true) => {
    slide.background = { color: dark ? C.ink : C.white };
    slide.addText("Raksha", { x: 0.5, y: 7.0, w: 3, h: 0.3, fontFace: B, fontSize: 10, color: C.faint, isTextBox: true, margin: 0 });
    slide.addText("YC Fall 2026 × Moss · Zero Latency Builder Sprint", { x: 8.3, y: 7.0, w: 4.55, h: 0.3, fontFace: B, fontSize: 10, color: C.faint, align: "right", isTextBox: true, margin: 0 });
  };
  const title = (slide, text, opts = {}) => slide.addText(text, { x: 0.6, y: 0.45, w: 12.1, h: 1.0, fontFace: H, fontSize: opts.size ?? 36, color: C.text, bold: false, isTextBox: true, margin: 0, valign: "top", ...opts });
  const kicker = (slide, text, color = C.saffron) => slide.addText(text.toUpperCase(), { x: 0.6, y: 0.2, w: 8, h: 0.28, fontFace: B, fontSize: 10, color, charSpacing: 3, isTextBox: true, margin: 0, bold: true });
  const card = (slide, x, y, w, h, opts = {}) => slide.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.14, fill: { color: opts.fill ?? C.surface }, line: { color: opts.line ?? C.line, width: 0.75 } });
  const iconCircle = (slide, key, x, y, d = 0.52) => {
    slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: C.surface2 }, line: { color: C.line, width: 0.5 } });
    slide.addImage({ data: icons[key], x: x + d * 0.24, y: y + d * 0.24, w: d * 0.52, h: d * 0.52 });
  };

  // ---------- 1. Title ----------
  {
    const s = pres.addSlide();
    s.background = { color: C.ink };
    s.addShape(pres.ShapeType.ellipse, { x: 8.2, y: -2.2, w: 8, h: 8, fill: { color: "1A1608", transparency: 20 }, line: { color: C.ink, width: 0 } });
    s.addImage({ path: path.join(REPO, "docs/deck/assets/logo.png"), x: 0.7, y: 0.75, w: 0.9, h: 0.9 });
    s.addText("Raksha", { x: 1.75, y: 0.8, w: 5, h: 0.8, fontFace: H, fontSize: 34, color: C.text, isTextBox: true, margin: 0, valign: "middle" });
    s.addText([
      { text: "Every scam follows a script.", options: { color: C.text, breakLine: true } },
      { text: "Now your phone knows the script.", options: { color: C.saffron2 } },
    ], { x: 0.7, y: 2.1, w: 12, h: 2.4, fontFace: H, fontSize: 44, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.05 });
    s.addText("The real-time scam-call shield. Script recognition in about 10 ms during a live call, powered by Moss. It interrupts before the OTP leaves your mouth, tells you what to say, and alerts someone you trust.", { x: 0.7, y: 4.75, w: 9.2, h: 1.1, fontFace: B, fontSize: 17, color: C.muted, isTextBox: true, margin: 0 });
    s.addText("Shivam Gupta · with Claude  ·  github.com/shi1720/YC-Fall-2026-x-Moss", { x: 0.7, y: 6.3, w: 11, h: 0.4, fontFace: B, fontSize: 13, color: C.faint, isTextBox: true, margin: 0 });
    s.addText("YC Fall 2026 × Moss · Zero Latency Builder Sprint · Real-Time Voice & Conversational AI", { x: 0.7, y: 6.65, w: 11, h: 0.35, fontFace: B, fontSize: 11, color: C.faint, isTextBox: true, margin: 0 });
    s.addNotes("Open with the phone ringing. Raksha means 'protection' — the thread on Raksha Bandhan. The product is that thread for a parent's phone.");
  }

  // ---------- 2. Problem: stats ----------
  {
    const s = pres.addSlide(); base(s);
    kicker(s, "The problem");
    title(s, "Scams are conversations with a script. Nobody protects people during the conversation.", { size: 30, h: 1.3 });
    const stats = [
      ["₹22,845 cr", "reported cyber-fraud losses in India, 2024 — 10× the 2022 figure", "MHA, Lok Sabha Q.432"],
      ["₹1,900 cr", "taken by 'digital arrest' scams from 1.23 lakh people in 2024 (+465%)", "MHA · Supreme Court suo motu, 2025"],
      ["41%", "of $10k+ losses by older adults in the US began with a phone call", "FTC Data Spotlight, 2025"],
      ["$25.6M", "wired by one employee to a deepfaked CFO on a video call", "Arup, Hong Kong, 2024"],
    ];
    stats.forEach(([n, d, src], i) => {
      const x = 0.6 + i * 3.08, y = 2.2;
      card(s, x, y, 2.9, 3.9);
      s.addText(n, { x: x + 0.25, y: y + 0.3, w: 2.5, h: 1.0, fontFace: H, fontSize: n.length > 8 ? 30 : 38, color: C.saffron2, isTextBox: true, margin: 0, valign: "middle" });
      s.addText(d, { x: x + 0.25, y: y + 1.45, w: 2.45, h: 1.6, fontFace: B, fontSize: 14, color: C.text, isTextBox: true, margin: 0 });
      s.addText(src, { x: x + 0.25, y: y + 3.25, w: 2.45, h: 0.5, fontFace: B, fontSize: 10, color: C.faint, isTextBox: true, margin: 0 });
    });
    s.addText("Every one of these calls followed the same arc:  authority → fear → secrecy → the ask.", { x: 0.6, y: 6.35, w: 12, h: 0.45, fontFace: B, fontSize: 15, color: C.muted, italic: true, isTextBox: true, margin: 0 });
    s.addNotes("The numbers are sourced in docs/research/market-facts.md. The point: the losses are enormous, growing, and concentrated on the elderly and on phone calls.");
  }

  // ---------- 3. Why existing protection fails ----------
  {
    const s = pres.addSlide(); base(s);
    kicker(s, "The gap");
    title(s, "Caller-ID tells you who is calling. Nobody tells you what they are doing to you.", { size: 30, h: 1.3 });
    const rows = [
      ["Truecaller · Airtel · Jio · iOS 26", "Number reputation", "Crews rotate numbers daily. The script never changes.", "x"],
      ["Truecaller AI Call Scanner", "Synthetic-voice detection", "Most scammers are humans reading a script.", "x"],
      ["Google Pixel Scam Detection", "On-device content analysis", "Pixel 9+ only — under 1% of Indian phones.", "x"],
      ["Hiya AI Phone", "Cloud content analysis", "US only, $9.99/month, cloud round-trip per fragment.", "x"],
      ["Raksha", "Script-level detection + intervention", "Any phone. In-process retrieval. Says what to do. Alerts family.", "check"],
    ];
    rows.forEach((r, i) => {
      const y = 2.15 + i * 0.86;
      const last = i === rows.length - 1;
      card(s, 0.6, y, 12.1, 0.74, last ? { fill: "1A1608", line: C.saffron } : {});
      s.addImage({ data: icons[r[3]], x: 0.8, y: y + 0.2, w: 0.34, h: 0.34 });
      s.addText(r[0], { x: 1.3, y, w: 3.4, h: 0.74, fontFace: B, fontSize: 14, bold: true, color: C.text, isTextBox: true, margin: 0, valign: "middle" });
      s.addText(r[1], { x: 4.8, y, w: 3.1, h: 0.74, fontFace: B, fontSize: 13, color: last ? C.saffron2 : C.muted, isTextBox: true, margin: 0, valign: "middle" });
      s.addText(r[2], { x: 8.0, y, w: 4.5, h: 0.74, fontFace: B, fontSize: 13, color: last ? C.text : C.muted, isTextBox: true, margin: 0, valign: "middle" });
    });
    s.addNotes("The whitespace: multi-OEM, script-level detection with an intervention step. Only two products analyse content; neither reaches the Indian mass market.");
  }

  // ---------- 4. Meet Raksha (screenshot) ----------
  {
    const s = pres.addSlide(); base(s);
    kicker(s, "The product");
    title(s, "Meet Raksha. It listens with you, recognises the script, and steps in.", { size: 30, h: 1.2 });
    s.addImage({ path: path.join(REPO, "docs/screenshots/shield-intervention.png"), x: 0.6, y: 1.85, w: 7.6, h: 4.75, rounding: true });
    const pts = [
      ["ear", "Every fragment, even mid-sentence", "Speech becomes text on the device; each fragment is a query."],
      ["gauge", "Recognised in ≈ 10 ms", "Matched against 409 real scam lines in-process with Moss, including on-device embedding. No vector DB, no round-trip."],
      ["quote", "One sentence to say", "It names the script, gives the exact words to end the call, and speaks them aloud."],
    ];
    pts.forEach(([ic, h, d], i) => {
      const y = 1.95 + i * 1.55;
      iconCircle(s, ic, 8.55, y);
      s.addText(h, { x: 9.25, y: y - 0.02, w: 3.6, h: 0.45, fontFace: B, fontSize: 15, bold: true, color: C.text, isTextBox: true, margin: 0 });
      s.addText(d, { x: 9.25, y: y + 0.42, w: 3.6, h: 0.95, fontFace: B, fontSize: 12.5, color: C.muted, isTextBox: true, margin: 0 });
    });
    s.addNotes("Live demo cue: /shield?scenario=digital-arrest, voices on. The overlay is the emotional peak.");
  }

  // ---------- 5. How it works: fast + slow path ----------
  {
    const s = pres.addSlide(); base(s);
    kicker(s, "How it works", C.moss);
    title(s, "A fast path that never waits for the cloud. A slow path that knows what to say.", { size: 30, h: 1.2 });
    // fast
    card(s, 0.6, 1.9, 7.3, 4.75, { line: C.moss });
    s.addText("FAST PATH · EVERY FRAGMENT · ≈ 10 MS", { x: 0.85, y: 2.05, w: 6.8, h: 0.3, fontFace: B, fontSize: 10, bold: true, color: C.moss, charSpacing: 2, isTextBox: true, margin: 0 });
    const fast = [
      "Moss runtime, in-process: the playbook index is loaded at boot and queried with raw cosine scores (alpha 1.0, top-6).",
      "Cosine → calibrated confidence. Benign look-alikes in the same index out-vote tactic lines (“we will never ask for your OTP” stays quiet).",
      "Speaker-aware: the person's own words only ever count as compliance.",
      "Noisy-OR over 21 persuasion tactics; evidence persists for the whole call.",
      "Rule 1 — pressure + ask (the triad) ⇒ DANGER.   Rule 2 — victim about to comply ⇒ intervene now.",
    ];
    s.addText(fast.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < fast.length - 1, paraSpaceAfter: 8 } })), { x: 0.85, y: 2.45, w: 6.8, h: 4.0, fontFace: B, fontSize: 15, color: C.text, isTextBox: true, margin: 0, valign: "top" });
    // slow
    card(s, 8.2, 1.9, 4.5, 4.75, { line: C.saffron });
    s.addText("SLOW PATH · ASYNC · ON TRANSITIONS", { x: 8.45, y: 2.05, w: 4.0, h: 0.3, fontFace: B, fontSize: 10, bold: true, color: C.saffron, charSpacing: 2, isTextBox: true, margin: 0 });
    const slow = [
      "A 20B model (Groq) returns a JSON contract: verdict · explanation · say this · action.",
      "Only when risk changes, never per fragment: ≈ 300–800 ms, off the critical path.",
      "A confident “benign” verdict can veto CAUTION. It can never override DANGER.",
      "Template fallback: the product works with no LLM key at all.",
    ];
    s.addText(slow.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < slow.length - 1, paraSpaceAfter: 8 } })), { x: 8.45, y: 2.45, w: 4.0, h: 4.0, fontFace: B, fontSize: 13.5, color: C.text, isTextBox: true, margin: 0, valign: "top" });
    s.addNotes("Latency changes what you can build: when retrieval is free and instant you check every fragment instead of choosing which sentences to check.");
  }

  // ---------- 6. Architecture diagram ----------
  {
    const s = pres.addSlide(); base(s);
    kicker(s, "Architecture", C.moss);
    title(s, "One Node process: Next.js, WebSockets and the Moss runtime share one memory.", { size: 26, h: 0.9 });
    s.addImage({ path: path.join(REPO, "docs/diagrams/architecture.png"), x: 1.1, y: 1.4, w: 11.1, h: 5.55 });
    s.addNotes("The diagram is in the repo at docs/diagrams/architecture.png with a full write-up in docs/ARCHITECTURE.md.");
  }

  // ---------- 7. Moss in the loop ----------
  {
    const s = pres.addSlide(); base(s);
    kicker(s, "Moss in the loop", C.moss);
    title(s, "Four ways the retrieval layer does real work here.", { size: 32, h: 1.0 });
    const cards = [
      ["gauge", "Loaded index, in-process query", "raksha-playbook (409 lines) loaded at boot. Every fragment embedded and searched locally via queryMultiIndex (raw cosine, calibrated). The entire hot path ≈ 10 ms, unmetered."],
      ["sparkles", "A session per call", "client.session() opens a local index of the call's own turns. The guardian's “what did they ask for?” is a semantic query over it. Never pushed — memory dies with the call."],
      ["refresh", "Auto-refresh hot-swap", "Reported caller lines are upserted into raksha-intel. Every running shield polls and hot-swaps the new version in with zero query downtime. No redeploy."],
      ["layers", "Multi-index, one top-K", "queryMultiIndex searches the curated playbook and community intel together. Metadata (family, tactics, severity, kind, stage) lets the engine reason over tactics, not text."],
    ];
    cards.forEach(([ic, h, d], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 0.6 + col * 6.15, y = 1.75 + row * 2.55;
      card(s, x, y, 5.95, 2.35);
      iconCircle(s, ic, x + 0.25, y + 0.3);
      s.addText(h, { x: x + 0.95, y: y + 0.3, w: 4.8, h: 0.5, fontFace: B, fontSize: 16, bold: true, color: C.text, isTextBox: true, margin: 0, valign: "middle" });
      s.addText(d, { x: x + 0.25, y: y + 0.95, w: 5.45, h: 1.3, fontFace: B, fontSize: 12.5, color: C.muted, isTextBox: true, margin: 0 });
    });
    s.addNotes("Deliberately not used: pushIndex (privacy) and the browser SDK on the hot path (it cannot yet use a delegated authenticator; the retriever interface is ready for it).");
  }

  // ---------- 8. Latency is the product (chart) ----------
  {
    const s = pres.addSlide(); base(s);
    kicker(s, "Speed & latency", C.moss);
    title(s, "A scam is won or lost inside one sentence.", { size: 34, h: 0.9 });
    s.addText("“Read me the six digits, quickly” takes ~2.5 s to say. How much of that sentence is gone before the shield has an answer?", { x: 0.6, y: 1.35, w: 12, h: 0.5, fontFace: B, fontSize: 15, color: C.muted, isTextBox: true, margin: 0 });
    s.addChart(pres.ChartType.bar, [{ name: "Latency (ms)", labels: ["Moss, in-process (Raksha)", "Cloud vector DB round-trip", "LLM classifier per sentence", "One spoken sentence"], values: [14, 350, 900, 2500] }], {
      x: 0.6, y: 2.0, w: 7.8, h: 4.6, barDir: "bar",
      chartColors: [C.moss, C.saffron, C.danger, "3A4460"],
      showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.text, dataLabelFontSize: 12, dataLabelFormatCode: "#,##0 \"ms\"",
      catAxisLabelColor: C.text, catAxisLabelFontSize: 12, valAxisLabelColor: C.faint, valAxisLabelFontSize: 10,
      valGridLine: { color: "1F2740", size: 0.5 }, catGridLine: { style: "none" }, showLegend: false, valAxisMaxVal: 3000,
      plotArea: { fill: { color: C.ink } }, chartArea: { fill: { color: C.ink } },
    });
    const facts = [
      ["≈ 1%", "of the sentence consumed by Moss retrieval (p95 ≈ 27 ms measured)"],
      ["14%", "consumed by a 350 ms cloud vector-DB round-trip"],
      ["36%", "consumed by a 900 ms LLM classifier — the OTP is already out"],
      ["₹0", "marginal cost per fragment: local Moss queries are unmetered"],
    ];
    facts.forEach(([n, d], i) => {
      const y = 2.0 + i * 1.15;
      card(s, 8.7, y, 4.0, 1.0);
      s.addText(n, { x: 8.9, y, w: 1.4, h: 1.0, fontFace: H, fontSize: 24, color: i === 0 || i === 3 ? C.moss2 : C.saffron2, isTextBox: true, margin: 0, valign: "middle" });
      s.addText(d, { x: 10.3, y, w: 2.3, h: 1.0, fontFace: B, fontSize: 11.5, color: C.muted, isTextBox: true, margin: 0, valign: "middle" });
    });
    s.addNotes("Reference numbers: Moss published benchmark (100k docs, p95 4.3 ms) and typical hosted vector DB p50 of 350–600 ms. Our own numbers are measured live on the Latency lab page and recorded in docs/eval/REPORT.md.");
  }

  // ---------- 9. Guardian / multiplayer ----------
  {
    const s = pres.addSlide(); base(s);
    kicker(s, "The circle of trust");
    title(s, "Scams isolate. Raksha breaks the isolation.", { size: 34, h: 0.9 });
    s.addImage({ path: path.join(REPO, "docs/deck/assets/guardian-crop.png"), x: 5.4, y: 1.55, w: 7.3, h: 5.07, rounding: true });
    const pts = [
      ["users", "A family code, no accounts", "Links a parent's phone to a daughter's dashboard. Risk, transcript highlights and interventions, live."],
      ["quote", "Speak through the shield", "Her words are shown and read aloud on the phone — over the scammer's voice."],
      ["brain", "Ask the call", "“What money did they ask for?” — answered from the call's Moss session in milliseconds."],
      ["lock", "Human and agent, one session", "Multiplayer by design: the person, the shield and the guardian share the same live context."],
    ];
    pts.forEach(([ic, h, d], i) => {
      const y = 1.6 + i * 1.28;
      iconCircle(s, ic, 0.6, y, 0.46);
      s.addText(h, { x: 1.2, y: y - 0.03, w: 4.0, h: 0.4, fontFace: B, fontSize: 14.5, bold: true, color: C.text, isTextBox: true, margin: 0 });
      s.addText(d, { x: 1.2, y: y + 0.38, w: 4.0, h: 0.85, fontFace: B, fontSize: 12, color: C.muted, isTextBox: true, margin: 0 });
    });
    s.addNotes("Demo cue: second window on /guardian?code=…; send 'Mummy, hang up' — it is spoken on the shield.");
  }

  // ---------- 10. Evidence ----------
  {
    const s = pres.addSlide(); base(s);
    kicker(s, "Evidence", C.moss);
    title(s, "Measured, not claimed.", { size: 36, h: 0.9 });
    s.addText("Eighteen full call transcripts replayed through the real Moss runtime — ten scams, eight genuine calls — plus a live benchmark page anyone can run against the deployed instance.", { x: 0.6, y: 1.35, w: 12, h: 0.6, fontFace: B, fontSize: 15, color: C.muted, isTextBox: true, margin: 0 });
    const ev = JSON.parse(fs.readFileSync(path.join(REPO, "docs/eval/results.json"), "utf8")).summary;
    const pct = (n) => Math.round(n * 100) + "%";
    const tiles = [
      [pct(ev.scamDetectionRate), "scam scenarios caught (reached DANGER)", C.moss2],
      [pct(ev.falsePositiveRate), "false alarms on genuine calls", C.moss2],
      [pct(ev.familyAccuracy), "scripts named correctly", C.saffron2],
      [ev.meanDangerTurn.toFixed(1), "mean turn at which DANGER fired", C.saffron2],
      [ev.latency.p50 < 1 ? (ev.latency.p50 * 1000).toFixed(0) + " µs" : ev.latency.p50.toFixed(1) + " ms", "retrieval p50, embed + search", C.moss2],
      [ev.latency.p95 < 1 ? (ev.latency.p95 * 1000).toFixed(0) + " µs" : ev.latency.p95.toFixed(1) + " ms", "retrieval p95", C.moss2],
    ];
    tiles.forEach(([n, d, c], i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 0.6 + col * 4.1, y = 2.15 + row * 2.2;
      card(s, x, y, 3.9, 2.0);
      s.addText(n, { x: x + 0.25, y: y + 0.25, w: 3.4, h: 0.9, fontFace: H, fontSize: 40, color: c, isTextBox: true, margin: 0, valign: "middle" });
      s.addText(d, { x: x + 0.25, y: y + 1.2, w: 3.4, h: 0.6, fontFace: B, fontSize: 13, color: C.muted, isTextBox: true, margin: 0 });
    });
    s.addText("Full turn-by-turn report: docs/eval/REPORT.md  ·  runtime: " + (ev.runtime.mode === "moss" ? "Moss, in-process" : "offline fallback (rerun with Moss credentials)"), { x: 0.6, y: 6.55, w: 12, h: 0.35, fontFace: B, fontSize: 11, color: C.faint, isTextBox: true, margin: 0 });
    s.addNotes("These tiles are generated from docs/eval/results.json at deck build time.");
  }

  // ---------- 11. Business ----------
  {
    const s = pres.addSlide(); base(s);
    kicker(s, "Business");
    title(s, "Who pays, and why the economics work.", { size: 34, h: 0.9 });
    const buyers = [
      ["bank", "Banks & payment apps", "From 1 Jan 2027 RBI makes banks compensate scam-induced losses; UK banks already reimburse £354M/yr. A per-customer licence (₹5–15/month) that stops even a fraction of transfers beats any refund — and gives the bank a real-time “transfer hold” signal."],
      ["radio", "Telcos & OEMs", "A “protected line” add-on (₹49–99/month) on any Android phone, not just a Pixel. DoT's kill-switch ambitions need exactly this signal."],
      ["heart", "Families", "A ₹99/month circle that protects parents — the price band where family-safety apps already convert (Life360: 2.8M paying circles)."],
    ];
    buyers.forEach(([ic, h, d], i) => {
      const y = 1.55 + i * 1.5;
      card(s, 0.6, y, 7.9, 1.35);
      iconCircle(s, ic, 0.85, y + 0.4);
      s.addText(h, { x: 1.6, y: y + 0.15, w: 6.7, h: 0.4, fontFace: B, fontSize: 15, bold: true, color: C.text, isTextBox: true, margin: 0 });
      s.addText(d, { x: 1.6, y: y + 0.52, w: 6.7, h: 0.8, fontFace: B, fontSize: 11.5, color: C.muted, isTextBox: true, margin: 0 });
    });
    card(s, 8.8, 1.55, 3.9, 4.35, { fill: "1A1608", line: C.saffron });
    s.addText("UNIT COST PER PROTECTED CALL", { x: 9.05, y: 1.75, w: 3.5, h: 0.3, fontFace: B, fontSize: 10, bold: true, color: C.saffron, charSpacing: 2, isTextBox: true, margin: 0 });
    s.addText("≈ ₹0.02", { x: 9.05, y: 2.1, w: 3.5, h: 0.9, fontFace: H, fontSize: 44, color: C.saffron2, isTextBox: true, margin: 0, valign: "middle" });
    const cost = ["Moss local queries: ₹0 (unmetered)", "STT on device: ₹0", "LLM coach, ≤ 6 calls on a 20B model: ≈ ₹0.02", "One small container serves thousands of concurrent calls"];
    s.addText(cost.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < cost.length - 1, paraSpaceAfter: 6 } })), { x: 9.05, y: 3.1, w: 3.5, h: 1.9, fontFace: B, fontSize: 12, color: C.text, isTextBox: true, margin: 0, valign: "top" });
    s.addText("One prevented ₹1.5-lakh digital-arrest transfer pays for ~7 million protected calls.", { x: 9.05, y: 5.05, w: 3.5, h: 0.8, fontFace: B, fontSize: 11.5, italic: true, color: C.saffron2, isTextBox: true, margin: 0 });
    s.addText("“Truecaller tells you who is calling. Raksha tells you what they are doing to you — and what to say back.”", { x: 0.6, y: 6.15, w: 12, h: 0.6, fontFace: H, fontSize: 16, color: C.text, italic: true, isTextBox: true, margin: 0 });
    s.addNotes("The liability shift is the wedge: banks now have a P&L reason to buy prevention that fires before the transfer.");
  }

  // ---------- 12. Roadmap + close ----------
  {
    const s = pres.addSlide(); base(s);
    kicker(s, "What's next");
    title(s, "Every phone, not just a Pixel.", { size: 36, h: 0.9 });
    const steps = [
      ["Now", "Web reference implementation, deployed. 18 scenarios, live mic, recordings, guardian, community intel, eval."],
      ["+4 weeks", "Android app with in-call audio; Hindi / Tamil / Telugu playbooks; bank “transfer hold” webhook."],
      ["+3 months", "Hot path fully on-device with Moss mobile/browser SDKs; deepfake-voice liveness fused into the risk model; pilot with one bank and one senior-living network."],
      ["+6 months", "Federated playbook across partners; one-tap 1930 / NCRP reporting; regional script variants."],
    ];
    steps.forEach(([t, d], i) => {
      const x = 0.6 + i * 3.08;
      card(s, x, 1.55, 2.9, 3.0);
      s.addText(t, { x: x + 0.25, y: 1.75, w: 2.4, h: 0.5, fontFace: H, fontSize: 22, color: C.saffron2, isTextBox: true, margin: 0 });
      s.addText(d, { x: x + 0.25, y: 2.35, w: 2.45, h: 2.0, fontFace: B, fontSize: 12.5, color: C.text, isTextBox: true, margin: 0 });
    });
    card(s, 0.6, 4.95, 12.1, 1.75, { fill: "1A1608", line: C.saffron });
    s.addImage({ path: path.join(REPO, "docs/deck/assets/logo.png"), x: 0.9, y: 5.35, w: 0.95, h: 0.95 });
    s.addText("Every scam follows a script. Now the phone knows the script.", { x: 2.1, y: 5.1, w: 10.3, h: 0.7, fontFace: H, fontSize: 22, color: C.text, isTextBox: true, margin: 0, valign: "middle" });
    s.addText("github.com/shi1720/YC-Fall-2026-x-Moss  ·  Shivam Gupta, with Claude  ·  retrieval by Moss", { x: 2.1, y: 5.85, w: 10.3, h: 0.5, fontFace: B, fontSize: 14, color: C.muted, isTextBox: true, margin: 0 });
    s.addNotes("Close on the tagline. Thank Moss and the organisers.");
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await pres.writeFile({ fileName: OUT });
  console.log("wrote", OUT);
})();
