# Track Plan: Initialize "Cursed Database" Portfolio and Core Visual Effects

## Phase 1: Core Visual Effects Implementation [checkpoint: d615d09]
- [x] Task: Create specific CSS classes for "film grain", "scratches", and "scanlines" in `css/style.css` using pseudo-elements and background patterns. [fc0bf3b]
- [x] Task: Apply these visual effect classes to `index.html` and verify the "cursed" aesthetic on desktop. [7cb372e]
- [x] Task: Implement a basic "glitch" animation for the main logo or heading on `index.html`. [849e997]
- [x] Task: Conductor - User Manual Verification 'Core Visual Effects Implementation' (Protocol in workflow.md) [d615d09]

## Phase 2: Adaptive Performance Logic
- [x] Task: Create `js/main.js` and implement a function to check for `prefers-reduced-motion` and simple device performance signals (e.g., user agent or screen size as a proxy if hardware concurrency is unreliable). [453c7c3]
- [x] Task: Add logic to `js/main.js` to conditionally toggle a `.low-fi` class on the `<body>` that disables or simplifies complex CSS filters/animations. [453c7c3]
- [x] Task: Update `css/style.css` to define simpler overrides for `.low-fi` mode (e.g., remove grain, stop constant animation). [38f8a9e]
- [~] Task: Conductor - User Manual Verification 'Adaptive Performance Logic' (Protocol in workflow.md)

## Phase 3: "Data List" Portfolio Structure
- [ ] Task: Design the HTML structure for a single "Project Record" using semantic definition lists (`<dl>`) or unsorted lists (`<ul>`) in `demoreel.html`.
- [ ] Task: Populate `demoreel.html` with three mock entries: "Project A", "Project B", and "Project C", including fields for Client, Date, and Status.
- [ ] Task: Style the list entries in `css/style.css` to look like a raw, industrial database (monospaced font, rigid grid, raw borders).
- [ ] Task: Add a hover effect to list items that reveals a "corrupted" or "decoded" state (e.g., text color inversion or slight offset).
- [ ] Task: Conductor - User Manual Verification 'Data List Portfolio Structure' (Protocol in workflow.md)
