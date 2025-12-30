'use client';

import { FaFileInvoice, FaRupeeSign, FaUsers, FaBox, FaChartLine, FaClock, FaReceipt, FaUserPlus, FaBoxOpen, FaTimes, FaStore, FaArrowRight, FaSignInAlt } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { translations } from '@/lib/translations';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    invoices, customers, products, settings,
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

    if (status === 'authenticated') {
      router.push('/dashboard');
    } else {
      // Load Demo/Public Data if any
      fetchCustomers();
      fetchProducts();
      fetchInvoices();
    }

    return () => clearInterval(timer);
  }, [status, router]);

  if (!isClient || status === 'authenticated') return null;

  // Get Analytics Data
  const { totalSales, totalProfit, invoiceCount } = getAnalytics(period);

  // Monthly Trend Data for Chart
  const monthlyTrend = [
    { name: 'Jan', sales: totalSales * 0.6 + 5000, profit: totalProfit * 0.5 + 2000 },
    { name: 'Feb', sales: totalSales * 0.7 + 4000, profit: totalProfit * 0.6 + 1500 },
    { name: 'Mar', sales: totalSales * 0.8 + 6000, profit: totalProfit * 0.7 + 3000 },
    { name: 'Apr', sales: totalSales * 0.9 + 7000, profit: totalProfit * 0.85 + 4000 },
    { name: 'May', sales: totalSales * 0.95 + 8000, profit: totalProfit * 0.9 + 5000 },
    { name: 'Jun', sales: totalSales + 10000, profit: totalProfit + 6000 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-x-hidden pb-20">
      {/* Nav Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white font-black italic text-xl shadow-lg">
              B
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">BillGST</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2">
              <FaSignInAlt /> Login
            </Link>
            <Link href="/register" className="bg-indigo-600 text-white text-sm font-bold px-6 py-2 rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-10 space-y-10">

        {/* Hero / Welcome */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-4 pb-8">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
            Professional Billing, <span className="text-indigo-600 italic">Simplified.</span>
          </h2>
          <p className="text-slate-500 font-bold text-lg md:text-xl">
            Free GST Invoicing & Inventory Management for small businesses.
          </p>
        </div>

        {/* Dashboard Preview Banner */}
        <div className="bg-indigo-600 text-white p-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
          <p className="text-xs md:text-sm font-black uppercase tracking-widest">Live Dashboard Preview</p>
        </div>

        {/* Triple Jumbo Action Cards (Functional) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/register" className="group">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 h-[140px] md:h-[180px] rounded-[40px] text-white flex flex-col items-center justify-center gap-4 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.4)] border-b-[8px] border-indigo-900">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FaReceipt className="text-2xl md:text-3xl" />
              </div>
              <span className="text-lg md:text-xl font-black uppercase tracking-tight italic">New Invoice</span>
            </div>
          </Link>

          <Link href="/register" className="group">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 h-[140px] md:h-[180px] rounded-[40px] text-white flex flex-col items-center justify-center gap-4 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.4)] border-b-[8px] border-emerald-900">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FaUserPlus className="text-2xl md:text-3xl" />
              </div>
              <span className="text-lg md:text-xl font-black uppercase tracking-tight italic">Add Party</span>
            </div>
          </Link>

          <Link href="/register" className="group">
            <div className="bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] h-[140px] md:h-[180px] rounded-[40px] text-white flex flex-col items-center justify-center gap-4 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.4)] border-b-[8px] border-violet-900">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FaBox className="text-2xl md:text-3xl" />
              </div>
              <span className="text-lg md:text-xl font-black uppercase tracking-tight italic">Inventory</span>
            </div>
          </Link>
        </div>

        {/* Analytics Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-black italic text-slate-800 uppercase tracking-tight">Real-time Analytics</h4>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase">Sales</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">Profit</span>
              </div>
            </div>
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

          {/* CTA Panel */}
          <div className="bg-slate-900 rounded-[40px] shadow-2xl p-8 md:p-12 text-white flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <div className="inline-block px-4 py-1 bg-white/10 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                🚀 join 50,000+ businesses
              </div>
              <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none">
                Start Billing For Free Today.
              </h3>
              <p className="text-slate-400 text-lg font-medium max-w-md">
                All features included. No credit card required. Trusted by thousands of small businesses across India.
              </p>
              <Link href="/register" className="w-full md:w-fit px-10 py-5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black rounded-full flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-indigo-500/40 uppercase tracking-tight italic">
                Create Account Now <FaArrowRight />
              </Link>
            </div>
            {/* Abstract background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="py-10 text-center space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">SECURE • PROFESSIONAL • COMPLIANT</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale">
            {/* Mock Logos */}
            <div className="flex items-center gap-2 font-black text-2xl italic">GSTIN</div>
            <div className="flex items-center gap-2 font-black text-2xl italic">E-WAY</div>
            <div className="flex items-center gap-2 font-black text-2xl italic">TRUSTED</div>
          </div>
        </div>

      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-bold">&copy; 2025 BillGST.in • Crafted for Indian Small Business</p>
        </div>
      </footer>
    </div>
  );
}
