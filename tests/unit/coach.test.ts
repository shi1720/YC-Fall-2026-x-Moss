import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/llm/client", () => ({
  llmConfig: () => ({ enabled: true }),
  extractJson: (s: string) => s,
  chat: async () => ({ text: JSON.stringify({ verdict: "scam", confidence: 0.98, explanation: "The caller demands secrecy and payment.", say_this: "Call this invented number 555123", action: "Send money to an invented support address", family: "digital_arrest" }), model: "test", latencyMs: 1 }),
}));
import { coach, safeNextStep } from "@/lib/llm/coach";
import { createRiskState } from "@/lib/engine/risk";

describe("verified coach actions", () => {
  it("does not relay generated numbers or payment instructions", async () => {
    const advice = await coach({ transcript: [], risk: createRiskState(), topMatches: [], region: "IN" });
    expect(advice.sayThis).toContain("verify this myself");
    expect(advice.action).toContain("1930");
    expect(advice.action).toContain("cyber fraud");
    expect(JSON.stringify(advice)).not.toContain("555123");
    expect(advice.action).not.toContain("Send money");
  });
  it("does not give an Indian helpline to another region or claim a safe score verifies identity", () => {
    expect(safeNextStep("scam", "US").action).not.toContain("1930");
    expect(safeNextStep("benign").action).toContain("does not verify identity");
  });
});
