/**
 * Flight Animation Manifest — SINGLE SOURCE OF TRUTH for flight mode
 *
 * The 200xx series (pm0006_00_00_200xx) is NOT a duplicate of the 000xx series.
 * It is a completely separate behaviour set representing Charizard already
 * airborne. This manifest covers ONLY the 200xx series.
 *
 * While flying, only animations from this manifest may be used.
 * Ground animations are never mixed with flight animations.
 */

import type { AnimationRole, ManifestEntry } from './GroundAnimationManifest';

// ---------------------------------------------------------------------------
// FLIGHT MOVEMENT — flying idle/hover, flying turns
// ---------------------------------------------------------------------------
const FLIGHT_MOVEMENT: ManifestEntry[] = [
  { name: 'pm0006_00_00_20000_defaultwait01_loop', role: 'Movement', loop: true },
  { name: 'pm0006_00_00_20010_defaultidle01', role: 'Movement', loop: false },
  { name: 'pm0006_00_00_20011_defaultidle02', role: 'Movement', loop: false },
  { name: 'pm0006_00_00_20021_turn_r090', role: 'Movement', loop: false },
  { name: 'pm0006_00_00_20024_turn_l090', role: 'Movement', loop: false },
  { name: 'pm0006_00_00_20030_walk01_loop', role: 'Movement', loop: true },
  { name: 'pm0006_00_00_20100_run01_loop', role: 'Movement', loop: true },
];

// ---------------------------------------------------------------------------
// FLIGHT TRANSITION — takeoff/landing while airborne
// ---------------------------------------------------------------------------
const FLIGHT_TRANSITION: ManifestEntry[] = [
  { name: 'pm0006_00_00_20150_jumpup01_start', role: 'Flight', loop: false },
  { name: 'pm0006_00_00_20151_jumpup01_loop', role: 'Flight', loop: true },
  { name: 'pm0006_00_00_20152_jumpdown01_start', role: 'Flight', loop: false },
  { name: 'pm0006_00_00_20153_jumpdown01_loop', role: 'Flight', loop: true },
  { name: 'pm0006_00_00_20155_land02', role: 'Flight', loop: false },
];

