"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useStore } from '@/lib/store';
import { getTranslations } from '@/lib/translations';
import { toast } from 'react-hot-toast';
import { generateTallyXML, downloadFile } from '@/lib/tally-exporter';
import * as XLSX from 'xlsx';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { drawFreeBranding } from '../../../lib/pdf-generator';

function ReportsContent() {
    const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
    const [chartView, setChartView] = useState<'revenue'|'profit'|'monthly'|null>(null);
    const revenueRef = useRef<HTMLDivElement>(null);
    const profitRef = useRef<HTMLDivElement>(null);
    const monthlyRef = useRef<HTMLDivElement>(null);
    const scrollToChart = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const searchParams = useSearchParams();
    const router = useRouter();
    const { getAnalytics, fetchInvoices, invoices, customers, settings, fetchExpenses, expenses, businessProfile } = useStore() as any;
    const [isClient, setIsClient] = useState(false);
    const [period, setPeriod] = useState('This Month');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const t = getTranslations(settings?.language ?? 'en');

    const revenueChartRef = useRef<HTMLCanvasElement>(null);
    const profitChartRef = useRef<HTMLCanvasElement>(null);
    const monthlyChartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        setIsClient(true);
        fetchInvoices();
        fetchExpenses();
    }, [fetchInvoices, fetchExpenses]);

    useEffect(() => {
        if (!isClient) return;

        const today = new Date();
        const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
        const weeklySales = [0, 0, 0, 0];
        const weeklyExpenses = [0, 0, 0, 0];

        (invoices || []).forEach((inv: any) => {
            if (!inv.invoice_date) return;
            const d = new Date(inv.invoice_date);
            if (period === 'Custom' && customStart && customEnd) {
                const start = new Date(customStart);
                const end = new Date(customEnd);
                if (d < start || d > end) return;
            }
            const diffWeeks = Math.floor((today.getTime() - d.getTime()) / MS_PER_WEEK);
            if (diffWeeks >= 0 && diffWeeks < 4 && inv.status !== 'CANCELLED') {
                weeklySales[3 - diffWeeks] += parseFloat(inv.total_amount) || 0;
            }
        });

        (expenses || []).forEach((exp: any) => {
            if (!exp.expense_date) return;
            const d = new Date(exp.expense_date);
            if (period === 'Custom' && customStart && customEnd) {
                const start = new Date(customStart);
                const end = new Date(customEnd);
                if (d < start || d > end) return;
            }
            const diffWeeks = Math.floor((today.getTime() - d.getTime()) / MS_PER_WEEK);
            if (diffWeeks >= 0 && diffWeeks < 4) {
                weeklyExpenses[3 - diffWeeks] += parseFloat(exp.amount) || 0;
            }
        });

        const weeklyProfit = weeklySales.map((s, i) => s - weeklyExpenses[i]);

        const currentYear = today.getFullYear();
        const monthlySales = Array(12).fill(0);
        const monthlyExpenses = Array(12).fill(0);

        (invoices || []).forEach((inv: any) => {
            if (!inv.invoice_date) return;
            const d = new Date(inv.invoice_date);
            if (period === 'Custom' && customStart && customEnd) {
                const start = new Date(customStart);
                const end = new Date(customEnd);
                if (d < start || d > end) return;
            }
            if (d.getFullYear() === currentYear && inv.status !== 'CANCELLED') {
                monthlySales[d.getMonth()] += parseFloat(inv.total_amount) || 0;
            }
        });

        (expenses || []).forEach((exp: any) => {
            if (!exp.expense_date) return;
            const d = new Date(exp.expense_date);
            if (period === 'Custom' && customStart && customEnd) {
                const start = new Date(customStart);
                const end = new Date(customEnd);
                if (d < start || d > end) return;
            }
            if (d.getFullYear() === currentYear) {
                monthlyExpenses[d.getMonth()] += parseFloat(exp.amount) || 0;
            }
        });

        const monthlyProfit = monthlySales.map((s, i) => s - monthlyExpenses[i]);
        const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const currentMonthIndex = today.getMonth();
        const displayMonthLabels = monthLabels.slice(0, currentMonthIndex + 1);
        const displayMonthlySales = monthlySales.slice(0, currentMonthIndex + 1);
        const displayMonthlyExpenses = monthlyExpenses.slice(0, currentMonthIndex + 1);
        const displayMonthlyProfit = monthlyProfit.slice(0, currentMonthIndex + 1);

        const formatTooltip = (val: number) => {
            if (val >= 100000) return '₹' + (val / 100000).toFixed(2) + ' L';
            if (val >= 1000) return '₹' + (val / 1000).toFixed(2) + ' K';
            return '₹' + val.toFixed(0);
        };

        const formatAxis = (val: number) => {
            if (val >= 100000) return '₹' + (val / 100000).toFixed(1) + ' L';
            if (val >= 1000) return '₹' + (val / 1000).toFixed(0) + ' K';
            return '₹' + val;
        };

        if (revenueChartRef.current) {
            new Chart(revenueChartRef.current, {
                type: 'line',
                data: {
                    labels: ['Week 1','Week 2','Week 3','Week 4'],
                    datasets: [{
                        label: 'Revenue',
                        data: weeklySales,
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79,70,229,0.08)',
                        borderWidth: 2.5,
                        pointBackgroundColor: '#4f46e5',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.45
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => formatTooltip(ctx.raw as number) } } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { family: 'Sora', size: 11 }, color: '#7c88a6' } },
                        y: { grid: { color: '#f0f2f8' }, ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#7c88a6', callback: v => formatAxis(v as number) } }
                    }
                }
            });
        }

        if (profitChartRef.current) {
            new Chart(profitChartRef.current, {
                type: 'bar',
                data: {
                    labels: ['Week 1','Week 2','Week 3','Week 4'],
                    datasets: [
                        { label: 'Sales', data: weeklySales, backgroundColor: 'rgba(79,70,229,0.8)', borderRadius: 6, borderSkipped: false },
                        { label: 'Profit', data: weeklyProfit, backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 6, borderSkipped: false }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + formatTooltip(ctx.raw as number) } } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { family: 'Sora', size: 11 }, color: '#7c88a6' } },
                        y: { grid: { color: '#f0f2f8' }, ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#7c88a6', callback: v => formatAxis(v as number) } }
                    }
                }
            });
        }

        if (monthlyChartRef.current) {
            new Chart(monthlyChartRef.current, {
                type: 'bar',
                data: {
                    labels: displayMonthLabels,
                    datasets: [
                        { label: 'Sales', data: displayMonthlySales, backgroundColor: 'rgba(14,165,233,0.8)', borderRadius: 8, borderSkipped: false },
                        { label: 'Expenses', data: displayMonthlyExpenses, backgroundColor: 'rgba(245,158,11,0.7)', borderRadius: 8, borderSkipped: false },
                        { label: 'Profit', data: displayMonthlyProfit, backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 8, borderSkipped: false }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + formatTooltip(ctx.raw as number) } } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { family: 'Sora', size: 11 }, color: '#7c88a6' } },
                        y: { grid: { color: '#f0f2f8' }, ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#7c88a6', callback: v => formatAxis(v as number) } }
                    }
                }
            });
        }
    }, [isClient, invoices, expenses, period, customStart, customEnd]);

    // ----- Helper functions for download actions (omitted for brevity) -----
    const handleDownloadExcel = () => { /* ... */ };
    const handlePDF = () => { /* ... */ };
    const handleCSV = () => { /* ... */ };
    const handleTallyXML = () => { /* ... */ };
    const handleGSTExcel = () => { /* ... */ };

    // ----- KPI calculations (omitted for brevity) -----
    const totalRevenue = invoices?.reduce((a:any,b:any)=> a+parseFloat(b.total_amount||0),0)||0;
    const totalProfit = totalRevenue - (expenses?.reduce((a:any,b:any)=> a+parseFloat(b.amount||0),0)||0);
    const totalInvoices = invoices?.length||0;
    const avgOrderValue = totalRevenue/ (totalInvoices||1);
    const paymentPending = invoices?.filter((i:any)=> i.status==='PENDING').reduce((a:any,b:any)=> a+parseFloat(b.total_amount||0),0)||0;
    const activeCustomers = customers?.filter((c:any)=> c.isActive).length||0;
    const totalSales = totalRevenue;
    const itemsSold = invoices?.reduce((a:any,i:any)=> a+ (i.items?.length||0),0)||0;
