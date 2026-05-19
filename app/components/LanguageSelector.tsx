'use client';

import { useStore } from '@/lib/store';
import { languages, translations } from '@/lib/translations';
import { FaLanguage, FaCheck } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSelector({ showLabel = true }: { showLabel?: boolean }) {
    const { settings, updateSettings } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = languages.find(l => l.code === settings.language) || languages[0];
    const t = translations[settings.language as keyof typeof translations] || translations.en;

    const handleSelect = (code: string) => {
        updateSettings({ language: code });
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Trigger Button - Professional Sidebar Integration */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between gap-4 px-4 py-3 
                    bg-white text-slate-700 rounded-2xl transition-all duration-300
                    border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0]
                    hover:-translate-y-1 hover:shadow-[0_8px_0_0_#cbd5e1] hover:text-indigo-600
                    active:translate-y-0 active:shadow-none
                    group
                `}
                title={t.selectLanguage}
            >
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300">
                        <FaLanguage size={20} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    <div className="flex flex-col items-start">
                        {showLabel && <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">{t.language}</span>}
                        <span className="text-sm font-bold tracking-wide">{currentLang.nativeName}</span>
                    </div>
                </div>

                <div className={`text-slate-400 group-hover:text-indigo-500 transition-transform duration-300 ${isOpen ? 'rotate-180 scale-125' : ''}`}>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
            </button>

            {/* Dropdown Menu - Glassmorphism & Animated */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 max-h-[500px] overflow-y-auto 
                    bg-white/95 backdrop-blur-2xl rounded-3xl 
                    shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] 
                    border border-white ring-1 ring-slate-900/5
                    z-[100] p-3 animate-in fade-in slide-in-from-top-6 duration-300 origin-top"
                >
                    <div className="sticky top-0 bg-white/50 backdrop-blur-md p-4 border-b border-slate-100/50 mb-2 -mx-3 -mt-3 rounded-t-3xl z-10 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.selectLanguage}</span>
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{languages.length}</span>
                    </div>

                    <div className="space-y-1">
                        {languages.map((lang) => {
                            const isSelected = settings.language === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => handleSelect(lang.code)}
                                    className={`
                                        w-full text-left px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all 
                                        flex items-center justify-between group/item border 
                                        relative overflow-hidden
                                        ${isSelected
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/25'
                                            : 'bg-white/50 hover:bg-white text-slate-600 border-transparent hover:border-slate-200 hover:shadow-md hover:text-indigo-700'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        <span className={`text-lg ${!isSelected && 'grayscale opacity-70 group-hover/item:grayscale-0 group-hover/item:opacity-100 transition-all'}`}>
                                            {/* Flag emoji logic could go here, using generic text for now */}
                                            {lang.code === 'en' ? '🇬🇧' :
                                                lang.code === 'hi' ? '🇮🇳' :
                                                    lang.code === 'gu' ? '🇮🇳' : '🇮🇳'}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{lang.nativeName}</span>
                                            <span className={`text-[10px] uppercase tracking-wide font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-400 group-hover/item:text-indigo-400'}`}>
                                                {lang.name}
                                            </span>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="bg-white/20 p-1 rounded-full relative z-10">
                                            <FaCheck size={10} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
