/**
 * Mid-season events (session 37, draft seasons): three a season, at matchdays drawn from the seed,
 * each a choice of two. Their effects are boosts: a few points on some of your players' technique
 * for a few weeks (as form moves it, season/form.ts), applied by `matchTeam`. The first choice is
 * what happens if you play on without choosing; a second choice may also change the season when
 * it's made (a rested man is out, a camp costs fitness). Choices are kept in `Season.choices`.
 * Type-only imports from season.ts: season.ts calls `eventBoosts`.
 */
import { Rng, type PlayerDef } from '../engine/index.ts'
import type { Season } from '../season/season.ts'

export type EventKind = 'bustUp' | 'unsettled' | 'knock' | 'camp'
export interface SeasonEvent {
  index: number
  kind: EventKind
  /** The matchday it comes up before. */
  at: number
}
export interface Boost {
  ids: string[]
  amount: number
  /** Matchdays it covers, from and to inclusive. */
  from: number
  to: number
}
export interface Choice {
  choice: number
  ids: string[]
}

const KINDS: EventKind[] = ['bustUp', 'unsettled', 'knock', 'camp']
/** Matchday windows (of 38) the season's three events fall in. */
const WINDOWS: [number, number][] = [
  [5, 12],
  [15, 24],
  [26, 33],
]
/** How long an effect lasts, in matchdays. */
export const EFFECT_WEEKS = 5

/** The season's events, from its seed (scaled to its length). */
export function seasonEvents(s: Season): SeasonEvent[] {
  if (s.mode !== 'draft') return []
  const rng = new Rng(s.seed * 13 + 5)
  const kinds = rng.shuffle([...KINDS]).slice(0, WINDOWS.length)
  const scale = (s.teams.length - 1) / 19
  return WINDOWS.map(([a, b], index) => ({ index, kind: kinds[index], at: Math.max(2, Math.round(rng.int(a, b) * scale)) }))
}

/** The players an event is about, from the eleven you drafted (best first), as it stands now. */
export function targetsOf(s: Season, e: SeasonEvent): PlayerDef[] {
  const kept = s.choices?.[e.index]
  const squad = [...s.teams[s.userTeam].players, ...s.teams[s.userTeam].bench]
  if (kept) return kept.ids.flatMap((id) => squad.filter((p) => p.id === id))
  const xi = s.teams[s.userTeam].players.filter((p) => p.role !== 'GK').sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
  const rng = new Rng(s.seed * 7 + e.index)
  switch (e.kind) {
    case 'bustUp': {
      const a = xi[rng.int(0, 2)]
      const b = rng.pick(xi.filter((p) => p !== a))
      return [a, b]
    }
    case 'unsettled':
      return xi.slice(0, 3)
    case 'knock':
      return [xi[rng.int(0, Math.min(5, xi.length - 1))]]
    case 'camp':
      return []
  }
}

export interface EventText {
  title: string
  text: string
  options: [string, string]
  /** What each option does, in a line. */
  effects: [string, string]
}

const last = (p: PlayerDef): string => p.name.split(' ').slice(-1)[0]

