'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaUserPlus } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function NewInvoicePage() {
    const router = useRouter();
    const { customers, products, addInvoice, addCustomer } = useStore();
    const [isClient, setIsClient] = useState(false);

    // Form State
    const [customerId, setCustomerId] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [notes, setNotes] = useState('');

    // Modal State
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');

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
                    product_name: product.name,
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

    // Handle Quick Customer Add
    const handleAddCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomerName) return toast.error('Name is required');

        const newId = crypto.randomUUID();
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
        <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/invoices" className="p-2 hover:bg-gray-100 rounded-full transition">
                        <FaArrowLeft className="text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">New Invoice</h1>
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                    <FaSave /> Save Invoice
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8 space-y-8">
                {/* Customer & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 flex justify-between">
                            Customer
                            <button
                                onClick={() => setShowCustomerModal(true)}
                                className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                            >
                                <FaPlus size={10} /> Quick Add
                            </button>
                        </label>
                        <div className="relative">
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option value="">Select Customer</option>
                                {customers.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">Invoice Date</label>
                        <input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Items Section */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800">Items</h2>

                    <div className="overflow-x-auto pb-4 -mx-5 px-5 md:mx-0 md:px-0">
                        <table className="w-full min-w-[650px]">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="p-3 text-xs font-semibold text-gray-500 rounded-l-lg w-[35%]">Product</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 w-[15%]">Qty</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 w-[20%]">Price</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 w-[20%]">Total</th>
                                    <th className="p-3 text-xs font-semibold text-gray-500 rounded-r-lg w-[10%] text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {selectedItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="p-2">
                                            <select
                                                value={item.product_id}
                                                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
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
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm text-center outline-none focus:border-blue-500"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                <input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                                                    className="w-full pl-5 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-2 text-sm font-bold text-gray-700">
                                            ₹{(item.quantity * item.unit_price).toFixed(2)}
                                        </td>
                                        <td className="p-2 text-center">
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center pt-2">
                        <button
                            type="button"
                            onClick={addItem}
                            className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition flex items-center gap-2 text-sm"
                        >
                            <FaPlus /> Add New Item
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
                        className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                    ></textarea>
                </div>
            </div>

            {/* Quick Add Customer Modal */}
            {showCustomerModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold mb-4">Quick Add Customer</h3>
                        <form onSubmit={handleAddCustomer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    autoFocus
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newCustomerName}
                                    onChange={e => setNewCustomerName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newCustomerPhone}
                                    onChange={e => setNewCustomerPhone(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerModal(false)}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
