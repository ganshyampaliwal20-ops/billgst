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
    if (amount === undefined || amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
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
