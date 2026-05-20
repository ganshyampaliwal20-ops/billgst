'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUpload, FaCamera, FaSpinner, FaCheck, FaSave, FaTrash, FaRobot, FaArrowLeft, FaFileInvoice, FaMagic } from 'react-icons/fa';
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

        // Compress images to avoid Vercel 4.5MB payload limit
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Scale down to max 1500px
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
                        // Compress as JPEG
                        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                        setImage(compressedBase64);
                        processImage(compressedBase64);
                    }
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        } else {
            // For PDFs, send as is but check size
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

            // Check if response is actually JSON before parsing to prevent SyntaxError
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error('Server encountered an error (likely Image too large or AI configuration error)');
            }

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
        <div className="relative min-h-[calc(100vh-60px)] bg-[#0f172a] text-slate-100 overflow-hidden flex flex-col justify-center items-center py-10 px-4 sm:px-8">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-blob animation-delay-2000" />
            </div>

            <div className="w-full max-w-5xl mx-auto relative z-10">
                {/* Glassmorphic Header */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center text-center gap-4 mb-10 bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] relative"
                >
                    <button 
                        onClick={() => router.push('/dashboard/inventory')}
                        className="sm:absolute sm:left-6 sm:top-1/2 sm:-translate-y-1/2 p-3 px-6 rounded-2xl bg-white/5 hover:bg-white/20 text-white transition-all border border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] group flex items-center gap-2"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> <span className="sm:hidden font-bold">Back</span>
                    </button>
                    <div className="flex-1 mt-2 sm:mt-0">
                        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight flex items-center justify-center gap-3">
                            <FaMagic className="text-purple-400" /> Smart AI Scanner
                        </h1>
                        <p className="text-sm sm:text-base font-medium text-slate-400 mt-2">Transform physical supplier bills into digital inventory instantly</p>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* Upload Step */}
                    {step === 'upload' && (
                        <motion.div 
                            key="upload"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white/5 backdrop-blur-md p-6 sm:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl text-center relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div 
                                className="relative border-2 border-dashed border-indigo-400/30 hover:border-indigo-400 bg-indigo-900/10 rounded-[2rem] p-10 sm:p-16 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center" 
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center mx-auto mb-8 border border-white/20"
                                >
                                    <FaFileInvoice className="text-4xl text-white drop-shadow-md" />
                                </motion.div>
                                
                                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Upload Supplier Invoice</h2>
                                <p className="text-base font-medium text-indigo-200/80 mb-10 max-w-md mx-auto leading-relaxed">
                                    Upload a photo, scan, or PDF of your bill. Our Vision AI will instantly detect products, quantities, and prices.
                                </p>
                                
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative overflow-hidden bg-white text-indigo-900 font-black py-4 px-8 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3 mx-auto"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <FaCamera className="text-xl" /> Browse or Take Photo
                                    </span>
                                </motion.button>
                            </div>
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
                            className="bg-white/5 backdrop-blur-md p-12 sm:p-20 rounded-[2.5rem] border border-white/10 shadow-2xl text-center flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 animate-pulse" />
                            
                            <div className="relative w-40 h-56 bg-slate-800/80 border border-slate-600 rounded-2xl mb-12 overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.3)] backdrop-blur-sm">
                                {/* Fake Document Lines */}
                                <div className="absolute inset-x-6 top-8 space-y-4">
                                    <div className="h-2 bg-slate-600 rounded w-3/4" />
                                    <div className="h-2 bg-slate-600 rounded w-full" />
                                    <div className="h-2 bg-slate-600 rounded w-5/6" />
                                    <div className="h-2 bg-slate-600 rounded w-full mt-8" />
                                    <div className="h-2 bg-slate-600 rounded w-4/5" />
                                </div>
                                {/* Advanced Scanner Line */}
                                <motion.div 
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                                    className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_20px_4px_rgba(34,211,238,0.8)] z-10"
                                >
                                    <div className="absolute inset-0 h-12 -top-11 bg-gradient-to-t from-cyan-400/40 to-transparent pointer-events-none" />
                                </motion.div>
                            </div>
                            
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 drop-shadow-sm">
                                AI Extracting Data...
                            </h2>
                            <p className="text-lg font-medium text-slate-400">Reading products, prices, and taxes in real-time</p>
                        </motion.div>
                    )}

                    {/* Review Step */}
                    {step === 'review' && (
                        <motion.div 
                            key="review"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pb-20"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <motion.div 
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    className="bg-emerald-500/10 border border-emerald-500/30 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md"
                                >
                                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                        <FaCheck size={18} />
                                    </div>
                                    <h3 className="font-black text-emerald-400 text-xl tracking-tight">
                                        {parsedItems.length} Products Found
                                    </h3>
                                </motion.div>
                                <button 
                                    onClick={() => setStep('upload')}
                                    className="text-sm font-bold text-white bg-white/10 border border-white/20 px-6 py-3 rounded-xl hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all"
                                >
                                    Upload Another Bill
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                {parsedItems.map((item, index) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        key={item.id} 
                                        className={`bg-slate-800/50 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 transition-all duration-300 border-2 ${item.selected ? 'border-indigo-500/50 shadow-[0_10px_40px_rgba(99,102,241,0.15)]' : 'border-slate-700/50 opacity-60 hover:opacity-80'}`}
                                    >
                                        <div className="flex flex-col xl:flex-row gap-6">
                                            <div className="flex items-start gap-5 flex-1">
                                                <div className="pt-2">
                                                    <div className="relative flex items-center justify-center cursor-pointer" onClick={() => updateItem(item.id, 'selected', !item.selected)}>
                                                        <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${item.selected ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-700 border-slate-600'}`}>
                                                            <FaCheck className={`text-white text-sm transition-opacity ${item.selected ? 'opacity-100' : 'opacity-0'}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 w-full space-y-6">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                                            <label className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em]">Product Name</label>
                                                            {item.isExisting && (
                                                                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                                                    In Stock (+{item.quantity})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            value={item.name}
                                                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                            className="w-full text-xl sm:text-2xl font-black text-white bg-transparent border-b-2 border-slate-600 hover:border-indigo-400 focus:border-indigo-500 focus:outline-none pb-2 transition-colors placeholder:text-slate-600"
                                                            placeholder="Enter product name"
                                                        />
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                                        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-500 transition-colors">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quantity</label>
                                                            <input 
                                                                type="number" 
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                                                className="w-full text-lg font-bold text-white bg-transparent border-none p-0 focus:ring-0 focus:outline-none"
                                                            />
                                                        </div>
                                                        
                                                        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-500 transition-colors">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">GST Rate (%)</label>
                                                            <select 
                                                                value={item.gstRate}
                                                                onChange={(e) => updateItem(item.id, 'gstRate', Number(e.target.value))}
                                                                className="w-full text-lg font-bold text-white bg-transparent border-none p-0 focus:ring-0 focus:outline-none cursor-pointer appearance-none"
                                                            >
                                                                <option value="0" className="bg-slate-800">0%</option>
                                                                <option value="5" className="bg-slate-800">5%</option>
                                                                <option value="12" className="bg-slate-800">12%</option>
                                                                <option value="18" className="bg-slate-800">18%</option>
                                                                <option value="28" className="bg-slate-800">28%</option>
                                                            </select>
                                                        </div>
                                                        
                                                        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-500 transition-colors">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Purchase Price</label>
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
                                                                    className="w-full text-lg font-bold text-white bg-transparent border-none p-0 pr-6 focus:ring-0 focus:outline-none text-left"
                                                                />
                                                                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                                                                    <span className="font-bold text-slate-500">₹</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bg-indigo-900/40 rounded-2xl p-4 border border-indigo-500/30 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] relative overflow-hidden group">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 block relative z-10">Selling Price</label>
                                                            <div className="relative z-10">
                                                                <input 
                                                                    type="number" 
                                                                    value={item.sellingPrice}
                                                                    onChange={(e) => updateItem(item.id, 'sellingPrice', Number(e.target.value))}
                                                                    className="w-full text-xl font-black text-indigo-300 bg-transparent border-none p-0 pr-6 focus:ring-0 focus:outline-none text-left"
                                                                />
                                                                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                                                                    <span className="font-black text-indigo-500/50">₹</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Floating Save Bar */}
                            <motion.div 
                                initial={{ y: 100 }}
                                animate={{ y: 0 }}
                                className="fixed bottom-6 left-4 right-4 md:left-[320px] md:right-8 p-5 bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] z-40 flex items-center justify-between gap-6"
                            >
                                <div className="hidden sm:block pl-2">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Selected to Save</p>
                                    <p className="text-2xl font-black text-white">{parsedItems.filter(i => i.selected).length} <span className="text-slate-500 text-lg">/ {parsedItems.length}</span></p>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    className="flex-1 sm:flex-none w-full sm:w-auto py-4 px-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center gap-3 text-lg border border-white/10"
                                >
                                    <FaSave className="text-xl" /> Save to Inventory
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <style jsx global>{`
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
                    animation: blob 10s infinite alternate ease-in-out;
                }
            `}</style>
        </div>
    );
}
