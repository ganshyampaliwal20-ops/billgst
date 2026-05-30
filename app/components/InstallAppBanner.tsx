'use client';
import { useState, useEffect } from 'react';
import { FaGooglePlay, FaTimes } from 'react-icons/fa';
import { Capacitor } from '@capacitor/core';

export default function InstallAppBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Do not show if inside native Capacitor app
        if (Capacitor.isNativePlatform()) {
            return;
        }

        // Do not show if already dismissed in web
        const isDismissed = localStorage.getItem('billgst_playstore_dismissed') === 'true';

        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

        if (isMobile && !isDismissed) {
            // Add a small delay so it doesn't jump immediately on load
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('billgst_playstore_dismissed', 'true');
    };

    if (!showBanner) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-[#121a2f] border border-white/10 rounded-2xl p-6 text-center shadow-2xl relative w-full max-w-sm animate-scaleIn">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                `}} />
                
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-white/50 hover:text-white p-2 rounded-full bg-white/5 transition-colors"
                >
                    <FaTimes size={16} />
                </button>

                <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 p-2 shadow-xl flex items-center justify-center">
                    <img src="/logo.png" alt="BillGST Logo" className="w-full h-full object-contain" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Download App</h2>
                <p className="text-white/70 text-sm mb-6 leading-relaxed">
                    Sabse behtar experience ke liye BillGST App Google Play Store se download karein!
                </p>

                <a 
                    href="https://play.google.com/store/apps/details?id=in.billgst.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={handleDismiss}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white w-full py-4 rounded-xl font-bold text-lg shadow-[0_10px_20px_rgba(34,197,94,0.3)] transition-all transform hover:scale-105 active:scale-95"
                >
                    <FaGooglePlay size={24} /> Get it on Play Store
                </a>
                
                <button 
                    onClick={handleDismiss}
                    className="mt-4 text-white/50 text-xs uppercase font-bold tracking-wider hover:text-white transition-colors"
                >
                    Continue in browser
                </button>
            </div>
        </div>
    );
}
