/**
 * Plays a draft season headlessly (the staff pick every side) and saves it as JSON, for checking
 * ratings, stats, balance and the review against a whole season:
 * `node scripts/sim-season.ts <seed> <matchdays> <out.json> [league] [player]`, where `player`
 * ("Cristiano Ronaldo:94", name and overall) is put in your eleven before the greedy draft.
 */
import { writeFileSync } from 'node:fs'
import { runMatch } from '../src/engine/index.ts'
import { draftLeague, isComplete, newDraft, offer, place, poolPlayer } from '../src/draft/draft.ts'
import { POOLS, type League } from '../src/draft/pools.ts'
import { FORMATIONS } from '../src/engine/index.ts'
import { type Result, type Season, completeMatchday, createSeason, fitnessFor, fixturesOn, matchTeam, resultOf } from '../src/season/season.ts'

const seed = Number(process.argv[2] ?? 1)
const upTo = Number(process.argv[3] ?? 38)
const out = process.argv[4] ?? 'season.json'
const league = (process.argv[5] ?? 'Premier League') as League
const force = process.argv[6]

// A greedy 4-3-3 draft: the best player who fits an open place each round.
let d = newDraft(seed, '4-3-3', league)
const slots = FORMATIONS['4-3-3']
if (force) {
  const [name, overall] = force.split(':')
  const pi = POOLS.findIndex((p) => p.players.some(([n, , o]) => n === name && o === Number(overall)))
  if (pi < 0) throw new Error(`no ${force} in the squads`)
  const p = poolPlayer(pi, POOLS[pi].players.findIndex(([n, , o]) => n === name && o === Number(overall)))
  d = place(d, p, { xi: slots.findIndex((slot) => slot.role === p.role) })
}
while (!isComplete(d)) {
  const players = offer(d).players.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
  const starter = players.find((p) => d.xi.some((q, i) => !q && slots[i].role === p.role))
  if (starter) d = place(d, starter, { xi: d.xi.findIndex((q, i) => !q && slots[i].role === starter.role) })
  else if (d.bench.includes(null)) d = place(d, players[0], { bench: d.bench.indexOf(null) })
  else d = place(d, players[0], { xi: d.xi.indexOf(null) })
}
let s: Season = { ...createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1)), draftLeague(d, 'Backseat XI')), mode: 'draft', league }
const t0 = Date.now()
while (s.matchday <= upTo) {
  const results = new Map<number, Result>()
  const fitness = fitnessFor(s)
  for (const f of fixturesOn(s, s.matchday)) results.set(f.id, resultOf(runMatch(matchTeam(s, f.home), matchTeam(s, f.away), { seed: f.seed, fitness })))
  s = completeMatchday(s, results)
  process.stderr.write(`MD ${s.matchday - 1} (${Math.round((Date.now() - t0) / 1000)}s)\n`)
}
writeFileSync(out, JSON.stringify(s))
