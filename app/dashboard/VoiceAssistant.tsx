'use client';

import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaTimes, FaRobot, FaVolumeUp, FaArrowsAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface VoiceAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VoiceAssistant({ isOpen, onClose }: VoiceAssistantProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [reply, setReply] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const recognitionRef = useRef<any>(null);
    const transcriptRef = useRef('');
    const isEngineActive = useRef(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'hi-IN';

            recognitionRef.current.onstart = () => {
                isEngineActive.current = true;
            };

            recognitionRef.current.onresult = (event: any) => {
                const current = event.resultIndex;
                const result = event.results[current][0].transcript;
                setTranscript(result);
                transcriptRef.current = result;
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                isEngineActive.current = false;
                if (transcriptRef.current) {
                    handleProcessVoice(transcriptRef.current);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
                isEngineActive.current = false;

                if (event.error === 'no-speech') return;

                if (event.error === 'network') {
                    toast.error('Network Error: Please check your internet connection for voice recognition.', { duration: 5000 });
                } else if (event.error === 'not-allowed') {
                    toast.error('Microphone access denied. Please enable it in browser settings.');
                } else {
                    toast.error(`Voice Error: ${event.error}. Please try again.`);
                }
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = () => {
        if (isListening || isProcessing || isEngineActive.current) return;

        try {
            setTranscript('');
            transcriptRef.current = '';
            setReply('');
            setIsListening(true);
            recognitionRef.current?.start();
        } catch (error: any) {
            console.error('Start listening error:', error);
            if (error.name === 'InvalidStateError') {
                // Already started, sync state
                setIsListening(true);
            } else {
                toast.error('Could not start microphone');
                setIsListening(false);
            }
        }
    };

    const stopListening = () => {
        setIsListening(false);
        recognitionRef.current?.stop();
    };

    const handleProcessVoice = async (text: string) => {
        setIsProcessing(true);
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });
            const data = await response.json();
            setReply(data.reply);
            speakOutput(data.reply);
        } catch (error) {
            toast.error('AI Processing error');
        } finally {
            setIsProcessing(false);
        }
    };

    const speakOutput = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'hi-IN';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.drag-handle')) {
            e.preventDefault();
            setIsDragging(true);

            const rect = modalRef.current?.getBoundingClientRect();
            if (rect) {
                setDragStart({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
            }
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging && modalRef.current) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            // Keep within viewport bounds
            const modalWidth = modalRef.current.offsetWidth;
            const modalHeight = modalRef.current.offsetHeight;
            const maxX = window.innerWidth - modalWidth;
            const maxY = window.innerHeight - modalHeight;

            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY))
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Initialize center position on mount
    useEffect(() => {
        if (isOpen && modalRef.current && position.x === 0 && position.y === 0) {
            const modalWidth = modalRef.current.offsetWidth;
            const modalHeight = modalRef.current.offsetHeight;
            setPosition({
                x: (window.innerWidth - modalWidth) / 2,
                y: (window.innerHeight - modalHeight) / 2
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStart]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <button
                onClick={() => {
                    window.speechSynthesis.cancel();
                    onClose();
                }}
                className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-20"
            >
                <FaTimes size={32} />
            </button>

            <div
                ref={modalRef}
                onMouseDown={handleMouseDown}
                style={{
                    position: 'absolute',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    cursor: isDragging ? 'grabbing' : 'default'
                }}
                className="w-full max-w-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-[3rem] shadow-2xl border border-white/10 relative overflow-hidden text-center"
            >
                {/* Drag Handle Header */}
                <div className="drag-handle cursor-grab active:cursor-grabbing bg-white/5 border-b border-white/10 p-4 flex items-center justify-center gap-3 rounded-t-[3rem]">
                    <FaArrowsAlt className="text-white/40 text-sm" />
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest">Drag to Move</p>
                </div>

                {/* Background Glow */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]"></div>

                <div className="relative z-10 flex flex-col items-center gap-8 p-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-500">
                        <FaRobot className="text-white text-5xl" />
                    </div>

                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                        {isListening ? 'Listening...' : isProcessing ? 'Thinking...' : 'AI Business Advisor'}
                    </h2>

                    {/* Voice Wave Animation */}
                    <div className="flex items-center justify-center gap-1 h-20">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                                key={i}
                                className={`w-2 bg-indigo-400 rounded-full transition-all duration-300 ${isListening ? 'animate-bounce' : 'h-2 opacity-20'}`}
                                style={{
                                    height: isListening ? `${20 + Math.random() * 80}%` : '8px',
                                    animationDelay: `${i * 0.1}s`
                                }}
                            ></div>
                        ))}
                    </div>

                    {/* Tips, Transcript & Reply Section */}
                    <div className="w-full space-y-6">
                        {!transcript && !reply && !isListening && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-indigo-400 text-[10px] font-black uppercase mb-1">Stock Queries</p>
                                    <p className="text-white/60 text-xs">"Mere paas kitna maal bacha hai?"</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-emerald-400 text-[10px] font-black uppercase mb-1">Help with Billing</p>
                                    <p className="text-white/60 text-xs">"GST bill kaise banaye?"</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-amber-400 text-[10px] font-black uppercase mb-1">Reports</p>
                                    <p className="text-white/60 text-xs">"Meri aaj ki sale kitni huyi?"</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-rose-400 text-[10px] font-black uppercase mb-1">Security</p>
                                    <p className="text-white/60 text-xs">"Kya mera data safe hai?"</p>
                                </div>
                            </div>
                        )}

                        {transcript && (
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-2">You Asked:</p>
                                <p className="text-white text-xl font-bold italic">"{transcript}"</p>
                            </div>
                        )}

                        {reply && (
                            <div className="bg-indigo-600/20 border border-indigo-500/30 p-6 rounded-2xl animate-in slide-in-from-bottom-5">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <FaVolumeUp className="text-indigo-400 animate-pulse" />
                                    <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">AI Suggestion:</p>
                                </div>
                                <p className="text-white text-lg font-medium leading-relaxed">{reply}</p>
                            </div>
                        )}
                    </div>

                    {/* Start/Stop Button */}
                    {!isProcessing && (
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`
                                group relative px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-2xl
                                ${isListening
                                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                                    : 'bg-white text-indigo-900 hover:scale-105 active:scale-95'}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <FaMicrophone className={isListening ? 'animate-pulse' : ''} />
                                {isListening ? 'Stop Listening' : 'Click to Speak'}
                            </div>
                            <div className={`absolute inset-0 rounded-full border-2 border-white/20 -m-1 group-hover:-m-2 transition-all ${isListening ? 'animate-ping' : ''}`}></div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
