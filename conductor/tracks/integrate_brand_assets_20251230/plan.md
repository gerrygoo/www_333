# Track Plan: Integrate Brand Identity and Visual Assets

## Phase 1: Asset Preparation & Conversion (Priority)
- [ ] Task: Audit `images/symbols/` and `images/textures/` to list all EPS files requiring conversion and check if `inkscape` is available in the shell environment.
- [ ] Task: Develop and execute an Inkscape CLI command/script to convert a single EPS file to SVG as a proof-of-concept, verifying the "no cropping" requirement.
- [ ] Task: Batch convert all remaining EPS assets to SVG using the verified Inkscape method.
- [ ] Task: Conductor - User Manual Verification 'Asset Preparation & Conversion' (Protocol in workflow.md)

## Phase 2: Brand Assets Integration
- [ ] Task: Replace the text-based `<h1 class="hero__logo">` in `index.html` with the official PDI logo image (prefer SVG if available, or high-res PNG).
- [ ] Task: Update `demoreel.html` header to use the graphic logo instead of text.
- [ ] Task: Update `css/style.css` to use the new vector symbols as decorative background elements or dividers (e.g., replacing generic CSS borders or adding to the "cursed" overlay).
- [ ] Task: Conductor - User Manual Verification 'Brand Assets Integration' (Protocol in workflow.md)

## Phase 3: Polish & Refinement
- [ ] Task: Review font usage (`Terminal Grotesque`, `Overconsumption`) in the context of the new graphical logo and adjust CSS weights/sizes if necessary.
- [ ] Task: Verify that `favicon.ico`, `site.webmanifest`, and other icon assets are correctly linked in the HTML `<head>` and displaying properly.
- [ ] Task: Conductor - User Manual Verification 'Polish & Refinement' (Protocol in workflow.md)
