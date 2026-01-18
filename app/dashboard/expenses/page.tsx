'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaCalendar, FaRupeeSign, FaBox, FaReceipt, FaBriefcase, FaPlane, FaLightbulb, FaBullhorn, FaUserTie, FaHome, FaLayerGroup } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ExpensesPage() {
    const router = useRouter();
    const { expenses, fetchExpenses, deleteExpense } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            await deleteExpense(id);
        }
    };

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

    // Calculate current month sum
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = expenses.filter((e: any) => {
        const d = new Date(e.expense_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);

    const uniqueCategories = [...new Set(expenses.map((e: any) => e.category))].length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Expenses</h1>
                    <p className="text-slate-500 text-sm mt-1">Track and manage your business expenses</p>
                </div>
            </div>

            {/* Summary Box - Dashboard Style (Horizontal) */}

            <div className="relative mb-1 mx-4 md:mx-0" style={{ marginTop: '10px' }}></div>
            <div className="bg-[#0e7490] rounded-3xl p-6 shadow-xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-44 bg-white/10 rounded-full blur-2xl -ml-5 -mb-5"></div>

                <div className="flex items-center justify-between gap-2 relative z-10">
                    <div className="flex-1 flex flex-col items-center gap-3">
                        <div className="p-3 rounded-full bg-white/20 text-white shadow-md">
                            <FaRupeeSign className="text-xl" />
                        </div>
                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Total Expenses</span>
                        <span className="text-lg font-black text-white">₹{totalExpenses.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-px h-10 bg-white/20"></div>

                    <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-white/20 text-white shadow-md">
                            <FaCalendar className="text-xl" />
                        </div>
                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">This Month</span>
                        <span className="text-lg font-black text-white">₹{monthlyExpenses.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="w-px h-10 bg-white/20"></div>

                    <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-white/20 text-white shadow-md">
                            <FaBox className="text-xl" />
                        </div>
                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Categories</span>
                        <span className="text-lg font-black text-white">{uniqueCategories}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 space-y-4">
                <div className="relative">
                    <div className="relative mb-1 mx-4 md:mx-0" style={{ marginTop: '10px' }}></div>
                    <FaSearch className="absolute left-100 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium" style={{ paddingLeft: '20px' }}
                    />
                </div>
                <div className="relative mb-1 mx-4 md:mx-0" style={{ marginTop: '10px' }}></div>
                <div className="grid grid-cols-4 gap-2 md:flex md:flex-wrap md:justify-center md:gap-6">
                    {categories.map((cat) => {
                        let Icon = FaBox;
                        if (cat === 'Office Supplies') Icon = FaBriefcase;
                        if (cat === 'Travel') Icon = FaPlane;
                        if (cat === 'Utilities') Icon = FaLightbulb;
                        if (cat === 'Marketing') Icon = FaBullhorn;
                        if (cat === 'Salary') Icon = FaUserTie;
                        if (cat === 'Rent') Icon = FaHome;

                        const isActive = filterCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 px-2 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-lg transition-all transform hover:scale-105 shadow-sm hover:shadow-lg ${isActive
                                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-200 ring-4 ring-rose-100 scale-105'
                                    : 'bg-white text-slate-600 border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                                    }`}
                            >
                                <Icon className={`text-sm md:text-xl ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                <span className="text-center leading-tight whitespace-nowrap">{cat === 'all' ? 'All' : cat}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Expenses List */}
            <div className="relative mb-1 mx-4 md:mx-0" style={{ marginTop: '10px' }}></div>
            <div className="bg-white rounded-10xl shadow-lg border border-slate-200 overflow-hidden mb-24">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-rose-600 to-pink-600 text-white">
                            <tr>
                                <th className="text-left py-4 pr-6 text-sm font-bold uppercase tracking-wider min-w-[160px] whitespace-nowrap" style={{ paddingLeft: '20px' }}>Date</th>
                                <th className="text-left py-4 px-6 text-sm font-bold uppercase tracking-wider min-w-[160px] whitespace-nowrap">Category</th>
                                <th className="text-left py-4 px-6 text-sm font-bold uppercase tracking-wider min-w-[200px] whitespace-nowrap">Description</th>
                                <th className="text-right py-4 px-6 text-sm font-bold uppercase tracking-wider min-w-[140px] whitespace-nowrap">Amount</th>
                                <th className="text-center py-4 px-6 text-sm font-bold uppercase tracking-wider min-w-[140px] whitespace-nowrap">Actions</th>
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
                                        <td className="py-4 pr-6 text-slate-600 font-medium" style={{ paddingLeft: '15px' }}>
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
                                                <button
                                                    onClick={() => router.push(`/dashboard/expenses/edit/${expense.id}`)}
                                                    className="text-blue-600 hover:text-blue-800 p-2"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="text-red-600 hover:text-red-800 p-2"
                                                >
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

            {/* Floating Add Button */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <Link
                    href="/dashboard/expenses/new"
                    className="pointer-events-auto bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-4 rounded-full font-black text-lg shadow-2xl hover:shadow-rose-500/50 hover:scale-105 transition-all flex items-center gap-3 ring-4 ring-white"
                >
                    <FaPlus className="text-xl" /> ADD EXPENSE
                </Link>
            </div>
        </div >
    );
}
