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
    const t = translations[settings?.language as keyof typeof translations] || translations.en;

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
        try {
            const bannerDismissed = localStorage.getItem('setupBannerDismissed');
            if (bannerDismissed) setShowSetupBanner(false);
        } catch (e) { /* ignore */ }
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

/* Follow Us Section */
.follow-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px; }
.f-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 8px 6px; border-radius: 8px; text-decoration: none; border: 0.5px solid rgba(255,255,255,0.09); transition: transform 0.18s ease; text-align: center; }
.f-card:hover { transform: translateY(-2px); }
.f-card.card-wide { grid-column: 1 / -1; flex-direction: row; justify-content: flex-start; gap: 8px; padding: 8px 10px; text-align: left; }
.fc-ig { background: linear-gradient(135deg,#6a11cb,#c0392b,#f7971e); box-shadow: 0 2px 10px rgba(192,57,43,0.15); animation: fadeUp .5s .5s ease both; }
.fc-fb { background: linear-gradient(135deg,#1565c0,#1976d2,#42a5f5); box-shadow: 0 2px 10px rgba(21,101,192,0.15); animation: fadeUp .5s .55s ease both; }
.fc-yt { background: linear-gradient(135deg,#7b0000,#c62828,#f44336); box-shadow: 0 2px 10px rgba(198,40,40,0.15); animation: fadeUp .5s .6s ease both; }
.fc-wa { background: linear-gradient(135deg,#1b5e20,#2e7d32,#43a047); box-shadow: 0 2px 10px rgba(46,125,50,0.15); animation: fadeUp .5s .65s ease both; }
.fc-web { background: linear-gradient(135deg,#0f1260,#1e28c8,#4a55e8); box-shadow: 0 2px 10px rgba(74,85,232,0.15); animation: fadeUp .5s .7s ease both; }
.fc-icon { width: 22px; height: 22px; flex-shrink: 0; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.fc-icon svg { width: 11px; height: 11px; fill: #fff; }
.fc-label { font-size: 9px; font-weight: 800; color: #fff; line-height: 1.1; letter-spacing: -0.2px; }
.fc-sub { font-size: 7.5px; color: rgba(255,255,255,0.8); line-height: 1.3; margin-top: 1px; font-weight: 500; }
.fc-arrow { width: 16px; height: 16px; flex-shrink: 0; background: rgba(255,255,255,0.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform 0.15s; }
.f-card:hover .fc-arrow { transform: translateX(2px); background: rgba(255,255,255,0.22); }
.fc-arrow svg { width: 8px; height: 8px; stroke: #fff; }

@media(max-width:1024px) { 
  .qa-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; } 
  .kpi-strip { grid-template-columns: repeat(2, 1fr); gap: 10px; } 
  .main-grid { grid-template-columns: 1fr; gap: 16px; } 
  .bottom-grid { grid-template-columns: 1fr; } 
}
@media(max-width:768px) { 
  .greeting-row { margin-bottom: 16px; }
  .content { padding: 12px 14px 40px; } 
  .prod-grid { grid-template-columns: 1fr 1fr; } 
  .coll-grid { grid-template-columns: 1fr; } 
  .qa-card { padding: 12px 6px; }
  .qa-card .qa-icon { font-size: 20px; }
  .qa-card .qa-label { font-size: 10px; }
  .kpi-card { padding: 14px 12px; }
  .kpi-val { font-size: 18px; }
  .inv-row:hover { margin: 0; padding: 10px 0; }
  .inv-name { font-size: 12px; }
  .inv-amt { font-size: 12px; }
}
@media(max-width:480px) {
  .qa-grid { grid-template-columns: repeat(3, 1fr); }
  .kpi-strip { grid-template-columns: repeat(2, 1fr); }
  .kpi-ico { width: 32px; height: 32px; font-size: 15px; }
}
          `}} />

            <div className="content">
                <div className="greeting-row">
                    <h1 className="greeting-h1">
                        {getGreeting()}, <span>{businessProfile.name || 'Business'}</span>! 👋
                    </h1>
                    <div className="greeting-right">
                        <div className="time-badge">
                            <span className="dot"></span>
                            <span suppressHydrationWarning>
                                {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {' '}
                                {currentTime.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                        </div>
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

                <div style={{ marginTop: "20px" }}>
                    <div className="store-card" style={{ background: "linear-gradient(135deg, #10b981, #059669)", cursor: "pointer", animation: "fadeUp .5s .45s ease both" }} onClick={() => router.push('/dashboard/referral')}>
                        <div className="store-icon" style={{ background: "rgba(255,255,255,0.2)" }}>🎁</div>
                        <div className="store-info" style={{ flex: 1 }}>
                            <div className="store-title">Refer & Earn — Get 20 Free Invoices!</div>
                            <div className="store-sub">Invite your friends to BillGST and both get 20 extra invoices</div>
                        </div>
                        <span className="see-all" style={{ color: "#fff", background: "rgba(0,0,0,0.15)", padding: "8px 14px", borderRadius: "8px", textDecoration: "none" }}>Refer Now →</span>
                    </div>
                </div>

                <div className="follow-grid">
                    <a className="f-card fc-ig" href="https://www.instagram.com/billgst_app?utm_source=qr&igsh=bzJrMGphemNpa2dm" target="_blank" rel="noopener">
                        <div className="fc-icon"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></div>
                        <div className="fc-label">Instagram</div>
                        <div className="fc-sub">@billgst_app<br/>Tips & reels</div>
                    </a>

                    <a className="f-card fc-fb" href="https://www.facebook.com/share/1GrM77Pp4c/" target="_blank" rel="noopener">
                        <div className="fc-icon"><svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>
                        <div className="fc-label">Facebook</div>
                        <div className="fc-sub">BillGST Page<br/>Follow karein</div>
                    </a>

                    <a className="f-card fc-yt" href="https://www.youtube.com/@billgstapp" target="_blank" rel="noopener">
                        <div className="fc-icon"><svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>
                        <div className="fc-label">YouTube</div>
                        <div className="fc-sub">Tutorials<br/>& how-to videos</div>
                    </a>

                    <a className="f-card fc-wa" href="https://wa.me/917498571873" target="_blank" rel="noopener">
                        <div className="fc-icon"><svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.486 2 2 6.486 2 12c0 1.73.445 3.397 1.293 4.875L2.05 21.95l5.19-1.232A9.948 9.948 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18a7.951 7.951 0 01-4.063-1.117l-.289-.172-3.082.731.776-2.999-.188-.307A7.946 7.946 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg></div>
                        <div className="fc-label">WhatsApp</div>
                        <div className="fc-sub">Seedha hamare<br/>se baat karein</div>
                    </a>

                    <a className="f-card card-wide fc-web" href="https://billgst.in" target="_blank" rel="noopener">
                        <div className="fc-icon">
                            <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                                <path d="M2 12h20M12 2c-2.5 3-4 6-4 10s1.5 7 4 10M12 2c2.5 3 4 6 4 10s-1.5 7-4 10" stroke="white" strokeWidth="2"/>
                            </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif" }}>billgst.in — Free account banao abhi</div>
                            <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>Invoice, hisaab, GST — sab kuch ek jagah</div>
                        </div>
                        <div className="fc-arrow">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                    </a>
                </div>

                <button className="support-btn" onClick={() => router.push('/dashboard/help')}>👥 Support — Help chahiye? Contact karo</button>
            </div>

            <FreePlanPopup />
            <RegistrationPopup />
        </div>
    );
}
