const fs = require('fs');
const path = require('path');

function replaceRouterPushWithLink(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // We will find instances like:
    // onClick={() => router.push('/dashboard/reports?period=daily')}
    // And if it's on a self-closing tag or opening tag, we need to handle it.
    // Since AST parsing is not available natively, let's use some targeted regexes.

    // Let's replace: <div className="kpi-card k1" style={{ animationDelay: ".1s", cursor: "pointer" }} onClick={() => router.push('/dashboard/reports?period=daily')}>
    // with: <Link href="/dashboard/reports?period=daily" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} className="kpi-card k1" ...>

    // Actually, writing a reliable regex for HTML tags is famously hard.
    // Let's just write a script that does string replacements for the known exact strings in the dashboard.
    
    // For app/dashboard/page.tsx
    if (filePath.endsWith('app\\dashboard\\page.tsx') || filePath.endsWith('app/dashboard/page.tsx')) {
        // Replacements for page.tsx
        const replacements = [
            // KPI Cards
            [
                `<div className="kpi-card k1" style={{ animationDelay: ".1s", cursor: "pointer" }} onClick={() => router.push('/dashboard/reports?period=daily')}>`,
                `<Link href="/dashboard/reports?period=daily" className="kpi-card k1" style={{ animationDelay: ".1s", cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}>`
            ],
            [
                `<div className="kpi-card k2" style={{ animationDelay: ".14s", cursor: "pointer" }} onClick={() => router.push('/dashboard/reports')}>`,
                `<Link href="/dashboard/reports" className="kpi-card k2" style={{ animationDelay: ".14s", cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}>`
            ],
            [
                `<div className="kpi-card k3" style={{ animationDelay: ".18s", cursor: "pointer" }} onClick={() => router.push('/dashboard/invoices')}>`,
                `<Link href="/dashboard/invoices" className="kpi-card k3" style={{ animationDelay: ".18s", cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}>`
            ],
            [
                `<div className="kpi-card k4" style={{ animationDelay: ".22s", cursor: "pointer" }} onClick={() => router.push('/dashboard/inventory')}>`,
                `<Link href="/dashboard/inventory" className="kpi-card k4" style={{ animationDelay: ".22s", cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}>`
            ],
            // Card headers 'see-all'
            [
                `<span className="see-all" onClick={() => router.push('/dashboard/invoices')}>{t.viewAll} →</span>`,
                `<Link href="/dashboard/invoices" className="see-all" style={{ textDecoration: "none" }}>{t.viewAll} →</Link>`
            ],
            [
                `<span className="see-all" onClick={() => router.push('/dashboard/customers')}>{pendingCustomersList.length} →</span>`,
                `<Link href="/dashboard/customers" className="see-all" style={{ textDecoration: "none" }}>{pendingCustomersList.length} →</Link>`
            ],
            [
                `<span className="see-all" onClick={() => router.push('/dashboard/inventory')}>{t.viewAllProducts} {topProducts.length} →</span>`,
                `<Link href="/dashboard/inventory" className="see-all" style={{ textDecoration: "none" }}>{t.viewAllProducts} {topProducts.length} →</Link>`
            ],
            [
                `<span className="see-all" onClick={() => router.push('/dashboard/gst-returns')}>{t.file} →</span>`,
                `<Link href="/dashboard/gst-returns" className="see-all" style={{ textDecoration: "none" }}>{t.file} →</Link>`
            ],
            // inv-row
            [
                `<div className="inv-row" key={inv.id} onClick={() => router.push('/dashboard/invoices')}>`,
                `<Link href="/dashboard/invoices" className="inv-row" key={inv.id} style={{ textDecoration: "none", color: "inherit", display: "flex" }}>`
            ],
            // coll-card
            [
                `<div className="coll-card" key={c.id} onClick={() => router.push('/dashboard/customers/' + c.id)}>`,
                `<Link href={'/dashboard/customers/' + c.id} className="coll-card" key={c.id} style={{ textDecoration: "none", color: "inherit", display: "block" }}>`
            ],
            // prod-card
            [
                `<div className="prod-card" key={i} onClick={() => router.push('/dashboard/inventory')}>`,
                `<Link href="/dashboard/inventory" className="prod-card" key={i} style={{ textDecoration: "none", color: "inherit", display: "block" }}>`
            ],
            // bottom cards
            [
                `<div style={{ animation: "fadeUp .5s .35s ease both", cursor: "pointer" }} onClick={() => router.push('/dashboard/store')}>`,
                `<Link href="/dashboard/store" style={{ animation: "fadeUp .5s .35s ease both", cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}>`
            ],
            [
                `<div className="store-card" style={{ background: "linear-gradient(135deg, #10b981, #059669)", cursor: "pointer", animation: "fadeUp .5s .45s ease both" }} onClick={() => router.push('/dashboard/referral')}>`,
                `<Link href="/dashboard/referral" className="store-card" style={{ background: "linear-gradient(135deg, #10b981, #059669)", cursor: "pointer", animation: "fadeUp .5s .45s ease both", display: "flex", textDecoration: "none", color: "inherit" }}>`
            ],
            // For closing tags, we need to match carefully
            // Instead of closing tags, since we changed opening tag from div to Link, we must change closing div to Link.
            // But how to identify which </div> to close?
            // This is why regex is tricky.
        ];

        // It is much easier and safer to rewrite the code by parsing it with regex or AST.
    }
}
