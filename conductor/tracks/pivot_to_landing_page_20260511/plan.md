# Track: Pivot to Landing Page

## Background & Motivation
We are pivoting the project to a scaled-back approach, focusing solely on a single high-impact landing page. The goal is to simplify the scope by removing secondary routes (`demoreel.html`, `contact.html`, `shop.html`) and archiving the incomplete SVG conversion track. This will allow for a more focused delivery of the core "Cursed Database" aesthetic on the home page.

## Scope & Impact
- **Deleted Routes:** `demoreel.html`, `contact.html`, `shop.html`.
- **Modified File:** `index.html` (navigation links removed).
- **Archived Track:** `convert_eps_to_svg_20260119` will be moved to the archive.
- **Documentation Updates:** `conductor/product.md`, `GEMINI.md`, and `conductor/tracks.md` will be updated to reflect the single-page scope.

## Implementation Steps

### Phase 1: Archiving & Documentation Updates
1. Move `conductor/tracks/convert_eps_to_svg_20260119/` to `conductor/archive/convert_eps_to_svg_20260119_incomplete/`.
2. Update `conductor/tracks.md`:
   - Remove the active SVG track.
   - Register this new pivot track.
3. Update `conductor/product.md` to remove features like "Data List Portfolio" and secondary routes, defining the product strictly as an immersive single landing page.
4. Update `GEMINI.md` to remove the deleted HTML files from the directory overview.

### Phase 2: Route Deletion & Cleanup
1. Delete `demoreel.html`, `contact.html`, and `shop.html`.
2. Delete corresponding tests if they exist (e.g., `tests/test_portfolio_*.js`).

### Phase 3: Index Update
1. Update `index.html` to remove the `<nav>` element containing the links to the deleted pages.

## Verification
- Verify the local server serves `index.html` without errors.
- Ensure no broken links remain on the landing page.
- Verify tests pass (or are safely removed if they test deleted files).
