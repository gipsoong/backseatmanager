/**
 * Before a league match: the two sides next to each other (place, form, the eleven's overall, top
 * scorer) and how it went when they met earlier in the season.
 */
import { type ReactNode, useMemo } from 'react'
import { shortName } from '../names.ts'
import { type Fixture, type Season, lineupFor, playerRating, squadOf, table } from '../season/season.ts'

const ordinal = (n: number): string => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
  return `${n}${s}`
}

function sideOf(season: Season, club: number, place: number, form: ('W' | 'D' | 'L')[]) {
  const squad = squadOf(season.teams[club])
  const xi = lineupFor(season, club).map((id) => squad.find((p) => p.id === id)!)
  const eleven = Math.round(xi.reduce((n, p) => n + playerRating(p), 0) / xi.length)
  let top: { name: string; goals: number } | null = null
  for (const p of squad) {
    const g = season.stats[p.id]?.goals ?? 0
    if (g > 0 && (!top || g > top.goals)) top = { name: shortName(p.name), goals: g }
  }
  return { place, form, eleven, top }
}

export function Preview({ season, fixture }: { season: Season; fixture: Fixture }) {
  const view = useMemo(() => {
    const rows = table(season)
    const at = (club: number) => {
      const i = rows.findIndex((r) => r.team === club)
      return sideOf(season, club, i + 1, rows[i].form)
    }
    const earlier = season.fixtures.find(
      (f) => f.result && f.id !== fixture.id && f.home === fixture.away && f.away === fixture.home,
    )
    return { home: at(fixture.home), away: at(fixture.away), earlier }
  }, [season, fixture])
  const started = season.matchday > 1
  const { home, away, earlier } = view
  const line = (label: string, h: ReactNode, a: ReactNode, title?: string) => (
    <div className="tape-row" title={title}>
      <span className="tape-h">{h}</span>
      <span className="tape-label">{label}</span>
      <span className="tape-a">{a}</span>
    </div>
  )
  const dots = (form: ('W' | 'D' | 'L')[]) =>
    form.length ? form.map((f, i) => <span key={i} className={`f ${f}`} title={f === 'W' ? 'Won' : f === 'D' ? 'Drawn' : 'Lost'} />) : '–'
  return (
    <div className="tape" aria-label="Match preview">
      {started && line('Place', ordinal(home.place), ordinal(away.place))}
      {started && line('Form', dots(home.form), dots(away.form), 'Last five, oldest first')}
      {line('Eleven', home.eleven, away.eleven, 'Average overall of the side picked this week')}
      {started && line('Top scorer', home.top ? `${home.top.name} ${home.top.goals}` : '–', away.top ? `${away.top.name} ${away.top.goals}` : '–')}
      {earlier?.result && (
        <p className="tape-note">
          Earlier this season: {season.teams[earlier.home].shortName} {earlier.result.score[0]}–{earlier.result.score[1]}{' '}
          {season.teams[earlier.away].shortName}
        </p>
      )}
    </div>
  )
}
