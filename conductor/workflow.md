# Project Workflow

## Guiding Principles

1. **The Plan is the Source of Truth:** Non-trivial work is tracked as a track under `conductor/tracks/<name>/`, with a `spec.md` (what/why) and `plan.md` (implementation steps + verification). Small fixes and tuning tweaks don't need a track.
2. **The Stack is Deliberate:** This is a pure static site (HTML/CSS/vanilla JS) with no build step, per `CLAUDE.md`. Don't introduce a bundler, framework, package manager, or dependency to solve a workflow problem.
3. **Manual, Cross-Browser Verification:** There is no automated test suite. Verify changes by opening the site in a browser — check both Chrome and Safari, since the codebase has Safari-specific SVG filter workarounds (see `js/main.js` warp/filter code) that silently no-op elsewhere.
4. **Aesthetic Discipline:** Every visual change should be checked against `CLAUDE.md`'s aesthetic constraints and `conductor/effects-reference.md` before it's considered done.

## Track Workflow

For work large enough to warrant a plan (new effect, structural change, multi-file refactor):

1. **Create the track:** Add `conductor/tracks/<name>_<yyyymmdd>/` with `spec.md` (objective, functional/non-functional requirements) and `plan.md` (background, scope & impact, implementation steps by phase, a verification section). Use the existing tracks (`conductor/tracks/asset_crt_integration_20260512/`, `conductor/tracks/pivot_to_landing_page_20260511/`) as templates.
2. **Register it:** Add an entry to `conductor/tracks.md`.
3. **Work the plan:** Implement phase by phase. Update `plan.md` in place as steps are completed or as the approach changes — this file doesn't need per-task checkbox/SHA bookkeeping, just enough detail that someone can tell what's done.
4. **Verify manually:** Walk through the plan's "Verification" section in an actual browser (Chrome + Safari) before considering the track done.
5. **Close it out:** Mark the track's `metadata.json` status as `done` and move its checkbox in `conductor/tracks.md` if the project distinguishes active vs. completed tracks. Fully superseded or abandoned tracks can move to `conductor/archive/`.

## Development Commands

### Setup
None. No install step, no dependencies. Clone the repo and edit `index.html`, `css/style.css`, `js/main.js` directly.

### Local Preview
```bash
# Serve the site locally (recommended, avoids file:// quirks with fonts/fetch)
python3 -m http.server 8000
# then open http://localhost:8000

# Or just open index.html directly in a browser
```

### Verification
There is no automated test runner — check changes by hand:
- Load the page in **Chrome** and **Safari** (Safari specifically, due to `-webkit`/SVG filter behavior differences called out in `js/main.js` and `conductor/effects-reference.md`).
- Confirm the effect(s) you touched behave as described in `conductor/effects-reference.md`, and update that doc if parameters or behavior changed.
- Check the `.low-fi` / `prefers-reduced-motion` fallback path if you touched anything performance-sensitive.
- Check the browser console for errors and confirm `VERSION` logs correctly on load.

## Versioning

Per `CLAUDE.md`: bump the `VERSION` const at the top of `js/main.js` with every commit that ships a user-visible change.
- **Patch** (x.x.N): bug fixes, tuning, perf, Safari compat.
- **Minor** (x.N.0): new effects, new features.
- **Major** (N.0.0): full visual redesign or architecture overhaul.

## Commit Guidelines

Match the style already used in this repo's history — short, lowercase, `type: description`, no scope parens:

```
feat: implement initCrtNoise with ambient draw loop and burst orchestrator
fix: hide original text behind cursor warp distortion
tune: reduce ambient noise density, extend burst duration
chore: bump version to 1.1.0
debug: add feColorMatrix desaturate to cursor-warp-s to test filter application
docs: update effects-reference and tracks for CRT noise
```

Common types in use: `feat`, `fix`, `tune`, `chore`, `debug`, `docs`. Use whichever fits; consistency with recent `git log` output matters more than a strict taxonomy.

## Deployment

This is a static site served by GitHub Pages via the `CNAME` file at the repo root. There is no build or release pipeline — deployment is just pushing to the branch GitHub Pages serves from (check the repo's Pages settings for which branch; typically `main`). Confirm changes render correctly by browsing the live GitHub Pages URL after pushing.

## Housekeeping

- Keep `conductor/effects-reference.md` in sync with any change to a visual effect's parameters or behavior.
- Keep `conductor/tracks.md` in sync with track status.
- Don't add `package.json`, `scripts/`, a CI config, or a test framework — if a change seems to need one, that's a signal to solve it a simpler way instead.
