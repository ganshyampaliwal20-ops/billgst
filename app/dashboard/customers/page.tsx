"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

export default function CustomersPage() {
    const { customers, invoices, addCustomer, updateCustomer, businessProfile } = useStore() as any;
    const [isClient, setIsClient] = useState(false);

    const [activeTab, setActiveTab] = useState('Parties');
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newBal, setNewBal] = useState('');

    useEffect(() => { setIsClient(true); }, []);

    if (!isClient) return null;

    const getCustomerBalance = (customerId: string) => {
        const customerInvoices = invoices.filter((inv: any) => inv.customer_id === customerId || inv.customer?.id === customerId);
        const total = customerInvoices.reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_amount) || 0), 0);
        const paid = customerInvoices.reduce((sum: number, inv: any) => sum + (parseFloat(inv.paid_amount) || 0), 0);
        return total - paid;
    };

    const getInitials = (name: string) => name.trim().split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
    const avatarColors = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9', '#10b981', '#f97316', '#06b6d4'];
    const getColor = (id: number) => avatarColors[id % avatarColors.length];

    let filteredCustomers = customers.filter((c: any) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
    );

    const processedList = filteredCustomers.map((c: any, index: number) => {
        const gbal = getCustomerBalance(c.id);
        return {
            ...c,
            _index: index,
            balance: gbal,
            amountStr: `₹${Math.abs(gbal).toLocaleString('en-IN')}`,
            status: gbal > 0 ? 'pending' : 'received',
            tag: c.partyType === 'VIP' ? 'VIP' : (c.partyType || 'New')
        };
    });

    let finalList = processedList;
    if (activeFilter === 'pending') finalList = processedList.filter((c: any) => c.status === 'pending');
    if (activeFilter === 'received') finalList = processedList.filter((c: any) => c.status === 'received');
    if (activeFilter === 'vip') finalList = processedList.filter((c: any) => c.tag === 'VIP');
    if (activeFilter === 'new') finalList = processedList.filter((c: any) => c.tag === 'New');

    const totalCount = processedList.length;
    const pendingTotal = processedList.filter((c: any) => c.status === 'pending').reduce((s: number, c: any) => s + c.balance, 0);
    const receivedTotal = processedList.filter((c: any) => c.status === 'received').reduce((s: number, c: any) => s + Math.abs(c.balance), 0);

    const handleAdd = () => {
        if (!newName || newPhone.length < 10) {
            toast.error('Name aur 10-digit phone zaroori hai!');
            return;
        }
        addCustomer({
            id: crypto.randomUUID(),
            name: newName.toUpperCase(),
            phone: newPhone,
            openingBalance: newBal,
            partyType: 'New',
            created_at: new Date().toISOString()
        });
        setNewName(''); setNewPhone(''); setNewBal('');
        setShowAddModal(false);
        toast.success('✅ ' + newName + ' add ho gaya!');
    };

    const handleWhatsApp = (c: any, e: any) => {
        e.stopPropagation();
        const phone = c.phone?.replace(/\D/g, '') || '';
        const businessName = businessProfile?.name || 'Our Business';
        const message = `Namaste ${c.name} ji, hope you are doing well. This is a gentle reminder regarding your total outstanding balance of ${c.amountStr} with ${businessName}. Please process the payment at your earliest convenience. Thank you!`;
        window.open(`https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const formatLakhs = (val: number) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${val}`;
    };

    return (
        <div style={{ background: '#f4f6fc', minHeight: '100vh', paddingBottom: '30px' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
:root {
  --ink: #0c0f1a;
  --ink2: #1e2436;
  --slate: #3d4663;
  --muted: #8892aa;
  --faint: #eef0f7;
  --border: #e4e8f4;
  --white: #ffffff;
  --teal: #00c4a7;
  --teal-dark: #009e87;
  --teal-glow: rgba(0,196,167,0.15);
  --red: #ff4d6d;
  --red-soft: #fff0f3;
  --green: #00c48c;
  --green-soft: #f0fdf8;
  --amber: #f59e0b;
  --card-shadow: 0 2px 12px rgba(12,15,26,0.06), 0 1px 3px rgba(12,15,26,0.04);
  --card-shadow-hover: 0 8px 32px rgba(12,15,26,0.12), 0 2px 8px rgba(12,15,26,0.06);
}

.shell_wrapper {
  font-family: 'Sora', sans-serif;
  background: #f4f6fc;
  min-height: 100vh;
  color: var(--ink);
}

.shell {
  max-width: 100%;
  margin: 0 auto;
  background: #f4f6fc;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}
@media (min-width: 768px) {
  .list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 16px;
  }
  .customer-card { margin-bottom: 0; }
  .stats-strip { max-width: 800px; margin: 0 auto; margin-bottom: 20px;}
  .search-wrap { max-width: 800px; margin: 0 auto; }
  .filter-row { justify-content: center; }
  .list-header { justify-content: space-between; padding-left: 20px; padding-right: 20px;}
}

.topbar {
  background: linear-gradient(135deg, #0c0f1a 0%, #1a2040 100%);
  padding: 18px 20px 22px;
  position: sticky;
  top: 0;
  z-index: 50;
}
.topbar-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.back-btn {
  width: 36px; height: 36px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #fff;
  font-size: 18px;
  transition: all 0.2s;
  text-decoration: none;
}
.back-btn:hover { background: rgba(255,255,255,0.15); }

.topbar-title { text-align: center; flex: 1; }
.topbar-title h1 { font-size: 17px; font-weight: 700; color: #fff; letter-spacing: -0.3px; margin: 0; }
.topbar-title p  { font-size: 10px; font-weight: 500; color: var(--teal); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 1px; margin-bottom: 0; }

.topbar-icons { display: flex; gap: 8px; }
.icon-btn {
  width: 36px; height: 36px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 16px; position: relative;
  transition: all 0.2s;
  color: #fff;
}
.icon-btn:hover { background: rgba(255,255,255,0.15); }
.icon-btn .badge {
  position: absolute; top: -4px; right: -4px;
  width: 16px; height: 16px;
  background: var(--red);
  border-radius: 50%;
  font-size: 9px; font-weight: 700; color: #fff;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #1a2040;
}

.tabs {
  display: flex;
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 3px;
  margin-top: 4px;
}
.tab {
  flex: 1;
  padding: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: rgba(255,255,255,0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s;
  text-transform: uppercase;
}
.tab.active {
  background: var(--teal);
  color: #fff;
  box-shadow: 0 3px 10px rgba(0,196,167,0.4);
}

.search-wrap { padding: 14px 16px 4px; }
.search-box {
  display: flex;
  align-items: center;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 11px 14px;
  gap: 10px;
  box-shadow: var(--card-shadow);
  transition: all 0.2s;
}
.search-box:focus-within {
  border-color: var(--teal);
  box-shadow: 0 0 0 3px var(--teal-glow);
}
.search-box input {
  flex: 1; border: none; outline: none;
  font-family: 'Sora', sans-serif;
  font-size: 13.5px; font-weight: 500;
  color: var(--ink); background: transparent;
}
.search-box input::placeholder { color: #c0c8da; font-weight: 400; }
.search-icon {
  width: 32px; height: 32px;
  background: var(--teal); border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0; cursor: pointer; color: #fff;
}

.filter-row {
  display: flex; gap: 8px; padding: 12px 16px 6px;
  overflow-x: auto; scrollbar-width: none;
}
.filter-row::-webkit-scrollbar { display: none; }
.chip {
  white-space: nowrap; padding: 6px 14px; border-radius: 20px;
  font-size: 11.5px; font-weight: 600; border: 1.5px solid var(--border);
  background: var(--white); color: var(--muted);
  cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.chip.active { background: var(--ink); color: #fff; border-color: var(--ink); }
.chip:hover:not(.active) { border-color: var(--teal); color: var(--teal); }

.stats-strip {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 10px; padding: 8px 16px 12px;
}
.stat-card {
  background: var(--white); border-radius: 14px; padding: 12px 10px;
  text-align: center; box-shadow: var(--card-shadow); border: 1px solid var(--border);
  animation: fadeUp 0.4s ease both;
}
.stat-label { font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); margin-bottom: 5px; }
.stat-value { font-size: 15px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
.stat-value.red { color: var(--red); }
.stat-value.green { color: var(--green); }
.stat-value.ink { color: var(--ink); }

.list-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 16px 10px;
}
.list-count { font-size: 12px; font-weight: 700; color: var(--slate); }
.list-count span { color: var(--teal); }
.balance-report-btn {
  background: linear-gradient(135deg, var(--ink), var(--slate));
  color: #fff; border: none; padding: 7px 14px; border-radius: 8px;
  font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 600;
  cursor: pointer; letter-spacing: 0.4px;
  display: flex; align-items: center; gap: 5px; transition: all 0.2s;
}

.list { padding: 0 16px 100px; }
.customer-card {
  background: var(--white); border-radius: 16px; padding: 0; margin-bottom: 10px;
  box-shadow: var(--card-shadow); border: 1px solid var(--border);
  overflow: hidden; cursor: pointer; transition: all 0.25s ease;
  animation: fadeUp 0.4s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card-top { display: flex; align-items: center; padding: 14px 14px 10px; gap: 12px; }
.avatar {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; font-weight: 700; color: #fff; flex-shrink: 0; position: relative;
}
.avatar .num {
  position: absolute; bottom: -4px; right: -4px;
  width: 18px; height: 18px; background: var(--ink); border-radius: 6px;
  font-size: 9px; font-weight: 700; color: #fff;
  display: flex; align-items: center; justify-content: center; border: 2px solid var(--white);
}

.card-info { flex: 1; min-width: 0; }
.card-name {
  font-size: 15px; font-weight: 700; color: var(--ink); letter-spacing: -0.3px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px;
}
.card-phone { font-size: 12px; color: var(--muted); font-weight: 500; margin-top: 2px; font-family: 'JetBrains Mono', monospace; }

.card-right { text-align: right; }
.pending-tag {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; padding: 3px 9px; border-radius: 6px;
  display: inline-block; margin-bottom: 4px;
}
.pending-tag.red { background: var(--red-soft); color: var(--red); }
.pending-tag.green { background: var(--green-soft); color: var(--green); }
.card-amount { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; letter-spacing: -0.5px; }
.card-amount.red { color: var(--red); }
.card-amount.green { color: var(--green); }

.card-bottom { display: flex; align-items: center; border-top: 1px solid var(--faint); padding: 8px 14px; gap: 6px; }
.action-btn {
  display: flex; align-items: center; gap: 5px; padding: 6px 11px;
  border-radius: 8px; border: 1.5px solid var(--border); background: var(--faint);
  font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 600; color: var(--slate);
  cursor: pointer; transition: all 0.18s; text-decoration: none;
}
.action-btn:hover { background: var(--teal-glow); border-color: var(--teal); color: var(--teal-dark); }
.view-label { font-size: 10px; color: var(--muted); font-weight: 500; margin-left: auto; margin-right: 4px; display: flex; align-items: center; gap: 3px; }

.fab {
  position: fixed; bottom: 28px; right: 28px;
  width: 54px; height: 54px; background: linear-gradient(135deg, var(--teal), var(--teal-dark));
  border-radius: 16px; display: flex; align-items: center; justify-content: center;
  font-size: 24px; cursor: pointer; box-shadow: 0 8px 28px rgba(0,196,167,0.5);
  transition: all 0.25s; z-index: 40; border: none; color: #fff;
}
.fab:hover { transform: scale(1.08) rotate(10deg); box-shadow: 0 12px 36px rgba(0,196,167,0.6); }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(12,15,26,0.6); backdrop-filter: blur(6px);
  z-index: 100; display: flex; align-items: flex-end; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.25s;
}
.modal-overlay.open { opacity: 1; pointer-events: all; }
.modal {
  background: var(--white); border-radius: 24px 24px 0 0; width: 100%;
  max-width: 430px; padding: 20px 20px 36px; transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
}
.modal-overlay.open .modal { transform: translateY(0); }
.modal-handle { width: 36px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 18px; }
.modal-title { font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 16px; }

.modal-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--faint); font-size: 13px; }
.modal-detail-row:last-of-type { border-bottom: none; }
.detail-key { color: var(--muted); font-weight: 500; }
.detail-val { font-weight: 700; color: var(--ink); font-family: 'JetBrains Mono', monospace; font-size: 12.5px; }

.modal-actions { display: flex; gap: 10px; margin-top: 18px; }
.modal-btn {
  flex: 1; padding: 13px; border-radius: 12px; font-family: 'Sora', sans-serif;
  font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s;
}
.modal-btn.outline { background: var(--faint); color: var(--slate); border: 1.5px solid var(--border); }
.modal-btn.solid { background: linear-gradient(135deg, var(--ink), var(--slate)); color: #fff; }

.empty { text-align: center; padding: 40px 20px; }
.empty .emoji { font-size: 48px; margin-bottom: 12px; }
.empty p { font-size: 14px; color: var(--muted); font-weight: 500; }

@media (max-width: 430px) { .fab { right: 16px; } }
          ` }} />

            <div className="shell_wrapper">
                <div className="shell">
                    <div className="topbar">
                        <div className="topbar-row1">
                            <button className="back-btn" onClick={() => window.history.back()}>‹</button>
                            <div className="topbar-title">
                                <h1>All Customers</h1>
                                <p>Manage Your Customers</p>
                            </div>
                            <div className="topbar-icons">
                                <div className="icon-btn" onClick={() => toast('No new messages')}>💬<span className="badge">0</span></div>
                                <div className="icon-btn" onClick={() => toast('No new notifications')}>🔔<span className="badge">0</span></div>
                            </div>
                        </div>
                        <div className="tabs">
                            <div className={`tab ${activeTab === 'Parties' ? 'active' : ''}`} onClick={() => setActiveTab('Parties')}>Parties</div>
                            <div className={`tab ${activeTab === 'Groups' ? 'active' : ''}`} onClick={() => setActiveTab('Groups')}>Groups</div>
                            <div className={`tab ${activeTab === 'Reports' ? 'active' : ''}`} onClick={() => setActiveTab('Reports')}>Reports</div>
                        </div>                  </div>

                    <div className="search-wrap">                      <div className="search-box">
                        <span style={{ fontSize: '15px', color: '#c0c8da' }}>🔍</span>
                        <input type="text" placeholder="Search name or phone…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <div className="search-icon">🔍</div>
                    </div>
                    </div>

                    <div className="filter-row">                      {[
                        { id: 'all', label: 'All' },
                        { id: 'pending', label: 'Payment Pending' },
                        { id: 'received', label: 'Amount Received' },
                        { id: 'vip', label: 'VIP' },
                        { id: 'new', label: 'New' }
                    ].map(f => (
                        <div key={f.id} className={`chip ${activeFilter === f.id ? 'active' : ''}`} onClick={() => setActiveFilter(f.id)}>{f.label}</div>
                    ))}                  </div>

                    <div className="stats-strip">                      <div className="stat-card">
                        <div className="stat-label">Total</div>                          <div className="stat-value ink">{totalCount}</div>
                    </div>
                        <div className="stat-card">
                            <div className="stat-label">Pending</div>                          <div className="stat-value red">{formatLakhs(pendingTotal)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Received</div>                          <div className="stat-value green">{formatLakhs(receivedTotal)}</div>
                        </div>
                    </div>

                    <div className="list-header">                      <div className="list-count">Party List (<span>{finalList.length}</span>)</div>
                        <button className="balance-report-btn" onClick={() => toast.success('Balance report download ho raha hai…')}>📊 Balance Report</button>
                    </div>

                    <div className="list" id="customerList">                      {finalList.length === 0 ? (
                        <div className="empty" style={{ display: 'block' }}>
                            <div className="emoji">🔍</div>
                            <p>Koi customer nahi mila.<br />Search change karein.</p>
                        </div>
                    ) : (
                        finalList.map((c: any, i: number) => (
                            <div key={c.id} className="customer-card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => { setSelectedCustomer(c); setShowDetailModal(true); }}>
                                <div className="card-top">
                                    <div className="avatar" style={{ background: getColor(i) }}>
                                        {getInitials(c.name)}                                          <div className="num">{i + 1}</div>
                                    </div>
                                    <div className="card-info">
                                        <div className="card-name">
                                            {c.name}                                              {c.tag && <span style={{ fontSize: '9px', background: '#f0fdf8', color: '#00c48c', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '10px', fontWeight: 600, letterSpacing: '.3px' }}>{c.tag}</span>}
                                        </div>
                                        <div className="card-phone">📞 {c.phone}</div>
                                    </div>
                                    <div className="card-right">
                                        <div className={`pending-tag ${c.status === 'pending' ? 'red' : 'green'}`}>
                                            {c.status === 'pending' ? '⚠ Pending' : '✓ Received'}
                                        </div>
                                        <div className={`card-amount ${c.status === 'pending' ? 'red' : 'green'}`}>
                                            {c.amountStr}                                          </div>
                                    </div>
                                </div>
                                <div className="card-bottom">
                                    <button className="action-btn" onClick={(e) => handleWhatsApp(c, e)}>💬 WhatsApp</button>
                                    <a className="action-btn" href={`tel:${c.phone}`} onClick={(e) => e.stopPropagation()}>📞 Call</a>
                                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); toast('Edit: ' + c.name); }}>✏️ Edit</button>
                                    <span className="view-label">View →</span>                                  </div>
                            </div>
                        ))
                    )}                  </div>
                </div>

                <button className="fab" onClick={() => setShowAddModal(true)}>＋</button>

                <div className={`modal-overlay ${showDetailModal ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowDetailModal(false); }}>
                    <div className="modal">
                        <div className="modal-handle"></div>                      <div className="modal-title">{selectedCustomer?.name}</div>
                        <div>
                            <div className="modal-detail-row"><span className="detail-key">📱 Phone</span><span className="detail-val">{selectedCustomer?.phone}</span></div>                          <div className="modal-detail-row"><span className="detail-key">💰 Balance</span><span className="detail-val" style={{ color: selectedCustomer?.status === 'pending' ? '#ff4d6d' : '#00c48c' }}>{selectedCustomer?.amountStr}</span></div>
                            <div className="modal-detail-row"><span className="detail-key">📊 Status</span><span className="detail-val">{selectedCustomer?.status === 'pending' ? '⚠ Payment Pending' : '✓ Amount Received'}</span></div>                          <div className="modal-detail-row"><span className="detail-key">🏷 Tag</span><span className="detail-val">{selectedCustomer?.tag || '—'}</span></div>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn outline" onClick={() => setShowDetailModal(false)}>🗑 Delete</button>                          <button className="modal-btn solid" onClick={() => { toast('Edit mode open!'); setShowDetailModal(false); }}>✏️ Edit Party</button>
                        </div>                  </div>
                </div>

                <div className={`modal-overlay ${showAddModal ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
                    <div className="modal">
                        <div className="modal-handle"></div>                      <div className="modal-title">➕ Add New Customer</div>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: '#8892aa', display: 'block', marginBottom: '6px' }}>Name *</label>                              <input type="text" placeholder="Customer name" style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e4e8f4', borderRadius: '11px', fontFamily: 'Sora', fontSize: '13.5px', outline: 'none' }} value={newName} onChange={e => setNewName(e.target.value)} />
                            </div>                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: '#8892aa', display: 'block', marginBottom: '6px' }}>Phone *</label>                                  <input type="tel" placeholder="Mobile No." maxLength={10} style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e4e8f4', borderRadius: '11px', fontFamily: 'Sora', fontSize: '13.5px', outline: 'none' }} value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                                </div>                              <div>
                                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: '#8892aa', display: 'block', marginBottom: '6px' }}>Balance ₹</label>                                  <input type="number" placeholder="0" style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e4e8f4', borderRadius: '11px', fontFamily: 'Sora', fontSize: '13.5px', outline: 'none' }} value={newBal} onChange={e => setNewBal(e.target.value)} />
                                </div>                          </div>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn outline" onClick={() => setShowAddModal(false)}>Cancel</button>                          <button className="modal-btn solid" onClick={handleAdd}>Save Customer</button>
                        </div>                  </div>
                </div>

            </div>
        </div>
    );
}
