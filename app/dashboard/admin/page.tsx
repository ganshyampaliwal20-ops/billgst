'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { useSession } from 'next-auth/react';
import { isOwnerRole, normalizeRole } from '../../../lib/role-utils';

export default function AdminPaymentsPage() {
    const { data: session, status } = useSession();
    const [pending, setPending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [notifyTitle, setNotifyTitle] = useState('');
    const [notifyBody, setNotifyBody] = useState('');
    const [sendingNotify, setSendingNotify] = useState(false);

    const role = normalizeRole(session?.user?.role);
    const isSuperAdmin = session?.user?.email === 'gpaliwal59@gmail.com' || session?.user?.email === 'ganshyampaliwal20@gmail.com';

    if (status === 'loading') return <div>Loading...</div>;
    if (!isSuperAdmin) {
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

    // eslint-disable-next-line react-hooks/rules-of-hooks
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

    const handleSendNotification = async () => {
        if (!notifyTitle || !notifyBody) return;
        if (!window.confirm('Are you sure you want to send this notification to ALL app users?')) return;
        
        setSendingNotify(true);
        try {
            const res = await fetch('/api/admin/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: notifyTitle, body: notifyBody, target: 'all' })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Sent successfully to ${data.successCount} devices!`);
                setNotifyTitle('');
                setNotifyBody('');
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to send notification');
            }
        } catch (error) {
            toast.error('Server error.');
        } finally {
            setSendingNotify(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-800 p-8 shadow-xl text-center flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
                    
                    <div className="relative z-10 flex flex-col items-center justify-center gap-4 w-full">
                        <div className="flex flex-col items-center justify-center">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                                Admin Center
                            </h1>
                            <p className="text-indigo-200 text-sm sm:text-lg max-w-xl mx-auto">
                                Manage and approve pending UPI payments.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pending Payments Widget */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl">💰</div>
                            <h2 className="text-xl font-extrabold text-slate-800">Pending Payments</h2>
                        </div>
                        <span className="bg-amber-100 text-amber-700 font-black text-xs px-3 py-1.5 rounded-lg">{pending.length} Pending</span>
                    </div>

                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            <div className="h-20 bg-slate-100 rounded-xl w-full"></div>
                            <div className="h-20 bg-slate-100 rounded-xl w-full"></div>
                        </div>
                    ) : pending.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                            <div className="text-4xl mb-3">🎉</div>
                            <h3 className="font-bold text-slate-700 text-lg">All Caught Up!</h3>
                            <p className="text-slate-500 text-sm mt-1">No pending payments to review.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {pending.map((user) => (
                                <div key={user.id} className="bg-slate-50 border border-slate-100 rounded-xl p-5 transition-all hover:border-indigo-200 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex-1 w-full text-center md:text-left">
                                        <h3 className="font-bold text-slate-800 text-lg">{user.name || 'Unknown'}</h3>
                                        <p className="text-sm text-slate-500">{user.email}</p>
                                    </div>
                                    
                                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex flex-col md:flex-row items-center gap-2 md:gap-4 shrink-0 w-full md:w-auto">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Plan:</span>
                                            <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{user.plan_type}</span>
                                        </div>
                                        <div className="hidden md:block w-px h-6 bg-slate-200"></div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">UTR:</span>
                                            <span className="font-mono font-bold text-slate-700">{user.last_payment_utr}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                                        <button onClick={() => handleAction(user.id, 'REJECT')} className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-colors text-sm">
                                            Reject
                                        </button>
                                        <button onClick={() => handleAction(user.id, 'APPROVE')} className="flex-1 md:flex-none px-6 py-2.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-sm shadow-green-200 transition-colors text-sm">
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Broadcast Notification Widget */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-200/40">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl">📢</div>
                        <h2 className="text-xl font-extrabold text-slate-800">Broadcast Notification</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Notification Title</label>
                            <input 
                                type="text" 
                                value={notifyTitle} 
                                onChange={e => setNotifyTitle(e.target.value)} 
                                placeholder="e.g. New Update Available!" 
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Message Body</label>
                            <textarea 
                                value={notifyBody} 
                                onChange={e => setNotifyBody(e.target.value)} 
                                placeholder="Write your message here..." 
                                rows={3}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 custom-scrollbar"
                            ></textarea>
                        </div>
                        <button 
                            onClick={handleSendNotification} 
                            disabled={sendingNotify || !notifyTitle || !notifyBody}
                            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {sendingNotify ? 'Sending...' : 'Send to All App Users'} 🚀
                        </button>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
            `}} />
        </div>
    );
}