/** What the event says, for the hub's card. */
export function eventText(s: Season, e: SeasonEvent): EventText {
  const [a, b, c] = targetsOf(s, e)
  const w = EFFECT_WEEKS
  switch (e.kind) {
    case 'bustUp':
      return {
        title: 'Training-ground row',
        text: `${a.name} and ${b.name} had to be pulled apart at training. The dressing room is watching what you do.`,
        options: [`Back ${last(a)}`, 'Bang heads together'],
        effects: [`${last(b)} sulks: −3 for ${w} matches.`, `Both off their game: −1 for ${w} matches.`],
      }
    case 'unsettled':
      return {
        title: 'Star wants a move',
        text: `${a.name}'s agent says he wants a bigger stage. He'll play, but his head may not be in it.`,
        options: ["Tell him he's going nowhere", 'Hand him the armband'],
        effects: [`${last(a)} −3 for ${w} matches.`, `${last(a)} +2 for the rest of the season, but ${last(b)} and ${last(c)} feel passed over: −2 for ${w} matches.`],
      }
    case 'knock':
      return {
        title: 'A knock',
        text: `${a.name} picked up a knock. The physio thinks he could play through it.`,
        options: ['Play through it', 'Rest him for two matches'],
        effects: [`${last(a)} −3 for ${w} matches.`, `${last(a)} misses two matches, then he's fine.`],
      }
    case 'camp':
      return {
        title: 'Warm-weather camp',
        text: 'A club in the sun has offered its facilities for a week of training between matches.',
        options: ['Stay at home', 'Go to the camp'],
        effects: ['Nothing changes.', `The squad +2 for ${w} matches, but everyone's legs are heavier now (−15% fitness).`],
      }
  }
}

/** What a choice does, as boosts (the second choice's one-off changes are in `choose`). */
function boostsFor(s: Season, e: SeasonEvent, choice: number): Boost[] {
  const t = targetsOf(s, e)
  const span = (amount: number, ids: string[], to = e.at + EFFECT_WEEKS - 1): Boost => ({ ids, amount, from: e.at, to })
  switch (e.kind) {
    case 'bustUp':
      return choice === 0 ? [span(-3, [t[1].id])] : [span(-1, [t[0].id, t[1].id])]
    case 'unsettled':
      return choice === 0 ? [span(-3, [t[0].id])] : [span(2, [t[0].id], Infinity), span(-2, [t[1].id, t[2].id])]
    case 'knock':
      return choice === 0 ? [span(-3, [t[0].id])] : []
    case 'camp': {
      const all = [...s.teams[s.userTeam].players, ...s.teams[s.userTeam].bench].map((p) => p.id)
      return choice === 0 ? [] : [span(2, all)]
    }
  }
}

/** The event waiting for a choice before this matchday's match, if any. */
export function pendingEvent(s: Season): SeasonEvent | undefined {
  return seasonEvents(s).find((e) => e.at === s.matchday && !s.choices?.[e.index] && targetsOf(s, e).every(Boolean))
}

/** Every boost in force: chosen events, and events passed by without a choice (the first option). */
export function eventBoosts(s: Season): Boost[] {
  return seasonEvents(s)
    .filter((e) => s.choices?.[e.index] || e.at < s.matchday)
    .filter((e) => targetsOf(s, e).every(Boolean))
    .flatMap((e) => boostsFor(s, e, s.choices?.[e.index]?.choice ?? 0))
}

/** His boost on a matchday. */
export function boostOn(boosts: Boost[], id: string, matchday: number): number {
  return boosts.reduce((n, b) => n + (matchday >= b.from && matchday <= b.to && b.ids.includes(id) ? b.amount : 0), 0)
}

/** The season with a choice made (and the second option's one-off changes). */
export function choose(s: Season, e: SeasonEvent, choice: number): Season {
  const ids = targetsOf(s, e).map((p) => p.id)
  let next: Season = { ...s, choices: { ...s.choices, [e.index]: { choice, ids } } }
  if (choice === 1 && e.kind === 'knock') {
    const c = next.condition[ids[0]]
    next = { ...next, condition: { ...next.condition, [ids[0]]: { ...c, injuredUntil: Math.max(c?.injuredUntil ?? 0, e.at + 2) } } }
  }
  if (choice === 1 && e.kind === 'camp') {
    const squad = [...s.teams[s.userTeam].players, ...s.teams[s.userTeam].bench]
    const condition = { ...next.condition }
    for (const p of squad) if (condition[p.id]) condition[p.id] = { ...condition[p.id], fitness: Math.max(0.5, condition[p.id].fitness - 0.15) }
    next = { ...next, condition }
  }
  return next
}
