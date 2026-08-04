'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { 
    FaPrint, FaDownload, FaWhatsapp, FaPalette, FaFileAlt, 
    FaBolt, FaTag, FaCopy, FaEye, FaHeadset, FaExclamationTriangle, 
    FaHourglassHalf, FaFileInvoiceDollar, FaReceipt, FaCheckCircle
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';

type TemplateType = 'gst_nongst_special' | 'a4_flyer' | 'whatsapp_square' | 'counter_standee';
type ThemeType = 'dark_royal' | 'emerald' | 'clean_print';

export default function MarketingStudioPage() {
    const { data: session } = useSession();
    const businessProfile = useStore((state: any) => state.businessProfile) || {};
    const fetchBusinessProfile = useStore((state: any) => state.fetchBusinessProfile);

    const [template, setTemplate] = useState<TemplateType>('gst_nongst_special');
    const [theme, setTheme] = useState<ThemeType>('dark_royal');
    const [partnerName, setPartnerName] = useState('BillGST Official');
    const [phoneNumber, setPhoneNumber] = useState('+91 74985 71873');
    const [helplineNumber, setHelplineNumber] = useState('+91 74985 71873');
    const [areaCity, setAreaCity] = useState('');
    const [customOffer, setCustomOffer] = useState('100% मुफ़्त ऐप · लाइफटाइम कोई चार्ज नहीं (FREE App)');
    const [websiteUrl, setWebsiteUrl] = useState('https://www.billgst.com');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof fetchBusinessProfile === 'function') {
            fetchBusinessProfile();
        }
    }, [fetchBusinessProfile]);

    useEffect(() => {
        if (businessProfile) {
            const bName = businessProfile.business_name || businessProfile.name || session?.user?.name;
            const bPhone = businessProfile.phone || businessProfile.mobile;
            const bCity = businessProfile.city || businessProfile.state || 'All India';
            
            if (bName) setPartnerName(bName);
            if (bPhone && !bPhone.includes('@')) {
                setPhoneNumber(bPhone);
            }
            if (!areaCity) setAreaCity(bCity);
        }
    }, [businessProfile, session]);

    // Handle Print
    const handlePrint = () => {
        window.print();
    };

    // Handle Download Image (PNG)
    const handleDownloadImage = async () => {
        if (!previewRef.current) return;
        setIsGeneratingImage(true);
        const toastId = toast.loading('उच्च-गुणवत्ता (HD) पोस्टर तैयार हो रहा है...');
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(previewRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: theme === 'clean_print' ? '#ffffff' : (theme === 'emerald' ? '#064e3b' : '#050d24'),
                logging: false
            });

            const link = document.createElement('a');
            link.download = `BillGST_${template}_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('✅ पोस्टर सफलतापूर्वक डाउनलोड हो गया!', { id: toastId });
        } catch (error) {
            console.error('Error generating image:', error);
            toast.error('इमेज डाउनलोड करने में समस्या आई', { id: toastId });
        } finally {
            setIsGeneratingImage(false);
        }
    };

    // Handle WhatsApp Share
    const handleWhatsAppShare = () => {
        const message = `*🧾 GST और Non-GST दोनों तरह के बिल बनाएं सिर्फ 10 सेकंड में!* 🚀\n\n` +
            `*BillGST* — भारत का #1 ऑल-इन-वन GST & Non-GST बिलिंग सॉफ्टवेयर (100% FREE)\n\n` +
            `🔹 *GST बिल (पक्का टैक्स इनवॉइस):*\n` +
            `• HSN/SAC कोड, CGST, SGST, IGST ऑटो कैलकुलेशन\n` +
            `• B2B & B2C बिलिंग, E-Way Bill & E-Invoice\n` +
            `• CA के लिए 1-क्लिक GSTR-1, GSTR-3B Excel & JSON रिटर्न\n\n` +
            `🔹 *Non-GST बिल (सादा बिल / कच्चा / कोटेशन):*\n` +
            `• बिना GST नंबर के भी 100% लीगल रसीद और सादा पर्चा\n` +
            `• 2"/3" थर्मल प्रिंटर या A4/A5 पेपर पर तुरंत प्रिंट\n` +
            `• डिलीवरी चालान, एस्टीमेट और कोटेशन 1-क्लिक में\n\n` +
            `⭐ *अन्य धांसू फीचर्स:*\n` +
            `🎙️ AI बोलकर बिलिंग · 📸 AI पर्चा स्कैनर · ⚠️ लो-स्टॉक अलर्ट · ⏳ एक्सपायरी अलर्ट · 💬 WhatsApp ऑटो बिल · 📒 उधारी खाता · 👥 स्टाफ हाजिरी\n\n` +
            `📲 *Google Play Store और Web दोनों पर उपलब्ध!*\n` +
            `🎉 *100% मुफ़्त (LifeTime Free)* · कोई मंथली फीस नहीं!\n\n` +
            `🌐 *वेबसाइट:* www.billgst.com\n` +
            `📞 *24x7 हेल्पलाइन & WhatsApp सपोर्ट:* ${helplineNumber}`;

        const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    const handleCopyText = () => {
        const message = `🧾 GST और Non-GST दोनों तरह के बिल बनाएं सिर्फ 10 सेकंड में! 🚀\n\n` +
            `BillGST — भारत का सबसे आसान, सुरक्षित और 100% मुफ़्त सॉफ्टवेयर!\n\n` +
            `✅ 1. GST बिल (पक्का टैक्स इनवॉइस - CGST/SGST/IGST, B2B, GSTR-1/3B)\n` +
            `✅ 2. Non-GST बिल (सादा रसीद, एस्टीमेट, कोटेशन, डिलीवरी चालान)\n` +
            `✅ 3. थर्मल प्रिंटर (2"/3") और A4/A5 दोनों पर सपोर्ट\n` +
            `✅ 4. AI बोलकर बिलिंग (Voice AI) और AI स्कैनर (फोटो से बिल)\n` +
            `✅ 5. लो-स्टॉक & एक्सपायरी डेट ऑटो अलर्ट्स\n` +
            `✅ 6. ग्राहक के WhatsApp पर ऑटो बिल & उधारी रिमाइंडर\n` +
            `✅ 7. डिजिटल उधारी खाता & स्टाफ हाजिरी\n\n` +
            `📲 Google Play Store और Website दोनों पर उपलब्ध!\n` +
            `🎉 100% मुफ़्त (LifeTime Free App) · कोई चार्ज नहीं!\n` +
            `🌐 वेबसाइट: www.billgst.com\n` +
            `📞 हेल्पलाइन नंबर: ${helplineNumber}`;

        navigator.clipboard.writeText(message);
        toast.success('📋 GST & Non-GST मैसेज कॉपी हो गया!');
    };

    // Theme Variables
    const getThemeStyles = () => {
        if (theme === 'clean_print') {
            return {
                bg: '#ffffff',
                textPrimary: '#0f172a',
                textSecondary: '#475569',
                cardBg: '#f8fafc',
                cardBorder: '#cbd5e1',
                accent: '#2563eb',
                badgeBg: '#e0e7ff',
                badgeText: '#1e40af',
                highlight: '#dc2626',
                border: '#94a3b8',
                qrBg: '#ffffff',
                qrFg: '#000000',
                goldBadge: '#f59e0b',
                alertBg: '#fee2e2',
                alertBorder: '#ef4444'
            };
        }
        if (theme === 'emerald') {
            return {
                bg: 'linear-gradient(145deg, #022c22 0%, #064e3b 50%, #022c22 100%)',
                textPrimary: '#ffffff',
                textSecondary: '#a7f3d0',
                cardBg: 'rgba(6, 78, 59, 0.65)',
                cardBorder: 'rgba(52, 211, 153, 0.35)',
                accent: '#34d399',
                badgeBg: '#fbbf24',
                badgeText: '#000000',
                highlight: '#fde047',
                border: 'rgba(52, 211, 153, 0.4)',
                qrBg: '#ffffff',
                qrFg: '#022c22',
                goldBadge: '#fbbf24',
                alertBg: 'rgba(239, 68, 68, 0.18)',
                alertBorder: 'rgba(239, 68, 68, 0.5)'
            };
        }
        // dark_royal default
        return {
            bg: 'linear-gradient(145deg, #050d24 0%, #0d1b46 50%, #030818 100%)',
            textPrimary: '#ffffff',
            textSecondary: '#94a3b8',
            cardBg: 'rgba(15, 23, 42, 0.75)',
            cardBorder: 'rgba(56, 189, 248, 0.35)',
            accent: '#38bdf8',
            badgeBg: '#f59e0b',
            badgeText: '#000000',
            highlight: '#fbbf24',
            border: 'rgba(56, 189, 248, 0.4)',
            qrBg: '#ffffff',
            qrFg: '#050d24',
            goldBadge: '#f59e0b',
            alertBg: 'rgba(239, 68, 68, 0.15)',
            alertBorder: 'rgba(239, 68, 68, 0.45)'
        };
    };

    const currentStyles = getThemeStyles();

    // All Features
    const allFeatures = [
        { icon: '⚡', title: '10 सेकंड में GST / Non-GST बिल', desc: 'A4, A5, Thermal 2"/3" रसीद प्रिंट। कोटेशन, चालान & E-Way Bill।' },
        { icon: '🎙️', title: 'AI बोलकर बिलिंग (Voice AI)', desc: 'बिना टाइप किए सिर्फ नाम और रेट बोलें, बिल तुरंत तैयार।' },
        { icon: '📸', title: 'AI स्मार्ट स्कैनर (AI Scanner)', desc: 'पर्चे या पुराने बिल की फोटो खींचें, AI से तुरंत बिल बनाएं।' },
        { icon: '⚠️', title: 'लो-स्टॉक ऑटो अलर्ट (Low Stock)', desc: 'दुकान में माल खत्म होने से पहले ऑटोमैटिक अलर्ट, ताकि बिक्री न रुके।' },
        { icon: '⏳', title: 'एक्सपायरी डेट अलर्ट (Expiry Alert)', desc: 'किराना, दवा या खाद्य सामग्री की एक्सपायरी से पहले चेतावनी।' },
        { icon: '📷', title: 'बारकोड & QR स्कैनर', desc: 'कैमरे या स्कैनर से तुरंत स्कैन करके 1 सेकंड में सेल करें।' },
        { icon: '💬', title: 'WhatsApp ऑटो बिल & रिमाइंडर', desc: 'सीधे ग्राहक के WhatsApp पर डिजिटल बिल और उधारी रिमाइंडर।' },
        { icon: '📒', title: 'डिजिटल उधारी & हिसाब खाता', desc: 'ग्राहक और सप्लायर दोनों का 100% सुरक्षित बहीखाता।' },
        { icon: '👥', title: 'स्टाफ अटेंडेंस & सैलरी मैनेजर', desc: 'कर्मचारियों की हाजिरी (Attendance), एडवांस और वेतन का हिसाब।' },
        { icon: '🛒', title: 'फ्री ऑनलाइन स्टोर & कैटलॉग', desc: 'अपनी दुकान का लिंक व्हाट्सएप पर शेयर करें, ऑनलाइन ऑर्डर पाएं।' },
        { icon: '📊', title: '1-Click GSTR-1, GSTR-3B रिपोर्ट', desc: 'CA को हिसाब देना आसान। चुटकियों में Excel और JSON डाउनलोड।' },
        { icon: '💰', title: 'खर्चा, सेल & मुनाफा ट्रैकिंग', desc: 'दुकान के रोजाना खर्चे, कुल बिक्री और शुद्ध मुनाफे का हिसाब।' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8">
            {/* Printable CSS styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #print-marketing-canvas, #print-marketing-canvas * {
                        visibility: visible !important;
                    }
                    #print-marketing-canvas {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    @page {
                        size: A4;
                        margin: 4mm;
                    }
                }
            `}</style>

            {/* Header section (Hidden during print) */}
            <div className="max-w-7xl mx-auto mb-8 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl backdrop-blur-md shadow-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-amber-500/20">
                                🧾
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                    GST & Non-GST बिलिंग पोस्टर <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">100% FREE App</span>
                                </h1>
                                <p className="text-xs md:text-sm text-slate-400">
                                    पक्का GST बिल और सादा Non-GST बिल दोनों के लिए तैयार मार्केटिंग पोस्टर।
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2.5">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 cursor-pointer"
                        >
                            <FaPrint className="text-base" /> 🖨️ A4 प्रिंट करें (PDF)
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadImage}
                            disabled={isGeneratingImage}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95 cursor-pointer"
                        >
                            <FaDownload className="text-base" /> {isGeneratingImage ? 'बन रहा है...' : '📥 HD फोटो डाउनलोड'}
                        </button>
                        <button
                            type="button"
                            onClick={handleWhatsAppShare}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all transform active:scale-95 cursor-pointer"
                        >
                            <FaWhatsapp className="text-base" /> WhatsApp पर शेयर
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content: Controls + Live Preview */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Controls Panel (Hidden during print) */}
                <div className="lg:col-span-4 flex flex-col gap-6 print:hidden">
                    {/* 1. Template Selector */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FaFileAlt className="text-amber-400" /> 1. टेम्पलेट का साइज़ चुनें
                        </h2>
                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { id: 'gst_nongst_special', label: 'GST & Non-GST पोस्टर', desc: 'पक्का व सादा बिल स्पेशल', icon: '🧾' },
                                { id: 'a4_flyer', label: 'A4 मास्टर पर्चा', desc: 'सभी 13 फीचर्स चार्ट', icon: '📄' },
                                { id: 'whatsapp_square', label: 'WhatsApp स्क्वायर', desc: 'स्टेटस और ग्रुप्स के लिए', icon: '📱' },
                                { id: 'counter_standee', label: 'काउंटर स्टैंडी', desc: 'दुकान काउंटर QR स्टीकर', icon: '📜' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setTemplate(item.id as TemplateType)}
                                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                                        template === item.id
                                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10 font-bold'
                                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="text-lg mb-1">{item.icon}</div>
                                    <div className="text-xs font-bold leading-tight">{item.label}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{item.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Color Theme */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FaPalette className="text-indigo-400" /> 2. कलर स्टाइल चुनें
                        </h2>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'dark_royal', label: 'रॉयल ब्लू', bg: 'from-blue-900 to-indigo-950', dot: '#38bdf8' },
                                { id: 'emerald', label: 'एमराल्ड ग्रीन', bg: 'from-emerald-900 to-teal-950', dot: '#34d399' },
                                { id: 'clean_print', label: 'सस्ता प्रिंट (White)', bg: 'from-slate-100 to-slate-200 text-slate-900', dot: '#0f172a' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setTheme(item.id as ThemeType)}
                                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                        theme === item.id
                                            ? 'border-amber-400 ring-2 ring-amber-400/30'
                                            : 'border-slate-700 hover:border-slate-600'
                                    } bg-gradient-to-b ${item.bg}`}
                                >
                                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: item.dot }}></div>
                                    <span className="text-[11px] font-bold">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Customizer Details */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <FaTag className="text-emerald-400" /> 3. जानकारी & लिंक्स
                            </span>
                        </h2>

                        <div>
                            <label className="block text-[11px] font-semibold text-amber-400 mb-1 flex items-center gap-1">
                                <FaHeadset /> 24x7 हेल्पलाइन नंबर (Helpline)
                            </label>
                            <input
                                type="text"
                                value={helplineNumber}
                                onChange={(e) => setHelplineNumber(e.target.value)}
                                placeholder="+91 74985 71873"
                                className="w-full px-3 py-2 bg-slate-800/80 border border-amber-500/50 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">वेबसाइट URL</label>
                            <input
                                type="text"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                placeholder="www.billgst.com"
                                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">दुकान / डिस्ट्रीब्यूटर / आपका नाम</label>
                            <input
                                type="text"
                                value={partnerName}
                                onChange={(e) => setPartnerName(e.target.value)}
                                placeholder="जैसे: पालीवाल एजेंसी / घनश्याम"
                                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">शहर / बाज़ार का नाम</label>
                            <input
                                type="text"
                                value={areaCity}
                                onChange={(e) => setAreaCity(e.target.value)}
                                placeholder="जैसे: मुख्य बाज़ार, उदयपुर / जयपुर"
                                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">ऑफर / फ़्री बैज टेक्स्ट</label>
                            <input
                                type="text"
                                value={customOffer}
                                onChange={(e) => setCustomOffer(e.target.value)}
                                placeholder="100% मुफ़्त ऐप · लाइफटाइम कोई चार्ज नहीं!"
                                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleCopyText}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                        >
                            <FaCopy /> GST & Non-GST मैसेज कॉपी करें
                        </button>
                    </div>
                </div>

                {/* Right: Live Interactive Canvas (Rendered for Screen & Print) */}
                <div className="lg:col-span-8 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400 print:hidden">
                        <span className="flex items-center gap-1.5 font-semibold">
                            <FaEye className="text-amber-400" /> लाइव पूर्वावलोकन (Live Print Preview):
                        </span>
                        <span className="text-[11px] text-emerald-400 font-bold">
                            ✓ GST & Non-GST बिलिंग पोस्टर · Helpline: +91 74985 71873
                        </span>
                    </div>

                    {/* Canvas Wrapper */}
                    <div className="w-full overflow-x-auto flex justify-center py-2 custom-scrollbar">
                        <div
                            id="print-marketing-canvas"
                            ref={previewRef}
                            style={{
                                width: template === 'whatsapp_square' ? '680px' : '794px',
                                minHeight: template === 'whatsapp_square' ? '680px' : '1123px',
                                background: currentStyles.bg,
                                color: currentStyles.textPrimary,
                                border: `2px solid ${currentStyles.border}`,
                                borderRadius: theme === 'clean_print' ? '0px' : '16px',
                                boxShadow: theme === 'clean_print' ? 'none' : '0 25px 60px rgba(0,0,0,0.6)',
                                padding: template === 'whatsapp_square' ? '18px' : '22px 22px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                boxSizing: 'border-box',
                                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                            }}
                        >
                            {/* TOP HEADER / BRANDING WITH LOGO AND PLAY STORE BADGE */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${currentStyles.cardBorder}`, paddingBottom: '8px', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {/* Real BillGST Logo */}
                                        <div style={{
                                            height: '42px',
                                            padding: '2px 8px',
                                            borderRadius: '8px',
                                            background: '#38bdf8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 8px rgba(56, 189, 248, 0.3)'
                                        }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src="/billgst-logo.jpg"
                                                alt="BillGST Logo"
                                                style={{ height: '36px', objectFit: 'contain', borderRadius: '4px' }}
                                                onError={(e: any) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: '1.1' }}>
                                                Bill<span style={{ color: currentStyles.accent }}>GST</span>
                                            </div>
                                            <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: currentStyles.textSecondary }}>
                                                GST & सादा Non-GST बिलिंग सॉफ्टवेयर
                                            </div>
                                        </div>
                                    </div>

                                    {/* Google Play Store Badge + 100% Free Badge */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            background: '#000000',
                                            color: '#ffffff',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}>
                                            <span style={{ fontSize: '12px' }}>▶</span>
                                            <span>Google Play Store</span>
                                        </div>

                                        <div style={{
                                            padding: '4px 10px',
                                            borderRadius: '50px',
                                            background: '#10b981',
                                            color: '#ffffff',
                                            fontSize: '10.5px',
                                            fontWeight: 900,
                                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            🎉 100% मुफ़्त ऐप
                                        </div>
                                    </div>
                                </div>

                                {/* HERO HEADLINE */}
                                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '3px 12px',
                                        borderRadius: '20px',
                                        background: currentStyles.cardBg,
                                        border: `1px solid ${currentStyles.cardBorder}`,
                                        color: currentStyles.highlight,
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        marginBottom: '4px'
                                    }}>
                                        <span>🧾 GST पक्का बिल</span> · <span>📄 Non-GST सादा बिल</span> · <span>🖨️ थर्मल 2"/3" & A4 प्रिंट</span>
                                    </div>
                                    <h2 style={{
                                        fontSize: template === 'whatsapp_square' ? '19px' : '23px',
                                        fontWeight: 900,
                                        lineHeight: '1.2',
                                        marginBottom: '3px',
                                        letterSpacing: '-0.5px'
                                    }}>
                                        एक ही ऐप में GST और Non-GST दोनों तरह के बिल बनाएं!
                                    </h2>
                                    <p style={{
                                        fontSize: '12px',
                                        color: currentStyles.textSecondary,
                                        maxWidth: '650px',
                                        margin: '0 auto',
                                        lineHeight: '1.3'
                                    }}>
                                        चाहे टैक्स इनवॉइस हो या सादी पर्ची / कोटेशन — सिर्फ 10 सेकंड में प्रिंट निकालें और WhatsApp पर भेजें!
                                    </p>
                                </div>

                                {/* 2 BIG PILLARS: GST BILL VS NON-GST BILL SIDE-BY-SIDE */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '10px',
                                    marginBottom: '10px'
                                }}>
                                    {/* GST Bill Card */}
                                    <div style={{
                                        background: 'rgba(56, 189, 248, 0.12)',
                                        border: '2px solid rgba(56, 189, 248, 0.5)',
                                        borderRadius: '12px',
                                        padding: '10px 12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '22px' }}>🧾</span>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 900, color: currentStyles.accent }}>
                                                    1. GST बिल (पक्का टैक्स इनवॉइस)
                                                </div>
                                                <div style={{ fontSize: '9px', color: currentStyles.textSecondary }}>
                                                    सरकारी GST नियमों के अनुसार 100% मान्य
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', color: currentStyles.textPrimary }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ color: '#10b981' }}>✓</span> HSN/SAC कोड & ऑटो CGST, SGST, IGST
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ color: '#10b981' }}>✓</span> B2B (ट्रेडर्स) और B2C (ग्राहक) बिलिंग
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ color: '#10b981' }}>✓</span> E-Way Bill & E-Invoice सपोर्ट
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ color: '#10b981' }}>✓</span> CA के लिए 1-क्लिक GSTR-1, GSTR-3B रिपोर्ट
                                            </div>
                                        </div>
                                    </div>

                                    {/* Non-GST Bill Card */}
                                    <div style={{
                                        background: 'rgba(245, 158, 11, 0.12)',
                                        border: '2px solid rgba(245, 158, 11, 0.5)',
                                        borderRadius: '12px',
                                        padding: '10px 12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '22px' }}>📄</span>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 900, color: currentStyles.highlight }}>
                                                    2. Non-GST बिल (सादा पर्चा / एस्टीमेट)
                                                </div>
                                                <div style={{ fontSize: '9px', color: currentStyles.textSecondary }}>
                                                    बिना GST नंबर के भी आसान और तेज बिलिंग
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', color: currentStyles.textPrimary }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ color: '#10b981' }}>✓</span> बिना टैक्स जोड़े सादा बिल और रसीद
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ color: '#10b981' }}>✓</span> डिलीवरी चालान & कोटेशन 1-क्लिक में
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ color: '#10b981' }}>✓</span> 2" और 3" थर्मल प्रिंटर पर सुपरफास्ट रसीद
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ color: '#10b981' }}>✓</span> सीधे WhatsApp पर ग्राहक को रसीद भेजें
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SPECIAL SMART ALERTS: AI SCANNER, LOW STOCK & EXPIRY */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: '6px',
                                    marginBottom: '10px'
                                }}>
                                    <div style={{
                                        background: currentStyles.cardBg,
                                        border: `1.5px solid ${currentStyles.cardBorder}`,
                                        borderRadius: '8px',
                                        padding: '5px 8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <span style={{ fontSize: '18px' }}>📸</span>
                                        <div>
                                            <div style={{ fontSize: '10.5px', fontWeight: 800, color: currentStyles.textPrimary }}>
                                                AI स्मार्ट स्कैनर
                                            </div>
                                            <div style={{ fontSize: '8.5px', color: currentStyles.textSecondary }}>
                                                पर्चे की फोटो से तुरंत बिल
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        background: currentStyles.alertBg,
                                        border: `1.5px solid ${currentStyles.alertBorder}`,
                                        borderRadius: '8px',
                                        padding: '5px 8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <span style={{ fontSize: '18px' }}>⚠️</span>
                                        <div>
                                            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#ef4444' }}>
                                                लो-स्टॉक ऑटो अलर्ट
                                            </div>
                                            <div style={{ fontSize: '8.5px', color: currentStyles.textSecondary }}>
                                                सामान खत्म होने से पहले सूचना
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'rgba(245, 158, 11, 0.15)',
                                        border: '1.5px solid rgba(245, 158, 11, 0.4)',
                                        borderRadius: '8px',
                                        padding: '5px 8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <span style={{ fontSize: '18px' }}>⏳</span>
                                        <div>
                                            <div style={{ fontSize: '10.5px', fontWeight: 800, color: currentStyles.highlight }}>
                                                एक्सपायरी डेट अलर्ट
                                            </div>
                                            <div style={{ fontSize: '8.5px', color: currentStyles.textSecondary }}>
                                                तारीख निकलने से पहले चेतावनी
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ALL SUPPORTING FEATURES */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: template === 'whatsapp_square' ? '1fr 1fr' : '1fr 1fr 1fr',
                                    gap: '6px',
                                    marginBottom: '10px'
                                }}>
                                    {allFeatures.slice(1, 7).map((f, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                background: currentStyles.cardBg,
                                                border: `1.5px solid ${currentStyles.cardBorder}`,
                                                borderRadius: '8px',
                                                padding: '5px 8px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '2px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ fontSize: '13px' }}>{f.icon}</span>
                                                <span style={{ fontSize: '10px', fontWeight: 800, color: currentStyles.textPrimary, lineHeight: '1.2' }}>
                                                    {f.title}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '8.5px', color: currentStyles.textSecondary, lineHeight: '1.2' }}>
                                                {f.desc}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 100% FREE BANNER + PLAY STORE */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: '#ffffff',
                                    borderRadius: '10px',
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '10px',
                                    marginBottom: '8px',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '22px' }}>🎁</span>
                                        <div>
                                            <div style={{ fontSize: '12.5px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {customOffer}
                                            </div>
                                            <div style={{ fontSize: '9.5px', fontWeight: 700, opacity: 0.95 }}>
                                                Play Store और Website (www.billgst.com) दोनों पर 100% फ्री!
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: '#ffffff',
                                        color: '#065f46',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        whiteSpace: 'nowrap'
                                    }}>
                                        100% FREE
                                    </div>
                                </div>
                            </div>

                            {/* BOTTOM FOOTER WITH HELPLINE + PLAY STORE + CLEAN WEBSITE + QR */}
                            <div>
                                {/* BIG GLOWING HELPLINE BANNER WITH +91 74985 71873 */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                                    color: '#000000',
                                    borderRadius: '8px',
                                    padding: '7px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '8px',
                                    marginBottom: '6px',
                                    fontWeight: 900,
                                    fontSize: '13px',
                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span>📞 / 💬 24x7 हेल्पलाइन:</span>
                                        <span style={{ fontSize: '14px', textDecoration: 'underline' }}>{helplineNumber}</span>
                                    </div>
                                    <div style={{ fontSize: '11px', background: '#000000', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px' }}>
                                        🌐 www.billgst.com
                                    </div>
                                </div>

                                <div style={{
                                    borderTop: `2px dashed ${currentStyles.cardBorder}`,
                                    paddingTop: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px'
                                }}>
                                    {/* Contact & App Store Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                            <span style={{ fontSize: '9px', fontWeight: 800, color: currentStyles.highlight, textTransform: 'uppercase' }}>
                                                📲 GOOGLE PLAY STORE & WEB APP
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 900, color: currentStyles.textPrimary, lineHeight: '1.2' }}>
                                            {partnerName}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', flexWrap: 'wrap' }}>
                                            {areaCity && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: currentStyles.textSecondary }}>
                                                    <span>📍</span> {areaCity}
                                                </div>
                                            )}
                                            <div style={{ fontSize: '10px', color: currentStyles.textSecondary }}>
                                                📱 <span style={{ fontWeight: 700, color: currentStyles.accent }}>Play Store पर &apos;BillGST&apos; सर्च करें</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code Box */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        background: currentStyles.qrBg,
                                        padding: '4px 6px',
                                        borderRadius: '6px',
                                        border: `1.5px solid ${currentStyles.cardBorder}`,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    }}>
                                        <QRCodeSVG
                                            value="https://www.billgst.com"
                                            size={64}
                                            fgColor={currentStyles.qrFg}
                                            bgColor={currentStyles.qrBg}
                                            level="H"
                                        />
                                        <span style={{ fontSize: '7px', fontWeight: 800, color: '#000000', marginTop: '2px', textAlign: 'center', lineHeight: '1.1' }}>
                                            📱 स्कैन कर ऐप खोलें
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
