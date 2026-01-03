'use client';

import { FaRocket, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface ComingSoonProps {
    title: string;
    description?: string;
}

export default function ComingSoon({ title, description = "We're working hard to bring this feature to you soon!" }: ComingSoonProps) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <FaRocket className="text-4xl text-indigo-600" />
            </div>
            <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">{title}</h1>
            <p className="text-slate-500 max-w-md mb-8 font-medium">
                {description}
            </p>
            <div className="flex gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-black transition font-bold shadow-lg">
                    <FaArrowLeft /> Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
