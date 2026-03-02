'use client';

import { useState } from 'react';
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

export default function NewQuotationPage() {
    const router = useRouter();
    const { addQuotation, quotations } = useStore();
    const [customer, setCustomer] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState([
        { id: 1, product: '', quantity: 1, rate: 0, amount: 0 }
    ]);

    // Generate unique quotation number using timestamp to avoid duplicates on different devices
    // Format: QUO-YYYYMMDD-XXXX (where XXXX is random)
    const generateQuoNumber = () => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        return `QUO-${dateStr}-${random}`;
    };

    const [quoNumber] = useState(generateQuoNumber());

    const addItem = () => {
        setItems([...items, { id: Date.now(), product: '', quantity: 1, rate: 0, amount: 0 }]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'rate') {
                    updated.amount = updated.quantity * updated.rate;
                }
                return updated;
            }
            return item;
        }));
    };

    const total = items.reduce((sum, item) => sum + item.amount, 0);

    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!customer) {
            toast.error('Please enter customer name');
            return;
        }

        setLoading(true);
        try {
            const quotationData = {
                quotation_number: quoNumber,
                customer_name: customer,
                quotation_date: date,
                total_amount: total,
                items: items.filter(item => item.product && item.quantity > 0)
            };

            console.log('Sending Quotation Data:', quotationData);

            const result = await addQuotation(quotationData);
            if (result.success) {
                router.push('/dashboard/quotations');
            } else {
                // Show explicit alert for mobile debugging
                alert(`Failed to save: ${result.error || 'Unknown Error'}`);
            }
        } catch (e: any) {
            alert(`Client Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-6 pt-6 space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/quotations" className="text-slate-600 hover:text-slate-800">
                        <FaArrowLeft className="text-xl" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">New Quotation</h1>
                        <p className="text-slate-500 text-sm mt-1">Create a new quotation for your customer</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 text-white transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl'
                        }`}
                >
                    {loading ? 'Saving...' : <><FaSave /> Save Quotation</>}
                </button>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Customer Name *</label>
                        <input
                            type="text"
                            value={customer}
                            onChange={(e) => setCustomer(e.target.value)}
                            placeholder="Enter customer name"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Date *</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            required
                        />
                    </div>
                </div>

                {/* Items Table */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-black text-slate-800">Items</h3>
                        <button
                            onClick={addItem}
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-200 transition-all flex items-center gap-2"
                        >
                            <FaPlus /> Add Item
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100 border-b-2 border-slate-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-700">Product/Service</th>
                                    <th className="text-center py-3 px-4 text-sm font-bold text-slate-700">Quantity</th>
                                    <th className="text-right py-3 px-4 text-sm font-bold text-slate-700">Rate (₹)</th>
                                    <th className="text-right py-3 px-4 text-sm font-bold text-slate-700">Amount (₹)</th>
                                    <th className="text-center py-3 px-4 text-sm font-bold text-slate-700">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-4">
                                            <input
                                                type="text"
                                                value={item.product}
                                                onChange={(e) => updateItem(item.id, 'product', e.target.value)}
                                                placeholder="Enter product name"
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-center"
                                                min="1"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number"
                                                value={item.rate}
                                                onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-right"
                                                min="0"
                                            />
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-slate-800">
                                            ₹{item.amount.toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {items.length > 1 && (
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-600 hover:text-red-800 p-2"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 w-full md:w-auto md:min-w-[300px]">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Total Amount:</span>
                            <span className="text-3xl font-black">₹{total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
                <Link
                    href="/dashboard/quotations"
                    className="px-6 py-3 bg-white text-rose-600 border-2 border-rose-400 rounded-xl font-bold hover:bg-rose-50 hover:border-rose-600 transition-all"
                >
                    Cancel
                </Link>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`px-6 py-3 rounded-xl font-bold shadow-lg text-white transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl'
                        }`}
                >
                    {loading ? 'Saving...' : 'Save Quotation'}
                </button>
            </div>
        </div>
    );
}
