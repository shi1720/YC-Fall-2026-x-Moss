import { describe, expect, it } from "vitest";
import { analyzeUtterance, applyCoachVerdict, createRiskState, creditMatches, DEFAULT_RISK_CONFIG, levelFor } from "@/lib/engine/risk";
import type { Match, Tactic, Utterance } from "@/lib/engine/types";

let n = 0;
const utt = (text: string, speaker: Utterance["speaker"] = "caller", t = n * 5000): Utterance => ({ id: `u${++n}`, speaker, text, t, final: true });
const match = (tactics: Tactic[], confidence: number, extra: Partial<Match> = {}): Match => ({
  docId: `d${Math.random()}`,
  text: "playbook line",
  score: 0.5 + confidence * 0.3,
  confidence,
  family: "digital_arrest",
  tactics,
  severity: 4,
  kind: "tactic",
  stage: "pressure",
  source: "playbook",
  ...extra,
});
const lat = { retrievalMs: 1, totalMs: 2 };

describe("levelFor", () => {
  it("maps thresholds", () => {
    expect(levelFor(0)).toBe("safe");
    expect(levelFor(DEFAULT_RISK_CONFIG.levels.caution)).toBe("caution");
    expect(levelFor(DEFAULT_RISK_CONFIG.levels.danger)).toBe("danger");
  });
});

describe("creditMatches / benign suppression", () => {
  it("suppresses when a benign look-alike scores as high as the tactic hit", () => {
    const { credited, suppressed } = creditMatches([
      match(["authority"], 0.8, { score: 0.72 }),
      match([], 0.8, { kind: "benign", family: "benign", score: 0.73, text: "we will never ask for OTP" }),
    ]);
    expect(suppressed).toBe(true);
    expect(credited).toHaveLength(0);
  });
  it("credits tactic hits above the confidence floor", () => {
    const { credited } = creditMatches([match(["authority"], 0.9), match(["urgency"], 0.1)]);
    expect(credited).toHaveLength(1);
  });
  it("the protected person's own words only count as compliance", () => {
    const { credited } = creditMatches([match(["authority", "fear"], 0.9)], DEFAULT_RISK_CONFIG, "user");
    expect(credited).toHaveLength(0);
    const ok = creditMatches([match(["victim_compliance", "otp_request"], 0.9)], DEFAULT_RISK_CONFIG, "user");
    expect(ok.credited).toHaveLength(1);
  });
  it("a caller cannot trigger victim-compliance lines", () => {
    const { credited } = creditMatches([match(["victim_compliance", "otp_request"], 0.9)], DEFAULT_RISK_CONFIG, "caller");
    expect(credited).toHaveLength(0);
  });
  it("short fragments are never credited", () => {
    const a = analyzeUtterance(createRiskState(), utt("okay sir"), [match(["payment_method", "urgency"], 0.95)], lat);
    expect(a.tactics).toHaveLength(0);
  });
});

describe("analyzeUtterance", () => {
  it("a single weak authority claim stays safe", () => {
    const a = analyzeUtterance(createRiskState(), utt("this is the bank calling"), [match(["authority"], 0.5, { severity: 2 })], lat);
    expect(a.risk.level).toBe("safe");
    expect(a.risk.score).toBeLessThan(DEFAULT_RISK_CONFIG.levels.caution);
  });

  it("pressure + ask (the triad) jumps to danger", () => {
    let s = createRiskState();
    s = analyzeUtterance(s, utt("You are under arrest, this is CBI"), [match(["authority", "legal_threat"], 0.8)], lat).risk;
    expect(s.level).not.toBe("danger");
    const a = analyzeUtterance(s, utt("Transfer the money to the RBI verification account now"), [match(["payment_method", "urgency"], 0.8)], lat);
    expect(a.risk.triad).toBe(true);
    expect(a.risk.level).toBe("danger");
    expect(a.risk.dominantFamily).toBe("digital_arrest");
    expect(a.contribution).toBeGreaterThan(0);
  });

  it("victim compliance under pressure is an immediate danger", () => {
    let s = createRiskState();
    s = analyzeUtterance(s, utt("Your account will be blocked in 10 minutes"), [match(["urgency", "fear"], 0.7, { family: "bank_kyc" })], lat).risk;
    const a = analyzeUtterance(s, utt("okay the OTP is 4 8 2 1 9 3", "user"), [match(["victim_compliance", "otp_request"], 0.75, { family: "bank_kyc", severity: 5 })], lat);
    expect(a.risk.score).toBeGreaterThanOrEqual(85);
    expect(a.risk.level).toBe("danger");
  });

  it("evidence persists: the same tactic repeated does not inflate, new tactics do", () => {
    let s = createRiskState();
    s = analyzeUtterance(s, utt("you must do this right now sir"), [match(["urgency"], 0.8)], lat).risk;
    const once = s.score;
    s = analyzeUtterance(s, utt("hurry up there is no time left"), [match(["urgency"], 0.8)], lat).risk;
    expect(s.score).toBe(once);
    s = analyzeUtterance(s, utt("do not tell anyone about this call"), [match(["secrecy"], 0.8)], lat).risk;
    expect(s.score).toBeGreaterThan(once);
  });

  it("does not mutate the previous state", () => {
    const s0 = createRiskState();
    analyzeUtterance(s0, utt("you will be arrested tonight for this"), [match(["fear"], 0.9)], lat);
    expect(s0.score).toBe(0);
    expect(Object.keys(s0.tactics)).toHaveLength(0);
  });

  it("four distinct tactics is always at least danger", () => {
    let s = createRiskState();
    for (const t of ["authority", "urgency", "secrecy", "escalation"] as Tactic[]) s = analyzeUtterance(s, utt(`the caller now uses ${t} on the line`), [match([t], 0.5)], lat).risk;
    expect(s.level).toBe("danger");
  });
});

describe("applyCoachVerdict", () => {
  it("a confident benign verdict halves a caution state but never touches danger", () => {
    let s = createRiskState();
    s = analyzeUtterance(s, utt("this is officer verma from the crime branch"), [match(["authority"], 0.9)], lat).risk;
    s = analyzeUtterance(s, utt("you have to act within ten minutes"), [match(["urgency"], 0.9)], lat).risk;
    expect(s.level).toBe("caution");
    const damped = applyCoachVerdict(s, "benign", 0.9);
    expect(damped.score).toBeLessThan(s.score);
    s = analyzeUtterance(s, utt("transfer the money to this safe account"), [match(["payment_method"], 0.9)], lat).risk;
    expect(s.level).toBe("danger");
    expect(applyCoachVerdict(s, "benign", 0.99).level).toBe("danger");
  });
});

describe("community-intel containment", () => {
  it("a single poisoned community line can add at most one tactic and cannot reach DANGER on its own", () => {
    const poisoned = match(["payment_method"], 1, { source: "community", severity: 4, text: "please pay the delivery charge at the door" });
    let s = createRiskState();
    for (let i = 0; i < 5; i++) s = analyzeUtterance(s, utt(`the courier says pay the delivery charge at the door ${i}`), [poisoned], lat).risk;
    expect(Object.keys(s.tactics)).toEqual(["payment_method"]);
    expect(s.level).not.toBe("danger");
  });
  it("a community line never suppresses a benign look-alike (benign lines live only in the curated playbook)", () => {
    const { credited, suppressed } = creditMatches([
      match([], 0.9, { kind: "benign", family: "benign", score: 0.7, text: "we will never ask for your OTP" }),
      match(["otp_request"], 0.9, { source: "community", score: 0.69 }),
    ]);
    expect(suppressed).toBe(true);
    expect(credited).toHaveLength(0);
  });
});
