const fs = require('fs');

let pageContent = fs.readFileSync('app/page.tsx', 'utf-8');

// 1. Add Blobs
pageContent = pageContent.replace(
    '<div className="landing-body" style={{ background: \'#fff\', color: \'#111827\', fontFamily: "-apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif" }}>',
    '<div className="landing-body">\n            <div className="bg-blob bg-blob-1"></div>\n            <div className="bg-blob bg-blob-2"></div>\n            <div className="bg-blob bg-blob-3"></div>'
);

// 2. Wrap Video in video-frame
const oldVideoStr = `<div className="dash-preview" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                <div className="dash-bar" style={{ margin: 0, padding: '12px 18px', background: '#F9FAFB' }}>
                  <div className="dash-dot" style={{background:'#ff5f57'}}></div>
                  <div className="dash-dot" style={{background:'#febc2e'}}></div>
                  <div className="dash-dot" style={{background:'#28c840'}}></div>
                  <div className="dash-url">app.billgst.in/dashboard</div>
                </div>
                <div style={{ position: 'relative' }}>
                    <iframe`;

const newVideoStr = `<div className="video-frame">
                <div className="video-inner">
                  <div className="video-bar">
                    <div className="video-dot" style={{background:'#ff5f57'}}></div>
                    <div className="video-dot" style={{background:'#febc2e'}}></div>
                    <div className="video-dot" style={{background:'#28c840'}}></div>
                  </div>
                  <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                    <iframe`;

pageContent = pageContent.replace(oldVideoStr, newVideoStr);

// 3. Fix the closing of the video frame
// Find the end of the iframe and mute button block
const oldVideoCloseStr = `                    </button>
                </div>
              </div>`;
const newVideoCloseStr = `                    </button>
                  </div>
                </div>
              </div>`;

pageContent = pageContent.replace(oldVideoCloseStr, newVideoCloseStr);

// 4. Update the Nav Buttons to use btn-nav-*
const oldNavBtns = `<button className="btn-outline" onClick={() => openM('login')}>Login</button>
                <button className="btn-outline" onClick={() => openM('signup')}>Free Sign Up</button>`;
const newNavBtns = `<button className="btn-nav-login" onClick={() => openM('login')}>Login</button>
                <button className="btn-nav-signup" onClick={() => openM('signup')}>Free Sign Up</button>`;
pageContent = pageContent.replace(oldNavBtns, newNavBtns);

// 5. Update footer structure
const oldFooterTop = `<div className="footer-top" style={{ paddingBottom: '0' }}>
              <div style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
                <div className="logo">
                  <img src="/icon.png" width={34} height={34} alt="BillGST Logo" style={{ borderRadius: '9px' }} />
                  <span className="logo-text">BillGST</span>
                </div>
                <p className="footer-brand-desc">India ka #1 billing & GST software. Har dukaandaar ke liye, har bhaasha mein. Made with ❤️ in India.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', gridColumn: '1 / -1' }}>`;
              
const newFooterTop = `<div className="footer-wrapper">
            <div className="footer-top">
              <div>
                <div className="logo">
                  <img src="/icon.png" width={34} height={34} alt="BillGST Logo" style={{ borderRadius: '9px' }} />
                  <span className="logo-text">BillGST</span>
                </div>
                <p className="footer-brand-desc">India ka #1 billing & GST software. Har dukaandaar ke liye, har bhaasha mein. Made with ❤️ in India.</p>
              </div>`;

const oldFooterMid = `              </div>
            </div>
            <div style={{borderTop:'1px solid #F3F4F6'}}>
              <div className="footer-bottom">`;
const newFooterMid = `            </div>
            <div className="footer-bottom">`;
            
pageContent = pageContent.replace(oldFooterTop, newFooterTop);
pageContent = pageContent.replace(oldFooterMid, newFooterMid);

const oldFooterBottom = `              </div>
            </div>`;
const newFooterBottom = `            </div>
          </div>`;
          
pageContent = pageContent.replace(oldFooterBottom, newFooterBottom);

// Save back
fs.writeFileSync('app/page.tsx', pageContent);
console.log('Updated app/page.tsx with new structure');
