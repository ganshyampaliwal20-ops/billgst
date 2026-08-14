'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { FaRobot, FaCheckCircle, FaSpinner, FaTimes, FaBolt } from 'react-icons/fa';

export default function AICopilotLiveHUD() {
    const aiCopilotAction = useStore((state: any) => state.aiCopilotAction);
    const clearAiCopilotAction = useStore((state: any) => state.clearAiCopilotAction);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!aiCopilotAction) return;

        // Auto close after 3.5 seconds of completion
        if (aiCopilotAction.isComplete) {
            const timer = setTimeout(() => {
                clearAiCopilotAction();
            }, 3500);
            return () => clearTimeout(timer);
        }

        // Safety fallback: if action is running for more than 10s without completion, auto-dismiss
        const safetyTimer = setTimeout(() => {
            clearAiCopilotAction();
        }, 10000);

        return () => clearTimeout(safetyTimer);
    }, [aiCopilotAction, clearAiCopilotAction]);

    if (!aiCopilotAction || !aiCopilotAction.isVisible) return null;

    const { title, subtitle, steps = [], currentStep = 0, progress = 0, isComplete } = aiCopilotAction;

    return (
        <div 
            className="fixed bottom-24 sm:bottom-6 left-0 right-0 mx-auto z-[100000] w-[92%] max-w-[500px] transition-all duration-300 animate-slideUp"
            style={{ 
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                filter: 'drop-shadow(0 15px 35px rgba(15, 10, 40, 0.55))' 
            }}
        >
            <div 
                className={`relative overflow-hidden rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
                    isComplete 
                        ? 'bg-gradient-to-r from-[#0F281E]/95 via-[#133E2B]/95 to-[#0F281E]/95 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.35)]' 
                        : 'bg-gradient-to-r from-[#17123A]/95 via-[#231A56]/95 to-[#17123A]/95 border-indigo-500/50 shadow-[0_0_35px_rgba(99,102,241,0.35)]'
                } p-3 sm:p-3.5 text-white`}
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
                <div className="flex items-center justify-between gap-2.5 relative z-10">
                    {/* Bot Icon with glowing pulse */}
                    <div className="relative flex-shrink-0">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold shadow-lg transition-transform ${
                            isComplete 
                                ? 'bg-emerald-500 text-white scale-105' 
                                : 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white animate-pulse'
                        }`}>
                            {isComplete ? <FaCheckCircle size={18} /> : <FaRobot size={18} />}
                        </div>
                        {!isComplete && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                            </span>
                        )}
                    </div>

                    {/* Action Text info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                                isComplete 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1'
                            }`}>
                                {!isComplete && <FaBolt className="text-amber-400 text-[8px] animate-bounce" />}
                                {isComplete ? 'Completed' : 'AI Copilot'}
                            </span>
                            <span className="text-[11px] text-white/60 font-medium truncate">
                                {title || 'BillGST AI'}
                            </span>
                        </div>
                        <div className="text-xs sm:text-[13px] font-semibold text-white/95 mt-0.5 truncate flex items-center gap-1.5">
                            {!isComplete && <FaSpinner className="animate-spin text-indigo-400 text-[11px] flex-shrink-0" />}
                            <span className="truncate">{subtitle || 'Processing...'}</span>
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {steps.length > 0 && (
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10.5px] font-medium transition-colors"
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
                <div className="mt-2 w-full bg-white/15 rounded-full h-1.5 overflow-hidden">
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
                    <div className="mt-2.5 pt-2.5 border-t border-white/15 flex flex-col gap-1 animate-fadeIn max-h-[160px] overflow-y-auto">
                        {steps.map((step: any, idx: number) => {
                            const isDone = step.status === 'done' || idx < currentStep;
                            const isActive = step.status === 'active' || idx === currentStep;

                            return (
                                <div 
                                    key={step.id || idx}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-lg text-[11.5px] transition-all ${
                                        isActive 
                                            ? 'bg-indigo-500/25 border border-indigo-400/40 text-white font-medium shadow-sm' 
                                            : isDone 
                                                ? 'text-emerald-300 font-normal opacity-90' 
                                                : 'text-white/40'
                                    }`}
                                >
                                    <div className="flex-shrink-0">
                                        {isDone ? (
                                            <FaCheckCircle className="text-emerald-400 text-[11px]" />
                                        ) : isActive ? (
                                            <FaSpinner className="animate-spin text-indigo-300 text-[11px]" />
                                        ) : (
                                            <div className="w-2.5 h-2.5 rounded-full border border-white/30" />
                                        )}
                                    </div>
                                    <span className="flex-1 truncate">{step.label || step.text}</span>
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
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
