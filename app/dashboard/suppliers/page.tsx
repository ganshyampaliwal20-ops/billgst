"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function SuppliersPage() {
    const router = useRouter();
    const { aiDraftData, setAiDraftData } = useStore() as any;
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Form state
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newGstin, setNewGstin] = useState('');
    const [newAddress, setNewAddress] = useState('');

    useEffect(() => {
        setIsClient(true);
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (!isClient || !aiDraftData) return;
        if (aiDraftData.type === 'SUPPLIER') {
            setNewName(aiDraftData.name || '');
            setNewPhone(aiDraftData.phone || '');
            setShowAddModal(true);
            setAiDraftData(null);
        }
    }, [isClient, aiDraftData]);

    const fetchSuppliers = async () => {
        try {
            const res = await fetch('/api/suppliers');
            if (res.ok) {
                const data = await res.json();
                setSuppliers(data);
            }
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
        }
    };

    if (!isClient) return null;

    const handleAdd = async () => {
        if (!newName) {
            toast.error('Supplier name is required!');
            return;
        }

        try {
            const res = await fetch('/api/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    phone: newPhone,
                    gstin: newGstin,
                    address: newAddress
                })
            });

            if (res.ok) {
                toast.success('Supplier added successfully!');
                fetchSuppliers();
                setShowAddModal(false);
                setNewName(''); setNewPhone(''); setNewGstin(''); setNewAddress('');
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to add supplier');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    toast.success(`${name} deleted.`);
                    fetchSuppliers();
                } else {
                    toast.error('Failed to delete supplier');
                }
            } catch (error) {
                toast.error('An error occurred');
            }
        }
    };

    const filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.phone && s.phone.includes(searchTerm))
    );

    const getInitials = (name: string) => name.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const avatarColors = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];
    const getColor = (id: string) => avatarColors[id.charCodeAt(0) % avatarColors.length];

    return (
        <div style={{ background: '#f4f6fc', minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e2436' }}>Suppliers</h1>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        style={{ background: '#00c4a7', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + Add Supplier
                    </button>
                </div>

                <input 
                    type="text" 
                    placeholder="Search by name or phone..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e4e8f4', marginBottom: '20px', outline: 'none' }}
                />

                <div style={{ display: 'grid', gap: '16px' }}>
                    {filteredSuppliers.map((s) => {
                        const totalPurchase = parseFloat(s.total_purchase) || 0;
                        const totalPaid = parseFloat(s.total_paid) || 0;
                        const balance = totalPurchase - totalPaid;

                        return (
                            <div key={s.id} onClick={() => router.push(`/dashboard/suppliers/${s.id}`)} style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(12,15,26,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: getColor(s.id), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                                        {getInitials(s.name)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e2436' }}>{s.name}</div>
                                        <div style={{ fontSize: '13px', color: '#8892aa' }}>{s.phone || 'No Phone'} {s.gstin ? `• GST: ${s.gstin}` : ''}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '13px', color: '#8892aa', marginBottom: '4px' }}>Balance to Pay</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '18px', color: balance > 0 ? '#ef4444' : '#10b981' }}>
                                        ₹{Math.abs(balance).toLocaleString('en-IN')} {balance > 0 ? '(Dr)' : '(Cr)'}
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(s.id, s.name); }}
                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', marginTop: '8px', padding: '4px' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    
                    {filteredSuppliers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#8892aa' }}>
                            No suppliers found.
                        </div>
                    )}
                </div>

                {/* Add Modal */}
                {showAddModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1e2436' }}>Add New Supplier</h2>
                            
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#3d4663', marginBottom: '8px' }}>Name *</label>
                                <input value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e8f4', outline: 'none' }} placeholder="Supplier Name" />
                            </div>
                            
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#3d4663', marginBottom: '8px' }}>Phone</label>
                                <input value={newPhone} onChange={e => setNewPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e8f4', outline: 'none' }} placeholder="Phone Number" />
                            </div>
                            
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#3d4663', marginBottom: '8px' }}>GSTIN</label>
                                <input value={newGstin} onChange={e => setNewGstin(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e8f4', outline: 'none' }} placeholder="GST Number" />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#3d4663', marginBottom: '8px' }}>Address</label>
                                <input value={newAddress} onChange={e => setNewAddress(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e4e8f4', outline: 'none' }} placeholder="Address" />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e4e8f4', background: 'white', color: '#3d4663', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleAdd} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#00c4a7', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Save Supplier</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
