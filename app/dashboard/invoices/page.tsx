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

    useEffect(() => {
        setIsClient(true);
        fetchInvoices();
    }, []);

    if (!isClient) return null;

    const filteredInvoices = invoices.filter((inv: Invoice) =>
        inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = (invoice: Invoice) => {
        try {
            generateInvoicePDF(invoice, businessProfile);
            toast.success('Invoice downloaded!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate PDF');
        }
    };

    const handleShare = (invoice: Invoice) => {
        try {
            // Generate PDF first
            generateInvoicePDF(invoice, businessProfile);

            // Then show WhatsApp message with instructions
            const text = `*INVOICE FROM ${businessProfile.name.toUpperCase()}*
    
Invoice No: ${invoice.invoice_number}
Date: ${new Date(invoice.invoice_date).toLocaleDateString()}
Customer: ${invoice.customer.name}

*Total Amount: ₹${invoice.total_amount}*

Items:
${invoice.items.map(item => `- ${item.product_name}: ${item.quantity} x ₹${item.unit_price}`).join('\n')}

Powered by BillGST.in`;

            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;

            toast.success('PDF downloaded! Opening WhatsApp...', { duration: 3000 });
            toast('Please manually attach the downloaded PDF in WhatsApp', {
                icon: '📎',
                duration: 4000
            });
            setTimeout(() => {
                window.open(url, '_blank');
            }, 500);
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate PDF');
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            deleteInvoice(id);
            toast.success('Invoice deleted');
        }
    };

    return (
        <div className="space-y-6 px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
                    <p className="text-gray-500 text-sm">Manage and track all your bills</p>
                </div>
                <Link
                    href="/dashboard/invoices/new"
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                    <FaPlus />
                    Create New Invoice
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by customer name or invoice number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice No</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-gray-100 rounded-full text-gray-400">
                                                <FaFileInvoiceDollar className="text-2xl" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No invoices found</p>
                                            <Link href="/dashboard/invoices/new" className="text-blue-600 hover:underline text-sm">
                                                Create your first invoice
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-4 md:px-6 text-sm font-medium text-blue-600">
                                            {invoice.invoice_number}
                                        </td>
                                        <td className="py-4 px-4 md:px-6 text-sm text-gray-500">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-700">{new Date(invoice.invoice_date).toLocaleDateString()}</span>
                                                <span className="text-xs text-gray-400">{new Date(invoice.created_at || invoice.invoice_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 md:px-6 text-sm text-gray-800 font-medium">
                                            {invoice.customer.name}
                                        </td>
                                        <td className="py-4 px-4 md:px-6 text-sm text-gray-900 font-bold text-right">
                                            ₹{invoice.total_amount.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-4 md:px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleDownload(invoice)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Download PDF"
                                                >
                                                    <FaFilePdf />
                                                </button>
                                                <button
                                                    onClick={() => handleShare(invoice)}
                                                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                                    title="Share on WhatsApp"
                                                >
                                                    <FaWhatsapp />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invoice.id)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
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
        </div>
    );
}
