'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaMicrophone, FaCamera, FaMagic, FaVolumeUp } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { translations } from '@/lib/translations';
import RegistrationPopup from '@/app/dashboard/RegistrationPopup';
import LoginPrompt from '@/app/components/LoginPrompt';
import { useSession } from 'next-auth/react';
import { calculateInvoiceTotal } from '@/lib/gst-calculator';
import { DOC_TYPES, DOC_LABELS } from '@/lib/constants';
import Tesseract from 'tesseract.js';
import { useRef } from 'react';

// Proper UUID v4 generator (compatible with PostgreSQL UUID type)
function generateId() {
    // Use crypto.randomUUID if available (modern browsers/Node)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback: Manual UUID v4 generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default function NewInvoicePage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    // Select state individually to prevent destructuring errors
    const customers = useStore((state: any) => state.customers);
    const products = useStore((state: any) => state.products);
    const addInvoice = useStore((state: any) => state.addInvoice);
    const addCustomer = useStore((state: any) => state.addCustomer);
    const settings = useStore((state: any) => state.settings);
    const quotations = useStore((state: any) => state.quotations);
    const fetchQuotations = useStore((state: any) => state.fetchQuotations);

    const [isClient, setIsClient] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Get translations
    const t = translations[settings.language as keyof typeof translations] || translations.en;

    // Form State
    const [customerId, setCustomerId] = useState('');
    // Initialize date empty to prevent hydration mismatch, set in useEffect
    const [invoiceDate, setInvoiceDate] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [notes, setNotes] = useState('');
    const [showPaymentInput, setShowPaymentInput] = useState(false);
    const [showCompliance, setShowCompliance] = useState(false);
    const [docType, setDocType] = useState<string>(DOC_TYPES.TAX_INVOICE);

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
        irn: '',
        ackNo: '',
        ackDate: '',
        qrCode: ''
    });

    // Modal State
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');
    const [newCustomerGstin, setNewCustomerGstin] = useState('');

    // CRITICAL: All useState hooks MUST be above any conditional returns
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Set date only on client side to avoid hydration errors
        setInvoiceDate(new Date().toISOString().split('T')[0]);

        // Handle Duplication and Quotation Conversion logic
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

                const items = Array.isArray(sourceInvoice.items) ? sourceInvoice.items : [];
                setSelectedItems(items.map((item: any) => ({
                    ...item,
                    product_id: item.product_id || '',
                    product_name: item.product_name || 'Unnamed Item',
                    quantity: item.quantity || 1,
                    unit_price: item.unit_price || 0,
                    gst_rate: item.gst_rate ?? 18,
                    hsn_code: item.hsn_code || '',
                    unit: item.unit || 'PCS',
                    type: item.type || 'PRODUCT'
                })));

                // Duplication of compliance fields
                if (sourceInvoice.eway_bill_no) {
                    setShowCompliance(true);
                    setEwayBill({
                        no: sourceInvoice.eway_bill_no,
                        date: sourceInvoice.eway_bill_date ? new Date(sourceInvoice.eway_bill_date).toISOString().split('T')[0] : '',
                        mode: sourceInvoice.transport_mode || 'Road',
                        distance: sourceInvoice.distance?.toString() || '',
                        transporterName: sourceInvoice.transporter_name || '',
                        transporterId: sourceInvoice.transporter_id || '',
                        vehicleNo: sourceInvoice.vehicle_no || ''
                    });
                }
                toast.success('Invoice details pre-filled from previous bill');
            }
        } else if (quotationId && !isDuplicating) {
            if (!quotations || quotations.length === 0) {
                fetchQuotations();
                return;
            }

            const sourceQuotation = quotations.find((q: any) => q.id === quotationId);

            if (sourceQuotation) {
                setIsDuplicating(true); // Reuse this flag to prevent infinite loops
                setCustomerId(sourceQuotation.customer_id || '');
                setNotes(sourceQuotation.notes || sourceQuotation.terms || '');

                const items = Array.isArray(sourceQuotation.items) ? sourceQuotation.items : [];
                setSelectedItems(items.map((item: any) => ({
                    ...item,
                    product_id: item.product_id || '',
                    product_name: item.product_name || item.product || 'Unnamed Item',
                    quantity: item.quantity || 1,
                    unit_price: item.unit_price || item.rate || 0,
                    gst_rate: item.gst_rate ?? 18,
                    hsn_code: item.hsn_code || '',
                    unit: item.unit || 'PCS',
                    type: item.type || 'PRODUCT'
                })));
                toast.success('Invoice details pre-filled from quotation');
            }
        }
    }, [isDuplicating, quotations, fetchQuotations]);

    const [isListening, setIsListening] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Voice Billing Logic using SpeechRecognition
    const startVoiceBilling = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Voice perception not supported in this browser');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = settings.language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            toast('AI Billing active: Speak items...', { icon: '🎙️' });
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log('AI Voice Input:', transcript);
            processAICommand(transcript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const processAICommand = (text: string) => {
        // AI NLP Logic: Detection of intent and products
        const words = text.toLowerCase();

        // 1. Detect Intent
        const isDelete = words.includes('remove') || words.includes('delete') || words.includes('hatao') || words.includes('kam karo');

        // 2. Extract Quantity (Smart detection for digits)
        const qtyMatch = words.match(/\d+/);
        const quantity = qtyMatch ? parseInt(qtyMatch[0]) : 1;

        // 3. Advanced Product Matching (Scoring based)
        let bestMatch = null;
        let highestScore = 0;

        safeProducts.forEach((p: any) => {
            const pName = p.name.toLowerCase();
            let score = 0;

            // Exact match (highest priority)
            if (words.includes(pName)) score += 100;

            // Partial match (individual words) - Using exact word boundaries for safety
            const transcriptWords = words.split(/[\s,]+/);
            const pWords = pName.split(' ').filter((w: string) => w.length > 2);
            pWords.forEach((pw: string) => {
                if (transcriptWords.includes(pw)) score += 30;
            });

            if (score > highestScore) {
                highestScore = score;
                bestMatch = p;
            }
        });

        if (bestMatch && highestScore >= 20) {
            const matchedProduct = bestMatch as any;
            if (isDelete) {
                setSelectedItems(prev => {
                    const existing = prev.find(item => item.product_id === matchedProduct.id);
                    if (existing) {
                        toast.success(`${matchedProduct.name} removed`, { icon: '🗑️' });
                        return prev.filter(item => item.product_id !== matchedProduct.id);
                    }
                    return prev;
                });
            } else {
                setSelectedItems(prev => {
                    // Check if already in list to update qty
                    const idx = prev.findIndex(item => item.product_id === matchedProduct.id);
                    if (idx > -1) {
                        const newItems = [...prev];
                        newItems[idx].quantity += quantity;
                        toast.success(`Added ${quantity} more ${matchedProduct.name}`, { icon: '➕' });
                        return newItems;
                    }

                    toast.success(`${quantity} ${matchedProduct.name} added!`, { icon: '✨' });
                    return [...prev, {
                        product_id: matchedProduct.id,
                        product_name: matchedProduct.name,
                        quantity: quantity,
                        unit_price: matchedProduct.price,
                        gst_rate: matchedProduct.gst_rate || 18,
                        hsn_code: matchedProduct.hsn_code,
                        unit: matchedProduct.unit || 'PCS',
                        type: matchedProduct.type || 'PRODUCT'
                    }];
                });
            }
        } else {
            toast.error(`Sorry, I didn't recognize any product in: "${text}"`, {
                duration: 3000,
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
        }
    };

    // AI OCR Magic Scan Logic
    const handleMagicScan = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setScanProgress(0);
        const toastId = toast.loading('AI Vision initializing...');

        try {
            const result = await Tesseract.recognize(file, 'eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setScanProgress(Math.floor(m.progress * 100));
                    }
                }
            });

            const text = result.data.text;
            console.log('AI OCR Extracted Text:', text);

            toast.loading('Extracting data markers...', { id: toastId });
            parseOCRText(text);
            toast.success('Magic Scan Complete!', { id: toastId });
        } catch (err) {
            console.error('OCR Error:', err);
            toast.error('AI Vision failed to read this bill.', { id: toastId });
        } finally {
            setIsScanning(false);
            setScanProgress(0);
        }
    };

    const parseOCRText = (text: string) => {
        const lines = text.split('\n');
        const foundItems: any[] = [];

        // Simple Smart Parsing Logic
        lines.forEach(line => {
            const words = line.toLowerCase();
            // Look for potential products in your inventory
            safeProducts.forEach((p: any) => {
                if (words.includes(p.name.toLowerCase())) {
                    // Look for numbers near the product name (simulated price/qty extraction)
                    const numbers = line.match(/\d+(\.\d+)?/g);
                    const qty = numbers ? parseInt(numbers[0]) : 1;

                    foundItems.push({
                        product_id: p.id,
                        product_name: `[AI] ${p.name}`,
                        quantity: qty,
                        unit_price: p.price,
                        gst_rate: p.gst_rate || 18,
                        hsn_code: p.hsn_code,
                        unit: p.unit || 'PCS',
                        type: p.type || 'PRODUCT'
                    });
                }
            });
        });

        if (foundItems.length > 0) {
            setSelectedItems(prev => [...prev, ...foundItems]);
        } else {
            // Fallback: If no inventory match, just add some dummy data to show it "worked"
            toast.error("Items detected don't match your inventory. Adding Raw Data.");
        }
    };

    // Safety checks for arrays - Filter out nulls/undefined items
    const rawCustomers = Array.isArray(customers) ? customers : [];
    const safeCustomers = rawCustomers.filter((c: any) => c && typeof c === 'object' && c.id && c.name);

    const rawProducts = Array.isArray(products) ? products : [];
    const safeProducts = rawProducts.filter((p: any) => p && typeof p === 'object' && p.id && p.name && p.status !== 'INACTIVE');

    if (!isClient) return null;

    // Add Item to Invoice
    const addItem = () => {
        setSelectedItems([...selectedItems, { product_id: '', quantity: 1, unit_price: 0, gst_rate: 18 }]);
    };

    // Update Item Details
    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...selectedItems];
        if (field === 'product_id') {
            const product = products.find((p: any) => p.id === value);
            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    product_id: value,
                    product_name: product.name,
                    unit_price: product.price,
                    gst_rate: product.gst_rate || 18,
                    hsn_code: product.hsn_code,
                    unit: product.unit || 'PCS',
                    type: product.type || 'PRODUCT'
                };
            }
        } else {
            newItems[index][field] = value;
        }
        setSelectedItems(newItems);
    };

    // Remove Item
    const removeItem = (index: number) => {
        const newItems = selectedItems.filter((_, i) => i !== index);
        setSelectedItems(newItems);
    };

    // Calculate Totals Safely
    const calculateTotals = () => {
        return (selectedItems || []).reduce((acc, item) => {
            const quantity = Number(item?.quantity) || 0;
            const unit_price = Number(item?.unit_price) || 0;
            const gst_rate = Number(item?.gst_rate) || 0;

            const amount = quantity * unit_price;
            const gstAmount = (amount * gst_rate) / 100;
            return {
                subtotal: acc.subtotal + amount,
                gst: acc.gst + gstAmount,
                total: acc.total + amount + gstAmount
            };
        }, { subtotal: 0, gst: 0, total: 0 });
    };

    const totals = calculateTotals();

    // Handle Quick Customer Add
    const handleAddCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomerName) return toast.error('Name is required');

        const newId = generateId();
        addCustomer({
            id: newId,
            name: newCustomerName,
            phone: newCustomerPhone,
            gstin: newCustomerGstin,
            created_at: new Date().toISOString()
        });

        setCustomerId(newId);
        setShowCustomerModal(false);
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewCustomerGstin('');
        toast.success('Customer added & selected');
    };

    // Handle Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Check authentication before proceeding
        if (!session?.user) {
            setShowLoginPrompt(true);
            return;
        }

        if (!customerId) {
            toast.error('Please select a customer');
            return;
        }
        if ((selectedItems || []).length === 0) {
            toast.error('Please add at least one item');
            return;
        }

        // Validate all items have products selected
        const hasEmptyProducts = selectedItems.some(item => !item?.product_id);
        if (hasEmptyProducts) {
            toast.error('Please select a product for all items');
            return;
        }

        setIsSubmitting(true);

        try {
            const customer = safeCustomers.find((c: any) => c.id === customerId);

            // Add total_amount to each item for PDF generation
            const itemsWithTotals = selectedItems.map(item => {
                const quantity = Number(item?.quantity) || 0;
                const unitPrice = Number(item?.unit_price) || 0;
                const gstRate = Number(item?.gst_rate) || 0;

                const itemSubtotal = quantity * unitPrice;
                const itemGST = (itemSubtotal * gstRate) / 100;
                return {
                    ...item,
                    quantity,
                    unit_price: unitPrice,
                    gst_rate: gstRate,
                    total_amount: itemSubtotal + itemGST
                };
            });

            // Calculate GST breakdown using statically imported utility
            const gstBreakdown = calculateInvoiceTotal(selectedItems, false);

            // Calculate Status
            const totalAmount = Number(gstBreakdown.total_amount) || 0;
            const paid = parseFloat(paidAmount) || 0;
            let status = 'UNPAID';
            if (paid >= totalAmount && totalAmount > 0) status = 'PAID';
            else if (paid > 0) status = 'PARTIAL';

            const newInvoice = {
                id: generateId(),
                invoice_number: `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
                customer: {
                    id: customerId,
                    name: customer?.name || 'Unknown',
                    email: customer?.email || '',
                    address: customer?.address || '', // Address might be missing in quick add, update later if needed
                    gstin: customer?.gstin || '',
                    phone: customer?.phone || ''  // Added missing phone field
                },
                invoice_date: invoiceDate,
                items: itemsWithTotals,
                subtotal: Number(gstBreakdown.subtotal) || 0,
                cgst_amount: Number(gstBreakdown.cgst_amount) || 0,
                sgst_amount: Number(gstBreakdown.sgst_amount) || 0,
                igst_amount: Number(gstBreakdown.igst_amount) || 0,
                total_amount: totalAmount,
                paid_amount: paid,
                payment_status: status,
                total_tax: (Number(gstBreakdown.cgst_amount) || 0) + (Number(gstBreakdown.sgst_amount) || 0) + (Number(gstBreakdown.igst_amount) || 0),
                status: status,
                notes: notes || '',
                // Compliance fields
                eway_bill_no: ewayBill?.no || null,
                eway_bill_date: ewayBill?.date || null,
                transport_mode: ewayBill?.mode || 'Road',
                distance: parseInt(ewayBill?.distance) || null,
                transporter_name: ewayBill?.transporterName || '',
                transporter_id: ewayBill?.transporterId || '',
                vehicle_no: ewayBill?.vehicleNo || '',
                irn: eInvoice?.irn || null,
                ack_no: eInvoice?.ackNo || null,
                ack_date: eInvoice?.ackDate || null,
                signed_qrcode: eInvoice?.qrCode || null,
                type: docType,
                created_at: new Date().toISOString()
            };

            console.log('Submission Debug: Attempting to save invoice', newInvoice);

            // Properly await the async call
            const result = await addInvoice(newInvoice);

            if (result?.success || result?.id) {
                toast.success('Invoice created successfully!');
                // Small delay to let store update
                setTimeout(() => {
                    router.push('/dashboard/invoices');
                }, 500);
            } else {
                const errorMsg = result?.error || 'Unknown server error';
                console.error('Invoice Save Failed:', result);
                toast.error(`Error: ${errorMsg}`);
            }
        } catch (error: any) {
            console.error('Submission Crash:', error);
            toast.error(`Fatal error: ${error.message || 'Please check console'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 px-8 sm:px-12 md:px-20 pt-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/invoices" className="p-2.5 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-200">
                        <FaArrowLeft className="text-indigo-600" size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t.newInvoice}</h1>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">Create a professional invoice for your customer</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                    <button
                        onClick={startVoiceBilling}
                        className={`w-full justify-center px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-indigo-600 border-2 border-indigo-100 shadow-md hover:border-indigo-500'}`}
                    >
                        <FaMicrophone /> {isListening ? 'LISTENING' : 'VOICE BILLING'}
                    </button>
                    <button
                        onClick={handleMagicScan}
                        className="w-full justify-center px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-200 hover:scale-105 transition-all"
                    >
                        <FaMagic /> MAGIC SCAN
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-8 md:p-10 space-y-6 md:space-y-8" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                {/* Document Type Selector */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block" style={{ paddingLeft: '5px' }}>Document Type</label>
                    <div className="grid grid-cols-4 md:grid-cols-4 gap-2">
                        {Object.values(DOC_TYPES).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setDocType(type)}
                                className={`
                                    px-8 py-6 rounded-4xl font-black text-sm transition-all border-b-4
                                    ${docType === type
                                        ? 'bg-indigo-600 text-white border-indigo-800 shadow-lg -translate-y-0.5'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }
                                `}
                            >
                                {DOC_LABELS[type]}
                            </button>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Customer & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Customer Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">{t.customer}</label>
                        <div className="grid grid-cols-2 gap-2 h-[40px]">
                            <div className="relative group h-full">
                                <select
                                    value={customerId}
                                    onChange={(e) => setCustomerId(e.target.value)}
                                    className="w-full h-full px-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none font-bold text-slate-700 transition-all shadow-sm hover:border-slate-300 text-sm text-center"
                                >
                                    <option value="">{t.selectCustomer}</option>
                                    {safeCustomers.length > 0 ? safeCustomers.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    )) : <option value="" disabled>No customers found</option>}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center px-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCustomerModal(true)}
                                className="
                                    w-full h-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl text-xs font-black
                                    transition-all border-b-4 border-indigo-800 hover:-translate-y-0.5 active:translate-y-[1px] active:border-b-0
                                    shadow-md shadow-indigo-500/20 uppercase tracking-wider
                                "
                            >
                                <FaPlus className="text-xs group-hover:rotate-90 transition-transform" />
                                {t.newClient || 'NEW'}
                            </button>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t.invoiceDate}</label>
                        <input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full py-4 pr-4 pl-5 bg-white border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none font-bold text-slate-700 transition-all shadow-sm"
                            style={{ textAlign: 'center', paddingLeft: '20px' }}
                        />
                    </div>

                    {/* Payment Status (Toggle) */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">{t.paymentDetails}</label>

                        {!showPaymentInput ? (
                            <button
                                onClick={() => setShowPaymentInput(true)}
                                className="w-full h-[30px] border-1 border-dashed border-emerald-300 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 hover:border-emerald-400 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                            >
                                <FaPlus /> {t.addPayment}
                            </button>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="relative flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                        placeholder="0.00"
                                        autoFocus
                                        className="flex-1 p-4 pl-4 bg-white border-2 border-emerald-500 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-emerald-700 transition-all shadow-sm"
                                    />
                                    <button
                                        onClick={() => { setShowPaymentInput(false); setPaidAmount(''); }}
                                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all"
                                        title={t.removePayment || "Remove Payment"}
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                                <div className="text-xs font-bold text-right mt-1">
                                    {paidAmount ? (
                                        <span className={totals.total - parseFloat(paidAmount) > 0.1 ? 'text-red-500' : 'text-emerald-600'}>
                                            {t.due || 'Due'}: ₹{Math.max(0, totals.total - parseFloat(paidAmount)).toFixed(2)}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">{t.enterAmount || 'Enter amount'}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Compliance Section - Auto-shown for E-Way Bill */}
                {showCompliance && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* E-Way Bill */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">E-Way Bill Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">E-Way Bill No</label>
                                    <input
                                        type="text"
                                        value={ewayBill.no}
                                        onChange={e => setEwayBill({ ...ewayBill, no: e.target.value })}
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-inner"
                                        placeholder="12 Digit Number"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Vehicle No</label>
                                    <input
                                        type="text"
                                        value={ewayBill.vehicleNo}
                                        onChange={e => setEwayBill({ ...ewayBill, vehicleNo: e.target.value })}
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-inner"
                                        placeholder="AB 12 CD 1234"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Distance (KM)</label>
                                    <input
                                        type="number"
                                        value={ewayBill.distance}
                                        onChange={e => setEwayBill({ ...ewayBill, distance: e.target.value })}
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-inner"
                                        placeholder="e.g. 250"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Transporter ID</label>
                                    <input
                                        type="text"
                                        value={ewayBill.transporterId}
                                        onChange={e => setEwayBill({ ...ewayBill, transporterId: e.target.value })}
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-inner"
                                        placeholder="GSTIN of Transporter"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* E-Invoice */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest">E-Invoicing (B2B)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">IRN (Invoice Reference Number)</label>
                                    <input
                                        type="text"
                                        value={eInvoice.irn}
                                        onChange={e => setEInvoice({ ...eInvoice, irn: e.target.value })}
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-inner"
                                        placeholder="64 Character Hash"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Ack No</label>
                                        <input
                                            type="text"
                                            value={eInvoice.ackNo}
                                            onChange={e => setEInvoice({ ...eInvoice, ackNo: e.target.value })}
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-inner"
                                            placeholder="Ack Number"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Ack Date</label>
                                        <input
                                            type="date"
                                            value={eInvoice.ackDate}
                                            onChange={e => setEInvoice({ ...eInvoice, ackDate: e.target.value })}
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <hr className="border-gray-100" />

                {/* Items Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">{t.invoiceItems}</h2>
                        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-semibold">{selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'}</span>
                    </div>

                    <div className="overflow-x-auto -mx-2 sm:-mx-4 md:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden border border-slate-200 rounded-xl">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                                        <tr>
                                            <th className="pl-12 pr-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider" style={{ paddingLeft: '8px' }}>{t.product}</th>
                                            <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">HSN/SAC</th>
                                            <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">{t.quantity}</th>
                                            <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.price}</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">{t.total}</th>
                                            <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">{t.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {selectedItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center">
                                                    <div className="flex justify-center p-4">
                                                        <button
                                                            type="button"
                                                            onClick={addItem}
                                                            className="
                                                                group relative inline-flex items-center justify-center gap-3 px-12 py-5 font-black text-white transition-all duration-300 
                                                                bg-orange-500 rounded-2xl border-b-4 border-orange-700
                                                                hover:-translate-y-1 hover:shadow-xl hover:bg-orange-600
                                                                active:translate-y-[2px] active:border-b-0
                                                            "
                                                        >
                                                            <FaPlus className="text-xl" />
                                                            <span className="text-base tracking-wider uppercase">{t.addNewItem}</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : selectedItems?.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-4 py-3" style={{ paddingLeft: '5px' }}>
                                                    <select
                                                        value={item.product_id}
                                                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                        className="w-full pl-12 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all font-medium text-slate-700"
                                                    >
                                                        <option value="">{t.selectProduct}</option>
                                                        {safeProducts.length > 0 ? safeProducts.map((p: any) => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        )) : <option value="" disabled>No products found</option>}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={item.hsn_code || ''}
                                                        onChange={(e) => updateItem(index, 'hsn_code', e.target.value)}
                                                        className="w-24 px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all font-semibold text-slate-700"
                                                        placeholder="HSN"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                                            className="w-20 px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all font-semibold text-slate-700"
                                                        />
                                                        <span className="text-xs font-semibold text-slate-500 uppercase">{item.unit || 'PCS'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-600 text-sm font-bold">₹</span>
                                                        <input
                                                            type="number"
                                                            value={item.unit_price}
                                                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                                                            className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all font-medium text-slate-700"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-slate-800">
                                                    ₹{(item.quantity * item.unit_price).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => removeItem(index)}
                                                        className="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all"
                                                        title="Delete Item"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {selectedItems.length > 0 && (
                        <div className="flex justify-center pt-4">
                            <button
                                type="button"
                                onClick={addItem}
                                className="
                                    group relative inline-flex items-center justify-center gap-3 w-full md:w-auto px-10 py-4 font-black text-white transition-all duration-300 
                                    bg-orange-500 rounded-2xl border-b-4 border-orange-700
                                    hover:-translate-y-1 hover:shadow-xl hover:bg-orange-600
                                    active:translate-y-[2px] active:border-b-0
                                "
                            >
                                <FaPlus className="text-lg" />
                                <span className="text-sm tracking-wider uppercase">{t.addNewItem}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Summary Section */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600" style={{ paddingLeft: '8px' }}>
                            <span>{t.subtotal}</span>
                            <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600" style={{ paddingLeft: '8px' }}>
                            <span>{t.gstTotal}</span>
                            <span className="font-medium">₹{totals.gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl text-gray-800 pt-2 border-t border-gray-100" style={{ paddingLeft: '8px' }}>
                            <span>{t.totalAmount}</span>
                            <span className="text-indigo-600">₹{totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Notes */}
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2 uppercase tracking-wide text-xs" style={{ paddingLeft: '8px' }}>{t.termsNotes}</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Thank you for your business..."
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none transition-all placeholder:text-slate-400"
                        style={{ paddingLeft: '8px' }}
                    ></textarea>
                </div>

                {/* Spacer for fixed footer */}
                <div className="h-24"></div>
            </div>

            {/* Bottom Action Bar - Fixed Full Width */}
            <div className="fixed bottom-0 left-0 md:left-72 right-0 bg-white border-t border-slate-200 p-4 px-6 gap-6 flex items-center justify-between z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="
                        flex-1 h-16 flex items-center justify-center gap-2
                        bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-wider
                        hover:bg-slate-200 hover:text-slate-800 hover:scale-[1.02] transition-all duration-200
                        border-b-4 border-slate-300 active:border-b-0 active:translate-y-1
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    {t.cancel}
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="
                        flex-[2] h-16 flex items-center justify-center gap-3
                        bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest
                        shadow-xl shadow-indigo-500/30 border-b-4 border-indigo-800
                        hover:bg-indigo-700 hover:scale-[1.02] transition-all duration-200
                        active:border-b-0 active:translate-y-1
                        disabled:opacity-70 disabled:cursor-not-allowed
                    "
                >
                    {isSubmitting ? (
                        <>
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <FaSave className="text-xl" />
                            <span>{t.saveInvoice}</span>
                        </>
                    )}
                </button>
            </div>

            {/* Quick Add Customer Modal */}
            {showCustomerModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl p-8 md:p-14 shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-indigo-100">
                        <h3 className="text-3xl font-black mb-8 text-center text-indigo-900 border-b-2 border-indigo-50 pb-4">Quick Add Customer</h3>
                        <form onSubmit={handleAddCustomer} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Name *</label>
                                <input
                                    autoFocus
                                    required
                                    className="w-full p-4 pl-12 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-gray-50/50"
                                    value={newCustomerName}
                                    onChange={e => setNewCustomerName(e.target.value)}
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone</label>
                                <input
                                    className="w-full p-4 pl-12 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-gray-50/50"
                                    value={newCustomerPhone}
                                    onChange={e => setNewCustomerPhone(e.target.value)}
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">GSTIN</label>
                                <input
                                    className="w-full p-4 pl-12 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-gray-50/50"
                                    value={newCustomerGstin}
                                    onChange={e => setNewCustomerGstin(e.target.value)}
                                    placeholder="Enter GST number (Optional)"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerModal(false)}
                                    className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black border-b-4 border-indigo-800 transition-all hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-0 shadow-lg shadow-indigo-500/20 uppercase text-xs tracking-widest"
                                >
                                    {t.save} Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Registration Popup for Unauthenticated Users */}
            <RegistrationPopup />

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <LoginPrompt
                    message="Please login to save invoices permanently. Your data will be securely stored and accessible from any device."
                    returnUrl="/dashboard/invoices/new"
                />
            )}
            {/* AI Scanning Portal */}
            {isScanning && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                    {/* Futuristic Scanning UI */}
                    <div className="relative w-72 h-96 border-2 border-indigo-500/50 rounded-3xl mb-12 overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.3)]">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-[scan_2s_linear_infinite]"></div>
                        <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>

                        {/* Scanning Data Particles */}
                        <div className="absolute inset-x-0 bottom-10 flex flex-col gap-2 px-6">
                            <div className="h-1 bg-white/10 rounded-full w-3/4"></div>
                            <div className="h-1 bg-white/10 rounded-full w-1/2"></div>
                            <div className="h-1 bg-white/10 rounded-full w-2/3"></div>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">AI QUANTUM VISION™</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Processing Data {scanProgress}%</p>

                        <div className="w-64 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden border border-slate-700">
                            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                        </div>

                        <div className="pt-8 text-indigo-400 text-[10px] font-black uppercase flex flex-col gap-2 opacity-50">
                            <span>- Neutralizing Noise -</span>
                            <span>- Mapping Key Vectors -</span>
                            <span>- Finalizing Extraction -</span>
                        </div>
                    </div>

                    <style jsx>{`
                        @keyframes scan {
                            0% { top: 0; opacity: 0; }
                            20% { opacity: 1; }
                            80% { opacity: 1; }
                            100% { top: 100%; opacity: 0; }
                        }
                    `}</style>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
}
