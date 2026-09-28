/**
 * The season in review, beyond the table: who stood out and why, who did the work nobody sees,
 * who beat or fell short of his chances, and the matches worth remembering. Pure.
 */
import { FORMATIONS, type PlayerDef, type Role } from '../engine/index.ts'
import { ratingGroup } from '../viewer/players.ts'
import { type Fixture, type Season, type SeasonStats, avgRating, squadOf, squadRating, table } from './season.ts'
import { count, goalsPrevented, onTargetRate } from './stats.ts'
import { ordinal } from '../screens/format.ts'

export interface Standout {
  player: PlayerDef
  club: number
  st: SeasonStats
  avg: number
  /** Why he's here, in a line. */
  line: string
}

export interface NotableGame {
  fixture: Fixture
  /** What made it: "Came from 2–0 down", "Won it in the 94th minute". */
  why: string
}

export interface Review {
  playerOfSeason: Standout | null
  /** Best by average rating in a 4-3-3, in its slot order (FORMATIONS['4-3-3']). */
  teamOfSeason: Standout[]
  /** Your side: the best, the one who did the unglamorous work, the ever-present, the one below par. */
  yours: { title: string; who: Standout }[]
  /** Across the league: finishing, creating, defending, keeping. */
  singledOut: { title: string; who: Standout }[]
  games: NotableGame[]
}

const avgOf = (st: SeasonStats): number => avgRating(st) ?? 0
const signed = (v: number): string => (v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1))
const per90 = (v: number, st: SeasonStats): number => (v / Math.max(1, count(st, 'minutes'))) * 90

/** What a player's season was, in a few numbers suited to his position. */
export function seasonLine(p: PlayerDef, st: SeasonStats, rate: number): string {
  const bits = [`${avgOf(st).toFixed(2)} avg`, `${st.apps} apps`]
  const g = ratingGroup(p.role)
  if (g === 'GK') {
    bits.push(`${count(st, 'cleanSheets')} clean sheets`, `${signed(goalsPrevented(st, rate))} goals prevented`)
  } else if (g === 'DEF' || g === 'DM') {
    bits.push(`${per90(count(st, 'tackles') + count(st, 'interceptions'), st).toFixed(1)} tackles + interceptions per 90`)
    if (count(st, 'blocks') + count(st, 'clearances') > 0) bits.push(`${count(st, 'blocks')} blocks, ${count(st, 'clearances')} clearances`)
    if (st.goals + st.assists) bits.push(`${st.goals} G, ${st.assists} A`)
  } else {
    bits.push(`${st.goals} goals (${count(st, 'xg').toFixed(1)} xG)`, `${st.assists} assists (${count(st, 'xa').toFixed(1)} xA)`)
  }
  return bits.join(' · ')
}

/** The winning side's position in the table at the end, 0-based, for "beat the champions". */
const rankOf = (s: Season): Map<number, number> => new Map(table(s).map((r, i) => [r.team, i]))

/** Minute of a clock like "90+3'": 93. */
const minuteOf = (clock: string): number => {
  const [base, extra] = clock.replace("'", '').split('+')
  return Number(base) + (Number(extra) || 0)
}

