/**
 * Raksha custom server: Next.js (pages + API routes) and the WebSocket endpoint share
 * one HTTP server and one process, so the Moss runtime is loaded exactly once.
 */
import { createServer } from "node:http";
import next from "next";
import { attachWebSocketServer } from "./ws";
import { getMossRuntime } from "@/lib/moss/runtime";

const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";

async function main() {
  const app = next({ dev, hostname, port, turbopack: dev });
  const handle = app.getRequestHandler();
  await app.prepare();

  const { handleUpgrade } = attachWebSocketServer();
  const server = createServer((req, res) => {
    void handle(req, res);
  });
  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname === "/ws") return handleUpgrade(req, socket, head);
    if (dev && url.pathname.startsWith("/_next")) return; // let Next.js HMR handle its own upgrade
    socket.destroy();
  });

  server.listen(port, hostname, () => {
    console.log(`▲ Raksha listening on http://${hostname}:${port} (${dev ? "dev" : "production"})`);
  });

  // Warm the Moss runtime immediately so the first call is already fast.
  const t0 = Date.now();
  getMossRuntime()
    .then((rt) => console.log(`◆ ${rt.info.runtime} — ${rt.info.docCount} playbook docs ready in ${Date.now() - t0} ms`))
    .catch((err) => console.error("✖ Moss runtime failed to start:", err));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
