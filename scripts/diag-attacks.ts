/** How attacks that reach the final third end. */
import { createMatch, step, randomTeam } from '../src/engine/index.ts'
import { af } from '../src/engine/ai.ts'
const n = Number(process.argv[2] ?? 6)
const ends: Record<string, number> = {}
const carrierActs: Record<string, number> = {}
let entries = 0
for (let seed = 1; seed <= n; seed++) {
  const s = createMatch(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), { seed })
  let team: number | null = null
  let deep = false
  let lastEv = ''
  while (s.phase.kind !== 'fullTime') {
    const ev = step(s)
    const o = s.ball.ownerIdx
    if (o !== null) {
      const p = s.players[o]
      if (p.team !== team) { team = p.team; deep = false }
      if (!deep && af(s, p.team, p.pos).x > 75) { deep = true; entries++ }
    }
    for (const e of ev) {
      if (deep && (e.type === 'pass' || e.type === 'shot' || e.type === 'clearance') && s.players[e.byIdx].team === team) {
        const a = af(s, team as 0 | 1, e.from)
        if (a.x > 75) carrierActs[`${e.type}${e.type === 'pass' ? (e.lofted ? ' lofted' : '') + (af(s, team as 0|1, e.target).x < a.x - 3 ? ' back' : ' fwd/side') : ''}`] = (carrierActs[`${e.type}${e.type === 'pass' ? (e.lofted ? ' lofted' : '') + (af(s, team as 0|1, e.target).x < a.x - 3 ? ' back' : ' fwd/side') : ''}`] ?? 0) + 1
      }
      lastEv = e.type === 'tackle' ? `tackle won=${e.won}` : e.type === 'deflection' ? `deflection ${e.kind}` : e.type
      if (deep) {
        let end: string | null = null
        if (e.type === 'shot' && s.players[e.byIdx].team === team) end = 'shot'
        else if (e.type === 'possession' && s.players[e.idx].team !== team) end = `lost (after ${lastEv})`
        else if (e.type === 'tackle' && e.won && s.players[e.byIdx].team !== team) end = 'tackled'
        else if (e.type === 'out') end = `out ${e.award}`
        else if (e.type === 'foul') end = `foul`
        else if (e.type === 'offside') end = 'offside'
        else if (e.type === 'deflection' && s.players[e.idx].team !== team) end = `deflected ${e.kind}`
        else if (e.type === 'possession' && s.players[e.idx].team === team && af(s, team as 0 | 1, e.contact).x < 55) end = 'recycled back'
        if (end) { ends[end] = (ends[end] ?? 0) + 1; deep = false; if (end !== 'recycled back') team = null }
      }
    }
  }
}
const per = (v: number) => (v / n / 2).toFixed(1)
console.log('final-third entries per team', per(entries))
console.log(Object.entries(ends).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${per(v)}`).join('\n'))
console.log('--- actions by carriers in final third')
console.log(Object.entries(carrierActs).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${per(v)}`).join('\n'))
