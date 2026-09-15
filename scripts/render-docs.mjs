// Renders docs/*.md into styled PDFs in docs/pdf/ using Chromium (Playwright).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { chromium } from "@playwright/test";

const docs = [
  ["docs/PRD.md", "Raksha-PRD.pdf"],
  ["docs/ARCHITECTURE.md", "Raksha-Architecture.pdf"],
  ["docs/VIDEO_SCRIPT.md", "Raksha-Video-Script.pdf"],
  ["docs/eval/REPORT.md", "Raksha-Evaluation-Report.pdf"],
  ["docs/DEVPOST.md", "Raksha-Devpost-Submission.pdf"],
];

const css = `
  @page { size: A4; margin: 18mm 16mm 20mm; }
  body { font-family: Inter, "Segoe UI", Helvetica, Arial, sans-serif; color: #111827; font-size: 10.5pt; line-height: 1.5; }
  h1 { font-size: 24pt; letter-spacing: -0.02em; margin: 0 0 8pt; color: #0b1020; }
  h2 { font-size: 15pt; margin: 20pt 0 6pt; color: #0b1020; border-bottom: 1px solid #e5e7eb; padding-bottom: 3pt; }
  h3 { font-size: 12pt; margin: 14pt 0 4pt; }
  p, li { margin: 0 0 6pt; }
  blockquote { border-left: 3px solid #f5a524; margin: 0 0 8pt; padding: 2pt 10pt; color: #374151; background: #fffaf0; }
  table { border-collapse: collapse; width: 100%; margin: 6pt 0 10pt; font-size: 9.2pt; page-break-inside: auto; }
  th, td { border: 1px solid #e5e7eb; padding: 4pt 6pt; vertical-align: top; text-align: left; }
  th { background: #f3f4f6; }
  tr { page-break-inside: avoid; }
  code { font-family: "JetBrains Mono", Menlo, Consolas, monospace; font-size: 9pt; background: #f3f4f6; padding: 0 3pt; border-radius: 3pt; }
  pre { background: #0b1020; color: #e8ebf3; padding: 8pt 10pt; border-radius: 6pt; font-size: 8.5pt; overflow: hidden; white-space: pre-wrap; }
  pre code { background: none; color: inherit; padding: 0; }
  img { max-width: 100%; border-radius: 6pt; }
  a { color: #b45309; text-decoration: none; }
  hr { border: 0; border-top: 1px solid #e5e7eb; margin: 12pt 0; }
  .footer { position: fixed; bottom: -8mm; font-size: 8pt; color: #6b7280; }
  .mermaid { font-size: 8.5pt; }
`;

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });
mkdirSync("docs/pdf", { recursive: true });
for (const [src, out] of docs) {
  if (!existsSync(src)) continue;
  let md = readFileSync(src, "utf8");
  // Inline images as file URLs and drop Mermaid blocks (rendered as code in PDF).
  const base = path.resolve(path.dirname(src));
  let html = marked.parse(md, { gfm: true });
  html = html.replace(/src="([^"]+)"/g, (m, p) => (p.startsWith("http") ? m : `src="file://${path.resolve(base, p)}"`));
  const page = await browser.newPage();
  await page.setContent(`<html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`, { waitUntil: "load" });
  await page.pdf({
    path: path.join("docs/pdf", out),
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: `<div style="width:100%;font-size:8px;color:#6b7280;padding:0 16mm;display:flex;justify-content:space-between"><span>Raksha — ${path.basename(src)}</span><span class="pageNumber"></span></div>`,
    margin: { top: "18mm", bottom: "20mm", left: "16mm", right: "16mm" },
  });
  await page.close();
  console.log("wrote docs/pdf/" + out);
}
await browser.close();
