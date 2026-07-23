'use client';

import { useSearchParams, useParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';
import { generateHisaabPDF } from '../../../lib/pdf-generator';

function formatCurrency(amount: number) {
    if (isNaN(amount) || amount === undefined || amount === null) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount);
}

function HisaabViewerContent() {
    const searchParams = useSearchParams();
    const params = useParams();
    const [data, setData] = useState<any>(null);
    const [rawData, setRawData] = useState<any>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
                    const txns = json.txns || [];
                    txns.forEach((t: any) => { if(t.type === 'credit') c += t.amt; else d += t.amt; });
                    const balance = json.balance || 0;
                    const isNeg = balance < 0;
                    const net = Math.abs(balance);
                    
                    const shapedData = {
                        c: { n: json.name || json.customer?.name || 'Customer', p: json.phone || json.customer?.phone || '', t: json.type || 'Customer' },
                        s: { net, neg: isNeg, r: c, g: d, entries: txns.length },
                        t: txns.map((t: any) => ({
                            d: t.date ? t.date.split('T')[0] : '',
                            a: t.amt || 0,
                            y: t.type ? t.type[0] : 'd',
                            n: t.name || ''
                        })),
                        b: json.businessProfile || null
                    };
                    setData(shapedData);
                } catch (e) {
                    console.error("Hisaab Viewer Error:", e);
                    setError(true);
                }
            } else if (dataStr) {
                try {
                    const decoded = atob(dataStr);
                    const decodedURIComponent = decodeURIComponent(escape(decoded));
                    const json = JSON.parse(decodedURIComponent);
                    setRawData(json);
                    
                    let c = 0, d = 0;
                    const txns = json.txns || [];
                    txns.forEach((t: any) => { if(t.type === 'credit') c += t.amt; else d += t.amt; });
                    const balance = json.balance || 0;
                    const isNeg = balance < 0;
                    const net = Math.abs(balance);
                    
                    const shapedData = {
                        c: { n: json.name || json.customer?.name || 'Customer', p: json.phone || json.customer?.phone || '', t: json.type || 'Customer' },
                        s: { net, neg: isNeg, r: c, g: d, entries: txns.length },
                        t: txns.map((t: any) => ({
                            d: t.date ? t.date.split('T')[0] : '',
                            a: t.amt || 0,
                            y: t.type ? t.type[0] : 'd',
                            n: t.name || ''
                        })),
                        b: json.businessProfile || null
                    };
                    setData(shapedData);
                } catch (e) {
                    console.error("Hisaab Viewer Error:", e);
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
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #1B5E3B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ background: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', fontFamily: "sans-serif" }}>
                <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', textAlign: 'center', maxWidth: '360px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', color: '#1B5E3B', margin: '0 0 10px 0' }}>Hisaab Not Found</h2>
                    <p style={{ fontSize: '13px', color: '#888', margin: '0 0 20px 0' }}>The statement you are looking for does not exist or has been deleted.</p>
                </div>
            </div>
        );
    }

    const { c, s, t, b } = data;

    const handleGeneratePDF = async (action: 'view' | 'download' | 'share') => {
        if (!rawData) return;
        setPdfGenerating(true);
        try {
            const { downloadAndShareFile } = await import('../../../lib/utils');
            const businessDetails = b ? { name: b.business_name, phone: b.business_phone, email: b.business_email, logo: b.logo } : { name: 'Business Statement' };
            const custStats = { credit: s.r, debit: s.g, net: s.net, isNeg: s.neg };
            
            const doc = await generateHisaabPDF(rawData, businessDetails, custStats, false);
            if (!doc) throw new Error('Failed to generate');
            
            const base64Data = doc.output('datauristring').split(',')[1];
            const fileName = `Hisaab_${c.n || 'Customer'}.pdf`;
            await downloadAndShareFile(base64Data, fileName, 'application/pdf', action);
        } catch (e) {
            console.error('PDF error', e);
            alert('Failed to generate PDF. Please try again later.');
        } finally {
            setPdfGenerating(false);
        }
    };

    const handlePayment = async (method: string) => {
        setIsProcessingPayment(true);
        const upiLink = b?.business_upi_id ? `upi://pay?pa=${b.business_upi_id}&pn=${encodeURIComponent(b.business_name || 'Business')}&am=${s.net}&tn=Hisaab` : '#';
        try {
            const idStr = searchParams?.get('id') || params?.id as string;
            const res = await fetch(`/api/public/hisaab/pay/${idStr}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amt: data.s.net, method })
            });
            if (res.ok) {
                const newTxn = {
                    d: new Date().toISOString().split('T')[0],
                    a: data.s.net,
                    y: 'c',
                    n: method
                };
                setData((prev: any) => ({
                    ...prev,
                    s: {
                        ...prev.s,
                        r: prev.s.r + prev.s.net,
                        net: 0,
                        entries: prev.s.entries + 1
                    },
                    t: [newTxn, ...(prev.t || [])]
                }));

                setTimeout(() => {
                    window.location.href = upiLink;
                }, 500);
            } else {
                window.location.href = upiLink;
            }
        } catch (e) {
            console.error("Payment logging failed", e);
            window.location.href = upiLink;
        } finally {
            setIsProcessingPayment(false);
            setIsPaymentModalOpen(false);
        }
    };

    const upiLink = b?.business_upi_id ? `upi://pay?pa=${b.business_upi_id}&pn=${encodeURIComponent(b.business_name || 'Business')}&am=${s.net}&tn=Hisaab` : '#';

    return (
        <div style={{ background: '#f0f2f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem 1rem', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                
                .inv-wrap { max-width: 420px; width: 100%; }
                .inv-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }

                .inv-header { background: #1B5E3B; padding: 20px 24px 16px; }
                .inv-header-row { display: flex; align-items: center; gap: 10px; }
                .inv-logo { width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .inv-logo img { width: 100%; height: 100%; object-fit: cover; }
                .inv-logo i { color: #fff; font-size: 22px; }
                .inv-brand { color: #fff; font-size: 20px; font-weight: 600; letter-spacing: 0.3px; }
                .inv-tagline { color: rgba(255,255,255,0.65); font-size: 12px; margin-top: 2px; }

                .inv-body { padding: 20px 24px; }
                .inv-greeting { font-size: 15px; color: #1a1a1a; margin-bottom: 14px; }

                .inv-amount-row { display: flex; align-items: center; justify-content: space-between; background: #f6f8f6; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px; }
                .inv-label { font-size: 11px; color: #888; margin-bottom: 2px; }
                .inv-value { font-size: 24px; font-weight: 700; color: #1B5E3B; }
                .inv-value.give { color: #C0392B; }
                .inv-value.get { color: #1B5E3B; }
                .inv-inv-no { font-size: 13px; font-weight: 600; color: #333; }

                .inv-subtitle { font-size: 13px; color: #777; margin-bottom: 14px; }
                .inv-divider { border: none; border-top: 1px solid #f0f0f0; margin: 14px 0; }

                .inv-contact-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; color: #555; }
                .inv-contact-row i { color: #1B5E3B; font-size: 16px; }
                .inv-contact-row a { color: #1B5E3B; text-decoration: none; }

                .inv-upi-box { background: #EAF4EE; border: 1px solid #9DD4B4; border-radius: 10px; padding: 12px 16px; margin: 14px 0; }
                .inv-upi-label { font-size: 11px; color: #2E7D52; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                .inv-upi-id { font-size: 14px; color: #1B5E3B; font-weight: 600; display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
                .inv-copy-btn { background: #1B5E3B; border: none; color: #fff; border-radius: 6px; padding: 3px 10px; font-size: 12px; cursor: pointer; }

                .inv-btn-row { display: flex; gap: 8px; margin-top: 10px; }
                .inv-pay-btn { flex: 2; display: flex; align-items: center; justify-content: center; gap: 6px; background: #1B5E3B; color: #fff; border: none; border-radius: 10px; padding: 12px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; }
                .inv-pay-btn:hover { background: #174f31; }
                .inv-pay-btn.disabled { opacity: 0.6; pointer-events: none; }
                .inv-pdf-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; background: transparent; color: #1B5E3B; border: 1.5px solid #1B5E3B; border-radius: 10px; padding: 12px; font-size: 13px; font-weight: 600; cursor: pointer; }
                .inv-pdf-btn:hover { background: #EAF4EE; }

                .inv-footer { background: #1B5E3B; padding: 12px 24px; text-align: center; }
                .inv-thanks { color: rgba(255,255,255,0.85); font-size: 13px; font-style: italic; }

                /* PDF Modal */
                .pdf-modal-bg { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center; padding: 1rem; }
                .pdf-modal-bg.open { display: flex; }
                .pdf-modal { background: #fff; border-radius: 16px; width: 100%; max-width: 340px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
                .pdf-modal-header { background: #1B5E3B; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; }
                .pdf-modal-header span { color: #fff; font-size: 14px; font-weight: 600; }
                .pdf-modal-close { background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; font-size: 22px; line-height: 1; }
                .pdf-modal-body { padding: 18px; }
                .pdf-preview-box { background: #f6f8f6; border-radius: 10px; border: 1px solid #e8e8e8; padding: 18px; text-align: center; margin-bottom: 14px; }
                .pdf-icon-big { font-size: 48px; color: #C0392B; display: block; margin-bottom: 8px; }
                .pdf-fname { font-size: 13px; font-weight: 600; color: #333; }
                .pdf-size { font-size: 12px; color: #888; margin-top: 2px; }
                .pdf-detail-row { display: flex; justify-content: space-between; font-size: 13px; color: #777; padding: 7px 0; border-bottom: 1px solid #f0f0f0; }
                .pdf-detail-row:last-child { border-bottom: none; }
                .pdf-detail-row span:last-child { color: #1a1a1a; font-weight: 600; text-align: right; }
                .pdf-action-row { display: flex; gap: 8px; margin-top: 14px; }
                .pdf-open-btn { flex: 1; background: #1B5E3B; color: #fff; border: none; border-radius: 10px; padding: 11px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; }
                .pdf-open-btn:hover { background: #174f31; }
                .pdf-open-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .pdf-dl-btn { flex: 1; background: transparent; color: #1B5E3B; border: 1.5px solid #1B5E3B; border-radius: 10px; padding: 11px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; }
                .pdf-dl-btn:hover { background: #EAF4EE; }
                .pdf-dl-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                
                .txn-section { margin-top: 20px; text-align: left; }
                .txn-section-title { font-size: 14px; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; border-bottom: 1px solid #eaeaea; padding-bottom: 6px; }
                .txn-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f4f4f4; }
                .txn-item:last-child { border-bottom: none; }
                .txn-left { display: flex; flex-direction: column; }
                .txn-date { font-size: 10px; color: #888; margin-bottom: 2px; }
                .txn-name { font-size: 12px; color: #333; font-weight: 600; }
                .txn-amt { font-size: 13px; font-weight: 700; }
                .txn-amt.credit { color: #1B5E3B; }
                .txn-amt.debit { color: #C0392B; }
            `}} />

            <div className="inv-wrap">
                <div className="inv-card">

                    <div className="inv-header">
                        <div className="inv-header-row">
                            <div className="inv-logo">
                                {b?.logo ? <img src={b.logo} alt="Logo" /> : <i className="ti ti-diamond"></i>}
                            </div>
                            <div>
                                <div className="inv-brand">{b?.business_name || 'Business'}</div>
                                <div className="inv-tagline">Hisaab Statement</div>
                            </div>
                        </div>
                    </div>

                    <div className="inv-body">
                        <p className="inv-greeting">Hi <strong>{c.n || 'Customer'}</strong> 👋</p>

                        <div className="inv-amount-row">
                            <div>
                                <div className="inv-label">{s.neg ? 'Aapka Advance Jama Hai' : 'Aapko Dena Hai'}</div>
                                <div className={`inv-value ${s.neg ? 'get' : 'give'}`}>{formatCurrency(s.net)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="inv-label">Entries</div>
                                <div className="inv-inv-no">{s.entries}</div>
                            </div>
                        </div>

                        <p className="inv-subtitle">
                            Aapka hisaab ready hai. 
                            {s.neg ? ' Kripya neeche diye gaye UPI se payment karein.' : ' Neeche se PDF download karein.'}
                        </p>



                        {b?.business_phone && (
                            <div className="inv-contact-row">
                                <i className="ti ti-phone"></i>
                                <a href={`tel:+91${b.business_phone.replace(/[^0-9]/g, '')}`}>+91 {b.business_phone}</a>
                            </div>
                        )}
                        {b?.business_email && (
                            <div className="inv-contact-row">
                                <i className="ti ti-mail"></i>
                                <a href={`mailto:${b.business_email}`}>{b.business_email}</a>
                            </div>
                        )}

                        {s.neg && b?.business_upi_id && (
                            <>
                                <hr className="inv-divider" />
                                <div className="inv-upi-box">
                                    <div className="inv-upi-label"><i className="ti ti-qrcode" style={{ fontSize: '13px', verticalAlign: '-1px' }}></i> UPI ID</div>
                                    <div className="inv-upi-id">
                                        {b.business_upi_id}
                                        <button className="inv-copy-btn" onClick={(e) => {
                                            navigator.clipboard.writeText(b.business_upi_id);
                                            const target = e.target as HTMLButtonElement;
                                            target.textContent = 'Copied!';
                                            setTimeout(() => target.textContent = 'Copy', 1500);
                                        }}>Copy</button>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="inv-btn-row">
                            {!s.neg && b?.business_upi_id ? (
                                <button className="inv-pay-btn" onClick={() => setIsPaymentModalOpen(true)} disabled={isProcessingPayment || s.net <= 0} style={{ border: 'none', cursor: (isProcessingPayment || s.net <= 0) ? 'not-allowed' : 'pointer' }}>
                                    <i className="ti ti-device-mobile-payment" style={{ fontSize: '17px' }}></i>
                                    {isProcessingPayment ? 'Wait...' : (s.net <= 0 ? 'Paid' : 'Abhi Pay Karein')}
                                </button>
                            ) : (
                                <div className="inv-pay-btn disabled" style={{ background: '#777', display: !s.neg ? 'flex' : 'none' }}>
                                    <i className="ti ti-device-mobile-payment" style={{ fontSize: '17px' }}></i>
                                    UPI Not Set
                                </div>
                            )}
                            <button className="inv-pdf-btn" onClick={() => setIsModalOpen(true)}>
                                <i className="ti ti-file-type-pdf" style={{ fontSize: '18px', color: '#C0392B' }}></i>
                                PDF Dekho
                            </button>
                        </div>

                        {t && t.length > 0 && (
                            <div className="txn-section">
                                <div className="txn-section-title">Sabhi Entries ({t.length})</div>
                                {t.map((txn: any, idx: number) => (
                                    <div className="txn-item" key={idx}>
                                        <div className="txn-left">
                                            <div className="txn-date">{new Date(txn.d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            <div className="txn-name">{txn.n || (txn.y === 'c' ? 'Payment Received' : 'Item/Service Given')}</div>
                                        </div>
                                        <div className={`txn-amt ${txn.y === 'c' ? 'credit' : 'debit'}`}>
                                            {txn.y === 'c' ? '+' : '-'}{formatCurrency(txn.a)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="inv-footer">
                        <span className="inv-thanks">🙏 Dhanyawad! Aapka vishwas hamari shakti hai.</span>
                    </div>

                </div>
            </div>

            {/* PDF Modal */}
            <div className={`pdf-modal-bg ${isModalOpen ? 'open' : ''}`} id="pdfModal">
                <div className="pdf-modal">
                    <div className="pdf-modal-header">
                        <span><i className="ti ti-file-type-pdf" style={{ fontSize: '15px', verticalAlign: '-2px', marginRight: '6px' }}></i>Hisaab PDF</span>
                        <button className="pdf-modal-close" onClick={() => setIsModalOpen(false)}>×</button>
                    </div>
                    <div className="pdf-modal-body">
                        <div className="pdf-preview-box">
                            <i className="ti ti-file-type-pdf pdf-icon-big"></i>
                            <div className="pdf-fname">Hisaab_{c.n || 'Customer'}.pdf</div>
                            <div className="pdf-size">{b?.business_name || 'Business'}</div>
                        </div>
                        <div className="pdf-detail-row"><span>Customer</span><span>{c.n || 'Customer'}</span></div>
                        <div className="pdf-detail-row"><span>Total Given</span><span style={{ color: '#C0392B' }}>{formatCurrency(s.g)}</span></div>
                        <div className="pdf-detail-row"><span>Total Rcvd</span><span style={{ color: '#1B5E3B' }}>{formatCurrency(s.r)}</span></div>
                        <div className="pdf-detail-row"><span>Net Balance</span><span style={{ color: s.neg ? '#C0392B' : '#1B5E3B', fontWeight: 700 }}>{formatCurrency(s.net)}</span></div>
                        <div className="pdf-action-row">
                            <button className="pdf-open-btn" onClick={() => handleGeneratePDF('view')} disabled={pdfGenerating}>
                                {pdfGenerating ? 'Generating...' : <><i className="ti ti-eye" style={{ fontSize: '14px', verticalAlign: '-2px', marginRight: '4px' }}></i>View PDF</>}
                            </button>
                            <button className="pdf-dl-btn" onClick={() => handleGeneratePDF('download')} disabled={pdfGenerating}>
                                <i className="ti ti-download" style={{ fontSize: '14px', verticalAlign: '-2px', marginRight: '4px' }}></i>Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <div className={`pdf-modal-overlay ${isPaymentModalOpen ? 'show' : ''}`} onClick={() => !isProcessingPayment && setIsPaymentModalOpen(false)}>
                <div className={`pdf-modal ${isPaymentModalOpen ? 'show' : ''}`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '350px' }}>
                    <div className="pdf-modal-header" style={{ background: '#1B5E3B' }}>
                        <div>Aap kis app se pay karenge?</div>
                        {!isProcessingPayment && <button className="pdf-modal-close" onClick={() => setIsPaymentModalOpen(false)}>✕</button>}
                    </div>
                    <div className="pdf-modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '10px', color: '#555', fontSize: '13px' }}>
                            Aap {formatCurrency(data?.s?.net)} pay kar rahe hain. Niche apna payment app select karein.
                        </div>
                        <button onClick={() => handlePayment('Google Pay')} disabled={isProcessingPayment} style={{ cursor: 'pointer', background: '#fff', border: '1px solid #ddd', padding: '12px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Google_Pay_Logo.svg" alt="GPay" style={{ height: '20px' }} /> Google Pay
                        </button>
                        <button onClick={() => handlePayment('PhonePe')} disabled={isProcessingPayment} style={{ cursor: 'pointer', background: '#fff', border: '1px solid #ddd', padding: '12px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#5f259f' }}>
                            PhonePe
                        </button>
                        <button onClick={() => handlePayment('Paytm')} disabled={isProcessingPayment} style={{ cursor: 'pointer', background: '#fff', border: '1px solid #ddd', padding: '12px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#002970' }}>
                            Paytm
                        </button>
                        <button onClick={() => handlePayment('Other UPI')} disabled={isProcessingPayment} style={{ cursor: 'pointer', background: '#f5f5f5', border: '1px solid #ddd', padding: '12px', borderRadius: '8px', fontWeight: 600, color: '#333' }}>
                            Other App
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default function HisaabViewer() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #1B5E3B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        }>
            <HisaabViewerContent />
        </Suspense>
    );
}
