'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaFileInvoice, FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import { useStore } from '@/lib/store';

export default function QuotationsPage() {
    const { quotations, fetchQuotations } = useStore();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchQuotations();
    }, []);

    const filteredQuotations = quotations.filter((q: any) =>
        (q.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.quotation_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quotations</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your quotations and convert to invoices</p>
                </div>
                <Link
                    href="/dashboard/quotations/new"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <FaPlus /> New Quotation
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative mb-1 mx-4 md:mx-0" style={{ marginTop: '5px' }}></div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200">
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by customer or quotation number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                </div>
            </div>

            {/* Quotations List */}
            <div className="relative mb-1 mx-4 md:mx-0" style={{ marginTop: '5px' }}></div>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-bold uppercase tracking-wider">Quotation #</th>
                                <th className="text-left py-4 px-6 text-sm font-bold uppercase tracking-wider">Customer</th>
                                <th className="text-left py-4 px-6 text-sm font-bold uppercase tracking-wider">Date</th>
                                <th className="text-right py-4 px-6 text-sm font-bold uppercase tracking-wider">Amount</th>
                                <th className="text-center py-4 px-6 text-sm font-bold uppercase tracking-wider">Status</th>
                                <th className="text-center py-4 px-6 text-sm font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-500 font-bold">
                                        No quotations found. Create your first quotation!
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotations.map((quotation: any) => (
                                    <tr key={quotation.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 font-bold text-blue-600">
                                            <Link href={`/dashboard/quotations/${quotation.id}`} className="hover:underline">
                                                {quotation.quotation_number}
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6 text-slate-700 font-medium">{quotation.customer_name}</td>
                                        <td className="py-4 px-6 text-slate-600">
                                            {new Date(quotation.quotation_date).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="py-4 px-6 text-right font-bold text-slate-800">
                                            ₹{parseFloat(quotation.total_amount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${quotation.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                                                quotation.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {quotation.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button className="text-blue-600 hover:text-blue-800 font-bold text-sm whitespace-nowrap">
                                                <FaFileInvoice className="inline mr-1" /> Convert to Invoice
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats */}
            <div className="relative mb-1 mx-4 md:mx-0" style={{ marginTop: '5px' }}></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-90">Total Quotations</h3>
                    <p className="text-4xl font-black mt-2">{quotations.length}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-90">Accepted</h3>
                    <p className="text-4xl font-black mt-2">{quotations.filter((q: any) => q.status === 'Accepted').length}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-90">Pending</h3>
                    <p className="text-4xl font-black mt-2">{quotations.filter((q: any) => q.status === 'Pending').length}</p>
                </div>
            </div>
        </div>
    );
}
