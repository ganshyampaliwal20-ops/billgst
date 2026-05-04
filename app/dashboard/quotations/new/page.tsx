'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { generateQuotationPDF } from '@/lib/pdf-generator';

export default function NewQuotationPage() {
    const router = useRouter();
    const { addQuotation, businessProfile } = useStore();
    
    // Generate unique quotation number using timestamp to avoid duplicates
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
    const [notes, setNotes] = useState('');
    
    const [defaultGst, setDefaultGst] = useState(18);
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
        setItems([...items, { id: Date.now(), product: '', quantity: 1, rate: 0, gst: defaultGst }]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
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

    const formatNum = (n: number) => {
        return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleSave = async () => {
        if (!customer) {
            toast.error('Please enter customer name');
            const custInput = document.getElementById('custName');
            if (custInput) {
                custInput.focus();
                custInput.style.borderColor = 'var(--red)';
                setTimeout(() => custInput.style.borderColor = '', 2000);
            }
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
                notes: notes,
                discount_pct: discountPct,
                items: itemsWithAmount.filter(item => item.product && item.quantity > 0)
            };

            const result = await addQuotation(quotationData);
            if (result.success) {
                toast.success('Quotation saved successfully! ✓');
                router.push('/dashboard/quotations');
            } else {
                alert(`Failed to save: ${result.error || 'Unknown Error'}`);
            }
        } catch (e: any) {
            alert(`Client Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewPDF = async () => {
        const itemsWithAmount = items.map(item => ({
            ...item,
            amount: item.quantity * item.rate,
            product_name: item.product,
            unit_price: item.rate
        }));

        const quotationData = {
            invoice_number: quoNumber,
            customer: { name: customer, phone: phone, address: address },
            invoice_date: date,
            subtotal: subtotal,
            total_amount: totalAmount,
            notes: notes,
            items: itemsWithAmount.filter(item => item.product && item.quantity > 0)
        };

        const doc = await generateQuotationPDF(quotationData, businessProfile, false);
        if (doc) {
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
        } else {
            toast.error('Failed to generate PDF preview');
        }
    };

    return (
        <div className="quotation-page-wrapper">
            <style dangerouslySetInnerHTML={{
                __html: `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Mono:wght@400;500&display=swap');

.quotation-page-wrapper {
  --cream:    #faf8f4;
  --cream2:   #f3f0ea;
  --cream3:   #e8e3d8;
  --ink:      #1a1612;
  --ink2:     #4a4540;
  --ink3:     #9a9088;
  --blue:     #1a3fff;
  --blue-lt:  #eef1ff;
  --blue-mid: #dde3ff;
  --green:    #00875a;
  --green-lt: #e6f5ef;
  --red:      #d63031;
  --gold:     #c8960c;
  --gold-lt:  #fff8e6;
  --border:   #ddd8ce;
  --shadow:   0 2px 12px rgba(26,22,18,0.06);
  --shadow-lg:0 12px 48px rgba(26,22,18,0.12);
  --radius:   12px;

  font-family: 'Bricolage Grotesque', sans-serif;
  background: var(--cream);
  min-height: 100vh;
  color: var(--ink);
  margin: -2rem; /* Negate the dashboard padding if needed */
}

/* ── TOP NAV ── */
.quotation-page-wrapper .topbar {
  background: var(--ink);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 28px;
  height: 60px;
  position: sticky; top: 0; z-index: 100;
}
.quotation-page-wrapper .topbar-left { display: flex; align-items: center; gap: 16px; }
.quotation-page-wrapper .back-btn {
  display: flex; align-items: center; gap: 6px;
  color: rgba(255,255,255,0.6);
  font-size: 14px; font-weight: 500;
  cursor: pointer; text-decoration: none;
  transition: color .15s;
  background: none; border: none;
}
.quotation-page-wrapper .back-btn:hover { color: #fff; }
.quotation-page-wrapper .back-btn svg { width: 18px; height: 18px; }
.quotation-page-wrapper .topbar-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.1); }
.quotation-page-wrapper .topbar-title {
  font-family: 'Instrument Serif', serif;
  font-size: 20px; color: #fff; letter-spacing: -0.3px; line-height: 1;
}
.quotation-page-wrapper .topbar-sub { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 400; margin-top: 2px; }
.quotation-page-wrapper .topbar-right { display: flex; align-items: center; gap: 12px; }

.quotation-page-wrapper .btn-ghost {
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all .15s;
}
.quotation-page-wrapper .btn-ghost:hover { background: rgba(255,255,255,0.1); color: #fff; }

.quotation-page-wrapper .btn-save-main {
  padding: 9px 20px;
  border-radius: 8px;
  background: var(--blue);
  border: none;
  color: #fff;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px; font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 16px rgba(26,63,255,0.4);
  transition: all .18s;
}
.quotation-page-wrapper .btn-save-main:hover { background: #0d2fe8; transform: translateY(-1px); }
.quotation-page-wrapper .btn-save-main svg { width: 16px; height: 16px; }

/* ── MAIN LAYOUT ── */
.quotation-page-wrapper .main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

/* ── LEFT COLUMN ── */
.quotation-page-wrapper .left-col { display: flex; flex-direction: column; gap: 20px; }

/* ── CARD ── */
.quotation-page-wrapper .card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
  animation: fadeUp .4s ease both;
}
.quotation-page-wrapper .card:nth-child(1){animation-delay:.04s}
.quotation-page-wrapper .card:nth-child(2){animation-delay:.1s}
.quotation-page-wrapper .card:nth-child(3){animation-delay:.16s}

@keyframes fadeUp {
  from{opacity:0;transform:translateY(16px);}
  to  {opacity:1;transform:translateY(0);}
}

.quotation-page-wrapper .card-header {
  padding: 16px 20px 14px;
  border-bottom: 1px solid var(--cream2);
  display: flex; align-items: center; justify-content: space-between;
}
.quotation-page-wrapper .card-header-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; font-weight: 700; color: var(--ink);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.quotation-page-wrapper .card-header-icon {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.quotation-page-wrapper .card-header-icon svg { width: 14px; height: 14px; }
.quotation-page-wrapper .card-body { padding: 20px; }

/* ── FORM GRID ── */
.quotation-page-wrapper .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.quotation-page-wrapper .field { display: flex; flex-direction: column; gap: 6px; }
.quotation-page-wrapper .field label {
  font-size: 12px; font-weight: 600;
  color: var(--ink3); text-transform: uppercase; letter-spacing: 0.6px;
}
.quotation-page-wrapper .field label .req { color: var(--blue); }

.quotation-page-wrapper .field input,
.quotation-page-wrapper .field select,
.quotation-page-wrapper .field textarea {
  background: var(--cream);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px; color: var(--ink);
  outline: none; width: 100%;
  transition: border-color .18s, box-shadow .18s, background .18s;
}
.quotation-page-wrapper .field input:focus,
.quotation-page-wrapper .field select:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(26,63,255,0.08);
  background: var(--blue-lt);
}
.quotation-page-wrapper .field input::placeholder { color: var(--ink3); }
.quotation-page-wrapper .field select {
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='7' viewBox='0 0 12 7' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239a9088' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

/* ── QUOTATION NUMBER BADGE ── */
.quotation-page-wrapper .quot-meta {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px;
  background: var(--blue-lt);
  border-bottom: 1px solid var(--blue-mid);
}
.quotation-page-wrapper .quot-num {
  font-family: 'DM Mono', monospace;
  font-size: 13px; color: var(--blue); font-weight: 500;
  background: var(--blue-mid); padding: 4px 12px; border-radius: 99px;
  letter-spacing: 0.5px;
}
.quotation-page-wrapper .quot-date-info { font-size: 13px; color: var(--ink3); }

/* ── ITEMS TABLE ── */
.quotation-page-wrapper .items-table { width: 100%; border-collapse: collapse; }
.quotation-page-wrapper .items-table thead tr {
  background: var(--cream2);
}
.quotation-page-wrapper .items-table th {
  padding: 12px 14px;
  text-align: left;
  font-size: 11px; font-weight: 700;
  color: var(--ink3); text-transform: uppercase; letter-spacing: 0.7px;
  border-bottom: 1px solid var(--border);
}
.quotation-page-wrapper .items-table th.right { text-align: right; }
.quotation-page-wrapper .items-table th.center { text-align: center; }
.quotation-page-wrapper .items-table tbody tr {
  border-bottom: 1px solid var(--cream2);
  transition: background .12s;
}
.quotation-page-wrapper .items-table tbody tr:hover { background: var(--cream); }
.quotation-page-wrapper .items-table tbody tr:last-child { border-bottom: none; }
.quotation-page-wrapper .items-table td { padding: 10px 12px; vertical-align: middle; }
.quotation-page-wrapper .items-table td.center { text-align: center; }
.quotation-page-wrapper .items-table td.right { text-align: right; }

/* row inputs */
.quotation-page-wrapper .row-input {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 8px 10px;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px; color: var(--ink);
  outline: none; width: 100%;
  transition: all .15s;
}
.quotation-page-wrapper .row-input:focus {
  background: var(--blue-lt);
  border-color: var(--blue);
  box-shadow: 0 0 0 2px rgba(26,63,255,0.08);
}
.quotation-page-wrapper .row-input::placeholder { color: var(--ink3); }
.quotation-page-wrapper .row-input.center { text-align: center; }
.quotation-page-wrapper .row-input.right { text-align: right; }
.quotation-page-wrapper .row-input.mono {
  font-family: 'DM Mono', monospace;
  font-size: 14px;
}

.quotation-page-wrapper .amt-display {
  font-family: 'DM Mono', monospace;
  font-size: 14px; font-weight: 500;
  color: var(--ink); text-align: right;
}

.quotation-page-wrapper .delete-row {
  width: 32px; height: 32px; border-radius: 8px;
  background: transparent; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--ink3);
  transition: all .15s;
  margin: 0 auto;
}
.quotation-page-wrapper .delete-row:hover { background: #fff0f0; color: var(--red); }
.quotation-page-wrapper .delete-row svg { width: 16px; height: 16px; }

/* Add item row */
.quotation-page-wrapper .add-item-row {
  padding: 14px 16px;
  border-top: 1px dashed var(--border);
}
.quotation-page-wrapper .add-item-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px; font-weight: 600; color: var(--blue);
  background: var(--blue-lt);
  border: 1px dashed var(--blue);
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer; transition: all .15s;
}
.quotation-page-wrapper .add-item-btn:hover { background: var(--blue-mid); }
.quotation-page-wrapper .add-item-btn svg { width: 16px; height: 16px; }

/* ── NOTES ── */
.quotation-page-wrapper .notes-textarea {
  width: 100%;
  background: var(--cream);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px; color: var(--ink);
  outline: none; resize: vertical; min-height: 100px;
  transition: border-color .18s, box-shadow .18s;
}
.quotation-page-wrapper .notes-textarea:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(26,63,255,0.08);
  background: var(--blue-lt);
}
.quotation-page-wrapper .notes-textarea::placeholder { color: var(--ink3); }

/* ── RIGHT SIDEBAR ── */
.quotation-page-wrapper .right-col { display: flex; flex-direction: column; gap: 20px; animation: fadeUp .4s ease .22s both; }

/* Summary card */
.quotation-page-wrapper .summary-card {
  background: var(--ink);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
.quotation-page-wrapper .summary-header {
  padding: 18px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: flex; align-items: center; gap: 10px;
}
.quotation-page-wrapper .summary-header-text {
  font-family: 'Instrument Serif', serif;
  font-size: 20px; color: #fff; letter-spacing: -0.3px;
}
.quotation-page-wrapper .summary-header-icon {
  width: 36px; height: 36px;
  background: rgba(26,63,255,0.2);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.quotation-page-wrapper .summary-header-icon svg { width: 18px; height: 18px; color: #7b9fff; }

.quotation-page-wrapper .summary-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
.quotation-page-wrapper .summary-row {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 14px;
}
.quotation-page-wrapper .summary-label { color: rgba(255,255,255,0.45); }
.quotation-page-wrapper .summary-val {
  font-family: 'DM Mono', monospace;
  font-size: 14px; color: rgba(255,255,255,0.85); font-weight: 500;
}
.quotation-page-wrapper .summary-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 6px 0; }

.quotation-page-wrapper .summary-total {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px;
  background: rgba(26,63,255,0.25);
  border-top: 1px solid rgba(26,63,255,0.4);
}
.quotation-page-wrapper .summary-total-label {
  font-family: 'Instrument Serif', serif;
  font-size: 18px; color: #fff; letter-spacing: -0.2px;
}
.quotation-page-wrapper .summary-total-val {
  font-family: 'DM Mono', monospace;
  font-size: 24px; font-weight: 500; color: #7b9fff;
  letter-spacing: -0.5px;
}

/* Tax settings */
.quotation-page-wrapper .tax-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
}
.quotation-page-wrapper .tax-card .card-body { padding: 18px; display: flex; flex-direction: column; gap: 14px; }

.quotation-page-wrapper .tax-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
}
.quotation-page-wrapper .tax-label { font-size: 14px; color: var(--ink2); font-weight: 500; }

.quotation-page-wrapper .tax-select {
  background: var(--cream);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 32px 8px 12px;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px; color: var(--ink);
  outline: none; cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239a9088' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color .15s;
}
.quotation-page-wrapper .tax-select:focus { outline: none; border-color: var(--blue); }

/* Discount row */
.quotation-page-wrapper .discount-input {
  width: 100px;
  background: var(--cream);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  font-family: 'DM Mono', monospace;
  font-size: 14px; color: var(--ink);
  outline: none; text-align: right;
  transition: border-color .15s;
}
.quotation-page-wrapper .discount-input:focus { border-color: var(--blue); }

/* Status card */
.quotation-page-wrapper .status-card {
  background: var(--gold-lt);
  border: 1px solid #f0d070;
  border-radius: 16px;
  padding: 16px;
  display: flex; align-items: flex-start; gap: 12px;
}
.quotation-page-wrapper .status-icon {
  width: 32px; height: 32px;
  background: rgba(200,150,12,0.15);
  border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.quotation-page-wrapper .status-icon svg { width: 16px; height: 16px; color: var(--gold); }
.quotation-page-wrapper .status-text { flex: 1; }
.quotation-page-wrapper .status-title { font-size: 13px; font-weight: 700; color: var(--gold); margin-bottom: 4px; }
.quotation-page-wrapper .status-desc { font-size: 12px; color: #7a6010; line-height: 1.5; }

/* Action buttons */
.quotation-page-wrapper .action-btns { display: flex; flex-direction: column; gap: 10px; }
.quotation-page-wrapper .btn-primary {
  width: 100%; padding: 14px 20px;
  border-radius: 12px;
  background: var(--blue);
  border: none; color: #fff;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 15px; font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  box-shadow: 0 4px 20px rgba(26,63,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
  transition: all .18s;
}
.quotation-page-wrapper .btn-primary:hover { background: #0d2fe8; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(26,63,255,0.45); }
.quotation-page-wrapper .btn-primary:active { transform: scale(0.98); }
.quotation-page-wrapper .btn-primary svg { width: 18px; height: 18px; }

.quotation-page-wrapper .btn-secondary {
  width: 100%; padding: 13px 20px;
  border-radius: 12px;
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--ink2);
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 15px; font-weight: 600;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all .15s;
}
.quotation-page-wrapper .btn-secondary:hover { border-color: var(--ink3); color: var(--ink); background: var(--cream); }
.quotation-page-wrapper .btn-secondary svg { width: 16px; height: 16px; }

.quotation-page-wrapper .btn-danger {
  width: 100%; padding: 12px 20px;
  border-radius: 12px;
  background: transparent;
  border: 1.5px solid #fecaca;
  color: var(--red);
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px; font-weight: 600;
  cursor: pointer;
  transition: all .15s;
}
.quotation-page-wrapper .btn-danger:hover { background: #fff0f0; border-color: var(--red); }

/* Mobile */
@media(max-width:768px){
  .quotation-page-wrapper .main { grid-template-columns: 1fr; padding: 20px 16px 80px; }
  .quotation-page-wrapper .topbar { padding: 0 16px; }
  .quotation-page-wrapper .topbar-sub { display: none; }
}
                `
            }} />

            {/* TOP NAV */}
            <div className="topbar">
                <div className="topbar-left">
                    <button className="back-btn" onClick={() => router.back()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                        Back
                    </button>
                    <div className="topbar-divider"></div>
                    <div>
                        <div className="topbar-title">New Quotation</div>
                        <div className="topbar-sub">Create a new quotation for your customer</div>
                    </div>
                </div>
                <div className="topbar-right">
                    <button className="btn-ghost" onClick={() => router.push('/dashboard/quotations')}>Cancel</button>
                    <button className="btn-save-main" onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>
                                Save Quotation
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* MAIN */}
            <div className="main">

                {/* LEFT COLUMN */}
                <div className="left-col">

                    {/* Customer & Date Card */}
                    <div className="card">
                        <div className="quot-meta">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a3fff" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                            <span className="quot-num">{quoNumber}</span>
                            <span className="quot-date-info">Draft · Auto-saved</span>
                        </div>
                        <div className="card-header">
                            <div className="card-header-title">
                                <div className="card-header-icon" style={{ background: '#eef1ff' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#1a3fff" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                                Customer Details
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="form-grid-2">
                                <div className="field">
                                    <label>Customer Name <span className="req">*</span></label>
                                    <input type="text" placeholder="Enter customer name" id="custName" value={customer} onChange={(e) => setCustomer(e.target.value)} />
                                </div>
                                <div className="field">
                                    <label>Phone Number</label>
                                    <input type="tel" placeholder="e.g. 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>
                                <div className="field">
                                    <label>Quotation Date <span className="req">*</span></label>
                                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                                </div>
                                <div className="field">
                                    <label>Valid Until</label>
                                    <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                                </div>
                                <div className="field" style={{ gridColumn: '1/-1' }}>
                                    <label>Customer Address</label>
                                    <input type="text" placeholder="Enter address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Card */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-header-title">
                                <div className="card-header-icon" style={{ background: '#e6f5ef' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#00875a" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                </div>
                                Items / Products
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--ink3)', fontWeight: 500 }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }} className="center">#</th>
                                        <th>Product / Service</th>
                                        <th style={{ width: '100px' }} className="center">Qty</th>
                                        <th style={{ width: '130px' }} className="right">Rate (₹)</th>
                                        <th style={{ width: '90px' }} className="right">GST</th>
                                        <th style={{ width: '130px' }} className="right">Amount (₹)</th>
                                        <th style={{ width: '50px' }} className="center">Del</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((row, idx) => (
                                        <tr key={row.id}>
                                            <td className="center" style={{ fontSize: '12px', color: 'var(--ink3)', fontWeight: 600 }}>{idx + 1}</td>
                                            <td>
                                                <input className="row-input" placeholder="Product / Service name" value={row.product} onChange={(e) => updateItem(row.id, 'product', e.target.value)} />
                                            </td>
                                            <td>
                                                <input className="row-input center mono" type="number" value={row.quantity} min="1" onChange={(e) => updateItem(row.id, 'quantity', parseFloat(e.target.value) || 0)} />
                                            </td>
                                            <td>
                                                <input className="row-input right mono" type="number" value={row.rate} min="0" onChange={(e) => updateItem(row.id, 'rate', parseFloat(e.target.value) || 0)} />
                                            </td>
                                            <td>
                                                <select className="row-input" style={{ fontSize: '13px', padding: '8px 4px' }} value={row.gst} onChange={(e) => updateItem(row.id, 'gst', parseFloat(e.target.value) || 0)}>
                                                    {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}
                                                </select>
                                            </td>
                                            <td className="right">
                                                <span className="amt-display">₹{formatNum(row.quantity * row.rate)}</span>
                                            </td>
                                            <td className="center">
                                                <button className="delete-row" onClick={() => removeItem(row.id)} title="Remove">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="add-item-row">
                            <button className="add-item-btn" onClick={addItem}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                                Add Item
                            </button>
                        </div>
                    </div>

                    {/* Notes Card */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-header-title">
                                <div className="card-header-icon" style={{ background: '#fff8e6' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#c8960c" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                </div>
                                Notes & Terms
                            </div>
                        </div>
                        <div className="card-body">
                            <textarea className="notes-textarea" placeholder="Add any notes or terms & conditions for this quotation..." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
                        </div>
                    </div>

                </div>

                {/* RIGHT SIDEBAR */}
                <div className="right-col">

                    {/* Summary Card */}
                    <div className="summary-card">
                        <div className="summary-header">
                            <div className="summary-header-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                            </div>
                            <span className="summary-header-text">Summary</span>
                        </div>
                        <div className="summary-body">
                            <div className="summary-row">
                                <span className="summary-label">Subtotal</span>
                                <span className="summary-val">₹{formatNum(subtotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Discount</span>
                                <span className="summary-val" style={{ color: '#ff6b6b' }}>-₹{formatNum(discountAmt)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">GST / Tax</span>
                                <span className="summary-val">+₹{formatNum(taxTotal)}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row">
                                <span className="summary-label" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Items count</span>
                                <span className="summary-val" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        <div className="summary-total">
                            <span className="summary-total-label">Total Amount</span>
                            <span className="summary-total-val">₹{formatNum(totalAmount)}</span>
                        </div>
                    </div>

                    {/* Tax & Discount */}
                    <div className="tax-card">
                        <div className="card-header">
                            <div className="card-header-title">
                                <div className="card-header-icon" style={{ background: '#eef1ff' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#1a3fff" strokeWidth="2"><path d="M9 14l6-6M10 9h.01M14 13h.01" /><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                Tax & Discount
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="tax-row">
                                <span className="tax-label">Default GST</span>
                                <select className="tax-select" value={defaultGst} onChange={(e) => setDefaultGst(parseInt(e.target.value))}>
                                    <option value="0">0%</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                </select>
                            </div>
                            <div className="tax-row">
                                <span className="tax-label">Discount (%)</span>
                                <input type="number" className="discount-input" placeholder="0" min="0" max="100" value={discountPct} onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)} />
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="status-card">
                        <div className="status-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                        </div>
                        <div className="status-text">
                            <div className="status-title">Draft Mode</div>
                            <div className="status-desc">Quotation abhi draft mein hai. Save karo to customer ko share kar sakte hain WhatsApp ya PDF ke zariye.</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="action-btns">
                        <button className="btn-primary" onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>
                                    Save Quotation
                                </>
                            )}
                        </button>
                        <button className="btn-secondary" onClick={handlePreviewPDF}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></svg>
                            Preview PDF
                        </button>
                        <button className="btn-secondary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v3z" /></svg>
                            Share on WhatsApp
                        </button>
                        <button className="btn-danger" onClick={() => router.push('/dashboard/quotations')}>Discard & Cancel</button>
                    </div>

                </div>

            </div>
        </div>
    );
}
