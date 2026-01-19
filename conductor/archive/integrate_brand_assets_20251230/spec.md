# Track Specification: Integrate Brand Identity and Visual Assets

## Overview
This track focuses on replacing the initial text placeholders and CSS-generated effects with the official Paranormal Dynamics, Inc. (PDI) brand assets. A critical prerequisite is ensuring all vector assets (currently in EPS format) are correctly converted to web-ready SVGs without the cropping issues encountered in previous attempts. We will utilize Inkscape for this conversion process.

## Goals
1.  **Asset Readiness:** Successfully convert `images/symbols` and `images/textures` from EPS to SVG using Inkscape, ensuring full canvas retention (no cropping).
2.  **Brand Integration:** Replace the HTML text logo with the official PDI logo image.
3.  **Visual Enrichment:** Incorporate the converted vector symbols and textures into the site design as dividers, background elements, or interactive components.
4.  **Typography Refinement:** Ensure the custom fonts (`Terminal Grotesque`, `Overconsumption`) are applied effectively to the new assets and structures.

## Technical Requirements
*   **Inkscape CLI:** Use the `inkscape` command-line interface for batch processing or precise conversion of EPS files.
*   **SVG Optimization:** Ensure generated SVGs are optimized for web usage (clean code, reasonable file size).
*   **Responsive Images:** Use `<picture>` or `srcset` if necessary for logo scaling, though SVG is preferred for vector logos.

## Constraints
*   **No Cropping:** The conversion process must preserve the entire bounding box of the original EPS artwork.
*   **Inkscape Usage:** We must use Inkscape for the conversion pipeline as it is available and capable of opening the source files.

## Deliverables
*   A directory of valid, uncropped SVG files in `images/symbols/` and `images/textures/`.
*   Updated `index.html` and `demoreel.html` featuring the image-based logo.
*   Updated `css/style.css` integrating the new symbols and textures.
