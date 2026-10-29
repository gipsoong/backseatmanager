/**
 * Transfer windows. Draft mode: the January window, players only, one or two of yours for one or
 * two of theirs. Career mode: a summer window (August's matchdays) and January, with money: buy,
 * sell, swap, or swap with a fee (money.ts values players and keeps each club's cash). Clubs make
 * offers too. Pure: a deal is judged and applied the same way every time.
 *
 * How a club judges a deal: by what it does to its side, the way a manager would.
 * - Its eleven before and after (the staff pick with the new squad, fitness and injuries counted):
 *   a player who'd walk into their side is worth a lot to them, one who wouldn't get a game little;
 *   losing a starter costs them the gap to whoever replaces him, losing a squad player next to nothing.
 * - A little for depth: the bench's best cover in each line.
 * - They want to come out better, by more if you're a rival near them in the table, and a lot more
 *   to let their best player go.
 */
import {
  FORMATIONS,
  type PlayerDef,
  Rng,
  type Role,
  type Slot,
  fitFor,
} from "../engine/index.ts";
import { shortName } from "../names.ts";
import {
  type Season,
  type Transfer,
  autoPick,
  avgRating,
  isOver,
  matchdayDate,
  matchdays,
  squadOf,
  playerRating,
  table,
} from "../season/season.ts";
import { valueOf } from "../career/money.ts";

/** Deals the manager can make in one window. */
export const DEALS_PER_WINDOW = 3;
/** Players each side can put into one deal. */
export const MAX_PER_SIDE = 2;
/** Squad sizes a deal can leave a club with. */
const MIN_SQUAD = 18;
const MAX_SQUAD = 22;
/** A career squad can hold a few more (the summer trims it back to the academy's cap). */
const CAREER_MAX_SQUAD = 26;
const maxSquad = (s: Season): number =>
  s.career ? CAREER_MAX_SQUAD : MAX_SQUAD;

export interface Deal {
  /** The club you're dealing with. */
  club: number;
  /** Your players going to them, and theirs coming to you (ids). */
  give: string[];
  get: string[];
  /** Career mode: money the manager pays them, £m (below zero, they pay him). */
  fee?: number;
}

/**
 * The matchdays a window is open for: January's in draft mode; August's and January's in a career;
 * none otherwise.
 */
export function windowMatchdays(s: Season): number[] {
  const months = s.mode === "draft" ? [0] : s.career ? [7, 0] : [];
  return Array.from({ length: matchdays(s) }, (_, i) => i + 1).filter((md) =>
    months.includes(matchdayDate(s, md).getUTCMonth()),
  );
}

/** The window a matchday falls in (its matchdays), or none. */
export function windowOf(s: Season, md: number): number[] {
  const all = windowMatchdays(s);
  if (!all.includes(md)) return [];
  const month = matchdayDate(s, md).getUTCMonth();
  return all.filter((d) => matchdayDate(s, d).getUTCMonth() === month);
}

/** "summer" or "January", for the window open now (or the next one). */
export const windowName = (s: Season, md = s.matchday): string =>
  matchdayDate(s, md).getUTCMonth() === 7 ? "summer" : "January";

/** Deals of the window open now (all of them are, in draft mode's one window). */
export const thisWindow = (s: Season): Transfer[] => {
  const w = windowOf(s, s.matchday);
  return (s.transfers ?? []).filter((t) => w.includes(t.matchday));
};

/** Open while the next match to be played is in January. */
export const windowOpen = (s: Season): boolean =>
  !isOver(s) && windowMatchdays(s).includes(s.matchday);

/** Deals done in this season's window. */
export const dealsDone = (s: Season): number =>
  thisWindow(s).filter(
    (t) => t.to.includes(s.userTeam) || t.from.includes(s.userTeam),
  ).length;

const byId = (s: Season, id: string): PlayerDef | undefined =>
  s.teams.flatMap(squadOf).find((p) => p.id === id);

/** A player's worth, for ordering lists: his overall, nudged by his form. */
export function worth(s: Season, p: PlayerDef): number {
  const avg = avgRating(s.stats[p.id]);
  const form =
    avg !== null && (s.stats[p.id]?.apps ?? 0) >= 5 ? (avg - 6.75) * 2 : 0;
  return playerRating(p) + form;
}

