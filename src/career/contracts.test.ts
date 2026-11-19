import { describe, expect, it } from 'vitest'
import { Rng } from '../engine/index.ts'
import { type Season, createSeason, matchTeam, squadOf } from '../season/season.ts'
import { upgradeSave } from '../season/store.ts'
import { windowOpen } from '../draft/transfers.ts'
import { SQUAD_MAX, nextSeason, startCareer } from './career.ts'
import { fakePlayed } from './fake.ts'
import { FREE_SQUAD_MAX, RED_LINE, expiringAt, renewProblem, inLastYear, judgeFreeAgent, letGo, renew, renewalTerms, seasonYear, signFreeAgent, staffRenewals } from './contracts.ts'
import { WAGE_BUDGET, inTheRed, valueOf, wage, wageBill, wageOf, yearsLeft } from './money.ts'
import { judge } from '../draft/transfers.ts'

const start = (seed: number): Season => startCareer(createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1))))
const everyone = (s: Season) => s.teams.flatMap(squadOf)

describe('contracts', () => {
  const s = start(4)
  const year = seasonYear(s)

  it('gives every player a deal of one to five years at his wage, and the wage bill is theirs', () => {
    for (const p of everyone(s)) {
      const who = s.career!.people[p.id]
      const left = yearsLeft(s, who)!
      expect(left).toBeGreaterThanOrEqual(1)
      expect(left).toBeLessThanOrEqual(5)
      if (who.age >= 30) expect(left).toBeLessThanOrEqual(3)
      expect(who.contract!.wage).toBe(wage(p, who))
    }
    const club = squadOf(s.teams[3])
    expect(wageBill(s, 3)).toBeCloseTo((club.reduce((n, p) => n + s.career!.people[p.id].contract!.wage, 0) * 52) / 1000, 6)
    // Some of every squad run out this summer.
    expect(expiringAt(s).length).toBeGreaterThan(0)
  })

  it('prices a player in his last year well below one with years left', () => {
    const p = squadOf(s.teams[2]).find((q) => !inLastYear(s, q.id))!
    const who = s.career!.people[p.id]
    const at = (until: number): number =>
      valueOf({ ...s, career: { ...s.career!, people: { ...s.career!.people, [p.id]: { ...who, contract: { ...who.contract!, until } } } } }, p)
    expect(at(year + 1)).toBeLessThan(at(year + 3) * 0.7)
    expect(at(year + 2)).toBeLessThan(at(year + 3))
    expect(at(year + 2)).toBeGreaterThan(at(year + 1))
  })

  it('renews a player in his last year on his terms, or lets him go', () => {
    const p = expiringAt(s)[0]
    const terms = renewalTerms(s, p.id)
    expect(terms.until).toBe(year + 1 + terms.years)
    expect(terms.years).toBeGreaterThanOrEqual(1)
    const renewed = renew(s, p.id)
    expect(renewed.career!.people[p.id].contract).toEqual({ until: terms.until, wage: terms.wage })
    expect(inLastYear(renewed, p.id)).toBe(false)
    expect(() => renew(renewed, p.id)).toThrow()
    const gone = letGo(s, p.id)
    expect(gone.career!.people[p.id].contract!.leaving).toBe(true)
    expect(letGo(gone, p.id, false).career!.people[p.id].contract!.leaving).toBeUndefined()
  })

  it('in the summer: whoever the manager let run out leaves as a free agent; the renewed stay; other clubs keep most of theirs', () => {
    const mine = expiringAt(s)
    const kept = mine[0]
    const s1 = renew(s, kept.id)
    const next = nextSeason(fakePlayed(s1))
    const ids = new Set(everyone(next).map((p) => p.id))
    const c = next.career!
    expect(ids.has(kept.id)).toBe(true)
    for (const p of mine.slice(1)) {
      expect(squadOf(next.teams[0]).some((q) => q.id === p.id)).toBe(false)
    }
    expect(c.summer!.expired!.length).toBeGreaterThanOrEqual(mine.length - 1 - c.summer!.retired.length)
    // Every player in the league has a deal into the new season or beyond.
    for (const p of everyone(next)) expect(yearsLeft(next, c.people[p.id])!).toBeGreaterThanOrEqual(1)
    // The other clubs renew most of theirs.
    const others = s.teams.flatMap((_, club) => (club === 0 ? [] : expiringAt(s, club)))
    const stayed = others.filter((p) => ids.has(p.id)).length
    expect(stayed / others.length).toBeGreaterThan(0.6)
    expect(stayed / others.length).toBeLessThan(0.98)
    // The free agents: a pool of them, none of them at a club, every one asking a wage.
    expect(c.freeAgents!.length).toBeGreaterThan(10)
    for (const f of c.freeAgents!) {
      expect(ids.has(f.player.id)).toBe(false)
      expect(f.wage).toBeGreaterThanOrEqual(3)
      expect(c.people[f.player.id]).toBeUndefined()
    }
    // Some of the other clubs' places were filled from the free agents.
    const clubOf = (x: Season): Map<string, number> => new Map(x.teams.flatMap((t, club) => squadOf(t).map((p) => [p.id, club] as const)))
    const was = clubOf(s)
    const now = clubOf(next)
    const movedOn = others.filter((p) => now.has(p.id) && now.get(p.id) !== was.get(p.id))
    expect(movedOn.length).toBeGreaterThan(0)
    for (const t of next.teams) expect(squadOf(t).length).toBeLessThanOrEqual(SQUAD_MAX)
  })

  it('lets the staff renew the manager’s contracts as another club would', () => {
    const done = staffRenewals(s, new Rng(1))
    const decided = expiringAt(s).map((p) => done.career!.people[p.id].contract!)
    expect(decided.every((k) => k.leaving || k.until > year + 1)).toBe(true)
    expect(decided.some((k) => k.until > year + 1)).toBe(true)
  })
})

