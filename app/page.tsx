'use client';

import Navbar3D from '@/app/components/Navbar3D';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaBox, FaChartLine, FaClock, FaFileInvoice, FaStore, FaTimes, FaUsers, FaRupeeSign, FaExclamationTriangle, FaClipboardList, FaMoneyBillWave, FaHeadset } from 'react-icons/fa';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function LandingPage() {
  const {
    invoices, products, settings,
    getAnalytics, getTopProducts,
    fetchCustomers, fetchProducts, fetchInvoices
  } = useStore();

  const [isClient, setIsClient] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showSetupBanner, setShowSetupBanner] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get translations
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Load Data
    fetchCustomers();
    fetchProducts();
    fetchInvoices();

    return () => clearInterval(timer);
  }, []);

  if (!isClient) return null;

  // Analytics Data for Chart
  const { totalSales, totalProfit } = getAnalytics(period, customRange);
  const topProducts = getTopProducts() || [];

  // Quick Stats Calculation
  const todaySales = getAnalytics('daily').totalSales;
  const totalRevenueAllTime = invoices.reduce((acc: number, inv: any) => acc + (parseFloat(inv.total_amount) || 0), 0);
  const invoiceCount = invoices.length;
  const lowStockCount = products.filter((p: any) => (parseFloat(p.quantity) || 0) <= 5).length;

  // Greeting Logic
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

  // Restored Fake Data for Revenue Trend
  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <>
      <Navbar3D />
      <main className="pb-10 bg-[#f8fafc] min-h-screen px-4" style={{ paddingTop: '30px' }}>
        <div className="max-w-2xl mx-auto md:max-w-4xl space-y-6">

          {/* 1. Greeting - Moved to top as requested */}
          <div className="text-center md:text-left" style={{ marginTop: '10px' }}>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {getGreeting()}, <span className="text-amber-500">My Business</span>! 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">Login to access your dashboard.</p>
          </div>

          {/* 2. Date/Time Pill */}
          <div className="relative mb-12" style={{ marginTop: '5px' }}></div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-white w-fit px-3 py-1 rounded-full border border-slate-500 shadow-sm mx-auto md:mx-0 mt-2">
            <FaClock className="text-amber-500" />
            <span suppressHydrationWarning>
              {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} • {currentTime.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>

          {/* 4. Four Big Action Buttons - Fixed Height with 3D Effect */}
          <div className="relative mb-12" style={{ marginTop: '8px' }}></div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <Link href="/login" className="bg-[#6366f1] h-32 md:h-44 rounded-2xl flex flex-col items-center justify-center text-white shadow-[0_6px_0_0_#4338ca] hover:shadow-[0_4px_0_0_#4338ca] hover:translate-y-1 active:shadow-none active:translate-y-[6px] transition-all border-b-0 border-indigo-700">
              <div className="bg-white/20 p-3 rounded-xl mb-2">
                <FaFileInvoice className="text-2xl md:text-3xl" />
              </div>
              <span className="font-bold text-sm md:text-base">New Invoice</span>
            </Link>
            <Link href="/login" className="bg-[#10b981] h-32 md:h-44 rounded-2xl flex flex-col items-center justify-center text-white shadow-[0_6px_0_0_#047857] hover:shadow-[0_4px_0_0_#047857] hover:translate-y-1 active:shadow-none active:translate-y-[6px] transition-all border-b-0 border-emerald-700">
              <div className="bg-white/20 p-3 rounded-xl mb-2">
                <FaUsers className="text-2xl md:text-3xl" />
              </div>
              <span className="font-bold text-sm md:text-base">Add Customer</span>
            </Link>
            <Link href="/login" className="bg-[#8b5cf6] h-32 md:h-44 rounded-2xl flex flex-col items-center justify-center text-white shadow-[0_6px_0_0_#7c3aed] hover:shadow-[0_4px_0_0_#7c3aed] hover:translate-y-1 active:shadow-none active:translate-y-[6px] transition-all border-b-0 border-violet-700">
              <div className="bg-white/20 p-3 rounded-xl mb-2">
                <FaBox className="text-2xl md:text-3xl" />
              </div>
              <span className="font-bold text-sm md:text-base">Add Product</span>
            </Link>
            <Link href="/login" className="bg-[#f59e0b] h-32 md:h-44 rounded-2xl flex flex-col items-center justify-center text-white shadow-[0_6px_0_0_#d97706] hover:shadow-[0_4px_0_0_#d97706] hover:translate-y-1 active:shadow-none active:translate-y-[6px] transition-all border-b-0 border-amber-700">
              <div className="bg-white/20 p-3 rounded-xl mb-2">
                <FaChartLine className="text-2xl md:text-3xl" />
              </div>
              <span className="font-bold text-sm md:text-base">View Reports</span>
            </Link>
          </div>

          {/* 4.5. Quick Actions (Quotations, Expenses, Help) - COLORFUL BOX */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-4xl p-8 shadow-xl shadow-indigo-1000 mx-2 md:mx-0 relative overflow-hidden" style={{ marginTop: '20px', marginBottom: '20px' }}>
            {/* ... simplified content ... */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-44 bg-white/10 rounded-full blur-2xl -ml-5 -mb-5"></div>

            <div className="flex items-center justify-between gap-4 md:gap-8 relative z-10">
              <Link href="/dashboard/quotations" className="flex-1 flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-all group">
                <div className="p-4 rounded-full bg-white/20 text-white group-hover:scale-110 group-hover:bg-white group-hover:text-violet-600 transition-all shadow-md">
                  <FaClipboardList className="text-2xl" />
                </div>
                <span className="text-sm font-bold text-white tracking-wide">Quotations</span>
              </Link>

              <div className="w-px h-12 bg-white/20"></div>

              <Link href="/dashboard/expenses" className="flex-1 flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-all group">
                <div className="p-4 rounded-full bg-white/20 text-white group-hover:scale-110 group-hover:bg-white group-hover:text-rose-500 transition-all shadow-md">
                  <FaMoneyBillWave className="text-2xl" />
                </div>
                <span className="text-sm font-bold text-white tracking-wide">Expenses</span>
              </Link>

              <div className="w-px h-12 bg-white/20"></div>

              <Link href="/dashboard/help" className="flex-1 flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-all group">
                <div className="p-4 rounded-full bg-white/20 text-white group-hover:scale-110 group-hover:bg-white group-hover:text-emerald-500 transition-all shadow-md">
                  <FaHeadset className="text-2xl" />
                </div>
                <span className="text-sm font-bold text-white tracking-wide">Support</span>
              </Link>
            </div>
          </div>

          {/* 3. NEW 3D STATS WIDGETS with Glass Border - Moved DOWN */}
          <div className="relative mb-12" style={{ marginTop: '10px' }}>
            {/* Glass Container */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 -z-10 shadow-lg"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl">
              {/* Today Sales */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-center text-center h-32 gap-3">
                <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner">
                  <FaRupeeSign className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">₹{todaySales.toLocaleString('en-IN')}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Today Sales</p>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-center text-center h-32 gap-3">
                <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-inner">
                  <FaChartLine className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">₹{totalRevenueAllTime >= 1000 ? (totalRevenueAllTime / 1000).toFixed(1) + 'k' : totalRevenueAllTime.toLocaleString('en-IN')}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Rev</p>
                </div>
              </div>

              {/* Invoices */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-center text-center h-32 gap-3">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                  <FaFileInvoice className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">{invoiceCount}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Invoices</p>
                </div>
              </div>

              {/* Low Stock */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 hover:bg-red-50/30 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-center text-center h-32 gap-3">
                <div className="p-3 bg-red-100 rounded-full text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors shadow-inner">
                  <FaExclamationTriangle className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">{lowStockCount}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Low Stock</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Analytics Bar */}
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-center shadow-lg mx-2 md:mx-0">
            <div className="relative mb-12" style={{ marginTop: '10px' }}></div>
            <h2 className="text-lg md:text-xl font-bold text-white">Analytics Overview</h2>
            <p className="text-xs md:text-sm text-purple-100 opacity-90">Track your business performance</p>
          </div>

          {/* 6. Time Period Pills with Custom Option */}
          {/* 6. Time Period Segmented Control */}
          {/* 6. Time Period Buttons */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <div className="relative mb-12" style={{ marginTop: '0px' }}></div>
            <div className="flex flex-wrap justify-center gap-3 w-full max-w-3xl mx-auto">
              {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map((p) => {
                const isActive = period === p.toLowerCase();
                return (
                  <button
                    key={p}
                    onClick={() => setPeriod(p.toLowerCase())}
                    className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 border-2 ${isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-105'
                      : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-100 hover:bg-slate-50 hover:text-indigo-600'
                      }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Custom Range Inputs */}
            {period === 'custom' && (
              <div className="flex items-center gap-4 mt-2 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 w-full md:w-auto animate-in fade-in slide-in-from-top-1">
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

          {/* WEEKLY PERFORMANCE */}
          {/* DASHBOARD GRID - Charts & Lists */}
          <div className="grid grid-cols-1 gap-6 mt-8">

            {/* 1. WEEKLY PERFORMANCE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-slate-800">{t.weeklyPerformance}</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Sales by day of the week</p>
                </div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} barCategoryGap="20%" margin={{ right: 10, left: -10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} width={35} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px', padding: '12px' }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} name="Sales" />
                    <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. REVENUE TREND */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 text-lg">Revenue Trend</h3>
                <div className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">+12.5%</div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ right: 10, left: -10, top: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} width={35} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }} />
                    <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. TOP SELLING PRODUCTS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-6 text-center">{t.topSellingProducts}</h2>
              <div className="space-y-6 px-2">
                {topProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-3">
                      <FaBox className="text-slate-300 text-2xl" />
                    </div>
                    <p className="text-slate-500 font-medium text-sm">No sales data yet</p>
                    <p className="text-xs text-slate-400 mt-1">Start selling to see products here</p>
                  </div>
                ) : (
                  topProducts.slice(0, 5).map((product: any, index: number) => (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700 truncate max-w-[60%]">{product.name}</span>
                        <span className="text-sm font-bold text-slate-900">₹{product.sales >= 1000 ? (product.sales / 1000).toFixed(1) + 'k' : product.sales.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ width: `${(product.sales / topProducts[0].sales) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20"></div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium uppercase tracking-wide">{product.quantity} units sold</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 4. RECENT INVOICES */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 pl-2">{t.recentInvoices}</h2>
                <Link href="/dashboard/invoices" className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">See All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.invoices}</th>
                      <th className="text-left py-4 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.customer}</th>
                      <th className="text-left py-4 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.date}</th>
                      <th className="text-right py-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.amount}</th>
                      <th className="text-center py-4 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(invoices || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                          No invoices yet. Create your first one!
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
                          <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="py-4 px-6 text-xs font-bold text-indigo-600">#{invoice?.invoice_number || 'N/A'}</td>
                            <td className="py-4 px-4 text-xs font-medium text-slate-700">{invoice?.customer?.name || 'Unknown'}</td>
                            <td className="py-4 px-4 text-xs text-slate-500">{safeDate(invoice?.invoice_date)}</td>
                            <td className="py-4 px-6 text-xs font-bold text-slate-900 text-right">
                              ₹{safeTotal >= 1000 ? (safeTotal / 1000).toFixed(1) + 'k' : safeTotal.toLocaleString('en-IN')}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${invoice?.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {invoice?.status?.toLowerCase() || 'paid'}
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

          {/* Setup Banner (Original) */}
          {showSetupBanner && (
            <div className="bg-white rounded-3xl p-5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 text-center relative mt-6 animate-slideUp">
              <button
                onClick={() => setShowSetupBanner(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"
              >
                <FaTimes />
              </button>
              <div className="flex justify-center mb-3">
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                  <FaStore className="text-2xl" />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Setup Your Business!</h3>
              <p className="text-slate-500 text-xs md:text-sm mb-4 px-4">
                Register your details to create valid invoices.
              </p>
              <Link
                href="/login"
                className="block w-full bg-[#6366f1] text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mb-2"
              >
                Register Now →
              </Link>
              <button
                onClick={() => setShowSetupBanner(false)}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
              >
                Do it later
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
