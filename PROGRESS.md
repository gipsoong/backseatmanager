# Progress

Updated at the end of each session. Keep this short — current state, not a full history.

## Current milestone

**2. Match viewer** — view modes and ball flight done (session 3). Engine calibrated to real ranges
except corners and headers.

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

0. **Attacking AI** (main realism gap, see session 5): through balls into space behind the line,
   more and better-timed runs, one-twos/third-man runs, attackers getting free of markers. Then
   re-calibrate crosses, corners and headers.
2. Season loop, transfers/scouting, development/youth, polish (see CLAUDE.md).

## Open questions / decisions deferred

- Offside phase resets on *any* touch, including saves and deflections (the real law only resets
  on a deliberate play). The harness mirrors this. Revisit with ball height.
- `chooseAction` consumes the match RNG, so calling it outside the loop (a debugger, or a UI
  "what would he do") changes the rest of the match. Fine for now; clone the RNG if needed.
- No substitutions, stamina or injuries yet.
- Players are clamped to the pitch rectangle (no one steps over a line).

## Notes for the next session

- Read CLAUDE.md first, especially "the one lesson worth internalizing" and the repo layout.
- `npm test` takes ~40s (six full matches through the harness, plus the viewer tests);
  `npm run calibrate` ~50s for 20 matches.
- Commit and push before ending a session — history doesn't carry across devices.
