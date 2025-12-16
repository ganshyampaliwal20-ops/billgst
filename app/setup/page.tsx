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

                const dbg = data.debug || {};
                if (data.stack) dbg.stack = data.stack;
                if (Object.keys(dbg).length > 0) setDebugInfo(dbg);

                // Auto-show generator if URL is bad
                if (dbg.url_test && dbg.url_test.includes('Failed')) {
                    setShowGen(true);
                }
            }
        } catch (err) {
            setStatus('error');
            setMessage(err instanceof Error ? err.message : 'Connection Failed');
        }
    };

    const [showGen, setShowGen] = useState(false);
    const [genData, setGenData] = useState({ host: '', user: 'postgres', pass: '', db: 'postgres' });

    const generatedUrl = `postgres://${encodeURIComponent(genData.user)}:${encodeURIComponent(genData.pass)}@${genData.host}/${encodeURIComponent(genData.db)}?sslmode=require`;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center space-y-6">
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

                        <div className="mt-6 border-t pt-4">
                            <p className="text-sm font-bold text-slate-700 mb-2">Detailed Help:</p>
                            <p className="text-sm text-slate-600 mb-4">
                                The error "Parsing Failed" or "Invalid URL" usually means your password contains special characters (like @, #, /) that need to be "encoded".
                            </p>

                            <button
                                onClick={() => setShowGen(!showGen)}
                                className="text-blue-600 underline font-semibold text-sm"
                            >
                                {showGen ? "Hide URL Builder" : "👉 Click here to generate a SAFE Connection String"}
                            </button>

                            {showGen && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200 text-left space-y-3">
                                    <h4 className="font-bold text-blue-800">Connection String Builder</h4>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase">Database Host (e.g. ep-xyz.aws.neon.tech)</label>
                                        <input
                                            className="w-full p-2 border rounded-lg text-sm"
                                            placeholder="Paste host here..."
                                            value={genData.host}
                                            onChange={e => setGenData({ ...genData, host: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase">User</label>
                                            <input
                                                className="w-full p-2 border rounded-lg text-sm"
                                                value={genData.user}
                                                onChange={e => setGenData({ ...genData, user: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Database Name</label>
                                            <input
                                                className="w-full p-2 border rounded-lg text-sm"
                                                value={genData.db}
                                                onChange={e => setGenData({ ...genData, db: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase">Password (Raw)</label>
                                        <input
                                            className="w-full p-2 border rounded-lg text-sm"
                                            placeholder="Paste your password here"
                                            value={genData.pass}
                                            onChange={e => setGenData({ ...genData, pass: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <p className="text-xs font-bold text-green-700 mb-1">✅ Safe Encoded URL (Copy this to Vercel):</p>
                                        <div className="bg-slate-800 p-3 rounded-lg break-all">
                                            <code className="text-xs text-green-400 font-mono select-all">
                                                {generatedUrl}
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={runSetup}
                            className="mt-6 w-full py-3 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200"
                        >
                            Reset & Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
