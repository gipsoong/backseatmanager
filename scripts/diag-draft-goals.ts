/**
 * Why draft leagues score what they score: draft leagues (classic, greedy) of each league next to
 * career leagues (first season), at full fitness in random pairs. Per kind: goals, xG, shots, on
 * target, keepers' save share, xG a shot, penalties, and the lines' average sub-attributes.
 *   node scripts/diag-draft-goals.ts [matches a kind=120] [first seed=1] [kinds=all]
 * kinds: comma list of 'career' and league names (e.g. "career,La Liga"). Runs on every core but one.
 */
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads'
import { availableParallelism } from 'node:os'
import { Rng, runMatch } from '../src/engine/index.ts'
import type { PlayerDef, TeamDef } from '../src/engine/types.ts'
import { ROLE_OFFSET, cardOverall } from '../src/engine/attributes.ts'
import { createSeason, matchTeam, playerRating } from '../src/season/season.ts'
import { startCareer } from '../src/career/career.ts'
import { type Draft, LEAGUES, draftLeague, isComplete, newDraft, offer, place } from '../src/draft/draft.ts'
import { FORMATIONS } from '../src/engine/index.ts'
import type { League } from '../src/draft/pools.ts'

/** sim-season's greedy 4-3-3 draft (inline, so this runs on older commits too). */
function greedy(d: Draft): Draft {
  const slots = FORMATIONS['4-3-3']
  while (!isComplete(d)) {
    const players = offer(d).players.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    const starter = players.find((p) => d.xi.some((q, i) => !q && slots[i].role === p.role))
    if (starter) d = place(d, starter, { xi: d.xi.findIndex((q, i) => !q && slots[i].role === starter.role) })
    else if (d.bench.includes(null)) d = place(d, players[0], { bench: d.bench.indexOf(null) })
    else d = place(d, players[0], { xi: d.xi.indexOf(null) })
  }
  return d
}

type Job = { kind: string; home: TeamDef; away: TeamDef; seed: number; gap: number }
type Out = { gap: number; kind: string; goals: number; xg: number; shots: number; on: number; pens: number; penGoals: number; boxShots: number; boxGoals: number; rangeGoals: number; headGoals: number; saves: number }

