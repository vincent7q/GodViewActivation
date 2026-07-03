# Earth Clarity (8K) + Solar-System Finale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sharpen Earth at skim altitude (anisotropy everywhere + progressive 8K day map on capable desktops) and add a solar-system "reveal" beat to the journey — Sun glare and seven planets entering the frame while Sagan's dot quote shows.

**Architecture:** The reveal is one more keyframe phase in `journey.ts`, now with an optional per-phase look-target (the camera stops staring at the origin and swings toward the Sun). A pure `planetLayout.ts` computes artistic positions from `SUN_DIRECTION`; `SolarSystem.ts` is untested rendering glue (unlit textured spheres + additive glow sprite) faded in/out by Tweens. Earth clarity is a constructor-level anisotropy setting plus a background `upgradeDayMap()` hot-swap.

**Tech Stack:** TypeScript, Three.js, Vitest (Node), plain DOM/CSS. No new dependencies.

## Global Constraints

- Node 20.17 toolchain: Vite 6, Vitest 3 — do not bump majors.
- Logic TDD'd in `tests/` (Node); rendering/Web Audio/UI glue browser-verified.
- Startup must still load only the 2K set — <3 s first paint on 4G holds; the 8K map arrives in the background, desktop-only.
- No loading indicators for the 8K swap (no progress UI in the experience).
- `SUN_DIRECTION` (`src/scene/Lighting.ts`) stays the single lighting truth: the sun sprite sits on that axis and is NOT a light source.
- Downloads were approved in the design review: solarsystemscope.com, CC BY 4.0.
- Commit after each green cycle; messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## Reference: current interfaces consumed

- `buildJourney(startPosition, surfaceRotationY): JourneyPhase[]` and `JourneyPlayer` in `src/godview/journey.ts`; phases end `…'ascend-quote', 'hold'`; `HOLD_SECONDS = 15`.
- `GodViewTransition.flyTo(target, duration, onComplete?)` hard-looks at the origin every frame.
- `QUOTES[1]` is currently Carl Sagan's dot quote; `main.ts` shows `quotes.next()` on `'ascend-quote'` AND `'hold'`.
- `Earth` constructor: `new Earth(segments)`; textures applied in `applyTextures`; `detectQuality()` returns `{sphereSegments, maxPixelRatio, starCount}`.

---

### Task 1: Assets — download textures, update attribution

**Files:**
- Create: `public/textures/8k_earth_daymap.jpg`, `public/textures/2k_sun.jpg`, `public/textures/2k_mercury.jpg`, `public/textures/2k_venus_atmosphere.jpg`, `public/textures/2k_mars.jpg`, `public/textures/2k_jupiter.jpg`, `public/textures/2k_saturn.jpg`, `public/textures/2k_saturn_ring_alpha.png`, `public/textures/2k_uranus.jpg`, `public/textures/2k_neptune.jpg`
- Modify: `README.md` (attribution line)

- [ ] **Step 1: Download** (PowerShell; run from repo root)

```powershell
$files = @('8k_earth_daymap.jpg','2k_sun.jpg','2k_mercury.jpg','2k_venus_atmosphere.jpg','2k_mars.jpg','2k_jupiter.jpg','2k_saturn.jpg','2k_saturn_ring_alpha.png','2k_uranus.jpg','2k_neptune.jpg')
foreach ($f in $files) { curl.exe -sL -o "public/textures/$f" "https://www.solarsystemscope.com/textures/download/$f" }
Get-ChildItem public/textures | Select-Object Name, Length
```

Expected: ten new files; `8k_earth_daymap.jpg` ≈ 10–15 MB, planet maps ≈ 0.1–2 MB each. **Sanity-check each file is a real image (Length > 20 KB — an HTML error page is smaller) and total `public/textures` stays well under 50 MB.** If any download fails, stop and report.

- [ ] **Step 2: Update the README attribution**

Find the Solar System Scope attribution line in `README.md` and extend it to say the set includes the 8K Earth day map and 2K Sun/planet maps (same CC BY 4.0 license, same source link). Keep the existing wording style.

- [ ] **Step 3: Commit**

```bash
git add public/textures README.md
git commit -m "feat: 8K Earth day map + sun/planet texture set (CC BY 4.0)"
```

---

### Task 2: Quotes — Sagan becomes the reveal's fixed line

