/**
 * Where goals come from: the move that led to each goal (cross, through ball, set piece, turnover,
 * build-up) and how it was finished. `npm run` it with node: node scripts/diag-goals.ts [n] [first]
 */
import { BOX_DEPTH, BOX_HALF_WIDTH, CENTER, randomTeam } from '../src/engine/index.ts'
import { checkMatch } from '../src/engine/harness.ts'

const n = Number(process.argv[2] ?? 40)
const first = Number(process.argv[3] ?? 1)
const by: Record<string, number> = {}
let goals = 0
for (let seed = first; seed < first + n; seed++) {
  const { state } = checkMatch(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), { seed })
  const ev = state.events
  let half = 1
  const halfAt = ev.find((e) => e.type === 'halfTime')?.tick ?? Infinity
  for (let i = 0; i < ev.length; i++) {
    const g = ev[i]
    if (g.type !== 'goal') continue
    goals++
    half = g.tick > halfAt ? 2 : 1
    const team = g.team
    const high = (team === 0) === (half === 1)
    const inBox = (p: { x: number; y: number }): boolean => (high ? 105 - p.x : p.x) < BOX_DEPTH && Math.abs(p.y - CENTER.y) < BOX_HALF_WIDTH
    // The assisting ball: the last pass by the scoring team before the shot.
    const shotIdx = ev.slice(0, i).map((e) => e.type).lastIndexOf('shot')
    const shot = ev[shotIdx]
    let kind = 'other'
    if (g.ownGoal) kind = 'own goal'
    else if (shot?.type === 'shot' && shot.penalty) kind = 'penalty'
    else {
      for (let j = shotIdx - 1; j >= 0 && ev[j].tick > g.tick - 150; j--) {
        const e = ev[j]
        if (e.type === 'restart' && e.team === team && e.restart !== 'kickoff') {
          kind = `set piece (${e.restart})`
          break
        }
        if (e.type === 'possession' && state.players[e.idx].team !== team) break
        if (e.type === 'pass' && state.players[e.byIdx].team === team) {
          const wide = Math.abs(e.from.y - CENTER.y) > BOX_HALF_WIDTH - 4
          // Cleared by a defender first, then shot: a second ball, not the cross's goal.
          const cleared = ev.slice(j + 1, shotIdx).some((x) => x.type === 'deflection' && state.players[x.idx].team !== team)
          if (e.lofted && inBox(e.target) && wide) kind = cleared ? 'second ball after a cross' : 'cross'
          else if (e.through) kind = 'through ball'
          else if (!e.lofted && inBox(e.target) && wide) kind = 'cut-back / low cross'
          else kind = 'build-up pass'
          break
        }
        if (e.type === 'tackle' && e.won && state.players[e.byIdx].team === team) {
          kind = 'won the ball'
          break
        }
      }
    }
    const finish = shot?.type === 'shot' ? (shot.header ? 'header' : 'foot') : '-'
    by[`${kind} / ${finish}`] = (by[`${kind} / ${finish}`] ?? 0) + 1
  }
}
console.log(`${goals} goals in ${n} matches`)
for (const [k, v] of Object.entries(by).sort((a, b) => b[1] - a[1])) console.log(`${k.padEnd(34)} ${String(v).padStart(4)}  ${((100 * v) / goals).toFixed(0)}%`)
