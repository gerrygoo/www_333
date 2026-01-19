const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../css/style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

console.log('Running Portfolio Hover Effect Tests...');

try {
    if (!cssContent.includes('.project-record:hover')) {
        throw new Error('Missing .project-record:hover styling in style.css');
    }

    console.log('PASS: Portfolio hover effect found.');

} catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
}
