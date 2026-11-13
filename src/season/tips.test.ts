import { describe, expect, it } from 'vitest'
import { createSeason, tipsOf } from './season.ts'

describe("the pundits' tips", () => {
  it('rank every club once, the strongest eleven first', () => {
    const s = createSeason(7, 3, new Date(Date.UTC(2026, 5, 1)))
    const tips = tipsOf(s)
    expect([...tips].sort((a, b) => a - b)).toEqual(s.teams.map((_, i) => i + 1))
  })
})
