/**
 * The European cup's own screen, after the league: the next tie, the bracket, every leg's result,
 * the cup's scorers, and the squad.
 */
import { useState } from "react";
import type { Formation } from "../engine/index.ts";
import {
  CUP_NAME,
  ROUND_NAMES,
  ROUND_TITLES,
  cupLive,
  cupTeam,
  cupWinner,
  isCupDay,
  tieWinner,
  userCupFixture,
  userInCup,
} from "../draft/cup.ts";
import type { CupFixture, CupSide, Season } from "../season/season.ts";
import { matchdayDate } from "../season/season.ts";
import { surname } from "../viewer/commentary.ts";
import { Swatch } from "./Hub.tsx";
import { Squad } from "./Squad.tsx";

const dateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function CupHub({
  season,
  busy,
  onWatch,
  onSimulate,
  onLeague,
  onNewSeason,
  onLineup,
  onFormation,
}: {
  season: Season;
  busy: boolean;
  onWatch: () => void;
  onSimulate: () => void;
  onLeague: () => void;
  onNewSeason: () => void;
  onLineup: (ids: string[] | null) => void;
  onFormation: (f: Formation) => void;
}) {
  const [tab, setTab] = useState<"bracket" | "results" | "scorers" | "squad">(
    "bracket",
  );
  const cup = season.cup!;
  const me = season.teams[season.userTeam];
  const next = isCupDay(season) ? userCupFixture(season) : undefined;
  const live = cupLive(season);
  const champion = cupWinner(cup);
  const stillIn = userInCup(season);
  const round = Math.max(
    ...cup.fixtures.filter((f) => !f.result).map((f) => f.round),
    champion !== null ? 3 : 0,
  );
  return (
    <div className="hub cup-hub">
      <header className="top">
        <div className="fixture">
          <p className="eyebrow">{CUP_NAME}</p>
          <h1>
            <Swatch kit={me.kit} /> {me.name}
          </h1>
          <p className="meta">
            {champion !== null ? "The cup is over" : `${ROUND_TITLES[round]}`} ·{" "}
            {stillIn
              ? champion === season.userTeam
                ? "Winners"
                : "Still in it"
              : "Knocked out"}
          </p>
        </div>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={onLeague}>
            League review
          </button>
        </div>
      </header>

      <div className="hub-grid">
        <section className="card next">
          {next ? (
            <>
              <p className="eyebrow">
                {ROUND_NAMES[next.round]}
                {next.leg
                  ? `, ${next.leg === 1 ? "first" : "second"} leg`
                  : ""}{" "}
                · {dateFmt.format(matchdayDate(season, next.matchday))} ·{" "}
                {next.home === season.userTeam ? "Home" : "Away"}
              </p>
              <h2 className="versus">
                <Team season={season} side={next.home} />{" "}
                <span className="v">v</span>{" "}
                <Team season={season} side={next.away} />
              </h2>
              {next.leg === 2 && (
                <p className="meta">{firstLegLine(season, next)}</p>
              )}
              <div className="actions">
                <button
                  type="button"
                  className="btn"
                  onClick={onWatch}
                  disabled={busy}
                >
                  Watch the match
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={onSimulate}
                  disabled={busy}
                >
                  {busy ? "Playing…" : "Just the result"}
                </button>
              </div>
            </>
          ) : live ? (
            <>
              <p className="eyebrow">{ROUND_TITLES[round]}</p>
              <h2 className="versus">{me.name} are out</h2>
              <p className="meta">
                The cup goes on without you: play it through to see who wins.
              </p>
              <div className="actions">
                <button
                  type="button"
                  className="btn"
                  onClick={onSimulate}
                  disabled={busy}
                >
                  {busy ? "Playing…" : "Play the next round"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">Final</p>
              <h2 className="versus">
                {champion === season.userTeam
                  ? `${me.name} win the ${CUP_NAME}`
                  : `${cupTeam(season, champion!).name} win the ${CUP_NAME}`}
              </h2>
              <div className="actions">
                <button type="button" className="btn" onClick={onNewSeason}>
                  New season
                </button>
              </div>
            </>
          )}
        </section>

        <section className="card">
          <div className="tabs" role="tablist">
            {(["bracket", "results", "scorers", "squad"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
              >
                {t === "bracket"
                  ? "Bracket"
                  : t === "results"
                    ? "Results"
                    : t === "scorers"
                      ? "Scorers"
                      : "Squad"}
              </button>
            ))}
          </div>
          {tab === "bracket" && <Bracket season={season} />}
          {tab === "results" && <CupResults season={season} />}
          {tab === "scorers" && <Scorers season={season} />}
          {tab === "squad" && (
            <Squad
              season={season}
              onLineup={onLineup}
              onFormation={onFormation}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function Team({ season, side }: { season: Season; side: CupSide }) {
  const t = cupTeam(season, side);
  return (
    <span className="team-name">
      <Swatch kit={t.kit} /> {t.name}
    </span>
  );
}

/** "Lost the first leg 2–1": where the tie stands before the second leg, for the manager. */
function firstLegLine(season: Season, f: CupFixture): string {
  const first = season.cup!.fixtures.find(
    (g) => g.round === f.round && g.tie === f.tie && g.leg === 1,
  );
  if (!first?.result) return "";
  const home = first.home === season.userTeam;
  const [h, a] = first.result.score;
  const mine = home ? h : a;
  const theirs = home ? a : h;
  const how = mine > theirs ? "Won" : mine < theirs ? "Lost" : "Drew";
  return `${how} the first leg ${Math.max(mine, theirs)}–${Math.min(mine, theirs)}.`;
}

/** Each round as a column: ties with their aggregate score, the side that went through in bold. */
function Bracket({ season }: { season: Season }) {
  const cup = season.cup!;
  return (
    <div className="bracket" role="list">
      {ROUND_TITLES.map((title, r) => {
        const ties = [
          ...new Set(
            cup.fixtures.filter((f) => f.round === r).map((f) => f.tie),
          ),
        ];
        const slots = 8 >> r;
        return (
          <div key={title} className="bracket-round" role="listitem">
            <p className="eyebrow">{title}</p>
            {Array.from({ length: slots }, (_, i) => {
              if (!ties.includes(i))
                return <div key={i} className="bracket-tie empty" />;
              const legs = cup.fixtures.filter(
                (f) => f.round === r && f.tie === i,
              );
              const a = legs[0].home;
              const b = legs[0].away;
              const goals = (side: CupSide): number | null =>
                legs.some((f) => f.result)
                  ? legs.reduce(
                      (n, f) =>
                        n +
                        (f.result
                          ? f.result.score[f.home === side ? 0 : 1]
                          : 0),
                      0,
                    )
                  : null;
              const through = tieWinner(cup, r, i);
              const decider = legs.find((f) => f.leg !== 1);
              const pens = decider?.result?.pens;
              return (
                <div key={i} className="bracket-tie">
                  {[a, b].map((side) => (
                    <p
                      key={side}
                      className={`${through === side ? "through" : ""}${side === season.userTeam ? " mine" : ""}`}
                    >
                      <Swatch kit={cupTeam(season, side).kit} />
                      <span className="name">{cupTeam(season, side).name}</span>
                      <span className="agg">
                        {goals(side) ?? ""}
                        {pens ? (
                          <small>
                            {" "}
                            ({pens[decider!.home === side ? 0 : 1]})
                          </small>
                        ) : null}
                      </span>
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/** The cup's goals by player. */
function Scorers({ season }: { season: Season }) {
  const cup = season.cup!;
  const goals = new Map<string, { n: number; team: CupSide }>();
  for (const f of cup.fixtures) {
    for (const g of f.result?.goals ?? []) {
      if (g.ownGoal) continue;
      const team = g.team === 0 ? f.home : f.away;
      const k = `${g.scorer}|${team}`;
      goals.set(k, { n: (goals.get(k)?.n ?? 0) + 1, team });
    }
  }
  const rows = [...goals].sort((x, y) => y[1].n - x[1].n).slice(0, 15);
  if (!rows.length) return <p className="meta pad">No goals yet.</p>;
  return (
    <table className="league">
      <tbody>
        {rows.map(([k, v], i) => (
          <tr
            key={k}
            className={v.team === season.userTeam ? "mine" : undefined}
          >
            <td className="pos">{i + 1}</td>
            <td className="team">
              <Swatch kit={cupTeam(season, v.team).kit} /> {k.split("|")[0]}
            </td>
            <td className="pts">{v.n}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CupResults({ season }: { season: Season }) {
  const cup = season.cup!;
  const name = (side: number): string => cupTeam(season, side).name;
  const mine = (f: CupFixture): boolean =>
    f.home === season.userTeam || f.away === season.userTeam;
  return (
    <div className="fixtures cup">
      <p className="meta">
        {CUP_NAME}: the top four and twelve sides from the other leagues. Two
        legs until the final; level on aggregate goes to extra time and
        penalties.
      </p>
      {ROUND_NAMES.map((round, r) => {
        const legs = cup.fixtures.filter((f) => f.round === r);
        const ties = [...new Set(legs.map((f) => f.tie))];
        return (
          <section key={round}>
            <h3 className="eyebrow">{ROUND_TITLES[r]}</h3>
            {ties.length === 0 ? (
              <p className="meta">
                Drawn once the {ROUND_TITLES[r - 1].replace("Last", "last")}{" "}
                {r === 1 ? "is" : "are"} over.
              </p>
            ) : (
              <ul>
                {ties.map((tie) => {
                  const fs = legs.filter((f) => f.tie === tie);
                  const decider = fs.find((f) => f.leg !== 1)!;
                  const through = tieWinner(cup, r, tie);
                  const agg = fs.reduce(
                    (n, f) => {
                      if (!f.result) return n;
                      const [h, a] = f.result.score;
                      return f.home === decider.home
                        ? [n[0] + h, n[1] + a]
                        : [n[0] + a, n[1] + h];
                    },
                    [0, 0],
                  );
                  return fs.map((f) => (
                    <li key={f.id} className={mine(f) ? "mine" : undefined}>
                      <span className="home">
                        <Swatch kit={cupTeam(season, f.home).kit} />{" "}
                        {name(f.home)}
                      </span>
                      <span className="score">
                        {f.result
                          ? `${f.result.score[0]}–${f.result.score[1]}`
                          : "v"}
                      </span>
                      <span className="away">
                        {name(f.away)}{" "}
                        <Swatch kit={cupTeam(season, f.away).kit} />
                      </span>
                      {f.result && (
                        <span className="scorers">
                          {f.result.goals
                            .map(
                              (g) =>
                                `${surname(g.scorer)}${g.ownGoal ? " (og)" : ""} ${g.clock}`,
                            )
                            .join(", ")}
                          {f === decider && (
                            <strong className="through">
                              {f.result.goals.length > 0 ? " · " : ""}
                              {f.leg === 2 &&
                                `Agg ${agg[0]}–${agg[1]}${f.result.aet ? " aet" : ""}`}
                              {f.leg === 0 &&
                                f.result.aet &&
                                "After extra time"}
                              {f.result.pens &&
                                ` · ${Math.max(...f.result.pens)}–${Math.min(...f.result.pens)} on penalties`}
                              {through !== null &&
                                ` · ${name(through)} ${r === ROUND_NAMES.length - 1 ? "win the cup" : "go through"}`}
                            </strong>
                          )}
                        </span>
                      )}
                    </li>
                  ));
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
