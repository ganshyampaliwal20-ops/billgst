import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export const metadata = {
    title: 'Free GST Billing Software Blog - Tips for Small Business',
    description: 'Learn how to manage inventory, create GST bills, and grow your small business with our free billing software guide.',
};

export default function BlogPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                    <span className="font-bold text-xl text-gray-900">BillGST Blog</span>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <article className="prose prose-lg prose-indigo max-w-none">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Why BillGST is the Best Free GST Billing Software?
                    </h1>

                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-8 not-prose">
                        <p className="text-indigo-900 font-medium text-lg">
                            Looking for a simple way to manage your business?
                            <Link href="/dashboard" className="underline font-bold ml-1 hover:text-indigo-700">
                                Try our Free Invoice Generator
                            </Link>
                        </p>
                    </div>

                    <p className="text-xl text-gray-600 leading-relaxed">
                        If you are looking for a <strong>Free GST Billing Software</strong> that simplifies your daily accounting, BillGST is the perfect solution.
                        Designed specifically for Indian small businesses, it helps you generate compliant invoices in seconds.
                    </p>

                    <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">How to Grow Your Business with Proper Billing?</h2>
                    <p>
                        Proper billing is not just about compliance; it's about building trust. When you provide a professional
                        computerized invoice (GST Bill) to your customer, it enhances your brand value. using tools like
                        <strong>BillGST</strong> helps you track payments and avoid losses due to forgotten "Udhar" (credit).
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Features You Need</h3>
                    <ul className="list-none grid md:grid-cols-2 gap-6 pl-0 my-8 not-prose">
                        <li className="p-6 bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition">
                            <h4 className="font-bold text-gray-900 mb-2 text-lg">⚡ Instant Invoicing</h4>
                            <p className="text-gray-600">Create GST bills with automatic tax calculations.</p>
                        </li>
                        <li className="p-6 bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition">
                            <h4 className="font-bold text-gray-900 mb-2 text-lg">📦 Stock Management</h4>
                            <p className="text-gray-600">Track inventory and get low stock alerts automatically.</p>
                        </li>
                        <li className="p-6 bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition">
                            <h4 className="font-bold text-gray-900 mb-2 text-lg">📊 Payment Tracking</h4>
                            <p className="text-gray-600">Monitor paid vs due amounts (Udhar) for every customer.</p>
                        </li>
                        <li className="p-6 bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition">
                            <h4 className="font-bold text-gray-900 mb-2 text-lg">📱 Mobile Friendly</h4>
                            <p className="text-gray-600">Manage your business from your phone, anywhere, anytime.</p>
                        </li>
                    </ul>

                    <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How to make a GST Bill Online?</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                        <li>Open <strong>BillGST Dashboard</strong>.</li>
                        <li>Add your products in the inventory tab functionality.</li>
                        <li>Go to <strong>Invoices &gt; New Invoice</strong>.</li>
                        <li>Select customer and items. The software calculates CGST/SGST automatically.</li>
                        <li>Save and share the PDF on WhatsApp instantly.</li>
                    </ol>

                    <div className="mt-12 p-8 bg-gray-900 rounded-2xl text-center text-white not-prose">
                        <h3 className="text-2xl font-bold mb-4">Ready to simplify your business?</h3>
                        <Link
                            href="/dashboard"
                            className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition shadow-lg hover:shadow-blue-500/30"
                        >
                            Start Billing for Free
                        </Link>
                    </div>
                </article>
            </div>
        </main>
    );
}
