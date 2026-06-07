'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaPaperPlane, FaHeadset, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function SupportAdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [inbox, setInbox] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            const email = session?.user?.email;
            if (email !== 'gpaliwal59@gmail.com' && email !== 'ganshyampaliwal20@gmail.com') {
                router.push('/dashboard'); // Not authorized
            } else {
                fetchInbox();
                const interval = setInterval(() => {
                    fetchInbox(false);
                    if (selectedUser) fetchMessages(selectedUser, false);
                }, 10000);
                return () => clearInterval(interval);
            }
        }
    }, [status, session, router, selectedUser]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchInbox = async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const res = await fetch('/api/support/chat');
            if (res.ok) {
                const data = await res.json();
                setInbox(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    const fetchMessages = async (email: string, showLoading = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const res = await fetch(`/api/support/chat?user_email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    const handleSelectUser = (email: string) => {
        setSelectedUser(email);
        fetchMessages(email);
    };

    const handleSend = async () => {
        if (!input.trim() || !selectedUser || isSending) return;

        const adminMsg = input.trim();
        const tempMsg = { message: adminMsg, is_admin: true, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, tempMsg]);
        setInput('');
        setIsSending(true);

        try {
            const res = await fetch('/api/support/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: adminMsg, target_user_email: selectedUser })
            });
            if (!res.ok) throw new Error('Failed to send');
            await fetchMessages(selectedUser, false);
            await fetchInbox(false);
        } catch (e) {
            toast.error('Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    const filteredInbox = inbox.filter(c => c.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) || c.message?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto h-[calc(100vh-64px)] flex flex-col">
            <div className="flex items-center gap-3 mb-6 shrink-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <FaHeadset size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Support Inbox</h1>
                    <p className="text-sm text-slate-500">Manage user queries and support chats</p>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex h-full min-h-0">
                {/* Left Sidebar - Inbox List */}
                <div className="w-[350px] border-r border-slate-200 flex flex-col bg-slate-50 shrink-0">
                    <div className="p-4 border-b border-slate-200 shrink-0">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search email or message..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {isLoading && inbox.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">Loading inbox...</div>
                        ) : filteredInbox.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">No chats found.</div>
                        ) : (
                            filteredInbox.map((chat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectUser(chat.user_email)}
                                    className={`w-full text-left p-4 border-b border-slate-100 hover:bg-emerald-50 transition-colors flex gap-3 ${selectedUser === chat.user_email ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                                        <FaUserCircle size={24} className="text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <div className="font-semibold text-slate-800 text-sm truncate">{chat.user_email}</div>
                                            <div className="text-[10px] text-slate-400 shrink-0 ml-2">
                                                {new Date(chat.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500 truncate">
                                            {chat.is_admin ? <span className="text-emerald-600 font-medium">You: </span> : ''}
                                            {chat.message}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Area - Chat Detail */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-[72px] px-6 border-b border-slate-200 flex items-center gap-3 shrink-0 bg-white">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                    <FaUserCircle size={24} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800">{selectedUser}</h2>
                                    <div className="text-xs text-emerald-600 font-medium">Active Support Chat</div>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.is_admin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] p-4 mx-2 break-words overflow-hidden ${m.is_admin
                                            ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none shadow-md'
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-none shadow-sm'
                                            }`}
                                        >
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.message}</div>
                                            <div className={`text-[10px] mt-2 ${m.is_admin ? 'text-emerald-200 text-right' : 'text-slate-400'}`}>
                                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                                <div className="flex gap-2">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Type your reply here... (Press Enter to send)"
                                        className="flex-1 resize-none h-[52px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-colors custom-scrollbar"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isSending}
                                        className="w-[52px] h-[52px] bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-colors shrink-0 shadow-sm"
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                <FaHeadset size={32} className="text-slate-300" />
                            </div>
                            <p>Select a chat from the inbox to reply</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
