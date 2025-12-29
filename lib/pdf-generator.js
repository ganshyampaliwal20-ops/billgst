import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords } from './gst-calculator';

export const generateInvoicePDF = (invoice, businessDetails, autoSave = true) => {
    const doc = jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });


    const primaryColor = [155, 134, 219]; // Purple theme #9B86DB
    const textColor = [51, 65, 85]; // Slate-700

    // --- Header Section ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(businessDetails.name.toUpperCase(), 15, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text([
        `Phone no.: ${businessDetails.phone || '999XXXXXXX'}`,
        `Email: ${businessDetails.email || 'xxxx@gmail.com'}`,
        `State: ${businessDetails.address ? businessDetails.address.split(',').pop().trim() : 'N/A'}`
    ], 15, 26);

    // Business Logo (Top Right)
    if (businessDetails.logo) {
        try {
            doc.addImage(businessDetails.logo, 'PNG', 175, 12, 20, 20);
        } catch (e) {
            console.error('Logo error:', e);
        }
    }

    // --- Title ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Tax Invoice', 105, 42, { align: 'center' });

    // --- Compliance Info (IRN / E-Way Bill) ---
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    let complianceY = 46;

    if (invoice.irn) {
        doc.text(`IRN: ${invoice.irn}`, 105, complianceY, { align: 'center' });
        complianceY += 3;
    }
    if (invoice.ack_no) {
        doc.text(`Ack No: ${invoice.ack_no} | Ack Date: ${invoice.ack_date ? new Date(invoice.ack_date).toLocaleDateString('en-GB') : '-'}`, 105, complianceY, { align: 'center' });
        complianceY += 3;
    }
    if (invoice.eway_bill_no) {
        doc.text(`E-Way Bill No: ${invoice.eway_bill_no} | Vehicle No: ${invoice.vehicle_no || '-'} | Distance: ${invoice.distance || '-'} KM`, 105, complianceY, { align: 'center' });
    }

    // --- Bill To & Invoice Info ---
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, 58);
    doc.text(invoice.customer.name, 15, 63);

    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice No.: ${invoice.invoice_number}`, 195, 58, { align: 'right' });
    doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString('en-GB')}`, 195, 63, { align: 'right' });

    // --- Items Table ---
    autoTable(doc, {
        startY: 70,
        head: [['#', 'ITEM NAME', 'HSN/ SAC', 'QUANTITY', 'UNIT', 'PRICE/ UNIT', 'AMOUNT']],
        body: invoice.items.map((item, index) => [
            index + 1,
            item.product_name.toUpperCase(),
            item.hsn_code || '-',
            item.quantity,
            item.unit || 'PCS',
            `Rs. ${parseFloat(item.unit_price).toFixed(2)}`,
            `Rs. ${parseFloat(item.total_amount || (item.quantity * item.unit_price)).toFixed(2)}`
        ]),
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
            textColor: [40, 40, 40],
            lineColor: [230, 230, 230]
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 65 },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 20 },
            4: { halign: 'center', cellWidth: 15 },
            5: { halign: 'right', cellWidth: 25 },
            6: { halign: 'right', cellWidth: 30 }
        },
        didDrawPage: (data) => {
            // Footer Branding
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            const str = "Page " + doc.internal.getNumberOfPages();
            doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            doc.text("www.billgst.in", 15, doc.internal.pageSize.height - 10);
        }
    });

    let finalY = doc.lastAutoTable.finalY;

    // --- Totals Section ---
    const summaryX = 140;
    const valueX = 195;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const drawRow = (label, value, y, isBold = false) => {
        if (value === undefined || value === null || value === 0 && !isBold && label !== 'Received') return y;

        if (isBold) {
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(...primaryColor);
            doc.rect(summaryX, y - 4, 55, 6, 'F');
            doc.setTextColor(255, 255, 255);
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
        }
        doc.text(label.toUpperCase(), summaryX + 2, y);
        doc.text(`Rs. ${parseFloat(value).toFixed(2)}`, valueX - 2, y, { align: 'right' });
        return y + 6;
    };

    let currentY = finalY + 8;
    currentY = drawRow('Sub Total', invoice.subtotal || (invoice.total_amount - (invoice.igst_amount || 0) - (invoice.cgst_amount || 0) - (invoice.sgst_amount || 0)), currentY);

    if (invoice.cgst_amount > 0) {
        currentY = drawRow('CGST', invoice.cgst_amount, currentY);
        currentY = drawRow('SGST', invoice.sgst_amount, currentY);
    } else if (invoice.igst_amount > 0) {
        currentY = drawRow('IGST', invoice.igst_amount, currentY);
    }

    currentY = drawRow('Total', invoice.total_amount, currentY, true);
    currentY = drawRow('Received', invoice.paid_amount || 0, currentY);
    currentY = drawRow('Balance', (invoice.total_amount - (invoice.paid_amount || 0)), currentY);

    const bottomY = Math.max(finalY + 8, currentY + 4);

    // Amount in Words
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('INVOICE AMOUNT IN WORDS', 15, bottomY);
    doc.setFont('helvetica', 'normal');
    doc.setFillColor(245, 245, 245);
    doc.rect(15, bottomY + 2, 95, 6, 'F');
    doc.text(`${numberToWords(Math.round(invoice.total_amount))} only`.toUpperCase(), 17, bottomY + 6);

    // Terms
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS AND CONDITIONS', 15, bottomY + 14);
    doc.setFont('helvetica', 'normal');
    doc.rect(15, bottomY + 16, 95, 6, 'F');
    doc.text('Thanks for doing business with us!', 17, bottomY + 20);

    // Define qrY position (used for both QR and signature positioning)
    const qrY = bottomY + 30;

    // UPI/QR Logic - Only show if UPI ID exists (like GST)
    if (businessDetails.upi_id) {
        try {
            const upiUrl = `upi://pay?pa=${businessDetails.upi_id}&pn=${encodeURIComponent(businessDetails.name)}&am=${parseFloat(invoice.total_amount).toFixed(2)}&cu=INR`;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;
            doc.addImage(qrImageUrl, 'PNG', 15, qrY, 25, 25);

            // Only show "SCAN TO PAY" text if UPI exists
            doc.setFontSize(6);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('SCAN TO PAY', 17, qrY + 28);
        } catch (e) {
            console.error('QR Error:', e);
        }
    }

    // Signature
    const sigX = 140;
    const sigY = qrY + 5;
    doc.setFontSize(8);
    doc.text(`For, ${businessDetails.name.toUpperCase()}`, sigX, sigY);
    // Draw line for signature
    doc.line(sigX, sigY + 12, sigX + 45, sigY + 12);
    doc.setFont('helvetica', 'bold');
    doc.text(businessDetails.owner_name || 'Authorized Signatory', sigX + 22.5, sigY + 16, { align: 'center' });

    if (autoSave) {
        doc.save(`Invoice-${invoice.invoice_number}.pdf`);
    }
    return doc;
};
