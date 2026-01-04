'use client';

import { FaHeadset, FaWhatsapp, FaEnvelope, FaPhone, FaQuestionCircle } from 'react-icons/fa';

export default function HelpPage() {
    const faqs = [
        {
            question: 'How do I create an invoice?',
            answer: 'Click on "New Invoice" from the dashboard, fill in customer and product details, then save and generate PDF.'
        },
        {
            question: 'How to add QR code to invoices?',
            answer: 'Go to Settings → Business Profile and add your UPI ID. QR codes will automatically appear on all invoices.'
        },
        {
            question: 'Can I manage inventory?',
            answer: 'Yes! Go to Inventory section to add products, track stock levels, and manage pricing.'
        },
        {
            question: 'How to export reports?',
            answer: 'Visit the Reports section, select your date range and filters, then click "Export PDF" or "Export Excel".'
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-4">
                    <FaHeadset className="text-4xl text-white" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Help & Support</h1>
                <p className="text-slate-500 text-sm mt-2">We're here to help you succeed</p>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                    href="https://wa.me/1234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all text-center group"
                >
                    <FaWhatsapp className="text-4xl mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg">WhatsApp</h3>
                    <p className="text-sm opacity-90 mt-1">Chat with us instantly</p>
                </a>

                <a
                    href="mailto:support@billgst.in"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all text-center group"
                >
                    <FaEnvelope className="text-4xl mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg">Email</h3>
                    <p className="text-sm opacity-90 mt-1">support@billgst.in</p>
                </a>

                <a
                    href="tel:+911234567890"
                    className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all text-center group"
                >
                    <FaPhone className="text-4xl mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg">Phone</h3>
                    <p className="text-sm opacity-90 mt-1">+91 123 456 7890</p>
                </a>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <FaQuestionCircle className="text-blue-600" />
                    Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <details
                            key={index}
                            className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-all group"
                        >
                            <summary className="font-bold text-slate-700 cursor-pointer list-none flex items-center justify-between">
                                <span>{faq.question}</span>
                                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-3 text-slate-600 leading-relaxed pl-4 border-l-4 border-blue-500">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-black mb-2">Need More Help?</h3>
                <p className="mb-6 opacity-90">Check out our comprehensive documentation</p>
                <a
                    href="/docs"
                    className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
                >
                    View Documentation
                </a>
            </div>
        </div>
    );
}
