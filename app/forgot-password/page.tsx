'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Password reset link sent to your email!');
            setEmail('');
        } catch (error) {
            toast.error('Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans text-slate-900">
            <div className="py-6 px-4 w-full">
                <div className="grid lg:grid-cols-2 items-center gap-6 max-w-6xl w-full mx-auto">
                    <div className="border border-slate-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-lg:mx-auto w-full">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="mb-12">
                                <h1 className="text-slate-900 text-3xl font-semibold">Forgot Password</h1>
                                <p className="text-slate-600 text-[15px] mt-6 leading-relaxed">Enter your email address and we'll send you a link to reset your password.</p>
                            </div>

                            <div>
                                <label className="text-slate-900 text-sm font-medium mb-2 block">Email Address</label>
                                <div className="relative flex items-center">
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full text-sm text-slate-900 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" className="w-[18px] h-[18px] absolute right-4 pointer-events-none" viewBox="0 0 24 24">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="!mt-12">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                                </button>
                                <p className="text-sm !mt-6 text-center text-slate-600">Remember your password? <Link href="/login" className="text-blue-600 font-medium hover:underline ml-1 whitespace-nowrap">Sign in here</Link></p>
                            </div>
                        </form>
                    </div>

                    <div className="max-lg:mt-8">
                        <img src="https://readymadeui.com/login-image.webp" className="w-full aspect-[71/50] max-lg:w-4/5 mx-auto block object-cover opacity-80" alt="forgot password img" />
                    </div>
                </div>
            </div>
        </div>
    );
}
