import Link from 'next/link';
import { FaFileInvoice, FaChartLine, FaCheckCircle, FaRocket, FaArrowLeft } from 'react-icons/fa';

export const metadata = {
    title: 'Free GST Billing Software Features - BillGST',
    description: 'Explore the features of BillGST: Free GST Invoicing, Stock Management, Business Reports, and more for small businesses in India.',
};

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <header className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <nav className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard" className="flex items-center gap-2 text-indigo-100 hover:text-white transition">
                            <FaArrowLeft /> Back to Dashboard
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xl">
                            B
                        </div>
                        <span className="font-bold text-xl">BillGST</span>
                    </div>
                </nav>

                <div className="max-w-4xl mx-auto px-4 py-20 md:py-32 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                        Free GST Billing Software for <br className="hidden md:block" />
                        <span className="text-indigo-200">Small Business</span>
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Create professional invoices, manage inventory, and track payments easily.
                        100% Free and Secure for Indian businesses.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/dashboard"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-xl shadow-xl hover:bg-gray-50 hover:scale-105 transition transform"
                        >
                            Start Billing Now <FaRocket className="inline ml-2 mb-1" />
                        </Link>
                        <Link
                            href="/dashboard/invoices/new"
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-500/30 backdrop-blur-sm border border-white/20 text-white font-bold text-lg rounded-xl hover:bg-indigo-500/40 transition"
                        >
                            Create Invoice
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to grow</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Simple, powerful tools designed for medical shops, retailers, and distributors.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                                <FaFileInvoice size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">GST Invoicing</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Create compliant GST bills in seconds. Auto-calculate tax rates and share PDFs via WhatsApp.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                                <FaCheckCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Stock Management</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Track inventory automatically. Get alerts for low stock and expiry dates.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-6">
                                <FaChartLine size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Business Reports</h3>
                            <p className="text-gray-600 leading-relaxed">
                                View daily sales, profit margins, and customer ledgers to make smarter decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} BillGST. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-gray-500 hover:text-indigo-600 text-sm">Privacy Policy</Link>
                        <Link href="/terms" className="text-gray-500 hover:text-indigo-600 text-sm">Terms of Service</Link>
                        <Link href="/contact" className="text-gray-500 hover:text-indigo-600 text-sm">Contact Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
