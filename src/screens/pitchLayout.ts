/** Placing a formation on the small pitch used by the draft and the squad screens. */
import type { CSSProperties } from 'react'
import type { Slot } from '../engine/index.ts'

/** A place's usual name: which side a full-back or wide man plays on, facing up the pitch. */
export function slotLabel(slot: Slot): string {
  const side = slot.y > 40 ? 'R' : slot.y < 28 ? 'L' : ''
  if (slot.role === 'FB') return slot.attackDepth > 0.5 ? `${side}WB` : `${side}B`
  if (slot.role === 'WM') return `${side}M`
  if (slot.role === 'W') return `${side}W`
  if (slot.role === 'CM' && slot.depth >= 0.65) return 'AM'
  return slot.role
}

/** Where a place sits on the small pitch: attack at the top, the side's right on the right. */
export function slotStyle(slot: Slot): CSSProperties {
  const top = slot.role === 'GK' ? 90 : 72 - slot.depth * 57
  return { top: `${top}%`, left: `${(slot.y / 68) * 100}%` }
}
