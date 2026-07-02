# GodViewActivation V2 — Validated Design

**Date:** July 2, 2026
**Status:** Implemented (MVP)
**Supersedes:** the guided-journey model in `docs/PRD.md`

## Vision

Free exploration of Earth from orbit, plus a **GodView toggle** that shifts the whole experience into an awe moment. This replaces the PRD's 7–10 minute locked journey; narration clips, stillness controller, reflection screens, and analytics were dropped from the MVP.

Decisions confirmed with the product owner during brainstorming:

| Decision | Choice |
|---|---|
| UI stack | Vanilla TS + Three.js + Vite, no UI framework |
| World scope | Earth orbit only (low orbit → "pale blue dot" zoom range) |
| GodView effect | All four: camera flight to hero vantage, awe-mode audio, astronaut quote text, visual grading shift |
| MVP extras | Ambient audio during exploration, welcome/priming screen, day/night cycle shader |
| Narration | Text quotes only — no voice recordings |

## The GodView Sequence

1. Controls lock; over ~6s the camera flies (slerp direction, lerp radius) to the hero vantage — whole Earth centered, sun ~55° off-axis so terminator and atmospheric rim are both in frame.
2. In parallel: audio crossfades to awe mode (ambience swells, 200/210 Hz binaural pair fades in), atmosphere glow and tone-mapping exposure ramp up, HUD fades to nothing.
3. On settle, one astronaut quote fades in (~8s hold), rotating through a curated set per activation.
4. Exit via ESC, tap/click, or the Return button: everything reverses over ~4s and the camera returns to its pre-GodView position.

## Architecture

`GodViewMode` (state machine: `exploring → transitioning → godview → returning`) is the sole owner of app mode; camera, audio, grading, and UI subscribe to its events in `main.ts`. One rAF loop in `SceneManager` ticks Earth rotation, active flights, grading tweens, and (only while exploring) OrbitControls.

Audio gain decisions are pure functions (`audioParams.ts`, tested); the space ambience is procedurally synthesized, with `public/audio/ambient.mp3` as an optional drop-in override.

## Testing

TDD (Vitest, Node environment) for all logic: state machine, tween/easing, quote rotation, camera flight math, gain targets. Rendering shaders and Web Audio plumbing are verified in the browser.
