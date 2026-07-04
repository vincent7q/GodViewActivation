# Living Solar System + Cosmic Zoom-Out — Design

**Date:** July 4, 2026
**Status:** Approved (product owner pre-approved implementation of TODO.md enhancements)
**Builds on:** `2026-07-03-clarity-and-solar-system-design.md` (implemented)

## Why (from TODO.md)

1. The planets exist only during the journey's reveal beat; exploring from
   Earth you can never spot the Moon, Sun, Mars… The owner expects a living
   solar system: all 9 planets (plus Sun and Moon) present and **slowly
   moving** like a real system.
2. The tour should not stop at the solar system: continue the zoom-out
   through the known universe — 太陽系 → 獵戶座旋臂 → 銀河系 → 本星系群 →
   室女座超星系團 → 拉尼亞凱亞超星系團 → 可觀測宇宙 — so visitors feel how
   small humanity, Earth, even the solar system is; then return to Earth so
   the tour can restart.

## Part 1 — Living solar system (ambient, always visible)

The static artistic arc becomes a **heliocentric orbital model**:

- The Sun stays where it has always implicitly been: `SUN_DIRECTION · 350`
  (sprite + textured core, unchanged). Single-source lighting rule holds.
- Planets orbit the Sun on circles in the ecliptic plane (spanned by
  `SUN_DIRECTION` and its horizontal perpendicular), each with an orbit
  radius, period, and starting angle. `planetLayout.ts` becomes
  `planetPosition(spec, elapsedSeconds)` — pure, testable.
- **Scale is artistic, not literal** (real proportions put Neptune 30× the
  starfield away). Orbit radii 70–720 keep every body ≥ ~110 units from
  Earth at closest approach and the far plane comfortable. Periods run
  minutes (Mercury ~3 min → Pluto ~40 min): visibly "slow but alive".
- **Roster: 9 planets** — Mercury, Venus, Mars, Jupiter, Saturn (+ring),
  Uranus, Neptune with their 2K textures, **plus Pluto** (the owner asked
  for 9). Pluto and the **Moon** use flat-color materials because
  solarsystemscope.com is currently captcha-walling downloads (bypassing a
  captcha is off the table); `PlanetSpec.texture` is nullable so dropping
  real textures in later is a one-line change each.
- **The Moon** orbits Earth (radius 5, period ~4 min, size 0.27) — visible
  while exploring, the single most-requested missing body.
- The group is **visible from startup** (previously opacity-0 until the
  reveal). During exploration you can find the Sun's glare, the Moon, and
  planets as small lit discs drifting along their orbits.

## Part 2 — Cosmic zoom-out finale

The journey keeps beats 1–4 (descend, flyover, ascend, dot hold) and then
replaces the single "reveal" with **seven cosmic stages**. The camera glides
once from the hold to the reveal vantage and stays there; the *scenery*
performs the zoom: each stage's structure shrinks toward the center while
the next, vaster structure fades in around it — the "Powers of Ten" illusion,
no far-plane gymnastics.

| Stage | Caption (zh · en) | Duration | Scenery |
|---|---|---|---|
| 1 | 太陽系 · Solar System | 15 s | the live solar group itself, shrinking to a dot |
| 2 | 獵戶座旋臂 · Orion Arm | 10 s | elongated star-band particle field |
| 3 | 銀河系 · Milky Way | 10 s | procedural two-arm spiral (particles + bulge glow) |
| 4 | 本星系群 · Local Group | 10 s | Milky Way + Andromeda sprites + ~50 dot galaxies |
| 5 | 室女座超星系團 · Virgo Supercluster | 10 s | hundreds of tiny galaxy sprites in clumps |
| 6 | 拉尼亞凱亞超星系團 · Laniakea | 10 s | filaments of points converging on the Great Attractor |
| 7 | 可觀測宇宙 · Observable Universe | 15 s | cosmic-web point cloud; **Sagan quote moves here** |

Each stage shows a caption card: bilingual title + the owner's Chinese
description (from TODO.md) verbatim. All scenery is **procedural**
(Points/Sprites/canvas textures) — zero new asset downloads.

After stage 7 the journey auto-returns (existing 12 s flight); everything
cosmic fades out, the solar group restores to ambient scale/opacity, and an
**Earth card** (地球 · Earth — 太陽系中第三顆行星，也是我們目前唯一已知的家園)
greets the visitor home. Journey total ≈ 2 min 47 s. ESC/tap still exits from
any stage with a graceful fade + look-target blend.

## Architecture

- `src/godview/cosmicStages.ts` (pure, tested): `COSMIC_STAGES` specs
  (key, 中文名, English name, description, duration), `EARTH_INFO`,
  `stageEnvelopes(elapsed)` → per-stage `{opacity, scale}` — fade-in/out
  crossfades (3 s) and exponential shrink; last stage holds full.
- `src/scene/planetLayout.ts` (pure, tested): orbital `PlanetSpec`s,
  `planetPosition(spec, t)`, `moonPosition(t)`, `SUN_DISTANCE`.
- `src/godview/journey.ts` (pure, tested): the `'reveal'` phase becomes
  seven `'cosmic'` phases carrying `stage` keys; first one flies
  hold → reveal vantage with the existing look-target ease.
- `src/scene/SolarSystem.ts` (glue): heliocentric rebuild, `update(dt)`
  advances orbits, visible by default; texture-optional bodies.
- `src/scene/CosmicScenery.ts` (glue): builds stage groups 2–7 procedurally,
  `apply(envelopes, masterFade)` sets opacity/scale.
- `src/ui/CosmicCaption.ts` (glue): bilingual caption card.
- `main.ts`: cosmic clock (accumulates during 'godview' once stage 1
  starts), applies envelopes each frame, master fade on exit, Earth card
  on return.

## Testing

Pure modules TDD'd: orbital invariants (distance-from-sun constant, plane
containment, ≥ 100 units clearance from Earth for every body at all sampled
times), envelope invariants (crossfade overlap, monotone shrink, last stage
holds, totals), journey sequence/continuity/look-ease. Scenery, captions,
and orbital rendering verified in the browser.

## Decisions made on the owner's behalf (flag if wrong)

1. Pluto included (you said 9 planets) — flat-color sphere until the texture
   site unblocks; same for the Moon.
2. Artistic orbit scale & minute-scale periods (real scale is unusable).
3. Scenery-driven zoom (shrink + crossfade) instead of literally flying the
   camera light-years — indistinguishable on screen, vastly simpler.
4. Sagan's quote moves from the solar-system stage to the Observable
   Universe stage (the true "look again at that dot" moment).
5. Stage captions use your Chinese descriptions verbatim, titles bilingual.
