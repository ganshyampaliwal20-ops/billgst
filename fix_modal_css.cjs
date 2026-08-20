const fs = require('fs');

let content = fs.readFileSync('app/dashboard/invoices/page.tsx', 'utf8');

// The CSS we want to inject (including fonts and proper styles)
const exactCSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');

.ns-wrapper {
    --ink:#12182A; --ink-soft:#3A4356; --muted:#7C8399; --hairline:#E7E3D8; --paper:#FBF9F4; --paper-2:#F3EFE3; --page:#EDE9DC; --brass:#A9803F; --brass-dark:#7C5C29; --brass-tint:#F3E6CC; --green:#1E7A5F; --green-tint:#DEEFE7; --red:#B23B34; --red-tint:#F7E3E0; --navy:#0E1526; --radius-lg:20px; --radius-md:12px;
}
.ns-phone {
    width: 390px;
    max-width: 100%;
    margin: 0 auto;
    animation: scaleUp 0.2s ease;
    font-family: 'Inter', sans-serif;
    position: relative;
}
.ns-app-bar {
    background: var(--navy);
    border-radius: 18px 18px 0 0;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.ns-brand { display: flex; align-items: center; gap: 10px; }
.ns-brand-mark {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--brass); display: flex; align-items: center; justify-content: center;
    color: var(--navy); font-weight: 700; font-size: 13px; font-family: 'Fraunces', serif;
}
.ns-brand-name { color: #F4F1E8; font-weight: 600; font-size: 15px; letter-spacing: 0.01em; }
.ns-brand-sub { color: #9AA3B8; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; }
.ns-app-icons { display: flex; gap: 14px; color: #C7CCDA; font-size: 18px; }
.ns-sheet {
    background: var(--paper);
    border-radius: 0 0 18px 18px;
    padding: 0 0 24px;
    position: relative;
    box-shadow: 0 30px 60px -20px rgba(14,21,38,0.35);
    max-height: 80vh;
    overflow-y: auto;
}
.ns-grabber { width: 36px; height: 4px; background: var(--hairline); border-radius: 99px; margin: 14px auto 0; }
.ns-head { padding: 22px 24px 20px; border-bottom: 1px dashed var(--hairline); position: relative; }
.ns-eyebrow { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.ns-inv-no { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; letter-spacing: 0.06em; color: var(--muted); text-transform: uppercase; }
.ns-status-pill { font-size: 11px; font-weight: 600; letter-spacing: 0.02em; color: var(--red); background: var(--red-tint); padding: 4px 10px; border-radius: 99px; }
.ns-status-paid { color: var(--green); background: var(--green-tint); }
.ns-amount-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
.ns-amount { font-family: 'Fraunces', serif; font-weight: 500; font-size: 42px; color: var(--ink); letter-spacing: -0.01em; }
.ns-amount-currency { font-family: 'Fraunces', serif; font-size: 22px; color: var(--ink-soft); }
.ns-type-tag { font-size: 13px; color: var(--ink-soft); font-weight: 500; }
.ns-type-tag span { color: var(--muted); font-weight: 400; }
.ns-punch { position: absolute; left: -11px; right: -11px; bottom: -11px; height: 22px; background: radial-gradient(circle at 11px 11px, rgba(0,0,0,0.5) 11px, transparent 11.5px) repeat-x; background-size: 22px 22px; }
.ns-body-pad { padding: 20px 24px 0; }
.ns-section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin: 22px 0 10px; }
.ns-section-label:first-of-type { margin-top: 20px; }
.ns-primary-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ns-btn { border: none; border-radius: var(--radius-md); padding: 15px 14px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: transform .12s ease, filter .12s ease; }
.ns-btn:active { transform: scale(0.97); }
.ns-btn-whatsapp { background: var(--green); color: #F3FAF7; }
.ns-btn-whatsapp:hover { filter: brightness(1.06); }
.ns-btn-pdf { background: var(--paper); color: var(--ink); border: 1px solid var(--hairline); }
.ns-btn-pdf:hover { border-color: var(--brass); }
.ns-btn-icon { width: 19px; height: 19px; flex-shrink: 0; }
.ns-secondary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ns-tile { background: var(--paper); border: 1px solid var(--hairline); border-radius: var(--radius-md); padding: 16px 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: border-color .12s ease, background .12s ease; }
.ns-tile:hover { border-color: var(--brass); background: var(--brass-tint); }
.ns-tile-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
.ns-tile-label { font-size: 12.5px; font-weight: 600; color: var(--ink); text-align: center; }
.ns-full { grid-column: 1 / -1; flex-direction: row; justify-content: flex-start; padding: 14px 16px; }
.ns-full .ns-tile-icon { margin-right: 2px; }
.ns-tile-danger:hover { border-color: var(--red); background: var(--red-tint); }
.ns-tile-danger .ns-tile-label { color: var(--red); }
.ns-payment-card { margin-top: 22px; background: var(--paper-2); border: 1px solid var(--hairline); border-radius: var(--radius-lg); padding: 18px; }
.ns-payment-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ns-payment-title { font-size: 13.5px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px; }
.ns-payment-row { display: flex; gap: 8px; }
.ns-amt-input { flex: 1; border: 1px solid var(--hairline); background: var(--paper); border-radius: 10px; padding: 0 14px; height: 44px; font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink); outline: none; }
.ns-amt-input:focus { border-color: var(--brass); }
.ns-amt-input::placeholder { color: var(--muted); }
.ns-add-btn { background: var(--green); color: #F3FAF7; border: none; border-radius: 10px; padding: 0 20px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.15s; }
.ns-add-btn:active { transform: scale(0.97); }
.ns-add-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.ns-balance-line { margin-top: 12px; display: flex; justify-content: space-between; align-items: baseline; font-size: 12.5px; }
.ns-balance-line .ns-label { color: var(--muted); }
.ns-balance-line .ns-val { font-weight: 700; color: var(--red); font-family: 'JetBrains Mono', monospace; }
.ns-progress { margin-top: 10px; height: 5px; background: var(--hairline); border-radius: 99px; overflow: hidden; }
.ns-progress-fill { height: 100%; background: var(--brass); border-radius: 99px; transition: width .3s ease; }
.ns-close-btn { margin: 22px 24px 0; background: var(--ink); color: #F4F1E8; border: none; border-radius: var(--radius-md); padding: 16px; width: calc(100% - 48px); font-weight: 600; font-size: 14.5px; letter-spacing: 0.01em; cursor: pointer; transition: transform 0.12s; }
.ns-close-btn:active { transform: scale(0.985); }
`;

// 1. First remove the old CSS I injected earlier (if any)
if (content.includes('.ns-wrapper {')) {
    // We already injected some bad CSS, let's remove it
    const startCSS = content.indexOf('.ns-wrapper {');
    const endCSS = content.indexOf('</style>', startCSS) > -1 ? content.indexOf('</style>', startCSS) : content.indexOf('\` }} />', startCSS);
    if (endCSS !== -1) {
        content = content.substring(0, startCSS) + content.substring(endCSS);
    }
}

// 2. Inject the correct CSS before the end of the style block
const styleBlockEnd = content.indexOf('\` }} />');
if (styleBlockEnd !== -1) {
    content = content.substring(0, styleBlockEnd) + exactCSS + '\n' + content.substring(styleBlockEnd);
}

const exactJSX = `
            {selectedInvoice && (
                <div className="modal-ov ns-wrapper" onClick={() => setSelectedInvoice(null)}>
                    <div className="ns-phone" onClick={e => e.stopPropagation()}>
                        <div className="ns-app-bar">
                            <div className="ns-brand">
                            <div className="ns-brand-mark">B</div>
                            <div>
                                <div className="ns-brand-name">Billgst</div>
                                <div className="ns-brand-sub">Manage invoices</div>
                            </div>
                            </div>
                            <div className="ns-app-icons">
                                <span>&#9881;</span>
                                <span>&#9776;</span>
                            </div>
                        </div>

                        <div className="ns-sheet">
                            <div className="ns-head">
                                <div className="ns-eyebrow">
                                    <span className="ns-inv-no">Invoice #{selectedInvoice.invoice_number}</span>
                                    {((selectedInvoice.status || 'UNPAID').toLowerCase() === 'paid' || 
                                    Number(selectedInvoice.total_amount) <= Number(selectedInvoice.paid_amount || 0)) ? (
                                        <span className="ns-status-pill ns-status-paid">Paid in full</span>
                                    ) : (
                                        <span className="ns-status-pill">Balance due</span>
                                    )}
                                </div>
                                <div className="ns-amount-row">
                                    <span className="ns-amount-currency">₹</span>
                                    <span className="ns-amount">
                                        {Number(selectedInvoice.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="ns-type-tag">
                                    {selectedInvoice.type === 'QUOTATION' ? 'Quotation' : 'Cash sale'} 
                                    <span> &middot; {new Date(selectedInvoice.invoice_date || selectedInvoice.created_at).toLocaleDateString('en-IN')}</span>
                                </div>
                                <div className="ns-punch"></div>
                            </div>

                            <div className="ns-body-pad">
                                <div className="ns-section-label">Share invoice</div>
                                <div className="ns-primary-actions">
                                    <button className="ns-btn ns-btn-whatsapp" onClick={(e) => handleWhatsApp(selectedInvoice, e)}>
                                        <svg className="ns-btn-icon" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.48 3.53 1.32 5.01L2 22l5.12-1.28A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Z" stroke="#F3FAF7" strokeWidth="1.4"/><path d="M8.7 8.4c.2-.5.4-.5.6-.5h.5c.16 0 .38 0 .55.42.2.5.68 1.72.74 1.85.06.13.1.28.02.44-.08.16-.13.26-.26.4-.13.14-.27.32-.39.43-.13.13-.26.26-.12.5.14.25.63 1.03 1.36 1.67.94.83 1.72 1.09 1.97 1.21.25.13.4.11.55-.06.16-.18.65-.75.82-1.02.17-.25.34-.2.56-.12.23.08 1.44.68 1.68.8.25.13.4.19.47.3.06.13.06.7-.18 1.37-.24.66-1.4 1.28-1.94 1.36-.5.08-1.12.11-1.8-.11-.42-.14-.95-.32-1.64-.62-2.9-1.25-4.79-4.17-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.13 1.02-2.42Z" fill="#F3FAF7"/></svg>
                                        Send on WhatsApp
                                    </button>
                                    <button className="ns-btn ns-btn-pdf" onClick={() => handleViewPdf(selectedInvoice)}>
                                        <svg className="ns-btn-icon" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="#12182A" strokeWidth="1.4"/><path d="M14 3v5h5" stroke="#12182A" strokeWidth="1.4"/><text x="8" y="17" fontFamily="Inter" fontSize="6.5" fontWeight="700" fill="#12182A">PDF</text></svg>
                                        Download PDF
                                    </button>
                                </div>

                                <div className="ns-section-label">More actions</div>
                                <div className="ns-secondary-grid">
                                    <div className="ns-tile" onClick={() => handleDownloadEwayJSON(selectedInvoice)}>
                                        <div className="ns-tile-icon" style={{background: 'var(--brass-tint)'}}>
                                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M21 8 12 3 3 8l9 5 9-5Z" stroke="var(--brass-dark)" strokeWidth="1.4" strokeLinejoin="round"/><path d="M3 8v8l9 5 9-5V8" stroke="var(--brass-dark)" strokeWidth="1.4" strokeLinejoin="round"/><path d="M12 13v8" stroke="var(--brass-dark)" strokeWidth="1.4"/></svg>
                                        </div>
                                        <div className="ns-tile-label">E-Way JSON</div>
                                    </div>
                                    <Link href={\`/dashboard/invoices/new?duplicateId=\${selectedInvoice.id}\`} style={{textDecoration: 'none', display: 'contents'}}>
                                        <div className="ns-tile">
                                            <div className="ns-tile-icon" style={{background: 'var(--brass-tint)'}}>
                                                <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><rect x="8" y="8" width="12" height="12" rx="2" stroke="var(--brass-dark)" strokeWidth="1.4"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="var(--brass-dark)" strokeWidth="1.4"/></svg>
                                            </div>
                                            <div className="ns-tile-label">Duplicate</div>
                                        </div>
                                    </Link>
                                    <div className="ns-tile ns-full ns-tile-danger" onClick={() => handleDelete(selectedInvoice)}>
                                        <div className="ns-tile-icon" style={{background: 'var(--red-tint)'}}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12Z" stroke="var(--red)" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                                        </div>
                                        <div className="ns-tile-label">Delete invoice</div>
                                    </div>
                                </div>

                                <div className="ns-payment-card">
                                    <div className="ns-payment-head">
                                        <div className="ns-payment-title">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="12" rx="2" stroke="var(--brass-dark)" strokeWidth="1.4"/><path d="M2 10h20" stroke="var(--brass-dark)" strokeWidth="1.4"/></svg>
                                            Record payment
                                        </div>
                                    </div>
                                    <div className="ns-payment-row">
                                        <input 
                                            className="ns-amt-input" 
                                            type="number" 
                                            placeholder="Amount received (₹)" 
                                            value={paymentAmount} 
                                            onChange={e => setPaymentAmount(e.target.value)} 
                                            disabled={isSubmittingPayment} 
                                        />
                                        <button 
                                            className="ns-add-btn" 
                                            onClick={handleRecordPayment} 
                                            disabled={isSubmittingPayment}
                                        >
                                            {isSubmittingPayment ? '...' : 'Add'}
                                        </button>
                                    </div>
                                    <div className="ns-balance-line">
                                        <span className="ns-label">Balance due</span>
                                        <span className="ns-val" style={{ color: Number(Math.max(Number(selectedInvoice.total_amount || 0) - Number(selectedInvoice.paid_amount || 0), 0)) <= 0 ? 'var(--green)' : 'var(--red)' }}>
                                            ₹{Number(Math.max(Number(selectedInvoice.total_amount || 0) - Number(selectedInvoice.paid_amount || 0), 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="ns-progress">
                                        <div 
                                            className="ns-progress-fill" 
                                            style={{ width: \`\${Math.min((Number(selectedInvoice.paid_amount || 0) / Number(selectedInvoice.total_amount || 1)) * 100, 100)}%\` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <button className="ns-close-btn" onClick={() => setSelectedInvoice(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
`;

// Replace JSX
const startIndex = content.indexOf('{selectedInvoice && (');
const endStr = '{/* Animated Bottom FAB */}';
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + exactJSX + '\n            ' + content.substring(endIndex);
    fs.writeFileSync('app/dashboard/invoices/page.tsx', content);
    console.log('Success JSX replacement!');
} else {
    console.log('Failed to find replacement boundaries.');
}

