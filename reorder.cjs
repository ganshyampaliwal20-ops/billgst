const fs = require('fs');
const file = 'app/dashboard/pricing/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Extract the 4 blocks
const freePlanRegex = /\{\/\* FREE PLAN \*\/\}[\s\S]*?(?=\{\/\* BASIC STARTER \*\/\}|\{\/\* PREMIUM GROWTH \*\/\}|\{\/\* YEARLY PRO \*\/\}|<\/div>\s*<\/div>\s*<div className="pricing-footer">)/;
const basicPlanRegex = /\{\/\* BASIC STARTER \*\/\}[\s\S]*?(?=\{\/\* FREE PLAN \*\/\}|\{\/\* PREMIUM GROWTH \*\/\}|\{\/\* YEARLY PRO \*\/\}|<\/div>\s*<\/div>\s*<div className="pricing-footer">)/;
const premiumPlanRegex = /\{\/\* PREMIUM GROWTH \*\/\}[\s\S]*?(?=\{\/\* FREE PLAN \*\/\}|\{\/\* BASIC STARTER \*\/\}|\{\/\* YEARLY PRO \*\/\}|<\/div>\s*<\/div>\s*<div className="pricing-footer">)/;
const yearlyPlanRegex = /\{\/\* YEARLY PRO \*\/\}[\s\S]*?(?=\{\/\* FREE PLAN \*\/\}|\{\/\* BASIC STARTER \*\/\}|\{\/\* PREMIUM GROWTH \*\/\}|<\/div>\s*<\/div>\s*<div className="pricing-footer">)/;

const freePlan = content.match(freePlanRegex)[0];
const basicPlan = content.match(basicPlanRegex)[0];
const premiumPlan = content.match(premiumPlanRegex)[0];
const yearlyPlan = content.match(yearlyPlanRegex)[0];

// Remove them from content
content = content.replace(freePlan, '');
content = content.replace(basicPlan, '');
content = content.replace(premiumPlan, '');
content = content.replace(yearlyPlan, '');

// Reinsert them in new order: Premium, Yearly, Basic, Free
const newOrder = premiumPlan + yearlyPlan + basicPlan + freePlan;

content = content.replace(/<div className="plans-grid">/, '<div className="plans-grid">\n' + newOrder);

fs.writeFileSync(file, content);
console.log('Successfully reordered plans');
