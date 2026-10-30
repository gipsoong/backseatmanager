# Matchday — project brief for Claude Code

A snappy, lightweight web football management game. The target experience: boot up, pick a
random team, play for ~30 minutes, without having to learn Football Manager first. A middle
ground between 38-0 (too shallow — can't watch games, thin stats, no transfers/development/
academy/youth) and Football Manager (too daunting — overwhelming detail before you can enjoy it).

This file is for whichever Claude Code session picks this up. Read it before writing engine code.

## Where this project came from

A prototype was built as a single self-contained HTML file (chat artifact, not in this repo) to
validate feel, pacing, UI layout and tone before committing to real architecture. It went through
nine iterations based on direct feedback. It is **not** a starting point for the real engine's
code — its architecture has a specific flaw described below that should not be repeated — but it
*is* a useful reference for what the experience should feel like. Treat it as a design spec you
can look at, not a codebase you extend.

## The one lesson worth internalizing before writing any engine code

The prototype kept breaking in the same way, over and over, across unrelated features:
**it decided outcomes first and made the positions match afterwards, instead of computing
outcomes from positions.**

Concretely, across nine rounds of fixes this bit us in:
- A shot could be "taken" by a player standing on the halfway line, because the engine picked
  "shot" as the outcome and only then dealt with where anyone was.
- A foul was ruled a penalty or a free-kick based on an *estimate* of where the play was, which
  drifted from where the foul was actually animated to happen.
- Passes went to teammates chosen by role weighting alone, with no distance check, so forwards
  would "lay the ball back" to a center-back standing 40 yards behind them.
- Loose balls just sat there because nothing modeled a defender racing onto them.
- Offside was never actually checked against the last defender's line — it was a scripted
  outcome that always logged as offside regardless of anyone's position.
- After a goal, the restart happened on a fixed timer instead of waiting for both teams to
  actually be back in position.

Every one of these was fixed individually, but they're symptoms of the same root cause. **Do not
build the real engine this way.** The fix each time was to make positions the source of truth:
compute a target location for an action, gate the action on a player actually reaching it, and
derive the outcome (penalty vs free-kick, offside vs not, who wins a loose ball) from real
distances at that moment — not from a pre-rolled dice result that commentary and animation then
have to justify.

This is also why the original architecture decision (below) puts the simulation core first and
treats rendering as a consumer of its output, not the other way around.

## Design decisions carried over from planning + the prototype

**Match simulation model:** event-based, not physics-based — but every event must be resolved
from actual player/ball positions (see lesson above), with a deterministic, seeded simulation
core, decoupled from the UI. Variable speed (the prototype settled on 1×/2×/4×, defaulting to
1×, after early versions were judged too fast).

**Viewing modes** (validated in the prototype, worth keeping): Full match / Key moments /
Goals only. Off-camera minutes still simulate fully (stats, commentary) and fast-forward
visually. "Key moments" = goals, real chances (shots on target, woodwork, one-on-ones),
penalties, red cards. "Goals only" = goals and penalties.

