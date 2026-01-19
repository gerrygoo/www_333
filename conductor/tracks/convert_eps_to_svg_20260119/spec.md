# Track Specification: Convert EPS to SVG

## Overview
This track focuses on converting all EPS vector assets in `images/symbols` and `images/textures` to a web-friendly SVG format. The conversion must be done without cropping the images and the resulting SVGs should be optimized for web use.

## Goals
1.  **Asset Conversion:** Convert all EPS files in `images/symbols` and `images/textures` to SVG.
2.  **No Cropping:** The conversion process must preserve the entire bounding box of the original EPS artwork.
3.  **Web Optimization:** The resulting SVG files should be optimized for web use.

## Technical Requirements
*   **Inkscape CLI:** Use the `/Applications/Inkscape.app/Contents/MacOS/inkscape` command-line interface for batch processing or precise conversion of EPS files.
*   **SVG Optimization:** Ensure generated SVGs are optimized for web usage (clean code, reasonable file size).

## Deliverables
*   A directory of valid, uncropped SVG files in `images/symbols/`.
*   A directory of valid, uncropped SVG files in `images/textures/`.
