'use client';

import { useState } from 'react';

export default function SetupPage() {
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [debugInfo, setDebugInfo] = useState<any>(null);

    const runSetup = async () => {
        setStatus('loading');
        try {
            const res = await fetch('/api/setup');
            const data = await res.json();

            if (res.ok && data.success) {
                setStatus('success');
                setMessage(data.message + ' (User ID: ' + data.user_id + ')');
            } else {
                setStatus('error');
                setMessage(data.error || 'Setup Failed');
                if (data.debug) setDebugInfo(data.debug);
                if (data.stack) setDebugInfo((prev: any) => ({ ...prev, stack: data.stack }));
            }
        } catch (err) {
            setStatus('error');
            setMessage(err instanceof Error ? err.message : 'Connection Failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
                <h1 className="text-2xl font-bold text-slate-800">System Repair & Setup</h1>
                <p className="text-slate-600">
                    Click the button below to fix the "No Users" error by creating a default admin account.
                </p>

                {status === 'idle' && (
                    <button
                        onClick={runSetup}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
                    >
                        FIX DATABASE NOW
                    </button>
                )}

                {status === 'loading' && (
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-blue-600 font-semibold">Repairing Database...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <h3 className="text-green-700 font-bold text-lg mb-2">✅ Success!</h3>
                        <p className="text-green-600 text-sm mb-4">{message}</p>
                        <a
                            href="/dashboard/invoices/new"
                            className="block w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                        >
                            Try Creating Invoice Now
                        </a>
                    </div>
                )}

                {status === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-left">
                        <h3 className="text-red-700 font-bold text-lg mb-2">❌ Configuration Error</h3>
                        <p className="text-red-600 text-sm font-semibold">{message}</p>

                        {/* DEBUG INFO DISPLAY */}
                        {debugInfo && (
                            <div className="mt-4 bg-slate-900 p-3 rounded-lg overflow-x-auto">
                                <p className="text-xs text-slate-400 mb-1">Server Debug Info:</p>
                                <pre className="text-xs text-green-400 font-mono">
                                    {JSON.stringify(debugInfo || {}, null, 2)}
                                </pre>
                            </div>
                        )}

                        <p className="text-xs text-red-500 mt-3">
                            Check Vercel Settings &gt; Environment Variables.
                        </p>
                        <button
                            onClick={runSetup}
                            className="mt-4 text-sm text-red-700 underline hover:text-red-800"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
