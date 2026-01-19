const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../css/style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

console.log('Running Low-Fi CSS Tests...');

try {
    if (!cssContent.includes('.low-fi')) {
        throw new Error('Missing .low-fi overrides in style.css');
    }

    // Check for specific overrides
    if (!cssContent.includes('.low-fi .film-grain::before')) {
        throw new Error('Missing .low-fi override for film-grain');
    }

    if (!cssContent.includes('.low-fi .glitch')) {
        throw new Error('Missing .low-fi override for glitch animation');
    }

    console.log('PASS: Low-fi CSS overrides found.');

} catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
}
