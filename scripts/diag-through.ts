import { randomTeam } from '../src/engine/index.ts'
import { checkMatch } from '../src/engine/harness.ts'
const n = Number(process.argv[2] ?? 10)
const out: Record<string, number> = {}
const inc = (k: string) => (out[k] = (out[k] ?? 0) + 1)
let goalsAfter = 0, shotsAfter = 0, total = 0
for (let seed = 1; seed <= n; seed++) {
  const { state } = checkMatch(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), { seed })
  const ev = state.events
  for (let i = 0; i < ev.length; i++) {
    const e = ev[i]
    if (e.type !== 'pass' || !e.through) continue
    total++
    const team = state.players[e.byIdx].team
    inc(`lofted=${e.lofted}`)
    inc(`passer ${state.players[e.byIdx].slot.role} -> ${state.players[e.toIdx].slot.role}`)
    for (let j = i + 1; j < ev.length; j++) {
      const f = ev[j]
      if (f.type === 'possession' || f.type === 'deflection') {
        const p = state.players[f.idx]
        inc(`first: ${p.team === team ? (f.idx === e.toIdx ? 'runner' : 'teammate') : p.slot.role === 'GK' ? 'keeper' : 'defender'} ${f.type}`)
        break
      }
      if (f.type === 'out' || f.type === 'offside') { inc(`first: ${f.type}`); break }
    }
    for (let j = i + 1; j < ev.length && ev[j].tick < e.tick + 80; j++) {
      const f = ev[j]
      if (f.type === 'shot' && state.players[f.byIdx].team === team) { shotsAfter++; break }
      if (f.type === 'possession' && state.players[f.idx].team !== team) break
    }
    for (let j = i + 1; j < ev.length && ev[j].tick < e.tick + 100; j++) {
      const f = ev[j]
      if (f.type === 'goal' && f.team === team) { goalsAfter++; break }
      if (f.type === 'possession' && state.players[f.idx].team !== team) break
    }
  }
}
console.log('through balls', total, 'shots within 8s', shotsAfter, 'goals within 10s', goalsAfter)
console.log(Object.entries(out).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join('\n'))
