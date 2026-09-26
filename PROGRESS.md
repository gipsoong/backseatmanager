# Progress

Updated at the end of each session. Keep this short — current state, not a full history.

## Current milestone

**3. Season loop** — first version done (session 8): league, fixtures, table, calendar, saves.
Next: squad depth, then transfers.

## Done (session 8): season loop, Players tab, faster engine

- **Season loop** (milestone 3): start screen (continue / new season / friendly), pick a club
  from a 10-team league (squad ratings shown), season hub with the next fixture, league table
  (form, your row highlighted) and results/fixtures by matchday with scorers. Watch your match
  (the rest of the matchday plays in background workers meanwhile) or take just the result.
  Double round-robin, 18 weekly matchdays from August, no team more than two in a row at home
  or away. Saved to IndexedDB after every matchday; carries on after a reload. League size is
  `LEAGUE_SIZE` in `season.ts`.
- **Players tab**: line-ups with each player's live match line and rating; a player card with
  attributes and standout traits in words. Stats tab adds tackles won, interceptions, saves.
- **Engine**: 2.6x faster (5.4 s → 2.1 s per match headless): players choose moves from one
  snapshot per tick. Keepers tip high shots over; wide players value the byline (cut-backs).
  Realism 29/31 and 28/31 on the two seed sets (through balls now shown, not scored).
- Kicking-leg animation only in the close-up camera.

## Done (session 7): realism pass, player traits, skip overlay, goal and ball animation

**Realism scorecard** (`npm run calibrate -- 80 [first seed]`): 32 metrics against top-flight
ranges, with a realism score. 84–88% of metrics in range across two independent sets of 80
matches (seeds 1–80: 28/32; seeds 201–280: 27/32). Per team: goals 1.2–1.4, shots ~11, xG ~1.2,
goals per xG ~1.0, save % 62–68, passes ~490 at 86%, avg pass 19m, fouls ~11, yellows ~2,
tackles won ~13 (35% in own third, 9% in final third), headed shots ~14%, ball in play ~60 min.
Consistent misses: corners (~1.9 vs 4–6.5), offsides (~0.8 vs 1–3), through balls (~7 vs a rough
1–5). Noisy between seed sets: won-by-4+ % and the longest dull spell.

- **Stoppage time**: the clock now counts stoppages the engine doesn't simulate (fetching the ball,
  setting up free kicks and corners, celebrations, treatment and substitutions), so the ball is in
  play ~60 of 94 minutes as in real matches. This alone brought passes, tackles and shots per
  match into real ranges. The timeline records the clock per tick.
- **Player traits** (hidden, 0–1, leaning by role): flair, temper, and new aggression, work rate
  and directness. They drive challenge frequency, how tight a player presses and how high, how hard
  he gets back into shape and makes runs, and how forward-looking his passing is; flair and temper
  as before (take-ons, shooting, one-twos, fouls, cynical fouls, cards, celebrations).
- **Challenges** are rarer and trait-driven (defenders mostly jockey); cynical fouls when beaten;
  aerial fouls in contested headers (harness: `foul-aerial`). Forwards counter-press.
- **Offsides**: forwards drift on the shoulder of the last defender; defenders hold the line
  rather than following an offside runner; passers judge the line imperfectly.
- **Keepers**: save chance refitted (placement, reaction time); xG factor refitted to 1.45.
- **Out of play**: tackles poke the ball through the carrier (often into touch near the line),
  defenders put it into touch under pressure, glances go wide of the post, blocks ricochet.
- Squad quality range narrowed to 11–15 (one league, not League Two vs the champions).
- **Viewer — skips**: in Key moments / Goals, the match fast-forwards underneath a light scrim
  (with a small "Next key moment 67'" caption) instead of cutting to a blank pitch; longer gaps take
  a little longer (1.2–3.2 s).
