/** What happens to crosses: who gets the first touch, and what follows. */
import { BOX_DEPTH, BOX_HALF_WIDTH, CENTER, randomTeam } from '../src/engine/index.ts'
import { checkMatch } from '../src/engine/harness.ts'
const n = Number(process.argv[2] ?? 10)
const out: Record<string, number> = {}
let crosses = 0
for (let seed = 1; seed <= n; seed++) {
  const { state } = checkMatch(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), { seed })
  const ev = state.events
  let half = 1
  for (let i = 0; i < ev.length; i++) {
    const e = ev[i]
    if (e.type === 'halfTime') half = 2
    if (e.type !== 'pass' || !e.lofted) continue
    const team = state.players[e.byIdx].team
    const high = (team === 0) === (half === 1)
    const depth = high ? 105 - e.target.x : e.target.x
    if (!(depth < BOX_DEPTH && Math.abs(e.target.y - CENTER.y) < BOX_HALF_WIDTH && Math.abs(e.from.y - CENTER.y) > 12)) continue
    crosses++
    const f = ev.slice(i + 1).find((g) => ['possession', 'deflection', 'out', 'offside', 'shot', 'clearance'].includes(g.type))
    if (!f) continue
    let k: string = f.type
    if (f.type === 'possession') k = `${state.players[f.idx].team === team ? 'attacker controls' : state.players[f.idx].slot.role === 'GK' ? 'keeper claims' : 'defender wins'} (h ${f.height > 1 ? 'air' : 'low'})`
    if (f.type === 'deflection') k = `${state.players[f.idx].team === team ? 'attacker' : state.players[f.idx].slot.role === 'GK' ? 'keeper' : 'defender'} ${f.kind}`
    if (f.type === 'out') k = `out ${f.award}`
    out[k] = (out[k] ?? 0) + 1
  }
}
console.log('crosses per team', (crosses / n / 2).toFixed(1))
console.log(Object.entries(out).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${(100 * v / crosses).toFixed(0)}%`).join('\n'))
