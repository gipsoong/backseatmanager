/**
 * Plays a club-mode career headlessly, every match with the full engine and the staff picking
 * every side, and prints each season's league numbers next to real ranges: goals a match, the top
 * scorer, the best side's points, the league's strength, and per-90 numbers by position and age.
 * `node scripts/sim-career.ts <seed> <seasons> [out.json]` (~3 min a season).
 */
import { writeFileSync } from 'node:fs'
import { runMatch } from '../src/engine/index.ts'
import { type Result, type Season, completeMatchday, createSeason, fitnessFor, fixturesOn, isOver, matchTeam, matchdays, playerRating, resultOf, squadOf, table } from '../src/season/season.ts'
import { elevenRating, leagueLevel, nextSeason, squadsLevel, startCareer } from '../src/career/career.ts'
import { marketDay } from '../src/career/market.ts'

const seed = Number(process.argv[2] ?? 1)
const seasons = Number(process.argv[3] ?? 5)
const out = process.argv[4]

const GROUPS: Record<string, string[]> = { DEF: ['CB', 'FB'], MID: ['DM', 'CM', 'WM'], FWD: ['W', 'ST'] }

function report(s: Season): void {
  const played = s.fixtures.filter((f) => f.result)
  const goals = played.reduce((n, f) => n + f.result!.score[0] + f.result!.score[1], 0)
  const rows = table(s)
  const scale = 38 / matchdays(s)
  const all = s.teams.flatMap((t, club) => squadOf(t).map((p) => ({ p, club, st: s.stats[p.id], age: s.career!.people[p.id].age })))
  const top = all.reduce((a, b) => (b.st.goals > a.st.goals ? b : a))
  const regular = all.filter((x) => (x.st.minutes ?? 0) >= matchdays(s) * 45)
  const per90 = (xs: typeof all, k: 'goals' | 'shots' | 'xg'): string => {
    const m = xs.reduce((n, x) => n + (x.st.minutes ?? 0), 0)
    return m ? ((xs.reduce((n, x) => n + (x.st[k] ?? 0), 0) / m) * 90).toFixed(2) : '-'
  }
  const line = (label: string, xs: typeof all): string => `${label} n${xs.length} g ${per90(xs, 'goals')} sh ${per90(xs, 'shots')} xg ${per90(xs, 'xg')}`
  console.log(
    `S${s.career!.number} ${s.startDate.slice(0, 4)}: goals/match ${(goals / played.length).toFixed(2)} | top ${top.p.name} ${top.st.goals} (x38/${matchdays(s)}: ${Math.round(top.st.goals * scale)}) | best ${rows[0].points} pts (x: ${Math.round(rows[0].points * scale)}) | worst ${rows.at(-1)!.points} | level XI ${leagueLevel(s).toFixed(2)} squads ${squadsLevel(s.teams).toFixed(2)}`,
  )
  console.log('   ', Object.entries(GROUPS).map(([g, roles]) => line(g, regular.filter((x) => roles.includes(x.p.role)))).join(' | '))
  const young = regular.filter((x) => x.age <= 21)
  const old = regular.filter((x) => x.age >= 32)
  const avg = (xs: typeof all): string => (xs.length ? (xs.reduce((n, x) => n + playerRating(x.p), 0) / xs.length).toFixed(1) : '-')
  // Strength spread: the champions' eleven against the bottom side's, and whether stars gather.
  const strength = s.teams.map((_, i) => elevenRating(s, i))
  const top20 = all.map((x) => ({ club: x.club, r: playerRating(x.p) })).sort((a, b) => b.r - a.r).slice(0, 20)
  const hoard = Math.max(...s.teams.map((_, c) => top20.filter((x) => x.club === c).length))
  const deals = (s.transfers ?? []).filter((t) => !t.from.includes(s.userTeam) && !t.to.includes(s.userTeam)).length
  const cash = s.career!.finance?.cash ?? [0]
  // Squads grow to 24 with academy kids, so their average falls while the best twenty's holds.
  const best20 = s.teams.flatMap((t) => squadOf(t).map(playerRating).sort((a, b) => b - a).slice(0, 20))
  console.log(`    best twenty of each squad ${(best20.reduce((a, b) => a + b, 0) / best20.length).toFixed(2)}`)
  console.log(
    `    champions' eleven ${strength[rows[0].team].toFixed(1)}, bottom ${strength[rows.at(-1)!.team].toFixed(1)}; strongest - weakest ${(Math.max(...strength) - Math.min(...strength)).toFixed(1)} | top-20 players at one club ${hoard} | AI deals ${deals} | cash ${Math.min(...cash).toFixed(0)}..${Math.max(...cash).toFixed(0)}`,
  )
  console.log(`    regulars <=21: n${young.length} ovr ${avg(young)} (${line('', young)}) | >=32: n${old.length} ovr ${avg(old)} (${line('', old)})`)
}

let s = startCareer(createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1))))
const t0 = Date.now()
const history: Season[] = []
const mdTime: number[] = []
for (let n = 1; n <= seasons; n++) {
  while (!isOver(s)) {
    const results = new Map<number, Result>()
    const fitness = fitnessFor(s)
    const m0 = Date.now()
    for (const f of fixturesOn(s, s.matchday)) results.set(f.id, resultOf(runMatch(matchTeam(s, f.home), matchTeam(s, f.away), { seed: f.seed, fitness })))
    mdTime.push(Date.now() - m0)
    s = marketDay(completeMatchday(s, results))
  }
  report(s)
  process.stderr.write(`season ${n} (${Math.round((Date.now() - t0) / 1000)}s, a matchday ${(mdTime.reduce((a, b) => a + b, 0) / mdTime.length / 1000).toFixed(1)}s on one core)\n`)
  history.push(s)
  if (n < seasons) s = marketDay(nextSeason(s))
}
if (out) writeFileSync(out, JSON.stringify(history))
