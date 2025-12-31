const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../demoreel.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log('Running Portfolio Structure Tests...');

try {
    if (!htmlContent.includes('class="project-list"') && !htmlContent.includes("class='project-list'")) {
        throw new Error('Missing .project-list class in demoreel.html');
    }

    if (!htmlContent.includes('<dl>') || !htmlContent.includes('<dt>') || !htmlContent.includes('<dd>')) {
        throw new Error('Missing semantic definition list elements (<dl>, <dt>, <dd>) in demoreel.html');
    }

    console.log('PASS: Portfolio structure implemented.');

} catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
}
