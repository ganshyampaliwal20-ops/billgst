/**
 * GST Calculator Utility
 * Handles all GST calculations for invoices
 */

export const GST_RATES = [0, 5, 12, 18, 28];

export const calculateGST = (amount, gstRate, isInterState = false) => {
    const gstAmount = (amount * gstRate) / 100;

    if (isInterState) {
        // IGST for inter-state transactions
        return {
            cgst: 0,
            sgst: 0,
            igst: gstAmount,
            total: gstAmount
        };
    } else {
        // CGST + SGST for intra-state transactions
        const halfGst = gstAmount / 2;
        return {
            cgst: halfGst,
            sgst: halfGst,
            igst: 0,
            total: gstAmount
        };
    }
};

export const calculateInvoiceTotal = (items, isInterState = false) => {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    items.forEach(item => {
        const itemTotal = item.quantity * item.unit_price;
        subtotal += itemTotal;

        const gst = calculateGST(itemTotal, item.gst_rate, isInterState);
        totalCGST += gst.cgst;
        totalSGST += gst.sgst;
        totalIGST += gst.igst;
    });

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        cgst_amount: parseFloat(totalCGST.toFixed(2)),
        sgst_amount: parseFloat(totalSGST.toFixed(2)),
        igst_amount: parseFloat(totalIGST.toFixed(2)),
        total_amount: parseFloat((subtotal + totalCGST + totalSGST + totalIGST).toFixed(2))
    };
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

export const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    const convertTwoDigit = (n) => {
        if (n < 10) return ones[n];
        if (n >= 10 && n < 20) return teens[n - 10];
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    };

    const convertThreeDigit = (n) => {
        if (n >= 100) {
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertTwoDigit(n % 100) : '');
        }
        return convertTwoDigit(n);
    };

    let crore = Math.floor(num / 10000000);
    num %= 10000000;
    let lakh = Math.floor(num / 100000);
    num %= 100000;
    let thousand = Math.floor(num / 1000);
    num %= 1000;
    let hundred = num;

    let result = '';
    if (crore > 0) result += convertTwoDigit(crore) + ' Crore ';
    if (lakh > 0) result += convertTwoDigit(lakh) + ' Lakh ';
    if (thousand > 0) result += convertTwoDigit(thousand) + ' Thousand ';
    if (hundred > 0) result += convertThreeDigit(hundred);

    return result.trim() + ' Rupees Only';
};
