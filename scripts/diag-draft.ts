/**
 * Draft variety at a glance: for each league and theme, how many club-seasons and clubs it has,
 * the league's elevens (average overall of each opponent's starters), and what a greedy classic
 * and a greedy budget draft put out (the eleven's average overall, fitted).
 *
 *   node scripts/diag-draft.ts [drafts per row] [first seed]
 */
import { FORMATIONS, type Formation } from '../src/engine/index.ts'
import { type Draft, type DraftOptions, LEAGUES, THEMES, budgetFor, canAfford, draftLeague, draftPools, draftRating, fitted, isComplete, newDraft, offer, place, priceIn, spendable } from '../src/draft/draft.ts'
import { POOLS, type League } from '../src/draft/pools.ts'

const n = Number(process.argv[2] ?? 10)
const first = Number(process.argv[3] ?? 1)
const SHAPE: Formation = '4-3-3'

/** Classic: the best fit for an open starting place, else the best as a sub. */
export function greedy(d: Draft): Draft {
  const slots = FORMATIONS[d.formation]
  while (!isComplete(d)) {
    const { players } = offer(d)
    const open = d.xi.flatMap((q, i) => (q ? [] : [i]))
    // A budget draft keeps enough back for the open starting places: the money left less the
    // bench's least, shared among them, with some room for a star.
    const benchLeft = d.bench.filter((q) => !q).length
    const perStarter = d.money === undefined ? Infinity : (d.money - benchLeft) / Math.max(1, open.length)
    const cap = Math.min(spendable(d), open.length > 1 ? perStarter * 1.6 : perStarter)
    let best: { p: (typeof players)[number]; slot: number; v: number } | null = null
    for (const p of players) {
      if (d.money !== undefined && priceIn(d, p, players) > cap) continue
      for (const slot of open) {
        const v = fitted(p, slot, d.formation)
        if (slots[slot].role === p.role || (p.positions ?? []).includes(slots[slot].role)) if (!best || v > best.v) best = { p, slot, v }
      }
    }
    if (best) {
      d = place(d, best.p, { xi: best.slot })
      continue
    }
    if (d.bench.some((q) => !q)) {
      // The bench: the best he can afford cheaply (classic: the best).
      const pool = players.filter((p) => canAfford(d, p, players))
      const pick = d.money === undefined ? pool.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0] : pool.sort((a, b) => priceIn(d, a, players) - priceIn(d, b, players) || (b.overall ?? 0) - (a.overall ?? 0))[0]
      d = place(d, pick, { bench: d.bench.indexOf(null) })
      continue
    }
    // Out of position: anyone affordable in the best open place.
    let alt: { p: (typeof players)[number]; slot: number; v: number } | null = null
    for (const p of players) if (canAfford(d, p, players)) for (const slot of open) {
      const v = fitted(p, slot, d.formation)
      if (!alt || v > alt.v) alt = { p, slot, v }
    }
    d = place(d, alt!.p, { xi: alt!.slot })
  }
  return d
}

const avg = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
const elevenOf = (t: { players: { overall?: number }[] }): number => avg(t.players.map((p) => p.overall ?? 0))

const rows: { name: string; league?: League; opts: DraftOptions }[] = [
  ...LEAGUES.map((l) => ({ name: l, league: l, opts: {} })),
  ...THEMES.map((t) => ({ name: t.name, opts: { theme: t.id } })),
]
console.log('pool              seasons clubs | league xi (min-max) | classic xi | budget xi  £ left')
for (const row of rows) {
  const pools = draftPools({ theme: row.opts.theme, league: row.league })
  const clubs = new Set(pools.map((i) => POOLS[i].club)).size
  const leagueXi: number[] = []
  const lo: number[] = []
  const hi: number[] = []
  const classic: number[] = []
  const budget: number[] = []
  const left: number[] = []
  for (let k = 0; k < n; k++) {
    const seed = first + k
    const c = greedy(newDraft(seed, SHAPE, row.league, row.opts))
    const b = greedy(newDraft(seed, SHAPE, row.league, { ...row.opts, budget: true }))
    classic.push(draftRating(c))
    budget.push(draftRating(b))
    left.push(b.money!)
    const teams = draftLeague(b, 'B').slice(1).map(elevenOf)
    leagueXi.push(avg(teams))
    lo.push(Math.min(...teams))
    hi.push(Math.max(...teams))
  }
  console.log(
    `${row.name.padEnd(18)} £${budgetFor({ theme: row.opts.theme, league: row.league })} ${String(pools.length).padStart(5)} ${String(clubs).padStart(5)} | ${avg(leagueXi).toFixed(1)} (${avg(lo).toFixed(1)}-${avg(hi).toFixed(1)}) | ${avg(classic).toFixed(1).padStart(10)} | ${avg(budget).toFixed(1).padStart(9)} ${avg(left).toFixed(1).padStart(6)}`,
  )
}
