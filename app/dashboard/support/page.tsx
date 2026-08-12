'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function SupportAdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Data State
    const [inbox, setInbox] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Input & Attachment State
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [attachOpen, setAttachOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<any[]>([]);

    // Refs
    const scrollRef = useRef<HTMLDivElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // View State (Inbox = true, Chat = false)
    const [showInbox, setShowInbox] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            const email = session?.user?.email;
            if (email !== 'billgstapp@gmail.com' && email !== 'ganshyampaliwal20@gmail.com') {
                router.push('/dashboard');
            } else {
                fetchInbox();
                const interval = setInterval(() => {
                    fetchInbox();
                    if (selectedUser) fetchMessages(selectedUser, false);
                }, 5000);
                return () => clearInterval(interval);
            }
        }
    }, [status, session, router, selectedUser]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, showInbox]);

    const fetchInbox = async () => {
        try {
            const res = await fetch('/api/support/chat');
            if (res.ok) {
                const data = await res.json();
                setInbox(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMessages = async (email: string, showLoading = true) => {
        try {
            const res = await fetch(`/api/support/chat?user_email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSelectUser = (email: string) => {
        setSelectedUser(email);
        fetchMessages(email);
        setShowInbox(false); // Switch to chat view
    };

    const goBack = () => {
        setShowInbox(true);
        setSelectedUser(null);
    };

    // Attachment Handlers
    const toggleAttach = () => setAttachOpen(!attachOpen);

    const triggerFileInput = (type: 'camera' | 'gallery' | 'file') => {
        if (type === 'camera') cameraInputRef.current?.click();
        else if (type === 'gallery') galleryInputRef.current?.click();
        else fileInputRef.current?.click();
        setAttachOpen(false);
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

    const clearAttachments = () => setAttachedFiles([]);

    const handleSend = async () => {
        const text = input.trim();
        const files = [...attachedFiles];

        if ((!text && !files.length) || !selectedUser || isSending) return;
        setIsSending(true);

        try {
            // Send each file
            for (const file of files) {
                const tempMsg = { message: '', attachment_url: file.url, attachment_type: file.type, is_admin: true, created_at: new Date().toISOString() };
                setMessages(prev => [...prev, tempMsg]);

                await fetch('/api/support/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: '', attachment_url: file.url, attachment_type: file.type, target_user_email: selectedUser })
                });
            }

            // Send text
            if (text) {
                const tempMsg = { message: text, is_admin: true, created_at: new Date().toISOString() };
                setMessages(prev => [...prev, tempMsg]);

                await fetch('/api/support/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, target_user_email: selectedUser })
                });
            }

            setInput('');
            clearAttachments();
            await fetchMessages(selectedUser, false);
            await fetchInbox();
        } catch (e) {
            toast.error('Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    const filteredInbox = inbox.filter(c => c.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) || c.message?.toLowerCase().includes(searchTerm.toLowerCase()));

    // Helpers for UI
    const getInitial = (email: string) => email ? email.charAt(0).toUpperCase() : 'U';
    const getColor = (email: string) => {
        const colors = [
            'linear-gradient(135deg,#4f46e5,#7c3aed)',
            'linear-gradient(135deg,#f59e0b,#d97706)',
            'linear-gradient(135deg,#10b981,#059669)',
            'linear-gradient(135deg,#3b82f6,#2563eb)',
            'linear-gradient(135deg,#ec4899,#db2777)'
        ];
        if(!email) return colors[0];
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            hash = email.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const hasText = input.trim().length > 0;
    const hasFiles = attachedFiles.length > 0;
    const canSend = hasText || hasFiles;

    return (
        <div className="support-app-wrapper">
            <style>{`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
.support-app-wrapper {
  --bg: #f2f4fb;
  --white: #fff;
  --ink: #0d0f1c;
  --ink2: #2e3250;
  --ink3: #6b6f90;
  --ink4: #a8adc8;
  --border: #e2e5f0;
  --border2: #cdd0e8;
  --green: #10b981;
  --green-lt: #e6f9f2;
  --green-dk: #059669;
  --indigo: #4f46e5;
  --indigo-lt: #eef0ff;
  --indigo-dk: #3730a3;
  --blue: #3b82f6;
  --red: #ef4444;
  --amber: #f59e0b;
  --r: 16px;
  --rsm: 10px;
  --sh: 0 2px 12px rgba(13,15,28,.07);
  --shmd: 0 6px 24px rgba(13,15,28,.12);
  
  font-family: 'Outfit', sans-serif;
  background: var(--bg);
  max-width: 480px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  box-shadow: 0 0 40px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
}
.support-app-wrapper * { scrollbar-width: thin; scrollbar-color: var(--border) transparent; box-sizing: border-box; }

.s-view { display: none; flex-direction: column; height: 100%; background: var(--bg); }
.s-view.active { display: flex; }

/* INBOX VIEW */
.inbox-topbar { background: linear-gradient(135deg,#1e1b4b,#312e81,#4f46e5); padding: 14px 16px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.logo-box { width: 40px; height: 40px; border-radius: 11px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.logo-box svg { width: 22px; height: 22px; color: #fff; }
.tb-info { flex: 1; }
.tb-biz { font-size: 15px; font-weight: 800; color: #fff; letter-spacing: -.2px; }
.tb-sub { font-size: 10px; color: rgba(255,255,255,.5); font-weight: 500; margin-top: 1px; }

.inbox-hero { background: var(--white); padding: 16px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 13px; flex-shrink: 0; }
.inbox-icon { width: 50px; height: 50px; border-radius: 16px; background: linear-gradient(135deg,var(--indigo),var(--green)); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(79,70,229,.25); flex-shrink: 0; }
.inbox-icon svg { width: 24px; height: 24px; color: #fff; }
.inbox-title { font-size: 20px; font-weight: 900; color: var(--ink); letter-spacing: -.4px; }
.inbox-desc { font-size: 12px; color: var(--ink3); margin-top: 3px; font-weight: 500; }
.inbox-stats { display: flex; gap: 10px; margin-left: auto; flex-shrink: 0; }
.istat { text-align: center; }
.istat-num { font-size: 18px; font-weight: 900; color: var(--indigo); }
.istat-lbl { font-size: 9px; color: var(--ink4); font-weight: 600; text-transform: uppercase; letter-spacing: .4px; }

.inbox-search { padding: 12px 16px; background: var(--white); border-bottom: 1px solid var(--border); flex-shrink: 0; }
.sbox { display: flex; align-items: center; gap: 9px; background: var(--bg); border: 1.5px solid var(--border2); border-radius: var(--rsm); padding: 10px 13px; transition: border-color .15s; }
.sbox:focus-within { border-color: var(--indigo); }
.sbox svg { width: 15px; height: 15px; color: var(--ink4); flex-shrink: 0; }
.sbox input { flex: 1; border: none; outline: none; background: none; font-family: 'Outfit', sans-serif; font-size: 13px; color: var(--ink); }
.sbox input::placeholder { color: var(--ink4); }

.chat-list { flex: 1; overflow-y: auto; padding: 8px 12px 20px; }
.chat-item { display: flex; align-items: center; gap: 12px; background: var(--white); border-radius: var(--r); border: 1px solid var(--border); padding: 13px 14px; margin-bottom: 8px; cursor: pointer; transition: all .18s; box-shadow: var(--sh); animation: itemUp .3s ease both; }
.chat-item:hover { border-color: var(--border2); box-shadow: var(--shmd); transform: translateY(-1px); }
@keyframes itemUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.ci-avatar { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 900; color: #fff; flex-shrink: 0; position: relative; }
.ci-online { position: absolute; bottom: -1px; right: -1px; width: 12px; height: 12px; border-radius: 50%; background: var(--green); border: 2px solid var(--white); }
.ci-info { flex: 1; min-width: 0; }
.ci-email { font-size: 13px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
.ci-preview { font-size: 12px; color: var(--ink3); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ci-preview .you { color: var(--indigo); font-weight: 700; }
.ci-right { text-align: right; flex-shrink: 0; }
.ci-time { font-size: 10px; color: var(--ink4); font-weight: 600; margin-bottom: 5px; }
.ci-badge { width: 20px; height: 20px; border-radius: 50%; background: var(--indigo); color: #fff; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-left: auto; }

/* CHAT VIEW */
#chatView { background: #eef2fb; }
.chat-topbar { background: var(--white); border-bottom: 1px solid var(--border); padding: 12px 14px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; box-shadow: var(--sh); }
.back-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--bg); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background .12s; }
.back-btn:hover { background: var(--border); }
.back-btn svg { width: 18px; height: 18px; color: var(--ink); }
.chat-avt { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; color: #fff; flex-shrink: 0; position: relative; }
.ct-online { position: absolute; bottom: -1px; right: -1px; width: 10px; height: 10px; border-radius: 50%; background: var(--green); border: 2px solid var(--white); }
.chat-topbar-info { flex: 1; min-width: 0; }
.ct-name { font-size: 14px; font-weight: 800; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ct-status { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--green); font-weight: 600; margin-top: 1px; }
.ct-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: blink 2s infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .3; } }

.messages { flex: 1; overflow-y: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 6px; }
.date-label { text-align: center; margin: 8px 0; font-size: 11px; font-weight: 700; color: var(--ink4); }
.date-pill { display: inline-block; background: rgba(255,255,255,.7); border: 1px solid var(--border); border-radius: 99px; padding: 3px 12px; backdrop-filter: blur(4px); }

.msg-row { display: flex; align-items: flex-end; gap: 7px; margin-bottom: 2px; }
.msg-row.sent { flex-direction: row-reverse; }
.msg-avt-small { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0; margin-bottom: 2px; }

.msg-content { max-width: 75%; display: flex; flex-direction: column; }

.bubble { padding: 10px 13px; border-radius: 18px; font-size: 13px; font-weight: 500; line-height: 1.5; position: relative; animation: bubbleIn .25s ease both; word-wrap: break-word; overflow-wrap: break-word; width: fit-content; }
@keyframes bubbleIn { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }
.bubble.sent { background: linear-gradient(135deg,var(--indigo),#6366f1); color: #fff; border-bottom-right-radius: 5px; box-shadow: 0 2px 12px rgba(79,70,229,.25); }
.bubble.received { background: var(--white); color: var(--ink); border-bottom-left-radius: 5px; border: 1px solid var(--border); box-shadow: var(--sh); }
.bubble-time { font-size: 10px; margin-top: 4px; font-weight: 500; display: flex; align-items: center; gap: 3px; }
.bubble.sent .bubble-time { color: rgba(255,255,255,.55); justify-content: flex-end; }
.bubble.received .bubble-time { color: var(--ink4); }
.tick svg { width: 14px; height: 14px; }

.photo-bubble { border-radius: 14px; overflow: hidden; cursor: pointer; border: 2px solid var(--border); box-shadow: var(--sh); animation: bubbleIn .25s ease both; width: fit-content; }
.photo-bubble img { width: 100%; display: block; max-height: 200px; object-fit: cover; }
.photo-info { padding: 7px 10px; background: var(--white); font-size: 11px; color: var(--ink4); font-weight: 600; display: flex; align-items: center; gap: 5px; }

.attachment-preview { background: var(--white); border-top: 1px solid var(--border); padding: 10px 14px; display: none; flex-direction: column; gap: 8px; flex-shrink: 0; }
.attachment-preview.show { display: flex; }
.att-preview-header { display: flex; align-items: center; justify-content: space-between; }
.att-preview-label { font-size: 11px; font-weight: 700; color: var(--ink3); }
.att-close { width: 22px; height: 22px; border-radius: 50%; background: var(--bg); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.att-close svg { width: 11px; height: 11px; color: var(--ink3); }
.att-thumb-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.att-thumb-wrap { position: relative; flex-shrink: 0; }
.att-thumb-wrap img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; border: 2px solid var(--indigo); }
.att-remove { position: absolute; top: -4px; right: -4px; width: 18px; height: 18px; border-radius: 50%; background: var(--red); border: 2px solid var(--white); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.att-remove svg { width: 9px; height: 9px; color: #fff; }

.input-area { background: var(--white); border-top: 1px solid var(--border); padding: 10px 12px 14px; flex-shrink: 0; box-shadow: 0 -2px 12px rgba(13,15,28,.05); }
.attach-opts { display: none; flex-wrap: wrap; gap: 7px; margin-bottom: 10px; padding: 10px 0 4px; border-bottom: 1px solid var(--border); animation: fadeIn .2s ease; }
.attach-opts.show { display: flex; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.att-opt { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 10px 14px; border-radius: 12px; background: var(--bg); border: 1px solid var(--border); cursor: pointer; transition: all .15s; min-width: 72px; }
.att-opt:hover { border-color: var(--indigo); background: var(--indigo-lt); }
.att-opt-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; }
.att-opt-icon svg { width: 18px; height: 18px; }
.att-opt span { font-size: 11px; font-weight: 700; color: var(--ink3); }

.input-row { display: flex; align-items: flex-end; gap: 8px; }
.attach-toggle-btn { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; background: var(--bg); border: 1.5px solid var(--border2); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
.attach-toggle-btn.active { background: var(--indigo-lt); border-color: var(--indigo); }
.attach-toggle-btn svg { width: 18px; height: 18px; color: var(--ink3); }
.attach-toggle-btn.active svg { color: var(--indigo); }
.msg-input-wrap { flex: 1; background: var(--bg); border: 1.5px solid var(--border2); border-radius: 22px; padding: 9px 14px; display: flex; align-items: flex-end; gap: 8px; transition: border-color .15s; }
.msg-input-wrap:focus-within { border-color: var(--indigo); }
.msg-input { flex: 1; border: none; outline: none; background: none; font-family: 'Outfit', sans-serif; font-size: 14px; color: var(--ink); resize: none; max-height: 100px; min-height: 22px; line-height: 1.5; }
.msg-input::placeholder { color: var(--ink4); }
.send-btn { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; background: var(--green); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 14px rgba(16,185,129,.35); transition: all .15s; }
.send-btn:hover { transform: scale(1.05); box-shadow: 0 4px 18px rgba(16,185,129,.45); }
.send-btn svg { width: 18px; height: 18px; color: #fff; }
.voice-btn { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; background: var(--indigo); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 14px rgba(79,70,229,.3); transition: all .15s; }
.voice-btn svg { width: 18px; height: 18px; color: #fff; }
            `}</style>

            {/* INBOX VIEW */}
            <div className={`s-view ${showInbox ? 'active' : ''}`} id="inboxView">
                <div className="inbox-topbar">
                    <div className="logo-box">
                        <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" fill="white" /><rect x="13" y="3" width="8" height="5" rx="2" fill="rgba(255,255,255,.6)" /><rect x="3" y="13" width="8" height="5" rx="2" fill="rgba(255,255,255,.6)" /><rect x="13" y="11" width="8" height="8" rx="2" fill="white" /></svg>
                    </div>
                    <div className="tb-info">
                        <div className="tb-biz">Admin Support</div>
                        <div className="tb-sub">BillGST Control Center</div>
                    </div>
                </div>

                <div className="inbox-hero">
                    <div className="inbox-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                    </div>
                    <div>
                        <div className="inbox-title">Support Inbox</div>
                        <div className="inbox-desc">All user queries and chats</div>
                    </div>
                </div>

                <div className="inbox-search">
                    <div className="sbox">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        <input type="text" placeholder="Search email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="chat-list">
                    {filteredInbox.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ink4)' }}>No chats found.</div>
                    ) : (
                        filteredInbox.map((chat, idx) => (
                            <div key={idx} className="chat-item" onClick={() => handleSelectUser(chat.user_email)}>
                                <div className="ci-avatar" style={{ background: getColor(chat.user_email) }}>
                                    {getInitial(chat.user_email)}
                                    <div className="ci-online"></div>
                                </div>
                                <div className="ci-info">
                                    <div className="ci-email">{chat.user_email}</div>
                                    <div className="ci-preview">
                                        {chat.is_admin ? <span className="you">You: </span> : null}
                                        {chat.attachment_url ? '📷 Photo' : chat.message}
                                    </div>
                                </div>
                                <div className="ci-right">
                                    <div className="ci-time">{new Date(chat.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' })}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* CHAT VIEW */}
            <div className={`s-view ${!showInbox ? 'active' : ''}`} id="chatView">
                <div className="chat-topbar">
                    <button className="back-btn" onClick={goBack}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    </button>
                    <div className="chat-avt" style={{ background: getColor(selectedUser || '') }}>
                        {getInitial(selectedUser || '')}
                        <div className="ct-online"></div>
                    </div>
                    <div className="chat-topbar-info">
                        <div className="ct-name">{selectedUser}</div>
                        <div className="ct-status">
                            <span className="ct-status-dot"></span>
                            Online
                        </div>
                    </div>
                </div>

                <div className="messages" ref={scrollRef}>
                    <div className="date-label"><span className="date-pill">Support Chat Active</span></div>

                    {messages.map((m, i) => {
                        const isSent = m.is_admin;
                        const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div key={i} className={`msg-row ${isSent ? 'sent' : 'received'}`}>
                                {!isSent && <div className="msg-avt-small" style={{ background: getColor(selectedUser || '') }}>{getInitial(selectedUser || '')}</div>}
                                <div className="msg-content">
                                    {m.attachment_url ? (
                                        <div className="photo-bubble" style={{ border: isSent ? '2px solid rgba(99,102,241,.3)' : '' }}>
                                            <img src={m.attachment_url} alt="attachment" />
                                            <div className="photo-info" style={{ background: isSent ? 'rgba(99,102,241,.08)' : '' }}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                                <span style={{ color: isSent ? 'var(--indigo)' : 'var(--ink4)' }}>Photo · {time} {isSent && '✓'}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`bubble ${isSent ? 'sent' : 'received'}`}>
                                            {m.message}
                                            <div className="bubble-time">
                                                {time}
                                                {isSent && <span className="tick"><svg viewBox="0 0 24 24" fill="#93c5fd" width="14" height="14"><path d="M18 7l-1.41-1.41-6.34 6.34-2.83-2.83L6 10.5l4.24 4.24L18 7zm-1.41 5L13 16.59l-1.42-1.41 1.41-1.41L11.58 12l1.41-1.41L14.41 12 18 8.41 19.41 9.82 14.59 12z" /></svg></span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Attachment Preview */}
                <div className={`attachment-preview ${hasFiles ? 'show' : ''}`}>
                    <div className="att-preview-header">
                        <span className="att-preview-label">📎 {attachedFiles.length} Photos attach hai</span>
                        <button className="att-close" onClick={clearAttachments}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="att-thumb-row">
                        {attachedFiles.map((f, i) => (
                            <div key={i} className="att-thumb-wrap">
                                <img src={f.url} alt="preview" />
                                <button className="att-remove" onClick={() => removeAtt(i)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="input-area">
                    <div className={`attach-opts ${attachOpen ? 'show' : ''}`}>
                        <div className="att-opt" onClick={() => triggerFileInput('camera')}>
                            <div className="att-opt-icon" style={{ background: '#dbeafe' }}><svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg></div>
                            <span>Camera</span>
                        </div>
                        <div className="att-opt" onClick={() => triggerFileInput('gallery')}>
                            <div className="att-opt-icon" style={{ background: '#dcfce7' }}><svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg></div>
                            <span>Gallery</span>
                        </div>
                    </div>

                    <div className="input-row">
                        <button className={`attach-toggle-btn ${attachOpen ? 'active' : ''}`} onClick={toggleAttach}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>
                        </button>
                        <div className="msg-input-wrap">
                            <textarea
                                className="msg-input"
                                placeholder="Type a message..."
                                rows={1}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            ></textarea>
                        </div>
                        {canSend ? (
                            <button className="send-btn" onClick={handleSend} disabled={isSending}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            </button>
                        ) : (
                            <button className="voice-btn" onClick={() => toast('Voice feature coming soon!')}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                            </button>
                        )}
                    </div>
                </div>

                <input type="file" ref={cameraInputRef} style={{ display: 'none' }} accept="image/*" capture="environment" multiple onChange={handleFiles} />
                <input type="file" ref={galleryInputRef} style={{ display: 'none' }} accept="image/*" multiple onChange={handleFiles} />
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFiles} />
            </div>
        </div>
    );
}
