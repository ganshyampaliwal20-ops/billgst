'use client';

import { useEffect, useState } from 'react';
import { FaChevronLeft, FaTags, FaLayerGroup } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { useStore } from '../../../../lib/store';

export default function CategoryExpensesPage() {
    const router = useRouter();
    const { expenses, fetchExpenses } = useStore() as any;
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        fetchExpenses();
    }, []);

    if (!isClient) return null;

    // Calculate sum per category
    const categoryTotals = expenses.reduce((acc: any, curr: any) => {
        const cat = curr.category || 'Other';
        acc[cat] = (acc[cat] || 0) + parseFloat(curr.amount || 0);
        return acc;
    }, {});

    const categoryArray = Object.keys(categoryTotals).map(cat => ({
        name: cat,
        total: categoryTotals[cat],
        count: expenses.filter((e: any) => e.category === cat).length
    })).sort((a, b) => b.total - a.total); // Sort by highest spend

    const uniqueCategoriesCount = categoryArray.length;

    return (
        <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b-4 border-indigo-500 px-6 py-6 flex items-center gap-4 shadow-sm z-20 relative">
                <button onClick={() => router.back()} className="hover:bg-slate-100 p-2 -ml-2 rounded-xl transition-all">
                    <FaChevronLeft className="text-xl text-slate-800" />
                </button>
                <div>
                    <h1 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Categories</h1>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mt-1">Expense Breakdown</p>
                </div>
            </div>

            <div className="p-4 bg-white border-b border-indigo-50" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl border-b-[6px] border-indigo-700 flex flex-col items-center justify-center text-center gap-2 shadow-xl shadow-indigo-500/30 relative overflow-hidden active:translate-y-1 active:border-b-0 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><FaTags className="text-6xl text-white" /></div>
                    <h3 className="text-3xl font-black text-white tracking-tight leading-none z-10">{uniqueCategoriesCount}</h3>
                    <p className="text-xs font-black text-indigo-100 uppercase tracking-widest mt-1 z-10 flex items-center gap-1"><FaTags /> Unique Categories</p>
                </div>
            </div>

            <div className="px-8 py-3 flex justify-between text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] bg-indigo-50/30 border-y border-indigo-50" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <span>Category Breakdown</span>
                <span>Total Amount</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                {categoryArray.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 pb-20">
                        <FaLayerGroup className="text-8xl mb-6 opacity-20 text-indigo-300" />
                        <p className="font-black uppercase tracking-widest text-sm italic text-slate-400">No categories found</p>
                    </div>
                ) : (
                    categoryArray.map((cat: any, idx: number) => {
                        return (
                            <div
                                key={cat.name}
                                className="relative rounded-3xl border-2 border-slate-100 bg-slate-50 transition-all group"
                                style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100">
                                            {idx + 1}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-black text-slate-900 uppercase tracking-tight leading-none text-base">{cat.name}</h3>
                                            <div className="mt-1">
                                                <span className="text-[10px] font-bold text-slate-500">{cat.count} {cat.count === 1 ? 'Transaction' : 'Transactions'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-indigo-600">
                                            ₹{parseFloat(cat.total).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div className="h-24"></div>
            </div>
        </div>
    );
}
