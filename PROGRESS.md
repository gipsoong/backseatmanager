# Progress

Updated at the end of each session. Keep this short — current state, not a full history.

## Current milestone

**1. Engine core** — first pass done. The loop, AI, rules and headless harness are in place;
full matches run deterministically with zero invariant violations. Calibration is rough.

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

goals ~2, shots ~15, on target ~70% (real ≈35%), xG ~3 (generous model), passes ~880 (real
≈450), pass completion ~77%, fouls ~8, yellows ~1.4, corners ~0.1 (real ≈5), offsides ~1.
Results can be lopsided (11–2 seen) because random team quality spreads widely.
The system is sensitive: small AI changes swing goals 2×. Judge changes on aggregates over many
seeds, not one match.

## In flight / next up

1. **Calibration pass** (before the viewer, or alongside it): add an aggregate-stats script
   (~20 seeds) to `scripts/`, then target realistic ranges. Likely levers:
   - Ball height: no aerial balls yet, so no crosses/headers/over-the-bar. This is why corners
     are ~0 and on-target % is high. Add a height/lofted component to kicks, with the harness
     checking that only a lofted ball can pass over a player.
   - Pass tempo is too high (too many short passes): decision interval and pass selection.
   - Narrow the random team quality spread.
2. **Match viewer**: render `frameOf()` output (pitch, players, ball), 1×/2×/4×, commentary from
   the event stream. The engine already emits everything needed.
3. Season loop, transfers/scouting, development/youth, polish (see CLAUDE.md).

## Open questions / decisions deferred

- Offside phase resets on *any* touch, including saves and deflections (the real law only resets
  on a deliberate play). The harness mirrors this. Revisit with ball height.
- `chooseAction` consumes the match RNG, so calling it outside the loop (a debugger, or a UI
  "what would he do") changes the rest of the match. Fine for now; clone the RNG if needed.
- No substitutions, stamina or injuries yet.
- Players are clamped to the pitch rectangle (no one steps over a line).

## Notes for the next session

- Read CLAUDE.md first, especially "the one lesson worth internalizing" and the repo layout.
- `npm test` takes ~35s (six full matches through the harness).
- Commit and push before ending a session — history doesn't carry across devices.
