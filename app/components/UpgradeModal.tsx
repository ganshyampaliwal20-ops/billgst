'use client';

import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { FaCrown, FaTimes } from 'react-icons/fa';

export default function UpgradeModal() {
    const { upgradeModal, setUpgradeModal } = useStore();
    const router = useRouter();

    if (!upgradeModal?.isOpen) return null;

    const handleUpgrade = () => {
        setUpgradeModal(false);
        router.push('/dashboard/pricing');
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center relative">
                    <button 
                        onClick={() => setUpgradeModal(false)}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <FaTimes />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                        <FaCrown size={32} className="text-amber-300" />
                    </div>
                    <h2 className="text-2xl font-black">Upgrade Required</h2>
                    <p className="text-indigo-100 mt-2 text-sm max-w-[300px] mx-auto">
                        {upgradeModal.message || "You need to upgrade your plan to use this premium feature."}
                    </p>
                </div>
                
                <div className="p-6">
                    <p className="text-slate-600 text-center text-sm font-medium mb-6">
                        Unlock unlimited invoices, advanced inventory, and premium WhatsApp features by upgrading to our <strong>Premium (₹99)</strong> or <strong>Yearly (₹299)</strong> plan!
                    </p>
                    
                    <button 
                        onClick={handleUpgrade}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                    >
                        Upgrade Plan Now
                    </button>
                    
                    <button 
                        onClick={() => setUpgradeModal(false)}
                        className="w-full mt-3 py-3 text-slate-500 font-bold hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}
