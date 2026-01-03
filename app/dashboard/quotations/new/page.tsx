'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaPlus, FaTrash, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function NewQuotationPage() {
    const router = useRouter();
    const { customers, products, fetchCustomers, fetchProducts } = useStore();

    const [formData, setFormData] = useState({
        quotation_number: `QT-${Date.now().toString().slice(-6)}`,
        customer_id: '',
        quotation_date: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ product_id: '', product_name: '', quantity: 1, unit_price: 0, gst_rate: 18, total_amount: 0 }],
        notes: '',
        status: 'PENDING'
    });

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
    }, []);

    const calculateTotals = (items: any[]) => {
        const subtotal = items.reduce((acc: number, item: any) => acc + (item.quantity * item.unit_price), 0);
        const total_amount = items.reduce((acc: number, item: any) => acc + item.total_amount, 0);
        return { subtotal, total_amount };
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        const item: any = newItems[index];

        if (field === 'product_id') {
            const product = products.find((p: any) => p.id === value);
            if (product) {
                item.product_id = value;
                item.product_name = product.name;
                item.unit_price = product.price;
                item.gst_rate = product.gst_percentage || 18;
            }
        } else {
            item[field as keyof typeof item] = value;
        }

        const base = item.quantity * item.unit_price;
        item.total_amount = base + (base * (item.gst_rate / 100));

        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product_id: '', product_name: '', quantity: 1, unit_price: 0, gst_rate: 18, total_amount: 0 }]
        });
    };

    const removeItem = (index: number) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData({ ...formData, items: newItems });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customer_id) return toast.error('Please select a customer');

        try {
            const { subtotal, total_amount } = calculateTotals(formData.items);
            const response = await fetch('/api/quotations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, subtotal, total_amount })
            });

            if (response.ok) {
                toast.success('Quotation created successfully');
                router.push('/dashboard/quotations');
            } else {
                toast.error('Failed to create quotation');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const { total_amount } = calculateTotals(formData.items);

    return (
        <div className="max-w-5xl mx-auto pb-20 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/quotations" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                    <FaArrowLeft />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">New Quotation</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="col-span-1 lg:col-span-2">
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Customer</label>
                        <select
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                            value={formData.customer_id}
                            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                        >
                            <option value="">Select Customer</option>
                            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">QT Number</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            value={formData.quotation_number}
                            onChange={(e) => setFormData({ ...formData, quotation_number: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            value={formData.quotation_date}
                            onChange={(e) => setFormData({ ...formData, quotation_date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800 italic">Quotation Items</h2>
                        <button type="button" onClick={addItem} className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1"><FaPlus /> Add Line</button>
                    </div>

                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                                <div className="col-span-12 md:col-span-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Product/Service</label>
                                    <select
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={item.product_id}
                                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                    >
                                        <option value="">Choose item</option>
                                        {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Qty</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="col-span-8 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Price</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={item.unit_price}
                                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">GST%</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={item.gst_rate}
                                        onChange={(e) => handleItemChange(index, 'gst_rate', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="col-span-5 md:col-span-2 text-right">
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Total</label>
                                    <p className="font-black text-slate-700 py-2">₹{item.total_amount.toFixed(2)}</p>
                                </div>
                                <div className="col-span-1 text-center">
                                    <button type="button" onClick={() => removeItem(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 w-full bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Notes / Terms</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-24"
                            placeholder="Add your terms or notes..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="w-full md:w-80 space-y-4">
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-500/20">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Quotation Total</p>
                            <p className="text-4xl font-black italic tracking-tight">₹{total_amount.toLocaleString()}</p>
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-3xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg tracking-widest">
                            <FaSave /> SAVE QUOTATION
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
