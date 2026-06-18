'use client';
import { useEffect } from 'react';

export default function AuthSuccess() {
  useEffect(() => {
    // This client-side redirect will trigger Android App Links!
    // It forces the Chrome Custom Tab to hand control back to the TWA/PWA
    window.location.href = '/dashboard';
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <h2>Returning to App...</h2>
      <p>Please wait...</p>
    </div>
  );
}
