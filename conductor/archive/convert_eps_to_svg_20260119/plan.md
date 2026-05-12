# Track Plan: Convert EPS to SVG

## Phase 1: Asset Conversion

- [ ] Task: Create a script to find all `.eps` files in `images/symbols` and `images/textures`.
- [ ] Task: For each `.eps` file, convert it to `.svg` using the Inkscape CLI.
    - [ ] Sub-task: Use the command `/Applications/Inkscape.app/Contents/MacOS/inkscape --export-plain-svg --export-filename=<output.svg> <input.eps>`.
    - [ ] Sub-task: Ensure the output file is created in the same directory as the input file.
- [ ] Task: Verify that all `.eps` files have been converted.
- [ ] Task: Conductor - User Manual Verification 'Asset Conversion' (Protocol in workflow.md)

## Phase 2: Asset Optimization

- [ ] Task: Research and choose a tool for SVG optimization.
- [ ] Task: Create a script to optimize all the newly created SVG files.
- [ ] Task: Verify that all SVG files have been optimized.
- [ ] Task: Conductor - User Manual Verification 'Asset Optimization' (Protocol in workflow.md)
