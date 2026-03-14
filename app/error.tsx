'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("GLOBAL NEXTJS ERROR CAUGHT:", error);
    }, [error]);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'red', wordWrap: 'break-word', height: '100vh', background: 'white' }}>
            <h2>Something went wrong on the client!</h2>
            <p>Error Message: {error.message}</p>
            <pre style={{ fontSize: '10px', background: '#f0f0f0', padding: '10px' }}>{error.stack}</pre>
            <button
                onClick={() => reset()}
                style={{ marginTop: '20px', padding: '10px', background: 'blue', color: 'white' }}
            >
                Try again
            </button>
        </div>
    );
}
