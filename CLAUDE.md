# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository State

This is a **greenfield rebuild (V2.0)**. The working tree contains no application code yet — only `docs/PRD.md`, which is the single source of truth for what to build. The previous v1 implementation was intentionally removed; do not reference or resurrect it. All new work happens on the `V2.0` branch.

There is no build system, package.json, or test runner yet. When scaffolding the project, the PRD specifies **Three.js + Vite + TypeScript** as the intended stack (see PRD §14.2). Once tooling exists, update this file with the actual build/test/dev commands.

## What This Product Is

GodViewActivation is a free, browser-based **psychological intervention platform** — not a space simulator. Its sole purpose is to trigger the "Overview Effect" (awe, interconnectedness, perspective shift) via a 7–10 minute guided journey viewing Earth from space. The primary success metric is ≥60% of users reporting awe indicators, not engagement or visual fidelity for its own sake.

Read `docs/PRD.md` before implementing any feature. Key design constraints that shape all code decisions:

- **Journey-first, not exploration-first**: the camera follows a locked, spline-based path through 4 phases — Ascent (0–2m), Transition (2–4m), Contemplation (4–7m), Integration (7–10m). User control is deliberately removed during the journey ("reduced agency enhances awe").
- **Precisely timed orchestration**: narration fires at 2:30, 4:00, 6:00, 8:30; stillness moments (camera locked, inputs disabled) at 2:00 and 5:00 for 30s each; a strategic 3-second audio silence at 2:00. Audio/visual sync must be within 0.5s.
- **Psychoacoustic audio**: continuously playing binaural alpha beats (two Web Audio oscillators at 200/210 Hz, ~5% volume, stereo-separated), ambient loop (~30% volume), narration (~70% volume).
- **Client-side only**: no backend, no accounts, no cookies. Static hosting (Vercel/Netlify). Reflections are stored in localStorage only and never transmitted. Analytics are anonymous (Plausible) and opt-out-able.
- **No progress bar or timer during the journey** (prevents clock-watching); UI fades to invisible after 5s of inactivity.

## Anti-Features (Never Implement)

The PRD explicitly forbids: gamification (points/achievements), social media integration during the journey, user accounts/login, real-time multiplayer, advertising/monetization, and any data collection beyond anonymous analytics.

## Performance & Compatibility Budgets

These are P0 requirements, not aspirations — design with them in mind from the start:

- 60 FPS desktop / 30+ FPS mobile; auto-downgrade quality (texture → geometry → starfield) if avg FPS <30 for 10s
- Page load <3s on 4G via progressive loading: low-res Earth (1K) + renderer first (<2s), 8K textures swap in from background with no visual interruption
- Memory <500MB desktop / <200MB mobile; total assets <50MB
- Earth sphere: 128 segments / 8K textures desktop, 64 segments / 4K mobile
- Browsers: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+; feature-detect WebGL and Web Audio with fallbacks
- Accessibility: WCAG 2.1 AA (4.5:1 contrast, keyboard nav, ARIA labels, subtitles on by default)

## Visual Rendering Notes

- Earth has three layers: solid sphere, animated cloud layer, atmosphere glow (custom shader, blue-white gradient RGB 0.3/0.6/1.0, intensity varies with camera distance)
- **No political borders** — only natural features; the thin blue atmosphere line is a deliberate "fragility trigger"
- Golden-hour lighting: directional light at 3500K with strong atmospheric rim light, minimal ambient
- Textures come from NASA public-domain datasets

## MVP Scope Guard

MVP (v1.0) includes only: the 4-phase journey, Earth rendering, psychoacoustic audio, priming screen, stillness controller, reflection screen, responsive design, basic accessibility, and anonymous analytics. VR/WebXR, free exploration mode, multi-language, meditation mode, and sharing are explicitly **post-MVP** — don't build them yet (PRD §4.1, §9).
