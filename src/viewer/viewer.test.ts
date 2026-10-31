import { describe, expect, it } from 'vitest'
import { type MatchEvent, createMatch, frameOf, ownGoalX, randomTeam, runMatch, step } from '../engine/index.ts'
import { buildCommentary, matchNames } from './commentary.ts'
import { advancePlayhead } from './playback.ts'
import { ANIMATION_LEAD, CAPTION_TICKS, animationsAt, celebrationPose, captionsAt, flightAt, highlightWindows, replayMoments, runsAt, windowAt } from './highlights.ts'
import { GOAL_DEPTH, netAt } from './net.ts'
import { describeTraits, playerLines, rate } from './players.ts'
import { PLAYERS_AT, Timeline } from './timeline.ts'

const SEED = 4
const home = randomTeam(SEED * 2 + 1)
const away = randomTeam(SEED * 2 + 2)
const full = new Timeline(home, away, SEED)
while (!full.done) full.advance(5000)

describe('timeline', () => {
  it('records exactly what the engine produced, tick by tick', () => {
    const s = createMatch(home, away, { seed: SEED })
    const t = new Timeline(home, away, SEED)
    t.advance(3000)
    for (let tick = 0; tick <= 3000; tick++) {
      const want = frameOf(s)
      const got = t.frame(tick)
      expect(got[0]).toBeCloseTo(want.ball.x, 3)
      expect(got[1]).toBeCloseTo(want.ball.y, 3)
      expect(got[2]).toBeCloseTo(want.ball.z, 3)
      expect(got[3]).toBe(want.ball.ownerIdx ?? -1)
      want.players.forEach((p, i) => {
        if (!p.onPitch) return expect(got[PLAYERS_AT + i * 2]).toBeNaN()
        expect(got[PLAYERS_AT + i * 2]).toBeCloseTo(p.x, 3)
        expect(got[PLAYERS_AT + 1 + i * 2]).toBeCloseTo(p.y, 3)
      })
      step(s)
    }
  })

  it('reconstructs the match clock the engine stamped on every event', () => {
    for (const e of full.state.events) expect(full.clockAt(e.tick)).toBe(e.clock)
  })

  it('knows the score at any tick', () => {
    expect(full.scoreAt(full.lastTick)).toEqual(full.state.score)
    expect(full.scoreAt(0)).toEqual([0, 0])
  })
})

