'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FaUserPlus, FaArrowRight, FaLock } from 'react-icons/fa';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password
            });

            if (result?.error) {
                toast.error('Invalid email or password');
            } else {
                toast.success('Welcome back!');
                router.push('/dashboard');
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans text-slate-900 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                            <FaLock className="text-white text-2xl" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign in</h2>
                        <p className="text-slate-500 mt-2">Welcome back to BillGST</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-slate-900 text-sm font-medium mb-2 block">User name</label>
                            <input
                                name="email"
                                type="text"
                                required
                                className="w-full text-sm text-slate-900 border border-slate-200 px-4 py-3 rounded-xl outline-blue-600 bg-slate-50 focus:bg-white transition-all"
                                placeholder="Email or Username"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-slate-900 text-sm font-medium mb-2 block">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full text-sm text-slate-900 border border-slate-200 px-4 py-3 rounded-xl outline-blue-600 bg-slate-50 focus:bg-white transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    checked={formData.rememberMe}
                                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                                    Remember me
                                </label>
                            </div>
                            <Link href="/forgot-password" size="sm" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all shadow-lg shadow-blue-100"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'} <FaArrowRight />
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-slate-100 pt-8">
                        <p className="text-sm text-slate-600 flex items-center justify-center gap-1">
                            Don't have an account?
                            <Link href="/register" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                                <FaUserPlus className="text-xs" /> Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
