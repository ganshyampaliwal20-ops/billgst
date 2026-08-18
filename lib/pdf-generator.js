import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import autoTable from 'jspdf-autotable';
import { numberToWords } from './gst-calculator';
import { DOC_LABELS, DOC_TYPES } from './constants';

let cachedBillGstLogo = null;
export const getBillGstLogo = async () => {
    if (cachedBillGstLogo !== null) return cachedBillGstLogo;
    try {
        const response = await fetch('/logo.png');
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => { cachedBillGstLogo = reader.result; resolve(cachedBillGstLogo); };
            reader.onerror = () => { cachedBillGstLogo = false; resolve(false); };
            reader.readAsDataURL(blob);
        });
    } catch(e) { cachedBillGstLogo = false; return false; }
};

export const drawFreeBranding = async (doc, isThermal, pageWidth, pageHeight, startY) => {
    try {
        const logoB64 = await getBillGstLogo();
        let yPos = startY || (pageHeight - 10);
        if (isThermal && !startY) yPos = pageHeight - 6;

        const logoSize = isThermal ? 3 : 4;
        const fontSize = isThermal ? 5 : 6;
        const text = 'Created for free using BillGST.in';
        
        doc.setFontSize(fontSize);
        const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
        
        if (logoB64) {
            const totalWidth = logoSize + 1.5 + textWidth;
            const startX = (pageWidth / 2) - (totalWidth / 2);
            doc.addImage(logoB64, 'PNG', startX, yPos, logoSize, logoSize);
            doc.setTextColor(150);
            doc.text(text, startX + logoSize + 1.5, yPos + (logoSize / 1.5));
        } else {
            doc.setTextColor(150);
            doc.text(text, pageWidth / 2, yPos + 3, { align: 'center' });
        }
    } catch(e) { }
};

const autoSavePDF = async (doc, fileName, action = 'view') => {
    if (typeof window === 'undefined') return;
    try {
        const { downloadAndShareFile } = await import('./utils');
        const base64Data = doc.output('datauristring').split(',')[1];
        await downloadAndShareFile(base64Data, fileName, 'application/pdf', action);
    } catch (e) {
        console.error('PDF Save error', e);
        doc.save(fileName);
    }
};

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
    },
    TEMPLATE_6: {
        accent: [190, 18, 60], // Rose Pink
        title: [225, 29, 72],
        font: 'helvetica'
    },
    TEMPLATE_7: {
        accent: [17, 24, 39], // Black/White
        title: [75, 85, 99],
        font: 'helvetica'
    }
};

