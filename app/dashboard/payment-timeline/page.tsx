'use client';

import { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaExclamationTriangle, FaMoneyBillWave } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PaymentTimelinePage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/invoices');
            const data = await res.json();
            setInvoices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching invoices');
        } finally {
            setLoading(false);
        }
    };

    // Calculate payment statistics
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length;
    const partiallyPaid = invoices.filter(inv => inv.status === 'PARTIALLY_PAID').length;
    const unpaidInvoices = invoices.filter(inv => inv.status === 'UNPAID').length;
    const overdueInvoices = invoices.filter(inv => {
        if (inv.due_date && inv.status !== 'PAID') {
            return new Date(inv.due_date) < new Date();
        }
        return false;
    }).length;

    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
    const paidAmount = invoices.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);
    const outstandingAmount = totalAmount - paidAmount;

    // Chart data
    const chartData = [
        { name: 'Paid', value: paidInvoices, color: '#10B981' },
        { name: 'Partial', value: partiallyPaid, color: '#F59E0B' },
        { name: 'Unpaid', value: unpaidInvoices, color: '#EF4444' }
    ];

    // Upcoming payments
    const upcomingPayments = invoices
        .filter(inv => inv.due_date && inv.status !== 'PAID')
        .map(inv => ({
            ...inv,
            dueDate: new Date(inv.due_date),
            daysRemaining: Math.ceil((new Date(inv.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        }))
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .slice(0, 10);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Payment Timeline</h1>
                <p className="text-sm text-slate-600 mt-1">Track payment status and upcoming dues</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-slate-600">Total Outstanding</p>
                        <FaMoneyBillWave className="text-red-500 text-xl" />
                    </div>
                    <p className="text-3xl font-black text-red-600">₹{outstandingAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-500 mt-2">{unpaidInvoices + partiallyPaid} pending invoices</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-slate-600">Collected</p>
                        <FaCheckCircle className="text-green-500 text-xl" />
                    </div>
                    <p className="text-3xl font-black text-green-600">₹{paidAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-500 mt-2">{paidInvoices} paid invoices</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-slate-600">Overdue</p>
                        <FaExclamationTriangle className="text-orange-500 text-xl" />
                    </div>
                    <p className="text-3xl font-black text-orange-600">{overdueInvoices}</p>
                    <p className="text-xs text-slate-500 mt-2">Invoices past due date</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-slate-600">Collection Rate</p>
                        <FaClock className="text-blue-500 text-xl" />
                    </div>
                    <p className="text-3xl font-black text-blue-600">
                        {totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-xs text-slate-500 mt-2">Payment collection</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Status Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Payment Status Distribution</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Upcoming Payments */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Upcoming Payments</h2>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {upcomingPayments.length === 0 ? (
                            <p className="text-center text-slate-500 py-12">No upcoming payments</p>
                        ) : (
                            upcomingPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className={`p-4 rounded-xl border-2 ${payment.daysRemaining < 0
                                            ? 'bg-red-50 border-red-200'
                                            : payment.daysRemaining <= 7
                                                ? 'bg-orange-50 border-orange-200'
                                                : 'bg-blue-50 border-blue-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800">{payment.invoice_number}</p>
                                            <p className="text-sm text-slate-600">{payment.customer_name}</p>
                                        </div>
                                        <p className="font-bold text-slate-800">₹{Number(payment.total_amount).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-600">
                                            Due: {payment.dueDate.toLocaleDateString('en-IN')}
                                        </span>
                                        <span
                                            className={`font-bold ${payment.daysRemaining < 0
                                                    ? 'text-red-600'
                                                    : payment.daysRemaining <= 7
                                                        ? 'text-orange-600'
                                                        : 'text-blue-600'
                                                }`}
                                        >
                                            {payment.daysRemaining < 0
                                                ? `${Math.abs(payment.daysRemaining)} days overdue`
                                                : payment.daysRemaining === 0
                                                    ? 'Due today'
                                                    : `${payment.daysRemaining} days left`}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Payments Table */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">All Invoices</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Invoice</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Due Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Amount</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Paid</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {invoices.slice(0, 20).map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">{invoice.invoice_number}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{invoice.customer_name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-800">
                                        ₹{Number(invoice.total_amount).toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                                        ₹{Number(invoice.paid_amount || 0).toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${invoice.status === 'PAID'
                                                    ? 'bg-green-100 text-green-700'
                                                    : invoice.status === 'PARTIALLY_PAID'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {invoice.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
