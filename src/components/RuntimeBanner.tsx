"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { readMossStatus, type MossStatus } from "@/lib/client/moss";
export function RuntimeBanner() {
  const path = usePathname();
  const [status, setStatus] = useState<MossStatus | null>(null);
  useEffect(() => {
    let cancelled = false;
    const update = () => { void readMossStatus().then(s => { if (!cancelled) setStatus(s); }).catch(() => { if (!cancelled) setStatus(null); }); };
    update();
    window.addEventListener("raksha-moss-changed", update);
    const timer = setInterval(update, 15000);
    return () => { cancelled = true; clearInterval(timer); window.removeEventListener("raksha-moss-changed", update); };
  }, [path]);
  if (path === "/settings") return null;
  const ready = status?.status === "ready";
  const attention = status && ["error", "expired", "connecting"].includes(status.status);
  return <div className={`border-b ${ready ? "border-moss/20 bg-moss/5" : "border-saffron/20 bg-saffron/5"}`}><div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 text-xs sm:px-6"><KeyRound className={`h-4 w-4 shrink-0 ${ready ? "text-moss" : "text-saffron"}`} /><p className="min-w-0 flex-1 leading-relaxed">{ready ? "Your Moss project is connected. New calls, Playbook search and Lab queries use live semantic retrieval." : attention ? "Your Moss session needs attention. Open Settings to finish setup, reconnect or return to demo mode." : status?.sharedMode === "moss" ? "Shared Moss runtime active. You can also test with your own project." : "Demo mode uses an offline text detector. Connect your own Moss project for live semantic retrieval."}</p><Link href="/settings" className="inline-flex items-center gap-1 font-semibold text-saffron hover:underline">{ready ? "Manage connection" : "Moss settings"}<ArrowRight className="h-3 w-3" /></Link></div></div>;
}
