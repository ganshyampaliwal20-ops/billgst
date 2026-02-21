'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaFileInvoice, FaSearch, FaHandHoldingUsd, FaWhatsapp, FaDownload, FaTimes, FaChevronLeft, FaCommentDots, FaBell, FaReceipt, FaShareAlt, FaUserEdit, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { generateQuotationPDF } from '@/lib/pdf-generator';
import { toast } from 'react-hot-toast';
import { formatCompactNumber } from '@/lib/utils';

export default function QuotationsPage() {
    const router = useRouter();
    const { quotations, fetchQuotations, updateQuotation, businessDetails, businessProfile } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
    const [showActionModal, setShowActionModal] = useState<any>(null);
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
        toast.success('Payment recorded successfully', { icon: '💰' });
        setShowPaymentModal(false);
    };

    const handleQuotationClick = async (quotation: any) => {
        try {
            const businessDetailsForPDF = {
                name: businessProfile?.name || businessDetails?.name || 'Your Business',
                email: businessProfile?.email || businessDetails?.email || '',
                phone: businessProfile?.phone || businessDetails?.phone || '',
                address: businessProfile?.address || businessDetails?.address || '',
                gstin: businessProfile?.gstin || businessDetails?.gstin || '',
                logo: businessProfile?.logo || businessDetails?.logo || null,
                upi_id: businessProfile?.upi_id || businessDetails?.upi_id || '',
            };

            const pdfDoc = await generateQuotationPDF(quotation, businessDetailsForPDF, false);

            if (pdfDoc) {
                const pdfBlob = pdfDoc.output('blob');
                const blobUrl = URL.createObjectURL(pdfBlob);
                setPdfBlobUrl(blobUrl);
                setSelectedQuotation(quotation);
                setShowPdfModal(true);
            } else {
                throw new Error('PDF document generation returned null');
            }
        } catch (error: any) {
            console.error('Error generating PDF:', error);
            toast.error(`PDF error: ${error?.message || 'Unknown error'}`);
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

    const handleWhatsAppShare = async () => {
        if (pdfBlobUrl && selectedQuotation) {
            const fileName = `Quotation-${selectedQuotation.quotation_number || 'draft'}.pdf`;
            const message = `Hi ${selectedQuotation.customer_name}, please find your quotation ${selectedQuotation.quotation_number} for Rs. ${parseFloat(selectedQuotation.total_amount).toLocaleString('en-IN')}`;

            if (navigator.share && navigator.canShare) {
                try {
                    const response = await fetch(pdfBlobUrl);
                    const blob = await response.blob();
                    const file = new File([blob], fileName, { type: 'application/pdf' });

                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'Quotation PDF',
                            text: message,
                        });
                        return;
                    }
                } catch (error) {
                    console.error('Error sharing file:', error);
                }
            }

            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const generatePdfForAction = async (quotation: any) => {
        const businessDetailsForPDF = {
            name: businessProfile?.name || businessDetails?.name || 'Your Business',
            email: businessProfile?.email || businessDetails?.email || '',
            phone: businessProfile?.phone || businessDetails?.phone || '',
            address: businessProfile?.address || businessDetails?.address || '',
            gstin: businessProfile?.gstin || businessDetails?.gstin || '',
            logo: businessProfile?.logo || businessDetails?.logo || null,
            upi_id: businessProfile?.upi_id || businessDetails?.upi_id || '',
        };

        const pdfDoc = await generateQuotationPDF(quotation, businessDetailsForPDF, false);
        return pdfDoc ? pdfDoc.output('blob') : null;
    };

    const handleDownloadRow = async (e: React.MouseEvent | null, quotation: any) => {
        e?.stopPropagation();
        try {
            const blob = await generatePdfForAction(quotation);
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Quotation-${quotation.quotation_number}.pdf`;
                link.click();
                URL.revokeObjectURL(url);
                toast.success('PDF Downloaded');
            }
        } catch (error) {
            toast.error('PDF error');
        }
    };

    const handleShareRow = async (e: React.MouseEvent | null, quotation: any) => {
        e?.stopPropagation();
        try {
            const blob = await generatePdfForAction(quotation);
            if (!blob) return;

            const fileName = `Quotation-${quotation.quotation_number}.pdf`;
            const file = new File([blob], fileName, { type: 'application/pdf' });
            const message = `Hi ${quotation.customer_name}, please find your quotation ${quotation.quotation_number} for Rs. ${parseFloat(quotation.total_amount).toLocaleString('en-IN')}`;

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Quotation PDF',
                    text: message,
                });
            } else {
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            }
        } catch (error) {
            toast.error('Share error');
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
        <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
            {/* Premium Header */}
            <div className="bg-white border-b-4 border-emerald-500 px-6 py-6 flex flex-col items-center justify-center text-center shadow-sm z-20 relative">
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Quotations</h1>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Manage Your Deals</p>
                </div>
            </div>

            {/* Stats Grid - Single Row */}
            <div className="grid grid-cols-3 gap-3 p-4" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-50 flex flex-col items-center justify-center text-center gap-2 shadow-sm relative overflow-hidden group">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg"><FaReceipt className="text-xl" /></div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">{quotations.length}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Deals</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-50 flex flex-col items-center justify-center text-center gap-2 shadow-sm relative overflow-hidden group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg"><FaHandHoldingUsd className="text-xl" /></div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">{formatCompactNumber(quotations.reduce((acc: number, q: any) => acc + (parseFloat(q.paid_amount || 0)), 0))}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Received</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-50 flex flex-col items-center justify-center text-center gap-2 shadow-sm relative overflow-hidden group">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-lg"><FaSearch className="text-xl" /></div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">{formatCompactNumber(quotations.reduce((acc: number, q: any) => acc + (parseFloat(q.total_amount || 0) - parseFloat(q.paid_amount || 0)), 0))}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending</p>
                    </div>
                </div>
            </div>

            {/* Search Bar - 3D Style */}
            <div className="px-6 py-4 bg-white border-b border-emerald-50" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <div className="relative w-full group transition-all bg-white p-1 rounded-2xl border-4 border-emerald-100 border-b-8 border-emerald-200 shadow-lg" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                    <input
                        type="text"
                        placeholder="SEARCH QUOTATION / CUSTOMER"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-4 bg-emerald-50/20 border-none rounded-xl outline-none text-base font-black text-black placeholder:text-slate-500 uppercase tracking-widest pl-5"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md">
                        <FaSearch className="text-lg" />
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div className="px-8 py-3 flex justify-between text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] bg-emerald-50/30" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <span>Quotation List ({filteredQuotations.length})</span>
                <span>Amount Report</span>
            </div>

            {/* Card List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                {filteredQuotations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <FaReceipt className="text-8xl mb-6 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-sm italic">No quotations found</p>
                    </div>
                ) : (
                    filteredQuotations.map((quotation: any, idx: number) => {
                        const balance = parseFloat(quotation.total_amount) - parseFloat(quotation.paid_amount || 0);
                        return (
                            <div
                                key={quotation.id}
                                className="relative rounded-3xl border-2 border-slate-100 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer group"
                                style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}
                                onClick={() => setShowActionModal(quotation)}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-emerald-600 shadow-sm border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                            {idx + 1}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-black text-slate-900 uppercase tracking-tight leading-none text-sm">{quotation.customer_name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">{quotation.quotation_number}</span>
                                                <span className="text-[9px] font-bold text-slate-400">{new Date(quotation.quotation_date).toLocaleDateString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-black ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            ₹{parseFloat(quotation.total_amount).toLocaleString('en-IN')}
                                        </div>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${quotation.status === 'Accepted' || quotation.status === 'Received' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {quotation.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions Overlay (Desktop Only) */}
                                <div className="hidden md:grid grid-cols-4 gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={(e) => handleShareRow(e, quotation)}
                                        className="py-3 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                    >
                                        <FaWhatsapp className="text-lg" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDownloadRow(e, quotation)}
                                        className="py-3 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                    >
                                        <FaDownload className="text-lg" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openPaymentModal(quotation); }}
                                        className="py-3 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                    >
                                        <FaHandHoldingUsd className="text-lg" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleConvertToInvoice(quotation); }}
                                        className="py-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                    >
                                        <FaFileInvoice className="text-lg" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
                <div className="h-20"></div>
            </div>

            {/* Quick Actions Pop-up (Mobile) */}
            {showActionModal && (
                <div className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowActionModal(null)}>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in duration-300 border-4 border-emerald-500" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Quotation Actions</h3>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1"># {showActionModal.quotation_number}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{showActionModal.customer_name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => { handleShareRow(null, showActionModal); setShowActionModal(null); }}
                                className="flex flex-col items-center gap-3 p-5 bg-emerald-50 rounded-3xl border-b-4 border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all group"
                            >
                                <FaWhatsapp className="text-xl text-emerald-500 group-hover:text-white" />
                                <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
                            </button>
                            <button
                                onClick={() => { handleDownloadRow(null, showActionModal); setShowActionModal(null); }}
                                className="flex flex-col items-center gap-3 p-5 bg-blue-50 rounded-3xl border-b-4 border-blue-100 hover:bg-blue-600 hover:text-white transition-all group"
                            >
                                <FaDownload className="text-xl text-blue-500 group-hover:text-white" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Download</span>
                            </button>
                            <button
                                onClick={() => { openPaymentModal(showActionModal); setShowActionModal(null); }}
                                className="flex flex-col items-center gap-3 p-5 bg-orange-50 rounded-3xl border-b-4 border-orange-100 hover:bg-orange-600 hover:text-white transition-all group"
                            >
                                <FaHandHoldingUsd className="text-xl text-orange-500 group-hover:text-white" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Payment</span>
                            </button>
                            <button
                                onClick={() => { handleConvertToInvoice(showActionModal); setShowActionModal(null); }}
                                className="flex flex-col items-center gap-3 p-5 bg-indigo-50 rounded-3xl border-b-4 border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all group"
                            >
                                <FaFileInvoice className="text-xl text-indigo-500 group-hover:text-white" />
                                <span className="text-[9px] font-black uppercase tracking-widest">To Bill</span>
                            </button>
                        </div>

                        <button
                            onClick={() => { handleQuotationClick(showActionModal); setShowActionModal(null); }}
                            className="mt-6 w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl active:scale-95 transition-all border-b-4 border-slate-700"
                        >
                            VIEW FULL PREVIEW
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Link
                    href="/dashboard/quotations/new"
                    className="w-16 h-16 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center shadow-[0_12px_40px_-8px_rgba(234,179,8,0.4)] hover:scale-110 active:scale-95 transition-all border-4 border-white"
                >
                    <FaPlus className="text-2xl" />
                </Link>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedQuotation && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md p-2 shadow-2xl animate-in zoom-in duration-300 border-2 border-emerald-500/20">
                        <div className="bg-emerald-50/50 rounded-[2rem] overflow-hidden" style={{ padding: '8px' }}>
                            <div className="flex justify-between items-center mb-4 px-4 pt-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase italic leading-none">Record Payment</h3>
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">Receive Quotation Payment</p>
                                </div>
                                <button onClick={() => setShowPaymentModal(false)} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 flex items-center justify-center transition-all active:scale-95"><FaTimes /></button>
                            </div>

                            <div className="bg-white p-6 rounded-3xl mb-4 border-2 border-slate-50 shadow-inner">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Bill</span>
                                        <span className="text-sm font-black text-slate-900">₹{parseFloat(selectedQuotation.total_amount).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Already Paid</span>
                                        <span className="text-sm font-black text-emerald-600">₹{parseFloat(selectedQuotation.paid_amount || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Balance Due</span>
                                        <span className="text-2xl font-black text-rose-600 tracking-tighter">
                                            ₹{(parseFloat(selectedQuotation.total_amount) - parseFloat(selectedQuotation.paid_amount || 0)).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submitPayment} className="space-y-4">
                                <div className="px-2 pb-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block pl-2">Amount Received Now</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-lg">₹</div>
                                        <input
                                            type="number"
                                            required
                                            min="0.01"
                                            step="0.01"
                                            value={paymentAmount}
                                            onChange={e => setPaymentAmount(e.target.value)}
                                            className="w-full pl-12 pr-6 py-5 bg-white border-4 border-emerald-100 rounded-2xl font-black text-2xl text-slate-800 focus:border-emerald-500 outline-none transition-all shadow-lg placeholder:text-slate-200"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/30 active:scale-95 transition-all text-xs border-b-4 border-emerald-800"
                                >
                                    CONFIRM & RECEIVE
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF Viewer Modal */}
            {showPdfModal && pdfBlobUrl && selectedQuotation && (
                <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-2 backdrop-blur-md" onClick={closePdfModal}>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border-4 border-emerald-500 mt-12" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex flex-col items-center justify-center p-6 bg-white border-b border-slate-100 relative">
                            <div className="text-center">
                                <h3 className="text-xl font-black text-slate-900 uppercase italic leading-none">Quotation Preview</h3>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">
                                    {selectedQuotation.quotation_number} • {selectedQuotation.customer_name}
                                </p>
                            </div>
                            <button
                                onClick={closePdfModal}
                                className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 hover:text-red-500 transition-all active:scale-95 shadow-sm border border-slate-100"
                            >
                                <FaTimes className="text-lg" />
                            </button>
                        </div>

                        {/* PDF Viewer Content */}
                        <div className="flex-1 bg-slate-100 overflow-hidden relative">
                            <iframe src={pdfBlobUrl} className="w-full h-full border-0 hidden md:block" title="Quotation PDF" />
                            <div className="md:hidden flex flex-col items-center justify-center h-full p-8 text-center bg-white m-4 rounded-[2rem] border-2 border-slate-100">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-sm"><FaReceipt /></div>
                                <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">PDF is Ready!</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 leading-relaxed px-4">Preview is limited on mobile. Use actions below to share or download.</p>
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <button onClick={handleWhatsAppShare} className="py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95"><FaWhatsapp className="text-xl" /> Share</button>
                                    <button onClick={handleDownloadPdf} className="py-5 bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95"><FaDownload className="text-xl" /> Files</button>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar - Desktop */}
                        <div className="hidden md:flex items-center justify-center gap-6 p-6 bg-slate-50">
                            <button
                                onClick={handleWhatsAppShare}
                                className="flex items-center gap-3 px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <FaWhatsapp className="text-2xl" /> WhatsApp Share
                            </button>
                            <button
                                onClick={handleDownloadPdf}
                                className="flex items-center gap-3 px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <FaDownload className="text-2xl" /> Download System
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