/** A club's best eleven from a squad (the staff's pick, fitness and injuries counted), slot by slot. */
export interface Eleven {
  /** The players in formation slot order. */
  xi: PlayerDef[];
  /** Each one's overall as he'd play there (out of position or on the wrong flank counts less). */
  fitted: number[];
  rating: number;
  /** Best cover on the bench for defence, midfield and attack, summed. */
  depth: number;
}

const LINE_OF: Record<Role, number> = {
  GK: 0,
  CB: 0,
  FB: 0,
  DM: 1,
  CM: 1,
  WM: 1,
  W: 2,
  ST: 2,
};

export function elevenOf(
  s: Season,
  club: number,
  squad: PlayerDef[] = squadOf(s.teams[club]),
): Eleven {
  const probe: Season = {
    ...s,
    teams: s.teams.map((t, i) =>
      i === club
        ? { ...t, players: squad.slice(0, 11), bench: squad.slice(11) }
        : t,
    ),
  };
  const slots = FORMATIONS[s.teams[club].formation];
  const xi = autoPick(probe, club).map((id) => squad.find((q) => q.id === id)!);
  const fitted = xi.map((p, i) => playerRating(p) * fitFor(p, slots[i]));
  const bench = squad.filter(
    (p) =>
      !xi.includes(p) &&
      p.role !== "GK" &&
      s.condition[p.id]?.injuredUntil <= s.matchday,
  );
  const depth = [0, 1, 2].reduce(
    (n, line) =>
      n +
      Math.max(
        curveRef(s) - 20,
        ...bench
          .filter((p) => LINE_OF[p.role] === line)
          .map((p) => playerRating(p)),
      ),
    0,
  );
  return { xi, fitted, rating: fitted.reduce((a, b) => a + b, 0) / 11, depth };
}

/**
 * Where a point of overall starts to count for more: 80 among clubs of the past, a career league's
 * own level otherwise.
 */
export function curveRef(s: Season): number {
  const levels = s.career?.levels;
  return levels ? levels.reduce((a, b) => a + b, 0) / levels.length : 80;
}

/** A place's name: "right wing", "centre-back". */
export function placeName(slot: Slot): string {
  const side = slot.y > 40 ? "right " : slot.y < 28 ? "left " : "";
  switch (slot.role) {
    case "GK":
      return "in goal";
    case "CB":
      return "centre-back";
    case "FB":
      return slot.attackDepth > 0.5 ? `${side}wing-back` : `${side}back`;
    case "DM":
      return "holding midfield";
    case "CM":
      return slot.depth >= 0.65 ? "attacking midfield" : "central midfield";
    case "WM":
      return `${side}midfield`;
    case "W":
      return `${side}wing`;
    case "ST":
      return "up front";
  }
}

/** What a deal does to one club: its eleven before and after, what it's worth to them, and why. */
export interface Side {
  club: number;
  before: Eleven;
  after: Eleven;
  /** What the eleven gains, a point near 80 worth about 1 and more higher up, plus a little for depth. */
  value: number;
  /** What they'd want before saying yes, on the same scale. */
  wanted: number;
  /** The deal in their eyes, a line per player and anything else that weighs. */
  reasons: string[];
}

const surnameOf = (p: PlayerDef): string => shortName(p.name);

