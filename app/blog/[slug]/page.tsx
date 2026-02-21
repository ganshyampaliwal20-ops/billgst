import Link from 'next/link';
import { FaArrowLeft, FaCalendar, FaUser, FaTag } from 'react-icons/fa';
import { blogPosts } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return { title: 'Post Not Found' };

    const url = `https://www.billgst.in/blog/${slug}`;

    return {
        title: `${post.title} - BillGST Blog`,
        description: post.description,
        keywords: [
            'GST billing software',
            'free billing software India',
            'GST invoice generator',
            'inventory management',
            'small business accounting',
            'GST 2.0',
            'e-invoice',
            'GSTR filing',
            post.category,
        ],
        authors: [{ name: post.author }],
        openGraph: {
            title: post.title,
            description: post.description,
            url: url,
            siteName: 'BillGST',
            locale: 'en_IN',
            type: 'article',
            publishedTime: new Date(post.date).toISOString(),
            authors: [post.author],
            tags: [post.category, 'GST', 'Billing', 'Business'],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            creator: '@billgst',
        },
        alternates: {
            canonical: url,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white flex flex-col items-center">
            {/* Navigation */}
            <nav className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/blog" className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition">
                        <FaArrowLeft /> All Posts
                    </Link>
                    <span className="font-bold text-xl text-gray-900">BillGST Blog</span>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-12 w-full">
                <article className="prose prose-lg prose-indigo max-w-none">
                    <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500 not-prose">
                        <span className="flex items-center gap-1">
                            <FaCalendar className="text-indigo-500" /> {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                            <FaUser className="text-indigo-500" /> {post.author}
                        </span>
                        <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                            <FaTag size={12} /> {post.category}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8">
                        {post.title}
                    </h1>

                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-10 not-prose">
                        <p className="text-indigo-900 font-medium text-lg italic">
                            "{post.description}"
                        </p>
                    </div>

                    <div
                        className="markdown-content"
                        dangerouslySetInnerHTML={{
                            __html: post.content
                                .split('\n')
                                .map(line => {
                                    if (line.trim().startsWith('# ')) return `<h1 class="text-3xl font-bold mt-8 mb-4">${line.trim().substring(2)}</h1>`;
                                    if (line.trim().startsWith('## ')) return `<h2 class="text-2xl font-bold mt-10 mb-6">${line.trim().substring(3)}</h2>`;
                                    if (line.trim().startsWith('### ')) return `<h3 class="text-xl font-bold mt-8 mb-4">${line.trim().substring(4)}</h3>`;
                                    if (line.trim().startsWith('- ')) return `<li class="ml-4 list-disc mb-2">${line.trim().substring(2)}</li>`;
                                    if (line.trim().match(/^\d+\./)) return `<li class="ml-4 list-decimal mb-2">${line.replace(/^\d+\.\s*/, '')}</li>`;
                                    if (line.trim() === '') return '<br/>';
                                    return `<p class="text-gray-700 leading-relaxed mb-4">${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
                                })
                                .join('')
                        }}
                    />

                    <div className="mt-16 p-8 bg-gray-900 rounded-2xl text-center text-white not-prose">
                        <h3 className="text-2xl font-bold mb-4">Ready to simplify your business?</h3>
                        <p className="text-gray-400 mb-8">Join thousands of businesses already using BillGST.</p>
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
