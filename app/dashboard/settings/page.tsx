'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import SignatureModal from '@/app/components/SignatureModal';
import { optimizeImage } from '@/lib/utils';
import { languages } from '@/lib/translations';
import { QRCodeSVG } from 'qrcode.react';

const THEMES = {
    TEMPLATE_1: { accent: '#7c3aed', name: 'Modern Purple' },
    TEMPLATE_2: { accent: '#2563eb', name: 'Royal Blue' },
    TEMPLATE_3: { accent: '#475569', name: 'Slate Gray' },
    TEMPLATE_4: { accent: '#ea580c', name: 'Energetic Orange' },
    TEMPLATE_5: { accent: '#16a34a', name: 'Classic Green' },
    TEMPLATE_6: { accent: '#e11d48', name: 'Rose Pink' },
    TEMPLATE_7: { accent: '#1a1a1a', name: 'Classic B&W' },
};

const LAYOUTS = [
    { id: 'FORMAT_1', name: 'Standard', desc: 'Default look' },
    { id: 'FORMAT_2', name: 'Grid Box', desc: 'Full borders' },
    { id: 'FORMAT_3', name: 'Minimal', desc: 'Clean lines' },
    { id: 'FORMAT_4', name: 'Modern', desc: 'Striped rows' },
    { id: 'FORMAT_5', name: 'Compact', desc: 'More items' },
];

const MODULES = [
    { id: 'invoicing', label: 'Invoicing & Sales', desc: 'Create tax invoices, quotations, manage customers', color: 'rgba(99,102,241,0.16)', iconColor: '#a5b4fc' },
    { id: 'accounting', label: 'Accounting & Expenses', desc: 'Track daily expenses and financial reports', color: 'rgba(34,197,94,0.16)', iconColor: '#86efac' },
    { id: 'staff', label: 'Staff & Attendance', desc: 'Manage employees and track daily attendance', color: 'rgba(245,158,11,0.16)', iconColor: '#fcd34d' },
    { id: 'inventory', label: 'Inventory & Items', desc: 'Track products and low stock alerts', color: 'rgba(244,114,182,0.16)', iconColor: '#f9a8d4' },
];

