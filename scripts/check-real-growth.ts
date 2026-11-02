/**
 * How a real league's stars and prospects move over a few summers without the engine
 * (`node scripts/check-real-growth.ts [seed] [summers] [names…]`): each named player's overall and
 * potential a season, and the league's level.
 */
import { leagueLevel, nextSeason, startRealCareer } from '../src/career/career.ts'
import { REAL_LEAGUES } from '../src/career/real.ts'
import { fakePlayed } from '../src/career/fake.ts'
import { playerRating, squadOf } from '../src/season/season.ts'

const [seedArg, summersArg, ...named] = process.argv.slice(2)
const names = named.length ? named : ['Erling Haaland', 'Cole Palmer', 'Bukayo Saka', 'Ethan Nwaneri', 'Kobbie Mainoo', 'Mohamed Salah', 'Virgil van Dijk']
let s = startRealCareer(Number(seedArg ?? 1), REAL_LEAGUES[0].id)
for (let n = 0; n <= Number(summersArg ?? 4); n++) {
  if (n) s = nextSeason(fakePlayed(s))
  const all = s.teams.flatMap(squadOf)
  const line = names.map((name) => {
    const p = all.find((q) => q.name === name)
    const who = p && s.career!.people[p.id]
    return p && who ? `${name.split(' ').at(-1)} ${playerRating(p)}/${who.potential} (${who.age})` : `${name.split(' ').at(-1)} gone`
  })
  console.log(`${s.startDate.slice(0, 4)} level ${leagueLevel(s).toFixed(2)} | ${line.join(' | ')}`)
}
