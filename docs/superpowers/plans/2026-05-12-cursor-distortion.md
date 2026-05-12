# Cursor Distortion Effect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a velocity-sensitive CRT screen distortion effect — the page warps organically around the cursor as if the screen membrane is being poked, persisting at rest and intensifying on movement.

**Architecture:** SVG `feTurbulence` + `feDisplacementMap` filter applied to `.hero`, masked to cursor radius via a `feImage` reference to a full-viewport SVG rect filled with a `radialGradient`. JS rAF loop updates seed (ripple), scale (intensity via velocity lerp), and gradient center (cursor position). Phosphor glow via a `position:fixed` div using CSS custom properties.

**Tech Stack:** Vanilla JS, SVG filters, CSS custom properties. No build step. No dependencies.

---

## Important Notes

**Filter target is `.hero`, not `body`:** Applying `filter` to `body` would create a new stacking context, breaking `position:fixed` children (`.visual-effects-overlay`, `body::after`, `.cursor-glow`). Applying to `.hero` avoids this — all fixed-position overlays remain as body-level siblings.

**Turn-on animation interaction:** `.hero` already has `animation: turn-on 1.2s` which includes `filter: brightness(N)` in its keyframes. The animated `filter` value overrides the CSS `filter` declaration during the animation (1.2s). After the animation ends, `.hero`'s static `filter: url(#cursor-warp)` takes effect. Cursor warp activates ~1.2s after load — intentional.

**Stacking order:**
- `main.hero` → no z-index (background)
- `.cursor-glow` → z-index 5 (phosphor layer, below CRT overlays)
- `.visual-effects-overlay` → z-index 9000 (CRT flicker/scanlines)
- `body::after` → z-index 9999 (vignette)

---

## File Map

| File | Change |
|---|---|
| `index.html` | Add `#cursor-warp` filter inside existing `<svg class="svg-filters">`. Add `<svg id="cursor-mask-svg">` (full viewport, hidden). Add `<div class="cursor-glow">`. |
| `css/style.css` | Add `.hero { filter }`, `.cursor-glow` rules, `body.low-fi` overrides. |
| `js/main.js` | Add CONFIG keys, state fields, `initCursorWarp()`, call it in `DOMContentLoaded`, update `animateFilters()` baseline branch. |
| `conductor/effects-reference.md` | New effect row + terminology rows. |

---

## Task 1: Add SVG filter and cursor mask to index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add `#cursor-warp` filter inside the existing `<svg class="svg-filters">` block**

Open `index.html`. Locate the closing `</defs>` inside `<svg class="svg-filters">` (currently after the `#rgb-split-intense` filter). Insert before `</defs>`:

```html
        <filter id="cursor-warp" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feTurbulence id="warp-turbulence" type="turbulence" baseFrequency="0.018 0.018" numOctaves="3" seed="1" result="noise"/>
          <feDisplacementMap id="warp-displace" in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" result="warped"/>
          <feImage id="warp-mask-img" href="#cursor-mask-rect" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="mask"/>
          <feComposite in="warped" in2="mask" operator="in" result="localized"/>
          <feComposite in="localized" in2="SourceGraphic" operator="over"/>
        </filter>
```

- [ ] **Step 2: Add the full-viewport cursor mask SVG after `</svg>` (the svg-filters closing tag)**

Insert immediately after `</svg>` (the svg-filters block) and before `<main class="hero">`:

```html
    <!-- Cursor mask source: full-viewport SVG providing the radial gradient shape for #cursor-warp feImage -->
    <svg id="cursor-mask-svg" aria-hidden="true" focusable="false"
         style="position:fixed;inset:0;width:100%;height:100%;pointer-events:none;visibility:hidden;overflow:visible">
      <defs>
        <radialGradient id="cursor-mask-grad" cx="0" cy="0" r="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="white" stop-opacity="1"/>
          <stop offset="70%" stop-color="white" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect id="cursor-mask-rect" x="0" y="0" width="100%" height="100%" fill="url(#cursor-mask-grad)"/>
    </svg>
```