/** How a deal looks to `club`, which gives up `out` and takes `in`. */
export function sideOf(
  s: Season,
  club: number,
  out: PlayerDef[],
  incoming: PlayerDef[],
): Side {
  const squad = squadOf(s.teams[club]);
  const before = elevenOf(s, club, squad);
  const after = elevenOf(s, club, [
    ...squad.filter((p) => !out.includes(p)),
    ...incoming,
  ]);
  const slots = FORMATIONS[s.teams[club].formation];
  const reasons: string[] = [];
  const you = club === s.userTeam;
  for (const p of incoming) {
    const i = after.xi.indexOf(p);
    if (i < 0)
      reasons.push(`${p.name} wouldn't get in ${you ? "your" : "their"} side.`);
    else {
      const was = before.xi[i];
      reasons.push(
        `${p.name} would start ${placeName(slots[i])} (${Math.round(after.fitted[i])}), ahead of ${surnameOf(was)} (${Math.round(before.fitted[i])}).`,
      );
    }
  }
  for (const p of out) {
    const i = before.xi.indexOf(p);
    if (i < 0)
      reasons.push(`${p.name} is a squad player ${you ? "for you" : "there"}.`);
    else {
      const next = after.xi[i];
      reasons.push(
        `${p.name} starts ${placeName(slots[i])}; ${surnameOf(next)} would take his place (${Math.round(after.fitted[i])}).`,
      );
    }
  }
  // A point at the top is worth more than one lower down: 88 over 85 matters more than 72 over 69.
  const ref = curveRef(s);
  const curve = (e: Eleven): number =>
    e.fitted.reduce((n, f) => n + 10 * 1.12 ** (f - ref), 0);
  const value =
    curve(after) - curve(before) + (after.depth - before.depth) * 0.15;
  let wanted = 1;
  if (!you) {
    const rows = table(s);
    const pos = (c: number): number => rows.findIndex((r) => r.team === c);
    if (Math.abs(pos(club) - pos(s.userTeam)) <= 3 && pos(club) < 6) {
      wanted += 2;
      reasons.push(
        `They're close to you in the table: they won't help a rival cheaply.`,
      );
    }
    const best = [...squad].sort(
      (a, b) => playerRating(b) - playerRating(a),
    )[0];
    if (out.includes(best)) {
      wanted += 3;
      reasons.push(`${best.name} is their best player: it would take a lot.`);
    }
  }
  return { club, before, after, value, wanted, reasons };
}

export interface Verdict {
  ok: boolean;
  /** How keen they are: no, close, yes. */
  interest: "no" | "close" | "yes";
  /** The deal for them, and for you. */
  them: Side | null;
  you: Side | null;
  /** Why it can't be done or what they say, in a line. */
  reason: string;
}

/** Whether the deal can be made at all, and whether they'd take it. */
export function judge(s: Season, deal: Deal): Verdict {
  const none = (reason: string): Verdict => ({
    ok: false,
    interest: "no",
    them: null,
    you: null,
    reason,
  });
  const problem = checkDeal(s, deal);
  if (problem) return none(problem);
  const mine = squadOf(s.teams[s.userTeam]);
  const theirs = squadOf(s.teams[deal.club]);
  const give = deal.give.map((id) => mine.find((p) => p.id === id)!);
  const get = deal.get.map((id) => theirs.find((p) => p.id === id)!);
  const them = sideOf(s, deal.club, get, give);
  const you = sideOf(s, s.userTeam, give, get);
  if (s.career) return judgeForMoney(s, deal, them, you, give, get);
  const gap = them.value - them.wanted;
  const interest = gap >= 0 ? "yes" : gap >= -2.5 ? "close" : "no";
  const reason =
    interest === "yes"
      ? "They would take that."
      : interest === "close"
        ? "Close, but they want a bit more."
        : "Not interested: it doesn't help them.";
  return { ok: interest === "yes", interest, them, you, reason };
}

/** A point of a side's value (sideOf's curve) in £m, as a club weighs what a player does for it. */
export const POINT_VALUE = 0.6;

/**
 * Career mode's verdict: what the deal is worth to them in money. The players' market values, what
 * each does for their eleven, and the fee; against a margin they'd want for letting players go
 * (more for their best player, or to a rival near them in the table).
 */
function judgeForMoney(
  s: Season,
  deal: Deal,
  them: Side,
  you: Side,
  give: PlayerDef[],
  get: PlayerDef[],
): Verdict {
  const price = askingPrice(s, deal, them, give, get);
  const fee = deal.fee ?? 0;
  const gap = fee - price;
  const out = get.reduce((n, p) => n + valueOf(s, p), 0);
  const interest =
    gap >= -0.05 ? "yes" : gap >= -Math.max(1, out * 0.2) ? "close" : "no";
  const cash = s.career!.finance?.cash;
  const theirCash = cash?.[deal.club] ?? Infinity;
  const myCash = cash?.[s.userTeam] ?? Infinity;
  if (fee > myCash + 0.05)
    return { ok: false, interest, them, you, reason: "You don't have the money." };
  if (-fee > theirCash + 0.05)
    return { ok: false, interest: "no", them, you, reason: "They can't afford that." };
  const reason =
    interest === "yes"
      ? "They would take that."
      : price > 0
        ? `They'd want ${moneyLine(price)} for that.`
        : `They'd pay up to ${moneyLine(-price)}.`;
  return { ok: interest === "yes", interest, them, you, reason };
}

