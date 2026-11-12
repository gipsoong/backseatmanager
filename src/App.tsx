import { Logo } from "./screens/Logo.tsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { randomTeam } from "./engine/index.ts";
import { budgetFor, draftLeague } from "./draft/draft.ts";
import { decline, makeDeal, windowOpen } from "./draft/transfers.ts";
import { Draft } from "./screens/Draft.tsx";
import { Hub } from "./screens/Hub.tsx";
import { loanOut } from "./career/loans.ts";
import { RoundUp } from "./screens/RoundUp.tsx";
import { CupHub } from "./screens/Cup.tsx";
import { Match } from "./screens/Match.tsx";
import { PickTeam } from "./screens/PickTeam.tsx";
import { Start } from "./screens/Start.tsx";
import {
  type Result,
  type Season,
  completeMatchday,
  createSeason,
  fitnessFor,
  fixturesOn,
  matchTeam,
  resultOf,
  userFixture,
  isOver,
  keepRewatch,
  rewatchOf,
} from "./season/season.ts";
import { prefetch, simulate, simulateMatches } from "./season/simulate.ts";
import {
  advanceCup,
  completeCupMatchday,
  cupFixturesToday,
  cupMatches,
  isCupDay,
  userCupFixture,
} from "./draft/cup.ts";
import { loadSeason, saveSeason } from "./season/store.ts";
import { marketDay } from "./career/market.ts";
import {
  aimFor,
  elevenRating,
  nextSeason,
  startCareer,
  startRealCareer,
} from "./career/career.ts";
import { REAL_LEAGUES } from "./career/real.ts";
import {
  completeCupDay,
  cupToday,
  domesticCupMatches,
  isDomesticCupDay,
  userCupTie,
} from "./career/cup.ts";
import { letGo, renew, signFreeAgent } from "./career/contracts.ts";
import { takeJob } from "./career/jobs.ts";
import { MatchViewer } from "./viewer/MatchViewer.tsx";
import { Timeline } from "./viewer/timeline.ts";

/** The career start's choice of a made-up league rather than a real one. */
const MADE_UP = "made-up";
const randomSeed = (): number => Math.floor(Math.random() * 100_000);
/** Let the browser paint (a "busy" state) before a blocking bit of work. */
const nextFrame = (): Promise<void> =>
  new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

type Screen =
  | { kind: "loading" }
  | { kind: "start" }
  | { kind: "pick"; season: Season; league: string }
  | { kind: "draft"; seed: number }
  | { kind: "hub" }
  /** The league's screen, while the cup is on. */
  | { kind: "league" }
  | { kind: "match"; timeline: Timeline }
  /** One of his past league matches, played again to watch its goals. */
  | { kind: "rewatch"; timeline: Timeline; title: string; eyebrow: string }
  | { kind: "friendly" };

