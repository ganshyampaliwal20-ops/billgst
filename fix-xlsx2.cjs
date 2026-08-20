const fs = require('fs');
let c = fs.readFileSync('app/dashboard/gst-returns/page.tsx', 'utf8');
c = c.replace(/XLSX\.writeFile\(wb, fileName\);/g, 'const XLSX2 = await import("xlsx");\n                    XLSX2.writeFile(wb, fileName);');
fs.writeFileSync('app/dashboard/gst-returns/page.tsx', c);
