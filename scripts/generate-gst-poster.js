import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePosters() {
    console.log('Starting HD Poster generation with Puppeteer...');
    
    // Read logo as base64
    const logoPath = path.join(__dirname, '../public/billgst-logo.jpg');
    let logoBase64 = '';
    if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);
        logoBase64 = `data:image/jpeg;base64,${logoData.toString('base64')}`;
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;600;700;800;900&display=swap');
            
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            body {
                font-family: 'Plus Jakarta Sans', 'Noto Sans Devanagari', system-ui, sans-serif;
                background: #030712;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 1200px;
                height: 1600px;
                padding: 40px;
                color: #ffffff;
            }

            .poster-card {
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at 50% 0%, #0d1b46 0%, #050d24 60%, #020510 100%);
                border: 3px solid #1e3a8a;
                border-radius: 32px;
                padding: 40px 48px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 30px 80px rgba(0,0,0,0.8);
                position: relative;
                overflow: hidden;
            }

            .poster-card::before {
                content: '';
                position: absolute;
                top: -150px;
                right: -150px;
                width: 400px;
                height: 400px;
                background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
            }

            /* Header */
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 2px solid rgba(56, 189, 248, 0.25);
                padding-bottom: 20px;
            }

            .brand-left {
                display: flex;
                align-items: center;
                gap: 18px;
            }

            .logo-box {
                height: 72px;
                padding: 6px 14px;
                background: #38bdf8;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 20px rgba(56, 189, 248, 0.35);
            }

            .logo-box img {
                height: 60px;
                object-fit: contain;
                border-radius: 8px;
            }

            .brand-text h1 {
                font-size: 42px;
                font-weight: 900;
                line-height: 1;
                letter-spacing: -1px;
            }

            .brand-text h1 span {
                color: #38bdf8;
            }

            .brand-text p {
                font-size: 14px;
                font-weight: 700;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                margin-top: 4px;
            }

            .header-badges {
                display: flex;
                align-items: center;
                gap: 14px;
            }

            .playstore-badge {
                background: #000000;
                border: 1.5px solid rgba(255,255,255,0.25);
                padding: 10px 18px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 15px;
                font-weight: 800;
            }

            .free-badge {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                padding: 10px 22px;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 900;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
            }

            /* Hero Title */
            .hero {
                text-align: center;
                margin: 20px 0 16px;
            }

            .tag-pill {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                background: rgba(245, 158, 11, 0.15);
                border: 1.5px solid rgba(245, 158, 11, 0.4);
                color: #fbbf24;
                padding: 6px 20px;
                border-radius: 30px;
                font-size: 15px;
                font-weight: 800;
                margin-bottom: 10px;
            }

            .hero h2 {
                font-size: 36px;
                font-weight: 900;
                letter-spacing: -0.5px;
                line-height: 1.2;
                margin-bottom: 6px;
            }

            .hero p {
                font-size: 17px;
                color: #94a3b8;
                max-width: 850px;
                margin: 0 auto;
            }

            /* GST vs Non-GST Comparison Cards */
            .comparison-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 18px;
            }

            .comp-card {
                border-radius: 20px;
                padding: 20px 24px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .comp-card.gst {
                background: rgba(56, 189, 248, 0.08);
                border: 2px solid rgba(56, 189, 248, 0.4);
            }

            .comp-card.nongst {
                background: rgba(245, 158, 11, 0.08);
                border: 2px solid rgba(245, 158, 11, 0.4);
            }

            .comp-header {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .comp-header .icon {
                font-size: 32px;
            }

            .comp-header .title {
                font-size: 20px;
                font-weight: 900;
            }

            .comp-card.gst .title { color: #38bdf8; }
            .comp-card.nongst .title { color: #fbbf24; }

            .comp-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                font-size: 14.5px;
                font-weight: 600;
                color: #e2e8f0;
            }

            .comp-list div {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .comp-list span.check {
                color: #10b981;
                font-weight: 900;
            }

            /* Real Alerts Spotlight */
            .alerts-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 14px;
                margin-bottom: 18px;
            }

            .alert-box {
                border-radius: 16px;
                padding: 14px 16px;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .alert-box.ai {
                background: rgba(56, 189, 248, 0.12);
                border: 1.5px solid rgba(56, 189, 248, 0.4);
            }

            .alert-box.lowstock {
                background: rgba(239, 68, 68, 0.14);
                border: 1.5px solid rgba(239, 68, 68, 0.5);
            }

            .alert-box.expiry {
                background: rgba(245, 158, 11, 0.14);
                border: 1.5px solid rgba(245, 158, 11, 0.5);
            }

            .alert-box .icon { font-size: 28px; }
            .alert-box .title { font-size: 15px; font-weight: 800; line-height: 1.2; }
            .alert-box .desc { font-size: 12px; color: #94a3b8; margin-top: 2px; }

            /* Features Grid */
            .features-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 12px;
                margin-bottom: 18px;
            }

            .feat-card {
                background: rgba(15, 23, 42, 0.6);
                border: 1.5px solid rgba(56, 189, 248, 0.2);
                border-radius: 14px;
                padding: 12px 14px;
                display: flex;
                flex-direction: column;
                gap: 3px;
            }

            .feat-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 800;
                color: #ffffff;
            }

            .feat-desc {
                font-size: 12px;
                color: #94a3b8;
                line-height: 1.2;
            }

            /* Big Free Banner */
            .free-bar {
                background: linear-gradient(135deg, #10b981 0%, #047857 100%);
                border-radius: 16px;
                padding: 14px 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
                margin-bottom: 14px;
            }

            .free-bar .left {
                display: flex;
                align-items: center;
                gap: 14px;
            }

            .free-bar .left h3 {
                font-size: 18px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .free-bar .left p {
                font-size: 13.5px;
                font-weight: 700;
                opacity: 0.95;
            }

            /* Footer Helpline & URL */
            .helpline-bar {
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
                color: #000000;
                border-radius: 16px;
                padding: 14px 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-weight: 900;
                font-size: 20px;
                box-shadow: 0 8px 25px rgba(245, 158, 11, 0.35);
                margin-bottom: 12px;
            }

            .helpline-bar .number {
                font-size: 23px;
                text-decoration: underline;
            }

            .helpline-bar .web {
                font-size: 16px;
                background: #000000;
                color: #fbbf24;
                padding: 4px 14px;
                border-radius: 8px;
            }

            .footer-info {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-top: 2px dashed rgba(56, 189, 248, 0.25);
                padding-top: 12px;
                font-size: 14px;
                color: #94a3b8;
            }

            .footer-info strong {
                color: #38bdf8;
            }
        </style>
    </head>
    <body>
        <div class="poster-card">
            <!-- Header -->
            <div class="header">
                <div class="brand-left">
                    <div class="logo-box">
                        <img src="${logoBase64}" alt="BillGST Logo" />
                    </div>
                    <div class="brand-text">
                        <h1>Bill<span>GST</span></h1>
                        <p>ऑल-इन-वन स्मार्ट बिलिंग & दुकान सॉफ्टवेयर</p>
                    </div>
                </div>

                <div class="header-badges">
                    <div class="playstore-badge">
                        <span>▶</span> Google Play Store
                    </div>
                    <div class="free-badge">
                        🎉 100% मुफ़्त ऐप
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
            <div class="comparison-grid">
                <div class="comp-card gst">
                    <div class="comp-header">
                        <div class="icon">🧾</div>
                        <div>
                            <div class="title">1. GST बिल (पक्का टैक्स इनवॉइस)</div>
                            <div style="font-size: 12px; color: #94a3b8;">सरकारी नियमों के अनुसार 100% मान्य</div>
                        </div>
                    </div>
                    <div class="comp-list">
                        <div><span class="check">✓</span> HSN/SAC कोड & ऑटो CGST, SGST, IGST टैक्स</div>
                        <div><span class="check">✓</span> B2B (व्यापारी) और B2C (ग्राहक) बिलिंग</div>
                        <div><span class="check">✓</span> E-Way Bill & E-Invoice 1-क्लिक जनरेशन</div>
                        <div><span class="check">✓</span> CA के लिए 1-Click GSTR-1, GSTR-3B Excel रिपोर्ट</div>
                    </div>
                </div>

                <div class="comp-card nongst">
                    <div class="comp-header">
                        <div class="icon">📄</div>
                        <div>
                            <div class="title">2. Non-GST बिल (सादा पर्चा / एस्टीमेट)</div>
                            <div style="font-size: 12px; color: #94a3b8;">बिना GST नंबर के भी आसान और सुरक्षित बिलिंग</div>
                        </div>
                    </div>
                    <div class="comp-list">
                        <div><span class="check">✓</span> बिना टैक्स जोड़े सादा बिल और पक्की रसीद</div>
                        <div><span class="check">✓</span> डिलीवरी चालान, एस्टीमेट व कोटेशन बनाएं</div>
                        <div><span class="check">✓</span> 2" और 3" थर्मल प्रिंटर पर तुरंत रसीद प्रिंट</div>
                        <div><span class="check">✓</span> सीधे ग्राहक के WhatsApp पर ऑटो PDF रसीद भेजें</div>
                    </div>
                </div>
            </div>

            <!-- Smart Retail Alerts -->
            <div class="alerts-grid">
                <div class="alert-box ai">
                    <div class="icon">📸</div>
                    <div>
                        <div class="title" style="color: #38bdf8;">AI स्मार्ट स्कैनर</div>
                        <div class="desc">पुराने बिल या पर्चे की फोटो से तुरंत डिजिटल बिल</div>
                    </div>
                </div>

                <div class="alert-box lowstock">
                    <div class="icon">⚠️</div>
                    <div>
                        <div class="title" style="color: #ef4444;">लो-स्टॉक ऑटो अलर्ट</div>
                        <div class="desc">सामान खत्म होने से पहले चेतावनी, सेल न रुके</div>
                    </div>
                </div>

                <div class="alert-box expiry">
                    <div class="icon">⏳</div>
                    <div>
                        <div class="title" style="color: #fbbf24;">एक्सपायरी डेट अलर्ट</div>
                        <div class="desc">तारीख निकलने से पहले सूचना, 0% नुकसान</div>
                    </div>
                </div>
            </div>

            <!-- Supporting Features -->
            <div class="features-grid">
                <div class="feat-card">
                    <div class="feat-title">🎙️ AI बोलकर बिलिंग</div>
                    <div class="feat-desc">बिना टाइप किए सिर्फ नाम और रेट बोलें, बिल तैयार।</div>
                </div>
                <div class="feat-card">
                    <div class="feat-title">💬 WhatsApp बॉट & रिमाइंडर</div>
                    <div class="feat-desc">ग्राहक को ऑटो बिल और उधारी पेमेंट रिमाइंडर।</div>
                </div>
                <div class="feat-card">
                    <div class="feat-title">📒 डिजिटल उधारी खाता</div>
                    <div class="feat-desc">ग्राहक और सप्लायर दोनों का 100% सुरक्षित हिसाब।</div>
                </div>
                <div class="feat-card">
                    <div class="feat-title">👥 स्टाफ हाजिरी & सैलरी</div>
                    <div class="feat-desc">कर्मचारियों की अटेंडेंस, एडवांस और वेतन प्रबंधन।</div>
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

            <!-- 100% Free Banner -->
            <div class="free-bar">
                <div class="left">
                    <div style="font-size: 32px;">🎁</div>
                    <div>
                        <h3>100% मुफ़्त ऐप · लाइफटाइम कोई चार्ज नहीं (LifeTime FREE)</h3>
                        <p>Google Play Store और Website दोनों पर 100% फ्री उपलब्ध!</p>
                    </div>
                </div>
                <div style="background: #ffffff; color: #047857; font-weight: 900; font-size: 15px; padding: 6px 14px; border-radius: 8px;">
                    100% FREE
                </div>
            </div>

            <!-- Helpline Footer -->
            <div class="helpline-bar">
                <div>
                    📞 / 💬 24x7 हेल्पलाइन: <span class="number">+91 74985 71873</span>
                </div>
                <div class="web">
                    🌐 www.billgst.com
                </div>
            </div>

            <!-- Footer Details -->
            <div class="footer-info">
                <div>📲 <strong>Play Store</strong> पर 'BillGST' सर्च करें या <strong>www.billgst.com</strong> खोलें</div>
                <div>📍 पूरे भारत के दुकानदारों और व्यापारियों के लिए 100% सुरक्षित</div>
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
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const outputPathPoster = path.join(__dirname, '../public/marketing-poster-gst.jpg');
    const outputPathPublicMain = path.join(__dirname, '../public/marketing-poster.jpg');
    const artifactPath = 'C:\\Users\\Ghanshyam\\.gemini\\antigravity\\brain\\5ddc4b09-6707-4919-b279-87c1724fc0e1\\billgst_gst_poster_final.jpg';

    await page.screenshot({ path: outputPathPoster, type: 'jpeg', quality: 95 });
    await page.screenshot({ path: outputPathPublicMain, type: 'jpeg', quality: 95 });
    await page.screenshot({ path: artifactPath, type: 'jpeg', quality: 95 });

    console.log('✅ Generated Poster saved at:', outputPathPoster);

    // Generate Square 1:1 format
    await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });
    const outputSquare = path.join(__dirname, '../public/marketing-whatsapp.jpg');
    const artifactSquare = 'C:\\Users\\Ghanshyam\\.gemini\\antigravity\\brain\\5ddc4b09-6707-4919-b279-87c1724fc0e1\\billgst_gst_square_final.jpg';
    await page.screenshot({ path: outputSquare, type: 'jpeg', quality: 95 });
    await page.screenshot({ path: artifactSquare, type: 'jpeg', quality: 95 });

    console.log('✅ Generated Square saved at:', outputSquare);

    await browser.close();
    console.log('🎉 Done rendering all HD posters with Puppeteer!');
}

generatePosters().catch(console.error);
