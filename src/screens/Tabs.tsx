/** The tab strip used by the season and cup screens: scrolls sideways on a phone, keeps the chosen tab in view. */
import { useEffect, useRef } from 'react'

export type TabDef<T extends string> = { id: T; label: string; badge?: number }

export function TabBar<T extends string>({ tabs, value, onChange, label }: { tabs: TabDef<T>[]; value: T; onChange: (t: T) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const bar = ref.current
    const el = bar?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!el || !bar) return
    // Scroll the strip itself (not the page) so the chosen tab is fully in view.
    const left = el.offsetLeft
    if (left < bar.scrollLeft || left + el.offsetWidth > bar.scrollLeft + bar.clientWidth) bar.scrollTo({ left: left - 24, behavior: 'smooth' })
  }, [value])
  return (
    <div className="tabs season-tabs" role="tablist" aria-label={label} ref={ref}>
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={t.id === value} onClick={() => onChange(t.id)}>
          {t.label}
          {t.badge ? (
            <span className="tab-badge" aria-label={`${t.badge} new`}>
              {t.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  )
}
