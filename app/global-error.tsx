'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body style={{ padding: '20px', backgroundColor: 'white', color: 'red' }}>
                <h2>Catastrophic Global Error</h2>
                <p>{error.message}</p>
                <button onClick={() => reset()}>Try again</button>
            </body>
        </html>
    );
}
