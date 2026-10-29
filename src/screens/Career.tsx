/** Career mode's pieces on screen: the summer's news, the board's target, past seasons, and a player's change and career. */
import { AIM_LINE, aimMet } from '../career/career.ts'
import { type Season, squadOf, table } from '../season/season.ts'
import { ordinal } from './format.ts'
import { stagger } from './motion.ts'
import { Swatch } from './Hub.tsx'

/** His overall's change over the summer: "+3", "−2" (nothing in a career's first season or when level). */
export function Change({ season, id }: { season: Season; id: string }) {
  const v = season.career?.people[id]?.change
  if (!v) return null
  return (
    <span className={`change ${v > 0 ? 'up' : 'down'}`} title="Change in overall since last season">
      {v > 0 ? `+${v}` : `−${-v}`}
    </span>
  )
}

/** A player's age, if the game knows it. */
export const ageOf = (season: Season, id: string): number | undefined => season.career?.people[id]?.age

/** "Season 2 · 2027–28". */
export function careerLabel(season: Season): string {
  const y = Number(season.startDate.slice(0, 4))
  return `Season ${season.career!.number} · ${y}–${String(y + 1).slice(2)}`
}

/** The board's target, and once the league is over whether it was met. */
export function BoardLine({ season, over }: { season: Season; over: boolean }) {
  const c = season.career
  if (!c) return null
  const place = table(season).findIndex((r) => r.team === season.userTeam) + 1
  const met = aimMet(c.aim, place, season.teams.length)
  return (
    <p className="meta board-line">
      <span className="eyebrow">Board</span> {AIM_LINE[c.aim]}
      {over && <strong className={met ? 'met' : 'missed'}>{met ? ' · Met' : ' · Missed'}</strong>}
    </p>
  )
}

/** What happened at the club over the summer, shown before the new season's first match. */
export function SummerNote({ season }: { season: Season }) {
  const sm = season.career?.summer
  if (!sm || season.matchday !== 1) return null
  const squad = squadOf(season.teams[season.userTeam])
  const academy = squad.filter((p) => sm.academy.includes(p.id))
  const list = (xs: string[]): string => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`)
  const lines = [
    sm.retired.length > 0 && `${list(sm.retired.map((r) => `${r.name} (${r.age})`))} retired.`,
    sm.signed.length > 0 && `The staff signed ${list(sm.signed)} to replace ${sm.retired.length === 1 ? 'him' : 'them'}.`,
    academy.length > 0 && `Up from the academy: ${list(academy.map((p) => `${p.name} (${season.career!.people[p.id].age}, ${p.role})`))}.`,
    sm.released.length > 0 && `Released: ${list(sm.released)}.`,
  ].filter(Boolean)
  if (!lines.length) return null
  return (
    <div className="summer-note">
      <p className="eyebrow">Over the summer</p>
      {lines.map((l) => (
        <p key={l as string} className="meta">
          {l}
        </p>
      ))}
    </div>
  )
}

/** The career's past seasons, most recent first. */
export function History({ season }: { season: Season }) {
  const past = [...(season.career?.history ?? [])].reverse()
  const titles = past.filter((p) => p.trophies.length).length
  return (
    <div className="history">
      <p className="meta">
        {past.length} {past.length === 1 ? 'season' : 'seasons'} at {season.teams[season.userTeam].name}
        {titles ? `, ${titles} ${titles === 1 ? 'title' : 'titles'}` : ''}.
      </p>
      <div className="table-scroll">
        <table className="league history-table">
          <thead>
            <tr>
              <th className="team">Season</th>
              <th title="Final position">Pos</th>
              <th>Pts</th>
              <th title="The board's target">Board</th>
              <th className="wide">Champions</th>
              <th className="wide">Top scorer</th>
            </tr>
          </thead>
          <tbody>
            {past.map((p, i) => (
              <tr key={p.number} className={`row-in${p.trophies.length ? ' mine' : ''}`} style={stagger(i)}>
                <td className="team">
                  {p.year}–{String(p.year + 1).slice(2)}
                  {p.trophies.length > 0 && <span className="trophy"> · Champions</span>}
                </td>
                <td>{ordinal(p.place)}</td>
                <td className="pts">{p.points}</td>
                <td className={p.met ? 'met' : 'missed'} title={AIM_LINE[p.aim]}>
                  {p.met ? 'Met' : 'Missed'}
                </td>
                <td className="wide">
                  <Swatch kit={season.teams[p.champion].kit} /> {season.teams[p.champion].name}
                </td>
                <td className="wide">{p.clubTopScorer ? `${p.clubTopScorer.name} (${p.clubTopScorer.goals})` : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** A player's past seasons in this career, for his card. */
export function CareerLines({ season, id }: { season: Season; id: string }) {
  const rows = (season.career?.history ?? []).flatMap((p) => (p.lines[id] ? [{ year: p.year, ...p.lines[id] }] : []))
  if (!rows.length) return null
  return (
    <section>
      <h4>Career</h4>
      <table className="league match-log">
        <thead>
          <tr>
            <th className="team">Season</th>
            <th>Age</th>
            <th title="Overall">Rtg</th>
            <th title="Appearances">Apps</th>
            <th title="Goals, assists">G/A</th>
            <th title="Average match rating">Avg</th>
          </tr>
        </thead>
        <tbody>
          {rows.reverse().map((r) => (
            <tr key={r.year}>
              <td className="team">
                {r.year}–{String(r.year + 1).slice(2)}
                {r.club !== season.userTeam && <small className="muted"> {season.teams[r.club].shortName}</small>}
              </td>
              <td>{r.age}</td>
              <td>{r.overall}</td>
              <td>{r.apps}</td>
              <td>
                {r.goals}/{r.assists}
              </td>
              <td>{r.rating?.toFixed(1) ?? '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
