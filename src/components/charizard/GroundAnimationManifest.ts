/**
 * Ground Animation Manifest — SINGLE SOURCE OF TRUTH for ground mode
 *
 * Every animation is explicitly assigned to exactly ONE controller.
 * No keyword inference. No automatic classification. No guessing.
 *
 * This manifest covers ONLY the 000xx series — ground-based animations.
 * The 200xx series is NOT a duplicate — it is a separate flight behaviour set
 * managed by FlightAnimationManifest.
 */

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------
export type AnimationRole =
  | 'Movement'
  | 'Interaction'
  | 'Flight'
  | 'Sleep'
  | 'Eating'
  | 'Combat'
  | 'Facial'
  | 'NeverUse';

export interface ManifestEntry {
  name: string;
  role: AnimationRole;
  loop: boolean;
}

// ---------------------------------------------------------------------------
// MOVEMENT CONTROLLER — owned by the FSM
// ---------------------------------------------------------------------------
const MOVEMENT: ManifestEntry[] = [
  { name: 'pm0006_00_00_00000_defaultwait01_loop', role: 'NeverUse', loop: true },
  { name: 'pm0006_00_00_00010_defaultidle01', role: 'Movement', loop: false },
  { name: 'pm0006_00_00_00011_defaultidle02', role: 'Movement', loop: false },
  { name: 'pm0006_00_00_00021_turn_l090', role: 'Movement', loop: false },
  { name: 'pm0006_00_00_00021_turn_r090', role: 'Movement', loop: false },
  { name: 'pm0006_00_00_00030_walk01_loop', role: 'Movement', loop: true },
  { name: 'pm0006_00_00_00100_run01_loop', role: 'Movement', loop: true },
  { name: 'pm0006_00_00_00145_stepout01_start', role: 'Movement', loop: false },
  { name: 'pm0006_00_00_00146_stepout01', role: 'Movement', loop: false },
  { name: 'pm0006_00_00_00147_stepout01_end', role: 'Movement', loop: false },
];

// ---------------------------------------------------------------------------
// FLIGHT TRANSITION — Takeoff → Fly → LandingBegin → LandingLoop → LandingFinish
// These are the ground-mode takeoff/landing transition animations.
// The actual flying loop comes from the Flight Manifest.
// ---------------------------------------------------------------------------
const FLIGHT_TRANSITION: ManifestEntry[] = [
  { name: 'pm0006_00_00_00150_jumpup01_start', role: 'Flight', loop: false },
  { name: 'pm0006_00_00_00151_jumpup01_loop', role: 'Flight', loop: true },
  { name: 'pm0006_00_00_00152_jumpdown01_start', role: 'Flight', loop: false },
  { name: 'pm0006_00_00_00153_jumpdown01_loop', role: 'Flight', loop: true },
  { name: 'pm0006_00_00_00155_land02', role: 'Flight', loop: false },
];

