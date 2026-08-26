'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function InvoiceActionModal({ 
  invoice, 
  onClose,
  onWhatsApp,
  onViewPdf,
  onDownloadPdf,
  onEway,
  onDelete,
  paymentAmount,
  setPaymentAmount,
  onRecordPayment,
  isSubmittingPayment
}: any) {
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  let toastTimer: any;
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setShowToast(false), 2200);
  };

  const balDue = Math.max(Number(invoice?.total_amount || 0) - Number(invoice?.paid_amount || 0), 0);
  const isPaid = (invoice?.status || '').toLowerCase() === 'paid' || (Number(invoice?.total_amount) > 0 && balDue <= 0);
  const paidPct = Math.min((Number(invoice?.paid_amount || 0) / Number(invoice?.total_amount || 1)) * 100, 100);

  return (
    <div className="invoice-action-wrapper" onClick={onClose}>
      <style dangerouslySetInnerHTML={{ __html: `
        .invoice-action-wrapper {
          --bg: #0A0E1A;
          --bg-soft: #0D1220;
          --surface: #131A2C;
          --surface-2: #1A2238;
          --border: #232C47;
          --border-soft: #1C2438;
          --text: #F2F1FA;
          --text-dim: #9298B0;
          --text-faint: #5C6380;
          --indigo: #6C5CE7;
          --indigo-2: #4834D4;
          --gold: #E3B23C;
          --gold-soft: #F0CB6E;
          --green: #22C55E;
          --whatsapp: #25D366;
          --rose: #FB6D6D;
          --rose-soft: #3A1F27;
          --radius-lg: 22px;
          --radius-md: 16px;
          --radius-sm: 11px;
        }
        .invoice-action-wrapper {
          background: rgba(10, 14, 26, 0.85);
          backdrop-filter: blur(8px);
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 28px 14px 60px;
          font-family: 'Inter', sans-serif;
          color: var(--text);
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 9999;
          overflow-y: auto;
        }
        .invoice-action-wrapper * { box-sizing: border-box; }
        .phone{
          width: 100%;
          max-width: 402px;
          position: relative;
          animation: slideUp .3s cubic-bezier(.22,1,.36,1);
        }
        @keyframes slideUp{
          from{ transform: translateY(100%); opacity: 0; }
          to{ transform: translateY(0); opacity: 1; }
        }
        .inv-card{
          background: var(--surface);
          border: 1px solid var(--border-soft);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 30px 60px -25px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02) inset;
        }

        /* ---------- Header ---------- */
        .inv-header{
          position: relative;
          padding: 26px 22px 30px;
          background:
            radial-gradient(120% 140% at 100% 0%, rgba(108,92,231,0.35) 0%, transparent 55%),
            linear-gradient(160deg, #1B2247 0%, #121732 65%, #0F1428 100%);
          border-bottom: 1px dashed var(--border);
        }
        .inv-header::before{
          content: "";
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 14px 14px;
          pointer-events: none;
        }
        .top-row{
          display: flex; align-items: flex-start; justify-content: space-between;
          position: relative; z-index: 1;
        }
        .inv-meta{
          display: flex; flex-direction: column; gap: 6px;
        }
        .inv-label{
          font-size: 10.5px; letter-spacing: 0.12em; font-weight: 700;
          color: var(--text-faint); text-transform: uppercase;
        }
        .inv-number{
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px; font-weight: 600; color: #B9BEE0;
          letter-spacing: 0.02em;
        }
        .status-pill{
          display: flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, rgba(251,109,109,0.18), rgba(251,109,109,0.08));
          border: 1px solid rgba(251,109,109,0.35);
          color: var(--rose-soft, #FFB3B3);
          padding: 7px 13px 7px 10px;
          border-radius: 999px;
          font-size: 12px; font-weight: 700;
        }
        .status-pill.paid {
          background: linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.08));
          border: 1px solid rgba(34,197,94,0.35);
          color: #99F6E4;
        }
        .status-pill.paid .dot {
          background: var(--green);
          box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
        }
        .status-pill .dot{
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--rose);
          box-shadow: 0 0 0 3px rgba(251,109,109,0.2);
        }
        .amount-block{ margin-top: 22px; position: relative; z-index: 1;}
        .amount-tag{
          font-size: 12px; font-weight: 600; color: var(--text-dim);
          display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
        }
        .amount-tag .cash-chip{
          font-family: 'Baloo 2', sans-serif;
          font-size: 11px; font-weight: 600; color: var(--gold-soft);
          background: rgba(227,178,60,0.12);
          border: 1px solid rgba(227,178,60,0.3);
          padding: 2px 9px; border-radius: 999px;
        }
        .amount{
          font-family: 'Baloo 2', sans-serif;
          font-size: 42px; font-weight: 700; color: #fff;
          display: flex; align-items: baseline; gap: 4px;
          line-height: 1;
        }
        .amount .rupee{ font-size: 26px; color: var(--gold-soft); font-weight: 600; }
        .amount-sub{
          margin-top: 10px; font-size: 12.5px; color: var(--text-faint);
          display: flex; align-items: center; gap: 6px;
        }
        .amount-sub b{ color: var(--text-dim); font-weight: 600; }

        /* perforated edge */
        .perforation{
          position: relative; height: 16px;
          background: var(--surface);
        }
        .perforation svg{ display: block; width: 100%; height: 16px; }

        /* ---------- Body ---------- */
        .inv-body{ padding: 4px 22px 22px; }
        .section{ margin-top: 22px; }
        .section-label{
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          color: var(--text-faint); text-transform: uppercase;
          margin-bottom: 11px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-label::after{
          content: ""; flex: 1; height: 1px;
          background: linear-gradient(90deg, var(--border), transparent);
        }

        .actions-row{ display: flex; gap: 10px; }
        .btn{
          flex: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px;
          padding: 16px 10px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--surface-2);
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 700; color: var(--text);
          transition: transform .15s ease, border-color .15s ease, background .15s ease;
        }
        .btn:active{ transform: scale(0.97); }
        .btn:hover{ border-color: #33406B; background: #1E2743; }
        .btn .icon-wrap{
          width: 38px; height: 38px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
        }
        .btn.whatsapp{
          background: linear-gradient(160deg, #16532F 0%, #0F3D22 100%);
          border-color: rgba(37,211,102,0.35);
        }
        .btn.whatsapp .icon-wrap{ background: rgba(37,211,102,0.18); }
        .btn.whatsapp svg{ stroke: var(--whatsapp); }
        .btn.pdf .icon-wrap{ background: linear-gradient(135deg, var(--indigo), var(--indigo-2)); }
        .btn.pdf svg{ stroke: #fff; }

        .more-grid{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .tile{
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px 12px;
          display: flex; flex-direction: column; align-items: center; gap: 9px;
          text-align: center;
          cursor: pointer;
          transition: transform .15s ease, border-color .15s ease;
        }
        .tile:active{ transform: scale(0.97); }
        .tile:hover{ border-color: #33406B; }
        .tile .icon-wrap{
          width: 34px; height: 34px; border-radius: 10px;
          background: rgba(227,178,60,0.12);
          border: 1px solid rgba(227,178,60,0.25);
          display: flex; align-items: center; justify-content: center;
        }
        .tile .icon-wrap svg{ stroke: var(--gold-soft); }
        .tile span{ font-size: 12.5px; font-weight: 600; color: var(--text-dim); }

        .delete-row{
          margin-top: 22px;
          display: flex; align-items: center; gap: 12px;
          padding: 15px 16px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(251,109,109,0.25);
          background: rgba(251,109,109,0.06);
          cursor: pointer;
          transition: background .15s ease;
        }
        .delete-row:hover{ background: rgba(251,109,109,0.1); }
        .delete-row .icon-wrap{
          width: 34px; height: 34px; border-radius: 10px;
          background: rgba(251,109,109,0.14);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .delete-row span{ font-size: 13.5px; font-weight: 700; color: var(--rose); }

        /* Record payment */
        .payment-card{
          margin-top: 22px;
          border-radius: var(--radius-lg);
          padding: 18px;
          background: linear-gradient(165deg, #1C2440 0%, #141A30 100%);
          border: 1px solid var(--border);
          position: relative; overflow: hidden;
        }
        .payment-card::before{
          content: "";
          position: absolute; top: -40px; right: -40px;
          width: 140px; height: 140px; border-radius: 50%;
          background: radial-gradient(circle, rgba(227,178,60,0.16), transparent 70%);
        }
        .payment-head{
          display: flex; align-items: center; gap: 9px;
          font-size: 13.5px; font-weight: 700; color: var(--text);
          margin-bottom: 15px; position: relative; z-index: 1;
        }
        .payment-head .icon-wrap{
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(227,178,60,0.15);
          display: flex; align-items: center; justify-content: center;
        }
        .payment-input-row{ display: flex; gap: 10px; position: relative; z-index: 1; }
        .payment-input{
          flex: 1;
          background: var(--bg-soft);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 14px 14px;
          font-size: 14px; font-weight: 600; color: var(--text);
          outline: none;
          font-family: 'Inter', sans-serif;
        }
        .payment-input::placeholder{ color: var(--text-faint); font-weight: 500; }
        .payment-input:focus{ border-color: var(--indigo); }
        .add-btn{
          background: linear-gradient(135deg, var(--indigo), var(--indigo-2));
          border: none; color: #fff; font-weight: 700; font-size: 14px;
          padding: 0 22px; border-radius: var(--radius-sm);
          cursor: pointer;
          box-shadow: 0 8px 20px -8px rgba(108,92,231,0.6);
        }
        .add-btn:active{ transform: scale(0.97); }
        .add-btn:disabled{ opacity: 0.6; cursor: not-allowed; }

        .balance-strip{
          margin-top: 16px; position: relative; z-index: 1;
        }
        .balance-strip-top{
          display: flex; justify-content: space-between; align-items: center;
          font-size: 12px; margin-bottom: 8px;
        }
        .balance-strip-top .label{ color: var(--text-faint); font-weight: 600; }
        .balance-strip-top .value{
          font-family: 'JetBrains Mono', monospace;
          color: var(--rose); font-weight: 700; font-size: 13px;
        }
        .progress{
          height: 6px; border-radius: 999px; background: var(--border-soft);
          overflow: hidden;
        }
        .progress-fill{
          height: 100%; width: 2%;
          background: linear-gradient(90deg, var(--rose), #FF9A6B);
          border-radius: 999px;
        }
        .progress-fill.paid{
          background: linear-gradient(90deg, #10B981, #34D399);
        }

        .close-btn{
          margin-top: 22px;
          width: 100%;
          padding: 17px;
          border-radius: var(--radius-md);
          background: linear-gradient(180deg, #171D33, #0E1224);
          border: 1px solid var(--border);
          color: var(--text);
          font-weight: 700; font-size: 14.5px;
          cursor: pointer;
          letter-spacing: 0.01em;
        }
        .close-btn:hover{ background: #1B2138; }

        .toast{
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
          background: #1B2238; border: 1px solid var(--border);
          color: var(--text); font-size: 13px; font-weight: 600;
          padding: 12px 18px; border-radius: 999px;
          display: flex; align-items: center; gap: 8px;
          opacity: 0; pointer-events: none;
          transition: opacity .25s ease, transform .25s ease;
          z-index: 60;
          box-shadow: 0 15px 40px -15px rgba(0,0,0,0.6);
        }
        .toast.show{ opacity: 1; transform: translateX(-50%) translateY(0); }
        .toast .dot{ width: 7px; height: 7px; border-radius: 50%; background: var(--green); }
      `}} />

      <div className="phone" onClick={(e) => e.stopPropagation()}>
        <div className="inv-card">
          <div className="inv-header">
            <div className="top-row">
              <div className="inv-meta">
                <span className="inv-label">Invoice</span>
                <span className="inv-number">{invoice?.invoice_number ? '#' + invoice.invoice_number : '#INV'}</span>
              </div>
              <div className={"status-pill " + (isPaid ? 'paid' : '')}><span className="dot"></span>{isPaid ? 'Paid in full' : 'Baaki Hai'}</div>
            </div>

            <div className="amount-block">
              <div className="amount-tag">Kul Raashi<span className="cash-chip">{invoice?.type === 'QUOTATION' ? 'Quotation' : 'Cash Sale'}</span></div>
              <div className="amount"><span className="rupee">₹</span>{invoice?.total_amount ? Number(invoice.total_amount).toLocaleString('en-IN', {maximumFractionDigits: 2}) : '0'}</div>
              <div className="amount-sub">{(invoice?.invoice_date || invoice?.created_at) ? new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString('en-IN') + ' ko banaya' : ''} · <b>{invoice?.customer?.name || 'Customer'}</b></div>
            </div>
          </div>

          <div className="perforation">
            <svg viewBox="0 0 402 16" preserveAspectRatio="none">
              <path d="M0,0 Q 8,16 16,0 Q 24,16 32,0 Q 40,16 48,0 Q 56,16 64,0 Q 72,16 80,0 Q 88,16 96,0 Q 104,16 112,0 Q 120,16 128,0 Q 136,16 144,0 Q 152,16 160,0 Q 168,16 176,0 Q 184,16 192,0 Q 200,16 208,0 Q 216,16 224,0 Q 232,16 240,0 Q 248,16 256,0 Q 264,16 272,0 Q 280,16 288,0 Q 296,16 304,0 Q 312,16 320,0 Q 328,16 336,0 Q 344,16 352,0 Q 360,16 368,0 Q 376,16 384,0 Q 392,16 400,0 Q 401,8 402,0 L402,16 L0,16 Z" fill="#0A0E1A" />
            </svg>
          </div>

          <div className="inv-body">
            <div className="section">
              <div className="section-label">Share invoice</div>
              <div className="actions-row">
                <button className="btn whatsapp" onClick={(e) => onWhatsApp ? onWhatsApp(e) : triggerToast('WhatsApp khul raha hai…')}>
                  <div className="icon-wrap">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 3.4z" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0zm5 0a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0zM9.5 13.5c.5 1 1.5 1.5 2.5 1.5s2-.5 2.5-1.5" /></svg>
                  </div>
                  WhatsApp Bhejein
                </button>
                <button className="btn pdf" onClick={() => setIsPdfModalOpen(true)}>
                  <div className="icon-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M12 18v-6" /><path d="M9 15l3 3 3-3" /></svg>
                  </div>
                  PDF (View/Download)
                </button>
              </div>
            </div>

            <div className="section">
              <div className="section-label">More actions</div>
              <div className="more-grid">
                <div className="tile" onClick={() => onEway ? onEway() : triggerToast('E-Way JSON taiyar ho raha hai…')}>
                  <div className="icon-wrap">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                  </div>
                  <span>E-Way JSON</span>
                </div>
                <Link href={invoice?.id ? `/dashboard/invoices/new?duplicateId=${invoice.id}` : '#'} style={{textDecoration: 'none', display: 'contents'}}>
                  <div className="tile">
                    <div className="icon-wrap">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    </div>
                    <span>Duplicate Karein</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="delete-row" onClick={() => onDelete ? onDelete() : triggerToast('Invoice delete karne ki pushti karein')}>
              <div className="icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FB6D6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2-2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
              </div>
              <span>Invoice Delete Karein</span>
            </div>

            <div className="payment-card">
              <div className="payment-head">
                <div className="icon-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F0CB6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                </div>
                Payment Record Karein
              </div>
              <div className="payment-input-row">
                <input 
                  className="payment-input" 
                  type="number" 
                  placeholder="Kitna paisa mila (₹)" 
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount && setPaymentAmount(e.target.value)}
                  disabled={isSubmittingPayment}
                />
                <button 
                  className="add-btn" 
                  onClick={onRecordPayment}
                  disabled={isSubmittingPayment}
                >
                  {isSubmittingPayment ? '...' : 'Add'}
                </button>
              </div>
              <div className="balance-strip">
                <div className="balance-strip-top">
                  <span className="label">Baaki Raashi</span>
                  <span className="value" style={{color: balDue <= 0 ? 'var(--green)' : 'var(--rose)'}}>₹{balDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="progress"><div className={"progress-fill " + (balDue <= 0 ? 'paid' : '')} style={{width: `${paidPct}%`}}></div></div>
              </div>
            </div>

            <button className="close-btn" onClick={() => {
              if (onClose) onClose();
            }}>Band Karein</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className={`modal-overlay ${isPdfModalOpen ? 'show' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setIsPdfModalOpen(false) }}>
        <div className="modal-sheet">
          <div className="modal-handle"></div>
          <div className="modal-title">Invoice PDF</div>
          <div className="modal-sub">Dekhna hai ya seedha download karna hai?</div>

          <div className="modal-option view" onClick={() => { 
            setIsPdfModalOpen(false); 
            if (onViewPdf) onViewPdf(); 
            else triggerToast('PDF khul raha hai…'); 
          }}>
            <div className="icon-wrap">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F0CB6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            </div>
            <div className="modal-option-text">
              <b>PDF Dekhein</b>
              <span>Browser mein seedha khol kar dekhein</span>
            </div>
          </div>

          <div className="modal-option download" onClick={() => { 
            setIsPdfModalOpen(false); 
            if (onDownloadPdf) onDownloadPdf(); 
            else triggerToast('PDF download ho raha hai…'); 
          }}>
            <div className="icon-wrap">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            </div>
            <div className="modal-option-text">
              <b>Download Karein</b>
              <span>Phone mein PDF save karein</span>
            </div>
          </div>

          <button className="modal-cancel" onClick={() => setIsPdfModalOpen(false)}>Cancel</button>
        </div>
      </div>

      <div className={`toast ${showToast ? 'show' : ''}`}><span className="dot"></span><span>{toastMsg}</span></div>
    </div>
  );
}
