# Visual Effects Reference

Since v2.0.0 the site opens on a first-person 3D room (Three.js). The original landing page is now
"the tape": it plays on the in-room CRT and appears full-screen (`#site`) when the player sits and
watches. Sections below the 3D table describe the tape.

## 3D room (`initWorld()` in `main.js`)

| Effect | Implementation | Key Config / Values |
|---|---|---|
| **Low-res render** | Scene → `WebGLRenderTarget` (HalfFloat, nearest) → post quad | `ROOM.RT_HEIGHT` 400px internal height |
| **Camcorder post pass** | `makePost()` fragment shader | tube bulge 0.12, chroma 0.006 (+0.03 glitch), grain 0.06 (+0.18 glitch), ~70% desaturated, 2px scanlines, vignette, line tears during glitch |
| **Camera glitch coupling** | `world.camGlitch` set at each tape burst onset | 18% chance of full-strength burst, else 0.25 × proximity to TV (0 at 6m) |
| **TV screen** | `makeTVScreen()` → 512×384 `CanvasTexture` at `ROOM.TV_FPS` 30 | logo/glyph RGB split (additive red/blue copies), mirrors `animateFilters` split ranges, glyph swap on `state.isGlitching`, static 0.13 / 0.42 burst, rolling bar, 3px scanlines, line tears |
| **TV light** | SpotLight (shadowed) + PointLight fill on the CRT | intensity 9 × `screen.brightness` (≈0.55 steady, 0.5–1.4 burst) |
| **Flashlight** | Shadowed SpotLight on a lagging rig (`F` toggles) | intensity 15, angle 0.45, penumbra 0.75; flickers on strong camera glitches |
| **Moonlight** | Shadowed SpotLight outside the boarded east window | intensity 60, stripes through 4 boards |
| **Door leak** | Emissive strip + dim PointLight under the south door | 0.25, occasional dip |
| **Swaying bulb** | Pivot rotation | ±0.05 rad, jitters during glitch |
| **Wall chalk** | First 8 glyph SVGs → scuffed alphaMaps on 6 wall decals | opacity 0.55, visible mainly under flashlight |
| **Audio** | WebAudio, generated | positional band-passed static at TV (louder on burst), 15.7 kHz whine, 41/43.7/82 Hz drone; `M` mutes |
| **Shadows** | `BasicShadowMap` | hard and aliased on purpose |

