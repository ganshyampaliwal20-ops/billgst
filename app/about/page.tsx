import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar3D from '@/app/components/Navbar3D';

export const metadata: Metadata = {
    title: 'About Us - BillGST',
    description: 'Learn about BillGST, our mission to simplify billing for Indian small businesses, and our founder Ghanshyam Paliwal.',
};

export default function AboutPage() {
    return (
        <>
            <Navbar3D />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 pb-16 px-3 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32" style={{ paddingTop: 'calc(64px + env(safe-area-inset-top, 0px) + 1.5rem)' }}>
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/80">
                    <div className="relative py-12 sm:py-16 px-4 bg-indigo-600">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 opacity-95" />
                        <div className="relative h-full flex items-center justify-center text-center px-2">
                            <div>
                                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm">We Are BillGST</h1>
                                <p className="mt-3 text-sm sm:text-lg text-indigo-100 max-w-2xl mx-auto font-medium">
                                    Empowering Indian Small Businesses with Free, Professional Billing Solutions.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 sm:p-8 md:p-12 space-y-8 sm:space-y-12">
                        {/* Mission Section */}
                        <section className="text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                At BillGST, we believe that professional billing shouldn't be a luxury. Our mission is to provide small business owners across India with a **completely free**, easy-to-use, and powerful tool to manage their invoices, inventory, and customers. We want to help you focus on growing your business, not wrestling with paperwork.
                            </p>
                        </section>

                        {/* Features Grid */}
                        <section className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🚀</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Simplicity First</h3>
                                <p className="text-gray-600">Designed for everyone. No accounting knowledge needed to create professional invoices.</p>
                            </div>
                            <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🇮🇳</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Made for India</h3>
                                <p className="text-gray-600">Built specifically for Indian GST standards, ensuring full compliance and peace of mind.</p>
                            </div>
                            <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">💎</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Always Free</h3>
                                <p className="text-gray-600">Core features are and will always be free. No hidden charges for essential billing needs.</p>
                            </div>
                        </section>

                        {/* Founder Section */}
                        <section className="bg-gray-50 rounded-2xl p-8 md:p-10 border border-gray-200">
                            <div className="md:flex items-center gap-8">
                                {/* Placeholder for Founder Image if available, otherwise using initials/icon */}
                                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-4xl font-bold mx-auto md:mx-0 flex-shrink-0 border-4 border-white shadow-md">
                                    GP
                                </div>
                                <div className="text-center md:text-left mt-6 md:mt-0">
                                    <h2 className="text-2xl font-bold text-gray-900">Meet the Founder</h2>
                                    <h3 className="text-xl text-indigo-600 font-medium mb-4">Ghanshyam Paliwal</h3>
                                    <p className="text-gray-600 leading-relaxed mb-4">
                                        "I started BillGST with a simple vision: technology should bridge gaps, not create them. Seeing small shop owners struggle with complex and expensive software, I wanted to build something that was as simple as writing a bill on paper, but with the power of modern cloud computing. BillGST is my contribution to Digital India."
                                    </p>
                                    <div className="flex justify-center md:justify-start gap-4">
                                        {/* Social Links can be added here */}
                                        <Link href="#" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition">LinkedIn</Link>
                                        <Link href="#" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition">Twitter</Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Contact CTA */}
                        <section className="text-center pt-8 border-t border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Have Questions?</h2>
                            <p className="text-gray-600 mb-8">We'd love to hear from you. Whether it's feedback, support, or just a hello.</p>
                            <a href="mailto:billgstapp@gmail.com" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 md:text-lg md:px-10 shadow-lg hover:shadow-xl transition-all">
                                Contact Support
                            </a>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
