# GodView Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static GodView hold with a ~93 s cinematic journey: descend to skim altitude, fly over Australia → China → Japan → USA with name captions, pull back to a pale-blue-dot hold with quotes, then glide home.

**Architecture:** A new pure module `src/godview/journey.ts` describes the outbound trip as a keyframe timeline (`buildJourney`) and plays it (`JourneyPlayer`) using the existing `sphericalLerp`/easing primitives. The return home reuses `GodViewTransition.flyTo`, and `GodViewMode` keeps its four states — 'transitioning' = descend, 'godview' = flyover/ascend/hold. Country waypoints are computed from lat/lon with the Earth surface rotation **predicted at arrival time** (the globe turns 0.01 rad/s ≈ 17° during the tour).

**Tech Stack:** TypeScript, Three.js (math only in tests), Vitest (Node environment), plain DOM/CSS for UI.

## Global Constraints

- Node 20.17 toolchain: Vite 6, Vitest 3 — do not bump majors.
- Logic is TDD'd in `tests/` and must run in Node; rendering/Web Audio/UI glue stays untested (browser-verified) — per CLAUDE.md testing split.
- No progress bars or timers visible in the experience; UI fades when idle.
- Never call `controls.update()` outside the `exploring` state.
- `SUN_DIRECTION` is single-sourced in `src/scene/Lighting.ts`.
- Windows shell is PowerShell — commands below use `npx vitest run …` / `npm test` which work as-is.
- Commit after every green test cycle. Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## Reference: existing primitives the tasks below consume

- `sphericalLerp(from: Vector3, to: Vector3, t: number): Vector3` — from `src/camera/GodViewTransition.ts`; slerps direction, lerps radius; identical endpoints are safe (returns the point).
- `easeInOutCubic(t: number): number` — from `src/godview/tween.ts`.
- `EARTH_ROTATION_SPEED = 0.01` (rad/s) — from `src/scene/Earth.ts`.
- Earth radius 1, clouds 1.008, atmosphere shell 1.16, explore range 1.25–60, starfield 900, camera far 2000. Skim radius 1.3 and dot radius 55 fit with margin.

---

### Task 1: Country data + lat/lon → world-space math

**Files:**
- Create: `src/godview/countries.ts`
- Test: `tests/countries.test.ts`

**Interfaces:**
- Produces: `TourCountry { name: string; lat: number; lon: number }`, `TOUR_COUNTRIES: TourCountry[]` (Australia, China, Japan, United States — visit order), `latLonToWorld(latDeg: number, lonDeg: number, surfaceRotationY: number, radius: number): THREE.Vector3`.

- [ ] **Step 1: Write the failing test**

Create `tests/countries.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import * as THREE from 'three';
import { TOUR_COUNTRIES, latLonToWorld } from '../src/godview/countries';

describe('TOUR_COUNTRIES', () => {
  test('visits the four MVP countries in order', () => {
    expect(TOUR_COUNTRIES.map((c) => c.name)).toEqual([
      'Australia',
      'China',
      'Japan',
      'United States',
    ]);
  });

  test('uses plausible coordinates', () => {
    for (const { lat, lon } of TOUR_COUNTRIES) {
      expect(Math.abs(lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(lon)).toBeLessThanOrEqual(180);
    }
    expect(TOUR_COUNTRIES[0].lat).toBeLessThan(0); // Australia: southern hemisphere
    expect(TOUR_COUNTRIES[3].lon).toBeLessThan(0); // USA: western hemisphere
  });
});

describe('latLonToWorld', () => {
  test('honors the requested radius', () => {
    expect(latLonToWorld(35, 104, 0.7, 1.3).length()).toBeCloseTo(1.3);
    expect(latLonToWorld(-25, 134, 2.1, 55).length()).toBeCloseTo(55);
  });

  test('puts the north pole on +Y regardless of rotation', () => {
    for (const rotation of [0, 1.234, Math.PI]) {
      const p = latLonToWorld(90, 0, rotation, 2);
      expect(p.distanceTo(new THREE.Vector3(0, 2, 0))).toBeLessThan(1e-6);
    }
  });

  test('keeps equator points at y = 0', () => {
    expect(latLonToWorld(0, 77, 0.4, 1).y).toBeCloseTo(0);
  });

  test('rotating the surface by Δ equals shifting longitude east by Δ', () => {
    const delta = Math.PI / 2;
    const rotated = latLonToWorld(0, 0, delta, 1);
    const shifted = latLonToWorld(0, THREE.MathUtils.radToDeg(delta), 0, 1);
    expect(rotated.distanceTo(shifted)).toBeLessThan(1e-6);
  });

  test('separates two distant countries by a real angle', () => {
    const australia = latLonToWorld(-25.3, 134.5, 0, 1);
    const usa = latLonToWorld(39.8, -98.6, 0, 1);
    expect(australia.angleTo(usa)).toBeGreaterThan(1.5); // ~86°+ apart
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/countries.test.ts`
Expected: FAIL — cannot resolve `../src/godview/countries`.

