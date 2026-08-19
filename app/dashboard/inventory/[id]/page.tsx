'use client';

import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { FaArrowLeft, FaBox, FaRupeeSign, FaPercentage, FaWarehouse, FaBarcode } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const products = useStore((state) => state.products);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const product = products.find((p: any) => p.id === params.id);

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <FaBox className="text-6xl text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-600">Product not found</h2>
                <button
                    onClick={() => router.push('/dashboard/inventory')}
                    className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                >
                    Back to Inventory
                </button>
            </div>
        );
    }

    const profit = product.purchase_price
        ? ((product.price - product.purchase_price) / product.purchase_price * 100).toFixed(2)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        <FaArrowLeft className="text-xl text-indigo-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-800">Product Details</h1>
                        <p className="text-gray-500 text-sm mt-1">Complete product information</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-indigo-100">
                    {/* Product Header Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10">
                            <FaBox className="text-9xl" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${product.type === 'SERVICE' ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                                        {product.type || 'PRODUCT'}
                                    </div>
                                    <h2 className="text-4xl font-black mb-3">{product.name}</h2>
                                    {product.description && (
                                        <p className="text-indigo-100 text-lg">{product.description}</p>
                                    )}
                                </div>

                                {/* Product Icon */}
                                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-6xl font-black border-2 border-white/30">
                                    {product.name.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details Grid */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Sale Price */}
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border-2 border-emerald-200 shadow-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-emerald-500 rounded-xl">
                                        <FaRupeeSign className="text-white text-2xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Sale Price</p>
                                        <p className="text-3xl font-black text-emerald-900">₹{product.price.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-emerald-700 font-semibold">Per {product.unit || 'Unit'}</p>
                            </div>

                            {/* Purchase Price */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-blue-500 rounded-xl">
                                        <FaRupeeSign className="text-white text-2xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Purchase Price</p>
                                        <p className="text-3xl font-black text-blue-900">₹{(product.purchase_price || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                {product.purchase_price && (
                                    <p className="text-sm text-blue-700 font-semibold">
                                        Profit: {profit}%
                                        <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded-full">
                                            ₹{(product.price - product.purchase_price).toFixed(2)}/unit
                                        </span>
                                    </p>
                                )}
                            </div>

                            {/* Stock (only for products) */}
                            {(product.type || 'PRODUCT') === 'PRODUCT' && (
                                <div className={`bg-gradient-to-br ${product.stock_quantity < 10 ? 'from-red-50 to-red-100 border-red-200' : 'from-purple-50 to-purple-100 border-purple-200'} p-6 rounded-2xl border-2 shadow-lg`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`p-3 ${product.stock_quantity < 10 ? 'bg-red-500' : 'bg-purple-500'} rounded-xl`}>
                                            <FaWarehouse className="text-white text-2xl" />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold ${product.stock_quantity < 10 ? 'text-red-600' : 'text-purple-600'} uppercase tracking-wider`}>Stock Quantity</p>
                                            <p className={`text-3xl font-black ${product.stock_quantity < 10 ? 'text-red-900' : 'text-purple-900'}`}>
                                                {product.stock_quantity} {product.unit}
                                            </p>
                                        </div>
                                    </div>
                                    {product.stock_quantity < 10 && (
                                        <p className="text-sm text-red-700 font-bold">⚠️ Low Stock Warning!</p>
                                    )}
                                </div>
                            )}

                            {/* GST Rate */}
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-2 border-orange-200 shadow-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-orange-500 rounded-xl">
                                        <FaPercentage className="text-white text-2xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">GST Rate</p>
                                        <p className="text-3xl font-black text-orange-900">{product.gst_rate || 0}%</p>
                                    </div>
                                </div>
                                <p className="text-sm text-orange-700 font-semibold">
                                    Tax Amount: ₹{((product.price * (product.gst_rate || 0)) / 100).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4">
                            {product.hsn_code && (
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <FaBarcode className="text-2xl text-gray-600" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">HSN/SAC Code</p>
                                            <p className="text-xl font-black text-gray-800">{product.hsn_code}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Product ID */}
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product ID</p>
                                <p className="text-sm font-mono text-gray-600 break-all">{product.id}</p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => router.push('/dashboard/inventory')}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            >
                                Back to Inventory
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
