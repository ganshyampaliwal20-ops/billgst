const fs = require('fs');
let c = fs.readFileSync('f:/bill/app/page.tsx', 'utf8');
c = c.replace('allowFullScreen loading=" lazy\\', 'allowFullScreen loading="lazy"');
fs.writeFileSync('f:/bill/app/page.tsx', c, 'utf8');
console.log('Fixed syntax!');
