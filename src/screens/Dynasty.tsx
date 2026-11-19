/** A dynasty's story on the hub (draft/dynasty.ts): every season so far, and its all-time leaders. */
import { dynastyTotals } from '../draft/dynasty.ts'
import type { Season } from '../season/season.ts'
import { shortName } from '../names.ts'
import { ordinal } from './format.ts'
import { Stars } from './RunGoals.tsx'

export function DynastyCard({ season }: { season: Season }) {
  const d = season.dynasty
  if (!d) return null
  const totals = Object.entries(dynastyTotals(season))
  const top = (key: 'goals' | 'apps' | 'assists'): string =>
    totals
      .filter(([, l]) => l[key] > 0)
      .sort((a, b) => b[1][key] - a[1][key] || a[0].localeCompare(b[0]))
      .slice(0, 3)
      .map(([name, l]) => `${shortName(name)} ${l[key]}`)
      .join(' · ')
  const titles = d.past.filter((x) => x.place === 1).length
  const cups = d.past.filter((x) => x.cup).length
  return (
    <div className="dynasty-card">
      <p className="eyebrow">
        Your dynasty · season {d.season}
        {titles || cups ? ` · ${[titles && `${titles} ${titles === 1 ? 'title' : 'titles'}`, cups && `${cups} European ${cups === 1 ? 'Cup' : 'Cups'}`].filter(Boolean).join(', ')}` : ''}
      </p>
      <ul className="dynasty-seasons">
        {d.past.map((x, i) => (
          <li key={i}>
            <span className="dynasty-season">Season {i + 1}</span>
            <span className="dynasty-place">
              {ordinal(x.place)} · {x.points} pts{x.cup ? ' · European Cup' : ''}
              {x.scorer ? <small>{`${shortName(x.scorer.name)} ${x.scorer.goals} goals`}</small> : null}
            </span>
            <Stars n={x.stars} of={x.of} />
          </li>
        ))}
      </ul>
      <p className="meta dynasty-leaders">
        <span>All-time goals: {top('goals') || '–'}</span>
        <span>Assists: {top('assists') || '–'}</span>
        <span>Appearances: {top('apps') || '–'}</span>
      </p>
    </div>
  )
}
