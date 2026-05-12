# Cursor Distortion Effect — Design Spec
_2026-05-12_

## Overview

A cursor-driven CRT screen distortion effect. The page behind the cursor warps as if the screen membrane is being poked or pulled — inspired by The Ring / liquid glass. Effect persists at rest (ambient) and intensifies with cursor velocity.

---

## Architecture

Three files only. No new files, no dependencies.

| File | Changes |
|---|---|
| `index.html` | Add `#cursor-warp` SVG filter + `#cursor-mask-rect` + `#cursor-mask-grad` inside existing `<svg class="svg-filters">`. Add `<div class="cursor-glow">`. |
| `css/style.css` | `body { filter: url(#cursor-warp); will-change: filter; }`. `.cursor-glow` styles. `.low-fi` overrides to disable both. |
| `js/main.js` | `initCursorWarp()` function, state additions, velocity tracking rAF loop, RGB boost in `animateFilters()`. |

---

## SVG Filter Chain (`#cursor-warp`)

```
feTurbulence (type=turbulence, seed=warpSeed, baseFrequency=0.018 0.018, numOctaves=3)
  → feDisplacementMap (in=SourceGraphic, in2=noise, scale=warpScale, xChannel=R, yChannel=G) → "warped"
  → feComposite (operator=in, in=warped, in2=cursor-mask) → "localized"    [clips to cursor radius]
  → feComposite (operator=over, in=localized, in2=SourceGraphic)            [composite over original]
```

The cursor mask clips the displacement to a soft radial circle centered at the cursor. Implementation technique to be confirmed during implementation — two viable approaches:

- **feImage fragment ref**: `feImage href="#cursor-mask-rect"` where `#cursor-mask-rect` is a `<rect>` in a separate full-viewport SVG (position:fixed, visibility:hidden) filled with `radialGradient #cursor-mask-grad` (`gradientUnits="userSpaceOnUse"`). JS moves `cx/cy/r` of the gradient. Requires browser testing for cross-SVG feImage fragment support.
- **Canvas dataURL**: Each frame generate a radial gradient on a small offscreen canvas, export as dataURL, set on `feImage`. More portable, ~1ms/frame cost.

Either way: white center → transparent edge, radius = `WARP_RADIUS_BASE + speed * WARP_RADIUS_VELOCITY_FACTOR`.

Filter declared with `filterUnits="userSpaceOnUse"` and `x="0" y="0" width="100%" height="100%"` so coordinates match viewport px.

---

## JS Loop — `initCursorWarp()`

### State additions
```js
cursorX, cursorY,       // current position (viewport px)
warpSeed,               // float, increments each frame, applied as Math.floor
warpScale,              // current displacement scale (px), lerped
warpSpeed,              // smoothed speed scalar
hasMouseMoved,          // boolean — suppress glow on pure-touch devices
```

### Per-frame logic (rAF)
1. Compute raw speed: `sqrt((x-prevX)² + (y-prevY)²)`
2. Smooth: `warpSpeed = lerp(warpSpeed, rawSpeed, 0.15)`
3. Compute target scale: `clamp(WARP_AMBIENT + warpSpeed * WARP_VELOCITY_FACTOR, 0, WARP_MAX_SCALE)`
4. Lerp current scale toward target: `warpScale = lerp(warpScale, targetScale, 0.12)`
5. Increment seed: `warpSeed += WARP_SEED_SPEED + warpSpeed * WARP_SEED_VELOCITY_FACTOR`
6. Compute mask radius: `WARP_RADIUS_BASE + warpSpeed * WARP_RADIUS_VELOCITY_FACTOR`
7. Write to DOM:
   - `feDisplacementMap.scale` → `warpScale`
   - `feTurbulence.seed` → `Math.floor(warpSeed) % 999`
   - `radialGradient cx/cy/r` → cursor position + computed radius
   - `cursor-glow` CSS vars `--cx`/`--cy` → cursor position

### Event listeners
- `mousemove` → update position, set `hasMouseMoved = true`
- `touchstart` → update position, reset `warpSpeed = 0`
- `touchmove` → update position (from `touches[0]`)
- `touchend` → stop updating position; `warpSpeed` naturally decays via lerp

---

## Phosphor Glow Layer (`.cursor-glow`)

```css
.cursor-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  background: radial-gradient(circle at var(--cx) var(--cy),
    rgba(255,255,255,0.18) 0%,
    rgba(255,255,255,0.04) 40%,
    transparent 70%);
  mix-blend-mode: screen;
  opacity: 0;
  transition: opacity 0.6s ease;
}
body.has-cursor .cursor-glow {
  opacity: 1;
}
```

`body.has-cursor` class added on first `mousemove`. Not added on touch (suppresses glow on mobile).

---

## RGB Bleed Boost

In `animateFilters()`, when computing baseline `offset`:

```js
const rgbBoost = Math.max(0, state.warpSpeed - CONFIG.WARP_RGB_BOOST_THRESHOLD)
                 * CONFIG.WARP_RGB_BOOST_FACTOR;
const effectiveOffset = offset * (1 + rgbBoost);
```

Applied only in the non-glitching branch (baseline mode). Burst mode already has its own intensity — no boost needed.

---

## CONFIG additions

```js
WARP_AMBIENT: 6,
WARP_VELOCITY_FACTOR: 0.9,
WARP_MAX_SCALE: 35,
WARP_RADIUS_BASE: 140,
WARP_RADIUS_VELOCITY_FACTOR: 0.4,
WARP_SEED_SPEED: 0.04,
WARP_SEED_VELOCITY_FACTOR: 0.18,
WARP_RGB_BOOST_THRESHOLD: 3,
WARP_RGB_BOOST_FACTOR: 0.08,
```

---

## Effects Reference Update

`conductor/effects-reference.md` gets a new row:

| Effect | Mode | Implementation | Key Config / Values |
|---|---|---|---|
| **Cursor screen warp** | Baseline | `initCursorWarp()` → SVG filter `#cursor-warp` + `.cursor-glow` | warp-ambient 6px, warp-max 35px, radius-base 140px, velocity-factor 0.9 |

New terminology rows: `warp-ambient`, `warp-max-scale`, `warp-radius-base`, `warp-velocity-factor`.

---

## Low-fi Override

```css
body.low-fi { filter: none !important; }
body.low-fi .cursor-glow { display: none; }
```

`initCursorWarp()` guarded by same `!document.body.classList.contains('low-fi')` check used by existing effects.

---

## Out of Scope

- Custom cursor appearance (default OS cursor kept)
- Distortion during glitch burst (burst has its own visual language)
- Any canvas or WebGL usage
