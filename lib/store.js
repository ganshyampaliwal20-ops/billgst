import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { idb } from './idb';

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
        store_banner: null,
        modules: {
            invoicing: true,
            accounting: true,
            staff: true,
            inventory: true
        }
    },
    invoices: [],
    customers: [],
    products: [],
    quotations: [],
    expenses: [],
    staff: [],
    attendance: [],
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
    aiDraftData: null,
};

const customStorage = {
    getItem: async (name) => {
        if (typeof window === 'undefined') return null;
        try {
            const value = await idb.get(name);
            return value || null;
        } catch (e) {
            return null;
        }
    },
    setItem: async (name, value) => {
        if (typeof window !== 'undefined') {
            await idb.set(name, value).catch(() => {});
        }
    },
    removeItem: async (name) => {
        if (typeof window !== 'undefined') {
            await idb.remove(name).catch(() => {});
        }
    },
};

export const useStore = create(
    persist(
        (set, get) => ({
            ...initialState,
            setUpgradeModal: (isOpen, message = '') => set({ upgradeModal: { isOpen, message } }),

            // Action to reset store on Logout
            resetStore: async () => {
                set(initialState);
                // Also clear local storage manually to be safe
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('billgst-storage');
                    localStorage.removeItem('hisaab_pro_data'); // Clear legacy expenses on logout
                    
                    // Clear IndexedDB completely to prevent cross-account leakage on shared devices
                    try {
                        const { idb } = await import('./idb');
                        await idb.clear(); // Clear all keys in our IDB store
                        console.log('✅ Local storage & IndexedDB cleared on logout');
                    } catch (e) {
                        console.error('Failed to clear IndexedDB on logout', e);
                    }
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
            fetchInvoices: async (force = false, page = 1) => {
                if (!force && page === 1 && get().invoices && get().invoices.length > 0) return;
                try {
                    const res = await fetch(`/api/invoices?page=${page}&limit=500`);

                    // Handle Unauthorized (Session Expired)
                    if (res.status === 401) {
                        console.warn('Session check failed for invoices - silently returning');
                        return;
                    }

                    const data = await res.json();
                    if (Array.isArray(data)) {
                        if (page === 1) {
                            set({ invoices: data });
                        } else {
                            const existingIds = new Set(get().invoices.map(i => i.id));
                            const newItems = data.filter(i => !existingIds.has(i.id));
                            set({ invoices: [...get().invoices, ...newItems] });
                        }
                    } else {
                        console.error('Invalid invoices data received:', data);
                        if (page === 1) set({ invoices: [] });
                    }
                } catch (error) {
                    console.error('Failed to fetch invoices:', error);
                    if (page === 1) set({ invoices: [] });
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
                        get().fetchInvoices(true);
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
            fetchCustomers: async (force = false, page = 1) => {
                if (!force && page === 1 && get().customers && get().customers.length > 0) return;
                try {
                    const res = await fetch(`/api/customers?page=${page}&limit=20`);

                    if (res.status === 401) {
                        console.warn('Session check failed for customers - silently returning');
                        return;
                    }

                    const data = await res.json();
                    if (Array.isArray(data)) {
                        if (page === 1) {
                            set({ customers: data });
                        } else {
                            const existingIds = new Set(get().customers.map(c => c.id));
                            const newItems = data.filter(c => !existingIds.has(c.id));
                            set({ customers: [...get().customers, ...newItems] });
                        }
                    } else {
                        if (page === 1) set({ customers: [] });
                    }
                } catch (error) {
                    console.error('Failed to fetch customers:', error);
                    if (page === 1) set({ customers: [] });
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
                    get().fetchCustomers(true); // Refresh to be safe
                } catch (error) {
                    console.error('Failed to update customer:', error);
                    toast.error(error.message);
                    get().fetchCustomers(true); // Revert
                }
            },
            deleteCustomer: async (id) => {
                try {
                    const res = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
                    const result = await res.json();

                    if (!res.ok) throw new Error(result.error || 'Failed to delete customer');

                    set({ customers: get().customers.filter(c => c.id !== id) });
                    return { success: true };
                } catch (error) {
                    console.error('Failed to delete customer:', error);
                    toast.error(error.message);
                    return { success: false, error: error.message };
                }
            },

            // Products
            fetchProducts: async (force = false, page = 1) => {
                if (!force && page === 1 && get().products && get().products.length > 0) return;
                try {
                    const res = await fetch(`/api/products?page=${page}&limit=20`);
                    if (res.status === 401) return;
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        if (page === 1) {
                            set({ products: data });
                        } else {
                            const existingIds = new Set(get().products.map(p => p.id));
                            const newItems = data.filter(p => !existingIds.has(p.id));
                            set({ products: [...get().products, ...newItems] });
                        }
                    } else {
                        if (page === 1) set({ products: [] });
                    }
                } catch (error) {
                    console.error('Failed to fetch products:', error);
                    if (page === 1) set({ products: [] });
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
                    // toast.error(error.message || 'Failed to save product. Please try again.');
                    return { error: error.message || 'Failed to save product. Please try again.' };
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
                    return { success: true };
                } catch (error) {
                    console.error('Failed to update product:', error);
                    toast.error(error.message);
                    // Revert optimistic update on failure (fetching fresh data is safer)
                    get().fetchProducts(true);
                    return { error: error.message };
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
            fetchQuotations: async (force = false, page = 1) => {
                if (!force && page === 1 && get().quotations && get().quotations.length > 0) return;
                try {
                    const res = await fetch(`/api/quotations?page=${page}&limit=20`);
                    if (res.status === 401) return;
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        if (page === 1) {
                            set({ quotations: data });
                        } else {
                            const existingIds = new Set(get().quotations.map(q => q.id));
                            const newItems = data.filter(q => !existingIds.has(q.id));
                            set({ quotations: [...get().quotations, ...newItems] });
                        }
                    }
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
                    get().fetchQuotations(true);
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
                    get().fetchQuotations(true); // Sync with server
                } catch (error) {
                    console.error('Failed to update quotation:', error);
                    toast.error(error.message);
                    get().fetchQuotations(true); // Revert on error
                }
            },

            // Expenses
            fetchExpenses: async (force = false, page = 1) => {
                if (!force && page === 1 && get().expenses && get().expenses.length > 0) return;
                try {
                    const res = await fetch(`/api/expenses?page=${page}&limit=20`);
                    if (res.status === 401) return;
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        if (page === 1) {
                            set({ expenses: data });
                        } else {
                            const existingIds = new Set(get().expenses.map(e => e.id));
                            const newItems = data.filter(e => !existingIds.has(e.id));
                            set({ expenses: [...get().expenses, ...newItems] });
                        }
                    }
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
                    get().fetchExpenses(true);
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
                    get().fetchExpenses(true);
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

            // Staff
            fetchStaff: async (force = false, page = 1) => {
                if (!force && page === 1 && get().staff && get().staff.length > 0) return;
                try {
                    const res = await fetch(`/api/staff?page=${page}&limit=20`);
                    if (res.status === 401) return;
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        if (page === 1) {
                            set({ staff: data });
                        } else {
                            const existingIds = new Set(get().staff.map(s => s.id));
                            const newItems = data.filter(s => !existingIds.has(s.id));
                            set({ staff: [...get().staff, ...newItems] });
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch staff:', error);
                }
            },
            addStaff: async (member) => {
                try {
                    const res = await fetch('/api/staff', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(member)
                    });
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.error || 'Failed to add staff');
                    get().fetchStaff(true);
                    toast.success('Staff added successfully');
                    return result;
                } catch (error) {
                    console.error('Failed to add staff:', error);
                    toast.error(error.message);
                    return { success: false, error: error.message };
                }
            },
            updateStaff: async (id, data) => {
                try {
                    const res = await fetch('/api/staff', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, ...data })
                    });
                    if (!res.ok) throw new Error('Failed to update staff');
                    get().fetchStaff(true);
                    toast.success('Staff updated');
                    return { success: true };
                } catch (error) {
                    console.error('Failed to update staff:', error);
                    toast.error(error.message);
                    return { success: false, error: error.message };
                }
            },
            deleteStaff: async (id) => {
                try {
                    const res = await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Failed to delete staff');
                    set({ staff: get().staff.filter(s => s.id !== id) });
                    toast.success('Staff deleted');
                    return { success: true };
                } catch (error) {
                    console.error('Failed to delete staff:', error);
                    toast.error(error.message);
                    return { success: false };
                }
            },

            // Attendance
            fetchAttendance: async (month) => {
                try {
                    const url = month ? `/api/attendance?month=${month}` : '/api/attendance';
                    const res = await fetch(url);
                    if (res.status === 401) return;
                    const data = await res.json();
                    if (Array.isArray(data)) set({ attendance: data });
                } catch (error) {
                    console.error('Failed to fetch attendance:', error);
                }
            },
            markAttendance: async (staff_id, date, status, in_time = null, out_time = null, note = null) => {
                try {
                    // Optimistic update: update state instantly
                    const previousAttendance = get().attendance;
                    const existing = previousAttendance.filter(a => !(a.staff_id === staff_id && a.date === date));
                    set({ attendance: [...existing, { staff_id, date, status, in_time, out_time, note, id: Math.random().toString() }] });
                    
                    const res = await fetch('/api/attendance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ staff_id, date, status, in_time, out_time, note })
                    });
                    if (!res.ok) {
                        // Revert optimistic update on failure
                        set({ attendance: previousAttendance });
                        throw new Error('Failed to mark attendance');
                    }
                    
                    return { success: true };
                } catch (error) {
                    console.error('Failed to mark attendance:', error);
                    toast.error(error.message);
                    return { success: false, error: error.message };
                }
            },

            // Settings
            updateSettings: (settings) => set({ settings: { ...get().settings, ...settings } }),

            // Analytics Helpers
            getAnalytics: (period = 'monthly', customRange = null) => {
                const allInvoices = get().invoices || [];
                const invoices = allInvoices.filter(inv => !['QUOTATION', 'DELIVERY_CHALLAN', 'E_WAY_BILL', 'PROFORMA_INVOICE'].includes(inv.type || ''));
                const products = get().products || [];
                const now = new Date();
                let filteredInvoices = invoices;

                const localTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                if (period === 'daily') {
                    filteredInvoices = invoices.filter(inv => {
                        if (!inv.invoice_date) return false;
                        const d = new Date(inv.invoice_date);
                        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
                    });
                } else if (period === 'monthly') {
                    filteredInvoices = invoices.filter(inv => {
                        if (!inv.invoice_date) return false;
                        const d = new Date(inv.invoice_date);
                        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
                    });
                } else if (period === 'weekly') {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    oneWeekAgo.setHours(0, 0, 0, 0);
                    filteredInvoices = invoices.filter(inv => {
                        if (!inv.invoice_date) return false;
                        return new Date(inv.invoice_date) >= oneWeekAgo;
                    });
                } else if (period === 'yearly') {
                    filteredInvoices = invoices.filter(inv => {
                        if (!inv.invoice_date) return false;
                        return new Date(inv.invoice_date).getFullYear() === now.getFullYear();
                    });
                } else if (period === 'custom' && customRange?.start && customRange?.end) {
                    const start = new Date(customRange.start);
                    const end = new Date(customRange.end);
                    end.setHours(23, 59, 59, 999);
                    filteredInvoices = invoices.filter(inv => {
                        const d = new Date(inv.invoice_date);
                        return d >= start && d <= end;
                    });
                }

                const totalSales = filteredInvoices.reduce((acc, inv) => acc + (parseFloat(inv.total_amount) || parseFloat(inv.subtotal) || 0), 0);

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
                const invoices = get().invoices || [];
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
            setAiDraftData: (data) => set({ aiDraftData: data }),
        }),
        {
            name: 'billgst-storage',
            partialize: (state) => ({
                settings: state.settings,
                businessProfile: state.businessProfile,
                invoices: state.invoices,
                customers: state.customers,
                products: state.products,
                quotations: state.quotations,
                expenses: state.expenses,
                staff: state.staff,
            }),
            storage: customStorage,
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
