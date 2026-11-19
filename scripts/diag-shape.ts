/**
 * How a shape stands, as a viewer would see it: each slot's average place (attacking frame, x m
 * from own goal, y across) in and out of possession by where the ball is, and what it gives away.
 *   node scripts/diag-shape.ts <shape> [opponent shape=4-4-2] [matches=20] [first seed=1] [block] [their block]
 * Equal-strength random squads as in diag-formations. Also prints shots against by zone and role.
 */
import { FORMATIONS, randomTeam, runMatch } from '../src/engine/index.ts'
import { PITCH_LENGTH } from '../src/engine/geometry.ts'
import { af } from '../src/engine/ai.ts'
import type { Block, Formation, Side } from '../src/engine/types.ts'

const shape = process.argv[2] as Formation
const opp = (process.argv[3] ?? '4-4-2') as Formation
const n = Number(process.argv[4] ?? 20)
const first = Number(process.argv[5] ?? 1)
const blockArg = process.argv[6] as Block | undefined
const oppBlockArg = (process.argv[7] ?? process.argv[6]) as Block | undefined
const BLOCKS: Block[] = ['low', 'mid', 'high']
const THIRDS = ['own', 'mid', 'att']
const slots = FORMATIONS[shape]
// [poss 0/1][third][slot] -> sum x, sum y, count
const acc = [0, 1].map(() => THIRDS.map(() => slots.map(() => [0, 0, 0])))
const against = { box: 0, out: 0, xgBox: 0, xgOut: 0, byRole: {} as Record<string, number>, n: 0 }
const forShots = { box: 0, out: 0, xgBox: 0, xgOut: 0, byRole: {} as Record<string, number> }
let entries = [0, 0]
let possTicks = [0, 0]
let gapSum = 0
let gapN = 0
// Ball won back from the other side, by where (in the winner's frame: own, middle, final third), us then them.
const regains = [[0, 0, 0], [0, 0, 0]]
const energy = [0, 0]
// xG by where the shooting side's possession began (own, middle, final third, from a restart), us then them.
const xgFrom = [[0, 0, 0, 0], [0, 0, 0, 0]]
for (let seed = first; seed < first + n; seed++) {
  const block = blockArg ?? BLOCKS[seed % 3]
  const a = randomTeam(seed * 2 + 1, block, shape)
  const b = randomTeam(seed * 2 + 1, oppBlockArg ?? block, opp)
  const us: Side = seed % 2 === 1 ? 1 : 0
  const home = us === 0 ? a : b
  const away = us === 0 ? b : a
  let lastThird = [1, 1]
  let holder: Side | null = null
  let began = 3
  const s = runMatch(home, away, { seed }, (st, events) => {
    for (const e of events) {
      if (e.type === 'possession' && e.via !== 'restart') {
        const team = st.players[e.idx].team
        if (holder !== null && team !== holder) {
          began = Math.min(2, Math.floor(af(st, team, e.contact).x / 35))
          regains[team === us ? 0 : 1][began]++
        }
        holder = team
      }
      if (e.type === 'possession' && e.via === 'restart') {
        if (st.players[e.idx].team !== holder) began = 3
        holder = st.players[e.idx].team
      }
      if (e.type === 'shot' && !e.penalty) xgFrom[st.players[e.byIdx].team === us ? 0 : 1][began] += e.xg
      if (e.type !== 'shot' || e.penalty) continue
      const shooter = st.players[e.byIdx]
      const t = shooter.team === us ? forShots : against
      const fx = af(st, shooter.team, e.from).x
      const inBox = fx > PITCH_LENGTH - 16.5
      if (inBox) {
        t.box++
        t.xgBox += e.xg
      } else {
        t.out++
        t.xgOut += e.xg
      }
      t.byRole[shooter.slot.role] = (t.byRole[shooter.slot.role] ?? 0) + 1
    }
    if (st.phase.kind !== 'play' || st.tick % 10) return
    const owner = st.ball.ownerIdx ?? st.ball.lastTouchIdx
    if (owner === null) return
    const poss = st.players[owner].team === us ? 1 : 0
    possTicks[poss]++
    const bx = af(st, us, st.ball.pos).x
    const third = bx < 35 ? 0 : bx < 70 ? 1 : 2
    // Final-third entries by either side (in its own frame).
    const ox = af(st, st.players[owner].team, st.ball.pos).x
    const ot = ox < 35 ? 0 : ox < 70 ? 1 : 2
    const ti = st.players[owner].team === us ? 0 : 1
    if (ot === 2 && lastThird[ti] !== 2) entries[ti]++
    lastThird[ti] = ot
    const mine = st.players.filter((p) => p.team === us && p.onPitch)
    for (const p of mine) {
      const i = slots.indexOf(p.slot)
      if (i < 0 || i >= slots.length) continue
      const v = af(st, us, p.pos)
      const c = acc[poss][third][i]
      c[0] += v.x
      c[1] += v.y
      c[2]++
    }
    if (!poss) {
      // Back line to the next line, out of possession: room between the lines.
      const xs = mine.filter((p) => p.slot.role !== 'GK').map((p) => af(st, us, p.pos).x).sort((x, y) => x - y)
      gapSum += xs[Math.min(5, xs.length - 1)] - xs[0]
      gapN++
    }
  })
  for (const p of s.players) if (p.onPitch && p.slot.role !== 'GK') energy[p.team === us ? 0 : 1] += p.energy / 10 / n
}
for (const poss of [1, 0])
  for (let t = 0; t < 3; t++) {
    console.log(`${shape} ${poss ? 'with' : 'without'} the ball, ball in our ${THIRDS[t]} third:`)
    console.log(
      '  ' +
        slots
          .map((sl, i) => {
            const c = acc[poss][t][i]
            return c[2] ? `${sl.role}${Math.round(sl.y)} ${(c[0] / c[2]).toFixed(0)},${(c[1] / c[2]).toFixed(0)}` : `${sl.role} -`
          })
          .join(' | '),
    )
  }
const pg = (x: number): string => (x / n).toFixed(2)
console.log(`\nShots for: box ${pg(forShots.box)} (xG ${pg(forShots.xgBox)}), outside ${pg(forShots.out)} (xG ${pg(forShots.xgOut)}) by ${JSON.stringify(forShots.byRole)}`)
console.log(`Shots against: box ${pg(against.box)} (xG ${pg(against.xgBox)}), outside ${pg(against.out)} (xG ${pg(against.xgOut)}) by ${JSON.stringify(against.byRole)}`)
console.log(`Regains a match (own, middle, final third): us ${regains[0].map(pg).join(' ')}, them ${regains[1].map(pg).join(' ')}; energy at the end (outfield) us ${energy[0].toFixed(2)}, them ${energy[1].toFixed(2)}`)
console.log(`xG by where the move began (own, middle, final third, restart): us ${xgFrom[0].map(pg).join(' ')}, them ${xgFrom[1].map(pg).join(' ')}`)
console.log(`Final-third entries a match: us ${pg(entries[0])}, them ${pg(entries[1])}; possession ${((possTicks[1] / (possTicks[0] + possTicks[1])) * 100).toFixed(0)}%; out of possession, back line to 6th man ${(gapSum / gapN).toFixed(1)} m`)
