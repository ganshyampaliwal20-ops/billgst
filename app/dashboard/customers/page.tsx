'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserTie } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function CustomersPage() {
    const { customers, addCustomer, updateCustomer } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gstin: '',
        address: ''
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const filteredCustomers = customers.filter((c: any) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Name is required');
            return;
        }

        if (editingId) {
            updateCustomer(editingId, formData);
            toast.success('Customer updated');
        } else {
            addCustomer({
                id: crypto.randomUUID(),
                ...formData,
                created_at: new Date().toISOString()
            });
            toast.success('Customer added successfully');
        }

        resetForm();
    };

    const handleEdit = (customer: any) => {
        setFormData({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            gstin: customer.gstin || '',
            address: customer.address || ''
        });
        setEditingId(customer.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', phone: '', gstin: '', address: '' });
        setEditingId(null);
        setShowModal(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                    <p className="text-gray-500 text-sm">Manage your client database</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
                >
                    <FaPlus /> Add New Customer
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
                <FaSearch className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-100">
                        <div className="inline-block p-4 bg-gray-50 rounded-full mb-3">
                            <FaUserTie className="text-3xl text-gray-300" />
                        </div>
                        <p className="text-gray-500">No customers found</p>
                    </div>
                ) : (
                    filteredCustomers.map((customer: any) => (
                        <div key={customer.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 font-bold text-lg w-10 h-10 flex items-center justify-center">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={() => handleEdit(customer)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                                >
                                    <FaEdit />
                                </button>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1">{customer.name}</h3>
                            <div className="space-y-1 text-sm text-gray-500">
                                {customer.phone && <p>{customer.phone}</p>}
                                {customer.email && <p className="truncate">{customer.email}</p>}
                                {customer.gstin && <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs mt-1">GST: {customer.gstin}</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                                    <input
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xs"
                                        placeholder="Optional"
                                        value={formData.gstin}
                                        onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                                >
                                    {editingId ? 'Update' : 'Save Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
