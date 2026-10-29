/**
 * Plays a club-mode career headlessly, every match with the full engine and the staff picking
 * every side, and prints each season's league numbers next to real ranges: goals a match, the top
 * scorer, the best side's points, the league's strength, and per-90 numbers by position and age.
 * `node scripts/sim-career.ts <seed> <seasons> [out.json]` (~3 min a season).
 */
import { writeFileSync } from 'node:fs'
import { runMatch } from '../src/engine/index.ts'
import { type Result, type Season, completeMatchday, createSeason, fitnessFor, fixturesOn, isOver, matchTeam, matchdays, playerRating, resultOf, squadOf, table } from '../src/season/season.ts'
import { leagueLevel, nextSeason, squadsLevel, startCareer } from '../src/career/career.ts'
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
  console.log(`    regulars <=21: n${young.length} ovr ${avg(young)} (${line('', young)}) | >=32: n${old.length} ovr ${avg(old)} (${line('', old)})`)
}

let s = startCareer(createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1))))
const t0 = Date.now()
const history: Season[] = []
for (let n = 1; n <= seasons; n++) {
  while (!isOver(s)) {
    const results = new Map<number, Result>()
    const fitness = fitnessFor(s)
    for (const f of fixturesOn(s, s.matchday)) results.set(f.id, resultOf(runMatch(matchTeam(s, f.home), matchTeam(s, f.away), { seed: f.seed, fitness })))
    s = marketDay(completeMatchday(s, results))
  }
  report(s)
  process.stderr.write(`season ${n} (${Math.round((Date.now() - t0) / 1000)}s)\n`)
  history.push(s)
  if (n < seasons) s = marketDay(nextSeason(s))
}
if (out) writeFileSync(out, JSON.stringify(history))
