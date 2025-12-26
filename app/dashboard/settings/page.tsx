'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FaSave, FaStore, FaImage, FaLanguage, FaFileInvoiceDollar, FaUserLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default function SettingsPage() {
    const { businessProfile, updateProfile, settings, updateSettings } = useStore();
    const [formData, setFormData] = useState(businessProfile);
    const [localSettings, setLocalSettings] = useState(settings);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setFormData(businessProfile);
        setLocalSettings(settings);
    }, [businessProfile, settings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile(formData);
        updateSettings(localSettings);
        toast.success('Settings saved successfully!');
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
        <div className="max-w-4xl mx-auto space-y-6 px-4 md:px-0">
            <h1 className="text-2xl font-bold text-gray-800">Business Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tax Settings (Non-GST Mode) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <FaFileInvoiceDollar className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Tax Settings</h2>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                            <h3 className="font-medium text-gray-800">I have a GST Number</h3>
                            <p className="text-sm text-gray-500">Enable this if your business is registered under GST.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={!localSettings.nonGstMode}
                                onChange={(e) => setLocalSettings({ ...localSettings, nonGstMode: !e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
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
                                value={formData.name}
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
                                    value={formData.gstin}
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
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Business address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="+91 9999999999"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="business@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-indigo-600 font-bold">UPI ID (for QR Code)</label>
                            <input
                                type="text"
                                value={formData.upi_id || ''}
                                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-indigo-50/30"
                                placeholder="example@upi"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Authorized Signatory Name</label>
                            <input
                                type="text"
                                value={formData.owner_name || ''}
                                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="Person name for signature"
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

                {/* Account & Access Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <FaUserLock className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Account & Access</h2>
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
