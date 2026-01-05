'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaUser, FaPhone, FaMapMarkerAlt, FaFileInvoice, FaMoneyBillWave, FaExclamationCircle, FaEdit } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function CustomerDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { customers, invoices, fetchInvoices, fetchCustomers } = useStore() as any;
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (customers.length === 0) fetchCustomers();
        if (invoices.length === 0) fetchInvoices();
    }, []);

    if (!isClient) return null;

    const customer = customers.find((c: any) => c.id === id);

    if (!customer) {
        return (
            <div className="p-8 text-center">
                <FaExclamationCircle className="mx-auto text-4xl text-red-400 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Customer Not Found</h2>
                <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go Back</button>
            </div>
        );
    }

    // Filter invoices for this customer
    const customerInvoices = invoices
        .filter((inv: any) => inv.customer_id === id || inv.customer?.id === id)
        .sort((a: any, b: any) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime());

    const totalSales = customerInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
    const totalPaid = customerInvoices.reduce((sum: number, inv: any) => sum + (inv.paid_amount || 0), 0);
    const totalDue = totalSales - totalPaid;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0e7490] text-white px-6 py-5 flex items-center justify-between shadow-lg z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="hover:bg-white/10 p-2 -ml-2 rounded-full transition-colors">
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">{customer.name}</h1>
                        <p className="text-xs text-white/70 font-medium">Customer History & Summary</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        toast('Coming soon: Edit from this page');
                    }}
                    className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all border border-white/10"
                >
                    <FaEdit className="text-lg" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <FaFileInvoice />
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase">Total Sales</span>
                        </div>
                        <p className="text-2xl font-black text-slate-800">₹{totalSales.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <FaMoneyBillWave />
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase">Total Paid</span>
                        </div>
                        <p className="text-2xl font-black text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                                <FaExclamationCircle />
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase">Outstanding</span>
                        </div>
                        <p className="text-2xl font-black text-orange-600">₹{totalDue.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-800">Basic Information</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        {customer.phone && (
                            <div className="flex items-center gap-4">
                                <FaPhone className="text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                                    <p className="font-bold text-slate-700">{customer.phone}</p>
                                </div>
                            </div>
                        )}
                        {customer.gstin && (
                            <div className="flex items-center gap-4">
                                <FaUser className="text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">GSTIN</p>
                                    <p className="font-bold text-slate-700">{customer.gstin}</p>
                                </div>
                            </div>
                        )}
                        {customer.address && (
                            <div className="flex items-start gap-4 md:col-span-2">
                                <FaMapMarkerAlt className="text-slate-400 mt-1" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Address</p>
                                    <p className="font-bold text-slate-700 leading-relaxed">{customer.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Invoice History */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-bold text-slate-800">Invoice History</h2>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-bold">
                            {customerInvoices.length} {customerInvoices.length === 1 ? 'Bill' : 'Bills'}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Invoice No.</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {customerInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <p className="text-slate-400 font-medium">No invoice history found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    customerInvoices.map((inv: any) => (
                                        <tr
                                            key={inv.id}
                                            className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/dashboard/invoices`)}
                                        >
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-bold text-slate-700">
                                                    {new Date(inv.invoice_date).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-black text-blue-600 group-hover:underline">
                                                    {inv.invoice_number}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                                    inv.status === 'PARTIAL' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <p className="text-sm font-black text-slate-800">
                                                    ₹{inv.total_amount?.toLocaleString('en-IN')}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {inv.paid_amount > 0 ? `Paid: ₹${inv.paid_amount}` : 'Unpaid'}
                                                </p>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
