/**
 * Turns the engine's event stream into commentary lines. Pure and deterministic: the same events
 * always read the same way, and a line never changes once written (each reads only the events
 * before it). Routine passes and tackles are left out; the line is for moments.
 *
 * Variety: every kind of line has several phrasings, picked from the moment (tick, player) and
 * never the same one twice running (`Phrases`); some depend on what happened (a header, a curler,
 * a save low down, a strong man's tackle) or on who did it (a scorer's flair and temper choose his
 * celebration's words, his feet which foot he used).
 */
import { CENTER, type MatchEvent, type MatchState, type Side, dist, oppGoalX } from '../engine/index.ts'
import { shortName as surname } from '../names.ts'

export { surname }

export type LineKind = 'goal' | 'chance' | 'card' | 'info' | 'period'

export interface Line {
  tick: number
  clock: string
  text: string
  kind: LineKind
  team: Side | null
}

const YARDS_PER_METRE = 1.0936
const CROSSBAR = 2.44

/**
 * Names for one match: each player's short name, or "J. Keane" where two men on the pitch would
 * share it (career leagues keep surnames apart within a squad, not between two).
 */
export function matchNames(match: MatchState): string[] {
  const short = match.players.map((p) => surname(p.def.name))
  const count = new Map<string, number>()
  for (const s of short) count.set(s, (count.get(s) ?? 0) + 1)
  const initialled = match.players.map((p, i) => (count.get(short[i])! > 1 ? `${p.def.name.trim()[0]}. ${short[i]}` : short[i]))
  // Still the same (same initial too): the full name; then his side, then his shirt.
  const apart = (list: string[], by: (s: string, i: number) => string): string[] => {
    const n = new Map<string, number>()
    for (const s of list) n.set(s, (n.get(s) ?? 0) + 1)
    return list.map((s, i) => (n.get(s)! > 1 ? by(s, i) : s))
  }
  const full = apart(initialled, (_, i) => match.players[i].def.name)
  const sided = apart(full, (s, i) => `${s} (${match.teams[match.players[i].team].shortName})`)
  return apart(sided, (s, i) => `${s} ${match.players[i].def.shirt}`)
}

/** A small integer hash, so a phrasing depends on the moment rather than on a tick's parity. */
const mix = (a: number, b: number): number => {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35)
  h ^= h >>> 15
  h = Math.imul(h, 0x27d4eb2f)
  return (h ^ (h >>> 13)) >>> 0
}

/** Chooses phrasings: by the moment, but never the one the same kind of line used last time. */
class Phrases {
  private last = new Map<string, number>()
  pick(key: string, seed: number, options: string[]): string {
    let i = seed % options.length
    if (options.length > 1 && this.last.get(key) === i) i = (i + 1) % options.length
    this.last.set(key, i)
    return options[i]
  }
}

interface ShotInfo {
  tick: number
  byIdx: number
  header: boolean
  finesse: boolean
  penalty: boolean
  yards: number
}

