'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
    FaPlus, FaTrash, FaSave, FaArrowLeft, FaMicrophone, FaMagic,
    FaRobot, FaCheck, FaTimes, FaCamera, FaUserPlus, FaFileInvoice,
    FaBox, FaTruck, FaReceipt, FaRoad, FaCogs, FaSignature, FaChevronLeft
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
    const businessProfile = useStore((state: any) => state.businessProfile) || {};

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
        whatsappShare: true,
        eInvoice: false,
        emailInvoice: false,
        recurring: false
    });

    // UI States
    const [isListening, setIsListening] = useState(false);
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

    // Reference
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Safe Data
    const safeCustomers = (Array.isArray(customers) ? customers : []).filter((c: any) => c?.id && c?.name);
    const safeProducts = (Array.isArray(products) ? products : []).filter((p: any) => p?.id && p?.name && p?.status !== 'INACTIVE');

    useEffect(() => {
        setIsClient(true);
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
    }, [isDuplicating, quotations, businessProfile]);

    // Totals Calculation
    const calculateTotals = () => {
        let subtotal = 0;
        let gst = 0;

        selectedItems.forEach(item => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unit_price) || 0;
            const rate = Number(item.gst_rate) || 0;
            const base = qty * price;
            subtotal += base;
            gst += (base * rate) / 100;
        });

        const discountAmt = subtotal * (discountPct / 100);
        const grandTotal = subtotal - discountAmt + gst + Number(extraCharge) + Number(shippingCharge);

        return { subtotal, gst, discountAmt, grandTotal };
    };

    const totals = calculateTotals();

    // Handlers
    const addItem = () => {
        setSelectedItems([...selectedItems, { product_id: '', quantity: 1, unit_price: 0, gst_rate: 18, hsn_code: '', unit: 'PCS' }]);
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

    const startVoiceBilling = () => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return toast.error('Voice perception not supported');
        const recognition = new SR();
        recognition.lang = settings.language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e: any) => {
            const transcript = e.results[0][0].transcript.toLowerCase();
            processAICommand(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const processAICommand = (text: string) => {
        const words = text.toLowerCase();
        let qty = 1;
        const qtyMatch = words.match(/\d+/);
        if (qtyMatch) qty = parseInt(qtyMatch[0]);

        let bestMatch = null;
        let maxScore = 0;

        safeProducts.forEach((p: any) => {
            const pName = p.name.toLowerCase();
            let score = 0;

            if (words.includes(pName)) {
                score = 100;
            } else {
                // Fuzzy match: check if common words exist
                const pWords = pName.split(' ').filter((w: string) => w.length > 2);
                const matchCount = pWords.filter((w: string) => words.includes(w)).length;
                if (matchCount > 0) {
                    score = (matchCount / pWords.length) * 80;
                }
            }

            if (score > maxScore && score > 30) {
                maxScore = score;
                bestMatch = p;
            }
        });

        if (bestMatch) {
            const p = bestMatch as any;
            // Check if already exists to avoid duplicates or just append
            setSelectedItems(prev => [...prev, {
                product_id: p.id,
                product_name: p.name,
                quantity: qty,
                unit_price: p.price,
                gst_rate: p.gst_rate || 18,
                hsn_code: p.hsn_code,
                unit: p.unit || 'PCS'
            }]);
            toast.success(`Added ${qty} ${p.name}`);
        } else {
            toast.error(`नहीं मिला: ${text}`);
        }
    };

    const handleMagicScan = () => fileInputRef.current?.click();

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
        if (!newCustName || !newCustPhone) return toast.error('Name or Phone zaroori hai');
        try {
            const newCust = {
                id: generateId(),
                name: newCustName,
                phone: newCustPhone,
                gstin: newCustGstin,
                address: newCustAddress,
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
                toast.success('Customer added & selected');
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
            const customer = safeCustomers.find(c => c.id === customerId);
            const breakdown = calculateInvoiceTotal(selectedItems, false);

            const invoice = {
                id: generateId(),
                invoice_number: invoiceNumber,
                customer: {
                    id: customerId,
                    name: customer?.name || 'Local Sale',
                    gstin: customer?.gstin || '',
                    phone: customer?.phone || '',
                    address: customer?.address || ''
                },
                invoice_date: invoiceDate,
                due_date: dueDate,
                items: selectedItems,
                subtotal: totals.subtotal,
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

                // Handle WhatsApp Auto-share
                if (options.whatsappShare) {
                    const phone = customer?.phone?.replace(/\D/g, '');
                    const text = `Hi ${customer?.name}, your invoice #${invoiceNumber} for ₹${totals.grandTotal.toFixed(2)} is ready. View it here: ${window.location.origin}/view/${result.id || invoice.id}`;
                    const url = phone ? `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                }

                router.push('/dashboard/invoices');
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
        <div className="new-invoice-page">
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
                
                .doc-tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
                .dtab { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px; border-radius: 14px; border: 2px solid var(--border); background: var(--faint); cursor: pointer; transition: 0.2s; }
                .dtab.active { background: #eef2ff; border-color: var(--indigo); color: var(--indigo); font-weight: 700; }
                .dt-label { font-size: 10px; text-transform: uppercase; text-align: center; }
                
                .fg { margin-bottom: 20px; }
                .fl { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; display: block; }
                .fi { width: 100%; padding: 12px 16px; border: 2px solid var(--border); border-radius: 12px; font-size: 14px; transition: 0.2s; background: var(--faint); outline: none; }
                .fi:focus { border-color: var(--indigo); background: white; box-shadow: 0 0 0 4px var(--iglow); }
                
                .inv-pill { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                .ip-num { font-family: 'DM Mono', monospace; font-weight: 600; color: var(--indigo); }
                
                .new-btn { background: var(--green); color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 13px; }
                .cprev { background: #f0fdf9; border: 2px solid #a7f3d0; border-radius: 15px; padding: 15px; display: flex; align-items: center; gap: 15px; margin-top: 15px; }
                .c-av { width: 45px; height: 45px; border-radius: 12px; background: var(--green); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: white; }
                .c-bal { margin-left: auto; color: var(--red); font-weight: 800; font-size: 12px; background: #fee2e2; padding: 6px 12px; border-radius: 8px; }

                .item-card { background: var(--faint); border: 2px solid var(--border); border-radius: 16px; padding: 20px; position: relative; margin-bottom: 12px; }
                .i-num { width: 30px; height: 30px; background: var(--indigo); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; position: absolute; left: -10px; top: -10px; box-shadow: 0 4px 10px rgba(91,94,244,0.3); }
                .add-item-btn { width: 100%; padding: 15px; border: 2px dashed var(--indigo); border-radius: 15px; color: var(--indigo); font-weight: 800; background: #eef2ff; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
                .add-item-btn:hover { background: #e0e7ff; }

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
                  .form-outer { grid-template-columns: 1fr; padding: 0 15px 120px; gap: 15px; }
                  .page-hdr { padding: 20px 15px; margin-bottom: 1rem; }
                  .ph-title { font-size: 20px; }
                  .ph-sub { font-size: 11px; }
                  .stepper { overflow-x: auto; padding-bottom: 10px; margin-top: 15px; }
                  .s-line { min-width: 30px; }
                  .card { padding: 15px; border-radius: 16px; }
                  .bottom-bar { padding: 10px 15px; height: auto; flex-direction: column; gap: 10px; }
                  .bb-save { width: 100%; justify-content: center; padding: 12px; font-size: 14px; }
                  .doc-tabs { grid-template-columns: repeat(2, 1fr); gap: 8px; }
                  .dtab { padding: 10px 5px; }
                  .item-card { padding: 12px; }
                  .i-num { left: 5px; top: -15px; }
                  .grand-total { font-size: 24px; }
                  .fbadge { padding: 8px 12px; font-size: 11px; flex: 1; justify-content: center; }
                  .fi { padding: 10px 12px; font-size: 13px; }
                }

                @media (max-width: 480px) {
                  .doc-tabs { grid-template-columns: repeat(2, 1fr); }
                  .pay-grid { grid-template-columns: 1fr; }
                  .inv-pill { padding: 10px; }
                  .ip-num { font-size: 12px; }
                }
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
                    <div className="flex flex-row w-full md:w-auto gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <button type="button" onClick={startVoiceBilling} className={`fbadge fb-voice whitespace-nowrap ${isListening ? 'animate-pulse' : ''}`}><FaMicrophone /> {isListening ? 'Listening...' : 'Voice Bill'}</button>
                        <button type="button" onClick={handleMagicScan} className="fbadge fb-scan whitespace-nowrap"><FaMagic /> Magic Scan</button>
                        <button type="button" onClick={() => toast('AI Assistant coming soon')} className="fbadge fb-ai whitespace-nowrap"><FaRobot /> AI Assist</button>
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
                        <div className="doc-tabs">
                            <div className={`dtab ${docType === DOC_TYPES.TAX_INVOICE ? 'active' : ''}`} onClick={() => setDocType(DOC_TYPES.TAX_INVOICE)}><span className="dt-icon">🧾</span><span className="dt-label">Tax Invoice</span></div>
                            <div className={`dtab ${docType === DOC_TYPES.BILL_OF_SUPPLY ? 'active' : ''}`} onClick={() => setDocType(DOC_TYPES.BILL_OF_SUPPLY)}><span className="dt-icon">📋</span><span className="dt-label">Bill Supply</span></div>
                            <div className={`dtab ${docType === DOC_TYPES.DELIVERY_CHALLAN ? 'active' : ''}`} onClick={() => setDocType(DOC_TYPES.DELIVERY_CHALLAN)}><span className="dt-icon">🚚</span><span className="dt-label">Del. Challan</span></div>
                            <div className={`dtab ${docType === DOC_TYPES.E_WAY_BILL ? 'active' : ''}`} onClick={() => setDocType(DOC_TYPES.E_WAY_BILL)}><span className="dt-icon">🛣</span><span className="dt-label">E-Way Bill</span></div>
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
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="fl">{t.customer} *</label>
                                    <select className="fi" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                                        <option value="">Select Customer</option>
                                        {safeCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <button type="button" onClick={() => setShowCustomerModal(true)} className="new-btn mt-6 flex items-center justify-center h-[52px]"><FaPlus /></button>
                            </div>
                        </div>

                        {selectedCustomer && (
                            <div className="cprev">
                                <div className="c-av">{selectedCustomer.name[0]}</div>
                                <div>
                                    <div className="c-name">{selectedCustomer.name}</div>
                                    <div className="text-[11px] text-slate-400 font-bold">{selectedCustomer.phone || selectedCustomer.gstin || 'Registered Party'}</div>
                                </div>
                                <div className="c-bal">₹0 due</div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6 mt-6">
                            <div className="fg"><label className="fl">Invoice Date</label><input type="date" className="fi" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
                            <div className="fg"><label className="fl">Due Date</label><input type="date" className="fi" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
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
                                                <select className="fi" value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                                                    <option value="">Select Product</option>
                                                    {safeProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Qty & Unit</label>
                                                <div className="flex gap-1">
                                                    <input type="number" className="fi" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                                                    <select className="fi px-2" value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)}>
                                                        <option>PCS</option><option>KG</option><option>BOX</option><option>MTR</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Price (₹)</label>
                                                <input type="number" className="fi" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">GST %</label>
                                                <select className="fi" value={item.gst_rate} onChange={e => updateItem(idx, 'gst_rate', e.target.value)}>
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

                        <button type="button" onClick={addItem} className="add-item-btn mt-6">
                            <FaPlus /> {t.addNewItem}
                        </button>
                    </div>

                    {/* Notes & Terms */}
                    <div className="card">
                        <div className="c-title"><div className="c-icon" style={{ background: '#f1f5f9', color: '#64748b' }}><FaReceipt /></div> {t.termsNotes}</div>
                        <textarea className="fi min-h-[100px] bg-slate-50 border-dashed" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Terms & conditions or personal message..."></textarea>
                    </div>
                </div>

                {/* Right Column */}
                <div className="right-col">
                    {/* Totals Summary */}
                    <div className="totals-box mb-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center opacity-60"><span className="text-xs">{t.subtotal}</span><span className="t-val">₹{totals.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center opacity-60"><span className="text-xs">Discount</span><span className="t-val text-green-400">- ₹{totals.discountAmt.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center opacity-60"><span className="text-xs">GST Total</span><span className="t-val">₹{totals.gst.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center opacity-60"><span className="text-xs">Other Charges</span><span className="t-val">₹{(Number(extraCharge) + Number(shippingCharge)).toFixed(2)}</span></div>
                            <div className="border-t border-white/10 pt-4 mt-2">
                                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-widest block">{t.totalAmount}</span>
                                <span className="grand-total">₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="card">
                        <div className="c-title"><div className="c-icon" style={{ background: '#fef9c3', color: '#854d0e' }}><FaReceipt /></div> Payment Details</div>
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

                    {/* Extra Charges */}
                    <div className="card">
                        <div className="c-title"><div className="c-icon" style={{ background: '#fff7ed', color: '#c2410c' }}><FaTruck /></div> Discount & Shipping</div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><label className="fl">Discount (%)</label><input type="number" className="fi" value={discountPct} onChange={e => setDiscountPct(Number(e.target.value))} /></div>
                            <div><label className="fl">Extra Fee (₹)</label><input type="number" className="fi" value={extraCharge} onChange={e => setExtraCharge(Number(e.target.value))} /></div>
                        </div>
                        <div><label className="fl">Shipping (₹)</label><input type="number" className="fi" value={shippingCharge} onChange={e => setShippingCharge(Number(e.target.value))} /></div>
                    </div>

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

                    {/* Digital Signature */}
                    <div className="card">
                        <div className="c-title"><div className="c-icon" style={{ background: '#fdf4ff', color: '#a21caf' }}><FaSignature /></div> Digital Signature</div>
                        <div className="w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:border-indigo-300 transition-all">Sign or upload here</div>
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
                <div className="fixed inset-0 bg-ink/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-[500px] overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="bg-indigo-600 p-8 text-white relative">
                            <button
                                type="button"
                                onClick={() => setShowCustomerModal(false)}
                                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/80 hover:text-white"
                                aria-label="Close"
                            >
                                <FaTimes size={18} />
                            </button>
                            <h3 className="text-2xl font-black italic">Quick Add Party</h3>
                            <p className="text-indigo-100 text-xs mt-1">Add details of your new registered customer</p>
                        </div>
                        <div className="p-8 space-y-4">
                            <input className="fi" placeholder="Business / Name" value={newCustName} onChange={e => setNewCustName(e.target.value)} />
                            <input className="fi" placeholder="Phone Number" value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} maxLength={10} />
                            <input className="fi" placeholder="GSTIN (Optional)" value={newCustGstin} onChange={e => setNewCustGstin(e.target.value.toUpperCase())} />
                            <textarea className="fi" placeholder="Full Address" value={newCustAddress} onChange={e => setNewCustAddress(e.target.value)}></textarea>
                            <div className="flex gap-3">
                                <button type="button" className="fi bg-slate-100 border-none" onClick={() => setShowCustomerModal(false)}>Cancel</button>
                                <button type="button" className="bb-save w-full" onClick={handleAddCustomer}>Save & Select</button>
                            </div>
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
