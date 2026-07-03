# GodView Journey — Design (pending product-owner review)

**Date:** July 3, 2026
**Status:** Draft — awaiting Vincent's review; assumptions below need confirmation
**Supersedes:** the "fly to hero vantage and hold" GodView sequence in
`docs/plans/2026-07-02-godview-v2-design.md` (architecture there still stands)

## Why

Product-owner feedback on V2: pressing GodView produces a ~6s flight to a fixed
vantage and then a frozen scene. The core goal of the product — activating the
Overview Effect, making people feel how small humanity is against the universe —
isn't delivered by a static frame. GodView must become a **journey**: a
cinematic flight in toward Earth (human scale) and away from it (pale blue
dot), told by the camera.

## The Journey (round-trip arc)

Pressing GodView plays a scripted camera flight in five beats. Total ≈ 93 s.
No progress bar, no timer on screen (product constraint); the user can leave at
any moment with ESC / tap / Return button, which glides them home gracefully.

| # | Beat | ~Duration | Camera | What the user feels |
|---|------|-----------|--------|---------------------|
| 1 | **Descend** | 10 s | From wherever they were, spherical-fly down to skim altitude (radius ≈ 1.3), arriving above the first tour country | Falling toward home |
| 2 | **Country flyover** | ~26 s | Low-orbit glide over 4 major countries in sequence — Australia → China → Japan → USA — each name fading in as a quiet caption while the camera passes over it | The human world, named — everything we know is down there |
| 3 | **Ascend** | 30 s | One long, continuously eased pull-back from radius 1.3 → 55; Earth shrinks from filling the screen to a dot; the captions stop — borders visibly dissolve. Quote #1 fades in mid-ascent | Letting go; the named world becomes one world |
| 4 | **Dot hold** | 15 s | Hold at radius 55 — Earth is a tiny pale blue dot in the starfield. Quote #2 (Sagan's "Look again at that dot…" pinned as the first in rotation for this beat) | Smallness. Silence. The point of the whole product |
| 5 | **Return** | 12 s | Glide back to the exact pre-journey camera position; grading and audio ramp back; controls unlock | Coming home changed |

Total ≈ 93 s with the flyover.

### Country flyover mechanics

- **Data**: `src/godview/countries.ts` — a curated list `{name, lat, lon}` for
  the tour (Australia, China, Japan, USA in the MVP; the list is ordered to
  form a smooth northeast-then-east arc with no backtracking, and is trivially
  extendable).
- **Rotation-aware waypoints**: the Earth surface spins at
  `EARTH_ROTATION_SPEED` (0.01 rad/s ≈ 17° over the tour), so a country's
  world position is a function of time. Rotation is deterministic, so
  `buildJourney` computes each waypoint using the surface rotation **predicted
  for the arrival time** — pure math, unit-testable, no per-frame chasing.
  Helper: `latLonToWorld(lat, lon, surfaceRotationY, radius)`.
- **Captions**: new `src/ui/CountryCaption.ts` (plain DOM/CSS like
  `QuoteOverlay`) — one quiet line that fades in/out with each country. It is
  journey-only UI; it never appears during free exploration.
- Day/night is not steered: countries on the night side show their city
  lights, which serves the story rather than hurting it.

Scene support requires **no changes**: Earth radius 1, clouds at 1.008,
explore range already 1.25–60, starfield at 900, far plane 2000. Skim at 1.3
and hold at 55 sit safely inside all of these.

### Audio, grading, quotes along the journey

- **Audio**: existing `godview` mood engages at journey start (ambience swell +
  10 Hz binaural pair) and reverts on return — unchanged plumbing. *(Optional
  later: scale drone depth with camera distance; explicitly out of MVP scope.)*
- **Grading**: exposure/atmosphere ramp up during Descend exactly as today,
  ramp back during Return.
- **Quotes**: two per journey instead of one — mid-Ascend and at Dot hold —
  drawn from the existing rotation, except the Dot-hold beat prefers the Sagan
  "pale blue dot" quote on first activation. `QuoteRotation` gains nothing;
  selection order handled at the call site.

## Approaches considered

