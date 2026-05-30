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
