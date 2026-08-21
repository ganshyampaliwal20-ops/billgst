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
export const downloadAndShareFile = async (base64Data, fileName, mimeType = 'application/pdf', action = 'view', windowRef = null) => {
    if (typeof window === 'undefined') return;

    if (isNativeApp()) {
        let Filesystem = getNativePlugin('Filesystem');
        let Share = getNativePlugin('Share');
        let FileOpener = getNativePlugin('FileOpener');
        let LocalNotifications = getNativePlugin('LocalNotifications');

        try {
            if (!Filesystem) { const mod = await import('@capacitor/filesystem'); Filesystem = mod.Filesystem; }
            if (!Share) { const mod = await import('@capacitor/share'); Share = mod.Share; }
            if (!FileOpener) { const mod = await import('@capacitor-community/file-opener'); FileOpener = mod.FileOpener; }
            if (!LocalNotifications) { const mod = await import('@capacitor/local-notifications'); LocalNotifications = mod.LocalNotifications; }
        } catch(e) { console.error('Error importing capacitor plugins dynamically', e); }
        
        if (Filesystem) {
            try {
                // Save to DOCUMENTS for permanent storage
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: 'DOCUMENTS',
                });
                
                // Clear old PDF cache asynchronously so it doesn't block the UI
                (async () => {
                    try {
                        const cacheDir = await Filesystem.readdir({ path: '', directory: 'CACHE' });
                        const deletePromises = (cacheDir.files || []).map(file => {
                            const name = file.name || file;
                            if (name && (name.endsWith('.pdf') || name.endsWith('.json') || name.endsWith('.xlsx'))) {
                                return Filesystem.deleteFile({ path: name, directory: 'CACHE' }).catch(() => {});
                            }
                        });
                        await Promise.all(deletePromises);
                    } catch(clearErr) {}
                })();
                
                // Create file in CACHE for View/Share
                const uniqueFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
                const tempFile = await Filesystem.writeFile({
                    path: uniqueFileName,
                    data: base64Data,
                    directory: 'CACHE',
                });
                
                // Trigger Native Notification in Android Status Bar (time ke paas)
                if (LocalNotifications) {
    LocalNotifications.requestPermissions().then(() => {
        LocalNotifications.schedule({
            notifications: [{
                title: '📥 File Downloaded',
                body: `${fileName} saved to Documents folder.`,
                id: 8888,
                schedule: { at: new Date(Date.now() + 10) },
                extra: { filePath: savedFile.uri, fileName: fileName, mimeType: mimeType }
            }]
        });
    }).catch(notifErr => console.warn('LocalNotifications schedule error:', notifErr));
}

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
                            try {
                                await new Promise(resolve => setTimeout(resolve, 400));
                                await FileOpener.open({
                                    filePath: tempFile.uri,
                                    contentType: mimeType,
                                    openWithDefault: true
                                });
                                return true;
                            } catch (retryError) {
                                if (Share) {
                                    await Share.share({
                                        title: fileName,
                                        url: tempFile.uri,
                                        dialogTitle: 'Open File'
                                    });
                                }
                                return true;
                            }
                        }
                    } else if (Share) {
                        await Share.share({
                            title: fileName,
                            url: tempFile.uri,
                            dialogTitle: 'Open File'
                        });
                        return true;
                    }
                } else if (action === 'share') {
                    if (Share) {
                        await Share.share({
                            title: fileName,
                            url: tempFile.uri,
                            dialogTitle: 'Open / Share File'
                        });
                    }
                    return true;
                } else if (action === 'download' || action === 'save') {
                    // Automatically open the downloaded file or show open sheet
                    if (FileOpener) {
                        try {
                            await FileOpener.open({
                                filePath: tempFile.uri,
                                contentType: mimeType,
                                openWithDefault: true
                            });
                            return true;
                        } catch (openErr) {
                            if (Share) {
                                try {
                                    await Share.share({
                                        title: fileName,
                                        url: tempFile.uri,
                                        dialogTitle: 'Download Complete — Open File'
                                    });
                                } catch (shareErr) {}
                            }
                        }
                    } else if (Share) {
                        try {
                            await Share.share({
                                title: fileName,
                                url: tempFile.uri,
                                dialogTitle: 'Download Complete — Open File'
                            });
                        } catch(shareErr) {}
                    }
                    return true;
                }
                return true;
            } catch (e) {
                console.error('Native File save error', e);
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
                return true;
            }
        }

        const url = URL.createObjectURL(blob);
        
        if (action === 'view') {
            let newWindow = windowRef;
            if (newWindow) {
                newWindow.location.href = url;
            } else {
                const uniqueTarget = '_blank_' + Date.now();
                newWindow = window.open(url, uniqueTarget);
            }
            // If window.open was blocked, fallback to download
            if (!newWindow) {
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            return true;
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 60000);

        // 1. Android / Web System Notification (via ServiceWorker for Mobile Chrome & TWA)
        if (typeof window !== 'undefined' && 'Notification' in window) {
            (async () => {
                try {
                    let permission = Notification.permission;
                    if (permission === 'default') {
                        permission = await Notification.requestPermission();
                    }
                    if (permission === 'granted') {
                        if ('serviceWorker' in navigator) {
                            try {
                                const reg = await navigator.serviceWorker.ready;
                                if (reg && reg.showNotification) {
                                    await reg.showNotification('📥 File Downloaded', {
                                        body: `${fileName} saved to your phone.`,
                                        icon: '/icon.png',
                                        badge: '/icon.png',
                                        tag: 'dl-' + fileName,
                                        vibrate: [200, 100, 200]
                                    });
                                    return;
                                }
                            } catch (swErr) {}
                        }
                        try {
                            new Notification('📥 File Downloaded', {
                                body: `${fileName} saved to your phone.`,
                                icon: '/icon.png'
                            });
                        } catch (e) {}
                    }
                } catch (nErr) {}
            })();
        }

        // 2. Open Android Native Share / Chooser so file is immediately accessible
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: fileName,
                    text: 'BillGST Download: ' + fileName
                });
            } catch (shareErr) {}
        }

        return true;
    } catch (e) {
        console.error('Web download error', e);
        return false;
    }
};
