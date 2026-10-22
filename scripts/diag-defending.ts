/**
 * Who makes the tackles and interceptions, by position, per 90 (real ranges alongside), and what
 * kind of pass each position intercepts. `node scripts/diag-defending.ts [n] [first seed]`.
 */
import { runMatch } from '../src/engine/index.ts'
import { POOLS } from '../src/draft/pools.ts'
import { poolTeam } from '../src/draft/draft.ts'
import { playerLines } from '../src/viewer/players.ts'

const n = Number(process.argv[2] ?? 30)
const seed0 = Number(process.argv[3] ?? 1000)
const ROLES = ['CB', 'FB', 'DM', 'CM', 'WM', 'W', 'ST']
// Rough top-league per-90 figures (Opta-style): tackles won, interceptions.
const REAL: Record<string, string> = { CB: '1.0 / 1.4', FB: '1.3 / 1.2', DM: '1.7 / 1.3', CM: '1.3 / 0.9', WM: '1.0 / 0.7', W: '0.7 / 0.4', ST: '0.4 / 0.2' }
const tot: Record<string, { min: number; tk: number; int: number; rec: number }> = {}
const kind: Record<string, Record<string, number>> = {}
const d = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
for (let i = 0; i < n; i++) {
  const a = i % POOLS.length
  const b = (i * 7 + 3) % POOLS.length === a ? (a + 1) % POOLS.length : (i * 7 + 3) % POOLS.length
  const m = runMatch(poolTeam(a, new Set()), poolTeam(b, new Set()), { seed: seed0 + i })
  const lines = playerLines(m, m.events)
  m.players.forEach((p, k) => {
    const l = lines[k]
    if (!l.played || l.on || p.slot.role === 'GK') return
    const t = (tot[p.slot.role] ??= { min: 0, tk: 0, int: 0, rec: 0 })
    t.min += 90
    t.tk += l.tackles
    t.int += l.interceptions
    t.rec += l.recoveries
  })
  let pending: any = null
  for (const e of m.events as any[]) {
    if (e.type === 'shootout') break
    if (e.type === 'pass') pending = e
    else if (e.type === 'clearance' || e.type === 'restart') pending = null
    else if (e.type === 'possession') {
      if (e.via === 'interception' && pending && m.players[pending.byIdx].team !== m.players[e.idx].team) {
        const role = m.players[e.idx].slot.role
        const len = d(pending.from, pending.target)
        const fromTarget = d(e.contact, pending.target)
        const c = pending.lofted ? (len > 30 ? 'long lofted' : 'lofted') : fromTarget < 4 ? 'at the target' : len > 30 ? 'long ground' : 'ground'
        const by = m.players[pending.byIdx].slot.role
        ;(kind[role] ??= {})[c] = (kind[role][c] ?? 0) + 1
        ;(kind[role] ??= {})['from ' + by] = (kind[role]['from ' + by] ?? 0) + 1
      }
      pending = null
    }
  }
}
let all = 0
for (const t of Object.values(tot)) all += t.int
console.log('interceptions per team per match (starters)', (all / n / 2).toFixed(1), '(real ~9-12)')
console.log('role  tackles/90 int/90 rec/90   real tk / int')
for (const r of ROLES) {
  const t = tot[r]
  if (!t) continue
  const p = (v: number) => ((v / t.min) * 90).toFixed(2).padStart(6)
  console.log(r.padEnd(5), p(t.tk), '   ', p(t.int), p(t.rec), '  ', REAL[r])
}
for (const r of ROLES) if (kind[r]) console.log(r, JSON.stringify(Object.entries(kind[r]).sort((a, b) => b[1] - a[1])))
