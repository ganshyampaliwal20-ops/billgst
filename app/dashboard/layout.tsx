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
            {/* 2. Main Flex Container */}
            <div className="flex-1 flex overflow-hidden bg-[#f1f5f9] relative">
            
            {/* Sidebar */}
            <aside
                className={`absolute md:relative inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static shadow-2xl md:shadow-none pb-[env(safe-area-inset-bottom)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Section */}
                    <div className="p-4 flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-2 group" onClick={() => setIsSidebarOpen(false)}>
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow">
                                {businessProfile.logo ? (
                                    <Image
                                        src={businessProfile.logo}
                                        alt="Logo"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <FaStore className="text-white text-sm" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    BillGST
                                </h1>
                            </div>
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Navigation - Distributed evenly to fit layout */}
                    <nav className="flex-1 py-2 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                        {/* Language Toggle */}
                        <div className="flex shrink-0 mb-1" style={{ paddingLeft: '8px' }}>
                            <LanguageSelector showLabel={true} />
                        </div>

                        {/* Menu Items Container */}
                        <div className="flex flex-col gap-1.5">
                            {menuItems.filter(item => !item.isAuth).map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || (item.subItems?.some(sub => pathname === sub.href));
                                const hasSubItems = item.subItems && item.subItems.length > 0;

                                if (hasSubItems) {
                                    return (
                                        <div key={item.label} className="flex flex-col gap-1">
                                            <button
                                                onClick={() => setIsInvoiceOpen(!isInvoiceOpen)}
                                                className={`
                                                    flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-300 group 
                                                    border relative overflow-hidden flex-1 min-h-[40px] w-full text-left
                                                    bg-blue-600 text-white font-bold border-blue-700 shadow-lg
                                                `}
                                            >
                                                <div className={`p-3 pl-2 pr-2
                                                    p-3 rounded-lg transition-all duration-300 relative z-10 shrink-0
                                                    ${isActive
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-slate-100/50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110'
                                                    }
                                                `}>
                                                    <Icon className={`text-base ml-2 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:rotate-12'}`} />
                                                </div>
                                                <span className="text-xs tracking-wide flex-1 relative z-10 truncate pl-2">{item.label}</span>
                                                {isInvoiceOpen ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
                                            </button>

                                            {isInvoiceOpen && (
                                                <div className="flex flex-col gap-1.5 mt-1.5 px-1">
                                                    {item.subItems?.map((sub) => (
                                                        <Link
                                                            key={sub.href}
                                                            href={sub.href}
                                                            prefetch={true}
                                                            onClick={() => setIsSidebarOpen(false)}
                                                            className={`
                                                                flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold transition-all border-2
                                                                bg-orange-500 text-white border-orange-600 shadow-md hover:bg-orange-600 hover:scale-[1.02] active:scale-95
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
                                        className={`
                                            flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-300 group 
                                            border relative overflow-hidden flex-shrink-0 min-h-[40px]
                                            ${isActive
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold border-indigo-700 shadow-sm'
                                                : 'bg-white text-slate-600 font-semibold border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            p-3 pl-2 pr-2 rounded-lg transition-all duration-300 relative z-10 shrink-0
                                            ${isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-slate-100/50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110'
                                            }
                                        `}>
                                            <Icon className={`text-base ml-2 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:rotate-12'}`} />
                                        </div>
                                        <span className="text-xs tracking-wide flex-1 relative z-10 truncate pl-2">{item.label}</span>

                                        {isActive && (
                                            <>
                                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse z-10" />
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shine pointer-events-none" />
                                            </>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Auth Items */}
                        {menuItems.filter(item => item.isAuth).map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={true}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-300 group 
                                        border relative overflow-hidden flex-shrink-0 min-h-[40px]
                                        ${isActive
                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold border-emerald-700 shadow-sm'
                                            : 'bg-white text-slate-600 font-semibold border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    <div className={`
                                        p-3 rounded-lg transition-all duration-300 relative z-10 shrink-0
                                        ${isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-100/50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110'
                                        }
                                    `}>
                                        <Icon className={`text-base transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:rotate-12'}`} />
                                    </div>
                                    <span className="text-xs tracking-wide flex-1 relative z-10 truncate pl-2">{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Settings Button */}
                        <Link
                            href="/dashboard/settings"
                            prefetch={true}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`
                                flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-300 group 
                                border relative overflow-hidden flex-shrink-0 min-h-[40px] mt-0.5
                                ${pathname === '/dashboard/settings'
                                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold border-slate-900 shadow-sm'
                                    : 'bg-white text-slate-600 font-semibold border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-slate-50'
                                }
                            `}
                        >
                            <div className={`
                                p-3 rounded-lg transition-all duration-300 relative z-10 shrink-0
                                ${pathname === '/dashboard/settings'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100/50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110'
                                }
                            `}>
                                <FaCog className={`text-base transition-transform duration-300 ${pathname === '/dashboard/settings' ? 'spin-slow' : 'group-hover:rotate-90'}`} />
                            </div>
                            <span className="text-xs tracking-wide flex-1 relative z-10 truncate pl-2">{t.settings}</span>
                        </Link>
                    </nav>

                    {/* User Profile / Business Info */}
                    <div className="p-4 pb-16 md:pb-6 border-t border-slate-200 bg-white/90 backdrop-blur-md sticky bottom-0 mt-auto">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                                {businessProfile.logo ? (
                                    <Image
                                        src={businessProfile.logo}
                                        alt="Business Logo"
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <span className="text-base">{businessProfile.name?.charAt(0) || 'B'}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{businessProfile.name || 'Your Business'}</p>
                                <p className="text-[10px] text-slate-500 truncate font-medium bg-slate-100 inline-block px-2 py-0.5 rounded-full mt-0.5">
                                    {businessProfile.gstin || t.setupBusiness}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 px-2 flex flex-col gap-2">
                            <WorkspaceSwitcher />
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 py-3 rounded-xl hover:from-slate-200 hover:to-slate-300 transition-all font-bold group shadow-sm"
                            >
                                <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" />
                                <span>Logout Safe</span>
                            </button>
                            <div className="text-[9px] text-slate-400 text-center mt-2 px-1 leading-tight">
                                <strong>Disclaimer:</strong> BillGST is a private app, not a government entity. For official GST info, visit <a href="https://www.gst.gov.in/" target="_blank" rel="noopener" className="text-blue-500 hover:underline">gst.gov.in</a>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Right Side Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header - Fixed inside the flex container, below safe area automatically */}
                <header className="z-50 shrink-0 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-500 shadow-lg border-b border-white/10 flex justify-center pt-[env(safe-area-inset-top,32px)]">
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
