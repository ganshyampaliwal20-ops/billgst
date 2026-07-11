'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaMicrophone, FaTimes, FaRobot, FaVolumeUp, FaArrowsAlt, FaStop } from 'react-icons/fa';
import { TbSend, TbMicrophone } from 'react-icons/tb';
import { toast } from 'react-hot-toast';
import { useStore } from '@/lib/store';

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
    const setAiDraftData = useStore((state: any) => state.setAiDraftData);
    const settings = useStore((state: any) => state.settings) || {};
    const isEn = settings.language === 'en';

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
                        toast.error(isEn ? 'No sound detected. Please check mic or type.' : 'Awaaz nahi aayi. Mic check karein ya type karein.');
                        return;
                    }

                    if (event.error === 'network') {
                        toast.error(isEn ? 'Network Error: Please check your internet connection.' : 'Network Error: Please check your internet connection.');
                    } else if (event.error === 'not-allowed') {
                        toast.error(isEn ? 'Microphone access denied. Please enable it in browser settings.' : 'Microphone access denied. Please enable it in browser settings.');
                    } else {
                        toast.error(isEn ? `Voice Error: ${event.error}. Please try again.` : `Voice Error: ${event.error}. Please try again.`);
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

        try {
            const { isNativeApp } = await import('@/lib/utils');
            if (isNativeApp()) {
                let SpeechRecognition;
                try {
                    const mod = await import('@capacitor-community/speech-recognition');
                    SpeechRecognition = mod.SpeechRecognition;
                } catch(e) {
                    console.error("Failed to load SpeechRecognition JS proxy", e);
                }
                
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
                        toast.error('Voice recognition failed. Kripya dobara koshish karein.');
                    }
                    return;
                }
            }
        } catch(e) {
            console.error("Native plugin check failed", e);
        }

        if (!recognitionRef.current) {
            toast.error(isEn ? 'Voice support not available. Please type.' : 'Voice support nahi hai. Please type karein.');
            return;
        }

        if (isEngineActive.current) return;
        isEngineActive.current = true;

        try {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.resume();
                const unlockUtterance = new SpeechSynthesisUtterance(' ');
                unlockUtterance.volume = 0; // silent unlock
                window.speechSynthesis.speak(unlockUtterance);
            }
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

    const stopListening = async () => {
        setIsListening(false);
        isEngineActive.current = false;
        recognitionRef.current?.stop();
        try {
            const { isNativeApp } = await import('@/lib/utils');
            if (isNativeApp()) {
                const mod = await import('@capacitor-community/speech-recognition');
                if (mod && mod.SpeechRecognition) {
                    await mod.SpeechRecognition.stop();
                }
            }
        } catch (e) {
            // ignore
        }
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
                body: JSON.stringify({ message: text, language: settings.language || 'hi' }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await response.json();
            setReply(data.reply);
            speakOutput(data.reply);

            if (data.action) {
                if (data.action === 'CREATE_INVOICE') {
                    setAiDraftData({ type: 'INVOICE', ...data.payload });
                    toast.success(isEn ? 'Creating bill...' : 'Bill banane ja raha hu...');
                    setTimeout(() => router.push('/dashboard/invoices/new'), 1000);
                } else if (data.action === 'MARK_ATTENDANCE') {
                    setAiDraftData({ type: 'ATTENDANCE', ...data.payload });
                    toast.success(isEn ? 'Opening attendance page...' : 'Attendance page khol raha hu...');
                    setTimeout(() => router.push('/dashboard/staff'), 1000);
                } else if (data.action === 'ADD_EXPENSE') {
                    setAiDraftData({ type: 'EXPENSE', ...data.payload });
                    toast.success(isEn ? 'Opening expense form...' : 'Expense form khol raha hu...');
                    setTimeout(() => router.push('/dashboard/expenses/new'), 1000);
                } else if (data.action === 'ADD_INVENTORY') {
                    setAiDraftData({ type: 'INVENTORY', ...data.payload });
                    toast.success(isEn ? 'Opening inventory form...' : 'Inventory form khol raha hu...');
                    setTimeout(() => router.push('/dashboard/inventory'), 1000);
                } else if (data.action === 'NAVIGATE') {
                    const path = data.payload?.path || data.path;
                    if (path) {
                        toast.success(isEn ? 'Opening page...' : 'Page khol raha hu...');
                        setTimeout(() => router.push(path), 1000);
                    }
                } else if (data.action !== 'REPLY') {
                    toast.error((isEn ? 'Action not understood: ' : 'Action samajh nahi aaya: ') + data.action);
                }
            }
        } catch (error: any) {
            toast.error('API Error: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const speakOutput = async (text: string) => {
        try {
            const { isNativeApp } = await import('@/lib/utils');
            if (isNativeApp()) {
                const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
                await TextToSpeech.stop();
                await TextToSpeech.speak({
                    text: text,
                    lang: 'hi-IN',
                    rate: 1.0,
                    pitch: 1.0,
                    category: 'ambient',
                });
                return;
            }
        } catch(e) {
            console.error('Native TTS error', e);
        }

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
        <div className="fixed bottom-[160px] md:bottom-32 right-4 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <style dangerouslySetInnerHTML={{__html: `
                .rx-card {
                  background: #ffffff;
                  border-radius: 18px;
                  width: 210px;
                  overflow: hidden;
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0,0,0,0.08);
                  border: 1px solid #e8eaf6;
                }

                .rx-header {
                  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d50 100%);
                  padding: 10px 12px;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  cursor: grab;
                }

                .rx-header-left {
                  display: flex;
                  align-items: center;
                  gap: 7px;
                }

                .rx-header-icon {
                  width: 24px;
                  height: 24px;
                  background: rgba(99,102,241,0.25);
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }

                .rx-header-title {
                  font-size: 12px;
                  font-weight: 700;
                  color: #e0e0ff;
                  letter-spacing: 0.5px;
                }

                .rx-header-sub {
                  font-size: 10px;
                  color: #7878aa;
                  font-weight: 400;
                }

                .rx-close-btn {
                  background: rgba(239,68,68,0.15);
                  border: 1px solid rgba(239,68,68,0.35);
                  width: 26px;
                  height: 26px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  color: #f87171;
                  flex-shrink: 0;
                  transition: background 0.15s;
                }
                .rx-close-btn:hover {
                  background: rgba(239,68,68,0.3);
                  color: #ff4444;
                }

                .rx-body {
                  padding: 12px 12px 8px;
                }

                .rx-transcript {
                  background: #f4f4ff;
                  border-radius: 10px;
                  padding: 8px 10px;
                  margin-bottom: 8px;
                  border-left: 3px solid #6366f1;
                  min-height: 36px;
                }

                .rx-quote-label {
                  display: block;
                  font-size: 10px;
                  color: #9999bb;
                  margin-bottom: 3px;
                  font-weight: 600;
                  letter-spacing: 0.4px;
                  text-transform: uppercase;
                }

                .rx-transcript-text {
                  font-size: 12px;
                  color: #1a1a2e;
                  font-weight: 500;
                  line-height: 1.4;
                  font-style: italic;
                }

                .rx-response {
                  font-size: 12px;
                  color: #444466;
                  line-height: 1.5;
                  padding-bottom: 4px;
                  min-height: 28px;
                }

                .rx-footer {
                  background: #dc2626;
                  padding: 12px 16px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                  cursor: pointer;
                  user-select: none;
                  transition: background 0.15s;
                }

                .rx-footer:hover {
                  background: #b91c1c;
                }

                .rx-footer:active {
                  background: #991b1b;
                }

                .rx-footer i, .rx-footer svg {
                  color: #ffffff;
                  font-size: 17px;
                }

                .rx-footer-text {
                  font-size: 12px;
                  font-weight: 700;
                  color: #ffffff;
                  letter-spacing: 0.4px;
                }

                .rx-pulse {
                  width: 7px;
                  height: 7px;
                  border-radius: 50%;
                  background: #ffffff;
                  opacity: 0.8;
                  animation: rxPulse 1.5s ease-in-out infinite;
                }

                @keyframes rxPulse {
                  0%, 100% { transform: scale(1); opacity: 0.8; }
                  50%       { transform: scale(1.6); opacity: 1; }
                }

                .rx-footer.listening {
                  background: #6d28d9;
                }

                .rx-footer.listening .rx-pulse {
                  background: #e879f9;
                }

                .rx-footer.listening svg,
                .rx-footer.listening .rx-footer-text {
                  color: #e879f9;
                }

                .rx-footer.listening .rx-footer-text::after {
                  content: '...';
                }
            `}} />

            <div className="rx-card" ref={modalRef}>

                {/* Header */}
                <div
                    className="rx-header"
                    onMouseDown={(e) => {
                        if ((e.target as HTMLElement).closest('.rx-close-btn')) return;
                        setIsDragging(true);
                        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
                    }}
                >
                    <div className="rx-header-left">
                        <div className="rx-header-icon">
                            <FaRobot size={12} color="#a5b4fc" />
                        </div>
                        <div>
                            <div className="rx-header-title">AI Assistant</div>
                        </div>
                    </div>
                    <button
                        className="rx-close-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if ('speechSynthesis' in window) {
                                window.speechSynthesis.cancel();
                            }
                            onClose();
                        }}
                        title="Close"
                    >
                        <FaTimes size={10} />
                    </button>
                </div>

                {/* Body */}
                <div className="rx-body">
                    {/* Transcript */}
                    <div className="rx-transcript">
                        <span className="rx-quote-label">{isEn ? 'You said' : 'Aapne kaha'}</span>
                        <span className="rx-transcript-text" id="transcriptText">
                            {transcript ? '"' + transcript + '"' : (isEn ? '"You can speak now..."' : '"Aap bol sakte hain..."')}
                        </span>
                    </div>

                    {/* AI Response */}
                    <div className="rx-response" id="responseText">
                        {isProcessing ? '⏳ Processing...' : (reply || (isEn ? 'Hi! How can I help you?' : 'Hi! Mai aapki kaise madad kar sakta hu?'))}
                    </div>
                </div>

                {/* Footer Mic Button */}
                <div
                    className={"rx-footer " + (isListening ? "listening" : "")}
                    id="micBtn"
                    onClick={isListening ? stopListening : startListening}
                >
                    <div className="rx-pulse"></div>
                    <TbMicrophone size={18} />
                    <span className="rx-footer-text" id="micLabel">
                        {isListening ? (isEn ? 'Listening' : 'Sun raha hu...') : (isEn ? 'Tap to Speak' : 'Tap karein aur bolein')}
                    </span>
                </div>
            </div>
        </div>
    );
}
