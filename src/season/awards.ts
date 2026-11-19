/**
 * The round-up's awards (session 37): player of the week (the matchday's best rating, 60 minutes
 * or more) and, every `MONTH` matchdays, player of the month (best average over them, three
 * appearances or more). From the results alone, so nothing is saved.
 */
import { type PlayerDef } from '../engine/index.ts'
import { type Season, fixturesOn, squadOf } from './season.ts'

export const MONTH = 4
export interface Award {
  player: PlayerDef
  club: number
  rating: number
  goals: number
  assists: number
  apps: number
}

function whoIs(s: Season, id: string): { player: PlayerDef; club: number } | null {
  for (let club = 0; club < s.teams.length; club++) {
    const player = squadOf(s.teams[club]).find((p) => p.id === id)
    if (player) return { player, club }
  }
  return null
}

function best(s: Season, from: number, to: number, minApps: number, minMinutes: number): Award | null {
  const sum = new Map<string, { r: number; n: number; g: number; a: number }>()
  for (let md = from; md <= to; md++)
    for (const f of fixturesOn(s, md))
      for (const a of f.result?.appearances ?? []) {
        if (a.minutes < minMinutes) continue
        const x = sum.get(a.id) ?? { r: 0, n: 0, g: 0, a: 0 }
        sum.set(a.id, { r: x.r + a.rating, n: x.n + 1, g: x.g + a.goals, a: x.a + a.assists })
      }
  let top: [string, { r: number; n: number; g: number; a: number }] | null = null
  for (const e of sum) if (e[1].n >= minApps && (!top || e[1].r / e[1].n > top[1].r / top[1].n)) top = e
  if (!top) return null
  const who = whoIs(s, top[0])
  return who && { ...who, rating: top[1].r / top[1].n, goals: top[1].g, assists: top[1].a, apps: top[1].n }
}

/** The matchday's player of the week. */
export const playerOfTheWeek = (s: Season, matchday: number): Award | null => best(s, matchday, matchday, 1, 60)

/** Player of the month, on the matchday that ends a month, else null. */
export const playerOfTheMonth = (s: Season, matchday: number): Award | null =>
  matchday % MONTH === 0 ? best(s, matchday - MONTH + 1, matchday, 3, 45) : null