**Files:**
- Modify: `src/godview/quotes.ts`
- Test: `tests/quotes.test.ts`

**Interfaces:**
- Produces: `REVEAL_QUOTE: Quote` (the Sagan dot quote). `QUOTES` no longer contains Sagan (4 quotes remain).

- [ ] **Step 1: Write the failing test** — append to `tests/quotes.test.ts` (add `REVEAL_QUOTE` to the import from `'../src/godview/quotes'`):

```ts
describe('REVEAL_QUOTE', () => {
  test('is Sagan’s dot quote, reserved for the reveal beat', () => {
    expect(REVEAL_QUOTE.author).toBe('Carl Sagan');
    expect(REVEAL_QUOTE.text).toContain('Look again at that dot');
  });

  test('is not also in the rotation', () => {
    expect(QUOTES.some((q) => q.text === REVEAL_QUOTE.text)).toBe(false);
  });
});
```

- [ ] **Step 2: Run** `npx vitest run tests/quotes.test.ts` — Expected: FAIL (`REVEAL_QUOTE` not exported).

- [ ] **Step 3: Implement** — in `src/godview/quotes.ts`, remove the Sagan entry from `QUOTES` (leaving Mitchell "jewel", Mitchell "politics", Anders, Leonov — 4 quotes) and add below the array:

```ts
// The reveal beat's dedicated line — always this one, never rotated.
export const REVEAL_QUOTE: Quote = {
  text: 'Look again at that dot. That’s here. That’s home. That’s us.',
  author: 'Carl Sagan',
};
```

Also update the comment above `QUOTES` to:

```ts
// Rotation feeds the mid-ascend beat across repeat journeys. The reveal
// beat has its own fixed line (REVEAL_QUOTE).
```

- [ ] **Step 4: Run** `npx vitest run tests/quotes.test.ts` — Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/godview/quotes.ts tests/quotes.test.ts
git commit -m "feat: reserve Sagan's dot quote for the reveal beat"
```

---

### Task 3: Journey — reveal phase + aspect-aware look targets

**Files:**
- Modify: `src/godview/journey.ts`
- Test: `tests/journey.test.ts`

**Interfaces:**
- Consumes: `SUN_DIRECTION` from `src/scene/Lighting.ts`.
- Produces: constants `HOLD_SECONDS = 8` (was 15), `REVEAL_SECONDS = 22`, `REVEAL_RADIUS = 250`; `JourneyPhaseKind` gains `'reveal'`; `JourneyPhase` gains optional `lookTo?: THREE.Vector3`; `buildJourney(startPosition, surfaceRotationY, aspect: number)` (new third param); `computeRevealPosition(): THREE.Vector3`; `computeRevealLook(aspect: number): THREE.Vector3`; `JourneyPlayer` gains `get lookTarget(): THREE.Vector3` (origin except during look-to phases, eased).

Framing math (verified): camera dir = `normalize(cross(SUN_DIRECTION, +Y) + 0.18·Y)` at radius 250; looking at `SUN_DIRECTION·120`, Earth sits ~26° off the view axis and a sun sprite at `SUN_DIRECTION·350` sits ~30° off — both inside a landscape half-horizontal FOV of ~39°. Portrait can't fit both (half-hfov ~13°), so portrait looks at `SUN_DIRECTION·35`: Earth stays framed and the sun's glow bleeds in from the edge.

- [ ] **Step 1: Update existing tests + add new** — in `tests/journey.test.ts`:

Add to the journey import: `REVEAL_RADIUS, computeRevealLook, computeRevealPosition` (only names the tests actually use — the tsconfig is strict about unused imports). Add to the Lighting import block: `import { SUN_DIRECTION } from '../src/scene/Lighting';`

Change `const phases = buildJourney(START, 0.5);` to `const phases = buildJourney(START, 0.5, 16 / 9);` — and every other `buildJourney(START, x)` call in the file gets `, 16 / 9` appended.

In the beat-sequence test, the expected array becomes `[..., 'ascend', 'ascend-quote', 'hold', 'reveal']` (append `'reveal'`). In the JourneyPlayer order test, append `'reveal'` likewise, and change `drive(player, 90)` to `drive(player, 105)` with the comment `// total outbound is 97s`. In the "ends exactly at the hold position" test, rename to `'ends exactly at the reveal vantage'` (assertion already compares against the last phase — no other change). In the skim/hold-altitude test, `const hold = phases[phases.length - 1];` becomes `const hold = phases[phases.length - 2];`.

