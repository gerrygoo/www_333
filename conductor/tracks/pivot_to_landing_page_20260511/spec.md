# Specification: Pivot to Landing Page

## Objective
Reduce the application's complexity by removing all secondary routes and focusing on a high-fidelity single-page landing experience.

## Functional Changes
1.  **URL Redirection (Implicit):** All attempts to access `demoreel.html`, `contact.html`, or `shop.html` will fail (404), ensuring the user only interacts with the root `index.html`.
2.  **Navigation Removal:** The `<nav>` element in `index.html` must be removed or commented out to prevent navigation to non-existent pages.

## Non-Functional Changes
1.  **Performance:** Deletion of unused HTML files will slightly reduce the overall site size.
2.  **Maintainability:** Simplifying the product definition will focus development efforts on a single file (`index.html`).

## Documentation
- `conductor/product.md` must reflect that the site is a single landing page.
- `GEMINI.md` must be updated to remove the deleted files from its "Directory Overview".
