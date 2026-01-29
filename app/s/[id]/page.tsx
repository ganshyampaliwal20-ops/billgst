'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FaPhone, FaMapMarkerAlt, FaWhatsapp, FaShoppingCart, FaSearch, FaStar, FaStore } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';

export default function PublicStorePage() {
    const { id } = useParams();
    const [storeData, setStoreData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        if (!id || id === 'undefined') return;

        async function fetchStore() {
            setLoading(true);
            try {
                const res = await fetch(`/api/public/store/${id}`);
                const data = await res.json();
                if (data.error) {
                    toast.error(data.error);
                } else {
                    setStoreData(data);
                }
            } catch (e) {
                toast.error('Failed to load store');
            } finally {
                setLoading(false);
            }
        }
        fetchStore();
    }, [id]);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
        toast.success(`${product.name} added to cart!`);
    };

    const whatsappOrder = () => {
        if (cart.length === 0) return;
        let message = `Hi, I want to order from *${storeData.business.business_name}*:\n\n`;
        let total = 0;
        cart.forEach(item => {
            message += `• ${item.name} (${item.qty} ${item.unit || 'pcs'}) - ₹${item.price * item.qty}\n`;
            total += item.price * item.qty;
        });
        message += `\n*Total Amount: ₹${total}*`;
        const phone = storeData.business.business_phone || '';
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!storeData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <FaStore className="text-6xl text-slate-300 mb-4" />
                <h1 className="text-2xl font-bold text-slate-800">Store Not Found</h1>
                <p className="text-slate-500 mt-2">The digital storefront you are looking for doesn't exist.</p>
            </div>
        );
    }

    const categories = ['All', ...Array.from(new Set(storeData.products.map((p: any) => p.category || 'General')))] as string[];
    const filteredProducts = storeData.products.filter((p: any) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || (p.category || 'General') === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white overflow-hidden overflow-hidden shadow-md">
                            {storeData.business.business_logo ? (
                                <Image src={storeData.business.business_logo} alt="Logo" width={48} height={48} className="object-cover" />
                            ) : (
                                <FaStore size={20} />
                            )}
                        </div>
                        <div>
                            <h1 className="font-black text-slate-800 tracking-tight">{storeData.business.business_name}</h1>
                            <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Online Now
                            </div>
                        </div>
                    </div>
                    {cartCount > 0 && (
                        <button onClick={whatsappOrder} className="relative p-2 text-indigo-600 bg-indigo-50 rounded-xl border border-indigo-100 animate-bounce">
                            <FaShoppingCart size={24} />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                {cartCount}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Store Banner/Info */}
            <div className="max-w-7xl mx-auto mt-6 px-4">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1" style={{ paddingLeft: '15px', paddingRight: '8px', paddingTop: '8px' }}>Welcome to our digital store</p>
                        <h2 className="text-2xl font-black mb-4 italic" style={{ paddingLeft: '15px', paddingRight: '8px', paddingTop: '1px' }}>Experience Seamless Shopping</h2>
                        <div className="flex flex-wrap gap-4 text-sm mt-4">
                            {storeData.business.business_phone && (
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm" style={{ paddingLeft: '15px', paddingRight: '8px', paddingTop: '5px', paddingBottom: '5px' }}>
                                    <FaPhone className="text-xs" />
                                    <span>{storeData.business.business_phone}</span>
                                </div>
                            )}
                            {storeData.business.business_address && (
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm max-w-[200px] truncate">
                                    <FaMapMarkerAlt className="text-xs" />
                                    <span>{storeData.business.business_address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Categories */}
            <div className="max-w-7xl mx-auto mt-8 px-4 space-y-4" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '5px', paddingBottom: '5px' }}>
                <div className="relative">
                    <FaSearch className="absolute left-75 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search for items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white pl-12 pr-4 py-4 rounded-2xl shadow-sm border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '5px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${selectedCategory === cat
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto mt-8 px-4" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px' }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {filteredProducts.map((p: any) => (
                        <div key={p.id} className="bg-white rounded-[2rem] p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col">
                            <div className="aspect-square bg-slate-100 rounded-2xl mb-3 overflow-hidden relative">
                                {p.image_url ? (
                                    <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <FaStore size={32} />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-sm">
                                    ₹{p.price}
                                </div>
                            </div>
                            <div className="px-1 flex-1">
                                <h3 className="text-slate-800 font-bold text-sm leading-tight mb-1 truncate">{p.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{p.category || 'General'}</p>
                            </div>
                            <button
                                onClick={() => addToCart(p)}
                                className="mt-3 w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <FaPlus size={10} /> ADD
                            </button>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                            <FaSearch className="text-slate-300 text-2xl" />
                        </div>
                        <p className="text-slate-500 font-bold italic">No items matching your search...</p>
                    </div>
                )}
            </div>

            {/* Fixed Checkout Bar */}
            {cartCount > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90vw] max-w-7xl z-50 animate-in slide-in-from-bottom-10">
                    <div className="bg-indigo-900 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 backdrop-blur-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white ring-2 ring-white/20">
                                <FaShoppingCart />
                            </div>
                            <div>
                                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">{cartCount} Items Selected</p>
                                <p className="text-white text-xl font-black italic">₹{cartTotal.toLocaleString()}</p>
                            </div>
                        </div>
                        <button
                            onClick={whatsappOrder}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-3 transition-all active:scale-95"
                        >
                            <FaWhatsapp size={20} /> ORDER ON WA
                        </button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

const FaPlus = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 1 1 0-2h6V1a1 1 0 0 1 1-1z" />
    </svg>
);