Append new tests:

```ts
describe('reveal phase', () => {
  const phases = buildJourney(START, 0.5, 16 / 9);
  const reveal = phases[phases.length - 1];

  test('flies to the reveal vantage, continuous with the hold', () => {
    expect(reveal.kind).toBe('reveal');
    expect(reveal.to.length()).toBeCloseTo(REVEAL_RADIUS);
    expect(reveal.from.distanceTo(phases[phases.length - 2].to)).toBeLessThan(1e-6);
  });

  test('frames Earth and the sun axis on landscape screens', () => {
    const cam = computeRevealPosition();
    const view = computeRevealLook(16 / 9).clone().sub(cam);
    const toEarth = cam.clone().negate();
    const toSun = SUN_DIRECTION.clone().multiplyScalar(350).sub(cam);
    expect(view.angleTo(toEarth)).toBeLessThan(THREE.MathUtils.degToRad(35));
    expect(view.angleTo(toSun)).toBeLessThan(THREE.MathUtils.degToRad(35));
  });

  test('portrait screens keep the look target near Earth', () => {
    const portrait = computeRevealLook(9 / 16);
    const landscape = computeRevealLook(16 / 9);
    expect(portrait.length()).toBeLessThan(landscape.length());
    // Both sit on the sun axis.
    expect(portrait.clone().normalize().distanceTo(SUN_DIRECTION)).toBeLessThan(1e-6);
    expect(landscape.clone().normalize().distanceTo(SUN_DIRECTION)).toBeLessThan(1e-6);
  });

  test('the player eases its look target from the origin to the reveal look', () => {
    const player = new JourneyPlayer(buildJourney(START, 0, 16 / 9));
    expect(player.lookTarget.length()).toBe(0);
    drive(player, 80); // into the reveal (outbound total 97s; reveal starts at 75s)
    const mid = player.lookTarget.length();
    expect(mid).toBeGreaterThan(0);
    drive(player, 30); // finish
    expect(player.lookTarget.distanceTo(computeRevealLook(16 / 9))).toBeLessThan(1e-6);
  });
});
```

- [ ] **Step 2: Run** `npx vitest run tests/journey.test.ts` — Expected: FAIL (missing exports / wrong arity / sequence mismatch).

- [ ] **Step 3: Implement** — in `src/godview/journey.ts`:

Add import: `import { SUN_DIRECTION } from '../scene/Lighting';`

Constants: change `HOLD_SECONDS` to `8`; add:

```ts
export const REVEAL_SECONDS = 22;
export const REVEAL_RADIUS = 250;
const REVEAL_LOOK_LANDSCAPE = 120;
const REVEAL_LOOK_PORTRAIT = 35;
const UP = new THREE.Vector3(0, 1, 0);
```

Type/interface: `JourneyPhaseKind` gains `| 'reveal'`; `JourneyPhase` gains:

```ts
  /** Optional: the camera's look target eases here during this phase (default: keep looking at the origin). */
  lookTo?: THREE.Vector3;
```

New pure functions:

```ts
// Side-on vantage, slightly lifted: Earth low-center, sun glare off-axis,
// the planet arc strung between them.
export function computeRevealPosition(): THREE.Vector3 {
  return new THREE.Vector3()
    .crossVectors(SUN_DIRECTION, UP)
    .normalize()
    .addScaledVector(UP, 0.18)
    .normalize()
    .multiplyScalar(REVEAL_RADIUS);
}

// Landscape frames Earth AND the sun; portrait can't fit both (half-hfov
// ~13°), so it stays near Earth and lets the sun's glow bleed in.
export function computeRevealLook(aspect: number): THREE.Vector3 {
  const distance = aspect >= 1 ? REVEAL_LOOK_LANDSCAPE : REVEAL_LOOK_PORTRAIT;
  return SUN_DIRECTION.clone().multiplyScalar(distance);
}
```

In `buildJourney`, change the signature to `(startPosition: THREE.Vector3, surfaceRotationY: number, aspect: number)` and change `add` to accept extras:

