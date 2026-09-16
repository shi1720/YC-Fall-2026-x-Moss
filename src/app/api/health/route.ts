import { NextResponse } from "next/server";
import { getCallManager } from "@/lib/engine/calls";
import { llmConfig } from "@/lib/llm/client";
import { runtimeForRequest, mossToken, safeMossError } from "@/lib/moss/visitor";

export const dynamic = "force-dynamic";

const startedAt = Date.now();

export async function GET(req: Request) {
  try {
    const rt = await runtimeForRequest(req);
    const llm = llmConfig();
    const calls = getCallManager();
    return NextResponse.json({
      ok: true,
      service: "raksha",
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      retrieval: rt.info,
      llm: { enabled: llm.enabled, model: llm.enabled ? llm.model : "template", provider: llm.enabled ? llm.baseUrl : null },
      calls: { active: calls.list().filter((c) => !c.endedAt).length },
      latency: mossToken(req) ? (calls.list().filter(c => c.runtimeToken === mossToken(req)).at(-1)?.latency.stats() ?? { count: 0, p50: 0, p95: 0, p99: 0, max: 0, meanRetrieval: 0 }) : calls.global.stats(),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    return NextResponse.json({ ok: false, error: safeMossError(err) }, { status: 503 });
  }
}
