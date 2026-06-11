const fs = require('fs');

let css = fs.readFileSync('app/landing.css', 'utf-8');
if (!css.includes('.status-bar-protector')) {
    css += `\n\n/* Status Bar Protector for mobile TWAs */\n.status-bar-protector { display: none; width: 100%; background: rgba(6,8,15,0.97); height: max(env(safe-area-inset-top), 36px); z-index: 1000; position: fixed; top: 0; left: 0; }\n@media(max-width:960px) { .status-bar-protector { display: block; } .landing-nav { top: max(env(safe-area-inset-top), 36px) !important; } }`;
    fs.writeFileSync('app/landing.css', css);
}

let tsx = fs.readFileSync('app/page.tsx', 'utf-8');
// remove the paddingTop: isStandalone logic
tsx = tsx.replace(/paddingTop: isStandalone \? '[^']*' : '0',/, '');
tsx = tsx.replace(/height: isStandalone \? 'auto' : '66px',/, "height: '66px',");
tsx = tsx.replace(/paddingBottom: isStandalone \? '[^']*' : '0'/, '');

// Add the protector div right before nav
if (!tsx.includes('className="status-bar-protector"')) {
    tsx = tsx.replace(
        '<nav className="landing-nav" id="nav"',
        '<div className="status-bar-protector"></div>\n            <nav className="landing-nav" id="nav"'
    );
}

fs.writeFileSync('app/page.tsx', tsx);
console.log('Fixed status bar overlap!');
