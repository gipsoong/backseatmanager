import { describe, expect, it } from 'vitest'
import { FORMATIONS, runMatch } from '../engine/index.ts'
import { clubRecords, leaderboards } from './stats.ts'
import { BENCH_SIZE, LEAGUE_SIZE, type Result, autoPick, completeMatchday, createSeason, fitnessFor, matchdays, fixturesOn, isOver, matchTeam, matchdayDate, resultOf, roundRobin, squadOf, table, userFixture } from './season.ts'

describe('fixtures', () => {
  it('pairs everyone once per round, and everyone with everyone over the rounds', () => {
    const n = 10
    const rounds = roundRobin(n)
    expect(rounds).toHaveLength(n - 1)
    const met = new Set<string>()
    for (const r of rounds) {
      const teams = r.flat()
      expect(new Set(teams).size).toBe(n)
      for (const [h, a] of r) met.add([Math.min(h, a), Math.max(h, a)].join('-'))
    }
    expect(met.size).toBe((n * (n - 1)) / 2)
  })

  it('has every team at home and away against each other once, one game a matchday', () => {
    const s = createSeason(7, 0, new Date('2026-03-01'))
    expect(s.fixtures).toHaveLength((LEAGUE_SIZE * matchdays(s)) / 2)
    const pairs = new Set(s.fixtures.map((f) => `${f.home}>${f.away}`))
    expect(pairs.size).toBe(LEAGUE_SIZE * (LEAGUE_SIZE - 1))
    for (let md = 1; md <= matchdays(s); md++) {
      const teams = fixturesOn(s, md).flatMap((f) => [f.home, f.away])
      expect(new Set(teams).size).toBe(LEAGUE_SIZE)
    }
    // Nobody plays more than two in a row at home, or away.
    for (let t = 0; t < LEAGUE_SIZE; t++) {
      const venues = s.fixtures.filter((f) => f.home === t || f.away === t).sort((a, b) => a.matchday - b.matchday).map((f) => f.home === t)
      for (let i = 2; i < venues.length; i++) expect(venues[i] === venues[i - 1] && venues[i] === venues[i - 2]).toBe(false)
    }
  })

  it('is the same league every time for the same seed, with distinct names and short names', () => {
    const a = createSeason(42, 3, new Date('2026-03-01'))
    const b = createSeason(42, 3, new Date('2026-03-01'))
    expect(b).toEqual(a)
    expect(new Set(a.teams.map((t) => t.name)).size).toBe(LEAGUE_SIZE)
    expect(new Set(a.teams.map((t) => t.shortName)).size).toBe(LEAGUE_SIZE)
  })

  it('plays on Saturdays, weekly, from August', () => {
    const s = createSeason(1, 0, new Date('2026-09-26'))
    expect(s.startDate).toBe('2027-08-07')
    expect(matchdayDate(s, 1).getUTCDay()).toBe(6)
    expect(matchdayDate(s, 2).getTime() - matchdayDate(s, 1).getTime()).toBe(7 * 86_400_000)
  })
})

describe('results and the table', () => {
  const win = (h: number, a: number): Result => ({ score: [h, a], goals: [], xg: [0, 0], appearances: [], injuries: [] })

  it('records a matchday and moves on; refuses a matchday with a result missing', () => {
    const s = createSeason(3, 0, new Date('2026-03-01'))
    const today = fixturesOn(s, 1)
    expect(() => completeMatchday(s, new Map([[today[0].id, win(1, 0)]]))).toThrow()
    const next = completeMatchday(s, new Map(today.map((f) => [f.id, win(2, 1)])))
    expect(next.matchday).toBe(2)
    expect(fixturesOn(next, 1).every((f) => f.result)).toBe(true)
    expect(userFixture(next, 2)).toBeDefined()
  })

  it('awards 3 for a win, 1 for a draw; sorts by points, goal difference, goals', () => {
    let s = createSeason(3, 0, new Date('2026-03-01'))
    const today = fixturesOn(s, 1)
    s = completeMatchday(s, new Map(today.map((f, i) => [f.id, i === 0 ? win(3, 0) : i === 1 ? win(1, 1) : win(0, 1)])))
    const rows = table(s)
    const top = rows[0]
    expect(top.team).toBe(today[0].home)
    expect(top.points).toBe(3)
    expect(top.goalsFor - top.goalsAgainst).toBe(3)
    const drew = rows.find((r) => r.team === today[1].home)!
    expect(drew.points).toBe(1)
    expect(drew.form).toEqual(['D'])
    expect(rows.reduce((n, r) => n + r.played, 0)).toBe(LEAGUE_SIZE)
  })

  it('takes a finished match as its result, the same one it would have been watched', () => {
    const s = createSeason(5, 0, new Date('2026-03-01'))
    const f = fixturesOn(s, 1)[0]
    const a = resultOf(runMatch(s.teams[f.home], s.teams[f.away], { seed: f.seed }))
    const b = resultOf(runMatch(s.teams[f.home], s.teams[f.away], { seed: f.seed }))
    expect(b).toEqual(a)
    expect(a.goals.filter((g) => g.team === 0)).toHaveLength(a.score[0])
    expect(isOver(s)).toBe(false)
  })
})

