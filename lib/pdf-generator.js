import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords } from './gst-calculator';
import { DOC_LABELS, DOC_TYPES } from './constants';

export const generateInvoicePDF = (invoice, businessDetails, autoSave = true) => {
    if (!invoice || !businessDetails) {
        console.error('PDF Generation Error: Missing invoice or business details');
        return null;
    }

    const doc = jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const primaryColor = [20, 20, 20];
    const accentColor = [110, 110, 240]; // Light purple for headers as in image
    const margin = 12;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);

    // --- Main Border ---
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.rect(margin, margin, contentWidth, doc.internal.pageSize.height - (margin * 2));

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
        } catch (e) { console.error('Logo error:', e); }
    }

    // --- Main Title (Centered) ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'black');
    const docTitle = (DOC_LABELS[invoice.type] || 'TAX INVOICE').toUpperCase();
    doc.text(docTitle, pageWidth / 2, margin + 35, { align: 'center' });
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
    const safeDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '4-digit' }).replace(/\//g, '-') : '-';
    doc.text(`Date: ${safeDate(invoice.invoice_date)}`, rightInfoX, infoY + 11);

    // --- Items Table ---
    const safeItems = Array.isArray(invoice.items) ? invoice.items : [];
    autoTable(doc, {
        startY: infoY + 25,
        head: [['#', 'Item name', 'HSN/ SAC', 'Quantity', 'Unit', 'Price/ unit', 'Amount']],
        body: safeItems.map((item, index) => [
            index + 1,
            item?.product_name || '-',
            item?.hsn_code || '-',
            Number(item?.quantity) || 0,
            item?.unit || '-',
            `Rs. ${(Number(item?.unit_price) || 0).toFixed(2)}`,
            `Rs. ${(Number(item?.total_amount) || 0).toFixed(2)}`
        ]),
        theme: 'grid',
        headStyles: {
            fillColor: [150, 150, 230], // Indigo/Purple light
            textColor: [0, 0, 0],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center',
            lineColor: [200, 200, 200],
            lineWidth: 0.1
        },
        styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { halign: 'left' },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 20 },
            4: { halign: 'center', cellWidth: 15 },
            5: { halign: 'right', cellWidth: 25 },
            6: { halign: 'right', cellWidth: 30 }
        },
        margin: { left: margin, right: margin }
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
    const words = numberToWords(Math.round(Number(invoice.total_amount) || 0));
    doc.text(words, margin + 2, finalY + 13, { maxWidth: pageWidth / 2 - 15 });

    // Terms
    doc.setTextColor(100, 100, 100);
    doc.text('TERMS AND CONDITIONS', margin + 2, finalY + 25);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.notes || 'Thanks for doing business with us!', margin + 2, finalY + 30, { maxWidth: pageWidth / 2 - 15 });

    // Summary Table (Right)
    const summaryX = splitX;
    let sY = finalY;

    const drawSummaryRow = (label, val, y, isBold = false) => {
        if (isBold) {
            doc.setFillColor(150, 150, 230);
            doc.rect(summaryX, y - 4, pageWidth - margin - summaryX, 6, 'F');
            doc.setFont('helvetica', 'bold');
        } else {
            doc.setFont('helvetica', 'normal');
        }
        doc.text(label, summaryX + 2, y);
        doc.text(`Rs. ${(Number(val) || 0).toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });
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
    sY = drawSummaryRow('Balance', ((Number(invoice.total_amount) || 0) - (Number(invoice.paid_amount) || 0)), sY);

    // --- Footer ---
    const footerY = doc.internal.pageSize.height - margin - 15;

    // Authorised Signatory
    doc.setFont('helvetica', 'normal');
    const authText = `For, ${busName}`;
    doc.text(authText, pageWidth - margin - 5, footerY, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(businessDetails.owner || 'Authorised Signatory', pageWidth - margin - 5, footerY + 18, { align: 'right' });

    // QR Helper (If total > 0)
    // In a real app we'd add UPI QR here

    // BillGST.in Logo & branding (Center bottom)
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.setFontSize(25);
    doc.text('BillGST.in', pageWidth / 2, doc.internal.pageSize.height / 2, { align: 'center', angle: 45 });
    doc.setGState(new doc.GState({ opacity: 1 }));

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated for Free On BillGST.in', pageWidth / 2, doc.internal.pageSize.height - margin - 2, { align: 'center' });

    if (autoSave && typeof window !== 'undefined') {
        doc.save(`Invoice-${invoice.invoice_number || 'draft'}.pdf`);
    }
    return doc;
};
