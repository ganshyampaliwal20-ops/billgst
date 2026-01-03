'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface Expense {
    id: string;
    category: string;
    description: string;
    date: string;
    amount: number;
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setTimeout(() => {
            setExpenses([
                { id: '1', category: 'Rent', description: 'Office Rent - Oct', date: '2023-10-01', amount: 25000 },
                { id: '2', category: 'Utility', description: 'Electricity Bill', date: '2023-10-05', amount: 3500 },
                { id: '3', category: 'Salary', description: 'Staff Salary - Sept', date: '2023-10-02', amount: 80000 },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const filtered = expenses.filter(e =>
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
                    <p className="text-slate-500 text-sm">Monitor your business spending and overheads</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-xl hover:bg-rose-700 transition shadow-lg font-bold">
                    <FaPlus /> Add Expense
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total This Month</p>
                    <p className="text-3xl font-black text-rose-600">₹{totalExpenses.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search category or description..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider">Category</th>
                                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider">Description</th>
                                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider">Date</th>
                                <th className="text-right py-4 px-6 text-xs font-black uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={4} className="py-20 text-center text-slate-400">Loading...</td></tr>
                            ) : filtered.map((e) => (
                                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase">{e.category}</span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-700 font-medium">{e.description}</td>
                                    <td className="py-4 px-6 text-sm text-slate-500">{e.date}</td>
                                    <td className="py-4 px-6 text-sm font-black text-rose-600 text-right">₹{e.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
