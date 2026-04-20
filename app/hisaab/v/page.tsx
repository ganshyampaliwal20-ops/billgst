'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

function fmt(n: number) {
    if (n === undefined) return '0';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
    return '₹' + n;
}

function formatDateFull(d: string) {
    const dt = new Date(d);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return dt.getDate() + ' ' + months[dt.getMonth()] + ' ' + dt.getFullYear();
}

export default function HisaabViewer() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const dataStr = searchParams?.get('d');
        if (dataStr) {
            try {
                const decoded = atob(dataStr);
                const decodedURIComponent = decodeURIComponent(escape(decoded));
                const json = JSON.parse(decodedURIComponent);
                setData(json);
            } catch (e) {
                setError(true);
            }
        } else {
            setError(true);
        }
    }, [searchParams]);

    if (!mounted) return null;

    if (error || !data) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center shadow-lg">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-3xl mb-4">⚠️</div>
                <h1 className="text-2xl font-black text-slate-800 mb-2">Hisaab Not Found</h1>
                <p className="text-slate-500 font-medium">This link might be invalid or broken. Please ask for a new link.</p>
                <div className="mt-8 pt-8 border-t border-slate-200 w-full max-w-sm">
                    <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Powered by</p>
                    <Image src="/logo.png" alt="BillGST Logo" width={100} height={30} className="mx-auto mt-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" onClick={() => window.open('https://billgst.com', '_blank')} />
                </div>
            </div>
        );
    }

    const { c, s, t } = data;

    return (
        <div className="min-h-screen bg-[#f3f4f6] pb-24 font-sans text-slate-900 mx-auto max-w-md shadow-2xl overflow-hidden relative">
            {/* Header Area */}
            <div className="bg-indigo-700 text-white rounded-b-3xl pt-8 pb-6 px-6 relative shadow-lg z-10 sticky top-0">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">{c.n}</h1>
                        <p className="text-indigo-200 text-sm font-semibold opacity-90 mt-0.5 tracking-wide flex items-center gap-1.5"><span className="text-[10px]">📞</span> {c.p} <span className="mx-1.5 opacity-50">•</span> {c.t}</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-inner">
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1.5 drop-shadow-md">Net Balance</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-black ${s.neg ? 'text-[#ff5252]' : 'text-[#4caf50]'}`}>
                            {s.neg ? '-' : '+'}{fmt(s.net)}
                        </span>
                        <span className="text-sm font-bold opacity-90 backdrop-blur-sm bg-white/20 px-2 py-0.5 rounded-md">{s.neg ? 'PAYABLE' : 'RECEIVABLE'}</span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="flex bg-white mx-5 -mt-4 relative z-20 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 divide-x divide-slate-100 p-1 mb-8">
                <div className="flex-1 p-3 text-center transition-all hover:bg-slate-50 rounded-l-xl">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Total Credit</p>
                    <p className="text-md font-black text-emerald-500">{fmt(s.r)}</p>
                </div>
                <div className="flex-1 p-3 text-center transition-all hover:bg-slate-50 rounded-r-xl">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Total Debit</p>
                    <p className="text-md font-black text-rose-500">{fmt(s.g)}</p>
                </div>
            </div>

            {/* Transactions */}
            <div className="px-5">
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="h-px bg-slate-200 flex-1"></span>
                    Recent Transactions
                    <span className="h-px bg-slate-200 flex-1"></span>
                </h3>

                <div className="space-y-3">
                    {t && t.length > 0 ? t.map((txn: any, idx: number) => {
                        const isCr = txn.y === 'c';
                        const isAdv = txn.y === 'a';
                        
                        return (
                            <div key={idx} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${isCr ? 'bg-emerald-100 text-emerald-600' : isAdv ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                                    <span className="text-lg font-black">{isCr ? '↓' : isAdv ? '⚡' : '↑'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 text-sm truncate">{txn.n || (isCr ? 'Credit' : isAdv ? 'Advance' : 'Debit')}</h4>
                                    <span className="text-[11px] text-slate-400 font-semibold">{formatDateFull(txn.d)}</span>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`font-black text-base ${isCr ? 'text-emerald-500' : isAdv ? 'text-amber-500' : 'text-rose-500'}`}>
                                        {isCr ? '+' : ''}{fmt(txn.a)}
                                    </p>
                                    <p className="text-[9px] uppercase font-black text-slate-300 mt-0.5 tracking-wider">{isCr ? 'Credit' : isAdv ? 'Advance' : 'Debit'}</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <span className="text-4xl inline-block mb-3 opacity-20">📝</span>
                            <p className="text-slate-400 font-bold">No entries found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Branding Footer */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-slate-200/60 p-4 transition-all">
                <div 
                    onClick={() => window.open('https://billgst.com', '_blank')}
                    className="flex flex-col items-center justify-center cursor-pointer group"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-500 transition-colors mb-1.5">Free Business Hisaab Apps</span>
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="BillGST" width={110} height={35} className="group-hover:scale-105 transition-transform drop-shadow-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HisaabViewerPage() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <HisaabViewer />
        </React.Suspense>
    );
}
