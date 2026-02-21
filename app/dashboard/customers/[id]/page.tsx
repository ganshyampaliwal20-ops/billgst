'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import {
    FaArrowLeft, FaUser, FaPhone, FaMapMarkerAlt, FaExclamationCircle,
    FaEdit, FaReceipt, FaRupeeSign, FaCalendarCheck, FaRegClock, FaMoneyBillWave
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

export default function CustomerDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { customers, invoices, fetchInvoices, fetchCustomers, updateCustomer } = useStore() as any;
    const [isClient, setIsClient] = useState(false);

    // Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [isProcessing, setIsProcessing] = useState(false);

    // Promise State
    const [showPromiseModal, setShowPromiseModal] = useState(false);
    const [promiseDate, setPromiseDate] = useState('');

    useEffect(() => {
        setIsClient(true);
        if (customers.length === 0) fetchCustomers();
        if (invoices.length === 0) fetchInvoices();
    }, []);

    const customer = customers.find((c: any) => c.id === id);

    useEffect(() => {
        if (customer?.promise_date) {
            setPromiseDate(customer.promise_date.split('T')[0]);
        }
    }, [customer]);

    if (!isClient) return null;

    if (!customer) {
        return (
            <div className="p-8 text-center">
                <FaExclamationCircle className="mx-auto text-4xl text-red-400 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Customer Not Found</h2>
                <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go Back</button>
            </div>
        );
    }

    const customerInvoices = invoices
        .filter((inv: any) => inv.customer_id === id || inv.customer?.id === id)
        .sort((a: any, b: any) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime());

    const totalSales = customerInvoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.total_amount || 0), 0);
    const totalPaid = customerInvoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.paid_amount || 0), 0);
    const totalDue = Math.max(0, totalSales - totalPaid);

    const isPromiseOverdue = customer.promise_date && new Date(customer.promise_date) < new Date(new Date().setHours(0, 0, 0, 0)) && totalDue > 0;

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsProcessing(true);
        try {
            const unpaidInvoices = customerInvoices
                .filter((inv: any) => (parseFloat(inv.total_amount) - parseFloat(inv.paid_amount || 0)) > 0.1)
                .sort((a: any, b: any) => new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime());

            let remainingPayment = amount;
            let processedCount = 0;

            for (const inv of unpaidInvoices) {
                if (remainingPayment <= 0.01) break;
                const currentPaid = parseFloat(inv.paid_amount || 0);
                const currentTotal = parseFloat(inv.total_amount);
                const pending = currentTotal - currentPaid;

                let paymentForInvoice = remainingPayment >= pending ? pending : remainingPayment;
                remainingPayment -= paymentForInvoice;

                const newPaidAmount = currentPaid + paymentForInvoice;
                const newStatus = Math.abs(newPaidAmount - currentTotal) < 0.1 ? 'PAID' : 'PARTIAL';

                await fetch('/api/invoices', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: inv.id, paid_amount: newPaidAmount, status: newStatus })
                });
                processedCount++;
            }

            if (processedCount > 0) {
                toast.success(`Payment of ₹${amount} received!`);
                if (Math.abs(amount - totalDue) < 0.1) {
                    await updateCustomer(id, { promise_date: null });
                }
                await fetchInvoices();
                setShowPaymentModal(false);
                setPaymentAmount('');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const updatePromiseDate = async () => {
        setIsProcessing(true);
        try {
            await updateCustomer(id, { promise_date: promiseDate || null });
            setShowPromiseModal(false);
        } catch (e) {
            toast.error('Failed to update promise date');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0e7490] text-white px-6 py-5 flex items-center justify-between shadow-lg z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="hover:bg-white/10 p-2 -ml-2 rounded-full transition-colors">
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">{customer.name}</h1>
                        <p className="text-xs text-white/70 font-medium">Customer History & Summary</p>
                    </div>
                </div>
                <button onClick={() => toast('Edit coming soon')} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all border border-white/10">
                    <FaEdit className="text-lg" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* Summary Box */}
                <div className="bg-[#0e7490] rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex items-center justify-between gap-4 relative z-10">
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Total Sales</span>
                            <span className="text-lg font-black text-white">{formatCurrency(totalSales)}</span>
                        </div>
                        <div className="w-px h-10 bg-white/20"></div>
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Total Paid</span>
                            <span className="text-lg font-black text-emerald-300">{formatCurrency(totalPaid)}</span>
                        </div>
                        <div className="w-px h-10 bg-white/20"></div>
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Outstanding</span>
                            <span className="text-lg font-black text-orange-300">{formatCurrency(totalDue)}</span>
                        </div>
                    </div>
                </div>

                {/* Promise to Pay Section */}
                <div className={`rounded-2xl border-2 p-5 flex items-center justify-between shadow-sm transition-all ${isPromiseOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isPromiseOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            <FaCalendarCheck className="text-xl" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Commitment</p>
                            {customer.promise_date ? (
                                <div className="flex items-center gap-2 text-left">
                                    <p className="font-black text-slate-800">
                                        {new Date(customer.promise_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                    {isPromiseOverdue && <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">OVERDUE</span>}
                                </div>
                            ) : (
                                <p className="text-sm font-bold text-slate-500 italic">No promise date set</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPromiseModal(true)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2"
                    >
                        <FaRegClock /> {customer.promise_date ? 'Change' : 'Set Date'}
                    </button>
                </div>

                {/* Info Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-left">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-800">Basic Information</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        {customer.phone && (
                            <div className="flex items-center gap-4">
                                <FaPhone className="text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                                    <p className="font-bold text-slate-700">{customer.phone}</p>
                                </div>
                            </div>
                        )}
                        {customer.gstin && (
                            <div className="flex items-center gap-4">
                                <FaUser className="text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">GSTIN</p>
                                    <p className="font-bold text-slate-700">{customer.gstin}</p>
                                </div>
                            </div>
                        )}
                        {customer.address && (
                            <div className="flex items-start gap-4 md:col-span-2">
                                <FaMapMarkerAlt className="text-slate-400 mt-1" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Address</p>
                                    <p className="font-bold text-slate-700 leading-relaxed text-left">{customer.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* History */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-bold text-slate-800">Invoice History</h2>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-bold">{customerInvoices.length} Bills</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Invoice No.</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {customerInvoices.map((inv: any) => (
                                    <tr key={inv.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => router.push(`/dashboard/invoices`)}>
                                        <td className="px-6 py-5 text-sm font-bold text-slate-700">
                                            {new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-black text-blue-600">{inv.invoice_number}</td>
                                        <td className="px-6 py-5 text-sm font-black text-right">{formatCurrency(inv.total_amount || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 shadow-lg z-30">
                <button
                    onClick={() => { setPaymentAmount(totalDue.toString()); setShowPaymentModal(true); }}
                    className="w-full py-4 bg-[#4358f4] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                    <FaMoneyBillWave className="text-xl" /> Receive Payment ({formatCurrency(totalDue)})
                </button>
            </div>

            {/* Promise Modal */}
            {showPromiseModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
                        <button onClick={() => setShowPromiseModal(false)} className="absolute top-4 right-4 p-2 text-slate-400">✕</button>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><FaCalendarCheck /></div>
                            <h3 className="text-xl font-black text-slate-800">Promise to Pay</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Kab tak payment karenge?</p>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="date"
                                value={promiseDate}
                                onChange={(e) => setPromiseDate(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500"
                            />
                            <button
                                onClick={updatePromiseDate}
                                disabled={isProcessing}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 disabled:opacity-50"
                            >
                                {isProcessing ? 'Saving...' : 'Set Commitment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Payment Modal logic omitted for brevity, but I'll keep it simple */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-left">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 p-2 text-slate-400">✕</button>
                        <h3 className="text-xl font-black text-slate-800 mb-6">Receive Payment</h3>
                        <div className="space-y-4 text-left">
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-2xl text-slate-800 outline-none focus:border-blue-500"
                                placeholder="0.00"
                            />
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full py-4 bg-green-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-green-500/30"
                            >
                                {isProcessing ? 'Processing...' : 'Confirm Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
