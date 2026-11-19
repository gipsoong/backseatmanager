/**
 * Backseat Manager's mark: a mown pitch with a chalked instruction on it, the run you'd shout
 * from the stands. `draw` animates the chalk line once (flattened by reduced motion).
 */
export function LogoMark({ size = 40, draw = false }: { size?: number; draw?: boolean }) {
  return (
    <svg className={`logo-mark${draw ? ' draw' : ''}`} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <clipPath id="bm-clip">
          <rect width="64" height="64" rx="15" />
        </clipPath>
      </defs>
      <g clipPath="url(#bm-clip)">
        <rect width="64" height="64" fill="var(--brand-pitch, #17482f)" />
        <rect x="16" width="16" height="64" fill="var(--brand-pitch-2, #1d5639)" />
        <rect x="48" width="16" height="64" fill="var(--brand-pitch-2, #1d5639)" />
      </g>
      <rect x="1" y="1" width="62" height="62" rx="14" fill="none" stroke="#f3f1e7" strokeOpacity="0.28" strokeWidth="2" />
      <path className="chalk-x" d="M12 44 l8 8 M20 44 l-8 8" stroke="#f3f1e7" strokeWidth="3.4" strokeLinecap="round" />
      <path className="chalk-run" d="M19 39 C 22 20, 36 14, 48 18" fill="none" stroke="#f3f1e7" strokeWidth="3.4" strokeLinecap="round" pathLength="1" />
      <path className="chalk-head" d="M41 12.5 L49.5 18 L43 25" fill="none" stroke="#f3f1e7" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle className="chalk-ball" cx="50" cy="45" r="5" fill="var(--brand-amber, #e9a93a)" />
    </svg>
  )
}

/** The mark and the name, for the start screen (`big`) or a header. */
export function Logo({ big = false }: { big?: boolean }) {
  return (
    <span className={`logo${big ? ' big' : ''}`}>
      <LogoMark size={big ? 52 : 26} draw={big} />
      <span className="logo-word">
        <span className="logo-top">Backseat</span>
        <span className="logo-bottom">Manager</span>
      </span>
    </span>
  )
}
