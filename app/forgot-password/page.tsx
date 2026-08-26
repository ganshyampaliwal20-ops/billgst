/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isSuccess && !canResend) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isSuccess, canResend]);

    const validEmail = (v: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const trimmedEmail = email.trim();
        if (!validEmail(trimmedEmail)) {
            setIsInvalid(true);
            return;
        }
        setIsInvalid(false);
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            toast.success(data.message || 'Reset link sent!');
            setIsSuccess(true);
            setCountdown(30);
            setCanResend(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = () => {
        setCanResend(false);
        setCountdown(30);
        handleSubmit();
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
                
                :root {
                    --void: #0A0E17;
                    --panel: #12182A;
                    --panel-2: #161E33;
                    --line: #232B42;
                    --gold: #C9A227;
                    --gold-bright: #E4C255;
                    --text-hi: #F5F3EE;
                    --text-lo: #8A93AB;
                    --danger: #E2685A;
                    --radius: 14px;
                }

                .fp-container {
                    min-height: 100vh;
                    background: var(--void);
                    font-family: 'Inter', sans-serif;
                    color: var(--text-hi);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 32px 20px;
                    position: relative;
                    overflow-x: hidden;
                }

                .fp-container::before {
                    content: '';
                    position: fixed;
                    inset: 0;
                    background-image: radial-gradient(circle, rgba(201,162,39,0.10) 1px, transparent 1px);
                    background-size: 26px 26px;
                    mask-image: radial-gradient(circle at 50% 30%, black 0%, transparent 70%);
                    pointer-events: none;
                }

                .fp-glow {
                    position: fixed;
                    top: -10%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 600px;
                    height: 400px;
                    background: radial-gradient(ellipse, rgba(201,162,39,0.16), transparent 70%);
                    pointer-events: none;
                    filter: blur(10px);
                }

                .fp-card {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 420px;
                    background: linear-gradient(180deg, var(--panel-2), var(--panel));
                    border: 1px solid var(--line);
                    border-radius: var(--radius);
                    padding: 40px 36px 32px;
                    box-shadow: 0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset;
                }

                .fp-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: var(--gold);
                    background: rgba(201,162,39,0.09);
                    border: 1px solid rgba(201,162,39,0.25);
                    padding: 5px 10px;
                    border-radius: 20px;
                    margin-bottom: 22px;
                }
                .fp-badge .fp-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: var(--gold);
                    box-shadow: 0 0 8px var(--gold);
                }

                .fp-h1 {
                    font-family: 'Fraunces', serif;
                    font-weight: 500;
                    font-size: 30px;
                    line-height: 1.15;
                    letter-spacing: -0.01em;
                    margin-bottom: 10px;
                }

                .fp-sub {
                    color: var(--text-lo);
                    font-size: 14.5px;
                    line-height: 1.55;
                    margin-bottom: 28px;
                }
                .fp-sub strong { color: var(--text-hi); font-weight: 500; }

                .fp-form { display: flex; flex-direction: column; gap: 8px; }

                .fp-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: var(--text-lo);
                    margin-bottom: 4px;
                }

                .fp-field {
                    position: relative;
                }

                .fp-input {
                    width: 100%;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--line);
                    border-radius: 10px;
                    padding: 14px 44px 14px 14px;
                    font-size: 15px;
                    color: var(--text-hi);
                    font-family: 'Inter', sans-serif;
                    transition: border-color 0.2s ease, background 0.2s ease;
                }
                .fp-input::placeholder { color: #4E5670; }
                .fp-input:focus {
                    outline: none;
                    border-color: var(--gold);
                    background: rgba(201,162,39,0.04);
                }
                .fp-input:focus-visible {
                    box-shadow: 0 0 0 3px rgba(201,162,39,0.18);
                }

                .fp-field svg {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 17px;
                    height: 17px;
                    stroke: #4E5670;
                    pointer-events: none;
                    transition: stroke 0.2s ease;
                }
                .fp-field:focus-within svg { stroke: var(--gold); }

                .fp-error-msg {
                    display: none;
                    align-items: center;
                    gap: 6px;
                    color: var(--danger);
                    font-size: 12.5px;
                    margin-top: 2px;
                    font-family: 'JetBrains Mono', monospace;
                }
                .fp-field.invalid .fp-input { border-color: var(--danger); }
                .fp-field.invalid + .fp-error-msg { display: flex; }

                .fp-submit {
                    margin-top: 20px;
                    width: 100%;
                    background: var(--gold);
                    color: #17130A;
                    border: none;
                    border-radius: 10px;
                    padding: 14px;
                    font-size: 15px;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: background 0.2s ease, transform 0.1s ease;
                }
                .fp-submit:hover { background: var(--gold-bright); }
                .fp-submit:active { transform: scale(0.99); }
                .fp-submit:disabled {
                    opacity: 0.7;
                    cursor: default;
                }
                .fp-submit:focus-visible {
                    outline: 2px solid var(--gold-bright);
                    outline-offset: 3px;
                }

                .fp-spinner {
                    width: 15px; height: 15px;
                    border-radius: 50%;
                    border: 2px solid rgba(23,19,10,0.3);
                    border-top-color: #17130A;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .fp-footer-link {
                    text-align: center;
                    margin-top: 26px;
                    font-size: 13.5px;
                    color: var(--text-lo);
                }
                .fp-footer-link a {
                    color: var(--gold);
                    text-decoration: none;
                    font-weight: 500;
                }
                .fp-footer-link a:hover { text-decoration: underline; }

                .fp-success {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 12px 4px 4px;
                }

                .fp-signal {
                    position: relative;
                    width: 84px;
                    height: 84px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 22px;
                }
                .fp-signal .fp-ring {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    border: 1px solid var(--gold);
                    opacity: 0;
                    animation: ping 2.2s ease-out infinite;
                }
                .fp-signal .fp-ring:nth-child(2) { animation-delay: 0.6s; }
                .fp-signal .fp-ring:nth-child(3) { animation-delay: 1.2s; }
                @keyframes ping {
                    0% { transform: scale(0.5); opacity: 0.7; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
                .fp-signal .fp-core {
                    position: relative;
                    width: 56px; height: 56px;
                    border-radius: 50%;
                    background: rgba(201,162,39,0.12);
                    border: 1px solid rgba(201,162,39,0.4);
                    display: flex; align-items: center; justify-content: center;
                }
                .fp-signal .fp-core svg { width: 24px; height: 24px; stroke: var(--gold); }

                .fp-success h2 {
                    font-family: 'Fraunces', serif;
                    font-weight: 500;
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .fp-success p {
                    color: var(--text-lo);
                    font-size: 14px;
                    line-height: 1.6;
                    max-width: 300px;
                }
                .fp-success p .fp-em { color: var(--text-hi); font-weight: 500; }

                .fp-resend-row {
                    margin-top: 22px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    color: var(--text-lo);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .fp-resend-row button {
                    background: none;
                    border: none;
                    color: var(--gold);
                    font-family: inherit;
                    font-size: inherit;
                    cursor: pointer;
                    padding: 0;
                }
                .fp-resend-row button:disabled {
                    color: #4E5670;
                    cursor: default;
                }

                @media (max-width: 460px) {
                    .fp-card { padding: 32px 24px 26px; }
                    .fp-h1 { font-size: 26px; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .fp-signal .fp-ring { animation: none; opacity: 0.3; }
                    .fp-spinner { animation: none; }
                }
            `}} />
            <div className="fp-container">
                <div className="fp-glow"></div>
                <div className="fp-card">
                    {!isSuccess ? (
                        <div id="requestView">
                            <span className="fp-badge"><span className="fp-dot"></span>Secure Recovery</span>
                            <h1 className="fp-h1">Reset your password</h1>
                            <p className="fp-sub">Enter the email on your account and <strong>we'll send a one-time link</strong> to set a new password. It stays valid for 15 minutes.</p>

                            <form className="fp-form" noValidate onSubmit={handleSubmit}>
                                <label htmlFor="email" className="fp-label">Email address</label>
                                <div className={`fp-field ${isInvalid ? 'invalid' : ''}`}>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        placeholder="you@company.com" 
                                        autoComplete="email" 
                                        className="fp-input"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setIsInvalid(false);
                                        }}
                                        disabled={isLoading}
                                    />
                                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 6l8 7 8-7"/></svg>
                                </div>
                                <div className="fp-error-msg">⚠ Enter a valid email address</div>

                                <button type="submit" className="fp-submit" disabled={isLoading}>
                                    {isLoading && <span className="fp-spinner"></span>}
                                    <span>{isLoading ? 'Sending…' : 'Send reset link'}</span>
                                </button>
                            </form>

                            <div className="fp-footer-link">Remembered it? <Link href="/login">Back to sign in</Link></div>
                        </div>
                    ) : (
                        <div className="fp-success" id="successView">
                            <div className="fp-signal">
                                <div className="fp-ring"></div>
                                <div className="fp-ring"></div>
                                <div className="fp-ring"></div>
                                <div className="fp-core">
                                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 6l8 7 8-7"/></svg>
                                </div>
                            </div>
                            <h2>Check your inbox</h2>
                            <p>We sent a reset link to <span className="fp-em">{email}</span>. Open it within 15 minutes to choose a new password.</p>

                            <div className="fp-resend-row">
                                {!canResend ? (
                                    <span>Didn't get it? Resend in <span>{countdown}</span>s</span>
                                ) : (
                                    <button onClick={handleResend} disabled={isLoading}>
                                        {isLoading ? 'Resending...' : 'Resend link'}
                                    </button>
                                )}
                            </div>

                            <div className="fp-footer-link">Wrong email? <a href="#" onClick={(e) => { e.preventDefault(); setIsSuccess(false); }}>Try again</a></div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
