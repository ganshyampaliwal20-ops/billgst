const fs = require('fs');
let lines = fs.readFileSync('app/dashboard/invoices/page.tsx', 'utf8').split('\n');

const start = 1050; // Index for line 1051
const end = 1157;   // Index for line 1158

const replacement = `            {selectedInvoice && (
                <InvoiceActionModal
                    invoice={selectedInvoice}
                    onClose={() => { window.history.back(); }}
                    onWhatsApp={(e) => handleWhatsApp(selectedInvoice, e)}
                    onPdf={() => handleViewPdf(selectedInvoice)}
                    onEway={() => handleDownloadEwayJSON(selectedInvoice)}
                    onDelete={() => handleDelete(selectedInvoice)}
                    paymentAmount={paymentAmount}
                    setPaymentAmount={setPaymentAmount}
                    onRecordPayment={handleRecordPayment}
                    isSubmittingPayment={isSubmittingPayment}
                />
            )}`;

lines.splice(start, end - start + 1, replacement);
fs.writeFileSync('app/dashboard/invoices/page.tsx', lines.join('\n'));
