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
                setGeneratedData(result.data);
                toast.success(`${returnType} generated successfully!`);
            } else {
                toast.error(result.error || 'Failed to generate return');
            }
        } catch (error) {
            console.error('Error generating return:', error);
            toast.error('Failed to generate return');
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
        <div className="space-y-6 px-4 md:px-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">GST Returns</h1>
                    <p className="text-gray-500 text-sm mt-1">Generate GSTR-1, GSTR-3B & GSTR-4 returns automatically</p>
                </div>
                {businessProfile.gstin && (
                    <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                        <span className="font-bold">GSTIN:</span> {businessProfile.gstin}
                    </div>
                )}
            </div>

            {/* Configuration Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Configure Return</h2>

                {/* Return Type Selector */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Return Type</label>
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
                    <label className="block text-sm font-bold text-gray-700 mb-3">Filing Frequency</label>
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
                    <label className="block text-sm font-bold text-gray-700 mb-3">Period</label>

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
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">Generated Return Preview</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                            >
                                <FaCheckCircle />
                                Save Draft
                            </button>
                            <button
                                onClick={handleDownloadJSON}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <FaDownload />
                                Download JSON
                            </button>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    {returnType === 'GSTR1' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="text-xs text-blue-600 font-bold mb-1">B2B Invoices</div>
                                <div className="text-2xl font-bold text-gray-800">{generatedData.b2b?.length || 0}</div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                <div className="text-xs text-green-600 font-bold mb-1">B2C Large</div>
                                <div className="text-2xl font-bold text-gray-800">{generatedData.b2cl?.length || 0}</div>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                <div className="text-xs text-yellow-600 font-bold mb-1">B2C Small</div>
                                <div className="text-2xl font-bold text-gray-800">{generatedData.b2cs?.length || 0}</div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <div className="text-xs text-purple-600 font-bold mb-1">HSN Codes</div>
                                <div className="text-2xl font-bold text-gray-800">{generatedData.hsn?.length || 0}</div>
                            </div>
                        </div>
                    )}

                    {/* JSON Preview */}
                    <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-auto">
                        <pre className="text-xs text-gray-700 font-mono">
                            {JSON.stringify(generatedData, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {/* Saved Returns */}
            {savedReturns.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Saved Returns</h2>
                    <div className="space-y-2">
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
    );
}
