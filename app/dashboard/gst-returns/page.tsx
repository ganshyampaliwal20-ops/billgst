'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaDownload, FaFileExcel, FaFilePdf, FaCalendarAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

type ReturnType = 'GSTR1' | 'GSTR3B' | 'GSTR4';
type FilingFrequency = 'MONTHLY' | 'QUARTERLY';

export default function GSTReturnsPage() {
    const businessProfile = useStore((state: any) => state.businessProfile);

    const [returnType, setReturnType] = useState<ReturnType>('GSTR1');
    const [filingFrequency, setFilingFrequency] = useState<FilingFrequency>('MONTHLY');
    const [periodFrom, setPeriodFrom] = useState('');
    const [periodTo, setPeriodTo] = useState('');
    const [generatedData, setGeneratedData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [savedReturns, setSavedReturns] = useState<any[]>([]);

    useEffect(() => {
        // Set default dates to current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setPeriodFrom(firstDay.toISOString().split('T')[0]);
        setPeriodTo(lastDay.toISOString().split('T')[0]);

        fetchSavedReturns();
    }, []);

    const fetchSavedReturns = async () => {
        try {
            const response = await fetch('/api/gst-returns');
            if (response.ok) {
                const data = await response.json();
                setSavedReturns(data);
            }
        } catch (error) {
            console.error('Error fetching saved returns:', error);
        }
    };

    const handleGenerate = async () => {
        if (!businessProfile.gstin) {
            toast.error('Please configure your GSTIN in Settings first!');
            return;
        }

        if (!periodFrom || !periodTo) {
            toast.error('Please select date range');
            return;
        }

        setLoading(true);
        setGeneratedData(null); // Clear previous data

        try {
            const endpoint = returnType === 'GSTR1' ? '/api/gst-returns/gstr1' :
                returnType === 'GSTR3B' ? '/api/gst-returns/gstr3b' :
                    '/api/gst-returns/gstr4';

            console.log('Generating return:', { returnType, endpoint, periodFrom, periodTo });

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ period_from: periodFrom, period_to: periodTo }),
            });

            const result = await response.json();
            console.log('Generation result:', result);

            if (response.ok && result.success) {
                if (result.data) {
                    setGeneratedData(result.data);
                    toast.success(`${returnType} generated successfully!`);
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
            toast.error('Failed to generate return. Please check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!generatedData) return;

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
                toast.success('Return saved successfully!');
                fetchSavedReturns();
            } else {
                toast.error('Failed to save return');
            }
        } catch (error) {
            console.error('Error saving return:', error);
            toast.error('Failed to save return');
        }
    };

    const handleDownloadJSON = () => {
        if (!generatedData) return;

        const dataStr = JSON.stringify(generatedData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${returnType}_${periodFrom}_to_${periodTo}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('JSON downloaded!');
    };

    const setQuickPeriod = (type: 'current_month' | 'last_month' | 'current_quarter') => {
        const now = new Date();
        let from, to;

        if (type === 'current_month') {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (type === 'last_month') {
            from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            to = new Date(now.getFullYear(), now.getMonth(), 0);
        } else {
            // Current quarter
            const currentQuarter = Math.floor(now.getMonth() / 3);
            from = new Date(now.getFullYear(), currentQuarter * 3, 1);
            to = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        }

        setPeriodFrom(from.toISOString().split('T')[0]);
        setPeriodTo(to.toISOString().split('T')[0]);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">GST Returns</h1>
                        <p className="text-gray-500 text-sm mt-2">Generate GSTR-1, GSTR-3B & GSTR-4 returns automatically</p>
                    </div>
                    {businessProfile.gstin && (
                        <div className="text-sm text-gray-700 bg-blue-50 px-5 py-3 rounded-xl border-2 border-blue-200 shadow-sm">
                            <span className="font-bold text-blue-700">GSTIN:</span> <span className="font-mono ml-2">{businessProfile.gstin}</span>
                        </div>
                    )}
                </div>

                {/* Configuration Panel */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 space-y-8">
                    <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-3">Configure Return</h2>

                    {/* Return Type Selector */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-4">Select Return Type</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { value: 'GSTR1', label: 'GSTR-1', desc: 'Outward Supplies' },
                                { value: 'GSTR3B', label: 'GSTR-3B', desc: 'Summary Return' },
                                { value: 'GSTR4', label: 'GSTR-4', desc: 'Composition Scheme' },
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setReturnType(type.value as ReturnType)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${returnType === type.value
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="font-bold text-gray-800">{type.label}</div>
                                    <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filing Frequency */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-4">Filing Frequency</label>
                        <div className="flex gap-4">
                            {['MONTHLY', 'QUARTERLY'].map((freq) => (
                                <button
                                    key={freq}
                                    onClick={() => setFilingFrequency(freq as FilingFrequency)}
                                    className={`px-6 py-3 rounded-xl border-2 transition-all font-medium ${filingFrequency === freq
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {freq}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-4">Select Period</label>

                        {/* Quick Period Buttons */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <button
                                onClick={() => setQuickPeriod('current_month')}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition"
                            >
                                Current Month
                            </button>
                            <button
                                onClick={() => setQuickPeriod('last_month')}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition"
                            >
                                Last Month
                            </button>
                            <button
                                onClick={() => setQuickPeriod('current_quarter')}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition"
                            >
                                Current Quarter
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">From Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={periodFrom}
                                        onChange={(e) => setPeriodFrom(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                    <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">To Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={periodTo}
                                        onChange={(e) => setPeriodTo(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                    <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FaCheckCircle />
                                Generate {returnType}
                            </>
                        )}
                    </button>
                </div>

                {/* Generated Data Preview */}
                {generatedData && (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Generated Return Preview</h2>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    <FaCheckCircle />
                                    Save Draft
                                </button>
                                <button
                                    onClick={handleDownloadJSON}
                                    className="px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    <FaDownload />
                                    Download JSON
                                </button>
                            </div>
                        </div>

                        {/* GSTR-1 Professional Display */}
                        {returnType === 'GSTR1' && (
                            <div className="space-y-8">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                        <div className="text-xs text-blue-700 font-bold mb-1">B2B Invoices</div>
                                        <div className="text-2xl font-bold text-blue-900">{generatedData.b2b?.length || 0}</div>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                        <div className="text-xs text-green-700 font-bold mb-1">B2C Large</div>
                                        <div className="text-2xl font-bold text-green-900">{generatedData.b2cl?.length || 0}</div>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                                        <div className="text-xs text-yellow-700 font-bold mb-1">B2C Small</div>
                                        <div className="text-2xl font-bold text-yellow-900">{generatedData.b2cs?.length || 0}</div>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                        <div className="text-xs text-purple-700 font-bold mb-1">HSN Codes</div>
                                        <div className="text-2xl font-bold text-purple-900">{generatedData.hsn?.length || 0}</div>
                                    </div>
                                </div>

                                {/* B2B Invoices Table */}
                                {generatedData.b2b && generatedData.b2b.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                            B2B Invoices (Business to Business)
                                        </h3>
                                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-bold">GSTIN</th>
                                                        <th className="px-4 py-3 text-left font-bold">Customer Name</th>
                                                        <th className="px-4 py-3 text-left font-bold">Invoice No.</th>
                                                        <th className="px-4 py-3 text-left font-bold">Date</th>
                                                        <th className="px-4 py-3 text-right font-bold">Taxable Value</th>
                                                        <th className="px-4 py-3 text-right font-bold">IGST</th>
                                                        <th className="px-4 py-3 text-right font-bold">CGST</th>
                                                        <th className="px-4 py-3 text-right font-bold">SGST</th>
                                                        <th className="px-4 py-3 text-right font-bold">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {generatedData.b2b.map((invoice: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-blue-50 transition">
                                                            <td className="px-4 py-3 font-mono text-xs">{invoice.gstin}</td>
                                                            <td className="px-4 py-3 font-medium">{invoice.customer_name}</td>
                                                            <td className="px-4 py-3 font-mono text-xs">{invoice.invoice_number}</td>
                                                            <td className="px-4 py-3 text-gray-600">{new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</td>
                                                            <td className="px-4 py-3 text-right font-semibold">₹{invoice.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right text-orange-600">₹{invoice.igst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right text-green-600">₹{invoice.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right text-blue-600">₹{invoice.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right font-bold text-gray-900">₹{invoice.invoice_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-blue-100 font-bold">
                                                        <td colSpan={4} className="px-4 py-3 text-right">Total</td>
                                                        <td className="px-4 py-3 text-right">₹{generatedData.b2b.reduce((sum: number, inv: any) => sum + inv.taxable_value, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-right text-orange-700">₹{generatedData.b2b.reduce((sum: number, inv: any) => sum + inv.igst_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-right text-green-700">₹{generatedData.b2b.reduce((sum: number, inv: any) => sum + inv.cgst_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-right text-blue-700">₹{generatedData.b2b.reduce((sum: number, inv: any) => sum + inv.sgst_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-right text-gray-900">₹{generatedData.b2b.reduce((sum: number, inv: any) => sum + inv.invoice_value, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* B2CL Invoices Table */}
                                {generatedData.b2cl && generatedData.b2cl.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                            B2CL Invoices (B2C Large - Above ₹2.5 Lakh)
                                        </h3>
                                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-bold">Invoice No.</th>
                                                        <th className="px-4 py-3 text-left font-bold">Date</th>
                                                        <th className="px-4 py-3 text-left font-bold">Place of Supply</th>
                                                        <th className="px-4 py-3 text-right font-bold">Rate</th>
                                                        <th className="px-4 py-3 text-right font-bold">Taxable Value</th>
                                                        <th className="px-4 py-3 text-right font-bold">IGST</th>
                                                        <th className="px-4 py-3 text-right font-bold">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {generatedData.b2cl.map((invoice: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-green-50 transition">
                                                            <td className="px-4 py-3 font-mono text-xs">{invoice.invoice_number}</td>
                                                            <td className="px-4 py-3 text-gray-600">{new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</td>
                                                            <td className="px-4 py-3">{invoice.place_of_supply}</td>
                                                            <td className="px-4 py-3 text-right">{invoice.rate}%</td>
                                                            <td className="px-4 py-3 text-right font-semibold">₹{invoice.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right text-orange-600">₹{invoice.igst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right font-bold text-gray-900">₹{invoice.invoice_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-green-100 font-bold">
                                                        <td colSpan={4} className="px-4 py-3 text-right">Total</td>
                                                        <td className="px-4 py-3 text-right">₹{generatedData.b2cl.reduce((sum: number, inv: any) => sum + inv.taxable_value, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-right text-orange-700">₹{generatedData.b2cl.reduce((sum: number, inv: any) => sum + inv.igst_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-right text-gray-900">₹{generatedData.b2cl.reduce((sum: number, inv: any) => sum + inv.invoice_value, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* B2CS Summary Table */}
                                {generatedData.b2cs && generatedData.b2cs.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                                            B2CS Summary (B2C Small - Below ₹2.5 Lakh)
                                        </h3>
                                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-bold">Type</th>
                                                        <th className="px-4 py-3 text-left font-bold">Place of Supply</th>
                                                        <th className="px-4 py-3 text-right font-bold">Rate</th>
                                                        <th className="px-4 py-3 text-right font-bold">Taxable Value</th>
                                                        <th className="px-4 py-3 text-right font-bold">IGST</th>
                                                        <th className="px-4 py-3 text-right font-bold">CGST</th>
                                                        <th className="px-4 py-3 text-right font-bold">SGST</th>
                                                        <th className="px-4 py-3 text-right font-bold">Total Tax</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {generatedData.b2cs.map((summary: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-yellow-50 transition">
                                                            <td className="px-4 py-3">
                                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">{summary.type}</span>
                                                            </td>
                                                            <td className="px-4 py-3">{summary.place_of_supply}</td>
                                                            <td className="px-4 py-3 text-right">{summary.rate}%</td>
                                                            <td className="px-4 py-3 text-right font-semibold">₹{summary.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right text-orange-600">₹{summary.igst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right text-green-600">₹{summary.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right text-blue-600">₹{summary.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right font-bold text-gray-900">₹{(summary.igst_amount + summary.cgst_amount + summary.sgst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-yellow-100 font-bold">
                                                        <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                                                        <td className="px-4 py-3 text-right">₹{generatedData.b2cs.reduce((sum: number, s: any) => sum + s.taxable_value, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-right text-orange-700">₹{generatedData.b2cs.reduce((sum: number, s: any) => sum + s.igst_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-right text-green-700">₹{generatedData.b2cs.reduce((sum: number, s: any) => sum + s.cgst_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-right text-blue-700">₹{generatedData.b2cs.reduce((sum: number, s: any) => sum + s.sgst_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-right text-gray-900">₹{generatedData.b2cs.reduce((sum: number, s: any) => sum + s.igst_amount + s.cgst_amount + s.sgst_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* HSN Summary Table */}
                                {generatedData.hsn && generatedData.hsn.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                                            HSN-wise Summary of Outward Supplies
                                        </h3>
                                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-bold">HSN Code</th>
                                                        <th className="px-4 py-3 text-left font-bold">Description</th>
                                                        <th className="px-4 py-3 text-center font-bold">UQC</th>
                                                        <th className="px-4 py-3 text-right font-bold">Quantity</th>
                                                        <th className="px-4 py-3 text-right font-bold">Taxable Value</th>
                                                        <th className="px-4 py-3 text-right font-bold">Rate</th>
                                                        <th className="px-4 py-3 text-right font-bold">IGST</th>
                                                        <th className="px-4 py-3 text-right font-bold">CGST</th>
                                                        <th className="px-4 py-3 text-right font-bold">SGST</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {generatedData.hsn.map((hsn: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-purple-50 transition">
                                                            <td className="px-4 py-3 font-mono font-bold text-purple-700">{hsn.hsn_code}</td>
                                                            <td className="px-4 py-3">{hsn.description}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">{hsn.uqc}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">{hsn.total_quantity}</td>
                                                            <td className="px-4 py-3 text-right font-semibold">₹{hsn.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right">{hsn.rate}%</td>
                                                            <td className="px-4 py-3 text-right text-orange-600">₹{hsn.igst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right text-green-600">₹{hsn.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-4 py-3 text-right text-blue-600">₹{hsn.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-purple-100 font-bold">
                                                        <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                                                        <td className="px-4 py-3 text-right">{generatedData.hsn.reduce((sum: number, h: any) => sum + h.total_quantity, 0)}</td>
                                                        <td className="px-4 py-3 text-right">₹{generatedData.hsn.reduce((sum: number, h: any) => sum + h.taxable_value, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3"></td>
                                                        <td className="px-4 py-3 text-right text-orange-700">₹{generatedData.hsn.reduce((sum: number, h: any) => sum + h.igst_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-right text-green-700">₹{generatedData.hsn.reduce((sum: number, h: any) => sum + h.cgst_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-4 py-3 text-right text-blue-700">₹{generatedData.hsn.reduce((sum: number, h: any) => sum + h.sgst_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* GSTR-3B Professional Display */}
                        {returnType === 'GSTR3B' && (
                            <div className="space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm">
                                        <div className="text-xs text-blue-700 font-bold mb-2">Taxable Value</div>
                                        <div className="text-2xl font-bold text-blue-900">₹{generatedData.outward_supplies.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 shadow-sm">
                                        <div className="text-xs text-orange-700 font-bold mb-2">IGST</div>
                                        <div className="text-2xl font-bold text-orange-900">₹{generatedData.total_tax_liability.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 shadow-sm">
                                        <div className="text-xs text-green-700 font-bold mb-2">CGST</div>
                                        <div className="text-2xl font-bold text-green-900">₹{generatedData.total_tax_liability.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-200 shadow-sm">
                                        <div className="text-xs text-indigo-700 font-bold mb-2">SGST</div>
                                        <div className="text-2xl font-bold text-indigo-900">₹{generatedData.total_tax_liability.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>

                                {/* Total Tax Liability */}
                                <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white text-center">
                                    <div className="text-sm font-bold mb-2">Total Tax Liability</div>
                                    <div className="text-4xl font-bold">₹{(generatedData.total_tax_liability.igst + generatedData.total_tax_liability.cgst + generatedData.total_tax_liability.sgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                </div>

                                {/* Detailed Summary Table */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-bold text-gray-800">Tax Liability Breakdown</h3>
                                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-bold">Description</th>
                                                    <th className="px-4 py-3 text-right font-bold">Taxable Value</th>
                                                    <th className="px-4 py-3 text-right font-bold">IGST</th>
                                                    <th className="px-4 py-3 text-right font-bold">CGST</th>
                                                    <th className="px-4 py-3 text-right font-bold">SGST</th>
                                                    <th className="px-4 py-3 text-right font-bold">Total Tax</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white">
                                                <tr className="hover:bg-indigo-50 transition">
                                                    <td className="px-4 py-4 font-bold text-gray-800">Outward Taxable Supplies</td>
                                                    <td className="px-4 py-4 text-right font-semibold">₹{generatedData.outward_supplies.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-4 text-right text-orange-600 font-semibold">₹{generatedData.outward_supplies.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-4 text-right text-green-600 font-semibold">₹{generatedData.outward_supplies.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-4 text-right text-blue-600 font-semibold">₹{generatedData.outward_supplies.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-4 text-right font-bold text-gray-900">₹{(generatedData.outward_supplies.igst + generatedData.outward_supplies.cgst + generatedData.outward_supplies.sgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* GSTR-4 Professional Display */}
                        {returnType === 'GSTR4' && (
                            <div className="space-y-6">
                                {/* Main Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 shadow-sm">
                                        <div className="text-sm text-emerald-700 font-bold mb-2">Total Turnover</div>
                                        <div className="text-3xl font-bold text-emerald-900">₹{generatedData.total_turnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl border-2 border-rose-200 shadow-sm">
                                        <div className="text-sm text-rose-700 font-bold mb-2">Total Tax Paid</div>
                                        <div className="text-3xl font-bold text-rose-900">₹{generatedData.total_tax_paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>

                                {/* State-wise Breakdown */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-bold text-gray-800">Supply Breakdown</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                            <div className="text-xs text-blue-700 font-bold mb-2">Intra-State Supplies</div>
                                            <div className="text-2xl font-bold text-blue-900">₹{generatedData.supplies_made.intra_state.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                            <div className="mt-2 text-xs text-blue-600">
                                                {((generatedData.supplies_made.intra_state / generatedData.total_turnover) * 100).toFixed(1)}% of total
                                            </div>
                                        </div>
                                        <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                            <div className="text-xs text-purple-700 font-bold mb-2">Inter-State Supplies</div>
                                            <div className="text-2xl font-bold text-purple-900">₹{generatedData.supplies_made.inter_state.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                            <div className="mt-2 text-xs text-purple-600">
                                                {((generatedData.supplies_made.inter_state / generatedData.total_turnover) * 100).toFixed(1)}% of total
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Table */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-bold text-gray-800">Composition Scheme Summary</h3>
                                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-bold">Particulars</th>
                                                    <th className="px-4 py-3 text-right font-bold">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                <tr className="hover:bg-emerald-50 transition">
                                                    <td className="px-4 py-3 font-medium">Total Turnover</td>
                                                    <td className="px-4 py-3 text-right font-bold text-emerald-700">₹{generatedData.total_turnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                                <tr className="hover:bg-emerald-50 transition">
                                                    <td className="px-4 py-3 font-medium">Total Tax Paid</td>
                                                    <td className="px-4 py-3 text-right font-bold text-rose-700">₹{generatedData.total_tax_paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                                <tr className="hover:bg-emerald-50 transition">
                                                    <td className="px-4 py-3 font-medium">Intra-State Supplies</td>
                                                    <td className="px-4 py-3 text-right font-semibold">₹{generatedData.supplies_made.intra_state.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                                <tr className="hover:bg-emerald-50 transition">
                                                    <td className="px-4 py-3 font-medium">Inter-State Supplies</td>
                                                    <td className="px-4 py-3 text-right font-semibold">₹{generatedData.supplies_made.inter_state.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                                <tr className="bg-emerald-100">
                                                    <td className="px-4 py-4 font-bold">Effective Tax Rate</td>
                                                    <td className="px-4 py-4 text-right font-bold text-gray-900">{((generatedData.total_tax_paid / generatedData.total_turnover) * 100).toFixed(2)}%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* View JSON Toggle */}
                        <details className="bg-gray-50 rounded-xl border border-gray-200">
                            <summary className="px-4 py-3 cursor-pointer font-bold text-gray-700 hover:bg-gray-100 transition rounded-xl">
                                View Raw JSON Data
                            </summary>
                            <div className="p-4 max-h-96 overflow-auto">
                                <pre className="text-xs text-gray-700 font-mono">
                                    {JSON.stringify(generatedData, null, 2)}
                                </pre>
                            </div>
                        </details>
                    </div>
                )}

                {/* Saved Returns */}
                {savedReturns.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">Saved Returns</h2>
                        <div className="space-y-3">
                            {savedReturns.map((ret) => (
                                <div key={ret.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-gray-800">{ret.return_type}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(ret.period_from).toLocaleDateString()} - {new Date(ret.period_to).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${ret.status === 'FILED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {ret.status}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(ret.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
