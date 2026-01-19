# Project Overview

This is a simple, clean, and modern landing page for a production company called "Paranormal Dynamics, Inc.". It is built with plain HTML and CSS. The visual style is designed to look like an old film, with a black background, white text, and CSS effects that simulate scratches and dust. The site is responsive and uses a mobile-first approach.

## Directory Overview

The directory contains the following files and folders:

-   `index.html`: The main landing page.
-   `demoreel.html`: A placeholder page for a demo reel.
-   `contact.html`: A placeholder page for contact information.
-   `shop.html`: A placeholder page for a shop.
-   `css/`: A folder containing the stylesheets.
    -   `normalize.css`: A CSS reset library to ensure consistent styling across browsers.
    -   `style.css`: The main stylesheet for the website.
-   `fonts/`: A folder containing font files (currently raw `.ttf`/`.otf` and some assets).
-   `images/`: A folder for images.
    -   `logos/`: Contains PDI logo variants.
    -   `symbols/`: Contains vector symbol assets.
    -   `textures/`: Contains vector texture assets.
-   `CNAME`: A file used by GitHub Pages to map a custom domain to the site.
-   `LICENSE`: A file containing the license for the project.
    -   `README.md`: The original README file for the project.
-   `archival/`: Directory for source assets (e.g., `.ai` files) not intended for the web.
-   **Favicon Assets**: `favicon.ico`, `site.webmanifest`, `apple-touch-icon.png`, `android-chrome-*.png`, `favicon-*.png` located in the root.

## Design Research & Inspiration

We are blending aesthetics from three distinct sources to create a "Cursed Database" / "Tech-Noir" vibe.

### 1. Yvette's Bridal Formal (The "Outsider/Cursed" Influence)
-   **Key Elements:** Chaos, centered text walls, repeated punctuation ("!! ~*"), raw HTML colors, low-fi GIF aesthetics, "Under Construction" vibes.
-   **Takeaway:** embrace "wrong" design choices, use text dividers (`~*~*`), fake hit counters, and raw unpolished layouts.

### 2. Goma Xantana (The "Modern/Tech-Noir" Influence)
-   **Key Elements:** High contrast (Black/White), minimalist navigation, media-centric (large video/images), experimental layouts, "AI/Glitch" themes.
-   **Takeaway:** Keep the core structure usable but edgy. Use large media and minimal UI chrome.

### 3. Habitant Productions (The "Professional/Industrial" Influence)
-   **Key Elements:** Grid-based lists (Director / Client / Time), live clocks, industrial monospace typography, raw data presentation.
-   **Takeaway:** Use "Data Lists" for content (e.g., the Demo Reel). Present projects as "Files" or "Cases".

### **Design Pillars for Paranormal Dynamics:**
1.  **"Cursed Database" Aesthetic:** Structured data (lists, timecodes) corrupted by paranormal elements (glitches, weird symbols).
2.  **Typography:** `Terminal Grotesque` / `Overconsumption` for headings (Display), `Courier`/Monospace for data (Body).
3.  **Lo-Fi Interactivity:** Marquees, hover-reveal images, raw text links, "System Status" indicators.

## Available Fonts

The following custom fonts are configured in `css/style.css` and ready for use:

-   `'Mustasurma'`
-   `'Overconsumption'`
-   `'Terminal Grotesque'`
-   `'WordsWithA'`
-   `'YellowWhiteOpozzum'`

## TODOs

-   [ ] Configure GitHub Pages to ignore/exclude the `archival/` directory.
## Key Files

-   **`index.html`**: This is the main entry point for the website. It contains the main heading, tagline, and navigation.
-   **`css/style.css`**: This file contains all of the custom styles for the website. It includes the "old film effect" and the responsive design.

## Building and Running

This is a static website, so there is no build process. To run the website, simply open the `index.html` file in a web browser.

## Development Conventions

-   **File Structure**: Keep the project organized with dedicated folders for `css`, `images`, and `js`.
-   **HTML**: Use semantic tags (`<header>`, `<nav>`, `<main>`, etc.) and provide `alt` text for all images.
-   **CSS**: Follow a mobile-first approach and use a consistent naming convention for classes (e.g., BEM).
