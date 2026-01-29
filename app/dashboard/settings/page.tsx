'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FaSave, FaStore, FaImage, FaLanguage, FaFileInvoiceDollar, FaUserLock, FaSignInAlt, FaUserPlus, FaUniversity, FaBolt, FaClock } from 'react-icons/fa';

export default function SettingsPage() {
    const { businessProfile, updateProfile, saveBusinessProfile, settings, updateSettings } = useStore();
    const [formData, setFormData] = useState(businessProfile || {});
    const [localSettings, setLocalSettings] = useState(settings || {});
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setFormData(businessProfile);
        setLocalSettings(settings);
    }, [businessProfile, settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Save to database via new function
        await saveBusinessProfile(formData);

        // Also update local settings
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
        <div className="max-w-4xl mx-auto space-y-6 px-[5px]">
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
                                <input
                                    type="text"
                                    value={formData.owner_name || ''}
                                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="Person name for signature" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                                />
                            </div>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
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
                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${formData.invoice_table_format === fmt.id
                                    ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500'
                                    : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <svg
                                    className={`w-10 h-10 ${formData.invoice_table_format === fmt.id ? 'text-blue-600' : 'text-gray-400'}`}
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d={fmt.icon} />
                                </svg>
                                <div className="text-center">
                                    <span className={`block text-xs font-bold ${formData.invoice_table_format === fmt.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                        {fmt.name}
                                    </span>
                                    <span className="block text-[10px] text-gray-500 mt-1">
                                        {fmt.desc}
                                    </span>
                                </div>
                            </button>
                        ))}
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bot Access Token</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`WHATSAPP_AI_${businessProfile.id?.substring(0, 8).toUpperCase()}`}
                                            className="flex-1 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`WHATSAPP_AI_${businessProfile.id?.substring(0, 8).toUpperCase()}`);
                                                toast.success('Token copied!');
                                            }}
                                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                                        >
                                            Copy Token
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Use this token to connect your WhatsApp Business API with BillGST.</p>
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

                    <div className={`space-y-4 transition-all ${localSettings.autoRemindersEnabled ? 'opacity-100' : 'opacity-40'}`}>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-tight">AI Recovery System:</p>
                            <p className="text-xs text-blue-700 leading-relaxed italic">
                                Jab bhi koi invoice 3 din se zyada "Unpaid" rahega, hamara AI automatically customer ko ek gentle reminder WhatsApp pe bhej dega. Isse aapka recovery rate 40% tak badh sakta hai.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase px-2">
                            <span>Frequency: Every 3 Days</span>
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                            <span>Time: 10:00 AM</span>
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

                {/* Account & Access Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <FaUserLock className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Account & Access</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            href="/login"
                            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                                    <FaSignInAlt />
                                </div>
                                <span className="font-bold text-slate-700 italic">Login Karein</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400">SIGN IN</span>
                        </Link>

                        <Link
                            href="/register"
                            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-emerald-600 shadow-sm transition-colors">
                                    <FaUserPlus />
                                </div>
                                <span className="font-bold text-slate-700 italic">Naya Account</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400">REGISTER</span>
                        </Link>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
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
