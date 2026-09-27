// Updated Landing Page - Force Rebuild
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import './landing.css';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    nl1: "Features", nl2: "GST Returns", nl3: "Reviews", nl4: "FAQ", nav_login: "Log In", nav_register: "Register Free",
    badge: "For shops and homes both", h1: 'Free Billing, Expense Tracking<br>& <span class="hl">Online Shop</span> App',
    sub: "Track daily home expenses, manage stock, build an online shop and mark attendance — start free, grow with smart AI features.",
    protag: "Smart Feature", cta_main: "Register Free →", cta_sec: "See Features", i1: "GST Billing", i2: "Voice AI",
    i3: "WhatsApp PDF", i4: "Camera → Stock", i5: "Low Stock Alert", i6: "Expiry Alert", i7: "Attendance", i8: "Expenses",
    i9: "Online Shop", e1: "Key Features", ft1: "Everything your shop needs", ft1s: "Every feature is built to save your time.",
    m1h: "Send PDF Bills on WhatsApp", m1p: "Create any bill and send it straight to the customer's WhatsApp — no download or email, one tap.",
    m1t: "Instant delivery", m2h: "Snap a Photo → AI Updates Stock", m2p: "Take a photo of any product or barcode. Our AI reads it and updates stock automatically.",
    m2t: "AI powered · New", m3h: "GST Returns — GSTR-1, 3B & 4", m3p: "Your billing data auto-converts into GST return format. Download reports ready for the portal.",
    m3t: "CA-ready reports", e2: "More than billing", ft2: "Run your whole shop from here", ft2s: "From stock to staff to daily expenses — all handled for free.",
    s1h: "Free Online Shop", s1p: "Turn your stock into a catalog in one click. Share the link on WhatsApp and get orders.",
    s2h: "Smart Inventory", s2p: "Auto stock update on every sale, low-stock alerts and expiry tracking.",
    s3h: "Daily Expense Tracker", s3p: "For shop and home both! Track rent, groceries, electricity and manage your budget.",
    s4h: "Staff Attendance & Salary", s4p: "Mark daily attendance, track advances, salary is calculated automatically.",
    e3: "All Features", ft3: "One app, full control", a1: "All Types of Bills", a1p: "Tax invoice, proforma, credit note, delivery challan.",
    a2: "Low Stock Alerts", a2p: "Get notified the moment stock runs low.", a3: "Expiry Alerts", a3p: "Track expiry dates, get alerted before spoilage.",
    a4: "Staff Attendance", a4p: "Daily attendance, monthly reports, auto salary.", a5: "Track Expenses", a5p: "Rent, electricity, purchases — all in one place.",
    a6: "Online Shop", a6p: "Build a store in seconds, share it, get orders.", a7: "Customer Ledger", a7p: "Track credit and send reminders on WhatsApp.",
    a8: "Voice Billing AI", a8p: "Speak the items — bill's ready, Hindi or English.", e4: "GST Filing", g_title: "GST returns, made easy",
    g_sub: "All key GST returns are built from your data. Download and upload straight to the portal.", g1: "Outward supply return",
    g2: "Monthly summary return", g3: "Composition scheme return", ca1: "CA Ready", ca2: "Share the report directly with your CA",
    e5: "How it works", hw_title: "Get started in 3 easy steps", st1h: "Register for Free", st1p: "Sign up in under a minute. No documents, no credit card.",
    st2h: "Add Your Stock", st2p: "Type it in or use the camera — AI scans and adds it automatically.", st3h: "Bill, Share & Grow",
    st3p: "Bill by voice or tap, send on WhatsApp, track everything from the dashboard.", e6: "What shopkeepers say", r_title: "Trusted across India",
    r1: '"GST billing used to take hours. Now the return report is ready in 5 minutes."', r1l: "Kirana Store, Patna",
    r2: '"The WhatsApp PDF feature is excellent. My shop looks more professional now."', r2l: "Beauty Parlour, Indore",
    r3: '"Camera stock update is magic. Saves me 30 minutes every day."', r3l: "Medical Store, Jaipur", wb: "Welcome back 👋",
    wbs: "Log in to your BillGST account", le: "Email Address", lp: "Password", bl: "Log In", rh: "Set up in 60 seconds 🏪",
    rhs: "No credit card required", ln: "Full Name", br: "Send OTP", e7: "FAQ", q_title: "Frequently asked questions",
    q1: "Is BillGST really free?", a1f: "Core billing, stock and attendance features are always free. Some advanced AI features (like Voice Billing, Photo Stock Update) may become limited/premium going forward.",
    q2: "Which GST returns can I file?", a2f: "GSTR-1, GSTR-3B and GSTR-4 — download and upload to the portal or send to your CA.",
    q3: "How does camera stock update work?", a3f: "Take a photo of the item or barcode, AI recognizes it and updates stock.",
    q4: "Can I send bills on WhatsApp?", a4f: "Yes, every bill can be sent as a PDF straight to the customer's WhatsApp in one tap.",
    q5: "What kind of bills can I create?", a5f: "Tax invoice, proforma invoice, credit note, delivery challan — all available.",
    q6: "How safe is my data?", a6f: "All data is encrypted with AES-256 — the same used by banks. Only you can see your data.",
    cf1: "Digitize your shop today", cf2: "Free account, ready in 60 seconds. No credit card needed.", trust: "🔒 No credit card · Set up in 60 seconds · Trusted by 1000+ shopkeepers",
    otpsent: "OTP has been sent to your email ✅", lotp: "Enter OTP", bv: "Verify & Create Account", resend: "Resend OTP",
    regdone: "Account created!", regdones: "You can now log in", fdesc: "Smart billing and inventory software built for Indian shopkeepers. Available in Hindi and English.",
    fp: "Product", fc: "Company", fvai: "Voice Billing AI", fabout: "About Us", fcontact: "Contact", fpriv: "Privacy Policy", fmade: "Made in 🇮🇳 India"
  },
  mr: {
    nl1: "फीचर्स", nl2: "जीएसटी रिटर्न", nl3: "रिव्यू", nl4: "FAQ", nav_login: "लॉगिन", nav_register: "मोफत नोंदणी करा",
    badge: "दुकान आणि घर दोन्हीसाठी", h1: 'मोफत बिलिंग, खर्चाचा हिशोब<br>आणि <span class="hl">ऑनलाइन दुकान</span> अॅप',
    sub: "घराचा रोजचा खर्च लिहा, स्टॉक मॅनेज करा, ऑनलाइन दुकान बनवा, हजेरी लावा आणि व्हॉइसने बिल बनवा — सर्व मोफत.",
    cta_main: "मोफत नोंदणी करा →", cta_sec: "फीचर्स पहा", trust: "🔒 क्रेडिट कार्ड नाही · 60 सेकंदात सेटअप · 1000+ दुकानदारांचा विश्वास",
    protag: "स्मार्ट फीचर", i1: "जीएसटी बिलिंग", i2: "व्हॉइस एआय", i3: "WhatsApp पीडीएफ", i4: "कॅमेरा → स्टॉक",
    i5: "लो स्टॉक अलर्ट", i6: "एक्सपायरी अलर्ट", i7: "हजेरी", i8: "खर्च", i9: "ऑनलाइन दुकान", e1: "मुख्य फीचर्स",
    ft1: "तुमच्या दुकानाची प्रत्येक गरज", ft1s: "प्रत्येक फीचर तुमचा वेळ वाचवते.", m1h: "WhatsApp वर पीडीएफ बिल पाठवा",
    m1p: "कोणतेही बिल बनवा आणि थेट ग्राहकाच्या WhatsApp वर पाठवा — डाउनलोड किंवा ईमेलशिवाय.", m1t: "तात्काळ डिलिव्हरी",
    m2h: "फोटो घ्या → AI स्टॉक अपडेट करेल", m2p: "कोणत्याही प्रोडक्ट किंवा बारकोडचा फोटो घ्या. AI ते वाचून स्टॉक अपडेट करेल.",
    m2t: "AI पावर्ड · नवीन", m3h: "जीएसटी रिटर्न — GSTR-1, 3B आणि 4", m3p: "तुमचा बिलिंग डेटा आपोआप जीएसटी रिटर्न फॉरमॅटमध्ये तयार होतो.",
    m3t: "CA-रेडी रिपोर्ट्स", e2: "फक्त बिलिंग नाही", ft2: "संपूर्ण दुकान इथूनच मॅनेज करा", ft2s: "स्टॉकपासून स्टाफ आणि रोजच्या खर्चापर्यंत — सर्व मोफत.",
    s1h: "मोफत ऑनलाइन दुकान", s1p: "स्टॉकचे 1 क्लिकमध्ये कॅटलॉग बनवा. लिंक शेअर करा, ऑर्डर मिळवा.", s2h: "स्मार्ट इन्व्हेंटरी",
    s2p: "प्रत्येक विक्रीवर स्टॉक अपडेट, लो-स्टॉक अलर्ट आणि एक्सपायरी ट्रॅकिंग.", s3h: "रोजचा खर्च ट्रॅकर",
    s3p: "दुकान आणि घर दोन्हीसाठी! भाडे, किराणा, वीज — सर्व ट्रॅक करा.", s4h: "स्टाफ हजेरी आणि पगार",
    s4p: "रोजची हजेरी लावा, अॅडव्हान्स ट्रॅक करा, पगार आपोआप निघेल.", e3: "सर्व फीचर्स", ft3: "एक अॅप, पूर्ण कंट्रोल",
    a1: "सर्व प्रकारची बिले", a1p: "टॅक्स इनव्हॉइस, प्रोफॉर्मा, क्रेडिट नोट, डिलिव्हरी चालान.", a2: "लो स्टॉक अलर्ट",
    a2p: "सामान कमी होताच अलर्ट मिळेल.", a3: "एक्सपायरी अलर्ट", a3p: "एक्सपायरी ट्रॅक करा, खराब होण्यापूर्वी अलर्ट मिळवा.",
    a4: "स्टाफ हजेरी", a4p: "रोजची हजेरी, मासिक रिपोर्ट, पगार कॅल्क्युलेशन.", a5: "खर्च ट्रॅक करा",
    a5p: "भाडे, वीज, खरेदी — एकाच ठिकाणी नोंदवा.", a6: "ऑनलाइन दुकान", a6p: "सेकंदात स्टोअर बनवा, शेअर करा, ऑर्डर घ्या.",
    a7: "ग्राहक हिशोब", a7p: "उधारीचा हिशोब ठेवा, रिमाइंडर पाठवा.", a8: "व्हॉइस बिलिंग एआय",
    a8p: "सामान बोला — बिल तयार. हिंदी आणि इंग्रजी दोन्हीत.", e4: "जीएसटी फायलिंग", g_title: "जीएसटी रिटर्न, आता सोपे",
    g_sub: "तुमच्या डेटावरून सर्व मुख्य जीएसटी रिटर्न तयार होतात.", g1: "आउटवर्ड सप्लाय रिटर्न", g2: "मासिक समरी रिटर्न",
    g3: "कंपोझिशन स्कीम रिटर्न", ca1: "CA Ready", ca2: "थेट तुमच्या CA सोबत रिपोर्ट शेअर करा", e5: "हे कसे काम करते",
    hw_title: "3 सोप्या स्टेप्समध्ये सुरू करा", st1h: "मोफत नोंदणी करा", st1p: "एका मिनिटापेक्षा कमी वेळात साइन अप करा.",
    st2h: "तुमचा माल जोडा", st2p: "टाइप करा किंवा कॅमेरा वापरा — AI स्कॅन करून जोडेल.", st3h: "बिल बनवा, शेअर करा",
    st3p: "बोलून किंवा टॅप करून बिल बनवा, WhatsApp वर पाठवा.", e6: "दुकानदार काय म्हणतात", r_title: "संपूर्ण भारताचा विश्वास",
    r1: '"जीएसटी बिलिंगला तास लागायचे. आता 5 मिनिटांत रिपोर्ट तयार."', r1l: "Kirana Store, Patna",
    r2: '"WhatsApp पीडीएफ फीचर खूप छान आहे."', r2l: "Beauty Parlour, Indore", r3: '"कॅमेरा स्टॉक अपडेट जादू आहे."',
    r3l: "Medical Store, Jaipur", wb: "पुन्हा स्वागत आहे 👋", wbs: "तुमच्या BillGST अकाउंटमध्ये लॉगिन करा",
    le: "ईमेल", lp: "पासवर्ड", bl: "लॉगिन करा", rh: "60 सेकंदात सेटअप करा 🏪", rhs: "क्रेडिट कार्ड लागत नाही",
    ln: "पूर्ण नाव", br: "OTP पाठवा", otpsent: "तुमच्या ईमेलवर OTP पाठवला आहे ✅", lotp: "OTP टाका",
    bv: "वेरिफाय करा आणि अकाउंट बनवा", resend: "OTP पुन्हा पाठवा", regdone: "अकाउंट तयार झाले!",
    regdones: "आता तुम्ही लॉगिन करू शकता", e7: "FAQ", q_title: "सामान्य प्रश्न", q1: "BillGST खरंच मोफत आहे का?",
    a1f: "मुख्य फीचर्स मोफत आहेत. कोणतेही छुपे चार्ज नाहीत.", q2: "मी कोणते जीएसटी रिटर्न बनवू शकतो?",
    a2f: "GSTR-1, GSTR-3B आणि GSTR-4 — डाउनलोड करून पोर्टलवर अपलोड करा.", q3: "कॅमेरा स्टॉक अपडेट कसे काम करते?",
    a3f: "सामान किंवा बारकोडचा फोटो घ्या, AI स्टॉक अपडेट करेल.", q4: "मी WhatsApp वर बिल पाठवू शकतो का?",
    a4f: "होय, प्रत्येक बिल पीडीएफ म्हणून WhatsApp वर पाठवता येते.", q5: "मी कोणत्या प्रकारची बिले बनवू शकतो?",
    a5f: "टॅक्स इनव्हॉइस, प्रोफॉर्मा, क्रेडिट नोट, डिलिव्हरी चालान — सर्व उपलब्ध.", q6: "माझा डेटा किती सुरक्षित आहे?",
    a6f: "सर्व डेटा AES-256 ने एन्क्रिप्टेड आहे.", cf1: "आजच तुमचे दुकान डिजिटल करा", cf2: "मोफत अकाउंट, 60 सेकंदात तयार.",
    fdesc: "भारतीय दुकानदारांसाठी बनवलेले स्मार्ट बिलिंग सॉफ्टवेअर.", fp: "प्रोडक्ट", fc: "कंपनी", fvai: "व्हॉइस बिलिंग एआय",
    fabout: "आमच्याबद्दल", fcontact: "संपर्क करा", fpriv: "प्रायव्हसी पॉलिसी", fmade: "Made in 🇮🇳 India"
  },
  gu: {
    nl1: "ફીચર્સ", nl2: "જીએસટી રિટર્ન", nl3: "રિવ્યુ", nl4: "FAQ", nav_login: "લોગિન", nav_register: "મફત રજિસ્ટર કરો",
    badge: "દુકાન અને ઘર બંને માટે", h1: 'મફત બિલિંગ, ખર્ચનો હિસાબ<br>અને <span class="hl">ઓનલાઈન દુકાન</span> એપ',
    sub: "ઘરનો રોજનો ખર્ચ લખો, સ્ટોક મેનેજ કરો, ઓનલાઈન દુકાન બનાવો, હાજરી નોંધો અને વોઈસથી બિલ બનાવો — બધું મફત.",
    cta_main: "મફત રજિસ્ટર કરો →", cta_sec: "ફીચર્સ જુઓ", trust: "🔒 ક્રેડિટ કાર્ડ નથી · 60 સેકન્ડમાં સેટઅપ · 1000+ દુકાનદારોનો ભરોસો",
    protag: "સ્માર્ટ ફીચર", i1: "જીએસટી બિલિંગ", i2: "વોઈસ એઆઈ", i3: "WhatsApp પીડીએફ", i4: "કેમેરા → સ્ટોક",
    i5: "લો સ્ટોક અલર્ટ", i6: "એક્સપાયરી અલર્ટ", i7: "હાજરી", i8: "ખર્ચ", i9: "ઓનલાઈન દુકાન", e1: "મુખ્ય ફીચર્સ",
    ft1: "તમારી દુકાનની દરેક જરૂરિયાત", ft1s: "દરેક ફીચર તમારો સમય બચાવે છે.", m1h: "WhatsApp પર પીડીએફ બિલ મોકલો",
    m1p: "કોઈપણ બિલ બનાવો અને સીધું ગ્રાહકના WhatsApp પર મોકલો.", m1t: "તાત્કાલિક ડિલિવરી",
    m2h: "ફોટો લો → AI સ્ટોક અપડેટ કરશે", m2p: "કોઈપણ પ્રોડક્ટ કે બારકોડનો ફોટો લો. AI તેને વાંચી સ્ટોક અપડેટ કરશે.",
    m2t: "AI પાવર્ડ · નવું", m3h: "જીએસટી રિટર્ન — GSTR-1, 3B અને 4", m3p: "તમારો બિલિંગ ડેટા આપોઆપ જીએસટી રિટર્ન ફોર્મેટમાં તૈયાર થાય.",
    m3t: "CA-રેડી રિપોર્ટ્સ", e2: "માત્ર બિલિંગ નહીં", ft2: "સંપૂર્ણ દુકાન અહીંથી મેનેજ કરો", ft2s: "સ્ટોકથી સ્ટાફ અને રોજના ખર્ચ સુધી — બધું મફત.",
    s1h: "મફત ઓનલાઈન દુકાન", s1p: "સ્ટોકનું 1 ક્લિકમાં કેટલોગ બનાવો. લિંક શેર કરો, ઓર્ડર મેળવો.", s2h: "સ્માર્ટ ઈન્વેન્ટરી",
    s2p: "દરેક વેચાણ પર સ્ટોક અપડેટ, લો-સ્ટોક અલર્ટ અને એક્સપાયરી ટ્રેકિંગ.", s3h: "રોજનો ખર્ચ ટ્રેકર",
    s3p: "દુકાન અને ઘર બંને માટે! ભાડું, કરિયાણું, વીજળી — બધું ટ્રેક કરો.", s4h: "સ્ટાફ હાજરી અને પગાર",
    s4p: "રોજની હાજરી નોંધો, એડવાન્સ ટ્રેક કરો, પગાર આપોઆપ.", e3: "બધા ફીચર્સ", ft3: "એક એપ, પૂરો કંટ્રોલ",
    a1: "બધા પ્રકારના બિલ", a1p: "ટેક્સ ઈન્વોઈસ, પ્રોફોર્મા, ક્રેડિટ નોટ, ડિલિવરી ચલણ.", a2: "લો સ્ટોક અલર્ટ",
    a2p: "સામાન ઓછો થતાં જ અલર્ટ મળશે.", a3: "એક્સપાયરી અલર્ટ", a3p: "એક્સપાયરી ટ્રેક કરો, બગડતા પહેલાં અલર્ટ.",
    a4: "સ્ટાફ હાજરી", a4p: "રોજની હાજરી, માસિક રિપોર્ટ, પગાર કેલ્ક્યુલેશન.", a5: "ખર્ચ ટ્રેક કરો",
    a5p: "ભાડું, વીજળી, ખરીદી — બધું એક જગ્યાએ.", a6: "ઓનલાઈન દુકાન", a6p: "સેકન્ડમાં સ્ટોર બનાવો, શેર કરો, ઓર્ડર મેળવો.",
    a7: "ગ્રાહક હિસાબ", a7p: "ઉધારીનો હિસાબ રાખો, રિમાઇન્ડર મોકલો.", a8: "વોઈસ બિલિંગ એઆઈ",
    a8p: "સામાન બોલો — બિલ તૈયાર. હિન્દી અને અંગ્રેજીમાં.", e4: "જીએસટી ફાઈલિંગ", g_title: "જીએસટી રિટર્ન, હવે સરળ",
    g_sub: "તમારા ડેટા પરથી બધા મુખ્ય જીએસટી રિટર્ન તૈયાર થાય છે.", g1: "આઉટવર્ડ સપ્લાય રિટર્ન", g2: "માસિક સમરી રિટર્ન",
    g3: "કમ્પોઝિશન સ્કીમ રિટર્ન", ca1: "CA Ready", ca2: "સીધા તમારા CA સાથે રિપોર્ટ શેર કરો", e5: "આ કેવી રીતે કામ કરે છે",
    hw_title: "3 સરળ સ્ટેપ્સમાં શરૂ કરો", st1h: "મફત રજિસ્ટર કરો", st1p: "એક મિનિટથી ઓછા સમયમાં સાઇન અપ કરો.",
    st2h: "તમારો સામાન ઉમેરો", st2p: "ટાઇપ કરો અથવા કેમેરાનો ઉપયોગ કરો — AI સ્કેન કરીને ઉમેરશે.", st3h: "બિલ બનાવો, શેર કરો",
    st3p: "બોલીને અથવા ટેપ કરીને બિલ બનાવો, WhatsApp પર મોકલો.", e6: "દુકાનદારો શું કહે છે", r_title: "સમગ્ર ભારતનો ભરોસો",
    r1: '"જીએસટી બિલિંગમાં કલાકો લાગતા હતા. હવે 5 મિનિટમાં રિપોર્ટ તૈયાર."', r1l: "Kirana Store, Patna",
    r2: '"WhatsApp પીડીએફ ફીચર ખૂબ સરસ છે."', r2l: "Beauty Parlour, Indore", r3: '"કેમેરા સ્ટોક અપડેટ જાદુ છે."',
    r3l: "Medical Store, Jaipur", wb: "ફરી સ્વાગત છે 👋", wbs: "તમારા BillGST એકાઉન્ટમાં લોગિન કરો", le: "ઈમેલ",
    lp: "પાસવર્ડ", bl: "લોગિન કરો", rh: "60 સેકન્ડમાં સેટઅપ કરો 🏪", rhs: "ક્રેડિટ કાર્ડની જરૂર નથી", ln: "પૂરું નામ",
    br: "OTP મોકલો", otpsent: "તમારા ઈમેલ પર OTP મોકલવામાં આવ્યો છે ✅", lotp: "OTP દાખલ કરો",
    bv: "વેરિફાય કરો અને એકાઉન્ટ બનાવો", resend: "OTP ફરી મોકલો", regdone: "એકાઉન્ટ બની ગયું!",
    regdones: "હવે તમે લોગિન કરી શકો છો", e7: "FAQ", q_title: "સામાન્ય પ્રશ્નો", q1: "શું BillGST ખરેખર મફત છે?",
    a1f: "મુખ્ય ફીચર્સ મફત છે. કોઈ છુપા ચાર્જ નથી.", q2: "હું કયા જીએસટી રિટર્ન બનાવી શકું?",
    a2f: "GSTR-1, GSTR-3B અને GSTR-4 — ડાઉનલોડ કરીને પોર્ટલ પર અપલોડ કરો.", q3: "કેમેરા સ્ટોક અપડેટ કેવી રીતે કામ કરે છે?",
    a3f: "સામાન કે બારકોડનો ફોટો લો, AI તેને ઓળખી સ્ટોક અપડેટ કરશે.", q4: "શું હું WhatsApp પર બિલ મોકલી શકું?",
    a4f: "હા, દરેક બિલ પીડીએફ તરીકે WhatsApp પર મોકલી શકાય છે.", q5: "હું કયા પ્રકારના બિલ બનાવી શકું?",
    a5f: "ટેક્સ ઈન્વોઈસ, પ્રોફોર્મા, ક્રેડિટ નોટ, ડિલિવરી ચલણ.", q6: "મારો ડેટા કેટલો સુરક્ષિત છે?",
    a6f: "બધો ડેટા AES-256 થી એન્ક્રિપ્ટ થયેલો છે.", cf1: "આજે જ તમારી દુકાનને ડિજિટલ બનાવો",
    cf2: "મફત એકાઉન્ટ, 60 સેકન્ડમાં તૈયાર.", fdesc: "ભારતીય દુકાનદારો માટે બનાવેલ સ્માર્ટ બિલિંગ સોફ્ટવેર.",
    fp: "પ્રોડક્ટ", fc: "કંપની", fvai: "વોઈસ બિલિંગ એઆઈ", fabout: "અમારા વિશે", fcontact: "સંપર્ક કરો",
    fpriv: "પ્રાઇવસી પોલિસી", fmade: "Made in 🇮🇳 India"
  }
};

