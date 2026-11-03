/**
 * The European cup (draft mode): after the league, its top four and twelve club-seasons from the
 * other four leagues (three each) play a knockout. Last 16, quarter-finals and semi-finals over
 * two legs, then a one-off final; level on aggregate after the second leg (or in the final) goes
 * to extra time and penalties. One round a matchday, weekly after the league: the last 16 drawn at
 * random, then a fixed bracket.
 * Cup matches don't count in the league's player stats; fitness and injuries carry on as usual.
 */
import { Rng, type MatchConfig, type TeamDef } from "../engine/index.ts";
import {
  type Cup,
  type CupFixture,
  type CupSide,
  GUEST,
  type Result,
  type Season,
  isOver,
  matchTeam,
  matchdays,
  recover,
  squadRating,
  table,
} from "../season/season.ts";
import { LEAGUES, leagueOf, poolName, poolTeam, themeOf, themePools } from "./draft.ts";
import { POOLS } from "./pools.ts";

export const CUP_NAME = "European Cup";
export const ROUND_NAMES = ["Last 16", "Quarter-final", "Semi-final", "Final"];
/** The rounds as headings. */
export const ROUND_TITLES = [
  "Last 16",
  "Quarter-finals",
  "Semi-finals",
  "Final",
];
const ROUNDS = ROUND_NAMES.length;
/** Places in the league that qualify. */
export const CUP_PLACES = 4;
/** Guests from each of the other leagues. */
const PER_LEAGUE = 3;

export const cupTeam = (s: Season, side: CupSide): TeamDef =>
  side >= GUEST ? s.cup!.guests[side - GUEST] : s.teams[side];

/** The side as it takes the field: a league club's picked eleven, a guest as it is. */
export const cupMatchTeam = (s: Season, side: CupSide): TeamDef =>
  side >= GUEST ? s.cup!.guests[side - GUEST] : matchTeam(s, side);

export const isCupDay = (s: Season): boolean =>
  !!s.cup && s.matchday > matchdays(s);

/** The cup's fixtures on the current matchday. */
export const cupFixturesToday = (s: Season): CupFixture[] =>
  s.cup ? s.cup.fixtures.filter((f) => f.matchday === s.matchday) : [];

export const userCupFixture = (s: Season): CupFixture | undefined =>
  cupFixturesToday(s).find(
    (f) => f.home === s.userTeam || f.away === s.userTeam,
  );

/** How the engine plays a cup match: a first leg is an ordinary match; a second leg or the final must have a winner. */
export function cupConfig(s: Season, f: CupFixture): MatchConfig["knockout"] {
  if (f.leg === 1) return undefined;
  if (f.leg === 0) return {};
  const first = s.cup!.fixtures.find(
    (g) => g.round === f.round && g.tie === f.tie && g.leg === 1,
  )!;
  // The second leg's home side was away in the first.
  return { carried: [first.result!.score[1], first.result!.score[0]] };
}

/** Who went through, once a tie is played. */
export function tieWinner(
  cup: Cup,
  round: number,
  tie: number,
): CupSide | null {
  const legs = cup.fixtures.filter((f) => f.round === round && f.tie === tie);
  const decider = legs.find((f) => f.leg !== 1);
  if (!decider?.result) return null;
  const goals = new Map<CupSide, number>();
  for (const f of legs) {
    goals.set(f.home, (goals.get(f.home) ?? 0) + f.result!.score[0]);
    goals.set(f.away, (goals.get(f.away) ?? 0) + f.result!.score[1]);
  }
  const [a, b] = [decider.home, decider.away];
  if (goals.get(a)! !== goals.get(b)!)
    return goals.get(a)! > goals.get(b)! ? a : b;
  const pens = decider.result.pens!;
  return pens[0] > pens[1] ? a : b;
}

export const cupWinner = (cup: Cup): CupSide | null =>
  tieWinner(cup, ROUNDS - 1, 0);

/** Still going: the cup has started and the final hasn't been played. */
export const cupLive = (s: Season): boolean =>
  !!s.cup && cupWinner(s.cup) === null;

/** Still in it, or won it: no tie he's played has gone against him. */
export function userInCup(s: Season): boolean {
  const cup = s.cup;
  if (!cup || !cup.entrants.includes(s.userTeam)) return false;
  return cup.fixtures.every(
    (f) =>
      f.leg === 2 ||
      (f.home !== s.userTeam && f.away !== s.userTeam) ||
      [null, s.userTeam].includes(tieWinner(cup, f.round, f.tie)),
  );
}

/** Fixtures for a round: pairs of sides in order, two legs each (the final, one match). */
function drawRound(
  s: Season,
  cup: Cup,
  round: number,
  sides: CupSide[],
  firstMatchday: number,
): CupFixture[] {
  const out: CupFixture[] = [];
  let id = cup.fixtures.length;
  for (let tie = 0; tie * 2 < sides.length; tie++) {
    const [a, b] = [sides[tie * 2], sides[tie * 2 + 1]];
    const seed = (n: number): number => s.seed * 7919 + 9_000_000 + n * 104729;
    if (round === ROUNDS - 1) {
      out.push({
        id,
        round,
        tie,
        leg: 0,
        matchday: firstMatchday,
        home: a,
        away: b,
        seed: seed(id),
        result: null,
      });
      id++;
    } else {
      out.push({
        id,
        round,
        tie,
        leg: 1,
        matchday: firstMatchday,
        home: a,
        away: b,
        seed: seed(id),
        result: null,
      });
      id++;
      out.push({
        id,
        round,
        tie,
        leg: 2,
        matchday: firstMatchday + 1,
        home: b,
        away: a,
        seed: seed(id),
        result: null,
      });
      id++;
    }
  }
  return out;
}