- **Viewer — animation**: the ball carries on into the goal at the pace and height it went in,
  stretches the back of the net where it hits, drops and settles while the net springs back
  (`net.ts`); kicks swing a leg towards the pass/shot; players rise for headers; a runner knocks the
  ball ahead and gathers it in stride. Goal replays run on until the ball has settled, and the
  close-up stays on the goal.

## Done (session 6): attacking AI, crosses, keepers, defending

Measured over 40 matches (`npm run calibrate -- 40`), per team. Before → after: shots 4.6 → 12.2,
xG 0.5 → 1.8, goals 0.8 → 2.0, longest dull spell 54 → 32 min, crosses 2.5 → 7.5, headed shots 14%.

- **Races on the real ball path.** Through balls, lofted passes and crosses are judged by a race:
  the tick the receiver can first reach the ball on its actual flight (`ballPath`) against the
  first opponent's, using `arrivalOf`/`reachTime` (acceleration, and a man running the other way
  has to stop first). A level race is a 50/50 (`raceLost`); a defender right in front of the kick
  is priced as the loop's charge-down chance, not a certain block. The old "ball vs defender" model
  rated every cross as lost, so wingers never crossed.
- **Through balls** into space 6/11/16m ahead of forwards and late-running midfielders, on the
  ground or over the top (lofted only to land outside the box and away from the touchline). The
  `through` flag on pass events marks balls from in front of the defensive line to beyond it.
- **Crosses into space**: near post, penalty spot, far post, or pulled back from the byline.
  `isCross` (by target) decides head-height delivery in both the AI and the kick.
- **Runs**: in behind when the man on the ball has time (more when marked tight), angled into the
  channels; one-twos (`giveAndGo`, `runTo`); marked forwards check back short. All emit `run`.
