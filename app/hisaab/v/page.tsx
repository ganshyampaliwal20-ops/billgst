'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { generateHisaabPDF } from '../../../lib/pdf-generator';

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
    const [rawData, setRawData] = useState<any>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            const dataStr = searchParams?.get('d');
            const idStr = searchParams?.get('id');

            if (idStr) {
                try {
                    const res = await fetch(`/api/hisaab/share/${idStr}`);
                    if(!res.ok) throw new Error('Not found');
                    const json = await res.json();
                    
                    setRawData(json);

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
                try {
                    const decoded = atob(dataStr);
                    const decodedURIComponent = decodeURIComponent(escape(decoded));
                    const json = JSON.parse(decodedURIComponent);
                    setRawData(json);
                    
                    let c = 0, d = 0;
                    (json.txns || []).forEach((t: any) => { if(t.type === 'credit') c += t.amt; else d += t.amt; });
                    const isNeg = json.balance < 0;
                    const net = Math.abs(json.balance);
                    
                    const shapedData = {
                        c: { n: json.name, p: json.phone, t: json.type },
                        s: { net, neg: isNeg, r: c, g: d },
                        t: (json.txns || []).map((t: any) => ({
                            d: t.date.split('T')[0],
                            a: t.amt,
                            y: t.type[0],
                            n: t.name || ''
                        }))
                    };
                    setData(shapedData);
                } catch (e) {
                    setError(true);
                }
            } else {
                setError(true);
            }
            setLoading(false);
        };
        fetchData();
    }, [searchParams]);

    if (!mounted) return null;

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #4a55e8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

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

    const handleDownloadPDF = async () => {
        if (!rawData) return;
        setIsDownloading(true);
        try {
            const businessDetails = { name: 'Business Statement' };
            const custStats = { credit: s.r, debit: s.g, net: s.net, isNeg: s.neg };
            await generateHisaabPDF(rawData, businessDetails, custStats, true);
        } catch (e) {
            console.error(e);
            alert("Failed to download PDF");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
                
                body { background: #333; margin: 0; padding: 0; }
                .app-wrapper { display: flex; justify-content: center; min-height: 100vh; font-family: 'Poppins', sans-serif; }
                .app-shell { background: #f4f6f8; width: 100%; max-width: 440px; position: relative; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 0 40px rgba(0,0,0,0.2); }
                
                .app-header { background: linear-gradient(135deg, #1a1f6e 0%, #2d35b5 60%, #4a55e8 100%); padding: 25px 20px 30px; border-bottom-left-radius: 25px; border-bottom-right-radius: 25px; flex-shrink: 0; color: #fff; position: relative; z-index: 2; box-shadow: 0 4px 15px rgba(45, 53, 181, 0.3); }
                
                .brand-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
                .brand-info { display: flex; align-items: center; gap: 8px; }
                .brand-logo { width: 34px; height: 34px; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .brand-title { font-size: 16px; font-weight: 700; line-height: 1.1; }
                .brand-sub { font-size: 10px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px; }
                .app-badge { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600; backdrop-filter: blur(5px); }

                .user-details { margin-bottom: 15px; }
                .user-name { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
                .user-meta { font-size: 13px; color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 8px; }
                
                .bal-card { background: rgba(255,255,255,0.95); border-radius: 16px; padding: 15px 20px; margin-top: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: space-between; }
                .bal-title { font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
                .bal-value { font-size: 28px; font-weight: 700; line-height: 1; }
                .bal-value.dena { color: #e11d48; }
                .bal-value.lena { color: #059669; }
                .bal-status { font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; }
                .bal-status.dena { background: #ffe4e6; color: #e11d48; }
                .bal-status.lena { background: #d1fae5; color: #059669; }

                .app-content { flex: 1; overflow-y: auto; padding: 20px 15px 90px; }
                
                .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
                .summary-box { background: #fff; border-radius: 14px; padding: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
                .summary-label { font-size: 11px; color: #888; font-weight: 500; margin-bottom: 5px; }
                .summary-val { font-size: 18px; font-weight: 700; }
                .summary-val.cr { color: #10b981; }
                .summary-val.dr { color: #f43f5e; }

                .txn-list { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
                .txn-header { padding: 15px 20px; background: #fafafa; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
                .txn-title { font-size: 13px; font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 0.5px; }
                .txn-count { font-size: 11px; color: #666; background: #eee; padding: 3px 10px; border-radius: 12px; font-weight: 500; }
                
                .txn-item { display: flex; align-items: center; gap: 15px; padding: 15px 20px; border-bottom: 1px solid #f0f0f0; transition: background 0.2s; }
                .txn-item:last-child { border-bottom: none; }
                .txn-item:hover { background: #fafafa; }
                .t-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .t-icon.cr { background: #d1fae5; color: #059669; }
                .t-icon.dr { background: #ffe4e6; color: #e11d48; }
                .t-icon svg { width: 18px; height: 18px; }
                .t-info { flex: 1; min-width: 0; }
                .t-name { font-size: 14px; font-weight: 600; color: #222; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .t-date { font-size: 12px; color: #888; margin-top: 2px; }
                .t-amt { text-align: right; }
                .t-val { font-size: 15px; font-weight: 700; }
                .t-val.cr { color: #059669; }
                .t-val.dr { color: #e11d48; }
                .t-type { font-size: 10px; color: #999; text-transform: uppercase; font-weight: 600; margin-top: 2px; }

                .promo-banner { background: #e0e7ff; border-radius: 16px; padding: 16px; margin-top: 20px; display: flex; align-items: center; gap: 15px; cursor: pointer; text-decoration: none; border: 1px dashed #a5b4fc; }
                .promo-icon { width: 42px; height: 42px; background: #4f46e5; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .promo-text h4 { margin: 0 0 4px 0; font-size: 14px; color: #312e81; }
                .promo-text p { margin: 0; font-size: 12px; color: #4338ca; }

                .app-bottom-nav { position: absolute; bottom: 0; left: 0; right: 0; background: #fff; height: 70px; display: flex; align-items: center; justify-content: space-around; border-top-left-radius: 20px; border-top-right-radius: 20px; box-shadow: 0 -5px 20px rgba(0,0,0,0.05); z-index: 10; }
                .nav-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; color: #888; background: none; border: none; font-family: inherit; cursor: pointer; padding: 0 15px; width: 33.33%; transition: 0.2s; }
                .nav-item:hover, .nav-item:active { color: #2d35b5; }
                .nav-item.active { color: #2d35b5; }
                .nav-item svg { width: 22px; height: 22px; transition: transform 0.2s; }
                .nav-item:active svg { transform: scale(0.9); }
                .nav-label { font-size: 11px; font-weight: 600; }
                
                /* PDF Button Pulse */
                .pdf-btn { color: #059669; position: relative; }
                .pdf-btn:hover { color: #047857; }
                .pdf-btn svg { stroke: currentColor; }
                .downloading svg { animation: bounce 1s infinite; }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
            `}</style>

            <div className="app-wrapper">
                <div className="app-shell">
                    {/* App Header */}
                    <div className="app-header">
                        <div className="brand-row">
                            <div className="brand-info">
                                <div className="brand-logo">
                                    <Image src="/logo.png" alt="BillGST" width={24} height={24} style={{ objectFit: 'contain' }} />
                                </div>
                                <div>
                                    <div className="brand-title">BillGST</div>
                                    <div className="brand-sub">Business Hisaab</div>
                                </div>
                            </div>
                            <div className="app-badge">Shared Read-Only</div>
                        </div>

                        <div className="user-details">
                            <div className="user-name">{c.n}</div>
                            <div className="user-meta">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="currentColor"/>
                                </svg>
                                <span>{c.p}</span>
                                <span>•</span>
                                <span>{c.t}</span>
                            </div>
                        </div>

                        <div className="bal-card">
                            <div>
                                <div className="bal-title">Net Balance</div>
                                <div className={`bal-value ${s.neg ? 'dena' : 'lena'}`}>
                                    {s.neg ? '-' : '+'}{fmt(s.net)}
                                </div>
                            </div>
                            <div className={`bal-status ${s.neg ? 'dena' : 'lena'}`}>
                                {s.neg ? 'DENA HAI' : 'LENA HAI'}
                            </div>
                        </div>
                    </div>

                    {/* App Content */}
                    <div className="app-content">
                        <div className="summary-grid">
                            <div className="summary-box">
                                <div className="summary-label">Total Received</div>
                                <div className="summary-val cr">{fmt(s.r)}</div>
                            </div>
                            <div className="summary-box">
                                <div className="summary-label">Total Given</div>
                                <div className="summary-val dr">{fmt(s.g)}</div>
                            </div>
                        </div>

                        <div className="txn-list">
                            <div className="txn-header">
                                <span className="txn-title">Ledger Entries</span>
                                <span className="txn-count">{(t || []).length} items</span>
                            </div>
                            
                            {t && t.length > 0 ? t.map((txn: any, idx: number) => {
                                const isCr = txn.y === 'c';
                                return (
                                    <div className="txn-item" key={idx}>
                                        <div className={`t-icon ${isCr ? 'cr' : 'dr'}`}>
                                            <svg viewBox="0 0 24 24" fill="none">
                                                {isCr ? (
                                                    <path d="M5 12h14M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                ) : (
                                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                )}
                                            </svg>
                                        </div>
                                        <div className="t-info">
                                            <div className="t-name">{txn.n || (isCr ? 'Credit' : 'Debit')}</div>
                                            <div className="t-date">{formatDateShort(txn.d)}</div>
                                        </div>
                                        <div className="t-amt">
                                            <div className={`t-val ${isCr ? 'cr' : 'dr'}`}>{fmt(txn.a)}</div>
                                            <div className="t-type">{isCr ? 'CREDIT' : 'DEBIT'}</div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                                    No transactions found.
                                </div>
                            )}
                        </div>

                        <a href="https://billgst.in" className="promo-banner">
                            <div className="promo-icon">
                                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.31 15.14v-1.67c-1.5-.31-2.86-1.27-2.86-2.97h1.72c.09.92.72 1.64 2.32 1.64 1.71 0 2.1-.86 2.1-1.39 0-.71-.39-1.4-2.34-1.86-2.17-.52-3.66-1.42-3.66-3.21 0-1.51 1.21-2.49 2.72-2.81V5h2.34v1.69c1.62.4 2.44 1.63 2.49 2.97h-1.71c-.04-.98-.56-1.64-1.94-1.64-1.31 0-2.1.59-2.1 1.43 0 .73.57 1.22 2.34 1.67 1.76.46 3.65 1.22 3.66 3.42-.01 1.61-1.21 2.48-2.73 2.77V19H12.3v-1.86z" fill="#fff"/>
                                </svg>
                            </div>
                            <div className="promo-text">
                                <h4>Create Free Account</h4>
                                <p>Manage your own business hisaab easily</p>
                            </div>
                        </a>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="app-bottom-nav">
                        <button className="nav-item active">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                            <span className="nav-label">Ledger</span>
                        </button>

                        <button className={`nav-item pdf-btn ${isDownloading ? 'downloading' : ''}`} onClick={handleDownloadPDF} disabled={isDownloading}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span className="nav-label">{isDownloading ? 'Wait...' : 'Download PDF'}</span>
                        </button>
                        
                        <button className="nav-item" onClick={() => window.location.href = 'https://billgst.in'}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            <span className="nav-label">Get App</span>
                        </button>
                    </div>
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