/**
 * Twelve guests: for each other league, three club-seasons from its stronger half, all different
 * clubs. Nobody already playing in the league turns up again.
 */
function pickGuests(s: Season, rng: Rng): TeamDef[] {
  const taken = new Set(
    s.teams.flatMap((t) => [...t.players, ...t.bench].map((p) => p.name)),
  );
  const theme = themeOf(s.draftStyle?.theme);
  if (theme) return themedGuests(s, rng, taken, themePools(theme), theme.id);
  const home = s.league ?? "Premier League";
  const guests: TeamDef[] = [];
  for (const league of LEAGUES.filter((l) => l !== home)) {
    const pools = POOLS.flatMap((p, i) => (leagueOf(p) === league ? [i] : []));
    const strength = new Map(
      pools.map((i) => [i, squadRating(poolTeam(i, new Set(), POOLS[i].formation, undefined, false))]),
    );
    const strong = [...pools]
      .sort((a, b) => strength.get(b)! - strength.get(a)!)
      .slice(0, Math.ceil(pools.length / 2));
    const clubs = new Set<string>();
    for (const i of rng.shuffle(strong)) {
      if (clubs.has(POOLS[i].club) || clubs.size >= PER_LEAGUE) continue;
      clubs.add(POOLS[i].club);
      const team = poolTeam(i, taken);
      for (const p of [...team.players, ...team.bench]) taken.add(p.name);
      guests.push(team);
    }
  }
  return guests;
}

/**
 * A themed league is of all five leagues already: its twelve guests are club-seasons of the theme
 * from the stronger half, of clubs not in the league, all different.
 */
function themedGuests(
  s: Season,
  rng: Rng,
  taken: Set<string>,
  pools: number[],
  theme: string,
): TeamDef[] {
  const inLeague = new Set(s.teams.map((t) => t.name));
  const clubs = new Set(
    pools.filter((i) => inLeague.has(poolName(POOLS[i]))).map((i) => POOLS[i].club),
  );
  const strength = new Map(
    pools.map((i) => [i, squadRating(poolTeam(i, new Set(), POOLS[i].formation, theme, false))]),
  );
  const strong = pools
    .filter((i) => !clubs.has(POOLS[i].club))
    .sort((a, b) => strength.get(b)! - strength.get(a)!)
    .slice(0, Math.ceil(pools.length / 2));
  const guests: TeamDef[] = [];
  for (const i of rng.shuffle(strong)) {
    if (clubs.has(POOLS[i].club) || guests.length >= PER_LEAGUE * 4) continue;
    clubs.add(POOLS[i].club);
    const team = poolTeam(i, taken, POOLS[i].formation, theme);
    for (const p of [...team.players, ...team.bench]) taken.add(p.name);
    guests.push(team);
  }
  return guests;
}

/**
 * Called after each matchday. Once the league is over: a draft side in the top four starts the
 * cup; after each round, the next is drawn from its winners.
 */
export function advanceCup(s: Season): Season {
  if (s.mode !== "draft" || !isOver(s) || LEAGUES.length < 2) return s;
  const rng = new Rng(s.seed * 31 + 7 + (s.cup?.fixtures.length ?? 0));
  if (!s.cup) {
    const top = table(s)
      .slice(0, CUP_PLACES)
      .map((r) => r.team);
    if (!top.includes(s.userTeam)) return s;
    const guests = pickGuests(s, rng);
    const entrants = rng.shuffle([...top, ...guests.map((_, i) => GUEST + i)]);
    const cup: Cup = { guests, entrants, fixtures: [] };
    cup.fixtures = drawRound(s, cup, 0, entrants, s.matchday);
    return { ...s, cup };
  }
  const cup = s.cup;
  const round = Math.max(...cup.fixtures.map((f) => f.round));
  if (
    round === ROUNDS - 1 ||
    cup.fixtures.some((f) => f.round === round && !f.result)
  )
    return s;
  const winners = Array.from(
    {
      length: cup.fixtures.filter((f) => f.round === round && f.leg !== 2)
        .length,
    },
    (_, tie) => tieWinner(cup, round, tie)!,
  );
  // A fixed bracket: the winners of ties 1 and 2 meet, and so on.
  const fixtures = [
    ...cup.fixtures,
    ...drawRound(s, cup, round + 1, winners, s.matchday),
  ];
  return { ...s, cup: { ...cup, fixtures } };
}

/** Record a cup matchday's results (fitness and injuries carry on; league stats don't change). */
export function completeCupMatchday(
  s: Season,
  results: Map<number, Result>,
): Season {
  const cup = s.cup!;
  const today = cupFixturesToday(s);
  for (const f of today)
    if (!results.has(f.id))
      throw new Error(`no result for cup fixture ${f.id}`);
  const next: Season = {
    ...s,
    condition: recover(s, [...results.values()]),
    cup: {
      ...cup,
      fixtures: cup.fixtures.map((f) =>
        f.matchday === s.matchday ? { ...f, result: results.get(f.id)! } : f,
      ),
    },
    matchday: s.matchday + 1,
  };
  return advanceCup(next);
}

/** Cup fixtures as matches for the engine. */
export const cupMatches = (s: Season, fixtures: CupFixture[]) =>
  fixtures.map((f) => ({
    id: f.id,
    home: cupMatchTeam(s, f.home),
    away: cupMatchTeam(s, f.away),
    seed: f.seed,
    knockout: cupConfig(s, f),
  }));