```ts
  const add = (
    kind: JourneyPhaseKind,
    duration: number,
    to: THREE.Vector3,
    extras: { country?: string; lookTo?: THREE.Vector3 } = {},
  ): void => {
    const phase: JourneyPhase = { kind, duration, from: cursor.clone(), to: to.clone() };
    if (extras.country !== undefined) phase.country = extras.country;
    if (extras.lookTo !== undefined) phase.lookTo = extras.lookTo.clone();
    phases.push(phase);
    cursor = to.clone();
    elapsed += duration;
  };
```

Update the dwell call to `add('dwell', DWELL_SECONDS, waypoint, { country: name });` and append after the hold:

```ts
  add('reveal', REVEAL_SECONDS, computeRevealPosition(), { lookTo: computeRevealLook(aspect) });
```

In `JourneyPlayer`, add fields and getter:

```ts
  private readonly look = new THREE.Vector3(0, 0, 0);
  private readonly lookStart = new THREE.Vector3(0, 0, 0);

  /** Where the camera should look this frame (origin except look-to phases). */
  get lookTarget(): THREE.Vector3 {
    return this.look;
  }
```

In `enterPhase`, first line: `this.lookStart.copy(this.look);`. In `update`, on the completion branch (before `return this.position;`) add:

```ts
        const lastLook = this.phases[this.phaseIndex].lookTo;
        if (lastLook) this.look.copy(lastLook);
```

and after the position interpolation at the bottom:

```ts
    if (phase.lookTo) this.look.lerpVectors(this.lookStart, phase.lookTo, easeInOutCubic(t));
```

- [ ] **Step 4: Run** `npx vitest run tests/journey.test.ts` — Expected: PASS (17 tests).

- [ ] **Step 5: Commit**

```bash
git add src/godview/journey.ts tests/journey.test.ts
git commit -m "feat: reveal phase with aspect-aware look targets"
```

---

### Task 4: GodViewTransition — return flight look-target blend

**Files:**
- Modify: `src/camera/GodViewTransition.ts`
- Test: `tests/GodViewTransition.test.ts`

**Interfaces:**
- Produces: `flyTo(target, duration, onComplete?, lookFrom?: THREE.Vector3)` — when `lookFrom` is given, the camera's look target eases from it back to the origin over the flight (prevents a snap when exiting the reveal).

- [ ] **Step 1: Write the failing test** — append inside the `GodViewTransition` describe block:

```ts
  test('blends the look target from lookFrom back to the origin', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, 3);

    const transition = new GodViewTransition(camera);
    transition.flyTo(target, 6, undefined, new THREE.Vector3(0, 0, 100));
    transition.update(3); // halfway (eased t = 0.5 → look at (0,0,50))

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const toBlended = new THREE.Vector3(0, 0, 50).sub(camera.position).normalize();
    expect(forward.dot(toBlended)).toBeGreaterThan(0.999);

    for (let i = 0; i < 70; i++) transition.update(0.1); // finish
    camera.getWorldDirection(forward);
    const toOrigin = camera.position.clone().negate().normalize();
    expect(forward.dot(toOrigin)).toBeGreaterThan(0.999);
  });
```

- [ ] **Step 2: Run** `npx vitest run tests/GodViewTransition.test.ts` — Expected: FAIL (mid-flight forward still points at the origin).

- [ ] **Step 3: Implement** — in `GodViewTransition`, add fields and change `flyTo`:

```ts
  private readonly lookFrom = new THREE.Vector3();
  private hasLookFrom = false;
  private readonly lookNow = new THREE.Vector3();
```

```ts
  flyTo(
    target: THREE.Vector3,
    duration: number,
    onComplete?: () => void,
    lookFrom?: THREE.Vector3,
  ): void {
    this.from.copy(this.camera.position);
    this.to.copy(target);
    this.hasLookFrom = lookFrom !== undefined;
    if (lookFrom) this.lookFrom.copy(lookFrom);
    this.tween = new Tween(
      duration,
      (v) => {
        this.camera.position.copy(sphericalLerp(this.from, this.to, v));
        if (this.hasLookFrom) {
          this.lookNow.copy(this.lookFrom).multiplyScalar(1 - v);
          this.camera.lookAt(this.lookNow);
        } else {
          this.camera.lookAt(0, 0, 0);
        }
      },
      {
        onComplete: () => {
          this.tween = null;
          onComplete?.();
        },
      },
    );
  }
```

