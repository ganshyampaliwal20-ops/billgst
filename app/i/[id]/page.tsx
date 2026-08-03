'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { generateInvoicePDF } from '../../../lib/pdf-generator';

function formatCurrency(amount: number) {
    if (isNaN(amount) || amount === undefined || amount === null) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount);
}

export default function InvoiceViewer() {
    const params = useParams();
    const id = params?.id as string;
    
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pdfGenerating, setPdfGenerating] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/public/invoice/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Not found');
                return res.json();
            })
            .then(data => {
                setInvoice(data);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [id]);

    const handleGeneratePDF = async (action: 'view' | 'download' | 'share') => {
        if (!invoice || !invoice.business_profile) return;
        setPdfGenerating(true);
        try {
            const { downloadAndShareFile } = await import('../../../lib/utils');
            const doc = await generateInvoicePDF(invoice, invoice.business_profile, false);
            if (!doc) throw new Error('Failed to generate');
            
            const base64Data = doc.output('datauristring').split(',')[1];
            const fileName = `Invoice_${invoice.invoice_number || '001'}.pdf`;
            await downloadAndShareFile(base64Data, fileName, 'application/pdf', action);
        } catch(e) {
            console.error('PDF error', e);
            alert('Failed to generate PDF. Please try again later.');
        } finally {
            setPdfGenerating(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #1B5E3B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div style={{ background: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', fontFamily: "sans-serif" }}>
                <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', textAlign: 'center', maxWidth: '360px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', color: '#1B5E3B', margin: '0 0 10px 0' }}>Invoice Not Found</h2>
                    <p style={{ fontSize: '13px', color: '#888', margin: '0 0 20px 0' }}>The invoice you are looking for does not exist or has been deleted.</p>
                </div>
            </div>
        );
    }

    const b = invoice.business_profile;
    const c = invoice.customer;
    const upiLink = b?.business_upi_id ? `/pay?pa=${encodeURIComponent(b.business_upi_id)}&pn=${encodeURIComponent(b.business_name || 'Business')}&am=${encodeURIComponent(invoice.total_amount)}&tn=${encodeURIComponent(invoice.invoice_number)}` : '#';

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

                .inv-footer { background: #15472d; padding: 20px 16px; text-align: center; color: #fff; }
                .inv-thanks { color: rgba(255,255,255,0.92); font-size: 13.5px; font-style: italic; margin-bottom: 14px; display: block; }
                .inv-promo-card { background: rgba(0, 0, 0, 0.28); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px; padding: 16px 14px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
                .inv-promo-badge { display: inline-block; background: #eab308; color: #000; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; margin-bottom: 8px; }
                .inv-promo-title { font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 4px; line-height: 1.3; }
                .inv-promo-desc { font-size: 11.5px; color: #cbd5e1; margin: 0 0 12px; }
                .inv-feature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 14px; text-align: left; }
                .inv-feature-chip { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; padding: 6px 8px; font-size: 11px; font-weight: 600; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .inv-promo-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: linear-gradient(135deg, #22c55e, #16a34a); color: #ffffff; font-size: 14px; font-weight: 800; padding: 12px 18px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4); transition: transform 0.2s, filter 0.2s; }
                .inv-promo-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
                .inv-promo-trust { font-size: 11px; color: #fef08a; font-weight: 600; margin-top: 10px; }
                .inv-powered { font-size: 10.5px; color: rgba(255, 255, 255, 0.65); margin-top: 8px; }
                .inv-powered a { color: #86efac; text-decoration: underline; font-weight: 600; }

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
                                <div className="inv-tagline">Invoice Notification</div>
                            </div>
                        </div>
                    </div>

                    <div className="inv-body">
                        <p className="inv-greeting">Hi <strong>{c?.name || 'Customer'}</strong> 👋</p>

                        <div className="inv-amount-row">
                            <div>
                                <div className="inv-label">Invoice Amount</div>
                                <div className="inv-value">{formatCurrency(invoice.total_amount)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="inv-label">Invoice No.</div>
                                <div className="inv-inv-no">#{invoice.invoice_number}</div>
                            </div>
                        </div>

                        <p className="inv-subtitle">Aapka invoice ready hai. {b?.business_upi_id ? 'Kripya neeche diye gaye UPI se payment karein.' : 'Neeche se PDF download karein.'}</p>

                        <hr className="inv-divider" />

                        {b?.business_phone && (
                            <div className="inv-contact-row">
                                <i className="ti ti-phone"></i>
                                <a href={`tel:+91${b.business_phone.replace(/[^0-9]/g, '').slice(-10)}`}>
                                    +91 {b.business_phone.replace(/[^0-9]/g, '').slice(-10)}
                                </a>
                            </div>
                        )}
                        {b?.business_email && (
                            <div className="inv-contact-row">
                                <i className="ti ti-mail"></i>
                                <a href={`mailto:${b.business_email}`}>{b.business_email}</a>
                            </div>
                        )}

                        {b?.business_upi_id && (
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
                            {b?.business_upi_id ? (
                                <a className="inv-pay-btn" href={upiLink}>
                                    <i className="ti ti-device-mobile-payment" style={{ fontSize: '17px' }}></i>
                                    Abhi Pay Karein
                                </a>
                            ) : (
                                <div className="inv-pay-btn disabled" style={{ background: '#777' }}>
                                    <i className="ti ti-device-mobile-payment" style={{ fontSize: '17px' }}></i>
                                    UPI Not Set
                                </div>
                            )}
                            <button className="inv-pdf-btn" onClick={() => setIsModalOpen(true)}>
                                <i className="ti ti-file-type-pdf" style={{ fontSize: '18px', color: '#C0392B' }}></i>
                                Invoice
                            </button>
                        </div>
                    </div>

                    <div className="inv-footer">
                        <span className="inv-thanks">🙏 Dhanyawad! Aapka vishwas hamari shakti hai.</span>
                        <div className="inv-promo-card">
                            <div className="inv-promo-badge">
                                🚀 ALL-IN-ONE VYAPAR APP
                            </div>
                            <h4 className="inv-promo-title">
                                Apne Business Ko Banayein Smart & Digital
                            </h4>
                            <p className="inv-promo-desc">
                                Billing, Khata, WhatsApp Reminders aur bahut kuch ek hi app mein:
                            </p>

                            <div className="inv-feature-grid">
                                <div className="inv-feature-chip">🧾 GST & Non-GST Bills</div>
                                <div className="inv-feature-chip">📒 Udhaar & Hisaab Diary</div>
                                <div className="inv-feature-chip">💬 WhatsApp Reminders</div>
                                <div className="inv-feature-chip">📦 Stock & Inventory</div>
                                <div className="inv-feature-chip">🛍️ Free Online Dukaan</div>
                                <div className="inv-feature-chip">👥 Staff & Attendance</div>
                                <div className="inv-feature-chip">📊 GSTR-1, 3B Reports</div>
                                <div className="inv-feature-chip">☁️ Safe Auto Cloud Backup</div>
                            </div>

                            <a href="https://billgst.in/register" target="_blank" rel="noopener noreferrer" className="inv-promo-btn">
                                <span>⚡ BillGST par Free Account Banayein</span>
                                <i className="ti ti-arrow-right"></i>
                            </a>

                            <div className="inv-promo-trust">
                                ⭐ 100% Free · 50,000+ Indian Merchants Ka Bharosa
                            </div>

                            <div className="inv-powered">
                                Made with ❤️ in India · <a href="https://billgst.in" target="_blank" rel="noopener noreferrer">BillGST.in</a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* PDF Modal */}
            <div className={`pdf-modal-bg ${isModalOpen ? 'open' : ''}`} id="pdfModal">
                <div className="pdf-modal">
                    <div className="pdf-modal-header">
                        <span><i className="ti ti-file-type-pdf" style={{ fontSize: '15px', verticalAlign: '-2px', marginRight: '6px' }}></i>Invoice PDF</span>
                        <button className="pdf-modal-close" onClick={() => setIsModalOpen(false)}>×</button>
                    </div>
                    <div className="pdf-modal-body">
                        <div className="pdf-preview-box">
                            <i className="ti ti-file-type-pdf pdf-icon-big"></i>
                            <div className="pdf-fname">{invoice.invoice_number}.pdf</div>
                            <div className="pdf-size">{b?.business_name || 'Business'}</div>
                        </div>
                        <div className="pdf-detail-row"><span>Invoice No.</span><span>#{invoice.invoice_number}</span></div>
                        <div className="pdf-detail-row"><span>Customer</span><span>{c?.name || 'Customer'}</span></div>
                        <div className="pdf-detail-row"><span>Amount</span><span>{formatCurrency(invoice.total_amount)}</span></div>
                        <div className="pdf-detail-row"><span>Date</span><span>{new Date(invoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                        <div className="pdf-detail-row"><span>Status</span><span style={{ color: invoice.status === 'PAID' ? '#1B5E3B' : '#C0392B' }}>● {invoice.status || 'UNPAID'}</span></div>
                        <div className="pdf-action-row">
                            <button className="pdf-open-btn" onClick={() => handleGeneratePDF('view')} disabled={pdfGenerating}>
                                {pdfGenerating ? 'Generating...' : <><i className="ti ti-eye" style={{ fontSize: '14px', verticalAlign: '-2px', marginRight: '4px' }}></i>PDF Dekho</>}
                            </button>
                            <button className="pdf-dl-btn" onClick={() => handleGeneratePDF('download')} disabled={pdfGenerating}>
                                <i className="ti ti-download" style={{ fontSize: '14px', verticalAlign: '-2px', marginRight: '4px' }}></i>Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
