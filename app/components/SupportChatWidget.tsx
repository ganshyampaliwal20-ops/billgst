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
    const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const email = session?.user?.email;
    const isAdmin = email === 'gpaliwal59@gmail.com' || email === 'ganshyampaliwal20@gmail.com';

    // Fetch messages when opened
    useEffect(() => {
        if (isOpen && status === 'authenticated') {
            fetchMessages();
            const interval = setInterval(fetchMessages, 10000); // poll every 10s
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

    if (isAdmin) return null;

    const hasText = input.trim().length > 0;
    const hasFiles = attachedFiles.length > 0;
    const canSend = hasText || hasFiles;

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-[100] w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">Support Chat</h3>
                            <p className="text-emerald-100 text-xs">We typically reply in a few minutes</p>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-emerald-100 hover:text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 bg-slate-50 p-4 overflow-y-auto" ref={scrollRef}>
                        {status === 'unauthenticated' ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <p className="mb-4">Please log in to chat with support</p>
                                <button onClick={() => router.push('/login')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
                                    Login Now
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="text-center text-xs text-slate-400 mb-2">Today</div>
                                {messages.map((m, i) => {
                                    const isSent = !m.is_admin;
                                    return (
                                        <div key={i} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl p-3 text-sm word-break mx-2 break-words ${isSent ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'}`}>
                                                {m.attachment_url ? (
                                                    <img src={m.attachment_url} alt="attachment" className="max-w-full rounded-lg mb-1 max-h-48 object-cover" />
                                                ) : null}
                                                {m.message && <div>{m.message}</div>}
                                                <div className={`text-[10px] mt-1 text-right ${isSent ? 'text-emerald-200' : 'text-slate-400'}`}>
                                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        <div className="bg-white border-t border-slate-200 flex flex-col">
                            {attachedFiles.length > 0 && (
                                <div className="flex gap-2 p-2 overflow-x-auto border-b border-slate-100">
                                    {attachedFiles.map((f, i) => (
                                        <div key={i} className="relative flex-shrink-0">
                                            <img src={f.url} alt="preview" className="w-12 h-12 object-cover rounded-md border border-emerald-200" />
                                            <button onClick={() => removeAtt(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="p-3 flex items-center gap-2">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFiles} />
                                <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-emerald-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!canSend || isLoading}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors ${canSend && !isLoading ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
