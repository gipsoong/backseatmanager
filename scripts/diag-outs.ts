import { randomTeam } from '../src/engine/index.ts'
import { checkMatch } from '../src/engine/harness.ts'
const n = Number(process.argv[2] ?? 10)
const out: Record<string, number> = {}
for (let seed = 1; seed <= n; seed++) {
  const { state } = checkMatch(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), { seed })
  let last = 'none'
  for (const e of state.events) {
    if (e.type === 'pass') last = `pass${e.through ? ' through' : ''}${e.lofted ? ' lofted' : ''}`
    else if (e.type === 'clearance') last = `clearance${e.header ? ' header' : ''}`
    else if (e.type === 'deflection') last = `deflection ${e.kind}`
    else if (e.type === 'shot') last = 'shot'
    else if (e.type === 'possession') last = `possession`
    else if (e.type === 'tackle') last = `tackle`
    else if (e.type === 'out' && e.award === 'throwIn') out[last] = (out[last] ?? 0) + 1
  }
}
console.log(Object.entries(out).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${(v / n / 2).toFixed(1)}`).join('\n'))
