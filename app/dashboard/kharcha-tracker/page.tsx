"use client";
import { useEffect } from 'react';

export default function KharchaTrackerPage() {
  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      if (e.data?.type === 'DOWNLOAD_KHARCHA_PDF') {
        const { base64, filename } = e.data;
        if (typeof window !== 'undefined' && (window as any).Capacitor) {
          try {
            const { Directory, Filesystem } = await import('@capacitor/filesystem');
            const { FileOpener } = await import('@capacitor-community/file-opener');
            const b64Data = base64.split(',')[1];
            const res = await Filesystem.writeFile({
              path: filename || 'Kharcha-Report.pdf',
              data: b64Data,
              directory: Directory.Documents
            });
            await FileOpener.open({ filePath: res.uri, contentType: 'application/pdf', openWithDefault: true });
          } catch (err) {
            console.error("Capacitor PDF Error", err);
          }
        } else {
          const a = document.createElement('a');
          a.href = base64;
          a.download = filename || 'Kharcha-Report.pdf';
          a.click();
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div className="w-full h-full min-h-screen">
      <iframe src="/kharcha.html" className="w-full h-screen border-none" title="Kharcha Tracker"></iframe>
    </div>
  );
}
