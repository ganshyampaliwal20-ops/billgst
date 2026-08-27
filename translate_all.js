import fs from 'fs';
import translate from 'translate-google';

// First, read the translations file. We have to parse it safely.
// Since it's ES module, we'll strip 'export const ' to evaluate it.
const rawContent = fs.readFileSync('./lib/translations.js', 'utf8');

const execString = rawContent.replace(/export const /g, 'global.');
eval(execString);

const langs = global.languages;
let trans = global.translations;

const baseLang = 'en';
const baseObj = trans[baseLang];

// Ensure all languages exist in trans
langs.forEach(l => {
    if (!trans[l.code]) trans[l.code] = {};
});

// The new keys that we added to en/hi in the UI refactoring
const newKeys = {
    // Invoices Page
    thisMonth: "This month",
    collected: "Collected",
    followUp: "Follow up",
    partial: "Partial",
    invoicesPendingJustUpdated: "invoices pending · Just updated",
    collectionRate: "Collection Rate",
    avgInvoice: "Avg Invoice",
    searchCustomerInvoice: "Search customer or invoice...",
    newest: "Newest",
    highAmount: "High Amount",
    lowAmount: "Low Amount",
    nameAZ: "Name A-Z",
    partialTab: "Partial",
    loadMoreOldInvoices: "Load More Old Invoices",
    
    // Reports Page
    periodThisMonth: "This Month",
    periodLastMonth: "Last Month",
    periodThisQuarter: "This Quarter",
    periodThisYear: "This Year",
    periodCustomRange: "Custom Range",
    tallyXml: "Tally XML",
    excel: "Excel",
    periodChanged: "Period Changed",
    advisory: "ADVISORY",
    hsnComplianceHint: "Ensure HSN codes for GST compliance",
    maximizeItc: "Maximize ITC",
    itcMaximizeToast: "Claim ITC efficiently",
    totalRevenue: "Total Revenue",
    netProfit: "Net Profit",
    totalInvoices: "Total Invoices",
    avgOrderValue: "Avg Order Value",
    paymentPending: "Payment Pending",
    activeCustomers: "Active Customers",
    totalSales: "Total Sales",
    itemsSold: "Items Sold",
    revenueTrend: "Revenue Trend",
    weeklyBreakdown: "Weekly breakdown",
    revenue: "Revenue",
    reports: "Reports",
    businessOverview: "Business Overview",
    
    // Expenses Page
    toastAutoHeal: "Account balances have been automatically repaired!",
    namaste: "Hello",
    paymentPendingMsg: "Your payment is pending, please clear your account.",
    statementReadyMsg: "Your Account Statement is ready.",
    totalAmount: "Total Amount",
    status: "Status",
    advanceJamaHai: "You have Advance Balance",
    outstanding: "To Pay (Outstanding)",
    statementLinkMsg: "Click the link to view full statement & download PDF:",
    thankYou: "Thank you",
    addPhoneFirst: "Please add customer's mobile number first.",
    generatingLink: "Generating Link...",
    openingWhatsApp: "Opening WhatsApp...",
    errorGeneratingLink: "Error in generating link!",
    noCustomerSelected: "No customer selected!",
    sendingReminders: "Sending",
    reminders: "reminders",
    remindersQueued: "Reminders Queued!",
    addPhoneWhatsApp: "Add mobile number first to share on WhatsApp.",
    error: "Error",
    openingStatement: "Opening Statement...",
    errorOpeningStatement: "Error opening statement",
    generatingPDF: "Generating PDF...",
    pdfReady: "PDF ready!",
    pdfError: "PDF Error",
    invoicePdf: "Invoice PDF",
    paidInFull: "Paid in full",
    baakiHai: "Due",
    quotation: "Quotation",
    cashSale: "Cash Sale",
    createdOn: "created on",
    shareInvoice: "Share invoice",
    pdfViewDownload: "PDF (View/Download)",
    duplicateInvoice: "Duplicate Invoice",
    deleteInvoice: "Delete Invoice",
    recordPayment: "Record Payment",
    amountReceivedPlaceholder: "Amount Received (₹)",
    balanceDue: "Balance Due",
    close: "Close",
    pdfViewDownloadSubtitle: "Do you want to view or download?",
    viewPdf: "View PDF",
    footerTagline: "Invoice, accounts, GST — everything in one place",
    viewPdfSubtitle: "Open and view directly in browser",
    downloadPdf: "Download PDF",
    downloadPdfSubtitle: "Save PDF to your phone",
    billScanned: "Bill scanned successfully!",
    errorScanningBill: "Failed to extract details from bill",
    errorParsingBill: "Error parsing bill details",
    errorReadingFile: "Error reading file",
    photoLoading: "Loading photo...",
    photoAdded: "Photo added!",
    photoError: "Photo size too big or an error occurred!",
    photoReadError: "Error reading photo!",
    photoSelectError: "Error selecting photo",
    paymentAccepted: "Payment accepted and added!",
    confirmReject: "Are you sure you want to reject this payment?",
    paymentRejected: "Payment rejected!",
    confirmDelete: "Are you sure you want to delete?",
    entryDeleted: "Entry deleted!",
    enterAmount: "Please enter amount!",
    receivedText: "Received",
    givenText: "Given",
    limitAlert: "ALERT",
    limitExceeded: "credit limit exceeded!",
    newBalance: "New Balance",
    willBecome: "will become",
    saveAnyway: "Do you still want to save this entry?",
    entryUpdated: "Entry updated!",
    entrySaved: "Entry saved!",
    hisaabUpdate: "Account Update",
    accountUpdatedMsg: "Your account has been updated with",
    added: "added",
    advanceJama: "(Advance)",
    dueBaki: "(Due)",
    autoWhatsAppSent: "Automatic WhatsApp message sent!",
    contactImported: "Contact imported successfully!",
    invalidPhoneFormat: "Imported contact has invalid phone number format.",
    noPhoneNumber: "No phone number found for this contact.",
    pluginNotLoaded: "Native plugin not loaded.",
    noValidPhoneFound: "Contact selected, but no valid phone number found.",
    pickerFailed: "Web contact picker failed or cancelled.",
    notSupported: "Auto-contact is not supported in your browser.",
    nameRequired: "Name is required!",
    custUpdated: "Customer updated!",
    custAdded: "Customer added!",
    confirmDeleteCust: "Are you sure you want to delete? Their complete record will be deleted forever.",
    deleted: "deleted!",
    excelGenerating: "Generating Excel...",
    excelDownloaded: "Excel Downloaded/Shared!",
    profilePhotoUpdated: "Profile photo updated!",
    photoProcessError: "Error processing photo",
    expenses: "EXPENSES",
    totalToReceive: "Total To Receive",
    totalToPay: "Total To Pay",
    net: "Net",
    toReceive: "To Receive",
    toPay: "To Pay",
    pendingPayments: "Pending Payments",
    daysOld: "days old",
    remind: "Remind",
    searchCustomer: "Search customer...",
    loadingData: "Loading data...",
    noCustomerFound: "No customer found",
    changeSearch: "Change your search",
    entryText: "entry",
    advanceToPay: "Advance (To Pay)",
    dueToReceive: "Due (To Receive)",
    sendReminders: "Send Reminders",
    editCust: "Edit Customer",
    deleteCust: "Delete Customer",
    totalBalanceDue: "Total Balance Due",
    advanceYouWillPay: "Advance (You will pay)",
    dueYouWillGet: "Due (You will get)",
    totalGiven: "Total Given",
    totalReceived: "Total Received",
    statement: "Statement",
    whatsapp: "WhatsApp",
    call: "Call",
    isCurrentlyPending: "is currently pending.",
    lastPaymentWasOn: "Last payment was on",
    onDateText: "."
};

