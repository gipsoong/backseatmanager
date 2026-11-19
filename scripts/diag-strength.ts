/**
 * How much the eleven's quality decides a career league's matches: the sides of the first season of
 * careers (seeds `first`..), at full fitness, in random pairings; xGD, goal difference and points a
 * match regressed on the difference in their elevens' overall (`elevenRating`). Also the share of
 * each side's xG from shots, and where the stronger side's edge comes from (shots, xG a shot, conversion).
 *   node scripts/diag-strength.ts [matches=300] [first career seed=1] [careers=3]
 * Runs on every core but one. Per-point slopes: ~0.08-0.1 xGD a point is "1 goal a game per 5 overall"
 * at its upper end (goals are xG plus finishing).
 */
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads'
import { availableParallelism } from 'node:os'
import { Rng, runMatch } from '../src/engine/index.ts'
import { createSeason, matchTeam } from '../src/season/season.ts'
import { elevenRating, startCareer } from '../src/career/career.ts'
import type { TeamDef } from '../src/engine/types.ts'

type Job = { home: TeamDef; away: TeamDef; dr: number; seed: number }
type Out = { dr: number; xg: [number, number]; goals: [number, number]; shots: [number, number]; poss: number }

if (!isMainThread) {
  for (const j of workerData as Job[]) {
    const s = runMatch(j.home, j.away, { seed: j.seed })
    parentPort!.postMessage({ dr: j.dr, xg: [s.stats[0].xg, s.stats[1].xg], goals: [s.score[0], s.score[1]], shots: [s.stats[0].shots, s.stats[1].shots], poss: s.stats[0].possessionTicks / Math.max(1, s.stats[0].possessionTicks + s.stats[1].possessionTicks) } satisfies Out)
  }
  parentPort!.postMessage(null)
} else {
  const n = Number(process.argv[2] ?? 300)
  const first = Number(process.argv[3] ?? 1)
  const careers = Number(process.argv[4] ?? 3)
  const jobs: Job[] = []
  const rng = new Rng(first * 977 + 13)
  const leagues = Array.from({ length: careers }, (_, k) => {
    const s = startCareer(createSeason(first + k, 0, new Date(Date.UTC(2026, 5, 1))))
    return s.teams.map((_, i) => ({ t: matchTeam(s, i), r: elevenRating(s, i) }))
  })
  for (let k = 0; k < n; k++) {
    const L = leagues[k % careers]
    const a = rng.int(0, L.length - 1)
    let b = rng.int(0, L.length - 2)
    if (b >= a) b++
    jobs.push({ home: L[a].t, away: L[b].t, dr: L[a].r - L[b].r, seed: 5000 + first * 1000 + k })
  }
  const cores = Math.max(1, availableParallelism() - (availableParallelism() > 2 ? 1 : 0))
  const rs: Out[] = []
  let left = cores
  await new Promise<void>((done) => {
    for (let c = 0; c < cores; c++) {
      const w = new Worker(new URL(import.meta.url), { workerData: jobs.filter((_, i) => i % cores === c) })
      w.on('message', (m: Out | null) => {
        if (m) rs.push(m)
        else if (--left === 0) done()
      })
    }
  })
  // Least squares y = a + b x (a: home advantage).
  const fit = (y: (r: Out) => number): [number, number, number] => {
    const mx = rs.reduce((s, r) => s + r.dr, 0) / rs.length
    const my = rs.reduce((s, r) => s + y(r), 0) / rs.length
    let sxy = 0
    let sxx = 0
    let syy = 0
    for (const r of rs) (sxy += (r.dr - mx) * (y(r) - my)), (sxx += (r.dr - mx) ** 2), (syy += (y(r) - my) ** 2)
    const b = sxy / sxx
    const se = Math.sqrt(Math.max(0, syy - b * sxy) / (rs.length - 2) / sxx)
    return [my - b * mx, b, se]
  }
  const pts = (r: Out, side: 0 | 1): number => (r.goals[side] > r.goals[1 - side] ? 3 : r.goals[side] === r.goals[1 - side] ? 1 : 0)
  const show = (label: string, y: (r: Out) => number): void => {
    const [a, b, se] = fit(y)
    console.log(`  ${label.padEnd(18)} per point ${b >= 0 ? '+' : ''}${b.toFixed(3)} ±${se.toFixed(3)}  (at 0: ${a.toFixed(2)})`)
  }
  const spread = rs.map((r) => Math.abs(r.dr))
  console.log(`${rs.length} matches, careers ${first}..${first + careers - 1}; mean |rating diff| ${(spread.reduce((a, b) => a + b, 0) / rs.length).toFixed(2)}`)
  show('xGD (home)', (r) => r.xg[0] - r.xg[1])
  show('GD (home)', (r) => r.goals[0] - r.goals[1])
  show('points (home)', (r) => pts(r, 0))
  show('shots diff', (r) => r.shots[0] - r.shots[1])
  show('possession', (r) => r.poss)
  const g = rs.reduce((s, r) => s + r.goals[0] + r.goals[1], 0) / rs.length
  const x = rs.reduce((s, r) => s + r.xg[0] + r.xg[1], 0) / rs.length
  console.log(`  goals a match ${g.toFixed(2)}, xG ${x.toFixed(2)}`)
  // The stronger side of each pairing (|diff| >= 3): shots, xG a shot, goals per xG.
  const big = rs.filter((r) => Math.abs(r.dr) >= 3)
  const st = big.map((r) => (r.dr > 0 ? { sh: r.shots, xg: r.xg, g: r.goals } : { sh: [r.shots[1], r.shots[0]], xg: [r.xg[1], r.xg[0]], g: [r.goals[1], r.goals[0]] }))
  const sum = (f: (o: (typeof st)[number]) => number): number => st.reduce((s, o) => s + f(o), 0)
  console.log(
    `  |diff| >= 3 (n${big.length}): stronger shots ${(sum((o) => o.sh[0]) / big.length).toFixed(1)} v ${(sum((o) => o.sh[1]) / big.length).toFixed(1)}, xG/shot ${(sum((o) => o.xg[0]) / sum((o) => o.sh[0])).toFixed(3)} v ${(sum((o) => o.xg[1]) / sum((o) => o.sh[1])).toFixed(3)}, goals/xG ${(sum((o) => o.g[0]) / sum((o) => o.xg[0])).toFixed(2)} v ${(sum((o) => o.g[1]) / sum((o) => o.xg[1])).toFixed(2)}`,
  )
}
