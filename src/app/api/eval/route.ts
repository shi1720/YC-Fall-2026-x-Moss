import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET /api/eval → the last committed evaluation run (docs/eval/results.json). */
export async function GET() {
  try {
    const raw = readFileSync(path.join(process.cwd(), "docs", "eval", "results.json"), "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "No evaluation results yet. Run `npm run eval`." }, { status: 404 });
  }
}
