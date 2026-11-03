import { describe, expect, it } from 'vitest'
import { type Result, type Season, completeMatchday, createSeason, fixturesOn, matchdays, squadOf } from '../season/season.ts'
import { CUP_TROPHY, elevenRating, managerRecord, nextSeason, startCareer } from './career.ts'
import { fakePlayed } from './fake.ts'
import {
  completeCupDay,
  cupDate,
  cupRounds,
  cupRun,
  cupSchedule,
  cupToday,
  domesticCupMatches,
  domesticWinner,
  isDomesticCupDay,
  roundName,
  stillInCup,
  userCupTie,
} from './cup.ts'

const start = (seed: number): Season => startCareer(createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1))))
const result = (score: [number, number], pens?: [number, number]): Result => ({ score, goals: [], xg: [1, 1], appearances: [], injuries: [], ...(pens ? { aet: true, pens } : {}) })

/** The season played out: each cup day before its league matchday, `pick` deciding each tie. */
function playThrough(s: Season, cupResult: (home: number, away: number) => Result): Season {
  while (s.matchday <= matchdays(s)) {
    if (isDomesticCupDay(s)) {
      s = completeCupDay(s, new Map(cupToday(s).map((f) => [f.id, cupResult(f.home, f.away)])))
      continue
    }
    s = completeMatchday(s, new Map(fixturesOn(s, s.matchday).map((f) => [f.id, result([1, 1])])))
  }
  return s
}

describe('the domestic cup', () => {
  const s = start(3)
  const cup = s.career!.cup!

  it('is drawn when the season starts: the eight weakest play a first round, the other twelve have byes', () => {
    expect(cupRounds(20)).toBe(5)
    expect(cupRounds(16)).toBe(4)
    expect(cupRounds(10)).toBe(4)
    expect(cup.entrants).toHaveLength(20)
    expect(new Set(cup.entrants).size).toBe(20)
    const first = cup.fixtures.filter((f) => f.round === 0)
    expect(first).toHaveLength(4)
    const playing = first.flatMap((f) => [f.home, f.away])
    const strength = s.teams.map((_, i) => elevenRating(s, i))
    const weakest = s.teams.map((_, i) => i).sort((a, b) => strength[a] - strength[b]).slice(0, 8)
    expect([...playing].sort()).toEqual([...weakest].sort())
    expect(first.every((f) => f.leg === 0 && f.result === null)).toBe(true)
    expect(roundName(0, 5)).toBe('First round')
    expect(roundName(1, 5)).toBe('Last 16')
    expect(roundName(4, 5)).toBe('Final')
  })

  it('plays its rounds midweek, spread through the season and done before the end', () => {
    const days = cupSchedule(s)
    expect(days).toHaveLength(5)
    for (let i = 1; i < days.length; i++) expect(days[i]).toBeGreaterThan(days[i - 1] + 3)
    expect(days[0]).toBeGreaterThan(1)
    expect(days.at(-1)!).toBeLessThan(matchdays(s) - 2)
    expect(cupDate(s, cup.fixtures[0]).getUTCDay()).toBe(3)
    // Not a cup day until its matchday comes round.
    expect(isDomesticCupDay(s)).toBe(false)
    expect(isDomesticCupDay({ ...s, matchday: days[0] })).toBe(true)
  })

  it('draws each round from the last one’s winners and the byes, and ends with a winner', () => {
    // The home side always goes through: on the night, or on penalties in every other tie.
    let n = 0
    const done = playThrough(s, () => (n++ % 2 ? result([2, 1]) : result([1, 1], [5, 4])))
    const c = done.career!.cup!
    const winner = domesticWinner(c)
    expect(winner).not.toBeNull()
    for (let r = 1; r < 5; r++) {
      const ties = c.fixtures.filter((f) => f.round === r)
      expect(ties).toHaveLength(16 >> r)
      const sides = ties.flatMap((f) => [f.home, f.away])
      expect(new Set(sides).size).toBe(sides.length)
      // Everyone in the round won the round before, or had a bye.
      const before = c.fixtures.filter((f) => f.round === r - 1).map((f) => f.home)
      const byes = r === 1 ? c.entrants.slice(8) : []
      for (const x of sides) expect([...before, ...byes]).toContain(x)
    }
    expect(c.fixtures).toHaveLength(4 + 8 + 4 + 2 + 1)
    expect(cupRun(c, winner!)).toBe('Winners')
    expect(stillInCup(c, winner!)).toBe(false)
    // The cup doesn't count in the league's player stats or table.
    expect(done.fixtures.every((f) => f.result)).toBe(true)
  })

  it('carries fitness and injuries on from a cup match', () => {
    const day = { ...s, matchday: cupSchedule(s)[0] }
    const f = cupToday(day)[0]
    const home = domesticCupMatches(day, [f])[0].home
    expect(domesticCupMatches(day, [f])[0].knockout).toEqual({})
    const [tired, hurt] = [home.players[3].id, home.players[4].id]
    const r = {
      ...result([1, 0]),
      appearances: [
        { id: tired, minutes: 90, rating: 6.5, goals: 0, assists: 0, energy: 0.4 },
        { id: hurt, minutes: 90, rating: 6.5, goals: 0, assists: 0, energy: 0.6 },
      ],
      injuries: [{ id: hurt, weeks: 2 }],
    }
    const after = completeCupDay(day, new Map(cupToday(day).map((g) => [g.id, g === f ? r : result([1, 0])])))
    expect(after.condition[tired].fitness).toBeLessThan(1)
    expect(after.condition[tired].fitness).toBeGreaterThan(0.4)
    // Midweek: out for this weekend's league match and the next.
    expect(after.condition[hurt].injuredUntil).toBe(day.matchday + 2)
    expect(after.matchday).toBe(day.matchday)
    expect(after.stats[tired]).toEqual(day.stats[tired])
  })

  it('puts the winner in the history and the manager’s record', () => {
    // The manager's club wins every tie it plays; everyone else's home side goes through.
    const done = playThrough(s, (_home, away) => (away === 0 ? result([0, 1]) : result([1, 0])))
    expect(domesticWinner(done.career!.cup!)).toBe(0)
    const next = nextSeason(fakePlayed(done))
    const h = next.career!.history[0]
    expect(h.cup).toEqual({ winner: 0, run: 'Winners' })
    expect(h.trophies).toContain(CUP_TROPHY)
    const rec = managerRecord(next.career!.history)
    expect(rec.cups).toBe(1)
    expect(rec.seasons).toBe(1)
    const ties = done.career!.cup!.fixtures.filter((f) => f.home === 0 || f.away === 0).length
    expect(rec.played).toBe(matchdays(s) + ties)
    expect(rec.won).toBe(ties)
    expect(rec.drawn).toBe(matchdays(s))
    // A new cup for the new season, nobody's tie played yet.
    expect(next.career!.cup!.fixtures.every((f) => !f.result)).toBe(true)
    expect(userCupTie(next)).toBeUndefined()
    for (const p of next.teams.flatMap(squadOf)) expect(next.condition[p.id]).toBeDefined()
  })
})
