const fs = require('fs');

let tsx = fs.readFileSync('app/page.tsx', 'utf-8');

// 1. Remove Voice Billing Pill
tsx = tsx.replace(
    `<div className="hero-pill">\n                    <span className="chip">New</span>\n                    <span>Voice Billing AI is now live! 🎙️</span>\n                </div>`,
    ``
);

// 2. Make "India ki dukan" smaller
tsx = tsx.replace(
    `Smart Billing Software for <br />`,
    `<span style={{ fontSize: '0.8em', opacity: 0.9 }}>Smart Billing Software for</span> <br />`
);
tsx = tsx.replace(
    `India की दुकान के लिए <br />`,
    `<span style={{ fontSize: '0.8em', opacity: 0.9 }}>India की दुकान के लिए</span> <br />`
);

// 3. Change Login Text
tsx = tsx.replace(`"Login to Dashboard"`, `"Login"`);
tsx = tsx.replace(`"डैशबोर्ड में लॉगिन करें"`, `"लॉगिन"`);

// 4. To fit in one row on mobile, we need to add a custom class to hero-actions to force horizontal scroll or fit
// Let's first make the texts slightly shorter for signup as well
tsx = tsx.replace(`"Create Free Account"`, `"Free Account"`);
tsx = tsx.replace(`"नया फ्री अकाउंट बनाएं"`, `"फ्री अकाउंट"`);

// 5. Apply the mobile-row fix in landing.css
let css = fs.readFileSync('app/landing.css', 'utf-8');
if (!css.includes('.hero-actions-row')) {
    css += `\n\n@media(max-width: 600px) {\n  .hero-actions-row {\n    flex-wrap: nowrap !important;\n    overflow-x: auto;\n    justify-content: flex-start !important;\n    padding-bottom: 10px;\n    -webkit-overflow-scrolling: touch;\n  }\n  .hero-actions-row > button, .hero-actions-row > a {\n    white-space: nowrap;\n    flex-shrink: 0;\n    padding: 12px 20px !important;\n    font-size: 15px !important;\n  }\n  .hero-actions-row svg { width: 20px !important; height: 20px !important; }\n  .hero-actions-row > a > div > div:nth-child(1) { font-size: 9px !important; }\n  .hero-actions-row > a > div > div:nth-child(2) { font-size: 14px !important; }\n}`;
    fs.writeFileSync('app/landing.css', css);
}

// 6. Update class name
tsx = tsx.replace(
    `className="hero-actions" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '20px', width: '100%' }}`,
    `className="hero-actions hero-actions-row" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '20px', width: '100%' }}`
);

fs.writeFileSync('app/page.tsx', tsx);
console.log('Applied minor tweaks!');
