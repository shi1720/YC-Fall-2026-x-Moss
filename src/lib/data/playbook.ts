import type { DocKind, Family, PlaybookDoc, Stage, Tactic } from "@/lib/engine/types";
import { FAMILIES, STAGES, TACTICS } from "@/lib/engine/types";

/** Moss metadata must be a flat string map; this is the exact shape we store. */
export interface PlaybookMetadata extends Record<string, string> {
  family: string;
  tactics: string; // comma separated
  severity: string; // "1".."5"
  kind: string; // tactic | benign
  stage: string; // may be ""
  region: string;
}

export function toMossDoc(doc: PlaybookDoc): { id: string; text: string; metadata: PlaybookMetadata } {
  return {
    id: doc.id,
    text: doc.text,
    metadata: {
      family: doc.family,
      tactics: doc.tactics.join(","),
      severity: String(doc.severity),
      kind: doc.kind,
      stage: doc.stage ?? "",
      region: doc.region ?? "GLOBAL",
    },
  };
}

const familySet = new Set<string>(FAMILIES);
const tacticSet = new Set<string>(TACTICS);
const stageSet = new Set<string>(STAGES);

/** Decode Moss metadata (all strings) back into typed fields. Tolerant of missing keys. */
export function fromMossMetadata(metadata: Record<string, string> | undefined): {
  family: Family;
  tactics: Tactic[];
  severity: number;
  kind: DocKind;
  stage?: Stage;
} {
  const m = metadata ?? {};
  const family = (familySet.has(m.family) ? m.family : "benign") as Family;
  const tactics = (m.tactics ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter((t): t is Tactic => tacticSet.has(t));
  const severity = Math.min(5, Math.max(1, Number(m.severity) || 1));
  const kind: DocKind = m.kind === "benign" ? "benign" : "tactic";
  const stage = stageSet.has(m.stage) ? (m.stage as Stage) : undefined;
  return { family, tactics, severity, kind, stage };
}

export function validatePlaybook(docs: unknown[]): PlaybookDoc[] {
  const seen = new Set<string>();
  const out: PlaybookDoc[] = [];
  for (const raw of docs) {
    const d = raw as Partial<PlaybookDoc>;
    if (!d.id || !d.text || !d.family) throw new Error(`Invalid playbook doc: ${JSON.stringify(raw).slice(0, 120)}`);
    if (seen.has(d.id)) throw new Error(`Duplicate playbook id: ${d.id}`);
    if (!familySet.has(d.family)) throw new Error(`Unknown family '${d.family}' in ${d.id}`);
    for (const t of d.tactics ?? []) if (!tacticSet.has(t)) throw new Error(`Unknown tactic '${t}' in ${d.id}`);
    if (d.stage && !stageSet.has(d.stage)) throw new Error(`Unknown stage '${d.stage}' in ${d.id}`);
    seen.add(d.id);
    out.push({
      id: d.id,
      text: d.text.trim(),
      family: d.family,
      tactics: d.tactics ?? [],
      severity: (d.severity ?? 3) as PlaybookDoc["severity"],
      kind: d.kind ?? (d.family === "benign" ? "benign" : "tactic"),
      stage: d.stage,
      region: d.region ?? "GLOBAL",
      note: d.note,
    });
  }
  return out;
}