1. **Keyframe timeline player (chosen)** — a pure module describes the journey
   as an ordered list of phases `{name, duration, from, to, easing}`; a player
   maps elapsed time → camera position via the existing `sphericalLerp`, and
   emits a beat event at each phase boundary. Fully unit-testable in Node,
   matching the project's logic/rendering testing split.
2. Velocity/physics camera (accelerate away organically) — beautiful motion but
   hard to tune, hard to test deterministically, easy to overshoot. Rejected.
3. Minimal two-stop flight (hero vantage → far dot) — least work but skips the
   close pass, losing the "human scale" half of the story. Rejected.

## Architecture

New pure module **`src/godview/journey.ts`**:

- `buildJourney(startPosition: Vector3, surfaceRotationY: number): JourneyPhase[]`
  — computes the five phases from wherever the camera currently is, with
  flyover waypoints placed above each tour country using the surface rotation
  predicted at arrival time.
- `class JourneyPlayer` — `update(dt)` advances a clock, returns the camera
  position for "now" (sphericalLerp within the active phase + per-phase
  easing), fires `onPhase(name)` callbacks at boundaries, and
  `onComplete` at the end. `skipToReturn()` retargets from the current
  position to the return phase — this is what ESC/tap triggers mid-journey.

**`GodViewMode` mapping (state machine unchanged in shape):**

- `enterStart` → 'transitioning' covers beat 1 (Descend). On reaching skim,
  `notifyTransitionComplete()` → 'godview'.
- 'godview' now means "journey playing" (beats 2–4) rather than "frozen hold".
- End of Dot hold auto-triggers exit → 'returning' covers beat 5 → 'exploring'.
- One small extension: `requestExit()` also honored during 'transitioning'
  so ESC works even in the first 10 s (today it's ignored mid-flight).

`GodViewTransition.flyTo` remains for the Return beat (fly home to the saved
position); the outbound beats are owned by `JourneyPlayer`. `main.ts` swaps the
single `flyTo(hero)` call for driving the player and wiring its beat events to
quotes/audio.

## Error handling

- Toggle presses during the journey are exits (same as today's semantics).
- `skipToReturn()` from any beat must never path through the globe — it reuses
  sphericalLerp from the *current* camera position, same guarantee as today.
- Journey duration clock uses the same clamped `dt` as the rAF loop (tab
  backgrounding cannot teleport the camera).

## Testing (TDD, Node)

- `latLonToWorld`: known cities land at expected world coordinates for a given
  rotation; radius always honored.
- Waypoint prediction: a waypoint computed for arrival time t sits directly
  above its country once the surface has rotated by `EARTH_ROTATION_SPEED * t`.
- Phase boundaries: position at t=0, each boundary, and end match keyframes.
- Radius never drops below 1.25 at any sampled t (no globe clipping).
- Ascend radius is monotonically increasing.
- Beat events fire once each, in order; `onComplete` fires exactly once.
- `skipToReturn()` mid-ascend lands at the saved start position.
- State-machine extension: `requestExit` during 'transitioning'.
- Rendering/audio glue verified in the browser, per the project's testing split.

## Assumptions needing Vincent's confirmation

1. **Round-trip arc** (close pass → pale blue dot → home) rather than fly-in
   only, fly-out only, or an orbital tour. Chosen because the request said
   "fly in/from the earth" and "understand how little of human".
2. **Auto-return**: the journey ends by itself (~75 s) and returns to free
   exploration, instead of holding at the dot until the user exits.
3. **~93 s total length** (10/26/30/15/12). Tunable constants, easy to change.
4. **Cinematic (controls locked)** during the journey; ESC/tap exits at any
   time. No user steering mid-journey.
5. **Two quotes per journey** instead of one.
6. **Country intro style = flyover tour** (camera visits each country, caption
   names it) rather than globe-anchored floating labels or a passive
   "below you: X" caption. Chosen because it makes the ascend beat's
   "borders dissolve" payoff explicit.
7. **Tour roster & order**: Australia → China → Japan → USA (the countries
   Vincent named; order minimizes backtracking). Easy to extend/reorder.