// ---------------------------------------------------------------------------
// INTERACTION POOL — the ONLY ground-mode animations allowed for click interactions
// ---------------------------------------------------------------------------
const INTERACTION: ManifestEntry[] = [
  { name: 'pm0006_00_00_00300_roar01', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_00320_refresh01', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_00400_attack01', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_00410_attack02', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_00450_rangeattack01', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_00460_rangeattack02_start', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_00461_rangeattack02_loop', role: 'Interaction', loop: true },
  { name: 'pm0006_00_00_00462_rangeattack02_end', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_00550_glad01', role: 'Interaction', loop: false },
  { name: 'pm0006_00_00_00563_hate01', role: 'Interaction', loop: false },
];

// ---------------------------------------------------------------------------
// SLEEP — future only, never used for interactions
// ---------------------------------------------------------------------------
const SLEEP: ManifestEntry[] = [
  { name: 'pm0006_00_00_00280_sleep01_start', role: 'Sleep', loop: false },
  { name: 'pm0006_00_00_00281_sleep01_loop', role: 'Sleep', loop: true },
  { name: 'pm0006_00_00_00282_sleep01_end', role: 'Sleep', loop: false },
];

export const SleepAnimations = {
  start: 'pm0006_00_00_00280_sleep01_start',
  loop: 'pm0006_00_00_00281_sleep01_loop',
  end: 'pm0006_00_00_00282_sleep01_end',
};

// ---------------------------------------------------------------------------
// EATING — future only, never used for interactions
// ---------------------------------------------------------------------------
const EATING: ManifestEntry[] = [
  { name: 'pm0006_00_00_00290_eat01_start', role: 'Eating', loop: false },
  { name: 'pm0006_00_00_00291_eat01_loop', role: 'Eating', loop: true },
  { name: 'pm0006_00_00_00292_eat01_end', role: 'Eating', loop: false },
  { name: 'pm0006_00_00_00293_eat02_start', role: 'Eating', loop: false },
  { name: 'pm0006_00_00_00294_eat02_loop', role: 'Eating', loop: true },
  { name: 'pm0006_00_00_00295_eat02_end', role: 'Eating', loop: false },
];

// ---------------------------------------------------------------------------
// COMBAT — damage, stun, down. Never used during idle interactions.
// ---------------------------------------------------------------------------
const COMBAT: ManifestEntry[] = [
  { name: 'pm0006_00_00_00500_damage01', role: 'Combat', loop: false },
  { name: 'pm0006_00_00_00501_damage02', role: 'Combat', loop: false },
  { name: 'pm0006_00_00_00510_stun01_start', role: 'Combat', loop: false },
  { name: 'pm0006_00_00_00511_stun01_loop', role: 'Combat', loop: true },
  { name: 'pm0006_00_00_00512_stun01_end', role: 'Combat', loop: false },
  { name: 'pm0006_00_00_00520_down01_start', role: 'Combat', loop: false },
  { name: 'pm0006_00_00_00521_down01_loop', role: 'Combat', loop: true },
  { name: 'pm0006_00_00_00522_down01_end', role: 'Combat', loop: false },
];

// ---------------------------------------------------------------------------
// NEVER USE — facial, battlewait, notice
// ---------------------------------------------------------------------------
const NEVER_USE: ManifestEntry[] = [
  { name: 'pm0006_00_00_08000_eye01', role: 'Facial', loop: false },
  { name: 'pm0006_00_00_08100_mouth01', role: 'Facial', loop: false },
  { name: 'pm0006_00_00_08201_loop01_loop', role: 'Facial', loop: true },
  { name: 'pm0006_00_00_00001_battlewait01_loop', role: 'NeverUse', loop: true },
  { name: 'pm0006_00_00_00560_notice01', role: 'NeverUse', loop: false },
];

export const GroundAnimationManifest = {
  movement: MOVEMENT,
  flightTransition: FLIGHT_TRANSITION,
  interaction: INTERACTION,
  sleep: SLEEP,
  eating: EATING,
  combat: COMBAT,
  neverUse: NEVER_USE,
};

// ---------------------------------------------------------------------------
// Lookup map
// ---------------------------------------------------------------------------
const GROUND_MANIFEST_MAP: Map<string, ManifestEntry> = new Map();
[
  ...MOVEMENT, ...FLIGHT_TRANSITION, ...INTERACTION, ...SLEEP, ...EATING, ...COMBAT, ...NEVER_USE,
].forEach(e => GROUND_MANIFEST_MAP.set(e.name, e));

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export function getGroundManifestNames(): string[] {
  return Array.from(GROUND_MANIFEST_MAP.keys());
}

export function getGroundRole(name: string): AnimationRole {
  return GROUND_MANIFEST_MAP.get(name)?.role ?? 'NeverUse';
}

export function isGroundLoop(name: string): boolean {
  return GROUND_MANIFEST_MAP.get(name)?.loop ?? false;
}

// --- Ground interaction pool ---
export function getGroundInteractionPool(): string[] {
  return [
    'pm0006_00_00_00300_roar01',
    'pm0006_00_00_00320_refresh01',
    'pm0006_00_00_00400_attack01',
    'pm0006_00_00_00410_attack02',
    'pm0006_00_00_00450_rangeattack01',
    'pm0006_00_00_00500_damage01',
    'pm0006_00_00_00501_damage02',
    'pm0006_00_00_00563_hate01',
  ];
}

// --- Ground movement ---
export interface MovementAnimations {
  idleLoop: string | null;
  idleVariation1: string | null;
  idleVariation2: string | null;
  turnLeft: string | null;
  turnRight: string | null;
  walk: string | null;
  run: string | null;
}

export function getMovementAnimations(): MovementAnimations {
  return {
    idleLoop: MOVEMENT.find(e => e.name === 'pm0006_00_00_00010_defaultidle01')?.name ?? null,
    idleVariation1: MOVEMENT.find(e => e.name === 'pm0006_00_00_00010_defaultidle01')?.name ?? null,
    idleVariation2: MOVEMENT.find(e => e.name === 'pm0006_00_00_00011_defaultidle02')?.name ?? null,
    turnLeft: MOVEMENT.find(e => e.name === 'pm0006_00_00_00021_turn_l090')?.name ?? null,
    turnRight: MOVEMENT.find(e => e.name === 'pm0006_00_00_00021_turn_r090')?.name ?? null,
    walk: MOVEMENT.find(e => e.name === 'pm0006_00_00_00030_walk01_loop')?.name ?? null,
    run: MOVEMENT.find(e => e.name === 'pm0006_00_00_00100_run01_loop')?.name ?? null,
  };
}

// --- Ground flight transition animations (takeoff/landing) ---
export interface FlightTransitionAnimations {
  takeoff: string | null;
  fly: string | null;
  landingBegin: string | null;
  landingLoop: string | null;
  landingFinish: string | null;
}

export function getFlightTransitionAnimations(): FlightTransitionAnimations {
  return {
    takeoff: FLIGHT_TRANSITION.find(e => e.name === 'pm0006_00_00_00150_jumpup01_start')?.name ?? null,
    fly: FLIGHT_TRANSITION.find(e => e.name === 'pm0006_00_00_00151_jumpup01_loop')?.name ?? null,
    landingBegin: FLIGHT_TRANSITION.find(e => e.name === 'pm0006_00_00_00152_jumpdown01_start')?.name ?? null,
    landingLoop: FLIGHT_TRANSITION.find(e => e.name === 'pm0006_00_00_00153_jumpdown01_loop')?.name ?? null,
    landingFinish: FLIGHT_TRANSITION.find(e => e.name === 'pm0006_00_00_00155_land02')?.name ?? null,
  };
}

/**
 * Validate loaded animations against the ground manifest.
 */
export function validateAgainstGroundManifest(
  loadedClips: { name: string; duration: number }[]
): void {
  const rows = loadedClips.map(clip => {
    const entry = GROUND_MANIFEST_MAP.get(clip.name);
    return {
      'Animation Name': clip.name,
      'Role': entry?.role ?? 'UNASSIGNED',
      'Loop': entry ? (entry.loop ? 'Loop' : 'One-shot') : '—',
      'Duration': clip.duration.toFixed(2) + 's',
      'Source': entry ? 'GroundManifest' : 'UNASSIGNED',
    };
  });

  console.group('[GroundAnimationManifest] Validation Report');
  console.table(rows);

  const assigned = rows.filter(r => r['Source'] === 'GroundManifest').length;
  console.log(`Assigned: ${assigned} / ${loadedClips.length}`);
  console.groupEnd();
}
