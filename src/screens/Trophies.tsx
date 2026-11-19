/**
 * Achievements and the legends album on screen (session 38, draft/achievements.ts), kept in this
 * browser across runs (per viewer, optional: without storage nothing is kept). A run is recorded
 * when its league ends, and again when its European Cup does (cup achievements and cup winners).
 */
import { useEffect, useState } from 'react'
import { ACHIEVEMENTS, addLegends, earned, runFacts, seasonLegends, whereOf, type Legend } from '../draft/achievements.ts'
import { cupLive } from '../draft/cup.ts'
import { isOver, type Season } from '../season/season.ts'

const KEY = 'matchday.draft.trophies'
const ALBUM_MAX = 400
const SEEN_MAX = 200

interface Trophies {
  /** Achievement id: the date it was first earned. */
  unlocked: Record<string, string>
  /** Where titles were won (league or theme names), once each. */
  titles: string[]
  album: Legend[]
  /** Runs (and their cups) already recorded. */
  seen: string[]
}

const EMPTY: Trophies = { unlocked: {}, titles: [], album: [], seen: [] }

export function trophies(): Trophies {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (!v || typeof v !== 'object') return EMPTY
    const t = v as Partial<Trophies>
    return {
      unlocked: t.unlocked && typeof t.unlocked === 'object' ? t.unlocked : {},
      titles: Array.isArray(t.titles) ? t.titles : [],
      album: Array.isArray(t.album) ? t.album.filter((l) => l && typeof l.name === 'string') : [],
      seen: Array.isArray(t.seen) ? t.seen : [],
    }
  } catch {
    return EMPTY
  }
}

const runKey = (s: Season): string => `${s.seed}-${s.startDate}-${s.teams[s.userTeam].name}`

/** Record a finished league (or its finished cup); the achievements it earned for the first time. */
export function recordRun(s: Season): string[] {
  if (s.mode !== 'draft' || !isOver(s)) return []
  const cupDone = !!s.cup && !cupLive(s)
  const key = `${runKey(s)}:${cupDone ? 'cup' : 'league'}`
  const t = trophies()
  if (t.seen.includes(key)) return []
  const ids = earned(s, new Set(t.titles))
  const fresh = ids.filter((id) => !t.unlocked[id])
  const date = new Date().toISOString().slice(0, 10)
  const facts = runFacts(s)
  // The cup stage adds only the cup's winners (the league's were added when it ended).
  const leagueSeen = t.seen.includes(`${runKey(s)}:league`)
  const legends = seasonLegends(s).flatMap((l) => (cupDone && leagueSeen ? (l.cups ? [{ ...l, titles: 0, awards: [] }] : []) : [l]))
  const next: Trophies = {
    unlocked: { ...t.unlocked, ...Object.fromEntries(fresh.map((id) => [id, date])) },
    titles: facts.champion && !t.titles.includes(whereOf(s)) ? [...t.titles, whereOf(s)] : t.titles,
    album: addLegends(t.album, legends).slice(0, ALBUM_MAX),
    seen: [...t.seen, key].slice(-SEEN_MAX),
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // No storage: nothing is kept.
  }
  return fresh
}

/** What this run earned, at its end: every achievement, the first-time ones marked. */
export function RunTrophies({ season }: { season: Season }) {
  const over = season.mode === 'draft' && isOver(season)
  const [fresh, setFresh] = useState<string[]>([])
  const cupDone = !!season.cup && !cupLive(season)
  useEffect(() => {
    if (over) setFresh((was) => [...new Set([...was, ...recordRun(season)])])
  }, [over, cupDone, season])
  if (!over) return null
  const ids = earned(season, new Set(trophies().titles))
  if (!ids.length) return null
  return (
    <div className="run-trophies">
      <span className="eyebrow">Achievements this run</span>
      <ul>
        {ACHIEVEMENTS.filter((a) => ids.includes(a.id)).map((a) => (
          <li key={a.id} className={`trophy on${fresh.includes(a.id) ? ' fresh' : ''}`} title={a.blurb}>
            {a.name}
            {fresh.includes(a.id) && <small>New</small>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The trophy room on the draft's start screen: every achievement, and the legends album. */
export function TrophyRoom() {
  const [t] = useState(trophies)
  const [all, setAll] = useState(false)
  const got = ACHIEVEMENTS.filter((a) => t.unlocked[a.id]).length
  const shown = all ? t.album : t.album.slice(0, 8)
  return (
    <section className="trophy-room">
      <details className="trophy-details">
        <summary>
          <span className="eyebrow">
            Achievements · {got} of {ACHIEVEMENTS.length}
          </span>
          <span className="trophy-strip" aria-hidden="true">
            {ACHIEVEMENTS.map((a) => (
              <span key={a.id} className={t.unlocked[a.id] ? 'on' : ''} />
            ))}
          </span>
        </summary>
      <ul className="trophies">
        {ACHIEVEMENTS.map((a) => (
          <li key={a.id} className={`trophy${t.unlocked[a.id] ? ' on' : ''}`} title={t.unlocked[a.id] ? `${a.blurb} · ${t.unlocked[a.id]}` : a.blurb}>
            <strong>{a.name}</strong>
            <small>{a.blurb}</small>
          </li>
        ))}
      </ul>
      </details>
      <p className="eyebrow step">Legends album</p>
      {t.album.length ? (
        <>
          <ul className="album">
            {shown.map((l) => (
              <li key={l.name} className="legend">
                <span className="legend-name">
                  {l.name}
                  <small>
                    {l.role} · {l.overall}
                  </small>
                </span>
                <span className="legend-honours">
                  {[l.titles && `${l.titles} ${l.titles === 1 ? 'title' : 'titles'}`, l.cups && `${l.cups} European ${l.cups === 1 ? 'Cup' : 'Cups'}`, ...l.awards.map((a) => a.split(' · ')[0])].filter(Boolean).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
          {t.album.length > 8 && (
            <button type="button" className="btn ghost slim" onClick={() => setAll(!all)}>
              {all ? 'Show fewer' : `Show all ${t.album.length}`}
            </button>
          )}
        </>
      ) : (
        <p className="meta">Win a title, a cup or a season award and the players who did it go in here.</p>
      )}
    </section>
  )
}
