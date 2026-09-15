import { TACTIC_INFO } from "@/lib/data/families";
import type { Tactic } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

const ASK = new Set<Tactic>(["otp_request", "payment_method", "remote_access", "personal_info", "victim_compliance"]);

export function TacticChip({ tactic, className }: { tactic: Tactic; className?: string }) {
  const info = TACTIC_INFO[tactic];
  const isAsk = ASK.has(tactic);
  return (
    <span className={cn("chip", isAsk ? "chip-danger" : info.pressure ? "chip-caution" : "", className)} title={info.description}>
      {info.label}
    </span>
  );
}
