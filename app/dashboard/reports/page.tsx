'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaChartLine, FaRupeeSign, FaFileInvoice, FaUsers } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ReportsPage() {
    const { getAnalytics } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [period, setPeriod] = useState('monthly');

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const { totalSales, totalProfit, invoiceCount } = getAnalytics(period);

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Business Reports</h1>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                    <option value="yearly">This Year</option>
                </select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                    return (
                        <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
                        </div>
                    );
                }
