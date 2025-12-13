import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

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
                    const res = await fetch('/api/invoices', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(invoice)
                    });
                    const result = await res.json();

                    if (!res.ok) throw new Error(result.error || 'Failed to save invoice');

                    if (result.success || result.id) {
                        get().fetchInvoices();
                        toast.success('Invoice saved successfully');
                        return result;
                    }
                } catch (error) {
                    console.error('Failed to save invoice:', error);
                    // Return error so component can show details
                    return { success: false, error: error.message };
                }
            },
            deleteInvoice: (id) => set({ invoices: get().invoices.filter(inv => inv.id !== id) }),
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

                    if (!res.ok) throw new Error(savedCustomer.error || 'Failed to add customer');

                    if (savedCustomer.id) {
                        set({ customers: [savedCustomer, ...get().customers] });
                        toast.success('Customer added successfully');
                        return savedCustomer;
                    }
                } catch (error) {
                    console.error('Failed to add customer:', error);
                    toast.error('Failed to save customer. Please try again.');
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

                    if (!res.ok) throw new Error(savedProduct.error || 'Failed to add product');

                    if (savedProduct.id) {
                        set({ products: [savedProduct, ...get().products] });
                        toast.success('Product added successfully');
                        return savedProduct;
                    }
                } catch (error) {
                    console.error('Failed to add product:', error);
                    toast.error('Failed to save product. Please try again.');
                }
            },
            updateProduct: (id, data) => set({
                products: get().products.map(p => p.id === id ? { ...p, ...data } : p)
            }),
            deleteProduct: async (id) => {
                try {
                    const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
                    const result = await res.json();

                    if (!res.ok) throw new Error(result.error || 'Failed to delete product');

                    set({ products: get().products.filter(p => p.id !== id) });
                    toast.success('Product deleted successfully');
                    return { success: true };
                } catch (error) {
                    console.error('Failed to delete product:', error);
                    toast.error(error.message);
                    return { success: false, error: error.message };
                }
            },

            // Settings
            settings: {
                currency: 'INR',
                language: 'en',
                darkMode: false,
                nonGstMode: false,
            },
            updateSettings: (settings) => set({ settings: { ...get().settings, ...settings } }),

            // Analytics Helpers
            getAnalytics: (period = 'monthly', customRange = null) => {
                const { invoices } = get();
                const now = new Date();
                let filteredInvoices = invoices;

                if (period === 'daily') {
                    filteredInvoices = invoices.filter(inv => new Date(inv.invoice_date).toDateString() === now.toDateString());
                } else if (period === 'monthly') {
                    filteredInvoices = invoices.filter(inv =>
                        new Date(inv.invoice_date).getMonth() === now.getMonth() &&
                        new Date(inv.invoice_date).getFullYear() === now.getFullYear()
                    );
                } else if (period === 'weekly') {
                    // Simplified weekly logic (last 7 days)
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    filteredInvoices = invoices.filter(inv => new Date(inv.invoice_date) >= oneWeekAgo);
                } else if (period === 'yearly') {
                    filteredInvoices = invoices.filter(inv => new Date(inv.invoice_date).getFullYear() === now.getFullYear());
                } else if (period === 'custom' && customRange?.start && customRange?.end) {
                    const start = new Date(customRange.start);
                    const end = new Date(customRange.end);
                    end.setHours(23, 59, 59, 999); // Include full end day
                    filteredInvoices = invoices.filter(inv => {
                        const d = new Date(inv.invoice_date);
                        return d >= start && d <= end;
                    });
                }

                const totalSales = filteredInvoices.reduce((acc, inv) => acc + (parseFloat(inv.total_amount) || 0), 0);

                let totalCost = 0;
                filteredInvoices.forEach(inv => {
                    if (inv.items && Array.isArray(inv.items)) {
                        inv.items.forEach(item => {
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
        }
    )
);
