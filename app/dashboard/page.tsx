"use client";

import { FaFileInvoice, FaRupeeSign, FaUsers, FaBox, FaChartLine, FaClock, FaReceipt, FaUserPlus, FaBoxOpen, FaTimes, FaStore, FaCog, FaShareAlt, FaGlobe, FaBrain, FaBolt, FaWhatsapp, FaSearch, FaRobot, FaVolumeUp } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { translations, getTranslations } from '@/lib/translations';
import { formatCurrency, formatCompactNumber } from '@/lib/utils';
import { openWhatsAppChat } from '@/lib/whatsapp-utils';
import FreePlanPopup from './FreePlanPopup';
import RegistrationPopup from './RegistrationPopup';
// Dynamic import used for Chart.js
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
        const invoices = useStore((state: any) => state.invoices);
    const customers = useStore((state: any) => state.customers);
    const products = useStore((state: any) => state.products);
    const businessProfile = useStore((state: any) => state.businessProfile);
    const settings = useStore((state: any) => state.settings);
    const getAnalytics = useStore((state: any) => state.getAnalytics);
    const getTopProducts = useStore((state: any) => state.getTopProducts);
    const fetchCustomers = useStore((state: any) => state.fetchCustomers);
    const fetchProducts = useStore((state: any) => state.fetchProducts);
    const fetchInvoices = useStore((state: any) => state.fetchInvoices);
    const fetchBusinessProfile = useStore((state: any) => state.fetchBusinessProfile);
    const [isClient, setIsClient] = useState(false);
    const [period, setPeriod] = useState('monthly');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [showSetupBanner, setShowSetupBanner] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [chartView, setChartView] = useState('area');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [showAllCollection, setShowAllCollection] = useState(false);
    const [autoReminders, setAutoReminders] = useState<any[]>([]);
    const [isRefreshingReminders, setIsRefreshingReminders] = useState(false);
    const [collectionSearch, setCollectionSearch] = useState('');
    const [showAllTopProducts, setShowAllTopProducts] = useState(false);
    const [invVideoIndex, setInvVideoIndex] = useState(0);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);

    const [referralData, setReferralData] = useState<any>(null);

    useEffect(() => {
        if (businessProfile?.plan_type === 'FREE' || !businessProfile?.plan_type) {
            fetch('/api/referrals')
                .then(res => res.json())
                .then(data => {
                    if (data && data.balance !== undefined) {
                        setReferralData(data);
                    }
                })
                .catch(err => console.error("Error fetching referral data:", err));
        }
    }, [businessProfile?.plan_type]);

    const inventoryVideos = ['DZPJ6mvofNg', 'DYMIQH5Ipjf'];

    const router = useRouter();
    const miniChartRef = useRef<HTMLCanvasElement>(null);
    const t: any = getTranslations(settings?.language);

    const handleShareStore = () => {
        if (!businessProfile.id) return;
        const url = `${window.location.origin}/s/${businessProfile.id}`;
        if (navigator.share) {
            navigator.share({
                title: businessProfile.name || 'Our Online Store',
                text: `Welcome to our online store! Check out our products and order on WhatsApp.`,
                url: url,
            }).catch(() => {
                navigator.clipboard.writeText(url);
                toast.success('Store link copied to clipboard!');
            });
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Store link copied to clipboard!');
        }
    };

    const handleSendReminder = (customer: any) => {
        const customerName = customer.name || 'Customer';
        const amount = customer.totalPending;
        const businessName = businessProfile.name || 'Our Business';
        const message = `Namaste ${customerName} ji, hope you are doing well. This is a gentle reminder regarding your total outstanding balance of ${formatCurrency(amount)} with ${businessName}. Please process the payment at your earliest convenience. Thank you!`;
        const phone = customer.phone?.replace(/\\D/g, '') || '';
        if (!phone) {
            toast.error('Pahle customer ka mobile number add karein, uske baad WhatsApp par share hoga.', { icon: '📱' });
            return;
        }
        openWhatsAppChat(phone, message);
        toast.success(`Opening WhatsApp for ${customerName}...`);
    };

    const handleBulkReminder = (customersToRemind: any[]) => {
        const toRemind = selectedCustomers.length > 0
            ? customersToRemind.filter(c => selectedCustomers.includes(c.id))
            : customersToRemind;

        if (toRemind.length === 0) {
            toast.error('Please select at least one customer');
            return;
        }

        toast.success(`Processing ${toRemind.length} customers...`, { icon: '🚀' });

        toRemind.forEach((cust, index) => {
            setTimeout(() => {
                const customerName = cust.name;
                const amount = cust.totalPending || cust.pending_amount;
                const businessName = businessProfile.name || 'Our Business';
                const message = cust.message || `Namaste ${customerName} ji, this is a reminder for your total pending balance of ${formatCurrency(amount)} with ${businessName}. Thank you!`;
                const phone = cust.phone?.replace(/\\D/g, '') || cust.customer_phone?.replace(/\\D/g, '') || '';

                if (!phone) {
                    toast.error(`Customer ${customerName} ka mobile number nahi hai.`, { icon: '📱' });
                } else {
                    openWhatsAppChat(phone, message);
                }
            }, index * 3000);
        });
    };

    const fetchAutoReminders = async () => {
        if (!businessProfile.id) return;
        setIsRefreshingReminders(true);
        try {
            const res = await fetch(`/api/public/whatsapp/reminders?secret=${process.env.NEXT_PUBLIC_WHATSAPP_CRON_SECRET || ''}`);
            const data = await res.json();
            if (data.success) {
                const myReminders = data.reminders.filter((r: any) => r.business_id === businessProfile.id);
                setAutoReminders(myReminders);
            }
        } catch (error) {
            console.error('Failed to fetch auto-reminders:', error);
        } finally {
            setIsRefreshingReminders(false);
        }
    };

    useEffect(() => {
        setIsClient(true);
        try {
            const bannerDismissed = localStorage.getItem('setupBannerDismissed');
            if (bannerDismissed) setShowSetupBanner(false);
        } catch (e) { /* ignore */ }
        // setInterval removed
        fetchCustomers();
        fetchProducts();
        fetchInvoices();
        fetchBusinessProfile();
        fetchAutoReminders();
        // clearInterval removed
    }, []);

    useEffect(() => {
        if (businessProfile.id) {
            fetchAutoReminders();
        }
    }, [businessProfile.id]);

    useEffect(() => {
        if (!isClient || !miniChartRef.current) return;
        
        let chartInstance: any;

        const initChart = async () => {
            const { default: Chart } = await import('chart.js/auto');
            if (!miniChartRef.current) return;
            chartInstance = new Chart(miniChartRef.current, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79,70,229,0.06)',
                    borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#4f46e5',
                    fill: true, tension: .45
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => '₹' + ((ctx.raw as number) / 1000).toFixed(0) + 'K' } } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'Sora', size: 10 }, color: '#7c88a6' } },
                    y: { display: true, ticks: { callback: (val: any) => "₹" + (Number(val) / 1000).toFixed(0) + "K" } }
                }
            }
        });
        };
        
        initChart();
        return () => {
            if (chartInstance) chartInstance.destroy();
        };
    }, [isClient]);

    if (!isClient) return (
        <div className="flex h-screen w-full items-center justify-center bg-[#f0f2fa]">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const { totalSales, totalProfit, invoiceCount } = getAnalytics(period, customRange);
    const topProducts = getTopProducts() || [];
    const lowStockItems = (products || []).filter((p: any) => Number(p.stock_quantity) < Number(p.low_stock_alert || 10)).length;

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return t.goodMorning;
        if (hour < 17) return t.goodAfternoon;
        return t.goodEvening;
    };

    const todayDate = new Date();
    const todaySales = (invoices || [])
        .filter((inv: any) => {
            if (['QUOTATION', 'DELIVERY_CHALLAN', 'E_WAY_BILL', 'PROFORMA_INVOICE'].includes(inv.type || '')) return false;
            if (!inv.invoice_date) return false;
            const d = new Date(inv.invoice_date);
            return d.getFullYear() === todayDate.getFullYear() && d.getMonth() === todayDate.getMonth() && d.getDate() === todayDate.getDate();
        })
        .reduce((acc: number, inv: any) => acc + (parseFloat(inv.total_amount) || parseFloat(inv.subtotal) || 0), 0);

    const pendingInvoices = (invoices || []).filter((inv: any) => inv.status !== 'PAID');
    const pendingByCustomer = pendingInvoices.reduce((acc: any, inv: any) => {
        const id = inv.customer_id || inv.customer?.id;
        const custObj = (customers || []).find((c: any) => c.id === id);
        if (!acc[id]) {
            acc[id] = {
                id,
                name: inv.customer?.name || 'Unknown',
                phone: inv.customer?.phone || '',
                totalPending: 0,
                invoiceCount: 0,
                lastInvoiceDate: inv.invoice_date,
                promise_date: custObj?.promise_date || null
            };
        }
        acc[id].totalPending += parseFloat(inv.total_amount) || 0;
        acc[id].invoiceCount += 1;
        return acc;
    }, {});
    const pendingCustomersList = Object.values(pendingByCustomer)
        .filter((c: any) => c.name.toLowerCase().includes(collectionSearch.toLowerCase()))
        .sort((a: any, b: any) => b.totalPending - a.totalPending);

    const formatLakhs = (val: number) => {
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lk`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)} K`;
        return `₹${Number(val || 0).toLocaleString('en-IN')}`;
    };

    const totalOverallPending = pendingCustomersList.reduce((acc: number, c: any) => acc + c.totalPending, 0);

    const recentInvoices = (invoices || []).slice(0, 5);

    return (
        <div className="db-wrapper">
            <style dangerouslySetInnerHTML={{
                __html: `
:root {
  --bg: #f0f2fa;
  --white: #fff;
  --ink: #0b0f1e;
  --ink2: #1c2340;
  --slate: #3d4766;
  --muted: #7c88a6;
  --border: #e2e6f3;
  --faint: #f5f7fd;
  --indigo: #4f46e5;
  --indigo2: #7c3aed;
  --teal: #0ea5e9;
  --green: #10b981;
  --green2: #059669;
  --red: #ef4444;
  --amber: #f59e0b;
  --orange: #f97316;
  --shadow: 0 2px 16px rgba(11,15,30,.07),0 1px 4px rgba(11,15,30,.04);
  --shadow-md: 0 8px 32px rgba(11,15,30,.11),0 2px 8px rgba(11,15,30,.06);
}
.db-wrapper { font-family: 'Sora', sans-serif; color: var(--ink); width: 100%; }
.db-wrapper * { box-sizing: border-box; }

.content { padding: 24px 28px 40px; flex: 1; min-width: 0; }
.greeting-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.greeting-h1 { font-size: 18px; font-weight: 800; color: var(--ink); letter-spacing: -.6px; margin: 0; display: flex; align-items: center; gap: 8px; }
.greeting-h1 span { background: linear-gradient(135deg, var(--indigo), var(--indigo2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.greeting-right { display: flex; align-items: center; flex-shrink: 0; }
.time-badge { display: flex; align-items: center; gap: 8px; background: var(--white); border: 1.5px solid var(--border); border-radius: 12px; padding: 8px 16px; box-shadow: var(--shadow); font-size: 12.5px; font-weight: 700; color: var(--slate); white-space: nowrap; }
.time-badge .dot { width: 7px; height: 7px; background: var(--green); border-radius: 50%; animation: pulse 2s infinite; box-shadow: 0 0 8px var(--green); }
@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: .6; } 100% { transform: scale(1); opacity: 1; } }
@media(max-width: 640px) {
  .greeting-row { gap: 10px; margin-bottom: 20px; flex-direction: row; align-items: center; }
  .greeting-h1 { font-size: 16px; }
  .greeting-h1 span { max-width: 120px; }
  .time-badge { padding: 6px 12px; font-size: 11px; }
  .greeting-right { margin-left: auto; }
}

.qa-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 24px; }
.qa-card { flex: 1 1 100px; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 18px 10px; border-radius: 16px; cursor: pointer; transition: all .25s; border: none; text-decoration: none; animation: fadeUp .4s ease both; }
.qa-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.qa-card .qa-icon { font-size: 26px; }
.qa-card .qa-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .6px; color: #fff; text-align: center; line-height: 1.3; }
.qa-card.c1 { background: linear-gradient(135deg, #4338ca, #4f46e5); box-shadow: 0 6px 20px rgba(79,70,229,0.35); }
.qa-card.c2 { background: linear-gradient(135deg, #059669, #10b981); box-shadow: 0 6px 20px rgba(16,185,129,0.35); }
.qa-card.c3 { background: linear-gradient(135deg, #7c3aed, #9333ea); box-shadow: 0 6px 20px rgba(147,51,234,0.35); }
.qa-card.c4 { background: linear-gradient(135deg, #1d4ed8, #2563eb); box-shadow: 0 6px 20px rgba(37,99,235,0.35); }
.qa-card.c5 { background: linear-gradient(135deg, #047857, #059669); box-shadow: 0 6px 20px rgba(5,150,105,0.35); }
.qa-card.c6 { background: linear-gradient(135deg, #7c3aed, #6d28d9); box-shadow: 0 6px 20px rgba(109,40,217,0.35); }

@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

.period-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
.period-tabs { display: flex; background: var(--white); border: 1.5px solid var(--border); border-radius: 12px; padding: 4px; gap: 2px; box-shadow: var(--shadow); overflow-x: auto;}
.ptab { padding: 7px 18px; border-radius: 9px; font-size: 12px; font-weight: 700; color: var(--muted); cursor: pointer; transition: all .2s; white-space: nowrap; }
.ptab.active { background: linear-gradient(135deg, var(--indigo), var(--indigo2)); color: #fff; box-shadow: 0 3px 10px rgba(79,70,229,0.35); }
.section-title { font-size: 14px; font-weight: 800; color: var(--ink); letter-spacing: -.2px; }
.section-sub { font-size: 11px; color: var(--muted); font-weight: 400; }

.kpi-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.kpi-card { background: var(--white); border-radius: 16px; padding: 18px 16px; box-shadow: var(--shadow); border: 1px solid var(--border); transition: all .25s; animation: fadeUp .4s ease both; position: relative; overflow: hidden; }
.kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 16px 16px 0 0; }
.kpi-card.k1::before { background: linear-gradient(90deg, #4f46e5, #818cf8); }
.kpi-card.k2::before { background: linear-gradient(90deg, #10b981, #34d399); }
.kpi-card.k3::before { background: linear-gradient(90deg, #0ea5e9, #38bdf8); }
.kpi-card.k4::before { background: linear-gradient(90deg, #ef4444, #f87171); }
.kpi-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.kpi-ico { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 19px; }
.kpi-trend { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
.trend-up { background: rgba(16,185,129,0.1); color: var(--green); }
.trend-down { background: rgba(239,68,68,0.1); color: var(--red); }
.kpi-val { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 700; letter-spacing: -.5px; margin-bottom: 4px; }
.kpi-lbl { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: var(--muted); }

.main-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 18px; margin-bottom: 20px; }
.card { background: var(--white); border-radius: 18px; padding: 20px; box-shadow: var(--shadow); border: 1px solid var(--border); animation: fadeUp .5s ease both; }
.card-hdr { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.card-title { font-size: 14px; font-weight: 800; color: var(--ink); letter-spacing: -.2px; }
.card-sub { font-size: 11px; color: var(--muted); font-weight: 400; margin-top: 2px; }
.see-all { font-size: 11.5px; font-weight: 700; color: var(--indigo); cursor: pointer; white-space: nowrap; }
.see-all:hover { text-decoration: underline; }

.inv-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--faint); cursor: pointer; transition: all .15s; }
.inv-row:last-child { border-bottom: none; }
.inv-row:hover { background: var(--faint); margin: 0 -8px; padding: 10px 8px; border-radius: 10px; }
.inv-av { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #fff; flex-shrink: 0; }
.inv-info { flex: 1; min-width: 0; }
.inv-name { font-size: 13px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.inv-meta { font-size: 11px; color: var(--muted); font-weight: 400; font-family: 'JetBrains Mono', monospace; margin-top: 1px; }
.inv-right { text-align: right; flex-shrink: 0; }
.inv-amt { font-family: 'JetBrains Mono', monospace; font-size: 13.5px; font-weight: 700; color: var(--ink); }
.inv-status { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; margin-top: 3px; }
.s-unpaid { background: rgba(239,68,68,0.1); color: var(--red); }
.s-paid { background: rgba(16,185,129,0.1); color: var(--green); }
.s-partial { background: rgba(245,158,11,0.1); color: var(--amber); }

.coll-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.coll-card { background: var(--faint); border: 1.5px solid var(--border); border-radius: 13px; padding: 16px; cursor: pointer; transition: all .2s; }
.coll-card:hover { border-color: var(--indigo); background: #fff; transform: translateY(-1px); box-shadow: var(--shadow); }
.coll-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.coll-num { width: 32px; height: 32px; background: var(--slate); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; }
.coll-bills { font-size: 10.5px; font-weight: 700; color: var(--teal); }
.coll-name { font-size: 13px; font-weight: 800; color: var(--ink); margin-bottom: 2px; }
.coll-last { font-size: 10.5px; color: var(--muted); font-weight: 400; }
.coll-amt { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: var(--red); margin-top: 4px; }
.coll-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
.wa-btn { width: 28px; height: 28px; background: rgba(16,185,129,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; transition: all .2s; border: none; }
.wa-btn:hover { background: rgba(16,185,129,0.25); }
.select-box { width: 20px; height: 20px; border: 2px solid var(--border); border-radius: 6px; cursor: pointer; transition: all .2s; background: var(--white); }

.action-bar { display: flex; gap: 10px; margin-bottom: 16px; }
.action-bar-btn { flex: 1; padding: 12px; border-radius: 12px; border: none; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: all .2s; }
.btn-remind { background: linear-gradient(135deg, #1d4ed8, #4f46e5); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,0.35); }
.btn-due { background: #fff; color: var(--indigo); border: 1.5px solid var(--indigo); box-shadow: none; }
.action-bar-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }

.prod-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.prod-card { background: var(--faint); border: 1.5px solid var(--border); border-radius: 13px; padding: 12px; position: relative; cursor: pointer; transition: all .2s; }
.prod-card:hover { border-color: var(--amber); background: #fff; transform: translateY(-2px); box-shadow: var(--shadow); }
.prod-rank { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; margin-bottom: 6px; }
.rank-1 { background: linear-gradient(135deg, #f59e0b, #f97316); }
.rank-2 { background: linear-gradient(135deg, #6b7280, #9ca3af); }
.rank-3 { background: linear-gradient(135deg, #92400e, #b45309); }
.rank-other { background: var(--slate); }
.prod-badge { position: absolute; top: 10px; right: 10px; font-size: 9.5px; font-weight: 800; text-transform: uppercase; padding: 2px 7px; border-radius: 5px; }
.badge-best { background: rgba(245,158,11,0.15); color: var(--amber); }
.badge-top { background: rgba(14,165,233,0.12); color: var(--teal); }
.prod-name { font-size: 12.5px; font-weight: 800; color: var(--ink); margin-bottom: 2px; }
.prod-sold { font-size: 10.5px; color: var(--muted); font-weight: 500; }
.prod-amt { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: var(--indigo); margin-top: 4px; }

.bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 20px; }
.store-card { background: linear-gradient(135deg, #0f172a, #1e3a5f); border-radius: 18px; padding: 20px; box-shadow: var(--shadow-md); display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all .2s; }
.store-card:hover { transform: translateY(-2px); }
.store-icon { width: 50px; height: 50px; background: rgba(255,255,255,0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.store-info .store-title { font-size: 15px; font-weight: 800; color: #fff; }
.store-info .store-sub { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 2px; }
.store-btns { display: flex; gap: 8px; margin-top: 12px; }
.store-btn { flex: 1; padding: 10px; border-radius: 10px; border: none; font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all .2s; }
.btn-open { background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; }
.btn-share { background: linear-gradient(135deg, #059669, #10b981); color: #fff; }

.gst-quick { background: var(--white); border-radius: 18px; padding: 20px; box-shadow: var(--shadow); border: 1px solid var(--border); }
.gst-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--faint); font-size: 13px; }
.gst-row:last-child { border-bottom: none; }
.gst-key { color: var(--muted); font-weight: 500; }
.gst-val { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--ink); }

.support-btn { width: fit-content; min-width: 280px; margin: 20px auto; margin-top: 20px; padding: 16px; background: linear-gradient(135deg, var(--indigo), var(--indigo2)); color: #fff; border: none; border-radius: 14px; font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 6px 20px rgba(79,70,229,0.35); transition: all .2s; }
.support-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(79,70,229,0.45); }

.footer-dark{
  background:#151a2e;
  border-radius:16px;
  padding:24px 28px;
  display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:20px;
  margin-top: 16px;
}
.footer-dark-text p.t{color:#fff;font-size:15px;font-weight:700;margin:0 0 3px;}
.footer-dark-text p.s{color:#8b90a8;font-size:12.5px;margin:0;}
.social-dark-row{display:flex;gap:10px;}
.social-dark-btn{
  width:42px;height:42px;border-radius:10px;
  background:#232945;
  display:flex;align-items:center;justify-content:center;
  text-decoration:none;transition:.18s;
}
.social-dark-btn svg{width:19px;height:19px;fill:#c7cadd;}
.social-dark-btn:hover{background:#7c5cff;}
.social-dark-btn:hover svg{fill:#fff;}

@media(max-width:1024px) { 
  .qa-grid { gap: 8px; } 
  .kpi-strip { grid-template-columns: repeat(2, 1fr); gap: 10px; } 
  .main-grid { grid-template-columns: 1fr; gap: 16px; } 
  .bottom-grid { grid-template-columns: 1fr; } 
}
@media(max-width:768px) { 
  .greeting-row { margin-bottom: 16px; }
  .content { padding: 12px 14px 40px; } 
  .prod-grid { grid-template-columns: 1fr 1fr; } 
  .coll-grid { grid-template-columns: 1fr; } 
  .qa-card { padding: 12px 4px; flex: 1 1 calc(33.333% - 12px); max-width: 100%; }
  .qa-card .qa-icon { font-size: 20px; }
  .qa-card .qa-label { font-size: 10px; }
  .kpi-card { padding: 14px 12px; }
  .kpi-val { font-size: 18px; }
  .inv-row:hover { margin: 0; padding: 10px 0; }
  .inv-name { font-size: 12px; }
  .inv-amt { font-size: 12px; }
}
@media(max-width:480px) {
  .kpi-strip { grid-template-columns: repeat(2, 1fr); }
  .kpi-ico { width: 32px; height: 32px; font-size: 15px; }
}
          `}} />

            <div className="content">
                <div className="greeting-row">
                    <h1 className="greeting-h1">
                        {getGreeting()}, <span>{businessProfile.name || 'Business'}</span>! 👋
                    </h1>
                </div>

                {/* Low Invoice Balance Alert */}
                {referralData && referralData.balance !== undefined && referralData.balance <= 5 && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', animation: 'fadeUp .4s ease both' }}>
                        <div>
                            <div style={{ color: '#991b1b', fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>⚠️ Aapke Free Invoices Khatam Hone Wale Hain!</div>
                            <div style={{ color: '#b91c1c', fontSize: '12px' }}>Sirf <strong>{referralData.balance} invoices</strong> bache hain. Kisi dost ko refer karein aur turant <strong>20 Free Invoices</strong> payein.</div>
                        </div>
                        <Link href="/dashboard/referral" style={{ background: '#dc2626', color: '#fff', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 12px rgba(220,38,38,0.3)', whiteSpace: 'nowrap' }}>
                            Refer & Earn 20 Invoices
                        </Link>
                    </div>
                )}

                <div className="qa-grid">
                    {businessProfile?.modules?.invoicing !== false && (
                        <>
                            <Link href="/dashboard/invoices/new" className="qa-card c1" style={{ animationDelay: ".05s" }}><span className="qa-icon">🧾</span><span className="qa-label">{t.newInvoice}</span></Link>
                            <Link href="/dashboard/customers" className="qa-card c2" style={{ animationDelay: ".08s" }}><span className="qa-icon">👤</span><span className="qa-label">{t.addCustomer}</span></Link>
                        </>
                    )}
                    {businessProfile?.modules?.inventory !== false && (
                        <Link href="/dashboard/inventory" className="qa-card c3" style={{ animationDelay: ".11s" }}><span className="qa-icon">📦</span><span className="qa-label">{t.addProduct}</span></Link>
                    )}
                    {(businessProfile?.modules?.invoicing !== false || businessProfile?.modules?.inventory !== false) && (
                        <Link href="/dashboard/reports" className="qa-card c4" style={{ animationDelay: ".14s" }}><span className="qa-icon">📊</span><span className="qa-label">{t.viewReports}</span></Link>
                    )}
                    {businessProfile?.modules?.staff !== false && (
                        <Link href="/dashboard/staff" className="qa-card c5" style={{ animationDelay: ".17s" }}><span className="qa-icon">👥</span><span className="qa-label">{t.attendance || 'Attendance'}</span></Link>
                    )}
                    {businessProfile?.modules?.accounting !== false && (
                        <Link href="/dashboard/expenses" className="qa-card c6" style={{ animationDelay: ".2s" }}><span className="qa-icon">💸</span><span className="qa-label">{t.expenses}</span></Link>
                    )}
                </div>

                {/* Tutorial Videos Section (Scrollable if multiple) */}
                {(businessProfile?.modules?.inventory !== false || businessProfile?.modules?.invoicing !== false || businessProfile?.modules?.accounting !== false || businessProfile?.modules?.staff !== false) && (
                    <div className="w-full mt-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                        <div className="flex gap-4 md:gap-8 px-4 w-max md:w-full justify-start xl:justify-center mx-auto snap-x snap-mandatory">
                            
                            {/* Invoicing / Inventory Video */}
                            {(businessProfile?.modules?.inventory !== false || businessProfile?.modules?.invoicing !== false) && (
                                <div className="shrink-0 snap-center flex flex-col items-center group" style={{ width: '75vw', maxWidth: '280px' }}>
                                    <div className="relative overflow-hidden rounded-xl shadow-md border-[4px] border-white bg-black pointer-events-auto w-full transition-opacity duration-500" style={{ aspectRatio: '16/9' }}>
                                        {playingVideo === inventoryVideos[invVideoIndex] ? (
                                        <iframe 
                                            key={invVideoIndex}
                                            src={`https://www.instagram.com/reel/${inventoryVideos[invVideoIndex]}/embed`} 
                                            width="100%" 
                                            height="600" 
                                            frameBorder="0" 
                                            scrolling="no" 
                                            allowTransparency 
                                            className="absolute top-0 left-0 w-full animate-in fade-in duration-500"
                                            style={{ marginTop: '-55px' }}
                                        ></iframe>
                                        ) : (
                                                <div 
                                                    style={{ 
                                                        width: '100%', height: '100%', 
                                                        backgroundColor: '#0f172a',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'absolute', top: 0, left: 0, zIndex: 5
                                                    }}
                                                    onClick={() => setPlayingVideo(inventoryVideos[invVideoIndex])}
                                                >
                                                    <img src="/logo.png" alt="BillGST" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, position: 'absolute' }} />
                                                    <div style={{ position: 'relative', zIndex: 10,
                                                        width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.95)', 
                                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                                }}>
                                                    <svg viewBox="0 0 24 24" fill="#dc2743" width="14" height="14" style={{ marginLeft: '4px' }}>
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                                <div style={{ position: 'absolute', bottom: '10px', color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>Click to Play</div>
                                            </div>
                                        )}

                                        {/* Prev Button */}
                                        {inventoryVideos.length > 1 && (
                                            <button 
                                                onClick={() => setInvVideoIndex(prev => prev === 0 ? inventoryVideos.length - 1 : prev - 1)}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100 z-10"
                                            >
                                                &#10094;
                                            </button>
                                        )}
                                        {/* Next Button */}
                                        {inventoryVideos.length > 1 && (
                                            <button 
                                                onClick={() => setInvVideoIndex(prev => (prev + 1) % inventoryVideos.length)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100 z-10"
                                            >
                                                &#10095;
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-800">📦 Inventory & Billing</span>
                                        <div className="flex gap-1 ml-1">
                                            {inventoryVideos.map((_, i) => (
                                                <div key={i} className={`h-1.5 w-1.5 rounded-full ${i === invVideoIndex ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Expenses / Accounting Video */}
                            {(businessProfile?.modules?.accounting !== false) && (
                                <div className="shrink-0 snap-center flex flex-col items-center" style={{ width: '75vw', maxWidth: '280px' }}>
                                    <div className="relative overflow-hidden rounded-xl shadow-md border-[4px] border-white bg-black pointer-events-auto w-full" style={{ aspectRatio: '16/9' }}>
                                        {playingVideo === 'DZHTY54IR_l' ? (
                                        <iframe 
                                            src="https://www.instagram.com/reel/DZHTY54IR_l/embed" 
                                            width="100%" 
                                            height="600" 
                                            frameBorder="0" 
                                            scrolling="no" 
                                            allowTransparency 
                                            className="absolute top-0 left-0 w-full"
                                            style={{ marginTop: '-300px', transform: 'scale(1.5)', transformOrigin: 'top center' }}
                                        ></iframe>
                                        ) : (
                                            <div 
                                                style={{ 
                                                    width: '100%', height: '100%', 
                                                    backgroundColor: '#0f172a',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'absolute', top: 0, left: 0, zIndex: 5
                                                }}
                                                onClick={() => setPlayingVideo('DZHTY54IR_l')}
                                            >
                                                <img src="/logo.png" alt="BillGST" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, position: 'absolute' }} />
                                                <div style={{ position: 'relative', zIndex: 10,
                                                    width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.95)', 
                                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                                }}>
                                                    <svg viewBox="0 0 24 24" fill="#dc2743" width="14" height="14" style={{ marginLeft: '4px' }}>
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                                <div style={{ position: 'absolute', bottom: '10px', color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>Click to Play</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                                        <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">💸 Expense Tracking</span>
                                    </div>
                                </div>
                            )}

                            {/* Attendance / Staff Video */}
                            {(businessProfile?.modules?.staff !== false) && (
                                <div className="shrink-0 snap-center flex flex-col items-center" style={{ width: '75vw', maxWidth: '280px' }}>
                                    <div className="relative overflow-hidden rounded-xl shadow-md border-[4px] border-white bg-black pointer-events-auto w-full" style={{ aspectRatio: '16/9' }}>
                                        {playingVideo === 'DZARRuCI0rT' ? (
                                        <iframe 
                                            src="https://www.instagram.com/reel/DZARRuCI0rT/embed" 
                                            width="100%" 
                                            height="600" 
                                            frameBorder="0" 
                                            scrolling="no" 
                                            allowTransparency 
                                            className="absolute top-0 left-0 w-full"
                                            style={{ marginTop: '-55px' }}
                                        ></iframe>
                                        ) : (
                                            <div 
                                                style={{ 
                                                    width: '100%', height: '100%', 
                                                    backgroundColor: '#0f172a',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'absolute', top: 0, left: 0, zIndex: 5
                                                }}
                                                onClick={() => setPlayingVideo('DZARRuCI0rT')}
                                            >
                                                <img src="/logo.png" alt="BillGST" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, position: 'absolute' }} />
                                                <div style={{ position: 'relative', zIndex: 10,
                                                    width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.95)', 
                                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                                }}>
                                                    <svg viewBox="0 0 24 24" fill="#dc2743" width="14" height="14" style={{ marginLeft: '4px' }}>
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                                <div style={{ position: 'absolute', bottom: '10px', color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>Click to Play</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                                        <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">👥 Staff Attendance</span>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {businessProfile?.modules?.invoicing !== false && (
                <div className="period-row">
                    <div>
                        <div className="section-title">{t.businessOverview}</div>
                        <div className="section-sub">{t.realTimePerformance}</div>
                    </div>
                    <div className="period-tabs">
                        <div className={`ptab ${period === 'daily' ? 'active' : ''}`} onClick={() => setPeriod('daily')}>{t.daily}</div>
                        <div className={`ptab ${period === 'weekly' ? 'active' : ''}`} onClick={() => setPeriod('weekly')}>{t.weekly}</div>
                        <div className={`ptab ${period === 'monthly' ? 'active' : ''}`} onClick={() => setPeriod('monthly')}>{t.monthly}</div>
                        <div className={`ptab ${period === 'yearly' ? 'active' : ''}`} onClick={() => setPeriod('yearly')}>{t.yearly}</div>
                        <div className={`ptab ${period === 'custom' ? 'active' : ''}`} onClick={() => setPeriod('custom')}>{t.custom}</div>
                    </div>
                </div>
                )}

                <div className="kpi-strip">
                    {businessProfile?.modules?.invoicing !== false && (
                        <>
                            <Link href="/dashboard/reports?period=daily" className="kpi-card k1" style={{ animationDelay: ".1s", cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}>
                                <div className="kpi-top"><div className="kpi-ico" style={{ background: "rgba(79,70,229,0.1)" }}>💰</div><div className="kpi-trend trend-up">Now</div></div>
                                <div className="kpi-val" style={{ color: "var(--indigo)" }}>{formatCompactNumber(todaySales)}</div>
                                <div className="kpi-lbl">{t.todaysSales}</div>
                            </Link>
                            <Link href="/dashboard/reports" className="kpi-card k2" style={{ animationDelay: ".14s", cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}>
                                <div className="kpi-top"><div className="kpi-ico" style={{ background: "rgba(16,185,129,0.1)" }}>📈</div><div className="kpi-trend trend-up">Total</div></div>
                                <div className="kpi-val" style={{ color: "var(--green)" }}>{formatCompactNumber(totalSales)}</div>
                                <div className="kpi-lbl">{t.totalRevenue}</div>
                            </Link>
                            <Link href="/dashboard/invoices" className="kpi-card k3" style={{ animationDelay: ".18s", cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}>
                                <div className="kpi-top"><div className="kpi-ico" style={{ background: "rgba(14,165,233,0.1)" }}>🧾</div><div className="kpi-trend trend-up">All</div></div>
                                <div className="kpi-val" style={{ color: "var(--teal)" }}>{formatCompactNumber(invoiceCount)}</div>
                                <div className="kpi-lbl">{t.totalInvoices}</div>
                            </Link>
                        </>
                    )}
                    {businessProfile?.modules?.inventory !== false && (
                        <Link href="/dashboard/inventory" className="kpi-card k4" style={{ animationDelay: ".22s", cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}>
                            <div className="kpi-top"><div className="kpi-ico" style={{ background: "rgba(239,68,68,0.1)" }}>⚠️</div>{lowStockItems > 0 ? <div className="kpi-trend trend-down">Act</div> : <div className="kpi-trend trend-up">OK</div>}</div>
                            <div className="kpi-val" style={{ color: "var(--red)" }}>{lowStockItems}</div>
                            <div className="kpi-lbl">{t.lowStock}</div>
                        </Link>
                    )}
                </div>

                {businessProfile?.modules?.invoicing !== false && (
                <div className="main-grid">
                    <div className="card" style={{ animationDelay: ".2s" }}>
                        <div className="card-hdr">
                            <div>
                                <div className="card-title">{t.recentInvoices}</div>
                                <div className="card-sub">{t.latestBillingActivity || 'Latest billing activity'}</div>
                            </div>
                            <Link href="/dashboard/invoices" className="see-all" style={{ textDecoration: "none" }}>{t.viewAll} →</Link>
                        </div>
                        <div>
                            {recentInvoices.map((inv: any, idx: number) => {
                                const statusColor = inv.status === 'PAID' ? 'var(--green)' : inv.status === 'PARTIAL' ? 'var(--amber)' : '#4f46e5';
                                const sClass = inv.status === 'PAID' ? 's-paid' : inv.status === 'PARTIAL' ? 's-partial' : 's-unpaid';
                                return (
                                    <Link href="/dashboard/invoices" className="inv-row" key={inv.id} style={{ textDecoration: "none", color: "inherit", display: "flex" }}>
                                        <div className="inv-av" style={{ background: statusColor }}>{(inv.customer?.name || 'U')[0]}</div>
                                        <div className="inv-info">
                                            <div className="inv-name">{inv.customer?.name || 'Unknown'}</div>
                                            <div className="inv-meta">{inv.invoice_number} · {new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                        </div>
                                        <div className="inv-right">
                                            <div className="inv-amt">₹{parseFloat(inv.total_amount).toLocaleString('en-IN')}</div>
                                            <div className={`inv-status ${sClass}`}>{inv.status}</div>
                                        </div>

                                        <span style={{ fontSize: "14px", cursor: "pointer", marginLeft: "6px" }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSendReminder(inv.customer || inv); }}>💬</span>
                                    </Link>
                                );
                            })}
                            {recentInvoices.length === 0 && <div className="text-center text-xs p-4 text-slate-400 font-bold">{t.noInvoices}</div>}
                        </div>
                        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--faint)" }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: ".7px" }}>{t.revenueThisWeek || 'Revenue This Week'}</div>
                            <canvas ref={miniChartRef} style={{ maxHeight: "90px" }}></canvas>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        <div className="card" style={{ animationDelay: ".25s" }}>
                            <div className="card-hdr">
                                <div>
                                    <div className="card-title">💚 {t.collectionCenter || 'Collection Center'}</div>
                                    <div className="card-sub">{t.managePendingPayments || 'Manage pending payments'}</div>
                                </div>
                                <Link href="/dashboard/customers" className="see-all" style={{ textDecoration: "none" }}>{pendingCustomersList.length} →</Link>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--faint)", border: "1.5px solid var(--border)", borderRadius: "10px", padding: "9px 12px" }}>
                                    <span style={{ color: "var(--muted)" }}>🔍</span>
                                    <input type="text" placeholder={t.searchParty} value={collectionSearch} onChange={(e) => setCollectionSearch(e.target.value)} style={{ border: "none", outline: "none", fontFamily: "'Sora',sans-serif", fontSize: "13px", background: "transparent", flex: 1, color: "var(--ink)" }} />
                                </div>
                            </div>
                            <div className="coll-grid">
                                {pendingCustomersList.slice(0, 4).map((c: any, i: number) => (
                                    <Link href={'/dashboard/customers/' + c.id} className="coll-card" key={c.id} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                                        <div className="coll-top">
                                            <div className="coll-num">{i + 1}</div>
                                            <div className="coll-bills">{c.invoiceCount} {t.bills}</div>
                                        </div>
                                        <div className="coll-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                                        <div className="coll-last">{t.lastInvoice}: {new Date(c.lastInvoiceDate).toLocaleDateString()}</div>
                                        <div className="coll-amt">{formatCompactNumber(c.totalPending)}</div>
                                        <div className="coll-bottom">
                                            <button className="wa-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSendReminder(c); }}>💬</button>
                                            <input type="checkbox" className="select-box" checked={selectedCustomers.includes(c.id)} onChange={(e) => {
                                                e.stopPropagation();
                                                setSelectedCustomers(prev => e.target.checked ? [...prev, c.id] : prev.filter(id => id !== c.id));
                                            }} onClick={(e) => e.stopPropagation()} />
                                        </div>
                                    </Link>
                                ))}
                                {pendingCustomersList.length === 0 && <div className="text-center text-xs p-4 text-slate-400 font-bold" style={{ gridColumn: '1 / -1' }}>{t.noPendingCollections}</div>}
                            </div>
                            <div className="action-bar">
                                <button className="action-bar-btn btn-remind" onClick={() => handleBulkReminder(pendingCustomersList)}>💬 {t.remindAll}</button>
                                <button className="action-bar-btn btn-due" onClick={() => toast.success(`${t.totalDueLabel}: ` + formatLakhs(totalOverallPending))}>₹ {t.totalDueLabel}</button>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {businessProfile?.modules?.inventory !== false && (
                <div className="card" style={{ animationDelay: ".3s", marginBottom: "0", marginTop: businessProfile?.modules?.invoicing !== false ? "0" : "20px" }}>
                    <div className="card-hdr">
                        <div>
                            <div className="card-title">🏆 {t.topSellingProducts}</div>
                            <div className="card-sub">{t.bestSellersThisMonth || 'Your best sellers this month'}</div>
                        </div>
                        <Link href="/dashboard/inventory" className="see-all" style={{ textDecoration: "none" }}>{t.viewAllProducts} {topProducts.length} →</Link>
                    </div>
                    <div className="prod-grid">
                        {topProducts.slice(0, 6).map((p: any, i: number) => {
                            const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
                            const badge = i === 0 ? t.bestSeller : t.topProduct;
                            const bc = i === 0 ? 'badge-best' : 'badge-top';
                            return (
                                <Link href="/dashboard/inventory" className="prod-card" key={i} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                                    <div className={`prod-rank ${rankClass}`}>{i + 1}</div>
                                    <span className={`prod-badge ${bc}`}>{badge}</span>
                                    <div className="prod-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                    <div className="prod-sold">{Math.round(p.quantity)} SOLD</div>
                                    <div className="prod-amt">{formatLakhs(p.sales)}</div>
                                </Link>
                            );
                        })}
                        {topProducts.length === 0 && <div className="text-center text-xs p-4 text-slate-400 font-bold" style={{ gridColumn: '1 / -1' }}>{t.noProductsSold || 'No Products Sold'}</div>}
                    </div>
                </div>
                )}

                {businessProfile?.modules?.invoicing !== false && (
                <div className="bottom-grid">
                    <Link href="/dashboard/store" style={{ animation: "fadeUp .5s .35s ease both", cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}>
                        <div className="store-card">
                            <div className="store-icon">🌐</div>
                            <div className="store-info" style={{ flex: 1 }}>
                                <div className="store-title">{t.yourOnlineStore}</div>
                                <div className="store-sub">{t.manageAndShareOnlineStore}</div>
                                <div className="store-btns">
                                    <button className="store-btn btn-open" onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/dashboard/store') }}>⚙️ {t.manage}</button>
                                    <button className="store-btn btn-share" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShareStore() }}>📤 {t.share}</button>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <div className="gst-quick" style={{ animation: "fadeUp .5s .4s ease both" }}>
                        <div className="card-hdr">
                            <div>
                                <div className="card-title">🏛️ {t.gstQuickSummary}</div>
                                <div className="card-sub">{t.currentPeriod}</div>
                            </div>
                            <Link href="/dashboard/gst-returns" className="see-all" style={{ textDecoration: "none" }}>{t.file} →</Link>
                        </div>
                        <div className="gst-row"><span className="gst-key">{t.taxableAmount}</span><span className="gst-val">{formatLakhs(totalSales - (totalSales * 0.18))}</span></div>
                        <div className="gst-row"><span className="gst-key">{t.totalTax}</span><span className="gst-val">{formatLakhs(totalSales * 0.18)}</span></div>
                        <div className="gst-row"><span className="gst-key">{t.dueDateLabel}</span><span className="gst-val" style={{ color: "var(--red)" }}>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                        <div className="gst-row"><span className="gst-key">{t.status}</span><span className="gst-val" style={{ color: "var(--amber)" }}>{t.pendingStatus}</span></div>
                    </div>
                </div>
                )}

                <div style={{ marginTop: "20px" }}>
                    <Link href="/dashboard/referral" className="store-card" style={{ background: "linear-gradient(135deg, #10b981, #059669)", cursor: "pointer", animation: "fadeUp .5s .45s ease both", display: "flex", textDecoration: "none", color: "inherit" }}>
                        <div className="store-icon" style={{ background: "rgba(255,255,255,0.2)" }}>🎁</div>
                        <div className="store-info" style={{ flex: 1 }}>
                            <div className="store-title">{t.referEarnTitle}</div>
                            <div className="store-sub">{t.referEarnSubtitle}</div>
                        </div>
                        <span className="see-all" style={{ color: "#fff", background: "rgba(0,0,0,0.15)", padding: "8px 14px", borderRadius: "8px", textDecoration: "none" }}>{t.referNow}</span>
                    </Link>
                </div>


                <div className="footer-dark">
                    <div className="footer-dark-text">
                        <p className="t">billgst.in</p>
                        <p className="s">Invoice, hisaab, GST — sab kuch ek jagah</p>
                    </div>
                    <div className="social-dark-row">
                        <a className="social-dark-btn" href="https://www.instagram.com/billgst_app?utm_source=qr&igsh=bzJrMGphemNpa2dm" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <svg viewBox="0 0 24 24"><path d="M12 2c2.7 0 3 .01 4.1.06 1.1.05 1.8.22 2.4.46.66.26 1.2.6 1.75 1.14.5.5.85 1.08 1.14 1.75.24.6.4 1.3.46 2.4.05 1.1.06 1.4.06 4.1s-.01 3-.06 4.1c-.05 1.1-.22 1.8-.46 2.4-.26.66-.6 1.2-1.14 1.75-.5.5-1.08.85-1.75 1.14-.6.24-1.3.4-2.4.46-1.1.05-1.4.06-4.1.06s-3-.01-4.1-.06c-1.1-.05-1.8-.22-2.4-.46a4.9 4.9 0 0 1-1.75-1.14 4.9 4.9 0 0 1-1.14-1.75c-.24-.6-.4-1.3-.46-2.4C2.01 15 2 14.7 2 12s.01-3 .06-4.1c.05-1.1.22-1.8.46-2.4.26-.66.6-1.2 1.14-1.75A4.9 4.9 0 0 1 5.4 2.6c.6-.24 1.3-.4 2.4-.46C8.9 2.06 9.2 2.05 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm5.2-2.7a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z"/></svg>
                        </a>
                        <a className="social-dark-btn" href="https://www.youtube.com/@billgstapp" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <svg viewBox="0 0 24 24"><path d="M23 12s0-3.4-.44-5c-.24-.9-1-1.6-1.9-1.84C18.9 4.7 12 4.7 12 4.7s-6.9 0-8.66.46c-.9.24-1.66.95-1.9 1.84C1 8.6 1 12 1 12s0 3.4.44 5c.24.9 1 1.6 1.9 1.84C5.1 19.3 12 19.3 12 19.3s6.9 0 8.66-.46c.9-.24 1.66-.95 1.9-1.84.44-1.6.44-5 .44-5ZM9.8 15.3V8.7L15.8 12l-6 3.3Z"/></svg>
                        </a>
                        <a className="social-dark-btn" href="https://www.facebook.com/share/1GrM77Pp4c/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <svg viewBox="0 0 24 24"><path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93V8.56c0-.86.24-1.44 1.47-1.44h1.57V4.48C16.24 4.4 15.32 4.32 14.25 4.32c-2.24 0-3.77 1.37-3.77 3.87v2.24H7.9v2.96h2.58V21h3.02Z"/></svg>
                        </a>
                        <a className="social-dark-btn" href="https://wa.me/917498571873" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                            <svg viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.15-1.75-.86-2-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.63.07-.3-.15-1.24-.46-2.37-1.46-.87-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.5.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.9-2.18-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.5.07-.77.37-.26.3-1 1-1 2.4s1.03 2.78 1.17 2.98c.15.2 2.02 3.1 4.9 4.34.68.3 1.22.47 1.63.6.68.22 1.3.19 1.8.12.55-.08 1.75-.72 2-1.4.24-.7.24-1.3.17-1.42-.07-.13-.27-.2-.57-.36ZM12.02 2C6.5 2 2 6.5 2 12c0 1.85.5 3.58 1.4 5.06L2 22l5.1-1.34A9.94 9.94 0 0 0 12.02 22C17.5 22 22 17.5 22 12S17.5 2 12.02 2Zm0 18.1a8.06 8.06 0 0 1-4.13-1.13l-.3-.18-3.03.8.8-2.95-.2-.3A8.07 8.07 0 1 1 12.02 20.1Z"/></svg>
                        </a>
                    </div>
                </div>

                <button className="support-btn" onClick={() => router.push('/dashboard/help')}>👥 {t.supportHelp}</button>
            </div>

            <FreePlanPopup />
            <RegistrationPopup />
        </div>
    );
}
