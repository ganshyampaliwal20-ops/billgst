'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { generateHisaabPDF } from '../../../lib/pdf-generator';

function fmt(n: number) {
    if (n === undefined || isNaN(n)) return '₹0';
    return (n).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function HisaabViewer() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<any>(null);
    const [rawData, setRawData] = useState<any>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

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
                            y: t.type[0],
                            n: t.name || ''
                        })),
                        b: json.businessProfile || null
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
                        })),
                        b: json.businessProfile || null
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
            <div style={{ minHeight: '100vh', background: '#eef2fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ background: '#eef2fb', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', fontFamily: "'Nunito', sans-serif" }}>
                <div style={{ background: '#fff', borderRadius: '20px', padding: '30px', textAlign: 'center', maxWidth: '360px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', color: '#1a1f6e', margin: '0 0 10px 0' }}>Hisaab Not Found</h2>
                    <p style={{ fontSize: '13px', color: '#888', margin: '0 0 20px 0' }}>Please request a new link.</p>
                </div>
            </div>
        );
    }

    const { c, s, t, b } = data;

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 2200);
    };

    const handleDownloadPDF = async () => {
        if (!rawData) return;
        showToast('⏳ PDF Download ho raha hai...');
        try {
            const businessDetails = b ? { name: b.business_name, phone: b.business_phone, email: b.business_email } : { name: 'Business Statement' };
            const custStats = { credit: s.r, debit: s.g, net: s.net, isNeg: s.neg };
            await generateHisaabPDF(rawData, businessDetails, custStats, true);
        } catch (e) {
            console.error(e);
            showToast('❌ PDF Error!');
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).catch(()=>{});
        showToast('✓ Link copy ho gayi');
    };

    const handleUPI = () => {
        if (b && b.business_upi_id) {
            showToast('⚡ UPI payment shuru...');
            window.location.href = `upi://pay?pa=${b.business_upi_id}&pn=${encodeURIComponent(b.business_name || 'Business')}&am=${s.net}&cu=INR`;
        } else {
            showToast('⚠️ UPI ID not configured');
        }
    };

    const bizName = b?.business_name || 'Business Hisaab';
    const initials = (c.n || 'U').charAt(0).toUpperCase();

    return (
        <div style={{ fontFamily: "'Nunito', sans-serif", background: '#eef2fb', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '24px 16px 48px' }}>
            <style dangerouslySetInnerHTML={{__html:`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .wa-wrap { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 0; }
                .wa-header { background: #1f2937; border-radius: 18px 18px 0 0; padding: 12px 16px; display: flex; align-items: center; gap: 10px; }
                .wa-back { color: #60a5fa; font-size: 20px; cursor: pointer; }
                .wa-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #10b981); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; color: #fff; flex-shrink: 0; }
                .wa-name { font-size: 14px; font-weight: 700; color: #fff; flex: 1; }
                .wa-icons { display: flex; gap: 14px; }
                .wa-icons svg { width: 18px; height: 18px; color: #9ca3af; }
                .wa-chat { background: #0b141a; padding: 12px 10px; min-height: 200px; position: relative; overflow: hidden; }
                .wa-chat::before { content: ''; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
                .msg-bubble { background: linear-gradient(145deg, #1a2e1e, #1e3d25); border-radius: 4px 14px 14px 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.4); position: relative; animation: bubbleIn .4s cubic-bezier(.22,1,.36,1) both; }
                @keyframes bubbleIn { from { opacity: 0; transform: translateY(10px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .msg-banner { background: linear-gradient(135deg, #1a1f6e, #4f46e5, #7c3aed); padding: 16px 16px 14px; position: relative; overflow: hidden; }
                .msg-banner::before { content: ''; position: absolute; top: -30px; right: -20px; width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.06); }
                .msg-banner::after { content: ''; position: absolute; bottom: -20px; left: -10px; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.04); }
                .banner-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; position: relative; z-index: 1; }
                .billgst-logo { display: flex; align-items: center; gap: 7px; }
                .logo-icon { width: 30px; height: 30px; border-radius: 8px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
                .logo-icon svg { width: 16px; height: 16px; color: #fff; }
                .logo-name { font-size: 14px; font-weight: 900; color: #fff; letter-spacing: -.2px; }
                .logo-tag { font-size: 9px; color: rgba(255,255,255,.5); font-weight: 600; }
                .verified-badge { display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2); border-radius: 99px; padding: 3px 9px; font-size: 9px; font-weight: 700; color: rgba(255,255,255,.8); letter-spacing: .3px; text-transform: uppercase; }
                .verified-badge svg { width: 9px; height: 9px; color: #4ade80; }
                .banner-title { font-size: 16px; font-weight: 900; color: #fff; letter-spacing: -.2px; margin-bottom: 3px; position: relative; z-index: 1; }
                .banner-sub { font-size: 11px; color: rgba(255,255,255,.55); position: relative; z-index: 1; font-weight: 600; }
                .msg-body { padding: 14px 16px; }
                .greeting { font-size: 14px; font-weight: 800; color: #e2f5e8; margin-bottom: 10px; }
                .greeting span { color: #4ade80; }
                .msg-text { font-size: 12.5px; color: rgba(255,255,255,.65); line-height: 1.7; margin-bottom: 14px; font-weight: 600; }
                .balance-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 14px; margin-bottom: 12px; }
                .bal-row { display: flex; justify-content: space-between; align-items: center; }
                .bal-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: .7px; }
                .bal-amount { font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 600; letter-spacing: -.5px; }
                .bal-amount.due { color: #f87171; }
                .bal-amount.paid { color: #4ade80; }
                .bal-status { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 99px; text-transform: uppercase; letter-spacing: .3px; margin-top: 6px; display: inline-block; }
                .bs-due { background: rgba(244,63,94,.2); color: #f87171; border: 1px solid rgba(244,63,94,.3); }
                .bs-paid { background: rgba(74,222,128,.15); color: #4ade80; border: 1px solid rgba(74,222,128,.25); }
                .bal-divider { height: 1px; background: rgba(255,255,255,.06); margin: 10px 0; }
                .bal-mini-row { display: flex; justify-content: space-between; }
                .bm-item { text-align: center; }
                .bm-label { font-size: 9px; font-weight: 700; color: rgba(255,255,255,.35); text-transform: uppercase; letter-spacing: .4px; }
                .bm-val { font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500; margin-top: 2px; color: #fff; }
                .bm-val.g { color: #4ade80; }
                .bm-val.r { color: #f87171; }
                .cta-btn { display: block; width: 100%; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 10px; padding: 13px 16px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; box-shadow: 0 4px 20px rgba(34,197,94,.3); transition: all .15s; cursor: pointer; border: none; }
                .cta-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(34,197,94,.4); }
                .cta-text { font-size: 13px; font-weight: 800; color: #fff; letter-spacing: -.1px; }
                .cta-icon { width: 16px; height: 16px; color: #fff; }
                .small-link { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; cursor: pointer; transition: all .12s; }
                .small-link:hover { background: rgba(255,255,255,.08); }
                .small-link svg { width: 12px; height: 12px; color: rgba(255,255,255,.4); flex-shrink: 0; }
                .small-link-text { font-family: 'DM Mono', monospace; font-size: 10px; color: rgba(255,255,255,.45); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .biz-info { background: rgba(255,255,255,.04); border-radius: 10px; padding: 11px 13px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,.07); }
                .biz-name { font-size: 13px; font-weight: 800; color: #e2f5e8; margin-bottom: 6px; }
                .biz-row { display: flex; align-items: center; gap: 7px; margin-bottom: 4px; }
                .biz-row:last-child { margin-bottom: 0; }
                .biz-row svg { width: 12px; height: 12px; color: rgba(255,255,255,.3); flex-shrink: 0; }
                .biz-row span { font-size: 11px; color: rgba(255,255,255,.5); font-weight: 600; }
                .biz-row a { color: #60a5fa; text-decoration: none; }
                .upi-section { background: rgba(79,70,229,.15); border: 1px solid rgba(79,70,229,.3); border-radius: 10px; padding: 11px 13px; margin-bottom: 12px; }
                .upi-title { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 800; color: rgba(167,139,250,.9); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }
                .upi-title svg { width: 12px; height: 12px; }
                .upi-id { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; color: #fff; margin-bottom: 8px; }
                .tap-pay-btn { display: flex; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 8px; padding: 9px 14px; font-size: 12px; font-weight: 800; color: #fff; cursor: pointer; border: none; width: 100%; box-shadow: 0 3px 12px rgba(79,70,229,.35); transition: all .15s; }
                .tap-pay-btn:hover { transform: translateY(-1px); }
                .tap-pay-btn svg { width: 14px; height: 14px; }
                .thankyou { text-align: center; padding: 8px 0 4px; font-size: 13px; color: rgba(255,255,255,.4); font-weight: 600; }
                .thankyou span { font-size: 16px; margin-right: 4px; }
                .msg-time { text-align: right; padding: 4px 14px 10px; font-size: 10px; color: rgba(255,255,255,.25); font-family: 'DM Mono', monospace; display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
                .msg-time svg { width: 14px; height: 14px; color: #53bdeb; }
                .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(10px); background: #0d0f1c; color: #fff; padding: 10px 20px; border-radius: 99px; font-size: 12px; font-weight: 700; opacity: 0; pointer-events: none; transition: all .22s; z-index: 999; white-space: nowrap; }
                .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
                .section-label { width: 100%; max-width: 400px; text-align: center; font-size: 11px; font-weight: 700; color: #b0b4cc; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px; margin-bottom: 8px; }
            `}} />

            <div className="section-label">Hisaab Statement Web View</div>

            <div className="wa-wrap">
                <div className="wa-header">
                    <span className="wa-back" onClick={() => window.history.back()}>←</span>
                    <div className="wa-avatar">{initials}</div>
                    <span className="wa-name">{bizName}</span>
                    <div className="wa-icons">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M8 10l4 4 4-4"/></svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16z"/></svg>
                    </div>
                </div>

                <div className="wa-chat">
                    <div className="msg-bubble">
                        <div className="msg-banner">
                            <div className="banner-top">
                                <div className="billgst-logo">
                                    <div className="logo-icon">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <rect x="3" y="3" width="8" height="8" rx="2" fill="white"/>
                                            <rect x="13" y="3" width="8" height="5" rx="2" fill="rgba(255,255,255,.6)"/>
                                            <rect x="3" y="13" width="8" height="5" rx="2" fill="rgba(255,255,255,.6)"/>
                                            <rect x="13" y="11" width="8" height="8" rx="2" fill="white"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="logo-name">BillGST</div>
                                        <div className="logo-tag">Business Hisaab</div>
                                    </div>
                                </div>
                                <div className="verified-badge">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                                    Verified
                                </div>
                            </div>
                            <div className="banner-title">📊 Hisaab Pro Statement</div>
                            <div className="banner-sub">Yahaan aapna poora hisaab dekhein</div>
                        </div>

                        <div className="msg-body">
                            <div className="greeting">Namaste <span>{c.n}</span> 🙏</div>
                            <div className="msg-text">Aapka Hisaab-Kitab niche uplabdh hai. Online PDF download karne ke liye neeche button dabayein:</div>

                            <div className="balance-card">
                                <div className="bal-row">
                                    <div>
                                        <div className="bal-label">Net Balance</div>
                                        <div className={`bal-amount ${s.neg ? 'due' : 'paid'}`}>{fmt(s.net)}</div>
                                        <span className={`bal-status ${s.neg ? 'bs-due' : 'bs-paid'}`}>
                                            {s.neg ? '⚠ Aapko Dena Hai' : '✓ Aapko Lena Hai'}
                                        </span>
                                    </div>
                                </div>
                                <div className="bal-divider"></div>
                                <div className="bal-mini-row">
                                    <div className="bm-item">
                                        <div className="bm-label">Total Diya</div>
                                        <div className="bm-val r">{fmt(s.g)}</div>
                                    </div>
                                    <div className="bm-item">
                                        <div className="bm-label">Total Liya</div>
                                        <div className="bm-val g">{fmt(s.r)}</div>
                                    </div>
                                    <div className="bm-item">
                                        <div className="bm-label">Transactions</div>
                                        <div className="bm-val" style={{ color: 'rgba(255,255,255,.6)' }}>{(t || []).length}</div>
                                    </div>
                                </div>
                            </div>

                            <button className="cta-btn" onClick={handleDownloadPDF}>
                                <svg className="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                                <span className="cta-text">Poora Hisaab Dekho & PDF Utaro</span>
                            </button>

                            <div className="small-link" onClick={handleCopyLink}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                                <span className="small-link-text">Copy Statement Link</span>
                            </div>

                            <div className="biz-info">
                                <div className="biz-name">💠 {bizName} 💠</div>
                                {b?.business_phone && (
                                    <div className="biz-row">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16z"/></svg>
                                        <span><a href={`tel:${b.business_phone}`}>{b.business_phone}</a></span>
                                    </div>
                                )}
                                {b?.business_email && (
                                    <div className="biz-row">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                        <span><a href={`mailto:${b.business_email}`}>{b.business_email}</a></span>
                                    </div>
                                )}
                            </div>

                            {b?.business_upi_id && (
                                <div className="upi-section">
                                    <div className="upi-title">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
                                        UPI Payment
                                    </div>
                                    <div className="upi-id">{b.business_upi_id}</div>
                                    <button className="tap-pay-btn" onClick={handleUPI}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                                        ⚡ Tap to Pay — UPI Se Abhi Do
                                    </button>
                                </div>
                            )}

                            <div className="thankyou"><span>🙏</span> <em>Dhanyawad!</em></div>
                        </div>

                        <div className="msg-time">
                            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 7l-1.41-1.41-6.34 6.34-2.83-2.83L6 10.5l4.24 4.24L18 7zm-1.41 5L13 16.59l-1.42-1.41 1.41-1.41L11.58 12l1.41-1.41L14.41 12 18 8.41 19.41 9.82 14.59 12z"/></svg>
                        </div>
                    </div>
                </div>

                <div style={{ background: '#1f2937', borderRadius: '0 0 18px 18px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, background: '#374151', borderRadius: '99px', padding: '8px 14px', fontSize: '12px', color: '#6b7280' }}>Message</div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
                    </div>
                </div>
            </div>

            <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
        </div>
    );
}

export default function HisaabViewerPage() {
    return (
        <React.Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#eef2fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        }>
            <HisaabViewer />
        </React.Suspense>
    );
}
