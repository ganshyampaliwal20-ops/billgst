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
            addInvoice: (invoice) => set({ invoices: [invoice, ...get().invoices] }),
            deleteInvoice: (id) => set({ invoices: get().invoices.filter(inv => inv.id !== id) }),
            updateInvoice: (id, updatedInv) => set({
                invoices: get().invoices.map(inv => inv.id === id ? { ...inv, ...updatedInv } : inv)
            }),

            // Customers
            customers: [],
            addCustomer: (customer) => set({ customers: [customer, ...get().customers] }),
            updateCustomer: (id, data) => set({
                customers: get().customers.map(c => c.id === id ? { ...c, ...data } : c)
            }),

            // Products
            products: [],
            addProduct: (product) => set({ products: [product, ...get().products] }),
            updateProduct: (id, data) => set({
                products: get().products.map(p => p.id === id ? { ...p, ...data } : p)
            }),

            // Settings
            settings: {
                currency: 'INR',
                language: 'en',
                darkMode: false,
                nonGstMode: false, // New: Support for non-GST businesses
            },
            updateSettings: (settings) => set({ settings: { ...get().settings, ...settings } }),

            // Analytics Helpers
            getAnalytics: (period = 'monthly') => {
                const { invoices, products } = get();
                const now = new Date();
                let filteredInvoices = invoices;

                // Filter by period
                if (period === 'daily') {
                    filteredInvoices = invoices.filter(inv => new Date(inv.invoice_date).toDateString() === now.toDateString());
                } else if (period === 'weekly') {
                    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    filteredInvoices = invoices.filter(inv => new Date(inv.invoice_date) >= lastWeek);
                } else if (period === 'monthly') {
                    filteredInvoices = invoices.filter(inv =>
                        new Date(inv.invoice_date).getMonth() === now.getMonth() &&
                        new Date(inv.invoice_date).getFullYear() === now.getFullYear()
                    );
                } else if (period === 'yearly') {
                    filteredInvoices = invoices.filter(inv => new Date(inv.invoice_date).getFullYear() === now.getFullYear());
                }

                // Calculate Totals
                const totalSales = filteredInvoices.reduce((acc, inv) => acc + (inv.total_amount || 0), 0);

                // Calculate Profit (Sales - Cost)
                // Assuming invoice items have product_id, we look up cost price. 
                // If not available, we assume 20% margin for demo purposes if cost not set.
                let totalCost = 0;
                filteredInvoices.forEach(inv => {
                    inv.items.forEach(item => {
                        const product = products.find(p => p.id === item.product_id);
                        const costPrice = product?.purchase_price || (item.unit_price * 0.8); // Fallback to 80% of selling price
                        totalCost += costPrice * item.quantity;
                    });
                });

                const totalProfit = totalSales - totalCost;

                return { totalSales, totalProfit, invoiceCount: filteredInvoices.length };
            },

            getTopProducts: () => {
                const { invoices } = get();
                const productSales = {};

                invoices.forEach(inv => {
                    inv.items.forEach(item => {
                        if (!productSales[item.product_name]) {
                            productSales[item.product_name] = { name: item.product_name, sales: 0, quantity: 0 };
                        }
                        productSales[item.product_name].sales += item.total_amount;
                        productSales[item.product_name].quantity += item.quantity;
                    });
                });

                return Object.values(productSales).sort((a, b) => b.sales - a.sales).slice(0, 5);
            }
        }),
        {
            name: 'billgst-storage', // unique name
            storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : undefined), // use localStorage safely
        }
    )
);
