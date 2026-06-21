const fs = require('fs');

const filePath = 'f:/bill/app/page.tsx';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

const find1 = `<div className="hero-actions hero-actions-row" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '20px', width: '100%' }}>`;
const replace1 = `<div className="hero-actions">`;

const find2 = `<button className="btn-hero" style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #7C6EF7 100%)', padding: '18px 36px', fontSize: '18px', fontWeight: '800', borderRadius: '16px', boxShadow: '0 10px 30px rgba(79, 142, 247, 0.4)', color: 'white', border: 'none', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => openM('signup')}>`;
const replace2 = `<button className="btn-hero" onClick={() => openM('signup')}>`;

const find3 = `<button className="btn-hero2" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '18px 36px', fontSize: '18px', borderRadius: '16px', fontWeight: '600', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => openM('login')}>`;
const replace3 = `<button className="btn-hero2" onClick={() => openM('login')}>`;

const find4 = `<a href="https://play.google.com/store/apps/details?id=in.billgst.app" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#000', color: '#fff', padding: '12px 28px', borderRadius: '16px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>`;
const replace4 = `<a href="https://play.google.com/store/apps/details?id=in.billgst.app" target="_blank" rel="noopener noreferrer" className="btn-play">`;

const find5 = `{/* TRUST SIGNALS */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '10px', marginBottom: '50px', position: 'relative', zIndex: 10, animation: 'fadeUp 0.6s ease 0.5s both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 18px', borderRadius: '50px', border: '1px solid rgba(16, 185, 129, 0.25)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)' }}>
                        <span style={{ fontSize: '18px' }}>🔒</span>
                        <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '700', letterSpacing: '0.3px' }}>100% Secure & Encrypted</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(79, 142, 247, 0.1)', padding: '8px 18px', borderRadius: '50px', border: '1px solid rgba(79, 142, 247, 0.25)', boxShadow: '0 4px 15px rgba(79, 142, 247, 0.1)' }}>
                        <span style={{ fontSize: '18px' }}>🛡️</span>
                        <span style={{ fontSize: '14px', color: '#4F8EF7', fontWeight: '700', letterSpacing: '0.3px' }}>Bank-Level Security</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 18px', borderRadius: '50px', border: '1px solid rgba(245, 158, 11, 0.25)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)' }}>
                        <span style={{ fontSize: '18px' }}>📜</span>
                        <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '700', letterSpacing: '0.3px' }}>Independent (Not Govt. Affiliated)</span>
                    </div>
                </div>`;
const replace5 = `{/* TRUST SIGNALS */}
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
                </div>`;

const find6 = `<div className="db-wrap" style={{ background: 'transparent', padding: '0', border: 'none', boxShadow: 'none' }}>
                    <div className="db-glow" style={{ top: '20%', height: '60%' }}></div>
                    <div className="db-frame" style={{ background: '#0f172a', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', position: 'relative' }}>`;
const replace6 = `<div className="db-wrap">
                    <div className="db-glow"></div>
                    <div className="db-frame" style={{ background: '#0f172a', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', position: 'relative' }}>`;

const replacements = [
    { find: find1.replace(/\\r\\n/g, '\\n'), replace: replace1, name: "hero-actions wrapper" },
    { find: find2.replace(/\\r\\n/g, '\\n'), replace: replace2, name: "signup button" },
    { find: find3.replace(/\\r\\n/g, '\\n'), replace: replace3, name: "login button" },
    { find: find4.replace(/\\r\\n/g, '\\n'), replace: replace4, name: "play store button" },
    { find: find5.replace(/\\r\\n/g, '\\n'), replace: replace5, name: "trust signals" },
    { find: find6.replace(/\\r\\n/g, '\\n'), replace: replace6, name: "db-wrap" }
];

let modified = false;
for (const rep of replacements) {
    if (content.includes(rep.find)) {
        content = content.replace(rep.find, rep.replace);
        modified = true;
        console.log("Replaced:", rep.name);
    } else {
        console.log("Could not find:", rep.name);
    }
}

if (modified) {
    // Windows friendly
    fs.writeFileSync(filePath, content.replace(/\\n/g, '\\r\\n'), 'utf8');
    console.log("File saved successfully.");
} else {
    console.log("No modifications were made.");
}