export const generateInvoicePDF = async (invoice, businessDetailsArg, autoSave = true, action = 'view') => {
    try {
        if (!invoice) return null;

        const businessDetails = businessDetailsArg || {};
        // TEMPORARY: Force false to always show watermark
        const isPremium = ['BASIC_30', 'PREMIUM_99', 'YEARLY_299', 'LIFETIME'].includes(businessDetails?.plan_type);
        const templateId = businessDetails.invoice_template || 'TEMPLATE_1';
        const theme = THEMES[templateId] || THEMES.TEMPLATE_1;

        const pdfSize = invoice.pdf_size || businessDetails.pdf_size || 'A4';
        let formatOpt = 'a4';
        let customMargin = 8;
        let scale = 1;
        let isThermal = pdfSize === 'THERMAL';
        
        if (pdfSize === 'A5') {
            formatOpt = 'a5';
            customMargin = 6;
            scale = 0.85;
        } else if (isThermal) {
            formatOpt = [80, 297];
            customMargin = 4;
            scale = 0.7;
        }

        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: formatOpt });
        
        const originalSetFontSize = doc.setFontSize.bind(doc);
        doc.setFontSize = (size) => {
             return originalSetFontSize(isThermal ? Math.max(6, Math.floor(size * 0.7)) : Math.floor(size * scale));
        };

        const margin = customMargin;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const contentWidth = pageWidth - (margin * 2);

        // --- Main Border ---
        if (!isThermal) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.1);
            doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
        }

        // Determine Document Title
        let invoiceTitle = DOC_LABELS[invoice.type] || 'TAX INVOICE';
        if (!invoice.type || invoice.type === 'INVOICE') {
            const hasGst = (Number(invoice.cgst_amount) > 0 || Number(invoice.sgst_amount) > 0 || Number(invoice.igst_amount) > 0);
            if (!hasGst) {
                invoiceTitle = 'BILL OF SUPPLY';
            } else {
                invoiceTitle = 'TAX INVOICE';
            }
        } else if (invoice.type === 'QUOTATION') {
            invoiceTitle = 'ESTIMATE / QUOTATION';
        } else if (invoiceTitle) {
            invoiceTitle = String(invoiceTitle).toUpperCase();
        }

        // --- Header Logic based on Logo Position ---
        const logoPos = isThermal ? 'CENTER' : (businessDetails.logo_position || 'RIGHT');
        const tableFormat = isThermal ? 'FORMAT_3' : (businessDetails.invoice_table_format || 'FORMAT_1');
        let headerEndY = margin + 35;

        if (logoPos === 'CENTER') {
            // --- CENTER ALIGNMENT ---
            doc.setFontSize(10);
            doc.setFont(theme.font, 'bold');
            doc.setTextColor(theme.title[0], theme.title[1], theme.title[2]);
            doc.text(invoiceTitle, pageWidth / 2, margin + 5, { align: 'center' });

            if (businessDetails.logo) {
                try { 
                    const logoSize = isThermal ? 15 : 22;
                    doc.addImage(businessDetails.logo, 'PNG', (pageWidth / 2) - (logoSize/2), margin + 8, logoSize, logoSize); 
                } catch (e) { }
            }

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(isThermal ? 14 : 16);
            doc.setFont(theme.font, 'bold');
            doc.text(String(businessDetails.name || 'Your Business Name').toUpperCase(), pageWidth / 2, margin + (isThermal ? 28 : 35), { align: 'center' });

            doc.setFontSize(isThermal ? 7 : 8);
            doc.setFont(theme.font, 'normal');
            const busAddr = doc.splitTextToSize(businessDetails.address || '', contentWidth - 4);
            doc.text(busAddr, pageWidth / 2, margin + (isThermal ? 32 : 40), { align: 'center' });

            let contactY = margin + (isThermal ? 32 : 40) + (busAddr.length * 4);
            let contactText = '';
            if (businessDetails.phone) contactText += `Mob: ${businessDetails.phone} `;
            if (businessDetails.email && !isThermal) contactText += ` | Email: ${businessDetails.email}`;
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
            doc.text(invoiceTitle, pageWidth - margin - 2, margin + 10, { align: 'right' });
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
            doc.text(invoiceTitle, pageWidth / 2, margin + 35, { align: 'center' });
            doc.setTextColor(0, 0, 0);

            headerEndY = margin + 40;
        }

        // Info Split
        const infoY = headerEndY + 5;
        doc.setFontSize(isThermal ? 8 : 9);
        doc.setFont(theme.font, 'bold');
        doc.text('Bill To:', margin + 2, infoY);
        doc.setFontSize(isThermal ? 9 : 10);
        doc.text(invoice.customer?.name || 'Cash Sale', margin + 2, infoY + 5);
        doc.setFontSize(isThermal ? 7 : 8);
        doc.setFont(theme.font, 'normal');
        const custAddr = doc.splitTextToSize(invoice.customer?.address || '', isThermal ? contentWidth - 4 : 80);
        doc.text(custAddr, margin + 2, infoY + (isThermal ? 9 : 10));

        let nextY = infoY + (isThermal ? 9 : 10) + (Math.max(1, custAddr.length) * (isThermal ? 3 : 4));

        if (invoice.customer?.phone) {
            doc.setFont(theme.font, 'bold');
            doc.text('Mob:', margin + 2, nextY);
            doc.setFont(theme.font, 'normal');
            doc.text(String(invoice.customer.phone), margin + (isThermal ? 9 : 12), nextY);
            nextY += (isThermal ? 3 : 4);
        }

        if (invoice.customer?.gstin) {
            doc.setFont(theme.font, 'bold');
            doc.text('GSTIN:', margin + 2, nextY);
            doc.setFont(theme.font, 'normal');
            doc.text(String(invoice.customer.gstin), margin + (isThermal ? 11 : 14), nextY);
            nextY += (isThermal ? 3 : 4);
        }

        const rightInfoX = isThermal ? margin + 2 : (pageWidth - margin - 50);
        let invoiceMetaY = isThermal ? nextY + 4 : infoY + 5;
        doc.setFont(theme.font, 'bold');
        doc.text(`Invoice No.: ${invoice.invoice_number || 'N/A'}`, rightInfoX, invoiceMetaY);
        const safeDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-';
        doc.text(`Date: ${safeDate(invoice.invoice_date)}`, rightInfoX, invoiceMetaY + (isThermal ? 4 : 5));
        
        let startTableY = (isThermal ? invoiceMetaY + 8 : Math.max(nextY, invoiceMetaY + 10)) + 5;

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
            tableConfig.styles = { ...tableConfig.styles, lineWidth: 0.1, lineColor: [0, 0, 0], minCellHeight: 8 };
            tableConfig.headStyles = { ...tableConfig.headStyles, fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] };
        } else if (tableFormat === 'FORMAT_3') {
            // Minimal - Only horizontal lines
            tableConfig.theme = 'plain';
            tableConfig.styles = { ...tableConfig.styles, cellPadding: 3 };
            tableConfig.headStyles = { ...tableConfig.headStyles, fillColor: null, textColor: theme.accent, borderBottomWidth: 0.5, lineColor: theme.accent };
            tableConfig.bodyStyles = { borderBottomWidth: 0.1, lineColor: [220, 220, 220] };
        } else if (tableFormat === 'FORMAT_4') {
            // Modern - Striped with Theme Accent
            tableConfig.theme = 'striped';
            tableConfig.styles = { ...tableConfig.styles, lineWidth: 0, cellPadding: 4 };
            tableConfig.headStyles = { ...tableConfig.headStyles, fillColor: theme.accent, textColor: [255, 255, 255], fontStyle: 'bold' };
            
            const r = theme.accent[0], g = theme.accent[1], b = theme.accent[2];
            const lightAccent = [
                Math.round(255 - (255 - r) * 0.08),
                Math.round(255 - (255 - g) * 0.08),
                Math.round(255 - (255 - b) * 0.08)
            ];
            tableConfig.alternateRowStyles = { fillColor: lightAccent };
        } else if (tableFormat === 'FORMAT_5') {
            // Compact - Small font, tight padding
            tableConfig.theme = 'grid';
            tableConfig.styles = { fontSize: 7, cellPadding: 1 };
            tableConfig.headStyles = { ...tableConfig.headStyles, fontSize: 7, padding: 1 };
        } else {
            // Standard (Format 1) - Default Grid
            tableConfig.theme = 'grid';
        }

        if (isThermal) {
            tableConfig.styles = { ...tableConfig.styles, fontSize: 6, cellPadding: 1 };
            tableConfig.headStyles = { ...tableConfig.headStyles, fontSize: 6, cellPadding: 1 };
            tableConfig.columnStyles = {
                0: { cellWidth: 5 }, // #
                1: { cellWidth: 'auto' }, // Item
                2: { cellWidth: 0 }, // HSN (Hidden)
                3: { cellWidth: 8, halign: 'center' }, // Qty
                4: { cellWidth: 0 }, // Unit (Hidden)
                5: { cellWidth: 12, halign: 'right' }, // Price
                6: { cellWidth: 15, halign: 'right' }  // Amount
            };
        }

        let itemsBody = [];
        if (isThermal) {
            itemsBody = (invoice.items || []).map((item, idx) => [
                idx + 1, item.product_name || '-', '', item.quantity || 0,
                '', Number(item.unit_price || 0).toFixed(2),
                (Number(item.quantity || 0) * Number(item.unit_price || 0)).toFixed(2)
            ]);
        } else {
            itemsBody = (invoice.items || []).map((item, idx) => [
                idx + 1, item.product_name || '-', item.hsn_code || '-', item.quantity || 0,
                item.unit || 'PCS', Number(item.unit_price || 0).toFixed(2),
                (Number(item.quantity || 0) * Number(item.unit_price || 0)).toFixed(2)
            ]);
        }

        if (tableFormat === 'FORMAT_2') {
            const minRows = isThermal ? 5 : (pdfSize === 'A5' ? 10 : 18);
            while (itemsBody.length < minRows) {
                itemsBody.push(['', '', '', '', '', '', '']);
            }
        }

        // Table
        autoTable(doc, {
            startY: startTableY,
            head: isThermal 
                ? [['#', 'ITEM', '', 'QTY', '', 'RATE', 'AMT']]
                : [['#', 'ITEM NAME', 'HSN/ SAC', 'QTY', 'UNIT', 'RATE', 'AMOUNT']],
            body: itemsBody,
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
        const summaryWidth = isThermal ? 42 : (pdfSize === 'A5' ? 50 : 60);
        const sX = pageWidth - margin - summaryWidth;
        let sY = finalY;
        const row = (l, v, y, bold = false) => {
            if (bold) { doc.setFillColor(...theme.accent); doc.rect(sX, y - 4, summaryWidth, 7, 'F'); doc.setTextColor(255); }
            doc.text(l, sX + 2, y); doc.text(`Rs. ${Number(v || 0).toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });
            doc.setTextColor(0); return y + 7;
        };

        sY = row('Sub Total', invoice.subtotal, sY);
        
        // Calculate Discount
        const subtotal = Number(invoice.subtotal) || 0;
        const discountPct = Number(invoice.discount_pct) || 0;
        const discountAmt = subtotal * (discountPct / 100);
        if (discountAmt > 0) {
            sY = row(`Discount (${discountPct}%)`, -discountAmt, sY);
        }

        // GST
        if (invoice.cgst_amount > 0) { 
            sY = row('CGST', invoice.cgst_amount, sY); 
            sY = row('SGST', invoice.sgst_amount, sY); 
        } else if (invoice.igst_amount > 0) { 
            sY = row('IGST', invoice.igst_amount, sY); 
        }

        // Extra Charges
        const extraCharges = Number(invoice.extra_charges) || 0;
        if (extraCharges > 0) {
            sY = row('Extra Fee', extraCharges, sY);
        }

        // Shipping Charges
        const shippingCharges = Number(invoice.shipping_charges) || 0;
        if (shippingCharges > 0) {
            sY = row('Shipping', shippingCharges, sY);
        }

        sY = row('Total', invoice.total_amount, sY, true);

        // Payment Details
        const paidAmount = Number(invoice.paid_amount) || 0;
        const paymentMode = invoice.payment_mode || 'Cash';
        if (paidAmount > 0) {
            sY = row(`Paid (${paymentMode})`, paidAmount, sY);
            const balance = Math.max(0, Number(invoice.total_amount) - paidAmount);
            if (balance > 0) {
                sY = row('Balance Due', balance, sY);
            }
        }

        // --- Footer Organisation ---
        const qrSize = isThermal ? 16 : (pdfSize === 'A5' ? 20 : 25);
        
        let bottomBoxLimit;
        if (isThermal) {
            // Thermal doesn't have a strict bottom bound, just append below content
            bottomBoxLimit = sY + qrSize + 15;
            // Optionally adjust jsPDF height for thermal if it's dynamic
        } else {
            bottomBoxLimit = pageHeight - margin;
        }

        let isFreeTrialValid = true;
        if (businessDetails?.created_at) {
            const createdDate = new Date(businessDetails.created_at);
            const oneMonthLater = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            if (new Date() > oneMonthLater) {
                isFreeTrialValid = false;
            }
        }
        const isPremiumForQR = ['BASIC_30', 'PREMIUM_99', 'YEARLY_299', 'LIFETIME'].includes(businessDetails?.plan_type);
        
        const hasQR = Boolean(businessDetails.upi_id && invoice.total_amount > 0 && (isPremiumForQR || isFreeTrialValid));
        const hasBank = Boolean(businessDetails.show_bank_details && businessDetails.bank_name);

        const qrY = isThermal ? sY + 5 : bottomBoxLimit - qrSize - 8;
        let qrX = isThermal ? (pageWidth/2 - qrSize/2) : (margin + 2);

        // QR Code
        if (hasQR) {
            try {
                const upiLink = `upi://pay?pa=${businessDetails.upi_id}&pn=${encodeURIComponent(businessDetails.name)}&am=${Number(invoice.total_amount).toFixed(2)}&cu=INR`;
                const qrDataUrl = await QRCode.toDataURL(upiLink, { margin: 1 });
                doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
                doc.setFontSize(isThermal ? 6 : 7);
                doc.setFont(theme.font, 'bold');
                doc.text('Scan to Pay', qrX + (qrSize / 2), qrY + qrSize + (isThermal ? 3 : 4), { align: 'center' });
            } catch (e) { }
        }

        // Bank Details
        if (hasBank) {
            let bankX = margin + 2;
            let bankY = isThermal ? (hasQR ? qrY + qrSize + 15 : sY + 5) : bottomBoxLimit - 20;

            if (!isThermal && hasQR) {
                bankX = qrX + qrSize + 10;
                bankY = qrY + 4;
            }

            doc.setFontSize(isThermal ? 6 : 7);
            doc.setFont(theme.font, 'bold');
            doc.text('BANK ACCOUNT DETAILS', bankX, bankY);
            doc.setFont(theme.font, 'normal');
            doc.text([
                'Bank: ' + businessDetails.bank_name,
                'A/C: ' + businessDetails.account_no,
                'IFSC: ' + businessDetails.ifsc_code
            ], bankX, bankY + 4);
        }

        // Signature area
        const sigY = isThermal ? qrY + qrSize + 25 : bottomBoxLimit - 25;
        doc.setFontSize(isThermal ? 7 : 8);
        doc.setFont(theme.font, 'normal');
        const footerBusName = String(businessDetails.name || 'Your Business Name').toUpperCase();
        doc.text(`For, ${footerBusName}`, pageWidth - margin - 2, sigY, { align: 'right' });

        if (businessDetails.signature) {
            try {
                const signW = isThermal ? 20 : (pdfSize === 'A5' ? 25 : 35);
                const signH = isThermal ? 7 : (pdfSize === 'A5' ? 9 : 12);
                doc.addImage(businessDetails.signature, 'PNG', pageWidth - margin - (signW + 5), sigY + 2, signW, signH);
            } catch (e) { }
        }

        const lineW = isThermal ? 25 : (pdfSize === 'A5' ? 35 : 45);
        doc.line(pageWidth - margin - lineW, sigY + 14, pageWidth - margin - 2, sigY + 14);
        doc.setFont(theme.font, 'bold');
        doc.text('Authorized Signatory', pageWidth - margin - 2, sigY + 18, { align: 'right' });

        // Branding
        if (!isPremium) {
            await drawFreeBranding(doc, isThermal, pageWidth, pageHeight, isThermal ? sigY + 22 : bottomBoxLimit + 2);
        }

        if (autoSave && typeof window !== 'undefined') {
            await autoSavePDF(doc, `Invoice_${invoice.invoice_number || '001'}_${Date.now()}.pdf`, action);
        }
        return doc;
    } catch (e) {
        console.error('PDF Generation Error:', e);
        return null;
    }
};