- [ ] **Step 3: Write minimal implementation**

Create `src/godview/countries.ts`:

```ts
import * as THREE from 'three';

export interface TourCountry {
  name: string;
  lat: number;
  lon: number;
}

// Journey flyover roster, in visit order — a smooth south-to-north,
// then eastward arc with no backtracking. Extend or reorder freely.
export const TOUR_COUNTRIES: TourCountry[] = [
  { name: 'Australia', lat: -25.3, lon: 134.5 },
  { name: 'China', lat: 35.0, lon: 103.8 },
  { name: 'Japan', lat: 36.2, lon: 138.3 },
  { name: 'United States', lat: 39.8, lon: -98.6 },
];

const UP = new THREE.Vector3(0, 1, 0);

// Standard three.js SphereGeometry equirectangular mapping, then the
// surface's current Y rotation. Verify texture alignment in the browser;
// if the map seam differs, adjust the `+ 180` longitude offset here.
export function latLonToWorld(
  latDeg: number,
  lonDeg: number,
  surfaceRotationY: number,
  radius: number,
): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - latDeg);
  const theta = THREE.MathUtils.degToRad(lonDeg + 180);
  return new THREE.Vector3(
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  )
    .applyAxisAngle(UP, surfaceRotationY)
    .multiplyScalar(radius);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/countries.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/godview/countries.ts tests/countries.test.ts
git commit -m "feat: country tour roster + rotation-aware lat/lon math"
```

---

### Task 2: `buildJourney` — the keyframe timeline

**Files:**
- Create: `src/godview/journey.ts`
- Test: `tests/journey.test.ts`

**Interfaces:**
- Consumes: `TOUR_COUNTRIES`, `latLonToWorld` (Task 1); `EARTH_ROTATION_SPEED` from `src/scene/Earth.ts`.
- Produces: constants `SKIM_RADIUS = 1.3`, `DOT_RADIUS = 55`, `ASCEND_MIDPOINT_RADIUS = 8`, `DESCEND_SECONDS = 10`, `DWELL_SECONDS = 3`, `LEG_SECONDS = 5`, `ASCEND_SILENT_SECONDS = 12`, `ASCEND_QUOTE_SECONDS = 18`, `HOLD_SECONDS = 15`; types `JourneyPhaseKind = 'descend' | 'dwell' | 'leg' | 'ascend' | 'ascend-quote' | 'hold'`, `JourneyPhase { kind, country?, duration, from, to }`; `buildJourney(startPosition: THREE.Vector3, surfaceRotationY: number): JourneyPhase[]`.

Timeline produced (11 phases, 82 s outbound; the 12 s return home is separate):
`descend(10) → dwell·Australia(3) → leg(5) → dwell·China(3) → leg(5) → dwell·Japan(3) → leg(5) → dwell·United States(3) → ascend(12) → ascend-quote(18) → hold(15)`

- [ ] **Step 1: Write the failing test**

