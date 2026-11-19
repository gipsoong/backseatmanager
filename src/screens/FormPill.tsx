/** A player's form as a small coloured pill (draft seasons, season/form.ts): On fire, Sharp, Flat, Off it. */

const KINDS = {
  hot: { word: 'On fire', tip: 'In blazing form' },
  warm: { word: 'Sharp', tip: 'In good form' },
  cool: { word: 'Flat', tip: 'Off the pace' },
  cold: { word: 'Off it', tip: 'Badly out of form' },
} as const

export const formKind = (f: number): keyof typeof KINDS | null => (f >= 3 ? 'hot' : f >= 1 ? 'warm' : f <= -3 ? 'cold' : f <= -1 ? 'cool' : null)

function Icon({ kind }: { kind: keyof typeof KINDS }) {
  const common = { width: 10, height: 10, viewBox: '0 0 10 10', 'aria-hidden': true } as const
  switch (kind) {
    case 'hot':
      return (
        <svg {...common}>
          <path d="M5 0.6 C6.6 2.6 8.4 4 8.4 6.2 A3.4 3.4 0 0 1 1.6 6.2 C1.6 4.9 2.3 4 3.1 3.4 C3.1 4.6 3.7 5.3 4.4 5.4 C4 3.6 4.4 2 5 0.6 Z" fill="currentColor" />
        </svg>
      )
    case 'warm':
      return (
        <svg {...common}>
          <path d="M1.5 6.5 L5 3 L8.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'cool':
      return (
        <svg {...common}>
          <path d="M1.5 3.5 L5 7 L8.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'cold':
      return (
        <svg {...common}>
          <path d="M5 0.8 V9.2 M1.4 2.9 L8.6 7.1 M1.4 7.1 L8.6 2.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      )
  }
}

export function FormPill({ form, short = false }: { form: number; short?: boolean }) {
  const kind = formKind(form)
  if (!kind) return null
  const k = KINDS[kind]
  return (
    <span className={`form-pill ${kind}`} title={`${k.tip}: playing ${Math.abs(form)} ${form > 0 ? 'above' : 'below'} his usual level`}>
      <Icon kind={kind} />
      {!short && k.word}
    </span>
  )
}
