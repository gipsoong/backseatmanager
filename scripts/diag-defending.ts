/**
 * Who wins the ball, by position, per 90 for starters (real ranges alongside), and how opponents'
 * passes were won: cut out on the way (interception), taken off the receiver (a duel, counted as a
 * tackle), blocked by a man on the passer, or picked up once they'd run on (a recovery).
 * `node scripts/diag-defending.ts [n] [first seed]` (draft club-season matches).
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
const tot: Record<string, { min: number; tk: number; int: number; rec: number; blk: number }> = {}
const kind: Record<string, Record<string, number>> = {}
let ints = 0
for (let i = 0; i < n; i++) {
  const a = i % POOLS.length
  const b = (i * 7 + 3) % POOLS.length === a ? (a + 1) % POOLS.length : (i * 7 + 3) % POOLS.length
  const m = runMatch(poolTeam(a, new Set()), poolTeam(b, new Set()), { seed: seed0 + i })
  const lines = playerLines(m, m.events)
  m.players.forEach((p, k) => {
    const l = lines[k]
    ints += l.interceptions
    if (!l.played || l.on || p.slot.role === 'GK') return
    const t = (tot[p.slot.role] ??= { min: 0, tk: 0, int: 0, rec: 0, blk: 0 })
    t.min += 90
    t.tk += l.tackles
    t.int += l.interceptions
    t.rec += l.recoveries
    t.blk += l.blocks
  })
  for (const e of m.events) {
    if (e.type === 'shootout') break
    if (e.type === 'possession' && e.won) {
      const role = m.players[e.idx].slot.role
      ;(kind[role] ??= {})[e.won] = (kind[role][e.won] ?? 0) + 1
    }
  }
}
console.log('interceptions per team per match', (ints / n / 2).toFixed(1), '(real ~9-12, which also counts some taken at the receiver)')
console.log('role  tackles/90 int/90 rec/90 blocks/90   real tk / int')
for (const r of ROLES) {
  const t = tot[r]
  if (!t) continue
  const p = (v: number) => ((v / t.min) * 90).toFixed(2).padStart(6)
  console.log(r.padEnd(5), p(t.tk), '   ', p(t.int), p(t.rec), p(t.blk), '    ', REAL[r])
}
console.log('opponents\' passes won (all players): cut / duel / block / loose')
for (const r of ROLES) if (kind[r]) console.log(r.padEnd(5), ['cut', 'duel', 'block', 'loose'].map((k) => kind[r][k] ?? 0).join(' / '))