describe('free agents', () => {
  const s0 = start(6)
  const summer = nextSeason(fakePlayed(s0))

  it('sign for the manager while a window is open, for wages only, and play', () => {
    expect(windowOpen(summer)).toBe(true)
    const pool = summer.career!.freeAgents!
    const ok = pool.find((f) => judgeFreeAgent(summer, f.player.id).ok)!
    expect(ok).toBeDefined()
    const v = judgeFreeAgent(summer, ok.player.id)
    expect(v.you).not.toBeNull()
    const cash = summer.career!.finance!.cash[0]
    const signed = signFreeAgent(summer, ok.player.id)
    const c = signed.career!
    const squad = squadOf(signed.teams[0])
    expect(squad.some((p) => p.id === ok.player.id)).toBe(true)
    expect(c.freeAgents!.some((f) => f.player.id === ok.player.id)).toBe(false)
    expect(c.people[ok.player.id].contract).toEqual({ until: seasonYear(summer) + v.years, wage: v.wage })
    expect(signed.condition[ok.player.id]).toEqual({ fitness: 1, injuredUntil: 0 })
    expect(signed.stats[ok.player.id].apps).toBe(0)
    // No fee: the money's untouched until the wages are paid.
    expect(c.finance!.cash[0]).toBe(cash)
    expect(c.signings).toEqual([{ matchday: 1, id: ok.player.id, club: 0, wage: v.wage }])
    expect(new Set(squad.map((p) => p.shirt)).size).toBe(squad.length)
    expect(matchTeam(signed, 0).players).toHaveLength(11)
    expect(judgeFreeAgent(signed, ok.player.id).ok).toBe(false)
  })

  it('wait for a window, and a good one won’t sign to sit on the bench', () => {
    const shut = { ...summer, matchday: 10 }
    expect(windowOpen(shut)).toBe(false)
    const f = summer.career!.freeAgents![0]
    expect(judgeFreeAgent(shut, f.player.id).ok).toBe(false)
    // A strong player whom the manager's eleven wouldn't pick: a keeper of 90 behind one of 95.
    const gk = summer.teams[0].players.find((p) => p.role === 'GK')!
    const rival = { ...gk, id: 'fa-test', name: 'Test Keeper', overall: 90 }
    const withRival: Season = {
      ...summer,
      teams: summer.teams.map((t, i) => (i === 0 ? { ...t, players: t.players.map((p) => (p === gk ? { ...gk, overall: 95 } : p)) } : t)),
      career: { ...summer.career!, freeAgents: [{ player: rival, person: { age: 27, potential: 90 }, wage: 20, from: null }] },
    }
    const v = judgeFreeAgent(withRival, 'fa-test')
    expect(v.ok).toBe(false)
    expect(v.reason).toMatch(/first-team/)
  })

  it('can’t join a full squad', () => {
    let s = summer
    const pool = s.career!.freeAgents!
    for (const f of pool) {
      if (squadOf(s.teams[0]).length >= FREE_SQUAD_MAX) break
      const cheap: Season = { ...s, career: { ...s.career!, finance: { ...s.career!.finance!, cash: s.career!.finance!.cash.map(() => 1000) } } }
      // Anyone, whether or not he'd start: make him a little weaker than the eleven so he's willing.
      const weaker = { ...f.player, overall: 40 }
      s = signFreeAgent({ ...cheap, career: { ...cheap.career!, freeAgents: [{ ...f, player: weaker }] } }, f.player.id)
    }
    expect(squadOf(s.teams[0]).length).toBe(FREE_SQUAD_MAX)
    expect(judgeFreeAgent(s, pool.at(-1)!.player.id).reason).toMatch(/full|signed/)
  })
})

