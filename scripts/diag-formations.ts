/**
 * Formation balance by mirror test, judged by xG difference (far less noisy than goals).
 *   node scripts/diag-formations.ts [matches a pair=100] [first seed=1] [mode=equal|squad] [shapes]
 * equal: every pair of shapes, each side a fresh random squad of the same quality and block built
 *   for its shape. squad: one 20-man squad (eleven + bench) put out in both shapes by the staff's
 *   pick (fit x ability), so the same players play both. Sides alternate home and away. Runs on
 *   every core but one. Prints each pair, then each shape's xGD a match against the rest.
 *   block: the same squad (in its own random shape) in two blocks; `shapes` are then blocks.
 *   `shapes` is a comma list (default all six); a '+' after the first plays only its pairs.
 */
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads'
import { availableParallelism } from 'node:os'
import { FORMATIONS, FORMATION_NAMES, ability, fitFor, randomTeam, runMatch } from '../src/engine/index.ts'
import type { Block, Formation, PlayerDef, TeamDef } from '../src/engine/types.ts'

type Job = { a: Formation; b: Formation; seed: number; mode: string }
type Out = { a: Formation; b: Formation; xg: [number, number]; goals: [number, number]; shots: [number, number] }

const BLOCKS: Block[] = ['low', 'mid', 'high']

/** The staff's eleven for a shape from a squad: best fit x ability first. */
function reform(t: TeamDef, f: Formation): TeamDef {
  const slots = FORMATIONS[f]
  const pool = [...t.players, ...t.bench]
  const pairs = pool.flatMap((p) => slots.map((slot, i) => ({ p, i, score: fitFor(p, slot) * ability(p) })))
  pairs.sort((x, y) => y.score - x.score)
  const picked: (PlayerDef | null)[] = slots.map(() => null)
  const used = new Set<string>()
  for (const { p, i } of pairs) {
    if (picked[i] || used.has(p.id)) continue
    picked[i] = p
    used.add(p.id)
  }
  const players = picked.map((p, i) => ({ ...p!, shirt: i + 1 }))
  return { ...t, formation: f, players, bench: pool.filter((p) => !used.has(p.id)) }
}

function play({ a, b, seed, mode }: Job): Out {
  const block = BLOCKS[seed % 3]
  let ta: TeamDef
  let tb: TeamDef
  if (mode === 'block') {
    // The same squad (its own random shape) in two blocks: a and b are blocks here.
    ta = randomTeam(seed * 2 + 1, a as unknown as Block)
    tb = { ...randomTeam(seed * 2 + 1, b as unknown as Block), name: ta.name + ' II' }
  } else if (mode === 'squad') {
    const base = randomTeam(seed * 2 + 1, block)
    ta = reform(base, a)
    tb = { ...reform(base, b), name: base.name + ' II' }
  } else {
    ta = randomTeam(seed * 2 + 1, block, a)
    tb = randomTeam(seed * 2 + 1, block, b)
  }
  const swap = seed % 2 === 1
  const s = swap ? runMatch(tb, ta, { seed }) : runMatch(ta, tb, { seed })
  const [ia, ib] = swap ? [1, 0] : [0, 1]
  return {
    a,
    b,
    xg: [s.stats[ia].xg, s.stats[ib].xg],
    goals: [s.score[ia], s.score[ib]],
    shots: [s.stats[ia].shots, s.stats[ib].shots],
  }
}

if (!isMainThread) {
  for (const job of workerData as Job[]) parentPort!.postMessage(play(job))
  parentPort!.postMessage(null)
} else {
  const n = Number(process.argv[2] ?? 100)
  const first = Number(process.argv[3] ?? 1)
  const mode = process.argv[4] ?? 'equal'
  const shapes = (process.argv[5]?.split(',') as Formation[] | undefined) ?? (mode === 'block' ? (BLOCKS as unknown as Formation[]) : FORMATION_NAMES)
  const jobs: Job[] = []
  // Only the pairs with the first shape in them, with a trailing '+' (3-4-3+,4-4-2,4-3-3).
  const focus = process.argv[5]?.split(',')[0].endsWith('+')
  if (focus) shapes[0] = shapes[0].slice(0, -1) as Formation
  for (let i = 0; i < shapes.length; i++)
    for (let j = i + 1; j < shapes.length; j++) if (!focus || i === 0) for (let k = 0; k < n; k++) jobs.push({ a: shapes[i], b: shapes[j], seed: first + k, mode })
  const cores = Math.max(1, availableParallelism() - (availableParallelism() > 2 ? 1 : 0))
  const results: Out[] = []
  let left = cores
  await new Promise<void>((done) => {
    for (let c = 0; c < cores; c++) {
      const w = new Worker(new URL(import.meta.url), { workerData: jobs.filter((_, i) => i % cores === c) })
      w.on('message', (m: Out | null) => {
        if (m) results.push(m)
        else if (--left === 0) done()
      })
    }
  })
  const per: Record<string, { xgd: number; gd: number; n: number; xgf: number; xga: number }> = {}
  const add = (f: string, xgf: number, xga: number, gd: number): void => {
    const r = (per[f] ??= { xgd: 0, gd: 0, n: 0, xgf: 0, xga: 0 })
    r.xgd += xgf - xga
    r.gd += gd
    r.xgf += xgf
    r.xga += xga
    r.n++
  }
  for (let i = 0; i < shapes.length; i++)
    for (let j = i + 1; j < shapes.length; j++) {
      const rs = results.filter((r) => r.a === shapes[i] && r.b === shapes[j])
      if (!rs.length) continue
      const m = (f: (r: Out) => number): string => (rs.reduce((s, r) => s + f(r), 0) / rs.length).toFixed(2)
      console.log(`${shapes[i]} v ${shapes[j]}: xG ${m((r) => r.xg[0])}-${m((r) => r.xg[1])} (xGD ${m((r) => r.xg[0] - r.xg[1])}) goals ${m((r) => r.goals[0])}-${m((r) => r.goals[1])} shots ${m((r) => r.shots[0])}-${m((r) => r.shots[1])} n${rs.length}`)
    }
  for (const r of results) {
    add(r.a, r.xg[0], r.xg[1], r.goals[0] - r.goals[1])
    add(r.b, r.xg[1], r.xg[0], r.goals[1] - r.goals[0])
  }
  console.log(`\n${mode}, ${n} a pair from seed ${first}: each shape against the rest, a match`)
  for (const f of shapes) {
    const r = per[f]
    if (!r) continue
    console.log(`  ${f.padEnd(8)} xGD ${(r.xgd / r.n >= 0 ? '+' : '') + (r.xgd / r.n).toFixed(3)}  (xG ${(r.xgf / r.n).toFixed(2)} for, ${(r.xga / r.n).toFixed(2)} against)  GD ${(r.gd / r.n).toFixed(2)}  n${r.n}`)
  }
}
