/**
 * The transfer window (January in draft mode; summer and January in a career, with money): offers
 * other clubs make for your players, and your own offers.
 * Pick a club, see where they're short, choose who you want and who you'll give, and see how they
 * read it: what it does to their side, and to yours.
 */
import { useMemo, useState } from "react";
import type { PlayerDef } from "../engine/index.ts";
import { positionsLabel, styleLabel } from "../names.ts";
import {
  type Season,
  avgRating,
  matchdayDate,
  playerRating,
  squadOf,
} from "../season/season.ts";
import {
  DEALS_PER_WINDOW,
  type Deal,
  MAX_PER_SIDE,
  type Verdict,
  askingPrice,
  dealsDone,
  elevenOf,
  judge,
  needs,
  offersFor,
  placeName,
  windowMatchdays,
  windowName,
  windowOf,
  windowOpen,
} from "../draft/transfers.ts";
import { money, valueOf, wage, wageBill } from "../career/money.ts";
import { Swatch } from "./Hub.tsx";
import { stagger } from "./motion.ts";

const dateFmt = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function Transfers({
  season,
  onDeal,
  onDecline,
}: {
  season: Season;
  onDeal: (deal: Deal) => void;
  onDecline: (deal: Deal) => void;
}) {
  const career = !!season.career?.finance;
  const open = windowOpen(season);
  // The window open now, or the next one to open.
  const january = open
    ? windowOf(season, season.matchday)
    : windowOf(
        season,
        windowMatchdays(season).find((md) => md > season.matchday) ??
          windowMatchdays(season)[0] ??
          0,
      );
  const wname = january.length ? windowName(season, january[0]) : "January";
  const others = season.teams
    .map((_, i) => i)
    .filter((i) => i !== season.userTeam);
  const [club, setClub] = useState(others[0]);
  const [give, setGive] = useState<string[]>([]);
  const [get, setGet] = useState<string[]>([]);
  const [fee, setFee] = useState(0);
  const deal: Deal = career ? { club, give, get, fee } : { club, give, get };
  const verdict = judge(season, deal);
  const offers = useMemo(() => offersFor(season), [season]);
  const toggle = (
    list: string[],
    set: (l: string[]) => void,
    id: string,
  ): void =>
    set(
      list.includes(id)
        ? list.filter((x) => x !== id)
        : list.length < MAX_PER_SIDE
          ? [...list, id]
          : list,
    );
  const done = season.transfers ?? [];
  const name = (id: string): string =>
    season.teams.flatMap(squadOf).find((p) => p.id === id)?.name ?? id;
  const theirXi = useMemo(
    () => new Set(elevenOf(season, club).xi.map((p) => p.id)),
    [season, club],
  );
  const short = needs(season, club);

  const first = january[0];
  const last = january.at(-1);
  const finance = season.career?.finance;
  const cash = finance?.cash[season.userTeam] ?? 0;
  const around = career
    ? done.filter(
        (t) =>
          !t.from.includes(season.userTeam) && !t.to.includes(season.userTeam),
      )
    : [];
  const mineDone = done.filter(
    (t) => t.from.includes(season.userTeam) || t.to.includes(season.userTeam),
  );
  const what = career
    ? "Buy, sell, or swap one or two players each way, with or without a fee."
    : "Swap one or two of your players for one or two of theirs.";
  return (
    <div className="transfers">
      <p className="meta pad">
        {open
          ? `The ${wname} window is open until the match on ${dateFmt.format(matchdayDate(season, last!))} (matchday ${last}). ${what} ${DEALS_PER_WINDOW - dealsDone(season)} of ${DEALS_PER_WINDOW} deals left.`
          : first && season.matchday < first
            ? `The ${wname} window opens before matchday ${first} (${dateFmt.format(matchdayDate(season, first))}). Then you can deal with the other clubs, and they'll come to you with offers.`
            : `The ${wname} window has shut.`}
      </p>
      {career && finance && (
        <p className="meta pad budget">
          <span className="eyebrow">Budget</span> <strong>{money(cash)}</strong>{" "}
          · wages {money(wageBill(season, season.userTeam))} a season, income{" "}
          {money(finance.income[season.userTeam])} and prize money
        </p>
      )}
      {open && offers.length > 0 && (
        <section className="pad offers">
          <h4 className="eyebrow">Offers for your players</h4>
          {offers.map((o, i) => {
            const v = judge(season, o);
            return (
              <article
                key={`${o.club}-${o.give.join()}`}
                className="offer-card rise"
                style={stagger(i)}
              >
                <p className="deal-line">
                  <Swatch kit={season.teams[o.club].kit} />{" "}
                  {season.teams[o.club].name} offer{" "}
                  {o.get.length > 0 && o.get.map(name).join(" and ")}
                  {o.get.length > 0 && (o.fee ?? 0) < 0 && " and "}
                  {(o.fee ?? 0) < 0 && money(-o.fee!)}{" "}
                  <span className="muted">for</span>{" "}
                  {o.give.map(name).join(" and ")}
                </p>
                <Effect side={v.you} title="For you" />
                <div className="actions">
                  <button
                    type="button"
                    className="btn"
                    disabled={!v.ok}
                    onClick={() => onDeal(o)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => onDecline(o)}
                  >
                    Turn it down
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
      {open && (
        <>
          <h4 className="eyebrow pad-x">Make an offer</h4>
          <label className="shape pad-x">
            <span className="eyebrow">Deal with</span>
            <select
              value={club}
              onChange={(e) => {
                setClub(Number(e.target.value));
                setGet([]);
              }}
            >
              {others.map((i) => (
                <option key={i} value={i}>
                  {season.teams[i].name}
                </option>
              ))}
            </select>
          </label>
          <p className="meta pad-x needs">
            {short.length
              ? `Where they're short: ${short.map((n) => `${placeName(n.slot)} (${n.player.name}, ${Math.round(n.fitted)})`).join(", ")}.`
              : "No obvious weak spot in their side."}{" "}
            Players outside their eleven are marked: they let those go more
            easily.
          </p>
          <div className="deal-grid">
            <PlayerPick
              title={`From ${season.teams[club].name}`}
              season={season}
              club={club}
              picked={get}
              starters={theirXi}
              onToggle={(id) => toggle(get, setGet, id)}
            />
            <PlayerPick
              title="You offer"
              season={season}
              club={season.userTeam}
              picked={give}
              onToggle={(id) => toggle(give, setGive, id)}
            />
          </div>
          <section
            className={`verdict${verdict.ok ? " yes" : ""}`}
            aria-live="polite"
          >
            <p className="deal-line">
              {get.length ? get.map(name).join(" and ") : career ? "" : "…"}
              {career && fee < 0 && `${get.length ? " and " : ""}${money(-fee)}`}
              {career && !get.length && fee >= 0 && "…"}{" "}
              <span className="muted">for</span>{" "}
              {give.length ? give.map(name).join(" and ") : career ? "" : "…"}
              {career && fee > 0 && `${give.length ? " and " : ""}${money(fee)}`}
              {career && !give.length && fee <= 0 && "…"}
            </p>
            {career && (
              <div className="fee">
                <span className="eyebrow">
                  {fee > 0 ? "You pay" : fee < 0 ? "They pay" : "No fee"}
                </span>
                <span className="fee-amount">{fee ? money(Math.abs(fee)) : "–"}</span>
                <div className="fee-buttons">
                  <button type="button" className="btn ghost slim" onClick={() => setFee(Math.round((fee - 1) * 10) / 10)} aria-label="One million less">
                    −£1m
                  </button>
                  <button type="button" className="btn ghost slim" onClick={() => setFee(Math.round((fee + 1) * 10) / 10)} aria-label="One million more">
                    +£1m
                  </button>
                  <button
                    type="button"
                    className="btn ghost slim"
                    disabled={!give.length && !get.length}
                    onClick={() => setFee(askingPrice(season, { club, give, get }))}
                  >
                    Their price
                  </button>
                </div>
              </div>
            )}
            {verdict.them ? (
              <>
                <p className={`interest ${verdict.interest}`}>
                  {verdict.reason}
                </p>
                <Effect
                  side={verdict.them}
                  title={`How ${season.teams[club].name} see it`}
                />
                <Effect side={verdict.you} title="For you" />
              </>
            ) : (
              <p className="meta">{verdict.reason}</p>
            )}
            <button
              type="button"
              className="btn"
              disabled={!verdict.ok}
              onClick={() => {
                onDeal(deal);
                setGive([]);
                setGet([]);
                setFee(0);
              }}
            >
              Make the deal
            </button>
          </section>
        </>
      )}
      {mineDone.length > 0 && (
        <section className="pad">
          <h4 className="eyebrow">Deals done</h4>
          <ul className="deals">
            {mineDone.map((t, i) => {
              const club =
                t.from.find((c) => c !== season.userTeam) ??
                t.to.find((c) => c !== season.userTeam)!;
              const inIds = t.ids.filter((_, k) => t.to[k] === season.userTeam);
              const outIds = t.ids.filter(
                (_, k) => t.from[k] === season.userTeam,
              );
              return (
                <li key={i}>
                  <Swatch kit={season.teams[club].kit} />{" "}
                  {dealText(
                    inIds.map(name),
                    outIds.map(name),
                    t.fee
                      ? t.fee.from === season.userTeam
                        ? t.fee.amount
                        : -t.fee.amount
                      : 0,
                  )}{" "}
                  <span className="muted">
                    · {season.teams[club].name}, before matchday {t.matchday}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {around.length > 0 && (
        <section className="pad">
          <h4 className="eyebrow">Around the league</h4>
          <ul className="deals">
            {around.map((t, i) => (
              <li key={i}>
                <Swatch kit={season.teams[t.to[0]].kit} /> {name(t.ids[0])}{" "}
                <span className="muted">
                  {season.teams[t.from[0]].name} to {season.teams[t.to[0]].name}
                  {t.fee ? `, ${money(t.fee.amount)}` : ""} · matchday {t.matchday}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** "X in, for Y and £3m", "X in for £11m", "Y out for £5m". */
function dealText(inn: string[], out: string[], paid: number): string {
  const fee = paid ? money(Math.abs(paid)) : "";
  if (!inn.length) return `${out.join(", ")} out${paid < 0 ? ` for ${fee}` : ""}`;
  const give = [...out, ...(paid > 0 ? [fee] : [])].join(" and ");
  const got = paid < 0 ? ` and ${fee}` : "";
  return `${inn.join(", ")} in${got}${give ? `, for ${give}` : ""}`;
}

/** What a deal does to one side: its eleven's rating before and after, and the reasons. */
function Effect({ side, title }: { side: Verdict["them"]; title: string }) {
  if (!side) return null;
  const d = side.after.rating - side.before.rating;
  return (
    <div className="effect">
      <p className="eyebrow">
        {title} · eleven {side.before.rating.toFixed(1)} →{" "}
        {side.after.rating.toFixed(1)}{" "}
        <span className={d > 0.05 ? "up" : d < -0.05 ? "down" : "muted"}>
          ({d >= 0 ? "+" : ""}
          {d.toFixed(1)})
        </span>
      </p>
      <ul>
        {side.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

function PlayerPick({
  title,
  season,
  club,
  picked,
  starters,
  onToggle,
}: {
  title: string;
  season: Season;
  club: number;
  picked: string[];
  starters?: Set<string>;
  onToggle: (id: string) => void;
}) {
  const moved = new Set(
    (season.transfers ?? [])
      .filter((t) => windowOf(season, season.matchday).includes(t.matchday))
      .flatMap((t) => t.ids),
  );
  const career = !!season.career?.finance;
  const squad = [...squadOf(season.teams[club])].sort(
    (a, b) => playerRating(b) - playerRating(a),
  );
  const form = (p: PlayerDef): string => {
    const st = season.stats[p.id];
    return st?.apps
      ? `${avgRating(st)?.toFixed(1) ?? "–"} avg, ${st.apps} apps`
      : "No apps";
  };
  return (
    <section className="pick">
      <h4 className="eyebrow">{title}</h4>
      <ul className="offer-list">
        {squad.map((p) => {
          const out = season.condition[p.id].injuredUntil - season.matchday;
          return (
            <li key={p.id}>
              <button
                type="button"
                className={`offer${picked.includes(p.id) ? " chosen" : ""}`}
                aria-pressed={picked.includes(p.id)}
                disabled={moved.has(p.id)}
                onClick={() => onToggle(p.id)}
              >
                <span className="role">{positionsLabel(p)}</span>
                <span className="name">
                  {p.name}
                  {out > 0 && (
                    <span className="inj-note">
                      Out {out === 1 ? "1 week" : `${out} weeks`}
                    </span>
                  )}
                  {starters && !starters.has(p.id) && (
                    <span className="avail-note">Squad player</span>
                  )}
                  <small className="style">
                    {styleLabel(p)} · {form(p)}
                    {career &&
                      ` · ${season.career!.people[p.id]?.age} · ${money(valueOf(season, p))}, ${wage(p, season.career!.people[p.id])}k a week`}
                  </small>
                </span>
                <span className="rating">{playerRating(p)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
