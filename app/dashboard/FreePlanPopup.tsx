'use client';

import { useState, useEffect } from 'react';
import { FaGift, FaTimes, FaRocket, FaCrown, FaCopy, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function FreePlanPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [remaining, setRemaining] = useState(100);
    const couponCode = 'BILLGST';

    useEffect(() => {
        let dismissed = false;
        try {
            dismissed = !!sessionStorage.getItem('free_plan_popup_dismissed');
        } catch (e) { /* ignore */ }

        if (dismissed) return;

        const checkStatus = async () => {
            try {
                const res = await fetch('/api/subscription/free-plan');
                const data = await res.json();
                
                if (data.userClaimed || data.remaining <= 0) {
                    return; // Don't show
                }
                
                setRemaining(data.remaining);
                
                // Show after a short delay
                setTimeout(() => {
                    setIsVisible(true);
                }, 3000); // 3 seconds delay
            } catch (err) {
                console.error("Failed to check free plan status by API", err);
            }
        };
        checkStatus();
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        try {
            sessionStorage.setItem('free_plan_popup_dismissed', 'true');
        } catch (e) { /* ignore */ }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(couponCode);
        setCopied(true);
        toast.success('Coupon Code Copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClaim = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/subscription/free-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('🎉 Free Plan Activated! You now have 1 Month of Premium for Free.');
                setIsVisible(false);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error(data.error || 'Failed to claim free plan.');
            }
        } catch (err) {
            toast.error('Network Error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-4 border-indigo-100">
                {/* Background Decor */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl"></div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all z-10"
                >
                    <FaTimes size={20} />
                </button>

                <div className="p-8 pb-10 flex flex-col items-center text-center relative">
                    {/* Icon Header */}
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-xl shadow-indigo-200 mb-8 animate-bounce">
                        <FaGift />
                    </div>

                    <div className="space-y-3 mb-8">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <FaCrown className="text-amber-500 text-sm animate-pulse" />
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Special Invitation</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none italic">
                            FREE PLAN <br /> FOR YOU!
                        </h2>
                        <p className="text-sm font-bold text-slate-500 leading-relaxed px-4">
                            Pehle 100 users ke liye premium plan bilkul free hai! Sirf <span className="text-indigo-600 font-black">{remaining} spots left</span>, claim karein abhi.
                        </p>
                    </div>

                    {/* Coupon Box */}
                    <div className="w-full bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2rem] p-6 mb-8 group transition-all hover:border-indigo-400 relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Use Coupon Code</p>
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-2xl font-black text-indigo-600 tracking-widest italic">{couponCode}</span>
                            <button
                                onClick={handleCopy}
                                className={`p-3 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm hover:text-indigo-600 hover:shadow-md'}`}
                            >
                                {copied ? <FaCheck /> : <FaCopy />}
                            </button>
                        </div>
                    </div>

                    {/* Claim Button */}
                    <button
                        onClick={handleClaim}
                        disabled={loading}
                        className={`
                            w-full py-5 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl transition-all 
                            flex items-center justify-center gap-3 border-b-8 
                            ${loading ? 'bg-indigo-400 border-indigo-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 border-indigo-900 shadow-indigo-200'}
                        `}
                    >
                        <FaRocket className={loading ? 'animate-bounce' : ''} />
                        {loading ? 'Activating...' : 'Claim My Free Plan'}
                    </button>

                    <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        * Valid for limited registrations only
                    </p>
                </div>
            </div>
        </div>
    );
}
