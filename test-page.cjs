const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', msg => { if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text()) });
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    await page.goto('http://localhost:3000/dashboard/expenses');
    await page.waitForTimeout(3000);
    await browser.close();
})();
