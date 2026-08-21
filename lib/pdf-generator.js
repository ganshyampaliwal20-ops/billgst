export const preloadPDFGenerator = () => {
    import('./pdf-generator.core.js').catch(() => {});
};

export const drawFreeBranding = async (...args) => {
    const mod = await import('./pdf-generator.core.js');
    return mod.drawFreeBranding(...args);
};

export const generateInvoicePDF = async (...args) => {
    const mod = await import('./pdf-generator.core.js');
    return mod.generateInvoicePDF(...args);
};

export const generateQuotationPDF = async (...args) => {
    const mod = await import('./pdf-generator.core.js');
    return mod.generateQuotationPDF(...args);
};

export const generateHisaabPDF = async (...args) => {
    const mod = await import('./pdf-generator.core.js');
    return mod.generateHisaabPDF(...args);
};

export const generateCatalogPDF = async (...args) => {
    const mod = await import('./pdf-generator.core.js');
    return mod.generateCatalogPDF(...args);
};
