"use client";

import { AnimatePresence, motion } from "motion/react";
import { PhoneOff, ShieldAlert, Volume2, X } from "lucide-react";
import type { Intervention } from "@/lib/engine/types";
import { FAMILY_INFO } from "@/lib/data/families";

export function InterventionOverlay({
  intervention,
  onHangUp,
  onDismiss,
  onSpeak,
}: {
  intervention: Intervention | null;
  onHangUp: () => void;
  onDismiss: () => void;
  onSpeak: () => void;
}) {
  const danger = intervention?.level === "danger";
  const helpline = intervention?.family ? FAMILY_INFO[intervention.family].helpline : "1930";
  return (
    <AnimatePresence>
      {intervention && danger && (
        <motion.div
          key={intervention.t + intervention.headline}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a0608]/90 p-4 backdrop-blur-md"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="intervention-title"
          aria-live="assertive"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="max-h-[90dvh] overflow-y-auto w-full max-w-2xl rounded-3xl border border-danger/50 bg-[#1a0507] p-6 shadow-[0_0_80px_-10px_rgba(239,68,68,0.6)] sm:p-8"
          >
            <div className="flex items-center gap-3 text-danger-2">
              <span className="pulse-ring relative flex h-10 w-10 items-center justify-center rounded-full bg-danger/20">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.25em]">Raksha · scam detected</span>
            </div>
            <h2 id="intervention-title" className="display mt-4 text-3xl leading-tight text-white sm:text-4xl">{intervention.headline}</h2>
            <p className="mt-3 text-lg leading-snug text-white/85">{intervention.body}</p>
            <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Say this, then hang up</div>
              <div className="display mt-1 text-2xl leading-snug text-saffron-2">“{intervention.sayThis}”</div>
            </div>
            {intervention.reasons.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm text-white/70">
                {intervention.reasons.slice(0, 3).map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-danger-2">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button className="btn btn-danger text-base" onClick={onHangUp}>
                <PhoneOff className="h-5 w-5" /> I hung up
              </button>
              <button className="btn btn-ghost" onClick={onSpeak}>
                <Volume2 className="h-4 w-4" /> Read aloud
              </button>
              <button className="btn btn-ghost" onClick={onDismiss}>
                <X className="h-4 w-4" /> Keep listening
              </button>
              <span className="ml-auto text-sm text-white/60">
                Helpline: <span className="mono text-white">{helpline}</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
      {intervention && !danger && (
        <motion.div
          key={"toast-" + intervention.t}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-2xl border border-caution/50 bg-[#1f1505] p-4 shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[28rem]"
          role="status"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-caution" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-caution">{intervention.headline}</div>
              <div className="mt-1 text-sm text-white/80">{intervention.body}</div>
              <div className="mt-2 text-sm text-saffron-2">Say: “{intervention.sayThis}”</div>
            </div>
            <button className="text-white/50 hover:text-white" onClick={onDismiss} aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
