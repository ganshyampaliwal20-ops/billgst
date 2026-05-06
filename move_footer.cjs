const fs = require('fs');
const file = 'app/dashboard/pricing/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Reduce paddings
content = content.replace(
    'padding: 64px 24px 48px;',
    'padding: 64px 24px 16px;'
);
content = content.replace(
    'padding: 8px 24px 80px;',
    'padding: 0px 24px 80px;'
);
content = content.replace(
    '.plans-section { padding: 8px 16px 60px; }',
    '.plans-section { padding: 0px 16px 60px; }'
);
content = content.replace(
    '.hero { padding: 40px 16px 32px; }',
    '.hero { padding: 20px 16px 0px; }'
);

// 2. Extract pricing footer
const footerRegex = /<div className="pricing-footer">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\{?\/\* Payment Modal/;
const match = content.match(/<div className="pricing-footer">[\s\S]*?<\/div>\s*<\/div>/);
if (match) {
    const footerContent = match[0];
    
    // Remove it from bottom
    content = content.replace(footerContent, '');
    
    // Insert it after trust-row
    const trustRowEndStr = '<div className="trust-item"><span className="trust-icon">🇮🇳</span> Made in India</div>\n                    </div>';
    
    content = content.replace(
        trustRowEndStr,
        trustRowEndStr + '\n\n                    ' + footerContent.replace('pricing-footer', 'pricing-footer" style={{ marginTop: "32px", paddingBottom: "0" }}')
    );
}

fs.writeFileSync(file, content);
console.log('Successfully moved footer and reduced padding');