export default function App() {
  const [season, setSeason] = useState<Season | null>(null);
  const [screen, setScreen] = useState<Screen>({ kind: "loading" });
  const [busy, setBusy] = useState(false);
  // The league matchday just played, for the full-time round-up over the hub.
  const [roundUp, setRoundUp] = useState<number | null>(null);
  // The rest of the matchday, playing in the background while the manager watches his match.
  const others = useRef<Promise<Map<number, Result>> | null>(null);

  useEffect(() => {
    // Storage that never answers (seen in some embedded frames) mustn't leave the game on
    // "Loading…": after a few seconds it starts without a save.
    Promise.race([
      loadSeason(),
      new Promise<null>((r) => setTimeout(() => r(null), 4000)),
    ])
      .then((s) => setSeason(s && advanceCup(s)))
      .catch(() => setSeason(null))
      .finally(() => setScreen({ kind: "start" }));
  }, []);

  const commit = async (s: Season): Promise<void> => {
    setSeason(s);
    // A private window may refuse storage, or never answer: play on regardless.
    await Promise.race([
      saveSeason(s).catch(() => undefined),
      new Promise((r) => setTimeout(r, 4000)),
    ]);
  };

  /**
   * A domestic cup round the manager isn't in is played first, on its own (it's midweek, before
   * the league match he's about to play).
   */
  const cupRoundFirst = async (s: Season): Promise<Season> => {
    if (!isDomesticCupDay(s) || userCupTie(s)) return s;
    const next = completeCupDay(
      s,
      await simulateMatches(domesticCupMatches(s), fitnessFor(s), {
        foreground: true,
      }),
    );
    await commit(next);
    return next;
  };

  const watch = async (was: Season): Promise<void> => {
    let s = was;
    if (isDomesticCupDay(s) && !userCupTie(s)) {
      setBusy(true);
      s = await cupRoundFirst(s);
      setBusy(false);
    }
    const tie = userCupTie(s);
    if (tie) {
      const [mine] = domesticCupMatches(s, [tie]);
      others.current = simulateMatches(
        domesticCupMatches(
          s,
          cupToday(s).filter((g) => g.id !== tie.id),
        ),
        fitnessFor(s),
      );
      setScreen({
        kind: "match",
        timeline: new Timeline(mine.home, mine.away, tie.seed, fitnessFor(s), {}),
      });
      return;
    }
    if (isCupDay(s)) {
      const f = userCupFixture(s)!;
      const [mine] = cupMatches(s, [f]);
      others.current = simulateMatches(
        cupMatches(
          s,
          cupFixturesToday(s).filter((g) => g.id !== f.id),
        ),
        fitnessFor(s),
      );
      setScreen({
        kind: "match",
        timeline: new Timeline(
          mine.home,
          mine.away,
          f.seed,
          fitnessFor(s),
          mine.knockout,
        ),
      });
      return;
    }
    const f = userFixture(s, s.matchday)!;
    others.current = simulate(
      s,
      fixturesOn(s, s.matchday).filter((g) => g.id !== f.id),
    );
    setScreen({
      kind: "match",
      timeline: new Timeline(
        matchTeam(s, f.home),
        matchTeam(s, f.away),
        f.seed,
        fitnessFor(s),
      ),
    });
  };

  const finishWatched = async (
    s: Season,
    timeline: Timeline,
  ): Promise<void> => {
    setBusy(true);
    await nextFrame();
    while (!timeline.done) timeline.advance(5000);
    const results = await (others.current ??
      Promise.resolve(new Map<number, Result>()));
    const tie = userCupTie(s);
    if (tie) {
      results.set(tie.id, resultOf(timeline.state));
      await commit(completeCupDay(s, results));
    } else if (isCupDay(s)) {
      results.set(userCupFixture(s)!.id, resultOf(timeline.state));
      await commit(completeCupMatchday(s, results));
    } else {
      const f = userFixture(s, s.matchday)!;
      const result = resultOf(timeline.state);
      results.set(f.id, result);
      const kept = keepRewatch(s, f.id, rewatchOf(s, f, timeline.orders), result.score);
      await commit(advanceCup(marketDay(completeMatchday(kept, results))));
      setRoundUp(s.matchday);
    }
    others.current = null;
    setBusy(false);
    setScreen({ kind: "hub" });
  };

  /** Plays the day's matches (his too) without watching, saves, and hands back the season after it. */
  const playDay = async (was: Season): Promise<Season> => {
    const s = await cupRoundFirst(was);
    let next: Season;
    if (userCupTie(s))
      next = (
        completeCupDay(
          s,
          await simulateMatches(domesticCupMatches(s), fitnessFor(s), {
            foreground: true,
          }),
        )
      );
    else if (isCupDay(s))
      next = (
        completeCupMatchday(
          s,
          await simulateMatches(
            cupMatches(s, cupFixturesToday(s)),
            fitnessFor(s),
            { foreground: true },
          ),
        )
      );
    else {
      const results = await simulate(s, fixturesOn(s, s.matchday), { foreground: true });
      const f = userFixture(s, s.matchday);
      const mine = f && results.get(f.id);
      const kept = f && mine ? keepRewatch(s, f.id, rewatchOf(s, f), mine.score) : s;
      setRoundUp(s.matchday);
      next = advanceCup(marketDay(completeMatchday(kept, results)));
    }
    await commit(next);
    return next;
  };

  const simulateMatchday = async (was: Season): Promise<void> => {
    setBusy(true);
    await playDay(was);
    setBusy(false);
  };

  /**
   * Plays on without watching, up to `days` days, stopping early when something wants him: the
   * league over, or a transfer window opening.
   */
  const simulateAhead = async (was: Season, days: number): Promise<void> => {
    setBusy(true);
    let s = was;
    for (let i = 0; i < days && !isOver(s); i++) {
      const open = windowOpen(s);
      s = await playDay(s);
      if (!open && windowOpen(s)) break;
    }
    setBusy(false);
  };

  /** Plays one of his kept league matches again, from the goals. */
  const rewatch = (s: Season, fixtureId: number): void => {
    const r = s.rewatch?.[`f${fixtureId}`];
    const f = s.fixtures.find((x) => x.id === fixtureId);
    if (!r || !f) return;
    setScreen({
      kind: "rewatch",
      timeline: new Timeline(r.home, r.away, r.seed, r.fitness, undefined, r.orders),
      title: `${r.home.name} ${r.score[0]}–${r.score[1]} ${r.away.name}`,
      eyebrow: `Matchday ${f.matchday} · watching again`,
    });
  };

  // A career starts in a real league (the first, by default) or a made-up one ("made-up").
  const careerIn = (league: string): Season =>
    league === MADE_UP
      ? startCareer(createSeason(randomSeed(), 0))
      : startRealCareer(randomSeed(), league);
  const newSeason = (league = REAL_LEAGUES[0].id): void =>
    setScreen({ kind: "pick", season: careerIn(league), league });
  const newDraft = (): void => setScreen({ kind: "draft", seed: randomSeed() });

  // Each screen fades up as it arrives (keyed, so a new screen is a new element); the cup and the
  // league are different screens though both are "hub".
  const screenKey =
    screen.kind === "hub" && season?.cup && season.cupEntered
      ? "cup"
      : screen.kind;
  // On the hub, the day's matches start playing in the background: "Just the result" (or the rest
  // of the day, while he watches his) is then mostly done. A result is only used for the very
  // same match, so changing the side first just plays that one again.
  useEffect(() => {
    if ((screen.kind === "hub" || screen.kind === "league") && season && !busy)
      prefetch(season);
  }, [screen.kind, season, busy]);

  // A new screen starts at the top, not wherever the last one was scrolled to.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screenKey]);

  return (
    <main>
      {(screen.kind === "hub" || screen.kind === "league") && season && (
        <nav className="appbar">
          <button
            type="button"
            className="appbar-home"
            aria-label="Backseat Manager: back to the menu"
            onClick={() => setScreen({ kind: "start" })}
          >
            <Logo />
          </button>
        </nav>
      )}
      {screen.kind === "hub" && season && roundUp !== null && !season.cupEntered && (
        <RoundUp
          season={season}
          matchday={roundUp}
          onClose={() => setRoundUp(null)}
          onRewatch={(id) => {
            setRoundUp(null);
            rewatch(season, id);
          }}
        />
      )}
      <div className="screen" key={screenKey}>
      {screen.kind === "loading" && <p className="meta">Loading…</p>}
      {screen.kind === "start" && (
        <Start
          saved={season}
          onContinue={() => setScreen({ kind: "hub" })}
          onNew={() => newSeason()}
          onDraft={newDraft}
          onFriendly={() => setScreen({ kind: "friendly" })}
        />
      )}
      {screen.kind === "draft" && (
        <Draft
          seed={screen.seed}
          onBack={() => setScreen({ kind: "start" })}
          onDone={(d, name) => {
            void commit({
              // The draft's own seed: a daily draft's league plays the same for everyone.
              ...createSeason(d.seed, 0, new Date(), draftLeague(d, name)),
              mode: "draft",
              league: d.league,
              ...(d.theme || d.money !== undefined || d.daily || d.difficulty || d.rules
                ? {
                    draftStyle: {
                      theme: d.theme,
                      budget: d.money !== undefined ? budgetFor(d) : undefined,
                      daily: d.daily,
                      ...(d.difficulty && d.difficulty !== "normal" ? { difficulty: d.difficulty } : {}),
                      ...(d.rules ? { rules: d.rules } : {}),
                    },
                  }
                : {}),
            });
            setScreen({ kind: "hub" });
          }}
        />
      )}
      {screen.kind === "pick" && (
        <PickTeam
          teams={screen.season.teams}
          ratingOf={(i) => elevenRating(screen.season, i)}
          onBack={() => setScreen({ kind: "start" })}
          leagues={{
            options: [
              ...REAL_LEAGUES.map((l) => ({ id: l.id, name: l.name })),
              { id: MADE_UP, name: "Made-up league" },
            ],
            chosen: screen.league,
            onChoose: (id) => newSeason(id),
          }}
          onPick={(i) => {
            const s = { ...screen.season, userTeam: i };
            void commit(
              s.career
                ? marketDay({ ...s, career: { ...s.career, aim: aimFor(s, i) } })
                : s,
            );
            setScreen({ kind: "hub" });
          }}
        />
      )}
      {(screen.kind === "hub" || screen.kind === "league") &&
        season &&
        (screen.kind === "hub" && season.cup && season.cupEntered ? (
          <CupHub
            season={season}
            busy={busy}
            onWatch={() => void watch(season)}
            onSimulate={() => void simulateMatchday(season)}
            onLeague={() => setScreen({ kind: "league" })}
            onNewSeason={newDraft}
            onLineup={(lineup) => void commit({ ...season, lineup })}
            onTactics={(tactics) =>
              void commit({
                ...season,
                teams: season.teams.map((t, i) =>
                  i === season.userTeam ? { ...t, ...tactics } : t,
                ),
              })
            }
            onFormation={(formation) =>
              void commit({
                ...season,
                lineup: null,
                teams: season.teams.map((t, i) =>
                  i === season.userTeam ? { ...t, formation } : t,
                ),
              })
            }
          />
        ) : (
          <Hub
            season={season}
            busy={busy}
            onWatch={() => void watch(season)}
            onSimulate={() => void simulateMatchday(season)}
            onSimulateAhead={(days) => void simulateAhead(season, days)}
            onNewSeason={season.mode === "draft" ? newDraft : () => newSeason()}
            onNextSeason={
              season.career
                ? (club, sacked) =>
                    void commit(
                      marketDay(
                        club === undefined
                          ? nextSeason(season)
                          : takeJob(nextSeason(season), club, sacked ?? false),
                      ),
                    )
                : undefined
            }
            onLineup={(lineup) => void commit({ ...season, lineup })}
            onChoose={(next) => void commit(next)}
            onTactics={(tactics) =>
              void commit({
                ...season,
                teams: season.teams.map((t, i) =>
                  i === season.userTeam ? { ...t, ...tactics } : t,
                ),
              })
            }
            // A new shape: the staff pick the side for it again.
            onFormation={(formation) =>
              void commit({
                ...season,
                lineup: null,
                teams: season.teams.map((t, i) =>
                  i === season.userTeam ? { ...t, formation } : t,
                ),
              })
            }
            onDeal={(deal) => void commit(makeDeal(season, deal))}
            onDecline={(deal) => void commit(decline(season, deal))}
            onEnterCup={() => {
              void commit({ ...season, cupEntered: true });
              setScreen({ kind: "hub" });
            }}
            onRenew={(id) => void commit(renew(season, id))}
            onLetGo={(id, leaving) => void commit(letGo(season, id, leaving))}
            onSign={(id) => void commit(signFreeAgent(season, id))}
            onLoan={(id) => void commit(loanOut(season, id))}
            onRewatch={(id) => rewatch(season, id)}
          />
        ))}
      {screen.kind === "match" && season && (
        <Match
          season={season}
          timeline={screen.timeline}
          busy={busy}
          onDone={() => void finishWatched(season, screen.timeline)}
        />
      )}
      {screen.kind === "rewatch" && (
        <>
          <header className="top match-top">
            <div className="fixture">
              <p className="eyebrow">{screen.eyebrow}</p>
              <h1>{screen.title}</h1>
            </div>
            <div className="actions">
              <button type="button" className="btn" onClick={() => setScreen({ kind: "hub" })}>
                Back
              </button>
            </div>
          </header>
          <MatchViewer timeline={screen.timeline} initialMode="goals" />
        </>
      )}
      {screen.kind === "friendly" && (
        <Friendly onBack={() => setScreen({ kind: "start" })} />
      )}
      </div>
    </main>
  );
}

