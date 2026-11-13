/**
 * The manager's league position after each matchday so far: one line, 1st at the top. Hover (or
 * tap) a point for its matchday and place.
 */
import { useMemo, useState } from 'react'
import { type Season, matchdays, table } from '../season/season.ts'
import { ordinal } from './format.ts'

/** His place after each matchday played (index 0 = after matchday 1). */
export function positionsOf(s: Season): number[] {
  const played = Math.min(s.matchday - 1, matchdays(s))
  const out: number[] = []
  for (let md = 1; md <= played; md++) out.push(table(s, md + 1).findIndex((r) => r.team === s.userTeam) + 1)
  return out
}

const W = 320
const H = 120
const PAD = { l: 30, r: 10, t: 10, b: 20 }

export function PositionChart({ season }: { season: Season }) {
  const places = useMemo(() => positionsOf(season), [season])
  const [hover, setHover] = useState<number | null>(null)
  const n = season.teams.length
  const total = matchdays(season)
  if (places.length < 3) return null
  const x = (i: number): number => PAD.l + (i / Math.max(1, total - 1)) * (W - PAD.l - PAD.r)
  const y = (p: number): number => PAD.t + ((p - 1) / (n - 1)) * (H - PAD.t - PAD.b)
  const path = places.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join('')
  const h = hover ?? places.length - 1
  const step = (W - PAD.l - PAD.r) / Math.max(1, total - 1)
  return (
    <figure className="pos-chart">
      <figcaption className="eyebrow">Your place, matchday by matchday</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`League position after each matchday: ${places.map(ordinal).join(', ')}`} onMouseLeave={() => setHover(null)}>
        {[1, Math.ceil(n / 2), n].map((p) => (
          <g key={p}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(p)} y2={y(p)} className="pos-grid" />
            <text x={PAD.l - 6} y={y(p) + 3.5} className="pos-tick" textAnchor="end">
              {ordinal(p)}
            </text>
          </g>
        ))}
        <text x={PAD.l} y={H - 4} className="pos-tick">
          MD 1
        </text>
        <text x={W - PAD.r} y={H - 4} className="pos-tick" textAnchor="end">
          MD {total}
        </text>
        <path d={path} className="pos-line" />
        <line x1={x(h)} x2={x(h)} y1={PAD.t} y2={H - PAD.b} className="pos-cross" />
        <circle cx={x(h)} cy={y(places[h])} r={4} className="pos-dot" />
        {places.map((_, i) => (
          <rect key={i} x={x(i) - step / 2} y={0} width={step} height={H} fill="transparent" onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} />
        ))}
      </svg>
      <p className="pos-read">
        After matchday {h + 1}: <strong>{ordinal(places[h])}</strong>
      </p>
    </figure>
  )
}
