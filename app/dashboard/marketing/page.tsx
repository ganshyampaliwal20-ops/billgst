'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { 
    FaPrint, FaDownload, FaWhatsapp, FaPalette, FaFileAlt, 
    FaTag, FaCopy, FaEye, FaHeadset, FaStore, FaQrcode,
    FaCheckCircle, FaUndo, FaSearchPlus, FaSearchMinus, FaGift,
    FaMotorcycle, FaIdCard, FaBullhorn, FaCreditCard, FaPhoneAlt,
    FaMapMarkerAlt, FaPercent
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';

type CategoryMode = 'shop_marketing' | 'software_partner';
type ShopTemplateType = 'shop_sale_offer' | 'shop_counter_upi' | 'shop_home_delivery' | 'shop_visiting_card' | 'shop_festival_wishes';
type PartnerTemplateType = 'gst_nongst_special' | 'a4_flyer' | 'whatsapp_square';
type ThemeType = 'royal_gold' | 'emerald_green' | 'ruby_festive' | 'saffron_sun' | 'clean_white_print';

export default function MarketingStudioPage() {
    const { data: session } = useSession();
    const businessProfile = useStore((state: any) => state.businessProfile) || {};
    const fetchBusinessProfile = useStore((state: any) => state.fetchBusinessProfile);

    // Active Category (Shop Promotion is primary default)
    const [categoryMode, setCategoryMode] = useState<CategoryMode>('shop_marketing');

    // Templates
    const [shopTemplate, setShopTemplate] = useState<ShopTemplateType>('shop_sale_offer');
    const [partnerTemplate, setPartnerTemplate] = useState<PartnerTemplateType>('gst_nongst_special');
    const [theme, setTheme] = useState<ThemeType>('royal_gold');

    // Shop Customizer Fields
    const [shopName, setShopName] = useState('श्री गणेश किराना & जनरल स्टोर');
    const [ownerName, setOwnerName] = useState('घनश्याम पालीवाल');
    const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
    const [alternatePhone, setAlternatePhone] = useState('');
    const [shopAddress, setShopAddress] = useState('मेन मार्केट, घंटाघर के पास, उदयपुर (राज.)');
    const [upiId, setUpiId] = useState('ghanshyam@upi');
    const [gstin, setGstin] = useState('');
    const [tagline, setTagline] = useState('शुद्धता, विश्वास और उचित मूल्य का एकमात्र स्थान');
    const [offerHeading, setOfferHeading] = useState('🔥 महा बचत सेल - विशेष डिस्काउंट ऑफर!');
    const [discountHighlight, setDiscountHighlight] = useState('सभी सामानों पर 10% से 40% तक की भारी छूट');
    const [itemHighlights, setItemHighlights] = useState('दाल, चावल, तेल, मसाले, ड्राई फ्रूट्स, किराना सामग्री');
    const [freeDeliveryMin, setFreeDeliveryMin] = useState('₹500');
    const [festivalName, setFestivalName] = useState('दीपावली');
    const [festivalWishes, setFestivalWishes] = useState('आप सभी सम्मानित ग्राहकों एवं क्षेत्रवासियों को धनतेरस व दीपावली की हार्दिक शुभकामनाएं!');
    const [customQrUrl, setCustomQrUrl] = useState('');
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    // BillGST Partner Helpline
    const helplineNumber = '+91 74985 71873';

    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof fetchBusinessProfile === 'function') {
            fetchBusinessProfile();
        }
    }, [fetchBusinessProfile]);

    useEffect(() => {
        if (businessProfile) {
            const bName = businessProfile.name || businessProfile.business_name || session?.user?.name;
            const bPhone = businessProfile.phone || businessProfile.mobile;
            const bAddress = businessProfile.address || (businessProfile.city ? `${businessProfile.city}, ${businessProfile.state || ''}` : '');
            const bUpi = businessProfile.upi_id;
            const bGstin = businessProfile.gstin;
            const bOwner = businessProfile.owner_name || session?.user?.name;

            if (bName) setShopName(bName);
            if (bPhone && !bPhone.includes('@')) setPhoneNumber(bPhone);
            if (bAddress) setShopAddress(bAddress);
            if (bUpi) setUpiId(bUpi);
            if (bGstin) setGstin(bGstin);
            if (bOwner) setOwnerName(bOwner);
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
                backgroundColor: theme === 'clean_white_print' ? '#ffffff' : (theme === 'emerald_green' ? '#064e3b' : theme === 'ruby_festive' ? '#3b0713' : theme === 'saffron_sun' ? '#431407' : '#050d24'),
                logging: false
            });

            const link = document.createElement('a');
            link.download = `${shopName.replace(/\s+/g, '_')}_${categoryMode === 'shop_marketing' ? shopTemplate : partnerTemplate}_${Date.now()}.png`;
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
        let message = '';
        if (categoryMode === 'shop_marketing') {
            if (shopTemplate === 'shop_sale_offer') {
                message = `*🔥 ${shopName} - महा बचत सेल & डिस्काउंट ऑफर!* 🎉\n\n` +
                    `*${tagline}*\n\n` +
                    `⭐ *विशेष ऑफर:* ${discountHighlight}\n` +
                    `📦 *उपलब्ध सामान:* ${itemHighlights}\n` +
                    `🚚 *फ्री होम डिलीवरी:* ₹${freeDeliveryMin} से अधिक के ऑर्डर पर!\n\n` +
                    `📍 *दुकान का पता:* ${shopAddress}\n` +
                    `📞 *ऑर्डर व पूछताछ के लिए कॉल/WhatsApp करें:* ${phoneNumber}\n\n` +
                    `आज ही पधारें और भारी बचत का लाभ उठाएं! 🙏`;
            } else if (shopTemplate === 'shop_home_delivery') {
                message = `*🛒 अब घर बैठे सामान मंगाएं - ${shopName}!* 🛵\n\n` +
                    `दुकान पर आने की जरूरत नहीं, बस अपनी सामान की लिस्ट हमें WhatsApp करें!\n\n` +
                    `✅ शुद्ध और ताजा सामान\n` +
                    `✅ उचित और बाजार से सस्ते दाम\n` +
                    `✅ सुपरफास्ट होम डिलीवरी (${freeDeliveryMin ? `₹${freeDeliveryMin} पर फ्री` : 'उपलब्ध'})\n` +
                    `✅ WhatsApp पर पक्का डिजिटल बिल\n\n` +
                    `📲 *अभी लिस्ट भेजें:* wa.me/${phoneNumber.replace(/[^0-9]/g, '')}\n` +
                    `📍 *दुकान:* ${shopAddress}`;
            } else if (shopTemplate === 'shop_festival_wishes') {
                message = `*✨ ${festivalName} की हार्दिक शुभकामनाएं! ✨*\n\n` +
                    `${festivalWishes}\n\n` +
                    `आप और आपके पूरे परिवार के सुख, समृद्धि और उत्तम स्वास्थ्य की मंगलकामनाएं।\n\n` +
                    `शुभेच्छुक:\n` +
                    `*${shopName}*\n` +
                    `${ownerName ? `प्रो: ${ownerName}\n` : ''}` +
                    `📞 ${phoneNumber}\n` +
                    `📍 ${shopAddress}`;
            } else {
                message = `*🏪 ${shopName}*\n\n` +
                    `*${tagline}*\n\n` +
                    `👤 *प्रो:* ${ownerName}\n` +
                    `📞 *मोबाइल:* ${phoneNumber}\n` +
                    `📍 *पता:* ${shopAddress}\n` +
                    `${gstin ? `🧾 *GSTIN:* ${gstin}\n` : ''}` +
                    `💬 हमारे यहाँ खरीदारी पर तुरंत WhatsApp डिजिटल बिल प्राप्त करें!`;
            }
        } else {
            message = `*🧾 GST और Non-GST दोनों तरह के बिल बनाएं सिर्फ 10 सेकंड में!* 🚀\n\n` +
                `*BillGST* — भारत का #1 ऑल-इन-वन GST & Non-GST बिलिंग सॉफ्टवेयर (100% FREE)\n\n` +
                `🔹 GST पक्का बिल (B2B/B2C, E-Way Bill, GSTR-1)\n` +
                `🔹 Non-GST सादा बिल (थर्मल 2"/3", कोटेशन, चालान)\n` +
                `🔹 AI बोलकर बिलिंग, OCR स्कैनर, लो-स्टॉक & एक्सपायरी अलर्ट\n\n` +
                `📲 *Google Play Store और Web (www.billgst.com) पर 100% मुफ़्त!*\n` +
                `📞 हेल्पलाइन: ${helplineNumber}`;
        }

        const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    const handleCopyText = () => {
        let message = '';
        if (categoryMode === 'shop_marketing') {
            message = `🔥 ${shopName} - महा बचत सेल!\n\n` +
                `⭐ ऑफर: ${discountHighlight}\n` +
                `📦 सामान: ${itemHighlights}\n` +
                `📍 पता: ${shopAddress}\n` +
                `📞 संपर्क: ${phoneNumber}`;
        } else {
            message = `BillGST — भारत का 100% मुफ़्त GST & Non-GST बिलिंग सॉफ्टवेयर। Play Store पर उपलब्ध। हेल्पलाइन: ${helplineNumber}`;
        }
        navigator.clipboard.writeText(message);
        toast.success('📋 प्रचार मैसेज कॉपी हो गया!');
    };

    const handleResetDefaults = () => {
        const bName = businessProfile.name || businessProfile.business_name || 'श्री गणेश किराना & जनरल स्टोर';
        const bPhone = businessProfile.phone || '+91 98765 43210';
        const bAddress = businessProfile.address || 'मेन मार्केट, घंटाघर के पास, शहर';
        setShopName(bName);
        setPhoneNumber(bPhone);
        setShopAddress(bAddress);
        setTagline('शुद्धता, विश्वास और उचित मूल्य का एकमात्र स्थान');
        setOfferHeading('🔥 महा बचत सेल - विशेष डिस्काउंट ऑफर!');
        setDiscountHighlight('सभी सामानों पर 10% से 40% तक की भारी छूट');
        toast.success('डिफ़ॉल्ट सेटिंग्स रीसेट हो गईं');
    };

    // Theme Variables
    const getThemeStyles = () => {
        if (theme === 'clean_white_print') {
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
                headerGrad: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                footerGrad: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                footerText: '#0f172a'
            };
        }
        if (theme === 'emerald_green') {
            return {
                bg: 'linear-gradient(145deg, #022c22 0%, #064e3b 50%, #022c22 100%)',
                textPrimary: '#ffffff',
                textSecondary: '#a7f3d0',
                cardBg: 'rgba(6, 78, 59, 0.72)',
                cardBorder: 'rgba(52, 211, 153, 0.4)',
                accent: '#34d399',
                badgeBg: '#fbbf24',
                badgeText: '#000000',
                highlight: '#fde047',
                border: 'rgba(52, 211, 153, 0.45)',
                qrBg: '#ffffff',
                qrFg: '#022c22',
                goldBadge: '#fbbf24',
                headerGrad: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                footerGrad: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                footerText: '#000000'
            };
        }
        if (theme === 'ruby_festive') {
            return {
                bg: 'linear-gradient(145deg, #3b0713 0%, #7f1d1d 50%, #2a040d 100%)',
                textPrimary: '#ffffff',
                textSecondary: '#fecdd3',
                cardBg: 'rgba(76, 5, 25, 0.72)',
                cardBorder: 'rgba(251, 113, 133, 0.4)',
                accent: '#fb7185',
                badgeBg: '#facc15',
                badgeText: '#000000',
                highlight: '#fde047',
                border: 'rgba(251, 113, 133, 0.45)',
                qrBg: '#ffffff',
                qrFg: '#3b0713',
                goldBadge: '#facc15',
                headerGrad: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
                footerGrad: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                footerText: '#000000'
            };
        }
        if (theme === 'saffron_sun') {
            return {
                bg: 'linear-gradient(145deg, #431407 0%, #7c2d12 50%, #2a0a03 100%)',
                textPrimary: '#ffffff',
                textSecondary: '#fed7aa',
                cardBg: 'rgba(124, 45, 18, 0.65)',
                cardBorder: 'rgba(251, 146, 60, 0.4)',
                accent: '#fb923c',
                badgeBg: '#facc15',
                badgeText: '#000000',
                highlight: '#fde047',
                border: 'rgba(251, 146, 60, 0.45)',
                qrBg: '#ffffff',
                qrFg: '#431407',
                goldBadge: '#facc15',
                headerGrad: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)',
                footerGrad: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                footerText: '#000000'
            };
        }
        // royal_gold default
        return {
            bg: 'linear-gradient(145deg, #050d24 0%, #0d1b46 50%, #030818 100%)',
            textPrimary: '#ffffff',
            textSecondary: '#94a3b8',
            cardBg: 'rgba(15, 23, 42, 0.8)',
            cardBorder: 'rgba(56, 189, 248, 0.38)',
            accent: '#38bdf8',
            badgeBg: '#f59e0b',
            badgeText: '#000000',
            highlight: '#fbbf24',
            border: 'rgba(56, 189, 248, 0.42)',
            qrBg: '#ffffff',
            qrFg: '#050d24',
            goldBadge: '#f59e0b',
            headerGrad: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            footerGrad: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            footerText: '#000000'
        };
    };

    const currentStyles = getThemeStyles();

    // Computed QR Code value
    const getQrValue = () => {
        if (customQrUrl) return customQrUrl;
        if (categoryMode === 'shop_marketing') {
            if (shopTemplate === 'shop_counter_upi') {
                return upiId 
                    ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&cu=INR`
                    : `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`;
            }
            return `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`नमस्ते ${shopName}, मुझे सामान का ऑर्डर देना है।`)}`;
        }
        return 'https://www.billgst.com';
    };

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

            {/* Header section */}
            <div className="max-w-7xl mx-auto mb-6 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl backdrop-blur-md shadow-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-amber-500/20">
                                🏪
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                    दुकानदार बिज़नेस प्रचार स्टूडियो <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">Free Shop Posters</span>
                                </h1>
                                <p className="text-xs md:text-sm text-slate-400">
                                    अपनी दुकान के लिए सेल पोस्टर, काउंटर UPI स्टैंडी, होम डिलीवरी पर्चा और शुभकामना कार्ड बनाएं!
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
                            <FaDownload className="text-base" /> {isGeneratingImage ? 'डाउनलोड हो रहा है...' : '📥 HD पोस्टर (PNG)'}
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

                {/* Primary Category Switcher Tabs */}
                <div className="flex items-center gap-2 mt-4 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setCategoryMode('shop_marketing')}
                        className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                            categoryMode === 'shop_marketing'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                    >
                        <FaStore className="text-base" /> 🏪 मेरी दुकान का प्रचार (Shop Posters & Standees)
                    </button>
                    <button
                        onClick={() => setCategoryMode('software_partner')}
                        className={`py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                            categoryMode === 'software_partner'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                    >
                        <FaBullhorn className="text-base" /> 🤝 BillGST पार्टनर / रेफरल पोस्टर
                    </button>
                </div>
            </div>

            {/* Main Content: Controls + Live Preview */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Controls Panel */}
                <div className="lg:col-span-4 flex flex-col gap-5 print:hidden">
                    {/* 1. Template Selector */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FaFileAlt className="text-amber-400" /> 1. पोस्टर का डिज़ाइन चुनें
                        </h2>

                        {categoryMode === 'shop_marketing' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[
                                    { id: 'shop_sale_offer', label: '🔥 महा सेल & ऑफर', desc: 'डिस्काउंट व सेल पोस्टर', icon: '🏷️' },
                                    { id: 'shop_counter_upi', label: '💳 काउंटर UPI स्टैंडी', desc: 'Google Pay/PhonePe QR', icon: '📱' },
                                    { id: 'shop_home_delivery', label: '🛵 होम डिलीवरी पर्चा', desc: 'WhatsApp ऑनलाइन ऑर्डर', icon: '📦' },
                                    { id: 'shop_visiting_card', label: '🪪 डिजिटल विज़िटिंग कार्ड', desc: 'दुकानदार प्रोफ़ाइल कार्ड', icon: '💼' },
                                    { id: 'shop_festival_wishes', label: '🎉 त्योहारी शुभकामना', desc: 'दीवाली/होली बधाई पोस्टर', icon: '✨' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setShopTemplate(item.id as ShopTemplateType)}
                                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                                            shopTemplate === item.id
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
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[
                                    { id: 'gst_nongst_special', label: 'GST & Non-GST पोस्टर', desc: 'पक्का व सादा बिल स्पेशल', icon: '🧾' },
                                    { id: 'a4_flyer', label: 'A4 मास्टर पर्चा', desc: 'सभी 12 फीचर्स चार्ट', icon: '📄' },
                                    { id: 'whatsapp_square', label: 'WhatsApp स्क्वायर', desc: '1:1 स्टेटस व DP के लिए', icon: '📱' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setPartnerTemplate(item.id as PartnerTemplateType)}
                                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                                            partnerTemplate === item.id
                                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10 font-bold'
                                                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="text-base mb-0.5">{item.icon}</div>
                                        <div className="text-xs font-bold leading-tight">{item.label}</div>
                                        <div className="text-[9.5px] text-slate-400 mt-0.5 leading-tight">{item.desc}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Color Theme */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FaPalette className="text-indigo-400" /> 2. कलर स्टाइल चुनें
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                                { id: 'royal_gold', label: 'शाही गोल्ड', bg: 'from-blue-900 to-indigo-950', dot: '#fbbf24' },
                                { id: 'emerald_green', label: 'शुभ हरा', bg: 'from-emerald-900 to-teal-950', dot: '#34d399' },
                                { id: 'ruby_festive', label: 'त्योहारी लाल', bg: 'from-rose-950 to-red-950', dot: '#fb7185' },
                                { id: 'saffron_sun', label: 'केसरिया', bg: 'from-amber-950 to-orange-950', dot: '#fb923c' },
                                { id: 'clean_white_print', label: 'सस्ता प्रिंट (White)', bg: 'from-slate-100 to-slate-200 text-slate-900', dot: '#0f172a' },
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
                                    <span className="text-[10px] font-bold text-center leading-tight">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Customizer Details */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col gap-3.5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                <FaTag className="text-emerald-400" /> 3. दुकान की जानकारी भरें
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
                            <label className="block text-[11px] font-semibold text-amber-400 mb-1 flex items-center gap-1">
                                <FaStore /> दुकान / फर्म का नाम (Shop Name)
                            </label>
                            <input
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="जैसे: श्री गणेश किराना स्टोर"
                                className="w-full px-3 py-2 bg-slate-800/80 border border-amber-500/50 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10.5px] font-semibold text-slate-300 mb-1">दुकानदार / प्रोपराइटर नाम</label>
                                <input
                                    type="text"
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    placeholder="घनश्याम पालीवाल"
                                    className="w-full px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10.5px] font-semibold text-slate-300 mb-1">मोबाइल / WhatsApp</label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="w-full px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10.5px] font-semibold text-slate-300 mb-1">दुकान का पूरा पता</label>
                            <input
                                type="text"
                                value={shopAddress}
                                onChange={(e) => setShopAddress(e.target.value)}
                                placeholder="मेन मार्केट, घंटाघर के पास, उदयपुर"
                                className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        {/* Template specific fields */}
                        {categoryMode === 'shop_marketing' && shopTemplate === 'shop_sale_offer' && (
                            <>
                                <div>
                                    <label className="block text-[10.5px] font-semibold text-amber-300 mb-1 flex items-center gap-1">
                                        <FaPercent /> डिस्काउंट / मुख्य ऑफर
                                    </label>
                                    <input
                                        type="text"
                                        value={discountHighlight}
                                        onChange={(e) => setDiscountHighlight(e.target.value)}
                                        placeholder="सभी सामानों पर 10% से 40% तक की भारी छूट"
                                        className="w-full px-3 py-1.5 bg-slate-800/80 border border-amber-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10.5px] font-semibold text-slate-300 mb-1">मुख्य सामान / प्रोडक्ट्स</label>
                                    <input
                                        type="text"
                                        value={itemHighlights}
                                        onChange={(e) => setItemHighlights(e.target.value)}
                                        placeholder="दाल, चावल, तेल, मसाले, किराना सामग्री"
                                        className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                            </>
                        )}

                        {categoryMode === 'shop_marketing' && shopTemplate === 'shop_counter_upi' && (
                            <div>
                                <label className="block text-[10.5px] font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                                    <FaCreditCard /> दुकान की UPI ID (Google Pay/PhonePe/Paytm)
                                </label>
                                <input
                                    type="text"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="shreeganesh@upi"
                                    className="w-full px-3 py-1.5 bg-slate-800/80 border border-emerald-500/50 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        )}

                        {categoryMode === 'shop_marketing' && shopTemplate === 'shop_home_delivery' && (
                            <div>
                                <label className="block text-[10.5px] font-semibold text-amber-300 mb-1 flex items-center gap-1">
                                    <FaMotorcycle /> फ्री डिलीवरी न्यूनतम राशि
                                </label>
                                <input
                                    type="text"
                                    value={freeDeliveryMin}
                                    onChange={(e) => setFreeDeliveryMin(e.target.value)}
                                    placeholder="₹500"
                                    className="w-full px-3 py-1.5 bg-slate-800/80 border border-amber-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>
                        )}

                        {categoryMode === 'shop_marketing' && shopTemplate === 'shop_festival_wishes' && (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10.5px] font-semibold text-slate-300 mb-1">त्योहार का नाम</label>
                                        <select
                                            value={festivalName}
                                            onChange={(e) => {
                                                setFestivalName(e.target.value);
                                                setFestivalWishes(`आप सभी सम्मानित ग्राहकों एवं क्षेत्रवासियों को ${e.target.value} की हार्दिक शुभकामनाएं!`);
                                            }}
                                            className="w-full px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                        >
                                            <option value="दीपावली">दीपावली (Diwali)</option>
                                            <option value="धनतेरस">धनतेरस (Dhanteras)</option>
                                            <option value="होली">होली (Holi)</option>
                                            <option value="नव वर्ष">नव वर्ष (New Year)</option>
                                            <option value="ईद">ईद (Eid)</option>
                                            <option value="रक्षाबंधन">रक्षाबंधन (Raksha Bandhan)</option>
                                            <option value="गणेश चतुर्थी">गणेश चतुर्थी (Ganesh Chaturthi)</option>
                                            <option value="स्वतंत्रता दिवस">स्वतंत्रता दिवस (15 August)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10.5px] font-semibold text-slate-300 mb-1">GSTIN (वैकल्पिक)</label>
                                        <input
                                            type="text"
                                            value={gstin}
                                            onChange={(e) => setGstin(e.target.value)}
                                            placeholder="08AAAAA0000A1Z5"
                                            className="w-full px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10.5px] font-semibold text-slate-300 mb-1">शुभकामना संदेश</label>
                                    <textarea
                                        rows={2}
                                        value={festivalWishes}
                                        onChange={(e) => setFestivalWishes(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={handleCopyText}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer mt-1"
                        >
                            <FaCopy /> WhatsApp प्रचार संदेश कॉपी करें
                        </button>
                    </div>
                </div>

                {/* Right: Live Interactive Canvas */}
                <div className="lg:col-span-8 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400 print:hidden flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 font-semibold">
                            <FaEye className="text-amber-400" /> लाइव पूर्वावलोकन (Live Canvas Preview):
                        </span>
                        
                        <div className="flex items-center gap-3">
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
                                ✓ दुकान प्रचार सामग्री (Shop Promotion)
                            </span>
                        </div>
                    </div>

                    {/* Canvas Wrapper */}
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
                                    width: (categoryMode === 'shop_marketing' && shopTemplate === 'shop_visiting_card') ? '650px' : '794px',
                                    minHeight: (categoryMode === 'shop_marketing' && shopTemplate === 'shop_visiting_card') ? '380px' : (categoryMode === 'shop_marketing' && shopTemplate === 'shop_counter_upi') ? '800px' : '1123px',
                                    background: currentStyles.bg,
                                    color: currentStyles.textPrimary,
                                    border: `2.5px solid ${currentStyles.border}`,
                                    borderRadius: theme === 'clean_white_print' ? '0px' : '18px',
                                    boxShadow: theme === 'clean_white_print' ? 'none' : '0 25px 60px rgba(0,0,0,0.65)',
                                    padding: (categoryMode === 'shop_marketing' && shopTemplate === 'shop_visiting_card') ? '24px 28px' : '26px 26px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    boxSizing: 'border-box',
                                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                                }}
                            >
                                {/* ==================== 1. SHOP MARKETING POSTERS ==================== */}
                                {categoryMode === 'shop_marketing' && (
                                    <>
                                        {/* TEMPLATE 1: SHOP SALE OFFER POSTER */}
                                        {shopTemplate === 'shop_sale_offer' && (
                                            <>
                                                <div>
                                                    {/* Header Banner */}
                                                    <div style={{
                                                        background: currentStyles.headerGrad,
                                                        color: '#ffffff',
                                                        borderRadius: '14px',
                                                        padding: '16px 20px',
                                                        textAlign: 'center',
                                                        marginBottom: '16px',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                                                        border: '2px solid rgba(255,255,255,0.2)'
                                                    }}>
                                                        <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#fde047', marginBottom: '3px' }}>
                                                            ⭐ विशेष सेल & डिस्काउंट धमाका ⭐
                                                        </div>
                                                        <h1 style={{ fontSize: '32px', fontWeight: 900, lineHeight: '1.15', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
                                                            {shopName}
                                                        </h1>
                                                        <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.95 }}>
                                                            {tagline}
                                                        </div>
                                                    </div>

                                                    {/* Big Discount Banner */}
                                                    <div style={{
                                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                        color: '#000000',
                                                        borderRadius: '14px',
                                                        padding: '16px 18px',
                                                        textAlign: 'center',
                                                        marginBottom: '16px',
                                                        boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)'
                                                    }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                            {offerHeading}
                                                        </div>
                                                        <div style={{ fontSize: '24px', fontWeight: 900, lineHeight: '1.2', marginTop: '4px' }}>
                                                            {discountHighlight}
                                                        </div>
                                                    </div>

                                                    {/* 4 Feature Value Pillars */}
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr',
                                                        gap: '12px',
                                                        marginBottom: '16px'
                                                    }}>
                                                        <div style={{
                                                            background: currentStyles.cardBg,
                                                            border: `1.5px solid ${currentStyles.cardBorder}`,
                                                            borderRadius: '12px',
                                                            padding: '12px 14px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px'
                                                        }}>
                                                            <span style={{ fontSize: '26px' }}>📦</span>
                                                            <div>
                                                                <div style={{ fontSize: '13px', fontWeight: 900, color: currentStyles.accent }}>
                                                                    उपलब्ध सामान:
                                                                </div>
                                                                <div style={{ fontSize: '11px', color: currentStyles.textSecondary, marginTop: '2px' }}>
                                                                    {itemHighlights}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            background: currentStyles.cardBg,
                                                            border: `1.5px solid ${currentStyles.cardBorder}`,
                                                            borderRadius: '12px',
                                                            padding: '12px 14px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px'
                                                        }}>
                                                            <span style={{ fontSize: '26px' }}>🛵</span>
                                                            <div>
                                                                <div style={{ fontSize: '13px', fontWeight: 900, color: currentStyles.highlight }}>
                                                                    फ्री होम डिलीवरी:
                                                                </div>
                                                                <div style={{ fontSize: '11px', color: currentStyles.textSecondary, marginTop: '2px' }}>
                                                                    {freeDeliveryMin} से अधिक के ऑर्डर पर तुरंत डिलीवरी
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            background: currentStyles.cardBg,
                                                            border: `1.5px solid ${currentStyles.cardBorder}`,
                                                            borderRadius: '12px',
                                                            padding: '12px 14px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px'
                                                        }}>
                                                            <span style={{ fontSize: '26px' }}>💬</span>
                                                            <div>
                                                                <div style={{ fontSize: '13px', fontWeight: 900, color: '#10b981' }}>
                                                                    WhatsApp डिजिटल बिल:
                                                                </div>
                                                                <div style={{ fontSize: '11px', color: currentStyles.textSecondary, marginTop: '2px' }}>
                                                                    हर खरीदारी पर पक्का डिजिटल बिल मोबाइल पर
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            background: currentStyles.cardBg,
                                                            border: `1.5px solid ${currentStyles.cardBorder}`,
                                                            borderRadius: '12px',
                                                            padding: '12px 14px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px'
                                                        }}>
                                                            <span style={{ fontSize: '26px' }}>💳</span>
                                                            <div>
                                                                <div style={{ fontSize: '13px', fontWeight: 900, color: currentStyles.accent }}>
                                                                    ऑनलाइन पेमेंट सुविधा:
                                                                </div>
                                                                <div style={{ fontSize: '11px', color: currentStyles.textSecondary, marginTop: '2px' }}>
                                                                    GPay, PhonePe, Paytm, Cash स्वीकार्य
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom Footer Section */}
                                                <div>
                                                    <div style={{
                                                        background: currentStyles.footerGrad,
                                                        color: currentStyles.footerText,
                                                        borderRadius: '14px',
                                                        padding: '14px 18px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '14px',
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                                    }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                                                📍 दुकान का पता & संपर्क:
                                                            </div>
                                                            <div style={{ fontSize: '15px', fontWeight: 900, marginTop: '2px' }}>
                                                                {shopAddress}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                                <div style={{ fontSize: '14px', fontWeight: 900 }}>
                                                                    📞 {phoneNumber}
                                                                </div>
                                                                {ownerName && (
                                                                    <div style={{ fontSize: '12px', fontWeight: 700 }}>
                                                                        (प्रो: {ownerName})
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* QR Code for WhatsApp Order */}
                                                        <div style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            background: currentStyles.qrBg,
                                                            padding: '6px 8px',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                        }}>
                                                            <QRCodeSVG
                                                                value={getQrValue()}
                                                                size={74}
                                                                fgColor={currentStyles.qrFg}
                                                                bgColor={currentStyles.qrBg}
                                                                level="H"
                                                            />
                                                            <span style={{ fontSize: '7.5px', fontWeight: 900, color: '#000000', marginTop: '3px', textAlign: 'center' }}>
                                                                📱 स्कैन कर ऑर्डर करें
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '0 4px', fontSize: '9px', color: currentStyles.textSecondary }}>
                                                        <span>✅ 100% शुद्धता और विश्वास का भरोसा</span>
                                                        <span>Powered by BillGST.com</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* TEMPLATE 2: SHOP COUNTER UPI PAYMENT & DIGITAL BILL STANDEE */}
                                        {shopTemplate === 'shop_counter_upi' && (
                                            <div style={{ textAlign: 'center', padding: '10px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                                                <div>
                                                    <div style={{
                                                        display: 'inline-block',
                                                        padding: '4px 18px',
                                                        borderRadius: '30px',
                                                        background: '#10b981',
                                                        color: '#ffffff',
                                                        fontSize: '13px',
                                                        fontWeight: 900,
                                                        marginBottom: '10px',
                                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                                    }}>
                                                        💳 ऑल-इन-वन UPI पेमेंट & डिजिटल बिल
                                                    </div>
                                                    <h1 style={{ fontSize: '32px', fontWeight: 900, lineHeight: '1.15', margin: '0 0 4px 0' }}>
                                                        {shopName}
                                                    </h1>
                                                    <p style={{ fontSize: '13px', color: currentStyles.textSecondary, margin: '0 0 16px 0' }}>
                                                        {tagline}
                                                    </p>

                                                    {/* Central Big UPI QR Code */}
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        background: '#ffffff',
                                                        padding: '18px 24px',
                                                        borderRadius: '20px',
                                                        boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
                                                        border: '5px solid #38bdf8',
                                                        margin: '0 auto 16px auto'
                                                    }}>
                                                        <QRCodeSVG
                                                            value={getQrValue()}
                                                            size={190}
                                                            fgColor="#000000"
                                                            bgColor="#ffffff"
                                                            level="H"
                                                        />
                                                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#000000', marginTop: '10px' }}>
                                                            📱 किसी भी UPI ऐप से स्कैन कर भुगतान करें
                                                        </div>
                                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', marginTop: '2px', fontFamily: 'monospace' }}>
                                                            UPI ID: {upiId || `${phoneNumber}@upi`}
                                                        </div>
                                                    </div>

                                                    {/* Payment Logos Pill */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '12px',
                                                        background: currentStyles.cardBg,
                                                        border: `1.5px solid ${currentStyles.cardBorder}`,
                                                        borderRadius: '12px',
                                                        padding: '10px 16px',
                                                        maxWidth: '520px',
                                                        margin: '0 auto 16px auto',
                                                        fontSize: '12px',
                                                        fontWeight: 800
                                                    }}>
                                                        <span>Google Pay</span> · <span>PhonePe</span> · <span>Paytm</span> · <span>BHIM UPI</span>
                                                    </div>

                                                    {/* WhatsApp Digital Bill Badge */}
                                                    <div style={{
                                                        background: 'rgba(16, 185, 129, 0.15)',
                                                        border: '2px dashed #10b981',
                                                        borderRadius: '12px',
                                                        padding: '10px 14px',
                                                        maxWidth: '520px',
                                                        margin: '0 auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <span style={{ fontSize: '20px' }}>💬</span>
                                                        <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#10b981' }}>
                                                            हमारे यहाँ खरीदारी पर सीधे आपके WhatsApp पर पक्का डिजिटल बिल भेजा जाता है!
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Footer Address */}
                                                <div style={{
                                                    borderTop: `2px solid ${currentStyles.cardBorder}`,
                                                    paddingTop: '12px',
                                                    marginTop: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    fontSize: '12px',
                                                    color: currentStyles.textSecondary
                                                }}>
                                                    <div>
                                                        📍 <strong>{shopAddress}</strong>
                                                    </div>
                                                    <div>
                                                        📞 <strong>{phoneNumber}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* TEMPLATE 3: SHOP HOME DELIVERY FLYER */}
                                        {shopTemplate === 'shop_home_delivery' && (
                                            <>
                                                <div>
                                                    <div style={{
                                                        background: currentStyles.headerGrad,
                                                        color: '#ffffff',
                                                        borderRadius: '14px',
                                                        padding: '16px 20px',
                                                        textAlign: 'center',
                                                        marginBottom: '16px',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
                                                    }}>
                                                        <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#fde047', marginBottom: '3px' }}>
                                                            🛵 अब दुकान पर आने की जरूरत नहीं! 🛵
                                                        </div>
                                                        <h1 style={{ fontSize: '30px', fontWeight: 900, lineHeight: '1.2', margin: '0 0 4px 0' }}>
                                                            घर बैठे सामान मंगाएं — {shopName}
                                                        </h1>
                                                        <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.95 }}>
                                                            बस सामान की लिस्ट WhatsApp करें और घर बैठे डिलीवरी पाएं!
                                                        </div>
                                                    </div>

                                                    {/* 3 Step Ordering Process */}
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr 1fr',
                                                        gap: '10px',
                                                        marginBottom: '16px'
                                                    }}>
                                                        <div style={{
                                                            background: currentStyles.cardBg,
                                                            border: `1.5px solid ${currentStyles.cardBorder}`,
                                                            borderRadius: '12px',
                                                            padding: '12px 10px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <div style={{ fontSize: '28px', marginBottom: '4px' }}>📝</div>
                                                            <div style={{ fontSize: '12px', fontWeight: 900, color: currentStyles.accent }}>
                                                                1. लिस्ट भेजें
                                                            </div>
                                                            <div style={{ fontSize: '10px', color: currentStyles.textSecondary, marginTop: '2px' }}>
                                                                कागज पर लिखकर या बोलकर WhatsApp पर भेजें
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            background: currentStyles.cardBg,
                                                            border: `1.5px solid ${currentStyles.cardBorder}`,
                                                            borderRadius: '12px',
                                                            padding: '12px 10px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <div style={{ fontSize: '28px', marginBottom: '4px' }}>🧾</div>
                                                            <div style={{ fontSize: '12px', fontWeight: 900, color: currentStyles.highlight }}>
                                                                2. बिल पाएं
                                                            </div>
                                                            <div style={{ fontSize: '10px', color: currentStyles.textSecondary, marginTop: '2px' }}>
                                                                हम तुरंत पक्का डिजिटल बिल WhatsApp करेंगे
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            background: currentStyles.cardBg,
                                                            border: `1.5px solid ${currentStyles.cardBorder}`,
                                                            borderRadius: '12px',
                                                            padding: '12px 10px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <div style={{ fontSize: '28px', marginBottom: '4px' }}>📦</div>
                                                            <div style={{ fontSize: '12px', fontWeight: 900, color: '#10b981' }}>
                                                                3. होम डिलीवरी
                                                            </div>
                                                            <div style={{ fontSize: '10px', color: currentStyles.textSecondary, marginTop: '2px' }}>
                                                                सामान आपके घर तक सुरक्षित पहुंचाया जाएगा
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Highlights Card */}
                                                    <div style={{
                                                        background: 'rgba(16, 185, 129, 0.15)',
                                                        border: '2px solid rgba(16, 185, 129, 0.4)',
                                                        borderRadius: '14px',
                                                        padding: '14px 18px',
                                                        marginBottom: '16px'
                                                    }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#10b981', marginBottom: '4px' }}>
                                                            ✨ हमारी विशेषताएं:
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: currentStyles.textPrimary }}>
                                                            <div>✓ 100% शुद्ध और ताजा सामान की गारंटी</div>
                                                            <div>✓ बाजार से उचित और सस्ते दाम</div>
                                                            <div>✓ ₹{freeDeliveryMin} से अधिक पर फ्री डिलीवरी</div>
                                                            <div>✓ कैश ऑन डिलीवरी (COD) व UPI उपलब्ध</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div>
                                                    <div style={{
                                                        background: currentStyles.footerGrad,
                                                        color: currentStyles.footerText,
                                                        borderRadius: '14px',
                                                        padding: '14px 18px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '14px'
                                                    }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>
                                                                📲 WhatsApp ऑर्डर नंबर:
                                                            </div>
                                                            <div style={{ fontSize: '20px', fontWeight: 900, color: '#000000', marginTop: '2px' }}>
                                                                {phoneNumber}
                                                            </div>
                                                            <div style={{ fontSize: '12px', marginTop: '2px', fontWeight: 700 }}>
                                                                📍 {shopAddress}
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            background: '#ffffff',
                                                            padding: '6px 8px',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                        }}>
                                                            <QRCodeSVG
                                                                value={getQrValue()}
                                                                size={74}
                                                                fgColor="#000000"
                                                                bgColor="#ffffff"
                                                                level="H"
                                                            />
                                                            <span style={{ fontSize: '7.5px', fontWeight: 900, color: '#000000', marginTop: '3px' }}>
                                                                💬 WhatsApp पर ऑर्डर भेजें
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* TEMPLATE 4: DIGITAL VISITING / BUSINESS CARD */}
                                        {shopTemplate === 'shop_visiting_card' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '24px', fontWeight: 900, lineHeight: '1.2', color: currentStyles.textPrimary }}>
                                                            {shopName}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: currentStyles.highlight, fontWeight: 700, marginTop: '2px' }}>
                                                            {tagline}
                                                        </div>
                                                        <div style={{ fontSize: '14px', fontWeight: 800, color: currentStyles.accent, marginTop: '12px' }}>
                                                            {ownerName || 'प्रोपराइटर'}
                                                        </div>
                                                    </div>

                                                    {/* QR Code */}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        background: '#ffffff',
                                                        padding: '8px',
                                                        borderRadius: '10px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                                    }}>
                                                        <QRCodeSVG
                                                            value={getQrValue()}
                                                            size={78}
                                                            fgColor="#000000"
                                                            bgColor="#ffffff"
                                                            level="H"
                                                        />
                                                        <span style={{ fontSize: '8px', fontWeight: 900, color: '#000000', marginTop: '3px' }}>
                                                            Scan Contact / Pay
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    borderTop: `1.5px solid ${currentStyles.cardBorder}`,
                                                    paddingTop: '12px',
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: '8px',
                                                    fontSize: '11.5px',
                                                    color: currentStyles.textSecondary
                                                }}>
                                                    <div>📞 <strong>{phoneNumber}</strong></div>
                                                    <div>📍 <strong>{shopAddress}</strong></div>
                                                    {upiId && <div>💳 UPI: <strong>{upiId}</strong></div>}
                                                    {gstin && <div>🧾 GSTIN: <strong>{gstin}</strong></div>}
                                                </div>
                                            </div>
                                        )}

                                        {/* TEMPLATE 5: FESTIVAL WISHES GREETING POSTER */}
                                        {shopTemplate === 'shop_festival_wishes' && (
                                            <>
                                                <div>
                                                    <div style={{
                                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                        color: '#000000',
                                                        borderRadius: '14px',
                                                        padding: '18px 20px',
                                                        textAlign: 'center',
                                                        marginBottom: '16px',
                                                        boxShadow: '0 8px 25px rgba(245, 158, 11, 0.35)'
                                                    }}>
                                                        <div style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                            ✨ पावन पर्व की हार्दिक शुभकामनाएं ✨
                                                        </div>
                                                        <h1 style={{ fontSize: '34px', fontWeight: 900, lineHeight: '1.2', margin: '4px 0' }}>
                                                            {festivalName}
                                                        </h1>
                                                        <div style={{ fontSize: '13px', fontWeight: 800 }}>
                                                            सुख, शांति और समृद्धि का मंगलमय उत्सव!
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        background: currentStyles.cardBg,
                                                        border: `2px solid ${currentStyles.cardBorder}`,
                                                        borderRadius: '14px',
                                                        padding: '18px 20px',
                                                        textAlign: 'center',
                                                        marginBottom: '16px'
                                                    }}>
                                                        <p style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.6', color: currentStyles.textPrimary, margin: 0 }}>
                                                            &ldquo;{festivalWishes}&rdquo;
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Bottom Sender Branding */}
                                                <div>
                                                    <div style={{
                                                        background: currentStyles.footerGrad,
                                                        color: currentStyles.footerText,
                                                        borderRadius: '14px',
                                                        padding: '16px 20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '14px'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontSize: '10.5px', fontWeight: 900, textTransform: 'uppercase' }}>
                                                                शुभेच्छुक:
                                                            </div>
                                                            <div style={{ fontSize: '20px', fontWeight: 900, marginTop: '2px' }}>
                                                                {shopName}
                                                            </div>
                                                            <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>
                                                                {ownerName ? `${ownerName} · ` : ''}{shopAddress}
                                                            </div>
                                                            <div style={{ fontSize: '13px', fontWeight: 900, marginTop: '2px' }}>
                                                                📞 {phoneNumber}
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            background: '#ffffff',
                                                            padding: '6px 8px',
                                                            borderRadius: '8px'
                                                        }}>
                                                            <QRCodeSVG
                                                                value={getQrValue()}
                                                                size={70}
                                                                fgColor="#000000"
                                                                bgColor="#ffffff"
                                                                level="H"
                                                            />
                                                            <span style={{ fontSize: '7.5px', fontWeight: 900, color: '#000000', marginTop: '3px' }}>
                                                                दुकान संपर्क QR
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* ==================== 2. BILLGST SOFTWARE PARTNER POSTER ==================== */}
                                {categoryMode === 'software_partner' && (
                                    <>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${currentStyles.cardBorder}`, paddingBottom: '8px', marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ height: '40px', padding: '2px 8px', borderRadius: '8px', background: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src="/billgst-logo.jpg" alt="Logo" style={{ height: '34px', objectFit: 'contain' }} onError={(e: any) => e.target.style.display = 'none'} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '22px', fontWeight: 900 }}>Bill<span style={{ color: currentStyles.accent }}>GST</span></div>
                                                        <div style={{ fontSize: '9px', fontWeight: 700, color: currentStyles.textSecondary, textTransform: 'uppercase' }}>100% FREE GST & Non-GST बिलिंग सॉफ्टवेयर</div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '4px 10px', borderRadius: '50px', background: '#10b981', color: '#ffffff', fontSize: '10.5px', fontWeight: 900 }}>
                                                    🎉 लाइफटाइम फ्री ऐप
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                                                <h2 style={{ fontSize: '22px', fontWeight: 900, lineHeight: '1.2', margin: '0 0 4px 0' }}>
                                                    एक ही ऐप में GST और Non-GST दोनों तरह के बिल बनाएं!
                                                </h2>
                                                <p style={{ fontSize: '12px', color: currentStyles.textSecondary }}>
                                                    टैक्स इनवॉइस, सादी पर्ची, एस्टीमेट, AI बोलकर बिलिंग और CA रिपोर्ट सिर्फ 10 सेकंड में
                                                </p>
                                            </div>

                                            {/* Dual Pillars */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                                <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '2px solid rgba(56, 189, 248, 0.5)', borderRadius: '12px', padding: '10px 12px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 900, color: currentStyles.accent }}>1. GST बिल (पक्का टैक्स इनवॉइस)</div>
                                                    <div style={{ fontSize: '9.5px', color: currentStyles.textPrimary, marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <div>✓ CGST, SGST, IGST ऑटो कैलकुलेशन</div>
                                                        <div>✓ B2B व B2C टैक्स इनवॉइस</div>
                                                        <div>✓ 1-क्लिक GSTR-1, GSTR-3B Excel रिपोर्ट</div>
                                                    </div>
                                                </div>

                                                <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '2px solid rgba(245, 158, 11, 0.5)', borderRadius: '12px', padding: '10px 12px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 900, color: currentStyles.highlight }}>2. Non-GST बिल (सादा पर्चा / एस्टीमेट)</div>
                                                    <div style={{ fontSize: '9.5px', color: currentStyles.textPrimary, marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <div>✓ बिना GST नंबर के तुरंत सादा बिल</div>
                                                        <div>✓ 2" व 3" थर्मल प्रिंटर पर सुपरफास्ट प्रिंट</div>
                                                        <div>✓ कोटेशन, डिलीवरी चालान व WhatsApp रसीद</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Partner Footer */}
                                        <div>
                                            <div style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#000000', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 900, fontSize: '13px' }}>
                                                <div>📞 24x7 हेल्पलाइन: {helplineNumber}</div>
                                                <div>🌐 www.billgst.com</div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `2px dashed ${currentStyles.cardBorder}`, paddingTop: '8px' }}>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 900 }}>रेफरल पार्टनर: {shopName}</div>
                                                    <div style={{ fontSize: '10.5px', color: currentStyles.textSecondary }}>📲 Google Play Store पर &apos;BillGST&apos; सर्च कर डाउनलोड करें</div>
                                                </div>
                                                <div style={{ background: '#ffffff', padding: '4px 6px', borderRadius: '6px' }}>
                                                    <QRCodeSVG value="https://www.billgst.com" size={56} fgColor="#000000" bgColor="#ffffff" level="H" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
