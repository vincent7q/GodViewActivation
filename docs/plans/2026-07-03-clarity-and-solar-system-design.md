# Earth Clarity (8K) + Solar-System Finale — Design (pending review)

**Date:** July 3, 2026
**Status:** Draft — awaiting Vincent's review
**Builds on:** `2026-07-03-godview-journey-design.md` (implemented)

## Why

Product-owner feedback after flying the journey:

1. Earth is not sharp enough at skim altitude. The 2K map spreads ~230 source
   pixels across the full screen width when the camera is low — visibly blurry.
   Vincent has reversed the earlier 2K-only decision: 8K is wanted.
2. The experience should include other solar-system bodies — Sun, Mercury,
   "and others" — for a stronger sense of scale.

## Part 1 — Earth clarity

Three changes, cheapest first:

1. **Anisotropic filtering** on the Earth day/night/cloud textures
   (`renderer.capabilities.getMaxAnisotropy()`, capped at 8 on mobile).
   Currently off; sharpens grazing-angle views at negligible cost. Applies to
   every quality tier immediately.
2. **8K day map, progressive swap (desktop only).** Startup is unchanged — the
   2K set still loads first so first paint stays fast. After the scene is
   running, if the GPU reports `maxTextureSize ≥ 8192` and the device is not
   mobile, fetch `8k_earth_daymap.jpg` in the background and hot-swap the
   `uDayMap` uniform when ready. No loading UI (product constraint: no
   progress indicators) — the surface simply sharpens a few seconds in.
3. **Night and cloud maps stay 2K.** Night is only prominent over the dark
   side, clouds are soft by nature; skipping their 8K variants keeps the
   asset budget honest (see Downloads below).

Mobile keeps the 2K set exclusively: common mobile GPUs cap textures at 4096,
and an 8192×4096 map costs ~180 MB of GPU memory with mipmaps.

## Part 2 — Solar-system finale ("the reveal")

**Chosen shape: the planets join the journey's story, not the free-explore
scene.** During the pale-blue-dot hold the view widens once more: the Sun's
glare enters the frame with the planets strung along a gentle arc, and Earth
becomes one small lit world among many. This is Sagan's line made literal, so
his quote moves to this beat.

Journey timeline change (was 5 beats / ~94 s, becomes 6 / ~109 s):

| # | Beat | ~Duration | Change |
|---|------|-----------|--------|
| 1 | Descend | 10 s | unchanged |
| 2 | Country flyover | ~27 s | unchanged |
| 3 | Ascend | 30 s | unchanged (rotation quote mid-ascent) |
| 4 | Dot hold | **8 s** (was 15) | silent — just the dot and the stars |
| 5 | **Reveal** (new) | **22 s** | camera glides further out and swings until the Sun and planets enter the frame; the solar-system group fades in; Sagan's "Look again at that dot…" shows here, always |
| 6 | Return | 12 s | unchanged |

### Rendering the solar system

New module `src/scene/SolarSystem.ts` — a `THREE.Group`, **invisible except
during the reveal** (opacity fades in/out via the existing `Tween`):

- **Sun**: an emissive billboard sprite (layered radial-gradient glow) placed
  along `SUN_DIRECTION` at distance ~700 (inside the 900 starfield). It is
  scenery, not a light source — the existing `DirectionalLight` and shader
  terminator remain the single lighting truth, and the sprite sits exactly on
  the axis they already use, so the scene stays self-consistent.
- **Planets**: Mercury, Venus, Mars, Jupiter, Saturn (with its ring), Uranus,
  Neptune as small textured spheres (2K Solar System Scope textures, same
  CC BY 4.0 attribution as the Earth set). Positions are **artistic, not
  ephemeris-true**: strung along an arc in the ecliptic plane between Earth
  and the Sun sprite, spaced and sized for composition (Jupiter/Saturn read
  larger, inner planets smaller). A pure `buildPlanetLayout()` function
  computes positions from `SUN_DIRECTION` so the single-source rule holds —
  and stays unit-testable (all bodies in front of the reveal camera, none
  colliding with Earth or the flight path).
- The Moon is deliberately out of scope: it would also be visible during
  ordinary exploration and is a separate feature. Noted for later.

### Journey integration

- `journey.ts` gains a `'reveal'` phase: from the hold position, spherical-fly
  to a reveal vantage (`radius ≈ 120`, direction rotated so the view axis is
  ~35° off `SUN_DIRECTION` — Earth stays centered-low in frame, Sun glare
  upper-off-center, planet arc between). Pure math + tests, like every phase.
- `main.ts` wires the phase events: `'reveal'` → fade the solar group in
  (~4 s tween) and show the fixed Sagan quote; `exitStart` → fade the group
  out. Sagan leaves the `QUOTES` rotation (it becomes the reveal's dedicated
  line); the rotation keeps feeding the mid-ascend and any repeat visits.
- State machine: no changes — reveal is one more phase inside `'godview'`.

## Downloads required (explicit sign-off)

All from **solarsystemscope.com/textures** (CC BY 4.0, already attributed in
the README; the attribution line will be extended to cover the new bodies):

| File | Approx. size |
|---|---|
| `8k_earth_daymap.jpg` | ~12 MB |
| `2k_sun.jpg` | ~1 MB |
| `2k_mercury.jpg`, `2k_venus_atmosphere.jpg`, `2k_mars.jpg` | ~0.5–1 MB each |
| `2k_jupiter.jpg`, `2k_saturn.jpg` + `2k_saturn_ring_alpha.png` | ~1 MB total-ish each |
| `2k_uranus.jpg`, `2k_neptune.jpg` | ~0.5 MB each |

Estimated total added: **~20 MB**, keeping the repo's asset budget under the
50 MB cap (currently ~1.6 MB). Approving this design approves these downloads.

## Constraint updates (CLAUDE.md)

- "2K-only textures" becomes: 2K base set for first paint and mobile, plus an
  8K day map progressively swapped in on capable desktops.
- Performance budgets unchanged: <3 s first paint on 4G still holds because
  startup still loads only the 2K set.

## Testing

- `buildPlanetLayout()`: every body in front of the reveal camera (positive
  dot with view axis), none within 2 units of the origin (Earth), none beyond
  the starfield; Saturn ring present; ordering matches the roster.
- Reveal phase: vantage radius, ~35° sun-axis angle, continuity with the hold
  position, and journey total-duration update.
- Quote change: rotation no longer contains Sagan; reveal uses the fixed line.
- Texture swap and sprite rendering: browser-verified (untestable glue, per
  the project's testing split).

## Assumptions needing Vincent's confirmation

1. **Finale reveal** (planets appear only in the journey's climax) rather than
   an always-visible backdrop or a fully explorable solar system. Chosen for
   emotional payoff and sane scope; explorable planets would be a V3 project.
2. **8K day map only**, night/clouds stay 2K; mobile stays all-2K.
3. **Artistic planet arrangement** (composed for the shot), not astronomically
   accurate positions.
4. **Journey grows to ~109 s** (hold shortened to 8 s, reveal adds 22 s).
5. **Sagan's quote becomes the reveal's fixed line** and leaves the rotation.
6. **No Moon** in this iteration.
