/** A player's positions: his main one, with any others small beneath it (narrow on a phone). */
import type { PlayerDef } from '../engine/index.ts'
import { positionsLabel } from '../names.ts'

export function Positions({ p }: { p: PlayerDef }) {
  const others = p.positions ?? []
  return (
    <span className="positions" title={positionsLabel(p)}>
      <span className="pos-main">{p.role}</span>
      {others.length > 0 && <span className="pos-alt">{others.join('/')}</span>}
    </span>
  )
}
