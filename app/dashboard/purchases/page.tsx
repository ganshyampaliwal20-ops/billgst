/* eslint-disable */
"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PurchasesPage() {
    const router = useRouter();
    const [purchases, setPurchases] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setIsClient(true);
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const res = await fetch('/api/purchases');
            if (res.ok) {
                const data = await res.json();
                setPurchases(data);
            }
        } catch (error) {
            console.error('Failed to fetch purchases', error);
        }
    };

    if (!isClient) return null;

    const filteredPurchases = purchases.filter(p => 
        (p.bill_number && p.bill_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.supplier_name && p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = async (id: string, billNum: string) => {
        if (window.confirm(`Are you sure you want to delete purchase bill ${billNum}? This will decrease the stock of products back to their previous amount.`)) {
            try {
                const res = await fetch(`/api/purchases/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    toast.success(`Bill ${billNum} deleted and stock updated.`);
                    fetchPurchases();
                } else {
                    toast.error('Failed to delete bill');
                }
            } catch (error) {
                toast.error('An error occurred');
            }
        }
    };

    return (
        <div style={{ background: '#f4f6fc', minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e2436' }}>Purchase Bills</h1>
                    <Link href="/dashboard/purchases/new">
                        <button style={{ background: '#00c4a7', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            + New Purchase
                        </button>
                    </Link>
                </div>

                <input 
                    type="text" 
                    placeholder="Search by bill number or supplier..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e4e8f4', marginBottom: '20px', outline: 'none' }}
                />

                <div style={{ display: 'grid', gap: '16px' }}>
                    {filteredPurchases.map((p) => (
                        <div key={p.id} style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(12,15,26,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e2436' }}>
                                    Bill: {p.bill_number}
                                </div>
                                <div style={{ fontSize: '13px', color: '#8892aa', marginTop: '4px' }}>
                                    {p.supplier_name || 'Unknown Supplier'} • {new Date(p.bill_date).toLocaleDateString('en-IN')}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#1e2436' }}>
                                    ₹{parseFloat(p.total_amount).toLocaleString('en-IN')}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                                    <div style={{ fontSize: '12px', background: '#e0f2fe', color: '#0ea5e9', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                        {p.status}
                                    </div>
                                    <button onClick={() => handleDelete(p.id, p.bill_number)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredPurchases.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#8892aa' }}>
                            No purchase bills found. Create a new one!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
