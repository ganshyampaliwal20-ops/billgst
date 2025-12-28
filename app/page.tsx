import Link from 'next/link';
import { FaArrowRight, FaCheckCircle, FaChartLine, FaFileInvoiceDollar, FaMobileAlt } from 'react-icons/fa';

export const metadata = {
  title: 'BillGST - Free GST Billing Software & Stock Management App',
  description: 'Best free GST billing software for small business in India. Create professional invoices, manage inventory, track payments (Udhar), and grow your business.',
  keywords: ['gst billing software', 'free invoice maker', 'stock management', 'inventory software', 'small business billing', 'billgst'],
  alternates: {
    canonical: 'https://billgst.in',
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header / Nav */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo Placeholder */}
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
            <span className="text-2xl font-extrabold text-indigo-950 tracking-tight">BillGST</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition">Features</a>
            <a href="#benefits" className="hover:text-indigo-600 transition">Benefits</a>
            <Link href="/blog" className="hover:text-indigo-600 transition">Blog</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-600 font-semibold hover:text-indigo-600 hidden sm:block">
              Login
            </Link>
            <Link href="/dashboard" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
              Start for Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-50/50 skew-x-12 translate-x-32 -z-10" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-30 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-sm mb-8 animate-fadeIn">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            100% Free Lifetime for Small Business
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
            Billing Made <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Simple & Smart</span><br />
            <span className="relative inline-block">
              for Indian Business
              <svg className="absolute w-full h-3 -bottom-2 left-0 text-yellow-300 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed">
            Generate professional GST invoices, track inventory, and manage your 'Udhar-Jama' in seconds.
            No technical skills required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 hover:scale-105 transition shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
              Create First Invoice <FaArrowRight />
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 text-lg font-bold rounded-2xl border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition flex items-center justify-center gap-2">
              Explore Features
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-slate-100 pt-12">
            {[
              { label: 'Active Users', value: '10,000+' },
              { label: 'Invoices Created', value: '1M+' },
              { label: 'Time Saved', value: '500hrs' },
              { label: 'Cost', value: '₹0' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Everything you need to <span className="text-indigo-600">Grow</span></h2>
            <p className="text-lg text-slate-600">Professional tools simplified for daily use.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaFileInvoiceDollar className="text-4xl text-blue-500" />,
                title: "GST Invoicing",
                desc: "Create GST & Non-GST bills in 30 seconds. Share directly via WhatsApp."
              },
              {
                icon: <FaChartLine className="text-4xl text-green-500" />,
                title: "Stock Management",
                desc: "Auto-deduct stock on sale. Get alerts when items go low on inventory."
              },
              {
                icon: <FaMobileAlt className="text-4xl text-purple-500" />,
                title: "Mobile & Desktop",
                desc: "Works perfectly on mobile. Access your business data from anywhere."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Benefits */}
      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-10 text-white shadow-2xl transform rotate-1 hover:rotate-0 transition duration-500">
                <div className="flex items-center justify-between mb-8 border-b border-white/20 pb-4">
                  <span className="font-bold opacity-80">Invoice #001</span>
                  <span className="px-3 py-1 bg-green-500/20 rounded-full text-xs font-bold border border-green-400">PAID</span>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="h-4 w-2/3 bg-white/20 rounded"></div>
                  <div className="h-4 w-1/2 bg-white/20 rounded"></div>
                  <div className="h-4 w-3/4 bg-white/20 rounded"></div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-sm opacity-70">Total Amount</div>
                  <div className="text-3xl font-bold">₹ 14,500.00</div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
                Professional Invoices that get you <span className="text-indigo-600">Paid Faster</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Ditch the paper notebook. Switch to digital billing that looks professional and builds trust with your customers.
              </p>
              <ul className="space-y-4">
                {[
                  '100% Data Secure & Private',
                  'Access across multiple devices',
                  'Download PDF Reports',
                  '24/7 WhatsApp Support',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-semibold text-slate-700">
                    <FaCheckCircle className="text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/dashboard" className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-2">
                  Start Managing Business <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Start Your Digital Journey Today</h2>
          <p className="text-xl text-slate-400 mb-10">Join thousands of smart businessmen using BillGST.</p>
          <Link href="/dashboard" className="inline-block px-10 py-5 bg-indigo-600 text-white font-bold text-xl rounded-2xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/30">
            Get Started for Free
          </Link>
          <p className="mt-6 text-sm text-slate-500">No credit card required. Free forever plan available.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
          <p className="mb-4 text-sm">© {new Date().getFullYear()} BillGST. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-sm font-medium">
            <Link href="/blog" className="hover:text-indigo-600">Blog</Link>
            <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