export function buildCommentary(match: MatchState, events: MatchEvent[]): Line[] {
  const lines: Line[] = []
  const names = matchNames(match)
  const name = (idx: number): string => names[idx]
  const teamOf = (idx: number): Side => match.players[idx].team
  const teamName = (t: Side): string => match.teams[t].name
  const traits = (idx: number) => match.players[idx].def.traits
  const strength = (idx: number): number => (match.players[idx].attrs as { strength?: number }).strength ?? 10
  const phrases = new Phrases()
  const say = (key: string, e: MatchEvent, idx: number, options: string[]): string => phrases.pick(key, mix(e.tick, idx), options)
  const score: [number, number] = [0, 0]
  let half: 1 | 2 = 1
  let period = 1
  const pens: [number, number] = [0, 0]
  // In the shootout only the kicks get a line; `keeperTouched`: the keeper got to the one being taken.
  let shootout = false
  let keeperTouched = false
  let lastShot: ShotInfo | null = null
  let afterGoal = false
  const goalsBy = new Map<number, number>()
  const booked = new Set<number>()
  // Each player's last pass, for how a goal was set up.
  const lastPassBy = new Map<number, { tick: number; lofted: boolean; through: boolean; wide: boolean }>()

  const add = (e: MatchEvent, text: string, kind: LineKind, team: Side | null): void => {
    lines.push({ tick: e.tick, clock: e.clock, text, kind, team })
  }
  const shotLive = (e: MatchEvent): boolean => lastShot !== null && e.tick - lastShot.tick <= 20
  /** x in `team`'s attacking frame: 0 at its own goal line, 105 at the one it attacks. */
  const attackX = (team: Side, x: number): number => (oppGoalX(team, half) === 105 ? x : 105 - x)
  // The last pass or clearance, for who an interception was cut out from.
  let lastKick: { tick: number; byIdx: number; lofted: boolean; through: boolean } | null = null

  for (const e of events) {
    if (shootout && ((e.type === 'possession' && e.via === 'save') || (e.type === 'deflection' && e.kind === 'parry'))) keeperTouched = true
    if (shootout && e.type !== 'shootoutKick' && e.type !== 'fullTime') continue
    if (e.type === 'pass') {
      lastKick = { tick: e.tick, byIdx: e.byIdx, lofted: e.lofted, through: e.through }
      lastPassBy.set(e.byIdx, { tick: e.tick, lofted: e.lofted, through: e.through, wide: Math.abs(e.from.y - CENTER.y) > 16 })
    } else if (e.type === 'clearance') lastKick = { tick: e.tick, byIdx: e.byIdx, lofted: true, through: false }
    switch (e.type) {
      case 'restart':
        if (e.restart === 'kickoff' && !afterGoal) {
          add(e, period === 1 ? `Kick-off. ${teamName(e.team)} get us under way.` : period === 2 ? 'The second half is under way.' : period === 3 ? 'Extra time is under way.' : 'The second half of extra time is under way.', 'period', null)
        }
        afterGoal = false
        break
      case 'shot': {
        const t = teamOf(e.byIdx)
        const yards = Math.round(dist(e.from, { x: oppGoalX(t, half), y: CENTER.y }) * YARDS_PER_METRE)
        lastShot = { tick: e.tick, byIdx: e.byIdx, header: e.header, finesse: e.finesse, penalty: e.penalty, yards }
        const n = name(e.byIdx)
        if (e.penalty) {
          add(e, say('pen', e, e.byIdx, [`${n} steps up to take it…`, `${n} places the ball on the spot…`, `${n} takes a long run-up…`]), 'chance', t)
          break
        }
        // Which foot, now and then, when it isn't his usual one.
        const usual = match.players[e.byIdx].def.foot ?? 'right'
        const weaker = e.foot !== undefined && e.foot !== usual
        const text = e.header
          ? say('shot-head', e, e.byIdx, [`${n} gets his head to it.`, `${n} rises to meet it.`, `${n} heads it towards goal.`, `A header from ${n}.`])
          : e.finesse
            ? say('shot-curl', e, e.byIdx, [`${n} tries to curl one in from ${yards} yards.`, `${n} bends one towards the far corner.`, `${n} goes for the corner from ${yards} yards.`])
            : yards <= 10
              ? say('shot-close', e, e.byIdx, [`${n} shoots from close range.`, `${n} gets a shot away inside the six-yard box.`, `${n} snatches at it from close in.`, `${n} swings a boot at it, ${yards} yards out.`])
              : weaker && (mix(e.tick, 7) & 1) === 0
                ? `${n} tries it on his ${e.foot} foot from ${yards} yards.`
                : yards >= 24
                  ? say('shot-far', e, e.byIdx, [`${n} lets fly from ${yards} yards.`, `${n} tries his luck from ${yards} yards.`, `${n} has a go from distance.`, `${n} unleashes one from ${yards} yards.`])
                  : say('shot', e, e.byIdx, [`${n} shoots from ${yards} yards.`, `${n} strikes it from ${yards} yards.`, `${n} drives it at goal from ${yards} yards.`, `${n} has a go from ${yards} yards.`, `${n} pulls the trigger from ${yards} yards.`])
        add(e, text, 'chance', t)
        break
      }
      case 'possession': {
        const t = teamOf(e.idx)
        const ax = attackX(t, e.contact.x)
        const kicked = lastKick && e.tick - lastKick.tick <= 40 ? lastKick : null
        const n = name(e.idx)
        if (e.won === 'cut' && kicked) {
          const by = name(kicked.byIdx)
          if (ax > 70) {
            // Won high up the pitch: the start of a chance, as often as not.
            add(e, say('cut-high', e, e.idx, [`${n} reads it and nicks the ball off ${by}.`, `Intercepted high up the pitch by ${n}.`, `${n} steps in front and takes it off ${by}.`]), 'info', t)
          } else if (ax < 25 && (kicked.lofted || kicked.through)) {
            add(e, say('cut-low', e, e.idx, [`${n} cuts it out.`, `Good defending from ${n}, who gets across to intercept.`, `${n} reads the ball in behind and gets there first.`]), 'info', t)
          }
        }
        if (e.via === 'save' && !shotLive(e) && e.height > 1 && kicked?.lofted && ax < 18) {
          add(e, say('claim', e, e.idx, [`${n} comes to claim it.`, `Safe hands from ${n}.`, `${n} plucks it out of the air.`, `${n} comes off his line and takes it.`]), 'info', t)
        }
        if (e.via === 'save' && shotLive(e)) {
          const close = lastShot !== null && lastShot.yards <= 9
          const text = e.dive
            ? e.height > 1.6
              ? say('hold-dive-high', e, e.idx, [`Diving save! ${n} holds on to it at full stretch.`, `${n} flies across and catches it.`, `Spectacular from ${n}, who takes it in mid-air.`])
              : e.height < 0.5
                ? say('hold-dive-low', e, e.idx, [`${n} gets down low and gathers.`, `Diving save! ${n} smothers it by the post.`, `${n} goes full length along the ground to hold it.`])
                : say('hold-dive', e, e.idx, [`Diving save! ${n} holds on to it.`, `${n} flings himself across and gathers.`, `Good save from ${n}, diving to hold it.`])
            : close
              ? say('hold-close', e, e.idx, [`${n} spreads himself and smothers it.`, `${n} stands tall and blocks it with his body.`, `Point-blank, and ${n} keeps it out.`])
              : say('hold', e, e.idx, [`Saved. ${n} holds on to it.`, `Comfortable for ${n}.`, `${n} gathers.`, `Straight at ${n}.`, `${n} takes it cleanly.`])
          add(e, text, e.dive || close ? 'chance' : 'info', teamOf(e.idx))
          lastShot = null
        }
        break
      }
      case 'deflection': {
        const n = name(e.idx)
        if (e.kind === 'parry' && shotLive(e)) {
          const text =
            e.height > 1.9
              ? say('parry-high', e, e.idx, [`What a save! ${n} tips it away from under the bar.`, `${n} claws it away from the top corner.`, `Fingertips! ${n} just gets there.`])
              : e.dive
                ? e.height < 0.5
                  ? say('parry-low', e, e.idx, [`${n} gets down well to push it round the post.`, `Low save from ${n}, diving to his post.`, `${n} goes down quickly and turns it away.`])
                  : say('parry-dive', e, e.idx, [`What a save! ${n} dives to tip it away.`, `${n} stretches full length to keep it out.`, `${n} flies across to beat it away.`])
                : say('parry', e, e.idx, [`Good save! ${n} parries it.`, `${n} beats it away.`, `${n} gets a strong hand to it.`, `Pushed away by ${n}.`])
          add(e, text, 'chance', teamOf(e.idx))
          lastShot = null
        } else if (e.kind === 'block' && shotLive(e)) {
          add(e, say('block', e, e.idx, [`Blocked by ${n}.`, `${n} throws himself in the way.`, `${n} gets a body on it.`, `Charged down by ${n}.`, `${n} blocks it bravely.`]), 'info', teamOf(e.idx))
          lastShot = null
        }
        break
      }
      case 'woodwork': {
        // The bar: high, and between the posts rather than at one.
        const bar = e.height > CROSSBAR - 0.25 && Math.abs(e.pos.y - CENTER.y) < 3.4
        const text = bar
          ? phrases.pick('bar', mix(e.tick, 1), ['Off the crossbar!', 'It cannons back off the bar!', 'Crossbar! So close.'])
          : phrases.pick('post', mix(e.tick, 2), ['Off the post!', 'It comes back off the woodwork!', 'Rattles the post!', 'Hits the inside of the post and stays out!'])
        add(e, text, 'chance', e.byIdx === null ? null : teamOf(e.byIdx))
        break
      }
      case 'out':
        if (e.award === 'corner') {
          add(e, phrases.pick('corner', mix(e.tick, e.team), [`Corner to ${teamName(e.team)}.`, `${teamName(e.team)} win a corner.`, `Behind for a corner to ${teamName(e.team)}.`]), 'info', e.team)
        } else if (e.award === 'goalKick' && shotLive(e)) {
          const over = e.height > CROSSBAR
          const close = Math.abs(e.pos.y - CENTER.y) < 6
          const seed = mix(e.tick, 3)
          const text = over
            ? e.height < 4
              ? phrases.pick('over-close', seed, ['Just over.', 'Over the bar, but not by much.', 'It clears the crossbar by inches.'])
              : phrases.pick('over', seed, ['Over the bar.', 'That sails over.', 'High and wide.', 'Into the crowd.'])
            : close
              ? phrases.pick('wide-close', seed, ['Just wide.', 'Inches wide of the post.', 'Agonisingly wide.', 'Past the post.'])
              : phrases.pick('wide', seed, ['Wide.', 'Well off target.', 'Wide of the mark.', 'Never troubling the keeper.'])
          add(e, text, 'info', null)
        }
        lastShot = null
        break
      case 'goal': {
        score[e.team]++
        const n = name(e.scorerIdx)
        const head = `Goal for ${teamName(e.team)}.`
        let text: string
        if (e.ownGoal) {
          text = `${head} ${phrases.pick('og', mix(e.tick, e.scorerIdx), [`An own goal by ${n}.`, `${n} turns it into his own net.`, `${n}, under pressure, puts it past his own keeper.`])}`
        } else {
          const shot = lastShot && lastShot.byIdx === e.scorerIdx ? lastShot : null
          const pass = e.assistIdx !== null ? lastPassBy.get(e.assistIdx) : undefined
          const a = e.assistIdx !== null ? name(e.assistIdx) : null
          const assist =
            a === null
              ? ''
              : pass?.through
                ? `, from ${a}'s through ball`
                : pass?.lofted && pass.wide
                  ? `, from ${a}'s cross`
                  : say('assist', e, e.assistIdx!, [`, set up by ${a}`, `, ${a} with the assist`, `, after good work from ${a}`])
          const how = shot?.penalty
            ? say('g-pen', e, e.scorerIdx, [`${n} scores from the spot`, `${n} sends the keeper the wrong way`, `${n} converts the penalty`, `${n} tucks the penalty away`])
            : shot?.header
              ? say('g-head', e, e.scorerIdx, [`${n} heads it in`, `${n} rises highest and heads home`, `${n} glances a header in`, `A header from ${n}`])
              : shot?.finesse
                ? say('g-curl', e, e.scorerIdx, [`${n} curls it into the corner`, `${n} bends it past the keeper`, `${n} places it beautifully`])
                : shot && shot.yards >= 24
                  ? say('g-far', e, e.scorerIdx, [`${n} scores from ${shot.yards} yards`, `${n} finds the net from distance`, `${n} lets fly and it flies in from ${shot.yards} yards`])
                  : shot && shot.yards <= 8
                    ? say('g-close', e, e.scorerIdx, [`${n} taps it in`, `${n} turns it in from close range`, `${n} can't miss from there`, `${n} prods it home`])
                    : say('g', e, e.scorerIdx, [`${n} scores`, `${n} finishes`, `${n} slots it home`, `${n} fires it in`, `${n} picks his spot`])
          text = `${head} ${how}${assist}.`
        }
        const tally = e.ownGoal ? 0 : (goalsBy.get(e.scorerIdx) ?? 0) + 1
        if (!e.ownGoal) goalsBy.set(e.scorerIdx, tally)
        const count = tally === 2 ? ` His second.` : tally === 3 ? ` A hat-trick for ${n}.` : tally > 3 ? ` That's ${tally} for ${n}.` : ''
        add(e, `${text} ${score[0]}–${score[1]}.${count}${celebration(e, n)}`, 'goal', e.team)
        lastShot = null
        afterGoal = true
        break
      }
      case 'tackle': {
        if (e.won) {
          // Winning it back high up the pitch, or a last-ditch tackle in his own box.
          const t = teamOf(e.byIdx)
          const ax = attackX(t, e.pos.x)
          const inBox = ax < 16.5 && Math.abs(e.pos.y - CENTER.y) < 20.16
          const [b, o] = [name(e.byIdx), name(e.onIdx)]
          const stronger = e.style === 'standing' && strength(e.byIdx) - strength(e.onIdx) >= 3
          if (ax > 65) {
            add(e, say('win-high', e, e.byIdx, [`${b} wins it back from ${o} high up the pitch.`, `${o} is dispossessed by ${b}.`, `${b} robs ${o}.`, `${b} pinches it off ${o}'s toes.`]), 'info', t)
          } else if (inBox) {
            const text =
              e.style === 'slide'
                ? say('box-slide', e, e.byIdx, [`A superb sliding tackle from ${b} to stop ${o}.`, `${b} slides in and takes the ball cleanly off ${o}.`, `Last-ditch from ${b}, sliding in on ${o}.`])
                : stronger
                  ? say('box-strong', e, e.byIdx, [`${b} muscles ${o} off the ball.`, `${b} is too strong for ${o} and comes away with it.`])
                  : say('box-stand', e, e.byIdx, [`A crucial tackle from ${b} to stop ${o}.`, `${b} stands up to ${o} and wins it cleanly.`, `${b} gets a foot in to stop ${o}.`])
            add(e, text, 'info', t)
          }
          break
        }
        // Otherwise only a take-on in the final third is worth a line.
        if (!e.beaten) break
        const t = teamOf(e.onIdx)
        const x = attackX(t, e.pos.x)
        if (x < 70) break
        const c = name(e.onIdx)
        const o = name(e.byIdx)
        const options =
          e.beaten === 'stepOver'
            ? [`${c} steps over it and goes past ${o}.`, `A step-over from ${c}, and ${o} is left behind.`, `${c} shows ${o} the ball, steps over it and is gone.`]
            : e.beaten === 'dragBack'
              ? [`${c} drags it back away from ${o}.`, `${c} pulls it back and ${o} slides by.`, `A neat drag-back from ${c} takes him past ${o}.`]
              : e.beaten === 'burst'
                ? [`${c} knocks it past ${o} and is away.`, `${c} has the legs on ${o}.`, `${c} pushes it beyond ${o} and races clear.`]
                : [`${c} sells ${o} a dummy.`, `${c} drops a shoulder and leaves ${o} going the wrong way.`, `A feint from ${c}, and ${o} bites.`]
        add(e, say(`move-${e.beaten}`, e, e.onIdx, options), 'info', t)
        break
      }
      case 'foul': {
        const [b, o] = [name(e.byIdx), name(e.onIdx)]
        if (e.award === 'penalty') {
          const why = e.aerial
            ? `${b} pulls ${o} back as they go up for it.`
            : e.style === 'slide'
              ? `${b} slides in and catches ${o}.`
              : say('pen-foul', e, e.byIdx, [`${b} brings down ${o}.`, `${b} clips ${o}.`, `${o} goes down under ${b}'s challenge.`])
          add(e, `Penalty to ${teamName(teamOf(e.onIdx))}. ${why}`, 'chance', teamOf(e.onIdx))
        } else {
          const text = e.aerial
            ? say('foul-air', e, e.byIdx, [`${b} climbs all over ${o}. Free kick.`, `${b} pushes ${o} in the air.`, `A shove from ${b} as the ball comes down. Free kick.`])
            : e.style === 'slide'
              ? say('foul-slide', e, e.byIdx, [`${b} slides in and takes ${o}. Free kick.`, `Late sliding challenge from ${b}.`, `${b} goes to ground and catches ${o}.`])
              : say('foul', e, e.byIdx, [`Foul by ${b} on ${o}.`, `${b} catches ${o}. Free kick.`, `${o} is brought down by ${b}.`, `${b} clips ${o}'s heels.`, `${b} leans into ${o}, and the whistle goes.`])
          add(e, text, 'info', teamOf(e.onIdx))
        }
        break
      }
      case 'injury':
        add(e, say('injury', e, e.idx, [`${name(e.idx)} is down and needs treatment.`, `${name(e.idx)} is struggling; that looks like an injury.`, `${name(e.idx)} is down, holding his leg.`]), 'info', teamOf(e.idx))
        break
      case 'sub': {
        const [on, off] = [name(e.onIdx), name(e.offIdx)]
        add(
          e,
          e.reason === 'injury'
            ? `${teamName(e.team)} change: ${on} replaces the injured ${off}.`
            : e.reason === 'manager'
              ? `Change for ${teamName(e.team)}: ${on} on for ${off}.`
              : say('sub', e, e.onIdx, [`${teamName(e.team)} change: ${on} on for ${off}.`, `${off} makes way for ${on}.`, `${teamName(e.team)} bring on ${on}, for ${off}.`]),
          'info',
          e.team,
        )
        break
      }
      case 'formation':
        add(e, `${teamName(e.team)} go to a ${e.formation}.`, 'info', e.team)
        break
      case 'block':
        add(
          e,
          e.block === 'high'
            ? `${teamName(e.team)} push up into a high block.`
            : e.block === 'low'
              ? `${teamName(e.team)} drop into a low block.`
              : `${teamName(e.team)} settle into a mid block.`,
          'info',
          e.team,
        )
        break
      case 'card': {
        const n = name(e.idx)
        const text =
          e.color === 'yellow'
            ? say('yellow', e, e.idx, [`Yellow card for ${n}.`, `${n} goes into the book.`, `The referee shows ${n} a yellow.`, `${n} is booked.`])
            : booked.has(e.idx)
              ? `A second yellow for ${n}, and he's off.`
              : say('red', e, e.idx, [`Red card. ${n} is sent off.`, `${n} sees red.`, `Straight red for ${n}.`])
        if (e.color === 'yellow') booked.add(e.idx)
        add(e, text, 'card', teamOf(e.idx))
        break
      }
      case 'offside':
        add(e, say('offside', e, e.idx, [`${name(e.idx)} is caught offside.`, `The flag is up against ${name(e.idx)}.`, `${name(e.idx)} strays offside.`, `${name(e.idx)} went too early. Offside.`]), 'info', teamOf(e.idx))
        break
      case 'halfTime':
        add(e, `Half-time. ${teamName(0)} ${score[0]}–${score[1]} ${teamName(1)}.`, 'period', null)
        half = 2
        period = 2
        break
      case 'extraTime':
        period = e.period
        half = e.period === 3 ? 1 : 2
        add(e, e.period === 3 ? `Level at full-time, ${score[0]}–${score[1]}. Extra time.` : `Half-time in extra time. ${teamName(0)} ${score[0]}–${score[1]} ${teamName(1)}.`, 'period', null)
        break
      case 'shootout':
        add(e, `Still level after extra time. Penalties.`, 'period', null)
        shootout = true
        break
      case 'shootoutKick':
        pens[e.team] += e.scored ? 1 : 0
        add(e, `${name(e.takerIdx)} ${e.scored ? 'scores' : keeperTouched ? 'is saved' : 'misses'}. ${pens[0]}–${pens[1]}.`, e.scored ? 'goal' : 'chance', e.team)
        keeperTouched = false
        break
      case 'fullTime': {
        const after = pens[0] + pens[1] > 0 || events.some((f) => f.type === 'shootout') ? ` ${teamName(pens[0] > pens[1] ? 0 : 1)} win ${Math.max(...pens)}–${Math.min(...pens)} on penalties.` : ''
        add(e, `Full-time. ${teamName(0)} ${score[0]}–${score[1]} ${teamName(1)}.${after}`, 'period', null)
        break
      }
    }
  }
  return lines

  /**
   * The celebration, in words: the engine's style (from his flair) and, within it, his manner:
   * a showman's flourish, a hothead's word for the crowd, a quiet man's nod, a thank-you to the
   * man who made it.
   */
  function celebration(e: Extract<MatchEvent, { type: 'goal' }>, n: string): string {
    if (!e.celebration || e.ownGoal) return ''
    const { flair, temper } = traits(e.scorerIdx)
    const seed = mix(e.tick, e.scorerIdx + 101)
    const a = e.assistIdx !== null && e.assistIdx !== e.scorerIdx ? name(e.assistIdx) : null
    const away = teamOf(e.scorerIdx) === 1
    const options: string[] = []
    if (e.celebration === 'cornerFlag') {
      options.push(` ${n} races away to the corner flag.`, ` Off to the corner flag he goes, and his teammates chase after him.`)
      if (flair > 0.8) options.push(` ${n} wheels away to the corner flag, arms out like an aeroplane.`)
      if (temper > 0.65) options.push(away ? ` ${n} runs to the away end and lets them hear it.` : ` ${n} sprints to the corner and roars at the crowd.`)
    } else if (e.celebration === 'kneeSlide') {
      options.push(` Down on his knees in front of the fans.`, ` ${n} slides on his knees towards the crowd.`)
      if (flair > 0.55) options.push(` A long knee slide from ${n}.`)
      if (a) options.push(` ${n} slides on his knees, and ${a} is first to him.`)
    } else {
      options.push(` A clenched fist from ${n}, and back to halfway.`)
      if (flair < 0.25 && temper < 0.4) options.push(` No fuss from ${n}; he jogs back for the restart.`, ` ${n} just nods, and heads back to halfway.`)
      else options.push(` ${n} points to the sky.`)
      if (temper > 0.65) options.push(away ? ` ${n} puts a finger to his lips in front of the home fans.` : ` ${n} cups an ear to the crowd.`)
      if (a) options.push(` ${n} points to ${a}, who made it.`)
    }
    return phrases.pick('celebrate', seed, options)
  }
}
