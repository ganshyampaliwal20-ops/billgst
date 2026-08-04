'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { FaDownload, FaFileExcel, FaCheckCircle, FaSpinner, FaCog, FaThLarge, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import './gst-returns.css';

type ReturnType = 'GSTR1' | 'GSTR3B' | 'GSTR4';
type FilingFrequency = 'MONTHLY' | 'QUARTERLY';
type PeriodChip = 'cm' | 'lm' | 'cq' | 'custom';

export default function GSTReturnsPage() {
    const businessProfile = useStore((state: any) => state.businessProfile) || {};
    const fetchBusinessProfile = useStore((state: any) => state.fetchBusinessProfile);
    const invoices = useStore((state: any) => state.invoices) || [];
    const fetchInvoices = useStore((state: any) => state.fetchInvoices);

    const userGSTIN = useMemo(() => {
        return (businessProfile?.gstin || businessProfile?.gst || businessProfile?.business_gstin || '').trim();
    }, [businessProfile]);

    const [returnType, setReturnType] = useState<ReturnType>('GSTR1');
    const [filingFrequency, setFilingFrequency] = useState<FilingFrequency>('MONTHLY');
    const [activeChip, setActiveChip] = useState<PeriodChip>('cm');
    const [periodFrom, setPeriodFrom] = useState('');
    const [periodTo, setPeriodTo] = useState('');
    const [generatedData, setGeneratedData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [savedReturns, setSavedReturns] = useState<any[]>([]);

    const formatDateLocal = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    useEffect(() => {
        // Set default dates to current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setPeriodFrom(formatDateLocal(firstDay));
        setPeriodTo(formatDateLocal(lastDay));
        setActiveChip('cm');

        fetchSavedReturns();
        if (typeof fetchInvoices === 'function') {
            fetchInvoices();
        }
        if (typeof fetchBusinessProfile === 'function') {
            fetchBusinessProfile();
        }
    }, []);

    const fetchSavedReturns = async () => {
        try {
            const response = await fetch('/api/gst-returns');
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setSavedReturns(data);
                }
            }
        } catch (error) {
            console.error('Error fetching saved returns:', error);
        }
    };

    const setQuickPeriod = (chip: PeriodChip) => {
        setActiveChip(chip);
        const now = new Date();
        let from: Date;
        let to: Date;

        if (chip === 'cm') {
            // Current month
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (chip === 'lm') {
            // Last month
            from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            to = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (chip === 'cq') {
            // Current quarter
            const q = Math.floor(now.getMonth() / 3);
            from = new Date(now.getFullYear(), q * 3, 1);
            to = new Date(now.getFullYear(), (q + 1) * 3, 0);
        } else {
            return;
        }

        setPeriodFrom(formatDateLocal(from));
        setPeriodTo(formatDateLocal(to));
    };

    // Calculate days span and label
    const { daysCount, periodLabel } = useMemo(() => {
        if (!periodFrom || !periodTo) {
            return { daysCount: 0, periodLabel: 'NO PERIOD SELECTED' };
        }
        const f = new Date(periodFrom);
        const t = new Date(periodTo);
        const diffTime = t.getTime() - f.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        let label = '';
        if (f.getMonth() === t.getMonth() && f.getFullYear() === t.getFullYear()) {
            label = `${months[f.getMonth()]} ${f.getFullYear()}`;
        } else {
            label = `${months[f.getMonth()]} ${f.getFullYear()} — ${months[t.getMonth()]} ${t.getFullYear()}`;
        }

        return {
            daysCount: isNaN(days) ? 0 : Math.max(1, days),
            periodLabel: label
        };
    }, [periodFrom, periodTo]);

    // Count matching invoices in selected date range
    const matchingInvoicesCount = useMemo(() => {
        if (!invoices || !Array.isArray(invoices)) return 0;
        if (!periodFrom || !periodTo) return invoices.length;

        const from = new Date(periodFrom).getTime();
        const to = new Date(periodTo).getTime() + 86400000; // inclusive

        return invoices.filter((inv: any) => {
            const raw = inv.invoice_date || inv.date || inv.created_at;
            if (!raw) return false;
            const d = new Date(raw).getTime();
            return !isNaN(d) && d >= from && d <= to;
        }).length;
    }, [invoices, periodFrom, periodTo]);

    const returnNames: Record<ReturnType, string> = {
        GSTR1: 'GSTR‑1',
        GSTR3B: 'GSTR‑3B',
        GSTR4: 'GSTR‑4',
    };

    const formIndexMap: Record<ReturnType, string> = {
        GSTR1: 'FORM 01',
        GSTR3B: 'FORM 02',
        GSTR4: 'FORM 03',
    };

    const handleGenerate = async () => {
        if (!userGSTIN) {
            toast.error('Please configure your GSTIN in Settings first!');
            return;
        }

        if (!periodFrom || !periodTo) {
            toast.error('Please select a valid date range');
            return;
        }

        setLoading(true);
        setGeneratedData(null);

        try {
            const endpoint = returnType === 'GSTR1' ? '/api/gst-returns/gstr1' :
                returnType === 'GSTR3B' ? '/api/gst-returns/gstr3b' :
                    '/api/gst-returns/gstr4';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ period_from: periodFrom, period_to: periodTo }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                if (result.data) {
                    setGeneratedData(result.data);
                    toast.success(`${returnNames[returnType]} generated successfully!`);
                } else {
                    toast.error(result.message || 'No invoices found for the selected period');
                }
            } else {
                console.error('Generation failed:', result);
                const errorMessage = result.details ? `${result.error}: ${result.details}` : result.error;
                toast.error(errorMessage || 'Failed to generate return');
            }
        } catch (error) {
            console.error('Error generating return:', error);
            toast.error('Failed to generate return. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!generatedData) return;

        const toastId = toast.loading('Saving draft return...');
        try {
            const response = await fetch('/api/gst-returns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    return_type: returnType,
                    period_from: periodFrom,
                    period_to: periodTo,
                    filing_frequency: filingFrequency,
                    generated_data: generatedData,
                    status: 'DRAFT',
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success('Return saved to ledger successfully!', { id: toastId });
                fetchSavedReturns();
            } else {
                toast.error(result.error || result.details || 'Failed to save return', { id: toastId });
            }
        } catch (error: any) {
            console.error('Error saving return:', error);
            toast.error(error.message || 'Failed to save return', { id: toastId });
        }
    };

    const handleDownloadJSON = async () => {
        if (!generatedData) return;

        const fileName = `${returnType}_${periodFrom}_to_${periodTo}.json`;
        const toastId = toast.loading('Preparing JSON download...');
        try {
            const dataStr = JSON.stringify(generatedData, null, 2);
            const base64Data = btoa(unescape(encodeURIComponent(dataStr)));
            const { downloadAndShareFile } = await import('@/lib/utils');
            await downloadAndShareFile(base64Data, fileName, 'application/json', 'view');
            toast.success(`✅ ${fileName} Downloaded!`, { id: toastId });
        } catch (err) {
            console.error('Error downloading JSON:', err);
            try {
                const dataStr = JSON.stringify(generatedData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.click();
                URL.revokeObjectURL(url);
                toast.success(`✅ ${fileName} Downloaded!`, { id: toastId });
            } catch (e) {
                toast.error('Failed to download JSON file', { id: toastId });
            }
        }
    };

    const handleDownloadExcel = async () => {
        if (!generatedData) return;

        const fileName = `${returnType}_${periodFrom}_to_${periodTo}.xlsx`;
        const toastId = toast.loading('Preparing Excel download...');
        try {
            const wb = XLSX.utils.book_new();

            if (returnType === 'GSTR1') {
                if (generatedData.b2b?.length) {
                    const ws = XLSX.utils.json_to_sheet(generatedData.b2b);
                    XLSX.utils.book_append_sheet(wb, ws, 'B2B');
                }
                if (generatedData.b2cl?.length) {
                    const ws = XLSX.utils.json_to_sheet(generatedData.b2cl);
                    XLSX.utils.book_append_sheet(wb, ws, 'B2CL');
                }
                if (generatedData.b2cs?.length) {
                    const ws = XLSX.utils.json_to_sheet(generatedData.b2cs);
                    XLSX.utils.book_append_sheet(wb, ws, 'B2CS');
                }
                if (generatedData.hsn?.length) {
                    const ws = XLSX.utils.json_to_sheet(generatedData.hsn);
                    XLSX.utils.book_append_sheet(wb, ws, 'HSN');
                }
            } else if (returnType === 'GSTR3B') {
                if (generatedData.outward_supplies) {
                    const ws = XLSX.utils.json_to_sheet([generatedData.outward_supplies]);
                    XLSX.utils.book_append_sheet(wb, ws, 'Outward Supplies');
                }
            } else if (returnType === 'GSTR4') {
                if (generatedData.supplies_made) {
                    const ws = XLSX.utils.json_to_sheet([
                        {
                            "Total Turnover": generatedData.total_turnover || 0,
                            "Total Tax Paid": generatedData.total_tax_paid || 0,
                            "Intra-State Supplies": generatedData.supplies_made.intra_state || 0,
                            "Inter-State Supplies": generatedData.supplies_made.inter_state || 0
                        }
                    ]);
                    XLSX.utils.book_append_sheet(wb, ws, 'Composition Summary');
                }
            }

            if (wb.SheetNames.length === 0) {
                const ws = XLSX.utils.json_to_sheet([{ message: "No data available" }]);
                XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            }

            const base64Data = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
            const { downloadAndShareFile } = await import('@/lib/utils');
            await downloadAndShareFile(
                base64Data,
                fileName,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'view'
            );
            toast.success(`✅ ${fileName} Downloaded!`, { id: toastId });
        } catch (error) {
            console.error('Error downloading excel:', error);
            try {
                XLSX.writeFile(wb, fileName);
                toast.success(`✅ ${fileName} Downloaded!`, { id: toastId });
            } catch (e) {
                toast.error('Failed to download Excel file', { id: toastId });
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return '₹' + new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: amount % 1 === 0 ? 0 : 2
        }).format(amount || 0);
    };

    return (
        <div className="gst-container">
            <div className="gst-device">

                {/* ---------- Top bar ---------- */}
                <div className="gst-topbar">
                    <div className="gst-brand">
                        <div className="gst-brand-mark">BG</div>
                        <div>
                            <div className="gst-brand-name">Billgst</div>
                            <div className="gst-brand-sub">GST Filing Suite</div>
                        </div>
                    </div>
                    <div className="gst-topbar-icons">
                        <Link href="/dashboard/settings" className="gst-icon-btn" title="Settings">
                            <FaCog />
                        </Link>
                        <Link href="/dashboard" className="gst-icon-btn" title="Dashboard">
                            <FaThLarge />
                        </Link>
                    </div>
                </div>

                {/* ---------- Hero ---------- */}
                <div className="gst-hero">
                    <div className="gst-hero-eyebrow">Filing / Returns</div>
                    <h1 className="gst-hero-title">GST Returns</h1>
                    <p className="gst-hero-desc">
                        Generate GSTR‑1, GSTR‑3B and GSTR‑4 straight from your sales &amp; purchase ledgers — no manual entry.
                    </p>
                    {userGSTIN ? (
                        <div className="gst-gstin-badge">
                            <b>GSTIN:</b> {userGSTIN}
                        </div>
                    ) : (
                        <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
                            <div className="gst-gstin-badge" style={{ borderColor: 'var(--brass-deep)', color: 'var(--brass-deep)', cursor: 'pointer' }}>
                                ⚠️ Configure GSTIN in Settings →
                            </div>
                        </Link>
                    )}
                </div>

                {/* ---------- Form Card ---------- */}
                <div className="gst-form-wrap">
                    <div className="gst-form-card">
                        <div className="gst-perf"></div>

                        <div className="gst-stamp">
                            <span>{generatedData ? 'RECONCILED\nREADY' : 'DRAFT\nNOT FILED'}</span>
                        </div>

                        <div className="gst-form-card-head">
                            <div className="gst-form-card-title">Configure Return</div>
                            <div className="gst-form-index">{formIndexMap[returnType]}</div>
                        </div>

                        {/* Return type */}
                        <div className="gst-field-group">
                            <span className="gst-field-label">Return type</span>
                            <div className="gst-tab-row">
                                <button
                                    type="button"
                                    className={`gst-tab ${returnType === 'GSTR1' ? 'active' : ''}`}
                                    onClick={() => setReturnType('GSTR1')}
                                >
                                    <span className="gst-tab-num">01</span>
                                    GSTR‑1
                                </button>
                                <button
                                    type="button"
                                    className={`gst-tab ${returnType === 'GSTR3B' ? 'active' : ''}`}
                                    onClick={() => setReturnType('GSTR3B')}
                                >
                                    <span className="gst-tab-num">02</span>
                                    GSTR‑3B
                                </button>
                                <button
                                    type="button"
                                    className={`gst-tab ${returnType === 'GSTR4' ? 'active' : ''}`}
                                    onClick={() => setReturnType('GSTR4')}
                                >
                                    <span className="gst-tab-num">03</span>
                                    GSTR‑4
                                </button>
                            </div>
                        </div>

                        {/* Filing frequency */}
                        <div className="gst-field-group">
                            <span className="gst-field-label">Filing frequency</span>
                            <div className="gst-seg-toggle">
                                <button
                                    type="button"
                                    className={`gst-seg-option ${filingFrequency === 'MONTHLY' ? 'active' : ''}`}
                                    onClick={() => setFilingFrequency('MONTHLY')}
                                >
                                    Monthly
                                </button>
                                <button
                                    type="button"
                                    className={`gst-seg-option ${filingFrequency === 'QUARTERLY' ? 'active' : ''}`}
                                    onClick={() => setFilingFrequency('QUARTERLY')}
                                >
                                    Quarterly
                                </button>
                            </div>
                        </div>

                        {/* Period Selection */}
                        <div className="gst-field-group">
                            <span className="gst-field-label">Select period</span>
                            <div className="gst-chip-row">
                                <button
                                    type="button"
                                    className={`gst-chip ${activeChip === 'cm' ? 'active' : ''}`}
                                    onClick={() => setQuickPeriod('cm')}
                                >
                                    Current month
                                </button>
                                <button
                                    type="button"
                                    className={`gst-chip ${activeChip === 'lm' ? 'active' : ''}`}
                                    onClick={() => setQuickPeriod('lm')}
                                >
                                    Last month
                                </button>
                                <button
                                    type="button"
                                    className={`gst-chip ${activeChip === 'cq' ? 'active' : ''}`}
                                    onClick={() => setQuickPeriod('cq')}
                                >
                                    Current quarter
                                </button>
                            </div>

                            <div className="gst-date-row">
                                <div className="gst-date-field">
                                    <span className="gst-date-field-label">From date</span>
                                    <div className="gst-date-input-wrap">
                                        <input
                                            type="date"
                                            value={periodFrom}
                                            onChange={(e) => {
                                                setPeriodFrom(e.target.value);
                                                setActiveChip('custom');
                                            }}
                                            className="gst-date-input-native"
                                        />
                                    </div>
                                </div>
                                <div className="gst-date-field">
                                    <span className="gst-date-field-label">To date</span>
                                    <div className="gst-date-input-wrap">
                                        <input
                                            type="date"
                                            value={periodTo}
                                            onChange={(e) => {
                                                setPeriodTo(e.target.value);
                                                setActiveChip('custom');
                                            }}
                                            className="gst-date-input-native"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="gst-period-span">
                                FILING PERIOD SPANS <b>{daysCount} DAYS</b> · {periodLabel}
                            </div>
                        </div>

                        {/* Status Strip */}
                        <div className="gst-status-strip">
                            <div className="gst-status-dot"></div>
                            <div className="gst-status-text">
                                <b>{matchingInvoicesCount} invoices</b> found in this period, ready to reconcile before generating.
                            </div>
                        </div>
                    </div>

                    {/* ---------- Generated Data Preview Card ---------- */}
                    {generatedData && (
                        <div className="gst-preview-card">
                            <div className="gst-perf"></div>
                            <div className="gst-preview-head">
                                <div>
                                    <div className="gst-form-card-title" style={{ fontSize: '18px' }}>
                                        {returnNames[returnType]} Generated Preview
                                    </div>
                                    <div className="gst-form-index">
                                        {periodFrom} TO {periodTo}
                                    </div>
                                </div>
                                <div className="gst-actions-row">
                                    <button onClick={handleSave} className="gst-btn-action gst-btn-save">
                                        <FaCheckCircle /> Save Draft
                                    </button>
                                    <button onClick={handleDownloadJSON} className="gst-btn-action gst-btn-json">
                                        <FaDownload /> JSON
                                    </button>
                                    <button onClick={handleDownloadExcel} className="gst-btn-action gst-btn-excel">
                                        <FaFileExcel /> Excel
                                    </button>
                                </div>
                            </div>

                            {/* GSTR-1 Metrics & Tables */}
                            {returnType === 'GSTR1' && (
                                <>
                                    <div className="gst-metric-grid">
                                        <div className="gst-metric-item">
                                            <div className="gst-metric-label">B2B Invoices</div>
                                            <div className="gst-metric-val">{generatedData.b2b?.length || 0}</div>
                                        </div>
                                        <div className="gst-metric-item">
                                            <div className="gst-metric-label">B2C Large</div>
                                            <div className="gst-metric-val">{generatedData.b2cl?.length || 0}</div>
                                        </div>
                                        <div className="gst-metric-item">
                                            <div className="gst-metric-label">B2C Small</div>
                                            <div className="gst-metric-val">{generatedData.b2cs?.length || 0}</div>
                                        </div>
                                        <div className="gst-metric-item">
                                            <div className="gst-metric-label">HSN Codes</div>
                                            <div className="gst-metric-val">{generatedData.hsn?.length || 0}</div>
                                        </div>
                                    </div>

                                    {/* B2B Table */}
                                    {generatedData.b2b && generatedData.b2b.length > 0 && (
                                        <div className="gst-table-section">
                                            <div className="gst-section-title">
                                                <span>B2B Invoices</span>
                                                <span className="gst-form-index">{generatedData.b2b.length} Records</span>
                                            </div>
                                            <div className="gst-table-wrap">
                                                <table className="gst-ledger-table">
                                                    <thead>
                                                        <tr>
                                                            <th>GSTIN</th>
                                                            <th>Customer</th>
                                                            <th>Inv No</th>
                                                            <th>Date</th>
                                                            <th className="t-num">Taxable</th>
                                                            <th className="t-num">IGST</th>
                                                            <th className="t-num">CGST</th>
                                                            <th className="t-num">SGST</th>
                                                            <th className="t-num">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {generatedData.b2b.map((inv: any, idx: number) => (
                                                            <tr key={idx}>
                                                                <td className="t-mono">{inv.gstin}</td>
                                                                <td>{inv.customer_name}</td>
                                                                <td className="t-mono">{inv.invoice_number}</td>
                                                                <td className="t-mono">
                                                                    {new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                                </td>
                                                                <td className="t-num">{formatCurrency(inv.taxable_value)}</td>
                                                                <td className="t-num">{inv.igst_amount > 0 ? formatCurrency(inv.igst_amount) : '—'}</td>
                                                                <td className="t-num">{inv.cgst_amount > 0 ? formatCurrency(inv.cgst_amount) : '—'}</td>
                                                                <td className="t-num">{inv.sgst_amount > 0 ? formatCurrency(inv.sgst_amount) : '—'}</td>
                                                                <td className="t-num"><b>{formatCurrency(inv.invoice_value)}</b></td>
                                                            </tr>
                                                        ))}
                                                        <tr className="t-foot">
                                                            <td colSpan={4}>TOTAL</td>
                                                            <td className="t-num">
                                                                {formatCurrency(generatedData.b2b.reduce((s: number, i: any) => s + (i.taxable_value || 0), 0))}
                                                            </td>
                                                            <td className="t-num">
                                                                {formatCurrency(generatedData.b2b.reduce((s: number, i: any) => s + (i.igst_amount || 0), 0))}
                                                            </td>
                                                            <td className="t-num">
                                                                {formatCurrency(generatedData.b2b.reduce((s: number, i: any) => s + (i.cgst_amount || 0), 0))}
                                                            </td>
                                                            <td className="t-num">
                                                                {formatCurrency(generatedData.b2b.reduce((s: number, i: any) => s + (i.sgst_amount || 0), 0))}
                                                            </td>
                                                            <td className="t-num">
                                                                <b>{formatCurrency(generatedData.b2b.reduce((s: number, i: any) => s + (i.invoice_value || 0), 0))}</b>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* HSN Table */}
                                    {generatedData.hsn && generatedData.hsn.length > 0 && (
                                        <div className="gst-table-section">
                                            <div className="gst-section-title">
                                                <span>HSN-Wise Summary</span>
                                                <span className="gst-form-index">{generatedData.hsn.length} Items</span>
                                            </div>
                                            <div className="gst-table-wrap">
                                                <table className="gst-ledger-table">
                                                    <thead>
                                                        <tr>
                                                            <th>HSN</th>
                                                            <th>Description</th>
                                                            <th>Qty</th>
                                                            <th className="t-num">Taxable</th>
                                                            <th className="t-num">Rate</th>
                                                            <th className="t-num">Tax (IGST/CGST/SGST)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {generatedData.hsn.map((h: any, idx: number) => (
                                                            <tr key={idx}>
                                                                <td className="t-mono"><b>{h.hsn_code}</b></td>
                                                                <td>{h.description}</td>
                                                                <td className="t-mono">{h.total_quantity} {h.uqc}</td>
                                                                <td className="t-num">{formatCurrency(h.taxable_value)}</td>
                                                                <td className="t-num">{h.rate}%</td>
                                                                <td className="t-num">
                                                                    {formatCurrency((h.igst_amount || 0) + (h.cgst_amount || 0) + (h.sgst_amount || 0))}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* GSTR-3B Metrics & Breakdown */}
                            {returnType === 'GSTR3B' && generatedData?.outward_supplies && (
                                <>
                                    <div className="gst-metric-grid">
                                        <div className="gst-metric-item">
                                            <div className="gst-metric-label">Taxable Value</div>
                                            <div className="gst-metric-val">
                                                {formatCurrency(generatedData.outward_supplies.taxable_value)}
                                            </div>
                                        </div>
                                        <div className="gst-metric-item">
                                            <div className="gst-metric-label">IGST</div>
                                            <div className="gst-metric-val">
                                                {formatCurrency(generatedData.total_tax_liability?.igst || generatedData.outward_supplies.igst || 0)}
                                            </div>
                                        </div>
                                        <div className="gst-metric-item">
                                            <div className="gst-metric-label">CGST</div>
                                            <div className="gst-metric-val">
                                                {formatCurrency(generatedData.total_tax_liability?.cgst || generatedData.outward_supplies.cgst || 0)}
                                            </div>
                                        </div>
                                        <div className="gst-metric-item">
                                            <div className="gst-metric-label">SGST</div>
                                            <div className="gst-metric-val">
                                                {formatCurrency(generatedData.total_tax_liability?.sgst || generatedData.outward_supplies.sgst || 0)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="gst-table-section">
                                        <div className="gst-section-title">
                                            <span>Tax Liability Breakdown</span>
                                        </div>
                                        <div className="gst-table-wrap">
                                            <table className="gst-ledger-table">
                                                <thead>
                                                    <tr>
                                                        <th>Nature of Supply</th>
                                                        <th className="t-num">Taxable Value</th>
                                                        <th className="t-num">IGST</th>
                                                        <th className="t-num">CGST</th>
                                                        <th className="t-num">SGST</th>
                                                        <th className="t-num">Total Tax</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td><b>(a) Outward taxable supplies</b></td>
                                                        <td className="t-num">{formatCurrency(generatedData.outward_supplies.taxable_value)}</td>
                                                        <td className="t-num">{formatCurrency(generatedData.outward_supplies.igst || 0)}</td>
                                                        <td className="t-num">{formatCurrency(generatedData.outward_supplies.cgst || 0)}</td>
                                                        <td className="t-num">{formatCurrency(generatedData.outward_supplies.sgst || 0)}</td>
                                                        <td className="t-num">
                                                            <b>{formatCurrency((generatedData.outward_supplies.igst || 0) + (generatedData.outward_supplies.cgst || 0) + (generatedData.outward_supplies.sgst || 0))}</b>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* GSTR-4 Composition Display */}
                            {returnType === 'GSTR4' && generatedData?.total_turnover !== undefined && (
                                <>
                                    <div className="gst-metric-grid">
                                        <div className="gst-metric-item">
                                            <div className="gst-metric-label">Total Turnover</div>
                                            <div className="gst-metric-val">{formatCurrency(generatedData.total_turnover)}</div>
                                        </div>
                                        <div className="gst-metric-item">
                                            <div className="gst-metric-label">Total Tax Paid</div>
                                            <div className="gst-metric-val">{formatCurrency(generatedData.total_tax_paid)}</div>
                                        </div>
                                        <div className="gst-metric-item">
                                            <div className="gst-metric-label">Intra-State</div>
                                            <div className="gst-metric-val">{formatCurrency(generatedData.supplies_made?.intra_state || 0)}</div>
                                        </div>
                                        <div className="gst-metric-item">
                                            <div className="gst-metric-label">Inter-State</div>
                                            <div className="gst-metric-val">{formatCurrency(generatedData.supplies_made?.inter_state || 0)}</div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Raw JSON inspection */}
                            <details className="gst-json-details">
                                <summary>View Raw JSON Data</summary>
                                <pre>{JSON.stringify(generatedData, null, 2)}</pre>
                            </details>
                        </div>
                    )}

                    {/* ---------- Saved Returns Card ---------- */}
                    {savedReturns.length > 0 && (
                        <div className="gst-preview-card">
                            <div className="gst-perf"></div>
                            <div className="gst-form-card-head">
                                <div className="gst-form-card-title" style={{ fontSize: '18px' }}>Saved Returns History</div>
                                <div className="gst-form-index">{savedReturns.length} RETURNS</div>
                            </div>
                            <div className="gst-saved-list">
                                {savedReturns.map((ret: any) => (
                                    <div key={ret.id} className="gst-saved-item">
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                                                {ret.return_type}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--ink-soft)', fontFamily: 'IBM Plex Mono, monospace', marginTop: '2px' }}>
                                                {new Date(ret.period_from).toLocaleDateString('en-IN')} — {new Date(ret.period_to).toLocaleDateString('en-IN')}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className={`gst-pill ${ret.status === 'FILED' ? 'gst-pill-filed' : 'gst-pill-draft'}`}>
                                                {ret.status || 'DRAFT'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ---------- Sticky CTA Action Bar ---------- */}
                <div className="gst-cta-wrap">
                    <button
                        className="gst-cta-btn"
                        id="generateBtn"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>Generating {returnNames[returnType]}...</span>
                            </>
                        ) : (
                            <>
                                <span className="gst-seal">✓</span>
                                <span>Generate {returnNames[returnType]}</span>
                            </>
                        )}
                    </button>
                    <div className="gst-cta-note">
                        DUE BY 11TH OF NEXT MONTH — NO DATA LEAVES YOUR DEVICE UNTIL YOU FILE
                    </div>
                </div>

            </div>
        </div>
    );
}
