/**
 * A draft run's goals (session 37): an aim (finish at or above a place, set by where the pundits
 * tip the side) and one bonus challenge, both worked out from the season itself (seed and tips),
 * so nothing new is saved. At the end, up to three stars: aim met, bonus met, and a standout
 * season (three places better than the aim, or champions with 90 points).
 */
import { Rng } from '../engine/index.ts'
import { isOver, matchdays, table, tipsOf, type Season } from '../season/season.ts'
import { clubRecords } from '../season/stats.ts'

export type BonusKind = 'goals' | 'cleanSheets' | 'unbeaten' | 'fewLosses' | 'scorer' | 'beatBest'
export interface RunGoal {
  /** Finish this place or higher. */
  aim: number
  /** Where the pundits tipped the side. */
  tip: number
  bonus: { kind: BonusKind; target: number; rival?: number }
}

export const BONUS_KINDS: BonusKind[] = ['goals', 'cleanSheets', 'unbeaten', 'fewLosses', 'scorer', 'beatBest']

/** The run's goals: the aim from the tip, the bonus drawn from the season's seed and scaled by it. */
export function runGoal(s: Season): RunGoal {
  const tips = s.tips ?? tipsOf(s)
  const tip = tips[s.userTeam]
  const n = s.teams.length
  const aim = Math.max(1, tip - 1)
  // Bonus targets by where the side is tipped, in fifths of the table: a little above what a side
  // tipped there manages (draft sim-seasons, session 37), so each is met ~40% of the time.
  const band = Math.min(4, Math.floor(((tip - 1) * 5) / n))
  const share = matchdays(s) / 38
  const kind = new Rng(s.seed * 17 + 3).pick(BONUS_KINDS)
  const by = (t: number[]): number => Math.max(1, Math.round(t[band] * share))
  const bonus = (target: number, rival?: number): RunGoal => ({ aim, tip, bonus: { kind, target, ...(rival !== undefined ? { rival } : {}) } })
  switch (kind) {
    case 'goals':
      return bonus(5 * Math.round(by(BONUS_TARGETS.goals) / 5))
    case 'beatBest':
      return bonus(BONUS_TARGETS.beatBest[band], tips.indexOf(tip === 1 ? 2 : 1))
    default:
      return bonus(by(BONUS_TARGETS[kind]))
  }
}

/** Each bonus's target by tip band (top fifth first), for a 38-match season; points off the favourites as they are. */
export const BONUS_TARGETS: Record<BonusKind, number[]> = {
  goals: [95, 72, 56, 42, 32],
  cleanSheets: [17, 13, 10, 8, 6],
  unbeaten: [14, 10, 6, 5, 4],
  fewLosses: [5, 10, 15, 19, 23],
  scorer: [26, 22, 16, 12, 9],
  beatBest: [4, 3, 2, 1, 1],
}

export interface GoalState {
  goal: RunGoal
  place: number
  /** The bonus's count so far; `met` once it can't be lost, `failed` once it can't be met. */
  now: number
  met: boolean
  failed: boolean
}

/** How the run's goals stand now. */
export function goalState(s: Season): GoalState {
  const goal = runGoal(s)
  const rec = clubRecords(s)[s.userTeam]
  const place = table(s).findIndex((r) => r.team === s.userTeam) + 1
  const left = matchdays(s) - rec.played
  const { kind, target, rival } = goal.bonus
  let now = 0
  let failed = false
  switch (kind) {
    case 'goals':
      now = rec.goalsFor
      break
    case 'cleanSheets':
      now = rec.cleanSheets
      failed = now + left < target
      break
    case 'unbeaten':
      now = rec.unbeaten
      break
    case 'fewLosses':
      now = rec.lost
      break
    case 'scorer':
      now = rec.topScorer?.goals ?? 0
      break
    case 'beatBest': {
      const games = s.fixtures.filter((f) => (f.home === s.userTeam && f.away === rival) || (f.away === s.userTeam && f.home === rival))
      now = games.reduce((n, f) => {
        if (!f.result) return n
        const side = f.home === s.userTeam ? 0 : 1
        const [a, b] = [f.result.score[side], f.result.score[1 - side]]
        return n + (a > b ? 3 : a === b ? 1 : 0)
      }, 0)
      failed = now + 3 * games.filter((f) => !f.result).length < target
      break
    }
  }
  const met = kind === 'fewLosses' ? isOver(s) && now <= target : now >= target
  if (kind === 'fewLosses') failed = now > target
  if (isOver(s)) failed = !met
  return { goal, place, now, met, failed }
}

/** Stars for a finished run, 0-3. */
export function starsOf(s: Season): number {
  const g = goalState(s)
  const points = table(s)[g.place - 1]?.points ?? 0
  const standout = g.place <= g.goal.aim - 3 || (g.place === 1 && points >= Math.round((90 * matchdays(s)) / 38))
  return (g.place <= g.goal.aim ? 1 : 0) + (g.met ? 1 : 0) + (standout ? 1 : 0)
}

const ORD = (n: number): string => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')}`

/** The aim in words. */
export const aimText = (g: RunGoal): string => (g.aim === 1 ? 'Win the league' : `Finish ${ORD(g.aim)} or higher`)

/** The bonus in words; `rival` is the rival's name for 'beatBest'. */
export function bonusText(g: RunGoal, rival = 'the favourites'): string {
  const { kind, target } = g.bonus
  switch (kind) {
    case 'goals':
      return `Score ${target} league goals`
    case 'cleanSheets':
      return `Keep ${target} clean sheets`
    case 'unbeaten':
      return `Go ${target} matches unbeaten in a row`
    case 'fewLosses':
      return target === 0 ? 'Go the season unbeaten' : `Lose ${target} or fewer`
    case 'scorer':
      return `Have a ${target}-goal scorer`
    case 'beatBest':
      return target === 1 ? `Take a point off ${rival}` : `Take ${target} points off ${rival}`
  }
}
