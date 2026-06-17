const fs = require('fs');
let content = fs.readFileSync('f:/bill/app/page.tsx', 'utf8');
content = content.replace('<li><a href="#pricing">Pricing</a></li>', '');
content = content.replace('<a href="#pricing" onClick={() => setIsMobMenuOpen(false)}>Pricing</a>', '');
content = content.replace('<section className="pricing-sec" id="pricing">', '{false && (<section className="pricing-sec" id="pricing">');

// We use regex to safely find the closing tag just before FAQ
content = content.replace(/<\/section>\s*{\/\* FAQ SECTION \*\//, '</section>\n            )}\n\n            {/* FAQ SECTION */');

fs.writeFileSync('f:/bill/app/page.tsx', content);
