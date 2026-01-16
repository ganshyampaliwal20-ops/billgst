'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaPlus, FaSearch, FaEdit, FaBox, FaExclamationTriangle, FaTrash, FaQrcode } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';

export default function InventoryPage() {
    const router = useRouter();
    const { products, addProduct, updateProduct, deleteProduct } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

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

    const filteredProducts = (products || [])
        .filter((p: any) => p && (p.status !== 'INACTIVE'))
        .filter((p: any) =>
            (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.hsn_code || '').includes(searchTerm)
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

    const handleGenerateQR = async (product: any) => {
        try {
            const productUrl = `${window.location.origin}/dashboard/inventory/${product.id}`;
            const qrDataUrl = await QRCode.toDataURL(productUrl, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#4F46E5',
                    light: '#FFFFFF'
                }
            });
            setQrCodeUrl(qrDataUrl);
            setSelectedProduct(product);
            setShowQrModal(true);
        } catch (error) {
            console.error('QR Code generation error:', error);
            toast.error('QR Code generate karne mein error aaya');
        }
    };

    const handleDownloadQR = () => {
        if (!qrCodeUrl || !selectedProduct) return;

        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `QR-${selectedProduct.name.replace(/\s+/g, '-')}.png`;
        link.click();
        toast.success('QR Code downloaded!');
    };

    return (
        <div className="space-y-8 p-10 md:p-14 lg:p-20 pb-40">
            {/* Header */}
            {/* Header - Centered Layout */}
            <div className="flex flex-col items-center justify-center gap-10 mb-8">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Inventory</h1>
                    <p className="text-gray-500 text-sm font-medium">Manage your products and stock</p>
                </div>
            </div>

            {/* Search - Refined width with 3D aesthetic */}
            <div className="flex justify-center mb-8">
                <div className="
                    bg-white p-2 rounded-[5px] relative w-full md:w-96 group transition-all 
                    border-4 border-slate-200 
                    border-b-8 border-slate-300
                    shadow-[0_4px_0_0_rgba(148,163,184,0.1),0_10px_15px_-3px_rgba(0,0,0,0.1)]
                    hover:border-indigo-400 hover:border-b-indigo-600
                    focus-within:border-indigo-500 focus-within:border-b-indigo-700 focus-within:shadow-indigo-500/20
                ">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border-none rounded-[5px] outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                    />
                    <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all group-hover:scale-110" />
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-[5px] border border-gray-100">
                        <div className="inline-block p-4 bg-gray-50 rounded-full mb-3">
                            <FaBox className="text-3xl text-gray-300" />
                        </div>
                        <p className="text-gray-500">No products found</p>
                    </div>
                ) : (
                    filteredProducts.map((product: any) => (
                        <div key={product.id} className="bg-white rounded-[2px] border border-gray-100 shadow-sm hover:shadow-md transition group relative overflow-hidden flex flex-col">
                            {/* Low Stock Indicator - only for products */}
                            {(product.type || 'PRODUCT') === 'PRODUCT' && product.stock_quantity < 10 && (
                                <div className="absolute top-0 right-10 bg-red-100 text-red-600 px-3 py-1 rounded-bl-[5px] text-xs font-bold flex items-center gap-5 z-10">
                                    <FaExclamationTriangle /> Low Stock
                                </div>
                            )}

                            <div className="px-10 py-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-[2px] text-indigo-600 font-bold text-xl w-12 h-12 flex items-center justify-center">
                                        {product.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase tracking-wider ${product.type === 'SERVICE' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
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

                            {/* Action Footer - Larger & More Premium Buttons */}
                            <div className="bg-slate-50 px-10 py-6 border-t border-slate-100 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => handleGenerateQR(product)}
                                    className="
                                        flex-1 flex items-center justify-center gap-2 px-4 py-3.5 
                                        bg-white border-2 border-purple-100 text-purple-600 
                                        rounded-[5px] transition-all duration-300 font-bold text-sm
                                        shadow-[0_4px_0_0_#f3e8ff] hover:-translate-y-1 
                                        hover:shadow-[0_6px_0_0_#f3e8ff] hover:bg-purple-50/50
                                        active:translate-y-0 active:shadow-none
                                    "
                                >
                                    <FaQrcode className="text-lg" /> QR
                                </button>
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="
                                        flex-1 flex items-center justify-center gap-2 px-4 py-3.5 
                                        bg-white border-2 border-indigo-100 text-indigo-600 
                                        rounded-[5px] transition-all duration-300 font-bold text-sm
                                        shadow-[0_4px_0_0_#e0e7ff] hover:-translate-y-1 
                                        hover:shadow-[0_6px_0_0_#e0e7ff] hover:bg-indigo-50/50
                                        active:translate-y-0 active:shadow-none
                                    "
                                >
                                    <FaEdit className="text-lg" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="
                                        flex-1 flex items-center justify-center gap-2 px-4 py-3.5 
                                        bg-white border-2 border-red-100 text-red-600 
                                        rounded-[5px] transition-all duration-300 font-bold text-sm
                                        shadow-[0_4px_0_0_#fee2e2] hover:-translate-y-1 
                                        hover:shadow-[0_6px_0_0_#fee2e2] hover:bg-red-50/50
                                        active:translate-y-0 active:shadow-none
                                    "
                                >
                                    <FaTrash className="text-lg" /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[5px] w-full max-w-2xl p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh] border-2 border-indigo-100">
                        <h2 className="text-2xl font-black mb-8 text-center text-gray-800 uppercase tracking-wide border-b-2 border-gray-100 pb-4">
                            {editingId ? 'Edit Product' : 'Add New Product'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-[5px] outline-none focus:ring-2 focus:ring-indigo-500"
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
                                            className={`flex flex-col items-center gap-2 p-3 rounded-[5px] border-2 transition-all ${(formData.type || 'PRODUCT') === 'PRODUCT'
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
                                            className={`flex flex-col items-center gap-2 p-3 rounded-[5px] border-2 transition-all ${formData.type === 'SERVICE'
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
                                        className="w-full p-2.5 border border-gray-300 rounded-[5px] outline-none focus:ring-2 focus:ring-indigo-500"
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
                                        className="w-full p-2.5 border border-gray-300 rounded-[5px] outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-indigo-700 mb-1 font-bold">Purchase Price (Kharid Bhav)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2.5 border-2 border-indigo-100 bg-indigo-50/30 rounded-[5px] outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.purchase_price}
                                        onChange={e => setFormData({ ...formData, purchase_price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                                    <select
                                        className="w-full p-2.5 border border-gray-300 rounded-[5px] outline-none focus:ring-2 focus:ring-indigo-500"
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
                                            className="w-full p-2.5 border border-gray-300 rounded-[5px] outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={formData.stock_quantity}
                                            onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                        <input
                                            list="units"
                                            className="w-full p-2.5 border border-gray-300 rounded-[5px] outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
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
                                    className="w-full p-2.5 border border-gray-300 rounded-[5px] outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-[5px] font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-[5px] font-bold hover:bg-indigo-700"
                                >
                                    {editingId ? 'Update' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Fixed Bottom Add Product Button */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center z-40 pointer-events-none">
                <button
                    onClick={() => setShowModal(true)}
                    className="
                        pointer-events-auto
                        group relative px-12 py-5 bg-emerald-600 text-white font-black rounded-full
                        border-b-4 border-emerald-800 transition-all duration-200
                        shadow-2xl shadow-emerald-900/40
                        hover:-translate-y-1 hover:shadow-3xl hover:shadow-emerald-900/50
                        active:translate-y-[2px] active:border-b-0
                        flex items-center gap-4 overflow-hidden text-sm uppercase tracking-wider
                    "
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none"></div>
                    <FaPlus className="group-hover:rotate-90 transition-transform duration-300 text-xl" />
                    Add New Product
                </button>
            </div>

            {/* QR Code Modal */}
            {showQrModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[5px] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="inline-block p-4 bg-purple-100 rounded-[5px] mb-4">
                                    <FaQrcode className="text-5xl text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 mb-2">Product QR Code</h3>
                                <p className="text-gray-600 font-semibold">{selectedProduct.name}</p>
                            </div>

                            {/* QR Code Display */}
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-[5px] mb-6 border-2 border-purple-200">
                                <img
                                    src={qrCodeUrl}
                                    alt="QR Code"
                                    className="w-full max-w-xs mx-auto rounded-[5px] shadow-lg"
                                />
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 p-4 rounded-[5px] mb-6 text-left border border-blue-200">
                                <p className="text-sm text-blue-800 font-semibold mb-2">📱 Kaise Use Karein:</p>
                                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                    <li>QR Code ko scan karein apne phone se</li>
                                    <li>Product ki puri details khul jayegi</li>
                                    <li>Price, stock, GST sab kuch dikhai dega</li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDownloadQR}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-[5px] font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
                                >
                                    Download QR
                                </button>
                                <button
                                    onClick={() => router.push(`/dashboard/inventory/${selectedProduct.id}`)}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-[5px] font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
                                >
                                    View Details
                                </button>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowQrModal(false)}
                                className="mt-4 w-full py-3 border-2 border-gray-300 text-gray-600 rounded-[5px] font-bold hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
