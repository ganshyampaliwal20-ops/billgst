'use client';

import { FaFileInvoice, FaRupeeSign, FaUsers, FaBox, FaChartLine, FaClock, FaReceipt, FaUserPlus, FaBoxOpen, FaTimes, FaStore, FaCog, FaShareAlt, FaGlobe, FaBrain, FaBolt, FaWhatsapp, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Cell } from 'recharts';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { translations } from '@/lib/translations';


export default function DashboardPage() {
    const {
        invoices, customers, products, businessProfile, settings,
        getAnalytics, getTopProducts,
        fetchCustomers, fetchProducts, fetchInvoices, fetchBusinessProfile
    } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [period, setPeriod] = useState('monthly');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [showSetupBanner, setShowSetupBanner] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [chartView, setChartView] = useState('area'); // 'area' or 'candle'
    const [searchTerm, setSearchTerm] = useState('');


    // Get translations
    const t = translations[settings.language as keyof typeof translations] || translations.en;

    const handleShareStore = () => {
        if (!businessProfile.id) return;
        const url = `${window.location.origin}/s/${businessProfile.id}`;
        if (navigator.share) {
            navigator.share({
                title: businessProfile.name || 'Our Online Store',
                text: `Welcome to our online store! Check out our products and order on WhatsApp.`,
                url: url,
            }).catch(() => {
                navigator.clipboard.writeText(url);
                toast.success('Store link copied to clipboard!');
            });
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Store link copied to clipboard!');
        }
    };

    const handleSendReminder = (invoice: any) => {
        const customerName = invoice.customer?.name || 'Customer';
        const amount = invoice.total_amount;
        const invoiceNum = invoice.invoice_number;
        const businessName = businessProfile.name || 'Our Business';

        const message = `Namaste ${customerName} ji, hope you are doing well. This is a gentle reminder regarding your Invoice #${invoiceNum} of ₹${amount} from ${businessName}. Please process the payment at your earliest convenience. Thank you!`;

        const phone = invoice.customer?.phone?.replace(/\D/g, '') || '';
        if (!phone) {
            toast.error('Customer phone number missing!');
            return;
        }

        const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        toast.success('Opening WhatsApp...');
    };

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
        fetchBusinessProfile();

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
            color: lowStockItems > 0 ? 'from-red-500 to-rose-600' : 'from-emerald-500 to-teal-600',
            shadow: lowStockItems > 0 ? 'shadow-red-500/20' : 'shadow-emerald-500/20',
            trend: lowStockItems > 0 ? '⚠️' : '✓',
            trendUp: lowStockItems === 0,
            href: '/dashboard/inventory'
        },
    ];

    // Smart Insights Calculation
    const missingHsnCount = (products || []).filter((p: any) => !p.hsn_code).length;
    const invalidGstInvoices = (invoices || []).filter((inv: any) => inv.customer?.gstin && inv.customer.gstin.length !== 15).length;
    const healthScore = Math.max(0, 100 - (lowStockItems * 5) - (missingHsnCount * 2) - (invalidGstInvoices * 10));

    return (
        <div className="space-y-6 pb-20" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                <div>
                    <div className="flex items-center gap-2 mb-1" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
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

            {/* 1.5. GLOBAL SMART SEARCH - The Ease of Access */}
            <div className="mx-6 mb-4" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '5px' }}>
                <div className="relative group">
                    <div className="absolute inset-y-110 left-0 pl-4 flex items-center pointer-events-none">
                        <FaSearch className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Quick Search: Type customer name, invoice"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 bg-white border-4 border-slate-100 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 shadow-sm"
                    />
                    {searchTerm && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-96 overflow-y-auto p-4 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">Search Results</h4>
                            <div className="space-y-2">
                                {customers.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3).map((c: any) => (
                                    <Link key={c.id} href="/dashboard/customers" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><FaUsers size={12} /></div>
                                            <span className="font-bold text-slate-700">{c.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-blue-500 uppercase">Customer</span>
                                    </Link>
                                ))}
                                {invoices.filter((i: any) => i.invoice_number.toString().includes(searchTerm) || i.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3).map((i: any) => (
                                    <Link key={i.id} href="/dashboard/invoices" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600"><FaFileInvoice size={12} /></div>
                                            <span className="font-bold text-slate-700">#{i.invoice_number} - {i.customer?.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase">₹{i.total_amount}</span>
                                    </Link>
                                ))}
                                {products.filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 3).map((p: any) => (
                                    <Link key={p.id} href="/dashboard/inventory" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600"><FaBox size={12} /></div>
                                            <span className="font-bold text-slate-700">{p.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase">Stock: {p.stock_quantity}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-5 mt-8 mx-6" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '10px' }}>
                <Link href="/dashboard/invoices/new" className="bg-[#6366f1] h-28 md:h-36 rounded-2xl flex flex-col items-center justify-center text-white shadow-[0_6px_0_0_#4338ca] hover:shadow-[0_4px_0_0_#4338ca] hover:translate-y-1 active:shadow-none active:translate-y-[6px] transition-all border-b-0 border-indigo-700">
                    <div className="bg-white/20 p-3 rounded-xl mb-2">
                        <FaFileInvoice className="text-2xl md:text-3xl" />
                    </div>
                    <span className="font-bold text-sm md:text-base">{t.newInvoice}</span>
                </Link>
                <Link href="/dashboard/customers" className="bg-[#10b981] h-28 md:h-36 rounded-2xl flex flex-col items-center justify-center text-white shadow-[0_6px_0_0_#047857] hover:shadow-[0_4px_0_0_#047857] hover:translate-y-1 active:shadow-none active:translate-y-[6px] transition-all border-b-0 border-emerald-700">
                    <div className="bg-white/20 p-3 rounded-xl mb-2">
                        <FaUsers className="text-2xl md:text-3xl" />
                    </div>
                    <span className="font-bold text-sm md:text-base">{t.addCustomer}</span>
                </Link>
                <Link href="/dashboard/inventory" className="bg-[#8b5cf6] h-28 md:h-36 rounded-2xl flex flex-col items-center justify-center text-white shadow-[0_6px_0_0_#7c3aed] hover:shadow-[0_4px_0_0_#7c3aed] hover:translate-y-1 active:shadow-none active:translate-y-[6px] transition-all border-b-0 border-violet-700">
                    <div className="bg-white/20 p-3 rounded-xl mb-2">
                        <FaBox className="text-2xl md:text-3xl" />
                    </div>
                    <span className="font-bold text-sm md:text-base">{t.addProduct}</span>
                </Link>
                <Link href="/dashboard/reports" className="bg-[#f59e0b] h-28 md:h-36 rounded-2xl flex flex-col items-center justify-center text-white shadow-[0_6px_0_0_#d97706] hover:shadow-[0_4px_0_0_#d97706] hover:translate-y-1 active:shadow-none active:translate-y-[6px] transition-all border-b-0 border-amber-700">
                    <div className="bg-white/20 p-3 rounded-xl mb-2">
                        <FaChartLine className="text-2xl md:text-3xl" />
                    </div>
                    <span className="font-bold text-sm md:text-base">{t.viewReports}</span>
                </Link>
            </div>



            {/* AI Business Pulse & Advisory */}
            {/* 4.5. Quick Actions (Quotations, Expenses, Help) - COLORFUL BOX */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-4xl p-8 shadow-xl shadow-indigo-1000 mx-4 md:mx-0 relative overflow-hidden" style={{ marginTop: '20px', marginBottom: '20px' }}>
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-44 bg-white/10 rounded-full blur-2xl -ml-5 -mb-5"></div>

                <div className="flex items-center justify-between gap-4 md:gap-8 relative z-10">
                    <Link href="/dashboard/quotations" className="flex-1 flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-all group">
                        <div className="p-4 rounded-full bg-white/20 text-white group-hover:scale-110 group-hover:bg-white group-hover:text-violet-600 transition-all shadow-md">
                            <FaReceipt className="text-2xl" />
                        </div>
                        <span className="text-sm font-bold text-white tracking-wide">Quotations</span>
                    </Link>

                    <div className="w-px h-12 bg-white/20"></div>

                    <Link href="/dashboard/expenses" className="flex-1 flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-all group">
                        <div className="p-4 rounded-full bg-white/20 text-white group-hover:scale-110 group-hover:bg-white group-hover:text-rose-500 transition-all shadow-md">
                            <FaRupeeSign className="text-2xl" />
                        </div>
                        <span className="text-sm font-bold text-white tracking-wide">Expenses</span>
                    </Link>

                    <div className="w-px h-12 bg-white/20"></div>

                    <Link href="/dashboard/help" className="flex-1 flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-all group">
                        <div className="p-4 rounded-full bg-white/20 text-white group-hover:scale-110 group-hover:bg-white group-hover:text-emerald-500 transition-all shadow-md">
                            <FaUsers className="text-2xl" />
                        </div>
                        <span className="text-sm font-bold text-white tracking-wide">Support</span>
                    </Link>
                </div>
            </div>
            {/* Period Filter Buttons - Separate Box */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg border border-slate-200 mx-4 md:mx-0">
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

            {/* Stats Cards - Moved DOWN */}
            <div className="relative mb-12 mx-4 md:mx-0" style={{ marginTop: '10px' }}>
                <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 -z-10 shadow-lg"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 p-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Link
                                key={index}
                                href={stat.href}
                                className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-center text-center h-32 gap-3"
                            >
                                <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color} text-white shadow-lg transform group-hover:scale-110 transition-transform`}>
                                    <Icon className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{stat.formattedValue}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>


            {/* Digital Store Front Link Card */}
            <div className="mx-6 mt-6" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '5px' }}>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-4xl p-8 shadow-xl shadow-emerald-900/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-emerald-600 shadow-lg transform group-hover:rotate-6 transition-transform">
                                <FaGlobe className="text-3xl" />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-white text-2xl font-black italic tracking-tight uppercase" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '10px' }}>Your Digital Shop is LIVE!</h3>
                                <p className="text-emerald-50 mt-1 font-bold text-sm">Customers can now browse and order products online.</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '10px' }}>
                            {!businessProfile.id ? (
                                <div className="px-8 py-3 bg-white/20 text-white font-black rounded-2xl animate-pulse text-xs tracking-widest uppercase">
                                    Initializing...
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href={`/s/${businessProfile.id}`}
                                        target="_blank"
                                        className="px-8 py-3 bg-white text-emerald-600 font-black rounded-2xl hover:bg-emerald-50 transition-all text-center shadow-lg uppercase text-xs tracking-widest"
                                    >
                                        View Shop
                                    </Link>
                                    <button
                                        onClick={handleShareStore}
                                        className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all border-b-4 border-indigo-800 flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
                                    >
                                        <FaShareAlt /> Share Link
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 1.75. COLLECTION CENTER - Manage Outstanding Payments */}
            <div className="mx-6 mt-8" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>
                <div className="bg-white rounded-4xl border-4 border-slate-100 shadow-xl overflow-hidden relative">
                    <div className="p-8 border-b-4 border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner">
                                <FaRupeeSign className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic text-left">Collection Center</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-left" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Outstanding Payments Tracker</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100">
                            <span className="text-rose-600 font-black text-lg">
                                ₹{(invoices || []).filter((inv: any) => inv.status !== 'PAID').reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_amount) || 0), 0).toLocaleString()}
                            </span>
                            <span className="text-rose-400 text-[10px] font-black uppercase" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Pending Total</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px' }}>
                        <div className="min-w-[600px] p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(invoices || []).filter((inv: any) => inv.status !== 'PAID').length === 10 ? (
                                    <div className="col-span-full py-16 text-center border-4 border-dashed border-slate-50 rounded-4xl">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
                                            <FaBolt className="text-3xl" />
                                        </div>
                                        <h4 className="text-xl font-black text-slate-800 uppercase italic">Great Job!</h4>
                                        <p className="text-slate-500 font-bold mt-2">All payments collected. Your cashflow is healthy.</p>
                                    </div>
                                ) : (
                                    (invoices || []).filter((inv: any) => inv.status !== 'PAID').slice(0, 6).map((inv: any, idx: number) => (
                                        <div key={idx} className="bg-slate-50 border-4 border-slate-100 rounded-3xl p-6 hover:border-rose-200 hover:bg-white transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1" style={{ paddingLeft: '8px', paddingRight: '0px', paddingTop: '2px' }}>Invoice #{inv.invoice_number}</p>
                                                    <h4 className="font-bold text-slate-800 truncate text-lg" style={{ paddingLeft: '8px', paddingRight: '0px', paddingTop: '0px' }}>{inv.customer?.name || 'Unknown Client'}</h4>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <p className="text-rose-600 font-black text-xl whitespace-nowrap">₹{inv.total_amount}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{new Date(inv.invoice_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleSendReminder(inv)}
                                                className="w-full py-4 bg-white border-4 border-emerald-500 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_4px_0_0_#10b981] active:shadow-none active:translate-y-1"
                                            >
                                                <FaWhatsapp className="text-xl" /> Send Reminder
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Overview Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 md:p-8 shadow-xl mx-4 md:mx-0 text-center flex flex-col items-center justify-center">
                <h2 className="text-xl md:text-3xl font-bold text-white tracking-wide">{t.analyticsOverview}</h2>
                <p className="text-sm md:text-base text-indigo-100 font-medium mt-1">Track your business performance</p>
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
                {/* AI Voice Assistant Card - Restored & Improved */}


                {/* Top Selling Products - Refined to BUSINESS PULSE AI Aesthetic */}
                <div className="bg-gradient-to-br from-slate-900 to-black rounded-[2rem] shadow-2xl border border-indigo-500/20 p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-white text-xl font-black italic tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                                        <FaChartLine className="text-white text-sm" />
                                    </div>
                                    BUSINESS PULSE AI™
                                </h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '5px' }}>Top Selling Products</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-slate-400" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>REALTIME</span>
                            </div>
                        </div>

                        <div className="space-y-6" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>
                            {topProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                                    <FaBoxOpen className="text-slate-800 text-4xl mb-4" />
                                    <p className="text-slate-500 font-bold text-sm italic">Scanning market data... No sales found.</p>
                                </div>
                            ) : (
                                topProducts.slice(0, 5).map((product: any, index: number) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 w-6 h-6 rounded-lg flex items-center justify-center">0{index + 1}</span>
                                                <span className="text-sm font-bold text-slate-200 truncate max-w-[120px]">{product.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white text-sm font-black italic">₹{product.sales.toLocaleString()}</p>
                                                <p className="text-[10px] text-slate-500 font-black uppercase">{product.quantity} Units</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-1000"
                                                style={{ width: `${(product.sales / topProducts[0].sales) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
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
            {/* Voice Assistant Overlay */}

        </div>
    );
}
