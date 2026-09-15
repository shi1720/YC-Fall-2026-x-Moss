"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2 } from "lucide-react";
import { Wordmark } from "@/components/Logo";

const links = [
  { href: "/shield", label: "Shield" },
  { href: "/guardian", label: "Guardian" },
  { href: "/playbook", label: "Playbook" },
  { href: "/lab", label: "Latency lab" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Raksha home">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = path === l.href || path.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${active ? "bg-white/10 text-text" : "text-muted hover:bg-white/5 hover:text-text"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/shi1720/YC-Fall-2026-x-Moss"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm hidden sm:inline-flex"
          >
            <Code2 className="h-4 w-4" /> GitHub
          </a>
          <Link href="/shield" className="btn btn-primary btn-sm">
            Try the shield
          </Link>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`rounded-full px-3 py-1 text-xs font-medium ${path.startsWith(l.href) ? "bg-white/10 text-text" : "text-muted"}`}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
