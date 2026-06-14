const fs = require('fs');

const filePaths = [
    'f:\\bill\\app\\dashboard\\invoices\\new\\page.tsx',
    'f:\\bill\\app\\dashboard\\inventory\\page.tsx'
];

filePaths.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace the import
    content = content.replace(
        /import\s+\{\s*Html5QrcodeScanner\s*\}\s+from\s+['"]html5-qrcode['"];/g,
        'import { Html5Qrcode } from "html5-qrcode";'
    );

    // Also replace references in type definitions
    content = content.replace(/let scanner: Html5QrcodeScanner \| null = null;/g, 'let scanner: Html5Qrcode | null = null;');

    // Replace the specific initialization block for invoices/new/page.tsx
    // and inventory/page.tsx
    
    content = content.replace(
        /scanner = new Html5QrcodeScanner\([^;]+;\s*scanner\.render\([\s\S]*?\),\s*\(error\)\s*=>\s*\{[\s\S]*?\}\);/g,
        `scanner = new Html5Qrcode(showCameraScanner ? "reader-invoice" : "reader");
            scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    if (scanner && scanner.isScanning) {
                        scanner.stop().then(() => {
                            scanner.clear();
                            if (typeof setShowCameraScanner === 'function') setShowCameraScanner(false);
                            if (typeof setScanning === 'function') setScanning(false);
                            if (typeof processBarcode === 'function') processBarcode(decodedText);
                            if (typeof handleScan === 'function') handleScan(decodedText);
                        }).catch(e => {
                            if (typeof setShowCameraScanner === 'function') setShowCameraScanner(false);
                            if (typeof setScanning === 'function') setScanning(false);
                            if (typeof processBarcode === 'function') processBarcode(decodedText);
                            if (typeof handleScan === 'function') handleScan(decodedText);
                        });
                    }
                },
                (errorMessage) => { }
            ).catch(error => {
                const errStr = String(error);
                if (errStr.includes("NotAllowedError") || errStr.includes("Permission denied")) {
                    toast.error("Camera access denied! Please allow Camera permission from Android Settings.");
                } else {
                    toast.error("Camera error: " + errStr);
                }
                if (typeof setShowCameraScanner === 'function') setShowCameraScanner(false);
                if (typeof setScanning === 'function') setScanning(false);
            });`
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
});
