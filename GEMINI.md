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
