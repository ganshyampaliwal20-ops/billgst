'use client';

import { FaFileInvoice, FaRupeeSign, FaUsers, FaBox, FaChartLine, FaClock, FaReceipt, FaUserPlus, FaBoxOpen, FaTimes, FaStore } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { translations } from '@/lib/translations';

export default function DashboardPage() {
    const {
        invoices, customers, products, businessProfile, settings,
        getAnalytics, getTopProducts,
        fetchCustomers, fetchProducts, fetchInvoices
    } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [period, setPeriod] = useState('monthly');
    const [showSetupBanner, setShowSetupBanner] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Get translations
    const t = translations[settings.language as keyof typeof translations] || translations.en;

    useEffect(() => {
        setIsClient(true);
        // Setup Banner State
        const bannerDismissed = localStorage.getItem('setupBannerDismissed');
        if (bannerDismissed) setShowSetupBanner(false);

        // Live Clock
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Load Data from DB
        fetchCustomers();
        fetchProducts();
        fetchInvoices();

        return () => clearInterval(timer);
    }, []);

    if (!isClient) return null;

    // Get Analytics Data
    const { totalSales, totalProfit, invoiceCount } = getAnalytics(period);
    const topProducts = getTopProducts() || [];
    const lowStockItems = (products || []).filter((p: any) => p.stock_quantity < (p.low_stock_alert || 10)).length;

    // Get current time greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t.goodMorning;
        if (hour < 17) return t.goodAfternoon;
        return t.goodEvening;
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

    // Calculate Today's Sales
    const today = new Date().toDateString();
    const todaySales = invoices
        .filter((inv: any) => new Date(inv.invoice_date).toDateString() === today)
        .reduce((acc: number, inv: any) => acc + (parseFloat(inv.total_amount) || 0), 0);

    const stats = [
        {
            icon: FaRupeeSign,
            label: t.todaysSales,
            value: todaySales,
            formattedValue: `₹${todaySales >= 100000 ? (todaySales / 100000).toFixed(1) + 'L' : todaySales.toLocaleString('en-IN')}`,
            subtext: 'vs Yesterday',
            color: 'from-blue-500 to-indigo-600',
            shadow: 'shadow-blue-500/20',
            trend: 'Now',
            trendUp: true,
            href: '/dashboard/reports?period=daily'
        },
        {
            icon: FaChartLine,
            label: t.totalRevenue,
            value: totalSales,
            formattedValue: `₹${totalSales >= 100000 ? (totalSales / 100000).toFixed(1) + 'L' : totalSales.toLocaleString('en-IN')}`,
            subtext: `${period === 'daily' ? t.daily : period === 'weekly' ? t.weekly : period === 'monthly' ? t.monthly : t.yearly} Sales`,
            color: 'from-violet-500 to-purple-600',
            shadow: 'shadow-violet-500/20',
            trend: '+12%',
            trendUp: true,
            href: '/dashboard/reports'
        },
        {
            icon: FaFileInvoice,
            label: t.invoices,
            value: invoiceCount,
            formattedValue: invoiceCount.toString(),
            subtext: 'Generated',
            color: 'from-emerald-500 to-teal-600',
            shadow: 'shadow-emerald-500/20',
            trend: '+5',
            trendUp: true,
            href: '/dashboard/invoices'
        },
        {
            icon: FaBox,
            label: t.lowStock,
            value: lowStockItems,
            formattedValue: lowStockItems.toString(),
            subtext: 'Items Alert',
            color: lowStockItems > 0 ? 'from-red-500 to-rose-600' : 'from-amber-500 to-orange-600',
            shadow: lowStockItems > 0 ? 'shadow-red-500/20' : 'shadow-amber-500/20',
            trend: lowStockItems > 0 ? '⚠️' : '✓',
            trendUp: lowStockItems === 0,
            href: '/dashboard/inventory'
        },
    ];

    // Quick Action Items
    const quickActions = [
        { icon: FaReceipt, label: t.newInvoice, href: '/dashboard/invoices/new', color: 'bg-indigo-500 hover:bg-indigo-600' },
        { icon: FaUserPlus, label: t.addCustomer, href: '/dashboard/customers', color: 'bg-emerald-500 hover:bg-emerald-600' },
        { icon: FaBoxOpen, label: t.addProduct, href: '/dashboard/inventory', color: 'bg-violet-500 hover:bg-violet-600' },
        { icon: FaChartLine, label: t.viewReports, href: '/dashboard/reports', color: 'bg-amber-500 hover:bg-amber-600' },
    ];

    return (
        <div className="space-y-8 md:space-y-10 px-4 md:px-0">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FaClock className="text-amber-500 text-sm" />
                        <span className="text-xs md:text-sm text-gray-500 font-bold bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                            <span suppressHydrationWarning>
                                {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                            <span suppressHydrationWarning>
                                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        {getGreeting()}, <span className="text-amber-500">{businessProfile.name || 'Owner'}</span>! 👋
                    </h1>
                </div>
            </div>

            {/* Quick Actions - With White Border Container (Reverted Position) */}
            <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 md:p-8 shadow-xl mx-2 md:mx-0 text-center flex flex-col items-center justify-center">
                <h2 className="text-xl md:text-3xl font-bold text-white tracking-wide">{t.analyticsOverview}</h2>
                <p className="text-sm md:text-base text-indigo-100 font-medium mt-1">Track your business performance</p>
            </div>

            {/* Period Filter Buttons - Separate Box */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg border border-slate-200">
                <p className="text-xs md:text-sm font-semibold text-slate-600 mb-3">{t.selectPeriod}:</p>
                <div className="flex gap-2 md:gap-3 flex-wrap">
                    {[
                        { key: 'daily', label: t.daily, activeColor: 'from-blue-500 to-cyan-500' },
                        { key: 'weekly', label: t.weekly, activeColor: 'from-purple-500 to-pink-500' },
                        { key: 'monthly', label: t.monthly, activeColor: 'from-indigo-500 to-violet-500' },
                        { key: 'yearly', label: t.yearly, activeColor: 'from-emerald-500 to-teal-500' }
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

            {/* Stats Cards - Premium Container (Reverted Position) */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 md:p-8 shadow-lg border border-slate-200">
                <h1 className="text-base md:text-lg font-bold text-slate-700 mb-5 md:mb-6 px-1">{t.businessOverview}</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Link
                                key={index}
                                href={stat.href}
                                className="bg-white rounded-2xl p-4 md:p-5 shadow-md border border-slate-100 hover:shadow-xl transition-all duration-300 group min-h-[120px] flex flex-col items-center justify-center text-center hover:scale-[1.02]"
                            >
                                {/* Icon */}
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg mb-3 transform group-hover:scale-110 transition-transform`}>
                                    <Icon className="text-xl" />
                                </div>

                                {/* Label */}
                                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase mb-1">
                                    {stat.label}
                                </p>

                                {/* Value */}
                                <p className="text-xl md:text-2xl font-extrabold text-slate-800 mb-1">
                                    {stat.formattedValue}
                                </p>

                                {/* Subtext with Trend */}
                                <div className="flex items-center gap-1.5 mt-auto">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stat.trendUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {stat.trend}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {stat.subtext}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Setup Business Prompt - Dismissible */}
            {
                !businessProfile.gstin && showSetupBanner && (
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl shadow-indigo-500/20 animate-slideUp relative">
                        <button
                            onClick={() => {
                                setShowSetupBanner(false);
                                localStorage.setItem('setupBannerDismissed', 'true');
                            }}
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
                                    <h2 className="text-base md:text-xl font-bold">{t.setupBusiness}</h2>
                                    <p className="text-indigo-100 text-xs md:text-sm mt-0.5">Add GSTIN and details to start invoicing.</p>
                                </div>
                            </div>
                            <Link href="/dashboard/settings" className="px-4 md:px-6 py-2 bg-white text-indigo-600 font-bold rounded-lg md:rounded-xl hover:bg-indigo-50 transition shadow-lg text-xs md:text-sm whitespace-nowrap">
                                {t.setupNow}
                            </Link>
                        </div>
                    </div>
                )
            }

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Revenue Analytics - Area Chart */}
                <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
                        <div>
                            <h2 className="text-sm md:text-lg font-bold text-slate-800">{t.revenueAnalytics}</h2>
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
                            <h2 className="text-sm md:text-lg font-bold text-slate-800">{t.weeklyPerformance}</h2>
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
                    <h2 className="text-sm md:text-lg font-bold text-slate-800 mb-4 md:mb-6">{t.topSellingProducts}</h2>
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
                        <h2 className="text-sm md:text-lg font-bold text-slate-800">{t.recentInvoices}</h2>
                        <Link href="/dashboard/invoices" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">{t.viewReports}</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">{t.invoices}</th>
                                    <th className="text-left py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">{t.customer}</th>
                                    <th className="text-left py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">{t.date}</th>
                                    <th className="text-right py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">{t.amount}</th>
                                    <th className="text-center py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">{t.status}</th>
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