- [ ] **Step 4: Run** `npx vitest run tests/GodViewTransition.test.ts` — Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/camera/GodViewTransition.ts tests/GodViewTransition.test.ts
git commit -m "feat: return flight blends the look target back to Earth"
```

---

### Task 5: Planet layout — pure composition math

**Files:**
- Create: `src/scene/planetLayout.ts`
- Test: `tests/planetLayout.test.ts`

**Interfaces:**
- Consumes: `SUN_DIRECTION`; (test only) `computeRevealPosition`, `computeRevealLook` from Task 3.
- Produces: `PlanetSpec {name, texture, radius, distance, lateral, vertical}`, `PLANETS: PlanetSpec[]` (Mercury→Neptune, 7 entries), `SUN_DISTANCE = 350`, `SUN_CORE_RADIUS = 12`, `planetPosition(spec: PlanetSpec): THREE.Vector3`.

- [ ] **Step 1: Write the failing test** — create `tests/planetLayout.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import * as THREE from 'three';
import {
  PLANETS,
  SUN_DISTANCE,
  planetPosition,
} from '../src/scene/planetLayout';
import { computeRevealLook, computeRevealPosition } from '../src/godview/journey';
import { SUN_DIRECTION } from '../src/scene/Lighting';

describe('PLANETS', () => {
  test('lists the seven bodies sunward-out of the arc', () => {
    expect(PLANETS.map((p) => p.name)).toEqual([
      'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
    ]);
  });
});

describe('planetPosition', () => {
  const positions = PLANETS.map((p) => planetPosition(p));

  test('places each planet at its distance along the sun axis', () => {
    PLANETS.forEach((spec, i) => {
      expect(positions[i].dot(SUN_DIRECTION)).toBeCloseTo(spec.distance);
    });
  });

  test('keeps the whole arc between Earth and the sun sprite', () => {
    for (const pos of positions) {
      expect(pos.length()).toBeGreaterThan(40);
      expect(pos.length()).toBeLessThan(SUN_DISTANCE);
    }
  });

  test('every planet is inside the landscape reveal frame', () => {
    const cam = computeRevealPosition();
    const view = computeRevealLook(16 / 9).clone().sub(cam);
    for (const pos of positions) {
      const toPlanet = pos.clone().sub(cam);
      expect(view.angleTo(toPlanet)).toBeLessThan(THREE.MathUtils.degToRad(38));
    }
  });

  test('no two planets overlap', () => {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const minGap = (PLANETS[i].radius + PLANETS[j].radius) * 2;
        expect(positions[i].distanceTo(positions[j])).toBeGreaterThan(minGap);
      }
    }
  });
});
```

- [ ] **Step 2: Run** `npx vitest run tests/planetLayout.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Implement** — create `src/scene/planetLayout.ts`:

```ts
import * as THREE from 'three';
import { SUN_DIRECTION } from './Lighting';

export interface PlanetSpec {
  name: string;
  texture: string;
  /** Visual radius — composed for the shot, not to scale. */
  radius: number;
  /** Distance from Earth along the sun axis. */
  distance: number;
  /** Sideways / vertical scatter so the arc doesn't read as a ruler. */
  lateral: number;
  vertical: number;
}

// Artistic lineup between Earth and the sun sprite — see the design doc.
export const PLANETS: PlanetSpec[] = [
  { name: 'Mercury', texture: '2k_mercury.jpg', radius: 1.2, distance: 60, lateral: -8, vertical: -3 },
  { name: 'Venus', texture: '2k_venus_atmosphere.jpg', radius: 2.0, distance: 95, lateral: 7, vertical: 2 },
  { name: 'Mars', texture: '2k_mars.jpg', radius: 1.6, distance: 130, lateral: -10, vertical: 4 },
  { name: 'Jupiter', texture: '2k_jupiter.jpg', radius: 6.5, distance: 170, lateral: 12, vertical: -5 },
  { name: 'Saturn', texture: '2k_saturn.jpg', radius: 5.5, distance: 210, lateral: -14, vertical: 6 },
  { name: 'Uranus', texture: '2k_uranus.jpg', radius: 3.0, distance: 250, lateral: 10, vertical: -6 },
  { name: 'Neptune', texture: '2k_neptune.jpg', radius: 3.0, distance: 290, lateral: -9, vertical: 3 },
];

export const SUN_DISTANCE = 350;
export const SUN_CORE_RADIUS = 12;

const UP = new THREE.Vector3(0, 1, 0);
const LATERAL = new THREE.Vector3().crossVectors(SUN_DIRECTION, UP).normalize();
const VERTICAL = new THREE.Vector3().crossVectors(LATERAL, SUN_DIRECTION).normalize();

export function planetPosition(spec: PlanetSpec): THREE.Vector3 {
  return SUN_DIRECTION.clone()
    .multiplyScalar(spec.distance)
    .addScaledVector(LATERAL, spec.lateral)
    .addScaledVector(VERTICAL, spec.vertical);
}
```