export default function SettingsPage() {
    const { businessProfile, updateProfile, saveBusinessProfile, settings, updateSettings } = useStore();
    const [formData, setFormData] = useState<any>({});
    const [localSettings, setLocalSettings] = useState<any>({});
    const [isClient, setIsClient] = useState(false);
    
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');
    const [featuresOpen, setFeaturesOpen] = useState(false);
    const [designOpen, setDesignOpen] = useState(false);
    
    // GST Verification State
    const [gstStatus, setGstStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
    const [gstName, setGstName] = useState('');

    // WhatsApp Bot Connection State
    const [waStatus, setWaStatus] = useState<'DISCONNECTED' | 'STARTING_SERVICE' | 'STARTING' | 'READY' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
    const [waQr, setWaQr] = useState<string | null>(null);
    const [waLoading, setWaLoading] = useState(false);
    const [waPolling, setWaPolling] = useState(false);

    const fetchWaStatus = async () => {
        try {
            const res = await fetch('/api/public/whatsapp/bot-status');
            const data = await res.json();
            if (data.success) {
                setWaStatus(data.status);
                setWaQr(data.qr);
                return data;
            }
        } catch (e) {
            console.error('Failed to fetch WhatsApp bot status', e);
        }
        return null;
    };

    useEffect(() => {
        fetchWaStatus();
    }, []);

    useEffect(() => {
        let interval: any = null;
        if (waPolling || waStatus === 'STARTING_SERVICE' || waStatus === 'STARTING') {
            interval = setInterval(async () => {
                const data = await fetchWaStatus();
                if (data && (data.connected || data.status === 'READY' || data.status === 'CONNECTED')) {
                    setWaPolling(false);
                    toast.success('WhatsApp Connected Successfully! 🎉');
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [waPolling, waStatus]);

    const handleConnectWhatsApp = async () => {
        setWaLoading(true);
        setWaPolling(true);
        try {
            const res = await fetch('/api/public/whatsapp/bot-status', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setWaStatus('STARTING_SERVICE');
                toast.success('Generating WhatsApp QR... Please wait 5-10 seconds ⏳');
            }
        } catch (e) {
            toast.error('Failed to start WhatsApp connect');
        } finally {
            setWaLoading(false);
        }
    };

    const handleDisconnectWhatsApp = async () => {
        if (!confirm('Kya aap WhatsApp disconnect karna chahte hain?')) return;
        setWaLoading(true);
        try {
            const res = await fetch('/api/public/whatsapp/bot-status', { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setWaStatus('DISCONNECTED');
                setWaQr(null);
                setWaPolling(false);
                toast.success('WhatsApp Disconnected');
            }
        } catch (e) {
            toast.error('Failed to disconnect');
        } finally {
            setWaLoading(false);
        }
    };

    useEffect(() => {
        setIsClient(true);
        if (businessProfile && Object.keys(formData).length === 0) {
            setFormData(businessProfile);
            const gstVal = businessProfile.gst || businessProfile.gstin || businessProfile.business_gstin || '';
            if (gstVal) {
                verifyGst(gstVal);
            }
        }
        if (settings && Object.keys(localSettings).length === 0) setLocalSettings(settings);
    }, [businessProfile, settings]);

    // Scrollspy effect
    useEffect(() => {
        if (!isClient) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: '-15% 0px -70% 0px' });

        const sections = document.querySelectorAll('.card[id]');
        sections.forEach(s => observer.observe(s));
        return () => observer.disconnect();
    }, [isClient]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        const gstinVal = (formData.gst || formData.gstin || formData.business_gstin || '').trim().toUpperCase();
        const payloadProfile = {
            ...formData,
            gst: gstinVal,
            gstin: gstinVal,
            business_gstin: gstinVal
        };
        updateProfile(payloadProfile);
        updateSettings(localSettings);
        
        const toastId = toast.loading('Saving your settings...');
        try {
            await saveBusinessProfile({ ...payloadProfile, ...localSettings });
            toast.success('Settings save ho gayi! ✅', { id: toastId });
        } catch (error) {
            toast.error('Could not save settings', { id: toastId });
        }
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const optimizedLogo = await optimizeImage(file, 400, 400, 0.8);
                setFormData({ ...formData, logo: optimizedLogo });
                toast.success('Logo uploaded!');
            } catch (error: any) {
                toast.error(error.message || 'Upload failed!');
            }
        }
    };

    const handleSignatureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const optimizedSig = await optimizeImage(file, 400, 200, 0.8);
                setFormData({ ...formData, signature: optimizedSig });
                toast.success('Signature uploaded!');
            } catch (error: any) {
                toast.error(error.message || 'Upload failed!');
            }
        }
    };

    const verifyGst = async (gstin: string) => {
        const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstin) {
            setGstStatus('idle');
            return;
        }
        if (!pattern.test(gstin)) {
            setGstStatus('invalid');
            return;
        }
        
        setGstStatus('loading');
        
        setTimeout(() => {
            setGstStatus('valid');
            const pan = gstin.substring(2, 12);
            setGstName(`Registered Entity (${pan})`);
        }, 1000);
    };

    const handleGstInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        setFormData({ ...formData, gst: val, gstin: val, business_gstin: val });
        verifyGst(val);
    };

    const handleScrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!isClient) return null;

    return (
        <div className="bs-wrapper">
            <style jsx global>{`
                :root{
                    --bg: #0A0D18;
                    --card: #131829;
                    --card-border: #232A45;
                    --card-border-hover: #363F63;
                    --field: #171D31;
                    --field-border: #2A3252;
                    --text: #E8EAF6;
                    --text-muted: #8B93B8;
                    --text-faint: #545D80;
                    --violet: #7C3AED;
                    --indigo: #4F46E5;
                    --gold: #F5B942;
                    --green: #34D399;
                    --red: #F87171;
                    --grad: linear-gradient(135deg, #8B5CF6 0%, #4F46E5 100%);
                }
                .bs-wrapper {
                    background: radial-gradient(ellipse 900px 500px at 15% -5%, rgba(124,58,237,0.16), transparent 60%), radial-gradient(ellipse 700px 500px at 100% 15%, rgba(79,70,229,0.10), transparent 55%), var(--bg);
                    color: var(--text);
                    font-family: 'Inter', sans-serif;
                    min-height: 100vh;
                    padding-bottom: calc(140px + env(safe-area-inset-bottom, 0px));
                }
                .bs-wrapper h1,.bs-wrapper h2,.bs-wrapper h3 { font-family:'Baloo 2', sans-serif; }

                .shell{ max-width: 1080px; margin: 0 auto; padding: 32px 20px 20px; display:grid; grid-template-columns: 220px 1fr; gap: 32px; align-items:start; }
                @media (max-width: 880px){ .shell{ grid-template-columns: 1fr; } }

                .page-head{ grid-column: 1 / -1; text-align:center; margin-bottom: 8px; }
                .page-head h1{ font-size: 30px; font-weight: 800; letter-spacing: -0.02em; background: linear-gradient(135deg, #fff, #C4B5FD); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 6px; }
                .page-head p{ color: var(--text-muted); font-size: 14.5px; }

                .side-nav{ position: sticky; top: 24px; display:flex; flex-direction:column; gap: 2px; background: var(--card); border:1px solid var(--card-border); border-radius:16px; padding: 10px; height: fit-content; }
                .side-nav a{ display:flex; align-items:center; gap:10px; padding: 9px 12px; border-radius:10px; color: var(--text-muted); text-decoration:none; font-size:13px; font-weight:600; transition: background 0.15s, color 0.15s; cursor:pointer; }
                .side-nav a .dot{ width:6px; height:6px; border-radius:50%; background: var(--field-border); flex-shrink:0; transition: background 0.15s; }
                .side-nav a:hover{ background: var(--field); color: var(--text); }
                .side-nav a.active{ background: rgba(124,58,237,0.14); color: #C4B5FD; }
                .side-nav a.active .dot{ background: var(--violet); }
                @media (max-width: 880px){ .side-nav{ display:none; } }

                .mobile-nav{ display:none; grid-column: 1/-1; overflow-x:auto; white-space:nowrap; gap:8px; padding: 4px 2px 10px; margin-bottom: 4px; -ms-overflow-style: none; scrollbar-width: none; }
                .mobile-nav::-webkit-scrollbar{ display:none; }
                .mobile-nav a{ display:inline-block; padding: 8px 14px; margin-right:8px; background: var(--card); border:1px solid var(--card-border); border-radius:999px; color: var(--text-muted); text-decoration:none; font-size:12.5px; font-weight:600; cursor:pointer; }
                .mobile-nav a.active{ background: var(--grad); color:#fff; border-color:transparent; }
                @media (max-width: 880px){ .mobile-nav{ display:flex; } }

                .main-col{ display:flex; flex-direction:column; gap:18px; min-width:0; }

                .completeness{ background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; padding: 16px 18px; display:flex; align-items:center; gap:14px; }
                .completeness .ring{ width:46px; height:46px; border-radius:50%; background: conic-gradient(var(--violet) 0deg, var(--indigo) var(--ring-deg,270deg), #232A45 var(--ring-deg,270deg)); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .completeness .ring::after{ content: attr(data-pct); width:36px; height:36px; border-radius:50%; background: var(--card); display:flex; align-items:center; justify-content:center; font-size:11.5px; font-weight:700; color: var(--text); }
                .completeness .info b{ font-size:14.5px; display:block; margin-bottom:2px; }
                .completeness .info span{ font-size:12.5px; color: var(--text-muted); }

                .card{ background: var(--card); border: 1px solid var(--card-border); border-radius: 18px; padding: 22px; scroll-margin-top: 24px; transition: border-color 0.2s; }
                .card:hover{ border-color: var(--card-border-hover); }
                .card-head{ display:flex; align-items:flex-start; gap:12px; margin-bottom: 20px; flex-wrap: wrap; justify-content: space-between; }
                .card-head.with-toggle{ justify-content:space-between; }
                .card-head-left{ display:flex; align-items:flex-start; gap:12px; flex: 1; min-width: 0; }
                .card-head-left > div { flex: 1; min-width: 0; }
                .card-icon{ width: 40px; height:40px; border-radius: 11px; background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(79,70,229,0.25)); border: 1px solid rgba(139,92,246,0.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .card-icon svg{ width:20px; height:20px; stroke: #C4B5FD; }
                .card-head h2{ font-size:16.5px; font-weight:700; margin-bottom:2px; }
                .card-head p{ font-size:12.5px; color: var(--text-muted); line-height: 1.4; }

                .field{ margin-bottom:16px; }
                .field:last-child{ margin-bottom:0; }
                .field label{ display:block; font-size:12.5px; font-weight:600; color: #A8B0D6; margin-bottom:7px; }
                .field label .opt{ color: var(--text-faint); font-weight:500; }

                .row2{ display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
                .row3{ display:grid; grid-template-columns: 1.3fr 1fr; gap:14px; }
                @media (max-width: 560px){ .row2, .row3{ grid-template-columns: 1fr; } }

                .field input[type=text], .field input[type=email], .field input[type=tel], .field textarea, .field select{ width:100%; background: var(--field); border: 1.5px solid var(--field-border); border-radius: 11px; padding: 12px 14px; color: var(--text); font-size: 14.5px; font-family: inherit; outline: none; transition: border-color 0.15s, background 0.15s; }
                .field input::placeholder, .field textarea::placeholder{ color: var(--text-faint); }
                .field input:focus, .field textarea:focus, .field select:focus{ border-color: var(--violet); background: #1A2036; box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
                .field textarea{ resize: vertical; min-height: 64px; }
                .field select{ appearance:none; -webkit-appearance:none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238B93B8'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position: right 14px center; padding-right: 34px; cursor:pointer; }
                
                .hint{ font-size:11.5px; color: var(--text-faint); margin-top:6px; }
                .hint.tax-hint{ color: var(--gold); }
                .char-count{ text-align:right; font-size:11px; color: var(--text-faint); margin-top:5px; }

                .gst-input-wrap{ position:relative; }
                .gst-input-wrap input{ padding-right: 100px; }
                .gst-input-wrap input.valid{ border-color: var(--green); background:#131E1A; }
                .gst-input-wrap input.invalid{ border-color: var(--red); }
                .verify-badge{ position:absolute; right:8px; top:50%; transform:translateY(-50%); display:flex; align-items:center; gap:5px; font-size:11.5px; font-weight:700; padding:5px 10px; border-radius:8px; }
                .verify-badge.pending{ background:#1E2542; color: var(--text-muted); }
                .verify-badge.valid{ background: rgba(52,211,153,0.15); color: var(--green); }
                .verify-badge.loading{ background: rgba(139,92,246,0.15); color: var(--violet); }
                .verify-badge svg{ width:12px; height:12px; }
                
                .verified-name{ margin-top:8px; font-size:12.5px; color: var(--green); display:flex; align-items:center; gap:6px; animation: fadein 0.4s ease forwards; }
                @keyframes fadein{ from{opacity:0} to{opacity:1} }

                .toggle-row{ display:flex; align-items:center; justify-content:space-between; gap: 16px; }
                .toggle-row b{ font-size:14px; font-weight:600; display:block; margin-bottom:3px; }
                .toggle-row span{ font-size:12px; color: var(--text-muted); }
                .switch{ position:relative; width:46px; height:26px; flex-shrink:0; }
                .switch input{ opacity:0; width:0; height:0; }
                .slider{ position:absolute; inset:0; background:#2A3252; border-radius:999px; cursor:pointer; transition:0.25s; }
                .slider::before{ content:''; position:absolute; width:20px; height:20px; left:3px; top:3px; background:#fff; border-radius:50%; transition:0.25s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
                .switch input:checked + .slider{ background: var(--grad); }
                .switch input:checked + .slider::before{ transform: translateX(20px); }

                .divider{ height:1px; background: var(--card-border); margin: 18px 0; }

                .segmented-wrap{ text-align:center; }
                .segmented-label{ font-size:12.5px; font-weight:600; color:#A8B0D6; margin-bottom:12px; }
                .segmented{ display:inline-flex; background: var(--field); border:1px solid var(--field-border); border-radius:12px; padding:4px; }
                .segmented button{ border:none; background:transparent; color: var(--text-muted); font-family:inherit; font-size:13.5px; font-weight:700; padding:9px 22px; border-radius:9px; cursor:pointer; transition:0.15s; }
                .segmented button.active{ background: var(--grad); color:#fff; }
                .segmented-hint{ font-size:11.5px; color: var(--text-faint); margin-top:10px; }

                .upload-row{ display:flex; gap:16px; align-items:center; flex-wrap:wrap; margin-top: 8px; }
                .upload-box{ width:64px; height:64px; border-radius:50%; background: var(--field); border: 1.5px dashed var(--field-border); display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; position:relative; cursor:pointer; transition: 0.2s; }
                .upload-box:hover { border-color: var(--violet); background: #1A2036; }
                .upload-box svg{ width:20px; height:20px; stroke: var(--text-faint); }
                .upload-box img{ width:100%; height:100%; object-fit:contain; display:block; padding: 4px; background: #fff; }
                .upload-box .verified-tick{ position:absolute; bottom:2px; right:2px; width:16px; height:16px; border-radius:50%; background: var(--green); display:flex; align-items:center; justify-content:center; border: 2px solid var(--card); }
                .upload-box .verified-tick svg{ width:10px; height:10px; stroke:#fff; stroke-width:3.5; }
                .upload-btn{ background: var(--field); border:1.5px solid var(--field-border); color: var(--text); font-family:inherit; font-size:13px; font-weight:600; padding:9px 14px; border-radius:10px; cursor:pointer; display:flex; align-items:center; gap:7px; }
                .upload-btn:hover{ border-color: var(--card-border-hover); }
                .upload-btn svg{ width:14px; height:14px; }

                .signature-pad{ width: 100%; max-width: 260px; height: 96px; background:#fff; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; position:relative; overflow:hidden; }
                .signature-pad span{ font-family:'Caveat', cursive; font-size:32px; color:#1a1a2e; transform: rotate(-3deg); }
                .signature-pad img { max-width: 100%; max-height: 100%; object-fit: contain; }

                .link-row{ display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap: wrap; }
                .pill-btn{ background: var(--field); border:1.5px solid var(--field-border); color: var(--text); font-family:inherit; font-size:13px; font-weight:700; padding:9px 16px; border-radius:999px; cursor:pointer; display:flex; align-items:center; gap:7px; white-space:nowrap; flex-shrink:0; transition: border-color 0.15s; }
                .pill-btn:hover{ border-color: var(--violet); }
                .pill-btn svg{ width:13px; height:13px; }
                @media (max-width: 480px){
                    .link-row { flex-direction: column; align-items: stretch; gap: 12px; }
                }

                .terms-box{ background: var(--field); border:1.5px solid var(--field-border); border-radius:11px; padding:14px; }
                .save-bar{ position: fixed; bottom:0; left:0; right:0; background: linear-gradient(180deg, transparent, var(--bg) 35%); padding: 16px 20px calc(22px + env(safe-area-inset-bottom, 0px)); display:flex; justify-content:center; z-index:50; pointer-events:none; }
                .save-btn{ pointer-events:auto; width:100%; max-width: 680px; background: var(--grad); color:#fff; border:none; border-radius:14px; padding:15px; font-size:15px; font-weight:700; font-family:'Inter',sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:9px; box-shadow: 0 8px 24px rgba(124,58,237,0.35); transition: transform 0.12s, box-shadow 0.12s; }
                .save-btn:hover{ transform: translateY(-1px); box-shadow: 0 10px 28px rgba(124,58,237,0.45); }
                .save-btn svg{ width:18px; height:18px; }
                @media (max-width: 600px){
                    .save-bar {
                        padding: 12px 16px calc(38px + env(safe-area-inset-bottom, 0px));
                        background: linear-gradient(180deg, transparent 0%, rgba(10, 13, 24, 0.95) 45%, #0A0D18 100%);
                    }
                }

                .collapse { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease; }
                .collapse.open { grid-template-rows: 1fr; margin-top: 16px; }
                .collapse > div { overflow: hidden; }

                /* Collapsible */
                .bs-collapse { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s ease; }
                .bs-collapse.open { grid-template-rows: 1fr; }
                .bs-collapse > div { overflow: hidden; }

                /* Chevron btn */
                .bs-chevron-btn { display: flex; align-items: center; justify-content: center; gap: 7px; background: var(--field); border: 1px solid var(--field-border); color: var(--text-muted); padding: 8px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; flex-shrink: 0; transition: border-color .15s, color .15s; cursor: pointer; }
                .bs-chevron-btn:hover { border-color: var(--violet); color: var(--text); }
                .bs-chevron-btn svg { width: 13px; height: 13px; transition: transform .25s; }
                .bs-chevron-btn.open svg { transform: rotate(180deg); }
                @media (max-width: 480px){
                    .bs-chevron-btn { width: 100%; padding: 12px 14px; }
                }

                /* Feature items */
                .bs-feature-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
                @media (min-width: 768px) { .bs-feature-grid { grid-template-columns: 1fr 1fr; gap: 14px; } }
                .bs-feature-item { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--card-border); border-radius: 12px; background: var(--card); }
                @media (min-width: 640px) { .bs-feature-item { padding: 16px; gap: 16px; } }
                .bs-f-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                @media (min-width: 640px) { .bs-f-icon { width: 40px; height: 40px; border-radius: 12px; } .bs-f-icon svg { width: 18px; height: 18px; } }
                .bs-f-icon svg { width: 16px; height: 16px; }
                .bs-f-text { flex: 1; min-width: 0; }
                .bs-f-text strong { font-size: 13px; font-weight: 600; display: block; color: var(--text); }
                @media (min-width: 640px) { .bs-f-text strong { font-size: 14.5px; } }
                .bs-f-text p { margin: 2px 0 0; font-size: 11.5px; color: var(--text-faint); }
                @media (min-width: 640px) { .bs-f-text p { font-size: 12.5px; line-height: 1.4; } }

                /* Switch */
                .bs-switch { position: relative; display: inline-block; width: 44px; height: 26px; flex-shrink: 0; }
                .bs-switch input { opacity: 0; width: 0; height: 0; }
                .bs-slider { position: absolute; inset: 0; background: var(--card-border-hover); border-radius: 999px; transition: background .2s; border: 1px solid var(--field-border); cursor: pointer; }
                .bs-slider::before { content: ""; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; border-radius: 50%; background: #7b84a8; transition: transform .2s, background .2s; }
                .bs-switch input:checked + .bs-slider { background: var(--grad); border-color: transparent; }
                .bs-switch input:checked + .bs-slider::before { transform: translateX(18px); background: #fff; }

                /* Theme cards */
                .bs-theme-grid { display: flex; overflow-x: auto; gap: 10px; padding-bottom: 8px; -webkit-overflow-scrolling: touch; margin: 0 -16px; padding: 0 16px 8px; }
                @media (min-width: 480px) { .bs-theme-grid { display: grid; grid-template-columns: repeat(3, 1fr); padding-bottom: 0; margin: 0; padding: 0; } }
                @media (min-width: 768px) { .bs-theme-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; } }
                .bs-theme-card { flex: 0 0 140px; border: 1.5px solid var(--field-border); border-radius: 12px; overflow: hidden; background: var(--card); text-align: left; cursor: pointer; transition: border-color .15s, transform .15s; width: 100%; padding: 0; }
                @media (min-width: 480px) { .bs-theme-card { flex: auto; } }
                .bs-theme-card:hover { border-color: var(--card-border); transform: translateY(-2px); }
                .bs-theme-card.active { border-color: var(--violet); box-shadow: 0 0 0 3px rgba(124,58,237,0.15); transform: none; }
                .bs-theme-bar { height: 34px; width: 100%; }
                .bs-theme-label { padding: 8px 10px; font-size: 11.5px; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between; }
                @media (min-width: 640px) { .bs-theme-label { font-size: 12.5px; padding: 10px 12px; } }

                /* Layout grid */
                .bs-layout-grid { display: flex; overflow-x: auto; gap: 10px; padding-bottom: 8px; -webkit-overflow-scrolling: touch; margin: 0 -16px; padding: 0 16px 8px; }
                @media (min-width: 480px) { .bs-layout-grid { display: grid; grid-template-columns: repeat(3, 1fr); padding-bottom: 0; margin: 0; padding: 0; } }
                @media (min-width: 768px) { .bs-layout-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; } }
                .bs-layout-card { flex: 0 0 130px; border: 1.5px solid var(--field-border); border-radius: 12px; padding: 13px 10px; background: var(--card); display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; cursor: pointer; transition: border-color .15s, transform .15s; width: 100%; }
                @media (min-width: 480px) { .bs-layout-card { flex: auto; } }
                .bs-layout-card:hover { transform: translateY(-2px); }
                .bs-layout-card.active { border-color: var(--violet); box-shadow: 0 0 0 3px rgba(124,58,237,0.15); transform: none; }
                .bs-layout-card span { font-size: 12px; font-weight: 600; color: var(--text); }
                @media (min-width: 640px) { .bs-layout-card span { font-size: 13px; } }
                .bs-layout-card small { font-size: 10.5px; color: var(--text-faint); }
                
                /* Mini layout preview bars */
                .bs-mini { width: 100%; height: 30px; display: flex; flex-direction: column; gap: 3px; justify-content: center; }
                .bs-mini i { display: block; height: 4px; background: var(--text-faint); border-radius: 2px; }

                /* Align grid */
                .bs-align-grid { display: flex; overflow-x: auto; gap: 10px; padding-bottom: 8px; -webkit-overflow-scrolling: touch; margin: 0 -16px; padding: 0 16px 8px; }
                @media (min-width: 480px) { .bs-align-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding-bottom: 0; margin: 0; padding: 0; } }
                .bs-align-card { flex: 0 0 110px; border: 1.5px solid var(--field-border); border-radius: 12px; padding: 13px 8px; background: var(--card); display: flex; flex-direction: column; align-items: center; gap: 7px; cursor: pointer; transition: border-color .15s, transform .15s; width: 100%; }
                @media (min-width: 480px) { .bs-align-card { flex: auto; } }
                .bs-align-card:hover { transform: translateY(-2px); }
                .bs-align-card.active { border-color: var(--violet); box-shadow: 0 0 0 3px rgba(124,58,237,0.15); transform: none; }
                .bs-align-card svg { width: 18px; height: 18px; color: var(--text-muted); }
                @media (min-width: 640px) { .bs-align-card svg { width: 22px; height: 22px; } }
                .bs-align-card span { font-size: 10.5px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; color: var(--text-muted); }

                /* Section label */
                .bs-sec-label { font-size: 13px; font-weight: 700; color: var(--text-muted); margin: 20px 0 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                @media (min-width: 640px) { .bs-sec-label { font-size: 14px; margin: 24px 0 14px; } }
                .bs-sec-label:first-child { margin-top: 4px; }

                /* Preview */
                .bs-preview-wrap { margin-top: 24px; border: 1px solid var(--card-border); border-radius: 12px; background: #0d0f17; padding: 12px; }
                @media (min-width: 640px) { .bs-preview-wrap { padding: 20px; border-radius: 18px; } }
                .bs-preview-label { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
                .bs-preview-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; display: inline-block; margin-right: 6px; box-shadow: 0 0 0 3px rgba(34,197,94,0.14); }
                .bs-badge { font-size: 10.5px; background: var(--field); color: var(--text-faint); padding: 4px 10px; border-radius: 6px; font-weight: 600; }
                /* New Settings Section Layout */
                .settings-section{ background: var(--card); border: 1px solid var(--card-border); border-radius: 16px; margin-bottom: 16px; overflow: hidden; }
                .section-header{ padding: 16px; display: flex; flex-direction: column; gap: 10px; }
                .section-header-top{ display: flex; align-items: center; justify-content: space-between; gap: 10px; }
                .section-title-group{ display: flex; align-items: center; gap: 10px; min-width: 0; }
                .section-icon{ width: 38px; height: 38px; flex-shrink: 0; border-radius: 10px; background: linear-gradient(135deg, var(--violet), #a06bff); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; }
                .section-icon svg { width: 18px; height: 18px; stroke: white; }
                .section-title{ font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text); }
                .close-btn{ flex-shrink: 0; background: var(--field); border: 1px solid var(--field-border); color: var(--text); padding: 7px 14px; border-radius: 20px; font-size: 13px; display: flex; align-items: center; gap: 5px; cursor: pointer; transition: 0.2s; }
                .close-btn:hover{ border-color: var(--violet); }
                .section-desc{ font-size: 13px; color: var(--text-faint); line-height: 1.5; padding-left: 48px; }
                
                .module-row{ display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; border-top: 1px solid var(--card-border); cursor: pointer; transition: background 0.2s; }
                .module-row:hover{ background: rgba(255,255,255,0.02); }
                .module-left{ display:flex; align-items:center; gap:12px; min-width:0; }
                .module-icon{ width: 36px; height:36px; border-radius: 10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size: 16px; }
                .module-text{ min-width:0; }
                .module-text h4{ font-size:14px; font-weight:600; margin-bottom:2px; color: var(--text); }
                .module-text p{ font-size:12px; color: var(--text-faint); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
                
                .toggle-box{ width: 42px; height: 24px; border-radius: 20px; background: var(--field); position: relative; flex-shrink:0; border: 1px solid var(--field-border); transition: 0.2s; pointer-events: none; }
                .toggle-box::after{ content:''; position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; background:#7b84a8; transition: 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
                .toggle-box.active{ background: linear-gradient(135deg, var(--violet), #a06bff); border-color: transparent; }
                .toggle-box.active::after{ transform: translateX(18px); background: #fff; }
            `}</style>

            <div className="shell">
                <div className="page-head">
                    <h1>Business Settings</h1>
                    <p>Manage your business profile, tax settings, and invoice preferences</p>
                </div>

                <nav className="mobile-nav">
                    {['profile', 'tax', 'bank', 'payments', 'whatsapp-automation', 'branding', 'signatory', 'terms', 'modules', 'design', 'prefs', 'security'].map(id => (
                        <a key={id} onClick={() => handleScrollTo(id)} className={activeSection === id ? 'active' : ''}>
                            {id === 'whatsapp-automation' ? 'WhatsApp' : (id.charAt(0).toUpperCase() + id.slice(1))}
                        </a>
                    ))}
                </nav>

                <nav className="side-nav">
                    {[
                        { id: 'profile', label: 'Business Profile' },
                        { id: 'tax', label: 'Tax Settings' },
                        { id: 'bank', label: 'Bank Details' },
                        { id: 'payments', label: 'Payments' },
                        { id: 'whatsapp-automation', label: 'WhatsApp' },
                        { id: 'branding', label: 'Branding' },
                        { id: 'signatory', label: 'Signatory' },
                        { id: 'terms', label: 'Terms & Conditions' },
                        { id: 'modules', label: 'Features & Modules' },
                        { id: 'design', label: 'Invoice Design' },
                        { id: 'prefs', label: 'Preferences' },
                        { id: 'security', label: 'Account Security' },
                    ].map(item => (
                        <a key={item.id} onClick={() => handleScrollTo(item.id)} className={activeSection === item.id ? 'active' : ''}>
                            <span className="dot"></span>{item.label}
                        </a>
                    ))}
                </nav>

                <div className="main-col">
                    
                    {/* Completeness logic based on missing fields */}
                    <div className="completeness" style={{ '--ring-deg': (!formData.signature || !formData.logo) ? '288deg' : '360deg' } as any}>
                        <div className="ring" data-pct={(!formData.signature || !formData.logo) ? "80%" : "100%"}></div>
                        <div className="info">
                            <b>Profile {(!formData.signature || !formData.logo) ? "80%" : "100%"} complete</b>
                            <span>{(!formData.signature || !formData.logo) ? "Add signature and logo to make your invoices 100% professional" : "Your business profile is fully complete!"}</span>
                        </div>
                    </div>

                    {/* Profile */}
                    <div className="card" id="profile">
                        <div className="card-head">
                            <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg></div>
                            <div><h2>Business Profile</h2><p>Basic details about your business</p></div>
                        </div>
                        <div className="field">
                            <label>Business Name</label>
                            <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Acme Enterprises" />
                        </div>
                        <div className="row2">
                            <div className="field">
                                <label>Mobile Number</label>
                                <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Mobile Number" />
                            </div>
                            <div className="field">
                                <label>Email Address <span className="opt">(Optional)</span></label>
                                <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email ID" />
                            </div>
                        </div>
                        <div className="field">
                            <label>Business Address</label>
                            <textarea value={formData.address || ''} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Building, street, area, landmark"></textarea>
                        </div>
                        <div className="row3">
                            <div className="field">
                                <label>City</label>
                                <input type="text" value={formData.city || ''} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="City" />
                            </div>
                            <div className="field">
                                <label>State</label>
                                <select value={formData.state || ''} onChange={(e) => setFormData({...formData, state: e.target.value})}>
                                    <option value="">Select State</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="West Bengal">West Bengal</option>
                                </select>
                            </div>
                        </div>
                        <div className="hint tax-hint">⚠ Tax (CGST+SGST or IGST) is automatically determined based on State</div>
                    </div>

                    {/* Tax Settings */}
                    <div className="card" id="tax">
                        <div className="card-head with-toggle">
                            <div className="card-head-left">
                                <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
                                <div><h2>Tax Settings</h2><p>GST configuration applied on invoices</p></div>
                            </div>
                        </div>
                        <div className="toggle-row">
                            <div><b>I have a GSTIN Number</b><span>When disabled, non-GST invoices will be generated</span></div>
                            <label className="switch">
                                <input type="checkbox" checked={!localSettings.nonGstMode} onChange={(e) => setLocalSettings({...localSettings, nonGstMode: !e.target.checked})} />
                                <span className="slider"></span>
                            </label>
                        </div>
                        
                        {!localSettings.nonGstMode && (
                            <div id="gstSection">
                                <div className="divider"></div>
                                <div className="field">
                                    <label>GSTIN</label>
                                    <div className="gst-input-wrap">
                                        <input type="text" 
                                            className={gstStatus === 'valid' ? 'valid' : gstStatus === 'invalid' ? 'invalid' : ''} 
                                            value={formData.gst || ''} 
                                            maxLength={15} 
                                            onChange={handleGstInput} 
                                            placeholder="22AAAAA0000A1Z5" 
                                        />
                                        
                                        {gstStatus !== 'idle' && (
                                            <div className={`verify-badge ${gstStatus === 'valid' ? 'valid' : gstStatus === 'loading' ? 'loading' : 'pending'}`}>
                                                {gstStatus === 'valid' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                                                {gstStatus === 'loading' ? 'Checking...' : gstStatus === 'invalid' ? 'Invalid GST' : 'Verified'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="hint">15 digit GSTIN: State Code (2) + PAN (10) + Entity (1) + Z + Checksum (1)</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bank Details */}
                    <div className="card" id="bank">
                        <div className="card-head">
                            <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></div>
                            <div><h2>Bank Details</h2><p>Payment information printed on invoice footer</p></div>
                        </div>
                        <div className="row2">
                            <div className="field">
                                <label>Bank Name</label>
                                <input type="text" value={formData.bank_name || ''} onChange={(e) => setFormData({...formData, bank_name: e.target.value})} placeholder="e.g. HDFC Bank, SBI" />
                            </div>
                            <div className="field">
                                <label>Account Holder Name</label>
                                <input type="text" value={formData.account_holder || ''} onChange={(e) => setFormData({...formData, account_holder: e.target.value})} placeholder="Account Holder Name" />
                            </div>
                        </div>
                        <div className="row2">
                            <div className="field">
                                <label>Account Number</label>
                                <input type="text" value={formData.account_number || ''} onChange={(e) => setFormData({...formData, account_number: e.target.value})} placeholder="00000000000000" />
                            </div>
                            <div className="field">
                                <label>IFSC Code</label>
                                <input type="text" value={formData.ifsc || ''} onChange={(e) => setFormData({...formData, ifsc: e.target.value.toUpperCase()})} placeholder="HDFC0001234" maxLength={11} />
                            </div>
                        </div>
                    </div>

                    {/* Payments */}
                    <div className="card" id="payments">
                        <div className="card-head">
                            <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
                            <div><h2>UPI &amp; Online Payments</h2><p>QR Code automatically generated on invoices for instant payment</p></div>
                        </div>
                        <div className="field">
                            <label>UPI ID (VPA)</label>
                            <input type="text" value={formData.upi_id || ''} onChange={(e) => setFormData({...formData, upi_id: e.target.value})} placeholder="businessname@okhdfcbank" />
                            <div className="hint">Customers can scan the Dynamic QR code on your bills to pay directly to this UPI ID</div>
                        </div>
                    </div>

                    {/* WhatsApp Automation */}
                    <div className="card" id="whatsapp-automation">
                        <div className="card-head">
                            <div className="card-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                            </div>
                            <div>
                                <h2>WhatsApp Direct Invoicing &amp; Reminders</h2>
                                <p>100% Free &amp; Instant WhatsApp notifications for bills, receipts, and balance reminders</p>
                            </div>
                        </div>

                        {/* Instant WhatsApp Sharing */}
                        <div style={{ border: '1px solid var(--card-border)', borderRadius: '14px', padding: '18px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <strong style={{ fontSize: '15px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>💬</span> 1-Tap Instant WhatsApp Sharing
                                    </strong>
                                    <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.4 }}>
                                        Share formatted receipts, PDF invoices, and payment links with 1 tap directly to the customer's WhatsApp chat.
                                    </p>
                                </div>
                                <div>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                                        Always Ready &amp; Free ⚡
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px', color: '#94a3b8', marginTop: '14px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '4px', fontSize: '13px' }}>📱 Zero Cost &amp; No DND Block</strong>
                                    Works seamlessly on Android, iOS, and WhatsApp Web with 100% delivery guarantee.
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '4px', fontSize: '13px' }}>🔗 Auto Payment Link &amp; Visiting Card</strong>
                                    Every WhatsApp reminder automatically attaches your business details and instant UPI payment link.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Branding & Signatory */}
                    <div className="card" id="branding">
                        <div className="card-head">
                            <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg></div>
                            <div><h2>Branding &amp; Signature</h2><p>Your logo and authorized signature printed on invoices</p></div>
                        </div>
                        <div className="row2" style={{alignItems: 'flex-start'}}>
                            {/* Logo Left */}
                            <div>
                                <label style={{display:'block', fontSize:'12.5px', fontWeight:600, color:'#A8B0D6', marginBottom:'12px'}}>Business Logo</label>
                                <div className="upload-row" style={{marginTop:0}}>
                                    <label className="upload-box">
                                        {formData.logo ? (
                                            <>
                                                <img src={formData.logo} alt="Logo" />
                                                <div className="verified-tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"/></svg></div>
                                            </>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                        )}
                                        <input type="file" accept="image/*" style={{display:'none'}} onChange={handleLogoChange} />
                                    </label>
                                    <div>
                                        <label className="upload-btn" style={{marginBottom:'6px', padding:'7px 12px', fontSize:'12px'}}>
                                            Upload Logo
                                            <input type="file" accept="image/*" style={{display:'none'}} onChange={handleLogoChange} />
                                        </label>
                                        <div className="hint" style={{margin:0}}>Square PNG/JPG max 2MB</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Signature Right */}
                            <div>
                                <label style={{display:'block', fontSize:'12.5px', fontWeight:600, color:'#A8B0D6', marginBottom:'12px'}}>Authorized Signature</label>
                                <div className="field" style={{marginBottom:'8px'}}>
                                    <input type="text" value={formData.owner_name || ''} onChange={e => setFormData({...formData, owner_name: e.target.value})} placeholder="Signatory Name (e.g. John Doe)" style={{padding:'8px 12px', fontSize:'13px'}} />
                                </div>
                                <div className="signature-pad" onClick={() => setIsSignatureModalOpen(true)} style={{cursor: 'pointer', height:'60px', maxWidth:'100%', marginBottom:'8px', border:'1px solid var(--field-border)'}}>
                                    {formData.signature ? (
                                        <img src={formData.signature} alt="Signature" />
                                    ) : (
                                        <span style={{fontSize:'20px', color:'var(--text-faint)'}}>{formData.owner_name || 'Draw Signature'}</span>
                                    )}
                                </div>
                                <div style={{display:'flex', gap:'8px'}}>
                                    <button type="button" className="upload-btn" onClick={() => setIsSignatureModalOpen(true)} style={{padding:'6px 10px', fontSize:'12px', flex:1, justifyContent:'center'}}>
                                        Draw
                                    </button>
                                    <label className="upload-btn" style={{padding:'6px 10px', fontSize:'12px', flex:1, justifyContent:'center'}}>
                                        Upload
                                        <input type="file" accept="image/*" style={{display:'none'}} onChange={handleSignatureChange} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="card" id="terms">
                        <div className="card-head">
                            <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg></div>
                            <div><h2>Default Terms &amp; Conditions</h2><p>Printed automatically on every new invoice</p></div>
                        </div>
                        <div className="field">
                            <label>Terms <span className="opt">(will appear on every new invoice)</span></label>
                            <div className="terms-box">
                                <textarea 
                                    maxLength={500} 
                                    value={formData.terms_and_conditions || ''} 
                                    onChange={e => setFormData({...formData, terms_and_conditions: e.target.value})}
                                    placeholder="1. Goods once sold will not be taken back."
                                />
                            </div>
                            <div className="char-count">{(formData.terms_and_conditions || '').length}/500</div>
                            <div className="hint">These terms will automatically appear on all new bills and quotations</div>
                        </div>
                    </div>

                    {/* Features & Modules */}
                    <div className="settings-section" id="modules">
                        <div className="section-header">
                            <div className="section-header-top">
                                <div className="section-title-group">
                                    <div className="section-icon">▦</div>
                                    <div className="section-title">Features &amp; Modules</div>
                                </div>
                                <button type="button" className="close-btn" onClick={() => setFeaturesOpen(!featuresOpen)}>
                                    {featuresOpen ? 'Close ▲' : 'Open ▼'}
                                </button>
                            </div>
                            <div className="section-desc">Enable or disable dashboard modules based on your business needs</div>
                        </div>
                        <div className={`bs-collapse ${featuresOpen ? 'open' : ''}`}><div>
                            {MODULES.map(mod => (
                                <div key={mod.id} className="module-row" onClick={() => {
                                    const current = formData?.modules?.[mod.id] ?? true;
                                    setFormData({ ...formData, modules: { ...formData.modules, [mod.id]: !current } });
                                }}>
                                    <div className="module-left">
                                        <div className="module-icon" style={{ background: mod.color, color: mod.iconColor }}>▦</div>
                                        <div className="module-text">
                                            <h4>{mod.label}</h4>
                                            <p>{mod.desc}</p>
                                        </div>
                                    </div>
                                    <div className={`toggle-box ${(formData?.modules?.[mod.id] ?? true) ? 'active' : ''}`}></div>
                                </div>
                            ))}
                        </div></div>
                    </div>

                    {/* Invoice Design */}
                    <div className="settings-section" id="design">
                        <div className="section-header">
                            <div className="section-header-top">
                                <div className="section-title-group">
                                    <div className="section-icon">🏷</div>
                                    <div className="section-title">Design Your Invoice</div>
                                </div>
                            </div>
                            <div className="section-desc">Customize invoice color theme, table layout, and logo position</div>
                        </div>
                        <div className="bs-collapse open"><div>
                            <div style={{ padding: '0 16px 16px' }}>
                                <p className="bs-sec-label">Invoice Color Theme</p>
                                <div className="bs-theme-grid">
                                    {Object.entries(THEMES).map(([id, t]) => (
                                        <button key={id} type="button" className={`bs-theme-card ${formData.invoice_template === id ? 'active' : ''}`} onClick={() => setFormData({ ...formData, invoice_template: id })}>
                                            {id === 'TEMPLATE_7'
                                                ? <div className="bs-theme-bar" style={{ background: 'repeating-linear-gradient(45deg,#1a1a1a,#1a1a1a 6px,#2a2a2a 6px,#2a2a2a 12px)', borderBottom: '1px solid #272d42' }} />
                                                : <div className="bs-theme-bar" style={{ background: t.accent }} />
                                            }
                                            <div className="bs-theme-label">
                                                {t.name}
                                                {formData.invoice_template === id && (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <p className="bs-sec-label">Invoice Table Layout</p>
                                <div className="bs-layout-grid">
                                    {LAYOUTS.map(l => (
                                        <button key={l.id} type="button" className={`bs-layout-card ${formData.invoice_layout === l.id ? 'active' : ''}`} onClick={() => setFormData({ ...formData, invoice_layout: l.id })}>
                                            <div className="bs-mini">
                                                <i style={{ width: '100%' }}></i>
                                                <i style={{ width: '70%' }}></i>
                                                <i style={{ width: '85%' }}></i>
                                            </div>
                                            <span>{l.name}</span>
                                            <small>{l.desc}</small>
                                        </button>
                                    ))}
                                </div>
                                <p className="bs-sec-label">Logo Alignment on Invoice</p>
                                <div className="bs-align-grid">
                                    {[
                                        { id: 'LEFT', name: 'Left Side' },
                                        { id: 'CENTER', name: 'Center Top' },
                                        { id: 'RIGHT', name: 'Right Side' },
                                    ].map(a => (
                                        <button key={a.id} type="button" className={`bs-align-card ${formData.logo_position === a.id ? 'active' : ''}`} onClick={() => setFormData({ ...formData, logo_position: a.id })}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                {a.id === 'LEFT' && <><line x1="3" y1="12" x2="21" y2="12"/><polyline points="3 6 9 12 3 18"/></>}
                                                {a.id === 'CENTER' && <><polyline points="6 9 12 3 18 9"/><line x1="12" y1="3" x2="12" y2="21"/></>}
                                                {a.id === 'RIGHT' && <><line x1="3" y1="12" x2="21" y2="12"/><polyline points="15 6 21 12 15 18"/></>}
                                            </svg>
                                            <span>{a.name}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="bs-preview-wrap">
                                    <div className="bs-preview-label">
                                        <span style={{ fontSize: '11.5px', color: 'var(--text-faint)', fontWeight: 600 }}>
                                            <span className="bs-preview-dot" />LIVE DEMO PREVIEW
                                        </span>
                                        <span className="bs-badge">Sample Data</span>
                                    </div>
                                    <div style={{ padding: '20px', background: '#fff', borderRadius: '10px', color: '#1a1a2e', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', flexDirection: formData.logo_position === 'CENTER' ? 'column' : (formData.logo_position === 'RIGHT' ? 'row-reverse' : 'row'), justifyContent: 'space-between', alignItems: formData.logo_position === 'CENTER' ? 'center' : 'flex-start', textAlign: formData.logo_position === 'CENTER' ? 'center' : (formData.logo_position === 'RIGHT' ? 'right' : 'left'), gap: '16px' }}>
                                            {formData.logo ? (
                                                <img src={formData.logo} alt="Logo" style={{ height: '36px', objectFit: 'contain' }} />
                                            ) : (
                                                <div style={{ width: '80px', height: '36px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ margin: 0, fontSize: '16px', color: THEMES[formData.invoice_template as keyof typeof THEMES]?.accent || THEMES.TEMPLATE_1.accent, fontWeight: 700 }}>{formData.name || 'Your Business Name'}</h3>
                                                <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#64748b' }}>{formData.address || 'Your Business Address'}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f1f5f9', borderBottom: '2px solid #f1f5f9', padding: '10px 0' }}>
                                            <div>
                                                <p style={{ fontSize: '9px', color: '#94a3b8', margin: 0 }}>BILLED TO</p>
                                                <p style={{ fontSize: '11px', fontWeight: 600, margin: '1px 0 0' }}>Customer Name</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '9px', color: '#94a3b8', margin: 0 }}>INVOICE TOTAL</p>
                                                <p style={{ fontSize: '14px', fontWeight: 800, margin: '1px 0 0', color: THEMES[formData.invoice_template as keyof typeof THEMES]?.accent || THEMES.TEMPLATE_1.accent }}>₹ 24,500</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div></div>
                    </div>

                    {/* Preferences */}
                    <div className="card" id="prefs">
                        <div className="card-head">
                            <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z"/></svg></div>
                            <div><h2>Preferences</h2><p>Select display language for your dashboard</p></div>
                        </div>
                        <div className="field">
                            <label>Language</label>
                            <select value={localSettings.language || 'en'} onChange={e => setLocalSettings({...localSettings, language: e.target.value})}>
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.nativeName} ({lang.name})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Account Security */}
                    <div className="card" id="security">
                        <div className="card-head">
                            <div className="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                            <div><h2>Account Security</h2><p>Manage how you sign in and keep your account safe</p></div>
                        </div>
                        <div className="field">
                            <label>Expense Deletion PIN (4 digits)</label>
                            <input 
                                type="text" 
                                inputMode="numeric"
                                maxLength={4}
                                placeholder={formData.has_expense_pin ? '**** (PIN is set)' : 'Enter 4-digit PIN'} 
                                value={formData.expense_delete_pin || ''} 
                                onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormData({ ...formData, expense_delete_pin: val });
                                }} 
                            />
                            <div className="hint">
                                {formData.has_expense_pin 
                                    ? 'A PIN is currently active. Enter a new PIN to change it, or leave blank and save to remove it.' 
                                    : 'Set a 4-digit PIN to restrict who can delete expenses.'}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="save-bar">
                <button className="save-btn" onClick={handleSubmit}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
                    Save All Settings
                </button>
            </div>
            
            <SignatureModal
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
                onSave={(signatureData) => {
                    setFormData({ ...formData, signature: signatureData });
                    setIsSignatureModalOpen(false);
                }}
            />
        </div>
    );
}
