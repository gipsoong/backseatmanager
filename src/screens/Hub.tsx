/** The season between matches: the next fixture, the table, and results and fixtures by matchday. */
import { useMemo, useState } from "react";
import type { Formation, Kit, TeamDef } from "../engine/index.ts";
import { ordinal } from "./format.ts";
import {
  type Season,
  fixturesOn,
  isOver,
  matchdayDate,
  matchdays,
  squadOf,
  table,
  userFixture,
} from "../season/season.ts";
import { Squad } from "./Squad.tsx";
import { Transfers } from "./Transfers.tsx";
import {
  type Deal,
  offersFor,
  windowName,
  windowOpen,
} from "../draft/transfers.ts";
import { SeasonReview, Stats } from "./Stats.tsx";
import { TabBar, type TabDef } from "./Tabs.tsx";
import { stagger } from "./motion.ts";
import { BoardLine, History, SummerNote, careerLabel } from "./Career.tsx";
import { surname } from "../viewer/commentary.ts";
import {
  CUP_NAME,
  CUP_PLACES,
  cupLive,
  cupTeam,
  cupWinner,
} from "../draft/cup.ts";

const dateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

type Tab =
  | "review"
  | "table"
  | "fixtures"
  | "squad"
  | "stats"
  | "transfers"
  | "history";

export function Swatch({ kit }: { kit: Kit }) {
  return <span className="swatch" style={{ background: kit.shirt }} />;
}

