'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { FaRobot, FaCheckCircle, FaSpinner, FaTimes, FaBolt, FaMagic } from 'react-icons/fa';

export default function AICopilotLiveHUD() {
    const aiCopilotAction = useStore((state: any) => state.aiCopilotAction);
    const clearAiCopilotAction = useStore((state: any) => state.clearAiCopilotAction);
    const [isExpanded, setIsExpanded] = useState(false);
    const [dismissTimer, setDismissTimer] = useState<any>(null);

    useEffect(() => {
        if (!aiCopilotAction) return;

        if (aiCopilotAction.isComplete) {
            // Auto close after 5 seconds of completion
            const timer = setTimeout(() => {
                clearAiCopilotAction();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [aiCopilotAction, clearAiCopilotAction]);

    if (!aiCopilotAction || !aiCopilotAction.isVisible) return null;

    const { title, subtitle, steps = [], currentStep = 0, progress = 0, isComplete } = aiCopilotAction;

    return (
        <div 
            className="fixed top-3 left-1/2 -translate-x-1/2 z-[100000] w-[95%] max-w-[540px] transition-all duration-300 animate-fadeIn"
            style={{ filter: 'drop-shadow(0 15px 35px rgba(30, 20, 70, 0.45))' }}
        >
            <div 
                className={`relative overflow-hidden rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
                    isComplete 
                        ? 'bg-gradient-to-r from-[#0F281E]/95 via-[#133E2B]/95 to-[#0F281E]/95 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.35)]' 
                        : 'bg-gradient-to-r from-[#17123A]/95 via-[#231A56]/95 to-[#17123A]/95 border-indigo-500/50 shadow-[0_0_35px_rgba(99,102,241,0.35)]'
                } p-3.5 text-white`}
            >
                {/* Live Shimmer Overlay */}
                <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2.5s infinite linear'
                    }}
                />

                {/* Main Row */}
                <div className="flex items-center justify-between gap-3 relative z-10">
                    {/* Bot Icon with glowing pulse */}
                    <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg transition-transform ${
                            isComplete 
                                ? 'bg-emerald-500 text-white scale-105' 
                                : 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white animate-pulse'
                        }`}>
                            {isComplete ? <FaCheckCircle size={20} /> : <FaRobot size={20} />}
                        </div>
                        {!isComplete && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </span>
                        )}
                    </div>

                    {/* Action Text info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10.5px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                                isComplete 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1'
                            }`}>
                                {!isComplete && <FaBolt className="text-amber-400 text-[9px] animate-bounce" />}
                                {isComplete ? 'Completed' : 'AI Copilot Active'}
                            </span>
                            <span className="text-[11px] text-white/60 font-medium truncate">
                                {title || 'BillGST Assistant'}
                            </span>
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-white/95 mt-0.5 truncate flex items-center gap-1.5">
                            {!isComplete && <FaSpinner className="animate-spin text-indigo-400 text-xs flex-shrink-0" />}
                            <span className="truncate">{subtitle || 'Kaam chal raha hai...'}</span>
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {steps.length > 0 && (
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-medium transition-colors"
                            >
                                {isExpanded ? 'Hide' : `Steps (${Math.min(currentStep, steps.length)}/${steps.length})`}
                            </button>
                        )}
                        <button 
                            onClick={clearAiCopilotAction}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                            title="Close"
                        >
                            <FaTimes size={11} />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2.5 w-full bg-white/15 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                            isComplete 
                                ? 'bg-emerald-400 shadow-[0_0_10px_#34D399]' 
                                : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 shadow-[0_0_10px_#818CF8]'
                        }`}
                        style={{ width: `${Math.max(5, progress)}%` }}
                    />
                </div>

                {/* Expandable Steps Drawer */}
                {isExpanded && steps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/15 flex flex-col gap-1.5 animate-fadeIn">
                        {steps.map((step: any, idx: number) => {
                            const isDone = step.status === 'done' || idx < currentStep;
                            const isActive = step.status === 'active' || idx === currentStep;

                            return (
                                <div 
                                    key={step.id || idx}
                                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                        isActive 
                                            ? 'bg-indigo-500/25 border border-indigo-400/40 text-white font-medium shadow-sm' 
                                            : isDone 
                                                ? 'text-emerald-300 font-normal opacity-90' 
                                                : 'text-white/40'
                                    }`}
                                >
                                    <div className="flex-shrink-0">
                                        {isDone ? (
                                            <FaCheckCircle className="text-emerald-400 text-xs" />
                                        ) : isActive ? (
                                            <FaSpinner className="animate-spin text-indigo-300 text-xs" />
                                        ) : (
                                            <div className="w-3 h-3 rounded-full border border-white/30" />
                                        )}
                                    </div>
                                    <span className="flex-1">{step.label || step.text}</span>
                                    {isActive && (
                                        <span className="text-[10px] bg-indigo-500/40 text-indigo-200 px-1.5 py-0.5 rounded font-mono">
                                            working...
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}
