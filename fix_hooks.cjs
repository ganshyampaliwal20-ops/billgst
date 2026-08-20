const fs = require('fs');
let content = fs.readFileSync('app/dashboard/invoices/page.tsx', 'utf8');

const brokenHook = `    // Hardware back button modal close
    useEffect(() => {
        const handlePopState = () => {
            if (selectedInvoice) {
                setSelectedInvoice(null);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [selectedInvoice]);

    // Push hash to history when opening
    useEffect(() => {
        if (selectedInvoice) {
            window.history.pushState({ modal: 'invoice' }, '', window.location.pathname + '#invoice');
        } else {
            // cleanup hash if closed without back button
            if (window.location.hash === '#invoice') {
                window.history.back();
            }
        }
    }, [selectedInvoice]);`;

// 1. Remove the broken hook
content = content.replace(brokenHook, '');

// 2. Inject it before if (!isClient)
const correctTarget = "if (!isClient) return <div";
const targetIndex = content.indexOf(correctTarget);

if (targetIndex !== -1 && !content.includes("window.addEventListener('popstate', handlePopState)")) {
    content = content.substring(0, targetIndex) + brokenHook + '\n\n    ' + content.substring(targetIndex);
}

fs.writeFileSync('app/dashboard/invoices/page.tsx', content);
console.log('Fixed hooks successfully!');
