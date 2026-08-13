'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { toast, Toaster } from 'react-hot-toast';

function PayContent() {
    const searchParams = useSearchParams();
    const upiId = searchParams.get('pa') || '';
    const name = searchParams.get('pn') || 'Merchant';
    const initialAmount = searchParams.get('am') || '';
    const note = searchParams.get('tn') || 'Payment via BillGST';
    const sid = searchParams.get('sid') || '';
    const cid = searchParams.get('cid') || '';
    const customerName = searchParams.get('cname') || '';

    const [liveAmount, setLiveAmount] = useState(initialAmount);
    const [copied, setCopied] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [hasClickedPay, setHasClickedPay] = useState(false);
    const [utr, setUtr] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }, []);

    useEffect(() => {
        if (sid) {
            fetch(`/api/hisaab/share/${sid}`)
                .then(res => res.json())
                .then(data => {
                    if (data && typeof data.balance === 'number') {
                        setLiveAmount(Math.round(data.balance).toString());
                    }
                })
                .catch(err => console.error("Failed to fetch live amount", err));
        }
    }, [sid]);

    // Construct raw UPI URI
    const upiUrl = upiId 
        ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}${liveAmount ? `&am=${encodeURIComponent(liveAmount)}` : ''}&cu=INR&tn=${encodeURIComponent(note)}`
        : '';

    const handleCopy = () => {
        if (!upiId) return;
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        toast.success('UPI ID copied!');
        setTimeout(() => setCopied(false), 2500);
    };

    const handlePayApp = (appScheme?: string) => {
        if (!upiUrl) {
            toast.error('No UPI ID provided');
            return;
        }

        setHasClickedPay(true);

        let targetUrl = upiUrl;
        if (appScheme === 'gpay') {
            targetUrl = `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}${liveAmount ? `&am=${encodeURIComponent(liveAmount)}` : ''}&cu=INR&tn=${encodeURIComponent(note)}`;
        } else if (appScheme === 'phonepe') {
            targetUrl = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}${liveAmount ? `&am=${encodeURIComponent(liveAmount)}` : ''}&cu=INR&tn=${encodeURIComponent(note)}`;
        } else if (appScheme === 'paytm') {
            targetUrl = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}${liveAmount ? `&am=${encodeURIComponent(liveAmount)}` : ''}&cu=INR&tn=${encodeURIComponent(note)}`;
        }

        window.location.href = targetUrl;
        // Fallback to standard UPI link after short timeout if specific scheme fails
        setTimeout(() => {
            if (appScheme) {
                window.location.href = upiUrl;
            }
        }, 1200);
    };

    const handleConfirmPayment = async () => {
        if (!liveAmount || Number(liveAmount) <= 0) {
            toast.error('Amount is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/public/pay/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sid,
                    cid,
                    amt: Number(liveAmount),
                    method: 'UPI Online',
                    utr: utr.trim(),
                    customerName,
                    upiId
                })
            });

            const data = await res.json();
            if (res.ok) {
                setIsSuccess(true);
                toast.success('Payment Recorded Successfully! ✅');
            } else {
                toast.error(data.error || 'Failed to record payment');
            }
        } catch (e) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!upiId) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f19', color: '#fff', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ maxWidth: '400px', width: '100%', background: '#161e2e', padding: '32px', borderRadius: '20px', textAlign: 'center', border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Invalid Payment Link</h2>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>This payment link is missing the recipient UPI ID.</p>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #064e3b 0%, #0b0f19 60%, #030712 100%)', color: '#fff', padding: '24px 16px', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Toaster position="top-center" />
                <div style={{ maxWidth: '420px', width: '100%', background: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(16px)', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '32px 24px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}>
                    <div style={{ width: '72px', height: '72px', background: 'rgba(34, 197, 94, 0.15)', border: '2px solid #22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '36px' }}>
                        ✓
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#22c55e', margin: '0 0 8px' }}>Payment Notification Sent!</h2>
                    <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 20px' }}>
                        Aapke ₹{Number(liveAmount).toLocaleString('en-IN')} payment ki jaankari <strong>{name}</strong> ke hisaab mein record ho gayi hai.
                    </p>

                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '14px', marginBottom: '24px', textAlign: 'left', fontSize: '13px', color: '#94a3b8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span>Amount:</span>
                            <span style={{ color: '#fff', fontWeight: 600 }}>₹{Number(liveAmount).toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span>To:</span>
                            <span style={{ color: '#fff', fontWeight: 600 }}>{name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Status:</span>
                            <span style={{ color: '#22c55e', fontWeight: 700 }}>Recorded ✓</span>
                        </div>
                    </div>

                    {sid && (
                        <a href={`/h/${sid}`} style={{ display: 'block', width: '100%', background: '#22c55e', color: '#fff', padding: '12px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', marginBottom: '10px' }}>
                            📄 Poora Hisaab Statement Dekhein
                        </a>
                    )}

                    <div style={{ fontSize: '11px', color: '#64748b', margin: '16px 0 0 0' }}>
                        Powered by BillGST.in · India's Smart Billing App
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #1e1b4b 0%, #0b0f19 50%, #030712 100%)', color: '#fff', padding: '24px 16px', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Toaster position="top-center" />
            
            <div style={{ maxWidth: '440px', width: '100%', background: 'rgba(17, 24, 39, 0.85)', backdropFilter: 'blur(16px)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '24px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
                        <span>🛡️</span> Verified Merchant
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>{name}</h1>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>BillGST Fast Secure UPI Checkout</p>
                </div>

                {/* Amount Box */}
                <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                    {liveAmount ? (
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>Amount to Pay</span>
                            <div style={{ fontSize: '38px', fontWeight: 800, color: '#22c55e', margin: '4px 0', letterSpacing: '-1px' }}>
                                ₹{Number(liveAmount).toLocaleString('en-IN')}
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '16px', fontSize: '14px', color: '#94a3b8' }}>
                            Enter any amount in your UPI App
                        </div>
                    )}

                    {sid && (
                        <a href={`/h/${sid}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60a5fa', padding: '10px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', marginBottom: '24px', transition: 'all 0.2s ease' }}>
                            📄 Pura Hisaab Dekhein
                        </a>
                    )}

                    {/* QR Code container */}
                    <div style={{ background: '#ffffff', padding: '16px', borderRadius: '18px', display: 'inline-block', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', marginBottom: '18px' }}>
                        <QRCodeSVG value={upiUrl} size={180} level="M" />
                    </div>

                    {/* UPI ID Pill */}
                    <div onClick={handleCopy} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: '30px', cursor: 'pointer', fontSize: '13px', color: '#e2e8f0', maxWidth: '100%', wordBreak: 'break-all', marginBottom: '20px' }}>
                        <span>💸 {upiId}</span>
                        <span style={{ fontSize: '11px', background: copied ? '#16a34a' : 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                            {copied ? 'Copied ✓' : 'Copy'}
                        </span>
                    </div>

                    {/* App Pay Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        <button onClick={() => handlePayApp()} style={{ width: '100%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 20px -4px rgba(34, 197, 94, 0.4)' }}>
                            <span>⚡</span> Pay with Any UPI App
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <button onClick={() => handlePayApp('gpay')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                Google Pay
                            </button>
                            <button onClick={() => handlePayApp('phonepe')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                PhonePe
                            </button>
                            <button onClick={() => handlePayApp('paytm')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                Paytm
                            </button>
                        </div>
                    </div>

                    {/* Confirmation / I Have Paid Box */}
                    <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px dashed rgba(34, 197, 94, 0.4)', borderRadius: '16px', padding: '16px', marginTop: '12px', textAlign: 'left' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#86efac', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📢</span> Payment Complete Ho Gaya?
                        </div>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px', lineHeight: '1.4' }}>
                            Agar aapne payment kar diya hai, toh niche button par click karein taaki hisaab mein entry jud sake.
                        </p>

                        <input 
                            type="text" 
                            placeholder="UTR / UPI Ref No. (Optional)" 
                            value={utr}
                            onChange={(e) => setUtr(e.target.value)}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px', marginBottom: '10px', outline: 'none' }}
                        />

                        <button 
                            onClick={handleConfirmPayment}
                            disabled={isSubmitting}
                            style={{ width: '100%', background: '#22c55e', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                            {isSubmitting ? 'Recording...' : `✅ Maine ₹${amount || 'Payment'} Pay Kar Diya`}
                        </button>
                    </div>

                    <div style={{ marginTop: '20px', fontSize: '11px', color: '#64748b' }}>
                        🔒 100% Direct Bank Transfer · Zero Middleman Fees · Powered by BillGST
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PayPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading payment portal...</div>}>
            <PayContent />
        </Suspense>
    );
}
