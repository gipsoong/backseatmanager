/**
 * Links (session 37, draft mode): two of your starters are linked if they were at the same club at
 * the same time, as far as the database's seasons show (`PlayerDef.clubs`, from `clubsOf` in draft.ts when he's made). A linked
 * starter knows the others' game a little: +1 to his technique and reading (as form does,
 * season/form.ts) with one or two links, +2 with three or more. Only the manager's drafted side gets
 * it: club-seasons already play as a club.
 */
import type { PlayerDef, TeamDef } from '../engine/index.ts'
import { inForm } from '../season/form.ts'

/** A club entry, "Club@2006-2009" (an older save's entries are the club alone: any season). */
function spell(entry: string): { club: string; from: number; to: number } {
  const at = entry.lastIndexOf('@')
  if (at < 0) return { club: entry, from: -Infinity, to: Infinity }
  const [from, to] = entry.slice(at + 1).split('-').map(Number)
  return { club: entry.slice(0, at), from, to }
}

/** The club two players were at together, if any (spells that overlap; the first alphabetically). */
export function sharedClub(a: PlayerDef, b: PlayerDef): string | null {
  if (a.name === b.name) return null
  const theirs = (b.clubs ?? []).map(spell)
  return (
    (a.clubs ?? [])
      .map(spell)
      .filter((x) => theirs.some((y) => y.club === x.club && x.from <= y.to && y.from <= x.to))
      .map((x) => x.club)
      .sort()[0] ?? null
  )
}

export interface Link {
  a: number
  b: number
  club: string
}

/** The links among an eleven (indexes into it; empty places skipped). */
export function linksOf(xi: (PlayerDef | null)[]): Link[] {
  const out: Link[] = []
  for (let a = 0; a < xi.length; a++)
    for (let b = a + 1; b < xi.length; b++) {
      const pa = xi[a]
      const pb = xi[b]
      const club = pa && pb ? sharedClub(pa, pb) : null
      if (club) out.push({ a, b, club })
    }
  return out
}

/** A starter's bonus from his links: 0, 1 (one or two), 2 (three or more). */
export const linkBonus = (links: number): number => (links >= 3 ? 2 : links >= 1 ? 1 : 0)

/** Each starter's link count. */
export function linkCounts(xi: (PlayerDef | null)[]): number[] {
  const n = xi.map(() => 0)
  for (const l of linksOf(xi)) {
    n[l.a]++
    n[l.b]++
  }
  return n
}

/** The side as it plays with its links (its eleven only; the bench as it is). */
export function linkedTeam(t: TeamDef): TeamDef {
  const n = linkCounts(t.players)
  return { ...t, players: t.players.map((p, i) => inForm(p, linkBonus(n[i]))) }
}

/** The players in `xi` that `p` would link with, and the club. */
export function linksFor(p: PlayerDef, xi: (PlayerDef | null)[]): { with: PlayerDef; club: string }[] {
  return xi.flatMap((q) => {
    const club = q ? sharedClub(p, q) : null
    return q && club ? [{ with: q, club }] : []
  })
}
