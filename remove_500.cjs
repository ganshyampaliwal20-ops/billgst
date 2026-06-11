const fs = require('fs');
let pageContent = fs.readFileSync('app/page.tsx', 'utf-8');

const startStr = '            {/* REFER & EARN SECTION */}';
const startIdx = pageContent.indexOf(startStr);

if (startIdx !== -1) {
    // Find the end of that section
    const endStr = '            </section>';
    const endIdx = pageContent.indexOf(endStr, startIdx);
    
    if (endIdx !== -1) {
        // Cut out the section
        pageContent = pageContent.substring(0, startIdx) + pageContent.substring(endIdx + endStr.length);
        fs.writeFileSync('app/page.tsx', pageContent);
        console.log('Deleted section successfully.');
    } else {
        console.log('End of section not found.');
    }
} else {
    console.log('Start of section not found.');
}
