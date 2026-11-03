/**
 * A made-up career's summers, hashed (`node scripts/fingerprint-career.ts`): two seasons "played"
 * without the engine (career/fake.ts) and the summers after them, for a few seeds. Changes to real
 * careers must leave every hash as it was.
 */
import { createHash } from 'node:crypto'
import { createSeason } from '../src/season/season.ts'
import { nextSeason, startCareer } from '../src/career/career.ts'
import { marketDay } from '../src/career/market.ts'
import { fakePlayed } from '../src/career/fake.ts'

const all = createHash('sha256')
for (const seed of [1, 2, 3]) {
  let s = marketDay(startCareer(createSeason(seed, 0, new Date(Date.UTC(2026, 5, 1)))))
  for (let n = 0; n < 2; n++) s = nextSeason(fakePlayed(s))
  const h = createHash('sha256').update(JSON.stringify(s)).digest('hex').slice(0, 12)
  all.update(h)
  console.log(`seed ${seed}  ${h}`)
}
console.log(`all ${all.digest('hex').slice(0, 12)}`)
