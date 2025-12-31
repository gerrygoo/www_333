const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../css/style.css');
const htmlPath = path.join(__dirname, '../index.html');

const cssContent = fs.readFileSync(cssPath, 'utf8');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log('Running Glitch Effect Tests...');

try {
    // 1. Check for keyframes
    if (!cssContent.includes('@keyframes glitch')) {
        throw new Error('Missing @keyframes glitch in style.css');
    }
    
    // 2. Check for .glitch class definition
    if (!cssContent.includes('.glitch {') && !cssContent.includes('.glitch{')) {
        throw new Error('Missing .glitch class definition in style.css');
    }

    // 3. Check if glitch class is applied to logo in HTML
    // Looking for: class="... hero__logo ... glitch ..." or similar
    // We know the logo has class="hero__logo". 
    // We expect it to be modified to include 'glitch'.
    
    // Regex to find hero__logo and glitch in the same class attribute
    const logoRegex = /class="[^"]*hero__logo[^"]*glitch[^"]*"|class="[^"]*glitch[^"]*hero__logo[^"]*"/;
    
    if (!logoRegex.test(htmlContent)) {
         throw new Error('The "glitch" class is not applied to the "hero__logo" element in index.html');
    }

    console.log('PASS: Glitch effect implemented and applied.');

} catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
}
