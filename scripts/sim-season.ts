/**
 * Plays a draft season headlessly (the staff pick every side) and saves it as JSON, for checking
 * ratings, stats, balance and the review against a whole season:
 * `node scripts/sim-season.ts <seed> <matchdays> <out.json> [league] [player]`, where `player`
 * ("Cristiano Ronaldo:94", name and overall) is put in your eleven before the greedy draft.
 * Flags, anywhere: `--theme=<id>` (a themed draft, e.g. underdogs, era-2010, no-stars) and
 * `--budget` (a budget draft, drafted by scripts/greedy-draft.ts).
 */
import { writeFileSync } from 'node:fs'
import { runMatch } from '../src/engine/index.ts'
import { type ThemeId, budgetFor, draftLeague, draftRating, isComplete, newDraft, offer, place, poolPlayer } from '../src/draft/draft.ts'
import { greedy } from './greedy-draft.ts'
import { POOLS, type League } from '../src/draft/pools.ts'
import { FORMATIONS } from '../src/engine/index.ts'
import { type Result, type Season, autoPick, completeMatchday, createSeason, fitnessFor, fixturesOn, isAvailable, matchTeam, resultOf, squadOf, table } from '../src/season/season.ts'
import { unhappyStars, wantStart } from '../src/draft/morale.ts'
import { fitFor } from '../src/engine/index.ts'

const flags = process.argv.slice(2).filter((a) => a.startsWith('--'))
const args = [process.argv[0], process.argv[1], ...process.argv.slice(2).filter((a) => !a.startsWith('--'))]
const theme = flags.find((f) => f.startsWith('--theme='))?.slice(8) as ThemeId | undefined
const budget = flags.includes('--budget')
const difficulty = flags.find((f) => f.startsWith('--difficulty='))?.slice(13) as 'easy' | 'hard' | undefined
const seed = Number(args[2] ?? 1)
const upTo = Number(args[3] ?? 38)
const out = args[4] ?? 'season.json'
const league = (args[5] ?? 'Premier League') as League
const force = args[6]

// A greedy 4-3-3 draft: the best player who fits an open place each round.
const prime = flags.includes('--prime')
let d = newDraft(seed, '4-3-3', league, { theme, budget, prime })
const slots = FORMATIONS['4-3-3']
if (force) {
  const [name, overall] = force.split(':')
  const pi = POOLS.findIndex((p) => p.players.some(([n, , o]) => n === name && o === Number(overall)))
  if (pi < 0) throw new Error(`no ${force} in the squads`)
  const p = poolPlayer(pi, POOLS[pi].players.findIndex(([n, , o]) => n === name && o === Number(overall)))
  d = place(d, p, { xi: slots.findIndex((slot) => slot.role === p.role) })
}
// `dominant` (after the player): every other place in the eleven goes to the league's best player
// for it, from any of its club-seasons (an eleven of ~88), before the greedy draft fills the bench.
if (args[7] === 'dominant') {
  const used = new Set(d.xi.filter((p) => p).map((p) => p!.name))
  slots.forEach((slot, i) => {
    if (d.xi[i]) return
    let best: [number, number, number] | null = null
    POOLS.forEach((pool, pi) => {
      if (pool.league !== league) return
      pool.players.forEach(([name, positions, overall], k) => {
        if (positions.split('/')[0] === slot.role && !used.has(name) && (!best || overall > best[2])) best = [pi, k, overall]
      })
    })
    if (!best) return
    const p = poolPlayer(best[0], best[1])
    used.add(p.name)
    d = place(d, p, { xi: i })
  })
  console.error(`dominant eleven: ${d.xi.map((p) => `${p!.name} ${p!.overall}`).join(', ')}`)
}
if (budget || theme) d = greedy(d)
while (!isComplete(d)) {
  const players = offer(d).players.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
  const starter = players.find((p) => d.xi.some((q, i) => !q && slots[i].role === p.role))
  if (starter) d = place(d, starter, { xi: d.xi.findIndex((q, i) => !q && slots[i].role === starter.role) })
  else if (d.bench.includes(null)) d = place(d, players[0], { bench: d.bench.indexOf(null) })
  else d = place(d, players[0], { xi: d.xi.indexOf(null) })
}
let s: Season = {
  ...createSeason(d.seed, 0, new Date(Date.UTC(2026, 5, 1)), draftLeague(d, 'Backseat XI')),
  mode: 'draft',
  league: d.league,
  ...(theme || budget || difficulty || prime ? { draftStyle: { theme, budget: budget ? budgetFor(d) : undefined, ...(difficulty ? { difficulty } : {}), ...(prime ? { prime } : {}) } } : {}),
}
console.error(`our eleven ${draftRating(d)}${d.money !== undefined ? `, £${d.money}m left` : ''}`)
const t0 = Date.now()
// `--manage`: the manager keeps his stars happy, starting any who'd be (or are) unhappy in the place
// he fits best, ahead of the weakest starter there who isn't a star at risk himself.
const manage = flags.includes('--manage')
function managed(s: Season): string[] {
  const squad = squadOf(s.teams[s.userTeam])
  const ids = autoPick(s, s.userTeam)
  const risk = [...unhappyStars(s), ...wantStart(s)].filter((p) => isAvailable(s, p) && !ids.includes(p.id))
  const atRisk = new Set([...unhappyStars(s), ...wantStart(s)].map((p) => p.id))
  const slotsOf = FORMATIONS[s.teams[s.userTeam].formation]
  for (const star of risk) {
    let best = -1
    let worst = Infinity
    ids.forEach((id, i) => {
      const p = squad.find((q) => q.id === id)!
      if (atRisk.has(id) || slotsOf[i].role === 'GK' || fitFor(star, slotsOf[i]) < 0.9) return
      const v = (p.overall ?? 0) >= 85 ? 1000 + (p.overall ?? 0) : (p.overall ?? 0)
      if (v < worst) (worst = v), (best = i)
    })
    if (best >= 0) ids[best] = star.id
  }
  return ids
}
while (s.matchday <= upTo) {
  if (manage) s = { ...s, lineup: managed(s) }
  const results = new Map<number, Result>()
  const fitness = fitnessFor(s)
  for (const f of fixturesOn(s, s.matchday)) results.set(f.id, resultOf(runMatch(matchTeam(s, f.home), matchTeam(s, f.away), { seed: f.seed, fitness })))
  s = completeMatchday(s, results)
  process.stderr.write(`MD ${s.matchday - 1} (${Math.round((Date.now() - t0) / 1000)}s)\n`)
}
writeFileSync(out, JSON.stringify(s))
{
  const rows = table(s)
  const me = rows.find((r) => r.team === s.userTeam)!
  const top = Math.max(...Object.values(s.stats).map((st) => st.goals))
  const played = s.fixtures.filter((f) => f.result)
  const gpm = played.reduce((a, f) => a + f.result!.score[0] + f.result!.score[1], 0) / Math.max(1, played.length)
  const forced = force ? squadOf(s.teams[s.userTeam]).find((p) => p.name === force.split(':')[0]) : undefined
  console.log(
    `our side ${rows.indexOf(me) + 1}th, ${me.points} pts, ${me.goalsFor}-${me.goalsAgainst} | champions ${rows[0].points} | ${forced ? `${forced.name} ${s.stats[forced.id]?.goals ?? 0} goals | ` : ''}top scorer ${top} | goals a match ${gpm.toFixed(2)}`,
  )
}
