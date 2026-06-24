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
    const searchParams = useSearchParams();
    const router = useRouter();
    const { getAnalytics, fetchInvoices, invoices, customers, settings, fetchExpenses, expenses, businessProfile } = useStore() as any;
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

        let profitChart: any;
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

        let monthlyChart: any;
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

            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
            const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
            const { downloadAndShareFile } = await import('@/lib/utils');
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

            const ws = XLSX.utils.json_to_sheet(excelData);
            const csv = XLSX.utils.sheet_to_csv(ws);
            const b64 = btoa(unescape(encodeURIComponent(csv)));
            const { downloadAndShareFile } = await import('@/lib/utils');
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
            const { downloadAndShareFile } = await import('@/lib/utils');
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

            const ws = XLSX.utils.json_to_sheet(gstData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "GST Summary");
            const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
            const { downloadAndShareFile } = await import('@/lib/utils');
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
        const { downloadAndShareFile } = await import('@/lib/utils');
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
:root {
  --bg: #f0f2f8;
  --white: #ffffff;
  --ink: #0b0f1e;
  --ink2: #1c2340;
  --slate: #3d4766;
  --muted: #7c88a6;
  --border: #e2e6f3;
  --faint: #f5f7fd;
  --indigo: #4f46e5;
  --indigo-soft: rgba(79,70,229,0.1);
  --teal: #0ea5e9;
  --teal-soft: rgba(14,165,233,0.1);
  --green: #10b981;
  --green-soft: rgba(16,185,129,0.1);
  --amber: #f59e0b;
  --amber-soft: rgba(245,158,11,0.1);
  --red: #ef4444;
  --red-soft: rgba(239,68,68,0.1);
  --orange: #f97316;
  --shadow: 0 2px 16px rgba(11,15,30,0.07), 0 1px 4px rgba(11,15,30,0.04);
  --shadow-md: 0 8px 32px rgba(11,15,30,0.1), 0 2px 8px rgba(11,15,30,0.06);
}

.report-wrapper { font-family: 'Sora', sans-serif; background: var(--bg); color: var(--ink); min-height: 100dvh; overflow-y: visible; }
.report-wrapper * { box-sizing: border-box; }