export default function LandingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // UI States
    const [lang, setLang] = useState('hi');
    const [activeTab, setActiveTab] = useState<'login'|'register'>('login');
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ name: '', email: '', password: '', refCode: '' });

    // OTP States
    const [otpSent, setOtpSent] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpCooldown, setOtpCooldown] = useState(0);

    const t = (key: string, defaultText: string) => {
        if (lang === 'hi') return defaultText;
        return TRANSLATIONS[lang]?.[key] || defaultText;
    };

    useEffect(() => {
        if (status === 'authenticated') {
            router.replace('/dashboard');
        }

        if (typeof window !== 'undefined' && window.location.search) {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('login') === 'true') {
                setActiveTab('login');
                document.getElementById('auth')?.scrollIntoView({behavior:'smooth'});
            } else if (searchParams.get('signup') === 'true') {
                setActiveTab('register');
                document.getElementById('auth')?.scrollIntoView({behavior:'smooth'});
            }
            const ref = searchParams.get('ref');
            if (ref) {
                setSignupData(prev => ({ ...prev, refCode: ref }));
                setActiveTab('register');
                document.getElementById('auth')?.scrollIntoView({behavior:'smooth'});
            }
        }
    }, [status, router]);

    // OTP cooldown timer
    useEffect(() => {
        if (otpCooldown <= 0) return;
        const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
        return () => clearTimeout(timer);
    }, [otpCooldown]);

    // Send OTP function
    const sendOtp = async () => {
        if (!signupData.name) {
            toast.error('Please enter your name');
            return;
        }
        if (!signupData.email || !signupData.email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }
        if (!signupData.password || signupData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupData.email })
            });
            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
                setOtpCooldown(60);
                toast.success('OTP sent to your email!');
            } else {
                toast.error(data.error || 'Failed to send OTP');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const doLogin = async () => {
        if (!loginData.email || !loginData.email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }
        if (!loginData.password || loginData.password.length < 6) {
            toast.error('Please enter your password');
            return;
        }

        setIsLoading(true);
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: loginData.email,
                password: loginData.password
            });
            if (result?.error) {
                toast.error('Invalid email or password');
            } else {
                toast.success('Welcome back!');
                router.push('/dashboard');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const doSignup = async () => {
        if (!signupData.email || !signupData.email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }
        if (!signupData.password || signupData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (!otpValue || otpValue.length !== 6) {
            toast.error('Please enter the 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: signupData.name || 'User',
                    email: signupData.email,
                    password: signupData.password,
                    refCode: signupData.refCode,
                    otp: otpValue
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Account created! Logging in...');
                setOtpSent(false);
                setOtpValue('');
                await signIn('credentials', {
                    redirect: false,
                    email: signupData.email,
                    password: signupData.password
                });
                router.push('/dashboard');
            } else {
                toast.error(data.error || 'Registration failed');
            }
        } catch (error) {
            toast.error('Registration failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToAuth = (tab: 'login' | 'register') => {
        setActiveTab(tab);
        document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div id="landing-page">
            <nav>
              <div className="nav-row">
                <div className="brand"><div className="logo">🧾</div>Bill<span style={{ color: 'var(--primary-2)' }}>GST</span></div>
                <div className="nav-links">
                  <a href="#features">{t("nl1", "फीचर्स")}</a>
                  <a href="#gst">{t("nl2", "जीएसटी रिटर्न")}</a>
                  <a href="#reviews">{t("nl3", "रिव्यू")}</a>
                  <a href="#faq">{t("nl4", "FAQ")}</a>
                </div>
                <div className="nav-actions">
                  <select className="lang-btn" id="langSel" value={lang} onChange={e => setLang(e.target.value)}>
                    <option value="hi">🌐 हिंदी</option>
                    <option value="en">🌐 English</option>
                    <option value="mr">🌐 मराठी</option>
                    <option value="gu">🌐 ગુજરાતી</option>
                  </select>
                  <button className="btn btn-ghost" onClick={() => scrollToAuth('login')}>{t("nav_login", "लॉगिन")}</button>
                  <button className="btn btn-solid" onClick={() => scrollToAuth('register')}>{t("nav_register", "मुफ्त रजिस्टर करें")}</button>
                </div>
              </div>
            </nav>

            <section className="hero">
              <div className="wrap">
                <div className="badge"><b>मुफ्त</b><span> {t("badge", "दुकान और घर दोनों के लिए")}</span></div>
                <h1 dangerouslySetInnerHTML={{ __html: t("h1", "फ्री बिलिंग, खर्चे का हिसाब<br>और <span class=\"hl\">ऑनलाइन दुकान</span> ऐप") }} />
                <p className="sub">{t("sub", "घर का रोज़ का खर्चा लिखें, स्टॉक मैनेज करें, ऑनलाइन दुकान बनाएं और हाजिरी लगाएं — मुफ्त में शुरू करें, स्मार्ट AI फीचर्स के साथ आगे बढ़ें।")}</p>
                <div className="hero-cta">
                  <button className="btn btn-solid btn-lg" onClick={() => scrollToAuth('register')}>{t("cta_main", "मुफ्त रजिस्टर करें →")}</button>
                  <a href="#features" className="btn btn-ghost btn-lg">{t("cta_sec", "फीचर्स देखें")}</a>
                </div>
                <p style={{ color: 'var(--ink-soft)', fontSize: '.82rem', marginBottom: '30px' }}>{t("trust", "🔒 कोई क्रेडिट कार्ड नहीं · 60 सेकंड में सेटअप · 1000+ दुकानदारों का भरोसा")}</p>
                <div className="icon-strip">
                  <div className="ichip">🧾 <span>{t("i1", "जीएसटी बिलिंग")}</span></div>
                  <div className="ichip">🎙️ <span>{t("i2", "वॉइस एआई")}</span></div>
                  <div className="ichip">💬 <span>{t("i3", "व्हाट्सएप पीडीएफ")}</span></div>
                  <div className="ichip">📸 <span>{t("i4", "कैमरा → स्टॉक")}</span></div>
                  <div className="ichip">🔔 <span>{t("i5", "लो स्टॉक अलर्ट")}</span></div>
                  <div className="ichip">⏰ <span>{t("i6", "एक्सपायरी अलर्ट")}</span></div>
                  <div className="ichip">🕐 <span>{t("i7", "हाजिरी")}</span></div>
                  <div className="ichip">💰 <span>{t("i8", "खर्चे")}</span></div>
                  <div className="ichip">🏪 <span>{t("i9", "ऑनलाइन दुकान")}</span></div>
                </div>
              </div>
            </section>

            <section id="features">
              <div className="wrap center"><div className="eyebrow">{t("e1", "मुख्य फीचर्स")}</div><h2>{t("ft1", "आपकी दुकान की हर जरूरत")}</h2><p className="section-sub">{t("ft1s", "हर फीचर आपका समय बचाने के लिए बनाया गया है।")}</p></div>
              <div className="wrap"><div className="grid3">
                <div className="card"><div className="ic">💬</div><h3>{t("m1h", "व्हाट्सएप पर पीडीएफ बिल भेजें")}</h3><p>{t("m1p", "कोई भी बिल बनाएं और सीधे ग्राहक के व्हाट्सएप पर भेजें — बिना डाउनलोड या ईमेल के, सिर्फ एक टैप में।")}</p><span className="tagchip">{t("m1t", "तुरंत डिलीवरी")}</span></div>
                <div className="card"><div className="ic">📸</div><h3>{t("m2h", "फोटो खींचें → AI स्टॉक अपडेट करेगा")}</h3><p>{t("m2p", "किसी भी प्रोडक्ट या बारकोड की फोटो लें। हमारा AI उसे पढ़कर खुद स्टॉक अपडेट कर देगा।")}</p><span className="tagchip">{t("m2t", "एआई पावर्ड · नया")}</span> <span className="tagchip" style={{ background: 'rgba(245,178,60,.15)', color: 'var(--gold)', marginLeft: '6px' }}>{t("protag", "स्मार्ट फीचर")}</span></div>
                <div className="card"><div className="ic">🧾</div><h3>{t("m3h", "जीएसटी रिटर्न — GSTR-1, 3B और 4")}</h3><p>{t("m3p", "आपका सारा बिलिंग डेटा खुद-ब-खुद जीएसटी रिटर्न फॉर्मेट में आ जाता है। पोर्टल के लिए तैयार रिपोर्ट डाउनलोड करें।")}</p><span className="tagchip">{t("m3t", "सीए-रेडी रिपोर्ट्स")}</span></div>
              </div></div>
            </section>

            <section style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
              <div className="wrap center"><div className="eyebrow">{t("e2", "सिर्फ बिलिंग नहीं")}</div><h2>{t("ft2", "पूरी दुकान यहीं से मैनेज करें")}</h2><p className="section-sub">{t("ft2s", "स्टॉक से लेकर स्टाफ और रोज के खर्चे तक — सब मुफ्त में हैंडल करता है।")}</p></div>
              <div className="wrap"><div className="grid4">
                <div className="card"><div className="ic">🏪</div><h3>{t("s1h", "मुफ्त ऑनलाइन दुकान")}</h3><p>{t("s1p", "स्टॉक को 1 क्लिक में कैटलॉग बनाएं। व्हाट्सएप पर लिंक शेयर करें और ऑर्डर पाएं।")}</p></div>
                <div className="card"><div className="ic">📦</div><h3>{t("s2h", "स्मार्ट इन्वेंट्री")}</h3><p>{t("s2p", "हर सेल पर खुद स्टॉक अपडेट, लो-स्टॉक अलर्ट और एक्सपायरी ट्रैकिंग।")}</p></div>
                <div className="card"><div className="ic">💸</div><h3>{t("s3h", "रोज का खर्चा ट्रैकर")}</h3><p>{t("s3p", "दुकान और घर दोनों के लिए! किराया, राशन, बिजली — सब ट्रैक करें।")}</p></div>
                <div className="card"><div className="ic">👥</div><h3>{t("s4h", "स्टाफ हाजिरी और सैलरी")}</h3><p>{t("s4p", "रोज की हाजिरी लगाएं, एडवांस ट्रैक करें, सैलरी खुद-ब-खुद निकले।")}</p></div>
              </div></div>
            </section>

            <section>
              <div className="wrap center"><div className="eyebrow">{t("e3", "सभी फीचर्स")}</div><h2>{t("ft3", "एक ऐप, पूरा कंट्रोल")}</h2></div>
              <div className="wrap"><div className="grid4">
                <div className="card"><div className="ic">🧾</div><h3>{t("a1", "सभी तरह के बिल")}</h3><p>{t("a1p", "टैक्स इनवॉइस, प्रोफार्मा, क्रेडिट नोट, डिलीवरी चालान।")}</p></div>
                <div className="card"><div className="ic">🔔</div><h3>{t("a2", "लो स्टॉक अलर्ट")}</h3><p>{t("a2p", "सामान कम होते ही तुरंत अलर्ट पाएं।")}</p></div>
                <div className="card"><div className="ic">⏰</div><h3>{t("a3", "एक्सपायरी अलर्ट")}</h3><p>{t("a3p", "एक्सपायरी ट्रैक करें, खराब होने से पहले अलर्ट।")}</p></div>
                <div className="card"><div className="ic">🕐</div><h3>{t("a4", "स्टाफ हाजिरी")}</h3><p>{t("a4p", "रोज की हाजिरी, मंथली रिपोर्ट, सैलरी कैलकुलेशन।")}</p></div>
                <div className="card"><div className="ic">💰</div><h3>{t("a5", "खर्चे ट्रैक करें")}</h3><p>{t("a5p", "किराया, बिजली, खरीदारी — एक जगह लिखें।")}</p></div>
                <div className="card"><div className="ic">🏪</div><h3>{t("a6", "ऑनलाइन दुकान")}</h3><p>{t("a6p", "सेकंडों में स्टोर बनाएं, शेयर करें, ऑर्डर लें।")}</p></div>
                <div className="card"><div className="ic">📒</div><h3>{t("a7", "कस्टमर हिसाब")}</h3><p>{t("a7p", "उधारी का हिसाब रखें, रिमाइंडर भेजें।")}</p></div>
                <div className="card"><div className="ic">🎙️</div><h3>{t("a8", "वॉइस बिलिंग एआई")}</h3><p>{t("a8p", "सामान बोलें — बिल तैयार। हिंदी और अंग्रेज़ी दोनों में।")}</p><span className="tagchip" style={{ background: 'rgba(245,178,60,.15)', color: 'var(--gold)' }}>{t("protag", "स्मार्ट फीचर")}</span></div>
              </div></div>
            </section>

            <section id="gst" className="gst">
              <div className="wrap center">
                <div className="eyebrow">{t("e4", "जीएसटी फाइलिंग")}</div>
                <h2>{t("g_title", "जीएसटी रिटर्न, अब आसान")}</h2>
                <p className="section-sub">{t("g_sub", "आपके डेटा से सभी मुख्य जीएसटी रिटर्न बनते हैं। डाउनलोड करें और पोर्टल पर अपलोड करें।")}</p>
                <div className="gst-row">
                  <div className="gst-chip"><b>GSTR-1</b><span>{t("g1", "आउटवर्ड सप्लाई रिटर्न")}</span></div>
                  <div className="gst-chip"><b>GSTR-3B</b><span>{t("g2", "मासिक समरी रिटर्न")}</span></div>
                  <div className="gst-chip"><b>GSTR-4</b><span>{t("g3", "कम्पोजीशन स्कीम रिटर्न")}</span></div>
                </div>
                <p className="ca-ready"><b>{t("ca1", "CA Ready")}</b> — <span>{t("ca2", "सीधे अपने CA के साथ रिपोर्ट शेयर करें")}</span></p>
              </div>
            </section>

            <section>
              <div className="wrap center"><div className="eyebrow">{t("e5", "यह कैसे काम करता है")}</div><h2>{t("hw_title", "3 आसान स्टेप्स में शुरू करें")}</h2></div>
              <div className="wrap"><div className="steps">
                <div className="step"><div className="num">1</div><h3>{t("st1h", "मुफ्त रजिस्टर करें")}</h3><p>{t("st1p", "एक मिनट से कम में साइन अप करें। ना डॉक्यूमेंट, ना क्रेडिट कार्ड।")}</p></div>
                <div className="step"><div className="num">2</div><h3>{t("st2h", "अपना सामान जोड़ें")}</h3><p>{t("st2p", "टाइप करें या कैमरा इस्तेमाल करें — AI स्कैन करके खुद जोड़ देगा।")}</p></div>
                <div className="step"><div className="num">3</div><h3>{t("st3h", "बिल बनाएं, शेयर करें")}</h3><p>{t("st3p", "बोलकर या टैप करके बिल बनाएं, व्हाट्सएप पर भेजें, डैशबोर्ड से ट्रैक करें।")}</p></div>
              </div></div>
            </section>

            <section id="reviews">
              <div className="wrap center"><div className="eyebrow">{t("e6", "दुकानदार क्या कहते हैं")}</div><h2>{t("r_title", "पूरे भारत का भरोसा")}</h2></div>
              <div className="wrap"><div className="grid3">
                <div className="rcard"><div className="stars">★★★★★</div><p>{t("r1", "\"जीएसटी बिलिंग में घंटों लगते थे। अब 5 मिनट में रिटर्न रिपोर्ट तैयार हो जाती है।\"")}</p><div className="who"><div className="avatar">RG</div><div><b>Rajesh Gupta</b><span>{t("r1l", "Kirana Store, Patna")}</span></div></div></div>
                <div className="rcard"><div className="stars">★★★★★</div><p>{t("r2", "\"व्हाट्सएप पीडीएफ फीचर बहुत बढ़िया है। दुकान ज्यादा प्रोफेशनल लगती है।\"")}</p><div className="who"><div className="avatar">SV</div><div><b>Sunita Verma</b><span>{t("r2l", "Beauty Parlour, Indore")}</span></div></div></div>
                <div className="rcard"><div className="stars">★★★★★</div><p>{t("r3", "\"कैमरा स्टॉक अपडेट तो जादू है। रोज मेरे 30 मिनट बचते हैं।\"")}</p><div className="who"><div className="avatar">MJ</div><div><b>Mohit Jain</b><span>{t("r3l", "Medical Store, Jaipur")}</span></div></div></div>
              </div></div>
            </section>

            <section id="auth">
              <div className="wrap">
                <div className="auth-box">
                  <div className="tabs">
                    <div className={`tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>{t("nav_login", "लॉगिन")}</div>
                    <div className={`tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>{t("nav_register", "रजिस्टर करें")}</div>
                  </div>
                  <div className="tab-body">
                    {activeTab === 'login' && (
                        <div className="panel active">
                          <h3>{t("wb", "वापसी पर स्वागत है 👋")}</h3><p>{t("wbs", "अपने BillGST अकाउंट में लॉगिन करें")}</p>
                          <label>{t("le", "ईमेल एड्रेस")}</label>
                          <input type="email" placeholder="you@example.com" value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} />
                          <label>{t("lp", "पासवर्ड")}</label>
                          <input type="password" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
                          <button className="btn btn-solid" style={{ width: '100%', justifyContent: 'center' }} onClick={doLogin} disabled={isLoading}>
                             {isLoading ? "..." : t("bl", "लॉगिन करें")}
                          </button>
                        </div>
                    )}
                    {activeTab === 'register' && (
                        <div className="panel active">
                          <h3>{t("rh", "60 सेकंड में सेटअप करें 🏪")}</h3><p>{t("rhs", "कोई क्रेडिट कार्ड नहीं चाहिए")}</p>
                          {!otpSent ? (
                              <div>
                                <label>{t("ln", "पूरा नाम")}</label>
                                <input type="text" value={signupData.name} onChange={e => setSignupData({...signupData, name: e.target.value})} />
                                <label>{t("le", "ईमेल एड्रेस")}</label>
                                <input type="email" placeholder="you@example.com" value={signupData.email} onChange={e => setSignupData({...signupData, email: e.target.value})} />
                                <label>{t("lp", "पासवर्ड")}</label>
                                <input type="password" value={signupData.password} onChange={e => setSignupData({...signupData, password: e.target.value})} />
                                <button className="btn btn-solid" style={{ width: '100%', justifyContent: 'center', border: 'none', fontFamily: 'inherit', fontSize: '.92rem', cursor: 'pointer' }} onClick={sendOtp} disabled={isLoading}>
                                    {isLoading ? "..." : t("br", "OTP भेजें")}
                                </button>
                              </div>
                          ) : (
                              <div>
                                <p style={{ fontSize: '.86rem', color: 'var(--ink-soft)', marginBottom: '14px' }}>{t("otpsent", "OTP आपके ईमेल पर भेज दिया गया है ✅")}</p>
                                <label>{t("lotp", "OTP डालें")}</label>
                                <input type="text" maxLength={6} placeholder="6-digit OTP" value={otpValue} onChange={e => setOtpValue(e.target.value)} />
                                <button className="btn btn-solid" style={{ width: '100%', justifyContent: 'center', border: 'none', fontFamily: 'inherit', fontSize: '.92rem', cursor: 'pointer' }} onClick={doSignup} disabled={isLoading || otpValue.length !== 6}>
                                    {isLoading ? "..." : t("bv", "वेरिफाई करें और अकाउंट बनाएं")}
                                </button>
                                <p style={{ fontSize: '.8rem', color: 'var(--ink-soft)', marginTop: '12px', textAlign: 'center' }}>
                                    {otpCooldown > 0 ? (
                                        <span style={{ color: 'var(--ink-soft)' }}>{otpCooldown}s</span>
                                    ) : (
                                        <a href="#" onClick={(e) => { e.preventDefault(); sendOtp(); }} style={{ color: 'var(--primary-2)' }}>{t("resend", "OTP दोबारा भेजें")}</a>
                                    )}
                                </p>
                              </div>
                          )}
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section id="faq">
              <div className="wrap center"><div className="eyebrow">{t("e7", "FAQ")}</div><h2>{t("q_title", "आम सवाल")}</h2></div>
              <div className="faq">
                <details open><summary>{t("q1", "क्या BillGST सच में मुफ्त है?")}</summary><p>{t("a1f", "मुख्य बिलिंग, स्टॉक और हाजिरी फीचर्स इस्तेमाल करने के लिए हमेशा मुफ्त हैं। कुछ एडवांस्ड AI फीचर्स (जैसे वॉइस बिलिंग, फोटो स्टॉक अपडेट) आगे चलकर सीमित/प्रीमियम हो सकते हैं।")}</p></details>
                <details><summary>{t("q2", "मैं कौन से जीएसटी रिटर्न बना सकता हूँ?")}</summary><p>{t("a2f", "GSTR-1, GSTR-3B और GSTR-4 — डाउनलोड करके पोर्टल पर अपलोड करें या CA को भेजें।")}</p></details>
                <details><summary>{t("q3", "कैमरा स्टॉक अपडेट कैसे काम करता है?")}</summary><p>{t("a3f", "सामान या बारकोड की फोटो लें, AI उसे पहचान कर स्टॉक अपडेट कर देगा।")}</p></details>
                <details><summary>{t("q4", "क्या मैं व्हाट्सएप पर बिल भेज सकता हूँ?")}</summary><p>{t("a4f", "हाँ, हर बिल सीधे ग्राहक के व्हाट्सएप पर पीडीएफ के रूप में भेजा जा सकता है।")}</p></details>
                <details><summary>{t("q5", "मैं किस तरह के बिल बना सकता हूँ?")}</summary><p>{t("a5f", "टैक्स इनवॉइस, प्रोफार्मा, क्रेडिट नोट, डिलीवरी चालान — सभी उपलब्ध हैं।")}</p></details>
                <details><summary>{t("q6", "मेरा डेटा कितना सुरक्षित है?")}</summary><p>{t("a6f", "सारा डेटा AES-256 के साथ एन्क्रिप्टेड है — सिर्फ आप ही अपना डेटा देख सकते हैं।")}</p></details>
              </div>
            </section>

            <section><div className="wrap"><div className="cta-final"><h2>{t("cf1", "आज ही अपनी दुकान को डिजिटल बनाएं")}</h2><p>{t("cf2", "मुफ्त अकाउंट, 60 सेकंड में तैयार। कोई क्रेडिट कार्ड नहीं चाहिए।")}</p><button className="btn btn-solid btn-lg" onClick={() => scrollToAuth('register')}>{t("cta_main", "मुफ्त रजिस्टर करें →")}</button></div></div></section>

            <footer>
              <div className="wrap">
                <div className="foot-grid">
                  <div><div className="brand" style={{ marginBottom: '10px' }}><div className="logo">🧾</div>BillGST</div><p style={{ color: 'var(--ink-soft)', fontSize: '.86rem', lineHeight: 1.6 }}>{t("fdesc", "भारत के दुकानदारों के लिए बना स्मार्ट बिलिंग और इन्वेंट्री सॉफ्टवेयर। हिंदी और अंग्रेज़ी दोनों उपलब्ध।")}</p><a href="https://wa.me/917498571873" style={{ color: 'var(--accent)' }}>WhatsApp: +91 74985 71873</a></div>
                  <div><h4>{t("fp", "प्रोडक्ट")}</h4><a href="#features">{t("nl1", "फीचर्स")}</a><a href="#gst">{t("nl2", "जीएसटी रिटर्न")}</a><a href="#">{t("fvai", "वॉइस बिलिंग एआई")}</a></div>
                  <div><h4>{t("fc", "कंपनी")}</h4><a href="#">{t("fabout", "हमारे बारे में")}</a><a href="#">{t("fcontact", "संपर्क करें")}</a><a href="#">{t("fpriv", "प्राइवेसी पॉलिसी")}</a></div>
                </div>
                <div className="foot-bottom"><span>© 2026 Ayana Enterprises</span><span>{t("fmade", "Made in 🇮🇳 India")}</span></div>
              </div>
            </footer>
        </div>
    );
}
