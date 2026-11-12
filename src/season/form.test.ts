import { describe, expect, it } from 'vitest'
import { Rng, makePlayer } from '../engine/index.ts'
import { FORM_MAX, formOf, inForm } from './form.ts'

describe('form', () => {
  it('is the same for a player and matchday every time, and stays within the cap', () => {
    for (let md = 1; md <= 38; md++) {
      const f = formOf(7, 'p3-12', md)
      expect(f).toBe(formOf(7, 'p3-12', md))
      expect(Math.abs(f)).toBeLessThanOrEqual(FORM_MAX)
    }
  })

  it('averages out at zero over many players, and swings in runs rather than at random', () => {
    let sum = 0
    let n = 0
    let same = 0
    for (let i = 0; i < 400; i++)
      for (let md = 1; md <= 38; md++) {
        const f = formOf(1, `x${i}`, md)
        sum += f
        n++
        if (md > 1 && f === formOf(1, `x${i}`, md - 1)) same++
      }
    expect(Math.abs(sum / n)).toBeLessThan(0.15)
    // Week to week, form holds about a third of the time (independent draws would hold ~20%).
    expect(same / (400 * 37)).toBeGreaterThan(0.25)
  })

  it('moves technique, not pace', () => {
    const p = makePlayer(new Rng(3), 'x', 'Test Player', 9, 'ST', 14)
    const hot = inForm(p, 3)
    expect(hot.attrs.finishing).toBe(Math.min(99, p.attrs.finishing + 3))
    expect(hot.attrs.sprintSpeed).toBe(p.attrs.sprintSpeed)
    expect(inForm(p, 0)).toBe(p)
  })
})
