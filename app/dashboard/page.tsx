"use client";

import { FaFileInvoice, FaRupeeSign, FaUsers, FaBox, FaChartLine, FaClock, FaReceipt, FaUserPlus, FaBoxOpen, FaTimes, FaStore, FaCog, FaShareAlt, FaGlobe, FaBrain, FaBolt, FaWhatsapp, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { translations } from '@/lib/translations';
import { formatCurrency, formatCompactNumber } from '@/lib/utils';
import FreePlanPopup from './FreePlanPopup';
import RegistrationPopup from './RegistrationPopup';
import Chart from 'chart.js/auto';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const {
        invoices, customers, products, businessProfile, settings,
        getAnalytics, getTopProducts,
        fetchCustomers, fetchProducts, fetchInvoices, fetchBusinessProfile
    } = useStore() as any;
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

    const router = useRouter();
    const miniChartRef = useRef<HTMLCanvasElement>(null);
    const t = translations[settings.language as keyof typeof translations] || translations.en;

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
            toast.error('Customer phone number missing!');
            return;
        }
        const whatsappUrl = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
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

                if (phone) {
                    const whatsappUrl = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                }
            }, index * 3000);
        });
    };

    const fetchAutoReminders = async () => {
        if (!businessProfile.id) return;
        setIsRefreshingReminders(true);
        try {
            const res = await fetch(`/api/public/whatsapp/reminders?secret=admin_debug_123`);
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
        const bannerDismissed = localStorage.getItem('setupBannerDismissed');
        if (bannerDismissed) setShowSetupBanner(false);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchCustomers();
        fetchProducts();
        fetchInvoices();
        fetchBusinessProfile();
        fetchAutoReminders();
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (businessProfile.id) {
            fetchAutoReminders();
        }
    }, [businessProfile.id]);

    useEffect(() => {
        if (!isClient || !miniChartRef.current) return;
        const chart = new Chart(miniChartRef.current, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    data: [32000, 58000, 45000, 71000, 63000, 88000, 47250],
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
                    y: { display: false }
                }
            }
        });
        return () => chart.destroy();
    }, [isClient]);

    if (!isClient) return null;

    const { totalSales, totalProfit, invoiceCount } = getAnalytics(period, customRange);
    const topProducts = getTopProducts() || [];
    const lowStockItems = (products || []).filter((p: any) => p.stock_quantity < (p.low_stock_alert || 10)).length;

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const today = new Date().toDateString();
    const todaySales = invoices
        .filter((inv: any) => new Date(inv.invoice_date).toDateString() === today)
        .reduce((acc: number, inv: any) => acc + (parseFloat(inv.total_amount) || 0), 0);

    const pendingInvoices = (invoices || []).filter((inv: any) => inv.status !== 'PAID');
    const pendingByCustomer = pendingInvoices.reduce((acc: any, inv: any) => {
        const id = inv.customer_id || inv.customer?.id;
        const custObj = customers.find((c: any) => c.id === id);
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

    const recentInvoices = invoices.slice(0, 5);

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
.greeting-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.greeting-time { font-size: 11.5px; font-weight: 600; color: var(--muted); display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.greeting-h1 { font-size: 18px; font-weight: 800; color: var(--ink); letter-spacing: -.5px; }
.greeting-h1 span { background: linear-gradient(135deg, var(--indigo), var(--indigo2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.greeting-right { display: flex; gap: 8px; }
.search-box { display: flex; align-items: center; gap: 8px; background: var(--white); border: 1.5px solid var(--border); border-radius: 12px; padding: 10px 16px; box-shadow: var(--shadow); min-width: 220px; transition: all .2s; }
.search-box:focus-within { border-color: var(--indigo); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
.search-box input { border: none; outline: none; font-family: 'Sora', sans-serif; font-size: 13px; color: var(--ink); background: transparent; flex: 1; font-weight: 500; }
.search-box input::placeholder { color: #c0c8da; font-weight: 400; }

.qa-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 24px; }
.qa-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 18px 10px; border-radius: 16px; cursor: pointer; transition: all .25s; border: none; text-decoration: none; animation: fadeUp .4s ease both; }
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
.inv-av { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #fff; flex-shrink: 0; }
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
.coll-card { background: var(--faint); border: 1.5px solid var(--border); border-radius: 13px; padding: 12px; cursor: pointer; transition: all .2s; }
.coll-card:hover { border-color: var(--indigo); background: #fff; transform: translateY(-1px); box-shadow: var(--shadow); }
.coll-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.coll-num { width: 24px; height: 24px; background: var(--slate); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; }
.coll-bills { font-size: 10.5px; font-weight: 700; color: var(--teal); }
.coll-name { font-size: 13px; font-weight: 800; color: var(--ink); margin-bottom: 2px; }
.coll-last { font-size: 10.5px; color: var(--muted); font-weight: 400; }
.coll-amt { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: var(--red); margin-top: 4px; }
.coll-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
.wa-btn { width: 28px; height: 28px; background: rgba(16,185,129,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; transition: all .2s; border: none; }
.wa-btn:hover { background: rgba(16,185,129,0.25); }
.select-box { width: 20px; height: 20px; border: 2px solid var(--border); border-radius: 6px; cursor: pointer; transition: all .2s; background: var(--white); }

.action-bar { display: flex; gap: 10px; margin-bottom: 16px; }
.action-bar-btn { flex: 1; padding: 12px; border-radius: 12px; border: none; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: all .2s; }
.btn-remind { background: linear-gradient(135deg, #059669, #10b981); color: #fff; box-shadow: 0 4px 14px rgba(16,185,129,0.35); }
.btn-due { background: linear-gradient(135deg, #1d4ed8, #4f46e5); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,0.35); }
.action-bar-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }

.prod-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.prod-card { background: var(--faint); border: 1.5px solid var(--border); border-radius: 13px; padding: 12px; position: relative; cursor: pointer; transition: all .2s; }
.prod-card:hover { border-color: var(--amber); background: #fff; transform: translateY(-2px); box-shadow: var(--shadow); }
.prod-rank { width: 24px; height: 24px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; margin-bottom: 6px; }
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

.support-btn { width: 100%; margin-top: 20px; padding: 16px; background: linear-gradient(135deg, var(--indigo), var(--indigo2)); color: #fff; border: none; border-radius: 14px; font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 6px 20px rgba(79,70,229,0.35); transition: all .2s; }
.support-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(79,70,229,0.45); }

@media(max-width:1024px) { .qa-grid { grid-template-columns: repeat(3, 1fr); } .kpi-strip { grid-template-columns: repeat(2, 1fr); } .main-grid { grid-template-columns: 1fr; } .bottom-grid { grid-template-columns: 1fr; } }
@media(max-width:768px) { .qa-grid { grid-template-columns: repeat(3, 1fr); } .content { padding: 16px; } .prod-grid { grid-template-columns: 1fr 1fr; } .coll-grid { grid-template-columns: 1fr; } }
          `}} />

            <div className="content">
                <div className="greeting-row">
                    <div>
                        <div className="greeting-h1">{getGreeting()}, <span>{businessProfile.name || 'Business'}</span>! 👋</div>
                    </div>
                    <div className="search-box">
                        <span style={{ fontSize: "15px", color: "#c0c8da" }}>🔍</span>
                        <input type="text" placeholder="Quick Search…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="qa-grid">
                    <Link href="/dashboard/invoices/new" className="qa-card c1" style={{ animationDelay: ".05s" }}><span className="qa-icon">🧾</span><span className="qa-label">New Invoice</span></Link>
                    <Link href="/dashboard/customers" className="qa-card c2" style={{ animationDelay: ".08s" }}><span className="qa-icon">👤</span><span className="qa-label">Add Customer</span></Link>
                    <Link href="/dashboard/inventory" className="qa-card c3" style={{ animationDelay: ".11s" }}><span className="qa-icon">📦</span><span className="qa-label">Add Product</span></Link>
                    <Link href="/dashboard/reports" className="qa-card c4" style={{ animationDelay: ".14s" }}><span className="qa-icon">📊</span><span className="qa-label">View Reports</span></Link>
                    <Link href="/dashboard/quotations" className="qa-card c5" style={{ animationDelay: ".17s" }}><span className="qa-icon">📋</span><span className="qa-label">Quotations</span></Link>
                    <Link href="/dashboard/expenses" className="qa-card c6" style={{ animationDelay: ".2s" }}><span className="qa-icon">💸</span><span className="qa-label">Expenses</span></Link>
                </div>

                <div className="period-row">
                    <div>
                        <div className="section-title">Business Overview</div>
                        <div className="section-sub">Real-time performance metrics</div>
                    </div>
                    <div className="period-tabs">
                        <div className={`ptab ${period === 'daily' ? 'active' : ''}`} onClick={() => setPeriod('daily')}>Daily</div>
                        <div className={`ptab ${period === 'weekly' ? 'active' : ''}`} onClick={() => setPeriod('weekly')}>Weekly</div>
                        <div className={`ptab ${period === 'monthly' ? 'active' : ''}`} onClick={() => setPeriod('monthly')}>Monthly</div>
                        <div className={`ptab ${period === 'yearly' ? 'active' : ''}`} onClick={() => setPeriod('yearly')}>Yearly</div>
                        <div className={`ptab ${period === 'custom' ? 'active' : ''}`} onClick={() => setPeriod('custom')}>Custom</div>
                    </div>
                </div>

                <div className="kpi-strip">
                    <div className="kpi-card k1" style={{ animationDelay: ".1s", cursor: "pointer" }} onClick={() => router.push('/dashboard/reports?period=daily')}>
                        <div className="kpi-top"><div className="kpi-ico" style={{ background: "rgba(79,70,229,0.1)" }}>💰</div><div className="kpi-trend trend-up">Now</div></div>
                        <div className="kpi-val" style={{ color: "var(--indigo)" }}>{formatCompactNumber(todaySales)}</div>
                        <div className="kpi-lbl">Today's Sales</div>
                    </div>
                    <div className="kpi-card k2" style={{ animationDelay: ".14s", cursor: "pointer" }} onClick={() => router.push('/dashboard/reports')}>
                        <div className="kpi-top"><div className="kpi-ico" style={{ background: "rgba(16,185,129,0.1)" }}>📈</div><div className="kpi-trend trend-up">Total</div></div>
                        <div className="kpi-val" style={{ color: "var(--green)" }}>{formatCompactNumber(totalSales)}</div>
                        <div className="kpi-lbl">Total Revenue</div>
                    </div>
                    <div className="kpi-card k3" style={{ animationDelay: ".18s", cursor: "pointer" }} onClick={() => router.push('/dashboard/invoices')}>
                        <div className="kpi-top"><div className="kpi-ico" style={{ background: "rgba(14,165,233,0.1)" }}>🧾</div><div className="kpi-trend trend-up">All</div></div>
                        <div className="kpi-val" style={{ color: "var(--teal)" }}>{formatCompactNumber(invoiceCount)}</div>
                        <div className="kpi-lbl">Total Invoices</div>
                    </div>
                    <div className="kpi-card k4" style={{ animationDelay: ".22s", cursor: "pointer" }} onClick={() => router.push('/dashboard/inventory')}>
                        <div className="kpi-top"><div className="kpi-ico" style={{ background: "rgba(239,68,68,0.1)" }}>⚠️</div>{lowStockItems > 0 ? <div className="kpi-trend trend-down">Act</div> : <div className="kpi-trend trend-up">OK</div>}</div>
                        <div className="kpi-val" style={{ color: "var(--red)" }}>{lowStockItems}</div>
                        <div className="kpi-lbl">Low Stock Items</div>
                    </div>
                </div>

                <div className="main-grid">
                    <div className="card" style={{ animationDelay: ".2s" }}>
                        <div className="card-hdr">
                            <div>
                                <div className="card-title">Recent Invoices</div>
                                <div className="card-sub">Latest billing activity</div>
                            </div>
                            <span className="see-all" onClick={() => router.push('/dashboard/invoices')}>View All →</span>
                        </div>
                        <div>
                            {recentInvoices.map((inv: any, idx: number) => {
                                const statusColor = inv.status === 'PAID' ? 'var(--green)' : inv.status === 'PARTIAL' ? 'var(--amber)' : '#4f46e5';
                                const sClass = inv.status === 'PAID' ? 's-paid' : inv.status === 'PARTIAL' ? 's-partial' : 's-unpaid';
                                return (
                                    <div className="inv-row" key={inv.id} onClick={() => router.push('/dashboard/invoices')}>
                                        <div className="inv-av" style={{ background: statusColor }}>{(inv.customer?.name || 'U')[0]}</div>
                                        <div className="inv-info">
                                            <div className="inv-name">{inv.customer?.name || 'Unknown'}</div>
                                            <div className="inv-meta">{inv.invoice_number} · {new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                                        </div>
                                        <div className="inv-right">
                                            <div className="inv-amt">₹{parseFloat(inv.total_amount).toLocaleString('en-IN')}</div>
                                            <div className={`inv-status ${sClass}`}>{inv.status}</div>
                                        </div>
                                        <span style={{ fontSize: "14px", cursor: "pointer", marginLeft: "6px" }} onClick={(e) => { e.stopPropagation(); handleSendReminder(inv.customer || inv); }}>💬</span>
                                    </div>
                                );
                            })}
                            {recentInvoices.length === 0 && <div className="text-center text-xs p-4 text-slate-400 font-bold">No Invoices</div>}
                        </div>
                        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--faint)" }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: ".7px" }}>Revenue This Week</div>
                            <canvas ref={miniChartRef} style={{ maxHeight: "90px" }}></canvas>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        <div className="card" style={{ animationDelay: ".25s" }}>
                            <div className="card-hdr">
                                <div>
                                    <div className="card-title">💚 Collection Center</div>
                                    <div className="card-sub">Manage pending payments</div>
                                </div>
                                <span className="see-all" onClick={() => router.push('/dashboard/customers')}>{pendingCustomersList.length} →</span>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--faint)", border: "1.5px solid var(--border)", borderRadius: "10px", padding: "9px 12px" }}>
                                    <span style={{ color: "var(--muted)" }}>🔍</span>
                                    <input type="text" placeholder="Search party…" value={collectionSearch} onChange={(e) => setCollectionSearch(e.target.value)} style={{ border: "none", outline: "none", fontFamily: "'Sora',sans-serif", fontSize: "13px", background: "transparent", flex: 1, color: "var(--ink)" }} />
                                </div>
                            </div>
                            <div className="coll-grid">
                                {pendingCustomersList.slice(0, 4).map((c: any, i: number) => (
                                    <div className="coll-card" key={c.id} onClick={() => router.push('/dashboard/customers/' + c.id)}>
                                        <div className="coll-top">
                                            <div className="coll-num">{i + 1}</div>
                                            <div className="coll-bills">{c.invoiceCount} BILLS</div>
                                        </div>
                                        <div className="coll-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                                        <div className="coll-last">Last: {new Date(c.lastInvoiceDate).toLocaleDateString()}</div>
                                        <div className="coll-amt">{formatCompactNumber(c.totalPending)}</div>
                                        <div className="coll-bottom">
                                            <button className="wa-btn" onClick={(e) => { e.stopPropagation(); handleSendReminder(c); }}>💬</button>
                                            <input type="checkbox" className="select-box" checked={selectedCustomers.includes(c.id)} onChange={(e) => {
                                                e.stopPropagation();
                                                setSelectedCustomers(prev => e.target.checked ? [...prev, c.id] : prev.filter(id => id !== c.id));
                                            }} onClick={(e) => e.stopPropagation()} />
                                        </div>
                                    </div>
                                ))}
                                {pendingCustomersList.length === 0 && <div className="text-center text-xs p-4 text-slate-400 font-bold" style={{ gridColumn: '1 / -1' }}>No Pending Collections</div>}
                            </div>
                            <div className="action-bar">
                                <button className="action-bar-btn btn-remind" onClick={() => handleBulkReminder(pendingCustomersList)}>💬 Remind All</button>
                                <button className="action-bar-btn btn-due" onClick={() => toast.success('Total due: ' + formatLakhs(totalOverallPending))}>₹ Total Due</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ animationDelay: ".3s", marginBottom: "0" }}>
                    <div className="card-hdr">
                        <div>
                            <div className="card-title">🏆 Top Selling Products</div>
                            <div className="card-sub">Your best sellers this month</div>
                        </div>
                        <span className="see-all" onClick={() => router.push('/dashboard/inventory')}>View All {topProducts.length} →</span>
                    </div>
                    <div className="prod-grid">
                        {topProducts.slice(0, 6).map((p: any, i: number) => {
                            const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
                            const badge = i === 0 ? 'BEST SELLER' : 'TOP PRODUCT';
                            const bc = i === 0 ? 'badge-best' : 'badge-top';
                            return (
                                <div className="prod-card" key={i} onClick={() => router.push('/dashboard/inventory')}>
                                    <div className={`prod-rank ${rankClass}`}>{i + 1}</div>
                                    <span className={`prod-badge ${bc}`}>{badge}</span>
                                    <div className="prod-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                    <div className="prod-sold">{Math.round(p.quantity)} SOLD</div>
                                    <div className="prod-amt">{formatLakhs(p.sales)}</div>
                                </div>
                            );
                        })}
                        {topProducts.length === 0 && <div className="text-center text-xs p-4 text-slate-400 font-bold" style={{ gridColumn: '1 / -1' }}>No Products Sold</div>}
                    </div>
                </div>

                <div className="bottom-grid">
                    <div style={{ animation: "fadeUp .5s .35s ease both", cursor: "pointer" }} onClick={() => router.push('/dashboard/store')}>
                        <div className="store-card">
                            <div className="store-icon">🌐</div>
                            <div className="store-info" style={{ flex: 1 }}>
                                <div className="store-title">Your Online Store</div>
                                <div className="store-sub">Manage and share online store</div>
                                <div className="store-btns">
                                    <button className="store-btn btn-open" onClick={(e) => { e.stopPropagation(); router.push('/dashboard/store') }}>⚙️ Manage</button>
                                    <button className="store-btn btn-share" onClick={(e) => { e.stopPropagation(); handleShareStore() }}>📤 Share</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="gst-quick" style={{ animation: "fadeUp .5s .4s ease both" }}>
                        <div className="card-hdr">
                            <div>
                                <div className="card-title">🏛️ GST Quick Summary</div>
                                <div className="card-sub">Current period</div>
                            </div>
                            <span className="see-all" onClick={() => router.push('/dashboard/gst-returns')}>File →</span>
                        </div>
                        <div className="gst-row"><span className="gst-key">Taxable Amount</span><span className="gst-val">{formatLakhs(totalSales - (totalSales * 0.18))}</span></div>
                        <div className="gst-row"><span className="gst-key">Total Tax</span><span className="gst-val">{formatLakhs(totalSales * 0.18)}</span></div>
                        <div className="gst-row"><span className="gst-key">Due Date</span><span className="gst-val" style={{ color: "var(--red)" }}>20 Mar 2026</span></div>
                        <div className="gst-row"><span className="gst-key">Status</span><span className="gst-val" style={{ color: "var(--amber)" }}>⏳ Pending</span></div>
                    </div>
                </div>

                <button className="support-btn" onClick={() => router.push('/dashboard/help')}>👥 Support — Help chahiye? Contact karo</button>
            </div>

            <FreePlanPopup />
            <RegistrationPopup />
        </div>
    );
}
