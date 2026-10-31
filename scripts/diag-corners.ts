/**
 * How corners come about: the last touch before the ball went behind (a saved or blocked shot, a
 * clearance, a cross cut out, ...). node scripts/diag-corners.ts [n] [first]
 */
import { randomTeam } from '../src/engine/index.ts'
import { checkMatch } from '../src/engine/harness.ts'

const n = Number(process.argv[2] ?? 40)
const first = Number(process.argv[3] ?? 1)
const by: Record<string, number> = {}
let corners = 0
for (let seed = first; seed < first + n; seed++) {
  const { state } = checkMatch(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), { seed })
  const ev = state.events
  for (let i = 0; i < ev.length; i++) {
    const e = ev[i]
    if (e.type !== 'out' || e.award !== 'corner') continue
    corners++
    let kind = 'other'
    for (let j = i - 1; j >= 0; j--) {
      const x = ev[j]
      if (x.type === 'deflection') { kind = `deflection: ${x.kind}`; break }
      if (x.type === 'clearance') { kind = 'clearance'; break }
      if (x.type === 'shot') { kind = 'shot (off the defender)'; break }
      if (x.type === 'pass') { kind = x.lofted ? 'lofted pass' : 'pass'; break }
      if (x.type === 'tackle') { kind = 'tackle'; break }
      if (x.type === 'possession') { kind = `possession (${x.via})`; break }
    }
    by[kind] = (by[kind] ?? 0) + 1
  }
}
console.log(`${corners} corners in ${n} matches (${(corners / n / 2).toFixed(1)} per team)`)
for (const [k, v] of Object.entries(by).sort((a, b) => b[1] - a[1])) console.log(`${k.padEnd(30)} ${String(v).padStart(4)}  ${((100 * v) / corners).toFixed(0)}%`)
