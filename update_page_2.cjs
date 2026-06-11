const fs = require('fs');

const fileContent = fs.readFileSync('app/page.tsx', 'utf-8');

// Find the index of '{/* EXIT INTENT POPUP */}'
const modalsIdx = fileContent.indexOf('{/* EXIT INTENT POPUP */}');

// The prefix should be everything before '    return (\n        <div className="landing-body">' 
// Let's use regex to find it safely.
const match = fileContent.match(/return\s*\(\s*<div\s+className="landing-body"/);
if (!match) {
    console.error("Could not find the return statement!");
    process.exit(1);
}

const prefix = fileContent.substring(0, match.index);
const suffix = fileContent.substring(modalsIdx);

const newJSX = `    return (
        <div className="landing-body" style={{ background: '#fff', color: '#111827', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* NAV */}
            <nav className="nav" style={{ paddingTop: isStandalone ? 'env(safe-area-inset-top, 44px)' : '14px' }}>
              <div className="logo">
                <div className="logo-icon"><i className="ti ti-receipt-2"></i></div>
                <span className="logo-text">BillGST</span>
              </div>
              <div className="nav-links">
                <a className="nav-link" href="#features">Features</a>
                <a className="nav-link" href="#pricing">Pricing</a>
                <a className="nav-link" href="/about">About</a>
                <a className="nav-link" href="/blog">Blog</a>
              </div>
              <div className="nav-btns">
                <button className="btn-outline" onClick={() => openM('login')}>Login</button>
                <button className="btn-primary" onClick={() => openM('signup')}>Free Sign Up</button>
              </div>
            </nav>

            {/* HERO */}
            <div className="hero">
              <div>
                <div className="new-badge"><div className="new-dot"></div> Voice Billing AI is now live! 🎙️</div>
                <h1 className="hero-h1">India की दुकान के लिए<br/><span>Smart Billing Software</span><br/>GST की टेंशन खत्म।</h1>
                <p className="hero-sub">Free invoices, stock alerts, aur WhatsApp billing — ek hi jagah. Abhi shuru karo bilkul free mein, koi credit card nahi.</p>
                <div className="hero-btns">
                  <button className="btn-hero btn-hero-primary" onClick={() => openM('signup')}>
                    <i className="ti ti-rocket"></i> Free Account Banao
                  </button>
                  <button className="btn-hero btn-hero-secondary" onClick={() => openM('login')}>
                    <i className="ti ti-login"></i> Dashboard Login
                  </button>
                </div>
                <div className="trust-row">
                  <div className="trust-item"><i className="ti ti-check"></i> 30 bills/month free</div>
                  <div className="trust-item"><i className="ti ti-check"></i> No credit card</div>
                  <div className="trust-item"><i className="ti ti-check"></i> Bank-level security</div>
                </div>
              </div>
              <div className="dash-preview">
                <div className="dash-bar">
                  <div className="dash-dot" style={{background:'#ff5f57'}}></div>
                  <div className="dash-dot" style={{background:'#febc2e'}}></div>
                  <div className="dash-dot" style={{background:'#28c840'}}></div>
                  <div className="dash-url">app.billgst.in/dashboard</div>
                </div>
                <div className="dash-metrics">
                  <div className="metric-card">
                    <div className="metric-label">Today's Sales</div>
                    <div className="metric-val">₹12,480</div>
                    <div className="metric-sub"><i className="ti ti-trending-up" style={{fontSize:'12px'}}></i> +18% vs yesterday</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Bills This Month</div>
                    <div className="metric-val">247</div>
                    <div className="metric-sub" style={{color:'#1e40af'}}><i className="ti ti-file" style={{fontSize:'12px'}}></i> 12 pending</div>
                  </div>
                </div>
                <div className="inv-section-label">Recent invoices</div>
                <div className="invoice-row">
                  <div className="inv-avatar">RG</div>
                  <div className="inv-name">Ramesh Gupta</div>
                  <div className="inv-amt">₹1,240</div><div className="inv-badge inv-paid">Paid</div>
                </div>
                <div className="invoice-row">
                  <div className="inv-avatar">AS</div>
                  <div className="inv-name">Amit Sharma</div>
                  <div className="inv-amt">₹3,870</div><div className="inv-badge inv-due">Due</div>
                </div>
                <div className="invoice-row">
                  <div className="inv-avatar">VP</div>
                  <div className="inv-name">Vikash Patel</div>
                  <div className="inv-amt">₹740</div><div className="inv-badge inv-paid">Paid</div>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* FEATURES */}
            <div className="section" id="features">
              <div className="section-eyebrow">Features</div>
              <h2 className="section-title">Everything aapki dukaan ko chahiye</h2>
              <p className="section-sub">GST billing se lekar stock alert tak — sab kuch ek app mein.</p>
              <div className="features-grid">
                <div className="feat-card">
                  <div className="feat-icon feat-icon-blue"><i className="ti ti-receipt-2"></i></div>
                  <div className="feat-title">GST & Non-GST Billing</div>
                  <div className="feat-desc">Seconds mein professional GST-compliant invoices. Thermal aur regular printer support.</div>
                </div>
                <div className="feat-card">
                  <div className="feat-icon feat-icon-green"><i className="ti ti-package"></i></div>
                  <div className="feat-title">Inventory Management</div>
                  <div className="feat-desc">Real-time stock track karo, low-stock alerts pao, aur product variants manage karo effortlessly.</div>
                </div>
                <div className="feat-card">
                  <div className="feat-icon feat-icon-amber"><i className="ti ti-brand-whatsapp"></i></div>
                  <div className="feat-title">WhatsApp Billing</div>
                  <div className="feat-desc">1 click mein invoice seedha customer ke WhatsApp par. Payment reminders bhi automatic.</div>
                </div>
                <div className="feat-card">
                  <div className="feat-icon feat-icon-blue"><i className="ti ti-microphone"></i></div>
                  <div className="feat-title">Voice Billing AI</div>
                  <div className="feat-desc">"2 kilo chini aur 1 dettol" bolo — bill apne aap ban jayega. Tyohar ki bheed mein bhi kaam karta hai.</div>
                </div>
                <div className="feat-card">
                  <div className="feat-icon feat-icon-green"><i className="ti ti-scan"></i></div>
                  <div className="feat-title">Smart Scanner</div>
                  <div className="feat-desc">Purani invoice ya photo se data apne aap kheench ke naya digital invoice banao.</div>
                </div>
                <div className="feat-card">
                  <div className="feat-icon feat-icon-amber"><i className="ti ti-chart-bar"></i></div>
                  <div className="feat-title">Smart Insights</div>
                  <div className="feat-desc">Kaun sa maal sabse zyada bik raha hai aur kab stock mangwana hai — AI batayega.</div>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* HOW IT WORKS */}
            <div className="section">
              <div className="section-eyebrow">How It Works</div>
              <h2 className="section-title">Sirf 3 steps mein dukaan digital</h2>
              <p className="section-sub">Koi training nahi, koi jhanjhat nahi — abhi shuru karo.</p>
              <div className="steps-row">
                <div className="step-card">
                  <div className="step-num">1</div>
                  <div className="step-title">Product add karo</div>
                  <div className="step-desc">"Add Product" click karo, naam aur rate daalo. Aapka stock ready hai!</div>
                </div>
                <div className="step-card">
                  <div className="step-num">2</div>
                  <div className="step-title">Invoice banao</div>
                  <div className="step-desc">Customer aur items chuno. GST apne aap calculate ho jayega.</div>
                </div>
                <div className="step-card">
                  <div className="step-num">3</div>
                  <div className="step-title">WhatsApp bhejo</div>
                  <div className="step-desc">Ek click mein bill seedhe customer ke WhatsApp par bhejo.</div>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* SHOP TYPES */}
            <div className="section">
              <div className="section-eyebrow">For Everyone</div>
              <h2 className="section-title">Har dukaan ke liye, har bhaasha mein</h2>
              <p className="section-sub">Kirana se lekar showroom tak — BillGST aapke liye bana hai.</p>
              <div className="shops-grid">
                <div className="shop-card"><div className="shop-icon">🛒</div><div className="shop-label">Kirana Store</div><div className="shop-sub">Fast Billing</div></div>
                <div className="shop-card"><div className="shop-icon">💡</div><div className="shop-label">Electric Shop</div><div className="shop-sub">Serial No.</div></div>
                <div className="shop-card"><div className="shop-icon">👕</div><div className="shop-label">Garments</div><div className="shop-sub">Size & Color</div></div>
                <div className="shop-card"><div className="shop-icon">💊</div><div className="shop-label">Medical</div><div className="shop-sub">Expiry Alert</div></div>
                <div className="shop-card"><div className="shop-icon">🍔</div><div className="shop-label">Restaurant</div><div className="shop-sub">Table Support</div></div>
                <div className="shop-card"><div className="shop-icon">🔧</div><div className="shop-label">Automobile</div><div className="shop-sub">Service Job</div></div>
              </div>
            </div>

            <div className="divider"></div>

            {/* PRICING */}
            <div className="section" id="pricing">
              <div className="section-eyebrow">Pricing</div>
              <h2 className="section-title">Transparent pricing — koi hidden charge nahi</h2>
              <p className="section-sub">Free mein shuru karo, zarurat padne par upgrade karo. Yearly lene par 30% bachat.</p>
              <div className="pricing-grid">
                <div className="price-card">
                  <div className="price-plan">Free Plan</div>
                  <div className="price-amt">₹0 <span className="price-period">/ month</span></div>
                  <div className="price-divider"></div>
                  <div className="price-item"><i className="ti ti-check"></i> 30 invoices/month</div>
                  <div className="price-item"><i className="ti ti-check"></i> GST + GSTR-1 Report</div>
                  <div className="price-item"><i className="ti ti-check"></i> Basic stock management</div>
                  <div className="price-item"><i className="ti ti-check"></i> Voice Billing AI</div>
                  <button className="price-btn price-btn-outline" onClick={() => openM('signup')}>Get Started</button>
                </div>
                <div className="price-card price-card-featured">
                  <div className="price-badge">⭐ Most Popular</div>
                  <div className="price-plan">Premium Growth</div>
                  <div className="price-amt">₹99 <span className="price-period">/ 3 months</span></div>
                  <div className="price-divider"></div>
                  <div className="price-item"><i className="ti ti-check"></i> Unlimited bills</div>
                  <div className="price-item"><i className="ti ti-check"></i> GST + GSTR-1 Report</div>
                  <div className="price-item"><i className="ti ti-check"></i> Full stock + low stock alerts</div>
                  <div className="price-item"><i className="ti ti-check"></i> Unlimited Voice AI billing</div>
                  <button className="price-btn price-btn-main" onClick={() => openM('signup')}>Abhi Shuru Karo →</button>
                </div>
                <div className="price-card">
                  <div className="price-plan">Yearly Pro</div>
                  <div className="price-amt">₹299 <span className="price-period">/ year</span></div>
                  <div className="price-divider"></div>
                  <div className="price-item"><i className="ti ti-check"></i> Unlimited bills</div>
                  <div className="price-item"><i className="ti ti-check"></i> GST + GSTR-1 Report</div>
                  <div className="price-item"><i className="ti ti-check"></i> Full stock + low stock alerts</div>
                  <div className="price-item"><i className="ti ti-check"></i> Save 30% vs monthly</div>
                  <button className="price-btn price-btn-outline" onClick={() => openM('signup')}>Get Started</button>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* REVIEWS */}
            <div className="section">
              <div className="section-eyebrow">Customer Love</div>
              <h2 className="section-title">Hazaron dukaandaron ki pehli pasand</h2>
              <p className="section-sub">Poore India mein chhoti aur badi dukaanon mein use ho raha hai.</p>
              <div className="reviews-grid">
                <div className="review-card">
                  <div className="stars">★★★★★</div>
                  <p className="review-text">"Pehle copy mein hisab likhne mein bahut time jaata tha. Ab 10 second mein WhatsApp par bill bhej deta hoon. Stock bhi maintain rehta hai."</p>
                  <div className="reviewer">
                    <div className="rev-avatar">RG</div>
                    <div><div className="rev-name">Ramesh Gupta</div><div className="rev-biz">Ramesh Kirana Store, Pune</div></div>
                  </div>
                </div>
                <div className="review-card">
                  <div className="stars">★★★★★</div>
                  <p className="review-text">"Voice billing feature toh kamaal hai! Tyohar ke time bheed mein bas bol ke bill ban jaata hai. Bahut easy software hai."</p>
                  <div className="reviewer">
                    <div className="rev-avatar">AS</div>
                    <div><div className="rev-name">Amit Sharma</div><div className="rev-biz">Sharma Electronics, Delhi</div></div>
                  </div>
                </div>
                <div className="review-card">
                  <div className="stars">★★★★★</div>
                  <p className="review-text">"Udhar ka hisab rakhna bahut aasaan ho gaya. Ek click mein party ko PDF chala jaata hai. Must use app for all shopkeepers!"</p>
                  <div className="reviewer">
                    <div className="rev-avatar">VP</div>
                    <div><div className="rev-name">Vikash Patel</div><div className="rev-biz">Patel Garments, Surat</div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="cta-section">
              <h2 className="cta-title">Aaj hi shuru karo — bilkul free</h2>
              <p className="cta-sub">30 GST bills har mahine, koi credit card nahi, koi jhanjhat nahi.</p>
              <div className="cta-btns">
                <button className="btn-white" onClick={() => openM('signup')}>
                  <i className="ti ti-rocket"></i> Free Account Banao
                </button>
                <button className="btn-ghost" onClick={() => window.location.href='https://play.google.com/store/apps/details?id=in.billgst.app'}>
                  <i className="ti ti-brand-google-play"></i> Google Play par Download
                </button>
              </div>
            </div>

            {/* FOOTER */}
            <div className="footer-top">
              <div>
                <div className="logo">
                  <div className="logo-icon"><i className="ti ti-receipt-2"></i></div>
                  <span className="logo-text">BillGST</span>
                </div>
                <p className="footer-brand-desc">India ka #1 billing & GST software. Har dukaandaar ke liye, har bhaasha mein. Made with ❤️ in India.</p>
              </div>
              <div>
                <div className="footer-col-title">Product</div>
                <a className="footer-link">Invoicing</a>
                <a className="footer-link">Stock Management</a>
                <a className="footer-link">Voice Billing</a>
                <a className="footer-link">Smart Scanner</a>
              </div>
              <div>
                <div className="footer-col-title">Company</div>
                <a className="footer-link" href="/about">About Us</a>
                <a className="footer-link" href="/blog">Blog</a>
                <a className="footer-link" href="/privacy">Privacy Policy</a>
              </div>
              <div>
                <div className="footer-col-title">Support</div>
                <a className="footer-link" href="https://wa.me/917498571873">WhatsApp Help</a>
                <a className="footer-link">Refer & Earn</a>
                <a className="footer-link">FAQ</a>
              </div>
            </div>
            <div style={{borderTop:'1px solid #F3F4F6'}}>
              <div className="footer-bottom">
                <span className="footer-copy">© {new Date().getFullYear()} BillGST · All rights reserved · 🇮🇳 Made in India</span>
                <div className="footer-socials">
                  <div className="social-btn" onClick={() => window.location.href='https://www.instagram.com/billgst_app'}><i className="ti ti-brand-instagram"></i></div>
                  <div className="social-btn" onClick={() => window.location.href='https://www.youtube.com/@billgstapp'}><i className="ti ti-brand-youtube"></i></div>
                  <div className="social-btn" onClick={() => window.location.href='https://wa.me/917498571873'}><i className="ti ti-brand-whatsapp"></i></div>
                </div>
              </div>
            </div>

            `;

fs.writeFileSync('app/page.tsx', prefix + newJSX + suffix);
console.log("Updated app/page.tsx with correctly matched prefix!");
