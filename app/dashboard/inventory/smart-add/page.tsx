'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUpload, FaCamera, FaSpinner, FaCheck, FaSave, FaTrash, FaRobot, FaArrowLeft } from 'react-icons/fa';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

export default function SmartAddPage() {
    const router = useRouter();
    const { addProduct } = useStore() as any;
    
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [parsedItems, setParsedItems] = useState<any[]>([]);
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            setImage(base64);
            await processImage(base64);
        };
        reader.readAsDataURL(file);
    };

    const processImage = async (base64Data: string) => {
        setStep('processing');
        setLoading(true);
        try {
            const res = await fetch('/api/vision-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64Data })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to parse invoice');

            if (data.items && data.items.length > 0) {
                // Map to our product format
                const mappedItems = data.items.map((item: any) => ({
                    id: crypto.randomUUID(),
                    name: item.name || '',
                    quantity: Number(item.quantity) || 1,
                    purchasePrice: Number(item.purchasePrice) || 0,
                    sellingPrice: Number(item.purchasePrice) ? Number(item.purchasePrice) * 1.2 : 0, // Add 20% margin by default
                    gstRate: Number(item.gstRate) || 18,
                    totalAmount: Number(item.totalAmount) || 0,
                    selected: true
                }));
                setParsedItems(mappedItems);
                setStep('review');
                toast.success('Invoice parsed successfully!');
            } else {
                toast.error('Could not find any items in the invoice');
                setStep('upload');
            }
        } catch (error: any) {
            console.error('Processing error:', error);
            toast.error(error.message || 'Something went wrong');
            setStep('upload');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const itemsToSave = parsedItems.filter(item => item.selected);
        if (itemsToSave.length === 0) {
            toast.error('Please select at least one item to save');
            return;
        }

        const loadToast = toast.loading('Saving items to inventory...');
        let successCount = 0;

        for (const item of itemsToSave) {
            try {
                await addProduct({
                    id: crypto.randomUUID(),
                    name: item.name,
                    price: item.sellingPrice || item.purchasePrice,
                    purchase_price: item.purchasePrice,
                    stock_quantity: item.quantity,
                    gst_rate: item.gstRate,
                    type: 'PRODUCT',
                    created_at: new Date().toISOString()
                });
                successCount++;
            } catch (err) {
                console.error('Error saving item:', item.name, err);
            }
        }

        toast.dismiss(loadToast);
        toast.success(`Successfully added ${successCount} items to inventory!`);
        router.push('/dashboard/inventory');
    };

    const updateItem = (id: string, field: string, value: any) => {
        setParsedItems(prev => prev.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    return (
        <div className="max-w-2xl mx-auto p-4 pb-24 min-h-screen bg-[#f8fafc]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <button 
                    onClick={() => router.push('/dashboard/inventory')}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <FaRobot className="text-indigo-600" /> Smart AI Scanner
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Upload a bill to auto-extract products</p>
                </div>
            </div>

            {/* Upload Step */}
            {step === 'upload' && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center animate-fadeIn">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaUpload size={28} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Upload Supplier Invoice</h2>
                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-sm mx-auto">
                        Take a photo or upload a PDF/Image of your supplier's bill. Our AI will automatically extract the products and quantities.
                    </p>
                    
                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            <FaUpload /> Choose File
                        </button>
                        <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                    </div>
                </div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center flex flex-col items-center animate-fadeIn">
                    <div className="w-24 h-24 relative mb-6">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        <FaRobot className="absolute inset-0 m-auto text-indigo-600 text-3xl animate-pulse" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">AI is scanning your bill...</h2>
                    <p className="text-sm font-medium text-slate-500 animate-pulse">Extracting products, quantities, and prices</p>
                </div>
            )}

            {/* Review Step */}
            {step === 'review' && (
                <div className="animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FaCheck className="text-green-500" /> Extracted {parsedItems.length} Items
                            </h3>
                            <button 
                                onClick={() => setStep('upload')}
                                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
                            >
                                Re-upload
                            </button>
                        </div>
                        
                        <div className="divide-y divide-slate-100">
                            {parsedItems.map((item, index) => (
                                <div key={item.id} className={`p-4 transition-colors ${!item.selected ? 'opacity-50 bg-slate-50' : 'bg-white'}`}>
                                    <div className="flex items-start gap-3">
                                        <div className="pt-1">
                                            <input 
                                                type="checkbox" 
                                                checked={item.selected}
                                                onChange={(e) => updateItem(item.id, 'selected', e.target.checked)}
                                                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <input 
                                                type="text" 
                                                value={item.name}
                                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                className="w-full font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none transition-colors"
                                            />
                                            
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Quantity</label>
                                                    <input 
                                                        type="number" 
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                                        className="w-full font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">GST Rate (%)</label>
                                                    <select 
                                                        value={item.gstRate}
                                                        onChange={(e) => updateItem(item.id, 'gstRate', Number(e.target.value))}
                                                        className="w-full font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                    >
                                                        <option value="0">0%</option>
                                                        <option value="5">5%</option>
                                                        <option value="12">12%</option>
                                                        <option value="18">18%</option>
                                                        <option value="28">28%</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Purchase Price</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2 font-semibold text-slate-400">₹</span>
                                                        <input 
                                                            type="number" 
                                                            value={item.purchasePrice}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                updateItem(item.id, 'purchasePrice', val);
                                                                // Auto update selling price (+20%)
                                                                updateItem(item.id, 'sellingPrice', Number((val * 1.2).toFixed(2)));
                                                            }}
                                                            className="w-full font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-2 focus:border-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1 block">Selling Price</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2 font-semibold text-slate-400">₹</span>
                                                        <input 
                                                            type="number" 
                                                            value={item.sellingPrice}
                                                            onChange={(e) => updateItem(item.id, 'sellingPrice', Number(e.target.value))}
                                                            className="w-full font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg pl-7 pr-3 py-2 focus:border-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:pl-72 z-40">
                        <div className="max-w-2xl mx-auto flex gap-3">
                            <button 
                                onClick={() => setStep('upload')}
                                className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
                            >
                                <FaSave /> Save to Inventory ({parsedItems.filter(i => i.selected).length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
