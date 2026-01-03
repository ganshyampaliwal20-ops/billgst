'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/lib/constants';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        vendor_name: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: '',
        receipt_no: '',
        notes: ''
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await fetch('/api/expenses');
            const data = await res.json();
            setExpenses(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Expense added successfully!');
                setShowForm(false);
                setFormData({
                    category: '',
                    vendor_name: '',
                    amount: '',
                    expense_date: new Date().toISOString().split('T')[0],
                    payment_method: '',
                    receipt_no: '',
                    notes: ''
                });
                fetchExpenses();
            } else {
                toast.error('Failed to add expense');
            }
        } catch (error) {
            toast.error('Error adding expense');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Expense deleted');
                fetchExpenses();
            }
        } catch (error) {
            toast.error('Error deleting expense');
        }
    };

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Category wise breakdown
    const categoryTotals = expenses.reduce((acc: any, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Expenses</h1>
                    <p className="text-sm text-slate-600 mt-1">Track all your business expenses</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg"
                >
                    <FaPlus /> Add Expense
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
                    <p className="text-sm text-slate-600 font-bold mb-2">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-600">₹{totalExpenses.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
                    <p className="text-sm text-slate-600 font-bold mb-2">This Month</p>
                    <p className="text-3xl font-bold text-orange-600">
                        ₹{expenses.filter(e => new Date(e.expense_date).getMonth() === new Date().getMonth())
                            .reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
                    <p className="text-sm text-slate-600 font-bold mb-2">Categories</p>
                    <p className="text-3xl font-bold text-indigo-600">{Object.keys(categoryTotals).length}</p>
                </div>
            </div>

            {/* Add Expense Form */}
            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 mb-8">
                    <h2 className="text-xl font-bold mb-6">Add New Expense</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Category *</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-3 border border-slate-300 rounded-xl"
                            >
                                <option value="">Select Category</option>
                                {EXPENSE_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Vendor Name</label>
                            <input
                                type="text"
                                value={formData.vendor_name}
                                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                                className="w-full p-3 border border-slate-300 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Amount *</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full p-3 border border-slate-300 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Date *</label>
                            <input
                                type="date"
                                required
                                value={formData.expense_date}
                                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                className="w-full p-3 border border-slate-300 rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                            <select
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                className="w-full p-3 border border-slate-300 rounded-xl"
                            >
                                <option value="">Select Method</option>
                                {PAYMENT_METHODS.map(method => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Receipt No</label>
                            <input
                                type="text"
                                value={formData.receipt_no}
                                onChange={(e) => setFormData({ ...formData, receipt_no: e.target.value })}
                                className="w-full p-3 border border-slate-300 rounded-xl"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full p-3 border border-slate-300 rounded-xl"
                                rows={2}
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-4">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                            >
                                Save Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-8 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Expenses List */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Vendor</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Payment Method</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Amount</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {expenses.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    No expenses recorded yet
                                </td>
                            </tr>
                        ) : (
                            expenses.map(expense => (
                                <tr key={expense.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {new Date(expense.expense_date).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">{expense.category}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{expense.vendor_name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{expense.payment_method || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-right text-red-600">
                                        ₹{Number(expense.amount).toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
