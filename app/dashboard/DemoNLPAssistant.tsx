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

    const processText = (text: string) => {
        const lowerText = text.toLowerCase();
        
        // --- Intent 1: Attendance ---
        const isAttendance = lowerText.match(/\b(attendance|attendence|present|laga|lagao|mark|leave|absent|chutti)\b/i);
        if (isAttendance) {
            // Determine status
            const isAbsent = lowerText.match(/\b(leave|absent|chutti)\b/i);
            const status = isAbsent ? 'ABSENT' : 'PRESENT';
            const actionText = isAbsent ? 'absent' : 'present';

            // Very basic name extraction: remove known keywords using word boundaries
            let name = lowerText
                .replace(/\b(ki|ka|ke|ko|attendance|attendence|present|laga|lagao|mark|karo|kar|bhai|leave|absent|chutti|aaj|aj|do|de|hai|ho|gaya)\b/gi, '')
                .replace(/[^\w\s]/g, '') // remove punctuation
                .trim();
            
            // Clean multiple spaces
            name = name.replace(/\s+/g, ' ').trim();
            // Capitalize first letter
            if (name) {
                name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }

            if (name) {
                // Set data and redirect for Attendance
                setAiDraftData({ type: 'ATTENDANCE', action: actionText, staffName: name, status: status });
                setTimeout(() => router.push('/dashboard/staff'), 1000);
                onClose(); // Close the modal
                return `✅ **Attendance Request!**\n- Name: ${name}\n- Status: ${status}\n\nHaajiri page open ho raha hai...`;
            } else {
                return `Aap attendance lagana chahte hain, par mujhe staff ka naam samajh nahi aaya.`;
            }
        }
        
        // --- Intent 2: Expenses ---
        const isExpense = lowerText.match(/\b(expense|expenses|kharcha)\b/i);
        if (isExpense) {
            // Match numbers for amount
            const amountMatch = lowerText.match(/(\d+)/);
            const amount = amountMatch ? parseInt(amountMatch[1]) : 0;
            
            // Extract description
            let desc = lowerText
                .replace(/\b(expense|expenses|kharcha|me|add|karo|kar|do|diya|rupye|rs|rupees|ko|liye|ke)\b/gi, '')
                .replace(/\d+/g, '') // remove the amount
                .replace(/[^\w\s]/g, '')
                .trim();
                
            desc = desc.replace(/\s+/g, ' ').trim();
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
        else if (lowerText.includes('bill') || lowerText.includes('banao') || lowerText.includes('add')) {
            let customerName = '';
            let item = '';
            
            // Match numbers (digits or words)
            const quantityMatch = lowerText.match(/(\d+)/);
            const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
            
            // Remove quantity to make text simpler
            let processedText = lowerText.replace(/\d+/g, '').trim();
            
            // Pattern 1: X ka Y ka bill (e.g., "ganshyam ka mobile ka bill banao")
            const doubleKaMatch = processedText.match(/(.+?)\s+ka\s+(.+?)\s+ka\s+bill/i);
            
            // Pattern 2: X ke naam se Y ka bill
            const keNaamMatch = processedText.match(/(.+?)\s+ke\s+naam\s+se\s+(.+?)\s*(ka\s+bill|bill)/i);
            
            if (doubleKaMatch) {
                customerName = doubleKaMatch[1].trim();
                item = doubleKaMatch[2].trim();
            } else if (keNaamMatch) {
                customerName = keNaamMatch[1].trim();
                item = keNaamMatch[2].trim();
            } else {
                // If it's just "X ka bill banao", we can't tell if X is a customer or an item without AI.
                // We'll assume it's an ITEM by default, unless they explicitly say "ke naam"
                const singleNaamMatch = processedText.match(/(.+?)\s+ke\s+naam\s+(ka\s+bill|bill)/i);
                if (singleNaamMatch) {
                    customerName = singleNaamMatch[1].trim();
                } else {
                    item = processedText
                        .replace(/(new|bill|banao|ka|kaa|ke|ek|do|add|karo|create|make)/g, '')
                        .replace(/\s+/g, ' ')
                        .trim();
                }
            }

            // Formatting
            if (customerName) {
                customerName = customerName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }
            if (item) {
                item = item.replace(/(new|bill|banao|ka|kaa|ke|ek|do|add|karo|create|make)/g, '').replace(/\s+/g, ' ').trim();
            }

            if (customerName || item) {
                const payload: any = { type: 'INVOICE', items: [] };
                if (customerName) payload.customerName = customerName;
                if (item) payload.items = [{ name: item, quantity: quantity, rate: 0, amount: 0 }];
                
                // Set data and redirect for Invoice
                setAiDraftData(payload);
                setTimeout(() => router.push('/dashboard/invoices/new'), 1000);
                onClose(); // Close the modal
                
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

    return (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FaBolt className="text-yellow-300" />
                    <h3 className="font-bold">NLP Assistant (Voice+Text)</h3>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                    <FaTimes />
                </button>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 p-4 h-[350px] overflow-y-auto bg-gray-50 flex flex-col gap-3">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 text-gray-500 p-3 rounded-2xl rounded-bl-none shadow-sm text-sm">
                            Soch raha hu... 🤔
                        </div>
                    </div>
                )}
            </div>
            
            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
                <button 
                    onClick={startListening}
                    disabled={isListening || isProcessing}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                        isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Voice Se Boliye"
                >
                    <FaMicrophone />
                </button>
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type karein..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-800"
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isProcessing}
                    className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 disabled:opacity-50 transition-colors shrink-0"
                >
                    <FaPaperPlane className="text-sm mr-0.5" />
                </button>
            </div>
        </div>
    );
}
