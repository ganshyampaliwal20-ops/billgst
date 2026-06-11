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

    // States for Modals and Interactivity
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [yearly, setYearly] = useState(false);
    const [activeTab, setActiveTab] = useState('stock');
    const [scrolled, setScrolled] = useState(false);
    const [isMobMenuOpen, setIsMobMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnglish, setIsEnglish] = useState(false);
    const [showExitPopup, setShowExitPopup] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    // Form States
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ name: '', email: '', password: '', refCode: '' });
    const [isVideoMuted, setIsVideoMuted] = useState(true);

    // Exit Intent Logic
    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !sessionStorage.getItem('exitPopupShown')) {
                setShowExitPopup(true);
                sessionStorage.setItem('exitPopupShown', 'true');
            }
        };
        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, []);

    // Prices Data
    const prices = [{ m: 0, y: 0 }, { m: 99, y: 99 }, { m: 299, y: 299 }];

    useEffect(() => {
        // Check standalone mode
        if (typeof window !== 'undefined') {
            setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
        }

        // Redirect if authenticated
        if (status === 'authenticated') {
            router.push('/dashboard');
        }

        // Open modal based on URL query parameter
        if (typeof window !== 'undefined' && window.location.search) {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('login') === 'true') {
                setIsLoginOpen(true);
            } else if (searchParams.get('signup') === 'true') {
                setIsSignupOpen(true);
            }
            const ref = searchParams.get('ref');
            if (ref) {
                setSignupData(prev => ({ ...prev, refCode: ref }));
                setIsSignupOpen(true);
            }
        }

        // Scroll listener for navbar
        const handleScroll = () => {
            setScrolled(window.scrollY > 60);
        };
        window.addEventListener('scroll', handleScroll);

        // Initial animations (IntersectionObserver replacement)
        const elements = document.querySelectorAll('.fi');

        let observer: IntersectionObserver | null = null;
        if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
            observer = new IntersectionObserver((entries) => {
                for (let i = 0; i < entries.length; i++) {
                    if (entries[i].isIntersecting) entries[i].target.classList.add('v');
                }
            }, { threshold: 0.1 });

            for (let i = 0; i < elements.length; i++) {
                if (observer) observer.observe(elements[i]);
            }
        } else {
            // Fallback for older browsers: show all elements immediately
            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.add('v');
            }
        }

        // Failsafe for mobile: 1.5 seconds later force show everything in case observer failed
        const failsafe = setTimeout(() => {
            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.add('v');
            }
        }, 1500);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (observer) observer.disconnect();
            clearTimeout(failsafe);
        };
    }, [status, router]);

    const openM = (t: string) => {
        if (t === 'login') setIsLoginOpen(true);
        if (t === 'signup') setIsSignupOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeM = (t: string) => {
        if (t === 'login') setIsLoginOpen(false);
        if (t === 'signup') setIsSignupOpen(false);
        document.body.style.overflow = '';
    };

    const switchM = (to: string) => {
        setIsLoginOpen(false);
        setIsSignupOpen(false);
        setTimeout(() => openM(to), 220);
    };

    const doLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: loginData.email,
                password: loginData.password
            });
            if (result?.error) {
                toast.error('Invalid email or password');
            } else {
                toast.success('Welcome back!');
                router.push('/dashboard');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const doSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupData)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Account created! Logging in...');
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
            toast.error('Registration failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="landing-body">
            {/* NAV */}
            <nav className="landing-nav" id="nav" style={{ 
                background: scrolled ? 'rgba(6,8,15,0.97)' : 'rgba(6,8,15,0.8)',
                paddingTop: isStandalone ? 'env(safe-area-inset-top, 44px)' : '0',
                height: isStandalone ? 'auto' : '66px',
                minHeight: '66px',
                paddingBottom: isStandalone ? '10px' : '0'
            }}>
                <a href="#" className="logo">
                    <img src="/logo.png" alt="BillGST Logo" />
                    <span className="logo-name">BillGST</span>
                </a>
                <ul className="nav-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/privacy">Privacy Policy</a></li>
                </ul>
                <div className="nav-end">
                    <div className="lang-wrap">
                        <button className="lang-btn" onClick={() => setIsEnglish(!isEnglish)}>
                            {isEnglish ? '🌐 English' : '🌐 Hindi'}
                        </button>
                    </div>
                    <button className="btn-ghost" onClick={() => openM('login')}>{isEnglish ? 'Login' : 'लॉगिन'}</button>
                    <button className="btn-cta" onClick={() => openM('signup')}>{isEnglish ? 'Free Signup' : 'मुफ्त साइन अप'}</button>
                </div>
                <div className="ham" onClick={() => setIsMobMenuOpen(!isMobMenuOpen)}>
                    <span style={{ transform: isMobMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : '' }}></span>
                    <span style={{ opacity: isMobMenuOpen ? 0 : 1 }}></span>
                    <span style={{ transform: isMobMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '' }}></span>
                </div>
            </nav>

            {/* MOBILE MENU */}
            <div className={`mob-menu ${isMobMenuOpen ? 'open' : ''}`}>
                <a href="#features" onClick={() => setIsMobMenuOpen(false)}>Features</a>
                <a href="#pricing" onClick={() => setIsMobMenuOpen(false)}>Pricing</a>
                <a href="/about" onClick={() => setIsMobMenuOpen(false)}>About Us</a>
                <a href="/privacy" onClick={() => setIsMobMenuOpen(false)}>Privacy Policy</a>
                <button className="btn-ghost" onClick={() => { openM('login'); setIsMobMenuOpen(false); }} style={{ marginTop: '10px', background: 'rgba(59, 130, 246, 0.2)', color: '#fff', border: '1px solid rgba(59, 130, 246, 0.5)', padding: '10px 20px', borderRadius: '8px', width: '100%' }}>{isEnglish ? 'Login' : 'लॉगिन'}</button>
                <button className="btn-hero" onClick={() => { openM('signup'); setIsMobMenuOpen(false); }} style={{ marginTop: '10px', width: '100%' }}>{isEnglish ? 'Sign Up' : 'साइन अप'}</button>
            </div>

            {/* HERO */}
            <section className="hero">
                <div className="hero-pill">
                    <span className="chip">New</span>
                    <span>Voice Billing AI is now live! 🎙️</span>
                </div>
                <h1 className="">
                    {isEnglish ? (
                        <>
                            Smart Billing Software for <br />
                            <span className="g1">India's Businesses</span> <br />
                            No More <span className="g2">GST</span> Tension.
                        </>
                    ) : (
                        <>
                            India की दुकान के लिए <br />
                            <span className="g1">Smart Billing Software</span> <br />
                            पर अब <span className="g2">GST</span> की कोई टेंशन नहीं।
                        </>
                    )}
                </h1>
                <p className="hero-desc">
                    {isEnglish ? 
                        "BillGST is an easy Billing & Inventory App that makes your business digital. With Free Invoices, Stock Alerts, and WhatsApp Billing." :
                        "BillGST एक आसान Billing & Inventory App है जो आपकी दुकान को Digital बनाता है। Free Invoices, Stock Alert, और WhatsApp Billing के साथ।"
                    }
                </p>
                <div className="hero-actions" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '20px', width: '100%' }}>
                    <button className="btn-hero" style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #7C6EF7 100%)', padding: '18px 36px', fontSize: '18px', fontWeight: '800', borderRadius: '16px', boxShadow: '0 10px 30px rgba(79, 142, 247, 0.4)', color: 'white', border: 'none', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => openM('signup')}>
                        <span style={{fontSize: '24px'}}>🚀</span> {isEnglish ? "Create Free Account" : "नया फ्री अकाउंट बनाएं"}
                    </button>

                    <button className="btn-hero2" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '18px 36px', fontSize: '18px', borderRadius: '16px', fontWeight: '600', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => openM('login')}>
                        <span style={{fontSize: '22px'}}>👋</span> {isEnglish ? "Login to Dashboard" : "डैशबोर्ड में लॉगिन करें"}
                    </button>

                    <a href="https://play.google.com/store/apps/details?id=in.billgst.app" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#000', color: '#fff', padding: '12px 28px', borderRadius: '16px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                        <svg viewBox="0 0 512 512" width="28" height="28"><path fill="#4caf50" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/><path fill="#03a9f4" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"/><path fill="#ffeb3b" d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z"/><path fill="#f44336" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, lineHeight: 1 }}>GET IT ON</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1.2 }}>Google Play</div>
                        </div>
                    </a>
                </div>
                <p className="hero-note" style={{ marginBottom: '20px' }}>✦ {isEnglish ? "Starter plan includes 30 free GST Bills every month" : "Starter plan में 30 GST Bills हर महीने बिल्कुल मुफ्त"}</p>

                {/* TRUST SIGNALS */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '10px', marginBottom: '50px', position: 'relative', zIndex: 10, animation: 'fadeUp 0.6s ease 0.5s both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 18px', borderRadius: '50px', border: '1px solid rgba(16, 185, 129, 0.25)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)' }}>
                        <span style={{ fontSize: '18px' }}>🔒</span>
                        <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '700', letterSpacing: '0.3px' }}>100% Secure & Encrypted</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(79, 142, 247, 0.1)', padding: '8px 18px', borderRadius: '50px', border: '1px solid rgba(79, 142, 247, 0.25)', boxShadow: '0 4px 15px rgba(79, 142, 247, 0.1)' }}>
                        <span style={{ fontSize: '18px' }}>🛡️</span>
                        <span style={{ fontSize: '14px', color: '#4F8EF7', fontWeight: '700', letterSpacing: '0.3px' }}>Bank-Level Security</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 18px', borderRadius: '50px', border: '1px solid rgba(245, 158, 11, 0.25)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)' }}>
                        <span style={{ fontSize: '18px' }}>📜</span>
                        <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '700', letterSpacing: '0.3px' }}>Independent (Not Govt. Affiliated)</span>
                    </div>
                </div>

                {/* DASHBOARD PREVIEW */}
                <div className="db-wrap" style={{ background: 'transparent', padding: '0', border: 'none', boxShadow: 'none' }}>
                    <div className="db-glow" style={{ top: '20%', height: '60%' }}></div>
                    <div className="db-frame" style={{ background: '#0f172a', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', position: 'relative' }}>
                        <div className="db-bar">
                            <span className="dot r"></span><span className="dot y"></span><span className="dot g"></span>
                            <div className="db-url">app.billgst.in/<b>dashboard</b></div>
                        </div>
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/CMzc3B2kilk?autoplay=1&mute=${isVideoMuted ? 1 : 0}&loop=1&playlist=CMzc3B2kilk&controls=1&modestbranding=1&rel=0&showinfo=0`} 
                            title="BillGST Dashboard Preview" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            style={{ aspectRatio: '16/9', display: 'block', objectFit: 'cover' }}
                        ></iframe>
                        <button 
                            onClick={() => setIsVideoMuted(!isVideoMuted)}
                            style={{
                                position: 'absolute', bottom: '24px', left: '24px', zIndex: 10,
                                background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
                                padding: '10px 20px', borderRadius: '50px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
                                backdropFilter: 'blur(8px)', fontWeight: 'bold', transition: 'all 0.2s',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                        >
                            {isVideoMuted ? '🔇 Unmute Video' : '🔊 Mute Video'}
                        </button>
                    </div>
                </div>
            </section>

            {/* REFER & EARN SECTION */}
            <section className="sec" style={{ padding: '80px 20px', background: '#0a0f1c' }}>
                <div className="sec-in" style={{ maxWidth: '800px', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(249, 115, 22, 0.05))', border: '1px solid rgba(234, 88, 12, 0.3)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎁</div>
                    <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '15px', color: '#fff' }}>Refer & Earn Program</h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', marginBottom: '30px', lineHeight: '1.6' }}>
                        Dost ko refer karo aur dono pao ₹500 ka seedha discount apne Premium Plan par. Koi limit nahi, jitne refer karoge utna kamaoge!
                    </p>
                    <button className="btn-hero" style={{ margin: '0 auto', background: '#ea580c', padding: '14px 32px', fontSize: '18px', borderRadius: '12px' }} onClick={() => openM('signup')}>
                        Generate Referral Link
                    </button>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="sec" id="testimonials" style={{ background: '#0a0f1c' }}>
                <div className="sec-in">
                    <div className="tc">
                        <div className="tag">Customer Love</div>
                        <h2 className="sec-h">भारत के हज़ारों दुकानदारों की पहली पसंद</h2>
                    </div>
                    <div className="testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '40px' }}>
                        <div className="testi-card" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: '#fbbf24', fontSize: '20px', marginBottom: '12px' }}>★★★★★</div>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>"Pehle copy me hisab likhne me bahut time jata tha. BillGST se ab 10 second me WhatsApp par bill bhej deta hu. Stock bhi maintain rahata hai."</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4F8EF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>R</div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Ramesh Gupta</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Ramesh Kirana Store, Pune</div>
                                </div>
                            </div>
                        </div>
                        <div className="testi-card" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: '#fbbf24', fontSize: '20px', marginBottom: '12px' }}>★★★★★</div>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>"Voice billing feature toh kamaal hai! Tyohar ke time bhid me bas bol ke bill ban jata hai. Bahut easy software hai."</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Amit Sharma</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Sharma Electronics, Delhi</div>
                                </div>
                            </div>
                        </div>
                        <div className="testi-card" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: '#fbbf24', fontSize: '20px', marginBottom: '12px' }}>★★★★★</div>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>"Udhar ka hisab rakhna bahut asan ho gaya hai. Ek click me party ko udhar ka PDF chala jata hai. Must use app for shopkeepers!"</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>V</div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Vikash Patel</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Patel Garments, Surat</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS / GUIDE */}
            <section className="sec" id="guide">
                <div className="sec-in">
                    <div className="tc">
                        <div className="tag">Quick Guide</div>
                        <h2 className="sec-h">BillGST का उपयोग करना बहुत आसान है</h2>
                        <p className="sec-p">सिर्फ 3 आसान स्टेप्स में अपनी दुकान डिजिटल बनाएं।</p>
                    </div>
                    <div className="step-grid">
                        <div className="step-card">
                            <div className="s-num">1</div>
                            <div className="s-icon">📦</div>
                            <h4>Product Add करें</h4>
                            <p>बस "Add Product" पर क्लिक करें, नाम और रेट डालें। आपका Stock तैयार है!</p>
                        </div>
                        <div className="step-card">
                            <div className="s-num">2</div>
                            <div className="s-icon">📝</div>
                            <h4>Invoice बनाएं</h4>
                            <p>Customer और Items चुनें। GST अपने आप कैलकुलेट हो जाएगा।</p>
                        </div>
                        <div className="step-card">
                            <div className="s-num">3</div>
                            <div className="s-icon">📲</div>
                            <h4>WhatsApp भेजें</h4>
                            <p>एक क्लिक में बिल सीधे कस्टमर के WhatsApp पर भेजें।</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MAGIC FEATURES SHOWCASE */}
            <section className="sec magic-sec">
                <div className="sec-in">
                    <div className="magic-flex">
                        <div className="magic-content">
                            <div className="tag magic-tag">AI Powered</div>
                            <h2 className="sec-h">BillGST AI — बोलकर बिल बनाएं</h2>
                            <p className="magic-p">टाइप करने की कोई ज़रूरत नहीं! हमारी AI तकनीक से आप वैसे ही बिल बना सकते हैं जैसे आप किसी से बात करते हैं।</p>

                            <div className="magic-features-list">
                                <div className="mf-item">
                                    <div className="mf-icon">🎙️</div>
                                    <div className="mf-text">
                                        <h4>Voice Billing</h4>
                                        <p>"1 किलो चीनी और 2 पैकेट बिस्किट" बोलें, और बिल अपने आप बन जाएगा।</p>
                                    </div>
                                </div>
                                <div className="mf-item">
                                    <div className="mf-icon">🪄</div>
                                    <div className="mf-text">
                                        <h4>Magic Invoice</h4>
                                        <p>किसी भी पुराने बिल या फोटो से डेटा अपने आप खींचकर डिजिटल इनवॉइस बनाएं।</p>
                                    </div>
                                </div>
                                <div className="mf-item">
                                    <div className="mf-icon">📊</div>
                                    <div className="mf-text">
                                        <h4>Smart Insights</h4>
                                        <p>AI आपको बताएगा कि कौन सा माल सबसे ज़्यादा बिक रहा है और कब स्टॉक मंगाना है।</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="magic-visual">
                            <div className="v-card">
                                <div className="v-shimmer"></div>
                                <div className="v-mic">🎙️</div>
                                <div className="v-wave">
                                    <span></span><span></span><span></span><span></span><span></span>
                                </div>
                                <p className="v-msg">"Do kilo Chini add karo..."</p>
                                <div className="v-rows">
                                    <div className="v-row"><span>Chini (2kg)</span> <span>₹88</span></div>
                                    <div className="v-row pulse"><span>Adding Items...</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CORE FEATURES */}
            <section className="sec" id="core-features">
                <div className="sec-in">
                    <div className="tc">
                        <div className="tag">Powerful Tools</div>
                        <h2 className="sec-h">Everything you need to manage your business</h2>
                        <p className="sec-p">All the features to make your shop smart and digital.</p>
                    </div>
                    <div className="core-grid">
                        <div className="core-card">
                            <div className="c-icon blue">🧾</div>
                            <h4>GST & Non-GST Billing</h4>
                            <p>Create professional GST compliant invoices in seconds with our easy-to-use interface. Support for all thermal and regular printers.</p>
                        </div>
                        <div className="core-card">
                            <div className="c-icon green">📦</div>
                            <h4>Inventory Management</h4>
                            <p>Track stock levels in real-time, get low-stock alerts, and manage product variants effortlessly.</p>
                        </div>
                        <div className="core-card">
                            <div className="c-icon purple">💬</div>
                            <h4>WhatsApp Integration</h4>
                            <p>Automate your business on WhatsApp. Send invoices, payment reminders, and status updates instantly to your customers.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHO SECTION */}
            <section className="sec" id="features">
                <div className="sec-in">
                    <div className="tc">
                        <div className="tag">For Everyone</div>
                        <h2 className="sec-h">हर दुकानदार के लिए, हर भाषा में</h2>
                        <p className="sec-p">चाहे आपकी किराना दुकान हो या बड़ा शोरूम — BillGST आपके लिए बना है।</p>
                    </div>
                    <div className="who-grid">
                        <div className="who"><span className="who-icon">🛒</span><h4>General Store</h4><p>Fast Billing</p></div>
                        <div className="who"><span className="who-icon">💡</span><h4>Electric Shop</h4><p>Serial Number</p></div>
                        <div className="who"><span className="who-icon">👕</span><h4>Garments</h4><p>Size & Color</p></div>
                        <div className="who"><span className="who-icon">💊</span><h4>Medical</h4><p>Expiry Alert</p></div>
                        <div className="who"><span className="who-icon">🍔</span><h4>Restaurant</h4><p>Table Support</p></div>
                        <div className="who"><span className="who-icon">🔧</span><h4>Automobile</h4><p>Service Job</p></div>
                    </div>
                </div>
            </section>


            {/* PRICING */}
            <section className="pricing-sec" id="pricing">
                <div className="pricing-in">
                    <div className="tc">
                        <div className="tag">Simple Pricing</div>
                        <h2 className="sec-h">Transparent Pricing — Koi hidden charge nahi</h2>
                        <p className="sec-p">Abhi free mein shuru karein, baad mein jab zarurat ho upgrade karein. Yearly lene par 30% bachat.</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '13px', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>🔒 256-bit SSL Secured</span>
                            <span style={{ fontSize: '13px', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>🇮🇳 Made in India</span>
                            <span style={{ fontSize: '13px', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>✅ No Credit Card Required</span>
                            <span style={{ fontSize: '13px', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>📞 Free Support on WhatsApp</span>
                        </div>
                    </div>

                    <div className="toggle-row">
                        <span className={`tog-l ${!yearly ? 'active' : ''}`}>Monthly</span>
                        <button className={`tog ${yearly ? 'on' : ''}`} onClick={() => setYearly(!yearly)}></button>
                        <span className={`tog-l ${yearly ? 'active' : ''}`}>Yearly &nbsp;<span className="save-badge">Save 30%</span></span>
                    </div>
                    <div className="p-grid">
                        {prices.map((p, i) => (
                            <div key={i} className={`p-card ${i === 1 ? 'pop' : ''}`}>
                                {i === 1 && <div className="pp-badge">⭐ Most Popular</div>}
                                <div className="p-name">{i === 0 ? 'Free Plan' : i === 1 ? 'Premium Growth' : 'Yearly Pro'}</div>
                                <div className="p-amount">₹<span>{yearly ? p.y : p.m}</span></div>
                                <div className="p-per">{i === 2 ? 'per year' : i === 1 ? 'for 3 months' : 'per month'}</div>
                                <div className="p-save">{yearly && p.m > p.y ? `₹${(p.m - p.y) * 12} saved per year` : ''}</div>
                                <div className="p-divider"></div>
                                <ul className="p-features">
                                    <li className="yes">{i === 0 ? <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Max 30 Invoices / mo</span> : 'Unlimited Bills'}</li>
                                    <li className="yes">GST + GSTR-1 Report</li>
                                    <li className={i === 0 ? 'no' : 'yes'}>Full Stock Management</li>
                                    <li className={i === 2 ? 'yes' : 'no'}>Voice Billing (AI)</li>
                                </ul>
                                <button className={i === 1 ? 'btn-pf' : 'btn-po'} onClick={() => openM('signup')}>
                                    {i === 1 ? 'अभी शुरू करें →' : 'Get Started'}
                                </button>
                                <a href="#compare-plans" style={{ display: 'block', textAlign: 'center', marginTop: '16px', fontSize: '13.5px', color: '#7CB3FF', textDecoration: 'none', fontWeight: '600' }}>View full comparison ↓</a>
                            </div>
                        ))}
                    </div>

                    <div id="compare-plans" className="pricing-comp" style={{ maxWidth: '900px', margin: '60px auto 0', background: '#0B0F1A', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', scrollMarginTop: '100px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)', fontWeight: 'bold', padding: '20px', textAlign: 'center', alignItems: 'center' }}>
                            <div style={{ textAlign: 'left', paddingLeft: '15px', fontSize: '18px', color: '#F0F4FF' }}>Feature Comparison</div>
                            <div style={{ color: '#94a3b8', fontSize: '18px' }}>Free Plan</div>
                            <div style={{ color: '#4F8EF7', fontSize: '18px' }}>Premium Plan</div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                            <div style={{ textAlign: 'left', paddingLeft: '15px' }}>
                                <div style={{ fontSize: '15px', fontWeight: '600' }}>Invoices & Billing</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Number of bills you can create</div>
                            </div>
                            <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', margin: '0 auto' }}>Max 30 Invoices / Month</div>
                            <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '15px' }}>Unlimited 🚀</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', alignItems: 'center' }}>
                            <div style={{ textAlign: 'left', paddingLeft: '15px' }}>
                                <div style={{ fontSize: '15px', fontWeight: '600' }}>Inventory Management</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Stock tracking & alerts</div>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '15px' }}>Basic (Add/Edit only)</div>
                            <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '15px' }}>Full + Low Stock Alerts 📦</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                              <div style={{ textAlign: 'left', paddingLeft: '15px' }}>
                                  <div style={{ fontSize: '15px', fontWeight: '600' }}>AI Voice Billing</div>
                                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Create bills by just speaking</div>
                              </div>
                              <div style={{ color: '#64748b', fontSize: '15px' }}>❌ Not Available</div>
                              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '15px' }}>Unlimited AI Bills 🎙️</div>
                        </div>
                          
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', alignItems: 'center' }}>
                              <div style={{ textAlign: 'left', paddingLeft: '15px' }}>
                                  <div style={{ fontSize: '15px', fontWeight: '600' }}>Staff Management</div>
                                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Add staff with permissions</div>
                              </div>
                              <div style={{ color: '#64748b', fontSize: '15px' }}>❌ Not Available</div>
                              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '15px' }}>Up to 5 Staff Members 👥</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                              <div style={{ textAlign: 'left', paddingLeft: '15px' }}>
                                  <div style={{ fontSize: '15px', fontWeight: '600' }}>Data Backup & Sync</div>
                                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Multi-device support & cloud sync</div>
                              </div>
                              <div style={{ color: '#94a3b8', fontSize: '15px' }}>Single Device / Local</div>
                              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '15px' }}>Cloud Auto-Sync ☁️</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 20px', textAlign: 'center', alignItems: 'center' }}>
                              <div style={{ textAlign: 'left', paddingLeft: '15px' }}>
                                  <div style={{ fontSize: '15px', fontWeight: '600' }}>Customer Support</div>
                                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Help when you need it</div>
                              </div>
                              <div style={{ color: '#94a3b8', fontSize: '15px' }}>Email Only (Slow)</div>
                              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '15px' }}>Priority WhatsApp Support ⚡</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="sec" id="faq" style={{ background: '#0B0F1A' }}>
                <div className="sec-in" style={{ maxWidth: '800px' }}>
                    <div className="tc">
                        <div className="tag">Common Doubts</div>
                        <h2 className="sec-h">Frequently Asked Questions</h2>
                        <p className="sec-p">Aapke sabhi sawalon ke jawab yahan hain</p>
                    </div>
                    
                    <div className="faq-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '40px' }}>
                        <div className="faq-item" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#4F8EF7' }}>Q.</span> Kya mera data safe hai?</h4>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.6' }}>Haan, 100% safe hai. Aapka data bank-level encryption ke sath cloud par store hota hai. Aapke alawa koi aur aapka data nahi dekh sakta, hum bhi nahi.</p>
                        </div>
                        
                        <div className="faq-item" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#4F8EF7' }}>Q.</span> Kya ye mobile aur computer dono par chalta hai?</h4>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.6' }}>Haan, BillGST ek fast aur secure cloud-based software hai. Aap apne mobile app aur computer (web) dono se login kar sakte hain aur aapka data hamesha auto-sync rahega.</p>
                        </div>

                        <div className="faq-item" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#4F8EF7' }}>Q.</span> BillGST baaki billing apps se behtar kyun hai?</h4>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.6' }}>BillGST mein AI Voice Billing (bol kar bill banana) aur 1-Click WhatsApp Sharing jaisi modern features hain. Ye chalaane mein bahut hi aasan hai, jisse aapka bahut samay bachta hai aur pricing bhi sabse affordable hai.</p>
                        </div>

                        <div className="faq-item" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#4F8EF7' }}>Q.</span> Kya isse GST return file hogi?</h4>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.6' }}>Aap GSTR-1, GSTR-3B aur GSTR-4 ki reports single click mein Excel aur JSON format mein download kar sakte hain jisse CA ko bhejna ya directly portal par upload karna bahut aasan ho jata hai.</p>
                        </div>
                    </div>
                </div>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": [
                                {
                                    "@type": "Question",
                                    "name": "Kya mera data safe hai?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Haan, 100% safe hai. Aapka data bank-level encryption ke sath cloud par store hota hai."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Kya ye mobile aur computer dono par chalta hai?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Haan, BillGST ek fast aur secure cloud-based software hai. Aap apne mobile app aur computer (web) dono se login kar sakte hain."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "BillGST baaki billing apps se behtar kyun hai?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "BillGST mein AI Voice Billing aur 1-Click WhatsApp Sharing jaisi modern features hain."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Kya isse GST return file hogi?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Aap GSTR-1, GSTR-3B aur GSTR-4 ki reports single click mein Excel aur JSON format mein download kar sakte hain."
                                    }
                                }
                            ]
                        })
                    }}
                />
            </section>

            {/* DEDICATED REFER & EARN SECTION */}
            <section className="sec" id="refer" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
                <div className="sec-in" style={{ maxWidth: '900px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(234, 88, 12, 0.2)', color: '#f97316', padding: '8px 16px', borderRadius: '30px', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', border: '1px solid rgba(234, 88, 12, 0.4)' }}>
                        🏆 Super Referral Program
                    </div>
                    <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', marginBottom: '20px', lineHeight: '1.3' }}>
                        Ek dost ko refer karo <br/>
                        <span style={{ color: '#10b981' }}>→ Dono ko 20/20 free Premium milega</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', marginBottom: '40px', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 40px' }}>
                        Bina ek rupya kharch kiye BillGST Premium ka maza lijiye. Apne doston, vyapariyo aur dukaandaro ko invite karein, aur dono taraf fayda payein!
                    </p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', marginBottom: '40px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px', width: '250px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '40px', marginBottom: '15px' }}>🔗</div>
                            <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>1. Link Share Karein</h4>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Apna unique link apne doston ko WhatsApp par bhejein.</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px', width: '250px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📱</div>
                            <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>2. Dost Sign up Kare</h4>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Jaise hi apka dost pehla bill banata hai.</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px', width: '250px', border: '1px solid rgba(16, 185, 129, 0.4)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#10b981' }}></div>
                            <div style={{ fontSize: '40px', marginBottom: '15px' }}>🎉</div>
                            <h4 style={{ color: '#10b981', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>3. Dono Ko Premium</h4>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Dono ko turant 20 Free Premium Bills mil jayenge!</p>
                        </div>
                    </div>

                    <button className="btn-hero" style={{ margin: '0 auto', background: '#ea580c', padding: '16px 40px', fontSize: '18px', boxShadow: '0 10px 30px rgba(234,88,12,0.4)' }} onClick={() => openM('signup')}>
                        Generate My Referral Link Now
                    </button>
                </div>
            </section>

            {/* FEATURES & GUIDES SECTION (SEO Internal Linking) */}
            <section className="sec" style={{ background: '#080d18' }}>
                <div className="sec-in">
                    <div className="tc">
                        <div className="tag">Features & Guides</div>
                        <h2 className="sec-h">BillGST Free Invoice Generator Guides</h2>
                        <p className="sec-p">Explore how our free billing software can help your small business grow.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '40px' }}>
                        <a href="/blog/free-invoice-generator-india" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', display: 'block' }}>
                            <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Best Free Invoice Generator in India</h4>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Learn how to create GST/Non-GST bills instantly and share them on WhatsApp.</p>
                        </a>
                        <a href="/blog/inventory-management-software-india" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', display: 'block' }}>
                            <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Free Inventory Management Software</h4>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Track stock in real-time, get low stock alerts, and manage your inventory flawlessly.</p>
                        </a>
                        <a href="/blog/voice-billing-ai-software" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', display: 'block' }}>
                            <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Voice Billing AI Software</h4>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Stop typing! Just speak to create invoices seamlessly with our AI voice billing.</p>
                        </a>
                        <a href="/blog/mobile-barcode-scanner-billing-app" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', display: 'block' }}>
                            <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Mobile Barcode Scanner Billing App</h4>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Scan product barcodes using your mobile camera for lightning-fast checkouts.</p>
                        </a>
                        <a href="/blog/whatsapp-billing-software" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', display: 'block' }}>
                            <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>WhatsApp Billing Software</h4>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Send professional PDF invoices directly to your customers on WhatsApp.</p>
                        </a>
                        <a href="/blog/offline-billing-software-pwa" style={{ background: '#121a2f', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', display: 'block' }}>
                            <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Offline Billing Software</h4>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>No internet? No problem. Generate invoices offline with auto cloud sync.</p>
                        </a>
                    </div>
                </div>
            </section>

            {/* TRUST BADGE SECTION BEFORE FOOTER */}
            <div style={{ background: '#0a0f1c', padding: '40px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', opacity: 0.8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '24px' }}>🔒</span> <span style={{ color: '#fff', fontWeight: 'bold' }}>100% Secure Data</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '24px' }}>🛡️</span> <span style={{ color: '#fff', fontWeight: 'bold' }}>Bank-Level Security</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '24px' }}>📜</span> <span style={{ color: '#fff', fontWeight: 'bold' }}>Independent Private Software (Not Govt Affiliated)</span></div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="landing-footer">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .landing-follow-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin: 0 auto 30px; max-width: 900px; padding: 20px; }
                    .lf-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 14px 12px; border-radius: 12px; text-decoration: none; border: 0.5px solid rgba(255,255,255,0.09); transition: transform 0.18s ease; text-align: center; color: white; }
                    .lf-card:hover { transform: translateY(-3px); }
                    .lf-card.card-wide { grid-column: 1 / -1; flex-direction: row; justify-content: center; gap: 12px; padding: 12px 16px; text-align: left; }
                    .lfc-ig { background: linear-gradient(135deg,#6a11cb,#c0392b,#f7971e); box-shadow: 0 4px 14px rgba(192,57,43,0.25); }
                    .lfc-fb { background: linear-gradient(135deg,#1565c0,#1976d2,#42a5f5); box-shadow: 0 4px 14px rgba(21,101,192,0.25); }
                    .lfc-yt { background: linear-gradient(135deg,#7b0000,#c62828,#f44336); box-shadow: 0 4px 14px rgba(198,40,40,0.25); }
                    .lfc-wa { background: linear-gradient(135deg,#1b5e20,#2e7d32,#43a047); box-shadow: 0 4px 14px rgba(46,125,50,0.25); }
                    .lfc-web { background: linear-gradient(135deg,#0f1260,#1e28c8,#4a55e8); box-shadow: 0 4px 14px rgba(74,85,232,0.25); }
                    .lfc-icon { width: 36px; height: 36px; flex-shrink: 0; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                    .lfc-icon svg { width: 18px; height: 18px; fill: #fff; }
                    .lfc-label { font-size: 13px; font-weight: 800; color: #fff; line-height: 1.1; letter-spacing: -0.2px; font-family: 'Syne', sans-serif; }
                    .lfc-sub { font-size: 10px; color: rgba(255,255,255,0.75); line-height: 1.3; margin-top: 2px; font-weight: 500; }
                    .lfc-arrow { width: 24px; height: 24px; flex-shrink: 0; background: rgba(255,255,255,0.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform 0.15s; }
                    .lf-card:hover .lfc-arrow { transform: translateX(3px); background: rgba(255,255,255,0.22); }
                    .lfc-arrow svg { width: 12px; height: 12px; stroke: #fff; }
                `}} />

                <div className="landing-follow-grid">
                    <a className="lf-card lfc-ig" href="https://www.instagram.com/billgst_app?utm_source=qr&igsh=bzJrMGphemNpa2dm" target="_blank" rel="noopener">
                        <div className="lfc-icon"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg></div>
                        <div className="lfc-label">Instagram</div>
                        <div className="lfc-sub">@billgst_app</div>
                    </a>

                    <a className="lf-card lfc-fb" href="https://www.facebook.com/share/1GrM77Pp4c/" target="_blank" rel="noopener">
                        <div className="lfc-icon"><svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></div>
                        <div className="lfc-label">Facebook</div>
                        <div className="lfc-sub">BillGST Page</div>
                    </a>

                    <a className="lf-card lfc-yt" href="https://www.youtube.com/@billgstapp" target="_blank" rel="noopener">
                        <div className="lfc-icon"><svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg></div>
                        <div className="lfc-label">YouTube</div>
                        <div className="lfc-sub">Tutorials</div>
                    </a>

                    <a className="lf-card lfc-wa" href="https://wa.me/917498571873" target="_blank" rel="noopener">
                        <div className="lfc-icon"><svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M11.999 2C6.486 2 2 6.486 2 12c0 1.73.445 3.397 1.293 4.875L2.05 21.95l5.19-1.232A9.948 9.948 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18a7.951 7.951 0 01-4.063-1.117l-.289-.172-3.082.731.776-2.999-.188-.307A7.946 7.946 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" /></svg></div>
                        <div className="lfc-label">WhatsApp</div>
                        <div className="lfc-sub">Chat & Support</div>
                    </a>

                    <a className="lf-card card-wide lfc-web" href="https://billgst.in" target="_blank" rel="noopener">
                        <div className="lfc-icon">
                            <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                                <path d="M2 12h20M12 2c-2.5 3-4 6-4 10s1.5 7 4 10M12 2c2.5 3 4 6 4 10s-1.5 7-4 10" stroke="white" strokeWidth="2" />
                            </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif" }}>billgst.in — Free account banao abhi</div>
                            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>Invoice, hisaab, GST — sab kuch ek jagah</div>
                        </div>
                        <div className="lfc-arrow">
                            <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                    </a>
                </div>

                <div className="foot-in">
                    <div className="foot-top">
                        <div className="f-brand">
                            <div className="fl">
                                <img src="/logo.png" alt="BillGST Logo" />
                                <span>BillGST</span>
                            </div>
                            <p>India का #1 billing & GST software। हर दुकानदार के लिए, हर भाषा में।</p>
                        </div>
                        <div className="f-col"><h5>Product</h5><ul><li><a href="#">Invoicing</a></li><li><a href="#">Stock</a></li></ul></div>
                        <div className="f-col"><h5>Company</h5><ul><li><a href="/about">About Us</a></li><li><a href="/blog">Blog</a></li></ul></div>
                        <div className="f-col"><h5>Support</h5><ul><li><a href="/dashboard/referral">Refer & Earn</a></li><li><a href="#">Help</a></li><li><a href="/privacy">Privacy Policy</a></li></ul></div>
                    </div>
                    <div className="foot-btm" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', textAlign: 'left', lineHeight: '1.6', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <strong>Disclaimer:</strong> BillGST is an independent, privately-owned software utility designed to assist businesses with invoicing and stock management. <strong>BillGST is NOT affiliated with, endorsed by, or authorized by any government entity.</strong> The GST rates and tax-related calculations provided within this app are for convenience and based on publicly available information. For official government information, verified tax rates, and regulatory details, please visit the official Goods and Services Tax (GST) portal at <a href="https://www.gst.gov.in/" target="_blank" rel="noopener" style={{ color: '#4F8EF7', textDecoration: 'underline' }}>https://www.gst.gov.in/</a>.
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
                            <span>© {new Date().getFullYear()} BillGST · All rights reserved</span>
                            <span>🇮🇳 Made with ❤️ in India</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* EXIT INTENT POPUP */}
            {showExitPopup && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#121a2f', border: '1px solid rgba(255,255,255,0.1)', padding: '40px', borderRadius: '20px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🛑</div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>Rukiye!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '25px' }}>
                            Kahin mat jayiye. Pehle 30 free bills try karein aur dekhein ki BillGST aapka kaam kitna aasaan kar sakta hai!
                        </p>
                        <button className="btn-hero" style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', width: '100%', marginBottom: '15px', justifyContent: 'center' }} onClick={() => { setShowExitPopup(false); openM('signup'); }}>
                            Free Mein Shuru Karein
                        </button>
                        <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowExitPopup(false)}>
                            Nahi, fir kabhi
                        </button>
                    </div>
                </div>
            )}

            {/* FLOATING WHATSAPP WIDGET */}
            <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: '#fff', padding: '10px 18px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontSize: '14px', fontWeight: 'bold', color: '#111827', position: 'relative', animation: 'float-up-down 3s ease-in-out infinite' }}>
                    Need Help? Chat with us!
                    <div style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)', width: '0', height: '0', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '8px solid #fff' }}></div>
                </div>
                <a href="https://wa.me/917498571873" target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', width: '65px', height: '65px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(37, 211, 102, 0.5)', transition: 'transform 0.3s', position: 'relative' }} className="wa-float-btn">
                    <style dangerouslySetInnerHTML={{__html: `
                        @keyframes wa-pulse {
                            0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
                            70% { box-shadow: 0 0 0 20px rgba(37, 211, 102, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
                        }
                        @keyframes float-up-down {
                            0% { transform: translateY(0); }
                            50% { transform: translateY(-5px); }
                            100% { transform: translateY(0); }
                        }
                        .wa-float-btn { animation: wa-pulse 2s infinite; }
                        .wa-float-btn:hover { transform: scale(1.1) !important; animation: none; }
                    `}} />
                    <svg viewBox="0 0 24 24" width="38" height="38"><path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
            </div>

            {/* MODALS */}
            {isLoginOpen && (
                <div className="m-bg on" onClick={(e) => e.target === e.currentTarget && closeM('login')}>
                    <form className="m-box" onSubmit={doLogin}>
                        <button type="button" className="m-x" onClick={() => closeM('login')}>✕</button>
                        <h2>Welcome back 👋</h2>
                        <p className="ms">Login to your BillGST account</p>
                        <div className="fg">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                required
                                value={loginData.email}
                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            />
                        </div>
                        <div className="fg">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                required
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            />
                            <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                <a href="/forgot-password" style={{ fontSize: '13px', color: '#4F8EF7', textDecoration: 'none', fontWeight: 500, cursor: 'pointer' }}>Forgot password?</a>
                            </div>
                        </div>
                        <button type="submit" className="btn-mf" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Login →'}
                        </button>
                        <p className="m-sw">Account नहीं है? <a onClick={() => switchM('signup')}>मुफ्त शुरू करें</a></p>
                    </form>
                </div>
            )}

            {isSignupOpen && (
                <div className="m-bg on" onClick={(e) => e.target === e.currentTarget && closeM('signup')}>
                    <form className="m-box" onSubmit={doSignup}>
                        <button type="button" className="m-x" onClick={() => closeM('signup')}>✕</button>
                        <h2>Account बनाएं 🚀</h2>
                        <p className="ms">No credit card · Setup in 2 minutes</p>
                        <div className="fg">
                            <label>आपका नाम</label>
                            <input
                                type="text"
                                placeholder="Ramesh Kumar"
                                required
                                value={signupData.name}
                                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                            />
                        </div>
                        <div className="fg">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                required
                                value={signupData.email}
                                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                            />
                        </div>
                        <div className="fg">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Set a password"
                                required
                                value={signupData.password}
                                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            />
                        </div>
                        <div className="fg">
                            <label>Referral Code (Optional)</label>
                            <input
                                type="text"
                                placeholder="Enter code if you have one"
                                value={signupData.refCode}
                                onChange={(e) => setSignupData({ ...signupData, refCode: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn-mf" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'मुफ्त Account बनाएं →'}
                        </button>
                        <p className="m-sw">Already have account? <a onClick={() => switchM('login')}>Login करें</a></p>
                    </form>
                </div>
            )}

            <div id="toast"></div>
            <SupportChatWidget />
        </div>
    );
}
