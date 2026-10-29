/**
 * Every player with a card of his own (draft/cards.ts): the card the table gives him in each of his
 * seasons next to the card his sub-attributes show, flagging any group more than 2 off, and table
 * entries that don't match a season in the squads. `node scripts/check-cards.ts [--all]` (--all
 * prints every season, not only the table's own and the misses).
 */
import { POOLS } from '../src/draft/pools.ts'
import { poolPlayer } from '../src/draft/draft.ts'
import { CARDS, cardOf } from '../src/draft/cards.ts'
import { groupRatings } from '../src/engine/index.ts'

const all = process.argv.includes('--all')
let rows = 0
let off = 0
let worst = 0
const seen = new Set<string>()
for (const [name, [, year, overall]] of Object.entries(CARDS)) {
  let found = false
  POOLS.forEach((pool, pi) =>
    pool.players.forEach(([n, , o], i) => {
      if (n !== name) return
      found = true
      const p = poolPlayer(pi, i)
      const start = Number(pool.season.slice(0, 4))
      const key = `${name} ${start} ${o}`
      if (seen.has(key)) return
      seen.add(key)
      const want = cardOf(name, start, o, p.role === 'GK')!
      const got = groupRatings(p.attrs, p.role)
      const diffs = got.map((g, k) => g.value - want[k])
      const miss = diffs.some((d) => Math.abs(d) > 2)
      worst = Math.max(worst, ...diffs.map(Math.abs))
      rows++
      if (miss) off++
      if (all || miss || (start === year && o === overall)) {
        const cells = got.map((g, k) => `${g.key} ${String(want[k]).padStart(2)}${diffs[k] ? `→${g.value}` : '   '}`.padEnd(10))
        console.log(`${miss ? '!' : ' '} ${`${name} ${pool.season} ${o}`.padEnd(38)} ${p.archetype?.padEnd(17)} ${cells.join(' ')}`)
      }
    }),
  )
  if (!found) console.log(`? ${name}: not in the squads`)
  else if (!POOLS.some((pool) => Number(pool.season.slice(0, 4)) === year && pool.players.some(([n, , o]) => n === name && o === overall)) && !seen.has(`${name} ${year} ${overall}`))
    console.log(`? ${name}: no ${year} season at ${overall} in the squads`)
}
console.log(`\n${Object.keys(CARDS).length} players, ${rows} player-seasons; ${off} with a group more than 2 off; worst ${worst}`)
