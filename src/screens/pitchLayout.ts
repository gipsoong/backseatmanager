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
export function slotStyle(slot: Slot, labelled = true): CSSProperties {
  const top = slot.role === 'GK' ? 90 : 72 - slot.depth * 57
  const left = `${(slot.y / 68) * 100}%`
  // A labelled slot is kept far enough in that a wide man's label (up to ~92px across) stays on the
  // pitch; a bare dot (the shape picker's small pitches) goes where it is.
  return { top: `${top}%`, left: labelled ? `clamp(46px, ${left}, calc(100% - 46px))` : left }
}
