/**
 * Draft variety at a glance: for each league and theme, its budget, how many club-seasons and
 * clubs it has, the league's elevens (average overall of each opponent's starters, and the weakest
 * and strongest), and what a greedy classic and a greedy budget draft put out (the eleven's
 * average overall, fitted; the budget side's rank among the league's elevens; money left).
 *
 *   node scripts/diag-draft.ts [drafts per row] [first seed]
 */
import type { Formation } from '../src/engine/index.ts'
import { type DraftOptions, LEAGUES, THEMES, budgetFor, draftLeague, draftPools, draftRating, newDraft } from '../src/draft/draft.ts'
import { POOLS, type League } from '../src/draft/pools.ts'
import { greedy } from './greedy-draft.ts'

const n = Number(process.argv[2] ?? 10)
const first = Number(process.argv[3] ?? 1)
const SHAPE: Formation = '4-3-3'

const avg = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
const elevenOf = (t: { players: { overall?: number }[] }): number => avg(t.players.map((p) => p.overall ?? 0))

const rows: { name: string; league?: League; opts: DraftOptions }[] = [
  ...LEAGUES.map((l) => ({ name: l, league: l, opts: {} })),
  ...THEMES.map((t) => ({ name: t.name, opts: { theme: t.id } })),
]
console.log('pool            budget seasons clubs | league xi (min-max) | classic xi | budget xi rank  £ left')
for (const row of rows) {
  const pools = draftPools({ theme: row.opts.theme, league: row.league })
  const clubs = new Set(pools.map((i) => POOLS[i].club)).size
  const leagueXi: number[] = []
  const lo: number[] = []
  const hi: number[] = []
  const classic: number[] = []
  const budget: number[] = []
  const rank: number[] = []
  const left: number[] = []
  for (let k = 0; k < n; k++) {
    const seed = first + k
    const c = greedy(newDraft(seed, SHAPE, row.league, row.opts))
    const b = greedy(newDraft(seed, SHAPE, row.league, { ...row.opts, budget: true }))
    classic.push(draftRating(c))
    budget.push(draftRating(b))
    left.push(b.money!)
    const teams = draftLeague(b, 'B').map(elevenOf)
    const others = teams.slice(1)
    leagueXi.push(avg(others))
    lo.push(Math.min(...others))
    hi.push(Math.max(...others))
    rank.push(1 + others.filter((x) => x > teams[0]).length)
  }
  const f = (x: number, w: number): string => x.toFixed(1).padStart(w)
  console.log(
    `${row.name.padEnd(16)} £${String(budgetFor({ theme: row.opts.theme, league: row.league })).padEnd(4)} ${String(pools.length).padStart(5)} ${String(clubs).padStart(5)} | ${avg(leagueXi).toFixed(1)} (${avg(lo).toFixed(1)}-${avg(hi).toFixed(1)}) | ${f(avg(classic), 10)} | ${f(avg(budget), 9)} ${f(avg(rank), 4)} ${f(avg(left), 6)}`,
  )
}
