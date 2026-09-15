export function Sparkline({ points, height = 48, className = "" }: { points: Array<{ t: number; score: number }>; height?: number; className?: string }) {
  const w = 240;
  if (points.length < 2) return <div className={className} style={{ height }} />;
  const xs = points.map((p) => p.t);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs) || 1;
  const path = points
    .map((p, i) => {
      const x = ((p.t - minX) / Math.max(1, maxX - minX)) * (w - 4) + 2;
      const y = height - 2 - (p.score / 100) * (height - 4);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = points[points.length - 1];
  const color = last.score >= 60 ? "var(--danger)" : last.score >= 25 ? "var(--caution)" : "var(--safe)";
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={className} preserveAspectRatio="none" style={{ height, width: "100%" }}>
      <line x1={0} x2={w} y1={height - 2 - 0.6 * (height - 4)} y2={height - 2 - 0.6 * (height - 4)} stroke="rgba(239,68,68,0.35)" strokeDasharray="3 3" />
      <line x1={0} x2={w} y1={height - 2 - 0.25 * (height - 4)} y2={height - 2 - 0.25 * (height - 4)} stroke="rgba(245,158,11,0.3)" strokeDasharray="3 3" />
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}
