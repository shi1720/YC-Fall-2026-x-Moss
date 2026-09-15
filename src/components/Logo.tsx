export function ShieldGlyph({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="rk-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffc75f" />
          <stop offset="100%" stopColor="#f5a524" />
        </linearGradient>
      </defs>
      <path d="M16 2.5 5 6.8v8.4c0 6.9 4.7 12.6 11 14.3 6.3-1.7 11-7.4 11-14.3V6.8L16 2.5Z" fill="url(#rk-g)" opacity="0.95" />
      <path d="M16 6.2 8.5 9.1v6c0 5 3.3 9.2 7.5 10.6 4.2-1.4 7.5-5.6 7.5-10.6v-6L16 6.2Z" fill="#06080f" opacity="0.85" />
      <path d="M11.5 16.2 14.4 19l6.2-6.6" stroke="#ffd58a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <ShieldGlyph className="h-7 w-7" />
      <span className="display text-2xl tracking-tight text-text">Raksha</span>
    </span>
  );
}
