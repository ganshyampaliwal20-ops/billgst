'use client';

import React, { useState, useRef } from 'react';
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
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
                
                .nlp-widget-vars {
                    --ink:#0E0C24;
                    --panel:#171432;
                    --panel-raised:#1E1A3F;
                    --bubble-bot:#211D45;
                    --bubble-user:#12B892;
                    --border:rgba(255,255,255,0.08);
                    --border-strong:rgba(255,255,255,0.14);
                    --teal:#12B892;
                    --teal-dim:#0C8A6E;
                    --gold:#E8AE42;
                    --text-primary:#F4F2FA;
                    --text-secondary:#A6A2C4;
                    --text-muted:#716D96;
                    --danger:#E85C5C;
                    --radius-lg:22px;
                    --radius-md:16px;
                    --radius-sm:10px;
                    --safe-bottom:env(safe-area-inset-bottom,0px);
                }

                .nlp-chat-widget {
                    font-family:'Inter',system-ui,sans-serif;
                    color:var(--text-primary);
                    position:fixed;
                    bottom:0;
                    left:0;
                    right:0;
                    width:100%;
                    max-width: 100vw;
                    height:100%;
                    max-height:86vh;
                    background: radial-gradient(120% 60% at 50% 0%, rgba(18,184,146,0.14), transparent 55%), linear-gradient(180deg, var(--ink) 0%, #0A0920 100%);
                    border-radius:28px 28px 0 0;
                    box-shadow:0 -20px 60px rgba(0,0,0,0.55), 0 -1px 0 var(--border);
                    display:flex;
                    flex-direction:column;
                    animation:nlpRise 0.4s cubic-bezier(.2,.9,.25,1);
                    z-index: 1000;
                    overflow:hidden;
                }
                @media (min-width: 768px) {
                    .nlp-chat-widget {
                        bottom: 80px;
                        right: 24px;
                        left: auto;
                        width: 400px;
                        height: 600px;
                        border-radius: 28px;
                    }
                }
                @keyframes nlpRise{
                    from{transform:translateY(24px);opacity:0;}
                    to{transform:translateY(0);opacity:1;}
                }
                .nlp-chat-widget * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
                
                .nlp-drag-handle{
                    width:38px;height:4px;border-radius:4px;
                    background:rgba(255,255,255,0.15);
                    margin:10px auto 4px;
                    flex-shrink: 0;
                }

                /* assistant intro strip */
                .assistant-strip{
                    display:flex;
                    align-items:center;
                    gap:12px;
                    padding:10px 20px 14px;
                    border-bottom:1px solid var(--border);
                    flex-shrink:0;
                }
                .assistant-avatar{
                    width:44px;height:44px;border-radius:13px;
                    background:linear-gradient(155deg,var(--teal),var(--teal-dim));
                    display:flex;align-items:center;justify-content:center;
                    flex-shrink:0;
                    box-shadow:0 4px 14px rgba(18,184,146,0.35);
                }
                .assistant-avatar svg{width:22px;height:22px;stroke:#04231A;}
                .assistant-meta{flex:1; min-width:0;}
                .assistant-name{font-family:'Sora',sans-serif; font-size:15px; font-weight:600;}
                .assistant-status{
                    display:flex; align-items:center; gap:6px;
                    font-size:12px; color:var(--text-secondary); margin-top:3px;
                }
                .dot-live{width:6px;height:6px;border-radius:50%;background:var(--teal); box-shadow:0 0 0 3px rgba(18,184,146,0.18);}
                .mode-pill{
                    font-size:11px; font-weight:600; color:var(--teal);
                    background:rgba(18,184,146,0.12);
                    border:1px solid rgba(18,184,146,0.3);
                    padding:4px 10px; border-radius:20px;
                    flex-shrink:0;
                }
                .nlp-close-btn{
                    width:30px;height:30px;border-radius:50%;
                    background:rgba(255,255,255,0.05);
                    border:1px solid var(--border);
                    color:var(--text-secondary);
                    display:flex;align-items:center;justify-content:center;
                    cursor:pointer;
                    flex-shrink:0;
                    margin-left: 8px;
                }

                /* chat area */
                .chat{
                    flex:1;
                    overflow-y:auto;
                    padding:20px 16px 14px;
                    display:flex;
                    flex-direction:column;
                    gap:4px;
                }
                .chat::-webkit-scrollbar{width:4px;}
                .chat::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:4px;}

                .msg-row{display:flex; margin-bottom:14px; max-width:100%;}
                .msg-row.bot{justify-content:flex-start;}
                .msg-row.user{justify-content:flex-end;}

                .msg-avatar{
                    width:30px;height:30px;border-radius:9px;
                    background:linear-gradient(155deg,var(--teal),var(--teal-dim));
                    display:flex;align-items:center;justify-content:center;
                    margin-right:9px; flex-shrink:0; margin-top:2px;
                }
                .msg-avatar svg{width:15px;height:15px;stroke:#04231A;}

                .msg-col{display:flex; flex-direction:column; max-width:78%;}
                .msg-row.user .msg-col{align-items:flex-end;}

                .bubble{
                    padding:12px 15px;
                    font-size:14.5px;
                    line-height:1.55;
                    border-radius:var(--radius-md);
                    white-space:pre-wrap;
                }
                .msg-row.bot .bubble{
                    background:var(--bubble-bot);
                    border:1px solid var(--border);
                    border-top-left-radius:5px;
                    color:var(--text-primary);
                }
                .msg-row.user .bubble{
                    background:var(--bubble-user);
                    color:#04231A;
                    font-weight:500;
                    border-top-right-radius:5px;
                }
                .bubble.error{
                    background:rgba(232,92,92,0.1);
                    border:1px solid rgba(232,92,92,0.35);
                }
                .bubble.error .err-title{
                    display:flex; align-items:center; gap:7px;
                    color:var(--danger); font-weight:600; font-size:13px; margin-bottom:5px;
                }
                .bubble.error .err-title svg{width:15px;height:15px; stroke:var(--danger); flex-shrink:0;}

                .msg-time{font-size:11px; color:var(--text-muted); margin-top:5px; padding:0 3px;}

                /* receipt-style perforation divider under bot messages */
                .tear{
                    width:100%; max-width:78%;
                    height:9px;
                    margin:2px 0 0 39px;
                    background-image:radial-gradient(circle, var(--ink) 2.4px, transparent 2.5px);
                    background-size:9px 9px;
                    background-position:0 0;
                    background-repeat:repeat-x;
                    opacity:0.5;
                }

                .nlp-typing{
                    display:flex;align-items:center;gap:4px;
                    padding:6px 3px;
                }
                .nlp-typing span{
                    width:5px;height:5px;border-radius:50%;
                    background:var(--text-muted);
                    animation:nlpTbounce 1.2s infinite;
                }
                .nlp-typing span:nth-child(2){animation-delay:0.15s;}
                .nlp-typing span:nth-child(3){animation-delay:0.3s;}
                @keyframes nlpTbounce{0%,60%,100%{transform:translateY(0);opacity:0.4;}30%{transform:translateY(-4px);opacity:1;}}

                /* quick replies */
                .quick-replies{
                    display:flex;
                    gap:8px;
                    padding:2px 16px 14px;
                    overflow-x:auto;
                    flex-shrink:0;
                    scrollbar-width:none;
                }
                .quick-replies::-webkit-scrollbar{display:none;}
                .chip{
                    display:flex; align-items:center; gap:7px;
                    white-space:nowrap;
                    padding:9px 14px;
                    border-radius:20px;
                    border:1px solid var(--border-strong);
                    background:var(--panel-raised);
                    font-size:13px;
                    color:var(--text-secondary);
                    flex-shrink:0;
                    cursor:pointer;
                    transition:border-color 0.15s;
                }
                .chip:hover{border-color:var(--teal);color:var(--text-primary);}
                .chip svg{width:14px;height:14px; flex-shrink:0;}

                /* input bar - fixed, safe-area aware, nothing clipped */
                .input-bar{
                    flex-shrink:0;
                    background:var(--panel);
                    border-top:1px solid var(--border);
                    padding:10px 12px calc(12px + var(--safe-bottom));
                }
                .input-row{
                    display:flex;
                    align-items:center;
                    gap:8px;
                }
                .mic-btn{
                    width:46px;height:46px;border-radius:50%;
                    background:linear-gradient(155deg,var(--teal),var(--teal-dim));
                    border:none;
                    display:flex;align-items:center;justify-content:center;
                    flex-shrink:0;
                    box-shadow:0 4px 14px rgba(18,184,146,0.3);
                    cursor:pointer;
                    transition:all 0.2s;
                }
                .mic-btn.active {
                    background: linear-gradient(145deg, #ef4444, #dc2626);
                    box-shadow: 0 4px 14px rgba(239,68,68,0.5);
                }
                .mic-btn.active::before{
                    content:"";
                    position:absolute;
                    width: 58px; height: 58px;
                    border-radius:50%;
                    border:1.5px solid #ef4444;
                    opacity:0.55;
                    animation:nlpPulseRing 1.5s infinite;
                }
                .mic-btn svg{width:20px;height:20px; stroke:#04231A; transition:stroke 0.2s;}
                .mic-btn.active svg{stroke:#fff;}

                .text-field{
                    flex:1;
                    min-width:0;
                    height:46px;
                    background:var(--panel-raised);
                    border:1px solid var(--border-strong);
                    border-radius:23px;
                    padding:0 16px;
                    color:var(--text-primary);
                    font-size:14.5px;
                    font-family:'Inter',sans-serif;
                    outline:none;
                }
                .text-field::placeholder{color:var(--text-muted);}

                .send-btn{
                    width:46px;height:46px;border-radius:50%;
                    background:var(--teal);
                    border:none;
                    display:flex;align-items:center;justify-content:center;
                    flex-shrink:0;
                    box-shadow:0 4px 14px rgba(18,184,146,0.35);
                    cursor:pointer;
                }
                .send-btn:disabled{opacity:0.5;cursor:not-allowed;}
                .send-btn svg{width:19px;height:19px; fill:#04231A; margin-left:2px;}

                .lang-note{
                    text-align:center;
                    font-size:11px;
                    color:var(--text-muted);
                    padding-top:9px;
                }
            `}} />

            {/* Backdrop for mobile */}
            <div className="fixed inset-0 bg-black/50 z-[999] md:hidden" onClick={onClose}></div>

            <div className="nlp-chat-widget nlp-widget-vars">
                <div className="nlp-drag-handle"></div>

                <div className="assistant-strip">
                    <div className="assistant-avatar">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>
                    </div>
                    <div className="assistant-meta">
                        <div className="assistant-name">BillGST Assistant</div>
                        <div className="assistant-status"><span className="dot-live"></span>Bolkar ya likhkar, dono chalega</div>
                    </div>
                    <div className="mode-pill">Voice + Text</div>
                    <button className="nlp-close-btn" onClick={onClose}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className="chat" id="thread">
                    {messages.map((msg, idx) => (
                        <React.Fragment key={idx}>
                            <div className={`msg-row ${msg.role === 'user' ? 'user' : 'bot'}`}>
                                {msg.role === 'ai' && (
                                    <div className="msg-avatar">
                                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>
                                    </div>
                                )}
                                <div className="msg-col">
                                    <div className={`bubble ${msg.text.includes('khatam') || msg.text.includes('issue') || msg.text.includes('failed') || msg.text.includes('exhausted') ? 'error' : ''}`}>
                                        {msg.text.includes('khatam') || msg.text.includes('issue') || msg.text.includes('failed') || msg.text.includes('exhausted') ? (
                                            <>
                                                <div className="err-title">
                                                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                                                    Connection issue
                                                </div>
                                                {msg.text}
                                            </>
                                        ) : msg.text}
                                    </div>
                                    <div className="msg-time">{getTime()}</div>
                                </div>
                            </div>
                            {msg.role === 'ai' && <div className="tear"></div>}
                        </React.Fragment>
                    ))}

                    {isProcessing && (
                        <div className="msg-row bot">
                            <div className="msg-avatar">
                                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>
                            </div>
                            <div className="msg-col">
                                <div className="bubble">
                                    <div className="nlp-typing"><span></span><span></span><span></span></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="quick-replies">
                    <div className="chip" onClick={() => handleSend(`${exampleItem} ka bill banao`)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>
                        {exampleItem} ka bill banao
                    </div>
                    <div className="chip" onClick={() => handleSend(`${exampleStaff} ki attendance laga`)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>
                        {exampleStaff} ki attendance laga
                    </div>
                    <div className="chip" onClick={() => handleSend("Aaj ka kharcha 500 add karo")}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18.7 8 13 13.7l-4-4L3 15.7"/></svg>
                        Kharcha 500 add karo
                    </div>
                </div>

                <div className="input-bar">
                    <div className="input-row">
                        <button 
                            className={`mic-btn ${isListening ? 'active' : ''}`}
                            onClick={startListening}
                            disabled={isListening || isProcessing}
                            aria-label="Voice input"
                        >
                            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4"/></svg>
                        </button>
                        <input 
                            className="text-field" 
                            type="text" 
                            placeholder={isListening ? "🎙️ Sun raha hoon... Boliye" : "Type karein…"}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                            className="send-btn" 
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isProcessing}
                            aria-label="Send message"
                        >
                            <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
                        </button>
                    </div>
                    <div className="lang-note">हिंदी • English • Hinglish — jaisa aapko aasan lage</div>
                </div>
            </div>
        </>
    );
}
