/**
 * How possession spells go against each block: one squad in two blocks (as diag-formations block).
 *   node scripts/diag-blocks.ts <block a> <block b> [matches=20] [first seed=1]
 * For each side: spells by the third they began in, how far they got, what ended them (the side's
 * last kick before the other side had it: ground pass, lofted pass, through ball, clearance, a
 * tackle on the carrier, a shot), and where (in the winner's frame) the other side then had it.
 * Also each side's back line out of possession (m from its goal), and with the ball unpressured.
 */
import { randomTeam, runMatch } from '../src/engine/index.ts'
import { af, defensiveLine } from '../src/engine/ai.ts'
import type { Block, Side } from '../src/engine/types.ts'

const ba = process.argv[2] as Block
const bb = process.argv[3] as Block
const n = Number(process.argv[4] ?? 20)
const first = Number(process.argv[5] ?? 1)
type Acc = {
  spells: number[]
  reached: number[][]
  ends: Record<string, number>[]
  lostAt: number[][]
  xg: number
  poss: number
  line: number
  lineN: number
  lineUnp: number
  lineUnpN: number
  regainHigh: number
  clear: number[]
  energy: number
  xgFrom: number[]
  clr: Record<string, number[]>
  src: Record<string, number[]>
  pas: Record<string, number[]>
  cr: number[]
  edge: number[]
}
const mk = (): Acc => ({
  spells: [0, 0, 0],
  reached: [0, 1, 2].map(() => [0, 0, 0]),
  ends: [0, 1, 2].map(() => ({})),
  lostAt: [0, 1, 2].map(() => [0, 0, 0]),
  xg: 0,
  poss: 0,
  line: 0,
  lineN: 0,
  lineUnp: 0,
  lineUnpN: 0,
  regainHigh: 0,
  clear: [0, 0, 0],
  energy: 0,
  xgFrom: [0, 0, 0],
  clr: {},
  src: {},
  pas: {},
  cr: [0, 0, 0, 0],
  edge: [0, 0, 0, 0],
})
const acc = [mk(), mk()]
const KN_ROLES = false
const third = (x: number): number => (x < 35 ? 0 : x < 70 ? 1 : 2)
for (let seed = first; seed < first + n; seed++) {
  const ta = randomTeam(seed * 2 + 1, ba)
  const tb = { ...randomTeam(seed * 2 + 1, bb), name: ta.name + ' II' }
  const swap = seed % 2 === 1
  const usA: Side = swap ? 1 : 0
  let holder: Side | null = null
  let start = 0
  let maxX = 0
  let last = 'none'
  let prevPass = 'none'
  let pp: { team: Side; key: string } | null = null
  let cx: { team: Side; tick: number; first: boolean } | null = null
  let pend: { team: Side; key: string } | null = null
  const st = runMatch(swap ? tb : ta, swap ? ta : tb, { seed }, (st, events) => {
    for (const e of events) {
      if (cx && st.tick - cx.tick > 40) cx = null
      if (cx && cx.first && (e.type === 'possession' || e.type === 'deflection' || e.type === 'shot' || e.type === 'clearance')) {
        const who = st.players[e.type === 'possession' || e.type === 'deflection' ? e.idx : e.byIdx].team
        if (who === cx.team) acc[cx.team === usA ? 0 : 1].cr[1]++
        cx.first = false
      }
      if (cx && e.type === 'shot' && st.players[e.byIdx].team === cx.team) {
        const A = acc[cx.team === usA ? 0 : 1]
        A.cr[2]++
        A.cr[3] += e.xg
        cx = null
      }
      if ((e.type === 'possession' || e.type === 'out') && pp) {
        const r = (acc[pp.team === usA ? 0 : 1].pas[pp.key] ??= [0, 0])
        r[0]++
        if (e.type === 'possession' && st.players[e.idx].team === pp.team) r[1]++
        pp = null
      }
      if ((e.type === 'possession' || e.type === 'out') && pend) {
        const r = (acc[pend.team === usA ? 0 : 1].clr[pend.key] ??= [0, 0, 0])
        r[0]++
        if (e.type === 'possession' && st.players[e.idx].team === pend.team) r[1]++
        if (e.type === 'out') r[2]++
        if (e.type === 'out') (acc[pend.team === usA ? 0 : 1].clr[`${pend.key} out ${e.award} ${e.team === pend.team ? 'ours' : 'theirs'}`] ??= [0, 0, 0])[0]++
        if (e.type === 'possession' && st.players[e.idx].team !== pend.team) {
          const role = st.players[e.idx].slot.role
          if (KN_ROLES) (acc[pend.team === usA ? 0 : 1].clr[pend.key + ' won by ' + role] ??= [0, 0, 0])[0]++
        }
        pend = null
      }
      if (e.type === 'possession') {
        const team = st.players[e.idx].team
        const x = af(st, team, e.contact).x
        if (team !== holder) {
          if (holder !== null && e.via !== 'restart') {
            const A = acc[holder === usA ? 0 : 1]
            A.ends[start][last] = (A.ends[start][last] ?? 0) + 1
            A.lostAt[start][third(x)]++
            if (third(x) === 2) acc[team === usA ? 0 : 1].regainHigh++
          }
          holder = team
          start = third(x)
          maxX = x
          last = e.via === 'restart' ? 'restart' : 'none'
          const A = acc[team === usA ? 0 : 1]
          A.spells[start]++
          A.reached[start][third(x)]++
        }
      }
      if (holder === null) continue
      const byTeam = (i: number): boolean => st.players[i].team === holder
      if (e.type === 'pass' && byTeam(e.byIdx) && st.phase.kind === 'play') {
        const by = st.players[e.byIdx]
        const near = Math.min(...st.players.filter((q) => q.team !== by.team && q.onPitch).map((q) => Math.hypot(q.pos.x - by.pos.x, q.pos.y - by.pos.y)))
        const fx = af(st, holder, e.from).x
        if (fx < 50) pp = { team: holder, key: `${fx < 30 ? 'deep' : 'half'} ${near < 3 ? 'pressed' : 'free'} ${e.lofted ? 'lofted' : 'ground'}` }
      }
      if (e.type === 'pass' && byTeam(e.byIdx)) {
        last = e.through ? 'through' : e.lofted ? 'lofted' : 'ground'
        const ta = af(st, holder, e.target)
        if (e.lofted && ta.x > 88.5 && Math.abs(ta.y - 34) < 20 && Math.abs(af(st, holder, e.from).y - 34) > 12) {
          cx = { team: holder, tick: st.tick, first: true }
          acc[holder === usA ? 0 : 1].cr[0]++
        }
        prevPass = e.through ? 'through' : e.lofted && ta.x > 87 && Math.abs(ta.y - 34) < 14 ? 'cross' : e.lofted ? 'lofted' : ta.x > 85 && af(st, holder, e.from).x > ta.x ? 'cutback' : 'ground'
      }
      if (e.type === 'possession' && st.players[e.idx].team === holder && e.via !== 'control') prevPass = 'won/loose'
      if (e.type === 'clearance' && byTeam(e.byIdx)) {
        last = e.header ? 'header' : 'clearance'
        if (!e.header) acc[holder === usA ? 0 : 1].clear[third(af(st, holder, e.from).x)]++
        if (!e.header && af(st, holder, e.from).x < 35) {
          // Where it was aimed against their back line (holder's frame): short of it, or behind it.
          const theirLine = st.players.filter((p) => p.team !== holder && p.onPitch && p.slot.role !== 'GK').reduce((m, p) => Math.max(m, af(st, holder!, p.pos).x), 0)
          const rel = af(st, holder, e.target).x - theirLine
          pend = { team: holder, key: rel < -10 ? 'a short' : rel < 0 ? 'b at line' : rel < 10 ? 'c behind' : 'd well behind' }
        }
      }
      if (e.type === 'shot' && byTeam(e.byIdx)) {
        last = 'shot'
        if (!e.penalty) acc[holder === usA ? 0 : 1].xg += e.xg
        if (!e.penalty) acc[holder === usA ? 0 : 1].xgFrom[start] += e.xg
        if (!e.penalty) {
          const fx = af(st, holder, e.from)
          const zone = fx.x > 88.5 && Math.abs(fx.y - 34) < 20 ? 'box' : 'out'
          const r = (acc[holder === usA ? 0 : 1].src[`${zone} ${prevPass}`] ??= [0, 0])
          r[0]++
          r[1] += e.xg
        }
      }
      if (e.type === 'tackle' && byTeam(e.onIdx) && e.won) last = 'tackled'
    }
    if (st.phase.kind !== 'play' || st.tick % 10 || holder === null) return
    const own = st.ball.ownerIdx === null ? null : st.players[st.ball.ownerIdx]
    if (!own) return
    const x = af(st, own.team, st.ball.pos).x
    const A = acc[own.team === usA ? 0 : 1]
    A.poss++
    if (own.team === holder && x > maxX) {
      const t0 = third(maxX)
      maxX = x
      if (third(x) > t0) A.reached[start][third(x)]++
    }
    const def = (1 - own.team) as Side
    const D = acc[def === usA ? 0 : 1]
    const line = 105 - defensiveLine(st, own.team)
    const unp = st.players.filter((p) => p.team === def && p.onPitch).every((p) => Math.hypot(p.pos.x - own.pos.x, p.pos.y - own.pos.y) > 4)
    D.line += line
    D.lineN++
    const bd = 105 - x
    if (bd > 20 && bd < 35 && Math.abs(af(st, own.team, st.ball.pos).y - 34) < 15) {
      D.edge[0] += line
      D.edge[1]++
      // Their men in front of our line but in our box (x in our frame between 0 and the line, inside the box width).
      for (const q of st.players) if (q.team === own.team && q.onPitch) {
        const qx = 105 - af(st, own.team, q.pos).x
        if (qx < 16.5 && Math.abs(q.pos.y - 34) < 20) D.edge[2]++
        if (qx < line + 0.01) D.edge[3]++
      }
    }
    if (unp) {
      D.lineUnp += line
      D.lineUnpN++
    }
  })
  for (const p of st.players) if (p.onPitch && p.slot.role !== 'GK') acc[p.team === usA ? 0 : 1].energy += p.energy / 10 / n
}
const T = ['own', 'mid', 'att']
for (const [i, A] of acc.entries()) {
  console.log(
    `\n${i ? bb : ba} (against ${i ? ba : bb}): xG ${(A.xg / n).toFixed(2)}, possession ${((A.poss / (acc[0].poss + acc[1].poss)) * 100).toFixed(0)}%, regains in final third ${(A.regainHigh / n).toFixed(1)}, clearances by third ${A.clear.map((c) => (c / n).toFixed(1)).join(' ')}, energy at the end ${A.energy.toFixed(2)}`,
  )
  console.log('  own-third clearances aimed vs their last outfielder (n a match, kept by us %, out %): ' + Object.entries(A.clr).sort().map(([k, r]) => `${k.slice(2)} ${(r[0] / n).toFixed(1)} (${((r[1] / r[0]) * 100).toFixed(0)}%, ${((r[2] / r[0]) * 100).toFixed(0)}%)`).join(', '))
  console.log('  shots (n, xG a match) by zone and the pass before: ' + Object.entries(A.src).sort().map(([k, r]) => `${k} ${(r[0] / n).toFixed(1)}/${(r[1] / n).toFixed(2)}`).join(', '))
  console.log('  passes from our half (n a match, kept %): ' + Object.entries(A.pas).sort().map(([k, r]) => `${k} ${(r[0] / n).toFixed(1)} (${((r[1] / r[0]) * 100).toFixed(0)}%)`).join(', '))
  console.log(`  crosses ${(A.cr[0] / n).toFixed(1)}, first touch ours ${((A.cr[1] / A.cr[0]) * 100).toFixed(0)}%, a shot within 4 s ${((A.cr[2] / A.cr[0]) * 100).toFixed(0)}% (xG ${(A.cr[3] / n).toFixed(2)})`)
  console.log(`  ball 20-35 m from our goal, central: our line ${(A.edge[0] / A.edge[1]).toFixed(1)} m, their men in our box ${(A.edge[2] / A.edge[1]).toFixed(2)}, beyond our line ${(A.edge[3] / A.edge[1]).toFixed(2)}`)
  console.log(`  back line out of possession ${(A.line / A.lineN).toFixed(1)} m (ball unpressured ${(A.lineUnp / A.lineUnpN).toFixed(1)})`)
  for (let t = 0; t < 3; t++) {
    const sp = A.spells[t]
    const ends = Object.entries(A.ends[t])
      .sort((x, y) => y[1] - x[1])
      .map(([k, v]) => `${k} ${(v / n).toFixed(1)}`)
      .join(', ')
    console.log(
      `  from ${T[t]}: ${(sp / n).toFixed(1)} a match, xG ${(A.xgFrom[t] / n).toFixed(2)}, reached mid ${((A.reached[t][1] / sp) * 100 || 0).toFixed(0)}% att ${((A.reached[t][2] / sp) * 100 || 0).toFixed(0)}%; won back in winner's own/mid/att ${A.lostAt[t].map((c) => (c / n).toFixed(1)).join(' ')}; last kick: ${ends}`,
    )
  }
}
