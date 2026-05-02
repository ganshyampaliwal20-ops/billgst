'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { useSession } from 'next-auth/react';

export default function AdminPaymentsPage() {
    const { data: session, status } = useSession();
    const [pending, setPending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    if (status === 'loading') return <div>Loading...</div>;
    if (session?.user?.email !== 'ganshyampaliwal20@gmail.com') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-3xl font-black text-rose-600 mb-2">Access Denied ❌</h1>
                <p className="text-slate-500">You must be the administrator to view this page.</p>
            </div>
        );
    }

    const fetchPending = async () => {
        try {
            const res = await fetch('/api/admin/payments');
            if (res.ok) {
                const data = await res.json();
                setPending(data.pending || []);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load pending payments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
        const confirmMsg = action === 'APPROVE' ? 'Are you sure you want to ACTIVATE this plan?' : 'Are you sure you want to REJECT this payment?';
        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await fetch('/api/admin/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action })
            });

            if (res.ok) {
                toast.success(`Payment ${action.toLowerCase()}d successfully!`);
                fetchPending(); // Refresh list
            } else {
                toast.error('Action failed.');
            }
        } catch (error) {
            toast.error('Server error.');
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">Admin Dashboard</h1>
            <p className="text-slate-500 mb-8 text-sm">Review and approve pending UPI payments from users.</p>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Loading pending payments...</div>
            ) : pending.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-sm">
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="text-lg font-bold text-slate-800">All Caught Up!</h3>
                    <p className="text-slate-500 text-sm">There are no pending payments to review.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pending.map((user) => (
                        <div key={user.id} className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-800">{user.name || 'Unknown User'}</h3>
                                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                        PENDING
                                    </span>
                                </div>
                                <div className="text-sm text-slate-500 mb-2">{user.email} • {user.phone || 'No Phone'}</div>
                                
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan Requested</div>
                                        <div className="font-bold text-blue-600">{user.plan_type}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPI UTR / Ref No</div>
                                        <div className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm inline-block">
                                            {user.last_payment_utr || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                <button 
                                    onClick={() => handleAction(user.id, 'REJECT')}
                                    className="flex-1 md:flex-none px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg font-bold hover:bg-rose-50 transition-colors text-sm"
                                >
                                    Reject ❌
                                </button>
                                <button 
                                    onClick={() => handleAction(user.id, 'APPROVE')}
                                    className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-600/20 text-sm"
                                >
                                    Approve ✅
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