- **Carriers**: a receiver under pressure decides quickly; a clean-through carrier runs at goal.
  Passing under pressure is less accurate (`pressureOn`, in both the kick and the AI's risk).
- **Keepers**: save chance from placement and reaction time, not raw pace; bigger dive reach; only
  come for a ball they'll reach first; sweep behind a high line; rush a carrier only when he's
  clean through; unchallenged claims rarely fail.
- **Defending**: back line drops when the ball is unpressured, and to the six-yard box when the
  ball is wide near the byline; markers never end up on the wrong side of their man (tighter in the
  box); a back-liner goes with a forward already in behind him; a second man chases a ball running
  towards his goal; chasers picked with the acceleration-aware arrival.
- **Fixes**: a mistimed header or failed claim only bars the player for a moment (it used to bar
  him for the whole flight, so a ball could bounce past a keeper standing next to it into the net);
  no lofted back-passes (half of all corners were these, overhit over the team's own byline); a
  blocker can't gather his own ricochet; contested headers are harder to win and to direct.
- Diagnostics: `scripts/diag-attacks.ts` (how final-third attacks end), `scripts/diag-crosses.ts`
  (what happens to crosses).

## Done (session 5): exploits closed, replays of key moments, runs, dribble moves

- **Exploits found from user feedback and closed.** 55% of goals came from forwards charging down
  a keeper's release (keepers can now hold the ball unchallenged; forwards stand off; the release
  can't be played at source — harness `keeper-release`); most of the rest from defenders' clearances
  struck into the man pressing them (defenders now clear away from him; a point-blank strike is only
  sometimes charged down, and ricochets). Balls struck away from a player can't be played by him
  where they left unless he's tight enough to charge them down.
- Honest baseline after that (20 matches): goals ~1.0/team, shots ~5, on target 32%, no exploits.
  **Open-play chance creation is the main realism gap**: teams rarely work the ball into shooting
  positions (safe recycling, 88% pass completion; forwards marked, few runs in behind, no through
  balls into space). This needs a focused attacking-AI pass, not tuning.
- Replays of key moments with their build-up (from when the team won the ball / took the set piece,
  5–15s back): goals (3 angles), penalty fouls and red cards (wide + close-up), big chances and
  last-ditch tackles in the box (wide). Rewatch from the commentary.
- Run indicators: the engine emits `run` events; the viewer draws a fading dashed arrow to where
  the runner actually ends up.
- Dribble moves when a dribbler beats a tackle (step-over, drag-back, burst, feint), chosen from
  where the tackle came from and his flair/pace, and changing his movement; commentary in the
  final third.

## Done (session 4): match presentation

- Highlights modes cut between moments (fade to the grass, clock rolls on, fade in) instead of
  fast-forwarding; skipped play still updates commentary and stats.
- Goal replays: after the (live) celebration, the goal is replayed wide, in slow-motion
  close-up following the ball, and from behind the goal in true perspective; any goal can be
  rewatched from its commentary line. Drawing goes through a Camera (`pitch.ts`), re-rendered per
  angle rather than scaled.
- Variation driven by positions and traits, all checked by the harness: celebrations (scorer's
  flair picks corner-flag run / knee slide / fist pump; teammates join), slide vs standing
  tackles (from the tackle distance), diving vs body saves (from how far the ball was from the
  keeper). Viewer animates slides and dives; commentary mentions them.
- Engine fixes: keeper-chip own goals, stuck loose balls, keeper save rate (see notes).

## Done (session 3): ball height, calibration, view modes

- Engine: the ball flies in 3D (`physics.ts`, shared by loop and AI predictions). Players can
  only play a ball within reach height (header 2.4m, keeper's hands 2.8m in his box), so chipped
  passes clear defenders, crosses are headed, shots go over or hit the bar. Crosses aimed at head
  height; box runs (near post, far post, penalty spot) when the ball is wide in the final third;
  keepers claim/punch crosses and parry wide; blocks keep going (corners).
- Harness: touch height within reach, owned ball on the ground, goals under the bar, "out"
  between the posts only over the bar, on-target flag matches the predicted height, kicks and
  touches checked in order (a header is a touch then a kick).
- `npm run calibrate -- [n]`: aggregate stats over n seeds vs real-football ranges. Latest (20):
  goals 1.4, shots 13, on target 38%, xG 1.5, passes 600, pass 75%, fouls 12, yellows 1.9,
  throw-ins 24, offsides 1.0, penalties 0.3/match — all in range. Still low: corners (~1.5 vs
  4–6.5) and headed shots (~2% vs 10–25%). xG is the AI's chance model × 0.6 (`XG_CALIBRATION`).
- Viewer: Full match / Key moments / Goals. Outside a moment's window (9s build-up, 4–7s after)
  the playhead fast-forwards at 2.5 match-minutes per second, stopping exactly at the next
  window and never running ahead of what's been simulated. Off-camera play is simulated in full.
- Viewer: bigger ball drawn lifted above its shadow by its height; pass/shot/clearance lines
  trace the ball's actual recorded path (dashed ground passes, dotted lofted balls, solid shots),
  brighter where the ball has been, fading when the flight ends.

## Done (session 2): match viewer

- `src/viewer/timeline.ts`: runs the engine a few ms per animation frame, ahead of playback, and
  records every tick into one packed Float32Array plus stats snapshots every second. Playback,
  pause and seeking just read the buffer.
- Canvas pitch drawn to real dimensions at the displayed size (layout-based, DPR-aware),
  players and ball interpolated between ticks, shirt numbers, toggleable role labels, team kits
  (away side changes on a colour clash), net ripple on a goal, ball held in the net until kick-off.
- Broadcast scorebug (score, clock, HT/FT), lower-third goal strip (scorer, minute, assist).
- Controls: play/pause, 1×/2×/4× (1× = 3× real time, so a full match takes ~30 min at 1×),
  scrubber showing played/simulated portions and goal markers (only goals already seen).
- Commentary and Stats tabs; clicking a commentary line jumps there (a few seconds early for
  goals and chances). Commentary comes from the event stream, deterministic phrasing.
- `viewer.test.ts`: recorded frames equal the engine's, the reconstructed clock matches every
  event's clock, one commentary line per goal.

## Done (session 1)

- Vite + React + TypeScript scaffold, Vitest, oxlint.
- `src/engine/`: seeded (mulberry32), deterministic, 10 ticks/s, fixed order of operations per
  tick (decide → move → ball → challenges → clock). Outcomes are resolved from positions: the
  ball's path is walked each tick and the first player within reach (or line) resolves it;
  offside is judged from positions at the kick and called when the offside player touches it;
  penalty vs free kick comes from the fouled player's actual position; restarts wait until
  players are where the laws require (kick-off only once everyone is back in their half).
- Team shape reacts to ball position, possession and block height (low/mid/high); pressing,
  cover, goal-side marking, forwards holding the offside line and timing runs, keeper
  positioning/claiming, receivers moving into space.
- Headless harness (`harness.ts`) + tests. `npm run sim -- <seed>` for a single match.
- Minimal app shell that runs a match and shows score, scorers and stats.

## Calibration notes

Session 4 findings (read before the next tuning pass):
- The session-3 baseline's healthy scoring was partly an illusion: ~half its goals were own goals
  from chipped back-passes to the keeper (he "headed" them, mistimed, into his own net). Fixed by
  never chipping to the keeper; keepers then saved too much (14% of on-target shots scored vs
  ~30% real), fixed in `pSave`; xG factor re-fitted to 0.85.
- Bug fixed: a player who missed a touch was barred from that kick forever, so a ball could stop
  at two players' feet and sit there (harness `dead-loose-ball`).
- Crosses/corners/headers are low for structural reasons, found with instrumentation:
  1. A defender pressing within ~1m of the ball is within control reach of where a pass starts,
     so the loop lets him cut out passes played *away* from him. Physically wrong, but fixing it
     alone made possession far too safe (870 passes, few fouls) and destabilised everything.
  2. The AI's pass-risk model treats every opponent as a potential chaser; the loop only sends the
     best-placed one. A model mirroring the loop (passive "ball runs past him" + one chaser) is
     more faithful, but again shifted the whole balance.
  3. Box runners drift offside as defenders drop, so wingers correctly won't pass to them.
  Tried together these made the match worse, so they were reverted. Next attempt: change one at a
  time and re-balance pressing/tackling around it before moving on to the next.

The system is sensitive: small AI changes swing goals 2×. Judge every engine change with
`npm run calibrate`, never on one match. Session 3's biggest wins came from diagnosing *why* a
number was off (e.g. the pass-risk model rating an opponent already on the passing line as a
coin flip; defenders heading their own team's chipped passes clear), not from turning knobs.

## In flight / next up

1. **Season depth**: a squad beyond the starting XI (substitutes, rotation), then stamina and
   injuries (their stoppage time is already on the clock). End of season: promotion/relegation or
   just a new season with the same clubs, player ageing.
2. **Transfers / scouting** (milestone 4), then development / youth (milestone 5).
3. **Realism gaps**: corners (~1.9 vs 4–6.5) need a model of clearing under pressure; offsides
   (~0.85 vs 1–3) need forwards who mistime runs; both are behaviour, not tuning.
4. Optional: a friendlier results screen after each matchday (other scores coming in).

## Open questions / decisions deferred

- Offside phase resets on *any* touch, including saves and deflections (the real law only resets
  on a deliberate play). The harness mirrors this. Revisit with ball height.
- `chooseAction` consumes the match RNG, so calling it outside the loop (a debugger, or a UI
  "what would he do") changes the rest of the match. Fine for now; clone the RNG if needed.
- No substitutions, stamina or injuries yet (their stoppage time is on the clock).
- Players are clamped to the pitch rectangle (no one steps over a line).

## Notes for the next session

- Read CLAUDE.md first, especially "the one lesson worth internalizing" and the repo layout.
- `npm test` takes ~80s (six full matches through the harness, plus the viewer tests);
  `npm run calibrate -- 80` ~3 min. Tune on one seed set, confirm on another (`-- 80 201`).
- Commit and push before ending a session — history doesn't carry across devices.
