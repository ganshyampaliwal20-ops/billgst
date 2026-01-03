'use client';

import { useState } from 'react';
import { FaPalette, FaCheckCircle, FaStar, FaCrown } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const templates = [
    {
        id: 'modern_indigo',
        name: 'Modern Indigo',
        description: 'A clean, modern design with indigo accents and high readability.',
        premium: false,
        image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=600&fit=crop'
    },
    {
        id: 'professional_gold',
        name: 'Professional Gold',
        description: 'Elegant gold-themed template for premium business services.',
        premium: true,
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop'
    },
    {
        id: 'minimalist_slate',
        name: 'Minimalist Slate',
        description: 'Simple, distraction-free design focusing on your business data.',
        premium: false,
        image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=400&h=600&fit=crop'
    },
    {
        id: 'corporate_blue',
        name: 'Corporate Blue',
        description: 'Traditional corporate style with bold headers and clear tables.',
        premium: true,
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=600&fit=crop'
    }
];

export default function TemplatesPage() {
    const [selected, setSelected] = useState('modern_indigo');

    const handleSelect = (id: string) => {
        setSelected(id);
        toast.success(`${templates.find(t => t.id === id)?.name} selected!`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Invoice Templates</h1>
                    <p className="text-slate-500 text-sm">Choose a professional look for your business documents</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => handleSelect(template.id)}
                        className={`group relative bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 border-2 ${selected === template.id ? 'border-indigo-600 shadow-2xl scale-[1.02]' : 'border-slate-100 hover:border-indigo-200'
                            }`}
                    >
                        {/* Preview Area */}
                        <div className="aspect-[2/3] bg-slate-100 relative overflow-hidden">
                            <img
                                src={template.image}
                                alt={template.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {template.premium && (
                                <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg">
                                    <FaCrown /> PREMIUM
                                </div>
                            )}
                            {selected === template.id && (
                                <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-[2px] flex items-center justify-center">
                                    <div className="bg-white text-indigo-600 p-4 rounded-full shadow-2xl">
                                        <FaCheckCircle className="text-4xl" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="p-6">
                            <h3 className="text-lg font-black text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter">
                                {template.name}
                            </h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-4 line-clamp-2">
                                {template.description}
                            </p>
                            <button
                                className={`w-full py-3 rounded-2xl font-black text-xs tracking-widest transition-all ${selected === template.id
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                                    }`}
                            >
                                {selected === template.id ? 'ACTIVE TEMPLATE' : 'SELECT TEMPLATE'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Customization Note */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-xl md:text-2xl font-black italic mb-2 tracking-tight">Want a custom design?</h2>
                        <p className="text-slate-400 text-sm max-w-lg">Our designers can create a unique invoice template tailored specifically to your brand identity.</p>
                    </div>
                    <button className="whitespace-nowrap bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:scale-110 transition shadow-xl">
                        REQUEST CUSTOM DESIGN
                    </button>
                </div>
            </div>
        </div>
    );
}
