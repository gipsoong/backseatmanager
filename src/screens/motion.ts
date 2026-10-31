/**
 * Small motion helpers for the menus. The timing lives in CSS (motion tokens on :root in
 * index.css); these only feed it. Everything respects prefers-reduced-motion.
 */
import type { CSSProperties } from 'react'

/** Style for an item that animates in after the ones before it (CSS reads `--i`). */
export const stagger = (i: number, max = 20): CSSProperties => ({ '--i': Math.min(i, max) }) as CSSProperties

export const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
