// Bundles server/index.ts (+ src/lib) into dist/server.mjs. Next.js and Moss stay external.
import { build } from "esbuild";
import path from "node:path";

await build({
  entryPoints: ["server/index.ts"],
  outfile: "dist/server.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  sourcemap: true,
  packages: "external",
  alias: { "@": path.resolve("src") },
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
  logLevel: "info",
});
