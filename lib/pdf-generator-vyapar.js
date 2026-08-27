import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import { numberToWords } from './gst-calculator';
import { DOC_LABELS } from './constants';
import { LOGO_B64 } from './logo-b64';
import { downloadAndShareFile } from './utils';

export const generateVyaparInvoicePDF = async (invoice, businessDetails, autoSave = true, action = 'view', externalToastId = null) => {
    const toastId = externalToastId
        ? (toast.loading('Generating PDF (Vyapar Style)...', { id: externalToastId }), externalToastId)
        : toast.loading('Generating PDF (Vyapar Style)...');
    try {
        if (!invoice) {
            toast.dismiss(toastId);
            return null;
        }

        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const margin = 10;
        const pageWidth = 210;
        const pageHeight = 297;
        const contentWidth = pageWidth - (margin * 2);

        // We will draw the bounding box at the end when we know the height

        // --- Document Title ---
        let invoiceTitle = DOC_LABELS[invoice.type] || 'TAX INVOICE';
        if (!invoice.type || invoice.type === 'INVOICE') {
            const hasGst = (Number(invoice.cgst_amount) > 0 || Number(invoice.sgst_amount) > 0 || Number(invoice.igst_amount) > 0);
            invoiceTitle = hasGst ? 'TAX INVOICE' : 'BILL OF SUPPLY';
        } else if (invoice.type === 'QUOTATION') {
            invoiceTitle = 'ESTIMATE / QUOTATION';
        }

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(invoiceTitle, pageWidth / 2, margin + 5, { align: 'center' });

        // --- Business Details (Header) ---
        let startY = margin + 12;
        if (businessDetails.logo) {
            try {
                doc.addImage(businessDetails.logo, 'PNG', margin + 2, startY, 15, 15);
            } catch (e) {
                console.error('Logo add failed', e);
            }
        } else {
            // Placeholder logo
            doc.setFillColor(30, 30, 30);
            doc.rect(margin + 2, startY, 15, 15, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text(businessDetails.name ? businessDetails.name.substring(0,2).toUpperCase() : 'KH', margin + 9.5, startY + 8, { align: 'center' });
        }

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        const nameX = margin + 20;
        doc.text((businessDetails.business_name || businessDetails.name || 'Business Name').toUpperCase(), nameX, startY + 3);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        const addr = businessDetails.address || 'Address not provided';
        doc.text(addr, nameX, startY + 8);
        
        const phoneStr = businessDetails.phone ? `Phone: ${businessDetails.phone}` : '';
        const emailStr = businessDetails.email ? `Email: ${businessDetails.email}` : '';
        doc.text(`${phoneStr}          ${emailStr}`, nameX, startY + 13);

        // Header Bottom Line
        let currY = startY + 18;
        doc.line(margin, currY, pageWidth - margin, currY);

        // --- Bill To & Invoice Details ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('Bill To:', margin + 2, currY + 4);
        
        doc.line(margin, currY + 6, pageWidth - margin, currY + 6); // Inner horizontal
        doc.text('Invoice Details:', pageWidth / 2 + 2, currY + 4);

        doc.line(pageWidth / 2, currY, pageWidth / 2, currY + 18); // Vertical split

        // Customer details
        doc.setFont('helvetica', 'bold');
        doc.text((invoice.customer?.name || 'Customer').toUpperCase(), margin + 2, currY + 11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Contact No: ${invoice.customer?.phone || 'N/A'}`, margin + 2, currY + 16);

        // Invoice details
        doc.text(`Invoice No: ${invoice.invoice_number || 'N/A'}`, pageWidth / 2 + 2, currY + 11);
        const dateStr = (invoice.invoice_date || invoice.created_at) ? new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString('en-IN') : 'N/A';
        doc.text(`Date: ${dateStr}`, pageWidth / 2 + 2, currY + 16);

        currY += 18;
        doc.line(margin, currY, pageWidth - margin, currY);

        // --- Table ---
        const tableCols = ['SR NO.', 'Item name', 'Quantity', 'Unit', 'Price/Unit(Rs.)', 'Amount(Rs.)'];
        const tableRows = [];
        let totalQty = 0;

        (invoice.items || []).forEach((item, index) => {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.unit_price) || 0;
            const amt = Number(item.amount) || (qty * price);
            totalQty += qty;
            tableRows.push([
                String(index + 1),
                (item.product_name || '').toUpperCase(),
                qty.toFixed(1),
                item.unit || 'Kg',
                `Rs. ${price.toFixed(2)}`,
                `Rs. ${amt.toFixed(2)}`
            ]);
        });

        autoTable(doc, {
            startY: currY,
            head: [tableCols],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7, lineWidth: 0.2, lineColor: [0, 0, 0] },
            bodyStyles: { fontSize: 7, textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 20, halign: 'right' },
                3: { cellWidth: 15, halign: 'right' },
                4: { cellWidth: 25, halign: 'right' },
                5: { cellWidth: 25, halign: 'right' },
            },
            margin: { left: margin, right: margin },
            tableLineWidth: 0.2,
            tableLineColor: [0, 0, 0],
            foot: [['Total', '', totalQty.toFixed(1), '', '', `Rs. ${Number(invoice.total_amount || 0).toFixed(2)}`]],
            footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7, lineWidth: 0.2, lineColor: [0, 0, 0], halign: 'right' },
            didParseCell: function(data) {
                if (data.section === 'foot' && data.column.index === 0) {
                    data.cell.styles.halign = 'left';
                }
            }
        });

        currY = doc.lastAutoTable.finalY;

        // --- Bottom Section ---
        // We have to draw the footer ourselves.
        doc.setLineWidth(0.2);
        
        // Horizontal line for Payment Mode header
        doc.line(margin, currY + 6, pageWidth / 2, currY + 6);
        // Vertical split line
        doc.line(pageWidth / 2, currY, pageWidth / 2, currY + 36);

        // Left side
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Mode:', margin + 2, currY + 4);
        doc.setFont('helvetica', 'normal');
        
        const bal = Math.max(Number(invoice.total_amount || 0) - Number(invoice.paid_amount || 0), 0);
        const isPaid = (invoice.status || '').toLowerCase() === 'paid' || bal <= 0;
        doc.text(isPaid ? 'Cash/UPI' : 'Credit', margin + 2, currY + 11);

        // Right side (Totals)
        doc.text('Sub Total', pageWidth / 2 + 2, currY + 4);
        doc.text(':', pageWidth / 2 + 30, currY + 4);
        doc.text(`Rs. ${Number(invoice.total_amount || 0).toFixed(2)}`, pageWidth - margin - 2, currY + 4, { align: 'right' });

        doc.line(pageWidth / 2, currY + 6, pageWidth - margin, currY + 6);

        doc.setFont('helvetica', 'bold');
        doc.text('Total', pageWidth / 2 + 2, currY + 11);
        doc.text(':', pageWidth / 2 + 30, currY + 11);
        doc.text(`Rs. ${Number(invoice.total_amount || 0).toFixed(2)}`, pageWidth - margin - 2, currY + 11, { align: 'right' });

        doc.line(pageWidth / 2, currY + 13, pageWidth - margin, currY + 13);

        doc.setFont('helvetica', 'bold');
        doc.text('Invoice Amount in Words:', pageWidth / 2 + 2, currY + 17);
        doc.setFont('helvetica', 'normal');
        const inWords = numberToWords(Number(invoice.total_amount || 0));
        doc.text(inWords, pageWidth / 2 + 2, currY + 22);
        
        doc.line(pageWidth / 2, currY + 24, pageWidth - margin, currY + 24);

        doc.setFontSize(6);
        doc.text('Received', pageWidth / 2 + 2, currY + 28);
        doc.text(':', pageWidth / 2 + 30, currY + 28);
        doc.text(`Rs. ${Number(invoice.paid_amount || 0).toFixed(2)}`, pageWidth - margin - 2, currY + 28, { align: 'right' });

        doc.text('Current Balance', pageWidth / 2 + 2, currY + 34);
        doc.text(':', pageWidth / 2 + 30, currY + 34);
        doc.text(`Rs. ${bal.toFixed(2)}`, pageWidth - margin - 2, currY + 34, { align: 'right' });

        currY += 36;
        doc.line(margin, currY, pageWidth - margin, currY);

        // --- Signature ---
        const sigY = currY;
        const sigHeight = 25;
        doc.line(pageWidth / 2, sigY, pageWidth / 2, sigY + sigHeight); // split

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text(`For ${(businessDetails.business_name || businessDetails.name || 'Business Name').toUpperCase()}:`, pageWidth / 2 + 2, sigY + 4);

        if (businessDetails.signature) {
            try {
                doc.addImage(businessDetails.signature, 'PNG', pageWidth - margin - 35, sigY + 6, 25, 12);
            } catch (e) {
                console.log('Sig err', e);
            }
        }
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.text('Authorized Signatory', pageWidth - margin - 20, sigY + 22, { align: 'center' });
        
        // Draw the outer bounding box now that we know the final height
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.rect(margin, margin, contentWidth, (sigY + sigHeight) - margin);
        
        const fileName = `Invoice_${invoice.invoice_number || '001'}_${Date.now()}.pdf`;
        toast.dismiss(toastId);
        
        if (autoSave && typeof window !== 'undefined') {
            try {
                const base64Data = doc.output('datauristring').split(',')[1];
                await downloadAndShareFile(base64Data, fileName, 'application/pdf', action);
            } catch (e) {
                console.error('PDF Save error', e);
                doc.save(fileName);
            }
        }

        return doc;
    } catch (e) {
        console.error('PDF Generation Error:', e);
        if (typeof toastId !== 'undefined') {
            toast.dismiss(toastId);
            toast.error('Failed to generate PDF');
        }
        return null;
    }
};
