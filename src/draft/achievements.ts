/**
 * Achievements and the legends album (session 38, draft runs). Achievements are worked out from a
 * finished season (and what earlier runs won, for the few that add up over runs); the album keeps
 * every player who won something with you. Pure: the screens keep them in this browser
 * (screens/Trophies.tsx), so they last across runs without the save.
 */
import { isOver, matchdays, squadOf, table, tipsOf, type Season } from '../season/season.ts'
import { clubRecords } from '../season/stats.ts'
import { honours } from '../season/review.ts'
import { starsOf, starsPossible } from './goals.ts'
import { cupLive, cupWinner } from './cup.ts'
import { draftEyebrow } from './draft.ts'

export interface Achievement {
  id: string
  name: string
  /** How to get it. */
  blurb: string
}

/** What a finished season did, for the checks. */
export interface RunFacts {
  place: number
  points: number
  champion: boolean
  lost: number
  goalsFor: number
  goalsAgainst: number
  /** Goals a match scaled to a 38-match season, for targets set on 38. */
  scale: number
  tip: number
  stars: number
  of: number
  cupWon: boolean
  topScorer: number
  /** Most goals by one of his men in a match. */
  bestHaul: number
  biggestWin: number
  comeback: boolean
  theme?: string
  budget: boolean
  rules: string[]
  difficulty: string
  daily: boolean
  /** Titles in a row in this dynasty, this one included (0 if not champions). */
  titlesInRow: number
  /** What the run was played in, as the runs record names it (a league or a theme). */
  where: string
}

export const ACHIEVEMENTS: (Achievement & { test: (f: RunFacts, titlesIn: Set<string>) => boolean })[] = [
  { id: 'champions', name: 'Champions', blurb: 'Win a draft league', test: (f) => f.champion },
  { id: 'invincibles', name: 'Invincibles', blurb: 'Win the league without losing a match', test: (f) => f.champion && f.lost === 0 },
  { id: 'centurions', name: 'Centurions', blurb: 'Take 100 points in a season', test: (f) => f.points >= Math.round(100 * f.scale) },
  { id: 'fortress', name: 'Fortress', blurb: 'Concede 20 league goals or fewer', test: (f) => f.goalsAgainst <= Math.round(20 * f.scale) },
  { id: 'goal-machine', name: 'Goal machine', blurb: 'Score 110 league goals', test: (f) => f.goalsFor >= Math.round(110 * f.scale) },
  { id: 'thirty', name: 'Thirty-goal man', blurb: 'Have a player score 30 league goals', test: (f) => f.topScorer >= Math.round(30 * f.scale) },
  { id: 'haul', name: 'Haul', blurb: 'Have a player score four in a match', test: (f) => f.bestHaul >= 4 },
  { id: 'six', name: 'Six of the best', blurb: 'Win a league match by six goals', test: (f) => f.biggestWin >= 6 },
  { id: 'comeback', name: 'Comeback', blurb: 'Win a match from two goals down', test: (f) => f.comeback },
  { id: 'overachiever', name: 'Punching above', blurb: 'Finish five places above where you were tipped', test: (f) => f.tip - f.place >= 5 },
  { id: 'underdogs', name: 'Underdog story', blurb: 'Win the league with an Underdogs draft', test: (f) => f.champion && f.theme === 'underdogs' },
  { id: 'no-stars', name: 'No stars needed', blurb: 'Win the league with a No stars draft', test: (f) => f.champion && f.theme === 'no-stars' },
  { id: 'old-school', name: 'Old school', blurb: 'Win the league with a 2000s draft', test: (f) => f.champion && f.theme === 'era-2000' },
  { id: 'shoestring', name: 'Shoestring', blurb: 'Win the league with a budget draft', test: (f) => f.champion && f.budget },
  { id: 'blindfold', name: 'Blindfold', blurb: 'Win the league with the Blind rule', test: (f) => f.champion && f.rules.includes('blind') },
  { id: 'one-star', name: 'One and only', blurb: 'Win the league with the One star rule', test: (f) => f.champion && f.rules.includes('oneStar') },
  { id: 'hard', name: 'Hard as nails', blurb: 'Win the league on Hard', test: (f) => f.champion && f.difficulty === 'hard' },
  { id: 'three-stars', name: 'Star turn', blurb: 'Earn three stars in a run', test: (f) => f.stars >= 3 },
  { id: 'four-stars', name: 'Perfect run', blurb: 'Earn all four stars on Hard', test: (f) => f.stars >= 4 },
  { id: 'daily', name: 'Daily habit', blurb: 'Finish a daily draft in the top four', test: (f) => f.daily && f.place <= 4 },
  { id: 'europe', name: 'Kings of Europe', blurb: 'Win the European Cup', test: (f) => f.cupWon },
  { id: 'double', name: 'The double', blurb: 'Win the league and the European Cup in one season', test: (f) => f.cupWon && f.champion },
  { id: 'back-to-back', name: 'Back to back', blurb: 'Keep the title in a dynasty', test: (f) => f.titlesInRow >= 2 },
  { id: 'dynasty', name: 'Dynasty', blurb: 'Win three titles in a row in a dynasty', test: (f) => f.titlesInRow >= 3 },
  { id: 'grand-tour', name: 'Grand tour', blurb: 'Win titles in three different leagues or themes', test: (f, titles) => new Set([...titles, ...(f.champion ? [f.where] : [])]).size >= 3 },
]

