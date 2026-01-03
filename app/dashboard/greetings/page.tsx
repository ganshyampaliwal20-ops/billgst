'use client';

import { useState } from 'react';
import { FaDownload, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

export default function GreetingsPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    const greetingTemplates = [
        {
            id: 1,
            occasion: 'Diwali',
            title: 'Happy Diwali!',
            message: 'Wishing you and your family a prosperous Diwali! May this festival of lights bring joy, health, and wealth to you.',
            image: 'https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=Happy+Diwali',
            colors: 'from-amber-500 to-orange-600'
        },
        {
            id: 2,
            occasion: 'New Year',
            title: 'Happy New Year 2026!',
            message: 'Wishing you a year filled with new opportunities, success, and happiness. Thank you for being a valued customer!',
            image: 'https://via.placeholder.com/600x400/8B5CF6/FFFFFF?text=Happy+New+Year',
            colors: 'from-purple-500 to-pink-600'
        },
        {
            id: 3,
            occasion: 'Holi',
            title: 'Happy Holi!',
            message: 'May your life be filled with colors of joy and happiness. Wishing you a vibrant and joyful Holi!',
            image: 'https://via.placeholder.com/600x400/EC4899/FFFFFF?text=Happy+Holi',
            colors: 'from-pink-500 to-rose-600'
        },
        {
            id: 4,
            occasion: 'Eid',
            title: 'Eid Mubarak!',
            message: 'Wishing you and your family a blessed Eid filled with peace, prosperity, and happiness!',
            image: 'https://via.placeholder.com/600x400/10B981/FFFFFF?text=Eid+Mubarak',
            colors: 'from-emerald-500 to-green-600'
        },
        {
            id: 5,
            occasion: 'Christmas',
            title: 'Merry Christmas!',
            message: 'Wishing you a joyful Christmas and a wonderful holiday season. May the spirit of Christmas fill your heart with love and happiness!',
            image: 'https://via.placeholder.com/600x400/EF4444/FFFFFF?text=Merry+Christmas',
            colors: 'from-red-500 to-rose-600'
        },
        {
            id: 6,
            occasion: 'Thank You',
            title: 'Thank You for Your Business!',
            message: 'We appreciate your continued support and trust in our services. Thank you for being a valued customer!',
            image: 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=Thank+You',
            colors: 'from-blue-500 to-indigo-600'
        }
    ];

    const sendGreeting = (method: string) => {
        if (!selectedTemplate) {
            alert('Please select a template first');
            return;
        }

        const message = `${selectedTemplate.title}\n\n${selectedTemplate.message}\n\nBest Regards,\nYour Business Name`;

        if (method === 'whatsapp') {
            const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        } else if (method === 'email') {
            alert('Email integration coming soon! Template: ' + selectedTemplate.occasion);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Festival Greetings</h1>
                <p className="text-sm text-slate-600 mt-1">Send festival wishes to your customers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Templates Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {greetingTemplates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => setSelectedTemplate(template)}
                            className={`bg-white rounded-2xl overflow-hidden shadow-lg border-2 cursor-pointer transition hover:shadow-xl ${selectedTemplate?.id === template.id ? 'border-indigo-600' : 'border-transparent'
                                }`}
                        >
                            <div className={`bg-gradient-to-br ${template.colors} p-4 text-white text-center`}>
                                <h3 className="text-lg font-bold">{template.occasion}</h3>
                            </div>
                            <img src={template.image} alt={template.occasion} className="w-full h-40 object-cover" />
                            <div className="p-4">
                                <h4 className="font-bold text-slate-800 mb-2">{template.title}</h4>
                                <p className="text-sm text-slate-600 line-clamp-3">{template.message}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Preview & Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-8">
                        {selectedTemplate ? (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 mb-4">Selected Template</h2>
                                    <div className={`bg-gradient-to-br ${selectedTemplate.colors} rounded-xl p-6 text-white text-center mb-4`}>
                                        <h3 className="text-2xl font-bold mb-3">{selectedTemplate.title}</h3>
                                        <p className="text-sm leading-relaxed">{selectedTemplate.message}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase">Send To Customers</h3>

                                    <button
                                        onClick={() => sendGreeting('whatsapp')}
                                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                                    >
                                        <FaWhatsapp /> Send via WhatsApp
                                    </button>

                                    <button
                                        onClick={() => sendGreeting('email')}
                                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                    >
                                        <FaEnvelope /> Send via Email
                                    </button>

                                    <button className="w-full py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition flex items-center justify-center gap-2">
                                        <FaDownload /> Download Image
                                    </button>
                                </div>

                                <div className="text-xs text-slate-500 text-center pt-4 border-t">
                                    <p>Personalize the message before sending to your customers</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                                <div className="text-6xl mb-4">🎉</div>
                                <p className="text-lg font-bold">Select a Template</p>
                                <p className="text-sm mt-2 text-center">Choose a greeting template to preview and send</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
