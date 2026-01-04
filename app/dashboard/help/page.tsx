'use client';

import { FaWhatsapp, FaPhoneAlt, FaEnvelope, FaHeadset, FaVideo, FaBook } from 'react-icons/fa';
import Link from 'next/link';

export default function HelpPage() {
    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Help & Support</h1>
                <p className="text-slate-500 text-sm mt-1">We are here to help you grow your business.</p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

                {/* 1. WhatsApp Chat - Primary Action */}
                <Link
                    href="https://wa.me/919876543210?text=Hello,%20I%20need%20help%20with%20BillGST"
                    target="_blank"
                    className="bg-[#25D366] rounded-3xl p-6 shadow-xl shadow-green-100 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center gap-6 group border border-green-400/20"
                >
                    <div className="bg-white p-4 rounded-2xl text-[#25D366]">
                        <FaWhatsapp className="text-4xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white mb-1">Chat on WhatsApp</h2>
                        <p className="text-green-50 text-sm font-medium">Get instant replies from our team.</p>
                    </div>
                </Link>

                {/* 2. Call Support */}
                <a
                    href="tel:+919876543210"
                    className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center gap-6 group"
                >
                    <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FaPhoneAlt className="text-3xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 mb-1">Call Support</h2>
                        <p className="text-slate-500 text-sm font-medium">+91 98765 43210</p>
                    </div>
                </a>
            </div>

            {/* Additional Resources */}
            <h3 className="font-bold text-slate-700 mb-4 px-2">More Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <FaVideo className="text-lg" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Video Tutorials</h4>
                    <p className="text-xs text-slate-400 mt-1">Watch step-by-step guides.</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                        <FaBook className="text-lg" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">User Manual</h4>
                    <p className="text-xs text-slate-400 mt-1">Read detailed documentation.</p>
                </div>

                <a href="mailto:support@billgst.com" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                        <FaEnvelope className="text-lg" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Email Us</h4>
                    <p className="text-xs text-slate-400 mt-1">support@billgst.com</p>
                </a>
            </div>

            {/* Contact Card */}
            <div className="mt-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

                <FaHeadset className="text-4xl mx-auto mb-4 text-indigo-400" />
                <h2 className="text-2xl font-black mb-2">Need Custom Help?</h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">Our support team is available Mon-Sat, 9 AM to 7 PM to assist you with any billing issues.</p>
                <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-sm font-bold tracking-wide">
                    Support ID: #BG-{Math.floor(Math.random() * 10000)}
                </div>
            </div>
        </div>
    );
}