/** What the run was played in: its league or theme (budget, daily and rules aside). */
export const whereOf = (s: Season): string => draftEyebrow({ league: s.league, theme: s.draftStyle?.theme }).replace(/^Draft · /, '')

/** Whether the season (and its cup, if it had one) is over, so its achievements can be judged. */
export const runOver = (s: Season): boolean => s.mode === 'draft' && isOver(s) && !cupLive(s)

/** The facts of a finished draft season. */
export function runFacts(s: Season): RunFacts {
  const rows = table(s)
  const place = rows.findIndex((r) => r.team === s.userTeam) + 1
  const rec = clubRecords(s)[s.userTeam]
  const me = s.userTeam
  let bestHaul = 0
  let comeback = false
  for (const f of s.fixtures) {
    const r = f.result
    if (!r || (f.home !== me && f.away !== me)) continue
    const side = f.home === me ? 0 : 1
    const ids = new Set(squadOf(s.teams[me]).map((p) => p.id))
    for (const a of r.appearances) if (ids.has(a.id)) bestHaul = Math.max(bestHaul, a.goals)
    if (r.score[side] > r.score[1 - side]) {
      let lead = 0
      for (const g of r.goals) {
        lead += g.team === side ? 1 : -1
        if (lead <= -2) comeback = true
      }
    }
  }
  const champion = place === 1
  const past = s.dynasty?.past ?? []
  let inRow = champion ? 1 : 0
  for (let i = past.length - 1; champion && i >= 0 && past[i].place === 1; i--) inRow++
  return {
    place,
    points: rows[place - 1].points,
    champion,
    lost: rec.lost,
    goalsFor: rec.goalsFor,
    goalsAgainst: rec.goalsAgainst,
    scale: matchdays(s) / 38,
    tip: (s.tips ?? tipsOf(s))[me],
    stars: starsOf(s),
    of: starsPossible(s),
    cupWon: !!s.cup && cupWinner(s.cup) === me,
    topScorer: rec.topScorer?.goals ?? 0,
    bestHaul,
    biggestWin: rec.biggestWin ? rec.biggestWin.for - rec.biggestWin.against : 0,
    comeback,
    theme: s.draftStyle?.theme,
    budget: s.draftStyle?.budget !== undefined,
    rules: s.draftStyle?.rules ?? [],
    difficulty: s.draftStyle?.difficulty ?? 'normal',
    daily: !!s.draftStyle?.daily,
    titlesInRow: inRow,
    where: whereOf(s),
  }
}

/** The achievements a finished season earns (`titlesIn`: where earlier runs won titles). */
export function earned(s: Season, titlesIn: Set<string>): string[] {
  const f = runFacts(s)
  return ACHIEVEMENTS.filter((a) => a.test(f, titlesIn)).map((a) => a.id)
}

/** A legend: a player who won something with you, over every run. */
export interface Legend {
  name: string
  role: string
  /** His best overall with you. */
  overall: number
  titles: number
  cups: number
  /** Season awards, as "Golden Boot · Backseat XI". */
  awards: string[]
  /** Runs he won something in. */
  runs: number
}

/**
 * The season's legends: his season-award winners, and if he won the league or the cup, everyone who
 * started at least a third of the league matches. Returned as album entries for this run alone.
 */
export function seasonLegends(s: Season): Legend[] {
  const me = s.userTeam
  const f = runFacts(s)
  const team = s.teams[me]
  const out = new Map<string, Legend>()
  const entry = (name: string, role: string, overall: number): Legend => {
    const was = out.get(name) ?? { name, role, overall, titles: 0, cups: 0, awards: [], runs: 1 }
    out.set(name, was)
    return was
  }
  for (const a of honours(s).awards) if (a.who.club === me) entry(a.who.player.name, a.who.player.role, a.who.player.overall ?? 0).awards.push(`${a.title} · ${team.name}`)
  if (f.champion || f.cupWon) {
    const regulars = squadOf(team).filter((p) => (s.stats[p.id]?.starts ?? 0) >= matchdays(s) / 3)
    for (const p of regulars) {
      const l = entry(p.name, p.role, p.overall ?? 0)
      if (f.champion) l.titles++
      if (f.cupWon) l.cups++
    }
  }
  return [...out.values()]
}

/** The album with a run's legends added (by name: a man's honours add up across runs). */
export function addLegends(album: Legend[], legends: Legend[]): Legend[] {
  const by = new Map(album.map((l) => [l.name, { ...l, awards: [...l.awards] }]))
  for (const l of legends) {
    const was = by.get(l.name)
    if (!was) by.set(l.name, { ...l, awards: [...l.awards] })
    else {
      was.overall = Math.max(was.overall, l.overall)
      was.titles += l.titles
      was.cups += l.cups
      was.awards.push(...l.awards)
      was.runs += 1
    }
  }
  return [...by.values()].sort(legendOrder)
}

/** Most decorated first: titles and cups, then awards, then overall. */
export const legendOrder = (a: Legend, b: Legend): number =>
  b.titles + b.cups - (a.titles + a.cups) || b.awards.length - a.awards.length || b.overall - a.overall || a.name.localeCompare(b.name)
