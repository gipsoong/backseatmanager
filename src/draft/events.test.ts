import { describe, expect, it } from 'vitest'
import { createSeason, matchTeam, type Season } from '../season/season.ts'
import { choose, eventBoosts, eventText, pendingEvent, seasonEvents } from './events.ts'

const draftSeason = (): Season => ({ ...createSeason(5, 0, new Date('2026-08-01')), mode: 'draft' })

describe('mid-season events', () => {
  it('come three a season in draft mode only, each with two options in words', () => {
    const s = draftSeason()
    const evs = seasonEvents(s)
    expect(evs).toHaveLength(3)
    expect(new Set(evs.map((e) => e.kind)).size).toBe(3)
    for (const e of evs) {
      const t = eventText(s, e)
      expect(t.options).toHaveLength(2)
      expect(t.effects.every((x) => x.length > 0)).toBe(true)
    }
    expect(seasonEvents({ ...s, mode: undefined })).toEqual([])
  })

  it('wait on their matchday, then apply the first option if passed by', () => {
    const s = draftSeason()
    const e = seasonEvents(s).find((x) => x.kind !== 'camp')!
    expect(pendingEvent({ ...s, matchday: e.at })?.index).toBe(e.index)
    expect(eventBoosts({ ...s, matchday: e.at }).length).toBe(0)
    expect(eventBoosts({ ...s, matchday: e.at + 1 }).length).toBeGreaterThan(0)
    const chosen = choose({ ...s, matchday: e.at }, e, 1)
    expect(pendingEvent(chosen)).toBeUndefined()
    expect(chosen.choices?.[e.index]?.choice).toBe(1)
  })

  it('move the targeted player in the match while it lasts', () => {
    const s = draftSeason()
    const e = seasonEvents(s).find((x) => x.kind === 'knock' || x.kind === 'unsettled' || x.kind === 'bustUp')!
    const at = { ...s, matchday: e.at }
    const after = choose(at, e, 0)
    const id = after.choices![e.index].ids[e.kind === 'bustUp' ? 1 : 0]
    const before = matchTeam(at, 0)
    const now = matchTeam(after, 0)
    const p0 = [...before.players, ...before.bench].find((p) => p.id === id)
    const p1 = [...now.players, ...now.bench].find((p) => p.id === id)
    if (p0 && p1) expect(p1.attrs.shortPassing).toBeLessThan(p0.attrs.shortPassing)
  })
})
