/**
 * Fingerprints of full matches, for changes that must not change any result (speed work,
 * refactors): `node scripts/fingerprint.ts [n]` before and after, and the hashes must be the same.
 * Plays n (default 24) matches: random clubs (as sim/calibrate pick them), a 20-club career league,
 * draft sides of two leagues, and knockout ties (extra time, penalties). Each hash covers every
 * event, the stats, and where every player and the ball ended up. Prints ms a match too.
 */
import { createHash } from 'node:crypto'
import { FORMATIONS, type MatchConfig, type TeamDef, leagueTeams, randomTeam, runMatch } from '../src/engine/index.ts'
import { draftLeague, isComplete, newDraft, offer, place } from '../src/draft/draft.ts'
import type { League } from '../src/draft/pools.ts'

const n = Number(process.argv[2] ?? 24)

interface Fixture {
  home: TeamDef
  away: TeamDef
  config: MatchConfig
}

/** A greedy 4-3-3 draft (as sim-season.ts makes one), then its league. */
function draftSides(seed: number, league: League): TeamDef[] {
  let d = newDraft(seed, '4-3-3', league)
  const slots = FORMATIONS['4-3-3']
  while (!isComplete(d)) {
    const players = offer(d).players.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    const starter = players.find((p) => d.xi.some((q, i) => !q && slots[i].role === p.role))
    if (starter) d = place(d, starter, { xi: d.xi.findIndex((q, i) => !q && slots[i].role === starter.role) })
    else if (d.bench.includes(null)) d = place(d, players[0], { bench: d.bench.indexOf(null) })
    else d = place(d, players[0], { xi: d.xi.indexOf(null) })
  }
  return draftLeague(d, 'Backseat XI')
}

const fixtures: Fixture[] = []
for (let s = 1; s <= 8; s++) fixtures.push({ home: randomTeam(s * 2 + 1), away: randomTeam(s * 2 + 2), config: { seed: s } })
const career = leagueTeams(7, 20)
for (let i = 0; i < 6; i++) fixtures.push({ home: career[i * 2], away: career[i * 2 + 1], config: { seed: 100 + i, fitness: Object.fromEntries(career[i * 2].players.slice(2, 6).map((p) => [p.id, 0.8])) } })
for (const [seed, league] of [[3, 'Premier League'], [4, 'La Liga']] as const) {
  const t = draftSides(seed, league)
  for (let i = 0; i < 3; i++) fixtures.push({ home: t[i * 2], away: t[i * 2 + 1], config: { seed: 200 + seed * 10 + i } })
}
for (let i = 0; i < 3; i++) fixtures.push({ home: randomTeam(901 + i * 2), away: randomTeam(902 + i * 2), config: { seed: 77 + i, knockout: { carried: [i % 2, i % 2] } } })
// Level after extra time: penalties.
fixtures.push({ home: randomTeam(605), away: randomTeam(606), config: { seed: 302, knockout: { carried: [0, 0] } } })

const all = createHash('sha1')
let ms = 0
for (const f of fixtures.slice(0, n)) {
  const t0 = performance.now()
  const s = runMatch(f.home, f.away, f.config)
  ms += performance.now() - t0
  const h = createHash('sha1')
    .update(JSON.stringify(s.events))
    .update(JSON.stringify(s.stats))
    .update(JSON.stringify(s.players.map((p) => [p.pos.x, p.pos.y, p.vel.x, p.vel.y, p.energy, p.onPitch])))
    .update(JSON.stringify([s.ball, s.tick, s.score, s.shootout]))
    .digest('hex')
    .slice(0, 12)
  all.update(h)
  console.log(`seed ${String(f.config.seed).padStart(3)}  ${h}  ${s.score.join('-')}${s.shootout ? ' (pens)' : ''}`)
}
const count = Math.min(n, fixtures.length)
console.log(`all ${all.digest('hex').slice(0, 12)}  (${count} matches, ${(ms / count).toFixed(0)} ms a match)`)
