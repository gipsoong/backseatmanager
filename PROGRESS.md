# Progress

Updated at the end of each session. Keep this short — current state, not a full history.

## Current milestone

**3. Season loop** — league, fixtures, table, saves (session 8); squads, fitness, subs, injuries,
team selection and a 38-0-style draft mode (session 9); a January swap window in draft mode
(session 13). Next: transfers for the club mode; in-match management (on hold at the owner's
request).

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

1. **Draft mode polish**: more club-decades (Wolves, Leeds, Burnley, Swansea, …); saving a draft
   in progress; a season summary (the record, 38-0 or not) at the end.
2. **Transfers / scouting** (milestone 4) for the club mode, then development / youth
   (milestone 5). End of season: player ageing, a new season with the same clubs.
3. **Realism gaps**: offsides (0.8–1.2 vs real ~1.8) need a line that steps up together;
   through balls high (~11, shown not scored).
4. Optional: a friendlier results screen after each matchday (other scores coming in).

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
