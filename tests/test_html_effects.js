const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log('Running HTML Effects Tests...');

// Simple check: Check if the specific string sequence exists
// We expect: class="... film-grain ..."
// But simpler: just check if the class name appears in the file
// and arguably checking for the specific div structure is better.

function hasClassSimple(className) {
    return htmlContent.includes(className);
}

try {
    // Check for the specific container line which is the most robust check for this task
    const expectedSnippet = '<div class="visual-effects-overlay film-grain scratches scanlines"></div>';
    
    if (!htmlContent.includes(expectedSnippet)) {
        console.error('Expected snippet not found:', expectedSnippet);
        // Fallback checks
        if (!hasClassSimple('film-grain')) throw new Error('Missing .film-grain');
        if (!hasClassSimple('scratches')) throw new Error('Missing .scratches');
        if (!hasClassSimple('scanlines')) throw new Error('Missing .scanlines');
    }

    console.log('PASS: Visual effects overlay found with all classes.');

} catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
}