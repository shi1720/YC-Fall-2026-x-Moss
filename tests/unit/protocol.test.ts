import { describe, expect, it } from "vitest";
import { clientMessageSchema } from "../../src/lib/protocol";

describe("public socket boundary", () => {
  it("requires explicit consent and bounds untrusted input", () => {
    expect(clientMessageSchema.safeParse({ type: "call.report", consent: false }).success).toBe(false);
    expect(clientMessageSchema.safeParse({ type: "call.report", consent: true }).success).toBe(true);
    for (const value of [null, [], { type: "utterance", text: 12 }, { type: "guardian.join", familyCode: "ABC" }, { type: "guardian.ask", question: "x".repeat(501) }, { type: "utterance", text: "hello", speaker: "caller", final: true, t: -5 }]) {
      expect(clientMessageSchema.safeParse(value).success).toBe(false);
    }
  });
  it("accepts a valid caller utterance and cryptographic invitation code", () => {
    expect(clientMessageSchema.safeParse({ type: "call.start", mode: "simulation", familyCode: "ABCD2345" }).success).toBe(true);
    expect(clientMessageSchema.safeParse({ type: "utterance", text: "Please read the one time password", speaker: "caller", final: true, t: 1000 }).success).toBe(true);
  });
});
