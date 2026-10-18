/** The European cup: each round's ties, legs and who went through. */
import { CUP_NAME, ROUND_NAMES, ROUND_TITLES, cupTeam, tieWinner } from '../draft/cup.ts'
import type { CupFixture, Season } from '../season/season.ts'
import { surname } from '../viewer/commentary.ts'
import { Swatch } from './Hub.tsx'

export function CupBracket({ season }: { season: Season }) {
  const cup = season.cup!
  const name = (side: number): string => cupTeam(season, side).name
  const mine = (f: CupFixture): boolean => f.home === season.userTeam || f.away === season.userTeam
  return (
    <div className="fixtures cup">
      <p className="meta">
        {CUP_NAME}: the top four and twelve sides from the other leagues. Two legs until the final; level on aggregate goes to extra time and penalties.
      </p>
      {ROUND_NAMES.map((round, r) => {
        const legs = cup.fixtures.filter((f) => f.round === r)
        const ties = [...new Set(legs.map((f) => f.tie))]
        return (
          <section key={round}>
            <h3 className="eyebrow">{ROUND_TITLES[r]}</h3>
            {ties.length === 0 ? (
              <p className="meta">Drawn once the {ROUND_TITLES[r - 1].replace('Last', 'last')} {r === 1 ? 'is' : 'are'} over.</p>
            ) : (
              <ul>
                {ties.map((tie) => {
                  const fs = legs.filter((f) => f.tie === tie)
                  const decider = fs.find((f) => f.leg !== 1)!
                  const through = tieWinner(cup, r, tie)
                  const agg = fs.reduce(
                    (n, f) => {
                      if (!f.result) return n
                      const [h, a] = f.result.score
                      return f.home === decider.home ? [n[0] + h, n[1] + a] : [n[0] + a, n[1] + h]
                    },
                    [0, 0],
                  )
                  return fs.map((f) => (
                    <li key={f.id} className={mine(f) ? 'mine' : undefined}>
                      <span className="home">
                        <Swatch kit={cupTeam(season, f.home).kit} /> {name(f.home)}
                      </span>
                      <span className="score">{f.result ? `${f.result.score[0]}–${f.result.score[1]}` : 'v'}</span>
                      <span className="away">
                        {name(f.away)} <Swatch kit={cupTeam(season, f.away).kit} />
                      </span>
                      {f.result && (
                        <span className="scorers">
                          {f.result.goals.map((g) => `${surname(g.scorer)}${g.ownGoal ? ' (og)' : ''} ${g.clock}`).join(', ')}
                          {f === decider && (
                            <strong className="through">
                              {f.result.goals.length > 0 ? ' · ' : ''}
                              {f.leg === 2 && `Agg ${agg[0]}–${agg[1]}${f.result.aet ? ' aet' : ''}`}
                              {f.leg === 0 && f.result.aet && 'After extra time'}
                              {f.result.pens && ` · ${Math.max(...f.result.pens)}–${Math.min(...f.result.pens)} on penalties`}
                              {through !== null && ` · ${name(through)} ${r === ROUND_NAMES.length - 1 ? 'win the cup' : 'go through'}`}
                            </strong>
                          )}
                        </span>
                      )}
                    </li>
                  ))
                })}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
