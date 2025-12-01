'use client';

import { FaFileInvoice, FaRupeeSign, FaUsers, FaBox, FaArrowUp, FaArrowDown, FaPlus, FaDownload, FaEllipsisH, FaStore, FaChartLine } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function DashboardPage() {
    const { invoices, customers, products, businessProfile, getAnalytics, getTopProducts } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [period, setPeriod] = useState('monthly'); // daily, weekly, monthly, yearly
    const [showSetupBanner, setShowSetupBanner] = useState(true);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    // Get Analytics Data
    const { totalSales, totalProfit, invoiceCount } = getAnalytics(period);
    const topProducts = getTopProducts() || [];
    const activeCustomers = (customers || []).length;
    // Fix: Add explicit type check and safety check
    const lowStockItems = (products || []).filter((p: any) => p.stock_quantity < (p.low_stock_alert || 10)).length;

    // Calculate Profit Margin
    const profitMargin = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0;

    // Dummy Chart Data (Dynamic based on period)
    const chartData = [
        { name: 'Week 1', sales: totalSales * 0.2, profit: totalProfit * 0.2 },
        { name: 'Week 2', sales: totalSales * 0.5, profit: totalProfit * 0.5 },
        { name: 'Week 3', sales: totalSales * 0.8, profit: totalProfit * 0.8 },
        { name: 'Current', sales: totalSales, profit: totalProfit },
    ];

    const stats = [
        {
            icon: FaRupeeSign,
            label: 'Total Revenue',
            value: `₹${totalSales.toLocaleString('en-IN')}`,
            subtext: `${period.charAt(0).toUpperCase() + period.slice(1)} Sales`,
            color: 'from-indigo-500 to-blue-600',
            shadow: 'shadow-indigo-500/20'
        },
        {
            icon: FaChartLine,
            label: 'Net Profit',
            value: `₹${totalProfit.toLocaleString('en-IN')}`,
            subtext: `${profitMargin}% Margin`,
            color: 'from-emerald-500 to-teal-600',
            shadow: 'shadow-emerald-500/20'
        },
        {
            icon: FaFileInvoice,
            label: 'Invoices',
            value: invoiceCount,
            subtext: 'Generated',
            color: 'from-violet-500 to-purple-600',
            shadow: 'shadow-violet-500/20'
        },
        {
            icon: FaBox,
            label: 'Low Stock',
            value: lowStockItems,
            subtext: 'Items Alert',
            color: 'from-amber-500 to-orange-600',
            shadow: 'shadow-amber-500/20'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Overview</h1>
                    <p className="text-slate-500 text-sm font-medium">Track your business performance.</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${period === p
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Setup Business Prompt */}
            {!businessProfile.gstin && (
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-500/20 animate-slideUp">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <FaStore className="text-3xl" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Setup Your Business</h2>
                                <p className="text-indigo-100 mt-1">Add your GSTIN and business details to start invoicing professionally.</p>
                            </div>
                        </div>
                        <Link href="/dashboard/settings" className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition shadow-lg whitespace-nowrap">
                            Setup Now
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-1">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100 hover:shadow-lg transition-all duration-300 group cursor-default"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadow} text-white transform group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="text-xl" />
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    <FaArrowUp /> 12%
                                </div>
                            </div>
                            <div>
                                <h3 className="text-slate-500 text-sm font-semibold mb-1">{stat.label}</h3>
                                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</h2>
                                <p className="text-xs text-slate-400 mt-2 font-medium">{stat.subtext}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Setup Business Prompt - Dismissible */}
            {!businessProfile.gstin && showSetupBanner && (
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-indigo-500/20 animate-slideUp relative">
                    <button
                        onClick={() => setShowSetupBanner(false)}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Close banner"
                    >
                        <FaTimes size={18} />
                    </button>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="p-3 md:p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <FaStore className="text-2xl md:text-3xl" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold">Setup Your Business</h2>
                                <p className="text-indigo-100 mt-1 text-sm md:text-base">Add your GSTIN and business details to start invoicing professionally.</p>
                            </div>
                        </div>
                        <Link href="/dashboard/settings" className="px-6 md:px-8 py-2.5 md:py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition shadow-lg whitespace-nowrap text-sm md:text-base">
                            Setup Now
                        </Link>
                    </div>
                </div>
            )}

            {/* Charts & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Revenue Analytics</h2>
                            <p className="text-sm text-slate-500 font-medium">Income vs Profit trends</p>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <FaEllipsisH />
                        </button>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Top Selling Products</h2>
                    <div className="space-y-6">
                        {topProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[250px] text-center">
                                <div className="p-4 bg-slate-50 rounded-full mb-3">
                                    <FaBox className="text-slate-300 text-2xl" />
                                </div>
                                <p className="text-slate-500 font-medium">No sales data yet.</p>
                                <p className="text-xs text-slate-400 mt-1">Start selling to see products here.</p>
                            </div>
                        ) : (
                            topProducts.map((product: any, index: number) => (
                                <div key={index} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-slate-700">{product.name}</span>
                                        <span className="text-sm font-bold text-slate-900">₹{product.sales.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="h-2.5 rounded-full bg-indigo-500 transition-all duration-1000 ease-out group-hover:bg-indigo-600"
                                            style={{ width: `${(product.sales / topProducts[0].sales) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">{product.quantity} units sold</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base md:text-lg font-bold text-slate-800">Recent Invoices</h2>
                    <Link href="/dashboard/invoices" className="text-xs md:text-sm text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
                                <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="text-left py-3 md:py-4 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="text-right py-3 md:py-4 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="text-center py-3 md:py-4 px-4 md:px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(invoices || []).length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 md:py-12 text-center text-slate-500 font-medium text-sm">
                                        No invoices yet. Create your first invoice!
                                    </td>
                                </tr>
                            ) : (
                                invoices.slice(0, 5).map((invoice: any, index: number) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-semibold text-indigo-600">#{invoice.invoice_number}</td>
                                        <td className="py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm text-slate-700 font-medium">{invoice.customer.name}</td>
                                        <td className="py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm text-slate-500">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                                        <td className="py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm text-slate-900 font-bold text-right">₹{invoice.total_amount}</td>
                                        <td className="py-3 md:py-4 px-4 md:px-6 text-center">
                                            <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                Paid
                                            </span>
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
