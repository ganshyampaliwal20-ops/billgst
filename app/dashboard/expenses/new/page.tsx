'use client';

import { useState } from 'react';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function NewExpensePage() {
    const router = useRouter();
    const { addExpense } = useStore();
    const [formData, setFormData] = useState({
        category: 'Office Supplies',
        description: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMethod: 'Cash'
    });

    const categories = ['Office Supplies', 'Travel', 'Utilities', 'Marketing', 'Salary', 'Rent', 'Other'];
    const paymentMethods = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await addExpense(formData);
        if (result.success) {
            router.push('/dashboard/expenses');
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/expenses" className="text-slate-600 hover:text-slate-800">
                    <FaArrowLeft className="text-xl" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Add Expense</h1>
                    <p className="text-slate-500 text-sm mt-1">Record a new business expense</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Category *</label>
                        <select
                            value={formData.category}
                            onChange={(e) => updateField('category', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                            required
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Date *</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => updateField('date', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Enter expense details..."
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium resize-none"
                            required
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Amount (₹) *</label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => updateField('amount', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                            required
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => updateField('paymentMethod', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                        >
                            {paymentMethods.map((method) => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary */}
                {formData.amount && (
                    <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl p-6">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Total Expense:</span>
                            <span className="text-3xl font-black">
                                ₹{parseFloat(formData.amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-4 border-t border-slate-200">
                    <Link
                        href="/dashboard/expenses"
                        className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                        <FaSave /> Save Expense
                    </button>
                </div>
            </form>
        </div>
    );
}
