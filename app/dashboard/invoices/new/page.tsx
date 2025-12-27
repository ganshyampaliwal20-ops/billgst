'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaUserPlus } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Safe ID generator
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export default function NewInvoicePage() {
    const router = useRouter();

    // Select state individually to prevent destructuring errors
    const customers = useStore((state: any) => state.customers);
    const products = useStore((state: any) => state.products);
    const addInvoice = useStore((state: any) => state.addInvoice);
    const addCustomer = useStore((state: any) => state.addCustomer);

    const [isClient, setIsClient] = useState(false);

    // Form State
    const [customerId, setCustomerId] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [paidAmount, setPaidAmount] = useState('');
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [notes, setNotes] = useState('');
    const [showPaymentInput, setShowPaymentInput] = useState(false);

    // Modal State
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Safety checks for arrays
    const safeCustomers = Array.isArray(customers) ? customers : [];
    const safeProducts = Array.isArray(products) ? products : [];

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
                    unit: product.unit || 'PCS'
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

    // Calculate Totals
    const calculateTotals = () => {
        return selectedItems.reduce((acc, item) => {
            const amount = item.quantity * item.unit_price;
            const gstAmount = (amount * item.gst_rate) / 100;
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

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        if (!customerId) {
            toast.error('Please select a customer');
            return;
        }
        if (selectedItems.length === 0) {
            toast.error('Please add at least one item');
            return;
        }


        // Validate all items have products selected
        const hasEmptyProducts = selectedItems.some(item => !item.product_id);
        if (hasEmptyProducts) {
            toast.error('Please select a product for all items');
            return;
        }

        // Check stock availability for each product
        const outOfStockItems = [];
        for (const item of selectedItems) {
            const product = products.find((p: any) => p.id === item.product_id);
            if (product) {
                const availableStock = product.stock_quantity || 0;
                if (availableStock < item.quantity) {
                    outOfStockItems.push({
                        name: item.product_name,
                        requested: item.quantity,
                        available: availableStock
                    });
                }
            }
        }

        if (outOfStockItems.length > 0) {
            const errorMessage = outOfStockItems.map(item =>
                `${item.name}: ${item.requested} requested but only ${item.available} available`
            ).join('\n');
            toast.error(`Stock not available:\n${errorMessage}`, { duration: 5000 });
            return;
        }

        setIsSubmitting(true);

        try {
            const customer = safeCustomers.find((c: any) => c.id === customerId);

            // Add total_amount to each item for PDF generation
            const itemsWithTotals = selectedItems.map(item => {
                const itemSubtotal = item.quantity * item.unit_price;
                const itemGST = (itemSubtotal * item.gst_rate) / 100;
                return {
                    ...item,
                    total_amount: itemSubtotal + itemGST
                };
            });

            // Calculate GST breakdown using utility function
            const { calculateInvoiceTotal } = await import('@/lib/gst-calculator');
            const gstBreakdown = calculateInvoiceTotal(selectedItems, false); // false = intra-state (CGST+SGST)

            // Calculate Status
            const totalAmount = gstBreakdown.total_amount;
            const paid = parseFloat(paidAmount) || 0;
            let status = 'UNPAID';
            if (paid >= totalAmount) status = 'PAID';
            else if (paid > 0) status = 'PARTIAL';

            const newInvoice = {
                id: generateId(),
                invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
                customer: {
                    id: customerId,
                    name: customer?.name || 'Unknown',
                    email: customer?.email,
                    address: customer?.address,
                    gstin: customer?.gstin
                },
                invoice_date: invoiceDate,
                items: itemsWithTotals,
                subtotal: gstBreakdown.subtotal,
                cgst_amount: gstBreakdown.cgst_amount,
                sgst_amount: gstBreakdown.sgst_amount,
                igst_amount: gstBreakdown.igst_amount,
                total_amount: gstBreakdown.total_amount,
                paid_amount: paid,
                payment_status: status,
                total_tax: gstBreakdown.cgst_amount + gstBreakdown.sgst_amount + gstBreakdown.igst_amount,
                status: status,
                notes: notes,
                created_at: new Date().toISOString()
            };

            // Properly await the async call
            const result = await addInvoice(newInvoice);

            // addInvoice already shows toast and navigates on success
            // Only navigate if result is successful
            if (result?.success || result?.id) {
                toast.success('Invoice created successfully!');
                router.push('/dashboard/invoices');
            } else if (result?.error) {
                toast.error(`Failed: ${result.error}`);
            } else {
                console.error('Save Invoice Failed with Unknown Result:', result);
                toast.error(`Failed: ${JSON.stringify(result)}`);
            }
        } catch (error: any) {
            console.error('Submission Error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20 px-2 sm:px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/invoices" className="p-2.5 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-200">
                        <FaArrowLeft className="text-indigo-600" size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">New Invoice</h1>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">Create a professional invoice for your customer</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 md:p-10 space-y-6 md:space-y-8">
                {/* Customer & Dates */}
                {/* Customer & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Customer Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Customer</label>
                            <button
                                onClick={() => setShowCustomerModal(true)}
                                className="group flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-200"
                            >
                                <FaPlus className="text-[10px] group-hover:rotate-90 transition-transform" />
                                NEW CLIENT
                            </button>
                        </div>
                        <div className="relative group">
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none font-bold text-slate-700 transition-all shadow-sm hover:border-slate-300"
                            >
                                <option value="">Select a Client...</option>
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
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Invoice Date</label>
                        <input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none font-bold text-slate-700 transition-all shadow-sm"
                        />
                    </div>

                    {/* Payment Status (Toggle) */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Payment Details</label>

                        {!showPaymentInput ? (
                            <button
                                onClick={() => setShowPaymentInput(true)}
                                className="w-full p-4 border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 hover:border-emerald-400 transition-all flex items-center justify-center gap-2"
                            >
                                <FaPlus /> Add Payment / Advance
                            </button>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                        placeholder="0.00"
                                        autoFocus
                                        className="w-full p-4 pl-8 bg-white border-2 border-emerald-500 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-emerald-700 transition-all shadow-sm"
                                    />
                                    <button
                                        onClick={() => { setShowPaymentInput(false); setPaidAmount(''); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-1"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                                <div className="text-xs font-bold text-right mt-1">
                                    {paidAmount ? (
                                        <span className={totals.total - parseFloat(paidAmount) > 0.1 ? 'text-red-500' : 'text-emerald-600'}>
                                            Due: ₹{Math.max(0, totals.total - parseFloat(paidAmount)).toFixed(2)}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">Enter amount received</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Items Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">Invoice Items</h2>
                        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-semibold">{selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'}</span>
                    </div>

                    <div className="overflow-x-auto -mx-4 sm:-mx-6 md:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden border border-slate-200 rounded-xl">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                                        <tr>
                                            <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Product</th>
                                            <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity</th>
                                            <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Price</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Total</th>
                                            <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Action</th>
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
                                                        <p className="text-xs text-slate-400">Click &quot;Add Item&quot; below to get started</p>
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
                                                        <option value="">Select Product</option>
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

                    <div className="flex justify-center pt-3">
                        <button
                            type="button"
                            onClick={addItem}
                            className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-indigo-600 font-lg rounded-full hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                        >
                            <FaPlus className="mr-2 text-sm group-hover:rotate-90 transition-transform" />
                            ADD NEW ITEM
                        </button>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>GST Total</span>
                            <span className="font-medium">₹{totals.gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl text-gray-800 pt-2 border-t border-gray-100">
                            <span>Total Amount</span>
                            <span className="text-indigo-600">₹{totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2 uppercase tracking-wide text-xs">Terms / Notes</label>
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
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-black/25 flex items-center gap-2 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <FaSave className="text-lg" />
                                SAVE INVOICE
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
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
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Save Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

}
