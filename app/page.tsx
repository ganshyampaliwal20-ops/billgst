'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Keep the redirect for functional users, but show content for SEO crawlers/first paint
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000); // Increased delay slightly to let user see "Redirecting" or read a bit, mainly for SEO presence
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
          Free GST Billing Software <br className="hidden md:block" />
          <span className="text-blue-600">For Small Business</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          Create professional invoices, manage inventory, and track payments.
          100% Free, Secure, and Easy to use.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            Go to Dashboard
          </button>
        </div>

        {/* SEO Content Section */}
        <section className="mt-24 max-w-4xl mx-auto text-left space-y-8 pb-20">
          <article className="prose prose-lg prose-blue max-w-none">
            <h2 className="text-3xl font-bold text-gray-900">Why BillGST is the Best Free GST Billing Software?</h2>
            <p className="text-gray-600 leading-relaxed">
              If you are looking for a <strong>Free GST Billing Software</strong> that simplifies your daily accounting, BillGST is the perfect solution.
              Designed specifically for Indian small businesses, it helps you generate compliant invoices in seconds.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8">Key Features</h3>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">⚡ Instant Invoicing</h4>
                <p className="text-gray-600">Create GST bills with automatic tax calculations.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">📦 Stock Management</h4>
                <p className="text-gray-600">Track inventory and get low stock alerts automatically.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">📊 Payment Tracking</h4>
                <p className="text-gray-600">Monitor paid vs due amounts (Udhar) for every customer.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">📱 Mobile Friendly</h4>
                <p className="text-gray-600">Manage your business from your phone, anywhere, anytime.</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-8">How to make a GST Bill?</h3>
            <p className="text-gray-600">
              1. Click on "Go to Dashboard".<br />
              2. Add your products in the inventory.<br />
              3. Go to Invoices &gt; New Invoice.<br />
              4. Select customer and items. The software calculates CGST/SGST automatically.<br />
              5. Save and share PDF on WhatsApp.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