Create `tests/journey.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import * as THREE from 'three';
import {
  DESCEND_SECONDS,
  DOT_RADIUS,
  SKIM_RADIUS,
  buildJourney,
} from '../src/godview/journey';
import { TOUR_COUNTRIES, latLonToWorld } from '../src/godview/countries';
import { EARTH_ROTATION_SPEED } from '../src/scene/Earth';

const START = new THREE.Vector3(0, 0.4, 3.2);

describe('buildJourney', () => {
  const phases = buildJourney(START, 0.5);

  test('produces the full beat sequence', () => {
    expect(phases.map((p) => p.kind)).toEqual([
      'descend',
      'dwell',
      'leg',
      'dwell',
      'leg',
      'dwell',
      'leg',
      'dwell',
      'ascend',
      'ascend-quote',
      'hold',
    ]);
  });

  test('names the dwell captions in tour order', () => {
    const dwells = phases.filter((p) => p.kind === 'dwell');
    expect(dwells.map((p) => p.country)).toEqual(TOUR_COUNTRIES.map((c) => c.name));
  });

  test('starts exactly where the camera is', () => {
    expect(phases[0].from.distanceTo(START)).toBeLessThan(1e-6);
  });

  test('is continuous: each phase starts where the previous ended', () => {
    for (let i = 1; i < phases.length; i++) {
      expect(phases[i].from.distanceTo(phases[i - 1].to)).toBeLessThan(1e-6);
    }
  });

  test('flies the flyover at skim altitude and the hold at dot distance', () => {
    for (const p of phases.filter((p) => p.kind === 'dwell')) {
      expect(p.to.length()).toBeCloseTo(SKIM_RADIUS);
    }
    const hold = phases[phases.length - 1];
    expect(hold.to.length()).toBeCloseTo(DOT_RADIUS);
    expect(hold.from.distanceTo(hold.to)).toBeLessThan(1e-6); // it's a hold
  });

  test('predicts surface rotation at each arrival time for waypoints', () => {
    const australia = TOUR_COUNTRIES[0];
    const expected = latLonToWorld(
      australia.lat,
      australia.lon,
      0.5 + EARTH_ROTATION_SPEED * DESCEND_SECONDS,
      SKIM_RADIUS,
    );
    expect(phases[0].to.distanceTo(expected)).toBeLessThan(1e-6);
  });

  test('ascends radially: the pull-back never changes direction', () => {
    const ascend = phases.find((p) => p.kind === 'ascend')!;
    const ascendQuote = phases.find((p) => p.kind === 'ascend-quote')!;
    const dir = ascend.from.clone().normalize();
    expect(ascend.to.clone().normalize().distanceTo(dir)).toBeLessThan(1e-6);
    expect(ascendQuote.to.clone().normalize().distanceTo(dir)).toBeLessThan(1e-6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/journey.test.ts`
Expected: FAIL — cannot resolve `../src/godview/journey`.

- [ ] **Step 3: Write minimal implementation**

Create `src/godview/journey.ts`:

```ts
import * as THREE from 'three';
import { EARTH_ROTATION_SPEED } from '../scene/Earth';
import { TOUR_COUNTRIES, latLonToWorld } from './countries';

export const SKIM_RADIUS = 1.3;
export const DOT_RADIUS = 55;
export const ASCEND_MIDPOINT_RADIUS = 8;
export const DESCEND_SECONDS = 10;
export const DWELL_SECONDS = 3;
export const LEG_SECONDS = 5;
export const ASCEND_SILENT_SECONDS = 12;
export const ASCEND_QUOTE_SECONDS = 18;
export const HOLD_SECONDS = 15;

export type JourneyPhaseKind = 'descend' | 'dwell' | 'leg' | 'ascend' | 'ascend-quote' | 'hold';

export interface JourneyPhase {
  kind: JourneyPhaseKind;
  /** Set on dwell phases: the caption to show. */
  country?: string;
  duration: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
}

// The outbound timeline: descend → country flyover → ascend → dot hold.
// The return home stays with GodViewTransition.flyTo, as before.
// Country waypoints use the surface rotation predicted for their arrival
// time, so the camera meets each country as the globe turns beneath it.
export function buildJourney(
  startPosition: THREE.Vector3,
  surfaceRotationY: number,
): JourneyPhase[] {
  const phases: JourneyPhase[] = [];
  let elapsed = 0;
  let cursor = startPosition.clone();

  const add = (kind: JourneyPhaseKind, duration: number, to: THREE.Vector3, country?: string): void => {
    const phase: JourneyPhase = { kind, duration, from: cursor.clone(), to: to.clone() };
    if (country !== undefined) phase.country = country;
    phases.push(phase);
    cursor = to.clone();
    elapsed += duration;
  };

  for (let i = 0; i < TOUR_COUNTRIES.length; i++) {
    const { name, lat, lon } = TOUR_COUNTRIES[i];
    const travel = i === 0 ? DESCEND_SECONDS : LEG_SECONDS;
    const arrivalRotation = surfaceRotationY + EARTH_ROTATION_SPEED * (elapsed + travel);
    const waypoint = latLonToWorld(lat, lon, arrivalRotation, SKIM_RADIUS);
    add(i === 0 ? 'descend' : 'leg', travel, waypoint);
    add('dwell', DWELL_SECONDS, waypoint, name);
  }

  const outward = cursor.clone().normalize();
  add('ascend', ASCEND_SILENT_SECONDS, outward.clone().multiplyScalar(ASCEND_MIDPOINT_RADIUS));
  add('ascend-quote', ASCEND_QUOTE_SECONDS, outward.clone().multiplyScalar(DOT_RADIUS));
  add('hold', HOLD_SECONDS, outward.clone().multiplyScalar(DOT_RADIUS));

  return phases;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/journey.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/godview/journey.ts tests/journey.test.ts
git commit -m "feat: buildJourney keyframe timeline with rotation-predicted waypoints"
```

