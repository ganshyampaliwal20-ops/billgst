const fs = require('fs');
let code = fs.readFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', 'utf8');

code = code.replace(/incomeLabel: \{t\('incomeLabel'\)\}/g, 'incomeLabel: "Income / Salary"');
code = code.replace(/incomeLabel: \{t\('incomeLabel'\)\}/g, 'incomeLabel: "Income / Salary"');

fs.writeFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', code);
