'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
    FaFileInvoice, FaUsers, FaBox, FaChartBar,
    FaCog, FaBars, FaTimes, FaStore, FaSignOutAlt,
    FaLanguage, FaReceipt, FaWallet, FaTruck, FaCalendarCheck, FaGift,
    FaFileAlt, FaMoneyBillWave, FaFileContract, FaStar,
    FaInfoCircle, FaShieldAlt, FaChevronDown, FaChevronUp, FaRobot, FaIdCard, FaBookOpen, FaHeadset, FaBullhorn
} from 'react-icons/fa';
import { useStore } from '@/lib/store';
import { normalizeRole, isOwnerRole, isAccountantRole, isAttendanceRole, isSalesRole, ROLE_ATTENDANCE, ROLE_ACCOUNTANT, ROLE_SALES, ROLE_ADMIN, ROLE_OWNER } from '@/lib/role-utils';
import LanguageSelector from '@/app/components/LanguageSelector';
import { translations } from '@/lib/translations';
import RegistrationPopup from './RegistrationPopup';
import SupportChatWidget from '@/app/components/SupportChatWidget';
import UpgradeModal from '@/app/components/UpgradeModal';
import WorkspaceSwitcher from '@/app/components/WorkspaceSwitcher';
import VoiceAssistant from './VoiceAssistant';
import DemoNLPAssistant from './DemoNLPAssistant';
import AICopilotLiveHUD from './AICopilotLiveHUD';
import { FaBolt } from 'react-icons/fa';
import PushNotificationSetup from '@/app/components/PushNotificationSetup';

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
    const [isDemoNLPOpen, setIsDemoNLPOpen] = useState(false);
    const { data: session, status } = useSession();

    // Get store values
    const { businessProfile, resetStore, fetchBusinessProfile, settings, setAiChatOpen, setSupportChatOpen, fetchStaff, fetchAttendance } = useStore();

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

    // Removed unused 1-second interval state that caused aggressive layout re-renders.

    if (!isMounted || status === 'loading') {
        return (
            <div className="min-h-screen bg-[#050810] text-slate-100 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-xl shadow-indigo-600/30 animate-pulse">
                        <span className="text-2xl font-black text-white tracking-wider">B</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-4 w-28 bg-slate-800/80 rounded-full animate-pulse"></div>
                        <div className="h-2.5 w-36 bg-slate-800/40 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }
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
    const isSuperAdmin = session?.user?.email === 'billgstapp@gmail.com' || session?.user?.email === 'ganshyampaliwal20@gmail.com';

    const menuItems: MenuItem[] = [];

    const canSeeSales = (isSalesRole(userRole) || isAccountantRole(userRole) || userRole === 'USER') && businessProfile?.modules?.invoicing !== false;
    const canSeeAccounting = (isAccountantRole(userRole) || userRole === 'USER') && businessProfile?.modules?.accounting !== false;
    const canSeeStaff = (isAttendanceRole(userRole) || userRole === 'USER') && businessProfile?.modules?.staff !== false;
    const canSeeInventory = (isAccountantRole(userRole) || userRole === 'USER') && businessProfile?.modules?.inventory !== false;
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

    if (canSeeAccounting) {
        menuItems.push({ icon: FaUsers, label: 'Suppliers', href: '/dashboard/suppliers' });
        menuItems.push({ icon: FaReceipt, label: 'Purchases', href: '/dashboard/purchases' });
    }

    if (canSeeStaff) {
        menuItems.push({ icon: FaIdCard, label: 'Attendance', href: '/dashboard/staff' });
    }

    if (canSeeInventory) {
        menuItems.push({ icon: FaBox, label: t.inventory, href: '/dashboard/inventory' });
    }

    if (canSeeAccounting) {
        menuItems.push({ icon: FaChartBar, label: t.reports, href: '/dashboard/reports' });
        menuItems.push({ icon: FaFileContract, label: t.gstReturns || 'GST Returns', href: '/dashboard/gst-returns' });
    }

    if (isOwner) {
        menuItems.push({ icon: FaStar, label: t.subscription || 'Premium Plans', href: '/dashboard/pricing' });
        menuItems.push({ icon: FaUsers, label: t.referEarn || 'Refer & Earn', href: '/dashboard/referral' });

    }

    menuItems.push({ 
        icon: FaBolt, 
        label: 'Free AI Assistant', 
        href: '#',
        onClick: () => {
            setIsSidebarOpen(false);
            setIsDemoNLPOpen(true);
        }
    });

    menuItems.push({ icon: FaCog, label: t.settings || 'Settings', href: '/dashboard/settings' });

    menuItems.push({ icon: FaInfoCircle, label: t.aboutUs || 'About Us', href: '/about' });
    menuItems.push({ icon: FaShieldAlt, label: t.privacyPolicy || 'Privacy Policy', href: '/privacy' });

    if (isSuperAdmin) {
        menuItems.push({ icon: FaHeadset, label: 'Admin Support Inbox', href: '/dashboard/support' });
        menuItems.push({ icon: FaShieldAlt, label: t.adminPanel || 'Admin Panel', href: '/dashboard/admin' });
    }

    menuItems.push({ 
        icon: FaHeadset, 
        label: t.helpAndSupport || 'Help & Support', 
        href: '/dashboard/help',
        onClick: () => {
            setIsSidebarOpen(false);
            setSupportChatOpen(true);
        }
    });

    const handleLogout = () => {
        document.cookie = 'billgst_workspace_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'billgst_workspace_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        resetStore();
        signOut({ callbackUrl: '/login' });
    };

    return (
        <div className="h-[100dvh] bg-slate-900 flex flex-col overflow-hidden">
            {/* Global Safe Area Protector for Status Bar (Dark background makes white icons visible) */}
            <div className="w-full bg-slate-900 shrink-0 md:hidden z-[100]" style={{ height: 'env(safe-area-inset-top, 0px)' }}></div>
            
            {/* 2. Main Flex Container */}
            <div className="flex-1 flex overflow-hidden bg-[#f1f5f9] relative">
            

            {/* Sidebar */}
            <aside
                className={`absolute md:relative inset-y-0 left-0 z-[60] w-[260px] min-w-[260px] bg-white md:border-r border-[#e8e8e8] flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static shadow-2xl md:shadow-none overflow-hidden pb-[env(safe-area-inset-bottom)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* sb-header */}
                <div className="bg-[#1B5E3B] pt-[18px] px-[16px] pb-[14px]">
                    {/* Mobile Close Button */}
                    <button onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(false); }} className="md:hidden absolute top-2 right-2 w-[28px] h-[28px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/10 z-20"><FaTimes size={12} /></button>

                    <div className="flex items-center gap-[10px] cursor-pointer" onClick={() => { router.push('/dashboard'); setIsSidebarOpen(false); }}>
                        <div className="w-[38px] h-[38px] rounded-[10px] bg-white/20 flex items-center justify-center overflow-hidden relative shrink-0">
                            {businessProfile?.logo ? (
                                <Image src={businessProfile.logo} alt="Logo" fill className="object-cover" />
                            ) : (
                                <FaReceipt className="text-white text-[20px]" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="text-white text-[15px] font-semibold truncate">{businessProfile?.name || 'BillGST'}</div>
                            <div className="text-white/60 text-[11px] mt-[1px] truncate">GST & Non-GST Billing</div>
                        </div>
                    </div>
                    
                    <div className="mt-[12px] flex items-center gap-[9px] bg-white/10 rounded-[8px] py-[8px] px-[10px]">
                        <div className="w-[28px] h-[28px] rounded-full bg-white/25 flex items-center justify-center text-[12px] font-semibold text-white uppercase shrink-0">
                            {(session?.user?.name || 'GJ').substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                            <div className="text-white text-[12px] font-semibold truncate">{session?.user?.name || 'GJP'}</div>
                            <div className="text-white/60 text-[11px] truncate">All India</div>
                        </div>
                    </div>
                </div>

                {/* Language row */}
                <div className="flex shrink-0 mb-1 mt-2 px-2">
                    <LanguageSelector showLabel={true} />
                </div>

                {/* sb-nav */}
                <nav className="flex-1 py-[10px] px-[8px] overflow-y-auto custom-scrollbar flex flex-col">
                    
                    <div className="text-[11px] font-bold text-[#888] uppercase tracking-[0.6px] pt-[16px] px-[12px] pb-[8px]">Main</div>
                    {canSeeSales && (
                        <Link href="/dashboard/invoices" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/dashboard/invoices') || pathname.startsWith('/dashboard/quotations') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                            <FaFileInvoice className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/dashboard/invoices') || pathname.startsWith('/dashboard/quotations') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                            <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/dashboard/invoices') || pathname.startsWith('/dashboard/quotations') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>{t?.invoices || 'Invoices'}</span>
                        </Link>
                    )}
                    {canSeeAccounting && (
                        <Link href="/dashboard/expenses" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/dashboard/expenses') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                            <FaWallet className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/dashboard/expenses') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                            <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/dashboard/expenses') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>{t?.expenses || 'Expenses'}</span>
                        </Link>
                    )}
                    {canSeeAccounting && (
                        <Link href="/dashboard/purchases" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/dashboard/purchases') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                            <FaReceipt className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/dashboard/purchases') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                            <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/dashboard/purchases') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>Purchases</span>
                        </Link>
                    )}

                    <div className="text-[11px] font-bold text-[#888] uppercase tracking-[0.6px] pt-[16px] px-[12px] pb-[8px] mt-[4px]">People</div>
                    {canSeeSales && (
                        <Link href="/dashboard/customers" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/dashboard/customers') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                            <FaUsers className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/dashboard/customers') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                            <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/dashboard/customers') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>{t?.customers || 'Customers'}</span>
                        </Link>
                    )}
                    {canSeeAccounting && (
                        <Link href="/dashboard/suppliers" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/dashboard/suppliers') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                            <FaTruck className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/dashboard/suppliers') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                            <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/dashboard/suppliers') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>Suppliers</span>
                        </Link>
                    )}
                    {canSeeStaff && (
                        <Link href="/dashboard/staff" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/dashboard/staff') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                            <FaCalendarCheck className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/dashboard/staff') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                            <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/dashboard/staff') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>Attendance</span>
                        </Link>
                    )}

                    <div className="text-[11px] font-bold text-[#888] uppercase tracking-[0.6px] pt-[16px] px-[12px] pb-[8px] mt-[4px]">Business</div>
                    {canSeeInventory && (
                        <Link href="/dashboard/inventory" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/dashboard/inventory') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                            <FaBox className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/dashboard/inventory') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                            <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/dashboard/inventory') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>{t?.inventory || 'Inventory'}</span>
                        </Link>
                    )}
                    {canSeeAccounting && (
                        <>
                            <Link href="/dashboard/reports" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/dashboard/reports') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                                <FaChartBar className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/dashboard/reports') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                                <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/dashboard/reports') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>{t?.reports || 'Reports'}</span>
                            </Link>
                            <Link href="/dashboard/gst-returns" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/dashboard/gst-returns') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                                <FaFileContract className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/dashboard/gst-returns') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                                <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/dashboard/gst-returns') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>{t?.gstReturns || 'GST Returns'}</span>
                            </Link>
                        </>
                    )}

                    <div className="text-[11px] font-bold text-[#888] uppercase tracking-[0.6px] pt-[16px] px-[12px] pb-[8px] mt-[4px]">More</div>
                    
                    <div onClick={() => { setIsSidebarOpen(false); setIsDemoNLPOpen(true); }} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors hover:bg-[#f5f5f5]`}>
                        <FaRobot className="text-[20px] w-[26px] text-center text-[#777] shrink-0" />
                        <span className="text-[15px] flex-1 truncate text-[#333]">Free AI Assistant</span>
                    </div>
                    
                    {isOwner && (
                        <>
                            <Link href="/dashboard/pricing" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/dashboard/pricing') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                                <FaStar className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/dashboard/pricing') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                                <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/dashboard/pricing') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>{t?.subscription || 'Subscription'}</span>
                            </Link>
                            <Link href="/dashboard/referral" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/dashboard/referral') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                                <FaGift className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/dashboard/referral') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                                <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/dashboard/referral') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>{t?.referEarn || 'Refer and Earn'}</span>
                            </Link>
                        </>
                    )}

                    <div className="text-[11px] font-bold text-[#888] uppercase tracking-[0.6px] pt-[16px] px-[12px] pb-[8px] mt-[4px]">Settings</div>
                    <Link href="/dashboard/settings" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/dashboard/settings') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                        <FaCog className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/dashboard/settings') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                        <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/dashboard/settings') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>{t?.settings || 'Business Settings'}</span>
                    </Link>
                    <Link href="/about" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/about') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                        <FaInfoCircle className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/about') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                        <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/about') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>{t?.aboutUs || 'About Us'}</span>
                    </Link>
                    <Link href="/privacy" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors ${pathname.startsWith('/privacy') ? 'bg-[#EAF4EE]' : 'hover:bg-[#f5f5f5]'}`}>
                        <FaShieldAlt className={`text-[20px] w-[26px] text-center shrink-0 ${pathname.startsWith('/privacy') ? 'text-[#1B5E3B]' : 'text-[#777]'}`} />
                        <span className={`text-[15px] flex-1 truncate ${pathname.startsWith('/privacy') ? 'text-[#1B5E3B] font-semibold' : 'text-[#333]'}`}>{t?.privacyPolicy || 'Privacy Policy'}</span>
                    </Link>
                    <div onClick={() => { setIsSidebarOpen(false); setSupportChatOpen(true); }} className={`flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer mb-[4px] transition-colors hover:bg-[#f5f5f5]`}>
                        <FaHeadset className={`text-[20px] w-[26px] text-center shrink-0 text-[#777]`} />
                        <span className={`text-[15px] flex-1 truncate text-[#333]`}>Support Inbox</span>
                    </div>

                    <div className="mt-4 px-2">
                        <WorkspaceSwitcher />
                    </div>
                </nav>

                {/* Footer */}
                <div className="border-t border-[#f0f0f0] py-[10px] px-[8px] bg-white">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-[14px] py-[12px] px-[14px] rounded-[12px] cursor-pointer w-full mb-[4px] border-none bg-transparent hover:bg-[#FFEBEE] transition-colors group"
                    >
                        <FaSignOutAlt className="text-[#E53935] text-[17px]" />
                        <span className="text-[13px] text-[#E53935] font-semibold">Logout Safe</span>
                    </button>
                    <p className="text-[10px] text-[#aaa] text-center mt-2 leading-[1.5]">
                        BillGST ek private app hai, government entity nahi.<br />
                        Official GST info ke liye <a href="https://gst.gov.in" target="_blank" className="text-[#534AB7] no-underline">gst.gov.in</a> dekhein.
                    </p>
                </div>
            </aside>

            {/* Right Side Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header - Fixed inside the flex container, below safe area automatically */}
                <header className="z-50 shrink-0 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-500 shadow-lg border-b border-white/10 flex flex-col items-center w-full md:hidden">
                    <div className="w-full max-w-[1600px] flex items-center justify-between px-5 sm:px-8 md:px-12 h-[50px]">
                        <div className="flex items-center justify-between w-full h-full relative"> 
                            {/* Left Side: Logo + Business Name */}
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 group" style={{ paddingLeft: '11px', paddingRight: '11px', marginBottom: '0px' }}>
                                    <div className="relative w-12 h-10 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden shadow-md border-2 border-white/30 group-hover:border-white/60 transition-all flex-shrink-0 bg-white/10 backdrop-blur-sm">
                                        <Image
                                            src={businessProfile?.logo || "/logo.png"}
                                            alt="Business Logo"
                                            fill
                                            className="object-cover bg-white"
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
                            <div className="flex items-center gap-2 md:gap-4 pr-5">
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
            <SupportChatWidget />
            <UpgradeModal />
            
            <AICopilotLiveHUD />
            <DemoNLPAssistant isOpen={isDemoNLPOpen} onClose={() => setIsDemoNLPOpen(false)} />

            {/* NLP Assistant FAB */}
            {pathname === '/dashboard' && (
                <button
                    onClick={() => setIsDemoNLPOpen(true)}
                    className="fixed bottom-[100px] md:bottom-[80px] right-6 z-[90] w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(79,70,229,0.5)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.8)] transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
                    title="Free AI Assistant"
                >
                    <FaRobot size={24} className="animate-pulse" />
                </button>
            )}
            {/* <VoiceAssistant isOpen={isVoiceAssistantOpen} onClose={() => setIsVoiceAssistantOpen(false)} /> */}
            <PushNotificationSetup />
        </div>
    );
}
