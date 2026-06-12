'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaMicrophone, FaTimes, FaRobot, FaVolumeUp, FaArrowsAlt, FaStop } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface VoiceAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VoiceAssistant({ isOpen, onClose }: VoiceAssistantProps) {
    const router = useRouter();
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
        let isMounted = true;
        const initSpeech = async () => {
            try {
                const { Capacitor } = await import('@capacitor/core');
                if (Capacitor.isNativePlatform()) {
                    // Mobile logic handled in startListening
                    return;
                }
            } catch(e) {}
            
            if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
                const SpeechRecognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
                recognitionRef.current = new SpeechRecognitionClass();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'hi-IN';

                recognitionRef.current.onstart = () => {
                    isEngineActive.current = true;
                };

                recognitionRef.current.onresult = (event: any) => {
                    let text = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        text += event.results[i][0].transcript;
                    }
                    if (text) {
                        setTranscript(text);
                        transcriptRef.current = text;
                    }
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

                    if (event.error === 'no-speech') {
                        toast.error('Awaaz nahi aayi. Mic check karein ya type karein.');
                        return;
                    }

                    if (event.error === 'network') {
                        toast.error('Network Error: Please check your internet connection.');
                    } else if (event.error === 'not-allowed') {
                        toast.error('Microphone access denied. Please enable it in browser settings.');
                    } else {
                        toast.error(`Voice Error: ${event.error}. Please try again.`);
                    }
                };
            }
        };
        initSpeech();

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            isMounted = false;
        };
    }, []);

    const startListening = async () => {
        if (isListening || isProcessing) return;

        if (!recognitionRef.current) {
            toast.error('Voice support nahi hai. Please type karein.');
            return;
        }

        try {
            const { isNativeApp, getNativePlugin } = await import('@/lib/utils');
            if (isNativeApp()) {
                const SpeechRecognition = getNativePlugin('SpeechRecognition');
                if (SpeechRecognition) {
                    const hasPerm = await SpeechRecognition.checkPermissions();
                    if (hasPerm.speechRecognition !== 'granted') {
                        const request = await SpeechRecognition.requestPermissions();
                        if (request.speechRecognition !== 'granted') {
                            toast.error('Microphone permission denied! Browser ya Settings se allow karein.');
                            return;
                        }
                    }
                    
                    setTranscript('');
                    transcriptRef.current = '';
                    setReply('');
                    setIsListening(true);
                    
                    try {
                        const result = await SpeechRecognition.start({
                            language: 'hi-IN',
                            maxResults: 1,
                            prompt: 'Speak now...',
                            partialResults: false,
                            popup: false,
                        });
                        
                        setIsListening(false);
                        if (result.matches && result.matches.length > 0) {
                            const recognizedText = result.matches[0];
                            setTranscript(recognizedText);
                            transcriptRef.current = recognizedText;
                            handleProcessVoice(recognizedText);
                        }
                    } catch(e) {
                        setIsListening(false);
                        toast.error('Voice recognition failed. Aap type kar sakte hain.');
                    }
                    return;
                }
            }
        } catch(e) {}

        if (isEngineActive.current) return;
        isEngineActive.current = true;

        try {
            setTranscript('');
            transcriptRef.current = '';
            setReply('');
            setIsListening(true);
            recognitionRef.current?.start();
        } catch (error: any) {
            console.error('Start listening error:', error);
            if (error.name === 'InvalidStateError') {
                setIsListening(true);
            } else {
                toast.error('Could not start microphone');
                setIsListening(false);
                isEngineActive.current = false;
            }
        }
    };

    const stopListening = () => {
        setIsListening(false);
        isEngineActive.current = false;
        recognitionRef.current?.stop();
    };

        const handleProcessVoice = async (text: string) => {
        if (!text.trim()) return;
        setIsProcessing(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second strict timeout on frontend
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await response.json();
            setReply(data.reply);
            speakOutput(data.reply);

            if (data.action && data.action.toUpperCase() === 'NAVIGATE' && data.path) {
                toast.success('Bill banane ja raha hu...');
                setTimeout(() => {
                    router.push(data.path);
                }, 1000);
            } else if (data.action && data.action.toUpperCase() !== 'REPLY') {
                toast.error('Action samajh nahi aaya: ' + data.action);
            }
        } catch (error: any) {
            toast.error('API Error: ' + error.message);
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

    useEffect(() => {
        if (!isOpen) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            isEngineActive.current = false;
        } else {
            // Initialize position when opened
            if (modalRef.current && position.x === 0 && position.y === 0) {
                const modalWidth = modalRef.current.offsetWidth;
                const modalHeight = modalRef.current.offsetHeight;
                setPosition({
                    x: (window.innerWidth - modalWidth) / 2,
                    y: (window.innerHeight - modalHeight) / 2
                });
            }
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
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div
                ref={modalRef}
                onMouseDown={handleMouseDown}
                style={{
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
                className="w-full min-w-[320px] max-w-[480px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-white/60 p-6 flex flex-col items-center gap-5 relative overflow-hidden"
            >
                {/* Close Button */}
                <button
                    onClick={() => {
                        window.speechSynthesis.cancel();
                        onClose();
                    }}
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-2"
                >
                    <FaTimes size={16} />
                </button>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-rose-500 animate-pulse' : isProcessing ? 'bg-indigo-500 animate-bounce' : 'bg-emerald-500'}`}></div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                        {isListening ? 'Listening...' : isProcessing ? 'Robo is thinking...' : 'Ready'}
                    </span>
                </div>

                {/* Transcript & Reply */}
                <div className="w-full text-center space-y-2 min-h-[50px] flex flex-col justify-center">
                    {!transcript && !reply && (
                        <p className="text-slate-400 text-base font-medium">Boliye, "Rahul ka 500 ka bill banao"</p>
                    )}
                    {transcript && (
                        <p className="text-slate-800 text-lg font-bold italic">"{transcript}"</p>
                    )}
                    {reply && (
                        <p className="text-indigo-600 text-base font-semibold">{reply}</p>
                    )}
                </div>

                {/* Controls Area */}
                <div className="w-full flex flex-col gap-3 mt-2">
                    
                    {/* Row 1: Typing Input and Send Button */}
                    <div className="w-full flex items-center gap-2">
                        <input 
                            type="text" 
                            placeholder="Ya yaha type karein..." 
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all shadow-inner"
                            value={transcript}
                            onChange={(e) => {
                                setTranscript(e.target.value);
                                transcriptRef.current = e.target.value;
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleProcessVoice(transcriptRef.current);
                                }
                            }}
                            disabled={isListening || isProcessing}
                        />
                        <button
                            onClick={() => transcript.trim() && handleProcessVoice(transcript)}
                            disabled={!transcript.trim() || isProcessing}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                transcript.trim() && !isProcessing
                                ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer shadow-md shadow-green-500/30 hover:scale-105 active:scale-95'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                            title="Bhejein"
                        >
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-5 h-5 -ml-1" xmlns="http://www.w3.org/2000/svg"><path d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"></path></svg>
                        </button>
                    </div>

                    {/* Row 2: Full Width AI Voice Button */}
                    <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={isProcessing}
                        className={`w-full p-4 rounded-2xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 font-bold text-sm ${
                            isListening 
                            ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse shadow-rose-500/30'
                            : isProcessing
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/30'
                        }`}
                        title="Bol kar likhein"
                    >
                        {isListening ? (
                            <>
                                <FaStop size={18} />
                                Stop Listening
                            </>
                        ) : (
                            <>
                                <FaMicrophone size={18} />
                                Tap to Speak (AI Voice)
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
