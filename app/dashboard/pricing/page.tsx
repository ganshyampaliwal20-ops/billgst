
'use client';

import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaQrcode } from 'react-icons/fa';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

type PlanType = 'FREE' | 'BASIC_30' | 'PREMIUM_99' | 'YEARLY_299' | 'LIFETIME';

export default function PricingPage() {
    const [currentPlan, setCurrentPlan] = useState<PlanType>('FREE');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; type: PlanType } | null>(null);
    const [qrCodeData, setQrCodeData] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // New state for Transaction ID
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/subscription/status');
                if (res.ok) {
                    const data = await res.json();
                    setCurrentPlan(data.plan);
                }
            } catch (err) {
                console.error("Failed to fetch plan status", err);
            }
        };
        fetchStatus();
    }, []);

    const plans = [
        {
            name: 'Free (Default)',
            price: 0,
            type: 'FREE',
            features: [
                '30 Invoices & 30 Quotations / Month',
                'Basic Customer Ledger (Hisaab)',
                'Manage Single Business',
                'No Automated UPI QR Code',
                'Standard Email Support'
            ],
            color: 'bg-gray-100 border-gray-200'
        },
        {
            name: 'Basic Starter',
            price: 30,
            type: 'BASIC_30',
            duration: '1 Month',
            features: [
                'Upto 100 Invoices / Month',
                'Unlimited Quotations',
                'Invoice UPI QR Code Payment',
                'Basic Inventory Management',
                'Priority WhatsApp Support'
            ],
            color: 'bg-blue-50 border-blue-200',
            btnColor: 'bg-blue-600 hover:bg-blue-700'
        },
        {
            name: 'Premium Growth',
            price: 99,
            type: 'PREMIUM_99',
            duration: '3 Months',
            features: [
                'Unlimited Invoices & Quotations',
                'Customer Hisaab & Unlimited Ledger',
                'Advanced Inventory Control',
                'Automated QR Code & WhatsApp Export',
                'Dedicated Priority Support'
            ],
            color: 'bg-purple-50 border-purple-200',
            btnColor: 'bg-purple-600 hover:bg-purple-700',
            popular: true
        },
        {
            name: 'Yearly Pro',
            price: 299,
            type: 'YEARLY_299',
            duration: '1 Year',
            features: [
                'All Premium Features for 365 Days',
                'Fully Unlimited Billing & Inventory',
                'Custom Invoice Themes & Branding',
                'Cloud Auto-Backup & Reports',
                'VIP 24/7 Developer Support'
            ],
            color: 'bg-amber-50 border-amber-200',
            btnColor: 'bg-amber-600 hover:bg-amber-700'
        }
    ];

    const handleUpgrade = async (plan: any) => {
        setSelectedPlan(plan);
        setLoading(true);
        setTransactionId(''); // Reset transaction ID

        // Generate UPI QR Code
        const upiId = 'ganshyampaliwal20-2@okhdfcbank';
        const name = 'BillGST';
        const amount = plan.price;
        const upiUrl = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;

        try {
            const qrData = await QRCode.toDataURL(upiUrl);
            setQrCodeData(qrData);
            setShowPaymentModal(true);
        } catch (err) {
            console.error('QR Gen Error', err);
            toast.error('Failed to generate Payment QR');
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async () => {
        if (!transactionId || transactionId.length < 6) {
            toast.error('Please enter a valid Transaction / UTR ID');
            return;
        }

        const confirm = window.confirm(`Confirm payment with Transaction ID: ${transactionId}?`);
        if (!confirm) return;

        setLoading(true);
        try {
            const res = await fetch('/api/subscription/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planType: selectedPlan?.type,
                    transactionId: transactionId
                })
            });

            if (res.ok) {
                toast.success('Plan activated successfully!');
                setShowPaymentModal(false);
                setTimeout(() => window.location.reload(), 1000);
            } else {
                toast.error('Failed to update plan.');
            }
        } catch (err) {
            toast.error('Error verifying payment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Pricing Plans</h1>
            <p className="text-gray-600 mb-8">Choose the right plan for your business needs.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan: any) => {
                    const isActive = currentPlan === plan.type;
                    return (
                        <div key={plan.name} className={`border rounded-xl p-6 relative flex flex-col ${plan.color} shadow-sm hover:shadow-md transition-shadow ${isActive ? 'ring-2 ring-green-500' : ''}`}>
                            {isActive && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium z-10">
                                    Active Plan
                                </span>
                            )}
                            {!isActive && plan.popular && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                                    Most Popular
                                </span>
                            )}
                            <h3 className="text-xl font-bold mb-5 text-center">{plan.name}</h3>
                            <div className="mt-5 flex items-end justify-center gap-1 mb-5">
                                <span className="text-3xl font-bold">₹{plan.price}</span>
                                {plan.price > 0 && <span className="text-gray-500 mb-1">/{plan.duration === '1 Year' ? 'year' : 'mo'}</span>}
                            </div>

                            <ul className="mt-8 space-y-3 flex-1">
                                {plan.features.map((feat: string, i: number) => (
                                    <li key={i} className="ml-10 flex items-center gap-3 py-3 pr-3 pl-6 rounded-lg bg-white border border-slate-100 shadow-sm transition-all text-sm font-bold text-slate-700 hover:border-green-200">
                                        <div className="p-1 rounded-full bg-green-100 shrink-0 flex items-center justify-center">
                                            <FaCheck className="text-green-600 text-[10px]" />
                                        </div>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleUpgrade(plan)}
                                disabled={isActive}
                                className={`mt-6 w-full py-2 rounded-lg font-medium text-white transition-colors ${isActive ? 'bg-green-600 cursor-default' : plan.btnColor}`}
                            >
                                {isActive ? 'Active' : 'Upgrade Now'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <FaTimes />
                        </button>

                        <h3 className="text-xl font-bold mb-4">Scan to Pay ₹{selectedPlan.price}</h3>

                        <div className="bg-white p-4 border rounded-lg flex justify-center mb-4">
                            {qrCodeData ? (
                                <img src={qrCodeData} alt="Payment QR" className="w-48 h-48" />
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 animate-pulse text-xs flex items-center justify-center">Loading QR...</div>
                            )}
                        </div>

                        <div className="text-center text-sm text-gray-600 mb-4 space-y-3">
                            <div>
                                <p className="font-medium text-gray-900 mb-1">UPI ID: ganshyampaliwal20-2@okhdfcbank</p>
                                <p>Scan with any UPI App or click below:</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <a
                                    href={`tez://upi/pay?pa=ganshyampaliwal20-2@okhdfcbank&pn=BillGST&am=${selectedPlan.price}&cu=INR`}
                                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-bold transition-colors border border-slate-200"
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-5" />
                                </a>
                                <a
                                    href={`phonepe://pay?pa=ganshyampaliwal20-2@okhdfcbank&pn=BillGST&am=${selectedPlan.price}&cu=INR`}
                                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-bold transition-colors border border-slate-200"
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-5" />
                                </a>
                                <a
                                    href={`upi://pay?pa=ganshyampaliwal20-2@okhdfcbank&pn=BillGST&am=${selectedPlan.price}&cu=INR`}
                                    className="col-span-2 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl font-bold transition-colors border border-blue-200"
                                >
                                    Pay with any UPI App
                                </a>
                            </div>
                        </div>

                        {/* Transaction ID Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                Enter UTR / Transaction ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 30894728XXXX"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <button
                            onClick={verifyPayment}
                            disabled={loading || transactionId.length < 6}
                            className={`w-full py-3 rounded-lg font-bold transition-colors ${loading || transactionId.length < 6
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {loading ? 'Verifying...' : 'I have Paid'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
