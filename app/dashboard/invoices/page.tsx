"use client";

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../../lib/store';
import { generateInvoicePDF } from '../../../lib/pdf-generator';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../../lib/utils';
import { getVisitingCardText } from '../../../lib/whatsapp-utils';
import { useRouter } from 'next/navigation';
import {
    FaFilePdf, FaWhatsapp, FaTrash, FaCopy
} from 'react-icons/fa';

export default function InvoicesPage() {
    const router = useRouter();

    // Global Store
    const invoices = useStore((state: any) => state.invoices) || [];
    const deleteInvoice = useStore((state: any) => state.deleteInvoice);
    const businessProfile = useStore((state: any) => state.businessProfile) || {};
    const fetchInvoices = useStore((state: any) => state.fetchInvoices);

    // Local State
    const [isClient, setIsClient] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    useEffect(() => {
        setIsClient(true);
        if (fetchInvoices) fetchInvoices();
    }, [fetchInvoices]);

    const safeInvoices = Array.isArray(invoices) ? invoices.filter(i => i && typeof i === 'object') : [];
    
    // Filtering & Sorting Logic
    const filteredInvoices = safeInvoices.filter((inv: any) => {
        const customerName = (inv?.customer?.name || '').toLowerCase();
        const invoiceNumber = (inv?.invoice_number || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        const matchesSearch = customerName.includes(term) || invoiceNumber.includes(term);

        if (!matchesSearch) return false;
        if (activeTab === 'u' && (inv.status || 'UNPAID').toUpperCase() !== 'UNPAID') return false;
        if (activeTab === 'p' && (inv.status || '').toUpperCase() !== 'PARTIAL') return false;
        if (activeTab === 'd' && (inv.status || '').toUpperCase() !== 'PAID') return false;

        return true;
    }).sort((a: any, b: any) => {
        if (sortOrder === 'amount-high') return Number(b.total_amount) - Number(a.total_amount);
        if (sortOrder === 'amount-low') return Number(a.total_amount) - Number(b.total_amount);
        if (sortOrder === 'name') return (a.customer?.name || '').localeCompare(b.customer?.name || '');
        // default newest
        const dateA = new Date(a.created_at || a.invoice_date).getTime();
        const dateB = new Date(b.created_at || b.invoice_date).getTime();
        return dateB - dateA;
    });

    // KPI Counters
    const kpiData = {
        total: safeInvoices.length,
        paid: safeInvoices.filter(i => (i.status || '').toUpperCase() === 'PAID').length,
        unpaid: safeInvoices.filter(i => (i.status || 'UNPAID').toUpperCase() === 'UNPAID').length,
        partial: safeInvoices.filter(i => (i.status || '').toUpperCase() === 'PARTIAL').length,
        receivable: safeInvoices.reduce((acc, i) => acc + (Number(i.total_amount) - Number(i.paid_amount || 0)), 0),
        totalBilled: safeInvoices.reduce((acc, i) => acc + Number(i.total_amount), 0)
    };

    const collectionRate = kpiData.totalBilled > 0 ? Math.round(((kpiData.totalBilled - kpiData.receivable) / kpiData.totalBilled) * 100) : 0;
    const uniqueCustomers = new Set(safeInvoices.map(i => i.customer?.phone || i.customer?.name)).size;
    const avgInvoice = kpiData.total > 0 ? Math.round(kpiData.totalBilled / kpiData.total) : 0;

    // Handlers
    const handleDelete = async (invoice: any) => {
        if (window.confirm(`Delete Invoice #${invoice.invoice_number}?`)) {
            try {
                await deleteInvoice(invoice.id);
                toast.success('Invoice deleted');
                setSelectedInvoice(null);
            } catch (err) { toast.error('Delete failed'); }
        }
    };

    const handleDownload = async (invoice: any) => {
        const toastId = toast.loading('Generating PDF...');
        try {
            await generateInvoicePDF(invoice, businessProfile);
            toast.success('PDF Downloaded', { id: toastId });
        } catch (error) { toast.error('PDF Error', { id: toastId }); }
    };

    const handleWhatsApp = async (invoice: any, e: any) => {
        if(e) e.stopPropagation();
        const phone = (invoice.customer?.phone || '').replace(/\D/g, '');
        if (!phone) {
            toast.error('Pahle customer ka mobile number add karein.', { icon: '📱' });
            return;
        }

        const toastId = toast.loading('WhatsApp ke liye PDF ban raha hai...');
        try {
            const doc = await generateInvoicePDF(invoice, businessProfile, false);
            if (!doc) {
                toast.error('PDF Generate fail!', { id: toastId });
                return;
            }

            const pdfBlob = doc.output('blob');
            const fileName = `Invoice_${invoice.invoice_number || '001'}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
            
            let text = `Hi ${invoice.customer?.name || 'Customer'},\n\nYour invoice *#${invoice.invoice_number}* for *₹${invoice.total_amount}* is ready.\n\nRegards,\n${businessProfile.name}`;
            text += getVisitingCardText(businessProfile);
            
            if (navigator.canShare && navigator.canShare({ files: [file] }) && /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                try {
                    await navigator.share({
                        files: [file],
                        title: fileName,
                        text: text
                    });
                    toast.success('WhatsApp par share open ho gaya!', { id: toastId });
                    return;
                } catch (e) {
                    console.log('Share cancelled', e);
                }
            }

            const formData = new FormData();
            formData.append('phone', phone);
            formData.append('message', text);
            formData.append('file', file);

            const res = await fetch('/api/whatsapp/send-media', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                toast.success('WhatsApp Bot ne PDF bhej diya! ✅', { id: toastId });
            } else {
                toast.dismiss(toastId);
                window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, '_blank');
            }
        } catch (error) {
            toast.error('WhatsApp Share Error', { id: toastId });
        }
    };

    const handleBulkReminder = () => {
        toast.success('Bulk reminder feature comming soon!');
    };

    if (!isClient) return <div style={{ background: '#f5f6fa', minHeight: '100vh' }} />;

    return (
        <div className="new-invoice-page">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                
                .new-invoice-page {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    background: #f5f6fa;
                    color: #111827;
                    min-height: 100vh;
                    font-size: 14px;
                    padding-bottom: 80px;
                }

                .topbar {
                    background: #4338ca;
                    padding: 0 24px;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .topbar-left { display: flex; align-items: center; gap: 12px; }
                .topbar-logo { width: 34px; height: 34px; border-radius: 9px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 16px; }
                .topbar-name { color: #fff; font-size: 15px; font-weight: 600; }
                .topbar-tag { color: rgba(255,255,255,0.65); font-size: 11px; background: rgba(255,255,255,0.12); padding: 2px 8px; border-radius: 20px; }
                .topbar-right { display: flex; align-items: center; gap: 8px; }
                .tb-btn { background: rgba(255,255,255,0.13); border: none; border-radius: 8px; color: #fff; padding: 7px 13px; font-size: 13px; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.15s; }
                .tb-btn:hover { background: rgba(255,255,255,0.22); }
                .tb-btn.primary { background: #fff; color: #4338ca; font-weight: 600; }
                .tb-btn.primary:hover { background: #eef2ff; }
                
                .content { padding: 24px; max-width: 1100px; margin: 0 auto; }

                .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
                .page-title { font-size: 20px; font-weight: 600; }
                .page-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
                .reminder-btn { background: #25d366; border: none; border-radius: 8px; color: #fff; padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: background 0.15s; }
                .reminder-btn:hover { background: #1ebe5d; }

                .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
                .stat-card { background: #ffffff; border-radius: 12px; border: 1px solid rgba(0,0,0,0.08); padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
                .stat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
                .stat-icon.blue { background: #eef2ff; color: #4338ca; }
                .stat-icon.green { background: #f0fdf4; color: #16a34a; }
                .stat-icon.red { background: #fef2f2; color: #dc2626; }
                .stat-icon.amber { background: #fffbeb; color: #d97706; }
                .stat-label { font-size: 11px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
                .stat-val { font-size: 28px; font-weight: 600; line-height: 1; }
                .stat-val.blue { color: #4338ca; }
                .stat-val.green { color: #16a34a; }
                .stat-val.red { color: #dc2626; }
                .stat-val.amber { color: #d97706; }
                .stat-footer { font-size: 11px; color: #9ca3af; margin-top: 5px; }

                .recv-banner { background: #4338ca; border-radius: 12px; padding: 18px 22px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
                .recv-label { color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .recv-val { color: #fff; font-size: 32px; font-weight: 700; line-height: 1; }
                .recv-sub { color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 5px; }
                .recv-pills { display: flex; gap: 10px; flex-wrap: wrap; }
                .recv-pill { background: rgba(255,255,255,0.13); border-radius: 8px; padding: 8px 16px; text-align: center; }
                .recv-pill-val { color: #fff; font-size: 18px; font-weight: 600; line-height: 1; }
                .recv-pill-label { color: rgba(255,255,255,0.65); font-size: 11px; margin-top: 3px; }

                .toolbar { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); flex-wrap: wrap; }
                .search-wrap { flex: 1; min-width: 200px; position: relative; }
                .search-wrap input { width: 100%; padding: 8px 10px 8px 16px; border: 1px solid rgba(0,0,0,0.13); border-radius: 8px; font-size: 13px; font-family: inherit; background: #f8f9fc; color: #111827; outline: none; }
                .search-wrap input:focus { border-color: #4338ca; background: #fff; }
                .filter-tabs { display: flex; gap: 4px; }
                .tab { padding: 7px 13px; border-radius: 8px; font-size: 13px; cursor: pointer; border: 1px solid rgba(0,0,0,0.13); background: #f8f9fc; color: #6b7280; font-weight: 500; transition: all 0.12s; }
                .tab:hover:not(.active) { background: #f5f6fa; color: #111827; }
                .tab.active { background: #4338ca; color: #fff; border-color: #4338ca; }
                .sort-select { padding: 7px 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.13); background: #f8f9fc; font-size: 13px; color: #6b7280; outline: none; cursor: pointer; }

                .invoice-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
                .table-header { display: grid; grid-template-columns: 2.2fr 0.8fr 1fr 0.9fr 90px; gap: 8px; padding: 10px 16px; background: #f8f9fc; border-bottom: 1px solid rgba(0,0,0,0.08); font-size: 11px; font-weight: 600; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; }
                .invoice-row { display: grid; grid-template-columns: 2.2fr 0.8fr 1fr 0.9fr 90px; gap: 8px; padding: 13px 16px; border-bottom: 1px solid rgba(0,0,0,0.08); align-items: center; cursor: pointer; transition: background 0.1s; }
                .invoice-row:last-child { border-bottom: none; }
                .invoice-row:hover { background: #fafbff; }

                .cust-wrap { display: flex; align-items: center; gap: 10px; }
                .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
                .av-1 { background: #ede9fe; color: #5b21b6; }
                .av-2 { background: #dbeafe; color: #1d4ed8; }
                .av-3 { background: #dcfce7; color: #15803d; }
                .av-4 { background: #fef3c7; color: #b45309; }
                .av-5 { background: #fce7f3; color: #9d174d; }
                .cust-name { font-size: 14px; font-weight: 600; color: #111827; }
                .cust-phone { font-size: 12px; color: #6b7280; }

                .inv-count { font-size: 13px; color: #6b7280; font-weight: 500; }
                .amount-val { font-size: 14px; font-weight: 600; color: #111827; }
                .amount-due { font-size: 11px; color: #9ca3af; margin-top: 2px; }

                .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
                .badge-unpaid { background: #fef2f2; color: #dc2626; }
                .badge-paid { background: #f0fdf4; color: #16a34a; }
                .badge-partial { background: #fffbeb; color: #d97706; }

                .row-actions { display: flex; gap: 6px; }
                .act-btn { width: 30px; height: 30px; border-radius: 7px; border: 1px solid rgba(0,0,0,0.13); background: #f8f9fc; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.12s; }
                .act-btn:hover { background: #eef2ff; color: #4338ca; border-color: #4338ca; }
                .act-btn svg { width: 14px; height: 14px; }
                .act-btn.wa:hover { background: #f0fdf4; color: #16a34a; border-color: #16a34a; }

                .table-footer { padding: 12px 16px; background: #f8f9fc; border-top: 1px solid rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #6b7280; flex-wrap: wrap; gap: 8px; }
                .export-btn { background: none; border: 1px solid rgba(0,0,0,0.13); border-radius: 8px; padding: 5px 12px; font-size: 12px; color: #4338ca; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.12s; }
                .export-btn:hover { background: #eef2ff; }

                .modal-ov { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: flex-end; }
                .modal-sheet { background: #ffffff; width: 100%; border-radius: 24px 24px 0 0; padding: 2rem 1.25rem; transform: translateY(0); animation: slideUp 0.3s ease; }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                .btn-action { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px; border-radius: 12px; background: #f8f9fc; border: 1px solid rgba(0,0,0,0.08); color: #111827; cursor: pointer; font-size: 11px; font-weight: 600; }
                .btn-action:hover { background: rgba(0,0,0,0.04); }

                @media (max-width: 700px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .table-header, .invoice-row { grid-template-columns: 2fr 1fr 80px; }
                    .table-header span:nth-child(2), .invoice-row > div:nth-child(2),
                    .table-header span:nth-child(5), .invoice-row > div:nth-child(5) { display: none; }
                    .recv-pills { display: none; }
                    .content { padding: 16px; }
                }
            ` }} />

            {/* TOPBAR */}
            <div className="topbar">
                <div className="topbar-left">
                    <div className="topbar-logo">🧾</div>
                    <span className="topbar-name">{businessProfile?.name || 'BillGST'}</span>
                    <span className="topbar-tag">Professional Billing</span>
                </div>
                <div className="topbar-right">
                    <button className="tb-btn" onClick={() => router.push('/dashboard/settings')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                        Settings
                    </button>
                    <button className="tb-btn primary" onClick={() => router.push('/dashboard/invoices/new')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        New Invoice
                    </button>
                </div>
            </div>

            <div className="content">
                {/* PAGE HEADER */}
                <div className="page-header">
                    <div>
                        <div className="page-title">Manage Invoices</div>
                        <div className="page-sub">Track payments &middot; Reminders &middot; Analytics</div>
                    </div>
                    <button className="reminder-btn" onClick={handleBulkReminder}>
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        Bulk Reminder
                    </button>
                </div>

                {/* STATS */}
                <div className="stats-grid">
                    <div className="stat-card" onClick={() => setActiveTab('all')} style={{cursor: 'pointer'}}>
                        <div className="stat-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
                        <div className="stat-label">Total Invoices</div>
                        <div className="stat-val blue">{kpiData.total}</div>
                        <div className="stat-footer">Is mahine</div>
                    </div>
                    <div className="stat-card" onClick={() => setActiveTab('d')} style={{cursor: 'pointer'}}>
                        <div className="stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div>
                        <div className="stat-label">Paid Full</div>
                        <div className="stat-val green">{kpiData.paid}</div>
                        <div className="stat-footer">₹{formatCurrency(kpiData.totalBilled - kpiData.receivable)} collect hua</div>
                    </div>
                    <div className="stat-card" onClick={() => setActiveTab('u')} style={{cursor: 'pointer'}}>
                        <div className="stat-icon red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                        <div className="stat-label">Unpaid</div>
                        <div className="stat-val red">{kpiData.unpaid}</div>
                        <div className="stat-footer">Follow up karo</div>
                    </div>
                    <div className="stat-card" onClick={() => setActiveTab('p')} style={{cursor: 'pointer'}}>
                        <div className="stat-icon amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                        <div className="stat-label">Partial</div>
                        <div className="stat-val amber">{kpiData.partial}</div>
                        <div className="stat-footer">Balance baaki</div>
                    </div>
                </div>

                {/* RECEIVABLE BANNER */}
                <div className="recv-banner">
                    <div>
                        <div className="recv-label">💰 Total Receivable</div>
                        <div className="recv-val">₹{formatCurrency(kpiData.receivable)}</div>
                        <div className="recv-sub">{kpiData.unpaid + kpiData.partial} invoices pending &middot; Abhi update hua</div>
                    </div>
                    <div className="recv-pills">
                        <div className="recv-pill">
                            <div className="recv-pill-val">{collectionRate}%</div>
                            <div className="recv-pill-label">Collection Rate</div>
                        </div>
                        <div className="recv-pill">
                            <div className="recv-pill-val">{uniqueCustomers}</div>
                            <div className="recv-pill-label">Customers</div>
                        </div>
                        <div className="recv-pill">
                            <div className="recv-pill-val">₹{formatCurrency(avgInvoice)}</div>
                            <div className="recv-pill-label">Avg Invoice</div>
                        </div>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="toolbar">
                    <div className="search-wrap">
                        <input 
                            type="text" 
                            placeholder="Customer ya invoice search karein..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-tabs">
                        <div className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Sab ({kpiData.total})</div>
                        <div className={`tab ${activeTab === 'u' ? 'active' : ''}`} onClick={() => setActiveTab('u')}>Unpaid ({kpiData.unpaid})</div>
                        <div className={`tab ${activeTab === 'p' ? 'active' : ''}`} onClick={() => setActiveTab('p')}>Partial ({kpiData.partial})</div>
                        <div className={`tab ${activeTab === 'd' ? 'active' : ''}`} onClick={() => setActiveTab('d')}>Paid ({kpiData.paid})</div>
                    </div>
                    <select className="sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="amount-high">Amount: High to Low</option>
                        <option value="amount-low">Amount: Low to High</option>
                        <option value="name">Name A–Z</option>
                    </select>
                </div>

                {/* INVOICE TABLE */}
                <div className="invoice-card">
                    <div className="table-header">
                        <span>Customer</span>
                        <span>Bill No</span>
                        <span>Amount</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>

                    {filteredInvoices.map((inv: any, idx: number) => {
                        const status = (inv.status || 'UNPAID').toLowerCase();
                        let badgeClass = 'badge-unpaid';
                        let statusText = 'Unpaid';
                        if (status === 'paid') { badgeClass = 'badge-paid'; statusText = 'Paid'; }
                        if (status === 'partial') { badgeClass = 'badge-partial'; statusText = 'Partial'; }
                        
                        const dueText = status === 'paid' ? 'Clear' : (status === 'partial' ? 'Balance baaki' : 'Due: Aaj');
                        const avatarClass = `av-${(idx % 5) + 1}`;
                        const firstChar = inv.customer?.name ? inv.customer.name.charAt(0).toUpperCase() : '#';

                        return (
                            <div className="invoice-row" key={inv.id} onClick={() => setSelectedInvoice(inv)}>
                                <div className="cust-wrap">
                                    <div className={`avatar ${avatarClass}`}>{firstChar}</div>
                                    <div>
                                        <div className="cust-name">{inv.customer?.name || 'Local Sale'}</div>
                                        <div className="cust-phone" style={{ color: !inv.customer?.phone ? '#9ca3af' : '' }}>
                                            {inv.customer?.phone ? `📞 ${inv.customer.phone}` : 'No phone'}
                                        </div>
                                    </div>
                                </div>
                                <div className="inv-count">#{inv.invoice_number}</div>
                                <div>
                                    <div className="amount-val">₹{formatCurrency(inv.total_amount)}</div>
                                    <div className="amount-due" style={{ color: status === 'unpaid' ? '#dc2626' : '', fontWeight: status === 'unpaid' ? 600 : 'normal' }}>
                                        {dueText}
                                    </div>
                                </div>
                                <div><span className={`badge ${badgeClass}`}>{statusText}</span></div>
                                <div className="row-actions" onClick={e => e.stopPropagation()}>
                                    <button className="act-btn wa" title="WhatsApp reminder" onClick={(e) => handleWhatsApp(inv, e)}>
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                    </button>
                                    <button className="act-btn" title="View invoice" onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {filteredInvoices.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                            Koi invoice nahi mila.
                        </div>
                    )}

                    <div className="table-footer">
                        <span>{filteredInvoices.length} invoices &middot; ₹{formatCurrency(kpiData.receivable)} total pending</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="export-btn" onClick={() => toast.success('Excel export jald aa raha hai!')}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
                                Excel Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {selectedInvoice && (
                <div className="modal-ov" onClick={() => setSelectedInvoice(null)}>
                    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                        <div style={{ width: '40px', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', margin: '0 auto 1.5rem' }} />
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Invoice #{selectedInvoice.invoice_number}</div>
                            <div style={{ fontSize: '24px', fontWeight: 800 }}>₹{formatCurrency(selectedInvoice.total_amount)}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>{selectedInvoice.customer?.name}</div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-action" onClick={(e) => handleWhatsApp(selectedInvoice, e)}>
                                <FaWhatsapp size={20} color="#16a34a" />
                                WhatsApp
                            </button>
                            <button className="btn-action" onClick={() => handleDownload(selectedInvoice)}>
                                <FaFilePdf size={20} color="#dc2626" />
                                Download PDF
                            </button>
                            <button className="btn-action" onClick={() => router.push(`/dashboard/invoices/new?duplicateId=${selectedInvoice.id}`)}>
                                <FaCopy size={20} color="#4338ca" />
                                Duplicate
                            </button>
                            <button className="btn-action" onClick={() => handleDelete(selectedInvoice)}>
                                <FaTrash size={20} color="#6b7280" />
                                Delete
                            </button>
                        </div>
                        
                        <button 
                            style={{ width: '100%', marginTop: '1.5rem', height: '50px', background: '#4338ca', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                            onClick={() => setSelectedInvoice(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
