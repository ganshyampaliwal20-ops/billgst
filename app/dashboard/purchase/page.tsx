'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Purchase {
    id: string;
    purchase_number: string;
    vendor_name: string;
    purchase_date: string;
    total_amount: string;
    status: string;
}

export default function PurchasePage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const response = await fetch('/api/purchases');
            const data = await response.json();
            setPurchases(data);
        } catch (error) {
            toast.error('Failed to fetch purchases');
        } finally {
            setLoading(false);
        }
    };

    const filtered = purchases.filter(p =>
        p.purchase_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendor_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Purchases</h1>
                    <p className="text-slate-500 text-sm">Track your inventory acquisitions</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg font-bold">
                    <FaPlus /> Record Purchase
                </button>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                <div className="mb-6 text-center">
                    <div className="relative max-w-md mx-auto">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by vendor..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                                <th className="pb-4 px-2">Bill No</th>
                                <th className="pb-4 px-2">Vendor</th>
                                <th className="pb-4 px-2">Date</th>
                                <th className="pb-4 px-2 text-right">Amount</th>
                                <th className="pb-4 px-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-10 text-center text-slate-400">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="py-10 text-center text-slate-400">No purchases found</td></tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-2 text-sm font-bold text-blue-600">#{p.purchase_number}</td>
                                        <td className="py-4 px-2 text-sm font-semibold text-slate-700">{p.vendor_name}</td>
                                        <td className="py-4 px-2 text-sm text-slate-500">{new Date(p.purchase_date).toLocaleDateString()}</td>
                                        <td className="py-4 px-2 text-sm font-black text-slate-800 text-right">₹{parseFloat(p.total_amount).toLocaleString()}</td>
                                        <td className="py-4 px-2 text-center">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">{p.status}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
