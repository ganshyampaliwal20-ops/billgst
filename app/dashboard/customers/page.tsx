'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaPlus, FaSearch, FaChevronLeft, FaCommentDots, FaBell, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function CustomersPage() {
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
        const customerInvoices = invoices.filter((inv: any) => inv.customer_id === customerId);
        const total = customerInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
        const paid = customerInvoices.reduce((sum: number, inv: any) => sum + (inv.paid_amount || 0), 0);
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
            <div className="bg-[#0e7490] text-white px-4 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                    <FaChevronLeft className="text-xl cursor-pointer" />
                    <h1 className="text-xl font-bold tracking-wide transition-all">All Parties</h1>
                </div>
                <div className="flex items-center gap-6">
                    <FaCommentDots className="text-xl cursor-pointer opacity-90 hover:opacity-100" />
                    <FaBell className="text-xl cursor-pointer opacity-90 hover:opacity-100" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#0e7490] text-white/80 border-t border-white/10">
                <button
                    onClick={() => setActiveTab('PARTIES')}
                    className={`flex-1 py-3 font-bold text-sm tracking-widest relative transition-all ${activeTab === 'PARTIES' ? 'text-white' : 'hover:bg-black/5'}`}
                >
                    PARTIES
                    {activeTab === 'PARTIES' && <div className="absolute bottom-0 left-0 w-full h-1 bg-white"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('GROUPS')}
                    className={`flex-1 py-3 font-bold text-sm tracking-widest relative transition-all ${activeTab === 'GROUPS' ? 'text-white' : 'hover:bg-black/5'}`}
                >
                    GROUPS
                    {activeTab === 'GROUPS' && <div className="absolute bottom-0 left-0 w-full h-1 bg-white"></div>}
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3 border-b border-gray-100">
                <div className="relative group">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0e7490] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for Name / No. / Address etc."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full outline-none focus:bg-white focus:border-[#0e7490] transition-all text-sm"
                    />
                </div>
            </div>

            {/* List Header */}
            <div className="bg-[#e0f2fe] px-4 py-2 flex justify-between text-xs font-bold text-[#64748b] border-b border-gray-100">
                <span>Party Name</span>
                <span>Amount</span>
            </div>

            {/* Parties List */}
            <div className="flex-1 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                        <FaUserPlus className="text-6xl mb-4 opacity-20" />
                        <p>No parties found</p>
                    </div>
                ) : (
                    filteredCustomers.map((party: any) => {
                        const balance = getCustomerBalance(party.id);
                        return (
                            <div
                                key={party.id}
                                className="flex justify-between items-center px-4 py-5 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group"
                                onClick={() => {
                                    setEditingId(party.id);
                                    setFormData({
                                        name: party.name,
                                        phone: party.phone || '',
                                        gstin: party.gstin || '',
                                        address: party.address || ''
                                    });
                                    setShowModal(true);
                                }}
                            >
                                <div className="flex-1">
                                    <h3 className="font-semibold text-[#1e293b] text-[15px]">{party.name}</h3>
                                    {party.phone && <p className="text-xs text-gray-500 mt-0.5">{party.phone}</p>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold text-[15px] ${balance > 0 ? 'text-[#16a34a]' : 'text-gray-400'}`}>
                                        ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                    {balance > 0 && <FaBell className="text-[#0e7490] text-sm opacity-60 group-hover:opacity-100 transition-opacity" />}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setShowModal(true)}
                className="absolute bottom-6 right-6 w-16 h-16 bg-[#0e7490] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[#0891b2] active:scale-95 transition-all z-20"
            >
                <FaPlus className="text-2xl" />
            </button>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 text-[#0e7490]">{editingId ? 'Edit Party' : 'Add New Party'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Party Name *</label>
                                <input
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#0e7490]"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                                    <input
                                        className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#0e7490]"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Mobile No."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">GSTIN</label>
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
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition"
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
            )}
        </div>
    );
}