---

### Task 3: `JourneyPlayer` — time → camera position + beat events

**Files:**
- Modify: `src/godview/journey.ts` (append)
- Test: `tests/journey.test.ts` (append)

**Interfaces:**
- Consumes: `JourneyPhase[]` (Task 2), `sphericalLerp` from `src/camera/GodViewTransition.ts`, `easeInOutCubic` from `src/godview/tween.ts`.
- Produces: `JourneyCallbacks { onPhase?: (phase: JourneyPhase) => void; onComplete?: () => void }`, `class JourneyPlayer { constructor(phases, callbacks?); get active(): boolean; update(dt: number): THREE.Vector3 | null; stop(): void }`. `onPhase` fires as each phase begins (including the first, on the first `update`); `onComplete` fires exactly once at the end; after completion or `stop()`, `update` returns `null` and `active` is `false`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/journey.test.ts`, adding `JourneyPlayer` to the existing import from `'../src/godview/journey'` (do not add unused imports — the tsconfig is strict):

```ts
describe('JourneyPlayer', () => {
  const drive = (player: JourneyPlayer, seconds: number, step = 0.1): THREE.Vector3 | null => {
    let last: THREE.Vector3 | null = null;
    for (let t = 0; t < seconds; t += step) {
      const pos = player.update(step);
      if (pos) last = pos.clone();
    }
    return last;
  };

  test('announces the first phase on the first update', () => {
    const seen: string[] = [];
    const player = new JourneyPlayer(buildJourney(START, 0), {
      onPhase: (p) => seen.push(p.kind),
    });
    player.update(0.016);
    expect(seen).toEqual(['descend']);
  });

  test('fires every phase once, in order, then onComplete exactly once', () => {
    const seen: string[] = [];
    let completions = 0;
    const player = new JourneyPlayer(buildJourney(START, 0), {
      onPhase: (p) => seen.push(p.kind),
      onComplete: () => completions++,
    });
    drive(player, 90); // total outbound is 82s
    expect(seen).toEqual([
      'descend', 'dwell', 'leg', 'dwell', 'leg', 'dwell', 'leg', 'dwell',
      'ascend', 'ascend-quote', 'hold',
    ]);
    expect(completions).toBe(1);
    expect(player.active).toBe(false);
    expect(player.update(0.1)).toBeNull();
  });

  test('ends exactly at the hold position', () => {
    const phases = buildJourney(START, 0);
    const player = new JourneyPlayer(phases);
    const last = drive(player, 90);
    expect(last!.distanceTo(phases[phases.length - 1].to)).toBeLessThan(1e-6);
  });

  test('never dips below the explore minimum distance (no globe clipping)', () => {
    const player = new JourneyPlayer(buildJourney(START, 1.7));
    for (let t = 0; t < 90; t += 0.1) {
      const pos = player.update(0.1);
      if (pos) expect(pos.length()).toBeGreaterThanOrEqual(1.25 - 1e-9);
    }
  });

  test('reaches each dwell waypoint when the dwell begins', () => {
    let current: THREE.Vector3 | null = null;
    const phases = buildJourney(START, 0);
    const player = new JourneyPlayer(phases, {
      onPhase: (p) => {
        if (p.kind === 'dwell') {
          // Camera is (numerically) at the waypoint as the caption fires.
          expect(current!.distanceTo(p.from)).toBeLessThan(0.05);
        }
      },
    });
    for (let t = 0; t < 90; t += 0.05) {
      const pos = player.update(0.05);
      if (pos) current = pos.clone();
    }
  });

  test('stop() halts the journey immediately', () => {
    const player = new JourneyPlayer(buildJourney(START, 0));
    player.update(1);
    player.stop();
    expect(player.active).toBe(false);
    expect(player.update(0.1)).toBeNull();
  });
});
```

Note on the "reaches each dwell waypoint" test: `current` is assigned inside the drive loop *before* the next phase's `onPhase` fires (events fire during `update`), so it holds the previous frame's position — within one 0.05 s step of the boundary, hence the 0.05 tolerance.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/journey.test.ts`
Expected: FAIL — `JourneyPlayer` is not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `src/godview/journey.ts` (and add the two imports at the top of the file):

