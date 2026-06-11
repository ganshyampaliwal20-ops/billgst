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
    TEMPLATE_6: { accent: '#be123c', title: '#e11d48' }, // Rose Pink
    TEMPLATE_7: { accent: '#111827', title: '#4b5563' }, // Classic Black/White
};

import { optimizeImage } from '@/lib/utils';

export default function SettingsPage() {
    const { businessProfile, updateProfile, saveBusinessProfile, settings, updateSettings } = useStore();
    const [formData, setFormData] = useState(businessProfile || {});
    const [localSettings, setLocalSettings] = useState(settings || {});
    const [isClient, setIsClient] = useState(false);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [botStatus, setBotStatus] = useState<any>({ status: 'LOADING', qr: null });

    // Polling WhatsApp Bot Status
    useEffect(() => {
        if (!localSettings.whatsappBotEnabled) return;

        const checkStatus = async () => {
            try {
                const res = await fetch('/api/public/whatsapp/bot-status?t=' + Date.now());
                const data = await res.json();
                if (data.success) {
                    setBotStatus(data);
                } else {
                    setBotStatus({ status: 'ERROR', message: data.error || 'Server error' });
                }
            } catch (e: any) {
                console.error('Failed to fetch bot status');
                setBotStatus({ status: 'ERROR', message: e.message || 'Network error' });
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [localSettings.whatsappBotEnabled]);

    useEffect(() => {
        setIsClient(true);
        if (businessProfile && Object.keys(formData).length === 0) {
            setFormData(businessProfile);
        }
        if (settings && Object.keys(localSettings).length === 0) {
            setLocalSettings(settings);
        }
    }, [businessProfile, settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Optimistic update so it feels instant
        updateProfile(formData);
        updateSettings(localSettings);
        
        const savePromise = saveBusinessProfile({ ...formData, ...localSettings });
        
        // We use toast.promise for instant feedback without blocking UI
        toast.promise(savePromise, {
            loading: 'Saving your settings...',
            success: 'Settings saved perfectly!',
            error: 'Could not save settings'
        });
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const optimizedLogo = await optimizeImage(file, 400, 400, 0.8);
                setFormData({ ...formData, logo: optimizedLogo });
                toast.success('Logo optimized and uploaded!');
            } catch (error: any) {
                console.error('Failed to optimize image:', error);
                toast.error(error.message || 'Upload fail ho gaya!');
            }
        }
    };

    if (!isClient) return null;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 px-5 sm:px-6 md:px-10 lg:px-12 pt-8 pb-8 md:pb-10">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight ml-2">Business Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Tax Settings (Non-GST Mode) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <FaFileInvoiceDollar className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Tax Settings</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-gray-800">I have a GST Number</h3>
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
                                <p className="text-sm text-gray-500 mt-1">Enable this if your business is registered under GST. If you don't have a GST number, turn it off.</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100 gap-4">
                            <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <h3 className="font-bold text-indigo-900">GST Calculation Mode</h3>
                                    <div className="flex bg-white p-1 rounded-lg border border-indigo-200 shadow-sm self-start sm:self-auto">
                                        <button 
                                            type="button"
                                            onClick={() => setLocalSettings({ ...localSettings, taxType: 'EXCLUSIVE' })}
                                            className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${localSettings.taxType !== 'INCLUSIVE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                                        >
                                            EXCLUSIVE
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setLocalSettings({ ...localSettings, taxType: 'INCLUSIVE' })}
                                            className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${localSettings.taxType === 'INCLUSIVE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                                        >
                                            INCLUSIVE
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[11px] text-indigo-600/70 mt-2 font-medium">
                                    {localSettings.taxType === 'INCLUSIVE' 
                                        ? 'Inclusive: MRP/Price mein GST pehle se juda hua hai. (e.g. ₹100 is Final)' 
                                        : 'Exclusive: Price par GST alag se lagega. (e.g. ₹100 + GST)'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FaStore className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Business Profile</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Enter business name"
                            />
                        </div>

                        {/* Show GSTIN only if Non-GST Mode is OFF */}
                        {!localSettings.nonGstMode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
                                <input
                                    type="text"
                                    value={formData.gstin || ''}
                                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="22AAAAA0000A1Z5"
                                />
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <textarea
                                rows={3}
                                value={formData.address || ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Business address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="+91 9999999999"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="business@example.com"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                <label className="block text-sm font-bold text-indigo-700 mb-2">UPI ID (for QR Code)</label>
                                <input
                                    type="text"
                                    value={formData.upi_id || ''}
                                    onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                                    placeholder="example@upi"
                                />
                                <p className="text-[10px] text-indigo-500 mt-1 font-medium italic">यह ID आपके इनवॉइसेस पर पेमेंट QR कोड जनरेट करने के लिए उपयोग होगी।</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Authorized Signatory Name</label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={formData.owner_name || ''}
                                        onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-bold"
                                        placeholder="Person name for signature"
                                    />

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsSignatureModalOpen(true)}
                                            className="flex-1 w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-600 font-black text-xs hover:bg-slate-100 transition-all uppercase tracking-widest"
                                        >
                                            <FaPenNib className="text-blue-500" />
                                            {formData.signature ? 'Change Signature' : 'Draw Digital Signature'}
                                        </button>

                                        {formData.signature && (
                                            <div className="w-24 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-sm shrink-0 self-center">
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

                {/* Terms & Conditions Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                            <FaPenNib className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Default Terms & Conditions</h2>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Terms (will appear on every new invoice)</label>
                        <textarea
                            rows={4}
                            value={formData.terms_and_conditions || ''}
                            onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="1. Goods once sold will not be taken back.
2. Interest @18% will be charged if payment is not made within 15 days.
3. Subject to local jurisdiction."
                           
                        />
                        <p className="text-[10px] text-slate-400 mt-1 italic">Yeh terms aapke har naye bill par apne aap likh kar aayenge.</p>
                    </div>
                </div>

                {/* Bank Details Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <FaUniversity className="text-xl" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Bank Account Details</h2>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                            <input
                                type="text"
                                value={formData.bank_name || ''}
                                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="e.g. State Bank of India"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                            <input
                                type="text"
                                value={formData.account_no || ''}
                                onChange={(e) => setFormData({ ...formData, account_no: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Enter A/C number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                            <input
                                type="text"
                                value={formData.ifsc_code || ''}
                                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="SBIN0001234"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                            <input
                                type="text"
                                value={formData.branch_name || ''}
                                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Branch location"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                            <input
                                type="text"
                                value={formData.account_holder || ''}
                                onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Name as per bank records"
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
                        <h2 className="text-lg font-bold text-gray-800">Branding</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                            {formData.logo ? (
                                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 text-xs text-center px-2">No Logo</span>
                            )}
                        </div>
                        <div className="flex-1 w-full text-center sm:text-left">
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

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                        {[
                            { id: 'TEMPLATE_1', name: 'Modern Purple', color: 'bg-purple-600' },
                            { id: 'TEMPLATE_2', name: 'Royal Blue', color: 'bg-blue-600' },
                            { id: 'TEMPLATE_3', name: 'Slate Gray', color: 'bg-slate-600' },
                            { id: 'TEMPLATE_4', name: 'Energetic Orange', color: 'bg-orange-600' },
                            { id: 'TEMPLATE_5', name: 'Classic Green', color: 'bg-green-600' },
                            { id: 'TEMPLATE_6', name: 'Rose Pink', color: 'bg-rose-600' },
                            { id: 'TEMPLATE_7', name: 'Classic B&W', color: 'bg-white border border-gray-200' },
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
                                <div className={`w-full h-12 rounded-lg shadow-inner ${tpl.color} relative`}>
                                    <div className="absolute top-1 left-1 right-1 h-1 bg-white/20 rounded-full" />
                                    <div className="absolute top-3 left-1 right-3 h-1 bg-white/10 rounded-full" />
                                </div>
                                <span className={`text-[11px] font-bold ${formData.invoice_template === tpl.id ? 'text-blue-700' : 'text-gray-500'}`}>
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

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
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
                    <div className="mt-8 border-2 border-dashed border-slate-200 rounded-3xl p-2 sm:p-6 bg-slate-50/50 overflow-hidden">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                Live Demo Preview
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">Sample Data Attached</span>
                        </div>

                        {/* Scroll container to prevent table layout from pushing screen border */}
                        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                            <div className="min-w-[550px] p-2">
                                {/* THE PREVIEW PAPER */}
                                <div className={`bg-white shadow-2xl rounded-sm mx-auto overflow-hidden transition-all duration-500 border border-slate-200 w-full min-h-[500px] select-none p-[8px]`}
                                    style={{ fontFamily: formData.invoice_template === 'TEMPLATE_3' ? 'serif' : 'sans-serif' }}>
                                    <div className="border border-slate-100 h-full w-full bg-white">

                                {/* Header Section */}
                                <div className={`px-[8px] py-4 border-b flex ${formData.logo_position === 'CENTER'
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
                                <div className="px-[8px] py-4 flex justify-between text-[9px]">
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
                                <div className="px-[8px] pb-6 mt-2">
                                    <table className={`w-full text-left text-[9px] border-collapse ${formData.invoice_table_format === 'FORMAT_2' ? 'border' : ''}`}>
                                        <thead style={{
                                            backgroundColor: (formData.invoice_table_format === 'FORMAT_3' || formData.invoice_table_format === 'FORMAT_2') ? 'transparent' : (THEMES[formData.invoice_template as keyof typeof THEMES]?.accent || '#5d5088'),
                                            color: (formData.invoice_table_format === 'FORMAT_3' || formData.invoice_table_format === 'FORMAT_2') ? '#000' : '#fff'
                                        }}>
                                            <tr className={formData.invoice_table_format === 'FORMAT_3' ? 'border-b-2' : ''} style={{ borderColor: THEMES[formData.invoice_template as keyof typeof THEMES]?.accent }}>
                                                <th className={`p-[8px] font-black ${formData.invoice_table_format === 'FORMAT_2' ? 'border-r border-b text-black' : ''}`}>#</th>
                                                <th className={`p-[8px] font-black ${formData.invoice_table_format === 'FORMAT_2' ? 'border-r border-b text-black' : ''}`}>Item Name</th>
                                                <th className={`p-[8px] font-black text-center ${formData.invoice_table_format === 'FORMAT_2' ? 'border-r border-b text-black' : ''}`}>Qty</th>
                                                <th className={`p-[8px] font-black text-right ${formData.invoice_table_format === 'FORMAT_2' ? 'border-r border-b text-black' : ''}`}>Price</th>
                                                <th className={`p-[8px] font-black text-right ${formData.invoice_table_format === 'FORMAT_2' ? 'border-b text-black' : ''}`}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { n: 'Premium Cotton Shirt', q: 2, p: 1200 },
                                                { n: 'Office Table Lamp', q: 1, p: 850 },
                                            ].map((it, i) => (
                                                <tr key={i} className={`
                                                    ${formData.invoice_table_format === 'FORMAT_3' || formData.invoice_table_format === 'FORMAT_2' ? 'border-b' : ''}
                                                `} style={{
                                                    backgroundColor: (formData.invoice_table_format === 'FORMAT_4' && i % 2 !== 0) 
                                                        ? `${THEMES[formData.invoice_template as keyof typeof THEMES]?.accent}1A` 
                                                        : undefined
                                                }}>
                                                    <td className={`p-[8px] font-bold ${formData.invoice_table_format === 'FORMAT_5' ? 'py-1' : ''} ${formData.invoice_table_format === 'FORMAT_2' ? 'border-r' : ''}`}>{i + 1}</td>
                                                    <td className={`p-[8px] font-bold ${formData.invoice_table_format === 'FORMAT_5' ? 'py-1' : ''} ${formData.invoice_table_format === 'FORMAT_2' ? 'border-r' : ''}`}>{it.n}</td>
                                                    <td className={`p-[8px] text-center font-bold ${formData.invoice_table_format === 'FORMAT_5' ? 'py-1' : ''} ${formData.invoice_table_format === 'FORMAT_2' ? 'border-r' : ''}`}>{it.q}</td>
                                                    <td className={`p-[8px] text-right font-bold ${formData.invoice_table_format === 'FORMAT_5' ? 'py-1' : ''} ${formData.invoice_table_format === 'FORMAT_2' ? 'border-r' : ''}`}>₹{it.p.toFixed(2)}</td>
                                                    <td className={`p-[8px] text-right font-bold ${formData.invoice_table_format === 'FORMAT_5' ? 'py-1' : ''}`}>₹{(it.q * it.p).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            {/* Padding for Grid Box to show extended lines */}
                                            {formData.invoice_table_format === 'FORMAT_2' && Array.from({ length: 8 }).map((_, i) => (
                                                <tr key={`pad-${i}`}>
                                                    <td className="p-[8px] border-r h-[20px]"></td>
                                                    <td className="p-[8px] border-r"></td>
                                                    <td className="p-[8px] border-r"></td>
                                                    <td className="p-[8px] border-r"></td>
                                                    <td className="p-[8px]"></td>
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
                                <div className="px-[8px] pb-6 pt-0 flex justify-between items-end">
                                    <div className="w-16 h-16 bg-slate-100 rounded border-2 border-dashed border-slate-300 flex items-center justify-center text-[7px] font-black opacity-30">UPI QR</div>
                                    <div className="text-right">
                                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">For {formData.name || 'YOUR BUSINESS'}</p>

                                        <div className="w-24 h-px bg-slate-400 mb-1 ml-auto"></div>
                                        <p className="text-[8px] font-black uppercase text-slate-800">Authorized Signatory</p>
                                    </div>
                                </div>
                            </div>
                        </div> {/* Close overflow-x-auto scroll container */}
                    </div> {/* Close min-w-[550px] wrapper */}
                </div> {/* Close THE PREVIEW PAPER */}
            </div> {/* Close LIVE PREVIEW SECTION */}
        </div> {/* Close Invoice Table Layout Card */}



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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                            <select
                                value={localSettings.language}
                                onChange={(e) => setLocalSettings({ ...localSettings, language: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
                <div className="flex justify-center w-full mt-10">
                    <button
                        type="submit"
                        className="w-full md:w-3/4 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xl rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 tracking-wide"
                    >
                        <FaSave className="text-2xl" />
                        SAVE ALL SETTINGS
                    </button>
                </div>
            </form>
        </div>
    );
}