describe('commentary', () => {
  const lines = buildCommentary(full.state, full.state.events)

  it('has a line for every goal, and bookends the match', () => {
    const goals = full.state.events.filter((e) => e.type === 'goal').length
    expect(lines.filter((l) => l.kind === 'goal')).toHaveLength(goals)
    expect(lines[0].text).toMatch(/^Kick-off/)
    expect(lines[lines.length - 1].text).toMatch(/^Full-time/)
  })

  it('reads the same every time', () => {
    expect(buildCommentary(full.state, full.state.events)).toEqual(lines)
  })

  it('never changes a line once written', () => {
    const events = full.state.events
    const half = buildCommentary(full.state, events.slice(0, Math.floor(events.length / 2)))
    expect(lines.slice(0, half.length)).toEqual(half)
  })

  it("doesn't read the same twice running", () => {
    // With the players' names taken out, no line is the one before it.
    const shape = (t: string): string => names.reduce((s, n) => s.split(n).join('N'), t).replace(/\d+/g, '#')
    const names = [...matchNames(full.state)].sort((a, b) => b.length - a.length)
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].kind === 'period') continue
      expect(shape(lines[i].text)).not.toBe(shape(lines[i - 1].text))
    }
  })

  it('tells apart two men in the match who share a surname', () => {
    const names = matchNames(full.state)
    const short = full.state.players.map((p) => p.def.name.split(' ').at(-1))
    full.state.players.forEach((_, i) => {
      const twin = short.findIndex((s, j) => j !== i && s === short[i])
      if (twin >= 0) expect(names[i]).not.toBe(names[twin])
    })
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('celebrations', () => {
  it("strikes a pose once the scorer has stopped, from where he ran", () => {
    const goals = full.state.events.filter((e): e is Extract<MatchEvent, { type: 'goal' }> => e.type === 'goal' && e.celebration !== null && !e.ownGoal)
    expect(goals.length).toBeGreaterThan(0)
    for (const g of goals) {
      const posAt = (t: number) => {
        const f = full.frame(t)
        return { x: f[PLAYERS_AT + g.scorerIdx * 2], y: f[PLAYERS_AT + g.scorerIdx * 2 + 1] }
      }
      let posed = 0
      for (let t = g.tick; t < g.tick + 200; t++) {
        const p = celebrationPose(g, t, posAt)
        if (!p) continue
        posed++
        expect(p.idx).toBe(g.scorerIdx)
        expect(p.kind).toBe(g.celebration === 'kneeSlide' ? 'slide' : g.celebration === 'cornerFlag' ? 'arms' : 'jump')
      }
      expect(posed).toBeGreaterThan(5)
      expect(celebrationPose(g, g.tick, posAt)).toBeNull()
    }
  })
})

describe('view modes', () => {
  const events = full.state.events
  const goals = events.filter((e) => e.type === 'goal')

  it('shows every goal, with build-up, in both highlight modes', () => {
    for (const mode of ['key', 'goals'] as const) {
      const windows = highlightWindows(events, mode)
      for (const g of goals) {
        expect(windowAt(windows, g.tick).inside).toBe(true)
        expect(windowAt(windows, g.tick - 60).inside).toBe(true)
      }
    }
  })

  it('produces sorted, non-overlapping windows, fewer for goals only', () => {
    const key = highlightWindows(events, 'key')
    const goalsOnly = highlightWindows(events, 'goals')
    for (const ws of [key, goalsOnly]) {
      ws.forEach(([a, b], i) => {
        expect(b).toBeGreaterThan(a)
        if (i > 0) expect(a).toBeGreaterThan(ws[i - 1][1])
      })
    }
    expect(goalsOnly.length).toBeLessThanOrEqual(key.length)
    expect(highlightWindows(events, 'full')).toEqual([])
  })

  it('knows which kick is in the air', () => {
    const i = events.findIndex((e) => e.type === 'shot')
    const shot = events[i]
    const at = full.indexAfter(shot.tick)
    const flight = flightAt(events, at)
    expect(flight?.kick).toBe(shot)
    expect(flight?.end).toBeGreaterThanOrEqual(shot.tick)
  })
})

describe('animations', () => {
  const events = full.state.events

  it('shows a slide tackle as it happens, starting just before contact and then finishing', () => {
    const slide = events.find((e) => e.type === 'tackle' && e.style === 'slide')
    if (!slide || slide.type !== 'tackle') throw new Error('no slide tackle in this match')
    // This slide specifically (the same player may slide in again soon after).
    const thisOne = (ph: number): boolean =>
      animationsAt(events, full.indexAfter(ph + ANIMATION_LEAD), ph).some(
        (a) => a.kind === 'slide' && a.idx === slide.byIdx && a.toward.x === slide.pos.x && a.toward.y === slide.pos.y,
      )
    expect(thisOne(slide.tick)).toBe(true)
    expect(thisOne(slide.tick - ANIMATION_LEAD - 1)).toBe(false)
    expect(thisOne(slide.tick + 30)).toBe(false)
  })
})

describe('strikes and headers', () => {
  const events = full.state.events
  it('swings the kicker\'s leg around every pass, towards where it was played', () => {
    const pass = events.find((e) => e.type === 'pass' && !e.header)
    if (!pass || pass.type !== 'pass') throw new Error('no passes')
    const at = animationsAt(events, full.indexAfter(pass.tick + ANIMATION_LEAD), pass.tick)
    expect(at.some((a) => a.kind === 'kick' && a.idx === pass.byIdx && a.toward.x === pass.target.x)).toBe(true)
  })
  it('lifts a player for a header', () => {
    const header = events.find((e) => e.type === 'deflection' && e.kind === 'header')
    if (!header || header.type !== 'deflection') throw new Error('no headers')
    const at = animationsAt(events, full.indexAfter(header.tick + ANIMATION_LEAD), header.tick)
    expect(at.some((a) => a.kind === 'jump' && a.idx === header.idx)).toBe(true)
  })
})

describe('captions', () => {
  const events = full.state.events
  const teamOf = (idx: number) => full.state.players[idx].team
  const attacksHigh = (team: 0 | 1, tick: number) => ownGoalX(team, full.halfTimeTick !== null && tick > full.halfTimeTick ? 2 : 1) === 0
  it('names an interception above the player who made it, for a moment', () => {
    const e = events.find((x) => x.type === 'possession' && x.won === 'cut')
    if (!e || e.type !== 'possession') throw new Error('no interceptions')
    const at = (ph: number) => captionsAt(events, full.indexAfter(ph), ph, attacksHigh, teamOf)
    expect(at(e.tick).some((c) => c.idx === e.idx && c.text === 'Interception')).toBe(true)
    expect(at(e.tick + CAPTION_TICKS + 1).some((c) => c.idx === e.idx && c.text === 'Interception')).toBe(false)
  })
  it('never shows more than two at once', () => {
    for (let ph = 0; ph < full.lastTick; ph += 97) expect(captionsAt(events, full.indexAfter(ph), ph, attacksHigh, teamOf).length).toBeLessThanOrEqual(2)
  })
})

describe('the ball in the net', () => {
  // A firm shot in at 1.2m, just inside the right post of the goal at x = 105.
  const entry = { x: 105, y: 36, z: 1.2 }
  const before = { x: 102.6, y: 35.8, z: 1.25 }
  it('carries on into the goal from where it crossed the line', () => {
    const s = netAt(entry, before, 0.03)
    expect(s.ball.x).toBeGreaterThan(105)
    expect(s.bulge.amount).toBe(0)
  })
  it('stretches the back of the net where it hits, harder shots further', () => {
    const peak = (b: typeof before) => Math.max(...Array.from({ length: 40 }, (_, i) => netAt(entry, b, i * 0.02).bulge.amount))
    const soft = { x: 104.2, y: 35.9, z: 1.2 }
    expect(peak(before)).toBeGreaterThan(peak(soft))
    expect(peak(soft)).toBeGreaterThan(0)
  })
  it('ends up on the floor inside the goal', () => {
    const s = netAt(entry, before, 3)
    expect(s.ball.x).toBeGreaterThan(105)
    expect(s.ball.x).toBeLessThanOrEqual(105 + GOAL_DEPTH + 0.01)
    expect(s.ball.z).toBeLessThan(0.2)
    expect(Math.abs(s.bulge.amount)).toBeLessThan(0.01)
  })
})

describe('player stats', () => {
  const lines = playerLines(full.state, full.state.events)
  it('adds up to the match: goals to the score, passes to the team totals', () => {
    const own = full.state.events.filter((e) => e.type === 'goal' && e.ownGoal).length
    expect(lines.reduce((n, l) => n + l.goals, 0) + own).toBe(full.state.score[0] + full.state.score[1])
    for (const team of [0, 1] as const) {
      const mine = lines.filter((_, i) => full.state.players[i].team === team)
      expect(mine.reduce((n, l) => n + l.passes, 0)).toBe(full.state.stats[team].passes)
      expect(mine.reduce((n, l) => n + l.shots, 0)).toBe(full.state.stats[team].shots)
    }
    for (const l of lines) {
      expect(l.passesCompleted).toBeLessThanOrEqual(l.passes)
      expect(l.rating).toBeGreaterThanOrEqual(3)
      expect(l.rating).toBeLessThanOrEqual(10)
    }
  })
  it('describes only traits that stand out', () => {
    expect(describeTraits({ flair: 0.9, temper: 0.5, aggression: 0.1, workRate: 0.5, directness: 0.5 })).toEqual(['Flair player', 'Stands off'])
    expect(describeTraits({ flair: 0.5, temper: 0.5, aggression: 0.5, workRate: 0.5, directness: 0.5 })).toEqual([])
  })
})

describe('replays', () => {
  const events = full.state.events
  const teamOf = (idx: number) => full.state.players[idx].team
  const goalXOf = (team: 0 | 1, tick: number) => ownGoalX(team, full.halfTimeTick !== null && tick > full.halfTimeTick ? 2 : 1)
  const moments = replayMoments(events, teamOf, goalXOf)

  it('replays every goal and every penalty foul, after the fact', () => {
    for (const e of events) {
      const wanted = e.type === 'goal' || (e.type === 'foul' && e.award === 'penalty')
      if (!wanted) continue
      const m = moments.find((x) => x.tick === e.tick)
      expect(m, `${e.type} at ${e.clock}`).toBeDefined()
      expect(m!.autoAt).toBeGreaterThan(e.tick)
    }
    expect(moments.filter((m) => m.kind === 'goal').every((m) => m.angles.length === 3)).toBe(true)
  })

  it('starts each replay where the move began, between 5 and 15 seconds before the moment', () => {
    for (const m of moments) {
      expect(m.tick - m.start).toBeGreaterThanOrEqual(50)
      expect(m.tick - m.start).toBeLessThanOrEqual(150)
      expect(m.end).toBeGreaterThan(m.tick)
    }
  })
})

describe('runs', () => {
  const events = full.state.events

  it('shows a run from when it starts until it ends or the runner gets the ball', () => {
    const run = events.find((e) => e.type === 'run')
    if (!run || run.type !== 'run') throw new Error('no runs in this match')
    const active = (ph: number) => runsAt(events, full.indexAfter(ph), ph).some((r) => r.idx === run.idx && r.start === run.tick)
    expect(active(run.tick)).toBe(true)
    expect(active(run.until + 1)).toBe(false)
    const received = events.find((e) => e.type === 'possession' && e.idx === run.idx && e.tick > run.tick && e.tick < run.until)
    if (received) expect(active(received.tick)).toBe(false)
  })
})

describe('playback skips between highlights', () => {
  it('fades out, rolls on to the next moment, fades back in; inside a moment it just plays', () => {
    const windows: [number, number][] = [[500, 600]]
    const o = { dt: 1 / 60, rate: 1, skipping: true, windows, done: false, lastTick: 5000 }
    let step = advancePlayhead(100, null, { ...o, now: 0 })
    expect(step.cut).not.toBeNull()
    let maxCover = 0
    let last = step.playhead
    for (let now = 16; step.cut && now < 10_000; now += 16) {
      step = advancePlayhead(step.playhead, step.cut, { ...o, now })
      maxCover = Math.max(maxCover, step.cover)
      expect(step.playhead).toBeGreaterThanOrEqual(last - 1e-9) // never goes backwards
      last = step.playhead
    }
    expect(step.cut).toBeNull()
    expect(maxCover).toBe(1)
    expect(step.cover).toBe(0)
    expect(step.playhead).toBeGreaterThanOrEqual(500)
    expect(step.playhead).toBeLessThan(520)
    const inside = advancePlayhead(550, null, { ...o, now: 0 })
    expect(inside.cut).toBeNull()
    expect(inside.playhead).toBeCloseTo(550.5)
  })
})

describe('match ratings', () => {
  it('rates a commanding defensive game like a forward scoring', () => {
    const base = { passes: 0, passesCompleted: 0, keyPasses: 0, shots: 0, onTarget: 0, goals: 0, assists: 0, xg: 0, npxg: 0, xa: 0, penGoals: 0, penTaken: 0, bigChances: 0, bigChancesScored: 0, headedGoals: 0, leftGoals: 0, rightGoals: 0, tackles: 0, interceptions: 0, blocks: 0, clearances: 0, aerials: 0, recoveries: 0, dribbles: 0, dribbledPast: 0, saves: 0, savedXg: 0, facedXg: 0, conceded: 0, fouls: 0, ownGoals: 0, yellow: false, red: false, on: null, off: null, played: true, injured: false, rating: 6 }
    const cb = rate({ ...base, passes: 50, passesCompleted: 47, tackles: 3, interceptions: 5, blocks: 2, clearances: 8, aerials: 6 }, 'CB', { result: 1, cleanSheet: true, minutes: 90 })
    // A striker's usual work off the ball, plus the winner.
    const st = rate({ ...base, passes: 18, passesCompleted: 14, shots: 4, onTarget: 2, goals: 1, xg: 0.6, npxg: 0.6, tackles: 1, interceptions: 2, blocks: 1, aerials: 1, recoveries: 2 }, 'ST', { result: 1, cleanSheet: false, minutes: 90 })
    const blank = rate({ ...base, passes: 15, passesCompleted: 11, shots: 2, interceptions: 2, recoveries: 2 }, 'ST', { result: 0, cleanSheet: false, minutes: 90 })
    const keeper = rate({ ...base, passes: 25, passesCompleted: 22, saves: 6, savedXg: 1.4 }, 'GK', { result: 1, cleanSheet: true, minutes: 90 })
    // A dominant defensive display outrates an ordinary game with a goal in it.
    expect(cb).toBeGreaterThanOrEqual(7.5)
    expect(cb).toBeGreaterThan(st)
    expect(st).toBeGreaterThanOrEqual(6.8)
    expect(keeper).toBeGreaterThanOrEqual(8)
    expect(blank).toBeLessThan(6.5)
  })
})

describe('orders while watching', () => {
  const field = (t: Timeline, team: 0 | 1) => t.state.players.filter((p) => p.team === team && p.onPitch && p.slot.role !== 'GK')
  const bench = (t: Timeline, team: 0 | 1) => t.state.players.filter((p) => p.team === team && !p.onPitch && p.def.role !== 'GK')

  it('play on from the playhead, and the match is runMatch with the same orders', () => {
    const t = new Timeline(home, away, SEED)
    t.advance(12000) // simulated well ahead of the playhead
    const off = field(t, 0)
    const on = bench(t, 0)
    expect(t.order(4321, { kind: 'formation', team: 0, formation: home.formation === '3-5-2' ? '4-3-3' : '3-5-2' })).toBeNull()
    expect(t.lastTick).toBe(4321)
    expect(t.order(4321, { kind: 'block', team: 0, block: home.block === 'low' ? 'high' : 'low' })).toBeNull()
    expect(t.order(4321, { kind: 'sub', team: 0, offIdx: off[3].idx, onIdx: on[0].idx })).toBeNull()
    t.advance(15000)
    // Scrubbed back and changed again: the later future is replaced.
    expect(t.order(9876, { kind: 'sub', team: 0, offIdx: off[6].idx, onIdx: on[1].idx })).toBeNull()
    while (!t.done) t.advance(5000)
    expect(t.orders.map((o) => o.tick)).toEqual([4321, 4321, 4321, 9876])
    const headless = runMatch(home, away, { seed: SEED, orders: t.orders })
    expect(t.state.events).toEqual(headless.events)
    expect(t.state.stats).toEqual(headless.stats)
    const last = frameOf(headless)
    const f = t.frame(t.lastTick)
    last.players.forEach((p, i) => p.onPitch && expect(f[PLAYERS_AT + i * 2]).toBeCloseTo(p.x, 3))
    // Up to the first order, frames and events are the order-free match's.
    for (const tick of [0, 2000, 4321]) expect(Array.from(t.frame(tick))).toEqual(Array.from(full.frame(tick)))
    expect(t.state.events.filter((e) => e.tick < 4321)).toEqual(full.state.events.filter((e) => e.tick < 4321))
    expect(t.state.events.filter((e) => e.type === 'sub' && e.reason === 'manager').length).toBe(2)
  })

  it('refuses an order the laws do not allow, changing nothing', () => {
    const t = new Timeline(home, away, SEED)
    t.advance(3000)
    const keeper = t.state.players.find((p) => p.team === 0 && p.slot.role === 'GK')!
    expect(t.order(1000, { kind: 'sub', team: 0, offIdx: keeper.idx, onIdx: bench(t, 0)[0].idx })).toMatch(/keeper/)
    expect(t.lastTick).toBe(3000)
    expect(t.orders).toEqual([])
  })

  it('an order is quick: back to the last copy and on to the playhead', () => {
    const t = new Timeline(home, away, SEED)
    t.advance(30000)
    t.order(29999, { kind: 'block', team: 1, block: away.block === 'high' ? 'low' : 'high' })
    // At most CHECKPOINT_EVERY ticks played again (~10-20 ms on a desktop core).
    expect(t.lastOrderMs).toBeLessThan(500)
  })
})
