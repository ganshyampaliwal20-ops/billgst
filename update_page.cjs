const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Empty the stats
content = content.replace(
    /<div className="stat"><div className="stat-n">50k\+<\/div><div className="stat-l">Active Users<\/div><\/div>[\s\S]*?<div className="stat"><div className="stat-n">4\.9\/5<\/div><div className="stat-l">PlayStore Rating<\/div><\/div>/m,
    ''
);

// 2. Remove Quick Guide section
content = content.replace(
    /\{\/\* HOW IT WORKS \/ GUIDE \*\/\}[\s\S]*?<\/section>\s*\{\/\* MAGIC FEATURES SHOWCASE \*\/\}/m,
    '{/* MAGIC FEATURES SHOWCASE */}'
);

// 3. Remove Magic Features section
content = content.replace(
    /\{\/\* MAGIC FEATURES SHOWCASE \*\/\}[\s\S]*?<\/section>\s*\{\/\* CORE FEATURES \*\/\}/m,
    '{/* CORE FEATURES */}'
);

fs.writeFileSync('app/page.tsx', content);
console.log('Updated app/page.tsx successfully');
