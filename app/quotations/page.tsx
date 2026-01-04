'use client';

import Navbar3D from '@/app/components/Navbar3D';
import { useState } from 'react';
import { FaPaperPlane, FaFileInvoice, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function QuotationPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <>
            <Navbar3D />
            <main className="pt-28 md:pt-36 pb-10 bg-[#f8fafc] min-h-screen px-4">
                <div className="max-w-2xl mx-auto space-y-6">

                    <div className="text-center">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                            Request a <span className="text-indigo-600">Quotation</span>
                        </h1>
                        <p className="text-slate-500 text-sm">Fill out the form below to get a custom price quote for your requirements.</p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100">
                        {submitted ? (
                            <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaPaperPlane className="text-2xl" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Request Sent!</h2>
                                <p className="text-slate-500 text-sm mt-2">We will get back to you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Your Name</label>
                                        <div className="relative">
                                            <FaUser className="absolute left-3 top-3 text-slate-400" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="John Doe"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Phone Number</label>
                                        <div className="relative">
                                            <FaPhone className="absolute left-3 top-3 text-slate-400" />
                                            <input
                                                type="tel"
                                                required
                                                placeholder="+91 9876543210"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-3 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="john@example.com"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700"
                                        />
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Requirements</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
                                            <FaFileInvoice />
                                        </div>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="Tell us what you need..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 resize-none"
                                        ></textarea>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-sm md:text-base flex items-center justify-center gap-2"
                                >
                                    <FaPaperPlane />
                                    Send Request
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="flex justify-center gap-2 text-xs text-slate-400 font-medium">
                        <span>Need help?</span>
                        <a href="#" className="text-indigo-500 hover:underline">Contact Support</a>
                    </div>

                </div>
            </main>
        </>
    );
}
