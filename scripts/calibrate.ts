/**
 * Aggregate stats over many seeded matches, next to real-football reference ranges.
 *   npm run calibrate -- [matches=20]
 * Judge engine tuning on these numbers, never on a single match.
 */
import { BOX_DEPTH, BOX_HALF_WIDTH, CENTER, randomTeam } from '../src/engine/index.ts'
import { checkMatch } from '../src/engine/harness.ts'

const n = Number(process.argv[2] ?? 20)

// Per team per match unless noted. Ballpark figures for top-flight football.
const TARGETS: Record<string, [number, number]> = {
  goals: [1.1, 1.8],
  shots: [9, 16],
  'on target %': [30, 42],
  xG: [1.0, 1.8],
  passes: [350, 600],
  'pass %': [75, 88],
  'lofted pass %': [8, 20],
  fouls: [9, 14],
  'yellow cards': [1.2, 2.5],
  'red cards': [0, 0.15],
  corners: [4, 6.5],
  crosses: [8, 14],
  offsides: [1, 3],
  'throw-ins': [15, 25],
  'goal kicks': [5, 10],
  'headed shots %': [10, 25],
  'penalties (match)': [0.1, 0.4],
  'woodwork (match)': [0.2, 0.8],
  'biggest margin': [0, 5],
  'longest dull spell (min)': [15, 35],
}

const got: Record<string, number> = {}
const add = (k: string, v: number): void => {
  got[k] = (got[k] ?? 0) + v
}
const rules: Record<string, number> = {}
let forced = 0
let biggest = 0
const scores: string[] = []

for (let seed = 1; seed <= n; seed++) {
  const { state, violations, forcedRestarts } = checkMatch(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), { seed })
  forced += forcedRestarts
  for (const v of violations) rules[v.rule] = (rules[v.rule] ?? 0) + 1
  scores.push(state.score.join('-'))
  biggest = Math.max(biggest, Math.abs(state.score[0] - state.score[1]))
  add('goals', state.score[0] + state.score[1])
  for (const t of state.stats) {
    add('shots', t.shots)
    add('on target', t.shotsOnTarget)
    add('xG', t.xg)
    add('passes', t.passes)
    add('completed', t.passesCompleted)
    add('fouls', t.fouls)
    add('yellow cards', t.yellowCards)
    add('red cards', t.redCards)
    add('corners', t.corners)
    add('offsides', t.offsides)
  }
  // Key moments as the viewer's Key moments mode sees them; the longest gap between them (or the
  // ends of the match) is how long a viewer waits with nothing happening.
  const moments = state.events
    .filter((e) => e.type === 'goal' || (e.type === 'shot' && e.onTarget) || e.type === 'woodwork')
    .map((e) => e.tick)
  const marks = [0, ...moments, state.tick]
  add('longest dull spell (min)', Math.max(...marks.slice(1).map((t, i) => t - marks[i])) / 600)
  let half = 1
  for (const e of state.events) {
    if (e.type === 'halfTime') half = 2
    if (e.type === 'pass' && e.lofted) {
      // A cross: in the air into the opponents' box from wide.
      const attacksHigh = (state.players[e.byIdx].team === 0) === (half === 1)
      const depth = attacksHigh ? 105 - e.target.x : e.target.x
      if (depth < BOX_DEPTH && Math.abs(e.target.y - CENTER.y) < BOX_HALF_WIDTH && Math.abs(e.from.y - CENTER.y) > 12) add('crosses', 1)
    }
    if (e.type === 'out' && e.award === 'throwIn') add('throw-ins', 1)
    if (e.type === 'out' && e.award === 'goalKick') add('goal kicks', 1)
    if (e.type === 'pass' && e.lofted) add('lofted', 1)
    if (e.type === 'shot' && e.header) add('headed shots', 1)
    if (e.type === 'shot' && e.penalty) add('penalties (match)', 1)
    if (e.type === 'woodwork') add('woodwork (match)', 1)
  }
}

const perTeam = (k: string): number => (got[k] ?? 0) / n / 2
const perMatch = (k: string): number => (got[k] ?? 0) / n
const results: Record<string, number> = {
  goals: perTeam('goals'),
  shots: perTeam('shots'),
  'on target %': (100 * perTeam('on target')) / perTeam('shots'),
  xG: perTeam('xG'),
  passes: perTeam('passes'),
  'pass %': (100 * perTeam('completed')) / perTeam('passes'),
  'lofted pass %': (100 * perTeam('lofted')) / perTeam('passes'),
  fouls: perTeam('fouls'),
  'yellow cards': perTeam('yellow cards'),
  'red cards': perTeam('red cards'),
  corners: perTeam('corners'),
  crosses: perTeam('crosses'),
  offsides: perTeam('offsides'),
  'throw-ins': perTeam('throw-ins'),
  'goal kicks': perTeam('goal kicks'),
  'headed shots %': (100 * perTeam('headed shots')) / perTeam('shots'),
  'penalties (match)': perMatch('penalties (match)'),
  'woodwork (match)': perMatch('woodwork (match)'),
  'biggest margin': biggest,
  'longest dull spell (min)': perMatch('longest dull spell (min)'),
}

console.log(`${n} matches: ${scores.join(' ')}\n`)
console.log(`${'per team per match'.padEnd(20)}${'engine'.padStart(8)}   target`)
for (const [k, [lo, hi]] of Object.entries(TARGETS)) {
  const v = results[k]
  const flag = v < lo ? '  low' : v > hi ? '  HIGH' : ''
  console.log(`${k.padEnd(20)}${v.toFixed(1).padStart(8)}   ${lo}–${hi}${flag}`)
}
console.log(`\ninvariant violations: ${JSON.stringify(rules)}, forced restarts: ${forced}`)
process.exitCode = Object.keys(rules).length || forced ? 1 : 0
