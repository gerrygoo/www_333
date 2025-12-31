const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../css/style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

console.log('Running Portfolio Styling Tests...');

try {
    if (!cssContent.includes('.project-list')) {
        throw new Error('Missing .project-list styling in style.css');
    }

    if (!cssContent.includes('.project-record')) {
        throw new Error('Missing .project-record styling in style.css');
    }

    if (!cssContent.includes('.main-header')) {
        throw new Error('Missing .main-header styling in style.css');
    }

    console.log('PASS: Portfolio styling found.');

} catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
}
