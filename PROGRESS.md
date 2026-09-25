# Progress

Updated at the end of each session. Keep this short — current state, not a full history.

## Current milestone

**2. Match viewer** — first pass done (session 2). **1. Engine core** is done apart from calibration.

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

## Calibration snapshot (24 seeds, per team per match)

throw-ins are rare (players and ball carriers stay well inside the lines), goals ~2, shots ~15,
on target ~70% (real ≈35%), xG ~3 (generous model), passes ~880 (real
≈450), pass completion ~77%, fouls ~8, yellows ~1.4, corners ~0.1 (real ≈5), offsides ~1.
Results can be lopsided (11–2 seen) because random team quality spreads widely.
The system is sensitive: small AI changes swing goals 2×. Judge changes on aggregates over many
seeds, not one match.

## In flight / next up

0. **Viewer follow-ups**: key-moments / goals-only view modes (skip between events; the timeline
   already makes this cheap), run indicators for players making runs (engine has `runUntil`,
   not yet exported in frames), replays. Matches can go 10+ minutes with no incident because
   the ball rarely goes out of play (see calibration), which makes full-match viewing slow.
1. **Calibration pass** (before the viewer, or alongside it): add an aggregate-stats script
   (~20 seeds) to `scripts/`, then target realistic ranges. Likely levers:
   - Ball height: no aerial balls yet, so no crosses/headers/over-the-bar. This is why corners
     are ~0 and on-target % is high. Add a height/lofted component to kicks, with the harness
     checking that only a lofted ball can pass over a player.
   - Pass tempo is too high (too many short passes): decision interval and pass selection.
   - Narrow the random team quality spread.
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
- `npm test` takes ~40s (six full matches through the harness, plus the viewer tests).
- Commit and push before ending a session — history doesn't carry across devices.
