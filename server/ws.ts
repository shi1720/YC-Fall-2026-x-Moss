/**
 * WebSocket transport. One socket per protected device ("shield") or per guardian.
 * The CallManager does the thinking; this file only routes messages and events.
 */
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, WebSocket } from "ws";
import { getCallManager, type CallRecord } from "@/lib/engine/calls";
import { llmConfig } from "@/lib/llm/client";
import { reportToCommunity } from "@/lib/moss/intel";
import { getMossRuntime } from "@/lib/moss/runtime";
import { clientMessageSchema, type ClientMessage, type ServerMessage } from "@/lib/protocol";

interface Conn {
  ws: WebSocket;
  role: "shield" | "guardian" | "unknown";
  callId?: string;
  lastCallId?: string;
  pending: number;
  messages: number;
  windowAt: number;
  familyCode?: string;
  name?: string;
  /** Messages from one socket are handled strictly in order (call.start before utterances). */
  queue: Promise<void>;
}

const guardians = new Map<string, Set<Conn>>(); // familyCode → guardian connections
const shields = new Map<string, Conn>(); // callId → shield connection

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

function broadcastGuardians(familyCode: string | undefined, msg: ServerMessage) {
  if (!familyCode) return;
  for (const g of guardians.get(familyCode) ?? []) send(g.ws, msg);
}

function normaliseCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

