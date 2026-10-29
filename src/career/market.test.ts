import { describe, expect, it } from 'vitest'
import { type Season, createSeason, playerRating, squadOf } from '../season/season.ts'
import { askingPrice, judge, makeDeal, offersFor, windowMatchdays, windowOpen } from '../draft/transfers.ts'
import { elevenRating, startCareer } from './career.ts'
import { AI_DEALS_PER_MATCHDAY, AI_DEALS_PER_WINDOW, marketDay } from './market.ts'
import { marketValue, wage } from './money.ts'

const start = (seed: number): Season => startCareer(createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1))))
const total = (s: Season): number => s.career!.finance!.cash.reduce((a, b) => a + b, 0)

describe('money', () => {
  it('prices youth and potential above age', () => {
    const p = start(1).teams[0].players[5]
    const at = (overall: number) => ({ ...p, attrs: p.attrs, overall })
    const young = marketValue(at(60), { age: 19, potential: 80 })
    const old = marketValue(at(60), { age: 30, potential: 60 })
    expect(young).toBeGreaterThan(old * 3)
    expect(marketValue(at(70), { age: 26, potential: 70 })).toBeGreaterThan(marketValue(at(60), { age: 26, potential: 60 }))
    // Wages follow what he's worth now, not what he may become.
    expect(wage(at(60), { age: 19, potential: 80 })).toBe(wage(at(60), { age: 19, potential: 60 }))
  })
})

describe('the windows', () => {
  const s = start(2)
  const days = windowMatchdays(s)

  it('opens in August and January in a career', () => {
    expect(days[0]).toBe(1)
    expect(days.length).toBeGreaterThanOrEqual(6)
    expect(windowOpen(s)).toBe(true)
  })

  it('sells to a club at its price, not below, and moves the money', () => {
    const them = 5
    const target = [...squadOf(s.teams[them])].sort((a, b) => playerRating(a) - playerRating(b))[3]
    const deal = { club: them, give: [], get: [target.id] }
    const price = askingPrice(s, deal)
    expect(price).toBeGreaterThan(0)
    expect(judge(s, { ...deal, fee: price - 1 }).ok).toBe(false)
    const v = judge(s, { ...deal, fee: price })
    if (price <= s.career!.finance!.cash[0]) {
      expect(v.ok).toBe(true)
      const after = makeDeal(s, { ...deal, fee: price })
      expect(squadOf(after.teams[0]).some((p) => p.id === target.id)).toBe(true)
      expect(after.career!.finance!.cash[0]).toBeCloseTo(s.career!.finance!.cash[0] - price, 5)
      expect(total(after)).toBeCloseTo(total(s), 5)
    }
  })

  it('brings offers of money for the manager\'s players', () => {
    let found = 0
    for (const md of days) found += offersFor({ ...s, matchday: md }).filter((d) => (d.fee ?? 0) < 0 && d.get.length === 0).length
    expect(found).toBeGreaterThan(0)
  })
})

describe('the other clubs\' business', () => {
  it('does a few deals a window, never with the manager or from the best side, with the money kept', () => {
    let s = start(3)
    const strength = s.teams.map((_, i) => elevenRating(s, i))
    const best = strength.indexOf(Math.max(...strength))
    const august = windowMatchdays(s).filter((md) => md <= 5)
    for (const md of august) {
      const before = s.transfers?.length ?? 0
      s = marketDay({ ...s, matchday: md })
      expect((s.transfers?.length ?? 0) - before).toBeLessThanOrEqual(AI_DEALS_PER_MATCHDAY)
    }
    const deals = s.transfers ?? []
    expect(deals.length).toBeGreaterThan(0)
    expect(deals.length).toBeLessThanOrEqual(AI_DEALS_PER_WINDOW)
    for (const t of deals) {
      expect(t.from).not.toContain(0)
      expect(t.to).not.toContain(0)
      expect(t.from).not.toContain(best)
      expect(t.fee!.amount).toBeGreaterThan(0)
    }
    expect(total(s)).toBeCloseTo(total(start(3)), 3)
    for (const t of s.teams) expect(t.players).toHaveLength(11)
    // Again on the same matchday: nothing more.
    expect(marketDay(s)).toBe(s)
  })
})
