/**
 * The slow path: an LLM "coach" that turns the fast path's evidence into plain words a
 * frightened person can act on, and gives a second opinion (scam / suspicious / benign).
 *
 * It is called only on risk transitions, never on every fragment, so the cost per call is
 * a few hundred tokens. Without an API key a deterministic template coach is used, so the
 * product still works end-to-end.
 */
import { z } from "zod";
import { FAMILY_INFO, TACTIC_INFO } from "@/lib/data/families";
import { describeRisk } from "@/lib/engine/risk";
import type { CoachAdvice, Family, Match, RiskState, Utterance } from "@/lib/engine/types";
import { FAMILIES } from "@/lib/engine/types";
import { chat, extractJson, llmConfig } from "@/lib/llm/client";

const ADVICE_JSON_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["scam", "suspicious", "benign"] },
    confidence: { type: "number" },
    explanation: { type: "string" },
    say_this: { type: "string" },
    action: { type: "string" },
    family: { type: ["string", "null"] },
  },
  required: ["verdict", "confidence", "explanation", "say_this", "action", "family"],
  additionalProperties: false,
};

const AdviceSchema = z.object({
  verdict: z.enum(["scam", "suspicious", "benign"]),
  confidence: z.number().min(0).max(1),
  explanation: z.string().min(1).max(700),
  say_this: z.string().min(1).max(300),
  action: z.string().min(1).max(240),
  family: z.string().nullable().optional(),
});

const SYSTEM = `You are Raksha, a calm, protective coach sitting next to someone who is on a phone call that may be a scam.
You receive: (1) the recent transcript, (2) a FAST-PATH analysis from a pattern matcher (which scam script it resembles and which persuasion tactics it detected), (3) the closest lines from a playbook of real scam scripts.
The fast path is quick but literal: it matches wording, not meaning, and it over-reacts to legitimate calls that merely sound like scams. Judge the transcript on its own merits.
Signs of a LEGITIMATE call (weigh these heavily): the caller says they will never ask for an OTP/PIN/CVV; invites the person to hang up and call the official number; asks for nothing; blocks a card or resolves an issue without needing codes, transfers or app installs; defers payment to an official channel; no urgency beyond ordinary business.
Signs of a SCAM: authority + fear + urgency; secrecy ("tell no one"); keeping the person on the line or on video; a request for an OTP, PIN, card details, remote-access app, gift cards, crypto, or a transfer to a "safe"/"verification" account; "digital arrest" (which does not exist); discouraging verification.
Your job:
- Decide: "scam" (a known script is being run), "suspicious" (worrying but not conclusive), or "benign" (a normal call).
- Explain in at most 2 short sentences, in simple words a 70-year-old can understand while stressed. No jargon.
- Give ONE exact sentence the person can say right now ("say_this"). It must end the pressure without arguing, e.g. "I will call the bank myself on the number on my card. Goodbye." For a benign call, a normal polite sentence is fine.
- Give ONE concrete next action ("action"), e.g. "Hang up and call 1930." Do not invent phone numbers, websites or contact sources. India: 1930 is the cyber financial fraud helpline, not a general police number.
Respond ONLY with JSON: {"verdict":"scam|suspicious|benign","confidence":0..1,"explanation":"...","say_this":"...","action":"...","family":"<family id or null>"}`;

export interface CoachInput {
  transcript: Utterance[];
  risk: RiskState;
  topMatches: Match[];
  /** Where the user is; drives the helpline in the advice. */
  region?: "IN" | "US" | "UK" | "AU" | "GLOBAL";
}

function familyIdOrNull(id: string | null | undefined): Family | null {
  if (!id) return null;
  return (FAMILIES as readonly string[]).includes(id) ? (id as Family) : null;
}

/** Keep contact instructions out of generated text, even when the model invents a number. */
export function safeNextStep(verdict: CoachAdvice["verdict"], region: CoachInput["region"] = "IN") {
  return {
    sayThis: verdict === "benign"
      ? "Thank you. I will verify the details through the official channel."
      : "I will not continue this call. I am going to verify this myself. Goodbye.",
    action: verdict === "benign"
      ? "Verify independently before sharing sensitive information or paying. A safe score does not verify identity."
      : `Hang up. Use an official website or a number you already trust to verify.${region === "IN" ? " If money was lost, report cyber fraud on 1930." : " Report any loss to your bank and local fraud reporting service."}`,
  };
}

