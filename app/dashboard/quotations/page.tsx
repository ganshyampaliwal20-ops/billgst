'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaFileInvoice, FaFilePdf, FaEdit, FaTrash, FaExchangeAlt, FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Quotation {
    id: string;
    quotation_number: string;
    customer: {
        name: string;
    };
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
            if (response.ok) {
                setQuotations(data);
            } else {
                toast.error('Failed to fetch quotations');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const filteredQuotations = quotations.filter(q =>
        q.quotation_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quotations</h1>
                    <p className="text-slate-500 text-sm">Create and manage your business estimations</p>
                </div>
                <Link
                    href="/dashboard/quotations/new"
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg font-bold"
                >
                    <FaPlus /> New Quotation
                </Link>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Quotations</p>
                    <p className="text-3xl font-black text-slate-800">{quotations.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Value</p>
                    <p className="text-3xl font-black text-indigo-600">
                        ₹{quotations.filter(q => q.status === 'PENDING').reduce((acc, q) => acc + parseFloat(q.total_amount), 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Converted</p>
                    <p className="text-3xl font-black text-emerald-600">
                        {quotations.filter(q => q.status === 'CONVERTED').length}
                    </p>
                </div>
            </div>

            {/* Search and Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by number or customer..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider">Number</th>
                                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider">Customer</th>
                                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider">Date</th>
                                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider">Amount</th>
                                <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider">Status</th>
                                <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 font-medium">Fetching quotations...</td>
                                </tr>
                            ) : filteredQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 font-medium">No quotations found</td>
                                </tr>
                            ) : (
                                filteredQuotations.map((q) => (
                                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-bold text-indigo-600">#{q.quotation_number}</td>
                                        <td className="py-4 px-6 text-sm text-slate-700 font-semibold">{q.customer?.name}</td>
                                        <td className="py-4 px-6 text-sm text-slate-500 font-medium">{new Date(q.quotation_date).toLocaleDateString()}</td>
                                        <td className="py-4 px-6 text-sm font-black text-slate-800">₹{parseFloat(q.total_amount).toLocaleString()}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${q.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-700' :
                                                q.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {q.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button title="View PDF" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100">
                                                    <FaFilePdf />
                                                </button>
                                                <button title="Edit" className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100">
                                                    <FaEdit />
                                                </button>
                                                <button title="Convert to Invoice" className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100">
                                                    <FaExchangeAlt />
                                                </button>
                                                <button title="Delete" className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100">
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
        </div>
    );
}
