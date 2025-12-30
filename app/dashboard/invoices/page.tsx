'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaFilePdf, FaWhatsapp, FaTrash, FaPlus, FaSearch, FaFileInvoiceDollar } from 'react-icons/fa';
import Link from 'next/link';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { toast } from 'react-hot-toast';
import { DOC_LABELS, DOC_TYPES } from '@/lib/constants';

interface InvoiceItem {
    product_name: string;
    quantity: number;
    unit_price: number;
}

interface Invoice {
    id: string;
    invoice_number: string;
    invoice_date: string | Date;
    created_at?: string;
    customer: {
        name: string;
    };
    total_amount: number;
    status: string;
    paid_amount: number;
    items: InvoiceItem[];
    type?: string;
}

export default function InvoicesPage() {
    // Select state individually for safety
    const invoices = useStore((state: any) => state.invoices);
    const deleteInvoice = useStore((state: any) => state.deleteInvoice);
    const businessProfile = useStore((state: any) => state.businessProfile);
    const fetchInvoices = useStore((state: any) => state.fetchInvoices);
    const [searchTerm, setSearchTerm] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showShareSheet, setShowShareSheet] = useState<Invoice | null>(null);

    useEffect(() => {
        setIsClient(true);
        fetchInvoices();
    }, [fetchInvoices]);

    // Re-fetch when component becomes visible (user navigates back)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchInvoices();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [fetchInvoices]);

    if (!isClient) return null;

    const safeInvoices = (Array.isArray(invoices) ? invoices : []).filter(i => i && typeof i === 'object');

    const filteredInvoices = safeInvoices.filter((inv: Invoice) => {
        // Aggressive null checks for every field accessed
        const customerName = inv?.customer?.name || '';
        const invoiceNumber = inv?.invoice_number || '';

        // Ensure strings before calling toLowerCase
        return (
            String(customerName).toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(invoiceNumber).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const handleDuplicate = (e: React.MouseEvent, invoice: Invoice) => {
        e.stopPropagation();
        window.location.href = `/dashboard/invoices/new?duplicateId=${invoice.id}`;
    };

    const handleDownload = (e: React.MouseEvent | null, invoice: Invoice) => {
        e?.stopPropagation();
        try {
            if (!invoice) return;
            generateInvoicePDF(invoice, businessProfile);
            toast.success('Invoice downloaded!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate PDF');
        }
    };

    const handleShareWhatsApp = async (invoice: Invoice) => {
        if (!invoice) return;

        const fileName = `Invoice-${invoice.invoice_number || 'Bill'}.pdf`;
        let doc = null;

        try {
            doc = generateInvoicePDF(invoice, businessProfile, false);
            if (!doc) throw new Error('PDF Generation Failed');

            // Try native file sharing first (Mobile Apps)
            const pdfBlob = doc.output('blob');
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Invoice ${invoice.invoice_number}`,
                    text: `Invoice from ${businessProfile.name || 'Our Business'}`
                });
                return; // Success!
            }
            throw new Error('Native file sharing not supported');

        } catch (e: any) {
            console.log('Native sharing failed, falling back to download + web share', e);
            // Debugging: Alert the user on mobile if sharing fails so we know WHY
            if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                // Only alert if it's NOT just "not supported" to avoid annoyance
                if (e.message !== 'Native file sharing not supported' && !e.message.includes('abort')) {
                    alert(`Share Error: ${e.message}. Downloading file instead.`);
                }
            }

            // Fallback: Download PDF & Open WhatsApp
            if (doc) {
                doc.save(fileName);
                toast.success('PDF Downloaded! Please attach file in WhatsApp', { duration: 5000, icon: '📎' });
            }

            // Open WhatsApp with a prompt to attach
            const text = `Please find the attached invoice ${invoice.invoice_number} from ${businessProfile.name || 'Business'}.`;
            // Check if mobile to use api.whatsapp.com for better deep linking, else web.whatsapp.com via wa.me
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const url = isMobile
                ? `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
                : `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;

            // Use window.open with a slight delay to ensure toast is seen/download starts
            setTimeout(() => {
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }, 1000);
        }
    };

    const handleShareMore = async (invoice: Invoice) => {
        if (!invoice) return;
        try {
            const doc = generateInvoicePDF(invoice, businessProfile, false);
            if (!doc) throw new Error('PDF Generation Failed');

            const pdfBlob = doc.output('blob');
            const fileName = `Invoice-${invoice.invoice_number || 'Bill'}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            if (navigator.share) {
                const shareData: any = {
                    title: `Invoice ${invoice.invoice_number}`,
                    text: `Please find the invoice attached from ${businessProfile.name || 'Our Business'}`,
                };

                // Add file if supported
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    shareData.files = [file];
                }

                await navigator.share(shareData);
            } else {
                handleDownload(null, invoice);
                toast.error('Share not supported. PDF downloaded.');
            }
        } catch (e) {
            console.error('Share error:', e);
            toast.error('Sharing failed');
        }
    };

    const handleShareSMS = (invoice: Invoice) => {
        if (!invoice) return;
        const total = (Number(invoice.total_amount) || 0).toLocaleString('en-IN');
        const text = `Invoice ${invoice.invoice_number || 'N/A'} for Rs. ${total} from ${businessProfile?.name || 'Our Business'}. Powered by BillGST.in`;
        window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="space-y-6 px-4 md:px-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and track all your bills</p>
                </div>
                <Link
                    href="/dashboard/invoices/new"
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                    <FaPlus />
                    Create New Invoice
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by customer name or invoice number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <FaSearch />
                    </div>
                </div>
            </div>

            {/* Invoices List - Desktop Table & Mobile Cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredInvoices.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-100 rounded-full text-gray-400">
                                <FaFileInvoiceDollar className="text-3xl" />
                            </div>
                            <p className="text-gray-500 font-medium">No invoices found</p>
                            <Link href="/dashboard/invoices/new" className="text-blue-600 hover:underline text-sm font-medium">
                                Create your first invoice
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice No</th>
                                        <th className="text-left py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="text-left py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="text-right py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="text-center py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredInvoices.map((invoice) => (
                                        <tr
                                            key={invoice.id}
                                            onClick={() => setSelectedInvoice(invoice)}
                                            className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                        >
                                            <td className="py-4 px-6 text-sm font-bold text-blue-600">
                                                <div className="flex flex-col">
                                                    <span>{invoice.invoice_number || 'N/A'}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium px-1.5 py-0.5 bg-gray-100 rounded-md w-fit">
                                                        {DOC_LABELS[invoice.type as keyof typeof DOC_LABELS] || 'Tax Invoice'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {(() => {
                                                            try {
                                                                const d = new Date(invoice?.invoice_date);
                                                                return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN');
                                                            } catch (e) { return 'N/A'; }
                                                        })()}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {(() => {
                                                            try {
                                                                const d = new Date(invoice?.created_at || invoice?.invoice_date);
                                                                return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                            } catch (e) { return ''; }
                                                        })()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-800 font-semibold">
                                                {invoice.customer?.name || 'Unknown'}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-sm font-bold text-gray-900">₹{(Number(invoice.total_amount) || 0).toLocaleString('en-IN')}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                        invoice.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {invoice.status || 'UNPAID'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDownload(null, invoice); }}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Download PDF"
                                                    >
                                                        <FaFilePdf className="text-lg" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setShowShareSheet(invoice); }}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                                        title="Share"
                                                    >
                                                        <FaWhatsapp className="text-lg" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDuplicate(e, invoice)}
                                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                                                        title="Duplicate"
                                                    >
                                                        <FaPlus className="text-lg" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {filteredInvoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    onClick={() => setSelectedInvoice(invoice)}
                                    className="p-4 active:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{invoice.customer?.name || 'Unknown'}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-gray-500 font-medium">#{invoice.invoice_number || 'N/A'}</p>
                                                <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 rounded-full">
                                                    {DOC_LABELS[invoice.type as keyof typeof DOC_LABELS] || 'Tax Invoice'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">₹{(Number(invoice.total_amount) || 0).toLocaleString('en-IN')}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                invoice.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {invoice.status || 'UNPAID'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-3">
                                        <p className="text-xs text-gray-400">
                                            {(() => {
                                                try {
                                                    const d = new Date(invoice?.invoice_date);
                                                    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN');
                                                } catch (e) { return 'N/A'; }
                                            })()}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowShareSheet(invoice); }}
                                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                                            >
                                                <FaWhatsapp /> Share
                                            </button>
                                            <button
                                                onClick={(e) => handleDuplicate(e, invoice)}
                                                className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg text-xs font-bold"
                                            >
                                                Duplicate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 shadow-2xl backdrop-blur-sm" onClick={() => setSelectedInvoice(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Invoice Details</h2>
                                <p className="text-sm text-gray-500">{selectedInvoice.invoice_number || 'N/A'}</p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Total Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">₹{(Number(selectedInvoice.total_amount) || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${selectedInvoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {selectedInvoice.status || 'UNPAID'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => handleDownload(null, selectedInvoice)} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                                    <FaFilePdf className="text-2xl text-red-500" />
                                    <span className="text-[10px] font-bold uppercase">PDF</span>
                                </button>
                                <button onClick={() => { setShowShareSheet(selectedInvoice); setSelectedInvoice(null); }} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                                    <FaWhatsapp className="text-2xl text-green-500" />
                                    <span className="text-[10px] font-bold uppercase">Share</span>
                                </button>
                                <button onClick={() => window.location.href = `/dashboard/invoices/new?duplicateId=${selectedInvoice.id}`} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                                    <FaPlus className="text-2xl text-orange-500" />
                                    <span className="text-[10px] font-bold uppercase">Duplicate</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Vyapar Style Share Sheet */}
            {showShareSheet && (
                <div className="fixed inset-0 bg-black/40 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-300" onClick={() => setShowShareSheet(null)}>
                    <div
                        className="bg-white rounded-t-[32px] sm:rounded-3xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.3)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden" />

                        <div className="p-6">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Share Transaction</h2>
                                <button onClick={() => setShowShareSheet(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">✕</button>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mb-8">
                                <button onClick={() => handleShareWhatsApp(showShareSheet)} className="flex flex-col items-center gap-3 group">
                                    <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#25D366]/20 transition-all border border-[#25D366]/20">
                                        <FaWhatsapp className="text-3xl text-[#25D366]" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">WhatsApp</span>
                                </button>

                                <button onClick={() => handleShareSMS(showShareSheet)} className="flex flex-col items-center gap-3 group">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-all border border-blue-500/20">
                                        <FaFileInvoiceDollar className="text-3xl text-blue-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">SMS</span>
                                </button>

                                <button onClick={() => handleDownload(null, showShareSheet)} className="flex flex-col items-center gap-3 group">
                                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-red-500/20 transition-all border border-red-500/20">
                                        <FaFilePdf className="text-3xl text-red-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">PDF</span>
                                </button>

                                <button onClick={() => handleShareMore(showShareSheet)} className="flex flex-col items-center gap-3 group">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200">
                                        <span className="text-2xl font-bold">...</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">More</span>
                                </button>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Amount</p>
                                        <p className="text-xl font-black text-slate-800 italic tracking-tight">₹{(Number(showShareSheet.total_amount) || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Invoice No</p>
                                        <p className="text-sm font-black text-indigo-600 italic">{showShareSheet.invoice_number || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-center">
                            <p className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">Powered by BillGST.in</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
