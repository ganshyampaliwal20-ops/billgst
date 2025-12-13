import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords, formatCurrency } from './gst-calculator';

// Simpler format for PDF to prevent overflow
const formatPDFCurrency = (amount) => {
    return '₹' + parseFloat(amount).toFixed(2);
};

export const generateInvoicePDF = (invoice, businessDetails) => {
    const doc = new jsPDF();

    // Colors
    const primaryColor = [59, 130, 246]; // Blue-500
    const secondaryColor = [100, 116, 139]; // Slate-500

    // Header Background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    // Add Logo if available
    if (businessDetails.logo) {
        try {
            doc.addImage(businessDetails.logo, 'PNG', 15, 8, 24, 24);
        } catch (e) {
            console.error('Error adding logo to PDF:', e);
        }
    }

    // Company Name (White) - adjust position if logo exists
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const nameX = businessDetails.logo ? 45 : 15;
    doc.text(businessDetails.name, nameX, 20);

    // Invoice Title
    doc.setFontSize(30);
    doc.text('INVOICE', 195, 20, { align: 'right' });

    // Reset Text Color
    doc.setTextColor(0, 0, 0);

    // Company Details (Left)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text([
        businessDetails.address,
        `GSTIN: ${businessDetails.gstin}`,
        `Phone: ${businessDetails.phone}`,
        `Email: ${businessDetails.email}`
    ], 15, 50);

    // Invoice Details (Right)
    doc.text([
        `Invoice No: ${invoice.invoice_number}`,
        `Date: ${new Date(invoice.invoice_date).toLocaleDateString('en-IN')}`,
        `Due Date: ${new Date(invoice.due_date).toLocaleDateString('en-IN')}`
    ], 195, 50, { align: 'right' });

    // Bill To Section
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.rect(15, 75, 180, 25, 'F');

    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 82);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customer.name, 20, 88);
    doc.text(`GSTIN: ${invoice.customer.gstin || 'N/A'}`, 20, 94);

    // Items Table
    autoTable(doc, {
        startY: 110,
        head: [['#', 'Item', 'HSN/SAC', 'Qty', 'Price', 'GST %', 'Amount']],
        body: invoice.items.map((item, index) => [
            index + 1,
            item.product_name,
            item.hsn_code || '-',
            item.quantity,
            formatPDFCurrency(item.unit_price),
            `${item.gst_rate}%`,
            formatPDFCurrency(item.total_amount)
        ]),
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak'
        },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 48 },
            2: { cellWidth: 20 },
            3: { cellWidth: 16 },
            4: { cellWidth: 23 },
            5: { cellWidth: 15 },
            6: { cellWidth: 42, halign: 'right' } // Increased to 42
        }
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Totals Section - Optimized positioning to prevent cutoff
    const rightColX = 105;  // Label position
    const valueX = 188;     // Value position - increased to 188 for better visibility

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.text('Subtotal:', rightColX, finalY);
    doc.text(formatPDFCurrency(invoice.subtotal), valueX, finalY, { align: 'right' });

    doc.text('CGST:', rightColX, finalY + 7);
    doc.text(formatPDFCurrency(invoice.cgst_amount), valueX, finalY + 7, { align: 'right' });

    doc.text('SGST:', rightColX, finalY + 14);
    doc.text(formatPDFCurrency(invoice.sgst_amount), valueX, finalY + 14, { align: 'right' });

    if (invoice.igst_amount > 0) {
        doc.text('IGST:', rightColX, finalY + 21);
        doc.text(formatPDFCurrency(invoice.igst_amount), valueX, finalY + 21, { align: 'right' });
    }

    // Grand Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Amount:', rightColX, finalY + 28);
    doc.text(formatPDFCurrency(invoice.total_amount), valueX, finalY + 28, { align: 'right' });

    // Amount in Words
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Amount in Words: ${numberToWords(Math.round(invoice.total_amount))}`, 15, finalY + 40);

    // Terms & Conditions
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text([
        'Terms & Conditions:',
        '1. Goods once sold will not be taken back.',
        '2. Interest @18% p.a. will be charged if payment is not made within due date.',
        '3. Subject to local jurisdiction.'
    ], 15, 250);

    // Branding Footer (The Growth Hack!)
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Footer Background
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 285, 210, 12, 'F');

        // Branding Text
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('Created for free with', 105, 292, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('BillGST.in', 138, 292);

        // Link (Clickable)
        doc.link(138, 288, 20, 5, { url: 'https://billgst.in' });
    }

    doc.save(`Invoice-${invoice.invoice_number}.pdf`);
};
