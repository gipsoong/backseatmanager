/**
 * Plays a club-mode career headlessly, every match with the full engine and the staff picking
 * every side, and prints each season's league numbers next to real ranges: goals a match, the top
 * scorer, the best side's points, the league's strength, and per-90 numbers by position and age.
 * `node scripts/sim-career.ts <seed> <seasons> [out.json] [--real[=<league id>]]` (~15 min a season):
 * `--real` plays a real league's career (default the Premier League 2024/25) and prints its table.
 */
import { writeFileSync } from 'node:fs'
import { runMatch } from '../src/engine/index.ts'
import { type Result, type Season, completeMatchday, createSeason, fitnessFor, fixturesOn, isOver, matchTeam, matchdays, playerRating, resultOf, squadOf, table } from '../src/season/season.ts'
import { elevenRating, leagueLevel, nextSeason, squadsLevel, startCareer, startRealCareer } from '../src/career/career.ts'
import { REAL_LEAGUES } from '../src/career/real.ts'
import { wageBill as bill } from '../src/career/money.ts'
import { marketDay } from '../src/career/market.ts'
import { Rng } from '../src/engine/index.ts'
import { completeCupDay, cupRun, domesticCupMatches, domesticWinner, isDomesticCupDay } from '../src/career/cup.ts'
import { staffRenewals } from '../src/career/contracts.ts'
import { wageBill } from '../src/career/money.ts'

const flag = process.argv.find((a) => a.startsWith('--real'))
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const seed = Number(args[0] ?? 1)
const seasons = Number(args[1] ?? 5)
const out = args[2]
const real = flag ? (flag.split('=')[1] ?? REAL_LEAGUES[0].id) : undefined

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
  const c = s.career!
  const cup = c.cup
  const winner = cup ? domesticWinner(cup) : null
  const sizes = s.teams.map((t) => squadOf(t).length)
  const bills = s.teams.map((_, i) => wageBill(s, i))
  const income = c.finance?.income ?? []
  const left = all.map((x) => c.people[x.p.id].contract!.until - Number(s.startDate.slice(0, 4)))
  console.log(
    `    cup: ${winner === null ? 'NO WINNER' : `${s.teams[winner].name} (league ${rows.findIndex((r) => r.team === winner) + 1})`}, user ${cup ? cupRun(cup, s.userTeam) : '-'} | squads ${Math.min(...sizes)}..${Math.max(...sizes)} | free agents ${c.freeAgents?.length ?? 0} | contracts 1y ${left.filter((y) => y <= 1).length} 2y ${left.filter((y) => y === 2).length} 3y+ ${left.filter((y) => y >= 3).length} | wages/income ${(bills.reduce((a, b) => a + b, 0) / income.reduce((a, b) => a + b, 0)).toFixed(2)}`,
  )
  if (c.summer) console.log(`    summer (user): expired ${c.summer.expired?.length ?? 0}, retired ${c.summer.retired.length}, signed ${c.summer.signed.length}, released ${c.summer.released.length}`)
  if (real) {
    // The table, with each club's eleven when the season began (the order it "should" finish in).
    // (Ranked by the elevens the career began with.)
    const start = s.career!.levels
    const byStart = s.teams.map((_, i) => i).sort((a, b) => start[b] - start[a])
    console.log(`    table: ${rows.map((r, k) => `${k + 1}. ${s.teams[r.team].shortName} ${r.points} (XI #${byStart.indexOf(r.team) + 1})`).join(', ')}`)
    const top = all.slice().sort((a, b) => b.st.goals - a.st.goals).slice(0, 5)
    console.log(`    scorers: ${top.map((x) => `${x.p.name} ${x.st.goals}`).join(', ')}`)
    const sixes = all.filter((x) => (x.st.minutes ?? 0) >= matchdays(s) * 45)
    const ages = sixes.map((x) => x.age)
    console.log(`    regulars' age ${(ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1)} | wage bill £${s.teams.reduce((n, _, i) => n + bill(s, i), 0).toFixed(0)}m`)
  }
  console.log(`    regulars <=21: n${young.length} ovr ${avg(young)} (${line('', young)}) | >=32: n${old.length} ovr ${avg(old)} (${line('', old)})`)
}

let s = real ? startRealCareer(seed, real) : startCareer(createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1))))
const t0 = Date.now()
const history: Season[] = []
const mdTime: number[] = []
for (let n = 1; n <= seasons; n++) {
  while (!isOver(s)) {
    if (isDomesticCupDay(s)) {
      const fitness = fitnessFor(s)
      const cupResults = new Map<number, Result>()
      for (const m of domesticCupMatches(s)) cupResults.set(m.id, resultOf(runMatch(m.home, m.away, { seed: m.seed, fitness, knockout: m.knockout })))
      s = completeCupDay(s, cupResults)
      continue
    }
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
  // The staff handle the manager's contracts as at any other club.
  if (n < seasons) s = marketDay(nextSeason(staffRenewals(s, new Rng(seed * 17 + n))))
}
if (out) writeFileSync(out, JSON.stringify(history))
