export const DOC_TYPES = {
    // Sales Documents
    TAX_INVOICE: 'TAX_INVOICE',
    BILL_OF_SUPPLY: 'BILL_OF_SUPPLY',
    DELIVERY_CHALLAN: 'DELIVERY_CHALLAN',
    E_WAY_BILL: 'E_WAY_BILL',

    // Quotations & Estimates
    QUOTATION: 'QUOTATION',
    ESTIMATE: 'ESTIMATE',

    // Purchase Documents
    PURCHASE_ORDER: 'PURCHASE_ORDER',
    PURCHASE: 'PURCHASE',

    // Adjustments
    CREDIT_NOTE: 'CREDIT_NOTE',
    DEBIT_NOTE: 'DEBIT_NOTE',

    // Other
    PRO_FORMA_INVOICE: 'PRO_FORMA_INVOICE',
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
    [DOC_TYPES.PRO_FORMA_INVOICE]: 'Pro Forma Invoice',
    [DOC_TYPES.PURCHASE]: 'Purchase',
    [DOC_TYPES.EXPENSE]: 'Expense'
};

// Document Categories for UI
export const DOC_CATEGORIES = {
    SALES: 'sales',
    PURCHASE: 'purchase',
    COMPLIANCE: 'compliance',
    OTHER: 'other'
};

// Expense Categories
export const EXPENSE_CATEGORIES = [
    'Rent',
    'Salary',
    'Purchase',
    'Utilities',
    'Transportation',
    'Marketing',
    'Office Supplies',
    'Professional Fees',
    'Maintenance',
    'Other'
];

// Payment Methods
export const PAYMENT_METHODS = [
    'Cash',
    'Bank Transfer',
    'UPI',
    'Credit Card',
    'Debit Card',
    'Cheque',
    'Other'
];
