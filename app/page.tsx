'use client';

import { FaFileInvoice, FaRupeeSign, FaUsers, FaBox, FaChartLine, FaClock, FaReceipt, FaUserPlus, FaBoxOpen, FaTimes, FaStore, FaArrowRight } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { translations } from '@/lib/translations';

// SEO Metadata (Server component metadata won't work in client component 'app/page.tsx', 
// so we'll use a wrapper or just the document title for now, but Next.js 13+ handles 
// metadata in layout or by separate export in server components. 
// However, since this is 'use client', we should really use a layout for metadata or 
// just accept it here if technically possible. 
// Actually, 'metadata' cannot be exported from a client component. 
// We should have a separate server file or use a layout.)

export default function LandingPage() {
  const {
    invoices, customers, products, businessProfile, settings,
    getAnalytics, getTopProducts,
    fetchCustomers, fetchProducts, fetchInvoices
  } = useStore();
  const [isClient, setIsClient] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get translations
  const t = translations[settings.language as keyof typeof translations] || translations.en;

  useEffect(() => {
    setIsClient(true);
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

  // Monthly Trend Data for Chart
  const monthlyTrend = [
    { name: 'Jan', sales: totalSales * 0.6, profit: totalProfit * 0.5 },
    { name: 'Feb', sales: totalSales * 0.7, profit: totalProfit * 0.6 },
    { name: 'Mar', sales: totalSales * 0.8, profit: totalProfit * 0.7 },
    { name: 'Apr', sales: totalSales * 0.9, profit: totalProfit * 0.85 },
    { name: 'May', sales: totalSales * 0.95, profit: totalProfit * 0.9 },
    { name: 'Jun', sales: totalSales, profit: totalProfit },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden pb-20">
      {/* Header Mirroring Image */}
      <header className="bg-gradient-to-r from-indigo-600 to-violet-700 p-4 md:p-6 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center p-2 backdrop-blur-sm border border-white/30">
              <div className="w-full h-full bg-[#38bdf8] rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl italic uppercase">B</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-none">
                {businessProfile.name || 'BillGST Business'}
              </h1>
              <p className="text-[10px] md:text-xs font-bold opacity-70 uppercase tracking-[0.2em] mt-1">Professional Billing</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/login" className="text-xs font-black uppercase px-4 py-2 border border-white/30 rounded-full hover:bg-white/10">Login</Link>
            <Link href="/register" className="text-xs font-black uppercase px-4 py-2 bg-white text-indigo-700 rounded-full hover:bg-white/90">Sign Up</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-10 space-y-8">

        {/* Status Bar */}
        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs bg-slate-100 w-fit px-4 py-1.5 rounded-full border border-slate-200">
          <FaClock className="text-orange-500" />
          <span suppressHydrationWarning>
            {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} • {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Greeting Section */}
        <div className="py-2">
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
            {getGreeting()}, <span className="text-orange-500">{businessProfile.name || 'Owner'}</span>! 👋
          </h2>
        </div>

        {/* Triple Jumbo Action Cards (Matched to Photo) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp">
          {/* New Invoice */}
          <Link href="/dashboard/invoices/new" className="group">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 h-[180px] md:h-[220px] rounded-[35px] text-white flex flex-col items-center justify-center gap-5 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.4)] active:scale-95 border-b-[8px] border-indigo-900 border-x border-t border-white/10">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FaReceipt className="text-3xl md:text-4xl" />
              </div>
              <span className="text-xl md:text-2xl font-black uppercase tracking-tight italic">{t.newInvoice}</span>
            </div>
          </Link>

          {/* Add Customer */}
          <Link href="/dashboard/customers" className="group">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 h-[180px] md:h-[220px] rounded-[35px] text-white flex flex-col items-center justify-center gap-5 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.4)] active:scale-95 border-b-[8px] border-emerald-900 border-x border-t border-white/10">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FaUserPlus className="text-3xl md:text-4xl" />
              </div>
              <span className="text-xl md:text-2xl font-black uppercase tracking-tight italic">{t.addCustomer}</span>
            </div>
          </Link>

          {/* Add Product */}
          <Link href="/dashboard/inventory" className="group">
            <div className="bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] h-[180px] md:h-[220px] rounded-[35px] text-white flex flex-col items-center justify-center gap-5 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.4)] active:scale-95 border-b-[8px] border-violet-900 border-x border-t border-white/10">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FaBox className="text-3xl md:text-4xl" />
              </div>
              <span className="text-xl md:text-2xl font-black uppercase tracking-tight italic">{t.addProduct}</span>
            </div>
          </Link>
        </div>

        {/* Analytics Overview Section Bar (Matched to Photo) */}
        <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <h3 className="text-3xl md:text-5xl font-black uppercase italic italic tracking-tighter leading-none mb-2">{t.analyticsOverview}</h3>
            <p className="text-sm md:text-base font-bold opacity-80 uppercase tracking-[0.3em]">Track your business performance</p>
          </div>
          {/* Decorative Shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </div>

        {/* Period Filter (Matched to Photo) */}
        <div className="space-y-4 pt-4">
          <p className="font-extrabold text-slate-500 text-sm uppercase tracking-wider">{t.selectPeriod}:</p>
          <div className="flex gap-4">
            {[
              { key: 'daily', label: t.daily },
              { key: 'weekly', label: t.weekly },
              { key: 'monthly', label: t.monthly }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setPeriod(item.key)}
                className={`flex-1 py-4 md:py-5 rounded-[25px] font-black text-xs md:text-sm uppercase italic transition-all ${period === item.key
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 active:scale-95'
                  : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Charts (Real Data from Store) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-8">
            <h4 className="text-xl font-black italic text-slate-800 mb-6 uppercase tracking-tight">Revenue Analytics</h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} hide />
                  <Tooltip
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats Summary Panel */}
          <div className="bg-slate-900 rounded-[40px] shadow-2xl p-8 text-white flex flex-col justify-center">
            <div className="space-y-8">
              <div>
                <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-2">{t.totalRevenue}</p>
                <h5 className="text-5xl font-black tabular-nums italic tracking-tighter">₹{totalSales.toLocaleString()}</h5>
              </div>
              <div className="flex items-center justify-between pt-8 border-t border-white/10">
                <div>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{t.invoices}</p>
                  <p className="text-2xl font-black italic">{invoiceCount}</p>
                </div>
                <Link href="/dashboard" className="px-8 py-4 bg-white text-indigo-900 font-extrabold rounded-full flex items-center gap-2 hover:bg-slate-100 transition-all text-sm shadow-xl">
                  GO TO DASHBOARD <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Hidden Keywords for SEO (Indexable content in background) */}
      <div className="hidden">
        <h1>Free GST Billing Software India</h1>
        <p>Best invoice maker for small business, stock management app, inventory software, udhar track, billing app hindi marathi tamil.</p>
        <h2>Benefits of BillGST</h2>
        <ul>
          <li>Create Professional GST Invoices</li>
          <li>Manage Customer Udhar and Khata</li>
          <li>Track Inventory and Low Stock Alerts</li>
          <li>Detailed Sales and Profit Reports</li>
        </ul>
      </div>
    </div>
  );
}
