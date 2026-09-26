import { createMatch, step, randomTeam } from '../src/engine/index.ts'
import { ballPath, arrivalOf, reachOf, reachHeightOf, af } from '../src/engine/ai.ts'
const n = Number(process.argv[2] ?? 5)
const rows: string[] = []
const buckets: Record<string, [number, number]> = {}
for (let seed = 1; seed <= n; seed++) {
  const s = createMatch(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), { seed })
  let pending: { team: number; runner: number; tR: number; tD: number; dIdx: number; tick: number; lofted: boolean; x: number } | null = null
  while (s.phase.kind !== 'fullTime') {
    const ev = step(s)
    for (const e of ev) {
      if (e.type === 'pass' && e.through) {
        const path = ballPath(s.ball, 45)
        const r = s.players[e.toIdx]
        const tR = arrivalOf(r, path, reachOf(s, r), reachHeightOf(s, r)).ticks
        let tD = Infinity, dIdx = -1
        for (const o of s.players) if (o.onPitch && o.team !== r.team) {
          const t = arrivalOf(o, path, reachOf(s, o), reachHeightOf(s, o)).ticks
          if (t < tD) { tD = t; dIdx = o.idx }
        }
        pending = { team: r.team, runner: r.idx, tR, tD, dIdx, tick: e.tick, lofted: e.lofted, x: af(s, r.team, e.target).x }
      } else if (pending && (e.type === 'possession' || e.type === 'deflection' || e.type === 'out' || e.type === 'offside')) {
        const who = e.type === 'out' ? 'out' : e.type === 'offside' ? 'offside' : s.players[e.idx].team === pending.team ? 'ours' : `theirs(${s.players[e.idx].slot.role}${e.type === 'deflection' ? ' ' + e.kind : ''})`
        const m = Math.round((pending.tD - pending.tR) / 5) * 5
        const key = `margin ${m < -10 ? '<-10' : m > 20 ? '>20' : m}`
        buckets[key] ??= [0, 0]
        buckets[key][1]++
        if (who === 'ours') buckets[key][0]++
        if (rows.length < 40) rows.push(`seed ${seed} t${pending.tick} lofted=${pending.lofted} x=${pending.x.toFixed(0)} runner@${pending.tR} def(${s.players[pending.dIdx].slot.role})@${pending.tD} actual ${who} @${e.tick - pending.tick}`)
        pending = null
      }
    }
  }
}
console.log(rows.join('\n'))
console.log(Object.entries(buckets).sort().map(([k, [a, b]]) => `${k}: ${a}/${b}`).join('\n'))
