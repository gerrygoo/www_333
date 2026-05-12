# Design: Signal-less CRT Noise Effect

**Date:** 2026-05-12
**Track:** Signal-less CRT Noise Effect (conductor/tracks.md)
**Status:** Approved — pending implementation

---

## Summary

Ambient pixel-static overlay that reads as a CRT TV receiving no input signal. Always-on, with its own independent burst behavior. Decoupled from the glitch orchestrator.

---

## Architecture

### Markup (`index.html`)

Add one element inside `<body>`, after `.visual-effects-overlay`:

```html
<canvas id="crt-noise"></canvas>
```

CSS positions it full-page, pointer-events none, z-index 15 (above scanlines at 12, below flicker overlay at 9000).

### CSS (`css/style.css`)

```css
#crt-noise {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 15; /* above scanlines (12), below flicker overlay (9000) */
    display: block;
}
body.low-fi #crt-noise {
    display: none;
}
```

### JavaScript (`js/main.js`)

Two additions:

**CONFIG keys:**

| Key | Default | Meaning |
|---|---|---|
| `NOISE_DENSITY_AMBIENT` | `0.07` | Fraction of pixels filled at rest |
| `NOISE_DENSITY_BURST` | `0.22` | Fraction of pixels filled during burst |
| `NOISE_FPS_AMBIENT` | `15` | Draw frames/sec ambient |
| `NOISE_FPS_BURST` | `30` | Draw frames/sec during burst |
| `NOISE_BURST_DURATION` | `600` | ms burst lasts |
| `NOISE_BURST_WAIT_MIN` | `2000` | ms minimum between burst checks |
| `NOISE_BURST_WAIT_MAX` | `8000` | ms maximum between burst checks |
| `NOISE_BURST_PROBABILITY` | `0.6` | Probability burst fires per orchestrator tick |

**`state` keys added:**

| Key | Type | Meaning |
|---|---|---|
| `isNoising` | boolean | Whether a noise burst is active |
| `noiseInterval` | number\|null | Handle for the current draw interval |

**`initCrtNoise()` function:**

1. Grabs `#crt-noise` canvas, gets 2D context
2. Sizes canvas to `window.innerWidth × window.innerHeight` on init and on `resize`
3. Starts ambient draw loop via `setInterval` at `1000 / NOISE_FPS_AMBIENT` ms
4. Starts burst orchestrator via `setTimeout` loop (own wait, own probability, independent of `orchestrate()`)

**Ambient draw loop:**

Each tick:
- `clearRect` full canvas
- `ctx.fillStyle = 'white'`
- Loop `Math.floor(canvas.width * canvas.height * currentDensity)` times
- Each iteration: random x, random y, random `globalAlpha` between 0.3–1.0
- `fillRect(x, y, 1, 1)`

`currentDensity` reads from `isNoising` state: burst density or ambient density.

**Burst orchestrator:**

```
function noiseBurstLoop() {
    if (!state.isNoising && Math.random() < NOISE_BURST_PROBABILITY) {
        state.isNoising = true;
        // switch to burst fps
        clearInterval(state.noiseInterval);
        state.noiseInterval = setInterval(drawNoise, 1000 / NOISE_FPS_BURST);
        setTimeout(() => {
            state.isNoising = false;
            // return to ambient fps
            clearInterval(state.noiseInterval);
            state.noiseInterval = setInterval(drawNoise, 1000 / NOISE_FPS_AMBIENT);
        }, NOISE_BURST_DURATION);
    }
    const wait = NOISE_BURST_WAIT_MIN + Math.random() * (NOISE_BURST_WAIT_MAX - NOISE_BURST_WAIT_MIN);
    setTimeout(noiseBurstLoop, wait);
}
```

**Init hook:** `initCrtNoise()` called inside the existing `low-fi` guard in `DOMContentLoaded`:

```js
if (!document.body.classList.contains('low-fi')) {
    preloadAssets();
    orchestrate();
    animateFilters();
    initCursorWarp();
    initCrtNoise(); // add here
}
```

---

## effects-reference.md Updates

### New terminology rows

| Term | Definition |
|---|---|
| **noise-density** | Fraction (0–1) of canvas pixels filled per draw frame |
| **noise-burst-wait** | Random interval between burst checks: `NOISE_BURST_WAIT_MIN + rand × (NOISE_BURST_WAIT_MAX − NOISE_BURST_WAIT_MIN)` |

### New effect row

| Effect | Mode | Implementation | Key Config / Values |
|---|---|---|---|
| **CRT noise** | Baseline + own burst | `initCrtNoise()` → `<canvas id="crt-noise">` | noise-density 0.07 ambient / 0.22 burst, fps 15 ambient / 30 burst, burst-duration 600ms, burst-wait 2000–8000ms, burst-probability 0.6 |

---

## Constraints

- Must not touch `#rgb-split`, `#rgb-split-intense`, or `#cursor-warp` SVG filters
- Must respect `body.low-fi` — canvas hidden via CSS, `initCrtNoise()` never called
- Canvas resizes on `window.resize` to avoid blurry scaling
- No new files — all changes in `index.html`, `css/style.css`, `js/main.js`, `conductor/effects-reference.md`, `conductor/tracks.md`
