/**
 * Aggregate stats over many seeded matches, next to real-football reference ranges.
 *   npm run calibrate -- [matches=20] [first seed=1]
 * Judge engine tuning on these numbers, never on a single match.
 */
import { BOX_DEPTH, BOX_HALF_WIDTH, CENTER, randomTeam } from '../src/engine/index.ts'
import { checkMatch } from '../src/engine/harness.ts'

const n = Number(process.argv[2] ?? 20)
/** Optional first seed, to check a result holds on matches it wasn't tuned on. */
const first = Number(process.argv[3] ?? 1)

// Per team per match unless noted. Ballpark figures for top-flight football.
const TARGETS: Record<string, [number, number]> = {
  goals: [1.1, 1.8],
  shots: [9, 16],
  'on target %': [30, 42],
  xG: [1.0, 1.8],
  passes: [350, 600],
  'pass %': [75, 88],
  'lofted pass %': [8, 20],
  'avg pass length (m)': [15, 21],
  'long balls % (32m+)': [7, 15],
  // Passes of 12m+ from in front of the defensive line to 4m+ behind it. Unverified: data
  // providers count "through balls" differently, so it's shown but not scored.
  'through balls': [1, 5],
  'through ball success %': [25, 60],
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
  // Opta: 2.5-8.7% of Premier League matches in recent seasons.
  'won by 4+ % (match)': [1, 10],
  'longest dull spell (min)': [15, 35],
  'save %': [62, 78],
  'ball in play (min, match)': [52, 62],
  'goals per xG': [0.85, 1.15],
  'shots outside box %': [30, 48],
  'tackles won': [12, 22],
  'tackles own third %': [30, 52],
  'tackles final third %': [8, 22],
  'draws % (match)': [15, 35],
}

/** Shown for reference, not counted in the realism score: no reliable real figure to hold them to. */
const UNSCORED = new Set(['through balls'])

const got: Record<string, number> = {}
const add = (k: string, v: number): void => {
  got[k] = (got[k] ?? 0) + v
}
const rules: Record<string, number> = {}
let forced = 0
let biggest = 0
const scores: string[] = []

for (let seed = first; seed < first + n; seed++) {
  const { state, violations, forcedRestarts } = checkMatch(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), { seed })
  forced += forcedRestarts
  for (const v of violations) rules[v.rule] = (rules[v.rule] ?? 0) + 1
  scores.push(state.score.join('-'))
  if (state.score[0] === state.score[1]) add('draws', 1)
  if (Math.abs(state.score[0] - state.score[1]) >= 4) add('won by 4+', 1)
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
  // In clock minutes ("45+2'" counts as 47): the clock also runs through stoppages.
  const minute = (clock: string): number => clock.replace("'", '').split('+').reduce((a, b) => a + Number(b), 0)
  const moments = state.events
    .filter((e) => e.type === 'goal' || (e.type === 'shot' && e.onTarget) || e.type === 'woodwork')
    .map((e) => minute(e.clock))
  const end = state.events[state.events.length - 1]
  const marks = [0, ...moments, minute(end.clock)]
  add('longest dull spell (min)', Math.max(...marks.slice(1).map((t, i) => t - marks[i])))
  // From each restart to the next stoppage, in clock time (ticks are clock time while in play).
  let playFrom: number | null = null
  for (const e of state.events) {
    if (e.type === 'restart') playFrom = e.tick
    else if (playFrom !== null && ['out', 'foul', 'goal', 'offside', 'halfTime', 'fullTime'].includes(e.type)) {
      add('ball in play (min, match)', ((e.tick - playFrom) / 600) * 2)
      playFrom = null
    }
  }
  let half = 1
  let through: number | null = null // team of a through ball still waiting for its first touch
  for (const e of state.events) {
    if (e.type === 'pass' && e.through) {
      add('through balls', 1)
      through = state.players[e.byIdx].team
    } else if (through !== null && (e.type === 'possession' || e.type === 'deflection' || e.type === 'out' || e.type === 'offside')) {
      if (e.type === 'possession' && state.players[e.idx].team === through) add('through completed', 1)
      through = null
    }
    if (e.type === 'halfTime') half = 2
    const attacksHigh = (team: number): boolean => (team === 0) === (half === 1)
    if (e.type === 'pass') {
      const len = Math.hypot(e.target.x - e.from.x, e.target.y - e.from.y)
      add('pass length', len)
      if (len >= 32) add('long balls', 1)
    }
    if (e.type === 'shot' && !e.penalty) {
      const t = state.players[e.byIdx].team
      const depth = attacksHigh(t) ? 105 - e.from.x : e.from.x
      add('open shots', 1)
      if (depth > BOX_DEPTH || Math.abs(e.from.y - CENTER.y) > BOX_HALF_WIDTH) add('shots outside box', 1)
    }
    if (e.type === 'tackle' || (e.type === 'foul' && e.award !== null)) {
      const t = state.players[e.byIdx].team
      const own = attacksHigh(t) ? e.pos.x : 105 - e.pos.x
      add('tackles', 1)
      if (e.type === 'tackle' && e.won) add('tackles won', 1)
      if (own < 35) add('tackles own third', 1)
      if (own > 70) add('tackles final third', 1)
    }
    if (e.type === 'goal' && !e.ownGoal) add('goals from shots', 1)
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
  'through balls': perTeam('through balls'),
  'through ball success %': (100 * perTeam('through completed')) / perTeam('through balls'),
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
  'won by 4+ % (match)': (100 * perMatch('won by 4+')),
  'longest dull spell (min)': perMatch('longest dull spell (min)'),
  'avg pass length (m)': perTeam('pass length') / perTeam('passes'),
  'long balls % (32m+)': (100 * perTeam('long balls')) / perTeam('passes'),
  'ball in play (min, match)': perTeam('ball in play (min, match)'),
  'save %': 100 * (1 - perTeam('goals from shots') / perTeam('on target')),
  'goals per xG': perTeam('goals') / perTeam('xG'),
  'shots outside box %': (100 * perTeam('shots outside box')) / perTeam('open shots'),
  'tackles won': perTeam('tackles won'),
  'tackles own third %': (100 * perTeam('tackles own third')) / perTeam('tackles'),
  'tackles final third %': (100 * perTeam('tackles final third')) / perTeam('tackles'),
  'draws % (match)': (100 * perMatch('draws')),
}

console.log(`${n} matches: ${scores.join(" ")}\nbiggest margin: ${biggest}\n`)
console.log(`${'per team per match'.padEnd(20)}${'engine'.padStart(8)}   target`)
for (const [k, [lo, hi]] of Object.entries(TARGETS)) {
  const v = results[k]
  const flag = UNSCORED.has(k) ? '  (unscored)' : v < lo ? '  low' : v > hi ? '  HIGH' : ''
  console.log(`${k.padEnd(20)}${v.toFixed(1).padStart(8)}   ${lo}–${hi}${flag}`)
}
const scored = Object.entries(TARGETS).filter(([k]) => !UNSCORED.has(k))
const inRange = scored.filter(([k, [lo, hi]]) => results[k] >= lo && results[k] <= hi).length
console.log(`\nrealism: ${inRange}/${scored.length} metrics in real-football ranges (${Math.round((100 * inRange) / scored.length)}%)`)
console.log(`\ninvariant violations: ${JSON.stringify(rules)}, forced restarts: ${forced}`)
process.exitCode = Object.keys(rules).length || forced ? 1 : 0
