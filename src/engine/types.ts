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
  /** How long he lasts: the lower it is, the sooner he tires over a match. */
  stamina: number
}

/** Hidden traits, 0–1. Drive how a player goes about things rather than how good he is. */
export interface Traits {
  /** Tricks and risks: take-ons, dribble moves, shooting on sight, one-twos, celebrations. */
  flair: number
  /** Fouls and cards, and the cynical pull-back when he's been beaten. */
  temper: number
  /** How readily he goes into a challenge, goes to ground, and how tight he presses. */
  aggression: number
  /** How hard he runs without the ball: pressing, tracking back, runs in behind. */
  workRate: number
  /** Looks forward first (through balls, balls in behind) rather than keeping it simple. */
  directness: number
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
  /** Substitutes (up to 7), in no particular order. */
  bench: PlayerDef[]
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
  /** Where a run is going, if it's to a fixed spot (a one-two); null means in behind the line. */
  runTo: Vec | null
  /** Top speed when fresh; `maxSpeed` falls below it as he tires. */
  baseSpeed: number
  /** How much he has left, 0-1: drains as he runs, faster for low stamina. */
  energy: number
  /** Hurt: comes off at the next stoppage if there's a substitution left. */
  injured: boolean
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
  /** Released by a keeper from his hands: the laws don't let an opponent stop that at source. */
  fromHands: boolean
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

export type Celebration = 'cornerFlag' | 'kneeSlide' | 'fistPump'

export interface Restart {
  type: RestartType
  team: Side
  spot: Vec
  takerIdx: number
  since: number
  /** After a goal: the scorer heads for `spot` and his teammates join him before kick-off. */
  celebration?: { scorerIdx: number; style: Celebration; spot: Vec }
  /** Substitutions for this stoppage have been considered. */
  subsDone?: boolean
}

/** Slide if the tackler went in from beyond standing reach of the ball carrier. */
export type TackleStyle = 'slide' | 'standing'

/** How a dribbler got past a tackle: from where the tackler came and the dribbler's traits. */
export type DribbleMove = 'stepOver' | 'dragBack' | 'burst' | 'feint'

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
  subs: number
}

interface EventBase {
  tick: number
  /** Display clock, e.g. "45+2'". */
  clock: string
}

export type MatchEvent = EventBase &
  (
    | { type: 'restart'; restart: RestartType; team: Side; takerIdx: number; spot: Vec; forced: boolean }
    | { type: 'pass'; byIdx: number; toIdx: number; from: Vec; target: Vec; lofted: boolean; header: boolean; through: boolean }
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
        /** Curled and placed rather than driven. */
        finesse: boolean
      }
    | {
        type: 'possession'
        idx: number
        contact: Vec
        height: number
        via: 'control' | 'interception' | 'save' | 'restart'
        /** Saves only: the keeper had to dive, the ball was beyond his body. */
        dive?: boolean
      }
    | {
        type: 'deflection'
        idx: number
        contact: Vec
        height: number
        kind: 'block' | 'parry' | 'miscontrol' | 'header'
        dive?: boolean
      }
    | {
        type: 'tackle'
        byIdx: number
        onIdx: number
        pos: Vec
        won: boolean
        style: TackleStyle
        /** When the dribbler got away: how. */
        beaten?: DribbleMove
      }
    /** A forward sets off on a run in behind, until `until`. */
    | { type: 'run'; idx: number; until: number }
    /** `aerial`: a push or pull as they both go for a ball in the air, not a challenge on a carrier. */
    | { type: 'foul'; byIdx: number; onIdx: number; pos: Vec; award: 'freeKick' | 'penalty'; style: TackleStyle; aerial?: boolean }
    | { type: 'card'; idx: number; color: 'yellow' | 'red' }
    /** A substitution at a stoppage: `on` takes `off`'s place (and his spot on the pitch). */
    | { type: 'sub'; team: Side; offIdx: number; onIdx: number; reason: 'tired' | 'injury' }
    /** Hurt, and out for `weeks` matchdays after this one. */
    | { type: 'injury'; idx: number; weeks: number }
    | { type: 'offside'; idx: number; kickTick: number; pos: Vec }
    | { type: 'woodwork'; byIdx: number | null; pos: Vec; height: number }
    | { type: 'out'; award: 'throwIn' | 'corner' | 'goalKick'; team: Side; pos: Vec; height: number }
    | {
        type: 'goal'
        team: Side
        scorerIdx: number
        assistIdx: number | null
        ownGoal: boolean
        pos: Vec
        height: number
        celebration: Celebration | null
      }
    | { type: 'halfTime' }
    | { type: 'fullTime' }
  )

export interface MatchConfig {
  seed: number
  /** Minutes per half of simulated time. Tests may shorten this. */
  halfLengthMinutes?: number
  /** Match fitness (0-1) by player id, from the season: how fresh he starts. Default 1. */
  fitness?: Record<string, number>
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
  /**
   * Clock time (in ticks) this half spent on stoppages that isn't simulated: the ball being
   * fetched for a throw-in, a free kick being set up, a celebration. Counts on the clock only.
   */
  deadTicks: number
  /** Clock ticks the first half ran, once it's over. */
  firstHalfElapsed: number | null
  halfTicks: number
  players: PlayerState[]
  ball: BallState
  score: [number, number]
  phase: Phase
  stats: [TeamStats, TeamStats]
  /** Substitutions made so far, by team: who came on, who went off. */
  subbedOn: [number[], number[]]
  subbedOff: [number[], number[]]
  /** Stoppages used to make substitutions, by team (three allowed). */
  subWindows: [number, number]
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
  ball: { x: number; y: number; z: number; vx: number; vy: number; vz: number; ownerIdx: number | null }
  players: { x: number; y: number; onPitch: boolean }[]
}
