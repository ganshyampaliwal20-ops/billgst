'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUpload, FaCamera, FaSpinner, FaCheck, FaCheckCircle, FaSave, FaTrash, FaRobot, FaArrowLeft, FaFileInvoice, FaMagic, FaInfoCircle, FaMobileAlt, FaCloudUploadAlt, FaEdit, FaTimes } from 'react-icons/fa';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';


const scannerTranslations: any = {
    en: {
        smartScanner: 'Smart Scanner', aiPowered: 'AI Powered Entry', scanAgain: 'Scan Again',
        profitMarginSet: 'Set Profit Margin', applyToAll: 'Apply % to All Items', itemsFound: 'Items Found',
        selectAll: 'Select All', addMore: 'Add More', qty: 'QTY', unit: 'UNIT',
        purchase: 'Purchase (₹)', markup: 'Markup %', selling: 'Selling (₹)', profit: 'Profit',
        cancel: 'Cancel', saveItems: 'Items Save to Inventory',
        uploadTitle: 'Upload Supplier Invoice', 
        uploadDesc: 'Upload photo, scan, or PDF of your bill.\nVision AI will automatically detect products, quantities and prices.',
        browseBtn: 'Browse or Take Photo', extracting: 'Extracting Details...',
        waitMsg: 'Please wait while Vision AI reads your bill',
        extName: 'Extracting Product Names...',
        checkQty: 'Checking Bill Qty & Rates...',
        calcTotal: 'Calculating Total Amount...',
        failedTitle: 'Some items failed to save',
        failedSub: 'Please check the reasons below',
        closeBtn: 'Close & Review'
    },
    hi: {
        smartScanner: 'स्मार्ट स्कैनर', aiPowered: 'एआई द्वारा एंट्री', scanAgain: 'फिर से स्कैन करें',
        profitMarginSet: 'प्रॉफिट मार्जिन सेट करें', applyToAll: 'यही % सभी आइटम पर लागू करें', itemsFound: 'आइटम मिले',
        selectAll: 'सब सेलेक्ट', addMore: 'और जोड़ें', qty: 'मात्रा (QTY)', unit: 'इकाई (UNIT)',
        purchase: 'खरीद मूल्य (₹)', markup: 'मार्जिन %', selling: 'बिक्री मूल्य (₹)', profit: 'फायदा',
        cancel: 'रद्द करें', saveItems: 'आइटम इन्वेंटरी में सेव करें',
        uploadTitle: 'सप्लायर का बिल अपलोड करें', 
        uploadDesc: 'फोटो, स्कैन, या PDF अपलोड करें।\nVision AI तुरंत प्रोडक्ट और कीमत निकाल लेगा।',
        browseBtn: 'फोटो लें या फाइल चुनें', extracting: 'डिटेल्स निकाल रहे हैं...',
        waitMsg: 'कृपया प्रतीक्षा करें, Vision AI बिल पढ़ रहा है',
        extName: 'प्रोडक्ट के नाम निकाल रहे हैं...',
        checkQty: 'मात्रा और रेट चेक कर रहे हैं...',
        calcTotal: 'कुल राशि जोड़ रहे हैं...',
        failedTitle: 'कुछ आइटम सेव नहीं हो सके',
        failedSub: 'कृपया नीचे दिए गए कारण जांचें',
        closeBtn: 'बंद करें और चेक करें'
    },
    gu: {
        smartScanner: 'સ્માર્ટ સ્કેનર', aiPowered: 'AI દ્વારા એન્ટ્રી', scanAgain: 'ફરીથી સ્કેન કરો',
        profitMarginSet: 'નફો સેટ કરો', applyToAll: 'આ % બધા પર લાગુ કરો', itemsFound: 'વસ્તુઓ મળી',
        selectAll: 'બધું પસંદ કરો', addMore: 'વધુ ઉમેરો', qty: 'માત્રા (QTY)', unit: 'એકમ (UNIT)',
        purchase: 'ખરીદ કિંમત (₹)', markup: 'માર્જિન %', selling: 'વેચાણ કિંમત (₹)', profit: 'નફો',
        cancel: 'રદ કરો', saveItems: 'વસ્તુઓ ઇન્વેન્ટરીમાં સાચવો',
        uploadTitle: 'બિલ અપલોડ કરો', 
        uploadDesc: 'ફોટો, સ્કેન અથવા PDF અપલોડ કરો.\nVision AI આપમેળે ઉત્પાદનો શોધી લેશે.',
        browseBtn: 'ફોટો લો અથવા પસંદ કરો', extracting: 'વિગતો કાઢી રહ્યા છીએ...',
        waitMsg: 'કૃપા કરીને રાહ જુઓ...',
        extName: 'ઉત્પાદન નામ કાઢી રહ્યા છીએ...',
        checkQty: 'માત્રા અને કિંમત ચકાસી રહ્યા છીએ...',
        calcTotal: 'કુલ રકમ ગણતરી કરી રહ્યા છીએ...',
        failedTitle: 'કેટલીક વસ્તુઓ સાચવી શકાઈ નથી',
        failedSub: 'કૃપા કરીને નીચેના કારણો તપાસો',
        closeBtn: 'બંધ કરો અને તપાસો'
    },
    mr: {
        smartScanner: 'स्मार्ट स्कॅनर', aiPowered: 'AI द्वारे एंट्री', scanAgain: 'पुन्हा स्कॅन करा',
        profitMarginSet: 'नफा मार्जिन सेट करा', applyToAll: 'हे % सर्वांवर लागू करा', itemsFound: 'वस्तू सापडल्या',
        selectAll: 'सर्व निवडा', addMore: 'आणखी जोडा', qty: 'प्रमाण (QTY)', unit: 'एकक (UNIT)',
        purchase: 'खरेदी किंमत (₹)', markup: 'मार्जिन %', selling: 'विक्री किंमत (₹)', profit: 'नफा',
        cancel: 'रद्द करा', saveItems: 'वस्तू इन्व्हेंटरीमध्ये सेव्ह करा',
        uploadTitle: 'सप्लायर बिल अपलोड करा', 
        uploadDesc: 'फोटो, स्कॅन किंवा PDF अपलोड करा.\nVision AI आपोआप उत्पादने शोधेल.',
        browseBtn: 'फोटो घ्या किंवा निवडा', extracting: 'तपशील काढत आहे...',
        waitMsg: 'कृपया प्रतीक्षा करा...',
        extName: 'उत्पादनाचे नाव काढत आहे...',
        checkQty: 'प्रमाण आणि दर तपासत आहे...',
        calcTotal: 'एकूण रक्कम मोजत आहे...',
        failedTitle: 'काही वस्तू सेव्ह झाल्या नाहीत',
        failedSub: 'कृपया खालील कारणे तपासा',
        closeBtn: 'बंद करा आणि तपासा'
    }
};


