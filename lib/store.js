import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create(
    persist(
        (set, get) => ({
            // Business Profile
            businessProfile: {
                name: 'My Business',
                gstin: '',
                address: '',
                phone: '',
                email: '',
                logo: null
            },
            updateProfile: (profile) => set({ businessProfile: { ...get().businessProfile, ...profile } }),

            // Invoices
            invoices: [],
            fetchInvoices: async () => {
                try {
                    const res = await fetch('/api/invoices');
                    const data = await res.json();
                    if (Array.isArray(data)) set({ invoices: data });
                } catch (error) {
                    console.error('Failed to fetch invoices:', error);
                }
            },
            addInvoice: async (invoice) => {
                try {
                    // Optimistic Update (Temporary) or Wait for DB?
                    // Safe approach: Call API -> Get ID -> Update Store
                    const res = await fetch('/api/invoices', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(invoice)
                    });
                    const result = await res.json();
                    if (result.success) {
                        // Refresh list to get accurate data/IDs
                        get().fetchInvoices();
                    }
                } catch (error) {
                    console.error('Failed to save invoice:', error);
                }
            },
            deleteInvoice: (id) => set({ invoices: get().invoices.filter(inv => inv.id !== id) }), // TODO: Add API call
            updateInvoice: (id, updatedInv) => set({
                invoices: get().invoices.map(inv => inv.id === id ? { ...inv, ...updatedInv } : inv)
            }),

            // Customers
            customers: [],
            fetchCustomers: async () => {
                try {
                    const res = await fetch('/api/customers');
                    const data = await res.json();
                    if (Array.isArray(data)) set({ customers: data });
                } catch (error) {
                    console.error('Failed to fetch customers:', error);
                }
            },
            addCustomer: async (customer) => {
                try {
                    const res = await fetch('/api/customers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(customer)
                    });
                    const savedCustomer = await res.json();
                    if (savedCustomer.id) {
                        set({ customers: [savedCustomer, ...get().customers] });
                        return savedCustomer; // Return for immediate use
                    }
                } catch (error) {
                    console.error('Failed to add customer:', error);
                }
            },
            updateCustomer: (id, data) => set({
                customers: get().customers.map(c => c.id === id ? { ...c, ...data } : c)
            }),

            // Products
            products: [],
            fetchProducts: async () => {
                try {
                    const res = await fetch('/api/products');
                    const data = await res.json();
                    if (Array.isArray(data)) set({ products: data });
                } catch (error) {
                    console.error('Failed to fetch products:', error);
                }
            },
            addProduct: async (product) => {
                try {
                    const res = await fetch('/api/products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(product)
                    });
                    const savedProduct = await res.json();
                    if (savedProduct.id) {
                        set({ products: [savedProduct, ...get().products] });
                    }
                } catch (error) {
                    console.error('Failed to add product:', error);
                }
            },
            updateProduct: (id, data) => set({
                products: get().products.map(p => p.id === id ? { ...p, ...data } : p)
            }),

            // Settings
            settings: {
                currency: 'INR',
                language: 'en',
                darkMode: false,
                nonGstMode: false,
            },
            updateSettings: (settings) => set({ settings: { ...get().settings, ...settings } }),

            // Analytics Helpers
            getAnalytics: (period = 'monthly') => {
                const { invoices, products } = get();
                const now = new Date();
                let filteredInvoices = invoices;

                // Simple filter logic for analytics
                // Note: DB returns date strings, need parsing
                if (period === 'daily') {
                    filteredInvoices = invoices.filter(inv => new Date(inv.invoice_date).toDateString() === now.toDateString());
                } else if (period === 'monthly') {
                    filteredInvoices = invoices.filter(inv =>
                        new Date(inv.invoice_date).getMonth() === now.getMonth() &&
                        new Date(inv.invoice_date).getFullYear() === now.getFullYear()
                    );
                }

                const totalSales = filteredInvoices.reduce((acc, inv) => acc + (parseFloat(inv.total_amount) || 0), 0);

                // Profit Calculation (Simplified)
                let totalCost = 0;
                filteredInvoices.forEach(inv => {
                    // If items are populated (from DB join)
                    if (inv.items && Array.isArray(inv.items)) {
                        inv.items.forEach(item => {
                            // Find product cost if available or use estimate
                            // Note: We don't have cost price in `products` table in current schema yet (purchase_price missing in create table script?)
                            // Checking db.js... products has `price` (selling). No cost.
                            // Fallback to 80% logic
                            totalCost += (item.unit_price * 0.8) * item.quantity;
                        });
                    }
                });

                const totalProfit = totalSales - totalCost;
                return { totalSales, totalProfit, invoiceCount: filteredInvoices.length };
            },

            getTopProducts: () => {
                const { invoices } = get();
                const productSales = {};

                invoices.forEach(inv => {
                    if (inv.items && Array.isArray(inv.items)) {
                        inv.items.forEach(item => {
                            const name = item.product_name || 'Unknown';
                            if (!productSales[name]) {
                                productSales[name] = { name, sales: 0, quantity: 0 };
                            }
                            productSales[name].sales += parseFloat(item.total_amount || 0);
                            productSales[name].quantity += parseFloat(item.quantity || 0);
                        });
                    }
                });

                return Object.values(productSales).sort((a, b) => b.sales - a.sales).slice(0, 5);
            }
        }),
        {
            name: 'billgst-storage',
            storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : undefined),
            // We still keep persist to allow offline viewing of *last fetched* data,
            // but we must be careful about syncing.
            // Ideally, we fetch fresh on mount.
        }
    )
);
