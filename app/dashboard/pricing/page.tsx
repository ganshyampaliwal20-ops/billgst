
'use client';

import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaQrcode } from 'react-icons/fa';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

type PlanType = 'FREE' | 'BASIC_30' | 'PREMIUM_99' | 'YEARLY_999' | 'LIFETIME';

export default function PricingPage() {
    const [currentPlan, setCurrentPlan] = useState<PlanType>('FREE');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; type: PlanType } | null>(null);
    const [qrCodeData, setQrCodeData] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Mock fetching user plan
    useEffect(() => {
        // In real app, fetch from /api/user/me or similar
        // For MVP, we presume user might know current plan or we fetch if possible.
        // We'll skip fetch for now and default to FREE, or fetch efficiently.
    }, []);

    const plans = [
        {
            name: 'Free (Default)',
            price: 0,
            type: 'FREE',
            features: [
                '30 Invoices / Month',
                '30 Quotations / Month',
                '30 GST Returns / Month',
                'No Invoice QR Code',
                'Basic Support'
            ],
            color: 'bg-gray-100 border-gray-200'
        },
        {
            name: 'Basic',
            price: 30,
            type: 'BASIC_30',
            duration: '1 Month',
            features: [
                'Unlimited Invoices',
                'Unlimited Quotations',
                '30 GST Returns / Month',
                'No Invoice QR Code',
                'Priority Support'
            ],
            color: 'bg-blue-50 border-blue-200',
            btnColor: 'bg-blue-600 hover:bg-blue-700'
        },
        {
            name: 'Premium',
            price: 99,
            type: 'PREMIUM_99',
            duration: '1 Month',
            features: [
                'Unlimited Invoices',
                'Unlimited Quotations',
                'Unlimited GST Returns',
                'Automated Invoice QR Code',
                'Priority Support'
            ],
            color: 'bg-purple-50 border-purple-200',
            btnColor: 'bg-purple-600 hover:bg-purple-700',
            popular: true
        },
        {
            name: 'Yearly Pro',
            price: 999,
            type: 'YEARLY_999',
            duration: '1 Year',
            features: [
                'All Premium Features',
                'Valid for 365 Days',
                'Save ~18%',
                'VIP Support'
            ],
            color: 'bg-amber-50 border-amber-200',
            btnColor: 'bg-amber-600 hover:bg-amber-700'
        }
    ];

    const handleUpgrade = async (plan: any) => {
        setSelectedPlan(plan);
        setLoading(true);

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
        // Mock Payment Verification
        // In real world, we'd ask user for Transaction ID and verify with Bank API or Manual Admin Review.
        // For MVP/Demo: We trust the user or simulate success.

        const confirm = window.confirm("Have you completed the payment?");
        if (!confirm) return;

        setLoading(true);
        try {
            const res = await fetch('/api/subscription/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType: selectedPlan?.type })
            });

            if (res.ok) {
                toast.success('Plan activated successfully!');
                setShowPaymentModal(false);
                // Refresh page or state
                window.location.reload();
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
                {plans.map((plan: any) => (
                    <div key={plan.name} className={`border rounded-xl p-6 relative flex flex-col ${plan.color} shadow-sm hover:shadow-md transition-shadow`}>
                        {plan.popular && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                                Most Popular
                            </span>
                        )}
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <div className="mt-2 flex items-end gap-1">
                            <span className="text-3xl font-bold">₹{plan.price}</span>
                            {plan.price > 0 && <span className="text-gray-500 mb-1">/{plan.duration === '1 Year' ? 'year' : 'mo'}</span>}
                        </div>

                        <ul className="mt-6 space-y-3 flex-1">
                            {plan.features.map((feat: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <FaCheck className="text-green-500 mt-1 shrink-0" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleUpgrade(plan)}
                            disabled={plan.type === 'FREE'}
                            className={`mt-6 w-full py-2 rounded-lg font-medium text-white transition-colors ${plan.type === 'FREE' ? 'bg-gray-400 cursor-not-allowed' : plan.btnColor}`}
                        >
                            {plan.type === 'FREE' ? 'Current Plan' : 'Upgrade Now'}
                        </button>
                    </div>
                ))}
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

                        <div className="text-center text-sm text-gray-600 mb-6">
                            <p className="font-medium text-gray-900 mb-1">UPI ID: ganshyampaliwal20-2@okhdfcbank</p>
                            <p>Scan with GPay, PhonePe, or Paytm</p>
                        </div>

                        <button
                            onClick={verifyPayment}
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                        >
                            {loading ? 'Processing...' : 'I have Paid'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