// Merge newKeys into en
for (const [k, v] of Object.entries(newKeys)) {
    trans.en[k] = v;
}

// Function to chunk array for translation
function chunkArray(arr, size) {
    const res = [];
    for(let i=0; i<arr.length; i+=size) res.push(arr.slice(i, i+size));
    return res;
}

async function translateAll() {
    let baseKeys = Object.keys(trans.en);

    for (let lang of langs) {
        if (lang.code === 'en') continue;

        let missingKeys = baseKeys.filter(k => !trans[lang.code][k]);
        if (missingKeys.length === 0) continue;

        console.log(`Translating ${missingKeys.length} keys for ${lang.name} (${lang.code})...`);
        
        // Translate in chunks of 50 to avoid API limits/errors
        const chunks = chunkArray(missingKeys, 50);
        for (let chunk of chunks) {
            try {
                let textsToTranslate = chunk.map(k => trans.en[k]);
                
                let res = await translate(textsToTranslate, {from: 'en', to: lang.code});
                // translate-google returns an array if input is array
                if (!Array.isArray(res)) res = [res];
                
                chunk.forEach((k, i) => {
                    trans[lang.code][k] = res[i];
                });
                
                console.log(`   - Translated chunk for ${lang.code}`);
                // wait 1 sec to avoid rate limit
                await new Promise(r => setTimeout(r, 1000));
            } catch (err) {
                console.error(`Error translating chunk for ${lang.code}:`, err);
            }
        }
    }

    // Write back to translations.js
    const outString = `export const languages = ${JSON.stringify(langs, null, 4)};\n\nexport const translations = ${JSON.stringify(trans, null, 4)};\nexport const getTranslations = (code) => { return translations[code] || translations.en; };\n`;
    fs.writeFileSync('./lib/translations.js', outString, 'utf8');
    console.log("Translations successfully updated!");
}

translateAll();
