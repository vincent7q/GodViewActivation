# GodViewActivation

Experience Earth as astronauts see it. Explore our planet freely from orbit — then turn on the **GodView**.

Fewer than 600 people in history have watched Earth from space. Many returned changed, describing awe, a dissolving of borders, and a deep sense of responsibility for the world below — the *Overview Effect*. GodViewActivation recreates the conditions for that shift in any modern browser, for free.

## The experience

- **Explore** — drag to orbit a photorealistic Earth, scroll to zoom from low orbit out to a "pale blue dot" distance. Day and night drift across the globe beneath animated clouds while a quiet space ambience plays.
- **GodView** — one button. The camera flies to the iconic whole-Earth vantage, the thin blue atmosphere line glows, binaural alpha-wave audio fades in, and an astronaut's words appear. Stay as long as you like; ESC or a tap returns control.

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests (Vitest)
npm run build    # type-check + production build
```

Requires Node 20.x. Built with Three.js + TypeScript + Vite; no backend — deploys as a static site.

## Credits & licensing

- Earth textures by [Solar System Scope](https://www.solarsystemscope.com/textures/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), based on NASA imagery.
- Astronaut quotes: Carl Sagan, Edgar Mitchell, William Anders, Aleksei Leonov.
- Ambience and binaural audio are synthesized in-browser with the Web Audio API.
