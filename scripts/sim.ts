/**
 * Headless match runner.
 *   npm run sim -- [seed] [--events]
 */
import { randomTeam } from '../src/engine/index.ts'
import { checkMatch } from '../src/engine/harness.ts'

const args = process.argv.slice(2)
const seed = Number(args.find((a) => !a.startsWith('--')) ?? 1)
const showEvents = args.includes('--events')

const home = randomTeam(seed * 2 + 1)
const away = randomTeam(seed * 2 + 2)
const started = performance.now()
const { state, violations } = checkMatch(home, away, { seed })
const ms = performance.now() - started

const name = (idx: number): string => {
  const p = state.players[idx]
  return `${p.def.name} (${state.teams[p.team].shortName})`
}

if (showEvents) {
  for (const e of state.events) {
    switch (e.type) {
      case 'goal':
        console.log(`${e.clock.padStart(6)}  GOAL ${name(e.scorerIdx)}${e.ownGoal ? ' (og)' : ''}${e.assistIdx !== null ? `, assist ${name(e.assistIdx)}` : ''}  ${state.score}`)
        break
      case 'shot':
        console.log(`${e.clock.padStart(6)}  shot ${name(e.byIdx)} xG ${e.xg.toFixed(2)}${e.onTarget ? ' on target' : ''}${e.penalty ? ' (pen)' : ''}`)
        break
      case 'foul':
      case 'card':
      case 'offside':
      case 'woodwork':
      case 'halfTime':
      case 'fullTime':
        console.log(`${e.clock.padStart(6)}  ${e.type}${'award' in e ? ` -> ${e.award}` : ''}${'color' in e ? ` ${e.color} ${name(e.idx)}` : ''}`)
        break
    }
  }
}

const [h, a] = state.stats
const total = h.possessionTicks + a.possessionTicks || 1
const row = (label: string, x: string | number, y: string | number): string => `${label.padEnd(16)}${String(x).padStart(8)}${String(y).padStart(8)}`
console.log(`\n${state.teams[0].name} ${state.score[0]} - ${state.score[1]} ${state.teams[1].name}   (seed ${seed}, ${state.tick} ticks, ${ms.toFixed(0)} ms)`)
console.log(row('', state.teams[0].shortName, state.teams[1].shortName))
console.log(row('possession %', Math.round((100 * h.possessionTicks) / total), Math.round((100 * a.possessionTicks) / total)))
console.log(row('shots', h.shots, a.shots))
console.log(row('on target', h.shotsOnTarget, a.shotsOnTarget))
console.log(row('xG', h.xg.toFixed(2), a.xg.toFixed(2)))
console.log(row('passes', h.passes, a.passes))
console.log(row('pass %', Math.round((100 * h.passesCompleted) / (h.passes || 1)), Math.round((100 * a.passesCompleted) / (a.passes || 1))))
console.log(row('fouls', h.fouls, a.fouls))
console.log(row('corners', h.corners, a.corners))
console.log(row('offsides', h.offsides, a.offsides))
console.log(row('cards (Y/R)', `${h.yellowCards}/${h.redCards}`, `${a.yellowCards}/${a.redCards}`))
console.log(`\ninvariant violations: ${violations.length}`)
for (const v of violations.slice(0, 20)) console.log(`  tick ${v.tick}: [${v.rule}] ${v.detail}`)
process.exitCode = violations.length ? 1 : 0
