(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/bill/lib/gst-calculator.js [app-client] (ecmascript)", ((__turbopack_context__) => {
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
    const gstAmount = amount * gstRate / 100;
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
    items.forEach((item)=>{
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
    return result.trim() + ' Rupees Only';
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/bill/lib/pdf-generator.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateInvoicePDF",
    ()=>generateInvoicePDF
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/jspdf/dist/jspdf.es.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$gst$2d$calculator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/gst-calculator.js [app-client] (ecmascript)");
;
;
;
const generateInvoicePDF = (invoice, businessDetails, autoSave = true)=>{
    const doc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    const primaryColor = [
        40,
        40,
        40
    ]; // Dark theme for Tally style lines
    const textColor = [
        30,
        30,
        30
    ];
    // Page Settings
    const margin = 10;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - margin * 2;
    // --- Main Border ---
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, contentWidth, doc.internal.pageSize.height - margin * 2);
    // --- Title Box ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Tax Invoice', pageWidth / 2, margin + 5, {
        align: 'center'
    });
    doc.line(margin, margin + 8, margin + contentWidth, margin + 8);
    // --- Header Section Split ---
    // Left: Logo & Business Details
    // Right: Contact Info
    const headerHeight = 35;
    const middleLine = margin + contentWidth / 2;
    // Business Logo Section
    if (businessDetails.logo) {
        try {
            doc.addImage(businessDetails.logo, 'PNG', margin + 5, margin + 12, 12, 12);
        } catch (e) {
            console.error('Logo error:', e);
        }
    }
    doc.setFontSize(12);
    doc.text(businessDetails.name.toUpperCase(), margin + 22, margin + 18);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const addressLines = doc.splitTextToSize(businessDetails.address || 'Address not provided', contentWidth / 2 - 30);
    doc.text(addressLines, margin + 22, margin + 23);
    // Contact/Business Info (Right)
    doc.text([
        `GSTIN: ${businessDetails.gstin || 'N/A'}`,
        `Phone: ${businessDetails.phone || 'N/A'}`,
        `Email: ${businessDetails.email || 'N/A'}`
    ], middleLine + 5, margin + 18);
    doc.line(margin, margin + headerHeight, margin + contentWidth, margin + headerHeight);
    // --- Bill To & Invoice Info ---
    const detailHeight = 25;
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin + 2, margin + headerHeight + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customer.name, margin + 2, margin + headerHeight + 10);
    const custAddress = doc.splitTextToSize(invoice.customer.address || '', contentWidth / 2 - 5);
    doc.text(custAddress, margin + 2, margin + headerHeight + 14);
    if (invoice.customer.phone) doc.text(`Contact: ${invoice.customer.phone}`, margin + 2, margin + headerHeight + 22);
    // Invoice Meta (Right side of Bill To area)
    doc.line(middleLine, margin + headerHeight, middleLine, margin + headerHeight + detailHeight);
    doc.text([
        `Invoice No: ${invoice.invoice_number}`,
        `Date: ${new Date(invoice.invoice_date).toLocaleDateString('en-GB')}`,
        `Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-GB') : '-'}`
    ], middleLine + 5, margin + headerHeight + 10);
    doc.line(margin, margin + headerHeight + detailHeight, margin + contentWidth, margin + headerHeight + detailHeight);
    // --- Items Table ---
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
        startY: margin + headerHeight + detailHeight,
        head: [
            [
                '#',
                'Item Name',
                'HSN/SAC',
                'Quantity',
                'Price/Unit',
                'Amount'
            ]
        ],
        body: invoice.items.map((item, index)=>[
                index + 1,
                item.product_name,
                item.hsn_code || '-',
                `${item.quantity} ${item.unit || ''}`,
                `₹${parseFloat(item.unit_price).toFixed(2)}`,
                `₹${parseFloat(item.total_amount).toFixed(2)}`
            ]),
        theme: 'grid',
        headStyles: {
            fillColor: [
                245,
                245,
                245
            ],
            textColor: [
                0,
                0,
                0
            ],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center',
            lineColor: primaryColor,
            lineWidth: 0.1
        },
        styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: primaryColor,
            lineWidth: 0.1
        },
        columnStyles: {
            0: {
                halign: 'center',
                cellWidth: 10
            },
            2: {
                halign: 'center',
                cellWidth: 25
            },
            3: {
                halign: 'center',
                cellWidth: 25
            },
            4: {
                halign: 'right',
                cellWidth: 30
            },
            5: {
                halign: 'right',
                cellWidth: 30
            }
        },
        margin: {
            left: margin,
            right: margin
        }
    });
    let finalY = doc.lastAutoTable.finalY;
    // Split Bottom Section
    // Left: Amounts in words & Terms
    // Right: Calculation & Signature
    const bottomSectionY = finalY;
    doc.line(middleLine, bottomSectionY, middleLine, doc.internal.pageSize.height - margin);
    // --- Totals Section (Right) ---
    const drawRow = (label, value, y)=>{
        doc.text(label, middleLine + 5, y);
        doc.text(`₹${parseFloat(value).toFixed(2)}`, pageWidth - margin - 5, y, {
            align: 'right'
        });
        return y + 5;
    };
    doc.setFont('helvetica', 'bold');
    let calcY = bottomSectionY + 8;
    calcY = drawRow('Sub Total', invoice.subtotal, calcY);
    if (invoice.cgst_amount > 0) {
        calcY = drawRow('CGST', invoice.cgst_amount, calcY);
        calcY = drawRow('SGST', invoice.sgst_amount, calcY);
    } else if (invoice.igst_amount > 0) {
        calcY = drawRow('IGST', invoice.igst_amount, calcY);
    }
    doc.setFontSize(10);
    calcY = drawRow('Total', invoice.total_amount, calcY + 2);
    doc.setFontSize(8);
    calcY = drawRow('Received', invoice.paid_amount || 0, calcY);
    calcY = drawRow('Balance', invoice.total_amount - (invoice.paid_amount || 0), calcY);
    // --- Amount in Words & Terms (Left) ---
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Amount in Words:', margin + 2, bottomSectionY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$gst$2d$calculator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["numberToWords"])(Math.round(invoice.total_amount))} only`.toUpperCase(), margin + 2, bottomSectionY + 13, {
        maxWidth: contentWidth / 2 - 5
    });
    doc.setFont('helvetica', 'bold');
    doc.text('Terms and Conditions:', margin + 2, bottomSectionY + 25);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for doing business with us!', margin + 2, bottomSectionY + 30);
    // --- Signature Box ---
    const sigY = doc.internal.pageSize.height - margin - 25;
    doc.setFont('helvetica', 'bold');
    doc.text(`For ${businessDetails.name.toUpperCase()}:`, middleLine + 5, sigY);
    doc.setDrawColor(200, 200, 200);
    doc.rect(middleLine + 10, sigY + 5, 45, 12); // Auth Signature box
    doc.setFontSize(7);
    doc.text('Authorised Signatory', middleLine + 32.5, sigY + 12.5, {
        align: 'center'
    });
    // Branding Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('www.billgst.in', margin + 5, doc.internal.pageSize.height - margin - 5);
    if (autoSave) {
        doc.save(`Invoice-${invoice.invoice_number}.pdf`);
    }
    return doc;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/bill/app/dashboard/invoices/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InvoicesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/store.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-icons/fa/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$pdf$2d$generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/pdf-generator.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-hot-toast/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function InvoicesPage() {
    _s();
    // Select state individually for safety
    const invoices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"])({
        "InvoicesPage.useStore[invoices]": (state)=>state.invoices
    }["InvoicesPage.useStore[invoices]"]);
    const deleteInvoice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"])({
        "InvoicesPage.useStore[deleteInvoice]": (state)=>state.deleteInvoice
    }["InvoicesPage.useStore[deleteInvoice]"]);
    const businessProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"])({
        "InvoicesPage.useStore[businessProfile]": (state)=>state.businessProfile
    }["InvoicesPage.useStore[businessProfile]"]);
    const fetchInvoices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"])({
        "InvoicesPage.useStore[fetchInvoices]": (state)=>state.fetchInvoices
    }["InvoicesPage.useStore[fetchInvoices]"]);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isClient, setIsClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedInvoice, setSelectedInvoice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InvoicesPage.useEffect": ()=>{
            setIsClient(true);
            fetchInvoices();
        }
    }["InvoicesPage.useEffect"], [
        fetchInvoices
    ]);
    // Re-fetch when component becomes visible (user navigates back)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InvoicesPage.useEffect": ()=>{
            const handleVisibilityChange = {
                "InvoicesPage.useEffect.handleVisibilityChange": ()=>{
                    if (!document.hidden) {
                        fetchInvoices();
                    }
                }
            }["InvoicesPage.useEffect.handleVisibilityChange"];
            document.addEventListener('visibilitychange', handleVisibilityChange);
            return ({
                "InvoicesPage.useEffect": ()=>document.removeEventListener('visibilitychange', handleVisibilityChange)
            })["InvoicesPage.useEffect"];
        }
    }["InvoicesPage.useEffect"], [
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
    const [showShareSheet, setShowShareSheet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleDuplicate = (e, invoice)=>{
        e.stopPropagation();
        window.location.href = `/dashboard/invoices/new?duplicateId=${invoice.id}`;
    };
    const handleDownload = (e, invoice)=>{
        e?.stopPropagation();
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$pdf$2d$generator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateInvoicePDF"])(invoice, businessProfile);
            __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Invoice downloaded!');
        } catch (error) {
            console.error(error);
            __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Failed to generate PDF');
        }
    };
    const handleShareWhatsApp = (invoice)=>{
        const text = `*INVOICE FROM ${businessProfile.name.toUpperCase()}*\n\nInvoice No: ${invoice.invoice_number}\nDate: ${new Date(invoice.invoice_date).toLocaleDateString()}\nCustomer: ${invoice.customer.name}\n\n*Total Amount: ₹${invoice.total_amount}*\n\nPowered by BillGST.in`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Opening WhatsApp...');
    };
    const handleShareSMS = (invoice)=>{
        const text = `Invoice ${invoice.invoice_number} for ₹${invoice.total_amount} from ${businessProfile.name}. Checkout at BillGST.in`;
        window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6 px-4 md:px-8 pb-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold text-gray-800",
                                children: "Invoices"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 107,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-500 text-sm mt-1",
                                children: "Manage and track all your bills"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 108,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                        lineNumber: 106,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/dashboard/invoices/new",
                        className: "px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaPlus"], {}, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 114,
                                columnNumber: 21
                            }, this),
                            "Create New Invoice"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                        lineNumber: 110,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                lineNumber: 105,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white p-4 rounded-2xl border border-gray-200 shadow-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Search by customer name or invoice number...",
                            value: searchTerm,
                            onChange: (e)=>setSearchTerm(e.target.value),
                            className: "w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 122,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaSearch"], {}, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 130,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 129,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                    lineNumber: 121,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                lineNumber: 120,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden",
                children: filteredInvoices.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "py-16 text-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 bg-gray-100 rounded-full text-gray-400",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaFileInvoiceDollar"], {
                                    className: "text-3xl"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 141,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 140,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-500 font-medium",
                                children: "No invoices found"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 143,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/invoices/new",
                                className: "text-blue-600 hover:underline text-sm font-medium",
                                children: "Create your first invoice"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 144,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                        lineNumber: 139,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                    lineNumber: 138,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden md:block overflow-x-auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                className: "w-full",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        className: "bg-gray-50/50 border-b border-gray-100",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-left py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                    children: "Invoice No"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 156,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-left py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 157,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-left py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                    children: "Customer"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 158,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-right py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                    children: "Amount"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 159,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-center py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider",
                                                    children: "Actions"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 160,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 155,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                        lineNumber: 154,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        className: "divide-y divide-gray-100",
                                        children: filteredInvoices.map((invoice)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                onClick: ()=>setSelectedInvoice(invoice),
                                                className: "hover:bg-blue-50/50 transition-colors cursor-pointer group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-4 px-6 text-sm font-bold text-blue-600",
                                                        children: invoice.invoice_number
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 170,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-4 px-6 text-sm text-gray-600",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-medium",
                                                                    children: new Date(invoice.invoice_date).toLocaleDateString()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 175,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs text-gray-400",
                                                                    children: new Date(invoice.created_at || invoice.invoice_date).toLocaleTimeString([], {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 176,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 174,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 173,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-4 px-6 text-sm text-gray-800 font-semibold",
                                                        children: invoice.customer?.name || 'Unknown'
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 179,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-4 px-6 text-right",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col items-end gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-sm font-bold text-gray-900",
                                                                    children: [
                                                                        "₹",
                                                                        (invoice.total_amount || 0).toLocaleString()
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 184,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `text-[10px] px-2 py-0.5 rounded-full font-bold ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : invoice.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`,
                                                                    children: invoice.status || 'UNPAID'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 185,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 183,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 182,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-4 px-6",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: (e)=>{
                                                                        e.stopPropagation();
                                                                        handleDownload(null, invoice);
                                                                    },
                                                                    className: "p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition",
                                                                    title: "Download PDF",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaFilePdf"], {
                                                                        className: "text-lg"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                        lineNumber: 200,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 195,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: (e)=>{
                                                                        e.stopPropagation();
                                                                        setShowShareSheet(invoice);
                                                                    },
                                                                    className: "p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition",
                                                                    title: "Share",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaWhatsapp"], {
                                                                        className: "text-lg"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                        lineNumber: 207,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 202,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: (e)=>handleDuplicate(e, invoice),
                                                                    className: "p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition",
                                                                    title: "Duplicate",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaPlus"], {
                                                                        className: "text-lg"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                        lineNumber: 214,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 209,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 194,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 193,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, invoice.id, true, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                lineNumber: 165,
                                                columnNumber: 41
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                        lineNumber: 163,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 153,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 152,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "md:hidden divide-y divide-gray-100",
                            children: filteredInvoices.map((invoice)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: ()=>setSelectedInvoice(invoice),
                                    className: "p-4 active:bg-gray-50 transition-colors cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between items-start mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "font-bold text-gray-800 text-lg",
                                                            children: invoice.customer?.name || 'Unknown'
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 234,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-gray-500 font-medium",
                                                            children: [
                                                                "#",
                                                                invoice.invoice_number
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 235,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 233,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-right",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-lg font-bold text-gray-900",
                                                            children: [
                                                                "₹",
                                                                (invoice.total_amount || 0).toLocaleString()
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 238,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : invoice.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`,
                                                            children: invoice.status || 'UNPAID'
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 239,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 237,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 232,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between items-center mt-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-gray-400",
                                                    children: new Date(invoice.invoice_date).toLocaleDateString()
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 249,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                setShowShareSheet(invoice);
                                                            },
                                                            className: "px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaWhatsapp"], {}, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                                    lineNumber: 257,
                                                                    columnNumber: 49
                                                                }, this),
                                                                " Share"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 253,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: (e)=>handleDuplicate(e, invoice),
                                                            className: "px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg text-xs font-bold",
                                                            children: "Duplicate"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                            lineNumber: 259,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 252,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 248,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, invoice.id, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 227,
                                    columnNumber: 33
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 225,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                lineNumber: 136,
                columnNumber: 13
            }, this),
            selectedInvoice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 shadow-2xl backdrop-blur-sm",
                onClick: ()=>setSelectedInvoice(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-bold text-gray-800",
                                            children: "Invoice Details"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 280,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-500",
                                            children: selectedInvoice.invoice_number
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 281,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 279,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSelectedInvoice(null),
                                    className: "text-gray-400 hover:text-gray-600",
                                    children: "✕"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 283,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 278,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 space-y-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-4 bg-blue-50 rounded-xl border border-blue-100",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-bold text-blue-600 uppercase mb-1",
                                                    children: "Total Amount"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 289,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-2xl font-bold text-gray-900",
                                                    children: [
                                                        "₹",
                                                        selectedInvoice.total_amount.toLocaleString()
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 290,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 288,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-4 bg-gray-50 rounded-xl border border-gray-100",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-bold text-gray-500 uppercase mb-1",
                                                    children: "Status"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 293,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `inline-block px-3 py-1 rounded-full text-xs font-bold ${selectedInvoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`,
                                                    children: selectedInvoice.status || 'UNPAID'
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 294,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 292,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 287,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-3 gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleDownload(null, selectedInvoice),
                                            className: "flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaFilePdf"], {
                                                    className: "text-2xl text-red-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 302,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold uppercase",
                                                    children: "PDF"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 303,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 301,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setShowShareSheet(selectedInvoice);
                                                setSelectedInvoice(null);
                                            },
                                            className: "flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaWhatsapp"], {
                                                    className: "text-2xl text-green-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 306,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold uppercase",
                                                    children: "Share"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 307,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 305,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>window.location.href = `/dashboard/invoices/new?duplicateId=${selectedInvoice.id}`,
                                            className: "flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaPlus"], {
                                                    className: "text-2xl text-orange-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 310,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold uppercase",
                                                    children: "Duplicate"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 311,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 309,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 300,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 286,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                    lineNumber: 277,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                lineNumber: 276,
                columnNumber: 17
            }, this),
            showShareSheet && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/40 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-300",
                onClick: ()=>setShowShareSheet(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-t-[32px] sm:rounded-3xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.3)]",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 326,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-center mb-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-2xl font-black text-slate-800 tracking-tight",
                                            children: "Share Transaction"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 330,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setShowShareSheet(null),
                                            className: "p-2 hover:bg-slate-100 rounded-full transition-colors",
                                            children: "✕"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 331,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 329,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-4 gap-4 mb-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleShareWhatsApp(showShareSheet),
                                            className: "flex flex-col items-center gap-3 group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#25D366]/20 transition-all border border-[#25D366]/20",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaWhatsapp"], {
                                                        className: "text-3xl text-[#25D366]"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 337,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 336,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold text-slate-500 uppercase",
                                                    children: "WhatsApp"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 335,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleShareSMS(showShareSheet),
                                            className: "flex flex-col items-center gap-3 group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-all border border-blue-500/20",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaFileInvoiceDollar"], {
                                                        className: "text-3xl text-blue-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 344,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 343,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold text-slate-500 uppercase",
                                                    children: "SMS"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 346,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 342,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleDownload(null, showShareSheet),
                                            className: "flex flex-col items-center gap-3 group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-red-500/20 transition-all border border-red-500/20",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaFilePdf"], {
                                                        className: "text-3xl text-red-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 351,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 350,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold text-slate-500 uppercase",
                                                    children: "PDF"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 353,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 349,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "flex flex-col items-center gap-3 group opacity-50",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-2xl font-bold",
                                                        children: "..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 358,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 357,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-bold text-slate-500 uppercase",
                                                    children: "More"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                    lineNumber: 360,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                            lineNumber: 356,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 334,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-slate-50 p-4 rounded-2xl border border-slate-100",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1",
                                                        children: "Total Amount"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 367,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xl font-black text-slate-800 italic tracking-tight",
                                                        children: [
                                                            "₹",
                                                            showShareSheet.total_amount.toLocaleString()
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 368,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                lineNumber: 366,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-right",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1",
                                                        children: "Invoice No"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 371,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-black text-indigo-600 italic",
                                                        children: showShareSheet.invoice_number
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                        lineNumber: 372,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                                lineNumber: 370,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                        lineNumber: 365,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                    lineNumber: 364,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 328,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-white text-[10px] font-bold tracking-[0.2em] uppercase",
                                children: "Powered by BillGST.in"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                                lineNumber: 379,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                            lineNumber: 378,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                    lineNumber: 322,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
                lineNumber: 321,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/bill/app/dashboard/invoices/page.tsx",
        lineNumber: 103,
        columnNumber: 9
    }, this);
}
_s(InvoicesPage, "I8lbTDXjej3yV1NqN3afYzYhFLY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"]
    ];
});
_c = InvoicesPage;
var _c;
__turbopack_context__.k.register(_c, "InvoicesPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_bill_eb5e29d3._.js.map