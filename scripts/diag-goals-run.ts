/**
 * How often a draft run's goals are met: every club of saved sim-season files as the manager's,
 * each bonus kind tried. `node scripts/diag-goals-run.ts <season.json>...`
 */
import { readFileSync } from 'node:fs'
import { BONUS_KINDS, goalState, runGoal } from '../src/draft/goals.ts'
import { table, tipsOf, type Season } from '../src/season/season.ts'

const files = process.argv.slice(2)
const hit: Record<string, [number, number]> = {}
const add = (k: string, ok: boolean): void => {
  hit[k] ??= [0, 0]
  hit[k][0] += ok ? 1 : 0
  hit[k][1]++
}
for (const f of files) {
  const raw = JSON.parse(readFileSync(f, 'utf8'))
  const s0: Season = raw.season ?? raw
  const tips = s0.tips ?? tipsOf(s0)
  for (let t = 0; t < s0.teams.length; t++) {
    const band = tips[t] <= 4 ? 'top4' : tips[t] <= 10 ? 'mid' : 'low'
    for (const kind of BONUS_KINDS) {
      // Same season, this club as the manager's, the bonus forced to this kind.
      const s: Season = { ...s0, userTeam: t, tips }
      const g = runGoal(s)
      const st = goalState(s)
      if (g.bonus.kind !== kind) {
        // Recompute by trying seeds until the kind comes up (the bonus is drawn from the seed).
        let seed = s0.seed
        let ss = s
        for (let i = 0; i < 200 && runGoal(ss).bonus.kind !== kind; i++) ss = { ...s, seed: ++seed }
        const sg = goalState(ss)
        add(`${kind} ${band}`, sg.met)
      } else add(`${kind} ${band}`, st.met)
    }
    const place = table(s0).findIndex((r) => r.team === t) + 1
    add(`aim ${band}`, place <= runGoal({ ...s0, userTeam: t, tips }).aim)
  }
}
for (const k of Object.keys(hit).sort()) console.log(k.padEnd(18), `${hit[k][0]}/${hit[k][1]}`, `${Math.round((100 * hit[k][0]) / hit[k][1])}%`)
