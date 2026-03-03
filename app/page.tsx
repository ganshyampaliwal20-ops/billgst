'use client';

import { FaFileInvoice, FaRupeeSign, FaUsers, FaBox, FaChartLine, FaClock, FaReceipt, FaUserPlus, FaBoxOpen, FaTimes, FaStore, FaSignInAlt, FaLock, FaShieldAlt, FaHandshake, FaQuestionCircle, FaCheckCircle, FaStar, FaBolt, FaMagic, FaSearch, FaLeaf } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { translations } from '@/lib/translations';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Navbar3D from '@/app/components/Navbar3D';
import { formatCompactNumber } from '@/lib/utils';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  // Get translations
  const language = settings?.language || 'en';
  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    setIsClient(true);
    // Setup Banner State
    const bannerDismissed = localStorage.getItem('setupBannerDismissed');
    if (bannerDismissed) setShowSetupBanner(false);

    // Live Clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    if (status === 'authenticated') {
      fetchCustomers();
      fetchProducts();
      fetchInvoices();
    }

    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleProtectedAction = (path: string) => {
    if (status === 'authenticated') {
      router.push(path);
    } else {
      toast.error('यह फ़ीचर देखने के लिए कृपया लॉगिन करें!', {
        icon: '🔒',
        style: {
          borderRadius: '10px',
          background: '#FF9933',
          color: '#fff',
          fontWeight: 'bold'
        },
      });
      router.push('/login');
    }
  };

  if (!isClient) return null;

  // Analytics Data - Provide Demo Data for Landing Page
  let { totalSales, totalProfit, invoiceCount } = getAnalytics ? getAnalytics(period, customRange) : { totalSales: 0, totalProfit: 0, invoiceCount: 0 };

  // High-value Demo Data for Non-Logged-In Users
  const isDemo = status !== 'authenticated';
  if (isDemo) {
    totalSales = 285430;
    totalProfit = 84200;
    invoiceCount = 142;
  }

  const topProducts = isDemo ? [
    { name: 'Redmi Note 13 Pro', sales: 125000, quantity: 45 },
    { name: 'Samsung Galaxy S24', sales: 98000, quantity: 32 },
    { name: 'iPhone 15 Case', sales: 42000, quantity: 156 },
    { name: 'Bluetooth Earbuds', sales: 15000, quantity: 84 },
    { name: 'HDMI Cable 2m', sales: 5430, quantity: 38 },
  ] : (getTopProducts ? getTopProducts() : []);

  const lowStockItems = isDemo ? 4 : (products || []).filter((p: any) => p.stock_quantity < (p.low_stock_alert || 10)).length;

  // Monthly Trend Data - Better demo visualization
  const monthlyTrend = [
    { name: 'Jan', sales: totalSales * 0.6, profit: totalProfit * 0.5 },
    { name: 'Feb', sales: totalSales * 0.7, profit: totalProfit * 0.6 },
    { name: 'Mar', sales: totalSales * 0.8, profit: totalProfit * 0.7 },
    { name: 'Apr', sales: totalSales * 0.9, profit: totalProfit * 0.85 },
    { name: 'May', sales: totalSales * 0.95, profit: totalProfit * 0.9 },
    { name: 'Jun', sales: totalSales, profit: totalProfit },
  ];

  const stats = [
    {
      icon: FaRupeeSign,
      label: "Today's Sales",
      value: totalSales * 0.12,
      formattedValue: isDemo ? '₹1.25 L' : formatCompactNumber(totalSales * 0.12),
      subtext: 'Demo Stats',
      color: 'from-blue-600 to-indigo-700',
      shadow: 'shadow-blue-500/20',
      trend: '+15%',
      trendUp: true,
      href: '/dashboard/reports?period=daily'
    },
    {
      icon: FaChartLine,
      label: "Total Revenue",
      value: totalSales,
      formattedValue: isDemo ? '₹2.85 L' : formatCompactNumber(totalSales),
      subtext: isDemo ? 'June Performance' : `${period} Sales`,
      color: 'from-orange-500 to-[#FF9933]',
      shadow: 'shadow-orange-500/20',
      trend: '+22%',
      trendUp: true,
      href: '/dashboard/reports'
    },
    {
      icon: FaFileInvoice,
      label: "Invoices",
      value: invoiceCount,
      formattedValue: invoiceCount.toString(),
      subtext: 'Professional Billing',
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      trend: '+42',
      trendUp: true,
      href: '/dashboard/invoices'
    },
    {
      icon: FaBox,
      label: "Inventory Status",
      value: lowStockItems,
      formattedValue: lowStockItems.toString(),
      subtext: 'Predictive Alert',
      color: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/20',
      trend: 'Low',
      trendUp: false,
      href: '/dashboard/inventory'
    },
  ];

  // Quick Action Items
  const quickActions = [
    { icon: FaReceipt, label: t.newInvoice, href: '/dashboard/invoices/new', color: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' },
    { icon: FaUserPlus, label: t.addCustomer, href: '/dashboard/customers', color: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' },
    { icon: FaBoxOpen, label: t.addProduct, href: '/dashboard/inventory', color: 'bg-orange-500 hover:bg-[#FF9933] shadow-orange-200' },
    { icon: FaChartLine, label: t.viewReports, href: '/dashboard/reports', color: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' },
  ];

  // Demo Invoices
  const demoInvoices = [
    { invoice_number: '2024-001', customer: { name: 'Aman General Store' }, invoice_date: new Date(), total_amount: 12500, status: 'PAID' },
    { invoice_number: '2024-002', customer: { name: 'Priya Traders' }, invoice_date: new Date(), total_amount: 4500, status: 'PAID' },
    { invoice_number: '2024-003', customer: { name: 'Sagar Mobiles' }, invoice_date: new Date(), total_amount: 68900, status: 'PAID' },
    { invoice_number: '2024-004', customer: { name: 'Deepak Electricals' }, invoice_date: new Date(), total_amount: 15400, status: 'PAID' },
    { invoice_number: '2024-005', customer: { name: 'Bharat Hardware' }, invoice_date: new Date(), total_amount: 9200, status: 'PAID' },
  ];

  const displayInvoices = isDemo ? demoInvoices : (invoices || []).slice(0, 5);

  return (
    <>
      <Navbar3D />
      <main style={{ paddingTop: '88px', paddingLeft: '8px', paddingRight: '8px', paddingBottom: '8px' }} className="min-h-screen bg-slate-50 flex flex-col items-center overflow-x-hidden">

        {/* Modern Hero Section */}
        <div className="w-full bg-gradient-to-br from-[#FF9933] via-[#FF8800] to-[#FF9933] text-white py-10 md:py-16 relative overflow-hidden transition-all duration-700 rounded-3xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full -mr-48 -mt-24 blur-[100px] animate-pulse"></div>

          <div className="max-w-[1600px] mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/40 text-[10px] md:text-xs font-black mb-4 animate-bounce shadow-xl uppercase tracking-widest">
              <FaBolt className="text-yellow-300" /> <span className="uppercase tracking-widest">Digital Bharat's Billing Partner</span>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tighter drop-shadow-2xl leading-tight">
              Elevate Your <span className="text-blue-900 italic">Business</span> <br className="hidden md:block" /> with BillGST Pro
            </h1>

            <p className="text-sm md:text-lg text-orange-50 max-w-xl mb-8 font-bold leading-relaxed opacity-90">
              Transform your shop into a professional brand. Lightning-fast billing, smart inventory, and absolute compliance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6">
              <Link href="/login" className="px-6 py-3 bg-white text-[#FF9933] font-black rounded-xl hover:bg-orange-50 transition-all shadow-xl hover:scale-105 active:scale-95 text-base flex items-center justify-center gap-3">
                <FaMagic /> START FREE
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 1100, behavior: 'smooth' })}
                className="px-6 py-3 bg-blue-900 text-white font-black rounded-xl hover:bg-blue-800 transition-all shadow-xl hover:scale-105 active:scale-95 text-base border-2 border-white/10"
              >
                LIVE DEMO
              </button>
            </div>

            {/* Live Stats Preview */}
            <div className="mt-10 bg-white/10 backdrop-blur-2xl border border-white/30 rounded-2xl p-4 flex gap-6 md:gap-12 items-center justify-center overflow-x-hidden md:px-10 shadow-xl">
              <div className="flex flex-col items-center">
                <span className="text-xl md:text-2xl font-black italic">50,000+</span>
                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest mt-1 text-white/80">Merchants</span>
              </div>
              <div className="w-px h-6 bg-white/30"></div>
              <div className="flex flex-col items-center">
                <span className="text-xl md:text-2xl font-black italic">₹100 Cr+</span>
                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest mt-1 text-white/80">Volume</span>
              </div>
              <div className="w-px h-6 bg-white/30"></div>
              <div className="flex flex-col items-center">
                <span className="text-xl md:text-2xl font-black italic">4.9/5</span>
                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest mt-1 text-white/80">Rating</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 md:space-y-12 px-2 py-6 max-w-[1600px] w-full mx-auto -mt-12 relative z-30">

          {/* 3D Smart Search Bar - Icon Moved to Right Side */}
          <div className="relative group max-w-4xl mx-auto transition-all duration-500 hover:scale-[1.01]">
            <div className="absolute inset-y-0 right-0 pr-[75px] flex items-center pointer-events-none">
              <FaSearch className="text-[#FF9933] text-lg" />
            </div>
            <input
              type="text"
              placeholder="Try: 'Mobile Phones', 'Sales'..."
              readOnly
              className="block w-full pl-10 pr-[120px] py-4 bg-white border-[3px] border-orange-100 rounded-[1.5rem] leading-5 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF9933] transition-all font-black text-lg text-slate-700 shadow-2xl cursor-pointer"
              onClick={() => handleProtectedAction('/dashboard')}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl border-2 border-slate-50 relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleProtectedAction(action.href)}
                    className={`${action.color} text-white rounded-[1.5rem] p-4 md:p-6 flex flex-col items-center justify-center gap-3 transition-all duration-500 hover:scale-[1.03] active:scale-95 shadow-lg min-h-[120px] md:min-h-[150px] border-b-4 border-black/20 w-full`}
                  >
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Icon className="text-2xl md:text-3xl" />
                    </div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-tight text-center leading-none">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Premium Overview Section - Centered Headers & 8px Padding */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">

            {/* Business Intelligence */}
            <div className="bg-white rounded-[2rem] p-2 shadow-2xl border-4 border-[#FF9933] relative overflow-hidden group/stats">
              <div className="flex flex-col items-center justify-center mb-6 py-4">
                <h2 className="text-xl font-black text-slate-900 italic uppercase leading-none text-center">Business Intelligence</h2>
                <p className="text-[8px] font-black text-[#FF9933] uppercase tracking-widest mt-1 text-center">Real-time Insights</p>
                <div className="mt-4 w-12 h-1 bg-orange-100 rounded-full"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-2xl border-b-2 border-slate-200 hover:border-[#FF9933] transition-all duration-500 hover:bg-orange-50/40 group relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}><stat.icon className="text-sm" /></div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-base font-black text-slate-800 ">{stat.formattedValue}</h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Trends */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl border-2 border-blue-100 relative overflow-hidden flex flex-col justify-between group/chart">
              <div>
                <div className="flex flex-col items-center justify-center mb-6 py-4">
                  <h2 className="text-xl font-black text-slate-900 italic uppercase leading-none text-center text-blue-900">Growth Trends</h2>
                  <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1 text-center">Income Analysis</p>
                  <div className="flex items-center gap-2 text-[8px] font-black bg-blue-50 px-2 py-1 rounded-lg mt-3">
                    <div className="flex items-center gap-1 text-indigo-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> SALES
                    </div>
                  </div>
                </div>
                <div className="h-[200px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend} margin={{ right: 10, left: 10, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }}
                        width={45}
                        tickFormatter={(value) => formatCompactNumber(value).replace('₹', '')}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <button onClick={() => handleProtectedAction('/dashboard/reports')} className="mt-4 w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">
                ANALYTICS
              </button>
            </div>
          </div>

          {/* Saffron Styled Best-Sellers */}
          <div className="bg-white rounded-[2rem] border-2 border-[#FF9933] p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#FF9933] text-white rounded-xl flex items-center justify-center text-2xl shadow-lg border-2 border-orange-100">
                  <FaBolt />
                </div>
                <h3 className="text-xl font-black italic uppercase text-slate-800 leading-none text-center">Best-Sellers</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {topProducts.slice(0, 5).map((item: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 hover:border-[#FF9933] transition-all flex flex-col items-center justify-center text-center h-[140px] gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] ${idx === 0 ? 'bg-[#FF9933] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-[10px] uppercase line-clamp-2 mb-1">{item.name}</h4>
                      <p className="text-lg font-black text-slate-900 leading-none">₹{formatCompactNumber(item.sales).replace('₹', '')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Invoices - 8px Padding */}
          <div className="bg-white rounded-[2rem] shadow-xl border-2 border-indigo-100 overflow-hidden p-2">
            <div className="p-4 border-b-2 border-slate-50 flex flex-col items-center justify-center gap-4 bg-indigo-50/20 rounded-t-[1.5rem]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 bg-indigo-700 text-white rounded-xl flex items-center justify-center shadow-md">
                  <FaReceipt className="text-xl" />
                </div>
                <h2 className="text-lg font-black text-slate-900 italic uppercase">Recent Billing</h2>
              </div>
              <button onClick={() => handleProtectedAction('/dashboard/invoices')} className="px-4 py-2 bg-indigo-700 text-white rounded-lg font-black text-[10px] tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2">
                VIEW ALL <FaMagic />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="py-4 px-6 text-[8px] font-black uppercase tracking-widest text-left">Bill #</th>
                    <th className="py-4 px-6 text-[8px] font-black uppercase tracking-widest text-left">Entity</th>
                    <th className="py-4 px-6 text-[8px] font-black uppercase tracking-widest text-left">Amount</th>
                    <th className="py-4 px-6 text-[8px] font-black uppercase tracking-widest text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-50">
                  {displayInvoices.map((invoice: any, index: number) => (
                    <tr key={index} className="hover:bg-indigo-50/40">
                      <td className="p-2 px-5 whitespace-nowrap text-[10px] font-bold text-indigo-700">#{(invoice?.invoice_number || '').split('-').pop()}</td>
                      <td className="p-2 px-4 text-[10px] text-slate-800 font-extrabold uppercase">{invoice?.customer?.name}</td>
                      <td className="p-2 px-4 text-sm font-black text-slate-900">₹{(invoice?.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="p-2 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[8px] font-black uppercase ${invoice?.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {invoice?.status || 'PAID'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Improved How It Works Section - Icons Perfectly Centered */}
        <div className="w-full bg-white py-16 md:py-20 border-t-4 border-orange-50 mt-12 relative overflow-hidden rounded-[2.5rem]">
          <div className="max-w-[1600px] mx-auto px-4 relative z-10 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-12 uppercase italic text-center">Simple 3-Step Setup</h2>
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto flex justify-center items-center">
              {[
                { step: 1, icon: FaUserPlus, title: "Register", text: "Configure GST in minutes.", color: 'orange', iconColor: 'text-orange-500', bgColor: 'from-white to-orange-50', borderColor: 'border-orange-50' },
                { step: 2, icon: FaBoxOpen, title: "Add Stock", text: "Import your product catalog.", color: 'blue', iconColor: 'text-blue-600', bgColor: 'from-white to-blue-50', borderColor: 'border-blue-50' },
                { step: 3, icon: FaFileInvoice, title: "Start Bills", text: "Create and share via WhatsApp.", color: 'emerald', iconColor: 'text-emerald-600', bgColor: 'from-white to-emerald-50', borderColor: 'border-emerald-50' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center">
                  <div className={`w-24 h-24 bg-white border-4 ${item.borderColor} rounded-[2rem] flex items-center justify-center text-4xl ${item.iconColor} shadow-md bg-gradient-to-br ${item.bgColor} mb-6 transition-transform hover:scale-110`}>
                    <item.icon />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2 uppercase italic text-center">0{item.step}. {item.title}</h3>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed text-center px-4">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Premium Bharat Badge */}
            <div className="mt-16">
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-orange-100 shadow-lg">
                <FaLeaf className="text-orange-500 text-xl" />
                <div className="text-left leading-none">
                  <span className="block text-orange-500 font-black text-[10px] tracking-widest">MADE IN</span>
                  <span className="block font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-blue-700 to-green-700 mt-0.5 uppercase italic">Bharat (India)</span>
                </div>
                <div className="text-3xl ml-1">🇮🇳</div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Standard Trust Section */}
        <div className="w-full bg-slate-900 py-16 relative overflow-hidden rounded-[2.5rem] mt-8">
          <div className="max-w-[1600px] mx-auto px-4 relative z-10">
            <h2 className="text-2xl font-black text-white mb-12 text-center uppercase italic">Security & Compliance</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: FaShieldAlt, title: "Secure Data", text: "Encrypted vaults in Indian centers.", color: 'bg-indigo-600' },
                { icon: FaCheckCircle, title: "GST Ready", text: "Automatic tax validation logic.", color: 'bg-[#FF9933]' },
                { icon: FaHandshake, title: "Digital Shop", text: "Direct orders to WhatsApp.", color: 'bg-emerald-500' }
              ].map((feature, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-white/10 flex flex-col items-center text-center">
                  <div className={`w-14 h-14 ${feature.color} text-white rounded-xl flex items-center justify-center text-2xl mb-6 shadow-md`}>
                    <feature.icon />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2 italic tracking-tight">{feature.title}</h3>
                  <p className="text-slate-400 text-xs font-bold leading-relaxed opacity-90">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Support/FAQ Section */}
        <div className="w-full bg-slate-50 py-16 border-t-4 border-slate-100 rounded-[2.5rem] mt-8">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic">Support</h2>
            </div>
            <div className="space-y-4">
              {[
                { q: "Is BillGST really free?", a: "हाँ! हम छोटे व्यापारियों के लिए 30 इनवॉइस प्रतिमाह पूरी तरह मुफ्त ऑफर करते हैं।" },
                { q: "Need Support?", a: "हमारी समर्पित टीम support@billgst.in पर 24/7 उपलब्ध है।" }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 group">
                  <h3 className="flex items-start gap-3 text-base font-black text-slate-900 mb-2 group-hover:text-[#FF9933]">
                    <FaQuestionCircle className="text-lg text-indigo-600 group-hover:text-[#FF9933]" />
                    {item.q}
                  </h3>
                  <p className="text-slate-500 pl-8 text-sm font-bold opacity-80">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Merchant Feedback Section - Moved to Niche (Bottom) */}
        <div className="w-full bg-white py-16 md:py-24 border-t-4 border-slate-50">
          <div className="max-w-[1600px] mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-12 text-center uppercase italic">Merchant Feedback</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Rahul Sharma", role: "Elite Tech, Delhi", text: "BillGST isn't just software; it's a productivity multiplier. My billing time dropped by 80%!", color: 'border-orange-200', bg: 'bg-orange-50/20' },
                { name: "Priya Patel", role: "Boutique, Ahmedabad", text: "The localized interface and the heritage theme create an instant bond. Best billing app!", color: 'border-blue-200', bg: 'bg-blue-50/20' },
                { name: "Amit Verma", role: "Hardware, Jaipur", text: "Inventory precision is unmatched. The platform predicts my stockouts perfectly.", color: 'border-emerald-200', bg: 'bg-emerald-50/20' }
              ].map((review, i) => (
                <div key={i} className={`p-8 rounded-[2rem] border-2 ${review.color} ${review.bg} relative shadow-md hover:shadow-xl transition-all`}>
                  <div className="flex items-center justify-center gap-1 mb-6 text-yellow-400 text-lg p-2">
                    {[1, 2, 3, 4, 5].map(star => <FaStar key={star} />)}
                  </div>
                  <p className="text-slate-700 mb-8 italic text-base font-bold opacity-90 leading-relaxed">"{review.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-base leading-none">{review.name}</p>
                      <p className="text-[8px] text-[#FF9933] font-black uppercase mt-1 tracking-widest">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Master Footer */}
        <footer className="w-full bg-white border-t-8 border-orange-50 py-12 relative overflow-hidden mt-8 rounded-[20px_20px_0px_0px]">
          <div className="max-w-[1600px] mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-1 italic">BillGST<span className="text-[#FF9933]">.in</span></h2>
                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-4">PIONEERING DIGITAL BHARAT</p>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-tight opacity-60">© {new Date().getFullYear()} Intellectual Property of BillGST.</p>
              </div>

              <div className="flex gap-8">
                <Link href="/about" className="text-slate-500 hover:text-[#FF9933] text-xs font-bold">About</Link>
                <Link href="/privacy" className="text-slate-500 hover:text-[#FF9933] text-xs font-bold">Privacy</Link>
                <a href="mailto:support@billgst.in" className="text-slate-500 hover:text-blue-600 text-xs font-bold">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
