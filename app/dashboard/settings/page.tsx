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
            success: 'Settings saved perfectly! ✅',
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
                toast.error(error.message || 'Upload fail ho gaya!');
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
                .bs-content { max-width: 860px; margin: 0 auto; padding: 24px 16px; }
                .bs-page-head { margin-bottom: 22px; }
                .bs-page-head h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.3px; color: var(--text); margin: 0; }
                .bs-page-head p { margin: 6px 0 0; color: var(--text-dim); font-size: 13.5px; }

                /* Cards */
                .bs-card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); box-shadow: 0 1px 0 rgba(255,255,255,0.03) inset, 0 10px 30px -16px rgba(0,0,0,0.6); margin-bottom: 16px; overflow: hidden; }
                .bs-card-head { display: flex; align-items: flex-start; gap: 12px; padding: 18px 20px 14px; }
                .bs-card-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--accent-soft); color: #c4b5fd; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .bs-card-icon svg { width: 18px; height: 18px; }
                .bs-card-title { font-size: 15px; font-weight: 700; color: var(--text); margin: 0; }
                .bs-card-sub { margin: 3px 0 0; font-size: 12px; color: var(--text-faint); }
                .bs-card-body { padding: 0 20px 20px; }

                /* Toggle Row */
                .bs-toggle-row { display: flex; align-items: flex-start; gap: 14px; justify-content: space-between; padding: 13px 0; border-bottom: 1px solid var(--border-soft); }
                .bs-toggle-row:last-child { border-bottom: none; padding-bottom: 0; }
                .bs-toggle-row strong { font-size: 13.5px; font-weight: 600; color: var(--text); display: block; }
                .bs-toggle-row p { margin: 3px 0 0; font-size: 12px; color: var(--text-faint); line-height: 1.5; }

                /* Switch */
                .bs-switch { position: relative; display: inline-block; width: 44px; height: 26px; flex-shrink: 0; }
                .bs-switch input { opacity: 0; width: 0; height: 0; }
                .bs-slider { position: absolute; inset: 0; background: var(--surface-3); border-radius: 999px; transition: background .2s; border: 1px solid var(--border); cursor: pointer; }
                .bs-slider::before { content: ""; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; border-radius: 50%; background: #7b84a8; transition: transform .2s, background .2s; }
                .bs-switch input:checked + .bs-slider { background: var(--grad); border-color: transparent; }
                .bs-switch input:checked + .bs-slider::before { transform: translateX(18px); background: #fff; }

                /* Segmented Control */
                .bs-segmented { display: inline-flex; background: var(--surface-2); border: 1px solid var(--border); border-radius: 999px; padding: 3px; gap: 2px; }
                .bs-seg-btn { border: none; background: transparent; color: var(--text-dim); font-size: 12.5px; font-weight: 600; padding: 7px 18px; border-radius: 999px; transition: .15s; cursor: pointer; }
                .bs-seg-btn.active { background: var(--grad); color: #fff; }

                /* Form Fields */
                .bs-form-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
                @media (min-width: 640px) { .bs-form-grid { grid-template-columns: 1fr 1fr; } }
                .bs-form-full { grid-column: 1 / -1; }
                .bs-field { display: flex; flex-direction: column; gap: 6px; }
                .bs-field label { font-size: 12.5px; font-weight: 600; color: var(--text-dim); }
                .bs-field input, .bs-field textarea, .bs-field select { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); padding: 11px 13px; font-size: 13.5px; outline: none; transition: border-color .15s, box-shadow .15s; width: 100%; font-family: inherit; }
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
                @media (min-width: 640px) { .bs-feature-grid { grid-template-columns: 1fr 1fr; } }
                .bs-feature-item { display: flex; align-items: center; gap: 12px; padding: 13px; border: 1px solid var(--border-soft); border-radius: var(--radius-md); background: var(--bg-soft); }
                .bs-f-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .bs-f-icon svg { width: 16px; height: 16px; }
                .bs-f-text { flex: 1; min-width: 0; }
                .bs-f-text strong { font-size: 13px; font-weight: 600; display: block; color: var(--text); }
                .bs-f-text p { margin: 2px 0 0; font-size: 11.5px; color: var(--text-faint); }

                /* Logo preview */
                .bs-logo-preview { width: 74px; height: 74px; border-radius: 14px; background: var(--surface-2); border: 1.5px dashed var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; color: var(--text-faint); }
                .bs-logo-preview img { width: 100%; height: 100%; object-fit: cover; }
                .bs-file-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text); padding: 10px 16px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; cursor: pointer; transition: border-color .15s; }
                .bs-file-btn:hover { border-color: var(--accent); }

                /* Signature preview */
                .bs-sig-preview { width: 180px; height: 68px; border-radius: 10px; background: #fff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }

                /* Outline button */
                .bs-btn-outline { background: var(--surface-2); border: 1px solid var(--border); color: var(--text); padding: 10px 18px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; transition: border-color .15s; }
                .bs-btn-outline:hover { border-color: var(--accent); }

                /* Theme cards */
                .bs-theme-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                @media (min-width: 640px) { .bs-theme-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (min-width: 1024px) { .bs-theme-grid { grid-template-columns: repeat(4, 1fr); } }
                .bs-theme-card { border: 1.5px solid var(--border); border-radius: var(--radius-md); overflow: hidden; background: var(--bg-soft); text-align: left; cursor: pointer; transition: border-color .15s; width: 100%; }
                .bs-theme-card.active { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
                .bs-theme-bar { height: 34px; width: 100%; }
                .bs-theme-label { padding: 8px 10px; font-size: 12px; font-weight: 600; color: var(--text-dim); display: flex; align-items: center; justify-content: space-between; }

                /* Layout grid */
                .bs-layout-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                @media (min-width: 640px) { .bs-layout-grid { grid-template-columns: repeat(3, 1fr); } }
                .bs-layout-card { border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 13px 10px; background: var(--bg-soft); display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; cursor: pointer; transition: border-color .15s; width: 100%; }
                .bs-layout-card.active { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
                .bs-layout-card span { font-size: 12px; font-weight: 600; color: var(--text); }
                .bs-layout-card small { font-size: 10.5px; color: var(--text-faint); }

                /* Align grid */
                .bs-align-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                .bs-align-card { border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 13px 8px; background: var(--bg-soft); display: flex; flex-direction: column; align-items: center; gap: 7px; cursor: pointer; transition: border-color .15s; width: 100%; }
                .bs-align-card.active { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
                .bs-align-card svg { width: 18px; height: 18px; color: var(--text-dim); }
                .bs-align-card span { font-size: 10.5px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; color: var(--text-dim); }

                /* Preview */
                .bs-preview-wrap { margin-top: 18px; border: 1px solid var(--border-soft); border-radius: var(--radius-md); background: #0d0f17; padding: 14px; }
                .bs-preview-label { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
                .bs-preview-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; display: inline-block; margin-right: 6px; box-shadow: 0 0 0 3px rgba(34,197,94,0.14); }
                .bs-badge { font-size: 10px; background: var(--surface-2); color: var(--text-faint); padding: 3px 8px; border-radius: 6px; }

                /* Section label */
                .bs-sec-label { font-size: 12.5px; font-weight: 600; color: var(--text-dim); margin: 16px 0 10px; }
                .bs-sec-label:first-child { margin-top: 4px; }

                /* Save Bar */
                .bs-save-bar { position: sticky; bottom: 0; padding: 14px 16px; background: rgba(10,12,18,0.9); backdrop-filter: blur(10px); border-top: 1px solid var(--border-soft); display: flex; justify-content: center; z-index: 30; }
                .bs-btn-primary { background: var(--grad); color: #fff; border: none; padding: 14px 32px; border-radius: 999px; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 24px -10px rgba(124,58,237,0.6); max-width: 440px; width: 100%; justify-content: center; cursor: pointer; transition: transform .15s; }
                .bs-btn-primary:active { transform: scale(.98); }
                .bs-btn-primary svg { width: 16px; height: 16px; }

                /* Mini layout preview bars */
                .bs-mini { width: 100%; height: 30px; display: flex; flex-direction: column; gap: 3px; justify-content: center; }
                .bs-mini i { display: block; height: 4px; background: var(--text-faint); border-radius: 2px; }
            `}</style>

            <div className="bs-page">
                <form onSubmit={handleSubmit}>
                    <div className="bs-content">
                        <div className="bs-page-head">
                            <h1>Business Settings</h1>
                            <p>Apna business profile, invoice design aur preferences yahan se manage karein.</p>
                        </div>

                        {/* ── TAX SETTINGS ── */}
                        <section className="bs-card">
                            <div className="bs-card-head">
                                <div className="bs-card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
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
                                        <p style={{ fontSize: '11.5px', color: 'var(--text-faint)', margin: '2px 0 0' }}>Agar GST number hai to ON karein, nahi hai to OFF.</p>
                                    </div>
                                    <label className="bs-switch">
                                        <input type="checkbox" checked={!localSettings.nonGstMode} onChange={(e) => setLocalSettings({ ...localSettings, nonGstMode: !e.target.checked })} />
                                        <span className="bs-slider"></span>
                                    </label>
                                </div>

                                {/* GST Calculation Mode — only shows when GST is ON */}
                                <div className={`bs-collapse ${!localSettings.nonGstMode ? 'open' : ''}`}><div>
                                    <div className="bs-toggle-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                                        <div>
                                            <strong>GST Calculation Mode</strong>
                                            <p style={{ fontSize: '11.5px', color: 'var(--text-faint)', margin: '2px 0 0' }}>Exclusive: price + GST alag. Inclusive: GST price ke andar.</p>
                                        </div>
                                        <div className="bs-segmented" style={{ flexShrink: 0 }}>
                                            <button type="button" className={`bs-seg-btn ${localSettings.taxType !== 'INCLUSIVE' ? 'active' : ''}`} onClick={() => setLocalSettings({ ...localSettings, taxType: 'EXCLUSIVE' })}>Exclusive</button>
                                            <button type="button" className={`bs-seg-btn ${localSettings.taxType === 'INCLUSIVE' ? 'active' : ''}`} onClick={() => setLocalSettings({ ...localSettings, taxType: 'INCLUSIVE' })}>Inclusive</button>
                                        </div>
                                    </div>
                                </div></div>
                            </div>
                        </section>

                        {/* ── FEATURES & MODULES ── */}
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
                                    <span style={{ display: 'none' }}>View</span>
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

                        {/* ── BANK DETAILS ── */}
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

                        {/* ── 4. UPI PAYMENT ── */}
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
                                    <p className="bs-hint">Yeh ID aapke invoices par payment QR code generate karne ke liye upyog hogi.</p>
                                </div>
                            </div>
                        </section>

                        {/* ── 5. BRANDING ── */}
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
                                        <p className="bs-hint" style={{ marginTop: '6px' }}>Recommended: 200×200px. Max: 2MB.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── 6. FEATURES & MODULES ── */}
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

                        {/* ── 7. AUTHORIZED SIGNATORY ── */}
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

                        {/* ── 8. TERMS & CONDITIONS ── */}
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
                                    <p className="bs-hint">Yeh terms aapke har naye bill par apne aap likh kar aa jaayenge.</p>
                                </div>
                            </div>
                        </section>

                        {/* ── 9. DESIGN YOUR INVOICE ── */}
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
                                                    {[{ n: 'Premium Cotton Shirt', q: 2, a: '₹2400' }, { n: 'Office Table Lamp', q: 1, a: '₹850' }].map((r, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid #eee', background: formData.invoice_table_format === 'FORMAT_4' && i % 2 !== 0 ? `${currentTheme.accent}18` : undefined }}>
                                                            <td style={{ padding: '6px 4px', color: '#222' }}>{r.n}</td>
                                                            <td style={{ padding: '6px 4px', textAlign: 'center', color: '#222' }}>{r.q}</td>
                                                            <td style={{ padding: '6px 4px', textAlign: 'right', color: '#222' }}>{r.a}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee', fontSize: '11px' }}>
                                                Grand Total <b style={{ marginLeft: '8px', color: currentTheme.accent }}>₹3,250.00</b>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div></div>
                        </section>

                        {/* ── 10. PREFERENCES ── */}
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
                                        <option value="hi">हिन्दी (Hindi)</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* ── 11. ACCOUNT SECURITY ── */}
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
                                <p className="bs-hint">Apna business profile aur settings yahan se manage karein. Sabhi badlav save karne ke liye neeche 'Save All Settings' button dabayein.</p>
                            </div>
                        </section>
                    </div>

                    {/* ── SAVE BAR ── */}
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
