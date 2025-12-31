const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../js/main.js');

console.log('Running Performance Detection Tests...');

try {
    if (!fs.existsSync(jsPath)) {
        throw new Error('js/main.js does not exist');
    }

    const content = fs.readFileSync(jsPath, 'utf8');

    if (!content.includes('prefers-reduced-motion')) {
        throw new Error('Missing prefers-reduced-motion check in js/main.js');
    }

    if (!content.includes('low-fi')) {
        throw new Error('Missing low-fi class logic in js/main.js');
    }

    console.log('PASS: Performance detection logic found.');

} catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
}
