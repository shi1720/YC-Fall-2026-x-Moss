import type { Utterance } from "@/lib/engine/types";
const STOP = new Set("what who they them their this that have does did asked ask please about claim claimed said tell were from with when where how".split(" "));
/** Text-only fallback. Returns original evidence, never a generated answer. */
export function searchTranscript(transcript: Utterance[], question: string) {
  const terms = new Set(question.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP.has(w)));
  if (/\b(who|claim|claimed|identity)\b/i.test(question)) {
    for (const w of "officer inspector police cbi bank branch calling speaking microsoft support cfo lawyer".split(" ")) terms.add(w);
  }
  if (/\b(money|payment|transfer)\b/i.test(question)) {
    for (const w of "money rupees lakh crore transfer pay payment fee account deposit wire".split(" ")) terms.add(w);
  }
  if (/\b(otp|code|pin)\b/i.test(question)) {
    for (const w of "otp code pin password cvv".split(" ")) terms.add(w);
  }
  return transcript.map(u => ({ u, count: [...new Set(u.text.toLowerCase().split(/\W+/))].filter(w => terms.has(w)).length }))
    .filter(x => x.count > 0).sort((a, b) => b.count - a.count).slice(0, 4)
    .map(({ u, count }) => ({ text: u.text, speaker: u.speaker, score: count / Math.max(1, terms.size), t: u.t }));
}
