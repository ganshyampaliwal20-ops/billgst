'use client';

import React, { useState, useRef } from 'react';
import { FaTimes, FaRobot, FaPaperPlane, FaBolt, FaMicrophone } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function DemoNLPAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: 'Namaste! Mai apka voice aur text NLP assistant hu. Muje try karein:\n1. "2 raincoat new bill"\n2. "Ramesh ki attendance laga"' }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<any>(null);
    const router = useRouter();
    const setAiDraftData = useStore((state: any) => state.setAiDraftData);

    if (!isOpen) return null;

    const startListening = () => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognitionClass();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'hi-IN';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                toast.success('Sun raha hu, boliye...');
            };

            recognitionRef.current.onresult = (event: any) => {
                let text = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    text += event.results[i][0].transcript;
                }
                if (text) {
                    handleSend(text);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
                toast.error('Voice samajh nahi aayi, kripya type karein.');
            };

            recognitionRef.current.start();
        } else {
            toast.error('Aapka browser voice support nahi karta, kripya type karein.');
        }
    };

    const removeStopWords = (text: string, words: string[]) => {
        let res = text;
        words.forEach(w => {
            const regex = new RegExp(`(^|\\s)${w}(?=\\s|$)`, 'gi');
            res = res.replace(regex, ' ');
        });
        return res;
    };

    const processText = (text: string) => {
        const lowerText = text.toLowerCase();
        
        // --- Intent 1: Attendance ---
        const isAttendance = lowerText.match(/(attendance|attendence|present|laga|lagao|mark|leave|absent|chutti|प्रेजेंट|अटेंडेंस|लगाओ|लगा|लगाना|हाजिरी|छुट्टी|लीव|एब्सेंट)/i);
        if (isAttendance) {
            const isAbsent = lowerText.match(/(leave|absent|chutti|छुट्टी|लीव|एब्सेंट)/i);
            const status = isAbsent ? 'ABSENT' : 'PRESENT';
            const actionText = isAbsent ? 'absent' : 'present';

            const stopWords = ['ki','ka','ke','ko','attendance','attendence','present','laga','lagao','mark','karo','kar','bhai','leave','absent','chutti','aaj','aj','do','de','hai','ho','gaya','की','का','के','को','अटेंडेंस','प्रेजेंट','लगाओ','लगा','मार्क','करो','कर','भाई','छुट्टी','लीव','एब्सेंट','आज','दो','दे','है','हो','गया','में','लगाना'];
            let name = removeStopWords(lowerText, stopWords);
            name = name.replace(/[.,?!'"]/g, '').replace(/\s+/g, ' ').trim();
            
            if (name) {
                name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }

            if (name) {
                setAiDraftData({ type: 'ATTENDANCE', action: actionText, staffName: name, status: status });
                setTimeout(() => router.push('/dashboard/staff'), 1000);
                onClose();
                return `✅ **Attendance Request!**\n- Name: ${name}\n- Status: ${status}\n\nHaajiri page open ho raha hai...`;
            } else {
                return `Aap attendance lagana chahte hain, par mujhe staff ka naam samajh nahi aaya.`;
            }
        }
        
        // --- Intent 2: Expenses ---
        const isExpense = lowerText.match(/(expense|expenses|kharcha|खर्चा|एक्सपेंस)/i);
        if (isExpense) {
            const amountMatch = lowerText.match(/(\d+)/);
            const amount = amountMatch ? parseInt(amountMatch[1]) : 0;
            
            const stopWords = ['expense','expenses','kharcha','me','add','karo','kar','do','diya','rupye','rs','rupees','ko','liye','ke','ka','ki','aur','to','in','se','cash','खर्चा','एक्सपेंस','में','ऐड','करो','कर','दो','दिया','रुपये','रुपए','रु','को','लिए','के','का','की','और','से','नकद'];
            let desc = removeStopWords(lowerText, stopWords);
            desc = desc.replace(/\d+/g, '').replace(/[.,?!'"]/g, '').replace(/\s+/g, ' ').trim();
                
            if (desc) {
                desc = desc.charAt(0).toUpperCase() + desc.slice(1);
            }

            if (desc || amount > 0) {
                setAiDraftData({ type: 'EXPENSE', description: desc, amount: amount });
                setTimeout(() => router.push('/dashboard/expenses/new'), 1000);
                onClose();
                return `✅ **Expense Request!**\n- Details: ${desc}\n- Amount: ₹${amount}\n\nKharcha page open ho raha hai...`;
            }
        }
        
        // --- Intent 3: Billing ---
        else if (lowerText.match(/(bill|banao|add|बिल|बनाओ|बना|ऐड)/i)) {
            let customerName = '';
            let item = '';
            
            const quantityMatch = lowerText.match(/(\d+)/);
            const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
            
            let processedText = lowerText.replace(/\d+/g, '').trim();
            
            const doubleKaMatch = processedText.match(/(.+?)\s+(ka|का)\s+(.+?)\s+(ka|का)\s+(bill|बिल)/i);
            const keNaamMatch = processedText.match(/(.+?)\s+(ke naam se|के नाम से)\s+(.+?)\s*((ka bill)|(का बिल)|bill|बिल)/i);
            
            if (doubleKaMatch) {
                customerName = doubleKaMatch[1].trim();
                item = doubleKaMatch[3].trim();
            } else if (keNaamMatch) {
                customerName = keNaamMatch[1].trim();
                item = keNaamMatch[3].trim();
            } else {
                const singleNaamMatch = processedText.match(/(.+?)\s+(ke naam|के नाम)\s+((ka bill)|(का बिल)|bill|बिल)/i);
                if (singleNaamMatch) {
                    customerName = singleNaamMatch[1].trim();
                } else {
                    const stopWords = ['new','bill','banao','ka','kaa','ke','ek','do','add','karo','create','make','नया','बिल','बनाओ','बना','का','के','एक','दो','ऐड','करो'];
                    item = removeStopWords(processedText, stopWords).replace(/\s+/g, ' ').trim();
                }
            }

            if (customerName) {
                customerName = customerName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }
            if (item) {
                const stopWords = ['new','bill','banao','ka','kaa','ke','ek','do','add','karo','create','make','नया','बिल','बनाओ','बना','का','के','एक','दो','ऐड','करो'];
                item = removeStopWords(item, stopWords).replace(/\s+/g, ' ').trim();
            }

            if (customerName || item) {
                const payload: any = { type: 'INVOICE', items: [] };
                if (customerName) payload.customerName = customerName;
                if (item) payload.items = [{ name: item, quantity: quantity, rate: 0, amount: 0 }];
                
                setAiDraftData(payload);
                setTimeout(() => router.push('/dashboard/invoices/new'), 1000);
                onClose();
                
                let replyMsg = `✅ **Bill Request Captured!**\n`;
                if (customerName) replyMsg += `- Customer: ${customerName}\n`;
                if (item) replyMsg += `- Item: ${item} (Qty: ${quantity})\n`;
                replyMsg += `\nNaya bill form open ho raha hai...`;
                return replyMsg;
            } else {
                return `Aap bill banana chahte hain, par mujhe item ya customer ka naam samajh nahi aaya.`;
            }
        }
        
        return `Maaf karna, mai abhi sirf 'Bill banana', 'Attendance lagana' ya 'Expense (Kharcha) add karna' samajh sakta hu. Jaise: "Pintu ko 500 rupye expense me add karo".`;
    };

    const handleSend = (overrideText?: string) => {
        const textToSend = overrideText || input.trim();
        if (!textToSend) return;
        
        setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
        if (!overrideText) setInput('');
        setIsProcessing(true);

        // Simulate network delay
        setTimeout(() => {
            const aiReply = processText(textToSend);
            setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
            setIsProcessing(false);
            
            if (aiReply.includes('✅')) {
                toast.success('Kaam ho gaya!');
            }
        }, 800);
    };

    // Helper to format time
    const getTime = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
                .nlp-widget-vars {
                    --bg-deep:#0A0620;
                    --bg-app:#120A2E;
                    --panel:#170F3C;
                    --panel-2:#1D1348;
                    --purple-1:#7C3AED;
                    --purple-2:#A78BFA;
                    --violet-glow:#5B21B6;
                    --teal-1:#0EA98A;
                    --teal-2:#34D8B0;
                    --gold:#F2B441;
                    --text-hi:#F5F2FF;
                    --text-mid:#C6BEE8;
                    --text-dim:#8A81B3;
                    --line:rgba(167,139,250,0.16);
                    --danger:#F26D6D;
                }
                .nlp-chat-widget{
                    font-family:'Poppins',sans-serif;
                    position:fixed;
                    bottom:0;
                    right:0;
                    width:100%;
                    height:100%;
                    max-height:86vh;
                    background:var(--panel);
                    border-radius:28px 28px 0 0;
                    box-shadow:0 -20px 60px rgba(0,0,0,0.55), 0 -1px 0 var(--line);
                    display:flex;
                    flex-direction:column;
                    animation:nlpRise 0.4s cubic-bezier(.2,.9,.25,1);
                    z-index: 1000;
                }
                @media (min-width: 768px) {
                    .nlp-chat-widget {
                        bottom: 80px;
                        right: 24px;
                        width: 400px;
                        height: 600px;
                        border-radius: 28px;
                    }
                }
                @keyframes nlpRise{
                    from{transform:translateY(24px);opacity:0;}
                    to{transform:translateY(0);opacity:1;}
                }
                
                .nlp-drag-handle{
                    width:38px;height:4px;border-radius:4px;
                    background:rgba(197,190,232,0.25);
                    margin:10px auto 4px;
                }
                .nlp-chat-header{
                    display:flex;
                    align-items:center;
                    gap:12px;
                    padding:10px 18px 14px;
                    border-bottom:1px solid var(--line);
                }
                .nlp-bolt-badge{
                    width:40px;height:40px;border-radius:13px;
                    background:linear-gradient(145deg,var(--teal-2),var(--teal-1));
                    display:flex;align-items:center;justify-content:center;
                    box-shadow:0 4px 14px rgba(14,169,138,0.45), inset 0 1px 0 rgba(255,255,255,0.35);
                    flex-shrink:0;
                }
                .nlp-bolt-badge svg{width:20px;height:20px;}
                .nlp-header-text{flex:1;min-width:0;}
                .nlp-header-text .nlp-title{
                    font-family:'Baloo 2',sans-serif;
                    font-weight:700;
                    font-size:16.5px;
                    color:var(--text-hi);
                    display:flex;align-items:center;gap:8px;
                    line-height:1.2;
                }
                .nlp-live-pill{
                    font-family:'Poppins',sans-serif;
                    font-size:9.5px;
                    font-weight:600;
                    color:var(--teal-2);
                    background:rgba(52,216,176,0.12);
                    border:1px solid rgba(52,216,176,0.35);
                    padding:2px 8px 2px 7px;
                    border-radius:20px;
                    display:inline-flex;
                    align-items:center;
                    gap:4px;
                    letter-spacing:0.3px;
                }
                .nlp-live-pill .nlp-dot{width:5px;height:5px;border-radius:50%;background:var(--teal-2);box-shadow:0 0 6px var(--teal-2);animation:nlpBlink 1.6s infinite;}
                @keyframes nlpBlink{0%,100%{opacity:1;}50%{opacity:0.25;}}
                .nlp-header-text .nlp-sub{
                    font-size:11.5px;
                    color:var(--text-dim);
                    margin-top:2px;
                }
                .nlp-close-btn{
                    width:30px;height:30px;border-radius:50%;
                    background:rgba(255,255,255,0.05);
                    border:1px solid var(--line);
                    color:var(--text-mid);
                    display:flex;align-items:center;justify-content:center;
                    cursor:pointer;
                    flex-shrink:0;
                    border:none;
                }
                
                .nlp-thread{
                    flex:1;
                    overflow-y:auto;
                    padding:16px 16px 6px;
                    display:flex;
                    flex-direction:column;
                    gap:14px;
                }
                .nlp-thread::-webkit-scrollbar{width:4px;}
                .nlp-thread::-webkit-scrollbar-thumb{background:var(--line);border-radius:4px;}
                
                .nlp-row{display:flex;gap:9px;max-width:100%;}
                .nlp-row.nlp-user{justify-content:flex-end;}
                .nlp-row.nlp-assistant{justify-content:flex-start;}
                
                .nlp-avatar{
                    width:26px;height:26px;border-radius:9px;
                    background:linear-gradient(145deg,var(--teal-2),var(--teal-1));
                    flex-shrink:0;
                    display:flex;align-items:center;justify-content:center;
                    margin-top:2px;
                }
                .nlp-avatar svg{width:13px;height:13px;}
                
                .nlp-bubble{
                    position:relative;
                    max-width:280px;
                    padding:11px 14px 13px;
                    font-size:13.6px;
                    line-height:1.5;
                    color:var(--text-hi);
                }
                .nlp-bubble.nlp-assistant{
                    background:var(--panel-2);
                    border:1px solid var(--line);
                    border-radius:4px 16px 16px 16px;
                }
                .nlp-bubble.nlp-assistant::after{
                    content:"";
                    position:absolute;
                    left:0; right:0; bottom:-7px;
                    height:8px;
                    background:
                        linear-gradient(-45deg, var(--panel-2) 5px, transparent 0) 0 0,
                        linear-gradient(45deg, var(--panel-2) 5px, transparent 0) 0 0;
                    background-size:10px 10px;
                    background-repeat:repeat-x;
                    opacity:0.9;
                }
                .nlp-bubble.nlp-user{
                    background:linear-gradient(150deg, var(--purple-1), #5B21B6);
                    border-radius:16px 4px 16px 16px;
                    box-shadow:0 4px 14px rgba(124,58,237,0.3);
                }
                .nlp-bubble.nlp-user::after{
                    content:"";
                    position:absolute;
                    left:0; right:0; bottom:-7px;
                    height:8px;
                    background:
                        linear-gradient(-45deg, #5B21B6 5px, transparent 0) 0 0,
                        linear-gradient(45deg, #5B21B6 5px, transparent 0) 0 0;
                    background-size:10px 10px;
                    background-repeat:repeat-x;
                }
                
                .nlp-voice-tag{
                    display:inline-flex;align-items:center;gap:6px;
                    font-size:10.5px;color:rgba(255,255,255,0.75);
                    margin-bottom:5px;
                }
                .nlp-voice-tag .nlp-bars{display:flex;align-items:flex-end;gap:1.5px;height:10px;}
                .nlp-voice-tag .nlp-bars span{width:2px;background:var(--teal-2);border-radius:1px;animation:nlpEq 1s infinite ease-in-out;}
                .nlp-voice-tag .nlp-bars span:nth-child(1){height:4px;animation-delay:0s;}
                .nlp-voice-tag .nlp-bars span:nth-child(2){height:9px;animation-delay:0.15s;}
                .nlp-voice-tag .nlp-bars span:nth-child(3){height:6px;animation-delay:0.3s;}
                .nlp-voice-tag .nlp-bars span:nth-child(4){height:10px;animation-delay:0.45s;}
                @keyframes nlpEq{0%,100%{transform:scaleY(0.5);}50%{transform:scaleY(1);}}
                
                .nlp-timestamp{
                    font-size:9.5px;
                    color:var(--text-dim);
                    margin-top:12px;
                    text-align:right;
                }
                .nlp-row.nlp-assistant .nlp-timestamp{text-align:left;}
                
                .nlp-chips{
                    display:flex;
                    gap:8px;
                    overflow-x:auto;
                    padding:12px 16px 4px;
                    scrollbar-width:none;
                }
                .nlp-chips::-webkit-scrollbar{display:none;}
                .nlp-chip{
                    flex-shrink:0;
                    font-size:11.5px;
                    color:var(--text-mid);
                    background:var(--panel-2);
                    border:1px solid var(--line);
                    padding:7px 13px;
                    border-radius:20px;
                    white-space:nowrap;
                    cursor:pointer;
                    transition:border-color 0.15s;
                }
                .nlp-chip:hover{border-color:var(--teal-2);color:var(--text-hi);}
                
                .nlp-typing{
                    display:flex;align-items:center;gap:4px;
                    padding:6px 3px;
                }
                .nlp-typing span{
                    width:5px;height:5px;border-radius:50%;
                    background:var(--text-dim);
                    animation:nlpTbounce 1.2s infinite;
                }
                .nlp-typing span:nth-child(2){animation-delay:0.15s;}
                .nlp-typing span:nth-child(3){animation-delay:0.3s;}
                @keyframes nlpTbounce{0%,60%,100%{transform:translateY(0);opacity:0.4;}30%{transform:translateY(-4px);opacity:1;}}
                
                .nlp-input-bar{
                    display:flex;
                    align-items:center;
                    gap:9px;
                    padding:12px 14px calc(14px + env(safe-area-inset-bottom));
                    border-top:1px solid var(--line);
                    background:var(--panel);
                }
                .nlp-mic-btn{
                    position:relative;
                    width:42px;height:42px;
                    border-radius:50%;
                    background:linear-gradient(145deg,var(--teal-2),var(--teal-1));
                    display:flex;align-items:center;justify-content:center;
                    flex-shrink:0;
                    cursor:pointer;
                    box-shadow:0 4px 14px rgba(14,169,138,0.4);
                    border:none;
                }
                .nlp-mic-btn.active::before{
                    content:"";
                    position:absolute;
                    inset:-6px;
                    border-radius:50%;
                    border:1.5px solid var(--teal-2);
                    opacity:0.55;
                    animation:nlpPulseRing 2s infinite;
                }
                @keyframes nlpPulseRing{
                    0%{transform:scale(0.85);opacity:0.6;}
                    70%{transform:scale(1.35);opacity:0;}
                    100%{opacity:0;}
                }
                .nlp-mic-btn svg{width:18px;height:18px;}
                
                .nlp-text-field{
                    flex:1;
                    display:flex;
                    align-items:center;
                    background:var(--panel-2);
                    border:1px solid var(--line);
                    border-radius:22px;
                    padding:0 6px 0 15px;
                    height:42px;
                }
                .nlp-text-field input{
                    flex:1;
                    background:transparent;
                    border:none;
                    outline:none;
                    color:var(--text-hi);
                    font-family:'Poppins',sans-serif;
                    font-size:13px;
                }
                .nlp-text-field input::placeholder{color:var(--text-dim);}
                
                .nlp-send-btn{
                    width:32px;height:32px;
                    border-radius:50%;
                    background:linear-gradient(135deg,var(--purple-1),var(--violet-glow));
                    display:flex;align-items:center;justify-content:center;
                    cursor:pointer;
                    flex-shrink:0;
                    box-shadow:0 3px 10px rgba(124,58,237,0.45);
                    border:none;
                }
                .nlp-send-btn:disabled{opacity:0.5; cursor:not-allowed;}
                .nlp-send-btn svg{width:15px;height:15px;margin-left:1px;}
                
                .nlp-lang-hint{
                    text-align:center;
                    font-size:9.5px;
                    color:var(--text-dim);
                    padding-bottom:8px;
                    letter-spacing:0.2px;
                    background:var(--panel);
                }
                
                /* Override default dark mode logic inside this widget */
                .nlp-chat-widget * {
                    box-sizing: border-box;
                }
            `}} />

            {/* Backdrop for mobile */}
            <div className="fixed inset-0 bg-black/50 z-[999] md:hidden" onClick={onClose}></div>

            <div className="nlp-chat-widget nlp-widget-vars">
                <div className="nlp-drag-handle"></div>

                <div className="nlp-chat-header">
                    <div className="nlp-bolt-badge">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="#06231C"/></svg>
                    </div>
                    <div className="nlp-header-text">
                        <div className="nlp-title">NLP Assistant
                            <span className="nlp-live-pill"><span className="nlp-dot"></span>Voice+Text</span>
                        </div>
                        <div className="nlp-sub">Bolkar ya likhkar, dono chalega</div>
                    </div>
                    <button className="nlp-close-btn" onClick={onClose}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className="nlp-thread" id="thread">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`nlp-row ${msg.role === 'user' ? 'nlp-user' : 'nlp-assistant'}`}>
                            {msg.role === 'ai' && (
                                <div className="nlp-avatar">
                                    <svg viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="#06231C"/></svg>
                                </div>
                            )}
                            <div>
                                <div className={`nlp-bubble ${msg.role === 'user' ? 'nlp-user' : 'nlp-assistant'} whitespace-pre-wrap`}>
                                    {msg.text}
                                </div>
                                <div className="nlp-timestamp">{getTime()}</div>
                            </div>
                        </div>
                    ))}

                    {isProcessing && (
                        <div className="nlp-row nlp-assistant">
                            <div className="nlp-avatar">
                                <svg viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="#06231C"/></svg>
                            </div>
                            <div className="nlp-bubble nlp-assistant">
                                <div className="nlp-typing"><span></span><span></span><span></span></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="nlp-chips">
                    <div className="nlp-chip" onClick={() => handleSend("5 kg aata bill banao")}>🧾 "5 kg aata bill banao"</div>
                    <div className="nlp-chip" onClick={() => handleSend("Ramesh ki attendance laga")}>🙋 "Ramesh ki attendance laga"</div>
                    <div className="nlp-chip" onClick={() => handleSend("Aaj ka kharcha 500 add karo")}>📊 "Kharcha 500 add karo"</div>
                </div>

                <div className="nlp-input-bar">
                    <button 
                        className={`nlp-mic-btn ${isListening ? 'active' : ''}`}
                        onClick={startListening}
                        disabled={isListening || isProcessing}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="#06231C" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>
                    </button>
                    <div className="nlp-text-field">
                        <input 
                            type="text" 
                            placeholder="Type karein…" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                    </div>
                    <button 
                        className="nlp-send-btn"
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isProcessing}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    </button>
                </div>
                <div className="nlp-lang-hint">हिंदी • English • Hinglish — jaisa aapko aasan lage</div>
            </div>
        </>
    );
}
