import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

const initialState = {
    businessProfile: {
        name: 'My Business',
        gstin: '',
        address: '',
        phone: '',
        email: '',
        logo: null,
        upi_id: '',
        owner_name: '',
        bank_name: '',
        account_no: '',
        ifsc_code: '',
        branch_name: '',
        account_holder: '',
        show_bank_details: true,
        plan_type: 'FREE',
        invoice_template: 'TEMPLATE_1',
        logo_position: 'RIGHT',
        signature: null,
        terms_and_conditions: '',
        store_banner: null
    },
    invoices: [],
    customers: [],
    products: [],
    quotations: [],
    expenses: [],
    settings: {
        currency: 'INR',
        language: 'en',
        darkMode: false,
        nonGstMode: false,
        whatsappBotEnabled: false,
        whatsappBotToken: '',
        whatsappSenderNumber: '',
        whatsappApiKey: '',
        whatsappApiUrl: '',
        autoRemindersEnabled: false,
        reminderFrequency: 3, // Default: Every 3 days
        reminderTime: '10:00', // Default: 10:00 AM
        taxType: 'EXCLUSIVE', // 'EXCLUSIVE' or 'INCLUSIVE'
    },
    aiChatOpen: false,
    upgradeModal: { isOpen: false, message: '' },
};

