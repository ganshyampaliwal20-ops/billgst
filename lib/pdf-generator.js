import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import autoTable from 'jspdf-autotable';
import { numberToWords } from './gst-calculator';
import { DOC_LABELS, DOC_TYPES } from './constants';

export const generateInvoicePDF = async (invoice, businessDetailsArg, autoSave = true) => {
    try {
        if (!invoice) {
            console.error('PDF Generation Error: Missing invoice', { invoice });
            return null;
        }

        // Fallback for missing business details to prevent crash
        const businessDetails = businessDetailsArg || {
            name: 'Business Name (Update Settings)',
            email: '',
            phone: '',
            address: ''
        };

        console.log('PDF Generation: Starting...', { invoiceId: invoice.id, type: invoice.type });

        const doc = jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const primaryColor = [20, 20, 20];
        const accentColor = [93, 80, 136]; // Dark Purple #5D5088 (Table Header)
        const titleColor = [139, 126, 176]; // Light Purple #8B7EB0 (Title)
        const margin = 15;
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
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const docTitle = (DOC_LABELS[invoice.type] || 'TAX INVOICE');
        doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
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
        const safeDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-';
        doc.text(`Date: ${safeDate(invoice.invoice_date)}`, rightInfoX, infoY + 11);

        // --- Items Table ---
        const safeItems = Array.isArray(invoice.items) ? invoice.items : [];
        autoTable(doc, {
            startY: infoY + 25,
            head: [['#', 'ITEM NAME', 'HSN/ SAC', 'QUANTITY', 'UNIT', 'PRICE/ UNIT', 'AMOUNT']],
            body: safeItems.map((item, index) => [
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
                0: { cellWidth: 10 },
                1: { halign: 'left', cellWidth: 'auto' },
                5: { halign: 'right' },
                6: { halign: 'right' }
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

        // Gray background for words
        doc.setFillColor(245, 245, 245);
        doc.rect(margin + 2, finalY + 11, pageWidth / 2 - 20, 8, 'F');

        const words = numberToWords(Math.round(Number(invoice.total_amount) || 0));
        doc.setFont('helvetica', 'bold');
        doc.text(`${words} Only`, margin + 4, finalY + 16, { maxWidth: pageWidth / 2 - 25 });

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
        doc.text(invoice.notes || 'Thanks for doing business with us!', margin + 4, finalY + 36, { maxWidth: pageWidth / 2 - 25 });
        doc.setTextColor(0, 0, 0);

        // Summary Table (Right)
        const summaryWidth = 70;
        const valX = pageWidth - margin - 5;
        const labelX = pageWidth - margin - summaryWidth + 5;
        let sY = finalY;

        const drawSummaryRow = (label, val, y, isTotal = false) => {
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
            doc.text(`Rs. ${(Number(val) || 0).toFixed(2)}`, valX, y, { align: 'right' });
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

        // Authorised Signatory with Line
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text(`For, ${busName}`, pageWidth - margin - 5, footerY - 10, { align: 'right' });

        doc.setDrawColor(50, 50, 50);
        doc.line(pageWidth - margin - 45, footerY + 12, pageWidth - margin - 5, footerY + 12);

        doc.setFont('helvetica', 'bold');
        doc.text('Authorized Signatory', pageWidth - margin - 5, footerY + 16, { align: 'right' });

        // QR Helper (If total > 0)
        // Fixed at Bottom Left
        if (businessDetails.upi_id && invoice.total_amount > 0) {
            try {
                const upiAmount = (Number(invoice.total_amount) || 0).toFixed(2);
                const upiLink = `upi://pay?pa=${businessDetails.upi_id}&pn=${encodeURIComponent(businessDetails.name)}&am=${upiAmount}&cu=INR`;
                const qrDataUrl = await QRCode.toDataURL(upiLink, { margin: 0 });

                const qrSize = 25;
                const qrX = margin + 2; // Bottom Left
                const qrY = doc.internal.pageSize.height - margin - qrSize - 5; // Fixed bottom position

                // Ensure we are on a page where this space is free, else add page
                // But since it's the footer area, we usually just put it on the last page
                // If the table ran over this area, autoTable handles page breaks. 
                // We just need to ensure we don't overwrite text. 
                // ideally autoTable's finalY is above this. 

                // If finalY is too close to bottom, add new page
                if (finalY > qrY - 10) {
                    doc.addPage();
                    // On new page, reset finalY or just use margins
                }

                doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('Scan to Pay', qrX + (qrSize / 2), qrY - 2, { align: 'center' });
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6);
                doc.text(`UPI: ${businessDetails.upi_id}`, qrX + (qrSize / 2), qrY + qrSize + 3, { align: 'center' });

            } catch (qrError) {
                console.error('QR Generation failed', qrError);
            }
        }

        // BillGST.in Logo & branding (Center bottom)
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        doc.setFontSize(25);
        doc.text('BillGST.in', pageWidth / 2, doc.internal.pageSize.height / 2, { align: 'center', angle: 45 });
        doc.setGState(new doc.GState({ opacity: 1 }));

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated for Free On BillGST.in', pageWidth / 2, doc.internal.pageSize.height - margin - 2, { align: 'center' });

        // DEBUG: Print UPI ID Status to verify
        doc.setTextColor(255, 0, 0);
        doc.text(`Debug: UPI=${businessDetails.upi_id || 'MISSING'}, AMT=${invoice.total_amount}`, margin, doc.internal.pageSize.height - 5);

        if (autoSave && typeof window !== 'undefined') {
            doc.save(`Invoice-${invoice.invoice_number || 'draft'}.pdf`);
        }
        return doc;
    } catch (error) {
        console.error('PDF Generation Failed:', error);

        // Generate an Error PDF so the user can see what went wrong
        try {
            const errDoc = new jsPDF();
            errDoc.setFontSize(20);
            errDoc.setTextColor(255, 0, 0);
            errDoc.text("PDF Generation Error", 20, 30);

            errDoc.setFontSize(12);
            errDoc.setTextColor(0, 0, 0);
            errDoc.text("Please screenshot this page and send to support:", 20, 50);

            // Print Error Message
            const errText = errDoc.splitTextToSize(`Error: ${error.message}`, 170);
            errDoc.text(errText, 20, 70);

            if (autoSave && typeof window !== 'undefined') {
                errDoc.save(`Error_Report.pdf`);
            }
            return errDoc;
        } catch (e) {
            console.error('Even Error PDF failed:', e);
            return null;
        }
    }
};