- [ ] **Step 3: Add `<div class="cursor-glow">` after `.visual-effects-overlay`**

Locate `<div class="visual-effects-overlay scanlines"></div>`. Insert immediately after it:

```html
    <div class="cursor-glow"></div>
```

- [ ] **Step 4: Verify HTML structure in browser**

Open `index.html` in a browser. Open DevTools → Elements. Confirm:
- `#cursor-warp` filter exists inside `svg.svg-filters > defs`
- `#cursor-mask-svg` exists as a direct child of `<body>` (sibling of `<main>`)
- `.cursor-glow` div exists as a direct child of `<body>` before `<main>`
- No console errors

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add cursor-warp SVG filter and mask infrastructure"
```

---

## Task 2: Add CSS rules

**Files:**
- Modify: `css/style.css`

- [ ] **Step 1: Add cursor warp filter to `.hero` and cursor glow styles**

In `css/style.css`, append after the existing `/* --- LOW-FI ADAPTIVE OVERRIDES --- */` section (end of file):

```css
/* --- CURSOR DISTORTION --- */

.hero {
    filter: url(#cursor-warp);
    will-change: filter;
}

.cursor-glow {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    background: radial-gradient(circle at var(--cx, 50%) var(--cy, 50%),
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

body.low-fi .hero {
    filter: none !important;
    will-change: auto;
}

body.low-fi .cursor-glow {
    display: none;
}
```

- [ ] **Step 2: Verify in browser — static state**

Open `index.html`. Confirm:
- Page loads and renders normally (no layout breaks)
- Power-on flash animation still plays at load
- DevTools → Computed styles on `.hero` shows `filter: url(#cursor-warp)`
- No visible change to layout (warp effect not yet driven — scale=6 with no mask movement means effect is off-screen at cx=0,cy=0)

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add cursor-glow and hero warp filter CSS"
```

---

## Task 3: Add CONFIG, state fields, and DOM refs

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Add CONFIG entries**

In `js/main.js`, add to the `CONFIG` object (after `ORIGINAL_LOGO`):

```js
    WARP_AMBIENT: 6,
    WARP_VELOCITY_FACTOR: 0.9,
    WARP_MAX_SCALE: 35,
    WARP_RADIUS_BASE: 140,
    WARP_RADIUS_VELOCITY_FACTOR: 0.4,
    WARP_SEED_SPEED: 0.12,
    WARP_SEED_VELOCITY_FACTOR: 0.18,
    WARP_RGB_BOOST_THRESHOLD: 3,
    WARP_RGB_BOOST_FACTOR: 0.08,
```

- [ ] **Step 2: Add state fields**

In the `state` object, add after `filterBlueIntense: null,`:

```js
    cursorX: 0,
    cursorY: 0,
    warpSeed: 0,
    warpScale: 0,
    warpSpeed: 0,
    hasMouseMoved: false,
    warpTurbulence: null,
    warpDisplace: null,
    cursorMaskGrad: null,
    cursorGlow: null,
```

- [ ] **Step 3: Verify no regressions**

Open `index.html` in browser. Confirm page renders and glitch bursts still fire. Console should be error-free.

- [ ] **Step 4: Commit**

```bash
git add js/main.js
git commit -m "feat: add cursor warp config and state fields"
```

---

## Task 4: Implement `initCursorWarp()`

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Add `initCursorWarp()` function**

Add this function in `js/main.js` after `orchestrate()` and before the `DOMContentLoaded` listener:

```js
function initCursorWarp() {
    state.warpTurbulence = document.querySelector('#warp-turbulence');
    state.warpDisplace = document.querySelector('#warp-displace');
    state.cursorMaskGrad = document.querySelector('#cursor-mask-grad');
    state.cursorGlow = document.querySelector('.cursor-glow');

    // Set filter and feImage to explicit px dimensions so filterUnits="userSpaceOnUse"
    // resolves correctly (percentage attrs on feImage resolve against the hidden SVG's
    // 0×0 viewport otherwise, clipping the mask to nothing).
    const warpFilter = document.querySelector('#cursor-warp');
    const warpMaskImg = document.querySelector('#warp-mask-img');
    function setWarpDimensions() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (warpFilter) { warpFilter.setAttribute('width', w); warpFilter.setAttribute('height', h); }
        if (warpMaskImg) { warpMaskImg.setAttribute('width', w); warpMaskImg.setAttribute('height', h); }
    }
    setWarpDimensions();
    window.addEventListener('resize', setWarpDimensions);

    let prevX = 0;
    let prevY = 0;

    document.addEventListener('mousemove', e => {
        if (!state.hasMouseMoved) {
            state.hasMouseMoved = true;
            document.body.classList.add('has-cursor');
        }
        state.cursorX = e.clientX;
        state.cursorY = e.clientY;
    });

    document.addEventListener('touchstart', e => {
        state.warpSpeed = 0;
        state.cursorX = e.touches[0].clientX;
        state.cursorY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        state.cursorX = e.touches[0].clientX;
        state.cursorY = e.touches[0].clientY;
    }, { passive: true });

    function warpLoop() {
        const dx = state.cursorX - prevX;
        const dy = state.cursorY - prevY;
        prevX = state.cursorX;
        prevY = state.cursorY;

        const rawSpeed = Math.sqrt(dx * dx + dy * dy);
        state.warpSpeed = state.warpSpeed + (rawSpeed - state.warpSpeed) * 0.15;

        const targetScale = Math.min(
            CONFIG.WARP_AMBIENT + state.warpSpeed * CONFIG.WARP_VELOCITY_FACTOR,
            CONFIG.WARP_MAX_SCALE
        );
        state.warpScale = state.warpScale + (targetScale - state.warpScale) * 0.12;

        state.warpSeed += CONFIG.WARP_SEED_SPEED + state.warpSpeed * CONFIG.WARP_SEED_VELOCITY_FACTOR;
        const seed = Math.floor(state.warpSeed) % 999;
        const radius = CONFIG.WARP_RADIUS_BASE + state.warpSpeed * CONFIG.WARP_RADIUS_VELOCITY_FACTOR;

        if (state.warpTurbulence) state.warpTurbulence.setAttribute('seed', seed);
        if (state.warpDisplace) state.warpDisplace.setAttribute('scale', state.warpScale.toFixed(2));
        if (state.cursorMaskGrad) {
            state.cursorMaskGrad.setAttribute('cx', state.cursorX);
            state.cursorMaskGrad.setAttribute('cy', state.cursorY);
            state.cursorMaskGrad.setAttribute('r', radius.toFixed(1));
        }
        if (state.cursorGlow) {
            state.cursorGlow.style.setProperty('--cx', state.cursorX + 'px');
            state.cursorGlow.style.setProperty('--cy', state.cursorY + 'px');
        }

        requestAnimationFrame(warpLoop);
    }

    requestAnimationFrame(warpLoop);
}
```

- [ ] **Step 2: Call `initCursorWarp()` in `DOMContentLoaded`**

In the `DOMContentLoaded` listener, add `initCursorWarp();` after `animateFilters();`:

```js
    if (!document.body.classList.contains('low-fi')) {
        preloadAssets();
        orchestrate();
        animateFilters();
        initCursorWarp();
    }
```

- [ ] **Step 3: Verify core warp effect in browser**

Open `index.html` in browser. Move mouse over the page. Verify:
- Content visibly warps around cursor
- Warp is localized to roughly 140px radius circle around cursor
- Moving mouse faster → more intense distortion
- Holding cursor still → distortion slowly ripples/breathes (seed incrementing)
- Warp disappears at cursor edges (soft falloff, not a hard circle)

If the warp is full-page (no radial mask), the `feImage href="#cursor-mask-rect"` isn't working in this browser. Fallback: see Task 4 Fallback below.

- [ ] **Step 4: Verify phosphor glow**

Move mouse over the page. Confirm a faint white radial halo follows cursor. It should fade in on first mousemove (`body.has-cursor` class). Open DevTools → body element should have `has-cursor` class after first move.

- [ ] **Step 5: Commit**

```bash
git add js/main.js
git commit -m "feat: implement initCursorWarp with rAF loop and touch support"
```

---

## Task 4 Fallback: Canvas dataURL mask (if feImage fragment ref fails)

**Only do this task if Task 4 Step 3 shows full-page warp (no radial localization).** Skip otherwise.

**Files:**
- Modify: `js/main.js`, `index.html`

- [ ] **Step 1: Replace `feImage` with a canvas-backed approach**

In `index.html`, change the `feImage` line inside `#cursor-warp`:

```html
          <feImage id="warp-mask-img" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="mask"/>
```

(Remove the `href` attribute — JS will set it dynamically.)

- [ ] **Step 2: Add canvas mask generation to `initCursorWarp()`**

Add an offscreen canvas before the `warpLoop` function inside `initCursorWarp()`:

```js
    const maskCanvas = document.createElement('canvas');
    const maskCtx = maskCanvas.getContext('2d');
    const warpMaskImg = document.querySelector('#warp-mask-img');

    function updateMaskCanvas(cx, cy, r) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (maskCanvas.width !== w || maskCanvas.height !== h) {
            maskCanvas.width = w;
            maskCanvas.height = h;
        }
        maskCtx.clearRect(0, 0, w, h);
        const grad = maskCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.7, 'rgba(255,255,255,0.15)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        maskCtx.fillStyle = grad;
        maskCtx.fillRect(0, 0, w, h);
        if (warpMaskImg) warpMaskImg.setAttribute('href', maskCanvas.toDataURL());
    }
```

- [ ] **Step 3: Call `updateMaskCanvas` inside `warpLoop`**

In `warpLoop`, replace the `cursorMaskGrad` setAttribute block with:

```js
        updateMaskCanvas(state.cursorX, state.cursorY, radius);
```

And remove the `cursorMaskGrad` null-check block entirely.

- [ ] **Step 4: Remove the `#cursor-mask-svg` from index.html**

The separate mask SVG is no longer needed. Remove:

```html
    <!-- Cursor mask source: full-viewport SVG providing the radial gradient shape for #cursor-warp feImage -->
    <svg id="cursor-mask-svg" aria-hidden="true" focusable="false"
         style="position:fixed;inset:0;width:100%;height:100%;pointer-events:none;visibility:hidden;overflow:visible">
      <defs>
        <radialGradient id="cursor-mask-grad" cx="0" cy="0" r="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="white" stop-opacity="1"/>
          <stop offset="70%" stop-color="white" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect id="cursor-mask-rect" x="0" y="0" width="100%" height="100%" fill="url(#cursor-mask-grad)"/>
    </svg>
```

- [ ] **Step 5: Remove `cursorMaskGrad` state field and DOM query**

In `initCursorWarp()`, remove:
```js
    state.cursorMaskGrad = document.querySelector('#cursor-mask-grad');
```

In `state`, remove:
```js
    cursorMaskGrad: null,
```

- [ ] **Step 6: Verify warp is now radially localized**

Reload browser. Move mouse. Warp should now be contained to cursor radius. If still full-page, check browser console for errors on `maskCanvas.toDataURL()` (may be blocked by security policies in some file:// contexts — use a local HTTP server: `python3 -m http.server 8080`).

- [ ] **Step 7: Commit**

```bash
git add index.html js/main.js
git commit -m "fix: replace feImage fragment ref with canvas dataURL mask for cursor warp"
```

---

## Task 5: RGB bleed boost in `animateFilters()`

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Update the non-glitching branch of `animateFilters()`**

In `animateFilters()`, replace the entire `else` branch:

**Before:**
```js
    } else {
        const offset = 3.6 + Math.random() * 8.4;
        const dy = offset * Math.random() * 0.3;
        if (state.filterRedBaseline) {
            state.filterRedBaseline.setAttribute('dx', (-offset).toFixed(1));
            state.filterRedBaseline.setAttribute('dy', (-dy).toFixed(1));
        }
        if (state.filterBlueBaseline) {
            state.filterBlueBaseline.setAttribute('dx', offset.toFixed(1));
            state.filterBlueBaseline.setAttribute('dy', dy.toFixed(1));
        }
        setTimeout(animateFilters, 80 + Math.random() * 210);
    }
```

**After:**
```js
    } else {
        const offset = 3.6 + Math.random() * 8.4;
        const dy = offset * Math.random() * 0.3;
        const rgbBoost = Math.max(0, state.warpSpeed - CONFIG.WARP_RGB_BOOST_THRESHOLD) * CONFIG.WARP_RGB_BOOST_FACTOR;
        const effectiveOffset = offset * (1 + rgbBoost);
        if (state.filterRedBaseline) {
            state.filterRedBaseline.setAttribute('dx', (-effectiveOffset).toFixed(1));
            state.filterRedBaseline.setAttribute('dy', (-dy).toFixed(1));
        }
        if (state.filterBlueBaseline) {
            state.filterBlueBaseline.setAttribute('dx', effectiveOffset.toFixed(1));
            state.filterBlueBaseline.setAttribute('dy', dy.toFixed(1));
        }
        setTimeout(animateFilters, 80 + Math.random() * 210);
    }
```

- [ ] **Step 2: Verify RGB boost in browser**

Open `index.html`. Move mouse quickly across the page. Confirm the RGB channel split on the logo/text visibly widens during fast movement and returns to normal when cursor slows. The boost should be subtle at moderate speed and noticeable at fast swipes.

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: boost RGB channel split with cursor velocity"
```

---

## Task 6: Update effects reference

**Files:**
- Modify: `conductor/effects-reference.md`

- [ ] **Step 1: Add new terminology entries**

In `conductor/effects-reference.md`, add to the Terminology table:

```markdown
| **warp-ambient** | Baseline `feDisplacementMap` scale (px) when cursor is stationary |
| **warp-max-scale** | Maximum displacement scale (px) — ceiling on warp intensity |
| **warp-radius-base** | Cursor mask radius (px) at rest |
| **warp-velocity-factor** | Displacement px added per px/frame of cursor speed |
```

- [ ] **Step 2: Add new effect row**

In the Effects table, add a new row:

```markdown
| **Cursor screen warp** | Baseline | `initCursorWarp()` → SVG filter `#cursor-warp` + `.cursor-glow` | warp-ambient 6px, warp-max 35px, radius-base 140px, velocity-factor 0.9 |
```

- [ ] **Step 3: Commit**

```bash
git add conductor/effects-reference.md
git commit -m "docs: add cursor screen warp to effects reference"
```

---

## Task 7: Integration test checklist

Manually verify all behaviors before calling the feature done.

- [ ] **Desktop mouse**
  - [ ] Effect is absent until first mousemove (glow fades in, warp activates)
  - [ ] Warp is localized to ~140px radius around cursor, not full page
  - [ ] Fast movement → intense warp + wider RGB split
  - [ ] Slow/still cursor → gentle ambient ripple, subtle glow
  - [ ] Velocity smoothly transitions (no snapping)

- [ ] **Mobile touch (use DevTools device emulation or real device)**
  - [ ] `touchmove` drives warp same as mousemove
  - [ ] No phosphor glow div visible on touch-only device (no `has-cursor` class)
  - [ ] `touchend` → warp speed decays smoothly to ambient

- [ ] **Low-fi mode**
  - [ ] Add `low-fi` class to `<body>` in DevTools
  - [ ] Warp disappears (`.hero { filter: none }`)
  - [ ] Glow div disappears
  - [ ] Scanlines + vignette also off (existing behavior)

- [ ] **Glitch burst interaction**
  - [ ] Glitch bursts still fire normally with cursor warp active
  - [ ] RGB split intensifies correctly during bursts (burst branch unchanged)
  - [ ] No console errors during or after bursts

- [ ] **Power-on animation**
  - [ ] Reload page: turn-on flash plays without visual artifacts
  - [ ] After ~1.2s the cursor warp activates without a visible pop
