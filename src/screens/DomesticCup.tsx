/** The domestic cup in the career hub's Cup tab: where the manager's club stands, and every round's ties. */
import type { CupFixture, Season } from '../season/season.ts'
import { tieWinner } from '../draft/cup.ts'
import { DOMESTIC_CUP, cupDate, cupOf, cupRun, domesticWinner, roundName, roundTitle, roundsOf, stillInCup } from '../career/cup.ts'
import { surname } from '../viewer/commentary.ts'
import { Swatch } from './Hub.tsx'
import { stagger } from './motion.ts'

const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

/** "2–2, 4–3 on penalties", "1–0 aet". */
export function cupScore(f: CupFixture): string {
  const r = f.result!
  const score = `${r.score[0]}–${r.score[1]}`
  if (r.pens) return `${score} (${r.pens[0]}–${r.pens[1]} pens)`
  return r.aet ? `${score} aet` : score
}

/** Where the manager's club stands in this season's cup, in a line. */
export function cupLine(season: Season): string | null {
  const cup = cupOf(season)
  if (!cup) return null
  const me = season.userTeam
  const rounds = roundsOf(cup)
  const winner = domesticWinner(cup)
  if (winner === me) return `${season.teams[me].name} won the ${DOMESTIC_CUP}.`
  if (stillInCup(cup, me)) {
    const next = cup.fixtures.find((f) => !f.result && (f.home === me || f.away === me))
    if (next)
      return `${roundName(next.round, rounds)}: ${next.home === me ? 'at home to' : 'away to'} ${season.teams[next.home === me ? next.away : next.home].name}, ${dateFmt.format(cupDate(season, next))}.`
    return `A bye through the first round, into the ${roundName(1, rounds).toLowerCase()}.`
  }
  const lost = cup.fixtures.find((f) => f.result && (f.home === me || f.away === me) && tieWinner(cup, f.round, f.tie) !== me)
  const by = lost ? season.teams[lost.home === me ? lost.away : lost.home].name : ''
  const run = cupRun(cup, me)
  const end = winner === null ? '' : ` ${season.teams[winner].name} won it.`
  return `Out in the ${(run ?? '').toLowerCase()}${by ? `, to ${by}` : ''}.${end}`
}

export function DomesticCup({ season }: { season: Season }) {
  const cup = cupOf(season)
  if (!cup) return <p className="meta pad">The {DOMESTIC_CUP} starts next season.</p>
  const rounds = roundsOf(cup)
  const played = [...new Set(cup.fixtures.map((f) => f.round))].sort((a, b) => b - a)
  const name = (side: number): string => season.teams[side].name
  return (
    <div className="fixtures domestic-cup">
      <p className="meta pad">
        All {season.teams.length} clubs, one match a tie, extra time and penalties if it's level. {cupLine(season)}
      </p>
      {played.map((r) => {
        const ties = cup.fixtures.filter((f) => f.round === r)
        return (
          <section key={r} className="cup-round">
            <h4 className="eyebrow pad-x">
              {roundTitle(r, rounds)} · {dateFmt.format(cupDate(season, ties[0]))}
            </h4>
            <ul>
              {ties.map((f, i) => {
                const won = f.result ? tieWinner(cup, f.round, f.tie) : null
                const mine = f.home === season.userTeam || f.away === season.userTeam
                return (
                  <li key={f.id} className={`row-in${mine ? ' mine' : ''}`} style={stagger(i)}>
                    <span className={`home${won === f.home ? ' through' : ''}`}>
                      <Swatch kit={season.teams[f.home].kit} /> {name(f.home)}
                    </span>
                    <span className="score">{f.result ? cupScore(f) : 'v'}</span>
                    <span className={`away${won === f.away ? ' through' : ''}`}>
                      {name(f.away)} <Swatch kit={season.teams[f.away].kit} />
                    </span>
                    {f.result && f.result.goals.length > 0 && (
                      <span className="scorers">
                        {f.result.goals.map((g) => `${surname(g.scorer)}${g.ownGoal ? ' (og)' : ''} ${g.clock}`).join(', ')}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
      {!cup.fixtures.some((f) => f.round === 1) && cup.entrants.length > cup.fixtures.filter((f) => f.round === 0).length * 2 && (
        <p className="meta pad">
          Byes to the {roundName(1, rounds).toLowerCase()}:{' '}
          {cup.entrants
            .slice(cup.fixtures.filter((f) => f.round === 0).length * 2)
            .map(name)
            .join(', ')}
          .
        </p>
      )}
    </div>
  )
}
