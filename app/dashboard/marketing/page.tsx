'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { 
    FaPrint, FaDownload, FaWhatsapp, FaPalette, FaFileAlt, 
    FaTag, FaCopy, FaEye, FaHeadset, FaStore, FaQrcode,
    FaCheckCircle, FaUndo, FaSearchPlus, FaSearchMinus, FaGift
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';

type TemplateType = 'gst_nongst_special' | 'a4_flyer' | 'whatsapp_square' | 'counter_standee' | 'festive_dhamaka';
type ThemeType = 'dark_royal' | 'emerald' | 'ruby_luxury' | 'clean_print';

export default function MarketingStudioPage() {
    const { data: session } = useSession();
    const businessProfile = useStore((state: any) => state.businessProfile) || {};
    const fetchBusinessProfile = useStore((state: any) => state.fetchBusinessProfile);

    // State Variables
    const [template, setTemplate] = useState<TemplateType>('gst_nongst_special');
    const [theme, setTheme] = useState<ThemeType>('dark_royal');
    const [partnerName, setPartnerName] = useState('BillGST Official');
    const [phoneNumber, setPhoneNumber] = useState('+91 74985 71873');
    const [helplineNumber, setHelplineNumber] = useState('+91 74985 71873');
    const [areaCity, setAreaCity] = useState('');
    const [customOffer, setCustomOffer] = useState('100% मुफ़्त ऐप · लाइफटाइम कोई चार्ज नहीं (FREE App)');
    const [websiteUrl, setWebsiteUrl] = useState('https://www.billgst.com');
    const [qrCodeUrl, setQrCodeUrl] = useState('https://www.billgst.com');
    const [qrCodeLabel, setQrCodeLabel] = useState('📱 स्कैन कर ऐप खोलें');
    const [festiveHeading, setFestiveHeading] = useState('🎉 महा बचत व बिलिंग उत्सव');
    const [zoomLevel, setZoomLevel] = useState(1);
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
            if (!areaCity && bCity) setAreaCity(bCity);
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
                backgroundColor: theme === 'clean_print' ? '#ffffff' : (theme === 'emerald' ? '#064e3b' : theme === 'ruby_luxury' ? '#3b0713' : '#050d24'),
                logging: false
            });

            const link = document.createElement('a');
            link.download = `BillGST_${template}_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('✅ HD पोस्टर सफलतापूर्वक डाउनलोड हो गया!', { id: toastId });
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
            `⭐ *अन्य स्मार्ट फीचर्स:*\n` +
            `🎙️ AI बोलकर बिलिंग · 📸 AI पर्चा स्कैनर · ⚠️ लो-स्टॉक अलर्ट · ⏳ एक्सपायरी अलर्ट · 💬 WhatsApp ऑटो बिल · 📒 उधारी खाता · 👥 स्टाफ हाजिरी\n\n` +
            `📲 *Google Play Store और Web दोनों पर उपलब्ध!*\n` +
            `🎉 *100% मुफ़्त (LifeTime Free)* · कोई मंथली फीस नहीं!\n\n` +
            `🌐 *वेबसाइट:* ${websiteUrl}\n` +
            `📞 *24x7 हेल्पलाइन & WhatsApp सपोर्ट:* ${helplineNumber}`;

        const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    const handleCopyText = () => {
        const message = `🧾 GST और Non-GST दोनों तरह के बिल बनाएं सिर्फ 10 सेकंड में! 🚀\n\n` +
            `BillGST — भारत का सबसे आसान, सुरक्षित और 100% मुफ़्त सॉफ्टवेयर!\n\n` +
            `✅ 1. GST बिल (पक्का टैक्स इनवॉइस - CGST/SGST/IGST, B2B, GSTR-1/3B)\n` +
            `✅ 2. Non-GST बिल (सादा रसीद, एस्टीमेट, कोटेशन, डिलीवरी चालान)\n` +
            `✅ 3. थर्मल प्रिंटर (2"/3") और A4/A5 दोनों पर सुपरफास्ट प्रिंट\n` +
            `✅ 4. AI बोलकर बिलिंग (Voice AI) और AI स्कैनर (फोटो से बिल)\n` +
            `✅ 5. लो-स्टॉक & एक्सपायरी डेट ऑटो अलर्ट्स\n` +
            `✅ 6. ग्राहक के WhatsApp पर ऑटो बिल & उधारी रिमाइंडर\n` +
            `✅ 7. डिजिटल उधारी खाता & स्टाफ हाजिरी\n\n` +
            `📲 Google Play Store और Website दोनों पर उपलब्ध!\n` +
            `🎉 100% मुफ़्त (LifeTime Free App) · कोई चार्ज नहीं!\n` +
            `🌐 वेबसाइट: ${websiteUrl}\n` +
            `📞 हेल्पलाइन नंबर: ${helplineNumber}`;

        navigator.clipboard.writeText(message);
        toast.success('📋 GST & Non-GST मैसेज कॉपी हो गया!');
    };

    const handleResetDefaults = () => {
        setPartnerName(businessProfile?.business_name || 'BillGST Official');
        setPhoneNumber(businessProfile?.phone || '+91 74985 71873');
        setHelplineNumber('+91 74985 71873');
        setWebsiteUrl('https://www.billgst.com');
        setQrCodeUrl('https://www.billgst.com');
        setCustomOffer('100% मुफ़्त ऐप · लाइफटाइम कोई चार्ज नहीं (FREE App)');
        toast.success('डिफ़ॉल्ट सेटिंग्स रीसेट हो गईं');
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
                cardBg: 'rgba(6, 78, 59, 0.7)',
                cardBorder: 'rgba(52, 211, 153, 0.4)',
                accent: '#34d399',
                badgeBg: '#fbbf24',
                badgeText: '#000000',
                highlight: '#fde047',
                border: 'rgba(52, 211, 153, 0.45)',
                qrBg: '#ffffff',
                qrFg: '#022c22',
                goldBadge: '#fbbf24',
                alertBg: 'rgba(239, 68, 68, 0.2)',
                alertBorder: 'rgba(239, 68, 68, 0.5)'
            };
        }
        if (theme === 'ruby_luxury') {
            return {
                bg: 'linear-gradient(145deg, #3b0713 0%, #7f1d1d 50%, #2a040d 100%)',
                textPrimary: '#ffffff',
                textSecondary: '#fecdd3',
                cardBg: 'rgba(76, 5, 25, 0.7)',
                cardBorder: 'rgba(251, 113, 133, 0.4)',
                accent: '#fb7185',
                badgeBg: '#facc15',
                badgeText: '#000000',
                highlight: '#fde047',
                border: 'rgba(251, 113, 133, 0.45)',
                qrBg: '#ffffff',
                qrFg: '#3b0713',
                goldBadge: '#facc15',
                alertBg: 'rgba(239, 68, 68, 0.25)',
                alertBorder: 'rgba(239, 68, 68, 0.6)'
            };
        }
        // dark_royal default
        return {
            bg: 'linear-gradient(145deg, #050d24 0%, #0d1b46 50%, #030818 100%)',
            textPrimary: '#ffffff',
            textSecondary: '#94a3b8',
            cardBg: 'rgba(15, 23, 42, 0.78)',
            cardBorder: 'rgba(56, 189, 248, 0.38)',
            accent: '#38bdf8',
            badgeBg: '#f59e0b',
            badgeText: '#000000',
            highlight: '#fbbf24',
            border: 'rgba(56, 189, 248, 0.42)',
            qrBg: '#ffffff',
            qrFg: '#050d24',
            goldBadge: '#f59e0b',
            alertBg: 'rgba(239, 68, 68, 0.16)',
            alertBorder: 'rgba(239, 68, 68, 0.48)'
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
            <div className="max-w-7xl mx-auto mb-6 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl backdrop-blur-md shadow-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-amber-500/20">
                                📢
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                    BillGST मार्केटिंग & प्रचार स्टूडियो <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">100% FREE Posters</span>
                                </h1>
                                <p className="text-xs md:text-sm text-slate-400">
                                    दुकान प्रचार के लिए A4 पर्चा, GST vs Non-GST पोस्टर, WhatsApp स्टेटस और काउंटर स्टैंडी 1-क्लिक में बनाएं!
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
                            <FaPrint className="text-base" /> 🖨️ A4 प्रिंट (PDF)
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadImage}
                            disabled={isGeneratingImage}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95 cursor-pointer"
                        >
                            <FaDownload className="text-base" /> {isGeneratingImage ? 'डाउनलोड हो रहा है...' : '📥 HD फोटो (PNG)'}
                        </button>
                        <button
                            type="button"
                            onClick={handleWhatsAppShare}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all transform active:scale-95 cursor-pointer"
                        >
                            <FaWhatsapp className="text-base" /> WhatsApp शेयर
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content: Controls + Live Preview */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Controls Panel (Hidden during print) */}
                <div className="lg:col-span-4 flex flex-col gap-5 print:hidden">
                    {/* 1. Template Selector */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FaFileAlt className="text-amber-400" /> 1. टेम्पलेट का प्रकार चुनें
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'gst_nongst_special', label: 'GST & Non-GST पोस्टर', desc: 'पक्का व सादा बिल स्पेशल', icon: '🧾' },
                                { id: 'a4_flyer', label: 'A4 मास्टर पर्चा', desc: 'सभी 12 फीचर्स चार्ट', icon: '📄' },
                                { id: 'whatsapp_square', label: 'WhatsApp स्क्वायर', desc: 'स्टेटस और DP के लिए (1:1)', icon: '📱' },
                                { id: 'counter_standee', label: 'काउंटर स्टैंडी / QR', desc: 'दुकान टेबल QR स्टीकर', icon: '📜' },
                                { id: 'festive_dhamaka', label: 'त्योहारी महा-ऑफर', desc: 'स्पेशल डिस्काउंट पर्चा', icon: '🎁' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setTemplate(item.id as TemplateType)}
                                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                                        template === item.id
                                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10 font-bold'
                                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="text-base mb-0.5">{item.icon}</div>
                                    <div className="text-xs font-bold leading-tight">{item.label}</div>
                                    <div className="text-[9.5px] text-slate-400 mt-0.5 leading-tight">{item.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Color Theme */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FaPalette className="text-indigo-400" /> 2. कलर स्टाइल चुनें
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: 'dark_royal', label: 'रॉयल ब्लू', bg: 'from-blue-900 to-indigo-950', dot: '#38bdf8' },
                                { id: 'emerald', label: 'एमराल्ड ग्रीन', bg: 'from-emerald-900 to-teal-950', dot: '#34d399' },
                                { id: 'ruby_luxury', label: 'रूबी रेड', bg: 'from-rose-950 to-red-950', dot: '#fb7185' },
                                { id: 'clean_print', label: 'सस्ता प्रिंट (White)', bg: 'from-slate-100 to-slate-200 text-slate-900', dot: '#0f172a' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setTheme(item.id as ThemeType)}
                                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                        theme === item.id
                                            ? 'border-amber-400 ring-2 ring-amber-400/30'
                                            : 'border-slate-700 hover:border-slate-600'
                                    } bg-gradient-to-b ${item.bg}`}
                                >
                                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: item.dot }}></div>
                                    <span className="text-[10.5px] font-bold text-center leading-tight">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Customizer Details */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col gap-3.5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                <FaTag className="text-emerald-400" /> 3. दुकान & प्रचार जानकारी
                            </h2>
                            <button
                                type="button"
                                onClick={handleResetDefaults}
                                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                                title="Reset"
                            >
                                <FaUndo size={10} /> रीसेट
                            </button>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                                <FaStore className="text-amber-400" /> दुकान / फर्म / आपका नाम
                            </label>
                            <input
                                type="text"
                                value={partnerName}
                                onChange={(e) => setPartnerName(e.target.value)}
                                placeholder="जैसे: पालीवाल एजेंसी / घनश्याम"
                                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-amber-400 mb-1 flex items-center gap-1">
                                <FaHeadset /> 24x7 हेल्पलाइन / WhatsApp नंबर
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
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">शहर / बाज़ार का नाम</label>
                            <input
                                type="text"
                                value={areaCity}
                                onChange={(e) => setAreaCity(e.target.value)}
                                placeholder="जैसे: मुख्य बाज़ार, उदयपुर / जयपुर"
                                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">ऑफर / फ़्री बैज टेक्स्ट</label>
                            <input
                                type="text"
                                value={customOffer}
                                onChange={(e) => setCustomOffer(e.target.value)}
                                placeholder="100% मुफ़्त ऐप · लाइफटाइम कोई चार्ज नहीं!"
                                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        {template === 'festive_dhamaka' && (
                            <div>
                                <label className="block text-[11px] font-semibold text-amber-300 mb-1 flex items-center gap-1">
                                    <FaGift /> त्योहारी ऑफर शीर्षक (Festive Heading)
                                </label>
                                <input
                                    type="text"
                                    value={festiveHeading}
                                    onChange={(e) => setFestiveHeading(e.target.value)}
                                    placeholder="🎉 महा बचत व बिलिंग उत्सव"
                                    className="w-full px-3 py-2 bg-slate-800/80 border border-amber-500/60 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10.5px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                    <FaQrcode className="text-cyan-400" /> QR कोड लिंक
                                </label>
                                <input
                                    type="text"
                                    value={qrCodeUrl}
                                    onChange={(e) => setQrCodeUrl(e.target.value)}
                                    placeholder="https://www.billgst.com"
                                    className="w-full px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-[11px] text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10.5px] font-semibold text-slate-400 mb-1">QR लेबल टेक्स्ट</label>
                                <input
                                    type="text"
                                    value={qrCodeLabel}
                                    onChange={(e) => setQrCodeLabel(e.target.value)}
                                    placeholder="📱 स्कैन कर ऐप खोलें"
                                    className="w-full px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-[11px] text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopyText}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer mt-1"
                        >
                            <FaCopy /> WhatsApp प्रचार मैसेज कॉपी करें
                        </button>
                    </div>
                </div>

                {/* Right: Live Interactive Canvas (Rendered for Screen & Print) */}
                <div className="lg:col-span-8 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400 print:hidden flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 font-semibold">
                            <FaEye className="text-amber-400" /> लाइव पूर्वावलोकन (Live Canvas Preview):
                        </span>
                        
                        <div className="flex items-center gap-3">
                            {/* Zoom controls */}
                            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                                <button 
                                    onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.1))} 
                                    className="px-2 py-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                    title="Zoom Out"
                                >
                                    <FaSearchMinus size={11} />
                                </button>
                                <span className="text-[11px] font-mono px-1.5 text-slate-300">{Math.round(zoomLevel * 100)}%</span>
                                <button 
                                    onClick={() => setZoomLevel(Math.min(1.4, zoomLevel + 0.1))} 
                                    className="px-2 py-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                    title="Zoom In"
                                >
                                    <FaSearchPlus size={11} />
                                </button>
                            </div>
                            <span className="text-[11px] text-emerald-400 font-bold hidden sm:inline">
                                ✓ Helpline: +91 74985 71873
                            </span>
                        </div>
                    </div>

                    {/* Canvas Wrapper with Zoom transform */}
                    <div className="w-full overflow-x-auto flex justify-center py-2 custom-scrollbar">
                        <div 
                            style={{ 
                                transform: `scale(${zoomLevel})`, 
                                transformOrigin: 'top center', 
                                transition: 'transform 0.2s ease-out' 
                            }}
                        >
                            <div
                                id="print-marketing-canvas"
                                ref={previewRef}
                                style={{
                                    width: template === 'whatsapp_square' ? '680px' : '794px',
                                    minHeight: template === 'whatsapp_square' ? '680px' : (template === 'counter_standee' ? '820px' : '1123px'),
                                    background: currentStyles.bg,
                                    color: currentStyles.textPrimary,
                                    border: `2px solid ${currentStyles.border}`,
                                    borderRadius: theme === 'clean_print' ? '0px' : '16px',
                                    boxShadow: theme === 'clean_print' ? 'none' : '0 25px 60px rgba(0,0,0,0.6)',
                                    padding: template === 'whatsapp_square' ? '18px' : (template === 'counter_standee' ? '24px 24px' : '22px 22px'),
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    boxSizing: 'border-box',
                                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                                }}
                            >
                                {/* ====================== 1. TOP BRANDING HEADER ====================== */}
                                <div>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between', 
                                        borderBottom: `2px solid ${currentStyles.cardBorder}`, 
                                        paddingBottom: '8px', 
                                        marginBottom: '10px' 
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

                                    {/* =================== TEMPLATE SPECIFIC CONTENT =================== */}

                                    {/* --- TEMPLATE 1: GST & Non-GST Special Poster --- */}
                                    {template === 'gst_nongst_special' && (
                                        <>
                                            {/* Hero Headline */}
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
                                                    fontSize: '23px',
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

                                            {/* 2 Big Pillars: GST vs Non-GST Side-by-Side */}
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

                                            {/* 3 Smart Alerts: AI Scanner, Low Stock & Expiry */}
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

                                            {/* Supporting Feature Mini Grid */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr 1fr',
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
                                        </>
                                    )}

                                    {/* --- TEMPLATE 2: A4 Master Flyer (Full 12 Features Chart) --- */}
                                    {template === 'a4_flyer' && (
                                        <>
                                            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '3px 14px',
                                                    borderRadius: '20px',
                                                    background: currentStyles.cardBg,
                                                    border: `1px solid ${currentStyles.cardBorder}`,
                                                    color: currentStyles.highlight,
                                                    fontSize: '11px',
                                                    fontWeight: 800,
                                                    marginBottom: '4px'
                                                }}>
                                                    🇮🇳 भारत का सबसे भरोसेमंद ऑल-इन-वन व्यापार सॉफ्टवेयर
                                                </div>
                                                <h2 style={{ fontSize: '24px', fontWeight: 900, lineHeight: '1.2', marginBottom: '4px' }}>
                                                    दुकान और व्यापार का सारा काम संभाले सिर्फ एक ऐप!
                                                </h2>
                                                <p style={{ fontSize: '12px', color: currentStyles.textSecondary }}>
                                                    बिलिंग, उधारी खाता, स्टॉक, स्टाफ हाजिरी, WhatsApp बिलिंग और CA रिपोर्ट — 100% फ्री
                                                </p>
                                            </div>

                                            {/* Full 12 Feature Matrix */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr 1fr',
                                                gap: '8px',
                                                marginBottom: '12px'
                                            }}>
                                                {allFeatures.map((f, i) => (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            background: currentStyles.cardBg,
                                                            border: `1.5px solid ${currentStyles.cardBorder}`,
                                                            borderRadius: '10px',
                                                            padding: '8px 10px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '3px'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontSize: '16px' }}>{f.icon}</span>
                                                            <span style={{ fontSize: '11px', fontWeight: 800, color: currentStyles.textPrimary, lineHeight: '1.2' }}>
                                                                {f.title}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '9px', color: currentStyles.textSecondary, lineHeight: '1.25' }}>
                                                            {f.desc}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* --- TEMPLATE 3: WhatsApp Square (1:1 Ratio) --- */}
                                    {template === 'whatsapp_square' && (
                                        <>
                                            <div style={{ textAlign: 'center', margin: '8px 0 14px 0' }}>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '3px 12px',
                                                    borderRadius: '20px',
                                                    background: currentStyles.cardBg,
                                                    border: `1px solid ${currentStyles.cardBorder}`,
                                                    color: currentStyles.highlight,
                                                    fontSize: '11px',
                                                    fontWeight: 800,
                                                    marginBottom: '4px'
                                                }}>
                                                    ⚡ सिर्फ 10 सेकंड में बिलिंग
                                                </div>
                                                <h2 style={{ fontSize: '21px', fontWeight: 900, lineHeight: '1.2', marginBottom: '4px' }}>
                                                    GST व Non-GST बिल बनाएं और WhatsApp पर भेजें!
                                                </h2>
                                                <p style={{ fontSize: '11.5px', color: currentStyles.textSecondary }}>
                                                    मोबाइल व कंप्यूटर दोनों पर उपलब्ध · लाइफटाइम 100% फ्री
                                                </p>
                                            </div>

                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '8px',
                                                marginBottom: '12px'
                                            }}>
                                                {[
                                                    { icon: '🧾', title: 'GST & Non-GST बिलिंग', desc: 'A4, A5 & थर्मल प्रिंट' },
                                                    { icon: '🎙️', title: 'AI बोलकर बिलिंग', desc: 'आवाज से 5 सेकंड में बिल' },
                                                    { icon: '💬', title: 'WhatsApp ऑटो बिल', desc: 'उधारी रिमाइंडर के साथ' },
                                                    { icon: '⚠️', title: 'स्टॉक & एक्सपायरी अलर्ट', desc: 'सामान खत्म होने से पहले सूचना' },
                                                ].map((item, idx) => (
                                                    <div 
                                                        key={idx}
                                                        style={{
                                                            background: currentStyles.cardBg,
                                                            border: `1.5px solid ${currentStyles.cardBorder}`,
                                                            borderRadius: '10px',
                                                            padding: '8px 10px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '20px' }}>{item.icon}</span>
                                                        <div>
                                                            <div style={{ fontSize: '11px', fontWeight: 800, color: currentStyles.textPrimary }}>
                                                                {item.title}
                                                            </div>
                                                            <div style={{ fontSize: '9px', color: currentStyles.textSecondary }}>
                                                                {item.desc}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* --- TEMPLATE 4: Shop Counter Standee (Huge QR Focus) --- */}
                                    {template === 'counter_standee' && (
                                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '4px 16px',
                                                borderRadius: '30px',
                                                background: '#10b981',
                                                color: '#ffffff',
                                                fontSize: '12px',
                                                fontWeight: 900,
                                                marginBottom: '8px'
                                            }}>
                                                ✅ हमारे यहाँ डिजिटल व पक्का बिल उपलब्ध है!
                                            </div>
                                            <h2 style={{ fontSize: '24px', fontWeight: 900, lineHeight: '1.2', marginBottom: '6px' }}>
                                                {partnerName || 'हमारे काउंटर पर आपका स्वागत है'}
                                            </h2>
                                            <p style={{ fontSize: '12px', color: currentStyles.textSecondary, marginBottom: '16px' }}>
                                                सीधे अपने WhatsApp पर सुरक्षित बिल और रसीद पाएं
                                            </p>

                                            {/* Big Standee Central QR */}
                                            <div style={{
                                                display: 'inline-flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                background: '#ffffff',
                                                padding: '16px 20px',
                                                borderRadius: '16px',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                                                border: '4px solid #38bdf8',
                                                margin: '0 auto 16px auto'
                                            }}>
                                                <QRCodeSVG
                                                    value={qrCodeUrl || 'https://www.billgst.com'}
                                                    size={160}
                                                    fgColor="#000000"
                                                    bgColor="#ffffff"
                                                    level="H"
                                                />
                                                <div style={{ fontSize: '12px', fontWeight: 900, color: '#000000', marginTop: '8px' }}>
                                                    {qrCodeLabel || '📱 स्कैन कर डिजिटल बिल देखें'}
                                                </div>
                                                <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '2px' }}>
                                                    Powered by BillGST.com
                                                </div>
                                            </div>

                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr 1fr',
                                                gap: '8px',
                                                maxWidth: '560px',
                                                margin: '0 auto 10px auto'
                                            }}>
                                                <div style={{ background: currentStyles.cardBg, border: `1px solid ${currentStyles.cardBorder}`, borderRadius: '8px', padding: '6px' }}>
                                                    <div style={{ fontSize: '14px' }}>⚡</div>
                                                    <div style={{ fontSize: '10px', fontWeight: 800 }}>10s फास्ट बिल</div>
                                                </div>
                                                <div style={{ background: currentStyles.cardBg, border: `1px solid ${currentStyles.cardBorder}`, borderRadius: '8px', padding: '6px' }}>
                                                    <div style={{ fontSize: '14px' }}>💬</div>
                                                    <div style={{ fontSize: '10px', fontWeight: 800 }}>WhatsApp बिल</div>
                                                </div>
                                                <div style={{ background: currentStyles.cardBg, border: `1px solid ${currentStyles.cardBorder}`, borderRadius: '8px', padding: '6px' }}>
                                                    <div style={{ fontSize: '14px' }}>🔒</div>
                                                    <div style={{ fontSize: '10px', fontWeight: 800 }}>100% सुरक्षित</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* --- TEMPLATE 5: Festive Dhamaka Offer Poster --- */}
                                    {template === 'festive_dhamaka' && (
                                        <>
                                            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '4px 16px',
                                                    borderRadius: '30px',
                                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                    color: '#000000',
                                                    fontSize: '12px',
                                                    fontWeight: 900,
                                                    marginBottom: '6px',
                                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                                }}>
                                                    {festiveHeading}
                                                </div>
                                                <h2 style={{ fontSize: '25px', fontWeight: 900, lineHeight: '1.2', marginBottom: '4px', color: currentStyles.highlight }}>
                                                    त्योहारी सीजन में अपने व्यापार को बनाएं 100% डिजिटल!
                                                </h2>
                                                <p style={{ fontSize: '12px', color: currentStyles.textSecondary }}>
                                                    ग्राहकों को दें आकर्षक पक्का व सादा बिल, WhatsApp विशेज और भारी बचत!
                                                </p>
                                            </div>

                                            <div style={{
                                                background: 'rgba(245, 158, 11, 0.15)',
                                                border: '2px solid rgba(245, 158, 11, 0.5)',
                                                borderRadius: '12px',
                                                padding: '12px 14px',
                                                marginBottom: '10px',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '16px', fontWeight: 900, color: currentStyles.highlight, marginBottom: '4px' }}>
                                                    🎁 {customOffer}
                                                </div>
                                                <div style={{ fontSize: '11px', color: currentStyles.textPrimary }}>
                                                    किराना, गारमेंट्स, इलेक्ट्रॉनिक्स, मोबाइल, हार्डवेयर व सभी रिटेल / होलसेल दुकानों के लिए सर्वश्रेष्ठ!
                                                </div>
                                            </div>

                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr 1fr',
                                                gap: '6px',
                                                marginBottom: '10px'
                                            }}>
                                                {allFeatures.slice(0, 6).map((f, i) => (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            background: currentStyles.cardBg,
                                                            border: `1.5px solid ${currentStyles.cardBorder}`,
                                                            borderRadius: '8px',
                                                            padding: '6px 8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '16px' }}>{f.icon}</span>
                                                        <span style={{ fontSize: '10.5px', fontWeight: 800, color: currentStyles.textPrimary }}>
                                                            {f.title}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* 100% FREE BANNER + PLAY STORE (For non-standee templates) */}
                                    {template !== 'counter_standee' && (
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
                                    )}
                                </div>

                                {/* ====================== 2. BOTTOM FOOTER ====================== */}
                                <div>
                                    {/* BIG GLOWING HELPLINE BANNER */}
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

                                        {/* QR Code Box (For templates other than standee) */}
                                        {template !== 'counter_standee' && (
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
                                                    value={qrCodeUrl || 'https://www.billgst.com'}
                                                    size={template === 'whatsapp_square' ? 56 : 64}
                                                    fgColor={currentStyles.qrFg}
                                                    bgColor={currentStyles.qrBg}
                                                    level="H"
                                                />
                                                <span style={{ fontSize: '7px', fontWeight: 800, color: '#000000', marginTop: '2px', textAlign: 'center', lineHeight: '1.1' }}>
                                                    {qrCodeLabel || '📱 स्कैन कर ऐप खोलें'}
                                                </span>
                                            </div>
                                        )}
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
