/**
 * GSTR Generators
 * Core logic for generating GST returns from invoice data
 */

import { validateGSTIN, isInterState, getStateCodeFromGSTIN } from './gstr-validators';

interface Invoice {
    id: string;
    invoice_number: string;
    invoice_date: string;
    customer_id: string;
    customer: {
        name: string;
        gstin?: string;
        state?: string;
        address?: string;
    };
    items: InvoiceItem[];
    subtotal: number;
    cgst_amount: number;
    sgst_amount: number;
    igst_amount: number;
    total_amount: number;
}

interface InvoiceItem {
    product_name: string;
    hsn_code?: string;
    quantity: number;
    unit_price: number;
    gst_rate: number;
    total_amount: number;
}

interface B2BInvoice {
    gstin: string;
    customer_name: string;
    invoice_number: string;
    invoice_date: string;
    invoice_value: number;
    place_of_supply: string;
    reverse_charge: 'Y' | 'N';
    invoice_type: 'Regular' | 'Export' | 'SEZ';
    rate: number;
    taxable_value: number;
    igst_amount: number;
    cgst_amount: number;
    sgst_amount: number;
}

interface B2CLInvoice {
    invoice_number: string;
    invoice_date: string;
    invoice_value: number;
    place_of_supply: string;
    rate: number;
    taxable_value: number;
    igst_amount: number;
}

interface B2CSInvoice {
    type: 'OE' | 'E'; // OE = Outward taxable supplies, E = Exports
    place_of_supply: string;
    rate: number;
    taxable_value: number;
    igst_amount: number;
    cgst_amount: number;
    sgst_amount: number;
}

interface HSNSummary {
    hsn_code: string;
    description: string;
    uqc: string; // Unit of Quantity Code
    total_quantity: number;
    total_value: number;
    taxable_value: number;
    igst_amount: number;
    cgst_amount: number;
    sgst_amount: number;
    rate: number;
}

interface GSTR1Data {
    gstin: string;
    legal_name: string;
    period: string;
    b2b: B2BInvoice[];
    b2cl: B2CLInvoice[];
    b2cs: B2CSInvoice[];
    hsn: HSNSummary[];
    doc_issue: {
        invoices: {
            from: string;
            to: string;
            total: number;
            cancelled: number;
        };
    };
}

interface GSTR3BData {
    gstin: string;
    legal_name: string;
    period: string;
    outward_supplies: {
        taxable_value: number;
        igst: number;
        cgst: number;
        sgst: number;
        cess: number;
    };
    total_tax_liability: {
        igst: number;
        cgst: number;
        sgst: number;
        cess: number;
    };
}

interface GSTR4Data {
    gstin: string;
    legal_name: string;
    period: string;
    total_turnover: number;
    total_tax_paid: number;
    supplies_made: {
        intra_state: number;
        inter_state: number;
    };
}

/**
 * Generate GSTR-1 (Outward Supplies)
 */
