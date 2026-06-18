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

            if (data.action) {
                if (data.action === 'CREATE_INVOICE') {
                    setAiDraftData({ type: 'INVOICE', ...data.payload });
                    toast.success('Bill banane ja raha hu...');
                    setTimeout(() => router.push('/dashboard/invoices/new'), 1000);
                } else if (data.action === 'MARK_ATTENDANCE') {
                    setAiDraftData({ type: 'ATTENDANCE', ...data.payload });
                    toast.success('Attendance page khol raha hu...');
                    setTimeout(() => router.push('/dashboard/staff'), 1000);
                } else if (data.action === 'ADD_EXPENSE') {
                    setAiDraftData({ type: 'EXPENSE', ...data.payload });
                    toast.success('Expense form khol raha hu...');
                    setTimeout(() => router.push('/dashboard/expenses/new'), 1000);
                } else if (data.action === 'ADD_INVENTORY') {
                    setAiDraftData({ type: 'INVENTORY', ...data.payload });
                    toast.success('Inventory form khol raha hu...');
                    setTimeout(() => router.push('/dashboard/inventory'), 1000);
                } else if (data.action === 'NAVIGATE') {
                    const path = data.payload?.path || data.path;
                    if (path) {
                        toast.success('Page khol raha hu...');
                        setTimeout(() => router.push(path), 1000);
                    }
                } else if (data.action !== 'REPLY') {
                    toast.error('Action samajh nahi aaya: ' + data.action);
                }
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
        <div className="fixed bottom-24 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <style dangerouslySetInnerHTML={{__html: `
                .rx-card {
                  background: #ffffff;
                  border-radius: 16px;
                  width: 200px;
                  overflow: hidden;
                  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
                }



                .rx-body {
                  padding: 12px 12px 0;
                  position: relative;
                }
                
                .rx-close-btn {
                  position: absolute;
                  top: -8px;
                  right: -8px;
                  background: #f1f5f9;
                  border: 1px solid #e2e8f0;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  color: #64748b;
                  z-index: 10;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .rx-close-btn:hover {
                  background: #e2e8f0;
                  color: #0f172a;
                }

                .rx-transcript {
                  background: #f4f4ff;
                  border-radius: 8px;
                  padding: 8px 10px;
                  margin-bottom: 8px;
                  border-left: 3px solid #6366f1;
                  min-height: 40px;
                }

                .rx-quote-label {
                  display: block;
                  font-size: 11px;
                  color: #9999bb;
                  margin-bottom: 4px;
                  font-weight: 500;
                  letter-spacing: 0.3px;
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
                  color: #555577;
                  line-height: 1.4;
                  padding-bottom: 10px;
                  min-height: 30px;
                }



                .rx-footer {
                  background: #1a1a2e;
                  padding: 11px 16px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                  cursor: pointer;
                  user-select: none;
                  transition: background 0.15s;
                }

                .rx-footer:hover {
                  background: #22223d;
                }

                .rx-footer:active {
                  background: #2d2d50;
                }

                .rx-footer i, .rx-footer svg {
                  color: #a5b4fc;
                  font-size: 17px;
                }

                .rx-footer-text {
                  font-size: 12px;
                  font-weight: 500;
                  color: #a5b4fc;
                  letter-spacing: 0.3px;
                }

                .rx-pulse {
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: #a5b4fc;
                  opacity: 0.7;
                  animation: rxPulse 1.5s ease-in-out infinite;
                }

                @keyframes rxPulse {
                  0%, 100% { transform: scale(1); opacity: 0.7; }
                  50%       { transform: scale(1.5); opacity: 1; }
                }

                .rx-footer.listening {
                  background: #3b0764;
                }

                .rx-footer.listening .rx-pulse {
                  background: #e879f9;
                }

                .rx-footer.listening i,
                .rx-footer.listening svg,
                .rx-footer.listening .rx-footer-text {
                  color: #e879f9;
                }

                .rx-footer.listening .rx-footer-text::after {
                  content: '...';
                }
            `}} />

            <div className="rx-card" ref={modalRef} style={{ cursor: isDragging ? 'grabbing' : 'auto' }}>


                {/* Body */}
                <div className="rx-body">
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
                        <FaTimes size={12} />
                    </button>
                    {/* Transcript */}
                    <div className="rx-transcript">
                        <span className="rx-quote-label">You said</span>
                        <span className="rx-transcript-text" id="transcriptText">
                            {transcript ? '"' + transcript + '"' : '"Aap bol sakte hain..."'}
                        </span>
                    </div>

                    {/* AI Response */}
                    <div className="rx-response" id="responseText">
                        {isProcessing ? 'Processing...' : (reply || 'Hi! Mai aapki kaise madad kar sakta hu?')}
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
                        {isListening ? 'Listening' : 'Tap to Speak (AI Voice)'}
                    </span>
                </div>
            </div>
        </div>
    );
}
