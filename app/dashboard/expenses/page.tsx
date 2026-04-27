'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import './hisaab.css';
import { generateHisaabPDF } from '../../../lib/pdf-generator';
import { useSession } from 'next-auth/react';

// ─── HELPERS ───
async function compressImage(dataUrl: string, maxWidth = 800): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            } else {
                resolve(dataUrl);
            }
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}

const COLORS = ['#7c83ff', '#00c853', '#e53935', '#f9a825', '#0091ea', '#00bcd4', '#8e24aa'];
function getColor(name: string) {
    let h = 0;
    for (let c of name) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
    return COLORS[Math.abs(h) % COLORS.length];
}
function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function fmt(n: number) {
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
    return '₹' + n;
}
function formatDateShort(d: string) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dt = new Date(d);
    return days[dt.getDay()] + ', ' + dt.getDate() + ' ' + months[dt.getMonth()];
}
function formatDateLong(d: string) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dt = new Date(d);
    return days[dt.getDay()].toUpperCase().slice(0, 3) + ', ' + dt.getDate() + ' ' + months[dt.getMonth()].toUpperCase();
}
function formatTime(d: string) {
    const dt = new Date(d);
    let h = dt.getHours();
    const m = dt.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // 0 should be 12
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
}

const DEFAULT_DATA = [
    {
        id: 1, name: 'Band Baja Group', phone: '98765 44444', type: 'Service', limit: 20000, balance: 2500, txns: [
            { id: 101, type: 'advance', name: 'Band baja booking advance', note: 'Advance payment', date: '2026-03-14T10:00:00', amt: 2500, photos: [] }
        ]
    },
    {
        id: 2, name: 'Ramesh Bhai', phone: '87654 33333', type: 'Wholesale', limit: 50000, balance: 11000, txns: [
            { id: 201, type: 'debit', name: 'Maal diya', note: 'March order', date: '2026-03-18T10:00:00', amt: 15000, photos: [] },
            { id: 202, type: 'credit', name: 'Payment liya', note: 'Partial', date: '2026-03-20T10:00:00', amt: 4000, photos: [] },
            { id: 203, type: 'credit', name: 'Baki payment', note: 'Final', date: '2026-03-21T10:00:00', amt: 0, photos: [] },
        ]
    },
    {
        id: 3, name: 'Suresh Tent House', phone: '76543 22222', type: 'Supplier', limit: 30000, balance: 4500, txns: [
            { id: 301, type: 'advance', name: 'Tent booking advance', note: 'Wedding event', date: '2026-03-15T10:00:00', amt: 2000, photos: [] },
            { id: 302, type: 'debit', name: 'Extra items', note: 'Chairs, tables', date: '2026-03-18T10:00:00', amt: 2500, photos: [] },
        ]
    },
    {
        id: 4, name: 'Tarun', phone: '65432 11111', type: 'Worker', limit: 10000, balance: -400, txns: [
            { id: 401, type: 'credit', name: 'Salary advance', note: 'March', date: '2026-03-16T10:00:00', amt: 1500, photos: [] },
            { id: 402, type: 'advance', name: 'Kharcha advance', note: 'Petrol', date: '2026-03-16T10:00:00', amt: 1100, photos: [] },
        ]
    },
];

