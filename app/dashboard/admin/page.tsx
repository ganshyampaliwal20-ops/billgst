'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { useSession } from 'next-auth/react';
import { isOwnerRole, normalizeRole } from '../../../lib/role-utils';

export default function AdminPaymentsPage() {
    const { data: session, status } = useSession();
    const [pending, setPending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assignEmail, setAssignEmail] = useState('');
    const [assignRole, setAssignRole] = useState('SECURITY');
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignResult, setAssignResult] = useState<string | null>(null);
    const [roleList, setRoleList] = useState<any[]>([]);
    const [roleListLoading, setRoleListLoading] = useState(true);
    const [activityModalOpen, setActivityModalOpen] = useState(false);
    const [activityLoading, setActivityLoading] = useState(false);
    const [activityData, setActivityData] = useState<any | null>(null);
    const [modalIdentifier, setModalIdentifier] = useState<string | null>(null);
    const [modalSource, setModalSource] = useState<string | null>(null);

    const role = normalizeRole(session?.user?.role);
    const adminEmails = ['gpaliwal59@gmail.com', 'ganshyampaliwal20@gmail.com'];
    const isSuperAdmin = adminEmails.includes(session?.user?.email || '');
    const canAccessAdmin = isOwnerRole(role) || isSuperAdmin;

    if (status === 'loading') return <div>Loading...</div>;
    if (!canAccessAdmin) {
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

    const fetchRoleList = async () => {
        setRoleListLoading(true);
        try {
            const res = await fetch('/api/admin/assign-role');
                if (res.ok) {
                const data = await res.json();
                const combined = [
                    ...(data.users || []).map((item: any) => ({ ...item, source: 'user' })),
                    ...(data.staff || []).map((item: any) => ({ ...item, source: 'staff' })),
                ];
                // Only show records that have an explicitly assigned role
                const filtered = combined.filter((it: any) => it.role && it.role.toString().trim() !== '');
                setRoleList(filtered);
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || 'Failed to load role list');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load role list');
        } finally {
            setRoleListLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
        fetchRoleList();
    }, []);

    const handleAssignRole = async () => {
        if (!assignEmail) {
            toast.error('Email daalo bhai');
            return;
        }

        setAssignLoading(true);
        setAssignResult(null);

        try {
            const res = await fetch('/api/admin/assign-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: assignEmail.trim(), role: assignRole })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setAssignResult(data.message);
                toast.success(data.message);
                setAssignEmail('');
                fetchRoleList();
            } else {
                setAssignResult(data.error || 'Failed to assign role');
                toast.error(data.error || 'Role assign fail');
            }
        } catch (error) {
            setAssignResult('Server error');
            toast.error('Server error');
        } finally {
            setAssignLoading(false);
        }
    };

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
        <div className="min-h-screen bg-slate-50/50" style={{ padding: '8px' }}>
            <div className="max-w-6xl mx-auto space-y-4">
                
                {/* Header Section */}
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-800 p-2 shadow-xl text-center flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
                    
                    <div className="relative z-10 flex flex-col items-center justify-center gap-4 w-full">
                        <div className="flex flex-col items-center justify-center">
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight mb-2 sm:mb-3">
                                Admin Center
                            </h1>
                            <p className="text-indigo-200 text-sm sm:text-lg max-w-xl mx-auto">
                                Manage roles, review user activity, and approve UPI payments all in one place.
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 flex items-center justify-center gap-3 shadow-xl inline-flex w-auto mx-auto mt-2">
                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-lg shadow-inner">👑</div>
                            <div className="text-left">
                                <p className="text-white font-bold text-sm">{session?.user?.name || 'Administrator'}</p>
                                <p className="text-indigo-200 text-[10px] uppercase tracking-wider">{role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    
                    {/* Left Column (Assign Role + Pending Payments) */}
                    <div className="lg:col-span-4 space-y-4">
                        
                        {/* Assign Role Card */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-2 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-indigo-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110 duration-500"></div>
                            
                            <div className="relative z-10 p-2">
                                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-base sm:text-lg">🛡️</div>
                                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">Assign Role</h2>
                                </div>
                                
                                <div className="space-y-4 sm:space-y-5" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">User Identifier</label>
                                        <input
                                            type="text"
                                            value={assignEmail}
                                            onChange={(e) => setAssignEmail(e.target.value)}
                                            placeholder="Email, Phone, or Name"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Role</label>
                                        <select
                                            value={assignRole}
                                            onChange={(e) => setAssignRole(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 appearance-none"
                                        >
                                            <option value="USER">USER</option>
                                            <option value="SALES">SALES</option>
                                            <option value="SECURITY">SECURITY</option>
                                            <option value="ACCOUNTANT">ACCOUNTANT</option>
                                            <option value="ADMIN">ADMIN</option>
                                            <option value="OWNER">OWNER</option>
                                        </select>
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={handleAssignRole}
                                        disabled={assignLoading}
                                        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-2 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] hover:shadow-indigo-300 disabled:scale-100 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {assignLoading ? 'Assigning...' : 'Assign Role Now'}
                                    </button>

                                    {assignResult && (
                                        <div className={`mt-2 rounded-lg border p-2 text-xs font-semibold ${assignResult.toLowerCase().includes('fail') || assignResult.toLowerCase().includes('error') ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                                            {assignResult}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pending Payments Widget */}
                        {isSuperAdmin && (
                            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-2 shadow-xl shadow-slate-200/40">
                                <div className="p-2">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-base sm:text-lg">💰</div>
                                            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">Payments</h2>
                                        </div>
                                        <span className="bg-amber-100 text-amber-700 font-black text-[10px] sm:text-xs px-2 py-1 rounded-lg">{pending.length} Pending</span>
                                    </div>

                                    {loading ? (
                                        <div className="animate-pulse space-y-2 sm:space-y-3">
                                            <div className="h-16 sm:h-20 bg-slate-100 rounded-xl w-full"></div>
                                            <div className="h-16 sm:h-20 bg-slate-100 rounded-xl w-full"></div>
                                        </div>
                                    ) : pending.length === 0 ? (
                                        <div className="text-center py-6 sm:py-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                            <div className="text-2xl sm:text-3xl mb-2">🎉</div>
                                            <h3 className="font-bold text-slate-700 text-xs sm:text-sm">All Caught Up!</h3>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                            {pending.map((user) => (
                                                <div key={user.id} className="bg-slate-50 border border-slate-100 rounded-xl p-2 sm:p-4 transition-all hover:border-indigo-200">
                                                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm">{user.name || 'Unknown'}</h3>
                                                    <p className="text-[10px] sm:text-xs text-slate-500 mb-2 truncate">{user.email}</p>
                                                    
                                                    <div className="bg-white border border-slate-200 rounded-lg p-2 flex justify-between items-center mb-2 sm:mb-3 text-[10px] sm:text-xs">
                                                        <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{user.plan_type}</span>
                                                        <span className="font-mono font-medium text-slate-600 truncate ml-2 max-w-[80px] sm:max-w-[100px]">{user.last_payment_utr}</span>
                                                    </div>

                                                    <div className="flex gap-2 sm:gap-2 pr-2">
                                                        <button onClick={() => handleAction(user.id, 'REJECT')} className="flex-1 px-2 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg sm:rounded-xl font-bold hover:bg-rose-50 transition-colors text-[10px] sm:text-xs">
                                                            Reject
                                                        </button>
                                                        <button onClick={() => handleAction(user.id, 'APPROVE')} className="flex-1 px-2 py-2 bg-green-500 text-white rounded-lg sm:rounded-xl font-bold hover:bg-green-600 shadow-sm shadow-green-200 transition-colors text-[10px] sm:text-xs">
                                                            Approve
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column (Role List) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 h-full" style={{ padding: '8px' }}>
                            <div style={{ padding: '8px' }}>
                                <div className="flex items-center justify-between mb-4 sm:mb-8">
                                    <div style={{ padding: '8px' }}>
                                        <h2 className="text-lg sm:text-2xl font-extrabold text-slate-800">Role Directory</h2>
                                        <p className="text-[10px] sm:text-sm text-slate-500 mt-1">Manage and view activities of all assigned personnel.</p>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-violet-100 text-violet-600 items-center justify-center font-bold text-lg sm:text-xl hidden sm:flex">👥</div>
                                </div>

                                {roleListLoading ? (
                                    <div className="flex justify-center items-center h-40 sm:h-64">
                                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : roleList.length === 0 ? (
                                    <div className="text-center p-2 sm:py-20 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100 border-dashed">
                                        <div className="text-3xl sm:text-5xl mb-3 sm:mb-4 text-slate-300">📭</div>
                                        <h3 className="font-bold text-slate-700 text-sm sm:text-base">No roles assigned yet</h3>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">Use the panel on the left to assign roles to users.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto w-full" style={{ padding: '8px' }}>
                                        <table className="w-full text-left whitespace-nowrap">
                                            <thead>
                                                <tr className="bg-slate-50/80 border-y border-slate-100 text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-bold">
                                                    <th className="rounded-l-lg sm:rounded-l-xl" style={{ padding: '8px' }}>Member</th>
                                                    <th style={{ padding: '8px' }}>Role</th>
                                                    <th className="text-right rounded-r-lg sm:rounded-r-xl" style={{ padding: '8px' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100/50">
                                                {roleList.map((item) => (
                                                    <tr key={`${item.source}-${item.id}`} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td style={{ padding: '8px' }}>
                                                            <div className="flex items-center gap-2 sm:gap-3">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold uppercase shrink-0 text-xs sm:text-base ml-2">
                                                                    {(item.name || item.email || 'U')[0]}
                                                                </div>
                                                                <div style={{ padding: '8px' }}>
                                                                    <div className="font-bold text-slate-800 text-xs sm:text-sm">{item.name || 'Unknown'}</div>
                                                                    <div className="text-[10px] sm:text-xs text-slate-500">{item.email || item.phone || 'N/A'} • <span className="capitalize">{item.source}</span></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '8px' }}>
                                                            <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${
                                                                item.role === 'ADMIN' || item.role === 'OWNER' ? 'bg-rose-100 text-rose-700' :
                                                                item.role === 'ACCOUNTANT' ? 'bg-amber-100 text-amber-700' :
                                                                item.role === 'SECURITY' ? 'bg-emerald-100 text-emerald-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }`}>
                                                                {item.role || 'USER'}
                                                            </span>
                                                        </td>
                                                        <td className="text-right" style={{ padding: '8px' }}>
                                                            <div className="flex items-center justify-end gap-[8px] sm:gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setAssignEmail(item.email || item.phone || item.name || '')}
                                                                    className="px-2 py-2 sm:px-3 sm:py-2 bg-indigo-50 text-indigo-600 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold hover:bg-indigo-100 transition-colors"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setModalIdentifier(item.email || item.phone || item.name || '');
                                                                        setModalSource(item.source || 'user');
                                                                        setActivityModalOpen(true);
                                                                    }}
                                                                    className="rounded bg-indigo-600 p-2 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                                                                >
                                                                    Activity
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ActivityModal
                open={activityModalOpen}
                onClose={() => { setActivityModalOpen(false); setActivityData(null); }}
                identifier={modalIdentifier}
                source={modalSource}
            />

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
            `}} />
        </div>
    );
}

// Activity modal markup is appended here to keep the component focused above.
export function ActivityModal({ open, onClose, identifier, source }: any) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any | null>(null);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        // fetch default (no date filters)
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, identifier, source]);

    const fetchData = async (sDate?: string | null, eDate?: string | null) => {
        if (!identifier) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/user-activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, source, startDate: sDate || startDate, endDate: eDate || endDate })
            });
            const json = await res.json();
            setData(json);
        } catch (err) {
            setData({ error: 'Server error' });
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        const { jsPDF } = await import('jspdf');
        await import('jspdf-autotable');
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text('BillGST - Activity Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`For: ${identifier}`, 14, 28);
        if (startDate || endDate) {
            doc.text(`Period: ${startDate || '—'} to ${endDate || '—'}`, 14, 34);
        }

        let y = 42;
        if (data?.invoices && data.invoices.length > 0) {
            doc.text('Invoices', 14, y);
            (doc as any).autoTable({
                startY: y + 2,
                head: [['No', 'Invoice #', 'Amount', 'Status', 'Date']],
                body: data.invoices.map((inv: any, idx: number) => [idx + 1, inv.invoice_number, inv.total_amount?.toString() || '', inv.status || '', new Date(inv.created_at).toLocaleString()])
            });
            y = (doc as any).lastAutoTable.finalY + 8;
        }

        if (data?.expenses && data.expenses.length > 0) {
            doc.text('Expenses', 14, y);
            (doc as any).autoTable({
                startY: y + 2,
                head: [['No', 'Category', 'Amount', 'Description', 'Date']],
                body: data.expenses.map((ex: any, idx: number) => [idx + 1, ex.category || '', ex.amount?.toString() || '', ex.description || '', ex.expense_date || ''])
            });
            y = (doc as any).lastAutoTable.finalY + 8;
        }

        if (data?.attendance && data.attendance.length > 0) {
            doc.text('Attendance', 14, y);
            (doc as any).autoTable({
                startY: y + 2,
                head: [['No', 'Date', 'Status']],
                body: data.attendance.map((a: any, idx: number) => [idx + 1, a.date, a.status])
            });
            y = (doc as any).lastAutoTable.finalY + 8;
        }

        // Footer branding
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.text('Powered by BillGST', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        }

        doc.save(`activity-${identifier.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { onClose(); setData(null); }}></div>
            <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
                
                {/* Modal Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-2 sm:px-6 sm:py-5 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">Activity Timeline</h3>
                        <p className="text-[10px] sm:text-sm text-slate-500 font-medium">{identifier}</p>
                    </div>
                    <button onClick={() => { onClose(); setData(null); }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                        ✕
                    </button>
                </div>

                {/* Filters */}
                <div className="p-2 sm:px-6 sm:py-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2 sm:gap-4 shrink-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 sm:gap-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl p-2 sm:px-3 sm:py-2 flex-1 sm:flex-none">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">From</span>
                            <input type="date" value={startDate || ''} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[10px] sm:text-sm font-semibold outline-none text-slate-700 w-full" />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl p-2 sm:px-3 sm:py-2 flex-1 sm:flex-none">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">To</span>
                            <input type="date" value={endDate || ''} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[10px] sm:text-sm font-semibold outline-none text-slate-700 w-full" />
                        </div>
                        <button onClick={() => fetchData(startDate, endDate)} className="rounded-lg sm:rounded-xl bg-indigo-600 text-white p-2 sm:px-5 sm:py-2 text-[10px] sm:text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition w-full sm:w-auto">Apply Filter</button>
                    </div>
                    <button onClick={generatePDF} className="rounded-lg sm:rounded-xl bg-slate-800 text-white p-2 sm:px-5 sm:py-2 text-[10px] sm:text-sm font-bold shadow-md hover:bg-slate-900 transition flex items-center justify-center gap-1 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <span>📄</span> Export PDF
                    </button>
                </div>

                {/* Content */}
                <div className="p-2 overflow-y-auto bg-slate-50/50 flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-2 sm:py-20 space-y-4">
                            <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">Fetching records...</p>
                        </div>
                    ) : data?.error ? (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-2 rounded-xl sm:rounded-2xl text-center font-bold text-xs sm:text-base">
                            {data.error}
                        </div>
                    ) : (
                        <div className="space-y-[8px] sm:space-y-8">
                            
                            {/* Profile Info */}
                            {(data?.user || data?.staff) && (
                                <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-5 border border-slate-100 flex items-center gap-2 sm:gap-4 shadow-sm">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-100 rounded-full flex items-center justify-center text-base sm:text-xl font-black text-indigo-600 uppercase">
                                        {(data?.user?.name || data?.staff?.name || 'U')[0]}
                                    </div>
                                    <div>
                                        <div className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{data?.user ? 'User Profile' : 'Staff Profile'}</div>
                                        <div className="text-sm sm:text-lg font-bold text-slate-800">{data?.user?.name || data?.staff?.name}</div>
                                        <div className="text-[10px] sm:text-sm text-slate-500">{data?.user?.email || data?.staff?.email}</div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-6">
                                {/* Invoices */}
                                {data?.invoices && data.invoices.length > 0 && (
                                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="bg-slate-50 p-2 sm:px-4 sm:py-3 border-b border-slate-100 font-bold text-slate-700 flex justify-between items-center text-xs sm:text-base">
                                            🧾 Invoices
                                            <span className="bg-slate-200 text-slate-600 text-[10px] sm:text-xs px-2 py-0.5 rounded-full">{data.invoices.length}</span>
                                        </div>
                                        <div className="p-2 space-y-[8px] max-h-48 sm:max-h-64 overflow-y-auto custom-scrollbar">
                                            {data.invoices.map((inv: any) => (
                                                <div key={inv.id} className="p-2 sm:p-3 border border-slate-100 rounded-lg sm:rounded-xl hover:border-indigo-100 bg-white transition-colors">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-bold text-slate-800 text-xs sm:text-sm">#{inv.invoice_number}</span>
                                                        <span className="font-black text-indigo-600 text-xs sm:text-sm">₹{inv.total_amount}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] sm:text-xs">
                                                        <span className="text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</span>
                                                        <span className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded font-bold uppercase tracking-wider ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{inv.status || 'UNPAID'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Expenses */}
                                {data?.expenses && data.expenses.length > 0 && (
                                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="bg-slate-50 p-2 sm:px-4 sm:py-3 border-b border-slate-100 font-bold text-slate-700 flex justify-between items-center text-xs sm:text-base">
                                            💸 Expenses
                                            <span className="bg-slate-200 text-slate-600 text-[10px] sm:text-xs px-2 py-0.5 rounded-full">{data.expenses.length}</span>
                                        </div>
                                        <div className="p-2 space-y-[8px] max-h-48 sm:max-h-64 overflow-y-auto custom-scrollbar">
                                            {data.expenses.map((ex: any) => (
                                                <div key={ex.id} className="p-2 sm:p-3 border border-slate-100 rounded-lg sm:rounded-xl hover:border-rose-100 bg-white transition-colors">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-bold text-slate-800 text-xs sm:text-sm">{ex.category}</span>
                                                        <span className="font-black text-rose-600 text-xs sm:text-sm">₹{ex.amount}</span>
                                                    </div>
                                                    <div className="text-[10px] sm:text-xs text-slate-500 mb-1">{ex.description || 'No description'}</div>
                                                    <div className="text-[10px] sm:text-xs text-slate-400">{ex.expense_date}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Attendance */}
                            {data?.attendance && data.attendance.length > 0 && (
                                <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="bg-slate-50 p-2 sm:px-4 sm:py-3 border-b border-slate-100 font-bold text-slate-700 flex justify-between items-center text-xs sm:text-base">
                                        📅 Attendance
                                        <span className="bg-slate-200 text-slate-600 text-[10px] sm:text-xs px-2 py-0.5 rounded-full">{data.attendance.length}</span>
                                    </div>
                                    <div className="p-2 sm:p-4 flex flex-wrap gap-2 sm:gap-2">
                                        {data.attendance.map((a: any, idx: number) => (
                                            <div key={idx} className={`p-2 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg border text-[10px] sm:text-xs font-bold flex items-center gap-2 sm:gap-2 ${
                                                a.status === 'PRESENT' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                a.status === 'ABSENT' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                                'bg-slate-50 border-slate-200 text-slate-600'
                                            }`}>
                                                <span>{a.date}</span>
                                                <span className="uppercase tracking-widest">{a.status[0]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!data?.invoices?.length && !data?.expenses?.length && !data?.attendance?.length && (
                                <div className="text-center p-2 sm:py-16 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 border-dashed">
                                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📭</div>
                                    <h4 className="font-bold text-slate-700 text-sm sm:text-base">No Activity Records</h4>
                                    <p className="text-slate-500 text-[10px] sm:text-sm mt-1">Try adjusting your date filters.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Default export remains AdminPaymentsPage
