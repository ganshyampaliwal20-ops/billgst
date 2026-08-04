import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getBase64Image(filePath) {
    if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).replace('.', '') === 'png' ? 'png' : 'jpeg';
        return `data:image/${ext};base64,${fs.readFileSync(filePath).toString('base64')}`;
    }
    return '';
}

async function main() {
    console.log('Rendering Real Shop & Shopkeeper Marketing Posts with Puppeteer...');

    const logoBase64 = getBase64Image(path.join(__dirname, '../public/billgst-logo.jpg'));
    const kiranaBase64 = getBase64Image(path.join(__dirname, '../public/shop-photos/kirana_store.jpg'));
    const hardwareBase64 = getBase64Image(path.join(__dirname, '../public/shop-photos/hardware_store.jpg'));
    const shopkeeperBase64 = getBase64Image(path.join(__dirname, '../public/shop-photos/shopkeeper.jpg'));
    const billingBase64 = getBase64Image(path.join(__dirname, '../public/shop-photos/billing_counter.jpg'));

    // 1. SQUARE POST (1080x1080) WITH REAL PHOTOS
    const squareHtml = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Noto+Sans+Devanagari:wght@600;700;800;900&display=swap');
            
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: 'Plus Jakarta Sans', 'Noto Sans Devanagari', system-ui, sans-serif;
                background: #020617;
                width: 1080px;
                height: 1080px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                padding: 24px;
            }
            .post-wrapper {
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0a0e27 45%, #020617 100%);
                border: 3px solid #3b82f6;
                border-radius: 32px;
                padding: 28px 32px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 25px 70px rgba(0,0,0,0.85);
                position: relative;
                overflow: hidden;
            }

            /* Header */
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 2px solid rgba(56, 189, 248, 0.25);
                padding-bottom: 14px;
            }
            .brand {
                display: flex;
                align-items: center;
                gap: 14px;
            }
            .logo-wrap {
                height: 56px;
                padding: 4px 10px;
                background: #38bdf8;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 14px rgba(56, 189, 248, 0.4);
            }
            .logo-wrap img {
                height: 46px;
                object-fit: contain;
                border-radius: 6px;
            }
            .brand-title {
                font-size: 32px;
                font-weight: 900;
                line-height: 1;
            }
            .brand-title span { color: #38bdf8; }
            .brand-sub {
                font-size: 11.5px;
                font-weight: 700;
                color: #94a3b8;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-top: 3px;
            }
            .top-badges {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .playstore-btn {
                background: #000000;
                border: 1.5px solid rgba(255,255,255,0.3);
                padding: 7px 14px;
                border-radius: 10px;
                font-size: 13px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .free-tag {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                padding: 7px 16px;
                border-radius: 30px;
                font-size: 14px;
                font-weight: 900;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
            }

            /* Real Photos Grid Spotlight (Kirana + Hardware + Shopkeeper) */
            .real-photos-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 12px;
                margin: 10px 0;
            }
            .photo-card {
                position: relative;
                height: 145px;
                border-radius: 16px;
                overflow: hidden;
                border: 2px solid rgba(56, 189, 248, 0.3);
                box-shadow: 0 6px 18px rgba(0,0,0,0.5);
            }
            .photo-card img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            .photo-badge {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 80%, transparent 100%);
                padding: 6px 10px;
                font-size: 12px;
                font-weight: 800;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .photo-badge .label {
                color: #ffffff;
            }
            .photo-badge .tag {
                background: #f59e0b;
                color: #000000;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 9.5px;
                font-weight: 900;
            }

            /* Main Title */
            .main-title {
                text-align: center;
                margin: 4px 0 8px;
            }
            .category-bar {
                display: inline-block;
                background: rgba(245, 158, 11, 0.15);
                border: 1.5px solid rgba(245, 158, 11, 0.4);
                color: #fbbf24;
                padding: 3px 14px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 800;
                margin-bottom: 4px;
            }
            .main-title h2 {
                font-size: 26px;
                font-weight: 900;
                line-height: 1.2;
                letter-spacing: -0.5px;
            }
            .main-title h2 .gold { color: #fbbf24; }
            .main-title h2 .cyan { color: #38bdf8; }

            /* 2 Big Action Highlights: GST vs Non-GST */
            .two-cards {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 8px;
            }
            .card {
                border-radius: 14px;
                padding: 12px 14px;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .card.gst {
                background: rgba(56, 189, 248, 0.1);
                border: 2px solid rgba(56, 189, 248, 0.45);
            }
            .card.nongst {
                background: rgba(245, 158, 11, 0.1);
                border: 2px solid rgba(245, 158, 11, 0.45);
            }
            .card-head {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .card-head .icon { font-size: 22px; }
            .card-head .h-title { font-size: 15px; font-weight: 900; }
            .card.gst .h-title { color: #38bdf8; }
            .card.nongst .h-title { color: #fbbf24; }
            .card-items {
                display: flex;
                flex-direction: column;
                gap: 4px;
                font-size: 12px;
                font-weight: 600;
                color: #f1f5f9;
            }
            .card-items div { display: flex; align-items: center; gap: 5px; }
            .card-items span.tick { color: #10b981; font-weight: 900; }

            /* 3 Alerts Row */
            .alerts-row {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 10px;
                margin-bottom: 8px;
            }
            .alert-pill {
                border-radius: 12px;
                padding: 8px 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .alert-pill.ai {
                background: rgba(56, 189, 248, 0.12);
                border: 1.5px solid rgba(56, 189, 248, 0.4);
            }
            .alert-pill.lowstock {
                background: rgba(239, 68, 68, 0.15);
                border: 1.5px solid rgba(239, 68, 68, 0.5);
            }
            .alert-pill.expiry {
                background: rgba(245, 158, 11, 0.15);
                border: 1.5px solid rgba(245, 158, 11, 0.5);
            }
            .alert-pill .p-icon { font-size: 20px; }
            .alert-pill .p-title { font-size: 12px; font-weight: 800; line-height: 1.2; }
            .alert-pill .p-desc { font-size: 9.5px; color: #94a3b8; }

            /* 6 Supporting Badges */
            .badges-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 6px;
                margin-bottom: 8px;
            }
            .badge-item {
                background: rgba(15, 23, 42, 0.65);
                border: 1px solid rgba(56, 189, 248, 0.2);
                border-radius: 8px;
                padding: 6px 8px;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                font-weight: 700;
                color: #e2e8f0;
            }

            /* Free Promo Strip */
            .promo-strip {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border-radius: 10px;
                padding: 8px 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
            }
            .promo-strip .text {
                font-size: 13.5px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            /* Big Helpline Bar */
            .helpline-footer {
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
                color: #000000;
                border-radius: 12px;
                padding: 10px 18px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-weight: 900;
                font-size: 16px;
                box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);
            }
            .helpline-footer .num {
                font-size: 19px;
                text-decoration: underline;
            }
            .helpline-footer .site {
                font-size: 13px;
                background: #000000;
                color: #fbbf24;
                padding: 3px 10px;
                border-radius: 6px;
            }
        </style>
    </head>
    <body>
        <div class="post-wrapper">
            <!-- Header -->
            <div class="header">
                <div class="brand">
                    <div class="logo-wrap">
                        <img src="${logoBase64}" alt="BillGST Logo" />
                    </div>
                    <div>
                        <div class="brand-title">Bill<span>GST</span></div>
                        <div class="brand-sub">स्मार्ट बिलिंग & दुकान सॉफ्टवेयर</div>
                    </div>
                </div>

                <div class="top-badges">
                    <div class="playstore-btn">
                        <span>▶</span> Google Play Store
                    </div>
                    <div class="free-tag">
                        🎉 100% मुफ़्त ऐप
                    </div>
                </div>
            </div>

            <!-- REAL PHOTOS GRID (Kirana Store, Shopkeeper, Hardware Store) -->
            <div class="real-photos-grid">
                <div class="photo-card">
                    <img src="${kiranaBase64}" alt="Kirana General Store" />
                    <div class="photo-badge">
                        <span class="label">🏪 किराना & जनरल स्टोर</span>
                        <span class="tag">100% FREE</span>
                    </div>
                </div>
                <div class="photo-card">
                    <img src="${shopkeeperBase64}" alt="Smiling Retail Shopkeeper Counter" />
                    <div class="photo-badge">
                        <span class="label">👨‍💼 संतुष्ट दुकानदार</span>
                        <span class="tag">फास्ट बिलिंग</span>
                    </div>
                </div>
                <div class="photo-card">
                    <img src="${hardwareBase64}" alt="Hardware & Sanitary Store" />
                    <div class="photo-badge">
                        <span class="label">🔩 हार्डवेयर & सेनेटरी</span>
                        <span class="tag">ऑटो स्टॉक</span>
                    </div>
                </div>
            </div>

            <!-- Title -->
            <div class="main-title">
                <h2><span class="cyan">GST पक्का बिल</span> और <span class="gold">Non-GST सादा बिल</span> बनाएं सिर्फ 10 सेकंड में!</h2>
            </div>

            <!-- 2 Cards: GST vs Non-GST -->
            <div class="two-cards">
                <div class="card gst">
                    <div class="card-head">
                        <div class="icon">🧾</div>
                        <div>
                            <div class="h-title">1. GST पक्का बिल (टैक्स इनवॉइस)</div>
                        </div>
                    </div>
                    <div class="card-items">
                        <div><span class="tick">✓</span> HSN कोड & ऑटो CGST/SGST/IGST</div>
                        <div><span class="tick">✓</span> B2B और B2C बिलिंग, E-Way Bill</div>
                        <div><span class="tick">✓</span> CA के लिए GSTR-1, GSTR-3B रिपोर्ट</div>
                    </div>
                </div>

                <div class="card nongst">
                    <div class="card-head">
                        <div class="icon">📄</div>
                        <div>
                            <div class="h-title">2. Non-GST सादा बिल (रसीद & पर्चा)</div>
                        </div>
                    </div>
                    <div class="card-items">
                        <div><span class="tick">✓</span> बिना GST नंबर के भी 100% मान्य रसीद</div>
                        <div><span class="tick">✓</span> 2" & 3" थर्मल प्रिंटर पर तुरंत प्रिंट</div>
                        <div><span class="tick">✓</span> डिलीवरी चालान, एस्टीमेट व कोटेशन</div>
                    </div>
                </div>
            </div>

            <!-- 3 Smart Alerts -->
            <div class="alerts-row">
                <div class="alert-pill ai">
                    <div class="p-icon">📸</div>
                    <div>
                        <div class="p-title" style="color: #38bdf8;">AI स्मार्ट स्कैनर</div>
                        <div class="p-desc">पर्चे की फोटो से तुरंत बिल</div>
                    </div>
                </div>

                <div class="alert-pill lowstock">
                    <div class="p-icon">⚠️</div>
                    <div>
                        <div class="p-title" style="color: #ef4444;">लो-स्टॉक ऑटो अलर्ट</div>
                        <div class="p-desc">सामान खत्म होने से पहले सूचना</div>
                    </div>
                </div>

                <div class="alert-pill expiry">
                    <div class="p-icon">⏳</div>
                    <div>
                        <div class="p-title" style="color: #fbbf24;">एक्सपायरी डेट अलर्ट</div>
                        <div class="p-desc">तारीख निकलने से पहले अलर्ट</div>
                    </div>
                </div>
            </div>

            <!-- 6 Supporting Badges -->
            <div class="badges-grid">
                <div class="badge-item">🎙️ बोलकर बिलिंग (Voice AI)</div>
                <div class="badge-item">💬 WhatsApp ऑटो बिल</div>
                <div class="badge-item">📒 डिजिटल उधारी खाता</div>
                <div class="badge-item">👥 स्टाफ हाजिरी & सैलरी</div>
                <div class="badge-item">🛒 फ्री ऑनलाइन दुकान</div>
                <div class="badge-item">💰 दैनिक खर्चे & मुनाफा</div>
            </div>

            <!-- Free Promo Strip -->
            <div class="promo-strip">
                <div class="text">🎁 100% मुफ़्त ऐप · लाइफटाइम कोई चार्ज नहीं (LifeTime Free)</div>
                <div style="background: #ffffff; color: #059669; font-weight: 900; font-size: 11.5px; padding: 3px 8px; border-radius: 4px;">
                    100% FREE
                </div>
            </div>

            <!-- Helpline Footer -->
            <div class="helpline-footer">
                <div>📞 24x7 हेल्पलाइन / WhatsApp: <span class="num">+91 74985 71873</span></div>
                <div class="site">🌐 www.billgst.com</div>
            </div>
        </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
    await page.setContent(squareHtml, { waitUntil: 'networkidle0' });

    const postPath = path.join(__dirname, '../public/marketing-real-post.jpg');
    const artifactPath = 'C:\\Users\\Ghanshyam\\.gemini\\antigravity\\brain\\5ddc4b09-6707-4919-b279-87c1724fc0e1\\billgst_real_shopkeeper_post.jpg';

    await page.screenshot({ path: postPath, type: 'jpeg', quality: 95 });
    await page.screenshot({ path: artifactPath, type: 'jpeg', quality: 95 });
    console.log('✅ Generated Real Shopkeeper Post at:', postPath);

    // 2. FULL A4 POSTER (1200x1600) WITH REAL PHOTOS
    const a4Html = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Noto+Sans+Devanagari:wght@600;700;800;900&display=swap');
            
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: 'Plus Jakarta Sans', 'Noto Sans Devanagari', system-ui, sans-serif;
                background: #020617;
                width: 1200px;
                height: 1600px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                padding: 36px;
            }
            .poster-box {
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0a0e27 45%, #020617 100%);
                border: 3px solid #3b82f6;
                border-radius: 32px;
                padding: 36px 42px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 25px 70px rgba(0,0,0,0.85);
                position: relative;
            }

            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 2px solid rgba(56, 189, 248, 0.25);
                padding-bottom: 18px;
            }
            .brand { display: flex; align-items: center; gap: 16px; }
            .logo-wrap {
                height: 68px;
                padding: 4px 12px;
                background: #38bdf8;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 16px rgba(56, 189, 248, 0.4);
            }
            .logo-wrap img { height: 56px; object-fit: contain; }
            .brand-title { font-size: 38px; font-weight: 900; line-height: 1; }
            .brand-title span { color: #38bdf8; }
            .brand-sub { font-size: 13px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px; }
            
            .top-badges { display: flex; align-items: center; gap: 12px; }
            .playstore-btn {
                background: #000000;
                border: 1.5px solid rgba(255,255,255,0.3);
                padding: 8px 16px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .free-tag {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                padding: 8px 20px;
                border-radius: 30px;
                font-size: 15px;
                font-weight: 900;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
            }

            /* Real Photos Grid (Kirana, Shopkeeper, Hardware, Billing) */
            .real-photos-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
                margin: 14px 0;
            }
            .photo-card {
                position: relative;
                height: 170px;
                border-radius: 16px;
                overflow: hidden;
                border: 2px solid rgba(56, 189, 248, 0.35);
                box-shadow: 0 6px 18px rgba(0,0,0,0.5);
            }
            .photo-card img { width: 100%; height: 100%; object-fit: cover; }
            .photo-badge {
                position: absolute;
                bottom: 0; left: 0; right: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 80%, transparent 100%);
                padding: 8px 10px;
                font-size: 12px;
                font-weight: 800;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .photo-badge .label { color: #ffffff; }
            .photo-badge .tag {
                background: #f59e0b;
                color: #000000;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 900;
            }

            .hero { text-align: center; margin: 10px 0 16px; }
            .tag-pill {
                display: inline-block;
                background: rgba(245, 158, 11, 0.15);
                border: 1.5px solid rgba(245, 158, 11, 0.4);
                color: #fbbf24;
                padding: 5px 20px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 800;
                margin-bottom: 6px;
            }
            .hero h2 { font-size: 34px; font-weight: 900; line-height: 1.25; letter-spacing: -0.5px; margin-bottom: 4px; }
            .hero p { font-size: 16px; color: #94a3b8; }

            .two-cards {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 14px;
            }
            .card {
                border-radius: 18px;
                padding: 16px 20px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .card.gst {
                background: rgba(56, 189, 248, 0.1);
                border: 2px solid rgba(56, 189, 248, 0.45);
            }
            .card.nongst {
                background: rgba(245, 158, 11, 0.1);
                border: 2px solid rgba(245, 158, 11, 0.45);
            }
            .card-head { display: flex; align-items: center; gap: 10px; }
            .card-head .icon { font-size: 28px; }
            .card-head .h-title { font-size: 18px; font-weight: 900; }
            .card.gst .h-title { color: #38bdf8; }
            .card.nongst .h-title { color: #fbbf24; }
            .card-items {
                display: flex;
                flex-direction: column;
                gap: 6px;
                font-size: 13.5px;
                font-weight: 600;
                color: #f1f5f9;
            }
            .card-items div { display: flex; align-items: center; gap: 6px; }
            .card-items span.tick { color: #10b981; font-weight: 900; }

            .alerts-row {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 14px;
                margin-bottom: 14px;
            }
            .alert-pill {
                border-radius: 14px;
                padding: 12px 14px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .alert-pill.ai {
                background: rgba(56, 189, 248, 0.12);
                border: 1.5px solid rgba(56, 189, 248, 0.4);
            }
            .alert-pill.lowstock {
                background: rgba(239, 68, 68, 0.15);
                border: 1.5px solid rgba(239, 68, 68, 0.5);
            }
            .alert-pill.expiry {
                background: rgba(245, 158, 11, 0.15);
                border: 1.5px solid rgba(245, 158, 11, 0.5);
            }
            .alert-pill .p-icon { font-size: 24px; }
            .alert-pill .p-title { font-size: 14px; font-weight: 800; }
            .alert-pill .p-desc { font-size: 11.5px; color: #94a3b8; }

            .features-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-bottom: 14px;
            }
            .feat-card {
                background: rgba(15, 23, 42, 0.65);
                border: 1px solid rgba(56, 189, 248, 0.2);
                border-radius: 12px;
                padding: 10px 12px;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .feat-title { font-size: 13.5px; font-weight: 800; color: #ffffff; }
            .feat-desc { font-size: 11px; color: #94a3b8; }

            .promo-strip {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border-radius: 14px;
                padding: 12px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
            }
            .promo-strip .text { font-size: 16px; font-weight: 900; text-transform: uppercase; }

            .helpline-footer {
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
                color: #000000;
                border-radius: 14px;
                padding: 14px 22px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-weight: 900;
                font-size: 19px;
                box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
            }
            .helpline-footer .num { font-size: 22px; text-decoration: underline; }
            .helpline-footer .site { font-size: 15px; background: #000000; color: #fbbf24; padding: 4px 12px; border-radius: 6px; }

            .footer-info {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-top: 2px dashed rgba(56, 189, 248, 0.25);
                padding-top: 10px;
                font-size: 13.5px;
                color: #94a3b8;
            }
        </style>
    </head>
    <body>
        <div class="poster-box">
            <!-- Header -->
            <div class="header">
                <div class="brand">
                    <div class="logo-wrap">
                        <img src="${logoBase64}" alt="BillGST Logo" />
                    </div>
                    <div>
                        <div class="brand-title">Bill<span>GST</span></div>
                        <div class="brand-sub">ऑल-इन-वन स्मार्ट बिलिंग & दुकान सॉफ्टवेयर</div>
                    </div>
                </div>

                <div class="top-badges">
                    <div class="playstore-btn">
                        <span>▶</span> Google Play Store
                    </div>
                    <div class="free-tag">
                        🎉 100% मुफ़्त ऐप
                    </div>
                </div>
            </div>

            <!-- REAL PHOTOS 4-GRID (Kirana, Retail Shopkeeper, Hardware, Billing Counter) -->
            <div class="real-photos-grid">
                <div class="photo-card">
                    <img src="${kiranaBase64}" alt="Kirana General Store" />
                    <div class="photo-badge">
                        <span class="label">🏪 किराना & जनरल स्टोर</span>
                        <span class="tag">100% FREE</span>
                    </div>
                </div>
                <div class="photo-card">
                    <img src="${shopkeeperBase64}" alt="Happy Shopkeeper Counter" />
                    <div class="photo-badge">
                        <span class="label">👨‍💼 संतुष्ट दुकानदार</span>
                        <span class="tag">सुपरफास्ट</span>
                    </div>
                </div>
                <div class="photo-card">
                    <img src="${hardwareBase64}" alt="Hardware & Sanitary Store" />
                    <div class="photo-badge">
                        <span class="label">🔩 हार्डवेयर & सेनेटरी</span>
                        <span class="tag">ऑटो स्टॉक</span>
                    </div>
                </div>
                <div class="photo-card">
                    <img src="${billingBase64}" alt="Fast Retail Billing Counter" />
                    <div class="photo-badge">
                        <span class="label">🧾 बिलिंग काउंटर</span>
                        <span class="tag">थर्मल 2"/3"</span>
                    </div>
                </div>
            </div>

            <!-- Hero -->
            <div class="hero">
                <div class="tag-pill">
                    <span>🧾 GST टैक्स इनवॉइस</span> · <span>📄 Non-GST सादा पर्चा</span> · <span>🖨️ थर्मल 2"/3" & A4</span>
                </div>
                <h2>एक ही ऐप में GST और Non-GST दोनों बिल बनाएं!</h2>
                <p>दुकान पर चाहे पक्का टैक्स बिल बनाना हो या सादी रसीद व कोटेशन — सिर्फ 10 सेकंड में प्रिंट निकालें और WhatsApp पर भेजें!</p>
            </div>

            <!-- GST vs Non-GST Side by Side -->
            <div class="two-cards">
                <div class="card gst">
                    <div class="card-head">
                        <div class="icon">🧾</div>
                        <div>
                            <div class="h-title">1. GST बिल (पक्का टैक्स इनवॉइस)</div>
                            <div style="font-size: 11.5px; color: #94a3b8;">सरकारी नियमों के अनुसार 100% मान्य</div>
                        </div>
                    </div>
                    <div class="card-items">
                        <div><span class="tick">✓</span> HSN/SAC कोड & ऑटो CGST, SGST, IGST टैक्स</div>
                        <div><span class="tick">✓</span> B2B (व्यापारी) और B2C (ग्राहक) बिलिंग</div>
                        <div><span class="tick">✓</span> E-Way Bill & E-Invoice 1-क्लिक जनरेशन</div>
                        <div><span class="tick">✓</span> CA के लिए 1-Click GSTR-1, GSTR-3B Excel रिपोर्ट</div>
                    </div>
                </div>

                <div class="card nongst">
                    <div class="card-head">
                        <div class="icon">📄</div>
                        <div>
                            <div class="h-title">2. Non-GST बिल (सादा पर्चा / एस्टीमेट)</div>
                            <div style="font-size: 11.5px; color: #94a3b8;">बिना GST नंबर के भी आसान और सुरक्षित बिलिंग</div>
                        </div>
                    </div>
                    <div class="card-items">
                        <div><span class="tick">✓</span> बिना टैक्स जोड़े सादा बिल और पक्की रसीद</div>
                        <div><span class="tick">✓</span> डिलीवरी चालान, एस्टीमेट व कोटेशन बनाएं</div>
                        <div><span class="tick">✓</span> 2" और 3" थर्मल प्रिंटर पर तुरंत रसीद प्रिंट</div>
                        <div><span class="tick">✓</span> सीधे ग्राहक के WhatsApp पर ऑटो PDF रसीद भेजें</div>
                    </div>
                </div>
            </div>

            <!-- Smart Retail Alerts -->
            <div class="alerts-row">
                <div class="alert-pill ai">
                    <div class="p-icon">📸</div>
                    <div>
                        <div class="p-title" style="color: #38bdf8;">AI स्मार्ट स्कैनर</div>
                        <div class="p-desc">पुराने बिल या पर्चे की फोटो से तुरंत डिजिटल बिल</div>
                    </div>
                </div>

                <div class="alert-pill lowstock">
                    <div class="p-icon">⚠️</div>
                    <div>
                        <div class="p-title" style="color: #ef4444;">लो-स्टॉक ऑटो अलर्ट</div>
                        <div class="p-desc">सामान खत्म होने से पहले चेतावनी, सेल न रुके</div>
                    </div>
                </div>

                <div class="alert-pill expiry">
                    <div class="p-icon">⏳</div>
                    <div>
                        <div class="p-title" style="color: #fbbf24;">एक्सपायरी डेट अलर्ट</div>
                        <div class="p-desc">तारीख निकलने से पहले सूचना, 0% नुकसान</div>
                    </div>
                </div>
            </div>

            <!-- Features 6-Grid -->
            <div class="features-grid">
                <div class="feat-card">
                    <div class="feat-title">🎙️ बोलकर बिलिंग</div>
                    <div class="feat-desc">बिना टाइप किए सिर्फ आवाज से सामान जोड़ें।</div>
                </div>
                <div class="feat-card">
                    <div class="feat-title">💬 WhatsApp बॉट</div>
                    <div class="feat-desc">ग्राहक को ऑटो बिल और उधारी पेमेंट रिमाइंडर।</div>
                </div>
                <div class="feat-card">
                    <div class="feat-title">📒 डिजिटल उधारी खाता</div>
                    <div class="feat-desc">ग्राहक और सप्लायर दोनों का 100% सुरक्षित हिसाब।</div>
                </div>
                <div class="feat-card">
                    <div class="feat-title">👥 स्टाफ हाजिरी & सैलरी</div>
                    <div class="feat-desc">कर्मचारियों की अटेंडेंस, एडवांस और वेतन हिसाब।</div>
                </div>
                <div class="feat-card">
                    <div class="feat-title">🛒 फ्री ऑनलाइन दुकान</div>
                    <div class="feat-desc">व्हाट्सएप कैटलॉग शेयर करें, ऑनलाइन आर्डर पाएं।</div>
                </div>
                <div class="feat-card">
                    <div class="feat-title">💰 दैनिक खर्चे & मुनाफा</div>
                    <div class="feat-desc">रोजाना बिक्री, खर्च और शुद्ध मुनाफे का लाइव हिसाब।</div>
                </div>
            </div>

            <!-- Free Strip -->
            <div class="promo-strip">
                <div class="text">🎁 100% मुफ़्त ऐप · लाइफटाइम कोई चार्ज नहीं (LifeTime FREE App)</div>
                <div style="background: #ffffff; color: #047857; font-weight: 900; font-size: 13.5px; padding: 4px 12px; border-radius: 6px;">
                    100% FREE
                </div>
            </div>

            <!-- Helpline Footer -->
            <div class="helpline-footer">
                <div>📞 / 💬 24x7 हेल्पलाइन: <span class="num">+91 74985 71873</span></div>
                <div class="site">🌐 www.billgst.com</div>
            </div>

            <div class="footer-info">
                <div>📲 <strong>Google Play Store</strong> पर 'BillGST' सर्च करें या <strong>www.billgst.com</strong> खोलें</div>
                <div>📍 पूरे भारत के किराना, हार्डवेयर और सभी दुकानदारों के लिए 100% सुरक्षित</div>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
    await page.setContent(a4Html, { waitUntil: 'networkidle0' });

    const a4PosterPath = path.join(__dirname, '../public/marketing-real-poster.jpg');
    const a4ArtifactPath = 'C:\\Users\\Ghanshyam\\.gemini\\antigravity\\brain\\5ddc4b09-6707-4919-b279-87c1724fc0e1\\billgst_real_shopkeeper_flyer.jpg';

    await page.screenshot({ path: a4PosterPath, type: 'jpeg', quality: 95 });
    await page.screenshot({ path: a4ArtifactPath, type: 'jpeg', quality: 95 });
    console.log('✅ Generated Real A4 Poster at:', a4PosterPath);

    await browser.close();
    console.log('🎉 All Real Shopkeeper & Shop Posters Generated!');
}

main().catch(console.error);
