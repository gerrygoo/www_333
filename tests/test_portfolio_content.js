const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../demoreel.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log('Running Portfolio Content Tests...');

try {
    const requiredProjects = ['Project A', 'Project B', 'Project C'];
    
    requiredProjects.forEach(project => {
        if (!htmlContent.includes(project)) {
            throw new Error(`Missing ${project} in demoreel.html`);
        }
    });

    const requiredFields = ['CLIENT', 'DATE', 'STATUS'];
    requiredFields.forEach(field => {
        if (!htmlContent.includes(field)) {
            throw new Error(`Missing field ${field} in demoreel.html`);
        }
    });

    console.log('PASS: Portfolio content populated.');

} catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
}