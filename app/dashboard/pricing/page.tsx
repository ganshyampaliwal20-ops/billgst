'use client';

import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

type PlanType = 'FREE' | 'BASIC_30' | 'PREMIUM_99' | 'YEARLY_299' | 'LIFETIME';

export default function PricingPage() {
    const [currentPlan, setCurrentPlan] = useState<PlanType>('FREE');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; type: PlanType } | null>(null);
    const [qrCodeData, setQrCodeData] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/subscription/status');
                if (res.ok) {
                    const data = await res.json();
                    setCurrentPlan(data.plan);
                    if (data.status === 'PENDING') {
                        setTransactionId('PENDING_REVIEW');
                        toast.loading('Your previous payment is still under review.', { duration: 4000 });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch plan status", err);
            }
        };
        fetchStatus();
    }, []);

    const handleUpgrade = async (plan: { name: string; price: number; type: PlanType }) => {
        setSelectedPlan(plan);
        setLoading(true);
        setTransactionId('');

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
        if (!transactionId || transactionId.length !== 12) {
            toast.error('Please enter a valid 12-digit UTR Number');
            return;
        }

        setLoading(true);
        setTimeout(async () => {
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
                    toast.success('Payment details submitted! Your plan will activate within 1-2 hours after verification. ⏳', { duration: 5000 });
                    setShowPaymentModal(false);
                    setTimeout(() => window.location.reload(), 3000);
                } else {
                    toast.error('Failed to verify payment. Please try again.');
                    setLoading(false);
                }
            } catch (err) {
                toast.error('Error verifying payment.');
                setLoading(false);
            }
        }, 2500);
    };

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f7f6f3', color: '#0d0d0d', minHeight: '100vh', padding: 0 }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

                :root {
                  --bg: #f7f6f3;
                  --white: #ffffff;
                  --ink: #0d0d0d;
                  --ink2: #444;
                  --ink3: #888;
                  --border: #e5e3de;
                  --blue: #1a56ff;
                  --blue-soft: #eef1ff;
                  --purple: #6c2ef7;
                  --purple-soft: #f1ecff;
                  --green: #00a86b;
                  --green-soft: #e6f7f1;
                  --orange: #f97316;
                  --radius: 20px;
                  --radius-sm: 12px;
                }

                .pricing-container {
                    position: relative;
                    z-index: 1;
                }

                .pricing-container::before {
                  content: '';
                  position: fixed; inset: 0; z-index: 0;
                  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
                  pointer-events: none;
                }

                .hero {
                  position: relative; z-index: 1;
                  padding: 40px 24px 0px;
                  text-align: center;
                  max-width: 700px;
                  margin: 0 auto;
                }

                .logo-chip {
                  display: inline-flex; align-items: center; gap: 9px;
                  background: var(--white);
                  border: 0.5px solid var(--border);
                  border-radius: 99px;
                  padding: 7px 16px 7px 9px;
                  margin-bottom: 28px;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                }
                .logo-chip-icon {
                  width: 28px; height: 28px;
                  background: linear-gradient(135deg,#1a1f6e,#1a56ff);
                  border-radius: 8px;
                  display: flex; align-items: center; justify-content: center;
                }
                .logo-chip-icon svg { width: 14px; height: 14px; }
                .logo-chip-name {
                  font-family: 'Bricolage Grotesque', sans-serif;
                  font-size: 14px; font-weight: 700; color: var(--ink);
                }

                .hero-eyebrow {
                  display: inline-flex; align-items: center; gap: 6px;
                  background: #fff8e6;
                  border: 0.5px solid #f5d06a;
                  border-radius: 99px;
                  padding: 4px 14px;
                  font-size: 12px; font-weight: 600; color: #92600a;
                  margin-bottom: 20px;
                  letter-spacing: 0.3px;
                }
                .hero-eyebrow-dot {
                  width: 6px; height: 6px; border-radius: 50%;
                  background: #f59e0b; animation: blink 2s infinite;
                }

                @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

                .hero h1 {
                  font-family: 'Bricolage Grotesque', sans-serif;
                  font-size: clamp(32px,6vw,54px);
                  font-weight: 800;
                  line-height: 1.08;
                  letter-spacing: -2px;
                  color: var(--ink);
                  margin-bottom: 16px;
                }
                .hero h1 em {
                  font-style: normal;
                  position: relative;
                  display: inline-block;
                }
                .hero h1 em::after {
                  content: '';
                  position: absolute;
                  bottom: 2px; left: 0; right: 0;
                  height: 3px;
                  background: linear-gradient(90deg, #1a56ff, #6c2ef7);
                  border-radius: 2px;
                  transform: scaleX(1);
                }

                .hero-sub {
                  font-size: 16px;
                  color: var(--ink3);
                  line-height: 1.65;
                  max-width: 460px;
                  margin: 0 auto 32px;
                }

                .trust-row {
                  display: flex; align-items: center; justify-content: center;
                  gap: 20px; flex-wrap: wrap;
                  margin-bottom: 0;
                }
                .trust-item {
                  display: flex; align-items: center; gap: 6px;
                  font-size: 12px; color: var(--ink3); font-weight: 500;
                }
                .trust-icon { font-size: 14px; }

                .plans-section {
                  position: relative; z-index: 1;
                  max-width: 1080px;
                  margin: 0 auto;
                  padding: 5px 24px 80px;
                }

                .plans-grid {
                  display: grid;
                  grid-template-columns: repeat(4,1fr);
                  gap: 14px;
                  align-items: stretch;
                }

                .plan {
                  background: var(--white);
                  border: 1px solid var(--border);
                  border-radius: var(--radius);
                  padding: 26px 22px 22px;
                  display: flex;
                  flex-direction: column;
                  position: relative;
                  transition: box-shadow 0.25s ease, transform 0.25s ease;
                  overflow: visible;
                }
                .plan:hover {
                  box-shadow: 0 16px 48px rgba(0,0,0,0.1);
                  transform: translateY(-5px);
                }

                .plan.featured {
                  background: #0d0d0d;
                  border-color: #0d0d0d;
                  color: #f0f0f0;
                }
                .plan.featured .plan-name { color: #fff; }
                .plan.featured .plan-desc { color: #999; }
                .plan.featured .divider3 { background: #2a2a2a; }
                .plan.featured .feat3 { color: #d0d0d0; }
                .plan.featured .price-sym, .plan.featured .price-per { color: #777; }
                .plan.featured .price-num { color: #fff; }

                .discount-badge {
                  position: absolute;
                  top: -12px; right: 18px;
                  background: linear-gradient(135deg, #ff3b3b, #ff6b35);
                  color: #fff;
                  font-family: 'Bricolage Grotesque', sans-serif;
                  font-size: 11px; font-weight: 700;
                  padding: 4px 10px;
                  border-radius: 99px;
                  box-shadow: 0 4px 12px rgba(255,59,59,0.4);
                  letter-spacing: 0.3px;
                }

                .featured-badge {
                  position: absolute;
                  top: -14px; left: 50%; transform: translateX(-50%);
                  background: linear-gradient(135deg,#1a56ff,#6c2ef7);
                  color: #fff;
                  font-family: 'Bricolage Grotesque', sans-serif;
                  font-size: 11px; font-weight: 700;
                  padding: 5px 16px;
                  border-radius: 99px;
                  white-space: nowrap;
                  box-shadow: 0 4px 16px rgba(108,46,247,0.4);
                  letter-spacing: 0.4px;
                }

                .plan-header { margin-bottom: 18px; }
                .plan-icon-wrap {
                  width: 42px; height: 42px;
                  border-radius: 12px;
                  display: flex; align-items: center; justify-content: center;
                  margin-bottom: 14px;
                }
                .plan-icon-wrap svg { width: 20px; height: 20px; }

                .plan-name {
                  font-family: 'Bricolage Grotesque', sans-serif;
                  font-size: 20px; font-weight: 700;
                  color: var(--ink); line-height: 1;
                  margin-bottom: 5px;
                }
                .plan-desc { font-size: 12px; color: var(--ink3); line-height: 1.5; }

                .price-block { margin: 18px 0; }

                .original-price {
                  display: inline-flex; align-items: center; gap: 6px;
                  margin-bottom: 4px;
                }
                .strikethrough {
                  font-size: 15px; font-weight: 500;
                  color: var(--ink3);
                  text-decoration: line-through;
                  text-decoration-color: #ff3b3b;
                  text-decoration-thickness: 2px;
                }
                .save-tag {
                  font-size: 10px; font-weight: 700;
                  background: #fff0f0; color: #e53e3e;
                  padding: 2px 7px; border-radius: 99px;
                  border: 0.5px solid #fecaca;
                }
                .plan.featured .save-tag { background: rgba(255,0,0,0.2); border-color: rgba(255,0,0,0.3); }

                .price-main { display: flex; align-items: baseline; gap: 1px; }
                .price-sym {
                  font-family: 'Bricolage Grotesque', sans-serif;
                  font-size: 18px; font-weight: 600;
                  color: var(--ink3); margin-right: 2px;
                }
                .price-num {
                  font-family: 'Bricolage Grotesque', sans-serif;
                  font-size: 46px; font-weight: 800;
                  color: var(--ink); line-height: 1;
                  letter-spacing: -2.5px;
                }
                .price-per {
                  font-size: 12px; color: var(--ink3);
                  margin-left: 4px; align-self: flex-end;
                  padding-bottom: 6px;
                }

                .per-month-note {
                  font-size: 11px; color: var(--green); font-weight: 600;
                  margin-top: 4px;
                }

                .divider3 { height: 1px; background: var(--border); margin: 16px 0; }

                .feats3 {
                  list-style: none;
                  display: flex; flex-direction: column;
                  gap: 9px; flex: 1; margin-bottom: 22px;
                  padding: 0;
                }
                .feat3 {
                  display: flex; align-items: flex-start; gap: 9px;
                  font-size: 13px; color: var(--ink2); line-height: 1.4;
                }
                .feat3-icon {
                  width: 18px; height: 18px; border-radius: 50%;
                  flex-shrink: 0; margin-top: 1px;
                  display: flex; align-items: center; justify-content: center;
                }
                .feat3-icon.ok { background: #e6f7f1; }
                .feat3-icon.ok svg { color: #00a86b; }
                .feat3-icon.no { background: #f5f5f5; }
                .feat3-icon.no svg { color: #ccc; }

                .cta3 {
                  display: block; width: 100%;
                  padding: 13px 20px;
                  border-radius: var(--radius-sm);
                  font-family: 'Bricolage Grotesque', sans-serif;
                  font-size: 14px; font-weight: 700;
                  text-align: center; text-decoration: none;
                  cursor: pointer; border: none;
                  letter-spacing: 0.2px;
                  transition: all 0.18s ease;
                }
                .cta3:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .cta3:not(:disabled):hover { transform: translateY(-1px); }
                .cta3:not(:disabled):active { transform: scale(0.98); }

                .cta-blue {
                  background: linear-gradient(135deg,#1a56ff,#3b6eff);
                  color: #fff;
                  box-shadow: 0 4px 20px rgba(26,86,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
                }
                .cta-blue:not(:disabled):hover { box-shadow: 0 8px 28px rgba(26,86,255,0.45); }

                .cta-white {
                  background: #fff;
                  color: #0d0d0d;
                  box-shadow: 0 2px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9);
                }
                .cta-white:not(:disabled):hover { box-shadow: 0 6px 20px rgba(0,0,0,0.18); }

                .cta-green {
                  background: linear-gradient(135deg,#00a86b,#00c47d);
                  color: #fff;
                  box-shadow: 0 4px 20px rgba(0,168,107,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
                }
                .cta-green:not(:disabled):hover { box-shadow: 0 8px 28px rgba(0,168,107,0.45); }

                .active-indicator {
                  display: flex; align-items: center; justify-content: center; gap: 6px;
                  font-size: 12px; font-weight: 600; color: #00a86b;
                  padding: 10px;
                  background: var(--green-soft);
                  border-radius: var(--radius-sm);
                  border: 1px solid rgba(0,168,107,0.25);
                  margin-top: 10px;
                }
                .active-dot { width: 7px; height: 7px; border-radius: 50%; background: #00a86b; animation: blink 2s infinite; }

                .pricing-footer {
                  position: relative; z-index: 1;
                  text-align: center;
                  padding: 0 24px 48px;
                }
                .footer-badges {
                  display: flex; align-items: center; justify-content: center;
                  gap: 24px; flex-wrap: wrap;
                  margin-bottom: 16px;
                }
                .footer-badge {
                  display: flex; align-items: center; gap: 7px;
                  font-size: 13px; color: var(--ink3); font-weight: 500;
                }
                .footer-badge svg { width: 16px; height: 16px; color: var(--green); }
                .footer-note { font-size: 12px; color: var(--ink3); }
                .footer-note a { color: var(--blue); text-decoration: none; font-weight: 500; }

                @keyframes fadeUp {
                  from { opacity:0; transform:translateY(24px); }
                  to   { opacity:1; transform:translateY(0); }
                }
                .plan { animation: fadeUp 0.5s ease both; }
                .plan:nth-child(1){animation-delay:.05s}
                .plan:nth-child(2){animation-delay:.13s}
                .plan:nth-child(3){animation-delay:.21s}
                .plan:nth-child(4){animation-delay:.29s}

                @media (max-width: 768px) {
                  .plans-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
                  .hero h1 { font-size: 30px; }
                }
                @media (max-width: 480px) {
                  .plans-grid { grid-template-columns: 1fr; }
                  .plans-section { padding: 5px 16px 60px; margin-top: 0; }
                  .hero { padding: 20px 16px 0px; }
                }
            ` }} />

            <div className="pricing-container">
                <div className="hero">
                    <div className="logo-chip">
                        <div className="logo-chip-icon" style={{ background: 'transparent' }}>
                            <img src="/logo.png" alt="BillGST Logo" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'contain' }} />
                        </div>
                        <span className="logo-chip-name">BillGST</span>
                    </div>

                    <div className="hero-eyebrow">
                        <span className="hero-eyebrow-dot"></span>
                        Limited Time Offer — Abhi upgrade karein
                    </div>

                    <h1>Simple plans,<br /><em>powerful</em> features</h1>
                    <p className="hero-sub">Koi hidden charge nahi. Koi contract nahi. Bas apna business badhao — baaki sab hum dekhenge.</p>

                    <div className="trust-row">
                        <div className="trust-item"><span className="trust-icon">🔒</span> Secure Payment</div>
                        <div className="trust-item"><span className="trust-icon">↩</span> Cancel Anytime</div>
                        <div className="trust-item"><span className="trust-icon">⚡</span> Instant Activation</div>
                        <div className="trust-item"><span className="trust-icon">🇮🇳</span> Made in India</div>
                    </div>
                </div>

                <div className="plans-section">
                    <div className="plans-grid">
                        {/* FREE PLAN  */}
                        <div className="plan">
                            <div className="plan-header">
                                <div className="plan-icon-wrap" style={{ background: '#f5f5f5' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8">
                                        <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                                        <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
                                    </svg>
                                </div>
                                <div className="plan-name">Free</div>
                                <div className="plan-desc">Shuruat karne ke liye</div>
                            </div>

                            <div className="price-block">
                                <div className="price-main">
                                    <span className="price-sym">₹</span>
                                    <span className="price-num">0</span>
                                    <span className="price-per">/month</span>
                                </div>
                            </div>

                            <div className="divider3"></div>

                            <ul className="feats3">
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    30 Invoices &amp; 30 Quotations/mo
                                </li>
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Basic Customer Ledger
                                </li>
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Single Business Manage
                                </li>
                                <li className="feat3">
                                    <span className="feat3-icon no"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg></span>
                                    UPI QR Code Payment
                                </li>
                                <li className="feat3">
                                    <span className="feat3-icon no"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg></span>
                                    Priority Support
                                </li>
                            </ul>

                            {currentPlan === 'FREE' ? (
                                <div className="active-indicator">
                                    <span className="active-dot"></span> Current Plan
                                </div>
                            ) : (
                                <div style={{ padding: '22px' }}></div>
                            )}
                        </div>

                        {/* BASIC STARTER */}
                        <div className="plan">
                            <div className="discount-badge">70% OFF</div>
                            <div className="plan-header">
                                <div className="plan-icon-wrap" style={{ background: '#eef1ff' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#1a56ff" strokeWidth="1.8">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                                    </svg>
                                </div>
                                <div className="plan-name">Basic Starter</div>
                                <div className="plan-desc">Chhote business ke liye</div>
                            </div>

                            <div className="price-block">
                                <div className="original-price">
                                    <span className="strikethrough">₹99</span>
                                    <span className="save-tag">Save ₹69</span>
                                </div>
                                <div className="price-main">
                                    <span className="price-sym" style={{ color: '#1a56ff' }}>₹</span>
                                    <span className="price-num" style={{ color: '#1a56ff' }}>30</span>
                                    <span className="price-per">/month</span>
                                </div>
                            </div>

                            <div className="divider3"></div>

                            <ul className="feats3">
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    100 Invoices / Month
                                </li>
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Unlimited Quotations
                                </li>
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Invoice UPI QR Code
                                </li>
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Basic Inventory Management
                                </li>
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Priority WhatsApp Support
                                </li>
                            </ul>

                            {currentPlan === 'BASIC_30' ? (
                                <div className="active-indicator">
                                    <span className="active-dot"></span> Active Plan
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade({ name: 'Basic Starter', price: 30, type: 'BASIC_30' })}
                                    disabled={transactionId === 'PENDING_REVIEW'}
                                    className="cta3 cta-blue"
                                >
                                    {transactionId === 'PENDING_REVIEW' ? 'Review Pending ⏳' : 'Upgrade Now →'}
                                </button>
                            )}
                        </div>

                        {/* PREMIUM GROWTH */}
                        <div className="plan featured">
                            <div className="featured-badge">✦ Most Popular</div>
                            <div className="discount-badge" style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', boxShadow: '0 4px 12px rgba(124,58,237,0.5)' }}>50% OFF</div>

                            <div className="plan-header">
                                <div className="plan-icon-wrap" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.8">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </div>
                                <div className="plan-name">Premium Growth</div>
                                <div className="plan-desc">Growing businesses ke liye</div>
                            </div>

                            <div className="price-block">
                                <div className="original-price">
                                    <span className="strikethrough" style={{ color: '#666' }}>₹199</span>
                                    <span className="save-tag">Save ₹100</span>
                                </div>
                                <div className="price-main">
                                    <span className="price-sym" style={{ color: '#c4b5fd' }}>₹</span>
                                    <span className="price-num" style={{ color: '#fff' }}>99</span>
                                    <span className="price-per" style={{ color: '#777' }}>/3 months</span>
                                </div>
                                <div className="per-month-note">= Sirf ₹33/month</div>
                            </div>

                            <div className="divider3"></div>

                            <ul className="feats3">
                                <li className="feat3" style={{ color: '#d0d0d0' }}>
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Unlimited Invoices &amp; Quotations
                                </li>
                                <li className="feat3" style={{ color: '#d0d0d0' }}>
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Customer Hisaab &amp; Unlimited Ledger
                                </li>
                                <li className="feat3" style={{ color: '#d0d0d0' }}>
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Advanced Inventory Control
                                </li>
                                <li className="feat3" style={{ color: '#d0d0d0' }}>
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Auto QR Code &amp; WhatsApp Export
                                </li>
                                <li className="feat3" style={{ color: '#d0d0d0' }}>
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Dedicated Priority Support
                                </li>
                            </ul>

                            {currentPlan === 'PREMIUM_99' ? (
                                <div className="active-indicator">
                                    <span className="active-dot"></span> Active Plan
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade({ name: 'Premium Growth', price: 99, type: 'PREMIUM_99' })}
                                    disabled={transactionId === 'PENDING_REVIEW'}
                                    className="cta3 cta-white"
                                >
                                    {transactionId === 'PENDING_REVIEW' ? 'Review Pending ⏳' : 'Get Premium →'}
                                </button>
                            )}
                        </div>

                        {/* YEARLY PRO */}
                        <div className="plan">
                            <div className="discount-badge" style={{ background: 'linear-gradient(135deg,#059669,#00c47d)', boxShadow: '0 4px 12px rgba(5,150,105,0.45)' }}>70% OFF</div>
                            <div className="plan-header">
                                <div className="plan-icon-wrap" style={{ background: '#e6f7f1' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#00a86b" strokeWidth="1.8">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        <path d="M9 12l2 2 4-4" />
                                    </svg>
                                </div>
                                <div className="plan-name">Yearly Pro</div>
                                <div className="plan-desc">Sab se zyada savings</div>
                            </div>

                            <div className="price-block">
                                <div className="original-price">
                                    <span className="strikethrough">₹999</span>
                                    <span className="save-tag">Save ₹700</span>
                                </div>
                                <div className="price-main">
                                    <span className="price-sym" style={{ color: '#00a86b' }}>₹</span>
                                    <span className="price-num" style={{ color: '#00a86b' }}>299</span>
                                    <span className="price-per">/year</span>
                                </div>
                                <div className="per-month-note">= Sirf ₹25/month — Best Deal!</div>
                            </div>

                            <div className="divider3"></div>

                            <ul className="feats3">
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    All Premium — 365 Days
                                </li>
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Fully Unlimited Billing &amp; Inventory
                                </li>
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Custom Invoice Themes &amp; Branding
                                </li>
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    Cloud Auto-Backup &amp; Reports
                                </li>
                                <li className="feat3">
                                    <span className="feat3-icon ok"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    24/7 Developer Support
                                </li>
                            </ul>

                            {currentPlan === 'YEARLY_299' ? (
                                <div className="active-indicator">
                                    <span className="active-dot"></span> Active Plan
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade({ name: 'Yearly Pro', price: 299, type: 'YEARLY_299' })}
                                    disabled={transactionId === 'PENDING_REVIEW'}
                                    className="cta3 cta-green"
                                >
                                    {transactionId === 'PENDING_REVIEW' ? 'Review Pending ⏳' : 'Get Yearly Pro →'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pricing-footer">
                    <div className="footer-badges">
                        <div className="footer-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            100% Secure Payment
                        </div>
                        <div className="footer-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            No Hidden Charges
                        </div>
                        <div className="footer-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Cancel Anytime
                        </div>
                        <div className="footer-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            24/7 Support
                        </div>
                    </div>
                    <p className="footer-note">
                        Questions hain? <a href="https://wa.me/919930205159">WhatsApp karein</a> · <a href="https://billgst.com">billgst.com</a> · &copy; 2026 BillGST
                    </p>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full relative animate-in fade-in zoom-in duration-200" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <FaTimes />
                        </button>

                        <h3 className="text-xl font-bold mb-4" style={{ color: '#0d0d0d' }}>Scan to Pay ₹{selectedPlan.price}</h3>

                        <div className="bg-white p-4 border rounded-lg flex justify-center mb-4">
                            {qrCodeData ? (
                                <img src={qrCodeData} alt="Payment QR" className="w-48 h-48" />
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 animate-pulse text-xs flex items-center justify-center text-slate-800">Loading QR...</div>
                            )}
                        </div>

                        <div className="text-center text-sm text-gray-600 mb-4 space-y-3">
                            <div>
                                <p className="font-medium text-gray-900 mb-1">UPI ID: ganshyampaliwal20-2@okhdfcbank</p>
                                <p>Scan with any UPI App or click below:</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <a
                                    href={`tez://upi/pay?pa=ganshyampaliwal20-2@okhdfcbank&pn=BillGST&am=${selectedPlan.price}&cu=INR`}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" style={{ height: '20px' }} />
                                </a>
                                <a
                                    href={`phonepe://pay?pa=ganshyampaliwal20-2@okhdfcbank&pn=BillGST&am=${selectedPlan.price}&cu=INR`}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" style={{ height: '20px' }} />
                                </a>
                                <a
                                    href={`upi://pay?pa=ganshyampaliwal20-2@okhdfcbank&pn=BillGST&am=${selectedPlan.price}&cu=INR`}
                                    style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe', textDecoration: 'none' }}
                                >
                                    Pay with any UPI App
                                </a>
                            </div>
                        </div>

                        {/* Professional UTR Input */}
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
                                <span style={{ background: '#dbeafe', color: '#2563eb', padding: '4px', borderRadius: '6px', fontSize: '10px' }}>VERIFY</span>
                                Enter 12-Digit UTR / Ref. Number
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>#</span>
                                <input
                                    type="text"
                                    placeholder="e.g. 308947281234"
                                    maxLength={12}
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value.replace(/[^0-9]/g, ''))}
                                    style={{ width: '100%', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px 10px 32px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', outline: 'none' }}
                                />
                            </div>
                            <p style={{ fontSize: '10px', color: '#64748b', marginTop: '8px', textAlign: 'left' }}>
                                Found in your UPI app's transaction history after payment.
                            </p>
                        </div>

                        <button
                            onClick={verifyPayment}
                            disabled={loading || transactionId.length !== 12}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: (loading || transactionId.length !== 12) ? 'not-allowed' : 'pointer',
                                background: (loading || transactionId.length !== 12) ? '#f1f5f9' : 'linear-gradient(135deg, #10b981, #059669)',
                                color: (loading || transactionId.length !== 12) ? '#94a3b8' : '#ffffff',
                                boxShadow: (loading || transactionId.length !== 12) ? 'none' : '0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.1)'
                            }}
                        >
                            {loading ? 'Verifying Payment...' : 'Verify & Activate Plan ✅'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
