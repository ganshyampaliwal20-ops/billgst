'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

function fmt(n: number) {
    if (n === undefined || isNaN(n)) return '₹0';
    return (n).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function formatDateShort(d: string) {
    const dt = new Date(d);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return dt.getDate() + ' ' + months[dt.getMonth()] + ' ' + dt.getFullYear();
}

function HisaabViewer() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            const dataStr = searchParams?.get('d');
            const idStr = searchParams?.get('id');

            if (idStr) {
                // Fetch from cloud DB for completely LIVE links
                try {
                    const res = await fetch(`/api/hisaab/share/${idStr}`);
                    if(!res.ok) throw new Error('Not found');
                    const json = await res.json();
                    
                    // The json here is the RAW customer object from LocalStorage.
                    // We need to shape it the way the UI expects it (c: {...}, s: {...}, t: [...])
                    let c = 0, d = 0;
                    json.txns.forEach((t: any) => { if(t.type === 'credit') c += t.amt; else d += t.amt; });
                    const isNeg = json.balance < 0;
                    const net = Math.abs(json.balance);
                    
                    const shapedData = {
                        c: { n: json.name, p: json.phone, t: json.type },
                        s: { net, neg: isNeg, r: c, g: d },
                        t: json.txns.map((t: any) => ({
                            d: t.date.split('T')[0],
                            a: t.amt,
                            y: t.type[0], // c, d, a
                            n: t.name || ''
                        }))
                    };
                    setData(shapedData);
                } catch (e) {
                    setError(true);
                }
            } else if (dataStr) {
                // Fallback for old offline base64 links
                try {
                    const decoded = atob(dataStr);
                    const decodedURIComponent = decodeURIComponent(escape(decoded));
                    const json = JSON.parse(decodedURIComponent);
                    setData(json);
                } catch (e) {
                    setError(true);
                }
            } else {
                setError(true);
            }
        };
        fetchData();
    }, [searchParams]);

    if (!mounted) return null;

    if (error || !data) {
        return (
            <div style={{ background: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', fontFamily: "'Poppins', sans-serif" }}>
                <div style={{ background: '#fff', borderRadius: '20px', padding: '30px', textAlign: 'center', maxWidth: '360px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', color: '#1a1f6e', marginBottom: '10px' }}>Hisaab Not Found</h2>
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>Please request a new link.</p>
                </div>
            </div>
        );
    }

    const { c, s, t } = data;

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
                
                body { background: #fff; margin: 0; padding: 0; }
                .h-container { background: #f0f2f5; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 0; font-family: 'Poppins', sans-serif; }
                .card { background: #fff; border-radius: 0; border: none; overflow: hidden; max-width: 480px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.05); margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }

                .header { background: linear-gradient(135deg, #1a1f6e 0%, #2d35b5 60%, #4a55e8 100%); padding: 18px 20px 20px; }

                .logo-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
                .logo-box { display: flex; align-items: center; gap: 7px; }
                .logo-icon { width: 32px; height: 32px; background: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .logo-text { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: 0.5px; line-height: 1.2; }
                .logo-tagline { font-size: 9px; color: rgba(255,255,255,0.7); letter-spacing: 1px; text-transform: uppercase; }
                .share-badge { background: rgba(255,255,255,0.15); border: 0.5px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 4px 10px; font-size: 10px; color: #fff; font-weight: 500; }

                .party-name { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 2px; }
                .party-meta { font-size: 12px; color: rgba(255,255,255,0.75); display: flex; align-items: center; gap: 6px; }
                .dot { width: 3px; height: 3px; background: rgba(255,255,255,0.5); border-radius: 50%; display: inline-block; }

                .balance-section { background: rgba(0,0,0,0.2); border-radius: 12px; padding: 12px 14px; margin-top: 12px; }
                .bal-label { font-size: 10px; color: rgba(255,255,255,0.6); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
                .bal-amount { font-size: 28px; font-weight: 700; line-height: 1; }
                .bal-amount.dena { color: #ff6b6b; }
                .bal-amount.lena { color: #4ade80; }
                .bal-tag { display: inline-block; font-size: 9px; font-weight: 600; padding: 2px 8px; border-radius: 20px; letter-spacing: 0.5px; margin-left: 8px; vertical-align: middle; position: relative; top: -2px; }
                .bal-tag.dena { background: #ff6b6b; color: #fff; }
                .bal-tag.lena { background: #4ade80; color: #14532d; }

                .stats-row { display: grid; grid-template-columns: 1fr 1fr; }
                .stat-box { padding: 12px 14px; border-bottom: 0.5px solid #e0e0e0; }
                .stat-box:first-child { border-right: 0.5px solid #e0e0e0; }
                .stat-label { font-size: 10px; color: #888; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 3px; }
                .stat-val { font-size: 16px; font-weight: 600; }
                .stat-val.credit { color: #22c55e; }
                .stat-val.debit { color: #ef4444; }

                .txn-header { padding: 10px 14px 6px; display: flex; align-items: center; justify-content: space-between; border-bottom: 0.5px solid #e0e0e0; }
                .txn-title { font-size: 11px; font-weight: 600; color: #888; letter-spacing: 1px; text-transform: uppercase; }
                .txn-count { font-size: 10px; color: #888; background: #f5f5f5; padding: 2px 8px; border-radius: 10px; }

                .txn-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 0.5px solid #e0e0e0; }
                .txn-item:last-of-type { border-bottom: none; }
                .txn-icon { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .txn-icon.debit { background: #fff0f0; }
                .txn-icon.credit { background: #f0fdf4; }
                .txn-icon svg { width: 14px; height: 14px; }
                
                .txn-info { flex: 1; min-width: 0; }
                .txn-name { font-size: 13px; font-weight: 500; color: #222; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .txn-date { font-size: 11px; color: #999; margin-top: 1px; }
                .txn-amt { text-align: right; flex-shrink: 0; }
                .txn-val { font-size: 14px; font-weight: 600; }
                .txn-val.debit { color: #ef4444; }
                .txn-val.credit { color: #22c55e; }
                .txn-type { font-size: 10px; color: #aaa; text-align: right; margin-top: 1px; text-transform: uppercase; }

                .cta-box { background: #f0f4ff; border: 0.5px solid #c7d2fe; border-radius: 12px; margin: 0 14px 14px; padding: 10px 12px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; }
                .cta-box:hover { background: #e0e7ff; }
                .cta-icon { width: 32px; height: 32px; background: #2d35b5; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .cta-icon svg { width: 16px; height: 16px; }
                .cta-head { font-size: 11px; font-weight: 600; color: #1a1f6e; }
                .cta-sub { font-size: 10px; color: #4a55e8; }

                .footer { background: #f9f9f9; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; border-top: 0.5px solid #e0e0e0; cursor: pointer; }
                .footer-left { font-size: 10px; color: #aaa; }
                .footer-link { font-size: 11px; font-weight: 600; color: #2d35b5; text-decoration: none; display: flex; align-items: center; gap: 4px; }
                .footer-link svg { width: 12px; height: 12px; }

                .generated-on { font-size: 9px; color: #bbb; padding: 0 14px 10px; text-align: center; }
            `}</style>

            <div className="h-container">
                <div className="card">
                    {/* Header with Logo & Party Info */}
                    <div className="header">
                        <div className="logo-row">
                            <div className="logo-box" onClick={() => { window.location.href = 'https://billgst.in'; }} style={{ cursor: 'pointer' }}>
                                <div className="logo-icon">
                                    <Image src="/logo.png" alt="BillGST" width={26} height={26} style={{ objectFit: 'contain' }} />
                                </div>
                                <div>
                                    <div className="logo-text">BillGST</div>
                                    <div className="logo-tagline">Business Hisaab</div>
                                </div>
                            </div>
                            <div className="share-badge">Shared Report</div>
                        </div>

                        <div className="party-name">{c.n}</div>
                        <div className="party-meta">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="rgba(255,255,255,0.7)"/>
                            </svg>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{c.p}</span>
                            <span className="dot"></span>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{c.t}</span>
                        </div>

                        <div className="balance-section">
                            <div className="bal-label">Net Balance</div>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                                <span className={`bal-amount ${s.neg ? 'dena' : 'lena'}`}>
                                    {s.neg ? '-' : '+'}{fmt(s.net)}
                                </span>
                                <span className={`bal-tag ${s.neg ? 'dena' : 'lena'}`}>
                                    {s.neg ? 'DENA HAI' : 'LENA HAI'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Credit / Debit Summary */}
                    <div className="stats-row">
                        <div className="stat-box">
                            <div className="stat-label">Total Lena Hai (Credit)</div>
                            <div className="stat-val credit">{fmt(s.r)}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Total Dena Hai (Debit)</div>
                            <div className="stat-val debit">{fmt(s.g)}</div>
                        </div>
                    </div>

                    {/* Transactions Header */}
                    <div className="txn-header">
                        <span className="txn-title">Recent Transactions</span>
                        <span className="txn-count">{(t || []).length} entries</span>
                    </div>

                    {/* Transactions List */}
                    <div>
                        {t && t.length > 0 ? t.map((txn: any, idx: number) => {
                            // y is type[0] => 'c' (credit), 'd' (debit), 'a' (advance)
                            const isCr = txn.y === 'c';
                            return (
                                <div className="txn-item" key={idx}>
                                    <div className={`txn-icon ${isCr ? 'credit' : 'debit'}`}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            {isCr ? (
                                                <path d="M5 12h14M12 19l-7-7 7-7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            ) : (
                                                <path d="M5 12h14M12 5l7 7-7 7" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            )}
                                        </svg>
                                    </div>
                                    <div className="txn-info">
                                        <div className="txn-name">{txn.n || (isCr ? 'Credit' : 'Debit')}</div>
                                        <div className="txn-date">{formatDateShort(txn.d)}</div>
                                    </div>
                                    <div className="txn-amt">
                                        <div className={`txn-val ${isCr ? 'credit' : 'debit'}`}>
                                            {fmt(txn.a)}
                                        </div>
                                        <div className="txn-type">{isCr ? 'CREDIT' : 'DEBIT'}</div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                                Koi transaction nahi mila
                            </div>
                        )}
                    </div>

                    {/* CTA Box */}
                    <a href="https://billgst.in" className="cta-box" style={{ textDecoration: 'none' }}>
                        <div className="cta-icon">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.31 15.14v-1.67c-1.5-.31-2.86-1.27-2.86-2.97h1.72c.09.92.72 1.64 2.32 1.64 1.71 0 2.1-.86 2.1-1.39 0-.71-.39-1.4-2.34-1.86-2.17-.52-3.66-1.42-3.66-3.21 0-1.51 1.21-2.49 2.72-2.81V5h2.34v1.69c1.62.4 2.44 1.63 2.49 2.97h-1.71c-.04-.98-.56-1.64-1.94-1.64-1.31 0-2.1.59-2.1 1.43 0 .73.57 1.22 2.34 1.67 1.76.46 3.65 1.22 3.66 3.42-.01 1.61-1.21 2.48-2.73 2.77V19H12.3v-1.86z" fill="#fff"/>
                            </svg>
                        </div>
                        <div>
                            <div className="cta-head">Aap bhi free account banayein</div>
                            <div className="cta-sub">billgst.in — Free Business Hisaab App</div>
                        </div>
                    </a>

                    {/* Footer */}
                    <a href="https://billgst.in" className="footer" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="footer-left">Powered by BillGST</div>
                        <div className="footer-link">
                            Visit billgst.in
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="#2d35b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </a>

                    <div className="generated-on">Generated at {formatDateShort(new Date().toISOString())} via BillGST App</div>
                </div>
            </div>
        </>
    );
}

export default function HisaabViewerPage() {
    return (
        <React.Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #4a55e8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        }>
            <HisaabViewer />
        </React.Suspense>
    );
}
