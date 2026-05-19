'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUpload, FaCamera, FaSpinner, FaCheck, FaSave, FaTrash, FaRobot, FaArrowLeft } from 'react-icons/fa';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

export default function SmartAddPage() {
    const router = useRouter();
    const { products, addProduct, updateProduct } = useStore() as any;
    
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
                const mappedItems = data.items.map((item: any) => {
                    // Try to find if this product already exists by name
                    const existingProduct = products?.find((p: any) => p.name.toLowerCase().trim() === (item.name || '').toLowerCase().trim());
                    
                    return {
                        id: crypto.randomUUID(),
                        name: item.name || '',
                        quantity: Number(item.quantity) || 1,
                        purchasePrice: Number(item.purchasePrice) || existingProduct?.purchase_price || 0,
                        sellingPrice: existingProduct?.price || (Number(item.purchasePrice) ? Number(item.purchasePrice) * 1.2 : 0),
                        gstRate: Number(item.gstRate) || existingProduct?.gst_rate || 18,
                        totalAmount: Number(item.totalAmount) || 0,
                        selected: true,
                        isExisting: !!existingProduct,
                        existingId: existingProduct?.id || null,
                        currentStock: parseInt(existingProduct?.stock_quantity || 0)
                    };
                });
                
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
                if (item.isExisting && item.existingId) {
                    // Update existing product stock
                    await updateProduct(item.existingId, {
                        stock_quantity: item.currentStock + item.quantity,
                        purchase_price: item.purchasePrice, // Update to latest purchase price
                        price: item.sellingPrice || item.purchasePrice
                    });
                } else {
                    // Create new product
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
                }
                successCount++;
            } catch (err) {
                console.error('Error saving item:', item.name, err);
            }
        }

        toast.dismiss(loadToast);
        toast.success(`Successfully saved ${successCount} items!`);
        router.push('/dashboard/inventory');
    };

    const updateItem = (id: string, field: string, value: any) => {
        setParsedItems(prev => prev.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    return (
        <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-8 py-6 pb-32 min-h-screen bg-[#f8fafc]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 bg-white p-5 sm:p-6 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">
                <button 
                    onClick={() => router.push('/dashboard/inventory')}
                    className="self-start sm:self-auto p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all border border-slate-100 hover:shadow-sm"
                >
                    <FaArrowLeft />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight flex items-center gap-3">
                        <FaRobot className="text-indigo-600" /> Smart AI Scanner
                    </h1>
                    <p className="text-sm font-bold text-slate-400 mt-1">Transform physical bills into digital inventory instantly</p>
                </div>
            </div>

            {/* Upload Step */}
            {step === 'upload' && (
                <div className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center animate-fadeIn">
                    {/* Professional Dashed Dropzone */}
                    <div 
                        className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 rounded-3xl p-8 sm:p-14 transition-all cursor-pointer group" 
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-20 h-20 bg-white text-indigo-600 rounded-2xl shadow-sm border border-indigo-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                            <FaUpload size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight group-hover:text-indigo-700 transition-colors">Upload Supplier Invoice</h2>
                        <p className="text-sm font-semibold text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                            Upload a photo, scan, or PDF of your bill. Our AI will instantly detect products, quantities, and prices for you.
                        </p>
                        
                        <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                <FaCamera className="text-lg" /> Browse or Take Photo
                            </button>
                        </div>
                    </div>
                    <input type="file" accept="image/*,.pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                </div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
                <div className="bg-white p-12 sm:p-20 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 text-center flex flex-col items-center justify-center min-h-[400px] animate-fadeIn relative overflow-hidden">
                    <div className="relative w-32 h-40 sm:w-40 sm:h-52 bg-slate-50 border-2 border-slate-200 rounded-xl mb-10 overflow-hidden shadow-inner">
                        {/* Fake Document Lines */}
                        <div className="absolute inset-x-4 top-6 space-y-3">
                            <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-2 bg-slate-200 rounded w-full"></div>
                            <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                            <div className="h-2 bg-slate-200 rounded w-full mt-6"></div>
                            <div className="h-2 bg-slate-200 rounded w-4/5"></div>
                        </div>
                        {/* Scanner Line Animation */}
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_3px_rgba(99,102,241,0.6)] animate-[scan_2s_ease-in-out_infinite_alternate]"></div>
                    </div>
                    
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3 animate-pulse">
                        Extracting Data with AI...
                    </h2>
                    <p className="text-base font-bold text-slate-500 animate-pulse">Please wait while we read products, prices, and taxes</p>
                </div>
            )}

            {/* Review Step */}
            {step === 'review' && (
                <div className="animate-fadeIn pb-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md">
                                <FaCheck size={14} />
                            </div>
                            <h3 className="font-black text-emerald-800 text-lg">
                                {parsedItems.length} Products Found
                            </h3>
                        </div>
                        <button 
                            onClick={() => setStep('upload')}
                            className="text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-5 py-2.5 rounded-xl hover:bg-indigo-100 hover:shadow-sm transition-all"
                        >
                            Upload Another Bill
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {parsedItems.map((item, index) => (
                            <div key={item.id} className={`bg-white rounded-3xl p-5 sm:p-6 transition-all duration-300 border-2 ${item.selected ? 'border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : 'border-transparent opacity-50 bg-slate-50'}`}>
                                <div className="flex flex-col sm:flex-row gap-5">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="pt-2">
                                            <div className="relative flex items-center justify-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={item.selected}
                                                    onChange={(e) => updateItem(item.id, 'selected', e.target.checked)}
                                                    className="peer w-6 h-6 sm:w-7 sm:h-7 appearance-none rounded-lg border-2 border-slate-300 checked:border-indigo-600 checked:bg-indigo-600 cursor-pointer transition-all focus:ring-4 focus:ring-indigo-100"
                                                />
                                                <FaCheck className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none w-3 h-3 sm:w-4 sm:h-4" />
                                            </div>
                                        </div>
                                        <div className="flex-1 w-full space-y-4 sm:space-y-5">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Product Name</label>
                                                    {item.isExisting && (
                                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            Already in Stock (+{item.quantity})
                                                        </span>
                                                    )}
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={item.name}
                                                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                    className="w-full text-lg sm:text-xl font-black text-slate-800 bg-transparent border-b-2 border-slate-100 hover:border-slate-300 focus:border-indigo-600 focus:outline-none pb-1 transition-colors"
                                                    placeholder="Enter product name"
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block">Quantity</label>
                                                    <input 
                                                        type="number" 
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                                        className="w-full text-base font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 focus:outline-none"
                                                    />
                                                </div>
                                                
                                                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block">GST Rate (%)</label>
                                                    <select 
                                                        value={item.gstRate}
                                                        onChange={(e) => updateItem(item.id, 'gstRate', Number(e.target.value))}
                                                        className="w-full text-base font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 focus:outline-none cursor-pointer"
                                                    >
                                                        <option value="0">0%</option>
                                                        <option value="5">5%</option>
                                                        <option value="12">12%</option>
                                                        <option value="18">18%</option>
                                                        <option value="28">28%</option>
                                                    </select>
                                                </div>
                                                
                                                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block">Purchase Price</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="number" 
                                                            value={item.purchasePrice}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                updateItem(item.id, 'purchasePrice', val);
                                                                if (!item.isExisting) {
                                                                    updateItem(item.id, 'sellingPrice', Number((val * 1.2).toFixed(2)));
                                                                }
                                                            }}
                                                            className="w-full text-base font-bold text-slate-700 bg-transparent border-none p-0 pr-6 focus:ring-0 focus:outline-none text-left"
                                                        />
                                                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                                            <span className="font-bold text-slate-400">₹</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-indigo-50 rounded-2xl p-3 border border-indigo-100 ring-1 ring-indigo-500/20 shadow-inner">
                                                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-1.5 block">Selling Price</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="number" 
                                                            value={item.sellingPrice}
                                                            onChange={(e) => updateItem(item.id, 'sellingPrice', Number(e.target.value))}
                                                            className="w-full text-lg font-black text-indigo-700 bg-transparent border-none p-0 pr-6 focus:ring-0 focus:outline-none text-left"
                                                        />
                                                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                                            <span className="font-black text-indigo-400">₹</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Floating Save Bar */}
                    <div className="fixed bottom-4 sm:bottom-6 left-2 right-2 sm:left-6 sm:right-6 md:left-[300px] lg:left-[320px] p-4 bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] rounded-3xl z-40 flex items-center justify-between gap-4">
                        <div className="hidden sm:block">
                            <p className="text-sm font-bold text-slate-500">Selected Items</p>
                            <p className="text-xl font-black text-slate-800">{parsedItems.filter(i => i.selected).length} / {parsedItems.length}</p>
                        </div>
                        <button 
                            onClick={handleSave}
                            className="flex-1 sm:flex-none w-full sm:w-auto py-4 px-8 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 text-lg"
                        >
                            <FaSave className="text-xl" /> Save to Inventory
                        </button>
                    </div>
                </div>
            )}
            
            {/* Custom Animations for Tailwind */}
            <style jsx global>{`
                @keyframes scan {
                    0% { top: 10%; }
                    100% { top: 90%; }
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
