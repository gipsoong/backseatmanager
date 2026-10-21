import { describe, expect, it } from 'vitest'
import { createSeason, isOver, squadOf } from '../season/season.ts'
import { draftLeague, isComplete, newDraft, offer, place } from './draft.ts'
import { FORMATIONS } from '../engine/index.ts'
import { DEALS_PER_WINDOW, dealKey, decline, judge, makeDeal, offersFor, windowMatchdays, windowOpen } from './transfers.ts'
import type { Season } from '../season/season.ts'

function draftSeason(seed: number): Season {
  let d = newDraft(seed, '4-3-3')
  const slots = FORMATIONS['4-3-3']
  while (!isComplete(d)) {
    const players = offer(d).players.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    const starter = players.find((p) => d.xi.some((q, i) => !q && slots[i].role === p.role))
    if (starter) d = place(d, starter, { xi: d.xi.findIndex((q, i) => !q && slots[i].role === starter.role) })
    else if (d.bench.includes(null)) d = place(d, players[0], { bench: d.bench.indexOf(null) })
    else d = place(d, players[0], { xi: d.xi.indexOf(null) })
  }
  return { ...createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1)), draftLeague(d, 'Test')), mode: 'draft' }
}

describe('the January window', () => {
  const base = draftSeason(3)
  const january = windowMatchdays(base)
  const open: Season = { ...base, matchday: january[0] }
  const mine = squadOf(open.teams[0])
  const theirs = squadOf(open.teams[1]).sort((a, b) => (a.overall ?? 0) - (b.overall ?? 0))

  it('is open only for the matchdays in January, and only in draft mode', () => {
    expect(january.length).toBeGreaterThanOrEqual(4)
    expect(windowOpen(base)).toBe(false)
    expect(windowOpen(open)).toBe(true)
    expect(windowMatchdays({ ...open, mode: undefined })).toEqual([])
    expect(isOver(open)).toBe(false)
  })

  it('turns down a poor offer and takes a generous one', () => {
    const star = [...theirs].sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0]
    const worst = [...mine].sort((a, b) => (a.overall ?? 0) - (b.overall ?? 0))[0]
    expect(judge(open, { club: 1, give: [worst.id], get: [star.id] }).ok).toBe(false)
    // Their weakest squad player for your best one in the same position: they'd bite your hand off.
    const fringe = theirs.find((p) => p.role !== 'GK')!
    const best = [...mine].filter((p) => p.role === fringe.role).sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0]
    expect(judge(open, { club: 1, give: [best.id], get: [fringe.id] }).ok).toBe(true)
  })

  it('moves the players, keeps both squads whole and records the deal', () => {
    // One of your starters for a fringe player of theirs in his position.
    const fringe = theirs.find((p) => p.role !== 'GK' && open.teams[0].players.some((q) => q.role === p.role))!
    const best = open.teams[0].players.filter((p) => p.role === fringe.role).sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0]
    const withLineup: Season = { ...open, lineup: open.teams[0].players.map((p) => p.id) }
    const after = makeDeal(withLineup, { club: 1, give: [best.id], get: [fringe.id] })
    expect(squadOf(after.teams[0]).map((p) => p.id)).toContain(fringe.id)
    expect(squadOf(after.teams[1]).map((p) => p.id)).toContain(best.id)
    for (const t of after.teams) {
      expect(t.players).toHaveLength(11)
      expect(new Set(squadOf(t).map((p) => p.shirt)).size).toBe(squadOf(t).length)
    }
    // His season goes with him; your own pick is dropped if he was in it.
    expect(after.stats[best.id]).toBe(open.stats[best.id])
    expect(after.lineup).toBeNull()
    expect(after.transfers).toEqual([{ matchday: january[0], ids: [best.id, fringe.id], from: [0, 1], to: [1, 0] }])
    // One deal per club, and nobody moves twice.
    expect(judge(after, { club: 1, give: [mine[0].id], get: [theirs.at(-1)!.id] }).ok).toBe(false)
    expect(judge(after, { club: 2, give: [fringe.id], get: [squadOf(after.teams[2])[5].id] }).reason).toMatch(/already moved/)
  })

  it('stops after the last deal allowed', () => {
    let s = open
    let club = 1
    for (let n = 0; n < DEALS_PER_WINDOW + 2 && club < s.teams.length; club++) {
      const theirs = squadOf(s.teams[club]).sort((a, b) => (a.overall ?? 0) - (b.overall ?? 0))
      const moved = new Set((s.transfers ?? []).flatMap((t) => t.ids))
      const fringe = theirs.find((p) => p.role !== 'GK' && !moved.has(p.id))!
      const offer = squadOf(s.teams[0]).filter((p) => p.role === fringe.role && !moved.has(p.id)).sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0]
      if (!offer) continue
      const v = judge(s, { club, give: [offer.id], get: [fringe.id] })
      if (n < DEALS_PER_WINDOW) {
        if (!v.ok) continue
        s = makeDeal(s, { club, give: [offer.id], get: [fringe.id] })
        n++
      } else {
        expect(v.ok).toBe(false)
        expect(v.reason).toMatch(/most you can do/)
        n++
      }
    }
    expect(s.transfers).toHaveLength(DEALS_PER_WINDOW)
  })
})

describe('offers from other clubs', () => {
  const base = draftSeason(3)
  const open: Season = { ...base, matchday: windowMatchdays(base)[0] }

  it('come only in the window, each one a deal the club stands by and one that does something for you', () => {
    expect(offersFor(base)).toEqual([])
    const offers = offersFor(open)
    expect(offers.length).toBeGreaterThan(0)
    for (const o of offers) {
      const v = judge(open, o)
      expect(v.ok).toBe(true)
      expect(v.you!.reasons.length).toBeGreaterThan(0)
    }
    // Different players wanted, and the same state gives the same offers.
    expect(new Set(offers.map((o) => o.give[0])).size).toBe(offers.length)
    expect(offersFor(open)).toEqual(offers)
  })

  it("don't come back once turned down, and can be accepted", () => {
    const [first] = offersFor(open)
    const after = decline(open, first)
    expect(offersFor(after).map(dealKey)).not.toContain(dealKey(first))
    const done = makeDeal(open, first)
    expect(done.transfers).toHaveLength(1)
  })
})
