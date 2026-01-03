'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTrash, FaSave, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function NewCreditNotePage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const [formData, setFormData] = useState({
        original_invoice_id: '',
        customer_id: '',
        credit_date: new Date().toISOString().split('T')[0],
        reason: '',
        notes: ''
    });

    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invoicesRes, customersRes] = await Promise.all([
                fetch('/api/invoices'),
                fetch('/api/customers')
            ]);
            setInvoices(await invoicesRes.json());
            setCustomers(await customersRes.json());
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleInvoiceSelect = (invoiceId: string) => {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            setSelectedInvoice(invoice);
            setFormData({
                ...formData,
                original_invoice_id: invoiceId,
                customer_id: invoice.customer_id
            });

            // Pre-populate items from invoice
            if (invoice.items && Array.isArray(invoice.items)) {
                setSelectedItems(invoice.items.map((item: any) => ({
                    ...item,
                    quantity: 0  // User can adjust quantities for return
                })));
            }
        }
    };

    const updateItem = (index: number, quantity: number) => {
        const newItems = [...selectedItems];
        newItems[index].quantity = quantity;
        setSelectedItems(newItems);
    };

    const removeItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        return selectedItems.reduce((acc, item) => {
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.unit_price) || 0;
            const gstRate = Number(item.gst_rate) || 0;

            const amount = quantity * unitPrice;
            const gstAmount = (amount * gstRate) / 100;

            return {
                subtotal: acc.subtotal + amount,
                gst: acc.gst + gstAmount,
                total: acc.total + amount + gstAmount
            };
        }, { subtotal: 0, gst: 0, total: 0 });
    };

    const totals = calculateTotals();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.original_invoice_id || selectedItems.length === 0) {
            toast.error('Please select invoice and add items');
            return;
        }

        const validItems = selectedItems.filter(item => item.quantity > 0);
        if (validItems.length === 0) {
            toast.error('Please specify quantities for return items');
            return;
        }

        setIsSubmitting(true);

        try {
            const creditNoteData = {
                credit_note_number: `CN-${Math.floor(1000 + Math.random() * 9000)}`,
                original_invoice_id: formData.original_invoice_id,
                customer_id: formData.customer_id,
                credit_date: formData.credit_date,
                items: validItems,
                subtotal: totals.subtotal,
                cgst_amount: totals.gst / 2,
                sgst_amount: totals.gst / 2,
                igst_amount: 0,
                total_amount: totals.total,
                reason: formData.reason,
                notes: formData.notes
            };

            const res = await fetch('/api/credit-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creditNoteData)
            });

            if (res.ok) {
                toast.success('Credit Note created successfully!');
                router.push('/dashboard/credit-notes');
            } else {
                toast.error('Failed to create credit note');
            }
        } catch (error) {
            toast.error('Error creating credit note');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/credit-notes" className="p-2.5 hover:bg-rose-50 rounded-xl transition">
                    <FaArrowLeft className="text-rose-600" size={18} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
                        New Credit Note
                    </h1>
                    <p className="text-sm text-slate-600 mt-0.5">Issue credit note for returns or adjustments</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-8">
                {/* Invoice Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Original Invoice *</label>
                        <select
                            required
                            value={formData.original_invoice_id}
                            onChange={(e) => handleInvoiceSelect(e.target.value)}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold"
                        >
                            <option value="">Select Invoice</option>
                            {invoices.map(inv => (
                                <option key={inv.id} value={inv.id}>
                                    {inv.invoice_number} - ₹{Number(inv.total_amount).toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Credit Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.credit_date}
                            onChange={(e) => setFormData({ ...formData, credit_date: e.target.value })}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-rose-500 outline-none font-bold"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Reason for Credit Note *</label>
                    <input
                        type="text"
                        required
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="e.g., Product return, Damaged goods, Price adjustment"
                        className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-rose-500 outline-none"
                    />
                </div>

                <hr className="border-slate-100" />

                {/* Items */}
                {selectedItems.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">Return Items</h2>
                        <p className="text-sm text-slate-600">Specify quantities for items being returned/adjusted</p>

                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-gradient-to-r from-rose-50 to-red-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Product</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Invoice Qty</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Return Qty</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Unit Price</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Total</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {selectedItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm font-bold text-slate-700">
                                                {item.product_name}
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm text-slate-600">
                                                {item.quantity || 0}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={item.quantity}
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, parseInt(e.target.value))}
                                                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                ₹{Number(item.unit_price).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-rose-600">
                                                -₹{(item.quantity * item.unit_price).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
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
                )}

                {/* Summary */}
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <div className="w-full md:w-1/3 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="font-medium">-₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">GST</span>
                            <span className="font-medium">-₹{totals.gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl text-slate-800 pt-2 border-t">
                            <span>Credit Amount</span>
                            <span className="text-rose-600">-₹{totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Additional Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full p-4 border-2 border-slate-200 rounded-xl h-24 resize-none"
                        placeholder="Any additional information..."
                    />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-10 py-4 bg-gradient-to-r from-rose-600 to-red-600 text-white font-black rounded-2xl border-b-4 border-rose-800 hover:-translate-y-1 hover:shadow-2xl transition disabled:opacity-50 flex items-center gap-3"
                    >
                        {isSubmitting ? 'Saving...' : <><FaSave /> Issue Credit Note</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
