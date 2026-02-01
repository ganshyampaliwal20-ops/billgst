'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FaTimes, FaEraser, FaCheck } from 'react-icons/fa';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signatureData: string) => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCanvasSize({
                width: window.innerWidth - 32,
                height: window.innerHeight - 200
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && canvasSize.width > 0) {
            document.body.style.overflow = 'hidden';
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';
                    // Clear canvas initially with white background
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen, canvasSize]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath();
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            // Prevent scrolling while drawing on touch devices
            e.preventDefault();
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            // Trim whitespace would be nice but let's keep it simple for now
            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white">
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 transition-colors">
                    <FaTimes size={24} />
                </button>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest italic">Digital Signature</h2>
                <div className="w-10"></div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-4 bg-slate-50">
                <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="border-2 border-dashed border-slate-200 rounded-3xl cursor-crosshair shadow-2xl touch-none bg-white transition-shadow"
                />
            </div>

            {/* Footer with Actions */}
            <div className="p-6 border-t flex flex-col gap-4 bg-white">
                <div className="flex gap-4">
                    <button
                        onClick={clearCanvas}
                        type="button"
                        className="flex-1 py-4 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs border border-slate-200"
                    >
                        <FaEraser /> Clear Page
                    </button>
                    <button
                        onClick={handleSave}
                        type="button"
                        className="flex-[2] py-4 flex items-center justify-center gap-2 bg-black text-white font-black rounded-2xl hover:bg-slate-800 shadow-xl transition-all uppercase tracking-widest text-xs"
                    >
                        <FaCheck /> Confirm Signature
                    </button>
                </div>
                {/* Instruction */}
                <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-tighter opacity-70">
                    Sign inside the white box using your finger or stylus
                </p>
            </div>
        </div>
    );
};

export default SignatureModal;