export function generateGSTR1(
    invoices: Invoice[],
    businessProfile: { gstin: string; name: string; state?: string },
    periodFrom: Date,
    periodTo: Date
): GSTR1Data {
    const b2b: B2BInvoice[] = [];
    const b2cl: B2CLInvoice[] = [];
    const b2csMap = new Map<string, B2CSInvoice>();
    const hsnMap = new Map<string, HSNSummary>();

    const businessStateCode = getStateCodeFromGSTIN(businessProfile.gstin);

    invoices.forEach((invoice) => {
        const customerGSTIN = invoice.customer?.gstin;
        const hasGSTIN = customerGSTIN && validateGSTIN(customerGSTIN);
        const isInterStateTxn = hasGSTIN ? isInterState(businessProfile.gstin, customerGSTIN) : false;

        // Process each item for HSN summary
        invoice.items?.forEach((item) => {
            const hsnCode = item.hsn_code || 'UNKNOWN';
            const itemTaxableValue = item.total_amount;
            const gstRate = item.gst_rate;

            // Calculate item-level GST
            const itemGSTAmount = (itemTaxableValue * gstRate) / 100;
            const itemCGST = isInterStateTxn ? 0 : itemGSTAmount / 2;
            const itemSGST = isInterStateTxn ? 0 : itemGSTAmount / 2;
            const itemIGST = isInterStateTxn ? itemGSTAmount : 0;

            if (hsnMap.has(hsnCode)) {
                const existing = hsnMap.get(hsnCode)!;
                existing.total_quantity += item.quantity;
                existing.total_value += item.total_amount;
                existing.taxable_value += itemTaxableValue;
                existing.igst_amount += itemIGST;
                existing.cgst_amount += itemCGST;
                existing.sgst_amount += itemSGST;
            } else {
                hsnMap.set(hsnCode, {
                    hsn_code: hsnCode,
                    description: item.product_name,
                    uqc: 'PCS',
                    total_quantity: item.quantity,
                    total_value: item.total_amount,
                    taxable_value: itemTaxableValue,
                    igst_amount: itemIGST,
                    cgst_amount: itemCGST,
                    sgst_amount: itemSGST,
                    rate: gstRate,
                });
            }
        });

        // B2B: Invoices with GSTIN
        if (hasGSTIN) {
            b2b.push({
                gstin: customerGSTIN,
                customer_name: invoice.customer.name,
                invoice_number: invoice.invoice_number,
                invoice_date: new Date(invoice.invoice_date).toISOString().split('T')[0],
                invoice_value: invoice.total_amount,
                place_of_supply: invoice.customer.state || businessProfile.state || '',
                reverse_charge: 'N',
                invoice_type: 'Regular',
                rate: invoice.items[0]?.gst_rate || 0,
                taxable_value: invoice.subtotal,
                igst_amount: invoice.igst_amount,
                cgst_amount: invoice.cgst_amount,
                sgst_amount: invoice.sgst_amount,
            });
        }
        // B2CL: Large invoices (> 2.5 lakh) without GSTIN
        else if (invoice.total_amount > 250000) {
            b2cl.push({
                invoice_number: invoice.invoice_number,
                invoice_date: new Date(invoice.invoice_date).toISOString().split('T')[0],
                invoice_value: invoice.total_amount,
                place_of_supply: invoice.customer.state || businessProfile.state || '',
                rate: invoice.items[0]?.gst_rate || 0,
                taxable_value: invoice.subtotal,
                igst_amount: invoice.igst_amount,
            });
        }
        // B2CS: Small invoices aggregated by state and rate
        else {
            const customerState = invoice.customer.state || businessProfile.state || '';
            const rate = invoice.items[0]?.gst_rate || 0;
            const key = `${customerState}-${rate}`;

            if (b2csMap.has(key)) {
                const existing = b2csMap.get(key)!;
                existing.taxable_value += invoice.subtotal;
                existing.igst_amount += invoice.igst_amount;
                existing.cgst_amount += invoice.cgst_amount;
                existing.sgst_amount += invoice.sgst_amount;
            } else {
                b2csMap.set(key, {
                    type: 'OE',
                    place_of_supply: customerState,
                    rate: rate,
                    taxable_value: invoice.subtotal,
                    igst_amount: invoice.igst_amount,
                    cgst_amount: invoice.cgst_amount,
                    sgst_amount: invoice.sgst_amount,
                });
            }
        }
    });

    // Format period (MM-YYYY)
    const period = `${String(periodFrom.getMonth() + 1).padStart(2, '0')}-${periodFrom.getFullYear()}`;

    return {
        gstin: businessProfile.gstin,
        legal_name: businessProfile.name,
        period: period,
        b2b: b2b,
        b2cl: b2cl,
        b2cs: Array.from(b2csMap.values()),
        hsn: Array.from(hsnMap.values()),
        doc_issue: {
            invoices: {
                from: invoices.length > 0 ? invoices[invoices.length - 1].invoice_number : '',
                to: invoices.length > 0 ? invoices[0].invoice_number : '',
                total: invoices.length,
                cancelled: 0,
            },
        },
    };
}

/**
 * Generate GSTR-3B (Summary Return)
 */
export function generateGSTR3B(
    invoices: Invoice[],
    businessProfile: { gstin: string; name: string },
    periodFrom: Date,
    periodTo: Date
): GSTR3BData {
    let totalTaxableValue = 0;
    let totalIGST = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    invoices.forEach((invoice) => {
        totalTaxableValue += invoice.subtotal;
        totalIGST += invoice.igst_amount;
        totalCGST += invoice.cgst_amount;
        totalSGST += invoice.sgst_amount;
    });

    const period = `${String(periodFrom.getMonth() + 1).padStart(2, '0')}-${periodFrom.getFullYear()}`;

    return {
        gstin: businessProfile.gstin,
        legal_name: businessProfile.name,
        period: period,
        outward_supplies: {
            taxable_value: parseFloat(totalTaxableValue.toFixed(2)),
            igst: parseFloat(totalIGST.toFixed(2)),
            cgst: parseFloat(totalCGST.toFixed(2)),
            sgst: parseFloat(totalSGST.toFixed(2)),
            cess: 0,
        },
        total_tax_liability: {
            igst: parseFloat(totalIGST.toFixed(2)),
            cgst: parseFloat(totalCGST.toFixed(2)),
            sgst: parseFloat(totalSGST.toFixed(2)),
            cess: 0,
        },
    };
}

/**
 * Generate GSTR-4 (For Composition Dealers)
 */
export function generateGSTR4(
    invoices: Invoice[],
    businessProfile: { gstin: string; name: string },
    periodFrom: Date,
    periodTo: Date
): GSTR4Data {
    let totalTurnover = 0;
    let totalTaxPaid = 0;
    let intraStateSupplies = 0;
    let interStateSupplies = 0;

    invoices.forEach((invoice) => {
        totalTurnover += invoice.total_amount;
        totalTaxPaid += invoice.cgst_amount + invoice.sgst_amount + invoice.igst_amount;

        const customerGSTIN = invoice.customer?.gstin;
        const isInterStateTxn = customerGSTIN ? isInterState(businessProfile.gstin, customerGSTIN) : false;

        if (isInterStateTxn) {
            interStateSupplies += invoice.total_amount;
        } else {
            intraStateSupplies += invoice.total_amount;
        }
    });

    const period = `Q${Math.ceil((periodFrom.getMonth() + 1) / 3)}-${periodFrom.getFullYear()}`;

    return {
        gstin: businessProfile.gstin,
        legal_name: businessProfile.name,
        period: period,
        total_turnover: parseFloat(totalTurnover.toFixed(2)),
        total_tax_paid: parseFloat(totalTaxPaid.toFixed(2)),
        supplies_made: {
            intra_state: parseFloat(intraStateSupplies.toFixed(2)),
            inter_state: parseFloat(interStateSupplies.toFixed(2)),
        },
    };
}
