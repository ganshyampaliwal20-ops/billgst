const fs = require('fs');
let c = fs.readFileSync('app/layout.tsx', 'utf8');
c = c.replace(/media=\"print\"/g, '');
c = c.replace(/\/\/ @ts-ignore/g, '');
c = c.replace(/onLoad=\"this\.media='all'\"/g, '');
fs.writeFileSync('app/layout.tsx', c);
