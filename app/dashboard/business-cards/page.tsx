'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaWhatsapp, FaEnvelope, FaQrcode } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';

export default function BusinessCardsPage() {
    const [businessInfo, setBusinessInfo] = useState({
        name: '',
        tagline: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        gstin: ''
    });

    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        // Load business profile from settings/store
        fetchBusinessProfile();
    }, []);

    const fetchBusinessProfile = async () => {
        try {
            const res = await fetch('/api/settings/business-profile');
            if (res.ok) {
                const data = await res.json();
                setBusinessInfo({
                    name: data.name || '',
                    tagline: data.tagline || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    website: data.website || '',
                    address: data.address || '',
                    gstin: data.gstin || ''
                });
            }
        } catch (error) {
            console.error('Error loading profile');
        }
    };

    const generateQRCode = async () => {
        const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${businessInfo.name}
ORG:${businessInfo.name}
TEL:${businessInfo.phone}
EMAIL:${businessInfo.email}
URL:${businessInfo.website}
ADR:;;${businessInfo.address};;;;
NOTE:GSTIN: ${businessInfo.gstin}
END:VCARD`;

        try {
            const url = await QRCode.toDataURL(vCard, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#4F46E5',
                    light: '#FFFFFF'
                }
            });
            setQrCodeUrl(url);
            setShowPreview(true);
            toast.success('Business Card Generated!');
        } catch (error) {
            toast.error('Failed to generate QR code');
        }
    };

    const downloadCard = () => {
        if (!qrCodeUrl) return;

        const link = document.createElement('a');
        link.download = `${businessInfo.name}-business-card.png`;
        link.href = qrCodeUrl;
        link.click();
        toast.success('Business card downloaded!');
    };

    const shareWhatsApp = () => {
        const text = `${businessInfo.name}\n${businessInfo.tagline}\n\n📞 ${businessInfo.phone}\n📧 ${businessInfo.email}\n🌐 ${businessInfo.website}\n📍 ${businessInfo.address}\n\nGSTIN: ${businessInfo.gstin}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Business Cards</h1>
                <p className="text-sm text-slate-600 mt-1">Generate digital business cards with QR code</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-6">
                    <h2 className="text-xl font-bold text-slate-800">Business Information</h2>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Business Name *</label>
                        <input
                            type="text"
                            value={businessInfo.name}
                            onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-cyan-500 outline-none"
                            placeholder="Your Business Name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tagline</label>
                        <input
                            type="text"
                            value={businessInfo.tagline}
                            onChange={(e) => setBusinessInfo({ ...businessInfo, tagline: e.target.value })}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-cyan-500 outline-none"
                            placeholder="Professional Billing Solutions"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone *</label>
                            <input
                                type="tel"
                                value={businessInfo.phone}
                                onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                                className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-cyan-500 outline-none"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                            <input
                                type="email"
                                value={businessInfo.email}
                                onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                                className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-cyan-500 outline-none"
                                placeholder="info@business.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Website</label>
                        <input
                            type="url"
                            value={businessInfo.website}
                            onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-cyan-500 outline-none"
                            placeholder="https://yourbusiness.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                        <textarea
                            value={businessInfo.address}
                            onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-cyan-500 outline-none h-24 resize-none"
                            placeholder="Business Address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">GSTIN</label>
                        <input
                            type="text"
                            value={businessInfo.gstin}
                            onChange={(e) => setBusinessInfo({ ...businessInfo, gstin: e.target.value })}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-cyan-500 outline-none"
                            placeholder="22AAAAA0000A1Z5"
                        />
                    </div>

                    <button
                        onClick={generateQRCode}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-2xl border-b-4 border-cyan-800 hover:-translate-y-1 hover:shadow-2xl transition flex items-center justify-center gap-3"
                    >
                        <FaQrcode /> Generate Business Card
                    </button>
                </div>

                {/* Preview Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Preview</h2>

                    {showPreview ? (
                        <div className="space-y-6">
                            {/* Business Card Design */}
                            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white">
                                <h3 className="text-2xl font-bold mb-2">{businessInfo.name}</h3>
                                <p className="text-cyan-100 mb-6">{businessInfo.tagline}</p>

                                <div className="space-y-2 text-sm">
                                    <p>📞 {businessInfo.phone}</p>
                                    <p>📧 {businessInfo.email}</p>
                                    {businessInfo.website && <p>🌐 {businessInfo.website}</p>}
                                    {businessInfo.gstin && <p>GSTIN: {businessInfo.gstin}</p>}
                                </div>
                            </div>

                            {/* QR Code */}
                            {qrCodeUrl && (
                                <div className="bg-slate-50 rounded-2xl p-8 flex flex-col items-center">
                                    <p className="text-sm font-bold text-slate-700 mb-4">Scan to Save Contact</p>
                                    <img src={qrCodeUrl} alt="Business QR Code" className="w-64 h-64 rounded-xl shadow-lg" />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={downloadCard}
                                    className="py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                                >
                                    <FaDownload /> Download
                                </button>
                                <button
                                    onClick={shareWhatsApp}
                                    className="py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                                >
                                    <FaWhatsapp /> Share
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                            <FaQrcode className="text-6xl mb-4" />
                            <p className="text-lg font-bold">No Card Generated Yet</p>
                            <p className="text-sm mt-2">Fill the form and click generate</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
