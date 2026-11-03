/** A greedy draft for headless checks (diag-draft, sim-season): classic or budget. */
import { FORMATIONS } from '../src/engine/index.ts'
import { type Draft, canAfford, fitted, isComplete, offer, place, priceIn, spendable } from '../src/draft/draft.ts'

/**
 * Each round, the best fit for an open starting place (his own position or a secondary one), else
 * a sub: the best (classic) or the cheapest (budget). A budget draft shares what it has among the
 * open starting places, with some room for a star.
 */
export function greedy(d: Draft): Draft {
  const slots = FORMATIONS[d.formation]
  while (!isComplete(d)) {
    const { players } = offer(d)
    const open = d.xi.flatMap((q, i) => (q ? [] : [i]))
    const benchLeft = d.bench.filter((q) => !q).length
    const perStarter = d.money === undefined ? Infinity : (d.money - benchLeft) / Math.max(1, open.length)
    const cap = Math.min(spendable(d), open.length > 1 ? perStarter * 1.6 : perStarter)
    let best: { p: (typeof players)[number]; slot: number; v: number } | null = null
    for (const p of players) {
      if (d.money !== undefined && priceIn(d, p, players) > cap) continue
      for (const slot of open) {
        const v = fitted(p, slot, d.formation)
        if (slots[slot].role === p.role || (p.positions ?? []).includes(slots[slot].role)) if (!best || v > best.v) best = { p, slot, v }
      }
    }
    if (best) {
      d = place(d, best.p, { xi: best.slot })
      continue
    }
    if (d.bench.some((q) => !q)) {
      const pool = players.filter((p) => canAfford(d, p, players))
      const pick =
        d.money === undefined
          ? pool.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0]
          : pool.sort((a, b) => priceIn(d, a, players) - priceIn(d, b, players) || (b.overall ?? 0) - (a.overall ?? 0))[0]
      d = place(d, pick, { bench: d.bench.indexOf(null) })
      continue
    }
    // Out of position: anyone affordable in the best open place.
    let alt: { p: (typeof players)[number]; slot: number; v: number } | null = null
    for (const p of players)
      if (canAfford(d, p, players))
        for (const slot of open) {
          const v = fitted(p, slot, d.formation)
          if (!alt || v > alt.v) alt = { p, slot, v }
        }
    d = place(d, alt!.p, { xi: alt!.slot })
  }
  return d
}
