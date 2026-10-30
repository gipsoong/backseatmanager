# Progress

Updated at the end of each session. Keep this short — current state, not a full history.

## Current milestone

**3. Season loop** — league, fixtures, table, saves (session 8); squads, fitness, subs, injuries,
team selection and a 38-0-style draft mode (session 9); a January swap window in draft mode
(session 13); single-season draft squads and fair attributes (session 14); career mode stage 1,
seasons that carry on (session 19); career stage 2, the market (session 19); one overall scale for
every mode (session 22); formations levelled (session 23). Next: **block balance** (below), contracts,
in-match management (on hold at the owner's request).

## Done (session 23): formation balance; block height is the big imbalance

On branch `wip/formations`. Tools: `scripts/diag-formations.ts` (mirror tests: shapes at equal
strength, one squad in two shapes, one squad in two blocks; xGD on every core but one) and
`scripts/diag-shape.ts` (a shape's average places by phase and third, shots for/against by zone and
role, regains by third, xG by where the move began). See CLAUDE.md.

- **Formations**, each against the other five at equal strength, xGD a match (500 matches a shape a
  seed set; ±0.05):

| | before (seed 1) | after: seed 1 / 1001 / 2001 | one squad in both shapes (seed 1) |
|---|---|---|---|
| 4-4-2 | -0.12 | -0.05 / -0.14 / -0.11 | +0.02 |
| 4-3-3 | +0.22 | +0.01 / +0.20 / +0.09 | -0.02 |
| 4-2-3-1 | -0.06 | -0.02 / -0.05 / -0.03 | -0.06 |
| 4-1-4-1 | +0.22 | +0.01 / +0.03 / -0.04 | 0.00 |
| 3-5-2 | +0.24 | +0.02 / +0.03 / +0.05 | -0.03 |
| 3-4-3 | -0.49 | +0.02 / -0.07 / +0.04 | +0.09 |

  (seed 1001/2001 "after" for 4-4-2 was measured with its midfield at 0.1/0.15; final is 0.15.)
  Spread over the three sets ~0.15-0.2 between the extremes, about the noise; was 0.73.
  What made the difference: the shapes with a holding midfielder and two midfielders who get
  forward (4-3-3, 4-1-4-1, 3-5-2) beat those whose central men stood still. 4-4-2's two CMs had no
  `attackDepth` (now 0.15); 4-2-3-1's second pivot now 0.35 + 0.3 (was 0.3 + 0.2); 3-4-3's midfield
  two 0.5 + 0.2 (was 0.4 + 0.1, ~12 m behind the wingers, nobody arriving), and its wide forwards
  stood on the wing-backs' line (y 56/12 vs 58-60), crowding one flank: now inside them (52/16), as
  a 3-4-3 plays. Traces: 3-4-3 attacks with wing-backs on the touchlines, wide forwards in the half-
  spaces, and defends as a 5-4-1 (back five 17-20 m, midfield 28-33 m). Tried and dropped: wingers
  tracking to the midfield line, a back three splitting less, deeper or in-possession-only midfields,
  wing-backs less high, a 3-4-3 holding midfielder.
- **Ashford is block height, not a bug in defending.** One squad against itself in two blocks
  (`diag-formations 200 1 block`): high v low +1.9 xGD a match, high v mid +1.1, mid v low +0.8
  (each side's own squad, same shape). Seed 1's league has one high block (Ashford); seed 3's has
  nine. A high block wins the ball in the final third ~20 times a match (mid v mid ~1.5) and the
  pressed side clears ~64 times from its own third (vs ~15), most of it straight back. Not fixed:
  tried (100-120 matches each, none moved high v mid beyond noise) charge-down chance, presser
  stand-off, through balls and runs from deep, longer balls in behind, losing a long ball costed
  where it's lost, preferring a long ball to a clearance, holding instead of clearing, looser
  marking upfield; realistic line heights (low 18-34, high 26-48) and a press stopping 30 m out
  halve it at most. The press is simply too good and a deep block too porous (it sits on its
  six-yard line unpressed: line 14 - 7). Needs its own session: start from diag-shape's regains and
  "xG by where the move began" with `high low` / `mid high`.
- Found on the way: a pressed carrier in his own third whose best option is to hold it clears it
  instead (`nothingOn` counts anything but a pass), ~45 times a match against a high press; letting
  him hold made the press stronger still, so left as it is.
- calibrate's woodwork now counts shots that hit the frame (Opta's definition), not saves and
  blocks turned onto it (~a quarter of the events; it read 0.9-1.1 a match, HIGH, with the shapes
  a little more open: shots 12.8 -> 14.1 a team on seed 1).

Checks: calibrate 80 1 / 201: 31/31 and 30/31 (tackles own third 52.7%, base 51.7), zero
violations; tsc and vitest pass. Career sims (seeds 1-3, five seasons):

| | session 22 | session 23 | target |
|---|---|---|---|
| Goals a match | 2.40-2.78, mean 2.60 | 2.61-2.92, mean 2.79 | 2.5-2.9 |
| Top scorer | 23-37 | 23-37 (one 37, one 36) | 22-35 |
| Best side | 85-103 | 79-107 (seed 1: 106, 107, 101, 100, 99) | 80-100 |
| League eleven, S1 -> S5 | -0.3, 0.0, +0.2 | -0.1, 0.0, +0.2 | ±1 |
| Per 90 regulars DEF / MID / FWD goals | 0.03-0.05 / 0.11-0.14 / 0.29-0.38 | 0.02-0.04 / 0.12-0.16 / 0.32-0.42 | |

  Seed 1's best side over 100 is the high block above; seed 2 had two 79-point champions.

## Done (session 22): one overall scale, career outliers

On branch `wip/career-scale`.

- **One scale.** Made-up players' overall (`playerRating`) is now on the draft's FIFA-like scale:
  `cardOverall` = `ratingAt(positionLevel)` + `CARD_GAP` per position, the gap measured over every
  draft player (their overall sits that far above their weighted skills; slope ~1, sd ~1). A 51
  striker with SHO 73 now reads ~75; club leagues read 67-87, elevens ~80 (draft leagues ~78).
  `ability()` (the staff's picks and substitutions) is unchanged, so matches are byte-identical:
  fingerprint 24/24 hashes the same, calibrate 80 1 / 201 31/31 and 30/31, zero violations.
- Everything in overall points moved with it (an old point is 0.8 of a new one): potentials
  (`firstPerson`), development (`MAX_GROWTH` 5, noise, decline), signings (`SIGNING_LEVEL` -3),
  academy (-11 + 0..8, gems -10 + 19 u^2), market `gain` 1.5. Money: `ROLE_OFFSET` re-measured
  (GK 0, CB 0, FB 1, DM 1, CM 2, WM 1, W -2, ST -4), value `2 x 1.2^(priced - offset - 78)` (same
  prices as before: median £2.4m, the dearest ~£10m, fees up to ~£20m), `POINT_VALUE` 0.75. Signings
  and academy players are now made at their position's offset (on the old scale a centre-back
  signing at the club's level was a strong one, a keeper a weak one). The review's expected rating
  uses `playerRating` for made-up players (was a flat 75).
- Saves: version 4. `upgradeCareer` moves a v3 career's potentials, last changes, the clubs'
  starting levels and the history's overalls onto the new scale (from where each man reads now).
  Tested round trip; pre-card players (old profiles) read 70-76 by position, like card ones.
- **Outliers.** Market, development and signings aren't what makes the best sides: across 300
  club-seasons the eleven's overall predicts points equally on both scales (r 0.58); under-24s
  don't develop faster at strong clubs; the market didn't feed the champions. What's left is a
  club that over-performs its overall year after year (seed 1's 4-4-2 Ashford: 2nd-4th strongest
  eleven, champions five times, 8-21 conceded a season, 100 points in season 1 before any career)
  and shapes (points beyond strength: 3-4-3 -9 a season, 4-3-3 +5, 4-2-3-1 -4). Keepers correlate
  strongly with goals against but a mirror (a keeper 6 worse, 240 matches) costs only ~0.05 goals a
  match, so that's club quality, not keepers. Fix kept modest: the strongest eleven no longer buys
  (it already couldn't sell), nor does the table's leader. Squads' average falls ~1 over five
  seasons because squads fill from 20 to 24 with academy kids; the best twenty of each squad holds
  (+0.1 to +0.3), so it doesn't matter.

Career sims (seeds 1-3, five seasons, every match played; session 21's gaps were on the old scale,
where a point is 0.8 of one now, so 10.8 -> 13.3 then is ~8.6 -> 10.6 now):

| | session 21 | scale only | scale + market fix | target |
|---|---|---|---|---|
| Goals a match | 2.47-2.77, mean 2.63 | 2.47-2.74, mean 2.61 | 2.40-2.78, mean 2.60 | 2.5-2.9 |
| Top scorer | 20-32, one 45 | 21-31 | 23-37 (one 37, one 34) | 22-35 |
| Best side | 84-106 | 79-109 | 85-103 (one 103) | 80-100 |
| League eleven, S1 -> S5 | +0.1, +0.2, +0.5 | -0.1, -0.1, +0.1 | -0.3, 0.0, +0.2 | ±1 |
| Strongest - weakest eleven | 9.9-13.3 old (seed 2 10.8 -> 13.3) | 8.0-11.3 (seed 2 9.3 -> 11.3) | 7.5-11.0 (seed 2 9.3 -> 11.0) | 8-15 old, not widening |
| Per 90 regulars DEF / MID / FWD goals | 0.02-0.05 / 0.11-0.15 / 0.29-0.39 | 0.02-0.05 / 0.12-0.15 / 0.30-0.37 | 0.03-0.05 / 0.11-0.14 / 0.29-0.38 | |

- **Still off:** seed 1's Ashford (94-103 points every season, from the start) and shape balance
  (3-4-3 about 9 points a season short of its eleven) are the engine's, for a later session; seed
  2's gap still widens a little (its strongest side's young core develops: 84.7 -> 86.2); two
  seasons of 2.40-2.43 goals a match; club strikers and wingers read ~4 and ~2 below their league
  on the card scale (their attributes were set to play as the old profiles did).

## Done (session 21): club and career players get cards too

Made-up players (club/career mode, academy, signings) were still the old broad profiles: a forward
defended at ~65-70 and every card looked flat. On branch `wip/club-cards`.

- `madeCard` (teams.ts): his archetype's card (`cardFor`) at the level that puts his position's
  skills where the old profiles' were (`CARD_LEVEL`, so sides play as strongly), varied by group (sd
  3) and build (PAC up, PHY down, or the other way), +10 DEF for wide midfielders; fitted with
  `cardAttributes`. Two strikers of a 51: PAC 79 SHO 73 PHY 60 (poacher) and PAC 56 SHO 73 PHY 76
  (target man). Their overall (`PlayerDef.card`) is FIFA-like position weights (`OVERALL_WEIGHTS`,
  `positionLevel`) plus `OVERALL_SHIFT`, which keeps the old even-average scale: overalls,
  `ROLE_OFFSET`, potentials and values read as before, and old saves keep their attributes and
  their even average. `makePlayerAt` makes one at an overall; `shiftTo` moves a card player's
  position skills most, legs and physique at least 1.5x (pace still goes first, kids fill out).
- Engine: a poor tackler who goes in wins some (`TACKLE_FLOOR` 8: forwards' DEF is 1-3 points);
  own-third tackling 0.85 -> 0.75, `FOUL_BASE` 0.13 -> 0.14; a keeper's card speed (~40) counts half
  for his top speed (with card keepers woodwork went 0.63 -> 0.92 a match).
- `diag-defending --random` plays made-up sides. The fault-injection ping-pong test now rewrites
  open-play passes only.

| | before | after | real |
|---|---|---|---|
| calibrate 80 1 / 201 / 401 | 30 / 31 / 31 | 31 / 30 / 31 | |
| Made-up cards, q13, DEF of W / ST; SHO of CB | 65 / 67; 65 | 33 / 36; 40 | 30-45; 40-60 |
| Tackles / int per 90 (made-up sides), W | 1.40 / 1.18 | 0.61 / 0.73 | 0.7 / 0.4 |
| ST | 1.46 / 1.29 | 0.74 / 0.74 | 0.4 / 0.2 |
| WM | 1.73 / 2.01 | 0.90 / 1.45 | 1.0 / 0.7 |
| Career goals a match (seeds 1-3 x 5 seasons) | 2.40-2.77, mean 2.52 | 2.47-2.77, mean 2.63 | 2.5-2.9 |
| Top scorer | 27-40 | 20-32, one 45 | 22-35 |
| Best side | 82-106 | 84-106 | 80-100 |
| League eleven, S1 -> S5 | +0.1..+0.4 | +0.1, +0.2, +0.5 | ±1 |
| Strongest - weakest eleven | 10.9-13.5 | 9.9-13.3 (seed 2 10.8 -> 13.3) | 8-15 |
| Per 90 regulars DEF / MID / FWD goals | 0.03-0.05 / - / 0.32-0.39 | 0.02-0.05 / 0.11-0.15 / 0.29-0.39 | |
| Drafted side (La Liga, Ronaldo 94; seeds 1, 2, 5, 6) goals | 67-80 | 85, 76, 90, 71 | |
| Ronaldo's goals | 24, 20, 20, 34 | 36, 21, 31, 30 | 22-35 |

Why the greedy drafted side wasn't dominant: it isn't. One club-season a round and the best that
fits an open place gives an eleven of 82.6-83.5 against a league of ~78 whose best side is 85-86
(real club-seasons with several 85+ cards), with three keepers among nine substitutes. At full
fitness the same eleven scores what it did before cards (seed 1: 82 before, 83 now). A dominant
side (the best La Liga player for each place, eleven of 88) scores 110 with 102 points, Ronaldo 33.

- **Still off:** club overalls (even-average scale, ~45-65) and the cards (FIFA scale, ~60-85)
  still read on different scales, as before; woodwork ~0.8 a match (top of range); squads' average
  overall (not the elevens') drifts down ~1.2 in five seasons; two seasons' top scorers of 20-21 and
  one of 45; seed 1's best sides 104-106.

## Done (session 21): a faster matchday

The owner: with 20-club careers, "Just the result" took 10-14 s in the browser (~2.4 s a match on
one core), on a phone through the single-file artifact. No result may change.

- Engine, ~1.8x on one core (2.3-2.6 s -> 1.2-1.4 s a match): per-tick snapshot caches (side
  lists, offside lines, ball frame, corner plan, pair distances), arrival searches that skip
  unreachable stretches and stop at the best arrival so far, options bounded before their races,
  hot geometry on numbers. `scripts/fingerprint.ts`: 24 matches (club, career, draft, knockout with
  penalties), identical before and after; `calibrate 80 1` identical; zero violations.
- Matchday: a lasting worker pool (a worker a core while he waits, up to 8; was at most 3-4 and
  remade every day), results kept by their inputs, and the day's matches started as soon as the
  hub shows. `autoPick` 2.5x faster (the market's many elevens; same picks).
- Measured (Chromium via Playwright, built app, 4-core box, career matchdays 1-3 of 10 matches,
  box quiet): before 13.6 / 12.9 / 11.9 s; now, pressed at once 10.7 (cold workers) / 4.4 / 4.1 s;
  after 3 s on the hub 3.6 / 0.6 / 1.3 s. Chrome's CPU throttling reaches only the page, not
  workers (CDP refuses it for workers), so a phone can't be mimicked for the matches themselves;
  per match it's ~4x the desktop's. Under another session's heavy load (load 7-11) the ratio held
  (~1.7-2x at once, more with a look at the hub). Harness: `node pw.cjs <dist> <throttle> <dwell>`
  style scripts in the scratchpad, not in the repo.
- **Open:** the first matchday after load is slow (cold workers and JIT); allocation (GC ~10-15%)
  is the engine's next lever; worker pool on a phone not yet tried on a real device.

## Done (session 20): player cards that look like the player

The owner: Kane 90 showed PAC 86, SHO 80, DRI 92, DEF 72 (real ~70/93/83/47). Every draft player
was his archetype's generic shape, forwards defended in the 70s, defenders shot in the 70s, stars
had 99s, and a card's spread was ~25 (real ~40).

- `draft/cards.ts`: own cards (six groups, recalled FIFA/FC) for 342 players: everyone 84+ and
  clear profiles (Vardy, Giroud, Kanté, Busquets, Adama, Walcott, Carroll ...), [born, season,
  overall, card]; other seasons move with overall and age (pace from 30, physique, passing).
- `CARD_SHAPES` (archetypes.ts): a card per archetype for everyone else. `cardAttributes`
  (attributes.ts) fits sub-attributes to the card; `GROUPS` now have FIFA's weights; heading and
  stamina come from level, position and build. `scripts/check-cards.ts`: 903 player-seasons, all
  within 2 of the table (a forward's DEF bottoms out at 33-36). Saves keep their attributes.
- Engine: `readsPass` (match.ts): under 6 interceptions an opponent's ground pass can go by him.
  Without it, forwards who no longer tackled hung about and intercepted more.
- Club mode (`makeAttributes`) is unchanged; its cards still show the old shapes.

| | before | after | real |
|---|---|---|---|
| Card by role (80+), DEF of W / ST | 65 / 70 | 38 / 39 | 30-45 |
| SHO of CB | 67 | 45 | 40-60 |
| Card spread best-worst (W / ST / CB) | 24 / 24 / 24 | 49 / 45 / 39 | ~40 |
| Tackles / interceptions per 90, W | 1.06 / 1.10 | 0.46 / 1.02 | 0.7 / 0.4 |
| ST | 0.54 / 0.71 | 0.41 / 0.66 | 0.4 / 0.2 |
| WM | 1.02 / 1.85 | 0.50 / 1.19 | 1.0 / 0.7 |
| Ronaldo 94, La Liga (seeds 1, 2, 5, 6) | 33, 43, 37, 35 | 24, 20, 20, 34 | 22-35 |
| His goals / npxG | 1.35 | 1.15 | 1.15-1.2 |
| Our side's goals; best side | 80-95; 80-95 | 67-80; 79-98 | 110-121 best |
| League goals a match | 2.26-2.57 | 2.47-2.67 | 2.5-2.9 |
| Goals per 90 regulars ST / W / CM | 0.44 / 0.26 / 0.11 | 0.42 / 0.32 / 0.12 | |

calibrate 80 1 / 201 / 401: 30 / 31 / 31 (as before; miss won by 4+ 11% on seed 1). Zero
violations; vitest 85 and `tsc -b` pass.

- **Open:** the greedy drafted side is no longer always the best (its 75-80 fillers have archetype
  cards, and slow real stars like Lewandowski 75 pace count for less than their overall); best side
  still short of 110; strikers' blocks per 90 high (~5, was ~4); club mode still on the old shapes.

## Done (session 19, stage 2): the career market

On branch `wip/career2`. Career leagues are 20 clubs and 38 matchdays.

- Money (`career/money.ts`): a player's value comes from his overall (priced by his position's
  level, `ROLE_OFFSET`, so a keeper's high overall isn't a star's), his room to grow while young, and
  his age (a 19-year-old 60 with potential 80 is worth ~7x a 30-year-old 60). Wages follow his
  value now. Each club has cash and an income equal to its starting wage bill; each summer adds
  income and prize money (£300k a place) and takes the wages.
- Windows: August's matchdays (1-4) and January's. The Deals tab works for both modes: in a career
  you can buy, sell or swap with a fee (−£1m / +£1m / "Their price"); clubs bid money for your
  players; the budget and wage bill are shown; "Around the league" lists the other clubs' deals.
  Value and wages are on the player card.
- The other clubs (`career/market.ts`): ≤ 2 deals a window matchday, ≤ 5 a window, one per club;
  a club buys for its weakest place at the seller's price (value, a margin, what losing him costs);
  never from the strongest side; the top four don't take a rival's two best players.
- Retirements: AI clubs still get a signing for each; the manager's club doesn't. Young players
  gain more pace and physique (`YOUNG_GROWTH_WEIGHT`). No two players in a squad share a surname
  (`freshName`; `leagueTeams` renames, randomTeam unchanged). The count-up lands on its number even
  when frames stop. Contracts: skipped for now.

Checks (`sim-career.ts` seeds 1-3, five 20-club seasons each, every match played, AI market on):

| | seed 1 | seed 2 | seed 3 | target |
|---|---|---|---|---|
| Goals a match, by season | 2.44 2.77 2.68 2.54 2.58 | 2.52 2.47 2.54 2.55 2.55 | 2.44 2.40 2.44 2.41 2.47 | 2.5-2.9 |
| Top scorer | 31 34 29 30 35 | 40 34 36 27 31 | 38 33 29 29 30 | 22-35 |
| Best side, points | 88 98 93 97 104 | 93 85 84 82 93 | 95 93 106 89 85 | 80-100 |
| League eleven overall, S1 → S5 | 58.7 → 58.8 | 57.4 → 57.8 | 58.5 → 58.8 | ±1 |
| Strongest − weakest eleven | 12.2 11.0 11.3 12.7 13.1 | 12.9 11.8 13.0 13.1 13.5 | 12.2 10.9 11.3 11.7 11.0 | 8-15, not widening |
| Most top-20 players at one club | 2-3 | 3-5 | 2-4 | |

Per 90, regulars, every season: defenders 0.03-0.05 goals, 0.40-0.48 shots; midfielders 1.1-1.5
shots; forwards 0.32-0.39 goals, 2.3-2.75 shots. Regulars of 21 and under 0.5-1.5 shots; 32 and over
0.7-1.2. Ten AI deals a season, £2-38m. Regulars' pace holds (11.6 → 11.2-11.6). calibrate 80 1 /
201: 30/31 and 31/31, zero violations. vitest 84 and `tsc -b` pass. A matchday of ten in the
browser ("Just the result", 3 workers on 4 cores): 10-14 s; one match is ~2.4 s on a core.

- **Still off:** goals a match averages 2.52 (seed 3 2.43); a stronger bench didn't move it (half
  season, 2.68 → 2.62) and it isn't the career (season 1 is the same). Two top scorers of 38-40 and
  two best sides of 104-106 in fifteen seasons. Seed 1's champions' eleven rises 59.7 → 66.2 over five
  seasons while the strongest-weakest gap stays 11-13. Richest club's cash 75-86 by season 5. A
  matchday takes 10-14 s to simulate.

## Done (session 19): career mode, stage 1

Club mode is a career: after the last matchday and the review, "Next season" plays on with the same
clubs and squads (fresh fixtures and table, a year on). On branch `wip/career`, self-contained.

- `src/career/career.ts` (pure, tested in `career.test.ts`): ages and hidden potential
  (`Career.people`), `development` and `shiftTo` (sub-attributes a point at a time; pace, agility
  and stamina first in decline), retirements from 34 (keepers 36), a signing for each retirement,
  2-3 academy players a club a summer, squads capped at 24 (least promising 19+ released, never the
  second keeper), the board's target (`aimFor`) judged in the review, `history` of past seasons
  with every player's season line. Save version 3; old club saves become season 1 (`upgradeCareer`).
- Screens (`screens/Career.tsx`): "Season 2 · 2027–28" on the hub, the board's line on the next-match
  card and the review ("Met" / "Missed"), "Over the summer" before the first match (retired, signed,
  academy, released), a History tab, Age and "+3" / "−2" next to Rtg in the squad table and on the
  player card, with his career's seasons under it. Start says "New career".
- Not engine changes: `makePlayer` / `madeUpName` exported from teams.ts (no RNG change).

Checks (`scripts/sim-career.ts`, seeds 1-3, 5 seasons, every match played; club mode has 18
matchdays, so the top scorer and best side are also shown scaled to 38):

| | season 1 (no career yet) | seasons 2-5 | target |
|---|---|---|---|
| Goals a match (3-seed mean) | 2.48 | 2.47 / 2.58 / 2.68 / 2.52 | 2.5-2.9 |
| Top scorer (raw, x38/18) | 12-15 (25-32) | 10-21 (21-44) | 22-35 |
| Best side (raw, x38/18) | 41-42 (87-89) | 40-50 (84-106) | 80-100 |
| League eleven overall, change over 5 seasons | | +0.2, +0.1, +0.2 | ±1 |
| Per 90, regulars: DEF goals / shots | 0.03-0.04 / 0.39-0.43 | 0.02-0.05 / 0.35-0.54 | |
| MID shots, FWD goals / shots | 0.9-1.6, 0.32-0.37 / 2.5-2.9 | 0.7-1.7, 0.28-0.49 / 2.2-3.2 | |

Regulars of 21 and under shoot less (0.4-1.3 a 90) and score 0.03-0.18; 32 and over in line with
everyone. calibrate 80 1 / 201: 30/31 and 31/31, zero violations (engine untouched); vitest 79 and `tsc -b` pass. Without the drift pull the league rose
~0.3 a season (squads deepening, release of the weakest); with it ±0.2 over five.

- **Open:** club mode's goals a match sits at ~2.5 before any career (the band's bottom); club mode's
  rating scale is lower than the FIFA-like one (league elevens ~57), so academy players come in at
  the club's level −14 to −4 and potential runs up to the league's +12; the staff also sign a
  replacement for the manager's own retirees (no transfers yet); pace of regulars drifts down ~0.3
  over five seasons on one seed.

## Done (session 18, round 3): shooting spread, strong sides, what a viewer sees

Causes: shots followed position only through finishing and the forwards' eagerness, so full-backs,
wide and holding midfielders hardly shot and forwards took ~73% of the goals. Strong sides scored
68-78 a season because season fitness spiralled down (a flat +0.25 after a match: regulars started
at ~0.55, the league played tired, ~2.2 goals a match) and a top keeper's reflexes were worth too
much (the drafted side let in ~0.64 of the xG it faced). On screen: two men marked one forward
(a centre-back and the holding midfielder standing on each other, ~40 times a match), teammates
arrived on the same spot, and with the ball in our half the in-possession line didn't move, so the
side stood still and played the same triangle.

- `SHOOTING` (ai.ts): shot keenness by position (FB 1.7, DM 1.4, WM 1.5, W 1.25, CM 1.05, ST 0.8).
  Wide midfielders make late runs (back post or box edge); the holding midfielder steps up to 25 m
  out (`DM_STEP_UP`, `DM_EDGE`); an inside forward comes inside whenever the ball isn't on his flank.
- Marking: a man is left to a teammate on him (`MARK_SHARE`, `MARKED`); a midfielder leaves a man
  in behind him to the back line. In possession a man keeps 4 m off a teammate (`spaced`). The late
  runner from deep takes the cut-back zone, not the striker's spot.
- `lineInPossession`: the in-possession line follows the ball all the way up (0.5x + 6, 20-58 m).
  Out of possession the block is 26 m deep (was 30), defenders go in less in their own third
  (`OWN_THIRD_TACKLING`) and more carefully in their box (0.2).
- Strength: `EDGE_SCALE` 2.5 (the favourite's keenness floor is reached at half an edge).
  Lead easing milder (0.45, shots 0.3). Keeper reflexes 0.014 a point (was 0.02).
- Season (season.ts): after a match a player gets back 75% of what he used (`MATCH_RECOVERY`).
- No fifth swap between two men however the pass is played (`consider` in `chooseAction`); shot
  blocks loop up less (`SHOT_BLOCK_LIFT`); defenders glance a cross behind a little more often.

Draft matches (40 a column, per team per match; per 90 for starters):

| | round 2 | round 3 | real |
|---|---|---|---|
| Shots CB / FB / DM / CM | 0.57 / 0.14 / 0.28 / 1.69 | 0.51 / 0.36 / 0.70 / 1.46 | 0.4-0.7 / 0.3-0.6 / 0.5-1 / 0.8-1.6 |
| Shots WM / W / ST | 0.50 / 1.61 / 3.07 | 0.50 / 1.92 / 2.13 | 1.2-2 / 2-3 / 2.5-3.5 |
| Non-penalty goals by W + ST | 73% | 57% | 55-60% |
| Passes CB / DM / WM | 40 / 69 / 53 | 49 / 78 / 46 | 50-70 / 60-70 / 35-45 |
| Ball time own / middle / final third | 30 / 48 / 21% | 27 / 53 / 21% | ~30 / 45 / 25% |
| Possession, stronger side (3+ overall) | 54.5% | 56.6% | 55-60% |
| Strength test (+1.25 attributes) | 53.4% | 58.0%, goals 2.06-0.53 | 55-60% |

Watching (6 matches, `watch.ts` in the session scratchpad: position traces): teammates within 2.5 m
for 3 s+ 91 -> 37 a match (centre-back with holding midfielder 40 -> 6); a man standing still 8 s+
2.7 -> 0.7 a match; most passes one way between two men 31 -> 28.

calibrate 80 1 / 201 / 401: 30 / 31 / 31 (miss: won by 4+ 11% on seed 1). Zero violations;
vitest 70 and `tsc -b` pass.
Seasons (La Liga, Ronaldo 94, seeds 1, 2, 5, 6, 11, 12): our side 86, 88, 88, 73, 77, 82 goals (mean
84; round 2 68-78), 85-96 points; Ronaldo 26, 29, 34, 33, 36, 24 (mean 30); league 2.25-2.49 goals a
match (was ~2.2); goal share DEF / MID / FWD 8 / 23 / 68 (WM counted as midfield).

- **Still off:** wide midfielders shoot too little (0.5; few in these samples); strikers shoot a
  little less than real (2.1) since their keenness came down to hold Ronaldo near 30; final third
  21% (25%): a higher in-possession line got 25% but ~15 shots a side; the drafted side's 84 goals
  is just short of 85; won by 4+ sits near the top of its range on seed 1.

## Done (session 18, round 2): build-up shape, who has the ball, territory

Causes: wide midfielders were the hub because the flanks were always open and the side was
stretched long in possession (centre-backs 30+ m behind, nobody near them); the ball never
stayed in the final third because losing it there cost the same as anywhere, so a cross or a
hopeful shot always beat keeping it; possession ignored strength because both sides were equally
direct.

- `buildUpSpot` (ai.ts): unpressed with the ball in our first 40 m, centre-backs split toward the
  box edges, the holding midfielder drops between or beside them, full-backs push on. Centre-backs
  wider in possession (1.6), the out-of-possession block shifts more to the ball (0.6), the
  in-possession side shorter (42 m, more as the ball goes up).
- Recycling: back passes are free at first and cost more as a spell drags on (`backMultFor`,
  `RECYCLE_FREE` 12 s, `RECYCLE_OVER` 30 s); a pass hugging the touchline is worth less.
- Territory: possession is worth more the further up it is (`ATTACKING_KEEP`, from 55 m), and a
  shot or cross forgoes part of that (`KEEP_FORGONE`, `CROSS_KEEP`), so sides recycle at the
  box edge instead of crossing or shooting from anywhere.
- Strength: `edgeOf` (mean outfield attribute gap) makes the favourite less direct
  (`keenness`, floor `FAVOURITE_KEENNESS` 0.5); a side two up eases off (`LEAD_EASING`,
  `LEAD_SHOTS`), which also curbs blowouts.
- First touch under pressure (`FIRST_TOUCH_PRESSURE`, match.ts), through balls less exact
  (`THROUGH_BALL_ERROR`), shooting `EAGER` 0.65 with midfielders 1.1x from distance.
- Ping-pong: `giveBack` grows with how many times the pair has swapped it and forbids a fifth
  swap (`MAX_SWAPS`); harness `ping-pong` (more than 6 straight passes between two men, outside
  restarts) with a test that it catches one.

Draft matches, per team per match (round 1 end -> round 2; 20-40 matches):

| | round 1 | round 2 | real |
|---|---|---|---|
| Passes | 547 | 564 | 400-550 |
| Ball time own / middle / final third | 14 / 76 / 10% | 31 / 49 / 20% | ~30 / 45 / 25% |
| Centre-back to keeper | 0.6 | 3.1 | ~10-15 |
| Keeper long balls, all | 7.5 | 7.8 | 10-15 |
| Longest own-third chain | 14 | 12 | |
| Possession of the stronger side (3+ overall) | ~51% | 53.7% | 55-60% |

Per 90, starters:

| (real) | CB | FB | DM | CM | WM | W | ST |
|---|---|---|---|---|---|---|---|
| Passes (50-70, 45-65, 60-70, 50-65, 35-45, 30-45, 20-35) | 17 / 42 | 74 / 46 | 36 / 74 | 60 / 68 | 119 / 54 | 68 / 44 | 31 / 35 |
| Prog. passes (3-6, 3.5-6, 5-8, 4.5-8, 2.5-4.5, 2-4, 1-2) | 0.33 / 1.47 | 10.1 / 5.4 | 2.1 / 4.5 | 7.3 / 10.0 | 10.6 / 8.0 | 4.7 / 5.1 | 1.8 / 2.6 |
| Shots (0.4-0.7, 0.3-0.6, 0.5-1, 0.8-1.6, 1.2-2, 2-3, 2.5-3.5) | 0.61 / 0.52 | 0.07 / 0.06 | 0.28 / 0.32 | 1.42 / 1.78 | 0.30 / 0.30 | 1.41 / 1.75 | 2.76 / 3.23 |

calibrate 80 1 / 201 / 401: round 1 29 / 28 / 29, now 30 / 30 / 30 of 31 (misses: headed shots
25.6% on 1, woodwork 0.9 on 201, own-third tackles 52.1% on 401; won by 4+ now 6-7.5%). Zero
violations; vitest (70) and `tsc -b` pass. Strength test (a side against a copy 1.25 attribute
points weaker): 53.4% possession; `FAVOURITE_KEENNESS` 0.4 with `EDGE_SCALE` 3 gives 55.6% but
29 on seed 1, so not taken.
Seasons (La Liga, Ronaldo 94, seeds 1, 2, 5, 6): Ronaldo 22, 26, 30, 11 (mean 22; round 1 mean 23);
our side 68-78 goals, 83-96 points; league 1.9-2.1 goals a match; goal share DEF / MID / FWD
6 / 24 / 70; main striker npxG share median 20%, top decile 31%.

- **Still off:** centre-backs 42 passes (50-70) and wide midfielders 54 (35-45); final third 20%
  (25%); stronger side 53-54% (55-60%); full-backs, wide midfielders and holding midfielders
  shoot too little and central midfielders too much; forwards take 70% of goals (real ~55-60%);
  own-third tackles at the top of the range; our side's goals (68-78) below the best real sides.

## Done (session 18): build-up from the back

Cause: a ground pass's interception risk treated every opponent as an instant full-speed
sprinter, so a pass into midfield looked 3-10x riskier than it was (predicted 14%, lost 2%), and
the safe ball back to the keeper always won; he then went long. Fixed by measuring, not guessing:
a debug copy chose a random pass 15% of the time and compared predicted risk with what happened.

- `groundPassLost` (ai.ts): opponents behind the pass ignored (unless close enough to charge it
  down), each waits his reaction delay (interceptions) before moving, sampled along the lane;
  `interceptChance` flatter. Now calibrated (predicted 51% -> lost 51%, 74% -> 64%). The race model
  (lofted, through, crosses) was trimmed the same way (cap 0.93).
- Misplacing grows with the square of the pass's length.
- `PROGRESS`: moving the ball 25 m upfield is worth something on top of threat (the threat
  gradient is flat in our half, so with honest risk alone sides passed it about for ever,
  800-1100 passes). `giveBack`: a small cost for going straight back to the passer (no ping-pong).
- `holdOption`: an unpressed carrier can wait for a run, 3 s at most. Harness `hold-on`: an owner
  standing still on the ball 5 s is a violation (with a test that it catches one).
- Carries valued where they end, by the room in front. A first presser in a mid or low block
  holds his zone (`BLOCK_ENGAGE`, `SHAPE_FROM`) instead of chasing the ball out of it.
- Re-balance: pass value 0.016, through balls a 0.36 base risk, shooting `EAGER` 1.1 with
  midfielders 1.25x keener from distance, `FOUL_BASE` 0.13, in-possession line 30 m behind the ball.

Build-up (40 draft matches, per team per match):

| | before | after | real |
|---|---|---|---|
| Passes | 435 | 547 | 400-550 |
| Centre-back to keeper | 47.5 | 0.6 | ~10-15 |
| Keeper to centre-back | 8.8 | 3.7 | |
| Keeper clears long, open play | 52.4 | 3.7 | ~5 |
| Keeper long balls, all (per match) | 105 | 7.5 | 10-15 |
| Centre-back to centre-back | 38 | 3.4 | |
| Longest own-third chain | 37 | 14 | |
| Ball time own / middle / final third | 34 / 52 / 14% | 14 / 76 / 10% | ~30 / 45 / 25% |

Per 90, starters (40 draft matches):

| (real) | CB | FB | DM | CM | WM | W | ST |
|---|---|---|---|---|---|---|---|
| Passes before / after | 54 / 17 | 48 / 74 | 30 / 36 | 35 / 60 | 61 / 119 | 37 / 68 | 18 / 31 |
| Prog. passes (3-6, 3.5-6, 5-8, 4.5-8, 2.5-4.5, 2-4, 1-2) | 0.69 / 0.33 | 4.9 / 10.1 | 1.2 / 2.1 | 4.3 / 7.3 | 5.9 / 10.6 | 3.3 / 4.7 | 1.0 / 1.8 |
| Prog. carries (0.8-2, 1.5-3, 1-2.5, 1.5-3, 2.5-5, 3-6, 1.5-3) | 1.5 / 0.6 | 5.4 / 3.6 | 1.3 / 1.7 | 2.9 / 2.1 | 10.5 / 5.7 | 6.2 / 2.3 | 2.4 / 0.3 |
| Shots (0.4-0.7, 0.3-0.6, 0.5-1, 0.8-1.6, 1.2-2, 2-3, 2.5-3.5) | 0.77 / 0.61 | 0.16 / 0.07 | 0.58 / 0.28 | 1.73 / 1.42 | 0.40 / 0.30 | 2.35 / 1.41 | 3.95 / 2.76 |

calibrate 80 1 / 201 / 401: before 31 / 30 / 30 of 31, after 29 / 28 / 29 (passes 554, 79%
completed; misses: tackles in own third ~25% (30-52) everywhere, won by 4+ 11-14%, woodwork 0.8,
through-ball success 60%). Zero violations; vitest and `tsc -b` pass.
Seasons (La Liga, Ronaldo 94, seeds 1, 2, 5, 6): Ronaldo 14, 29, 31, 17 (mean 23; before 28,
37, 31, 13); our side 74-99 goals, 88-103 points (before 81-108, 93-99); league 1.9-2.1 goals a match;
goal share DEF / MID / FWD 8 / 20 / 72; main striker npxG share median 22%, top decile 31%.

- **Still off:** centre-backs are bypassed (17 passes per 90, real 50-70) and full-backs and wide
  midfielders are the hubs; holding midfielders ~36 (60-70). Making backward passes cheaper
  (lean x0.4 or x0) brought CBs to 24-50 but sent passes to 620-720 and shots to 8-10: the side
  circulates instead of attacking. Possession doesn't follow strength (stronger side ~51%), and
  how often a keeper goes long barely depends on the opposing press (all blocks read mid in these
  matches). The ball spends too little time in the final third (10%), hence few own-third tackles.
  Wide midfielders, full-backs and DMs still shoot too little.

## Done (session 17, later): full-back overlaps, per-position audit

Owner: "players should be dynamic regardless of their position". Audited how each position
plays in and out of possession over 40 draft matches (per 90, starters; receptions, not FBref
touches, so box and final-third "touches" read low across the board).

| Per 90 (real) | CB | FB | DM | CM | WM | W | ST |
|---|---|---|---|---|---|---|---|
| Shots | 0.77 (0.4-0.7) | 0.16 (0.3-0.6) | 0.58 (0.5-1) | 1.73 (0.8-1.6) | 0.40 (1.2-2) | 2.35 (2-3) | 3.95 (2.5-3.5) |
| Key passes | 0.10 (0.1-0.3) | 0.82 (0.6-1.2) | 0.44 (0.5-1) | 1.82 (1-2) | 1.65 (1.2-2) | 1.77 (1.5-2.5) | 1.04 (0.8-1.5) |
| Progressive passes | 0.69 (3-6) | 4.91 (3.5-6) | 1.23 (5-8) | 4.27 (4.5-8) | 5.85 (2.5-4.5) | 3.30 (2-4) | 1.03 (1-2) |
| Progressive carries | 1.48 (0.8-2) | 5.42 (1.5-3) | 1.27 (1-2.5) | 2.86 (1.5-3) | 10.45 (2.5-5) | 6.24 (3-6) | 2.36 (1.5-3) |
| Passes | 54 | 48 | 30 | 35 | 61 | 37 | 18 |

- **Fixed: full-backs never went past the man on the ball** (ahead of their wide man 1% of the
  time). Overlaps: with a teammate on the ball wide on his flank in their half, the full-back on
  that side, behind the ball, goes past him: outside (overlapping, wing-backs most), inside into
  the channel (inverted, the underlap), rarely (defensive). ~16 a team a match, shown with the run
  indicator; he gets past the ball on 57% and receives it on 45%. Full-backs' receptions in the
  final third 13.8 to 15.1 a match (inverted ones 0.1 to 1.1). Harness: `overlap` (a full-back,
  teammate on the ball wide in their half, from behind it and on its side), with a test that it
  catches a faked one. Also: a late or overlapping runner whose spot lapses no longer falls through
  to a run in behind.
- **Left, measured:** the build-up from the back (next up, 3): the keeper's long-ball loop starves
  centre-backs and holding midfielders of the ball. Wide midfielders carry a lot and shoot little;
  strikers still shoot a little above range; full-backs rarely shoot.

Draft matches, seeds 9000-9099: goal share DEF / MID / FWD 11 / 20 / 69 (stage 1: 9 / 17 / 73),
goals 3.11 a match (2.87), lone striker npxG share 31% (stronger side 26%). Seasons (La Liga,
Ronaldo 94, seeds 1, 2, 5, 6): Ronaldo 28, 37, 31, 13 (mean 27, as before this session); our side
81-108 goals, 93-99 points; top scorers elsewhere Villa 40, Lewandowski 27; main striker npxG share
median 21%, top decile 32%, max 44%. calibrate 80 1 / 80 201: 31/31, 30/31; fresh 80 401: 30/31
(original 29/31). Harness zero violations; vitest and `tsc -b` pass.

## Done (session 17, later): box arrivals and defensive stats

Owner: a lone striker in a dominant side took too large a share of its shots ("you are making it
sound like the game is not fluid at all"), and forwards made far too many tackles and
interceptions (Ronaldo 100+ in a season).

- **Causes (defending).** Any opponent's pass a player picked up counted as an interception: a
  ball won off the man receiving it (~30% of wingers'), a pass blocked from 2 m by a presser, a
  ball run on loose. And nothing made forwards worse at reading or tackling: every outfielder set
  off for a pass as early and went into tackles as often.
- **Causes (attacks).** Nobody arrived from deep: midfielders held their shape 30 m out, so the
  striker was the only target; corners went to the free man, often a winger at the byline,
  rather than the big men sent up.
- **Fixes.** A pass won is classed by position (`passWon`: duel at the receiver, block by the
  passer, recovery beyond the target, otherwise interception) and the stats follow it. Reading
  delay by interceptions/reactions up to 5 ticks; tackle willingness by standing tackle (a forward
  goes in about half as often). Late runs into the box by archetype (box-to-box most, anchors never;
  full-backs to the far edge), a cut-back option, the side stretching up behind an attack, the
  holding man to the edge of the D; markers lose late runners unless close. Corners only to the
  corner plan's men, a zonal defender, a defender's aerial edge in his own box (0.17). No shot on
  the spin with a man tight goal-side. Harness: `pass-won`, `late-run`, `shot-on-the-spin`.

| Draft matches, fresh seeds 9000-9099 | before | after |
|---|---|---|
| Interceptions per team per match (real 9-12) | 18.3 | 7.2 |
| Tackles / interceptions per 90: CB (real 1.0/1.4) | 0.62 / 1.34 | 1.16 / 0.69 |
| FB (1.3/1.2) | 1.23 / 1.98 | 1.40 / 0.57 |
| DM (1.7/1.3) | 0.97 / 2.31 | 1.81 / 1.42 |
| CM (1.3/0.9) | 1.45 / 2.00 | 1.63 / 0.85 |
| WM (1.0/0.7) | 1.39 / 3.07 | 1.46 / 0.66 |
| W (0.7/0.4) | 1.16 / 2.25 | 1.20 / 0.58 |
| ST (0.4/0.2) | 0.63 / 0.95 | 0.68 / 0.38 |
| Goal share DEF / MID / FWD (real ~12 / 28 / 55) | 4 / 13 / 83 | 9 / 17 / 73 |
| npxG share DEF / MID / FWD | 7 / 16 / 77 | 13 / 23 / 64 |
| Lone striker npxG share (stronger side by 3+) | 38% (32%) | 32% (30%) |
| Goals per match | 2.90 | 2.87 |

Seasons (La Liga, Ronaldo 94 forced, seeds 1, 2, 5, 6): Ronaldo 11, 30, 29, 18 before, 35, 37,
32, 24 after (1.25 goals/90); our side 93-111 goals, 92-102 points; Lewandowski 30 the other top
scorer; main striker npxG share median 22%, top decile 29%, max 37% (was ~55% in the top decile);
team top scorer's share of its goals median 32%. Forwards' tackles and interceptions per season
are now about a third of a centre-back's or holding midfielder's. calibrate 80 1 / 80 201:
31/31, 29/31 (before 29/31, 30/31; the misses are shots outside the box 48.3% and throw-ins 14.9).
Harness zero violations; vitest and `tsc -b` pass. `scripts/diag-defending.ts` reports all of this.

## Done (session 17): UI pass

Owner: "matchday feels quite basic and boring … the mobile experience is quite bad when drafting
and season menus". Audited every screen at 390x844 and 1280x800 with Playwright, then:
- **Draft on a phone**: the side is a bottom sheet ("Your side · 3/11 · 1/9 subs"); choosing a
  player raises it with the lit places, placing him settles him in and lowers it. Before, the pitch
  sat under a 20-row list. Round "N of 20" with a progress bar, a labelled team rating; shapes are
  picked from cards with a small formation diagram.
- **Overflow fixed**: the cup bracket (758px wide on a phone), the review and squad tabs (the shape
  select and tables pushed the page sideways). Hub and cup tabs scroll sideways cleanly (`TabBar`),
  Deals has an offers badge; the window note is a real button; sort headers are 40px.
- **Motion** (CSS only, tokens in index.css, honours reduced motion): screens fade up, tab panels
  fade, table and fixture rows settle in, draft offers deal in, a placed player settles into his
  place, lit places breathe, swaps re-settle in the squad, bars fill, the season review's
  numbers count up, buttons press.
- Hub: season progress bar, "Last time" with full names.

## Done (session 17): balance

The owner saw the 94 Cristiano Ronaldo score 60+ in a La Liga draft season. Measured with greedy
4-3-3 La Liga drafts with him forced in (`sim-season.ts <seed> 38 <out> 'La Liga' 'Cristiano
Ronaldo:94'`, seeds 1-4, then fresh 5-6), a mirror (that side against the league, 2 x 76 matches at
full fitness, Ronaldo against Higuaín 85 and Morata 82 in his place) and Premier League seasons.

- **Causes.** (1) The top of the overall scale: a 94 was a level of 17, and his archetype's
  strengths took finishing, acceleration and reactions to 19-20. In the same side at full fitness
  he scored 60 per 38 (xG 50, 10 shots/90) against Higuaín's 39 and Morata's 31: half again an 85,
  where real stars are a quarter or so. (2) Finishing at 19-20 converted 1.3-1.4x npxG (the code
  meant ~1.25x at most; real best 1.15-1.2). Not causes: penalties (he took 6-9 a season, the main
  taker takes ~68% of a side's, as in real sides), free kicks (direct shots are rare and spread),
  the poacher's shooting bonus (removing it changed nothing), rotation (he starts ~30 of 38).
- **Separate, expected:** the drafted side beats what its eleven's rating predicts by ~20 points
  a season, mostly depth: the greedy draft's bench (top seven ~85) is as good as its eleven (~82),
  where AI benches are ~75. **Structural, left as it is:** a lone striker takes ~55% of his side's
  npxG per 90 in the top decile (real ~45% at most), whoever he is (a 74 target man at Athletic
  too); full-backs almost never shoot, centre-backs rarely score from set pieces. That is why an AI
  side's striker can still have a 40-goal season (Lewandowski 91 at Barcelona 22/23: 46, both before
  and after). Next balance step if wanted: midfielders arriving in the box and set-piece headers.
- **Fixes.** `levelOf` (draft.ts): 4 overall a point up to 86, 6 a point above (94: 16.3, was 17;
  88: 15.3, was 15.5); `toRating` is its inverse. `finishingError`: 0.012 a point above 14 (was
  0.025), so 20 finishing is about what 17 was.

| La Liga, Ronaldo 94 forced (6 seasons) | before | after |
|---|---|---|
| Ronaldo goals a season (seeds 1-4; fresh 5-6) | 26, 53, 45, 32; 34, 31 | 11, 30, 36, 30; 29, 18 |
| Ronaldo goals/90 (all six) | 1.34 | 1.01 |
| Mirror, Ronaldo per 38 at full fitness (xG) | 64, 57 (51, 50) | 42, 45 (41, 41) |
| Your side's goals (mean; max) | 101; 137 | 85; 116 |
| Your side's points (mean) | 94 | 86 |
| League top scorer (mean; max) | 39.7; 53 | 36.5; 46 |
| Strikers 88+, goals/90 (1500+ min) | 1.24 | 1.11 |
| Forwards 90+, npG/npxG | 1.30 | 1.14 |
| Premier League (2 seasons, no forcing): top scorer | 35, 39 | 38, 29 |
| calibrate 80 1 / 80 201 realism | 29/31, 29/31 | 29/31, 30/31 |

Harness: zero violations (calibrate both sets, 19 draft-league matches with the stars); vitest and
`tsc -b` pass. Old saves keep the attributes they were made with.

## Done (session 16): deals, cup screen, flanks

- **Deals** judged by each side's eleven before and after, with reasons; clubs now make offers for
  your players (Accept / Turn it down); "Where they're short" and squad-player chips.
- **Cup screen**: the cup starts from the league review and has its own screen; fixed bracket.
- **Flanks**: `SIDE` table for players known for one flank (Messi right, Ronaldo left, …). Saves
  drafted before keep the old data.

## Done (session 15, later): owner's odd things

- **"The wall"** went to forwards: wingers' clearances and loose balls counted as interceptions,
  and any block counted. Now interceptions are only against an opponent's pass, blocks only of a
  shot or pass, and the award is for CB/FB/DM regulars (tackles + interceptions + blocks +
  clearances per 90). Rating offsets relevelled: every position's mean is 6.74–6.89 (W was 7.29).
- **Wrong flank**: `fitFor` takes a slot; a wide player on his wrong side plays at 0.9 (Robertson
  at RB). Random clubs' wide players are footed for their flank (`makeFeet(rng, slot)`).
- **Over-long passes**: a wild corner could fly 66 m (harness limit 65); kicks are now capped at 62 m.
- **Leagues**: La Liga, Bundesliga, Serie A, Ligue 1 (158 club-seasons, recalled ratings: means 78.2,
  76.6, 77.7, 75.1 against the Premier League's 79.5), chosen at the start of a draft.
- **Extra time and penalties** in the engine; shootout conversion tuned to ~74% (nerves: a
  penalty's error x1.6 in a shootout), ~5 rounds a shootout; zero harness violations over 180 ties.
- **European cup** for a top-four draft side (16-team knockout, the recommended format; the owner
  hadn't chosen yet when it was built: groups or an 8-team knockout were the alternatives).

## Done (session 15): sub-attributes (attributes v2)

- **31 sub-attributes** instead of 9 (spec: the "Matchday player attributes v2" Claude Doc), each
  with a real effect in the engine; the card shows six simple group ratings. See CLAUDE.md.
- **Checked with**: a mirror test of every sub-attribute (150 matches each), calibrate on seed
  sets 1 and 201, a 1,000-match league of every club-season, and full 38-matchday seasons.
- **Tuned on the way**: acceleration was worth 2x sprint speed (cut to 0.04 m/s² a point);
  strength + jumping was worth over a goal a game (jump reach 1 cm a point, duels 1.5% a point);
  finishing was worth ~0 (now steep below 14, flat above); dribbling did nothing (now keeps
  pace with the ball); keepers' reflexes 2% a point. Overall to attributes is gentler (4 overall a
  point, was 2.6): with every attribute counting, 88s were crushing 78s (Sheffield United 19/20
  scored 6 in a season). Random clubs' strength is 12–14 (was 11–15) for the same reason.
- **Newcastle 23/24** now plays to its rating (+0.04 ppg over 48 matches); club residuals are
  within noise and no attribute correlates with over/under-performance (|r| ≤ 0.11).
- **Low scoring**: draft seasons made ~2.2 xG a game (real ~2.9). Shooting more eagerly changed
  nothing (shots aren't the limit); valuing the ball near goal more (`threat` 0.4 × xG, was 0.3)
  and keeping it a little less (`POSSESSION_VALUE` 0.02, was 0.03) did: calibrate shots 12.5 and
  xG 1.4–1.5 a team, seasons 2.4–2.5 goals a game (was 2.1), realism 29/31 on both sets.
- **Three at the back** was far behind: against club-seasons in their own shapes 3-5-2 made 0.9
  xG and conceded 1.85, and opponents reached its final third 55 times a game (normal ~37): the
  back five sat deep with nobody wide in midfield. Now the ball-side wing-back steps out to press
  once the ball is past the first third, a midfield three with no wide men slides further across,
  and the far wing-back attacks the back post. 3-4-3 went from -0.34 to about level; 3-5-2 from
  -0.97 to -0.49 xGD (~-0.4 allowing for players out of position). Tried and dropped: wing-backs
  coming short, outside centre-backs splitting, pushing its midfielders higher, earlier pressing.
  Four-at-the-back shapes are untouched (4-4-2 0.00, 4-3-3 +0.26 with a +0.29 rating edge).
- **Still weak**: 3-5-2 still concedes many long shots (16 a game against, 0.09 xG each); single
  defending attributes count little (team shape decides most defending).

## Done (session 14): fair attributes, single-season squads

- **Why Hazard, Mané, Son, Kane and Ibrahimović looked overpowered next to Ronaldo**: a draft
  player's attributes were rolled from a hash of his name (each ±2 around his level, plus a
  random +2–5 on his position's strengths), so the overall said nothing reliable about ability.
  Ibrahimović had pace 18 and passing 17 as a target man, Hazard shooting 20, Haaland shooting 16
  and tackling 18, Ronaldo dribbling 12, Kane passing 9. Now `shapedAttributes` gives each
  archetype a fixed shape at his level (±0.7 noise): same overall + archetype ≈ same player.
- **False nines aren't weaker**: a same-level striker under each archetype in the same side over
  150 matches got 0.53–0.60 xG a game in 4-3-3 and 4-4-2 alike; Kane (a false nine) was one of the
  overpowered ones. Archetypes left as they are.
- **Inside forwards rated ~0.6 above wingers** at the same level (6.99 vs 6.71 a match even
  after a first correction): they score where wingers cross, but helped their side no more
  (goals for and points over 150 matches). `rate` now offsets by archetype too (`STYLE_OFFSET`).
- **Single-season squads** (`squads.ts`): 43 club-seasons, 20 clubs, ~900 entries (~670
  players), 17–23 a squad. Saved seasons keep their own teams, so old saves still load.

- **Club balance (Newcastle 23/24 overperforming)**: two causes found, both fixed.
  Shapes: wingers stayed high out of possession, so 4-4-2 and 4-1-4-1 were worth ~0.4 xG a game
  more than 4-3-3, 4-2-3-1 and 3-4-3. Wingers now track back into the midfield line when the ball
  is in their half (not when pressing high): five shapes within ~0.13 xGD. 3-5-2 is still ~0.5
  weaker (only Sheffield United use it). Archetype shapes are now levelled (`LEVELLED` in
  archetypes.ts) by what each attribute is worth to a line, so a pace-heavy archetype isn't
  better than a tackling one at the same overall. Measured worth, -2 for a whole line: pace
  ~0.2 xGD for defence and attack, passing ~0.2 for midfield, stamina/shooting ~0.15 for
  attack; defenders' tackling and positioning ~0. Newcastle 23/24 still ~+0.18 ppg over its
  rating (was larger); Chelsea 14/15 ~-0.6 under. Cause not pinned down; the likeliest is that
  defending attributes barely matter in the engine (tackling-heavy sides underperform,
  correlation -0.27). Next balance step: make defenders' tackling/positioning count.

- **Attributes and results (follow-up)**: a mirror test (each club against a copy of itself with
  one line's attribute -6, 250–300 matches; ±0.07 xGD noise) found pace decided most things.
  Finishing was fine (-6 shooting for forwards ≈ -0.2 goals a game; one 300-match run said 0,
  which was noise: use 600+ for goal differences). Passing: a poor passer judged his own
  looseness exactly and chose safe passes, so he never gave it away more; now `passLooseness`
  rises steeply below the best, the occasional pass goes astray (×4 error, far likelier for poor or
  hurried passers), and the AI judges looseness only partly by his own passing
  (`judgedLooseness`). A whole side's passing -6 went from 0.3 to 0.5 goals a game. Pressure
  (`pressureOn`) is weighted by the closer's tackling + positioning and the carrier's composure.
  Defenders' tackling/positioning still only ~0.1; tried and dropped (no effect, or realism fell):
  tackle timing and win chance, block chance, tighter marking, a reaction delay reading passes,
  anticipating runs, pressure on shot accuracy (goals fell to 0.9). Midfielders get few passes
  (CBs and FBs ~7,000 each over 30 matches, CMs ~2,700), so midfield-only changes barely register.
  Archetype mirror (`archetype` swapped, same attributes): two defensive full-backs cost ~0.4
  goals a game against overlapping ones (Chelsea 14/15's problem); they now push to base + 0.1.
  Club residual RMS over 96 matches each 0.19 (noise ~0.14); Newcastle 23/24 -0.11, Chelsea 14/15
  -0.27 (was -0.6 to -0.8). Still: 3-5-2 ~0.3 weaker, winger ~0.1 under inside forward.

## Done (session 13): ratings, deeper stats, January window, review

- **Match ratings** were a goals-and-assists scale: centre-backs averaged 6.4 a game, strikers
  7.3, and a centre-back's season never got past ~7.0. Now defensive work counts (tackles,
  interceptions, blocks, headers won, not being dribbled past, clearances, loose balls won,
  passes completed), with clean sheets, goals conceded while on and the result, and each
  position is offset so a regular's season averages ~6.75 whatever his position. Best
  centre-backs now ~7.2–7.3 a season, best forwards ~7.5–7.9. The offset scales with minutes
  played, and cameos under 20 minutes don't count towards a season's average.
- **Two engine faults the new numbers exposed**: penalties went in 32% of the time (real ~78%):
  they used the open-play shot with its pressure and spread; now a placed kick from the spot
  (~80%), reported at the standard 0.78 xG. And elite finishers scored at ~1.8× their xG (Kane
  40 from 18): accuracy rose too steeply with shooting, putting 56% of their shots on target;
  `finishingError` is flatter at the top (elite ~42% on target, ~1.2–1.3× xG; Kane now 26 from
  20). Realism 29/31 and 30/31 on the two seed sets, goals per xG 1.0.
- **Underlying numbers** per player per match and over the season: xG, non-penalty xG, xA, big
  chances (0.3 xG+) and how many scored, penalties, goals by left/right/head, blocks,
  clearances, headers, loose balls won, dribbled past, and for keepers xG on target faced and
  goals prevented. Tap a name in Squad, Stats or the review for his season card, with a
  match-by-match log. Stats has a sortable, filterable player table (G, xG, G−xG, A, xA …)
  and leaderboards for xG, goals above xG and xA.
- **January window (draft mode)**: `draft/transfers.ts`, the Deals tab. Swap 1–2 of yours for
  1–2 of theirs while the next match is in January (about matchdays 23–27). Clubs value players
  by overall on a steep curve, form and fitness, more if he'd start for them; they want 10% over
  like for like and won't weaken their best eleven. Three deals per window, one per club, nobody
  moves twice; squads 18–22 with a keeper. A player's season numbers go with him.
- **Season review**: player of the season, team of the season on a pitch, your star, unsung
  hero, ever-present and who was below par, the league's most clinical and wasteful finishers,
  chief creator, best defender and keeper, and matches to remember (comebacks, late winners,
  goal-fests, upsets, beating the champions).
- Fixtures open on the current matchday; the squad table sorts by any column.

## Done (session 12): over-performing sides, feet, archetypes

- **Why Leicester/Southampton 2010s overperformed**: they (and Man Utd 2010s) play 4-4-2, and
  4-4-2 was worth ~0.9 goals a game over 4-3-3 with identical players: two strikers both on the
  last defender's shoulder attacking every cross, while wingers stayed at the edge of the box.
  Now the second striker plays off the first (deeper, arriving late) and inside forwards come
  into the box. Shapes are within ~±0.5 goals a game of each other with squads made for them.
  Keeper quality counted too much (a 20-rated keeper saved 16 points more than a 12): now ~10.
  Result: Leicester 1.74 → 1.32 points a game, Southampton 1.74 → 1.16, in line with their
  ratings; Man Utd 2010s still near the top (they are one of the best squads on paper).
- **Preferred foot and weak foot**: see CLAUDE.md. Hazard scores ~30% less on the right wing
  (on his weaker, though good, left foot).
- **Archetypes**: poacher / target man / false nine; winger / inside forward; overlapping /
  inverted / defensive full-back; box-to-box / playmaker / ball-winner; anchor / deep-lying
  playmaker; stopper / ball-playing defender; shot-stopper / sweeper keeper. Shown in the draft,
  the squad screen, the player card and on the pitch.
- Realism 30/31 on both seed sets (offsides 0.8 on one, corners 3.9 on the other).

## Done (session 11): positions, starts, review and optimisation

- **Positions**: every player has his own position plus, often, a secondary and tertiary one
  (real ones for the draft pools: Palmer W/CM, Milner CM/FB/WM, Haaland ST only). Out of
  position he plays with reduced passing, shooting, dribbling, tackling, positioning and
  composure (to 80% in a strange position); the staff pick, subs and draft rating use the same
  familiarity. Draft players' ability is their real overall, not their generated attributes.
- **Starts vs sub appearances** in the squad table: "12 (3)".
- **Optimisation**: 2.4 s → 1.56 s per match headless (distance maths without Math.hypot, team
  lists built once per tick, the shape's nearest-opponent search without per-player allocation).
- **Refactors** (matches byte-identical before and after): `chooseAction` split into option
  generators, `resolveTouch` into one function per kind of touch, the viewer's highlight skip
  into a pure, tested `playback.ts`.
- Realism 30/31 on both seed sets (goals at the bottom edge, 1.1).

## Done (session 10): owner's feedback after a full draft season

- **Benches of nine** (Premier League rule; five changes in three stoppages as before). Draft is
  now 11 + 9 (20 rounds, every club-decade offered once). The staff's pick pairs players and
  places best-first across the formation (van Dijk no longer lands at full-back because that
  slot came first).
- **Formations**: 4-2-3-1, 4-1-4-1, 3-5-2, 3-4-3 added; pick one in the draft or change it any
  time in the Squad tab. One-striker shapes created ~30% fewer shots (an old 4-3-3 weakness):
  wingers now come inside when the ball is central high up, the most advanced midfielder arrives
  in the box, wing-backs push on. Shots per shape now 8.5–12.4 per match.
- **Stats tab** (replaces Scorers): leaderboards for goals, assists, chances created, average
  rating, pass completion, tackles + interceptions, dribbles, clean sheets, saves; a clubs table
  with possession, pass completion, shots, goals and xG for/against, clean sheets.
- **Season review**: your record (unbeaten/winning runs, biggest win, top scorer), champions,
  Golden Boot, and every club's W-D-L, runs, biggest win and top scorer.
- **Corners** wait for both sides to set up (~10 s of match time): centre-backs and strikers to
  the posts, the six-yard box and the spot, one man on the edge; the keeper on his line, a
  near-post man and a marker on each attacker. The best crosser who isn't going up takes it.
- **Squad on a pitch**: the eleven in the formation, rating, position and fitness on each; tap a
  player then another or a substitute to swap.
- **Names**: "van Persie", "De Bruyne", "Mac Allister", and known-as names (Son, Alisson,
  Thiago, Bernardo, Chicharito...).
- **Ratings** re-set against each player's peak FIFA rating at that club in that decade (from
  memory, spot-checked: Hazard 91, Özil 89, David Silva 89).
- Realism 30/31 on seeds 1–80 (penalties at the top edge), 31/31 on 201–280; corners 4.6–4.8,
  offsides 1.1–1.2 now inside their ranges on both sets.

## Done (session 9): cross goals, defensive commentary, captions, squads, corners, offsides, draft

- **Draft mode** (38-0 style): pick 4-3-3 or 4-4-2, then 16 rounds, each offering one Premier
  League club-decade (e.g. Chelsea 2010s); put the pick in an open starting place (fit shown; a
  keeper only in goal) or on the five-man bench. Then a 38-match season against 19 club-decades,
  with the drafted players missing from their old sides. Team rating = starters' overalls, less
  out of position. 20 pools, ~380 players; overalls are our own rough estimates, from memory, not
  checked one by one. A sensibly drafted side (rating ~85) takes ~66–70 points: a contender,
  not unbeaten.

- **Cross-heavy goals** (owner's report, confirmed): 41% of goals came from crosses. Keepers were
  judged at the edge of their reach instead of on the ball's line past them, and contested headers
  were too accurate. Now ~18% from open-play crosses (direct + second balls); real ~15%.
- **Commentary** for turnovers high up the pitch, interceptions, last-ditch tackles, claims.
- **Captions**: quiet on-pitch labels for key actions (interception, dribble, cross, long ball,
  header, long shot, curled finish), toggleable. Engine: curled (finesse) shots from flair players.
- **Squads**: 7-man benches, fatigue (stamina), up to 5 subs in 3 windows, injuries (from fouls
  and from playing on exhausted) carried across matchdays, fitness recovery between matches,
  auto-picked or hand-picked XI (Squad tab), Scorers tab, player of the match.
- **Corners** (1.9 → 4.0–4.4 per team): players could replay their own glanced header or diving
  parry in the same instant, so most balls heading behind were caught again. Fixed with recovery
  after glances, blocks, dives and charge-downs (the kicker too). Blocked crosses glance on, blocked
  shots spin off wide. Base save chance raised a notch to compensate for the live rebounds.
- **Offsides** (0.8 → 0.8–1.2, depending on the seed set: only a partial fix): strikers play on the last defender's shoulder instead of sitting in
  the team's shape 12m behind it; the back line holds (doesn't drop with him) when the ball is
  under pressure; passers read the line a beat late (`OFFSIDE_READ_LAG`) and see a yard off less
  often than five. Still under the real ~1.6–2: the line drops with every onside runner, so
  runners are rarely past it at the kick. The next step would be a line that steps up as a unit.
- Realism after all of it: 31/31 on seeds 1–80, 28/31 on 201–280 (offsides low, corners 4.0,
  one long dull spell).
- Calibration counts open-play crosses only (corner deliveries excluded), to match the real
  figures. `scripts/diag-corners.ts`: what put each corner behind.

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

1. **Draft mode polish**: more club-seasons; saving a draft in progress; a season summary (the record, 38-0 or not) at the end.
2. **Transfers / scouting** (milestone 4) for the club mode, then development / youth
   (milestone 5). End of season: player ageing, a new season with the same clubs.
3. **Who has the ball** (after session 18, round 3): ball in the final third 21% (real ~25%; a higher
   line in possession gets there but every side shoots ~15 times); wide midfielders rarely shoot;
   the drafted side scores ~84 a season (dominant real sides 85-110).
4. **Realism gaps**: offsides (0.8–1.2 vs real ~1.8) need a line that steps up together;
   through balls high (~11, shown not scored).
5. Optional: a friendlier results screen after each matchday (other scores coming in).

## Open questions / decisions deferred

- Offside phase resets on *any* touch, including saves and deflections (the real law only resets
  on a deliberate play). The harness mirrors this. Revisit with ball height.
- `chooseAction` consumes the match RNG, so calling it outside the loop (a debugger, or a UI
  "what would he do") changes the rest of the match. Fine for now; clone the RNG if needed.
- The user can't make in-match substitutions: a watched match is simulated ahead of playback.
- Players are clamped to the pitch rectangle (no one steps over a line).

## Notes for the next session

- Read CLAUDE.md first, especially "the one lesson worth internalizing" and the repo layout.
- `npm test` takes ~80s (six full matches through the harness, plus the viewer tests);
  `npm run calibrate -- 80` ~3 min. Tune on one seed set, confirm on another (`-- 80 201`).
- Commit and push before ending a session — history doesn't carry across devices.
