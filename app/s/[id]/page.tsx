'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { 
    FaPhone, FaMapMarkerAlt, FaWhatsapp, FaShoppingCart, 
    FaSearch, FaStore, FaShareAlt, FaMinus, FaPlus, FaChevronRight 
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';

export default function PublicStorePage() {
    const { id } = useParams();
    const [storeData, setStoreData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());
    const [sortMode, setSortMode] = useState('default');

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
                    // Track Store View
                    fetch('/api/public/store/track', {
                        method: 'POST',
                        body: JSON.stringify({ businessId: id, eventType: 'view' })
                    }).catch(console.error);
                }
            } catch (e) {
                toast.error('Failed to load store');
            } finally {
                setLoading(false);
            }
        }
        fetchStore();
    }, [id]);

    // --- Logic Functions ---
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

    const changeQty = (id: string, delta: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === id);
            if (!existing) return prev;
            const newQty = Math.max(0, existing.qty + delta);
            if (newQty === 0) return prev.filter(item => item.id !== id);
            return prev.map(item => item.id === id ? { ...item, qty: newQty } : item);
        });
    };

    const toggleWishlist = (id: string) => {
        setWishlist(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                toast('Removed from wishlist', { icon: '🤍' });
            } else {
                next.add(id);
                toast('Added to wishlist', { icon: '❤️' });
            }
            return next;
        });
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

    const shareStore = () => {
        if (navigator.share) {
            navigator.share({ title: storeData?.business?.business_name || "Digital Store", url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => toast.success("Link copied!"));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff]">
                <div className="w-12 h-12 border-4 border-[#4f1fe6] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!storeData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f7ff] p-6 text-center">
                <FaStore className="text-6xl text-slate-300 mb-4" />
                <h1 className="text-2xl font-bold text-slate-800">Store Not Found</h1>
                <p className="text-slate-500 mt-2">The digital storefront you are looking for doesn't exist.</p>
            </div>
        );
    }

    const DEMO_PRODUCTS = [
        { id: 'd1', name: 'Tata Salt', price: 24, unit: 'KG', category: 'Grocery', placeholder: '🧂', bg: '#fef3c7', fg: '#92400e' },
        { id: 'd2', name: 'Amul Butter', price: 55, unit: 'PCS', category: 'Dairy', placeholder: '🧈', bg: '#fef9c3', fg: '#854d0e' },
        { id: 'd3', name: 'Atta Bag', price: 245, unit: 'PCS', category: 'Grocery', placeholder: '🌾', bg: '#ecfdf5', fg: '#065f46' },
        { id: 'd4', name: 'iPhone 15', price: 72000, unit: 'PCS', category: 'Mobiles', placeholder: '📱', bg: '#eff6ff', fg: '#1e40af' },
        { id: 'd5', name: 'Rolex Watch', price: 450000, unit: 'PCS', category: 'Watches', placeholder: '⌚', bg: '#fff7ed', fg: '#9a3412' },
    ];

    const isDemoMode = storeData.products.length === 0;
    const rawProducts = isDemoMode ? DEMO_PRODUCTS : storeData.products;
    
    // Filter & Sort Logic
    let filteredProducts = rawProducts.filter((p: any) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || (p.category || 'General') === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (sortMode === 'price-asc') filteredProducts = [...filteredProducts].sort((a,b) => a.price - b.price);
    if (sortMode === 'price-desc') filteredProducts = [...filteredProducts].sort((a,b) => b.price - a.price);
    if (sortMode === 'name') filteredProducts = [...filteredProducts].sort((a,b) => a.name.localeCompare(b.name));

    const categories = ['All', ...Array.from(new Set(rawProducts.map((p: any) => p.category || 'General')))] as string[];
    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    return (
        <div className="store-page-root">
            <Toaster position="top-center" />
            
            <div className="page-container">
                {/* HEADER */}
                <header className="store-header">
                    <div className="header-orb orb1"></div>
                    <div className="header-orb orb2"></div>
                    <div className="header-orb orb3"></div>

                    <div className="header-top-row">
                        <div className="biz-identity">
                            <div className="biz-avatar">
                                {storeData.business.business_logo ? (
                                    <img src={storeData.business.business_logo} alt="L" className="w-full h-full object-cover rounded-[11px]" />
                                ) : (
                                    storeData.business.business_name.charAt(0)
                                )}
                            </div>
                            <div className="biz-info">
                                <div className="biz-name">{storeData.business.business_name}</div>
                                <div className="online-pill"><span className="online-dot"></span> Online Now</div>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button className="icon-btn" onClick={shareStore}><FaShareAlt /></button>
                            <button className="icon-btn" onClick={() => setIsCartOpen(true)}>
                                <FaShoppingCart />
                                {cartCount > 0 && <span className="cart-badge show">{cartCount}</span>}
                            </button>
                        </div>
                    </div>

                    <div className="store-chip">✦ Digital Storefront</div>
                    <h1 className="store-tagline">Order from our<br />latest collection</h1>
                    
                    <div className="header-meta">
                        {storeData.business.business_phone && (
                            <span className="meta-tag">
                                <FaPhone size={12} /> {storeData.business.business_phone}
                            </span>
                        )}
                        {storeData.business.business_address && (
                            <span className="meta-tag">
                                <FaMapMarkerAlt size={12} /> {storeData.business.business_address}
                            </span>
                        )}
                    </div>
                </header>

                {/* SEARCH & FILTERS */}
                <div className="search-float">
                    <div className="search-row">
                        <div className="search-input-wrap">
                            <span className="search-icon-inner"><FaSearch /></span>
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Search products..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select 
                            className="sort-select-btn" 
                            value={sortMode}
                            onChange={(e) => setSortMode(e.target.value)}
                        >
                            <option value="default">Sort</option>
                            <option value="price-asc">₹ Low</option>
                            <option value="price-desc">₹ High</option>
                            <option value="name">A-Z</option>
                        </select>
                    </div>
                    <div className="cat-chips">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* STATS ROW */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-label">Products</div>
                        <div className="stat-val">{filteredProducts.length} <span>items</span></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">In Cart</div>
                        <div className="stat-val">{cartCount} <span>items</span></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total</div>
                        <div className="stat-val">₹{cartTotal.toLocaleString()}</div>
                    </div>
                </div>

                {/* SECTION HEADER */}
                <div className="section-header">
                    <div className="section-title">
                        <span className="section-dot"></span>
                        Products
                        <span className="section-count">{filteredProducts.length}</span>
                    </div>
                </div>

                {/* PRODUCT GRID */}
                <div className="product-grid">
                    {filteredProducts.map((p: any, i: number) => {
                        const cartItem = cart.find(item => item.id === p.id);
                        const qty = cartItem ? cartItem.qty : 0;
                        const isLiked = wishlist.has(p.id);

                        return (
                            <div className="product-card" key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="product-img-wrap">
                                    <div className="product-img-bg" style={{ background: p.bg || '#f1effe' }}>
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <span style={{ color: p.fg || '#4f1fe6' }}>{p.placeholder || p.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="price-badge">₹{p.price.toLocaleString()}</div>
                                    <button 
                                        className={`wishlist-btn ${isLiked ? 'active' : ''}`}
                                        onClick={() => toggleWishlist(p.id)}
                                    >
                                        {isLiked ? '❤️' : '🤍'}
                                    </button>
                                </div>
                                <div className="product-body">
                                    <div className="product-name">{p.name}</div>
                                    <div className="product-meta">
                                        <span className="product-cat">{p.category || 'General'}</span>
                                        <span className="product-rating">★ 4.5</span>
                                    </div>
                                </div>
                                {qty === 0 ? (
                                    <button className="add-btn" onClick={() => addToCart(p)}>＋ ADD TO CART</button>
                                ) : (
                                    <div className="qty-control">
                                        <button className="qty-btn" onClick={() => changeQty(p.id, -1)}><FaMinus /></button>
                                        <span className="qty-num">{qty}</span>
                                        <button className="qty-btn" onClick={() => changeQty(p.id, 1)}><FaPlus /></button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredProducts.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <div className="empty-text">No products found.</div>
                        </div>
                    )}
                </div>

                {/* STICKY CART BAR */}
                <div className={`sticky-cart ${cartCount > 0 ? 'show' : ''}`}>
                    <div className="sc-left">
                        <div className="sc-bubble">{cartCount}</div>
                        <div className="sc-label">items added</div>
                    </div>
                    <div className="sc-price">₹{cartTotal.toLocaleString()}</div>
                    <button className="sc-open-btn" onClick={() => setIsCartOpen(true)}>
                        View Cart <FaChevronRight size={10} />
                    </button>
                </div>

                {/* CART DRAWER */}
                <div className={`overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
                <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
                    <div className="drawer-handle"></div>
                    <div className="drawer-header">
                        <div className="drawer-title">🛒 Your Cart</div>
                        <button className="close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
                    </div>
                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <div className="py-10 text-center text-slate-400">Your cart is empty</div>
                        ) : (
                            cart.map(item => (
                                <div className="cart-item" key={item.id}>
                                    <div className="ci-thumb" style={{ background: item.bg || '#f1effe', color: item.fg || '#4f1fe6' }}>
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="i" className="w-full h-full object-contain" />
                                        ) : (
                                            item.placeholder || item.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="ci-info">
                                        <div className="ci-name">{item.name}</div>
                                        <div className="ci-price">₹{item.price.toLocaleString()} × {item.qty}</div>
                                    </div>
                                    <div className="ci-qty">
                                        <button className="ci-qty-btn" onClick={() => changeQty(item.id, -1)}><FaMinus /></button>
                                        <span className="ci-qty-num">{item.qty}</span>
                                        <button className="ci-qty-btn" onClick={() => changeQty(item.id, 1)}><FaPlus /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {cart.length > 0 && (
                        <div className="cart-footer">
                            <div className="cart-total-row">
                                <span className="cart-total-label">Grand Total</span>
                                <span className="cart-total-val">₹{cartTotal.toLocaleString()}</span>
                            </div>
                            <button className="checkout-btn" onClick={whatsappOrder}>
                                <FaWhatsapp size={18} /> Proceed to WhatsApp Order
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

                .store-page-root {
                    --brand: #4f1fe6;
                    --brand-mid: #6d3ef5;
                    --brand-light: #ede9fe;
                    --surface: #ffffff;
                    --surface2: #f8f7ff;
                    --text-primary: #18142e;
                    --text-secondary: #6b6480;
                    --text-muted: #a89fc0;
                    --border: rgba(79,31,230,0.12);
                    --radius-sm: 8px;
                    --radius-md: 12px;
                    --radius-lg: 18px;
                    --radius-xl: 24px;
                    
                    background: var(--surface2);
                    min-height: 100vh;
                    font-family: 'DM Sans', sans-serif;
                    color: var(--text-primary);
                }

                .page-container {
                    max-width: 480px;
                    margin: 0 auto;
                    background: var(--surface2);
                    min-height: 100vh;
                    position: relative;
                }

                @media (min-width: 900px) {
                    .page-container { max-width: 1000px; padding: 0 20px; }
                }

                /* HEADER */
                .store-header {
                    background: linear-gradient(145deg, #160855 0%, #2d1285 35%, #4f1fe6 70%, #7c52f8 100%);
                    padding: 24px 20px 80px;
                    position: relative;
                    overflow: hidden;
                }

                @media (min-width: 900px) {
                    .store-header { border-radius: 0 0 40px 40px; }
                }

                .header-orb { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.06); pointer-events: none; }
                .orb1 { width: 220px; height: 220px; top: -80px; right: -60px; }
                .orb2 { width: 140px; height: 140px; bottom: -40px; left: 20px; }
                .orb3 { width: 80px; height: 80px; top: 30px; left: 45%; background: rgba(255,255,255,0.04); }

                .header-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; position: relative; z-index: 2; }
                .biz-identity { display: flex; align-items: center; gap: 12px; }
                .biz-avatar {
                    width: 44px; height: 44px; border-radius: 12px;
                    background: rgba(255,255,255,0.15);
                    border: 1.5px solid rgba(255,255,255,0.25);
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #fff;
                    backdrop-filter: blur(8px); flex-shrink: 0;
                }
                .biz-name { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; line-height: 1.2; }
                .online-pill { display: inline-flex; align-items: center; gap: 5px; background: rgba(16,185,129,0.2); color: #6ee7b7; font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 20px; border: 1px solid rgba(16,185,129,0.3); margin-top: 3px; }
                .online-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
                @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.8); opacity: 0.6; } }

                .header-actions { display: flex; gap: 10px; }
                .icon-btn {
                    width: 38px; height: 38px; border-radius: 12px;
                    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18);
                    display: flex; align-items: center; justify-content: center; color: #fff;
                    cursor: pointer; position: relative; backdrop-filter: blur(4px);
                }
                .cart-badge { position: absolute; top: -5px; right: -5px; width: 18px; height: 18px; border-radius: 50%; background: #f0b429; color: #1a0a00; font-size: 10px; font-weight: 700; display: none; align-items: center; justify-content: center; border: 1.5px solid #2d1285; }
                .cart-badge.show { display: flex; }

                .store-chip { font-size: 10px; letter-spacing: 0.1em; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; margin-bottom: 8px; position: relative; z-index: 2; }
                .store-tagline { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 16px; position: relative; z-index: 2; }
                .header-meta { display: flex; gap: 10px; flex-wrap: wrap; position: relative; z-index: 2; }
                .meta-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); font-size: 12px; padding: 5px 12px; border-radius: 20px; backdrop-filter: blur(4px); }

                /* SEARCH & FILTER */
                .search-float { margin: -32px 20px 0; background: #fff; border-radius: var(--radius-lg); padding: 16px; box-shadow: 0 10px 25px rgba(79,31,230,0.1); border: 1px solid var(--border); position: relative; z-index: 10; }
                .search-row { display: flex; gap: 10px; }
                .search-input-wrap { flex: 1; position: relative; display: flex; align-items: center; }
                .search-icon-inner { position: absolute; left: 12px; color: var(--text-muted); }
                .search-input { width: 100%; padding: 10px 12px 10px 38px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; outline: none; background: #fbfbff; }
                .search-input:focus { border-color: var(--brand); background: #fff; }
                .sort-select-btn { padding: 0 10px; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: var(--brand-light); color: var(--brand); font-size: 12px; font-weight: 600; outline: none; }
                
                .cat-chips { display: flex; gap: 8px; margin-top: 12px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
                .cat-chips::-webkit-scrollbar { display: none; }
                .chip { white-space: nowrap; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1.5px solid var(--border); background: #fff; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
                .chip.active { background: var(--brand); color: #fff; border-color: var(--brand); box-shadow: 0 4px 12px rgba(79,31,230,0.3); }

                /* STATS */
                .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 20px 20px 0; }
                .stat-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
                .stat-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: 600; }
                .stat-val { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text-primary); }
                .stat-val span { font-size: 11px; font-weight: 400; opacity: 0.6; }

                /* SECTION HEADER */
                .section-header { padding: 24px 20px 12px; }
                .section-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
                .section-dot { width: 8px; height: 8px; background: var(--brand); border-radius: 50%; }
                .section-count { background: var(--brand-light); color: var(--brand); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }

                /* PRODUCT GRID */
                .product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 0 20px 100px; }
                @media (min-width: 600px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (min-width: 900px) { .product-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }

                .product-card {
                    background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg);
                    overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    transition: transform 0.3s, box-shadow 0.3s;
                    animation: fadeUp 0.5s both;
                }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(79,31,230,0.12); }

                .product-img-wrap { position: relative; aspect-ratio: 1/1; overflow: hidden; }
                .product-img-bg { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 44px; font-weight: 800; }
                .price-badge { position: absolute; top: 10px; right: 10px; background: var(--brand); color: #fff; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; box-shadow: 0 4px 10px rgba(79,31,230,0.3); }
                .wishlist-btn { position: absolute; top: 10px; left: 10px; width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.9); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.2s; }
                .wishlist-btn.active { background: #fff; }

                .product-body { padding: 12px 12px 0; }
                .product-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .product-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .product-cat { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; }
                .product-rating { font-size: 11px; color: #f0b429; font-weight: 700; }

                .add-btn { width: calc(100% - 24px); margin: 0 12px 12px; background: var(--brand); color: #fff; border: none; border-radius: var(--radius-sm); padding: 10px; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.2s; }
                .add-btn:hover { background: var(--brand-mid); }

                .qty-control { display: flex; margin: 0 12px 12px; border: 2px solid var(--brand); border-radius: var(--radius-sm); overflow: hidden; }
                .qty-btn { width: 36px; height: 34px; border: none; background: var(--brand-light); color: var(--brand); cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .qty-num { flex: 1; text-align: center; line-height: 34px; font-weight: 700; font-size: 14px; color: var(--brand); background: #fff; }

                /* STICKY BAR */
                .sticky-cart {
                    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(100px);
                    width: calc(100% - 40px); max-width: 440px;
                    background: linear-gradient(135deg, #160855, #2d1285, #4f1fe6);
                    color: #fff; border-radius: var(--radius-xl); padding: 14px 20px;
                    display: flex; align-items: center; justify-content: space-between;
                    box-shadow: 0 15px 35px rgba(79,31,230,0.4); z-index: 50;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    opacity: 0;
                }
                .sticky-cart.show { transform: translateX(-50%) translateY(0); opacity: 1; }
                .sc-bubble { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; margin-right: 12px; }
                .sc-left { display: flex; align-items: center; }
                .sc-label { font-size: 13px; opacity: 0.9; }
                .sc-price { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #f0b429; }
                .sc-open-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 10px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; }

                /* DRAWER */
                .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 100; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
                .overlay.open { opacity: 1; pointer-events: auto; }
                .cart-drawer {
                    position: fixed; bottom: 0; left: 50%; transform: translateX(-50%) translateY(100%);
                    width: 100%; max-width: 480px; background: #fff; border-radius: 30px 30px 0 0;
                    box-shadow: 0 -10px 40px rgba(0,0,0,0.1); z-index: 101; padding-bottom: 30px;
                    max-height: 85vh; overflow-y: auto; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
                }
                .cart-drawer.open { transform: translateX(-50%) translateY(0); }
                .drawer-handle { width: 40px; height: 5px; background: #e2e8f0; border-radius: 10px; margin: 15px auto; }
                .drawer-header { display: flex; justify-content: space-between; padding: 10px 24px 20px; border-bottom: 1px solid #f1f5f9; }
                .drawer-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
                .close-btn { width: 32px; height: 32px; border-radius: 50%; background: #f8fafc; border: none; cursor: pointer; font-size: 14px; }
                
                .cart-item { display: flex; align-items: center; gap: 15px; padding: 15px 24px; border-bottom: 1px solid #f8fafc; }
                .ci-thumb { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; flex-shrink: 0; }
                .ci-info { flex: 1; }
                .ci-name { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
                .ci-price { font-size: 12px; color: var(--text-muted); }
                .ci-qty { display: flex; align-items: center; gap: 10px; }
                .ci-qty-btn { width: 28px; height: 28px; border: 1px solid var(--border); border-radius: 8px; background: #fff; color: var(--brand); font-weight: 700; cursor: pointer; }
                .ci-qty-num { font-weight: 700; font-size: 14px; min-width: 20px; text-align: center; }

                .cart-footer { padding: 20px 24px; border-top: 1px solid #f1f5f9; }
                .cart-total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .cart-total-label { font-size: 15px; color: var(--text-secondary); }
                .cart-total-val { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: var(--brand); }
                .checkout-btn { width: 100%; background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; border: none; border-radius: 16px; padding: 16px; font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 20px rgba(34,197,94,0.3); }

                .empty-state { grid-column: 1/-1; text-align: center; padding: 60px 20px; opacity: 0.5; }
                .empty-icon { font-size: 40px; margin-bottom: 10px; }

                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}
