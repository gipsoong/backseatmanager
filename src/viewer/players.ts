/**
 * Per-player match stats and ratings, built from the event stream up to a point in the match (so
 * they grow as it's watched). Pure: the same events always give the same numbers.
 */
import { type MatchEvent, type MatchState, type Role, TICKS_PER_MINUTE, type Traits } from '../engine/index.ts'

export interface PlayerLine {
  passes: number
  passesCompleted: number
  keyPasses: number
  shots: number
  onTarget: number
  goals: number
  assists: number
  /** Expected goals from his shots, and non-penalty only. */
  xg: number
  npxg: number
  /** Expected assists: the xG of shots taken straight from his passes. */
  xa: number
  penGoals: number
  penTaken: number
  /** Chances of 0.3 xG or more, and how many he put away. */
  bigChances: number
  bigChancesScored: number
  headedGoals: number
  leftGoals: number
  rightGoals: number
  tackles: number
  interceptions: number
  /** Shots, crosses and passes blocked. */
  blocks: number
  clearances: number
  /** Headers won: headed on, clear, at goal or down. */
  aerials: number
  /** Loose balls won back from the other side. */
  recoveries: number
  dribbles: number
  /** Beaten by a dribbler when he went to tackle. */
  dribbledPast: number
  saves: number
  /** Goalkeepers: xG of the shots he stopped, and of all those on target he faced. */
  savedXg: number
  facedXg: number
  /** Goals let in while he was on. */
  conceded: number
  fouls: number
  ownGoals: number
  yellow: boolean
  red: boolean
  /** Clock when he came on (substitutes), when he went off (substituted, sent off); null if not. */
  on: string | null
  off: string | null
  /** Played any part so far: started, or came on. */
  played: boolean
  injured: boolean
  rating: number
}

const blank = (): PlayerLine => ({
  passes: 0,
  passesCompleted: 0,
  keyPasses: 0,
  shots: 0,
  onTarget: 0,
  goals: 0,
  assists: 0,
  xg: 0,
  npxg: 0,
  xa: 0,
  penGoals: 0,
  penTaken: 0,
  bigChances: 0,
  bigChancesScored: 0,
  headedGoals: 0,
  leftGoals: 0,
  rightGoals: 0,
  tackles: 0,
  interceptions: 0,
  blocks: 0,
  clearances: 0,
  aerials: 0,
  recoveries: 0,
  dribbles: 0,
  dribbledPast: 0,
  saves: 0,
  savedXg: 0,
  facedXg: 0,
  conceded: 0,
  fouls: 0,
  ownGoals: 0,
  yellow: false,
  red: false,
  on: null,
  off: null,
  played: false,
  injured: false,
  rating: 6,
})

/** A chance good enough to be called a big one. */
export const BIG_CHANCE_XG = 0.3

