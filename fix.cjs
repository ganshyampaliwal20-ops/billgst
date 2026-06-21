const fs = require('fs');

const filePath = 'f:/bill/app/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const findStr = `<a href="https://play.google.com/store/apps/details?id=in.billgst.app" target="_blank" rel="noopener noreferrer" className="btn-play">
                        <svg viewBox="0 0 512 512" width="16" height="16"><path fill="#4caf50" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/><path fill="#03a9f4" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"/><path fill="#ffeb3b" d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z"/><path fill="#f44336" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                        <div style={{ textAlign: 'left' }}>
                {/* DASHBOARD PREVIEW */}
                <div className="db-wrap" style={{ background: 'transparent', padding: '0', border: 'none', boxShadow: 'none' }}>
                    <div className="db-glow" style={{ top: '20%', height: '60%' }}></div>
                    <div className="db-frame" style={{ background: '#0f172a', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', position: 'relative' }}>`;

const replaceStr = `<a href="https://play.google.com/store/apps/details?id=in.billgst.app" target="_blank" rel="noopener noreferrer" className="btn-play">
                        <svg viewBox="0 0 512 512" width="16" height="16"><path fill="#4caf50" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/><path fill="#03a9f4" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"/><path fill="#ffeb3b" d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z"/><path fill="#f44336" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, lineHeight: 1 }}>GET IT ON</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1.2 }}>Google Play</div>
                        </div>
                    </a>
                </div>
                <p className="hero-note" style={{ marginBottom: '20px' }}>✦ {isEnglish ? "Starter plan includes 30 free GST Bills every month" : "Starter plan में 30 GST Bills हर महीने बिल्कुल मुफ्त"}</p>

                {/* TRUST SIGNALS */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '30px', marginBottom: '60px', position: 'relative', zIndex: 10, animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both' }}>
                    <div className="trust-badge green">
                        <span style={{ fontSize: '18px' }}>🔒</span>
                        <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '700', letterSpacing: '0.3px' }}>100% Secure & Encrypted</span>
                    </div>
                    <div className="trust-badge blue">
                        <span style={{ fontSize: '18px' }}>🛡️</span>
                        <span style={{ fontSize: '14px', color: '#4F8EF7', fontWeight: '700', letterSpacing: '0.3px' }}>Bank-Level Security</span>
                    </div>
                    <div className="trust-badge amber">
                        <span style={{ fontSize: '18px' }}>📜</span>
                        <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '700', letterSpacing: '0.3px' }}>Independent (Not Govt. Affiliated)</span>
                    </div>
                </div>

                {/* DASHBOARD PREVIEW */}
                <div className="db-wrap">
                    <div className="db-glow"></div>
                    <div className="db-frame">`;

if (content.includes(findStr)) {
    content = content.replace(findStr, replaceStr);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Fixed successfully.");
} else {
    console.log("Could not find the target string to fix.");
}