```ts
import { sphericalLerp } from '../camera/GodViewTransition';
import { easeInOutCubic } from './tween';
```

```ts
export interface JourneyCallbacks {
  /** Fires as each phase begins (including the first, on the first update). */
  onPhase?: (phase: JourneyPhase) => void;
  onComplete?: () => void;
}

// Frame-driven playback: call update(dt) each frame and copy the returned
// position onto the camera. Null once the journey is over or stopped.
export class JourneyPlayer {
  private phaseIndex = -1;
  private phaseElapsed = 0;
  private done = false;
  private readonly position = new THREE.Vector3();

  constructor(
    private readonly phases: JourneyPhase[],
    private readonly callbacks: JourneyCallbacks = {},
  ) {}

  get active(): boolean {
    return !this.done;
  }

  update(dt: number): THREE.Vector3 | null {
    if (this.done) return null;
    if (this.phaseIndex === -1) this.enterPhase(0);

    this.phaseElapsed += dt;
    while (this.phaseElapsed >= this.phases[this.phaseIndex].duration) {
      if (this.phaseIndex === this.phases.length - 1) {
        this.position.copy(this.phases[this.phaseIndex].to);
        this.done = true;
        this.callbacks.onComplete?.();
        return this.position;
      }
      this.phaseElapsed -= this.phases[this.phaseIndex].duration;
      this.enterPhase(this.phaseIndex + 1);
    }

    const phase = this.phases[this.phaseIndex];
    const t = phase.duration === 0 ? 1 : this.phaseElapsed / phase.duration;
    this.position.copy(sphericalLerp(phase.from, phase.to, easeInOutCubic(t)));
    return this.position;
  }

  /** User exit: abandon playback (the return flight is flown elsewhere). */
  stop(): void {
    this.done = true;
  }

  private enterPhase(index: number): void {
    this.phaseIndex = index;
    this.callbacks.onPhase?.(this.phases[index]);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/journey.test.ts`
Expected: PASS (13 tests).

- [ ] **Step 5: Commit**

```bash
git add src/godview/journey.ts tests/journey.test.ts
git commit -m "feat: JourneyPlayer — frame-driven journey playback with beat events"
```

---

### Task 4: `GodViewMode` — allow exit during the outbound flight

**Files:**
- Modify: `src/godview/GodViewMode.ts:31-36` (the `requestExit` method)
- Test: `tests/GodViewMode.test.ts:57-69` (replace one test, add one)

The design requires ESC/tap to work even during the 10 s descend ('transitioning'). The existing test `requestExit leaves godview but is a no-op elsewhere` pins the old behavior and must be updated — this is a deliberate spec change, not test tampering.

- [ ] **Step 1: Update the test**

In `tests/GodViewMode.test.ts`, replace the entire `test('requestExit leaves godview but is a no-op elsewhere', …)` block with:

