import { expect, it, vi } from "vitest";
vi.mock("@/lib/llm/coach", () => ({ summarizeCall: vi.fn(async () => "Done"), coach: vi.fn() }));
import { CallManager } from "@/lib/engine/calls";
import { visitorMoss } from "@/lib/moss/visitor";
import type { MossRuntime } from "@/lib/moss/runtime";

it("pins each call and guardian recall to its own runtime without exposing capabilities in call metadata", async () => {
  const make = () => ({ retriever: { search: vi.fn(async () => ({ matches: [], engineMs: 1, wallMs: 1 })) }, memory: { addDocs: vi.fn(async () => {}), query: vi.fn(async () => ({ docs: [] })), deleteDocs: vi.fn(async () => {}) } }) as unknown as MossRuntime;
  const a = make(), b = make();
  const lookup = vi.spyOn(visitorMoss(), "require").mockImplementation(token => { if (token === "a") return a; if (token === "b") return b; throw new Error("Expired"); });
  const calls = new CallManager();
  try {
    const callA = await calls.start({ mode: "simulation", region: "IN" }, "a");
    const callB = await calls.start({ mode: "simulation", region: "IN" }, "b");
    await calls.analyze(callA.meta.callId, { text: "This is the first private test conversation", speaker: "caller", final: true });
    await calls.analyze(callB.meta.callId, { text: "This is the second private test conversation", speaker: "caller", final: true });
    expect(a.retriever.search).toHaveBeenCalledWith("This is the first private test conversation");
    expect(a.retriever.search).toHaveBeenCalledTimes(1);
    expect(b.retriever.search).toHaveBeenCalledWith("This is the second private test conversation");
    expect(callA.meta).not.toHaveProperty("runtimeToken");
    await calls.ask(callA.meta.callId, "What happened?");
    expect(a.memory?.query).toHaveBeenCalledWith("What happened?", expect.objectContaining({ filter: { field: "callId", condition: { $eq: callA.meta.callId } } }));
    expect(b.memory?.query).not.toHaveBeenCalled();
    await calls.end(callA.meta.callId); await calls.end(callB.meta.callId);
    expect(a.memory?.deleteDocs).toHaveBeenCalled();
    expect(b.memory?.deleteDocs).toHaveBeenCalled();
  } finally { lookup.mockRestore(); }
});
