'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTrash, FaSave, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function NewQuotationPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        customer_id: '',
        quotation_date: new Date().toISOString().split('T')[0],
        valid_until: '',
        notes: '',
        terms: 'Payment terms: Net 30 days\nDelivery: As per agreement'
    });

    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
        // Set default validity to 30 days from now
        const validDate = new Date();
        validDate.setDate(validDate.getDate() + 30);
        setFormData(prev => ({ ...prev, valid_until: validDate.toISOString().split('T')[0] }));
    }, []);

    const fetchData = async () => {
        try {
            const [customersRes, productsRes] = await Promise.all([
                fetch('/api/customers'),
                fetch('/api/products')
            ]);
            const customersData = await customersRes.json();
            const productsData = await productsRes.json();

            setCustomers(Array.isArray(customersData) ? customersData : []);
            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const addItem = () => {
        setSelectedItems([...selectedItems, {
            product_id: '',
            quantity: 1,
            unit_price: 0,
            gst_rate: 18,
            product_name: '',
            hsn_code: ''
        }]);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...selectedItems];
        if (field === 'product_id') {
            const product = products.find(p => p.id === value);
            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    product_id: value,
                    product_name: product.name,
                    unit_price: product.price,
                    gst_rate: product.gst_rate || 18,
                    hsn_code: product.hsn_code || ''
                };
            }
        } else {
            newItems[index][field] = value;
        }
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

        if (!formData.customer_id) {
            toast.error('Please select a customer');
            return;
        }

        if (selectedItems.length === 0) {
            toast.error('Please add at least one item');
            return;
        }

        setIsSubmitting(true);

        try {
            const quotationData = {
                quotation_number: `QUO-${Math.floor(1000 + Math.random() * 9000)}`,
                customer_id: formData.customer_id,
                quotation_date: formData.quotation_date,
                valid_until: formData.valid_until,
                items: selectedItems,
                subtotal: totals.subtotal,
                cgst_amount: totals.gst / 2,
                sgst_amount: totals.gst / 2,
                igst_amount: 0,
                total_amount: totals.total,
                notes: formData.notes,
                terms: formData.terms
            };

            const res = await fetch('/api/quotations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quotationData)
            });

            if (res.ok) {
                toast.success('Quotation created successfully!');
                router.push('/dashboard/quotations');
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to create quotation');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to create quotation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/dashboard/quotations"
                    className="p-2.5 hover:bg-indigo-50 rounded-xl transition border border-transparent hover:border-indigo-200"
                >
                    <FaArrowLeft className="text-indigo-600" size={18} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        New Quotation
                    </h1>
                    <p className="text-sm text-slate-600 mt-0.5">Create a professional quotation for your customer</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-8">
                {/* Customer & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Customer *</label>
                        <select
                            required
                            value={formData.customer_id}
                            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none font-bold"
                        >
                            <option value="">Select Customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Quotation Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.quotation_date}
                            onChange={(e) => setFormData({ ...formData, quotation_date: e.target.value })}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Valid Until *</label>
                        <input
                            type="date"
                            required
                            value={formData.valid_until}
                            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none font-bold"
                        />
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Items Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">Items</h2>
                        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-semibold">
                            {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Product</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Quantity</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Price</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Total</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {selectedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                            No items added yet. Click "Add Item" below.
                                        </td>
                                    </tr>
                                ) : (
                                    selectedItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <select
                                                    value={item.product_id}
                                                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                >
                                                    <option value="">Select Product</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold">
                                                ₹{(item.quantity * item.unit_price).toFixed(2)}
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={addItem}
                            className="inline-flex items-center gap-3 px-10 py-4 bg-orange-500 text-white rounded-2xl font-black border-b-4 border-orange-700 hover:-translate-y-1 hover:shadow-2xl transition"
                        >
                            <FaPlus /> Add Item
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <div className="w-full md:w-1/3 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">GST</span>
                            <span className="font-medium">₹{totals.gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl text-slate-800 pt-2 border-t">
                            <span>Total</span>
                            <span className="text-purple-600">₹{totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Notes & Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional notes..."
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Terms & Conditions</label>
                        <textarea
                            value={formData.terms}
                            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                            placeholder="Payment terms..."
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="relative px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-2xl border-b-4 border-purple-800 hover:-translate-y-1 hover:shadow-2xl transition disabled:opacity-50 flex items-center gap-3"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <FaSave /> Save Quotation
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