```ts
  test('requestExit exits from godview', () => {
    mode.toggle();
    mode.notifyTransitionComplete();
    mode.requestExit();
    expect(mode.state).toBe('returning');
    expect(events).toEqual(['enterStart', 'settled', 'exitStart']);
  });

  test('requestExit aborts the outbound flight', () => {
    mode.toggle();
    mode.requestExit();
    expect(mode.state).toBe('returning');
    expect(events).toEqual(['enterStart', 'exitStart']);
  });

  test('requestExit is a no-op while exploring or returning', () => {
    mode.requestExit();
    expect(mode.state).toBe('exploring');

    mode.toggle();
    mode.requestExit(); // now returning
    mode.requestExit(); // must not double-fire
    expect(mode.state).toBe('returning');
    expect(events).toEqual(['enterStart', 'exitStart']);
  });
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npx vitest run tests/GodViewMode.test.ts`
Expected: FAIL — `requestExit aborts the outbound flight` sees state 'transitioning'.

- [ ] **Step 3: Implement**

In `src/godview/GodViewMode.ts`, replace the `requestExit` method:

```ts
  /** ESC or tap: exits from godview, or aborts the outbound flight. */
  requestExit(): void {
    if (this.currentState === 'godview' || this.currentState === 'transitioning') {
      this.setState('returning', 'exitStart');
    }
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/GodViewMode.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add src/godview/GodViewMode.ts tests/GodViewMode.test.ts
git commit -m "feat: allow GodView exit during the outbound flight"
```

---

### Task 5: Earth rotation getter + country caption UI

**Files:**
- Modify: `src/scene/Earth.ts` (add getter after `update`)
- Create: `src/ui/CountryCaption.ts`
- Modify: `src/style.css` (append after the Quote overlay block, ~line 195)

No unit tests: these are rendering/DOM glue, browser-verified per the project's testing split.

**Interfaces:**
- Produces: `Earth.totalSurfaceRotationY: number` (getter); `class CountryCaption { constructor(root: HTMLElement); show(name: string): void; hide(): void }`.

- [ ] **Step 1: Add the Earth getter**

In `src/scene/Earth.ts`, after the `update` method, add:

```ts
  /** Total surface yaw: random per-visit group offset + accumulated spin.
   *  This is the rotation lat/lon → world math must use. */
  get totalSurfaceRotationY(): number {
    return this.group.rotation.y + this.surface.rotation.y;
  }
```

- [ ] **Step 2: Create the caption overlay**

Create `src/ui/CountryCaption.ts`:

```ts
const VISIBLE_MS = 4500;

// Journey-only caption naming the country below the camera. Never shown
// during free exploration.
export class CountryCaption {
  private readonly el: HTMLDivElement;
  private hideTimer: number | undefined;

  constructor(root: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'country-caption';
    root.appendChild(this.el);
  }

  show(name: string): void {
    this.el.textContent = name;
    this.el.classList.add('country-caption-visible');
    window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => this.hide(), VISIBLE_MS);
  }

  hide(): void {
    window.clearTimeout(this.hideTimer);
    this.el.classList.remove('country-caption-visible');
  }
}
```

- [ ] **Step 3: Add the CSS**

In `src/style.css`, after the `.quote-author` rule (before the `@media` block), add:

```css
/* ---------- Country caption (journey flyover) ---------- */

.country-caption {
  position: absolute;
  left: 50%;
  bottom: 14%;
  transform: translateX(-50%);
  font-size: 1.3rem;
  font-weight: 300;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.8);
  opacity: 0;
  transition: opacity 1.2s ease;
  pointer-events: none !important;
}

.country-caption-visible {
  opacity: 1;
}
```

Inside the existing `@media (max-width: 640px)` block, add:

```css
  .country-caption {
    font-size: 1rem;
  }
```

- [ ] **Step 4: Type-check and run the suite**

