'use client';

import { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaMinus, FaExternalLinkAlt, FaLightbulb } from 'react-icons/fa';

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Namaste! Main BillGST AI Assistant hoon. Business growth ya GST ke baare mein kuch poochna chahte hain?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.reply || 'Main abhi dhyan nahi de paa raha hoon, kripya thodi der baad koshish karein.' }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Network error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[100] group"
            >
                <FaRobot size={28} className="group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 w-[90vw] sm:w-[400px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 z-[100] transition-all overflow-hidden flex flex-col ${isMinimized ? 'h-16' : 'h-[550px]'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <FaRobot size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">BillGST AI Assistant</h4>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">Online & Active</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <FaMinus size={14} />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <FaTimes size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                </div>
                            </div>
                        )}

                        {/* Quick Suggestions */}
                        {messages.length < 3 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {['GST kya hai?', 'Invoice kaise banayein?', 'Stock Manage kaise karein?'].map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setInput(s); }}
                                        className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                    >
                                        <FaLightbulb /> {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Kuch bhi poochein..."
                                className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-slate-700"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </div>
                        <p className="text-[9px] text-center text-slate-400 mt-2 font-bold uppercase tracking-widest">Powered by BillGST Intelligence</p>
                    </div>
                </>
            )}
        </div>
    );
}
