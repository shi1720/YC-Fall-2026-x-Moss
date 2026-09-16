import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { toMossDoc } from "@/lib/data/playbook";
import { getMossRuntime, loadPlaybookFromDisk, type MossRuntime } from "@/lib/moss/runtime";
import { MossRetriever } from "@/lib/moss/retriever";

// Firebase Hosting forwards only this specially named cookie to Cloud Run.
export const MOSS_COOKIE = "__session";
export const SESSION_MS = 30 * 60_000;
export const mossSettingsSchema = z.object({
  projectId: z.string().trim().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  projectKey: z.string().trim().min(10).max(512).regex(/^[\x21-\x7E]+$/),
  indexName: z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/),
  createIndex: z.boolean().default(false),
  consent: z.literal(true),
}).strict();
export type MossSettings = z.infer<typeof mossSettingsSchema>;
type Status = "connecting" | "ready" | "error";
interface Entry {
  id: string; status: Status; phase: string; indexName: string; expiresAt: number;
  runtime?: MossRuntime; error?: string; dispose?: () => Promise<void>;
  timer?: ReturnType<typeof setTimeout>;
}
const SETTINGS_ERROR = Symbol.for("raksha.moss.settings.error");
export class MossSettingsError extends Error {
  readonly [SETTINGS_ERROR] = true;
  constructor(message: string, public status = 400) { super(message); }
}
// Next routes and the custom server are bundled separately but share this store.
// A global symbol keeps trusted errors identifiable across both module copies.
export function isMossSettingsError(error: unknown): error is MossSettingsError {
  return error instanceof Error && SETTINGS_ERROR in error && error[SETTINGS_ERROR] === true;
}

// Never return SDK error text: provider responses can include credentials or URLs.
export function safeMossError(error: unknown): string {
  if (isMossSettingsError(error)) return error.message;
  const message = error instanceof Error ? error.message : "";
  if (/429|credit|quota|USAGE_LIMIT/i.test(message)) return "This Moss project has no available credits or has reached its usage limit. Use a funded project, or disconnect to continue the demo without Moss.";
  if (/401|403|unauthori|forbidden|authenticat|invalid.*key/i.test(message)) return "Moss rejected these credentials. Check the project ID and project API key in your Moss dashboard.";
  if (/404|not.found|does not exist/i.test(message)) return "That index was not found. Enter an existing Raksha playbook index, or choose Create a new playbook.";
  return "Moss could not connect. Check the credentials, index and available credits, then try again. The demo remains available after disconnecting.";
}

type Builder = (input: MossSettings, phase: (message: string) => void, dispose: (fn: () => Promise<void>) => void) => Promise<MossRuntime>;

export async function buildVisitorRuntime(input: MossSettings, phase: (message: string) => void, registerDispose: (fn: () => Promise<void>) => void): Promise<MossRuntime> {
  const { MossClient } = await import("@moss-js/moss");
  const client = new MossClient(input.projectId, input.projectKey, { identity: { deviceId: "raksha-browser-demo" } });
  registerDispose(() => client.close());
  const playbook = loadPlaybookFromDisk();
  const t0 = Date.now();
  const docs = playbook.map(toMossDoc);
  if (input.createIndex) {
    phase("Creating your playbook in Moss. This can take a few minutes.");
    // createIndex rejects a collision; never overwrite or delete an existing index.
    await client.createIndex(input.indexName, docs, { modelId: "moss-minilm" });
  }
  phase("Checking the playbook and embedding model.");
  const info = await client.getIndex(input.indexName);
  if (info.docCount !== docs.length || info.model?.id !== "moss-minilm") {
    throw new MossSettingsError("Use the 409-line Raksha playbook with the moss-minilm model. Create a new playbook here if you do not have one.");
  }
  const stored = await client.getDocs(input.indexName);
  const expected = new Map(docs.map(d => [d.id, d]));
  if (stored.length !== docs.length || new Set(stored.map(d => d.id)).size !== docs.length || stored.some(d => {
    const match = expected.get(d.id);
    return !match || d.text !== match.text || Object.entries(match.metadata).some(([key, value]) => d.metadata?.[key] !== value);
  })) throw new MossSettingsError("This index does not match Raksha's current playbook. Choose Create a new playbook so detection uses the tested dataset.");
  phase("Loading Moss and warming up semantic search.");
  // No index disk cache, cloud refresh or writes to a visitor's existing index.
  await client.loadIndex(input.indexName, { autoRefresh: false });
  const retriever = new MossRetriever(client, { indexes: [input.indexName], floor: 0.38, ceil: 0.72, alpha: 1, topK: 6, docCounts: { [input.indexName]: docs.length } });
  await retriever.search("hello, who is calling?");
  const memory = await client.session(`raksha-visitor-${randomUUID()}`);
  return { client, memory, retriever, playbook, info: { mode: "moss", runtime: "Your Moss project · in-process semantic retrieval", indexes: [input.indexName], docCount: docs.length, model: info.model.id, loadedAt: Date.now(), loadMs: Date.now() - t0, version: "@moss-js/moss", source: "visitor" } };
}

