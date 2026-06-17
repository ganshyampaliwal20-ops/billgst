const fs = require('fs');

// Fix landing page
let pageContent = fs.readFileSync('f:/bill/app/page.tsx', 'utf8');
pageContent = pageContent.replace(/width: '60px', height: '60px'/g, "width: '35px', height: '35px'");
pageContent = pageContent.replace(/width="28" height="28"/g, 'width="16" height="16"');
fs.writeFileSync('f:/bill/app/page.tsx', pageContent);

// Fix dashboard page
let dashboardContent = fs.readFileSync('f:/bill/app/dashboard/page.tsx', 'utf8');
dashboardContent = dashboardContent.replace(/width: '50px', height: '50px'/g, "width: '30px', height: '30px'");
dashboardContent = dashboardContent.replace(/width="24" height="24"/g, 'width="14" height="14"');
fs.writeFileSync('f:/bill/app/dashboard/page.tsx', dashboardContent);
