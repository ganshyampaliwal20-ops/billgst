'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

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
                toast.success('Login successful!');
                router.push('/dashboard'); // Or back to landing page if needed
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans text-slate-900">
            <div className="py-8 px-6 w-full">
                <div className="grid lg:grid-cols-2 items-center gap-6 max-w-6xl w-full mx-auto">
                    <div className="border border-slate-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-lg:mx-auto w-full">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="mb-12">
                                <h1 className="text-slate-900 text-3xl font-semibold" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px' }}>Sign in</h1>
                                <p className="text-slate-600 text-[15px] mt-6 leading-relaxed" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px' }}>Sign in to your account and explore a world of possibilities. Your journey begins here.</p>
                            </div>

                            <div>
                                <label className="text-slate-900 text-sm font-medium mb-2 block" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px' }}>User name</label>
                                <div className="relative flex items-center" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '5px' }}>
                                    <input
                                        name="email"
                                        type="text"
                                        required
                                        className="w-full text-sm text-slate-900 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="Enter user name"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={isLoading}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" className="w-[18px] h-[18px] absolute right-4 pointer-events-none" viewBox="0 0 24 24">
                                        <circle cx="10" cy="7" r="6" data-original="#000000"></circle>
                                        <path d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z" data-original="#000000"></path>
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-900 text-sm font-medium mb-2 block" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '5px' }}>Password</label>
                                <div className="relative flex items-center" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '1px' }}>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full text-sm text-slate-900 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        disabled={isLoading}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" className="w-[18px] h-[18px] absolute right-4 cursor-pointer" viewBox="0 0 128 128">
                                        <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z" data-original="#000000"></path>
                                    </svg>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-4" style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '8px' }}>
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                                        checked={formData.rememberMe}
                                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                    />
                                    <label htmlFor="remember-me" className="ml-3 block text-sm text-slate-900 cursor-pointer">
                                        Remember me
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <Link href="/forgot-password" className="text-blue-600 hover:underline font-medium">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>

                            <div className="!mt-12">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? 'Signing in...' : 'Sign in'}
                                </button>
                                <p className="text-sm !mt-6 text-center text-slate-600">Don't have an account <Link href="/register" className="text-blue-600 font-medium hover:underline ml-1 whitespace-nowrap">Register here</Link></p>
                            </div>
                        </form>
                    </div>

                    <div className="max-lg:mt-8">
                        <img src="https://readymadeui.com/login-image.webp" className="w-full aspect-[71/50] max-lg:w-4/5 mx-auto block object-cover" alt="login img" />
                    </div>
                </div>
            </div>
        </div>
    );
}
