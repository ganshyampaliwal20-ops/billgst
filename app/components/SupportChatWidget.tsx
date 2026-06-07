'use client';

import { useState, useEffect, useRef } from 'react';
import { FaHeadset, FaPaperPlane, FaTimes, FaSignInAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SupportChatWidget() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const email = session?.user?.email;
    const isAdmin = email === 'gpaliwal59@gmail.com' || email === 'ganshyampaliwal20@gmail.com';

    // Fetch messages when opened
    useEffect(() => {
        if (isOpen && status === 'authenticated') {
            fetchMessages();
            // Optional: Set an interval to poll for new messages
            const interval = setInterval(fetchMessages, 10000);
            return () => clearInterval(interval);
        }
    }, [isOpen, status]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/support/chat');
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (e) {
            console.error('Failed to fetch support chats', e);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        // Optimistic UI update
        const tempMsg = { message: userMsg, is_admin: false, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, tempMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/support/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            if (!res.ok) throw new Error('Failed to send');
            await fetchMessages(); // refresh
        } catch (e) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isAdmin) return null;

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-4 z-[999] w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(5,150,105,0.3)] hover:scale-110 transition-transform active:scale-95 ${isOpen ? 'hidden' : ''}`}
                title="Support Chat"
            >
                <FaHeadset size={24} />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-4 right-4 sm:right-6 z-[1000] w-[350px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px] max-h-[80vh] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-emerald-600 p-4 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <FaHeadset size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm leading-tight">Admin Support</h4>
                                <div className="text-[11px] text-emerald-100 flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span>
                                    We typically reply fast
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors">
                            <FaTimes size={16} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {status === 'unauthenticated' ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <FaHeadset size={40} className="text-slate-300 mb-4" />
                                <p className="text-center mb-4 text-sm px-4">Please login or create an account to chat with our support team.</p>
                                <button onClick={() => router.push('/login')} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                                    <FaSignInAlt />
                                    Login to Chat
                                </button>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm mt-10">
                                Send us a message and we'll get back to you!
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <div key={i} className={`flex ${!m.is_admin ? 'justify-end' : 'justify-start'} mx-2`}>
                                    <div className={`max-w-[85%] text-sm leading-relaxed p-3 break-words overflow-hidden ${!m.is_admin
                                        ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none shadow-sm'
                                        : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-none shadow-sm'
                                        }`}
                                    >
                                        <div className="whitespace-pre-wrap break-words">{m.message}</div>
                                        <div className={`text-[9px] mt-1 ${!m.is_admin ? 'text-emerald-200 text-right' : 'text-slate-400'}`}>
                                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    {status === 'authenticated' && (
                        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-slate-700"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                >
                                    <FaPaperPlane size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
