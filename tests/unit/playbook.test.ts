import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fromMossMetadata, toMossDoc, validatePlaybook } from "@/lib/data/playbook";
import { MockRetriever } from "@/lib/engine/mockRetriever";
import { FAMILY_INFO } from "@/lib/data/families";
import { FAMILIES } from "@/lib/engine/types";

const raw = JSON.parse(readFileSync(path.join(process.cwd(), "data", "playbook.json"), "utf8")) as { docs: unknown[] };
const docs = validatePlaybook(raw.docs);

describe("playbook dataset", () => {
  it("validates and has both tactic and benign docs", () => {
    expect(docs.length).toBeGreaterThan(300);
    expect(docs.filter((d) => d.kind === "benign").length).toBeGreaterThan(40);
    expect(docs.filter((d) => d.tactics.includes("victim_compliance")).length).toBeGreaterThan(10);
  });
  it("every family has catalog info", () => {
    for (const f of FAMILIES) expect(FAMILY_INFO[f]).toBeDefined();
  });
  it("round-trips through Moss metadata", () => {
    const d = docs.find((x) => x.kind === "tactic")!;
    const m = toMossDoc(d);
    const back = fromMossMetadata(m.metadata);
    expect(back.family).toBe(d.family);
    expect(back.tactics).toEqual(d.tactics);
    expect(back.severity).toBe(d.severity);
  });
});

describe("mock retriever", () => {
  const r = new MockRetriever(docs);
  it("finds an OTP request", async () => {
    const res = await r.search("please read me the six digit OTP you just received, it expires in 60 seconds");
    expect(res.matches.length).toBeGreaterThan(0);
    expect(res.matches.some((m) => m.tactics.includes("otp_request"))).toBe(true);
    expect(res.wallMs).toBeLessThan(50);
  });
});
