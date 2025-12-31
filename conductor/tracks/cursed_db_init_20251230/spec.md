# Track Specification: Initialize "Cursed Database" Portfolio and Core Visual Effects

## Overview
This track focuses on establishing the core visual identity and functional structure of the Paranormal Dynamics, Inc. website. We will implement the "digital decay" aesthetic (film grain, scratches) on the landing page and build the foundational "Data List" portfolio structure using mock data. Crucially, we will also implement adaptive performance logic to ensure these heavy visual effects scale appropriately across different devices.

## Goals
1.  **Visual Foundation:** Implement the "cursed" aesthetic with CSS-based film grain, scratches, and scanlines on `index.html`.
2.  **Portfolio Structure:** Create a reusable, raw-data list component for the Demo Reel section (`demoreel.html`) populated with mock projects (Project A, B, C).
3.  **Adaptive Performance:** Develop a lightweight vanilla JS utility to detect device capability/preference and toggle high-intensity effects.

## User Stories
*   As a visitor, I want to experience an immersive "old film" aesthetic on the home page so that I understand the brand's unique "cursed" identity.
*   As a potential client, I want to view a list of projects presented as raw database records so that I can quickly scan the company's work history.
*   As a mobile user, I want the visual effects to be toned down if my device is low-power so that the site remains usable and responsive.

## Technical Requirements
*   **CSS Filters/Mix-blend-mode:** Use modern CSS for the film grain and overlay effects.
*   **Semantic HTML:** Ensure the "Data List" uses proper list elements (`<ul>`, `<li>`, `<dl>`, `<dt>`, `<dd>`) for accessibility.
*   **Vanilla JS:** Use `window.matchMedia('(prefers-reduced-motion: reduce)')` and potentially `navigator.hardwareConcurrency` (if available/reliable) as signals for effect scaling.
*   **Mock Data:** Hardcode "Project A", "Project B", and "Project C" with placeholder attributes (Client, Date, Status).

## Deliverables
*   Updated `index.html` with full visual effects.
*   New or updated `demoreel.html` with the "Data List" structure.
*   `css/style.css` updated with new effect classes and responsive adjustments.
*   `js/main.js` (or similar) containing the adaptive performance logic.
