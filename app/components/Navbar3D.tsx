'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
    FaFileInvoice, FaCog, FaBars, FaTimes,
    FaSignInAlt, FaUserPlus, FaLanguage, FaStore,
    FaSignOutAlt, FaUsers, FaBox, FaChartLine
} from 'react-icons/fa';
import { useSession, signOut } from 'next-auth/react';
import { useStore } from '@/lib/store';
import LanguageSelector from '@/app/components/LanguageSelector';
import { translations } from '@/lib/translations';

export default function Navbar3D() {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { businessProfile, settings, resetStore } = useStore();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const t = translations[settings.language as keyof typeof translations] || translations.en;

    const menuItems = [
        { icon: FaLanguage, label: 'Language', href: '#', isLanguage: true },
        { icon: FaCog, label: 'Setting', href: '/dashboard/settings' },
        { icon: FaFileInvoice, label: 'Invoice', href: '/dashboard/invoices' },
        { icon: FaSignInAlt, label: 'Login Page', href: '/login' },
        { icon: FaUserPlus, label: 'Signup Page', href: '/register' },
    ];

    const handleLogout = () => {
        resetStore();
        signOut({ callbackUrl: '/' });
    };

    return (
        <>
            {/* Header - Sticky on top */}
            <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-500 shadow-lg py-2 md:py-3 border-b border-white/10'
                : 'bg-transparent py-4 md:py-6'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Left Side: Logo + Business Name */}
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                                <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden shadow-md border-2 border-white/30 group-hover:border-white/60 transition-all flex-shrink-0 bg-white p-1">
                                    <Image
                                        src="/logo.png"
                                        alt="BillGST Logo"
                                        width={40}
                                        height={40}
                                        className="object-contain"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className={`text-sm md:text-xl font-bold tracking-tight leading-none group-hover:text-indigo-100 transition-colors drop-shadow-sm ${isScrolled ? 'text-white' : 'text-indigo-900'
                                        }`}>
                                        BillGST
                                    </h2>
                                    <p className={`text-[10px] font-bold uppercase tracking-wider hidden md:block ${isScrolled ? 'text-indigo-100/90' : 'text-slate-500'
                                        }`}>Professional Billing</p>
                                </div>
                            </Link>
                        </div>

                        {/* Right Side: Menu Button */}
                        <div className="flex items-center gap-3 md:gap-4">
                            {/* Desktop Auth Section */}
                            <div className="hidden md:flex items-center gap-4">
                                {status === 'authenticated' ? (
                                    <Link
                                        href="/dashboard"
                                        className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold hover:bg-slate-50 transition shadow-lg"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className={`text-sm font-bold transition-colors ${isScrolled ? 'text-white' : 'text-slate-700 hover:text-indigo-600'
                                                }`}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg"
                                        >
                                            Register Free
                                        </Link>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all border-2 active:scale-95 shadow-lg ${isScrolled
                                    ? 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                                    : 'bg-white text-indigo-600 border-indigo-100 hover:bg-slate-50'
                                    }`}
                                aria-label="Open Menu"
                            >
                                <FaBars size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Right-side implementation like Dashboard mobile) */}
            <aside
                className={`fixed inset-y-0 right-0 z-[120] w-72 md:w-80 bg-white transform transition-transform duration-300 ease-in-out shadow-[-20px_0_50px_rgba(0,0,0,0.1)] ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <FaStore className="text-white text-lg" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Menu</h2>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
                        <div key="language" className="mb-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2">Language / भाषा</p>
                            <div className="bg-slate-50 p-2 rounded-2xl border-2 border-slate-100 shadow-[0_4px_0_0_#e2e8f0]">
                                <LanguageSelector showLabel={true} />
                            </div>
                        </div>

                        {[
                            { icon: FaFileInvoice, label: 'Invoice', href: '/dashboard/invoices' },
                            { icon: FaUsers, label: 'Customer', href: '/dashboard/customers' },
                            { icon: FaBox, label: 'Product', href: '/dashboard/inventory' },
                            { icon: FaChartLine, label: 'Report', href: '/dashboard/reports' },
                            { icon: FaCog, label: 'Setting', href: '/dashboard/settings' },
                            { icon: FaSignInAlt, label: 'Login', href: '/login' },
                            { icon: FaUserPlus, label: 'Register', href: '/register' },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group 
                                        border-2 relative overflow-hidden bg-white text-slate-600 font-semibold 
                                        border-slate-200 shadow-[0_4px_0_0_#e2e8f0] 
                                        hover:-translate-y-1 hover:shadow-[0_8px_0_0_#cbd5e1] 
                                        hover:text-indigo-600 hover:border-indigo-200 
                                        active:translate-y-0 active:shadow-none active:scale-95
                                    `}
                                >
                                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors group-hover:scale-110">
                                        <Icon className="text-xl transition-transform duration-300 group-hover:rotate-12" />
                                    </div>
                                    <span className="text-base tracking-wide flex-1">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* My Business Section - Now part of footer/bottom */}
                    <div className="p-4 border-t border-slate-100">
                        <Link
                            href="/dashboard/settings"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group border-2 bg-indigo-50 text-indigo-700 font-bold border-indigo-100 shadow-[0_4px_0_0_#e0e7ff] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#c7d2fe] active:translate-y-0 active:shadow-none"
                        >
                            <div className="p-2 rounded-xl bg-white text-indigo-600 shadow-sm">
                                <FaStore className="text-lg" />
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-black">My Business</span>
                                <span className="text-sm truncate font-bold">{businessProfile.name || 'Set Business Name'}</span>
                            </div>
                        </Link>
                    </div>

                    {/* Footer Info */}
                    <div className="p-4 bg-slate-50/50">
                        <p className="text-[10px] text-center text-slate-400 font-medium italic">
                            {businessProfile.name || 'BillGST'} - Professional Billing
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
