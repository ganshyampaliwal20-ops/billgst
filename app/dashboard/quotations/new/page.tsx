'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { generateQuotationPDF } from '@/lib/pdf-generator';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaFileInvoice, FaCalculator, FaUser, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaIdCard, FaEnvelope, FaCheckCircle, FaTimes, FaCog, FaBars, FaFileAlt, FaEye } from 'react-icons/fa';

export default function NewQuotationPage() {
    const router = useRouter();
    const { addQuotation, businessProfile } = useStore();
    
    // Generate unique quotation number
    const generateQuoNumber = () => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        return `QT-${dateStr}-${random}`;
    };

    const [quoNumber] = useState(generateQuoNumber());
    
    // Form States
    const [customer, setCustomer] = useState('');
    const [phone, setPhone] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [validUntil, setValidUntil] = useState('');
    const [address, setAddress] = useState('');
    const [gstNumber, setGstNumber] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');
    
    const [discountPct, setDiscountPct] = useState(0);

    const [items, setItems] = useState([
        { id: Date.now(), product: '', quantity: 1, rate: 0, gst: 18 }
    ]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const validDateInit = new Date();
        validDateInit.setDate(validDateInit.getDate() + 30);
        setValidUntil(validDateInit.toISOString().split('T')[0]);
    }, []);

    const addItem = () => {
        setItems([...items, { id: Date.now(), product: '', quantity: 1, rate: 0, gst: 18 }]);
    };

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        } else {
            toast.error("At least one item is required");
        }
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    // Calculations
    let subtotal = 0;
    let taxTotal = 0;
    
    items.forEach(r => {
        const base = r.quantity * r.rate;
        subtotal += base;
        taxTotal += base * (r.gst / 100);
    });
    
    const discountAmt = subtotal * (discountPct / 100);
    const totalAmount = subtotal - discountAmt + taxTotal;

    const handleSave = async (convertToBill = false) => {
        if (!customer) {
            toast.error('Please enter customer name');
            return;
        }

        setLoading(true);
        try {
            const itemsWithAmount = items.map(item => ({
                ...item,
                amount: item.quantity * item.rate
            }));

            const quotationData = {
                quotation_number: quoNumber,
                customer_name: customer,
                quotation_date: date,
                total_amount: totalAmount,
                phone: phone,
                valid_until: validUntil,
                address: address,
                gst_number: gstNumber,
                email: email,
                notes: notes,
                discount_pct: discountPct,
                items: itemsWithAmount.filter(item => item.product && item.quantity > 0)
            };

            const result = await addQuotation(quotationData);
            if (result.success || result.id) {
                toast.success('Quotation saved successfully! ✓');
                if (convertToBill) {
                    router.push(`/dashboard/invoices/new?quotationId=${result.id || result.data?.id}`);
                } else {
                    router.push('/dashboard/quotations');
                }
            } else {
                toast.error(`Failed to save: ${result.error || 'Unknown Error'}`);
            }
        } catch (e: any) {
            toast.error(`Client Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        if (!customer) {
            toast.error('Please enter customer name to preview');
            return;
        }

        try {
            const itemsWithAmount = items.map(item => ({
                ...item,
                amount: item.quantity * item.rate,
                product_name: item.product,
                unit_price: item.rate,
                gst_rate: item.gst
            }));

            const quotationData = {
                quotation_number: quoNumber,
                customer: { 
                    name: customer, 
                    phone: phone, 
                    address: address,
                    gstin: gstNumber 
                },
                invoice_number: quoNumber, // pdf generator uses invoice_number label
                invoice_date: date,
                total_amount: totalAmount,
                subtotal: subtotal,
                notes: notes,
                discount_pct: discountPct,
                items: itemsWithAmount.filter(item => item.product && item.quantity > 0),
                type: 'QUOTATION'
            };

            const doc = await generateQuotationPDF(quotationData, businessProfile, false);
            if (doc) {
                const pdfBlob = doc.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, '_blank');
                toast.success('Preview generated! ✓');
            }
        } catch (e) {
            toast.error('Failed to generate preview');
            console.error(e);
        }
    };

    return (
        <div className="quotation-premium-wrapper">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * { box-sizing: border-box; }
                
                input, select, textarea {
                    color: #000000 !important;
                    -webkit-text-fill-color: #000000 !important;
                    opacity: 1 !important;
                }

                .quotation-premium-wrapper {
                    font-family: 'Inter', sans-serif;
                    background: #f1f5f9;
                    min-height: 100vh;
                    padding: 0;
                    margin: -2rem; /* Negate default dashboard padding */
                    color: #1e293b;
                    overflow-x: hidden;
                }
                
                .quotation-container {
                    max-width: 1000px;
                    width: 100%;
                    margin: 0 auto;
                    background: white;
                    min-height: 100vh;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                    position: relative;
                }
                
                /* Header */
                .p-header {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    padding: 20px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .p-logo-area {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .p-logo-box {
                    width: 45px;
                    height: 45px;
                    background: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    color: #4f46e5;
                    font-size: 18px;
                }
                
                .p-header-title { font-size: 22px; font-weight: 700; }
                .p-header-sub { font-size: 12px; opacity: 0.8; }
                
                /* Nav Bar */
                .p-nav {
                    background: #f8fafc;
                    padding: 15px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e2e8f0;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                
                .p-nav-left { display: flex; align-items: center; gap: 20px; }
                .p-back-link { 
                    display: flex; align-items: center; gap: 8px; 
                    color: #64748b; font-weight: 600; font-size: 14px; cursor: pointer;
                }
                .p-back-link:hover { color: #4f46e5; }
                .p-page-title { font-size: 18px; font-weight: 700; color: #0f172a; }
                
                .p-nav-right { display: flex; gap: 12px; }
                
                .p-btn {
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .p-btn-cancel { background: #f1f5f9; color: #64748b; }
                .p-btn-cancel:hover { background: #e2e8f0; }
                
                .p-btn-save { 
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
                    color: white; 
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
                }
                .p-btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(79, 70, 229, 0.3); }
                
                /* Content */
                .p-content { padding: 40px; }
                
                .p-info-card {
                    background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
                    border-radius: 20px;
                    padding: 25px;
                    margin-bottom: 35px;
                    border: 1px solid #e0e7ff;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                
                .p-info-icon {
                    width: 55px; height: 55px;
                    background: white;
                    border-radius: 15px;
                    display: flex; align-items: center; justify-content: center;
                    color: #4f46e5; font-size: 22px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                
                .p-info-details h3 { font-size: 18px; color: #1e1b4b; font-weight: 700; margin-bottom: 4px; }
                .p-info-details p { color: #64748b; font-size: 13px; }
                
                .p-status-badge {
                    margin-left: auto;
                    background: #dcfce7;
                    color: #15803d;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                /* Sections */
                .p-section { margin-bottom: 40px; }
                .p-section-header {
                    display: flex; align-items: center; gap: 12px; margin-bottom: 25px;
                }
                .p-section-icon {
                    width: 38px; height: 38px;
                    background: #f1f5f9;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    color: #4f46e5; font-size: 16px;
                }
                .p-section-title { font-size: 15px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 1px; }
                
                /* Forms */
                .p-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
                .p-field { display: flex; flex-direction: column; gap: 8px; }
                .p-label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
                .p-label span { color: #ef4444; }
                
                .p-input-wrapper { position: relative; }
                .p-input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 14px; }
                .p-input {
                    width: 100%;
                    padding: 12px 16px 12px 45px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 16px;
                    background: #ffffff !important;
                    transition: all 0.2s;
                    color: #000000 !important;
                    -webkit-text-fill-color: #000000 !important;
                    font-weight: 600;
                }
                .p-input:focus {
                    outline: none;
                    border-color: #4f46e5;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
                }
                
                /* Items Table */
                .p-items-box {
                    background: #f8fafc;
                    border-radius: 20px;
                    padding: 5px;
                    border: 1px solid #e2e8f0;
                }
                .p-table { width: 100%; border-collapse: collapse; }
                .p-table th {
                    text-align: left; padding: 15px 20px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;
                }
                .p-table td { padding: 10px 20px; }
                
                .p-row-input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 14px;
                    background: #ffffff !important;
                    color: #000000 !important;
                    -webkit-text-fill-color: #000000 !important;
                    font-weight: 700;
                    display: block;
                    line-height: 1.4;
                    height: 40px;
                }
                
                /* Specific fix for number inputs */
                input[type=number].p-row-input {
                    text-align: center;
                    padding-right: 2px;
                }
                .p-row-input:focus { outline: none; border-color: #4f46e5; }
                
                .p-btn-del {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    background: #fee2e2;
                    color: #ef4444;
                    border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .p-btn-del:hover { background: #ef4444; color: white; }
                
                .p-add-row-bar {
                    padding: 20px;
                    display: flex; justify-content: center;
                }
                .p-btn-add {
                    background: white;
                    color: #4f46e5;
                    padding: 10px 24px;
                    border-radius: 12px;
                    border: 2px dashed #4f46e5;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex; align-items: center; gap: 10px;
                    transition: all 0.2s;
                }
                .p-btn-add:hover { background: #f5f3ff; transform: scale(1.02); }
                
                /* Summary */
                .p-summary-grid {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 30px;
                }
                
                .p-notes-box {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    padding: 20px;
                }
                .p-notes-area {
                    width: 100%; height: 120px;
                    border: none; resize: none;
                    font-size: 14px; color: #000 !important;
                    font-weight: 500;
                }
                .p-notes-area:focus { outline: none; }
                
                .p-total-card {
                    background: #1e293b;
                    color: white;
                    border-radius: 24px;
                    padding: 30px;
                    box-shadow: 0 15px 30px -10px rgba(0,0,0,0.2);
                }
                .p-sum-row {
                    display: flex; justify-content: space-between;
                    padding: 10px 0;
                    font-size: 14px;
                    color: #94a3b8;
                }
                .p-sum-row span:last-child { color: white; font-weight: 600; }
                .p-sum-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 15px 0; }
                .p-total-row {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-top: 10px;
                }
                .p-total-label { font-size: 16px; font-weight: 700; }
                .p-total-val { font-size: 28px; font-weight: 800; color: #4ade80; }
                
                /* Bottom Actions */
                .p-footer {
                    margin-top: 50px;
                    padding-top: 30px;
                    border-top: 1px solid #e2e8f0;
                    display: flex; justify-content: flex-end; gap: 15px;
                }
                
                .p-btn-bill {
                    background: #0f172a;
                    color: white;
                    padding: 15px 30px;
                    border-radius: 12px;
                    font-weight: 700;
                }
                .p-btn-bill:hover { background: black; transform: translateY(-2px); }
                
                .p-btn-main {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 15px 40px;
                    border-radius: 12px;
                    font-weight: 700;
                    box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
                }
                .p-btn-main:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(16, 185, 129, 0.5); }
                
                .p-btn-preview {
                    background: #f8fafc;
                    color: #4f46e5;
                    padding: 15px 30px;
                    border-radius: 12px;
                    font-weight: 700;
                    border: 1px solid #e2e8f0;
                }
                .p-btn-preview:hover { background: #f1f5f9; border-color: #4f46e5; }
                
                @media (max-width: 768px) {
                    .quotation-premium-wrapper { padding: 10px 15px; }
                    .p-grid { grid-template-columns: 1fr; gap: 20px; }
                    .p-summary-grid { grid-template-columns: 1fr; }
                    .p-header, .p-nav, .p-content { padding: 30px 20px; }
                    .p-logo-area { padding-left: 5px; }
                    .p-nav-left { padding-left: 5px; }
                    .p-nav-right { width: 100%; justify-content: space-between; margin-top: 15px; }
                    .p-btn { padding: 10px 16px; font-size: 13px; }
                    .p-info-card { padding: 20px; gap: 15px; }
                    .p-section-header { margin-bottom: 15px; padding: 0 5px; }
                    .p-field { padding: 0 5px; }
                    .p-label { padding-left: 5px; padding-bottom: 5px; }
                    .p-add-row-bar { padding: 10px 5px; }
                    .p-btn-add { padding: 12px 20px; margin: 0 5px; }
                    .p-footer { padding: 20px 0; flex-direction: column; gap: 12px; }
                    .p-btn-bill, .p-btn-main { width: 100%; justify-content: center; }
                    
                    /* Make table columns wider on mobile for better input size */
                    .p-table th, .p-table td { 
                        min-width: 90px; 
                        padding: 10px 5px; 
                    }
                    .p-table th:first-child, .p-table td:first-child { min-width: 40px; }
                    .p-table th:nth-child(2), .p-table td:nth-child(2) { min-width: 180px; }
                    .p-table th:nth-child(3), .p-table td:nth-child(3) { min-width: 60px; } /* Qty smaller on mobile */
                    
                    .p-row-input {
                        padding: 10px 8px;
                        font-size: 14px;
                        height: 42px;
                    }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .p-section { animation: slideUp 0.5s ease backwards; }
                .p-section:nth-child(1) { animation-delay: 0.1s; }
                .p-section:nth-child(2) { animation-delay: 0.2s; }
                .p-section:nth-child(3) { animation-delay: 0.3s; }
                .p-section:nth-child(4) { animation-delay: 0.4s; }
                `
            }} />

            <div className="quotation-container">
                {/* Header */}
                <div className="p-header">
                    <div className="p-logo-area">
                        <div className="p-logo-box">BG</div>
                        <div>
                            <div className="p-header-title">BillGST</div>
                            <div className="p-header-sub">Advanced Invoicing Solutions</div>
                        </div>
                    </div>
                    <div className="p-nav-right" style={{ color: 'white' }}>
                        <FaCog style={{ cursor: 'pointer', fontSize: '18px' }} />
                        <FaBars style={{ cursor: 'pointer', fontSize: '18px', marginLeft: '15px' }} />
                    </div>
                </div>

                {/* Nav Bar */}
                <div className="p-nav">
                    <div className="p-nav-left">
                        <div className="p-back-link" onClick={() => router.back()}>
                            <FaArrowLeft /> Back
                        </div>
                        <h1 className="p-page-title">New Quotation</h1>
                    </div>
                    <div className="p-nav-right">
                        <button className="p-btn p-btn-cancel" onClick={() => router.push('/dashboard/quotations')}>
                            <FaTimes /> Cancel
                        </button>
                        <button className="p-btn p-btn-save" onClick={() => handleSave(false)} disabled={loading}>
                            <FaSave /> {loading ? 'Saving...' : 'Save Quotation'}
                        </button>
                    </div>
                </div>

                <div className="p-content">
                    {/* Quotation Info */}
                    <div className="p-section">
                        <div className="p-info-card">
                            <div className="p-info-icon">
                                <FaFileAlt />
                            </div>
                            <div className="p-info-details">
                                <h3>{quoNumber}</h3>
                                <p>Quotation Number • System Generated</p>
                            </div>
                            <div className="p-status-badge">Draft Mode</div>
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="p-section">
                        <div className="p-section-header">
                            <div className="p-section-icon"><FaUser /></div>
                            <h2 className="p-section-title">Customer Information</h2>
                        </div>
                        
                        <div className="p-grid">
                            <div className="p-field">
                                <label className="p-label">Customer Name <span>*</span></label>
                                <div className="p-input-wrapper">
                                    <FaUser className="p-input-icon" />
                                    <input 
                                        type="text" 
                                        className="p-input" 
                                        placeholder="Enter customer name" 
                                        value={customer} 
                                        onChange={(e) => setCustomer(e.target.value)} 
                                    />
                                </div>
                            </div>
                            
                            <div className="p-field">
                                <label className="p-label">Phone Number</label>
                                <div className="p-input-wrapper">
                                    <FaPhone className="p-input-icon" />
                                    <input 
                                        type="tel" 
                                        className="p-input" 
                                        placeholder="e.g. 9876543210" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                    />
                                </div>
                            </div>
                            
                            <div className="p-field">
                                <label className="p-label">Quotation Date <span>*</span></label>
                                <div className="p-input-wrapper">
                                    <FaCalendarAlt className="p-input-icon" />
                                    <input 
                                        type="date" 
                                        className="p-input" 
                                        value={date} 
                                        onChange={(e) => setDate(e.target.value)} 
                                    />
                                </div>
                            </div>
                            
                            <div className="p-field">
                                <label className="p-label">Valid Until</label>
                                <div className="p-input-wrapper">
                                    <FaCalendarAlt className="p-input-icon" />
                                    <input 
                                        type="date" 
                                        className="p-input" 
                                        value={validUntil} 
                                        onChange={(e) => setValidUntil(e.target.value)} 
                                    />
                                </div>
                            </div>
                            
                            <div className="p-field" style={{ gridColumn: '1/-1' }}>
                                <label className="p-label">Customer Address</label>
                                <div className="p-input-wrapper">
                                    <FaMapMarkerAlt className="p-input-icon" />
                                    <input 
                                        type="text" 
                                        className="p-input" 
                                        placeholder="Enter full address" 
                                        value={address} 
                                        onChange={(e) => setAddress(e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="p-field">
                                <label className="p-label">GST Number</label>
                                <div className="p-input-wrapper">
                                    <FaIdCard className="p-input-icon" />
                                    <input 
                                        type="text" 
                                        className="p-input" 
                                        placeholder="e.g. 22AAAAA0000A1Z5" 
                                        value={gstNumber} 
                                        onChange={(e) => setGstNumber(e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="p-field">
                                <label className="p-label">Email Address</label>
                                <div className="p-input-wrapper">
                                    <FaEnvelope className="p-input-icon" />
                                    <input 
                                        type="email" 
                                        className="p-input" 
                                        placeholder="customer@email.com" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="p-section">
                        <div className="p-section-header">
                            <div className="p-section-icon"><FaPlus /></div>
                            <h2 className="p-section-title">Products & Services</h2>
                        </div>

                        <div className="p-items-box">
                            <div style={{ overflowX: 'auto' }}>
                                <table className="p-table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th style={{ width: '100px' }}>Qty</th>
                                            <th style={{ width: '160px' }}>Rate</th>
                                            <th style={{ width: '120px' }}>GST %</th>
                                            <th style={{ width: '140px' }}>Amount</th>
                                            <th style={{ width: '50px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <input 
                                                        className="p-row-input" 
                                                        placeholder="Item description" 
                                                        value={item.product} 
                                                        onChange={(e) => updateItem(item.id, 'product', e.target.value)} 
                                                    />
                                                </td>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        className="p-row-input" 
                                                        value={item.quantity} 
                                                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} 
                                                    />
                                                </td>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        className="p-row-input" 
                                                        value={item.rate} 
                                                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} 
                                                    />
                                                </td>
                                                <td>
                                                    <select 
                                                        className="p-row-input" 
                                                        value={item.gst} 
                                                        onChange={(e) => updateItem(item.id, 'gst', parseInt(e.target.value))}
                                                    >
                                                        {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}
                                                    </select>
                                                </td>
                                                <td style={{ fontWeight: '700', color: '#1e293b' }}>
                                                    ₹{(item.quantity * item.rate).toLocaleString('en-IN')}
                                                </td>
                                                <td>
                                                    <button className="p-btn-del" onClick={() => removeItem(item.id)}>
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-add-row-bar">
                                <button className="p-btn-add" onClick={addItem}>
                                    <FaPlus /> Add New Item
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="p-section">
                        <div className="p-section-header">
                            <div className="p-section-icon"><FaCalculator /></div>
                            <h2 className="p-section-title">Summary & Total</h2>
                        </div>

                        <div className="p-summary-grid">
                            <div className="p-notes-box">
                                <label className="p-label" style={{ marginBottom: '10px', display: 'block' }}>Notes & Terms</label>
                                <textarea 
                                    className="p-notes-area" 
                                    placeholder="Add payment terms, delivery notes, etc..." 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                                
                                <div style={{ marginTop: '20px' }}>
                                    <label className="p-label" style={{ marginBottom: '10px', display: 'block' }}>Discount Percentage</label>
                                    <input 
                                        type="number" 
                                        className="p-row-input" 
                                        style={{ width: '100px' }} 
                                        value={discountPct} 
                                        onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)} 
                                    />
                                </div>
                            </div>

                            <div className="p-total-card">
                                <div className="p-sum-row">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="p-sum-row">
                                    <span>{`CGST (${taxTotal > 0 ? (taxTotal / (subtotal || 1) * 50).toFixed(1) : '9'}%)`}</span>
                                    <span>₹{(taxTotal / 2).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="p-sum-row">
                                    <span>{`SGST (${taxTotal > 0 ? (taxTotal / (subtotal || 1) * 50).toFixed(1) : '9'}%)`}</span>
                                    <span>₹{(taxTotal / 2).toLocaleString('en-IN')}</span>
                                </div>
                                {discountAmt > 0 && (
                                    <div className="p-sum-row">
                                        <span>Discount ({discountPct}%)</span>
                                        <span style={{ color: '#ef4444' }}>- ₹{discountAmt.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="p-sum-divider"></div>
                                <div className="p-total-row">
                                    <span className="p-total-label">Total Amount</span>
                                    <span className="p-total-val">₹{totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-footer">
                        <button className="p-btn p-btn-preview" onClick={handlePreview}>
                            <FaEye /> Preview PDF
                        </button>
                        <button className="p-btn p-btn-bill" onClick={() => handleSave(true)} disabled={loading}>
                            <FaFileInvoice /> {loading ? 'Processing...' : 'Create & To Bill'}
                        </button>
                        <button className="p-btn p-btn-main" onClick={() => handleSave(false)} disabled={loading}>
                            <FaCheckCircle /> {loading ? 'Saving...' : 'Create Quotation'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
