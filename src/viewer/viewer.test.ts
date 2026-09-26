import { describe, expect, it } from 'vitest'
import { createMatch, frameOf, ownGoalX, randomTeam, step } from '../engine/index.ts'
import { buildCommentary } from './commentary.ts'
import { ANIMATION_LEAD, animationsAt, flightAt, highlightWindows, replayMoments, runsAt, windowAt } from './highlights.ts'
import { GOAL_DEPTH, netAt } from './net.ts'
import { describeTraits, playerLines } from './players.ts'
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
