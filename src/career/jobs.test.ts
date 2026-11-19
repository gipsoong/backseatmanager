import { describe, expect, it } from 'vitest'
import { createSeason, table } from '../season/season.ts'
import { nextSeason, startCareer, startRealCareer } from './career.ts'
import { fakePlayed } from './fake.ts'
import { elevenRanks, jobNews, takeJob } from './jobs.ts'

describe('the job market', () => {
  it('offers bigger clubs after a good season, smaller ones after the sack, and moves him', () => {
    let seen = { up: 0, sacked: 0, moves: 0 }
    for (let seed = 1; seed <= 12; seed++) {
      const s = fakePlayed(startCareer(createSeason(seed, seed % 20, new Date(Date.UTC(2026, 5, 1)))))
      const news = jobNews(s)!
      const ranks = elevenRanks(s)
      const mine = ranks[s.userTeam]
      for (const o of news.offers) {
        expect(o.club).not.toBe(s.userTeam)
        if (news.sacked) expect(o.rank).toBeGreaterThan(mine)
      }
      if (!news.sacked && news.offers.some((o) => o.rank < mine)) seen.up++
      if (news.sacked) seen.sacked++
      const o = news.offers[0]
      if (o) {
        const next = takeJob(nextSeason(s), o.club, news.sacked)
        expect(next.userTeam).toBe(o.club)
        expect(next.career!.moved).toEqual({ from: s.userTeam, sacked: news.sacked })
        expect(next.career!.history.at(-1)!.club).toBe(s.userTeam)
        expect(next.lineup).toBeNull()
        seen.moves++
      }
      // His last season's place is recorded where he was.
      expect(nextSeason(s).career!.history.at(-1)!.place).toBe(table(s).findIndex((r) => r.team === s.userTeam) + 1)
    }
    expect(seen.moves).toBeGreaterThan(0)
  })

  it('keeps a real career balanced over the summer', () => {
    const s = fakePlayed(startRealCareer(5, 'premier-league-2024'))
    expect(s.career!.balance).toBeDefined()
    expect(nextSeason(s).career!.balance).toEqual(s.career!.balance)
  })
})