export const generateQuotationPDF = async (quotation, businessDetailsArg, autoSave = true, action = 'view') => {
    return generateInvoicePDF({ ...quotation, type: 'QUOTATION' }, businessDetailsArg, autoSave, action);
};

export const generateHisaabPDF = async (customer, businessDetails, custStats, autoSave = true, action = 'view') => {
    try {
        if (!customer) return null;
        
        const pdfSize = businessDetails?.pdf_size || 'A4';
        let formatOpt = 'a4';
        let customMargin = 8;
        let scale = 1;
        let isThermal = pdfSize === 'THERMAL';
        
        if (pdfSize === 'A5') {
            formatOpt = 'a5';
            customMargin = 6;
            scale = 0.85;
        } else if (isThermal) {
            formatOpt = [80, 297];
            customMargin = 4;
            scale = 0.7;
        }

        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: formatOpt });
        
        const originalSetFontSize = doc.setFontSize.bind(doc);
        doc.setFontSize = (size) => {
             return originalSetFontSize(isThermal ? Math.max(6, Math.floor(size * 0.7)) : Math.floor(size * scale));
        };

        const margin = customMargin;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const contentWidth = pageWidth - (margin * 2);

        // --- Main Border ---
        if (!isThermal) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.1);
            doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
        }

        // --- Header ---
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(String(businessDetails?.name || 'BillGST Pro').toUpperCase(), pageWidth / 2, margin + 10, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (businessDetails?.phone) {
            doc.text(`Phone: ${businessDetails.phone}`, pageWidth / 2, margin + 15, { align: 'center' });
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CUSTOMER LEDGER REPORT', pageWidth / 2, margin + 25, { align: 'center' });

        // --- Customer Info ---
        const infoY = margin + 35;
        doc.setFontSize(10);
        doc.text('Customer Name:', margin + 2, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(customer.name || '-', margin + 35, infoY);

        doc.setFont('helvetica', 'bold');
        doc.text('Phone:', margin + 2, infoY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(customer.phone || '-', margin + 35, infoY + 6);

        doc.setFont('helvetica', 'bold');
        doc.text('Report Date:', pageWidth - margin - 45, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(new Date().toLocaleDateString('en-GB'), pageWidth - margin - 20, infoY);

        // --- Summary Box ---
        const summaryY = infoY + 15;
        doc.setFillColor(245, 247, 250);
        doc.rect(margin, summaryY, contentWidth, 20, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Total Received (Credit):', margin + 5, summaryY + 7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 150, 0);
        doc.text(`Rs. ${Number(custStats.credit).toFixed(2)}`, margin + 45, summaryY + 7);
        doc.setTextColor(0);

        doc.setFont('helvetica', 'bold');
        doc.text('Total Given (Debit):', margin + 70, summaryY + 7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(200, 0, 0);
        doc.text(`Rs. ${Number(custStats.debit).toFixed(2)}`, margin + 105, summaryY + 7);
        doc.setTextColor(0);

        doc.setFont('helvetica', 'bold');
        const netLabel = custStats.isNeg ? 'Net Balance (Dena Hai):' : 'Net Balance (Lena Hai):';
        doc.text(netLabel, margin + 5, summaryY + 15);
        doc.setFont('helvetica', 'normal');
        if (custStats.isNeg) {
            doc.setTextColor(200, 0, 0);
        } else {
            doc.setTextColor(0, 150, 0);
        }
        doc.text(`Rs. ${Number(custStats.net).toFixed(2)}`, margin + 50, summaryY + 15);
        doc.setTextColor(0);

        // --- Table ---
        let runningBal = customer.balance || 0;
        let c = 0, d = 0;
        (customer.txns || []).forEach(t => {
            if (t.type === 'credit') c += Number(t.amt);
            else d += Number(t.amt);
        });
        let openingBal = runningBal - d + c;

        const rows = [];
        if (Math.abs(openingBal) > 0.01) {
            rows.push(['-', 'Opening Balance', '-', '-', '-', Number(Math.abs(openingBal)).toFixed(2) + (openingBal < 0 ? ' (Cr)' : ' (Dr)')]);
        }

        const sortedTxns = [...(customer.txns || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let currentRunBal = openingBal;
        
        sortedTxns.forEach((t) => {
            let desc = t.name || t.type;
            if (t.note) desc += `\nNote: ${t.note}`;
            const isCredit = t.type === 'credit';
            if (isCredit) {
                currentRunBal -= Number(t.amt);
            } else {
                currentRunBal += Number(t.amt);
            }
            rows.push([
                new Date(t.date).toLocaleDateString('en-GB'),
                desc,
                t.type.toUpperCase(),
                isCredit ? Number(t.amt).toFixed(2) : '-',
                !isCredit ? Number(t.amt).toFixed(2) : '-',
                Number(Math.abs(currentRunBal)).toFixed(2) + (currentRunBal < 0 ? ' (Cr)' : ' (Dr)')
            ]);
        });
        
        autoTable(doc, {
            startY: summaryY + 25,
            head: [['DATE', 'DESCRIPTION', 'TYPE', 'CREDIT (IN)', 'DEBIT (OUT)', 'BALANCE']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [93, 80, 136], textColor: 255, fontSize: 8, fontStyle: 'bold' },
            styles: { fontSize: 8 },
            margin: { left: margin, right: margin, top: margin, bottom: margin + 10 },
            didDrawPage: function (data) {
                if (data.pageNumber > 1) {
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.1);
                    doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
                }
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${data.pageNumber}`, pageWidth - margin - 15, pageHeight - margin + 6);
            }
        });

        // Branding
        // TEMPORARY: Force false to always show watermark
        const isPremium = ['BASIC_30', 'PREMIUM_99', 'YEARLY_299', 'LIFETIME'].includes(businessDetails?.plan_type);
        if (!isPremium) {
            await drawFreeBranding(doc, false, pageWidth, pageHeight, pageHeight - margin + 2);
        }

        if (autoSave && typeof window !== 'undefined') {
            await autoSavePDF(doc, `Hisaab_${customer.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`, action);
        }
        return doc;
    } catch (e) {
        console.error('Hisaab PDF Error:', e);
        return null;
    }
};

export const generateCatalogPDF = async (products, businessDetails, autoSave = true) => {
    try {
        if (!products) return null;
        
        const pdfSize = businessDetails?.pdf_size || 'A4';
        let formatOpt = 'a4';
        let customMargin = 8;
        let scale = 1;
        let isThermal = pdfSize === 'THERMAL';
        
        if (pdfSize === 'A5') {
            formatOpt = 'a5';
            customMargin = 6;
            scale = 0.85;
        } else if (isThermal) {
            formatOpt = [80, 297];
            customMargin = 4;
            scale = 0.7;
        }

        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: formatOpt });
        
        const originalSetFontSize = doc.setFontSize.bind(doc);
        doc.setFontSize = (size) => {
             return originalSetFontSize(isThermal ? Math.max(6, Math.floor(size * 0.7)) : Math.floor(size * scale));
        };

        const margin = customMargin;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const contentWidth = pageWidth - (margin * 2);

        // --- Main Border ---
        if (!isThermal) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.1);
            doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
        }

        // --- Header ---
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(String(businessDetails?.name || 'PRODUCT CATALOG').toUpperCase(), pageWidth / 2, margin + 12, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (businessDetails?.phone) {
            doc.text(`Phone: ${businessDetails.phone} | ${businessDetails.email || ''}`, pageWidth / 2, margin + 18, { align: 'center' });
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(93, 80, 136);
        doc.text('ITEM PRICE LIST', pageWidth / 2, margin + 28, { align: 'center' });
        doc.setTextColor(0);

        // --- Table ---
        autoTable(doc, {
            startY: margin + 35,
            head: [['#', 'PRODUCT NAME', 'CATEGORY', 'UNIT', 'PRICE (Rs.)']],
            body: products.map((p, idx) => [
                idx + 1, 
                p.name, 
                p.category || 'General', 
                p.unit || 'PCS', 
                Number(p.price || p.sale_price || 0).toFixed(2)
            ]),
            theme: 'grid',
            headStyles: { fillColor: [93, 80, 136], textColor: 255, fontSize: 10, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 30 },
                3: { cellWidth: 20 },
                4: { cellWidth: 30, halign: 'right' }
            },
            margin: { left: margin, right: margin }
        });

        // Branding
        // TEMPORARY: Force false to always show watermark
        const isPremium = ['BASIC_30', 'PREMIUM_99', 'YEARLY_299', 'LIFETIME'].includes(businessDetails?.plan_type);
        if (!isPremium) {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text('Catalog generated by www.billgst.in - Get your own digital store at billgst.in', pageWidth / 2, pageHeight - margin + 5, { align: 'center' });
        }

        if (autoSave && typeof window !== 'undefined') {
            await autoSavePDF(doc, `Product_Catalog_${Date.now()}.pdf`);
        }
        return doc;
    } catch (e) {
        console.error('Catalog PDF Error:', e);
        return null;
    }
};
