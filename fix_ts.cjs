const fs = require('fs');
for (const p of ['f:/bill/app/dashboard/invoices/new/page.tsx', 'f:/bill/app/dashboard/inventory/page.tsx']) {
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/scanner\.clear\(\)/g, 'scanner?.clear()');
  fs.writeFileSync(p, c, 'utf8');
}
console.log('Fixed typescript optional chaining!');
