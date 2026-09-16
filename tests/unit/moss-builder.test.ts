import { describe, expect, it, vi } from "vitest";
import { loadPlaybookFromDisk } from "@/lib/moss/runtime";
import { toMossDoc } from "@/lib/data/playbook";
const sdk = vi.hoisted(() => ({ createIndex: vi.fn(), getIndex: vi.fn(), getDocs: vi.fn(), loadIndex: vi.fn(), queryMultiIndex: vi.fn(), session: vi.fn(), close: vi.fn() }));
vi.mock("@moss-js/moss", () => ({ MossClient: class { createIndex = sdk.createIndex; getIndex = sdk.getIndex; getDocs = sdk.getDocs; loadIndex = sdk.loadIndex; queryMultiIndex = sdk.queryMultiIndex; session = sdk.session; close = sdk.close; } }));
import { buildVisitorRuntime } from "@/lib/moss/visitor";
const input = { projectId: "demo", projectKey: "secret-test-key", indexName: "personal-index", createIndex: false, consent: true as const };
describe("Moss SDK setup", () => {
  it("loads a verified playbook using the calibrated multi-index query path without mutating it", async () => {
    vi.clearAllMocks();
    sdk.getIndex.mockResolvedValue({ docCount: 409, model: { id: "moss-minilm" } });
    sdk.getDocs.mockResolvedValue(loadPlaybookFromDisk().map(toMossDoc));
    sdk.queryMultiIndex.mockResolvedValue({ docs: [], timeTakenInMs: 1 });
    sdk.session.mockResolvedValue({});
    const phase = vi.fn(), dispose = vi.fn();
    const rt = await buildVisitorRuntime(input, phase, dispose);
    expect(sdk.createIndex).not.toHaveBeenCalled();
    expect(sdk.loadIndex).toHaveBeenCalledWith("personal-index", { autoRefresh: false });
    expect(sdk.queryMultiIndex).toHaveBeenCalledWith(["personal-index"], expect.any(String), { topK: 6, alpha: 1 });
    expect(rt.info.mode).toBe("moss");
    expect(rt.info.source).toBe("visitor");
    expect(rt.info.docCount).toBe(409);
    expect(dispose).toHaveBeenCalledOnce();
  });
  it("creates only when explicitly selected and never overwrites an existing index", async () => {
    vi.clearAllMocks();
    sdk.createIndex.mockRejectedValueOnce(new Error("index already exists"));
    await expect(buildVisitorRuntime({ ...input, createIndex: true }, vi.fn(), vi.fn())).rejects.toThrow("already exists");
    expect(sdk.createIndex).toHaveBeenCalledWith("personal-index", expect.arrayContaining([expect.objectContaining({ id: expect.any(String), metadata: expect.any(Object) })]), { modelId: "moss-minilm" });
    expect(sdk.loadIndex).not.toHaveBeenCalled();
  });
  it("rejects a same-sized index with different contents before it reaches detection", async () => {
    vi.clearAllMocks();
    const docs = loadPlaybookFromDisk().map(toMossDoc);
    docs[0] = { ...docs[0], text: "unrelated confidential material" };
    sdk.getDocs.mockResolvedValue(docs);
    await expect(buildVisitorRuntime(input, vi.fn(), vi.fn())).rejects.toThrow("does not match");
    expect(sdk.loadIndex).not.toHaveBeenCalled();
  });
});
