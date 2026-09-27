'use client';
import Link from 'next/link';
import { formatCompactNumber } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface CollectionCenterProps {
    t: any;
    pendingCustomersList: any[];
    collectionSearch: string;
    setCollectionSearch: (val: string) => void;
    selectedCustomers: string[];
    setSelectedCustomers: (fn: any) => void;
    handleSendReminder: (c: any) => void;
    handleBulkReminder: (list: any[]) => void;
    totalOverallPending: number;
    formatLakhs: (val: number) => string;
}

export default function CollectionCenter({
    t,
    pendingCustomersList,
    collectionSearch,
    setCollectionSearch,
    selectedCustomers,
    setSelectedCustomers,
    handleSendReminder,
    handleBulkReminder,
    totalOverallPending,
    formatLakhs,
}: CollectionCenterProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="card" style={{ animationDelay: '.25s' }}>
                <div className="card-hdr">
                    <div>
                        <div className="card-title">💚 {t.collectionCenter || 'Collection Center'}</div>
                        <div className="card-sub">{t.managePendingPayments || 'Manage pending payments'}</div>
                    </div>
                    <Link href="/dashboard/customers" className="see-all" style={{ textDecoration: 'none' }}>
                        {pendingCustomersList.length} →
                    </Link>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--faint)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '9px 12px' }}>
                        <span style={{ color: 'var(--muted)' }}>🔍</span>
                        <input
                            type="text"
                            placeholder={t.searchParty}
                            value={collectionSearch}
                            onChange={(e) => setCollectionSearch(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontFamily: "'Sora',sans-serif", fontSize: '13px', background: 'transparent', flex: 1, color: 'var(--ink)' }}
                        />
                    </label>
                </div>

                <div className="coll-grid">
                    {pendingCustomersList.length === 0
                        ? <div className="text-center text-xs p-4 text-slate-400 font-bold" style={{ gridColumn: '1 / -1' }}>{t.noPendingCollections}</div>
                        : pendingCustomersList.slice(0, 4).map((c: any, i: number) => (
                            <Link
                                href={'/dashboard/customers/' + c.id}
                                className="coll-card"
                                key={'cust-' + (c.id || i) + '-' + i}
                                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                            >
                                <div className="coll-top">
                                    <div className="coll-num">{i + 1}</div>
                                    <div className="coll-bills">{c.invoiceCount} {t.bills}</div>
                                </div>
                                <div className="coll-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                                <div className="coll-last">{t.lastInvoice}: {new Date(c.lastInvoiceDate).toLocaleDateString()}</div>
                                <div className="coll-amt">{formatCompactNumber(c.totalPending)}</div>
                                <div className="coll-bottom">
                                    <button
                                        className="wa-btn"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSendReminder(c); }}
                                    >💬</button>
                                    <input
                                        type="checkbox"
                                        className="select-box"
                                        checked={selectedCustomers.includes(c.id)}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            setSelectedCustomers((prev: string[]) => e.target.checked ? [...prev, c.id] : prev.filter((id: string) => id !== c.id));
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </Link>
                        ))
                    }
                </div>

                <div className="action-bar">
                    <button className="action-bar-btn btn-remind" onClick={() => handleBulkReminder(pendingCustomersList)}>
                        💬 {t.remindAll}
                    </button>
                    <button className="action-bar-btn btn-due" onClick={() => toast.success(`${t.totalDueLabel}: ` + formatLakhs(totalOverallPending))}>
                        ₹ {t.totalDueLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
