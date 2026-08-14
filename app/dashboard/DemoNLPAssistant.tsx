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
        { role: 'ai', text: 'Namaste 👋 Main aapka BillGST assistant hoon. Bill banana ho ya hisaab dekhna — seedha bol dijiye ya type kar dijiye.' }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<any>(null);
    const router = useRouter();
    const setAiDraftData = useStore((state: any) => state.setAiDraftData);
    const setAiCopilotAction = useStore((state: any) => state.setAiCopilotAction);
    const settings = useStore((state: any) => state.settings) || {};
    const customers = useStore((state: any) => state.customers) || [];
    const productsData = useStore((state: any) => state.products) || [];
    const staffData = useStore((state: any) => state.staff) || [];
    const isEn = settings.language === 'en';
    
    const exampleStaff = staffData.length > 0 ? staffData[0].name.split(' ')[0] : "Ramesh";
    const exampleItem = productsData.length > 0 ? productsData[0].name : "5 kg aata";    if (!isOpen) return null;

    const startListening = () => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognitionClass();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-IN';

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

    const handleSend = async (overrideText?: string) => {
        const textToSend = overrideText || input.trim();
        if (!textToSend) return;
        
        setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
        if (!overrideText) setInput('');
        setIsProcessing(true);

        try {
            const customerNames = customers.map((c: any) => c.name);
            const productNames = productsData.map((p: any) => p.name);
            const staffNames = staffData.map((s: any) => s.name);
            
            const invoices = useStore.getState().invoices || [];
            const todayStr = new Date().toISOString().split('T')[0];
            const salesToday = invoices.filter((i: any) => (i.date || '').startsWith(todayStr)).reduce((sum: number, i: any) => sum + (i.total || 0), 0);
            const totalOutstanding = customers.reduce((sum: number, c: any) => sum + (c.balance > 0 ? c.balance : 0), 0);
            const lowStock = productsData.filter((p: any) => p.stock < 10).map((p: any) => `${p.name} (${p.stock})`).join(', ');
            const businessContext = { salesToday, totalOutstanding, lowStock };

            const tryLocalMatch = (text: string) => {
                const lowerText = text.toLowerCase();
                
                // 1. Navigation
                if (lowerText.includes('report')) return { action: 'NAVIGATE', payload: { path: '/dashboard/reports' }, reply: isEn ? 'Opening reports.' : 'Ji, reports khol raha hu.' };
                if (lowerText.includes('setting')) return { action: 'NAVIGATE', payload: { path: '/dashboard/settings' }, reply: isEn ? 'Opening settings.' : 'Ji, settings khol raha hu.' };
                if (lowerText.includes('kharcha dikhao') || (lowerText.includes('kharcha') && lowerText.includes('kholo'))) return { action: 'NAVIGATE', payload: { path: '/dashboard/expenses' }, reply: isEn ? 'Opening expenses.' : 'Ji, kharcha page khol raha hu.' };
                if (lowerText.includes('inventory') && (lowerText.includes('kholo') || lowerText.includes('dikhao'))) return { action: 'NAVIGATE', payload: { path: '/dashboard/inventory' }, reply: isEn ? 'Opening inventory.' : 'Ji, inventory khol raha hu.' };

                // 2. Attendance
                if (lowerText.includes('attendance') || lowerText.includes('present') || lowerText.includes('absent') || lowerText.includes('lagao')) {
                    let staff = staffNames.find((n: string) => lowerText.includes(n.toLowerCase()));
                    if (!staff) {
                        const words = lowerText.replace(/ki/g, '').replace(/attendance/g, '').replace(/laga/g, '').replace(/present/g, '').replace(/absent/g, '').replace(/lagao/g, '').replace(/karo/g, '').trim().split(' ');
                        const firstWord = words[0];
                        if (firstWord && firstWord.length > 1 && !['meri', 'uski', 'sabki', 'aaj', 'kal'].includes(firstWord)) {
                            staff = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
                        } else {
                            staff = 'Staff';
                        }
                    }
                    const status = lowerText.includes('absent') ? 'ABSENT' : 'PRESENT';
                    return { action: 'MARK_ATTENDANCE', payload: { staffName: staff, status }, reply: isEn ? `Marking ${staff} as ${status.toLowerCase()}.` : `Ji, ${staff} ki ${status.toLowerCase()} lagayi ja rahi hai.` };
                }

                // 3. Balance
                if (lowerText.includes('balance') || lowerText.includes('baki') || lowerText.includes('hisaab')) {
                    const cust = customerNames.find((n: string) => lowerText.includes(n.toLowerCase()));
                    if (cust) {
                        return { action: 'GET_BALANCE', payload: { partyName: cust }, reply: isEn ? `Checking balance for ${cust}.` : `Ji, main ${cust} ka balance check kar raha hu.` };
                    }
                }

                return null;
            };

            let data: any = tryLocalMatch(textToSend);

            if (!data) {
                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        message: textToSend, 
                        language: settings.language || 'hi',
                        customerNames,
                        productNames,
                        staffNames,
                        businessContext
                    })
                });
                data = await response.json();
            }
            
            let replyText = data?.reply || '';

            // Try to speak it if possible
            if (replyText && 'speechSynthesis' in window) {
                try {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(replyText);
                    const langMap: any = { 'hi': 'hi-IN', 'en': 'en-IN', 'gu': 'gu-IN', 'mr': 'mr-IN', 'ta': 'ta-IN', 'te': 'te-IN' };
                    utterance.lang = langMap[settings?.language] || 'hi-IN';
                    window.speechSynthesis.speak(utterance);
                } catch(e) {}
            }

            if (data.action) {
                if (data.action === 'SPEAK_ANSWER') {
                    // Already spoken above
                } else if (data.action === 'SEND_REMINDERS') {
                    setAiDraftData({ type: 'BULK_REMINDER' });
                    setTimeout(() => router.push('/dashboard/expenses'), 1000); // We use expenses/page for Hisaab logic
                    
                } else if (data.action === 'GET_BALANCE') {
                    const partyName = data.payload?.partyName;
                    if (partyName) {
                        const customer = customers.find((c: any) => c.name.toLowerCase() === partyName.toLowerCase());
                        if (customer) {
                            const bal = customer.balance || 0;
                            const type = customer.balanceType === 'RECEIVABLE' ? 'lena hai' : 'dena hai';
                            replyText = isEn ? `${customer.name}'s balance is ${bal} rupees.` : `${customer.name} ka balance ${bal} rupaye hai (${type}).`;
                        } else {
                            replyText = isEn ? `Customer ${partyName} not found.` : `Maaf kijiye, ${partyName} naam ka koi customer nahi mila.`;
                        }
                    }
                }

                setMessages(prev => [...prev, { role: 'ai', text: replyText }]);
                setIsProcessing(false);

                // Handle navigation and state updates with live Copilot HUD
                if (data.action === 'CREATE_INVOICE') {
                    setAiCopilotAction({
                        type: 'INVOICE',
                        title: 'Invoice Generator',
                        subtitle: `${data.payload?.customerName ? `"${data.payload.customerName}" ka ` : ''}bill auto-fill ho raha hai...`,
                        steps: [
                            { id: 1, label: `Customer "${data.payload?.customerName || 'Customer'}" select kiya ja raha hai`, status: 'active' },
                            { id: 2, label: 'Items & Prices fill ho rahe hain', status: 'pending' },
                            { id: 3, label: 'Tax & Total amount calculate ho raha hai', status: 'pending' },
                        ],
                        currentStep: 0,
                        progress: 20,
                        isVisible: true
                    });
                    setAiDraftData({ type: 'INVOICE', ...data.payload });
                    onClose();
                    router.push('/dashboard/invoices/new');
                    
                } else if (data.action === 'MARK_ATTENDANCE') {
                    setAiCopilotAction({
                        type: 'ATTENDANCE',
                        title: 'Staff Attendance',
                        subtitle: `${data.payload?.staffName || 'Staff'} ki attendance mark ho rahi hai...`,
                        steps: [
                            { id: 1, label: `Staff "${data.payload?.staffName || 'Staff'}" search ho raha hai`, status: 'active' },
                            { id: 2, label: `Attendance status (${data.payload?.status || 'PRESENT'}) mark ho raha hai`, status: 'pending' },
                            { id: 3, label: 'Record verify & save ho gaya', status: 'pending' },
                        ],
                        currentStep: 0,
                        progress: 25,
                        isVisible: true
                    });
                    setAiDraftData({ type: 'ATTENDANCE', ...data.payload });
                    onClose();
                    router.push('/dashboard/staff');
                    
                } else if (data.action === 'ADD_EXPENSE') {
                    setAiCopilotAction({
                        type: 'EXPENSE',
                        title: 'Expense & Hisaab',
                        subtitle: `₹${data.payload?.amount || ''} kharcha (${data.payload?.description || 'Expense'}) add ho raha hai...`,
                        steps: [
                            { id: 1, label: 'Khata search & verify ho raha hai', status: 'active' },
                            { id: 2, label: `Amount ₹${data.payload?.amount || ''} entry ho rahi hai`, status: 'pending' },
                            { id: 3, label: 'Transaction balance update ho gaya', status: 'pending' },
                        ],
                        currentStep: 0,
                        progress: 25,
                        isVisible: true
                    });
                    setAiDraftData({ type: 'EXPENSE', ...data.payload });
                    onClose();
                    router.push('/dashboard/expenses');
                    
                } else if (data.action === 'ADD_INVENTORY') {
                    setAiCopilotAction({
                        type: 'INVENTORY',
                        title: 'Inventory Item',
                        subtitle: `Product (${data.payload?.itemName || ''}) inventory me fill ho raha hai...`,
                        steps: [
                            { id: 1, label: 'Add Product modal open ho raha hai', status: 'active' },
                            { id: 2, label: `Item "${data.payload?.itemName || ''}" stock & unit fill ho raha hai`, status: 'pending' },
                        ],
                        currentStep: 0,
                        progress: 30,
                        isVisible: true
                    });
                    setAiDraftData({ type: 'INVENTORY', ...data.payload });
                    onClose();
                    router.push('/dashboard/inventory');
                    
                } else if (data.action === 'ADD_CUSTOMER') {
                    setAiCopilotAction({
                        type: 'CUSTOMER',
                        title: 'Customer Add',
                        subtitle: `Naya customer (${data.payload?.name || ''}) add ho raha hai...`,
                        steps: [
                            { id: 1, label: 'Customer form open ho raha hai', status: 'active' },
                            { id: 2, label: `Name (${data.payload?.name || ''}) aur Phone enter ho raha hai`, status: 'pending' },
                        ],
                        currentStep: 0,
                        progress: 30,
                        isVisible: true
                    });
                    setAiDraftData({ type: 'CUSTOMER', ...data.payload });
                    onClose();
                    router.push('/dashboard/customers');
                    
                } else if (data.action === 'ADD_SUPPLIER') {
                    setAiCopilotAction({
                        type: 'SUPPLIER',
                        title: 'Supplier Add',
                        subtitle: `Naya Supplier (${data.payload?.name || ''}) add ho raha hai...`,
                        steps: [
                            { id: 1, label: 'Supplier form open ho raha hai', status: 'active' },
                            { id: 2, label: `Supplier details fill ho rahi hai`, status: 'pending' },
                        ],
                        currentStep: 0,
                        progress: 30,
                        isVisible: true
                    });
                    setAiDraftData({ type: 'SUPPLIER', ...data.payload });
                    onClose();
                    router.push('/dashboard/suppliers');
                    
                } else if (data.action === 'RECORD_PAYMENT') {
                    setAiCopilotAction({
                        type: 'PAYMENT',
                        title: 'Payment Record',
                        subtitle: `${data.payload?.partyName || 'Customer'} ki payment process ho rahi hai...`,
                        steps: [
                            { id: 1, label: 'Customer profile load ho raha hai', status: 'active' },
                            { id: 2, label: `Payment amount ₹${data.payload?.amount || ''} fill ho raha hai`, status: 'pending' },
                        ],
                        currentStep: 0,
                        progress: 30,
                        isVisible: true
                    });
                    setAiDraftData({ type: 'PAYMENT', ...data.payload });
                    onClose();
                    router.push('/dashboard/customers');
                    
                } else if (data.action === 'CREATE_PURCHASE') {
                    setAiCopilotAction({
                        type: 'PURCHASE',
                        title: 'Purchase Bill',
                        subtitle: 'Purchase bill form auto-fill ho raha hai...',
                        steps: [
                            { id: 1, label: 'Supplier & Items fill ho rahe hain', status: 'active' }
                        ],
                        currentStep: 0,
                        progress: 30,
                        isVisible: true
                    });
                    setAiDraftData({ type: 'PURCHASE', ...data.payload });
                    onClose();
                    router.push('/dashboard/purchases/new');
                    
                } else if (data.action === 'NAVIGATE') {
                    const path = data.payload?.path || data.path;
                    if (path) {
                        setAiCopilotAction({
                            type: 'NAVIGATE',
                            title: 'Page Navigation',
                            subtitle: `${path} open kiya ja raha hai...`,
                            steps: [
                                { id: 1, label: `Navigating to ${path}`, status: 'done' }
                            ],
                            currentStep: 1,
                            progress: 100,
                            isComplete: true,
                            isVisible: true
                        });
                        setTimeout(() => {
                            onClose();
                            router.push(path);
                        }, 500);
                    }
                }
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: replyText }]);
                setIsProcessing(false);
            }
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'ai', text: 'API Error: ' + error.message }]);
            setIsProcessing(false);
        }
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
                    left:0;
                    right:0;
                    width:100%;
                    max-width: 100vw;
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
                    gap:8px;
                    padding:12px 10px calc(14px + env(safe-area-inset-bottom));
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
                .nlp-mic-btn.active {
                    background: linear-gradient(145deg, #ef4444, #dc2626);
                    box-shadow: 0 4px 14px rgba(239,68,68,0.5);
                }
                .nlp-mic-btn.active::before{
                    content:"";
                    position:absolute;
                    inset:-6px;
                    border-radius:50%;
                    border:1.5px solid #ef4444;
                    opacity:0.55;
                    animation:nlpPulseRing 1.5s infinite;
                }
                @keyframes nlpPulseRing{
                    0%{transform:scale(0.85);opacity:0.8;}
                    70%{transform:scale(1.4);opacity:0;}
                    100%{opacity:0;}
                }
                .nlp-mic-btn svg{width:18px;height:18px; transition:all 0.2s;}
                .nlp-mic-btn.active svg { stroke: white; fill: white; }
                
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
                    min-width: 0;
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
                .nlp-chat-widget, .nlp-chat-widget * {
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
                        <div className="nlp-title">BillGST Assistant
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
                    <div className="nlp-chip" onClick={() => handleSend(`${exampleItem} ka bill banao`)}>🧾 "{exampleItem} ka bill banao"</div>
                    <div className="nlp-chip" onClick={() => handleSend(`${exampleStaff} ki attendance laga`)}>🙋 "{exampleStaff} ki attendance laga"</div>
                    <div className="nlp-chip" onClick={() => handleSend("Aaj ka kharcha 500 add karo")}>📊 "Kharcha 500 add karo"</div>
                    <div className="nlp-chip" onClick={() => handleSend("Reports dikhao")}>📈 "Reports dikhao"</div>
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
                            placeholder={isListening ? "🎙️ Sun raha hoon... Boliye" : "Type karein…"} 
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
