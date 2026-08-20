const fs = require('fs');
let c = fs.readFileSync('app/dashboard/reports/page.tsx', 'utf8');
c = c.replace(/import \* as XLSX from 'xlsx';/g, '');
c = c.replace(/const ws = XLSX/g, 'const XLSX = await import("xlsx");\n            const ws = XLSX');
fs.writeFileSync('app/dashboard/reports/page.tsx', c);

let c2 = fs.readFileSync('app/dashboard/gst-returns/page.tsx', 'utf8');
c2 = c2.replace(/import \* as XLSX from 'xlsx';/g, '');
c2 = c2.replace(/wb = XLSX\.utils\.book_new\(\);/g, 'const XLSX = await import("xlsx");\n                    wb = XLSX.utils.book_new();');
fs.writeFileSync('app/dashboard/gst-returns/page.tsx', c2);
