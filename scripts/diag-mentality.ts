/**
 * One squad against a copy of itself in two mentalities (a mirror test).
 *   node scripts/diag-mentality.ts <mentality a> <mentality b> [matches=100] [first seed=1]
 * Prints xG, goals, shots and points a match (a's view), and xGD.
 */
import { randomTeam, runMatch } from '../src/engine/index.ts'
import type { Mentality, Side } from '../src/engine/types.ts'

const ma = process.argv[2] as Mentality
const mb = process.argv[3] as Mentality
const n = Number(process.argv[4] ?? 100)
const first = Number(process.argv[5] ?? 1)
const t = { xg: [0, 0], goals: [0, 0], shots: [0, 0], pts: 0 }
for (let seed = first; seed < first + n; seed++) {
  const base = randomTeam(seed * 2 + 1)
  const a = { ...base, mentality: ma }
  const b = { ...base, mentality: mb, name: base.name + ' II' }
  const swap = seed % 2 === 1
  const usA: Side = swap ? 1 : 0
  const st = runMatch(swap ? b : a, swap ? a : b, { seed })
  for (const e of st.events) {
    if (e.type !== 'shot') continue
    const side = st.players[e.byIdx].team === usA ? 0 : 1
    t.xg[side] += e.xg
    t.shots[side]++
  }
  const ga = st.score[usA]
  const gb = st.score[1 - usA]
  t.goals[0] += ga
  t.goals[1] += gb
  t.pts += ga > gb ? 3 : ga === gb ? 1 : 0
}
const f = (x: number): string => (x / n).toFixed(2)
console.log(`${ma} v ${mb}, ${n} matches from seed ${first}`)
console.log(`xG ${f(t.xg[0])}-${f(t.xg[1])}  goals ${f(t.goals[0])}-${f(t.goals[1])}  shots ${f(t.shots[0])}-${f(t.shots[1])}  pts ${f(t.pts)}  xGD ${f(t.xg[0] - t.xg[1])}`)
