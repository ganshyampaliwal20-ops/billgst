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
        <div className="relative z-50" ref={dropdownRef}>
            {/* Trigger Button - 3D & Premium */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    group relative flex items-center gap-3 px-5 py-3.5 
                    bg-gradient-to-br from-white via-slate-50 to-slate-100
                    text-slate-700 rounded-2xl transition-all duration-300
                    border border-white
                    shadow-[0_4px_0_0_rgb(203,213,225)] 
                    hover:shadow-[0_2px_0_0_rgb(203,213,225)] hover:translate-y-[2px]
                    active:shadow-none active:translate-y-[4px]
                    hover:text-indigo-600
                    w-full
                `}
                title={t.selectLanguage}
            >
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                    <FaLanguage size={20} />
                </div>
                {showLabel && (
                    <div className="flex flex-col items-start text-left flex-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Language</span>
                        <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                            {currentLang.nativeName}
                        </span>
                    </div>
                )}

                {/* 3D Edge Highlight */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 pointer-events-none"></div>
            </button>

            {/* Dropdown Menu - Glassmorphism & Animated */}
            {isOpen && (
                <div className="absolute left-0 bottom-full mb-4 w-72 max-h-[500px] overflow-y-auto 
                    bg-white/80 backdrop-blur-2xl rounded-3xl 
                    shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] 
                    border border-white/60 ring-1 ring-slate-900/5
                    z-50 p-3 animate-in fade-in slide-in-from-bottom-6 duration-300 origin-bottom"
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