export function review(s: Season): Review {
  const played = Math.max(1, s.matchday - 1)
  const rate = onTargetRate(s)
  const all: Standout[] = []
  s.teams.forEach((t, club) => {
    for (const player of squadOf(t)) {
      const st = s.stats[player.id]
      if (!st?.apps) continue
      all.push({ player, club, st, avg: avgOf(st), line: seasonLine(player, st, rate) })
    }
  })
  // Regulars: at least half the minutes on offer.
  const regulars = all.filter((x) => count(x.st, 'minutes') >= played * 45)
  const byAvg = [...regulars].sort((a, b) => b.avg - a.avg)

  // Team of the season: a 4-3-3 of the best-rated regulars, each in his own position if he can
  // be (a striker up front, wingers wide), otherwise the nearest one.
  const slots = FORMATIONS['4-3-3'].map((slot) => slot.role)
  const nearest: Record<Role, Role[]> = {
    GK: ['GK'],
    CB: ['CB', 'FB', 'DM'],
    FB: ['FB', 'WM', 'CB'],
    DM: ['DM', 'CM', 'CB'],
    CM: ['CM', 'DM', 'WM'],
    WM: ['WM', 'W', 'CM'],
    W: ['W', 'WM', 'ST'],
    ST: ['ST', 'W'],
  }
  const chosen = new Set<string>()
  const teamOfSeason: Standout[] = []
  for (const role of slots) {
    const pick = nearest[role].map((r) => byAvg.find((x) => x.player.role === r && !chosen.has(x.player.id))).find(Boolean)
    if (!pick) break
    chosen.add(pick.player.id)
    teamOfSeason.push(pick)
  }

  // Your side.
  const mine = regulars.filter((x) => x.club === s.userTeam)
  const mineAll = all.filter((x) => x.club === s.userTeam)
  const yours: Review['yours'] = []
  const star = [...mine].sort((a, b) => b.avg - a.avg)[0]
  if (star) yours.push({ title: 'Star performer', who: star })
  // The unsung hero: the best of those whose work doesn't show up as goals and assists.
  const unsung = [...mine]
    .filter((x) => x !== star && x.st.goals + x.st.assists <= Math.max(3, x.st.apps / 8))
    .sort((a, b) => b.avg - a.avg)[0]
  if (unsung) yours.push({ title: 'Unsung hero', who: unsung })
  const everPresent = [...mineAll].sort((a, b) => count(b.st, 'minutes') - count(a.st, 'minutes'))[0]
  if (everPresent && everPresent !== star && everPresent !== unsung)
    yours.push({ title: 'Ever-present', who: { ...everPresent, line: `${count(everPresent.st, 'minutes')} minutes · ${everPresent.line}` } })
  // Below par: the regular furthest under what his overall promised.
  const expected = (x: Standout): number => 6.75 + ((x.player.overall ?? 75) - 80) * 0.03
  const belowPar = [...mine].sort((a, b) => a.avg - expected(a) - (b.avg - expected(b)))[0]
  if (belowPar && belowPar.avg < expected(belowPar) - 0.1 && !yours.some((y) => y.who.player === belowPar.player))
    yours.push({ title: 'Below par', who: belowPar })

  // Across the league.
  const singledOut: Review['singledOut'] = []
  const top = (title: string, list: Standout[], value: (x: Standout) => number, line: (x: Standout) => string, min = 0): void => {
    const best = [...list].sort((a, b) => value(b) - value(a))[0]
    if (best && value(best) > min) singledOut.push({ title, who: { ...best, line: line(best) } })
  }
  const np = (x: Standout): number => x.st.goals - count(x.st, 'penGoals') - count(x.st, 'npxg')
  top('Most clinical', all, np, (x) => `${x.st.goals - count(x.st, 'penGoals')} non-penalty goals from ${count(x.st, 'npxg').toFixed(1)} xG (${signed(np(x))})`, 1)
  top('Most wasteful', all, (x) => -np(x), (x) => `${x.st.goals - count(x.st, 'penGoals')} non-penalty goals from ${count(x.st, 'npxg').toFixed(1)} xG (${signed(np(x))})`, 1)
  top('Chief creator', all, (x) => count(x.st, 'xa'), (x) => `${count(x.st, 'xa').toFixed(1)} xA, ${count(x.st, 'keyPasses')} chances created, ${x.st.assists} assists`)
  top(
    'The wall',
    regulars.filter((x) => x.player.role !== 'GK'),
    (x) => per90(count(x.st, 'tackles') + count(x.st, 'interceptions') + count(x.st, 'blocks'), x.st),
    (x) => `${per90(count(x.st, 'tackles') + count(x.st, 'interceptions') + count(x.st, 'blocks'), x.st).toFixed(1)} tackles, interceptions and blocks per 90`,
  )
  top(
    'Best keeper',
    regulars.filter((x) => x.player.role === 'GK'),
    (x) => goalsPrevented(x.st, rate) + 100,
    (x) => `${signed(goalsPrevented(x.st, rate))} goals prevented, ${count(x.st, 'cleanSheets')} clean sheets`,
  )

  return { playerOfSeason: byAvg[0] ?? null, teamOfSeason, yours, singledOut, games: notableGames(s) }
}

