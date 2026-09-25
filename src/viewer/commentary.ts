/**
 * Turns the engine's event stream into commentary lines. Pure and deterministic: the same events
 * always read the same way. Routine passes and tackles are left out; the line is for moments.
 */
import { CENTER, type MatchEvent, type MatchState, type Side, dist, oppGoalX } from '../engine/index.ts'

export type LineKind = 'goal' | 'chance' | 'card' | 'info' | 'period'

export interface Line {
  tick: number
  clock: string
  text: string
  kind: LineKind
  team: Side | null
}

const YARDS_PER_METRE = 1.0936

/** Pick a phrasing deterministically, so replays of the same match read the same. */
const vary = (tick: number, options: string[]): string => options[tick % options.length]

export function surname(name: string): string {
  const parts = name.split(' ')
  return parts[parts.length - 1]
}

export function buildCommentary(match: MatchState, events: MatchEvent[]): Line[] {
  const lines: Line[] = []
  const name = (idx: number): string => surname(match.players[idx].def.name)
  const teamOf = (idx: number): Side => match.players[idx].team
  const teamName = (t: Side): string => match.teams[t].name
  const score: [number, number] = [0, 0]
  let half: 1 | 2 = 1
  let lastShot: { tick: number; byIdx: number } | null = null
  let afterGoal = false

  const add = (e: MatchEvent, text: string, kind: LineKind, team: Side | null): void => {
    lines.push({ tick: e.tick, clock: e.clock, text, kind, team })
  }
  const shotLive = (e: MatchEvent): boolean => lastShot !== null && e.tick - lastShot.tick <= 20

  for (const e of events) {
    switch (e.type) {
      case 'restart':
        if (e.restart === 'kickoff' && !afterGoal) {
          add(e, half === 1 ? `Kick-off. ${teamName(e.team)} get us under way.` : 'The second half is under way.', 'period', null)
        }
        afterGoal = false
        break
      case 'shot': {
        const t = teamOf(e.byIdx)
        lastShot = { tick: e.tick, byIdx: e.byIdx }
        if (e.penalty) {
          add(e, `${name(e.byIdx)} steps up to take it…`, 'chance', t)
          break
        }
        const yards = Math.round(dist(e.from, { x: oppGoalX(t, half), y: CENTER.y }) * YARDS_PER_METRE)
        const text =
          yards <= 10
            ? vary(e.tick, [`${name(e.byIdx)} shoots from close range.`, `${name(e.byIdx)} gets a shot away inside the six-yard box.`])
            : vary(e.tick, [
                `${name(e.byIdx)} shoots from ${yards} yards.`,
                `${name(e.byIdx)} lets fly from ${yards} yards.`,
                `${name(e.byIdx)} tries his luck from ${yards} yards.`,
                `${name(e.byIdx)} strikes it from ${yards} yards.`,
              ])
        add(e, text, 'chance', t)
        break
      }
      case 'possession':
        if (e.via === 'save' && shotLive(e)) {
          const text = e.dive
            ? vary(e.tick, [`Diving save! ${name(e.idx)} holds on to it.`, `${name(e.idx)} flings himself across and gathers.`])
            : vary(e.tick, [`Saved. ${name(e.idx)} holds on to it.`, `Comfortable for ${name(e.idx)}.`, `${name(e.idx)} gathers.`])
          add(e, text, e.dive ? 'chance' : 'info', teamOf(e.idx))
          lastShot = null
        }
        break
      case 'deflection':
        if (e.kind === 'parry' && shotLive(e)) {
          const text = e.dive
            ? vary(e.tick, [`What a save! ${name(e.idx)} dives to tip it away.`, `${name(e.idx)} stretches full length to keep it out.`])
            : vary(e.tick, [`Good save! ${name(e.idx)} parries it.`, `${name(e.idx)} gets down well to push it away.`])
          add(e, text, 'chance', teamOf(e.idx))
          lastShot = null
        } else if (e.kind === 'block' && shotLive(e)) {
          add(e, `Blocked by ${name(e.idx)}.`, 'info', teamOf(e.idx))
          lastShot = null
        }
        break
      case 'woodwork':
        add(e, vary(e.tick, ['Off the post!', 'It comes back off the woodwork!']), 'chance', e.byIdx === null ? null : teamOf(e.byIdx))
        break
      case 'out':
        if (e.award === 'corner') add(e, `Corner to ${teamName(e.team)}.`, 'info', e.team)
        else if (e.award === 'goalKick' && shotLive(e)) {
          const close = Math.abs(e.pos.y - CENTER.y) < 6
          add(e, close ? vary(e.tick, ['Just wide.', 'Inches wide of the post.']) : vary(e.tick, ['Wide.', 'Well off target.']), 'info', null)
        }
        lastShot = null
        break
      case 'goal': {
        score[e.team]++
        const assist = e.assistIdx !== null ? `, set up by ${name(e.assistIdx)}` : ''
        const text = e.ownGoal
          ? `Goal for ${teamName(e.team)}. An own goal by ${name(e.scorerIdx)}.`
          : `Goal for ${teamName(e.team)}. ${name(e.scorerIdx)} scores${assist}.`
        const flourish =
          e.celebration === 'cornerFlag'
            ? ` ${name(e.scorerIdx)} races away to the corner flag.`
            : e.celebration === 'kneeSlide'
              ? ' Down on his knees in front of the fans.'
              : ''
        add(e, `${text} ${score[0]}–${score[1]}.${flourish}`, 'goal', e.team)
        lastShot = null
        afterGoal = true
        break
      }
      case 'foul':
        if (e.award === 'penalty') {
          add(e, `Penalty to ${teamName(teamOf(e.onIdx))}. ${name(e.byIdx)} brings down ${name(e.onIdx)}.`, 'chance', teamOf(e.onIdx))
        } else {
          const text =
            e.style === 'slide'
              ? vary(e.tick, [`${name(e.byIdx)} slides in and takes ${name(e.onIdx)}. Free kick.`, `Late sliding challenge from ${name(e.byIdx)}.`])
              : vary(e.tick, [`Foul by ${name(e.byIdx)} on ${name(e.onIdx)}.`, `${name(e.byIdx)} catches ${name(e.onIdx)}. Free kick.`])
          add(e, text, 'info', teamOf(e.onIdx))
        }
        break
      case 'card':
        add(e, e.color === 'yellow' ? `Yellow card for ${name(e.idx)}.` : `Red card. ${name(e.idx)} is sent off.`, 'card', teamOf(e.idx))
        break
      case 'offside':
        add(e, `${name(e.idx)} is caught offside.`, 'info', teamOf(e.idx))
        break
      case 'halfTime':
        add(e, `Half-time. ${teamName(0)} ${score[0]}–${score[1]} ${teamName(1)}.`, 'period', null)
        half = 2
        break
      case 'fullTime':
        add(e, `Full-time. ${teamName(0)} ${score[0]}–${score[1]} ${teamName(1)}.`, 'period', null)
        break
    }
  }
  return lines
}
