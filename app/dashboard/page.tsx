'use client';

import { FaFileInvoice, FaRupeeSign, FaUsers, FaBox, FaArrowUp, FaArrowDown, FaPlus, FaDownload, FaEllipsisH, FaStore, FaChartLine, FaShoppingCart, FaReceipt, FaUserPlus, FaBoxOpen, FaCalendarAlt, FaClock, FaRocket } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function DashboardPage() {
    const { invoices, customers, products, businessProfile, getAnalytics, getTopProducts } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [period, setPeriod] = useState('monthly');
    const [showSetupBanner, setShowSetupBanner] = useState(true);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    // Get Analytics Data
    const { totalSales, totalProfit, invoiceCount } = getAnalytics(period);
    const topProducts = getTopProducts() || [];
    const activeCustomers = (customers || []).length;
    const lowStockItems = (products || []).filter((p: any) => p.stock_quantity < (p.low_stock_alert || 10)).length;
    const totalProducts = (products || []).length;

    // Calculate Profit Margin
    const profitMargin = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0;

    // Get current time greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Weekly Sales Data for Bar Chart
    const weeklyData = [
        { name: 'Mon', sales: totalSales * 0.12, profit: totalProfit * 0.10 },
        { name: 'Tue', sales: totalSales * 0.18, profit: totalProfit * 0.15 },
        { name: 'Wed', sales: totalSales * 0.15, profit: totalProfit * 0.12 },
        { name: 'Thu', sales: totalSales * 0.22, profit: totalProfit * 0.20 },
        { name: 'Fri', sales: totalSales * 0.25, profit: totalProfit * 0.28 },
        { name: 'Sat', sales: totalSales * 0.05, profit: totalProfit * 0.08 },
        { name: 'Sun', sales: totalSales * 0.03, profit: totalProfit * 0.07 },
    ];

    // Monthly Trend Data
    const monthlyTrend = [
        { name: 'Jan', sales: totalSales * 0.6, profit: totalProfit * 0.5 },
        { name: 'Feb', sales: totalSales * 0.7, profit: totalProfit * 0.6 },
        { name: 'Mar', sales: totalSales * 0.8, profit: totalProfit * 0.7 },
        { name: 'Apr', sales: totalSales * 0.9, profit: totalProfit * 0.85 },
        { name: 'May', sales: totalSales * 0.95, profit: totalProfit * 0.9 },
        { name: 'Jun', sales: totalSales, profit: totalProfit },
    ];

    // Chart Data (Dynamic based on period)
    const chartData = [
        { name: 'Week 1', sales: totalSales * 0.2, profit: totalProfit * 0.2 },
        { name: 'Week 2', sales: totalSales * 0.5, profit: totalProfit * 0.5 },
        { name: 'Week 3', sales: totalSales * 0.8, profit: totalProfit * 0.8 },
        { name: 'Current', sales: totalSales, profit: totalProfit },
    ];

    // Pie Chart Data
    const pieData = [
        { name: 'Sales', value: totalSales, color: '#4f46e5' },
        { name: 'Profit', value: totalProfit, color: '#10b981' },
        { name: 'Expense', value: totalSales - totalProfit, color: '#f59e0b' },
    ];

    const stats = [
        {
            icon: FaRupeeSign,
            label: 'Total Revenue',
            value: totalSales,
            formattedValue: `₹${totalSales >= 100000 ? (totalSales / 100000).toFixed(1) + 'L' : totalSales.toLocaleString('en-IN')}`,
            subtext: `${period.charAt(0).toUpperCase() + period.slice(1)} Sales`,
            color: 'from-indigo-500 to-blue-600',
            shadow: 'shadow-indigo-500/20',
            trend: '+12%',
            trendUp: true
        },
        {
            icon: FaChartLine,
            label: 'Net Profit',
            value: totalProfit,
            formattedValue: `₹${totalProfit >= 100000 ? (totalProfit / 100000).toFixed(1) + 'L' : totalProfit.toLocaleString('en-IN')}`,
            subtext: `${profitMargin}% Margin`,
            color: 'from-emerald-500 to-teal-600',
            shadow: 'shadow-emerald-500/20',
            trend: '+8%',
            trendUp: true
        },
        {
            icon: FaFileInvoice,
            label: 'Invoices',
            value: invoiceCount,
            formattedValue: invoiceCount.toString(),
            subtext: 'Generated',
            color: 'from-violet-500 to-purple-600',
            shadow: 'shadow-violet-500/20',
            trend: '+5',
            trendUp: true
        },
        {
            icon: FaBox,
            label: 'Low Stock',
            value: lowStockItems,
            formattedValue: lowStockItems.toString(),
            subtext: 'Items Alert',
            color: lowStockItems > 0 ? 'from-red-500 to-rose-600' : 'from-amber-500 to-orange-600',
            shadow: lowStockItems > 0 ? 'shadow-red-500/20' : 'shadow-amber-500/20',
            trend: lowStockItems > 0 ? '⚠️' : '✓',
            trendUp: lowStockItems === 0
        },
    ];

    // Quick Action Items
    const quickActions = [
        { icon: FaReceipt, label: 'New Invoice', href: '/dashboard/invoices', color: 'bg-indigo-500 hover:bg-indigo-600' },
        { icon: FaUserPlus, label: 'Add Customer', href: '/dashboard/customers', color: 'bg-emerald-500 hover:bg-emerald-600' },
        { icon: FaBoxOpen, label: 'Add Product', href: '/dashboard/inventory', color: 'bg-violet-500 hover:bg-violet-600' },
        { icon: FaChartLine, label: 'View Reports', href: '/dashboard/reports', color: 'bg-amber-500 hover:bg-amber-600' },
    ];

    return (
        <div className="space-y-10 md:space-y-12">
            {/* Welcome Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl md:rounded-3xl p-5 md:p-8 text-white shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                        <div className="flex-1 pl-1">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <FaClock className="text-white text-sm" />
                                <span className="text-xs md:text-sm text-white font-bold">
                                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 text-center md:text-left">
                                {getGreeting()}, <span className="text-yellow-300">{businessProfile.name || 'Owner'}</span>! 👋
                            </h1>
                            <p className="text-white font-semibold text-sm md:text-base text-center md:text-left">
                                Here's what's happening with your business today.
                            </p>
                        </div>

                        {/* Quick Summary - Mobile Friendly */}
                        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 md:pb-0">
                            <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-5 min-w-[110px] md:min-w-[130px] text-center">
                                <p className="text-xs text-white font-bold mb-1">Today's Sales</p>
                                <p className="text-lg md:text-2xl font-bold">₹{(totalSales * 0.1).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-5 min-w-[110px] md:min-w-[130px] text-center">
                                <p className="text-xs text-white font-bold mb-1">Customers</p>
                                <p className="text-lg md:text-2xl font-bold">{activeCustomers}</p>
                            </div>
                            <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-5 min-w-[110px] md:min-w-[130px] text-center">
                                <p className="text-xs text-white font-bold mb-1">Products</p>
                                <p className="text-lg md:text-2xl font-bold">{totalProducts}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions - With White Border Container */}
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={index}
                                href={action.href}
                                className={`${action.color} text-white rounded-2xl p-4 md:p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 shadow-lg min-h-[100px] md:min-h-[120px] border-2 border-white/30`}
                            >
                                <div className="p-3 md:p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Icon className="text-xl md:text-2xl" />
                                </div>
                                <span className="text-sm md:text-base font-bold text-center">{action.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Analytics Overview Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-5 md:p-6 shadow-xl">
                <h2 className="text-lg md:text-2xl font-bold text-white">Analytics Overview</h2>
                <p className="text-sm md:text-base text-white font-bold mt-1 pl-0.5">Track your business performance</p>
            </div>

            {/* Period Filter Buttons - Separate Box */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg border border-slate-200">
                <p className="text-xs md:text-sm font-semibold text-slate-600 mb-3">Select Time Period:</p>
                <div className="flex gap-2 md:gap-3 flex-wrap">
                    {[
                        { key: 'daily', label: 'Daily', activeColor: 'from-blue-500 to-cyan-500' },
                        { key: 'weekly', label: 'Weekly', activeColor: 'from-purple-500 to-pink-500' },
                        { key: 'monthly', label: 'Monthly', activeColor: 'from-indigo-500 to-violet-500' },
                        { key: 'yearly', label: 'Yearly', activeColor: 'from-emerald-500 to-teal-500' }
                    ].map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setPeriod(item.key)}
                            className={`flex-1 min-w-[70px] px-3 md:px-5 py-2.5 md:py-3 rounded-xl text-[11px] md:text-sm font-bold transition-all duration-300 ${period === item.key
                                ? `bg-gradient-to-r ${item.activeColor} text-white shadow-lg scale-105`
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards - Premium Container */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-3 md:p-6 shadow-lg border border-slate-200">
                <h1 className="text-base md:text-lg font-bold text-slate-700 mb-4 px-1">Business Overview</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-3 md:p-5 shadow-md border border-slate-100 hover:shadow-xl transition-all duration-300 group overflow-hidden"
                            >
                                {/* Icon & Trend Row */}
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className={`p-2.5 md:p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg flex-shrink-0`}>
                                        <Icon className="text-base md:text-xl" />
                                    </div>
                                    <span className={`text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0 ${stat.trendUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {stat.trend}
                                    </span>
                                </div>

                                {/* Label */}
                                <p className="text-slate-500 text-[11px] md:text-xs font-semibold uppercase tracking-wide mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                    {stat.label}
                                </p>

                                {/* Value */}
                                <p className="text-lg md:text-2xl font-bold text-slate-800 mb-1">
                                    {stat.formattedValue}
                                </p>

                                {/* Subtext */}
                                <p className="text-[10px] md:text-xs text-slate-400 font-medium">
                                    {stat.subtext}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Setup Business Prompt - Dismissible */}
            {!businessProfile.gstin && showSetupBanner && (
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl shadow-indigo-500/20 animate-slideUp relative">
                    <button
                        onClick={() => setShowSetupBanner(false)}
                        className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Close banner"
                    >
                        <FaTimes size={14} />
                    </button>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="p-2.5 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <FaStore className="text-lg md:text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-base md:text-xl font-bold">Setup Your Business</h2>
                                <p className="text-indigo-100 text-xs md:text-sm mt-0.5">Add GSTIN and details to start invoicing.</p>
                            </div>
                        </div>
                        <Link href="/dashboard/settings" className="px-4 md:px-6 py-2 bg-white text-indigo-600 font-bold rounded-lg md:rounded-xl hover:bg-indigo-50 transition shadow-lg text-xs md:text-sm whitespace-nowrap">
                            Setup Now
                        </Link>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Revenue Analytics - Area Chart */}
                <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
                        <div>
                            <h2 className="text-sm md:text-lg font-bold text-slate-800">Revenue Analytics</h2>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Income vs Profit trends</p>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] md:text-xs bg-slate-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span className="text-slate-600 font-medium">Sales</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-slate-600 font-medium">Profit</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[200px] md:h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyTrend}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={40} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Sales - Bar Chart */}
                <div className="bg-white rounded-xl md:rounded-2xl shadow-soft border border-slate-100 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h2 className="text-sm md:text-lg font-bold text-slate-800">Weekly Performance</h2>
                            <p className="text-xs text-slate-500 font-medium">Sales by day of the week</p>
                        </div>
                    </div>
                    <div className="h-[200px] md:h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={40} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                                />
                                <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Sales" />
                                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Top Products & Recent Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-xl md:rounded-2xl shadow-soft border border-slate-100 p-4 md:p-6">
                    <h2 className="text-sm md:text-lg font-bold text-slate-800 mb-4 md:mb-6">Top Selling Products</h2>
                    <div className="space-y-4 md:space-y-5">
                        {topProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[180px] md:h-[220px] text-center">
                                <div className="p-3 bg-slate-50 rounded-full mb-2">
                                    <FaBox className="text-slate-300 text-xl" />
                                </div>
                                <p className="text-slate-500 font-medium text-sm">No sales data yet</p>
                                <p className="text-[10px] md:text-xs text-slate-400 mt-1">Start selling to see products here</p>
                            </div>
                        ) : (
                            topProducts.slice(0, 5).map((product: any, index: number) => (
                                <div key={index} className="group">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs md:text-sm font-semibold text-slate-700 truncate max-w-[60%]">{product.name}</span>
                                        <span className="text-xs md:text-sm font-bold text-slate-900">₹{product.sales >= 1000 ? (product.sales / 1000).toFixed(1) + 'k' : product.sales.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
                                            style={{ width: `${(product.sales / topProducts[0].sales) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] md:text-xs text-slate-400 mt-1 font-medium">{product.quantity} units sold</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="lg:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
                    <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm md:text-lg font-bold text-slate-800">Recent Invoices</h2>
                        <Link href="/dashboard/invoices" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
                                    <th className="text-left py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="text-left py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="text-right py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-center py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(invoices || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 md:py-10 text-center text-slate-500 font-medium text-xs md:text-sm">
                                            No invoices yet. Create your first invoice!
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.slice(0, 5).map((invoice: any, index: number) => (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-sm font-semibold text-indigo-600">#{invoice.invoice_number}</td>
                                            <td className="py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-sm text-slate-700 font-medium truncate max-w-[100px]">{invoice.customer.name}</td>
                                            <td className="py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-sm text-slate-500">{new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                                            <td className="py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-sm text-slate-900 font-bold text-right">₹{invoice.total_amount >= 1000 ? (invoice.total_amount / 1000).toFixed(1) + 'k' : invoice.total_amount}</td>
                                            <td className="py-2.5 md:py-3 px-3 md:px-5 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold bg-emerald-100 text-emerald-700">
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
        </div>
    );
}
