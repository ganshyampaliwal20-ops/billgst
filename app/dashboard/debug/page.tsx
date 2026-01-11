
'use client';
import { useState, useEffect } from 'react';

export default function DebugPage() {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const runDiagnostics = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/debug');
            const data = await res.json();
            setReport(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">System Diagnostics</h1>

            <button
                onClick={runDiagnostics}
                className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
            >
                Re-Run Diagnostics
            </button>

            {loading && <div className="text-gray-600">Running checks...</div>}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    Error: {error}
                </div>
            )}

            {report && (
                <div className="space-y-6">
                    <div className="grid gap-4">
                        {report.checks.map((check: any, i: number) => (
                            <div key={i} className={`p-4 border rounded flex justify-between items-start ${check.status === 'OK' ? 'bg-green-50 border-green-200' :
                                    check.status === 'BLOCKED' ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-red-50 border-red-200'
                                }`}>
                                <div>
                                    <h3 className="font-bold">{check.name}</h3>
                                    {check.details && (
                                        <pre className="text-xs mt-2 overflow-auto max-w-md">
                                            {JSON.stringify(check.details, null, 2)}
                                        </pre>
                                    )}
                                </div>
                                <span className={`font-bold px-3 py-1 rounded text-sm ${check.status === 'OK' ? 'bg-green-200 text-green-800' :
                                        check.status === 'BLOCKED' ? 'bg-yellow-200 text-yellow-800' :
                                            'bg-red-200 text-red-800'
                                    }`}>
                                    {check.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 p-4 rounded border">
                        <h3 className="font-bold mb-2">Raw Report</h3>
                        <pre className="text-xs overflow-auto">
                            {JSON.stringify(report, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
