"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { use } from 'react';

export default function SupplierDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const supplierId = resolvedParams.id;
    const router = useRouter();

    const [supplier, setSupplier] = useState<any>(null);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        fetchSupplierData();
    }, [supplierId]);

    const fetchSupplierData = async () => {
        try {
            // We can reuse the GET /api/suppliers but filter for this ID,
            // or just fetch all and find, since we don't have a single-GET endpoint yet.
            const res = await fetch('/api/suppliers');
            if (res.ok) {
                const allSuppliers = await res.json();
                const current = allSuppliers.find((s: any) => s.id === supplierId);
                if (current) setSupplier(current);
            }

            // Fetch purchases for this supplier
            const pRes = await fetch('/api/purchases');
            if (pRes.ok) {
                const allPurchases = await pRes.json();
                setPurchases(allPurchases.filter((p: any) => p.supplier_id === supplierId));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!isClient) return null;
    if (!supplier) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    const totalPurchase = parseFloat(supplier.total_purchase) || 0;
    const totalPaid = parseFloat(supplier.total_paid) || 0;
    const balance = totalPurchase - totalPaid;

    return (
        <div style={{ background: '#f4f6fc', minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <button onClick={() => router.push('/dashboard/suppliers')} style={{ background: 'white', border: '1px solid #e4e8f4', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ←
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e2436', margin: 0 }}>{supplier.name}</h1>
                        <div style={{ color: '#8892aa', fontSize: '14px' }}>{supplier.phone || 'No phone'} {supplier.gstin ? `• GST: ${supplier.gstin}` : ''}</div>
                    </div>
                </div>

                {/* Ledger Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(12,15,26,0.06)' }}>
                        <div style={{ fontSize: '13px', color: '#8892aa', marginBottom: '8px' }}>Total Purchases</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e2436' }}>₹{totalPurchase.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(12,15,26,0.06)' }}>
                        <div style={{ fontSize: '13px', color: '#8892aa', marginBottom: '8px' }}>Total Paid</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>₹{totalPaid.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(12,15,26,0.06)' }}>
                        <div style={{ fontSize: '13px', color: '#8892aa', marginBottom: '8px' }}>Balance to Pay (Udhar)</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: balance > 0 ? '#ef4444' : '#1e2436' }}>
                            ₹{Math.abs(balance).toLocaleString('en-IN')} {balance > 0 ? '(Dr)' : '(Cr)'}
                        </div>
                    </div>
                </div>

                {/* Purchase Bills List */}
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(12,15,26,0.06)', padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e2436', marginBottom: '16px' }}>Purchase Bills</h2>
                    
                    {purchases.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#8892aa', padding: '20px' }}>No purchases found from this supplier.</div>
                    ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {purchases.map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e4e8f4', borderRadius: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#1e2436' }}>Bill: {p.bill_number}</div>
                                        <div style={{ fontSize: '13px', color: '#8892aa' }}>{new Date(p.bill_date).toLocaleDateString('en-IN')}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e2436' }}>₹{parseFloat(p.total_amount).toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