const moneyLine = (v: number): string =>
  v >= 1 ? `£${v.toFixed(v >= 10 ? 0 : 1)}m` : `£${Math.round(v * 1000)}k`;

/**
 * The smallest fee (£m the manager pays; below zero, the most they'd pay him) at which they'd say
 * yes: what they give up in value and margin, less what they get.
 */
export function askingPrice(
  s: Season,
  deal: Deal,
  them: Side = sideOf(
    s,
    deal.club,
    deal.get.map((id) => byId(s, id)!),
    deal.give.map((id) => byId(s, id)!),
  ),
  give: PlayerDef[] = deal.give.map((id) => byId(s, id)!),
  get: PlayerDef[] = deal.get.map((id) => byId(s, id)!),
): number {
  const out = get.reduce((n, p) => n + valueOf(s, p), 0);
  const inn = give.reduce((n, p) => n + valueOf(s, p), 0);
  // What players coming in do for them counts for less than what they'd fetch elsewhere.
  const margin = out * 0.15 + (them.wanted - 1) * out * 0.1;
  const price = out - inn * 0.8 + margin - them.value * POINT_VALUE;
  // A sale: they pay at most what the player's worth to them, never more than his value and a half.
  return Math.round(Math.max(price, -inn * 1.5) * 10) / 10;
}

/** Why a deal can't be made at all, or null if it can be put to them. */
function checkDeal(s: Season, deal: Deal): string | null {
  if (!windowOpen(s)) return "The window is shut.";
  if (dealsDone(s) >= DEALS_PER_WINDOW)
    return `That's ${DEALS_PER_WINDOW} deals this window, the most you can do.`;
  if (deal.club === s.userTeam) return "Pick another club.";
  const money = !!s.career && (deal.fee ?? 0) !== 0;
  if (!deal.give.length && !deal.get.length)
    return "Choose who you want and who you offer.";
  if ((!deal.give.length || !deal.get.length) && !money)
    return s.career
      ? "Add a fee, or a player each way."
      : "Choose who you want and who you offer.";
  if (deal.give.length > MAX_PER_SIDE || deal.get.length > MAX_PER_SIDE)
    return `At most ${MAX_PER_SIDE} players each way.`;
  if (
    thisWindow(s).some(
      (t) =>
        (t.from.includes(deal.club) || t.to.includes(deal.club)) &&
        (t.from.includes(s.userTeam) || t.to.includes(s.userTeam)),
    )
  )
    return `You've already done a deal with ${s.teams[deal.club].name} this window.`;
  const mine = squadOf(s.teams[s.userTeam]);
  const theirs = squadOf(s.teams[deal.club]);
  const give = deal.give.map((id) => mine.find((p) => p.id === id));
  const get = deal.get.map((id) => theirs.find((p) => p.id === id));
  if (give.some((p) => !p) || get.some((p) => !p))
    return "Those players have moved on.";
  const moved = new Set(thisWindow(s).flatMap((t) => t.ids));
  const already = [...give, ...get].find((p) => moved.has(p!.id));
  if (already) return `${already.name} has already moved this window.`;
  const mineAfter = mine.length - give.length + get.length;
  const theirsAfter = theirs.length - get.length + give.length;
  if (mineAfter < MIN_SQUAD || theirsAfter < MIN_SQUAD)
    return `Both squads need at least ${MIN_SQUAD} players.`;
  if (mineAfter > maxSquad(s) || theirsAfter > maxSquad(s))
    return `Squads can't go over ${maxSquad(s)} players.`;
  const keepers = (ps: (PlayerDef | undefined)[]): number =>
    ps.filter((p) => p!.role === "GK").length;
  if (
    keepers(mine) - keepers(give) + keepers(get) < 1 ||
    keepers(theirs) - keepers(get) + keepers(give) < 1
  )
    return "Both sides need a goalkeeper.";
  return null;
}

