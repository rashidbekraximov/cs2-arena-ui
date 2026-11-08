/** Oddiy SVG chiziqli grafik — ELO tarixi (kutubxonasiz). */
export default function EloChart({ points, height = 160 }) {
  if (!points || points.length < 2) {
    return <div className="muted small center chart-empty">Grafik uchun kamida 2 ta match kerak</div>
  }
  const w = 600
  const pad = 12
  const values = points.map((p) => p.elo)
  const min = Math.min(...values) - 10
  const max = Math.max(...values) + 10
  const x = (i) => pad + (i * (w - pad * 2)) / (points.length - 1)
  const y = (v) => pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2)
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.elo).toFixed(1)}`).join(' ')
  const area = `${line} L${x(points.length - 1)},${height - pad} L${x(0)},${height - pad} Z`

  return (
    <svg className="elo-chart" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" role="img" aria-label="ELO tarixi">
      <defs>
        <linearGradient id="eloFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#eloFill)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
