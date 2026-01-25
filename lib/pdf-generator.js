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
                item?.hsn_code || item?.hsn_sac || '-',
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
        // Repositioned to bottom left, next to signature
        if (businessDetails.upi_id && Number(invoice.total_amount) > 0) {
            try {
                // Generate UPI link with exact amount
                const upiLink = `upi://pay?pa=${businessDetails.upi_id}&pn=${encodeURIComponent(businessDetails.name)}&am=${Number(invoice.total_amount).toFixed(2)}&cu=INR`;
                const qrDataUrl = await QRCode.toDataURL(upiLink, { margin: 1 });

                const qrSize = 30; // Slightly bigger for better scanning
                const qrX = margin + 5; // Left Side
                const qrY = doc.internal.pageSize.height - margin - qrSize - 5;

                doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('Scan to Pay', qrX + (qrSize / 2), qrY + qrSize + 4, { align: 'center' });
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6);
                doc.text(`UPI: ${businessDetails.upi_id}`, qrX + (qrSize / 2), qrY + qrSize + 7, { align: 'center' });

            } catch (qrError) {
                console.error('QR Generation failed', qrError);
            }
        }

        // --- Bank Details (Centered in footer) ---
        if (businessDetails.show_bank_details && (businessDetails.bank_name || businessDetails.account_no)) {
            const bankCenterX = pageWidth / 2;
            let bankY = doc.internal.pageSize.height - margin - 45;

            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
            doc.text('BANK ACCOUNT DETAILS', bankCenterX, bankY, { align: 'center' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(0, 0, 0);
            bankY += 4;

            if (businessDetails.bank_name) {
                doc.text(`Bank: ${businessDetails.bank_name}`, bankCenterX, bankY, { align: 'center' });
                bankY += 3.5;
            }
            if (businessDetails.account_holder) {
                doc.text(`A/C Holder: ${businessDetails.account_holder}`, bankCenterX, bankY, { align: 'center' });
                bankY += 3.5;
            }
            if (businessDetails.account_no) {
                doc.setFont('helvetica', 'bold');
                doc.text(`A/C No: ${businessDetails.account_no}`, bankCenterX, bankY, { align: 'center' });
                doc.setFont('helvetica', 'normal');
                bankY += 3.5;
            }
            if (businessDetails.ifsc_code) {
                doc.text(`IFSC: ${businessDetails.ifsc_code}`, bankCenterX, bankY, { align: 'center' });
                bankY += 3.5;
            }
            if (businessDetails.branch_name) {
                doc.text(`Branch: ${businessDetails.branch_name}`, bankCenterX, bankY, { align: 'center' });
            }
        }

        // branding (Bottom ONLY, no watermark in center)
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated for Free On BillGST.in', pageWidth / 2, doc.internal.pageSize.height - margin - 2, { align: 'center' });

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

// Generate Quotation PDF (Similar to Invoice but for Quotations)
export const generateQuotationPDF = async (quotation, businessDetailsArg, autoSave = true) => {
    try {
        if (!quotation) {
            console.error('PDF Generation Error: Missing quotation', { quotation });
            return null;
        }

        const businessDetails = businessDetailsArg || {
            name: 'Business Name (Update Settings)',
            email: '',
            phone: '',
            address: ''
        };

        console.log('Quotation PDF Generation: Starting...', { quotationId: quotation.id });

        const doc = jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const accentColor = [93, 80, 136];
        const titleColor = [139, 126, 176];
        const margin = 15;
        const pageWidth = doc.internal.pageSize.width;
        const contentWidth = pageWidth - (margin * 2);

        // Main Border
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.rect(margin, margin, contentWidth, doc.internal.pageSize.height - (margin * 2));

        // Header - Business Details
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

        // Business Logo
        if (businessDetails.logo) {
            try {
                doc.addImage(businessDetails.logo, 'PNG', pageWidth - margin - 22, margin + 4, 18, 18);
            } catch (e) { console.error('Logo error:', e); }
        }

        // Main Title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
        doc.text('QUOTATION', pageWidth / 2, margin + 35, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        // Quotation Info
        const infoY = margin + 45;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Quotation To:', margin + 2, infoY);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(quotation.customer_name || 'Customer', margin + 2, infoY + 6);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const custAddr = doc.splitTextToSize(quotation.customer_address || '', 80);
        doc.text(custAddr, margin + 2, infoY + 11);
        if (quotation.customer_gstin) doc.text(`GSTIN: ${quotation.customer_gstin}`, margin + 2, infoY + 20);

        // Right Side Info
        const rightInfoX = pageWidth - margin - 50;
        doc.setFont('helvetica', 'bold');
        doc.text(`Quotation No.: ${quotation.quotation_number || 'N/A'}`, rightInfoX, infoY + 6);
        const safeDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-';
        doc.text(`Date: ${safeDate(quotation.quotation_date)}`, rightInfoX, infoY + 11);

        // Items Table
        const safeItems = Array.isArray(quotation.items) ? quotation.items : [];
        autoTable(doc, {
            startY: infoY + 25,
            head: [['#', 'ITEM NAME', 'HSN/ SAC', 'QUANTITY', 'UNIT', 'PRICE/ UNIT', 'AMOUNT']],
            body: safeItems.map((item, index) => [
                index + 1,
                item?.product_name || '-',
                item?.hsn_code || item?.hsn_sac || '-',
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

        // Totals Section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);

        // Amount in Words
        doc.setTextColor(100, 100, 100);
        doc.text('QUOTATION AMOUNT IN WORDS', margin + 2, finalY + 8);
        doc.setTextColor(0, 0, 0);

        doc.setFillColor(245, 245, 245);
        doc.rect(margin + 2, finalY + 11, pageWidth / 2 - 20, 8, 'F');

        const words = numberToWords(Math.round(Number(quotation.total_amount) || 0));
        doc.setFont('helvetica', 'bold');
        doc.text(`${words} Only`, margin + 4, finalY + 16, { maxWidth: pageWidth / 2 - 25 });

        // Terms
        doc.setTextColor(100, 100, 100);
        doc.text('TERMS AND CONDITIONS', margin + 2, finalY + 28);
        doc.setTextColor(0, 0, 0);

        doc.setFillColor(80, 80, 80);
        doc.rect(margin + 2, finalY + 31, pageWidth / 2 - 20, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(quotation.notes || 'Thanks for your interest!', margin + 4, finalY + 36, { maxWidth: pageWidth / 2 - 25 });
        doc.setTextColor(0, 0, 0);

        // Summary Table (Right)
        const summaryWidth = 70;
        const valX = pageWidth - margin - 5;
        const labelX = pageWidth - margin - summaryWidth + 5;
        let sY = finalY;

        const drawSummaryRow = (label, val, y, isTotal = false) => {
            if (isTotal) {
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

        sY = drawSummaryRow('Sub Total', quotation.subtotal, sY + 8);
        if (Number(quotation.cgst_amount) > 0) {
            sY = drawSummaryRow('CGST', quotation.cgst_amount, sY);
            sY = drawSummaryRow('SGST', quotation.sgst_amount, sY);
        } else if (Number(quotation.igst_amount) > 0) {
            sY = drawSummaryRow('IGST', quotation.igst_amount, sY);
        }
        sY = drawSummaryRow('Total', quotation.total_amount, sY, true);
        sY = drawSummaryRow('Received', quotation.paid_amount || 0, sY + 2);
        sY = drawSummaryRow('Balance', ((Number(quotation.total_amount) || 0) - (Number(quotation.paid_amount) || 0)), sY);

        // Footer
        const footerY = doc.internal.pageSize.height - margin - 15;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text(`For, ${busName}`, pageWidth - margin - 5, footerY - 10, { align: 'right' });

        doc.setDrawColor(50, 50, 50);
        doc.line(pageWidth - margin - 45, footerY + 12, pageWidth - margin - 5, footerY + 12);

        doc.setFont('helvetica', 'bold');
        doc.text('Authorized Signatory', pageWidth - margin - 5, footerY + 16, { align: 'right' });

        // QR Code
        if (businessDetails.upi_id && Number(quotation.total_amount) > 0) {
            try {
                const upiLink = `upi://pay?pa=${businessDetails.upi_id}&pn=${encodeURIComponent(businessDetails.name)}&am=${Number(quotation.total_amount).toFixed(2)}&cu=INR`;
                const qrDataUrl = await QRCode.toDataURL(upiLink, { margin: 1 });

                const qrSize = 30;
                const qrX = margin + 5;
                const qrY = doc.internal.pageSize.height - margin - qrSize - 5;

                doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('Scan to Pay', qrX + (qrSize / 2), qrY + qrSize + 4, { align: 'center' });
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6);
                doc.text(`UPI: ${businessDetails.upi_id}`, qrX + (qrSize / 2), qrY + qrSize + 7, { align: 'center' });

            } catch (qrError) {
                console.error('QR Generation failed', qrError);
            }
        }

        // Bank Details (Centered in footer)
        if (businessDetails.show_bank_details && (businessDetails.bank_name || businessDetails.account_no)) {
            const bankCenterX = pageWidth / 2;
            let bankY = doc.internal.pageSize.height - margin - 45;

            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
            doc.text('BANK ACCOUNT DETAILS', bankCenterX, bankY, { align: 'center' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(0, 0, 0);
            bankY += 4;

            if (businessDetails.bank_name) {
                doc.text(`Bank: ${businessDetails.bank_name}`, bankCenterX, bankY, { align: 'center' });
                bankY += 3.5;
            }
            if (businessDetails.account_holder) {
                doc.text(`A/C Holder: ${businessDetails.account_holder}`, bankCenterX, bankY, { align: 'center' });
                bankY += 3.5;
            }
            if (businessDetails.account_no) {
                doc.setFont('helvetica', 'bold');
                doc.text(`A/C No: ${businessDetails.account_no}`, bankCenterX, bankY, { align: 'center' });
                doc.setFont('helvetica', 'normal');
                bankY += 3.5;
            }
            if (businessDetails.ifsc_code) {
                doc.text(`IFSC: ${businessDetails.ifsc_code}`, bankCenterX, bankY, { align: 'center' });
                bankY += 3.5;
            }
            if (businessDetails.branch_name) {
                doc.text(`Branch: ${businessDetails.branch_name}`, bankCenterX, bankY, { align: 'center' });
            }
        }

        // Branding
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated for Free On BillGST.in', pageWidth / 2, doc.internal.pageSize.height - margin - 2, { align: 'center' });

        if (autoSave && typeof window !== 'undefined') {
            doc.save(`Quotation-${quotation.quotation_number || 'draft'}.pdf`);
        }
        return doc;
    } catch (error) {
        console.error('Quotation PDF Generation Failed:', error);
        return null;
    }
};