.topbar {
  background: linear-gradient(135deg, #0b0f1e 0%, #1c2340 60%, #2d3561 100%);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  box-shadow: 0 4px 24px rgba(11,15,30,0.3);
  perspective: 1000px;
  animation: dropIn3D 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}
@keyframes dropIn3D {
  from { opacity: 0; transform: rotateX(-30deg) translateY(-40px); }
  to { opacity: 1; transform: rotateX(0) translateY(0); }
}
@media(max-width: 768px) {
  .topbar { padding: 16px; gap: 14px; }
  .topbar-right { justify-content: center; width: 100%; flex-wrap: wrap; }
}
.topbar-left { display: flex; flex-direction: column; align-items: center; text-align: center; }
.topbar h1 { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.4px; margin: 0; }
.topbar p  { font-size: 11.5px; color: rgba(255,255,255,0.45); font-weight: 400; margin-top: 1px; margin-bottom: 0;}

.topbar-right { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
.period-select {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
  padding: 9px 14px;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
}
.period-select option { background: #1c2340; color: #fff; }

.export-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 14px;
  border-radius: 10px;
  border: none;
  font-family: 'Sora', sans-serif;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}
.btn-tally { background: linear-gradient(135deg, #dc4a1a, #f97316); color: #fff; box-shadow: 0 4px 14px rgba(249,115,22,0.35); }
.btn-excel { background: linear-gradient(135deg, #059669, #10b981); color: #fff; box-shadow: 0 4px 14px rgba(16,185,129,0.35); }
.export-btn:hover { transform: translateY(-3px) scale(1.02); filter: brightness(1.15); box-shadow: 0 10px 20px rgba(0,0,0,0.25); }
@media(max-width: 500px) {
  .export-btn { padding: 8px 12px; font-size: 11px; gap: 4px; }
  .period-select { padding: 8px 10px; font-size: 11px; }
}

.advisory {
  margin: 14px 16px 0;
  background: linear-gradient(135deg, #312e81, #4338ca, #4f46e5);
  border-radius: 12px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(79,70,229,0.3);
  animation: slideIn 0.5s ease both;
}
@media(max-width: 768px) {
  .advisory { margin: 10px 12px 0; padding: 6px 12px; gap: 8px; }
}
@keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
.advisory-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.advisory-icon { font-size: 18px; flex-shrink: 0; }
.advisory-text { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.advisory-text p { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.6); margin: 0; background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
.advisory-text h3 { font-size: 12px; font-weight: 500; color: #fff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@media(max-width: 600px) {
  .advisory-icon { display: none; }
  .advisory-text h3 { font-size: 11px; }
}
.advisory-badge {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff; padding: 6px 14px; border-radius: 8px;
  font-size: 11.5px; font-weight: 700; cursor: pointer; white-space: nowrap;
  transition: all 0.2s; flex-shrink: 0;
}
.advisory-badge:hover { background: rgba(255,255,255,0.25); }
.page-content-box { 
  padding: 24px 16px 40px; 
  max-width: 1200px; 
  margin: 0 auto; 
  animation: scaleIn3D 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; 
  transform-origin: top center;
  perspective: 1000px;
}
@keyframes scaleIn3D {
  from { opacity: 0; transform: scale(0.9) rotateX(15deg) translateY(30px); }
  to { opacity: 1; transform: scale(1) rotateX(0) translateY(0); }
}
@media(min-width: 769px) {
  .page-content-box { padding: 28px 24px 40px; }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}
@media(max-width:900px){ .kpi-grid{grid-template-columns:repeat(2,1fr)} }
@media(max-width:500px){ .kpi-grid{grid-template-columns:repeat(4, 1fr); gap: 6px;} }

.kpi-card {
  background: var(--white);
  border-radius: 16px;
  padding: 20px 18px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  transition: all 0.25s;
  animation: fadeUp 0.4s ease both;
  cursor: pointer;
  user-select: none;
}
.kpi-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: var(--shadow-md); border-color: var(--indigo); }
.kpi-card:active { transform: translateY(-1px) scale(0.99); }
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 16px 16px 0 0;
}
.kpi-card.indigo::before { background: linear-gradient(90deg, #4f46e5, #818cf8); }
.kpi-card.teal::before   { background: linear-gradient(90deg, #0ea5e9, #38bdf8); }
.kpi-card.green::before  { background: linear-gradient(90deg, #10b981, #34d399); }
.kpi-card.amber::before  { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.kpi-card.red::before    { background: linear-gradient(90deg, #ef4444, #f87171); }
.kpi-card.purple::before { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }

@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

.kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.kpi-icon {
  width: 40px; height: 40px;
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.kpi-icon.indigo { background: var(--indigo-soft); }
.kpi-icon.teal   { background: var(--teal-soft); }
.kpi-icon.green  { background: var(--green-soft); }
.kpi-icon.amber  { background: var(--amber-soft); }
.kpi-icon.red    { background: var(--red-soft); }
.kpi-icon.purple { background: rgba(139,92,246,0.1); }

.kpi-trend {
  font-size: 11px; font-weight: 700;
  padding: 3px 8px; border-radius: 20px;
  display: flex; align-items: center; gap: 3px;
}
.kpi-trend.up   { background: var(--green-soft); color: var(--green); }
.kpi-trend.down { background: var(--red-soft); color: var(--red); }

.kpi-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px; font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--ink);
  margin-bottom: 4px;
}
.kpi-label {
  font-size: 10.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px;
  color: var(--muted);
}

@media(max-width: 500px) {
  .kpi-card { padding: 8px 6px; border-radius: 10px; }
  .kpi-value { font-size: 11px; margin-bottom: 2px; }
  .kpi-icon { width: 22px; height: 22px; font-size: 11px; border-radius: 6px; }
  .kpi-label { font-size: 7px; letter-spacing: 0; line-height: 1.1; }
  .kpi-top { margin-bottom: 4px; }
  .kpi-trend { font-size: 7px; padding: 2px 3px; border-radius: 3px; }
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 18px;
}
@media(max-width:768px){ .charts-grid{grid-template-columns:1fr} }

.chart-card {
  background: var(--white);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  animation: fadeUp 0.5s ease both;
}
.chart-card.wide { grid-column: span 2; }
@media(max-width:768px){ .chart-card.wide{grid-column:span 1} }

.chart-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.chart-title { font-size: 14px; font-weight: 700; color: var(--ink); letter-spacing: -0.2px; }
.chart-sub   { font-size: 11px; color: var(--muted); font-weight: 400; margin-top: 2px; }
.chart-legend { display: flex; gap: 14px; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: var(--muted); }
.legend-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.download-section {
  background: var(--white);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  margin-bottom: 18px;
}
.section-title {
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1px; color: var(--muted); margin-bottom: 14px;
  display: flex; align-items: center; gap: 8px;
}
.section-title::after { content:''; flex:1; height:1px; background:var(--border); }

.download-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
@media(max-width:600px){ .download-grid{grid-template-columns:repeat(2,1fr)} }

.dl-btn {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 10px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: var(--faint);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}
.dl-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: transparent; }
.dl-btn.tally { --hc: #f97316; }
.dl-btn.excel { --hc: #10b981; }
.dl-btn.pdf   { --hc: #ef4444; }
.dl-btn.csv   { --hc: #4f46e5; }
.dl-btn:hover { background: color-mix(in srgb, var(--hc) 8%, white); border-color: color-mix(in srgb, var(--hc) 30%, white); }
.dl-icon { font-size: 28px; }
.dl-name { font-size: 12px; font-weight: 700; color: var(--ink); white-space: nowrap; }
.dl-desc { font-size: 9px; color: var(--muted); font-weight: 400; text-align: center; line-height: 1.2; }
@media(max-width: 400px) {
  .dl-btn { padding: 12px 6px; }
  .dl-name { font-size: 10.5px; }
}

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
                <div className="topbar">
                    <div className="topbar-left">
                        <div>
                            <h1>{t.reports || 'Reports'}</h1>
                            <p>{t.businessOverview || 'Business Overview'}</p>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <select className="period-select" value={period} onChange={(e) => { setPeriod(e.target.value); toast(`${t.periodChanged || 'Period Changed'}: ${e.target.value}`); }}>
                            <option>{t.periodThisMonth || 'This Month'}</option>
                            <option>{t.periodLastMonth || 'Last Month'}</option>
                            <option>{t.periodThisQuarter || 'This Quarter'}</option>
                            <option>{t.periodThisYear || 'This Year'}</option>
                            <option>{t.periodCustomRange || 'Custom Range'}</option>
                        </select>
                        <button className="export-btn btn-tally" onClick={handleTallyXML}>📊 {t.tallyXml || 'Tally XML'}</button>
                        <button className="export-btn btn-excel" onClick={handleDownloadExcel}>📗 {t.excel || 'Excel'}</button>
                    </div>
                </div>

                <div className="advisory">
                    <div className="advisory-left">
                        <span className="advisory-icon">💡</span>
                        <div className="advisory-text">
                            <p>{t.advisory || 'ADVISORY'}</p>
                            <h3>{t.hsnComplianceHint || 'Ensure HSN codes for GST compliance'}</h3>
                        </div>
                    </div>
                    <div className="advisory-badge" onClick={() => toast(t.itcMaximizeToast || 'Claim ITC efficiently')}>{t.maximizeItc || 'Maximize ITC'}</div>
                </div>

                <div className="page-content-box" style={{ paddingBottom: '80px' }}>

                    <div className="kpi-grid">
                        {/* 1. Total Revenue → Invoices Page */}
                        <div className="kpi-card indigo" onClick={() => router.push('/dashboard/invoices')} title="View all invoices">
                            <div className="kpi-top">
                                <div className="kpi-icon indigo">📈</div>
                                <div className="kpi-trend up">↑ 12.4%</div>
                            </div>
                            <div className="kpi-value">{formatLakhs(totalSales)}</div>
                            <div className="kpi-label">{t.totalRevenue || 'Total Revenue'}</div>
                        </div>

                        {/* 2. Net Profit → Excel Download */}
                        <div className="kpi-card green" style={{ animationDelay: ".1s" }} onClick={handleDownloadExcel} title="Download profit report">
                            <div className="kpi-top">
                                <div className="kpi-icon green">💰</div>
                                <div className="kpi-trend up">↑ 8.1%</div>
                            </div>
                            <div className="kpi-value">{formatLakhs(totalProfit)}</div>
                            <div className="kpi-label">{t.netProfit || 'Net Profit'}</div>
                        </div>

                        {/* 3. Total Invoices → Invoices Page */}
                        <div className="kpi-card teal" style={{ animationDelay: ".15s" }} onClick={() => router.push('/dashboard/invoices')} title="View all invoices">
                            <div className="kpi-top">
                                <div className="kpi-icon teal">🧾</div>
                                <div className="kpi-trend down">↓ 3.2%</div>
                            </div>
                            <div className="kpi-value">{invoiceCount}</div>
                            <div className="kpi-label">{t.totalInvoices || 'Total Invoices'}</div>
                        </div>

                        {/* 4. Avg Order Value → toast info */}
                        <div className="kpi-card amber" style={{ animationDelay: ".2s" }} onClick={() => toast(`Average Order Value: ${formatLakhs(avgOrderValue)} | Total Orders: ${invoiceCount}`, { duration: 4000 })} title="Average order info">
                            <div className="kpi-top">
                                <div className="kpi-icon amber">🛒</div>
                                <div className="kpi-trend up">↑ 5.6%</div>
                            </div>
                            <div className="kpi-value">{formatLakhs(avgOrderValue)}</div>
                            <div className="kpi-label">{t.avgOrderValue || 'Avg Order Value'}</div>
                        </div>

                        {/* 5. Payment Pending → Pending Invoices */}
                        <div className="kpi-card red" style={{ animationDelay: ".25s" }} onClick={() => router.push('/dashboard/invoices?status=PENDING')} title="View pending payments">
                            <div className="kpi-top">
                                <div className="kpi-icon red">⚠️</div>
                                <div className="kpi-trend down">↓ 2.1%</div>
                            </div>
                            <div className="kpi-value">{formatLakhs(paymentPending)}</div>
                            <div className="kpi-label">{t.paymentPending || 'Payment Pending'}</div>
                        </div>

                        {/* 6. Active Customers → Customers Page */}
                        <div className="kpi-card purple" style={{ animationDelay: ".3s" }} onClick={() => router.push('/dashboard/customers')} title="View all customers">
                            <div className="kpi-top">
                                <div className="kpi-icon purple">👥</div>
                                <div className="kpi-trend up">↑ 18%</div>
                            </div>
                            <div className="kpi-value">{activeCustomers}</div>
                            <div className="kpi-label">{t.activeCustomers || 'Active Customers'}</div>
                        </div>

                        {/* 7. Total Sales → Excel Download */}
                        <div className="kpi-card teal" style={{ animationDelay: ".35s" }} onClick={handleDownloadExcel} title="Download sales report">
                            <div className="kpi-top">
                                <div className="kpi-icon teal">💸</div>
                                <div className="kpi-trend up">↑ 4.3%</div>
                            </div>
                            <div className="kpi-value">{formatLakhs(totalSales)}</div>
                            <div className="kpi-label">{t.totalSales || 'Total Sales'}</div>
                        </div>

                        {/* 8. Items Sold → Inventory Page */}
                        <div className="kpi-card green" style={{ animationDelay: ".4s" }} onClick={() => router.push('/dashboard/inventory')} title="View inventory">
                            <div className="kpi-top">
                                <div className="kpi-icon green">📦</div>
                                <div className="kpi-trend up">↑ 9.7%</div>
                            </div>
                            <div className="kpi-value">{itemsSold}</div>
                            <div className="kpi-label">{t.itemsSold || 'Items Sold'}</div>
                        </div>
                    </div>

                    <div className="charts-grid">
                        <div className="chart-card" style={{ animationDelay: ".2s" }}>
                            <div className="chart-header">
                                <div>
                                    <div className="chart-title">{t.revenueTrend || 'Revenue Trend'}</div>
                                    <div className="chart-sub">{t.weeklyBreakdown || 'Weekly breakdown'}</div>
                                </div>
                                <div className="chart-legend">
                                    <div className="legend-item"><div className="legend-dot" style={{ background: "#4f46e5" }} />Revenue</div>
                                </div>
                            </div>
                            <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                                <canvas ref={revenueChartRef} />
                            </div>
                        </div>

                        <div className="chart-card" style={{ animationDelay: ".25s" }}>
                            <div className="chart-header">
                                <div>
                                    <div className="chart-title">Profit vs Sales</div>
                                    <div className="chart-sub">Weekly comparison</div>
                                </div>
                                <div className="chart-legend">
                                    <div className="legend-item"><div className="legend-dot" style={{ background: "#4f46e5" }} />Sales</div>
                                    <div className="legend-item"><div className="legend-dot" style={{ background: "#10b981" }} />Profit</div>
                                </div>
                            </div>
                            <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                                <canvas ref={profitChartRef} />
                            </div>
                        </div>

                        <div className="chart-card wide" style={{ animationDelay: ".3s" }}>
                            <div className="chart-header">
                                <div>
                                    <div className="chart-title">Monthly Sales Overview</div>
                                    <div className="chart-sub">January – December {new Date().getFullYear()}</div>
                                </div>
                                <div className="chart-legend">
                                    <div className="legend-item"><div className="legend-dot" style={{ background: "#0ea5e9" }} />Sales</div>
                                    <div className="legend-item"><div className="legend-dot" style={{ background: "#f59e0b" }} />Expenses</div>
                                    <div className="legend-item"><div className="legend-dot" style={{ background: "#10b981" }} />Profit</div>
                                </div>
                            </div>
                            <div style={{ position: 'relative', height: '180px', width: '100%' }}>
                                <canvas ref={monthlyChartRef} />
                            </div>
                        </div>
                    </div>

                    <div className="download-section" style={{ animation: "fadeUp .5s .35s ease both" }}>
                        <div className="section-title">{t.downloadReports || 'Download Reports'}</div>
                        <div className="download-grid">
                            <div className="dl-btn tally" onClick={handleTallyXML}>
                                <span className="dl-icon">📊</span>
                                <span className="dl-name">{t.tallyXml || 'Tally XML'}</span>
                                <span className="dl-desc">{t.forTallySoftware || 'For Tally ERP / Prime'}</span>
                            </div>
                            <div className="dl-btn excel" onClick={handleDownloadExcel}>
                                <span className="dl-icon">📗</span>
                                <span className="dl-name">{t.excel || 'Excel'}</span>
                                <span className="dl-desc">{t.spreadsheetFormat || 'Spreadsheet format'}</span>
                            </div>
                            <div className="dl-btn pdf" onClick={handlePDF}>
                                <span className="dl-icon">📄</span>
                                <span className="dl-name">{t.pdfReport || 'PDF Report'}</span>
                                <span className="dl-desc">{t.printReadyFormat || 'Print ready format'}</span>
                            </div>
                            <div className="dl-btn csv" onClick={handleCSV}>
                                <span className="dl-icon">🗂️</span>
                                <span className="dl-name">CSV Export</span>
                                <span className="dl-desc">Raw data format</span>
                            </div>
                        </div>
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
