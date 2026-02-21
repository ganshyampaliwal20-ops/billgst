import Link from 'next/link';
import { FaArrowLeft, FaCalendar, FaTag, FaArrowRight } from 'react-icons/fa';
import { blogPosts } from '@/lib/blog-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'BillGST Blog - Free GST Billing Software Tips & Updates',
    description: 'Learn GST billing, inventory management, and business growth tips. Latest GST 2.0 updates, e-invoice guides, and free billing software tutorials for Indian businesses.',
    keywords: [
        'GST billing software blog',
        'free billing software India',
        'GST 2.0 updates',
        'e-invoice tutorial',
        'inventory management tips',
        'small business accounting',
        'GSTR filing guide',
        'business growth tips India',
    ],
    openGraph: {
        title: 'BillGST Blog - GST Billing & Business Tips',
        description: 'Latest GST updates, billing tips, and business growth guides for Indian entrepreneurs.',
        url: 'https://www.billgst.in/blog',
        siteName: 'BillGST',
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'BillGST Blog - GST Billing Tips',
        description: 'Latest GST updates and billing tips for Indian businesses',
        creator: '@billgst',
    },
    alternates: {
        canonical: 'https://www.billgst.in/blog',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
};

export default function BlogPage() {
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center">
            {/* Navigation */}
            <nav className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition">
                        <FaArrowLeft /> Back to Home
                    </Link>
                    <span className="font-bold text-xl text-gray-900">BillGST Blog</span>
                </div>
            </nav>

            <div className="max-w-[1600px] mx-auto px-4 py-12 w-full">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                        Grow Your Business with BillGST
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Latest updates, GST guides, and tips for Indian small business owners.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                        >
                            <div className="h-48 bg-indigo-600 flex items-center justify-center p-8 text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-700 opacity-90"></div>
                                <h3 className="text-2xl font-bold relative z-10 text-center line-clamp-2">
                                    {post.title}
                                </h3>
                                <div className="absolute bottom-4 left-4 z-10">
                                    <span className="bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md border border-white/20">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <FaCalendar className="text-indigo-500" /> {post.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaTag className="text-indigo-500" /> {post.category}
                                    </span>
                                </div>

                                <p className="text-gray-600 mb-6 line-clamp-3 text-sm flex-grow">
                                    {post.description}
                                </p>

                                <div className="text-indigo-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all text-sm">
                                    Read Full Post <FaArrowRight />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {blogPosts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No blog posts found. Check back soon!</p>
                    </div>
                )}
            </div>

            {/* CTA Section */}
            <section className="w-full bg-indigo-900 py-16 mt-12 text-white overflow-hidden relative">
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl font-bold mb-6">Ready to simplify your business?</h2>
                    <p className="text-indigo-200 text-lg mb-8">
                        Join 10,000+ businesses using BillGST for faster invoicing and growth.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-block px-10 py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition transform hover:scale-105 shadow-xl"
                    >
                        Start Billing for Free
                    </Link>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-800 rounded-full -ml-32 -mb-32 opacity-50 blur-3xl"></div>
            </section>
        </main>
    );
}
