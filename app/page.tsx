import Link from 'next/link';
import { FaFileInvoiceDollar, FaUsers, FaBox, FaChartBar, FaArrowRight } from 'react-icons/fa';

export const metadata = {
  title: 'BillGST - Advanced Digital Billing Hub',
  description: 'Manage your business invoices, customers, products, and reports from a single powerful dashboard.',
  alternates: {
    canonical: 'https://billgst.in',
  }
};

export default function HomeHub() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col font-sans antialiased text-white selection:bg-white/20">
      {/* Background: Purple Gradient & Stars (Matching Login Design) */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#7e22ce] via-[#6b21a8] to-[#1e1b4b]">
        {/* Floating Stars Layer */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(1px_1px_at_20px_30px,#fff,transparent),radial-gradient(1px_1px_at_40px_70px,#fff,transparent),radial-gradient(2px_2px_at_50px_160px,#fff,transparent),radial-gradient(2px_2px_at_80px_120px,#fff,transparent),radial-gradient(1px_1px_at_110px_210px,#fff,transparent),radial-gradient(2px_2px_at_150px_180px,#fff,transparent)] bg-[length:200px_250px] animate-pulse"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(1px_1px_at_10px_10px,#fff,transparent),radial-gradient(1.5px_1.5px_at_100px_100px,#fff,transparent),radial-gradient(2px_2px_at_200px_200px,#fff,transparent)] bg-[length:400px_400px]"></div>

        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full"></div>
      </div>

      {/* Mountains Silhouette */}
      <div className="fixed bottom-0 w-full z-10 pointer-events-none opacity-40">
        <svg viewBox="0 0 1000 320" className="w-full h-auto translate-y-4">
          <path
            fill="#0f172a"
            fillOpacity="1"
            d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,218.7C672,213,768,171,864,160C960,149,1056,171,1152,192C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Content Container */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-6 md:p-12 mb-12">
        {/* Top Brand Logo */}
        <div className="mb-12 animate-slideUp">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-3 rounded-full shadow-2xl">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-700 font-black text-2xl shadow-lg">B</div>
            <span className="text-3xl font-black tracking-tighter uppercase italic">BillGST</span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight drop-shadow-2xl">
            Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">Business Hub</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 font-medium italic">Empowering small businesses with smart tools</p>
        </div>

        {/* 3D Hub Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full px-4 animate-slideUp">
          {/* Invoice Card */}
          <Link href="/dashboard/invoices" className="group">
            <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[32px] border-2 border-white/20 shadow-[0_8px_0_0_#3730a3] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_0_0_#4338ca] active:translate-y-0 active:shadow-none flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaFileInvoiceDollar className="text-4xl" />
              </div>
              <h2 className="text-2xl font-black mb-3 italic">INVOICES</h2>
              <p className="text-white/70 text-sm font-bold">Generate Professional Bill</p>
              <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 font-black text-sm text-yellow-300 uppercase tracking-widest">
                Open Module <FaArrowRight />
              </div>
            </div>
          </Link>

          {/* Customer Card */}
          <Link href="/dashboard/customers" className="group">
            <div className="relative bg-gradient-to-br from-emerald-600 to-teal-800 p-8 rounded-[32px] border-2 border-white/20 shadow-[0_8px_0_0_#065f46] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_0_0_#047857] active:translate-y-0 active:shadow-none flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaUsers className="text-4xl" />
              </div>
              <h2 className="text-2xl font-black mb-3 italic">PARTIES</h2>
              <p className="text-white/70 text-sm font-bold">Manage Customers & Udhar</p>
              <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 font-black text-sm text-yellow-300 uppercase tracking-widest">
                Open Module <FaArrowRight />
              </div>
            </div>
          </Link>

          {/* Inventory Card */}
          <Link href="/dashboard/inventory" className="group">
            <div className="relative bg-gradient-to-br from-rose-600 to-pink-800 p-8 rounded-[32px] border-2 border-white/20 shadow-[0_8px_0_0_#9f1239] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_0_0_#be123c] active:translate-y-0 active:shadow-none flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaBox className="text-4xl" />
              </div>
              <h2 className="text-2xl font-black mb-3 italic">PRODUCTS</h2>
              <p className="text-white/70 text-sm font-bold">Track Stock & Inventory</p>
              <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 font-black text-sm text-yellow-300 uppercase tracking-widest">
                Open Module <FaArrowRight />
              </div>
            </div>
          </Link>

          {/* Reports Card */}
          <Link href="/dashboard/reports" className="group">
            <div className="relative bg-gradient-to-br from-amber-500 to-orange-700 p-8 rounded-[32px] border-2 border-white/20 shadow-[0_8px_0_0_#9a3412] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_0_0_#c2410c] active:translate-y-0 active:shadow-none flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaChartBar className="text-4xl" />
              </div>
              <h2 className="text-2xl font-black mb-3 italic">REPORTS</h2>
              <p className="text-white/70 text-sm font-bold">Sales & GST Analytics</p>
              <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 font-black text-sm text-yellow-300 uppercase tracking-widest">
                Open Module <FaArrowRight />
              </div>
            </div>
          </Link>
        </div>

        {/* Bottom Footer / CTA */}
        <div className="mt-20 text-center animate-fadeIn relative z-20">
          <p className="text-white/60 font-bold mb-6 text-lg uppercase tracking-[0.2em] italic">Visit Dashboard for full access</p>
          <Link href="/dashboard" className="px-12 py-5 bg-white text-indigo-900 text-xl font-black rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3">
            MAIN DASHBOARD <FaArrowRight />
          </Link>
        </div>
      </main>

      {/* Floating Elements / Bubbles for Depth */}
      <div className="fixed top-1/4 right-1/4 w-4 h-4 bg-white/20 rounded-full blur-sm animate-pulse"></div>
      <div className="fixed bottom-1/3 left-1/3 w-2 h-2 bg-white/40 rounded-full blur-none animate-pulse"></div>
      <div className="fixed top-1/2 left-1/4 w-3 h-3 bg-white/10 rounded-full blur-sm animate-bounce"></div>
    </div>
  );
}
