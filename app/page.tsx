'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaFileInvoice, FaRupeeSign, FaBoxes, FaWhatsapp, FaRobot, FaArrowRight, FaCheckCircle, FaStar, FaQuoteLeft, FaQuestionCircle, FaChevronDown } from 'react-icons/fa';

export default function LandingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/dashboard');
        }
    }, [status, router]);

    const stats = [
        { label: 'Active Users', value: '1,000+' },
        { label: 'Invoices Created', value: '50,000+' },
        { label: 'Uptime', value: '99.9%' }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <FaFileInvoice className="text-white text-xl" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">BillGST</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <a href="#features" className="hover:text-blue-600">Features</a>
                        <a href="#pricing" className="hover:text-blue-600">Pricing</a>
                        <a href="#faq" className="hover:text-blue-600">FAQ</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600">Sign in</Link>
                        <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10" />
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                        Professional Billing <br />
                        <span className="text-blue-600">Made Simple</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        Create GST invoices, manage inventory, and track payments with India's fastest-growing billing software.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2 text-lg">
                            Get Started for Free <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Powerful Features for Your Business</h2>
                        <p className="text-slate-600">Everything you need to manage your business in one place.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                                <FaFileInvoice size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">GST Billing</h3>
                            <p className="text-slate-600">Create professional GST compliant invoices in seconds with our easy-to-use interface.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6">
                                <FaBoxes size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Inventory Management</h3>
                            <p className="text-slate-600">Track stock levels in real-time, get low-stock alerts, and manage product variants effortlessly.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                                <FaWhatsapp size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">WhatsApp Bot</h3>
                            <p className="text-slate-600">Automate your business on WhatsApp. Send invoices, payment reminders, and status updates instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <FaFileInvoice className="text-blue-500 text-2xl" />
                            <span className="text-2xl font-bold">BillGST</span>
                        </div>
                        <p className="text-slate-400">Making business management simple for Indian retailers and wholesalers.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li><a href="#" className="hover:text-blue-500">Invoicing</a></li>
                            <li><a href="#" className="hover:text-blue-500">Inventory</a></li>
                            <li><a href="#" className="hover:text-blue-500">WhatsApp Bot</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li><a href="/about" className="hover:text-blue-500">About Us</a></li>
                            <li><a href="/blog" className="hover:text-blue-500">Blog</a></li>
                            <li><a href="/privacy" className="hover:text-blue-500">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Contact</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li>support@billgst.in</li>
                            <li>+91 1800 123 456</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-800 text-center text-slate-500 text-sm">
                    © {new Date().getFullYear()} BillGST. Built with ❤️ for India.
                </div>
            </footer>
        </div>
    );
}
