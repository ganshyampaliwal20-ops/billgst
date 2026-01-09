'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaFileInvoice, FaSearch, FaHandHoldingUsd, FaWhatsapp, FaDownload, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { generateQuotationPDF } from '@/lib/pdf-generator';

export default function QuotationsPage() {
    const router = useRouter();
    const { quotations, fetchQuotations, updateQuotation, businessDetails } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchQuotations();
    }, []);

    const filteredQuotations = quotations.filter((q: any) =>
        (q.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.quotation_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleConvertToInvoice = (quotation: any) => {
        router.push(`/dashboard/invoices/new?quotationId=${quotation.id}`);
    };

    const openPaymentModal = (quotation: any) => {
        setSelectedQuotation(quotation);
        setPaymentAmount('');
        setShowPaymentModal(true);
    };

    const submitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQuotation || !paymentAmount) return;

        const currentPaid = parseFloat(selectedQuotation.paid_amount || 0);
        const newPayment = parseFloat(paymentAmount);
        const totalPaid = currentPaid + newPayment;
        const totalAmount = parseFloat(selectedQuotation.total_amount || 0);

        const updates: any = { paid_amount: totalPaid };

        // Auto-accept if fully paid
        if (totalPaid >= totalAmount) {
            updates.status = 'Received';
        }

        await updateQuotation(selectedQuotation.id, updates);

        setShowPaymentModal(false);
    };

    const handleQuotationClick = async (quotation: any) => {
        try {
            const pdfDoc = await generateQuotationPDF(quotation, businessDetails, false);
            if (pdfDoc) {
                const pdfBlob = pdfDoc.output('blob');
                const blobUrl = URL.createObjectURL(pdfBlob);
                setPdfBlobUrl(blobUrl);
                setSelectedQuotation(quotation);
                setShowPdfModal(true);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('PDF generate karne mein error aaya. Kripya phir se try karein.');
        }
    };

    const handleDownloadPdf = () => {
        if (pdfBlobUrl && selectedQuotation) {
            const link = document.createElement('a');
            link.href = pdfBlobUrl;
            link.download = `Quotation-${selectedQuotation.quotation_number}.pdf`;
            link.click();
        }
    };

    const handleWhatsAppShare = () => {
        if (pdfBlobUrl && selectedQuotation) {
            const message = `Hi ${selectedQuotation.customer_name}, please find your quotation ${selectedQuotation.quotation_number} for Rs. ${parseFloat(selectedQuotation.total_amount).toLocaleString('en-IN')}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const closePdfModal = () => {
        if (pdfBlobUrl) {
            URL.revokeObjectURL(pdfBlobUrl);
        }
        setPdfBlobUrl(null);
        setShowPdfModal(false);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col items-center justify-center gap-2 text-center">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quotations</h1>
                <p className="text-slate-40 text-sm">Manage your quotations and convert to invoices</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg flex flex-col items-center justify-center text-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-90">Total Quotations</h3>
                    <p className="text-2x1 font-black mt-1">{quotations.length}</p>
                    <p className="text-[10px] opacity-75 mt-0.5">Generated</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg flex flex-col items-center justify-center text-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-90">Received Amount</h3>
                    <p className="text-2x1 font-black mt-1">
                        ₹{quotations.reduce((acc: number, q: any) => acc + (parseFloat(q.paid_amount || 0)), 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] opacity-75 mt-0.5">Total Collected</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-4 text-white shadow-lg flex flex-col items-center justify-center text-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-90">Pending Balance</h3>
                    <p className="text-2x1 font-black mt-1">
                        ₹{quotations.reduce((acc: number, q: any) => acc + (parseFloat(q.total_amount || 0) - parseFloat(q.paid_amount || 0)), 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] opacity-75 mt-0.5">Total Outstanding</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-1 mx-4 md:mx-0" style={{ marginTop: '15px' }}></div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200">
                <div className="relative">
                    <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by customer or quotation number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                </div>
            </div>

            {/* Quotations List */}
            <div className="relative mb-1 mx-4 md:mx-0" style={{ marginTop: '10px' }}></div>
            <div className="bg-white rounded-200xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="relative mb-1 mx-4 md:mx-0" style={{ marginTop: '5px' }}></div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-bold uppercase tracking-wider">Quotation #</th>
                                <th className="text-left py-4 px-6 text-sm font-bold uppercase tracking-wider">Customer</th>
                                <th className="text-left py-4 px-6 text-sm font-bold uppercase tracking-wider">Date</th>
                                <th className="text-right py-4 px-6 text-sm font-bold uppercase tracking-wider">Total</th>
                                <th className="text-right py-4 px-6 text-sm font-bold uppercase tracking-wider">Paid</th>
                                <th className="text-right py-4 px-6 text-sm font-bold uppercase tracking-wider">Balance</th>
                                <th className="text-center py-4 px-6 text-sm font-bold uppercase tracking-wider">Status</th>
                                <th className="text-center py-4 px-6 text-sm font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-10">
                            {filteredQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-500 font-bold">
                                        No quotations found. Create your first quotation!
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotations.map((quotation: any) => (
                                    <tr
                                        key={quotation.id}
                                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                                        onClick={() => handleQuotationClick(quotation)}
                                    >
                                        <td className="py-4 px-6 font-bold text-blue-600">
                                            {quotation.quotation_number}
                                        </td>
                                        <td className="py-4 px-6 text-slate-700 font-medium">{quotation.customer_name}</td>
                                        <td className="py-4 px-6 text-slate-600">
                                            {new Date(quotation.quotation_date).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="py-4 px-6 text-right font-bold text-slate-800">
                                            ₹{parseFloat(quotation.total_amount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-4 px-6 text-right font-bold text-green-600">
                                            ₹{parseFloat(quotation.paid_amount || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-4 px-6 text-right font-bold text-red-600">
                                            ₹{(parseFloat(quotation.total_amount) - parseFloat(quotation.paid_amount || 0)).toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${quotation.status === 'Accepted' || quotation.status === 'Received' ? 'bg-green-100 text-green-700' :
                                                quotation.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {quotation.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openPaymentModal(quotation);
                                                    }}
                                                    className="text-green-600 hover:text-green-800 font-bold text-xs bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                                                    title="Record Payment"
                                                >
                                                    <FaHandHoldingUsd className="text-base" /> Receive
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleConvertToInvoice(quotation);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                                                    title="Convert to Invoice"
                                                >
                                                    <FaFileInvoice className="text-base" /> Convert
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

            {/* New Quotation Button - Large & Professional */}
            <div className="flex justify-center mt-8">
                <Link
                    href="/dashboard/quotations/new"
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-16 py-5 rounded-2xl font-black text-xl shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-4 border-2 border-blue-400/30"
                >
                    <FaPlus className="text-2xl" />
                    <span>Create New Quotation</span>
                </Link>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedQuotation && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-black text-gray-800 mb-4">Record Payment</h3>
                        <div className="bg-slate-50 p-4 rounded-xl mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500 font-bold">Total Amount:</span>
                                <span className="font-bold">₹{parseFloat(selectedQuotation.total_amount).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500 font-bold">Already Paid:</span>
                                <span className="font-bold text-green-600">₹{parseFloat(selectedQuotation.paid_amount || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-base border-t border-slate-200 pt-2 mt-2">
                                <span className="text-slate-700 font-black uppercase">Balance:</span>
                                <span className="font-black text-red-600">
                                    ₹{(parseFloat(selectedQuotation.total_amount) - parseFloat(selectedQuotation.paid_amount || 0)).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={submitPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Amount Received</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    className="w-full p-4 border border-slate-300 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter amount..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-500/30"
                                >
                                    Save Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PDF Viewer Modal */}
            {showPdfModal && pdfBlobUrl && selectedQuotation && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
                            <div className="text-white">
                                <h3 className="text-xl font-black">Quotation PDF</h3>
                                <p className="text-sm opacity-90">{selectedQuotation.quotation_number} - {selectedQuotation.customer_name}</p>
                            </div>
                            <button
                                onClick={closePdfModal}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 overflow-hidden bg-slate-100">
                            <iframe
                                src={pdfBlobUrl}
                                className="w-full h-full border-0"
                                title="Quotation PDF"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-5 p-5 border-t border-slate-200 bg-slate-50">
                            <button
                                onClick={handleWhatsAppShare}
                                className="flex items-center justify-center gap-4 px-12 py-5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all duration-300 min-w-[280px]"
                            >
                                <FaWhatsapp className="text-3xl" />
                                WhatsApp Share
                            </button>
                            <button
                                onClick={handleDownloadPdf}
                                className="flex items-center justify-center gap-4 px-12 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 min-w-[280px]"
                            >
                                <FaDownload className="text-3xl" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