export default function SmartAddPage() {
    const router = useRouter();
    const { products, addProduct, updateProduct, settings } = useStore() as any;
    const lang = settings?.language || 'en';
    const st = scannerTranslations[lang] || scannerTranslations.en;
    
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [parsedItems, setParsedItems] = useState<any[]>([]);
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
    const [failedItems, setFailedItems] = useState<{name: string, reason: string}[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // New states for profit
    const [globalProfit, setGlobalProfit] = useState<number>(20);
    const [isProfitOpen, setIsProfitOpen] = useState(true);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset the input value so that selecting the same file again works
        e.target.value = '';

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
                    } else {
                        toast.error("Failed to process image canvas.");
                    }
                };
                img.onerror = () => {
                    toast.error("Failed to load the image file.");
                };
                img.src = event.target?.result as string;
            };
            reader.onerror = () => {
                toast.error("Failed to read the file.");
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
            reader.onerror = () => {
                toast.error("Failed to read the file.");
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
                    const normalizedItemName = (item.name || '').replaceAll(' ', '').toLowerCase();
                    const existingProduct = products?.find((p: any) => (p.name || '').replaceAll(' ', '').toLowerCase() === normalizedItemName);
                    
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
                        gstRate: Number(item.gstRate) || existingProduct?.gst_rate || 0, // Using 0 as default to match user's UI
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
        const failures: {name: string, reason: string}[] = [];
        const successfulItemIds: string[] = [];

        const stockUpdates: Record<string, number> = {};

        for (const item of itemsToSave) {
            try {
                if (item.isExisting && item.existingId) {
                    const extraQty = stockUpdates[item.existingId] || 0;
                    const res = await updateProduct(item.existingId, {
                        stock_quantity: item.currentStock + extraQty + item.quantity,
                        purchase_price: item.purchasePrice,
                        price: item.sellingPrice || item.purchasePrice,
                        unit: item.unit
                    });
                    if (res?.error) {
                        failures.push({ name: item.name, reason: res.error });
                    } else {
                        successCount++;
                        stockUpdates[item.existingId] = extraQty + item.quantity;
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

            if (field === 'purchasePrice' || field === 'markup' || field === 'gstRate') {
                const pur = Number(newItem.purchasePrice) || 0;
                const mkp = Number(newItem.markup) || 0;
                const gst = Number(newItem.gstRate) || 0;
                const baseSelling = pur * (1 + mkp / 100);
                // User HTML calculates selling as sellingWithGst = baseSelling * (1 + gst / 100)
                newItem.sellingPrice = Number((baseSelling * (1 + gst / 100)).toFixed(2));
            } else if (field === 'sellingPrice') {
                // If they edit selling price directly
                if (newItem.purchasePrice > 0) {
                    const gst = Number(newItem.gstRate) || 0;
                    const baseSelling = value / (1 + gst / 100);
                    newItem.markup = Number(((baseSelling - newItem.purchasePrice) / newItem.purchasePrice * 100).toFixed(2));
                }
            } else if (field === 'name') {
                const normalizedValue = (value || '').replaceAll(' ', '').toLowerCase();
                const existingProduct = products?.find((p: any) => (p.name || '').replaceAll(' ', '').toLowerCase() === normalizedValue);
                newItem.isExisting = !!existingProduct;
                newItem.existingId = existingProduct?.id || null;
                newItem.currentStock = parseInt(existingProduct?.stock_quantity || 0);
            }

            return newItem;
        }));
    };

    const updateGlobalProfitAndApply = (newProfit: number) => {
        setGlobalProfit(newProfit);
        setParsedItems(prev => prev.map(item => {
            const newItem = { ...item, markup: newProfit };
            const pur = Number(newItem.purchasePrice) || 0;
            const gst = Number(newItem.gstRate) || 0;
            const baseSelling = pur * (1 + newProfit / 100);
            newItem.sellingPrice = Number((baseSelling * (1 + gst / 100)).toFixed(2));
            return newItem;
        }));
    };

    const handleApplyProfit = () => {
        updateGlobalProfitAndApply(globalProfit);
        toast.success(`${globalProfit}% applied to all ${parsedItems.length} items!`);
    };

    const handleEditAll = () => {
        setParsedItems(prev => prev.map(item => ({ ...item, selected: true })));
    };

    const handleDeselectAll = () => {
        setParsedItems(prev => prev.map(item => ({ ...item, selected: false })));
    };

    const handleRemoveItem = (id: string) => {
        setParsedItems(prev => prev.filter(i => i.id !== id));
        toast('Item removed');
    };

    return (
        <>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.10.0/tabler-icons.min.css"/>
            <div className="smart-scanner-page relative overflow-x-hidden">
                <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
                :root {
                  --bg: #080b14;
                  --s1: #0e1120;
                  --s2: #141829;
                  --s3: #1a1f35;
                  --border: rgba(255,255,255,0.07);
                  --border2: rgba(255,255,255,0.12);
                  --text: #f0f2ff;
                  --text2: #8b90b8;
                  --text3: #4a5070;
                  --green: #22c55e;
                  --green-glow: rgba(34,197,94,0.15);
                  --cyan: #06b6d4;
                  --cyan-glow: rgba(6,182,212,0.12);
                  --amber: #f59e0b;
                  --amber-glow: rgba(245,158,11,0.12);
                  --red: #f43f5e;
                  --red-glow: rgba(244,63,94,0.12);
                  --purple: #8b5cf6;
                  --purple-glow: rgba(139,92,246,0.12);
                  --accent: #6366f1;
                }
                .smart-scanner-page {
                  font-family: 'Outfit', sans-serif;
                  background: var(--bg);
                  min-height: calc(100vh - 60px);
                  max-width: 480px;
                  margin: 0 auto;
                  color: var(--text);
                  -webkit-font-smoothing: antialiased;
                  overflow-x: hidden;
                  overflow-y: auto;
                }
                .smart-scanner-page * { scrollbar-width: none; }
                .smart-scanner-page *::-webkit-scrollbar { display: none; }

                /* ── TOPBAR ── */
                .topbar {
                  padding: 16px 18px 14px;
                  display: flex; align-items: center; gap: 10px;
                  border-bottom: 1px solid var(--border);
                  background: var(--s1);
                  position: sticky; top: 0; z-index: 100;
                }
                .back-btn {
                  width: 36px; height: 36px; border-radius: 10px;
                  background: var(--s2); border: 1px solid var(--border2);
                  display: flex; align-items: center; justify-content: center;
                  cursor: pointer; flex-shrink: 0; transition: all .15s;
                }
                .back-btn:hover { background: var(--s3); }
                .back-btn svg { width: 17px; height: 17px; color: var(--text2); }
                .tb-center { flex: 1; }
                .tb-title { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -.2px; }
                .tb-sub { font-size: 11px; color: var(--text3); font-weight: 500; margin-top: 1px; }
                .scan-again-btn {
                  display: flex; align-items: center; gap: 6px;
                  background: var(--cyan-glow); border: 1px solid rgba(6,182,212,.3);
                  border-radius: 10px; padding: 8px 13px;
                  font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700;
                  color: var(--cyan); cursor: pointer; transition: all .15s;
                }
                .scan-again-btn:hover { background: rgba(6,182,212,.2); }
                .scan-again-btn svg { width: 14px; height: 14px; }

                /* ── HERO SECTION ── */
                .hero {
                  padding: 22px 18px 18px;
                  background: linear-gradient(160deg, #0e1120, #0a1628);
                  border-bottom: 1px solid var(--border);
                  position: relative; overflow: hidden;
                }
                .hero::before {
                  content: ''; position: absolute;
                  top: -60px; right: -40px; width: 200px; height: 200px; border-radius: 50%;
                  background: radial-gradient(circle, rgba(6,182,212,.08), transparent 70%);
                }
                .hero::after {
                  content: ''; position: absolute;
                  bottom: -30px; left: -20px; width: 140px; height: 140px; border-radius: 50%;
                  background: radial-gradient(circle, rgba(99,102,241,.06), transparent 70%);
                }
                .hero-inner { position: relative; z-index: 1; }

                /* Scanner icon */
                .scanner-icon-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
                .scanner-icon {
                  width: 46px; height: 46px; border-radius: 14px;
                  background: linear-gradient(135deg, #06b6d4, #6366f1);
                  display: flex; align-items: center; justify-content: center;
                  box-shadow: 0 0 28px rgba(6,182,212,.3);
                }
                .scanner-icon svg { width: 22px; height: 22px; color: #fff; }
                .scanner-title-block {}
                .scanner-title { font-size: 22px; font-weight: 900; color: var(--text); letter-spacing: -.5px; line-height: 1; }
                .scanner-ai-tag {
                  display: inline-flex; align-items: center; gap: 4px;
                  font-size: 10px; font-weight: 700; color: var(--cyan);
                  letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;
                }
                .ai-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--cyan); animation: blink 1.5s infinite; }
                @keyframes blink { 0%,100% {opacity:1; transform:scale(1);} 50% {opacity:.4; transform:scale(.7);} }

                /* Profit margin setting bar */
                .profit-bar {
                  background: var(--s2); border: 1px solid var(--border2);
                  border-radius: 14px; padding: 14px 16px; margin-bottom: 0;
                }
                .pb-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
                .pb-title { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: var(--text); }
                .pb-title svg { width: 15px; height: 15px; color: var(--amber); }
                .pb-current {
                  font-family: 'DM Mono', monospace;
                  font-size: 22px; font-weight: 600; color: var(--amber);
                  background: var(--amber-glow); border: 1px solid rgba(245,158,11,.25);
                  padding: 4px 12px; border-radius: 8px;
                }

                /* Preset buttons */
                .preset-row { display: flex; gap: 6px; margin-bottom: 12px; }
                .preset-btn {
                  flex: 1; padding: 8px 4px; border-radius: 9px;
                  background: var(--s3); border: 1.5px solid var(--border2);
                  font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 800;
                  color: var(--text2); cursor: pointer; transition: all .15s; text-align: center;
                }
                .preset-btn:hover { border-color: var(--amber); color: var(--amber); }
                .preset-btn.active { background: var(--amber-glow); border-color: var(--amber); color: var(--amber); }

                /* Custom slider */
                .slider-wrap { display: flex; align-items: center; gap: 10px; }
                .slider-minus, .slider-plus {
                  width: 32px; height: 32px; border-radius: 8px;
                  background: var(--s3); border: 1px solid var(--border2);
                  display: flex; align-items: center; justify-content: center;
                  cursor: pointer; font-size: 18px; font-weight: 700; color: var(--text2);
                  transition: all .12s; flex-shrink: 0; user-select: none;
                }
                .slider-minus:hover, .slider-plus:hover { border-color: var(--amber); color: var(--amber); background: var(--amber-glow); }
                .profit-slider {
                  flex: 1; -webkit-appearance: none; appearance: none;
                  height: 6px; border-radius: 3px; outline: none; cursor: pointer;
                }
                .profit-slider::-webkit-slider-thumb {
                  -webkit-appearance: none; width: 20px; height: 20px;
                  border-radius: 50%; background: var(--amber);
                  border: 3px solid var(--bg);
                  box-shadow: 0 0 12px rgba(245,158,11,.5); cursor: pointer;
                }

                /* Apply btn */
                .apply-btn {
                  width: 100%; margin-top: 12px; padding: 11px; border-radius: 10px;
                  background: linear-gradient(135deg, var(--amber), #d97706);
                  border: none; font-family: 'Outfit', sans-serif;
                  font-size: 13px; font-weight: 800; color: #fff; cursor: pointer;
                  display: flex; align-items: center; justify-content: center; gap: 7px;
                  box-shadow: 0 4px 16px rgba(245,158,11,.3); transition: all .15s;
                }
                .apply-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(245,158,11,.4); }
                .apply-btn svg { width: 14px; height: 14px; }

                /* ── RESULTS HEADER ── */
                .results-header { padding: 14px 18px 10px; display: flex; align-items: center; justify-content: space-between; }
                .found-badge {
                  display: inline-flex; align-items: center; gap: 6px;
                  background: var(--green-glow); border: 1px solid rgba(34,197,94,.25);
                  border-radius: 99px; padding: 5px 12px;
                  font-size: 12px; font-weight: 700; color: var(--green);
                }
                .found-badge svg { width: 12px; height: 12px; }
                .results-actions { display: flex; gap: 6px; }
                .ract {
                  display: flex; align-items: center; gap: 5px;
                  background: var(--s2); border: 1px solid var(--border2);
                  border-radius: 8px; padding: 6px 11px;
                  font-size: 11px; font-weight: 700; color: var(--text2);
                  cursor: pointer; transition: all .12s;
                }
                .ract:hover { border-color: var(--accent); color: var(--text); }
                .ract svg { width: 13px; height: 13px; }

                /* ── ITEM CARDS ── */
                .items-list { padding: 0 14px 100px; display: flex; flex-direction: column; gap: 12px; }

                .item-card {
                  background: var(--s1); border: 1px solid var(--border);
                  border-radius: 18px; overflow: hidden;
                  animation: cardUp .4s ease both;
                  transition: border-color .2s,box-shadow .2s;
                }
                .item-card:hover { border-color: var(--border2); box-shadow: 0 8px 32px rgba(0,0,0,.3); }

                @keyframes cardUp { from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:translateY(0);} }

                /* card top bar */
                .card-topbar {
                  display: flex; align-items: center; justify-content: space-between;
                  padding: 12px 14px 10px; border-bottom: 1px solid var(--border);
                  background: rgba(255,255,255,.02);
                }
                .card-check {
                  width: 22px; height: 22px; border-radius: 6px;
                  background: var(--green-glow); border: 1.5px solid var(--green);
                  display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer;
                }
                .card-check.unselected {
                  background: transparent; border-color: var(--border2);
                }
                .card-check svg { width: 11px; height: 11px; color: var(--green); }
                .card-product-name {
                  flex: 1; margin: 0 10px; font-size: 13px; font-weight: 700; color: var(--text);
                  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; outline: none; background: transparent; border: none;
                }
                .card-product-name:focus { border-bottom: 1px dashed var(--cyan); }
                .gst-badge {
                  display: inline-flex; align-items: center; gap: 3px;
                  background: rgba(99,102,241,.15); border: 1px solid rgba(99,102,241,.3);
                  border-radius: 6px; padding: 3px 8px; font-size: 10px; font-weight: 700; color: var(--accent); white-space: nowrap;
                }
                .remove-btn {
                  width: 24px; height: 24px; border-radius: 6px;
                  background: var(--red-glow); border: 1px solid rgba(244,63,94,.2);
                  display: flex; align-items: center; justify-content: center;
                  cursor: pointer; margin-left: 6px; transition: all .12s; flex-shrink: 0;
                }
                .remove-btn:hover { background: rgba(244,63,94,.25); }
                .remove-btn svg { width: 11px; height: 11px; color: var(--red); }

                /* card fields grid */
                .card-fields { padding: 12px 14px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
                .cf-label { font-size: 9px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 5px; }
                .cf-input {
                  background: var(--s2); border: 1px solid var(--border2);
                  border-radius: 9px; padding: 8px 10px;
                  font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; color: var(--text);
                  width: 100%; outline: none; transition: border-color .15s;
                }
                .cf-input:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(6,182,212,.08); }
                .cf-input.unit-input { background: var(--s3); font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 13px; }

                /* price row */
                .card-price-row { padding: 0 14px 14px; display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: center; gap: 8px; }
                .pf-label { font-size: 9px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 5px; }
                .pf-input {
                  background: var(--s2); border: 1px solid var(--border2);
                  border-radius: 9px; padding: 8px 10px;
                  font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; color: var(--text);
                  width: 100%; outline: none; transition: border-color .15s;
                }
                .pf-input:focus { border-color: var(--amber); box-shadow: 0 0 0 3px rgba(245,158,11,.08); }
                .price-op { font-size: 16px; font-weight: 700; color: var(--text3); text-align: center; padding-top: 18px; }
                .pf-input.selling {
                  background: linear-gradient(135deg, rgba(34,197,94,.1), rgba(6,182,212,.06));
                  border-color: rgba(34,197,94,.3);
                  color: var(--green); font-weight: 600; font-size: 14px;
                }

                /* profit indicator */
                .profit-indicator {
                  margin: 0 14px 12px; background: var(--green-glow); border: 1px solid rgba(34,197,94,.2);
                  border-radius: 10px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between;
                }
                .pi-left { display: flex; align-items: center; gap: 7px; }
                .pi-icon { width: 20px; height: 20px; border-radius: 6px; background: rgba(34,197,94,.2); display: flex; align-items: center; justify-content: center; }
                .pi-icon svg { width: 10px; height: 10px; color: var(--green); }
                .pi-text { font-size: 11px; font-weight: 700; color: var(--green); }
                .pi-amt { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 600; color: var(--green); }

                /* ── BOTTOM ACTION BAR ── */
                .bottom-bar {
                  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
                  width: 100%; max-width: 480px;
                  background: rgba(8,11,20,.95); backdrop-filter: blur(20px);
                  border-top: 1px solid var(--border2);
                  padding: 14px 16px 18px; display: flex; gap: 10px; z-index: 200;
                }
                .discard-btn {
                  padding: 13px 20px; border-radius: 12px;
                  background: var(--s2); border: 1px solid var(--border2);
                  font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700;
                  color: var(--text2); cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center;
                }
                .discard-btn:hover { border-color: var(--red); color: var(--red); }
                .save-btn {
                  flex: 1; padding: 13px; border-radius: 12px;
                  background: linear-gradient(135deg, #22c55e, #16a34a);
                  border: none; font-family: 'Outfit', sans-serif;
                  font-size: 14px; font-weight: 800; color: #fff; cursor: pointer;
                  display: flex; align-items: center; justify-content: center; gap: 8px;
                  box-shadow: 0 4px 20px rgba(34,197,94,.35); transition: all .18s;
                }
                .save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(34,197,94,.45); }
                .save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
                .save-btn svg { width: 16px; height: 16px; }

                /* Profit panel collapse toggle */
                .profit-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; }
                .pt-arrow {
                  width: 20px; height: 20px; border-radius: 5px; background: var(--s3);
                  display: flex; align-items: center; justify-content: center; transition: transform .25s;
                }
                .pt-arrow.open { transform: rotate(180deg); }
                .pt-arrow svg { width: 11px; height: 11px; color: var(--text3); }

                .profit-collapsible { overflow: hidden; max-height: 0; transition: max-height .35s cubic-bezier(.22,1,.36,1); }
                .profit-collapsible.open { max-height: 300px; }

                /* Old processing scanner styles */
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

                /* --- NEW DESIGN CSS --- */
                .topbar {
                  background: linear-gradient(135deg, #5B3FD9 0%, #7C5CF0 100%);
                  padding: 14px 18px 16px; display: flex; align-items: center; gap: 12px;
                }
                .avatar {
                  width: 40px; height: 40px; border-radius: 50%;
                  background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.3);
                  display: flex; align-items: center; justify-content: center; font-size: 20px;
                }
                .brand { flex: 1; }
                .brand-name { font-size: 15px; font-weight: 600; color: #fff; }
                .brand-sub  { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 1px; }
                .topbar-icons { display: flex; gap: 8px; }
                .icon-btn {
                  width: 34px; height: 34px; border-radius: 9px;
                  background: rgba(255,255,255,0.12); border: none; cursor: pointer;
                  display: flex; align-items: center; justify-content: center;
                  color: white; font-size: 16px;
                }
                .breadcrumb {
                  display: flex; align-items: center; gap: 8px;
                  padding: 11px 18px 10px; background: #13161E; border-bottom: 0.5px solid #1e2230;
                }
                .back-btn {
                  width: 30px; height: 30px; border-radius: 8px;
                  background: #1e2230; border: none; cursor: pointer;
                  display: flex; align-items: center; justify-content: center;
                  color: #8b8fa8; font-size: 14px; margin-right: 0;
                }
                .breadcrumb-text { font-size: 12px; color: #8b8fa8; }
                .breadcrumb-text span { color: #c4c8e0; font-weight: 500; }

                .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
                .scanner-icon-wrap {
                  width: 46px; height: 46px; border-radius: 14px; margin-bottom: 0;
                  background: linear-gradient(135deg, #5B3FD9, #7C5CF0);
                  display: flex; align-items: center; justify-content: center;
                  font-size: 22px; color: white;
                }
                .section-title { font-size: 19px; font-weight: 600; color: #e8eaf4; }
                .ai-badge {
                  display: inline-flex; align-items: center; gap: 5px;
                  background: rgba(91,63,217,0.15); border: 0.5px solid rgba(124,92,240,0.4);
                  border-radius: 20px; padding: 3px 10px; font-size: 10px; font-weight: 600; color: #a48ef5;
                  letter-spacing: 0.5px; margin-top: 3px;
                }
                .dot { width: 6px; height: 6px; border-radius: 50%; background: #a48ef5; }

                .content { flex: 1; padding: 20px 16px; }
                .upload-card {
                  background: #13161E; border: 1.5px dashed #2e3348; border-radius: 20px;
                  padding: 26px 20px 22px; display: flex; flex-direction: column; align-items: center;
                  margin-bottom: 16px; cursor: pointer; transition: border-color 0.25s;
                }
                .upload-card:hover { border-color: #7C5CF0; }
                .upload-icon-wrap {
                  width: 70px; height: 70px; border-radius: 20px;
                  background: linear-gradient(135deg, #5B3FD9, #7C5CF0);
                  display: flex; align-items: center; justify-content: center;
                  font-size: 30px; color: white; margin-bottom: 14px;
                  box-shadow: 0 8px 24px rgba(91,63,217,0.35);
                }
                .upload-title { font-size: 16px; font-weight: 600; color: #e8eaf4; margin-bottom: 8px; text-align: center; }
                .upload-desc { font-size: 12px; color: #6b7090; text-align: center; line-height: 1.65; margin-bottom: 16px; }
                .upload-types { display: flex; gap: 8px; }
                .type-pill {
                  display: flex; align-items: center; gap: 5px; background: #1a1e2e; border: 0.5px solid #2e3348;
                  border-radius: 8px; padding: 5px 12px; font-size: 12px; color: #8b8fa8;
                }
                .type-pill i { font-size: 13px; color: #7C5CF0; }
                .cta-btn {
                  width: 100%; background: linear-gradient(135deg, #5B3FD9 0%, #7C5CF0 100%);
                  border: none; border-radius: 14px; padding: 14px;
                  display: flex; align-items: center; justify-content: center; gap: 8px;
                  color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 14px;
                  box-shadow: 0 6px 20px rgba(91,63,217,0.4); transition: opacity 0.2s;
                }
                .cta-btn:hover { opacity: 0.9; }

                .info-row { display: flex; gap: 10px; }
                .info-card {
                  flex: 1; background: #13161E; border: 0.5px solid #1e2230; border-radius: 14px;
                  padding: 13px; display: flex; flex-direction: column; gap: 6px;
                }
                .info-card-icon {
                  width: 30px; height: 30px; border-radius: 9px; background: rgba(91,63,217,0.15);
                  display: flex; align-items: center; justify-content: center; font-size: 15px; color: #a48ef5;
                }
                .info-card-label { font-size: 10px; color: #6b7090; }
                .info-card-val   { font-size: 12px; font-weight: 600; color: #c4c8e0; }

                .scan-area {
                  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
                  padding: 20px 16px 32px;
                }
                .scan-frame { width: 220px; height: 260px; position: relative; margin-bottom: 28px; }
                .corner { position: absolute; width: 24px; height: 24px; border-color: #00D4AA; border-style: solid; }
                .corner.tl { top: 0; left: 0; border-width: 3px 0 0 3px; border-radius: 5px 0 0 0; }
                .corner.tr { top: 0; right: 0; border-width: 3px 3px 0 0; border-radius: 0 5px 0 0; }
                .corner.bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; border-radius: 0 0 0 5px; }
                .corner.br { bottom: 0; right: 0; border-width: 0 3px 3px 0; border-radius: 0 0 5px 0; }
                .scan-beam {
                  position: absolute; left: 12px; right: 12px; height: 2px;
                  background: linear-gradient(90deg, transparent, #00D4AA, transparent);
                  top: 20px; border-radius: 1px; box-shadow: 0 0 10px #00D4AA, 0 0 20px rgba(0,212,170,0.4);
                  animation: beam-move 2.2s ease-in-out infinite;
                }
                @keyframes beam-move { 0% { top: 16px; opacity: 1; } 50% { top: 228px; opacity: 1; } 100% { top: 16px; opacity: 1; } }
                .scan-doc {
                  width: 170px; height: 210px; background: #1a1e2e; border-radius: 12px;
                  position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
                  padding: 22px 18px; display: flex; flex-direction: column; gap: 10px;
                }
                .doc-line { height: 7px; border-radius: 4px; background: #2e3348; }
                .doc-line.scanned { background: linear-gradient(90deg, #00D4AA, #00B894); animation: pulse-line 2s ease-in-out infinite; }
                @keyframes pulse-line { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
                .scan-label { font-size: 17px; font-weight: 600; color: #00D4AA; margin-bottom: 6px; letter-spacing: 0.3px; }
                .scan-sub { font-size: 12px; color: #6b7090; text-align: center; line-height: 1.6; margin-bottom: 20px; }
                .progress-wrap { width: 190px; }
                .progress-track { height: 4px; background: #1e2230; border-radius: 2px; overflow: hidden; }
                .progress-bar {
                  height: 100%; border-radius: 2px; background: linear-gradient(90deg, #00D4AA, #00B894);
                  animation: progress-anim 3.5s ease-in-out infinite;
                }
                @keyframes progress-anim { 0% { width: 10%; } 60% { width: 80%; } 100% { width: 96%; } }
                .progress-pct { font-size: 11px; color: #00D4AA; font-weight: 600; text-align: right; margin-top: 6px; }
            `}} />

            {/* ── TOP BAR ── */}
            <div className="topbar">
                <div className="avatar">🎭</div>
                <div className="brand">
                    <div className="brand-name">Ayana Enterprises</div>
                    <div className="brand-sub">Smart Scanner</div>
                </div>
                <div className="topbar-icons">
                    <button className="icon-btn" aria-label="Settings"><i className="ti ti-settings"></i></button>
                    <button className="icon-btn" aria-label="Menu"><i className="ti ti-menu-2"></i></button>
                </div>
            </div>

            {/* ── BREADCRUMB ── */}
            <div className="breadcrumb">
                <button className="back-btn" aria-label="Back" onClick={() => router.push('/dashboard/inventory')}>
                    <i className="ti ti-arrow-left"></i>
                </button>
                <div className="breadcrumb-text">Home / <span>Smart Scanner</span></div>
                {step === 'review' && (
                    <button className="scan-again-btn" onClick={() => setStep('upload')} style={{marginLeft: 'auto'}}>
                        <i className="ti ti-reload" style={{fontSize: '14px'}}></i> {st.scanAgain}
                    </button>
                )}
            </div>

            {/* Profit Margin Setting (Only in Review Step) */}
            {step === 'review' && (
                <div className="content" style={{paddingBottom: '0'}}>
                    <div className="profit-bar">
                        <div className="pb-top">
                            <div className="profit-toggle" onClick={() => setIsProfitOpen(!isProfitOpen)}>
                                <div className="pb-title">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="1" x2="12" y2="23"/>
                                        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                                    </svg>
                                    {st.profitMarginSet}
                                </div>
                                <div className={`pt-arrow ${isProfitOpen ? 'open' : ''}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                                </div>
                            </div>
                            <div className="pb-current">{globalProfit}%</div>
                        </div>

                        <div className={`profit-collapsible ${isProfitOpen ? 'open' : ''}`}>
                            <div className="preset-row">
                                {[5, 10, 15, 20, 25, 30].map(pct => (
                                    <button 
                                        key={pct}
                                        className={`preset-btn ${globalProfit === pct ? 'active' : ''}`}
                                        onClick={() => updateGlobalProfitAndApply(pct)}
                                    >
                                        {pct}%
                                    </button>
                                ))}
                            </div>

                            <div className="slider-wrap">
                                <div className="slider-minus" onClick={() => updateGlobalProfitAndApply(Math.max(0, globalProfit - 1))}>−</div>
                                <input 
                                    type="range" 
                                    className="profit-slider" 
                                    min="0" max="100" 
                                    value={globalProfit} 
                                    onChange={(e) => updateGlobalProfitAndApply(Number(e.target.value))}
                                    style={{ background: `linear-gradient(90deg, #f59e0b ${globalProfit}%, rgba(255,255,255,0.1) ${globalProfit}%)` }}
                                />
                                <div className="slider-plus" onClick={() => updateGlobalProfitAndApply(Math.min(100, globalProfit + 1))}>+</div>
                            </div>

                            <button className="apply-btn" onClick={handleApplyProfit}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                                {st.applyToAll}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* Upload Step */}
                {step === 'upload' && (
                    <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="content">
                        <div className="section-header">
                            <div className="scanner-icon-wrap"><i className="ti ti-scan"></i></div>
                            <div>
                                <div className="section-title">Smart Scanner</div>
                                <div className="ai-badge"><div className="dot"></div> AI Powered Entry</div>
                            </div>
                        </div>

                        <div className="upload-card" onClick={() => fileInputRef.current?.click()}>
                            <div className="upload-icon-wrap"><i className="ti ti-file-invoice"></i></div>
                            <div className="upload-title">Upload Supplier Invoice</div>
                            <div className="upload-desc">
                                {st.uploadDesc.split('\n').map((line: string, i: number) => <span key={i}>{line}<br/></span>)}
                            </div>
                            <div className="upload-types">
                                <div className="type-pill"><i className="ti ti-camera"></i> Photo</div>
                                <div className="type-pill"><i className="ti ti-scan"></i> Scan</div>
                                <div className="type-pill"><i className="ti ti-file-type-pdf"></i> PDF</div>
                            </div>
                            <button className="cta-btn">
                                <i className="ti ti-camera" style={{fontSize: '17px'}}></i>
                                Browse or Take Photo
                            </button>
                        </div>

                        <div className="info-row">
                            <div className="info-card">
                                <div className="info-card-icon"><i className="ti ti-bolt"></i></div>
                                <div className="info-card-label">Auto Detect</div>
                                <div className="info-card-val">Products &amp; Qty</div>
                            </div>
                            <div className="info-card">
                                <div className="info-card-icon"><i className="ti ti-shield-check"></i></div>
                                <div className="info-card-label">Accuracy</div>
                                <div className="info-card-val">AI Verified</div>
                            </div>
                            <div className="info-card">
                                <div className="info-card-icon"><i className="ti ti-clock"></i></div>
                                <div className="info-card-label">Speed</div>
                                <div className="info-card-val">Instant Entry</div>
                            </div>
                        </div>
                        <input type="file" accept="image/*,.pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    </motion.div>
                )}

                {/* Processing Step */}
                {step === 'processing' && (
                    <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="scan-area">
                        <div className="section-header" style={{marginBottom: '28px', alignSelf: 'flex-start', width: '100%'}}>
                            <div className="scanner-icon-wrap"><i className="ti ti-scan"></i></div>
                            <div>
                                <div className="section-title">Smart Scanner</div>
                                <div className="ai-badge"><div className="dot"></div> AI Powered Entry</div>
                            </div>
                        </div>

                        <div className="scan-frame">
                            <div className="corner tl"></div>
                            <div className="corner tr"></div>
                            <div className="corner bl"></div>
                            <div className="corner br"></div>
                            <div className="scan-beam"></div>
                            <div className="scan-doc">
                                <div className="doc-line scanned" style={{width: '80%'}}></div>
                                <div className="doc-line scanned" style={{width: '65%', animationDelay: '0.4s'}}></div>
                                <div className="doc-line" style={{width: '90%'}}></div>
                                <div className="doc-line" style={{width: '72%'}}></div>
                                <div className="doc-line" style={{width: '55%'}}></div>
                                <div className="doc-line" style={{width: '83%'}}></div>
                                <div className="doc-line" style={{width: '60%'}}></div>
                            </div>
                        </div>

                        <div className="scan-label">Extracting Details...</div>
                        <div className="scan-sub">{st.waitMsg}</div>

                        <div className="progress-wrap">
                            <div className="progress-track">
                                <div className="progress-bar"></div>
                            </div>
                            <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }} className="progress-pct">
                                Analyzing invoice...
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* Review Step */}
                {step === 'review' && (
                    <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* RESULTS HEADER */}
                        <div className="results-header">
                            <div className="found-badge">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                                {parsedItems.length} {st.itemsFound}
                            </div>
                            <div className="results-actions">
                                <button className="ract" onClick={handleEditAll}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>{st.selectAll}</button>
                                <button className="ract" onClick={() => setStep('upload')}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>{st.addMore}</button>
                            </div>
                        </div>

                        {/* ITEM CARDS */}
                        <div className="items-list">
                            {parsedItems.map((item, index) => {
                                const profit = (item.sellingPrice || 0) - (item.purchasePrice || 0);
                                const totalMargin = profit * (item.quantity || 1);

                                return (
                                    <div key={item.id} className="item-card" style={{ animationDelay: `${index * 0.06}s` }}>
                                        <div className="card-topbar">
                                            <div className={`card-check ${!item.selected ? 'unselected' : ''}`} onClick={() => updateItem(item.id, 'selected', !item.selected)}>
                                                {item.selected && <svg viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                            </div>
                                            <input 
                                                className="card-product-name" 
                                                value={item.name} 
                                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                            />
                                            <div className="gst-badge">GST {item.gstRate}%</div>
                                            <button className="remove-btn" onClick={() => handleRemoveItem(item.id)}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                            </button>
                                        </div>

                                        <div className="card-fields">
                                            <div className="card-field">
                                                <div className="cf-label">{st.qty}</div>
                                                <input className="cf-input" type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} />
                                            </div>
                                            <div className="card-field">
                                                <div className="cf-label">{st.unit}</div>
                                                <input className="cf-input unit-input" type="text" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value.toUpperCase())} />
                                            </div>
                                            <div className="card-field">
                                                <div className="cf-label">GST %</div>
                                                <input className="cf-input" type="number" value={item.gstRate} onChange={(e) => updateItem(item.id, 'gstRate', Number(e.target.value))} />
                                            </div>
                                        </div>

                                        <div className="card-price-row">
                                            <div className="price-field">
                                                <div className="pf-label">{st.purchase}</div>
                                                <input className="pf-input" type="number" value={item.purchasePrice} onChange={(e) => updateItem(item.id, 'purchasePrice', Number(e.target.value))} />
                                            </div>
                                            <div className="price-op">+</div>
                                            <div className="price-field">
                                                <div className="pf-label">Markup %</div>
                                                <input className="pf-input" type="number" value={item.markup} onChange={(e) => updateItem(item.id, 'markup', Number(e.target.value))} />
                                            </div>
                                            <div className="price-op">=</div>
                                            <div className="price-field">
                                                <div className="pf-label">{st.selling}</div>
                                                <input className="pf-input selling" type="number" value={item.sellingPrice} onChange={(e) => updateItem(item.id, 'sellingPrice', Number(e.target.value))} />
                                            </div>
                                        </div>

                                        <div className="profit-indicator">
                                            <div className="pi-left">
                                                <div className="pi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
                                                <div className="pi-text">{st.profit}: ₹{profit.toFixed(1)} ({item.markup}%)</div>
                                            </div>
                                            <div className="pi-amt">₹{totalMargin.toFixed(1)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* BOTTOM ACTION BAR */}
                        <div className="bottom-bar">
                            <button className="discard-btn" onClick={() => setStep('upload')}>{st.cancel}</button>
                            <button className="save-btn" onClick={handleSave} disabled={loading || parsedItems.filter(i => i.selected).length === 0}>
                                {loading ? <FaSpinner className="animate-spin text-lg" /> : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                                        <path d="M17 21v-8H7v8M7 3v5h8"/>
                                    </svg>
                                )}
                                {loading ? 'Saving...' : `${parsedItems.filter(i => i.selected).length} ${st.saveItems}`}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                    <h3 className="font-bold text-lg text-white font-['Outfit']">Some items failed to save</h3>
                                    <p className="text-xs font-['Outfit']">Please check the reasons below</p>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {failedItems.map((item, idx) => (
                                    <div key={idx} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                        <div className="font-bold text-sm text-white mb-1 font-['Outfit']">{item.name}</div>
                                        <div className="text-xs text-red-400 font-medium bg-red-500/10 p-2 rounded-lg border border-red-500/20 font-['Outfit']">{item.reason}</div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-slate-800">
                                <button 
                                    onClick={() => setFailedItems([])}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all font-['Outfit']"
                                >{st.closeBtn}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        </>
    );
}
