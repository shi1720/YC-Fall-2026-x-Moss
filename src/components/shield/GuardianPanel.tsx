"use client";

import { useState, useSyncExternalStore } from "react";
import { Copy, ExternalLink, Users } from "lucide-react";

export function GuardianPanel({ familyCode, onChangeCode, messages, disabled }: { familyCode: string; onChangeCode: (c: string) => void; messages: Array<{ text: string; from: string; t: number }>; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const guardianUrl = `${origin}/guardian?code=${familyCode}`;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted">
        <Users className="h-3.5 w-3.5 text-saffron" /> Circle of trust
      </div>
      <p className="text-sm text-muted">Share this family code with someone you trust. They see the risk of your calls in real time and can speak to you through the shield.</p>
      <div className="flex gap-2">
        <input
          className="input mono uppercase tracking-[0.3em]"
          value={familyCode}
          maxLength={8}
          disabled={disabled}
          onChange={(e) => onChangeCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          aria-label="Family code"
        />
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            void navigator.clipboard?.writeText(guardianUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          title="Copy guardian link"
        >
          <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <a href={guardianUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-saffron hover:underline">
        Open the guardian view in a new tab <ExternalLink className="h-3.5 w-3.5" />
      </a>
      {messages.length > 0 && (
        <div className="space-y-1.5">
          {messages.slice(-3).map((m, i) => (
            <div key={i} className="rounded-xl border border-saffron/30 bg-saffron/10 px-3 py-2 text-sm text-saffron-2">
              <span className="font-semibold">{m.from}:</span> {m.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
