import Link from 'next/link';
import { FaPlus, FaUserPlus, FaBox, FaClock, FaArrowRight, FaReceipt, FaUsers } from 'react-icons/fa';

export const metadata = {
  title: 'BillGST - Free GST Billing & Stock Management',
  description: 'Professional billing software for small business in India. Create invoices, manage customers and track stock easily.',
  alternates: {
    canonical: 'https://billgst.in',
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Header: Exact Match to Image */}
      <header className="bg-[#6366f1] p-4 flex items-center gap-4 text-white shadow-md">
        <div className="w-12 h-12 bg-[#38bdf8] rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-lg">
          <span className="text-white font-black text-xl italic uppercase">B</span>
        </div>
        <div>
          <h1 className="text-xl font-bold leading-none">BillGST Business</h1>
          <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Professional Billing</p>
        </div>
      </header>

      <main className="p-4 md:p-8 space-y-6">
        {/* Date/Time Bar */}
        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white">
            <FaClock size={12} />
          </div>
          <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Sun, 28 Dec • 07:27 am
          </span>
        </div>

        {/* Greeting: Exact Text & Color */}
        <div className="py-2">
          <h2 className="text-3xl md:text-5xl font-black text-slate-800">
            Good Morning, <span className="text-orange-500">BillGST Business</span>! 👋
          </h2>
        </div>

        {/* Triple Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* New Invoice Card */}
          <Link href="/dashboard/invoices/new" className="group">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 h-[180px] rounded-3xl flex flex-col items-center justify-center gap-4 text-white shadow-xl transform active:scale-95 transition-all border-b-8 border-indigo-900">
              <FaReceipt className="text-4xl" />
              <span className="text-xl font-black uppercase">New Invoice</span>
            </div>
          </Link>

          {/* Add Customer Card */}
          <Link href="/dashboard/customers" className="group">
            <div className="bg-[#10b981] h-[180px] rounded-3xl flex flex-col items-center justify-center gap-4 text-white shadow-xl transform active:scale-95 transition-all border-b-8 border-[#047857]">
              <FaUserPlus className="text-4xl" />
              <span className="text-xl font-black uppercase">Add Customer</span>
            </div>
          </Link>

          {/* Add Product Card */}
          <Link href="/dashboard/inventory" className="group">
            <div className="bg-[#8b5cf6] h-[180px] rounded-3xl flex flex-col items-center justify-center gap-4 text-white shadow-xl transform active:scale-95 transition-all border-b-8 border-[#6d28d9]">
              <FaBox className="text-3xl" />
              <span className="text-xl font-black uppercase">Add Product</span>
            </div>
          </Link>
        </div>

        {/* Analytics Overview Bar */}
        <div className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-2xl p-6 text-white text-center shadow-lg">
          <h3 className="text-3xl font-black uppercase italic">Analytics Overview</h3>
          <p className="text-sm font-bold opacity-90 uppercase tracking-widest mt-1">Track your business performance</p>
        </div>

        {/* Time Period Selector */}
        <div className="space-y-4 pt-2">
          <p className="font-bold text-slate-600 text-sm">Select Time Period:</p>
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-full font-black text-slate-400 text-xs uppercase italic">Daily</button>
            <button className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-full font-black text-slate-400 text-xs uppercase italic">Weekly</button>
            <button className="flex-1 py-3 bg-[#6366f1] rounded-full font-black text-white shadow-lg text-xs uppercase italic">Monthly</button>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="pt-10 flex justify-center">
          <Link href="/dashboard" className="px-10 py-4 bg-slate-900 text-white font-black rounded-full flex items-center gap-3 shadow-2xl hover:bg-slate-800 transition-all uppercase italic text-sm">
            Go to Dashboard <FaArrowRight />
          </Link>
        </div>
      </main>
    </div>
  );
}
