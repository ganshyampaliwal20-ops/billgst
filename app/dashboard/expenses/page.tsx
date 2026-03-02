'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaCalendar, FaRupeeSign, FaBox, FaReceipt, FaBriefcase, FaPlane, FaLightbulb, FaBullhorn, FaUserTie, FaHome, FaLayerGroup, FaChevronLeft, FaCommentDots, FaBell, FaWallet, FaChartPie, FaTags } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { formatCompactNumber } from '@/lib/utils';

export default function ExpensesPage() {
    const router = useRouter();
    const { expenses, fetchExpenses, deleteExpense } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this expense?')) {
            await deleteExpense(id);
            toast.success('Expense deleted');
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

    const totalExpensesAllTime = expenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);

    // Calculate current month sum
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = expenses.filter((e: any) => {
        const d = new Date(e.expense_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);

    const uniqueCategoriesCount = [...new Set(expenses.map((e: any) => e.category))].length;

    return (
        <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
            {/* Premium Header - Centered */}
            <div className="bg-white border-b-4 border-indigo-500 px-6 py-6 flex flex-col items-center justify-center text-center shadow-sm z-20 relative">
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Business Expenses</h1>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Track Your Spending</p>
                </div>
            </div>

            {/* Stats Grid - Single Row */}
            <div className="grid grid-cols-3 gap-3 p-4" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-50 flex flex-col items-center justify-center text-center gap-2 shadow-sm relative overflow-hidden group">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg"><FaWallet className="text-xl" /></div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">{formatCompactNumber(monthlyExpenses)}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">This Month</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-50 flex flex-col items-center justify-center text-center gap-2 shadow-sm relative overflow-hidden group">
                    <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-lg"><FaChartPie className="text-xl" /></div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">{formatCompactNumber(totalExpensesAllTime)}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Spends</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-50 flex flex-col items-center justify-center text-center gap-2 shadow-sm relative overflow-hidden group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-indigo-600 flex items-center justify-center shadow-sm"><FaTags className="text-xl" /></div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">{uniqueCategoriesCount}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Categories</p>
                    </div>
                </div>
            </div>

            {/* Search Bar - 3D Style */}
            <div className="px-6 py-4 bg-white border-b border-indigo-50" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <div className="relative w-full group transition-all bg-white p-1 rounded-2xl border-4 border-indigo-100 border-b-8 border-indigo-200 shadow-lg" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                    <input
                        type="text"
                        placeholder="SEARCH EXPENSE / CATEGORY"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-4 bg-indigo-50/20 border-none rounded-xl outline-none text-base font-black text-black placeholder:text-slate-400 uppercase tracking-widest pl-5"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
                        <FaSearch className="text-lg" />
                    </div>
                </div>
            </div>

            {/* Category Filter Pills - Horizontal Scroll */}
            <div className="flex overflow-x-auto p-4 gap-2 no-scrollbar bg-slate-50/50" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-sm active:scale-95 ${filterCategory === cat ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* List Header */}
            <div className="px-8 py-3 flex justify-between text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] bg-indigo-50/30" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <span>Expense Records ({filteredExpenses.length})</span>
                <span>Amount Spent</span>
            </div>

            {/* Card List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                {filteredExpenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <FaWallet className="text-8xl mb-6 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-sm italic">No expenses found</p>
                    </div>
                ) : (
                    filteredExpenses.map((expense: any, idx: number) => {
                        return (
                            <div
                                key={expense.id}
                                className="relative rounded-3xl border-2 border-slate-100 bg-slate-50 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all cursor-pointer group"
                                style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}
                                onClick={() => router.push(`/dashboard/expenses/edit/${expense.id}`)}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            {idx + 1}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-black text-slate-900 uppercase tracking-tight leading-none text-sm">{expense.description || 'Unnamed Expense'}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-full">{expense.category}</span>
                                                <span className="text-[9px] font-bold text-slate-400">{new Date(expense.expense_date).toLocaleDateString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-rose-600">
                                            ₹{parseFloat(expense.amount).toLocaleString('en-IN')}
                                        </div>
                                        <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => handleDelete(e, expense.id)} className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><FaTrash className="text-xs" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div className="h-24"></div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Link
                    href="/dashboard/expenses/new"
                    className="w-16 h-16 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center shadow-[0_12px_40px_-8px_rgba(234,179,8,0.4)] hover:scale-110 active:scale-95 transition-all border-4 border-white"
                >
                    <FaPlus className="text-2xl" />
                </Link>
            </div>
        </div>
    );
}
