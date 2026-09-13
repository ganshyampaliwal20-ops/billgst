const fs = require('fs');
let c = fs.readFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', 'utf8');
c = c.replace(/return \(\s*const dayDateStr/g, 'const dayDateStr');
fs.writeFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', c);
