/**
 * Core domain types for Raksha's real-time scam-call shield.
 *
 * The engine is deliberately split into a *fast path* (Moss retrieval, single-digit ms,
 * runs on every transcript fragment) and a *slow path* (LLM coach, ~300-800 ms, runs only
 * on risk transitions). Everything in this file is transport-agnostic and pure data.
 */

/** Persuasion / manipulation tactics we recognise in a caller's speech. */
export const TACTICS = [
  "authority",
  "urgency",
  "fear",
  "secrecy",
  "isolation",
  "payment_method",
  "otp_request",
  "remote_access",
  "verification_bypass",
  "too_good",
  "reciprocity",
  "personal_info",
  "social_proof",
  "escalation",
  "hold_the_line",
  "video_call_demand",
  "legal_threat",
  "account_compromise",
  "relationship_pretext",
  "tech_pretext",
  "victim_compliance",
] as const;
export type Tactic = (typeof TACTICS)[number];

/** Scam families (scripts) in the playbook. `benign` is used for legitimate look-alikes. */
export const FAMILIES = [
  "digital_arrest",
  "bank_kyc",
  "card_fraud_dept",
  "courier_parcel",
  "sim_disconnection",
  "utility_disconnection",
  "tax_refund",
  "lottery_prize",
  "loan_app",
  "job_task",
  "investment",
  "upi_cashback",
  "tech_support",
  "ecommerce_order",
  "family_emergency",
  "romance",
  "sextortion",
  "ceo_wire_fraud",
  "insurance_policy",
  "govt_scheme",
  "olx_army",
  "fake_customer_care",
  "jury_duty",
  "social_security",
  "irs",
  "medicare",
  "refund_overpayment",
  "safe_account",
  "hi_mum",
  "recovery_scam",
  "benign",
] as const;
export type Family = (typeof FAMILIES)[number];

/** Where in the scam script arc an utterance typically sits. */
export const STAGES = ["hook", "pretext", "pressure", "isolation", "extraction", "retention"] as const;
export type Stage = (typeof STAGES)[number];

export type DocKind = "tactic" | "benign";

/** A single playbook document as authored in data/playbook.json. */
export interface PlaybookDoc {
  id: string;
  text: string;
  family: Family;
  tactics: Tactic[];
  severity: 1 | 2 | 3 | 4 | 5;
  kind: DocKind;
  stage?: Stage;
  region?: "IN" | "US" | "UK" | "AU" | "GLOBAL";
  /** Free-text note for humans browsing the playbook. */
  note?: string;
}

/** A retrieval hit, already decoded from Moss metadata back into typed fields. */
export interface Match {
  docId: string;
  text: string;
  /** Raw semantic score from the retriever (cosine for Moss with alpha=1). */
  score: number;
  /** Calibrated 0..1 confidence derived from `score`. */
  confidence: number;
  family: Family;
  tactics: Tactic[];
  severity: number;
  kind: DocKind;
  stage?: Stage;
  /** Which index the hit came from (playbook vs community intel). */
  source: "playbook" | "community";
}

export type Speaker = "caller" | "user" | "unknown";

export interface Utterance {
  id: string;
  speaker: Speaker;
  text: string;
  /** Milliseconds since the call started. */
  t: number;
  /** True when the STT engine finalised the segment. Interim text is analysed but not stored. */
  final: boolean;
}

export type RiskLevel = "safe" | "caution" | "danger";

export interface TacticEvidence {
  tactic: Tactic;
  /** Best calibrated confidence seen for this tactic in the call (0..1). */
  confidence: number;
  /** Severity (1..5) of the strongest supporting match. */
  severity: number;
  count: number;
  firstAt: number;
  lastAt: number;
  /** Utterance ids that supported this tactic. */
  evidence: string[];
}

export interface RiskState {
  /** 0..100 */
  score: number;
  level: RiskLevel;
  tactics: Partial<Record<Tactic, TacticEvidence>>;
  /** Family → accumulated confidence mass; used to name the script. */
  families: Partial<Record<Family, number>>;
  dominantFamily: Family | null;
  /** Highest script stage reached so far. */
  stage: Stage | null;
  /** Human-readable reasons, most important first. */
  reasons: string[];
  /** Whether the "extraction" combination fired (pressure + ask). */
  triad: boolean;
  timeline: Array<{ t: number; score: number }>;
  updatedAt: number;
}

export interface LatencySample {
  /** Time spent inside the retriever (Moss reports this itself). */
  retrievalMs: number;
  /** Wall-clock from utterance received to analysis emitted. */
  totalMs: number;
}

export interface UtteranceAnalysis {
  utterance: Utterance;
  matches: Match[];
  /** Tactics credited by this utterance after benign suppression. */
  tactics: Tactic[];
  /** Score contribution (0..100 delta) attributed to this utterance. */
  contribution: number;
  suppressed: boolean;
  suppressionReason?: string;
  latency: LatencySample;
  risk: RiskState;
}

export interface CoachAdvice {
  verdict: "scam" | "suspicious" | "benign";
  confidence: number;
  /** Plain-language explanation for the person on the call (max ~2 sentences). */
  explanation: string;
  /** The exact sentence the user should say next. */
  sayThis: string;
  /** Concrete next action, e.g. "Hang up and call 1930". */
  action: string;
  family: Family | null;
  /** Which LLM produced this (for the UI / lab). */
  model: string;
  latencyMs: number;
}

export interface Intervention {
  level: RiskLevel;
  headline: string;
  body: string;
  sayThis: string;
  action: string;
  reasons: string[];
  family: Family | null;
  /** When the intervention was raised, ms since call start. */
  t: number;
}
