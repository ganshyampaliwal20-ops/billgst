export const DOC_TYPES = {
    TAX_INVOICE: 'TAX_INVOICE',
    BILL_OF_SUPPLY: 'BILL_OF_SUPPLY',
    DELIVERY_CHALLAN: 'DELIVERY_CHALLAN',
    E_WAY_BILL: 'E_WAY_BILL',
    QUOTATION: 'QUOTATION',
    ESTIMATE: 'ESTIMATE',
    PURCHASE_ORDER: 'PURCHASE_ORDER',
    CREDIT_NOTE: 'CREDIT_NOTE',
    DEBIT_NOTE: 'DEBIT_NOTE',
    PRO_FORMA_INVOICE: 'PRO_FORMA_INVOICE',
    PURCHASE: 'PURCHASE',
    EXPENSE: 'EXPENSE'
};

export const DOC_LABELS = {
    [DOC_TYPES.TAX_INVOICE]: 'Tax Invoice',
    [DOC_TYPES.BILL_OF_SUPPLY]: 'Bill of Supply',
    [DOC_TYPES.DELIVERY_CHALLAN]: 'Delivery Challan',
    [DOC_TYPES.E_WAY_BILL]: 'E-Way Bill',
    [DOC_TYPES.QUOTATION]: 'Quotation',
    [DOC_TYPES.ESTIMATE]: 'Estimate',
    [DOC_TYPES.PURCHASE_ORDER]: 'Purchase Order',
    [DOC_TYPES.CREDIT_NOTE]: 'Credit Note',
    [DOC_TYPES.DEBIT_NOTE]: 'Debit Note',
    [DOC_TYPES.PRO_FORMA_INVOICE]: 'Pro-Forma Invoice',
    [DOC_TYPES.PURCHASE]: 'Purchase',
    [DOC_TYPES.EXPENSE]: 'Expense'
};

export const DOC_CATEGORIES = {
    SALES: [DOC_TYPES.TAX_INVOICE, DOC_TYPES.BILL_OF_SUPPLY, DOC_TYPES.PRO_FORMA_INVOICE],
    RETURNS: [DOC_TYPES.CREDIT_NOTE, DOC_TYPES.DEBIT_NOTE],
    PURCHASES: [DOC_TYPES.PURCHASE, DOC_TYPES.PURCHASE_ORDER],
    OTHER: [DOC_TYPES.QUOTATION, DOC_TYPES.ESTIMATE, DOC_TYPES.DELIVERY_CHALLAN],
    OUTGOING: [DOC_TYPES.EXPENSE]
};

export const EXPENSE_CATEGORIES = [
    'Office Supplies',
    'Rent',
    'Utilities',
    'Travel',
    'Marketing',
    'Salaries',
    'Hardware',
    'Software',
    'Shipping',
    'Taxes',
    'Other'
];

export const PAYMENT_METHODS = [
    'Cash',
    'Bank Transfer',
    'Cheque',
    'UPI',
    'Credit Card',
    'Other'
];
