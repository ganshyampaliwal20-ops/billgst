'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import SupportChatWidget from '@/app/components/SupportChatWidget';
import './landing.css';

export default function LandingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // UI States
    const [isEnglish, setIsEnglish] = useState(false);
    const [activeTab, setActiveTab] = useState<'login'|'signup'>('login');
    const [showLoginPwd, setShowLoginPwd] = useState(false);
    const [showSignupPwd, setShowSignupPwd] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ name: '', shopName: '', email: '', password: '', refCode: '' });

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/dashboard');
        }

        if (typeof window !== 'undefined' && window.location.search) {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('login') === 'true') {
                setActiveTab('login');
                document.getElementById('authCard')?.scrollIntoView({behavior:'smooth'});
            } else if (searchParams.get('signup') === 'true') {
                setActiveTab('signup');
                document.getElementById('authCard')?.scrollIntoView({behavior:'smooth'});
            }
            const ref = searchParams.get('ref');
            if (ref) {
                setSignupData(prev => ({ ...prev, refCode: ref }));
                setActiveTab('signup');
                document.getElementById('authCard')?.scrollIntoView({behavior:'smooth'});
            }
        }

        // Scroll reveal logic
        const elements = document.querySelectorAll('.rev');
        let observer: IntersectionObserver | null = null;
        if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('on');
                        observer?.unobserve(e.target);
                    }
                });
            }, { threshold: 0.1 });
            elements.forEach(el => observer?.observe(el));
        } else {
            elements.forEach(el => el.classList.add('on'));
        }

        return () => observer?.disconnect();
    }, [status, router]);

    const doLogin = async () => {
        if (!loginData.email || !loginData.email.includes('@')) {
            toast.error(isEnglish ? 'Please enter a valid email address' : 'कृपया सही ईमेल दर्ज करें');
            return;
        }
        if (!loginData.password || loginData.password.length < 6) {
            toast.error(isEnglish ? 'Please enter your password' : 'कृपया अपना पासवर्ड दर्ज करें');
            return;
        }

        setIsLoading(true);
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: loginData.email,
                password: loginData.password
            });
            if (result?.error) {
                toast.error(isEnglish ? 'Invalid email or password' : 'गलत ईमेल या पासवर्ड');
            } else {
                toast.success(isEnglish ? 'Welcome back!' : 'वापसी पर स्वागत है!');
                router.push('/dashboard');
            }
        } catch (error) {
            toast.error(isEnglish ? 'Something went wrong' : 'कुछ गलत हो गया');
        } finally {
            setIsLoading(false);
        }
    };

    const doSignup = async () => {
        if (!signupData.email || !signupData.email.includes('@')) {
            toast.error(isEnglish ? 'Please enter a valid email address' : 'कृपया सही ईमेल दर्ज करें');
            return;
        }
        if (!signupData.password || signupData.password.length < 6) {
            toast.error(isEnglish ? 'Password must be at least 6 characters' : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: signupData.name || signupData.shopName || 'User',
                    email: signupData.email,
                    password: signupData.password,
                    refCode: signupData.refCode
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(isEnglish ? 'Account created! Logging in...' : 'अकाउंट बन गया! लॉगिन कर रहे हैं...');
                await signIn('credentials', {
                    redirect: false,
                    email: signupData.email,
                    password: signupData.password
                });
                router.push('/dashboard');
            } else {
                toast.error(data.error || 'Registration failed');
            }
        } catch (error) {
            toast.error(isEnglish ? 'Registration failed. Try again.' : 'रजिस्ट्रेशन फेल हुआ। दोबारा कोशिश करें।');
        } finally {
            setIsLoading(false);
        }
    };

    const getStrength = (v: string) => {
        let score = 0;
        if (v.length >= 6) score++;
        if (v.length >= 10) score++;
        if (/[A-Z]/.test(v) && /[0-9]/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;
        return score;
    };
    const pStrength = getStrength(signupData.password);
    const pColors = ['var(--re)', 'var(--or)', 'var(--am)', 'var(--gr)'];

    return (
        <div className="page">
            <div className="status-bar-protector"></div>
            {/* HEADER */}
            <header>
                <a href="#" className="logo">
                    <img src="/logo.png" alt="BillGST" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                    <span className="logo-name">Bill<em>GST</em></span>
                </a>
                <div className="hdr-right">
                    <button className="btn-ghost lang-btn" onClick={() => setIsEnglish(!isEnglish)}>
                        🌐 {isEnglish ? 'EN' : 'HI'}
                    </button>
                    <button className="btn-ghost" onClick={() => { setActiveTab('login'); document.getElementById('authCard')?.scrollIntoView({behavior:'smooth'}); }}>
                        {isEnglish ? 'Log In' : 'लॉगिन'}
                    </button>
                    <button className="btn-v" onClick={() => { setActiveTab('signup'); document.getElementById('authCard')?.scrollIntoView({behavior:'smooth'}); }}>
                        {isEnglish ? 'Start Free' : 'मुफ्त शुरू करें'}
                    </button>
                </div>
            </header>

            {/* HERO & AUTH WRAPPER */}
            <div className="hero-auth-wrapper">
                {/* HERO */}
                <section className="hero">
                <div className="live-chip"><span className="dot"></span><strong>{isEnglish ? '100% Free' : '100% मुफ्त'}</strong> {isEnglish ? 'to start — no card needed' : 'शुरू करने के लिए — कोई कार्ड नहीं चाहिए'}</div>
                <h1>
                    {isEnglish ? (
                        <>The smartest way<br />to run <span className="ac">your shop</span></>
                    ) : (
                        <>अपनी दुकान चलाने का<br /><span className="ac">सबसे स्मार्ट तरीका</span></>
                    )}
                </h1>
                <p className="hero-sub">
                    {isEnglish ? 
                        "GST billing, inventory, staff attendance, expenses — everything in one app, built for Indian shopkeepers." :
                        "जीएसटी बिलिंग, स्टॉक, स्टाफ की हाजिरी, खर्चे — सब कुछ एक ऐप में, भारत के दुकानदारों के लिए बना।"
                    }
                </p>
            </section>

            {/* AUTH CARD */}
            <div className="auth-card" id="authCard">
                <div className="auth-tabs">
                    <button className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>
                        {isEnglish ? 'Log In' : 'लॉगिन'}
                    </button>
                    <button className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => setActiveTab('signup')}>
                        {isEnglish ? 'Create Account' : 'अकाउंट बनाएं'}
                    </button>
                </div>
                <div className="auth-body">

                    {/* LOGIN */}
                    <div className={`auth-pane ${activeTab === 'login' ? 'active' : ''}`}>
                        <div className="auth-greeting">
                            {isEnglish ? 'Welcome back 👋' : 'वापसी पर स्वागत है 👋'} 
                            <span>{isEnglish ? 'Log in to your BillGST account' : 'अपने BillGST अकाउंट में लॉगिन करें'}</span>
                        </div>
                        <div className="field">
                            <label>{isEnglish ? 'Email Address' : 'ईमेल एड्रेस'}</label>
                            <div className="fi">
                                <span className="ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" stroke="#484F66" strokeWidth="1.8" /><path d="M2 8l10 6 10-6" stroke="#484F66" strokeWidth="1.8" /></svg></span>
                                <input type="email" placeholder="you@example.com" value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} autoComplete="email" />
                            </div>
                        </div>
                        <div className="field">
                            <label>{isEnglish ? 'Password' : 'पासवर्ड'}</label>
                            <div className="fi">
                                <span className="ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#484F66" strokeWidth="1.8" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#484F66" strokeWidth="1.8" /></svg></span>
                                <input type={showLoginPwd ? 'text' : 'password'} placeholder={isEnglish ? 'Enter your password' : 'अपना पासवर्ड डालें'} value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} autoComplete="current-password" />
                                <button className="eye" onClick={() => setShowLoginPwd(!showLoginPwd)} type="button">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: showLoginPwd ? 0.4 : 1 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#484F66" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" stroke="#484F66" strokeWidth="1.8" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="forgot"><a href="/forgot-password">{isEnglish ? 'Forgot password?' : 'पासवर्ड भूल गए?'}</a></div>
                        <button className="btn-full" onClick={doLogin} disabled={isLoading}>
                            {isLoading ? (isEnglish ? 'Loading...' : 'लोड हो रहा है...') : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    {isEnglish ? 'Log In to BillGST' : 'BillGST में लॉगिन करें'}
                                </>
                            )}
                        </button>
                        <div className="divider">{isEnglish ? 'or continue with' : 'या इसके साथ जारी रखें'}</div>
                        <button className="btn-g" onClick={() => signIn('google')}>
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            {isEnglish ? 'Continue with Google' : 'गूगल के साथ जारी रखें'}
                        </button>
                        <p className="form-note">{isEnglish ? 'No account yet?' : 'अभी तक अकाउंट नहीं है?'} <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab('signup');}}>{isEnglish ? 'Create one free →' : 'मुफ्त बनाएं →'}</a></p>
                    </div>

                    {/* SIGNUP */}
                    <div className={`auth-pane ${activeTab === 'signup' ? 'active' : ''}`}>
                        <div className="auth-greeting">
                            {isEnglish ? 'Create your free account 🏪' : 'अपना मुफ्त अकाउंट बनाएं 🏪'} 
                            <span>{isEnglish ? 'Set up in 60 seconds — no credit card needed' : '60 सेकंड में सेटअप करें — कोई क्रेडिट कार्ड नहीं चाहिए'}</span>
                        </div>
                        <div className="field">
                            <label>{isEnglish ? 'Full Name' : 'पूरा नाम'}</label>
                            <div className="fi">
                                <span className="ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#484F66" strokeWidth="1.8" /><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="#484F66" strokeWidth="1.8" strokeLinecap="round" /></svg></span>
                                <input type="text" placeholder={isEnglish ? "Ramesh Sharma" : "रमेश शर्मा"} value={signupData.name} onChange={e => setSignupData({...signupData, name: e.target.value})} />
                            </div>
                        </div>
                        <div className="field">
                            <label>{isEnglish ? 'Shop Name' : 'दुकान का नाम'}</label>
                            <div className="fi">
                                <span className="ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#484F66" strokeWidth="1.8" /></svg></span>
                                <input type="text" placeholder={isEnglish ? "Sharma General Store" : "शर्मा जनरल स्टोर"} value={signupData.shopName} onChange={e => setSignupData({...signupData, shopName: e.target.value})} />
                            </div>
                        </div>
                        <div className="field">
                            <label>{isEnglish ? 'Email Address' : 'ईमेल एड्रेस'}</label>
                            <div className="fi">
                                <span className="ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" stroke="#484F66" strokeWidth="1.8" /><path d="M2 8l10 6 10-6" stroke="#484F66" strokeWidth="1.8" /></svg></span>
                                <input type="email" placeholder="you@example.com" value={signupData.email} onChange={e => setSignupData({...signupData, email: e.target.value})} autoComplete="email" />
                            </div>
                        </div>
                        <div className="field">
                            <label>{isEnglish ? 'Password' : 'पासवर्ड'}</label>
                            <div className="fi">
                                <span className="ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#484F66" strokeWidth="1.8" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#484F66" strokeWidth="1.8" /></svg></span>
                                <input type={showSignupPwd ? 'text' : 'password'} placeholder={isEnglish ? "Create a strong password" : "मजबूत पासवर्ड बनाएं"} value={signupData.password} onChange={e => setSignupData({...signupData, password: e.target.value})} autoComplete="new-password" />
                                <button className="eye" onClick={() => setShowSignupPwd(!showSignupPwd)} type="button">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: showSignupPwd ? 0.4 : 1 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#484F66" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" stroke="#484F66" strokeWidth="1.8" /></svg>
                                </button>
                            </div>
                            <div className="pwd-strength">
                                <div className="pwd-bar" style={{ background: pStrength >= 1 ? pColors[pStrength-1] : 'var(--b2)' }}></div>
                                <div className="pwd-bar" style={{ background: pStrength >= 2 ? pColors[pStrength-1] : 'var(--b2)' }}></div>
                                <div className="pwd-bar" style={{ background: pStrength >= 3 ? pColors[pStrength-1] : 'var(--b2)' }}></div>
                                <div className="pwd-bar" style={{ background: pStrength >= 4 ? pColors[pStrength-1] : 'var(--b2)' }}></div>
                            </div>
                        </div>
                        <button className="btn-full" onClick={doSignup} disabled={isLoading}>
                            {isLoading ? (isEnglish ? 'Creating...' : 'बन रहा है...') : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
                                    {isEnglish ? 'Create Free Account' : 'मुफ्त अकाउंट बनाएं'}
                                </>
                            )}
                        </button>
                        <div className="divider">{isEnglish ? 'or sign up with' : 'या इसके साथ साइन अप करें'}</div>
                        <button className="btn-g" onClick={() => signIn('google')}>
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            {isEnglish ? 'Continue with Google' : 'गूगल के साथ जारी रखें'}
                        </button>
                        <p className="form-note">{isEnglish ? 'By signing up you agree to our' : 'साइन अप करके आप हमारी'} <a href="#">{isEnglish ? 'Terms' : 'शर्तों'}</a> &amp; <a href="#">{isEnglish ? 'Privacy Policy' : 'प्राइवेसी पॉलिसी'}</a> {isEnglish ? '' : 'से सहमत होते हैं'}</p>
                    </div>

                </div>
            </div>
            </div> {/* END HERO & AUTH WRAPPER */}

            {/* SCROLLING FEATURE PILLS */}
            <div className="feat-pills">
                <div className="fpill"><span className="dot2" style={{ background: 'var(--v)' }}></span>{isEnglish ? 'GST Billing' : 'जीएसटी बिलिंग'}</div>
                <div className="fpill"><span className="dot2" style={{ background: 'var(--am)' }}></span>{isEnglish ? 'Voice AI' : 'वॉइस एआई'}</div>
                <div className="fpill"><span className="dot2" style={{ background: 'var(--gr)' }}></span>{isEnglish ? 'WhatsApp PDF' : 'व्हाट्सएप पीडीएफ'}</div>
                <div className="fpill"><span className="dot2" style={{ background: 'var(--cy)' }}></span>{isEnglish ? 'Camera → Stock' : 'कैमरा → स्टॉक'}</div>
                <div className="fpill"><span className="dot2" style={{ background: 'var(--re)' }}></span>{isEnglish ? 'Low Stock Alert' : 'लो स्टॉक अलर्ट'}</div>
                <div className="fpill"><span className="dot2" style={{ background: 'var(--or)' }}></span>{isEnglish ? 'Expiry Alert' : 'एक्सपायरी अलर्ट'}</div>
                <div className="fpill"><span className="dot2" style={{ background: 'var(--v)' }}></span>{isEnglish ? 'Attendance' : 'हाजिरी'}</div>
                <div className="fpill"><span className="dot2" style={{ background: 'var(--am)' }}></span>{isEnglish ? 'Expenses' : 'खर्चे'}</div>
            </div>

            <div className="rule"></div>

            {/* ══ HIGHLIGHTED FEATURES ══ */}
            <section className="sec rev">
                <div className="sec-lbl">{isEnglish ? 'Key Features' : 'मुख्य फीचर्स'}</div>
                <div className="sec-title">{isEnglish ? 'Everything your shop needs' : 'आपकी दुकान की हर जरूरत'}</div>
                <p className="sec-sub">{isEnglish ? 'Each feature is built to save you time every single day.' : 'हर फीचर आपका समय बचाने के लिए बनाया गया है।'}</p>

                <div className="hlt-stack">

                    {/* WhatsApp PDF */}
                    <div className="hlt g-hlt">
                        <div className="hlt-icon">💬</div>
                        <h3>{isEnglish ? 'Send Invoice as PDF on WhatsApp' : 'व्हाट्सएप पर पीडीएफ बिल भेजें'}</h3>
                        <p>{isEnglish ? 'Create any bill and send it directly to your customer\'s WhatsApp as a professional PDF — no download, no email, just one tap.' : 'कोई भी बिल बनाएं और सीधे ग्राहक के व्हाट्सएप पर भेजें — बिना डाउनलोड या ईमेल के, सिर्फ एक टैप में।'}</p>
                        <span className="tag">{isEnglish ? 'Instant delivery' : 'तुरंत डिलीवरी'}</span>
                    </div>

                    {/* Camera AI */}
                    <div className="hlt v-hlt">
                        <div className="hlt-icon">📸</div>
                        <h3>{isEnglish ? 'Click a Photo → AI Updates Your Stock' : 'फोटो खींचें → AI स्टॉक अपडेट करेगा'}</h3>
                        <p>{isEnglish ? 'Point your camera at any product or barcode. Our AI reads it automatically and updates your inventory — no manual typing needed.' : 'किसी भी प्रोडक्ट या बारकोड की फोटो लें। हमारा AI उसे पढ़कर खुद स्टॉक अपडेट कर देगा — कुछ टाइप करने की जरूरत नहीं।'}</p>
                        <span className="tag">{isEnglish ? 'AI Powered · New' : 'एआई पावर्ड · नया'}</span>
                    </div>

                    {/* GST Returns */}
                    <div className="hlt a-hlt">
                        <div className="hlt-icon">🧾</div>
                        <h3>{isEnglish ? 'GST Returns — GSTR-1, 3B & 4' : 'जीएसटी रिटर्न — GSTR-1, 3B और 4'}</h3>
                        <p>{isEnglish ? 'All your billing data auto-populates into GST return formats. Download GSTR-1, 3B, and 4 reports ready to upload on the portal.' : 'आपका सारा बिलिंग डेटा खुद-ब-खुद जीएसटी रिटर्न फॉर्मेट में आ जाता है। पोर्टल पर अपलोड करने के लिए तैयार रिपोर्ट डाउनलोड करें।'}</p>
                        <span className="tag">{isEnglish ? 'CA-ready reports' : 'सीए-रेडी रिपोर्ट्स'}</span>
                    </div>

                </div>
            </section>

            <div className="rule"></div>

            {/* ══ ALL FEATURES GRID ══ */}
            <section className="sec rev">
                <div className="sec-lbl">{isEnglish ? 'All Features' : 'सभी फीचर्स'}</div>
                <div className="sec-title">{isEnglish ? 'One app, complete control' : 'एक ऐप, पूरा कंट्रोल'}</div>
                <div className="feat-grid">
                    <div className="fc v">
                        <div className="fci">🧾</div>
                        <h3>{isEnglish ? 'All Invoice Types' : 'सभी तरह के बिल'}</h3>
                        <p>{isEnglish ? 'Tax invoice, proforma, credit note, delivery challan — create any format.' : 'टैक्स इनवॉइस, प्रोफार्मा, क्रेडिट नोट, डिलीवरी चालान — कोई भी बनाएं।'}</p>
                    </div>
                    <div className="fc r">
                        <div className="fci">🔔</div>
                        <h3>{isEnglish ? 'Low Stock Alert' : 'लो स्टॉक अलर्ट'}</h3>
                        <p>{isEnglish ? 'Get notified the moment any item falls below your set quantity.' : 'जैसे ही सामान कम हो, तुरंत अलर्ट पाएं।'}</p>
                    </div>
                    <div className="fc o">
                        <div className="fci">⏰</div>
                        <h3>{isEnglish ? 'Expiry Alert' : 'एक्सपायरी अलर्ट'}</h3>
                        <p>{isEnglish ? 'Track product expiry dates and receive alerts before they expire.' : 'सामान की एक्सपायरी ट्रैक करें और खराब होने से पहले अलर्ट पाएं।'}</p>
                    </div>
                    <div className="fc g">
                        <div className="fci">🕐</div>
                        <h3>{isEnglish ? 'Staff Attendance' : 'स्टाफ हाजिरी'}</h3>
                        <p>{isEnglish ? 'Daily check-in, monthly report, and automatic salary calculation.' : 'रोज की हाजिरी, मंथली रिपोर्ट और खुद सैलरी कैलकुलेशन।'}</p>
                    </div>
                    <div className="fc a">
                        <div className="fci">💰</div>
                        <h3>{isEnglish ? 'Expense Tracking' : 'खर्चे ट्रैक करें'}</h3>
                        <p>{isEnglish ? 'Log every shop expense — rent, utilities, purchases — all in one place.' : 'दुकान का हर खर्च — किराया, बिजली, खरीदारी — एक जगह लिखें।'}</p>
                    </div>
                    <div className="fc c">
                        <div className="fci">📒</div>
                        <h3>{isEnglish ? 'Customer Hisaab' : 'कस्टमर हिसाब'}</h3>
                        <p>{isEnglish ? 'Track who owes you, how much, and since when. Send reminders on WhatsApp.' : 'उधारी का हिसाब रखें और व्हाट्सएप पर रिमाइंडर भेजें।'}</p>
                    </div>
                    <div className="fc v">
                        <div className="fci">🎙️</div>
                        <h3>{isEnglish ? 'Voice Billing AI' : 'वॉइस बिलिंग एआई'}</h3>
                        <p>{isEnglish ? 'Say the item name and quantity — bill is ready. Works in Hindi & English.' : 'सामान का नाम और मात्रा बोलें — बिल तैयार। हिंदी और अंग्रेजी दोनों में।'}</p>
                        <span className="nbadge">AI</span>
                    </div>
                    <div className="fc g">
                        <div className="fci">📊</div>
                        <h3>{isEnglish ? 'Sales Reports' : 'सेल्स रिपोर्ट्स'}</h3>
                        <p>{isEnglish ? 'Daily, weekly, monthly sales breakdown. Know exactly where your money goes.' : 'रोज, हफ्ते और महीने की सेल्स रिपोर्ट। जानें पैसा कहाँ से आ रहा है।'}</p>
                    </div>
                </div>
            </section>

            <div className="rule"></div>

            {/* ══ GST RETURNS ══ */}
            <section className="sec rev">
                <div className="sec-lbl">{isEnglish ? 'GST Filing' : 'जीएसटी फाइलिंग'}</div>
                <div className="sec-title">{isEnglish ? 'GST returns, made simple' : 'जीएसटी रिटर्न, अब आसान'}</div>
                <p className="sec-sub">{isEnglish ? 'BillGST auto-generates all major GST return formats from your billing data. Download and upload directly to the GST portal.' : 'BillGST आपके डेटा से सभी मुख्य जीएसटी रिटर्न बनाता है। डाउनलोड करें और सीधे पोर्टल पर अपलोड करें।'}</p>
                <div className="gst-cards">
                    <div className="gst-card">
                        <div className="gn">GSTR-1</div>
                        <div className="gl">{isEnglish ? 'Outward supplies return' : 'आउटवर्ड सप्लाई रिटर्न'}</div>
                    </div>
                    <div className="gst-card">
                        <div className="gn">GSTR-3B</div>
                        <div className="gl">{isEnglish ? 'Monthly summary return' : 'मासिक समरी रिटर्न'}</div>
                    </div>
                    <div className="gst-card">
                        <div className="gn">GSTR-4</div>
                        <div className="gl">{isEnglish ? 'Composition scheme return' : 'कम्पोजीशन स्कीम रिटर्न'}</div>
                    </div>
                    <div className="gst-card" style={{ width: '110px' }}>
                        <div className="gn" style={{ fontSize: '14px' }}>CA Ready</div>
                        <div className="gl">{isEnglish ? 'Share reports directly with your CA' : 'सीधे अपने CA के साथ रिपोर्ट शेयर करें'}</div>
                    </div>
                </div>
            </section>

            <div className="rule"></div>

            {/* ══ HOW IT WORKS ══ */}
            <section className="sec rev">
                <div className="sec-lbl">{isEnglish ? 'How It Works' : 'यह कैसे काम करता है'}</div>
                <div className="sec-title">{isEnglish ? 'Start in 3 simple steps' : '3 आसान स्टेप्स में शुरू करें'}</div>
                <div className="steps">
                    <div className="step">
                        <div className="snum">1</div>
                        <div className="sinfo">
                            <h3>{isEnglish ? 'Create your free account' : 'अपना मुफ्त अकाउंट बनाएं'}</h3>
                            <p>{isEnglish ? 'Sign up with your email in under a minute. No documents, no credit card, no waiting.' : 'एक मिनट से कम समय में साइन अप करें। ना डॉक्यूमेंट, ना क्रेडिट कार्ड।'}</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="snum">2</div>
                        <div className="sinfo">
                            <h3>{isEnglish ? 'Add your products' : 'अपना सामान जोड़ें'}</h3>
                            <p>{isEnglish ? 'Type them in, or just use your camera — our AI scans and adds them to your inventory automatically.' : 'टाइप करें या कैमरा इस्तेमाल करें — हमारा AI स्कैन करके खुद स्टॉक में जोड़ देगा।'}</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="snum">3</div>
                        <div className="sinfo">
                            <h3>{isEnglish ? 'Bill, share, and grow' : 'बिल बनाएं, शेयर करें और आगे बढ़ें'}</h3>
                            <p>{isEnglish ? 'Create bills by voice or tap, send PDF invoices on WhatsApp, and track everything from your dashboard.' : 'बोलकर या टैप करके बिल बनाएं, व्हाट्सएप पर भेजें और डैशबोर्ड से सब कुछ ट्रैक करें।'}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="rule"></div>

            {/* ══ TESTIMONIALS ══ */}
            <section className="sec rev">
                <div className="sec-lbl">{isEnglish ? 'What shopkeepers say' : 'दुकानदार क्या कहते हैं'}</div>
                <div className="sec-title">{isEnglish ? 'Trusted across India' : 'पूरे भारत का भरोसा'}</div>
                <div className="tscroll">
                    <div className="tcard">
                        <div className="stars">★★★★★</div>
                        <blockquote>{isEnglish ? '"GST billing used to take hours. Now it\'s 5 minutes and the return report is ready automatically. Best app for my shop."' : '"जीएसटी बिलिंग में घंटों लगते थे। अब 5 मिनट में रिटर्न रिपोर्ट तैयार हो जाती है। मेरी दुकान के लिए बेस्ट ऐप।"'}</blockquote>
                        <div className="twho"><div className="tav">RG</div><div><strong>Rajesh Gupta</strong><span>Kirana Store, Patna</span></div></div>
                    </div>
                    <div className="tcard">
                        <div className="stars">★★★★★</div>
                        <blockquote>{isEnglish ? '"The WhatsApp PDF feature is excellent. Customers get a proper invoice instantly and the shop feels much more professional."' : '"व्हाट्सएप पीडीएफ फीचर बहुत बढ़िया है। ग्राहकों को तुरंत पक्का बिल मिल जाता है और दुकान भी ज्यादा प्रोफेशनल लगती है।"'}</blockquote>
                        <div className="twho"><div className="tav">SV</div><div><strong>Sunita Verma</strong><span>Beauty Parlour, Indore</span></div></div>
                    </div>
                    <div className="tcard">
                        <div className="stars">★★★★★</div>
                        <blockquote>{isEnglish ? '"Camera stock update is magic. I just photograph the new stock and it\'s added automatically. Saves me 30 minutes every day."' : '"कैमरा स्टॉक अपडेट तो जादू है। बस नए सामान की फोटो खींचो और वो खुद जुड़ जाता है। रोज मेरे 30 मिनट बचते हैं।"'}</blockquote>
                        <div className="twho"><div className="tav">MJ</div><div><strong>Mohit Jain</strong><span>Medical Store, Jaipur</span></div></div>
                    </div>
                </div>
            </section>

            <div className="rule"></div>

            {/* ══ FAQ ══ */}
            <section className="sec rev">
                <div className="sec-lbl">FAQ</div>
                <div className="sec-title">{isEnglish ? 'Common questions' : 'आम सवाल'}</div>
                <div className="faq">
                    <details open>
                        <summary>{isEnglish ? 'Is BillGST really free?' : 'क्या BillGST सच में मुफ्त है?'}
                            <span className="farr"><svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                        </summary>
                        <p>{isEnglish ? 'Yes. The app is completely free to use. There are no subscription plans or hidden charges.' : 'हाँ। यह ऐप इस्तेमाल करने के लिए पूरी तरह से मुफ्त है। कोई सब्सक्रिप्शन प्लान या छुपे हुए चार्ज नहीं हैं।'}</p>
                    </details>
                    <details>
                        <summary>{isEnglish ? 'Which GST returns can I generate?' : 'मैं कौन से जीएसटी रिटर्न बना सकता हूँ?'}
                            <span className="farr"><svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                        </summary>
                        <p>{isEnglish ? 'BillGST generates GSTR-1, GSTR-3B, and GSTR-4 reports from your billing data. Download and upload directly to the GST portal, or share with your CA.' : 'BillGST आपके डेटा से GSTR-1, GSTR-3B और GSTR-4 बनाता है। इन्हें डाउनलोड करके पोर्टल पर अपलोड करें या CA को भेजें।'}</p>
                    </details>
                    <details>
                        <summary>{isEnglish ? 'How does the camera stock update work?' : 'कैमरा स्टॉक अपडेट कैसे काम करता है?'}
                            <span className="farr"><svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                        </summary>
                        <p>{isEnglish ? 'Click a photo of any product or its barcode. The AI identifies the item and updates the quantity in your inventory — no manual entry needed.' : 'सामान या बारकोड की फोटो लें। हमारा AI उसे पहचान कर खुद स्टॉक अपडेट कर देगा।'}</p>
                    </details>
                    <details>
                        <summary>{isEnglish ? 'Can I send invoices on WhatsApp?' : 'क्या मैं व्हाट्सएप पर बिल भेज सकता हूँ?'}
                            <span className="farr"><svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                        </summary>
                        <p>{isEnglish ? 'Yes. Every invoice can be sent as a PDF directly to any customer\'s WhatsApp number in one tap — no downloads or email required.' : 'हाँ। हर बिल सीधे ग्राहक के व्हाट्सएप पर पीडीएफ के रूप में एक टैप में भेजा जा सकता है।'}</p>
                    </details>
                    <details>
                        <summary>{isEnglish ? 'What types of invoices can I create?' : 'मैं किस तरह के बिल बना सकता हूँ?'}
                            <span className="farr"><svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                        </summary>
                        <p>{isEnglish ? 'Tax invoice, proforma invoice, credit note, debit note, delivery challan — all major invoice formats are supported.' : 'टैक्स इनवॉइस, प्रोफार्मा इनवॉइस, क्रेडिट नोट, डिलीवरी चालान — सभी मुख्य फॉर्मेट उपलब्ध हैं।'}</p>
                    </details>
                    <details>
                        <summary>{isEnglish ? 'How secure is my data?' : 'मेरा डेटा कितना सुरक्षित है?'}
                            <span className="farr"><svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                        </summary>
                        <p>{isEnglish ? 'All data is encrypted with AES-256 encryption — the same standard used by banks. Only you can access your shop\'s data.' : 'सारा डेटा AES-256 के साथ एन्क्रिप्टेड है — वही जो बैंक इस्तेमाल करते हैं। सिर्फ आप ही अपना डेटा देख सकते हैं।'}</p>
                    </details>
                </div>
            </section>

            {/* ══ FINAL CTA ══ */}
            <div className="final rev">
                <h2>{isEnglish ? 'Take your shop digital today' : 'आज ही अपनी दुकान को डिजिटल बनाएं'}</h2>
                <p>{isEnglish ? 'Free account, ready in 60 seconds. No credit card required.' : 'मुफ्त अकाउंट, 60 सेकंड में तैयार। कोई क्रेडिट कार्ड नहीं चाहिए।'}</p>
                <button className="btn-full" onClick={() => { setActiveTab('signup'); document.getElementById('authCard')?.scrollIntoView({behavior:'smooth'}); }}>
                    {isEnglish ? 'Create Free Account →' : 'मुफ्त अकाउंट बनाएं →'}
                </button>
            </div>

            {/* ══ FOOTER ══ */}
            <footer>
                <div className="fbrand">
                    <img src="/logo.png" alt="BillGST" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                    <span className="logo-name" style={{ fontSize: '16px' }}>Bill<em>GST</em></span>
                </div>
                <p className="fdesc">{isEnglish ? 'Smart billing and inventory software built for Indian shopkeepers. Hindi and English both supported.' : 'भारत के दुकानदारों के लिए बना स्मार्ट बिलिंग और इन्वेंट्री सॉफ्टवेयर। हिंदी और अंग्रेज़ी दोनों उपलब्ध।'}</p>
                <a href="https://wa.me/917498571873" className="fwa" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="var(--gr)"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.5 3.58 1.36 5.07L2 22l5.2-1.37a9.85 9.85 0 0 0 4.84 1.26c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2z" /></svg>
                    WhatsApp: +91 74985 71873
                </a>
                <div className="flinks">
                    <div className="fcol">
                        <h5>{isEnglish ? 'Product' : 'प्रोडक्ट'}</h5>
                        <a href="#">{isEnglish ? 'Features' : 'फीचर्स'}</a>
                        <a href="#">{isEnglish ? 'GST Returns' : 'जीएसटी रिटर्न'}</a>
                        <a href="#">{isEnglish ? 'Voice Billing AI' : 'वॉइस बिलिंग एआई'}</a>
                    </div>
                    <div className="fcol">
                        <h5>{isEnglish ? 'Company' : 'कंपनी'}</h5>
                        <a href="#">{isEnglish ? 'About Us' : 'हमारे बारे में'}</a>
                        <a href="#">{isEnglish ? 'Contact' : 'संपर्क करें'}</a>
                        <a href="#">{isEnglish ? 'Privacy Policy' : 'प्राइवेसी पॉलिसी'}</a>
                    </div>
                </div>
                <div className="fbot">
                    <span>© 2026 Ayana Enterprises</span>
                    <span>Made in 🇮🇳 India</span>
                </div>
            </footer>

            {/* WA FAB */}
            <div className="wafab">
                <button className="wabtn" onClick={() => window.open('https://wa.me/917498571873', '_blank')} aria-label="Chat on WhatsApp">
                    <div className="wring"></div>
                    <div className="wring2"></div>
                    <svg viewBox="0 0 24 24" fill="#fff" width="25" height="25"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.5 3.58 1.36 5.07L2 22l5.2-1.37a9.85 9.85 0 0 0 4.84 1.26c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2zm5.8 14.06c-.24.68-1.4 1.34-1.93 1.42-.5.08-1.13.11-1.82-.12-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.18-4.94-4.37-.15-.2-1.18-1.57-1.18-3 0-1.42.74-2.12 1-2.41.26-.29.57-.36.76-.36l.55.01c.18.01.42-.07.65.5.24.58.81 1.99.88 2.13.07.15.12.32.02.51-.1.19-.15.31-.3.47-.15.17-.31.38-.45.51-.15.14-.3.29-.13.58.18.29.8 1.32 1.72 2.13 1.18 1.05 2.18 1.38 2.48 1.53.3.15.48.13.66-.05.18-.18.78-.91 1-1.22.21-.31.42-.26.71-.16.29.1 1.84.87 2.16 1.03.32.16.53.24.61.37.08.13.08.74-.16 1.42z" /></svg>
                </button>
            </div>

            <SupportChatWidget />
        </div>
    );
}
