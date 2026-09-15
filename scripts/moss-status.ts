import "dotenv/config";
import { MossClient } from "@moss-js/moss";

async function main() {
  const client = new MossClient(process.env.MOSS_PROJECT_ID!, process.env.MOSS_PROJECT_KEY!);
  const indexes = await client.listIndexes();
  for (const i of indexes) console.log(`${i.name.padEnd(24)} ${String(i.docCount).padStart(6)} docs  ${i.model?.id ?? ""}  ${i.status}  updated ${i.updatedAt ?? ""}`);
  await client.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
