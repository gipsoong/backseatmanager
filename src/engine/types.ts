import type { Rng } from './rng.ts'
import type { Vec } from './geometry.ts'

export type Side = 0 | 1
export type Role = 'GK' | 'CB' | 'FB' | 'DM' | 'CM' | 'WM' | 'W' | 'ST'
export type Block = 'low' | 'mid' | 'high'
export type Formation = '4-4-2' | '4-3-3'

/** Visible attributes, 1–20. */
export interface Attributes {
  pace: number
  passing: number
  shooting: number
  tackling: number
  dribbling: number
  positioning: number
  composure: number
  keeping: number
}

/** Hidden traits, 0–1. Drive variation rather than raw ability. */
export interface Traits {
  flair: number
  temper: number
}

export interface PlayerDef {
  id: string
  name: string
  shirt: number
  role: Role
  attrs: Attributes
  traits: Traits
}

/** Shirt colours. `family` is used to spot clashes between two kits. */
export interface Kit {
  shirt: string
  number: string
  family: string
}

export interface TeamDef {
  name: string
  shortName: string
  kit: Kit
  formation: Formation
  block: Block
  /** Exactly 11, in the formation's slot order (GK first). */
  players: PlayerDef[]
}

/** A formation slot in the attacking frame at "neutral" shape. */
export interface Slot {
  role: Role
  /** 0 = defensive line, 1 = forward line. */
  depth: number
  /** Extra depth when in possession (e.g. overlapping full-backs). */
  attackDepth: number
  /** 0..68 across the pitch, in the attacking frame. */
  y: number
}

export interface PlayerState {
  idx: number
  team: Side
  def: PlayerDef
  slot: Slot
  pos: Vec
  vel: Vec
  maxSpeed: number
  onPitch: boolean
  yellowCards: number
  /** Tick until which the player can't attempt a tackle (just beaten / just tackled). */
  tackleReadyAt: number
  /** Tick until which the player can't touch the ball (just been dispossessed). */
  touchReadyAt: number
  /** Tick until which an attacker is making a run in behind. */
  runUntil: number
}

export type KickKind = 'pass' | 'shot' | 'clearance'
export type RestartType = 'kickoff' | 'throwIn' | 'goalKick' | 'corner' | 'freeKick' | 'penalty'

export interface Kick {
  kind: KickKind
  /** In the air (chipped pass, cross, clearance) rather than along the ground. */
  lofted: boolean
  byIdx: number
  team: Side
  tick: number
  from: Vec
  target: Vec
  targetIdx: number | null
  /** Teammates in an offside position at the moment of the kick. */
  offsideIdxs: number[]
  /** Throw-ins, corners and goal kicks can't produce offside. */
  offsideExempt: boolean
  fromRestart: RestartType | null
  /** For shots: who passed to the shooter, if anyone. */
  assistIdx: number | null
  /** Players who already tried and failed to touch this kick (one attempt each). */
  missedIdxs: number[]
}

export interface BallState {
  pos: Vec
  vel: Vec
  /** Height above the grass (m) and vertical speed (m/s). */
  z: number
  vz: number
  ownerIdx: number | null
  lastTouchIdx: number | null
  /** Most recent kick; cleared of meaning once someone else touches the ball. */
  kick: Kick | null
  /** Has anyone touched the ball since `kick`? */
  touchedSinceKick: boolean
  /** Who passed to the current owner, if that's how they got it (for assists). */
  receivedFromIdx: number | null
}

export interface Restart {
  type: RestartType
  team: Side
  spot: Vec
  takerIdx: number
  since: number
}

export type Phase = { kind: 'play' } | { kind: 'restart'; restart: Restart } | { kind: 'fullTime' }

export interface TeamStats {
  possessionTicks: number
  shots: number
  shotsOnTarget: number
  xg: number
  passes: number
  passesCompleted: number
  fouls: number
  corners: number
  offsides: number
  yellowCards: number
  redCards: number
}

interface EventBase {
  tick: number
  /** Display clock, e.g. "45+2'". */
  clock: string
}

export type MatchEvent = EventBase &
  (
    | { type: 'restart'; restart: RestartType; team: Side; takerIdx: number; spot: Vec; forced: boolean }
    | { type: 'pass'; byIdx: number; toIdx: number; from: Vec; target: Vec; lofted: boolean; header: boolean }
    | { type: 'clearance'; byIdx: number; from: Vec; target: Vec; header: boolean }
    | {
        type: 'shot'
        byIdx: number
        from: Vec
        target: Vec
        /** Predicted height as it reaches the goal line (over the bar if >= crossbar height). */
        height: number
        onTarget: boolean
        xg: number
        penalty: boolean
        header: boolean
      }
    | { type: 'possession'; idx: number; contact: Vec; height: number; via: 'control' | 'interception' | 'save' | 'restart' }
    | { type: 'deflection'; idx: number; contact: Vec; height: number; kind: 'block' | 'parry' | 'miscontrol' | 'header' }
    | { type: 'tackle'; byIdx: number; onIdx: number; pos: Vec; won: boolean }
    | { type: 'foul'; byIdx: number; onIdx: number; pos: Vec; award: 'freeKick' | 'penalty' }
    | { type: 'card'; idx: number; color: 'yellow' | 'red' }
    | { type: 'offside'; idx: number; kickTick: number; pos: Vec }
    | { type: 'woodwork'; byIdx: number | null; pos: Vec; height: number }
    | { type: 'out'; award: 'throwIn' | 'corner' | 'goalKick'; team: Side; pos: Vec; height: number }
    | { type: 'goal'; team: Side; scorerIdx: number; assistIdx: number | null; ownGoal: boolean; pos: Vec; height: number }
    | { type: 'halfTime' }
    | { type: 'fullTime' }
  )

export type MatchEventType = MatchEvent['type']

export interface MatchConfig {
  seed: number
  /** Minutes per half of simulated time. Tests may shorten this. */
  halfLengthMinutes?: number
}

export interface MatchState {
  teams: [TeamDef, TeamDef]
  rng: Rng
  tick: number
  /** Tick at which the current half began. */
  halfStartTick: number
  half: 1 | 2
  /** Ticks of added time for the current half. */
  addedTicks: number
  halfTicks: number
  players: PlayerState[]
  ball: BallState
  score: [number, number]
  phase: Phase
  stats: [TeamStats, TeamStats]
  events: MatchEvent[]
  /** Next tick the ball carrier makes a decision. */
  decisionAt: number
  /** Tick the current carrier got the ball. */
  possessedSince: number
  /** Where the ball carrier is currently dribbling to (null = holding). */
  dribbleTarget: Vec | null
}

/** Compact per-tick positions, for rendering, replays and the headless harness. */
export interface Frame {
  tick: number
  phase: Phase['kind']
  half: 1 | 2
  ball: { x: number; y: number; z: number; vx: number; vy: number; ownerIdx: number | null }
  players: { x: number; y: number; onPitch: boolean }[]
}