Run: `npm run build`
Expected: clean `tsc --noEmit` + successful Vite build.
Run: `npm test`
Expected: all suites PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scene/Earth.ts src/ui/CountryCaption.ts src/style.css
git commit -m "feat: Earth total-rotation getter + country caption overlay"
```

---

### Task 6: Rewire `main.ts` — journey replaces the static hold

**Files:**
- Modify: `src/main.ts`
- Modify: `src/godview/quotes.ts:7-28` (reorder only)
- Modify: `src/camera/GodViewTransition.ts` (remove dead code)
- Modify: `tests/GodViewTransition.test.ts` (remove dead tests)

**Interfaces:**
- Consumes: everything produced by Tasks 1–5.

- [ ] **Step 1: Reorder QUOTES so the dot-hold gets Sagan on first activation**

Two quotes fire per journey via `quotes.next()`: #1 mid-ascend, #2 at the dot hold. The hold must open with Sagan's "Look again at that dot…" — so move it to index 1. In `src/godview/quotes.ts`, reorder the array so Edgar Mitchell's "sparkling blue and white jewel" quote is first and Carl Sagan's is second (all five quotes keep their exact text; only order changes). Update the comment above the array to:

```ts
// Two are shown per journey — mid-ascend, then at the pale-blue-dot hold —
// so Sagan's dot quote sits second, landing on the hold beat first time out.
```

- [ ] **Step 2: Remove the now-dead hero vantage**

The journey replaces the single hero-vantage flight; `computeHeroPosition` and `HERO_DISTANCE` have no callers after this task. In `src/camera/GodViewTransition.ts`, delete the `HERO_DISTANCE` constant and the `computeHeroPosition` function (keep `sphericalLerp` and the `GodViewTransition` class — the return flight uses them). In `tests/GodViewTransition.test.ts`, delete the `describe('computeHeroPosition', …)` block, remove `HERO_DISTANCE`/`computeHeroPosition` from the import, remove the now-unused `SUN_DIRECTION` import, and replace the two `computeHeroPosition()` usages inside the `GodViewTransition` describe block with a literal target `new THREE.Vector3(2, 1, 0).normalize().multiplyScalar(3.4)` (declare it once as `const target` inside that describe block).

- [ ] **Step 3: Rewire the orchestration**

In `src/main.ts`:

Replace the import of `GodViewTransition, computeHeroPosition` with:

```ts
import { GodViewTransition } from './camera/GodViewTransition';
import { JourneyPlayer, buildJourney, DESCEND_SECONDS } from './godview/journey';
import { CountryCaption } from './ui/CountryCaption';
```

Replace the constants block:

```ts
const RETURN_SECONDS = 12;
const GODVIEW_EXPOSURE = 1.35;
const GODVIEW_ATMOSPHERE = 2.1;
```

(`FLIGHT_SECONDS` is deleted; the grading ramp now uses `DESCEND_SECONDS`.)

After `const hud = new Hud(uiRoot);` add:

```ts
  const caption = new CountryCaption(uiRoot);
```

Replace the whole GodView orchestration section (the `restorePosition` declaration and the four `mode.on(...)` handlers) with:

```ts
  // --- GodView orchestration -----------------------------------------
  const restorePosition = new THREE.Vector3();
  let journey: JourneyPlayer | null = null;

  mode.on('enterStart', () => {
    restorePosition.copy(manager.camera.position);
    controls.enabled = false;
    hud.setGodViewActive(true);
    audio.setMood('godview');
    rampGrading(GODVIEW_EXPOSURE, GODVIEW_ATMOSPHERE, DESCEND_SECONDS);
    journey = new JourneyPlayer(
      buildJourney(manager.camera.position, earth.totalSurfaceRotationY),
      {
        onPhase: (phase) => {
          if (phase.kind === 'dwell') {
            caption.show(phase.country ?? '');
            mode.notifyTransitionComplete(); // settles on the first dwell; no-op after
          } else if (phase.kind === 'ascend') {
            caption.hide();
          } else if (phase.kind === 'ascend-quote' || phase.kind === 'hold') {
            quoteOverlay.show(quotes.next());
          }
        },
        onComplete: () => mode.requestExit(),
      },
    );
  });

  mode.on('exitStart', () => {
    journey?.stop();
    journey = null;
    caption.hide();
    quoteOverlay.hide();
    audio.setMood('exploring');
    rampGrading(1.0, ATMOSPHERE_BASE_INTENSITY, RETURN_SECONDS);
    transition.flyTo(restorePosition, RETURN_SECONDS, () => mode.notifyTransitionComplete());
  });

  mode.on('returned', () => {
    controls.enabled = true;
    hud.setGodViewActive(false);
  });
