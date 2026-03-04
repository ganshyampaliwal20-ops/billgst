'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FaSave, FaStore, FaImage, FaLanguage, FaFileInvoiceDollar, FaUserLock, FaSignInAlt, FaUserPlus, FaUniversity, FaBolt, FaClock, FaPenNib, FaSync, FaWhatsapp } from 'react-icons/fa';
import SignatureModal from '@/app/components/SignatureModal';
import { QRCodeCanvas } from 'qrcode.react';

const THEMES = {
    TEMPLATE_1: { accent: '#5d5088', title: '#8b7eb0' }, // Modern Purple
    TEMPLATE_2: { accent: '#1e40af', title: '#3b82f6' }, // Royal Blue
    TEMPLATE_3: { accent: '#334155', title: '#64748b' }, // Slate Gray
    TEMPLATE_4: { accent: '#c2410c', title: '#f97316' }, // Energetic Orange
    TEMPLATE_5: { accent: '#059669', title: '#10b981' }, // Classic Green
};

export default function SettingsPage() {
    const { businessProfile, updateProfile, saveBusinessProfile, settings, updateSettings } = useStore();
    const [formData, setFormData] = useState(businessProfile || {});
    const [localSettings, setLocalSettings] = useState(settings || {});
    const [isClient, setIsClient] = useState(false);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setFormData(businessProfile);
        setLocalSettings(settings);
    }, [businessProfile, settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Save to database via new function - merging local settings
        await saveBusinessProfile({ ...formData, ...localSettings });

        // Also update local store settings (though store already has them)
        updateSettings(localSettings);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, logo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isClient) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 px-[5px] pb-10">
            <h1 className="text-2xl font-bold text-gray-800" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px' }}>Business Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-6" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>
                {/* Tax Settings (Non-GST Mode) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <FaFileInvoiceDollar className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800" style={{ paddingLeft: '2px', paddingRight: '8px', paddingTop: '0px' }}>Tax Settings</h2>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-gray-800" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>I have a GST Number</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={!localSettings.nonGstMode || false}
                                        onChange={(e) => setLocalSettings({ ...localSettings, nonGstMode: !e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <p className="text-sm text-gray-500 mt-1" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Enable this if your business is registered under GST. If you don't have a GST number, turn it off.</p>
                        </div>
                    </div>
                </div>

                {/* Business Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '5px' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FaStore className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Business Profile</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Business Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Enter business name" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                            />
                        </div>

                        {/* Show GSTIN only if Non-GST Mode is OFF */}
                        {!localSettings.nonGstMode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>GSTIN</label>
                                <input
                                    type="text"
                                    value={formData.gstin || ''}
                                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="22AAAAA0000A1Z5" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                                />
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Address</label>
                            <textarea
                                rows={3}
                                value={formData.address || ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Business address" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="+91 9999999999" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Email</label>
                            <input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="business@example.com" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                            />
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                <label className="block text-sm font-bold text-indigo-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>UPI ID (for QR Code)</label>
                                <input
                                    type="text"
                                    value={formData.upi_id || ''}
                                    onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                                    placeholder="example@upi" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                                />
                                <p className="text-[10px] text-indigo-500 mt-1 font-medium italic" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>यह ID आपके इनवॉइसेस पर पेमेंट QR कोड जनरेट करने के लिए उपयोग होगी।</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Authorized Signatory Name</label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={formData.owner_name || ''}
                                        onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-bold"
                                        placeholder="Person name for signature" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                                    />

                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsSignatureModalOpen(true)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-600 font-black text-xs hover:bg-slate-100 transition-all uppercase tracking-widest"
                                        >
                                            <FaPenNib className="text-blue-500" />
                                            {formData.signature ? 'Change Signature' : 'Draw Digital Signature'}
                                        </button>

                                        {formData.signature && (
                                            <div className="w-24 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-sm">
                                                <img src={formData.signature} alt="Sign" className="max-h-full max-w-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic">Your signature will be printed on invoices and quotations.</p>
                                </div>
                            </div>

                            <SignatureModal
                                isOpen={isSignatureModalOpen}
                                onClose={() => setIsSignatureModalOpen(false)}
                                onSave={(data) => setFormData({ ...formData, signature: data })}
                            />
                        </div>
                    </div>
                </div>

                {/* Bank Details Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <FaUniversity className="text-xl" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Bank Account Details</h2>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${formData.show_bank_details ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {formData.show_bank_details ? 'ON' : 'OFF'}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.show_bank_details}
                                    onChange={(e) => setFormData({ ...formData, show_bank_details: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${formData.show_bank_details ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Bank Name</label>
                            <input
                                type="text"
                                value={formData.bank_name || ''}
                                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="e.g. State Bank of India" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Account Number</label>
                            <input
                                type="text"
                                value={formData.account_no || ''}
                                onChange={(e) => setFormData({ ...formData, account_no: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Enter A/C number" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>IFSC Code</label>
                            <input
                                type="text"
                                value={formData.ifsc_code || ''}
                                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="SBIN0001234" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Branch Name</label>
                            <input
                                type="text"
                                value={formData.branch_name || ''}
                                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Branch location" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Account Holder Name</label>
                            <input
                                type="text"
                                value={formData.account_holder || ''}
                                onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Name as per bank records" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Branding Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <FaImage className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800" style={{ paddingLeft: '2px', paddingRight: '8px', paddingTop: '0px' }}>Branding</h2>
                    </div>

                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                            {formData.logo ? (
                                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 text-xs text-center px-2">No Logo</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                            />
                            <p className="mt-2 text-xs text-gray-500">Recommended size: 200x200px. Max size: 2MB.</p>
                        </div>
                    </div>

                </div>

                {/* Invoice Templates Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <FaFileInvoiceDollar className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Invoice Color Theme</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {[
                            { id: 'TEMPLATE_1', name: 'Modern Purple', color: 'bg-purple-600' },
                            { id: 'TEMPLATE_2', name: 'Royal Blue', color: 'bg-blue-600' },
                            { id: 'TEMPLATE_3', name: 'Slate Gray', color: 'bg-slate-600' },
                            { id: 'TEMPLATE_4', name: 'Energetic Orange', color: 'bg-orange-600' },
                            { id: 'TEMPLATE_5', name: 'Classic Green', color: 'bg-green-600' },
                        ].map((tpl) => (
                            <button
                                key={tpl.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, invoice_template: tpl.id })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.invoice_template === tpl.id
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-100 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`w-12 h-16 rounded shadow-inner ${tpl.color} relative`}>
                                    <div className="absolute top-1 left-1 right-1 h-1 bg-white/20 rounded-full" />
                                    <div className="absolute top-3 left-1 right-3 h-1 bg-white/10 rounded-full" />
                                </div>
                                <span className={`text-[10px] font-bold ${formData.invoice_template === tpl.id ? 'text-blue-700' : 'text-gray-500'}`}>
                                    {tpl.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Invoice Table Layout Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg">
                            <FaFileInvoiceDollar className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Invoice Table Layout</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        {[
                            { id: 'FORMAT_1', name: 'Standard', desc: 'Default Look', icon: 'M4 4h16v16H4V4zm2 2v12h12V6H6z' },
                            { id: 'FORMAT_2', name: 'Grid Box', desc: 'Full Borders', icon: 'M4 4h16v16H4V4zm2 2v4h12V6H6zm0 6v4h12v-4H6zm0 6v2h12v-2H6z' },
                            { id: 'FORMAT_3', name: 'Minimal', desc: 'Clean Lines', icon: 'M4 6h16v2H4V6zm0 6h16v2H4v-2zm0 6h16v2H4v-2z' },
                            { id: 'FORMAT_4', name: 'Modern', desc: 'Striped Rows', icon: 'M4 4h16v4H4V4zm0 6h16v4H4v-4zm0 6h16v4H4v-4z' },
                            { id: 'FORMAT_5', name: 'Compact', desc: 'More Items', icon: 'M4 5h16v2H4V5zm0 4h16v2H4V9zm0 4h16v2H4v-2zm0 4h16v2H4v-2z' },
                        ].map((fmt) => (
                            <button
                                key={fmt.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, invoice_table_format: fmt.id })}
                                className={`flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border-2 transition-all ${formData.invoice_table_format === fmt.id
                                    ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500'
                                    : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <svg
                                    className={`w-8 h-8 md:w-10 md:h-10 ${formData.invoice_table_format === fmt.id ? 'text-blue-600' : 'text-gray-400'}`}
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d={fmt.icon} />
                                </svg>
                                <div className="text-center">
                                    <span className={`block text-[10px] md:text-xs font-bold ${formData.invoice_table_format === fmt.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                        {fmt.name}
                                    </span>
                                    <span className="hidden md:block text-[10px] text-gray-500 mt-1">
                                        {fmt.desc}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Logo Alignment on Invoice</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'LEFT', name: 'Left Border', icon: '⬅️' },
                                { id: 'CENTER', name: 'Center Top', icon: '🔼' },
                                { id: 'RIGHT', name: 'Right Side', icon: '➡️' },
                            ].map((pos) => (
                                <button
                                    key={pos.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, logo_position: pos.id })}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.logo_position === pos.id
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                        : 'border-gray-50 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-xl">{pos.icon}</span>
                                    <span className="text-[10px] font-bold uppercase">{pos.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8"></div>

                    {/* LIVE PREVIEW SECTION */}
                    <div className="mt-8 border-2 border-dashed border-slate-200 rounded-3xl p-2 sm:p-6 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                Live Demo Preview
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">Sample Data Attached</span>
                        </div>

                        {/* THE PREVIEW PAPER */}
                        <div className={`bg-white shadow-2xl rounded-sm mx-auto overflow-hidden transition-all duration-500 border border-slate-200 w-full max-w-[500px] min-h-[400px] select-none scale-[0.95] sm:scale-100`}
                            style={{ fontFamily: formData.invoice_template === 'TEMPLATE_3' ? 'serif' : 'sans-serif' }}>

                            {/* Header Section */}
                            <div className={`p-6 border-b flex ${formData.logo_position === 'CENTER'
                                ? 'flex-col items-center text-center'
                                : formData.logo_position === 'LEFT'
                                    ? 'flex-row-reverse justify-between items-start text-left'
                                    : 'flex-row justify-between items-start text-left'
                                }`}>
                                {formData.logo_position === 'CENTER' && (
                                    <div className="text-[10px] font-bold uppercase mb-2" style={{ color: THEMES[formData.invoice_template as keyof typeof THEMES]?.accent || '#5d5088' }}>TAX INVOICE</div>
                                )}
                                <div className={formData.logo_position === 'CENTER' ? 'order-2' : 'flex-1'}>
                                    <h4 className="text-lg font-black uppercase text-slate-800 leading-tight">{formData.name || 'YOUR BUSINESS NAME'}</h4>
                                    <p className="text-[9px] text-slate-500 mt-1 max-w-[200px] mx-auto uppercase font-bold">{formData.address || 'Street Name, City, State - 000000'}</p>
                                    <p className="text-[9px] text-slate-400 font-bold">Mob: {formData.phone || '+91 0000000000'}</p>
                                </div>

                                {formData.logo ? (
                                    <img src={formData.logo} alt="Logo" className={`w-12 h-12 object-contain ${formData.logo_position === 'CENTER' ? 'order-1 mb-2' : ''}`} />
                                ) : (
                                    <div className={`w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-[8px] text-slate-300 font-bold border-2 border-dashed border-slate-200 ${formData.logo_position === 'CENTER' ? 'order-1 mb-2' : ''}`}>LOGO</div>
                                )}

                                {formData.logo_position !== 'CENTER' && (
                                    <div className={`text-right ${formData.logo_position === 'LEFT' ? 'order-3' : ''}`}>
                                        <h4 className="text-lg font-black italic tracking-tight" style={{ color: THEMES[formData.invoice_template as keyof typeof THEMES]?.accent || '#5d5088' }}>TAX INVOICE</h4>
                                    </div>
                                )}
                            </div>

                            {/* Client Section & Info */}
                            <div className="p-6 flex justify-between text-[9px]">
                                <div>
                                    <p className="font-bold text-slate-400 uppercase tracking-tighter mb-1">Bill To:</p>
                                    <p className="text-[12px] font-black text-slate-800">Ramesh Kumar</p>
                                    <p className="text-slate-500 font-medium">South Extension Part I, Delhi</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-800">Inv #: <span className="text-slate-500">IV-101</span></p>
                                    <p className="font-bold text-slate-800">Date: <span className="text-slate-500">24-01-2026</span></p>
                                </div>
                            </div>

                            {/* TABLE PREVIEW */}
                            <div className="px-6 pb-6 mt-2">
                                <table className={`w-full text-left text-[9px] border-collapse ${formData.invoice_table_format === 'FORMAT_2' ? 'border' : ''}`}>
                                    <thead style={{
                                        backgroundColor: formData.invoice_table_format === 'FORMAT_3' ? 'transparent' : (THEMES[formData.invoice_template as keyof typeof THEMES]?.accent || '#5d5088'),
                                        color: formData.invoice_table_format === 'FORMAT_3' ? (THEMES[formData.invoice_template as keyof typeof THEMES]?.accent || '#5d5088') : '#fff'
                                    }}>
                                        <tr className={formData.invoice_table_format === 'FORMAT_3' ? 'border-b-2' : ''} style={{ borderColor: THEMES[formData.invoice_template as keyof typeof THEMES]?.accent }}>
                                            <th className={`p-2 font-black ${formData.invoice_table_format === 'FORMAT_2' ? 'border text-black' : ''}`}>#</th>
                                            <th className={`p-2 font-black ${formData.invoice_table_format === 'FORMAT_2' ? 'border text-black' : ''}`}>Item Name</th>
                                            <th className={`p-2 font-black text-center ${formData.invoice_table_format === 'FORMAT_2' ? 'border text-black' : ''}`}>Qty</th>
                                            <th className={`p-2 font-black text-right ${formData.invoice_table_format === 'FORMAT_2' ? 'border text-black' : ''}`}>Price</th>
                                            <th className={`p-2 font-black text-right ${formData.invoice_table_format === 'FORMAT_2' ? 'border text-black' : ''}`}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { n: 'Premium Cotton Shirt', q: 2, p: 1200 },
                                            { n: 'Office Table Lamp', q: 1, p: 850 },
                                        ].map((it, i) => (
                                            <tr key={i} className={`
                                                ${formData.invoice_table_format === 'FORMAT_4' && i % 2 !== 0 ? 'bg-slate-50' : ''}
                                                ${formData.invoice_table_format === 'FORMAT_3' || formData.invoice_table_format === 'FORMAT_2' ? 'border-b' : ''}
                                            `}>
                                                <td className={`p-2 font-bold ${formData.invoice_table_format === 'FORMAT_5' ? 'py-1' : ''} ${formData.invoice_table_format === 'FORMAT_2' ? 'border' : ''}`}>{i + 1}</td>
                                                <td className={`p-2 font-bold ${formData.invoice_table_format === 'FORMAT_5' ? 'py-1' : ''} ${formData.invoice_table_format === 'FORMAT_2' ? 'border' : ''}`}>{it.n}</td>
                                                <td className={`p-2 text-center font-bold ${formData.invoice_table_format === 'FORMAT_5' ? 'py-1' : ''} ${formData.invoice_table_format === 'FORMAT_2' ? 'border' : ''}`}>{it.q}</td>
                                                <td className={`p-2 text-right font-bold ${formData.invoice_table_format === 'FORMAT_5' ? 'py-1' : ''} ${formData.invoice_table_format === 'FORMAT_2' ? 'border' : ''}`}>₹{it.p.toFixed(2)}</td>
                                                <td className={`p-2 text-right font-bold ${formData.invoice_table_format === 'FORMAT_5' ? 'py-1' : ''} ${formData.invoice_table_format === 'FORMAT_2' ? 'border' : ''}`}>₹{(it.q * it.p).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Totals Preview */}
                                <div className="mt-8 flex justify-end">
                                    <div className="w-[120px] space-y-2">
                                        <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                            <span>Subtotal:</span>
                                            <span>₹3250.00</span>
                                        </div>
                                        <div className="flex justify-between p-2 rounded text-[12px] font-black text-white shadow-lg" style={{ backgroundColor: THEMES[formData.invoice_template as keyof typeof THEMES]?.accent || '#5d5088' }}>
                                            <span>Total:</span>
                                            <span>₹3250.00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Mock */}
                            <div className="p-6 pt-0 flex justify-between items-end">
                                <div className="w-16 h-16 bg-slate-100 rounded border-2 border-dashed border-slate-300 flex items-center justify-center text-[7px] font-black opacity-30">UPI QR</div>
                                <div className="text-right">
                                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">For {formData.name || 'YOUR BUSINESS'}</p>

                                    <div className="w-24 h-px bg-slate-400 mb-1 ml-auto"></div>
                                    <p className="text-[8px] font-black uppercase text-slate-800">Authorized Signatory</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WhatsApp AI Bot Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <FaBolt className="text-xl" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">WhatsApp AI Agent (Beta)</h2>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={localSettings.whatsappBotEnabled || false}
                                onChange={(e) => setLocalSettings({ ...localSettings, whatsappBotEnabled: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    <div className={`space-y-4 transition-all ${localSettings.whatsappBotEnabled ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-xs font-bold text-emerald-800 mb-2 uppercase tracking-tight">How it works:</p>
                            <p className="text-xs text-emerald-700 leading-relaxed italic">
                                Jab aapka customer aapko WhatsApp karega, hamara AI Agent unhe reply dega. Wo unka pending balance bata sakta hai, invoice bhej sakta hai aur payment QR bhi dikha sakta hai.
                            </p>
                        </div>

                        {localSettings.whatsappBotEnabled && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="border border-slate-200 rounded-xl p-6 bg-white text-center">
                                    <h3 className="text-sm font-bold text-gray-800 mb-2">Link your WhatsApp Number</h3>
                                    <p className="text-xs text-gray-500 mb-4 px-4">
                                        Apne phone ke WhatsApp se is QR code ko scan karein. Aapke customers ko reply aapke is number se hi jayega.
                                    </p>
                                    <div className="flex justify-center mb-4">
                                        {/* QR Code Canvas */}
                                        <div className="w-40 h-40 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group hover:border-emerald-400 transition-colors cursor-pointer">
                                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-10">
                                                <FaSync className="text-emerald-500 text-2xl mb-1 min-w-max" />
                                                <span className="text-[10px] font-bold text-emerald-700">Click to Refresh QR</span>
                                            </div>
                                            <div className="p-2 bg-white rounded-md shadow-sm filter blur-[2px] opacity-60">
                                                <QRCodeCanvas value={"https://billgst.com/connect?id=" + Math.random()} size={120} />
                                            </div>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/70 backdrop-blur-sm z-20 group-hover:hidden">
                                                <FaWhatsapp className="text-emerald-500 text-2xl mb-1 min-w-max" />
                                                <span className="text-[10px] font-black text-slate-700 text-center leading-tight">Connecting Setup...<br />Coming Soon</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => toast.success('Aapka device connect karne ka system jaldi hi update hoga!')}
                                        className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-slate-800 transition-colors"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#25D366" /><path fillRule="evenodd" clipRule="evenodd" d="M17.8427 6.16279C16.2952 4.61578 14.234 3.76562 12.0427 3.76562C7.54041 3.76562 3.88177 7.42426 3.88177 11.9264C3.88177 13.3644 4.2568 14.7621 5.00688 15.9897L3.79199 20.4287L8.33785 19.231C9.52841 19.9077 10.7419 20.2523 12.0427 20.2523H12.0475C16.5498 20.2523 20.2084 16.5937 20.2084 12.0915C20.2084 9.90483 19.3562 7.72898 17.8427 6.16279ZM12.0428 18.8687C10.751 18.8687 9.47967 18.524 8.35821 17.859L8.08639 17.6953L5.38541 18.4069L6.11059 15.7607L5.93297 15.4851C5.20327 14.3218 4.82583 12.9697 4.82583 11.9224C4.82583 7.94273 8.06803 4.70054 12.0475 4.70054C13.9749 4.70054 15.7725 5.45163 17.1352 6.81436C18.4979 8.17709 19.2489 9.97463 19.2489 11.902C19.2489 15.8817 16.0357 19.1239 12.0561 19.1239" fill="white" /><path d="M16.0628 14.2238C15.8623 14.1236 14.8727 13.6358 14.6934 13.5714C14.5142 13.5069 14.3852 13.4747 14.2562 13.6752C14.1272 13.8757 13.7618 14.3054 13.6543 14.4344C13.5468 14.5633 13.4393 14.5776 13.2388 14.4774A8.77494 8.77494 0 0 1 10.6666 12.8953C9.66416 11.8929 8.99121 10.8693 8.88373 10.6688C8.77625 10.4683 8.87326 10.3609 8.97354 10.2606C9.06666 10.1675 9.16694 10.0458 9.26723 9.93836C9.36751 9.8309 9.40333 9.7521 9.47496 9.616C9.54659 9.47989 9.51078 9.3581 9.46063 9.25781C9.41049 9.15753 8.7658 7.57448 8.49359 6.93699C8.22855 6.31383 7.96582 6.39343 7.76678 6.39054C7.5877 6.39054 7.40862 6.388 7.22954 6.388C7.05045 6.388 6.76392 6.45247 6.51319 6.72468C6.26247 6.99689 5.56046 7.64155 5.56046 8.95254C5.56046 10.2635 6.54185 11.5315 6.67795 11.7249C6.81406 11.9183 8.52263 14.6534 11.1623 15.7565C12.8444 16.46 13.5186 16.5985 14.2812 16.5055C14.7397 16.4523 15.7005 15.9392 15.9011 15.3734C16.1017 14.8075 16.1017 14.3276 16.0372 14.2238Z" fill="white" /></svg>
                                        Connect WhatsApp Device
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Automatic Payment Reminders Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <FaClock className="text-xl" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Automatic Payment Reminders</h2>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={localSettings.autoRemindersEnabled || false}
                                onChange={(e) => setLocalSettings({ ...localSettings, autoRemindersEnabled: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className={`space-y-6 transition-all ${localSettings.autoRemindersEnabled ? 'opacity-100' : 'opacity-40'}`}>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                            <div className="p-2 bg-blue-600 text-white rounded-lg mt-1 shrink-0">
                                <FaBolt className="text-sm" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-blue-800 mb-1 uppercase tracking-tight">Zero-Config AI Reminders:</p>
                                <p className="text-xs text-blue-700 leading-relaxed italic">
                                    Bas ise ON karein! Jab koi bill {localSettings.reminderFrequency || 3} din se zayada unpaid rahega, BillGST automatically aapke customer ko gentle reminder bhej dega.
                                    <span className="block mt-1 font-bold text-blue-600">Aapko koi setting karne ki zaroorat nahi hai.</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 px-1">Reminder Frequency (Days)</label>
                                <select
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700 shadow-sm"
                                    value={localSettings.reminderFrequency || 3}
                                    onChange={(e) => setLocalSettings({ ...localSettings, reminderFrequency: parseInt(e.target.value) })}
                                    disabled={!localSettings.autoRemindersEnabled}
                                >
                                    {[1, 2, 3, 5, 7, 10, 15, 30].map(d => (
                                        <option key={d} value={d}>Every {d} {d === 1 ? 'Day' : 'Days'}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 px-1">Reminder Time</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700 shadow-sm"
                                    value={localSettings.reminderTime || '10:00'}
                                    onChange={(e) => setLocalSettings({ ...localSettings, reminderTime: e.target.value })}
                                    disabled={!localSettings.autoRemindersEnabled}
                                />
                            </div>
                        </div>

                        {localSettings.autoRemindersEnabled && (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-in fade-in duration-500">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">WhatsApp Gateway Config (For Automation)</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Your WhatsApp Number (Sender)</label>
                                        <input
                                            type="tel"
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm font-bold"
                                            placeholder="e.g. 919876543210"
                                            value={localSettings.whatsappSenderNumber || ''}
                                            onChange={(e) => setLocalSettings({ ...localSettings, whatsappSenderNumber: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">UltraMsg Instance ID : API Token</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm font-bold"
                                            placeholder="instance12345 : tokenabcde"
                                            value={localSettings.whatsappApiKey || ''}
                                            onChange={(e) => setLocalSettings({ ...localSettings, whatsappApiKey: e.target.value })}
                                        />
                                        <p className="text-[10px] text-blue-500 mt-1 font-bold">Format: InstanceID:Token (Beech me ":" zaroori hai)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100 mt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-tight">
                                        {!localSettings.whatsappApiKey ? 'Platform Shared Gateway Active (Free)' : 'Private API Gateway Active (Pro)'}
                                    </p>
                                </div>
                                <p className="text-[9px] text-slate-400 italic mt-3 px-1">
                                    <b>Note:</b> Agar aap apni branding use karna chahte hain, tabhi API Key bharein. Warna ise khali chhod dein.
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <FaBolt className="text-amber-500 text-xs" />
                            <p className="text-[10px] text-amber-700 font-bold uppercase italic">BillGST AI will check for unpaid bills daily and trigger reminders based on these rules.</p>
                        </div>
                    </div>
                </div>

                {/* Preferences Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <FaLanguage className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Preferences</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Language</label>
                            <select
                                value={localSettings.language}
                                onChange={(e) => setLocalSettings({ ...localSettings, language: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi (हिंदी)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Account Security Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <FaUserLock className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Account Security</h2>
                    </div>
                    <p className="text-sm text-gray-500 italic">Apna business profile aur settings yahan se manage karein. Sabhi badlav (changes) save karne ke liye 'Save Settings' button dabayein.</p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end" style={{ paddingBottom: '10px' }}>
                    <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                    >
                        <FaSave />
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
}
