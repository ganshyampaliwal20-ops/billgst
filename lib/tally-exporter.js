
/**
 * Tally XML Generator
 * Generates Tally-compatible XML for Sales Vouchers
 */
export function generateTallyXML(invoices, businessName) {
    let xml = `<?xml version="1.0"?>
<ENVELOPE>
    <HEADER>
        <TALLYREQUEST>Import Data</TALLYREQUEST>
    </HEADER>
    <BODY>
        <IMPORTDATA>
            <REQUESTDESC>
                <REPORTNAME>Vouchers</REPORTNAME>
            </REQUESTDESC>
            <REQUESTDATA>
`;

    invoices.forEach(inv => {
        const date = new Date(inv.invoice_date).toISOString().split('T')[0].replace(/-/g, '');
        const amount = Number(inv.total_amount).toFixed(2);

        xml += `
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                    <VOUCHER REMOTEID="${inv.id}" VCHTYPE="Sales" ACTION="Create" OBJVIEW="AccountingVoucherView">
                        <DATE>${date}</DATE>
                        <VOUCHERNUMBER>${inv.invoice_number}</VOUCHERNUMBER>
                        <PARTYLEDGERNAME>${inv.customer?.name || 'Cash'}</PARTYLEDGERNAME>
                        <PERSISTEDVIEW>AccountingVoucherView</PERSISTEDVIEW>
                        <ALLLEDGERENTRIES.LIST>
                            <LEDGERNAME>${inv.customer?.name || 'Cash'}</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>YES</ISDEEMEDPOSITIVE>
                            <AMOUNT>-${amount}</AMOUNT>
                        </ALLLEDGERENTRIES.LIST>
                        <ALLLEDGERENTRIES.LIST>
                            <LEDGERNAME>Sales Account</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>NO</ISDEEMEDPOSITIVE>
                            <AMOUNT>${amount}</AMOUNT>
                        </ALLLEDGERENTRIES.LIST>
                    </VOUCHER>
                </TALLYMESSAGE>`;
    });

    xml += `
            </REQUESTDATA>
        </IMPORTDATA>
    </BODY>
</ENVELOPE>`;

    return xml;
}

export function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
