import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSocialPosts() {
    console.log('Generating ultra-vibrant Social Media Posts with Puppeteer...');
    
    // Read logo as base64
    const logoPath = path.join(__dirname, '../public/billgst-logo.jpg');
    let logoBase64 = '';
    if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);
        logoBase64 = `data:image/jpeg;base64,${logoData.toString('base64')}`;
    }

    // 1. Square 1:1 Social Post (1080x1080)
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
                padding: 30px;
            }
            .post-box {
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #090d24 50%, #020617 100%);
                border: 3px solid #3b82f6;
                border-radius: 36px;
                padding: 36px 42px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 25px 70px rgba(0,0,0,0.85);
                position: relative;
                overflow: hidden;
            }
            /* Glowing background circles */
            .glow-1 {
                position: absolute;
                top: -80px;
                right: -80px;
                width: 320px;
                height: 320px;
                background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%);
                border-radius: 50%;
            }
            .glow-2 {
                position: absolute;
                bottom: -80px;
                left: -80px;
                width: 320px;
                height: 320px;
                background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
                border-radius: 50%;
            }

            /* Header */
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 2px solid rgba(56, 189, 248, 0.25);
                padding-bottom: 16px;
                position: relative;
                z-index: 2;
            }
            .brand {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            .logo-wrap {
                height: 64px;
                padding: 4px 12px;
                background: #38bdf8;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 16px rgba(56, 189, 248, 0.4);
            }
            .logo-wrap img {
                height: 54px;
                object-fit: contain;
                border-radius: 6px;
            }
            .brand-title {
                font-size: 38px;
                font-weight: 900;
                line-height: 1;
            }
            .brand-title span { color: #38bdf8; }
            .brand-sub {
                font-size: 13px;
                font-weight: 700;
                color: #94a3b8;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-top: 3px;
            }
            .top-badges {
                display: flex;
                align-items: center;
                gap: 12px;
            }
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
                padding: 8px 18px;
                border-radius: 30px;
                font-size: 15px;
                font-weight: 900;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
            }

            /* Main Title */
            .main-title {
                text-align: center;
                position: relative;
                z-index: 2;
                margin: 12px 0 8px;
            }
            .category-bar {
                display: inline-block;
                background: rgba(245, 158, 11, 0.15);
                border: 1.5px solid rgba(245, 158, 11, 0.4);
                color: #fbbf24;
                padding: 4px 16px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 800;
                margin-bottom: 6px;
            }
            .main-title h2 {
                font-size: 30px;
                font-weight: 900;
                line-height: 1.25;
                letter-spacing: -0.5px;
            }
            .main-title h2 .gold { color: #fbbf24; }
            .main-title h2 .cyan { color: #38bdf8; }

            /* 2 Big Action Highlights: GST vs Non-GST */
            .two-cards {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                position: relative;
                z-index: 2;
                margin-bottom: 12px;
            }
            .card {
                border-radius: 18px;
                padding: 16px 18px;
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
            .card-head {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .card-head .icon { font-size: 26px; }
            .card-head .h-title { font-size: 17px; font-weight: 900; }
            .card.gst .h-title { color: #38bdf8; }
            .card.nongst .h-title { color: #fbbf24; }
            .card-items {
                display: flex;
                flex-direction: column;
                gap: 5px;
                font-size: 13.5px;
                font-weight: 600;
                color: #f1f5f9;
            }
            .card-items div { display: flex; align-items: center; gap: 6px; }
            .card-items span.tick { color: #10b981; font-weight: 900; }

            /* 3 Alerts Row */
            .alerts-row {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 12px;
                position: relative;
                z-index: 2;
                margin-bottom: 12px;
            }
            .alert-pill {
                border-radius: 14px;
                padding: 10px 12px;
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
            .alert-pill .p-icon { font-size: 22px; }
            .alert-pill .p-title { font-size: 13px; font-weight: 800; line-height: 1.2; }
            .alert-pill .p-desc { font-size: 10.5px; color: #94a3b8; }

            /* 6 Supporting Badges */
            .badges-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                position: relative;
                z-index: 2;
                margin-bottom: 12px;
            }
            .badge-item {
                background: rgba(15, 23, 42, 0.65);
                border: 1px solid rgba(56, 189, 248, 0.2);
                border-radius: 10px;
                padding: 8px 10px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                font-weight: 700;
                color: #e2e8f0;
            }

            /* Free Promo Banner */
            .promo-strip {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border-radius: 14px;
                padding: 10px 18px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                z-index: 2;
                margin-bottom: 10px;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
            }
            .promo-strip .text {
                font-size: 15px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            /* Big Helpline Bar */
            .helpline-footer {
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
                color: #000000;
                border-radius: 14px;
                padding: 12px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-weight: 900;
                font-size: 18px;
                position: relative;
                z-index: 2;
                box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
            }
            .helpline-footer .num {
                font-size: 21px;
                text-decoration: underline;
            }
            .helpline-footer .site {
                font-size: 14px;
                background: #000000;
                color: #fbbf24;
                padding: 3px 12px;
                border-radius: 6px;
            }
        </style>
    </head>
    <body>
        <div class="post-box">
            <div class="glow-1"></div>
            <div class="glow-2"></div>

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
                        🎉 100% मुफ़्त
                    </div>
                </div>
            </div>

            <!-- Title -->
            <div class="main-title">
                <div class="category-bar">
                    🏪 किराना & जनरल स्टोर · 🔩 हार्डवेयर & सेनेटरी · 📱 सभी रिटेल दुकानें
                </div>
                <h2><span class="cyan">GST पक्का बिल</span> और <span class="gold">Non-GST सादा बिल</span> बनाएं!</h2>
            </div>

            <!-- 2 Cards: GST vs Non-GST -->
            <div class="two-cards">
                <div class="card gst">
                    <div class="card-head">
                        <div class="icon">🧾</div>
                        <div>
                            <div class="h-title">1. GST पक्का बिल</div>
                            <div style="font-size: 11px; color: #94a3b8;">टैक्स इनवॉइस</div>
                        </div>
                    </div>
                    <div class="card-items">
                        <div><span class="tick">✓</span> HSN कोड & ऑटो CGST/SGST/IGST</div>
                        <div><span class="tick">✓</span> B2B और B2C बिलिंग</div>
                        <div><span class="tick">✓</span> CA हेतु GSTR-1, GSTR-3B रिपोर्ट</div>
                    </div>
                </div>

                <div class="card nongst">
                    <div class="card-head">
                        <div class="icon">📄</div>
                        <div>
                            <div class="h-title">2. Non-GST सादा बिल</div>
                            <div style="font-size: 11px; color: #94a3b8;">सादी रसीद व पर्चा</div>
                        </div>
                    </div>
                    <div class="card-items">
                        <div><span class="tick">✓</span> बिना GST नंबर के भी 100% मान्य</div>
                        <div><span class="tick">✓</span> 2" & 3" थर्मल प्रिंटर रसीद</div>
                        <div><span class="tick">✓</span> कोटेशन & डिलीवरी चालान</div>
                    </div>
                </div>
            </div>

            <!-- 3 Smart Alerts -->
            <div class="alerts-row">
                <div class="alert-pill ai">
                    <div class="p-icon">📸</div>
                    <div>
                        <div class="p-title" style="color: #38bdf8;">AI स्मार्ट स्कैनर</div>
                        <div class="p-desc">फोटो से तुरंत बिल तैयार</div>
                    </div>
                </div>

                <div class="alert-pill lowstock">
                    <div class="p-icon">⚠️</div>
                    <div>
                        <div class="p-title" style="color: #ef4444;">लो-स्टॉक ऑटो अलर्ट</div>
                        <div class="p-desc">माल खत्म होने से पहले सूचना</div>
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
                <div class="badge-item">💬 WhatsApp ऑटो रिमाइंडर</div>
                <div class="badge-item">📒 डिजिटल उधारी खाता</div>
                <div class="badge-item">👥 स्टाफ हाजिरी & सैलरी</div>
                <div class="badge-item">🛒 फ्री ऑनलाइन दुकान</div>
                <div class="badge-item">💰 खर्चे & मुनाफा हिसाब</div>
            </div>

            <!-- Free Promo Strip -->
            <div class="promo-strip">
                <div class="text">🎁 100% मुफ़्त ऐप · लाइफटाइम कोई चार्ज नहीं (No Monthly Fees)</div>
                <div style="background: #ffffff; color: #059669; font-weight: 900; font-size: 13px; padding: 4px 10px; border-radius: 6px;">
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

    const post1Path = path.join(__dirname, '../public/marketing-post.jpg');
    const postWhatsappPath = path.join(__dirname, '../public/marketing-whatsapp.jpg');
    const artifactPostPath = 'C:\\Users\\Ghanshyam\\.gemini\\antigravity\\brain\\5ddc4b09-6707-4919-b279-87c1724fc0e1\\billgst_social_post_final.jpg';

    await page.screenshot({ path: post1Path, type: 'jpeg', quality: 95 });
    await page.screenshot({ path: postWhatsappPath, type: 'jpeg', quality: 95 });
    await page.screenshot({ path: artifactPostPath, type: 'jpeg', quality: 95 });

    console.log('✅ Generated 1:1 Social Post saved at:', post1Path);
    await browser.close();
}

generateSocialPosts().catch(console.error);