- [ ] **Step 4: Run** `npx vitest run tests/planetLayout.test.ts` — Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/scene/planetLayout.ts tests/planetLayout.test.ts
git commit -m "feat: artistic planet layout math for the reveal"
```

---

### Task 6: SolarSystem group + Earth clarity (rendering glue)

**Files:**
- Create: `src/scene/SolarSystem.ts`
- Modify: `src/scene/Earth.ts` (constructor, `applyTextures`, new `upgradeDayMap`)
- Modify: `src/scene/SceneManager.ts` (`QualitySettings` + `detectQuality`)

No unit tests — rendering glue, browser-verified. Type-check + suite must stay green.

**Interfaces:**
- Produces: `class SolarSystem { readonly group: THREE.Group; load(): Promise<void>; setOpacity(v: number): void; get opacity(): number }` (group starts invisible, opacity 0); `Earth` constructor becomes `(segments: number, anisotropy?: number)`; `Earth.upgradeDayMap(path: string): Promise<void>`; `QualitySettings` gains `anisotropyCap: number` (mobile 8, desktop 16) and `highResDayMap: boolean` (`!isMobile`).

- [ ] **Step 1: Create `src/scene/SolarSystem.ts`**

```ts
import * as THREE from 'three';
import { PLANETS, SUN_CORE_RADIUS, SUN_DISTANCE, planetPosition } from './planetLayout';
import { SUN_DIRECTION } from './Lighting';

const SATURN_RING_TILT = THREE.MathUtils.degToRad(63);
const GLOW_SCALE = 90;

// The reveal's scenery: unlit textured spheres (the planets sit between
// Earth and the sun, so their lit faces point away from the camera —
// physically they'd be silhouettes; MeshBasicMaterial keeps them readable)
// plus an additive glow sprite on the sun. Not a light source: the
// DirectionalLight in Lighting.ts stays the single lighting truth.
export class SolarSystem {
  readonly group = new THREE.Group();

  private readonly materials: Array<THREE.MeshBasicMaterial | THREE.SpriteMaterial> = [];
  private readonly texturedMaterials = new Map<string, THREE.MeshBasicMaterial>();
  private readonly loader = new THREE.TextureLoader();
  private currentOpacity = 0;

  constructor() {
    this.group.visible = false;

    const sunPosition = SUN_DIRECTION.clone().multiplyScalar(SUN_DISTANCE);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_CORE_RADIUS, 32, 32),
      this.track('2k_sun.jpg', new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })),
    );
    core.position.copy(sunPosition);
    this.group.add(core);

    const glowMaterial = new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.materials.push(glowMaterial);
    const glow = new THREE.Sprite(glowMaterial);
    glow.position.copy(sunPosition);
    glow.scale.setScalar(GLOW_SCALE);
    this.group.add(glow);

    for (const spec of PLANETS) {
      const material = this.track(
        spec.texture,
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
      );
      const planet = new THREE.Mesh(new THREE.SphereGeometry(spec.radius, 48, 48), material);
      planet.position.copy(planetPosition(spec));
      this.group.add(planet);

      if (spec.name === 'Saturn') {
        const ringMaterial = this.track(
          '2k_saturn_ring_alpha.png',
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        const ring = new THREE.Mesh(makeRingGeometry(spec.radius * 1.4, spec.radius * 2.3), ringMaterial);
        ring.position.copy(planet.position);
        ring.rotation.x = SATURN_RING_TILT;
        this.group.add(ring);
      }
    }
  }

  /** Fetch all textures; call once (non-blocking) after the Earth loads. */
  async load(): Promise<void> {
    await Promise.all(
      [...this.texturedMaterials.entries()].map(async ([file, material]) => {
        const texture = await this.loader.loadAsync(`/textures/${file}`);
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.needsUpdate = true;
      }),
    );
  }

  setOpacity(value: number): void {
    this.currentOpacity = value;
    for (const material of this.materials) material.opacity = value;
    this.group.visible = value > 0.001;
  }

  get opacity(): number {
    return this.currentOpacity;
  }

  private track(file: string, material: THREE.MeshBasicMaterial): THREE.MeshBasicMaterial {
    this.materials.push(material);
    this.texturedMaterials.set(file, material);
    return material;
  }
}

