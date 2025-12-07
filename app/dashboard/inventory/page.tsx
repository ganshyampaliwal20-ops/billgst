'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaPlus, FaSearch, FaEdit, FaBox, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function InventoryPage() {
    const { products, addProduct, updateProduct } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        hsn_code: '',
        price: '',
        stock_quantity: '',
        unit: 'PCS',
        gst_rate: '18'
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.hsn_code?.includes(searchTerm)
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            toast.error('Name and Price are required');
            return;
        }

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock_quantity: parseInt(formData.stock_quantity || '0'),
            gst_rate: parseFloat(formData.gst_rate)
        };

        if (editingId) {
            updateProduct(editingId, productData);
            toast.success('Product updated');
        } else {
            addProduct({
                id: crypto.randomUUID(),
                ...productData,
                created_at: new Date().toISOString()
            });
            toast.success('Product added successfully');
        }

        resetForm();
    };

    const handleEdit = (product: any) => {
        setFormData({
            name: product.name,
            description: product.description || '',
            hsn_code: product.hsn_code || '',
            price: product.price.toString(),
            stock_quantity: product.stock_quantity.toString(),
            unit: product.unit || 'PCS',
            gst_rate: product.gst_rate?.toString() || '18'
        });
        setEditingId(product.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '', description: '', hsn_code: '', price: '', stock_quantity: '', unit: 'PCS', gst_rate: '18'
        });
        setEditingId(null);
        setShowModal(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
                    <p className="text-gray-500 text-sm">Manage your products and stock</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
                >
                    <FaPlus /> Add New Product
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
                <FaSearch className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search products by name or HSN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-100">
                        <div className="inline-block p-4 bg-gray-50 rounded-full mb-3">
                            <FaBox className="text-3xl text-gray-300" />
                        </div>
                        <p className="text-gray-500">No products found</p>
                    </div>
                ) : (
                    filteredProducts.map((product: any) => (
                        <div key={product.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group relative overflow-hidden">
                            {/* Low Stock Indicator */}
                            {product.stock_quantity < 10 && (
                                <div className="absolute top-0 right-0 bg-red-100 text-red-600 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                                    <FaExclamationTriangle /> Low Stock
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 font-bold text-lg w-10 h-10 flex items-center justify-center">
                                    {product.name.charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                                >
                                    <FaEdit />
                                </button>
                            </div>

                            <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{product.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-1">{product.description || 'No description'}</p>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Price</p>
                                    <p className="text-gray-900 font-bold">₹{product.price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Stock</p>
                                    <p className={`font-bold ${product.stock_quantity < 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {product.stock_quantity} {product.unit}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                                    <select
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.gst_rate}
                                        onChange={e => setFormData({ ...formData, gst_rate: e.target.value })}
                                    >
                                        <option value="0">0%</option>
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18%</option>
                                        <option value="28">28%</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
                                    <input
                                        type="number"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.stock_quantity}
                                        onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                    <input
                                        list="units"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value.toUpperCase() })}
                                        placeholder="PCS, KG, GM..."
                                    />
                                    <datalist id="units">
                                        <option value="PCS" />
                                        <option value="KG" />
                                        <option value="GM" />
                                        <option value="LTR" />
                                        <option value="ML" />
                                        <option value="BOX" />
                                        <option value="DOZEN" />
                                        <option value="PACK" />
                                    </datalist>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
                                <input
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.hsn_code}
                                    onChange={e => setFormData({ ...formData, hsn_code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                                >
                                    {editingId ? 'Update' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
