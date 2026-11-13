/**
 * Checks a league's draft squads: `node scripts/check-squads.ts src/draft/squads-laliga.ts`.
 * Positions, overalls, squad sizes, distinct clubs, and that every name in the file's
 * LEFT_FOOTED / WEAK_FOOT / ARCHETYPE tables is in its squads with a fitting archetype.
 */
import { ARCHETYPES, type Role } from '../src/engine/index.ts'

const file = process.argv[2]
const mod = await import(new URL(`../${file}`, import.meta.url).href)
const pools = mod.POOLS as { league?: string; club: string; season: string; formation: string; players: [string, string, number, string?][] }[]
const roles = new Set(['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'W', 'ST'])
const problems: string[] = []
const names = new Map<string, Role>()
for (const p of pools) {
  const tag = `${p.club} ${p.season}`
  if (!p.league) problems.push(`${tag}: no league`)
  if (!/^20\d\d\/\d\d$/.test(p.season)) problems.push(`${tag}: season format`)
  if (p.players.length < 19 || p.players.length > 26) problems.push(`${tag}: ${p.players.length} players`)
  const gks = p.players.filter(([, pos]) => pos.startsWith('GK')).length
  if (gks < 2) problems.push(`${tag}: ${gks} keepers`)
  const seen = new Set<string>()
  for (const [name, pos, ovr] of p.players) {
    if (seen.has(name)) problems.push(`${tag}: ${name} twice`)
    seen.add(name)
    const ps = pos.split('/')
    if (!ps.every((r) => roles.has(r))) problems.push(`${tag}: ${name} position ${pos}`)
    if (!(ovr >= 55 && ovr <= 95)) problems.push(`${tag}: ${name} overall ${ovr}`)
    if (!names.has(name)) names.set(name, ps[0] as Role)
  }
  const outfield = p.players.filter(([, pos]) => !pos.startsWith('GK'))
  for (const r of ['CB', 'FB', 'ST']) if (outfield.filter(([, pos]) => pos.split('/').includes(r)).length < 2) problems.push(`${tag}: few ${r}`)
}
const clubs = new Set(pools.map((p) => p.club))
if (clubs.size < 20) problems.push(`only ${clubs.size} clubs`)
for (const n of mod.LEFT_FOOTED ?? []) if (!names.has(n)) problems.push(`LEFT_FOOTED ${n} not in squads`)
for (const n of Object.keys(mod.WEAK_FOOT ?? {})) if (!names.has(n)) problems.push(`WEAK_FOOT ${n} not in squads`)
for (const [n, a] of Object.entries(mod.ARCHETYPE ?? {}) as [string, string][]) {
  const role = names.get(n)
  if (!role) problems.push(`ARCHETYPE ${n} not in squads`)
  else if (!(ARCHETYPES[role] as string[]).includes(a)) problems.push(`ARCHETYPE ${n}: ${a} doesn't fit ${role}`)
}
const ovr = pools.flatMap((p) => p.players.map((x) => x[2]))
console.log(`${pools.length} club-seasons, ${clubs.size} clubs, ${names.size} players, overall mean ${(ovr.reduce((a, b) => a + b, 0) / ovr.length).toFixed(1)}`)
console.log(problems.length ? problems.join('\n') : 'no problems')
