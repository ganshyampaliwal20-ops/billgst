'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaPlus, FaSearch, FaChevronLeft, FaCommentDots, FaBell, FaUserPlus, FaEdit, FaWhatsapp } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { formatCompactNumber } from '@/lib/utils';

export default function CustomersPage() {
    const router = useRouter();
    const { customers, invoices, addCustomer, updateCustomer, businessProfile } = useStore() as any;
    const [isClient, setIsClient] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('PARTIES');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        gstin: '',
        address: '',
        partyType: '',
        openingBalance: ''
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const getCustomerBalance = (customerId: string) => {
        // Filter invoices by checking both customer_id and nested customer.id
        const customerInvoices = invoices.filter((inv: any) =>
            inv.customer_id === customerId || inv.customer?.id === customerId
        );
        const total = customerInvoices.reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_amount) || 0), 0);
        const paid = customerInvoices.reduce((sum: number, inv: any) => sum + (parseFloat(inv.paid_amount) || 0), 0);
        return total - paid;
    };

    const filteredCustomers = customers.filter((c: any) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error('Name is required');
            return;
        }

        if (editingId) {
            updateCustomer(editingId, formData);
            toast.success('Party updated');
        } else {
            addCustomer({
                id: crypto.randomUUID(),
                ...formData,
                created_at: new Date().toISOString()
            });
            toast.success('Party added successfully');
        }
        resetForm();
    };

    const resetForm = () => {
        setFormData({ name: '', phone: '', gstin: '', address: '', partyType: '', openingBalance: '' });
        setEditingId(null);
        setShowModal(false);
    };

    const handleSendWhatsApp = (party: any, balance: number) => {
        if (!party.phone) {
            toast.error('Customer phone number missing!');
            return;
        }

        const customerName = party.name || 'Customer';
        const businessName = businessProfile?.name || 'Our Business';
        const message = `Namaste ${customerName} ji, hope you are doing well. This is a gentle reminder regarding your total outstanding balance of ₹${balance.toLocaleString('en-IN')} with ${businessName}. Please process the payment at your earliest convenience. Thank you!`;

        const phone = party.phone.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        toast.success(`Opening WhatsApp for ${customerName}...`);
    };

    return (
        <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
            {/* Premium Header */}
            <div className="bg-white border-b-4 border-emerald-500 px-6 py-6 flex items-center justify-between shadow-sm z-20 relative">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.history.back()} className="hover:bg-slate-100 p-2 -ml-2 rounded-xl transition-all">
                        <FaChevronLeft className="text-xl text-slate-800" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">All Customers</h1>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-1">Manage Your Customers</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => toast('No new messages', { icon: '💬' })} className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-slate-100 transition-all font-bold">
                        <FaCommentDots className="text-lg" />
                    </button>
                    <button onClick={() => toast('Notifications feature coming soon', { icon: '🔔' })} className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-slate-100 transition-all font-bold">
                        <FaBell className="text-lg" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white border-b border-emerald-50 px-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <button
                    onClick={() => setActiveTab('PARTIES')}
                    className={`flex-1 py-6 font-black text-xs tracking-[0.2em] rounded-2xl transition-all ${activeTab === 'PARTIES' ? 'text-white bg-emerald-600 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    PARTIES
                </button>
                <button
                    onClick={() => setActiveTab('GROUPS')}
                    className={`flex-1 py-6 font-black text-xs tracking-[0.2em] rounded-2xl transition-all ${activeTab === 'GROUPS' ? 'text-white bg-emerald-600 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    GROUPS
                </button>
            </div>

            {/* Search Bar - 3D Style */}
            <div className="px-6 py-5 bg-white border-b border-emerald-50" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <div className="relative w-full group transition-all bg-white p-1 rounded-2xl border-4 border-emerald-100 border-b-8 border-emerald-200 shadow-lg" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                    <input
                        type="text"
                        placeholder="SEARCH NAME / PHONE"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-4 bg-emerald-50/20 border-none rounded-xl outline-none text-base font-black text-black placeholder:text-slate-500 uppercase tracking-widest pl-5"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md">
                        <FaSearch className="text-lg" />
                    </div>
                </div>
            </div>

            {/* Parties List Header */}
            <div className="px-8 py-3 flex justify-between text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] bg-emerald-50/30" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <span>Party List ({filteredCustomers.length})</span>
                <span>Balance Report</span>
            </div>

            {/* Parties List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                {filteredCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <FaUserPlus className="text-8xl mb-6 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-sm italic">No parties found</p>
                    </div>
                ) : (
                    filteredCustomers.map((party: any, idx: number) => {
                        const balance = getCustomerBalance(party.id);
                        return (
                            <div
                                key={party.id}
                                className="relative rounded-3xl border-2 border-slate-100 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer group"
                                style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}
                                onClick={() => router.push(`/dashboard/customers/${party.id}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                                        {idx + 1}
                                    </div>
                                    <span className={`text-[10px] font-black italic uppercase tracking-widest ${balance > 0 ? 'text-rose-500' : 'text-emerald-500'}`} style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                                        {balance > 0 ? 'Payment Pending' : 'Clear Account'}
                                    </span>
                                </div>

                                <div style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                                    <h4 className="font-black text-slate-800 mb-1 uppercase truncate text-sm hover:text-emerald-600 transition-colors">{party.name}</h4>
                                    <div className="flex justify-between items-end mt-2">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-slate-400 text-[10px] font-black uppercase flex items-center gap-1 leading-none shadow-sm bg-white px-2 py-1 rounded-lg border border-slate-100 w-fit">
                                                📞 {party.phone || 'NO NO.'}
                                            </p>
                                        </div>
                                        <p className={`text-lg font-black italic ${balance > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {formatCompactNumber(balance || 0)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleSendWhatsApp(party, balance); }}
                                            className={`p-2 rounded-xl transition-all ${balance > 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'}`}
                                        >
                                            <FaWhatsapp className="text-lg" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingId(party.id);
                                                setFormData({ name: party.name, phone: party.phone || '', gstin: party.gstin || '', address: party.address || '', partyType: party.partyType || '', openingBalance: party.openingBalance || '' });
                                                setShowModal(true);
                                            }}
                                            className="p-2 bg-white text-slate-400 border border-slate-100 rounded-xl hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
                                        >
                                            <FaEdit className="text-lg" />
                                        </button>
                                    </div>
                                    <div className="text-[8px] font-black text-slate-400 uppercase italic">Touch to View Party</div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Action Button - Large & Yellow */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-8 right-8 w-20 h-20 bg-yellow-400 text-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-yellow-500/40 hover:scale-110 active:scale-95 transition-all z-30 border-4 border-white"
            >
                <FaUserPlus className="text-3xl" />
            </button>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-[#020817b3] backdrop-blur-[8px] animate-in fade-in duration-200">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
                        
                        .anp-popup * { box-sizing: border-box; }
                        .anp-popup {
                            font-family: 'Plus Jakarta Sans', sans-serif;
                            background: #ffffff;
                            border-radius: 20px;
                            width: 100%;
                            max-width: 480px;
                            max-height: 85vh;
                            overflow-y: auto;
                            margin: 15px;
                            animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
                            box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
                            text-align: left;
                        }
                        /* Hide scrollbar for Chrome, Safari and Opera */
                        .anp-popup::-webkit-scrollbar {
                            display: none;
                        }
                        /* Hide scrollbar for IE, Edge and Firefox */
                        .anp-popup {
                            -ms-overflow-style: none; /* IE and Edge */
                            scrollbar-width: none; /* Firefox */
                        }
                        @keyframes slideUp {
                            from { opacity: 0; transform: translateY(30px) scale(0.96); }
                            to   { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        .anp-popup-header {
                            background: linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%);
                            padding: 26px 28px 22px;
                            position: relative;
                            overflow: hidden;
                        }
                        .anp-popup-header::before {
                            content: ''; position: absolute; width: 180px; height: 180px;
                            background: rgba(255,255,255,0.06); border-radius: 50%;
                            top: -70px; right: -40px; pointer-events: none;
                        }
                        .anp-popup-header::after {
                            content: ''; position: absolute; width: 100px; height: 100px;
                            background: rgba(255,255,255,0.04); border-radius: 50%;
                            bottom: -40px; left: 30px; pointer-events: none;
                        }
                        .anp-header-top { display: flex; align-items: flex-start; justify-content: space-between; }
                        .anp-header-left { position: relative; z-index: 1; }
                        .anp-header-icon-wrap {
                            width: 44px; height: 44px; background: rgba(255,255,255,0.15);
                            border-radius: 12px; display: flex; align-items: center; justify-content: center;
                            font-size: 20px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.2);
                        }
                        .anp-popup-header h2 {
                            font-size: 22px; font-weight: 800; color: #fff;
                            letter-spacing: -0.4px; margin: 0; line-height: 1.2;
                        }
                        .anp-popup-header p {
                            font-size: 12.5px; color: rgba(255,255,255,0.65);
                            font-weight: 400; margin-top: 2px; margin-bottom: 0;
                        }
                        .anp-close-btn {
                            width: 32px; height: 32px; background: rgba(255,255,255,0.12);
                            border: 1px solid rgba(255,255,255,0.18); border-radius: 50%;
                            color: rgba(255,255,255,0.85); font-size: 16px; cursor: pointer;
                            display: flex; align-items: center; justify-content: center;
                            transition: all 0.2s ease; position: relative; z-index: 2;
                            flex-shrink: 0; margin-top: 2px; outline: none; padding: 0;
                        }
                        .anp-close-btn:hover { background: rgba(255,255,255,0.25); transform: rotate(90deg); }
                        .anp-accent-line {
                            height: 3px; background: linear-gradient(90deg, #f59e0b, #ef4444, #8b5cf6, #14b8a6);
                            background-size: 300% 100%; animation: gradientMove 3s ease infinite;
                        }
                        @keyframes gradientMove {
                            0% { background-position: 0% 0; }
                            50% { background-position: 100% 0; }
                            100% { background-position: 0% 0; }
                        }
                        .anp-popup-body { padding: 24px 28px 8px; }
                        .anp-step-label { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
                        .anp-step-dot { width: 8px; height: 8px; border-radius: 50%; background: #14b8a6; }
                        .anp-step-text {
                            font-size: 11px; font-weight: 600; text-transform: uppercase;
                            letter-spacing: 1px; color: #94a3b8;
                        }
                        .anp-form-group { margin-bottom: 16px; }
                        .anp-form-group.row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                        .anp-form-group label {
                            display: flex; align-items: center; gap: 5px; font-size: 11px;
                            font-weight: 700; text-transform: uppercase; letter-spacing: 0.9px;
                            color: #64748b; margin-bottom: 7px;
                        }
                        .anp-form-group label .req { color: #ef4444; font-size: 13px; line-height: 1; text-transform: none; }
                        .anp-form-group label .opt-tag {
                            font-size: 9.5px; background: #f1f5f9; color: #94a3b8;
                            border: 1px solid #e2e8f0; padding: 1px 7px; border-radius: 20px;
                            font-weight: 500; text-transform: none; letter-spacing: 0;
                        }
                        .anp-input-wrap { position: relative; }
                        .anp-input-icon {
                            position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
                            font-size: 14px; pointer-events: none; z-index: 10; transition: all 0.2s;
                            margin: 0; padding: 0;
                        }
                        .anp-input-wrap textarea ~ .anp-input-icon { top: 14px; transform: none; }
                        .anp-popup input, .anp-popup textarea, .anp-popup select {
                            width: 100%; padding: 11px 14px 11px 38px; border: 1.5px solid #e2e8f0;
                            border-radius: 11px; font-family: 'Plus Jakarta Sans', sans-serif;
                            font-size: 13.5px; font-weight: 500; color: #1e293b; background: #f8fafc;
                            transition: all 0.2s ease; outline: none; box-sizing: border-box; -webkit-appearance: none;
                        }
                        .anp-popup textarea { height: 80px; resize: none; padding-top: 12px; line-height: 1.5; }
                        .anp-popup select { cursor: pointer; }
                        .anp-popup input:focus, .anp-popup textarea:focus, .anp-popup select:focus {
                            border-color: #14b8a6; background: #fff; box-shadow: 0 0 0 3.5px rgba(20,184,166,0.1);
                        }
                        .anp-popup input::placeholder, .anp-popup textarea::placeholder { color: #cbd5e1; font-weight: 400; }
                        .anp-section-divider { display: flex; align-items: center; gap: 10px; margin: 4px 0 16px; }
                        .anp-section-divider span {
                            font-size: 10.5px; font-weight: 700; letter-spacing: 0.8px;
                            text-transform: uppercase; color: #cbd5e1; white-space: nowrap;
                        }
                        .anp-section-divider::before, .anp-section-divider::after {
                            content: ''; flex: 1; height: 1px; background: #f1f5f9;
                        }
                        .anp-info-card {
                            background: linear-gradient(135deg, #f0fdfa, #f0fdf4);
                            border: 1px solid #ccfbf1; border-radius: 10px; padding: 10px 14px;
                            display: flex; align-items: flex-start; gap: 10px; margin-bottom: 18px;
                        }
                        .anp-info-card .info-icon { font-size: 14px; margin-top: 1px; flex-shrink: 0; }
                        .anp-info-card p { font-size: 11.5px; color: #0f766e; font-weight: 500; line-height: 1.5; margin: 0; }
                        .anp-popup-footer { padding: 16px 28px 24px; display: flex; gap: 10px; }
                        .anp-btn {
                            flex: 1; padding: 13px 20px; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif;
                            font-size: 14px; font-weight: 700; cursor: pointer; border: none;
                            transition: all 0.2s ease; letter-spacing: 0.2px; outline: none;
                        }
                        .anp-btn-cancel { background: #f8fafc; color: #94a3b8; border: 1.5px solid #e2e8f0; flex: 0.7; }
                        .anp-btn-cancel:hover { background: #fef2f2; border-color: #fca5a5; color: #ef4444; }
                        .anp-btn-save {
                            background: linear-gradient(135deg, #0d9488, #14b8a6); color: #fff;
                            box-shadow: 0 6px 20px rgba(20,184,166,0.35); display: flex; align-items: center; justify-content: center; gap: 7px;
                        }
                        .anp-btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(20,184,166,0.45); }
                        .anp-btn-save:active:not(:disabled) { transform: translateY(0); }
                        .anp-btn-save:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; box-shadow: none; }
                        @media (max-width: 600px) {
                            .anp-popup { margin: 10px; border-radius: 16px; }
                            .anp-popup-header { padding: 12px 16px 8px; }
                            .anp-header-icon-wrap { width: 32px; height: 32px; font-size: 14px; margin-bottom: 4px; }
                            .anp-popup-header h2 { font-size: 16px; }
                            .anp-popup-header p { font-size: 10px; }
                            .anp-popup-body { padding: 12px 16px 8px; }
                            .anp-close-btn { width: 24px; height: 24px; font-size: 12px; }
                            .anp-popup-footer { padding: 8px 16px 12px; }
                            .anp-form-group { margin-bottom: 10px; }
                            .anp-form-group label { font-size: 9.5px; margin-bottom: 4px; }
                            .anp-popup input, .anp-popup textarea, .anp-popup select { padding: 8px 10px 8px 30px; font-size: 12px; border-radius: 8px; }
                            .anp-popup textarea { height: 50px; }
                            .anp-input-icon { left: 10px; font-size: 12px; }
                            .anp-btn { padding: 10px 14px; font-size: 12px; border-radius: 8px; }
                            .anp-step-label { margin-bottom: 12px; }
                            .anp-info-card { padding: 8px 10px; margin-bottom: 12px; }
                            .anp-info-card p { font-size: 10px; }
                        }
                    `}} />

                    <div className="anp-popup">
                        <div className="anp-popup-header">
                            <div className="anp-header-top">
                                <div className="anp-header-left">
                                    <div className="anp-header-icon-wrap">🤝</div>
                                    <h2>{editingId ? 'Edit Party' : 'Add New Party'}</h2>
                                    <p>Supplier ya customer ki details bharein</p>
                                </div>
                                <button type="button" className="anp-close-btn" onClick={resetForm}>✕</button>
                            </div>
                        </div>
                        <div className="anp-accent-line"></div>

                        <form onSubmit={handleSubmit} className="anp-popup-body m-0">
                            <div className="anp-step-label">
                                <div className="anp-step-dot"></div>
                                <span className="anp-step-text">Basic Information</span>
                            </div>

                            <div className="anp-form-group">
                                <label>Party Name <span className="req">*</span></label>
                                <div className="anp-input-wrap">
                                    <input
                                        type="text"
                                        placeholder="Enter party name"
                                        required
                                        autoFocus
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <span className="anp-input-icon">🏷️</span>
                                </div>
                            </div>

                            <div className="anp-form-group row">
                                <div>
                                    <label>Phone Number <span className="req">*</span></label>
                                    <div className="anp-input-wrap">
                                        <input
                                            type="tel"
                                            placeholder="Mobile No."
                                            maxLength={10}
                                            required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                        />
                                        <span className="anp-input-icon">📱</span>
                                    </div>
                                </div>
                                <div>
                                    <label>GSTIN <span className="opt-tag">Optional</span></label>
                                    <div className="anp-input-wrap">
                                        <input
                                            type="text"
                                            placeholder="GST NUMBER"
                                            maxLength={15}
                                            style={{ textTransform: 'uppercase' }}
                                            value={formData.gstin}
                                            onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                                        />
                                        <span className="anp-input-icon">🧾</span>
                                    </div>
                                </div>
                            </div>

                            <div className="anp-section-divider"><span>Additional</span></div>

                            <div className="anp-form-group row">
                                <div>
                                    <label>Party Type</label>
                                    <div className="anp-input-wrap">
                                        <select
                                            value={formData.partyType}
                                            onChange={e => setFormData({ ...formData, partyType: e.target.value })}
                                        >
                                            <option value="">Select</option>
                                            <option value="Customer">Customer</option>
                                            <option value="Supplier">Supplier</option>
                                            <option value="Both">Both</option>
                                        </select>
                                        <span className="anp-input-icon">⚙️</span>
                                    </div>
                                </div>
                                <div>
                                    <label>Opening Balance</label>
                                    <div className="anp-input-wrap">
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            min="0"
                                            value={formData.openingBalance}
                                            onChange={e => setFormData({ ...formData, openingBalance: e.target.value })}
                                        />
                                        <span className="anp-input-icon">₹</span>
                                    </div>
                                </div>
                            </div>

                            <div className="anp-form-group">
                                <label>Address <span className="opt-tag">Optional</span></label>
                                <div className="anp-input-wrap">
                                    <textarea
                                        placeholder="Shop No., Street, City..."
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    ></textarea>
                                    <span className="anp-input-icon textarea-icon">📍</span>
                                </div>
                            </div>

                            <div className="anp-info-card">
                                <span className="info-icon">💡</span>
                                <p>Party add hone ke baad aap isko ledger mein track kar sakte hain aur transactions attach kar sakte hain.</p>
                            </div>

                            <div className="anp-popup-footer !px-0 !pb-0 !pt-2">
                                <button type="button" className="anp-btn anp-btn-cancel" onClick={resetForm}>Cancel</button>
                                <button
                                    type="submit"
                                    className="anp-btn anp-btn-save"
                                    disabled={formData.name.trim().length < 2 || formData.phone.length !== 10}
                                >
                                    {editingId ? '✓ Update Party' : '✓ Save Party'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