export function playerLines(match: MatchState, events: MatchEvent[]): PlayerLine[] {
  const lines = match.players.map(blank)
  const starters = new Set(match.teams.flatMap((t, team) => t.players.map((d) => match.players.findIndex((p) => p.team === team && p.def === d))))
  for (const i of starters) lines[i].played = true
  const teamOf = (idx: number): 0 | 1 => match.players[idx].team
  const onPitch = new Set(starters)
  const score: [number, number] = [0, 0]
  // When each player came on and went off (ticks), for clean sheets.
  const from = new Map<number, number>([...starters].map((i) => [i, 0]))
  const until = new Map<number, number>()
  // The last pass still waiting to be received, and who last received one (for key passes).
  let pending: { by: number } | null = null
  let receivedFrom: { by: number; to: number } | null = null
  // A shot still on its way: only stopping one counts as a save (not claiming a cross).
  type Shot = { by: number; xg: number; penalty: boolean; header: boolean; foot?: 'left' | 'right' }
  let shot: Shot | null = null
  let lastShot: Shot | null = null
  // Which side last had the ball at their feet: winning a loose ball off them is a recovery.
  let lastTeam: 0 | 1 | null = null
  let lastTick = 0
  for (const e of events) {
    lastTick = e.tick
    if (e.type === 'pass' || e.type === 'clearance' || e.type === 'restart') shot = null
    switch (e.type) {
      case 'restart':
        lastTeam = e.team
        break
      case 'pass':
        lines[e.byIdx].passes++
        if (e.header) lines[e.byIdx].aerials++
        pending = { by: e.byIdx }
        lastTeam = teamOf(e.byIdx)
        break
      case 'clearance':
        lines[e.byIdx].clearances++
        if (e.header) lines[e.byIdx].aerials++
        pending = null
        receivedFrom = null
        break
      case 'possession': {
        const team = teamOf(e.idx)
        if (pending && team === teamOf(pending.by) && e.idx !== pending.by) {
          lines[pending.by].passesCompleted++
          receivedFrom = { by: pending.by, to: e.idx }
        } else receivedFrom = null
        if (e.via === 'interception') lines[e.idx].interceptions++
        else if (e.via === 'control' && !pending && lastTeam !== null && lastTeam !== team) lines[e.idx].recoveries++
        if (e.via === 'save' && shot) {
          lines[e.idx].saves++
          lines[e.idx].savedXg += shot.xg
        }
        pending = null
        shot = null
        lastTeam = team
        break
      }
      case 'deflection':
        if (e.kind === 'header') {
          lines[e.idx].aerials++
          // Met a team-mate's cross with his head: the cross is what made the chance.
          if (pending && teamOf(pending.by) === teamOf(e.idx) && pending.by !== e.idx) receivedFrom = { by: pending.by, to: e.idx }
        }
        if (e.kind === 'block' && lastTeam !== null && lastTeam !== teamOf(e.idx)) lines[e.idx].blocks++
        if (e.kind === 'parry' && shot) {
          lines[e.idx].saves++
          lines[e.idx].savedXg += shot.xg
        }
        pending = null
        break
      case 'shot': {
        const l = lines[e.byIdx]
        shot = { by: e.byIdx, xg: e.xg, penalty: e.penalty, header: e.header, foot: e.foot }
        lastShot = shot
        l.shots++
        l.xg += e.xg
        if (!e.penalty) l.npxg += e.xg
        else l.penTaken++
        if (e.xg >= BIG_CHANCE_XG && !e.penalty) l.bigChances++
        if (e.onTarget) {
          l.onTarget++
          const keeper = [...onPitch].find((i) => teamOf(i) !== teamOf(e.byIdx) && match.players[i].slot.role === 'GK')
          if (keeper !== undefined) lines[keeper].facedXg += e.xg
        }
        if (receivedFrom && receivedFrom.to === e.byIdx) {
          lines[receivedFrom.by].keyPasses++
          lines[receivedFrom.by].xa += e.xg
        }
        receivedFrom = null
        lastTeam = teamOf(e.byIdx)
        break
      }
      case 'goal': {
        score[e.team]++
        const against = (1 - e.team) as 0 | 1
        for (const i of onPitch) if (teamOf(i) === against) lines[i].conceded++
        if (e.ownGoal) lines[e.scorerIdx].ownGoals++
        else {
          const l = lines[e.scorerIdx]
          l.goals++
          const s = lastShot && lastShot.by === e.scorerIdx ? lastShot : null
          if (s?.penalty) l.penGoals++
          else if (s && s.xg >= BIG_CHANCE_XG) l.bigChancesScored++
          if (s?.header) l.headedGoals++
          else if (s?.foot === 'left') l.leftGoals++
          else if (s?.foot === 'right') l.rightGoals++
        }
        if (e.assistIdx !== null) lines[e.assistIdx].assists++
        shot = null
        break
      }
      case 'tackle':
        if (e.won) lines[e.byIdx].tackles++
        else {
          lines[e.onIdx].dribbles++
          lines[e.byIdx].dribbledPast++
        }
        break
      case 'foul':
        lines[e.byIdx].fouls++
        break
      case 'card':
        if (e.color === 'yellow') lines[e.idx].yellow = true
        else {
          lines[e.idx].red = true
          lines[e.idx].off = e.clock
          onPitch.delete(e.idx)
          until.set(e.idx, e.tick)
        }
        break
      case 'sub':
        lines[e.onIdx].on = e.clock
        lines[e.onIdx].played = true
        lines[e.offIdx].off = e.clock
        onPitch.add(e.onIdx)
        onPitch.delete(e.offIdx)
        from.set(e.onIdx, e.tick)
        until.set(e.offIdx, e.tick)
        break
      case 'injury':
        lines[e.idx].injured = true
        break
      case 'out':
      case 'offside':
        pending = null
        receivedFrom = null
        lastTeam = null
        break
    }
  }
  const over = events.at(-1)?.type === 'fullTime'
  lines.forEach((l, i) => {
    if (!l.played) return
    const p = match.players[i]
    const team = p.team
    const onFor = (until.get(i) ?? lastTick) - (from.get(i) ?? 0)
    // Share of the match so far he was on for: a clean sheet needs most of it.
    const share = lastTick ? onFor / lastTick : 0
    const result = score[team] - score[1 - team]
    l.rating = rate(l, p.slot.role, {
      result: over ? Math.sign(result) : 0,
      cleanSheet: l.conceded === 0 && share >= 0.66 && lastTick > 0,
      minutes: onFor / TICKS_PER_MINUTE,
    })
  })
  return lines
}

