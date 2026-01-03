'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useStore } from '@/lib/store';
import { FaChartLine, FaRupeeSign, FaFileInvoice, FaUsers } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

function ReportsContent() {
    const searchParams = useSearchParams();
    const { getAnalytics, fetchInvoices } = useStore();
    const [isClient, setIsClient] = useState(false);

    // Initialize period from URL or default to 'monthly'
    const [period, setPeriod] = useState('monthly');
    const [customRange, setCustomRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        setIsClient(true);
        fetchInvoices();

        // Set period from URL if available
        const p = searchParams.get('period');
        if (p) setPeriod(p);
    }, [searchParams]);

    if (!isClient) return null;

    const { totalSales, totalProfit, invoiceCount } = getAnalytics(period, customRange);

    // Dummy data for charts (in a real app, this would come from historical data)
    const chartData = [
        { name: 'Week 1', sales: totalSales * 0.2, profit: totalProfit * 0.2 },
        { name: 'Week 2', sales: totalSales * 0.3, profit: totalProfit * 0.3 },
        { name: 'Week 3', sales: totalSales * 0.4, profit: totalProfit * 0.4 },
        { name: 'Week 4', sales: totalSales * 0.1, profit: totalProfit * 0.1 },
    ];

    const stats = [
        {
            label: 'Total Revenue',
            value: `₹${totalSales.toLocaleString()}`,
            icon: FaRupeeSign,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Net Profit',
            value: `₹${totalProfit.toLocaleString()}`,
            icon: FaChartLine,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Total Invoices',
            value: invoiceCount,
            icon: FaFileInvoice,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Avg. Order Value',
            value: `₹${invoiceCount > 0 ? (totalSales / invoiceCount).toFixed(0) : 0}`,
            icon: FaUsers,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        }
    ];

    return (
        <div className="space-y-6 px-4 md:px-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Business Reports</h1>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {period === 'custom' && (
                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                            <input
                                type="date"
                                value={customRange.start}
                                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                                className="p-1.5 text-sm outline-none bg-transparent text-slate-600 font-medium"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="date"
                                value={customRange.end}
                                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                                className="p-1.5 text-sm outline-none bg-transparent text-slate-600 font-medium"
                            />
                        </div>
                    )}

                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 shadow-sm min-w-[140px]"
                    >
                        <option value="daily">Today</option>
                        <option value="weekly">This Week</option>
                        <option value="monthly">This Month</option>
                        <option value="yearly">This Year</option>
                        <option value="custom">Custom Date</option>
                    </select>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} bg-opacity-10 text-opacity-100`}>
                                <Icon className="text-xl" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Revenue Trend</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Profit vs Sales</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Profit & Loss Section */}
            <ProfitLossSection period={period} customRange={customRange} />
        </div>
    );
}

function ProfitLossSection({ period, customRange }: any) {
    const [plData, setPlData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPLData();
    }, [period, customRange]);

    const fetchPLData = async () => {
        try {
            let url = '/api/reports/profit-loss';

            if (period === 'custom') {
                url += `?start_date=${customRange.start}&end_date=${customRange.end}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            setPlData(data);
        } catch (error) {
            console.error('Error fetching P&L:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!plData) return null;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Profit & Loss Statement</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <p className="text-sm font-bold text-blue-700 mb-2">Total Revenue</p>
                    <p className="text-3xl font-black text-blue-600">₹{Number(plData.revenue.total).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-blue-600 mt-2">{plData.revenue.invoice_count} invoices</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                    <p className="text-sm font-bold text-orange-700 mb-2">Total Expenses</p>
                    <p className="text-3xl font-black text-orange-600">₹{Number(plData.expenses.total).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-orange-600 mt-2">{plData.expenses.count} transactions</p>
                </div>

                <div className={`bg-gradient-to-br rounded-xl p-6 border ${plData.profit.net_profit >= 0
                        ? 'from-green-50 to-emerald-50 border-green-200'
                        : 'from-red-50 to-rose-50 border-red-200'
                    }`}>
                    <p className={`text-sm font-bold mb-2 ${plData.profit.net_profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        Net Profit
                    </p>
                    <p className={`text-3xl font-black ${plData.profit.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{Number(plData.profit.net_profit).toLocaleString('en-IN')}
                    </p>
                    <p className={`text-xs mt-2 ${plData.profit.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {plData.profit.profit_margin}% margin
                    </p>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="border-t pt-6 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="font-bold text-slate-700">Revenue</span>
                    <span className="font-bold text-blue-600">+₹{Number(plData.revenue.total).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 pl-4">- Purchases</span>
                    <span className="text-red-600">-₹{Number(plData.purchases.total).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-y border-slate-200 font-bold">
                    <span className="text-slate-700">= Gross Profit</span>
                    <span className="text-emerald-600">₹{Number(plData.profit.gross_profit).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 pl-4">- Expenses</span>
                    <span className="text-red-600">-₹{Number(plData.expenses.total).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center py-4 border-t-2 border-slate-300 font-black text-lg">
                    <span className="text-slate-800">= Net Profit</span>
                    <span className={plData.profit.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₹{Number(plData.profit.net_profit).toLocaleString('en-IN')}
                    </span>
                </div>
            </div>

            {/* Expense Breakdown */}
            {plData.expenses.by_category.length > 0 && (
                <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Expense Breakdown by Category</h3>
                    <div className="space-y-3">
                        {plData.expenses.by_category.map((cat: any, index: number) => (
                            <div key={index} className="flex items-center justify-between py-2 px-4 bg-slate-50 rounded-lg">
                                <span className="text-slate-700 font-medium">{cat.category}</span>
                                <span className="font-bold text-slate-800">₹{Number(cat.amount).toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


export default function ReportsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReportsContent />
        </Suspense>
    );
}
