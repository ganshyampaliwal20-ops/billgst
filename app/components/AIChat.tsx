'use client';

import { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaMinus, FaLightbulb, FaMicrophone } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Namaste! Main BillGST AI Assistant hoon. Business growth ya GST ke baare mein kuch poochna chahte hain?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Draggable State for the Handle
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Initialize position to bottom-right on mount
        if (typeof window !== 'undefined') {
            setPosition({
                x: window.innerWidth - 80,
                y: window.innerHeight - 80
            });
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (e.type === 'touchstart') {
            const touch = (e as React.TouchEvent).touches[0];
            dragStart.current = {
                x: touch.clientX - position.x,
                y: touch.clientY - position.y
            };
        } else {
            dragStart.current = {
                x: (e as React.MouseEvent).clientX - position.x,
                y: (e as React.MouseEvent).clientY - position.y
            };
        }
        setIsDragging(true);
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;

        let clientX, clientY;
        if (e.type === 'touchmove') {
            const touch = (e as TouchEvent).touches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        setPosition({
            x: clientX - dragStart.current.x,
            y: clientY - dragStart.current.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

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

    return (
        <>
            {/* Draggable Floating Robot Handle */}
            <div
                style={{
                    left: position.x,
                    top: position.y,
                    touchAction: 'none'
                }}
                className={`fixed z-[1000] ${isOpen ? 'scale-0 pointer-events-none' : 'scale-100'} transition-transform duration-300`}
            >
                <button
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    onClick={() => {
                        if (!isDragging) setIsOpen(true);
                    }}
                    className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group cursor-move"
                >
                    <FaRobot size={28} className="group-hover:rotate-12 transition-transform pointer-events-none" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse pointer-events-none"></div>
                </button>
            </div>

            {/* Centered Chat Boat/Window */}
            {isOpen && (
                <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        className={`w-full max-w-[450px] bg-white rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.4)] border border-slate-200 overflow-hidden flex flex-col transition-all duration-500 transform ${isMinimized ? 'h-16' : 'h-[650px] max-h-[90vh]'}`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-5 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <FaRobot size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-base">BillGST AI Assistant</h4>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">Active Now</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <FaMinus size={14} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <FaTimes size={18} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Chat Area */}
                                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                            <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${m.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                                                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                                                }`}>
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none flex gap-1.5 shadow-sm">
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            </div>
                                        </div>
                                    )}

                                    {messages.length < 3 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {['GST kya hai?', 'Invoice kaise banayein?', 'Stock Manage kaise karein?'].map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => { setInput(s); }}
                                                    className="text-[10px] font-bold bg-white text-indigo-600 px-4 py-2 rounded-full border border-indigo-50 shadow-sm hover:bg-indigo-50 transition-all flex items-center gap-1.5"
                                                >
                                                    <FaLightbulb className="text-amber-500" /> {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-200 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Kuch bhi poochein..."
                                            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-slate-700 font-medium"
                                        />
                                        <button
                                            onClick={() => {
                                                const recognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
                                                recognition.lang = 'hi-IN';
                                                recognition.onstart = () => {
                                                    toast.success('Main sun raha hoon... boliye!', { icon: '🎙️', style: { borderRadius: '15px' } });
                                                };
                                                recognition.onresult = (event: any) => {
                                                    const transcript = event.results[0][0].transcript;
                                                    setInput(transcript);
                                                };
                                                recognition.start();
                                            }}
                                            className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
                                            title="Boliye (Voice)"
                                        >
                                            <FaMicrophone size={18} />
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            disabled={!input.trim() || isLoading}
                                            className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                        >
                                            <FaPaperPlane size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-center text-slate-400 mt-4 font-black uppercase tracking-[0.2em]">BillGST Intelligence</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
