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
        <div className="landing-body" style={{ background: '#fff', color: '#111827', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {/* NAV */}
            <nav className="nav" style={{ paddingTop: isStandalone ? 'calc(env(safe-area-inset-top, 44px) + 14px)' : '14px' }}>
              <div className="logo">
                <img src="/icon.png" width={34} height={34} alt="BillGST Logo" style={{ borderRadius: '9px' }} />
                <span className="logo-text">BillGST</span>
              </div>
              <div className="nav-links">
                <a className="nav-link" href="#features">Features</a>
                <a className="nav-link" href="#pricing">Pricing</a>
                <a className="nav-link" href="/about">About</a>
                <a className="nav-link" href="/blog">Blog</a>
              </div>
              <div className="nav-btns">
                <button className="btn-outline" onClick={() => openM('login')}>Login</button>
                <button className="btn-outline" onClick={() => openM('signup')}>Free Sign Up</button>
              </div>
            </nav>

            {/* HERO */}
            <div className="hero">
              <div>
                <div className="new-badge"><div className="new-dot"></div> Voice Billing AI is now live! 🎙️</div>
                <h1 className="hero-h1">India की दुकान के लिए<br/><span>Smart Billing Software</span><br/>GST की टेंशन खत्म।</h1>
                <p className="hero-sub">Free invoices, stock alerts, aur WhatsApp billing — ek hi jagah. Abhi shuru karo bilkul free mein, koi credit card nahi.</p>
                <div className="hero-btns" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn-hero btn-hero-primary" onClick={() => openM('signup')}>
                      <i className="ti ti-rocket"></i> Free Account Banao
                    </button>
                    <button className="btn-hero btn-hero-secondary" onClick={() => openM('login')}>
                      <i className="ti ti-login"></i> Dashboard Login
                    </button>
                  </div>
                  <div>
                    <button className="btn-hero btn-hero-secondary" onClick={() => window.location.href='https://play.google.com/store/apps/details?id=in.billgst.app'} style={{ background: '#000', color: '#fff', borderColor: '#000', marginTop: '10px' }}>
                      <i className="ti ti-brand-google-play"></i> Get it on Play Store
                    </button>
                  </div>
                </div>
                <div className="trust-row">
                  <div className="trust-item"><i className="ti ti-check"></i> 30 bills/month free</div>
                  <div className="trust-item"><i className="ti ti-check"></i> No credit card</div>
                  <div className="trust-item"><i className="ti ti-check"></i> Bank-level security</div>
                </div>
              </div>
              <div className="dash-preview" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                <div className="dash-bar" style={{ margin: 0, padding: '12px 18px', background: '#F9FAFB' }}>
                  <div className="dash-dot" style={{background:'#ff5f57'}}></div>
                  <div className="dash-dot" style={{background:'#febc2e'}}></div>
                  <div className="dash-dot" style={{background:'#28c840'}}></div>
                  <div className="dash-url">app.billgst.in/dashboard</div>
                </div>
                <div style={{ position: 'relative' }}>
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
            </div>

            <div className="divider"></div>

            {/* FEATURES */}
            <div className="section" id="features">
              <div className="section-eyebrow">Features</div>
              <h2 className="section-title">Everything aapki dukaan ko chahiye</h2>
              <p className="section-sub">GST billing se lekar stock alert tak — sab kuch ek app mein.</p>
              <div className="features-grid">
                <div className="feat-card">
                  <div className="feat-icon feat-icon-blue"><i className="ti ti-receipt-2"></i></div>
                  <div className="feat-title">GST & Non-GST Billing</div>
                  <div className="feat-desc">Seconds mein professional GST-compliant invoices. Thermal aur regular printer support.</div>
                </div>
                <div className="feat-card">
                  <div className="feat-icon feat-icon-green"><i className="ti ti-package"></i></div>
                  <div className="feat-title">Inventory Management</div>
                  <div className="feat-desc">Real-time stock track karo, low-stock alerts pao, aur product variants manage karo effortlessly.</div>
                </div>
                <div className="feat-card">
                  <div className="feat-icon feat-icon-amber"><i className="ti ti-brand-whatsapp"></i></div>
                  <div className="feat-title">WhatsApp Billing</div>
                  <div className="feat-desc">1 click mein invoice seedha customer ke WhatsApp par. Payment reminders bhi automatic.</div>
                </div>
                <div className="feat-card">
                  <div className="feat-icon feat-icon-blue"><i className="ti ti-microphone"></i></div>
                  <div className="feat-title">Voice Billing AI</div>
                  <div className="feat-desc">"2 kilo chini aur 1 dettol" bolo — bill apne aap ban jayega. Tyohar ki bheed mein bhi kaam karta hai.</div>
                </div>
                <div className="feat-card">
                  <div className="feat-icon feat-icon-green"><i className="ti ti-scan"></i></div>
                  <div className="feat-title">Smart Scanner</div>
                  <div className="feat-desc">Purani invoice ya photo se data apne aap kheench ke naya digital invoice banao.</div>
                </div>
                <div className="feat-card">
                  <div className="feat-icon feat-icon-amber"><i className="ti ti-chart-bar"></i></div>
                  <div className="feat-title">Smart Insights</div>
                  <div className="feat-desc">Kaun sa maal sabse zyada bik raha hai aur kab stock mangwana hai — AI batayega.</div>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* HOW IT WORKS */}
            <div className="section">
              <div className="section-eyebrow">How It Works</div>
              <h2 className="section-title">Sirf 3 steps mein dukaan digital</h2>
              <p className="section-sub">Koi training nahi, koi jhanjhat nahi — abhi shuru karo.</p>
              <div className="steps-row">
                <div className="step-card">
                  <div className="step-num">1</div>
                  <div className="step-title">Product add karo</div>
                  <div className="step-desc">"Add Product" click karo, naam aur rate daalo. Aapka stock ready hai!</div>
                </div>
                <div className="step-card">
                  <div className="step-num">2</div>
                  <div className="step-title">Invoice banao</div>
                  <div className="step-desc">Customer aur items chuno. GST apne aap calculate ho jayega.</div>
                </div>
                <div className="step-card">
                  <div className="step-num">3</div>
                  <div className="step-title">WhatsApp bhejo</div>
                  <div className="step-desc">Ek click mein bill seedhe customer ke WhatsApp par bhejo.</div>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* SHOP TYPES */}
            <div className="section">
              <div className="section-eyebrow">For Everyone</div>
              <h2 className="section-title">Har dukaan ke liye, har bhaasha mein</h2>
              <p className="section-sub">Kirana se lekar showroom tak — BillGST aapke liye bana hai.</p>
              <div className="shops-grid">
                <div className="shop-card"><div className="shop-icon">🛒</div><div className="shop-label">Kirana Store</div><div className="shop-sub">Fast Billing</div></div>
                <div className="shop-card"><div className="shop-icon">💡</div><div className="shop-label">Electric Shop</div><div className="shop-sub">Serial No.</div></div>
                <div className="shop-card"><div className="shop-icon">👕</div><div className="shop-label">Garments</div><div className="shop-sub">Size & Color</div></div>
                <div className="shop-card"><div className="shop-icon">💊</div><div className="shop-label">Medical</div><div className="shop-sub">Expiry Alert</div></div>
                <div className="shop-card"><div className="shop-icon">🍔</div><div className="shop-label">Restaurant</div><div className="shop-sub">Table Support</div></div>
                <div className="shop-card"><div className="shop-icon">🔧</div><div className="shop-label">Automobile</div><div className="shop-sub">Service Job</div></div>
              </div>
            </div>

            <div className="divider"></div>

            {/* PRICING */}
            <div className="section" id="pricing">
              <div className="section-eyebrow">Pricing</div>
              <h2 className="section-title">Transparent pricing — koi hidden charge nahi</h2>
              <p className="section-sub">Free mein shuru karo, zarurat padne par upgrade karo. Yearly lene par 30% bachat.</p>
              <div className="pricing-grid">
                <div className="price-card">
                  <div className="price-plan">Free Plan</div>
                  <div className="price-amt">₹0 <span className="price-period">/ month</span></div>
                  <div className="price-divider"></div>
                  <div className="price-item"><i className="ti ti-check"></i> 30 invoices/month</div>
                  <div className="price-item"><i className="ti ti-check"></i> GST + GSTR-1 Report</div>
                  <div className="price-item"><i className="ti ti-check"></i> Basic stock management</div>
                  <div className="price-item"><i className="ti ti-check"></i> Voice Billing AI</div>
                  <button className="price-btn price-btn-outline" onClick={() => openM('signup')}>Get Started</button>
                </div>
                <div className="price-card price-card-featured">
                  <div className="price-badge">⭐ Most Popular</div>
                  <div className="price-plan">Premium Growth</div>
                  <div className="price-amt">₹99 <span className="price-period">/ 3 months</span></div>
                  <div className="price-divider"></div>
                  <div className="price-item"><i className="ti ti-check"></i> Unlimited bills</div>
                  <div className="price-item"><i className="ti ti-check"></i> GST + GSTR-1 Report</div>
                  <div className="price-item"><i className="ti ti-check"></i> Full stock + low stock alerts</div>
                  <div className="price-item"><i className="ti ti-check"></i> Unlimited Voice AI billing</div>
                  <button className="price-btn price-btn-main" onClick={() => openM('signup')}>Abhi Shuru Karo →</button>
                </div>
                <div className="price-card">
                  <div className="price-plan">Yearly Pro</div>
                  <div className="price-amt">₹299 <span className="price-period">/ year</span></div>
                  <div className="price-divider"></div>
                  <div className="price-item"><i className="ti ti-check"></i> Unlimited bills</div>
                  <div className="price-item"><i className="ti ti-check"></i> GST + GSTR-1 Report</div>
                  <div className="price-item"><i className="ti ti-check"></i> Full stock + low stock alerts</div>
                  <div className="price-item"><i className="ti ti-check"></i> Save 30% vs monthly</div>
                  <button className="price-btn price-btn-outline" onClick={() => openM('signup')}>Get Started</button>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* REVIEWS */}
            <div className="section">
              <div className="section-eyebrow">Customer Love</div>
              <h2 className="section-title">Hazaron dukaandaron ki pehli pasand</h2>
              <p className="section-sub">Poore India mein chhoti aur badi dukaanon mein use ho raha hai.</p>
              <div className="reviews-grid">
                <div className="review-card">
                  <div className="stars">★★★★★</div>
                  <p className="review-text">"Pehle copy mein hisab likhne mein bahut time jaata tha. Ab 10 second mein WhatsApp par bill bhej deta hoon. Stock bhi maintain rehta hai."</p>
                  <div className="reviewer">
                    <div className="rev-avatar">RG</div>
                    <div><div className="rev-name">Ramesh Gupta</div><div className="rev-biz">Ramesh Kirana Store, Pune</div></div>
                  </div>
                </div>
                <div className="review-card">
                  <div className="stars">★★★★★</div>
                  <p className="review-text">"Voice billing feature toh kamaal hai! Tyohar ke time bheed mein bas bol ke bill ban jaata hai. Bahut easy software hai."</p>
                  <div className="reviewer">
                    <div className="rev-avatar">AS</div>
                    <div><div className="rev-name">Amit Sharma</div><div className="rev-biz">Sharma Electronics, Delhi</div></div>
                  </div>
                </div>
                <div className="review-card">
                  <div className="stars">★★★★★</div>
                  <p className="review-text">"Udhar ka hisab rakhna bahut aasaan ho gaya. Ek click mein party ko PDF chala jaata hai. Must use app for all shopkeepers!"</p>
                  <div className="reviewer">
                    <div className="rev-avatar">VP</div>
                    <div><div className="rev-name">Vikash Patel</div><div className="rev-biz">Patel Garments, Surat</div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="cta-section">
              <h2 className="cta-title">Aaj hi shuru karo — bilkul free</h2>
              <p className="cta-sub">30 GST bills har mahine, koi credit card nahi, koi jhanjhat nahi.</p>
              <div className="cta-btns">
                <button className="btn-white" onClick={() => openM('signup')}>
                  <i className="ti ti-rocket"></i> Free Account Banao
                </button>
                <button className="btn-ghost" onClick={() => window.location.href='https://play.google.com/store/apps/details?id=in.billgst.app'}>
                  <i className="ti ti-brand-google-play"></i> Google Play par Download
                </button>
              </div>
            </div>

            {/* FOOTER */}
            <div className="footer-top">
              <div>
                <div className="logo">
                  <div className="logo-icon"><i className="ti ti-receipt-2"></i></div>
                  <span className="logo-text">BillGST</span>
                </div>
                <p className="footer-brand-desc">India ka #1 billing & GST software. Har dukaandaar ke liye, har bhaasha mein. Made with ❤️ in India.</p>
              </div>
              <div>
                <div className="footer-col-title">Product</div>
                <a className="footer-link">Invoicing</a>
                <a className="footer-link">Stock Management</a>
                <a className="footer-link">Voice Billing</a>
                <a className="footer-link">Smart Scanner</a>
              </div>
              <div>
                <div className="footer-col-title">Company</div>
                <a className="footer-link" href="/about">About Us</a>
                <a className="footer-link" href="/blog">Blog</a>
                <a className="footer-link" href="/privacy">Privacy Policy</a>
              </div>
              <div>
                <div className="footer-col-title">Support</div>
                <a className="footer-link" href="https://wa.me/917498571873">WhatsApp Help</a>
                <a className="footer-link">Refer & Earn</a>
                <a className="footer-link">FAQ</a>
              </div>
            </div>
            <div style={{borderTop:'1px solid #F3F4F6'}}>
              <div className="footer-bottom">
                <span className="footer-copy">© {new Date().getFullYear()} BillGST · All rights reserved · 🇮🇳 Made in India</span>
                <div className="footer-socials">
                  <div className="social-btn" onClick={() => window.location.href='https://www.instagram.com/billgst_app'}><i className="ti ti-brand-instagram"></i></div>
                  <div className="social-btn" onClick={() => window.location.href='https://www.youtube.com/@billgstapp'}><i className="ti ti-brand-youtube"></i></div>
                  <div className="social-btn" onClick={() => window.location.href='https://wa.me/917498571873'}><i className="ti ti-brand-whatsapp"></i></div>
                </div>
              </div>
            </div>

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
