'use client';

export default function TemplatesPage() {
    const templates = [
        {
            id: 1,
            name: 'Classic Blue',
            description: 'Professional blue theme with clean layout',
            preview: 'https://via.placeholder.com/400x280/4F46E5/FFFFFF?text=Classic+Blue',
            isDefault: true
        },
        {
            id: 2,
            name: 'Modern Green',
            description: 'Fresh green design with modern typography',
            preview: 'https://via.placeholder.com/400x280/10B981/FFFFFF?text=Modern+Green',
            isDefault: false
        },
        {
            id: 3,
            name: 'Elegant Black',
            description: 'Sophisticated black and white theme',
            preview: 'https://via.placeholder.com/400x280/1F2937/FFFFFF?text=Elegant+Black',
            isDefault: false
        },
        {
            id: 4,
            name: 'Warm Orange',
            description: 'Vibrant orange theme for creative businesses',
            preview: 'https://via.placeholder.com/400x280/F97316/FFFFFF?text=Warm+Orange',
            isDefault: false
        }
    ];

    const handleSetDefault = (id: number) => {
        // In real implementation, this would call API to set default template
        alert(`Template ${id} set as default (API integration pending)`);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Invoice Templates</h1>
                <p className="text-sm text-slate-600 mt-1">Choose from professional invoice templates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div key={template.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition">
                        {/* Template Preview */}
                        <div className="relative">
                            <img src={template.preview} alt={template.name} className="w-full h-48 object-cover" />
                            {template.isDefault && (
                                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    DEFAULT
                                </div>
                            )}
                        </div>

                        {/* Template Info */}
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{template.name}</h3>
                                <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-bold hover:bg-indigo-200 transition">
                                    Preview
                                </button>
                                {!template.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(template.id)}
                                        className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                                    >
                                        Set Default
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Coming Soon Templates */}
            <div className="mt-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-8 text-white text-center">
                <h2 className="text-2xl font-bold mb-3">More Templates Coming Soon!</h2>
                <p className="text-violet-100">We're working on adding more professional templates for your business</p>
            </div>
        </div>
    );
}
