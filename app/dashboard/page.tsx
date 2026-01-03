'use client';

import { FaFileInvoice, FaRupeeSign, FaUsers, FaBox, FaChartLine, FaClock, FaReceipt, FaUserPlus, FaBoxOpen, FaTimes, FaStore, FaCog } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Cell } from 'recharts';
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
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [showSetupBanner, setShowSetupBanner] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [chartView, setChartView] = useState('area'); // 'area' or 'candle'

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
    const { totalSales, totalProfit, invoiceCount } = getAnalytics(period, customRange);
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

    // Process Invoices to get actual trend data
    const getTrendData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();

        // Initialize 6 months of data
        const trend: any[] = months.slice(0, 6).map(m => ({
            name: m,
            sales: 0,
            profit: 0,
            high: 0,
            low: 999999,
            open: 0,
            close: 0,
        }));

        invoices.forEach((inv: any) => {
            const date = new Date(inv.invoice_date);
            if (date.getFullYear() === currentYear) {
                const monthIdx = date.getMonth();
                if (monthIdx < 6) {
                    const amount = parseFloat(inv.total_amount) || 0;
                    trend[monthIdx].sales += amount;

                    // Simple profit estimation for trend
                    trend[monthIdx].profit += amount * 0.2;

                    // OHLC simulated from invoices
                    if (amount > trend[monthIdx].high) trend[monthIdx].high = amount;
                    if (amount < trend[monthIdx].low) trend[monthIdx].low = amount;

                    // Open/Close based on first/last invoice of month
                    if (trend[monthIdx].open === 0) trend[monthIdx].open = amount;
                    trend[monthIdx].close = amount;
                }
            }
        });

        return trend.map(t => ({
            ...t,
            low: t.low === 999999 ? 0 : t.low,
            candle: [t.sales * 0.7, t.sales], // Body
            wick: [t.sales * 0.6, t.sales * 1.1] // Wick
        }));
    };

    const monthlyTrend = getTrendData();

    // Calculate Today's Sales
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todaySales = invoices
        .filter((inv: any) => {
            const invDate = new Date(inv.invoice_date).toLocaleDateString('en-CA');
            return invDate === todayStr;
        })
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

    return (
        <div className="space-y-6 pb-20">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FaClock className="text-amber-500 text-sm" />
                        <span className="text-xs md:text-sm text-gray-500 font-bold bg-white px-5 py-1.5 rounded-full border border-gray-100 shadow-sm flex items-center justify-center gap-2 min-w-[160px]">
                            <span suppressHydrationWarning className="truncate">
                                {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full mx-1 flex-shrink-0"></span>
                            <span suppressHydrationWarning className="whitespace-nowrap">
                                {currentTime.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        {getGreeting()}, <span className="text-blue-600">{businessProfile.name || 'Owner'}</span>! 👋
                    </h1>
                </div>
            </div>

            {/* Stats Overview at the top */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Link
                            key={index}
                            href={stat.href}
                            className="bg-white rounded-3xl p-4 md:p-5 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300 group flex flex-col items-center justify-center text-center hover:scale-[1.02]"
                        >
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg mb-3 transform group-hover:scale-110 transition-transform`}>
                                <Icon className="text-xl" />
                            </div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase mb-1 tracking-wider">{stat.label}</p>
                            <p className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{stat.formattedValue}</p>
                        </Link>
                    );
                })}
            </div>

            {/* Professional 3D Action Boxes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Box 1: Quick Actions Hub */}
                <div className="group relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-[2px] shadow-2xl hover:shadow-indigo-500/50 transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 h-full">
                        {/* Glassmorphism overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                                    <FaFileInvoice className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Quick Actions</h2>
                                    <p className="text-xs text-slate-500 font-semibold">Create & Manage</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    href="/dashboard/invoices/new"
                                    className="group/btn flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover/btn:shadow-md transition-shadow">
                                            <FaFileInvoice className="text-indigo-600 text-lg" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">Create Invoice</p>
                                            <p className="text-xs text-slate-500">Generate new bill</p>
                                        </div>
                                    </div>
                                    <div className="text-indigo-600 group-hover/btn:translate-x-1 transition-transform">→</div>
                                </Link>

                                <Link
                                    href="/dashboard/customers"
                                    className="group/btn flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover/btn:shadow-md transition-shadow">
                                            <FaUserPlus className="text-emerald-600 text-lg" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">Add Customer</p>
                                            <p className="text-xs text-slate-500">Manage parties</p>
                                        </div>
                                    </div>
                                    <div className="text-emerald-600 group-hover/btn:translate-x-1 transition-transform">→</div>
                                </Link>

                                <Link
                                    href="/dashboard/inventory"
                                    className="group/btn flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover/btn:shadow-md transition-shadow">
                                            <FaBox className="text-orange-600 text-lg" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">Add Product</p>
                                            <p className="text-xs text-slate-500">Update inventory</p>
                                        </div>
                                    </div>
                                    <div className="text-orange-600 group-hover/btn:translate-x-1 transition-transform">→</div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Box 2: Business Insights */}
                <div className="group relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 rounded-3xl p-[2px] shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 h-full">
                        {/* Glassmorphism overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                                    <FaChartLine className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Business Insights</h2>
                                    <p className="text-xs text-slate-500 font-semibold">Key Metrics</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Pending Invoices Alert */}
                                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-bold text-slate-800">Pending Invoices</p>
                                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded-full">
                                            {invoices.filter((inv: any) => inv.status !== 'PAID').length}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        ₹{invoices.filter((inv: any) => inv.status !== 'PAID').reduce((acc: number, inv: any) => acc + (parseFloat(inv.total_amount) || 0), 0).toLocaleString('en-IN')} pending
                                    </p>
                                </div>

                                {/* Low Stock Alert */}
                                <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-bold text-slate-800">Low Stock Items</p>
                                        <span className="px-3 py-1 bg-amber-500 text-white text-xs font-black rounded-full">
                                            {lowStockItems}
                                        </span>
                                    </div>
                                    <Link href="/dashboard/inventory" className="text-xs text-amber-700 font-semibold hover:underline">
                                        View inventory →
                                    </Link>
                                </div>

                                {/* Quick Reports Link */}
                                <Link
                                    href="/dashboard/reports"
                                    className="group/btn flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover/btn:shadow-md transition-shadow">
                                            <FaChartLine className="text-blue-600 text-lg" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">View Reports</p>
                                            <p className="text-xs text-slate-500">Detailed analytics</p>
                                        </div>
                                    </div>
                                    <div className="text-blue-600 group-hover/btn:translate-x-1 transition-transform">→</div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Overview Header (Simplified) */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 shadow-xl text-center">
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{t.analyticsOverview}</h2>
                <p className="text-xs text-indigo-100 font-bold mt-1 uppercase tracking-widest">Business Performance Tracker</p>
            </div>

            {/* Period Filter Buttons - Separate Box */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg border border-slate-200">
                <p className="text-xs md:text-sm font-bold text-slate-800 mb-3 text-center">{t.selectPeriod}:</p>
                <div className="flex gap-2 md:gap-3 flex-wrap justify-center">
                    {[
                        { key: 'daily', label: t.daily, activeColor: 'from-blue-500 to-cyan-500' },
                        { key: 'weekly', label: t.weekly, activeColor: 'from-purple-500 to-pink-500' },
                        { key: 'monthly', label: t.monthly, activeColor: 'from-indigo-500 to-violet-500' },
                        { key: 'yearly', label: t.yearly, activeColor: 'from-emerald-500 to-teal-500' },
                        { key: 'custom', label: 'Custom', activeColor: 'from-orange-500 to-amber-500' }
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

                {period === 'custom' && (
                    <div className="flex items-center gap-4 mt-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex-1">
                            <label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1">From Date</label>
                            <input
                                type="date"
                                value={customRange.start}
                                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                                className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div className="text-slate-300 mt-4">→</div>
                        <div className="flex-1">
                            <label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1">To Date</label>
                            <input
                                type="date"
                                value={customRange.end}
                                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                                className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>


            {/* Setup Business Prompt - Dismissible */}
            {
                !businessProfile.gstin && showSetupBanner && (
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl shadow-indigo-500/20 animate-slideUp relative mx-4 md:mx-0">
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
                <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2 px-2">
                        <div className="text-center sm:text-left w-full sm:w-auto">
                            <h2 className="text-sm md:text-lg font-bold text-slate-800 text-center sm:text-left">{t.revenueAnalytics}</h2>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Income vs Profit trends</p>
                        </div>
                        <div className="flex items-center justify-center gap-3 text-[9px] md:text-xs bg-slate-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg self-center sm:self-auto">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span className="text-slate-600 font-medium">Sales</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-slate-600 font-medium">Profit</span>
                            </div>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg self-center sm:self-auto">
                            <button
                                onClick={() => setChartView('area')}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${chartView === 'area' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Standard
                            </button>
                            <button
                                onClick={() => setChartView('candle')}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${chartView === 'candle' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Candlestick
                            </button>
                        </div>
                    </div>
                    <div className="h-[200px] md:h-[280px] w-full px-2">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartView === 'area' ? (
                                <AreaChart data={monthlyTrend} margin={{ right: 20, left: -20, top: 5, bottom: 5 }}>
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
                            ) : (
                                <ComposedChart data={monthlyTrend} margin={{ right: 20, left: -20, top: 5, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={40} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100 text-[10px] md:text-xs">
                                                        <p className="font-bold text-slate-800 mb-2">{data.name} Analysis</p>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between gap-4">
                                                                <span className="text-slate-500">Total Sales:</span>
                                                                <span className="font-bold text-indigo-600">₹{data.sales.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between gap-4">
                                                                <span className="text-slate-500">Max Sale:</span>
                                                                <span className="font-bold text-emerald-600">₹{data.high.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between gap-4">
                                                                <span className="text-slate-500">Min Sale:</span>
                                                                <span className="font-bold text-amber-600">₹{data.low.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between gap-4 pt-1 border-t">
                                                                <span className="text-slate-500">Avg Profit (Est):</span>
                                                                <span className="font-bold text-purple-600">₹{data.profit.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    {/* Wick */}
                                    <Bar dataKey="wick" fill="#94a3b8" barSize={2} />
                                    {/* Body */}
                                    <Bar dataKey="candle" radius={[2, 2, 2, 2]} barSize={20}>
                                        {monthlyTrend.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.sales > entry.open ? '#10b981' : '#f43f5e'} />
                                        ))}
                                    </Bar>
                                </ComposedChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Sales - Bar Chart */}
                <div className="bg-white rounded-xl md:rounded-2xl shadow-soft border border-slate-100 p-6 md:p-6">
                    <div className="flex items-center justify-center mb-4 md:mb-6">
                        <div className="text-center">
                            <h2 className="text-sm md:text-lg font-bold text-slate-800 text-center">{t.weeklyPerformance}</h2>
                            <p className="text-xs text-slate-500 font-medium">Sales by day of the week</p>
                        </div>
                    </div>
                    <div className="h-[200px] md:h-[280px] w-full px-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} barCategoryGap="20%" margin={{ right: 20, left: -20, top: 5, bottom: 5 }}>
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
                <div className="bg-white rounded-xl md:rounded-2xl shadow-soft border border-slate-100 p-6 md:p-6">
                    <h2 className="text-sm md:text-lg font-bold text-slate-800 mb-4 md:mb-6 text-center">{t.topSellingProducts}</h2>
                    <div className="space-y-4 md:space-y-5 px-4">
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
                                    <div className="flex items-center justify-between mb-1.5 px-1">
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
                    <div className="p-5 md:p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-2">
                        <h2 className="text-sm md:text-lg font-bold text-slate-800 text-center w-full md:w-auto pl-2">{t.recentInvoices}</h2>
                        <Link href="/dashboard/invoices" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline self-end md:self-auto pr-10">{t.viewReports}</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                            <thead className="bg-indigo-600 text-white">
                                <tr>
                                    <th className="text-center py-4 px-4 pr-3 md:px-5 text-[10px] md:text-sm font-bold uppercase tracking-wider first:rounded-l-lg">{t.invoices}</th>
                                    <th className="text-left py-4 px-3 md:px-5 text-[10px] md:text-sm font-bold uppercase tracking-wider">{t.customer}</th>
                                    <th className="text-left py-4 px-3 md:px-5 text-[10px] md:text-sm font-bold uppercase tracking-wider">{t.date}</th>
                                    <th className="text-right py-4 px-3 md:px-5 text-[10px] md:text-sm font-bold uppercase tracking-wider">{t.amount}</th>
                                    <th className="text-center py-4 px-3 md:px-5 text-[10px] md:text-sm font-bold uppercase tracking-wider last:rounded-r-lg">{t.status}</th>
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
                                    (invoices || []).slice(0, 5).map((invoice: any, index: number) => {
                                        const safeTotal = Number(invoice?.total_amount) || 0;
                                        const safeDate = (d: any) => {
                                            try {
                                                const date = new Date(d);
                                                return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                                            } catch (e) { return '-'; }
                                        };
                                        return (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                <td className="text-center py-2.5 md:py-3 px-4 pr-3 md:px-5 text-[10px] md:text-sm font-semibold text-indigo-600">#{invoice?.invoice_number || 'N/A'}</td>
                                                <td className="py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-sm text-slate-700 font-medium truncate max-w-[100px]">{invoice?.customer?.name || 'Unknown'}</td>
                                                <td className="py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-sm text-slate-500">{safeDate(invoice?.invoice_date)}</td>
                                                <td className="py-2.5 md:py-3 px-3 md:px-5 text-[10px] md:text-sm text-slate-900 font-bold text-right">
                                                    ₹{safeTotal >= 1000 ? (safeTotal / 1000).toFixed(1) + 'k' : safeTotal.toLocaleString('en-IN')}
                                                </td>
                                                <td className="py-2.5 md:py-3 px-3 md:px-5 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold ${invoice?.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {invoice?.status || 'PAID'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
