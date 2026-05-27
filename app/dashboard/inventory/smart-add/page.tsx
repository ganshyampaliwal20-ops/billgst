'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUpload, FaCamera, FaSpinner, FaCheck, FaSave, FaTrash, FaRobot, FaArrowLeft, FaFileInvoice, FaMagic, FaInfoCircle } from 'react-icons/fa';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    const MAX_DIM = 1500;
                    if (width > height && width > MAX_DIM) {
                        height *= MAX_DIM / width;
                        width = MAX_DIM;
                    } else if (height > MAX_DIM) {
                        width *= MAX_DIM / height;
                        height = MAX_DIM;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                        setImage(compressedBase64);
                        processImage(compressedBase64);
                    }
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        } else {
            if (file.size > 4 * 1024 * 1024) {
                toast.error("File is too large! Please upload a file smaller than 4MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64 = event.target?.result as string;
                setImage(base64);
                await processImage(base64);
            };
            reader.readAsDataURL(file);
        }
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

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error('Server encountered an error (likely Image too large or AI configuration error)');
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to parse invoice');

            if (data.items && data.items.length > 0) {
                const mappedItems = data.items.map((item: any) => {
                    const existingProduct = products?.find((p: any) => p.name.toLowerCase().trim() === (item.name || '').toLowerCase().trim());
                    
                    const purchasePrice = Number(item.purchasePrice) || existingProduct?.purchase_price || 0;
                    const sellingPrice = existingProduct?.price || (purchasePrice ? purchasePrice * 1.2 : 0);
                    let markup = 20;
                    if (purchasePrice > 0) {
                        markup = Number(((sellingPrice - purchasePrice) / purchasePrice * 100).toFixed(2));
                    }

                    return {
                        id: crypto.randomUUID(),
                        name: item.name || '',
                        quantity: Number(item.quantity) || 1,
                        unit: existingProduct?.unit || 'PCS',
                        purchasePrice: purchasePrice,
                        sellingPrice: sellingPrice,
                        markup: markup,
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
                    await updateProduct(item.existingId, {
                        stock_quantity: item.currentStock + item.quantity,
                        purchase_price: item.purchasePrice,
                        price: item.sellingPrice || item.purchasePrice,
                        unit: item.unit
                    });
                } else {
                    await addProduct({
                        id: crypto.randomUUID(),
                        name: item.name,
                        price: item.sellingPrice || item.purchasePrice,
                        purchase_price: item.purchasePrice,
                        stock_quantity: item.quantity,
                        gst_rate: item.gstRate,
                        unit: item.unit,
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
        setParsedItems(prev => prev.map(item => {
            if (item.id !== id) return item;

            const newItem = { ...item, [field]: value };

            if (field === 'purchasePrice') {
                newItem.sellingPrice = Number((value * (1 + newItem.markup / 100)).toFixed(2));
            } else if (field === 'markup') {
                newItem.sellingPrice = Number((newItem.purchasePrice * (1 + value / 100)).toFixed(2));
            } else if (field === 'sellingPrice') {
                if (newItem.purchasePrice > 0) {
                    newItem.markup = Number(((value - newItem.purchasePrice) / newItem.purchasePrice * 100).toFixed(2));
                }
            }

            return newItem;
        }));
    };

    return (
        <div className="relative min-h-[calc(100vh-60px)] bg-[#0c0e14] text-slate-100 overflow-hidden flex flex-col items-center py-6 px-4">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                .font-syne { font-family: 'Syne', sans-serif; }
                .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
                .hero-scanner {
                    position: absolute;
                    top: -100px;
                    left: -50%;
                    width: 200%;
                    height: 10px;
                    background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.8), transparent);
                    box-shadow: 0 0 30px 10px rgba(16, 185, 129, 0.3);
                    transform: rotate(15deg);
                    animation: heroScan 4s infinite linear;
                    z-index: 0;
                    pointer-events: none;
                }
                @keyframes heroScan {
                    0% { top: -200px; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 120%; opacity: 0; }
                }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
                input[type=number] {
                  -moz-appearance: textfield;
                }
            `}} />

            <div className="w-full max-w-[480px] mx-auto relative z-10 flex flex-col font-body pb-28">
                
                {/* Header */}
                <div className="flex items-center justify-center mb-8 relative overflow-hidden rounded-[2rem] bg-slate-900/40 py-5 px-6 border border-slate-800 backdrop-blur-xl">
                    <div className="hero-scanner"></div>
                    <button onClick={() => router.push('/dashboard/inventory')} className="absolute left-6 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 z-10">
                        <FaArrowLeft className="text-white" />
                    </button>
                    <div className="z-10 text-center">
                        <h1 className="text-2xl font-syne font-extrabold text-white">Smart Scan</h1>
                        <p className="text-[11px] text-emerald-400 font-bold mt-1 tracking-wider uppercase">AI Powered Entry</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Upload Step */}
                    {step === 'upload' && (
                        <motion.div 
                            key="upload"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900/60 rounded-[2rem] border border-slate-800 p-6 text-center mt-4"
                        >
                            <div 
                                className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-400 bg-indigo-500/5 rounded-[1.5rem] py-14 px-6 cursor-pointer transition-all flex flex-col items-center group mb-8" 
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-20 h-20 bg-indigo-500/20 rounded-[1.2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                    <FaCamera className="text-3xl text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-syne font-bold text-white mb-2">Upload Bill Image</h2>
                                <p className="text-xs text-slate-400 mb-8 px-4">Take a photo or upload PDF of your supplier invoice</p>
                                <button className="bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold py-3.5 px-8 rounded-xl text-sm hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2">
                                    <FaUpload /> Choose File
                                </button>
                            </div>
                            
                            {/* Description Box */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                                className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-5 px-[5px] text-left flex gap-3 items-start"
                            >
                                <div className="text-emerald-400 mt-0.5 ml-1">
                                    <FaInfoCircle className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-emerald-400 mb-1.5 font-syne">How it works?</h3>
                                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                                        Smart AI Scanner automatically reads products, quantities, prices, and GST from your supplier invoices. No need to manually type everything. Just upload and verify!
                                    </p>
                                </div>
                            </motion.div>

                            <input type="file" accept="image/*,.pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        </motion.div>
                    )}

                    {/* Processing Step */}
                    {step === 'processing' && (
                        <motion.div 
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-slate-900/60 rounded-[2rem] border border-slate-800 p-12 text-center flex flex-col items-center min-h-[400px] justify-center"
                        >
                            <div className="relative w-28 h-36 bg-slate-800 rounded-xl mb-8 overflow-hidden border border-slate-700">
                                <motion.div 
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                                    className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_15px_3px_rgba(16,185,129,0.5)] z-10"
                                />
                                <div className="absolute inset-x-4 top-6 space-y-3">
                                    <div className="h-1.5 bg-slate-600 rounded w-3/4" />
                                    <div className="h-1.5 bg-slate-600 rounded w-full" />
                                    <div className="h-1.5 bg-slate-600 rounded w-5/6" />
                                </div>
                            </div>
                            <h2 className="text-xl font-syne font-bold text-emerald-400 mb-2">Extracting Details...</h2>
                            <p className="text-xs text-slate-400">Please wait while Vision AI reads your bill</p>
                        </motion.div>
                    )}

                    {/* Review Step */}
                    {step === 'review' && (
                        <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="flex justify-between items-center mb-2 px-2">
                                <div className="text-sm font-bold text-slate-300">Found {parsedItems.length} Items</div>
                                <button onClick={() => setStep('upload')} className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                                    Scan Another
                                </button>
                            </div>
                            
                            {parsedItems.map((item, index) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={item.id} 
                                    className={`bg-slate-900 rounded-3xl py-4 px-[5px] border-2 transition-all ${item.selected ? 'border-emerald-500/40 shadow-[0_4px_20px_rgba(16,185,129,0.05)]' : 'border-slate-800 opacity-60'}`}
                                >
                                    {/* Header & GST */}
                                    <div className="flex justify-between items-start mb-4 gap-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div 
                                                className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 mt-1 cursor-pointer transition-colors ${item.selected ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-slate-600'}`}
                                                onClick={() => updateItem(item.id, 'selected', !item.selected)}
                                            >
                                                <FaCheck className={`text-white text-[10px] ${item.selected ? 'opacity-100' : 'opacity-0'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <input 
                                                    type="text" 
                                                    value={item.name}
                                                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                    className="w-full text-base font-bold text-white bg-transparent border-b border-dashed border-slate-600 focus:border-emerald-400 focus:outline-none pb-1 px-2"
                                                    placeholder="Product Name"
                                                />
                                                {item.isExisting && (
                                                    <div className="text-[10px] text-emerald-400 mt-1.5 font-bold flex items-center gap-1 px-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Existing (Stock: {item.currentStock})
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="bg-slate-800 rounded-lg p-1 px-2 border border-slate-700 flex items-center gap-1">
                                                <span className="text-[9px] font-bold text-slate-400">GST</span>
                                                <select 
                                                    value={item.gstRate}
                                                    onChange={(e) => updateItem(item.id, 'gstRate', Number(e.target.value))}
                                                    className="text-xs font-bold text-white bg-transparent border-none p-0 focus:ring-0 outline-none appearance-none cursor-pointer text-center"
                                                >
                                                    <option value="0" className="bg-slate-800">0%</option>
                                                    <option value="5" className="bg-slate-800">5%</option>
                                                    <option value="12" className="bg-slate-800">12%</option>
                                                    <option value="18" className="bg-slate-800">18%</option>
                                                    <option value="28" className="bg-slate-800">28%</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Qty & Unit */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-slate-800/50 rounded-xl p-[5px] border border-slate-700/50 min-w-0">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1 px-2 truncate">QTY</label>
                                            <input 
                                                type="number" 
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                                className="w-full min-w-0 text-sm font-bold text-white bg-transparent border-none p-0 px-2 focus:ring-0 outline-none"
                                            />
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-[5px] border border-slate-700/50 min-w-0">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1 px-2 truncate">UNIT</label>
                                            <input 
                                                type="text" 
                                                value={item.unit}
                                                onChange={(e) => updateItem(item.id, 'unit', e.target.value.toUpperCase())}
                                                className="w-full min-w-0 text-sm font-bold text-white bg-transparent border-none p-0 px-2 focus:ring-0 outline-none uppercase"
                                                placeholder="PCS"
                                            />
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="grid grid-cols-3 gap-2 items-end">
                                        <div className="col-span-1 min-w-0 bg-slate-800/50 rounded-xl p-[5px] border border-slate-700/50">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1 px-2 truncate">Purchase</label>
                                            <input 
                                                type="number" 
                                                value={item.purchasePrice}
                                                onChange={(e) => updateItem(item.id, 'purchasePrice', Number(e.target.value))}
                                                className="w-full min-w-0 text-sm font-bold text-white bg-transparent border-none p-0 px-2 focus:ring-0 outline-none"
                                            />
                                        </div>
                                        
                                        <div className="col-span-1 min-w-0 bg-slate-800/50 rounded-xl p-[5px] border border-slate-700/50 flex flex-col justify-between h-full">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1 text-center px-2 truncate">Markup %</label>
                                            <div className="flex items-center justify-center flex-1 px-2">
                                                <span className="text-xs text-emerald-400 font-bold">+</span>
                                                <input 
                                                    type="number" 
                                                    value={item.markup}
                                                    onChange={(e) => updateItem(item.id, 'markup', Number(e.target.value))}
                                                    className="w-full min-w-0 text-center text-xs font-bold text-emerald-400 bg-transparent border-none p-0 focus:ring-0 outline-none"
                                                />
                                                <span className="text-xs text-emerald-400 font-bold">%</span>
                                            </div>
                                        </div>

                                        <div className="col-span-1 min-w-0 bg-indigo-900/40 rounded-xl p-[5px] border border-indigo-500/30 text-right">
                                            <label className="text-[9px] font-bold text-indigo-300 uppercase block mb-1 px-2 truncate">Selling</label>
                                            <input 
                                                type="number" 
                                                value={item.sellingPrice}
                                                onChange={(e) => updateItem(item.id, 'sellingPrice', Number(e.target.value))}
                                                className="w-full min-w-0 text-lg font-black text-indigo-300 bg-transparent border-none p-0 px-2 focus:ring-0 outline-none text-right"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Sticky FAB Button */}
            {step === 'review' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14] to-transparent z-50 pointer-events-none">
                    <motion.button 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        className="w-full max-w-[448px] mx-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-syne font-black py-4 px-6 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 border-2 border-emerald-400 pointer-events-auto"
                    >
                        <FaSave className="text-lg" />
                        SAVE TO INVENTORY ({parsedItems.filter(i => i.selected).length})
                    </motion.button>
                </div>
            )}
        </div>
    );
}
