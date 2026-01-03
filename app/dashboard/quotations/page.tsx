'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaPlus, FaSearch, FaFilePdf, FaEdit, FaExchangeAlt, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Quotation {
    id: string;
    quotation_number: string;
    customer_name: string;
    quotation_date: string;
    total_amount: string;
    status: string;
}

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const response = await fetch('/api/quotations');
            const data = await response.json();
            setQuotations(data);
        } catch (error) {
            toast.error('Failed to fetch quotations');
        } finally {
            setLoading(false);
        }
    };

    const filtered = quotations.filter(q =>
        q.quotation_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quotations</h1>
                    <p className="text-slate-500 text-sm">Manage your estimates and price quotes</p>
                </div>
                <Link href="/dashboard/quotations/new" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg font-bold">
                    <FaPlus /> New Quotation
                </Link>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by number or customer..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                                <th className="pb-4 px-2">Number</th>
                                <th className="pb-4 px-2">Customer</th>
                                <th className="pb-4 px-2">Date</th>
                                <th className="pb-4 px-2 text-right">Amount</th>
                                <th className="pb-4 px-2 text-center">Status</th>
                                <th className="pb-4 px-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="py-10 text-center text-slate-400">No quotations found</td></tr>
                            ) : (
                                filtered.map((q) => (
                                    <tr key={q.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 px-2 text-sm font-bold text-indigo-600">#{q.quotation_number}</td>
                                        <td className="py-4 px-2 text-sm font-semibold text-slate-700">{q.customer_name}</td>
                                        <td className="py-4 px-2 text-sm text-slate-500">{new Date(q.quotation_date).toLocaleDateString()}</td>
                                        <td className="py-4 px-2 text-sm font-black text-slate-800 text-right">₹{parseFloat(q.total_amount).toLocaleString()}</td>
                                        <td className="py-4 px-2 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${q.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' :
                                                    q.status === 'SENT' ? 'bg-blue-100 text-blue-600' :
                                                        q.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-600' :
                                                            'bg-amber-100 text-amber-600'
                                                }`}>
                                                {q.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-right space-x-2">
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="PDF"><FaFilePdf /></button>
                                            <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Convert to Invoice"><FaExchangeAlt /></button>
                                            <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Delete"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
