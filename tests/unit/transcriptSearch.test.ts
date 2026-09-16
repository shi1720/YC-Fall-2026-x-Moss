import { expect, it } from "vitest";
import { searchTranscript } from "@/lib/engine/transcriptSearch";
import type { Utterance } from "@/lib/engine/types";
const lines = ["They said they were waiting.", "This is Inspector Kumar from Mumbai Crime Branch speaking.", "Transfer five lakh rupees to the verification account.", "Read me the six digit code."].map((text, i): Utterance => ({ id: String(i), text, speaker: "caller", t: i * 1000, final: true }));
it("answers suggested offline questions with relevant original lines rather than pronouns", () => {
  expect(searchTranscript(lines, "Who did they claim to be?")[0].text).toContain("Inspector Kumar");
  expect(searchTranscript(lines, "What money did they ask for?")[0].text).toContain("five lakh");
  expect(searchTranscript(lines, "Did they ask for an OTP?")[0].text).toContain("six digit code");
});
it("does not manufacture answers without evidence", () => {
  expect(searchTranscript(lines, "passport")).toEqual([]);
  expect(searchTranscript([], "Who did they claim to be?")).toEqual([]);
});
