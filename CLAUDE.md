# PDI — Claude Code Instructions

## Stack constraints
Pure static site. No bundler, no framework, no dependencies, no build step.
All code lives in `index.html`, `css/style.css`, `js/main.js`.
Deployed via GitHub Pages (CNAME). Do not introduce Node, npm, or any toolchain.

## Aesthetic
"Cursed Database" — structured data corrupted by paranormal elements.
Typography: Terminal Grotesque for display, Courier New for body/data.
Palette: white on black. Effects: CRT glitch, scanlines, chromatic aberration.
Keep everything lo-fi, raw, intentional. No gradients, no rounded corners, no animations that feel polished.

## Versioning
Semantic versioning tracked in `VERSION` const at top of `js/main.js`. Logged to console on load.
- **Patch** (x.x.N): bug fixes, tuning, perf, Safari compat
- **Minor** (x.N.0): new effects, new features
- **Major** (N.0.0): full visual redesign or architecture overhaul
Bump VERSION in `js/main.js` with every commit that ships user-visible change.

## Key files
- `conductor/effects-reference.md` — canonical reference for all active visual effects and their tunable parameters
- `conductor/tracks.md` — project track history
