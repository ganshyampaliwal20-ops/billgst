const fs = require('fs');
let content = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// Replace stroke="white" for fc-web
content = content.replace(/<circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"\/>/g, '<circle cx="12" cy="12" r="10" stroke="var(--slate)" strokeWidth="2"/>');
content = content.replace(/<path d="M2 12h20M12 2c-2.5 3-4 6-4 10s1.5 7 4 10M12 2c2.5 3 4 6 4 10s-1.5 7-4 10" stroke="white" strokeWidth="2"\/>/g, '<path d="M2 12h20M12 2c-2.5 3-4 6-4 10s1.5 7 4 10M12 2c2.5 3 4 6 4 10s-1.5 7-4 10" stroke="var(--slate)" strokeWidth="2"/>');
content = content.replace(/<path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"\/>/g, '<path d="M5 12h14M12 5l7 7-7 7" stroke="var(--slate)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>');

// Replace text colors
content = content.replace(/color: "#fff", fontFamily: "'Syne', sans-serif"/g, 'color: "var(--ink)", fontFamily: "\'Syne\', sans-serif"');
content = content.replace(/color: "rgba\\(255,255,255,0.7\\)"/g, 'color: "var(--muted)"');

fs.writeFileSync('app/dashboard/page.tsx', content);
