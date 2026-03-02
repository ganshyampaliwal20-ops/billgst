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
        address: ''
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
        setFormData({ name: '', phone: '', gstin: '', address: '' });
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
                                                setFormData({ name: party.name, phone: party.phone || '', gstin: party.gstin || '', address: party.address || '' });
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
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-5xl w-full max-w-md p-16 shadow-2xl">
                            <h2 className="text-xl font-bold mb-6 text-[#0e7490]">{editingId ? 'Edit Party' : 'Add New Party'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Party Name *</label>
                                    <input
                                        required
                                        className="w-full p-3 border border-gray-500 rounded-xl outline-none focus:border-[#0e7490]"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Phone Number</label>
                                        <input
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#0e7490]"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Mobile No."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-800 uppercase mb-1">GSTIN</label>
                                        <input
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#0e7490]"
                                            value={formData.gstin}
                                            onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                                    <textarea
                                        className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#0e7490] h-24 resize-none"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 py-3 border-2 border-rose-400 text-rose-600 rounded-xl font-bold hover:bg-rose-50 hover:border-rose-600 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-[#0e7490] text-white rounded-xl font-bold hover:bg-[#0891b2] transition"
                                    >
                                        {editingId ? 'Update Party' : 'Save Party'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