/** How much keeping goals out counts, by position group. */
const GROUPS = {
  GK: { conceded: 0.3, cleanSheet: 0.6 },
  DEF: { conceded: 0.2, cleanSheet: 0.45 },
  DM: { conceded: 0.1, cleanSheet: 0.2 },
  MID: { conceded: 0.05, cleanSheet: 0.05 },
  ATT: { conceded: 0, cleanSheet: 0 },
}

/**
 * Where an ordinary game lands for each position: a forward's shots and a centre-back's
 * clearances come in different numbers, so each is offset to put a regular's season average
 * near 6.75 whatever his position (measured over whole simulated seasons; scripts/diag-ratings.ts
 * shows single matches). A great game still stands out in any position.
 */
const OFFSET: Record<Role, number> = { GK: -0.15, CB: -0.31, FB: 0, DM: 0.03, CM: -0.14, WM: -0.19, W: -0.43, ST: -0.34 }

export const ratingGroup = (role: Role): keyof typeof GROUPS =>
  role === 'GK' ? 'GK' : role === 'CB' || role === 'FB' ? 'DEF' : role === 'DM' ? 'DM' : role === 'CM' ? 'MID' : 'ATT'

/**
 * A match rating, 3-10, from what he did: goals and chances, but as much from winning the ball,
 * passing it on and keeping it out, weighed for his position, so a defender's good game rates
 * like a forward's. `result` is the side's result (1 won, 0 drawn or still going, -1 lost).
 */
export function rate(l: PlayerLine, role: Role, ctx: { result: number; cleanSheet: boolean; minutes: number }): number {
  const g = GROUPS[ratingGroup(role)]
  const keeper = role === 'GK'
  const missed = l.passes - l.passesCompleted
  const r =
    6 +
    // The offset evens out what a full match of his position's work adds up to: a substitute's
    // few minutes carry only their share of it.
    OFFSET[role] * Math.min(1, ctx.minutes / 90) +
    (l.goals - l.penGoals) * 0.9 +
    l.penGoals * 0.5 +
    l.assists * 0.55 +
    l.keyPasses * 0.12 +
    l.onTarget * 0.05 +
    l.dribbles * 0.08 -
    l.dribbledPast * 0.2 +
    l.tackles * 0.12 +
    l.interceptions * 0.1 +
    l.blocks * 0.12 +
    (keeper ? 0 : l.clearances * 0.03) +
    l.aerials * 0.07 +
    l.recoveries * 0.03 +
    l.passesCompleted * 0.006 -
    missed * 0.03 +
    (keeper ? l.saves * 0.15 + l.savedXg * 0.8 : 0) -
    l.fouls * 0.08 -
    (l.yellow ? 0.3 : 0) -
    (l.red ? 1.5 : 0) -
    l.ownGoals * 0.8 +
    ctx.result * (ctx.result > 0 ? 0.25 : 0.2) +
    (ctx.cleanSheet ? g.cleanSheet : 0) -
    l.conceded * g.conceded
  return Math.round(Math.min(10, Math.max(3, r)) * 10) / 10
}

/** A player's hidden traits in words: only the ones that stand out, strongest first. */
export function describeTraits(t: Traits): string[] {
  const words: [number, string][] = []
  const add = (v: number, high: string, low: string): void => {
    if (v > 0.72) words.push([v, high])
    else if (v < 0.28) words.push([1 - v, low])
  }
  add(t.flair, 'Flair player', 'Keeps it simple')
  add(t.temper, 'Short fuse', 'Cool head')
  add(t.aggression, 'Tenacious', 'Stands off')
  add(t.workRate, 'Tireless', 'Picks his moments')
  add(t.directness, 'Looks forward', 'Patient in possession')
  return words.sort((a, b) => b[0] - a[0]).map(([, w]) => w)
}
