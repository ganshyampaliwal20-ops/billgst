'use client';

import { useState, useEffect, useRef } from 'react';
import { FaHeadset, FaPaperPlane, FaTimes, FaSignInAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function SupportChatWidget() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isOpen = useStore((state: any) => state.supportChatOpen);
    const setIsOpen = useStore((state: any) => state.setSupportChatOpen);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const email = session?.user?.email;
    const isAdmin = email === 'billgstapp@gmail.com' || email === 'ganshyampaliwal20@gmail.com';

    // Fetch messages when opened
    useEffect(() => {
        if (isOpen && status === 'authenticated') {
            fetchMessages();
            const interval = setInterval(fetchMessages, 60000); // poll every 60s
            return () => clearInterval(interval);
        }
    }, [isOpen, status]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/support/chat');
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const newAttachments: any[] = [];
        let processed = 0;
        files.forEach(f => {
            const reader = new FileReader();
            reader.onload = (event) => {
                newAttachments.push({
                    type: f.type.startsWith('image/') ? 'image' : 'file',
                    url: event.target?.result,
                    name: f.name
                });
                processed++;
                if (processed === files.length) {
                    setAttachedFiles(prev => [...prev, ...newAttachments]);
                }
            };
            reader.readAsDataURL(f);
        });
        e.target.value = '';
    };

    const removeAtt = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        const text = input.trim();
        const files = [...attachedFiles];

        if ((!text && !files.length) || isLoading) return;

        setIsLoading(true);

        try {
            // Send each file
            for (const file of files) {
                const tempMsg = { message: '', attachment_url: file.url, attachment_type: file.type, is_admin: false, created_at: new Date().toISOString() };
                setMessages(prev => [...prev, tempMsg]);

                await fetch('/api/support/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: '', attachment_url: file.url, attachment_type: file.type })
                });
            }

            // Send text
            if (text) {
                const tempMsg = { message: text, is_admin: false, created_at: new Date().toISOString() };
                setMessages(prev => [...prev, tempMsg]);

                await fetch('/api/support/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text })
                });
            }

            setInput('');
            setAttachedFiles([]);
            await fetchMessages();
        } catch (e) {
            console.error('Failed to send', e);
        } finally {
            setIsLoading(false);
        }
    };

    const hasText = input.trim().length > 0;
    const hasFiles = attachedFiles.length > 0;
    const canSend = hasText || hasFiles;

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div 
                    className="fixed right-3 sm:right-6 z-[100] w-[calc(100vw-24px)] max-w-[360px] h-[520px] max-h-[calc(80vh-env(safe-area-inset-bottom,0px))] bg-slate-50/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col border border-slate-200/80 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
                    style={{
                        bottom: 'calc(24px + env(safe-area-inset-bottom, 16px))'
                    }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 flex justify-between items-center shadow-sm relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
                                <FaHeadset className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[16px] leading-tight drop-shadow-sm">BillGST Support</h3>
                                <p className="text-emerald-50 text-[12px] opacity-90 flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"></span>
                                    We reply quickly
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-emerald-50">
                            <FaTimes className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 p-4 overflow-y-auto scroll-smooth" ref={scrollRef}>
                        {status === 'unauthenticated' ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-sm">
                                    <FaSignInAlt className="w-6 h-6 text-emerald-500" />
                                </div>
                                <p className="mb-5 text-[15px] font-medium text-slate-600">Please log in to chat</p>
                                <button onClick={() => router.push('/login')} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-xl text-[14px] font-semibold shadow-md shadow-emerald-500/20">
                                    Login to Continue
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="text-center">
                                    <span className="inline-block px-3 py-1 bg-white border border-slate-200 text-[11px] font-bold text-slate-400 rounded-full shadow-sm">
                                        Today
                                    </span>
                                </div>
                                {messages.map((m, i) => {
                                    const isSent = !m.is_admin;
                                    return (
                                        <div key={i} className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                            <div 
                                                className={`max-w-[82%] rounded-2xl text-[14px] leading-[1.5] mx-1 break-words whitespace-pre-wrap shadow-sm ${isSent ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-[4px]' : 'bg-white text-slate-700 border border-slate-200/80 rounded-bl-[4px]'}`}
                                                style={{ padding: '12px 16px' }}
                                            >
                                                {m.attachment_url ? (
                                                    <img src={m.attachment_url} alt="attachment" className="max-w-full rounded-xl mb-2 max-h-56 object-cover border border-black/5" />
                                                ) : null}
                                                {m.message && <div>{m.message}</div>}
                                                <div className={`text-[10px] mt-1.5 flex items-center ${isSent ? 'justify-end text-emerald-100' : 'justify-start text-slate-400'} font-medium`}>
                                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isSent && (
                                                        <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    {status === 'authenticated' && (
                        <div className="bg-white border-t border-slate-100 flex flex-col p-1">
                            {attachedFiles.length > 0 && (
                                <div className="flex gap-3 p-3 overflow-x-auto border-b border-slate-50 bg-slate-50/50">
                                    {attachedFiles.map((f, i) => (
                                        <div key={i} className="relative flex-shrink-0 group">
                                            <img src={f.url} alt="preview" className="w-14 h-14 object-cover rounded-xl border-2 border-emerald-100 shadow-sm transition-transform group-hover:scale-105" />
                                            <button onClick={() => removeAtt(i)} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 transition-colors text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">
                                                <FaTimes className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="p-2 flex items-end gap-2">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFiles} />
                                <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors mb-0.5">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>
                                <div className="flex-1 bg-slate-100 border border-slate-200 rounded-[20px] px-4 py-1.5 focus-within:bg-white focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
                                    <textarea
                                        placeholder="Type a message..."
                                        className="w-full bg-transparent text-[14px] outline-none resize-none max-h-24 min-h-[38px] py-2 text-slate-700 placeholder-slate-400 leading-relaxed"
                                        rows={1}
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = (e.target.scrollHeight) + 'px';
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!canSend || isLoading}
                                    className={`w-11 h-11 mb-0.5 rounded-full flex items-center justify-center text-white transition-all shadow-md ${canSend && !isLoading ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30' : 'bg-slate-300 shadow-none cursor-not-allowed'}`}
                                >
                                    <FaPaperPlane className="w-[15px] h-[15px] ml-0.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
