/**
 * Create (or refresh) the curated playbook index in Moss Cloud from data/playbook.json.
 *
 *   npm run moss:seed            # create if missing, otherwise upsert every doc
 *   npm run moss:seed -- --reset # delete and recreate
 */
import "dotenv/config";
import { MossClient } from "@moss-js/moss";
import { toMossDoc } from "../src/lib/data/playbook";
import { loadPlaybookFromDisk, INDEX_PLAYBOOK } from "../src/lib/moss/runtime";

async function main() {
  const { MOSS_PROJECT_ID, MOSS_PROJECT_KEY } = process.env;
  if (!MOSS_PROJECT_ID || !MOSS_PROJECT_KEY) throw new Error("Set MOSS_PROJECT_ID and MOSS_PROJECT_KEY (see .env.example)");
  const reset = process.argv.includes("--reset");
  const client = new MossClient(MOSS_PROJECT_ID, MOSS_PROJECT_KEY);
  const docs = loadPlaybookFromDisk().map(toMossDoc);
  console.log(`Playbook: ${docs.length} docs → index "${INDEX_PLAYBOOK}"`);

  let exists = false;
  try {
    const info = await client.getIndex(INDEX_PLAYBOOK);
    exists = true;
    console.log(`Index exists: ${info.docCount} docs, model ${info.model?.id}, status ${info.status}`);
  } catch {
    exists = false;
  }
  if (exists && reset) {
    console.log("Deleting existing index…");
    await client.deleteIndex(INDEX_PLAYBOOK);
    exists = false;
  }
  const t0 = Date.now();
  const onProgress = (p: { status: string; progress: number; currentPhase: string | null }) =>
    process.stdout.write(`\r  ${p.status} ${p.progress}% ${p.currentPhase ?? ""}        `);
  if (!exists) {
    const r = await client.createIndex(INDEX_PLAYBOOK, docs, { modelId: "moss-minilm", onProgress });
    console.log(`\nCreated: job ${r.jobId}, ${r.docCount} docs in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  } else {
    const r = await client.addDocs(INDEX_PLAYBOOK, docs, { upsert: true, onProgress });
    console.log(`\nUpserted: job ${r.jobId}, ${r.docCount} docs in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  const info = await client.getIndex(INDEX_PLAYBOOK);
  console.log(`Ready: ${info.name} — ${info.docCount} docs, model ${info.model?.id}`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
