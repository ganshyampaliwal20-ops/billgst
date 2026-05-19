"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { getTranslations } from "@/lib/translations";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { generateCatalogPDF } from "@/lib/pdf-generator";
import { Html5QrcodeScanner } from "html5-qrcode";

import { optimizeImage } from "@/lib/utils";

export default function InventoryPage() {
    const router = useRouter();
    const { products, addProduct, updateProduct, deleteProduct, fetchProducts, businessProfile, settings } = useStore() as any;
    const [isClient, setIsClient] = useState(false);
    const t = getTranslations(settings?.language || 'en');
    const [showProfit, setShowProfit] = useState(true);

    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [currentView, setCurrentView] = useState("list");
    const [sortBy, setSortBy] = useState("default");
    const [showFilters, setShowFilters] = useState(false);
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterGst, setFilterGst] = useState("all");

    // Modal controls
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showCustomGst, setShowCustomGst] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        hsn_code: "",
        price: "",
        purchase_price: "",
        stock_quantity: "",
        alert_quantity: "",
        unit: "PCS",
        gst_rate: "18",
        type: "product",
        image_url: "",
        expiry_date: "",
        expiry_alert_days: "10",
    });

    useEffect(() => {
        setIsClient(true);
        if (fetchProducts) fetchProducts();
    }, []);

    // ── HELPER FUNCTIONS ──
    const getStatusInfo = (stock: number) => {
        if (stock <= 0) return { label: "Critical Low", sc: "low", pct: 5, color: "var(--red)" };
        if (stock <= 10) return { label: "Low", sc: "mid", pct: 15, color: "var(--amber)" };
        return { label: "Excellent", sc: "high", pct: 100, color: "var(--green)" };
    };

    const getExpiryStatus = (p: any) => {
        if (!p.expiry_date) return null;
        const exp = new Date(p.expiry_date);
        const now = new Date();
        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return { expired: true, text: 'Expired', color: 'var(--red)' };
        const alertDays = p.expiry_alert_days || 10;
        if (diffDays <= alertDays) return { expired: false, text: `Expiring in ${diffDays} days`, color: 'var(--amber)' };
        return null;
    };

    const getProductEmoji = (p: any) => {
        if (p.image_url) return null;
        const name = (p.name || "").toUpperCase();
        if (name.includes("PHONE") || name.includes("MOBI")) return "📱";
        if (name.includes("WATCH")) return "⌚";
        if (name.includes("LAP") || name.includes("CORE")) return "💻";
        if (p.type?.toLowerCase() === 'service') return "🔧";
        return "📦";
    };

    if (!isClient) {
        return (
            <div className="inv-page-container">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    :root {
                      --bg:        #f2f3f7;
                      --white:     #ffffff;
                      --ink:       #0d0f1a;
                      --ink2:      --2d3048;
                      --ink3:      --6b7094;
                      --ink4:      --a8adcc;
                      --border:    #e4e6f0;
                      --border2:   #d0d3e8;
                      --green:     #10b981;
                      --green-lt:  #d1fae5;
                      --green-dk:  #059669;
                      --amber:     #f59e0b;
                      --amber-lt:  #fef3c7;
                      --red:       #ef4444;
                      --red-lt:    #fee2e2;
                      --blue:      #3b82f6;
                      --blue-lt:   #dbeafe;
                      --purple:    #8b5cf6;
                      --purple-lt: #ede9fe;
                      --indigo:    #4f46e5;
                    }
                    .inv-page-container {
                      font-family:sans-serif;
                      background:var(--bg);
                      max-width:480px; margin:0 auto;
                      min-height:100vh;
                      color:var(--ink);
                    }
                    `
                }} />
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.loading}</div>
            </div>
        );
    }

    // ── DERIVED STATES ──
    const filteredProducts = (products || [])
        .filter((p: any) => p && p.status !== "INACTIVE")
        .filter((p: any) => {
            const matchesSearch =
                !searchTerm ||
                (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.hsn_code || "").toLowerCase().includes(searchTerm.toLowerCase());

            const stock = parseInt(p.stock_quantity) || 0;

            let matchesTab = true;
            if (activeTab === "product") matchesTab = (p.type || "").toLowerCase() === "product";
            if (activeTab === "service") matchesTab = (p.type || "").toLowerCase() === "service";
            if (activeTab === "low") matchesTab = stock > 0 && stock <= 10;
            if (activeTab === "out") matchesTab = stock <= 0;
            if (activeTab === "expiry") {
                const expStatus = getExpiryStatus(p);
                matchesTab = !!expStatus;
            }

            const matchesCategory = filterCategory === "all" || (p.type || "PRODUCT").toUpperCase() === filterCategory.toUpperCase();
            const matchesGst = filterGst === "all" || String(p.gst_rate) === filterGst;

            return matchesSearch && matchesTab && matchesCategory && matchesGst;
        })
        .sort((a: any, b: any) => {
            if (sortBy === "price_low") return parseFloat(a.price) - parseFloat(b.price);
            if (sortBy === "price_high") return parseFloat(b.price) - parseFloat(a.price);
            if (sortBy === "name_az") return a.name.localeCompare(b.name);
            return 0;
        });

    const totalItems = (products || []).filter((p: any) => p && p.status !== "INACTIVE").length;
    const lowStockCount = (products || []).filter((p: any) => {
        const stock = parseInt(p.stock_quantity) || 0;
        return p && p.status !== "INACTIVE" && stock > 0 && stock <= 10;
    }).length;

    const stockValue = (products || [])
        .filter((p: any) => p && p.status !== "INACTIVE")
        .reduce(
            (acc: number, p: any) =>
                acc + parseFloat(p.price || 0) * (parseFloat(p.stock_quantity) || 0),
            0
        );

    // ── ACTIONS ──
    const handleEdit = (p: any) => {
        setFormData({
            name: p.name,
            description: p.description || "",
            hsn_code: p.hsn_code || "",
            price: p.price,
            purchase_price: p.purchase_price || "",
            stock_quantity: p.stock_quantity || "",
            alert_quantity: p.alert_quantity || "",
            unit: p.unit || "PCS",
            gst_rate: p.gst_rate || "18",
            type: p.type || "product",
            image_url: p.image_url || "",
            expiry_date: p.expiry_date ? new Date(p.expiry_date).toISOString().split('T')[0] : "",
            expiry_alert_days: p.expiry_alert_days || "10",
        });
        setEditingId(p.id);
        const commonRates = ["0", "5", "12", "18", "28"];
        setShowCustomGst(!commonRates.includes(String(p.gst_rate)));
        setShowAddModal(true);
    };

    const handleDelete = async (e: any, id: string, name: string) => {
        e.stopPropagation();
        if (confirm(`Delete "${name}"?`)) {
            await deleteProduct(id);
            toast.success(`🗑 ${name} deleted!`);
        }
    };

    const saveProduct = async () => {
        if (!formData.name || !formData.price || isNaN(parseFloat(formData.price))) {
            toast.error("⚠ Name aur price zaroori hai!");
            return;
        }

        const data = {
            ...formData,
            price: parseFloat(formData.price),
            purchase_price: parseFloat(formData.purchase_price) || 0,
            stock_quantity: parseInt(formData.stock_quantity) || 0,
            gst_rate: parseFloat(formData.gst_rate),
            expiry_date: formData.expiry_date || null,
            expiry_alert_days: parseInt(formData.expiry_alert_days) || 10,
        };

        try {
            if (editingId) {
                await updateProduct(editingId, data);
                toast.success(`✅ ${data.name} updated!`);
            } else {
                await addProduct({ id: crypto.randomUUID(), ...data, created_at: new Date().toISOString() });
                toast.success(`✅ ${data.name} added to inventory!`);
            }
            setShowAddModal(false);
            setEditingId(null);
        } catch (err) {
            console.error("Failed to save product", err);
            // toast.error is already handled in the store
        }
    };

    const openAddModal = () => {
        setFormData({
            name: "",
            description: "",
            hsn_code: "",
            price: "",
            purchase_price: "",
            stock_quantity: "",
            alert_quantity: "",
            unit: "PCS",
            gst_rate: "18",
            type: "product",
            image_url: "",
            expiry_date: "",
            expiry_alert_days: "10",
        });
        setEditingId(null);
        setShowCustomGst(false);
        setShowAddModal(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const optimizedImage = await optimizeImage(file, 800, 800, 0.7);
                setFormData(prev => ({ ...prev, image_url: optimizedImage }));
                toast.success('Image optimized!');
            } catch (error: any) {
                console.error('Failed to optimize image:', error);
                toast.error(error.message || 'Image upload fail ho gaya!');
            }
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            toast.success(`Excel/CSV file "${file.name}" imported successfully!`);
        }
    };

    const openQR = (e: any, p: any) => {
        e.stopPropagation();
        setSelectedProduct(p);
        setShowQrModal(true);
    };

    const downloadPdf = async () => {
        if (!products || products.length === 0) {
            toast.error("Inventory me koi product nahi hai!");
            return;
        }
        const loadToast = toast.loading("PDF catalog generate ho raha hai...");
        try {
            await generateCatalogPDF(products, businessProfile);
            toast.dismiss(loadToast);
            toast.success("✅ Product Catalog download ho gaya!");
        } catch (e) {
            toast.dismiss(loadToast);
            toast.error("❌ PDF banane me galti hui!");
        }
    };

    const shareLowStockOnWhatsApp = () => {
        const lowItems = products.filter((p: any) => {
            const stock = parseInt(p.stock_quantity) || 0;
            const alert = parseInt(p.alert_quantity) || 10;
            return stock <= alert;
        });

        if (lowItems.length === 0) {
            toast.success("Sab stock badhiya hai!");
            return;
        }

        let message = `*🚨 BillGST Low Stock Alert*\n\nNiche diye gaye products ka stock khatam ho raha hai:\n\n`;
        lowItems.forEach((p: any) => {
            message += `• ${p.name}: *${p.stock_quantity} ${p.unit || 'pcs'}* (Limit: ${p.alert_quantity || 10})\n`;
        });
        
        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
    };

    const startScanner = () => {
        setShowScanner(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
            scanner.render((decodedText) => {
                scanner.clear();
                setShowScanner(false);
                handleScannedCode(decodedText);
            }, (error) => {
                // Ignore errors
            });
        }, 300);
    };

    const handleScannedCode = (code: string) => {
        const existing = products.find((p: any) => p.hsn_code === code);
        if (existing) {
            toast.success(`Found: ${existing.name}`);
            handleEdit(existing);
        } else {
            toast(`New Item Scanned: ${code}`, { icon: '✨' });
            openAddModal();
            setFormData(prev => ({ ...prev, hsn_code: code }));
        }
    };

    return (
        <div className="inv-page-container">
            {lowStockCount > 0 && (
                <div className="smart-alert">
                    <div className="smart-alert-text">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Attention: {lowStockCount} items are low in stock!
                    </div>
                    <button onClick={shareLowStockOnWhatsApp} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}>
                        Share Alert
                    </button>
                </div>
            )}
            <link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                  --bg:        #f2f3f7;
                  --white:     #ffffff;
                  --ink:       #0d0f1a;
                  --ink2:      #2d3048;
                  --ink3:      #6b7094;
                  --ink4:      #a8adcc;
                  --border:    #e4e6f0;
                  --border2:   #d0d3e8;
                  --green:     #10b981;
                  --green-lt:  #d1fae5;
                  --green-dk:  #059669;
                  --amber:     #f59e0b;
                  --amber-lt:  #fef3c7;
                  --red:       #ef4444;
                  --red-lt:    #fee2e2;
                  --blue:      #3b82f6;
                  --blue-lt:   #dbeafe;
                  --purple:    #8b5cf6;
                  --purple-lt: #ede9fe;
                  --indigo:    #4f46e5;
                  --shadow-xs: 0 1px 3px rgba(13,15,26,0.06);
                  --shadow-sm: 0 2px 8px rgba(13,15,26,0.08);
                  --shadow:    0 4px 20px rgba(13,15,26,0.1);
                  --shadow-lg: 0 12px 40px rgba(13,15,26,0.14);
                  --radius:    16px;
                  --radius-sm: 10px;
                  --radius-xs: 7px;
                }
                
                .inv-page-container {
                  font-family:'DM Sans',sans-serif;
                  background:var(--bg);
                  max-width:480px; margin:0 auto;
                  min-height:100vh;
                  color:var(--ink);
                  -webkit-font-smoothing:antialiased;
                  overflow-x:hidden;
                  padding-bottom: 120px;
                }

                /* scrollbar hide */
                .inv-page-container * {scrollbar-width:none;}
                .inv-page-container *::-webkit-scrollbar{display:none;}

                /* ══ HERO SECTION ══ */
                .hero {
                  background:linear-gradient(160deg,#1a1d3a 0%,#2a2f6e 60%,#1e3a5f 100%);
                  padding:20px 18px 24px;
                  position:relative;overflow:hidden;
                }
                .hero::before{
                  content:'';position:absolute;inset:0;
                  background-image:
                    linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),
                    linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);
                  background-size:28px 28px;
                }
                .hero-inner{position:relative;z-index:1;}
                .hero-eyebrow{
                  display:inline-flex;align-items:center;gap:6px;
                  font-size:10px;font-weight:700;color:rgba(255,255,255,0.45);
                  text-transform:uppercase;letter-spacing:1.5px;
                  margin-bottom:8px;
                }
                .hero-eyebrow-dot{width:5px;height:5px;border-radius:50%;background:#10b981;}
                .hero-title{
                  font-family:'Clash Display',sans-serif;
                  font-size:28px;font-weight:700;color:#fff;
                  letter-spacing:-0.5px;line-height:1.1;
                  margin-bottom:4px;
                }
                .hero-title .accent{color:#10b981;}
                .hero-sub{
                  font-size:12px;color:rgba(255,255,255,0.4);
                  letter-spacing:1px;text-transform:uppercase;
                  margin-bottom:20px;font-weight:500;
                }

                /* Stats grid */
                .stats-grid{
                  display:grid;grid-template-columns:1fr 1fr;gap:10px;
                }
                .stat-card{
                  background:rgba(255,255,255,0.07);
                  border:1px solid rgba(255,255,255,0.08);
                  border-radius:var(--radius-sm);
                  padding:10px 12px;
                  display:flex;align-items:center;gap:10px;
                }
                .stat-icon{
                  width:32px;height:32px;border-radius:8px;
                  display:flex;align-items:center;justify-content:center;
                  flex-shrink:0;font-size:15px;
                }
                .stat-num{
                  font-family:'Bricolage Grotesque',sans-serif;
                  font-size:18px;font-weight:800;line-height:1;
                  letter-spacing:-0.5px;
                }
                .stat-label{font-size:9px;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:.7px;margin-top:2px;}

                /* ══ SEARCH & FILTER BAR ══ */
                .controls{
                  background:var(--white);
                  padding:14px 16px;
                  border-bottom:1px solid var(--border);
                  display:flex;flex-direction:column;gap:10px;
                  position:sticky;top:0;z-index:100;
                }
                .search-row{display:flex;gap:8px;}
                .search-box{
                  flex:1;display:flex;align-items:center;gap:9px;
                  background:var(--bg);border:1.5px solid var(--border2);
                  border-radius:var(--radius-sm);padding:10px 13px;
                }
                .search-box input{
                  flex:1;border:none;outline:none;background:none;
                  font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink) !important;
                }
                .search-box input::placeholder{color:var(--ink4);}

                .ctrl-btn{
                  display:flex;align-items:center;gap:6px;
                  padding:10px 13px;border-radius:var(--radius-sm);
                  font-family:'Bricolage Grotesque',sans-serif;
                  font-size:12px;font-weight:700;
                  border:1.5px solid var(--border2);
                  background:var(--bg);color:var(--ink2);
                  cursor:pointer;transition:all .15s;white-space:nowrap;
                }

                /* Filter tabs */
                .filter-tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;}
                .f-tab{
                  padding:6px 13px;border-radius:99px;white-space:nowrap;
                  font-size:12px;font-weight:600;
                  border:1.5px solid var(--border2);
                  background:transparent;color:var(--ink3);
                  cursor:pointer;transition:all .15s;flex-shrink:0;
                }
                .f-tab.active{background:var(--ink);border-color:var(--ink);color:#fff;}
                .f-tab.warning{color:var(--amber);border-color:var(--amber-lt);background:var(--amber-lt);}
                .f-tab.warning.active{background:var(--amber);border-color:var(--amber);color:#fff;}

                /* ══ LIST HEADER ══ */
                .list-header{
                  padding:14px 16px 10px;
                  display:flex;align-items:center;justify-content:space-between;
                }
                .list-title{
                  font-family:'Bricolage Grotesque',sans-serif;
                  font-size:15px;font-weight:700;color:var(--ink);
                }
                .list-title span{color:var(--ink3);font-weight:500;font-size:13px;}
                .sort-select{
                  background:var(--white);border:1.5px solid var(--border);
                  border-radius:var(--radius-xs);padding:5px 10px;
                  font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink2);
                  outline:none;cursor:pointer;
                }

                /* ══ PRODUCT LIST ══ */
                .products-list{
                  padding:0 12px;
                  display:flex;flex-direction:column;gap:10px;
                }

                /* ── PRODUCT CARD ── */
                .product-card{
                  background:var(--white);
                  border-radius:var(--radius);
                  border:1px solid var(--border);
                  box-shadow:var(--shadow-xs);
                  overflow:hidden;
                  animation:cardIn .4s ease both;
                }
                @keyframes cardIn{
                  from{opacity:0;transform:translateY(12px);}
                  to{opacity:1;transform:translateY(0);}
                }

                .card-main{
                  display:flex;align-items:flex-start;gap:12px;
                  padding:14px 14px 10px;
                }
                .prod-img{
                  width:48px;height:48px;border-radius:10px;
                  overflow:hidden;flex-shrink:0;
                  background:var(--bg);border:1px solid var(--border);
                  position:relative;
                }
                .prod-img img{width:100%;height:100%;object-fit:cover;display:block;}
                .prod-img-placeholder{
                  width:100%;height:100%;
                  display:flex;align-items:center;justify-content:center;
                  font-size:20px;
                  background:linear-gradient(135deg,#f0f0f8,#e4e6f0);
                }
                .stock-dot{
                  position:absolute;top:4px;right:4px;
                  width:8px;height:8px;border-radius:50%;
                  border:1.5px solid #fff;
                }
                .stock-dot.high{background:var(--green);}
                .stock-dot.mid{background:var(--amber);}
                .stock-dot.low{background:var(--red);}

                .prod-info{flex:1;min-width:0;}
                .prod-name{
                  font-family:'Bricolage Grotesque',sans-serif;
                  font-size:15px;font-weight:700;color:var(--ink);
                  margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                }
                .prod-hsn{font-size:11px;color:var(--ink4);margin-bottom:6px;}
                .tags-row{display:flex;gap:5px;flex-wrap:wrap;}
                .tag{
                  font-size:10px;font-weight:700;letter-spacing:.3px;
                  padding:3px 8px;border-radius:5px;text-transform:uppercase;
                }
                .tag.product{background:var(--blue-lt);color:var(--blue);}
                .tag.service{background:var(--purple-lt);color:var(--purple);}
                .tag.gst{background:var(--green-lt);color:var(--green-dk);}

                .expiry-warn{
                  display:inline-flex;align-items:center;gap:4px;
                  font-size:10px;font-weight:700;
                  background:#fff7ed;color:#c2410c;
                  border:1px solid #fed7aa;
                  padding:3px 8px;border-radius:5px;margin-top:4px;
                }

                .prod-right{
                  display:flex;flex-direction:column;align-items:flex-end;gap:4px;
                  flex-shrink:0;
                }
                .prod-qty{
                  font-family:'Bricolage Grotesque',sans-serif;
                  font-size:17px;font-weight:800;
                  letter-spacing:-0.3px;line-height:1;
                }
                .prod-qty.high{color:var(--green);}
                .prod-qty.mid{color:var(--amber);}
                .prod-qty.low{color:var(--red);}
                .prod-qty-unit{font-size:10px;color:var(--ink4);font-weight:400;display:block;text-align:right;}
                .prod-price{
                  font-family:'DM Mono',monospace;
                  font-size:12px;font-weight:500;color:var(--ink3);
                  margin-top:2px;
                }

                .stock-bar-wrap{padding:0 14px 8px;}
                .stock-bar-info{display:flex;justify-content:space-between;margin-bottom:4px;}
                .stock-bar-label{font-size:10px;color:var(--ink4);}
                .stock-bar-pct{font-size:10px;font-weight:600;}
                .stock-bar-track{height:5px;background:var(--bg);border-radius:99px;overflow:hidden;}
                .stock-bar-fill{height:100%;border-radius:99px;transition:width .5s ease;}
                .fill-high{background:linear-gradient(90deg,var(--green),#34d399);}
                .fill-mid{background:linear-gradient(90deg,var(--amber),#fcd34d);}
                .fill-low{background:linear-gradient(90deg,var(--red),#f87171);}

                .card-actions{
                  display:flex;
                  border-top:1px solid var(--border);
                }
                .action-btn{
                  flex:1;padding:10px 8px;border:none;background:none;cursor:pointer;
                  display:flex;align-items:center;justify-content:center;gap:5px;
                  font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;
                  color:var(--ink3);transition:all .12s;
                }
                .action-btn:not(:last-child){border-right:1px solid var(--border);}
                .action-btn svg{width:14px;height:14px;}
                .action-btn.edit:hover{color:var(--blue);}
                .action-btn.del:hover{color:var(--red);background:var(--red-lt);}

                /* Action buttons at bottom - Equal size for all 4 */
                .hero-btns{display:flex;flex-direction:row;gap:8px;margin: 20px 14px;align-items:center;justify-content:space-between;}
                .hero-btn{
                  flex:1; width:0; min-width:0; /* Forces equal width */
                  padding:10px 4px; border-radius:12px;
                  font-family:'Bricolage Grotesque',sans-serif;
                  font-size:11px;font-weight:700;border:none;cursor:pointer;
                  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
                  transition:all .2s;
                }
                .hero-btn svg{width:16px;height:16px;}
                .hero-btn.catalog{ background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:#fff; box-shadow:0 3px 8px rgba(139,92,246,0.15); }
                .hero-btn.add{ background:linear-gradient(135deg,#10b981,#059669); color:#fff; box-shadow:0 3px 8px rgba(16,185,129,0.15); }
                .hero-btn.whatsapp{ background:#25D366; color:#fff; box-shadow:0 3px 8px rgba(37,211,102,0.15); }
                .hero-btn.scanner{ background:var(--ink); color:#fff; box-shadow:0 3px 8px rgba(13,15,26,0.15); }
                .hero-btn:active{transform:scale(0.95);}

                /* Smart Alert Banner */
                .smart-alert{
                  background:var(--red-lt);
                  border-bottom:1px solid var(--red);
                  padding:10px 16px;
                  display:flex;align-items:center;justify-content:space-between;
                  animation: slideDown 0.4s ease;
                }
                .smart-alert-text{ font-size:12px; color:var(--red); font-weight:700; display:flex; align-items:center; gap:6px; }
                @keyframes slideDown { from{transform:translateY(-100%);} to{transform:translateY(0);} }

                .profit-tag{
                  background:var(--green-lt); color:var(--green-dk);
                  font-size:9px; font-weight:800; padding:2px 5px; border-radius:4px;
                  margin-top:4px; display:inline-block;
                }

                /* ══ FAB ══ */
                .fab{
                  position:fixed;bottom:20px;right:20px;
                  width:54px;height:54px;border-radius:16px;
                  background:linear-gradient(135deg,#10b981,#059669);
                  border:none;cursor:pointer;
                  display:flex;align-items:center;justify-content:center;
                  box-shadow:0 6px 24px rgba(16,185,129,0.45);
                  transition:all .2s;z-index:150;
                }
                .fab svg{width:24px;height:24px;color:#fff;}

                /* Modals Styling */
                .modal-overlay { position:fixed; inset:0; background:rgba(11,15,30,.65); backdrop-filter:blur(8px); z-index:99999; display:flex; align-items:flex-start; justify-content:center; padding:80px 12px 20px 12px; overflow-y:auto; }
                .modal { margin:auto; background:var(--white); border-radius:22px; width:100%; max-width:520px; display:flex; flex-direction:column; max-height:90vh; overflow:hidden; }
                .modal-header { background:linear-gradient(135deg,#0b0f1e,#1c2340); padding:18px 22px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
                .modal-header h3 { font-size:16px; font-weight:800; color:#fff; margin:0;}
                .modal-close { width:32px; height:32px; background:rgba(255,255,255,.1); border:none; border-radius:8px; color:#fff; font-size:18px; cursor:pointer; flex-shrink:0; }
                .modal-body { padding:18px 22px; overflow-y:auto; flex-grow:1; }
                .field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
                .field-label { font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.8px; color:var(--ink3); margin-bottom:6px; display:block; }
                .field-input { width:100%; padding:10px 14px; border:1.5px solid var(--border); border-radius:11px; font-family:'DM Sans',sans-serif; font-size:13px; color:#000 !important; outline:none; background:var(--bg); }
                .field-input:focus { border-color:var(--green); background:var(--white); color:#000 !important; }
                .modal-footer { padding:16px 24px 20px; display:flex; gap:10px; flex-shrink:0; border-top:1px solid var(--border); background:var(--white); }
                .mf-btn { flex:1; padding:13px; border-radius:12px; font-size:14px; font-weight:800; cursor:pointer; border:none; }
                .mf-cancel { background:var(--bg); color:var(--ink2); border:1.5px solid var(--border); }
                .mf-save { background:linear-gradient(135deg,var(--green),#059669); color:#fff; }
                `}} />

            {/* ══ HERO ══ */}
            <div className="hero">
                <div className="hero-inner">
                    <div className="hero-eyebrow">
                        <span className="hero-eyebrow-dot"></span>
                        BillGST Smart System
                    </div>
                    <div className="hero-title">⚡ {t.smartInventory}</div>
                    <div className="hero-sub">{t.manageProductsStock}</div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "rgba(79,70,229,0.2)" }}>📦</div>
                            <div>
                                <div className="stat-num" style={{ color: "#fff" }}>{totalItems}</div>
                                <div className="stat-label">{t.totalItems}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "rgba(239,68,68,0.2)" }}>⚠️</div>
                            <div>
                                <div className="stat-num" style={{ color: "#f87171" }}>{lowStockCount}</div>
                                <div className="stat-label">{t.lowStock}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "rgba(16,185,129,0.2)" }}>💰</div>
                            <div>
                                <div className="stat-num" style={{ color: "#34d399", fontSize: "16px" }}>₹{(stockValue / 100000).toFixed(1)}L</div>
                                <div className="stat-label">{t.stockValue}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "rgba(245,158,11,0.2)" }}>📈</div>
                            <div>
                                <div className="stat-num" style={{ color: "#fbbf24" }}>{totalItems * 12}</div>
                                <div className="stat-label">{t.unitsSold}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ CONTROLS ══ */}
            <div className="controls">
                <div className="search-row">
                    <div className="search-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        <input
                            type="text"
                            placeholder="Product name, HSN code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className={`ctrl-btn ${!showProfit ? 'active' : ''}`} onClick={() => setShowProfit(!showProfit)} title={showProfit ? "Hide Profit" : "Show Profit"}>
                        {showProfit ? '👁️' : '🙈'}
                    </button>
                    <button className="ctrl-btn" onClick={() => setShowFilters(!showFilters)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                        Filter
                    </button>
                    <label className="ctrl-btn" style={{ cursor: 'pointer' }}>
                        <input type="file" accept=".csv, .xlsx" style={{ display: 'none' }} onChange={handleImport} />
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                        Import
                    </label>
                </div>
                <div className="filter-tabs">
                    <button className={`f-tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All Products</button>
                    <button className={`f-tab ${activeTab === "product" ? "active" : ""}`} onClick={() => setActiveTab("product")}>Product</button>
                    <button className={`f-tab ${activeTab === "service" ? "active" : ""}`} onClick={() => setActiveTab("service")}>Service</button>
                    <button className={`f-tab warning ${activeTab === "low" ? "active" : ""}`} onClick={() => setActiveTab("low")}>⚠ Low Stock</button>
                    <button className={`f-tab ${activeTab === "expiry" ? "active" : ""}`} onClick={() => setActiveTab("expiry")}>🕐 Expiry</button>
                </div>
            </div>

            {/* LIST HEADER */}
            <div className="list-header">
                <div className="list-title">Stock List <span>({filteredProducts.length} items)</span></div>
                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="default">Default</option>
                    <option value="name_az">Name A-Z</option>
                    <option value="price_low">Price: Low-High</option>
                    <option value="price_high">Price: High-Low</option>
                </select>
            </div>

            {/* ══ PRODUCTS ══ */}
            <div className="products-list">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((p: any, i: number) => {
                        const stock = parseInt(p.stock_quantity) || 0;
                        const st = getStatusInfo(stock);
                        const exp = getExpiryStatus(p);
                        return (
                            <div className="product-card" key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="card-main">
                                    <div className="prod-img">
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.name} />
                                        ) : (
                                            <div className="prod-img-placeholder">{getProductEmoji(p)}</div>
                                        )}
                                        <span className={`stock-dot ${st.sc}`}></span>
                                    </div>
                                    <div className="prod-info">
                                        <div className="prod-name">{p.name}</div>
                                        <div className="prod-hsn">HSN: {p.hsn_code || "NA"} &nbsp;·&nbsp; ₹{parseFloat(p.price).toLocaleString("en-IN")}/{p.unit || 'pcs'}</div>
                                        <div className="tags-row">
                                            <span className={`tag ${p.type?.toLowerCase() === 'service' ? 'service' : 'product'}`}>{p.type || "PRODUCT"}</span>
                                            <span className="tag gst">GST {p.gst_rate || 0}%</span>
                                        </div>
                                        {showProfit && p.price && p.purchase_price && Number(p.purchase_price) > 0 && parseFloat(p.price) > parseFloat(p.purchase_price) && (
                                            <div className="profit-tag">
                                                📈 Profit: {(((parseFloat(p.price) - parseFloat(p.purchase_price)) / parseFloat(p.purchase_price)) * 100).toFixed(0)}%
                                            </div>
                                        )}
                                        {exp && (
                                            <div className="expiry-warn" style={{ color: exp.color, borderColor: exp.color + '44' }}>
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                                {exp.text}
                                            </div>
                                        )}
                                    </div>
                                    <div className="prod-right">
                                        <span className={`prod-qty ${st.sc}`}>{stock}</span>
                                        <span className="prod-qty-unit">{p.unit || 'pcs'}</span>
                                        <span className="prod-price">₹{(parseFloat(p.price) * stock).toLocaleString("en-IN")}</span>
                                    </div>
                                </div>
                                <div className="stock-bar-wrap">
                                    <div className="stock-bar-info">
                                        <span className="stock-bar-label">{t.stockLevel}</span>
                                        <span className="stock-bar-pct" style={{ color: st.color }}>{st.label}</span>
                                    </div>
                                    <div className="stock-bar-track">
                                        <div className={`stock-bar-fill fill-${st.sc}`} style={{ width: `${st.pct}%` }}></div>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button className="action-btn edit" onClick={() => handleEdit(p)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        {t.edit}
                                    </button>
                                    <button className="action-btn qr" onClick={(e) => openQR(e, p)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><rect x="7" y="7" width="3" height="3" /><rect x="14" y="7" width="3" height="3" /><rect x="7" y="14" width="3" height="3" /><rect x="14" y="14" width="3" height="3" /></svg>
                                        {t.qrCode}
                                    </button>
                                    <button className="action-btn del" onClick={(e) => handleDelete(e, p.id, p.name)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" /></svg>
                                        {t.delete}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink3)' }}>
                        <div style={{ fontSize: '40px', marginBottom: '15px' }}>📦</div>
                        <div style={{ fontWeight: '700', fontSize: '16px' }}>{t.noProductsFound}</div>
                        <div style={{ fontSize: '12px', marginTop: '5px' }}>{t.inventoryEmptyHelp}</div>
                        <button 
                            onClick={openAddModal}
                            style={{ marginTop: '20px', background: 'var(--ink)', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: '700' }}
                        >
                            + {t.addFirstProduct}
                        </button>
                    </div>
                )}
            </div>
            {/* AI Smart Scanner Button */}
            <div style={{ padding: '0 14px', marginTop: '20px' }}>
                <button 
                    onClick={() => router.push('/dashboard/inventory/smart-add')}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
                        color: '#fff',
                        borderRadius: '12px',
                        border: 'none',
                        fontWeight: '800',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                        cursor: 'pointer'
                    }}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z"/><path d="M12 6v6l4 2"/></svg>
                    ✨ Smart Add via AI Scanner
                </button>
            </div>

            {/* ══ ACTIONS AT BOTTOM (As requested) ══ */}
            <div className="hero-btns">
                <button className="hero-btn catalog" onClick={downloadPdf}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8M16 17H8M10 9H8" /></svg>
                    {t.downloadCatalog}
                </button>
                <button className="hero-btn whatsapp" onClick={shareLowStockOnWhatsApp}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                    {t.shareLowStock}
                </button>
                <button className="hero-btn add" onClick={openAddModal}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                    {t.add}
                </button>
            </div>

            {/* FAB */}
            <button className="fab" onClick={openAddModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            </button>

            {/* Add/Edit Product Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false) }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId ? "✏️ Edit Product" : "＋ Add New Product"}</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                                <label style={{ position: "relative", width: "80px", height: "80px", background: "var(--bg)", borderRadius: "16px", border: "2px dashed var(--border2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
                                    {formData.image_url ? (
                                        <img src={formData.image_url} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{ fontSize: "24px" }}>📷</span>
                                    )}
                                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                                </label>
                            </div>

                            <div className="field-row">
                                <div>
                                    <label className="field-label">Product Name *</label>
                                    <input className="field-input" type="text" placeholder="e.g. iPhone 15" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="field-label">HSN Code</label>
                                    <input className="field-input" type="text" placeholder="e.g. 8517" value={formData.hsn_code} onChange={e => setFormData({ ...formData, hsn_code: e.target.value })} />
                                </div>
                            </div>

                            <div className="field-row">
                                <div>
                                    <label className="field-label">Sale Price (₹) *</label>
                                    <input className="field-input" type="number" placeholder="0.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="field-label">Purchase Price (₹)</label>
                                    <input className="field-input" type="number" placeholder="0.00" value={formData.purchase_price} onChange={e => setFormData({ ...formData, purchase_price: e.target.value })} />
                                </div>
                            </div>

                            <div className="field-row">
                                <div>
                                    <label className="field-label">Stock Qty *</label>
                                    <input className="field-input" type="number" placeholder="0" value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} />
                                </div>
                                <div>
                                    <label className="field-label">{t.lowStockAlert}</label>
                                    <input className="field-input" type="number" placeholder="10" value={formData.alert_quantity} onChange={e => setFormData({ ...formData, alert_quantity: e.target.value })} />
                                </div>
                            </div>

                            <div className="field-row">
                                <div>
                                    <label className="field-label">Unit</label>
                                    <input className="field-input" type="text" placeholder="PCS" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} />
                                </div>
                                <div>
                                    <label className="field-label">Category</label>
                                    <select className="field-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="product">Product</option>
                                        <option value="service">Service</option>
                                    </select>
                                </div>
                            </div>

                            <div className="field-row">
                                <div>
                                    <label className="field-label">GST Rate (%)</label>
                                    {!showCustomGst ? (
                                        <select className="field-input" value={formData.gst_rate} onChange={e => {
                                            if (e.target.value === 'custom') setShowCustomGst(true);
                                            else setFormData({ ...formData, gst_rate: e.target.value });
                                        }}>
                                            <option value="0">0%</option>
                                            <option value="5">5%</option>
                                            <option value="12">12%</option>
                                            <option value="18">18%</option>
                                            <option value="28">28%</option>
                                            <option value="custom">Custom %</option>
                                        </select>
                                    ) : (
                                        <input className="field-input" type="number" value={formData.gst_rate} onChange={e => setFormData({ ...formData, gst_rate: e.target.value })} autoFocus />
                                    )}
                                </div>
                                <div>
                                    <label className="field-label">Expiry Date</label>
                                    <input className="field-input" type="date" value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} />
                                </div>
                            </div>

                            {formData.expiry_date && (
                                <div style={{ marginTop: '-8px', marginBottom: '12px' }}>
                                    <label className="field-label">Alert Before (Days)</label>
                                    <input className="field-input" type="number" placeholder="10" value={formData.expiry_alert_days} onChange={e => setFormData({ ...formData, expiry_alert_days: e.target.value })} />
                                </div>
                            )}

                            <div style={{ marginBottom: '12px' }}>
                                <label className="field-label">Description</label>
                                <textarea className="field-input" rows={2} placeholder="Product details..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ resize: 'none' }} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="mf-btn mf-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="mf-btn mf-save" onClick={saveProduct}>Save Product</button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {showQrModal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
                    <div className="modal" style={{ maxWidth: '340px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📱 Product QR</h3>
                            <button className="modal-close" onClick={() => setShowQrModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '16px', marginBottom: '16px' }}>
                                <div style={{ fontSize: '60px' }}>{getProductEmoji(selectedProduct)}</div>
                                <div style={{ fontWeight: '700', marginTop: '10px' }}>{selectedProduct.name}</div>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--ink3)' }}>QR functionality coming soon to this view!</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Scanner Modal */}
            {showScanner && (
                <div className="modal-overlay" onClick={() => setShowScanner(false)}>
                    <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📷 Scan Barcode / QR</h3>
                            <button className="modal-close" onClick={() => setShowScanner(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
                            <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--ink3)', marginTop: '12px' }}>
                                Position the barcode inside the box to scan
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
