import { describe, expect, it } from 'vitest'
import { createSeason, squadOf } from '../season/season.ts'
import { nextSeason, startCareer } from './career.ts'
import { fakePlayed } from './fake.ts'
import { allTime, leaders } from './records.ts'

describe("the manager's all-time leaders", () => {
  it('add up his players over finished seasons and the one in progress, named even after they leave', () => {
    const one = fakePlayed(startCareer(createSeason(3, 4, new Date(Date.UTC(2026, 5, 1)))))
    const mine = squadOf(one.teams[4]).filter((p) => one.stats[p.id]?.apps)
    const apps = mine.reduce((n, p) => n + one.stats[p.id].apps, 0)
    const two = fakePlayed(nextSeason(one))
    const rows = allTime(two)
    // Season one's appearances for his club are all in there (the fake season has no goals), and season two's on top.
    const now = squadOf(two.teams[4]).reduce((n, p) => n + (two.stats[p.id]?.apps ?? 0), 0)
    expect(rows.reduce((n, r) => n + r.apps, 0)).toBe(apps + now)
    // Nobody from another club.
    const theirs = new Set(two.teams.filter((_, i) => i !== 4).flatMap(squadOf).map((p) => p.id))
    for (const r of rows) if (!mine.some((p) => p.id === r.id)) expect(theirs.has(r.id)).toBe(false)
    const top = leaders(rows, 'apps', 3)
    expect(top.length).toBe(3)
    expect(top[0].apps).toBeGreaterThanOrEqual(top[1].apps)
    expect(top[0].seasons).toBe(2)
  })
})
