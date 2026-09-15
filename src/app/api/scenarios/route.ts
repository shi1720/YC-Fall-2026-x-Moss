import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET /api/scenarios → index; GET /api/scenarios?id=digital-arrest → full transcript. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  const dir = path.join(process.cwd(), "data", "transcripts");
  if (!id) return NextResponse.json(JSON.parse(readFileSync(path.join(dir, "index.json"), "utf8")));
  if (!/^[a-z0-9-]+$/.test(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  try {
    return NextResponse.json(JSON.parse(readFileSync(path.join(dir, `${id}.json`), "utf8")));
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
