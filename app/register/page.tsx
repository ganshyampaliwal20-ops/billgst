'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        rememberMe: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.rememberMe) {
            toast.error('Please accept the Terms and Conditions');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Account created! Please login.');
                router.push('/login');
            } else {
                toast.error(data.error || 'Registration failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <div className="grid md:grid-cols-2 items-center gap-10 h-full">
                {/* Left Side: Image */}
                <div className="max-md:order-1 p-6 h-full flex items-center justify-center bg-white md:bg-transparent">
                    <img src="https://readymadeui.com/signin-image.webp" className="lg:max-w-[85%] w-full h-auto object-contain block mx-auto drop-shadow-md" alt="Register Illustration" />
                </div>

                {/* Right Side: Form (Dark Theme) */}
                <div className="flex items-center lg:p-14 p-8 bg-slate-900 h-full w-full lg:w-11/12 lg:ml-auto shadow-2xl relative">
                    <form className="max-w-lg w-full mx-auto space-y-8" onSubmit={handleSubmit}>
                        <div className="mb-10">
                            <h1 className="text-3xl font-bold text-indigo-400 tracking-wide">Create Account</h1>
                            <p className="text-slate-400 text-sm mt-2">Get started with your free account today.</p>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="text-slate-300 text-xs uppercase tracking-wider font-semibold block mb-2">Full Name</label>
                            <div className="relative flex items-center">
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="w-full bg-slate-800/50 text-sm text-white border-b border-slate-600 focus:border-indigo-400 px-3 py-3.5 outline-none transition-colors"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <FaUser className="absolute right-3 text-slate-500" size={16} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mt-6">
                            <label className="text-slate-300 text-xs uppercase tracking-wider font-semibold block mb-2">Email Address</label>
                            <div className="relative flex items-center">
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-slate-800/50 text-sm text-white border-b border-slate-600 focus:border-indigo-400 px-3 py-3.5 outline-none transition-colors"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <FaEnvelope className="absolute right-3 text-slate-500" size={16} />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mt-6">
                            <label className="text-slate-300 text-xs uppercase tracking-wider font-semibold block mb-2">Password</label>
                            <div className="relative flex items-center">
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full bg-slate-800/50 text-sm text-white border-b border-slate-600 focus:border-indigo-400 px-3 py-3.5 outline-none transition-colors"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <FaLock className="absolute right-3 text-slate-500 cursor-pointer" size={16} />
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-center mt-8">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 shrink-0 rounded cursor-pointer accent-indigo-500"
                                checked={formData.rememberMe}
                                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                            />
                            <label htmlFor="remember-me" className="text-slate-400 ml-3 block text-sm cursor-pointer select-none">
                                I accept the <Link href="/terms" className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-colors ml-1">Terms and Conditions</Link>
                            </label>
                        </div>

                        {/* Submit */}
                        <div className="mt-10">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full shadow-lg hover:shadow-indigo-500/20 py-3.5 px-6 text-sm text-white font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-all uppercase tracking-wide"
                            >
                                {isLoading ? 'Creating Account...' : 'Register Now'}
                            </button>
                            <p className="text-sm text-slate-400 mt-8 text-center bg-slate-800/50 py-3 rounded-lg">
                                Already have an account? <Link href="/login" className="text-indigo-400 font-bold hover:underline ml-1">Log in here</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
