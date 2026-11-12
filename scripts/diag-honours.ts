/** The season's honours for a saved sim-season file: `node scripts/diag-honours.ts <season.json>`. */
import { readFileSync } from 'node:fs'
import { honours } from '../src/season/review.ts'

const s = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const h = honours(s)
for (const a of h.awards) console.log(`${a.title}: ${a.who.player.name} (${s.teams[a.who.club].name}) · ${a.line}`)
for (const m of h.months) console.log(`Month ${m.month}: ${m.award.player.name} ${m.award.rating.toFixed(2)}`)
for (const f of [...h.displays, ...h.hatTricks]) console.log(`${f.player.name}: ${f.line}`)
if (h.overachievers) console.log('overachievers', s.teams[h.overachievers.club].name, h.overachievers)
