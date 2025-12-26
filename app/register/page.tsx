'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
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
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 font-sans antialiased text-white">
            {/* Background: Purple Gradient & Stars */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#7e22ce] via-[#6b21a8] to-[#1e1b4b]">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(1px_1px_at_20px_30px,#fff,transparent),radial-gradient(1px_1px_at_40px_70px,#fff,transparent),radial-gradient(2px_2px_at_50px_160px,#fff,transparent),radial-gradient(2px_2px_at_80px_120px,#fff,transparent),radial-gradient(1px_1px_at_110px_210px,#fff,transparent),radial-gradient(2px_2px_at_150px_180px,#fff,transparent)] bg-[length:200px_250px] animate-pulse"></div>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(1px_1px_at_10px_10px,#fff,transparent),radial-gradient(1.5px_1.5px_at_100px_100px,#fff,transparent),radial-gradient(2px_2px_at_200px_200px,#fff,transparent)] bg-[length:400px_400px]"></div>
            </div>

            {/* Mountains Silhouette */}
            <div className="absolute bottom-0 w-full z-10 pointer-events-none opacity-80">
                <svg viewBox="0 0 1440 320" className="w-full h-auto translate-y-2">
                    <path fill="#0f172a" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,218.7C672,213,768,171,864,160C960,149,1056,171,1152,192C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    <path fill="#1e1b4b" fillOpacity="0.8" d="M0,288L60,277.3C120,267,240,245,360,245.3C480,245,600,267,720,272C840,277,960,267,1080,250.7C1200,235,1320,213,1380,202.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                </svg>
            </div>

            {/* Register Glass Card */}
            <div className="relative z-20 w-full max-w-[460px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[50px] p-12 md:p-16 shadow-2xl animate-fadeIn overflow-y-auto max-h-[95vh]">
                <h1 className="text-4xl font-extrabold text-center mb-12 tracking-tight">Register</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name Input */}
                    <div className="relative">
                        <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-transparent border-2 border-white/30 rounded-full px-10 py-5 outline-none focus:border-white transition-all text-sm placeholder:text-white/60 pr-16"
                        />
                        <FaUser className="absolute right-8 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={18} />
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                        <input
                            type="email"
                            required
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-transparent border-2 border-white/30 rounded-full px-10 py-5 outline-none focus:border-white transition-all text-sm placeholder:text-white/60 pr-16"
                        />
                        <FaEnvelope className="absolute right-8 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={18} />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <input
                            type="password"
                            required
                            minLength={6}
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-transparent border-2 border-white/30 rounded-full px-10 py-5 outline-none focus:border-white transition-all text-sm placeholder:text-white/60 pr-16"
                        />
                        <FaLock className="absolute right-8 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={18} />
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative">
                        <input
                            type="password"
                            required
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full bg-transparent border-2 border-white/30 rounded-full px-10 py-5 outline-none focus:border-white transition-all text-sm placeholder:text-white/60 pr-16"
                        />
                        <FaLock className="absolute right-8 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" size={18} />
                    </div>

                    {/* Register Button Container */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-slate-900 font-extrabold py-5 rounded-full hover:bg-white/90 active:scale-[0.98] transition-all text-xl shadow-2xl uppercase tracking-wide"
                        >
                            {isLoading ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>

                    {/* Login Link */}
                    <div className="text-center text-[18px] pt-10">
                        <p className="font-medium text-white/80">
                            Already have an account?{' '}
                            <Link href="/login" className="text-white font-black hover:underline ml-2 italic">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
