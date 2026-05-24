'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
    FaPlus, FaTrash, FaSave, FaArrowLeft, FaMicrophone, FaMagic,
    FaRobot, FaCheck, FaTimes, FaCamera, FaUserPlus, FaFileInvoice,
    FaBox, FaTruck, FaReceipt, FaRoad, FaCogs, FaChevronLeft
} from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { translations } from '@/lib/translations';
import RegistrationPopup from '@/app/dashboard/RegistrationPopup';
import LoginPrompt from '@/app/components/LoginPrompt';
import { useSession } from 'next-auth/react';
import { calculateInvoiceTotal } from '@/lib/gst-calculator';
import { DOC_TYPES, DOC_LABELS } from '@/lib/constants';
import Tesseract from 'tesseract.js';
import { generateInvoicePDF } from '@/lib/pdf-generator';

// Proper UUID v4 generator
function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default function NewInvoicePage() {
    const router = useRouter();
    const { data: session } = useSession();

    // Store Selectors
    const customers = useStore((state: any) => state.customers) || [];
    const products = useStore((state: any) => state.products) || [];
    const addInvoice = useStore((state: any) => state.addInvoice);
    const addCustomer = useStore((state: any) => state.addCustomer);
    const settings = useStore((state: any) => state.settings) || { language: 'en' };
    const quotations = useStore((state: any) => state.quotations) || [];
    const fetchQuotations = useStore((state: any) => state.fetchQuotations);
    const fetchProducts = useStore((state: any) => state.fetchProducts);
    const fetchCustomers = useStore((state: any) => state.fetchCustomers);
    const fetchInvoices = useStore((state: any) => state.fetchInvoices);
    const businessProfile = useStore((state: any) => state.businessProfile) || {};
    const invoices = useStore((state: any) => state.invoices) || [];

    const [isClient, setIsClient] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const t = translations[settings.language as keyof typeof translations] || translations.en;

    // Form State
    const [customerId, setCustomerId] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [notes, setNotes] = useState('');
    const [docType, setDocType] = useState<string>(DOC_TYPES.TAX_INVOICE);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [discountPct, setDiscountPct] = useState(0);
    const [extraCharge, setExtraCharge] = useState(0);
    const [shippingCharge, setShippingCharge] = useState(0);

    // Dynamic Options State
    const [options, setOptions] = useState({
        showGstBreakup: true,
        whatsappShare: false,
        eInvoice: false,
        emailInvoice: false,
        recurring: false
    });

    // UI States
    const [isListening, setIsListening] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [quickSearch, setQuickSearch] = useState('');
    const [quickQty, setQuickQty] = useState(1);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [activeStep, setActiveStep] = useState(2); // Default to Items step as per design

    // New Customer State
    const [newCustName, setNewCustName] = useState('');
    const [newCustPhone, setNewCustPhone] = useState('');
    const [newCustGstin, setNewCustGstin] = useState('');
    const [newCustAddress, setNewCustAddress] = useState('');
    const [newCustEmail, setNewCustEmail] = useState('');
    const [newCustType, setNewCustType] = useState('Grahak');
    const [newCustState, setNewCustState] = useState('Rajasthan');
    const [newCustLimit, setNewCustLimit] = useState('');
    const [newCustOb, setNewCustOb] = useState('');
    const [showCreditLimit, setShowCreditLimit] = useState(false);

    // Compliance State
    const [ewayBill, setEwayBill] = useState({
        no: '',
        date: '',
        mode: 'Road',
        distance: '',
        transporterName: '',
        transporterId: '',
        vehicleNo: ''
    });
    const [eInvoice, setEInvoice] = useState({
        qrCode: ''
    });
    const [isInterState, setIsInterState] = useState(false);

    // Reference
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Safe Data
    const safeCustomers = (Array.isArray(customers) ? customers : []).filter((c: any) => c?.id && c?.name);
    const safeProducts = (Array.isArray(products) ? products : []).filter((p: any) => p?.id && p?.name && p?.status !== 'INACTIVE');

    useEffect(() => {
        setIsClient(true);
        if (fetchProducts) fetchProducts();
        if (fetchCustomers) fetchCustomers();
        if (fetchInvoices) fetchInvoices();

        const today = new Date().toISOString().split('T')[0];
        setInvoiceDate(today);
        setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`);

        const due = new Date();
        due.setDate(due.getDate() + 30);
        setDueDate(due.toISOString().split('T')[0]);

        // Parameters handling
        const params = new URLSearchParams(window.location.search);
        const duplicateId = params.get('duplicateId');
        const quotationId = params.get('quotationId');
        const typeParam = params.get('type');

        if (typeParam && Object.values(DOC_TYPES).includes(typeParam)) {
            setDocType(typeParam);
        }

        if (duplicateId && !isDuplicating) {
            const invoices = useStore.getState().invoices || [];
            const sourceInvoice = invoices.find((inv: any) => inv.id === duplicateId);
            if (sourceInvoice) {
                setIsDuplicating(true);
                setCustomerId(sourceInvoice.customer_id || '');
                setPaidAmount(sourceInvoice.paid_amount?.toString() || '');
                setNotes(sourceInvoice.notes || '');
                setSelectedItems((sourceInvoice.items || []).map((item: any) => ({
                    ...item,
                    product_id: item.product_id || '',
                    product_name: item.product_name || 'Unnamed Item',
                    quantity: item.quantity || 1,
                    unit_price: item.unit_price || 0,
                    gst_rate: item.gst_rate ?? 18,
                    hsn_code: item.hsn_code || '',
                    unit: item.unit || 'PCS'
                })));
                toast.success('Pre-filled from previous bill');
            }
        } else if (quotationId && !isDuplicating) {
            if (quotations.length === 0) fetchQuotations();
            const sourceQuotation = quotations.find((q: any) => q.id === quotationId);
            if (sourceQuotation) {
                setIsDuplicating(true);
                setCustomerId(sourceQuotation.customer_id || '');
                setNewCustName(sourceQuotation.customer_name || '');
                setNewCustPhone(sourceQuotation.phone || '');
                setNewCustAddress(sourceQuotation.address || '');
                setNotes(sourceQuotation.notes || sourceQuotation.terms || '');
                setSelectedItems((sourceQuotation.items || []).map((item: any) => ({
                    ...item,
                    product_id: item.product_id || '',
                    product_name: item.product_name || item.product || 'Unnamed Item',
                    quantity: item.quantity || 1,
                    unit_price: item.unit_price || item.rate || 0,
                    gst_rate: item.gst_rate ?? 18,
                    hsn_code: item.hsn_code || '',
                    unit: item.unit || 'PCS'
                })));
                toast.success('Pre-filled from quotation');
            }
        } else if (businessProfile?.terms_and_conditions && !notes) {
            setNotes(businessProfile.terms_and_conditions);
        }

        // Add 1 empty row if none
        if (selectedItems.length === 0) addItem();
    }, [isDuplicating, quotations, businessProfile]);

    // Totals Calculation
    const calculateTotals = () => {
        const isInclusive = settings.taxType === 'INCLUSIVE';
        const breakdown = calculateInvoiceTotal(selectedItems, isInterState, isInclusive);
        const subtotal = breakdown.subtotal;
        const discountAmt = subtotal * (discountPct / 100);
        const grandTotal = breakdown.total_amount - discountAmt + Number(extraCharge) + Number(shippingCharge);

        return { subtotal, gst: breakdown.cgst_amount + breakdown.sgst_amount + breakdown.igst_amount, discountAmt, grandTotal, breakdown };
    };

    const totals = calculateTotals();

    // Handlers
    const addItem = () => {
        setSelectedItems([...selectedItems, { product_id: '', product_name: '', quantity: 1, unit_price: 0, gst_rate: 18, hsn_code: '', unit: 'PCS' }]);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...selectedItems];
        if (field === 'product_id') {
            const product = safeProducts.find((p: any) => p.id === value);
            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    product_id: value,
                    product_name: product.name,
                    unit_price: product.price,
                    gst_rate: product.gst_rate || 18,
                    hsn_code: product.hsn_code || '',
                    unit: product.unit || 'PCS'
                };
            }
        } else {
            newItems[index][field] = value;
        }
        setSelectedItems(newItems);
    };

    const removeItem = (idx: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== idx));
    };

    const getCustomerBalance = (custId: string) => {
        if (!custId) return 0;
        const cust = safeCustomers.find(c => c.id === custId);
        if (!cust) return 0;
        
        let due = Number(cust.opening_balance) || 0;
        const custInvs = invoices.filter((inv: any) => (inv.customer?.id === custId || inv.customer_id === custId) && inv.status !== 'PAID');
        due += custInvs.reduce((sum: number, inv: any) => sum + ((Number(inv.total_amount) || 0) - (Number(inv.paid_amount) || 0)), 0);
        return due;
    };

    const startVoiceBilling = () => {
        if (typeof window === 'undefined') return;
        const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionClass) {
            toast.error('Voice billing browser support missing. Use Chrome / Edge on HTTPS and allow microphone access.');
            return;
        }

        if (isListening) return;

        try {
            const rec = new SpeechRecognitionClass();
            rec.lang = 'en-IN'; // Changed to en-IN so Hindi words are returned in English (Latin) script
            rec.continuous = false;
            rec.interimResults = false;
            rec.maxAlternatives = 10;

            rec.onstart = () => {
                setIsListening(true);
                toast.loading('🎙️ Listening... Bolye', { id: 'voice-toast' });
            };

            rec.onresult = (e: any) => {
                toast.dismiss('voice-toast');
                const results = e.results[0];
                const transcripts: string[] = [];
                for (let i = 0; i < results.length; i++) {
                    transcripts.push(results[i].transcript.toLowerCase().trim());
                }
                processVoiceTranscripts(transcripts);
            };

            rec.onerror = (e: any) => {
                setIsListening(false);
                rec.abort();
                toast.dismiss('voice-toast');
                if (e.error === 'network') toast.error('Internet check karein (Network Problem).');
                else if (e.error === 'no-speech') toast.error('Mic se koi awaaz nahi mili. Button dabayein aur turant bolen.');
                else if (e.error === 'not-allowed' || e.error === 'permission-denied') toast.error('Mic ki permission allow karein browser me.');
                else toast.error(`Voice error: ${e.error}`);
            };

            rec.onend = () => {
                setIsListening(false);
                toast.dismiss('voice-toast');
            };

            rec.start();
        } catch (err) {
            setIsListening(false);
            toast.error('Voice billing start nahi ho paayi. Browser ya mic access check karein.');
        }
    };

    const processVoiceTranscripts = async (transcripts: string[]) => {
        const storeProducts = (useStore.getState() as any).products || [];
        const liveProducts = storeProducts.filter((p: any) => p?.id && p?.name && p?.status !== 'INACTIVE');
        
        if (liveProducts.length === 0) return toast.error('Inventory khali hai. Pehle products add karein.');

        const heard = transcripts[0];
        toast.loading(`Samajh rahe hain: "${heard}"...`, { id: 'voice-parsing' });

        let parsedItems: any[] = [];
        let usedAI = true;

        try {
            // Try the advanced Gemini API first
            const res = await fetch('/api/ai/voice-billing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    transcript: heard,
                    products: liveProducts.map((p: any) => ({ id: p.id, name: p.name }))
                })
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error('Fallback');
            }

            const data = await res.json();
            if (!res.ok) throw new Error('Fallback');

            if (data.items && data.items.length > 0) {
                parsedItems = data.items;
            }
        } catch (err: any) {
            // OFFLINE SMART FALLBACK: If API Key is missing or quota exceeded
            usedAI = false;
            console.log("Using Offline Smart Fallback matching...");
            
            // Clean text and handle common hindi/english numbers
            let text = heard.toLowerCase()
                .replace(/ek/g, '1').replace(/do/g, '2').replace(/teen/g, '3')
                .replace(/chaar/g, '4').replace(/paanch/g, '5')
                .replace(/aur/g, 'and').replace(/, /g, ' and ');

            // Split by "and" to handle multiple items like "1 maggi and 2 soap"
            const segments = text.split(' and ');
            
            segments.forEach(segment => {
                let qty = 1;
                const numMatch = segment.match(/\d+/);
                if (numMatch) {
                    qty = parseInt(numMatch[0], 10);
                    segment = segment.replace(/\d+/g, '');
                }

                const cleanWord = segment.replace(/[^a-z0-9\s]/g, '').trim();
                if (!cleanWord || cleanWord.length < 2) return;

                let bestMatch: any = null;
                let maxScore = 0;

                liveProducts.forEach((p: any) => {
                    const pName = p.name.toLowerCase();
                    let score = 0;
                    
                    if (pName === cleanWord) score = 100;
                    else if (pName.startsWith(cleanWord) || cleanWord.startsWith(pName)) score = 80;
                    else if (pName.includes(cleanWord) || cleanWord.includes(pName)) score = 60;
                    else {
                        const words = cleanWord.split(' ');
                        words.forEach(w => {
                            if (w.length > 2 && pName.includes(w)) score += 30;
                        });
                    }

                    if (score > maxScore) {
                        maxScore = score;
                        bestMatch = p;
                    }
                });

                if (bestMatch && maxScore > 20) {
                    parsedItems.push({
                        id: bestMatch.id,
                        quantity: qty
                    });
                }
            });
        }

        if (parsedItems.length > 0) {
            let addedCount = 0;
            setSelectedItems((prev) => {
                const next = [...prev];
                
                parsedItems.forEach((aiItem: any) => {
                    const p = liveProducts.find((p: any) => p.id === aiItem.id);
                    if (p) {
                        addedCount++;
                        const qty = Number(aiItem.quantity) || 1;
                        const price = p.price || p.sale_price || p.unit_price || 0;
                        
                        const idx = next.findIndex(item => item.product_id === p.id);
                        if (idx > -1) {
                            next[idx].quantity = (Number(next[idx].quantity) || 0) + qty;
                        } else {
                            const emptyIdx = next.findIndex(item => !item.product_id);
                            const newItem = {
                                product_id: p.id,
                                product_name: p.name,
                                quantity: qty,
                                unit_price: price,
                                gst_rate: p.gst_rate || 18,
                                hsn_code: p.hsn_code || '',
                                unit: p.unit || 'PCS'
                            };
                            
                            if (emptyIdx > -1 && addedCount === 1) {
                                next[emptyIdx] = newItem;
                            } else {
                                next.push(newItem);
                            }
                        }
                    }
                });
                
                return next;
            });
            
            toast.dismiss('voice-parsing');
            toast.success(`✅ ${addedCount} Product(s) Add Ho Gaye! ${usedAI ? '' : '(Offline Mode)'}`);
        } else {
            toast.dismiss('voice-parsing');
            toast.error(`Suna: "${heard}", par koi item samajh nahi aaya.`);
        }
    };

    const handleMagicScan = () => fileInputRef.current?.click();
    
    const quickAddProduct = (name: string, qty: number) => {
        const prod = safeProducts.find((p: any) => p.name === name);
        if (prod) {
            const price = prod.price || prod.sale_price || prod.unit_price || 0;
            setSelectedItems(prev => {
                const idx = prev.findIndex(item => item.product_id === prod.id);
                if (idx > -1) {
                    const next = [...prev];
                    next[idx].quantity = (Number(next[idx].quantity) || 0) + qty;
                    return next;
                }
                return [...prev, {
                    product_id: prod.id,
                    product_name: prod.name,
                    quantity: qty,
                    unit_price: price,
                    gst_rate: prod.gst_rate || 18,
                    hsn_code: prod.hsn_code || '',
                    unit: prod.unit || 'PCS'
                }];
            });
            toast.success(`✅ ${prod.name} added`);
            setShowQuickAdd(false);
            setQuickSearch('');
        } else {
            toast.error('Product nahi mila inventory me');
        }
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsScanning(true);
        setScanProgress(0);
        try {
            const result = await Tesseract.recognize(file, 'eng', { logger: m => { if (m.status === 'recognizing text') setScanProgress(Math.floor(m.progress * 100)); } });
            // Logic to parse text and add items... (simplified for now)
            toast.success('Scan complete');
        } catch (err) {
            toast.error('Scan failed');
        } finally {
            setIsScanning(false);
        }
    };

    const handleAddCustomer = async () => {
        if (!newCustName || newCustName.length < 2) {
            return toast.error('Sahi Naam zaroori hai');
        }
        if (newCustPhone && newCustPhone.length !== 10) {
            return toast.error('Agar phone daala hai to sahi 10-digit number dalo');
        }
        try {
            const newCust = {
                id: generateId(),
                name: newCustName,
                phone: newCustPhone,
                gstin: newCustGstin,
                address: newCustAddress,
                email: newCustEmail,
                type: newCustType,
                state: newCustState,
                credit_limit: newCustLimit ? Number(newCustLimit) : 0,
                opening_balance: newCustOb ? Number(newCustOb) : 0,
                created_at: new Date().toISOString()
            };
            const result = await addCustomer(newCust);
            if (result) {
                setCustomerId(newCust.id);
                setShowCustomerModal(false);
                setNewCustName('');
                setNewCustPhone('');
                setNewCustGstin('');
                setNewCustAddress('');
                setNewCustEmail('');
                setNewCustLimit('');
                setNewCustOb('');
                toast.success(`✓ ${newCustName} save ho gaya!`);
            }
        } catch (e) {
            toast.error('Galti hui add karne me');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!session?.user) return setShowLoginPrompt(true);
        if (!customerId) return toast.error('Please select a customer');
        if (selectedItems.length === 0) return toast.error('Add at least one item');

        setIsSubmitting(true);
        try {
            const isInclusive = settings.taxType === 'INCLUSIVE';
            const customer = safeCustomers.find(c => c.id === customerId);
            const breakdown = calculateInvoiceTotal(selectedItems, isInterState, isInclusive);

            if (customer && customer.credit_limit > 0) {
                const storeInvs = (useStore.getState() as any).invoices || [];
                const pastDue = storeInvs
                    .filter((i: any) => (i.customer?.id === customer.id || i.customer_id === customer.id) && i.status !== 'PAID')
                    .reduce((sum: number, inv: any) => sum + (Number(inv.total_amount) - Number(inv.paid_amount)), 0);
                
                const newDue = totals.grandTotal - (parseFloat(paidAmount) || 0);
                const projectedBalance = pastDue + newDue + (Number(customer.opening_balance) || 0);
                
                if (projectedBalance > customer.credit_limit) {
                    if (!window.confirm(`⚠️ ALERT: ${customer.name} ki credit limit (₹${customer.credit_limit}) cross ho rahi hai!\n\nUnka total udhaar (Pichla baki + abhi ka) ₹${projectedBalance} ho jayega.\n\nKya aap phir bhi ye invoice save karna chahte hain?`)) {
                        setIsSubmitting(false);
                        return;
                    }
                }
            }

            const invoice = {
                id: generateId(),
                invoice_number: invoiceNumber,
                customer: {
                    id: customerId || 'CASH',
                    name: customer?.name || newCustName || 'Cash Sale',
                    gstin: customer?.gstin || '',
                    phone: customer?.phone || '',
                    address: customer?.address || ''
                },
                invoice_date: invoiceDate,
                due_date: dueDate,
                items: selectedItems,
                subtotal: totals.subtotal,
                cgst_amount: breakdown.cgst_amount,
                sgst_amount: breakdown.sgst_amount,
                igst_amount: breakdown.igst_amount,
                total_amount: totals.grandTotal,
                paid_amount: parseFloat(paidAmount) || 0,
                status: parseFloat(paidAmount) >= totals.grandTotal ? 'PAID' : (parseFloat(paidAmount) > 0 ? 'PARTIAL' : 'UNPAID'),
                notes,
                type: docType,
                payment_mode: paymentMode,
                discount_pct: discountPct,
                extra_charges: extraCharge,
                shipping_charges: shippingCharge
            };

            const result = await addInvoice(invoice);
            if (result?.success || result?.id) {
                toast.success('Invoice Saved!');

                // Handle WhatsApp Auto-share PDF Background
                if (options.whatsappShare) {
                    if (!customer?.phone) {
                        toast.error('Customer ka phone number missing hai, PDF auto-share cancel hua.');
                    } else {
                        toast.loading('Sharing PDF on WhatsApp...');
                        try {
                            const doc = await generateInvoicePDF(invoice, businessProfile, false);
                            if (doc) {
                                const pdfBlob = doc.output('blob');

                                const formData = new FormData();
                                formData.append('file', pdfBlob, `Invoice-${invoiceNumber}.pdf`);
                                formData.append('phone', customer.phone);
                                formData.append('message', `Namaste ${customer?.name}, aapka bill #${invoiceNumber} ready hai. Please find the attached PDF.`);

                                const sendRes = await fetch('/api/whatsapp/send-media', {
                                    method: 'POST',
                                    body: formData
                                });

                                if (sendRes.ok) {
                                    toast.dismiss();
                                    toast.success('PDF sent on WhatsApp! ✅');
                                } else {
                                    const errorText = await sendRes.text();
                                    console.error('API Error:', sendRes.status, errorText);
                                    throw new Error(`Failed to send: ${errorText}`);
                                }
                            } else {
                                throw new Error('PDF Generation Failed');
                            }
                        } catch (err: any) {
                            toast.dismiss();
                            console.error('Bot share failed:', err);
                            toast.error(`WhatsApp Bot fail: ${err.message || 'Make sure whatsapp-service.js is running and phone is correct.'}`);
                        }
                    }
                }

                if (result && result.id) {
                    router.push('/dashboard/invoices?new=' + result.id);
                } else {
                    router.push('/dashboard/invoices');
                }
            } else {
                toast.error('Failed to save invoice');
            }
        } catch (err) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isClient) return null;

    const selectedCustomer = safeCustomers.find(c => c.id === customerId);

    return (
        <div className="new-invoice-page text-slate-900">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
                :root {
                  --ink:#0d0f1c; --bg:#f0f2fa; --white:#fff; --border:#e4e7f4; --muted:#8892b0; --faint:#f7f8fd;
                  --indigo:#5b5ef4; --indigo2:#4340d4; --iglow:rgba(91,94,244,.15);
                  --violet:#8b5cf6; --green:#0fba81; --red:#f04e5e; --amber:#f5a623; --teal:#06b6d4;
                  --sh:0 4px 20px rgba(13,15,28,.08),0 1px 4px rgba(13,15,28,.04);
                  --sh-lg:0 12px 40px rgba(13,15,28,.13),0 2px 8px rgba(13,15,28,.06);
                }
                .new-invoice-page { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--ink); min-height: 100vh; }
                .page-hdr { background: linear-gradient(135deg,#0b0f1e,#1c2340,#1e3a5f); padding: 30px 40px; border-bottom: 1px solid rgba(255,255,255,.05); margin-bottom: 2rem; color: white; }
                .ph-title { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
                .ph-sub { font-size: 13px; color: rgba(255,255,255,.5); }
                .fbadge { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; }
                .fb-voice { background: linear-gradient(135deg,#7c3aed,#5b5ef4); color: #fff; }
                .fb-scan { background: linear-gradient(135deg,#f97316,#f59e0b); color: #fff; }
                .fb-ai { background: linear-gradient(135deg,#06b6d4,#0ea5e9); color: #fff; }
                .fbadge:hover { transform: translateY(-2px); filter: brightness(1.1); }
                .voice-note { line-height: 1.4; }
                
                .stepper { display: flex; align-items: center; gap: 10px; margin-top: 25px; }
                .step-item { display: flex; align-items: center; gap: 8px; opacity: 0.5; transition: 0.3s; }
                .step-item.active { opacity: 1; }
                .s-dot { width: 28px; height: 28px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; }
                .active .s-dot { background: var(--indigo); border: 2px solid white; }
                .done .s-dot { background: var(--green); }
                .s-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                .s-line { flex: 1; height: 1px; background: rgba(255,255,255,0.1); max-width: 60px; }

                .form-outer { padding: 0 40px 100px; display: grid; grid-template-columns: 1fr 350px; gap: 24px; }
                .card { background: var(--white); border-radius: 20px; padding: 24px; margin-bottom: 20px; box-shadow: var(--sh); border: 1px solid var(--border); }
                .c-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
                .c-icon { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
                
                .doc-tabs { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
                .dtab { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px; border-radius: 14px; border: 2px solid var(--border); background: var(--faint); cursor: pointer; transition: 0.2s; }
                .dtab.active { background: #eef2ff; border-color: var(--indigo); color: var(--indigo); font-weight: 700; }
                .dt-label { font-size: 10px; text-transform: uppercase; text-align: center; }
                
                .fg { margin-bottom: 20px; }
                .fl { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; display: block; }
                .fi { width: 100%; padding: 12px 16px; border: 2px solid var(--border); border-radius: 12px; font-size: 14px; transition: 0.2s; background: var(--faint); outline: none; color: #0f172a !important; }
                .fi:focus { border-color: var(--indigo); background: white; box-shadow: 0 0 0 4px var(--iglow); }
                
                .inv-pill { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                .ip-num { font-family: 'DM Mono', monospace; font-weight: 600; color: var(--indigo); }
                
                .new-btn { background: var(--green); color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 13px; }
                .cprev { background: #f0fdf9; border: 2px solid #a7f3d0; border-radius: 15px; padding: 15px; display: flex; align-items: center; gap: 15px; margin-top: 15px; }
                .c-av { width: 45px; height: 45px; border-radius: 12px; background: var(--green); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: white; }
                .c-bal { margin-left: auto; color: var(--red); font-weight: 800; font-size: 12px; background: #fee2e2; padding: 6px 12px; border-radius: 8px; }

                .item-card { background: var(--faint); border: 2px solid var(--border); border-radius: 16px; padding: 20px; position: relative; margin-bottom: 12px; }
                .i-num { width: 30px; height: 30px; background: var(--indigo); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; position: absolute; left: -10px; top: -10px; box-shadow: 0 4px 10px rgba(91,94,244,0.3); }
                .add-actions-wrapper { display: flex; flex-direction: column; gap: 14px; margin-top: 28px; padding: 0 4px; }
                .action-row { display: flex; gap: 14px; }
                .premium-add-btn { flex: 1; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 18px 12px; border-radius: 18px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none; z-index: 1; letter-spacing: -0.2px; }
                .premium-add-btn::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s ease; z-index: -1; }
                .premium-add-btn:hover { transform: translateY(-4px); }
                .premium-add-btn:active { transform: translateY(0); }
                .premium-add-btn svg { width: 18px; height: 18px; transition: transform 0.3s; }
                .premium-add-btn:hover svg { transform: scale(1.15) rotate(5deg); }
                .btn-manual { background: linear-gradient(135deg, #f8fafc, #f1f5f9); color: #3b82f6; border: 2px dashed #cbd5e1; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .btn-manual:hover { border-style: solid; border-color: #3b82f6; box-shadow: 0 8px 25px rgba(59,130,246,0.15); color: #2563eb; background: #eff6ff; }
                .btn-inventory { background: linear-gradient(135deg, #fffbeb, #fef3c7); color: #d97706; border: 2px solid #fde68a; box-shadow: 0 4px 15px rgba(217,119,6,0.05); }
                .btn-inventory:hover { border-color: #f59e0b; box-shadow: 0 8px 25px rgba(245,158,11,0.2); color: #b45309; background: #fef3c7; }
                .btn-voice { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; box-shadow: 0 8px 25px rgba(79,70,229,0.35); width: 100%; padding: 20px; font-size: 15px; }
                .btn-voice::before { background: linear-gradient(135deg, #4338ca, #6d28d9); }
                .btn-voice:hover { box-shadow: 0 12px 35px rgba(79,70,229,0.45); }
                .btn-voice:hover::before { opacity: 1; }
                .voice-pulse { animation: voicePulse 1.5s infinite; background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); border: none; width: 100%; padding: 20px; font-size: 15px; }
                @keyframes voicePulse { 0% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } 100% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

                .totals-box { background: linear-gradient(135deg,#0b0f1e,#1c2340,#2d2f6b); padding: 25px; border-radius: 20px; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
                .t-val { font-family: 'DM Mono', monospace; font-size: 18px; font-weight: 600; color: #a5b4fc; }
                .grand-total { font-size: 32px; font-weight: 900; color: white; display: block; margin-top: 10px; }
                
                .pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .p-mode { background: var(--faint); border: 2px solid var(--border); padding: 12px; border-radius: 12px; text-align: center; font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s; }
                .p-mode.active { border-color: var(--teal); background: #e0f9ff; color: #0891b2; }

                .bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); border-top: 1px solid var(--border); padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; z-index: 100; box-shadow: 0 -10px 40px rgba(0,0,0,0.05); }
                .bb-save { background: linear-gradient(135deg,var(--indigo),var(--violet)); color: white; padding: 16px 40px; border-radius: 15px; font-weight: 900; font-size: 16px; border: none; cursor: pointer; box-shadow: 0 10px 25px rgba(91,94,244,0.4); display: flex; align-items: center; gap: 12px; transition: 0.2s; }
                .bb-save:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(91,94,244,0.5); }

                /* Toggle Switch Styles */
                .oswitch { position: relative; display: inline-block; width: 38px; height: 20px; }
                .oswitch input { opacity: 0; width: 0; height: 0; }
                .oslider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e2e8f0; transition: .3s; border-radius: 20px; }
                .oslider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; shadow: 0 1px 3px rgba(0,0,0,0.1); }
                input:checked + .oslider { background-color: var(--indigo); }
                input:checked + .oslider:before { transform: translateX(18px); }
                .opt-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--faint); border-radius: 12px; margin-bottom: 8px; border: 1px solid var(--border); transition: 0.2s; }
                .opt-row:hover { border-color: var(--indigo); background: #fdfdff; }
                .opt-info { display: flex; flex-direction: column; }
                .opt-lbl { font-size: 11px; font-weight: 800; color: var(--ink); }
                .opt-sub { font-size: 9px; font-weight: 600; color: var(--muted); }

                /* Mobile Responsiveness Fixes */
                @media (max-width: 992px) {
                  .form-outer { grid-template-columns: 1fr; padding: 0 10px 100px; gap: 10px; }
                  .page-hdr { padding: 15px 10px; margin-bottom: 0.5rem; }
                  .ph-title { font-size: 18px; }
                  .ph-sub { font-size: 10px; }
                  .stepper { overflow-x: auto; padding-bottom: 10px; margin-top: 10px; }
                  .s-line { min-width: 20px; }
                  .card { padding: 12px; border-radius: 12px; margin-bottom: 10px; }
                  .c-title { margin-bottom: 12px; }
                  .bottom-bar { padding: 10px 15px; height: auto; flex-direction: row; justify-content: space-between; align-items: center; gap: 10px; }
                  .bb-save { justify-content: center; padding: 10px 20px; font-size: 13px; }
                  .doc-tabs { grid-template-columns: repeat(5, 1fr); gap: 5px; }
                  .dtab { padding: 8px 4px; }
                  .dt-icon { font-size: 14px; }
                  .dt-label { font-size: 8px; }
                  .item-card { padding: 10px; }
                  .i-num { left: 5px; top: -10px; }
                  .grand-total { font-size: 20px; }
                  .fbadge { padding: 6px 10px; font-size: 10px; flex: 1; justify-content: center; }
                  .fi { padding: 8px 10px; font-size: 12px; }
                  .fg { margin-bottom: 12px; }
                  .pay-grid { grid-template-columns: repeat(4, 1fr); gap: 5px; }
                  .p-mode { padding: 8px 4px; font-size: 10px; }
                }

                @media (max-width: 480px) {
                  .doc-tabs { grid-template-columns: repeat(5, 1fr); }
                  .pay-grid { grid-template-columns: repeat(4, 1fr); }
                  .inv-pill { padding: 10px; }
                  .ip-num { font-size: 11px; }
                }

                /* --- Quick Add Party Modal Styles --- */
                .qap-backdrop { position:fixed; inset:0; z-index:200; background:rgba(13,15,28,.45); backdrop-filter:blur(6px); display:flex; align-items:flex-end; justify-content:center; }
                .qap-sheet { position:relative; z-index:210; width:100%; max-width:480px; background:#fff; border-radius:28px 28px 0 0; box-shadow:0 20px 60px rgba(13,15,28,.18); overflow:hidden; animation:qapUp .35s cubic-bezier(.22,1,.36,1) both; max-height: 90vh; display: flex; flex-direction: column; }
                @keyframes qapUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
                .qap-header { position:relative; padding:24px 20px 20px; background:linear-gradient(135deg,#312e81 0%,#4f46e5 50%,#6d28d9 100%); overflow:hidden; flex-shrink: 0; }
                .qap-header::before { content:''; position:absolute; top:-60px; right:-40px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,0.07); }
                .qap-header::after { content:''; position:absolute; bottom:-40px; left:-20px; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,0.05); }
                .qap-handle { width:36px; height:4px; border-radius:2px; background:rgba(255,255,255,0.3); margin:0 auto 18px; }
                .qap-title-row { display:flex; align-items:flex-start; justify-content:space-between; position:relative; z-index:1; }
                .qap-icon-wrap { width:44px; height:44px; border-radius:13px; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .qap-icon-wrap svg { width:22px; height:22px; color:#fff; }
                .qap-titles { flex:1; margin-left:12px; }
                .qap-title { font-size:21px; font-weight:900; color:#fff; letter-spacing:-.4px; line-height:1.1; }
                .qap-sub { font-size:12px; color:rgba(255,255,255,.55); margin-top:4px; font-weight:600; }
                .qap-close { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; flex-shrink:0; margin-top:2px; }
                .qap-close:hover { background:rgba(255,255,255,0.22); }
                .qap-close svg { width:14px; height:14px; color:rgba(255,255,255,.8); }
                .qap-steps { display:flex; align-items:center; gap:6px; margin-top:16px; position:relative; z-index:1; }
                .qap-step-dot { height:4px; border-radius:2px; background:rgba(255,255,255,0.25); transition:all .3s; }
                .qap-step-dot.done { background:#fff; flex:1.5; }
                .qap-step-dot.active { background:#fff; flex:2; }
                .qap-step-dot.todo { flex:1; }
                .qap-body { padding:20px 20px 0; overflow-y: auto; flex: 1; }
                .qap-phone-suggest { display:flex; align-items:center; gap:8px; background:#eef0ff; border:1px solid rgba(79,70,229,.2); border-radius:10px; padding:10px 13px; margin-bottom:16px; cursor:pointer; transition:background .15s; }
                .qap-phone-suggest:hover { background:#e5e7ff; }
                .qap-phone-suggest svg { width:16px; height:16px; color:#4f46e5; flex-shrink:0; }
                .qap-phone-suggest-text { font-size:13px; font-weight:700; color:#4f46e5; }
                .qap-phone-suggest-sub { font-size:11px; color:#7b7fa0; margin-top:1px; }
                .qap-sec-label { font-size:10px; font-weight:800; color:#b8bbd0; text-transform:uppercase; letter-spacing:1px; margin:16px 0 8px; }
                .qap-sec-label:first-child { margin-top:0; }
                .qap-field { display:flex; align-items:center; gap:10px; background:#f0f2f8; border:1.5px solid #e0e3f0; border-radius:14px; padding:13px 15px; margin-bottom:10px; transition:all .18s; position:relative; }
                .qap-field:focus-within { border-color:#4f46e5; background:#fff; box-shadow:0 0 0 4px rgba(79,70,229,.08); }
                .qap-field.filled { border-color:rgba(79,70,229,.3); background:#fff; }
                .qap-field.error { border-color:#ef4444!important; background:#fff0f0!important; box-shadow:0 0 0 4px rgba(239,68,68,.07)!important; }
                .qap-field.valid { border-color:#10b981!important; }
                .qap-field-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .15s; }
                .qap-field:focus-within .qap-field-icon { background:#eef0ff; }
                .qap-field-icon svg { width:17px; height:17px; color:#b8bbd0; transition:color .15s; }
                .qap-field:focus-within .qap-field-icon svg { color:#4f46e5; }
                .qap-field.valid .qap-field-icon svg { color:#10b981; }
                .qap-field-inner { flex:1; min-width:0; }
                .qap-field-lbl { font-size:10px; font-weight:800; color:#7b7fa0; text-transform:uppercase; letter-spacing:.6px; margin-bottom:4px; display:block; transition:color .15s; }
                .qap-field:focus-within .qap-field-lbl { color:#4f46e5; }
                .qap-field.valid .qap-field-lbl { color:#10b981; }
                .qap-field-lbl .req { color:#ef4444; }
                .qap-field input, .qap-field select, .qap-field textarea { width:100%; border:none; outline:none; background:none; font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:700; color:#0d0f1c; }
                .qap-field input::placeholder, .qap-field textarea::placeholder { color:#b8bbd0; font-weight:600; }
                .qap-field select { cursor:pointer; appearance:none; color:#0d0f1c; }
                .qap-field textarea { resize:none; min-height:60px; line-height:1.5; }
                .qap-field-check { width:22px; height:22px; border-radius:50%; background:#e8faf3; display:none; align-items:center; justify-content:center; flex-shrink:0; }
                .qap-field-check svg { width:11px; height:11px; color:#10b981; }
                .qap-field.valid .qap-field-check { display:flex; }
                .qap-field-err { font-size:11px; font-weight:700; color:#ef4444; margin-top:-6px; margin-bottom:8px; padding:0 4px; display:none; }
                .qap-field.error + .qap-field-err { display:block; }
                .qap-sel-arrow { flex-shrink:0; }
                .qap-sel-arrow svg { width:14px; height:14px; color:#b8bbd0; }
                .qap-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
                .qap-opt-tag { font-size:9px; font-weight:700; background:#e0e3f0; color:#7b7fa0; padding:2px 7px; border-radius:99px; margin-left:5px; text-transform:uppercase; letter-spacing:.3px; }
                .qap-toggle-row { display:flex; align-items:center; justify-content:space-between; background:#f0f2f8; border:1.5px solid #e0e3f0; border-radius:14px; padding:12px 15px; margin-bottom:10px; }
                .qap-toggle-info { display:flex; align-items:center; gap:10px; }
                .qap-toggle-icon { width:36px; height:36px; border-radius:10px; background:#fffbeb; display:flex; align-items:center; justify-content:center; }
                .qap-toggle-icon svg { width:17px; height:17px; color:#f59e0b; }
                .qap-toggle-text { font-size:13px; font-weight:700; color:#0d0f1c; }
                .qap-toggle-sub { font-size:11px; color:#b8bbd0; }
                .qap-tswitch { position:relative; width:44px; height:24px; flex-shrink:0; }
                .qap-tswitch input { opacity:0; width:0; height:0; }
                .qap-tslider { position:absolute; inset:0; background:#e0e3f0; border-radius:12px; cursor:pointer; transition:background .2s; }
                .qap-tslider::before { content:''; position:absolute; width:18px; height:18px; left:3px; top:3px; background:#fff; border-radius:50%; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
                .qap-tswitch input:checked + .qap-tslider { background:#4f46e5; }
                .qap-tswitch input:checked + .qap-tslider::before { transform:translateX(20px); }
                .qap-credit-field { display:none; }
                .qap-credit-field.show { display:flex; }
                .qap-footer { padding:16px 20px 32px; display:flex; gap:10px; border-top:1px solid #e0e3f0; background:#fff; margin-top:16px; flex-shrink: 0; }
                .qap-cancel-btn { flex:1; padding:14px; border-radius:14px; background:#f0f2f8; border:1.5px solid #e0e3f0; font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:800; color:#7b7fa0; cursor:pointer; transition:all .15s; }
                .qap-cancel-btn:hover { background:#e0e3f0; color:#0d0f1c; }
                .qap-save-btn { flex:2.2; padding:14px; border-radius:14px; background:linear-gradient(135deg,#4f46e5,#6d28d9); border:none; font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:900; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 20px rgba(79,70,229,.4),inset 0 1px 0 rgba(255,255,255,.15); transition:all .18s; letter-spacing:-.1px; }
                .qap-save-btn:hover { transform:translateY(-1px); box-shadow:0 8px 28px rgba(79,70,229,.5); }
                .qap-save-btn svg { width:16px; height:16px; }
                .qap-recent-chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px; }
                .qap-recent-chip { display:flex; align-items:center; gap:6px; background:#fff; border:1.5px solid #e0e3f0; border-radius:99px; padding:5px 12px 5px 8px; cursor:pointer; transition:all .15s; }
                .qap-recent-chip:hover { border-color:#4f46e5; background:#eef0ff; }
                .qap-chip-av { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900; color:#fff; flex-shrink:0; }
                .qap-chip-name { font-size:12px; font-weight:700; color:#3a3d58; }
            `}} />

            {/* Header Content */}
            <header className="page-hdr">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <button onClick={() => router.back()} className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"><FaChevronLeft size={14} /></button>
                            <h1 className="ph-title text-white">{t.newInvoice}</h1>
                        </div>
                        <p className="ph-sub">Generate a digital GST bill in seconds</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {/* Top action buttons removed */}

                    </div>
                </div>

                <div className="stepper">
                    <div className="step-item done"><div className="s-dot"><FaCheck /></div><div className="s-lbl">Details</div></div>
                    <div className="s-line"></div>
                    <div className="step-item active"><div className="s-dot">2</div><div className="s-lbl">Items</div></div>
                    <div className="s-line"></div>
                    <div className="step-item"><div className="s-dot">3</div><div className="s-lbl">Payment</div></div>
                    <div className="s-line"></div>
                    <div className="step-item"><div className="s-dot">4</div><div className="s-lbl">Save</div></div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="form-outer">
                {/* Left Column */}
                <div className="left-col">
                    {/* Document Type */}
                    <div className="card">
                        <div className="c-title"><div className="c-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}><FaFileInvoice /></div> Document Type</div>
                        <div className="doc-tabs" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                            <div className={`dtab ${docType === DOC_TYPES.TAX_INVOICE ? 'active' : ''}`} onClick={() => setDocType(DOC_TYPES.TAX_INVOICE)}><span className="dt-icon">🧾</span><span className="dt-label">Tax Invoice</span></div>
                            <div className={`dtab ${docType === DOC_TYPES.BILL_OF_SUPPLY ? 'active' : ''}`} onClick={() => setDocType(DOC_TYPES.BILL_OF_SUPPLY)}><span className="dt-icon">📋</span><span className="dt-label">Bill Supply</span></div>
                            <div className={`dtab ${docType === DOC_TYPES.DELIVERY_CHALLAN ? 'active' : ''}`} onClick={() => setDocType(DOC_TYPES.DELIVERY_CHALLAN)}><span className="dt-icon">🚚</span><span className="dt-label">Del. Challan</span></div>
                            <div className={`dtab ${docType === DOC_TYPES.E_WAY_BILL ? 'active' : ''}`} onClick={() => setDocType(DOC_TYPES.E_WAY_BILL)}><span className="dt-icon">🛣️</span><span className="dt-label">E-Way Bill</span></div>
                            <div className="dtab" onClick={() => router.push('/dashboard/quotations/new')}><span className="dt-icon">📝</span><span className="dt-label">Quotation</span></div>
                        </div>
                    </div>

                    {/* Customer & Invoice Info */}
                    <div className="card">
                        <div className="c-title"><div className="c-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><FaUserPlus /></div> Customer & Details</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="inv-pill" onClick={() => toast('Auto-generated number')}>
                                <div><span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">Invoice #</span><span className="ip-num">{invoiceNumber}</span></div>
                                <FaCogs className="text-slate-300" />
                            </div>
                            <div>
                                <label className="fl">{t.customer} *</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        className="fi text-slate-900 flex-1"
                                        list="customer-list"
                                        placeholder="Enter or select customer"
                                        value={customers.find((c: any) => c.id === customerId)?.name || newCustName}
                                        onChange={e => {
                                            const found = customers.find((c: any) => c.name === e.target.value);
                                            if (found) {
                                                setCustomerId(found.id);
                                                setNewCustName(found.name);
                                            } else {
                                                setCustomerId('');
                                                setNewCustName(e.target.value);
                                            }
                                        }}
                                    />
                                    <datalist id="customer-list">
                                        {safeCustomers.map(c => <option key={c.id} value={c.name} />)}
                                    </datalist>
                                    <button type="button" onClick={() => setShowCustomerModal(true)} className="new-btn flex-shrink-0 flex items-center justify-center w-[52px] h-[52px]"><FaPlus /></button>
                                </div>
                            </div>
                        </div>

                        {selectedCustomer && (
                            <>
                                <div className="cprev">
                                    <div className="c-av">{selectedCustomer.name[0]}</div>
                                    <div>
                                        <div className="c-name">{selectedCustomer.name}</div>
                                        <div className="text-[11px] text-slate-400 font-bold">{selectedCustomer.phone || selectedCustomer.gstin || 'Registered Party'}</div>
                                    </div>
                                    <div className={`c-bal ${getCustomerBalance(selectedCustomer.id) > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                        ₹{getCustomerBalance(selectedCustomer.id).toLocaleString('en-IN')} due
                                    </div>
                                </div>
                                {selectedCustomer.credit_limit > 0 && getCustomerBalance(selectedCustomer.id) > selectedCustomer.credit_limit && (
                                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                        <div className="text-red-500 mt-0.5">⚠️</div>
                                        <div>
                                            <div className="text-sm font-bold text-red-700">Credit Limit Cross Ho Gayi!</div>
                                            <div className="text-xs text-red-600 mt-0.5">Inki limit ₹{selectedCustomer.credit_limit.toLocaleString('en-IN')} hai, lekin abhi ₹{getCustomerBalance(selectedCustomer.id).toLocaleString('en-IN')} ka udhaar baki hai.</div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-6 mt-6">
                            <div className="fg"><label className="fl">Invoice Date</label><input type="date" className="fi text-slate-900" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
                            <div className="fg"><label className="fl">Due Date</label><input type="date" className="fi text-slate-900" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                            <label className="oswitch">
                                <input type="checkbox" checked={isInterState} onChange={e => setIsInterState(e.target.checked)} />
                                <span className="oslider"></span>
                            </label>
                            <div className="opt-info">
                                <span className="opt-lbl">Inter-state Sale (IGST)</span>
                                <span className="opt-sub">Enable if customer is from another state</span>
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <div className="c-title" style={{ marginBottom: 0 }}><div className="c-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><FaBox /></div> Invoice Items</div>
                            <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{selectedItems.length} Products</div>
                        </div>

                        <div className="space-y-4">
                            {selectedItems.map((item, idx) => (
                                <div key={idx} className="item-card">
                                    <div className="i-num">{idx + 1}</div>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="md:col-span-11 grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Product Name</label>
                                                <div className="relative">
                                                    <input
                                                        className="fi text-slate-900 pr-10"
                                                        list="product-list"
                                                        placeholder="Type product name..."
                                                        value={item.product_name || ''}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            const prod = safeProducts.find((p: any) => p.name === val);
                                                            if (prod) {
                                                                updateItem(idx, 'product_id', prod.id);
                                                            } else {
                                                                updateItem(idx, 'product_name', val);
                                                            }
                                                        }}
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                                        <FaBox size={12} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Qty & Unit</label>
                                                <div className="flex gap-1">
                                                    <input type="number" className="fi text-slate-900" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                                                    <select className="fi px-2 text-slate-900" value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)}>
                                                        <option>PCS</option><option>KG</option><option>BOX</option><option>MTR</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Price (₹)</label>
                                                <input type="number" className="fi text-slate-900" value={item.unit_price || 0} onChange={e => updateItem(idx, 'unit_price', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">GST %</label>
                                                <select className="fi text-slate-900" value={item.gst_rate} onChange={e => updateItem(idx, 'gst_rate', e.target.value)}>
                                                    {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="md:col-span-1 flex justify-end">
                                            <button type="button" onClick={() => removeItem(idx)} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><FaTrash size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                        <span className="text-[11px] font-bold text-indigo-400 uppercase">Item Amount (Incl. GST)</span>
                                        <span className="text-sm font-black text-indigo-600">₹{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0) * (1 + (Number(item.gst_rate) || 0) / 100)).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <datalist id="product-list">
                            {safeProducts.map(p => <option key={p.id} value={p.name}>{p.price ? `₹${p.price}` : ''}</option>)}
                        </datalist>

                        <div className="add-actions-wrapper">
                            <div className="action-row">
                                <button type="button" onClick={addItem} className="premium-add-btn btn-manual">
                                    <FaPlus /> {t.addNewItem}
                                </button>
                                <button type="button" onClick={() => setShowQuickAdd(true)} className="premium-add-btn btn-inventory">
                                    <FaBox /> {t.browseInventory || 'Browse Inventory'}
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={startVoiceBilling}
                                className={`premium-add-btn ${isListening ? 'voice-pulse' : 'btn-voice'}`}
                                title="Add by Voice"
                            >
                                <FaMicrophone /> {isListening ? (t.voiceListening || 'Listening...') : (t.addItemByVoice || 'Add Item by Voice')}
                            </button>
                        </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="totals-box mb-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center opacity-60"><span className="text-xs">{t.subtotal}</span><span className="t-val">₹{totals.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center opacity-60"><span className="text-xs">{t.discountLabel || 'Discount'}</span><span className="t-val text-green-400">- ₹{totals.discountAmt.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center opacity-60"><span className="text-xs">{t.gstTotal || 'GST Total'}</span><span className="t-val">₹{totals.gst.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center opacity-60"><span className="text-xs">{t.otherCharges || 'Other Charges'}</span><span className="t-val">₹{(Number(extraCharge) + Number(shippingCharge)).toFixed(2)}</span></div>
                            <div className="border-t border-white/10 pt-4 mt-2">
                                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-widest block">{t.totalAmount}</span>
                                <span className="grand-total">₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Extra Charges */}
                    <div className="card">
                        <div className="c-title"><div className="c-icon" style={{ background: '#fff7ed', color: '#c2410c' }}><FaTruck /></div> {t.discountShippingTitle || 'Discount & Shipping'}</div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><label className="fl">{t.discountPercentage || 'Discount (%)'}</label><input type="number" className="fi text-slate-900" value={discountPct} onChange={e => setDiscountPct(Number(e.target.value))} /></div>
                            <div><label className="fl">{t.extraFee || 'Extra Fee (₹)'}</label><input type="number" className="fi text-slate-900" value={extraCharge} onChange={e => setExtraCharge(Number(e.target.value))} /></div>
                        </div>
                        <div><label className="fl">{t.shippingCharge || 'Shipping (₹)'}</label><input type="number" className="fi text-slate-900" value={shippingCharge} onChange={e => setShippingCharge(Number(e.target.value))} /></div>
                    </div>

                    {/* Payment Info */}
                    <div className="card">
                        <div className="c-title"><div className="c-icon" style={{ background: '#fef9c3', color: '#854d0e' }}><FaReceipt /></div> {t.paymentDetails || 'Payment Details'}</div>
                        <div className="pay-grid mb-6">
                            {['Cash', 'UPI', 'Bank', 'Credit'].map(m => (
                                <div key={m} className={`p-mode ${paymentMode === m ? 'active' : ''}`} onClick={() => setPaymentMode(m)}>{m}</div>
                            ))}
                        </div>
                        <div className="fg">
                            <label className="fl">Amount Received (₹)</label>
                            <input type="number" className="fi text-green-600 font-black text-lg" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0.00" />
                        </div>
                        {totals.grandTotal > (Number(paidAmount) || 0) && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] font-bold text-red-600">⚠️ Balance Due: ₹{(totals.grandTotal - (Number(paidAmount) || 0)).toFixed(2)}</div>
                        )}
                    </div>

                    {/* Notes & Terms */}
                    <div className="card">
                        <div className="c-title"><div className="c-icon" style={{ background: '#f1f5f9', color: '#64748b' }}><FaReceipt /></div> {t.termsNotes}</div>
                        <textarea className="fi min-h-[100px] bg-slate-50 border-dashed text-slate-900" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Terms & conditions or personal message..."></textarea>
                    </div>
                </div>

                {/* Right Column */}
                <div className="right-col">
                    {/* Advanced Options */}
                    <div className="card">
                        <div className="c-title"><div className="c-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>⚙️</div> Options</div>

                        <div className="opt-row">
                            <div className="opt-info"><span className="opt-lbl">Show GST Breakup</span><span className="opt-sub">CGST / SGST alag-alag</span></div>
                            <label className="oswitch"><input type="checkbox" checked={options.showGstBreakup} onChange={e => setOptions({ ...options, showGstBreakup: e.target.checked })} /><span className="oslider"></span></label>
                        </div>

                        <div className="opt-row">
                            <div className="opt-info"><span className="opt-lbl">WhatsApp Share</span><span className="opt-sub">Save hote hi auto-share</span></div>
                            <label className="oswitch"><input type="checkbox" checked={options.whatsappShare} onChange={e => setOptions({ ...options, whatsappShare: e.target.checked })} /><span className="oslider"></span></label>
                        </div>

                        <div className="opt-row">
                            <div className="opt-info"><span className="opt-lbl">E-Invoice (IRN)</span><span className="opt-sub">Auto generate karo</span></div>
                            <label className="oswitch"><input type="checkbox" checked={options.eInvoice} onChange={e => setOptions({ ...options, eInvoice: e.target.checked })} /><span className="oslider"></span></label>
                        </div>

                        <div className="opt-row">
                            <div className="opt-info"><span className="opt-lbl">Email Invoice</span><span className="opt-sub">Customer ko email bhejo</span></div>
                            <label className="oswitch"><input type="checkbox" checked={options.emailInvoice} onChange={e => setOptions({ ...options, emailInvoice: e.target.checked })} /><span className="oslider"></span></label>
                        </div>

                        <div className="opt-row">
                            <div className="opt-info"><span className="opt-lbl">Recurring</span><span className="opt-sub">Monthly auto-generate</span></div>
                            <label className="oswitch"><input type="checkbox" checked={options.recurring} onChange={e => setOptions({ ...options, recurring: e.target.checked })} /><span className="oslider"></span></label>
                        </div>
                    </div>

                </div>
            </form>

            <div className="bottom-bar">
                <button type="button" onClick={() => router.back()} className="text-[12px] font-black uppercase text-rose-500 hover:bg-rose-50 px-6 py-3 rounded-xl transition-all">✕ Cancel</button>
                <div className="flex gap-4">
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="bb-save">
                        {isSubmitting ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : <FaSave />}
                        {isSubmitting ? 'Saving...' : 'SAVE INVOICE'}
                    </button>
                </div>
            </div>

            {/* Quick Add Panel - Voice + Type */}
            {showQuickAdd && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-end justify-center p-0">
                    <div className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl py-6 px-5 sm:p-6 animate-in slide-in-from-bottom" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
                        <div className="relative mb-4 flex justify-center items-center">
                            <div className="text-center">
                                <h3 className="text-lg font-black text-slate-900">⚡ Quick Add Product</h3>
                                <p className="text-xs text-slate-400">{isListening ? '🎙️ Listening...' : 'Type ya voice se product add karo'}</p>
                            </div>
                            <button onClick={() => { setShowQuickAdd(false); setIsListening(false); }} className="absolute right-0 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">✕</button>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input
                                autoFocus
                                className="fi flex-1 text-slate-900 border-2 border-indigo-300 focus:border-indigo-500"
                                placeholder="Product ka naam type karo..."
                                value={quickSearch}
                                onChange={e => setQuickSearch(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && quickSearch.trim()) quickAddProduct(quickSearch.trim(), quickQty); }}
                            />
                            <input
                                type="number"
                                min={1}
                                className="fi w-20 text-slate-900 text-center border-2 border-indigo-300"
                                value={quickQty}
                                onChange={e => setQuickQty(Number(e.target.value) || 1)}
                            />
                        </div>

                        {/* Filtered Product List */}
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {(useStore.getState().products || [])
                                .filter((p: any) => p?.id && p?.name && p?.status !== 'INACTIVE')
                                .filter((p: any) => !quickSearch || p.name.toLowerCase().includes(quickSearch.toLowerCase()))
                                .slice(0, 10)
                                .map((p: any) => (
                                    <div
                                        key={p.id}
                                        onClick={() => quickAddProduct(p.name, quickQty)}
                                        className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-transparent rounded-xl cursor-pointer transition-all"
                                    >
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">{p.name}</div>
                                            <div className="text-xs text-slate-400">₹{p.price} · {p.unit || 'PCS'} · GST {p.gst_rate || 18}%</div>
                                        </div>
                                        <span className="text-indigo-500 font-black text-lg">+</span>
                                    </div>
                                ))
                            }
                            {quickSearch && (useStore.getState().products || []).filter((p: any) => p?.name?.toLowerCase().includes(quickSearch.toLowerCase())).length === 0 && (
                                <div className="text-center text-slate-400 py-6 text-sm">No product found for "{quickSearch}"</div>
                            )}
                        </div>

                        <button
                            onClick={() => quickSearch.trim() && quickAddProduct(quickSearch.trim(), quickQty)}
                            className="mt-4 w-full py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all"
                        >
                            ✅ Add Product
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Add Modal, AI Scanning Portal, etc. */}
            {isScanning && (
                <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center text-white">
                    <div className="relative w-64 h-80 border-2 border-indigo-400/50 rounded-3xl mb-10 overflow-hidden shadow-[0_0_80px_rgba(91,94,244,0.3)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 animate-[scan_3s_linear_infinite]"></div>
                    </div>
                    <h2 className="text-2xl font-black italic">AI MAGIC SCAN™ {scanProgress}%</h2>
                    <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[5px]">Synthesizing Data Vectors</p>
                    <style jsx>{` @keyframes scan { 0% { top: 0; } 100% { top: 100%; } } `}</style>
                </div>
            )}

            {showCustomerModal && (
                <div className="qap-backdrop">
                    <div className="qap-sheet">
                        <div className="qap-header">
                            <div className="qap-handle"></div>
                            <div className="qap-title-row">
                                <div className="qap-icon-wrap">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                        <path d="M12 11v2M16 13l-4 2-4-2" />
                                    </svg>
                                </div>
                                <div className="qap-titles">
                                    <div className="qap-title">{t.newCustomerSheetTitle || 'Add New Customer'}</div>
                                    <div className="qap-sub">{t.newCustomerSheetSubtitle || 'Fill customer details and save'}</div>
                                </div>
                                <button type="button" className="qap-close" onClick={() => setShowCustomerModal(false)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="qap-steps">
                                <div className="qap-step-dot done"></div>
                                <div className="qap-step-dot active"></div>
                                <div className="qap-step-dot todo"></div>
                            </div>
                        </div>

                        <div className="qap-body no-scrollbar">
                            <div className="qap-phone-suggest" onClick={() => toast('Phone book access feature coming soon', { icon: '📱' })}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2z" />
                                    <path d="M12 18h.01" />
                                    <path d="M9 7h6M9 11h4" />
                                </svg>
                                <div>
                                    <div className="qap-phone-suggest-text">{t.phoneBookPrompt || '📱 Select from Phone Book'}</div>
                                    <div className="qap-phone-suggest-sub">{t.phoneBookSub || 'Pick name and number directly from contacts'}</div>
                                </div>
                            </div>

                            <div className="qap-sec-label">{t.recentCustomers || 'Recent Customers'}</div>
                            <div className="qap-recent-chips">
                                {safeCustomers.slice(-4).map((c: any, i: number) => {
                                    const colors = [
                                        'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                        'linear-gradient(135deg,#10b981,#059669)',
                                        'linear-gradient(135deg,#f59e0b,#d97706)',
                                        'linear-gradient(135deg,#ef4444,#dc2626)'
                                    ];
                                    return (
                                        <div key={c.id} className="qap-recent-chip" onClick={() => {
                                            setNewCustName(c.name);
                                            setNewCustPhone(c.phone || '');
                                            toast.success(`${c.name} pre-filled`);
                                        }}>
                                            <div className="qap-chip-av" style={{ background: colors[i % colors.length] }}>{c.name[0]?.toUpperCase()}</div>
                                            <span className="qap-chip-name">{c.name.split(' ')[0]}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="qap-sec-label">{t.requiredInfo || 'Required Information'}</div>

                            <div className={`qap-field ${newCustName.length >= 2 ? 'valid filled' : (newCustName.length > 0 ? 'error' : '')}`}>
                                <div className="qap-field-icon" style={{ background: newCustName.length >= 2 ? '' : 'var(--indigo-lt)' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                                <div className="qap-field-inner">
                                    <span className="qap-field-lbl">{t.nameLabel || 'Name'} <span className="req">*</span></span>
                                    <input type="text" placeholder={t.nameLabel || 'Name'} value={newCustName} onChange={e => setNewCustName(e.target.value)} />
                                </div>
                                <div className="qap-field-check">
                                    <svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                            <div className="qap-field-err" style={{ display: (newCustName.length > 0 && newCustName.length < 2) ? 'block' : 'none' }}>⚠ {t.nameLabel || 'Name'} required</div>

                            <div className={`qap-field ${newCustPhone.length === 10 ? 'valid filled' : (newCustPhone.length > 0 ? 'error' : '')}`}>
                                <div className="qap-field-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14z" /></svg>
                                </div>
                                <div className="qap-field-inner">
                                    <span className="qap-field-lbl">{t.phoneNumberLabel || 'Phone Number'} <span className="qap-opt-tag">{t.optional || 'Optional'}</span></span>
                                    <input type="tel" placeholder="10 digit mobile number" value={newCustPhone} maxLength={10} onChange={e => setNewCustPhone(e.target.value.replace(/\D/g, ''))} />
                                </div>
                                <div className="qap-field-check">
                                    <svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                            <div className="qap-field-err" style={{ display: (newCustPhone.length > 0 && newCustPhone.length < 10) ? 'block' : 'none' }}>⚠ Invalid phone</div>

                            <div className="qap-row-2">
                                <div className="qap-field" style={{ marginBottom: 0 }}>
                                    <div className="qap-field-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" /></svg>
                                    </div>
                                    <div className="qap-field-inner">
                                        <span className="qap-field-lbl">{t.typeLabel || 'Type'}</span>
                                        <select value={newCustType} onChange={e => setNewCustType(e.target.value)}>
                                            <option value="Grahak">Customer</option>
                                            <option value="Supplier">Supplier</option>
                                            <option value="Dono">Both</option>
                                        </select>
                                    </div>
                                    <div className="qap-sel-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg></div>
                                </div>

                                <div className="qap-field" style={{ marginBottom: 0 }}>
                                    <div className="qap-field-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                    </div>
                                    <div className="qap-field-inner">
                                        <span className="qap-field-lbl">{t.stateLabel || 'State'}</span>
                                        <select value={newCustState} onChange={e => setNewCustState(e.target.value)}>
                                            <option>Rajasthan</option>
                                            <option>Gujarat</option>
                                            <option>Maharashtra</option>
                                            <option>Delhi</option>
                                            <option>UP</option>
                                            <option>MP</option>
                                            <option>Punjab</option>
                                        </select>
                                    </div>
                                    <div className="qap-sel-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg></div>
                                </div>
                            </div>

                            <div className="qap-sec-label" style={{ marginTop: 16 }}>{t.otherInfo || 'Other Information'} <span className="qap-opt-tag">{t.optional || 'Optional'}</span></div>

                            <div className={`qap-field ${newCustGstin.length === 15 ? 'valid filled' : ''}`}>
                                <div className="qap-field-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>
                                </div>
                                <div className="qap-field-inner">
                                    <span className="qap-field-lbl">GSTIN <span className="qap-opt-tag">{t.optional || 'Optional'}</span></span>
                                    <input type="text" placeholder="22AAAAA0000A1Z5" value={newCustGstin} maxLength={15} onChange={e => setNewCustGstin(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className="qap-field-check">
                                    <svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>

                            <div className="qap-field">
                                <div className="qap-field-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                </div>
                                <div className="qap-field-inner">
                                    <span className="qap-field-lbl">Email <span className="qap-opt-tag">{t.optional || 'Optional'}</span></span>
                                    <input type="email" placeholder="email@example.com" value={newCustEmail} onChange={e => setNewCustEmail(e.target.value)} />
                                </div>
                            </div>

                            <div className="qap-field">
                                <div className="qap-field-icon" style={{ alignSelf: 'flex-start', marginTop: 2 }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                </div>
                                <div className="qap-field-inner">
                                    <span className="qap-field-lbl">{t.address || 'Address'} <span className="qap-opt-tag">{t.optional || 'Optional'}</span></span>
                                    <textarea placeholder={t.address || 'Address'} value={newCustAddress} onChange={e => setNewCustAddress(e.target.value)}></textarea>
                                </div>
                            </div>

                            <div className="qap-sec-label">Credit Limit</div>
                            <div className="qap-toggle-row">
                                <div className="qap-toggle-info">
                                    <div className="qap-toggle-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>
                                    </div>
                                    <div>
                                        <div className="qap-toggle-text">Set Credit Limit</div>
                                        <div className="qap-toggle-sub">Maximum allowed due amount</div>
                                    </div>
                                </div>
                                <label className="qap-tswitch">
                                    <input type="checkbox" checked={showCreditLimit} onChange={e => setShowCreditLimit(e.target.checked)} />
                                    <span className="qap-tslider"></span>
                                </label>
                            </div>

                            <div className={`qap-field qap-credit-field ${showCreditLimit ? 'show' : ''}`}>
                                <div className="qap-field-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                                </div>
                                <div className="qap-field-inner">
                                    <span className="qap-field-lbl">Credit Limit (₹)</span>
                                    <input type="number" placeholder="Eg: 20000" value={newCustLimit} onChange={e => setNewCustLimit(e.target.value)} />
                                </div>
                            </div>

                            <div className="qap-field" style={{ marginBottom: 4 }}>
                                <div className="qap-field-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                                </div>
                                <div className="qap-field-inner">
                                    <span className="qap-field-lbl">{t.balanceAmount || 'Opening Balance'} (₹) <span className="qap-opt-tag">{t.optional || 'Optional'}</span></span>
                                    <input type="number" placeholder="0" value={newCustOb} onChange={e => setNewCustOb(e.target.value)} />
                                </div>
                            </div>
                            <div style={{ fontSize: 11, color: '#b8bbd0', padding: '0 4px', marginBottom: 16, fontWeight: 600 }}>
                                💡 If customer has previous pending balance, enter it here
                            </div>

                        </div>

                        <div className="qap-footer">
                            <button type="button" className="qap-cancel-btn" onClick={() => setShowCustomerModal(false)}>{t.cancel || 'Cancel'}</button>
                            <button type="button" className="qap-save-btn" onClick={handleAddCustomer}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                                    <path d="M17 21v-8H7v8M7 3v5h8" />
                                </svg>
                                {t.save || 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onFileChange} />
            <RegistrationPopup />
            {showLoginPrompt && <LoginPrompt message="Login to cloud for full safe mode sync." returnUrl="/dashboard/invoices/new" />}
        </div>
    );
}
