import { describe, expect, it } from 'vitest'
import { FORMATIONS, Rng, cardOverall, shownRatings, type Role } from '../engine/index.ts'
import { type Season, playerRating, squadOf } from '../season/season.ts'
import { upgradeSave } from '../season/store.ts'
import { LEFT_FOOTED } from '../draft/pools.ts'
import { CARDS } from '../draft/cards.ts'
import { shortName } from '../names.ts'
import { elevenRating, leagueLevel, nextSeason, shiftTo, startCareer, startRealCareer } from './career.ts'
import { fakePlayed } from './fake.ts'
import { REAL_LEAGUES, realPotential, realTeams, squadLines } from './real.ts'
import { createSeason, matchdays } from '../season/season.ts'
import { cupSchedule } from './cup.ts'
import { aimFor, relegationPlaces } from './career.ts'

const ROLES: Role[] = ['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'W', 'ST']
const PL = REAL_LEAGUES[0]

describe('real league data', () => {
  for (const league of REAL_LEAGUES)
    it(`${league.name}: 18 or 20 clubs, full squads with keepers, real ages, nobody twice`, () => {
      expect([18, 20]).toContain(league.clubs.length)
      const names = new Set<string>()
      for (const c of league.clubs) {
        expect(FORMATIONS[c.formation]).toBeDefined()
        const squad = squadLines(c.players)
        expect(squad.length, c.club).toBeGreaterThanOrEqual(22)
        expect(squad.length, c.club).toBeLessThanOrEqual(25)
        expect(squad.filter((p) => p.positions.split('/')[0] === 'GK').length, c.club).toBeGreaterThanOrEqual(2)
        // Enough of each line to put out the club's own shape.
        for (const slot of FORMATIONS[c.formation]) expect(squad.some((p) => p.positions.split('/').includes(slot.role) || slot.role === 'WM'), `${c.club} ${slot.role}`).toBe(true)
        for (const p of squad) {
          expect(names.has(p.name), p.name).toBe(false)
          names.add(p.name)
          for (const r of p.positions.split('/')) expect(ROLES, `${p.name} ${r}`).toContain(r)
          expect(p.overall, p.name).toBeGreaterThanOrEqual(60)
          expect(p.overall, p.name).toBeLessThanOrEqual(95)
          const age = league.season - p.born
          expect(age, p.name).toBeGreaterThanOrEqual(16)
          expect(age, p.name).toBeLessThanOrEqual(42) // Pepe Reina, Como
          // What the draft already knows of him agrees.
          if (CARDS[p.name]) expect(CARDS[p.name][0], p.name).toBe(p.born)
          if (LEFT_FOOTED.has(p.name)) expect(p.foot, p.name).toBe('left')
        }
      }
    })

  it('has nobody in two leagues', () => {
    const seen = new Map<string, string>()
    for (const league of REAL_LEAGUES)
      for (const c of league.clubs)
        for (const p of squadLines(c.players)) {
          expect(seen.get(p.name), `${p.name}: ${seen.get(p.name)} and ${c.club}`).toBeUndefined()
          seen.set(p.name, c.club)
        }
  })

  it('shows known-as names', () => {
    expect(shortName('Son Heung-min')).toBe('Son')
    expect(shortName('Hwang Hee-chan')).toBe('Hwang')
  })
})

describe('a real career', () => {
  const s = startRealCareer(1, PL.id)
  const c = s.career!

  it('starts in its own season with real ages, potentials from age and overall, contracts and a league', () => {
    expect(s.startDate.slice(0, 4)).toBe('2024')
    expect(c.league).toBe(PL.id)
    const haaland = s.teams.flatMap(squadOf).find((p) => p.name === 'Erling Haaland')!
    expect(c.people[haaland.id].age).toBe(24)
    expect(playerRating(haaland)).toBe(91)
    for (const p of s.teams.flatMap(squadOf)) {
      const who = c.people[p.id]
      expect(p.overall).toBeDefined()
      expect(who.potential).toBeGreaterThanOrEqual(playerRating(p))
      if (who.age >= 26) expect(who.potential).toBe(playerRating(p))
      expect(who.contract!.until).toBeGreaterThan(2024)
    }
    const nwaneri = s.teams.flatMap(squadOf).find((p) => p.name === 'Ethan Nwaneri')!
    expect(c.people[nwaneri.id].potential).toBeGreaterThan(78)
  })

  it('ranks the real top sides on top, and the board aims by it', () => {
    const order = s.teams.map((t, i) => [t.name, elevenRating(s, i)] as const).sort((a, b) => b[1] - a[1]).map(([n]) => n)
    expect(order.slice(0, 3).sort()).toEqual(['Arsenal', 'Liverpool', 'Manchester City'])
    expect(order.slice(-3)).toContain('Southampton')
  })

  it('plays his card moved by ROLE_OFFSET, showing FIFA\'s', () => {
    const haaland = s.teams.flatMap(squadOf).find((p) => p.name === 'Erling Haaland')!
    expect(haaland.cardShift).toBe(-4)
    // His card on screen is his own (cards.ts), not the shifted one he plays with.
    expect(shownRatings(haaland).map((g) => g.value)[1]).toBeGreaterThanOrEqual(90)
  })

  it('develops real players by their overall, and fills with newcomers who carry one too', () => {
    const next = nextSeason(fakePlayed(s))
    const n = next.career!
    expect(n.league).toBe(PL.id)
    expect(next.startDate.slice(0, 4)).toBe('2025')
    const all = next.teams.flatMap(squadOf)
    for (const p of all) expect(p.overall, p.name).toBeDefined()
    const newcomers = all.filter((p) => !p.id.startsWith('pl24-'))
    expect(newcomers.length).toBeGreaterThan(20)
    // A newcomer reads on the real players' scale: his overall net of what a made-up player of his position reads.
    for (const p of newcomers) expect(Math.abs(playerRating(p) - (cardOverall(p.attrs, p.role) - (p.cardShift ?? 0)))).toBeLessThanOrEqual(1.5)
    const haaland = all.find((p) => p.name === 'Erling Haaland')!
    expect(n.people[haaland.id].age).toBe(25)
    // The league holds its level.
    expect(Math.abs(leagueLevel(next) - leagueLevel(s))).toBeLessThan(1.5)
  })

  it('moves a real player\'s overall with his attributes', () => {
    const p = s.teams[0].players[3]
    const down = shiftTo(p, playerRating(p) - 3, new Rng(2), true)
    expect(playerRating(down)).toBe(playerRating(p) - 3)
    expect(Math.round(cardOverall(down.attrs, down.role))).toBe(Math.round(cardOverall(p.attrs, p.role)) - 3)
  })

  it('saves and loads unchanged', () => {
    const saved = JSON.parse(JSON.stringify(s)) as Season
    expect(upgradeSave(saved)).toEqual(saved)
  })

  it('gives potentials by age', () => {
    const rng = new Rng(4)
    const avg = (age: number): number => Array.from({ length: 500 }, () => realPotential(age, 75, rng) - 75).reduce((a, b) => a + b, 0) / 500
    expect(avg(17)).toBeGreaterThan(11)
    expect(avg(20)).toBeGreaterThan(6)
    expect(avg(24)).toBeLessThan(4)
    expect(avg(27)).toBe(0)
  })
})

describe('an 18-club real league', () => {
  for (const league of REAL_LEAGUES.filter((l) => l.clubs.length === 18)) {
    it(`${league.name}: 34 matchdays, a five-round cup, three title aims and three going down`, () => {
      const s = startRealCareer(2, league.id)
      expect(s.teams).toHaveLength(18)
      expect(matchdays(s)).toBe(34)
      expect(s.fixtures).toHaveLength(18 * 17)
      expect(cupSchedule(s)).toEqual([5, 11, 17, 23, 29])
      // Four weakest play a first round; the other fourteen join for the last 16.
      expect(s.career!.cup!.fixtures).toHaveLength(2)
      const aims = s.teams.map((_, i) => aimFor(s, i))
      expect(aims.filter((a) => a === 'title')).toHaveLength(3)
      expect(aims.filter((a) => a === 'topHalf')).toHaveLength(6)
      expect(relegationPlaces(18)).toBe(3)
    })
  }
})

describe('a made-up career', () => {
  it('is untouched by real leagues', () => {
    const s = startCareer(createSeason(3, 0, new Date(Date.UTC(2026, 5, 1))))
    expect(s.career!.league).toBeUndefined()
    expect(s.teams.flatMap(squadOf).every((p) => p.overall === undefined)).toBe(true)
    expect(realTeams(PL, 1)).toHaveLength(20)
  })
})