describe('saves with contracts', () => {
  it('give a version 4 career contracts, a pool and (before its first round) the cup, and survive a round trip', () => {
    const s = start(9)
    const people = Object.fromEntries(Object.entries(s.career!.people).map(([id, { contract: _k, ...who }]) => [id, who]))
    const { freeAgents: _f, cup: _c, signings: _g, ...career } = s.career!
    const v4 = { ...s, version: 4, career: { ...career, people } } as unknown as Season
    const up = upgradeSave(v4)
    expect(up.version).toBe(5)
    for (const p of everyone(up)) expect(up.career!.people[p.id].contract!.until).toBeGreaterThan(seasonYear(up))
    expect(up.career!.freeAgents).toEqual([])
    expect(up.career!.cup!.fixtures.length).toBeGreaterThan(0)
    // As saved and loaded.
    const back = JSON.parse(JSON.stringify(up)) as Season
    expect(back).toEqual(up)
    expect(upgradeSave(back)).toEqual(up)
    // Past its first round, the cup waits for next season.
    const late = upgradeSave({ ...v4, matchday: 20 } as Season)
    expect(late.career!.cup).toBeUndefined()
    expect(nextSeason(fakePlayed(late)).career!.cup).toBeDefined()
  })
})

describe('money and wages', () => {
  it('keeps the other clubs\u2019 wages within their income over the summers', () => {
    let s = start(8)
    for (let i = 0; i < 3; i++) s = nextSeason(staffRenewals(fakePlayed(s), new Rng(i)))
    const f = s.career!.finance!
    const ratio = s.teams.map((_, club) => wageBill(s, club) / f.income[club])
    const others = ratio.filter((_, club) => club !== 0)
    expect(others.reduce((a, b) => a + b, 0) / others.length).toBeLessThanOrEqual(WAGE_BUDGET + 0.02)
    expect(others.reduce((a, b) => a + b, 0) / others.length).toBeGreaterThan(0.8)
    for (const t of s.teams) expect(squadOf(t).length).toBeGreaterThanOrEqual(17)
  })

  it('in the red, the manager can\u2019t add to his wages: no free agents, no pay rises, no deals that cost wages', () => {
    const summer = nextSeason(fakePlayed(start(6)))
    const f = summer.career!.finance!
    const red: Season = { ...summer, career: { ...summer.career!, finance: { ...f, cash: f.cash.map((x, i) => (i === 0 ? -2 : x)) } } }
    expect(inTheRed(red)).toBe(true)
    expect(inTheRed(summer)).toBe(false)
    const fa = summer.career!.freeAgents!.find((x) => judgeFreeAgent(summer, x.player.id).ok)!
    expect(judgeFreeAgent(red, fa.player.id)).toMatchObject({ ok: false, reason: RED_LINE })
    // A renewal: allowed if it doesn't raise his wage.
    const p = expiringAt(red).find((q) => renewalTerms(red, q.id).wage > wageOf(q, red.career!.people[q.id]))
    if (p) expect(renewProblem(red, p.id)).toBe(RED_LINE)
    const same = expiringAt(red).find((q) => renewalTerms(red, q.id).wage <= wageOf(q, red.career!.people[q.id]))
    if (same) expect(renewProblem(red, same.id)).toBeNull()
    // A swap that brings in a dearer player is off; selling is fine (a first season's full squads).
    const s1 = start(6)
    const f1 = s1.career!.finance!
    const red1: Season = { ...s1, career: { ...s1.career!, finance: { ...f1, cash: f1.cash.map((x, i) => (i === 0 ? -2 : x)) } } }
    const theirs = squadOf(red1.teams[5]).sort((a, b) => wageOf(b, red1.career!.people[b.id]) - wageOf(a, red1.career!.people[a.id]))[0]
    const mine = squadOf(red1.teams[0]).sort((a, b) => wageOf(a, red1.career!.people[a.id]) - wageOf(b, red1.career!.people[b.id]))[0]
    expect(judge(red1, { club: 5, give: [mine.id], get: [theirs.id], fee: 0 }).reason).toMatch(/in the red/)
    expect(judge(red1, { club: 5, give: [mine.id], get: [], fee: -0.1 }).reason).not.toMatch(/in the red/)
  })
})
