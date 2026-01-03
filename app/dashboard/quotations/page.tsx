'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEye, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaFileInvoice } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function QuotationsPage() {
    const router = useRouter();
    const [quotations, setQuotations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchQuotations();
    }, [filter]);

    const fetchQuotations = async () => {
        try {
            const url = filter === 'ALL'
                ? '/api/quotations'
                : `/api/quotations?status=${filter}`;

            const res = await fetch(url);
            const data = await res.json();
            setQuotations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching quotations:', error);
            toast.error('Failed to load quotations');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: any = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            ACCEPTED: 'bg-green-100 text-green-700',
            REJECTED: 'bg-red-100 text-red-700',
            CONVERTED: 'bg-blue-100 text-blue-700'
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    const convertToInvoice = async (quotationId: string) => {
        if (!confirm('Convert this quotation to invoice?')) return;

        try {
            const res = await fetch('/api/quotations/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quotation_id: quotationId })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success('Quotation converted to invoice successfully!');
                fetchQuotations();
                router.push(`/dashboard/invoices`);
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to convert');
            }
        } catch (error) {
            toast.error('Error converting quotation');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Quotations</h1>
                    <p className="text-sm text-slate-600 mt-1">Manage all your quotations and estimates</p>
                </div>
                <Link
                    href="/dashboard/quotations/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg"
                >
                    <FaPlus /> New Quotation
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200">
                <div className="flex gap-2 flex-wrap">
                    {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'CONVERTED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filter === status
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quotations List */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                {quotations.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaFileInvoice className="text-slate-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No Quotations Yet</h3>
                        <p className="text-sm text-slate-500 mt-2">Create your first quotation to get started</p>
                        <Link
                            href="/dashboard/quotations/new"
                            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                        >
                            <FaPlus /> Create Quotation
                        </Link>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Quotation #
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {quotations.map((quotation) => (
                                <tr key={quotation.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                                        {quotation.quotation_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                        {quotation.customer_name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {new Date(quotation.quotation_date).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-slate-800">
                                        ₹{Number(quotation.total_amount).toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(quotation.status)}`}>
                                            {quotation.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="View"
                                            >
                                                <FaEye />
                                            </button>
                                            {quotation.status === 'PENDING' && (
                                                <button
                                                    onClick={() => convertToInvoice(quotation.id)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    title="Convert to Invoice"
                                                >
                                                    <FaFileInvoice />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
