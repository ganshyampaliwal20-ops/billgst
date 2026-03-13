import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import autoTable from 'jspdf-autotable';
import { numberToWords } from './gst-calculator';
import { DOC_LABELS, DOC_TYPES } from './constants';

const THEMES = {
    TEMPLATE_1: {
        accent: [93, 80, 136],
        title: [139, 126, 176],
        font: 'helvetica'
    },
    TEMPLATE_2: {
        accent: [30, 64, 175], // Blue
        title: [59, 130, 246],
        font: 'helvetica'
    },
    TEMPLATE_3: {
        accent: [51, 65, 85], // Slate
        title: [100, 116, 139],
        font: 'times'
    },
    TEMPLATE_4: {
        accent: [194, 65, 12], // Orange
        title: [249, 115, 22],
        font: 'helvetica'
    },
    TEMPLATE_5: {
        accent: [5, 150, 105], // Green
        title: [16, 185, 129],
        font: 'courier'
    }
};

export const generateInvoicePDF = async (invoice, businessDetailsArg, autoSave = true) => {
    try {
        if (!invoice) return null;

        const businessDetails = businessDetailsArg || {};
        const isPremium = ['PREMIUM_99', 'YEARLY_999', 'LIFETIME'].includes(businessDetails.plan_type);
        const templateId = businessDetails.invoice_template || 'TEMPLATE_1';
        const theme = THEMES[templateId] || THEMES.TEMPLATE_1;

        const doc = jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const margin = 15;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const contentWidth = pageWidth - (margin * 2);

        // --- Main Border ---
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));

        // --- Header Logic based on Logo Position ---
        const logoPos = businessDetails.logo_position || 'RIGHT';
        const tableFormat = businessDetails.invoice_table_format || 'FORMAT_1';
        let headerEndY = margin + 35;

        if (logoPos === 'CENTER') {
            // --- CENTER ALIGNMENT ---
            doc.setFontSize(10);
            doc.setFont(theme.font, 'bold');
            doc.setTextColor(theme.title[0], theme.title[1], theme.title[2]);
            doc.text(DOC_LABELS[invoice.type] || 'TAX INVOICE', pageWidth / 2, margin + 5, { align: 'center' });

            if (businessDetails.logo) {
                try { doc.addImage(businessDetails.logo, 'PNG', (pageWidth / 2) - 11, margin + 8, 22, 22); } catch (e) { }
            }

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.setFont(theme.font, 'bold');
            doc.text(String(businessDetails.name || 'Your Business Name').toUpperCase(), pageWidth / 2, margin + 35, { align: 'center' });

            doc.setFontSize(8);
            doc.setFont(theme.font, 'normal');
            const busAddr = doc.splitTextToSize(businessDetails.address || '', 120);
            doc.text(busAddr, pageWidth / 2, margin + 40, { align: 'center' });

            let contactY = margin + 40 + (busAddr.length * 4);
            let contactText = '';
            if (businessDetails.phone) contactText += `Mob: ${businessDetails.phone} `;
            if (businessDetails.email) contactText += ` | Email: ${businessDetails.email}`;
            doc.text(contactText, pageWidth / 2, contactY, { align: 'center' });

            if (businessDetails.gstin) {
                doc.setFont(theme.font, 'bold');
                doc.text(`GSTIN: ${businessDetails.gstin}`, pageWidth / 2, contactY + 4, { align: 'center' });
            }
            headerEndY = contactY + 8;

        } else if (logoPos === 'LEFT') {
            // --- LEFT ALIGNMENT ---
            if (businessDetails.logo) {
                try { doc.addImage(businessDetails.logo, 'PNG', margin + 2, margin + 4, 18, 18); } catch (e) { }
            }

            doc.setFontSize(14);
            doc.setFont(theme.font, 'bold');
            const busName = String(businessDetails.name || 'Your Business Name').toUpperCase();
            doc.text(busName, margin + 22, margin + 8);

            doc.setFontSize(8);
            doc.setFont(theme.font, 'normal');
            let headerY = margin + 12;
            if (businessDetails.phone) { doc.text(`Phone: ${businessDetails.phone}`, margin + 22, headerY); headerY += 4; }
            if (businessDetails.gstin) { doc.text(`GSTIN: ${businessDetails.gstin}`, margin + 22, headerY); headerY += 4; }
            const busAddr = doc.splitTextToSize(businessDetails.address || '', 80);
            doc.text(busAddr, margin + 22, headerY);

            doc.setFontSize(14);
            doc.setFont(theme.font, 'bold');
            doc.setTextColor(theme.title[0], theme.title[1], theme.title[2]);
            doc.text(DOC_LABELS[invoice.type] || 'TAX INVOICE', pageWidth - margin - 2, margin + 10, { align: 'right' });
            doc.setTextColor(0, 0, 0);
            headerEndY = margin + 35;

        } else {
            // --- RIGHT ALIGNMENT (Default) ---
            doc.setFont(theme.font, 'bold');
            doc.setFontSize(14);
            const busName = String(businessDetails.name || 'Your Business Name').toUpperCase();
            doc.text(busName, margin + 2, margin + 8);

            doc.setFontSize(8);
            doc.setFont(theme.font, 'normal');
            let headerY = margin + 13;
            if (businessDetails.phone) { doc.text(`Phone: ${businessDetails.phone}`, margin + 2, headerY); headerY += 4; }
            if (businessDetails.email) { doc.text(`Email: ${businessDetails.email}`, margin + 2, headerY); headerY += 4; }
            if (businessDetails.gstin) { doc.text(`GSTIN: ${businessDetails.gstin}`, margin + 2, headerY); headerY += 4; }
            const busAddr = doc.splitTextToSize(businessDetails.address || '', 100);
            doc.text(busAddr, margin + 2, headerY);

            if (businessDetails.logo) {
                try { doc.addImage(businessDetails.logo, 'PNG', pageWidth - margin - 22, margin + 4, 18, 18); } catch (e) { }
            }

            doc.setFontSize(14);
            doc.setFont(theme.font, 'bold');
            doc.setTextColor(theme.title[0], theme.title[1], theme.title[2]);
            doc.text(DOC_LABELS[invoice.type] || 'TAX INVOICE', pageWidth / 2, margin + 35, { align: 'center' });
            doc.setTextColor(0, 0, 0);

            headerEndY = margin + 40;
        }

        // Info Split
        const infoY = headerEndY + 5;
        doc.setFontSize(9);
        doc.setFont(theme.font, 'bold');
        doc.text('Bill To:', margin + 2, infoY);
        doc.setFontSize(10);
        doc.text(invoice.customer?.name || 'Cash Sale', margin + 2, infoY + 6);
        doc.setFontSize(8);
        doc.setFont(theme.font, 'normal');
        const custAddr = doc.splitTextToSize(invoice.customer?.address || '', 80);
        doc.text(custAddr, margin + 2, infoY + 11);

        // Dynamic Y position based on address length (each line approx 4mm)
        // Ensure at least some space if address is empty
        let nextY = infoY + 11 + (Math.max(1, custAddr.length) * 4);

        if (invoice.customer?.phone) {
            doc.setFont(theme.font, 'bold');
            doc.text('Mob:', margin + 2, nextY);
            doc.setFont(theme.font, 'normal');
            doc.text(String(invoice.customer.phone), margin + 12, nextY);
            nextY += 4;
        }

        if (invoice.customer?.gstin) {
            doc.setFont(theme.font, 'bold');
            doc.text('GSTIN:', margin + 2, nextY);
            doc.setFont(theme.font, 'normal');
            doc.text(String(invoice.customer.gstin), margin + 14, nextY);
        }

        const rightInfoX = pageWidth - margin - 50;
        doc.setFont(theme.font, 'bold');
        doc.text(`Invoice No.: ${invoice.invoice_number || 'N/A'}`, rightInfoX, infoY + 6);
        const safeDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-';
        doc.text(`Date: ${safeDate(invoice.invoice_date)}`, rightInfoX, infoY + 11);

        // Table Styles Configuration
        // Note: tableFormat is already declared above
        let tableConfig = {
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: theme.accent, textColor: 255, fontSize: 8, fontStyle: 'bold' },
            bodyStyles: {},
            alternateRowStyles: {},
            columnStyles: {
                0: { cellWidth: 10 }, // #
                1: { cellWidth: 'auto' }, // Item
                2: { cellWidth: 20 }, // HSN
                3: { cellWidth: 15, halign: 'center' }, // Qty
                4: { cellWidth: 15, halign: 'center' }, // Unit
                5: { cellWidth: 25, halign: 'right' }, // Price
                6: { cellWidth: 25, halign: 'right' }  // Amount
            }
        };

        if (tableFormat === 'FORMAT_2') {
            // Grid Box - Full Borders (Like the user's photo)
            tableConfig.theme = 'grid';
            tableConfig.styles = { ...tableConfig.styles, lineWidth: 0.1, lineColor: [0, 0, 0] };
            tableConfig.headStyles = { ...tableConfig.headStyles, fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] };
        } else if (tableFormat === 'FORMAT_3') {
            // Minimal - Only horizontal lines
            tableConfig.theme = 'plain';
            tableConfig.styles = { ...tableConfig.styles, cellPadding: 3 };
            tableConfig.headStyles = { ...tableConfig.headStyles, fillColor: null, textColor: theme.accent, borderBottomWidth: 0.5, lineColor: theme.accent };
            tableConfig.bodyStyles = { borderBottomWidth: 0.1, lineColor: [220, 220, 220] };
        } else if (tableFormat === 'FORMAT_4') {
            // Modern - Striped
            tableConfig.theme = 'striped';
            tableConfig.headStyles = { ...tableConfig.headStyles, fillColor: theme.accent };
            tableConfig.alternateRowStyles = { fillColor: [245, 247, 250] };
        } else if (tableFormat === 'FORMAT_5') {
            // Compact - Small font, tight padding
            tableConfig.theme = 'grid';
            tableConfig.styles = { fontSize: 7, cellPadding: 1 };
            tableConfig.headStyles = { ...tableConfig.headStyles, fontSize: 7, padding: 1 };
        } else {
            // Standard (Format 1) - Default Grid
            tableConfig.theme = 'grid';
        }

        // Table
        autoTable(doc, {
            startY: infoY + 25,
            head: [['#', 'ITEM NAME', 'HSN/ SAC', 'QTY', 'UNIT', 'RATE', 'AMOUNT']],
            body: (invoice.items || []).map((item, idx) => [
                idx + 1, item.product_name || '-', item.hsn_code || '-', item.quantity || 0,
                item.unit || 'PCS', Number(item.unit_price || 0).toFixed(2),
                (Number(item.quantity || 0) * Number(item.unit_price || 0)).toFixed(2)
            ]),
            ...tableConfig,
            margin: { left: margin, right: margin }
        });

        let finalY = doc.lastAutoTable.finalY + 10;

        // Totals & Words
        doc.setFont(theme.font, 'bold');
        doc.setFontSize(8);
        doc.text('AMOUNT IN WORDS', margin + 2, finalY);
        const words = numberToWords(Math.round(invoice.total_amount || 0));
        doc.text(`${words} Only`, margin + 2, finalY + 5, { maxWidth: pageWidth / 2 - 20 });

        // Notes / Terms
        if (invoice.notes) {
            const notesY = finalY + 15;
            doc.setFont(theme.font, 'bold');
            doc.text('TERMS & CONDITIONS / NOTES', margin + 2, notesY);
            doc.setFont(theme.font, 'normal');
            doc.setFontSize(7);
            const notesText = doc.splitTextToSize(invoice.notes, (pageWidth / 2) - 10);
            doc.text(notesText, margin + 2, notesY + 4);
        }

        // Summary
        const summaryWidth = 60;
        const sX = pageWidth - margin - summaryWidth;
        let sY = finalY;
        const row = (l, v, y, bold = false) => {
            if (bold) { doc.setFillColor(...theme.accent); doc.rect(sX, y - 4, summaryWidth, 7, 'F'); doc.setTextColor(255); }
            doc.text(l, sX + 2, y); doc.text(`Rs. ${Number(v || 0).toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });
            doc.setTextColor(0); return y + 7;
        };

        sY = row('Sub Total', invoice.subtotal, sY);
        if (invoice.cgst_amount > 0) { sY = row('CGST', invoice.cgst_amount, sY); sY = row('SGST', invoice.sgst_amount, sY); }
        else if (invoice.igst_amount > 0) { sY = row('IGST', invoice.igst_amount, sY); }
        sY = row('Total', invoice.total_amount, sY, true);

        // --- Footer Organisation ---
        const bottomBoxLimit = pageHeight - margin;
        const qrSize = 25;
        const qrY = bottomBoxLimit - qrSize - 8; // 8mm gap from bottom border for "Scan to Pay" text

        // Bank Details (Positioned above the QR code area)
        if (businessDetails.show_bank_details && businessDetails.bank_name) {
            const bankY = qrY - 18;
            doc.setFontSize(7);
            doc.setFont(theme.font, 'bold');
            doc.text('BANK ACCOUNT DETAILS', margin + 2, bankY);
            doc.setFont(theme.font, 'normal');
            doc.text([
                'Bank: ' + businessDetails.bank_name,
                'A/C: ' + businessDetails.account_no,
                'IFSC: ' + businessDetails.ifsc_code
            ], margin + 2, bankY + 4);
        }

        // QR Code - Ensuring it stays inside border
        if (businessDetails.upi_id && invoice.total_amount > 0) {
            try {
                const upiLink = `upi://pay?pa=${businessDetails.upi_id}&pn=${encodeURIComponent(businessDetails.name)}&am=${Number(invoice.total_amount).toFixed(2)}&cu=INR`;
                const qrDataUrl = await QRCode.toDataURL(upiLink, { margin: 1 });
                doc.addImage(qrDataUrl, 'PNG', margin + 2, qrY, qrSize, qrSize);
                doc.setFontSize(7);
                doc.setFont(theme.font, 'bold');
                doc.text('Scan to Pay', margin + 2 + (qrSize / 2), qrY + qrSize + 4, { align: 'center' });
            } catch (e) { }
        }

        // Signature area (Bottom Right)
        const sigY = bottomBoxLimit - 25;
        doc.setFontSize(8);
        doc.setFont(theme.font, 'normal');
        const footerBusName = String(businessDetails.name || 'Your Business Name').toUpperCase();
        doc.text(`For, ${footerBusName}`, pageWidth - margin - 2, sigY, { align: 'right' });

        // Draw Signature Image if available
        if (businessDetails.signature) {
            try {
                // Background of signature relative to bottom signatory line
                doc.addImage(businessDetails.signature, 'PNG', pageWidth - margin - 40, sigY + 2, 35, 12);
            } catch (e) { }
        }

        doc.line(pageWidth - margin - 45, sigY + 14, pageWidth - margin - 2, sigY + 14);
        doc.setFont(theme.font, 'bold');
        doc.text('Authorized Signatory', pageWidth - margin - 2, sigY + 18, { align: 'right' });

        // Branding
        if (!isPremium) {
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text('Powered by BillGST.in', pageWidth / 2, pageHeight - margin + 3, { align: 'center' });
        }

        if (autoSave && typeof window !== 'undefined') {
            doc.save(`Invoice-${invoice.invoice_number}.pdf`);
        }
        return doc;
    } catch (e) { console.error(e); return null; }
};

export const generateQuotationPDF = async (quotation, businessDetailsArg, autoSave = true) => {
    return generateInvoicePDF({ ...quotation, type: 'QUOTATION' }, businessDetailsArg, autoSave);
};
