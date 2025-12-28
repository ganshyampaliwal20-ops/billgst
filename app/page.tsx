import Link from 'next/link';
import { FaFileInvoiceDollar, FaUsers, FaBox, FaChartBar, FaArrowRight, FaClock, FaRupeeSign, FaChartLine, FaBoxOpen, FaReceipt, FaUserPlus, FaHome, FaHistory, FaCog } from 'react-icons/fa';

export const metadata = {
  title: 'BillGST - Advanced Digital Billing Dashboard',
  description: 'Manage your business invoices, customers, products, and reports from a single powerful digital dashboard.',
  alternates: {
    canonical: 'https://billgst.in',
  }
};

export default function HomeDashboard() {
  return (
    <div className="min-h-screen relative bg-[#0f172a] font-sans antialiased text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background: Purple Gradient & Stars (Starry Night Theme) */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#4c1d95] via-[#1e1b4b] to-[#0f172a]">
        {/* Floating Stars Layer */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(1px_1px_at_20px_30px,#fff,transparent),radial-gradient(1px_1px_at_40px_70px,#fff,transparent),radial-gradient(2px_2px_at_50px_160px,#fff,transparent),radial-gradient(2px_2px_at_80px_120px,#fff,transparent),radial-gradient(1px_1px_at_110px_210px,#fff,transparent),radial-gradient(2px_2px_at_150px_180px,#fff,transparent)] bg-[length:200px_250px] animate-pulse"></div>

        {/* Ambient Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Mountains Silhouette */}
      <div className="fixed bottom-0 w-full z-10 pointer-events-none opacity-30 select-none">
        <svg viewBox="0 0 1000 320" className="w-full h-auto translate-y-8">
          <path
            fill="#020617"
            fillOpacity="1"
            d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,218.7C672,213,768,171,864,160C960,149,1056,171,1152,192C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Dashboard Mockup Layout */}
      <div className="relative z-20 flex min-h-screen">

        {/* Sidebar Mockup (Desktop) */}
        <aside className="hidden lg:flex w-72 flex-col bg-white/5 backdrop-blur-2xl border-r border-white/10 p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-700 font-black text-2xl shadow-lg shadow-white/10">B</div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">BillGST</span>
          </div>

          <nav className="space-y-4">
            {[
              { icon: FaHome, label: 'Dashboard', active: true },
              { icon: FaFileInvoiceDollar, label: 'Invoices' },
              { icon: FaUsers, label: 'Parties' },
              { icon: FaBox, label: 'Products' },
              { icon: FaChartBar, label: 'Reports' },
              { icon: FaHistory, label: 'History' },
              { icon: FaCog, label: 'Settings' }
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${item.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
                <item.icon className="text-xl" />
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="mt-auto p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-center space-y-3">
            <p className="font-bold text-sm">Need Help?</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-black transition-all">CONTACT US</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Public Header */}
          <header className="h-20 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50 px-6 md:px-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                <FaClock className="text-yellow-400" />
                <span className="text-sm font-bold opacity-80">Online Hub</span>
              </div>
              <h2 className="hidden md:block text-xl font-black uppercase italic tracking-wider">Welcome to <span className="text-indigo-400">BillGST</span></h2>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login" className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-extrabold transition-all text-sm uppercase">Login</Link>
              <Link href="/register" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-extrabold transition-all shadow-lg shadow-indigo-500/20 text-sm uppercase tracking-wider">Sign Up Free</Link>
            </div>
          </header>

          {/* Dashboard Contents */}
          <div className="p-6 md:p-12 space-y-10 max-w-7xl mx-auto w-full">

            {/* Hero Callout */}
            <div className="text-center md:text-left space-y-4 animate-fadeIn">
              <h1 className="text-4xl md:text-6xl font-black leading-tight drop-shadow-2xl">
                Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">GST Billing</span><br />
                Dashboard for Indian Business
              </h1>
              <p className="text-lg md:text-xl text-white/60 font-medium italic">Everything you need to manage stock, bills, and udhar in one place.</p>
            </div>

            {/* Quick Action Mockups */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-slideUp">
              {[
                { icon: FaReceipt, label: 'NEW INVOICE', color: 'bg-indigo-500 shadow-indigo-500/20' },
                { icon: FaUserPlus, label: 'ADD CUSTOMER', color: 'bg-emerald-500 shadow-emerald-500/20' },
                { icon: FaBoxOpen, label: 'ADD PRODUCT', color: 'bg-violet-500 shadow-violet-500/20' },
                { icon: FaChartLine, label: 'REPORTS', color: 'bg-amber-500 shadow-amber-500/20' }
              ].map((action, i) => (
                <div key={i} className={`${action.color} p-6 rounded-[28px] border-2 border-white/30 shadow-2xl flex flex-col items-center justify-center gap-3 transition-transform hover:scale-105 select-none`}>
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <action.icon className="text-3xl" />
                  </div>
                  <span className="text-xs md:text-sm font-black text-center">{action.label}</span>
                </div>
              ))}
            </div>

            {/* Business Overview Stats */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black italic border-l-4 border-indigo-500 pl-4 uppercase tracking-widest text-indigo-300">Market Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp">
                {[
                  { icon: FaRupeeSign, label: 'TODAY\'S SALES', value: '₹45,200', trend: '+12%', color: 'from-blue-600 to-indigo-700' },
                  { icon: FaChartLine, label: 'TOTAL REVENUE', value: '₹8.4L', trend: '+28%', color: 'from-violet-600 to-purple-800' },
                  { icon: FaFileInvoiceDollar, label: 'INVOICES', value: '1,240', trend: 'ACTIVE', color: 'from-emerald-600 to-teal-700' },
                  { icon: FaBox, label: 'STOCK ITEMS', value: '450', trend: 'GOOD', color: 'from-amber-600 to-orange-700' }
                ].map((stat, i) => (
                  <div key={i} className={`bg-gradient-to-br ${stat.color} p-8 rounded-[35px] border-2 border-white/20 shadow-2xl transition-transform hover:-translate-y-2`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <stat.icon size={24} />
                      </div>
                      <span className="text-[10px] font-black px-2 py-1 bg-white/20 rounded-full">{stat.trend}</span>
                    </div>
                    <p className="text-[10px] font-black opacity-60 uppercase mb-1">{stat.label}</p>
                    <p className="text-3xl font-black italic">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Mockup */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent"></div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <h3 className="text-3xl font-extrabold italic mb-2 tracking-tight">Growth Analytics</h3>
                  <p className="text-white/50 font-medium">Real-time performance tracking visualization</p>
                </div>
                <Link href="/register" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-full transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-3 scale-110">
                  SEE YOUR STATS <FaArrowRight />
                </Link>
              </div>

              <div className="h-64 flex items-end justify-between gap-4 md:gap-8 px-4 border-b border-white/10 pb-2">
                {[40, 65, 45, 90, 75, 55, 100, 80, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-xl transition-all duration-500 hover:scale-x-110" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <div className="flex justify-between mt-6 px-2 text-[10px] font-bold text-white/30 tracking-widest uppercase">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
              </div>
            </div>

            {/* Central High Impact CTA Banner */}
            <section className="py-20 relative rounded-[50px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-700 to-purple-800"></div>
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

              <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
                <h2 className="text-4xl md:text-6xl font-black mb-6 italic leading-none">Ready to Go <span className="text-yellow-400 underline decoration-indigo-400">Digital?</span></h2>
                <p className="text-xl text-indigo-100 font-bold mb-10 italic">Join 10,000+ businesses transform their billing today.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/register" className="w-full sm:w-auto px-12 py-6 bg-white text-indigo-950 text-2xl font-black rounded-full hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_0_0_#4338ca]">
                    START FOR FREE
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto px-12 py-6 bg-transparent border-4 border-white text-white text-2xl font-black rounded-full hover:bg-white hover:text-indigo-900 transition-all uppercase italic">
                    Login Hub
                  </Link>
                </div>
                <p className="mt-8 text-sm font-bold text-white/40 tracking-[0.3em] uppercase">No Credit Card • 100% Secure • GST Ready</p>
              </div>
            </section>

          </div>

          {/* Simple Public Footer */}
          <footer className="mt-auto py-10 border-t border-white/5 text-center text-white/30 text-xs font-black tracking-widest uppercase">
            <div className="flex justify-center gap-8 mb-6">
              <Link href="/blog" className="hover:text-white transition-colors">BLOG</Link>
              <a href="#" className="hover:text-white transition-colors">PRIVACY</a>
              <a href="#" className="hover:text-white transition-colors">TERMS</a>
            </div>
            <p>© {new Date().getFullYear()} BILLGST INDIA PREMIUM HUB</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
