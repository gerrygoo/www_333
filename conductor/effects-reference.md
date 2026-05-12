# Visual Effects Reference

All effects active on the PDI landing page. Two modes: **baseline** (always on) and **burst** (during `.is-glitching` body class).

---

## Effects

| Effect | Mode | Implementation | Key Config / Values |
|---|---|---|---|
| **Logo asset swap** | Burst | `js/main.js` `startAssetGlitch()` | Cycles 16 SVGs from `ASSETS[]` every `SWAP_INTERVAL` (100ms) |
| **Glitch orchestrator** | — | `js/main.js` `orchestrate()` | Wait: `GLITCH_WAIT_MIN`–`GLITCH_WAIT_MAX` (400–3500ms random), `GLITCH_PROBABILITY` 0.82, `GLITCH_DURATION` 800ms |
| **RGB channel split — subtle** | Baseline | SVG filter `#rgb-split` (`index.html`) + `filter: url(#rgb-split)` (`style.css:201`) | Red offset −2px, Blue offset +2px |
| **RGB channel split — intense** | Burst | SVG filter `#rgb-split-intense` (`index.html`) + `.is-glitching .hero__logo` (`style.css:212`) | Red offset −5px, Blue offset +5px; also inverts logo (`invert(1)`) |
| **Chromatic jitter — subtle** | Baseline | `@keyframes chromatic-subtle` (`style.css:222`) | 4s loop, sub-pixel translate on logo + tagline + link |
| **Chromatic jitter — intense** | Burst | `@keyframes chromatic-intense` (`style.css:241`) | 0.1s loop, ±2px translate |
| **Screen flicker** | Baseline | `.visual-effects-overlay` + `@keyframes flicker` (`style.css:184`) | 0.15s loop, opacity 0.8–1.0 |
| **Screen flicker — intense** | Burst | `.is-glitching .visual-effects-overlay` (`style.css:188`) | 0.05s loop |
| **Vignette / glass tube** | Baseline | `body::after` (`style.css:138`) | Radial gradient + inset box-shadow |
| **Scanlines** | Baseline | `.scanlines::before` (`style.css:151`) | 4px repeating gradient, 0.2s scroll loop |
| **Power-on flash** | Once (load) | `@keyframes turn-on` on `.hero` (`style.css:268`) | 1.2s, collapses to horizontal line then expands with brightness flash |

---

## Low-fi overrides

`body.low-fi` disables: scanlines, `body::after` vignette, `visual-effects-overlay`, background image, logo swap (JS guard in `main.js:75`).

---

## Files

- `js/main.js` — orchestrator, asset swap
- `css/style.css` — all CSS effects
- `index.html` — SVG filter defs, `.visual-effects-overlay` markup