export function Hub({
  season,
  busy,
  onWatch,
  onSimulate,
  onNewSeason,
  onNextSeason,
  onLineup,
  onFormation,
  onDeal,
  onDecline,
  onEnterCup,
}: {
  season: Season;
  busy: boolean;
  onWatch: () => void;
  onSimulate: () => void;
  onNewSeason: () => void;
  /** Career mode: on to next season with the same club. */
  onNextSeason?: () => void;
  onLineup: (ids: string[] | null) => void;
  onFormation: (f: Formation) => void;
  onDeal: (deal: Deal) => void;
  onDecline: (deal: Deal) => void;
  onEnterCup: () => void;
}) {
  const [tab, setTab] = useState<Tab>(isOver(season) ? "review" : "table");
  // The last matchday played: open the review.
  const [wasOver, setWasOver] = useState(isOver(season));
  if (isOver(season) !== wasOver) {
    setWasOver(isOver(season));
    setTab(isOver(season) ? "review" : "table");
  }
  // The matchday shown in Fixtures: the current one, unless the manager has paged away from it
  // since the last matchday was played.
  const current = Math.min(season.matchday, matchdays(season));
  const [paged, setPaged] = useState<{ at: number; md: number } | null>(null);
  const shown = paged && paged.at === season.matchday ? paged.md : current;
  const setShown = (md: number): void =>
    setPaged({
      at: season.matchday,
      md: Math.max(1, Math.min(matchdays(season), md)),
    });
  const me = season.teams[season.userTeam];
  const offers = useMemo(() => offersFor(season), [season]);
  const rows = table(season);
  const over = isOver(season);
  const next = over ? undefined : userFixture(season, season.matchday);
  const cupOn = cupLive(season);
  const champion = season.cup ? cupWinner(season.cup) : null;
  const last =
    season.matchday > 1 ? userFixture(season, season.matchday - 1) : undefined;
  const place = rows.findIndex((r) => r.team === season.userTeam) + 1;

  return (
    <div className="hub">
      <header className="top">
        <div className="fixture">
          <p className="eyebrow">
            {season.mode === "draft"
              ? `Draft · ${season.league ?? "Premier League"} 2010–now`
              : season.career
                ? careerLabel(season)
                : `Matchday · Season ${season.startDate.slice(0, 4)}`}
          </p>
          <h1>
            <Swatch kit={me.kit} /> {me.name}
          </h1>
          <p className="meta">
            {ordinal(place)} of {season.teams.length} ·{" "}
            {over
              ? "League over"
              : `Matchday ${season.matchday} of ${matchdays(season)}`}
          </p>
          <div
            className="season-progress"
            role="progressbar"
            aria-label="Season played"
            aria-valuemin={0}
            aria-valuemax={matchdays(season)}
            aria-valuenow={season.matchday - 1}
          >
            <span
              style={{
                width: `${(100 * Math.min(season.matchday - 1, matchdays(season))) / matchdays(season)}%`,
              }}
            />
          </div>
        </div>
      </header>

      <div className="hub-grid">
        <section className="card next">
          {next ? (
            <>
              <p className="eyebrow">
                Next · {dateFmt.format(matchdayDate(season, next.matchday))} ·{" "}
                {next.home === season.userTeam ? "Home" : "Away"}
              </p>
              <h2 className="versus">
                <TeamName team={season.teams[next.home]} />{" "}
                <span className="v">v</span>{" "}
                <TeamName team={season.teams[next.away]} />
              </h2>
              <BoardLine season={season} over={false} />
              <SummerNote season={season} />
              {windowOpen(season) && (
                <div className="window-note">
                  <p className="meta">
                    The {windowName(season)} window is open
                    {offers.length
                      ? `, and ${offers.length === 1 ? "a club has made an offer" : `${offers.length} clubs have made offers`} for your players.`
                      : "."}
                  </p>
                  <button
                    type="button"
                    className="btn ghost slim"
                    onClick={() => setTab("transfers")}
                  >
                    {offers.length ? "See the offers" : "Make a deal"}
                  </button>
                </div>
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
          ) : (
            <>
              <p className="eyebrow">
                {season.cup && cupOn
                  ? `League over · on to the ${CUP_NAME}`
                  : "Season over"}
              </p>
              <h2 className="versus">
                {season.teams[rows[0].team].name} are champions
              </h2>
              <p className="meta">
                {me.name} finished {ordinal(place)} with{" "}
                {rows[place - 1].points} points.
                {champion !== null &&
                  ` ${champion === season.userTeam ? `And ${me.name} won` : `${cupTeam(season, champion).name} won`} the ${CUP_NAME}.`}
                {season.mode === "draft" &&
                  !season.cup &&
                  place > CUP_PLACES &&
                  ` A top-${CUP_PLACES} finish would have played on in the ${CUP_NAME}.`}
              </p>
              <BoardLine season={season} over />
              <div className="actions">
                {season.cup && cupOn ? (
                  <button type="button" className="btn" onClick={onEnterCup}>
                    On to the {CUP_NAME}
                  </button>
                ) : season.cup ? (
                  <>
                    <button type="button" className="btn" onClick={onNewSeason}>
                      New season
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={onEnterCup}
                    >
                      Back to the {CUP_NAME}
                    </button>
                  </>
                ) : season.career && onNextSeason ? (
                  <>
                    <button
                      type="button"
                      className="btn"
                      onClick={onNextSeason}
                      disabled={busy}
                    >
                      Next season
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={onNewSeason}
                    >
                      New career
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn" onClick={onNewSeason}>
                    New season
                  </button>
                )}
              </div>
            </>
          )}
          {last?.result && (
            <p className="last">
              <span className="eyebrow">Last time</span>
              <span className="last-score">
                {season.teams[last.home].name}{" "}
                <strong>
                  {last.result.score[0]}–{last.result.score[1]}
                </strong>{" "}
                {season.teams[last.away].name}
              </span>
              {potm(season, last.result) && (
                <span>Player of the match: {potm(season, last.result)}</span>
              )}
            </p>
          )}
        </section>

        <section className="card">
          <TabBar
            label="Season"
            value={tab}
            onChange={setTab}
            tabs={[
              ...(over ? [{ id: "review", label: "Review" } as const] : []),
              { id: "table", label: "Table" },
              { id: "fixtures", label: "Fixtures" },
              { id: "squad", label: "Squad" },
              { id: "stats", label: "Stats" },
              ...(season.career?.history.length
                ? [{ id: "history", label: "History" } as const]
                : []),
              ...(season.mode === "draft" || season.career
                ? [
                    {
                      id: "transfers",
                      label: "Deals",
                      badge: windowOpen(season) ? offers.length : 0,
                    } as const,
                  ]
                : []),
            ] satisfies TabDef<Tab>[]}
          />
          <div className="tab-panel" key={tab} role="tabpanel">
          {tab === "transfers" && (
            <Transfers season={season} onDeal={onDeal} onDecline={onDecline} />
          )}
          {tab === "squad" && (
            <Squad
              season={season}
              onLineup={onLineup}
              onFormation={onFormation}
            />
          )}
          {tab === "stats" && <Stats season={season} />}
          {tab === "review" && <SeasonReview season={season} />}
          {tab === "history" && <History season={season} />}
          {tab === "table" && (
            <table className="league">
              <thead>
                <tr>
                  <th aria-label="Position" />
                  <th className="team">Team</th>
                  <th>P</th>
                  <th className="wide">W</th>
                  <th className="wide">D</th>
                  <th className="wide">L</th>
                  <th>GD</th>
                  <th>Pts</th>
                  <th className="wide form-head">Form</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const t = season.teams[r.team];
                  const gd = r.goalsFor - r.goalsAgainst;
                  return (
                    <tr
                      key={r.team}
                      className={`row-in${r.team === season.userTeam ? " mine" : ""}`}
                      style={stagger(i)}
                    >
                      <td className="pos">{i + 1}</td>
                      <td className="team">
                        <Swatch kit={t.kit} /> {t.name}
                      </td>
                      <td>{r.played}</td>
                      <td className="wide">{r.won}</td>
                      <td className="wide">{r.drawn}</td>
                      <td className="wide">{r.lost}</td>
                      <td>{gd > 0 ? `+${gd}` : gd}</td>
                      <td className="pts">{r.points}</td>
                      <td className="wide form">
                        {r.form.map((f, k) => (
                          <span
                            key={k}
                            className={`f ${f}`}
                            title={
                              f === "W" ? "Won" : f === "D" ? "Drawn" : "Lost"
                            }
                          />
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {tab === "fixtures" && (
            <div className="fixtures">
              <div className="md-nav">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setShown(shown - 1)}
                  disabled={shown <= 1}
                  aria-label="Previous matchday"
                >
                  ‹
                </button>
                <span>
                  Matchday {shown} ·{" "}
                  {dateFmt.format(matchdayDate(season, shown))}
                  {shown !== current && (
                    <button
                      type="button"
                      className="link"
                      onClick={() => setPaged(null)}
                    >
                      Back to matchday {current}
                    </button>
                  )}
                </span>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setShown(shown + 1)}
                  disabled={shown >= matchdays(season)}
                  aria-label="Next matchday"
                >
                  ›
                </button>
              </div>
              <ul key={shown}>
                {fixturesOn(season, shown).map((f, i) => (
                  <li
                    key={f.id}
                    style={stagger(i)}
                    className={`row-in${
                      f.home === season.userTeam || f.away === season.userTeam
                        ? " mine"
                        : ""
                    }`}
                  >
                    <span className="home">{season.teams[f.home].name}</span>
                    <span className="score">
                      {f.result
                        ? `${f.result.score[0]}–${f.result.score[1]}`
                        : "v"}
                    </span>
                    <span className="away">{season.teams[f.away].name}</span>
                    {f.result && f.result.goals.length > 0 && (
                      <span className="scorers">
                        {f.result.goals
                          .map(
                            (g) =>
                              `${surname(g.scorer)}${g.ownGoal ? " (og)" : ""} ${g.clock}`,
                          )
                          .join(", ")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TeamName({ team }: { team: TeamDef }) {
  return (
    <span className="team-name">
      <Swatch kit={team.kit} /> {team.name}
    </span>
  );
}

/** The best-rated player in a result, by name (his rating). */
function potm(
  season: Season,
  r: NonNullable<ReturnType<typeof fixturesOn>[number]["result"]>,
): string | null {
  const best = [...r.appearances].sort((a, b) => b.rating - a.rating)[0];
  if (!best) return null;
  const p = season.teams.flatMap(squadOf).find((q) => q.id === best.id);
  return p ? `${p.name} (${best.rating.toFixed(1)})` : null;
}
