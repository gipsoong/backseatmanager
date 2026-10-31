/**
 * The manager's changes while watching: substitutions (made at the next stoppage), the shape and
 * the block (at once). Everything is read from the match as it stands at the playhead; giving an
 * order plays the match on afresh from there (`Timeline.order`).
 */
import { useMemo, useState } from 'react'
import { type Block, FORMATIONS, type Formation, MAX_SUBS, type Order, type PlayerState, type Side, orderProblem } from '../engine/index.ts'
import { surname } from './commentary.ts'
import type { Timeline } from './timeline.ts'

const BLOCKS: [Block, string][] = [
  ['low', 'Low'],
  ['mid', 'Mid'],
  ['high', 'High'],
]

export function ChangePanel({ timeline, tick, side, onOrder, onClose }: { timeline: Timeline; tick: number; side: Side; onOrder: () => void; onClose: () => void }) {
  const [version, setVersion] = useState(timeline.version)
  const at = useMemo(() => timeline.stateAt(tick), [timeline, tick, version])
  const [off, setOff] = useState<number | null>(null)
  const [on, setOn] = useState<number | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [took, setTook] = useState<string | null>(null)

  const team = at.teams[side]
  const pending = at.pendingSubs[side]
  const pendingOff = new Set(pending.map((p) => p.offIdx))
  const pendingOn = new Set(pending.map((p) => p.onIdx))
  const field = at.players.filter((p) => p.team === side && p.onPitch).sort((a, b) => slotOrder(a) - slotOrder(b))
  const bench = at.players.filter(
    (p) => p.team === side && !p.onPitch && team.bench.includes(p.def) && !at.subbedOn[side].includes(p.idx) && !at.subbedOff[side].includes(p.idx),
  )
  const subsLeft = MAX_SUBS - at.stats[side].subs - pending.length
  const stopsLeft = 3 - at.subWindows[side]
  const subOrder: Order | null = off !== null && on !== null ? { kind: 'sub', team: side, offIdx: off, onIdx: on } : null
  const subProblem = subOrder ? orderProblem(at, subOrder) : null
  const closed = orderProblem(at, { kind: 'block', team: side, block: team.block })

  const give = (order: Order): void => {
    const why = timeline.order(tick, order)
    setProblem(why)
    if (why) return
    setTook(`Played on from ${timeline.clockAt(tick)} in ${Math.round(timeline.lastOrderMs)} ms`)
    setVersion(timeline.version)
    setOff(null)
    setOn(null)
    onOrder()
  }
  const name = (idx: number): string => surname(at.players[idx].def.name)

  return (
    <section className="changes" aria-label={`Changes for ${team.name}`}>
      <header className="changes-head">
        <h2>Changes · {team.shortName}</h2>
        <button type="button" className="btn ghost slim" onClick={onClose}>
          Done
        </button>
      </header>
      {closed ? (
        <p className="changes-note">{closed}.</p>
      ) : (
        <>
          <div className="changes-row">
            <span className="changes-label" id="shape-label">
              Shape
            </span>
            <div className="segmented wrap" role="group" aria-labelledby="shape-label">
              {(Object.keys(FORMATIONS) as Formation[]).map((f) => (
                <button type="button" key={f} aria-pressed={team.formation === f} onClick={() => team.formation !== f && give({ kind: 'formation', team: side, formation: f })}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="changes-row">
            <span className="changes-label" id="block-label">
              Block
            </span>
            <div className="segmented" role="group" aria-labelledby="block-label">
              {BLOCKS.map(([b, label]) => (
                <button type="button" key={b} aria-pressed={team.block === b} onClick={() => team.block !== b && give({ kind: 'block', team: side, block: b })}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="changes-subs">
            <p className="changes-note">
              {subsLeft > 0 && stopsLeft > 0
                ? `${subsLeft} substitution${subsLeft === 1 ? '' : 's'} left, in ${stopsLeft} stoppage${stopsLeft === 1 ? '' : 's'}. They're made when play next stops.`
                : 'No substitutions left.'}{' '}
              {at.managed[side] ? 'The staff leave the changes to you.' : 'Until you make one, the staff replace tired or injured players.'}
            </p>
            {pending.length > 0 && (
              <ul className="pending">
                {pending.map((p) => (
                  <li key={p.offIdx}>
                    Waiting for a stoppage: {name(p.onIdx)} on for {name(p.offIdx)}
                  </li>
                ))}
              </ul>
            )}
            <div className="sub-lists">
              <fieldset>
                <legend>Off</legend>
                {field.map((p) => (
                  <PlayerPick key={p.idx} p={p} chosen={off === p.idx} disabled={pendingOff.has(p.idx)} onPick={() => setOff(off === p.idx ? null : p.idx)} />
                ))}
              </fieldset>
              <fieldset>
                <legend>On</legend>
                {bench.length === 0 && <p className="changes-note">Nobody left on the bench.</p>}
                {bench.map((p) => (
                  <PlayerPick key={p.idx} p={p} bench chosen={on === p.idx} disabled={pendingOn.has(p.idx)} onPick={() => setOn(on === p.idx ? null : p.idx)} />
                ))}
              </fieldset>
            </div>
            <div className="changes-go">
              <button type="button" className="btn" disabled={!subOrder || subProblem !== null} onClick={() => subOrder && give(subOrder)}>
                {subOrder ? `${name(subOrder.onIdx)} on for ${name(subOrder.offIdx)}` : 'Pick one off, one on'}
              </button>
              {subProblem && <span className="changes-note">{subProblem}</span>}
            </div>
          </div>
        </>
      )}
      {problem && (
        <p className="changes-note" role="alert">
          {problem}
        </p>
      )}
      {took && (
        <p className="changes-note took" role="status">
          {took}
        </p>
      )}
    </section>
  )
}

const ORDER = ['GK', 'FB', 'CB', 'DM', 'CM', 'WM', 'W', 'ST']
const slotOrder = (p: PlayerState): number => ORDER.indexOf(p.slot.role) * 100 + p.slot.y

function PlayerPick({ p, bench, chosen, disabled, onPick }: { p: PlayerState; bench?: boolean; chosen: boolean; disabled: boolean; onPick: () => void }) {
  const role = bench ? p.def.role : p.slot.role
  return (
    <button type="button" className="pick" aria-pressed={chosen} disabled={disabled} onClick={onPick}>
      <span className="pick-role">{role}</span>
      <span className="pick-name">{surname(p.def.name)}</span>
      {p.injured ? <span className="pick-hurt">Injured</span> : <span className="pick-energy" style={{ ['--energy' as string]: `${Math.round(p.energy * 100)}%` }} aria-label={`Fitness ${Math.round(p.energy * 100)}%`} />}
    </button>
  )
}
