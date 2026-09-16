import { afterEach, describe, expect, it, vi } from "vitest";
import { VisitorMossStore, mossSettingsSchema, safeMossError, SESSION_MS } from "@/lib/moss/visitor";
import type { MossRuntime } from "@/lib/moss/runtime";
import { MockRetriever } from "@/lib/engine/mockRetriever";
const settings = { projectId: "test-project", projectKey: "secret-test-key", indexName: "raksha-playbook", createIndex: false, consent: true as const };
function runtime(name: string): MossRuntime {
  return { client: null, memory: null, retriever: new MockRetriever([]), playbook: [], info: { mode: "moss", runtime: name, indexes: [name], docCount: 409, model: "moss-minilm", loadedAt: 0, loadMs: 1, version: "test" } };
}
afterEach(() => vi.useRealTimers());
describe("private Moss sessions", () => {
  it("requires explicit consent and bounds credentials and index names", () => {
    expect(mossSettingsSchema.safeParse(settings).success).toBe(true);
    for (const changes of [{ consent: false }, { projectKey: "short" }, { projectId: "https://host" }, { indexName: "../private" }, { projectKey: "x".repeat(513) }, { endpoint: "https://attacker" }]) expect(mossSettingsSchema.safeParse({ ...settings, ...changes }).success).toBe(false);
  });
  it("keeps projects isolated and exposes no credentials in session status", async () => {
    const close = vi.fn(async () => {});
    const store = new VisitorMossStore(async (input, phase, dispose) => { phase("loading"); dispose(close); return runtime(input.projectId); });
    const a = store.start(settings);
    const b = store.start({ ...settings, projectId: "second-project" });
    await vi.waitFor(() => expect(store.status(a).status).toBe("ready"));
    expect(store.require(a).info.runtime).toBe("test-project");
    expect(store.require(b).info.runtime).toBe("second-project");
    expect(a).not.toBe(b);
    expect(JSON.stringify(store.status(a))).not.toContain(settings.projectKey);
    expect(store.status("a".repeat(64)).status).toBe("expired");
    expect(() => store.require("a".repeat(64))).toThrow("session ended");
    store.remove(a);
    expect(close).toHaveBeenCalledTimes(1);
    expect(() => store.require(a)).toThrow();
    expect(store.require(b).info.runtime).toBe("second-project");
    store.remove(b);
  });
  it("expires keys and native resources after thirty minutes", async () => {
    let time = 0;
    const close = vi.fn(async () => {});
    const store = new VisitorMossStore(async (_, __, dispose) => { dispose(close); return runtime("one"); }, () => time);
    const id = store.start(settings);
    await vi.waitFor(() => expect(store.status(id).status).toBe("ready"));
    time = SESSION_MS;
    expect(store.status(id).status).toBe("expired");
    expect(close).toHaveBeenCalledOnce();
  });
  it("sanitizes provider failures, closes the client and never enables failed setup", async () => {
    const close = vi.fn(async () => {});
    const store = new VisitorMossStore(async (_, __, dispose) => { dispose(close); throw new Error("HTTP 403 secret-test-key private upstream response"); });
    const id = store.start(settings);
    await vi.waitFor(() => expect(store.status(id).status).toBe("error"));
    expect(store.status(id).error).toContain("rejected");
    expect(JSON.stringify(store.status(id))).not.toContain(settings.projectKey);
    expect(store.status(id).token).toBeUndefined();
    expect(close).toHaveBeenCalledOnce();
    store.remove(id);
    expect(safeMossError(new Error("HTTP 429 credit_exhausted with secret"))).toContain("credits");
    expect(safeMossError(new Error("unexpected secret"))).not.toContain("secret");
  });
  it("does not resurrect a connection cancelled while loading", async () => {
    let finish!: (rt: MossRuntime) => void;
    const close = vi.fn(async () => {});
    const store = new VisitorMossStore((_, __, dispose) => { dispose(close); return new Promise(resolve => { finish = resolve; }); });
    const id = store.start(settings);
    store.remove(id);
    finish(runtime("late"));
    await Promise.resolve();
    expect(store.status(id).status).toBe("expired");
    expect(close).toHaveBeenCalledOnce();
  });
  it("bounds concurrent native runtimes and stops timed-out setup", async () => {
    vi.useFakeTimers();
    const close = vi.fn(async () => {});
    const store = new VisitorMossStore((_, __, dispose) => { dispose(close); return new Promise(() => {}); });
    const a = store.start(settings), b = store.start(settings);
    expect(() => store.start(settings)).toThrow("two private Moss slots");
    await vi.advanceTimersByTimeAsync(180_000);
    expect(store.status(a).error).toContain("timed out");
    expect(close).toHaveBeenCalledTimes(2);
    store.remove(a); store.remove(b);
  });
});
