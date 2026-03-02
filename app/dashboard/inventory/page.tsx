'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { FaPlus, FaSearch, FaEdit, FaBox, FaExclamationTriangle, FaTrash, FaQrcode, FaImage, FaChevronLeft, FaCommentDots, FaBell, FaCubes, FaExclamationCircle, FaChartLine, FaTimes, FaCamera } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { formatCompactNumber } from '@/lib/utils';

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
    const [filterCategory, setFilterCategory] = useState('ALL');

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
        type: 'PRODUCT',
        image_url: ''
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const filteredProducts = (products || [])
        .filter((p: any) => p && (p.status !== 'INACTIVE'))
        .filter((p: any) => {
            const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.hsn_code || '').includes(searchTerm);

            if (filterCategory === 'LOW STOCK') return matchesSearch && p.stock_quantity < 10 && p.type === 'PRODUCT';
            if (filterCategory === 'SERVICE') return matchesSearch && p.type === 'SERVICE';
            if (filterCategory === 'PRODUCT') return matchesSearch && p.type === 'PRODUCT';
            return matchesSearch;
        });

    const lowStockCount = products.filter((p: any) => (p.type || 'PRODUCT') === 'PRODUCT' && p.stock_quantity < 10).length;
    const totalInventoryValue = products.reduce((acc: number, p: any) => acc + (parseFloat(p.price) * (p.stock_quantity || 0)), 0);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image_url: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

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
            toast.success('Inventory updated');
        } else {
            addProduct({
                id: crypto.randomUUID(),
                ...productData,
                created_at: new Date().toISOString()
            });
            toast.success('Item added successfully');
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
            type: product.type || 'PRODUCT',
            image_url: product.image_url || ''
        });
        setEditingId(product.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '', description: '', hsn_code: '', price: '', purchase_price: '', stock_quantity: '', unit: 'PCS', gst_rate: '18', type: 'PRODUCT', image_url: ''
        });
        setEditingId(null);
        setShowModal(false);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
            toast.success('Item deleted');
        }
    };

    const handleGenerateQR = async (e: React.MouseEvent, product: any) => {
        e.stopPropagation();
        try {
            const productUrl = `${window.location.origin}/dashboard/inventory/${product.id}`;
            const qrDataUrl = await QRCode.toDataURL(productUrl, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#10b981',
                    light: '#FFFFFF'
                }
            });
            setQrCodeUrl(qrDataUrl);
            setSelectedProduct(product);
            setShowQrModal(true);
        } catch (error) {
            toast.error('QR error');
        }
    };

    const handleDownloadQR = () => {
        if (!qrCodeUrl || !selectedProduct) return;
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `QR-${selectedProduct.name}.png`;
        link.click();
    };

    return (
        <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
            {/* Premium Header - Centered */}
            <div className="bg-white border-b-4 border-emerald-500 px-6 py-6 flex flex-col items-center justify-center text-center shadow-sm z-20 relative">
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Smart Inventory</h1>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Manage Products & Stock</p>
                </div>
            </div>

            {/* Stats Grid - Single Row - Clickable Buttons */}
            <div className="grid grid-cols-3 gap-3 p-4" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <button
                    onClick={() => setFilterCategory('ALL')}
                    className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center text-center gap-2 shadow-sm transition-all active:scale-95 ${filterCategory === 'ALL' ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-white border-slate-50'}`}
                >
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg"><FaCubes className="text-xl" /></div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">{products.length}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Items</p>
                    </div>
                </button>
                <button
                    onClick={() => setFilterCategory('LOW STOCK')}
                    className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center text-center gap-2 shadow-sm transition-all active:scale-95 ${filterCategory === 'LOW STOCK' ? 'bg-rose-50 border-rose-200 ring-2 ring-rose-500/20' : 'bg-white border-slate-50'}`}
                >
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-lg"><FaExclamationCircle className="text-xl" /></div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">{lowStockCount}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Low Stock</p>
                    </div>
                </button>
                <button
                    onClick={() => toast.success(`Portfolio Value: ₹${totalInventoryValue.toLocaleString('en-IN')}`, { icon: '💰', style: { borderRadius: '20px', background: '#065f46', color: '#fff' } })}
                    className="bg-white p-4 rounded-3xl border-2 border-slate-50 flex flex-col items-center justify-center text-center gap-2 shadow-sm transition-all active:scale-95 hover:border-emerald-200"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg"><FaChartLine className="text-xl" /></div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">{formatCompactNumber(totalInventoryValue)}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Value</p>
                    </div>
                </button>
            </div>

            {/* Search Bar - 3D Style */}
            <div className="px-6 py-4 bg-white border-b border-emerald-50" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <div className="relative w-full group transition-all bg-white p-1 rounded-2xl border-4 border-emerald-100 border-b-8 border-emerald-200 shadow-lg" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                    <input
                        type="text"
                        placeholder="SEARCH PRODUCT / HSN"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-4 bg-emerald-50/20 border-none rounded-xl outline-none text-base font-black text-black placeholder:text-slate-400 uppercase tracking-widest pl-5"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md">
                        <FaSearch className="text-lg" />
                    </div>
                </div>
            </div>

            {/* Filters - 2x2 3D Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/50" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                {['ALL', 'PRODUCT', 'SERVICE', 'LOW STOCK'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 border-b-4 ${filterCategory === cat
                            ? 'bg-emerald-600 text-white border-emerald-800 shadow-emerald-200'
                            : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* List Header */}
            <div className="px-8 py-3 flex justify-between text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] bg-emerald-50/30" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                <span>Stock List ({filteredProducts.length})</span>
                <span>Pricing & Stock</span>
            </div>

            {/* Card List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}>
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <FaBox className="text-8xl mb-6 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-sm italic">No items found</p>
                    </div>
                ) : (
                    filteredProducts.map((product: any, idx: number) => {
                        return (
                            <div
                                key={product.id}
                                className="relative rounded-3xl border-2 border-slate-100 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all group"
                                style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px', paddingBottom: '8px' }}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        {product.image_url ? (
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm ring-2 ring-emerald-50">
                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-emerald-600 shadow-sm border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                {product.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="text-left">
                                            <h3 className="font-black text-slate-900 uppercase tracking-tight leading-none text-sm">{product.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-bold text-slate-400">HSN: {product.hsn_code || 'NA'}</span>
                                                <span className={`text-[8px] font-black uppercase px-2 rounded-full ${product.type === 'SERVICE' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {product.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-slate-900">
                                            ₹{parseFloat(product.price).toLocaleString('en-IN')}
                                        </div>
                                        {(product.type || 'PRODUCT') === 'PRODUCT' && (
                                            <div className={`text-[10px] font-black uppercase mt-1 ${product.stock_quantity < 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {product.stock_quantity} <span className="text-[8px] text-slate-400">{product.unit}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    <button
                                        onClick={(e) => handleGenerateQR(e, product)}
                                        className="py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all border border-indigo-100 font-bold text-xs gap-1"
                                    >
                                        <FaQrcode className="text-sm" /> QR
                                    </button>
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all border border-emerald-100 font-bold text-xs gap-1"
                                    >
                                        <FaEdit className="text-sm" /> Edit
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, product.id)}
                                        className="py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all border border-rose-100 font-bold text-xs gap-1"
                                    >
                                        <FaTrash className="text-sm" /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
                <div className="h-24"></div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setShowModal(true)}
                    className="w-16 h-16 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center shadow-[0_12px_40px_-8px_rgba(234,179,8,0.4)] hover:scale-110 active:scale-95 transition-all border-4 border-white"
                >
                    <FaPlus className="text-2xl" />
                </button>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-2 shadow-2xl animate-in zoom-in duration-300 border-2 border-emerald-500/20 overflow-hidden max-h-[90vh]">
                        <div className="bg-emerald-50/50 rounded-[2rem] overflow-y-auto max-h-[calc(90vh-16px)]" style={{ padding: '8px' }}>
                            <div className="flex justify-between items-center mb-6 px-4 pt-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase italic leading-none">{editingId ? 'Edit Product' : 'Add Item'}</h3>
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">Save your stock details</p>
                                </div>
                                <button onClick={resetForm} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 flex items-center justify-center active:scale-95 transition-all"><FaTimes /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-2 space-y-6">
                                {/* Image Upload Component */}
                                <div className="flex justify-center mb-4">
                                    <label className="relative w-32 h-32 bg-white rounded-3xl border-4 border-emerald-100 border-b-8 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all group">
                                        {formData.image_url ? (
                                            <>
                                                <img src={formData.image_url} alt="Product" className="w-full h-full object-cover rounded-2xl" />
                                                <button type="button" onClick={(e) => { e.preventDefault(); setFormData({ ...formData, image_url: '' }); }} className="absolute -top-2 -right-2 bg-rose-600 text-white p-2 rounded-xl shadow-lg active:scale-95"><FaTrash className="text-xs" /></button>
                                            </>
                                        ) : (
                                            <div className="text-center group-hover:scale-110 transition-transform">
                                                <FaCamera className="text-3xl text-emerald-200 mb-1 group-hover:text-emerald-500" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Add Photo</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <button type="button" onClick={() => setFormData({ ...formData, type: 'PRODUCT' })} className={`py-4 rounded-2xl font-black uppercase text-xs tracking-widest border-2 transition-all ${formData.type === 'PRODUCT' ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}>Product</button>
                                        <button type="button" onClick={() => setFormData({ ...formData, type: 'SERVICE' })} className={`py-4 rounded-2xl font-black uppercase text-xs tracking-widest border-2 transition-all ${formData.type === 'SERVICE' ? 'bg-purple-600 text-white border-purple-700 shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}>Service</button>
                                    </div>

                                    <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 space-y-4 shadow-inner">
                                        <div className="relative group">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-2">Item Name *</label>
                                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:border-emerald-500" placeholder="ENTER PRODUCT NAME" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-2">Sale Price *</label>
                                                <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:border-emerald-500" placeholder="0.00" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 block pl-2">Purchase Price</label>
                                                <input type="number" value={formData.purchase_price} onChange={e => setFormData({ ...formData, purchase_price: e.target.value })} className="w-full px-4 py-4 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl font-black text-indigo-800 outline-none focus:border-indigo-500" placeholder="0.00" />
                                            </div>
                                        </div>

                                        {(formData.type || 'PRODUCT') === 'PRODUCT' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-2">Stock Qty</label>
                                                    <input type="number" value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:border-emerald-500" placeholder="0" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-2">Unit</label>
                                                    <input list="units-list" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value.toUpperCase() })} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-800 outline-none focus:border-emerald-500" placeholder="PCS" />
                                                    <datalist id="units-list"><option value="PCS" /><option value="KG" /><option value="BOX" /></datalist>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/30 active:scale-95 transition-all text-xs border-b-4 border-emerald-800">
                                    {editingId ? 'UPDATE ITEM' : 'SAVE TO INVENTORY'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {showQrModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md p-2 shadow-2xl animate-in zoom-in duration-300 border-4 border-emerald-500">
                        <div className="p-6 text-center">
                            <h3 className="text-xl font-black text-slate-900 uppercase italic">Product QR Code</h3>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6">{selectedProduct.name}</p>

                            <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 shadow-inner mb-6 flex items-center justify-center">
                                <img src={qrCodeUrl} alt="QR Code" className="w-full max-w-[200px] rounded-2xl shadow-lg border-4 border-white" />
                            </div>

                            <button onClick={handleDownloadQR} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all mb-3"><FaQrcode /> Download PNG</button>
                            <button onClick={() => setShowQrModal(false)} className="w-full py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