export default function BusinessExpensesPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [canSave, setCanSave] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [activeScreen, setActiveScreen] = useState<'list' | 'detail'>('list');
    const [curCid, setCurCid] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentFilter, setCurrentFilter] = useState('all');
    const { data: session, status } = useSession();

    // Drawer / Modals
    const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
    const [isAddCustOpen, setIsAddCustOpen] = useState(false);
    const [lightboxImg, setLightboxImg] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState('');

    // Add Entry Form state
    const [entryType, setEntryType] = useState<'credit' | 'debit' | 'advance'>('credit');
    const [amtInp, setAmtInp] = useState('');
    const [entryName, setEntryName] = useState('');
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
    const [entryNote, setEntryNote] = useState('');
    const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);
    const [editTxnId, setEditTxnId] = useState<number | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [autoAiScan, setAutoAiScan] = useState(true);

    // Expand toggle state per transaction ID
    const [expandedTxns, setExpandedTxns] = useState<Record<number, boolean>>({});

    // Add Cust Form state
    const [acName, setAcName] = useState('');
    const [acPhone, setAcPhone] = useState('');
    const [acType, setAcType] = useState('Service');
    const [acLimit, setAcLimit] = useState('');
    const [acOpening, setAcOpening] = useState('');

    const toastTimeout = useRef<any>(null);

    useEffect(() => {
        if (status === 'loading') return;
        
        let loadedData = null;
        const possibleKeys = [
            `hisaab_pro_data_${session?.user?.id}`
        ];
        
        // If email is present, check that too
        if (session?.user?.email) {
            possibleKeys.push(`hisaab_pro_data_${session.user.email}`);
        }

        // EMERGENCY OWNER RECOVERY: Only the main owner can recover the old global data
        if (session?.user?.email === 'gpaliwal59@gmail.com') {
            possibleKeys.push('hisaab_pro_data');
        }

        // Search through all possible keys for the user
        for (const k of possibleKeys) {
            if (!k || k === 'hisaab_pro_data_undefined') continue;
            const saved = localStorage.getItem(k);
            if (saved && saved !== '[]') {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.length > 0) {
                        loadedData = parsed;
                        break; // Found the data!
                    }
                } catch (e) {}
            }
        }

        if (loadedData) {
            setCustomers(loadedData);
        }
        
        setIsMounted(true);
        setTimeout(() => setCanSave(true), 1000); // Wait 1s before allowing any overwrites
    }, [status, session?.user?.id, session?.user?.email]);

    useEffect(() => {
        if (canSave && customers && customers.length > 0) {
            const userIdentifier = session?.user?.id || session?.user?.email;
            const storageKey = userIdentifier ? `hisaab_pro_data_${userIdentifier}` : 'hisaab_pro_data';
            try {
                localStorage.setItem(storageKey, JSON.stringify(customers));
            } catch (err) {
                console.error("Storage limit exceeded:", err);
                showToast("⚠️ Storage full! Photo ko delete karein.");
            }

            // Background Live Sync: update cloud DB so Live Links always show latest data
            if (curCid) {
                const c = customers.find((x: any) => x.id === curCid);
                if (c) {
                    fetch('/api/hisaab/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(c)
                    }).catch(e => console.error("Sync failed", e));
                }
            }
        }
    }, [customers, canSave, curCid, session]);

    // AUTO-HEAL: Fix corrupted balances from old reversed math logic
    useEffect(() => {
        if (!isMounted || customers.length === 0) return;

        let needsHeal = false;
        const healedCustomers = customers.map(c => {
            if (!c.txns || c.txns.length === 0) return c;

            // Calculate what the balance SHOULD be if opening balance was 0
            let debitSum = 0, creditSum = 0;
            c.txns.forEach((t: any) => {
                if (t.type === 'credit') creditSum += t.amt;
                else debitSum += t.amt; // advance & debit
            });

            // Calculate Correct Balance (Debit = +, Credit = -)
            const expectedCorrectBalance = debitSum - creditSum;

            // If the current balance does not match the expected balance, we assume it's corrupted 
            // (either missing opening balance or polluted by old logic).
            // Let's assume opening balance was 0 for simplicity, or we recalculate it by reverse engineering the old logic:
            // old logic: bal = opening + credit - debit. 
            // So opening = oldBal - credit + debit.
            const inferredOpeningBalance = c.balance - creditSum + debitSum;
            const absoluteCorrectBalance = inferredOpeningBalance + debitSum - creditSum;

            // However, it's safer to just reset it to pure transactions if it looks wrong and isn't exactly matching.
            if (c.balance !== absoluteCorrectBalance && c.balance !== expectedCorrectBalance) {
                needsHeal = true;
                return { ...c, balance: expectedCorrectBalance }; // Just reset to pure transactions to wipe the corruption
            }
            return c;
        });

        if (needsHeal) {
            setCustomers(healedCustomers);
            console.log("Auto-healed corrupted balances!");
            showToast("🛠 Purani entries ka hisaab theek kar diya gaya hai!");
        }
    }, [isMounted, customers.length]); // only run once when loaded

    useEffect(() => {
        const handlePopState = () => {
            if (activeScreen === 'detail') {
                setActiveScreen('list');
                setCurCid(null);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [activeScreen]);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToastMsg(''), 2500);
    };

    const currentCust = curCid ? customers.find(c => c.id === curCid) : null;

    // Derived Stats
    const totalStats = useMemo(() => {
        let received = 0, given = 0;
        customers.forEach(c => {
            if (c.balance > 0) received += c.balance;
            if (c.balance < 0) given += Math.abs(c.balance);
        });
        return { received, given, net: received - given };
    }, [customers]);

    const custStats = useMemo(() => {
        if (!currentCust) return { credit: 0, debit: 0, net: 0, entries: 0 };
        let c = 0, d = 0;
        currentCust.txns.forEach((t: any) => {
            if (t.type === 'credit') c += t.amt;
            else d += t.amt;
        });
        return { credit: c, debit: d, net: Math.abs(currentCust.balance), entries: currentCust.txns.length, isNeg: currentCust.balance < 0 };
    }, [currentCust]);

    const displayList = customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Handlers
    const handleOpenDetail = (id: number) => {
        setCurCid(id);
        setCurrentFilter('all');
        setActiveScreen('detail');
        window.history.pushState({ screen: 'detail' }, '', window.location.pathname + '#detail');
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        if (window.location.hash.includes('detail')) {
            window.history.back();
        } else {
            setActiveScreen('list');
            setCurCid(null);
        }
    };

    // Entry Sheet Handlers
    const openAddEntry = (type: 'credit' | 'debit' | 'advance', prepopulateAmt?: string) => {
        setEditTxnId(null);
        setEntryType(type);
        setAmtInp(prepopulateAmt || '');
        setEntryName('');
        setEntryNote('');
        setEntryDate(new Date().toISOString().split('T')[0]);
        setPendingPhotos([]);
        setIsAddEntryOpen(true);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) showToast('⏳ Photo load ho rahi hai...');
        const targetInput = e.target;

        files.forEach(f => {
            const reader = new FileReader();
            reader.onload = async ev => {
                if (ev.target?.result) {
                    try {
                        const compressedUrl = await compressImage(ev.target.result as string);
                        setPendingPhotos(prev => [...prev, compressedUrl]);

                        if (!autoAiScan) return; // Skip AI if user turned it off

                        setIsScanning(true);
                        showToast('🔍 AI Bill padh raha hai...');

                        // Try Advanced Cloud Vision API first
                        try {
                            const res = await fetch('/api/vision', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ imageBase64: compressedUrl })
                            });

                            if (res.ok) {
                                const responseText = await res.text();
                                try {
                                    const data = JSON.parse(responseText);
                                    if (data.amount) {
                                        const cleanAmt = data.amount.toString().replace(/,/g, '').replace(/[^0-9.]/g, '');
                                        if (cleanAmt && !isNaN(parseFloat(cleanAmt))) {
                                            setAmtInp(cleanAmt);
                                        }
                                    }
                                    if (data.material) setEntryName(data.material);
                                    if (data.date) setEntryDate(data.date);
                                    showToast('🤖 Super AI ne bill scan kar liya!');
                                } catch(e) {
                                    showToast('⚠️ AI ne galat format return kiya.');
                                }
                                setIsScanning(false);
                                return;
                            } else {
                                const errorText = await res.text();
                                let errData = { error: errorText };
                                try { errData = JSON.parse(errorText); } catch(e) {}
                                
                                if (errData.error === 'GEMINI_API_KEY is missing') {
                                    console.log('Gemini skipped - No API Key. Falling back to offline Tesseract.');
                                    showToast('⚠️ Live Server par Gemini API Key nahi hai! Basic Scanner use ho raha hai.');
                                } else {
                                    showToast('⚠️ AI Error: Server Timeout ya Error aaya.');
                                    setIsScanning(false);
                                    return; // STOP HERE so we see the error!
                                }
                            }
                        } catch (apiErr: any) {
                            console.error("Vision API error", apiErr);
                            showToast('⚠️ Vercel Live Error: Connection toot gayi.');
                            setIsScanning(false);
                            return; // STOP HERE so we see the error!
                        }

                        // Fallback to Offline Tesseract AI
                        import('tesseract.js').then(async (tesseract) => {
                            try {
                                const result = await tesseract.default.recognize(compressedUrl, 'eng');
                                const text = result.data.text;

                                // ======== ADVANCED AI PARSER ========
                                let extAmt = 0;
                                let extName = '';
                                let extDate = '';

                                // 1. DATE EXTRACTION (Finds DD-MM-YYYY, DD/MM/YY, etc.)
                                const dateMatch = text.match(/\b([0-3]?\d)[\/\-\.]([01]?\d)[\/\-\.]((?:19|20)?\d{2})\b/);
                                if (dateMatch) {
                                    let [_, d, m, y] = dateMatch;
                                    if (y.length === 2) y = '20' + y;
                                    d = d.padStart(2, '0');
                                    m = m.padStart(2, '0');
                                    if (parseInt(m) <= 12 && parseInt(d) <= 31) {
                                        extDate = `${y}-${m}-${d}`;
                                    }
                                }

                                // 2. AMOUNT EXTRACTION (Aggressive for Handwriting)
                                const rawNumMatches = [...text.matchAll(/(?:Rs|Total|Amt|₹|Amount)?\s*?([\d,]{1,7}(?:\.\d{1,2})?)/gi)];
                                let amounts = rawNumMatches.map(m => parseFloat(m[1].replace(/,/g, ''))).filter(n => !isNaN(n));
                                const validAmounts = amounts.filter(n => n > 1 && n < 500000 && n !== 400000 && n.toString().length !== 10 && n.toString().length !== 6);

                                if (validAmounts.length > 0) {
                                    extAmt = Math.max(...validAmounts);
                                } else {
                                    // Super fallback for bad handwritten OCR (e.g. Total l5OO)
                                    const totMatch = text.toLowerCase().match(/total[^\d\n]*?([\do0s5l1]+)/i);
                                    if (totMatch) {
                                        const fixed = totMatch[1].replace(/o/g, '0').replace(/s/g, '5').replace(/l/g, '1');
                                        const pt = parseFloat(fixed);
                                        if (!isNaN(pt) && pt < 500000) extAmt = pt;
                                    }
                                }

                                // 3. MATERIAL / ITEM EXTRACTION
                                const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
                                const materials = ['cement', 'bajri', 'reti', ' ईंट', 'brick', 'sand', 'pipe', 'booking', 'petrol', 'diesel', 'tent', 'salary', 'kharcha', 'chai', 'tea', 'food', 'snack', 'water', 'cable', 'wire', 'rod', 'sariya', 'iron', 'steel', 'hardware', 'paint', 'labor', 'rent', 'bill'];

                                for (let l of lines) {
                                    if (materials.some(m => l.toLowerCase().includes(m))) {
                                        extName = l.replace(/[^a-zA-Z0-9\s&()\-]/g, '').trim();
                                        break;
                                    }
                                }

                                if (!extName) {
                                    for (let i = 0; i < lines.length; i++) {
                                        if (/particular|description|item|product|qty|rate|m\/s/i.test(lines[i])) {
                                            if (i + 1 < lines.length) {
                                                const nextLine = lines[i + 1].replace(/[^a-zA-Z0-9\s&]/g, '').trim();
                                                if (!/^\d+$/.test(nextLine) && nextLine.length > 2) {
                                                    extName = nextLine;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }

                                if (extName) {
                                    extName = extName.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
                                    if (extName.length > 25) extName = extName.substring(0, 25).trim();
                                } else {
                                    extName = "Manual Expense";
                                }

                                setAmtInp(extAmt > 0 ? extAmt.toString() : '');
                                setEntryName(extName);
                                if (extDate) setEntryDate(extDate);

                                showToast('🤖 AI ne details auto-fill kar di hain!');
                            } catch (e) {
                                console.error(e);
                                showToast('⚠️ AI padh nahi paya, manual daalein.');
                            } finally {
                                setIsScanning(false);
                            }
                        }).catch(err => {
                            console.error('Tesseract load err:', err);
                            setIsScanning(false);
                        });
                    } catch (err) {
                        console.error('Image compression failed', err);
                        showToast('❌ Photo me error');
                    }
                }
            };
            reader.readAsDataURL(f);
        });

        // Timeout to safely reset file value without breaking reader
        setTimeout(() => { if (targetInput) targetInput.value = ''; }, 1000);
    };

    const removePendingPhoto = (idx: number) => {
        setPendingPhotos(prev => prev.filter((_, i) => i !== idx));
    };

    const openEditEntry = (txn: any) => {
        setEditTxnId(txn.id);
        setEntryType(txn.type);
        setAmtInp(txn.amt.toString());
        setEntryName(txn.name || '');
        setEntryNote(txn.note || '');
        setEntryDate(txn.date.split('T')[0]);
        setPendingPhotos([...(txn.photos || [])]);
        setIsAddEntryOpen(true);
    };

    const deleteTxn = (txnId: number, txnAmt: number, txnType: string) => {
        if (!window.confirm('Pukka delete karna hai?')) return;
        setCustomers(customers.map(c => {
            if (c.id === curCid) {
                const isDebit = txnType !== 'credit';
                const balChange = isDebit ? -txnAmt : txnAmt; // reverse the effect
                return {
                    ...c,
                    txns: c.txns.filter((t: any) => t.id !== txnId),
                    balance: c.balance + balChange
                };
            }
            return c;
        }));
        showToast('🗑 Entry delete ho gayi!');
    };

    const saveEntry = () => {
        const amt = parseFloat(amtInp);
        if (!amt) { showToast('⚠️ Amount daalo!'); return; }
        const name = entryName.trim() || (entryType === 'credit' ? 'Credit' : 'Debit');
        const note = entryNote.trim();
        const date = entryDate ? new Date(entryDate).toISOString() : new Date().toISOString();

        setCustomers(customers.map(c => {
            if (c.id === curCid) {
                let newTxns = [...c.txns];
                let newBalance = c.balance;

                if (editTxnId) {
                    const oldTxn = newTxns.find((t: any) => t.id === editTxnId);
                    if (oldTxn) {
                        const oldIsDebit = oldTxn.type !== 'credit';
                        const oldBalChange = oldIsDebit ? oldTxn.amt : -oldTxn.amt;
                        newBalance -= oldBalChange;
                    }
                    newTxns = newTxns.map((t: any) => t.id === editTxnId ? { ...t, type: entryType, name, note, date, amt, photos: [...pendingPhotos] } : t);
                    const isDebit = entryType !== 'credit';
                    const balChange = isDebit ? amt : -amt;
                    newBalance += balChange;
                } else {
                    const newTxn = { id: Date.now(), type: entryType, name, note, date, amt, photos: [...pendingPhotos] };
                    newTxns = [newTxn, ...newTxns];
                    const isDebit = entryType !== 'credit';
                    const balChange = isDebit ? amt : -amt;
                    newBalance += balChange;
                }

                return { ...c, txns: newTxns, balance: newBalance };
            }
            return c;
        }));

        setIsAddEntryOpen(false);
        setEditTxnId(null);
        showToast(editTxnId ? '✅ Entry update ho gayi!' : '✅ Entry save ho gayi!');
    };

    // Customer Sheet Handlers
    const importContact = async () => {
        try {
            if ('contacts' in navigator && 'ContactsManager' in window) {
                const props = ['name', 'tel'];
                const opts = { multiple: false };
                const contacts = await (navigator as any).contacts.select(props, opts);
                if (contacts && contacts.length > 0) {
                    const contact = contacts[0];
                    if (contact.name && contact.name[0]) setAcName(contact.name[0]);
                    if (contact.tel && contact.tel[0]) {
                        const num = contact.tel[0].replace(/[^\d+]/g, '');
                        setAcPhone(num);
                    }
                    showToast('✅ Contact select ho gaya!');
                }
            } else {
                showToast('⚠️ Aapke browser me auto-contact ka option support nahi karta.');
            }
        } catch (e) {
            console.error(e);
            showToast('❌ Contact open karne me error aaya.');
        }
    };

    const saveCustomer = () => {
        const limit = parseFloat(acLimit) || 0;
        const opening = parseFloat(acOpening) || 0;
        if (!acName.trim()) { showToast('⚠️ Naam zaroori hai!'); return; }

        const nc = { id: Date.now(), name: acName.trim(), phone: acPhone.trim() || '', type: acType, limit, balance: opening, txns: [] };
        setCustomers([{ ...nc }, ...customers]);
        setIsAddCustOpen(false);
        setAcName(''); setAcPhone(''); setAcLimit(''); setAcOpening('');
        showToast('✅ Customer add ho gaya!');
    };

    const deleteCustomer = () => {
        if (!currentCust) return;
        if (!window.confirm(`Kya aap sach mein ${currentCust.name} ko delete karna chahte hain? Unka poora hisaab hamesha ke liye delete ho jayega.`)) return;

        setCustomers(customers.filter(c => c.id !== curCid));
        handleBack();
        showToast(`🗑 ${currentCust.name} delete ho gaye!`);
    };

    // Excel Export Handlers
    const downloadAllExcel = () => {
        let csv = "Customer Name,Phone,Type,Total Received (Credit),Total Given (Debit),Net Balance,Status\n";
        customers.forEach(c => {
            let cr = 0, db = 0;
            c.txns.forEach((t: any) => { if (t.type === 'credit') cr += t.amt; else db += t.amt; });
            const isNeg = c.balance < 0;
            const status = isNeg ? 'Dena Hai' : 'Lena Hai';
            csv += `"${c.name}","${c.phone}",${c.type},${cr},${db},${Math.abs(c.balance)},${status}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `All_Hisaab_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        showToast('📊 All Excel Download Started!');
    };

    const downloadCustomerExcel = () => {
        if (!currentCust) return;
        let csv = "Date,Description,Type,Credit (Received),Debit (Given)\n";
        const sortedTxns = [...currentCust.txns].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedTxns.forEach(t => {
            const isCr = t.type === 'credit';
            const crAmt = isCr ? t.amt : 0;
            const dbAmt = !isCr ? t.amt : 0;
            const date = new Date(t.date).toLocaleDateString();
            csv += `${date},"${t.name || t.type}",${t.type},${crAmt},${dbAmt}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentCust.name}_Hisaab_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        showToast('📊 Customer Excel Downloaded!');
    };

    const handleCustPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async ev => {
            const url = ev.target?.result as string;
            if (url) {
                const compressedUrl = await compressImage(url);
                setCustomers(prev => prev.map(c => c.id === curCid ? { ...c, photo: compressedUrl } : c));
                showToast('📸 Profile photo lag gayi!');
            }
        };
        reader.readAsDataURL(file);
    };

    // Txn Photo attach
    const addPhotoToTxn = (txnId: number) => {
        document.getElementById(`file-${txnId}`)?.click();
    };

    const handleTxnPhoto = (e: React.ChangeEvent<HTMLInputElement>, txnId: number) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        showToast('⏳ Photo load ho rahi hai...');
        const targetInput = e.target;

        files.forEach(f => {
            const reader = new FileReader();
            reader.onload = async ev => {
                const url = ev.target?.result as string;
                if (!url) return;
                try {
                    const compressedUrl = await compressImage(url);
                    setCustomers(prev => prev.map(c => {
                        if (c.id !== curCid) return c;
                        return {
                            ...c,
                            txns: c.txns.map((t: any) => t.id === txnId ? { ...t, photos: [...(t.photos || []), compressedUrl] } : t)
                        };
                    }));
                    showToast('📸 Photo add ho gaya!');
                } catch (err) {
                    console.error(err);
                    showToast('❌ Photo process me error');
                }
            };
            reader.readAsDataURL(f);
        });

        setTimeout(() => { if (targetInput) targetInput.value = ''; }, 1000);
    };

    const toggleExpand = (id: number) => {
        setExpandedTxns(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (!isMounted) return null;

    return (
        <div className="hisaab-root">
            {/* ════════ SCREEN 1: LIST ════════ */}
            <div className={`screen ${activeScreen === 'list' ? 'active' : ''}`} id="screen-list">
                <div className="topbar">
                    <div className="tb-brand">
                        <div className="tb-logo">📒</div>
                        <div><div className="tb-name">Hisaab Pro</div></div>
                    </div>
                    <div className="tb-acts">
                        <div className="tb-btn" onClick={downloadAllExcel}>📊</div>
                    </div>
                </div>

                <div style={{ background: 'var(--bg2)', padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text)' }}>📗 Hisaab Pro</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 600 }}>Customer Ledger</div>
                    </div>
                    <div style={{ display: 'flex', gap: '7px' }}>
                        <button className="tb-add" onClick={() => setIsAddCustOpen(true)}>＋ Customer</button>
                    </div>
                </div>

                <div className="kpi-strip">
                    <div className="kpi-item">
                        <div className="kpi-val" style={{ color: 'var(--green)' }}>{fmt(totalStats.received)}</div>
                        <div className="kpi-lbl">Total Lena Hai</div>
                    </div>
                    <div className="kpi-item">
                        <div className="kpi-val" style={{ color: 'var(--red)' }}>{fmt(totalStats.given)}</div>
                        <div className="kpi-lbl">Total Dena Hai</div>
                    </div>
                    <div className="kpi-item">
                        <div className="kpi-val" style={{ color: 'var(--amber)' }}>{fmt(Math.abs(totalStats.net))}</div>
                        <div className="kpi-lbl">Net {totalStats.net >= 0 ? '(Lena Hai)' : '(Dena Hai)'}</div>
                    </div>
                </div>

                <div className="search-row">
                    <div className="search-box">
                        <span style={{ fontSize: '16px', color: 'var(--text3)' }}>🔍</span>
                        <input type="text" placeholder="Customer dhundho..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <button className="sort-btn" onClick={() => showToast('A→Z sort!')}>A→Z</button>
                </div>

                <div className="cust-list">
                    {!displayList.length ? (
                        <div className="empty-state">
                            <div className="empty-ico">🔍</div>
                            <div className="empty-title">Koi customer nahi mila</div>
                            <div className="empty-sub">Search change karo</div>
                        </div>
                    ) : (
                        displayList.map(c => {
                            const isNeg = c.balance < 0;
                            const bal = Math.abs(c.balance);
                            const fmtBal = bal >= 1000 ? '₹' + (bal / 1000).toFixed(1) + 'K' : '₹' + bal;
                            const sortedTxns = [...c.txns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                            const lastTxn = sortedTxns[0];
                            const lastDate = lastTxn ? formatDateShort(lastTxn.date) : '—';
                            return (
                                <div className="cust-item" key={c.id} onClick={() => handleOpenDetail(c.id)}>
                                    <div className="cust-av" style={{ background: c.photo ? 'transparent' : getColor(c.name) }}>
                                        {c.photo ? <img src={c.photo} style={{ width: '100%', height: '100%', borderRadius: '13px', objectFit: 'cover' }} alt="" /> : initials(c.name)}
                                    </div>
                                    <div className="cust-mid">
                                        <div className="cust-name">{c.name}</div>
                                        <div className="cust-meta">
                                            <span className="cust-tag">{c.txns.length} entry</span>
                                            <span className="cust-tag">{c.type}</span>
                                            <span className="cust-date">{lastDate}</span>
                                        </div>
                                    </div>
                                    <div className="cust-right">
                                        <div className="cust-amt" style={{ color: isNeg ? 'var(--red)' : 'var(--green)' }}>{fmtBal}</div>
                                        <div className={`cust-status ${isNeg ? 'status-dena' : 'status-lena'}`}>{isNeg ? 'Dena Hai' : 'Baki Hai'}</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ════════ SCREEN 2: DETAIL ════════ */}
            {currentCust ? (
                <div className={`screen ${activeScreen === 'detail' ? 'active' : ''}`} id="screen-detail">
                    <div className="dtopbar">
                        <div className="back-btn" onClick={handleBack}>‹</div>
                        <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0, background: currentCust.photo ? 'transparent' : getColor(currentCust.name), position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('cust-photo-upload')?.click()}>
                            {currentCust.photo ? <img src={currentCust.photo} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} alt="" /> : initials(currentCust.name)}
                            <div style={{ position: 'absolute', bottom: -5, right: -5, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '2px', fontSize: '10px', color: '#fff' }}>📷</div>
                            <input type="file" id="cust-photo-upload" className="hidden-file" accept="image/*" onChange={handleCustPhoto} />
                        </div>
                        <div className="dtb-info">
                            <div className="dtb-name">{currentCust.name}</div>
                            <div className="dtb-sub">{currentCust.type} · {currentCust.txns.length} entries</div>
                        </div>
                        <div className="dtb-acts">
                            <button className="tb-add" onClick={() => setIsAddCustOpen(true)}>＋ Customer</button>
                        </div>
                    </div>

                    <div className="net-hero">
                        <div className="nh-top" style={{ alignItems: 'flex-start' }}>
                            <div className="nh-info">
                                <div className="nh-phone" style={{ marginTop: 0 }}>📞 {currentCust.phone} &nbsp;·&nbsp; {currentCust.type}</div>
                                <div className="nh-badges">
                                    <span className="nh-badge badge-service">{currentCust.type}</span>
                                    <span className={`nh-badge ${custStats.isNeg ? 'badge-dena' : 'badge-lena'}`}>{custStats.isNeg ? 'DENA HAI' : 'LENA HAI'}</span>
                                </div>
                            </div>
                            <div className="nh-balance">
                                <div className="nh-bal-val" style={{ color: custStats.isNeg ? 'var(--red)' : 'var(--green)' }}>
                                    {custStats.isNeg ? '-' : '+'}{fmt(custStats.net)}
                                </div>
                                <div className="nh-bal-lbl">Net Balance</div>
                            </div>
                        </div>
                    </div>

                    <div className="stats-row">
                        <div className="stat-box"><div className="stat-val" style={{ color: 'var(--green)' }}>{fmt(custStats.credit)}</div><div className="stat-lbl">✅ Credit</div></div>
                        <div className="stat-box"><div className="stat-val">{custStats.entries}</div><div className="stat-lbl">📝 Entries</div></div>
                        <div className="stat-box"><div className="stat-val" style={{ color: 'var(--red)' }}>{fmt(custStats.debit)}</div><div className="stat-lbl">❌ Debit</div></div>
                    </div>

                    <div className="credit-bar-wrap">
                        <div className="cb-header">
                            <div className="cb-label">💳 Credit Used</div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div className="cb-pct">{currentCust.limit > 0 ? Math.min(100, Math.round(custStats.net / currentCust.limit * 100)) : 0}%</div>
                                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>₹{fmt(currentCust.limit)} limit</div>
                            </div>
                        </div>
                        <div className="cb-track">
                            <div className="cb-fill" style={{ width: `${currentCust.limit > 0 ? Math.min(100, Math.round(custStats.net / currentCust.limit * 100)) : 0}%` }}></div>
                        </div>
                    </div>

                    <div className="filter-tabs">
                        {[{ id: 'all', l: '📋 All' }, { id: 'credit', l: '✅ Received' }, { id: 'debit', l: '❌ Given' }, { id: 'advance', l: '⚡ Advance' }].map(f => (
                            <div key={f.id} className={`ftab ${currentFilter === f.id ? 'active' : ''}`} onClick={() => setCurrentFilter(f.id)}>{f.l}</div>
                        ))}
                    </div>

                    <div className="txn-list">
                        {(() => {
                            let txns = currentCust.txns;
                            if (currentFilter !== 'all') txns = txns.filter((t: any) => t.type === currentFilter);
                            if (!txns.length) return <div className="empty-state"><div className="empty-ico">📋</div><div className="empty-title">Koi entry nahi</div><div className="empty-sub">Neeche se credit ya debit add karo</div></div>;

                            const groups: any = {};
                            txns.forEach((t: any) => {
                                const dStr = t.date.split('T')[0] || t.date;
                                if (!groups[dStr]) groups[dStr] = [];
                                groups[dStr].push(t);
                            });

                            return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(date => {
                                const dayTxns = groups[date];
                                const dayTotal = dayTxns.reduce((s: number, t: any) => s + (t.type === 'credit' ? t.amt : -t.amt), 0);
                                return (
                                    <React.Fragment key={date}>
                                        <div className="date-header">
                                            <span>{formatDateLong(date)}</span>
                                            <span className="date-total" style={{ color: dayTotal >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                                {dayTotal >= 0 ? '+' : ''} {fmt(Math.abs(dayTotal))}
                                            </span>
                                        </div>
                                        {dayTxns.map((t: any, i: number) => {
                                            const isCr = t.type === 'credit';
                                            const isAdv = t.type === 'advance';
                                            const ico = isCr ? '✅' : isAdv ? '⚡' : '❌';
                                            const icoClass = isCr ? 'credit' : isAdv ? 'advance' : 'debit';
                                            const badgeClass = isCr ? 'badge-cr' : isAdv ? 'badge-adv' : 'badge-db';
                                            const badgeText = isCr ? 'Credit' : isAdv ? 'Advance' : 'Debit';
                                            const amtColor = isCr ? 'var(--green)' : isAdv ? 'var(--amber)' : 'var(--red)';
                                            const amtSign = isCr ? '+' : '-';
                                            const hasPhotos = t.photos && t.photos.length > 0;
                                            const isExpanded = expandedTxns[t.id] || hasPhotos;

                                            return (
                                                <div className="txn-card" key={t.id} style={{ animationDelay: `${i * 0.04}s` }}>
                                                    <div className="txn-main">
                                                        <div className={`txn-ico ${icoClass}`}>{ico}</div>
                                                        <div className="txn-body">
                                                            <div className="txn-name">{t.name || 'Entry'}</div>
                                                            <div className="txn-type-row">
                                                                <span className={`txn-badge ${badgeClass}`}>{badgeText}</span>
                                                                {t.note && <span className="txn-note">{t.note}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="txn-right">
                                                            <div className="txn-amt" style={{ color: amtColor }}>{amtSign}{fmt(t.amt)}</div>
                                                            <div className="txn-time">{formatTime(t.date)}</div>
                                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', justifyContent: 'flex-end' }}>
                                                                <button onClick={(e) => { e.stopPropagation(); openEditEntry(t); }} style={{ background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer' }}>✏️</button>
                                                                <button onClick={(e) => { e.stopPropagation(); deleteTxn(t.id, t.amt, t.type); }} style={{ background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer' }}>🗑</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="txn-expand" onClick={() => toggleExpand(t.id)}>
                                                        <div className="txn-expand-label">📸 Bill photo {hasPhotos ? `(${t.photos.length})` : 'add karo'}</div>
                                                        <div className={`txn-expand-arr ${isExpanded ? 'open' : ''}`}>▾</div>
                                                    </div>
                                                    {(isExpanded || hasPhotos) && (
                                                        <div className="bill-photo-area show-upload">
                                                            <div className="bp-label">📸 Bill / Receipt</div>
                                                            <div className="bp-grid">
                                                                {hasPhotos && t.photos.map((p: string, pIdx: number) => (
                                                                    <img key={pIdx} className="bp-thumb" src={p} onClick={() => setLightboxImg(p)} alt="Bill" />
                                                                ))}
                                                                <label htmlFor={`file-cam-${t.id}`} className="bp-add" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0 }}>
                                                                    <div className="bp-add-ico" style={{ fontSize: '20px' }}>📸</div>
                                                                    <div className="bp-add-lbl">Camera</div>
                                                                    <input type="file" style={{ display: 'none' }} id={`file-cam-${t.id}`} accept="image/*" capture="environment" onChange={(e) => handleTxnPhoto(e, t.id)} />
                                                                </label>
                                                                <label htmlFor={`file-gal-${t.id}`} className="bp-add" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0 }}>
                                                                    <div className="bp-add-ico" style={{ fontSize: '20px' }}>🖼️</div>
                                                                    <div className="bp-add-lbl">Gallery</div>
                                                                    <input type="file" style={{ display: 'none' }} id={`file-gal-${t.id}`} accept="image/*" multiple onChange={(e) => handleTxnPhoto(e, t.id)} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            });
                        })()}

                        <div style={{ padding: '16px 14px 40px' }}>
                            <div className="nh-action-btns" style={{ marginTop: 0 }}>
                                <button className="nab nab-wa" style={{ gridColumn: 'auto', padding: '14px', fontSize: '14.5px' }} onClick={async () => {
                                    showToast('⏳ WhatsApp message ban raha hai...');
                                    try {
                                        // Live Link using Database ID!
                                        const shareUrl = `${window.location.origin}/hisaab/v?id=${currentCust.id}`;

                                        let textMsg = `*Namaste ${currentCust.name}*,\n\nAapka Hisaab-Kitab ready hai. Yahaan click karke apna poora hisaab dekhein: 👇\n\n${shareUrl}`;

                                        const formData = new FormData();
                                        formData.append('phone', currentCust.phone);
                                        formData.append('message', textMsg);

                                        showToast('⏳ WhatsApp pe send ho raha hai...');
                                        const sendRes = await fetch('/api/whatsapp/send-media', {
                                            method: 'POST',
                                            body: formData
                                        });

                                        if (sendRes.ok) {
                                            showToast('✅ WhatsApp pe Link chala gaya!');
                                        } else {
                                            window.open(`https://wa.me/91${currentCust.phone.replace(/\D/g, '')}?text=${encodeURIComponent(textMsg)}`, '_blank');
                                        }
                                    } catch (err) {
                                        showToast('❌ Error in sending request!');
                                    }
                                }}>📲 WhatsApp</button>
                                <button className="nab" style={{ gridColumn: 'auto', background: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', padding: '14px', fontSize: '14.5px', fontWeight: 700 }} onClick={() => {
                                    showToast('⏳ PDF ban raha hai...');
                                    generateHisaabPDF(currentCust, { name: 'Hisaab Pro - Ledger' }, custStats);
                                }}>📄 PDF</button>
                                <button className="nab" style={{ gridColumn: 'auto', background: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb', padding: '14px', fontSize: '14.5px', fontWeight: 700 }} onClick={downloadCustomerExcel}>📊 Excel</button>
                                <button className="nab" style={{ gridColumn: 'auto', background: '#ffeeee', color: '#e53935', border: '1px solid #ffcdcd', padding: '14px', fontSize: '14.5px', fontWeight: 700 }} onClick={deleteCustomer}>🗑 Delete</button>
                            </div>
                        </div>
                    </div>

                    <div className="bottom-bar">
                        <div className="bbar-top">
                            <div className="bbar-stat">
                                <div className="bbar-stat-val" style={{ color: 'var(--green)' }}>{fmt(custStats.credit)}</div>
                                <div className="bbar-stat-lbl">✅ Credit</div>
                            </div>
                            <div className="bbar-divider"></div>
                            <div className="bbar-stat">
                                <div className="bbar-stat-val" style={{ color: 'var(--red)' }}>{fmt(custStats.debit)}</div>
                                <div className="bbar-stat-lbl">❌ Debit</div>
                            </div>
                            <div className="bbar-divider"></div>
                            <div className="bbar-stat">
                                <div className="bbar-stat-val" style={{ color: custStats.isNeg ? 'var(--red)' : 'var(--green)' }}>{fmt(custStats.net)}</div>
                                <div className="bbar-stat-lbl">{custStats.isNeg ? 'Dena Hai' : 'Lena Hai'}</div>
                            </div>
                        </div>
                        <div className="quick-row">
                            {[100, 200, 500, 1000, 2000, 5000, 10000].map(v => (
                                <div key={v} className="quick-amt" onClick={() => openAddEntry('credit', v.toString())}>
                                    ₹{v >= 1000 ? (v / 1000) + 'K' : v}
                                </div>
                            ))}
                        </div>
                        <div className="bbar-btns">
                            <button className="bbar-btn bbar-credit" onClick={() => openAddEntry('credit')}>✅ Received</button>
                            <button className="bbar-btn bbar-debit" onClick={() => openAddEntry('debit')}>❌ Given</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`screen pc-empty-state-container ${activeScreen === 'detail' ? 'active' : ''}`} id="screen-detail">
                    <div className="empty-state" style={{ height: '100%', justifyContent: 'center' }}>
                        <div className="empty-ico" style={{ fontSize: '64px', marginBottom: '20px' }}>👈</div>
                        <div className="empty-title" style={{ fontSize: '20px' }}>Customer Select Karein</div>
                        <div className="empty-sub" style={{ fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>Left side list me se kisi customer par click karke unka poora hisaab dekhein.</div>
                    </div>
                </div>
            )}

            {/* ════════ SHEETS & MODALS ════════ */}

            {/* Add Entry Sheet */}
            <div className={`sheet-overlay ${isAddEntryOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setIsAddEntryOpen(false); }}>
                <div className="sheet">
                    <div className="sheet-handle"></div>
                    <div className="sheet-hdr">
                        <div className="sheet-title">{editTxnId ? '✏️ Entry Edit Karo' : '💰 Entry Add Karo'}</div>
                        <div className="sheet-close" onClick={() => setIsAddEntryOpen(false)}>✕</div>
                    </div>
                    <div className="sheet-body">
                        <div className="type-pills">
                            <div className={`type-pill cr ${entryType === 'credit' ? 'active' : ''}`} onClick={() => setEntryType('credit')}>✅ Credit</div>
                            <div className={`type-pill db ${entryType === 'debit' ? 'active' : ''}`} onClick={() => setEntryType('debit')}>❌ Debit</div>
                            <div className={`type-pill adv ${entryType === 'advance' ? 'active' : ''}`} onClick={() => setEntryType('advance')}>⚡ Advance</div>
                        </div>
                        <div className="amt-display">
                            <span className="amt-prefix">₹</span>
                            <input className="amt-inp" type="number" placeholder="0" min="0" value={amtInp} onChange={e => setAmtInp(e.target.value)} />
                        </div>
                        <div className="f2">
                            <div className="fg" style={{ margin: 0 }}>
                                <label className="fl">Entry naam</label>
                                <input className="fi" type="text" placeholder="e.g. Band booking" value={entryName} onChange={e => setEntryName(e.target.value)} />
                            </div>
                            <div className="fg" style={{ margin: 0 }}>
                                <label className="fl">Date</label>
                                <input className="fi" type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="fg">
                            <label className="fl">Notes (optional)</label>
                            <input className="fi" placeholder="Koi note likho..." value={entryNote} onChange={e => setEntryNote(e.target.value)} />
                        </div>
                        <div className="fg">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label className="fl" style={{ margin: 0 }}>📸 Bill / Receipt photo</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: autoAiScan ? 'var(--blue)' : '#777', cursor: 'pointer', background: autoAiScan ? '#e3f2fd' : '#f0f0f0', padding: '5px 10px', borderRadius: '20px', border: autoAiScan ? '1px solid #bbdefb' : '1px solid #ddd', transition: 'all 0.2s' }}>
                                    <input type="checkbox" checked={autoAiScan} onChange={(e) => setAutoAiScan(e.target.checked)} style={{ width: '15px', height: '15px', accentColor: 'var(--blue)', cursor: 'pointer' }} />
                                    {autoAiScan ? '🤖 AI Auto Scan : ON' : '🤖 AI Scan : OFF'}
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                <label htmlFor="billFileCam" className="bill-upload-zone" style={{ flex: 1, padding: '15px 5px', minHeight: 'auto', margin: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div className="buz-ico" style={{ fontSize: '24px', marginBottom: '4px' }}>📸</div>
                                    <div className="buz-text" style={{ fontSize: '13px' }}>Camera se kheencho</div>
                                    <input type="file" id="billFileCam" style={{ display: 'none' }} accept="image/*" capture="environment" onChange={handlePhotoUpload} />
                                </label>
                                <label htmlFor="billFileGal" className="bill-upload-zone" style={{ flex: 1, padding: '15px 5px', minHeight: 'auto', margin: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div className="buz-ico" style={{ fontSize: '24px', marginBottom: '4px' }}>🖼️</div>
                                    <div className="buz-text" style={{ fontSize: '13px' }}>Gallery se chuno</div>
                                    <input type="file" id="billFileGal" style={{ display: 'none' }} accept="image/*" multiple onChange={handlePhotoUpload} />
                                </label>
                            </div>

                            {(pendingPhotos.length > 0 || isScanning) && (
                                <div className="bill-previews-grid">
                                    {pendingPhotos.map((p, idx) => (
                                        <div className="bp-preview-wrap" key={idx}>
                                            <img className="bp-preview" src={p} alt="Preview" />
                                            <div className="bp-remove" onClick={() => removePendingPhoto(idx)}>✕</div>
                                        </div>
                                    ))}
                                    {isScanning && <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#666', padding: '10px' }}>🔍 AI Scan chal raha hai...</div>}
                                </div>
                            )}
                        </div>
                        <button className={`save-btn ${entryType === 'credit' ? 'cr' : entryType === 'debit' ? 'db' : 'adv'}`} onClick={saveEntry}>
                            {entryType === 'credit' ? '💾 Credit Save Karo' : entryType === 'debit' ? '💾 Debit Save Karo' : '⚡ Advance Save Karo'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Customer Sheet */}
            <div className={`sheet-overlay ${isAddCustOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setIsAddCustOpen(false); }}>
                <div className="sheet">
                    <div className="sheet-handle"></div>
                    <div className="sheet-hdr">
                        <div className="sheet-title">👤 New Customer</div>
                        <div className="sheet-close" onClick={() => setIsAddCustOpen(false)}>✕</div>
                    </div>
                    <div className="add-cust-body">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                            <button onClick={importContact} style={{ background: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}>
                                <span>📱</span> Phonebook se uthao
                            </button>
                        </div>
                        <div className="fg"><label className="fl">Naam *</label><input className="fi" placeholder="Customer ka naam" value={acName} onChange={e => setAcName(e.target.value)} /></div>
                        <div className="fg"><label className="fl">Phone</label><input className="fi" type="tel" placeholder="98765 44444 (optional)" value={acPhone} onChange={e => setAcPhone(e.target.value)} /></div>
                        <div className="f2">
                            <div className="fg" style={{ margin: 0 }}>
                                <label className="fl">Type</label>
                                <select className="fi" value={acType} onChange={e => setAcType(e.target.value)}>
                                    {['Service', 'Wholesale', 'Supplier', 'Worker', 'Retail'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="fg" style={{ margin: 0 }}>
                                <label className="fl">Credit Limit (₹)</label>
                                <input className="fi" type="number" placeholder="20000" value={acLimit} onChange={e => setAcLimit(e.target.value)} />
                            </div>
                        </div>
                        <div className="fg"><label className="fl">Opening Balance (₹)</label><input className="fi" type="number" placeholder="0" value={acOpening} onChange={e => setAcOpening(e.target.value)} /></div>
                        <button className="save-btn cr" onClick={saveCustomer}>✅ Customer Save Karo</button>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            <div className={`lightbox ${lightboxImg ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setLightboxImg(null); }}>
                {lightboxImg && <img src={lightboxImg} alt="Enlarged Bill" />}
                <div className="lightbox-close" onClick={() => setLightboxImg(null)}>✕</div>
            </div>

            {/* Toast */}
            <div id="toast" className={toastMsg ? 'show' : ''}>{toastMsg}</div>
        </div>
    );
}
