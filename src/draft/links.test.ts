import { describe, expect, it } from 'vitest'
import { POOLS } from './pools.ts'
import { clubsOf, poolPlayer } from './draft.ts'
import { linkBonus, linkCounts, linkedTeam, linksOf, sharedClub } from './links.ts'

describe('draft links', () => {
  it('link two men of one club-season, but not a man with himself', () => {
    const club = POOLS[0].club
    const other = 0
    const a = poolPlayer(0, 0)
    const b = poolPlayer(other, POOLS[other].players.findIndex(([n]) => n !== a.name))
    expect(clubsOf(a.name).some((c) => c.startsWith(`${club}@`))).toBe(true)
    expect(sharedClub(a, b)).not.toBeNull()
    expect(sharedClub(a, a)).toBeNull()
    expect(linksOf([a, null, b])).toEqual([{ a: 0, b: 2, club: sharedClub(a, b) }])
    expect(linkCounts([a, null, b])).toEqual([1, 0, 1])
  })

  it("don't link men who were at a club years apart", () => {
    const at = (name: string, clubs: string[]) => ({ ...poolPlayer(0, 0), name, clubs })
    expect(sharedClub(at('A', ['Atlético Madrid@2008-2010']), at('B', ['Atlético Madrid@2019-2023']))).toBeNull()
    expect(sharedClub(at('A', ['Liverpool@2007-2014']), at('B', ['Liverpool@2012-2014']))).toBe('Liverpool')
    // An older save's clubs have no seasons: any season links.
    expect(sharedClub(at('A', ['Liverpool']), at('B', ['Liverpool@2012-2014']))).toBe('Liverpool')
    expect(clubsOf('David de Gea').some((c) => c.startsWith('Atlético Madrid@'))).toBe(true)
    expect(clubsOf('Luis Suárez').some((c) => c.startsWith('Atlético Madrid@'))).toBe(true)
    expect(sharedClub(at('David de Gea', clubsOf('David de Gea')), at('Luis Suárez', clubsOf('Luis Suárez')))).toBeNull()
  })

  it('give +1 for one or two links and +2 for three or more, to the eleven only', () => {
    expect([0, 1, 2, 3, 5].map(linkBonus)).toEqual([0, 1, 1, 2, 2])
    const xi = POOLS[0].players.slice(0, 11).map((_, i) => poolPlayer(0, i))
    const t = linkedTeam({ name: 'X', shortName: 'X', kit: { shirt: '#fff', number: '#000', family: 'white' }, formation: '4-3-3', block: 'mid', players: xi, bench: [] })
    const outfield = xi.findIndex((p) => p.role !== 'GK')
    expect(t.players[outfield].attrs.shortPassing).toBe(Math.min(99, xi[outfield].attrs.shortPassing + 2))
  })
})
