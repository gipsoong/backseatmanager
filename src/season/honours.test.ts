import { describe, expect, it } from 'vitest'
import { type Result, createSeason, completeMatchday, fixturesOn } from './season.ts'
import { honours } from './review.ts'

/** Four matchdays where every home striker scores three and rates 9, everyone else 6.5. */
function played() {
  let s = createSeason(3, 0, new Date(Date.UTC(2026, 5, 1)))
  for (let md = 1; md <= 4; md++) {
    const results = new Map<number, Result>()
    for (const f of fixturesOn(s, md)) {
      const home = s.teams[f.home].players
      const away = s.teams[f.away].players
      const striker = home[10]
      const app = (id: string, star: boolean) => ({ id, minutes: 90, rating: star ? 9 : 6.5, goals: star ? 3 : 0, assists: 0, energy: 0.5 })
      results.set(f.id, {
        score: [3, 0],
        goals: [0, 1, 2].map(() => ({ team: 0 as const, scorer: striker.id, clock: "50'", ownGoal: false })),
        xg: [2, 0.5],
        appearances: [...home.map((p) => app(p.id, p === striker)), ...away.map((p) => app(p.id, false))],
        injuries: [],
      })
    }
    s = completeMatchday(s, results)
  }
  return s
}

describe('season honours', () => {
  it('find hat-tricks, the best displays, a player of the month and a golden boot', () => {
    const s = played()
    const h = honours(s)
    expect(h.hatTricks.length, String(h.hatTricks.length)).toBe(40)
    expect(h.hatTricks.every((x) => x.line.startsWith('Hat-trick'))).toBe(true)
    expect(h.displays).toHaveLength(3)
    expect(h.displays.every((x) => x.rating === 9)).toBe(true)
    expect(h.months).toHaveLength(1)
    const boot = h.awards.find((a) => a.title === 'Golden Boot')!
    expect(boot.who.st.goals).toBeGreaterThanOrEqual(6)
    expect(new Set(h.awards.map((a) => a.title)).size).toBe(h.awards.length)
  })
})
