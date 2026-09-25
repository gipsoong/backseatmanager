import { describe, expect, it } from 'vitest'
import { createMatch, frameOf, randomTeam, step } from '../engine/index.ts'
import { buildCommentary } from './commentary.ts'
import { Timeline } from './timeline.ts'

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
      expect(got[2]).toBe(want.ball.ownerIdx ?? -1)
      want.players.forEach((p, i) => {
        if (!p.onPitch) return expect(got[3 + i * 2]).toBeNaN()
        expect(got[3 + i * 2]).toBeCloseTo(p.x, 3)
        expect(got[4 + i * 2]).toBeCloseTo(p.y, 3)
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
