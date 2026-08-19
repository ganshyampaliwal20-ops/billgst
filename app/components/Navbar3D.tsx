'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
    FaFileInvoice, FaCog, FaBars, FaTimes,
    FaSignInAlt, FaUserPlus, FaLanguage, FaStore,
    FaSignOutAlt, FaUsers, FaBox, FaChartLine, FaRss, FaInfoCircle, FaShieldAlt, FaChevronDown, FaChevronUp, FaIdCard
} from 'react-icons/fa';
import { useSession, signOut } from 'next-auth/react';
import { useStore } from '@/lib/store';
import LanguageSelector from '@/app/components/LanguageSelector';
import { translations, getTranslations } from '@/lib/translations';

export default function Navbar3D() {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const businessProfile = useStore((state) => state.businessProfile);
    const settings = useStore((state) => state.settings);
    const resetStore = useStore((state) => state.resetStore);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const language = settings?.language || 'en';
    const t = getTranslations(language);

    const menuItems = [
        { icon: FaLanguage, label: t.language, href: '#', isLanguage: true },
        { icon: FaCog, label: t.settings, href: '/dashboard/settings' },
        { icon: FaFileInvoice, label: t.invoices, href: '/dashboard/invoices' },
        { icon: FaSignInAlt, label: t.login, href: '/login' },
    ];

    const handleLogout = () => {
        resetStore();
        signOut({ callbackUrl: '/' });
    };

    return (
        <>
            {/* Top Status Bar Safe Area Spacer */}
            <div className="w-full bg-indigo-700 shrink-0 md:hidden fixed top-0 left-0 right-0 z-[101]" style={{ height: 'env(safe-area-inset-top, 0px)' }} />

            {/* Header - Fixed on top with solid gradient and safe-area */}
            <header 
                className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-500 shadow-md border-b border-white/10 flex justify-center transition-all duration-300"
                style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
            >
                <div className="px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
                    <div className="flex items-center justify-between h-[54px] md:h-[64px]">
                        {/* Left Side: Logo + Back / Brand */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15"
                                title="Go Back"
                                aria-label="Go Back"
                            >
                                <span className="text-sm font-bold">←</span>
                            </button>
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-md border border-white/30 group-hover:border-white/60 transition-all flex-shrink-0 bg-white p-1">
                                    <Image
                                        src="/logo.png"
                                        alt="BillGST Logo"
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-base md:text-xl font-extrabold tracking-tight leading-none text-white drop-shadow-sm">
                                        BillGST
                                    </h2>
                                    <p className="text-[9px] md:text-[10px] font-semibold tracking-wider text-indigo-100/90 hidden sm:block">Professional Billing</p>
                                </div>
                            </Link>
                        </div>

                        {/* Right Side: Navigation & Menu Button */}
                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Desktop Auth Section */}
                            <div className="hidden md:flex items-center gap-3">
                                {status === 'authenticated' ? (
                                    <Link
                                        href="/dashboard"
                                        className="bg-white text-indigo-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition shadow-md"
                                    >
                                        {t.dashboard}
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="bg-white/20 hover:bg-white text-white hover:text-indigo-600 px-5 py-2 rounded-xl text-sm font-bold border border-white/30 transition shadow-md"
                                        >
                                            {t.login}
                                        </Link>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl transition-all border border-white/20 bg-white/10 text-white hover:bg-white/20 active:scale-95 shadow-md"
                                aria-label="Open Menu"
                            >
                                <FaBars size={18} />
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
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                <FaStore className="text-white text-base" />
                            </div>
                            <h2 className="text-base font-bold text-slate-800">{t.menu}</h2>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
                        <div key="language" className="mb-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Language / भाषा</p>
                            <div className="bg-slate-50 p-1 rounded-xl border-2 border-slate-100 shadow-[0_2px_0_0_#e2e8f0]">
                                <LanguageSelector showLabel={true} />
                            </div>
                        </div>

                        {[
                            {
                                icon: FaFileInvoice,
                                label: 'Invoice',
                                href: '/dashboard/invoices',
                                subItems: [
                                    { label: t.invoices, href: '/dashboard/invoices' },
                                    { label: t.taxInvoice, href: '/dashboard/invoices/new?type=TAX_INVOICE' },
                                    { label: t.billOfSupply, href: '/dashboard/invoices/new?type=BILL_OF_SUPPLY' },
                                    { label: t.eWayBill, href: '/dashboard/invoices/new?type=E_WAY_BILL' },
                                    { label: t.deliveryChallan, href: '/dashboard/invoices/new?type=DELIVERY_CHALLAN' },
                                    { label: t.quotations || 'Quotation', href: '/dashboard/quotations' },
                                ]
                            },
                            { icon: FaUsers, label: t.customers, href: '/dashboard/customers' },
                            { icon: FaIdCard, label: 'Staff & Attendance', href: '/dashboard/staff' },
                            { icon: FaBox, label: t.inventory, href: '/dashboard/inventory' },
                            { icon: FaChartLine, label: t.reports, href: '/dashboard/reports' },
                            { icon: FaRss, label: 'Blog', href: '/blog' },
                            { icon: FaInfoCircle, label: 'About Us', href: '/about' },
                            { icon: FaShieldAlt, label: 'Privacy Policy', href: '/privacy' },
                            { icon: FaCog, label: t.settings, href: '/dashboard/settings' },
                            { icon: FaSignInAlt, label: 'Login', href: '/login' },
                        ].map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.subItems?.some((sub: any) => pathname === sub.href));

                            if (item.subItems) {
                                return (
                                    <div key={item.label} className="flex flex-col gap-1">
                                        <button
                                            onClick={() => setIsInvoiceOpen(!isInvoiceOpen)}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group 
                                                border-2 relative overflow-hidden w-full text-left
                                                bg-blue-600 text-white font-bold border-blue-700 shadow-lg
                                            `}
                                        >
                                            <div className="p-3 rounded-xl bg-white/20 text-white group-hover:bg-white/30 transition-colors group-hover:scale-110">
                                                <Icon className="text-lg transition-transform duration-300 group-hover:rotate-12" />
                                            </div>
                                            <span className="text-sm tracking-wide flex-1 font-bold">{item.label}</span>
                                            {isInvoiceOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                        </button>

                                        {isInvoiceOpen && (
                                            <div className="flex flex-col gap-2 mt-2 px-1">
                                                {item.subItems.map((sub: any) => (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        onClick={() => setIsSidebarOpen(false)}
                                                        className={`
                                                            flex items-center justify-center px-3 py-2 rounded-xl text-xs font-black transition-all border-b-2
                                                            bg-orange-500 text-white border-orange-700 shadow-md hover:bg-orange-600 hover:-translate-y-0.5 active:translate-y-0 active:border-b-0
                                                        `}
                                                    >
                                                        {sub.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group 
                                        border-2 relative overflow-hidden bg-white text-slate-600 font-semibold 
                                        border-slate-200 shadow-[0_2px_0_0_#e2e8f0] 
                                        hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_#cbd5e1] 
                                        hover:text-indigo-600 hover:border-indigo-200 
                                        active:translate-y-0 active:shadow-none active:scale-95
                                    `}
                                >
                                    <div className="p-3 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors group-hover:scale-110">
                                        <Icon className="text-lg transition-transform duration-300 group-hover:rotate-12" />
                                    </div>
                                    <span className="text-sm tracking-wide flex-1">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* My Business Section - Now part of footer/bottom */}
                    <div className="p-4 border-t border-slate-100">
                        <Link
                            href="/dashboard/settings"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group border-2 bg-indigo-50 text-indigo-700 font-bold border-indigo-100 shadow-[0_4px_0_0_#e0e7ff] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#c7d2fe] active:translate-y-0 active:shadow-none"
                        >
                            <div className="p-3 rounded-xl bg-white text-indigo-600 shadow-sm">
                                <FaStore className="text-lg" />
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-black">{t.myBusiness || 'My Business'}</span>
                                <span className="text-sm truncate font-bold">{businessProfile.name || t.setBusinessName || 'Set Business Name'}</span>
                            </div>
                        </Link>
                    </div>

                    {/* Footer Info */}
                    <div className="p-4 pb-12 bg-slate-50/50">
                        <p className="text-[10px] text-center text-slate-400 font-medium italic">
                            {businessProfile.name || 'BillGST'} - Professional Billing
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
