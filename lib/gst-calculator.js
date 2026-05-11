/**
 * GST Calculator Utility
 * Handles all GST calculations for invoices
 */

export const GST_RATES = [0, 5, 12, 18, 28];

export const calculateGST = (amount, gstRate, isInterState = false, isInclusive = false) => {
    const safeAmount = Number(amount) || 0;
    const safeGstRate = Number(gstRate) || 0;
    
    let baseAmount = safeAmount;
    let gstAmount = 0;

    if (isInclusive && safeGstRate > 0) {
        // Inclusive Logic: Base = Total / (1 + Rate/100)
        baseAmount = safeAmount / (1 + (safeGstRate / 100));
        gstAmount = safeAmount - baseAmount;
    } else {
        // Exclusive Logic: GST = Base * Rate/100
        gstAmount = (safeAmount * safeGstRate) / 100;
    }

    if (isInterState) {
        // IGST for inter-state transactions
        return {
            cgst: 0,
            sgst: 0,
            igst: gstAmount,
            total: gstAmount,
            base: baseAmount
        };
    } else {
        // CGST + SGST for intra-state transactions
        const halfGst = gstAmount / 2;
        return {
            cgst: halfGst,
            sgst: halfGst,
            igst: 0,
            total: gstAmount,
            base: baseAmount
        };
    }
};

export const calculateInvoiceTotal = (items, isInterState = false, isInclusive = false) => {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    const safeItems = Array.isArray(items) ? items : [];

    safeItems.forEach(item => {
        const itemQuantity = Number(item?.quantity) || 0;
        const itemUnitPrice = Number(item?.unit_price) || 0;
        const itemTotal = itemQuantity * itemUnitPrice;

        const itemGstRate = Number(item?.gst_rate) || 0;
        const gst = calculateGST(itemTotal, itemGstRate, isInterState, isInclusive);
        
        subtotal += gst.base;
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
    if (num === null || num === undefined) return 'Zero';

    // Separate integer and decimal parts
    const parts = num.toString().split('.');
    const integerPart = parseInt(parts[0]);
    const decimalPart = parts[1] ? parseInt(parts[1].substring(0, 2).padEnd(2, '0')) : 0;

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertTwoDigit = (n) => {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n >= 10 && n < 20) return teens[n - 10];
        const t = Math.floor(n / 10);
        const o = n % 10;
        return tens[t] + (o !== 0 ? ' ' + ones[o] : '');
    };

    const convertThreeDigit = (n) => {
        if (n === 0) return '';
        const h = Math.floor(n / 100);
        const rest = n % 100;
        let res = '';
        if (h > 0) res += ones[h] + ' Hundred';
        if (rest > 0) res += (res ? ' and ' : '') + convertTwoDigit(rest);
        return res;
    };

    const convertAmount = (n) => {
        if (n === 0) return 'Zero';

        let crore = Math.floor(n / 10000000);
        n %= 10000000;
        let lakh = Math.floor(n / 100000);
        n %= 100000;
        let thousand = Math.floor(n / 1000);
        n %= 1000;
        let hundred = n;

        let res = '';
        if (crore > 0) res += convertThreeDigit(crore) + ' Crore ';
        if (lakh > 0) res += convertThreeDigit(lakh) + ' Lakh ';
        if (thousand > 0) res += convertThreeDigit(thousand) + ' Thousand ';
        if (hundred > 0) res += convertThreeDigit(hundred);

        return res.trim();
    };

    let result = convertAmount(integerPart) + ' Rupees';
    if (decimalPart > 0) {
        result += ' and ' + convertTwoDigit(decimalPart) + ' Paise';
    }

    return result + ' Only';
};
