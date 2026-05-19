'use client';

import { useEffect, useState } from 'react';
import { FaChevronLeft, FaChartPie, FaTrash, FaReceipt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { useStore } from '../../../../lib/store';
import { getTranslations } from '@/lib/translations';
import toast from 'react-hot-toast';

export default function TotalExpensesPage() {
    const router = useRouter();
    const { expenses, fetchExpenses, deleteExpense, settings } = useStore() as any;
    const [isClient, setIsClient] = useState(false);
    const t = getTranslations(settings?.language || 'en');

    useEffect(() => {
        setIsClient(true);
        fetchExpenses();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm(t.deleteExpenseConfirm)) {
            await deleteExpense(id);
            toast.success(t.expenseDeleted);
        }
    };

    if (!isClient) return null;

    const totalAmount = expenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);

    return (
        <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b-4 border-orange-500 px-6 py-6 flex items-center gap-4 shadow-sm z-20 relative">
                <button onClick={() => router.back()} className="hover:bg-slate-100 p-2 -ml-2 rounded-xl transition-all">
                    <FaChevronLeft className="text-xl text-slate-800" />
                </button>
                <div>
                    <h1 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Total Spends</h1>
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none mt-1">All Time Spends</p>
                </div>
            </div>

            <div className="p-4 bg-white border-b border-orange-50" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-6 rounded-3xl border-b-[6px] border-orange-700 flex flex-col items-center justify-center text-center gap-2 shadow-xl shadow-orange-500/30 relative overflow-hidden active:translate-y-1 active:border-b-0 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><FaChartPie className="text-6xl text-white" /></div>
                    <h3 className="text-3xl font-black text-white tracking-tight leading-none z-10">₹{totalAmount.toLocaleString('en-IN')}</h3>
                    <p className="text-xs font-black text-orange-100 uppercase tracking-widest mt-1 z-10 flex items-center gap-1"><FaChartPie /> Overall Total</p>
                </div>
            </div>

            <div className="px-8 py-3 flex justify-between text-[10px] font-black uppercase text-orange-600 tracking-[0.2em] bg-orange-50/30 border-y border-orange-50" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <span>{t.allRecords} ({expenses.length})</span>
                <span>{t.amountSpent}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                {expenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 pb-20">
                        <FaChartPie className="text-8xl mb-6 opacity-20 text-orange-300" />
                        <p className="font-black uppercase tracking-widest text-sm italic text-slate-400">{t.noExpensesFound}</p>
                    </div>
                ) : (
                    expenses.map((expense: any, idx: number) => {
                        return (
                            <div
                                key={expense.id}
                                className="relative rounded-3xl border-2 border-slate-100 bg-slate-50 hover:border-orange-500 hover:bg-orange-50/20 transition-all cursor-pointer group"
                                style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}
                                onClick={() => router.push(`/dashboard/expenses/edit/${expense.id}`)}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-orange-600 shadow-sm border border-slate-100 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                            {idx + 1}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-black text-slate-900 uppercase tracking-tight leading-none text-sm">{expense.description || 'Unnamed Expense'}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">{expense.category}</span>
                                                <span className="text-[9px] font-bold text-slate-400">{new Date(expense.expense_date).toLocaleDateString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-base font-black text-orange-600">
                                            ₹{parseFloat(expense.amount).toLocaleString('en-IN')}
                                        </div>
                                        <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => handleDelete(e, expense.id)} className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-all"><FaTrash className="text-xs" /></button>
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
