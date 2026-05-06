"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { generateCatalogPDF } from "@/lib/pdf-generator";

export default function InventoryPage() {
    const router = useRouter();
    const { products, addProduct, updateProduct, deleteProduct, businessProfile } = useStore() as any;
    const [isClient, setIsClient] = useState(false);

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
    }, []);

    if (!isClient) return null;

    // Derived states
    const filteredProducts = (products || [])
        .filter((p: any) => p && p.status !== "INACTIVE")
        .filter((p: any) => {
            const matchesSearch =
                !searchTerm ||
                (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.hsn_code || "").toLowerCase().includes(searchTerm.toLowerCase());

            const stock = parseInt(p.stock_quantity) || 0;
            const typeMatch = (p.type || "").toLowerCase() === activeTab.toLowerCase();

            let matchesTab = true;
            if (activeTab === "product") matchesTab = typeMatch;
            if (activeTab === "service") matchesTab = typeMatch;
            if (activeTab === "low") matchesTab = stock > 0 && stock <= 10;
            if (activeTab === "out") matchesTab = stock <= 0;

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

    const totalItems = products.filter((p: any) => p.status !== "INACTIVE").length;
    const lowStockCount = products.filter((p: any) => {
        const stock = parseInt(p.stock_quantity) || 0;
        return p.status !== "INACTIVE" && stock > 0 && stock <= 10;
    }).length;

    const stockValue = products
        .filter((p: any) => p.status !== "INACTIVE")
        .reduce(
            (acc: number, p: any) =>
                acc + parseFloat(p.price || 0) * (parseFloat(p.stock_quantity) || 0),
            0
        );

    // Helpers
    const getStatus = (stock: number) => {
        if (stock <= 0) return { cls: "status-out", label: "❌ Out of Stock", sc: "out" };
        if (stock <= 10) return { cls: "status-low", label: "⚠ Low Stock", sc: "low" };
        return { cls: "status-active", label: "✓ In Stock", sc: "ok" };
    };

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

    const saveProduct = () => {
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

        if (editingId) {
            updateProduct(editingId, data);
            toast.success(`✅ ${data.name} updated!`);
        } else {
            addProduct({ id: crypto.randomUUID(), ...data, created_at: new Date().toISOString() });
            toast.success(`✅ ${data.name} added to inventory!`);
        }
        setShowAddModal(false);
        setEditingId(null);
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
        toast.loading("PDF catalog generate ho raha hai...");
        try {
            await generateCatalogPDF(products, businessProfile);
            toast.dismiss();
            toast.success("✅ Product Catalog download ho gaya!");
        } catch (e) {
            toast.dismiss();
            toast.error("❌ PDF banane me galti hui!");
        }
    };

    // Calculate percentage for progress bars
    const getStockPct = (stock: number) => {
        const pct = Math.max(0, Math.min(100, (stock / 50) * 100)); // Default max assuming 50
        return pct;
    };

    // Extract initial char or emoji for product
    const getProductEmoji = (p: any) => {
        if (p.image_url) return null;
        if (p.name.includes("PHONE") || p.name.includes("MOBI")) return "📱";
        if (p.name.includes("WATCH")) return "⌚";
        if (p.name.includes("LAP") || p.name.includes("CORE")) return "💻";
        return "📦";
    };

    const getRandomBg = (id: string | number) => {
        const bgs = ["#eff6ff", "#f0fdf4", "#faf5ff", "#fffbeb", "#fff5f5"];
        const charCode = id.toString().charCodeAt(0);
        return bgs[charCode % bgs.length];
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

    return (
        <div className="inv-page">
            <style dangerouslySetInnerHTML={{
                __html: `
        .inv-page {
          --bg:#f0f2fa;--white:#fff;--ink:#0b0f1e;--slate:#3d4766;--muted:#7c88a6;
          --border:#e2e6f3;--faint:#f5f7fd;--indigo:#4f46e5;--indigo2:#7c3aed;
          --teal:#0ea5e9;--green:#10b981;--red:#ef4444;--amber:#f59e0b;--orange:#f97316;
          --shadow:0 2px 16px rgba(11,15,30,.07),0 1px 4px rgba(11,15,30,.04);
          --shadow-md:0 8px 32px rgba(11,15,30,.12),0 2px 8px rgba(11,15,30,.06);
          font-family:'Sora',sans-serif;
          background:var(--bg);
          color:var(--ink);
          display:flex;
          flex-direction:column;
          min-height:100vh;
        }

        .inv-main { flex:1; min-width:0; display:flex; flex-direction:column; }

        .page-header { background:linear-gradient(135deg,#0b0f1e,#1c2340,#1e3a5f); padding:22px 28px 20px; border-bottom:1px solid rgba(255,255,255,.05); }
        .ph-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
        .ph-left h1 { font-size:26px; font-weight:800; color:#fff; letter-spacing:-.5px; margin:0; }
        .ph-left h1 span { background:linear-gradient(135deg,var(--teal),var(--green)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .ph-left p { font-size:11.5px; color:rgba(255,255,255,.4); text-transform:uppercase; letter-spacing:1.2px; font-weight:600; margin-top:3px; margin-bottom:0;}
        .add-btn { background:linear-gradient(135deg,var(--green),#059669); color:#fff; border:none; padding:12px 22px; border-radius:13px; font-family:'Sora',sans-serif; font-size:13px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:8px; box-shadow:0 6px 20px rgba(16,185,129,.4); transition:all .25s; }
        .add-btn:hover { transform:translateY(-2px); filter:brightness(1.1); }

        .kpi-strip { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .kpi-card { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:14px 16px; display:flex; align-items:center; gap:12px; transition:all .2s; cursor:pointer; }
        .kpi-card:hover { background:rgba(255,255,255,.09); transform:translateY(-1px); }
        .kpi-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .kpi-val { font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:700; color:#fff; line-height:1; }
        .kpi-lbl { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.7px; color:rgba(255,255,255,.45); margin-top:3px; }

        .content { padding:24px 28px 40px; flex:1; }

        .search-filter-row { display:flex; align-items:center; gap:12px; margin-bottom:18px; }
        .search-wrap { flex:1; display:flex; align-items:center; gap:10px; background:var(--white); border:1.5px solid var(--border); border-radius:14px; padding:12px 16px; box-shadow:var(--shadow); transition:all .2s; }
        .search-wrap:focus-within { border-color:var(--green); box-shadow:0 0 0 3px rgba(16,185,129,.1); }
        .search-wrap input { flex:1; border:none; outline:none; font-family:'Sora',sans-serif; font-size:14px; font-weight:500; color:#000 !important; background:transparent; }
        .search-wrap input::placeholder { color:#c0c8da; font-weight:400; }
        .search-icon-btn { width:36px; height:36px; background:linear-gradient(135deg,var(--green),#059669); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:15px; cursor:pointer; flex-shrink:0; }
        .filter-btn { background:var(--white); border:1.5px solid var(--border); border-radius:12px; padding:12px 16px; font-family:'Sora',sans-serif; font-size:13px; font-weight:700; color:var(--slate); cursor:pointer; display:flex; align-items:center; gap:7px; box-shadow:var(--shadow); transition:all .2s; white-space:nowrap; }
        .filter-btn:hover { border-color:var(--indigo); color:var(--indigo); }

        .tab-row { display:flex; gap:8px; margin-bottom:18px; overflow-x:auto; padding-bottom:4px; }
        .tab-row::-webkit-scrollbar { display:none; }
        .ctab { padding:9px 20px; border-radius:10px; font-size:12.5px; font-weight:700; border:1.5px solid var(--border); background:var(--white); color:var(--muted); cursor:pointer; transition:all .2s; white-space:nowrap; flex-shrink:0; }
        .ctab:hover { border-color:var(--green); color:var(--green); }
        .ctab.active { background:linear-gradient(135deg,#059669,var(--green)); color:#fff; border-color:transparent; box-shadow:0 4px 14px rgba(16,185,129,.3); }

        .list-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .list-count { font-size:13px; font-weight:700; color:var(--slate); }
        .list-count span { color:var(--green); }
        .sort-select { background:var(--white); border:1.5px solid var(--border); color:var(--slate); padding:7px 12px; border-radius:9px; font-family:'Sora',sans-serif; font-size:12px; font-weight:600; outline:none; cursor:pointer; }
        
        .view-toggle { display:flex; background:var(--white); border:1.5px solid var(--border); border-radius:10px; overflow:hidden; }
        .vt-btn { width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-size:15px; cursor:pointer; transition:all .2s; color:var(--muted); }
        .vt-btn.active { background:var(--ink); color:#fff; }

        .prod-table { background:var(--white); border-radius:18px; box-shadow:var(--shadow); border:1px solid var(--border); overflow:hidden; }
        .table-head { display:grid; grid-template-columns:60px 1fr 120px 100px 100px 120px 160px; gap:12px; align-items:center; padding:13px 20px; background:var(--faint); border-bottom:1px solid var(--border); }
        .th { font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.8px; color:var(--muted); }
        .th.right { text-align:right; }
        .th.center { text-align:center; }

        .prod-row { display:grid; grid-template-columns:60px 1fr 120px 100px 100px 120px 160px; gap:12px; align-items:center; padding:14px 20px; border-bottom:1px solid var(--faint); transition:all .2s; cursor:pointer; animation:fadeUp .35s ease both; }
        .prod-row:last-child { border-bottom:none; }
        .prod-row:hover { background:var(--faint); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .prod-img-wrap { width:52px; height:52px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:26px; flex-shrink:0; border:1.5px solid var(--border); overflow:hidden; }
        .prod-name { font-size:13.5px; font-weight:700; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:250px; }
        .prod-hsn { font-size:11px; color:var(--muted); font-weight:500; font-family:'JetBrains Mono',monospace; margin-top:2px; }
        .prod-tags { display:flex; gap:5px; margin-top:4px; flex-wrap:wrap; }
        .ptag { font-size:9.5px; font-weight:700; padding:2px 7px; border-radius:5px; text-transform:uppercase; }
        .ptag.product { background:rgba(79,70,229,.1); color:var(--indigo); }
        .ptag.service { background:rgba(14,165,233,.1); color:var(--teal); }
        .ptag.gst { background:rgba(16,185,129,.1); color:var(--green); }

        .price-cell { font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--ink); }
        .price-gst { font-size:10px; color:var(--muted); font-weight:500; margin-top:2px; }

        .stock-val { font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; }
        .stock-val.ok { color:var(--green); }
        .stock-val.low { color:var(--amber); }
        .stock-val.out { color:var(--red); }
        .stock-bar { height:4px; border-radius:4px; background:var(--border); margin-top:5px; overflow:hidden; }
        .stock-fill { height:100%; border-radius:4px; transition:width .5s ease; }
        .fill-ok { background:var(--green); }
        .fill-low { background:var(--amber); }
        .fill-out { background:var(--red); }

        .value-cell { font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:var(--indigo); }
        
        .status-badge { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700; }
        .status-active { background:rgba(16,185,129,.1); color:var(--green); }
        .status-low { background:rgba(245,158,11,.1); color:var(--amber); }
        .status-out { background:rgba(239,68,68,.1); color:var(--red); }

        .actions-cell { display:flex; gap:6px; justify-content:flex-end; }
        .act-btn { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:14px; cursor:pointer; border:1.5px solid var(--border); background:var(--faint); transition:all .2s; }
        .act-btn:hover { transform:scale(1.1); }
        .act-btn.qr:hover { background:#eff6ff; border-color:#93c5fd; }
        .act-btn.edit:hover { background:#f0fdf4; border-color:#86efac; }
        .act-btn.delete:hover { background:#fff5f5; border-color:#fca5a5; }

        .prod-grid-view { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
        .pgv-card { background:var(--white); border-radius:16px; border:1.5px solid var(--border); overflow:hidden; cursor:pointer; transition:all .25s; animation:fadeUp .35s ease both; }
        .pgv-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-md); border-color:var(--green); }
        .pgv-img { height:120px; display:flex; align-items:center; justify-content:center; font-size:48px; position:relative; border-bottom:1px solid var(--faint); }
        .pgv-status { position:absolute; top:8px; right:8px; font-size:9.5px; font-weight:800; padding:3px 8px; border-radius:6px; }
        .pgv-body { padding:12px; }
        .pgv-name { font-size:13px; font-weight:800; color:var(--ink); margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .pgv-price { font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; color:var(--indigo); }
        .pgv-stock { font-size:11px; color:var(--muted); font-weight:500; margin-top:3px; }
        .pgv-actions { display:flex; gap:6px; margin-top:10px; }
        .pgv-btn { flex:1; padding:7px; border-radius:8px; border:1.5px solid var(--border); background:var(--faint); font-family:'Sora',sans-serif; font-size:10.5px; font-weight:700; color:var(--slate); cursor:pointer; text-align:center; transition:all .2s; }
        .pgv-btn:hover { background:var(--indigo); color:#fff; border-color:var(--indigo); }
        
        .alert-bar { background:linear-gradient(135deg,#7c2d12,#9a3412); border:1px solid rgba(249,115,22,.3); border-radius:14px; padding:14px 18px; display:flex; align-items:center; gap:12px; margin-bottom:16px; animation:fadeUp .3s ease both; }
        .alert-icon { font-size:22px; flex-shrink:0; }
        .alert-text h3 { font-size:13px; font-weight:800; color:#fff; margin:0; }
        .alert-text p { font-size:12px; color:rgba(255,255,255,.6); margin-top:2px; margin-bottom:0;}
        .alert-btn { background:var(--orange); color:#fff; border:none; padding:8px 16px; border-radius:9px; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap; margin-left:auto; transition:all .2s; }
        .alert-btn:hover { filter:brightness(1.1); }

        .modal-overlay { position:fixed; inset:0; background:rgba(11,15,30,.65); backdrop-filter:blur(8px); z-index:100; display:flex; align-items:center; justify-content:center; padding:12px; transition:opacity .25s; }
        .modal { background:var(--white); border-radius:22px; width:100%; max-width:520px; transform:scale(1); transition:transform .3s cubic-bezier(.22,1,.36,1); overflow-y:auto; max-height:95vh; }
        .modal-header { background:linear-gradient(135deg,#0b0f1e,#1c2340); padding:18px 22px; display:flex; align-items:center; justify-content:space-between; }
        .modal-header h3 { font-size:16px; font-weight:800; color:#fff; margin:0;}
        .modal-close { width:32px; height:32px; background:rgba(255,255,255,.1); border:none; border-radius:8px; color:#fff; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; }
        .modal-close:hover { background:rgba(255,255,255,.2); transform:rotate(90deg); }
        .modal-body { padding:18px 22px; }
        .field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
        .field-label { font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.8px; color:var(--muted); margin-bottom:6px; display:block; }
        .field-input { width:100%; padding:10px 14px; border:1.5px solid var(--border); border-radius:11px; font-family:'Sora',sans-serif; font-size:13px; color:#000 !important; outline:none; transition:all .2s; background:var(--faint); }
        .field-input:focus { border-color:var(--green); background:var(--white); box-shadow:0 0 0 3px rgba(16,185,129,.1); color:#000 !important; }
        .modal-footer { padding:0 24px 22px; display:flex; gap:10px; }
        .mf-btn { flex:1; padding:13px; border-radius:12px; font-family:'Sora',sans-serif; font-size:14px; font-weight:800; cursor:pointer; border:none; transition:all .2s; }
        .mf-cancel { background:var(--faint); color:var(--slate); border:1.5px solid var(--border); }
        .mf-save { background:linear-gradient(135deg,var(--green),#059669); color:#fff; box-shadow:0 4px 14px rgba(16,185,129,.35); }
        .mf-save:hover { transform:translateY(-1px); filter:brightness(1.1); }

        .qr-modal { max-width:340px; text-align:center; }
        .qr-box { width:160px; height:160px; background:var(--faint); border:2px solid var(--border); border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:72px; overflow: hidden; }

        .fab { position:fixed; bottom:28px; right:28px; width:56px; height:56px; background:linear-gradient(135deg,var(--green),#059669); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:26px; cursor:pointer; box-shadow:0 8px 28px rgba(16,185,129,.5); transition:all .25s; z-index:40; border:none; color:#fff; }
        .fab:hover { transform:scale(1.08) rotate(10deg); box-shadow:0 12px 36px rgba(16,185,129,.6); }

        @media(max-width:1100px){ .table-head,.prod-row{grid-template-columns:60px 1fr 100px 100px 120px 160px;} .th:nth-child(5),.prod-row>*:nth-child(5){display:none;} }
        @media(max-width:900px){ 
          .kpi-strip{grid-template-columns:repeat(2,1fr);} 
          .search-filter-row { flex-wrap:wrap; }
          .search-wrap { width:100%; order:1; }
          .filter-btn { flex:1; order:2; padding:10px; font-size:12px; }
        }
        @media(max-width:600px){ 
          .table-head { display:none; }
          .prod-row { grid-template-columns:50px 1fr 70px; gap:8px; padding:12px 14px; position:relative; align-items:flex-start; }
          .price-cell, .value-cell, .prod-row>div:nth-child(6) { display:none; }
          .prod-img-wrap { width:44px; height:44px; font-size:20px; }
          .prod-name { font-size:12px; max-width:140px; }
          .prod-hsn { font-size:9px; }
          .stock-val { font-size:11px; }
          .actions-cell { position:absolute; right:10px; bottom:10px; gap:6px; }
          .act-btn { width:28px; height:28px; font-size:12px; }
          .ph-left h1 { font-size:20px; }
          .ph-row { flex-direction:column; gap:12px; align-items:flex-start; }
          .ph-actions { width: 100%; }
          .add-btn { width:100%; justify-content:center; }
          .tab-row { margin-bottom:10px; }
          .ctab { padding:7px 14px; font-size:11px; }
          .modal-header { padding:14px 18px; }
          .modal-close { width:28px; height:28px; font-size:14px; }
          .modal-header h3 { font-size:15px; }
          .field-row { grid-template-columns: 1fr; gap: 10px; }
          .modal-body { padding: 15px; }
          .modal-footer { padding: 0 15px 15px; }
        }
        `}} />

            <div className="inv-main">
                {/* Page Header */}
                <div className="page-header">
                    <div className="ph-row">
                        <div className="ph-left">
                            <h1>⚡ Smart <span>Inventory</span></h1>
                            <p>Manage Products & Stock</p>
                        </div>
                        <div className="ph-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button 
                                className="add-btn" 
                                style={{ 
                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
                                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }} 
                                onClick={downloadPdf}
                            >
                                📥 PDF Catalog
                            </button>
                            <button className="add-btn" onClick={openAddModal}>＋ Add Product</button>
                        </div>
                    </div>
                    <div className="kpi-strip">
                        <div className="kpi-card" onClick={() => setActiveTab("all")}>
                            <div className="kpi-icon" style={{ background: "rgba(79,70,229,.2)" }}>📦</div>
                            <div><div className="kpi-val">{totalItems}</div><div className="kpi-lbl">Total Items</div></div>
                        </div>
                        <div className="kpi-card" onClick={() => setActiveTab("low")}>
                            <div className="kpi-icon" style={{ background: "rgba(239,68,68,.2)" }}>⚠️</div>
                            <div><div className="kpi-val" style={{ color: "#fb7185" }}>{lowStockCount}</div><div className="kpi-lbl">Low Stock</div></div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon" style={{ background: "rgba(16,185,129,.2)" }}>💰</div>
                            <div><div className="kpi-val" style={{ color: "#34d399" }}>₹{(stockValue / 100000).toFixed(2)} Lac</div><div className="kpi-lbl">Stock Value</div></div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon" style={{ background: "rgba(245,158,11,.2)" }}>📈</div>
                            <div><div className="kpi-val" style={{ color: "#fbbf24" }}>{totalItems > 0 ? (totalItems * 18) : 0}</div><div className="kpi-lbl">Units Sold</div></div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="content">
                    {/* Low stock alert bar removed as requested. User can use the "Low Stock" button at the top instead. */}

                    {/* Search + Filter */}
                    <div className="search-filter-row">
                        <div className="search-wrap">
                            <span style={{ fontSize: "16px", color: "#c0c8da" }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search product name, HSN code…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="search-icon-btn">🔍</div>
                        </div>
                        <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
                            {showFilters ? "✕ Close Filter" : "⚙️ Filter"}
                        </button>
                        <label className="filter-btn" style={{ cursor: 'pointer' }}>
                            <input type="file" accept=".csv, .xlsx" style={{ display: 'none' }} onChange={handleImport} />
                            📥 Import
                        </label>
                    </div>

                    {showFilters && (
                        <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '14px', marginBottom: '18px', display: 'flex', gap: '14px', animation: 'fadeUp 0.3s ease' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Category</label>
                                <select className="sort-select" style={{ width: '100%' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                    <option value="all">All Categories</option>
                                    <option value="PRODUCT">Products Only</option>
                                    <option value="SERVICE">Services Only</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>GST Rate</label>
                                <select className="sort-select" style={{ width: '100%' }} value={filterGst} onChange={(e) => setFilterGst(e.target.value)}>
                                    <option value="all">All Rates</option>
                                    <option value="0">0% (Exempt)</option>
                                    <option value="5">5% GST</option>
                                    <option value="12">12% GST</option>
                                    <option value="18">18% GST</option>
                                    <option value="28">28% GST</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button className="ctab" style={{ height: '38px', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => { setFilterCategory("all"); setFilterGst("all"); setSearchTerm(""); }}>Reset</button>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="tab-row">
                        <div className={`ctab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All Products</div>
                        <div className={`ctab ${activeTab === "product" ? "active" : ""}`} onClick={() => setActiveTab("product")}>Product</div>
                        <div className={`ctab ${activeTab === "service" ? "active" : ""}`} onClick={() => setActiveTab("service")}>Service</div>
                        <div className={`ctab ${activeTab === "low" ? "active" : ""}`} onClick={() => setActiveTab("low")}>⚠ Low Stock</div>
                        <div className={`ctab ${activeTab === "out" ? "active" : ""}`} onClick={() => setActiveTab("out")}>❌ Out of Stock</div>
                    </div>

                    {/* List header */}
                    <div className="list-header">
                        <div className="list-count">Stock List (<span>{filteredProducts.length}</span> items)</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="default">Sort: Default</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="name_az">Name: A-Z</option>
                            </select>
                            <div className="view-toggle">
                                <div className={`vt-btn ${currentView === "list" ? "active" : ""}`} onClick={() => setCurrentView("list")}>☰</div>
                                <div className={`vt-btn ${currentView === "grid" ? "active" : ""}`} onClick={() => setCurrentView("grid")}>⊞</div>
                            </div>
                        </div>
                    </div>

                    {/* Products Container */}
                    <div>
                        {filteredProducts.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 20px" }}>
                                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📦</div>
                                <p style={{ color: "var(--muted)", fontSize: "14px", fontWeight: 500 }}>Koi product nahi mila. Search change karo.</p>
                            </div>
                        ) : currentView === "list" ? (
                            <div className="prod-table">
                                <div className="table-head">
                                    <div className="th">Image</div>
                                    <div className="th">Product</div>
                                    <div className="th">Price</div>
                                    <div className="th">Stock</div>
                                    <div className="th">Value</div>
                                    <div className="th center">Status</div>
                                    <div className="th right">Actions</div>
                                </div>
                                {filteredProducts.map((p: any, i: number) => {
                                    const st = getStatus(parseInt(p.stock_quantity) || 0);
                                    const pct = getStockPct(parseInt(p.stock_quantity) || 0);
                                    return (
                                        <div className="prod-row" key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
                                            <div className="prod-img-wrap" style={{ background: getRandomBg(p.id) }}>
                                                {p.image_url ? <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getProductEmoji(p)}
                                            </div>
                                            <div className="prod-info-cell">
                                                <div className="prod-name">{p.name}</div>
                                                <div className="prod-hsn">HSN: {p.hsn_code || "NA"}</div>
                                                <div className="prod-tags">
                                                    <span className={`ptag ${p.type?.toLowerCase() === 'service' ? 'service' : 'product'}`}>{p.type || "PRODUCT"}</span>
                                                    <span className="ptag gst">GST {p.gst_rate || 0}%</span>
                                                    {getExpiryStatus(p) && (
                                                        <span className="ptag" style={{ background: 'rgba(239,68,68,.1)', color: getExpiryStatus(p)?.color }}>⚠ {getExpiryStatus(p)?.text}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="price-cell">
                                                ₹{parseFloat(p.price || 0).toLocaleString("en-IN")}
                                                <div className="price-gst">Excl. GST</div>
                                            </div>
                                            <div className="stock-cell">
                                                <div className={`stock-val ${st.sc === "ok" ? "ok" : st.sc === "low" ? "low" : "out"}`}>
                                                    {(parseInt(p.stock_quantity) || 0) <= 0 ? "Out" : `${p.stock_quantity} ${p.unit?.toLowerCase() || 'pcs'}`}
                                                </div>
                                                <div className="stock-bar">
                                                    <div className={`stock-fill ${st.sc === "ok" ? "fill-ok" : st.sc === "low" ? "fill-low" : "fill-out"}`} style={{ width: `${pct}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="value-cell">₹{((parseFloat(p.price || 0)) * (parseInt(p.stock_quantity) || 0)).toLocaleString("en-IN")}</div>
                                            <div style={{ textAlign: "center" }}><span className={`status-badge ${st.cls}`}>{st.label}</span></div>
                                            <div className="actions-cell">
                                                <div className="act-btn qr" onClick={(e) => openQR(e, p)} title="QR Code">📱</div>
                                                <div className="act-btn edit" onClick={() => handleEdit(p)} title="Edit">✏️</div>
                                                <div className="act-btn delete" onClick={(e) => handleDelete(e, p.id, p.name)} title="Delete">🗑</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="prod-grid-view">
                                {filteredProducts.map((p: any, i: number) => {
                                    const st = getStatus(parseInt(p.stock_quantity) || 0);
                                    const stock = parseInt(p.stock_quantity) || 0;
                                    return (
                                        <div className="pgv-card" key={p.id} style={{ animationDelay: `${i * 0.04}s` }}>
                                            <div className="pgv-img" style={{ background: getRandomBg(p.id) }}>
                                                <span className={`pgv-status status-badge ${st.cls}`}>{stock <= 0 ? "Out" : stock <= 10 ? "Low" : "Active"}</span>
                                                {p.image_url ? <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getProductEmoji(p)}
                                            </div>
                                            <div className="pgv-body">
                                                <div className="pgv-name" title={p.name}>{p.name}</div>
                                                <div className="pgv-price">₹{parseFloat(p.price || 0).toLocaleString("en-IN")}</div>
                                                <div className="pgv-stock">{stock <= 0 ? "❌ Out of stock" : `📦 ${stock} left`}</div>
                                                {getExpiryStatus(p) && (
                                                    <div style={{ fontSize: '10px', fontWeight: 700, color: getExpiryStatus(p)?.color, marginTop: '2px' }}>⚠ {getExpiryStatus(p)?.text}</div>
                                                )}
                                                <div className="pgv-actions">
                                                    <div className="pgv-btn" onClick={() => handleEdit(p)}>✏️ Edit</div>
                                                    <div className="pgv-btn" onClick={(e) => openQR(e, p)}>📱 QR</div>
                                                    <div className="pgv-btn" onClick={(e) => handleDelete(e, p.id, p.name)}>🗑</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div style={{ height: "40px" }}></div>
                    </div>
                </div>
            </div>

            {/* FAB */}
            <button className="fab" onClick={openAddModal}>＋</button>

            {/* Add/Edit Product Modal */}
            {showAddModal && (
                <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false) }}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingId ? "✏️ Edit Product" : "＋ Add New Product"}</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {/* Image Upload Component */}
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                                <label style={{ position: "relative", width: "100px", height: "100px", background: "var(--white)", borderRadius: "20px", border: "3px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
                                    {formData.image_url ? (
                                        <>
                                            <img src={formData.image_url} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: "10px", textAlign: "center", padding: "4px 0" }} onClick={(e) => { e.preventDefault(); setFormData({ ...formData, image_url: "" }); }}>Remove</div>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: "24px", color: "var(--muted)" }}>📷</div>
                                            <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Add Photo</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                                </label>
                            </div>

                            <div className="field-row">
                                <div>
                                    <label className="field-label">Product Name *</label>
                                    <input className="field-input" type="text" placeholder="e.g. iPhone 15 Pro" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="field-label">HSN Code</label>
                                    <input className="field-input" type="text" placeholder="e.g. 8517" value={formData.hsn_code} onChange={e => setFormData({ ...formData, hsn_code: e.target.value })} />
                                </div>
                            </div>
                            <div className="field-row">
                                <div>
                                    <label className="field-label">Sale Price (₹) *</label>
                                    <input className="field-input" type="number" placeholder="e.g. 134900" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="field-label">Purchase Price (₹)</label>
                                    <input className="field-input" type="number" placeholder="e.g. 120000" value={formData.purchase_price} onChange={e => setFormData({ ...formData, purchase_price: e.target.value })} />
                                </div>
                            </div>
                            <div className="field-row">
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ flex: '1.5' }}>
                                        <label className="field-label">Stock Quantity *</label>
                                        <input className="field-input" type="number" placeholder="e.g. 50" value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} />
                                    </div>
                                    <div style={{ flex: '1' }}>
                                        <label className="field-label">Unit</label>
                                        <input className="field-input" type="text" list="unitList" placeholder="PCS" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} />
                                        <datalist id="unitList">
                                            <option value="PCS" />
                                            <option value="KG" />
                                            <option value="Gram" />
                                            <option value="Ltr" />
                                            <option value="Mtr" />
                                            <option value="Box" />
                                            <option value="Pk" />
                                        </datalist>
                                    </div>
                                </div>
                                <div>
                                    <label className="field-label">Low Stock Alert</label>
                                    <input className="field-input" type="number" placeholder="e.g. 10" value={formData.alert_quantity} onChange={e => setFormData({ ...formData, alert_quantity: e.target.value })} />
                                </div>
                            </div>
                            <div className="field-row">
                                <div>
                                    <label className="field-label">GST Rate (%)</label>
                                    {!showCustomGst ? (
                                        <select className="field-input" value={formData.gst_rate} onChange={e => {
                                            if (e.target.value === 'custom') {
                                                setShowCustomGst(true);
                                            } else {
                                                setFormData({ ...formData, gst_rate: e.target.value });
                                            }
                                        }}>
                                            <option value="0">0% — Exempt</option>
                                            <option value="5">5% GST</option>
                                            <option value="12">12% GST</option>
                                            <option value="18">18% GST</option>
                                            <option value="28">28% GST</option>
                                            <option value="custom">✍️ Custom %</option>
                                        </select>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                className="field-input"
                                                type="number"
                                                placeholder="e.g. 15"
                                                value={formData.gst_rate}
                                                onChange={e => setFormData({ ...formData, gst_rate: e.target.value })}
                                                autoFocus
                                            />
                                            <button
                                                className="act-btn"
                                                onClick={() => setShowCustomGst(false)}
                                                style={{ border: '1px solid var(--border)', background: 'var(--white)', padding: '0 8px', borderRadius: '8px' }}
                                                title="Choose from list"
                                            >✕</button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="field-label">Category</label>
                                    <select className="field-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="PRODUCT">Product</option>
                                        <option value="SERVICE">Service</option>
                                    </select>
                                </div>
                            </div>
                            <div className="field-row">
                                <div>
                                    <label className="field-label">Expiry Date (Optional)</label>
                                    <input className="field-input" type="date" value={formData.expiry_date || ""} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="field-label">Expiry Alert (Days Before)</label>
                                    <input className="field-input" type="number" placeholder="e.g. 10" value={formData.expiry_alert_days || ""} onChange={e => setFormData({ ...formData, expiry_alert_days: e.target.value })} />
                                </div>
                            </div>
                            <div className="field-group" style={{ marginBottom: "14px" }}>
                                <label className="field-label">Description</label>
                                <textarea className="field-input" rows={2} placeholder="Product description (optional)" style={{ resize: "none" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="mf-btn mf-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="mf-btn mf-save" onClick={saveProduct}>💾 Save Product</button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {showQrModal && selectedProduct && (
                <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setShowQrModal(false) }}>
                    <div className="modal qr-modal">
                        <div className="modal-header">
                            <h3>📱 Product QR Code</h3>
                            <button className="modal-close" onClick={() => setShowQrModal(false)}>✕</button>
                        </div>
                        <div style={{ padding: "24px", textAlign: "center" }}>
                            <div className="qr-box">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${window.location.origin}/dashboard/inventory/${selectedProduct.id}`} alt="QR" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--ink)", marginBottom: "8px" }}>{selectedProduct.name}</div>
                            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", color: "var(--muted)", background: "var(--faint)", padding: "8px 14px", borderRadius: "8px", marginBottom: "16px" }}>{selectedProduct.hsn_code || "PRD-2024-001"}</div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button style={{ flex: 1, padding: "12px", borderRadius: "11px", background: "var(--faint)", border: "1.5px solid var(--border)", fontFamily: "'Sora',sans-serif", fontSize: "13px", fontWeight: 700, cursor: "pointer", color: "var(--slate)" }} onClick={() => setShowQrModal(false)}>Close</button>
                                <button style={{ flex: 1, padding: "12px", borderRadius: "11px", background: "linear-gradient(135deg,var(--indigo),var(--indigo2))", color: "#fff", border: "none", fontFamily: "'Sora',sans-serif", fontSize: "13px", fontWeight: 700, cursor: "pointer" }} onClick={() => { toast.success("QR download ho raha hai…"); setShowQrModal(false) }}>📥 Download</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