describe('squads, fitness and injuries', () => {
  it('picks a full eleven of available players, with a bench from the rest', () => {
    const s = createSeason(9, 0, new Date('2026-03-01'))
    const xi = autoPick(s, 0)
    expect(new Set(xi).size).toBe(11)
    const t = matchTeam(s, 0)
    expect(t.players).toHaveLength(11)
    expect(t.bench.length).toBeGreaterThan(0)
    expect(t.bench.some((p) => t.players.includes(p))).toBe(false)
    expect(t.bench).toHaveLength(BENCH_SIZE)
    // Everyone fit and in his own position where the squad allows: nobody's first choice is
    // shunted to the wrong slot because it came first.
    const slots = FORMATIONS[s.teams[0].formation]
    const squad = squadOf(s.teams[0])
    xi.forEach((id, i) => {
      const p = squad.find((q) => q.id === id)!
      if (slots[i].role === 'CB') expect(['CB', 'DM', 'FB']).toContain(p.role)
    })
  })

  it('adds up the season: leaderboards and every club\'s record', () => {
    let s = createSeason(9, 0, new Date('2026-03-01'))
    for (let md = 0; md < 2; md++) {
      const today = fixturesOn(s, s.matchday)
      const results = new Map(today.map((f) => [f.id, resultOf(runMatch(matchTeam(s, f.home), matchTeam(s, f.away), { seed: f.seed, fitness: fitnessFor(s) }))] as const))
      s = completeMatchday(s, results)
    }
    const records = clubRecords(s)
    expect(records).toHaveLength(LEAGUE_SIZE)
    for (const [i, row] of table(s).entries()) {
      const c = records[row.team]
      expect(c.played).toBe(2)
      expect(c.won * 3 + c.drawn).toBe(row.points)
      expect(c.goalsFor).toBe(row.goalsFor)
      if (i === 0) expect(c.possession).toBeGreaterThan(0)
    }
    const goals = leaderboards(s).find((b) => b.title === 'Goals')!
    const scored = s.fixtures.flatMap((f) => f.result?.goals ?? []).filter((g) => !g.ownGoal).length
    if (scored) expect(goals.rows[0].value).toBeGreaterThan(0)
    const passes = Object.values(s.stats).reduce((n, st) => n + (st.passes ?? 0), 0)
    expect(passes).toBeGreaterThan(1000)
  })

  it('carries tiredness and injuries into the next matchdays', () => {
    let s = createSeason(9, 0, new Date('2026-03-01'))
    const today = fixturesOn(s, 1)
    const results = new Map(
      today.map((f) => {
        const m = runMatch(matchTeam(s, f.home), matchTeam(s, f.away), { seed: f.seed, fitness: fitnessFor(s) })
        return [f.id, resultOf(m)] as const
      }),
    )
    const r = results.get(today[0].id)!
    expect(r.appearances.length).toBeGreaterThanOrEqual(22)
    s = completeMatchday(s, results)
    // The most tired of those who played the whole match (a keeper can recover fully by the next).
    const played = r.appearances.filter((a) => a.minutes >= 89).sort((a, b) => a.energy - b.energy)[0]
    expect(s.condition[played.id].fitness).toBeLessThan(1)
    expect(s.stats[played.id].apps).toBe(1)
    const rested = squadOf(s.teams[today[0].home]).find((p) => !r.appearances.some((a) => a.id === p.id))
    if (rested) expect(s.condition[rested.id].fitness).toBe(1)
    // Someone injured sits out at least the next matchday.
    const hurt = [...results.values()].flatMap((x) => x.injuries)[0]
    if (hurt) expect(autoPick(s, s.teams.findIndex((t) => squadOf(t).some((p) => p.id === hurt.id)))).not.toContain(hurt.id)
  })
})
