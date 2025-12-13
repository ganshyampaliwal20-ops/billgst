'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaFilePdf, FaWhatsapp, FaTrash, FaPlus, FaSearch, FaFileInvoiceDollar } from 'react-icons/fa';
import Link from 'next/link';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { toast } from 'react-hot-toast';

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
}

export default function InvoicesPage() {
    const { invoices, deleteInvoice, businessProfile, fetchInvoices } = useStore() as {
        invoices: Invoice[],
        deleteInvoice: (id: string) => void,
        businessProfile: any,
        fetchInvoices: () => void
    };
    const [searchTerm, setSearchTerm] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        setIsClient(true);
        fetchInvoices();
    }, []);

    if (!isClient) return null;

    const filteredInvoices = invoices.filter((inv: Invoice) =>
        inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = (e: React.MouseEvent, invoice: Invoice) => {
        e.stopPropagation();
        try {
            generateInvoicePDF(invoice, businessProfile);
            toast.success('Invoice downloaded!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate PDF');
        }
    };

    const handleShare = (e: React.MouseEvent, invoice: Invoice) => {
        e.stopPropagation();
        try {
            generateInvoicePDF(invoice, businessProfile);

            const text = `*INVOICE FROM ${businessProfile.name.toUpperCase()}*
    
Invoice No: ${invoice.invoice_number}
Date: ${new Date(invoice.invoice_date).toLocaleDateString()}
Customer: ${invoice.customer.name}

*Total Amount: ₹${invoice.total_amount}*

Items:
${invoice.items.map(item => `- ${item.product_name}: ${item.quantity} x ₹${item.unit_price}`).join('\n')}

Powered by BillGST.in`;

            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;

            toast.success('Opening WhatsApp...', { duration: 2000 });
            toast('IMPORTANT: Please attach the downloaded PDF manually in WhatsApp', {
                icon: '📎',
                duration: 5000,
                style: {
                    border: '1px solid #713200',
                    padding: '16px',
                    color: '#713200',
                },
            });
            setTimeout(() => {
                window.open(url, '_blank');
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate PDF');
        }
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
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by customer name or invoice number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
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
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-gray-100 rounded-full text-gray-400">
                                                <FaFileInvoiceDollar className="text-3xl" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No invoices found</p>
                                            <Link href="/dashboard/invoices/new" className="text-blue-600 hover:underline text-sm font-medium">
                                                Create your first invoice
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        onClick={() => setSelectedInvoice(invoice)}
                                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="py-4 px-6 text-sm font-bold text-blue-600">
                                            {invoice.invoice_number}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{new Date(invoice.invoice_date).toLocaleDateString()}</span>
                                                <span className="text-xs text-gray-400">{new Date(invoice.created_at || invoice.invoice_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-800 font-semibold">
                                            {invoice.customer.name}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-sm font-bold text-gray-900">₹{invoice.total_amount.toLocaleString()}</span>
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
                                                    onClick={(e) => handleDownload(e, invoice)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Download PDF"
                                                >
                                                    <FaFilePdf className="text-lg" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleShare(e, invoice)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                                    title="Share on WhatsApp"
                                                >
                                                    <FaWhatsapp className="text-lg" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvoice(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Invoice Details</h2>
                                <p className="text-sm text-gray-500">{selectedInvoice.invoice_number}</p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Total Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">₹{selectedInvoice.total_amount.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${selectedInvoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                            selectedInvoice.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {selectedInvoice.status || 'UNPAID'}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-600">Customer Name</span>
                                    <span className="font-semibold text-gray-900">{selectedInvoice.customer.name}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-600">Paid Amount</span>
                                    <span className="font-semibold text-green-600">₹{(selectedInvoice.paid_amount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600 font-medium">Due Amount</span>
                                    <span className="font-bold text-red-600">₹{((selectedInvoice.total_amount - (selectedInvoice.paid_amount || 0))).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={(e) => {
                                        handleDownload(e as any, selectedInvoice);
                                        setSelectedInvoice(null);
                                    }}
                                    className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition"
                                >
                                    <FaFilePdf /> Download PDF
                                </button>
                                <button
                                    onClick={(e) => {
                                        handleShare(e as any, selectedInvoice);
                                        setSelectedInvoice(null);
                                    }}
                                    className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition"
                                >
                                    <FaWhatsapp /> Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
