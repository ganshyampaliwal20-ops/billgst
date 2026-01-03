module.exports = [
"[externals]/module [external] (module, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("module", () => require("module"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[project]/Desktop/bill/lib/gst-calculator.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * GST Calculator Utility
 * Handles all GST calculations for invoices
 */ __turbopack_context__.s([
    "GST_RATES",
    ()=>GST_RATES,
    "calculateGST",
    ()=>calculateGST,
    "calculateInvoiceTotal",
    ()=>calculateInvoiceTotal,
    "formatCurrency",
    ()=>formatCurrency,
    "numberToWords",
    ()=>numberToWords
]);
const GST_RATES = [
    0,
    5,
    12,
    18,
    28
];
const calculateGST = (amount, gstRate, isInterState = false)=>{
    const safeAmount = Number(amount) || 0;
    const safeGstRate = Number(gstRate) || 0;
    const gstAmount = safeAmount * safeGstRate / 100;
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
const calculateInvoiceTotal = (items, isInterState = false)=>{
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    const safeItems = Array.isArray(items) ? items : [];
    safeItems.forEach((item)=>{
        const itemQuantity = Number(item?.quantity) || 0;
        const itemUnitPrice = Number(item?.unit_price) || 0;
        const itemTotal = itemQuantity * itemUnitPrice;
        subtotal += itemTotal;
        const itemGstRate = Number(item?.gst_rate) || 0;
        const gst = calculateGST(itemTotal, itemGstRate, isInterState);
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
const formatCurrency = (amount)=>{
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};
const numberToWords = (num)=>{
    const ones = [
        '',
        'One',
        'Two',
        'Three',
        'Four',
        'Five',
        'Six',
        'Seven',
        'Eight',
        'Nine'
    ];
    const tens = [
        '',
        '',
        'Twenty',
        'Thirty',
        'Forty',
        'Fifty',
        'Sixty',
        'Seventy',
        'Eighty',
        'Ninety'
    ];
    const teens = [
        'Ten',
        'Eleven',
        'Twelve',
        'Thirteen',
        'Fourteen',
        'Fifteen',
        'Sixteen',
        'Seventeen',
        'Eighteen',
        'Nineteen'
    ];
    if (num === 0) return 'Zero';
    const convertTwoDigit = (n)=>{
        if (n < 10) return ones[n];
        if (n >= 10 && n < 20) return teens[n - 10];
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    };
    const convertThreeDigit = (n)=>{
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
    let finalResult = result.trim();
    if (finalResult.length > 0) {
        finalResult = finalResult.charAt(0).toUpperCase() + finalResult.slice(1);
    }
    return (finalResult || 'Zero') + ' Rupees Only';
};
}),
"[project]/Desktop/bill/lib/constants.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DOC_LABELS",
    ()=>DOC_LABELS,
    "DOC_TYPES",
    ()=>DOC_TYPES
]);
const DOC_TYPES = {
    TAX_INVOICE: 'TAX_INVOICE',
    BILL_OF_SUPPLY: 'BILL_OF_SUPPLY',
    DELIVERY_CHALLAN: 'DELIVERY_CHALLAN',
    E_WAY_BILL: 'E_WAY_BILL'
};
const DOC_LABELS = {
    [DOC_TYPES.TAX_INVOICE]: 'Tax Invoice',
    [DOC_TYPES.BILL_OF_SUPPLY]: 'Bill of Supply',
    [DOC_TYPES.DELIVERY_CHALLAN]: 'Delivery Challan',
    [DOC_TYPES.E_WAY_BILL]: 'E-Way Bill'
};
}),
"[project]/Desktop/bill/lib/pdf-generator.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateInvoicePDF",
    ()=>generateInvoicePDF
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/jspdf/dist/jspdf.es.min.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$qrcode$2f$lib$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/qrcode/lib/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$gst$2d$calculator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/gst-calculator.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/constants.js [app-ssr] (ecmascript)");
;
;
;
;
;
const generateInvoicePDF = async (invoice, businessDetailsArg, autoSave = true)=>{
    try {
        if (!invoice) {
            console.error('PDF Generation Error: Missing invoice', {
                invoice
            });
            return null;
        }
        // Fallback for missing business details to prevent crash
        const businessDetails = businessDetailsArg || {
            name: 'Business Name (Update Settings)',
            email: '',
            phone: '',
            address: ''
        };
        console.log('PDF Generation: Starting...', {
            invoiceId: invoice.id,
            type: invoice.type
        });
        const doc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        const primaryColor = [
            20,
            20,
            20
        ];
        const accentColor = [
            93,
            80,
            136
        ]; // Dark Purple #5D5088 (Table Header)
        const titleColor = [
            139,
            126,
            176
        ]; // Light Purple #8B7EB0 (Title)
        const margin = 15;
        const pageWidth = doc.internal.pageSize.width;
        const contentWidth = pageWidth - margin * 2;
        // --- Main Border ---
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.rect(margin, margin, contentWidth, doc.internal.pageSize.height - margin * 2);
        // --- Header Section ---
        // Business Details (Left)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        const busName = String(businessDetails.name || 'Your Business Name').toUpperCase();
        doc.text(busName, margin + 2, margin + 8);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        let headerY = margin + 13;
        if (businessDetails.phone) {
            doc.text(`Phone no.: ${businessDetails.phone}`, margin + 2, headerY);
            headerY += 4;
        }
        if (businessDetails.email) {
            doc.text(`Email: ${businessDetails.email}`, margin + 2, headerY);
            headerY += 4;
        }
        if (businessDetails.gstin) {
            doc.text(`GSTIN: ${businessDetails.gstin}`, margin + 2, headerY);
            headerY += 4;
        }
        const busAddr = doc.splitTextToSize(businessDetails.address || '', 100);
        doc.text(busAddr, margin + 2, headerY);
        // Business Logo (Right)
        if (businessDetails.logo) {
            try {
                doc.addImage(businessDetails.logo, 'PNG', pageWidth - margin - 22, margin + 4, 18, 18);
            } catch (e) {
                console.error('Logo error:', e);
            }
        }
        // --- Main Title (Centered) ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const docTitle = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DOC_LABELS"][invoice.type] || 'TAX INVOICE';
        doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
        doc.text(docTitle, pageWidth / 2, margin + 35, {
            align: 'center'
        });
        doc.setTextColor(0, 0, 0);
        // --- Invoice Info Split ---
        const infoY = margin + 45;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', margin + 2, infoY);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(invoice.customer?.name || 'Cash Sale', margin + 2, infoY + 6);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const custAddr = doc.splitTextToSize(invoice.customer?.address || '', 80);
        doc.text(custAddr, margin + 2, infoY + 11);
        if (invoice.customer?.gstin) doc.text(`GSTIN: ${invoice.customer.gstin}`, margin + 2, infoY + 20);
        // Right Side Info
        const rightInfoX = pageWidth - margin - 50;
        doc.setFont('helvetica', 'bold');
        doc.text(`Invoice No.: ${invoice.invoice_number || 'N/A'}`, rightInfoX, infoY + 6);
        const safeDate = (d)=>d ? new Date(d).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '-') : '-';
        doc.text(`Date: ${safeDate(invoice.invoice_date)}`, rightInfoX, infoY + 11);
        // --- Items Table ---
        const safeItems = Array.isArray(invoice.items) ? invoice.items : [];
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
            startY: infoY + 25,
            head: [
                [
                    '#',
                    'ITEM NAME',
                    'HSN/ SAC',
                    'QUANTITY',
                    'UNIT',
                    'PRICE/ UNIT',
                    'AMOUNT'
                ]
            ],
            body: safeItems.map((item, index)=>[
                    index + 1,
                    item?.product_name || '-',
                    item?.hsn_sac || '-',
                    Number(item?.quantity) || 0,
                    item?.unit || 'PCS',
                    `Rs. ${(Number(item?.unit_price) || 0).toFixed(2)}`,
                    `Rs. ${(Number(item?.quantity || 0) * Number(item?.unit_price || 0)).toFixed(2)}`
                ]),
            theme: 'grid',
            tableWidth: 'auto',
            headStyles: {
                fillColor: accentColor,
                textColor: 255,
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
                cellPadding: 4
            },
            bodyStyles: {
                fontSize: 8,
                textColor: 50,
                cellPadding: 3,
                halign: 'center',
                valign: 'middle'
            },
            columnStyles: {
                0: {
                    cellWidth: 10
                },
                1: {
                    halign: 'left',
                    cellWidth: 'auto'
                },
                5: {
                    halign: 'right'
                },
                6: {
                    halign: 'right'
                }
            },
            margin: {
                left: margin,
                right: margin
            }
        });
        let finalY = doc.lastAutoTable.finalY || infoY + 50;
        // --- Totals Section ---
        const splitX = pageWidth / 2 + 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        // Amount in Words (Left)
        doc.setTextColor(100, 100, 100);
        doc.text('INVOICE AMOUNT IN WORDS', margin + 2, finalY + 8);
        doc.setTextColor(0, 0, 0);
        // Gray background for words
        doc.setFillColor(245, 245, 245);
        doc.rect(margin + 2, finalY + 11, pageWidth / 2 - 20, 8, 'F');
        const words = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$gst$2d$calculator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["numberToWords"])(Math.round(Number(invoice.total_amount) || 0));
        doc.setFont('helvetica', 'bold');
        doc.text(`${words} Only`, margin + 4, finalY + 16, {
            maxWidth: pageWidth / 2 - 25
        });
        // Terms
        doc.setTextColor(100, 100, 100);
        doc.text('TERMS AND CONDITIONS', margin + 2, finalY + 28);
        doc.setTextColor(0, 0, 0);
        // Dark background for terms text
        doc.setFillColor(80, 80, 80);
        doc.rect(margin + 2, finalY + 31, pageWidth / 2 - 20, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(invoice.notes || 'Thanks for doing business with us!', margin + 4, finalY + 36, {
            maxWidth: pageWidth / 2 - 25
        });
        doc.setTextColor(0, 0, 0);
        // Summary Table (Right)
        const summaryWidth = 70;
        const valX = pageWidth - margin - 5;
        const labelX = pageWidth - margin - summaryWidth + 5;
        let sY = finalY;
        const drawSummaryRow = (label, val, y, isTotal = false)=>{
            if (isTotal) {
                // Purple Total Row Background
                doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
                doc.rect(pageWidth - margin - summaryWidth, y - 5, summaryWidth, 9, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
            } else {
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
            }
            doc.setFontSize(9);
            doc.text(label, labelX, y);
            doc.text(`Rs. ${(Number(val) || 0).toFixed(2)}`, valX, y, {
                align: 'right'
            });
            return y + 6;
        };
        sY = drawSummaryRow('Sub Total', invoice.subtotal, sY + 8);
        if (Number(invoice.cgst_amount) > 0) {
            sY = drawSummaryRow('CGST', invoice.cgst_amount, sY);
            sY = drawSummaryRow('SGST', invoice.sgst_amount, sY);
        } else if (Number(invoice.igst_amount) > 0) {
            sY = drawSummaryRow('IGST', invoice.igst_amount, sY);
        }
        sY = drawSummaryRow('Total', invoice.total_amount, sY, true);
        sY = drawSummaryRow('Received', invoice.paid_amount || 0, sY + 2);
        sY = drawSummaryRow('Balance', (Number(invoice.total_amount) || 0) - (Number(invoice.paid_amount) || 0), sY);
        // --- Footer ---
        const footerY = doc.internal.pageSize.height - margin - 15;
        // Authorised Signatory with Line
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text(`For, ${busName}`, pageWidth - margin - 5, footerY - 10, {
            align: 'right'
        });
        doc.setDrawColor(50, 50, 50);
        doc.line(pageWidth - margin - 45, footerY + 12, pageWidth - margin - 5, footerY + 12);
        doc.setFont('helvetica', 'bold');
        doc.text('Authorized Signatory', pageWidth - margin - 5, footerY + 16, {
            align: 'right'
        });
        // QR Helper (If total > 0)
        // In a real app we'd add UPI QR here
        if (businessDetails.upi_id && invoice.total_amount > 0) {
            try {
                const upiLink = `upi://pay?pa=${businessDetails.upi_id}&pn=${encodeURIComponent(businessDetails.name)}&am=${invoice.total_amount}&cu=INR`;
                const qrDataUrl = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$qrcode$2f$lib$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].toDataURL(upiLink, {
                    margin: 0
                });
                const qrSize = 25;
                const qrX = pageWidth - margin - qrSize - 5;
                const qrY = finalY + 10;
                // Check if we need a new page for QR
                if (qrY + qrSize + 10 > doc.internal.pageSize.height - margin) {
                    doc.addPage();
                    finalY = margin;
                }
                doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('Scan to Pay', qrX + qrSize / 2, qrY + qrSize + 4, {
                    align: 'center'
                });
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6);
                doc.text(`UPI: ${businessDetails.upi_id}`, qrX + qrSize / 2, qrY + qrSize + 7, {
                    align: 'center'
                });
            } catch (qrError) {
                console.error('QR Generation failed', qrError);
            }
        }
        // BillGST.in Logo & branding (Center bottom)
        doc.setGState(new doc.GState({
            opacity: 0.1
        }));
        doc.setFontSize(25);
        doc.text('BillGST.in', pageWidth / 2, doc.internal.pageSize.height / 2, {
            align: 'center',
            angle: 45
        });
        doc.setGState(new doc.GState({
            opacity: 1
        }));
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated for Free On BillGST.in', pageWidth / 2, doc.internal.pageSize.height - margin - 2, {
            align: 'center'
        });
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return doc;
    } catch (error) {
        console.error('PDF Generation Failed:', error);
        // Generate an Error PDF so the user can see what went wrong
        try {
            const errDoc = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
            errDoc.setFontSize(20);
            errDoc.setTextColor(255, 0, 0);
            errDoc.text("PDF Generation Error", 20, 30);
            errDoc.setFontSize(12);
            errDoc.setTextColor(0, 0, 0);
            errDoc.text("Please screenshot this page and send to support:", 20, 50);
            // Print Error Message
            const errText = errDoc.splitTextToSize(`Error: ${error.message}`, 170);
            errDoc.text(errText, 20, 70);
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return errDoc;
        } catch (e) {
            console.error('Even Error PDF failed:', e);
            return null;
        }
    }
};
}),
"[project]/Desktop/bill/app/dashboard/invoices/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InvoicesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/store.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-icons/fa/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$pdf$2d$generator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/pdf-generator.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-hot-toast/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/constants.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
function InvoicesPage() {
    // Select state individually for safety
    const invoices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"])((state)=>state.invoices);
    const deleteInvoice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"])((state)=>state.deleteInvoice);
    const businessProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"])((state)=>state.businessProfile);
    const fetchInvoices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"])((state)=>state.fetchInvoices);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isClient, setIsClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedInvoice, setSelectedInvoice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showShareSheet, setShowShareSheet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [qrCodeUrl, setQrCodeUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // Generate QR Code when invoice is selected
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (selectedInvoice && businessProfile.upi_id && selectedInvoice.total_amount > 0) {
            const upiLink = `upi://pay?pa=${businessProfile.upi_id}&pn=${encodeURIComponent(businessProfile.name)}&am=${selectedInvoice.total_amount}&cu=INR`;
            __turbopack_context__.A("[project]/Desktop/bill/node_modules/qrcode/lib/index.js [app-ssr] (ecmascript, async loader)").then((QRCode)=>{
                QRCode.toDataURL(upiLink, {
                    margin: 1
                }).then((url)=>setQrCodeUrl(url)).catch((err)=>console.error('QR Gen Error:', err));
            });
        } else {
            setQrCodeUrl('');
        }
    }, [
        selectedInvoice,
        businessProfile
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setIsClient(true);
        fetchInvoices();
    }, [
        fetchInvoices
    ]);
    // Re-fetch when component becomes visible (user navigates back)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleVisibilityChange = ()=>{
            if (!document.hidden) {
                fetchInvoices();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return ()=>document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [
        fetchInvoices
    ]);
    if (!isClient) return null;
    const safeInvoices = (Array.isArray(invoices) ? invoices : []).filter((i)=>i && typeof i === 'object');
    const filteredInvoices = safeInvoices.filter((inv)=>{
        // Aggressive null checks for every field accessed
        const customerName = inv?.customer?.name || '';
        const invoiceNumber = inv?.invoice_number || '';
        // Ensure strings before calling toLowerCase
        return String(customerName).toLowerCase().includes(searchTerm.toLowerCase()) || String(invoiceNumber).toLowerCase().includes(searchTerm.toLowerCase());
    });
    const handleDuplicate = (e, invoice)=>{
        e.stopPropagation();
        window.location.href = `/dashboard/invoices/new?duplicateId=${invoice.id}`;
    };
    const handleDownload = (e, invoice)=>{
        e?.stopPropagation();
        try {
            if (!invoice) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$pdf$2d$generator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateInvoicePDF"])(invoice, businessProfile);
            __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Invoice downloaded!');
        } catch (error) {
            console.error(error);
            __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error('Failed to generate PDF');
        }
    };
    const handleShareWhatsApp = async (invoice)=>{
        if (!invoice) return;
        const fileName = `Invoice-${invoice.invoice_number || 'Bill'}.pdf`;
        let doc = null;
        try {
            doc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$pdf$2d$generator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateInvoicePDF"])(invoice, businessProfile, false);
            if (!doc) throw new Error('PDF Generation Failed');
            // Try native file sharing first (Mobile Apps)
            const pdfBlob = doc.output('blob');
            const file = new File([
                pdfBlob
            ], fileName, {
                type: 'application/pdf'
            });
            if (navigator.canShare && navigator.canShare({
                files: [
                    file
                ]
            })) {
                await navigator.share({
                    files: [
                        file
                    ],
                    title: `Invoice ${invoice.invoice_number}`,
                    text: `Invoice from ${businessProfile.name || 'Our Business'}`
                });
                return; // Success!
            }
            throw new Error('Native file sharing not supported');
        } catch (e) {
            console.log('Native sharing failed, falling back to download + web share', e);
            // Debugging: Alert the user on mobile if sharing fails so we know WHY
            if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                // Only alert if it's NOT just "not supported" to avoid annoyance
                if (e.message !== 'Native file sharing not supported' && !e.message.includes('abort')) {
                    alert(`Share Error: ${e.message}. Downloading file instead.`);
                }
            }
            // Fallback: Download PDF & Open WhatsApp
            if (doc) {
                doc.save(fileName);
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('PDF Downloaded! Please attach file in WhatsApp', {
                    duration: 5000,
                    icon: '📎'
                });
            }
            // Open WhatsApp with a prompt to attach
            const text = `Please find the attached invoice ${invoice.invoice_number} from ${businessProfile.name || 'Business'}.`;
            // Check if mobile to use api.whatsapp.com for better deep linking, else web.whatsapp.com via wa.me
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const url = isMobile ? `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}` : `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
            // Use window.open with a slight delay to ensure toast is seen/download starts
            setTimeout(()=>{
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }, 1000);
        }
    };
    const handleShareMore = async (invoice)=>{
        if (!invoice) return;
        try {
            const doc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$pdf$2d$generator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateInvoicePDF"])(invoice, businessProfile, false);
            if (!doc) throw new Error('PDF Generation Failed');
            const pdfBlob = doc.output('blob');
            const fileName = `Invoice-${invoice.invoice_number || 'Bill'}.pdf`;
            const file = new File([
                pdfBlob
            ], fileName, {
                type: 'application/pdf'
            });
            if (navigator.share) {
                const shareData = {
                    title: `Invoice ${invoice.invoice_number}`,
                    text: `Please find the invoice attached from ${businessProfile.name || 'Our Business'}`
                };
                // Add file if supported
                if (navigator.canShare && navigator.canShare({
                    files: [
                        file
                    ]
                })) {
                    shareData.files = [
                        file
                    ];
                }
                await navigator.share(shareData);
            } else {
                handleDownload(null, invoice);
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error('Share not supported. PDF downloaded.');
            }
        } catch (e) {
            console.error('Share error:', e);
            __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error('Sharing failed');
        }
    };
    const handleShareSMS = (invoice)=>{
        if (!invoice) return;
        const total = (Number(invoice.total_amount) || 0).toLocaleString('en-IN');
        const text = `Invoice ${invoice.invoice_number || 'N/A'} for Rs. ${total} from ${businessProfile?.name || 'Our Business'}. Powered by BillGST.in`;
        window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6 px-4 md:px-8 pb-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold text-gray-800",
                                children: "Invoices"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 207,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-500 text-sm mt-1",
                                children: "Manage and track all your bills"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 208,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                        lineNumber: 206,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/dashboard/invoices/new",
                        className: "px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaPlus"], {}, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 214,
                                columnNumber: 21
                            }, this),
                            "Create New Invoice"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                        lineNumber: 210,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                lineNumber: 205,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white p-4 rounded-2xl border border-gray-200 shadow-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Search by customer name or invoice number...",
                            value: searchTerm,
                            onChange: (e)=>setSearchTerm(e.target.value),
                            className: "w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 222,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaSearch"], {}, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 230,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 229,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                    lineNumber: 221,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                lineNumber: 220,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden",
                children: filteredInvoices.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "py-16 text-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 bg-gray-100 rounded-full text-gray-400",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaFileInvoiceDollar"], {
                                    className: "text-3xl"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 241,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 240,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-500 font-medium",
                                children: "No invoices found"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 243,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/invoices/new",
                                className: "text-blue-600 hover:underline text-sm font-medium",
                                children: "Create your first invoice"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 244,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                        lineNumber: 239,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                    lineNumber: 238,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden md:block overflow-x-auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                className: "w-full",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        className: "bg-gray-50/50 border-b border-gray-100",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-left py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                    children: "Invoice No"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 256,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-left py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 257,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-left py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                    children: "Customer"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 258,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-right py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                    children: "Amount"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 259,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-center py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                    children: "Actions"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 260,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 255,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                        lineNumber: 254,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        className: "divide-y divide-gray-100",
                                        children: filteredInvoices.map((invoice)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                onClick: ()=>setSelectedInvoice(invoice),
                                                className: "hover:bg-blue-50/50 transition-colors cursor-pointer group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-4 px-6 text-sm font-bold text-blue-600",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: invoice.invoice_number || 'N/A'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 272,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[10px] text-gray-400 font-medium px-1.5 py-0.5 bg-gray-100 rounded-md w-fit",
                                                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DOC_LABELS"][invoice.type] || 'Tax Invoice'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 273,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 271,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 270,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-4 px-6 text-sm text-gray-600",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-medium",
                                                                    children: (()=>{
                                                                        try {
                                                                            const d = new Date(invoice?.invoice_date);
                                                                            return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN');
                                                                        } catch (e) {
                                                                            return 'N/A';
                                                                        }
                                                                    })()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 280,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs text-gray-400",
                                                                    children: (()=>{
                                                                        try {
                                                                            const d = new Date(invoice?.created_at || invoice?.invoice_date);
                                                                            return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            });
                                                                        } catch (e) {
                                                                            return '';
                                                                        }
                                                                    })()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 288,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 279,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 278,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-4 px-6 text-sm text-gray-800 font-semibold",
                                                        children: invoice.customer?.name || 'Unknown'
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 298,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-4 px-6 text-right",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col items-end gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-sm font-bold text-gray-900",
                                                                    children: [
                                                                        "₹",
                                                                        (Number(invoice.total_amount) || 0).toLocaleString('en-IN')
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 303,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `text-[10px] px-2 py-0.5 rounded-full font-bold ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : invoice.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`,
                                                                    children: invoice.status || 'UNPAID'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 304,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 302,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 301,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-4 px-6",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: (e)=>{
                                                                        e.stopPropagation();
                                                                        handleDownload(null, invoice);
                                                                    },
                                                                    className: "p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition",
                                                                    title: "Download PDF",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaFilePdf"], {
                                                                        className: "text-lg"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                        lineNumber: 319,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 314,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: (e)=>{
                                                                        e.stopPropagation();
                                                                        setShowShareSheet(invoice);
                                                                    },
                                                                    className: "p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition",
                                                                    title: "Share",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaWhatsapp"], {
                                                                        className: "text-lg"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                        lineNumber: 326,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 321,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: (e)=>handleDuplicate(e, invoice),
                                                                    className: "p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition",
                                                                    title: "Duplicate",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaPlus"], {
                                                                        className: "text-lg"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                        lineNumber: 333,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 328,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 313,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 312,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, invoice.id, true, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                lineNumber: 265,
                                                columnNumber: 41
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                        lineNumber: 263,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 253,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 252,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "md:hidden divide-y divide-gray-100",
                            children: filteredInvoices.map((invoice)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: ()=>setSelectedInvoice(invoice),
                                    className: "p-4 active:bg-gray-50 transition-colors cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between items-start mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "font-bold text-gray-800 text-lg",
                                                            children: invoice.customer?.name || 'Unknown'
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 353,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-gray-500 font-medium",
                                                                    children: [
                                                                        "#",
                                                                        invoice.invoice_number || 'N/A'
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 355,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 rounded-full",
                                                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$constants$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DOC_LABELS"][invoice.type] || 'Tax Invoice'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 356,
                                                                    columnNumber: 49
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 354,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 352,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-right",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-lg font-bold text-gray-900",
                                                            children: [
                                                                "₹",
                                                                (Number(invoice.total_amount) || 0).toLocaleString('en-IN')
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 362,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : invoice.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`,
                                                            children: invoice.status || 'UNPAID'
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 363,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 361,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 351,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between items-center mt-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-gray-400",
                                                    children: (()=>{
                                                        try {
                                                            const d = new Date(invoice?.invoice_date);
                                                            return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN');
                                                        } catch (e) {
                                                            return 'N/A';
                                                        }
                                                    })()
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 373,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                setShowShareSheet(invoice);
                                                            },
                                                            className: "px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaWhatsapp"], {}, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 386,
                                                                    columnNumber: 49
                                                                }, this),
                                                                " Share"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 382,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: (e)=>handleDuplicate(e, invoice),
                                                            className: "px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg text-xs font-bold",
                                                            children: "Duplicate"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 388,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 381,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 372,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, invoice.id, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 346,
                                    columnNumber: 33
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 344,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                lineNumber: 236,
                columnNumber: 13
            }, this),
            selectedInvoice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 shadow-2xl backdrop-blur-sm",
                onClick: ()=>setSelectedInvoice(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-bold text-gray-800",
                                            children: "Invoice Details"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 409,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-500",
                                            children: selectedInvoice.invoice_number || 'N/A'
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 410,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 408,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSelectedInvoice(null),
                                    className: "text-gray-400 hover:text-gray-600",
                                    children: "✕"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 412,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 407,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 space-y-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-4 bg-blue-50 rounded-xl border border-blue-100",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-bold text-blue-600 uppercase mb-1",
                                                    children: "Total Amount"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 418,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-2xl font-bold text-gray-900",
                                                    children: [
                                                        "₹",
                                                        (Number(selectedInvoice.total_amount) || 0).toLocaleString('en-IN')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 419,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 417,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-4 bg-gray-50 rounded-xl border border-gray-100",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-bold text-gray-500 uppercase mb-1",
                                                    children: "Status"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 422,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `inline-block px-3 py-1 rounded-full text-xs font-bold ${selectedInvoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`,
                                                    children: selectedInvoice.status || 'UNPAID'
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 423,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 421,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 416,
                                    columnNumber: 29
                                }, this),
                                qrCodeUrl && selectedInvoice.status !== 'PAID' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 bg-white border-2 border-dashed border-indigo-200 rounded-xl flex items-center justify-between gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-bold text-gray-800",
                                                    children: "Scan to Pay"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 433,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-gray-500",
                                                    children: [
                                                        "Pay exactly ₹",
                                                        (Number(selectedInvoice.total_amount) || 0).toLocaleString('en-IN')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 434,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-indigo-500 font-bold mt-1 bg-indigo-50 px-2 py-0.5 rounded w-fit",
                                                    children: businessProfile.upi_id
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 435,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 432,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-20 h-20 bg-white p-1 rounded-lg border border-gray-100 shadow-sm shrink-0",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: qrCodeUrl,
                                                alt: "UPI QR",
                                                className: "w-full h-full object-contain"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                lineNumber: 438,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 437,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 431,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-3 gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleDownload(null, selectedInvoice),
                                            className: "flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaFilePdf"], {
                                                    className: "text-2xl text-red-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 445,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold uppercase",
                                                    children: "PDF"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 446,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 444,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setShowShareSheet(selectedInvoice);
                                                setSelectedInvoice(null);
                                            },
                                            className: "flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaWhatsapp"], {
                                                    className: "text-2xl text-green-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 449,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold uppercase",
                                                    children: "Share"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 450,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 448,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>window.location.href = `/dashboard/invoices/new?duplicateId=${selectedInvoice.id}`,
                                            className: "flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaPlus"], {
                                                    className: "text-2xl text-orange-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 453,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold uppercase",
                                                    children: "Duplicate"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 454,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 452,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 443,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 415,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                    lineNumber: 406,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                lineNumber: 405,
                columnNumber: 17
            }, this),
            showShareSheet && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/40 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-300",
                onClick: ()=>setShowShareSheet(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-t-[32px] sm:rounded-3xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.3)]",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 469,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-center mb-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-2xl font-black text-slate-800 tracking-tight",
                                            children: "Share Transaction"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 473,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setShowShareSheet(null),
                                            className: "p-2 hover:bg-slate-100 rounded-full transition-colors",
                                            children: "✕"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 474,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 472,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-4 gap-4 mb-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleShareWhatsApp(showShareSheet),
                                            className: "flex flex-col items-center gap-3 group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#25D366]/20 transition-all border border-[#25D366]/20",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaWhatsapp"], {
                                                        className: "text-3xl text-[#25D366]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 480,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 479,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold text-slate-500 uppercase",
                                                    children: "WhatsApp"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 482,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 478,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleShareSMS(showShareSheet),
                                            className: "flex flex-col items-center gap-3 group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-all border border-blue-500/20",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaFileInvoiceDollar"], {
                                                        className: "text-3xl text-blue-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 487,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 486,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold text-slate-500 uppercase",
                                                    children: "SMS"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 489,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 485,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleDownload(null, showShareSheet),
                                            className: "flex flex-col items-center gap-3 group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-red-500/20 transition-all border border-red-500/20",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaFilePdf"], {
                                                        className: "text-3xl text-red-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 494,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 493,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold text-slate-500 uppercase",
                                                    children: "PDF"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 496,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 492,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleShareMore(showShareSheet),
                                            className: "flex flex-col items-center gap-3 group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-2xl font-bold",
                                                        children: "..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 501,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 500,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold text-slate-500 uppercase",
                                                    children: "More"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 503,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 499,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 477,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-slate-50 p-4 rounded-2xl border border-slate-100",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1",
                                                        children: "Total Amount"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 510,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xl font-black text-slate-800 italic tracking-tight",
                                                        children: [
                                                            "₹",
                                                            (Number(showShareSheet.total_amount) || 0).toLocaleString('en-IN')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 511,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                lineNumber: 509,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-right",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1",
                                                        children: "Invoice No"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 514,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-black text-indigo-600 italic",
                                                        children: showShareSheet.invoice_number || 'N/A'
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 515,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                lineNumber: 513,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                        lineNumber: 508,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 507,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 471,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-white text-[10px] font-bold tracking-[0.2em] uppercase",
                                children: "Powered by BillGST.in"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 522,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 521,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                    lineNumber: 465,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                lineNumber: 464,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
        lineNumber: 203,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__76aa47a2._.js.map