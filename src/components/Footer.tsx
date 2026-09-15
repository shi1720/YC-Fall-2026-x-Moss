import { ShieldGlyph } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <ShieldGlyph className="h-6 w-6" />
          <div>
            <div className="text-text">Raksha</div>
            <div>Built for the YC Fall 2026 × Moss Zero Latency Builder Sprint.</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <span>
            Built by <span className="text-text">Shivam Gupta</span> with Claude.
          </span>
          <a className="hover:text-text" href="https://moss.dev" target="_blank" rel="noreferrer">
            Retrieval by Moss
          </a>
          <a className="hover:text-text" href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">
            Report a scam: 1930 · cybercrime.gov.in
          </a>
        </div>
      </div>
    </footer>
  );
}
