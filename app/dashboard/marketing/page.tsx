'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { 
    FaPrint, FaDownload, FaWhatsapp, FaShareAlt, FaPalette, FaFileAlt, 
    FaMobileAlt, FaQrcode, FaCheckCircle, FaBolt, FaMicrophone, FaStore, 
    FaShieldAlt, FaPhoneAlt, FaMapMarkerAlt, FaCopy, FaEye, FaTag, FaUndo,
    FaIdCard, FaReceipt, FaChartLine, FaBoxOpen, FaBarcode
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';

type TemplateType = 'a4_flyer' | 'a5_handbill' | 'whatsapp_square' | 'counter_standee';
type ThemeType = 'dark_royal' | 'emerald' | 'clean_print';

export default function MarketingStudioPage() {
    const { data: session } = useSession();
    const businessProfile = useStore((state: any) => state.businessProfile) || {};
    const fetchBusinessProfile = useStore((state: any) => state.fetchBusinessProfile);

    const [template, setTemplate] = useState<TemplateType>('a4_flyer');
    const [theme, setTheme] = useState<ThemeType>('dark_royal');
    const [partnerName, setPartnerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [areaCity, setAreaCity] = useState('');
    const [customOffer, setCustomOffer] = useState('100% मुफ़्त ऐप · लाइफटाइम कोई चार्ज नहीं (FREE App)');
    const [websiteUrl, setWebsiteUrl] = useState('https://billgst.vercel.app');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof fetchBusinessProfile === 'function') {
            fetchBusinessProfile();
        }
    }, [fetchBusinessProfile]);

    useEffect(() => {
        if (businessProfile) {
            const bName = businessProfile.business_name || businessProfile.name || session?.user?.name || 'BillGST Partner';
            const bPhone = businessProfile.phone || businessProfile.mobile || session?.user?.email || '';
            const bCity = businessProfile.city || businessProfile.state || 'All India';
            
            if (!partnerName) setPartnerName(bName);
            if (!phoneNumber && bPhone && !bPhone.includes('@')) setPhoneNumber(bPhone);
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
        const message = `*🇮🇳 अब हर दुकान बनेगी 100% डिजिटल & स्मार्ट!* 🚀\n\n` +
            `*BillGST* — भारत का सबसे आसान, सुरक्षित और *100% मुफ़्त (FREE)* ऑल-इन-वन बिलिंग और दुकान सॉफ्टवेयर!\n\n` +
            `⚡ *बिलिंग:* 10 सेकंड में GST / Non-GST पक्का बिल (थर्मल 2"/3", A4, A5 प्रिंट)\n` +
            `🎙️ *AI वॉयस बिलिंग:* बिना टाइप किए सिर्फ बोलकर बिल बनाएं\n` +
            `💬 *WhatsApp बॉट:* सीधे ग्राहक के WhatsApp पर ऑटोमैटिक बिल & पेमेंट रिमाइंडर\n` +
            `📒 *डिजिटल उधारी खाता:* ग्राहक और सप्लायर का 100% सेफ हिसाब\n` +
            `👥 *स्टाफ अटेंडेंस:* कर्मचारियों की हाजिरी और सैलरी मैनेजमेंट\n` +
            `📦 *स्टॉक & बारकोड:* कम स्टॉक और एक्सपायरी का ऑटो अलर्ट\n` +
            `🛒 *ऑनलाइन स्टोर:* फ्री में बनाएं अपनी डिजिटल दुकान और कैटलॉग\n` +
            `📊 *GST & CA रिपोर्ट्स:* 1-क्लिक में GSTR-1, GSTR-3B Excel डाउनलोड\n` +
            `📱 *मल्टी-डिवाइस:* मोबाइल, टैबलेट और कंप्यूटर तीनों पर एक्टिव\n\n` +
            `🎁 *खास बात:* 100% मुफ़्त (No Subscription / No Hidden Cost)\n` +
            `📲 *आज ही ऐप खोलें और शुरू करें:* ${websiteUrl}\n` +
            `📞 *अधिक जानकारी/सपोर्ट के लिए:* ${partnerName} (${phoneNumber || 'WhatsApp'})`;

        const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    const handleCopyText = () => {
        const message = `🇮🇳 अब हर दुकान बनेगी 100% डिजिटल & स्मार्ट! 🚀\n\n` +
            `BillGST — भारत का सबसे आसान, सुरक्षित और 100% मुफ़्त (FREE) ऑल-इन-वन सॉफ्टवेयर!\n\n` +
            `⚡ 10 सेकंड में GST / Non-GST पक्का बिल (थर्मल & A4 प्रिंट)\n` +
            `🎙️ AI बोलकर बिल बनाएं & बारकोड स्कैनर\n` +
            `💬 ग्राहक के WhatsApp पर ऑटो बिल & पेमेंट रिमाइंडर\n` +
            `📒 डिजिटल उधारी खाता (ग्राहक & सप्लायर दोनों का हिसाब)\n` +
            `👥 स्टाफ अटेंडेंस (हाजिरी) और सैलरी मैनेजमेंट\n` +
            `📦 इन्वेंटरी, स्टॉक और एक्सपायरी अलर्ट्स\n` +
            `🛒 फ्री ऑनलाइन दुकान & डिजिटल कैटलॉग\n` +
            `📊 CA के लिए GSTR-1, GSTR-3B 1-क्लिक रिपोर्ट\n` +
            `📱 मोबाइल और कंप्यूटर दोनों पर चलता है\n\n` +
            `🎁 100% मुफ़्त (FREE Forever) · कोई छुपा हुआ चार्ज नहीं!\n` +
            `📲 लिंक: ${websiteUrl}\n` +
            `📞 संपर्क: ${partnerName} ${phoneNumber}`;

        navigator.clipboard.writeText(message);
        toast.success('📋 मार्केटिंग मैसेज कॉपी हो गया!');
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
                goldBadge: '#f59e0b'
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
                goldBadge: '#fbbf24'
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
            goldBadge: '#f59e0b'
        };
    };

    const currentStyles = getThemeStyles();

    // All Features Matrix
    const allFeatures = [
        { icon: '⚡', title: '10 सेकंड में GST / Non-GST बिल', desc: 'A4, A5, और 2"/3" थर्मल रसीद प्रिंट। कोटेशन, चालान और ई-वे बिल।' },
        { icon: '🎙️', title: 'AI बोलकर बिलिंग (Voice Billing)', desc: 'बिना टाइप किए बोलें "2 तेल, 1 साबुन" और बिल तुरंत तैयार।' },
        { icon: '💬', title: 'WhatsApp ऑटोमैटिक बिल & रिमाइंडर', desc: 'सीधे ग्राहक के WhatsApp पर डिजिटल बिल और बकाया पेमेंट का मैसेज।' },
        { icon: '📒', title: 'डिजिटल उधारी & हिसाब खाता', desc: 'ग्राहक और सप्लायर का 100% सुरक्षित खाता। पुराना बहीखाता भूल जाएं।' },
        { icon: '👥', title: 'स्टाफ अटेंडेंस & सैलरी मैनेजर', desc: 'दुकान कर्मचारियों की हाजिरी (अटेंडेंस), एडवांस और वेतन का हिसाब।' },
        { icon: '📦', title: 'इन्वेंटरी, स्टॉक & बारकोड', desc: 'बारकोड स्कैनर से बिक्री। दुकान का माल खत्म होने पर ऑटोमैटिक अलर्ट।' },
        { icon: '🛒', title: 'फ्री ऑनलाइन स्टोर & कैटलॉग', desc: 'अपनी दुकान का लिंक व्हाट्सएप पर शेयर करें, ऑनलाइन ऑर्डर पाएं।' },
        { icon: '📊', title: '1-Click GSTR-1, GSTR-3B रिपोर्ट', desc: 'CA को हिसाब देना आसान। चुटकियों में Excel और JSON डाउनलोड करें।' },
        { icon: '📱', title: 'मोबाइल + कंप्यूटर (Multi-Device)', desc: 'दुकान में कंप्यूटर से और बाहर मोबाइल से — सारा डेटा हमेशा सिंक।' },
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
                        margin: 6mm;
                    }
                }
            `}</style>

            {/* Header section (Hidden during print) */}
            <div className="max-w-7xl mx-auto mb-8 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl backdrop-blur-md shadow-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-amber-500/20">
                                📢
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                    दुकान मार्केटिंग और प्रचार सामग्री <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">100% FREE App</span>
                                </h1>
                                <p className="text-xs md:text-sm text-slate-400">
                                    दुकानों पर बांटने के लिए सभी फीचर्स के साथ A4 पर्चे (Flyers), हाफ-पेज और WhatsApp पोस्टर तुरंत प्रिंट और डाउनलोड करें।
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
                                { id: 'a4_flyer', label: 'A4 मास्टर पर्चा', desc: 'सभी फीचर्स के साथ बड़ा पर्चा', icon: '📄' },
                                { id: 'a5_handbill', label: '2-in-1 हाफ पेज', desc: 'सस्ती प्रिंटिंग (2 प्रति शीट)', icon: '📑' },
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
                                <FaTag className="text-emerald-400" /> 3. अपनी जानकारी भरें
                            </span>
                        </h2>

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
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">मोबाइल / WhatsApp नंबर</label>
                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+91 98765 43210"
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

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">QR कोड लिंक (वेबसाइट/ऐप)</label>
                            <input
                                type="text"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                placeholder="https://billgst.vercel.app"
                                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleCopyText}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                        >
                            <FaCopy /> व्हाट्सएप टेक्स्ट कॉपी करें
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
                            ✓ सभी 9+ फीचर्स शामिल हैं · 100% मुफ़्त
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
                                padding: template === 'whatsapp_square' ? '24px' : '30px 28px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                boxSizing: 'border-box',
                                fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                            }}
                        >
                            {/* TOP HEADER / BRANDING */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${currentStyles.cardBorder}`, paddingBottom: '14px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ffffff',
                                            fontSize: '24px',
                                            fontWeight: 900,
                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                                        }}>
                                            B
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: '1.1' }}>
                                                Bill<span style={{ color: currentStyles.accent }}>GST</span>
                                            </div>
                                            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: currentStyles.textSecondary }}>
                                                ऑल-इन-वन स्मार्ट बिलिंग & दुकान सॉफ्टवेयर
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '6px 14px',
                                        borderRadius: '50px',
                                        background: '#10b981',
                                        color: '#ffffff',
                                        fontSize: '12px',
                                        fontWeight: 900,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                    }}>
                                        🎉 100% मुफ़्त ऐप (FREE Forever)
                                    </div>
                                </div>

                                {/* HERO HEADLINE */}
                                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 14px',
                                        borderRadius: '20px',
                                        background: currentStyles.cardBg,
                                        border: `1px solid ${currentStyles.cardBorder}`,
                                        color: currentStyles.highlight,
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        marginBottom: '8px'
                                    }}>
                                        🇮🇳 भारत का सबसे आसान & भरोसेमंद दुकान सॉफ्टवेयर
                                    </div>
                                    <h2 style={{
                                        fontSize: template === 'whatsapp_square' ? '22px' : '28px',
                                        fontWeight: 900,
                                        lineHeight: '1.25',
                                        marginBottom: '6px',
                                        letterSpacing: '-0.5px'
                                    }}>
                                        कागजी बही-खाते और पुरानी बिल बुक को कहें अलविदा!
                                    </h2>
                                    <p style={{
                                        fontSize: '13.5px',
                                        color: currentStyles.textSecondary,
                                        maxWidth: '650px',
                                        margin: '0 auto',
                                        lineHeight: '1.4'
                                    }}>
                                        बिलिंग, उधारी, स्टॉक, WhatsApp हिसाब, स्टाफ अटेंडेंस और ऑनलाइन दुकान — सब कुछ अपने मोबाइल या कंप्यूटर पर संभालें!
                                    </p>
                                </div>

                                {/* ALL 9 FEATURE PILLARS GRID */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: template === 'whatsapp_square' ? '1fr 1fr' : '1fr 1fr 1fr',
                                    gap: '10px',
                                    marginBottom: '18px'
                                }}>
                                    {allFeatures.map((f, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                background: currentStyles.cardBg,
                                                border: `1.5px solid ${currentStyles.cardBorder}`,
                                                borderRadius: '12px',
                                                padding: '10px 12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '18px' }}>{f.icon}</span>
                                                <span style={{ fontSize: '12.5px', fontWeight: 800, color: currentStyles.textPrimary, lineHeight: '1.2' }}>
                                                    {f.title}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '10.5px', color: currentStyles.textSecondary, lineHeight: '1.3' }}>
                                                {f.desc}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 100% FREE NO SUBSCRIPTION BANNER */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: '#ffffff',
                                    borderRadius: '14px',
                                    padding: '12px 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '14px',
                                    marginBottom: '16px',
                                    boxShadow: '0 6px 18px rgba(16, 185, 129, 0.25)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '30px' }}>🎁</span>
                                        <div>
                                            <div style={{ fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {customOffer}
                                            </div>
                                            <div style={{ fontSize: '11px', fontWeight: 700, opacity: 0.95 }}>
                                                कोई सब्सक्रिप्शन फीस नहीं · कोई मंथली रेंट नहीं · मोबाइल और PC दोनों पर एक्टिव!
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: '#ffffff',
                                        color: '#065f46',
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 900,
                                        whiteSpace: 'nowrap'
                                    }}>
                                        100% FREE APP
                                    </div>
                                </div>

                                {/* WHO CAN USE THIS? (BUSINESS TAGS) */}
                                {template !== 'whatsapp_square' && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: currentStyles.textSecondary, marginBottom: '6px', textAlign: 'center' }}>
                                            सभी दुकानों और व्यापारियों के लिए उपयोगी:
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' }}>
                                            {[
                                                '🏪 किराना & जनरल स्टोर', '👗 कपड़े व गारमेंट्स', '💊 मेडिकल & फार्मेसी',
                                                '📱 मोबाइल & इलेक्ट्रॉनिक्स', '🚗 ऑटो पार्ट्स & वर्कशॉप', '🍽️ रेस्टोरेंट & होटल',
                                                '🔩 हार्डवेयर & बिल्डिंग मटेरियल', '📦 होलसेल & डिस्ट्रीब्यूटर', '🌾 अनाज, खाद & बीज'
                                            ].map((shop, idx) => (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        fontSize: '10px',
                                                        fontWeight: 700,
                                                        padding: '3px 8px',
                                                        borderRadius: '16px',
                                                        background: currentStyles.cardBg,
                                                        border: `1px solid ${currentStyles.cardBorder}`,
                                                        color: currentStyles.textPrimary
                                                    }}
                                                >
                                                    {shop}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* BOTTOM FOOTER WITH QR CODE AND CONTACT DETAILS */}
                            <div style={{
                                borderTop: `2px dashed ${currentStyles.cardBorder}`,
                                paddingTop: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '16px'
                            }}>
                                {/* Contact Info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: currentStyles.highlight, textTransform: 'uppercase', marginBottom: '2px' }}>
                                        फ्री सेटअप व अधिक जानकारी के लिए संपर्क करें:
                                    </div>
                                    <div style={{ fontSize: '17px', fontWeight: 900, color: currentStyles.textPrimary, lineHeight: '1.2' }}>
                                        {partnerName || 'BillGST Partner'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                                        {phoneNumber && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: currentStyles.accent }}>
                                                <span>📞 / 💬</span> {phoneNumber}
                                            </div>
                                        )}
                                        {areaCity && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: currentStyles.textSecondary }}>
                                                <span>📍</span> {areaCity}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '11px', color: currentStyles.textSecondary, marginTop: '3px' }}>
                                        🌐 वेबसाइट: <span style={{ fontWeight: 700, color: currentStyles.textPrimary }}>{websiteUrl}</span>
                                    </div>
                                </div>

                                {/* QR Code Box */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    background: currentStyles.qrBg,
                                    padding: '8px 10px',
                                    borderRadius: '10px',
                                    border: `1.5px solid ${currentStyles.cardBorder}`,
                                    boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
                                }}>
                                    <QRCodeSVG
                                        value={websiteUrl}
                                        size={85}
                                        fgColor={currentStyles.qrFg}
                                        bgColor={currentStyles.qrBg}
                                        level="H"
                                    />
                                    <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#000000', marginTop: '5px', textAlign: 'center', lineHeight: '1.1' }}>
                                        📱 कैमरा / Google Pay<br />से स्कैन करें
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
