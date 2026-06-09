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
        subItems?: { label: string; href: string }[];
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
                { label: t.invoices, href: '/dashboard/invoices' },
                { label: t.taxInvoice, href: '/dashboard/invoices/new?type=TAX_INVOICE' },
                { label: t.billOfSupply, href: '/dashboard/invoices/new?type=BILL_OF_SUPPLY' },
                { label: t.eWayBill, href: '/dashboard/invoices/new?type=E_WAY_BILL' },
                { label: t.deliveryChallan, href: '/dashboard/invoices/new?type=DELIVERY_CHALLAN' },
                { label: t.quotations || 'Quotation', href: '/dashboard/quotations' },
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
        menuItems.push({ icon: FaIdCard, label: t.staffAttendance || 'Staff & Attendance', href: '/dashboard/staff' });
    }

    if (canSeeAccounting) {
        menuItems.push({ icon: FaBox, label: t.inventory, href: '/dashboard/inventory' });
        menuItems.push({ icon: FaChartBar, label: t.reports, href: '/dashboard/reports' });
        menuItems.push({ icon: FaFileContract, label: t.gstReturns || 'GST Returns', href: '/dashboard/gst-returns' });
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
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b-[0.5px] border-[#e5e5e5]">
                        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setIsSidebarOpen(false)}>
                            <div className="w-[38px] h-[38px] rounded-[10px] bg-[#534AB7] flex items-center justify-center text-white text-[18px] overflow-hidden relative">
                                {businessProfile.logo ? (
                                    <Image src={businessProfile.logo} alt="Logo" fill className="object-cover" />
                                ) : (
                                    <FaReceipt />
                                )}
                            </div>
                            <span className="text-[18px] font-semibold text-[#534AB7] tracking-[-0.3px]">BillGST</span>
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden w-[30px] h-[30px] rounded-full bg-[#f5f5f5] border-[0.5px] border-[#e0e0e0] flex items-center justify-center text-[#666] text-[16px] transition-colors hover:bg-[#ebebeb]"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Business Card */}
                    <div className="mx-3 mt-3 mb-1 px-3 py-2.5 bg-[#EEEDFE] rounded-[10px] flex items-center gap-2.5 cursor-pointer hover:bg-[#e4e2fd] transition-colors" onClick={() => { router.push('/dashboard/settings'); setIsSidebarOpen(false); }}>
                        <div className="w-[36px] h-[36px] rounded-full bg-[#534AB7] flex items-center justify-center text-white text-[13px] font-semibold shrink-0">
                            {businessProfile.name?.substring(0, 2).toUpperCase() || 'AE'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-[#3C3489] leading-[1.3] truncate">{businessProfile.name || 'Your Business'}</div>
                            <div className="text-[11px] text-[#7F77DD] mt-[1px] flex items-center gap-1 truncate">
                                <FaCog className="text-[11px]" /> {businessProfile.gstin ? 'Business Settings' : 'Setup Business'}
                            </div>
                        </div>
                    </div>

                    {/* Language row (using existing LanguageSelector wrapped nicely) */}
                    <div className="flex shrink-0 mb-1 mt-1 px-3">
                        <LanguageSelector showLabel={true} />
                    </div>

                    {/* Menu Items Container */}
                    <nav className="flex-1 overflow-y-auto custom-scrollbar px-2 pt-1 pb-2 flex flex-col">
                        <div className="text-[10px] font-semibold text-[#aaa] uppercase tracking-[0.07em] px-2 pt-2.5 pb-1">Menu</div>
                        
                        {menuItems.filter(item => !item.isAuth).map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.subItems?.some(sub => pathname === sub.href));
                            const hasSubItems = item.subItems && item.subItems.length > 0;

                            if (hasSubItems) {
                                return (
                                    <div key={item.label} className="flex flex-col">
                                        <button
                                            onClick={() => setIsInvoiceOpen(!isInvoiceOpen)}
                                            className={`flex items-center gap-3 px-2.5 py-[9px] rounded-[9px] cursor-pointer transition-colors mb-[2px] w-full text-left
                                                ${isActive ? 'bg-[#EEEDFE]' : 'text-[#333] hover:bg-[#f5f5f5]'}`}
                                        >
                                            <div className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[17px] shrink-0 transition-colors
                                                ${isActive ? 'bg-[#CECBF6] text-[#3C3489]' : 'bg-[#f2f2f2] text-[#666]'}`}>
                                                <Icon />
                                            </div>
                                            <span className={`text-[14px] flex-1 ${isActive ? 'text-[#3C3489] font-medium' : 'font-normal'}`}>{item.label}</span>
                                            {isInvoiceOpen ? <FaChevronUp className="text-[#bbb] text-[12px]" /> : <FaChevronDown className="text-[#bbb] text-[12px]" />}
                                        </button>

                                        {isInvoiceOpen && (
                                            <div className="flex flex-col pl-10 pr-2 pb-2">
                                                {item.subItems?.map((sub) => (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        prefetch={true}
                                                        onClick={() => setIsSidebarOpen(false)}
                                                        className={`py-1.5 text-[13px] ${pathname === sub.href ? 'text-[#3C3489] font-semibold' : 'text-[#666] hover:text-[#333]'}`}
                                                    >
                                                        • {sub.label}
                                                    </Link>
                                                ))}
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
                                    className={`flex items-center gap-3 px-2.5 py-[9px] rounded-[9px] cursor-pointer transition-colors mb-[2px]
                                        ${isActive ? 'bg-[#EEEDFE]' : 'text-[#333] hover:bg-[#f5f5f5]'}`}
                                >
                                    <div className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[17px] shrink-0 transition-colors
                                        ${isActive ? 'bg-[#CECBF6] text-[#3C3489]' : 'bg-[#f2f2f2] text-[#666]'}`}>
                                        <Icon />
                                    </div>
                                    <span className={`text-[14px] flex-1 ${isActive ? 'text-[#3C3489] font-medium' : 'font-normal'}`}>{item.label}</span>
                                </Link>
                            );
                        })}

                        <div className="h-[0.5px] bg-[#ebebeb] mx-1.5 my-2" />

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
                                    className={`flex items-center gap-3 px-2.5 py-[9px] rounded-[9px] cursor-pointer transition-colors mb-[2px]
                                        ${isActive ? 'bg-[#EEEDFE]' : 'text-[#333] hover:bg-[#f5f5f5]'}`}
                                >
                                    <div className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[17px] shrink-0 transition-colors
                                        ${isActive ? 'bg-[#CECBF6] text-[#3C3489]' : 'bg-[#f2f2f2] text-[#666]'}`}>
                                        <Icon />
                                    </div>
                                    <span className={`text-[14px] flex-1 ${isActive ? 'text-[#3C3489] font-medium' : 'font-normal'}`}>{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Additional Quick Action: Settings (already in menu list, so skipping duplicating it, but keeping the workspace switcher) */}
                        <div className="mt-2 px-2">
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
                                <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 group">
                                    <div className="relative w-12 h-10 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden shadow-md border-2 border-white/30 group-hover:border-white/60 transition-all flex-shrink-0 bg-white/10 backdrop-blur-sm">
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
        </div>
    );
}
