const fs = require('fs');

const path1 = 'f:\\bill\\app\\dashboard\\invoices\\new\\page.tsx';
let content1 = fs.readFileSync(path1, 'utf8');

const target1 = `    // For Camera Scanner
    useEffect(() => {
        let scanner: Html5Qrcode | null = null;
        if (showCameraScanner) {
            scanner = new Html5QrcodeScanner("reader-invoice", { fps: 10, qrbox: 250 }, false);
            scanner.render((decodedText) => {
                scanner?.clear();
                setShowCameraScanner(false);
                processBarcode(decodedText);
            }, (error) => {
                // Handle permission errors explicitly
                if (typeof error === 'string' && (error.includes('NotAllowedError') || error.includes('Permission denied'))) {
                    scanner?.clear();
                    setShowCameraScanner(false);
                    toast.error('Camera access denied! Please allow Camera permission from Android Settings.');
                }
            });
        }
        return () => {
            if (scanner) {
                scanner.clear().catch(e => console.error(e));
            }
        };
    }, [showCameraScanner]);`;

const replacement1 = `    // For Camera Scanner
    useEffect(() => {
        let scanner: Html5Qrcode | null = null;
        if (showCameraScanner) {
            scanner = new Html5Qrcode("reader-invoice");
            scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    if (scanner && scanner.isScanning) {
                        scanner.stop().then(() => {
                            scanner.clear();
                            setShowCameraScanner(false);
                            processBarcode(decodedText);
                        }).catch(e => {
                            setShowCameraScanner(false);
                            processBarcode(decodedText);
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
                setShowCameraScanner(false);
            });
        }
        return () => {
            if (scanner && scanner.isScanning) {
                scanner.stop().then(() => {
                    scanner.clear();
                }).catch(e => console.error(e));
            }
        };
    }, [showCameraScanner]);`;

if (content1.includes(target1)) {
    content1 = content1.replace(target1, replacement1);
    fs.writeFileSync(path1, content1, 'utf8');
    console.log("Updated page.tsx");
} else {
    console.log("Could not find target1 in page.tsx");
}

const path2 = 'f:\\bill\\app\\dashboard\\inventory\\page.tsx';
let content2 = fs.readFileSync(path2, 'utf8');

const target2 = `        if (scanning) {
            let scanner: Html5Qrcode | null = null;
            scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
            scanner.render((decodedText) => {
                scanner?.clear();
                setScanning(false);
                handleScan(decodedText);
            }, (error) => {
                // Ignore errors
                if (typeof error === 'string' && (error.includes('NotAllowedError') || error.includes('Permission denied'))) {
                    scanner?.clear();
                    setScanning(false);
                    toast.error('Camera permission denied');
                }
            });
            return () => {
                scanner?.clear();
            };
        }`;

const replacement2 = `        if (scanning) {
            let scanner: Html5Qrcode | null = null;
            scanner = new Html5Qrcode("reader");
            scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    if (scanner && scanner.isScanning) {
                        scanner.stop().then(() => {
                            scanner.clear();
                            setScanning(false);
                            handleScan(decodedText);
                        }).catch(e => {
                            setScanning(false);
                            handleScan(decodedText);
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
                setScanning(false);
            });
            return () => {
                if (scanner && scanner.isScanning) {
                    scanner.stop().then(() => {
                        scanner.clear();
                    }).catch(e => console.error(e));
                }
            };
        }`;

if (content2.includes(target2)) {
    content2 = content2.replace(target2, replacement2);
    fs.writeFileSync(path2, content2, 'utf8');
    console.log("Updated inventory page.tsx");
} else {
    console.log("Could not find target2 in inventory page.tsx");
}
