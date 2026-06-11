const fs = require('fs');

let pageContent = fs.readFileSync('app/page.tsx', 'utf-8');

const referSectionStart = pageContent.indexOf('            {/* REFER & EARN SECTION */}');
if (referSectionStart === -1) {
    console.log("Could not find start");
    process.exit(1);
}

const testimonialsStart = pageContent.indexOf('            {/* TESTIMONIALS */}');
if (testimonialsStart === -1) {
    console.log("Could not find end");
    process.exit(1);
}

const referSectionContent = pageContent.substring(referSectionStart, testimonialsStart);

// Remove the section from its original place
pageContent = pageContent.substring(0, referSectionStart) + pageContent.substring(testimonialsStart);

// Now find where to insert it: After DEDICATED REFER & EARN SECTION ends.
const featuresSectionStart = pageContent.indexOf('            {/* FEATURES & GUIDES SECTION (SEO Internal Linking) */}');
if (featuresSectionStart === -1) {
    console.log("Could not find insertion point");
    process.exit(1);
}

// Insert it right before the features section
pageContent = pageContent.substring(0, featuresSectionStart) + referSectionContent + '\n' + pageContent.substring(featuresSectionStart);

fs.writeFileSync('app/page.tsx', pageContent);
console.log('Moved refer section successfully!');
