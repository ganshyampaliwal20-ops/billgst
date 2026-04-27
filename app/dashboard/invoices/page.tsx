"use client";

import { useState, useEffect } from 'react';
import { useStore } from '../../../lib/store';
import {
    FaFilePdf, FaWhatsapp, FaTrash, FaPlus, FaSearch,
    FaFileInvoiceDollar, FaRupeeSign, FaEllipsisV,
    FaCopy, FaShareAlt, FaCalendarAlt, FaChevronRight
} from 'react-icons/fa';
import { generateInvoicePDF } from '../../../lib/pdf-generator';
import { toast } from 'react-hot-toast';
import { DOC_LABELS } from '../../../lib/constants';
import { formatCurrency, formatCompactNumber } from '../../../lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';

export default function InvoicesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Global Store
    const invoices = useStore((state: any) => state.invoices) || [];
    const deleteInvoice = useStore((state: any) => state.deleteInvoice);
    const businessProfile = useStore((state: any) => state.businessProfile) || {};
    const fetchInvoices = useStore((state: any) => state.fetchInvoices);

    // Local State
    const [isClient, setIsClient] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const [activeTab, setActiveTab] = useState("all");
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [showShareSheet, setShowShareSheet] = useState<any>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (fetchInvoices) fetchInvoices();
    }, [fetchInvoices]);

    // Generate QR Code safely
    useEffect(() => {
        if (selectedInvoice && businessProfile?.upi_id && selectedInvoice.total_amount > 0) {
            const upiLink = `upi://pay?pa=${businessProfile.upi_id}&pn=${encodeURIComponent(businessProfile.name)}&am=${selectedInvoice.total_amount}&cu=INR`;
            QRCode.toDataURL(upiLink, { margin: 1 })
                .then(setQrCodeUrl)
                .catch(err => console.error('QR Error:', err));
        } else {
            setQrCodeUrl('');
        }
    }, [selectedInvoice, businessProfile]);

    if (!isClient) return <div style={{ background: '#f8fafc', minHeight: '100vh' }} />;

    const safeInvoices = Array.isArray(invoices) ? invoices.filter(i => i && typeof i === 'object') : [];

    // Safe Formatting Functions
    const safeDate = (dateStr: any) => {
        try {
            if (!dateStr) return 'N/A';
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN');
        } catch (e) { return 'N/A'; }
    };

    const safeAmt = (amt: any) => {
        const val = Number(amt);
        return isNaN(val) ? 0 : val;
    };

    // Filtering Logic
    const filteredInvoices = safeInvoices.filter((inv: any) => {
        const customerName = (inv?.customer?.name || '').toLowerCase();
        const invoiceNumber = (inv?.invoice_number || '').toLowerCase();
        const term = searchTerm.toLowerCase();

        const itemsMatch = (inv?.items || []).some((item: any) =>
            String(item.product_name || '').toLowerCase().includes(term)
        );

        const matchesSearch = customerName.includes(term) || invoiceNumber.includes(term) || itemsMatch;

        if (!matchesSearch) return false;

        const type = (inv.type || '').toLowerCase();
        if (activeTab === 'tax' && (type && type !== 'tax_invoice')) return false;
        if (activeTab === 'tax' && !type) return true; // Default is tax
        if (activeTab === 'delivery' && type !== 'delivery_challan') return false;
        if (activeTab === 'eway' && type !== 'eway_bill') return false;

        if (['paid', 'unpaid', 'partial'].includes(activeTab)) {
            const status = (inv.status || 'UNPAID').toLowerCase();
            if (status !== activeTab) return false;
        }

        return true;
    });

    // KPI Counters
    const kpiData = {
        total: safeInvoices.length,
        paid: safeInvoices.filter(i => (i.status || '').toUpperCase() === 'PAID').length,
        unpaid: safeInvoices.filter(i => (i.status || 'UNPAID').toUpperCase() === 'UNPAID').length,
        partial: safeInvoices.filter(i => (i.status || '').toUpperCase() === 'PARTIAL').length,
        totalValue: safeInvoices.reduce((acc, i) => acc + safeAmt(i.total_amount), 0)
    };

    // Handlers
    const handleDelete = async (e: any, invoice: any) => {
        e?.stopPropagation();
        if (!invoice?.id) return;
        if (window.confirm(`Delete Invoice #${invoice.invoice_number}? Stock will be restored.`)) {
            try {
                const res = await deleteInvoice(invoice.id);
                if (res?.success !== false) {
                    toast.success('Invoice deleted');
                    setShowShareSheet(null);
                    setSelectedInvoice(null);
                }
            } catch (err) { toast.error('Delete failed'); }
        }
    };

    const handleDownload = async (e: any, invoice: any) => {
        e?.stopPropagation();
        if (!invoice) return;
        const toastId = toast.loading('Generating PDF...');
        try {
            await generateInvoicePDF(invoice, businessProfile);
            toast.success('PDF Downloaded', { id: toastId });
        } catch (error) { toast.error('PDF Error', { id: toastId }); }
    };

    const handleWhatsApp = async (e: any, invoice: any) => {
        e?.stopPropagation();
        if (!invoice) return;
        const total = safeAmt(invoice.total_amount);
        const text = `Hi ${invoice.customer?.name || 'Customer'},\n\nYour invoice *#${invoice.invoice_number}* for *₹${total}* from *${businessProfile.name || 'Business'}* is ready.\n\nRegards,\n${businessProfile.name || 'Business'}`;
        const phone = (invoice.customer?.phone || '').replace(/\D/g, '');
        
        const toastId = toast.loading('⏳ Preparing PDF for WhatsApp...');
        try {
            const doc = await generateInvoicePDF(invoice, businessProfile, false);
            if (doc && phone) {
                const pdfBlob = doc.output('blob');
                const file = new File([pdfBlob], `Invoice-${invoice.invoice_number}.pdf`, { type: 'application/pdf' });
                
                const formData = new FormData();
                formData.append('phone', phone);
                formData.append('message', text);
                formData.append('file', file);
                
                toast.loading('⏳ Sending via WhatsApp Bot...', { id: toastId });
                const sendRes = await fetch('/api/whatsapp/send-media', {
                    method: 'POST',
                    body: formData
                });
                
                if (sendRes.ok) {
                    toast.success('✅ PDF sent on WhatsApp!', { id: toastId });
                    return;
                }
            }
        } catch (err) {
            console.error(err);
        }
        
        // Fallback
        toast.dismiss(toastId);
        const url = phone ? `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleDuplicate = (e: any, invoice: any) => {
        e?.stopPropagation();
        if (invoice?.id) router.push(`/dashboard/invoices/new?duplicateId=${invoice.id}`);
    };

    const handleSMS = (invoice: any) => {
        const text = `Invoice #${invoice.invoice_number} for Rs. ${safeAmt(invoice.total_amount)} from ${businessProfile.name}. BillGST.in`;
        window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
    };

    const handlePaymentLink = async (invoice: any) => {
        if (!businessProfile.upi_id) return toast.error('Set UPI ID in settings');
        const upi = `upi://pay?pa=${businessProfile.upi_id}&pn=${encodeURIComponent(businessProfile.name)}&am=${safeAmt(invoice.total_amount)}&cu=INR`;
        const text = `Payment link for invoice #${invoice.invoice_number}:\n${upi}\n\nScan the attached QR code to pay via any UPI app.`;
        const phone = (invoice.customer?.phone || '').replace(/\D/g, '');
        
        if (qrCodeUrl && phone) {
            const toastId = toast.loading('⏳ Sending QR Code via WhatsApp...');
            try {
                const res = await fetch(qrCodeUrl);
                const blob = await res.blob();
                const file = new File([blob], 'QR-Code.png', { type: 'image/png' });
                
                const formData = new FormData();
                formData.append('phone', phone);
                formData.append('message', text);
                formData.append('file', file);
                
                const sendRes = await fetch('/api/whatsapp/send-media', {
                    method: 'POST',
                    body: formData
                });
                
                if (sendRes.ok) {
                    toast.success('✅ QR Code sent on WhatsApp!', { id: toastId });
                    return;
                }
            } catch (err) {
                console.error(err);
            }
            toast.dismiss(toastId);
        }

        // Fallback
        const waText = `Payment link for invoice #${invoice.invoice_number}: ${upi}`;
        window.open(`https://wa.me/${phone ? (phone.startsWith('91') ? phone : '91'+phone) : ''}?text=${encodeURIComponent(waText)}`, '_blank');
    };

    const handleExportCSV = () => {
        try {
            if (filteredInvoices.length === 0) return toast.error('Koi data nahi hai export karne ke liye');
            const data = filteredInvoices.map((inv: any) => ({
                'Invoice #': inv.invoice_number,
                'Date': safeDate(inv.invoice_date),
                'Customer': inv.customer?.name || 'Local Sale',
                'Amount': safeAmt(inv.total_amount),
                'Status': inv.status || 'UNPAID',
                'Type': inv.type || 'Tax Invoice'
            }));
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Invoices");
            XLSX.writeFile(wb, "Invoices_Report.xlsx");
            toast.success('Excel report download ho gayi!');
        } catch (e) {
            toast.error('Export fail ho gaya');
        }
    };

    const createInvoice = () => router.push('/dashboard/invoices/new');

    const getAvatarColor = (name: string) => {
        const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#f97316'];
        if (!name) return colors[0];
        let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
        return colors[h];
    };

    return (
        <div className="modern-billing-page">
            <style dangerouslySetInnerHTML={{
                __html: `
                .modern-billing-page {
                    --primary: #4f46e5; --success: #10b981; --warning: #f59e0b; --danger: #ef4444;
                    --slate-900: #0f172a; --slate-600: #475569; --slate-400: #94a3b8;
                    --bg: #f8fafc; --white: #ffffff; --border: #e2e8f0;
                    font-family: 'Sora', sans-serif; background: var(--bg); min-height: 100vh;
                }
                .hero-strip { background: var(--slate-900); padding: 20px 32px 50px; color: white; }
                .hero-flex { display: flex; justify-content: space-between; align-items: center; }
                .hero-title h1 { font-size: 22px; font-weight: 800; margin: 0; }
                .hero-title p { color: var(--slate-400); margin: 2px 0 0; font-size: 11px; }
                
                .kpi-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: -25px 20px 5px; padding: 0 12px; }
                .kpi-box { background: white; border-radius: 16px; padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--border); }
                .kpi-lbl { font-size: 10px; font-weight: 800; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.5px; }
                .kpi-val { font-size: 18px; font-weight: 800; color: var(--slate-900); font-family: 'JetBrains Mono', monospace; margin: 2px 0; }
                
                .content-box { padding: 10px 32px 100px; }
                .action-bar { display: flex; gap: 12px; margin-bottom: 24px; }
                .search-box { flex: 1; position: relative; }
                .search-box input { width: 100%; height: 44px; background: white; border: 1.5px solid var(--border); border-radius: 12px; padding: 0 16px 0 42px; font-size: 13px; outline: none; transition: 0.2s; }
                .search-box input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
                .search-icon { position: absolute; left: 16px; top: 15px; color: var(--slate-400); font-size: 14px; }

                .tab-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 20px; }
                .tab-row::-webkit-scrollbar { display: none; }
                .tab-btn { padding: 10px 20px; border-radius: 12px; background: white; border: 1px solid var(--border); font-size: 13px; font-weight: 700; color: var(--slate-600); cursor: pointer; white-space: nowrap; transition: 0.2s; }
                .tab-btn.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 12px rgba(79,70,229,0.3); }

                .table-container { background: white; border-radius: 24px; border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(0,0,0,0.03); overflow: hidden; }
                .billing-table { width: 100%; border-collapse: collapse; }
                .billing-table th { background: #f1f5f9; text-align: left; padding: 16px 24px; font-size: 11px; font-weight: 800; color: var(--slate-600); text-transform: uppercase; }
                .billing-table tr { border-bottom: 1px solid #f8fafc; cursor: pointer; }
                .billing-table tr:hover { background: #f8fafc; }
                .billing-table td { padding: 16px 24px; font-size: 14px; color: var(--slate-900); }
                
                .status-chip { padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
                .status-paid { background: #dcfce7; color: #166534; }
                .status-unpaid { background: #fee2e2; color: #991b1b; }
                .status-partial { background: #fef3c7; color: #92400e; }

                .icon-btn { width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border); background: white; margin-left: 6px; cursor: pointer; transition: 0.2s; color: var(--slate-600); }
                .icon-btn:hover { background: var(--primary); color: white; border-color: var(--primary); transform: scale(1.1); }
                .icon-btn.del:hover { background: var(--danger); border-color: var(--danger); }

                /* Overlays */
                .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .modal-card { background: white; border-radius: 28px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; animation: slideUp 0.3s ease; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                .qr-wrap { background: #f8fafc; border-radius: 20px; padding: 24px; text-align: center; margin: 20px 0; border: 2px dashed var(--border); }
                .qr-img-box { width: 140px; height: 140px; margin: 0 auto 12px; background: white; padding: 10px; border-radius: 12px; }

                .floating-add { position: fixed; bottom: 30px; right: 30px; background: var(--primary); color: white; padding: 16px 32px; border-radius: 50px; font-weight: 800; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 25px rgba(79,70,229,0.4); border: none; cursor: pointer; transition: 0.3s; z-index: 900; }
                .floating-add:hover { transform: scale(1.05) translateY(-5px); box-shadow: 0 15px 35px rgba(79,70,229,0.5); }

                @media (max-width: 900px) {
                    .kpi-row { grid-template-columns: repeat(2, 1fr); }
                    .billing-table { display: block; overflow-x: auto; }
                    .hero-strip, .kpi-row, .content-box { padding: 20px; }
                }
            `}} />

            <div className="hero-strip">
                <div className="hero-flex">
                    <div className="hero-title">
                        <h1>Manage Invoices 🧾</h1>
                        <p>Track payments, send reminders, and analyze sales</p>
                    </div>
                </div>
            </div>

            <div className="kpi-row">
                <div className="kpi-box" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('all')}>
                    <div className="kpi-lbl">Total Invoices</div>
                    <div className="kpi-val">{kpiData.total}</div>
                </div>
                <div className="kpi-box" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('paid')}>
                    <div className="kpi-lbl">Paid Full</div>
                    <div className="kpi-val" style={{ color: 'var(--success)' }}>{kpiData.paid}</div>
                </div>
                <div className="kpi-box" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('unpaid')}>
                    <div className="kpi-lbl">Unpaid Count</div>
                    <div className="kpi-val" style={{ color: 'var(--danger)' }}>{kpiData.unpaid}</div>
                </div>
                <div className="kpi-box" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('partial')}>
                    <div className="kpi-lbl">Partially Received</div>
                    <div className="kpi-val" style={{ color: 'var(--warning)' }}>{kpiData.partial}</div>
                </div>
                <div className="kpi-box" style={{ gridColumn: 'span 2' }}>
                    <div className="kpi-lbl">Total Receivable</div>
                    <div className="kpi-val" style={{ fontSize: '24px', display: 'flex', justifyContent: 'center' }}>
                        {formatCompactNumber(kpiData.totalValue)}
                    </div>
                </div>
            </div>

            <div className="content-box">
                <div className="action-bar">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search customer, invoice # or products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="tab-btn" style={{ height: '44px' }} onClick={handleExportCSV}>Export Data</button>
                </div>

                <div className="tab-row">
                    <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Transactions</button>
                    <button className={`tab-btn ${activeTab === 'unpaid' ? 'active' : ''}`} onClick={() => setActiveTab('unpaid')}>🔴 Unpaid</button>
                    <button className={`tab-btn ${activeTab === 'partial' ? 'active' : ''}`} onClick={() => setActiveTab('partial')}>🟡 Partial</button>
                    <button className={`tab-btn ${activeTab === 'paid' ? 'active' : ''}`} onClick={() => setActiveTab('paid')}>🟢 Paid</button>
                    <button className={`tab-btn ${activeTab === 'tax' ? 'active' : ''}`} onClick={() => setActiveTab('tax')}>Tax Invoices</button>
                    <button className={`tab-btn ${activeTab === 'delivery' ? 'active' : ''}`} onClick={() => setActiveTab('delivery')}>Delivery Challan</button>
                </div>

                <div className="table-container">
                    {filteredInvoices.length === 0 ? (
                        <div style={{ padding: '50px', textAlign: 'center', color: 'var(--slate-400)' }}>
                            <FaFileInvoiceDollar style={{ fontSize: '50px', marginBottom: '10px' }} />
                            <p>No invoices found matching your criteria</p>
                        </div>
                    ) : (
                        <table className="billing-table">
                            <thead>
                                <tr>
                                    <th># Invoice</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Final Amount</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((inv: any) => (
                                    <tr key={inv.id} onClick={() => setSelectedInvoice(inv)}>
                                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#{inv.invoice_number}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{safeDate(inv.invoice_date || inv.created_at)}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--slate-400)' }}>
                                                {DOC_LABELS[inv.type as keyof typeof DOC_LABELS] || 'Tax Invoice'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div
                                                    style={{ width: '32px', height: '32px', borderRadius: '8px', background: getAvatarColor(inv.customer?.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}
                                                >
                                                    {inv.customer?.name?.charAt(0) || 'C'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700 }}>{inv.customer?.name || 'Local Sale'}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--slate-400)' }}>{inv.customer?.phone || 'No phone'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 800, fontFamily: 'JetBrains Mono' }}>{formatCurrency(safeAmt(inv.total_amount))}</td>
                                        <td>
                                            <span className={`status-chip ${(inv.status || 'UNPAID').toUpperCase() === 'PAID' ? 'status-paid' :
                                                (inv.status || 'UNPAID').toUpperCase() === 'PARTIAL' ? 'status-partial' : 'status-unpaid'
                                                }`}>
                                                {inv.status || 'UNPAID'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                            <div className="icon-btn" onClick={(e) => handleWhatsApp(e, inv)}><FaWhatsapp /></div>
                                            <div className="icon-btn" onClick={(e) => handleDownload(e, inv)}><FaFilePdf /></div>
                                            <div className="icon-btn del" onClick={(e) => handleDelete(e, inv)}><FaTrash /></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedInvoice && (
                <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontWeight: 800 }}>Invoice Details</h3>
                            <button onClick={() => setSelectedInvoice(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>#{selectedInvoice.invoice_number}</div>
                                <div style={{ fontWeight: 900, fontSize: '24px' }}>{formatCurrency(safeAmt(selectedInvoice.total_amount))}</div>
                            </div>

                            {qrCodeUrl && (selectedInvoice.status || 'UNPAID').toUpperCase() !== 'PAID' && (
                                <div className="qr-wrap">
                                    <div className="qr-img-box">
                                        <img src={qrCodeUrl} alt="QR" style={{ width: '100%', height: '100%' }} />
                                    </div>
                                    <p style={{ fontSize: '12px', fontWeight: 700, margin: '8px 0 0' }}>Scan to Pay UPI</p>
                                    <p style={{ fontSize: '10px', color: 'var(--slate-400)' }}>{businessProfile.upi_id}</p>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                                <button className="icon-btn" style={{ width: '100%', height: '60px', flexDirection: 'column', gap: '5px' }} onClick={(e) => handleWhatsApp(e, selectedInvoice)}>
                                    <FaWhatsapp size={20} /> <span style={{ fontSize: '9px', fontWeight: 800 }}>WA</span>
                                </button>
                                <button className="icon-btn" style={{ width: '100%', height: '60px', flexDirection: 'column', gap: '5px' }} onClick={(e) => handleDownload(e, selectedInvoice)}>
                                    <FaFilePdf size={20} /> <span style={{ fontSize: '9px', fontWeight: 800 }}>PDF</span>
                                </button>
                                <button className="icon-btn" style={{ width: '100%', height: '60px', flexDirection: 'column', gap: '5px' }} onClick={(e) => handleDuplicate(e, selectedInvoice)}>
                                    <FaCopy size={20} /> <span style={{ fontSize: '9px', fontWeight: 800 }}>COPY</span>
                                </button>
                                <button className="icon-btn" style={{ width: '100%', height: '60px', flexDirection: 'column', gap: '5px' }} onClick={() => { setShowShareSheet(selectedInvoice); setSelectedInvoice(null); }}>
                                    <FaShareAlt size={20} /> <span style={{ fontSize: '9px', fontWeight: 800 }}>MORE</span>
                                </button>
                            </div>

                            <button
                                style={{ width: '100%', height: '54px', borderRadius: '14px', background: 'var(--slate-900)', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                                onClick={() => handlePaymentLink(selectedInvoice)}
                            >
                                <FaShareAlt /> Send Payment Link
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Sheet */}
            {showShareSheet && (
                <div className="modal-overlay" style={{ alignItems: 'flex-end' }} onClick={() => setShowShareSheet(null)}>
                    <div className="modal-card" style={{ borderRadius: '32px 32px 0 0' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontWeight: 900 }}>Quick Actions</h3>
                                <button onClick={() => setShowShareSheet(null)} style={{ background: 'none', border: 'none', fontSize: '20px' }}>✕</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '24px' }}>
                                <div style={{ textAlign: 'center' }} onClick={() => handleSMS(showShareSheet)}>
                                    <div className="icon-btn" style={{ width: '50px', height: '50px', background: '#e0f2fe', color: '#0369a1' }}><FaFileInvoiceDollar size={20} /></div>
                                    <p style={{ fontSize: '10px', fontWeight: 700, marginTop: '8px' }}>SMS</p>
                                </div>
                                <div style={{ textAlign: 'center' }} onClick={() => handlePaymentLink(showShareSheet)}>
                                    <div className="icon-btn" style={{ width: '50px', height: '50px', background: '#f5f3ff', color: '#6d28d9' }}><FaRupeeSign size={20} /></div>
                                    <p style={{ fontSize: '10px', fontWeight: 700, marginTop: '8px' }}>UPI Link</p>
                                </div>
                                <div style={{ textAlign: 'center' }} onClick={(e) => handleDelete(e, showShareSheet)}>
                                    <div className="icon-btn" style={{ width: '50px', height: '50px', background: '#fef2f2', color: '#b91c1c' }}><FaTrash size={20} /></div>
                                    <p style={{ fontSize: '10px', fontWeight: 700, marginTop: '8px' }}>Delete</p>
                                </div>
                                <div style={{ textAlign: 'center' }} onClick={() => window.print()}>
                                    <div className="icon-btn" style={{ width: '50px', height: '50px', background: '#f8fafc', color: '#64748b' }}><FaEllipsisV size={20} /></div>
                                    <p style={{ fontSize: '10px', fontWeight: 700, marginTop: '8px' }}>Print</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ background: 'var(--primary)', padding: '12px', textAlign: 'center', color: 'white', fontSize: '10px', fontWeight: 800 }}>POWERED BY BILLGST.IN</div>
                    </div>
                </div>
            )}

            <button className="floating-add" onClick={createInvoice}>
                <FaPlus /> <span>Create Invoice</span>
            </button>
        </div>
    );
}
