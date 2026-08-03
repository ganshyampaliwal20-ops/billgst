'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { toast, Toaster } from 'react-hot-toast';

function PayContent() {
    const searchParams = useSearchParams();
    const upiId = searchParams.get('pa') || '';
    const name = searchParams.get('pn') || 'Merchant';
    const amount = searchParams.get('am') || '';
    const note = searchParams.get('tn') || 'Payment via BillGST';
    const [copied, setCopied] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }, []);

    // Construct raw UPI URI
    const upiUrl = upiId 
        ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}${amount ? `&am=${encodeURIComponent(amount)}` : ''}&cu=INR&tn=${encodeURIComponent(note)}`
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

        let targetUrl = upiUrl;
        if (appScheme === 'gpay') {
            targetUrl = `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}${amount ? `&am=${encodeURIComponent(amount)}` : ''}&cu=INR&tn=${encodeURIComponent(note)}`;
        } else if (appScheme === 'phonepe') {
            targetUrl = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}${amount ? `&am=${encodeURIComponent(amount)}` : ''}&cu=INR&tn=${encodeURIComponent(note)}`;
        } else if (appScheme === 'paytm') {
            targetUrl = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}${amount ? `&am=${encodeURIComponent(amount)}` : ''}&cu=INR&tn=${encodeURIComponent(note)}`;
        }

        window.location.href = targetUrl;
        // Fallback to standard UPI link after short timeout if specific scheme fails
        setTimeout(() => {
            if (appScheme) {
                window.location.href = upiUrl;
            }
        }, 1200);
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
                    {amount ? (
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>Amount to Pay</span>
                            <div style={{ fontSize: '38px', fontWeight: 800, color: '#22c55e', margin: '4px 0', letterSpacing: '-1px' }}>
                                ₹{Number(amount).toLocaleString('en-IN')}
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '16px', fontSize: '14px', color: '#94a3b8' }}>
                            Enter any amount in your UPI App
                        </div>
                    )}

                    {/* QR Code container */}
                    <div style={{ background: '#ffffff', padding: '16px', borderRadius: '18px', display: 'inline-block', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', marginBottom: '18px' }}>
                        <QRCodeSVG value={upiUrl} size={180} level="M" />
                    </div>

                    {/* UPI ID Pill */}
                    <div onClick={handleCopy} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: '30px', cursor: 'pointer', fontSize: '13px', color: '#e2e8f0', maxWidth: '100%', wordBreak: 'break-all', marginBottom: '24px' }}>
                        <span>💸 {upiId}</span>
                        <span style={{ fontSize: '11px', background: copied ? '#16a34a' : 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                            {copied ? 'Copied ✓' : 'Copy'}
                        </span>
                    </div>

                    {/* App Pay Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