// Radial-gradient glare, generated once — no asset needed.
function makeGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 244, 214, 1)');
  gradient.addColorStop(0.25, 'rgba(255, 214, 140, 0.55)');
  gradient.addColorStop(0.6, 'rgba(255, 176, 90, 0.14)');
  gradient.addColorStop(1, 'rgba(255, 160, 70, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// RingGeometry's default UVs are planar; remap u to the radial span so the
// 1D ring strip texture reads as concentric bands.
function makeRingGeometry(inner: number, outer: number): THREE.RingGeometry {
  const geometry = new THREE.RingGeometry(inner, outer, 96);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const v = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    uv.setXY(i, (v.length() - inner) / (outer - inner), 1);
  }
  return geometry;
}
```

- [ ] **Step 2: Earth clarity** — in `src/scene/Earth.ts`:

Constructor signature: `constructor(segments: number, private readonly anisotropy = 1) {`.

In `applyTextures` (it receives the three textures), set on each of the three textures before assigning: `texture.anisotropy = this.anisotropy;` (three lines, one per texture — match however the method names its parameters).

Add after `totalSurfaceRotationY`:

```ts
  /** Progressive clarity: hot-swap the day map (e.g. the 8K variant) once
   *  it has loaded in the background. Startup always uses the 2K set. */
  async upgradeDayMap(path: string): Promise<void> {
    const texture = await this.loadColorTexture(path);
    texture.anisotropy = this.anisotropy;
    const previous = this.surfaceMaterial.uniforms.uDayMap.value as THREE.Texture | null;
    this.surfaceMaterial.uniforms.uDayMap.value = texture;
    previous?.dispose();
  }
```

- [ ] **Step 3: Quality settings** — in `src/scene/SceneManager.ts`:

```ts
export interface QualitySettings {
  sphereSegments: number;
  maxPixelRatio: number;
  starCount: number;
  anisotropyCap: number;
  highResDayMap: boolean;
}

export function detectQuality(): QualitySettings {
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
  return isMobile
    ? { sphereSegments: 64, maxPixelRatio: 1.5, starCount: 4000, anisotropyCap: 8, highResDayMap: false }
    : { sphereSegments: 128, maxPixelRatio: 2, starCount: 8000, anisotropyCap: 16, highResDayMap: true };
}
```

- [ ] **Step 4: Verify** — `npm run build` clean, `npm test` all pass (nothing imports the new pieces yet; Earth's new param defaults keep existing usage valid).

- [ ] **Step 5: Commit**

```bash
git add src/scene/SolarSystem.ts src/scene/Earth.ts src/scene/SceneManager.ts
git commit -m "feat: solar-system scenery group + anisotropy/8K-swap plumbing"
```

---

### Task 7: main.ts — wire the reveal and the clarity upgrade

**Files:**
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: everything from Tasks 2–6.

- [ ] **Step 1: Imports** — add/change in `src/main.ts`:

```ts
import { QUOTES, QuoteRotation, REVEAL_QUOTE } from './godview/quotes';
import { SolarSystem } from './scene/SolarSystem';
```

- [ ] **Step 2: Construction** — after `const earth = new Earth(...)` block, the Earth construction becomes anisotropy-aware and the solar system joins the scene. Replace:

```ts
  const earth = new Earth(quality.sphereSegments);
  manager.scene.add(earth.group);
  await earth.load();
```

with:

```ts
  const anisotropy = Math.min(
    manager.renderer.capabilities.getMaxAnisotropy(),
    quality.anisotropyCap,
  );
  const earth = new Earth(quality.sphereSegments, anisotropy);
  manager.scene.add(earth.group);
  await earth.load();

  const solar = new SolarSystem();
  manager.scene.add(solar.group);
  void solar.load(); // in the background — needed ~100s in, at the reveal

  if (quality.highResDayMap && manager.renderer.capabilities.maxTextureSize >= 8192) {
    void earth.upgradeDayMap('/textures/8k_earth_daymap.jpg');
  }
```

- [ ] **Step 3: Solar fade helper** — after the `rampGrading` helper, add:

```ts
  const fadeSolar = (to: number, seconds: number): void => {
    const from = solar.opacity;
    gradingTweens.push(
      new Tween(seconds, (v) => solar.setOpacity(THREE.MathUtils.lerp(from, to, v))),
    );
  };
```

Note: `rampGrading` clears `gradingTweens` before pushing, so in `exitStart` call `rampGrading(...)` FIRST, then `fadeSolar(...)` — that order keeps both alive.

- [ ] **Step 4: Journey wiring** — in the `enterStart` handler, `buildJourney` gains the aspect argument:

```ts
      buildJourney(manager.camera.position, earth.totalSurfaceRotationY, manager.camera.aspect),
```

and the `onPhase` callback becomes:

```ts
        onPhase: (phase) => {
          if (phase.kind === 'dwell') {
            caption.show(phase.country ?? '');
            mode.notifyTransitionComplete(); // settles on the first dwell; no-op after
          } else if (phase.kind === 'ascend') {
            caption.hide();
          } else if (phase.kind === 'ascend-quote') {
            quoteOverlay.show(quotes.next());
          } else if (phase.kind === 'reveal') {
            fadeSolar(1, 4);
            quoteOverlay.show(REVEAL_QUOTE);
          }
        },
```

(The `'hold'` branch is gone — the dot hold is silent now.)

- [ ] **Step 5: Exit wiring** — replace the `exitStart` handler with:

```ts
  mode.on('exitStart', () => {
    const lookFrom = journey?.lookTarget.clone();
    journey?.stop();
    journey = null;
    caption.hide();
    quoteOverlay.hide();
    audio.setMood('exploring');
    rampGrading(1.0, ATMOSPHERE_BASE_INTENSITY, RETURN_SECONDS);
    fadeSolar(0, 3);
    transition.flyTo(restorePosition, RETURN_SECONDS, () => mode.notifyTransitionComplete(), lookFrom);
  });
```

- [ ] **Step 6: Frame loop** — the journey block must use the player's look target (and stay safe when `onComplete` nulls `journey` mid-update):

```ts
    if (journey) {
      const player = journey;
      const pos = player.update(dt);
      if (pos) {
        manager.camera.position.copy(pos);
        manager.camera.lookAt(player.lookTarget);
      }
    }
```

- [ ] **Step 7: Verify** — `npm run build` clean; `npm test` all pass.

- [ ] **Step 8: Commit**

```bash
git add src/main.ts
git commit -m "feat: wire solar reveal + progressive 8K day map"
```

---

### Task 8: Docs + browser verification

**Files:**
- Modify: `CLAUDE.md` (texture policy line), `docs/plans/2026-07-03-clarity-and-solar-system-design.md` (status)

- [ ] **Step 1: CLAUDE.md** — replace the texture-policy sentence in Assets & Licensing:

Old: `Textures are the 2K set only (~1.6MB) — a deliberate product decision; don't add higher resolutions without asking.`

New: `Startup loads the 2K set (fast first paint, and the only set mobile gets); capable desktops then hot-swap the 8K day map in the background (Earth.upgradeDayMap). Sun/planet maps are 2K. Total assets must stay <50MB.`

Remove the now-redundant trailing sentence `Total assets must stay <50MB.` if it would appear twice.

- [ ] **Step 2: Design doc status** — set the Status line of `docs/plans/2026-07-03-clarity-and-solar-system-design.md` to `**Status:** Implemented`.

- [ ] **Step 3: Final verification** — `npm test` (all pass) and `npm run build` (clean).

- [ ] **Step 4: Browser checklist** (dev server: `npm run dev`) — hand to the product owner if browser automation is unavailable:

1. Earth visibly sharpens a few seconds after load on desktop (8K swap) and looks crisper at skim altitude (anisotropy).
2. Run the journey: dot hold is short and silent; then the view swings — Sun glare and the planet arc fade in, Sagan quote shows.
3. Exit during the reveal: no camera snap (look target blends home), planets fade out.
4. Repeat journey: mid-ascend quote rotates; the reveal always shows Sagan.
5. No console errors; smooth frame rate.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md docs/plans/2026-07-03-clarity-and-solar-system-design.md
git commit -m "docs: texture policy + solar finale status"
```
