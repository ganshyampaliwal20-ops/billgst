'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!token) {
            toast.error('Invalid or missing token');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            toast.success('Password reset successfully! Please login.');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans text-slate-900">
                <div className="p-6 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h1>
                    <p className="mb-4">The password reset link is invalid or expired.</p>
                    <Link href="/forgot-password" className="text-blue-600 hover:underline">Request a new link</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans text-slate-900">
            <div className="py-6 px-4 w-full">
                <div className="grid lg:grid-cols-2 items-center gap-6 max-w-6xl w-full mx-auto">
                    <div className="border border-slate-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-lg:mx-auto w-full">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="mb-12">
                                <h1 className="text-slate-900 text-3xl font-semibold">Reset Password</h1>
                                <p className="text-slate-600 text-[15px] mt-6 leading-relaxed">Enter your new password below.</p>
                            </div>

                            <div>
                                <label className="text-slate-900 text-sm font-medium mb-2 block">New Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full text-sm text-slate-900 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="text-slate-900 text-sm font-medium mb-2 block">Confirm Password</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="w-full text-sm text-slate-900 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    minLength={6}
                                />
                            </div>

                            <div className="!mt-12">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                                </button>
                                <p className="text-sm !mt-6 text-center text-slate-600">
                                    <Link href="/login" className="text-blue-600 font-medium hover:underline ml-1 whitespace-nowrap">Back to Login</Link>
                                </p>
                            </div>
                        </form>
                    </div>

                    <div className="max-lg:mt-8">
                        <img src="https://readymadeui.com/login-image.webp" className="w-full aspect-[71/50] max-lg:w-4/5 mx-auto block object-cover opacity-80" alt="reset password img" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
