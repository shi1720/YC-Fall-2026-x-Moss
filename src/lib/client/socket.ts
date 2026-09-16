"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientMessage, ServerMessage } from "@/lib/protocol";
import { wsUrl } from "@/lib/utils";

export type SocketStatus = "connecting" | "open" | "closed";

let originPromise: Promise<string | null> | null = null;
/** Resolve (once per page) where the socket should connect; same origin unless the server says otherwise. */
function socketOrigin(): Promise<string | null> {
  if (!originPromise) {
    originPromise = fetch("/api/config", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<{ wsOrigin?: string | null }>) : null))
      .then((cfg) => cfg?.wsOrigin ?? null)
      .catch(() => null);
  }
  return originPromise;
}

/**
 * Thin WebSocket hook with auto-reconnect. Consumers subscribe to server messages via
 * `onMessage`; a stable `send` is returned for client messages.
 */
export function useRakshaSocket(onMessage: (msg: ServerMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const handler = useRef(onMessage);
  useEffect(() => {
    handler.current = onMessage;
  }, [onMessage]);
  const attempts = useRef(0);


  useEffect(() => {
    let closed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const connect = () => {
      if (closed) return;
      setStatus("connecting");
      void socketOrigin().then((origin) => {
        if (closed) return;
        open(origin);
      });
    };
    const open = (origin: string | null) => {
      const ws = new WebSocket(wsUrl(origin));
      wsRef.current = ws;
      ws.onopen = () => {
        attempts.current = 0;
        void fetch("/api/moss", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error("Settings unavailable"); return r.json(); }).then(settings => {
          if (ws.readyState !== WebSocket.OPEN) return;
          if (["connecting", "error", "expired"].includes(settings.status)) {
            handler.current({ type: "error", message: "Your Moss session is not ready. Open Settings to reconnect or disconnect for demo mode." });
            return;
          }
          ws.send(JSON.stringify({ type: "runtime.select", token: settings.token }));
        }).catch(() => handler.current({ type: "error", message: "Could not check Moss settings. Reload the page to reconnect." }));
      };
      ws.onmessage = (ev) => {
        try {
          const message = JSON.parse(ev.data as string) as ServerMessage;
          // The TCP connection can open while Moss is still warming up.
          // Enable call controls only after the server confirms its runtime is ready.
          if (message.type === "hello") {
            if (!message.selected) return;
            setStatus("open");
          }
          handler.current(message);
        } catch (err) {
          console.warn("bad message", err);
        }
      };
      ws.onclose = () => {
        if (closed) return;
        setStatus("closed");
        originPromise = null;
        handler.current({ type: "error", message: "Connection lost. This call has stopped. Reconnect and start a new call." });
        const delay = Math.min(8000, 500 * 2 ** attempts.current++);
        timer = setTimeout(connect, delay);
      };
      ws.onerror = () => ws.close();
    };
    connect();
    return () => {
      closed = true;
      if (timer) clearTimeout(timer);
      wsRef.current?.close();
    };
  }, []);

  const send = useCallback((msg: ClientMessage) => {
    const data = JSON.stringify(msg);
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(data);
    else handler.current({ type: "error", message: "The shield is reconnecting. Please wait and try again." });
  }, []);

  return { status, send };
}
