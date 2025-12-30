import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords } from './gst-calculator';

export const generateInvoicePDF = (invoice, businessDetails, autoSave = true) => {
    // Defensive check for missing inputs
    if (!invoice || !businessDetails) {
        console.error('PDF Generation Error: Missing invoice or business details');
        return null;
    }

    const doc = jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const primaryColor = [40, 40, 40]; // Dark theme for Tally style lines
    const textColor = [30, 30, 30];

    // Page Settings
    const margin = 10;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);

    // --- Main Border ---
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, contentWidth, doc.internal.pageSize.height - (margin * 2));

    // --- Title Box ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Tax Invoice', pageWidth / 2, margin + 5, { align: 'center' });
    doc.line(margin, margin + 8, margin + contentWidth, margin + 8);

    // --- Header Section Split ---
    const headerHeight = 35;
    const middleLine = margin + (contentWidth / 2);

    // Business Logo Section
    if (businessDetails.logo) {
        try {
            doc.addImage(businessDetails.logo, 'PNG', margin + 5, margin + 12, 12, 12);
        } catch (e) {
            console.error('Logo error:', e);
        }
    }

    const businessName = String(businessDetails.name || 'Your Business Name').toUpperCase();
    doc.setFontSize(12);
    doc.text(businessName, margin + 22, margin + 18);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const addressLines = doc.splitTextToSize(businessDetails.address || 'Address not provided', (contentWidth / 2) - 30);
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
    doc.text(invoice.customer?.name || 'Customer Name', margin + 2, margin + headerHeight + 10);
    const custAddress = doc.splitTextToSize(invoice.customer?.address || 'Customer Address', (contentWidth / 2) - 5);
    doc.text(custAddress, margin + 2, margin + headerHeight + 14);
    if (invoice.customer?.phone) doc.text(`Contact: ${invoice.customer.phone}`, margin + 2, margin + headerHeight + 22);

    // Invoice Meta (Right side of Bill To area)
    doc.line(middleLine, margin + headerHeight, middleLine, margin + headerHeight + detailHeight);

    const safeDate = (dateStr) => {
        try {
            return dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : '-';
        } catch (e) { return '-'; }
    };

    doc.text([
        `Invoice No: ${invoice.invoice_number || 'N/A'}`,
        `Date: ${safeDate(invoice.invoice_date)}`,
        `Due Date: ${safeDate(invoice.due_date)}`
    ], middleLine + 5, margin + headerHeight + 10);

    doc.line(margin, margin + headerHeight + detailHeight, margin + contentWidth, margin + headerHeight + detailHeight);

    // --- Items Table ---
    const safeItems = Array.isArray(invoice.items) ? invoice.items : [];
    autoTable(doc, {
        startY: margin + headerHeight + detailHeight,
        head: [['#', 'Item Name', 'HSN/SAC', 'Quantity', 'Price/Unit', 'Amount']],
        body: safeItems.map((item, index) => [
            index + 1,
            item?.product_name || 'Unnamed Item',
            item?.hsn_code || '-',
            `${Number(item?.quantity) || 0} ${item?.unit || ''}`,
            `₹${(Number(item?.unit_price) || 0).toFixed(2)}`,
            `₹${(Number(item?.total_amount) || 0).toFixed(2)}`
        ]),
        theme: 'grid',
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [0, 0, 0],
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
            0: { halign: 'center', cellWidth: 10 },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 25 },
            4: { halign: 'right', cellWidth: 30 },
            5: { halign: 'right', cellWidth: 30 }
        },
        margin: { left: margin, right: margin }
    });

    let finalY = doc.lastAutoTable.finalY || (margin + headerHeight + detailHeight + 10);

    // Split Bottom Section
    const bottomSectionY = finalY;
    doc.line(middleLine, bottomSectionY, middleLine, doc.internal.pageSize.height - margin);

    // --- Totals Section (Right) ---
    const drawRow = (label, value, y) => {
        doc.text(label, middleLine + 5, y);
        doc.text(`₹${(Number(value) || 0).toFixed(2)}`, pageWidth - margin - 5, y, { align: 'right' });
        return y + 5;
    };

    doc.setFont('helvetica', 'bold');
    let calcY = bottomSectionY + 8;
    calcY = drawRow('Sub Total', invoice.subtotal, calcY);
    if (Number(invoice.cgst_amount) > 0) {
        calcY = drawRow('CGST', invoice.cgst_amount, calcY);
        calcY = drawRow('SGST', invoice.sgst_amount, calcY);
    } else if (Number(invoice.igst_amount) > 0) {
        calcY = drawRow('IGST', invoice.igst_amount, calcY);
    }

    doc.setFontSize(10);
    calcY = drawRow('Total', invoice.total_amount, calcY + 2);
    doc.setFontSize(8);
    calcY = drawRow('Received', invoice.paid_amount || 0, calcY);
    calcY = drawRow('Balance', ((Number(invoice.total_amount) || 0) - (Number(invoice.paid_amount) || 0)), calcY);

    // --- Amount in Words & Terms (Left) ---
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Amount in Words:', margin + 2, bottomSectionY + 8);
    doc.setFont('helvetica', 'normal');
    try {
        const words = numberToWords(Math.round(Number(invoice.total_amount) || 0));
        doc.text(`${words} only`.toUpperCase(), margin + 2, bottomSectionY + 13, { maxWidth: (contentWidth / 2) - 5 });
    } catch (e) {
        doc.text('NOT CALCULATED', margin + 2, bottomSectionY + 13);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Terms and Conditions:', margin + 2, bottomSectionY + 25);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for doing business with us!', margin + 2, bottomSectionY + 30);

    // --- Signature Box ---
    const sigY = doc.internal.pageSize.height - margin - 25;
    doc.setFont('helvetica', 'bold');
    doc.text(`For ${businessName}:`, middleLine + 5, sigY);

    doc.setDrawColor(200, 200, 200);
    doc.rect(middleLine + 10, sigY + 5, 45, 12); // Auth Signature box
    doc.setFontSize(7);
    doc.text('Authorised Signatory', middleLine + 32.5, sigY + 12.5, { align: 'center' });

    // Branding Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('www.billgst.in', margin + 5, doc.internal.pageSize.height - margin - 5);

    if (autoSave && typeof window !== 'undefined') {
        doc.save(`Invoice-${invoice.invoice_number || 'draft'}.pdf`);
    }
    return doc;
};
