/**
 * Match ratings by position over draft club-decade matches: mean, spread and how often each
 * position reaches 7.5+ or drops under 6. `node scripts/diag-ratings.ts [n] [first seed]` (default 40 matches).
 */
import { runMatch } from '../src/engine/index.ts'
import { POOLS } from '../src/draft/pools.ts'
import { poolTeam } from '../src/draft/draft.ts'
import { playerLines } from '../src/viewer/players.ts'

const n = Number(process.argv[2] ?? 40)
const seed0 = Number(process.argv[3] ?? 1000)
const by: Record<string, number[]> = {}
const seasonAvg: Record<string, number[]> = {}
const names: Record<string, { role: string; sum: number; apps: number }> = {}
const subs: number[] = []
for (let i = 0; i < n; i++) {
  const a = i % POOLS.length
  const b = (i * 7 + 3) % POOLS.length === a ? (a + 1) % POOLS.length : (i * 7 + 3) % POOLS.length
  const m = runMatch(poolTeam(a, new Set()), poolTeam(b, new Set()), { seed: seed0 + i })
  const lines = playerLines(m, m.events)
  m.players.forEach((p, k) => {
    const l = lines[k]
    if (!l.played) return
    if (l.on) {
      subs.push(l.rating)
      return
    }
    const role = p.slot.role
    ;(by[role] ??= []).push(l.rating)
    const e = (names[p.def.name] ??= { role, sum: 0, apps: 0 })
    e.sum += l.rating
    e.apps++
  })
}
for (const e of Object.values(names)) if (e.apps >= 3) (seasonAvg[e.role] ??= []).push(e.sum / e.apps)
const ROLES = ['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'W', 'ST']
console.log('role   n     mean   sd    >=7.5   <6     best avg (3+ apps)')
for (const r of ROLES) {
  const v = by[r]
  if (!v) continue
  const mean = v.reduce((x, y) => x + y, 0) / v.length
  const sd = Math.sqrt(v.reduce((x, y) => x + (y - mean) ** 2, 0) / v.length)
  const hi = v.filter((x) => x >= 7.5).length / v.length
  const lo = v.filter((x) => x < 6).length / v.length
  const best = Math.max(...(seasonAvg[r] ?? [0]))
  console.log(`${r.padEnd(6)} ${String(v.length).padEnd(5)} ${mean.toFixed(2)}  ${sd.toFixed(2)}  ${(hi * 100).toFixed(0).padStart(4)}%  ${(lo * 100).toFixed(0).padStart(4)}%  ${best.toFixed(2)}`)
}
console.log(`subs   ${String(subs.length).padEnd(5)} ${(subs.reduce((x, y) => x + y, 0) / subs.length).toFixed(2)}`)
