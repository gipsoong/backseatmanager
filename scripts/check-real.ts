/**
 * Checks a real league's data against what the draft knows (`node scripts/check-real.ts [id]`):
 * names spelled differently from the squads files (same surname, not the same name), feet that
 * disagree with pools.ts, birth years that disagree with cards.ts; then each club's eleven, block,
 * board aim, squad size, wage bill and cash at the start of a career.
 */
import { aimFor, elevenRating, startRealCareer } from '../src/career/career.ts'
import { REAL_LEAGUES, realLeague, squadLines } from '../src/career/real.ts'
import { LEFT_FOOTED, POOLS } from '../src/draft/pools.ts'
import { CARDS } from '../src/draft/cards.ts'
import { wageBill } from '../src/career/money.ts'
import { squadOf } from '../src/season/season.ts'

const league = realLeague(process.argv[2]) ?? REAL_LEAGUES[0]
const known = new Set(POOLS.flatMap((p) => p.players.map((x) => x[0])))
const surname = (n: string): string => n.split(' ').at(-1)!.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const bySurname = new Map<string, string[]>()
for (const n of known) bySurname.set(surname(n), [...(bySurname.get(surname(n)) ?? []), n])
let cards = 0
let pooled = 0
for (const c of league.clubs)
  for (const p of squadLines(c.players)) {
    if (known.has(p.name)) pooled++
    if (CARDS[p.name]) {
      cards++
      if (CARDS[p.name][0] !== p.born) console.log(`born: ${p.name} cards ${CARDS[p.name][0]}, here ${p.born}`)
    }
    if (!known.has(p.name) && bySurname.has(surname(p.name))) console.log(`name? ${p.name} ~ ${bySurname.get(surname(p.name))!.join('; ')}`)
    if (LEFT_FOOTED.has(p.name) && p.foot !== 'left') console.log(`foot: ${p.name} is left-footed in pools.ts`)
  }
console.log(`${league.name}: ${pooled} players in the draft's squads files, ${cards} with a card`)
const s = startRealCareer(1, league.id)
const c = s.career!
s.teams
  .map((t, i) => ({ t, i, r: elevenRating(s, i) }))
  .sort((a, b) => b.r - a.r)
  .forEach(({ t, i, r }) => {
    const ages = squadOf(t).map((p) => c.people[p.id].age)
    console.log(
      `${t.name.padEnd(26)} XI ${r.toFixed(1)} ${t.formation} ${t.block.padEnd(4)} ${aimFor(s, i).padEnd(8)} squad ${squadOf(t).length} age ${(ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1)} wages £${wageBill(s, i).toFixed(1)}m cash £${c.finance!.cash[i]}m`,
    )
  })
