const fs = require('fs');
let code = fs.readFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', 'utf8');

code = code.replace(/achievementsTitle: \{t\('achievementsTitle'\)\}/g, 'achievementsTitle: "Achievements"');
code = code.replace(/achievementsTitle: \{t\('achievementsTitle'\)\}/g, 'achievementsTitle: "Achievements"');

fs.writeFileSync('f:/bill/app/dashboard/kharcha-tracker/KharchaTrackerAdvanced.tsx', code);
