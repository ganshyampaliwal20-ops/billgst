'use client';

import { FaSmile, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function GreetingsPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/20 max-w-2xl w-full text-center relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-500/30 transform hover:scale-110 transition-transform duration-300">
                        <FaSmile className="text-white text-4xl" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">
                        Festival Greetings
                    </h1>

                    <div className="inline-block px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-rose-100 italic animate-pulse">
                        Coming Soon
                    </div>

                    <p className="text-slate-600 text-lg mb-10 leading-relaxed font-medium">
                        Personalized festival and occasion greetings for your customers are on the way.
                        Strengthen your professional relationships with beautiful,
                        automated greetings.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-lg hover:shadow-slate-500/30 w-full sm:w-auto justify-center"
                        >
                            <FaArrowLeft size={14} />
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
