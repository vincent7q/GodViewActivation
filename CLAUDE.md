# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server
- `npm test` — run the Vitest suite once (`npm run test:watch` for watch mode)
- `npx vitest run tests/<file>.test.ts` — run a single test file
- `npm run build` — type-check (`tsc --noEmit`) then production build
- `npm run preview` — serve the production build

Toolchain note: this machine runs Node 20.17, so Vite is pinned to v6 and Vitest to v3 (v7+/v4+ require Node ≥20.19). Don't bump those majors without a Node upgrade.

## What This Product Is

A free, browser-based experience that triggers the "Overview Effect": the visitor **freely explores Earth from orbit**, then presses a **GodView** button that shifts the whole experience into an awe moment. This V2 vision (exploration + toggle) **supersedes the guided-journey model described in `docs/PRD.md`** — see the header note there and `docs/plans/2026-07-02-godview-v2-design.md` for the validated design.

Stack: Vite + TypeScript + Three.js, **no UI framework** (overlays are plain DOM/CSS in `src/ui/`). Client-side only; deploys as a static site.

## Architecture

The single load-bearing idea: `src/godview/GodViewMode.ts` is a state machine (`exploring → transitioning → godview → returning`) and the **sole owner of app mode**. Everything reacts to its events (`enterStart`, `settled`, `exitStart`, `returned`); nothing else mutates mode. `src/main.ts` subscribes the four subsystems to those events:

1. **Camera** — `src/camera/GodViewTransition.ts` flies to `computeHeroPosition()` (55° off the sun axis so the terminator and atmospheric rim are in frame) via `sphericalLerp` (slerp direction, lerp radius — never through the globe). `ExploreControls` (OrbitControls) is disabled during flights; critically, `controls.update()` must NOT be called outside the `exploring` state because OrbitControls repositions the camera every update.
2. **Audio** — gain *decisions* are pure functions in `src/audio/audioParams.ts` (tested); `AudioEngine.ts` is untested Web Audio plumbing that applies them. Ambience is procedurally synthesized (drones + noise + LFO) unless `public/audio/ambient.mp3` exists, which overrides it. Binaural pair: 200 Hz left / 210 Hz right = 10 Hz alpha beat, audible only in godview mood. The engine must start after a user gesture — the welcome screen's Begin click.
3. **Grading** — `SceneManager.setExposure()` (ACES tone mapping; the Earth shader includes the tonemapping chunk so exposure affects it) + `Earth.setAtmosphereIntensity()` ramp up in godview.
4. **UI** — `Hud` hides completely during godview; exit is ESC, tap/click on the canvas, or the Return button after the HUD reappears.

`SUN_DIRECTION` in `src/scene/Lighting.ts` is shared by the directional light, the Earth day/night shader, and the hero-position math — change it in one place only.

## Testing Split

Logic (state machine, tween, quotes, camera math, gain targets) is TDD'd in `tests/` and runs in Node (three.js math works without a DOM). Rendering and Web Audio glue (`SceneManager`, `Earth` shaders, `AudioEngine`, `src/ui/`) is deliberately untested — verify it in the browser. Keep new logic in pure modules so it stays testable.

## Assets & Licensing

`public/textures/` are from Solar System Scope, **CC BY 4.0 — attribution required** (kept in README; don't remove it). Textures are the 2K set only (~1.6MB) — a deliberate product decision; don't add higher resolutions without asking. Total assets must stay <50MB.

## Product Constraints

- Never implement: gamification, accounts/login, ads, data collection, social features during the experience.
- No progress bars or timers in the experience; UI fades when idle.
- Performance budgets: 60 FPS desktop / 30+ mobile; <3s first paint on 4G (2K textures); mobile gets 64-segment spheres and fewer stars (`detectQuality`).
