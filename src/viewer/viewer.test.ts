import { describe, expect, it } from 'vitest'
import { createMatch, frameOf, randomTeam, step } from '../engine/index.ts'
import { buildCommentary } from './commentary.ts'
import { flightAt, highlightWindows, windowAt } from './highlights.ts'
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
