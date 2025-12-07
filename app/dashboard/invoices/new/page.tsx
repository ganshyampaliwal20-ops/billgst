'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTrash, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function NewInvoicePage() {
    const router = useRouter();
    const { customers, products, addInvoice, businessProfile } = useStore();
    const [isClient, setIsClient] = useState(false);

    // Form State
    const [customerId, setCustomerId] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        setIsClient(true);
    }, []);

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
                    product_name: product.name, // Store name for display
                    unit_price: product.price,
                    gst_rate: product.gst_rate || 18,
                    hsn_code: product.hsn_code
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

    // Handle Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerId) {
            toast.error('Please select a customer');
            return;
        }
        if (selectedItems.length === 0) {
            toast.error('Please add at least one item');
            return;
        }

        const customer = customers.find((c: any) => c.id === customerId);

        const newInvoice = {
            id: crypto.randomUUID(),
            invoice_number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
            customer: {
                id: customerId,
                name: customer?.name || 'Unknown',
                email: customer?.email,
                address: customer?.address
            },
            invoice_date: invoiceDate,
            due_date: dueDate,
            items: selectedItems,
            subtotal: totals.subtotal,
            total_amount: totals.total,
            total_tax: totals.gst,
            status: 'UNPAID',
            notes: notes,
            created_at: new Date().toISOString()
        };

        addInvoice(newInvoice);
        toast.success('Invoice created successfully!');
        router.push('/dashboard/invoices');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/invoices" className="p-2 hover:bg-gray-100 rounded-full transition">
                        <FaArrowLeft className="text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">New Invoice</h1>
                </div>
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
                >
                    <FaSave /> Save Invoice
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
                {/* Customer & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">Customer</label>
                        <select
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select Customer</option>
                            {customers.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {customers.length === 0 && (
                            <Link href="/dashboard/customers" className="text-xs text-blue-600 hover:underline">
                                + Add New Customer
                            </Link>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">Invoice Date</label>
                        <input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Items Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800">Items</h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className="text-sm text-blue-600 font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                        >
                            + Add Item
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="p-3 text-xs font-semibold text-gray-500 rounded-l-lg w-[40%]">Product</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 w-[15%]">Qty</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 w-[20%]">Price</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 w-[15%]">Total</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 rounded-r-lg w-[10%]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {selectedItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="p-2">
                                            <select
                                                value={item.product_id}
                                                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                            >
                                                <option value="">Select Product</option>
                                                {products.map((p: any) => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                        </td>
                                        <td className="p-2 text-sm font-semibold text-gray-700">
                                            ₹{(item.quantity * item.unit_price).toFixed(2)}
                                        </td>
                                        <td className="p-2 text-center">
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition"
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

                {/* Summary Section */}
                <div className="flex justify-end">
                    <div className="w-full md:w-1/3 space-y-3 bg-gray-50 p-4 rounded-xl">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>GST Total</span>
                            <span>₹{totals.gst.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-800">
                            <span>Total Amount</span>
                            <span>₹{totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="text-sm font-semibold text-gray-600">Notes (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Payment terms, notes to customer..."
                        className="w-full mt-2 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                    ></textarea>
                </div>
            </div>
        </div>
    );
}
