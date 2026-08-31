"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useStore } from '@/lib/store';
import { getTranslations } from '../../../lib/translations';
import { downloadAndShareFile } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { generateTallyXML, downloadFile } from '@/lib/tally-exporter';

// Dynamic import used for Chart.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { drawFreeBranding } from '../../../lib/pdf-generator';

function ReportsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const getAnalytics = useStore((state: any) => state.getAnalytics);
    const fetchInvoices = useStore((state: any) => state.fetchInvoices);
    const invoices = useStore((state: any) => state.invoices);
    const customers = useStore((state: any) => state.customers);
    const settings = useStore((state: any) => state.settings);
    const fetchExpenses = useStore((state: any) => state.fetchExpenses);
    const expenses = useStore((state: any) => state.expenses);
    const businessProfile = useStore((state: any) => state.businessProfile);
    const [isClient, setIsClient] = useState(false);
    const [period, setPeriod] = useState('This Month');
    const t = getTranslations(settings?.language || 'en');

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
            const diffWeeks = Math.floor((today.getTime() - d.getTime()) / MS_PER_WEEK);
            if (diffWeeks >= 0 && diffWeeks < 4 && inv.status !== 'CANCELLED') {
                weeklySales[3 - diffWeeks] += parseFloat(inv.total_amount) || 0;
            }
        });

        (expenses || []).forEach((exp: any) => {
            if (!exp.expense_date) return;
            const d = new Date(exp.expense_date);
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
            if (d.getFullYear() === currentYear && inv.status !== 'CANCELLED') {
                monthlySales[d.getMonth()] += parseFloat(inv.total_amount) || 0;
            }
        });

        (expenses || []).forEach((exp: any) => {
            if (!exp.expense_date) return;
            const d = new Date(exp.expense_date);
            if (d.getFullYear() === currentYear) {
                monthlyExpenses[d.getMonth()] += parseFloat(exp.amount) || 0;
            }
        });

        const monthlyProfit = monthlySales.map((s, i) => s - monthlyExpenses[i]);
        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

        let revenueChart: any;
        let profitChart: any;
        let monthlyChart: any;

        const initCharts = async () => {
            const { default: Chart } = await import('chart.js/auto');
        if (revenueChartRef.current) {
            revenueChart = new Chart(revenueChartRef.current, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Revenue',
                        data: weeklySales,
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79,70,229,0.08)',
                        borderWidth: 2.5,
                        pointBackgroundColor: '#4f46e5',
                        pointRadius: 4, pointHoverRadius: 6,
                        fill: true, tension: 0.45
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => formatTooltip(ctx.raw as number) } } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { family: 'Sora', size: 11 }, color: '#7c88a6' } },
                        y: { grid: { color: '#f0f2f8' }, ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#7c88a6', callback: v => formatAxis(v as number) } }
                    }
                }
            });
        }

        if (profitChartRef.current) {
            profitChart = new Chart(profitChartRef.current, {
                type: 'bar',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [
                        { label: 'Sales', data: weeklySales, backgroundColor: 'rgba(79,70,229,0.8)', borderRadius: 6, borderSkipped: false },
                        { label: 'Profit', data: weeklyProfit, backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 6, borderSkipped: false }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + formatTooltip(ctx.raw as number) } } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { family: 'Sora', size: 11 }, color: '#7c88a6' } },
                        y: { grid: { color: '#f0f2f8' }, ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#7c88a6', callback: v => formatAxis(v as number) } }
                    }
                }
            });
        }

        if (monthlyChartRef.current) {
            monthlyChart = new Chart(monthlyChartRef.current, {
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
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + formatTooltip(ctx.raw as number) } } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { family: 'Sora', size: 12 }, color: '#7c88a6' } },
                        y: { grid: { color: '#f0f2f8' }, ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#7c88a6', callback: v => formatAxis(v as number) } }
                    }
                }
            });
        }
        };
        initCharts();

        return () => {
            if (revenueChart) revenueChart.destroy();
            if (profitChart) profitChart.destroy();
            if (monthlyChart) monthlyChart.destroy();
        }
    }, [isClient, invoices, expenses]);

    if (!isClient) return null;

    const now = new Date();
    const filterDataByPeriod = (list: any[], dateField: string) => {
        return (list || []).filter((item: any) => {
            if (!item[dateField]) return false;
            const d = new Date(item[dateField]);
            if (period === 'This Month' || period === t.periodThisMonth) {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            } else if (period === 'Last Month' || period === t.periodLastMonth) {
                const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
                const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
                return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
            } else if (period === 'This Quarter' || period === t.periodThisQuarter) {
                const quarter = Math.floor(now.getMonth() / 3);
                return Math.floor(d.getMonth() / 3) === quarter && d.getFullYear() === now.getFullYear();
            } else if (period === 'This Year' || period === t.periodThisYear) {
                return d.getFullYear() === now.getFullYear();
            }
            return true; 
        });
    };

    const filteredInvoices = filterDataByPeriod(invoices, 'invoice_date');
    const filteredExpenses = filterDataByPeriod(expenses, 'date');

    const totalRevenue = filteredInvoices.filter((i: any) => i.status !== 'CANCELLED').reduce((a: any, b: any) => a + parseFloat(b.total_amount || 0), 0) || 0;
    const totalExpenses = filteredExpenses.reduce((a: any, b: any) => a + parseFloat(b.amount || 0), 0) || 0;
    const totalProfit = totalRevenue - totalExpenses;
    const invoiceCount = filteredInvoices.length;
    const totalSales = totalRevenue;

    const allItems = (filteredInvoices || []).flatMap((inv: any) => inv.items || []);
    const itemsWithHSN = allItems.filter((item: any) => item.hsn_code && item.hsn_code.trim() !== '');
    const hsnCompliance = allItems.length > 0 ? Math.round((itemsWithHSN.length / allItems.length) * 100) : 100;

    const avgOrderValue = invoiceCount > 0 ? (totalSales / invoiceCount) : 0;
    const activeCustomers = customers?.length || 0;

    const paymentPending = invoices?.filter((inv: any) => inv.status !== 'PAID')
        .reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_amount) || 0) - (parseFloat(inv.paid_amount) || 0), 0) || 0;

    const itemsSold = invoices?.reduce((sum: number, inv: any) => sum + (inv.items?.length || 1), 0) || 0;

    const formatLakhs = (val: number) => {
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lac`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(2)} K`;
        return `₹${(val || 0).toFixed(0)}`;
    };

    const handleDownloadExcel = async () => {
        try {
            if (!invoices || invoices.length === 0) {
                toast.error(t.noDataToExport);
                return;
            }
            const excelData = invoices.map((inv: any) => ({
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

            const XLSX = await import("xlsx");
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
            const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
            
            await downloadAndShareFile(b64, `Business_Report_${period}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'view');
            toast.success(t.excelDownloaded, { duration: 5000 });
        } catch (error) {
            toast.error(t.failedDownloadExcel);
        }
    };

    const handleCSV = async () => {
        try {
            if (!invoices || invoices.length === 0) {
                toast.error(t.noDataToExport);
                return;
            }
            const excelData = invoices.map((inv: any) => ({
                'Invoice No': inv.invoice_number,
                'Date': new Date(inv.invoice_date).toLocaleDateString('en-IN'),
                'Customer Name': inv.customer?.name || 'Unknown',
                'Taxable Amount': inv.subtotal || 0,
                'Total Amount': inv.total_amount || 0,
                'Status': inv.status || 'PENDING'
            }));

            const XLSX = await import("xlsx");
            const ws = XLSX.utils.json_to_sheet(excelData);
            const csv = XLSX.utils.sheet_to_csv(ws);
            const b64 = btoa(unescape(encodeURIComponent(csv)));
            
            await downloadAndShareFile(b64, `Business_Report_${period}.csv`, 'text/csv', 'view');
            toast.success('CSV downloaded/opened!', { duration: 5000 });
        } catch (error) {
            toast.error(t.failedDownloadCsv);
        }
    };

    const handlePDF = async () => {
        try {
            if (!invoices || invoices.length === 0) {
                toast.error(t.noDataToExport);
                return;
            }
            const doc = new jsPDF();
            doc.text(`Business Report - ${period}`, 14, 15);

            const totalAmount = invoices.reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_amount) || 0), 0);
            const totalPending = invoices.filter((inv: any) => inv.status !== 'PAID').reduce((sum: number, inv: any) => sum + ((parseFloat(inv.total_amount) || 0) - (parseFloat(inv.paid_amount) || 0)), 0);

            doc.setFontSize(10);
            doc.text(`Total Sales: Rs. ${totalAmount.toFixed(2)} | Total Pending: Rs. ${totalPending.toFixed(2)}`, 14, 22);

            const tableData = invoices.map((inv: any) => [
                inv.invoice_number,
                new Date(inv.invoice_date).toLocaleDateString('en-IN'),
                inv.customer?.name || 'Unknown',
                (parseFloat(inv.total_amount) || 0).toFixed(2),
                inv.status || 'PENDING'
            ]);

            autoTable(doc, {
                head: [['Invoice No', 'Date', 'Customer', 'Amount', 'Status']],
                body: tableData,
                foot: [['', '', 'GRAND TOTAL', totalAmount.toFixed(2), '']],
                startY: 28,
            });

            const isPremium = businessProfile?.subscription_plan === 'PREMIUM' || businessProfile?.subscription_plan === 'ENTERPRISE' || ['BASIC_30', 'PREMIUM_99', 'YEARLY_299', 'LIFETIME'].includes(businessProfile?.plan_type);
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            if (!isPremium) {
                await drawFreeBranding(doc, false, pageWidth, pageHeight, pageHeight - 20);
            } else {
                const footerText = 'Generated securely via BillGST.in';
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text(footerText, 14, pageHeight - 10);
            }

            const base64Data = doc.output('datauristring').split(',')[1];
            
            await downloadAndShareFile(base64Data, `Business_Report_${period}_${Date.now()}.pdf`, 'application/pdf', 'view');
            toast.success('PDF Opened Successfully', { duration: 5000 });
        } catch (error) {
            toast.error(t.failedDownloadPdf);
        }
    };

    const handleGSTExcel = async () => {
        try {
            if (!invoices || invoices.length === 0) {
                toast.error(t.noDataToExport);
                return;
            }
            const gstData = invoices.map((inv: any) => ({
                'Date': new Date(inv.invoice_date).toLocaleDateString('en-IN'),
                'Invoice No': inv.invoice_number,
                'Customer Name': inv.customer?.name || 'Unknown',
                'GSTIN': inv.customer?.gstin || 'N/A',
                'Taxable Value': inv.subtotal || 0,
                'CGST': inv.cgst_amount || 0,
                'SGST': inv.sgst_amount || 0,
                'IGST': inv.igst_amount || 0,
                'Cess': inv.cess_amount || 0,
                'Total GST': (inv.cgst_amount || 0) + (inv.sgst_amount || 0) + (inv.igst_amount || 0),
                'Total Value': inv.total_amount || 0
            }));

            const XLSX = await import("xlsx");
            const ws = XLSX.utils.json_to_sheet(gstData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "GST Summary");
            const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
            
            await downloadAndShareFile(b64, `GST_Report_${period}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'view');
            toast.success(t.gstReportDownloaded, { duration: 5000 });
        } catch (error) {
            toast.error(t.failedDownloadGstExcel);
        }
    };

    const handleTallyXML = async () => {
        if (!invoices || invoices.length === 0) {
            toast.error(t.noDataToExport);
            return;
        }
        const xml = generateTallyXML(invoices, 'Business');
        const b64 = btoa(unescape(encodeURIComponent(xml)));
        
        await downloadAndShareFile(b64, `Tally_Sales_${period}.xml`, 'application/xml', 'view');
        toast.success(t.tallyXmlDownloaded, { duration: 5000 });
    };

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];
    const customersWithTotals = (customers || []).map((c: any) => {
        const cInvoices = (invoices || []).filter((inv: any) => inv.customer_id === c.id || inv.customer?.id === c.id);
        const total = cInvoices.reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_amount) || 0), 0);
        return { ...c, total, phone: c.phone || 'N/A' };
    }).sort((a: any, b: any) => b.total - a.total).slice(0, 5);

    const totalTaxable = invoices?.reduce((sum: number, inv: any) => sum + (parseFloat(inv.subtotal) || 0), 0) || 0;
    const totalCGST = invoices?.reduce((sum: number, inv: any) => sum + (parseFloat(inv.cgst_amount) || 0), 0) || 0;
    const totalSGST = invoices?.reduce((sum: number, inv: any) => sum + (parseFloat(inv.sgst_amount) || 0), 0) || 0;
    const totalIGST = invoices?.reduce((sum: number, inv: any) => sum + (parseFloat(inv.igst_amount) || 0), 0) || 0;

    const totalTax = totalCGST + totalSGST + totalIGST;
    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
  :root{
    --ink:#0B1330;
    --ink-soft:#454E6B;
    --muted:#7A8199;
    --bg:#F1F3F9;
    --card:#FFFFFF;
    --border:#E5E8F2;
    --gold:#B9862F;
    --gold-soft:#F4E9D8;
    --teal:#0E7C61;
    --teal-soft:#E3F3EE;
    --red:#C0392B;
    --red-soft:#FBEAE8;
    --navy-deep:#0B1330;
  }
  .report-wrapper *{box-sizing:border-box;}
  .report-wrapper{background:var(--bg); font-family:'Inter',sans-serif; color:var(--ink); display:flex; justify-content:center; padding:32px 16px; min-height:100vh;}
  .app{
    width:100%;
    max-width:412px;
    background:var(--bg);
    border-radius:28px;
    overflow:hidden;
    box-shadow:0 30px 60px -20px rgba(11,19,48,0.25);
    border:1px solid #d9dcea;
  }

  /* Header */
  .header{
    background:var(--navy-deep);
    padding:22px 20px 26px;
    color:#fff;
  }
  .header-top{
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:20px;
  }
  .brand{ display:flex; align-items:center; gap:10px; }
  .brand-mark{
    width:34px; height:34px; border-radius:9px;
    background:linear-gradient(160deg,var(--gold) 0%, #8f6420 100%);
    display:flex; align-items:center; justify-content:center;
    font-family:'Fraunces',serif; font-weight:600; font-size:16px; color:#fff;
  }
  .brand-name{ font-family:'Fraunces',serif; font-weight:500; font-size:19px; letter-spacing:0.2px;}
  .brand-name span{ color:var(--gold); }
  .header-icons{ display:flex; gap:14px; align-items:center; }
  .icon-btn{
    width:34px; height:34px; border-radius:9px;
    background:rgba(255,255,255,0.08);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer;
  }
  .icon-btn svg{ width:17px; height:17px; stroke:#EDEFF6; }

  .hero-title{ font-family:'Fraunces',serif; font-size:30px; font-weight:500; line-height:1.1;}
  .hero-sub{ color:#B7BCD6; font-size:13.5px; margin-top:5px; }

  .period-row{
    display:flex; gap:8px; margin-top:20px; overflow-x: auto; padding-bottom: 4px;
  }
  .period-row::-webkit-scrollbar { display: none; }
  .pill{
    flex:1;
    text-align:center;
    padding:10px 12px;
    border-radius:10px;
    font-size:13px;
    font-weight:600;
    display:flex; align-items:center; justify-content:center; gap:6px;
    cursor:pointer;
    border:1px solid rgba(255,255,255,0.14);
    color:#EDEFF6;
    background:rgba(255,255,255,0.06);
    white-space: nowrap;
  }
  .pill.active{
    background:var(--gold);
    color:#241800;
    border-color:var(--gold);
  }
  .pill svg{ width:14px; height:14px; }

  /* Content */
  .content{ padding:18px 18px 28px; }

  .advisory{
    background:var(--gold-soft);
    border:1px solid #e6d3ac;
    border-left:4px solid var(--gold);
    border-radius:10px;
    padding:13px 14px;
    display:flex;
    align-items:flex-start;
    gap:10px;
    margin-bottom:20px;
  }
  .advisory svg{ width:17px; height:17px; stroke:#8f6420; flex-shrink:0; margin-top:1px;}
  .advisory-text{ font-size:12.8px; line-height:1.4; color:#5c4415; flex:1; }
  .advisory-text b{ display:block; font-size:13.2px; color:#402f0d; margin-bottom:1px; text-transform: uppercase; }
  .advisory-link{
    font-size:12.5px; font-weight:700; color:var(--navy-deep);
    text-decoration:underline; text-underline-offset:2px; white-space:nowrap; align-self:center; cursor: pointer;
  }

  .section-label{
    font-size:12.5px; font-weight:600; color:var(--muted);
    margin:0 2px 10px; text-transform:none;
  }

  .kpi-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
    margin-bottom:22px;
  }
  .kpi{
    background:var(--card);
    border:1px solid var(--border);
    border-radius:14px;
    padding:14px;
    cursor: pointer;
  }
  .kpi-top{
    display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;
  }
  .kpi-icon{
    width:30px; height:30px; border-radius:8px;
    background:#EEF0F8;
    display:flex; align-items:center; justify-content:center;
  }
  .kpi-icon svg{ width:15px; height:15px; stroke:var(--navy-deep); }
  .kpi.warn .kpi-icon{ background:var(--red-soft); }
  .kpi.warn .kpi-icon svg{ stroke:var(--red); }
  .delta{
    font-size:11.5px; font-weight:700; display:flex; align-items:center; gap:2px;
  }
  .delta.up{ color:var(--teal); }
  .delta.down{ color:var(--red); }
  .kpi-value{
    font-family:'Inter',sans-serif; font-variant-numeric:tabular-nums;
    font-size:19px; font-weight:700; color:var(--ink); line-height:1.15;
  }
  .kpi-label{
    font-size:11.8px; color:var(--muted); margin-top:3px; font-weight:500;
  }

  .chart-card{
    background:var(--card);
    border:1px solid var(--border);
    border-radius:14px;
    padding:18px 16px 8px;
  }
  .chart-head{
    display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;
  }
  .chart-head h3{ font-size:15.5px; font-weight:700; color:var(--ink); }
  .chart-head p{ font-size:12px; color:var(--muted); margin-top:2px; }
  .legend{ display:flex; align-items:center; gap:6px; font-size:12px; color:var(--ink-soft); font-weight:600; }
  .legend-dot{ width:8px; height:8px; border-radius:50%; background:var(--gold); }

  .chart-wrap{ margin-top:6px; position:relative; height:120px; width:100%; }
  .week-labels{
    display:flex; justify-content:space-between; padding:6px 4px 4px;
    font-size:11px; color:var(--muted); font-weight:500;
  }

  .export-row{
    display:flex; gap:10px; margin-top:18px;
  }
  .export-btn{
    flex:1;
    display:flex; align-items:center; justify-content:center; gap:7px;
    padding:12px 10px;
    border-radius:11px;
    font-size:13px; font-weight:700;
    border:1px solid var(--border);
    background:var(--card);
    color:var(--ink);
    cursor:pointer;
  }
  .export-btn:active{ transform:scale(0.98); }
  .export-btn svg{ width:15px; height:15px; }

.bottom-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
}
@media(max-width:768px){ .bottom-grid{grid-template-columns:1fr} }

.table-section {
  background: var(--white);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}
.table-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--faint);
  transition: all 0.15s;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--faint); margin: 0 -8px; padding: 10px 8px; border-radius: 10px; }
.row-num { width: 22px; height: 22px; background: var(--faint); border-radius: 7px; font-size: 11px; font-weight: 700; color: var(--muted); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.row-avatar { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
.row-info { flex: 1; min-width: 0; }
.row-name { font-size: 13px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-txn  { font-size: 11px; color: var(--muted); font-weight: 400; }
.row-amt  { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: var(--ink); flex-shrink: 0; }

.gst-card {
  background: var(--white);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}
.gst-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 9px 0; border-bottom: 1px solid var(--faint);
  font-size: 13px;
}
.gst-row:last-child { border-bottom: none; font-weight: 700; }
.gst-key { color: var(--muted); font-weight: 500; }
.gst-val { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--ink); }
.gst-compliance {
  margin-top: 14px;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border: 1px solid #bbf7d0;
  border-radius: 11px;
  padding: 12px 14px;
}
.compliance-top { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: var(--green); margin-bottom: 7px; }
.compliance-bar { height: 6px; background: #d1fae5; border-radius: 10px; overflow: hidden; }
.compliance-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 10px; width: 92%; transition: width 1s ease; }
            ` }} />

            <div className="report-wrapper">
                <div className="app">
                    <div className="header">
                        <div className="header-top">
                            <div className="brand">
                                <div className="brand-mark">{businessProfile?.business_name?.[0]?.toUpperCase() || 'B'}</div>
                                <div className="brand-name">{businessProfile?.business_name || 'BillGST'}</div>
                            </div>
                            <div className="header-icons">
                                <div className="icon-btn" onClick={() => router.push('/dashboard/settings')}>
                                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                </div>
                            </div>
                        </div>

                        <div className="hero-title">{t.reports || 'Reports'}</div>
                        <div className="hero-sub">{t.businessOverview || 'Business overview'} &middot; {period}</div>

                        <div className="period-row">
                            <div className={`pill ${period === 'This Month' ? 'active' : ''}`} onClick={() => setPeriod('This Month')}>{t.periodThisMonth || 'This Month'}</div>
                            <div className={`pill ${period === 'Last Month' ? 'active' : ''}`} onClick={() => setPeriod('Last Month')}>{t.periodLastMonth || 'Last Month'}</div>
                            <div className={`pill ${period === 'This Year' ? 'active' : ''}`} onClick={() => setPeriod('This Year')}>{t.periodThisYear || 'This Year'}</div>
                        </div>
                    </div>

                    <div className="content">
                        <div className="advisory">
                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            <div className="advisory-text">
                                <b>{t.advisory || 'ADVISORY'}</b>
                                {t.hsnComplianceHint || 'Ensure HSN codes for GST compliance'}
                            </div>
                            <div className="advisory-link" onClick={() => toast(t.itcMaximizeToast || 'Claim ITC efficiently')}>{t.maximizeItc || 'Maximize ITC'}</div>
                        </div>

                        <div className="section-label">{t.keyMetrics || 'Key metrics'}</div>
                        <div className="kpi-grid">
                            <div className="kpi" onClick={() => router.push('/dashboard/invoices')}>
                                <div className="kpi-top">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="M6 13h8.5l-6 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>
                                    </div>
                                    <div className="delta up">↑</div>
                                </div>
                                <div className="kpi-value">{formatLakhs(totalSales)}</div>
                                <div className="kpi-label">{t.totalRevenue || 'Total revenue'}</div>
                            </div>

                            <div className="kpi" onClick={handleDownloadExcel}>
                                <div className="kpi-top">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="M6 13h8.5l-6 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>
                                    </div>
                                    <div className="delta up">↑</div>
                                </div>
                                <div className="kpi-value">{formatLakhs(totalProfit)}</div>
                                <div className="kpi-label">{t.netProfit || 'Net profit'}</div>
                            </div>

                            <div className="kpi" onClick={() => router.push('/dashboard/invoices')}>
                                <div className="kpi-top">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
                                    </div>
                                    <div className="delta down">↓</div>
                                </div>
                                <div className="kpi-value">{invoiceCount}</div>
                                <div className="kpi-label">{t.totalInvoices || 'Total invoices'}</div>
                            </div>

                            <div className="kpi" onClick={() => toast(`Average Order Value: ${formatLakhs(avgOrderValue)}`)}>
                                <div className="kpi-top">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                                    </div>
                                    <div className="delta up">↑</div>
                                </div>
                                <div className="kpi-value">{formatLakhs(avgOrderValue)}</div>
                                <div className="kpi-label">{t.avgOrderValue || 'Avg order value'}</div>
                            </div>

                            <div className="kpi warn" onClick={() => router.push('/dashboard/invoices?status=PENDING')}>
                                <div className="kpi-top">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                    </div>
                                    <div className="delta down">↓</div>
                                </div>
                                <div className="kpi-value">{formatLakhs(paymentPending)}</div>
                                <div className="kpi-label">{t.paymentPending || 'Payment pending'}</div>
                            </div>

                            <div className="kpi" onClick={() => router.push('/dashboard/customers')}>
                                <div className="kpi-top">
                                    <div className="kpi-icon">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <div className="delta up">↑</div>
                                </div>
                                <div className="kpi-value">{customers?.length || 0}</div>
                                <div className="kpi-label">{t.activeCustomers || 'Active customers'}</div>
                            </div>

                        </div>

                        <div className="section-label">{t.revenueTrend || 'Revenue trend'}</div>
                        <div className="chart-card">
                            <div className="chart-head">
                                <div>
                                    <h3>{t.revenueTrend || 'Revenue breakdown'}</h3>
                                </div>
                                <div className="legend"><span className="legend-dot"></span>{t.totalRevenue || 'Revenue'}</div>
                            </div>
                            <div className="chart-wrap">
                                <canvas ref={monthlyChartRef}></canvas>
                            </div>
                        </div>

                        <div className="export-row">
                            <div className="export-btn" onClick={handleTallyXML}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#0E7C61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                {t.exportTally || 'Export Tally XML'}
                            </div>
                            <div className="export-btn" onClick={handleDownloadExcel}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#0E7C61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                {t.exportExcel || 'Export Excel'}
                            </div>
                        
<div className="bottom-grid">
                        <div className="table-section" style={{ animation: "fadeUp .5s .4s ease both" }}>
                            <div className="chart-header">
                                <div>
                                    <div className="chart-title">Top Customers</div>
                                    <div className="chart-sub">By transaction value</div>
                                </div>
                                <div
                                    style={{ fontSize: "11px", fontWeight: 600, color: "var(--indigo)", cursor: "pointer" }}
                                    onClick={() => router.push('/dashboard/customers')}
                                >
                                    View All →
                                </div>
                            </div>
                            <div>
                                {customersWithTotals.map((c: any, i: number) => (
                                    <div className="table-row" key={i} onClick={() => c.id ? router.push('/dashboard/customers/' + c.id) : null} style={{ cursor: c.id ? 'pointer' : 'default' }}>
                                        <div className="row-num">{i + 1}</div>
                                        <div className="row-avatar" style={{ background: colors[i % colors.length] }}>{(c.name || 'U').charAt(0).toUpperCase()}</div>
                                        <div className="row-info">
                                            <div className="row-name">{c.name}</div>
                                            <div className="row-txn">📞 {c.phone}</div>
                                        </div>
                                        <div className="row-amt">{formatLakhs(c.total)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="gst-card" style={{ animation: "fadeUp .5s .45s ease both" }}>
                            <div className="chart-header">
                                <div>
                                    <div className="chart-title">GST Summary</div>
                                    <div className="chart-sub">Current month</div>
                                </div>
                                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--green)", cursor: "pointer" }} onClick={handleGSTExcel}>📥 Download</span>
                            </div>
                            <div className="gst-row"><span className="gst-key">Taxable Amount</span><span className="gst-val">{formatLakhs(totalTaxable)}</span></div>
                            <div className="gst-row"><span className="gst-key">CGST (9%)</span><span className="gst-val">{formatLakhs(totalCGST)}</span></div>
                            <div className="gst-row"><span className="gst-key">SGST (9%)</span><span className="gst-val">{formatLakhs(totalSGST)}</span></div>
                            <div className="gst-row"><span className="gst-key">IGST</span><span className="gst-val">{formatLakhs(totalIGST)}</span></div>
                            <div className="gst-row"><span className="gst-key" style={{ color: "var(--ink)" }}>Total Tax</span><span className="gst-val" style={{ color: "var(--indigo)" }}>{formatLakhs(totalTax)}</span></div>

                            <div className="gst-compliance">
                                <div className="compliance-top">
                                    <span>HSN Compliance</span>
                                    <span>{hsnCompliance}%</span>
                                </div>
                                <div className="compliance-bar"><div className="compliance-fill" style={{ width: `${hsnCompliance}%` }} /></div>
                            </div>
                        </div>
                    </div>
</div>
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
