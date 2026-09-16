import { NextResponse } from "next/server";
import { FAMILY_INFO } from "@/lib/data/families";
import { runtimeForRequest, safeMossError } from "@/lib/moss/visitor";

export const dynamic = "force-dynamic";

/** GET /api/playbook?q=...  → live semantic search over the playbook (Moss, in-process). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const k = Number(url.searchParams.get("k") ?? 8);
  if (q.length > 2000 || !Number.isInteger(k) || k < 1 || k > 20) {
    return NextResponse.json({ error: "Use a query up to 2,000 characters and k from 1 to 20." }, { status: 400 });
  }
  try {
  const rt = await runtimeForRequest(req);
  if (!q) {
    const families = Object.values(FAMILY_INFO).map((f) => ({ ...f, count: rt.playbook.filter((d) => d.family === f.id).length }));
    return NextResponse.json({ docCount: rt.playbook.length, families, runtime: rt.info }, { headers: { "Cache-Control": "private, no-store" } });
  }
  const res = await rt.retriever.search(q, { topK: k });
  return NextResponse.json({ q, matches: res.matches, engineMs: res.engineMs, wallMs: res.wallMs, runtime: rt.info.mode }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return NextResponse.json({ error: safeMossError(error) }, { status: 503, headers: { "Cache-Control": "private, no-store" } }); }
}