const totalTaxable = invoices?.reduce((a:any,b:any)=> a+parseFloat(b.subtotal||0),0)||0;
const totalCGST = invoices?.reduce((a:any,b:any)=> a+parseFloat(b.cgst_amount||0),0)||0;
const totalSGST = invoices?.reduce((a:any,b:any)=> a+parseFloat(b.sgst_amount||0),0)||0;
const totalIGST = invoices?.reduce((a:any,b:any)=> a+parseFloat(b.igst_amount||0),0)||0;

    const formatLakhs = (num:number)=>{
        if(num>=100000) return (num/100000).toFixed(2)+' L';
        if(num>=1000) return (num/1000).toFixed(2)+' K';
        return num.toString();
    };

    return (
        <>
            <div className="report-wrapper">
                <div className="topbar">
                    <div className="topbar-left">
                        <div>
                            <h1>{t.reports || 'Reports'}</h1>
                            <p>{t.businessOverview || 'Business Overview'}</p>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <select className="period-select" value={period} onChange={(e)=>{setPeriod(e.target.value);toast(`${t.periodChanged||'Period Changed'}: ${e.target.value}`);}} >
                            <option>{t.periodThisMonth||'This Month'}</option>
                            <option>{t.periodLastMonth||'Last Month'}</option>
                            <option>{t.periodThisQuarter||'This Quarter'}</option>
                            <option>{t.periodThisYear||'This Year'}</option>
                            <option>{t.periodCustomRange||'Custom Range'}</option>
                        </select>
                        <div style={{display:'flex',alignItems:'center',gap:'6px'}} >
                            <input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} className="period-select" style={{padding:'6px 8px',fontSize:'12px'}} />
                            <input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} className="period-select" style={{padding:'6px 8px',fontSize:'12px'}} />
                            <button className="export-btn btn-excel" onClick={()=>{if(customStart && customEnd){setPeriod('Custom');toast(`${t.periodCustomRange||'Custom Range'}: ${customStart} → ${customEnd}`);}else{toast('Select start and end dates');}}} style={{padding:'6px 10px',fontSize:'12px'}}>Apply</button>
                        </div>
                        <button className="export-btn" style={{marginLeft:'4px'}} onClick={()=>{scrollToChart(revenueRef);setChartView('revenue');}}>Revenue Trend</button>
                        <button className="export-btn" style={{marginLeft:'4px'}} onClick={()=>{scrollToChart(profitRef);setChartView('profit');}}>Profit vs Sales</button>
                        <button className="export-btn" style={{marginLeft:'4px'}} onClick={()=>{scrollToChart(monthlyRef);setChartView('monthly');}}>Monthly Sale Overview</button>
                    </div>
                </div>
                <div className="kpi-grid">
                    <div className="kpi-card teal" style={{animationDelay:'.05s'}} onClick={()=>setSelectedKpi('totalRevenue')}>
                        <div className="kpi-top"><div className="kpi-icon teal">📈</div><div className="kpi-trend up">↑ 12.4%</div></div>
                        <div className="kpi-value">{formatLakhs(totalRevenue)}</div>
                        <div className="kpi-label">{t.totalRevenue||'Total Revenue'}</div>
                    </div>
                    <div className="kpi-card green" style={{animationDelay:'.1s'}} onClick={()=>setSelectedKpi('netProfit')}>
                        <div className="kpi-top"><div className="kpi-icon green">💰</div><div className="kpi-trend up">↑ 9.8%</div></div>
                        <div className="kpi-value">{formatLakhs(totalProfit)}</div>
                        <div className="kpi-label">{t.netProfit||'Net Profit'}</div>
                    </div>
                    <div className="kpi-card teal" style={{animationDelay:'.15s'}} onClick={()=>setSelectedKpi('totalInvoices')}>
                        <div className="kpi-top"><div className="kpi-icon teal">🧾</div><div className="kpi-trend down">↓ 3.2%</div></div>
                        <div className="kpi-value">{totalInvoices}</div>
                        <div className="kpi-label">{t.totalInvoices||'Total Invoices'}</div>
                    </div>
                    <div className="kpi-card amber" style={{animationDelay:'.2s'}} onClick={()=>setSelectedKpi('avgOrderValue')}>
                        <div className="kpi-top"><div className="kpi-icon amber">🛒</div><div className="kpi-trend up">↑ 5.6%</div></div>
                        <div className="kpi-value">{formatLakhs(avgOrderValue)}</div>
                        <div className="kpi-label">{t.avgOrderValue||'Avg Order Value'}</div>
                    </div>
                    <div className="kpi-card red" style={{animationDelay:'.25s'}} onClick={()=>setSelectedKpi('paymentPending')}>
                        <div className="kpi-top"><div className="kpi-icon red">⚠️</div><div className="kpi-trend down">↓ 2.1%</div></div>
                        <div className="kpi-value">{formatLakhs(paymentPending)}</div>
                        <div className="kpi-label">{t.paymentPending||'Payment Pending'}</div>
                    </div>
                    <div className="kpi-card purple" style={{animationDelay:'.3s'}} onClick={()=>setSelectedKpi('activeCustomers')}>
                        <div className="kpi-top"><div className="kpi-icon purple">👥</div><div className="kpi-trend up">↑ 18%</div></div>
                        <div className="kpi-value">{activeCustomers}</div>
                        <div className="kpi-label">{t.activeCustomers||'Active Customers'}</div>
                    </div>
                    <div className="kpi-card teal" style={{animationDelay:'.35s'}} onClick={()=>setSelectedKpi('totalSale')}>
                        <div className="kpi-top"><div className="kpi-icon teal">💸</div><div className="kpi-trend up">↑ 4.3%</div></div>
                        <div className="kpi-value">{formatLakhs(totalSales)}</div>
                        <div className="kpi-label">Total Sale</div>
                    </div>
                    <div className="kpi-card amber" style={{animationDelay:'.4s'}} onClick={()=>setSelectedKpi('itemsSold')}>
                        <div className="kpi-top"><div className="kpi-icon amber">📦</div><div className="kpi-trend up">↑ 6.7%</div></div>
                        <div className="kpi-value">{itemsSold}</div>
                        <div className="kpi-label">Items Sold</div>
                    </div>
                </div>
                {selectedKpi && (
                    <div className="kpi-detail" style={{marginTop:'24px',padding:'16px',background:'var(--faint)',borderRadius:'12px',boxShadow:'var(--shadow)'}} >
                        <h3 style={{fontSize:'18px',fontWeight:'700',marginBottom:'8px'}}>Details</h3>
                        <p style={{fontSize:'14px'}}><strong>{selectedKpi}</strong>: {
                            selectedKpi==='totalRevenue' && formatLakhs(totalRevenue) ||
                            selectedKpi==='netProfit' && formatLakhs(totalProfit) ||
                            selectedKpi==='totalInvoices' && totalInvoices ||
                            selectedKpi==='avgOrderValue' && formatLakhs(avgOrderValue) ||
                            selectedKpi==='paymentPending' && formatLakhs(paymentPending) ||
                            selectedKpi==='activeCustomers' && activeCustomers ||
                            selectedKpi==='totalSale' && formatLakhs(totalSales) ||
                            selectedKpi==='itemsSold' && itemsSold
                        }</p>
                    </div>
                )}
                <div className="charts-grid">
                    <div className="chart-card" ref={revenueRef} style={{animationDelay:'.2s'}} >
                        <div className="chart-header"><div><div className="chart-title">{t.revenueTrend||'Revenue Trend'}</div><div className="chart-sub">{t.weeklyBreakdown||'Weekly breakdown'}</div></div><div className="chart-legend"><div className="legend-item"><div className="legend-dot" style={{background:'#4f46e5'}} />Revenue</div></div></div>
                        <div style={{position:'relative',height:'220px',width:'100%'}}><canvas ref={revenueChartRef} /></div>
                    </div>
                    <div className="chart-card" style={{animationDelay:'.25s'}} >
                        <div className="chart-header"><div><div className="chart-title">{t.profitTrend||'Profit vs Sales'}</div><div className="chart-sub">{t.weeklyBreakdown||'Weekly breakdown'}</div></div><div className="chart-legend"><div className="legend-item"><div className="legend-dot" style={{background:'#4f46e5'}} />Sales</div><div className="legend-item"><div className="legend-dot" style={{background:'#10b981'}} />Profit</div></div></div>
                        <div style={{position:'relative',height:'220px',width:'100%'}}><canvas ref={profitChartRef} /></div>
                    </div>
                    <div className="chart-card wide" style={{animationDelay:'.3s'}} >
                        <div className="chart-header"><div><div className="chart-title">{t.monthlyTrend||'Monthly Sales Overview'}</div><div className="chart-sub">January – March 2026</div></div><div className="chart-legend"><div className="legend-item"><div className="legend-dot" style={{background:'#0ea5e9'}} />Sales</div><div className="legend-item"><div className="legend-dot" style={{background:'#f59e0b'}} />Expenses</div><div className="legend-item"><div className="legend-dot" style={{background:'#10b981'}} />Profit</div></div></div>
                        <div style={{position:'relative',height:'180px',width:'100%'}}><canvas ref={monthlyChartRef} /></div>
                    </div>
                </div>
                <div className="download-section" style={{animation:'fadeUp .5s .35s ease both'}} >
                    <div className="section-title">{t.downloadReports||'Download Reports'}</div>
                    <div className="download-grid">
                        <div className="dl-btn tally" onClick={handleTallyXML}>
                            <span className="dl-icon">📊</span><span className="dl-name">{t.tallyXml||'Tally XML'}</span><span className="dl-desc">{t.forTallySoftware||'For Tally ERP / Prime'}</span>
                        </div>
                        <div className="dl-btn excel" onClick={handleDownloadExcel}>
                            <span className="dl-icon">📗</span><span className="dl-name">{t.excel||'Excel'}</span><span className="dl-desc">{t.spreadsheetFormat||'Spreadsheet format'}</span>
                        </div>
                        <div className="dl-btn pdf" onClick={handlePDF}>
                            <span className="dl-icon">📄</span><span className="dl-name">{t.pdfReport||'PDF Report'}</span><span className="dl-desc">{t.printReadyFormat||'Print ready format'}</span>
                        </div>
                        <div className="dl-btn csv" onClick={handleCSV}>
                            <span className="dl-icon">🗂️</span><span className="dl-name">CSV Export</span><span className="dl-desc">Raw data format</span>
                        </div>
                    </div>
                </div>
                <div className="bottom-grid">
                    <div className="table-section" style={{animation:'fadeUp .5s .4s ease both'}} >
                        <div className="chart-header"><div><div className="chart-title">Top Customers</div><div className="chart-sub">By transaction value</div></div><div style={{fontSize:'11px',fontWeight:600,color:'var(--indigo)',cursor:'pointer'}} onClick={()=>router.push('/dashboard/customers')}>View All →</div></div>
                        <div>{/* customersWithTotals mapping placeholder */}</div>
                    </div>
                    <div className="gst-card" style={{animation:'fadeUp .5s .45s ease both'}} >
                        <div className="chart-header"><div><div className="chart-title">GST Summary</div><div className="chart-sub">Current month</div></div><span style={{fontSize:'11px',fontWeight:600,color:'var(--green)',cursor:'pointer'}} onClick={handleGSTExcel}>📥 Download</span></div>
                        <div className="gst-row"><span className="gst-key">Taxable Amount</span><span className="gst-val">{formatLakhs(totalTaxable)}</span></div>
                        <div className="gst-row"><span className="gst-key">CGST (9%)</span><span className="gst-val">{formatLakhs(totalCGST)}</span></div>
                        <div className="gst-row"><span className="gst-key">SGST (9%)</span><span className="gst-val">{formatLakhs(totalSGST)}</span></div>
                        <div className="gst-row"><span className="gst-key">IGST</span><span className="gst-val">{formatLakhs(totalIGST)}</span></div>
                        <div className="gst-row"><span className="gst-key" style={{color:'var(--ink)'}}>Total Tax</span><span className="gst-val" style={{color:'var(--indigo)'}}>{formatLakhs(totalTax)}</span></div>
                        <div className="gst-compliance"><div className="compliance-top"><span>HSN Compliance</span><span>92%</span></div><div className="compliance-bar"><div className="compliance-fill" /></div></div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReportsContent />
        </Suspense>
    );
}
