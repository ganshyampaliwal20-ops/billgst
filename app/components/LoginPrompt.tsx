'use client';

import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginPromptProps {
    message?: string;
    returnUrl?: string;
}

export default function LoginPrompt({
    message = "Please login to create invoices and save your data permanently",
    returnUrl
}: LoginPromptProps) {
    const router = useRouter();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FaSignInAlt className="text-3xl text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 text-center mb-3 italic">
                    First Create Account
                </h2>

                {/* Message */}
                <p className="text-slate-600 text-center mb-8 leading-relaxed font-medium">
                    {message === "Please login to create invoices and save your data permanently"
                        ? "Please create an account or login to use the full features of BillGST and save your data."
                        : message}
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link
                        href={returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'}
                        className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                        <FaSignInAlt />
                        Login to Continue
                    </Link>

                    <Link
                        href="/register"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-white text-indigo-600 font-bold rounded-xl border-2 border-indigo-200 hover:bg-indigo-50 transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                        <FaUserPlus />
                        Create New Account
                    </Link>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full py-3 text-slate-500 hover:text-slate-700 font-semibold text-sm transition-colors"
                    >
                        Go Back to Dashboard
                    </button>
                </div>

                {/* Benefits */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
                        Why Login?
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>Save your invoices permanently</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>Access from any device</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>Secure data backup</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
