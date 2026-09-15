import { NextResponse } from "next/server";
import { getCallManager } from "@/lib/engine/calls";
import { llmConfig } from "@/lib/llm/client";
import { getMossRuntime } from "@/lib/moss/runtime";

export const dynamic = "force-dynamic";

const startedAt = Date.now();

export async function GET() {
  try {
    const rt = await getMossRuntime();
    const llm = llmConfig();
    const calls = getCallManager();
    return NextResponse.json({
      ok: true,
      service: "raksha",
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      retrieval: rt.info,
      llm: { enabled: llm.enabled, model: llm.enabled ? llm.model : "template", provider: llm.enabled ? llm.baseUrl : null },
      calls: { active: calls.list().filter((c) => !c.endedAt).length },
      latency: calls.global.stats(),
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 503 });
  }
}
