/**
 * Plays a draft season headlessly (the staff pick every side) and saves it as JSON, for checking
 * ratings, stats and the review against a whole season:
 * `node scripts/sim-season.ts <seed> <matchdays> <out.json>`.
 */
import { writeFileSync } from 'node:fs'
import { runMatch } from '../src/engine/index.ts'
import { draftLeague, isComplete, newDraft, offer, place } from '../src/draft/draft.ts'
import { FORMATIONS } from '../src/engine/index.ts'
import { type Result, type Season, completeMatchday, createSeason, fitnessFor, fixturesOn, matchTeam, resultOf } from '../src/season/season.ts'

const seed = Number(process.argv[2] ?? 1)
const upTo = Number(process.argv[3] ?? 38)
const out = process.argv[4] ?? 'season.json'

// A greedy 4-3-3 draft: the best player who fits an open place each round.
let d = newDraft(seed, '4-3-3')
const slots = FORMATIONS['4-3-3']
while (!isComplete(d)) {
  const players = offer(d).players.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
  const starter = players.find((p) => d.xi.some((q, i) => !q && slots[i].role === p.role))
  if (starter) d = place(d, starter, { xi: d.xi.findIndex((q, i) => !q && slots[i].role === starter.role) })
  else if (d.bench.includes(null)) d = place(d, players[0], { bench: d.bench.indexOf(null) })
  else d = place(d, players[0], { xi: d.xi.indexOf(null) })
}
let s: Season = { ...createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1)), draftLeague(d, 'Backseat XI')), mode: 'draft' }
const t0 = Date.now()
while (s.matchday <= upTo) {
  const results = new Map<number, Result>()
  const fitness = fitnessFor(s)
  for (const f of fixturesOn(s, s.matchday)) results.set(f.id, resultOf(runMatch(matchTeam(s, f.home), matchTeam(s, f.away), { seed: f.seed, fitness })))
  s = completeMatchday(s, results)
  process.stderr.write(`MD ${s.matchday - 1} (${Math.round((Date.now() - t0) / 1000)}s)\n`)
}
writeFileSync(out, JSON.stringify(s))
