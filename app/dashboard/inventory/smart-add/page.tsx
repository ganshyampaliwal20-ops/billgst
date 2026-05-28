'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUpload, FaCamera, FaSpinner, FaCheck, FaCheckCircle, FaSave, FaTrash, FaRobot, FaArrowLeft, FaFileInvoice, FaMagic, FaInfoCircle, FaMobileAlt, FaCloudUploadAlt } from 'react-icons/fa';
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
    const [failedItems, setFailedItems] = useState<{name: string, reason: string}[]>([]);
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
        let failures: {name: string, reason: string}[] = [];
        let successfulItemIds: string[] = [];

        for (const item of itemsToSave) {
            try {
                if (item.isExisting && item.existingId) {
                    const res = await updateProduct(item.existingId, {
                        stock_quantity: item.currentStock + item.quantity,
                        purchase_price: item.purchasePrice,
                        price: item.sellingPrice || item.purchasePrice,
                        unit: item.unit
                    });
                    if (res?.error) {
                        failures.push({ name: item.name, reason: res.error });
                    } else {
                        successCount++;
                        successfulItemIds.push(item.id);
                    }
                } else {
                    const res = await addProduct({
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
                    if (res?.error) {
                        failures.push({ name: item.name, reason: res.error });
                    } else {
                        successCount++;
                        successfulItemIds.push(item.id);
                    }
                }
            } catch (err: any) {
                console.error('Error saving item:', item.name, err);
                failures.push({ name: item.name, reason: err.message || 'Unknown error' });
            }
        }

        toast.dismiss(loadToast);
        
        if (failures.length > 0) {
            setFailedItems(failures);
            if (successCount > 0) {
                toast.success(`Successfully saved ${successCount} items! Some items failed.`);
                setParsedItems(prev => prev.filter(p => !successfulItemIds.includes(p.id)));
            } else {
                toast.error(`Failed to save items.`);
            }
        } else {
            toast.success(`Successfully saved ${successCount} items!`);
            router.push('/dashboard/inventory');
        }
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
                .upload-scanner {
                    position: absolute;
                    top: -100px;
                    left: -50%;
                    width: 200%;
                    height: 5px;
                    background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.9), rgba(59, 130, 246, 0.9), transparent);
                    box-shadow: 0 0 25px 8px rgba(59, 130, 246, 0.4);
                    transform: rotate(5deg);
                    animation: uploadScan 3s infinite linear;
                    z-index: 0;
                    pointer-events: none;
                }
                @keyframes uploadScan {
                    0% { top: -50px; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 110%; opacity: 0; }
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

            <div className={`w-full mx-auto relative z-10 flex flex-col flex-1 font-body pb-16 ${step === 'processing' ? 'max-w-5xl' : 'max-w-[480px]'}`}>
                
                {/* Header */}
                <div className="flex items-center justify-center mb-8 relative overflow-hidden rounded-[2rem] bg-slate-900/40 py-10 px-8 border border-slate-800 backdrop-blur-xl min-h-[160px]">
                    <div className="hero-scanner"></div>
                    <button onClick={() => router.push('/dashboard/inventory')} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 z-10">
                        <FaArrowLeft className="text-white" />
                    </button>
                    <div className="z-10 text-center">
                        <h1 className="text-3xl font-body font-bold text-white uppercase tracking-widest">SMART SCANNER</h1>
                        <p className="text-[12px] text-emerald-400 font-bold mt-2 tracking-[0.2em] uppercase">AI Powered Entry</p>
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
                            className="bg-transparent flex-1 flex flex-col w-full relative z-10"
                        >
                            {/* The Upload Card Wrapper (Flex 1 to center vertically) */}
                            <div className="flex-1 flex flex-col justify-center items-center w-full max-w-[400px] mx-auto pb-6 self-center">
                                {/* The Upload Card */}
                                <div className="border-[1.5px] border-dashed border-purple-500/50 bg-white/5 hover:bg-purple-500/10 rounded-[20px] p-6 pb-5 transition-all flex flex-col items-center relative group w-full overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                                    
                                    {/* Inner Glow */}
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(138,92,246,0.1)_0%,transparent_65%)] pointer-events-none rounded-[20px]"></div>

                                    {/* Scanner Animation */}
                                    <div className="upload-scanner"></div>

                                    {/* Icon */}
                                    <div className="w-[70px] h-[70px] bg-gradient-to-br from-purple-600 to-purple-400 rounded-[18px] flex items-center justify-center mb-4 shadow-[0_4px_20px_rgba(124,58,237,0.4)] relative z-10">
                                        <FaFileInvoice className="text-[32px] text-white" />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Upload Supplier Invoice</h3>
                                    <p className="text-[13px] text-slate-400 mb-5 leading-relaxed relative z-10 text-center">
                                        Photo, scan, ya PDF upload karo apne bill ki.<br />
                                        Vision AI turant products, quantities<br />
                                        aur prices detect kar lega.
                                    </p>

                                    {/* Format Badges */}
                                    <div className="flex justify-center gap-2 mb-6 relative z-10">
                                        <span className="bg-white/5 border border-white/10 text-[#c4c9e4] text-[12px] font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5">📷 Photo</span>
                                        <span className="bg-white/5 border border-white/10 text-[#c4c9e4] text-[12px] font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5">📄 Scan</span>
                                        <span className="bg-white/5 border border-white/10 text-[#c4c9e4] text-[12px] font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5">📑 PDF</span>
                                    </div>

                                    {/* Main Button */}
                                    <button 
                                        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold py-3.5 px-8 rounded-full text-[15px] hover:-translate-y-[1px] hover:shadow-[0_6px_28px_rgba(124,58,237,0.6)] transition-all flex items-center justify-center gap-2 relative z-10"
                                    >
                                        <FaCamera className="text-xl" /> Browse or Take Photo
                                    </button>

                                    {/* Divider */}
                                    <div className="flex items-center justify-center gap-3 w-full my-4 relative z-10">
                                        <div className="h-[1px] w-12 bg-white/10"></div>
                                        <span className="text-[12px] font-semibold text-slate-500">ya inse upload karo</span>
                                        <div className="h-[1px] w-12 bg-white/10"></div>
                                    </div>

                                    {/* Secondary Options */}
                                    <div className="grid grid-cols-2 gap-3 w-full relative z-10">
                                        <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="flex flex-col items-center justify-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/40 rounded-xl py-3 transition-colors text-purple-300">
                                            <FaMobileAlt className="text-[22px]" />
                                            <span className="text-[12px] font-semibold text-slate-400">Gallery se</span>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="flex flex-col items-center justify-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/40 rounded-xl py-3 transition-colors text-purple-300">
                                            <FaCloudUploadAlt className="text-[22px]" />
                                            <span className="text-[12px] font-semibold text-slate-400">Files se</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Feature Chips Pinned to Bottom */}
                            <div className="mt-auto flex justify-center gap-2 w-full pt-4">
                                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/25 rounded-xl py-2 px-1 text-center flex flex-col items-center justify-center gap-1">
                                    <FaMagic className="text-emerald-400 text-lg" />
                                    <span className="text-[11px] font-semibold text-emerald-300">Instant Scan</span>
                                </div>
                                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/25 rounded-xl py-2 px-1 text-center flex flex-col items-center justify-center gap-1">
                                    <FaCheck className="text-emerald-400 text-lg" />
                                    <span className="text-[11px] font-semibold text-emerald-300">Auto Items</span>
                                </div>
                                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/25 rounded-xl py-2 px-1 text-center flex flex-col items-center justify-center gap-1">
                                    <FaCheckCircle className="text-emerald-400 text-lg" />
                                    <span className="text-[11px] font-semibold text-emerald-300">Accurate</span>
                                </div>
                            </div>

                            <input type="file" accept="image/*,.pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        </motion.div>
                    )}

                    {/* Processing Step */}
                    {/* Processing Step */}
                    {step === 'processing' && (
                        <motion.div 
                            key="processing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="bg-transparent flex-1 flex flex-col items-center justify-center w-full relative z-10 min-h-[500px]"
                        >
                            {/* New Design Card matching the image */}
                            <div className="w-full max-w-[600px] min-h-[400px] md:min-h-[500px] mx-auto bg-[#13161c] border border-slate-800/80 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center shadow-2xl mt-4 relative overflow-hidden">
                                
                                {/* Abstract Document Animation */}
                                <div className="relative w-40 h-52 mb-8">
                                    {/* Corner Brackets */}
                                    <div className="absolute -top-3 -left-3 w-6 h-6 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl"></div>
                                    <div className="absolute -top-3 -right-3 w-6 h-6 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr"></div>
                                    <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl"></div>
                                    <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br"></div>

                                    {/* Document Body */}
                                    <div className="w-full h-full bg-slate-800/80 rounded-sm relative overflow-hidden shadow-lg">
                                        {/* Folded Corner */}
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-[#13161c] z-20 border-b border-l border-slate-800 rounded-bl-sm"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-slate-700/50 z-10" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>

                                        {/* Text lines */}
                                        <div className="absolute inset-x-4 top-10 flex flex-col gap-3 z-10 opacity-70">
                                            <div className="w-3/4 h-1.5 bg-emerald-400 rounded-full"></div>
                                            <div className="w-full h-1.5 bg-slate-500 rounded-full"></div>
                                            <div className="w-5/6 h-1.5 bg-slate-500 rounded-full"></div>
                                            <div className="w-2/3 h-1.5 bg-slate-500 rounded-full"></div>
                                            <div className="w-4/5 h-1.5 bg-slate-500 rounded-full mt-2"></div>
                                            <div className="w-full h-1.5 bg-slate-500 rounded-full"></div>
                                            <div className="w-3/4 h-1.5 bg-slate-500 rounded-full"></div>
                                        </div>

                                        {/* Floating particles */}
                                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity }} className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,1)] z-20"></motion.div>
                                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,1)] z-20"></motion.div>
                                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, delay: 1, repeat: Infinity }} className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,1)] z-20"></motion.div>
                                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, delay: 1.5, repeat: Infinity }} className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,1)] z-20"></motion.div>

                                        {/* Laser Glow animating up and down */}
                                        <motion.div 
                                            animate={{ top: ['0%', '90%', '0%'] }}
                                            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                                            className="absolute left-0 right-0 h-[2px] bg-emerald-400 shadow-[0_0_20px_5px_rgba(16,185,129,0.8)] z-30"
                                        >
                                            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-500/40 to-transparent transform -translate-y-full"></div>
                                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-emerald-500/40 to-transparent"></div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Status Text */}
                                <h2 className="text-xl md:text-2xl font-extrabold text-emerald-400 mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] tracking-wide">
                                    Extracting Details...
                                </h2>
                                
                                {/* Animated Extraction Feed */}
                                <div className="h-6 overflow-hidden relative w-full mb-10 text-center flex justify-center">
                                    <motion.div 
                                        animate={{ y: ['0%', '-20%', '-40%', '-60%', '-80%'] }} 
                                        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                                        className="flex flex-col text-[15px] font-medium"
                                    >
                                        <div className="h-6 flex items-center justify-center gap-2 text-slate-400">Please wait while Vision AI reads your bill</div>
                                        <div className="h-6 flex items-center justify-center gap-2 text-emerald-400">Extracting Product Names...</div>
                                        <div className="h-6 flex items-center justify-center gap-2 text-emerald-400">Checking Bill Qty & Rates...</div>
                                        <div className="h-6 flex items-center justify-center gap-2 text-emerald-400">Calculating Total Amount...</div>
                                        <div className="h-6 flex items-center justify-center gap-2 text-slate-400">Please wait while Vision AI reads your bill</div>
                                    </motion.div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-1.5 bg-slate-800 rounded-full mb-10 overflow-hidden relative border border-slate-700/50 z-10">
                                    <motion.div 
                                        animate={{ width: ['0%', '100%'] }} 
                                        transition={{ duration: 4, ease: "linear", repeat: Infinity }} 
                                        className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,1)] rounded-full"
                                    />
                                </div>

                                {/* Steps Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8 z-10">
                                    <div className="flex flex-col items-center justify-center py-5 px-2 rounded-xl bg-[#171a23] border border-slate-800 text-emerald-500/70">
                                        <FaCamera className="text-2xl mb-3" />
                                        <span className="text-[13px] font-semibold tracking-wide">Scanning</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-5 px-2 rounded-xl bg-[#171a23] border border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
                                        <div className="absolute inset-0 bg-emerald-500/5"></div>
                                        <FaRobot className="text-2xl mb-3 relative z-10" />
                                        <span className="text-[13px] font-semibold tracking-wide relative z-10">Reading</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-5 px-2 rounded-xl bg-[#171a23] border border-slate-800 text-slate-600">
                                        <FaFileInvoice className="text-2xl mb-3" />
                                        <span className="text-[13px] font-semibold tracking-wide">Items</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-5 px-2 rounded-xl bg-[#171a23] border border-slate-800 text-slate-600">
                                        <FaCheck className="text-2xl mb-3" />
                                        <span className="text-[13px] font-semibold tracking-wide">Done</span>
                                    </div>
                                </div>

                                {/* Tag */}
                                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#171a23] border border-emerald-500/30 text-emerald-400 text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)] z-10">
                                    <FaCheckCircle className="text-lg" /> Products
                                </div>

                                {/* Bottom Blue/Orange Animated Scanner Line */}
                                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-900 overflow-hidden">
                                    <motion.div 
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                                        className="w-1/2 h-full bg-gradient-to-r from-transparent via-blue-500 to-orange-500 shadow-[0_0_20px_5px_rgba(59,130,246,0.8)]"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Review Step */}
                    {step === 'review' && (
                        <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex justify-between items-center mb-4 px-[8px]">
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
                                    className={`bg-slate-900 rounded-3xl py-6 px-[8px] border-2 transition-all ${item.selected ? 'border-emerald-500/40 shadow-[0_4px_20px_rgba(16,185,129,0.05)]' : 'border-slate-800 opacity-60'}`}
                                >
                                    {/* Header & GST */}
                                    <div className="flex justify-between items-start mb-5 gap-4">
                                        <div className="flex items-start gap-4 flex-1">
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
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-800/50 rounded-xl py-3 px-[5px] border border-slate-700/50 min-w-0">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1 px-2 truncate">QTY</label>
                                            <input 
                                                type="number" 
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                                className="w-full min-w-0 text-sm font-bold text-white bg-transparent border-none p-0 px-2 focus:ring-0 outline-none"
                                            />
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl py-3 px-[5px] border border-slate-700/50 min-w-0">
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
                                    <div className="grid grid-cols-3 gap-3 items-end">
                                        <div className="col-span-1 min-w-0 bg-slate-800/50 rounded-xl py-3 px-[5px] border border-slate-700/50">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1 px-2 truncate">Purchase</label>
                                            <input 
                                                type="number" 
                                                value={item.purchasePrice}
                                                onChange={(e) => updateItem(item.id, 'purchasePrice', Number(e.target.value))}
                                                className="w-full min-w-0 text-sm font-bold text-white bg-transparent border-none p-0 px-2 focus:ring-0 outline-none"
                                            />
                                        </div>
                                        
                                        <div className="col-span-1 min-w-0 bg-slate-800/50 rounded-xl py-3 px-[5px] border border-slate-700/50 flex flex-col justify-between h-full">
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

                                        <div className="col-span-1 min-w-0 bg-indigo-900/40 rounded-xl py-3 px-[5px] border border-indigo-500/30 text-right flex flex-col justify-between h-full">
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
                            {/* Extra space at bottom to prevent save button overlap */}
                            <div className="h-28 md:h-24 w-full"></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Sticky FAB Button */}
            {step === 'review' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 pb-10 md:pb-6 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14_60%] to-transparent z-50 pointer-events-none">
                    <motion.button 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        className="w-full max-w-[448px] mx-auto bg-green-500 hover:bg-green-600 text-white font-body font-bold py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 pointer-events-auto transition-colors"
                    >
                        <FaSave className="text-lg" />
                        <span>SAVE TO INVENTORY ({parsedItems.filter(i => i.selected).length})</span>
                    </motion.button>
                </div>
            )}

            {/* Failed Items Modal */}
            <AnimatePresence>
                {failedItems.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="flex items-center gap-3 text-red-400 mb-4 pb-4 border-b border-slate-800">
                                <div className="p-2 bg-red-500/10 rounded-full">
                                    <FaInfoCircle className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-syne font-bold text-lg text-white">Some items failed to save</h3>
                                    <p className="text-xs">Please check the reasons below</p>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {failedItems.map((item, idx) => (
                                    <div key={idx} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                        <div className="font-bold text-sm text-white mb-1">{item.name}</div>
                                        <div className="text-xs text-red-400 font-medium bg-red-500/10 p-2 rounded-lg border border-red-500/20">{item.reason}</div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-slate-800">
                                <button 
                                    onClick={() => setFailedItems([])}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
                                >
                                    Close & Review
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
