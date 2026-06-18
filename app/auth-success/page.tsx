'use client';
import { useEffect } from 'react';

export default function AuthSuccess() {
  useEffect(() => {
    // Try standard redirect first
    const timer = setTimeout(() => {
      // If we are still here after 1 second, try forcing Android Intent
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (isAndroid) {
        window.location.href = 'intent://billgst.in/dashboard#Intent;scheme=https;package=in.billgst.app;end';
      } else {
        window.location.href = '/dashboard';
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', textAlign: 'center', padding: '20px' }}>
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
      <h2>Login Successful!</h2>
      <p style={{ marginBottom: '20px' }}>Returning to app...</p>
      <a 
        href="/dashboard" 
        style={{ 
          padding: '12px 24px', 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '8px',
          fontWeight: 'bold'
        }}
      >
        Click here if nothing happens
      </a>
    </div>
  );
}