if (!isMainThread) {
  for (const j of workerData as Job[]) {
    const s = runMatch(j.home, j.away, { seed: j.seed })
    const o: Out = { gap: j.gap, kind: j.kind, goals: s.score[0] + s.score[1], xg: s.stats[0].xg + s.stats[1].xg, shots: s.stats[0].shots + s.stats[1].shots, on: s.stats[0].shotsOnTarget + s.stats[1].shotsOnTarget, pens: 0, penGoals: 0, boxShots: 0, boxGoals: 0, rangeGoals: 0, headGoals: 0, saves: 0 }
    let last: { penalty: boolean; box: boolean; header: boolean } | null = null
    for (const e of s.events) {
      if (e.type === 'shootout') break
      if (e.type === 'shot') {
        const x = e.from.x
        const toGoal = Math.min(x, 105 - x)
        const box = toGoal <= 16.5 && Math.abs(e.from.y - 34) <= 20.16
        last = { penalty: e.penalty, box, header: e.header }
        if (e.penalty) o.pens++
        else if (box) o.boxShots++
      }
      if (e.type === 'goal' && last) {
        if (last.penalty) o.penGoals++
        else if (last.box) o.boxGoals++
        else o.rangeGoals++
        if (last.header) o.headGoals++
        last = null
      }
    }
    parentPort!.postMessage(o)
  }
  parentPort!.postMessage(null)
} else {
  const n = Number(process.argv[2] ?? 120)
  const first = Number(process.argv[3] ?? 1)
  const kinds = (process.argv[4] ?? ['career', ...LEAGUES].join(',')).split(',')
  const leaguesOf = (kind: string): TeamDef[][] =>
    [0, 1, 2].map((k) => {
      const seed = first + k
      if (kind === 'career') {
        const s = startCareer(createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1))))
        return s.teams.map((_, i) => matchTeam(s, i))
      }
      const d = greedy(newDraft(seed, '4-3-3', kind as League))
      const s = createSeason(d.seed, 0, new Date(Date.UTC(2026, 5, 1)), draftLeague(d, 'Backseat XI'))
      return s.teams.map((_, i) => matchTeam(s, i))
    })
  const jobs: Job[] = []
  const xiOf = (t: TeamDef): number => t.players.reduce((n, p) => n + (p.overall ?? cardOverall(p.attrs, p.role) - ROLE_OFFSET[p.role]), 0) / t.players.length
  const attrs: Record<string, Record<string, number[]>> = {}
  const lineOf = (p: PlayerDef): string => (p.role === 'GK' ? 'GK' : p.role === 'CB' || p.role === 'FB' ? 'DEF' : p.role === 'ST' || p.role === 'W' ? 'FWD' : 'MID')
  const KEYS: Record<string, string[]> = {
    GK: ['diving', 'handling', 'reflexes', 'gkPositioning'],
    DEF: ['sprintSpeed', 'marking', 'standingTackle', 'interceptions', 'heading', 'jumping', 'strength'],
    MID: ['sprintSpeed', 'shortPassing', 'vision', 'longShots', 'finishing', 'interceptions'],
    FWD: ['sprintSpeed', 'acceleration', 'finishing', 'shotPower', 'dribbling', 'positioning', 'composure'],
  }
  const forced = process.env.BLOCK as TeamDef['block'] | undefined
  for (const kind of kinds) {
    const Ls = leaguesOf(kind).map((L) => (forced ? L.map((t) => ({ ...t, block: forced })) : L))
    const shapes: Record<string, number> = {}
    for (const L of Ls) for (const t of L) shapes[`${t.formation} ${t.block}`] = (shapes[`${t.formation} ${t.block}`] ?? 0) + 1
    console.error(kind, JSON.stringify(shapes))
    const a: Record<string, number[]> = {}
    for (const L of Ls)
      for (const t of L)
        for (const p of t.players) {
          const line = lineOf(p)
          for (const k of KEYS[line]) (a[`${line}.${k}`] ??= []).push((p.attrs as unknown as Record<string, number>)[k])
          ;(a[`${line}.overall`] ??= []).push(playerRating(p))
          ;(a[`${line}.flair`] ??= []).push(p.traits.flair * 20)
          ;(a[`${line}.directness`] ??= []).push(p.traits.directness * 20)
        }
    attrs[kind] = a
    const rng = new Rng(first * 991 + kind.length)
    for (let k = 0; k < n; k++) {
      const L = Ls[k % Ls.length]
      const h = rng.int(0, L.length - 1)
      let w = rng.int(0, L.length - 2)
      if (w >= h) w++
      jobs.push({ kind, home: L[h], away: L[w], seed: 7000 + first * 1000 + k, gap: Math.abs(xiOf(L[h]) - xiOf(L[w])) })
    }
  }
  const cores = Math.max(1, availableParallelism())
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
  const mean = (xs: number[]): number => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length)
  console.log('kind            goals   xG  shots  onT  conv%   box sh  box g  range g  head g  pens  pen g')
  for (const kind of kinds) {
    const r = rs.filter((x) => x.kind === kind)
    const m = (f: (o: Out) => number): number => mean(r.map(f))
    const sum = (f: (o: Out) => number): number => r.reduce((s, o) => s + f(o), 0)
    console.log(
      `${kind.padEnd(15)} ${m((o) => o.goals).toFixed(2).padStart(5)} ${m((o) => o.xg).toFixed(2).padStart(5)} ${m((o) => o.shots).toFixed(1).padStart(5)} ${m((o) => o.on).toFixed(1).padStart(5)} ${((100 * sum((o) => o.goals)) / Math.max(1, sum((o) => o.on))).toFixed(0).padStart(6)} ${m((o) => o.boxShots).toFixed(1).padStart(7)} ${m((o) => o.boxGoals).toFixed(2).padStart(6)} ${m((o) => o.rangeGoals).toFixed(2).padStart(8)} ${m((o) => o.headGoals).toFixed(2).padStart(7)} ${m((o) => o.pens).toFixed(2).padStart(5)} ${m((o) => o.penGoals).toFixed(2).padStart(6)}`,
    )
  }
  console.log('\nby |eleven gap|:  <2  2-5  5+  (xG a match, matches)')
  for (const kind of kinds) {
    const r = rs.filter((x) => x.kind === kind)
    const band = (lo: number, hi: number): string => {
      const b = r.filter((o) => o.gap >= lo && o.gap < hi)
      return `${mean(b.map((o) => o.xg)).toFixed(2)} (${b.length})`.padStart(13)
    }
    console.log(`${kind.padEnd(15)} mean gap ${mean(r.map((o) => o.gap)).toFixed(2)} ${band(0, 2)} ${band(2, 5)} ${band(5, 99)}`)
  }
  console.log('\nlines (average of every starter):')
  const keys = Object.keys(attrs[kinds[0]])
  console.log(`${''.padEnd(22)}${kinds.map((k) => k.slice(0, 9).padStart(10)).join('')}`)
  for (const key of keys) console.log(`${key.padEnd(22)}${kinds.map((k) => mean(attrs[k][key] ?? []).toFixed(1).padStart(10)).join('')}`)
}
