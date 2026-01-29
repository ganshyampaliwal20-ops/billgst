'use client';

import { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaMinus, FaExternalLinkAlt, FaLightbulb, FaMicrophone } from 'react-icons/fa';
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

    // Draggable State
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Initialize position to bottom-right on mount
        if (typeof window !== 'undefined') {
            setPosition({
                x: window.innerWidth - 420, // 400px width + 20px margin
                y: window.innerHeight - 600 // 550px height + margin
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
        e.preventDefault(); // Prevent scrolling on touch

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

    if (!isOpen) {
        return (
            <button
                onClick={() => {
                    setIsOpen(true);
                    // Reset position if off-screen or weird
                    if (position.x === 0 && position.y === 0) {
                        setPosition({
                            x: window.innerWidth - 90 < 400 ? 20 : window.innerWidth - 420,
                            y: window.innerHeight - 600
                        });
                    }
                }}
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[100] group"
            >
                <FaRobot size={28} className="group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
            </button>
        );
    }

    return (
        <div
            style={{ left: position.x, top: position.y }}
            className={`fixed w-[90vw] sm:w-[400px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 z-[100] transition-height overflow-hidden flex flex-col ${isMinimized ? 'h-16' : 'h-[550px]'}`}
        >
            {/* Header - DRAGGABLE */}
            <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 flex items-center justify-between text-white shrink-0 cursor-move"
            >
                <div className="flex items-center gap-3 pointer-events-none">
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
                    {/* Chat Area - Added Padding 8px */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-[8px] space-y-4 bg-slate-50/50" style={{ paddingLeft: '8px', paddingRight: '0px', paddingTop: '8px' }}>
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
                            <div className="flex justify-start" style={{ paddingLeft: '8px', paddingRight: '0px', paddingTop: '8px' }}>
                                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                </div>
                            </div>
                        )}

                        {/* Quick Suggestions */}
                        {messages.length < 3 && (
                            <div className="flex flex-wrap gap-2 pt-2 p-[8px]" style={{ paddingLeft: '8px', paddingRight: '0px', paddingTop: '5px' }}>
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
                    <div className="p-[8px] bg-white border-t border-slate-100 shrink-0">
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
                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" style={{ paddingLeft: '8px', paddingRight: '0px', paddingTop: '8px' }}
                                title="Boliye (Voice)"
                            >
                                <FaMicrophone />
                            </button>
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
