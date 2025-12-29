import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords } from './gst-calculator';

export const generateInvoicePDF = (invoice, businessDetails, autoSave = true) => {
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
    // Left: Logo & Business Details
    // Right: Contact Info
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

    doc.setFontSize(12);
    doc.text(businessDetails.name.toUpperCase(), margin + 22, margin + 18);

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
    doc.text(invoice.customer.name, margin + 2, margin + headerHeight + 10);
    const custAddress = doc.splitTextToSize(invoice.customer.address || '', (contentWidth / 2) - 5);
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
    autoTable(doc, {
        startY: margin + headerHeight + detailHeight,
        head: [['#', 'Item Name', 'HSN/SAC', 'Quantity', 'Price/Unit', 'Amount']],
        body: invoice.items.map((item, index) => [
            index + 1,
            item.product_name,
            item.hsn_code || '-',
            `${item.quantity} ${item.unit || ''}`,
            `₹${parseFloat(item.unit_price).toFixed(2)}`,
            `₹${parseFloat(item.total_amount).toFixed(2)}`
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

    let finalY = doc.lastAutoTable.finalY;

    // Split Bottom Section
    // Left: Amounts in words & Terms
    // Right: Calculation & Signature
    const bottomSectionY = finalY;
    doc.line(middleLine, bottomSectionY, middleLine, doc.internal.pageSize.height - margin);

    // --- Totals Section (Right) ---
    const drawRow = (label, value, y) => {
        doc.text(label, middleLine + 5, y);
        doc.text(`₹${parseFloat(value).toFixed(2)}`, pageWidth - margin - 5, y, { align: 'right' });
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
    calcY = drawRow('Balance', (invoice.total_amount - (invoice.paid_amount || 0)), calcY);

    // --- Amount in Words & Terms (Left) ---
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Amount in Words:', margin + 2, bottomSectionY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${numberToWords(Math.round(invoice.total_amount))} only`.toUpperCase(), margin + 2, bottomSectionY + 13, { maxWidth: (contentWidth / 2) - 5 });

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
    doc.text('Authorised Signatory', middleLine + 32.5, sigY + 12.5, { align: 'center' });

    // Branding Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('www.billgst.in', margin + 5, doc.internal.pageSize.height - margin - 5);

    if (autoSave) {
        doc.save(`Invoice-${invoice.invoice_number}.pdf`);
    }
    return doc;
};
