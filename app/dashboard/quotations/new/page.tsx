'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { generateQuotationPDF } from '@/lib/pdf-generator';
import { FaSave, FaPlus, FaTrash, FaFileInvoice, FaCalculator, FaUser, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaIdCard, FaEnvelope, FaCheckCircle, FaFileAlt, FaEye, FaDownload } from 'react-icons/fa';

export default function NewQuotationPage() {
    const router = useRouter();
    const { addQuotation, businessProfile, products, fetchProducts, fetchQuotations } = useStore() as any;
    
    const generateQuoNumber = () => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        return `QT-${dateStr}-${random}`;
    };

    const [quoNumber] = useState(generateQuoNumber());
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
        fetchProducts();
        fetchQuotations();
        const validDateInit = new Date();
        validDateInit.setDate(validDateInit.getDate() + 30);
        setValidUntil(validDateInit.toISOString().split('T')[0]);
    }, []);

    const addItem = () => {
        setItems([...items, { id: Date.now(), product: '', quantity: 1, rate: 0, gst: 18 }]);
    };

    const removeItem = (id: number) => {
        if (items.length > 1) setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                
                // Auto-fill logic when product name changes
                if (field === 'product' && products) {
                    const found = products.find((p: any) => p.name.toLowerCase() === value.toLowerCase());
                    if (found) {
                        updatedItem.rate = parseFloat(found.price) || 0;
                        updatedItem.gst = parseInt(found.gst_rate) || 18;
                    }
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate * (item.gst / 100)), 0);
    const discountAmt = subtotal * (discountPct / 100);
    const totalAmount = subtotal + taxTotal - discountAmt;

    const handleSave = async (convertToBill = false) => {
        if (!customer) { toast.error('Enter name!'); return; }
        setLoading(true);
        try {
            const quotationData = {
                quotation_number: quoNumber,
                customer_name: customer,
                phone, 
                quotation_date: date, 
                total_amount: totalAmount, subtotal, tax_amount: taxTotal,
                valid_until: validUntil, address, gst_number: gstNumber, email, notes, discount_pct: discountPct,
                items: items.map(it => ({...it, amount: it.quantity * it.rate})).filter(it => it.product && it.quantity > 0)
            };
            const result = await addQuotation(quotationData);
            if (result.success || result.id) {
                toast.success('Saved! ✓');
                router.push(convertToBill ? `/dashboard/invoices/new?quotationId=${result.id || result.data?.id}` : '/dashboard/quotations');
            } else { toast.error('Failed'); }
        } catch (e) { toast.error('Error'); } finally { setLoading(false); }
    };

    const handleDownload = async () => {
        try {
            const quotationData = {
                quotation_number: quoNumber,
                customer: { name: customer, phone, address, gstin: gstNumber },
                invoice_number: quoNumber, invoice_date: date, total_amount: totalAmount, subtotal, notes, discount_pct: discountPct,
                items: items.map(it => ({...it, amount: it.quantity * it.rate, product_name: it.product, unit_price: it.rate, gst_rate: it.gst})).filter(it => it.product && it.quantity > 0),
                type: 'QUOTATION'
            };
            const loadToast = toast.loading('Generating PDF...');
            await generateQuotationPDF(quotationData, businessProfile, true);
            toast.dismiss(loadToast);
            toast.success('Downloaded!');
        } catch (e) { toast.error('Download failed'); }
    };

    const handlePreview = async () => {
        if (!customer) { toast.error('Enter name'); return; }
        try {
            const quotationData = {
                quotation_number: quoNumber,
                customer: { name: customer, phone, address, gstin: gstNumber },
                invoice_number: quoNumber, invoice_date: date, total_amount: totalAmount, subtotal, notes, discount_pct: discountPct,
                items: items.map(it => ({...it, amount: it.quantity * it.rate, product_name: it.product, unit_price: it.rate, gst_rate: it.gst})).filter(it => it.product && it.quantity > 0),
                type: 'QUOTATION'
            };
            const doc = await generateQuotationPDF(quotationData, businessProfile, false);
            if (doc) {
                window.open(URL.createObjectURL(doc.output('blob')), '_blank');
                toast.success('Ready!');
            }
        } catch (e) { toast.error('Failed'); }
    };

    return (
        <div className="quo-wrapper">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                
                :root {
                    --bg: #f0f2f8; --white: #fff; --ink: #0c0e1a; --ink2: #2c3050; --ink3: #6b718f; --ink4: #a8adc4;
                    --border: #e2e5f0; --green: #00b37e; --blue: #2f6ff5; --indigo: #4338ca; --red: #f03e3e;
                }

                .quo-wrapper {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    background: var(--bg); min-height: 100vh; margin: -2rem; padding: 20px; color: var(--ink);
                }

                .quo-card {
                    max-width: 850px; margin: 0 auto; background: var(--white);
                    border-radius: 24px; box-shadow: 0 12px 40px rgba(12,14,26,0.1);
                    border: 1px solid var(--border); overflow: hidden;
                }

                .quo-head {
                    background: linear-gradient(135deg, #0f1235 0%, #1e2460 100%);
                    padding: 30px; color: white; display: flex; justify-content: space-between; align-items: center;
                }
                .quo-head h1 { font-size: 24px; font-weight: 800; margin: 0; }
                .quo-id-pill { background: rgba(255,255,255,0.1); padding: 6px 14px; border-radius: 10px; font-family: 'DM Mono', monospace; font-size: 13px; }

                .quo-main { padding: 30px; }
                .sec-title { font-size: 13px; font-weight: 700; color: var(--ink4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; display: block; }

                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
                .input-box { display: flex; flex-direction: column; gap: 6px; }
                .label { font-size: 12px; font-weight: 700; color: var(--ink2); }
                .input { 
                    background: #f8fafc; border: 1.5px solid var(--border); border-radius: 12px;
                    padding: 12px 16px; font-size: 14px; color: #000 !important; font-weight: 500;
                    -webkit-text-fill-color: #000 !important;
                }
                .input:focus { border-color: var(--indigo); outline: none; background: white; }

                .product-list { display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px; }
                .product-item {
                    background: #f8fafc; border: 1px solid var(--border); border-radius: 18px;
                    padding: 15px; display: flex; flex-direction: column; gap: 12px;
                }
                .row-top { width: 100%; }
                .row-bottom { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; align-items: center; }
                
                .row-input { 
                    background: white; border: 1px solid var(--border); border-radius: 10px; 
                    padding: 10px; font-size: 14px; color: #000 !important; font-weight: 600; 
                    width: 100%; -webkit-text-fill-color: #000 !important; height: 44px;
                }
                .row-input::placeholder { opacity: 0.5; color: var(--ink4); font-weight: 400; }
                .row-label { font-size: 11px; font-weight: 700; color: var(--ink2); text-transform: uppercase; margin-bottom: 6px; display: block; letter-spacing: 0.5px; }

                .btn-add {
                    width: 100%; padding: 15px; border: 2px dashed var(--border);
                    background: none; border-radius: 16px; color: var(--indigo); font-weight: 700; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                }

                .summary-grid { display: grid; grid-template-columns: 1fr 320px; gap: 30px; margin-top: 30px; }
                .total-box { background: var(--ink); color: white; border-radius: 20px; padding: 25px; }
                .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: var(--ink4); }
                .grand-total { border-top: 1px solid rgba(255,255,255,0.1); margin-top: 15px; padding-top: 15px; font-size: 22px; font-weight: 800; color: var(--green); }

                .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 40px; }
                .btn-act { padding: 14px 28px; border-radius: 14px; font-size: 14px; font-weight: 700; cursor: pointer; border: none; display: flex; align-items: center; gap: 8px; }
                .btn-p { background: var(--bg); color: var(--ink); }
                .btn-b { background: var(--ink); color: white; }
                .btn-s { background: var(--indigo); color: white; }

                @media (max-width: 600px) { 
                    .form-grid, .summary-grid { grid-template-columns: 1fr; } 
                    .row-bottom { grid-template-columns: 1fr 1fr; }
                    .actions { flex-direction: column; } .btn-act { width: 100%; justify-content: center; } 
                }
            ` }} />

            <div className="quo-card">
                <div className="quo-head">
                    <h1>New Quotation</h1>
                    <div className="quo-id-pill">{quoNumber}</div>
                </div>

                <div className="quo-main">
                    <span className="sec-title">Customer Info</span>
                    <div className="form-grid">
                        <div className="input-box"><label className="label">Name</label><input className="input" placeholder="Name" value={customer} onChange={e=>setCustomer(e.target.value)}/></div>
                        <div className="input-box"><label className="label">Phone</label><input className="input" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
                        <div className="input-box"><label className="label">Address</label><input className="input" style={{gridColumn:'1/-1'}} placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)}/></div>
                        <div className="input-box"><label className="label">GSTIN</label><input className="input" placeholder="GST Number" value={gstNumber} onChange={e=>setGstNumber(e.target.value)}/></div>
                        <div className="input-box"><label className="label">Date</label><input type="date" className="input" value={date} onChange={e=>setDate(e.target.value)}/></div>
                    </div>

                    <span className="sec-title">Products</span>
                    <div className="product-list">
                        {items.map(item => (
                            <div key={item.id} className="product-item">
                                <div className="row-top">
                                    <label className="row-label">Item Name</label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input 
                                            className="row-input" 
                                            style={{ flex: 1 }} 
                                            list="product-suggestions"
                                            placeholder="What are you selling?" 
                                            value={item.product} 
                                            onChange={e => updateItem(item.id, 'product', e.target.value)} 
                                        />
                                        <datalist id="product-suggestions">
                                            {products && products.map((p: any) => (
                                                <option key={p.id} value={p.name} />
                                            ))}
                                        </datalist>
                                        <button style={{ border: 'none', background: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => removeItem(item.id)}><FaTrash /></button>
                                    </div>
                                </div>
                                <div className="row-bottom">
                                    <div>
                                        <label className="row-label">Qty</label>
                                        <input type="number" className="row-input" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div>
                                        <label className="row-label">Price</label>
                                        <input type="number" className="row-input" value={item.rate} onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div>
                                        <label className="row-label">GST %</label>
                                        <select className="row-input" value={item.gst} onChange={e => updateItem(item.id, 'gst', parseInt(e.target.value))}>
                                            {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="row-label">Total</label>
                                        <div style={{ height: '44px', display: 'flex', alignItems: 'center', fontWeight: '700', fontSize: '14px', background: '#f1f5f9', borderRadius: '10px', padding: '0 10px' }}>
                                            ₹{(item.quantity * item.rate).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="btn-add" onClick={addItem}><FaPlus /> Add New Item</button>
                    </div>

                    <div className="summary-grid">
                        <div className="input-box">
                            <label className="label">Notes</label>
                            <textarea className="input" style={{ height: 100, resize: 'none' }} placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)} />
                            <div style={{ marginTop: 15 }}><label className="label">Discount %</label><input type="number" className="input" style={{ width: 100, marginTop: 5 }} value={discountPct} onChange={e => setDiscountPct(parseFloat(e.target.value) || 0)} /></div>
                        </div>
                        <div className="total-box">
                            <div className="total-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                            <div className="total-row"><span>GST</span><span>₹{taxTotal.toLocaleString('en-IN')}</span></div>
                            {discountAmt > 0 && <div className="total-row"><span>Discount</span><span style={{ color: 'var(--red)' }}>-₹{discountAmt.toLocaleString('en-IN')}</span></div>}
                            <div className="total-row grand-total"><span>Total</span><span>₹{totalAmount.toLocaleString('en-IN')}</span></div>
                        </div>
                    </div>

                    <div className="actions">
                        <button className="btn-act btn-p" onClick={handlePreview}><FaEye /> Preview</button>
                        <button className="btn-act btn-b" style={{ background: '#f8fafc', color: 'var(--ink)' }} onClick={handleDownload}><FaDownload /> PDF</button>
                        <button className="btn-act btn-b" onClick={() => handleSave(true)} disabled={loading}><FaFileInvoice /> {loading ? 'Wait' : 'Make Bill'}</button>
                        <button className="btn-act btn-s" onClick={() => handleSave(false)} disabled={loading}><FaCheckCircle /> {loading ? 'Wait' : 'Save'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
