
async function testInvoiceFlow() {
    const baseUrl = 'http://localhost:3000';
    try {
        // 1. Get Customer
        console.log('Fetching customers...');
        const custRes = await fetch(`${baseUrl}/api/customers`);
        const customers = await custRes.json();

        if (!customers || customers.length === 0) {
            console.error('No customers found. Cannot test invoice creation.');
            return;
        }
        const customer = customers[0];
        console.log('Using customer:', customer.name, customer.id);

        // 2. Get Product
        console.log('Fetching products...');
        const prodRes = await fetch(`${baseUrl}/api/products`);
        const products = await prodRes.json();

        if (!products || products.length === 0) {
            console.error('No products found. Cannot test invoice creation.');
            return;
        }
        const product = products[0];
        console.log('Using product:', product.name, product.id, 'Stock:', product.stock);

        // 3. Create Invoice
        const invoiceData = {
            invoice_number: `TEST-${Date.now()}`,
            customer: customer, // Passing full object as store.js does? Or just ID? Store.js sends full object usually.
            invoice_date: new Date().toISOString(),
            due_date: new Date().toISOString(),
            items: [
                {
                    product_id: product.id,
                    product_name: product.name,
                    quantity: 1,
                    unit_price: 100,
                    gst_rate: 18
                }
            ],
            subtotal: 100,
            total_amount: 118,
            status: 'PENDING'
        };

        console.log('Sending invoice data...');
        const invRes = await fetch(`${baseUrl}/api/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData)
        });

        const text = await invRes.text();
        console.log('Invoice API Response Status:', invRes.status);
        console.log('Invoice API Response Body:', text);

    } catch (e) {
        console.error('Test Failed:', e);
    }
}

testInvoiceFlow();
