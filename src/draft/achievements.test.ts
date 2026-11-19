import { describe, expect, it } from 'vitest'
import { FORMATIONS } from '../engine/index.ts'
import { draftLeague, isComplete, newDraft, offer, place, type Draft } from './draft.ts'
import { completeMatchday, createSeason, fixturesOn, isOver, type Result, type Season } from '../season/season.ts'
import { ACHIEVEMENTS, addLegends, earned, runFacts, seasonLegends } from './achievements.ts'

function greedy(d: Draft): Draft {
  const slots = FORMATIONS[d.formation]
  while (!isComplete(d)) {
    const players = offer(d).players.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    const starter = players.find((p) => d.xi.some((q, i) => !q && slots[i].role === p.role))
    if (starter) d = place(d, starter, { xi: d.xi.findIndex((q, i) => !q && slots[i].role === starter.role) })
    else if (d.bench.includes(null)) d = place(d, players[0], { bench: d.bench.indexOf(null) })
    else d = place(d, players[0], { xi: d.xi.indexOf(null) })
  }
  return d
}

/** A season the manager wins every match of `score`, his eleven playing every minute; the rest draw. */
function wonSeason(score: [number, number], comeback = false): Season {
  const d = greedy(newDraft(9, '4-3-3'))
  let s: Season = { ...createSeason(9, 0, new Date(Date.UTC(2026, 5, 1)), draftLeague(d, 'Test')), mode: 'draft' }
  const xi = s.teams[0].players
  while (!isOver(s)) {
    const results = new Map<number, Result>()
    for (const f of fixturesOn(s, s.matchday)) {
      const mine = f.home === 0 || f.away === 0
      const side = f.home === 0 ? 0 : 1
      const sc: [number, number] = mine ? (side === 0 ? score : [score[1], score[0]]) : [1, 1]
      const goals = comeback && mine ? [0, 0, 1, 1, 1].map((k, i) => ({ team: (k ? side : 1 - side) as 0 | 1, scorer: xi[9].name, clock: `${10 + i}:00`, ownGoal: false })) : []
      const appearances = mine ? xi.map((p, i) => ({ id: p.id, minutes: 90, rating: 7, goals: i === 9 ? sc[side] : 0, assists: 0, energy: 0.7, starts: 1 })) : []
      results.set(f.id, { score: comeback && mine ? (side === 0 ? [3, 2] : [2, 3]) : sc, goals, xg: [1, 1], appearances, injuries: [] })
    }
    s = completeMatchday(s, results)
  }
  return s
}

describe('achievements', () => {
  it('a perfect season earns the big ones, and nothing that needs another mode', () => {
    const s = wonSeason([4, 0])
    const ids = earned(s, new Set())
    for (const id of ['champions', 'invincibles', 'centurions', 'fortress', 'goal-machine', 'thirty', 'haul']) expect(ids).toContain(id)
    for (const id of ['underdogs', 'shoestring', 'hard', 'europe', 'back-to-back', 'grand-tour']) expect(ids).not.toContain(id)
    expect(runFacts(s).champion).toBe(true)
  })

  it('a comeback counts only from two down', () => {
    expect(earned(wonSeason([3, 2], true), new Set())).toContain('comeback')
    expect(earned(wonSeason([1, 0]), new Set())).not.toContain('comeback')
  })

  it('titles add up over dynasty seasons and over leagues', () => {
    const s = wonSeason([2, 0])
    const two = { ...s, dynasty: { season: 2, past: [{ name: 'Test', place: 1, points: 90, stars: 3, of: 3 }] } }
    expect(earned(two, new Set())).toContain('back-to-back')
    expect(earned(two, new Set())).not.toContain('dynasty')
    expect(earned(s, new Set(['La Liga', 'Serie A']))).toContain('grand-tour')
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length)
  })

  it('the album keeps champions and award winners, adding up by name', () => {
    const s = wonSeason([2, 0])
    const legends = seasonLegends(s)
    expect(legends.length).toBeGreaterThanOrEqual(11)
    expect(legends.every((l) => l.titles === 1)).toBe(true)
    const twice = addLegends(addLegends([], legends), legends)
    expect(twice).toHaveLength(legends.length)
    expect(twice.every((l) => l.titles === 2 && l.runs === 2)).toBe(true)
  })
})
