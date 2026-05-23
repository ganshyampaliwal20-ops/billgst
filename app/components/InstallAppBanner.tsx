'use client';
import { useState, useEffect } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';

export default function InstallAppBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // 1. Check if running in standalone mode (already installed and opened as app)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        
        // 2. Check localStorage for previous installation or dismissal
        const isAlreadyInstalled = localStorage.getItem('billgst_pwa_installed') === 'true';
        const isDismissed = localStorage.getItem('billgst_pwa_dismissed') === 'true';

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

        if (isStandalone || isAlreadyInstalled) {
            setShowBanner(false);
            localStorage.setItem('billgst_pwa_installed', 'true');
        } else if (isMobile && !isDismissed) {
            // We show it on mobile if not dismissed, but ideally wait for beforeinstallprompt
            // However, some browsers don't fire it reliably, so we can keep a soft reminder
            // unless the user explicitly closes it.
            setShowBanner(true);
        }

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowBanner(true);
        };

        const handleAppInstalled = () => {
            setShowBanner(false);
            setDeferredPrompt(null);
            localStorage.setItem('billgst_pwa_installed', 'true');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("App install prompt is being prepared. Or you can manually install by tapping the Browser Menu (⋮) and selecting 'Install App' or 'Add to Home Screen'!");
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            localStorage.setItem('billgst_pwa_installed', 'true');
            setShowBanner(false);
        } else {
            console.log('User dismissed the install prompt');
        }

        setDeferredPrompt(null);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-[10px] left-[10px] right-[10px] rounded-2xl z-[9999] bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] flex items-center justify-between md:hidden border border-indigo-400 animate-slideUp">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .pb-safe { padding-bottom: env(safe-area-inset-bottom, 12px); }
            `}} />
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center shadow-lg">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h3 className="font-bold text-sm tracking-wide shadow-sm flex items-center gap-2">
                        BillGST
                        <span className="bg-yellow-400 text-yellow-900 text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-black">App</span>
                    </h3>
                    <p className="text-[10px] text-indigo-100 font-medium leading-tight mt-0.5">Free GST Billing & Stock</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleInstallClick}
                    className="bg-white text-indigo-700 px-4 py-2 rounded-full font-black text-[11px] shadow-lg border-b-[3px] border-indigo-200 active:translate-y-[3px] active:border-b-0 transition-all flex items-center gap-2 uppercase tracking-wide"
                >
                    <FaDownload size={12} /> Install
                </button>
                <button
                    onClick={() => {
                        setShowBanner(false);
                        localStorage.setItem('billgst_pwa_dismissed', 'true');
                    }}
                    className="text-indigo-200 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors ml-1"
                >
                    <FaTimes size={16} />
                </button>
            </div>
        </div>
    );
}
