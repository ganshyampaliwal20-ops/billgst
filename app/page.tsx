'use client';

import { FaFileInvoice, FaRupeeSign, FaUsers, FaBox, FaChartLine, FaStore, FaCheckCircle, FaMobileAlt, FaCloud, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const features = [
    {
      icon: FaFileInvoice,
      title: 'Professional GST Invoices',
      description: 'Create beautiful, GST-compliant invoices in seconds',
      color: 'from-indigo-500 to-indigo-700'
    },
    {
      icon: FaUsers,
      title: 'Customer Management',
      description: 'Track all your customers and their purchase history',
      color: 'from-emerald-500 to-teal-700'
    },
    {
      icon: FaBox,
      title: 'Inventory Tracking',
      description: 'Manage stock levels with automatic low-stock alerts',
      color: 'from-violet-500 to-purple-700'
    },
    {
      icon: FaChartLine,
      title: 'Business Analytics',
      description: 'Get insights into sales, profit, and business growth',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const benefits = [
    'Free forever - No hidden charges',
    'Works offline - No internet needed',
    'Multi-language support - Hindi, English, Marathi',
    'WhatsApp sharing - Send invoices instantly',
    'GST compliant - CGST, SGST, IGST support',
    'Secure data - Your data stays with you'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-violet-700 p-4 md:p-6 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center p-2 backdrop-blur-sm border border-white/30">
              <div className="w-full h-full bg-[#38bdf8] rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl italic uppercase">B</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-none">
                BillGST
              </h1>
              <p className="text-[10px] md:text-xs font-bold opacity-70 uppercase tracking-[0.2em] mt-1">Professional Billing</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/login" className="text-xs font-black uppercase px-4 py-2 border border-white/30 rounded-full hover:bg-white/10 transition-all">Login</Link>
            <Link href="/register" className="text-xs font-black uppercase px-4 py-2 bg-white text-indigo-700 rounded-full hover:bg-white/90 transition-all">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-24">
        <div className="text-center space-y-6 md:space-y-8">
          <div className="inline-block">
            <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider">
              Free GST Billing Software
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-800 tracking-tight leading-tight">
            Apne Business Ko<br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Professional Banayein
            </span>
          </h2>

          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            Complete billing solution for small businesses. Create GST invoices, manage inventory, track customers, and grow your business - all for free!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/register"
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-black text-lg rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/40 transition-all hover:-translate-y-1 active:scale-95 border-2 border-indigo-400/30 w-full sm:w-auto text-center"
            >
              Start Free Now →
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white text-indigo-700 font-black text-lg rounded-2xl hover:shadow-xl transition-all border-2 border-indigo-200 hover:border-indigo-300 w-full sm:w-auto text-center"
            >
              Try Without Signup
            </Link>
          </div>

          <p className="text-sm text-slate-500 font-medium">
            ✓ No credit card required  ✓ Works offline  ✓ Data stays with you
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h3 className="text-3xl md:text-5xl font-black text-slate-800 mb-4">
            Everything You Need
          </h3>
          <p className="text-lg text-slate-600 font-medium">
            Powerful features to manage your entire business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-2xl text-white" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-3xl md:text-5xl font-black text-white mb-4">
              Why Choose BillGST?
            </h3>
            <p className="text-lg text-indigo-100 font-medium">
              Built for Indian businesses, by Indian developers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <FaCheckCircle className="text-2xl text-green-300 flex-shrink-0 mt-1" />
                  <p className="text-white font-bold text-lg">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-24">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-16 text-center shadow-2xl">
          <FaStore className="text-6xl text-indigo-400 mx-auto mb-6" />
          <h3 className="text-3xl md:text-5xl font-black text-white mb-6">
            Ready to Grow Your Business?
          </h3>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using BillGST for their billing needs
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black text-xl rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/40 transition-all hover:-translate-y-1 active:scale-95"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">B</span>
            </div>
            <span className="text-xl font-black text-white">BillGST</span>
          </div>
          <p className="text-sm mb-4">
            Professional billing software for Indian businesses
          </p>
          <p className="text-xs text-slate-500">
            © 2025 BillGST. Made with ❤️ in India
          </p>
        </div>
      </footer>

      {/* Hidden SEO Content */}
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
