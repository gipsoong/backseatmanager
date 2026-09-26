import { randomTeam } from '../src/engine/index.ts'
import { checkMatch } from '../src/engine/harness.ts'
const n = Number(process.argv[2] ?? 10)
const out: Record<string, number> = {}
const inc = (k: string) => (out[k] = (out[k] ?? 0) + 1)
for (let seed = 1; seed <= n; seed++) {
  const { state } = checkMatch(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), { seed })
  const ev = state.events
  let half = 1
  for (let i = 0; i < ev.length; i++) {
    const e = ev[i]
    if (e.type === 'halfTime') half = 2
    if (e.type !== 'pass' || !e.through) continue
    const f = ev.slice(i + 1).find((g) => g.type === 'possession' || g.type === 'deflection' || g.type === 'out' || g.type === 'offside')
    if (!f || f.type !== 'possession' || f.idx !== e.toIdx) continue
    const team = state.players[e.toIdx].team
    const high = (team === 0) === (half === 1)
    const ax = high ? f.contact.x : 105 - f.contact.x
    const ay = Math.abs(f.contact.y - 34)
    const zone = ax > 88.5 && ay < 20 ? 'in box' : ax > 75 ? (ay < 20 ? 'edge' : 'wide final third') : 'midfield'
    const g = ev.slice(ev.indexOf(f) + 1).find((h) => h.type === 'shot' || h.type === 'pass' || h.type === 'clearance' || (h.type === 'tackle' && h.won) || h.type === 'foul' || h.type === 'out')
    inc(`${zone} -> ${g ? g.type + (g.type === 'pass' && g.lofted ? ' lofted' : '') : '?'}`)
    inc(`role ${state.players[e.toIdx].slot.role} ${zone}`)
  }
}
console.log(Object.entries(out).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join('\n'))
