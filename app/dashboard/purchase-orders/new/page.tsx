'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTrash, FaSave, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function NewPurchaseOrderPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        customer_id: '',
        po_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        notes: ''
    });

    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [customersRes, productsRes] = await Promise.all([
                fetch('/api/customers'),
                fetch('/api/products')
            ]);
            setCustomers(await customersRes.json());
            setProducts(await productsRes.json());
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const addItem = () => {
        setSelectedItems([...selectedItems, {
            product_id: '',
            quantity: 1,
            unit_price: 0,
            product_name: ''
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
                    unit_price: product.price
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

    const calculateTotal = () => {
        return selectedItems.reduce((sum, item) => {
            return sum + (Number(item.quantity) * Number(item.unit_price));
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customer_id || selectedItems.length === 0) {
            toast.error('Please select customer and add items');
            return;
        }

        setIsSubmitting(true);

        try {
            const total = calculateTotal();
            const poData = {
                po_number: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
                customer_id: formData.customer_id,
                po_date: formData.po_date,
                delivery_date: formData.delivery_date || null,
                items: selectedItems,
                subtotal: total,
                total_amount: total,
                notes: formData.notes
            };

            const res = await fetch('/api/purchase-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(poData)
            });

            if (res.ok) {
                toast.success('Purchase Order created successfully!');
                router.push('/dashboard/purchase-orders');
            } else {
                toast.error('Failed to create purchase order');
            }
        } catch (error) {
            toast.error('Error creating purchase order');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/purchase-orders" className="p-2.5 hover:bg-pink-50 rounded-xl transition">
                    <FaArrowLeft className="text-pink-600" size={18} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                        New Purchase Order
                    </h1>
                    <p className="text-sm text-slate-600 mt-0.5">Create a purchase order from customer</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Customer *</label>
                        <select
                            required
                            value={formData.customer_id}
                            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none font-bold"
                        >
                            <option value="">Select Customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 uppercase mb-2">PO Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.po_date}
                            onChange={(e) => setFormData({ ...formData, po_date: e.target.value })}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-pink-500 outline-none font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Delivery Date</label>
                        <input
                            type="date"
                            value={formData.delivery_date}
                            onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-pink-500 outline-none font-bold"
                        />
                    </div>
                </div>

                <hr className="border-slate-100" />

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800">Items</h2>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-gradient-to-r from-pink-50 to-rose-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Product</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Quantity</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Unit Price</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Total</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {selectedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                            No items added yet
                                        </td>
                                    </tr>
                                ) : (
                                    selectedItems.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={item.product_id}
                                                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                >
                                                    <option value="">Select Product</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                                    className="w-20 px-3 py-2 border rounded-lg text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                                                    className="w-full px-3 py-2 border rounded-lg"
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
                            className="inline-flex items-center gap-3 px-10 py-4 bg-pink-500 text-white rounded-2xl font-black border-b-4 border-pink-700 hover:-translate-y-1 hover:shadow-2xl transition"
                        >
                            <FaPlus /> Add Item
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <div className="w-full md:w-1/3">
                        <div className="flex justify-between font-bold text-2xl text-slate-800 p-4 bg-pink-50 rounded-xl">
                            <span>Total:</span>
                            <span className="text-pink-600">₹{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full p-4 border-2 border-slate-200 rounded-xl h-24 resize-none"
                        placeholder="Additional notes..."
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
                        className="px-10 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black rounded-2xl border-b-4 border-pink-800 hover:-translate-y-1 hover:shadow-2xl transition disabled:opacity-50 flex items-center gap-3"
                    >
                        {isSubmitting ? 'Saving...' : <><FaSave /> Save PO</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
