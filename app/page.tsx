import Link from 'next/link';
import { FaPlus, FaUserPlus, FaBox, FaChartBar, FaClock, FaArrowRight, FaReceipt, FaUsers } from 'react-icons/fa';

export const metadata = {
  title: 'BillGST - Free GST Billing & Stock Management',
  description: 'Professional billing software for small business in India. Create invoices, manage customers and track stock easily.',
  alternates: {
    canonical: 'https://billgst.in',
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Header Mirroring Image */}
      <header className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] p-6 md:p-8 text-white shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center gap-5">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center p-2.5 backdrop-blur-sm shadow-inner">
            <div className="w-full h-full bg-[#38bdf8] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">B</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none uppercase italic">BillGST Business</h1>
            <p className="text-xs md:text-sm font-bold opacity-80 uppercase tracking-widest mt-1">Professional Billing Solution</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-12 space-y-10">
        {/* Status Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fadeIn">
          <div className="flex items-center gap-3 text-slate-500 font-extrabold text-sm bg-slate-100 w-fit px-5 py-2 rounded-full border border-slate-200 shadow-sm">
            <FaClock className="text-orange-500" />
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} • 07:27 am</span>
          </div>
        </div>

        {/* Greeting Section */}
        <div className="space-y-2 animate-slideUp">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-800">
            Good Morning, <span className="text-orange-500 underline decoration-indigo-200">BillGST User</span>! 👋
          </h2>
          <p className="text-lg text-slate-500 font-bold italic">Aapki business growth hamari pehchan hai.</p>
        </div>

        {/* Triple Jumbo 3D Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          {/* New Invoice */}
          <Link href="/dashboard/invoices/new" className="group">
            <div className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] rounded-[40px] p-10 text-white flex flex-col items-center justify-center gap-6 shadow-[0_12px_0_0_#3730a3] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_0_0_#3730a3] active:translate-y-0 active:shadow-none min-h-[250px] border-4 border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <FaReceipt className="text-4xl" />
              </div>
              <span className="text-2xl font-black uppercase tracking-tight">New Invoice</span>
            </div>
          </Link>

          {/* Add Customer */}
          <Link href="/dashboard/customers" className="group">
            <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-[40px] p-10 text-white flex flex-col items-center justify-center gap-6 shadow-[0_12px_0_0_#065f46] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_0_0_#065f46] active:translate-y-0 active:shadow-none min-h-[250px] border-4 border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <FaUsers className="text-4xl" />
              </div>
              <span className="text-2xl font-black uppercase tracking-tight">Add Customer</span>
            </div>
          </Link>

          {/* Add Product */}
          <Link href="/dashboard/inventory" className="group">
            <div className="bg-gradient-to-br from-[#a855f7] to-[#8b5cf6] rounded-[40px] p-10 text-white flex flex-col items-center justify-center gap-6 shadow-[0_12px_0_0_#7c3aed] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_0_0_#7c3aed] active:translate-y-0 active:shadow-none min-h-[250px] border-4 border-white/20">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <FaBox className="text-4xl" />
              </div>
              <span className="text-2xl font-black uppercase tracking-tight">Add Product</span>
            </div>
          </Link>
        </div>

        {/* Big Analytics Bar Mockup */}
        <div className="bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#f43f5e] rounded-[30px] p-10 text-white text-center shadow-2xl border-4 border-white/20 transform hover:scale-[1.01] transition-all animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2">Analytics Overview</h3>
          <p className="text-xl font-bold opacity-90 tracking-widest uppercase">Track your business performance in real-time</p>
        </div>

        {/* Period Selector Buttons Area */}
        <div className="space-y-6 pt-4 animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <p className="font-extrabold text-slate-700 text-lg uppercase tracking-wider">Select Time Period:</p>
          <div className="flex gap-4 md:gap-8 flex-wrap">
            <button className="flex-1 min-w-[120px] py-5 bg-slate-100 rounded-[25px] font-black text-slate-500 border-2 border-slate-200 hover:bg-slate-200 transition-all uppercase italic">Daily</button>
            <button className="flex-1 min-w-[120px] py-5 bg-slate-100 rounded-[25px] font-black text-slate-500 border-2 border-slate-200 hover:bg-slate-200 transition-all uppercase italic">Weekly</button>
            <button className="flex-1 min-w-[120px] py-5 bg-[#6366f1] rounded-[25px] font-black text-white shadow-[0_8px_0_0_#4338ca] transition-all uppercase italic">Monthly</button>
          </div>
        </div>

        {/* Final Call to Action */}
        <div className="pt-20 text-center animate-fadeIn">
          <Link href="/dashboard" className="inline-flex items-center gap-4 px-14 py-6 bg-[#1e293b] text-white font-black rounded-full text-2xl shadow-[0_10px_0_0_#0f172a] hover:bg-slate-800 hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-none">
            START BILLING NOW <FaArrowRight />
          </Link>
          <p className="mt-6 text-slate-400 font-bold uppercase tracking-[0.3em] text-xs underline decoration-indigo-500 underline-offset-8">India&apos;s Smartest Billing App</p>
        </div>
      </main>

      {/* Subtle Starry Touches In Margin for "Premium" flair */}
      <div className="fixed top-20 right-10 w-2 h-2 bg-indigo-500 rounded-full animate-pulse opacity-20"></div>
      <div className="fixed bottom-40 left-10 w-3 h-3 bg-purple-500 rounded-full animate-bounce opacity-20"></div>
    </div>
  );
}