export function attachWebSocketServer(): { wss: WebSocketServer; handleUpgrade: (req: IncomingMessage, socket: Duplex, head: Buffer) => void } {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 16 * 1024 });
  const calls = getCallManager();

  // ---- fan out engine events to the right sockets ----
  calls.on("analysis", (callId, analysis, latencyStats) => {
    const shield = shields.get(callId);
    if (shield) send(shield.ws, { type: "analysis", callId, analysis, latencyStats });
    const rec = calls.get(callId);
    broadcastGuardians(rec?.meta.familyCode, { type: "analysis", callId, analysis, latencyStats });
  });
  calls.on("risk", (callId, risk) => {
    const shield = shields.get(callId);
    if (shield) send(shield.ws, { type: "risk", callId, risk });
    broadcastGuardians(calls.get(callId)?.meta.familyCode, { type: "risk", callId, risk });
  });
  calls.on("intervention", (callId, intervention) => {
    const shield = shields.get(callId);
    if (shield) send(shield.ws, { type: "intervention", callId, intervention });
    broadcastGuardians(calls.get(callId)?.meta.familyCode, { type: "intervention", callId, intervention });
  });
  calls.on("coach", (callId, advice) => {
    const shield = shields.get(callId);
    if (shield) send(shield.ws, { type: "coach", callId, advice });
    broadcastGuardians(calls.get(callId)?.meta.familyCode, { type: "coach", callId, advice });
  });
  calls.on("ended", (callId, record) => {
    const msg: ServerMessage = {
      type: "call.ended",
      callId,
      summary: record.summary ?? "",
      risk: record.risk,
      durationMs: (record.endedAt ?? Date.now()) - record.meta.startedAt,
      latencyStats: record.latency.stats(),
    };
    const shield = shields.get(callId);
    if (shield) send(shield.ws, msg);
    broadcastGuardians(record.meta.familyCode, msg);
  });

  wss.on("connection", (ws) => {
    const conn: Conn = { ws, role: "unknown", queue: Promise.resolve(), pending: 0, messages: 0, windowAt: Date.now() };
    const ready = (async () => {
    try {
      const rt = await getMossRuntime();
      const llm = llmConfig();
      send(ws, {
        type: "hello",
        runtime: { mode: rt.info.mode, runtime: rt.info.runtime, docCount: rt.info.docCount, indexes: rt.info.indexes, model: rt.info.model },
        llm: { enabled: llm.enabled, model: llm.enabled ? llm.model : "template" },
      });
    } catch (err) {
      send(ws, { type: "error", message: `Runtime not ready: ${(err as Error).message}` });
    }

    })();

    ws.on("message", (raw) => {
      let msg: ClientMessage;
      try {
        const parsed = clientMessageSchema.safeParse(JSON.parse(raw.toString()));
        if (!parsed.success) return send(ws, { type: "error", message: "Invalid message. Check the fields and try again." });
        msg = parsed.data;
        if (Date.now() - conn.windowAt > 60_000) { conn.messages = 0; conn.windowAt = Date.now(); }
        if (++conn.messages > 600 || conn.pending >= 40) return send(ws, { type: "error", message: "Too many requests. Please slow down." });
      } catch {
        return send(ws, { type: "error", message: "Malformed message" });
      }
      conn.pending++;
      conn.queue = conn.queue.then(async () => {
        await ready;
        if (ws.readyState === WebSocket.OPEN) await handle(conn, msg);
      }).catch((err) => {
        console.error("[ws] handler error", err);
        send(ws, { type: "error", message: "The request could not be completed. Please try again." });
      }).finally(() => { conn.pending--; });
    });

    ws.on("close", () => {
      if (conn.role === "shield" && conn.callId) {
        const id = conn.callId;
        void calls.end(id).finally(() => shields.delete(id));
      }
      if (conn.role === "guardian" && conn.familyCode) guardians.get(conn.familyCode)?.delete(conn);
    });
  });

  async function handle(conn: Conn, msg: ClientMessage) {
    switch (msg.type) {
      case "ping":
        return send(conn.ws, { type: "pong", t: Date.now() });

      case "call.start": {
        if (conn.role === "guardian") return send(conn.ws, { type: "error", message: "Open the Shield page to start a call." });
        if (conn.callId) { await calls.end(conn.callId); shields.delete(conn.callId); }
        const record = await calls.start({
          mode: msg.mode,
          scenarioId: msg.scenarioId,
          familyCode: msg.familyCode ? normaliseCode(msg.familyCode) : undefined,
          region: msg.region ?? "IN",
          displayName: msg.displayName,
        });
        conn.role = "shield";
        conn.callId = record.meta.callId;
        shields.set(record.meta.callId, conn);
        send(conn.ws, { type: "call.started", call: record.meta });
        broadcastGuardians(record.meta.familyCode, { type: "guardian.joined", familyCode: record.meta.familyCode ?? "", activeCalls: calls.activeForFamily(record.meta.familyCode ?? "").map((c) => c.meta) });
        return;
      }

      case "utterance": {
        if (!conn.callId) return send(conn.ws, { type: "error", message: "No active call. Send call.start first." });
        await calls.analyze(conn.callId, { text: msg.text, speaker: msg.speaker, final: msg.final, t: msg.t });
        return;
      }

      case "call.end": {
        if (!conn.callId) return;
        const id = conn.callId;
        await calls.end(id); // emits call.ended to this socket before we forget it
        conn.lastCallId = id;
        conn.callId = undefined;
        shields.delete(id);
        return;
      }

      case "call.report": {
        const id = conn.callId ?? conn.lastCallId;
        if (!id) return send(conn.ws, { type: "error", message: "No call to report." });
        const rec = calls.get(id);
        const result = await reportToCommunity({ lines: calls.flaggedLines(id), region: rec?.meta.region, callId: id });
        return send(conn.ws, { type: "call.reported", callId: id, ...result });
      }

      case "guardian.join": {
        if (conn.role === "shield") return send(conn.ws, { type: "error", message: "Open the Guardian page to join a family." });
        const code = normaliseCode(msg.familyCode);
        if (code.length < 6) return send(conn.ws, { type: "error", message: "Family code must be at least 6 characters." });
        if (conn.familyCode) guardians.get(conn.familyCode)?.delete(conn);
        conn.role = "guardian";
        conn.familyCode = code;
        conn.name = msg.name;
        if (!guardians.has(code)) guardians.set(code, new Set());
        guardians.get(code)!.add(conn);
        send(conn.ws, { type: "guardian.joined", familyCode: code, activeCalls: calls.activeForFamily(code).map((c) => c.meta) });
        // Replay current state of active calls so a late-joining guardian is not blind.
        for (const c of calls.activeForFamily(code)) {
          send(conn.ws, { type: "risk", callId: c.meta.callId, risk: c.risk });
          const last = c.interventions[c.interventions.length - 1];
          if (last) send(conn.ws, { type: "intervention", callId: c.meta.callId, intervention: last });
          for (const a of c.analyses.slice(-12)) send(conn.ws, { type: "analysis", callId: c.meta.callId, analysis: a, latencyStats: c.latency.stats() });
        }
        return;
      }

      case "guardian.say": {
        if (!conn.familyCode) return send(conn.ws, { type: "error", message: "Join a family code first." });
        const text = msg.text.trim().slice(0, 300);
        if (!text) return;
        for (const c of calls.activeForFamily(conn.familyCode)) {
          calls.pushGuardianMessage(c.meta.callId, text, conn.name ?? "Guardian");
          const shield = shields.get(c.meta.callId);
          if (shield) send(shield.ws, { type: "guardian.message", callId: c.meta.callId, text, from: conn.name ?? "Guardian" });
          broadcastGuardians(conn.familyCode, { type: "guardian.message", callId: c.meta.callId, text, from: conn.name ?? "Guardian" });
        }
        return;
      }

      case "guardian.ask": {
        if (!conn.familyCode) return send(conn.ws, { type: "error", message: "Join a family code first." });
        const active: CallRecord[] = calls.activeForFamily(conn.familyCode);
        const target = active[0] ?? calls.list().filter((c) => c.meta.familyCode === conn.familyCode).sort((a, b) => b.meta.startedAt - a.meta.startedAt)[0];
        if (!target) return send(conn.ws, { type: "guardian.answer", callId: "", question: msg.question, hits: [], latencyMs: 0, answer: "No call to search yet." });
        const res = await calls.ask(target.meta.callId, msg.question);
        return send(conn.ws, { type: "guardian.answer", callId: target.meta.callId, question: msg.question, ...res });
      }
    }
  }

  const handleUpgrade = (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const origin = req.headers.origin;
    const allowed = [process.env.RAKSHA_PUBLIC_URL, process.env.RAKSHA_WS_ORIGIN].filter(Boolean);
    if (process.env.NODE_ENV === "production" && allowed.length && origin && !allowed.includes(origin)) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n"); socket.destroy(); return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
  };
  return { wss, handleUpgrade };
}
