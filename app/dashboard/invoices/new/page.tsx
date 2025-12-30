'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTrash, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { translations } from '@/lib/translations';
import RegistrationPopup from '@/app/dashboard/RegistrationPopup';
import LoginPrompt from '@/app/components/LoginPrompt';
import { useSession } from 'next-auth/react';
import { calculateInvoiceTotal } from '@/lib/gst-calculator';

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

    // CRITICAL: All useState hooks MUST be above any conditional returns
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Set date only on client side to avoid hydration errors
        setInvoiceDate(new Date().toISOString().split('T')[0]);

        // Handle Duplication logic
        const params = new URLSearchParams(window.location.search);
        const duplicateId = params.get('duplicateId');

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
        }
    }, [isDuplicating]);

    // Safety checks for arrays - Filter out nulls/undefined items
    const rawCustomers = Array.isArray(customers) ? customers : [];
    const safeCustomers = rawCustomers.filter((c: any) => c && typeof c === 'object' && c.id && c.name);

    const rawProducts = Array.isArray(products) ? products : [];
    const safeProducts = rawProducts.filter((p: any) => p && typeof p === 'object' && p.id && p.name);

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
            created_at: new Date().toISOString()
        });

        setCustomerId(newId);
        setShowCustomerModal(false);
        setNewCustomerName('');
        setNewCustomerPhone('');
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
                invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000).toString()}`,
                customer: {
                    id: customerId,
                    name: customer?.name || 'Unknown',
                    email: customer?.email || '',
                    address: customer?.address || '',
                    gstin: customer?.gstin || ''
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
        <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4 sm:px-6 md:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 sm:px-0">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/invoices" className="p-2.5 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-200">
                        <FaArrowLeft className="text-indigo-600" size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t.newInvoice}</h1>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">Create a professional invoice for your customer</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 md:p-10 space-y-6 md:space-y-8 mx-2 sm:mx-0">
                {/* Customer & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Customer Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t.customer}</label>
                            <button
                                onClick={() => setShowCustomerModal(true)}
                                className="
                                    group flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black 
                                    transition-all border-b-4 border-indigo-800 hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-0
                                    shadow-lg shadow-indigo-500/20
                                "
                            >
                                <FaPlus className="text-[10px] group-hover:rotate-90 transition-transform" />
                                {t.newClient || 'NEW CLIENT'}
                            </button>
                        </div>
                        <div className="relative group">
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none font-bold text-slate-700 transition-all shadow-sm hover:border-slate-300"
                            >
                                <option value="">{t.selectCustomer}</option>
                                {safeCustomers.length > 0 ? safeCustomers.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                )) : <option value="" disabled>No customers found</option>}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t.invoiceDate}</label>
                        <input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none font-bold text-slate-700 transition-all shadow-sm"
                        />
                    </div>

                    {/* Payment Status (Toggle) */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">{t.paymentDetails}</label>

                        {!showPaymentInput ? (
                            <button
                                onClick={() => setShowPaymentInput(true)}
                                className="w-full p-4 border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 hover:border-emerald-400 transition-all flex items-center justify-center gap-2"
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

                {/* Compliance Section */}
                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => setShowCompliance(!showCompliance)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider hover:text-indigo-600 transition-colors bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
                    >
                        <span className={`transform transition-transform ${showCompliance ? 'rotate-90' : ''}`}>▶</span>
                        Compliance & E-Way Bill Details (Optional)
                    </button>

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
                </div>

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
                                            <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.product}</th>
                                            <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">{t.quantity}</th>
                                            <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">{t.price}</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">{t.total}</th>
                                            <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">{t.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {selectedItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                            <FaPlus className="text-slate-400 text-2xl" />
                                                        </div>
                                                        <p className="text-slate-500 font-medium">No items added yet</p>
                                                        <p className="text-xs text-slate-400">Click &quot;{t.addNewItem}&quot; below to get started</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : selectedItems?.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={item.product_id}
                                                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all font-medium text-slate-700"
                                                    >
                                                        <option value="">{t.selectProduct}</option>
                                                        {safeProducts.length > 0 ? safeProducts.map((p: any) => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        )) : <option value="" disabled>No products found</option>}
                                                    </select>
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

                    <div className="flex justify-center pt-4">
                        <button
                            type="button"
                            onClick={addItem}
                            className="
                                group relative inline-flex items-center gap-3 px-10 py-4 font-black text-white transition-all duration-300 
                                bg-orange-500 rounded-2xl border-b-4 border-orange-700
                                hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/40 
                                active:translate-y-[2px] active:border-b-0
                                overflow-hidden
                            "
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none"></div>
                            <FaPlus className="text-base group-hover:rotate-180 transition-transform duration-500 relative z-10" />
                            <span className="text-sm tracking-wider uppercase relative z-10">{t.addNewItem}</span>
                        </button>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{t.subtotal}</span>
                            <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{t.gstTotal}</span>
                            <span className="font-medium">₹{totals.gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl text-gray-800 pt-2 border-t border-gray-100">
                            <span>{t.totalAmount}</span>
                            <span className="text-indigo-600">₹{totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Notes */}
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2 uppercase tracking-wide text-xs">{t.termsNotes}</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Thank you for your business..."
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none transition-all placeholder:text-slate-400"
                    ></textarea>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="px-6 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
                    >
                        {t.cancel}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="
                            relative px-10 py-4 bg-gray-900 text-white font-black rounded-2xl 
                            border-b-4 border-black transition-all duration-200
                            hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/25 
                            active:translate-y-[2px] active:border-b-0
                            flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden
                        "
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none"></div>
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                <span className="uppercase tracking-widest text-sm">Saving...</span>
                            </>
                        ) : (
                            <>
                                <FaSave className="text-lg group-hover:scale-110 transition-transform" />
                                <span className="uppercase tracking-widest text-sm">{t.saveInvoice}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Add Customer Modal */}
            {showCustomerModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold mb-6">Quick Add Customer</h3>
                        <form onSubmit={handleAddCustomer} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                <input
                                    autoFocus
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                    value={newCustomerName}
                                    onChange={e => setNewCustomerName(e.target.value)}
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone}</label>
                                <input
                                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                    value={newCustomerPhone}
                                    onChange={e => setNewCustomerPhone(e.target.value)}
                                    placeholder="Enter phone number"
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
        </div>
    );
}