Interaction: `[E]`/click while looking at the armchair → sit; seated `[E]` → camera pushes into the screen → `#site`; `Esc` / "look away" → back in the chair. Stand up with `Q`, `C`, `Space`, any movement key, or right-click. Touch: left pad + drag-look + action button, plus a STAND button while seated. If pointer lock is lost (Esc can't re-grab it), the seated prompt shows `[CLICK] TO LOOK AROUND`.

---

## The tape

All effects active on the original landing page (now shown inside `#site`). Two modes: **baseline** (always on) and **burst** (during `.is-glitching` body class).

---

## Terminology

Standard terms used across effect descriptions and tuning notes.

| Term | Definition |
|---|---|
| **split-radius** | Horizontal displacement (px) of red/blue channel copies in the chromatic aberration filter |
| **drift-ratio** | Vertical displacement as a fraction of split-radius (0–1). Controls diagonal lean of aberration. |
| **tick-base** | Minimum delay (ms) between animation state updates in a JS-driven loop |
| **tick-jitter** | Range added to tick-base via `Math.random()`. Total delay = `tick-base + rand × tick-jitter` |
| **phase-offset** | Negative `animation-delay` used to desync CSS keyframe animations that share the same loop |
| **shake-period** | Full duration (s) of one CSS shake keyframe cycle |
| **burst-cooldown** | Random wait between glitch bursts: `GLITCH_WAIT_MIN + rand × (GLITCH_WAIT_MAX − GLITCH_WAIT_MIN)` |
| **burst-duration** | How long `.is-glitching` stays active per burst (`GLITCH_DURATION`) |
| **burst-probability** | Chance a burst fires on each orchestrator tick (`GLITCH_PROBABILITY`) |
| **swap-tick** | Base interval (ms) between logo asset swaps during a burst |
| **swap-jitter** | Multiplier applied to swap-tick: `× (0.8 + rand × 0.4)` = ±20% variance |
| **warp-ambient** | Baseline `feDisplacementMap` scale (px) when cursor is stationary |
| **warp-max-scale** | Maximum displacement scale (px) — ceiling on warp intensity |
| **warp-radius-base** | Cursor mask radius (px) at rest |
| **warp-velocity-factor** | Displacement px added per px/frame of cursor speed |
| **noise-density** | Fraction (0–1) of canvas pixels filled per draw frame in `initCrtNoise()` |
| **noise-burst-wait** | Random interval between noise burst checks: `NOISE_BURST_WAIT_MIN + rand × (NOISE_BURST_WAIT_MAX − NOISE_BURST_WAIT_MIN)` |

---

## Effects

| Effect | Mode | Implementation | Key Config / Values |
|---|---|---|---|
| **RGB channel split** | Baseline | `animateFilters()` → SVG filter `#rgb-split` | split-radius 3.6–12px, drift-ratio 0–0.3, tick-base 80ms, tick-jitter 210ms |
| **RGB channel split — intense** | Burst | `animateFilters()` → SVG filter `#rgb-split-intense` + `invert(1)` | split-radius 9.6–26.4px, drift-ratio 0–0.4, tick-base 24ms, tick-jitter 49ms |
| **Glitch orchestrator** | — | `orchestrate()` in `main.js` | burst-cooldown 400–3500ms, burst-probability 0.82, burst-duration 800ms |
| **Logo asset swap** | Burst | `startAssetGlitch()` in `main.js` | swap-tick 100ms, swap-jitter ±20%, 16 SVGs in `ASSETS[]` |
| **Logo shake** | Baseline | `@keyframes logo-shake` on `.hero__logo` | shake-period 4.3s, phase-offset −0.7s, translate ±1px |
| **Text shake** | Baseline | `@keyframes text-shake` on `.hero__tagline`, `.instagram-link` | shake-period 3.7s, phase-offset −2.1s, translate ±1px — decoupled from logo via irrational period ratio (4.3/3.7) |
| **Screen flicker** | Baseline | `.visual-effects-overlay` + `@keyframes flicker` | 0.15s loop, opacity 0.8–1.0 |
| **Screen flicker — intense** | Burst | `.is-glitching .visual-effects-overlay` | 0.05s loop |
| **Vignette / glass tube** | Baseline | `body::after` | Radial gradient + inset box-shadow |
| **Scanlines** | Baseline | `.scanlines::before` | 4px repeating gradient, 0.2s scroll loop |
| **Power-on flash** | Once (load) | `@keyframes turn-on` on `.hero` | 1.2s, collapses to horizontal line then expands with brightness flash |
| **Cursor screen warp** | Baseline | `initCursorWarp()` → SVG filter `#cursor-warp` + `.cursor-glow` | warp-ambient 6px, warp-max 35px, radius-base 140px, velocity-factor 0.9 |
| **CRT noise** | Baseline + own burst | `initCrtNoise()` → `<canvas id="crt-noise">` | noise-density 0.05 ambient / 0.22 burst, fps 15 ambient / 30 burst, burst-duration 3000ms, noise-burst-wait 2000–18000ms, burst-probability 0.6 |

---

## Low-fi overrides

The tape's effect loops (`initCursorWarp`, `initCrtNoise`, `animateFilters`) start the first time `#site` opens and idle on `state.siteActive` while the player is in the room. `orchestrate()` runs from load because it also drives the TV.

`body.low-fi` disables: scanlines, `body::after` vignette, `visual-effects-overlay`, logo swap, filter animation (JS guard in `main.js`).

---

## Files

- `js/main.js` — orchestrator, asset swap, `animateFilters()`
- `css/style.css` — all CSS effects
- `index.html` — SVG filter defs, `.visual-effects-overlay` markup