/** A club's weakest places: where its eleven is furthest below its own level. */
export function needs(
  s: Season,
  club: number,
): { slot: Slot; player: PlayerDef; fitted: number }[] {
  const e = elevenOf(s, club);
  const slots = FORMATIONS[s.teams[club].formation];
  return e.xi
    .map((player, i) => ({ slot: slots[i], player, fitted: e.fitted[i] }))
    .filter((x) => x.fitted < e.rating - 3)
    .sort((a, b) => a.fitted - b.fitted)
    .slice(0, 3);
}

// ---------------------------------------------------------------------------
// Offers from other clubs

/** At most this many offers come in each window matchday. */
const OFFERS_PER_MATCHDAY = 2;

/**
 * Offers the other clubs make for your players this matchday: each club looks for one of your
 * players who'd improve its side most, and offers what it can spare that you might want. Only
 * offers they'd stand by (judged as if you'd proposed it) and that do something for you too.
 * The same season state always gives the same offers.
 */
export function offersFor(s: Season): Deal[] {
  if (!windowOpen(s) || dealsDone(s) >= DEALS_PER_WINDOW) return [];
  if (s.career) return moneyOffers(s);
  const declined = new Set((s.declined ?? []).map(dealKey));
  const rng = new Rng(s.seed * 131 + s.matchday);
  const mine = squadOf(s.teams[s.userTeam]);
  const found: { deal: Deal; score: number }[] = [];
  for (const club of rng.shuffle(
    s.teams.map((_, i) => i).filter((i) => i !== s.userTeam),
  )) {
    if (found.length >= 6) break;
    const theirs = squadOf(s.teams[club]);
    const base = elevenOf(s, club);
    // Who of yours would help them most on his own.
    const wanted = mine
      .map((p) => ({
        p,
        gain: elevenOf(s, club, [...theirs, p]).rating - base.rating,
      }))
      .filter((x) => x.gain > 0.15)
      .sort((a, b) => b.gain - a.gain)
      .slice(0, 2);
    for (const { p } of wanted) {
      // One club after each of your players at a time.
      if (found.some((f) => f.deal.give.includes(p.id))) continue;
      // What they'd give for him: someone outside their eleven first, the best one that still works for both.
      const spare = theirs.filter(
        (q) =>
          q.role === p.role ||
          LINE_OF[q.role] === LINE_OF[p.role] ||
          !base.xi.includes(q),
      );
      let best: { deal: Deal; score: number } | null = null;
      for (const q of spare) {
        const deal: Deal = { club, give: [p.id], get: [q.id] };
        if (declined.has(dealKey(deal))) continue;
        const v = judge(s, deal);
        if (!v.ok || !v.you) continue;
        // Something for you: your side no worse, or a better player coming in.
        const forYou =
          v.you.value + (playerRating(q) - playerRating(p)) * 0.3;
        if (forYou < -0.5) continue;
        const score = forYou + v.them!.value * 0.2;
        if (!best || score > best.score) best = { deal, score };
      }
      if (best) {
        found.push(best);
        break;
      }
    }
  }
  return found
    .sort((a, b) => b.score - a.score)
    .slice(0, OFFERS_PER_MATCHDAY)
    .map((x) => x.deal);
}

/**
 * Career mode's offers: a club that could use one of your players, and has the money, bids for him:
 * near his value, up to what he'd be worth to them.
 */
function moneyOffers(s: Season): Deal[] {
  const declined = new Set((s.declined ?? []).map((d) => `${d.club}:${d.give.join()}`));
  const rng = new Rng(s.seed * 131 + s.matchday);
  const mine = squadOf(s.teams[s.userTeam]);
  const cash = s.career!.finance?.cash ?? [];
  const found: { deal: Deal; score: number }[] = [];
  for (const club of rng.shuffle(
    s.teams.map((_, i) => i).filter((i) => i !== s.userTeam),
  )) {
    if (found.length >= 4) break;
    const theirs = squadOf(s.teams[club]);
    const base = elevenOf(s, club);
    const target = mine
      .map((p) => ({ p, gain: elevenOf(s, club, [...theirs, p]).rating - base.rating }))
      .filter((x) => x.gain > 0.25 && !found.some((f) => f.deal.give.includes(x.p.id)))
      .sort((a, b) => b.gain - a.gain)[0];
    if (!target || declined.has(`${club}:${target.p.id}`)) continue;
    // What they'd pay at most, and a bid a little under it.
    const most = -askingPrice(s, { club, give: [target.p.id], get: [] });
    const bid = Math.round(Math.min(most, cash[club] ?? 0, valueOf(s, target.p) * (1.05 + rng.next() * 0.3)) * 10) / 10;
    if (bid < Math.max(0.3, valueOf(s, target.p) * 0.8)) continue;
    const deal: Deal = { club, give: [target.p.id], get: [], fee: -bid };
    if (!judge(s, deal).ok) continue;
    found.push({ deal, score: bid / valueOf(s, target.p) });
  }
  return found
    .sort((a, b) => b.score - a.score)
    .slice(0, OFFERS_PER_MATCHDAY)
    .map((x) => x.deal);
}

