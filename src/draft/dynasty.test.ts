import { describe, expect, it } from 'vitest'
import { FORMATIONS, Rng, type PlayerDef } from '../engine/index.ts'
import { POSITIONAL } from '../engine/attributes.ts'
import { DRAFT_ROUNDS, draftLeague, isComplete, newDraft, offer, place, poolPlayer, roundOf, type Draft } from './draft.ts'
import { createSeason, matchTeam, type Appearance, type Season } from '../season/season.ts'
import { STAR, UNHAPPY, moraleOf, unhappyStars } from './morale.ts'
import { LEAVERS, aged, summerDraft } from './dynasty.ts'
import { seasonEvents } from './events.ts'
import { POOLS } from './pools.ts'

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

function draftSeason(seed: number): Season {
  const d = greedy(newDraft(seed, '4-3-3'))
  return { ...createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1)), draftLeague(d, 'Test')), mode: 'draft' }
}

/** The season with the manager's first `n` matches "played": his eleven started each, nobody else. */
function played(s: Season, n: number): Season {
  const xi = s.teams[s.userTeam].players.map((p) => p.id)
  const result = { score: [1, 0] as [number, number], goals: [], xg: [1, 0] as [number, number], injuries: [], appearances: xi.map((id): Appearance => ({ id, minutes: 90, rating: 7, goals: 0, assists: 0, energy: 0.6, starts: 1 })) }
  return { ...s, matchday: n + 1, fixtures: s.fixtures.map((f) => (f.matchday <= n && (f.home === s.userTeam || f.away === s.userTeam) ? { ...f, result } : f)) }
}

/** The season with the manager's first sub made a star. */
function withBenchStar(s: Season): [Season, PlayerDef] {
  const t = s.teams[s.userTeam]
  const star = { ...t.bench[0], overall: 90, role: t.bench[0].role === 'GK' ? 'CM' : t.bench[0].role } as PlayerDef
  return [{ ...s, teams: s.teams.map((x, i) => (i === s.userTeam ? { ...x, bench: [star, ...x.bench.slice(1)] } : x)) }, star]
}

describe('morale', () => {
  const [base, star] = withBenchStar(draftSeason(5))

  it('a star left out of the last five matches is unhappy, and plays worse', () => {
    expect(unhappyStars(played(base, 4))).not.toContainEqual(star)
    const s = played(base, 5)
    expect(unhappyStars(s).map((p) => p.id)).toContain(star.id)
    expect(moraleOf(s).get(star.id)).toBeLessThanOrEqual(UNHAPPY)
    const find = (x: Season): PlayerDef => {
      const t = matchTeam(x, x.userTeam)
      return [...t.players, ...t.bench].find((p) => p.id === star.id)!
    }
    const after = find(s)
    // (Form moves him too, by matchday: compare against the same matchday without morale.)
    const sameDay = find({ ...s, fixtures: base.fixtures })
    expect(after).toBeDefined()
    expect(after.attrs[POSITIONAL[0]]).toBe(Math.max(1, sameDay.attrs[POSITIONAL[0]] + (moraleOf(s).get(star.id) ?? 0)))
  })

  it('nobody under the star line sulks, and an injured star does not', () => {
    const s = played(base, 5)
    for (const p of unhappyStars(s)) expect(p.overall).toBeGreaterThanOrEqual(STAR)
    const hurt = { ...s, condition: { ...s.condition, [star.id]: { fitness: 1, injuredUntil: 3 } } }
    expect(unhappyStars(hurt).map((p) => p.id)).not.toContain(star.id)
  })

  it('a dressing room of stars brings extra events', () => {
    const plain = seasonEvents(base)
    expect(plain.every((e) => e.kind !== 'egos' && e.kind !== 'contract') || plain.length > 3).toBe(true)
    const t = base.teams[0]
    const allStars = { ...base, teams: base.teams.map((x, i) => (i === 0 ? { ...t, players: t.players.map((p) => ({ ...p, overall: 88 })), bench: t.bench.map((p) => ({ ...p, overall: 88 })) } : x)) }
    const kinds = seasonEvents(allStars).map((e) => e.kind)
    expect(kinds).toContain('egos')
    expect(kinds).toContain('contract') // (all 20 are stars)
    expect(new Set(seasonEvents(allStars).map((e) => e.at)).size).toBe(5)
  })
})

describe('dynasty', () => {
  const s = { ...played(draftSeason(7), 5), matchday: 39 }

  it('keeps the drafted side, a year older, with places open for its leavers', () => {
    const { draft, dynasty } = summerDraft(s)
    expect(dynasty.season).toBe(2)
    expect(dynasty.past).toHaveLength(1)
    expect(dynasty.totals).toBeDefined()
    expect(dynasty.left!.length).toBeGreaterThanOrEqual(LEAVERS)
    expect(DRAFT_ROUNDS - roundOf(draft)).toBe(dynasty.left!.length)
    const kept = [...draft.xi, ...draft.bench].filter((p): p is PlayerDef => !!p)
    expect(kept.some((p) => p.role === 'GK')).toBe(true)
    for (const l of dynasty.left!) expect(kept.some((p) => p.name === l.name)).toBe(false)
    // The summer draft offers nobody already in the side.
    const names = new Set(kept.map((p) => p.name))
    expect(offer(draft).players.some((p) => names.has(p.name))).toBe(false)
  })

  it('makes the same summer every time', () => {
    expect(JSON.stringify(summerDraft(s))).toBe(JSON.stringify(summerDraft(s)))
  })

  it('fills the side and plays another season', () => {
    const { draft, dynasty } = summerDraft(s)
    const done = greedy(draft)
    const next: Season = { ...createSeason(done.seed, 0, new Date(Date.UTC(2027, 0, 15)), draftLeague(done, 'Test')), mode: 'draft', dynasty }
    expect(next.teams).toHaveLength(20)
    expect(next.startDate.slice(0, 4)).toBe('2027')
    const all = next.teams.flatMap((t) => [...t.players, ...t.bench].map((p) => p.name))
    expect(new Set(all).size).toBe(all.length)
    // Season three follows on.
    expect(summerDraft({ ...next, matchday: 39 }).dynasty.season).toBe(3)
  })

  it('ages a man to his next club-season when the database has it, else drifts him', () => {
    // Someone with two consecutive club-seasons.
    const years = new Map<string, number[]>()
    POOLS.forEach((p, pi) => p.players.forEach(([n]) => years.set(n, [...(years.get(n) ?? []), pi])))
    const [name, pools] = [...years].find(([, ps]) => ps.some((a) => ps.some((b) => Number(POOLS[b].season.slice(0, 4)) === Number(POOLS[a].season.slice(0, 4)) + 1)))!
    const a = pools.find((x) => pools.some((b) => Number(POOLS[b].season.slice(0, 4)) === Number(POOLS[x].season.slice(0, 4)) + 1))!
    const p = poolPlayer(a, POOLS[a].players.findIndex(([n]) => n === name))
    const q = aged(p, new Rng(1))
    expect(q.name).toBe(name)
    expect(q.id).not.toBe(p.id)
    expect(/^p\d+-\d+$/.test(q.id)).toBe(true)
    // A made-up man is left as he is.
    const madeUp = { ...p, id: 'm1-1' }
    expect(aged(madeUp, new Rng(1))).toBe(madeUp)
  })
})
