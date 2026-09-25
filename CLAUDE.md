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
and a subtle net ripple communicate a goal better than fireworks.

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
  - `harness.ts` — `checkMatch()`: runs a match and checks every tick that reported outcomes
    match positions (speeds, possession reach, shot range, offside at the moment of the kick,
    penalty iff foul in the box, goals/outs on the lines, restart gating, no stalls). Its checks
    are written independently of the engine's rule code on purpose.
  - `engine.test.ts` — determinism, zero violations over full matches, loose stat bounds, and
    tests that the harness itself catches injected faults.
- `scripts/sim.ts` — headless CLI runner (`npm run sim -- <seed> [--events]`), runs on Node's
  built-in TypeScript stripping (hence `.ts` import extensions throughout).
- `src/viewer/` — the match viewer (session 2). `timeline.ts` simulates ahead of playback and
  records packed frames; `pitch.ts` draws on canvas; `commentary.ts` turns events into lines;
  `MatchViewer.tsx` is the UI. The viewer only reads engine output; it never feeds back into it.
- `src/App.tsx` — fixture header and match picker around the viewer.

When adding a gameplay feature: add its position/outcome invariant to `harness.ts` first.