```

(The old `mode.on('settled', …)` handler is deleted — quotes now ride the journey's beats.)

In the frame loop, add journey playback before `transition.update(dt)`:

```ts
  manager.onUpdate((dt) => {
    earth.update(dt);
    if (journey) {
      const pos = journey.update(dt);
      if (pos) {
        manager.camera.position.copy(pos);
        manager.camera.lookAt(0, 0, 0);
      }
    }
    transition.update(dt);
    for (let i = gradingTweens.length - 1; i >= 0; i--) {
      if (gradingTweens[i].update(dt)) gradingTweens.splice(i, 1);
    }
    // OrbitControls.update() repositions the camera, so it must not run
    // while a flight or GodView owns it.
    if (mode.state === 'exploring') controls.update();
  });
```

Note the ordering guarantee: when the journey completes, `onComplete → mode.requestExit() → exitStart` runs *inside* `journey.update(dt)`, which nulls `journey` and starts the return flight from the camera's current position — the local `pos` still applies the final hold position that same frame, and `transition.update(dt)` takes over next frame. No gap, no fight over the camera.

- [ ] **Step 4: Type-check and run the full suite**

Run: `npm run build`
Expected: clean `tsc --noEmit` + successful Vite build.
Run: `npm test`
Expected: all suites PASS.

- [ ] **Step 5: Commit**

```bash
git add src/main.ts src/godview/quotes.ts src/camera/GodViewTransition.ts tests/GodViewTransition.test.ts
git commit -m "feat: GodView journey — flyover, ascent quotes, auto-return wiring"
```

---

### Task 7: Browser verification + docs

**Files:**
- Modify: `CLAUDE.md` (Architecture → point 1, and the GodView description)
- Modify: `docs/plans/2026-07-03-godview-journey-design.md` (status line)

- [ ] **Step 1: Verify in the browser**

Run: `npm run dev`, open the served URL, click Begin, then **Turn on GodView**, and check:

1. Camera descends (~10 s) and arrives low over Australia — **the country under the camera matches the caption**. If the caption names Australia but the camera hovers over ocean far from it, the texture longitude offset is wrong: adjust the `+ 180` in `latLonToWorld` (try `0` or `-180`), re-run `npm test`, re-check.
2. Captions appear in order: AUSTRALIA → CHINA → JAPAN → UNITED STATES, fading between.
3. Long pull-back follows; a quote fades in mid-ascent; captions are gone.
4. At the far hold, Earth is a small dot; the Sagan quote shows (first activation).
5. The journey auto-returns to the exact pre-journey view; drag control resumes.
6. ESC during the descend (first 10 s) aborts and glides home. Tap/click mid-ascend does the same.
7. No console errors; frame rate stays smooth throughout.

- [ ] **Step 2: Update CLAUDE.md**

In CLAUDE.md's Architecture section, rewrite point 1 (Camera) to describe the journey:

```markdown
1. **Camera** — in godview, `src/godview/journey.ts` plays a keyframe journey (`buildJourney` + `JourneyPlayer`): descend to skim altitude, fly over the `TOUR_COUNTRIES` roster (waypoints use the Earth's rotation predicted at arrival time — always `earth.totalSurfaceRotationY`, which includes the random per-visit offset), then a radial pull-back to a "pale blue dot" hold at radius 55, auto-returning home via `GodViewTransition.flyTo` + `sphericalLerp` (slerp direction, lerp radius — never through the globe). `ExploreControls` (OrbitControls) is disabled during flights; critically, `controls.update()` must NOT be called outside the `exploring` state because OrbitControls repositions the camera every update.
```

Also update the product description sentence ("presses a **GodView** button that shifts the whole experience into an awe moment") to mention the journey:

```markdown
A free, browser-based experience that triggers the "Overview Effect": the visitor **freely explores Earth from orbit**, then presses a **GodView** button that plays a ~90 s cinematic journey — down over named countries, then out until Earth is a pale blue dot — before returning them home.
```

- [ ] **Step 3: Mark the design doc implemented**

In `docs/plans/2026-07-03-godview-journey-design.md`, change the Status line to:

```markdown
**Status:** Implemented
```

- [ ] **Step 4: Final full verification**

Run: `npm test` — all suites PASS.
Run: `npm run build` — clean.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md docs/plans/2026-07-03-godview-journey-design.md
git commit -m "docs: GodView journey — CLAUDE.md architecture + design status"
```
