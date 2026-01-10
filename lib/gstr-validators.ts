/**
 * GST Return Validators
 * Validation utilities for GST returns data
 */

/**
 * Validate GSTIN format
 * Format: 2 digits (state code) + 10 alphanumeric (PAN) + 1 letter (entity) + 1 letter (default Z) + 1 alphanumeric (checksum)
 */
export function validateGSTIN(gstin: string): boolean {
    if (!gstin) return false;

    // Remove spaces and convert to uppercase
    const cleanGstin = gstin.replace(/\s/g, '').toUpperCase();

    // GSTIN should be 15 characters
    if (cleanGstin.length !== 15) return false;

    // Pattern: 2 digits + 10 alphanumeric + 1 letter + 1 letter (usually Z) + 1 alphanumeric
    const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/;

    return gstinPattern.test(cleanGstin);
}

/**
 * Validate HSN/SAC code format
 * HSN: 4, 6, or 8 digits
 * SAC: 6 digits
 */
export function validateHSN(hsn: string, isSAC: boolean = false): boolean {
    if (!hsn) return true; // HSN is optional in some cases

    const cleanHsn = hsn.replace(/\s/g, '');

    if (isSAC) {
        // SAC should be 6 digits
        return /^[0-9]{6}$/.test(cleanHsn);
    } else {
        // HSN should be 4, 6, or 8 digits
        return /^[0-9]{4}$|^[0-9]{6}$|^[0-9]{8}$/.test(cleanHsn);
    }
}

/**
 * Validate date range for GST returns
 */
export function validateDateRange(fromDate: Date, toDate: Date): {
    valid: boolean;
    error?: string;
} {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (isNaN(from.getTime())) {
        return { valid: false, error: 'Invalid from date' };
    }

    if (isNaN(to.getTime())) {
        return { valid: false, error: 'Invalid to date' };
    }

    if (from > to) {
        return { valid: false, error: 'From date cannot be after to date' };
    }

    // Check if date range is too large (more than 1 year)
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) {
        return { valid: false, error: 'Date range cannot exceed 1 year' };
    }

    return { valid: true };
}

/**
 * Validate GST rate
 */
export function validateGSTRate(rate: number): boolean {
    const validRates = [0, 0.25, 3, 5, 12, 18, 28];
    return validRates.includes(rate);
}

/**
 * Extract state code from GSTIN
 */
export function getStateCodeFromGSTIN(gstin: string): string | null {
    if (!validateGSTIN(gstin)) return null;
    return gstin.substring(0, 2);
}

/**
 * Check if transaction is inter-state based on GSTINs
 */
export function isInterState(sellerGSTIN: string, buyerGSTIN: string | null): boolean {
    if (!buyerGSTIN) return false; // B2C transactions

    const sellerState = getStateCodeFromGSTIN(sellerGSTIN);
    const buyerState = getStateCodeFromGSTIN(buyerGSTIN);

    if (!sellerState || !buyerState) return false;

    return sellerState !== buyerState;
}

/**
 * Validate invoice amount
 */
export function validateAmount(amount: number): boolean {
    return !isNaN(amount) && amount >= 0 && isFinite(amount);
}

/**
 * Format GSTIN for display (with spaces)
 */
export function formatGSTIN(gstin: string): string {
    if (!gstin) return '';
    const clean = gstin.replace(/\s/g, '').toUpperCase();
    if (clean.length !== 15) return gstin;

    // Format: 2-10-1-1-1
    return `${clean.substring(0, 2)} ${clean.substring(2, 12)} ${clean.substring(12, 13)} ${clean.substring(13, 14)} ${clean.substring(14, 15)}`;
}

/**
 * Determine filing frequency based on turnover
 * This is a simplified version - actual rules may vary
 */
export function getFilingFrequency(annualTurnover: number): 'MONTHLY' | 'QUARTERLY' {
    // Businesses with turnover > 5 crore: Monthly
    // Businesses with turnover <= 5 crore: Quarterly (QRMP scheme)
    return annualTurnover > 50000000 ? 'MONTHLY' : 'QUARTERLY';
}
