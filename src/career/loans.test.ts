import { describe, expect, it } from 'vitest'
import { createSeason, squadOf } from '../season/season.ts'
import { nextSeason, startCareer } from './career.ts'
import { fakePlayed } from './fake.ts'
import { inLastYear } from './contracts.ts'
import { LOAN_MAX_AGE, loanOut, loanProblem } from './loans.ts'

describe('loans', () => {
  const s = startCareer(createSeason(11, 6, new Date(Date.UTC(2026, 5, 1))))
  const young = squadOf(s.teams[6]).find((p) => p.role !== 'GK' && s.career!.people[p.id].age <= LOAN_MAX_AGE && !inLastYear(s, p.id))!
  const ending = squadOf(s.teams[6]).find((p) => s.career!.people[p.id].age <= LOAN_MAX_AGE && inLastYear(s, p.id))
  const old = squadOf(s.teams[6]).find((p) => s.career!.people[p.id].age > LOAN_MAX_AGE)!

  it('send a young player out for the season, off the squad, the eleven picked again', () => {
    expect(loanProblem(s, old.id)).toMatch(/or under/)
    if (ending) expect(loanProblem(s, ending.id)).toMatch(/last year/)
    expect(loanProblem(s, young.id)).toBeNull()
    const out = loanOut(s, young.id)
    const squad = squadOf(out.teams[6])
    expect(squad.some((p) => p.id === young.id)).toBe(false)
    expect(squad.length).toBe(squadOf(s.teams[6]).length - 1)
    expect(out.teams[6].players.length).toBe(11)
    expect(out.career!.loans!.map((p) => p.id)).toEqual([young.id])
    // Not while the window is shut.
    expect(loanProblem({ ...out, matchday: 10 }, squad.find((p) => out.career!.people[p.id].age <= LOAN_MAX_AGE)?.id ?? young.id)).not.toBeNull()
  })

  it('bring him back in the summer with his contract, a free shirt number, and the season counted', () => {
    const out = loanOut(s, young.id)
    const next = nextSeason(fakePlayed(out))
    const squad = squadOf(next.teams[6])
    const back = squad.find((p) => p.id === young.id)
    expect(back).toBeDefined()
    expect(new Set(squad.map((p) => p.shirt)).size).toBe(squad.length)
    expect(next.career!.summer!.back).toEqual([young.id])
    expect(next.career!.loans).toBeUndefined()
    expect(next.career!.people[young.id].contract).toBeDefined()
  })
})
