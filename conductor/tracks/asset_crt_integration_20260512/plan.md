# Track: Asset Integration & CRT Polish

## Background & Motivation
With the landing page layout finalized and the SVG asset conversion completed, we are ready to elevate the "Tech-Noir / Cursed Database" aesthetic. By replacing the static logo with a rapidly shape-shifting sequence of cryptic SVGs, and adding authentic CRT distortions, we will create a more immersive and unpredictable experience.

## Scope & Impact
- **Modified Files:** `index.html`, `css/style.css`, `js/main.js`.
- **New Features:** 
  - Dynamic JS-driven logo swapping using the 32 SVG assets.
  - CSS Chromatic Aberration (`text-shadow`, `drop-shadow`).
  - CSS Screen Warp / Vignette overlay.
  - CSS Power-On flash animation.

## Implementation Steps

### Phase 1: Centralized Glitch Orchestrator (JS)
1. Initialize `js/main.js` with global configuration for "Instability":
   - `GLITCH_FREQUENCY`: Controls how often a glitch "burst" occurs.
   - `GLITCH_DURATION`: How long each burst lasts.
   - `ASSET_PATHS`: Array of all 32 SVG paths.
2. Implement an orchestrator loop that:
   - Randomly triggers a "Glitch Event".
   - During an event, applies a `.is-glitching` class to the `body` and swaps the logo image.
   - Updates CSS Variables (e.g., `--glitch-offset`, `--flicker-intensity`) dynamically.

### Phase 2: Dynamic Glitch Logo
1. Link the logo swapping function to the Glitch Orchestrator.
2. Ensure logo assets are preloaded (or small enough to load instantly) to prevent white flashes during swaps.

### Phase 3: CRT Effects (CSS)
1. **Chromatic Aberration:** Use the `.is-glitching` class to trigger intense RGB splitting.
2. **Screen Warp / Vignette:** Add a persistent glass tube overlay.
3. **Power-On Flash:** Implement the startup animation.

### Phase 4: Adaptive Polish
1. Scale the `GLITCH_FREQUENCY` to 0 (disabled) when `low-fi` is active.

## Verification
- Test in browser to ensure the SVGs load quickly and the swap feels "glitchy".
- Verify the Chromatic Aberration, Vignette, and Power-On flash run smoothly.
- Test with `.low-fi` active to confirm performance fallback.