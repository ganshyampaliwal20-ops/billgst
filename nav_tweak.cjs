const fs = require('fs');

let pageContent = fs.readFileSync('app/page.tsx', 'utf-8');

// Add Customer Love link to nav-links
pageContent = pageContent.replace(
    '<li><a href="#features">Features</a></li>',
    '<li><a href="#features">Features</a></li>\n                    <li><a href="#testimonials">Customer Love</a></li>'
);

// Add Customer Love link to mob-menu
pageContent = pageContent.replace(
    '<a href="#features" onClick={() => setIsMobMenuOpen(false)}>Features</a>',
    '<a href="#features" onClick={() => setIsMobMenuOpen(false)}>Features</a>\n                <a href="#testimonials" onClick={() => setIsMobMenuOpen(false)}>Customer Love</a>'
);

// Make sure the testimonials section has smooth scrolling
// (it should scroll to #testimonials)

// Let's also ensure html has scroll-behavior: smooth in CSS if it doesn't already
let css = fs.readFileSync('app/landing.css', 'utf-8');
if (!css.includes('scroll-behavior: smooth')) {
    css = `html {\n  scroll-behavior: smooth;\n}\n` + css;
    fs.writeFileSync('app/landing.css', css);
}

fs.writeFileSync('app/page.tsx', pageContent);
console.log('Added Customer Love navigation!');
