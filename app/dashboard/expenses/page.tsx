'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTrash, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Expense {
    id: string;
    category: string;
    description: string;
    amount: string;
    date: string;
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newExpense, setNewExpense] = useState({
        category: '',
        description: '',
        amount: '',
        date: new Date().toLocaleDateString('en-CA'),
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await fetch('/api/expenses');
            const data = await response.json();
            setExpenses(data);
        } catch (error) {
            toast.error('Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense)
            });
            if (response.ok) {
                toast.success('Expense added successfully');
                setShowModal(false);
                setNewExpense({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
                fetchExpenses();
            } else {
                toast.error('Failed to add expense');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const filtered = expenses.filter(e =>
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalExpenses = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Expenses</h1>
                    <p className="text-slate-500 text-sm">Monitor your business spending</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-xl hover:bg-rose-700 transition shadow-lg font-bold"
                >
                    <FaPlus /> Add Expense
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Spending</p>
                    <p className="text-3xl font-black text-rose-600">₹{totalExpenses.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search description..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                                <th className="pb-4 px-2">Category</th>
                                <th className="pb-4 px-2">Description</th>
                                <th className="pb-4 px-2 text-right">Amount</th>
                                <th className="pb-4 px-2 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={4} className="py-10 text-center text-slate-400">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={4} className="py-10 text-center text-slate-400">No expenses found</td></tr>
                            ) : (
                                filtered.map((e) => (
                                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-2">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-tighter">{e.category}</span>
                                        </td>
                                        <td className="py-4 px-2 text-sm font-semibold text-slate-700">{e.description}</td>
                                        <td className="py-4 px-2 text-sm font-black text-rose-600 text-right">₹{parseFloat(e.amount).toLocaleString()}</td>
                                        <td className="py-4 px-2 text-sm text-slate-500 text-right">{new Date(e.date).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scaleUp">
                        <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Add Expense</h2>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Category</label>
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    <option value="RENT">Rent</option>
                                    <option value="UTILITY">Utility</option>
                                    <option value="SALARY">Salary</option>
                                    <option value="MARKETING">Marketing</option>
                                    <option value="OTHERS">Others</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Description</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Amount</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-bold"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                                    value={newExpense.date}
                                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 bg-rose-600 text-white font-black py-4 rounded-2xl hover:bg-rose-700 transition shadow-lg tracking-widest uppercase text-xs">Save</button>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition tracking-widest uppercase text-xs">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