export class VisitorMossStore {
  private entries = new Map<string, Entry>();
  private attempts: number[] = [];
  constructor(private builder: Builder = buildVisitorRuntime, private now: () => number = Date.now) {}

  start(input: MossSettings): string {
    this.sweep();
    this.attempts = this.attempts.filter(t => this.now() - t < 60_000);
    if (this.attempts.length >= 6) throw new MossSettingsError("Too many connection attempts. Wait one minute and try again.", 429);
    if ([...this.entries.values()].filter(e => e.status !== "error").length >= 2) throw new MossSettingsError("The demo's two private Moss slots are in use. Try again shortly, or use the demo without a key.", 503);
    this.attempts.push(this.now());
    const id = randomBytes(32).toString("hex");
    const entry: Entry = { id, status: "connecting", phase: "Connecting to your Moss project.", indexName: input.indexName, expiresAt: this.now() + SESSION_MS };
    this.entries.set(id, entry);
    const current = () => this.entries.get(id) === entry && entry.status === "connecting";
    entry.timer = setTimeout(() => {
      if (!current()) return;
      entry.status = "error";
      entry.error = "Moss setup timed out. If you created a playbook, check your Moss dashboard before trying again. Disconnect to return to the demo.";
      this.dispose(entry);
    }, 180_000);
    entry.timer.unref?.();
    void this.builder(input, message => { if (current()) entry.phase = message; }, dispose => {
      if (current()) entry.dispose = dispose;
      else void dispose().catch(() => {});
    }).then(async runtime => {
      if (!current()) { await runtime.client?.close(); return; }
      entry.runtime = runtime;
      entry.status = "ready";
      entry.phase = "Moss semantic retrieval is ready.";
    }).catch(error => {
      if (current()) { entry.status = "error"; entry.error = safeMossError(error); }
      this.dispose(entry);
    }).finally(() => {
      clearTimeout(entry.timer);
      if (this.entries.get(id) !== entry) return;
      entry.timer = setTimeout(() => this.remove(id), Math.max(1, entry.expiresAt - this.now()));
      entry.timer.unref?.();
    });
    return id;
  }

  private dispose(entry: Entry) { const dispose = entry.dispose; entry.dispose = undefined; void dispose?.().catch(() => {}); }
  private sweep() { for (const [id, e] of this.entries) if (e.expiresAt <= this.now()) this.remove(id); }
  get(id: string | undefined) {
    this.sweep();
    return id && /^[a-f0-9]{64}$/.test(id) ? this.entries.get(id) : undefined;
  }
  status(id: string | undefined) {
    const entry = this.get(id);
    if (!entry) return { status: id ? "expired" as const : "disconnected" as const };
    return { status: entry.status, phase: entry.phase, indexName: entry.indexName, expiresAt: entry.expiresAt, error: entry.error, runtime: entry.runtime?.info,
      // A session capability for the direct Cloud Run WebSocket, never the Moss key.
      token: entry.status === "ready" ? entry.id : undefined };
  }
  require(id: string): MossRuntime {
    const entry = this.get(id);
    if (!entry?.runtime || entry.status !== "ready") throw new MossSettingsError("Your Moss session ended or is not ready. Reconnect in Settings, or disconnect to use demo mode.", 409);
    return entry.runtime;
  }
  remove(id: string | undefined) {
    if (!id) return;
    const entry = this.entries.get(id);
    this.entries.delete(id);
    if (entry) { clearTimeout(entry.timer); this.dispose(entry); entry.runtime = undefined; }
  }
}

const KEY = "__raksha_visitor_moss__";
type Globals = typeof globalThis & { [KEY]?: VisitorMossStore };
export function visitorMoss() { return (globalThis as Globals)[KEY] ??= new VisitorMossStore(); }
export function mossToken(req: Request) { return req.headers.get("cookie")?.match(/(?:^|;\s*)__session=([a-f0-9]{64})(?:;|$)/)?.[1]; }
export async function runtimeForToken(token?: string) { return token ? visitorMoss().require(token) : getMossRuntime(); }
export async function runtimeForRequest(req: Request) {
  const token = mossToken(req);
  return token ? visitorMoss().require(token) : getMossRuntime();
}
