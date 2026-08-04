'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import './hisaab.css';
import { generateHisaabPDF } from '../../../lib/pdf-generator';
import RoleGuard from '@/app/components/RoleGuard';
import { useSession } from 'next-auth/react';
import { useStore } from '../../../lib/store';
import { getTranslations } from '@/lib/translations';
import { getVisitingCardText, openWhatsAppChat } from '../../../lib/whatsapp-utils';

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
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
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
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [canSave, setCanSave] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [activeScreen, setActiveScreen] = useState<'list' | 'detail'>('list');
    const [curCid, setCurCid] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentFilter, setCurrentFilter] = useState('all');
    const { data: session, status } = useSession();
    const settings = useStore((state: any) => state.settings) || { language: 'en' };
    const t = getTranslations(settings?.language || 'en');
    const { businessProfile, aiDraftData, setAiDraftData, updateAiCopilotStep, completeAiCopilotAction } = useStore();

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
    const [editCustId, setEditCustId] = useState<number | null>(null);
    const [autoWhatsApp, setAutoWhatsApp] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [autoAiScan, setAutoAiScan] = useState(true);
    const expenseFileInputRef = useRef<HTMLInputElement>(null);
    const expenseFileInputCameraRef = useRef<HTMLInputElement>(null);
    const expenseFileInputGalleryRef = useRef<HTMLInputElement>(null);
    const [isExpenseScanning, setIsExpenseScanning] = useState(false);
    const [isAiScanMenuOpen, setIsAiScanMenuOpen] = useState(false);
    const [attachMenuType, setAttachMenuType] = useState<'normal'|'ai'|null>(null);

    // Expand toggle state per transaction ID
    const [expandedTxns, setExpandedTxns] = useState<Record<number, boolean>>({});
    const [hideZeroBalance, setHideZeroBalance] = useState(false);
    const [entryCategory, setEntryCategory] = useState('General');
    const [hideAlerts, setHideAlerts] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkSelected, setBulkSelected] = useState<Set<number>>(new Set());

    // Custom Contact Picker state
    const [showContactPicker, setShowContactPicker] = useState(false);
    const [contactList, setContactList] = useState<any[]>([]);
    const [contactSearch, setContactSearch] = useState('');
    const [isContactLoading, setIsContactLoading] = useState(false);

    // Add Cust Form state
    const [acName, setAcName] = useState('');
    const [acPhone, setAcPhone] = useState('');
    const [acType, setAcType] = useState('Service');
    const [acLimit, setAcLimit] = useState('');
    const [acOpening, setAcOpening] = useState('');
    const [isDetailScrolled, setIsDetailScrolled] = useState(false);
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsDetailScrolled(false);
        if (!bannerRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsDetailScrolled(!entry.isIntersecting);
            },
            { threshold: 0 }
        );
        observer.observe(bannerRef.current);
        return () => observer.disconnect();
    }, [curCid, activeScreen]);

    const toastTimeout = useRef<any>(null);
    // Track whether load has fully completed — prevent saving empty array during load
    const loadCompleted = useRef(false);
    const dismissedPTxnIds = useRef<Set<any>>(new Set());
    const notifiedPTxnIds = useRef<Set<any>>(new Set());

    // Helper to check if a pending txn is dismissed or already in txns
    const isDismissedOrHandled = (pId: any, localTxnIds: Set<string>) => {
        if (pId === null || pId === undefined) return true;
        const sId = String(pId);
        if (localTxnIds.has(sId)) return true;
        if (dismissedPTxnIds.current.has(sId) || dismissedPTxnIds.current.has(pId) || dismissedPTxnIds.current.has(Number(pId))) return true;
        return false;
    };

    // Initialize dismissed IDs from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem('dismissed_ptxns');
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    arr.forEach((id: any) => {
                        dismissedPTxnIds.current.add(String(id));
                        dismissedPTxnIds.current.add(Number(id));
                    });
                }
            }
        } catch (e) {}
    }, []);

    useEffect(() => {
        // Removed DOM reflow hack that caused sluggish UI
    }, [isAddCustOpen]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (status === 'loading') return;

        const loadData = async () => {
            // Reset flag so saving is blocked during this load
            loadCompleted.current = false;
            setCanSave(false);
            setIsLoadingData(true);

            try {
                const { idb } = await import('../../../lib/idb');

                const mergedCustomers = new Map<string, any>();

                const updateStateFromMap = () => {
                    const finalData = Array.from(mergedCustomers.values());
                    if (finalData.length > 0) {
                        const balancedData = finalData.map(c => {
                            let debitSum = 0, creditSum = 0;
                            const txns = c.txns || [];
                            const txnIds = new Set<string>(txns.map((t: any) => String(t.id)));
                            const cleanPending = (c.pending_txns || []).filter((p: any) => !isDismissedOrHandled(p.id, txnIds));
                            txns.forEach((t: any) => {
                                if (t.type === 'credit') creditSum += t.amt;
                                else debitSum += t.amt;
                            });
                            return { ...c, balance: debitSum - creditSum, pending_txns: cleanPending };
                        });
                        setCustomers(balancedData);
                    }
                };

                const mergeIntoMap = (dataArray: any[], triggerRender = false) => {
                    if (!Array.isArray(dataArray)) return;
                    let changed = false;
                    dataArray.forEach(cust => {
                        if (!cust.id) return;
                        const custKey = String(cust.id);
                        const existing = mergedCustomers.get(custKey);
                        const custTxns = cust.txns || [];
                        const custTxnIds = new Set<string>(custTxns.map((t: any) => String(t.id)));
                        const validCustPTxns = (cust.pending_txns || []).filter((p: any) => !isDismissedOrHandled(p.id, custTxnIds));

                        // Seed notified IDs so initial load doesn't trigger toast alerts
                        validCustPTxns.forEach((p: any) => {
                            notifiedPTxnIds.current.add(String(p.id));
                            notifiedPTxnIds.current.add(Number(p.id));
                        });

                        if (!existing) {
                            mergedCustomers.set(custKey, { ...cust, txns: custTxns, pending_txns: validCustPTxns });
                            changed = true;
                        } else {
                            const existingTxns = existing.txns || [];
                            const existingTxnIds = new Set<string>(existingTxns.map((t: any) => String(t.id)));
                            const newTxns = custTxns.filter((t: any) => !existingTxnIds.has(String(t.id)));
                            const mergedTxns = [...existingTxns, ...newTxns].sort((a: any, b: any) =>
                                new Date(b.date).getTime() - new Date(a.date).getTime()
                            );
                            const mergedTxnIds = new Set<string>(mergedTxns.map((t: any) => String(t.id)));

                            const existingPTxns = (existing.pending_txns || []).filter((p: any) => !isDismissedOrHandled(p.id, mergedTxnIds));
                            const existingPTxnIds = new Set<string>(existingPTxns.map((t: any) => String(t.id)));
                            const newPTxns = validCustPTxns.filter((p: any) => !existingPTxnIds.has(String(p.id)) && !isDismissedOrHandled(p.id, mergedTxnIds));
                            const mergedPTxns = [...existingPTxns, ...newPTxns].sort((a: any, b: any) =>
                                new Date(b.date).getTime() - new Date(a.date).getTime()
                            );

                            mergedCustomers.set(custKey, { ...existing, ...cust, txns: mergedTxns, pending_txns: mergedPTxns });
                            if (newTxns.length > 0 || newPTxns.length > 0) changed = true;
                        }
                    });
                    if (changed && triggerRender) {
                        updateStateFromMap();
                    }
                };

                // 1. FAST PATH: Recover from specific user IDB key FIRST
                let userStorageKey = session?.user?.id ? `hisaab_pro_data_${session.user.id}` : 'hisaab_pro_data';
                try {
                    const fastData = await idb.get(userStorageKey);
                    if (fastData) mergeIntoMap(fastData, true);
                } catch(e) {}
                
                // Hide loading spinner IMMEDAITELY if we have some data
                if (mergedCustomers.size > 0) {
                    setIsLoadingData(false);
                }

                // 2. Load from other keys in background (legacy)
                try {
                    const allKeys = await idb.keys();
                    for (const k of allKeys) {
                        if (typeof k === 'string' && k.startsWith('hisaab_pro_data') && k !== userStorageKey) {
                            const idbData = await idb.get(k);
                            if (idbData) mergeIntoMap(idbData, true);
                        }
                    }
                } catch(e) {}

                try {
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k && k.startsWith('hisaab_pro_data')) {
                            const lsData = localStorage.getItem(k);
                            if (lsData) mergeIntoMap(JSON.parse(lsData), true);
                        }
                    }
                } catch(e) {}

                if (mergedCustomers.size > 0 && isLoadingData) {
                    setIsLoadingData(false);
                }

                // 3. Server sync in background! (Non-blocking)
                if (session?.user?.id) {
                    fetch('/api/hisaab/sync').then(async res => {
                        if (res.ok) {
                            const serverCustomers = await res.json();
                            if (Array.isArray(serverCustomers) && serverCustomers.length > 0) {
                                mergeIntoMap(serverCustomers, true);
                            }
                        }
                    }).catch(e => console.error('[Hisaab] Server recovery failed:', e));
                }

                if (mergedCustomers.size === 0) {
                    setCustomers(session?.user?.id ? [] : DEFAULT_DATA);
                    setIsLoadingData(false);
                }

                loadCompleted.current = true;
                setTimeout(() => setCanSave(true), 800);
            } catch (e) {
                console.error("Storage init error", e);
                loadCompleted.current = true;
                setIsLoadingData(false);
                setTimeout(() => setCanSave(true), 800);
            }
        };

        loadData();
    }, [status, session?.user?.id, session?.user?.email]);

    // --- REAL-TIME LIVE SYNC (Near-instant updates for incoming UPI payments & pending approvals) ---
    useEffect(() => {
        if (!session?.user?.id || !isMounted) return;

        let isSyncing = false;

        const syncFromServer = async () => {
            if (isSyncing || !loadCompleted.current) return;
            isSyncing = true;
            try {
                const res = await fetch('/api/hisaab/sync');
                if (res.ok) {
                    const serverCustomers = await res.json();
                    if (Array.isArray(serverCustomers) && serverCustomers.length > 0) {
                        setCustomers(prev => {
                            let hasChanges = false;
                            const prevMap = new Map(prev.map(c => [String(c.id), c]));

                            serverCustomers.forEach(sCust => {
                                const custKey = String(sCust.id);
                                const local = prevMap.get(custKey);
                                if (!local) {
                                    const filteredPTxns = (sCust.pending_txns || []).filter((p: any) => !isDismissedOrHandled(p.id, new Set()));
                                    prevMap.set(custKey, { ...sCust, txns: sCust.txns || [], pending_txns: filteredPTxns });
                                    hasChanges = true;
                                } else {
                                    const localTxns = local.txns || [];
                                    const localTxnIds = new Set<string>(localTxns.map((t: any) => String(t.id)));
                                    const serverTxns = sCust.txns || [];
                                    const newTxns = serverTxns.filter((t: any) => !localTxnIds.has(String(t.id)));
                                    const mergedTxnIds = new Set<string>([...localTxnIds, ...serverTxns.map((t: any) => String(t.id))]);

                                    // Filter out any pending transaction that is already in txns OR was dismissed locally
                                    const validServerPTxns = (sCust.pending_txns || []).filter((p: any) => 
                                        !isDismissedOrHandled(p.id, mergedTxnIds)
                                    );

                                    // Also filter local.pending_txns
                                    const localPTxnMap = new Map<string, any>();
                                    (local.pending_txns || [])
                                        .filter((p: any) => !isDismissedOrHandled(p.id, mergedTxnIds))
                                        .forEach((p: any) => localPTxnMap.set(String(p.id), p));

                                    let hasNewPending = false;
                                    validServerPTxns.forEach((p: any) => {
                                        const pIdStr = String(p.id);
                                        if (!localPTxnMap.has(pIdStr)) {
                                            localPTxnMap.set(pIdStr, p);
                                            hasNewPending = true;
                                            if (!notifiedPTxnIds.current.has(pIdStr) && !notifiedPTxnIds.current.has(p.id)) {
                                                notifiedPTxnIds.current.add(pIdStr);
                                                notifiedPTxnIds.current.add(Number(p.id));
                                                showToast(`🔔 Naya Payment: ₹${p.amt} from ${local.name || 'Customer'}`);
                                            }
                                        }
                                    });

                                    const mergedPTxns = Array.from(localPTxnMap.values()).sort((a: any, b: any) =>
                                        new Date(b.date).getTime() - new Date(a.date).getTime()
                                    );

                                    const oldPTxnIdsStr = (local.pending_txns || []).map((p: any) => String(p.id)).join(',');
                                    const newPTxnIdsStr = mergedPTxns.map((p: any) => String(p.id)).join(',');
                                    const pTxnsChanged = oldPTxnIdsStr !== newPTxnIdsStr;

                                    if (newTxns.length > 0 || pTxnsChanged) {
                                        hasChanges = true;
                                        const mergedTxns = [...localTxns, ...newTxns].sort((a: any, b: any) =>
                                            new Date(b.date).getTime() - new Date(a.date).getTime()
                                        );
                                        prevMap.set(custKey, {
                                            ...local,
                                            txns: mergedTxns,
                                            pending_txns: mergedPTxns
                                        });
                                    }
                                }
                            });

                            if (hasChanges) {
                                return Array.from(prevMap.values());
                            }
                            return prev;
                        });
                    }
                }
            } catch (e) {
                // Background sync ignore
            } finally {
                isSyncing = false;
            }
        };

        // Poll every 3 seconds for near-instant updates on active screen
        const intervalId = setInterval(syncFromServer, 3000);

        const handleVisibilityOrFocus = () => {
            if (document.visibilityState === 'visible') {
                syncFromServer();
            }
        };

        window.addEventListener('focus', handleVisibilityOrFocus);
        document.addEventListener('visibilitychange', handleVisibilityOrFocus);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('focus', handleVisibilityOrFocus);
            document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
        };
    }, [session?.user?.id, isMounted]);

    // --- SAVING LOGIC ---
    useEffect(() => {
        // CRITICAL: Only save after load is fully completed — never overwrite with empty data
        if (!isMounted || !canSave || !loadCompleted.current) return;
        // Extra guard: never save empty array (could be mid-load state)
        if (customers.length === 0 && !session?.user?.id) return;

        const saveData = async () => {
            let storageKey = null;

            if (session?.user?.id) {
                storageKey = `hisaab_pro_data_${session.user.id}`;
            } else if (!session) {
                // ONLY use legacy key if explicitly NOT logged in (Guest Mode)
                storageKey = 'hisaab_pro_data';
            }

            if (!storageKey) return;

            try {
                const { idb } = await import('../../../lib/idb');
                await idb.set(storageKey, customers);

                if (session?.user?.id) {
                    try { localStorage.removeItem('hisaab_pro_data'); } catch (e) { }
                }
            } catch (err) {
                console.error("IDB Storage error:", err);
            }

            // Sync only active customer with Server (Bulk sync freezes UI due to large data)
            if (curCid && session?.user?.id) {
                const c = customers.find((x: any) => String(x.id) === String(curCid));
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
            // console.log("Auto-healed corrupted balances!");
            showToast(t.toastAutoHeal || "🛠 Purani entries ka hisaab theek kar diya gaya hai!");
        }
    }, [isMounted, customers.length]); // only run once when loaded

    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#detail') {
                // If hash is #detail, ensure we are in detail view (if a customer is selected)
                if (curCid) setActiveScreen('detail');
            } else {
                // If hash is removed (e.g., via hardware back button), go back to list
                setActiveScreen('list');
                setCurCid(null);
            }
        };

        // Run once on mount to handle initial hash
        handleHashChange();

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [curCid]);

    useEffect(() => {
        if (!isMounted || !loadCompleted.current || !aiDraftData) return;
        if (aiDraftData.type === 'EXPENSE') {
            const { description, amount } = aiDraftData;
            const searchName = (description || '').trim();
            const amt = Number(amount) || 0;

            // Step 1: Search & locate account (at 200ms)
            const t1 = setTimeout(() => {
                updateAiCopilotStep(0, 'done', searchName ? `Account "${searchName}" search ho gaya!` : 'Khata select ho gaya!');
            }, 200);

            // Step 2: Add Entry (at 800ms)
            const t2 = setTimeout(() => {
                if (searchName && customers.length > 0) {
                    const target = customers.find((c: any) => c.name.toLowerCase().includes(searchName.toLowerCase()));
                    if (target) {
                        setCurCid(target.id);
                        setActiveScreen('detail');
                        window.location.hash = 'detail';
                        if (amt > 0) {
                            setCustomers(customers.map(c => {
                                if (c.id === target.id) {
                                    const newTxn = {
                                        id: Date.now(),
                                        type: 'debit',
                                        amt,
                                        name: 'Expense (AI)',
                                        note: '',
                                        date: new Date().toISOString(),
                                        category: 'General',
                                        photos: []
                                    };
                                    return { ...c, balance: c.balance + amt, txns: [newTxn, ...c.txns] };
                                }
                                return c;
                            }));
                            setCanSave(true);
                            showToast(t.entrySaved || `✅ ${target.name} me ₹${amt} add ho gaye!`);
                        } else {
                            setTimeout(() => openAddEntry('debit', String(amount || '')), 300);
                        }
                    } else {
                        if (amt > 0) {
                            const nc = { id: Date.now(), name: searchName, phone: '', type: 'customer', limit: 0, balance: amt, txns: [{
                                id: Date.now() + 1, type: 'debit', amt, name: 'Opening Balance (AI)', note: '', date: new Date().toISOString(), category: 'General', photos: []
                            }] };
                            setCustomers([{ ...nc }, ...customers]);
                            setCanSave(true);
                            showToast(`✅ Naya account ${searchName} ban gaya aur ₹${amt} add ho gaye!`);
                        } else {
                            setAcName(searchName);
                            setIsAddCustOpen(true);
                        }
                    }
                } else {
                    if (amt > 0) {
                        const partyName = searchName || 'General Expense';
                        const nc = { id: Date.now(), name: partyName, phone: '', type: 'customer', limit: 0, balance: amt, txns: [{
                            id: Date.now() + 1, type: 'debit', amt, name: 'Expense (AI)', note: '', date: new Date().toISOString(), category: 'General', photos: []
                        }] };
                        setCustomers([{ ...nc }, ...customers]);
                        setCanSave(true);
                        showToast(`✅ ${partyName} me ₹${amt} add ho gaye!`);
                    } else {
                        if (amount) setAcOpening(String(amount));
                        setIsAddCustOpen(true);
                    }
                }
                updateAiCopilotStep(1, 'done', `₹${amt} kharcha entry add ho gayi!`);
            }, 800);

            // Step 3: Complete HUD (at 1500ms)
            const t3 = setTimeout(() => {
                updateAiCopilotStep(2, 'done', 'Khata balance update ho gaya!');
                completeAiCopilotAction(`✅ ₹${amt} kharcha (${searchName || 'General'}) successfully add ho gaya!`);
                setAiDraftData(null);
            }, 1500);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
            };
        } else if (aiDraftData.type === 'BULK_REMINDER') {
            const pendingIds = customers.filter((c: any) => c.balance > 0).map((c: any) => c.id);
            if (pendingIds.length > 0) {
                updateAiCopilotStep(0, 'done', `${pendingIds.length} pending customers mil gaye!`);
                showToast(t.sendingReminders || '⏳ Sending reminders to all pending customers...');
                setTimeout(() => {
                    updateAiCopilotStep(1, 'done', 'WhatsApp reminder messages ready!');
                    completeAiCopilotAction(`✅ ${pendingIds.length} pending customers ke reminders taiyar hain!`);
                    setAiDraftData(null);
                    handleBulkRemind(pendingIds);
                }, 900);
            } else {
                updateAiCopilotStep(0, 'done', 'Sabhi bills clear hain!');
                completeAiCopilotAction('✅ Koi pending payment nahi hai.');
                showToast('✅ No pending payments found!');
                setAiDraftData(null);
            }
        }
    }, [isMounted, aiDraftData, customers, updateAiCopilotStep, completeAiCopilotAction]);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToastMsg(''), 2500);
    };

    const currentCust = curCid ? customers.find(c => String(c.id) === String(curCid)) : null;

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
            .filter((c: any) => c.balance > 0)
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

    const displayList = customers
        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => (b.balance || 0) - (a.balance || 0));

    // Handlers
    const handleOpenDetail = (id: number) => {
        setCurCid(id);
        setCurrentFilter('all');
        setActiveScreen('detail');
        window.location.hash = 'detail';
        // Small timeout ensures the new screen is rendered before we scroll
        setTimeout(() => {
            const mainScroll = document.querySelector('main');
            if (mainScroll) mainScroll.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
    };


    const numPress = (val: string) => {
        if (val === '.' && amtInp.includes('.')) return;
        if ((amtInp === '0' || amtInp === '') && val !== '.') setAmtInp(val);
        else setAmtInp(amtInp + val);
    };
    const numBackspace = () => {
        if (amtInp.length <= 1) setAmtInp('');
        else setAmtInp(amtInp.slice(0, -1));
    };
    const openNumpad = (type: string) => {
        setEditTxnId(null);
        setEntryType(type as any);
        setAmtInp('');
        setEntryName('');
        setEntryNote('');
        setEntryDate(new Date().toISOString().split('T')[0]);
        setEntryDueDate('');
        setEntryCategory('General');
        setPendingPhotos([]);
        setIsAddEntryOpen(true);
    };
    const closeNumpad = () => {
        setIsAddEntryOpen(false);
        setAttachMenuType(null);
    };

    const [txnSortAsc, setTxnSortAsc] = useState(false);

    const generateHisaabWhatsAppText = (cust: any, amount: number, shareUrl: string, isReminder: boolean = false) => {
        const netAmt = Math.abs(amount);
        const isNeg = amount < 0; // Business owes Customer (Advance)
        const bizName = businessProfile?.business_name || 'Business';
        
        let msg = `${t.namaste || 'Namaste'} ${cust.name || 'Customer'} 🙏\n\n`;
        msg += isReminder ? `${t.paymentPendingMsg || 'Aapka payment pending hai, kripya apna hisaab clear karein.'}\n\n` : `${t.statementReadyMsg || 'Aapka Hisaab Statement ready hai.'}\n\n`;
        msg += `💰 *${t.totalAmount || 'Total Amount'}:* ₹${new Intl.NumberFormat('en-IN').format(netAmt)}\n`;
        msg += `👉 *${t.status || 'Status'}:* ${isNeg ? (t.advanceJamaHai || 'Aapka Advance Jama Hai') : (t.outstanding || 'Aapko Dena Hai (Outstanding)')}\n\n`;
        msg += `📊 *${t.statementLinkMsg || 'Poora Hisaab Dekhne & PDF Download karne ke liye link par click karein:'}*\n${shareUrl}\n\n`;
        msg += `${t.thankYou || 'Dhanyawad'},\n*${bizName}*`;
        
        return msg;
    };

    const sendWhatsAppRemind = async (cust: any, amount: number) => {
        const phone = cust.phone?.replace(/\D/g, '') || '';
        if (!phone) {
            showToast(t.addPhoneFirst || '📱 Pahle customer ka mobile number add karein.');
            return;
        }
        
        showToast(t.generatingLink || '⏳ Generating Link...');
        try {
            if (session?.user?.id) {
                try { await fetch('/api/hisaab/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cust) }); } catch (e) {}
            }

            let shareId = session?.user?.id ? `${session.user.id}_${cust.id}` : cust.id;
            try {
                if (session?.user?.id) {
                    const res = await fetch('/api/hisaab/link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ custId: cust.id }) });
                    const json = await res.json();
                    if (json.shortId) shareId = json.shortId;
                }
            } catch(e) {}
            const shareUrl = `${window.location.origin}/h/${shareId}`;
            const textMsg = generateHisaabWhatsAppText(cust, cust.balance, shareUrl, true);

            openWhatsAppChat(phone, textMsg);
            showToast(t.openingWhatsApp || '✅ Opening WhatsApp...');
        } catch (err) {
            showToast(t.errorGeneratingLink || '❌ Error in generating link!');
        }
    };

    const handleBulkRemind = async (overrideIds?: number[] | any) => {
        const targetIds = Array.isArray(overrideIds) ? overrideIds : Array.from(bulkSelected);
        if (targetIds.length === 0) {
            showToast(t.noCustomerSelected || '⚠️ Koi customer select nahi kiya!');
            return;
        }
        
        showToast(`${t.sendingReminders || '⏳ Sending'} ${targetIds.length} ${t.reminders || 'reminders'}...`);
        setIsBulkMode(false);
        setBulkSelected(new Set());

        let successCount = 0;
        for (const cid of targetIds) {
            const cust = customers.find(c => c.id === cid);
            if (!cust) continue;
            const phone = cust.phone?.replace(/\D/g, '') || '';
            if (!phone) continue;

            let shareId = session?.user?.id ? `${session.user.id}_${cust.id}` : cust.id;
            try {
                if (session?.user?.id) {
                    const resLink = await fetch('/api/hisaab/link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ custId: cust.id }) });
                    const json = await resLink.json();
                    if (json.shortId) shareId = json.shortId;
                }
            } catch(e) {}
            const shareUrl = `${window.location.origin}/h/${shareId}`;
            const textMsg = generateHisaabWhatsAppText(cust, cust.balance, shareUrl, true);

            try {
                let c = 0, d = 0;
                (cust.txns || []).forEach((t: any) => { if (t.type === 'credit') c += t.amt; else d += t.amt; });
                const stats = { credit: c, debit: d, net: Math.abs(cust.balance), entries: cust.txns?.length || 0, isNeg: cust.balance < 0 };
                
                const doc = await generateHisaabPDF(cust, { name: 'BillGST Pro' }, stats, false);
                if (!doc) continue;
                const pdfBlob = doc.output('blob');
                const file = new File([pdfBlob], `Reminder_${cust.name}.pdf`, { type: 'application/pdf' });
                
                const formData = new FormData();
                formData.append('phone', phone);
                formData.append('message', textMsg);
                formData.append('file', file);

                const res = await fetch('/api/whatsapp/send-media', { method: 'POST', body: formData });
                if (res.ok) successCount++;
                
                if (targetIds.length === 1) {
                    openWhatsAppChat(phone, textMsg);
                }
            } catch (e) {
                console.error('Bulk send error', e);
                if (targetIds.length === 1) {
                    openWhatsAppChat(phone, textMsg);
                }
            }
        }
        showToast(`✅ ${successCount} ${t.remindersQueued || 'Reminders Queued!'}`);
    };

    const toggleBulkSelect = (id: number) => {
        setBulkSelected(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const sendWhatsAppStatement = async (cust: any, amount: number) => {
        const phone = cust.phone?.replace(/\D/g, '') || '';
        if (!phone) {
            showToast(t.addPhoneWhatsApp || '📱 Pahle customer ka mobile number add karein, uske baad WhatsApp par share hoga.');
            return;
        }
        
        showToast(t.generatingLink || '⏳ Generating Link...');
        try {
            if (session?.user?.id) {
                // Fire and forget sync to speed up
                fetch('/api/hisaab/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cust) }).catch(e => {});
            }

            const shareId = session?.user?.id ? `${session.user.id}_${cust.id}` : cust.id;
            const shareUrl = `${window.location.origin}/h/${shareId}`;
            const textMsg = generateHisaabWhatsAppText(cust, cust.balance, shareUrl, false);


            openWhatsAppChat(phone, textMsg);
            showToast(t.openingWhatsApp || '✅ Opening WhatsApp...');
        } catch (err: any) {
            showToast(t.error + ': ' + (err.message || 'Unknown'));
        }
    };

    const exportPDF = async () => {
        if (!currentCust?.id) return;
        showToast(t.openingStatement || '⏳ Opening Statement...');
        try {
            await fetch('/api/hisaab/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currentCust) }).catch(e => {});
            const shareId = session?.user?.id ? `${session.user.id}_${currentCust.id}` : currentCust.id;
            window.location.href = `/h/${shareId}`;
        } catch (error) {
            showToast(t.errorOpeningStatement || '❌ Error opening statement');
        }
    };

    const handleDownloadPDF = async () => {
        if (!currentCust) return;
        showToast(t.generatingPDF || '⏳ Generating PDF...');
        try {
            const { generateHisaabPDF } = await import('@/lib/pdf-generator');
            const doc = await generateHisaabPDF(currentCust, businessProfile || { name: 'BillGST Pro' }, custStats, false);
            if (doc) {
                const base64Data = doc.output('datauristring').split(',')[1];
                const { downloadAndShareFile } = await import('@/lib/utils');
                await downloadAndShareFile(base64Data, `Statement_${currentCust.name}_${Date.now()}.pdf`, 'application/pdf', 'view');
                showToast(t.pdfReady || '✅ PDF ready!');
            }
        } catch (e) {
            showToast(t.pdfError || '❌ PDF Error');
        }
    };

    const openEditCust = (cust: any) => {
        setEditCustId(cust.id);
        setAcName(cust.name);
        setAcPhone(cust.phone);
        setAcType(cust.type);
        setAcLimit(cust.limit);
        setAcOpening(cust.balance);
        setIsAddCustOpen(true);
    };

    const handleBack = () => {
        if (window.location.hash.includes('detail')) {
            window.history.back(); // This will pop the hash state and trigger hashchange
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
        setEntryDueDate('');
        setEntryCategory('General');
        setPendingPhotos([]);
        setIsAddEntryOpen(true);
    };

    const handleExpenseAiScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsExpenseScanning(true);
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64 = event.target?.result as string;
                const compressedBase64 = await compressImage(base64, 800, 0.7);
                
                try {
                    const res = await fetch('/api/vision-expense', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageBase64: compressedBase64 })
                    });
                    
                    const data = await res.json();
                    
                    if (data && data.totalAmount) {
                        openAddEntry('debit', data.totalAmount.toString());
                        setEntryDate(data.expenseDate || new Date().toISOString().split('T')[0]);
                        setEntryNote(data.description || '');
                        showToast(t.billScanned || '✅ Bill scanned successfully!');
                    } else {
                        showToast(t.errorScanningBill || '❌ Failed to extract details from bill');
                    }
                } catch (error) {
                    showToast(t.errorParsingBill || '❌ Error parsing bill details');
                } finally {
                    setIsExpenseScanning(false);
                    setIsAiScanMenuOpen(false);
                    if (expenseFileInputRef.current) expenseFileInputRef.current.value = '';
                    if (expenseFileInputCameraRef.current) expenseFileInputCameraRef.current.value = '';
                    if (expenseFileInputGalleryRef.current) expenseFileInputGalleryRef.current.value = '';
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setIsExpenseScanning(false);
            setIsAiScanMenuOpen(false);
            showToast(t.errorReadingFile || '❌ Error reading file');
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) showToast(t.photoLoading || '⏳ Photo load ho rahi hai...');
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
                        showToast(t.photoAdded || '📸 Photo add ho gayi!');
                    } catch (err) {
                        console.error('Image compression failed', err);
                        showToast(t.photoError || '❌ Photo size bohot bada hai ya error aaya!');
                    }
                }
            };
            reader.onerror = () => {
                console.error("FileReader error on upload");
                showToast(t.photoReadError || '❌ Photo read karne mein problem aayi!');
            };
            try {
                reader.readAsDataURL(f);
            } catch (err) {
                showToast(t.photoSelectError || '❌ Photo select karne me error');
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

    const acceptPendingTxn = async (txnId: any) => {
        const idStr = String(txnId);
        dismissedPTxnIds.current.add(idStr);
        dismissedPTxnIds.current.add(txnId);
        dismissedPTxnIds.current.add(Number(txnId));
        try {
            const raw = localStorage.getItem('dismissed_ptxns');
            const arr = raw ? JSON.parse(raw) : [];
            if (!arr.includes(idStr)) {
                arr.push(idStr);
                localStorage.setItem('dismissed_ptxns', JSON.stringify(arr));
            }
        } catch (e) {}

        let updatedCust: any = null;
        let nextList: any[] = [];

        setCustomers(prev => {
            nextList = prev.map(c => {
                if (String(c.id) === String(curCid)) {
                    const pendingList = c.pending_txns || [];
                    const txn = pendingList.find((t: any) => String(t.id) === idStr);
                    const newPending = pendingList.filter((t: any) => String(t.id) !== idStr);

                    if (!txn) {
                        updatedCust = { ...c, pending_txns: newPending };
                        return updatedCust;
                    }
                    
                    const newTxns = [...(c.txns || []), txn].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const isDebit = txn.type !== 'credit';
                    const balChange = isDebit ? txn.amt : -txn.amt;
                    
                    updatedCust = {
                        ...c,
                        txns: newTxns,
                        pending_txns: newPending,
                        balance: (c.balance || 0) + balChange
                    };
                    return updatedCust;
                }
                return c;
            });
            return nextList;
        });

        setCanSave(true);

        // Immediate IDB write
        try {
            const { idb } = await import('../../../lib/idb');
            const storageKey = session?.user?.id ? `hisaab_pro_data_${session.user.id}` : 'hisaab_pro_data';
            if (nextList.length > 0) await idb.set(storageKey, nextList);
        } catch (e) {}

        if (updatedCust && session?.user?.id) {
            try {
                await fetch('/api/hisaab/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedCust)
                });
            } catch (e) {
                console.error('[Hisaab] Instant sync failed:', e);
            }
        }

        showToast(t.paymentAccepted || '✅ Payment accepted and added to Hisaab!');
    };

    const rejectPendingTxn = async (txnId: any) => {
        if (!window.confirm(t.confirmReject || 'Are you sure you want to reject this payment?')) return;
        const idStr = String(txnId);
        dismissedPTxnIds.current.add(idStr);
        dismissedPTxnIds.current.add(txnId);
        dismissedPTxnIds.current.add(Number(txnId));
        try {
            const raw = localStorage.getItem('dismissed_ptxns');
            const arr = raw ? JSON.parse(raw) : [];
            if (!arr.includes(idStr)) {
                arr.push(idStr);
                localStorage.setItem('dismissed_ptxns', JSON.stringify(arr));
            }
        } catch (e) {}

        let updatedCust: any = null;
        let nextList: any[] = [];

        setCustomers(prev => {
            nextList = prev.map(c => {
                if (String(c.id) === String(curCid)) {
                    const newPending = (c.pending_txns || []).filter((t: any) => String(t.id) !== idStr);
                    updatedCust = {
                        ...c,
                        pending_txns: newPending
                    };
                    return updatedCust;
                }
                return c;
            });
            return nextList;
        });

        setCanSave(true);

        // Immediate IDB write
        try {
            const { idb } = await import('../../../lib/idb');
            const storageKey = session?.user?.id ? `hisaab_pro_data_${session.user.id}` : 'hisaab_pro_data';
            if (nextList.length > 0) await idb.set(storageKey, nextList);
        } catch (e) {}

        if (updatedCust && session?.user?.id) {
            try {
                await fetch('/api/hisaab/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedCust)
                });
            } catch (e) {
                console.error('[Hisaab] Instant sync failed:', e);
            }
        }

        showToast(t.paymentRejected || '❌ Payment rejected!');
    };

    const deleteTxn = (txnId: number, txnAmt: number, txnType: string) => {
        if (!window.confirm(t.confirmDelete || 'Pukka delete karna hai?')) return;
        setCustomers(customers.map(c => {
            if (String(c.id) === String(curCid)) {
                const isDebit = txnType !== 'credit';
                const balChange = isDebit ? -txnAmt : txnAmt; // reverse the effect
                return {
                    ...c,
                    txns: c.txns.filter((t: any) => String(t.id) !== String(txnId)),
                    balance: c.balance + balChange
                };
            }
            return c;
        }));
        showToast(t.entryDeleted || '🗑 Entry delete ho gayi!');
    };

    const saveEntry = () => {
        const amt = parseFloat(amtInp);
        if (!amt || isNaN(amt) || amt <= 0) { showToast(t.enterAmount || '⚠️ Amount daalo!'); return; }
        const name = entryName.trim() || (entryType === 'credit' ? (t.receivedText || 'Received') : (t.givenText || 'Given'));
        const note = entryNote.trim();
        const date = entryDate ? new Date(entryDate).toISOString() : new Date().toISOString();

        // 1. Calculate new balance for validation
        const currentCustomer = customers.find(c => String(c.id) === String(curCid));
        if (currentCustomer) {
            let projectedBalance = currentCustomer.balance;
            if (editTxnId) {
                const oldTxn = currentCustomer.txns.find((t: any) => String(t.id) === String(editTxnId));
                if (oldTxn) {
                    const oldIsDebit = oldTxn.type !== 'credit';
                    projectedBalance -= (oldIsDebit ? oldTxn.amt : -oldTxn.amt);
                }
            }
            const isDebit = entryType !== 'credit';
            projectedBalance += (isDebit ? amt : -amt);

            if (currentCustomer.limit > 0 && projectedBalance > currentCustomer.limit) {
                if (!window.confirm(`${t.limitAlert || '⚠️ ALERT'}: ${currentCustomer.name} ${t.limitExceeded || 'ki credit limit cross ho rahi hai!'}\n\n${t.newBalance || 'Naya Balance'} ₹${projectedBalance} ${t.willBecome || 'ho jayega'}.\n\n${t.saveAnyway || 'Kya aap phir bhi ye entry save karna chahte hain?'}`)) {
                    return;
                }
            }
        }

        setCustomers(customers.map(c => {
            if (String(c.id) === String(curCid)) {
                let newTxns = [...c.txns];
                let newBalance = c.balance;

                if (editTxnId) {
                    const oldTxn = newTxns.find((t: any) => String(t.id) === String(editTxnId));
                    if (oldTxn) {
                        const oldIsDebit = oldTxn.type !== 'credit';
                        newBalance -= (oldIsDebit ? oldTxn.amt : -oldTxn.amt);
                    }
                    newTxns = newTxns.map((t: any) => String(t.id) === String(editTxnId) ? { ...t, type: entryType, name, note, date, dueDate: entryDueDate, amt, category: entryCategory, photos: [...pendingPhotos] } : t);
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
        showToast(editTxnId ? (t.entryUpdated || '✅ Entry update ho gayi!') : (t.entrySaved || '✅ Entry save ho gayi!'));

        // Auto WhatsApp notification for NEW entries
        if (!editTxnId && currentCustomer?.phone && autoWhatsApp) {
            const rawPhone = currentCustomer.phone.replace(/\D/g, '');
            if (rawPhone) {
                const phone = rawPhone.startsWith('91') && rawPhone.length > 10 ? rawPhone : (rawPhone.length === 10 ? '91' + rawPhone : rawPhone);
                const isDebit = entryType !== 'credit';
                // Recalculate projected balance based on current transaction
                let newBalance = currentCustomer.balance;
                newBalance += (isDebit ? amt : -amt);

                const action = isDebit ? 'Given (Debit)' : 'Received (Credit)';
                const bizName = businessProfile?.business_name || businessProfile?.name || 'BillGST';
                const balType = newBalance < 0 ? 'Advance' : 'Due';
                
                let txt = `*${bizName} - Account Statement*\n\nHello ${currentCustomer.name},\n\nYour account has been updated with *₹${amt}* (${action}).\n\n*Current Balance:* ₹${Math.abs(newBalance)} (${balType})\n\nThank you,\n*${bizName}*`;
                const custShareId = session?.user?.id ? `${session.user.id}_${currentCustomer.id}` : currentCustomer.id;
                txt += getVisitingCardText(businessProfile, newBalance > 0 ? newBalance : undefined, custShareId, currentCustomer.name);
                
                // Direct WhatsApp intent on user device for 100% FREE & instant delivery
                try {
                    openWhatsAppChat(currentCustomer.phone, txt);
                    showToast(t.openingWhatsApp || '📱 Opening WhatsApp...');
                } catch (e) {
                    console.error('Failed to open WhatsApp window', e);
                }
            }
        }
    };

    // Customer Sheet Handlers
    const importContact = async () => {
        try {
            const { isNativeApp } = await import('@/lib/utils');
            
            if (isNativeApp()) {
                try {
                    const { registerPlugin } = await import('@capacitor/core');
                    const NativeContactPicker = registerPlugin('NativeContactPicker') as any;
                    
                    if (NativeContactPicker) {
                        const result = await NativeContactPicker.pickPhoneContact();
                        if (result && result.name && result.phone) {
                            setAcName(result.name);
                            
                            let foundNum = '';
                            let numStr = result.phone;
                            if (numStr) {
                                let num = numStr.replace(/[^\d+]/g, '');
                                if (num.startsWith('+91')) num = num.slice(3);
                                else if (num.startsWith('91') && num.length > 10) num = num.slice(2);
                                else if (num.startsWith('0') && num.length > 10) num = num.slice(1);
                                if (num.length >= 10) {
                                    foundNum = num;
                                }
                            }
                            
                            if (foundNum) {
                                setAcPhone(foundNum);
                                showToast(t.contactImported || '✅ Contact imported successfully!');
                            } else {
                                showToast(t.invalidPhoneFormat || '⚠️ Imported contact has invalid phone number format.');
                            }
                        } else {
                            showToast(t.noPhoneNumber || '⚠️ No phone number found for this contact.');
                        }
                    } else {
                        showToast(t.pluginNotLoaded || '❌ Native plugin not loaded.');
                    }
                } catch (err: any) {
                    if (err.message && err.message.includes('Canceled')) {
                        // User simply canceled the picker, no toast needed
                    } else {
                        showToast(t.error + ': ' + (err.message || 'Unknown'));
                    }
                }
            } else if ('contacts' in navigator) {
                // Web Fallback
                try {
                    const props = ['name', 'tel'];
                    const opts = { multiple: false };
                    const contacts = await (navigator as any).contacts.select(props, opts);
                    if (contacts && contacts.length > 0) {
                        const contact = contacts[0];
                        if (contact.name && contact.name[0]) setAcName(contact.name[0]);
                        
                        let foundNum = '';
                        if (contact.tel && contact.tel.length > 0) {
                            for (let t of contact.tel) {
                                const numStr = typeof t === 'string' ? t : (t.value || '');
                                if (numStr) {
                                    let num = numStr.replace(/[^\d+]/g, '');
                                    if (num.startsWith('+91')) num = num.slice(3);
                                    else if (num.startsWith('91') && num.length > 10) num = num.slice(2);
                                    else if (num.startsWith('0') && num.length > 10) num = num.slice(1);
                                    if (num.length >= 10) {
                                        foundNum = num;
                                        break;
                                    }
                                }
                            }
                        }
                        if (foundNum) {
                            setAcPhone(foundNum);
                            showToast(t.contactImported || '✅ Contact imported successfully!');
                        } else {
                            showToast(t.noValidPhoneFound || '⚠️ Contact selected, but no valid phone number found.');
                        }
                    }
                } catch(e) {
                    showToast(t.pickerFailed || '⚠️ Web contact picker failed or cancelled.');
                }
            } else {
                showToast(t.notSupported || '⚠️ Auto-contact is not supported in your browser.');
            }
        } catch (e: any) {
            showToast(t.error + ': ' + e.message);
        }
    };



    const saveCustomer = () => {
        const limit = parseFloat(acLimit) || 0;
        const opening = parseFloat(acOpening) || 0;
        if (!acName.trim()) { showToast(t.nameRequired || '⚠️ Naam zaroori hai!'); return; }

        if (editCustId) {
            setCustomers(customers.map(c => c.id === editCustId ? { ...c, name: acName.trim(), phone: acPhone.trim() || '', type: acType, limit, balance: opening } : c));
            setEditCustId(null);
            showToast(t.custUpdated || '✅ Customer update ho gaya!');
        } else {
            const nc = { id: Date.now(), name: acName.trim(), phone: acPhone.trim() || '', type: acType, limit, balance: opening, txns: [] };
            setCustomers([{ ...nc }, ...customers]);
            showToast(t.custAdded || '✅ Customer add ho gaya!');
        }
        setIsAddCustOpen(false);
        setAcName(''); setAcPhone(''); setAcLimit(''); setAcOpening('');
    };

    const deleteCustomer = async () => {
        if (!currentCust) return;
        if (!window.confirm(`${t.confirmDeleteCust || 'Kya aap sach mein delete karna chahte hain? Unka poora hisaab hamesha ke liye delete ho jayega.'}`)) return;

        try {
            if (session?.user?.id) {
                await fetch('/api/hisaab/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ custId: curCid })
                });
            }
        } catch (e) {
            console.error('Failed to delete from server', e);
        }

        setCustomers(customers.filter(c => String(c.id) !== String(curCid)));
        handleBack();
        showToast(`🗑 ${currentCust.name} ${t.deleted || 'delete ho gaye!'}`);
    };

    // Excel Export Handlers
    const downloadAllExcel = async () => {
        showToast(t.excelGenerating || '⏳ All Excel ban raha hai...');
        try {
            let csv = "Customer Name,Phone,Type,Total Given (Debit),Total Received (Credit),Net Balance\n";
            customers.forEach(c => {
                let cr = 0, db = 0;
                (c.txns || []).forEach((t: any) => { if (t.type === 'credit') cr += t.amt; else db += t.amt; });
                csv += `"${c.name}",${c.phone},${c.type},${db},${cr},${Math.abs(c.balance)} ${c.balance < 0 ? 'Dena' : 'Lena'}\n`;
            });
            const fileName = `All_Hisaab_${new Date().toISOString().split('T')[0]}.csv`;
            const base64Data = btoa(unescape(encodeURIComponent(csv)));
            
            const { downloadAndShareFile } = await import('@/lib/utils');
            await downloadAndShareFile(base64Data, fileName, 'text/csv');
            showToast(t.excelDownloaded || '✅ Excel Downloaded/Shared!');
        } catch (e: any) {
            showToast(t.error + ': ' + (e.message || 'Unknown'));
        }
    };

    const downloadCustomerExcel = async () => {
        if (!currentCust) return;
        showToast(t.excelGenerating || '⏳ Customer Excel ban raha hai...');
        try {
            let csv = "Date,Description,Type,Credit (Received),Debit (Given)\n";
            const sortedTxns = [...currentCust.txns].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

            sortedTxns.forEach(t => {
                const isCr = t.type === 'credit';
                const crAmt = isCr ? t.amt : 0;
                const dbAmt = !isCr ? t.amt : 0;
                const date = new Date(t.date).toLocaleDateString();
                csv += `${date},"${t.name || t.type}",${t.type},${crAmt},${dbAmt}\n`;
            });

            const fileName = `${currentCust.name}_Hisaab_${new Date().toISOString().split('T')[0]}.csv`;
            const base64Data = btoa(unescape(encodeURIComponent(csv)));
            
            const { downloadAndShareFile } = await import('@/lib/utils');
            await downloadAndShareFile(base64Data, fileName, 'text/csv');
            showToast(t.excelDownloaded || '✅ Excel Downloaded/Shared!');
        } catch (e: any) {
            showToast(t.error + ': ' + (e.message || 'Unknown'));
        }
    };

    const handleCustPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async ev => {
            const url = ev.target?.result as string;
            if (url) {
                const compressedUrl = await compressImage(url);
                setCustomers(prev => prev.map(c => String(c.id) === String(curCid) ? { ...c, photo: compressedUrl } : c));
                showToast(t.profilePhotoUpdated || '📸 Profile photo lag gayi!');
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
        showToast(t.photoLoading || '⏳ Photo load ho rahi hai...');
        const targetInput = e.target;

        files.forEach(f => {
            const reader = new FileReader();
            reader.onload = async ev => {
                const url = ev.target?.result as string;
                if (!url) return;
                try {
                    const compressedUrl = await compressImage(url);
                    setCustomers(prev => prev.map(c => {
                        if (String(c.id) !== String(curCid)) return c;
                        return {
                            ...c,
                            txns: c.txns.map((t: any) => String(t.id) === String(txnId) ? { ...t, photos: [...(t.photos || []), compressedUrl] } : t)
                        };
                    }));
                    showToast(t.photoAdded || '📸 Photo add ho gaya!');
                } catch (err) {
                    console.error(err);
                    showToast(t.photoProcessError || '❌ Photo process me error');
                }
            };
            reader.onerror = () => {
                showToast(t.photoReadError || '❌ Photo read karne mein error');
            };
            try {
                reader.readAsDataURL(f);
            } catch (err) {
                showToast(t.photoSelectError || '❌ Photo select karne me error');
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
            <style>{`
                @keyframes spin3d {
                    100% { transform: rotate(360deg); }
                }
                @keyframes text3d {
                    0%, 100% { text-shadow: 0px 1px 0px #cbd5e1, 0px 2px 0px #94a3b8, 0px 3px 0px #64748b, 0px 4px 4px rgba(0,0,0,0.25); transform: translateY(0); }
                    50% { text-shadow: 0px 1px 0px #cbd5e1, 0px 2px 2px rgba(0,0,0,0.15); transform: translateY(3px); }
                }
                .animated-border-3d {
                    position: relative;
                    border-radius: 12px;
                    padding: 5px 20px;
                    overflow: hidden;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1), inset 0 2px 5px rgba(255,255,255,0.4);
                    background: var(--bg);
                }
                .animated-border-3d::before {
                    content: '';
                    position: absolute;
                    width: 300%;
                    height: 300%;
                    background: conic-gradient(transparent, transparent, transparent, #3b82f6, #8b5cf6, transparent 40%);
                    animation: spin3d 2s linear infinite;
                    z-index: 0;
                }
                .animated-border-3d::after {
                    content: '';
                    position: absolute;
                    inset: 3px;
                    background: var(--white);
                    border-radius: 9px;
                    z-index: 1;
                }
                .animated-text-3d {
                    position: relative;
                    z-index: 2;
                    font-size: 16px;
                    font-weight: 900;
                    color: #3b82f6;
                    animation: text3d 2s ease-in-out infinite;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                }
            `}</style>
            {/* ════════ SCREEN 1: LIST ════════ */}
            <div className={`screen ${activeScreen === 'list' ? 'active' : ''}`} id="screen-list">
                <div className="topbar" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="tb-brand" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <div className="animated-border-3d">
                            <div className="animated-text-3d">{t.expenses || 'EXPENSES'}</div>
                        </div>
                    </div>
                </div>



                <div className="kpi-strip">
                    <div className="kpi-item">
                        <div className="kpi-val" style={{ color: 'var(--green)' }}>{fmt(totalStats.received)}</div>
                        <div className="kpi-lbl">{t.totalToReceive || 'Total To Receive'}</div>
                    </div>
                    <div className="kpi-item">
                        <div className="kpi-val" style={{ color: 'var(--red)' }}>{fmt(totalStats.given)}</div>
                        <div className="kpi-lbl">{t.totalToPay || 'Total To Pay'}</div>
                    </div>
                    <div className="kpi-item">
                        <div className="kpi-val" style={{ color: 'var(--amber)' }}>{fmt(Math.abs(totalStats.net))}</div>
                        <div className="kpi-lbl">{t.net || 'Net'} {totalStats.net >= 0 ? (t.toReceive || 'To Receive') : (t.toPay || 'To Pay')}</div>
                    </div>
                </div>


                {!hideAlerts && criticalDues.length > 0 && (
                    <div className="alerts-container">
                        <div className="alerts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🚨 {criticalDues.length} {t.pendingPayments || 'Pending Payments'}</span>
                            <button onClick={() => setHideAlerts(true)} style={{ background: 'none', border: 'none', color: 'var(--ink4)', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
                        </div>
                        <div className="alerts-scroll">
                            {criticalDues.slice(0, 3).map((c: any) => (
                                <div key={c.id} className="alert-card-mini">
                                    <div className="acm-info">
                                        <div className="acm-name">{c.name}</div>
                                        <div className="acm-amt">{fmt(Math.abs(c.balance))} • {c.dueDays} {t.daysOld || 'days old'}</div>
                                    </div>
                                    <button className="acm-btn" onClick={() => sendWhatsAppRemind(c, c.balance)}>
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.116 1.523 5.845L.057 23.057l5.33-1.397A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
                                        {t.remind || 'Remind'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="search-row">
                    <div className="search-box">
                        <span style={{ fontSize: '16px', color: 'var(--text3)' }}>🔍</span>
                        <input type="text" placeholder={t.searchCustomer || "Customer dhundho..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <div className="cust-list">
                    {isLoadingData ? (
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid var(--border)', borderTop: '3px solid var(--ink)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text3)', fontWeight: 600 }}>{t.loadingData || 'Loading data...'}</div>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : !displayList.length ? (
                        <div className="empty-state">
                            <div className="empty-ico">🔍</div>
                            <div className="empty-title">{t.noCustomerFound || 'Koi customer nahi mila'}</div>
                            <div className="empty-sub">{t.changeSearch || 'Search change karo'}</div>
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
                                    <div className="cust-item" key={c.id} onClick={() => isBulkMode ? toggleBulkSelect(c.id) : handleOpenDetail(c.id)} style={{ border: isBulkMode && bulkSelected.has(c.id) ? '2px solid #10b981' : '2px solid transparent', transition: 'all 0.2s' }}>
                                        <div className="cust-av" style={{ background: isBulkMode ? (bulkSelected.has(c.id) ? '#10b981' : '#e5e7eb') : (c.photo ? 'transparent' : getColor(c.name)) }}>
                                            {isBulkMode ? (
                                                bulkSelected.has(c.id) ? <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="20" height="20"><polyline points="20 6 9 17 4 12" /></svg> : null
                                            ) : (
                                                c.photo ? <img src={c.photo} style={{ width: '100%', height: '100%', borderRadius: '13px', objectFit: 'cover' }} alt="" /> : initials(c.name)
                                            )}
                                        </div>
                                        <div className="cust-mid">
                                            <div className="cust-name">{c.name}</div>
                                            <div className="cust-meta">
                                                <span className="cust-tag">{c.txns.length} {t.entryText || 'entry'}</span>
                                                <span className="cust-tag">{c.type}</span>
                                                <span className="cust-date">{lastDate}</span>
                                            </div>
                                        </div>
                                        <div className="cust-right">
                                            <div className="cust-amt" style={{ color: isNeg ? 'var(--red)' : 'var(--green)' }}>{fmtBal}</div>
                                            <div className={`cust-status ${isNeg ? 'status-dena' : 'status-lena'}`}>{isNeg ? (t.advanceToPay || 'Advance (To Pay)') : (t.dueToReceive || 'Due (To Receive)')}</div>
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>
                
                {isBulkMode ? (
                    bulkSelected.size > 0 && (
                        <button 
                            onClick={handleBulkRemind}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[240px] h-[55px] rounded-[20px] bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_10px_25px_rgba(16,185,129,.5)] text-white font-bold text-lg z-[150] cursor-pointer transition-all duration-300 hover:scale-105"
                        >
                            {t.sendReminders || 'Send Reminders'} 🚀
                        </button>
                    )
                ) : (
                    <button 
                        onClick={() => { setEditCustId(null); setAcName(''); setAcPhone(''); setAcLimit(''); setAcOpening(''); setIsAddCustOpen(true); }}
                        className="fixed bottom-8 right-6 sm:right-[calc(50%-230px)] w-[60px] h-[60px] rounded-[20px] bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_10px_25px_rgba(79,70,229,.5)] text-white z-[150] cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="32" height="32"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                )}
            </div>

            {/* ════════ SCREEN 2: DETAIL ════════ */}
            {currentCust ? (
                <div className={`screen ${activeScreen === 'detail' ? 'active' : ''}`} id="screen-detail">
                    <div className="topbar">

                        <div className="topbar-center">
                            <div className="topbar-name">{currentCust.name}</div>
                        </div>
                        <div className="topbar-actions">
                            <button className="icon-btn" onClick={() => openEditCust(currentCust)} title={t.editCust || "Edit Customer"}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button className="icon-btn" onClick={deleteCustomer} title={t.deleteCust || "Delete Customer"}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="detail-content-inner">
                        <div className="balance-banner" ref={bannerRef}>
                            <div className="balance-label">{t.totalBalanceDue || 'Total Balance Due'}</div>
                            <div className={`balance-amount ${custStats.isNeg ? '' : 'positive'}`}>
                                ₹{new Intl.NumberFormat('en-IN').format(Math.abs(custStats.net))}
                            </div>
                            <div className={`balance-status ${custStats.isNeg ? 'positive' : ''}`}>
                                <span className="balance-status-dot"></span>
                                {custStats.isNeg ? (t.advanceYouWillPay || 'Advance (You will pay)') : (t.dueYouWillGet || 'Due (You will get)')}
                            </div>
                            <div className="balance-stats">
                                <div className="bal-stat">
                                    <div className="bal-stat-label">{t.totalGiven || 'Total Given'}</div>
                                    <div className="bal-stat-val red">₹{new Intl.NumberFormat('en-IN').format(Math.abs(custStats.debit))}</div>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="bal-stat">
                                    <div className="bal-stat-label">{t.totalReceived || 'Total Received'}</div>
                                    <div className="bal-stat-val green">₹{new Intl.NumberFormat('en-IN').format(Math.abs(custStats.credit))}</div>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <button className="qa-btn statement" onClick={exportPDF}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                                {t.statement || 'Statement'}
                            </button>
                            <button className="qa-btn pdf" onClick={handleDownloadPDF}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8M16 17H8M10 9H8" /></svg>
                                PDF
                            </button>
                            <button className="qa-btn whatsapp" onClick={() => sendWhatsAppStatement(currentCust, custStats.net)}>
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.116 1.523 5.845L.057 23.057l5.33-1.397A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
                                {t.whatsapp || 'WhatsApp'}
                            </button>
                            <button className="qa-btn call" onClick={() => window.open(`tel:${currentCust.phone}`, '_self')}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v3z" /></svg>
                                {t.call || 'Call'}
                            </button>
                        </div>

                        {custStats.net < 0 && (
                            <div className="pending-status-box">
                                <div className="psb-icon">⏳</div>
                                <div className="psb-text">
                                    <strong>{fmt(Math.abs(custStats.net))}</strong> {t.isCurrentlyPending || 'is currently pending.'}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                                    <span>{t.lastPaymentWasOn || 'Last payment was on'} {formatDateShort(currentCust.txns[0]?.date || '')} {t.onDateText || '.'}</span>
                                </div>
                            </div>
                        )}

                        {currentCust.limit > 0 && custStats.net > currentCust.limit && (
                            <div className="pending-status-box" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', marginTop: '12px' }}>
                                <div className="psb-icon">⚠️</div>
                                <div className="psb-text">
                                    <strong style={{ color: '#dc2626' }}>Credit Limit Exceeded!</strong>
                                    <span style={{ color: '#b91c1c' }}>Aapne limit {fmt(currentCust.limit)} set ki thi, par udhaar {fmt(custStats.net)} ho gaya hai.</span>
                                </div>
                            </div>
                        )}

                        {currentCust.pending_txns && currentCust.pending_txns.length > 0 && (() => {
                            const currentTxnIds = new Set<string>((currentCust.txns || []).map((t: any) => String(t.id)));
                            const activePending = currentCust.pending_txns.filter((p: any) => !isDismissedOrHandled(p.id, currentTxnIds));
                            return activePending.map((ptxn: any) => (
                                <div key={ptxn.id} className="pending-status-box" style={{ background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="psb-icon" style={{ background: '#ffe8a1', color: '#856404' }}>🔔</div>
                                        <div className="psb-text">
                                            <strong style={{ color: '#856404' }}>Payment Pending Approval: {fmt(ptxn.amt)}</strong>
                                            <span style={{ color: '#664d03' }}>Customer confirmed payment via {ptxn.name} on {formatDateShort(ptxn.date)}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginLeft: '42px' }}>
                                        <button onClick={() => acceptPendingTxn(ptxn.id)} style={{ padding: '6px 12px', background: '#1B5E3B', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', flex: 1 }}>Accept & Save</button>
                                        <button onClick={() => rejectPendingTxn(ptxn.id)} style={{ padding: '6px 12px', background: 'transparent', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', flex: 1 }}>Reject</button>
                                    </div>
                                </div>
                            ));
                        })()}

                        <div className="filter-bar">
                            {[{ id: 'all', l: 'All' }, { id: 'debit', l: 'Given' }, { id: 'credit', l: 'Received' }, { id: 'advance', l: 'Advance' }].map(f => (
                                <button key={f.id} className={`filter-chip ${currentFilter === f.id ? 'active' : ''}`} onClick={() => setCurrentFilter(f.id)}>{f.l}</button>
                            ))}
                            <button className="sort-btn filter-right" onClick={() => setTxnSortAsc(!txnSortAsc)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M9 18h6" /></svg>
                                Sort
                            </button>
                        </div>

                        <div className="chat-txn-list">
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
                                    return (
                                        <React.Fragment key={date}>
                                            <div className="chat-date-pill">
                                                {formatDateShort(date)}
                                            </div>
                                            {dayTxns.map((t: any, i: number) => {
                                                const isCr = t.type === 'credit';
                                                const typeClass = isCr ? 'received' : 'given'; 
                                                const hasPhotos = t.photos && t.photos.length > 0;

                                                return (
                                                    <div className={`chat-bubble-wrapper ${typeClass}`} key={t.id} style={{ animationDelay: `${i * 0.04}s` }}>
                                                        <div className={`chat-bubble ${typeClass}`}>
                                                            <div className="chat-amount-row">
                                                                <span className={`chat-arrow ${typeClass}`}>{isCr ? '↓' : '↑'}</span>
                                                                <span className="chat-amount">₹{new Intl.NumberFormat('en-IN').format(t.amt)}</span>
                                                                <span className="chat-time">
                                                                    {formatTime(t.date)}
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width: '10px', height: '10px'}}><path d="M20 6L9 17l-5-5"/></svg>
                                                                </span>
                                                            </div>
                                                            <div className="chat-note">
                                                                {t.category && <span style={{ fontSize: '10px', background: 'var(--bg2)', padding: '2px 6px', borderRadius: '4px', marginRight: '6px', fontWeight: 700, border: '1px solid var(--border)' }}>{t.category.toUpperCase()}</span>}
                                                                {t.dueDate && t.type !== 'credit' && (
                                                                    <span className={`due-date-pill ${new Date(t.dueDate) < new Date() ? 'overdue' : ''}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                                                        ⌛ Due: {formatDateShort(t.dueDate)}
                                                                    </span>
                                                                )}
                                                                {t.note || t.name}
                                                            </div>
                                                            {hasPhotos && (
                                                                <div style={{ marginTop: '8px' }}>
                                                                    <img src={t.photos[0]} onClick={() => setLightboxImg(t.photos[0])} alt="Bill" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer', border: '1px solid var(--border)' }} />
                                                                </div>
                                                            )}
                                                            
                                                            <div className="chat-bubble-actions">
                                                                <button className="chat-action-icon edit" onClick={() => openEditEntry(t)} title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                                                <button className="chat-action-icon delete" onClick={() => deleteTxn(t.id, t.amt, t.type)} title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"></path></svg></button>
                                                                {!hasPhotos && (
                                                                    <label htmlFor={`chat-cam-${t.id}`} className="chat-action-icon" style={{ cursor: 'pointer', color: 'var(--blue)' }}>
                                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                                                        <input type="file" style={{ display: 'none' }} id={`chat-cam-${t.id}`} accept="image/*" multiple onChange={(e) => handleTxnPhoto(e, t.id)} />
                                                                    </label>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="chat-balance" style={{ alignSelf: isCr ? 'flex-start' : 'flex-end', marginLeft: isCr ? '4px' : '0', marginRight: isCr ? '0' : '4px' }}>
                                                            {fmt(Math.abs(t.runningBal))} {t.runningBal < 0 ? 'Advance' : 'Due'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                });
                            })()}


                            <div className="spacer" style={{ height: '100px' }}></div>
                            
                            {/* Floating Balance Indicator above bottom bar */}
                            {isDetailScrolled && !isAddEntryOpen && (
                                <div className="fixed left-0 w-full flex justify-center z-[110] animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-none" style={{ bottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
                                    <div className={`px-8 py-3 rounded-full text-[14px] font-black shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-[2px] bg-white/95 backdrop-blur-md tracking-wide ${custStats.isNeg ? 'text-emerald-600 border-emerald-200 shadow-emerald-500/20' : 'text-red-600 border-red-200 shadow-red-500/20'}`}>
                                        Total {custStats.isNeg ? 'Advance' : 'Due'}: {fmt(Math.abs(custStats.net))}
                                    </div>
                                </div>
                            )}

                            <div className="chat-action-bar" style={{ display: isAddEntryOpen ? 'none' : 'flex' }}>
                                <button className="chat-btn received" onClick={() => openNumpad('credit')}>
                                    ↓ Received
                                </button>
                                <button className="chat-btn given" onClick={() => openNumpad('debit')}>
                                    ↑ Given
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className="spacer"></div>
                    
                    <input type="file" accept="image/*" capture="environment" className="hidden" ref={expenseFileInputCameraRef} onChange={handleExpenseAiScan} />
                    <input type="file" accept="image/*" className="hidden" ref={expenseFileInputGalleryRef} onChange={handleExpenseAiScan} />

                    {attachMenuType && (
                        <div className="kb-entry-overlay" style={{ zIndex: 10000, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }} onClick={() => setAttachMenuType(null)}>
                            <div className="action-sheet" style={{ width: '100%', maxWidth: '400px', background: 'white', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={e => e.stopPropagation()}>
                                <div style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '8px', textAlign: 'center' }}>
                                    {attachMenuType === 'ai' ? 'AI Auto-Fill' : 'Attach Bill'}
                                </div>
                                <button onClick={() => {
                                    if (attachMenuType === 'ai') expenseFileInputCameraRef.current?.click();
                                    else document.getElementById('billFileCameraNew')?.click();
                                    setAttachMenuType(null);
                                }} style={{ width: '100%', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '16px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <span>📸</span> Take Photo
                                </button>
                                <button onClick={() => {
                                    if (attachMenuType === 'ai') expenseFileInputGalleryRef.current?.click();
                                    else document.getElementById('billFileGalleryNew')?.click();
                                    setAttachMenuType(null);
                                }} style={{ width: '100%', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '16px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <span>🖼️</span> Choose from Gallery
                                </button>
                                <button onClick={() => setAttachMenuType(null)} style={{ width: '100%', padding: '16px', background: 'transparent', border: 'none', fontSize: '16px', fontWeight: 600, color: '#ef4444', marginTop: '8px' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {isExpenseScanning && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'relative', width: '112px', height: '144px', background: '#1e293b', borderRadius: '12px', marginBottom: '32px', overflow: 'hidden', border: '1px solid #334155' }}>
                                <div style={{ position: 'absolute', inset: 0, height: '4px', background: '#34d399', boxShadow: '0 0 15px 3px rgba(52,211,153,0.5)', zIndex: 10, animation: 'heroScan 2.5s linear infinite' }} />
                                <div style={{ position: 'absolute', inset: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ height: '6px', background: '#475569', borderRadius: '4px', width: '75%' }} />
                                    <div style={{ height: '6px', background: '#475569', borderRadius: '4px', width: '100%' }} />
                                    <div style={{ height: '6px', background: '#475569', borderRadius: '4px', width: '83%' }} />
                                </div>
                            </div>
                            <h2 style={{ fontSize: '20px', fontFamily: 'Syne, sans-serif', fontWeight: 'bold', color: '#34d399', marginBottom: '8px' }}>Extracting Details...</h2>
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Please wait while Vision AI reads your bill</p>
                        </div>
                    )}

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

            {isAddEntryOpen && (
                <div className="kb-entry-overlay">
                    <div className="kb-entry-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px', padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <button className="kb-back-btn" onClick={closeNumpad} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                            </button>
                            <div className={`kb-title ${entryType === 'debit' ? 'red' : entryType === 'credit' ? 'green' : 'blue'}`} style={{ flex: 1, textAlign: 'center', margin: '0 8px', fontSize: '15px' }}>
                                {entryType === 'debit' ? `You gave ₹ ${amtInp || '0'} to ${currentCust?.name || ''}` : 
                                 entryType === 'credit' ? `You got ₹ ${amtInp || '0'} from ${currentCust?.name || ''}` : 
                                 `Advance ₹ ${amtInp || '0'} to ${currentCust?.name || ''}`}
                            </div>
                            <div style={{ width: '24px' }}></div>
                        </div>
                        {currentCust && (
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', backgroundColor: custStats.isNeg ? '#d1fae5' : '#fee2e2', color: custStats.isNeg ? '#059669' : '#dc2626' }}>
                                    {custStats.isNeg ? 'Advance: ' : 'Pending: '} {fmt(Math.abs(custStats.net))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="kb-entry-body">
                        <div className="kb-card">
                            <span className={`kb-currency ${entryType === 'debit' ? 'red' : 'green'}`}>₹</span>
                            <input 
                                type="text" 
                                inputMode="decimal"
                                value={amtInp}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                    if ((val.match(/\./g) || []).length <= 1) {
                                        setAmtInp(val);
                                    }
                                }}
                                placeholder="0"
                                className={`kb-amt-input ${entryType === 'debit' ? 'red' : 'green'}`}
                                autoFocus
                                autoComplete="off"
                            />
                        </div>

                        <div className="kb-card kb-no-pad" style={{ display: 'flex', alignItems: 'center' }}>
                            <input 
                                type="text" 
                                placeholder="Enter details (Items, bill no., quantity)" 
                                value={entryNote} 
                                onChange={e => setEntryNote(e.target.value)} 
                                className="kb-note-input"
                                style={{ flex: 1 }}
                            />
                            <div style={{ borderLeft: '1px solid #e2e8f0', padding: '0 12px', display: 'flex', alignItems: 'center' }}>
                                <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#475569', fontWeight: 600, maxWidth: '110px' }} />
                            </div>
                        </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <input type="file" id="billFileCameraNew" accept="image/*" capture="environment" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} />
                                <input type="file" id="billFileGalleryNew" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} />
                                
                                <button onClick={() => setAttachMenuType('normal')} className="kb-card kb-attach-card" style={{ flex: 1, padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '20px' }}>📎</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Attach Bill</span>
                                </button>
                                <button onClick={() => setAttachMenuType('ai')} className="kb-card kb-attach-card" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)', border: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                                    <span style={{ fontSize: '13px', fontWeight: 600 }}>AI Auto-Fill</span>
                                </button>
                            </div>

                        {pendingPhotos.length > 0 && (
                            <div className="kb-photos-preview">
                                {pendingPhotos.map((p, i) => (
                                    <div key={i} className="kb-photo-item">
                                        <img src={p} alt={`Attachment ${i}`} />
                                        <div onClick={(e) => { e.stopPropagation(); removePendingPhoto(i); }} className="kb-photo-remove">×</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="kb-entry-footer">
                        {currentCust?.phone && (
                            <div className="kb-whatsapp-toggle" onClick={() => setAutoWhatsApp(!autoWhatsApp)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg viewBox="0 0 24 24" fill="#25D366" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Share on WhatsApp</span>
                                </div>
                                <div className={`kb-toggle ${autoWhatsApp ? 'on' : 'off'}`}>
                                    <div className="kb-toggle-knob"></div>
                                </div>
                            </div>
                        )}
                        <div className="kb-footer-btns">
                            <button className="kb-save-btn blue" onClick={() => { saveEntry(); closeNumpad(); }}>
                                SAVE
                            </button>
                            {editTxnId ? (
                                <button className="kb-cancel-btn" style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }} onClick={() => { 
                                    const txn = currentCust?.txns?.find((t:any) => t.id === editTxnId);
                                    if(txn) {
                                        deleteTxn(txn.id, txn.amt, txn.type);
                                        closeNumpad();
                                    }
                                }}>
                                    DELETE
                                </button>
                            ) : (
                                <button className="kb-cancel-btn" onClick={closeNumpad}>
                                    CANCEL
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Customer Sheet */}
            <div className={`sheet-overlay ${isAddCustOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setIsAddCustOpen(false); }}>
                <div className="sheet">
                    <div className="sheet-handle"></div>
                    <div className="sheet-hdr">
                        <div className="sheet-title">👤 {editCustId ? 'Edit Customer' : 'New Customer'}</div>
                        <div className="sheet-close" onClick={() => setIsAddCustOpen(false)}>✕</div>
                    </div>
                    <div className="add-cust-body">
                        <button type="button" onClick={(e) => { e.preventDefault(); importContact(); }} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 600, fontSize: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)' }}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            Import from Contacts
                        </button>

                        <div className="fg"><label className="fl">👤 Customer Name *</label><input className="fi" placeholder="e.g. Rahul Sharma" value={acName} onChange={e => setAcName(e.target.value)} /></div>
                        <div className="fg">
                            <label className="fl">📞 Phone Number</label>
                            <input className="fi" type="tel" placeholder="e.g. 98765 44444 (optional)" value={acPhone} onChange={e => setAcPhone(e.target.value)} />
                        </div>
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
                            <span>💾</span> {editCustId ? 'Save Changes' : 'Save New Customer'}
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