// ---------------------------------------------------------------------------
// FLIGHT INTERACTION POOL — the ONLY flight-mode animations for click interactions
//
// Sequence clips (_loop, _end) are listed here for manifest completeness but
// are EXCLUDED from the random-pick pool — only _start clips are entry points.
// ---------------------------------------------------------------------------
const FLIGHT_INTERACTION: ManifestEntry[] = [
  { name: 'pm0006_00_00_20300_roar01', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_20400_attack01', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_20410_attack02', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_20450_rangeattack01', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_20460_rangeattack02_start', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_20461_rangeattack02_loop', role: 'Interaction', loop: true },
  { name: 'pm0006_00_00_20462_rangeattack02_end', role: 'Interaction', loop: false },
];

// ---------------------------------------------------------------------------
// FLIGHT COMBAT — damage, stun, down while airborne
// Stun and Down are sequences; their _loop/_end clips are excluded from the
// random-pick pool (only _start is an entry point).
// ---------------------------------------------------------------------------
const FLIGHT_COMBAT: ManifestEntry[] = [
  { name: 'pm0006_00_00_20500_damage01', role: 'Combat', loop: false },
  { name: 'pm0006_00_00_20501_damage02', role: 'Combat', loop: false },
  { name: 'pm0006_00_00_20510_stun01_start', role: 'Combat', loop: false },
  { name: 'pm0006_00_00_20511_stun01_loop', role: 'Combat', loop: true },
  { name: 'pm0006_00_00_20512_stun01_end', role: 'Combat', loop: false },
  { name: 'pm0006_00_00_20520_down01_start', role: 'Combat', loop: false },
  { name: 'pm0006_00_00_20521_down01_loop', role: 'Combat', loop: true },
  { name: 'pm0006_00_00_20522_down01_end', role: 'Combat', loop: false },
];

// ---------------------------------------------------------------------------
// FLIGHT NEVER USE — facial, notice
// ---------------------------------------------------------------------------
const FLIGHT_NEVER_USE: ManifestEntry[] = [
  { name: 'pm0006_00_00_28000_eye01', role: 'Facial', loop: false },
  { name: 'pm0006_00_00_28100_mouth01', role: 'Facial', loop: false },
  { name: 'pm0006_00_00_28201_loop01_loop', role: 'Facial', loop: true },
  { name: 'pm0006_00_00_20560_notice01', role: 'NeverUse', loop: false },
];

export const FlightAnimationManifest = {
  movement: FLIGHT_MOVEMENT,
  flightTransition: FLIGHT_TRANSITION,
  interaction: FLIGHT_INTERACTION,
  combat: FLIGHT_COMBAT,
  neverUse: FLIGHT_NEVER_USE,
};

// ---------------------------------------------------------------------------
// Lookup map
// ---------------------------------------------------------------------------
const FLIGHT_MANIFEST_MAP: Map<string, ManifestEntry> = new Map();
[
  ...FLIGHT_MOVEMENT, ...FLIGHT_TRANSITION, ...FLIGHT_INTERACTION, ...FLIGHT_COMBAT, ...FLIGHT_NEVER_USE,
].forEach(e => FLIGHT_MANIFEST_MAP.set(e.name, e));

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export function getFlightManifestNames(): string[] {
  return Array.from(FLIGHT_MANIFEST_MAP.keys());
}

export function getFlightRole(name: string): AnimationRole {
  return FLIGHT_MANIFEST_MAP.get(name)?.role ?? 'NeverUse';
}

export function isFlightLoop(name: string): boolean {
  return FLIGHT_MANIFEST_MAP.get(name)?.loop ?? false;
}

// ---------------------------------------------------------------------------
// FLIGHT SEQUENCES
// Each entry describes a 3-clip sequence: start → loop → end.
// The loop clip repeats for exactly one full cycle (its clip duration).
// ---------------------------------------------------------------------------
export interface FlightSequenceDefinition {
  /** Entry-point clip — this is the name that appears in the random-pick pool. */
  start: string;
  /** Loop clip — plays for one full duration after start finishes. */
  loop: string;
  /** End clip — plays once after the loop, then fires onFinish. */
  end: string;
}

const FLIGHT_SEQUENCES: FlightSequenceDefinition[] = [
  {
    start: 'pm0006_00_00_20460_rangeattack02_start',
    loop:  'pm0006_00_00_20461_rangeattack02_loop',
    end:   'pm0006_00_00_20462_rangeattack02_end',
  },
  {
    start: 'pm0006_00_00_20510_stun01_start',
    loop:  'pm0006_00_00_20511_stun01_loop',
    end:   'pm0006_00_00_20512_stun01_end',
  },
  {
    start: 'pm0006_00_00_20520_down01_start',
    loop:  'pm0006_00_00_20521_down01_loop',
    end:   'pm0006_00_00_20522_down01_end',
  },
];

/** Clip names that must NEVER appear in the random-pick pool (mid-sequence clips). */
const SEQUENCE_SECONDARY_CLIPS = new Set<string>(
  FLIGHT_SEQUENCES.flatMap(s => [s.loop, s.end])
);

// --- Flight interaction pool ---
export function getFlightInteractionPool(): string[] {
  return [
    'pm0006_00_00_20400_attack01',
    'pm0006_00_00_20410_attack02',
    'pm0006_00_00_20450_rangeattack01',
    'pm0006_00_00_20500_damage01',
    'pm0006_00_00_20501_damage02',
  ];
}

/** Returns the sequence definition for the given start-clip name, or null. */
export function getFlightSequence(startClipName: string): FlightSequenceDefinition | null {
  return FLIGHT_SEQUENCES.find(s => s.start === startClipName) ?? null;
}

// --- Flight movement animations (mirrors ground getMovementAnimations) ---
export interface FlightMovementAnimations {
  idleLoop: string | null;
  idleVariation1: string | null;
  idleVariation2: string | null;
  turnLeft: string | null;
  turnRight: string | null;
  walk: string | null;
  run: string | null;
}

export function getFlightMovementAnimations(): FlightMovementAnimations {
  const find = (name: string) => FLIGHT_MOVEMENT.find(e => e.name === name)?.name ?? null;
  return {
    idleLoop: find('pm0006_00_00_20010_defaultidle01'),
    idleVariation1: find('pm0006_00_00_20010_defaultidle01'),
    idleVariation2: find('pm0006_00_00_20011_defaultidle02'),
    turnLeft: find('pm0006_00_00_20021_turn_r090'),
    turnRight: find('pm0006_00_00_20024_turn_l090'),
    walk: find('pm0006_00_00_20030_walk01_loop'),
    run: find('pm0006_00_00_20100_run01_loop'),
  };
}

// --- Flight hover idle (primary flying loop) ---
export function getFlightHoverIdle(): string | null {
  return FLIGHT_MOVEMENT.find(e => e.name === 'pm0006_00_00_20000_defaultwait01_loop')?.name ?? null;
}

// --- Flight transition animations (airborne takeoff/landing) ---
export interface FlightAnimations {
  takeoff: string | null;
  fly: string | null;
  landingBegin: string | null;
  landingLoop: string | null;
  landingFinish: string | null;
}

export function getFlightAnimations(): FlightAnimations {
  return {
    takeoff: FLIGHT_TRANSITION.find(e => e.name === 'pm0006_00_00_20150_jumpup01_start')?.name ?? null,
    fly: FLIGHT_TRANSITION.find(e => e.name === 'pm0006_00_00_20151_jumpup01_loop')?.name ?? null,
    landingBegin: FLIGHT_TRANSITION.find(e => e.name === 'pm0006_00_00_20152_jumpdown01_start')?.name ?? null,
    landingLoop: FLIGHT_TRANSITION.find(e => e.name === 'pm0006_00_00_20153_jumpdown01_loop')?.name ?? null,
    landingFinish: FLIGHT_TRANSITION.find(e => e.name === 'pm0006_00_00_20155_land02')?.name ?? null,
  };
}

/**
 * Validate loaded animations against the flight manifest.
 */
export function validateAgainstFlightManifest(
  loadedClips: { name: string; duration: number }[]
): void {
  const rows = loadedClips.map(clip => {
    const entry = FLIGHT_MANIFEST_MAP.get(clip.name);
    return {
      'Animation Name': clip.name,
      'Role': entry?.role ?? 'UNASSIGNED',
      'Loop': entry ? (entry.loop ? 'Loop' : 'One-shot') : '—',
      'Duration': clip.duration.toFixed(2) + 's',
      'Source': entry ? 'FlightManifest' : 'UNASSIGNED',
    };
  });

  console.group('[FlightAnimationManifest] Validation Report');
  console.table(rows);

  const assigned = rows.filter(r => r['Source'] === 'FlightManifest').length;
  console.log(`Assigned: ${assigned} / ${loadedClips.length}`);
  console.groupEnd();
}
