'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import SignatureModal from '@/app/components/SignatureModal';
import { optimizeImage } from '@/lib/utils';

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
    const [formData, setFormData] = useState<any>(businessProfile || {});
    const [localSettings, setLocalSettings] = useState<any>(settings || {});
    const [isClient, setIsClient] = useState(false);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [featuresOpen, setFeaturesOpen] = useState(false);
    const [designOpen, setDesignOpen] = useState(false);
    const [termsCount, setTermsCount] = useState(0);

    useEffect(() => {
        setIsClient(true);
        if (businessProfile && Object.keys(formData).length === 0) setFormData(businessProfile);
        if (settings && Object.keys(localSettings).length === 0) setLocalSettings(settings);
    }, [businessProfile, settings]);

    useEffect(() => {
        setTermsCount((formData.terms_and_conditions || '').length);
    }, [formData.terms_and_conditions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile(formData);
        updateSettings(localSettings);
        const savePromise = saveBusinessProfile({ ...formData, ...localSettings });
        toast.promise(savePromise, {
            loading: 'Saving your settings...',
            success: 'Settings saved perfectly! Γ£à',
            error: 'Could not save settings'
        });
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const optimizedLogo = await optimizeImage(file, 400, 400, 0.8);
                setFormData({ ...formData, logo: optimizedLogo });
                toast.success('Logo uploaded!');
            } catch (error: any) {
                toast.error(error.message || (localSettings.language === 'en' ? 'Upload failed!' : 'Upload fail ho gaya!'));
            }
        }
    };

    const currentTheme = THEMES[formData.invoice_template as keyof typeof THEMES] || THEMES.TEMPLATE_1;

    if (!isClient) return null;

    return (
        <>
            <style>{`
                :root {
                    --bg: #0a0c12;
                    --bg-soft: #0f1219;
                    --surface: #151926;
                    --surface-2: #1c2132;
                    --surface-3: #232940;
                    --border: #272d42;
                    --border-soft: #1f2436;
                    --text: #f1f3f9;
                    --text-dim: #9aa1bd;
                    --text-faint: #5d6480;
                    --accent: #8b5cf6;
                    --accent-soft: rgba(139,92,246,0.14);
                    --grad: linear-gradient(135deg,#7c3aed 0%, #4f46e5 100%);
                    --success: #22c55e;
                    --radius-lg: 18px;
                    --radius-md: 12px;
                    --radius-sm: 8px;
                }
                .bs-page { background: var(--bg); min-height: 100vh; color: var(--text); font-family: 'Inter', sans-serif; padding-bottom: 80px; }
                .bs-content { max-width: 900px; margin: 0 auto; padding: 16px 12px; }
                @media (min-width: 640px) { .bs-content { padding: 40px 24px; } }

                .bs-page-head { margin-bottom: 20px; text-align: left; }
                @media (min-width: 640px) { .bs-page-head { margin-bottom: 32px; text-align: center; } }
                .bs-page-head h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.3px; color: var(--text); margin: 0; }
                @media (min-width: 640px) { .bs-page-head h1 { font-size: 28px; } }
                .bs-page-head p { margin: 6px 0 0; color: var(--text-dim); font-size: 13px; }
                @media (min-width: 640px) { .bs-page-head p { font-size: 15px; } }

                /* Cards */
                .bs-card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); box-shadow: 0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5); margin-bottom: 16px; overflow: hidden; }
                @media (min-width: 640px) { .bs-card { margin-bottom: 24px; } }
                
                .bs-card-head { display: flex; align-items: flex-start; gap: 12px; padding: 16px; }
                @media (min-width: 640px) { .bs-card-head { padding: 20px 24px 16px; } }
                .bs-card-head > div:not(.bs-card-icon) { flex: 1; min-width: 0; }
                
                .bs-card-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--accent-soft); color: #c4b5fd; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                @media (min-width: 640px) { .bs-card-icon { width: 42px; height: 42px; border-radius: 12px; } .bs-card-icon svg { width: 20px; height: 20px; } }
                
                .bs-card-title { font-size: 15px; font-weight: 700; color: var(--text); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                @media (min-width: 640px) { .bs-card-title { font-size: 17px; } }
                .bs-card-sub { margin: 3px 0 0; font-size: 11.5px; color: var(--text-faint); line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                @media (min-width: 640px) { .bs-card-sub { font-size: 13px; } }
                
                .bs-card-body { padding: 0 16px 16px; }
                @media (min-width: 640px) { .bs-card-body { padding: 0 24px 24px; } }

                /* Toggle Row */
                .bs-toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border-soft); flex-wrap: nowrap; }
                @media (min-width: 640px) { .bs-toggle-row { padding: 16px 0; } }
                .bs-toggle-row:last-child { border-bottom: none; padding-bottom: 0; }
                .bs-toggle-row > div:first-child { flex: 1; min-width: 0; }
                .bs-toggle-row strong { font-size: 13.5px; font-weight: 600; color: var(--text); display: block; }
                @media (min-width: 640px) { .bs-toggle-row strong { font-size: 14.5px; } }
                .bs-toggle-row p { margin: 3px 0 0; font-size: 11.5px; color: var(--text-faint); line-height: 1.4; }
                @media (min-width: 640px) { .bs-toggle-row p { font-size: 12.5px; } }

                /* Switch */
                .bs-switch { position: relative; display: inline-block; width: 44px; height: 26px; flex-shrink: 0; }
                .bs-switch input { opacity: 0; width: 0; height: 0; }
                .bs-slider { position: absolute; inset: 0; background: var(--surface-3); border-radius: 999px; transition: background .2s; border: 1px solid var(--border); cursor: pointer; }
                .bs-slider::before { content: ""; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; border-radius: 50%; background: #7b84a8; transition: transform .2s, background .2s; }
                .bs-switch input:checked + .bs-slider { background: var(--grad); border-color: transparent; }
                .bs-switch input:checked + .bs-slider::before { transform: translateX(18px); background: #fff; }

                /* Segmented Control */
                .bs-segmented { display: inline-flex; background: var(--surface-2); border: 1px solid var(--border); border-radius: 999px; padding: 3px; gap: 2px; width: 100%; }
                @media (min-width: 640px) { .bs-segmented { width: auto; flex-shrink: 0; } }
                .bs-seg-btn { flex: 1; border: none; background: transparent; color: var(--text-dim); font-size: 12.5px; font-weight: 600; padding: 7px 16px; border-radius: 999px; transition: .15s; cursor: pointer; text-align: center; }
                @media (min-width: 640px) { .bs-seg-btn { flex: none; padding: 8px 20px; font-size: 13px; } }
                .bs-seg-btn.active { background: var(--grad); color: #fff; }

                /* Form Fields */
                .bs-form-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
                @media (min-width: 640px) { .bs-form-grid { grid-template-columns: 1fr 1fr; gap: 20px; } }
                .bs-form-full { grid-column: 1 / -1; }
                .bs-field { display: flex; flex-direction: column; gap: 6px; }
                .bs-field label { font-size: 12px; font-weight: 600; color: var(--text-dim); margin-left: 2px; }
                @media (min-width: 640px) { .bs-field label { font-size: 13px; } }
                .bs-field input, .bs-field textarea, .bs-field select { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); padding: 12px 14px; font-size: 14px; outline: none; transition: border-color .15s, box-shadow .15s; width: 100%; font-family: inherit; }
                .bs-field input::placeholder, .bs-field textarea::placeholder { color: var(--text-faint); }
                .bs-field input:focus, .bs-field textarea:focus, .bs-field select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
                .bs-field textarea { resize: vertical; min-height: 80px; line-height: 1.6; }
                .bs-hint { font-size: 11.5px; color: var(--text-faint); margin: 4px 0 0; }
                .bs-char-count { font-size: 11px; color: var(--text-faint); text-align: right; margin-top: 4px; }

                /* Collapsible */
                .bs-collapse { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s ease; }
                .bs-collapse.open { grid-template-rows: 1fr; }
                .bs-collapse > div { overflow: hidden; }

                /* Chevron btn */
                .bs-chevron-btn { display: flex; align-items: center; gap: 7px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-dim); padding: 8px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; flex-shrink: 0; transition: border-color .15s, color .15s; cursor: pointer; }
                .bs-chevron-btn:hover { border-color: var(--accent); color: var(--text); }
                .bs-chevron-btn svg { width: 13px; height: 13px; transition: transform .25s; }
                .bs-chevron-btn.open svg { transform: rotate(180deg); }

                /* Feature items */
                .bs-feature-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
                @media (min-width: 768px) { .bs-feature-grid { grid-template-columns: 1fr 1fr; gap: 14px; } }
                .bs-feature-item { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border-soft); border-radius: var(--radius-md); background: var(--bg-soft); }
                @media (min-width: 640px) { .bs-feature-item { padding: 16px; gap: 16px; } }
                .bs-f-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                @media (min-width: 640px) { .bs-f-icon { width: 40px; height: 40px; border-radius: 12px; } .bs-f-icon svg { width: 18px; height: 18px; } }
                .bs-f-icon svg { width: 16px; height: 16px; }
                .bs-f-text { flex: 1; min-width: 0; }
                .bs-f-text strong { font-size: 13px; font-weight: 600; display: block; color: var(--text); }
                @media (min-width: 640px) { .bs-f-text strong { font-size: 14.5px; } }
                .bs-f-text p { margin: 2px 0 0; font-size: 11.5px; color: var(--text-faint); }
                @media (min-width: 640px) { .bs-f-text p { font-size: 12.5px; line-height: 1.4; } }

                /* Logo preview */
                .bs-logo-preview { width: 64px; height: 64px; border-radius: 12px; background: var(--surface-2); border: 1.5px dashed var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; color: var(--text-faint); }
                @media (min-width: 640px) { .bs-logo-preview { width: 80px; height: 80px; border-radius: 16px; } }
                .bs-logo-preview img { width: 100%; height: 100%; object-fit: cover; }
                .bs-file-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text); padding: 10px 16px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; cursor: pointer; transition: border-color .15s; }
                .bs-file-btn:hover { border-color: var(--accent); background: var(--surface-3); }

                /* Signature preview */
                .bs-sig-preview { width: 100%; height: 80px; border-radius: 10px; background: #fff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; }
                @media (min-width: 640px) { .bs-sig-preview { width: 220px; height: 80px; } }

                /* Outline button */
                .bs-btn-outline { background: var(--surface-2); border: 1px solid var(--border); color: var(--text); padding: 10px 18px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: border-color .15s; width: 100%; }
                @media (min-width: 640px) { .bs-btn-outline { width: auto; } }
                .bs-btn-outline:hover { border-color: var(--accent); background: var(--surface-3); }

                /* Theme cards */
                .bs-theme-grid { display: flex; overflow-x: auto; gap: 10px; padding-bottom: 8px; -webkit-overflow-scrolling: touch; }
                @media (min-width: 480px) { .bs-theme-grid { display: grid; grid-template-columns: repeat(3, 1fr); padding-bottom: 0; } }
                @media (min-width: 768px) { .bs-theme-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; } }
                .bs-theme-card { flex: 0 0 140px; border: 1.5px solid var(--border); border-radius: var(--radius-md); overflow: hidden; background: var(--bg-soft); text-align: left; cursor: pointer; transition: border-color .15s, transform .15s; width: 100%; }
                @media (min-width: 480px) { .bs-theme-card { flex: auto; } }
                .bs-theme-card:hover { border-color: var(--border-soft); transform: translateY(-2px); }
                .bs-theme-card.active { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); transform: none; }
                .bs-theme-bar { height: 34px; width: 100%; }
                .bs-theme-label { padding: 8px 10px; font-size: 11.5px; font-weight: 600; color: var(--text-dim); display: flex; align-items: center; justify-content: space-between; }
                @media (min-width: 640px) { .bs-theme-label { font-size: 12.5px; padding: 10px 12px; } }

                /* Layout grid */
                .bs-layout-grid { display: flex; overflow-x: auto; gap: 10px; padding-bottom: 8px; -webkit-overflow-scrolling: touch; }
                @media (min-width: 480px) { .bs-layout-grid { display: grid; grid-template-columns: repeat(3, 1fr); padding-bottom: 0; } }
                @media (min-width: 768px) { .bs-layout-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; } }
                .bs-layout-card { flex: 0 0 130px; border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 13px 10px; background: var(--bg-soft); display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; cursor: pointer; transition: border-color .15s, transform .15s; width: 100%; }
                @media (min-width: 480px) { .bs-layout-card { flex: auto; } }
                .bs-layout-card:hover { transform: translateY(-2px); }
                .bs-layout-card.active { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); transform: none; }
                .bs-layout-card span { font-size: 12px; font-weight: 600; color: var(--text); }
                @media (min-width: 640px) { .bs-layout-card span { font-size: 13px; } }
                .bs-layout-card small { font-size: 10.5px; color: var(--text-faint); }

                /* Align grid */
                .bs-align-grid { display: flex; overflow-x: auto; gap: 10px; padding-bottom: 8px; -webkit-overflow-scrolling: touch; }
                @media (min-width: 480px) { .bs-align-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding-bottom: 0; } }
                .bs-align-card { flex: 0 0 110px; border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 13px 8px; background: var(--bg-soft); display: flex; flex-direction: column; align-items: center; gap: 7px; cursor: pointer; transition: border-color .15s, transform .15s; width: 100%; }
                @media (min-width: 480px) { .bs-align-card { flex: auto; } }
                .bs-align-card:hover { transform: translateY(-2px); }
                .bs-align-card.active { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); transform: none; }
                .bs-align-card svg { width: 18px; height: 18px; color: var(--text-dim); }
                @media (min-width: 640px) { .bs-align-card svg { width: 22px; height: 22px; } }
                .bs-align-card span { font-size: 10.5px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; color: var(--text-dim); }

                /* Preview */
                .bs-preview-wrap { margin-top: 24px; border: 1px solid var(--border-soft); border-radius: var(--radius-md); background: #0d0f17; padding: 12px; }
                @media (min-width: 640px) { .bs-preview-wrap { padding: 20px; border-radius: var(--radius-lg); } }
                .bs-preview-label { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
                .bs-preview-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; display: inline-block; margin-right: 6px; box-shadow: 0 0 0 3px rgba(34,197,94,0.14); }
                .bs-badge { font-size: 10.5px; background: var(--surface-2); color: var(--text-faint); padding: 4px 10px; border-radius: 6px; font-weight: 600; }

                /* Section label */
                .bs-sec-label { font-size: 13px; font-weight: 700; color: var(--text-dim); margin: 20px 0 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                @media (min-width: 640px) { .bs-sec-label { font-size: 14px; margin: 24px 0 14px; } }
                .bs-sec-label:first-child { margin-top: 4px; }

                /* Save Bar */
                .bs-save-bar { position: sticky; bottom: 0; padding: 16px; background: rgba(10,12,18,0.85); backdrop-filter: blur(12px); border-top: 1px solid var(--border-soft); display: flex; justify-content: center; z-index: 30; }
                @media (min-width: 640px) { .bs-save-bar { padding: 20px; } }
                .bs-btn-primary { background: var(--grad); color: #fff; border: none; padding: 14px 24px; border-radius: 999px; font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 24px -10px rgba(124,58,237,0.6); max-width: 440px; width: 100%; justify-content: center; cursor: pointer; transition: transform .15s, box-shadow .15s; }
                @media (min-width: 640px) { .bs-btn-primary { padding: 16px 32px; font-size: 16px; } }
                .bs-btn-primary:hover { box-shadow: 0 14px 28px -10px rgba(124,58,237,0.7); }
                .bs-btn-primary:active { transform: scale(.98); }
                .bs-btn-primary svg { width: 18px; height: 18px; }

                /* Mini layout preview bars */
                .bs-mini { width: 100%; height: 30px; display: flex; flex-direction: column; gap: 3px; justify-content: center; }
                .bs-mini i { display: block; height: 4px; background: var(--text-faint); border-radius: 2px; }
            `}</style>

            <div className="bs-page">
                <form onSubmit={handleSubmit}>
                    <div className="bs-content">
                        <div className="bs-page-head">
                            <h1>Business Settings</h1>
                            <p>{localSettings.language === 'en' ? 'Manage your business profile, invoice design and preferences here.' : 'Apna business profile, invoice design aur preferences yahan se manage karein.'}</p>
                        </div>

                        {/* ΓöÇΓöÇ 1. BUSINESS PROFILE ΓöÇΓöÇ */}
                        <section className="bs-card">
                            <div className="bs-card-head">
                                <div className="bs-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                </div>
                                <div>
                                    <h2 className="bs-card-title">Business Profile</h2>
                                    <p className="bs-card-sub">{localSettings.language === 'en' ? 'Update basic details of your business' : 'Apne business ki basic details update karein'}</p>
                                </div>
                            </div>
                            <div className="bs-card-body">
                                <div className="bs-form-grid">
                                    <div className="bs-field bs-form-full">
                                        <label>Business Name</label>
                                        <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Sharma Traders" required />
                                    </div>
                                    <div className="bs-field">
                                        <label>Mobile Number</label>
                                        <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="10 digit number" required />
                                    </div>
                                    <div className="bs-field">
                                        <label>Email Address</label>
                                        <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="business@email.com" />
                                    </div>
                                    <div className="bs-field bs-form-full">
                                        <label>Business Address</label>
                                        <textarea value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full address shown on invoice"></textarea>
                                    </div>
                                    <div className="bs-field bs-form-full">
                                        <label>GST Number (Optional)</label>
                                        <input type="text" value={formData.gst || ''} onChange={(e) => setFormData({ ...formData, gst: e.target.value })} placeholder="22AAAAA0000A1Z5" style={{ textTransform: 'uppercase' }} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ΓöÇΓöÇ TAX SETTINGS ΓöÇΓöÇ */}
                        <section className="bs-card">
                            <div className="bs-card-head">
                                <div className="bs-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="M6 13h8.5l-5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>
                                </div>
                                <div>
                                    <h2 className="bs-card-title">Tax Settings</h2>
                                    <p className="bs-card-sub">GST configuration used across every invoice</p>
                                </div>
                            </div>
                            <div className="bs-card-body">
                                {/* GST Toggle */}
                                <div className="bs-toggle-row" style={{ borderBottom: !localSettings.nonGstMode ? '1px solid var(--border-soft)' : 'none' }}>
                                    <div>
                                        <strong>I have a GST Number</strong>
                                        <p style={{ fontSize: '11.5px', color: 'var(--text-faint)', margin: '2px 0 0' }}>{localSettings.language === 'en' ? 'Turn ON if you have a GST number, else OFF.' : 'Agar GST number hai to ON karein, nahi hai to OFF.'}</p>
                                    </div>
                                    <label className="bs-switch">
                                        <input type="checkbox" checked={!localSettings.nonGstMode} onChange={(e) => setLocalSettings({ ...localSettings, nonGstMode: !e.target.checked })} />
                                        <span className="bs-slider"></span>
                                    </label>
                                </div>

                                {/* GST Calculation Mode ΓÇö only shows when GST is ON */}
                                <div className={`bs-collapse ${!localSettings.nonGstMode ? 'open' : ''}`}>
                                    <div style={{ padding: '8px 0 16px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <strong style={{ fontSize: '12.5px', marginBottom: '8px' }}>GST Calculation</strong>
                                        <div className="bs-segmented" style={{ flexShrink: 0, maxWidth: '280px', width: '100%' }}>
                                            <button type="button" className={`bs-seg-btn ${localSettings.taxType !== 'INCLUSIVE' ? 'active' : ''}`} onClick={() => setLocalSettings({ ...localSettings, taxType: 'EXCLUSIVE' })}>Exclusive</button>
                                            <button type="button" className={`bs-seg-btn ${localSettings.taxType === 'INCLUSIVE' ? 'active' : ''}`} onClick={() => setLocalSettings({ ...localSettings, taxType: 'INCLUSIVE' })}>Inclusive</button>
                                        </div>
                                        <p style={{ fontSize: '11px', color: 'var(--text-faint)', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                                            {localSettings.language === 'en' 
                                                ? 'Exclusive: Tax added on top. Inclusive: Tax inside price.' 
                                                : 'Exclusive: Tax alag se jurega. Inclusive: Tax rate ke andar hai.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ΓöÇΓöÇ BANK DETAILS ΓöÇΓöÇ */}
                        <section className="bs-card">
                            <div className="bs-card-head">
                                <div className="bs-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="3" y1="21" x2="21" y2="21"/><line x1="5" y1="21" x2="5" y2="10"/><line x1="9" y1="21" x2="9" y2="10"/><line x1="15" y1="21" x2="15" y2="10"/><line x1="19" y1="21" x2="19" y2="10"/><polygon points="12 3 21 9 3 9"/></svg>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 className="bs-card-title">Bank Account Details</h2>
                                    <p className="bs-card-sub">Shown on invoices for direct bank transfers</p>
                                </div>
                                <label className="bs-switch">
                                    <input type="checkbox" checked={!!formData.show_bank_details} onChange={(e) => setFormData({ ...formData, show_bank_details: e.target.checked })} />
                                    <span className="bs-slider"></span>
                                </label>
                            </div>
                            <div className="bs-card-body">
                                <div className={`bs-form-grid`} style={{ opacity: formData.show_bank_details ? 1 : 0.4, pointerEvents: formData.show_bank_details ? 'auto' : 'none', transition: 'opacity .2s' }}>
                                    <div className="bs-field"><label>Bank Name</label><input type="text" value={formData.bank_name || ''} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} placeholder="e.g. State Bank of India" /></div>
                                    <div className="bs-field"><label>Account Number</label><input type="text" value={formData.account_no || ''} onChange={(e) => setFormData({ ...formData, account_no: e.target.value })} placeholder="Enter A/C number" style={{ fontFamily: 'monospace' }} /></div>
                                    <div className="bs-field"><label>IFSC Code</label><input type="text" value={formData.ifsc_code || ''} onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })} placeholder="SBIN0001234" style={{ fontFamily: 'monospace' }} /></div>
                                    <div className="bs-field"><label>Branch Name</label><input type="text" value={formData.branch_name || ''} onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })} placeholder="Branch location" /></div>
                                    <div className="bs-field bs-form-full"><label>Account Holder Name</label><input type="text" value={formData.account_holder || ''} onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })} placeholder="Name as per bank records" /></div>
                                </div>
                            </div>
                        </section>

                        {/* ΓöÇΓöÇ 4. UPI PAYMENT ΓöÇΓöÇ */}
                        <section className="bs-card">
                            <div className="bs-card-head">
                                <div className="bs-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                                </div>
                                <div>
                                    <h2 className="bs-card-title">Payments</h2>
                                    <p className="bs-card-sub">UPI ID used to generate QR codes on invoices</p>
                                </div>
                            </div>
                            <div className="bs-card-body">
                                <div className="bs-field">
                                    <label>UPI ID (for QR Code)</label>
                                    <input type="text" value={formData.upi_id || ''} onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })} placeholder="example@upi" />
                                    <p className="bs-hint">{localSettings.language === 'en' ? 'This ID will be used to generate a payment QR code on your invoices.' : 'Yeh ID aapke invoices par payment QR code generate karne ke liye upyog hogi.'}</p>
                                </div>
                            </div>
                        </section>

                        {/* ΓöÇΓöÇ 5. BRANDING ΓöÇΓöÇ */}
                        <section className="bs-card">
                            <div className="bs-card-head">
                                <div className="bs-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.672 0-.434-.137-.83-.43-1.156-.29-.32-.426-.74-.426-1.156a1.69 1.69 0 0 1 1.688-1.688h1.996c3.051 0 5.523-2.473 5.523-5.523C21.998 6.453 17.546 2 12 2z"/></svg>
                                </div>
                                <div>
                                    <h2 className="bs-card-title">Branding</h2>
                                    <p className="bs-card-sub">Logo shown on the invoice header</p>
                                </div>
                            </div>
                            <div className="bs-card-body">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                                    <div className="bs-logo-preview">
                                        {formData.logo
                                            ? <img src={formData.logo} alt="Logo" />
                                            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="26" height="26"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                                        }
                                    </div>
                                    <div>
                                        <label className="bs-file-btn">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                            Choose Logo File
                                            <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                                        </label>
                                        <p className="bs-hint" style={{ marginTop: '6px' }}>Recommended: 200├ù200px. Max: 2MB.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ΓöÇΓöÇ 7. AUTHORIZED SIGNATORY ΓöÇΓöÇ */}
                        <section className="bs-card">
                            <div className="bs-card-head">
                                <div className="bs-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17s3-2 6 0 6 0 6 0 3-2 6 0"/><path d="M4 21h16"/></svg>
                                </div>
                                <div>
                                    <h2 className="bs-card-title">Authorized Signatory</h2>
                                    <p className="bs-card-sub">Your signature will be printed on invoices and quotations</p>
                                </div>
                            </div>
                            <div className="bs-card-body">
                                <div className="bs-field" style={{ marginBottom: '16px' }}>
                                    <label>Authorized Signatory Name</label>
                                    <input type="text" value={formData.owner_name || ''} onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })} placeholder="Person name for signature" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                                    <div className="bs-sig-preview">
                                        {formData.signature
                                            ? <img src={formData.signature} alt="Signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            : <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: '22px', color: '#1a1a2e' }}>{formData.owner_name || 'Signature'}</span>
                                        }
                                    </div>
                                    <button type="button" className="bs-btn-outline" onClick={() => setIsSignatureModalOpen(true)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
                                        {formData.signature ? 'Change Signature' : 'Draw Signature'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* ΓöÇΓöÇ 8. TERMS & CONDITIONS ΓöÇΓöÇ */}
                        <section className="bs-card">
                            <div className="bs-card-head">
                                <div className="bs-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
                                </div>
                                <div>
                                    <h2 className="bs-card-title">Default Terms &amp; Conditions</h2>
                                    <p className="bs-card-sub">Appears on every new invoice you create</p>
                                </div>
                            </div>
                            <div className="bs-card-body">
                                <div className="bs-field">
                                    <label>Terms (will appear on every new invoice)</label>
                                    <textarea maxLength={500} value={formData.terms_and_conditions || ''} onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })} placeholder="1. Goods once sold will not be taken back.&#10;2. Interest @18% will be charged if payment is not made within 15 days.&#10;3. Subject to local jurisdiction." />
                                    <div className="bs-char-count">{termsCount}/500</div>
                                    <p className="bs-hint">{localSettings.language === 'en' ? 'These terms will automatically appear on every new bill.' : 'Yeh terms aapke har naye bill par apne aap likh kar aa jaayenge.'}</p>
                                </div>
                            </div>
                        </section>

                        {/* ΓöÇΓöÇ FEATURES & MODULES ΓöÇΓöÇ */}
                        <section className="bs-card">
                            <div className="bs-card-head">
                                <div className="bs-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 className="bs-card-title">Features &amp; Modules</h2>
                                    <p className="bs-card-sub">Turn modules on or off based on what your business needs</p>
                                </div>
                                <button type="button" className={`bs-chevron-btn ${featuresOpen ? 'open' : ''}`} onClick={() => setFeaturesOpen(!featuresOpen)}>
                                    <span>{featuresOpen ? 'Close' : 'View Modules'}</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>
                            </div>
                            <div className={`bs-collapse ${featuresOpen ? 'open' : ''}`}><div>
                                <div className="bs-card-body">
                                    <div className="bs-feature-grid">
                                        {MODULES.map(mod => (
                                            <div key={mod.id} className="bs-feature-item">
                                                <div className="bs-f-icon" style={{ background: mod.color, color: mod.iconColor }}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                                                </div>
                                                <div className="bs-f-text">
                                                    <strong>{mod.label}</strong>
                                                    <p>{mod.desc}</p>
                                                </div>
                                                <label className="bs-switch">
                                                    <input type="checkbox" checked={formData?.modules?.[mod.id] ?? true} onChange={(e) => setFormData({ ...formData, modules: { ...formData.modules, [mod.id]: e.target.checked } })} />
                                                    <span className="bs-slider"></span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div></div>
                        </section>

                        {/* ΓöÇΓöÇ 9. DESIGN YOUR INVOICE ΓöÇΓöÇ */}
                        <section className="bs-card">
                            <div className="bs-card-head">
                                <div className="bs-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 className="bs-card-title">Design Your Invoice</h2>
                                    <p className="bs-card-sub">Color theme, table layout, logo &amp; live preview</p>
                                </div>
                                <button type="button" className={`bs-chevron-btn ${designOpen ? 'open' : ''}`} onClick={() => setDesignOpen(!designOpen)}>
                                    <span>{designOpen ? 'Close' : 'Customize Design'}</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>
                            </div>
                            <div className={`bs-collapse ${designOpen ? 'open' : ''}`}><div>
                                <div className="bs-card-body">
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
                                            <button key={l.id} type="button" className={`bs-layout-card ${formData.invoice_table_format === l.id ? 'active' : ''}`} onClick={() => setFormData({ ...formData, invoice_table_format: l.id })}>
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
                                        <div style={{ background: '#fff', color: '#1a1a2e', borderRadius: '10px', padding: '16px', fontSize: '11px', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', flexDirection: formData.logo_position === 'CENTER' ? 'column' : formData.logo_position === 'RIGHT' ? 'row-reverse' : 'row', alignItems: formData.logo_position === 'CENTER' ? 'center' : 'flex-start', gap: '10px', paddingBottom: '10px', marginBottom: '10px', borderBottom: `2px solid ${currentTheme.accent}`, textAlign: formData.logo_position === 'CENTER' ? 'center' : formData.logo_position === 'RIGHT' ? 'right' : 'left' }}>
                                                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: currentTheme.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px', order: formData.logo_position === 'CENTER' ? 0 : undefined }}>
                                                    {(formData.name || 'AE').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <b style={{ fontFamily: 'Sora,sans-serif', fontSize: '13px', display: 'block', color: currentTheme.accent, letterSpacing: '.2px' }}>{(formData.name || 'YOUR BUSINESS').toUpperCase()}</b>
                                                    <div style={{ fontSize: '10px', color: '#555', marginTop: '2px', lineHeight: '1.5' }}>{formData.address || 'Your Address'}</div>
                                                    <div style={{ fontSize: '10px', color: '#555' }}>Mob: {formData.phone || '+91 0000000000'}</div>
                                                </div>
                                                <div style={{ fontStyle: 'italic', fontWeight: 700, fontSize: '12px', color: '#222', whiteSpace: 'nowrap' }}>TAX INVOICE</div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555', marginBottom: '8px' }}>
                                                <div>Bill To: <b>Ramesh Kumar</b><br />South Extension, Delhi</div>
                                                <div style={{ textAlign: 'right' }}>Inv #: IV-101<br />Date: 18-06-2026</div>
                                            </div>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                                                <thead><tr>
                                                    <th style={{ textAlign: 'left', padding: '6px 4px', color: '#777', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600 }}>Item</th>
                                                    <th style={{ textAlign: 'center', padding: '6px 4px', color: '#777', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600 }}>Qty</th>
                                                    <th style={{ textAlign: 'right', padding: '6px 4px', color: '#777', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600 }}>Amount</th>
                                                </tr></thead>
                                                <tbody>
                                                    {[{ n: 'Premium Cotton Shirt', q: 2, a: 'Γé╣2400' }, { n: 'Office Table Lamp', q: 1, a: 'Γé╣850' }].map((r, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid #eee', background: formData.invoice_table_format === 'FORMAT_4' && i % 2 !== 0 ? `${currentTheme.accent}18` : undefined }}>
                                                            <td style={{ padding: '6px 4px', color: '#222' }}>{r.n}</td>
                                                            <td style={{ padding: '6px 4px', textAlign: 'center', color: '#222' }}>{r.q}</td>
                                                            <td style={{ padding: '6px 4px', textAlign: 'right', color: '#222' }}>{r.a}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee', fontSize: '11px' }}>
                                                Grand Total <b style={{ marginLeft: '8px', color: currentTheme.accent }}>Γé╣3,250.00</b>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div></div>
                        </section>

                        {/* ΓöÇΓöÇ 10. PREFERENCES ΓöÇΓöÇ */}
                        <section className="bs-card">
                            <div className="bs-card-head">
                                <div className="bs-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                                </div>
                                <div>
                                    <h2 className="bs-card-title">Preferences</h2>
                                    <p className="bs-card-sub">Display language for the dashboard</p>
                                </div>
                            </div>
                            <div className="bs-card-body">
                                <div className="bs-field" style={{ maxWidth: '280px' }}>
                                    <label>Language</label>
                                    <select value={localSettings.language || 'en'} onChange={(e) => setLocalSettings({ ...localSettings, language: e.target.value })}>
                                        <option value="en">English</option>
                                        <option value="hi">αñ╣αñ┐αñ¿αÑìαñªαÑÇ (Hindi)</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* ΓöÇΓöÇ 11. ACCOUNT SECURITY ΓöÇΓöÇ */}
                        <section className="bs-card">
                            <div className="bs-card-head">
                                <div className="bs-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </div>
                                <div>
                                    <h2 className="bs-card-title">Account Security</h2>
                                    <p className="bs-card-sub">Manage how you sign in and keep your account safe</p>
                                </div>
                            </div>
                            <div className="bs-card-body">
                                <p className="bs-hint">{localSettings.language === 'en' ? "Manage your business profile and settings here. Press 'Save All Settings' below to apply changes." : "Apna business profile aur settings yahan se manage karein. Sabhi badlav save karne ke liye neeche 'Save All Settings' button dabayein."}</p>
                            </div>
                        </section>
                    </div>

                    {/* ΓöÇΓöÇ SAVE BAR ΓöÇΓöÇ */}
                    <div className="bs-save-bar">
                        <button type="submit" className="bs-btn-primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                            Save All Settings
                        </button>
                    </div>
                </form>
            </div>

            <SignatureModal
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
                onSave={(data: string) => setFormData({ ...formData, signature: data })}
            />
        </>
    );
}
