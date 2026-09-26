/**
 * Per-player match stats and ratings, built from the event stream up to a point in the match (so
 * they grow as it's watched). Pure: the same events always give the same numbers.
 */
import type { MatchEvent, MatchState, Traits } from '../engine/index.ts'

export interface PlayerLine {
  passes: number
  passesCompleted: number
  keyPasses: number
  shots: number
  onTarget: number
  goals: number
  assists: number
  xg: number
  tackles: number
  interceptions: number
  dribbles: number
  saves: number
  fouls: number
  yellow: boolean
  red: boolean
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
  tackles: 0,
  interceptions: 0,
  dribbles: 0,
  saves: 0,
  fouls: 0,
  yellow: false,
  red: false,
  rating: 6,
})

export function playerLines(match: MatchState, events: MatchEvent[]): PlayerLine[] {
  const lines = match.players.map(blank)
  const teamOf = (idx: number): 0 | 1 => match.players[idx].team
  const conceded: [number, number] = [0, 0]
  // The last pass still waiting to be received, and who last received one (for key passes).
  let pending: { by: number } | null = null
  let receivedFrom: { by: number; to: number } | null = null
  // A shot still on its way: only stopping one counts as a save (not claiming a cross).
  let shotLive = false
  for (const e of events) {
    if (e.type === 'pass' || e.type === 'clearance' || e.type === 'restart') shotLive = false
    switch (e.type) {
      case 'pass':
        lines[e.byIdx].passes++
        pending = { by: e.byIdx }
        break
      case 'possession':
        if (pending && teamOf(e.idx) === teamOf(pending.by) && e.idx !== pending.by) {
          lines[pending.by].passesCompleted++
          receivedFrom = { by: pending.by, to: e.idx }
        } else receivedFrom = null
        pending = null
        if (e.via === 'interception') lines[e.idx].interceptions++
        if (e.via === 'save' && shotLive) lines[e.idx].saves++
        shotLive = false
        break
      case 'deflection':
        pending = null
        if (e.kind === 'parry' && shotLive) lines[e.idx].saves++
        break
      case 'shot':
        shotLive = true
        lines[e.byIdx].shots++
        lines[e.byIdx].xg += e.xg
        if (e.onTarget) lines[e.byIdx].onTarget++
        if (receivedFrom && receivedFrom.to === e.byIdx) lines[receivedFrom.by].keyPasses++
        receivedFrom = null
        break
      case 'goal':
        conceded[(1 - e.team) as 0 | 1]++
        if (!e.ownGoal) lines[e.scorerIdx].goals++
        if (e.assistIdx !== null) lines[e.assistIdx].assists++
        break
      case 'tackle':
        if (e.won) lines[e.byIdx].tackles++
        else lines[e.onIdx].dribbles++
        break
      case 'foul':
        lines[e.byIdx].fouls++
        break
      case 'card':
        if (e.color === 'yellow') lines[e.idx].yellow = true
        else lines[e.idx].red = true
        break
      case 'out':
      case 'offside':
        pending = null
        receivedFrom = null
        break
    }
  }
  lines.forEach((l, i) => {
    const p = match.players[i]
    const role = p.slot.role
    const defensive = role === 'GK' || role === 'CB' || role === 'FB' || role === 'DM'
    const accuracy = l.passes >= 5 ? l.passesCompleted / l.passes - 0.8 : 0
    let r =
      6 +
      l.goals * 1.0 +
      l.assists * 0.6 +
      l.keyPasses * 0.2 +
      l.onTarget * 0.1 +
      l.tackles * 0.15 +
      l.interceptions * 0.1 +
      l.dribbles * 0.1 +
      l.saves * (role === 'GK' ? 0.3 : 0) +
      accuracy * 2 -
      l.fouls * 0.1 -
      (l.yellow ? 0.3 : 0) -
      (l.red ? 1.5 : 0)
    // Defenders and keepers share the blame for goals conceded.
    if (defensive) r -= conceded[p.team] * (role === 'GK' ? 0.4 : 0.25)
    l.rating = Math.round(Math.min(10, Math.max(3, r)) * 10) / 10
  })
  return lines
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
