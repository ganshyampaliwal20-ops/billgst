'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import {
    FaHome, FaFileInvoice, FaUsers, FaBox, FaChartBar,
    FaCog, FaBars, FaTimes, FaStore, FaSignOutAlt
} from 'react-icons/fa';
import { useStore } from '@/lib/store';

const menuItems = [
    { icon: FaFileInvoice, label: 'Invoices', href: '/dashboard/invoices', labelHi: 'बिल' },
    { icon: FaUsers, label: 'Customers', href: '/dashboard/customers', labelHi: 'ग्राहक' },
    { icon: FaBox, label: 'Inventory', href: '/dashboard/inventory', labelHi: 'स्टॉक' },
    { icon: FaChartBar, label: 'Reports', href: '/dashboard/reports', labelHi: 'रिपोर्ट' },
    { icon: FaCog, label: 'Settings', href: '/dashboard/settings', labelHi: 'सेटिंग्स' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lang, setLang] = useState<'en' | 'hi'>('en');

    const { businessProfile } = useStore();

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0 shadow-2xl md:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Section */}
                    <div className="p-6 flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={() => setIsSidebarOpen(false)}>
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow">
                                {businessProfile.logo ? (
                                    <Image
                                        src={businessProfile.logo}
                                        alt="Logo"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <FaStore className="text-white" size={20} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">BillGST</h2>
                                <p className="text-xs text-slate-500 font-medium">Professional Billing</p>
                            </div>
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-3 md:space-y-4 overflow-y-auto py-6">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 group border ${isActive
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg border-indigo-400'
                                        : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold border-slate-200 hover:border-slate-300 shadow-sm'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-indigo-100'}`}>
                                        <Icon className={`text-base ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'}`} />
                                    </div>
                                    <span className="text-sm flex-1">{lang === 'hi' ? item.labelHi : item.label}</span>
                                    {isActive && (
                                        <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile / Business Info */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                {businessProfile.logo ? (
                                    <Image
                                        src={businessProfile.logo}
                                        alt="Business Logo"
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                    />
                                ) : (
                                    <FaStore />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                    {businessProfile.name || 'My Business'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {businessProfile.gstin || 'Setup GSTIN'}
                                </p>
                            </div>
                        </div>

                        {/* Language & Logout */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="flex bg-slate-200/50 p-1 rounded-lg col-span-2">
                                <button
                                    onClick={() => setLang('en')}
                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${lang === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => setLang('hi')}
                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${lang === 'hi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    हिंदी
                                </button>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="col-span-2 flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                            >
                                <FaSignOutAlt size={14} />
                                <span>{lang === 'hi' ? 'लॉग आउट' : 'Logout'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header - Sticky on top */}
                <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-500 shadow-lg border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-12 md:h-16">
                            {/* Left Side: Logo + Business Name */}
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 group">
                                    <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden shadow-md border-2 border-white/30 group-hover:border-white/60 transition-all flex-shrink-0 bg-white/10 backdrop-blur-sm">
                                        <Image
                                            src="/logo.png"
                                            alt="BillGST Logo"
                                            fill
                                            className="object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E"
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-sm md:text-lg font-bold text-white tracking-tight leading-none group-hover:text-indigo-100 transition-colors drop-shadow-sm">
                                            {businessProfile.name || 'BillGST'}
                                        </h2>
                                        <p className="text-xs text-indigo-100/90 font-medium hidden md:block">Professional Billing</p>
                                    </div>
                                </Link>
                            </div>

                            {/* Right Side: Date + Menu */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white rounded-full text-xs font-semibold border border-white/20 backdrop-blur-md shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-green-400/50 shadow-lg"></span>
                                    {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </div>

                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="hidden md:flex items-center justify-center w-10 h-10 text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all"
                                    title="Logout"
                                >
                                    <FaSignOutAlt />
                                </button>

                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="md:hidden flex items-center justify-center w-9 h-9 text-white hover:bg-white/20 rounded-lg transition-all border border-white/30 shadow-sm active:scale-95 backdrop-blur-md"
                                    aria-label="Open Menu"
                                >
                                    <FaBars size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 scroll-smooth overflow-auto">
                    <div className="max-w-7xl mx-auto animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
