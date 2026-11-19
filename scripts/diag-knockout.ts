/**
 * Knockout ties: how many go to extra time and penalties, how penalties go, and what the harness
 * finds. `node scripts/diag-knockout.ts [n] [first seed]`
 */
import { randomTeam } from '../src/engine/index.ts'
import { checkMatch } from '../src/engine/harness.ts'

const n = Number(process.argv[2] ?? 40)
const first = Number(process.argv[3] ?? 1)
let et = 0, pens = 0, kicks = 0, scored = 0, rounds = 0, forced = 0, inPlayPens = 0, inPlayScored = 0
const violations: Record<string, number> = {}
for (let seed = first; seed < first + n; seed++) {
  const { state, violations: v, forcedRestarts } = checkMatch(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), { seed, knockout: {} })
  forced += forcedRestarts
  for (const x of v) {
    violations[x.rule] = (violations[x.rule] ?? 0) + 1
    if ((violations[x.rule] ?? 0) <= 2) console.log(`seed ${seed} tick ${x.tick} ${x.rule}: ${x.detail}`)
  }
  if (state.events.some((e) => e.type === 'extraTime')) et++
  // Penalties in open play (before any shootout): how many go in.
  const upTo = state.events.findIndex((e) => e.type === 'shootout')
  const played = upTo < 0 ? state.events : state.events.slice(0, upTo)
  played.forEach((e, i) => {
    if (e.type !== 'shot' || !e.penalty) return
    inPlayPens++
    const next = played.slice(i + 1).find((f) => f.type === 'goal' || f.type === 'restart')
    if (next?.type === 'goal') inPlayScored++
  })
  const so = state.shootout
  if (so) {
    pens++
    kicks += so.kicks.length
    scored += so.kicks.filter((k) => k.scored).length
    rounds += Math.ceil(so.kicks.length / 2)
  }
}
console.log(`${n} ties: ${et} to extra time, ${pens} to penalties; ${kicks} kicks, ${((100 * scored) / Math.max(1, kicks)).toFixed(0)}% scored, ${(rounds / Math.max(1, pens)).toFixed(1)} rounds a shootout`)
console.log(`penalties in play: ${inPlayPens}, ${((100 * inPlayScored) / Math.max(1, inPlayPens)).toFixed(0)}% scored`)
console.log(`violations ${JSON.stringify(violations)}, forced restarts ${forced}`)