/** The matches worth remembering: yours first, then the league's. */
export function notableGames(s: Season): NotableGame[] {
  const rank = rankOf(s)
  const games: (NotableGame & { weight: number })[] = []
  const strength = s.teams.map(squadRating)
  const margin = (f: Fixture): number => (f.result ? (f.home === s.userTeam ? -1 : 1) * (f.result.score[0] - f.result.score[1]) : 0)
  const heaviest = Math.max(0, ...s.fixtures.filter((f) => f.home === s.userTeam || f.away === s.userTeam).map(margin))
  for (const f of s.fixtures) {
    const r = f.result
    if (!r) continue
    const [h, a] = r.score
    const winner = h > a ? f.home : a > h ? f.away : null
    const loser = winner === f.home ? f.away : winner === f.away ? f.home : null
    const mine = f.home === s.userTeam || f.away === s.userTeam
    const add = (why: string, weight: number): void => {
      games.push({ fixture: f, why, weight: weight + (mine ? 100 : 0) })
    }
    // A comeback: behind by two or more at some point, and won it.
    let lead = 0
    let worst = 0
    let equaliserMinute = 0
    let lastGoal = { team: -1, minute: 0, decisive: false }
    for (const g of r.goals) {
      lead += g.team === 0 ? 1 : -1
      const winnerSide = winner === f.home ? 0 : winner === f.away ? 1 : null
      if (winnerSide !== null) worst = Math.max(worst, winnerSide === 0 ? -lead : lead)
      if (lead === 0) equaliserMinute = minuteOf(g.clock)
      lastGoal = { team: g.team, minute: minuteOf(g.clock), decisive: Math.abs(lead) === 1 }
    }
    if (winner !== null && worst >= 2) add(`${s.teams[winner].name} came from ${worst} down to win`, 50 + worst * 10)
    const winnerSide = winner === f.home ? 0 : 1
    if (winner !== null && lastGoal.team === winnerSide && lastGoal.decisive && lastGoal.minute >= 88) add(`${s.teams[winner].shortName} won it in the ${ordinal(lastGoal.minute)} minute`, 40)
    else if (winner === null && equaliserMinute >= 88) add(`Levelled in the ${ordinal(equaliserMinute)} minute`, 30)
    if (h + a >= 7) add(`${h + a} goals`, 20 + h + a)
    if (winner !== null && Math.abs(h - a) >= 5) add(`A ${Math.abs(h - a)}-goal win`, 25 + Math.abs(h - a))
    if (winner !== null && loser !== null && strength[loser] - strength[winner] >= 5)
      add(`An upset: ${strength[winner]}-rated ${s.teams[winner].shortName} beat ${strength[loser]}-rated ${s.teams[loser].shortName}`, 30 + strength[loser] - strength[winner])
    if (mine && winner === s.userTeam && loser !== null && rank.get(loser) === 0) add(`Beat the champions`, 35)
    if (mine && loser === s.userTeam && Math.abs(h - a) >= 3 && Math.abs(h - a) === heaviest) add('Your heaviest defeat', 20 + Math.abs(h - a))
  }
  // One reason per match (its best), and a handful of matches.
  const best = new Map<number, NotableGame & { weight: number }>()
  for (const g of games) if (!best.has(g.fixture.id) || best.get(g.fixture.id)!.weight < g.weight) best.set(g.fixture.id, g)
  return [...best.values()].sort((a, b) => b.weight - a.weight).slice(0, 8)
}