export const useStore = create(
    persist(
        (set, get) => ({
            ...initialState,
            setUpgradeModal: (isOpen, message = '') => set({ upgradeModal: { isOpen, message } }),

            // Action to reset store on Logout
            resetStore: () => {
                set(initialState);
                // Also clear local storage manually to be safe
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('billgst-storage');
                }
            },

            // Business Profile - Fetch from Database
            fetchBusinessProfile: async () => {
                try {
                    const res = await fetch('/api/business-profile');

                    if (res.status === 401) {
                        console.warn('Session check failed - will retry silently');
                        // Don't redirect immediately - might be a temporary glitch
                        return;
                    }

                    if (!res.ok) {
                        console.error('Failed to fetch business profile');
                        return;
                    }

                    const data = await res.json();
                    if (data && typeof data === 'object') {
                        set({ businessProfile: { ...get().businessProfile, ...data } });
                        console.log('Business profile loaded from database');
                    }
                } catch (error) {
                    console.error('Failed to fetch business profile:', error);
                }
            },

            // Business Profile - Save to Database
            saveBusinessProfile: async (profile) => {
                try {
                    const res = await fetch('/api/business-profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(profile)
                    });

                    if (!res.ok) {
                        const error = await res.json();
                        throw new Error(error.error || 'Failed to save business profile');
                    }

                    const result = await res.json();
                    if (result.success && result.data) {
                        set({ businessProfile: { ...get().businessProfile, ...result.data } });
                        toast.success('Business settings saved successfully!');
                        return { success: true };
                    }
                } catch (error) {
                    console.error('Failed to save business profile:', error);
                    toast.error(error.message || 'Failed to save settings');
                    return { success: false, error: error.message };
                }
            },

            updateProfile: (profile) => set({ businessProfile: { ...get().businessProfile, ...profile } }),

            // Invoices
            fetchInvoices: async () => {
                try {
                    const res = await fetch('/api/invoices');

                    // Handle Unauthorized (Session Expired)
                    if (res.status === 401) {
                        console.warn('Session check failed for invoices - silently returning');
                        return;
                    }

                    const data = await res.json();
                    if (Array.isArray(data)) {
                        set({ invoices: data });
                    } else {
                        console.error('Invalid invoices data received:', data);
                        set({ invoices: [] });
                    }
                } catch (error) {
                    console.error('Failed to fetch invoices:', error);
                    set({ invoices: [] });
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

                    if (!res.ok) throw new Error(result.error || result.details || 'Failed to save invoice');

                    if (result.success || result.id) {
                        get().fetchInvoices();
                        toast.success('Invoice saved successfully');
                        return result;
                    }
                    console.error('Invoice Add failed voluntarily:', result);
                    throw new Error(result.error || 'Server returned failure without error message');
                } catch (error) {
                    console.error('Failed to save invoice:', error);
                    if (error.message.toLowerCase().includes('limit') || error.message.toLowerCase().includes('upgrade') || error.message.toLowerCase().includes('premium')) {
                        get().setUpgradeModal(true, error.message);
                    }
                    // Return error so component can show details
                    return { success: false, error: error.message };
                }
            },
            deleteInvoice: async (id) => {
                try {
                    const res = await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Failed to delete invoice');

                    set({ invoices: get().invoices.filter(inv => inv.id !== id) });
                    toast.success('Invoice deleted successfully');
                    return { success: true };
                } catch (error) {
                    console.error('Failed to delete invoice:', error);
                    toast.error(error.message);
                    return { success: false };
                }
            },
            updateInvoice: (id, updatedInv) => set({
                invoices: get().invoices.map(inv => inv.id === id ? { ...inv, ...updatedInv } : inv)
            }),

            // Customers
            fetchCustomers: async () => {
                try {
                    const res = await fetch('/api/customers');

                    if (res.status === 401) {
                        console.warn('Session check failed for customers - silently returning');
                        return;
                    }

                    const data = await res.json();
                    if (Array.isArray(data)) {
                        set({ customers: data });
                    } else {
                        set({ customers: [] });
                    }
                } catch (error) {
                    console.error('Failed to fetch customers:', error);
                    set({ customers: [] });
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
                    if (error.message.toLowerCase().includes('limit') || error.message.toLowerCase().includes('upgrade') || error.message.toLowerCase().includes('premium')) {
                        get().setUpgradeModal(true, error.message);
                    } else {
                        toast.error(error.message || 'Failed to save customer. Please try again.');
                    }
                }
            },
            updateCustomer: async (id, data) => {
                try {
                    // Get current customer data to ensure we don't send undefined fields
                    const currentCustomer = get().customers.find(c => c.id === id);
                    const fullData = { ...currentCustomer, ...data };

                    // Optimistic update
                    set({ customers: get().customers.map(c => c.id === id ? fullData : c) });

                    const res = await fetch('/api/customers', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fullData)
                    });

                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.error || 'Failed to update customer');
                    }

                    toast.success('Customer updated successfully');
                    get().fetchCustomers(); // Refresh to be safe
                } catch (error) {
                    console.error('Failed to update customer:', error);
                    toast.error(error.message);
                    get().fetchCustomers(); // Revert
                }
            },

            // Products
            fetchProducts: async () => {
                try {
                    const res = await fetch('/api/products');

                    if (res.status === 401) {
                        console.warn('Session check failed for products - silently returning');
                        return;
                    }

                    const data = await res.json();
                    if (Array.isArray(data)) {
                        set({ products: data });
                    } else {
                        set({ products: [] });
                    }
                } catch (error) {
                    console.error('Failed to fetch products:', error);
                    set({ products: [] });
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
                    toast.error(error.message || 'Failed to save product. Please try again.');
                }
            },
            updateProduct: async (id, data) => {
                try {
                    const currentProduct = get().products.find(p => p.id === id) || {};
                    const fullData = { ...currentProduct, ...data, id };

                    // Optimistic update (update UI immediately)
                    const oldProducts = get().products;
                    set({ products: oldProducts.map(p => p.id === id ? fullData : p) });

                    const res = await fetch('/api/products', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fullData)
                    });

                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.error || 'Failed to update product');
                    }

                    toast.success('Product updated successfully');
                } catch (error) {
                    console.error('Failed to update product:', error);
                    toast.error(error.message);
                    // Revert optimistic update on failure (fetching fresh data is safer)
                    get().fetchProducts();
                }
            },
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

            // Quotations
            fetchQuotations: async () => {
                try {
                    const res = await fetch('/api/quotations');
                    if (res.status === 401) return;
                    const data = await res.json();
                    if (Array.isArray(data)) set({ quotations: data });
                } catch (error) {
                    console.error('Failed to fetch quotations:', error);
                }
            },
            addQuotation: async (quotation) => {
                try {
                    const res = await fetch('/api/quotations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(quotation)
                    });
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.error || JSON.stringify(result) || 'Failed to save quotation');
                    get().fetchQuotations();
                    toast.success('Quotation saved successfully');
                    return result;
                } catch (error) {
                    console.error('Failed to save quotation:', error);
                    if (error.message.toLowerCase().includes('limit') || error.message.toLowerCase().includes('upgrade') || error.message.toLowerCase().includes('premium')) {
                        get().setUpgradeModal(true, error.message);
                    } else {
                        // Show exact error from server (e.g., "duplicate key value")
                        toast.error(`Error: ${error.message}`);
                    }
                    return { success: false, error: error.message };
                }
            },
            updateQuotation: async (id, data) => {
                try {
                    // Optimistic update
                    set({
                        quotations: get().quotations.map(q => q.id === id ? { ...q, ...data } : q)
                    });

                    const res = await fetch('/api/quotations', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, ...data })
                    });

                    if (!res.ok) {
                        const result = await res.json();
                        throw new Error(result.error || 'Failed to update quotation');
                    }

                    toast.success('Quotation updated');
                    get().fetchQuotations(); // Sync with server
                } catch (error) {
                    console.error('Failed to update quotation:', error);
                    toast.error(error.message);
                    get().fetchQuotations(); // Revert on error
                }
            },

            // Expenses
            fetchExpenses: async () => {
                try {
                    const res = await fetch('/api/expenses');
                    if (res.status === 401) return;
                    const data = await res.json();
                    if (Array.isArray(data)) set({ expenses: data });
                } catch (error) {
                    console.error('Failed to fetch expenses:', error);
                }
            },
            addExpense: async (expense) => {
                try {
                    const res = await fetch('/api/expenses', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(expense)
                    });
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.error || 'Failed to save expense');
                    get().fetchExpenses();
                    toast.success('Expense added successfully');
                    return result;
                } catch (error) {
                    console.error('Failed to save expense:', error);
                    toast.error(error.message);
                    return { success: false, error: error.message };
                }
            },
            updateExpense: async (id, data) => {
                try {
                    const res = await fetch(`/api/expenses/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    if (!res.ok) throw new Error('Failed to update expense');

                    toast.success('Expense updated');
                    get().fetchExpenses();
                    return { success: true };
                } catch (error) {
                    console.error('Failed to update expense:', error);
                    toast.error(error.message);
                    return { success: false, error: error.message };
                }
            },
            deleteExpense: async (id) => {
                try {
                    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });

                    if (!res.ok) throw new Error('Failed to delete expense');

                    set({ expenses: get().expenses.filter(e => e.id !== id) });
                    toast.success('Expense deleted');
                    return { success: true };
                } catch (error) {
                    console.error('Failed to delete expense:', error);
                    toast.error(error.message);
                    return { success: false };
                }
            },

            // Settings
            updateSettings: (settings) => set({ settings: { ...get().settings, ...settings } }),

            // Analytics Helpers
            getAnalytics: (period = 'monthly', customRange = null) => {
                const { invoices, products } = get();
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
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    filteredInvoices = invoices.filter(inv => new Date(inv.invoice_date) >= oneWeekAgo);
                } else if (period === 'yearly') {
                    filteredInvoices = invoices.filter(inv => new Date(inv.invoice_date).getFullYear() === now.getFullYear());
                } else if (period === 'custom' && customRange?.start && customRange?.end) {
                    const start = new Date(customRange.start);
                    const end = new Date(customRange.end);
                    end.setHours(23, 59, 59, 999);
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
                            // Find product to get actual purchase price
                            const product = products.find(p => p.id === item.product_id || p.name === item.product_name);
                            const quantity = parseFloat(item.quantity) || 0;

                            if (product && product.purchase_price > 0) {
                                totalCost += (parseFloat(product.purchase_price) * quantity);
                            } else {
                                // Fallback: Assume 80% cost (20% margin) if purchase_price not set
                                const unitPrice = parseFloat(item.unit_price) || 0;
                                totalCost += (unitPrice * 0.8) * quantity;
                            }
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

                return Object.values(productSales).sort((a, b) => b.sales - a.sales);
            },
            setAiChatOpen: (open) => set({ aiChatOpen: open }),
        }),
        {
            name: 'billgst-storage',
            partialize: (state) => ({
                settings: state.settings,
                businessProfile: state.businessProfile,
            }),
            storage: createJSONStorage(() => {
                if (typeof window !== 'undefined') {
                    try {
                        window.localStorage.setItem('__test', '1');
                        window.localStorage.removeItem('__test');
                        return {
                            getItem: (name) => window.localStorage.getItem(name),
                            setItem: (name, value) => {
                                try {
                                    window.localStorage.setItem(name, value);
                                } catch (err) {
                                    if (err.name === 'QuotaExceededError' || err.code === 22) {
                                        console.warn('Storage full! Clearing non-essential data...');
                                        // Clear all exceptauth and critical keys
                                        Object.keys(window.localStorage).forEach(key => {
                                            if (key !== 'billgst-auth' && key !== 'next-auth.session-token') {
                                                window.localStorage.removeItem(key);
                                            }
                                        });
                                        // Try one more time with just the essential data
                                        try { window.localStorage.setItem(name, value); } catch(e) {}
                                    }
                                }
                            },
                            removeItem: (name) => window.localStorage.removeItem(name),
                        };
                    } catch (e) {
                        console.warn('localStorage is blocked or full, using in-memory fallback');
                        const fallbackStorage = new Map();
                        return {
                            getItem: (name) => fallbackStorage.get(name) || null,
                            setItem: (name, value) => fallbackStorage.set(name, value),
                            removeItem: (name) => fallbackStorage.delete(name),
                        };
                    }
                }
                return {
                    getItem: () => null,
                    setItem: () => undefined,
                    removeItem: () => undefined,
                };
            }),
            onRehydrateStorage: (state) => {
                return (rehydratedState, error) => {
                    if (error) {
                        console.error('An error occurred during rehydration', error);
                        return;
                    }
                    if (rehydratedState) {
                        // Ensure arrays are initialized if they weren't persisted
                        if (!Array.isArray(rehydratedState.invoices)) rehydratedState.invoices = [];
                        if (!Array.isArray(rehydratedState.customers)) rehydratedState.customers = [];
                        if (!Array.isArray(rehydratedState.products)) rehydratedState.products = [];
                    }
                };
            },
        }
    )
);
