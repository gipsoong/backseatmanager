import { describe, expect, it } from 'vitest'
import { createSeason, matchdays, type Season } from '../season/season.ts'
import { aimText, bonusText, goalState, runGoal, starsOf } from './goals.ts'

/** A draft-mode season with every result set by `score` (home, away goals). */
function played(score: (home: number, away: number) => [number, number]): Season {
  const s = createSeason(4, 0, new Date('2026-08-01'))
  const fixtures = s.fixtures.map((f) => ({ ...f, result: { score: score(f.home, f.away), goals: [], xg: [1, 1] as [number, number], appearances: [], injuries: [] } }))
  return { ...s, mode: 'draft', fixtures, matchday: matchdays(s) + 1 }
}

describe('draft run goals', () => {
  it('are the same every time for a season, and read as sentences', () => {
    const s = createSeason(9, 3, new Date('2026-08-01'))
    expect(runGoal(s)).toEqual(runGoal(s))
    expect(aimText(runGoal(s))).toMatch(/^(Win the league|Finish \d+(st|nd|rd|th) or higher)$/)
    expect(bonusText(runGoal(s), 'Rivals')).not.toBe('')
    const g = goalState(s)
    expect(g.met).toBe(false)
  })

  it('give three stars to a side that wins everything, none to one that loses everything', () => {
    const win = played((h, a) => (h === 0 ? [3, 0] : a === 0 ? [0, 3] : [1, 1]))
    expect(goalState(win).place).toBe(1)
    // (Aim and standout; the bonus too unless it needs a scorer, which made-up results don't have.)
    expect(starsOf(win)).toBeGreaterThanOrEqual(2)
    const lose = played((h, a) => (h === 0 ? [0, 2] : a === 0 ? [2, 0] : [1, 1]))
    expect(starsOf(lose)).toBe(0)
    expect(goalState(lose).failed).toBe(true)
  })
})
