'use client';

import React, { useState, useEffect, useMemo } from 'react';
import './hisaab.css'; // The extracted CSS

// Utility functions
const f = (n: number, compact = true) => {
    const a = Math.abs(n || 0);
    if (compact && a >= 100000) return '₹' + (a / 100000).toFixed(1) + 'L';
    if (compact && a >= 1000) return '₹' + (a / 1000).toFixed(1) + 'K';
    return '₹' + a.toLocaleString('en-IN');
};
const ff = (n: number) => '₹' + Math.abs(n || 0).toLocaleString('en-IN');
const fd = (d: string) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
const ini = (n: string) => n.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export default function BusinessExpensesPage() {
    const [customers, setCustomers] = useState([
        { id: 1, name: 'Ramesh Bhai', phone: '98765 11111', cat: 'Wholesale', color: 'av-lime', limit: 50000 },
        { id: 2, name: 'Suresh Tent House', phone: '98765 22222', cat: 'Supplier', color: 'av-blue', limit: 30000 },
        { id: 3, name: 'Tarun', phone: '98765 33333', cat: 'Worker', color: 'av-red', limit: 15000 },
        { id: 4, name: 'Band Baja Group', phone: '98765 44444', cat: 'Service', color: 'av-teal', limit: 20000 },
    ]);
    const [txns, setTxns] = useState([
        { id: 1, cid: 1, type: 'credit', desc: 'Maal diya', amt: 5000, date: '2026-03-20', cat: 'Maal', note: '' },
        { id: 2, cid: 1, type: 'debit', desc: 'Paise liye wapas', amt: 2000, date: '2026-03-19', cat: 'Payment', note: 'Cash' },
        { id: 3, cid: 2, type: 'debit', desc: 'Tent ka advance', amt: 6000, date: '2026-03-17', cat: 'Advance', note: 'Shaadi ke liye' },
        { id: 4, cid: 2, type: 'credit', desc: 'Uthaya hua paisa wapas', amt: 1500, date: '2026-03-18', cat: 'Payment', note: '' },
        { id: 5, cid: 3, type: 'debit', desc: 'Kaam ke paise diye', amt: 2100, date: '2026-03-15', cat: 'Salary', note: '' },
        { id: 6, cid: 3, type: 'debit', desc: 'Advance diya', amt: 500, date: '2026-03-16', cat: 'Advance', note: '' },
        { id: 7, cid: 4, type: 'debit', desc: 'Band baja booking advance', amt: 2500, date: '2026-03-14', cat: 'Advance', note: '' },
        { id: 8, cid: 1, type: 'credit', desc: 'Naya order payment', amt: 8000, date: '2026-03-21', cat: 'Maal', note: 'Cash mila' },
    ]);

    const [nCid, setNCid] = useState(5);
    const [nTid, setNTid] = useState(9);
    const [editingTxnId, setEditingTxnId] = useState<number | null>(null);

    const [selColor, setSelColor] = useState('av-lime');
    const [curCid, setCurCid] = useState<number | null>(null);
    const [filterMode, setFilterMode] = useState('all');
    const [qMode, setQMode] = useState('credit');
    const [drawerType, setDrawerType] = useState('credit');
    const [sortMode, setSortMode] = useState('name');
    const [searchQuery, setSearchQuery] = useState('');

    const [toastMsg, setToastMsg] = useState({ show: false, icon: '', msg: '' });
    const [activeDrawer, setActiveDrawer] = useState<'none' | 'addCust' | 'addTxn'>('none');
    const [showMobileList, setShowMobileList] = useState(true);

    // Forms
    const [cName, setCName] = useState('');
    const [cPhone, setCPhone] = useState('');
    const [cCat, setCCat] = useState('General');
    const [cLimit, setCLimit] = useState('');

    const [dCust, setDCust] = useState('');
    const [dDesc, setDDesc] = useState('');
    const [dAmt, setDAmt] = useState('');
    const [dDate, setDDate] = useState(new Date().toISOString().split('T')[0]);
    const [dCat, setDCat] = useState('General');
    const [dNote, setDNote] = useState('');

    const [qDesc, setQDesc] = useState('');
    const [qAmt, setQAmt] = useState('');
    const [qPickedAmt, setQPickedAmt] = useState<number | null>(null);
    const [qDate, setQDate] = useState(new Date().toISOString().split('T')[0]);

    // Load Persistence
    useEffect(() => {
        const sC = localStorage.getItem('hisaab_customers');
        const sT = localStorage.getItem('hisaab_txns');
        if (sC) {
            try { setCustomers(JSON.parse(sC)); setNCid(Math.max(...JSON.parse(sC).map((c: any) => c.id)) + 1); } catch (e) { }
        }
        if (sT) {
            try { setTxns(JSON.parse(sT)); setNTid(Math.max(...JSON.parse(sT).map((t: any) => t.id)) + 1); } catch (e) { }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('hisaab_customers', JSON.stringify(customers));
        localStorage.setItem('hisaab_txns', JSON.stringify(txns));
    }, [customers, txns]);

    const getCust = (id: number) => customers.find(c => c.id === id);
    const getTxns = (id: number) => txns.filter(t => t.cid === id);

    const calcBal = (cid: number) => {
        let credit = 0, debit = 0;
        getTxns(cid).forEach(t => { if (t.type === 'credit') credit += t.amt; else debit += t.amt; });
        return { credit, debit, net: credit - debit };
    };

    const totalBal = useMemo(() => {
        let c = 0, d = 0;
        txns.forEach(t => { if (t.type === 'credit') c += t.amt; else d += t.amt; });
        return { credit: c, debit: d, net: c - d };
    }, [txns]);

    const toast = (icon: string, msg: string) => {
        setToastMsg({ show: true, icon, msg });
        setTimeout(() => setToastMsg({ show: false, icon: '', msg: '' }), 2800);
    };

    // Lists
    const displayList = useMemo(() => {
        const q = searchQuery.toLowerCase();
        let list = customers.filter(c => c.name.toLowerCase().includes(q) || (c.phone || '').includes(q));

        if (sortMode === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortMode === 'bal') list.sort((a, b) => Math.abs(calcBal(b.id).net) - Math.abs(calcBal(a.id).net));
        else if (sortMode === 'recent') {
            list.sort((a, b) => {
                const la = getTxns(a.id).sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())[0]?.date || '0';
                const lb = getTxns(b.id).sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())[0]?.date || '0';
                return lb.localeCompare(la);
            });
        }
        return list;
    }, [customers, txns, searchQuery, sortMode]);

    const toggleSort = () => {
        const modes = ['name', 'bal', 'recent'];
        setSortMode(modes[(modes.indexOf(sortMode) + 1) % 3]);
    };

    const sortLabels: Record<string, string> = { name: 'A→Z', bal: 'Balance', recent: 'Recent' };

    // Handlers
    const handleOpenCust = (cid: number) => {
        setCurCid(cid);
        setFilterMode('all');
        if (window.innerWidth <= 680) setShowMobileList(false);
    };

    const exportCSV = () => {
        const rows = [['#', 'Customer', 'Type', 'Description', 'Category', 'Amount', 'Date', 'Note']];
        txns.forEach((t, i) => rows.push([String(i + 1), getCust(t.cid)?.name || '?', t.type, t.desc, t.cat, parseInt(t.amt as any).toString(), t.date, t.note || '']));
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
        a.download = 'hisaab-pro-ledger.csv';
        a.click();
        toast('📤', 'CSV export ho gaya!');
    };

    const addCustomer = () => {
        if (!cName.trim()) { toast('❌', 'Naam toh likho!'); return; }
        const nc = {
            id: nCid,
            name: cName.trim(),
            phone: cPhone.trim(),
            cat: cCat,
            color: selColor,
            limit: parseFloat(cLimit) || 20000
        };
        setCustomers([nc, ...customers]);
        setNCid(nCid + 1);
        setActiveDrawer('none');
        setCName(''); setCPhone(''); setCLimit('');
        toast('✅', `${nc.name} add ho gaya!`);
        handleOpenCust(nc.id);
    };

    const addTxnFull = () => {
        const cid = parseInt(dCust);
        const amt = parseFloat(dAmt);
        if (!cid || !amt || !dDate) { toast('❌', 'Customer, raqam aur tarikh bharo!'); return; }
        const desc = dDesc.trim() || (drawerType === 'credit' ? 'Credit' : 'Debit');
        const nt = {
            id: editingTxnId !== null ? editingTxnId : nTid, cid, type: drawerType, desc, amt, date: dDate,
            cat: dCat, note: dNote.trim()
        };
        if (editingTxnId !== null) {
            setTxns(txns.map(t => t.id === editingTxnId ? nt : t));
            setEditingTxnId(null);
            toast('✅', 'Entry update ho gayi!');
        } else {
            setTxns([nt, ...txns]);
            setNTid(nTid + 1);
            toast('✅', 'Entry save ho gayi!');
        }
        setActiveDrawer('none');
        setDDesc(''); setDNote(''); setDAmt('');
        if (curCid === cid) handleOpenCust(cid);
    };

    const quickSave = () => {
        if (!curCid) return;
        const amt = parseFloat(qAmt);
        const desc = qDesc.trim() || (qMode === 'credit' ? 'Credit (Jama)' : 'Debit (Kharch)');
        if (!amt || amt <= 0) { toast('❌', 'Raqam likho!'); return; }
        const nt = {
            id: nTid, cid: curCid, type: qMode, desc, amt,
            date: qDate || new Date().toISOString().split('T')[0], cat: 'General', note: ''
        };
        setTxns([nt, ...txns]);
        setNTid(nTid + 1);
        setQAmt(''); setQDesc(''); setQPickedAmt(null);
        toast(qMode === 'credit' ? '✅' : '❌', `${ff(amt)} ${qMode === 'credit' ? 'jama hua' : 'katwa diya'}!`);
    };

    const startEditTxn = (t: any) => {
        setEditingTxnId(t.id);
        setDrawerType(t.type);
        setDCust(t.cid.toString());
        setDDesc(t.desc);
        setDAmt(t.amt.toString());
        setDDate(t.date);
        setDCat(t.cat);
        setDNote(t.note || '');
        setActiveDrawer('addTxn');
    };

    const delTxn = (id: number) => {
        if (!confirm('Ye entry delete karein?')) return;
        setTxns(txns.filter(t => t.id !== id));
        toast('🗑', 'Delete ho gaya');
    };

    const delCustomer = (id: number) => {
        if (!confirm('Kya aap is customer aur inke sabhi transactions ko delete karna chahte hain?')) return;
        setTxns(txns.filter(t => t.cid !== id));
        setCustomers(customers.filter(c => c.id !== id));
        if (curCid === id) {
            setCurCid(null);
            setShowMobileList(true);
        }
        toast('🗑', 'Customer delete ho gaya!');
    };

    // Rendering bits
    const curBal = curCid ? calcBal(curCid) : null;
    const cCust = curCid ? getCust(curCid) : null;

    let displayTxns = curCid ? getTxns(curCid) : [];
    if (filterMode === 'credit') displayTxns = displayTxns.filter(t => t.type === 'credit');
    else if (filterMode === 'debit') displayTxns = displayTxns.filter(t => t.type === 'debit');
    else if (filterMode === 'advance') displayTxns = displayTxns.filter(t => t.cat === 'Advance');
    displayTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const groupedTxns = displayTxns.reduce((acc, t) => {
        if (!acc[t.date]) acc[t.date] = [];
        acc[t.date].push(t);
        return acc;
    }, {} as Record<string, typeof displayTxns>);
    const dates = Object.keys(groupedTxns).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="hisaab-root" style={{ paddingTop: '8px' }}>
            {/* TOPBAR */}
            <div className="topbar">
                {!showMobileList && (
                    <div className="tb-back show" onClick={() => setShowMobileList(true)}>←</div>
                )}
                <div className="logo">₹</div>
                <div className="title-block">
                    {!showMobileList && cCust ? (
                        <>
                            <div className="t1">{cCust.name}</div>
                            <div className="t2">{cCust.cat} · {getTxns(curCid!).length} entries</div>
                        </>
                    ) : (
                        <>
                            <div className="t1">Hisaab Pro</div>
                            <div className="t2">Customer Ledger</div>
                        </>
                    )}
                </div>
                <div className="spacer"></div>
                <button className="tb-btn prime" onClick={() => setActiveDrawer('addCust')} style={{ marginRight: 4 }}>+ Customer</button>
                <button className="tb-btn" onClick={exportCSV} title="Export CSV">📤</button>
            </div>

            {/* LAYOUT */}
            <div className="layout relative">
                {/* LEFT: CUSTOMERS */}
                <div className={`cust-panel ${!showMobileList ? 'hide' : ''}`}>
                    <div className="global-stats">
                        <div className="gs-card">
                            <div className="gs-val" style={{ color: 'var(--G)' }}>{f(totalBal.credit)}</div>
                            <div className="gs-lbl">Total Received</div>
                        </div>
                        <div className="gs-card">
                            <div className="gs-val" style={{ color: 'var(--R)' }}>{f(totalBal.debit)}</div>
                            <div className="gs-lbl">Total Given</div>
                        </div>
                        <div className="gs-card">
                            <div className="gs-val" style={{ color: totalBal.net >= 0 ? 'var(--G)' : 'var(--R)' }}>{f(Math.abs(totalBal.net))}</div>
                            <div className="gs-lbl">Net</div>
                        </div>
                    </div>

                    <div className="search-row">
                        <span className="srch-icon">🔍</span>
                        <input className="srch" type="text" placeholder="Customer dhundho..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        <button className="sort-pill" onClick={toggleSort}>{sortLabels[sortMode]}</button>
                    </div>

                    <div className="cust-list">
                        {!displayList.length ? (
                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted2)' }}>
                                <div style={{ fontSize: 36, opacity: 0.25, marginBottom: 8 }}>👥</div>
                                <div style={{ fontWeight: 800 }}>Koi customer nahi</div>
                            </div>
                        ) : (
                            displayList.map(c => {
                                const b = calcBal(c.id);
                                const nc = b.net >= 0 ? 'var(--G)' : 'var(--R)';
                                const lastTxn = getTxns(c.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                return (
                                    <div key={c.id} className={`cust-item ${curCid === c.id ? 'active' : ''}`} onClick={() => handleOpenCust(c.id)}>
                                        <div className={`ci-av ${c.color}`}>{ini(c.name)}</div>
                                        <div className="ci-info">
                                            <div className="ci-name">{c.name}</div>
                                            <div className="ci-sub">
                                                <span className="ci-cnt">{getTxns(c.id).length} entry</span>
                                                {c.cat && <span>{c.cat}</span>}
                                                {lastTxn && <span style={{ color: 'var(--muted)' }}>{fd(lastTxn.date)}</span>}
                                            </div>
                                        </div>
                                        <div className="ci-right">
                                            <div className="ci-bal" style={{ color: nc }}>{f(Math.abs(b.net))}</div>
                                            <div className="ci-tag" style={{ color: nc }}>{b.net > 0 ? 'Baki Hai' : b.net < 0 ? 'Dena Hai' : 'Clear ✓'}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="add-cust-row" onClick={() => setActiveDrawer('addCust')}>
                        <div className="add-cust-av">➕</div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Naya Customer</div>
                            <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 1 }}>Add karo ledger mein</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: LEDGER */}
                <div className="ledger-panel">
                    {!curCid ? (
                        <div className="welcome">
                            <div className="wlc-icon">📒</div>
                            <div className="wlc-title">Koi Customer Chuniye</div>
                            <div className="wlc-sub">Left mein customer par click karo<br />uska poora hisaab yahaan dikhega</div>
                            <div className="wlc-cards">
                                <div className="wlc-card" onClick={() => setActiveDrawer('addCust')}>
                                    <span style={{ fontSize: 22 }}>👤</span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 800 }}>Pehla customer jodo</div>
                                        <div style={{ fontSize: 11, color: 'var(--muted2)' }}>Tap to add</div>
                                    </div>
                                    <span style={{ color: 'var(--L)', marginLeft: 'auto', fontSize: 16 }}>→</span>
                                </div>
                                <div className="wlc-card" onClick={() => setActiveDrawer('addTxn')}>
                                    <span style={{ fontSize: 22 }}>💸</span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 800 }}>Transaction add karo</div>
                                        <div style={{ fontSize: 11, color: 'var(--muted2)' }}>Direct entry</div>
                                    </div>
                                    <span style={{ color: 'var(--L)', marginLeft: 'auto', fontSize: 16 }}>→</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="ledger-view">
                            {cCust && curBal && (
                                <>
                                    <div className="cust-hdr">
                                        <div className="ch-main">
                                            <div className={`ch-av ${cCust.color}`}>{ini(cCust.name)}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="ch-name">{cCust.name}</div>
                                                <div className="ch-meta">
                                                    {cCust.phone && <span>📞 {cCust.phone}</span>}
                                                    <span>🏷 {cCust.cat}</span>
                                                    <span style={{ background: curBal.net >= 0 ? 'rgba(14,207,124,0.12)' : 'rgba(255,61,92,0.1)', color: curBal.net >= 0 ? 'var(--G)' : 'var(--R)', padding: '2px 8px', borderRadius: 5, fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}>
                                                        {curBal.net >= 0 ? 'Baaki Hai' : 'Dena Hai'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="ch-net" style={{ color: curBal.net >= 0 ? 'var(--G)' : 'var(--R)' }}>{ff(Math.abs(curBal.net))}</div>
                                                <div className="ch-net-lbl" style={{ marginBottom: '6px' }}>Net Balance</div>
                                                <button onClick={() => delCustomer(cCust.id)} style={{ width: '100%', fontSize: '10px', background: 'rgba(255,61,92,0.1)', color: 'var(--R)', border: '1px solid rgba(255,61,92,0.2)', padding: '3px 0', borderRadius: '5px', cursor: 'pointer', fontWeight: 800, transition: 'all 0.15s' }}>🗑 Delete</button>
                                            </div>
                                        </div>
                                        <div className="stat-strip">
                                            <div className="ss-item"><div className="ss-val" style={{ color: 'var(--G)' }}>{f(curBal.credit)}</div><div className="ss-lbl">✅ Credit</div></div>
                                            <div className="ss-item"><div className="ss-val" style={{ color: 'var(--R)' }}>{f(curBal.debit)}</div><div className="ss-lbl">❌ Debit</div></div>
                                            <div className="ss-item"><div className="ss-val" style={{ color: 'var(--B)' }}>{getTxns(curCid).length}</div><div className="ss-lbl">📋 Entries</div></div>
                                            <div className="ss-item"><div className="ss-val" style={{ color: 'var(--L)' }}>{f(Math.max((cCust.limit || 20000) - curBal.debit, 0))}</div><div className="ss-lbl">💳 Limit</div></div>
                                        </div>
                                        <div className="credit-strip">
                                            <div className="cs-lbl">💳 Credit Used</div>
                                            <div className="cs-bar"><div className="cs-fill" style={{ width: `${Math.min((getTxns(curCid).filter(t => t.type === 'credit').reduce((s, t) => s + t.amt, 0) / (cCust.limit || 20000)) * 100, 100)}%` }}></div></div>
                                            <div className="cs-pct">{Math.min((getTxns(curCid).filter(t => t.type === 'credit').reduce((s, t) => s + t.amt, 0) / (cCust.limit || 20000)) * 100, 100).toFixed(0)}%</div>
                                            <div style={{ fontSize: 10, color: 'var(--muted2)' }}>({ff(cCust.limit || 20000)} limit)</div>
                                        </div>
                                    </div>

                                    <div className="chips-row">
                                        <button className={`chip ${filterMode === 'all' ? 'on' : ''}`} onClick={() => setFilterMode('all')}>📋 Sab</button>
                                        <button className={`chip ${filterMode === 'credit' ? 'on' : ''}`} onClick={() => setFilterMode('credit')}>✅ Credit</button>
                                        <button className={`chip ${filterMode === 'debit' ? 'on' : ''}`} onClick={() => setFilterMode('debit')}>❌ Debit</button>
                                        <button className={`chip ${filterMode === 'advance' ? 'on' : ''}`} onClick={() => setFilterMode('advance')}>⚡ Advance</button>
                                    </div>

                                    <div className="txn-area">
                                        {!displayTxns.length ? (
                                            <div className="txn-empty"><div className="ei">📭</div><div className="et">Koi entry nahi</div><div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Neeche se jaldi add karo</div></div>
                                        ) : (
                                            dates.map(date => {
                                                const dayList = groupedTxns[date];
                                                const dayNet = dayList.reduce((s, t) => s + (t.type === 'credit' ? t.amt : -t.amt), 0);
                                                return (
                                                    <React.Fragment key={date}>
                                                        <div className="date-sep">
                                                            {fd(date)}
                                                            <span className="day-sum" style={{ color: dayNet >= 0 ? 'var(--G)' : 'var(--R)' }}>{dayNet >= 0 ? '+' : '-'}{f(Math.abs(dayNet))}</span>
                                                        </div>
                                                        {dayList.map(t => {
                                                            const isC = t.type === 'credit';
                                                            const cfg = isC
                                                                ? { bg: 'rgba(14,207,124,0.09)', ic: '✅', bc: 'rgba(14,207,124,0.12)', tc: 'var(--G)', lbl: 'Credit' }
                                                                : t.cat === 'Advance'
                                                                    ? { bg: 'rgba(255,187,51,0.09)', ic: '⚡', bc: 'rgba(255,187,51,0.12)', tc: 'var(--Y)', lbl: 'Advance' }
                                                                    : { bg: 'rgba(255,61,92,0.08)', ic: '❌', bc: 'rgba(255,61,92,0.1)', tc: 'var(--R)', lbl: 'Debit' };
                                                            return (
                                                                <div className="txn-row" key={t.id}>
                                                                    <div className="t-icon" style={{ background: cfg.bg }}>{cfg.ic}</div>
                                                                    <div className="t-body">
                                                                        <div className="t-desc">{t.desc || '—'}</div>
                                                                        <div className="t-meta">
                                                                            <span className="t-badge" style={{ background: cfg.bc, color: cfg.tc }}>{cfg.lbl}</span>
                                                                            <span>{t.cat}</span>
                                                                            {t.note && <span className="t-note">· {t.note}</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="t-amt" style={{ color: isC ? 'var(--G)' : 'var(--R)' }}>{isC ? '+' : '-'}{ff(t.amt)}</div>
                                                                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                                        <div className="del-btn" style={{ background: 'rgba(72,153,255,0.1)', color: 'var(--B)', border: '1px solid rgba(72,153,255,0.2)' }} onClick={() => startEditTxn(t)} title="Edit">✏️</div>
                                                                        <div className="del-btn" onClick={() => delTxn(t.id)} title="Delete">🗑</div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </div>

                                    <div className="bal-footer">
                                        <div className="bf-item"><div className="bf-v" style={{ color: 'var(--G)' }}>{ff(curBal.credit)}</div><div className="bf-l">✅ Credit</div></div>
                                        <div className="bf-div"></div>
                                        <div className="bf-item"><div className="bf-v" style={{ color: 'var(--R)' }}>{ff(curBal.debit)}</div><div className="bf-l">❌ Debit</div></div>
                                        <div className="bf-div"></div>
                                        <div className="bf-item"><div className="bf-v" style={{ color: curBal.net >= 0 ? 'var(--G)' : 'var(--R)' }}>{ff(Math.abs(curBal.net))}</div><div className="bf-l">{curBal.net >= 0 ? 'Baaki Hai' : 'Dena Hai'}</div></div>
                                    </div>

                                    {/* QUICK BAR */}
                                    <div className="quick-bar">
                                        <div className="qb-big-btns">
                                            <button className={`qbb credit-btn ${qMode === 'credit' ? 'active' : ''}`} onClick={() => { setQMode('credit'); document.getElementById('qDesc')?.focus(); }}>✅ Credit (Jama)</button>
                                            <button className={`qbb debit-btn ${qMode === 'debit' ? 'active' : ''}`} onClick={() => { setQMode('debit'); document.getElementById('qDesc')?.focus(); }}>❌ Debit (Kharch)</button>
                                        </div>
                                        <div className="amt-pills">
                                            <span style={{ fontSize: 10, color: 'var(--muted2)', fontWeight: 800, alignSelf: 'center', whiteSpace: 'nowrap' }}>Quick:</span>
                                            {[100, 200, 500, 1000, 2000, 5000, 10000].map(v => (
                                                <button key={v} className={`ap ${qPickedAmt === v ? 'picked' : ''}`} onClick={() => { setQAmt(v.toString()); setQPickedAmt(v); }}>
                                                    ₹{v >= 1000 ? v / 1000 + 'K' : v}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="qb-inputs">
                                            <input type="date" className="qb-desc" style={{ flex: 'none', width: '130px', padding: '0 8px' }} value={qDate} onChange={e => setQDate(e.target.value)} title="Tarikh" />
                                            <input className="qb-desc" type="text" id="qDesc" placeholder="Kya ke liye..." value={qDesc} onChange={e => setQDesc(e.target.value)} onKeyDown={e => e.key === 'Enter' && document.getElementById('qAmt')?.focus()} />
                                            <input className="qb-amt" type="number" id="qAmt" placeholder="₹0" inputMode="numeric" value={qAmt} onChange={e => setQAmt(e.target.value)} onKeyDown={e => e.key === 'Enter' && quickSave()} />
                                            <button className={`qb-go ${qMode === 'credit' ? 'credit-go' : 'debit-go'}`} onClick={quickSave}>↑</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* DRAWERS */}
            <div className={`overlay ${activeDrawer === 'addCust' ? 'on' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setActiveDrawer('none'); }}>
                <div className="drawer">
                    <div className="dh"></div>
                    <div className="dtitle">👤 Naya Customer</div>
                    <div className="dbody">
                        <div className="fg"><label className="fl">Customer Ka Naam *</label><input className="fi" type="text" placeholder="e.g. Ramesh Bhai" value={cName} onChange={e => setCName(e.target.value)} /></div>
                        <div className="frow">
                            <div className="fg"><label className="fl">Phone Number</label><input className="fi" type="tel" placeholder="98765 43210" value={cPhone} onChange={e => setCPhone(e.target.value)} /></div>
                            <div className="fg"><label className="fl">Category / Type</label>
                                <select className="fs" value={cCat} onChange={e => setCCat(e.target.value)}>
                                    {['General', 'Wholesale', 'Retail', 'Supplier', 'Worker', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="fg"><label className="fl">Credit Limit (₹)</label><input className="fi" type="number" placeholder="e.g. 50000" inputMode="numeric" value={cLimit} onChange={e => setCLimit(e.target.value)} /></div>
                        <div className="fg"><label className="fl">Color</label>
                            <div className="av-row">
                                {['av-lime', 'av-green', 'av-blue', 'av-red', 'av-yellow', 'av-purple', 'av-pink', 'av-teal', 'av-orange'].map(c => (
                                    <div key={c} className={`av-dot ${c} ${selColor === c ? 'on' : ''}`} onClick={() => setSelColor(c)}></div>
                                ))}
                            </div>
                        </div>
                        <button className="sbtn" onClick={addCustomer}>✓ Customer Jodo</button>
                    </div>
                </div>
            </div>

            <div className={`overlay ${activeDrawer === 'addTxn' ? 'on' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) { setActiveDrawer('none'); setEditingTxnId(null); } }}>
                <div className="drawer">
                    <div className="dh"></div>
                    <div className="dtitle">💰 {editingTxnId !== null ? 'Edit Transaction' : 'Transaction'}</div>
                    <div className="dbody">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                            <button className={`qbb credit-btn ${drawerType === 'credit' ? 'active' : ''}`} style={{ height: 40, borderRadius: 11, fontSize: 14 }} onClick={() => setDrawerType('credit')}>✅ Credit (Jama)</button>
                            <button className={`qbb debit-btn ${drawerType === 'debit' ? 'active' : ''}`} style={{ height: 40, borderRadius: 11, fontSize: 14 }} onClick={() => setDrawerType('debit')}>❌ Debit (Kharch)</button>
                        </div>
                        <div className="fg"><label className="fl">Customer *</label>
                            <select className="fs" value={dCust || curCid?.toString() || ''} onChange={e => setDCust(e.target.value)}>
                                <option value="">— Customer Chuniye —</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="fg"><label className="fl">Vivran (Description)</label><input className="fi" type="text" placeholder="e.g. Maal diya, paise liye..." value={dDesc} onChange={e => setDDesc(e.target.value)} /></div>
                        <div className="frow">
                            <div className="fg"><label className="fl">Raqam (₹) *</label><input className="fi" type="number" placeholder="0" inputMode="numeric" value={dAmt} onChange={e => setDAmt(e.target.value)} /></div>
                            <div className="fg"><label className="fl">Tarikh *</label><input className="fi" type="date" value={dDate} onChange={e => setDDate(e.target.value)} /></div>
                        </div>
                        <div className="frow">
                            <div className="fg"><label className="fl">Category</label>
                                <select className="fs" value={dCat} onChange={e => setDCat(e.target.value)}>
                                    {['General', 'Advance', 'Maal', 'Service', 'Payment', 'Salary', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="fg"><label className="fl">Note (Optional)</label><input className="fi" type="text" placeholder="Extra info..." value={dNote} onChange={e => setDNote(e.target.value)} /></div>
                        </div>
                        <button className="sbtn" onClick={addTxnFull}>✓ Save Karo</button>
                    </div>
                </div>
            </div>

            {/* TOAST */}
            <div className={`toast ${toastMsg.show ? 'on' : ''}`}>
                <span>{toastMsg.icon}</span> <span>{toastMsg.msg}</span>
            </div>
        </div>
    );
}
