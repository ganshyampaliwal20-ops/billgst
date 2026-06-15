'use client';

import { useSearchParams, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { generateHisaabPDF } from '../../../lib/pdf-generator';

function fmt(n: number) {
    if (n === undefined || isNaN(n)) return '₹0';
    return (n).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function HisaabViewer() {
    const searchParams = useSearchParams();
    const params = useParams();
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
            const idStr = searchParams?.get('id') || params?.id as string;

            if (idStr) {
                try {
                    const res = await fetch(`/api/hisaab/share/${idStr}?t=${Date.now()}`, { cache: 'no-store' });
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
            const businessDetails = b ? { name: b.business_name, phone: b.business_phone, email: b.business_email, logo: b.logo } : { name: 'Business Statement' };
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
    const initials = (bizName || 'B').charAt(0).toUpperCase();
    
    // Aggregating last 6 months data for chart
    const monthlyData: Record<string, { given: number, received: number }> = {};
    const months: string[] = [];
    for(let i=5; i>=0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.toLocaleString('en-US', { month: 'short' });
        const y = d.getFullYear();
        const key = `${m} ${y}`;
        months.push(key);
        monthlyData[key] = { given: 0, received: 0 };
    }
    
    t.forEach((txn: any) => {
        const d = new Date(txn.d);
        const m = d.toLocaleString('en-US', { month: 'short' });
        const y = d.getFullYear();
        const key = `${m} ${y}`;
        if(monthlyData[key]) {
            if(txn.y === 'c') monthlyData[key].received += txn.a;
            else monthlyData[key].given += txn.a;
        }
    });

    let maxAmount = 0;
    months.forEach(m => {
        if(monthlyData[m].given > maxAmount) maxAmount = monthlyData[m].given;
        if(monthlyData[m].received > maxAmount) maxAmount = monthlyData[m].received;
    });
    if(maxAmount === 0) maxAmount = 1;

    return (
        <div style={{ background: '#070b12', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
                :root{
                  --bg:#070b12;
                  --s1:#0c1220;
                  --s2:#111b2e;
                  --s3:#172035;
                  --border:rgba(255,255,255,0.07);
                  --border2:rgba(255,255,255,0.13);
                  --text:#e8edf8;
                  --text2:#7a88a8;
                  --text3:#3d4d68;
                  --green:#00d48b;
                  --green-glow:rgba(0,212,139,0.12);
                  --green-dk:#00a36c;
                  --red:#ff5370;
                  --red-glow:rgba(255,83,112,0.1);
                  --blue:#4d9fff;
                  --blue-glow:rgba(77,159,255,0.1);
                  --purple:#9d7cff;
                  --purple-glow:rgba(157,124,255,0.1);
                  --gold:#ffc947;
                  --gold-glow:rgba(255,201,71,0.08);
                }
                *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
                .hisaab-page {
                  font-family:'Outfit',sans-serif;
                  background:var(--bg);
                  min-height:100vh;
                  max-width:420px;
                  margin:0 auto;
                  color:var(--text);
                  -webkit-font-smoothing:antialiased;
                  position:relative;
                  overflow-x:hidden;
                }
                .hisaab-page *{scrollbar-width:none;}
                .hisaab-page *::-webkit-scrollbar{display:none;}

                /* ── AMBIENT BACKGROUND ── */
                .ambient{
                  position:fixed;inset:0;z-index:0;pointer-events:none;
                  overflow:hidden;
                  max-width:420px;
                  margin:0 auto;
                }
                .amb-circle{
                  position:absolute;border-radius:50%;filter:blur(80px);
                  animation:ambFloat 8s ease-in-out infinite;
                }
                .amb1{
                  width:300px;height:300px;
                  background:radial-gradient(circle,rgba(0,212,139,0.08),transparent);
                  top:-100px;right:-80px;
                  animation-delay:0s;
                }
                .amb2{
                  width:250px;height:250px;
                  background:radial-gradient(circle,rgba(77,159,255,0.06),transparent);
                  bottom:100px;left:-80px;
                  animation-delay:-4s;
                }
                .amb3{
                  width:200px;height:200px;
                  background:radial-gradient(circle,rgba(157,124,255,0.05),transparent);
                  top:40%;right:-60px;
                  animation-delay:-7s;
                }
                @keyframes ambFloat{
                  0%,100%{transform:translate(0,0);}
                  33%{transform:translate(15px,-20px);}
                  66%{transform:translate(-10px,15px);}
                }

                /* ── PAGE ── */
                .page{position:relative;z-index:1;padding:0 0 40px;}

                /* ── HERO HEADER ── */
                .hero{
                  padding:28px 20px 0;
                  background:linear-gradient(180deg,rgba(13,20,40,0) 0%,transparent 100%);
                }

                /* Brand row */
                .brand-row{
                  display:flex;align-items:center;justify-content:space-between;
                  margin-bottom:28px;
                }
                .brand-left{display:flex;align-items:center;gap:10px;}
                .brand-logo{
                  width:38px;height:38px;border-radius:11px;
                  background:linear-gradient(135deg,#1a2a4a,#243560);
                  border:1px solid var(--border2);
                  display:flex;align-items:center;justify-content:center;
                  box-shadow:0 4px 16px rgba(0,0,0,.4);
                  overflow:hidden;
                }
                .brand-logo img{width:100%;height:100%;object-fit:cover;}
                .brand-logo svg{width:20px;height:20px;}
                .brand-name{
                  font-family:'Clash Display',sans-serif;
                  font-size:15px;font-weight:600;color:var(--text);letter-spacing:-.2px;
                }
                .brand-sub{font-size:10px;color:var(--text3);margin-top:1px;font-weight:400;}
                .verified-pill{
                  display:flex;align-items:center;gap:5px;
                  background:rgba(0,212,139,0.08);
                  border:1px solid rgba(0,212,139,0.2);
                  border-radius:99px;padding:5px 12px;
                  font-size:10px;font-weight:700;color:var(--green);
                  letter-spacing:.3px;
                }
                .verified-pill svg{width:10px;height:10px;}

                /* Statement type badge */
                .stmt-badge{
                  display:inline-flex;align-items:center;gap:6px;
                  background:var(--s2);border:1px solid var(--border2);
                  border-radius:10px;padding:8px 14px;
                  margin-bottom:20px;
                }
                .stmt-badge-icon{font-size:16px;}
                .stmt-badge-text{
                  font-family:'Clash Display',sans-serif;
                  font-size:15px;font-weight:600;color:var(--text);
                }

                /* Greeting */
                .greeting{
                  margin-bottom:24px;
                }
                .greeting-hi{
                  font-size:28px;font-weight:700;color:var(--text);
                  letter-spacing:-.5px;line-height:1.1;margin-bottom:8px;
                  font-family:'Clash Display',sans-serif;
                }
                .greeting-hi .name{
                  color:var(--green);
                  position:relative;display:inline-block;
                }
                .greeting-hi .name::after{
                  content:'';position:absolute;
                  bottom:-2px;left:0;right:0;height:2px;
                  background:linear-gradient(90deg,var(--green),rgba(0,212,139,0));
                  border-radius:2px;
                }
                .greeting-sub{font-size:13px;color:var(--text2);line-height:1.7;font-weight:400;}

                /* ── BALANCE CARD ── */
                .balance-card{
                  margin:0 20px 16px;
                  background:var(--s1);
                  border:1px solid var(--border);
                  border-radius:22px;
                  overflow:hidden;
                  position:relative;
                }
                .balance-card::before{
                  content:'';position:absolute;
                  top:0;left:0;right:0;height:1px;
                  background:linear-gradient(90deg,transparent,rgba(0,212,139,0.4),transparent);
                }

                .balance-top{padding:22px 20px 18px;}
                .bal-eyebrow{
                  font-size:9px;font-weight:700;color:var(--text3);
                  text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;
                }
                .bal-amount-row{display:flex;align-items:flex-end;gap:6px;margin-bottom:10px;}
                .bal-curr{
                  font-family:'Clash Display',sans-serif;
                  font-size:22px;font-weight:500;color:var(--text2);
                  padding-bottom:6px;
                }
                .bal-amount{
                  font-family:'Clash Display',sans-serif;
                  font-size:48px;font-weight:700;line-height:1;letter-spacing:-2px;
                }
                .bal-amount.get{color:var(--green);}
                .bal-amount.give{color:var(--red);}

                .bal-status-chip{
                  display:inline-flex;align-items:center;gap:6px;
                  border-radius:99px;padding:6px 14px;
                  font-size:11px;font-weight:700;
                  margin-bottom:4px;
                }
                .bsc-get{
                  background:var(--green-glow);
                  border:1px solid rgba(0,212,139,0.25);
                  color:var(--green);
                }
                .bsc-give{
                  background:var(--red-glow);
                  border:1px solid rgba(255,83,112,0.25);
                  color:var(--red);
                }
                .bsc-dot{width:6px;height:6px;border-radius:50%;background:currentColor;animation:pulse 2s infinite;}
                @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.7);}}

                /* Stats row */
                .bal-stats{
                  background:rgba(0,0,0,0.25);
                  border-top:1px solid var(--border);
                  display:grid;grid-template-columns:1fr 1px 1fr 1px 1fr;
                  padding:14px 0;
                }
                .bstat-div{background:var(--border);}
                .bstat{text-align:center;padding:0 8px;}
                .bstat-lbl{
                  font-size:9px;font-weight:700;color:var(--text3);
                  text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px;
                }
                .bstat-val{
                  font-family:'DM Mono',monospace;
                  font-size:14px;font-weight:500;
                }
                .sv-r{color:var(--red);}
                .sv-g{color:var(--green);}
                .sv-w{color:var(--text);}

                /* ── MINI CHART ── */
                .mini-chart-card{
                  margin:0 20px 16px;
                  background:var(--s1);border:1px solid var(--border);
                  border-radius:18px;padding:16px 18px;
                }
                .mc-header{
                  display:flex;align-items:center;justify-content:space-between;
                  margin-bottom:14px;
                }
                .mc-title{font-size:12px;font-weight:700;color:var(--text2);}
                .mc-legend{display:flex;gap:12px;}
                .mc-leg-item{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text3);}
                .mc-leg-dot{width:6px;height:6px;border-radius:50%;}

                .chart-bars{
                  display:flex;align-items:flex-end;gap:4px;height:60px;
                }
                .chart-col{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;}
                .chart-bar-wrap{display:flex;gap:2px;align-items:flex-end;flex:1;width:100%;}
                .cbar{
                  flex:1;border-radius:3px 3px 0 0;min-height:3px;
                  transition:height .5s ease;
                }
                .cb-give{background:rgba(255,83,112,0.6);}
                .cb-get{background:rgba(0,212,139,0.6);}
                .chart-lbl{font-size:8px;color:var(--text3);text-align:center;font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%;}

                /* ── ACTION BUTTONS ── */
                .actions{margin:0 20px 14px;display:flex;flex-direction:column;gap:10px;}

                .btn-primary{
                  display:flex;align-items:center;justify-content:center;gap:10px;
                  padding:16px 20px;border-radius:14px;border:none;cursor:pointer;
                  background:linear-gradient(135deg,var(--green-dk),var(--green));
                  color:#fff;font-family:'Outfit',sans-serif;
                  font-size:15px;font-weight:800;letter-spacing:-.2px;
                  box-shadow:0 6px 28px rgba(0,212,139,0.3),inset 0 1px 0 rgba(255,255,255,0.15);
                  transition:all .18s;position:relative;overflow:hidden;
                }
                .btn-primary::before{
                  content:'';position:absolute;inset:0;
                  background:linear-gradient(135deg,rgba(255,255,255,0.08),transparent);
                  border-radius:14px;
                }
                .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,212,139,0.4);}
                .btn-primary:active{transform:scale(.98);}
                .btn-primary svg{width:17px;height:17px;flex-shrink:0;}
                .btn-primary-sub{font-size:11px;opacity:.7;font-weight:500;}

                .btn-copy{
                  display:flex;align-items:center;justify-content:center;gap:8px;
                  padding:13px 20px;border-radius:14px;
                  background:var(--s2);border:1px solid var(--border2);
                  font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;
                  color:var(--text2);cursor:pointer;transition:all .15s;
                }
                .btn-copy:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-glow);}
                .btn-copy svg{width:15px;height:15px;}

                /* ── TRANSACTIONS ── */
                .txn-section{margin:0 20px 14px;}
                .sec-header{
                  display:flex;align-items:center;justify-content:space-between;
                  margin-bottom:12px;
                }
                .sec-title{
                  font-size:13px;font-weight:700;color:var(--text2);
                  display:flex;align-items:center;gap:7px;
                }
                .sec-title-dot{width:6px;height:6px;border-radius:50%;background:var(--purple);}
                .txn-count{
                  font-size:11px;color:var(--text3);
                  background:var(--s2);border:1px solid var(--border);
                  padding:3px 9px;border-radius:99px;font-weight:600;
                }

                .txn-list{display:flex;flex-direction:column;gap:8px;}
                .txn-item{
                  display:flex;align-items:center;gap:12px;
                  background:var(--s1);border:1px solid var(--border);
                  border-radius:14px;padding:12px 14px;
                  transition:border-color .12s;
                }
                .txn-item:hover{border-color:var(--border2);}

                .txn-icon{
                  width:38px;height:38px;border-radius:11px;
                  display:flex;align-items:center;justify-content:center;flex-shrink:0;
                }
                .ti-give{background:var(--red-glow);border:1px solid rgba(255,83,112,0.15);}
                .ti-give svg{color:var(--red);}
                .ti-get{background:var(--green-glow);border:1px solid rgba(0,212,139,0.15);}
                .ti-get svg{color:var(--green);}
                .txn-icon svg{width:16px;height:16px;}

                .txn-info{flex:1;min-width:0;}
                .txn-note{
                  font-size:13px;font-weight:600;color:var(--text);
                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;
                }
                .txn-date{font-size:10px;color:var(--text3);font-weight:500;}

                .txn-right{text-align:right;flex-shrink:0;}
                .txn-amt{
                  font-family:'DM Mono',monospace;
                  font-size:14px;font-weight:500;
                }
                .ta-give{color:var(--red);}
                .ta-get{color:var(--green);}
                .txn-bal{font-size:10px;color:var(--text3);margin-top:2px;}

                /* ── BUSINESS CARD ── */
                .biz-section{
                  margin:0 20px 14px;
                  background:var(--s1);border:1px solid var(--border);
                  border-radius:18px;overflow:hidden;
                }
                .biz-top{
                  padding:16px 18px 14px;
                  background:linear-gradient(135deg,rgba(157,124,255,0.06),rgba(77,159,255,0.04));
                  border-bottom:1px solid var(--border);
                  display:flex;align-items:center;gap:11px;
                }
                .biz-avatar{
                  width:42px;height:42px;border-radius:12px;
                  background:linear-gradient(135deg,#1e3a5f,#243870);
                  border:1px solid var(--border2);
                  display:flex;align-items:center;justify-content:center;
                  font-size:18px;font-weight:900;color:var(--green);flex-shrink:0;
                  font-family:'Clash Display',sans-serif;
                  overflow:hidden;
                }
                .biz-avatar img{width:100%;height:100%;object-fit:cover;}
                .biz-name-big{
                  font-size:15px;font-weight:700;color:var(--text);letter-spacing:-.2px;
                }
                .biz-handle{font-size:11px;color:var(--text3);margin-top:2px;}

                .biz-contacts{padding:12px 18px;display:flex;flex-direction:column;gap:10px;}
                .biz-contact-row{display:flex;align-items:center;gap:10px;}
                .bc-icon{
                  width:28px;height:28px;border-radius:8px;
                  display:flex;align-items:center;justify-content:center;flex-shrink:0;
                }
                .bc-phone{background:rgba(0,212,139,0.1);}
                .bc-phone svg{color:var(--green);}
                .bc-email{background:rgba(77,159,255,0.1);}
                .bc-email svg{color:var(--blue);}
                .bc-icon svg{width:13px;height:13px;}
                .bc-val{font-size:13px;color:var(--blue);font-weight:500;text-decoration:none;}
                .bc-val:hover{text-decoration:underline;}

                /* ── UPI CARD ── */
                .upi-card{
                  margin:0 20px 14px;
                  background:linear-gradient(135deg,rgba(157,124,255,0.08),rgba(77,159,255,0.05));
                  border:1px solid rgba(157,124,255,0.2);
                  border-radius:18px;padding:18px;
                }
                .upi-top{
                  display:flex;align-items:center;gap:8px;margin-bottom:12px;
                }
                .upi-badge{
                  display:flex;align-items:center;gap:5px;
                  background:rgba(157,124,255,0.12);border:1px solid rgba(157,124,255,0.25);
                  border-radius:6px;padding:4px 9px;
                  font-size:10px;font-weight:800;color:var(--purple);letter-spacing:.4px;text-transform:uppercase;
                }
                .upi-badge svg{width:11px;height:11px;}
                .upi-id-row{
                  background:rgba(0,0,0,0.25);border-radius:10px;
                  padding:10px 14px;margin-bottom:12px;
                  display:flex;align-items:center;justify-content:space-between;
                }
                .upi-id{
                  font-family:'DM Mono',monospace;
                  font-size:13px;font-weight:500;color:var(--text);
                }
                .upi-copy-mini{
                  font-size:10px;color:var(--purple);font-weight:700;cursor:pointer;
                }

                .upi-pay-btn{
                  display:flex;align-items:center;justify-content:center;gap:8px;
                  width:100%;padding:14px;border-radius:12px;
                  background:linear-gradient(135deg,#7c3aed,#9d7cff);
                  border:none;cursor:pointer;
                  font-family:'Outfit',sans-serif;font-size:14px;font-weight:800;
                  color:#fff;letter-spacing:-.1px;
                  box-shadow:0 6px 24px rgba(157,124,255,0.35),inset 0 1px 0 rgba(255,255,255,0.15);
                  transition:all .18s;
                }
                .upi-pay-btn:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(157,124,255,0.45);}
                .upi-pay-btn:active{transform:scale(.98);}
                .upi-pay-btn svg{width:16px;height:16px;}

                /* ── FOOTER ── */
                .footer{
                  text-align:center;padding:20px 20px 10px;
                }
                .footer-thanks{
                  font-size:22px;margin-bottom:6px;
                }
                .footer-text{font-size:12px;color:var(--text3);font-style:italic;}
                .footer-brand{
                  margin-top:10px;
                  font-size:11px;color:var(--text3);
                }
                .footer-brand a{color:var(--blue);text-decoration:none;font-weight:600;}

                /* ── TOAST ── */
                .toast{
                  position:fixed;top:20px;left:50%;
                  transform:translateX(-50%) translateY(-14px);
                  background:var(--s3);color:var(--text);
                  padding:10px 18px;border-radius:99px;
                  font-size:12px;font-weight:700;
                  border:1px solid var(--border2);
                  opacity:0;pointer-events:none;
                  transition:all .22s;z-index:999;white-space:nowrap;
                  box-shadow:0 8px 32px rgba(0,0,0,.5);
                }
                .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
            `}} />

            <div className="hisaab-page">
                <div className="ambient">
                  <div className="amb-circle amb1"></div>
                  <div className="amb-circle amb2"></div>
                  <div className="amb-circle amb3"></div>
                </div>

                <div className="page">
                    {/* HERO */}
                    <div className="hero">
                        <div className="brand-row">
                          <div className="brand-left">
                            <div className="brand-logo">
                              {b?.logo ? (
                                  <img src={b.logo} alt="Logo" />
                              ) : (
                                  <svg viewBox="0 0 28 28" fill="none">
                                    <rect x="3" y="3" width="10" height="10" rx="2.5" fill="white"/>
                                    <rect x="16" y="3" width="10" height="6.5" rx="2.5" fill="rgba(255,255,255,.55)"/>
                                    <rect x="3" y="16" width="10" height="6.5" rx="2.5" fill="rgba(255,255,255,.55)"/>
                                    <rect x="16" y="12" width="10" height="10" rx="2.5" fill="white"/>
                                  </svg>
                              )}
                            </div>
                            <div>
                              <div className="brand-name">BillGST</div>
                              <div className="brand-sub">Business Hisaab</div>
                            </div>
                          </div>
                          <div className="verified-pill">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                            VERIFIED
                          </div>
                        </div>

                        <div className="stmt-badge">
                          <span className="stmt-badge-icon">📊</span>
                          <span className="stmt-badge-text">Hisaab Pro Statement</span>
                        </div>

                        <div className="greeting">
                          <div className="greeting-hi">
                            Namaste <span className="name">{c.n}</span> 🙏
                          </div>
                          <div className="greeting-sub">
                            Aapka Hisaab-Kitab taiyar hai. Neeche poori detail dekh sakte hain aur PDF bhi download kar sakte hain.
                          </div>
                        </div>
                    </div>

                    {/* BALANCE CARD */}
                    <div className="balance-card">
                        <div className="balance-top">
                          <div className="bal-eyebrow">Net Balance · {new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })}</div>
                          <div className="bal-amount-row">
                            <span className="bal-amount-currency" style={{fontSize: '22px', fontWeight: 500, color: 'var(--text2)', paddingBottom: '6px', fontFamily: "'Clash Display', sans-serif"}}>₹</span>
                            <span className={`bal-amount ${s.neg ? 'give' : 'get'}`}>{fmt(s.net).replace('₹','')}</span>
                          </div>
                          <div className={`bal-status-chip ${s.neg ? 'bsc-give' : 'bsc-get'}`}>
                            <span className="bsc-dot"></span>
                            {s.neg ? 'Aapko Dena Hai (You Have To Pay)' : 'Aapko Milna Hai (You Will Get)'}
                          </div>
                        </div>
                        <div className="bal-stats">
                          <div className="bstat">
                            <div className="bstat-lbl">Total Diya</div>
                            <div className="bstat-val sv-r">{fmt(s.g)}</div>
                          </div>
                          <div className="bstat-div"></div>
                          <div className="bstat">
                            <div className="bstat-lbl">Total Liya</div>
                            <div className="bstat-val sv-g">{fmt(s.r)}</div>
                          </div>
                          <div className="bstat-div"></div>
                          <div className="bstat">
                            <div className="bstat-lbl">Entries</div>
                            <div className="bstat-val sv-w">{(t || []).length}</div>
                          </div>
                        </div>
                    </div>

                    {/* MINI CHART */}
                    <div className="mini-chart-card">
                        <div className="mc-header">
                          <span className="mc-title">Pichhle 6 Mahine ka Hisaab</span>
                          <div className="mc-legend">
                            <div className="mc-leg-item"><div className="mc-leg-dot" style={{background: 'rgba(255,83,112,.7)'}}></div>Diya</div>
                            <div className="mc-leg-item"><div className="mc-leg-dot" style={{background: 'rgba(0,212,139,.7)'}}></div>Liya</div>
                          </div>
                        </div>
                        <div className="chart-bars">
                          {months.reverse().map((m, i) => {
                              const data = monthlyData[m];
                              const giveH = Math.max((data.given / maxAmount) * 60, 3);
                              const getH = Math.max((data.received / maxAmount) * 60, 3);
                              return (
                                  <div className="chart-col" key={i}>
                                    <div className="chart-bar-wrap">
                                      <div className="cbar cb-give" style={{height: `${giveH}px`}}></div>
                                      <div className="cbar cb-get" style={{height: `${getH}px`}}></div>
                                    </div>
                                    <div className="chart-lbl">{m.split(' ')[0]}</div>
                                  </div>
                              );
                          })}
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="actions">
                        <button className="btn-primary" onClick={handleDownloadPDF}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                          <div>
                            <div>Poora Hisaab Dekho & PDF Utaro</div>
                            <div className="btn-primary-sub">Online statement + PDF download</div>
                          </div>
                        </button>
                        <button className="btn-copy" onClick={handleCopyLink}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                          Statement Link Copy Karo
                        </button>
                    </div>

                    {/* RECENT TRANSACTIONS */}
                    <div className="txn-section">
                        <div className="sec-header">
                          <div className="sec-title">
                            <span className="sec-title-dot"></span>
                            Recent Transactions
                          </div>
                          <div className="txn-count">{(t || []).length} entries</div>
                        </div>
                        <div className="txn-list">
                          {(t || []).slice(0, 10).map((txn: any, i: number) => {
                              const isCredit = txn.y === 'c';
                              const dt = new Date(txn.d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                              return (
                                  <div className="txn-item" key={i}>
                                    <div className={`txn-icon ${isCredit ? 'ti-get' : 'ti-give'}`}>
                                      {isCredit ? (
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                                      ) : (
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                                      )}
                                    </div>
                                    <div className="txn-info">
                                      <div className="txn-note">{txn.n || (isCredit ? 'Payment mili' : 'Saman diya')}</div>
                                      <div className="txn-date">{dt}</div>
                                    </div>
                                    <div className="txn-right">
                                      <div className={`txn-amt ${isCredit ? 'ta-get' : 'ta-give'}`}>{fmt(txn.a)}</div>
                                    </div>
                                  </div>
                              );
                          })}
                        </div>
                    </div>

                    {/* BUSINESS CARD */}
                    <div className="biz-section">
                        <div className="biz-top">
                          <div className="biz-avatar">
                             {b?.logo ? <img src={b.logo} alt="Logo" /> : initials}
                          </div>
                          <div>
                            <div className="biz-name-big">💠 {bizName} 💠</div>
                            <div className="biz-handle">Powered by BillGST.in</div>
                          </div>
                        </div>
                        <div className="biz-contacts">
                          {b?.business_phone && (
                              <div className="biz-contact-row">
                                <div className="bc-icon bc-phone">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16z"/></svg>
                                </div>
                                <a className="bc-val" href={`tel:${b.business_phone}`}>{b.business_phone}</a>
                              </div>
                          )}
                          {b?.business_email && (
                              <div className="biz-contact-row">
                                <div className="bc-icon bc-email">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                </div>
                                <a className="bc-val" href={`mailto:${b.business_email}`}>{b.business_email}</a>
                              </div>
                          )}
                        </div>
                    </div>

                    {/* UPI CARD */}
                    {b?.business_upi_id && (
                        <div className="upi-card">
                            <div className="upi-top">
                              <div className="upi-badge">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
                                UPI Payment
                              </div>
                            </div>
                            <div className="upi-id-row">
                              <div className="upi-id">{b.business_upi_id}</div>
                              <div className="upi-copy-mini" onClick={() => {
                                  navigator.clipboard.writeText(b.business_upi_id);
                                  showToast('✓ UPI ID copy ho gayi!');
                              }}>Copy</div>
                            </div>
                            <button className="upi-pay-btn" onClick={handleUPI}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                              ⚡ Tap to Pay — UPI Se Abhi Do
                            </button>
                        </div>
                    )}

                    {/* FOOTER */}
                    <div className="footer">
                        <div className="footer-thanks">🙏</div>
                        <div className="footer-text">Dhanyawad! Aapka vishwas hamari shakti hai.</div>
                        <div className="footer-brand">Powered by <a href="https://billgst.in">BillGST.in</a> · Business Hisaab App</div>
                    </div>
                </div>

                <div className={`toast ${toastMsg ? 'show' : ''}`} id="t">{toastMsg}</div>
            </div>
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
