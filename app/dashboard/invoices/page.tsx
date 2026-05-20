"use client";

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../../lib/store';
import {
    FaFilePdf, FaWhatsapp, FaTrash, FaPlus, FaSearch,
    FaFileInvoiceDollar, FaRupeeSign, FaEye,
    FaCopy, FaShareAlt, FaChevronRight, FaChevronDown, FaDownload, FaBell
} from 'react-icons/fa';
import { generateInvoicePDF } from '../../../lib/pdf-generator';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../../lib/utils';
import { useRouter } from 'next/navigation';

export default function InvoicesPage() {
    const router = useRouter();

    // Global Store
    const invoices = useStore((state: any) => state.invoices) || [];
    const quotations = useStore((state: any) => state.quotations) || [];
    const deleteInvoice = useStore((state: any) => state.deleteInvoice);
    const businessProfile = useStore((state: any) => state.businessProfile) || {};
    const fetchInvoices = useStore((state: any) => state.fetchInvoices);
    const fetchQuotations = useStore((state: any) => state.fetchQuotations);

    // Local State
    const [isClient, setIsClient] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    useEffect(() => {
        setIsClient(true);
        if (fetchInvoices) fetchInvoices();
        if (fetchQuotations) fetchQuotations();
    }, [fetchInvoices, fetchQuotations]);

    // Handle auto-select new invoice
    useEffect(() => {
        if (isClient && safeInvoices.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const newId = params.get('new');
            if (newId) {
                const newInv = safeInvoices.find((i: any) => i.id === newId);
                if (newInv) {
                    setSelectedInvoice(newInv);
                    window.history.replaceState({}, '', '/dashboard/invoices');
                }
            }
        }
    }, [isClient, invoices]);


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
        const dateA = new Date(a.created_at || a.invoice_date).getTime();
        const dateB = new Date(b.created_at || b.invoice_date).getTime();
        return dateB - dateA;
    });

    const grouped = useMemo(() => {
        const groups: Record<string, any[]> = {};
        filteredInvoices.forEach(inv => {
            const name = (inv.customer?.name || 'Local Sale').trim();
            const phone = (inv.customer?.phone || 'No Phone').trim();
            const key = `${name}_${phone}`; // Unique key based on Name and Phone
            if (!groups[key]) groups[key] = [];
            groups[key].push(inv);
        });
        return groups;
    }, [filteredInvoices]);

    // KPI Counters
    const kpiData = {
        total: safeInvoices.length,
        paid: safeInvoices.filter(i => (i.status || '').toUpperCase() === 'PAID').length,
        unpaid: safeInvoices.filter(i => (i.status || 'UNPAID').toUpperCase() === 'UNPAID').length,
        partial: safeInvoices.filter(i => (i.status || '').toUpperCase() === 'PARTIAL').length,
        receivable: safeInvoices.reduce((acc, i) => acc + (Number(i.total_amount) - Number(i.paid_amount || 0)), 0)
    };

    const pendingQuoCount = quotations.length;

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

    const handleWhatsApp = (invoice: any) => {
        const phone = (invoice.customer?.phone || '').replace(/\D/g, '');
        if (!phone) {
            toast.error('Pahle customer ka mobile number add karein, uske baad WhatsApp par share hoga.', { icon: '📱' });
            return;
        }
        const text = `Hi ${invoice.customer?.name || 'Customer'},\n\nYour invoice *#${invoice.invoice_number}* for *₹${invoice.total_amount}* is ready.\n\nRegards,\n${businessProfile.name}`;
        const url = `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    if (!isClient) return <div style={{ background: '#0F0E17', minHeight: '100vh' }} />;

    return (
        <div className="biz-ledger-app">
            <style dangerouslySetInnerHTML={{ __html: `
                .biz-ledger-app {
                    --bg: #0F0E17; --surface: #1A1927; --surface2: #221F35;
                    --border: rgba(255,255,255,0.08); --text: #FFFFFE; --muted: rgba(255,255,255,0.45);
                    --indigo: #6C63FF; --green: #30D158; --amber: #FF9500; --red: #FF453A;
                    background: var(--bg); color: var(--text); min-height: 100vh; font-family: 'DM Sans', sans-serif;
                }
                .header { padding: 3rem 1.25rem 2rem; position: relative; overflow: hidden; }
                .hdr-glow { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108,99,255,0.2), transparent 70%); }
                .brand { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
                .brand-ico { width: 42px; height: 42px; border-radius: 10px; background: linear-gradient(135deg, #6C63FF, #9B50FF); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(108,99,255,0.4); }
                .brand h1 { font-size: 1.25rem; font-weight: 800; margin: 0; }
                .brand p { font-size: 11px; color: var(--muted); margin: 2px 0 0; }

                .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 0 1.25rem 1.25rem; }
                .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px; position: relative; cursor: pointer; transition: 0.2s; }
                .stat-card:hover { background: var(--surface2); }
                .stat-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
                .stat-val { font-size: 24px; font-weight: 800; }
                .receivable-card { margin: 0 1.25rem 1.25rem; background: linear-gradient(135deg, rgba(108,99,255,0.15), rgba(155,80,255,0.1)); border: 1px solid rgba(108,99,255,0.3); border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; }

                .alert-quo { margin: 0 1.25rem 1.25rem; background: rgba(255,149,0,0.12); border: 1px solid rgba(255,149,0,0.25); border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; color: var(--amber); animation: pulseAlert 2s infinite; }
                @keyframes pulseAlert { 0% { box-shadow: 0 0 0 0 rgba(255,149,0,0.2); } 70% { box-shadow: 0 0 0 10px rgba(255,149,0,0); } 100% { box-shadow: 0 0 0 0 rgba(255,149,0,0); } }
                
                .toolbar { padding: 0 1.25rem 1.25rem; display: flex; gap: 10px; }
                .search-input { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; color: white; outline: none; font-size: 14px; }
                
                .tabs { display: flex; gap: 8px; padding: 0 1.25rem 1.5rem; overflow-x: auto; scrollbar-width: none; }
                .tabs::-webkit-scrollbar { display: none; }
                .tab { padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; background: var(--surface); border: 1px solid var(--border); color: var(--muted); cursor: pointer; white-space: nowrap; transition: 0.2s; }
                .tab.active { background: var(--indigo); color: white; border-color: var(--indigo); box-shadow: 0 4px 15px rgba(108,99,255,0.3); }

                .cust-group { margin: 0 1.25rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
                .cust-hdr { padding: 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
                .avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; background: rgba(255,255,255,0.05); }
                .invoice-row { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.02); }
                .inv-status { font-size: 9px; font-weight: 800; padding: 3px 8px; border-radius: 10px; text-transform: uppercase; }
                .st-PAID { background: rgba(48,209,88,0.15); color: #30D158; }
                .st-UNPAID { background: rgba(255,69,58,0.15); color: #FF453A; }
                .st-PARTIAL { background: rgba(255,149,0,0.15); color: #FF9500; }

                .fab { position: fixed; bottom: 30px; right: 20px; width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #6C63FF, #9B50FF); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(108,99,255,0.5); cursor: pointer; border: none; color: white; z-index: 100; transition: 0.2s; }
                .fab:active { transform: scale(0.9); }

                .modal-ov { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: flex-end; }
                .modal-sheet { background: var(--surface); width: 100%; border-radius: 24px 24px 0 0; padding: 2rem 1.25rem; transform: translateY(0); animation: slideUp 0.3s ease; }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                
                .btn-action { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px; border-radius: 12px; background: var(--surface2); border: 1px solid var(--border); color: var(--text); cursor: pointer; font-size: 11px; font-weight: 600; }
                .btn-action:hover { background: var(--border); }
            ` }} />

            <div className="header">
                <div className="hdr-glow" />
                <div className="brand">
                    <div className="brand-ico"><FaFileInvoiceDollar color="white" size={22} /></div>
                    <div>
                        <h1>Manage Invoices</h1>
                        <p>Track payments &middot; Reminders &middot; Analytics</p>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card" onClick={() => setActiveTab('all')}>
                    <div className="stat-lbl">Total Invoices</div>
                    <div className="stat-val" style={{ color: 'var(--indigo)' }}>{kpiData.total}</div>
                </div>
                <div className="stat-card" onClick={() => setActiveTab('d')}>
                    <div className="stat-lbl">Paid Full</div>
                    <div className="stat-val" style={{ color: 'var(--green)' }}>{kpiData.paid}</div>
                </div>
                <div className="stat-card" onClick={() => setActiveTab('u')}>
                    <div className="stat-lbl">Unpaid</div>
                    <div className="stat-val" style={{ color: 'var(--red)' }}>{kpiData.unpaid}</div>
                </div>
                <div className="stat-card" onClick={() => setActiveTab('p')}>
                    <div className="stat-lbl">Partial</div>
                    <div className="stat-val" style={{ color: 'var(--amber)' }}>{kpiData.partial}</div>
                </div>
            </div>

            <div className="receivable-card">
                <div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Total Receivable</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#8B84FF' }}>{formatCurrency(kpiData.receivable)}</div>
                </div>
                <FaRupeeSign size={32} style={{ opacity: 0.2 }} />
            </div>

            {pendingQuoCount > 0 && (
                <div className="alert-quo" onClick={() => router.push('/dashboard/quotations')}>
                    <FaBell />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>
                        <b>{pendingQuoCount} Quotations</b> pending — Tap to make bill
                    </span>
                    <FaChevronRight size={12} style={{ marginLeft: 'auto' }} />
                </div>
            )}

            <div className="toolbar">
                <input 
                    className="search-input" 
                    placeholder="Search customer or invoice..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="tabs">
                <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
                <button className={`tab ${activeTab === 'u' ? 'active' : ''}`} onClick={() => setActiveTab('u')}>Unpaid</button>
                <button className={`tab ${activeTab === 'p' ? 'active' : ''}`} onClick={() => setActiveTab('p')}>Partial</button>
                <button className={`tab ${activeTab === 'd' ? 'active' : ''}`} onClick={() => setActiveTab('d')}>Paid</button>
            </div>

            <div className="invoice-list">
                {Object.entries(grouped).sort((a: any, b: any) => {
                    const latestA = Math.max(...a[1].map((i: any) => new Date(i.created_at || i.invoice_date).getTime()));
                    const latestB = Math.max(...b[1].map((i: any) => new Date(i.created_at || i.invoice_date).getTime()));
                    return latestB - latestA;
                }).map(([key, invs]: [string, any]) => (
                    <div key={key} className="cust-group">
                        <div className="cust-hdr" onClick={() => setExpandedCustomers(prev => ({ ...prev, [key]: !prev[key] }))}>
                            <div className="avatar" style={{ color: 'var(--indigo)' }}>{invs[0]?.customer?.name?.charAt(0) || 'C'}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: 700 }}>{invs[0]?.customer?.name || 'Local Sale'}</div>
                                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{invs.length} Invoices &middot; {invs[0]?.customer?.phone || 'No Phone'}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 800 }}>{formatCurrency(invs.reduce((s: any, i: any) => s + Number(i.total_amount), 0))}</div>
                                {expandedCustomers[key] ? <FaChevronDown size={12} color="var(--muted)" /> : <FaChevronRight size={12} color="var(--muted)" />}
                            </div>
                        </div>
                        {expandedCustomers[key] && (
                            <div className="cust-details">
                                {invs.map((inv: any) => (
                                    <div key={inv.id} className="invoice-row" onClick={() => setSelectedInvoice(inv)}>
                                        <div className={`inv-status st-${(inv.status || 'UNPAID').toUpperCase()}`}>
                                            {inv.status || 'UNPAID'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: '#8B84FF' }}>#{inv.invoice_number}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{new Date(inv.invoice_date || inv.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: '14px' }}>{formatCurrency(inv.total_amount)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {Object.keys(grouped).length === 0 && (
                    <div style={{ padding: '50px', textAlign: 'center', color: 'var(--muted)' }}>
                        <FaFileInvoiceDollar size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>No invoices found</p>
                    </div>
                )}
            </div>

            <button className="fab" onClick={() => router.push('/dashboard/invoices/new')}>
                <FaPlus size={24} />
            </button>

            {selectedInvoice && (
                <div className="modal-ov" onClick={() => setSelectedInvoice(null)}>
                    <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                        <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 1.5rem' }} />
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Invoice #{selectedInvoice.invoice_number}</div>
                            <div style={{ fontSize: '24px', fontWeight: 800 }}>{formatCurrency(selectedInvoice.total_amount)}</div>
                            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{selectedInvoice.customer?.name}</div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-action" onClick={() => handleWhatsApp(selectedInvoice)}>
                                <FaWhatsapp size={20} color="#30D158" />
                                WhatsApp
                            </button>
                            <button className="btn-action" onClick={() => handleDownload(selectedInvoice)}>
                                <FaFilePdf size={20} color="#FF453A" />
                                Download PDF
                            </button>
                            <button className="btn-action" onClick={() => router.push(`/dashboard/invoices/new?duplicateId=${selectedInvoice.id}`)}>
                                <FaCopy size={20} color="var(--indigo)" />
                                Duplicate
                            </button>
                            <button className="btn-action" onClick={() => handleDelete(selectedInvoice)}>
                                <FaTrash size={20} color="var(--muted)" />
                                Delete
                            </button>
                        </div>
                        
                        <button 
                            className="tab" 
                            style={{ width: '100%', marginTop: '1.5rem', height: '50px', background: 'var(--indigo)', color: 'white', border: 'none' }}
                            onClick={() => setSelectedInvoice(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div style={{ height: '100px' }} />
        </div>
    );
}