export function templateCoach(input: CoachInput): CoachAdvice {
  const { risk } = input;
  const fam = risk.dominantFamily ? FAMILY_INFO[risk.dominantFamily] : null;
  const strongest = Object.values(risk.tactics)
    .filter((e): e is NonNullable<typeof e> => !!e)
    .sort((a, b) => b.confidence - a.confidence)[0];
  const verdict: CoachAdvice["verdict"] = risk.level === "danger" ? "scam" : risk.level === "caution" ? "suspicious" : "benign";
  const explanation =
    verdict === "benign"
      ? "Nothing in this call matches a known scam script so far."
      : fam
        ? `${fam.short} ${strongest ? `The caller is using ${TACTIC_INFO[strongest.tactic].label.toLowerCase()}.` : ""}`.trim()
        : `The caller is using pressure tactics${strongest ? ` (${TACTIC_INFO[strongest.tactic].label.toLowerCase()})` : ""}.`;
  return {
    verdict,
    confidence: verdict === "scam" ? 0.85 : verdict === "suspicious" ? 0.6 : 0.7,
    explanation,
    ...safeNextStep(verdict, input.region),
    family: risk.dominantFamily,
    model: "template",
    latencyMs: 0,
  };
}

export async function coach(input: CoachInput): Promise<CoachAdvice> {
  if (!llmConfig().enabled) return templateCoach(input);
  const recent = input.transcript.slice(-14).map((u) => `${u.speaker === "user" ? "PERSON" : "CALLER"}: ${u.text}`).join("\n");
  const matches = input.topMatches
    .slice(0, 6)
    .map((m) => `- [${FAMILY_INFO[m.family].label}; ${m.tactics.join(", ")}; ${(m.confidence * 100).toFixed(0)}%] "${m.text}"`)
    .join("\n");
  const user = `REGION: ${input.region ?? "IN"}
FAST-PATH ANALYSIS: ${describeRisk(input.risk)}
REASONS: ${input.risk.reasons.join(" | ") || "none"}

RECENT TRANSCRIPT:
${recent || "(nothing yet)"}

CLOSEST PLAYBOOK LINES:
${matches || "(none)"}`;
  try {
    const res = await chat([{ role: "system", content: SYSTEM }, { role: "user", content: user }], {
      schema: { name: "raksha_advice", schema: ADVICE_JSON_SCHEMA },
      maxTokens: 900,
      reasoningEffort: "low",
    });
    const parsed = AdviceSchema.parse(JSON.parse(extractJson(res.text)));
    return {
      verdict: parsed.verdict,
      confidence: parsed.confidence,
      explanation: parsed.explanation,
      ...safeNextStep(parsed.verdict, input.region),
      family: familyIdOrNull(parsed.family) ?? input.risk.dominantFamily,
      model: res.model,
      latencyMs: Math.round(res.latencyMs),
    };
  } catch (err) {
    const fallback = templateCoach(input);
    fallback.model = `template (LLM failed: ${(err as Error).message.slice(0, 60)})`;
    return fallback;
  }
}

/** Post-call summary for the guardian feed. Short, factual, no drama. */
export async function summarizeCall(transcript: Utterance[], risk: RiskState): Promise<string> {
  const fam = risk.dominantFamily ? FAMILY_INFO[risk.dominantFamily].label : "no known script";
  if (!llmConfig().enabled || transcript.length === 0) {
    return `Call ended at ${risk.level.toUpperCase()} (${risk.score}/100). Closest script: ${fam}. ${risk.reasons[0] ?? ""}`.trim();
  }
  try {
    const res = await chat(
      [
        { role: "system", content: "Summarise this phone call for a worried family member in 2 sentences: what the caller wanted and whether the person shared anything sensitive. Plain words, no markdown." },
        { role: "user", content: transcript.map((u) => `${u.speaker === "user" ? "PERSON" : "CALLER"}: ${u.text}`).join("\n") + `\n\nRisk analysis: ${describeRisk(risk)}` },
      ],
      { maxTokens: 600, reasoningEffort: "low" },
    );
    return res.text.trim();
  } catch {
    return `Call ended at ${risk.level.toUpperCase()} (${risk.score}/100). Closest script: ${fam}.`;
  }
}
