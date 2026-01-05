'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaCalendar } from 'react-icons/fa';
import Link from 'next/link';
import { useStore } from '@/lib/store';

export default function ExpensesPage() {
    const { expenses, fetchExpenses } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        fetchExpenses();
    }, []);

    const categories = ['all', 'Office Supplies', 'Travel', 'Utilities', 'Marketing', 'Salary', 'Rent', 'Other'];

    const filteredExpenses = expenses.filter((e: any) => {
        const matchesSearch = (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Expenses</h1>
                    <p className="text-slate-500 text-sm mt-1">Track and manage your business expenses</p>
                </div>
                <Link
                    href="/dashboard/expenses/new"
                    className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <FaPlus /> Add Expense
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 space-y-4">
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${filterCategory === cat
                                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {cat === 'all' ? 'All Categories' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-rose-600 to-pink-600 text-white">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-bold uppercase tracking-wider">Date</th>
                                <th className="text-left py-4 px-6 text-sm font-bold uppercase tracking-wider">Category</th>
                                <th className="text-left py-4 px-6 text-sm font-bold uppercase tracking-wider">Description</th>
                                <th className="text-right py-4 px-6 text-sm font-bold uppercase tracking-wider">Amount</th>
                                <th className="text-center py-4 px-6 text-sm font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                                        No expenses found. Add your first expense!
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense: any) => (
                                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 text-slate-600 font-medium">
                                            <FaCalendar className="inline mr-2 text-slate-400" />
                                            {new Date(expense.expense_date).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-700 font-medium">{expense.description}</td>
                                        <td className="py-4 px-6 text-right font-bold text-slate-800">
                                            ₹{parseFloat(expense.amount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button className="text-blue-600 hover:text-blue-800 p-2">
                                                    <FaEdit />
                                                </button>
                                                <button className="text-red-600 hover:text-red-800 p-2">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-90">Total Expenses</h3>
                    <p className="text-4xl font-black mt-2">₹{totalExpenses.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-90">This Month</h3>
                    <p className="text-4xl font-black mt-2">{expenses.length}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-90">Categories</h3>
                    <p className="text-4xl font-black mt-2">{categories.length - 1}</p>
                </div>
            </div>
        </div>
    );
}