/** A one-off match between two random sides, by number, for when there's no season to play. */
function Friendly({ onBack }: { onBack: () => void }) {
  const [seed, setSeed] = useState(1);
  const [draft, setDraft] = useState("1");
  const timeline = useMemo(
    () =>
      new Timeline(randomTeam(seed * 2 + 1), randomTeam(seed * 2 + 2), seed),
    [seed],
  );
  const [home, away] = timeline.state.teams;

  const load = (s: number): void => {
    setSeed(s);
    setDraft(String(s));
  };

  return (
    <>
      <header className="top">
        <div className="fixture">
          <p className="eyebrow">Friendly</p>
          <h1>
            {home.name} <span className="v">v</span> {away.name}
          </h1>
          <p className="meta">
            {home.formation}, {home.block} block · {away.formation},{" "}
            {away.block} block
          </p>
        </div>
        <form
          className="picker"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(draft);
            if (Number.isInteger(n) && n >= 0) load(n);
          }}
        >
          <button type="button" className="ghost" onClick={onBack}>
            Back
          </button>
          <label htmlFor="seed">Match no.</label>
          <input
            id="seed"
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="ghost">
            Load
          </button>
          <button type="button" onClick={() => load(randomSeed())}>
            New match
          </button>
        </form>
      </header>
      <MatchViewer key={seed} timeline={timeline} manage={0} />
    </>
  );
}
