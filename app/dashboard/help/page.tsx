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
                    href="https://wa.me/7498571873"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all text-center group"
                >
                    <FaWhatsapp className="text-4xl mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg">WhatsApp</h3>
                    <p className="text-sm opacity-90 mt-1">Chat with us instantly</p>
                </a>

                <a
                    href="mailto:billgstapp@gmail.com"
                    className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all text-center group"
                >
                    <FaEnvelope className="text-4xl mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg">Email</h3>
                    <p className="text-sm opacity-90 mt-1">billgstapp@gmail.com</p>
                </a>

                <a
                    href="tel:+917498571873"
                    className="flex flex-col items-center justify-center bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all text-center group"
                >
                    <FaPhone className="text-4xl mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg">Phone</h3>
                    <p className="text-sm opacity-90 mt-1">+91 7498571873</p>
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

            {/* Quick Tips */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">💡 Quick Tips</h2>
                <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> Invoice banane ke baad WhatsApp se directly customer ko share karein.</li>
                    <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> Settings → Business Profile mein apna UPI ID add karein — invoices par QR code aayega.</li>
                    <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> Inventory mein low stock alert set karein taaki stock khatam hone se pehle pata chale.</li>
                    <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> Customers page se Balance Report CSV download karein accounting ke liye.</li>
                    <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> Reports section mein date range filter karke monthly/yearly reports dekhein.</li>
                </ul>
            </div>

            {/* Need More Help Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-black mb-2">📞 Turant Help Chahiye?</h3>
                <p className="mb-6 opacity-90">Hamare support team se seedha baat karein — bilkul free!</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                        href="https://wa.me/7498571873?text=Hello%2C%20mujhe%20BillGST%20app%20mein%20help%20chahiye."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:bg-green-50"
                    >
                        <FaWhatsapp className="text-xl" />
                        WhatsApp Support
                    </a>
                    <a
                        href="mailto:billgstapp@gmail.com?subject=BillGST%20Help%20Request"
                        className="inline-flex items-center justify-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-white/30"
                    >
                        <FaEnvelope className="text-xl" />
                        Email Support
                    </a>
                </div>
            </div>
        </div>
    );
}
