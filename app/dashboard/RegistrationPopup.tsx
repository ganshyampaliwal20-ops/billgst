/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { FaUserPlus, FaTimes, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function RegistrationPopup() {
    const { status } = useSession();
    const [isVisible, setIsVisible] = useState(false);
    const [hasClosed, setHasClosed] = useState(false);

    useEffect(() => {
        // Hide if authenticated
        if (status === 'authenticated') return;
        // Check if user previously closed it in this session
        let closed = false;
        try {
            closed = !!sessionStorage.getItem('register_popup_closed');
        } catch (e) { /* ignore */ }

        if (closed) {
            setHasClosed(true);
            return;
        }

        const timer = setTimeout(() => {
            if (!hasClosed) {
                setIsVisible(true);
            }
        }, 120000); // 2 minutes (120,000 ms)

        return () => clearTimeout(timer);
    }, [hasClosed]);

    const handleClose = () => {
        setIsVisible(false);
        setHasClosed(true);
        try {
            sessionStorage.setItem('register_popup_closed', 'true');
        } catch (e) { /* ignore */ }
    };

    if (!isVisible || status === 'authenticated') return null;

    return (
        <div className="fixed inset-x-4 bottom-24 md:bottom-6 md:right-6 md:left-auto md:inset-x-auto z-[100] animate-slideUp max-w-[350px] mx-auto md:mx-0 w-full">
            <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-200 border border-indigo-100 overflow-hidden relative">
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                    <FaTimes size={14} />
                </button>

                <div className="p-6">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                        <FaUserPlus size={20} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2 italic">Account Banayein!</h3>
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                        Apna data hamesha ke liye safe rakhne ke liye register karein aur full features payein.
                    </p>

                    <div className="flex flex-col gap-2">
                        <Link
                            href="/register"
                            onClick={handleClose}
                            className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 italic"
                        >
                            Register Karein <FaArrowRight size={12} />
                        </Link>
                        <button
                            onClick={handleClose}
                            className="py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                        >
                            Baad mein karenge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
