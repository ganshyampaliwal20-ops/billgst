'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaPlus, FaSearch, FaChevronLeft, FaCommentDots, FaBell, FaUserPlus, FaEdit } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CustomersPage() {
    const router = useRouter();
    const { customers, invoices, addCustomer, updateCustomer } = useStore() as any;
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

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden">
            {/* Custom Header - Teal color as per image */}
            <div className="bg-[#4358f4] text-white px-6 py-5 flex items-center justify-between shadow-lg z-20 relative">
                <div className="flex items-center gap-5">
                    <button onClick={() => window.history.back()} className="hover:bg-white/10 p-2 -ml-2 rounded-full transition-colors">
                        <FaChevronLeft className="text-xl" />
                    </button>
                    <h1 className="text-xl font-bold tracking-wide transition-all">All Parties</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => toast('No new messages', { icon: '💬' })} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <FaCommentDots className="text-xl" />
                    </button>
                    <button onClick={() => toast('Notifications feature coming soon', { icon: '🔔' })} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <FaBell className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Spacer between Header and Tabs - Increased for visual separation */}
            <div className="h-4 bg-[#0b5c73] border-t border-[#0e7490]/50"></div>

            {/* Tabs */}
            <div className="flex bg-[#0e7490] text-white/80 shadow-md relative z-10">
                <button
                    onClick={() => setActiveTab('PARTIES')}
                    className={`flex-1 py-4 font-bold text-sm tracking-[0.2em] relative transition-all ${activeTab === 'PARTIES' ? 'text-white bg-white/10' : 'hover:bg-white/5'}`}
                >
                    PARTIES
                    {activeTab === 'PARTIES' && <div className="absolute bottom-0 left-0 w-full h-1 bg-white shadow-[0_0_10px_white]"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('GROUPS')}
                    className={`flex-1 py-4 font-bold text-sm tracking-[0.2em] relative transition-all ${activeTab === 'GROUPS' ? 'text-white bg-white/10' : 'hover:bg-white/5'}`}
                >
                    GROUPS
                    {activeTab === 'GROUPS' && <div className="absolute bottom-0 left-0 w-full h-1 bg-white shadow-[0_0_10px_white]"></div>}
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-5 border-b border-gray-10 bg-white shadow-sm relative z-0">
                <div className="relative group">
                    <FaSearch className="absolute left-150 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-[#0e7490] transition-colors z-10" />
                    <input
                        type="text"
                        placeholder="Search for Name / No. / Address etc."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '1.1rem' }}
                        className="w-full pr-6 py-4 bg-gray-50 border-15 border-slate-100 rounded-full outline-none focus:bg-white focus:border-[#0e7490] focus:ring-4 focus:ring-[#4358f4]/10 transition-all text-sm font-bold text-slate-700 shadow-inner placeholder:font-normal"
                    />
                </div>
            </div>

            {/* List Header */}
            <div className="bg-[#f0f9ff] px-6 py-3 flex justify-between text-xs font-bold text-[#64748b] border-b border-gray-100 uppercase tracking-wider">
                <span className="pl-2" style={{ paddingLeft: '8px' }}>Party Name</span>
                <span className="pr-2" style={{ paddingRight: '8px' }}>Amount</span>
            </div>

            {/* Parties List */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                {filteredCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <FaUserPlus className="text-6xl mb-4 opacity-20" />
                        <p className="font-medium text-lg text-slate-400">No parties found</p>
                    </div>
                ) : (
                    filteredCustomers.map((party: any) => {
                        const balance = getCustomerBalance(party.id);
                        return (
                            <div
                                key={party.id}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex justify-between items-center hover:shadow-md transition-all cursor-pointer active:scale-[0.99] group"
                                onClick={() => {
                                    router.push(`/dashboard/customers/${party.id}`);
                                }}
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 text-lg truncate group-hover:text-[#0e7490] transition-colors">{party.name}</h3>
                                    {party.phone ? (
                                        <p className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">📞</span>
                                            {party.phone}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-slate-400 mt-1 italic">No phone number</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 shrink-0 pl-4 border-l border-slate-100 ml-4">
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Balance</p>
                                        <span className={`font-black text-lg whitespace-nowrap ${balance > 0 ? 'text-[#4358f4]' : 'text-slate-600'}`}>
                                            ₹ {(balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingId(party.id);
                                            setFormData({
                                                name: party.name,
                                                phone: party.phone || '',
                                                gstin: party.gstin || '',
                                                address: party.address || ''
                                            });
                                            setShowModal(true);
                                        }}
                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#0e7490] hover:bg-[#0e7490]/10 rounded-full transition-all"
                                    >
                                        <FaEdit className="text-lg" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setShowModal(true)}
                className="absolute bottom-6 right-6 w-20 h-20 bg-[#0e7490] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[#0891b2] active:scale-95 transition-all z-20"
            >
                <FaPlus className="text-2xl" />
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
                                        className="flex-1 py-3 border border-gray-800 rounded-xl font-bold text-gray-800 hover:bg-gray-50 transition"
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
