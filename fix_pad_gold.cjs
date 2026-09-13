const fs = require('fs');
const file = 'f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/pad\(day\)/g, 'String(day).padStart(2, "0")');
code = code.replace(/T\.gold/g, 'T.amber');
fs.writeFileSync(file, code);
