"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { optimizeImage } from '@/lib/utils';

export default function StoreManagerPage() {
    const router = useRouter();
    const { businessProfile, products, updateProduct, fetchBusinessProfile, fetchProducts, saveBusinessProfile } = useStore() as any;
    const [isClient, setIsClient] = useState(false);

    // States for Store Settings
    const [settings, setSettings] = useState([
        { id: 'accept_orders', icon: '🛒', bg: '#eff6ff', name: 'Accept Orders', sub: 'Customers order kar sakte hain', on: true },
        { id: 'wa_enquiry', icon: '💬', bg: '#f0fdf4', name: 'WhatsApp Enquiry', sub: 'Enquiry button show karo', on: true },
        { id: 'online_payment', icon: '💳', bg: '#faf5ff', name: 'Online Payment', sub: 'UPI/Card accept karo', on: false },
        { id: 'reviews', icon: '⭐', bg: '#fffbeb', name: 'Customer Reviews', sub: 'Product reviews allow karo', on: true },
        { id: 'search_visible', icon: '🔍', bg: '#f0f9ff', name: 'Search Visible', sub: 'Google mein store dikhao', on: false },
        { id: 'show_stock', icon: '📦', bg: '#fff5f5', name: 'Show Stock Count', sub: 'Available quantity dikhao', on: true },
    ]);

    const [activeFilter, setActiveFilter] = useState('all');
    const [qrModalOpen, setQrModalOpen] = useState(false);

    // Theme state
    const [activeTheme, setActiveTheme] = useState({ primary: '#4f46e5', secondary: '#7c3aed' });

    // Analytics State
    const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);

    // Analytics State
    const [analytics, setAnalytics] = useState({ views: 0, clicks: 0, enquiries: 0, recentEnquiries: [] });

    useEffect(() => {
        setIsClient(true);
        fetchAnalytics();
        if (!businessProfile.id) fetchBusinessProfile();
        if (!products || products.length === 0) fetchProducts();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/dashboard/analytics/store');
            const data = await res.json();
            if (data && !data.error) {
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
    };

    if (!isClient) {
        return (
            <div style={{ background: '#f0f2fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    :root{
                      --bg:#f0f2fa;
                      --white:#fff;
                      --ink:#0b0f1e;
                    }
                    `
                }} />
                Loading store...
            </div>
        );
    }

    const storeUrl = businessProfile.id ? `billgst.in/s/${businessProfile.id}` : 'Store not ready...';
    const mappedProducts = products || [];

    // Merge actual products
    const displayProducts = mappedProducts.map((p: any) => ({
        ...p,
        emoji: '📦',
        bg: '#f0fdf4',
        status: Number(p.stock_quantity) > 0 ? 'active' : 'out',
        price: `₹${p.price || 0}`,
        stock: Number(p.stock_quantity) || 0,
        image_url: p.image_url || null,
    }));

    const filteredProducts = activeFilter === 'all'
        ? displayProducts
        : displayProducts.filter((p: any) => p.status === activeFilter);

    const toggleSetting = (index: number) => {
        const newSettings = [...settings];
        newSettings[index].on = !newSettings[index].on;
        setSettings(newSettings);
        toast.success(`${newSettings[index].name} ${newSettings[index].on ? 'enabled' : 'disabled'}`);
    };

    const copyUrl = () => {
        navigator.clipboard?.writeText('https://' + storeUrl).catch(() => { });
        toast.success('🔗 Store link copy ho gaya!');
    };

    const handleThemeChange = (primary: string, secondary: string) => {
        setActiveTheme({ primary, secondary });
        toast.success('Theme selected! Click Save to apply.', { icon: '🎨' });
    };

    const handleFileUpload = async (e: any, type: 'banner' | 'logo') => {
        const file = e.target.files[0];
        if (file) {
            try {
                const optimizedImage = await optimizeImage(file, type === 'banner' ? 1200 : 400, type === 'banner' ? 400 : 400, 0.8);
                if (type === 'banner') {
                    await saveBusinessProfile({ ...businessProfile, store_banner: optimizedImage });
                } else {
                    await saveBusinessProfile({ ...businessProfile, logo: optimizedImage });
                }
                toast.success(`${type === 'banner' ? 'Banner' : 'Logo'} update ho gaya!`, { icon: '✅' });
            } catch (error: any) {
                console.error('Failed to optimize image:', error);
                toast.error(error.message || 'Upload fail ho gaya!');
            }
        }
    };

    const handleEmailShare = () => {
        const subject = encodeURIComponent("Visit our Online Store!");
        const body = encodeURIComponent(`Hello,\n\nCheck out our amazing products at: https://${storeUrl}\n\nThank you!`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    const openEnquiry = (enq: any) => {
        setSelectedEnquiry(enq);
        setEnquiryModalOpen(true);
    };

    const handleProductAction = async (e: any, p: any) => {
        e.stopPropagation();
        if (p.status === 'out') {
            await updateProduct(p.id, { stock_quantity: 10 });
            toast.success(`📦 ${p.name} restocked to 10 units!`);
        } else {
            toast.success(`👁 ${p.name} hidden from store!`);
        }
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
            :root{
              --bg:#f0f2fa;
              --white:#fff;
              --ink:#0b0f1e;
              --slate:#3d4766;
              --muted:#7c88a6;
              --border:#e2e6f3;
              --faint:#f5f7fd;
              --indigo:${activeTheme.primary};
              --indigo2:${activeTheme.secondary};
              --teal:#0ea5e9;
              --green:#10b981;
              --red:#ef4444;
              --amber:#f59e0b;
              --shadow:0 2px 16px rgba(11,15,30,.07),0 1px 4px rgba(11,15,30,.04);
              --shadow-md:0 8px 32px rgba(11,15,30,.12),0 2px 8px rgba(11,15,30,.06);
            }
            .store-page { font-family: 'Sora', sans-serif; background: var(--bg); color: var(--ink); padding-bottom: 40px; overflow-x: hidden; }
            .store-page * { box-sizing: border-box; }
            
            /* Top bar */
            .store-topbar{
              background:linear-gradient(135deg,#0b0f1e 0%,#1c2340 60%,#312e81 100%);
              padding:14px 24px;
              display:flex;align-items:center;justify-content:space-between;
              position:sticky;top:0;z-index:50;
              box-shadow:0 4px 24px rgba(11,15,30,.35);
            }
            .topbar-left{display:flex;align-items:center;gap:12px}
            .sback-btn{width:36px;height:36px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;cursor:pointer;transition:all .2s;text-decoration:none}
            .sback-btn:hover{background:rgba(255,255,255,.18)}
            .topbar-title h2{font-size:17px;font-weight:800;color:#fff; margin:0}
            .topbar-title p{font-size:10.5px;color:rgba(255,255,255,.4);font-weight:400; margin:0}
            .topbar-right{display:flex;gap:8px}
            .tb-btn{padding:8px 16px;border-radius:10px;border:none;font-family:'Sora',sans-serif;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .2s}
            .tb-btn.preview{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:#fff}
            .tb-btn.preview:hover{background:rgba(255,255,255,.2)}
            .tb-btn.publish{background:linear-gradient(135deg,var(--green),#059669);color:#fff;box-shadow:0 4px 14px rgba(16,185,129,.35)}
            .tb-btn.publish:hover{transform:translateY(-1px);filter:brightness(1.1)}
            
            @media(max-width: 600px) {
              .store-topbar { padding: 10px; }
              .topbar-title h2 { font-size: 14px; }
              .topbar-title p { display: none; }
              .tb-btn { padding: 7px 10px; font-size: 11px; gap: 4px; }
              .tb-btn.preview { font-size: 0; padding: 8px; }
              .tb-btn.preview::before { content: '👁'; font-size: 14px; }
              .tb-btn.publish { font-size: 0; padding: 8px; }
              .tb-btn.publish::before { content: '🚀'; font-size: 14px; }
            }
            
            /* Page layout */
            .spage{display:grid;grid-template-columns:1fr 360px;gap:20px;padding:22px 24px;max-width:1300px;margin:0 auto;width:100%;box-sizing:border-box;overflow:hidden;}
            @media(max-width:900px){.spage{display:flex;flex-direction:column;padding:16px;}}
            
            /* Cards */
            .scard{background:var(--white);border-radius:18px;padding:20px;box-shadow:var(--shadow);border:1px solid var(--border);margin-bottom:16px;animation:sfadeUp .4s ease both; overflow: hidden;}
            @keyframes sfadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
            .scard-title{font-size:14px;font-weight:800;color:var(--ink);margin-bottom:14px;display:flex;align-items:center;gap:8px}
            .scard-title span{font-size:18px}
            
            /* Store Hero */
            .store-hero{
              background:linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4338ca 100%);
              border-radius:18px;
              padding:0;
              overflow:hidden;
              box-shadow:var(--shadow-md);
              margin-bottom:16px;
              animation:sfadeUp .4s ease both;
              position:relative;
            }
            .hero-banner{
              height:120px;
              background:linear-gradient(135deg,#6d28d9,#4f46e5,#0ea5e9);
              position:relative;
              overflow:hidden;
              cursor:pointer;
            }
            .hero-banner::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,.03) 0px,rgba(255,255,255,.03) 1px,transparent 1px,transparent 40px)}
            .hero-banner-text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px}
            .banner-label{font-size:11px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:1px}
            .banner-cta{background:rgba(255,255,255,.15);border:1.5px dashed rgba(255,255,255,.4);color:#fff;padding:8px 18px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s}
            .banner-cta:hover{background:rgba(255,255,255,.25)}
            
            .hero-body{padding:0 20px 20px;position:relative}
            .logo-wrap{position:relative;display:inline-block;margin-top:-28px;margin-bottom:10px}
            .store-logo{width:60px;height:60px;background:linear-gradient(135deg,var(--amber),#f97316);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;border:3px solid var(--white);box-shadow:0 10px 28px rgba(0,0,0,.3);cursor:pointer}
            .logo-edit{position:absolute;bottom:-4px;right:-4px;width:20px;height:20px;background:var(--indigo);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;cursor:pointer;border:2px solid #fff}
            
            .store-name-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
            @media(max-width: 500px) { .store-name-row { flex-direction: column; gap: 8px; } }
            .store-name{font-size:22px;font-weight:800;color:#fff;letter-spacing:-.4px}
            .store-tagline{font-size:12px;color:rgba(255,255,255,.55);margin-top:3px}
            .store-status{display:flex;align-items:center;gap:6px;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.3);color:#34d399;padding:6px 12px;border-radius:20px;font-size:11.5px;font-weight:700;flex-shrink:0}
            .status-dot{width:7px;height:7px;border-radius:50%;background:#10b981;animation:spulse 2s infinite}
            @keyframes spulse{0%,100%{opacity:1}50%{opacity:.4}}
            
            .store-url-row{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 14px;margin-top:12px; width: 100%; box-sizing: border-box; overflow: hidden;}
            .store-url{font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(255,255,255,.7);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; min-width: 0;}
            .url-copy-btn{background:var(--indigo);color:#fff;border:none;padding:6px 12px;border-radius:7px;font-family:'Sora',sans-serif;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .2s;flex-shrink:0}
            .url-copy-btn:hover{background:var(--indigo2)}
            
            .hero-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}
            .h-stat{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:11px;padding:10px;text-align:center}
            .h-stat-val{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:700;color:#fff}
            .h-stat-lbl{font-size:10px;font-weight:600;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.6px;margin-top:2px}
            
            @media(max-width: 600px) {
              .spage { padding: 10px; overflow-x: hidden; display: block; width: 100%; box-sizing: border-box; }
              .left-col, .right-col { width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box; }
              .scard { padding: 14px; border-radius: 14px; overflow: hidden; width: 100%; box-sizing: border-box; }
              .store-hero { width: 100%; box-sizing: border-box; overflow: hidden; max-width: 100%; }
              .hero-banner { height: 80px; width: 100%; }
              .hero-body { padding: 0 14px 14px; width: 100%; box-sizing: border-box; }
              .store-name { font-size: 16px; word-wrap: break-word; max-width: 100%; }
              .store-name-row { width: 100%; flex-wrap: wrap; }
              .store-url-row { flex-direction: column; align-items: stretch; gap: 8px; padding: 10px; width: 100%; box-sizing: border-box; overflow: hidden; }
              .store-url { width: 100%; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
              .url-copy-btn { width: 100%; padding: 10px; text-align: center; }
              .hero-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
              .hero-stats > div:last-child { grid-column: span 2; }
              .share-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
              .share-btn { padding: 12px 8px; border-radius: 12px; }
              .share-btn .s-icon { font-size: 22px; }
              .share-btn .s-label { font-size: 11px; }
              .ssetting-name { font-size: 12px; }
              .ssetting-sub { font-size: 10px; }
            }
            
            /* Share section */
            .share-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
            .share-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border-radius:13px;border:1.5px solid var(--border);background:var(--faint);cursor:pointer;transition:all .2s; min-width: 0;}
            .share-btn:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);border-color:transparent}
            .share-btn .s-icon{font-size:24px}
            .share-btn .s-label{font-size:11px;font-weight:700;color:var(--slate)}
            .share-btn.whatsapp:hover{background:#f0fdf4;border-color:#86efac}
            .share-btn.copy:hover{background:#eff6ff;border-color:#93c5fd}
            .share-btn.qr:hover{background:#faf5ff;border-color:#c4b5fd}
            .share-btn.email:hover{background:#fff7ed;border-color:#fed7aa}
            
            
            
            /* Products section */
            .prod-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
            .add-prod-btn{background:linear-gradient(135deg,var(--indigo),var(--indigo2));color:#fff;border:none;padding:9px 16px;border-radius:10px;font-family:'Sora',sans-serif;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .2s;box-shadow:0 4px 14px rgba(79,70,229,.3)}
            .add-prod-btn:hover{transform:translateY(-1px);filter:brightness(1.1)}
            
            .sprod-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
            @media(max-width:600px){.sprod-grid{grid-template-columns:1fr}}
            .sprod-card{border:1.5px solid var(--border);border-radius:14px;overflow:hidden;cursor:pointer;transition:all .2s;background:var(--white)}
            .sprod-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-md);border-color:var(--indigo)}
            .sprod-img{height:110px;display:flex;align-items:center;justify-content:center;font-size:42px;position:relative;background: var(--white); border-bottom: 1px solid var(--border); padding: 4px;}
            .sprod-badge{position:absolute;top:8px;left:8px;font-size:9.5px;font-weight:800;padding:3px 8px;border-radius:6px;text-transform:uppercase}
            .sbadge-active{background:rgba(16,185,129,.15);color:var(--green);border:1px solid rgba(16,185,129,.3)}
            .sbadge-out{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.2)}
            .sprod-info{padding:10px 12px 12px}
            .sprod-name{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .sprod-price{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:var(--indigo)}
            .sprod-stock{font-size:11px;color:var(--muted);font-weight:500;margin-top:2px}
            .sprod-actions{display:flex;gap:6px;margin-top:8px}
            .sprod-act-btn{flex:1;padding:6px;border-radius:8px;border:1.5px solid var(--border);background:var(--faint);font-family:'Sora',sans-serif;font-size:10.5px;font-weight:700;color:var(--slate);cursor:pointer;transition:all .2s;text-align:center}
            .sprod-act-btn:hover{background:var(--indigo);color:#fff;border-color:var(--indigo)}
            
            @media(max-width: 480px) {
              .prod-header { flex-direction: column; align-items: flex-start; gap: 10px; }
              .add-prod-btn { width: 100%; justify-content: center; }
              .sprod-card { display: flex; align-items: center; width: 100%; box-sizing: border-box; overflow: hidden; }
              .sprod-img { width: 70px; height: 70px; flex-shrink: 0; font-size: 26px; border-bottom: none; border-right: 1px solid var(--faint); }
              .sprod-info { flex: 1; padding: 10px; min-width: 0; width: 100%; overflow: hidden; }
              .sprod-name { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; width: 100%; }
              .sprod-price { font-size: 13px; }
              .sprod-actions { flex-direction: row; gap: 4px; flex-wrap: wrap; }
              .sprod-act-btn { font-size: 9.5px; padding: 5px; flex: 1; min-width: 60px; white-space: nowrap; }
            }
            
            /* Store settings */
            .ssetting-row{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--faint)}
            .ssetting-row:last-child{border-bottom:none}
            .ssetting-left{display:flex;align-items:center;gap:10px}
            .ssetting-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
            .ssetting-name{font-size:13px;font-weight:700;color:var(--ink)}
            .ssetting-sub{font-size:11px;color:var(--muted);font-weight:400; line-height: 1.2}
            /* Toggle */
            .stoggle{width:44px;height:24px;background:var(--border);border-radius:12px;position:relative;cursor:pointer;transition:all .3s;flex-shrink:0}
            .stoggle.on{background:var(--green)}
            .stoggle::after{content:'';position:absolute;width:18px;height:18px;background:#fff;border-radius:50%;top:3px;left:3px;transition:all .3s;box-shadow:0 1px 4px rgba(0,0,0,.2)}
            .stoggle.on::after{left:23px}
            
            /* Analytics */
            .analytics-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--faint)}
            .analytics-row:last-child{border-bottom:none}
            .an-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
            .an-info{flex:1}
            .an-name{font-size:12.5px;font-weight:700;color:var(--ink); margin-bottom: 2px;}
            .an-val{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:var(--indigo);margin-top:1px}
            .an-trend{font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px}
            
            /* Enquiry list */
            .enquiry-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--faint);cursor:pointer;transition:all .15s}
            .enquiry-item:last-child{border-bottom:none}
            .enquiry-item:hover{background:var(--faint);margin:0 -8px;padding:10px 8px;border-radius:10px}
            .enq-av{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;flex-shrink:0}
            .enq-name{font-size:13px;font-weight:700;color:var(--ink)}
            .enq-msg{font-size:11.5px;color:var(--muted);font-weight:400;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}
            .enq-time{font-size:10.5px;color:var(--muted);font-weight:500;white-space:nowrap;margin-left:auto}
            .enq-new{width:8px;height:8px;border-radius:50%;background:var(--red);flex-shrink:0;margin-top:6px}
            
            /* QR Modal */
            .qrmodal-overlay{position:fixed;inset:0;background:rgba(11,15,30,.65);backdrop-filter:blur(8px);z-index:100;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s}
            .qrmodal-overlay.open{opacity:1;pointer-events:all}
            .qrmodal{background:var(--white);border-radius:22px;padding:28px;width:100%;max-width:360px;transform:scale(.9);transition:transform .3s cubic-bezier(.22,1,.36,1);text-align:center}
            .qrmodal-overlay.open .qrmodal{transform:scale(1)}
            .qrmodal-title{font-size:18px;font-weight:800;color:var(--ink);margin-bottom:6px}
            .qrmodal-sub{font-size:12px;color:var(--muted);margin-bottom:20px}
            .qr-box{width:180px;height:180px;background:var(--faint);border:2px solid var(--border);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:80px; overflow:hidden}
            .qrmodal-url{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);background:var(--faint);padding:8px;border-radius:8px;margin-bottom:16px;word-break:break-all}
            .qrmodal-actions{display:flex;gap:10px}
            .qrmodal-btn{flex:1;padding:12px;border-radius:12px;font-family:'Sora',sans-serif;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s}
            .qrmodal-btn.cancel{background:var(--faint);color:var(--slate);border:1.5px solid var(--border)}
            .qrmodal-btn.dl{background:linear-gradient(135deg,var(--indigo),var(--indigo2));color:#fff;box-shadow:0 4px 14px rgba(79,70,229,.35)}
            
            .schip{padding:6px 14px;border-radius:20px;font-size:11.5px;font-weight:700;border:1.5px solid var(--border);background:var(--white);color:var(--muted);cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0}
            .schip:hover{border-color:var(--indigo);color:var(--indigo)}
            .schip.active-chip{background:var(--ink);color:#fff;border-color:var(--ink)}
            `}} />

            <div className="store-page">
                <div className="store-topbar">
                    <div className="topbar-left">
                        <Link href="/dashboard" className="sback-btn">‹</Link>
                        <div className="topbar-title">
                            <h2>🌐 Your Online Store</h2>
                            <p>Customers ke saath share karo</p>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <button className="tb-btn preview" onClick={() => window.open('/s/' + (businessProfile.id || ''), '_blank')}>👁 Preview</button>
                        <button className="tb-btn publish" onClick={() => toast.success('✅ Store published successfully!')}>🚀 Publish Store</button>
                    </div>
                </div>

                <div className="spage">
                    <div className="left-col">
                        <div className="store-hero">
                            <label className="hero-banner" style={{ display: 'block', backgroundImage: businessProfile.store_banner ? `url(${businessProfile.store_banner})` : '', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} />
                                {!businessProfile.store_banner && (
                                    <div className="hero-banner-text">
                                        <div className="banner-label">Store Banner</div>
                                        <div className="banner-cta">📷 Upload Banner</div>
                                    </div>
                                )}
                            </label>
                            <div className="hero-body">
                                <div className="logo-wrap">
                                    <label className="store-logo" style={{ backgroundImage: businessProfile.logo ? `url(${businessProfile.logo})` : '', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                        <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                        {!businessProfile.logo && '💼'}
                                    </label>
                                    <label className="logo-edit" htmlFor="logo-upload">✏️
                                        <input id="logo-upload" type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                    </label>
                                </div>
                                <div className="store-name-row">
                                    <div>
                                        <div className="store-name">{businessProfile.name || 'Business Store'}</div>
                                        <div className="store-tagline">Quality products at best prices</div>
                                    </div>
                                    <div className="store-status"><div className="status-dot"></div>Live</div>
                                </div>
                                <div className="store-url-row">
                                    <div className="store-url">{storeUrl}</div>
                                    <button className="url-copy-btn" onClick={copyUrl}>📋 Copy Link</button>
                                </div>
                                <div className="hero-stats">
                                    <div className="h-stat"><div className="h-stat-val">{analytics.views.toLocaleString()}</div><div className="h-stat-lbl">Total Views</div></div>
                                    <div className="h-stat"><div className="h-stat-val">{analytics.enquiries.toLocaleString()}</div><div className="h-stat-lbl">Enquiries</div></div>
                                    <div className="h-stat"><div className="h-stat-val">{displayProducts.length}</div><div className="h-stat-lbl">Products</div></div>
                                </div>
                            </div>
                        </div>

                        <div className="scard" style={{ animationDelay: ".1s" }}>
                            <div className="scard-title"><span>📤</span> Share Your Store</div>
                            <div className="share-grid">
                                <div className="share-btn whatsapp" onClick={() => window.open(`https://wa.me/?text=Check out our store: https://${storeUrl}`)}>
                                    <span className="s-icon">💬</span><span className="s-label">WhatsApp</span>
                                </div>
                                <div className="share-btn copy" onClick={copyUrl}>
                                    <span className="s-icon">🔗</span><span className="s-label">Copy Link</span>
                                </div>
                                <div className="share-btn qr" onClick={() => setQrModalOpen(true)}>
                                    <span className="s-icon">📱</span><span className="s-label">QR Code</span>
                                </div>
                                <div className="share-btn email" onClick={handleEmailShare}>
                                    <span className="s-icon">✉️</span><span className="s-label">Email</span>
                                </div>
                            </div>
                        </div>

                        <div className="scard" style={{ animationDelay: ".15s" }}>
                            <div className="prod-header">
                                <div>
                                    <div className="scard-title" style={{ marginBottom: "2px" }}><span>📦</span> Store Products</div>
                                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{displayProducts.length} products listed</div>
                                </div>
                                <Link href="/dashboard/inventory" className="add-prod-btn">＋ Add Product</Link>
                            </div>

                            <div style={{ display: "flex", gap: "8px", marginBottom: "14px", overflowX: "auto", paddingBottom: "4px" }}>
                                <div className={`schip ${activeFilter === 'all' ? 'active-chip' : ''}`} onClick={() => setActiveFilter('all')}>All ({displayProducts.length})</div>
                                <div className={`schip ${activeFilter === 'active' ? 'active-chip' : ''}`} onClick={() => setActiveFilter('active')}>Active</div>
                                <div className={`schip ${activeFilter === 'out' ? 'active-chip' : ''}`} onClick={() => setActiveFilter('out')}>Out of Stock</div>
                                <div className={`schip ${activeFilter === 'hidden' ? 'active-chip' : ''}`} onClick={() => setActiveFilter('hidden')}>Hidden</div>
                            </div>

                            <div className="sprod-grid">
                                {filteredProducts.map((p: any, i: number) => (
                                    <div className="sprod-card" key={i}>
                                        <div className="sprod-img" style={{ background: p.bg }}>
                                            <span className={`sprod-badge ${p.status === 'out' ? 'sbadge-out' : 'sbadge-active'}`} style={{ zIndex: 5 }}>
                                                {p.status === 'out' ? 'Out of Stock' : 'Active'}
                                            </span>
                                            {p.image_url ? (
                                                <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : p.emoji}
                                        </div>
                                        <div className="sprod-info">
                                            <div className="sprod-name">{p.name}</div>
                                            <div className="sprod-price">{p.price}</div>
                                            <div className="sprod-stock">{p.status === 'out' ? '⚠ ' + p.stock + ' in stock' : '📦 ' + p.stock + ' in stock'}</div>
                                            <div className="sprod-actions">
                                                <Link href="/dashboard/inventory" className="sprod-act-btn" onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none' }}>✏️ Edit</Link>
                                                <div className="sprod-act-btn" onClick={(e) => handleProductAction(e, p)}>
                                                    {p.status === 'out' ? '📦 Restock' : '👁 Hide'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ textAlign: "center", marginTop: "14px" }}>
                                <Link href="/dashboard/inventory" style={{ display: 'inline-block', background: "var(--faint)", border: "1.5px solid var(--border)", color: "var(--slate)", padding: "10px 24px", borderRadius: "10px", fontFamily: "'Sora', sans-serif", fontSize: "13px", fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>View All Products →</Link>
                            </div>
                        </div>
                    </div>

                    <div className="right-col">
                        <div className="scard" style={{ animationDelay: ".05s" }}>
                            <div className="scard-title"><span>⚙️</span> Store Settings</div>
                            <div>
                                {settings.map((s: any, idx) => (
                                    <div className="ssetting-row" key={s.id}>
                                        <div className="ssetting-left">
                                            <div className="ssetting-icon" style={{ background: s.bg }}>{s.icon}</div>
                                            <div><div className="ssetting-name">{s.name}</div><div className="ssetting-sub">{s.sub}</div></div>
                                        </div>
                                        <div className={`stoggle ${s.on ? 'on' : ''}`} onClick={() => toggleSetting(idx)}></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="scard" style={{ animationDelay: ".1s" }}>
                            <div className="scard-title"><span>📊</span> Store Analytics</div>
                            <div>
                                {[
                                    { icon: '👁', bg: '#eff6ff', name: 'Total Views', val: analytics.views.toLocaleString(), trend: 'Real-time', up: true },
                                    { icon: '🛒', bg: '#f0fdf4', name: 'Product Clicks', val: analytics.clicks.toLocaleString(), trend: 'Real-time', up: true },
                                    { icon: '📩', bg: '#faf5ff', name: 'Enquiries', val: analytics.enquiries.toLocaleString(), trend: 'Real-time', up: true },
                                    { icon: '⏱', bg: '#fffbeb', name: 'Avg Session', val: 'Active', trend: 'Live', up: true },
                                ].map((a, i) => (
                                    <div className="analytics-row" key={i}>
                                        <div className="an-icon" style={{ background: a.bg }}>{a.icon}</div>
                                        <div className="an-info">
                                            <div className="an-name">{a.name}</div>
                                            <div className="an-val">{a.val}</div>
                                        </div>
                                        <div className="an-trend" style={{ background: a.up ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.1)", color: a.up ? "var(--green)" : "var(--red)" }}>{a.trend}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="scard" style={{ animationDelay: ".15s" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                                <div className="scard-title" style={{ marginBottom: 0 }}><span>📩</span> Recent Enquiries</div>
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--indigo)", cursor: "pointer" }} onClick={() => setEnquiryModalOpen(true)}>View All →</span>
                            </div>
                            <div>
                                {analytics.recentEnquiries.length > 0 ? analytics.recentEnquiries.map((e: any, i: number) => (
                                    <div className="enquiry-item" onClick={() => openEnquiry(e)} key={i}>
                                        <div className="enq-av" style={{ background: e.color }}>{e.name[0]}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="enq-name">{e.name}</div>
                                            <div className="enq-msg">{e.msg}</div>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                                            <div className="enq-time">{e.time}</div>
                                            {e.isNew && <div className="enq-new"></div>}
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: "center", padding: "20px", color: "var(--muted)", fontSize: "12px" }}>Koi enquiry nahi mili.</div>
                                )}
                            </div>
                        </div>

                        <div className="scard" style={{ animationDelay: ".2s" }}>
                            <div className="scard-title"><span>🎨</span> Store Theme</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "8px", marginBottom: "14px", width: "100%", boxSizing: "border-box" }}>
                                <div onClick={() => handleThemeChange('#4f46e5', '#7c3aed')} style={{ height: "38px", borderRadius: "10px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", cursor: "pointer", border: activeTheme.primary === '#4f46e5' ? "2px solid #fff" : "2px solid transparent", outline: activeTheme.primary === '#4f46e5' ? "2px solid var(--indigo)" : "none", position: "relative" }}>
                                    {activeTheme.primary === '#4f46e5' && <div style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)", width: "8px", height: "8px", background: "var(--indigo)", borderRadius: "50%", border: "2px solid #fff" }}></div>}
                                </div>
                                <div onClick={() => handleThemeChange('#0ea5e9', '#06b6d4')} style={{ height: "38px", borderRadius: "10px", background: "linear-gradient(135deg,#0ea5e9,#06b6d4)", cursor: "pointer", border: activeTheme.primary === '#0ea5e9' ? "2px solid #fff" : "2px solid transparent", outline: activeTheme.primary === '#0ea5e9' ? "2px solid var(--indigo)" : "none", position: "relative" }}>
                                    {activeTheme.primary === '#0ea5e9' && <div style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)", width: "8px", height: "8px", background: "var(--indigo)", borderRadius: "50%", border: "2px solid #fff" }}></div>}
                                </div>
                                <div onClick={() => handleThemeChange('#10b981', '#059669')} style={{ height: "38px", borderRadius: "10px", background: "linear-gradient(135deg,#10b981,#059669)", cursor: "pointer", border: activeTheme.primary === '#10b981' ? "2px solid #fff" : "2px solid transparent", outline: activeTheme.primary === '#10b981' ? "2px solid var(--indigo)" : "none", position: "relative" }}>
                                    {activeTheme.primary === '#10b981' && <div style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)", width: "8px", height: "8px", background: "var(--indigo)", borderRadius: "50%", border: "2px solid #fff" }}></div>}
                                </div>
                                <div onClick={() => handleThemeChange('#f59e0b', '#f97316')} style={{ height: "38px", borderRadius: "10px", background: "linear-gradient(135deg,#f59e0b,#f97316)", cursor: "pointer", border: activeTheme.primary === '#f59e0b' ? "2px solid #fff" : "2px solid transparent", outline: activeTheme.primary === '#f59e0b' ? "2px solid var(--indigo)" : "none", position: "relative" }}>
                                    {activeTheme.primary === '#f59e0b' && <div style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)", width: "8px", height: "8px", background: "var(--indigo)", borderRadius: "50%", border: "2px solid #fff" }}></div>}
                                </div>
                            </div>
                            <button style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg,var(--indigo),var(--indigo2))", color: "#fff", border: "none", borderRadius: "11px", fontFamily: "'Sora', sans-serif", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(79,70,229,.3)", transition: "all .2s" }} onClick={() => toast.success('Theme saved successfully! Store Updated.', { icon: '✅' })}>💾 Save Theme</button>
                        </div>
                    </div>
                </div>

                <div className={`qrmodal-overlay ${qrModalOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setQrModalOpen(false) }}>
                    <div className="qrmodal">
                        <div className="qrmodal-title">📱 Store QR Code</div>
                        <div className="qrmodal-sub">Customers isko scan karke directly aapki store visit kar sakte hain</div>
                        <div className="qr-box">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://${storeUrl}`} alt="Store QR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="qrmodal-url">{storeUrl}</div>
                        <div className="qrmodal-actions">
                            <button className="qrmodal-btn cancel" onClick={() => setQrModalOpen(false)}>Close</button>
                            <button className="qrmodal-btn dl" onClick={() => { toast.success('QR Code download ho raha hai…'); setQrModalOpen(false); }}>📥 Download QR</button>
                        </div>
                    </div>
                </div>

                {/* Enquiry View Modal */}
                <div className={`qrmodal-overlay ${enquiryModalOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setEnquiryModalOpen(false) }}>
                    <div className="qrmodal" style={{ textAlign: 'left', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                                <div className="qrmodal-title" style={{ marginBottom: 2 }}>{selectedEnquiry?.name || 'Customer'}</div>
                                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>📞 {selectedEnquiry?.phone || 'N/A'}</div>
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--indigo)' }}>{selectedEnquiry?.time} ago</div>
                        </div>

                        <div style={{ background: 'var(--faint)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)', fontSize: '12.5px', color: 'var(--ink)', lineHeight: 1.5 }}>
                            {selectedEnquiry?.msg || 'No message provided.'}
                        </div>

                        <div className="qrmodal-actions">
                            <button className="qrmodal-btn cancel" onClick={() => setEnquiryModalOpen(false)}>Close</button>
                            <button className="qrmodal-btn dl" onClick={() => {
                                window.open(`https://wa.me/91${selectedEnquiry?.phone}?text=${encodeURIComponent(`Hello ${selectedEnquiry?.name}, regarding your store inquiry: "${selectedEnquiry?.msg}"`)}`);
                                setEnquiryModalOpen(false);
                            }}>💬 Reply on WA</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
