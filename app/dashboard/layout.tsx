'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import {
    FaFileInvoice, FaUsers, FaBox, FaChartBar,
    FaCog, FaBars, FaTimes, FaStore, FaSignOutAlt,
    FaSignInAlt, FaUserPlus
} from 'react-icons/fa';
import { useStore } from '@/lib/store';
import LanguageSelector from '@/app/components/LanguageSelector';
import { translations } from '@/lib/translations';
import RegistrationPopup from './RegistrationPopup';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Get store values
    const { businessProfile, resetStore, settings } = useStore();

    // Get current translations based on store setting
    const t = translations[settings.language as keyof typeof translations] || translations.en;

    interface MenuItem {
        icon: any;
        label: string;
        href: string;
        isAuth?: boolean;
    }

    const menuItems: MenuItem[] = [
        { icon: FaFileInvoice, label: t.invoices, href: '/dashboard/invoices' },
        { icon: FaUsers, label: t.customers, href: '/dashboard/customers' },
        { icon: FaBox, label: t.inventory, href: '/dashboard/inventory' },
        { icon: FaChartBar, label: t.reports, href: '/dashboard/reports' },
        { icon: FaCog, label: t.settings, href: '/dashboard/settings' },
        { icon: FaSignInAlt, label: 'Login', href: '/login', isAuth: true },
        { icon: FaUserPlus, label: 'Sign Up', href: '/register', isAuth: true },
    ];

    const handleLogout = () => {
        resetStore();
        signOut({ callbackUrl: '/login' });
    };

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
                                        <FaStore className="text-white text-lg" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    BillGST
                                </h1>
                                <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Professional Billing</p>
                            </div>
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Navigation - Standard list with moderate spacing */}
                    <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
                        {menuItems.filter(item => !item.isAuth).map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group 
                                        border-2 relative overflow-hidden
                                        ${isActive
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold border-indigo-700 shadow-[0_6px_0_0_#4338ca] -translate-y-1'
                                            : 'bg-white text-slate-600 font-semibold border-slate-200 shadow-[0_4px_0_0_#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#cbd5e1] hover:text-indigo-600 hover:border-indigo-200 hover:scale-105 active:translate-y-0 active:shadow-none active:scale-95'
                                        }
                                    `}
                                >
                                    <div className={`
                                        p-2.5 rounded-xl transition-all duration-300 relative z-10
                                        ${isActive
                                            ? 'bg-white/20 text-white shadow-inner'
                                            : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110'
                                        }
                                    `}>
                                        <Icon className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:rotate-12'}`} />
                                    </div>
                                    <span className="text-base tracking-wide flex-1 relative z-10">{item.label}</span>

                                    {/* Active Indicator / Shine Effect */}
                                    {isActive && (
                                        <>
                                            <div className="absolute right-4 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse z-10" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shine pointer-events-none" />
                                        </>
                                    )}
                                </Link>
                            );
                        })}

                        {/* Auth Links Section */}
                        <div className="pt-4 mt-4 border-t border-slate-200">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Account</p>
                            {menuItems.filter(item => item.isAuth).map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-semibold group mb-2"
                                    >
                                        <Icon className="text-lg group-hover:scale-110 transition-transform" />
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* User Profile / Business Info */}
                    <div className="p-6 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm">
                        {/* Language Selector */}
                        <div className="mb-4">
                            <LanguageSelector showLabel={true} />
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                                {businessProfile.logo ? (
                                    <Image
                                        src={businessProfile.logo}
                                        alt="Business Logo"
                                        width={48}
                                        height={48}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <span className="text-lg">{businessProfile.name?.charAt(0) || 'B'}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{businessProfile.name || 'Your Business'}</p>
                                <p className="text-xs text-slate-500 truncate font-medium bg-slate-100 inline-block px-2 py-0.5 rounded-full mt-1">
                                    {businessProfile.gstin || t.setupBusiness}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100/80 rounded-xl transition-all border border-red-100 shadow-sm hover:shadow group"
                        >
                            <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" />
                            <span>{t.welcome === 'स्वागत है' ? 'सुरक्षित लॉगआउट' : 'Logout Safe'}</span>
                        </button>
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
                                    {/* Fix Hydration Error: Only render date on client using check or simpler generic date initially */}
                                    <span suppressHydrationWarning>
                                        {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </span>
                                </div>

                                <button
                                    onClick={handleLogout}
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
            <RegistrationPopup />
        </div>
    );
}