export const dealKey = (d: Deal): string =>
  `${d.club}:${[...d.give].sort().join(",")}:${[...d.get].sort().join(",")}`;

/** Turn an offer down: it doesn't come back this window. */
export const decline = (s: Season, deal: Deal): Season => ({
  ...s,
  declined: [...(s.declined ?? []), deal],
});

/**
 * Make the deal: the players change clubs (their season's numbers, fitness and injuries go with
 * them), and both clubs' usual elevens are picked again. Your own pick is dropped if it had
 * anyone in it who's left.
 */
export function makeDeal(s: Season, deal: Deal): Season {
  const v = judge(s, deal);
  if (!v.ok) throw new Error(v.reason);
  const ids = [...deal.give, ...deal.get];
  const from = [
    ...deal.give.map(() => s.userTeam),
    ...deal.get.map(() => deal.club),
  ];
  const to = [
    ...deal.give.map(() => deal.club),
    ...deal.get.map(() => s.userTeam),
  ];
  const fee = deal.fee
    ? deal.fee > 0
      ? { from: s.userTeam, to: deal.club, amount: deal.fee }
      : { from: deal.club, to: s.userTeam, amount: -deal.fee }
    : undefined;
  const moved = movePlayers(s, { matchday: s.matchday, ids, from, to, fee });
  const lineup =
    s.lineup && s.lineup.some((id) => deal.give.includes(id)) ? null : s.lineup;
  return { ...moved, lineup };
}

/**
 * Players change clubs (their season's numbers, fitness and injuries go with them), money changes
 * hands, the move is recorded, and each club's usual eleven is picked again.
 */
export function movePlayers(s: Season, t: Transfer): Season {
  const { ids, to } = t;
  const players = ids.map((id) => byId(s, id)!);
  let teams = s.teams.map((t, club) => {
    const staying = squadOf(t).filter((p) => !ids.includes(p.id));
    const arriving = players.filter((_, i) => to[i] === club);
    if (!arriving.length && staying.length === squadOf(t).length) return t;
    // Newcomers take the lowest free shirt numbers from 12 up.
    const taken = new Set(staying.map((p) => p.shirt));
    const shirts: number[] = [];
    for (let n = 12; shirts.length < arriving.length; n++)
      if (!taken.has(n)) shirts.push(n);
    const squad = [
      ...staying,
      ...arriving.map((p, i) => ({ ...p, shirt: shirts[i] })),
    ];
    return { ...t, players: squad.slice(0, 11), bench: squad.slice(11) };
  });
  const finance = s.career?.finance;
  const moved: Season = {
    ...s,
    teams,
    transfers: [...(s.transfers ?? []), t],
    ...(finance && t.fee
      ? {
          career: {
            ...s.career!,
            finance: {
              ...finance,
              cash: finance.cash.map((c, club) =>
                Math.round(
                  (c +
                    (club === t.fee!.to ? t.fee!.amount : 0) -
                    (club === t.fee!.from ? t.fee!.amount : 0)) *
                    10,
                ) / 10,
              ),
            },
          },
        }
      : {}),
  };
  // The usual eleven, in slot order, for both clubs: the staff's pick with the new squad.
  const clubs = new Set([...t.from, ...to]);
  teams = moved.teams.map((team, club) => {
    if (!clubs.has(club)) return team;
    const squad = squadOf(team);
    const xi = autoPick(moved, club).map(
      (id) => squad.find((p) => p.id === id)!,
    );
    return { ...team, players: xi, bench: squad.filter((p) => !xi.includes(p)) };
  });
  return { ...moved, teams };
}
