'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
    FaHome, FaFileInvoice, FaUsers, FaBox, FaChartBar,
    FaCog, FaBars, FaTimes, FaStore, FaSignOutAlt
} from 'react-icons/fa';
import { useStore } from '@/lib/store';

const menuItems = [
    { icon: FaHome, label: 'Dashboard', href: '/dashboard', labelHi: 'डैशबोर्ड' },
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
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Section */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234f46e5'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E"
                                    }}
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">BillGST</h2>
                                <p className="text-xs text-slate-500 font-medium">Professional Billing</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                        }`}
                                >
                                    <Icon className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    <span>{lang === 'hi' ? item.labelHi : item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile / Business Info */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                <FaStore />
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

                        {/* Language Toggle */}
                        <div className="mt-4 flex bg-slate-200/50 p-1 rounded-lg">
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
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <FaBars size={20} />
                            </button>
                            <h1 className="text-xl font-bold text-slate-800 hidden md:block">
                                {lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Logout">
                                <FaSignOutAlt />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
