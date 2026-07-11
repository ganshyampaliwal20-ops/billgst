import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
};

export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN');
};

export const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-IN');
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2
    }).format(amount);
};

export const formatCompactNumber = (number) => {
    if (number === undefined || number === null) return '₹0';

    const absNumber = Math.abs(number);
    let formatted = '';

    if (absNumber >= 10000000) {
        formatted = (number / 10000000).toFixed(2) + ' Cr';
    } else if (absNumber >= 100000) {
        formatted = (number / 100000).toFixed(2) + ' Lk';
    } else if (absNumber >= 1000) {
        formatted = (number / 1000).toFixed(1) + ' K';
    } else {
        formatted = number.toLocaleString('en-IN');
    }

    return '₹' + formatted;
};

export const optimizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Kripya valid image file select karein.'));
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url); // Clean up memory
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context could not be created'));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            
            try {
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            } catch (err) {
                reject(err);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Image load karne mein error aaya. File corrupt ho sakti hai.'));
        };

        img.src = url;
    });
};

export const isNativeApp = () => {
    return typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
};

export const getNativePlugin = (pluginName) => {
    if (isNativeApp() && window.Capacitor.Plugins) {
        return window.Capacitor.Plugins[pluginName];
    }
    return null;
};

// Unified File Downloader & Sharer for Web + Native Android
export const downloadAndShareFile = async (base64Data, fileName, mimeType = 'application/pdf', action = 'view') => {
    if (typeof window === 'undefined') return;

    if (isNativeApp()) {
        let Filesystem = getNativePlugin('Filesystem');
        let Share = getNativePlugin('Share');
        let FileOpener = getNativePlugin('FileOpener');

        try {
            if (!Filesystem) { const mod = await import('@capacitor/filesystem'); Filesystem = mod.Filesystem; }
            if (!Share) { const mod = await import('@capacitor/share'); Share = mod.Share; }
            if (!FileOpener) { const mod = await import('@capacitor-community/file-opener'); FileOpener = mod.FileOpener; }
        } catch(e) { console.error('Error importing capacitor plugins dynamically', e); }
        
        if (Filesystem && Share) {
            try {
                // Save to DOCUMENTS for permanent storage (might be cached by Android)
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: 'DOCUMENTS',
                });
                
                // Always create a unique file in CACHE for View/Share to bypass Android caching
                const uniqueFileName = `${Date.now()}_${fileName}`;
                const tempFile = await Filesystem.writeFile({
                    path: uniqueFileName,
                    data: base64Data,
                    directory: 'CACHE',
                });
                
                if (action === 'view') {
                    if (FileOpener) {
                        try {
                            await FileOpener.open({
                                filePath: tempFile.uri,
                                contentType: mimeType,
                                openWithDefault: true
                            });
                            return true;
                        } catch (openerError) {
                            console.error('FileOpener error', openerError);
                            // Fallback to Share if FileOpener completely fails
                            await Share.share({
                                title: fileName,
                                url: tempFile.uri,
                                dialogTitle: 'Open PDF'
                            });
                            return true;
                        }
                    } else {
                        // FileOpener missing, fallback to share
                        await Share.share({
                            title: fileName,
                            url: tempFile.uri,
                            dialogTitle: 'Open PDF'
                        });
                        return true;
                    }
                } else if (action === 'share') {
                    await Share.share({
                        title: fileName,
                        url: tempFile.uri,
                        dialogTitle: 'Open / Share File'
                    });
                }
                // If action is 'save' or 'download', we already wrote to DOCUMENTS.
                return true;
            } catch (e) {
                console.error('Native Share error', e);
            }
        }
    }

    // Web Fallback
    try {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        const file = new File([blob], fileName, { type: mimeType });
        if (action === 'share' && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: fileName,
                    text: 'Here is your file'
                });
                return true;
            } catch (err) {
                console.error('Share cancelled or failed', err);
                return true; // Don't download if they just cancelled the share dialog
            }
        }

        const url = URL.createObjectURL(blob);
        
        if (action === 'view') {
            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                // If popup blocked, fallback to download
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            // Clean up the URL after a longer delay to prevent blob reuse conflicts
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            return true;
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        return true;
    } catch (e) {
        console.error('Web download error', e);
        return false;
    }
};
