import { describe, expect, it } from 'vitest'
import { Rng } from '../engine/index.ts'
import { type Season, createSeason, playerRating, squadOf } from '../season/season.ts'
import { upgradeSave } from '../season/store.ts'
import { SQUAD_MAX, aimFor, aimMet, development, leagueLevel, nextSeason, shiftTo, startCareer } from './career.ts'
import { fakePlayed } from './fake.ts'

const start = (seed: number): Season => startCareer(createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1))))
const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length

describe('ageing', () => {
  const rng = new Rng(1)
  const many = (age: number, now: number, potential: number, share: number, rating: number | null, keeper = false): number =>
    mean(Array.from({ length: 2000 }, () => development(age, now, potential, { share, rating }, keeper, rng)))

  it('brings a young player on toward his potential, faster when he plays and plays well', () => {
    const benched = many(19, 50, 65, 0.05, null)
    const regular = many(19, 50, 65, 0.8, 7.2)
    expect(benched).toBeGreaterThan(2)
    expect(regular).toBeLessThan(6.5)
    expect(regular).toBeGreaterThan(benched + 1)
    // Nobody grows much past what he could be.
    expect(many(19, 64, 65, 0.8, 7.2)).toBeLessThan(1.2)
  })

  it('holds a player steady from 27 to 30, then declines him faster each year; keepers later', () => {
    expect(Math.abs(many(28, 60, 60, 0.8, 6.8))).toBeLessThan(0.4)
    const at = (age: number): number => many(age, 60, 60, 0.8, 6.8)
    expect(at(31)).toBeLessThan(-0.6)
    expect(at(33)).toBeLessThan(-1.5)
    expect(at(33)).toBeGreaterThan(-4)
    expect(at(35)).toBeLessThan(at(33))
    expect(many(33, 60, 60, 0.8, 6.8, true)).toBeGreaterThan(at(33))
  })

  it('moves the overall exactly, taking the legs first on the way down', () => {
    const s = start(3)
    const p = s.teams[0].players.find((q) => q.role === 'CM')!
    const r = new Rng(9)
    const up = shiftTo(p, playerRating(p) + 3, r, false)
    expect(playerRating(up)).toBe(playerRating(p) + 3)
    const down = shiftTo(p, playerRating(p) - 3, r, true)
    expect(playerRating(down)).toBe(playerRating(p) - 3)
    const fell = (k: 'sprintSpeed' | 'acceleration' | 'vision' | 'marking'): number => p.attrs[k] - down.attrs[k]
    expect(fell('sprintSpeed') + fell('acceleration')).toBeGreaterThan(fell('vision') + fell('marking'))
  })
})

describe('the summer', () => {
  const s = start(5)
  const next = nextSeason(fakePlayed(s))

  it('starts a fresh season with the same clubs, a year on', () => {
    expect(next.teams.map((t) => t.name)).toEqual(s.teams.map((t) => t.name))
    expect(next.matchday).toBe(1)
    expect(next.fixtures.every((f) => f.result === null)).toBe(true)
    expect(Number(next.startDate.slice(0, 4))).toBe(Number(s.startDate.slice(0, 4)) + 1)
    expect(next.career!.number).toBe(2)
    expect(next.career!.history).toHaveLength(1)
    for (const p of next.teams.flatMap(squadOf)) {
      expect(next.condition[p.id]).toBeDefined()
      expect(next.stats[p.id].apps).toBe(0)
      expect(next.career!.people[p.id]).toBeDefined()
    }
  })

  it('ages everyone a year and brings two or three academy players to every club', () => {
    const old = s.career!.people
    for (const [id, who] of Object.entries(next.career!.people)) if (old[id]) expect(who.age).toBe(old[id].age + 1)
    for (const t of next.teams) {
      const academy = squadOf(t).filter((p) => next.career!.people[p.id].academy)
      expect(academy.length).toBeGreaterThanOrEqual(1) // (one may already be released as the weakest)
      expect(academy.length).toBeLessThanOrEqual(3)
      for (const p of academy) {
        const who = next.career!.people[p.id]
        expect(who.age).toBeGreaterThanOrEqual(16)
        expect(who.age).toBeLessThanOrEqual(18)
        expect(who.potential).toBeGreaterThan(playerRating(p))
      }
      expect(squadOf(t).length).toBeLessThanOrEqual(SQUAD_MAX)
      expect(squadOf(t).filter((p) => p.role === 'GK').length).toBeGreaterThanOrEqual(2)
      expect(t.players).toHaveLength(11)
    }
    for (const t of next.teams) {
      const surnames = squadOf(t).map((p) => p.name.split(' ').at(-1))
      expect(new Set(surnames).size).toBe(surnames.length)
    }
    const ids = next.teams.flatMap(squadOf).map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps the league about as strong as it began over five seasons', () => {
    for (const seed of [1, 2, 3]) {
      let c = start(seed)
      const begin = leagueLevel(c)
      for (let i = 0; i < 5; i++) {
        c = nextSeason(fakePlayed(c))
        expect(Math.abs(leagueLevel(c) - begin)).toBeLessThanOrEqual(1)
      }
      const ages = c.teams.flatMap(squadOf).map((p) => c.career!.people[p.id].age)
      expect(mean(ages)).toBeGreaterThan(23.5)
      expect(mean(ages)).toBeLessThan(27.5)
    }
  })

  it('is the same summer every time', () => {
    expect(nextSeason(fakePlayed(s))).toEqual(next)
  })
})

describe('the board', () => {
  it('sets a target by squad rank and judges the finish against it', () => {
    const s = start(7)
    const aims = s.teams.map((_, i) => aimFor(s, i))
    expect(aims.filter((a) => a === 'title')).toHaveLength(3)
    expect(aims.filter((a) => a === 'topHalf')).toHaveLength(7)
    expect(aimMet('title', 2, 10)).toBe(true)
    expect(aimMet('title', 3, 10)).toBe(false)
    expect(aimMet('topHalf', 5, 10)).toBe(true)
    expect(aimMet('survive', 8, 10)).toBe(true)
    expect(aimMet('survive', 9, 10)).toBe(false)
    expect(aimMet('survive', 17, 20)).toBe(true)
    expect(aimMet('survive', 18, 20)).toBe(false)
  })
})

describe('saves', () => {
  it('turns an old club-mode save into a career, and leaves draft saves without one', () => {
    const { career: _c, ...rest } = start(11)
    const old = { ...rest, version: 2 } as unknown as Season
    const up = upgradeSave(old)
    expect(up.version).toBe(3)
    expect(up.career!.number).toBe(1)
    for (const p of up.teams.flatMap(squadOf)) expect(up.career!.people[p.id].age).toBeGreaterThanOrEqual(17)
    expect(upgradeSave(up)).toEqual(up)
    const draft = upgradeSave({ ...old, mode: 'draft' })
    expect(draft.career).toBeUndefined()
    expect(draft.version).toBe(3)
  })
})
