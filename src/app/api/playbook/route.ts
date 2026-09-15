import { NextResponse } from "next/server";
import { FAMILY_INFO } from "@/lib/data/families";
import { getMossRuntime } from "@/lib/moss/runtime";

export const dynamic = "force-dynamic";

/** GET /api/playbook?q=...  → live semantic search over the playbook (Moss, in-process). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const rt = await getMossRuntime();
  if (!q) {
    const families = Object.values(FAMILY_INFO).map((f) => ({ ...f, count: rt.playbook.filter((d) => d.family === f.id).length }));
    return NextResponse.json({ docCount: rt.playbook.length, families, runtime: rt.info });
  }
  const res = await rt.retriever.search(q, { topK: Number(url.searchParams.get("k") ?? 8) });
  return NextResponse.json({ q, matches: res.matches, engineMs: res.engineMs, wallMs: res.wallMs, runtime: rt.info.mode });
}
