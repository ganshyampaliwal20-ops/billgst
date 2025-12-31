'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaPlus, FaSearch, FaEdit, FaBox, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function InventoryPage() {
    const { products, addProduct, updateProduct, deleteProduct } = useStore();
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
        purchase_price: '',
        stock_quantity: '',
        unit: 'PCS',
        gst_rate: '18',
        type: 'PRODUCT'
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
            purchase_price: product.purchase_price?.toString() || '',
            stock_quantity: product.stock_quantity.toString(),
            unit: product.unit || 'PCS',
            gst_rate: product.gst_rate?.toString() || '18',
            type: product.type || 'PRODUCT'
        });
        setEditingId(product.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '', description: '', hsn_code: '', price: '', purchase_price: '', stock_quantity: '', unit: 'PCS', gst_rate: '18', type: 'PRODUCT'
        });
        setEditingId(null);
        setShowModal(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
        }
    };

    return (
        <div className="space-y-6 px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
                    <p className="text-gray-500 text-sm">Manage your products and stock</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="
                        group relative px-6 py-3.5 bg-emerald-600 text-white font-black rounded-2xl
                        border-b-4 border-emerald-800 transition-all duration-200
                        hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/30
                        active:translate-y-[2px] active:border-b-0
                        flex items-center gap-3 overflow-hidden
                    "
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none"></div>
                    <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="tracking-wider uppercase text-xs">Add New Product</span>
                </button>
            </div>

            {/* Search - Refined width with 3D aesthetic */}
            <div className="flex justify-start">
                <div className="
                    bg-white p-2 rounded-2xl relative w-full md:w-96 group transition-all 
                    border-2 border-slate-200 
                    border-b-4 border-b-slate-300
                    shadow-[0_4px_0_0_rgba(148,163,184,0.1),0_10px_15px_-3px_rgba(0,0,0,0.1)]
                    hover:border-indigo-400 hover:border-b-indigo-600
                    focus-within:border-indigo-500 focus-within:border-b-indigo-700 focus-within:shadow-indigo-500/20
                ">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border-none rounded-xl outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                    />
                    <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all group-hover:scale-110" />
                </div>
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
                        <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group relative overflow-hidden flex flex-col">
                            {/* Low Stock Indicator - only for products */}
                            {(product.type || 'PRODUCT') === 'PRODUCT' && product.stock_quantity < 10 && (
                                <div className="absolute top-0 right-0 bg-red-100 text-red-600 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1 z-10">
                                    <FaExclamationTriangle /> Low Stock
                                </div>
                            )}

                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 font-bold text-xl w-12 h-12 flex items-center justify-center">
                                        {product.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${product.type === 'SERVICE' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {product.type || 'PRODUCT'}
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-800 text-lg mb-1 truncate" title={product.name}>{product.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{product.description || 'No description available'}</p>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] text-gray-400 uppercase font-semibold">Sale Price</p>
                                            <p className="text-gray-900 font-bold text-base">₹{product.price}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[10px] text-indigo-400 uppercase font-semibold">Purchase Price</p>
                                            <p className="text-indigo-600 font-bold text-sm">₹{product.purchase_price || 0}</p>
                                        </div>
                                    </div>
                                    {(product.type || 'PRODUCT') === 'PRODUCT' && (
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Stock</p>
                                            <p className={`font-bold text-lg ${product.stock_quantity < 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {product.stock_quantity} <span className="text-sm text-gray-500 font-normal">{product.unit}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="bg-gray-50/80 px-5 py-3 border-t border-gray-100 flex items-center justify-center gap-4">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-white border border-indigo-100 hover:bg-indigo-50 rounded-lg transition-all text-sm font-medium shadow-sm"
                                >
                                    <FaEdit /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-100 hover:bg-red-50 rounded-lg transition-all text-sm font-medium shadow-sm"
                                >
                                    <FaTrash /> Delete
                                </button>
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
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Item Type *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'PRODUCT' })}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${(formData.type || 'PRODUCT') === 'PRODUCT'
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            <FaBox className="text-xl" />
                                            <span className="text-xs font-black uppercase tracking-tight">Product</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'SERVICE' })}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.type === 'SERVICE'
                                                ? 'border-purple-600 bg-purple-50 text-purple-600'
                                                : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            <FaPlus className="text-xl rotate-45" />
                                            <span className="text-xs font-black uppercase tracking-tight">Service</span>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">HSN/SAC Code</label>
                                    <input
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.hsn_code}
                                        onChange={e => setFormData({ ...formData, hsn_code: e.target.value })}
                                        placeholder="HSN for Products / SAC for Services"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (Sahi Bhav) *</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-700 mb-1 font-bold">Purchase Price (Kharid Bhav)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2.5 border-2 border-indigo-100 bg-indigo-50/30 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.purchase_price}
                                        onChange={e => setFormData({ ...formData, purchase_price: e.target.value })}
                                        placeholder="0.00"
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
                            {(formData.type || 'PRODUCT') === 'PRODUCT' && (
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
                            )}
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
