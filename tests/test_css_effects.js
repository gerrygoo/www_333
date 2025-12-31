const fs = require('fs');
const path = require('path');
const assert = require('assert');

const cssPath = path.join(__dirname, '../css/style.css');

// Read the CSS file
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Helper to check for selector existence
function hasSelector(selector) {
    // Simple check: looking for "selector {" or "selector," (if part of list)
    // or just the selector string if we assume standard formatting
    return cssContent.includes(selector + ' {') || cssContent.includes(selector + '{');
}

// Test Suite
console.log('Running CSS Effects Tests...');

try {
    // 1. Check for .film-grain
    if (!hasSelector('.film-grain')) {
        throw new Error('Missing .film-grain class');
    }
    console.log('PASS: .film-grain exists');

    // 2. Check for .scratches
    if (!hasSelector('.scratches')) {
        throw new Error('Missing .scratches class');
    }
    console.log('PASS: .scratches exists');

    // 3. Check for .scanlines
    if (!hasSelector('.scanlines')) {
        throw new Error('Missing .scanlines class');
    }
    console.log('PASS: .scanlines exists');

} catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
}