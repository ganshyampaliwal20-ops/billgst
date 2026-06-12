'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
    FaFileInvoice, FaUsers, FaBox, FaChartBar,
    FaCog, FaBars, FaTimes, FaStore, FaSignOutAlt,
    FaLanguage, FaReceipt,
    FaFileAlt, FaMoneyBillWave, FaFileContract, FaStar,
    FaInfoCircle, FaShieldAlt, FaChevronDown, FaChevronUp, FaRobot, FaIdCard, FaBookOpen, FaHeadset
} from 'react-icons/fa';
import { useStore } from '@/lib/store';
import { normalizeRole, isOwnerRole, isAccountantRole, isAttendanceRole, isSalesRole, ROLE_ATTENDANCE, ROLE_ACCOUNTANT, ROLE_SALES, ROLE_ADMIN, ROLE_OWNER } from '@/lib/role-utils';
import LanguageSelector from '@/app/components/LanguageSelector';
import { translations } from '@/lib/translations';
import RegistrationPopup from './RegistrationPopup';
import AIChat from '@/app/components/AIChat';
import SupportChatWidget from '@/app/components/SupportChatWidget';
import UpgradeModal from '@/app/components/UpgradeModal';
import WorkspaceSwitcher from '@/app/components/WorkspaceSwitcher';
import VoiceAssistant from './VoiceAssistant';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
    const { data: session, status } = useSession();

    // Get store values
    const { businessProfile, resetStore, fetchBusinessProfile, settings, setAiChatOpen, fetchStaff, fetchAttendance } = useStore();

    useEffect(() => {
        setIsMounted(true);

        // Only fetch profile if session is active
        if (typeof window !== 'undefined' && status === 'authenticated') {
            fetchBusinessProfile();

            // Role-based route protection
            const userRole = normalizeRole(session?.user?.role);
            const path = pathname;

            // Restrict non-owners from unauthorized paths
            if (userRole !== 'USER' && userRole !== 'OWNER' && userRole !== 'ADMIN') {
                if (userRole === 'ATTENDANCE') {
                    if (!path.startsWith('/dashboard/staff') && path !== '/dashboard') {
                        router.push('/dashboard/staff');
                    }
                } else if (userRole === 'ACCOUNTANT') {
                    if (path.startsWith('/dashboard/staff') || path.startsWith('/dashboard/admin') || path.startsWith('/dashboard/pricing')) {
                        router.push('/dashboard');
                    }
                } else if (userRole === 'SALES') {
                    if (!path.startsWith('/dashboard/invoices') && !path.startsWith('/dashboard/customers') && !path.startsWith('/dashboard/quotations') && path !== '/dashboard') {
                        router.push('/dashboard/invoices');
                    }
                } else if (userRole === 'STAFF') {
                    // Generic staff - very restricted
                    if (path !== '/dashboard') {
                        router.push('/dashboard');
                    }
                }
            }
        }

        // Redirect to login only if session is definitively unauthenticated
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=' + encodeURIComponent(pathname));
        }

        // Background polling disabled to improve app performance
        // Data is fetched on-demand when components mount
        
        return () => {};
    }, [status]); // Only re-run when authentication status changes

    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isMounted || status === 'loading') return null;
    if (status === 'unauthenticated') return null;

    // Get current translations based on store setting
    const t: any = translations[settings.language as keyof typeof translations] || translations.en;

    interface MenuItem {
        icon: any;
        label: string;
        href: string;
        show?: boolean;
        isAuth?: boolean;
        subItems?: { label: string; href: string; icon?: any }[];
        onClick?: () => void;
    }

    const userRole = normalizeRole(session?.user?.role);
    const isSuperAdmin = session?.user?.email === 'gpaliwal59@gmail.com' || session?.user?.email === 'ganshyampaliwal20@gmail.com';

    const menuItems: MenuItem[] = [];

    const canSeeSales = isSalesRole(userRole) || isAccountantRole(userRole) || userRole === 'USER';
    const canSeeAccounting = isAccountantRole(userRole) || userRole === 'USER';
    const canSeeStaff = isAttendanceRole(userRole) || userRole === 'USER';
    const isOwner = isOwnerRole(userRole) || userRole === 'USER';

    if (canSeeSales) {
        menuItems.push({
            icon: FaFileInvoice,
            label: t.invoices,
            href: '/dashboard/invoices',
            subItems: [
                { label: t.invoices, href: '/dashboard/invoices', icon: FaFileInvoice },
                { label: t.taxInvoice, href: '/dashboard/invoices/new?type=TAX_INVOICE', icon: FaFileAlt },
                { label: t.billOfSupply, href: '/dashboard/invoices/new?type=BILL_OF_SUPPLY', icon: FaReceipt },
                { label: t.eWayBill, href: '/dashboard/invoices/new?type=E_WAY_BILL', icon: FaBox },
                { label: t.deliveryChallan, href: '/dashboard/invoices/new?type=DELIVERY_CHALLAN', icon: FaFileContract },
                { label: t.quotations || 'Quotation', href: '/dashboard/quotations', icon: FaFileAlt },
            ]
        });
    }

    if (canSeeAccounting) {
        menuItems.push({ icon: FaMoneyBillWave, label: t.expenses || 'Expenses', href: '/dashboard/expenses' });
    }

    if (canSeeSales) {
        menuItems.push({ icon: FaUsers, label: t.customers, href: '/dashboard/customers' });
    }

    if (canSeeStaff) {
        menuItems.push({ icon: FaIdCard, label: 'Attendance', href: '/dashboard/staff' });
    }

    if (canSeeAccounting) {
        menuItems.push({ icon: FaBox, label: t.inventory, href: '/dashboard/inventory' });
        menuItems.push({ icon: FaChartBar, label: t.reports, href: '/dashboard/reports' });
        
        // Show GST Returns only if GST Mode is ON (nonGstMode is false)
        if (!settings.nonGstMode) {
            menuItems.push({ icon: FaFileContract, label: t.gstReturns || 'GST Returns', href: '/dashboard/gst-returns' });
        }
    }

    menuItems.push({
        icon: FaRobot,
        label: t.aiAssistant || 'AI Assistant',
        href: '#',
        onClick: () => {
            setAiChatOpen(true);
            setIsSidebarOpen(false);
        }
    });

    if (isOwner) {
        menuItems.push({ icon: FaStar, label: t.subscription || 'Subscription', href: '/dashboard/pricing' });
        menuItems.push({ icon: FaUsers, label: t.referEarn || 'Refer & Earn', href: '/dashboard/referral' });
    }

    menuItems.push({ icon: FaInfoCircle, label: t.aboutUs || 'About Us', href: '/about' });
    menuItems.push({ icon: FaShieldAlt, label: t.privacyPolicy || 'Privacy Policy', href: '/privacy' });

    if (isSuperAdmin) {
        menuItems.push({ icon: FaHeadset, label: 'Support Inbox', href: '/dashboard/support' });
        menuItems.push({ icon: FaShieldAlt, label: t.adminPanel || 'Admin Panel', href: '/dashboard/admin' });
    }

    const handleLogout = () => {
        document.cookie = 'billgst_workspace_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'billgst_workspace_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        resetStore();
        signOut({ callbackUrl: '/login' });
    };

    return (
        <div className="h-[100dvh] bg-slate-900 flex flex-col overflow-hidden">
            {/* Global Safe Area Protector for Status Bar (Dark background makes white icons visible) */}
            <div className="w-full bg-slate-900 shrink-0 md:hidden z-[100]" style={{ height: 'max(env(safe-area-inset-top), 36px)' }}></div>
            
            {/* 2. Main Flex Container */}
            <div className="flex-1 flex overflow-hidden bg-[#f1f5f9] relative">
            

            {/* Sidebar */}
            <aside
                className={`absolute md:relative inset-y-0 left-0 z-[60] w-[82%] max-w-[300px] md:w-72 bg-white md:border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static shadow-2xl md:shadow-none rounded-r-[16px] md:rounded-none overflow-hidden pb-[env(safe-area-inset-bottom)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Combined Header & Business Card - Professional Royal 3D Design */}
                    <div className="relative mx-4 mt-6 mb-4 p-[2px] rounded-[20px] bg-gradient-to-b from-[#8E84F3] to-[#4235B8] shadow-[0_12px_28px_-6px_rgba(45,36,138,0.4)] group cursor-pointer" onClick={() => { router.push('/dashboard/settings'); setIsSidebarOpen(false); }}>
                        <div className="relative bg-gradient-to-br from-[#352B9C] to-[#1A1454] rounded-[18px] p-6 flex flex-col items-center text-center transition-all overflow-hidden border border-[#4A3DB5]/50">
                            {/* Decorative background glow */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#8E84F3] rounded-full filter blur-[40px] opacity-20"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#D1CFF8] rounded-full filter blur-[40px] opacity-10"></div>
                            
                            {/* 3D Logo Container */}
                            <div className="w-[76px] h-[76px] rounded-[22px] bg-white flex items-center justify-center text-[#352B9C] text-[34px] overflow-hidden relative shadow-[0_8px_20px_rgba(0,0,0,0.3)] mb-4 border-[3px] border-[#8E84F3]/30 group-hover:scale-105 transition-transform duration-300 z-10">
                                {businessProfile.logo ? (
                                    <Image src={businessProfile.logo} alt="Logo" fill className="object-contain p-1" />
                                ) : (
                                    <FaReceipt />
                                )}
                            </div>
                            
                            {/* Business Name replacing BillGST */}
                            <div className="w-full relative z-10">
                                <h2 className="text-[20px] font-extrabold text-white leading-tight truncate tracking-tight px-1 drop-shadow-md">
                                    {businessProfile.name || 'Your Business'}
                                </h2>
                                <div className="text-[13px] text-[#C4BFF0] mt-1.5 flex items-center justify-center gap-1.5 font-medium">
                                    <FaCog className="text-[13px]" /> {businessProfile.gstin ? 'Business Settings' : 'Setup Business'}
                                </div>
                            </div>
                            
                            {/* Mobile Close Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(false); }}
                                className="md:hidden absolute top-3 right-3 w-[32px] h-[32px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/10 z-20"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Language row */}
                    <div className="flex shrink-0 mb-5 mt-3 px-6">
                        <LanguageSelector showLabel={true} />
                    </div>

                    {/* Menu Items Container */}
                    <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 pt-2 pb-6 flex flex-col gap-[8px]">
                        {/* Removed 'Menu' text */}
                        
                        {menuItems.filter(item => !item.isAuth).map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.subItems?.some(sub => pathname === sub.href));
                            const hasSubItems = item.subItems && item.subItems.length > 0;

                            if (hasSubItems) {
                                return (
                                    <div key={item.label} className="flex flex-col">
                                        <button
                                            onClick={() => setIsInvoiceOpen(!isInvoiceOpen)}
                                            className={`flex items-center gap-4 px-3 py-3.5 rounded-[12px] cursor-pointer transition-all w-full text-left
                                                ${isActive ? 'bg-[#EEEDFE] shadow-sm' : 'text-[#333] hover:bg-[#f5f5f5]'}`}
                                        >
                                            <div className={`w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[18px] shrink-0 transition-colors
                                                ${isActive ? 'bg-[#CECBF6] text-[#3C3489]' : 'bg-[#f0f0f0] text-[#666]'}`}>
                                                <Icon />
                                            </div>
                                            <span className={`text-[15px] flex-1 ${isActive ? 'text-[#3C3489] font-bold' : 'font-medium'}`}>{item.label}</span>
                                            {isInvoiceOpen ? <FaChevronUp className="text-[#bbb] text-[13px]" /> : <FaChevronDown className="text-[#bbb] text-[13px]" />}
                                        </button>

                                        {isInvoiceOpen && (
                                            <div className="flex flex-col gap-2 mt-2 px-2 py-3 bg-[#F4F3FF] rounded-[16px] border border-[#E4E1FA] shadow-inner mx-1">
                                                {item.subItems?.map((sub) => {
                                                    const SubIcon = sub.icon || FaFileAlt;
                                                    const isSubActive = pathname === sub.href;
                                                    return (
                                                        <Link
                                                            key={sub.href}
                                                            href={sub.href}
                                                            prefetch={true}
                                                            onClick={() => setIsSidebarOpen(false)}
                                                            className={`flex items-center gap-4 px-3 py-3 rounded-[12px] transition-all
                                                                ${isSubActive ? 'bg-[#534AB7] text-white shadow-md transform scale-[1.02]' : 'bg-white hover:bg-[#EAE8FD] text-[#444] hover:text-[#3C3489] shadow-sm hover:shadow-md'}`}
                                                        >
                                                            <div className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[16px] shrink-0 transition-colors
                                                                ${isSubActive ? 'bg-white/20 text-white' : 'bg-[#F4F3FF] text-[#534AB7]'}`}>
                                                                <SubIcon />
                                                            </div>
                                                            <span className={`text-[15px] ${isSubActive ? 'font-bold' : 'font-semibold'}`}>{sub.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    prefetch={true}
                                    onClick={(e) => {
                                        if (item.onClick) {
                                            e.preventDefault();
                                            item.onClick();
                                        } else {
                                            setIsSidebarOpen(false);
                                        }
                                    }}
                                    className={`flex items-center gap-4 px-3 py-3.5 rounded-[12px] cursor-pointer transition-all
                                        ${isActive ? 'bg-[#EEEDFE] shadow-sm' : 'text-[#333] hover:bg-[#f5f5f5]'}`}
                                >
                                    <div className={`w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[18px] shrink-0 transition-colors
                                        ${isActive ? 'bg-[#CECBF6] text-[#3C3489]' : 'bg-[#f0f0f0] text-[#666]'}`}>
                                        <Icon />
                                    </div>
                                    <span className={`text-[15px] flex-1 ${isActive ? 'text-[#3C3489] font-bold' : 'font-medium'}`}>{item.label}</span>
                                </Link>
                            );
                        })}

                        <div className="h-[1px] bg-[#ebebeb] mx-2 my-3" />

                        {/* Auth / Bottom Items */}
                        {menuItems.filter(item => item.isAuth).map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={true}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-4 px-3 py-3.5 rounded-[12px] cursor-pointer transition-all
                                        ${isActive ? 'bg-[#EEEDFE] shadow-sm' : 'text-[#333] hover:bg-[#f5f5f5]'}`}
                                >
                                    <div className={`w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[18px] shrink-0 transition-colors
                                        ${isActive ? 'bg-[#CECBF6] text-[#3C3489]' : 'bg-[#f0f0f0] text-[#666]'}`}>
                                        <Icon />
                                    </div>
                                    <span className={`text-[15px] flex-1 ${isActive ? 'text-[#3C3489] font-bold' : 'font-medium'}`}>{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Additional Quick Action: Settings */}
                        <div className="mt-4 px-3">
                            <WorkspaceSwitcher />
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="border-t-[0.5px] border-[#ebebeb] p-3 bg-white">
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full p-2.5 rounded-[9px] bg-[#FCEBEB] border-[0.5px] border-[#F7C1C1] text-[#791F1F] text-[14px] font-medium transition-colors hover:bg-[#F7C1C1]"
                        >
                            <FaSignOutAlt /> Logout Safe
                        </button>
                        <p className="text-[10px] text-[#aaa] text-center mt-2 leading-[1.5]">
                            BillGST ek private app hai, government entity nahi.<br />
                            Official GST info ke liye <a href="https://gst.gov.in" target="_blank" className="text-[#534AB7] no-underline">gst.gov.in</a> dekhein.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Right Side Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header - Fixed inside the flex container, below safe area automatically */}
                <header className="z-50 shrink-0 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-500 shadow-lg border-b border-white/10 flex flex-col items-center w-full">
                    <div className="w-full max-w-[1600px] flex items-center justify-between px-5 sm:px-8 md:px-12 h-[60px]">
                        <div className="flex items-center justify-between w-full h-full relative"> 
                            {/* Left Side: Logo + Business Name */}
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 group" style={{ paddingLeft: '11px', paddingRight: '11px', marginBottom: '0px' }}>
                                    <div className="relative w-12 h-10 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden shadow-md border-2 border-white/30 group-hover:border-white/60 transition-all flex-shrink-0 bg-white/10 backdrop-blur-sm">
                                        <Image
                                            src={businessProfile?.logo || "/logo.png"}
                                            alt="Business Logo"
                                            fill
                                            className={businessProfile?.logo ? "object-contain p-0.5 bg-white" : "object-cover"}
                                            onError={(e) => {
                                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E"
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col max-w-[120px] md:max-w-[200px]">
                                        <h1 className="font-bold text-white text-sm md:text-base truncate tracking-tight">{businessProfile?.name || 'BillGST'}</h1>
                                    </div>
                                </Link>
                            </div>

                            {/* Center: Removed Time & Date based on user request */}
                            <div className="flex-1"></div>

                            {/* Right Side: Menu */}
                            <div className="flex items-center gap-2 md:gap-4">
                                <Link
                                    href="/dashboard/settings"
                                    className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all"
                                    title="Business Settings"
                                >
                                    <FaCog size={16} />
                                </Link>
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
                                    className="md:hidden flex items-center justify-center w-10 h-10 text-white hover:bg-white/20 rounded-lg transition-all border border-white/30 shadow-sm active:scale-95 backdrop-blur-md" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}
                                    aria-label="Open Menu"
                                >
                                    <FaBars size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto scroll-smooth relative">
                    <div className="max-w-[1600px] mx-auto w-full animate-fadeIn pb-12">
                        {children}
                    </div>
                </main>
            </div>
            
            </div> {/* Close Main Flex Container */}

            {/* 3. Safe Area Protector (Bottom) */}
            <div className="w-full bg-white shrink-0" style={{ height: 'env(safe-area-inset-bottom)' }}></div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <RegistrationPopup />
            <AIChat />
            <SupportChatWidget />
            <UpgradeModal />
            <VoiceAssistant isOpen={isVoiceAssistantOpen} onClose={() => setIsVoiceAssistantOpen(false)} />

            {/* Floating Robot Button */}
            <button
                onClick={() => setIsVoiceAssistantOpen(true)}
                className="fixed bottom-24 right-5 md:right-8 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-40 group border-2 border-white/20"
                title="Voice Assistant"
            >
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <FaRobot size={24} className="animate-pulse" />
            </button>
        </div>
    );
}
