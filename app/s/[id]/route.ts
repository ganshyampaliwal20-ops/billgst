import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Store</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Gujarati:wght@400;600;700&family=Noto+Sans+Gurmukhi:wght@400;600;700&family=Noto+Sans+Bengali:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;600;700&family=Noto+Sans+Kannada:wght@400;600;700&family=Noto+Sans+Malayalam:wght@400;600;700&display=swap" rel="stylesheet">
<style>
:root{--brand:#0f766e;--brand-soft:#e6f4f2;--ink:#0f172a;--mute:#64748b;--line:#e8ecf1;--bg:#f5f7fa;--card:#fff;--red:#dc2626;--wa:#22c55e;--r:16px}
*{box-sizing:border-box;margin:0;-webkit-tap-highlight-color:transparent}
body{background:var(--bg);color:var(--ink);font:15px/1.45 Inter,"Noto Sans Devanagari","Noto Sans Gujarati","Noto Sans Gurmukhi","Noto Sans Bengali","Noto Sans Tamil","Noto Sans Telugu","Noto Sans Kannada","Noto Sans Malayalam",system-ui,sans-serif;max-width:760px;margin:auto;padding-bottom:96px}
button,input,textarea,select{font:inherit;color:inherit}button{border:0;background:none;cursor:pointer}
:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}
.cover{height:132px;background:linear-gradient(135deg,var(--brand),color-mix(in srgb,var(--brand) 55%,#000));position:relative;padding:calc(12px + env(safe-area-inset-top,0px)) 16px;display:flex;justify-content:flex-end;gap:8px;align-items:flex-start}
.cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pill{position:relative;height:36px;border-radius:18px;background:rgba(255,255,255,.92);color:var(--ink);display:flex;align-items:center;gap:6px;padding:0 12px;font-size:13px;font-weight:600}
.pill select{border:0;background:none;font-weight:600;outline-offset:4px}
.profile{background:var(--card);margin:-44px 12px 0;border-radius:20px;padding:0 16px 16px;position:relative;box-shadow:0 1px 2px rgba(15,23,42,.06),0 8px 24px rgba(15,23,42,.06)}
.logo{width:76px;height:76px;border-radius:20px;border:4px solid var(--card);background:var(--brand);color:#fff;font-size:30px;font-weight:700;display:grid;place-items:center;margin-top:-38px;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,.15)}
.logo img{width:100%;height:100%;object-fit:cover}
h1{font-size:21px;font-weight:700;margin-top:10px;display:flex;align-items:center;gap:6px}
h1 svg{color:#2563eb;fill:#2563eb;stroke:#fff;width:20px;height:20px}
.meta{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:6px;color:var(--mute);font-size:13.5px}
.meta span{display:flex;align-items:center;gap:5px}.meta svg{width:15px;height:15px}
.dot{width:8px;height:8px;border-radius:50%;background:#16a34a}.dot.off{background:var(--red)}
.acts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}
.act{height:62px;border-radius:14px;background:var(--brand-soft);color:var(--brand);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:12.5px;font-weight:600;text-decoration:none}
.tools{position:sticky;top:0;z-index:15;background:var(--bg);padding:14px 12px 6px}
.search{position:relative}.search svg{position:absolute;left:14px;top:13px;color:var(--mute)}
.search input{width:100%;height:46px;border-radius:14px;border:1px solid var(--line);background:var(--card);padding:0 14px 0 44px}
.tabs{display:flex;gap:8px;overflow-x:auto;padding:10px 0 4px;scrollbar-width:none}
.tab{flex:none;height:36px;padding:0 16px;border-radius:18px;background:var(--card);border:1px solid var(--line);font-weight:500;color:var(--mute)}
.tab[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:#fff}
.head{display:flex;justify-content:space-between;align-items:center;padding:8px 16px}
.head b{font-size:17px}.head select{border:0;background:none;color:var(--mute);font-size:13.5px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:0 12px}
@media(min-width:560px){.grid{grid-template-columns:repeat(3,1fr)}}
.p{background:var(--card);border-radius:var(--r);overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,.06)}
.ph{aspect-ratio:1;background:var(--brand-soft);display:grid;place-items:center;color:var(--brand);position:relative}
.lt{font-size:40px;font-weight:700}
.ph img{width:100%;height:100%;object-fit:cover}
.disc{position:absolute;left:8px;top:8px;background:var(--red);color:#fff;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:8px}
.dim img,.dim .lt{opacity:.35}
.ctl{margin-top:10px}
.add{width:100%;height:42px;border-radius:12px;border:1.5px solid var(--brand);background:var(--brand-soft);color:var(--brand);font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px}
.add:active{background:var(--brand);color:#fff}
.add[disabled]{border-color:var(--line);background:var(--bg);color:var(--mute);cursor:not-allowed}
.qty{height:42px;border-radius:12px;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:space-between}
.qty button{width:48px;height:100%;color:#fff;display:grid;place-items:center}.qty button:active{background:rgba(0,0,0,.18)}.qty span{font-weight:700;font-size:16px}
.info{padding:10px 12px 12px}
.nm{font-weight:600;font-size:14.5px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.6em}
.un{color:var(--mute);font-size:12.5px;margin-top:2px}
.pr{margin-top:6px;display:flex;align-items:baseline;gap:6px}.pr b{font-size:17px}.pr s{font-size:12.5px;color:var(--mute)}
.none{grid-column:1/-1;text-align:center;padding:56px 16px;color:var(--mute)}
.bar{position:fixed;left:50%;bottom:calc(12px + env(safe-area-inset-bottom,0px));width:calc(100% - 24px);max-width:736px;transform:translate(-50%,140%);transition:transform .25s;background:var(--ink);color:#fff;border-radius:16px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;z-index:30;box-shadow:0 12px 30px rgba(15,23,42,.35)}
.bar.on{transform:translate(-50%,0)}.bar small{display:block;opacity:.7;font-size:12.5px}.bar b{font-size:18px}
.bar .go{background:var(--brand);padding:10px 16px;border-radius:12px;font-weight:600}
.veil{position:fixed;inset:0;background:rgba(15,23,42,.55);opacity:0;pointer-events:none;transition:opacity .2s;z-index:40}.veil.on{opacity:1;pointer-events:auto}
.sheet{position:fixed;left:50%;bottom:0;width:100%;max-width:760px;max-height:90vh;overflow:auto;transform:translate(-50%,100%);transition:transform .25s;background:var(--card);border-radius:24px 24px 0 0;padding:18px 16px calc(16px + env(safe-area-inset-bottom,0px));z-index:50}
.sheet.on{transform:translate(-50%,0)}
.sh{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.sh h2{font-size:19px}
.x{width:38px;height:38px;border-radius:12px;background:var(--bg);display:grid;place-items:center}
.ln{display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)}
.ln .t{width:44px;height:44px;border-radius:12px;background:var(--brand-soft);color:var(--brand);font-weight:700;display:grid;place-items:center;flex:none;overflow:hidden}.ln .t img{width:100%;height:100%;object-fit:cover}
.ln .n{flex:1;min-width:0}.ln .n b{display:block;font-weight:600;font-size:14.5px}.ln .n span{font-size:13px;color:var(--mute)}
.ln .qty{width:108px;height:36px}.ln .qty button{width:36px}.ln .a{width:70px;text-align:right;font-weight:600}
.sum{display:flex;justify-content:space-between;padding:14px 0 10px;font-size:18px;font-weight:700}
.f{display:grid;gap:8px;margin-bottom:12px}.f input,.f textarea{width:100%;border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--bg)}
.wa{width:100%;height:54px;border-radius:14px;background:var(--wa);color:#052e16;font-weight:700;font-size:16px;display:flex;justify-content:center;align-items:center;gap:8px}
.note{text-align:center;color:var(--mute);font-size:12.5px;margin-top:8px}
footer{text-align:center;color:var(--mute);font-size:12.5px;padding:28px 16px}footer a{color:var(--brand);font-weight:600;text-decoration:none}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="cover" id="cover">
  <label class="pill"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg><select id="lang" aria-label="Language"></select></label>
</div>
<section class="profile">
  <div class="logo" id="logo"></div>
  <h1><span id="sn"></span><svg viewBox="0 0 24 24"><path d="M12 2l2.4 2.1 3.2-.3 1 3 2.7 1.8-1 3.1 1 3.1-2.7 1.8-1 3-3.2-.3L12 22l-2.4-2.1-3.2.3-1-3L2.7 15.4l1-3.1-1-3.1 2.7-1.8 1-3 3.2.3z"/><path d="M8.5 12l2.5 2.5 4.5-5" /></svg></h1>
  <div class="meta"><span><i class="dot" id="dot"></i><b id="st" style="font-weight:600"></b></span><span id="loc"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg><em id="ad" style="font-style:normal"></em></span></div>
  <div class="acts">
    <a class="act" id="bCall"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 01-2.2 2A19.8 19.8 0 0111.2 19a19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/></svg><span data-t="call"></span></a>
    <a class="act" id="bWa"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 01-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1121 11.5z"/></svg><span data-t="chat"></span></a>
    <a class="act" id="bMap" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8z"/></svg><span data-t="route"></span></a>
    <button class="act" id="bShare"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg><span data-t="share"></span></button>
  </div>
</section>
<div class="tools"><div class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input id="q" type="search"></div><div class="tabs" id="tabs"></div></div>
<div class="head"><b id="cnt"></b><select id="sort"></select></div>
<main class="grid" id="grid"></main>
<footer><span data-t="powered"></span> <a href="https://billgst.in">BillGST</a></footer>

<div class="bar" id="bar"><div><small id="bn"></small><b id="bt"></b></div><span class="go" data-t="viewCart"></span></div>
<div class="veil" id="veil"></div>
<section class="sheet" id="sheet"><div class="sh"><h2 data-t="cart"></h2><button class="x" id="close" aria-label="close"><svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>
<div id="lines"></div><div class="sum"><span data-t="total"></span><span id="gt"></span></div>
<div class="f"><input id="cn" data-p="yourName" autocomplete="name"><textarea id="ca" rows="2" data-p="yourAddr"></textarea></div>
<button class="wa" id="order"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 01-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1121 11.5z"/></svg><span data-t="order"></span></button><p class="note" data-t="note"></p></section>

<script>
/* ===== 1) भाषाएँ (हर भाषा में 31 शब्द, इसी क्रम में) ===== */
const KEYS="n,open,closed,till,from,call,chat,route,share,search,all,items,sort,lh,hl,az,off,sold,viewCart,cart,total,yourName,yourAddr,order,note,none,powered,newOrder,name,addr,add".split(",");
const RAW={
hi:"हिन्दी|अभी खुला है|अभी बंद है|{t} तक|{t} से खुलेगा|कॉल|चैट|रास्ता|शेयर|सामान खोजें…|सभी|{n} सामान|क्रम|कम कीमत पहले|ज़्यादा कीमत पहले|नाम (अ–ज्ञ)|{n}% छूट|स्टॉक खत्म|कार्ट देखें|आपका कार्ट|कुल राशि|आपका नाम|डिलीवरी का पता (वैकल्पिक)|व्हाट्सऐप पर ऑर्डर भेजें|ऑर्डर सीधे दुकानदार के व्हाट्सऐप पर जाएगा।|कोई सामान नहीं मिला|यह दुकान बनी है|नया ऑर्डर|नाम|पता|जोड़ें",
en:"English|Open now|Closed now|until {t}|opens at {t}|Call|Chat|Directions|Share|Search products…|All|{n} items|Sort|Price: low to high|Price: high to low|Name (A–Z)|{n}% off|Out of stock|View cart|Your cart|Total|Your name|Delivery address (optional)|Send order on WhatsApp|Your order goes straight to the shop on WhatsApp.|No products found|Store powered by|New order|Name|Address|Add",
mr:"मराठी|आता उघडे आहे|आता बंद आहे|{t} पर्यंत|{t} वाजता उघडेल|कॉल|चॅट|मार्ग|शेअर|वस्तू शोधा…|सर्व|{n} वस्तू|क्रम|कमी किंमत आधी|जास्त किंमत आधी|नाव (अ–ज्ञ)|{n}% सूट|स्टॉक संपला|कार्ट पहा|तुमचे कार्ट|एकूण रक्कम|तुमचे नाव|डिलिव्हरी पत्ता (ऐच्छिक)|व्हॉट्सॲपवर ऑर्डर पाठवा|ऑर्डर थेट दुकानदाराच्या व्हॉट्सॲपवर जाईल.|कोणतीही वस्तू सापडली नाही|ही दुकान बनवली आहे|नवीन ऑर्डर|नाव|पत्ता|जोडा",
gu:"ગુજરાતી|હમણાં ખુલ્લું છે|હમણાં બંધ છે|{t} સુધી|{t} વાગ્યે ખુલશે|કૉલ|ચેટ|રસ્તો|શેર|વસ્તુ શોધો…|બધું|{n} વસ્તુ|ક્રમ|ઓછી કિંમત પહેલા|વધુ કિંમત પહેલા|નામ (અ–જ્ઞ)|{n}% છૂટ|સ્ટોક ખતમ|કાર્ટ જુઓ|તમારું કાર્ટ|કુલ રકમ|તમારું નામ|ડિલિવરી સરનામું (વૈકલ્પિક)|વોટ્સએપ પર ઓર્ડર મોકલો|ઓર્ડર સીધો દુકાનદારના વોટ્સએપ પર જશે.|કોઈ વસ્તુ મળી નથી|આ દુકાન બનાવી છે|નવો ઓર્ડર|નામ|સરનામું|ઉમેરો",
pa:"ਪੰਜਾਬੀ|ਹੁਣ ਖੁੱਲ੍ਹਾ ਹੈ|ਹੁਣ ਬੰਦ ਹੈ|{t} ਤੱਕ|{t} ਵਜੇ ਖੁੱਲ੍ਹੇਗਾ|ਕਾਲ|ਚੈਟ|ਰਸਤਾ|ਸਾਂਝਾ ਕਰੋ|ਸਮਾਨ ਲੱਭੋ…|ਸਭ|{n} ਸਮਾਨ|ਕ੍ਰਮ|ਘੱਟ ਕੀਮਤ ਪਹਿਲਾਂ|ਵੱਧ ਕੀਮਤ ਪਹਿਲਾਂ|ਨਾਮ (ੳ–ੜ)|{n}% ਛੋਟ|ਸਟਾਕ ਖ਼ਤਮ|ਕਾਰਟ ਵੇਖੋ|ਤੁਹਾਡਾ ਕਾਰਟ|ਕੁੱਲ ਰਕਮ|ਤੁਹਾਡਾ ਨਾਮ|ਡਿਲੀਵਰੀ ਦਾ ਪਤਾ (ਵਿਕਲਪਿਕ)|ਵਟਸਐਪ ’ਤੇ ਆਰਡਰ ਭੇਜੋ|ਆਰਡਰ ਸਿੱਧਾ ਦੁਕਾਨਦਾਰ ਦੇ ਵਟਸਐਪ ’ਤੇ ਜਾਵੇਗਾ।|ਕੋਈ ਸਮਾਨ ਨਹੀਂ ਮਿਲਿਆ|ਇਹ ਦੁਕਾਨ ਬਣੀ ਹੈ|ਨਵਾਂ ਆਰਡਰ|ਨਾਮ|ਪਤਾ|ਜੋੜੋ",
bn:"বাংলা|এখন খোলা|এখন বন্ধ|{t} পর্যন্ত|{t}-এ খুলবে|কল|চ্যাট|পথ|শেয়ার|পণ্য খুঁজুন…|সব|{n}টি পণ্য|সাজান|কম দাম আগে|বেশি দাম আগে|নাম (অ–ঔ)|{n}% ছাড়|স্টক শেষ|কার্ট দেখুন|আপনার কার্ট|মোট টাকা|আপনার নাম|ডেলিভারির ঠিকানা (ঐচ্ছিক)|হোয়াটসঅ্যাপে অর্ডার পাঠান|অর্ডার সরাসরি দোকানদারের হোয়াটসঅ্যাপে যাবে।|কোনো পণ্য পাওয়া যায়নি|এই দোকান তৈরি|নতুন অর্ডার|নাম|ঠিকানা|যোগ করুন",
ta:"தமிழ்|இப்போது திறந்துள்ளது|இப்போது மூடப்பட்டுள்ளது|{t} வரை|{t} மணிக்குத் திறக்கும்|அழை|அரட்டை|வழி|பகிர்|பொருட்களைத் தேடுங்கள்…|அனைத்தும்|{n} பொருட்கள்|வரிசை|குறைந்த விலை முதலில்|அதிக விலை முதலில்|பெயர் (அ–ஔ)|{n}% தள்ளுபடி|இருப்பு இல்லை|கார்ட்டைப் பார்க்க|உங்கள் கார்ட்|மொத்தத் தொகை|உங்கள் பெயர்|டெலிவரி முகவரி (விருப்பம்)|வாட்ஸ்அப்பில் ஆர்டர் அனுப்புங்கள்|ஆர்டர் நேரடியாகக் கடைக்காரரின் வாட்ஸ்அப்புக்குச் செல்லும்.|பொருட்கள் எதுவும் இல்லை|இந்தக் கடை உருவாக்கியது|புதிய ஆர்டர்|பெயர்|முகவரி|சேர்",
te:"తెలుగు|ఇప్పుడు తెరిచి ఉంది|ఇప్పుడు మూసి ఉంది|{t} వరకు|{t} కి తెరుస్తారు|కాల్|చాట్|దారి|షేర్|వస్తువులు వెతకండి…|అన్నీ|{n} వస్తువులు|క్రమం|తక్కువ ధర ముందు|ఎక్కువ ధర ముందు|పేరు (అ–ఔ)|{n}% తగ్గింపు|స్టాక్ లేదు|కార్ట్ చూడండి|మీ కార్ట్|మొత్తం|మీ పేరు|డెలివరీ చిరునామా (ఐచ్ఛికం)|వాట్సాప్లో ఆర్డర్ పంపండి|ఆర్డర్ నేరుగా దుకాణదారుని వాట్సాప్కు వెళ్తుంది.|వస్తువులు దొరకలేదు|ఈ దుకాణం తయారు చేసింది|కొత్త ఆర్డర్|పేరు|చిరునామా|చేర్చండి",
kn:"ಕನ್ನಡ|ಈಗ ತೆರೆದಿದೆ|ಈಗ ಮುಚ್ಚಿದೆ|{t} ವರೆಗೆ|{t}ಕ್ಕೆ ತೆರೆಯುತ್ತದೆ|ಕರೆ|ಚಾಟ್|ದಾರಿ|ಹಂಚಿ|ವಸ್ತುಗಳನ್ನು ಹುಡುಕಿ…|ಎಲ್ಲಾ|{n} ವಸ್ತುಗಳು|ಕ್ರಮ|ಕಡಿಮೆ ಬೆಲೆ ಮೊದಲು|ಹೆಚ್ಚು ಬೆಲೆ ಮೊದಲು|ಹೆಸರು (ಅ–ಔ)|{n}% ರಿಯಾಯಿತಿ|ಸ್ಟಾಕ್ ಇಲ್ಲ|ಕಾರ್ಟ್ ನೋಡಿ|ನಿಮ್ಮ ಕಾರ್ಟ್|ಒಟ್ಟು ಮೊತ್ತ|ನಿಮ್ಮ ಹೆಸರು|ಡೆಲಿವರಿ ವಿಳಾಸ (ಐಚ್ಛಿಕ)|ವಾಟ್ಸಾಪ್ನಲ್ಲಿ ಆರ್ಡರ್ ಕಳುಹಿಸಿ|ಆರ್ಡರ್ ನೇರವಾಗಿ ಅಂಗಡಿಯವರ ವಾಟ್ಸಾಪ್ಗೆ ಹೋಗುತ್ತದೆ.|ಯಾವುದೇ ವಸ್ತು ಸಿಗಲಿಲ್ಲ|ಈ ಅಂಗಡಿಯನ್ನು ರಚಿಸಿದವರು|ಹೊಸ ಆರ್ಡರ್|ಹೆಸರು|ವಿಳಾಸ|ಸೇರಿಸಿ",
ml:"മലയാളം|ഇപ്പോൾ തുറന്നിരിക്കുന്നു|ഇപ്പോൾ അടച്ചിരിക്കുന്നു|{t} വരെ|{t}-ന് തുറക്കും|വിളിക്കുക|ചാറ്റ്|വഴി|പങ്കിടുക|സാധനങ്ങൾ തിരയുക…|എല്ലാം|{n} സാധനങ്ങൾ|ക്രമം|വില കുറഞ്ഞത് ആദ്യം|വില കൂടിയത് ആദ്യം|പേര് (അ–ഔ)|{n}% കിഴിവ്|സ്റ്റോക്ക് തീർന്നു|കാർട്ട് കാണുക|നിങ്ങളുടെ കാർട്ട്|ആകെ തുക|നിങ്ങളുടെ പേര്|ഡെലിവറി വിലാസം (ഓപ്ഷണൽ)|വാട്സ്ആപ്പിൽ ഓർഡർ അയയ്ക്കുക|ഓർഡർ നേരിട്ട് കടയുടമയുടെ വാട്സ്ആപ്പിലേക്ക് പോകും.|സാധനങ്ങളൊന്നും കണ്ടെത്തിയില്ല|ഈ കട നിർമ്മിച്ചത്|പുതിയ ഓർഡർ|പേര്|വിലാസം|ചേർക്കുക"
};
const I18N={};for(const c in RAW)I18N[c]=Object.fromEntries(RAW[c].split("|").map((v,i)=>[KEYS[i],v]));
/* ===== 2) डेटा: हर यूज़र की दुकान इसी URL (/s/<id>) से आती है ===== */
const DEMO={shop:{name:{hi:"श्री राम किराना",en:"Shri Ram Kirana"},phone:"9549355681",addr:{hi:"गोगुन्दा, उदयपुर",en:"Gogunda, Udaipur"},lang:"hi",color:"#0f766e",logo:"",cover:"",open:"09:00",close:"21:00"},
products:[
{id:1,name:{hi:"आटा 5 किलो",en:"Wheat Flour 5 kg"},cat:{hi:"किराना",en:"Grocery"},price:210,mrp:240,unit:{hi:"5 किलो",en:"5 kg"},stock:20}]};
/* नाम/पता/category/unit या तो सीधा text हो सकता है, या हर भाषा का object: {hi:"…",en:"…",mr:"…"} */
async function load() {
  const id = location.pathname.split("/").pop();
  try {
    const r = await fetch("/api/public/store/" + id);
    if (!r.ok) throw 0;
    const data = await r.json();
    if (data.error) throw 0;
    
    // Map API to his format
    let b = data.business || {};
    let storeS = {
      name: b.business_name || "Digital Store",
      phone: (b.business_phone || "").replace(/\\D/g, ""),
      addr: b.business_address || "",
      lang: "hi",
      color: "#0f766e",
      logo: b.business_logo || "",
      cover: b.store_banner || "",
      open: "00:00",
      close: "23:59"
    };
    
    let storeP = (data.products || []).map(p => ({
      id: p.id,
      name: p.name,
      cat: p.category || "General",
      price: Number(p.price) || 0,
      mrp: Number(p.price) || 0,
      unit: p.unit || "",
      stock: p.stock_quantity ?? 100, // default if null
      img: p.image_url || ""
    }));

    return { shop: storeS, products: storeP };
  } catch(e) {
    return DEMO;
  }
}

const $=i=>document.getElementById(i),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let S,P=[],L="hi",cat="",qs="",sort="";const cart={};
const tr=(v,l=L)=>v&&typeof v==="object"?(v[l]||v[S.lang]||v.en||Object.values(v)[0]||""):(v==null?"":v);
const ck=p=>tr(p.cat,S.lang);
const T=(k,v={},l=L)=>(I18N[l][k]||I18N.en[k]||k).replace(/\\{(\\w+)\\}/g,(_,x)=>v[x]);
const inr=n=>"₹"+Number(n).toLocaleString("en-IN",{maximumFractionDigits:2,minimumFractionDigits:n%1?2:0});

function statics(){document.documentElement.lang=L;
 $("sn").textContent=tr(S.name);$("ad").textContent=tr(S.addr);document.title=tr(S.name);if(!S.logo)$("logo").textContent=tr(S.name).trim()[0];$("bMap").href="https://maps.google.com/?q="+encodeURIComponent(tr(S.addr));
 document.querySelectorAll("[data-t]").forEach(e=>e.textContent=T(e.dataset.t));
 document.querySelectorAll("[data-p]").forEach(e=>e.placeholder=T(e.dataset.p));
 $("q").placeholder=T("search");
 $("sort").innerHTML=["","lh","hl","az"].map(v=>\`<option value="\${v}" \${v===sort?"selected":""}>\${v?T(v):T("sort")}</option>\`).join("");
 const on=(()=>{const d=new Date(),m=d.getHours()*60+d.getMinutes(),t=s=>{const[h,i]=s.split(":");return h*60+ +i};return m>=t(S.open)&&m<t(S.close)})();
 $("dot").className="dot"+(on?"":" off");$("st").textContent=T(on?"open":"closed")+" · "+T(on?"till":"from",{t:on?S.close:S.open})}
function tabs(){const m=new Map();P.forEach(p=>m.set(ck(p),tr(p.cat)));
 $("tabs").innerHTML=[["",T("all")],...m].map(([v,l])=>\`<button class="tab" aria-pressed="\${v===cat}" data-c="\${esc(v)}">\${esc(l)}</button>\`).join("")}
function tile(p){return p.img?\`<img src="\${esc(p.img)}" alt="" loading="lazy">\`:\`<span class="lt">\${esc(tr(p.name).trim()[0])}</span>\`}
const IC={p:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',m:'<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>'};
function render(){
 let l=P.filter(p=>(!cat||ck(p)===cat)&&JSON.stringify(p.name).toLowerCase().includes(qs));
 if(sort==="lh")l.sort((a,b)=>a.price-b.price);if(sort==="hl")l.sort((a,b)=>b.price-a.price);if(sort==="az")l.sort((a,b)=>tr(a.name).localeCompare(tr(b.name),L));
 $("cnt").textContent=T("items",{n:l.length});
 $("grid").innerHTML=l.length?l.map(p=>{const q=cart[p.id]||0,sold=p.stock<=0;
  return\`<article class="p"><div class="ph\${sold?" dim":""}">\${tile(p)}\${p.mrp>p.price?\`<span class="disc">\${T("off",{n:Math.round((1-p.price/p.mrp)*100)})}</span>\`:""}</div>
  <div class="info"><div class="nm">\${esc(tr(p.name))}</div><div class="un">\${esc(tr(p.unit))}</div><div class="pr"><b>\${inr(p.price)}</b>\${p.mrp>p.price?\`<s>\${inr(p.mrp)}</s>\`:""}</div>
  <div class="ctl">\${sold?\`<button class="add" disabled>\${T("sold")}</button>\`:q?\`<div class="qty"><button data-m="\${p.id}" aria-label="−">\${IC.m}</button><span>\${q}</span><button data-a="\${p.id}" aria-label="+">\${IC.p}</button></div>\`:\`<button class="add" data-a="\${p.id}">\${IC.p}\${T("add")}</button>\`}</div></div></article>\`}).join(""):\`<div class="none">\${T("none")}</div>\`;
 bar()}
const tot=()=>P.reduce((a,p)=>{const q=cart[p.id]||0;a.n+=q;a.s+=q*p.price;return a},{n:0,s:0});
function bar(){const{n,s}=tot();$("bar").classList.toggle("on",n>0);$("bn").textContent=T("items",{n});$("bt").textContent=inr(s)}
function chg(id,d){const p=P.find(x=>x.id==id),q=Math.max(0,Math.min(p.stock,(cart[id]||0)+d));q?cart[id]=q:delete cart[id];render();if($("sheet").classList.contains("on"))lines()}
function lines(){const{n,s}=tot();if(!n)return sheet(false);
 $("lines").innerHTML=P.filter(p=>cart[p.id]).map(p=>\`<div class="ln"><div class="t">\${tile(p)}</div><div class="n"><b>\${esc(tr(p.name))}</b><span>\${inr(p.price)} × \${cart[p.id]}</span></div><div class="qty"><button data-m="\${p.id}" aria-label="−">\${IC.m}</button><span>\${cart[p.id]}</span><button data-a="\${p.id}" aria-label="+">\${IC.p}</button></div><div class="a">\${inr(p.price*cart[p.id])}</div></div>\`).join("");$("gt").textContent=inr(s)}
function sheet(v){$("sheet").classList.toggle("on",v);$("veil").classList.toggle("on",v);if(v)lines()}
function all(){statics();tabs();render()}

document.addEventListener("click",e=>{const t=e.target.closest("[data-a],[data-m],[data-c]");if(!t)return;
 if(t.dataset.a)chg(t.dataset.a,1);else if(t.dataset.m)chg(t.dataset.m,-1);else{cat=t.dataset.c;tabs();render()}});
$("q").oninput=e=>{qs=e.target.value.toLowerCase().trim();render()};
$("sort").onchange=e=>{sort=e.target.value;render()};
$("lang").onchange=e=>{L=e.target.value;try{localStorage.setItem("lang",L)}catch(x){}all()};
$("bar").onclick=()=>sheet(true);$("close").onclick=$("veil").onclick=()=>sheet(false);
$("bShare").onclick=()=>{const d={title:tr(S.name),url:location.href};navigator.share?navigator.share(d).catch(()=>{}):navigator.clipboard&&navigator.clipboard.writeText(location.href)};
$("order").onclick=()=>{const{s}=tot(),o=S.lang&&I18N[S.lang]?S.lang:"hi",t=(k)=>T(k,{},o);
 let m=\`*\${t("newOrder")} – \${tr(S.name,o)}*\\n\`;if($("cn").value.trim())m+=\`\${t("name")}: \${$("cn").value.trim()}\\n\`;
 m+="\\n"+P.filter(p=>cart[p.id]).map((p,i)=>\`\${i+1}. \${tr(p.name,o)} × \${cart[p.id]} = \${inr(p.price*cart[p.id])}\`).join("\\n")+\`\\n\\n*\${t("total")}: \${inr(s)}*\`;
 if($("ca").value.trim())m+=\`\\n\${t("addr")}: \${$("ca").value.trim()}\`;
 window.open("https://wa.me/91"+S.phone+"?text="+encodeURIComponent(m),"_blank")};

load().then(d=>{S=d.shop;P=d.products;
 let sv="";try{sv=localStorage.getItem("lang")||""}catch(e){}
 L=I18N[sv]?sv:(I18N[S.lang]?S.lang:"hi");
 document.documentElement.style.setProperty("--brand",S.color||"#0f766e");
 document.documentElement.style.setProperty("--brand-soft","color-mix(in srgb,"+(S.color||"#0f766e")+" 12%,#fff)");
 
 if(S.logo)$("logo").innerHTML=\`<img src="\${esc(S.logo)}" alt="">\`;
 if(S.cover)$("cover").insertAdjacentHTML("afterbegin",\`<img src="\${esc(S.cover)}" alt="">\`);
 $("bCall").href="tel:"+S.phone;$("bWa").href="https://wa.me/91"+S.phone;
 $("lang").innerHTML=Object.entries(I18N).map(([k,v])=>\`<option value="\${k}" \${k===L?"selected":""}>\${v.n}</option>\`).join("");
 all()});
</script>
</body>
</html>`;

    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}
