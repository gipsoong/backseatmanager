import { describe, expect, it } from 'vitest'
import { POOLS } from './pools.ts'
import { clubsOf, poolPlayer } from './draft.ts'
import { linkBonus, linkCounts, linkedTeam, linksOf, sharedClub } from './links.ts'

describe('draft links', () => {
  it('link two men from one club in different seasons, but not a man with himself', () => {
    const club = POOLS[0].club
    const other = POOLS.findIndex((p, i) => i > 0 && p.club === club)
    expect(other).toBeGreaterThan(0)
    const a = poolPlayer(0, 0)
    const b = poolPlayer(other, POOLS[other].players.findIndex(([n]) => n !== a.name))
    expect(clubsOf(a.name).includes(club)).toBe(true)
    expect(sharedClub(a, b)).not.toBeNull()
    expect(sharedClub(a, a)).toBeNull()
    expect(linksOf([a, null, b])).toEqual([{ a: 0, b: 2, club: sharedClub(a, b) }])
    expect(linkCounts([a, null, b])).toEqual([1, 0, 1])
  })

  it('give +1 for one or two links and +2 for three or more, to the eleven only', () => {
    expect([0, 1, 2, 3, 5].map(linkBonus)).toEqual([0, 1, 1, 2, 2])
    const xi = POOLS[0].players.slice(0, 11).map((_, i) => poolPlayer(0, i))
    const t = linkedTeam({ name: 'X', shortName: 'X', kit: { shirt: '#fff', number: '#000', family: 'white' }, formation: '4-3-3', block: 'mid', players: xi, bench: [] })
    const outfield = xi.findIndex((p) => p.role !== 'GK')
    expect(t.players[outfield].attrs.shortPassing).toBe(Math.min(99, xi[outfield].attrs.shortPassing + 2))
  })
})
