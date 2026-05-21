'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import './hisaab.css';
import { generateHisaabPDF } from '../../../lib/pdf-generator';
import RoleGuard from '@/app/components/RoleGuard';
import { useSession } from 'next-auth/react';

// ─── HELPERS ───
async function compressImage(dataUrl: string, maxWidth = 800, quality = 0.6): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            try {
                let width = img.width;
                let height = img.height;

                // Extra safety for extremely large photos
                if (width > 4000 || height > 4000) {
                    maxWidth = 1000;
                }

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Compress to JPEG
                    resolve(canvas.toDataURL('image/jpeg', quality));
                } else {
                    resolve(dataUrl);
                }
            } catch (err) {
                console.error("Canvas compression error:", err);
                resolve(dataUrl); // Return original if compression fails
            }
        };
        img.onerror = () => {
            console.error("Image load error");
            resolve(dataUrl);
        };
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
    return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n));
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
    const [entryDate, setEntryDate] = useState('');
    const [entryDueDate, setEntryDueDate] = useState('');
    const [showInterestModal, setShowInterestModal] = useState(false);
    const [entryName, setEntryName] = useState('');
    const [entryNote, setEntryNote] = useState('');
    const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);
    const [editTxnId, setEditTxnId] = useState<number | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [autoAiScan, setAutoAiScan] = useState(true);

    // Expand toggle state per transaction ID
    const [expandedTxns, setExpandedTxns] = useState<Record<number, boolean>>({});
    const [hideZeroBalance, setHideZeroBalance] = useState(false);
    const [entryCategory, setEntryCategory] = useState('General');

    // Add Cust Form state
    const [acName, setAcName] = useState('');
    const [acPhone, setAcPhone] = useState('');
    const [acType, setAcType] = useState('Service');
    const [acLimit, setAcLimit] = useState('');
    const [acOpening, setAcOpening] = useState('');

    const toastTimeout = useRef<any>(null);

    useEffect(() => {
        if (!isAddCustOpen) return;
        const id = window.requestAnimationFrame(() => {
            document.body.style.display = 'inline-block';
            window.requestAnimationFrame(() => {
                document.body.style.display = '';
            });
        });
        return () => window.cancelAnimationFrame(id);
    }, [isAddCustOpen]);

    useEffect(() => {
        if (status === 'loading') return;

        const loadData = async () => {
            setCustomers([]); // Reset immediately to prevent ghosting from previous session
            try {
                const { idb } = await import('../../../lib/idb');

                // Define keys based on session
                const userKeys = [];
                if (session?.user?.id) {
                    userKeys.push(`hisaab_pro_data_${session.user.id}`);
                    if (session.user.email) userKeys.push(`hisaab_pro_data_${session.user.email}`);
                }

                const legacyKey = 'hisaab_pro_data';
                const mergedCustomers = new Map<number, any>();

                const mergeIntoMap = (dataArray: any[]) => {
                    if (!Array.isArray(dataArray)) return;
                    dataArray.forEach(cust => {
                        if (!cust.id) return;
                        const existing = mergedCustomers.get(cust.id);
                        if (!existing) {
                            mergedCustomers.set(cust.id, cust);
                        } else {
                            const existingTxnIds = new Set(existing.txns.map((t: any) => t.id));
                            const newTxns = (cust.txns || []).filter((t: any) => !existingTxnIds.has(t.id));
                            const mergedTxns = [...existing.txns, ...newTxns].sort((a: any, b: any) =>
                                new Date(b.date).getTime() - new Date(a.date).getTime()
                            );
                            mergedCustomers.set(cust.id, { ...existing, ...cust, txns: mergedTxns });
                        }
                    });
                };

                // 1. Try User Specific Keys First
                if (session?.user?.id) {
                    for (const k of userKeys) {
                        try {
                            const idbData = await idb.get(k);
                            if (idbData) mergeIntoMap(idbData);
                            const lsData = localStorage.getItem(k);
                            if (lsData) mergeIntoMap(JSON.parse(lsData));
                        } catch (e) { }
                    }
                } else {
                    // 2. ONLY for Guests (Not Logged In), check legacy key
                    try {
                        const idbData = await idb.get(legacyKey);
                        if (idbData) mergeIntoMap(idbData);
                        const lsData = localStorage.getItem(legacyKey);
                        if (lsData) mergeIntoMap(JSON.parse(lsData));
                    } catch (e) { }
                }

                const finalData = Array.from(mergedCustomers.values());
                if (finalData.length > 0) {
                    const balancedData = finalData.map(c => {
                        let debitSum = 0, creditSum = 0;
                        (c.txns || []).forEach((t: any) => {
                            if (t.type === 'credit') creditSum += t.amt;
                            else debitSum += t.amt;
                        });
                        return { ...c, balance: debitSum - creditSum };
                    });
                    setCustomers(balancedData);
                } else {
                    // Only show default data if no records found at all
                    setCustomers(session?.user?.id ? [] : DEFAULT_DATA);
                }

                setIsMounted(true);
                setTimeout(() => setCanSave(true), 1000);
            } catch (e) {
                console.error("Storage init error", e);
                setIsMounted(true);
            }
        };

        loadData();
    }, [status, session?.user?.id, session?.user?.email]);

    // --- SAVING LOGIC ---
    useEffect(() => {
        // Critical: Only save if we have explicitly finished loading and have valid state
        if (!isMounted || !canSave || !customers) return;

        const saveData = async () => {
            let storageKey = null;

            if (session?.user?.id) {
                // Strictly use user-specific key if logged in
                storageKey = `hisaab_pro_data_${session.user.id}`;
            } else if (!session) {
                // ONLY use legacy key if explicitly NOT logged in (Guest Mode)
                storageKey = 'hisaab_pro_data';
            }

            if (!storageKey) return;

            try {
                const { idb } = await import('../../../lib/idb');
                await idb.set(storageKey, customers);

                // Cleanup: If we just saved to a user-specific key, 
                // we should NOT have that same data in the legacy global key anymore
                // to prevent it leaking when we logout.
                if (session?.user?.id) {
                    try { localStorage.removeItem('hisaab_pro_data'); } catch (e) { }
                }
            } catch (err) {
                console.error("IDB Storage error:", err);
            }

            // Sync with Server if applicable
            if (curCid && session?.user?.id) {
                const c = customers.find((x: any) => x.id === curCid);
                if (c) {
                    fetch('/api/hisaab/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(c)
                    }).catch(e => console.error("Sync failed", e));
                }
            }
        };

        // Debounce saving slightly to avoid excessive writes
        const timer = setTimeout(saveData, 500);
        return () => clearTimeout(timer);
    }, [customers, canSave, isMounted, session?.user?.id]);

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

    const criticalDues = useMemo(() => {
        return customers
            .filter((c: any) => c.balance < 0)
            .map((c: any) => {
                const lastTxn = c.txns[0]; // txns are sorted newest first
                const days = lastTxn ? Math.floor((new Date().getTime() - new Date(lastTxn.date).getTime()) / (1000 * 3600 * 24)) : 0;
                return { ...c, dueDays: days };
            })
            .filter((c: any) => c.dueDays > 7 || Math.abs(c.balance) > 5000)
            .sort((a: any, b: any) => b.dueDays - a.dueDays);
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
        // Small timeout ensures the new screen is rendered before we scroll
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            // Force a layout recalculation for some mobile browsers
            document.body.style.display = 'inline-block';
            setTimeout(() => { document.body.style.display = ''; }, 0);
        }, 50);
    };


    const numPress = (val: string) => {
        if (val === '.' && amtInp.includes('.')) return;
        if (amtInp === '0' && val !== '.') setAmtInp(val);
        else setAmtInp(amtInp + val);
    };
    const numBackspace = () => {
        if (amtInp.length <= 1) setAmtInp('0');
        else setAmtInp(amtInp.slice(0, -1));
    };
    const openNumpad = (type: string) => {
        setEntryType(type as any);
        setAmtInp('0');
        setEntryNote('');
        setEntryDate(new Date().toISOString().split('T')[0]);
        setPendingPhotos([]);
        setIsAddEntryOpen(true);
    };
    const closeNumpad = () => {
        setIsAddEntryOpen(false);
    };

    const [txnSortAsc, setTxnSortAsc] = useState(false);

    const sendWhatsAppRemind = (cust: any, amount: number) => {
        const phone = cust.phone?.replace(/\\D/g, '') || '';
        if (!phone) {
            showToast('📱 Pahle customer ka mobile number add karein, uske baad WhatsApp par share hoga.');
            return;
        }
        const txt = `Namaste ${cust.name}, \nAapka ${Math.abs(amount)} Rs due hai. Kripya payment karein.`;
        window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(txt)}`, '_blank');
    };

    const sendWhatsAppStatement = async (cust: any, amount: number) => {
        const phone = cust.phone?.replace(/\D/g, '') || '';
        if (!phone) {
            showToast('📱 Pahle customer ka mobile number add karein, uske baad WhatsApp par share hoga.');
            return;
        }
        
        showToast('⏳ PDF Statement ban raha hai...');
        try {
            if (session?.user?.id) {
                try {
                    await fetch('/api/hisaab/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cust) });
                } catch (e) {}
            }

            let c = 0, d = 0;
            (cust.txns || []).forEach((t: any) => {
                if (t.type === 'credit') c += t.amt;
                else d += t.amt;
            });
            const stats = { credit: c, debit: d, net: Math.abs(cust.balance), entries: cust.txns?.length || 0, isNeg: cust.balance < 0 };
            
            const doc = await generateHisaabPDF(cust, { name: 'BillGST Pro' }, stats, false);
            if (!doc) {
                showToast('❌ PDF nahi ban paya!');
                return;
            }

            const pdfBlob = doc.output('blob');
            const file = new File([pdfBlob], `Statement_${cust.name}.pdf`, { type: 'application/pdf' });
            
            const shareId = session?.user?.id ? `${session.user.id}_${cust.id}` : cust.id;
            const shareUrl = `${window.location.origin}/hisaab/v?id=${shareId}`;
            const textMsg = `*Namaste ${cust.name}*,\n\nAapka Hisaab-Kitab PDF ke roop me bheja gaya hai.\nOnline dekhne ke liye click karein: 👇\n${shareUrl}`;

            // Native Web Share API
            if (navigator.canShare && navigator.canShare({ files: [file] }) && /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                try {
                    await navigator.share({
                        files: [file],
                        title: `Statement_${cust.name}.pdf`,
                        text: textMsg
                    });
                    showToast('✅ WhatsApp pe share ho gaya!');
                    return;
                } catch (e) {
                    console.log('Share cancelled', e);
                }
            }

            const formData = new FormData();
            formData.append('phone', phone);
            formData.append('message', textMsg);
            formData.append('file', file);

            showToast('⏳ WhatsApp Bot se bhej rahe hain...');
            const sendRes = await fetch('/api/whatsapp/send-media', {
                method: 'POST',
                body: formData
            });

            if (sendRes.ok) {
                showToast('✅ WhatsApp pe PDF chala gaya!');
            } else {
                window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(textMsg)}`, '_blank');
            }
        } catch (err) {
            showToast('❌ Error in sending request!');
        }
    };

    const exportPDF = () => {
        showToast('⏳ PDF ban raha hai...');
        generateHisaabPDF(currentCust, { name: 'BillGST Pro - Ledger' }, custStats);
    };

    const openEditCust = (cust: any) => {
        // Basic edit customer setup (if needed)
        setAcName(cust.name);
        setAcPhone(cust.phone);
        setAcType(cust.type);
        setAcLimit(cust.limit);
        setAcOpening(cust.balance);
        setIsAddCustOpen(true);
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

                        // AI Scan feature temporarily removed as per user request.
                        // We just save the photo now.
                        showToast('📸 Photo add ho gayi!');
                    } catch (err) {
                        console.error('Image compression failed', err);
                        showToast('❌ Photo size bohot bada hai ya error aaya!');
                    }
                }
            };
            reader.onerror = () => {
                console.error("FileReader error on upload");
                showToast('❌ Photo read karne mein problem aayi!');
            };
            try {
                reader.readAsDataURL(f);
            } catch (err) {
                showToast('❌ Photo select karne me error');
            }
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
        setEntryDueDate(txn.dueDate || '');
        setEntryCategory(txn.category || 'General');
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
        const name = entryName.trim() || (entryType === 'credit' ? 'Received' : 'Given');
        const note = entryNote.trim();
        const date = entryDate ? new Date(entryDate).toISOString() : new Date().toISOString();

        // 1. Calculate new balance for validation
        const currentCustomer = customers.find(c => c.id === curCid);
        if (currentCustomer) {
            let projectedBalance = currentCustomer.balance;
            if (editTxnId) {
                const oldTxn = currentCustomer.txns.find((t: any) => t.id === editTxnId);
                if (oldTxn) {
                    const oldIsDebit = oldTxn.type !== 'credit';
                    projectedBalance -= (oldIsDebit ? oldTxn.amt : -oldTxn.amt);
                }
            }
            const isDebit = entryType !== 'credit';
            projectedBalance += (isDebit ? amt : -amt);

            if (currentCustomer.limit > 0 && projectedBalance > currentCustomer.limit) {
                if (!window.confirm(`⚠️ ALERT: ${currentCustomer.name} ki credit limit (₹${currentCustomer.limit}) cross ho rahi hai!\n\nNaya Balance ₹${projectedBalance} ho jayega.\n\nKya aap phir bhi ye entry save karna chahte hain?`)) {
                    return;
                }
            }
        }

        setCustomers(customers.map(c => {
            if (c.id === curCid) {
                let newTxns = [...c.txns];
                let newBalance = c.balance;

                if (editTxnId) {
                    const oldTxn = newTxns.find((t: any) => t.id === editTxnId);
                    if (oldTxn) {
                        const oldIsDebit = oldTxn.type !== 'credit';
                        newBalance -= (oldIsDebit ? oldTxn.amt : -oldTxn.amt);
                    }
                    newTxns = newTxns.map((t: any) => t.id === editTxnId ? { ...t, type: entryType, name, note, date, dueDate: entryDueDate, amt, category: entryCategory, photos: [...pendingPhotos] } : t);
                    const isDebit = entryType !== 'credit';
                    newBalance += (isDebit ? amt : -amt);
                } else {
                    const newTxn = { id: Date.now(), type: entryType, name, note, date, dueDate: entryDueDate, amt, category: entryCategory, photos: [...pendingPhotos] };
                    newTxns = [newTxn, ...newTxns];
                    const isDebit = entryType !== 'credit';
                    newBalance += (isDebit ? amt : -amt);
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
        document.getElementById(`file-cam-${txnId}`)?.click();
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
            reader.onerror = () => {
                showToast('❌ Photo read karne mein error');
            };
            try {
                reader.readAsDataURL(f);
            } catch (err) {
                showToast('❌ Photo select karne me error');
            }
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
                        <div className="tb-name">Expenses billgst</div>
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

                {criticalDues.length > 0 && (
                    <div className="alerts-container">
                        <div className="alerts-header">
                            <span>🚨 {criticalDues.length} Pending Payments</span>
                        </div>
                        <div className="alerts-scroll">
                            {criticalDues.slice(0, 3).map((c: any) => (
                                <div key={c.id} className="alert-card-mini">
                                    <div className="acm-info">
                                        <div className="acm-name">{c.name}</div>
                                        <div className="acm-amt">₹{fmt(Math.abs(c.balance))} • {c.dueDays} days old</div>
                                    </div>
                                    <button className="acm-btn" onClick={() => sendWhatsAppRemind(c, c.balance)}>
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.116 1.523 5.845L.057 23.057l5.33-1.397A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
                                        Remind
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="search-row">
                    <div className="search-box">
                        <span style={{ fontSize: '16px', color: 'var(--text3)' }}>🔍</span>
                        <input type="text" placeholder="Customer dhundho..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <button className={`sort-btn ${hideZeroBalance ? 'active' : ''}`} onClick={() => setHideZeroBalance(!hideZeroBalance)} style={{ background: hideZeroBalance ? 'var(--ink)' : 'transparent', color: hideZeroBalance ? '#fff' : 'inherit' }}>
                        {hideZeroBalance ? 'Show All' : 'Hide 0'}
                    </button>
                </div>

                <div className="cust-list">
                    {!displayList.length ? (
                        <div className="empty-state">
                            <div className="empty-ico">🔍</div>
                            <div className="empty-title">Koi customer nahi mila</div>
                            <div className="empty-sub">Search change karo</div>
                        </div>
                    ) : (
                        displayList
                            .filter(c => hideZeroBalance ? Math.abs(c.balance) > 0 : true)
                            .map(c => {
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
                    <div className="topbar">
                        <button className="back-btn" onClick={handleBack}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                        </button>
                        <div className="topbar-center">
                            <div className="topbar-name">{currentCust.name}</div>
                            <div className={`topbar-due ${custStats.isNeg ? '' : 'positive'}`}>
                                ₹{new Intl.NumberFormat('en-IN').format(Math.abs(custStats.net))} {custStats.isNeg ? 'Due' : 'Advance'}
                            </div>
                        </div>
                        <div className="topbar-actions">
                            <button className="icon-btn" onClick={() => openEditCust(currentCust)} title="Edit Customer">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button className="icon-btn" onClick={deleteCustomer} title="Delete Customer">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="detail-content-inner">
                        <div className="balance-banner">
                            <div className="balance-label">Total Balance Due</div>
                            <div className={`balance-amount ${custStats.isNeg ? '' : 'positive'}`}>
                                ₹{new Intl.NumberFormat('en-IN').format(Math.abs(custStats.net))}
                            </div>
                            <div className={`balance-status ${custStats.isNeg ? '' : 'positive'}`}>
                                <span className="balance-status-dot"></span>
                                {custStats.isNeg ? 'You Will Give' : 'You Will Get'}
                            </div>
                            <div className="balance-stats">
                                <div className="bal-stat">
                                    <div className="bal-stat-label">Total Given</div>
                                    <div className="bal-stat-val red">₹{new Intl.NumberFormat('en-IN').format(Math.abs(custStats.debit))}</div>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="bal-stat">
                                    <div className="bal-stat-label">Total Received</div>
                                    <div className="bal-stat-val green">₹{new Intl.NumberFormat('en-IN').format(Math.abs(custStats.credit))}</div>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <button className="qa-btn remind" onClick={() => sendWhatsAppRemind(currentCust, custStats.net)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
                                Remind
                            </button>
                            <button className="qa-btn statement" onClick={exportPDF}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                                Statement
                            </button>
                            <button className="qa-btn whatsapp" onClick={() => sendWhatsAppStatement(currentCust, custStats.net)}>
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.116 1.523 5.845L.057 23.057l5.33-1.397A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
                                WhatsApp
                            </button>
                            <button className="qa-btn call" onClick={() => window.open(`tel:${currentCust.phone}`, '_self')}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v3z" /></svg>
                                Call
                            </button>
                        </div>

                        {custStats.net < 0 && (
                            <div className="pending-status-box">
                                <div className="psb-icon">⏳</div>
                                <div className="psb-text">
                                    <strong>₹{fmt(Math.abs(custStats.net))}</strong> abhi paka hai.
                                    <span>Last payment {formatDateShort(currentCust.txns[0]?.date || '')} ko hui thi.</span>
                                </div>
                            </div>
                        )}

                        {currentCust.limit > 0 && custStats.net > currentCust.limit && (
                            <div className="pending-status-box" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', marginTop: '12px' }}>
                                <div className="psb-icon">⚠️</div>
                                <div className="psb-text">
                                    <strong style={{ color: '#dc2626' }}>Credit Limit Exceeded!</strong>
                                    <span style={{ color: '#b91c1c' }}>Aapne limit ₹{fmt(currentCust.limit)} set ki thi, par udhaar ₹{fmt(custStats.net)} ho gaya hai.</span>
                                </div>
                            </div>
                        )}

                        <div className="filter-bar">
                            {[{ id: 'all', l: 'All' }, { id: 'debit', l: 'Given' }, { id: 'credit', l: 'Received' }, { id: 'advance', l: 'Advance' }].map(f => (
                                <button key={f.id} className={`filter-chip ${currentFilter === f.id ? 'active' : ''}`} onClick={() => setCurrentFilter(f.id)}>{f.l}</button>
                            ))}
                            <button className="sort-btn filter-right" onClick={() => setTxnSortAsc(!txnSortAsc)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M9 18h6" /></svg>
                                Sort
                            </button>
                        </div>

                        <div className="txn-list">
                            {(() => {
                                let runningBalTracker = currentCust.balance;
                                const txnsWithBal = currentCust.txns.map((t: any) => {
                                    const runningBal = runningBalTracker;
                                    const isDebit = t.type !== 'credit';
                                    runningBalTracker -= (isDebit ? t.amt : -t.amt);
                                    return { ...t, runningBal };
                                });

                                let txnsToRender = txnsWithBal;
                                if (currentFilter !== 'all') txnsToRender = txnsToRender.filter((t: any) => t.type === currentFilter);

                                if (!txnsToRender.length) return <div className="empty-state"><div className="empty-ico">📋</div><div className="empty-title">Koi entry nahi</div><div className="empty-sub">Neeche se credit ya debit add karo</div></div>;

                                const groups: any = {};
                                txnsToRender.forEach((t: any) => {
                                    const dStr = t.date.split('T')[0] || t.date;
                                    if (!groups[dStr]) groups[dStr] = [];
                                    groups[dStr].push(t);
                                });

                                return Object.keys(groups).sort((a, b) => txnSortAsc ? a.localeCompare(b) : b.localeCompare(a)).map(date => {
                                    const dayTxns = groups[date];
                                    const dayTotal = dayTxns.reduce((s: number, t: any) => s + (t.type === 'credit' ? t.amt : -t.amt), 0);
                                    return (
                                        <React.Fragment key={date}>
                                            <div className="date-group-label">
                                                <span>{formatDateShort(date)}</span>
                                            </div>
                                            {dayTxns.map((t: any, i: number) => {
                                                const isCr = t.type === 'credit';
                                                const isAdv = t.type === 'advance';
                                                const typeClass = isCr ? 'received' : isAdv ? 'advance' : 'given';
                                                const hasPhotos = t.photos && t.photos.length > 0;

                                                return (
                                                    <div className="txn-card" key={t.id} data-type={typeClass} style={{ animationDelay: `${i * 0.04}s` }}>
                                                        <div className="txn-card-inner">
                                                            <div className={`txn-type-icon ${typeClass}`}>
                                                                {isCr ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7" /></svg> :
                                                                    isAdv ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> :
                                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7" /></svg>}
                                                            </div>
                                                            <div className="txn-body">
                                                                <div className="txn-top-row">
                                                                    <div>
                                                                        <div className={`txn-amount ${typeClass}`}>₹{new Intl.NumberFormat('en-IN').format(t.amt)}</div>
                                                                        <div className="txn-time">
                                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                                                            {formatTime(t.date)} &nbsp;·&nbsp; {isCr ? 'Received' : isAdv ? 'Advance' : 'Given'}
                                                                        </div>
                                                                    </div>
                                                                    {hasPhotos ? (
                                                                        <img className="bill-thumb" src={t.photos[0]} onClick={() => setLightboxImg(t.photos[0])} alt="Bill" />
                                                                    ) : (
                                                                        <label htmlFor={`file-cam-${t.id}`} className="bill-thumb-placeholder" title="Add Bill Photo">
                                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                                                            <input type="file" style={{ display: 'none' }} id={`file-cam-${t.id}`} accept="image/*" multiple onChange={(e) => handleTxnPhoto(e, t.id)} />
                                                                        </label>
                                                                    )}
                                                                </div>
                                                                <div className="txn-note">
                                                                    {t.category && <span style={{ fontSize: '9px', background: 'var(--bg2)', padding: '2px 6px', borderRadius: '4px', marginRight: '6px', fontWeight: 700, color: 'var(--ink3)' }}>{t.category.toUpperCase()}</span>}
                                                                    {t.dueDate && t.type !== 'credit' && (
                                                                        <span className={`due-date-pill ${new Date(t.dueDate) < new Date() ? 'overdue' : ''}`}>
                                                                            ⌛ Due: {formatDateShort(t.dueDate)}
                                                                        </span>
                                                                    )}
                                                                    {t.note || t.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="txn-footer">
                                                            <div>
                                                                <div className="txn-balance-label">Balance</div>
                                                                <div className={`txn-balance-val ${t.runningBal < 0 ? '' : 'positive'}`}>
                                                                    ₹{fmt(Math.abs(t.runningBal))} {t.runningBal < 0 ? 'Dena Hai' : 'Baki Hai'}
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                                <button onClick={() => openEditEntry(t)} style={{ background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', color: 'var(--ink3)' }} title="Edit">✏️</button>
                                                                <button onClick={() => deleteTxn(t.id, t.amt, t.type)} style={{ background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', color: 'var(--red)' }} title="Delete">🗑</button>
                                                                <div className={`txn-attachment ${hasPhotos ? 'has-bill' : ''}`} onClick={() => hasPhotos ? setLightboxImg(t.photos[0]) : addPhotoToTxn(t.id)} style={{ marginLeft: '4px' }}>
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>
                                                                    {hasPhotos ? 'Bill' : 'Add'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                });
                            })()}

                            <div className="grand-total-card">
                                <div className="gt-title">Total Hisaab Summary</div>
                                <div className="gt-grid">
                                    <div className="gt-item">
                                        <div className="gt-lbl">Total Given</div>
                                        <div className="gt-val red">{fmt(Math.abs(custStats.debit))}</div>
                                    </div>
                                    <div className="gt-item">
                                        <div className="gt-lbl">Total Received</div>
                                        <div className="gt-val green">{fmt(Math.abs(custStats.credit))}</div>
                                    </div>
                                </div>
                                <div className="gt-final">
                                    <div className="gt-lbl">Final Net Balance</div>
                                    <div className={`gt-amt ${custStats.isNeg ? 'red' : 'green'}`}>
                                        {fmt(Math.abs(custStats.net))}
                                        <span>{custStats.isNeg ? 'You Will Give' : 'You Will Get'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="export-actions">
                                <button className="qa-btn pdf" onClick={exportPDF}>📄 PDF Download</button>
                                <button className="qa-btn excel" onClick={downloadCustomerExcel}>📊 Excel Download</button>
                            </div>
                            <div className="spacer" style={{ height: '100px' }}></div>
                            <div className="add-panel" id="addPanel">
                                <div className={`amount-area ${isAddEntryOpen ? 'show' : ''}`} id="amountArea">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <div className={`amount-type-label ${entryType === 'debit' ? 'given' : entryType === 'credit' ? 'received' : 'advance'}`} style={{ margin: 0 }}>
                                            {entryType === 'debit' ? '↑ Given' : entryType === 'credit' ? '↓ Received' : '⚡ Advance'}
                                        </div>
                                        {isAddEntryOpen && (
                                            <button onClick={closeNumpad} style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', cursor: 'pointer' }}>Cancel ✕</button>
                                        )}
                                    </div>
                                    <div className="amount-display"><span className="curr">₹</span><span>{new Intl.NumberFormat('en-IN').format(parseFloat(amtInp || '0')) + (amtInp.endsWith('.') ? '.' : '')}</span></div>
                                    {isAddEntryOpen && (
                                        <div style={{ fontSize: '12px', color: 'var(--ink3)', marginBottom: '8px' }}>
                                            New Balance: ₹{new Intl.NumberFormat('en-IN').format(Math.abs((currentCust?.balance || 0) + (entryType !== 'credit' ? parseFloat(amtInp || '0') : -parseFloat(amtInp || '0'))))}
                                            {((currentCust?.balance || 0) + (entryType !== 'credit' ? parseFloat(amtInp || '0') : -parseFloat(amtInp || '0'))) < 0 ? ' Dena Hai' : ' Baki Hai'}
                                        </div>
                                    )}
                                    <div className={`amount-underline ${entryType === 'debit' ? 'given' : entryType === 'credit' ? 'received' : 'advance'}`}></div>
                                </div>

                                <div className={`extra-fields ${isAddEntryOpen ? 'show' : ''}`}>
                                    <div className="extra-field-row" style={{ backgroundColor: '#ffffff' }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: entryType === 'credit' ? '#16a34a' : '#dc2626' }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        <input type="text" placeholder="Add note (optional)" value={entryNote} onChange={e => setEntryNote(e.target.value)} style={{ fontWeight: 'bold', color: entryType === 'credit' ? '#16a34a' : '#dc2626' }} />
                                    </div>
                                    <div className="extra-field-row" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', paddingLeft: '32px' }}>
                                        {['General', 'Goods', 'Salary', 'Rent', 'Food', 'Transport'].map(cat => (
                                            <span
                                                key={cat}
                                                className={`category-tag-option ${entryCategory === cat ? 'active' : ''}`}
                                                onClick={() => setEntryCategory(cat)}
                                                style={{ fontSize: '11px', fontWeight: 800, padding: '6px 14px', borderRadius: '20px', background: entryCategory === cat ? '#2563eb' : '#f1f5f9', color: entryCategory === cat ? '#ffffff' : '#000000', cursor: 'pointer', border: entryCategory === cat ? '1px solid #2563eb' : '1px solid #cbd5e1', transition: 'all 0.2s', boxShadow: entryCategory === cat ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none' }}
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="extra-field-row" style={{ display: 'flex', gap: '10px', padding: '10px 16px', background: 'transparent', border: 'none' }}>
                                        <label htmlFor="billFileGalleryNew" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', cursor: 'pointer' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Gallery</span>
                                            <input type="file" id="billFileGalleryNew" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} />
                                        </label>
                                        <label htmlFor="billFileCamNew" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', cursor: 'pointer' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Camera</span>
                                            <input type="file" id="billFileCamNew" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                                        </label>
                                    </div>
                                    {pendingPhotos.length > 0 && (
                                        <div style={{ padding: '0 16px 10px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
                                            {pendingPhotos.map((p, i) => (
                                                <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                                                    <img src={p} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }} alt={`Attachment ${i}`} />
                                                    <div onClick={(e) => { e.stopPropagation(); removePendingPhoto(i); }} style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--red)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid white' }}>×</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="extra-field-row">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                                        <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '9px', color: 'var(--ink4)' }}>Entry Date</div>
                                                <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '13px', color: 'var(--ink)' }} />
                                            </div>
                                            <div style={{ flex: 1, borderLeft: '1px solid var(--border)', paddingLeft: '10px' }}>
                                                <div style={{ fontSize: '9px', color: 'var(--red)' }}>Due Date (Optional)</div>
                                                <input type="date" value={entryDueDate} onChange={e => setEntryDueDate(e.target.value)} style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '13px', color: 'var(--red)' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`numpad ${isAddEntryOpen ? 'show' : ''}`}>
                                    <button className="num-key" onClick={() => numPress('1')}>1</button>
                                    <button className="num-key" onClick={() => numPress('2')}>2</button>
                                    <button className="num-key" onClick={() => numPress('3')}>3</button>
                                    <button className="num-key" onClick={() => numPress('4')}>4</button>
                                    <button className="num-key" onClick={() => numPress('5')}>5</button>
                                    <button className="num-key" onClick={() => numPress('6')}>6</button>
                                    <button className="num-key" onClick={() => numPress('7')}>7</button>
                                    <button className="num-key" onClick={() => numPress('8')}>8</button>
                                    <button className="num-key" onClick={() => numPress('9')}>9</button>
                                    <button className="num-key decimal" onClick={() => numPress('.')}>.</button>
                                    <button className="num-key zero" onClick={() => numPress('0')}>0</button>
                                    <button className="num-key backspace" onClick={() => numBackspace()}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>
                                    </button>
                                </div>

                                <div className={`confirm-row ${isAddEntryOpen ? 'show' : ''}`}>
                                    <button className="btn-back-entry" onClick={closeNumpad}>← Back</button>
                                    <button className={`btn-confirm ${entryType === 'debit' ? 'given' : entryType === 'credit' ? 'received' : 'advance'}`} onClick={() => {
                                        saveEntry();
                                        closeNumpad();
                                    }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                                        Confirm
                                    </button>
                                </div>

                                <div className="action-row" style={{ display: isAddEntryOpen ? 'none' : 'grid' }}>
                                    <button className="action-btn given-btn" onClick={() => openNumpad('debit')}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                                        Given
                                    </button>
                                    <button className="action-btn advance-btn" onClick={() => openNumpad('advance')}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                        Advance
                                    </button>
                                    <button className="action-btn received-btn" onClick={() => openNumpad('credit')}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                                        Received
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>



                    <div className="spacer"></div>

                    {/* ADD ENTRY PANEL */}

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
                        <div className="fg"><label className="fl">👤 Customer Name *</label><input className="fi" placeholder="e.g. Rahul Sharma" value={acName} onChange={e => setAcName(e.target.value)} /></div>
                        <div className="fg"><label className="fl">📞 Phone Number</label><input className="fi" type="tel" placeholder="e.g. 98765 44444 (optional)" value={acPhone} onChange={e => setAcPhone(e.target.value)} /></div>
                        <div className="f2">
                            <div className="fg" style={{ margin: 0 }}>
                                <label className="fl">📁 Category</label>
                                <select className="fi" value={acType} onChange={e => setAcType(e.target.value)}>
                                    {['Service', 'Wholesale', 'Supplier', 'Worker', 'Retail'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="fg" style={{ margin: 0 }}>
                                <label className="fl">💳 Credit Limit</label>
                                <input className="fi" type="number" placeholder="20000" value={acLimit} onChange={e => setAcLimit(e.target.value)} />
                            </div>
                        </div>
                        <div className="fg"><label className="fl">💰 Opening Balance</label><input className="fi" type="number" placeholder="0" value={acOpening} onChange={e => setAcOpening(e.target.value)} /></div>
                        <button className="save-btn cr" onClick={saveCustomer}>
                            <span>💾</span> Save New Customer
                        </button>
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
