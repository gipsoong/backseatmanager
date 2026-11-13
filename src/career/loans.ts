/**
 * Season-long loans (session 37): the manager sends a young player out for the season while a
 * window is open, so he plays somewhere else (and the other club pays him); he's back in the
 * summer, grown by what a season's minutes give him (career.ts `LOAN_PLAYED`, for `development`). No recalls.
 */
import type { PlayerDef } from '../engine/index.ts'
import { type Season, autoPick, squadOf } from '../season/season.ts'
import { windowOpen } from '../draft/transfers.ts'
import { MANAGER_MIN } from './career.ts'
import { inLastYear } from './contracts.ts'

/** Oldest age (now) a player can go out on loan. */
export const LOAN_MAX_AGE = 21

/** Why he can't go out on loan now, or null if he can. */
export function loanProblem(s: Season, id: string): string | null {
  const c = s.career
  if (!c) return 'Loans are for careers.'
  if (!windowOpen(s)) return 'Players can go out on loan while a window is open.'
  const squad = squadOf(s.teams[s.userTeam])
  const p = squad.find((q) => q.id === id)
  if (!p) return 'He isn’t in your squad.'
  if ((c.people[id]?.age ?? 99) > LOAN_MAX_AGE) return `Only players of ${LOAN_MAX_AGE} or under go out on loan.`
  if (inLastYear(s, id)) return 'He’s in the last year of his deal: renew it first, or he’d leave while he’s away.'
  if (squad.length - 1 < MANAGER_MIN + 2) return `You need at least ${MANAGER_MIN + 2} players at the club.`
  if (p.role === 'GK' && squad.filter((q) => q.role === 'GK').length <= 2) return 'You need two keepers at the club.'
  return null
}

/** He goes out on loan for the rest of the season: off the club's books, the eleven picked again. */
export function loanOut(s: Season, id: string): Season {
  const why = loanProblem(s, id)
  if (why) throw new Error(why)
  const c = s.career!
  const t = s.teams[s.userTeam]
  const p = squadOf(t).find((q) => q.id === id)!
  const rest = squadOf(t).filter((q) => q.id !== id)
  const without: Season = {
    ...s,
    teams: s.teams.map((x, i) => (i === s.userTeam ? { ...x, players: rest.slice(0, 11), bench: rest.slice(11) } : x)),
    lineup: s.lineup?.includes(id) ? null : s.lineup,
    career: { ...c, loans: [...(c.loans ?? []), p] },
  }
  // The usual eleven again, in slot order.
  const xi = autoPick(without, s.userTeam).map((q) => rest.find((r) => r.id === q)!)
  return {
    ...without,
    teams: without.teams.map((x, i) => (i === s.userTeam ? { ...x, players: xi, bench: rest.filter((r) => !xi.includes(r)) } : x)),
  }
}

/** The manager's players out on loan. */
export const loansOf = (s: Season): PlayerDef[] => s.career?.loans ?? []
