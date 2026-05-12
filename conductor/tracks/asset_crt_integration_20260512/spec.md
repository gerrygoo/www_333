# Specification: Asset Integration & CRT Polish

## Objective
Enhance the "Cursed Database" aesthetic by utilizing the newly converted SVG assets as a shape-shifting central logo and implementing advanced CRT visual effects (Chromatic Aberration, Screen Warp/Vignette, and a Power-On Flash).

## Functional Requirements
1. **Glitching Logo (Asset Integration):**
   - The central `.hero__logo` will no longer be a static image.
   - JavaScript will randomly swap the `src` attribute of the logo with various SVGs from `images/symbols/` and `images/textures/`.
   - The interval of the swap should be randomized to emulate a glitching or unstable signal.
2. **Advanced CRT Effects:**
   - **Chromatic Aberration:** Apply red/cyan channel splitting to text elements (`text-shadow`) and the glitching logo (`filter: drop-shadow()`).
   - **Screen Warp & Vignette:** Add a full-screen overlay that applies an inset shadow and slight border curvature to simulate the depth and darkening corners of an old glass CRT tube.
   - **Power-On Flash:** Implement a CSS animation that runs exactly once when the page loads, starting as a bright horizontal line that expands vertically into the full screen, accompanied by a white flash.

## Non-Functional Requirements
- **Performance:** Ensure SVG swaps and CSS animations don't cause significant layout thrashing or jank. The `.low-fi` class should disable these advanced effects for lower-end devices.
- **Maintainability:** The list of SVG paths should be easily configurable in `js/main.js`.