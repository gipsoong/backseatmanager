/**
 * Seeded PRNG (mulberry32). The whole state is one uint32, so a match can be
 * snapshotted and resumed deterministically.
 */
export class Rng {
  state: number

  constructor(seed: number) {
    this.state = seed >>> 0
  }

  /** Uniform float in [0, 1). */
  next(): number {
    let t = (this.state = (this.state + 0x6d2b79f5) >>> 0)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  range(lo: number, hi: number): number {
    return lo + (hi - lo) * this.next()
  }

  int(lo: number, hiInclusive: number): number {
    return lo + Math.floor(this.next() * (hiInclusive - lo + 1))
  }

  chance(p: number): boolean {
    return this.next() < p
  }

  /** Shuffles `items` in place (Fisher–Yates) and returns it. */
  shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = this.int(0, i)
      ;[items[i], items[j]] = [items[j], items[i]]
    }
    return items
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)]
  }

  /** Approximately normal, mean 0, sd 1 (sum of four uniforms has variance 1/3, hence the sqrt(3)). */
  gauss(): number {
    return (this.next() + this.next() + this.next() + this.next() - 2) * Math.sqrt(3)
  }
}