**Replays:** record recent player/ball positions during play; on a goal, replay the last few
seconds from 2–3 camera angles (wide, close-up, behind-goal) using layout-based zoom (re-render
at the zoomed size, don't just scale-transform a bitmap, or it goes soft). Let the player rewatch
any past goal's replay on demand, not just automatically once.

**Player roles/archetypes:** distinct positional behavior (overlapping vs inverted full-backs,
deep-lying playmaker, false nine, target man, poacher, etc.) that visibly changes where a player
stands and the runs he makes — not just a stat modifier. Make this legible: label roles on
screen (toggleable), and show a run as an explicit indicator when it happens, or players just
look like they're drifting randomly.

**Team shape:** must react to context — in vs out of possession, pressing high vs mid-block vs
low block, shifting with the ball. Static shape reads as obviously wrong to anyone who's watched
real football.

**Tone:** classy and understated, not arcadey. No "STEP-OVER!"-style floating labels, no
screen-shake, no big "GOAL!!!" graphics. A quiet broadcast-style strip (scorer, minute, assist)
and a subtle net ripple communicate a goal better than fireworks. (Session 9, at the owner's
request: key actions get a small caption above the player — "Interception", "Cross", "Finesse" —
in the broadcast style: plain case, no exclamation marks, fading after a second, toggleable.)

**Variation:** goal celebrations, tackle types, dribble moves, save types, etc. should be genuinely
varied (driven by hidden per-player traits like flair/temper), or the match feels repetitive fast.

**UI structure:** group controls by function (playback controls near the pitch; team/tactics
panel separate; commentary and stats as tabs, not two competing tall panels). Mobile matters —
plan touch target sizes (≥40px) and layout collapse from the start rather than retrofitting.

## Tech stack (from initial planning)

- React + TypeScript + Vite
- Zustand or context for app state
- Seeded, deterministic TypeScript simulation module, fully decoupled from React — the engine
  should be testable and runnable headless (this is how the prototype's bugs above were actually
  caught: a headless harness that runs matches and asserts on ball/player positions frame by
  frame, not eyeballing the render)
- IndexedDB (via `idb`) for saves
- SVG or Canvas for the pitch/players
- No backend for v1. Online leagues, if ever, are a later, separate concern.

## Suggested build order

1. Engine core: positions-as-source-of-truth simulation loop, with a headless test harness from
   day one (this is non-negotiable given the lesson above — write the position/outcome
   consistency checks before writing gameplay features, not after chasing a bug report)
2. Match viewer: render the engine's output (pitch, players, ball, commentary)
3. Season loop (fixtures, table, calendar)
4. Transfers / scouting
5. Player development / youth intake / academy
6. Polish: replays, view modes, variation systems, UI pass

## Non-goals for v1

- Backend, accounts, online multiplayer leagues
- Full 3D rendering (the prototype's tilted-camera replay effect is a reasonable ceiling for
  "broadcast feel" at this project's scope — true animated 3D players is a different, much
  larger project)
- Deep tactical instruction sets beyond block height / mentality — keep the "auto-pilot with
  optional depth" philosophy from the original brief

## Cross-device workflow note

Claude Code session history doesn't sync across devices. Use a private git repo, commit/push at
the end of each session, and keep this file plus a `PROGRESS.md` (current milestone, what's
in-flight, what's next) up to date so a session on a different device can pick up context by
pulling the repo.

## Repo layout and commands (added in session 1)

- `src/engine/` — the simulation. No React, no DOM: `tsconfig.engine.json` compiles it with
  `lib: ES2023` and no ambient types, so a browser/React import fails `npm run typecheck`.
  - `match.ts` — the tick loop (`createMatch`, `step`, `runMatch`, `frameOf`). Its header
    comment gives the order of operations within a tick.
  - `ai.ts` — intentions only: movement targets and what the carrier tries to do. It never
    decides an outcome.
  - `rules.ts` — positional conditions for taking restarts.
  - `physics.ts` — ball flight (height, gravity, bounces). The loop and the AI's predictions both
    step the ball with `advanceBall`, so predictions are exact.
  - `harness.ts` — `checkMatch()`: runs a match and checks every tick that reported outcomes
    match positions (speeds, possession reach, shot range, offside at the moment of the kick,
    penalty iff foul in the box, goals/outs on the lines, restart gating, no stalls). Its checks
    are written independently of the engine's rule code on purpose.
  - `engine.test.ts` — determinism, zero violations over full matches, loose stat bounds, and
    tests that the harness itself catches injected faults.
- `scripts/calibrate.ts` — `npm run calibrate -- [n] [first seed]`: aggregate stats over n seeds
  next to real-football ranges, with a realism score. Use it for every engine tuning change, with
  80 matches, and confirm on a second seed set (single sets of 20–40 are too noisy).
- `scripts/diag-attacks.ts`, `scripts/diag-crosses.ts`, `scripts/diag-goals.ts`,
  `scripts/diag-corners.ts` — how final-third attacks end; what happens to crosses; where goals
  come from; what put each corner behind. `scripts/diag-defending.ts` — tackles, interceptions,
  recoveries and blocks per 90 by role, and how opponents' passes are won.
- `scripts/sim.ts` — headless CLI runner (`npm run sim -- <seed> [--events]`), runs on Node's
  built-in TypeScript stripping (hence `.ts` import extensions throughout).
- `src/viewer/` — the match viewer (session 2). `timeline.ts` simulates ahead of playback and
  records packed frames; `pitch.ts` draws on canvas through a Camera (wide, close-up, behind the
  goal); `commentary.ts` turns events into lines;
  `highlights.ts` decides what each view mode shows, which kick is in the air, and which
  slides/dives/kicks/headers are animating; `net.ts` animates the ball going into the net;
  `MatchViewer.tsx` is the UI. The viewer only reads engine output; it never feeds back into it.
  `panels.tsx` holds the side-panel tabs (commentary, stats, players); `players.ts` builds
  per-player match lines and ratings from events.
- `src/season/` — the season (session 8), pure TS like the engine: `season.ts` (league from a
  seed, double round-robin fixtures with a match seed each, weekly dates, results, table,
  per-player season counters and per-match team lines), `stats.ts` (leaderboards, each club's
  record, runs and style, for the Stats and Review tabs),
  `simulate.ts` + `simWorker.ts` (fixtures the manager doesn't watch, played by the full engine
  in Web Workers), `store.ts` (the save, in IndexedDB via `idb`).
- `src/draft/` — draft mode (session 9), after 38-0: `squads.ts` holds Premier League squads of
  single seasons (session 14: 43 club-seasons of 20 clubs, 2010/11–2024/25), one line per player:
  name, positions, overall (our estimate of his FIFA rating that season), optional known-as name.
  A player can be in several seasons; the draft never offers a drafted name again and the league
  takes one season per club and drops a name already in an earlier side. `pools.ts` keeps what we
  know by name (foot, weak foot, archetype). `draft.ts` runs the 20 rounds (11 starters + 9 subs,
  one club-season offered per round), turns pool players into engine players and builds the
  20-team league (38 matchdays). Attributes come from a card (session 20): his own FIFA-like six
  group ratings from `draft/cards.ts` (`CARDS`: 340 players, everyone 84+ and clear profiles like
  Vardy or Giroud; [born, season, overall, card], moved to his other seasons by overall and age in
  `cardOf`), else his archetype's card at his overall (`cardFor`, `CARD_SHAPES` in archetypes.ts:
  forwards defend ~45 below their overall, centre-backs shoot ~40 below). `cardAttributes`
  (attributes.ts) fits sub-attributes to it: each group spread by position and archetype
  (`IN_GROUP`, `ARCHETYPE_IN_GROUP`: a striker's defending is heading), shifted until its weighted average
  (FIFA's weights, `GROUPS`) is the card's; heading and stamina aren't fitted but set by level,
  position, archetype and build (`HEADING`, `STAMINA`), so Ronaldo defends at 36 and heads at 15.
  `node scripts/check-cards.ts` prints table vs card (all within 2). A man under 6 interceptions
  (forwards) can let an opponent's ground pass by him (`readsPass`, match.ts). The `falseNine`
  archetype shows as "Deep-lying forward" (DLF). Saved players keep
  their attributes. Club and career players (session 21, `madeCard` in teams.ts) get their archetype's
  card too, at the level that puts their position's skills where the old profiles' were (`CARD_LEVEL`),
  varied by group and build (quick and slight vs slow and strong); `PlayerDef.card` marks them.
  Since session 22 every made-up player's overall (`playerRating`) is on the draft's FIFA-like scale:
  `cardOverall` = `ratingAt(positionLevel)` (FIFA-like `OVERALL_WEIGHTS`) + `CARD_GAP` (how far draft
  players' overalls sit above that, measured, sd ~1), so a club league reads ~67-87, elevens ~80.
  `ability()` (1-20, picks and substitutions) is untouched, still on the old club scale
  (`OVERALL_SHIFT`), so every match plays as before. Save version 4: `upgradeCareer` moves a v3
  career's potentials, changes, levels and history onto the new scale (an old point is 0.8 of a new
  one). Career constants in overall points were scaled by 0.8 with it. `makePlayerAt` makes one at an overall;
  `shiftTo` moves a card player's position skills most, legs and physique at least `BODY_RELEVANCE`.
  `makeAttributes` (old profiles) still reads unknown draft players' archetypes. No transfers in
  this mode. `Season.mode === 'draft'`; season length is `matchdays(s)`.
- `src/screens/` — Start, PickTeam, Draft, Career (summer news, board line, History tab, a player's
  change and career lines), Hub (next fixture; tabs: review at season's end,
  table, fixtures, squad, stats), Squad (shape, the eleven on a pitch with tap-to-swap, fitness,
  injuries, season stats), Stats (leaderboards, clubs, season review), Match. `pitchLayout.ts`
  places a formation on the small pitch. `src/names.ts`: how players are named on screen
  ("van Persie", "De Bruyne", "Son").
- Positions (session 11): a player's `role` plus `positions` (secondary, tertiary). `fitFor` is
  his familiarity with a slot (1, 0.95, 0.9, 0.75 in a line he knows, 0.55 otherwise, 0 in/out of
  goal), times 0.9 for a full-back, wide midfielder or winger on his wrong flank (`naturalSide`:
  his foot, reversed for inside forwards; `sideOf` reads a slot's flank); `playingAttributes` scales his positional attributes by it, and the engine plays him
  with those (`PlayerState.attrs`; `def.attrs` is his best). The staff pick, subs and the draft
  all use `fitFor`. Draft pools write positions as 'W/CM'.
- Archetypes (session 12, `engine/archetypes.ts`): one per player for his position (curated for
  draft players in `pools.ts` `ARCHETYPE`, otherwise read off attributes; re-read for another
  position when he's played out of it). They change behaviour, not ability: where he stands with
  and without the ball (`attackDepthFor`, width, inverted full-backs, false nines dropping and
  arriving late, poachers on the shoulder, inside forwards coming in), runs in behind, pressing,
  aerial duels, how eagerly he shoots or passes forward. Pitch labels ("Roles") show them.
- Sub-attributes (session 15, `engine/attributes.ts`): 26 outfield (sprintSpeed, acceleration,
  finishing, longShots, shotPower, positioning, penalties, shortPassing, longPassing, crossing,
  vision, curve, freeKicks, dribbling, ballControl, agility, reactions, composure, interceptions,
  marking, standingTackle, slidingTackle, heading, strength, jumping, stamina) and 5 keeper
  (diving, handling, reflexes, gkPositioning, kicking). They're made from a broad nine-number
  profile (`expandAttributes`: profile, then position and archetype tweaks, then a little noise);
  `broad()` gives the old nine back (archetype reading), `upgradeAttributes` converts old saves
  (store.ts), `groupRatings` the six card ratings (PAC SHO PAS DRI DEF PHY; keepers DIV HAN KIC REF
  SPD POS). Draft level (`levelOf`, draft.ts) = 13.5 + (overall - 80) / 4 up to 86, then 6 overall
  a point (session 17: a 94 is 16.3, not 17); `toRating` is its inverse. Where each acts:
  ai.ts helpers `accelOf`, `turnOf` (agility, braking/turning), `jumpReach`, `slideReach`,
  `readDelay` (interceptions for an opponent's pass, reactions for other loose balls), `sees`
  (vision gates long and through balls), `crossSkill` (crossing + curve), shot skill (finishing in
  the box, longShots outside, freeKicks direct), finesse by curve, carrier pace by dribbling;
  match.ts: pass execution (short/long/kicking), header duels (`aerialPower`), tackles (sliding vs
  standing, strength), saves (reflexes), catches/claims (handling), shot pace (shotPower).
  Measured worth, -6 for every outfield line (150 matches each, ±0.1): sprint speed and acceleration
  ~0.55 xGD each, jumping ~0.4, dribbling (forwards) ~0.3, agility ~0.3, short and long passing ~0.25,
  crossing ~0.25, finishing (forwards) ~0.2 goals, strength ~0.15, stamina ~0.15; vision, curve,
  free kicks, penalties, heading and each single defending attribute ~0.1 or less (rare events,
  or defending decided by team shape). Rating now decides results about 1 goal a game per 5
  overall (it barely did before, which is why shape and archetype quirks showed).
- Feet (session 12): `PlayerDef.foot` and `weakFoot` (1-5 stars); `strikingFoot` in ai.ts picks the
  foot from where he strikes it (inside foot shooting from wide, outside foot crossing) and how
  well (a one-footed player on the wrong side: 0.8); it scales shot accuracy, pace and cross
  accuracy, and the AI weighs it. Draft data: `LEFT_FOOTED`, `WEAK_FOOT` in pools.ts.
  `SIDE` in pools.ts (session 16) pins the flank a player is known for (`PlayerDef.side`, read
  first by `naturalSide`): Messi is a right-sided player whatever his archetype reads.
- Balance checks for formations and squads: `node scripts/diag-formations.ts [n a pair] [seed] [equal|squad|block] [shapes]`
  (session 23; on every core but one) plays every pair of shapes at equal strength (`equal`: fresh
  squads of one quality built for each shape; `squad`: one squad put out in both by fit x ability) or
  one squad in two blocks (`block`), and prints each shape's xGD against the rest; a '+' after the
  first shape plays only its pairs. 100 a pair (500 matches a shape, ~9 min) is ±0.05; confirm on a
  second seed set. `node scripts/diag-shape.ts <shape> [opp] [n] [seed] [block] [their block]`: each
  slot's average place in and out of possession by third, shots for/against by zone and role,
  regains by third, xG by where the move began. The older scratch checks: the same squad in
  two shapes against itself, and a whole league of every club-decade next to squad ratings. Use
  them after any change to shapes or archetypes; 4-4-2 was once worth a goal a game. Archetype shapes are levelled by
  measured attribute worth per line (`LEVELLED`, archetypes.ts); re-measure if attributes' effects change.
  Measure attribute and archetype worth with a mirror test (a side against a copy of itself with
  one change), 250+ matches; xGD is far less noisy than goals.
- `chooseAction` (ai.ts) gathers options from `passOptions`, `throughBallOptions`, crosses,
  `dribbleOptions`, then `shotIfWorthIt` and `clearanceTarget`; `resolveTouch` (match.ts)
  dispatches to `offsideCall`, `chargeDown`, `keeperClaim`, `keeperSave`, `glancedBehind`,
  `header`. Keep the order of RNG draws when touching either: a refactor should leave matches
  byte-identical (fingerprint a few seeds' events before and after).
- Pass risk (session 18): `groundPassLost` and `raceLost` are calibrated against what actually
  happens (a debug copy picking a random pass 15% of the time, predicted vs lost); re-check that
  way after changing them, as an over-cautious risk sends everything back to the keeper. On top of
  threat, `PROGRESS` values moving the ball upfield, `giveBack` taxes returning it to the passer,
  `holdOption` lets an unpressed carrier wait (harness `hold-on`: never 5 s standing on the ball).
  A first presser in a mid/low block holds his zone (`BLOCK_ENGAGE`).
  Round 2: unpressed in our first 40 m the side takes a build-up shape (`buildUpSpot`); back
  passes cost more as a spell drags on (`backMultFor`); possession is worth more further up
  (`ATTACKING_KEEP`; shots and crosses forgo part of it); a stronger side (`edgeOf`) is less direct
  and a side two up eases off (`keenness`). `giveBack` escalates per swap, harness `ping-pong`.
  Round 3: shot keenness by position (`SHOOTING`); one man to a man (`MARK_SHARE`), 4 m spacing in
  possession (`spaced`), the in-possession line follows the ball (`lineInPossession`), a 26 m block.
  Season fitness: a player gets back 75% of what a match used (`MATCH_RECOVERY`, season.ts). Look at a
  match the way a viewer would with position traces (clumping, standing still, repeated passes),
  not only aggregates.
- Leagues (session 16): `squads.ts` is the Premier League; `squads-laliga.ts`, `-bundesliga.ts`,
  `-seriea.ts`, `-ligue1.ts` hold ~40 club-seasons each (`Pool.league`), with their own
  LEFT_FOOTED / WEAK_FOOT / ARCHETYPE tables merged in pools.ts. POOLS keeps the Premier League
  first (saves refer to pools by index). A draft is of one league (`Draft.league`, `Season.league`).
  Check a squads file with `node scripts/check-squads.ts <file>`; names must match across files.
- Knockout matches (session 16): `MatchConfig.knockout` ({ carried } from a first leg). Level on
  aggregate after 90 goes to extra time (`period` 3 and 4, 15 minutes each; `half` stays the
  direction), then penalties (`MatchState.shootout`): each kick is an ordinary penalty restart at
  the x = 105 goal (the teams are turned round before each kick), ended when it's in, out, held or
  dead; the kicks don't count in the stats or player lines (everything after the `shootout` event).
  Harness: `knockout-level`, `shootout-*`. `node scripts/diag-knockout.ts [n] [seed]`: how often ties
  go to extra time and penalties and how penalties go (real: ~75% in shootouts).
- European cup (session 16, `draft/cup.ts`, `screens/Cup.tsx`): after a draft league, a top-four
  side plays on with the league's top four and three club-seasons from each other league; last 16,
  quarters, semis over two legs, a one-off final, a round a matchday. `Season.cup` keeps guests,
  entrants (`CupSide`: league index, or GUEST + guest index) and fixtures; cup results don't add to
  the league's player stats but fitness and injuries carry on (`recover`). The last 16 is drawn at
  random, then the bracket is fixed. The cup has its own screen (`CupHub`: next tie, bracket,
  results, scorers, squad), reached from the league review's "On to the European Cup"
  (`Season.cupEntered`); App shows it instead of Hub while entered.
- `src/viewer/playback.ts`: the highlight-mode skip as a pure step function (tested).
- Formations (session 10): 4-4-2, 4-3-3, 4-2-3-1, 4-1-4-1, 3-5-2, 3-4-3 (`FORMATIONS`); wing-backs
  are `FB` slots with a big `attackDepth` (> 0.6): out of possession the ball-side one steps up to press, and the far one attacks the back post (session 15). Session 23 levelled them (all within ~0.1 xGD a match at equal strength, was
  -0.49 to +0.24): 4-4-2's centre-midfielders get forward a little (`attackDepth` 0.15), 4-2-3-1's
  second pivot steps up (session 26: a centre-midfielder at 0.4 + 0.4, a "6 and an 8", with the No. 10
  at 0.55 + 0.3 so he drops in beside it out of possession), 3-4-3's midfield two stand as high as a 4-3-3's (0.5 + 0.2) and
  its wide forwards play inside the wing-backs (y 52/16). Block height is not level: see PROGRESS.
  Random clubs use all six; check a shape change with
  `calibrate` and a per-formation shots comparison, as one-striker shapes were once far weaker.
- Corners (session 10): `cornerPlan` in `ai.ts` sends the aerial threats up and a marker with
  each; `cornerSetUp` gates the kick until they're there. Harness: `restart-corner` checks both
  boxes are manned when it's taken.
- Squads (session 9): each club has an eleven and a bench of nine (`TeamDef.bench`, as in the
  Premier League). In a match,
  players tire (`energy`, by stamina and effort, slowing them), managers make up to five
  substitutions in three stoppages, and players get injured (fouls, or strain when exhausted).
  Between matchdays the season carries fitness (partial recovery) and injuries; the staff pick
  (`autoPick`) weighs fitness, so starters get rested. Harness: `sub-*` and `injury` invariants.
- `src/App.tsx` — which screen is showing, and the season state: watching a match plays the rest
  of the matchday in the background; "Continue to results" records the matchday and saves.
  A match plays the same whether watched or simulated (same seed), so results never disagree.

- Ratings and stats (session 13): `viewer/players.ts` `playerLines` builds each player's match
  line from events (xG, xA, big chances, blocks, clearances, headers, recoveries, keeper's xG
  faced …) and `rate` turns it into a rating with a per-position offset (`OFFSET`, scaled by
  minutes played) levelled so a regular's season average is ~6.75 in any position. Check a change
  over single matches with `node scripts/diag-ratings.ts 60`, and over a season by re-rating a
  saved `sim-season` file (appearances keep every counter `rate` needs).
  Season counters are `COUNTERS` in season.ts (line counters added straight up).
  `season/review.ts` picks the season's standouts and notable games; `screens/PlayerCard.tsx`
  is a player's season with a match log; `screens/PlayerTable.tsx` the league's player table.
  `scripts/sim-season.ts <seed> <matchdays> <out.json> [league] ["Name:overall"]` plays a draft
  season headlessly (a greedy 4-3-3 draft, optionally with one player put in first) and saves it,
  for checking these against a whole season (~10-18 min for 38 matchdays; run seeds in parallel).
- Player balance (session 17): judge a star by a season of him in a drafted side (sim-season with
  him forced, 4+ seeds: one season is noisy, ±10 goals) and by a mirror (the drafted side against
  the league with him swapped for an 85, 76+ matches each, full fitness). Real ranges: elite
  strikers 0.8-1.2 goals/90 (Messi's 11/12 peak ~1.4), Pichichi 25-35 (Messi/Ronaldo era 40-50),
  best side 110-121 goals and ~100 points, the best finishers beat npxG by 15-20%. Since the box
  arrivals (session 17, later) a lone striker takes ~30-38% of his side's npxG in the top decile
  (was ~55%; real ~45% at most) and defenders score ~10% of goals; full-backs still rarely shoot.
- Defensive stats and box arrivals (session 17, later). An opponent's pass won is classed by
  position (`passWon`, match.ts; `won` on the possession event): at the receiver (within
  `DUEL_REACH`) a tackle, right by the passer (`BLOCK_NEAR`) a block, beyond where it was aimed
  (`OVERRUN`) a recovery, otherwise cut out on its way, an interception (Opta's definitions). Poor
  readers set off later for a ball (`delayFor`), poor tacklers go in less (`willing`). Late runs:
  with the ball past `ARRIVAL_FROM`, midfielders (by `ARRIVAL` eagerness) and full-backs arrive in
  the box from behind the ball (`runKind` 'late', `lateRunSpot`); markers lose them unless close.
  Overlaps: with a teammate on the ball wide on his flank in their half (`OVERLAP_*`), a full-back
  goes past him, outside, or inside for an inverted one (`runKind` 'overlap', `overlapSpot`).
  Corners go only to the men the corner plan sent up; a defender in his own box has an aerial edge
  (`AERIAL_DEFENDER_EDGE`). No shot on the spin with a man tight goal-side (`backToGoal`). Harness:
  `pass-won`, `late-run`, `overlap`, `shot-on-the-spin`. Run events carry `kind`.
- January window (session 13, draft mode only): `draft/transfers.ts` (`judge`, `makeDeal`),
  `screens/Transfers.tsx` (the Deals tab). Session 16: a deal is judged by what it does to each
  side's best eleven (`elevenOf`, `sideOf`: convex value of fitted ratings, plus a little depth;
  a rival near you in the table or losing its best player asks more), with plain reasons ("X would
  start right wing, ahead of Y"). `offersFor` makes up to two AI offers each window matchday,
  seeded by matchday; turned-down ones are kept in `Season.declined`. Deals are recorded in `Season.transfers`; a player's
  stats stay keyed by his id and go with him (`matchLog` uses the record to know his side).

- UI conventions (session 17): motion tokens on `:root` in `index.css` (`--ease-out`, `--dur-press`
  110ms, `--dur-fast` 180, `--dur-base` 280, `--dur-slow` 420, `--stagger` 28ms). Enter animations
  only animate *from* (fill-mode `backwards`), so nothing keeps a transform once settled (a transform
  would trap the draft's fixed sheet). Classes: `.screen` (App wraps each screen, keyed, fades up),
  `.tab-panel` (key it by tab), `.rise` / `.row-in` / `.deal-in` with `style={stagger(i)}`
  (`screens/motion.ts`), `.slot.placed`; `CountUp` for the review's numbers. One reduced-motion
  rule at the end of `index.css` flattens everything. Tabs: `TabBar` (`screens/Tabs.tsx`), scrolls
  sideways and keeps the chosen tab in view, optional badge. Breakpoints: 560px (tables drop `.wide`
  columns, tabs tighten), 720px (squad pitch beside the list), 900px (hub and draft two-column;
  below it the draft's side is a bottom sheet that rises when a player is chosen). Grid children
  need `minmax(0, 1fr)` / `min-width: 0` or a long name pushes the page sideways. Touch targets
  ≥ 40px. Check with a Playwright pass at 390x844 and 1280x800: no horizontal scroll, no console
  errors.

- Career mode (session 19, `src/career/career.ts`, pure TS): club mode is now a career (`Season.career`,
  save version 3; `upgradeCareer` makes an old club save season 1). `Career.people` holds each player's
  age and hidden potential (on the overall scale) and his last summer's `change`; `history` keeps each
  finished season (place, points, board target met, top scorers, trophies, every player's season
  line); `levels` is each club's strength when the career began. `nextSeason` runs the summer:
  `development` (closing a share of the gap to potential to 26, faster with minutes and rating; 27-30
  hold; decline from 31, faster each year; keepers two years later), applied by `shiftTo`, which moves
  sub-attributes a point at a time until the overall is the target (pace, agility and stamina first
  on the way down); retirements from 34 (keepers 36); a made-up signing for each retirement at the
  club's level; two or three academy players (16-18, below the club's eleven, potential against the
  league's level, now and then a gem); squads capped at `SQUAD_MAX` 24 by releasing the least promising
  of 19+. Newcomers are pulled against the league's drift (`DRIFT_PULL`) so the league neither
  inflates nor drains. Then a fresh `createSeason` with the same clubs a year on, elevens re-picked.
  Board target (`aimFor`, by `elevenRating` rank: top 15% title, top half, else avoid the bottom 15%).
  Club strength in career code is `elevenRating` (the staff's eleven), not `squadRating` (formation
  order). Check the long run with `node scripts/sim-career.ts <seed> 5` (every match played, ~15 min
  a 20-club season; run seeds in parallel): goals a match, top scorer, best side, league level, per-90 by line
  and age. `career/fake.ts` plays a season without the engine, for tests of the long run.

- Career market (session 19, stage 2): career leagues are 20 clubs, 38 matchdays (`LEAGUE_SIZE`);
  `leagueTeams` renames so nobody in a squad shares a surname (`freshName`; randomTeam itself is
  untouched, so friendlies and calibrate play the same). `career/money.ts`: `marketValue` (overall
  priced by position, `ROLE_OFFSET`, plus some of his room to grow while young, less with age),
  `wage`, `wageBill`, `Career.finance` (cash, income ≈ the starting wage bill; `settle` each summer
  adds income and prize money, takes wages). Windows in a career: August's and January's matchdays
  (`windowOf`, `thisWindow` scope the per-window limits). `draft/transfers.ts` serves both modes:
  draft is unchanged (players only); a career deal may carry a `fee` (+ the manager pays), judged by
  `judgeForMoney` / `askingPrice` (values, a margin, `POINT_VALUE` £m per point of sideOf's curve,
  whose reference is the league's level, `curveRef`); offers are bids for your players
  (`moneyOffers`). `career/market.ts` `marketDay`: the other clubs' deals among themselves, called
  after each matchday and at a season's start (≤ 2 a matchday, ≤ 5 a window; one per club a window;
  never from the strongest side, which doesn't buy either, nor does the table's leader (session 22);
  the top four don't take a rival's two best). AI clubs still get a
  signing for each retirement; the manager's club doesn't. No contracts yet.
  Session 22: retirement signings and academy players are made at the club's level plus their
  position's `ROLE_OFFSET` (strikers read ~4 low, centre-midfielders ~2 high on the card scale).
  Squads' average overall falls ~1 over five seasons only because squads fill from 20 to 24 with
  academy kids; sim-career prints the best twenty of each squad, which holds.

- Career depth (session 25, save version 5; `upgradeCareer` → `withContracts` gives a v4 career
  contracts, an empty pool, and the cup if its first round is still to come).
  Contracts (`career/contracts.ts`): `Person.contract` = { until (the summer it ends), wage £k/week,
  leaving? }. Year arithmetic: `seasonYear(s)` is the start year; `yearsLeft` = until - start year, 1 in
  his last year. `firstContract` 1-5 years by age at today's `wage`; renewals at `askedWage` (value incl.
  young room, ×0.8 from 33) for `contractLength(age)` years. The manager renews or lets go in his last
  year (Contracts tab); the summer (`nextSeason`) releases whoever ran out at his club, while AI staff
  keep by squad rank and age (`staffKeeps`: ~75% of expiring stay, retirements counted). `staffRenewals` does the manager's
  the same way (sim-career uses it). `valueOf` (money.ts) is `marketValue` × `CONTRACT_FACTOR` (0.6
  in the last year, 0.85 with two left); `wageBill` sums contract wages (`wageOf`).
  Free agents: `Career.freeAgents` (expired, released by the 24 cap, and 6 made-up a summer; best
  `POOL_MAX` 60 kept for a season). In the summer each AI departure (retired or expired) is replaced
  from the pool if someone of that role fits within `FREE_FIT` 3 of the overall the club would sign at
  (chosen by `sideOf` value × POINT_VALUE − a season's wages; ~1 in 5 places), else made up as before. The manager signs
  any while a window is open (`judgeFreeAgent`: squad < 26, a season's wages in cash, and a player at
  the eleven's level won't come to sit on the bench); `addToClub` adds condition, stats, contract.
  The manager's club gets no replacements unless he's let it fall below `MANAGER_MIN` 16.
  Domestic cup (`career/cup.ts`, `Career.cup`, the `Cup` type with no guests): all 20 clubs, one leg,
  extra time and penalties (engine `knockout: {}`); the 8 weakest by `elevenRating` play a first round,
  then open draws (`completeCupDay` draws the next round when one ends). Rounds are midweek before
  league matchdays `cupSchedule` (38: 6, 13, 19, 26, 32): a cup day is `cupToday(s)` non-empty, and is
  played before that matchday's league games without moving `s.matchday`; `recover` runs with
  matchday - 1 so an injury counts from that weekend. Cup matches don't touch league stats. App plays a
  round the manager isn't in first, on its own (`cupRoundFirst`); `todaysMatches` prefetches it.
  `PastSeason.cup` {winner, run}, `trophies` gets 'Cup', `record` W/D/L (league + cup);
  `managerRecord(history)` for the History tab. Screens: `DomesticCup.tsx` (Cup tab), `Contracts.tsx`
  (Contracts tab: money, renewals, free agents, the squad's contracts).
  Wages (session 25, later): income starts at the wage bill / 0.9 (`START_WAGES`); every wage, asks
  included, is by what he's worth now (`askedWage` adds 15% of a young man's room to grow), so wages
  stay at the level income was set at. Other clubs keep within `WAGE_BUDGET` 0.95 of income in the
  summer: the top eleven are always renewed, other renewals only if there's room, then places go
  unfilled and the least promising are let go, down to `AI_MIN_SQUAD` 20 (`wageAt` estimates a place
  still to fill). The manager in the red (`inTheRed`, cash < 0) can't sign free agents, renew at a
  rise (`renewProblem`) or make a deal that adds wages (`judgeForMoney`); a fee is checked against
  cash only when he pays one.

- Performance (session 21). A match is ~41k ticks, ~1.3 s on one desktop core (was ~2.4 s). Hot,
  in order: the per-tick movement intents (`playIntent` → `shapeTarget`, `defendIntent`, ~40%),
  the carrier's options (`chooseAction`: through balls, passes, their races, ~17%), loose-ball
  chasers (`pickChasers` → `arrivalOf`), `movePlayer`, ball paths, GC. What made it faster, all
  without changing a result: a per-tick snapshot (module variable, also held while choosing an
  action) caching side lists, lines, offside lines, the ball's frame, the corner plan and pair
  distances (`pairDist`, `nearestTo`); `firstReach` passing over path points a man can't reach even
  flat out (`arrivalOf` and the race searches stop at the best arrival so far); options bounded
  before their costly part (a lane, a race) and skipped if they can't beat the best so far, with
  their random draw still made (`Decision.bestU`, `BOUND_SLACK`); hot geometry on numbers
  (`ballPath`, `movePlayer`, `afX`, `wfXY`). Rules for such work: keep the RNG draws in the same
  order and the arithmetic in the same order (a + b + c is not a + (b + c) in floats; `wf(af(p))`
  is not p), and check with `node scripts/fingerprint.ts` before and after (24 matches: club,
  career, draft, knockout with penalties; every hash must match) plus `calibrate 80 1` (identical).
  Profile with `node --cpu-prof` on a small runner; `--no-turbo-inlining` shows helpers' share.
- Matchday in the browser (`season/simulate.ts`): a lasting pool of workers (one a core while the
  manager waits, up to 8; one core left free for background work), and results kept by their
  inputs (sides, seed, fitness of the match's players, tie): the hub starts the day's matches as
  soon as it shows (`prefetch`), so "Just the result" or the rest of a watched day is mostly done;
  a changed eleven is a different match and is played afresh. `autoPick` works out each man's
  ability once a pick (the market asks for many elevens a window day).

- Blocks (session 24, ai.ts). A high block presses in bursts: for `PRESS_SPELL` (3 s) after it
  loses the ball (or a restart, `sinceLost`) it plays high (`BLOCK_LINES.high`, `PRESS_LINES`),
  then settles to mid lines with a first presser engaging only inside `HIGH_SETTLED_PRESS` (60 m)
  (`blockNow`, cached in the snapshot). A side counter-presses for `COUNTER_PRESS` (5 s) when the two
  elevens are equal; since session 26 `counterPressFor` scales it by `qualityGap` (the elevens' average
  overall at kick-off, made-up players net of `ROLE_OFFSET`, which moved to attributes.ts): up to twice
  as long for the better side, none for one `COUNTER_PRESS_SPAN` (6) worse. It's the one place quality
  steers tactics, with the cynical foul (match.ts: an outclassed side pulls a man back on a break up to
  twice as often, which kept fouls at ~9); mirror tests (same squad) are unaffected, as the gap is 0. A low
  block's line never drops below 17 m (the box edge, not the six-yard line) and, with the ball
  inside `LOW_COMPACT_FROM`, closes up (`LOW_LENGTH` 16 m long, `LOW_WIDTH`). Clearances: a wide
  defender goes for touch, anyone else aims inside the pitch (`CLEAR_IN`, `CLEAR_WIDE`; harness
  `clearance-in-play`); defensive headers go away from the middle (`HEADED_WIDE`). Measure with
  `diag-formations <n> <seed> block` and `node scripts/diag-blocks.ts <blockA> <blockB> [n] [seed]`
  (regains by third, clearances and where they go, shot sources, line height, spells by start).
  Level blocks made for quieter games, so shooting was retuned along with them: `EAGER` 0.9, keener
  in the box than from range (`BOX_KEEN` 1.15, `RANGE_KEEN` 0.85), `FINISHING_SPREAD` 0.85 (ai.ts),
  and `FINAL_THIRD_TACKLING` 7 (match.ts). Career leagues score ~0.88 of calibrate's goals a match.
- Strength (session 26): `node scripts/diag-strength.ts [n] [first career seed] [careers]` plays the
  first season's career sides at full fitness in random pairs and regresses xGD, GD and points a
  match on the elevens' overall gap (xGD is the one to trust; points ±0.012 at 600 matches). A
  league's champion is set mostly by that points slope times the spread of its elevens: at 0.134 a
  point (session 24) a third of career champions were under 80; at ~0.16 (session 26) ~85-90.
  `sim-season.ts ... "Name:overall" dominant` fills the rest of the eleven with the league's best
  player for each place (La Liga: ~90) for the dominant-side check.

When adding a gameplay feature: add its position/outcome invariant to `harness.ts` first.
