'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { FaChartLine, FaRupeeSign, FaFileInvoice, FaUsers, FaFileDownload, FaTable, FaFileCode } from 'react-icons/fa';
import { generateTallyXML, downloadFile } from '@/lib/tally-exporter';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { toast } from 'react-hot-toast';
import { formatCompactNumber } from '@/lib/utils';
import * as XLSX from 'xlsx';

function ReportsContent() {
    const searchParams = useSearchParams();
    const { getAnalytics, fetchInvoices, invoices } = useStore();
    const [isClient, setIsClient] = useState(false);

    // Initialize period from URL or default to 'monthly'
    const [period, setPeriod] = useState('monthly');
    const [customRange, setCustomRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        setIsClient(true);
        fetchInvoices();

        // Set period from URL if available
        const p = searchParams.get('period');
        if (p) setPeriod(p);
    }, [searchParams]);

    if (!isClient) return null;

    const { totalSales, totalProfit, invoiceCount } = getAnalytics(period, customRange);

    // Dummy data for charts (in a real app, this would come from historical data)
    const chartData = [
        { name: 'Week 1', sales: totalSales * 0.2, profit: totalProfit * 0.2 },
        { name: 'Week 2', sales: totalSales * 0.3, profit: totalProfit * 0.3 },
        { name: 'Week 3', sales: totalSales * 0.4, profit: totalProfit * 0.4 },
        { name: 'Week 4', sales: totalSales * 0.1, profit: totalProfit * 0.1 },
    ];

    const stats = [
        {
            label: 'Total Revenue',
            value: formatCompactNumber(totalSales),
            icon: FaRupeeSign,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            href: '/dashboard/invoices'
        },
        {
            label: 'Net Profit',
            value: formatCompactNumber(totalProfit),
            icon: FaChartLine,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: '/dashboard/reports'
        },
        {
            label: 'Total Invoices',
            value: invoiceCount,
            icon: FaFileInvoice,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/dashboard/invoices'
        },
        {
            label: 'Avg. Order Value',
            value: formatCompactNumber(invoiceCount > 0 ? (totalSales / invoiceCount) : 0),
            icon: FaUsers,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            href: '/dashboard/invoices'
        }
    ];

    const handleDownloadExcel = () => {
        try {
            if (!invoices || invoices.length === 0) {
                toast.error('No data to export');
                return;
            }

            // Filter invoices based on period
            const now = new Date();
            let filteredInvoices = invoices;

            if (period === 'daily') {
                filteredInvoices = invoices.filter((inv: any) => new Date(inv.invoice_date).toDateString() === now.toDateString());
            } else if (period === 'monthly') {
                filteredInvoices = invoices.filter((inv: any) =>
                    new Date(inv.invoice_date).getMonth() === now.getMonth() &&
                    new Date(inv.invoice_date).getFullYear() === now.getFullYear()
                );
            } else if (period === 'weekly') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                filteredInvoices = invoices.filter((inv: any) => new Date(inv.invoice_date) >= oneWeekAgo);
            } else if (period === 'yearly') {
                filteredInvoices = invoices.filter((inv: any) => new Date(inv.invoice_date).getFullYear() === now.getFullYear());
            } else if (period === 'custom' && customRange?.start && customRange?.end) {
                const start = new Date(customRange.start);
                const end = new Date(customRange.end);
                end.setHours(23, 59, 59, 999);
                filteredInvoices = invoices.filter((inv: any) => {
                    const d = new Date(inv.invoice_date);
                    return d >= start && d <= end;
                });
            }

            if (filteredInvoices.length === 0) {
                toast.error('No invoices found for the selected period');
                return;
            }

            // Prepare data for Excel
            const excelData = filteredInvoices.map((inv: any) => ({
                'Invoice No': inv.invoice_number,
                'Date': new Date(inv.invoice_date).toLocaleDateString('en-IN'),
                'Customer Name': inv.customer?.name || 'Unknown',
                'Customer GSTIN': inv.customer?.gstin || 'N/A',
                'Taxable Amount': inv.subtotal || 0,
                'CGST': inv.cgst_amount || 0,
                'SGST': inv.sgst_amount || 0,
                'IGST': inv.igst_amount || 0,
                'Total Amount': inv.total_amount || 0,
                'Status': inv.status || 'PENDING'
            }));

            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
            XLSX.writeFile(wb, `Business_Report_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Excel report downloaded!');
        } catch (error) {
            console.error('Excel export failed:', error);
            toast.error('Failed to download Excel');
        }
    };

    // ... (rest of the component)

    return (
        <div className="space-y-8 px-4 md:px-0 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Business Reports</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Analyze and export your business data</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                    {period === 'custom' && (
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <input
                                type="date"
                                value={customRange.start}
                                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                                className="p-2 text-sm outline-none bg-transparent text-slate-700 font-bold"
                            />
                            <span className="text-slate-400 font-bold">-</span>
                            <input
                                type="date"
                                value={customRange.end}
                                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                                className="p-2 text-sm outline-none bg-transparent text-slate-700 font-bold"
                            />
                        </div>
                    )}

                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 shadow-sm min-w-[160px] cursor-pointer"
                    >
                        <option value="daily">Today</option>
                        <option value="weekly">This Week</option>
                        <option value="monthly">This Month</option>
                        <option value="yearly">This Year</option>
                        <option value="custom">Custom Date</option>
                    </select>
                </div>
            </div>

            {/* Central Download Area */}
            <div className="flex flex-col items-center justify-center py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl gap-6">
                <h3 className="text-slate-500 font-bold uppercase tracking-widest text-sm">Download Reports</h3>
                <div className="flex flex-wrap items-center justify-center gap-6">
                    <button
                        onClick={() => {
                            const { invoices } = useStore.getState();
                            const now = new Date();
                            let filteredInvoices = invoices;

                            if (period === 'daily') {
                                filteredInvoices = invoices.filter((inv: any) => new Date(inv.invoice_date).toDateString() === now.toDateString());
                            } else if (period === 'monthly') {
                                filteredInvoices = invoices.filter((inv: any) =>
                                    new Date(inv.invoice_date).getMonth() === now.getMonth() &&
                                    new Date(inv.invoice_date).getFullYear() === now.getFullYear()
                                );
                            } else if (period === 'weekly') {
                                const oneWeekAgo = new Date();
                                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                                filteredInvoices = invoices.filter((inv: any) => new Date(inv.invoice_date) >= oneWeekAgo);
                            } else if (period === 'yearly') {
                                filteredInvoices = invoices.filter((inv: any) => new Date(inv.invoice_date).getFullYear() === now.getFullYear());
                            } else if (period === 'custom' && customRange?.start && customRange?.end) {
                                const start = new Date(customRange.start);
                                const end = new Date(customRange.end);
                                end.setHours(23, 59, 59, 999);
                                filteredInvoices = invoices.filter((inv: any) => {
                                    const d = new Date(inv.invoice_date);
                                    return d >= start && d <= end;
                                });
                            }

                            if (filteredInvoices.length === 0) {
                                toast.error('No invoices found for the selected period');
                                return;
                            }

                            const xml = generateTallyXML(filteredInvoices, 'Business');
                            downloadFile(xml, `Tally_Sales_${period}.xml`, 'text/xml');
                            toast.success('Tally XML downloaded!');
                        }}
                        className="
                            flex flex-col items-center justify-center gap-3 w-40 h-20
                            bg-orange-600 text-white rounded-2xl font-black 
                            hover:bg-orange-700 hover:scale-105 transition-all duration-300
                            shadow-xl shadow-orange-500/20 border-b-8 border-orange-800
                            active:border-b-0 active:translate-y-2
                        "
                    >
                        <FaFileCode className="text-4x1" />
                        <span className="tracking-wider">TALLY XML</span>
                    </button>

                    <button
                        onClick={handleDownloadExcel}
                        className="
                            flex flex-col items-center justify-center gap-3 w-40 h-20
                            bg-emerald-600 text-white rounded-2xl font-black 
                            hover:bg-emerald-700 hover:scale-105 transition-all duration-300
                            shadow-xl shadow-emerald-500/20 border-b-8 border-emerald-800
                            active:border-b-0 active:translate-y-2
                        "
                    >
                        <FaTable className="text-4x1" />
                        <span className="tracking-wider">EXCEL</span>
                    </button>
                </div>
            </div>

            {/* Smart Audit Highlight */}
            <div className="bg-indigo-900 rounded-2xl p-4 text-white flex items-center justify-between border border-indigo-700 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                        <FaChartLine className="text-indigo-300" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest leading-none" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '10px', paddingBottom: '5px' }}>Smart Advisory</p>
                        <h4 className="text-sm font-medium mt-1">Your HSN compliance is at 92%. Add missing codes to avoid penalties.</h4>
                    </div>
                </div>
                <button className="text-[10px] font-black bg-white text-indigo-900 px-3 py-1.5 rounded-lg uppercase" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>Maximize ITC</button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Link
                            key={index}
                            href={stat.href}
                            className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-6 hover:shadow-md transition-all hover:-translate-y-1 group relative overflow-hidden active:scale-95 cursor-pointer"
                        >
                            {/* Decorative background circle to add depth */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 ${stat.bg} opacity-5 rounded-full`}></div>

                            <div className={`p-5 md:p-6 rounded-[2rem] ${stat.bg} ${stat.color} bg-opacity-10 text-opacity-100 transform group-hover:scale-110 transition-transform mb-2 shadow-inner`}>
                                <Icon className="text-3xl md:text-4xl" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                                <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mt-2">{stat.label}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '10px' }}>
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '0px' }}>
                    <h2 className="text-lg font-bold text-gray-800 mb-6" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '10px' }}>Revenue Trend</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '10px' }}>Profit vs Sales</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReportsContent />
        </Suspense>
    );
}
