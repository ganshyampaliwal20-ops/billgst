'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Head from 'next/head';

export default function HisaabViewer() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const d = searchParams.get('d');
        if (d) {
            try {
                // Decode base64
                const jsonStr = decodeURIComponent(escape(atob(d)));
                setData(JSON.parse(jsonStr));
            } catch (e) {
                console.error("Failed to decode data", e);
                setError(true);
            }
        } else {
            setError(true);
        }
    }, [searchParams]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h1 className="text-xl font-bold text-gray-800">Invalid Link</h1>
                <p className="text-gray-500 mt-2">The hisaab link is broken or invalid.</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[#0d0d15] flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-[#0ecf7c] border-t-transparent animate-spin"></div>
                <p className="text-[#8888aa] mt-4 font-bold">Loading Hisaab...</p>
            </div>
        );
    }

    const ff = (n: number) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');
    const fd = (d: string) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

    let credit = 0, debit = 0;
    data.t.forEach((t: any) => {
        if (t.t === 'c') credit += t.a;
        if (t.t === 'd') debit += t.a;
    });
    const net = credit - debit;

    // Group transactions by date
    const sortedTxns = [...data.t].sort((a, b) => new Date(b.d).getTime() - new Date(a.d).getTime());
    const groupedTxns = sortedTxns.reduce((acc, t) => {
        if (!acc[t.d]) acc[t.d] = [];
        acc[t.d].push(t);
        return acc;
    }, {} as Record<string, typeof sortedTxns>);
    const dates = Object.keys(groupedTxns);

    return (
        <div className="min-h-screen bg-[#0d0d15] text-[#f2f2ff] font-sans pb-20">
            {/* Topbar */}
            <div className="bg-[#141420] border-b border-white/10 p-4 sticky top-0 z-10 flex items-center justify-between">
                <div>
                    <div className="text-lg font-bold text-[#aaff2e] font-['Baloo_2']">{data.b || 'Business'}</div>
                    <div className="text-xs text-[#8888aa]">Digital Ledger</div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold shrink-0">Powered by BillGST</div>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-4">
                {/* Customer Details */}
                <div className="bg-[#1a1a28] border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl font-bold !text-white">
                        {data.n.trim().charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-lg font-bold font-['Baloo_2']">{data.n}</div>
                        <div className="text-xs text-[#8888aa] mt-1">{data.t.length} Transactions</div>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="bg-[#1a1a28] border border-white/10 p-5 rounded-2xl text-center">
                    <div className="text-xs text-[#8888aa] uppercase tracking-wider font-bold mb-1">Net Balance</div>
                    <div className={`text-4xl font-black font-['Baloo_2'] ${net >= 0 ? 'text-[#0ecf7c]' : 'text-[#ff3d5c]'}`}>
                        {ff(net)}
                    </div>
                    <div className={`inline-block mt-2 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${net >= 0 ? 'bg-[#0ecf7c]/20 text-[#0ecf7c]' : 'bg-[#ff3d5c]/20 text-[#ff3d5c]'}`}>
                        {net >= 0 ? 'Advance Jama Hai' : 'Dena Baaki Hai'}
                    </div>

                    <div className="flex divide-x divide-white/10 border-t border-white/10 mt-5 pt-4">
                        <div className="flex-1">
                            <div className="text-sm font-bold text-[#0ecf7c]">{ff(credit)}</div>
                            <div className="text-[10px] text-[#8888aa] uppercase mt-1">Total Jama (In)</div>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-[#ff3d5c]">{ff(debit)}</div>
                            <div className="text-[10px] text-[#8888aa] uppercase mt-1">Total Kharch (Out)</div>
                        </div>
                    </div>
                </div>

                {/* Transactions */}
                <div className="mt-6">
                    <h3 className="text-sm font-bold text-[#8888aa] uppercase tracking-wider mb-4 px-2">Transactions History</h3>
                    <div className="space-y-4">
                        {dates.length === 0 ? (
                            <div className="text-center p-8 bg-[#1a1a28] rounded-2xl border border-white/10 border-dashed text-[#8888aa]">
                                📭 Koi transaction nahi.
                            </div>
                        ) : dates.map((date) => {
                            const dayTxns = groupedTxns[date];
                            return (
                                <div key={date} className="bg-[#1a1a28] border border-white/10 rounded-2xl overflow-hidden">
                                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 text-[11px] font-bold text-[#8888aa] uppercase tracking-wider flex justify-between">
                                        <span>{fd(date)}</span>
                                        <span>{dayTxns.length} Entry</span>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {dayTxns.map((t: any, i: number) => {
                                            const isC = t.t === 'c';
                                            return (
                                                <div key={i} className="p-4 flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${isC ? 'bg-[#0ecf7c]/10 text-[#0ecf7c]' : 'bg-[#ff3d5c]/10 text-[#ff3d5c]'}`}>
                                                        {isC ? '✅' : '❌'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-sm truncate">{t.m || (isC ? 'Credit / Jama' : 'Debit / Kharch')}</div>
                                                        <div className="flex gap-2 mt-1">
                                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isC ? 'bg-[#0ecf7c]/20 text-[#0ecf7c]' : 'bg-[#ff3d5c]/20 text-[#ff3d5c]'}`}>
                                                                {isC ? 'Jama' : 'Kharch'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`text-lg font-black shrink-0 ${isC ? 'text-[#0ecf7c]' : 'text-[#ff3d5c]'}`}>
                                                        {isC ? '+' : '-'}{ff(t.a)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Sticky Promotion */}
            <div className="fixed bottom-0 left-0 right-0 bg-indigo-600 text-white p-3 text-center text-sm font-bold shadow-[0_-10px_30px_rgba(79,70,229,0.3)] z-20">
                <a href="https://billgst.com" className="w-full block">
                    🚀 Build your free store or hisaab on BillGST! Click here.
                </a>
            </div>
        </div>
    );
}
