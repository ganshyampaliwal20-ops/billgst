'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import './landing.css';

function LandingPageContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // States for Modals and Interactivity
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [yearly, setYearly] = useState(false);
    const [activeTab, setActiveTab] = useState('stock');
    const [scrolled, setScrolled] = useState(false);
    const [isMobMenuOpen, setIsMobMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });

    // Prices Data
    const prices = [{ m: 30, y: 21 }, { m: 299, y: 209 }, { m: 999, y: 699 }];

    useEffect(() => {
        // Redirect if authenticated
        if (status === 'authenticated') {
            router.push('/dashboard');
        }

        // Open modal based on URL query parameter
        if (searchParams.get('login') === 'true') {
            setIsLoginOpen(true);
        } else if (searchParams.get('signup') === 'true') {
            setIsSignupOpen(true);
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
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('v');
                });
            }, { threshold: 0.1 });

            elements.forEach(el => observer?.observe(el));
        } else {
            // Fallback for older browsers: show all elements immediately
            elements.forEach(el => el.classList.add('v'));
        }

        // Failsafe for mobile: 2 seconds later force show everything in case observer failed
        const failsafe = setTimeout(() => {
            elements.forEach(el => el.classList.add('v'));
        }, 1500);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (observer) observer.disconnect();
            clearTimeout(failsafe);
        };
    }, [status, router, searchParams]);

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
            <nav className="landing-nav" id="nav" style={{ background: scrolled ? 'rgba(6,8,15,0.97)' : 'rgba(6,8,15,0.8)' }}>
                <a href="#" className="logo">
                    <img src="/logo.png" alt="BillGST Logo" />
                    <span className="logo-name">BillGST</span>
                </a>
                <ul className="nav-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#reviews">Reviews</a></li>
                    <li><a href="#faq">Support</a></li>
                </ul>
                <div className="nav-end">
                    <div className="lang-wrap">
                        <button className="lang-btn">🌐 Hindi</button>
                    </div>
                    <button className="btn-ghost" onClick={() => openM('login')}>Login</button>
                    <button className="btn-cta" onClick={() => openM('signup')}>Free Signup</button>
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
                <a href="#reviews" onClick={() => setIsMobMenuOpen(false)}>Reviews</a>
                <button className="btn-hero" onClick={() => openM('signup')} style={{ marginTop: '10px' }}>Sign Up</button>
            </div>

            {/* HERO */}
            <section className="hero">
                <div className="hero-pill">
                    <span className="chip">New</span>
                    <span>Voice Billing AI is now live! 🎙️</span>
                </div>
                <h1 className="fi">
                    India की दुकान के लिए <br />
                    <span className="g1">Smart Billing Software</span> <br />
                    पर अब <span className="g2">GST</span> की कोई टेंशन नहीं।
                </h1>
                <p className="hero-desc fi">
                    BillGST एक आसान Billing & Inventory App है जो आपकी दुकान को Digital बनाता है।
                    Free Invoices, Stock Alert, और WhatsApp Billing के साथ।
                </p>
                <div className="hero-actions fi">
                    <button className="btn-hero" onClick={() => openM('signup')}>🚀 अभी मुफ्त शुरू करें</button>
                    <button className="btn-hero2" onClick={() => openM('login')}>Login करें →</button>
                </div>
                <p className="hero-note fi">✦ Starter plan में <span>30 GST Bills</span> हर महीने बिल्कुल मुफ्त</p>

                {/* DASHBOARD PREVIEW */}
                <div className="db-wrap fi">
                    <div className="db-glow"></div>
                    <div className="db-frame">
                        <div className="db-bar">
                            <span className="dot r"></span><span className="dot y"></span><span className="dot g"></span>
                            <div className="db-url">app.billgst.in/<b>dashboard</b></div>
                        </div>
                        <div className="db-content">
                            <div className="db-side">
                                <div className="si on">📊 Reports</div>
                                <div className="si">🧾 Invoices</div>
                                <div className="si">📦 Inventory</div>
                                <div className="si">👥 Customers</div>
                                <div className="si">⚙️ Settings</div>
                            </div>
                            <div className="db-main">
                                <div className="kpi-row">
                                    <div className="kpi"><div className="k-lbl">Total Sales</div><div className="k-val">₹4,82,500</div><div className="k-ch up">↑ 12%</div></div>
                                    <div className="kpi"><div className="k-lbl">New Bills</div><div className="k-val">128</div><div className="k-ch up">↑ 4%</div></div>
                                    <div className="kpi"><div className="k-lbl">Profit</div><div className="k-val">₹92,400</div><div className="k-ch up">↑ 8%</div></div>
                                    <div className="kpi"><div className="k-lbl">Due Udhar</div><div className="k-val">₹12,400</div><div className="k-ch dn">↓ 20%</div></div>
                                </div>
                                <div className="mid-row">
                                    <div className="chart-card">
                                        <h5>Monthly Growth</h5>
                                        <div className="bars">
                                            <div className="bar" style={{ height: '30%', background: '#4F8EF7' }}></div>
                                            <div className="bar" style={{ height: '45%', background: '#4F8EF7' }}></div>
                                            <div className="bar" style={{ height: '65%', background: '#4F8EF7' }}></div>
                                            <div className="bar" style={{ height: '85%', background: 'var(--grad)' }}></div>
                                        </div>
                                    </div>
                                    <div className="bills-card">
                                        <h5>Recent Activity</h5>
                                        <div className="bill-row2"><span className="bname">Gaurav Sharma</span><span className="badge paid">Paid</span></div>
                                        <div className="bill-row2"><span className="bname">Amit Traders</span><span className="badge pend">Unpaid</span></div>
                                        <div className="bill-row2"><span className="bname">Ravi Kumar</span><span className="badge paid">Paid</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST */}
            <section className="trust">
                <div className="trust-in">
                    <p className="trust-lbl">Trusted by 50,000+ Smart Retailers</p>
                    <div className="trust-logos">
                        <span className="tl">KIRANA STORES</span><span className="tl">ELECTRICAL SHOP</span>
                        <span className="tl">MEDICAL PHARMACY</span><span className="tl">RESTAURANTS</span>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="stats">
                <div className="stats-in">
                    <div className="stat"><div className="stat-n">50k+</div><div className="stat-l">Active Users</div></div>
                    <div className="stat"><div className="stat-n">1M+</div><div className="stat-l">Bills Created</div></div>
                    <div className="stat"><div className="stat-n">₹500Cr+</div><div className="stat-l">Business Volume</div></div>
                    <div className="stat"><div className="stat-n">4.9/5</div><div className="stat-l">PlayStore Rating</div></div>
                </div>
            </section>

            {/* HOW IT WORKS / GUIDE */}
            <section className="sec" id="guide">
                <div className="sec-in">
                    <div className="tc">
                        <div className="tag">Quick Guide</div>
                        <h2 className="sec-h fi">BillGST का उपयोग करना बहुत आसान है</h2>
                        <p className="sec-p fi">सिर्फ 3 आसान स्टेप्स में अपनी दुकान डिजिटल बनाएं।</p>
                    </div>
                    <div className="step-grid">
                        <div className="step-card fi">
                            <div className="s-num">1</div>
                            <div className="s-icon">📦</div>
                            <h4>Product Add करें</h4>
                            <p>बस "Add Product" पर क्लिक करें, नाम और रेट डालें। आपका Stock तैयार है!</p>
                        </div>
                        <div className="step-card fi">
                            <div className="s-num">2</div>
                            <div className="s-icon">📝</div>
                            <h4>Invoice बनाएं</h4>
                            <p>Customer और Items चुनें। GST अपने आप कैलकुलेट हो जाएगा।</p>
                        </div>
                        <div className="step-card fi">
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
                            <h2 className="sec-h fi">BillGST AI — बोलकर बिल बनाएं</h2>
                            <p className="magic-p fi">टाइप करने की कोई ज़रूरत नहीं! हमारी AI तकनीक से आप वैसे ही बिल बना सकते हैं जैसे आप किसी से बात करते हैं।</p>

                            <div className="magic-features-list">
                                <div className="mf-item fi">
                                    <div className="mf-icon">🎙️</div>
                                    <div className="mf-text">
                                        <h4>Voice Billing</h4>
                                        <p>"1 किलो चीनी और 2 पैकेट बिस्किट" बोलें, और बिल अपने आप बन जाएगा।</p>
                                    </div>
                                </div>
                                <div className="mf-item fi">
                                    <div className="mf-icon">🪄</div>
                                    <div className="mf-text">
                                        <h4>Magic Invoice</h4>
                                        <p>किसी भी पुराने बिल या फोटो से डेटा अपने आप खींचकर डिजिटल इनवॉइस बनाएं।</p>
                                    </div>
                                </div>
                                <div className="mf-item fi">
                                    <div className="mf-icon">📊</div>
                                    <div className="mf-text">
                                        <h4>Smart Insights</h4>
                                        <p>AI आपको बताएगा कि कौन सा माल सबसे ज़्यादा बिक रहा है और कब स्टॉक मंगाना है।</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="magic-visual fi">
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
                        <h2 className="sec-h fi">Everything you need to manage your business</h2>
                        <p className="sec-p fi">All the features to make your shop smart and digital.</p>
                    </div>
                    <div className="core-grid">
                        <div className="core-card fi">
                            <div className="c-icon blue">🧾</div>
                            <h4>GST & Non-GST Billing</h4>
                            <p>Create professional GST compliant invoices in seconds with our easy-to-use interface. Support for all thermal and regular printers.</p>
                        </div>
                        <div className="core-card fi">
                            <div className="c-icon green">📦</div>
                            <h4>Inventory Management</h4>
                            <p>Track stock levels in real-time, get low-stock alerts, and manage product variants effortlessly.</p>
                        </div>
                        <div className="core-card fi">
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
                        <h2 className="sec-h fi">हर दुकानदार के लिए, हर भाषा में</h2>
                        <p className="sec-p fi">चाहे आपकी किराना दुकान हो या बड़ा शोरूम — BillGST आपके लिए बना है।</p>
                    </div>
                    <div className="who-grid">
                        <div className="who fi"><span className="who-icon">🛒</span><h4>General Store</h4><p>Fast Billing</p></div>
                        <div className="who fi"><span className="who-icon">💡</span><h4>Electric Shop</h4><p>Serial Number</p></div>
                        <div className="who fi"><span className="who-icon">👕</span><h4>Garments</h4><p>Size & Color</p></div>
                        <div className="who fi"><span className="who-icon">💊</span><h4>Medical</h4><p>Expiry Alert</p></div>
                        <div className="who fi"><span className="who-icon">🍔</span><h4>Restaurant</h4><p>Table Support</p></div>
                        <div className="who fi"><span className="who-icon">🔧</span><h4>Automobile</h4><p>Service Job</p></div>
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section className="pricing-sec" id="pricing">
                <div className="pricing-in">
                    <div className="tc">
                        <div className="tag">Simple Pricing</div>
                        <h2 className="sec-h fi">Transparent Pricing — कोई hidden charge नहीं</h2>
                        <p className="sec-p fi">शुरुआत करें, दुकान बढ़े तो upgrade करें। Yearly लो और 30% बचाओ।</p>
                    </div>
                    <div className="toggle-row">
                        <span className={`tog-l ${!yearly ? 'active' : ''}`}>Monthly</span>
                        <button className={`tog ${yearly ? 'on' : ''}`} onClick={() => setYearly(!yearly)}></button>
                        <span className={`tog-l ${yearly ? 'active' : ''}`}>Yearly &nbsp;<span className="save-badge">Save 30%</span></span>
                    </div>
                    <div className="p-grid">
                        {prices.map((p, i) => (
                            <div key={i} className={`p-card ${i === 1 ? 'pop' : ''} fi`}>
                                {i === 1 && <div className="pp-badge">⭐ Most Popular</div>}
                                <div className="p-name">{i === 0 ? 'Free Plan' : i === 1 ? 'Professional' : 'Enterprise'}</div>
                                <div className="p-amount">₹<span>{yearly ? p.y : p.m}</span></div>
                                <div className="p-per">per month {yearly ? '· billed yearly' : ''}</div>
                                <div className="p-save">{yearly ? `₹${(p.m - p.y) * 12} saved per year` : ''}</div>
                                <div className="p-divider"></div>
                                <ul className="p-features">
                                    <li className="yes">{i === 0 ? '30 Invoices / month' : 'Unlimited Bills'}</li>
                                    <li className="yes">GST + GSTR-1 Report</li>
                                    <li className={i === 0 ? 'no' : 'yes'}>Full Stock Management</li>
                                    <li className={i === 2 ? 'yes' : 'no'}>Voice Billing (AI)</li>
                                </ul>
                                <button className={i === 1 ? 'btn-pf' : 'btn-po'} onClick={() => openM('signup')}>
                                    {i === 1 ? 'अभी शुरू करें →' : 'Get Started'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer">
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
                        <div className="f-col"><h5>Company</h5><ul><li><a href="#">About</a></li><li><a href="#">Blog</a></li></ul></div>
                        <div className="f-col"><h5>Support</h5><ul><li><a href="#">Help</a></li><li><a href="privacy">Privacy</a></li></ul></div>
                    </div>
                    <div className="foot-btm">
                        <span>© {new Date().getFullYear()} BillGST · All rights reserved</span>
                        <span>🇮🇳 Made with ❤️ in India</span>
                    </div>
                </div>
            </footer>

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
                        <button type="submit" className="btn-mf" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'मुफ्त Account बनाएं →'}
                        </button>
                        <p className="m-sw">Already have account? <a onClick={() => switchM('login')}>Login करें</a></p>
                    </form>
                </div>
            )}

            <div id="toast"></div>
        </div>
    );
}

export default function LandingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#06080F]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent flex items-center justify-center rounded-full animate-spin"></div>
            </div>
        }>
            <LandingPageContent />
        </Suspense>
    );
}