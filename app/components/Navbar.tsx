/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const { status } = useSession();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        
        // Check if running as a PWA / Play Store TWA
        if (typeof window !== 'undefined') {
            setIsStandalone(
                window.matchMedia('(display-mode: standalone)').matches || 
                document.referrer.includes('android-app://')
            );
        }
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Features', href: '/blog/features' },
        { name: 'Pricing', href: '#' },
        { name: 'Help', href: '#' },
    ];

    return (
        <>
            <nav className={`fixed left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg pb-3' : 'bg-transparent pb-5'
                }`} style={{ paddingTop: isStandalone ? 'max(env(safe-area-inset-top), 44px)' : (isScrolled ? '12px' : '20px') }}>
            <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md border-2 border-indigo-500/20 group-hover:border-indigo-500/50 transition-all bg-white p-1">
                                <Image
                                    src="/logo.png"
                                    alt="BillGST Logo"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none">
                                BillGST
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                                Invoice Expert
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-2"></div>

                        <div className="flex items-center gap-4">
                            {status === 'authenticated' ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-2"
                                    >
                                        <FaSignInAlt className="text-indigo-500" /> Login
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition shadow-lg shadow-indigo-200 flex items-center gap-2"
                                    >
                                        <FaUserPlus /> Register Free
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl transition-all duration-300 origin-top ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'
                }`}>
                <div className="px-4 py-6 space-y-4" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px' }}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-base font-bold text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-slate-50"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="pt-4 border-t border-slate-100 space-y-3 px-4">
                        {status === 'authenticated' ? (
                            <Link
                                href="/dashboard"
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl font-bold shadow-lg"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-bold"
                                >
                                    <FaSignInAlt /> Login
                                </Link>
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold shadow-lg"
                                >
                                    <FaUserPlus /> Register Free
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
        </>
    );
}
