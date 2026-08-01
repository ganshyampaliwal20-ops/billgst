"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';

export default function NewPurchasePage() {
    const router = useRouter();
    const { aiDraftData, setAiDraftData } = useStore() as any;
    const [isClient, setIsClient] = useState(false);
    
    // Data sources
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // Form state
    const [supplierId, setSupplierId] = useState('');
    const [billNumber, setBillNumber] = useState(`PB-${Date.now().toString().slice(-6)}`);
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    
    const [items, setItems] = useState<any[]>([
        { id: Date.now(), product_id: '', product_name: '', quantity: 1, price: 0, cgst_rate: 0, sgst_rate: 0, igst_rate: 0, total: 0 }
    ]);

    const [isSaving, setIsSaving] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        setIsClient(true);
        fetchSuppliers();
        fetchProducts();
    }, []);

    useEffect(() => {
        if (!isClient || !aiDraftData) return;
        if (aiDraftData.type === 'PURCHASE') {
            if (aiDraftData.supplierName && suppliers.length > 0) {
                const sup = suppliers.find(s => s.name.toLowerCase() === aiDraftData.supplierName.toLowerCase());
                if (sup) setSupplierId(sup.id);
            }
            if (aiDraftData.items && aiDraftData.items.length > 0) {
                const newItems = aiDraftData.items.map((item: any, i: number) => {
                    const matchedProduct = products.find(p => p.name.toLowerCase() === item.name.toLowerCase());
                    const qty = parseFloat(item.quantity) || 1;
                    const prc = matchedProduct?.price || 0;
                    const gst = matchedProduct?.gst_rate || 0;
                    const baseTotal = qty * prc;
                    const taxAmount = baseTotal * (gst / 100);
                    return {
                        id: Date.now() + i,
                        product_id: matchedProduct ? matchedProduct.id : '',
                        product_name: item.name,
                        quantity: qty,
                        price: prc,
                        cgst_rate: gst / 2,
                        sgst_rate: gst / 2,
                        igst_rate: 0,
                        total: baseTotal + taxAmount
                    };
                });
                setItems(newItems);
            }
            setAiDraftData(null);
        }
    }, [isClient, aiDraftData, suppliers, products]);

    const fetchSuppliers = async () => {
        try {
            const res = await fetch('/api/suppliers');
            if (res.ok) setSuppliers(await res.json());
        } catch (e) {}
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) setProducts(await res.json());
        } catch (e) {}
    };

    const handleFileUpload = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Data = reader.result as string;
            
            setIsScanning(true);
            const scanningToast = toast.loading('AI is scanning the bill...');
            try {
                const res = await fetch('/api/vision-invoice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageBase64: base64Data })
                });

                if (res.ok) {
                    const data = await res.json();
                    toast.success('Bill scanned successfully!', { id: scanningToast });
                    
                    // Autofill Form
                    if (data.billNumber) setBillNumber(data.billNumber);
                    if (data.invoiceNumber) setBillNumber(data.invoiceNumber);
                    if (data.invoiceDate) setBillDate(data.invoiceDate);
                    
                    if (data.supplierName) {
                        // Find supplier if it exists, otherwise leave empty
                        const sup = suppliers.find(s => s.name.toLowerCase().includes(data.supplierName.toLowerCase()));
                        if (sup) setSupplierId(sup.id);
                    }

                    if (data.items && data.items.length > 0) {
                        const newItems = data.items.map((item: any, i: number) => {
                            // Try to match product name to an existing product
                            const matchedProduct = products.find(p => p.name.toLowerCase() === item.name.toLowerCase());
                            const qty = parseFloat(item.quantity) || 1;
                            const prc = parseFloat(item.purchasePrice) || parseFloat(item.price) || 0;
                            const gst = parseFloat(item.gstRate) || 0;
                            
                            const baseTotal = qty * prc;
                            const taxAmount = baseTotal * (gst / 100);

                            return {
                                id: Date.now() + i,
                                product_id: matchedProduct ? matchedProduct.id : '',
                                product_name: item.name,
                                quantity: qty,
                                price: prc,
                                cgst_rate: gst / 2,
                                sgst_rate: gst / 2,
                                igst_rate: 0,
                                total: baseTotal + taxAmount
                            };
                        });
                        setItems(newItems);
                    }
                } else {
                    toast.error('Failed to parse bill with AI', { id: scanningToast });
                }
            } catch (error) {
                toast.error('An error occurred during AI scanning', { id: scanningToast });
            }
            setIsScanning(false);
        };
        reader.readAsDataURL(file);
    };

    if (!isClient) return null;

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index][field] = value;
        
        // Auto-fill product details if product_id changes
        if (field === 'product_id' && value) {
            const product = products.find(p => p.id === value);
            if (product) {
                newItems[index].product_name = product.name;
                newItems[index].price = product.price || 0;
                newItems[index].cgst_rate = product.gst_rate ? product.gst_rate / 2 : 0;
                newItems[index].sgst_rate = product.gst_rate ? product.gst_rate / 2 : 0;
            }
        }

        // Recalculate total
        const qty = parseFloat(newItems[index].quantity) || 0;
        const prc = parseFloat(newItems[index].price) || 0;
        const cgst = parseFloat(newItems[index].cgst_rate) || 0;
        const sgst = parseFloat(newItems[index].sgst_rate) || 0;
        const igst = parseFloat(newItems[index].igst_rate) || 0;
        
        const baseTotal = qty * prc;
        const taxAmount = baseTotal * ((cgst + sgst + igst) / 100);
        newItems[index].total = baseTotal + taxAmount;

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { id: Date.now(), product_id: '', product_name: '', quantity: 1, price: 0, cgst_rate: 0, sgst_rate: 0, igst_rate: 0, total: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    // Calculations
    const subTotal = items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)), 0);
    const cgstTotal = items.reduce((sum, item) => sum + (((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)) * ((parseFloat(item.cgst_rate) || 0) / 100)), 0);
    const sgstTotal = items.reduce((sum, item) => sum + (((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)) * ((parseFloat(item.sgst_rate) || 0) / 100)), 0);
    const igstTotal = items.reduce((sum, item) => sum + (((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)) * ((parseFloat(item.igst_rate) || 0) / 100)), 0);
    const totalAmount = subTotal + cgstTotal + sgstTotal + igstTotal;

    const handleSave = async () => {
        if (!supplierId) {
            toast.error('Please select a supplier');
            return;
        }

        const validItems = items.filter(item => item.product_name && item.quantity > 0 && item.price >= 0);
        if (validItems.length === 0) {
            toast.error('Please add at least one valid item');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                supplier_id: supplierId,
                bill_number: billNumber,
                bill_date: billDate,
                sub_total: subTotal,
                cgst_total: cgstTotal,
                sgst_total: sgstTotal,
                igst_total: igstTotal,
                total_amount: totalAmount,
                notes,
                items: validItems
            };

            const res = await fetch('/api/purchases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Purchase bill saved successfully! Stock has been updated.');
                router.push('/dashboard/purchases');
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to save purchase bill');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
        setIsSaving(false);
    };

    return (
        <div style={{ background: '#f4f6fc', minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(12,15,26,0.06)', padding: '24px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e4e8f4', paddingBottom: '16px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e2436' }}>New Purchase Bill</h1>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <label style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isScanning ? 'Scanning...' : 'Scan Bill with AI 📷'}
                            <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isScanning} />
                        </label>
                        <Link href="/dashboard/purchases">
                            <button style={{ background: 'transparent', border: '1px solid #e4e8f4', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                        </Link>
                    </div>
                </div>

                {/* Form Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#3d4663', marginBottom: '8px' }}>Supplier *</label>
                        <select 
                            value={supplierId} 
                            onChange={e => setSupplierId(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e8f4', outline: 'none' }}
                        >
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.phone || 'No Phone'})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#3d4663', marginBottom: '8px' }}>Bill Number *</label>
                        <input 
                            value={billNumber} 
                            onChange={e => setBillNumber(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e8f4', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#3d4663', marginBottom: '8px' }}>Bill Date *</label>
                        <input 
                            type="date"
                            value={billDate} 
                            onChange={e => setBillDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e8f4', outline: 'none' }}
                        />
                    </div>
                </div>

                {/* Items */}
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e2436', marginBottom: '16px' }}>Items (Stock will update automatically)</h3>
                <div style={{ border: '1px solid #e4e8f4', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', fontSize: '13px', color: '#64748b' }}>
                            <tr>
                                <th style={{ padding: '12px', borderBottom: '1px solid #e4e8f4' }}>Product</th>
                                <th style={{ padding: '12px', borderBottom: '1px solid #e4e8f4' }}>Qty</th>
                                <th style={{ padding: '12px', borderBottom: '1px solid #e4e8f4' }}>Price (₹)</th>
                                <th style={{ padding: '12px', borderBottom: '1px solid #e4e8f4' }}>GST (%)</th>
                                <th style={{ padding: '12px', borderBottom: '1px solid #e4e8f4' }}>Total (₹)</th>
                                <th style={{ padding: '12px', borderBottom: '1px solid #e4e8f4' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #e4e8f4' }}>
                                    <td style={{ padding: '12px' }}>
                                        <select 
                                            value={item.product_id}
                                            onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e4e8f4', outline: 'none', marginBottom: '4px' }}
                                        >
                                            <option value="">Select / Custom</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <input 
                                            placeholder="Item Name" 
                                            value={item.product_name}
                                            onChange={e => handleItemChange(index, 'product_name', e.target.value)}
                                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e4e8f4', outline: 'none' }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px', width: '80px' }}>
                                        <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e4e8f4', outline: 'none' }} />
                                    </td>
                                    <td style={{ padding: '12px', width: '100px' }}>
                                        <input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e4e8f4', outline: 'none' }} />
                                    </td>
                                    <td style={{ padding: '12px', width: '160px' }}>
                                        <div style={{ display: 'flex', gap: '4px', fontSize: '11px' }}>
                                            <div>CGST <input type="number" value={item.cgst_rate} onChange={e => handleItemChange(index, 'cgst_rate', e.target.value)} style={{ width: '40px', padding: '4px', border: '1px solid #e4e8f4', borderRadius: '4px' }} /></div>
                                            <div>SGST <input type="number" value={item.sgst_rate} onChange={e => handleItemChange(index, 'sgst_rate', e.target.value)} style={{ width: '40px', padding: '4px', border: '1px solid #e4e8f4', borderRadius: '4px' }} /></div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', width: '100px', fontWeight: 'bold' }}>
                                        {item.total.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '12px', width: '40px' }}>
                                        <button onClick={() => removeItem(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>×</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ padding: '12px' }}>
                        <button onClick={addItem} style={{ color: '#00c4a7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Row</button>
                    </div>
                </div>

                {/* Footer Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                    <div style={{ width: '300px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                            <span>Subtotal:</span>
                            <span>₹{subTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                            <span>Total GST:</span>
                            <span>₹{(cgstTotal + sgstTotal + igstTotal).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', fontSize: '18px', fontWeight: 'bold', color: '#1e2436' }}>
                            <span>Total Amount:</span>
                            <span>₹{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        style={{ background: '#00c4a7', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', opacity: isSaving ? 0.7 : 1 }}
                    >
                        {isSaving ? 'Saving...' : 'Save Purchase Bill'}
                    </button>
                </div>

            </div>
        </div>
    );
}
