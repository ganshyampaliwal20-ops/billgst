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
    } = useStore() as any;
    const [isClient, setIsClient] = useState(false);
    const [period, setPeriod] = useState('monthly');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [showSetupBanner, setShowSetupBanner] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [chartView, setChartView] = useState('area'); // 'area' or 'candle'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [showAllCollection, setShowAllCollection] = useState(false);
    const [autoReminders, setAutoReminders] = useState<any[]>([]);
    const [isRefreshingReminders, setIsRefreshingReminders] = useState(false);

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

    const handleSendReminder = (customer: any) => {
        const customerName = customer.name || 'Customer';
        const amount = customer.totalPending;
        const businessName = businessProfile.name || 'Our Business';
        const message = `Namaste ${customerName} ji, hope you are doing well. This is a gentle reminder regarding your total outstanding balance of ₹${amount.toLocaleString('en-IN')} with ${businessName}. Please process the payment at your earliest convenience. Thank you!`;
        const phone = customer.phone?.replace(/\D/g, '') || '';
        if (!phone) {
            toast.error('Customer phone number missing!');
            return;
        }
        const whatsappUrl = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        toast.success(`Opening WhatsApp for ${customerName}...`);
    };

    const handleBulkReminder = (customersToRemind: any[]) => {
        const horror = 'Opening WhatsApp for multiple customers. Your browser might block popups.';
        const toRemind = selectedCustomers.length > 0
            ? customersToRemind.filter(c => selectedCustomers.includes(c.id))
            : customersToRemind;

        if (toRemind.length === 0) {
            toast.error('Please select at least one customer');
            return;
        }

        toast.success(`Processing ${toRemind.length} customers...`, { icon: '🚀' });

        toRemind.forEach((cust, index) => {
            setTimeout(() => {
                const customerName = cust.name;
                const amount = cust.totalPending || cust.pending_amount;
                const businessName = businessProfile.name || 'Our Business';
                const message = cust.message || `Namaste ${customerName} ji, this is a reminder for your total pending balance of ₹${amount.toLocaleString('en-IN')} with ${businessName}. Thank you!`;
                const phone = cust.phone?.replace(/\D/g, '') || cust.customer_phone?.replace(/\D/g, '') || '';

                if (phone) {
                    const whatsappUrl = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                }
            }, index * 3000); // 3 second delay to prevent browser blocks
        });
    };

    const fetchAutoReminders = async () => {
        if (!businessProfile.id) return;
        setIsRefreshingReminders(true);
        try {
            const res = await fetch(`/api/public/whatsapp/reminders?secret=admin_debug_123`);
            const data = await res.json();
            if (data.success) {
                // Filter only for this business
                const myReminders = data.reminders.filter((r: any) => r.business_id === businessProfile.id);
                setAutoReminders(myReminders);
            }
        } catch (error) {
            console.error('Failed to fetch auto-reminders:', error);
        } finally {
            setIsRefreshingReminders(false);
        }
    };

    useEffect(() => {
        setIsClient(true);
        const bannerDismissed = localStorage.getItem('setupBannerDismissed');
        if (bannerDismissed) setShowSetupBanner(false);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchCustomers();
        fetchProducts();
        fetchProducts();
        fetchInvoices();
        fetchBusinessProfile();
        fetchAutoReminders();
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (businessProfile.id) {
            fetchAutoReminders();
        }
    }, [businessProfile.id]);

    if (!isClient) return null;

    const { totalSales, totalProfit, invoiceCount } = getAnalytics(period, customRange);
    const topProducts = getTopProducts() || [];
    const lowStockItems = (products || []).filter((p: any) => p.stock_quantity < (p.low_stock_alert || 10)).length;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t.goodMorning;
        if (hour < 17) return t.goodAfternoon;
        return t.goodEvening;
    };

    const weeklyData = [
        { name: 'Mon', sales: totalSales * 0.12, profit: totalProfit * 0.10 },
        { name: 'Tue', sales: totalSales * 0.18, profit: totalProfit * 0.15 },
        { name: 'Wed', sales: totalSales * 0.15, profit: totalProfit * 0.12 },
        { name: 'Thu', sales: totalSales * 0.22, profit: totalProfit * 0.20 },
        { name: 'Fri', sales: totalSales * 0.25, profit: totalProfit * 0.28 },
        { name: 'Sat', sales: totalSales * 0.05, profit: totalProfit * 0.08 },
        { name: 'Sun', sales: totalSales * 0.03, profit: totalProfit * 0.07 },
    ];

    const getTrendData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const trend: any[] = months.slice(0, 6).map(m => ({
            name: m, sales: 0, profit: 0, high: 0, low: 999999, open: 0, close: 0,
        }));
        invoices.forEach((inv: any) => {
            const date = new Date(inv.invoice_date);
            if (date.getFullYear() === currentYear) {
                const monthIdx = date.getMonth();
                if (monthIdx < 6) {
                    const amount = parseFloat(inv.total_amount) || 0;
                    trend[monthIdx].sales += amount;
                    trend[monthIdx].profit += amount * 0.2;
                    if (amount > trend[monthIdx].high) trend[monthIdx].high = amount;
                    if (amount < trend[monthIdx].low) trend[monthIdx].low = amount;
                    if (trend[monthIdx].open === 0) trend[monthIdx].open = amount;
                    trend[monthIdx].close = amount;
                }
            }
        });
        return trend.map(t => ({
            ...t,
            low: t.low === 999999 ? 0 : t.low,
            candle: [t.sales * 0.7, t.sales],
            wick: [t.sales * 0.6, t.sales * 1.1]
        }));
    };

    const monthlyTrend = getTrendData();
    const today = new Date().toDateString();
    const todaySales = invoices
        .filter((inv: any) => new Date(inv.invoice_date).toDateString() === today)
        .reduce((acc: number, inv: any) => acc + (parseFloat(inv.total_amount) || 0), 0);

    const stats = [
        { icon: FaRupeeSign, label: t.todaysSales, value: todaySales, formattedValue: `₹${todaySales.toLocaleString('en-IN')}`, subtext: 'vs Yesterday', color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', trend: 'Now', trendUp: true, href: '/dashboard/reports?period=daily' },
        { icon: FaChartLine, label: t.totalRevenue, value: totalSales, formattedValue: `₹${totalSales.toLocaleString('en-IN')}`, subtext: `${period} Sales`, color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20', trend: '+12%', trendUp: true, href: '/dashboard/reports' },
        { icon: FaFileInvoice, label: t.invoices, value: invoiceCount, formattedValue: invoiceCount.toString(), subtext: 'Generated', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', trend: '+5', trendUp: true, href: '/dashboard/invoices' },
        { icon: FaBox, label: t.lowStock, value: lowStockItems, formattedValue: lowStockItems.toString(), subtext: 'Items Alert', color: lowStockItems > 0 ? 'from-red-500 to-rose-600' : 'from-emerald-500 to-teal-600', shadow: lowStockItems > 0 ? 'shadow-red-500/20' : 'shadow-emerald-500/20', trend: lowStockItems > 0 ? '⚠️' : '✓', trendUp: lowStockItems === 0, href: '/dashboard/inventory' },
    ];

    const pendingInvoices = (invoices || []).filter((inv: any) => inv.status !== 'PAID');
    const pendingByCustomer = pendingInvoices.reduce((acc: any, inv: any) => {
        const id = inv.customer_id || inv.customer?.id;
        const custObj = customers.find((c: any) => c.id === id);
        if (!acc[id]) {
            acc[id] = {
                id,
                name: inv.customer?.name || 'Unknown',
                phone: inv.customer?.phone || '',
                totalPending: 0,
                invoiceCount: 0,
                lastInvoiceDate: inv.invoice_date,
                promise_date: custObj?.promise_date || null
            };
        }
        acc[id].totalPending += parseFloat(inv.total_amount) || 0;
        acc[id].invoiceCount += 1;
        return acc;
    }, {});
    const pendingCustomersList = Object.values(pendingByCustomer).sort((a: any, b: any) => b.totalPending - a.totalPending);

    return (
        <div className="space-y-6 pb-20 px-4" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2" >
                <div>
                    <div className="flex items-center gap-2 mb-1" >
                        <FaClock className="text-amber-500 text-sm" />
                        <span className="text-xs md:text-sm text-gray-500 font-bold bg-white px-5 py-1.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                            {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            {currentTime.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        {getGreeting()}, <span className="text-blue-600">{businessProfile.name || 'Owner'}</span>! 👋
                    </h1>
                </div>
            </div>

            {/* Smart Search */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-80 pl-4 flex items-center pointer-events-none">
                    <FaSearch className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Quick Search: "
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 shadow-sm" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}
                />

                {/* Instant Search Results Dropdown */}
                {searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[2rem] shadow-2xl border-2 border-slate-100 z-[100] max-h-[400px] overflow-y-auto p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Customer Results */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Customers</h4>
                                {customers.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                    <p className="text-xs text-slate-400 italic px-2">No customers found</p>
                                ) : (
                                    customers.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5).map((cust: any) => (
                                        <Link key={cust.id} href={`/dashboard/customers/${cust.id}`} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all group">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">{cust.name[0]}</div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 truncate uppercase">{cust.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{cust.phone}</p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                            {/* Invoice Results */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Invoices</h4>
                                {invoices.filter((inv: any) => inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                    <p className="text-xs text-slate-400 italic px-2">No invoices found</p>
                                ) : (
                                    invoices.filter((inv: any) => inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5).map((inv: any) => (
                                        <Link key={inv.id} href={`/dashboard/invoices`} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-sm">#</div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 truncate uppercase">Inv #{inv.invoice_number}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">{inv.customer?.name}</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-slate-800 text-xs text-right italic">₹{parseFloat(inv.total_amount).toLocaleString()}</p>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
                <Link href="/dashboard/invoices/new" className="bg-[#6366f1] h-28 md:h-36 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-lg font-black uppercase text-xs tracking-widest gap-2">
                    <FaFileInvoice className="text-2xl" />
                    <span>{t.newInvoice}</span>
                </Link>
                <Link href="/dashboard/customers" className="bg-[#10b981] h-28 md:h-36 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-lg font-black uppercase text-xs tracking-widest gap-2">
                    <FaUsers className="text-2xl" />
                    <span>{t.addCustomer}</span>
                </Link>
                <Link href="/dashboard/inventory" className="bg-[#8b5cf6] h-28 md:h-36 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-lg font-black uppercase text-xs tracking-widest gap-2">
                    <FaBox className="text-2xl" />
                    <span>{t.addProduct}</span>
                </Link>
                <Link href="/dashboard/reports" className="bg-[#f59e0b] h-28 md:h-36 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-lg font-black uppercase text-xs tracking-widest gap-2">
                    <FaChartLine className="text-2xl" />
                    <span>{t.viewReports}</span>
                </Link>
            </div>

            {/* Sub Quick Actions */}
            <div className="grid grid-cols-2 gap-4" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
                <Link href="/dashboard/quotations" className="bg-slate-800 h-24 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-lg font-black uppercase text-[10px] tracking-widest gap-2">
                    <FaReceipt className="text-xl" />
                    <span>Quotations</span>
                </Link>
                <Link href="/dashboard/expenses" className="bg-rose-600 h-24 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-lg font-black uppercase text-[10px] tracking-widest gap-2">
                    <FaRupeeSign className="text-xl" />
                    <span>Expenses</span>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {stats.map((stat, index) => (
                    <Link key={index} href={stat.href} className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 text-center flex flex-col items-center justify-center gap-3 shadow-sm hover:border-blue-100 transition-all active:scale-95">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg flex items-center justify-center`}><stat.icon className="text-xl" /></div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                {stat.label === t.invoices || stat.label === t.lowStock ? stat.value.toLocaleString() : `₹${stat.value.toLocaleString()}`}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Time Period Selector */}
            <div className="space-y-4" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
                <div className="flex bg-white p-1 rounded-2xl border-2 border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
                    {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`flex-1 min-w-[80px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {t[p as keyof typeof t] || (p.charAt(0).toUpperCase() + p.slice(1))}
                        </button>
                    ))}
                </div>

                {period === 'custom' && (
                    <div className="flex gap-4 p-4 bg-white rounded-2xl border-2 border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Start Date</label>
                            <input
                                type="date"
                                value={customRange.start}
                                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">End Date</label>
                            <input
                                type="date"
                                value={customRange.end}
                                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>
                )}
            </div>


            {/* Recent Invoices Table */}
            <div className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden mt-8 shadow-sm">
                <div className="p-6 border-b flex items-center justify-between bg-slate-50/30">
                    <h2 className="text-lg font-black text-slate-800 uppercase italic" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>Recent Invoices</h2>
                    <Link href="/dashboard/invoices" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>View All Invoices</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                            <tr>
                                <th className="p-6" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>Bill No</th>
                                <th className="p-6" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>Customer</th>
                                <th className="p-6" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>Amount</th>
                                <th className="p-6" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-t border-slate-50">
                            {(invoices || []).slice(0, 5).map((invoice: any, index: number) => (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 font-black text-indigo-600" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>#{invoice.invoice_number}</td>
                                    <td className="p-6 font-bold text-slate-700 uppercase text-xs" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>{invoice.customer?.name || 'Unknown'}</td>
                                    <td className="p-6 font-black text-slate-800" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>₹{parseFloat(invoice.total_amount).toLocaleString()}</td>
                                    <td className="p-6" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Online Store Card */}
            <div className="bg-white rounded-[2rem] p-6 border-2 border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-4" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm"><FaGlobe /></div>
                    <div className="text-left">
                        <h3 className="text-lg font-black text-slate-800 uppercase italic">Your Online Store</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>Share link with customers</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Link
                        href={`/s/${businessProfile.id}`}
                        target="_blank"
                        className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        <FaGlobe /> Open
                    </Link>
                    <button onClick={handleShareStore} className="flex-1 md:flex-none px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
                        <FaShareAlt /> Share
                    </button>
                </div>
            </div>

            {/* AI Auto-Reminders Smart Card */}
            {autoReminders.length > 0 && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-3xl shadow-2xl border border-white/30">
                                <FaBolt className="text-yellow-300 animate-pulse" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">AI Auto-Reminders</h3>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest leading-none mt-1">
                                    {autoReminders.length} Customers are due for a reminder today
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleBulkReminder(autoReminders)}
                            className="w-full md:w-auto px-10 py-4 bg-white text-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
                        >
                            <FaWhatsapp className="text-lg" /> Send All Reminders
                        </button>
                    </div>
                </div>
            )}

            {/* Collection Center */}
            <div className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden mt-8 shadow-sm" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>
                <div className="p-6 border-b flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm"><FaRupeeSign /></div>
                        <div className="text-left">
                            <h3 className="text-lg font-black text-slate-800 uppercase italic" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>Collection Center</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>Manage Pending Payments</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleBulkReminder(pendingCustomersList)}
                        className={`w-full md:w-auto px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${selectedCustomers.length > 0 ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-indigo-600 text-white shadow-indigo-200'}`}
                    >
                        <FaWhatsapp className="text-lg" /> {selectedCustomers.length > 0 ? `Remind ${selectedCustomers.length}` : 'Remind All'}
                    </button>
                </div>

                {pendingCustomersList.length > 0 && (
                    <div className="px-6 py-3 bg-white border-b flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>
                        <button onClick={() => selectedCustomers.length === pendingCustomersList.length ? setSelectedCustomers([]) : setSelectedCustomers(pendingCustomersList.map((c: any) => c.id))} className="text-indigo-600 hover:text-indigo-800" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>
                            {selectedCustomers.length === pendingCustomersList.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <span>Selected Customers: {selectedCustomers.length}</span>
                    </div>
                )}

                <div className={`transition-all duration-500 overflow-hidden ${showAllCollection ? 'max-h-none p-6' : 'p-6'}`} style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${!showAllCollection ? 'max-h-[320px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                        {pendingCustomersList.length === 0 ? (
                            <div className="col-span-full py-10 text-center text-slate-400 italic">No pending payments! 🎉</div>
                        ) : (
                            pendingCustomersList.map((cust: any, idx) => {
                                const isSelected = selectedCustomers.includes(cust.id);
                                const isToday = cust.promise_date && new Date(cust.promise_date).toDateString() === new Date().toDateString();
                                const isOverdue = cust.promise_date && new Date(cust.promise_date) < new Date(new Date().setHours(0, 0, 0, 0));
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => isSelected ? setSelectedCustomers(selectedCustomers.filter(id => id !== cust.id)) : setSelectedCustomers([...selectedCustomers, cust.id])}
                                        className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer ${isSelected ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                    >
                                        <div className="absolute -top-2 right-4 flex gap-1">
                                            {isToday && <span className="bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm">PROMISED TODAY</span>}
                                            {isOverdue && <span className="bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm">OVERDUE</span>}
                                        </div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-left">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>{cust.invoiceCount} Bills</p>
                                                <h4 className="font-bold text-slate-800 uppercase truncate text-sm" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>{cust.name}</h4>
                                            </div>
                                            <p className="text-rose-600 font-black text-sm" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>₹{cust.totalPending.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>
                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' : 'border-slate-200 bg-white'}`}>
                                                {isSelected && <FaBolt className="text-[10px]" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }} />}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 italic" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>{new Date(cust.lastInvoiceDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {pendingCustomersList.length > 3 && (
                    <div className="px-6 py-4 bg-slate-50/50 border-t text-center" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>
                        <button
                            onClick={() => setShowAllCollection(!showAllCollection)}
                            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2 mx-auto" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}
                        >
                            {showAllCollection ? 'Show Compact View ↑' : `View All ${pendingCustomersList.length} Customers ↓`}
                        </button>
                    </div>
                )}
            </div>


            {/* AI Business Pulse */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white mt-8 relative overflow-hidden group shadow-2xl" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-blue-400 border border-white/10 shadow-xl" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
                            <FaBrain className="animate-pulse" />
                        </div>
                        <div className="text-left" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Business Pulse AI</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Top Moving Products</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
                        {topProducts.slice(0, 3).map((item: any, idx: number) => (
                            <div key={idx} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/5 hover:bg-white/10 transition-all" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px' }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 font-bold text-xs">{idx + 1}</div>
                                    <span className="text-[10px] font-black italic text-emerald-400 uppercase tracking-widest">Best Seller</span>
                                </div>
                                <h4 className="font-bold text-slate-100 mb-1 uppercase tracking-tight truncate text-sm">{item.name}</h4>
                                <div className="flex justify-between items-end mt-2">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase">{item.quantity} Sold</p>
                                    <p className="text-lg font-black text-white italic">₹{(item.sales || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Support Button */}
            <div className="mt-8 px-2" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '0px', paddingBottom: '10px' }}>
                <Link href="/dashboard/help" className="w-full bg-blue-600 py-5 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-lg font-black uppercase text-xs tracking-widest gap-2 hover:bg-blue-700 transition-colors">
                    <FaUsers className="text-2xl" />
                    <span>Support</span>
                </Link>
            </div>

        </div>
    );
}
