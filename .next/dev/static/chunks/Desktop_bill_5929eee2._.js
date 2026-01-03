(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/bill/lib/store.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useStore",
    ()=>useStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/zustand/esm/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-hot-toast/dist/index.mjs [app-client] (ecmascript)");
;
;
;
const initialState = {
    businessProfile: {
        name: 'My Business',
        gstin: '',
        address: '',
        phone: '',
        email: '',
        logo: null,
        upi_id: '',
        owner_name: ''
    },
    invoices: [],
    customers: [],
    products: [],
    settings: {
        currency: 'INR',
        language: 'en',
        darkMode: false,
        nonGstMode: false
    }
};
const useStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["create"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        ...initialState,
        // Action to reset store on Logout
        resetStore: ()=>{
            set(initialState);
            // Also clear local storage manually to be safe
            if ("TURBOPACK compile-time truthy", 1) {
                localStorage.removeItem('billgst-storage');
            }
        },
        updateProfile: (profile)=>set({
                businessProfile: {
                    ...get().businessProfile,
                    ...profile
                }
            }),
        // Invoices
        fetchInvoices: async ()=>{
            try {
                const res = await fetch('/api/invoices');
                // Handle Unauthorized (Session Expired)
                if (res.status === 401) {
                    console.warn('Session expired or unauthorized. Current path:', window.location.pathname);
                    // Only redirect if NOT on the landing page
                    if (window.location.pathname !== '/') {
                        window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
                    }
                    return;
                }
                const data = await res.json();
                if (Array.isArray(data)) {
                    set({
                        invoices: data
                    });
                } else {
                    console.error('Invalid invoices data received:', data);
                    set({
                        invoices: []
                    });
                }
            } catch (error) {
                console.error('Failed to fetch invoices:', error);
                set({
                    invoices: []
                });
            }
        },
        addInvoice: async (invoice)=>{
            try {
                const res = await fetch('/api/invoices', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(invoice)
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || result.details || 'Failed to save invoice');
                if (result.success || result.id) {
                    get().fetchInvoices();
                    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Invoice saved successfully');
                    return result;
                }
                console.error('Invoice Add failed voluntarily:', result);
                throw new Error(result.error || 'Server returned failure without error message');
            } catch (error) {
                console.error('Failed to save invoice:', error);
                // Return error so component can show details
                return {
                    success: false,
                    error: error.message
                };
            }
        },
        deleteInvoice: (id)=>set({
                invoices: get().invoices.filter((inv)=>inv.id !== id)
            }),
        updateInvoice: (id, updatedInv)=>set({
                invoices: get().invoices.map((inv)=>inv.id === id ? {
                        ...inv,
                        ...updatedInv
                    } : inv)
            }),
        // Customers
        fetchCustomers: async ()=>{
            try {
                const res = await fetch('/api/customers');
                if (res.status === 401) {
                    console.warn('Session expired or unauthorized. Current path:', window.location.pathname);
                    // Only redirect if NOT on the landing page
                    if (window.location.pathname !== '/') {
                        window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
                    }
                    return;
                }
                const data = await res.json();
                if (Array.isArray(data)) {
                    set({
                        customers: data
                    });
                } else {
                    set({
                        customers: []
                    });
                }
            } catch (error) {
                console.error('Failed to fetch customers:', error);
                set({
                    customers: []
                });
            }
        },
        addCustomer: async (customer)=>{
            try {
                const res = await fetch('/api/customers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(customer)
                });
                const savedCustomer = await res.json();
                if (!res.ok) throw new Error(savedCustomer.error || 'Failed to add customer');
                if (savedCustomer.id) {
                    set({
                        customers: [
                            savedCustomer,
                            ...get().customers
                        ]
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Customer added successfully');
                    return savedCustomer;
                }
            } catch (error) {
                console.error('Failed to add customer:', error);
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Failed to save customer. Please try again.');
            }
        },
        updateCustomer: (id, data)=>set({
                customers: get().customers.map((c)=>c.id === id ? {
                        ...c,
                        ...data
                    } : c)
            }),
        // Products
        fetchProducts: async ()=>{
            try {
                const res = await fetch('/api/products');
                if (res.status === 401) {
                    console.warn('Session expired or unauthorized. Current path:', window.location.pathname);
                    // Only redirect if NOT on the landing page
                    if (window.location.pathname !== '/') {
                        window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
                    }
                    return;
                }
                const data = await res.json();
                if (Array.isArray(data)) {
                    set({
                        products: data
                    });
                } else {
                    set({
                        products: []
                    });
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
                set({
                    products: []
                });
            }
        },
        addProduct: async (product)=>{
            try {
                const res = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(product)
                });
                const savedProduct = await res.json();
                if (!res.ok) throw new Error(savedProduct.error || 'Failed to add product');
                if (savedProduct.id) {
                    set({
                        products: [
                            savedProduct,
                            ...get().products
                        ]
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Product added successfully');
                    return savedProduct;
                }
            } catch (error) {
                console.error('Failed to add product:', error);
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Failed to save product. Please try again.');
            }
        },
        updateProduct: async (id, data)=>{
            try {
                // Optimistic update (update UI immediately)
                const oldProducts = get().products;
                set({
                    products: oldProducts.map((p)=>p.id === id ? {
                            ...p,
                            ...data
                        } : p)
                });
                const res = await fetch('/api/products', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id,
                        ...data
                    })
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to update product');
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Product updated successfully');
            } catch (error) {
                console.error('Failed to update product:', error);
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
                // Revert optimistic update on failure (fetching fresh data is safer)
                get().fetchProducts();
            }
        },
        deleteProduct: async (id)=>{
            try {
                const res = await fetch(`/api/products?id=${id}`, {
                    method: 'DELETE'
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to delete product');
                set({
                    products: get().products.filter((p)=>p.id !== id)
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Product deleted successfully');
                return {
                    success: true
                };
            } catch (error) {
                console.error('Failed to delete product:', error);
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
                return {
                    success: false,
                    error: error.message
                };
            }
        },
        // Settings
        updateSettings: (settings)=>set({
                settings: {
                    ...get().settings,
                    ...settings
                }
            }),
        // Analytics Helpers
        getAnalytics: (period = 'monthly', customRange = null)=>{
            const { invoices, products } = get();
            const now = new Date();
            let filteredInvoices = invoices;
            if (period === 'daily') {
                filteredInvoices = invoices.filter((inv)=>new Date(inv.invoice_date).toDateString() === now.toDateString());
            } else if (period === 'monthly') {
                filteredInvoices = invoices.filter((inv)=>new Date(inv.invoice_date).getMonth() === now.getMonth() && new Date(inv.invoice_date).getFullYear() === now.getFullYear());
            } else if (period === 'weekly') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                filteredInvoices = invoices.filter((inv)=>new Date(inv.invoice_date) >= oneWeekAgo);
            } else if (period === 'yearly') {
                filteredInvoices = invoices.filter((inv)=>new Date(inv.invoice_date).getFullYear() === now.getFullYear());
            } else if (period === 'custom' && customRange?.start && customRange?.end) {
                const start = new Date(customRange.start);
                const end = new Date(customRange.end);
                end.setHours(23, 59, 59, 999);
                filteredInvoices = invoices.filter((inv)=>{
                    const d = new Date(inv.invoice_date);
                    return d >= start && d <= end;
                });
            }
            const totalSales = filteredInvoices.reduce((acc, inv)=>acc + (parseFloat(inv.total_amount) || 0), 0);
            let totalCost = 0;
            filteredInvoices.forEach((inv)=>{
                if (inv.items && Array.isArray(inv.items)) {
                    inv.items.forEach((item)=>{
                        // Find product to get actual purchase price
                        const product = products.find((p)=>p.id === item.product_id || p.name === item.product_name);
                        const quantity = parseFloat(item.quantity) || 0;
                        if (product && product.purchase_price > 0) {
                            totalCost += parseFloat(product.purchase_price) * quantity;
                        } else {
                            // Fallback: Assume 80% cost (20% margin) if purchase_price not set
                            const unitPrice = parseFloat(item.unit_price) || 0;
                            totalCost += unitPrice * 0.8 * quantity;
                        }
                    });
                }
            });
            const totalProfit = totalSales - totalCost;
            return {
                totalSales,
                totalProfit,
                invoiceCount: filteredInvoices.length
            };
        },
        getTopProducts: ()=>{
            const { invoices } = get();
            const productSales = {};
            invoices.forEach((inv)=>{
                if (inv.items && Array.isArray(inv.items)) {
                    inv.items.forEach((item)=>{
                        const name = item.product_name || 'Unknown';
                        if (!productSales[name]) {
                            productSales[name] = {
                                name,
                                sales: 0,
                                quantity: 0
                            };
                        }
                        productSales[name].sales += parseFloat(item.total_amount || 0);
                        productSales[name].quantity += parseFloat(item.quantity || 0);
                    });
                }
            });
            return Object.values(productSales).sort((a, b)=>b.sales - a.sales).slice(0, 5);
        }
    }), {
    name: 'billgst-storage',
    storage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createJSONStorage"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return localStorage;
        //TURBOPACK unreachable
        ;
    }),
    onRehydrateStorage: (state)=>{
        console.log('Store rehydration started');
        return (rehydratedState, error)=>{
            if (error) {
                console.error('An error occurred during rehydration', error);
                return;
            }
            if (rehydratedState) {
                // Sanitize rehydrated state
                if (!Array.isArray(rehydratedState.invoices)) rehydratedState.invoices = [];
                if (!Array.isArray(rehydratedState.customers)) rehydratedState.customers = [];
                if (!Array.isArray(rehydratedState.products)) rehydratedState.products = [];
                if (!rehydratedState.businessProfile || typeof rehydratedState.businessProfile !== 'object') {
                    rehydratedState.businessProfile = initialState.businessProfile;
                }
                if (!rehydratedState.settings || typeof rehydratedState.settings !== 'object') {
                    rehydratedState.settings = initialState.settings;
                }
                console.log('Store rehydration finished successfully');
            }
        };
    }
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/bill/lib/translations.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "languages",
    ()=>languages,
    "translations",
    ()=>translations
]);
const translations = {
    en: {
        welcome: 'Welcome',
        dashboard: 'Dashboard',
        invoices: 'Invoices',
        customers: 'Customers',
        inventory: 'Inventory',
        reports: 'Reports',
        settings: 'Settings',
        newInvoice: 'New Invoice',
        addCustomer: 'Add Customer',
        addProduct: 'Add Product',
        viewReports: 'View Reports',
        analyticsOverview: 'Analytics Overview',
        businessOverview: 'Business Overview',
        todaysSales: "Today's Sales",
        totalRevenue: 'Total Revenue',
        lowStock: 'Low Stock',
        setupBusiness: 'Setup Your Business',
        setupNow: 'Setup Now',
        revenueAnalytics: 'Revenue Analytics',
        topSellingProducts: 'Top Selling Products',
        recentInvoices: 'Recent Invoices',
        weeklyPerformance: 'Weekly Performance',
        selectPeriod: 'Select Time Period',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly',
        search: 'Search...',
        goodMorning: 'Good Morning',
        goodAfternoon: 'Good Afternoon',
        goodEvening: 'Good Evening',
        gstin: 'GSTIN',
        phone: 'Phone',
        address: 'Address',
        save: 'Save',
        cancel: 'Cancel',
        actions: 'Actions',
        status: 'Status',
        amount: 'Amount',
        date: 'Date',
        customer: 'Customer',
        product: 'Product',
        quantity: 'Quantity',
        price: 'Price',
        total: 'Total',
        addItem: 'Add Item',
        subtotal: 'Subtotal',
        gstTotal: 'GST Total',
        totalAmount: 'Total Amount',
        paidAmount: 'Paid Amount',
        balanceAmount: 'Balance Amount',
        invoiceDate: 'Invoice Date',
        selectCustomer: 'Select Customer',
        paymentHistory: 'Payment History',
        download: 'Download',
        share: 'Share',
        delete: 'Delete',
        edit: 'Edit',
        language: 'Language',
        selectLanguage: 'Select Language',
        paymentDetails: 'Payment Details',
        addPayment: 'Add Payment/Advance',
        invoiceItems: 'Invoice Items',
        addNewItem: 'ADD NEW ITEM',
        termsNotes: 'Terms / Notes',
        selectProduct: 'Select Product',
        enterAmount: 'Enter Amount',
        due: 'Due',
        removePayment: 'Remove Payment',
        newClient: 'New Client',
        saveInvoice: 'Save Invoice'
    },
    hi: {
        welcome: 'स्वागत है',
        dashboard: 'डैशबोर्ड',
        invoices: 'बिल (इनवॉइस)',
        customers: 'ग्राहक',
        inventory: 'स्टॉक (इन्वेंटरी)',
        reports: 'रिपोर्ट',
        settings: 'सेटिंग्स',
        newInvoice: 'नया बिल',
        addCustomer: 'ग्राहक जोड़ें',
        addProduct: 'सामान जोड़ें',
        viewReports: 'रिपोर्ट देखें',
        analyticsOverview: 'एनालिटिक्स अवलोकन',
        businessOverview: 'व्यवसाय अवलोकन',
        todaysSales: 'आज की बिक्री',
        totalRevenue: 'कुल राजस्व',
        lowStock: 'कम स्टॉक',
        setupBusiness: 'अपना व्यवसाय सेटअप करें',
        setupNow: 'सेटअप करें',
        revenueAnalytics: 'राजस्व विश्लेषण',
        topSellingProducts: 'सबसे ज्यादा बिकने वाला सामान',
        recentInvoices: 'हाल के बिल',
        weeklyPerformance: 'साप्ताहिक प्रदर्शन',
        selectPeriod: 'समय अवधि चुनें',
        daily: 'दैनिक',
        weekly: 'साप्ताहिक',
        monthly: 'मासिक',
        yearly: 'वार्षिक',
        search: 'खोजें...',
        goodMorning: 'सुप्रभात',
        goodAfternoon: 'नमस्कार',
        goodEvening: 'शुभ संध्या',
        gstin: 'GSTIN',
        phone: 'फ़ोन',
        address: 'पता',
        save: 'सहेजें',
        cancel: 'रद्द करें',
        actions: 'कार्रवाई',
        status: 'स्थिति',
        amount: 'राशि',
        date: 'तारीख',
        customer: 'ग्राहक',
        product: 'सामान',
        quantity: 'मात्रा',
        price: 'कीमत',
        total: 'कुल',
        addItem: 'सामान जोड़ें',
        subtotal: 'उप-योग',
        gstTotal: 'कुल GST',
        totalAmount: 'कुल राशि',
        paidAmount: 'भुगतान राशि',
        balanceAmount: 'बकाया राशि',
        invoiceDate: 'बिल तारीख',
        selectCustomer: 'ग्राहक चुनें',
        paymentHistory: 'भुगतान इतिहास',
        download: 'डाउनलोड',
        share: 'शेयर',
        delete: 'हटाएं',
        edit: 'संपादित करें',
        language: 'भाषा',
        selectLanguage: 'भाषा चुनें',
        paymentDetails: 'भुगतान विवरण',
        addPayment: 'भुगतान/एडवांस जोड़ें',
        invoiceItems: 'बिल का सामान',
        addNewItem: 'नया सामान जोड़ें',
        termsNotes: 'शर्तें / नोट्स',
        selectProduct: 'सामान चुनें',
        enterAmount: 'राशि दर्ज करें',
        due: 'बकाया',
        removePayment: 'भुगतान हटाएँ',
        newClient: 'नया ग्राहक',
        saveInvoice: 'बिल सहेजें'
    },
    gu: {
        welcome: 'સ્વાગત છે',
        dashboard: 'ડેશબોર્ડ',
        invoices: 'બિલ',
        customers: 'ગ્રાહકો',
        inventory: 'સ્ટોક',
        reports: 'રિપોર્ટ્સ',
        settings: 'સેટિંગ્સ',
        newInvoice: 'નવું બિલ',
        addCustomer: 'ગ્રાહક ઉમેરો',
        addProduct: 'ઉત્પાદન ઉમેરો',
        viewReports: 'રિપોર્ટ જુઓ',
        analyticsOverview: 'એનાલિટિક્સ ઝાંખી',
        businessOverview: 'વ્યવસાય ઝાંખી',
        todaysSales: 'આજના વેચાણ',
        totalRevenue: 'કુલ આવક',
        lowStock: 'ઓછો સ્ટોક',
        setupBusiness: 'તમારો વ્યવસાય સેટ કરો',
        setupNow: 'સેટઅપ કરો',
        revenueAnalytics: 'આવક વિશ્લેષણ',
        topSellingProducts: 'સૌથી વધુ વેચાતા ઉત્પાદનો',
        recentInvoices: 'તાજેતરના બિલ',
        weeklyPerformance: 'સાપ્તાહિક પ્રદર્શન',
        selectPeriod: 'સમયગાળો પસંદ કરો',
        daily: 'દૈનિક',
        weekly: 'સાપ્તાહિક',
        monthly: 'માસિક',
        yearly: 'વાર્ષિક',
        search: 'શોધો...',
        goodMorning: 'સુપ્રભાત',
        goodAfternoon: 'નમસ્કાર',
        goodEvening: 'શુભ સાંજ',
        gstin: 'GSTIN',
        phone: 'ફોન',
        address: 'સરનામું',
        save: 'સાચવો',
        cancel: 'રદ કરો',
        actions: 'ક્રિયાઓ',
        status: 'સ્થિતિ',
        amount: 'રકમ',
        date: 'તારીખ',
        customer: 'ગ્રાહક',
        product: 'ઉત્પાદન',
        quantity: 'જથ્થો',
        price: 'કિંમત',
        total: 'કુલ',
        addItem: 'ઉત્પાદન ઉમેરો',
        subtotal: 'પેટા સરવાળો',
        gstTotal: 'કુલ GST',
        totalAmount: 'કુલ રકમ',
        paidAmount: 'ચૂકવેલ રકમ',
        balanceAmount: 'બાકી રકમ',
        invoiceDate: 'બિલ તારીખ',
        selectCustomer: 'ગ્રાહક પસંદ કરો',
        paymentHistory: 'ચુકવણી ઇતિહાસ',
        download: 'ડાઉનલોડ',
        share: 'શેર',
        delete: 'કાઢી નાખો',
        edit: 'ફેરફાર કરો',
        language: 'ભાષા',
        selectLanguage: 'ભાષા પસંદ કરો',
        paymentDetails: 'ચુકવણી વિગતો',
        addPayment: 'ચુકવણી/એડવાન્સ ઉમેરો',
        invoiceItems: 'બિલની વસ્તુઓ',
        addNewItem: 'નવી વસ્તુ ઉમેરો',
        termsNotes: 'શરતો / નોંધો',
        selectProduct: 'ઉત્પાદન પસંદ કરો',
        enterAmount: 'રકમ દાખલ કરો',
        due: 'બાકી',
        removePayment: 'ચુકવણી દૂર કરો',
        newClient: 'નવો ગ્રાહક',
        saveInvoice: 'બિલ સાચવો'
    },
    mr: {
        welcome: 'स्वागत आहे',
        dashboard: 'डॅशबोर्ड',
        invoices: 'बिल',
        customers: 'ग्राहक',
        inventory: 'इन्व्हेंटरी',
        reports: 'अहवाल',
        settings: 'सेटिंग्ज',
        newInvoice: 'नवीन बिल',
        addCustomer: 'ग्राहक जोडा',
        addProduct: 'उत्पादन जोडा',
        viewReports: 'अहवाल पहा',
        analyticsOverview: 'विश्लेषण विहंगावलोकन',
        businessOverview: 'व्यवसाय विहंगावलोकन',
        todaysSales: 'आजची विक्री',
        totalRevenue: 'एकूण महसूल',
        lowStock: 'कमी साठा',
        setupBusiness: 'आपला व्यवसाय सेटअप करा',
        setupNow: 'सेटअप करा',
        revenueAnalytics: 'महसूल विश्लेषण',
        topSellingProducts: 'सर्वाधिक खपणारी उत्पादने',
        recentInvoices: 'अलीकडील बिल',
        weeklyPerformance: 'साप्ताहिक कामगिरी',
        selectPeriod: 'कालावधी निवडा',
        daily: 'दैनिक',
        weekly: 'साप्ताहिक',
        monthly: 'मासिक',
        yearly: 'वार्षिक',
        search: 'शोधा...',
        goodMorning: 'शुभ सकाळ',
        goodAfternoon: 'नमस्कार',
        goodEvening: 'शुभ संध्याकाळ',
        gstin: 'GSTIN',
        phone: 'फोन',
        address: 'पत्ता',
        save: 'जतन करा',
        cancel: 'रद्द करा',
        actions: 'कृती',
        status: 'स्थिती',
        amount: 'रक्कम',
        date: 'तारीख',
        customer: 'ग्राहक',
        product: 'उत्पादन',
        quantity: 'प्रमाण',
        price: 'किंमत',
        total: 'एकूण',
        addItem: 'वस्तू जोडा',
        subtotal: 'उप बेरीज',
        gstTotal: 'एकूण GST',
        totalAmount: 'एकूण रक्कम',
        paidAmount: 'भरलेली रक्कम',
        balanceAmount: 'शिल्लक रक्कम',
        invoiceDate: 'बिलाची तारीख',
        selectCustomer: 'ग्राहक निवडा',
        paymentHistory: 'पेमेंट इतिहास',
        download: 'डाउनलोड',
        share: 'शेअर',
        delete: 'हटवा',
        edit: 'संपादित करा',
        language: 'भाषा',
        selectLanguage: 'भाषा निवडा',
        paymentDetails: 'पेमेंट तपशील',
        addPayment: 'पेमेंट/अडव्हांस जोडा',
        invoiceItems: 'बिलाच्या वस्तू',
        addNewItem: 'नवीन वस्तू जोडा',
        termsNotes: 'अटी / टिपा',
        selectProduct: 'उत्पादन निवडा',
        enterAmount: 'रक्कम टाका',
        due: 'बाकी',
        removePayment: 'पेमेंट काढा',
        newClient: 'नवीन ग्राहक',
        saveInvoice: 'बिल जतन करा'
    },
    ta: {
        welcome: 'வரவேற்பு',
        dashboard: 'டாஷ்போர்டு',
        invoices: 'இன்வாய்ஸ்கள்',
        customers: 'வாடிக்கையாளர்கள்',
        inventory: 'சரக்கு',
        reports: 'அறிக்கைகள்',
        settings: 'அமைப்புகள்',
        newInvoice: 'புதிய இன்வாய்ஸ்',
        addCustomer: 'வாடிக்கையாளரைச் சேர்',
        addProduct: 'தயாரிப்பைச் சேர்',
        viewReports: 'அறிக்கைகளைப் பார்',
        analyticsOverview: 'பகுப்பாய்வு கண்ணோட்டம்',
        businessOverview: 'வணிக கண்ணோட்டம்',
        todaysSales: 'இன்றைய விற்பனை',
        totalRevenue: 'மொத்த வருவாய்',
        lowStock: 'குறைந்த இருப்பு',
        setupBusiness: 'வணிகத்தை அமைக்கவும்',
        setupNow: 'அமைக்கவும்',
        revenueAnalytics: 'வருவாய் பகுப்பாய்வு',
        topSellingProducts: 'அதிக விற்பனையானவை',
        recentInvoices: 'சமீபத்திய இன்வாய்ஸ்கள்',
        weeklyPerformance: 'வாராந்திர செயல்பாடு',
        selectPeriod: 'காலத்தைத் தேர்ந்தெடுக்கவும்',
        daily: 'தினசரி',
        weekly: 'வாராந்திர',
        monthly: 'மாதாந்திர',
        yearly: 'ஆண்டு',
        search: 'தேடு...',
        goodMorning: 'காலை வணக்கம்',
        goodAfternoon: 'மதிய வணக்கம்',
        goodEvening: 'மாலை வணக்கம்',
        gstin: 'GSTIN',
        phone: 'தொலைபேசி',
        address: 'முகவரி',
        save: 'சேமி',
        cancel: 'ரத்துசெய்',
        actions: 'செயல்கள்',
        status: 'நிலை',
        amount: 'தொகை',
        date: 'தேதி',
        customer: 'வாடிக்கையாளர்',
        product: 'தயாரிப்பு',
        quantity: 'அளவு',
        price: 'விலை',
        total: 'மொத்தம்',
        addItem: 'பொருளைச் சேர்',
        subtotal: 'கூடுதல் தொகை',
        gstTotal: 'மொத்த GST',
        totalAmount: 'மொத்த தொகை',
        paidAmount: 'செலுத்திய தொகை',
        balanceAmount: 'மீதமுள்ள தொகை',
        invoiceDate: 'இன்வாய்ஸ் தேதி',
        selectCustomer: 'வாடிக்கையாளரைத் தேர்',
        paymentHistory: 'கட்டண வரலாறு',
        download: 'பதிவிறக்கு',
        share: 'பகிர்',
        delete: 'அழி',
        edit: 'திருத்து',
        language: 'மொழி',
        selectLanguage: 'மொழியைத் தேர்ந்தெடு',
        paymentDetails: 'கட்டண விவரங்கள்',
        addPayment: 'கட்டணம்/முன்பணம் சேர்',
        invoiceItems: 'இன்வாய்ஸ் பொருட்கள்',
        addNewItem: 'புதிய பொருளைச் சேர்',
        termsNotes: 'விதிமுறைகள் / குறிப்புகள்',
        selectProduct: 'தயாரிப்பைத் தேர்',
        enterAmount: 'தொகையை உள்ளிடவும்',
        due: 'பாக்கி',
        removePayment: 'கட்டணத்தை நீக்கு',
        newClient: 'புதிய வாடிக்கையாளர்',
        saveInvoice: 'இன்வாய்ஸைச் சேமி'
    },
    te: {
        welcome: 'స్వాగతం',
        dashboard: 'డ్యాష్‌బోర్డ్',
        invoices: 'ఇన్వాయిస్లు',
        customers: 'ఖాతాదారులు',
        inventory: 'సరుకులు',
        reports: 'నివేదికలు',
        settings: 'అమరికలు',
        newInvoice: 'కొత్త ఇన్వాయిస్',
        addCustomer: 'ఖాతాదారుని జోడించు',
        addProduct: 'ఉత్పత్తిని జోడించు',
        viewReports: 'నివేదికలు చూడు',
        analyticsOverview: 'విశ్లేషణ అవలోకనం',
        businessOverview: 'వ్యాపార అవలోకనం',
        todaysSales: 'ఈ రోజు అమ్మకాలు',
        totalRevenue: 'మొత్తం ఆదాయం',
        lowStock: 'తక్కువ స్టాక్',
        setupBusiness: 'వ్యాపారాన్ని సెటప్ చేయండి',
        setupNow: 'సెటప్ చేయండి',
        revenueAnalytics: 'ఆదాయ విశ్లేషణ',
        topSellingProducts: 'అధికంగా అమ్ముడైనవి',
        recentInvoices: 'ఇటీవలి ఇన్వాయిస్లు',
        weeklyPerformance: 'వారపు పనితీరు',
        selectPeriod: 'కాలం ఎంచుకోండి',
        daily: 'రోజువారీ',
        weekly: 'వారపు',
        monthly: 'నెలవారీ',
        yearly: 'వార్షిక',
        search: 'వెతుకు...',
        goodMorning: 'శుభోదయం',
        goodAfternoon: 'శుభ మధ్యాహ్నం',
        goodEvening: 'శుభ సాయంత్రం',
        gstin: 'GSTIN',
        phone: 'ఫోన్',
        address: 'చిరునామా',
        save: 'సేవ్ చేయి',
        cancel: 'రద్దు చేయి',
        actions: 'చర్యలు',
        status: 'స్థితి',
        amount: 'మొత్తం',
        date: 'తేదీ',
        customer: 'ఖాతాదారు',
        product: 'ఉత్పత్తి',
        quantity: 'పరిమాణం',
        price: 'ధర',
        total: 'మొత్తం',
        addItem: 'అంశాన్ని జోడించు',
        subtotal: 'ఉప మొత్తం',
        gstTotal: 'మొత్తం GST',
        totalAmount: 'మొత్తం వేల్యూ',
        paidAmount: 'చెల్లించిన మొత్తం',
        balanceAmount: 'బ్యాలెన్స్ మొత్తం',
        invoiceDate: 'ఇన్వాయిస్ తేదీ',
        selectCustomer: 'ఖాతాదారుని ఎంచుకోండి',
        paymentHistory: 'చెల్లింపు చరిత్ర',
        download: 'డౌన్‌లోడ్',
        share: 'షేర్',
        delete: 'తొలగించు',
        edit: 'సవరించు',
        language: 'భాష',
        selectLanguage: 'భాష ఎంచుకోండి',
        paymentDetails: 'చెల్లింపు వివరాలు',
        addPayment: 'చెల్లింపు/అడ్వాన్స్ జోడించు',
        invoiceItems: 'ఇన్వాయిస్ అంశాలు',
        addNewItem: 'కొత్త అంశాన్ని జోడించు',
        termsNotes: 'నిబంధనలు / గమనికలు',
        selectProduct: 'ఉత్పత్తిని ఎంచుకోండి',
        enterAmount: 'మొత్తం నమోదు చేయండి',
        due: 'బాకీ',
        removePayment: 'చెల్లింపు తీసివేయి',
        newClient: 'కొత్త ఖాతాదారు',
        saveInvoice: 'ఇన్వాయిస్ సేవ్ చేయి'
    },
    bn: {
        welcome: 'স্বাগতম',
        dashboard: 'ড্যাশবোর্ড',
        invoices: 'চালান',
        customers: 'গ্রাহক',
        inventory: 'ইনভেন্টরি',
        reports: 'রিপোর্ট',
        settings: 'সেটিংস',
        newInvoice: 'নতুন চালান',
        addCustomer: 'গ্রাহক যোগ করুন',
        addProduct: 'পণ্য যোগ করুন',
        viewReports: 'রিপোর্ট দেখুন',
        analyticsOverview: 'অ্যানালিটিক্স ওভারভিউ',
        businessOverview: 'ব্যবসা ওভারভিউ',
        todaysSales: 'আজকের বিক্রয়',
        totalRevenue: 'মোট আয়',
        lowStock: 'কম স্টক',
        setupBusiness: 'ব্যাবসা সেটআপ করুন',
        setupNow: 'সেটআপ করুন',
        revenueAnalytics: 'আয় বিশ্লেষণ',
        topSellingProducts: 'সর্বাধিক বিক্রিত পণ্য',
        recentInvoices: 'সাম্প্রতিক চালান',
        weeklyPerformance: 'সাপ্তাহিক পারফরম্যান্স',
        selectPeriod: 'সময়কাল নির্বাচন করুন',
        daily: 'দৈনিক',
        weekly: 'সাপ্তাহিক',
        monthly: 'মাসিক',
        yearly: 'বার্ষিক',
        search: 'অনুসন্ধান...',
        goodMorning: 'সুপ্রভাত',
        goodAfternoon: 'শুভ অপরাহ্ন',
        goodEvening: 'শুভ সন্ধ্যা',
        gstin: 'GSTIN',
        phone: 'ফোন',
        address: 'ঠিকানা',
        save: 'সংরক্ষণ',
        cancel: 'বাতিল',
        actions: 'অ্যাকশন',
        status: 'অবস্থা',
        amount: 'পরিমাণ',
        date: 'তারিখ',
        customer: 'গ্রাহক',
        product: 'পণ্য',
        quantity: 'পরিমাণ',
        price: 'দাম',
        total: 'মোট',
        addItem: 'আইটেম যোগ করুন',
        subtotal: 'সাবটোটাল',
        gstTotal: 'মোট GST',
        totalAmount: 'মোট পরিমাণ',
        paidAmount: 'প্রদত্ত পরিমাণ',
        balanceAmount: 'বাকি পরিমাণ',
        invoiceDate: 'চালান তারিখ',
        selectCustomer: 'গ্রাহক নির্বাচন করুন',
        paymentHistory: 'পেমেন্ট ইতিহাস',
        download: 'ডাউনলড',
        share: 'শেয়ার',
        delete: 'মুছুন',
        edit: 'সম্পাদনা',
        language: 'ভাষা',
        selectLanguage: 'ভাষা নির্বাচন করুন',
        paymentDetails: 'পেমেন্ট বিবরণ',
        addPayment: 'পেমেন্ট/অগ্রিম যোগ করুন',
        invoiceItems: 'চালান আইটেম',
        addNewItem: 'নতুন আইটেম যোগ করুন',
        termsNotes: 'শর্তাবলী / নোট',
        selectProduct: 'পণ্য নির্বাচন করুন',
        enterAmount: 'পরিমাণ লিখুন',
        due: 'বাকি',
        removePayment: 'পেমেন্ট সরান',
        newClient: 'নতুন গ্রাহক',
        saveInvoice: 'চালান সংরক্ষণ করুন'
    },
    kn: {
        welcome: 'ಸ್ವಾಗತ',
        dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        invoices: 'ಇನ್‌ವಾಯ್ಸ್‌ಗಳು',
        customers: 'ಗ್ರಾಹಕರು',
        inventory: 'ದಾಸ್ತಾನು',
        reports: 'ವರದಿಗಳು',
        settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        newInvoice: 'ಹೊಸ ಇನ್‌ವಾಯ್ಸ್',
        addCustomer: 'ಗ್ರಾಹಕರನ್ನು ಸೇರಿಸಿ',
        addProduct: 'ಉತ್ಪನ್ನ ಸೇರಿಸಿ',
        viewReports: 'ವರದಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
        analyticsOverview: 'ವಿಶ್ಲೇಷಣೆ ಅವಲೋಕನ',
        businessOverview: 'ವ್ಯಾಪಾರ ಅವಲೋಕನ',
        todaysSales: 'ಇಂದಿನ ಮಾರಾಟ',
        totalRevenue: 'ಒಟ್ಟು ಆದಾಯ',
        lowStock: 'ಕಡಿಮೆ ಸ್ಟಾಕ್',
        setupBusiness: 'ವ್ಯಾಪಾರ ಸೆಟಪ್ ಮಾಡಿ',
        setupNow: 'ಸೆಟಪ್ ಮಾಡಿ',
        revenueAnalytics: 'ಆದಾಯ ವಿಶ್ಲೇಷಣೆ',
        topSellingProducts: 'ಅತಿ ಹೆಚ್ಚು ಮಾರಾಟವಾದವು',
        recentInvoices: 'ಇತ್ತೀಚಿನ ಇನ್‌ವಾಯ್ಸ್‌ಗಳು',
        weeklyPerformance: 'ವಾರದ ಕಾರ್ಯಕ್ಷಮತೆ',
        selectPeriod: 'ಅವಧಿ ಆಯ್ಕೆಮಾಡಿ',
        daily: 'ದೈನಂದಿನ',
        weekly: 'ವಾರದ',
        monthly: 'ಮಾಸಿಕ',
        yearly: 'ವಾರ್ಷಿಕ',
        search: 'ಹುಡುಕಿ...',
        goodMorning: 'ಶುಭೋದಯ',
        goodAfternoon: 'ಶುಭ ಮಧ್ಯಾಹ್ನ',
        goodEvening: 'ಶುಭ ಸಂಜೆ',
        gstin: 'GSTIN',
        phone: 'ದೂರವಾಣಿ',
        address: 'ವಿಳಾಸ',
        save: 'ಉಳಿಸಿ',
        cancel: 'ರದ್ದುಮಾಡಿ',
        actions: 'ಕ್ರಿಯೆಗಳು',
        status: 'ಸ್ಥಿತಿ',
        amount: 'ಮೊತ್ತ',
        date: 'ದಿನಾಂಕ',
        customer: 'ಗ್ರಾಹಕ',
        product: 'ಉತ್ಪನ್ನ',
        quantity: 'ಪ್ರಮಾಣ',
        price: 'ಬೆಲೆ',
        total: 'ಒಟ್ಟು',
        addItem: 'ಅಂಶ ಸೇರಿಸಿ',
        subtotal: 'ಉಪ ಮೊತ್ತ',
        gstTotal: 'ಒಟ್ಟು GST',
        totalAmount: 'ಒಟ್ಟು ಮೊತ್ತ',
        paidAmount: 'ಪಾವತಿಸಿದ ಮೊತ್ತ',
        balanceAmount: 'ಬಾಕಿ ಮೊತ್ತ',
        invoiceDate: 'ಇನ್‌ವಾಯ್ಸ್ ದಿನಾಂಕ',
        selectCustomer: 'ಗ್ರಾಹಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        paymentHistory: 'ಪಾವತಿ ಇತಿಹಾಸ',
        download: 'ಡೌನ್‌ಲೋಡ್',
        share: 'ಹಂಚಿಕೊಳ್ಳಿ',
        delete: 'ಅಳಿಸಿ',
        edit: 'ತಿದ್ದುಪಡಿ',
        language: 'ಭಾಷೆ',
        selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
        paymentDetails: 'ಪಾವತಿ ವಿವರಗಳು',
        addPayment: 'ಪಾವತಿ/ಮುಂಗಡ ಸೇರಿಸಿ',
        invoiceItems: 'ಇನ್‌ವಾಯ್ಸ್ ಇಟಂಗಳು',
        addNewItem: 'ಹೊಸ ಐಟಂ ಸೇರಿಸಿ',
        termsNotes: 'ನಿಯಮಗಳು / ಟಿಪ್ಪಣಿಗಳು',
        selectProduct: 'ಉತ್ಪನ್ನ ಆಯ್ಕೆಮಾಡಿ',
        enterAmount: 'ಮೊತ್ತ ನಮೂದಿಸಿ',
        due: 'ಬಾಕಿ',
        removePayment: 'ಪಾವತಿ ತೆಗೆದುಹಾಕಿ',
        newClient: 'ಹೊಸ ಗ್ರಾಹಕ',
        saveInvoice: 'ಇನ್‌ವಾಯ್ಸ್ ಉಳಿಸಿ'
    },
    ml: {
        welcome: 'സ്വാഗതം',
        dashboard: 'ഡാഷ്ബോർഡ്',
        invoices: 'ഇൻവോയ്സുകൾ',
        customers: 'ഉപഭോക്താക്കൾ',
        inventory: 'ഇൻവെന്ററി',
        reports: 'റിപ്പോർട്ടുകൾ',
        settings: 'ക്രമീകരണങ്ങൾ',
        newInvoice: 'പുതിയ ഇൻവോയ്സ്',
        addCustomer: 'ഉപഭോക്താവിനെ ചേർക്കുക',
        addProduct: 'ഉൽപ്പന്നം ചേർക്കുക',
        viewReports: 'റിപ്പോർട്ടുകൾ കാണുക',
        analyticsOverview: 'അനലിറ്റിക്സ് അവലോകനം',
        businessOverview: 'ബിസിനസ്സ് അവലോകനം',
        todaysSales: 'ഇന്നത്തെ വിൽപ്പന',
        totalRevenue: 'ആകെ വരുമാനം',
        lowStock: 'കുറഞ്ഞ സ്റ്റോക്ക്',
        setupBusiness: 'ബിസിനസ്സ് സജ്ജമാക്കുക',
        setupNow: 'സജ്ജമാക്കുക',
        revenueAnalytics: 'വരുമാന വിശകലനം',
        topSellingProducts: 'ഏറ്റവും കൂടുതൽ വിറ്റഴിക്കപ്പെടുന്നവ',
        recentInvoices: 'സമീപകാല ഇൻവോയ്സുകൾ',
        weeklyPerformance: 'പ്രതിവാര പ്രകടനം',
        selectPeriod: 'കാലയളവ് തിരഞ്ഞെടുക്കുക',
        daily: 'ദിവസേന',
        weekly: 'പ്രതിവാര',
        monthly: 'പ്രതിമാസ',
        yearly: 'വാർഷിക',
        search: 'തിരയുക...',
        goodMorning: 'ശുഭപ്രഭാതം',
        goodAfternoon: 'ശുഭ മദ്ധ്യാഹ്നം',
        goodEvening: 'ശുഭ സായാഹ്നം',
        gstin: 'GSTIN',
        phone: 'ഫോൺ',
        address: 'വിലാസം',
        save: 'സംരക്ഷിക്കുക',
        cancel: 'റദ്ദാക്കുക',
        actions: 'പ്രവർത്തനങ്ങൾ',
        status: 'അവസ്ഥ',
        amount: 'തുക',
        date: 'തീയതി',
        customer: 'ഉപഭോക്താവ്',
        product: 'ഉൽപ്പന്നം',
        quantity: 'അളവ്',
        price: 'വില',
        total: 'ആകെ',
        addItem: 'ഇനം ചേർക്കുക',
        subtotal: 'സബ്ടോട്ടൽ',
        gstTotal: 'ആകെ GST',
        totalAmount: 'ആകെ തുക',
        paidAmount: 'അടച്ച തുക',
        balanceAmount: 'ബാക്കി തുക',
        invoiceDate: 'ഇൻവോയ്സ് തീയതി',
        selectCustomer: 'ഉപഭോക്താവിനെ തിരഞ്ഞെടുക്കൂ',
        paymentHistory: 'പേയ്മെന്റ് ചരിത്രം',
        download: 'ഡൗൺലോഡ്',
        share: 'പങ്കിടുക',
        delete: 'നീക്കം ചെയ്യുക',
        edit: 'തിരുത്തുക',
        language: 'ഭാഷ',
        selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
        paymentDetails: 'പേയ്മെന്റ് വിവരങ്ങൾ',
        addPayment: 'പേയ്മെന്റ്/അഡ്വാൻസ് ചേർക്കുക',
        invoiceItems: 'ഇൻവോയ്സ് ഇനങ്ങൾ',
        addNewItem: 'പുതിയ ഇനം ചേർക്കുക',
        termsNotes: 'നിബന്ധനകൾ / കുറിപ്പുകൾ',
        selectProduct: 'ഉൽപ്പന്നം തിരഞ്ഞെടുക്കുക',
        enterAmount: 'തുക നൽകുക',
        due: 'കുടിശ്ശിക',
        removePayment: 'പേയ്മെന്റ് നീക്കം ചെയ്യുക',
        newClient: 'പുതിയ ഉപഭോക്താവ്',
        saveInvoice: 'ഇൻവോയ്സ് സംരക്ഷിക്കുക'
    },
    pa: {
        welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ',
        dashboard: 'ਡੈਸ਼ਬੋਰਡ',
        invoices: 'ਇਨਵੌਇਸ',
        customers: 'ਗਾਹਕ',
        inventory: 'ਸਟਾਕ',
        reports: 'ਰਿਪੋਰਟਾਂ',
        settings: 'ਸੈਟਿੰਗਾਂ',
        newInvoice: 'ਨਵਾਂ ਇਨਵੌਇਸ',
        addCustomer: 'ਗਾਹਕ ਸ਼ਾਮਲ ਕਰੋ',
        addProduct: 'ਉਤਪਾਦ ਸ਼ਾਮਲ ਕਰੋ',
        viewReports: 'ਰਿਪੋਰਟਾਂ ਦੇਖੋ',
        analyticsOverview: 'ਵਿਸ਼ਲੇਸ਼ਣ ਸੰਖੇਪ',
        businessOverview: 'ਕਾਰੋਬਾਰ ਸੰਖੇਪ',
        todaysSales: 'ਅੱਜ ਦੀ ਵਿਕਰੀ',
        totalRevenue: 'ਕੁੱਲ ਆਮਦਨ',
        lowStock: 'ਘੱਟ ਸਟਾਕ',
        setupBusiness: 'ਆਪਣਾ ਕਾਰੋਬਾਰ ਸੈੱਟ ਕਰੋ',
        setupNow: 'ਸੈੱਟ ਕਰੋ',
        revenueAnalytics: 'ਆਮਦਨ ਵਿਸ਼ਲੇਸ਼ਣ',
        topSellingProducts: 'ਸਭ ਤੋਂ ਵੱਧ ਵਿਕਣ ਵਾਲੇ ਉਤਪਾਦ',
        recentInvoices: 'ਹਾਲੀਆ ਇਨਵੌਇਸ',
        weeklyPerformance: 'ਹਫਤਾਵਾਰੀ ਕਾਰਗੁਜ਼ਾਰੀ',
        selectPeriod: 'ਸਮਾਂ ਚੁਣੋ',
        daily: 'ਰੋਜ਼ਾਨਾ',
        weekly: 'ਹਫਤਾਵਾਰੀ',
        monthly: 'ਮਹੀਨਾਵਾਰ',
        yearly: 'ਸਾਲਾਨਾ',
        search: 'ਖੋਜੋ...',
        goodMorning: 'ਸ਼ੁਭ ਸਵੇਰ',
        goodAfternoon: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ',
        goodEvening: 'ਸ਼ੁਭ ਸ਼ਾਮ',
        gstin: 'GSTIN',
        phone: 'ਫੋਨ',
        address: 'ਪਤਾ',
        save: 'ਸੇਵ ਕਰੋ',
        cancel: 'ਰੱਦ ਕਰੋ',
        actions: 'ਕਾਰਵਾਈ',
        status: 'ਸਥਿਤੀ',
        amount: 'ਰਕਮ',
        date: 'ਮਿਤੀ',
        customer: 'ਗਾਹਕ',
        product: 'ਉਤਪਾਦ',
        quantity: 'ਮਾਤਰਾ',
        price: 'ਕੀਮਤ',
        total: 'ਕੁੱਲ',
        addItem: 'ਆਈਟਮ ਸ਼ਾਮਲ ਕਰੋ',
        subtotal: 'ਉਪ ਕੁੱਲ',
        gstTotal: 'ਕੁੱਲ GST',
        totalAmount: 'ਕੁੱਲ ਰਕਮ',
        paidAmount: 'ਭੁਗਤਾਨ ਕੀਤੀ ਰਕਮ',
        balanceAmount: 'ਬਕਾਇਆ ਰਕਮ',
        invoiceDate: 'ਇਨਵੌਇਸ ਮਿਤੀ',
        selectCustomer: 'ਗਾਹਕ ਚੁਣੋ',
        paymentHistory: 'ਭੁਗਤਾਨ ਇਤਿਹਾਸ',
        download: 'ਡਾਊਨਲੋਡ',
        share: 'ਸਾਂਝਾ ਕਰੋ',
        delete: 'ਹਟਾਓ',
        edit: 'ਸੋਧੋ',
        language: 'ਭਾਸ਼ਾ',
        selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
        paymentDetails: 'ਭੁਗਤਾਨ ਵੇਰਵੇ',
        addPayment: 'ਭੁਗਤਾਨ/ਐਡਵਾਂਸ ਸ਼ਾਮਲ ਕਰੋ',
        invoiceItems: 'ਇਨਵੌਇਸ ਆਈਟਮਾਂ',
        addNewItem: 'ਨਵੀਂ ਆਈਟਮ ਸ਼ਾਮਲ ਕਰੋ',
        termsNotes: 'ਸ਼ਰਤਾਂ / ਨੋਟਸ',
        selectProduct: 'ਉਤਪਾਦ ਚੁਣੋ',
        enterAmount: 'ਰਕਮ ਭਰੋ',
        due: 'ਬਕਾਇਆ',
        removePayment: 'ਭੁਗਤਾਨ ਹਟਾਓ',
        newClient: 'ਨਵਾਂ ਗਾਹਕ',
        saveInvoice: 'ਇਨਵੌਇਸ ਸੇਵ ਕਰੋ'
    }
};
const languages = [
    {
        code: 'en',
        name: 'English',
        nativeName: 'English'
    },
    {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिंदी'
    },
    {
        code: 'gu',
        name: 'Gujarati',
        nativeName: 'ગુજરાતી'
    },
    {
        code: 'mr',
        name: 'Marathi',
        nativeName: 'मराठी'
    },
    {
        code: 'ta',
        name: 'Tamil',
        nativeName: 'தமிழ்'
    },
    {
        code: 'te',
        name: 'Telugu',
        nativeName: 'తెలుగు'
    },
    {
        code: 'bn',
        name: 'Bengali',
        nativeName: 'বাংলা'
    },
    {
        code: 'kn',
        name: 'Kannada',
        nativeName: 'ಕನ್ನಡ'
    },
    {
        code: 'ml',
        name: 'Malayalam',
        nativeName: 'മലയാളം'
    },
    {
        code: 'pa',
        name: 'Punjabi',
        nativeName: 'ਪੰਜਾਬੀ'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/bill/app/components/LanguageSelector.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LanguageSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/store.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/translations.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-icons/fa/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function LanguageSelector({ showLabel = true }) {
    _s();
    const { settings, updateSettings } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"])();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const currentLang = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["languages"].find((l)=>l.code === settings.language) || __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["languages"][0];
    const t = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translations"][settings.language] || __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translations"].en;
    const handleSelect = (code)=>{
        updateSettings({
            language: code
        });
        setIsOpen(false);
    };
    // Close on click outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LanguageSelector.useEffect": ()=>{
            const handleClickOutside = {
                "LanguageSelector.useEffect.handleClickOutside": (event)=>{
                    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                        setIsOpen(false);
                    }
                }
            }["LanguageSelector.useEffect.handleClickOutside"];
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "LanguageSelector.useEffect": ()=>document.removeEventListener('mousedown', handleClickOutside)
            })["LanguageSelector.useEffect"];
        }
    }["LanguageSelector.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full",
        ref: dropdownRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                className: `
                    w-full flex items-center justify-between gap-4 px-4 py-3 
                    bg-white text-slate-700 rounded-2xl transition-all duration-300
                    border-2 border-slate-200 shadow-[0_4px_0_0_#e2e8f0]
                    hover:-translate-y-1 hover:shadow-[0_8px_0_0_#cbd5e1] hover:text-indigo-600
                    active:translate-y-0 active:shadow-none
                    group
                `,
                title: t.selectLanguage,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaLanguage"], {
                                    size: 20,
                                    className: "group-hover:rotate-12 transition-transform"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                    lineNumber: 49,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                lineNumber: 48,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-start",
                                children: [
                                    showLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1",
                                        children: "Language"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                        lineNumber: 52,
                                        columnNumber: 39
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-bold tracking-wide",
                                        children: currentLang.nativeName
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                        lineNumber: 53,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                lineNumber: 51,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                        lineNumber: 47,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `text-slate-400 group-hover:text-indigo-500 transition-transform duration-300 ${isOpen ? 'rotate-180 scale-125' : ''}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-5 h-5 fill-current",
                            viewBox: "0 0 20 20",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                lineNumber: 58,
                                columnNumber: 79
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                            lineNumber: 58,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                        lineNumber: 57,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                lineNumber: 35,
                columnNumber: 13
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute left-0 top-full mt-2 w-72 max-h-[500px] overflow-y-auto    bg-white/95 backdrop-blur-2xl rounded-3xl    shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]    border border-white ring-1 ring-slate-900/5   z-[100] p-3 animate-in fade-in slide-in-from-top-6 duration-300 origin-top",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sticky top-0 bg-white/50 backdrop-blur-md p-4 border-b border-slate-100/50 mb-2 -mx-3 -mt-3 rounded-t-3xl z-10 flex justify-between items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-bold text-slate-500 uppercase tracking-widest",
                                children: t.selectLanguage
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                lineNumber: 71,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["languages"].length
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                lineNumber: 72,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                        lineNumber: 70,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["languages"].map((lang)=>{
                            const isSelected = settings.language === lang.code;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleSelect(lang.code),
                                className: `
                                        w-full text-left px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all 
                                        flex items-center justify-between group/item border 
                                        relative overflow-hidden
                                        ${isSelected ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/25' : 'bg-white/50 hover:bg-white text-slate-600 border-transparent hover:border-slate-200 hover:shadow-md hover:text-indigo-700'}
                                    `,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 relative z-10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-lg ${!isSelected && 'grayscale opacity-70 group-hover/item:grayscale-0 group-hover/item:opacity-100 transition-all'}`,
                                                children: lang.code === 'en' ? '🇬🇧' : lang.code === 'hi' ? '🇮🇳' : lang.code === 'gu' ? '🇮🇳' : '🇮🇳'
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                                lineNumber: 93,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold",
                                                        children: lang.nativeName
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                                        lineNumber: 100,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-[10px] uppercase tracking-wide font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-400 group-hover/item:text-indigo-400'}`,
                                                        children: lang.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                                        lineNumber: 101,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                                lineNumber: 99,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                        lineNumber: 92,
                                        columnNumber: 37
                                    }, this),
                                    isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-white/20 p-1 rounded-full relative z-10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaCheck"], {
                                            size: 10,
                                            className: "text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                            lineNumber: 109,
                                            columnNumber: 45
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                        lineNumber: 108,
                                        columnNumber: 41
                                    }, this)
                                ]
                            }, lang.code, true, {
                                fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                                lineNumber: 79,
                                columnNumber: 33
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                        lineNumber: 75,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
                lineNumber: 64,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/bill/app/components/LanguageSelector.tsx",
        lineNumber: 33,
        columnNumber: 9
    }, this);
}
_s(LanguageSelector, "YF4+9nREWs+vyJCSMQYtJEiZ1JE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"]
    ];
});
_c = LanguageSelector;
var _c;
__turbopack_context__.k.register(_c, "LanguageSelector");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RegistrationPopup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-icons/fa/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next-auth/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function RegistrationPopup() {
    _s();
    const { status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasClosed, setHasClosed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RegistrationPopup.useEffect": ()=>{
            // Hide if authenticated
            if (status === 'authenticated') return;
            // Check if user previously closed it in this session
            const closed = sessionStorage.getItem('register_popup_closed');
            if (closed) {
                setHasClosed(true);
                return;
            }
            const timer = setTimeout({
                "RegistrationPopup.useEffect.timer": ()=>{
                    if (!hasClosed) {
                        setIsVisible(true);
                    }
                }
            }["RegistrationPopup.useEffect.timer"], 120000); // 2 minutes (120,000 ms)
            return ({
                "RegistrationPopup.useEffect": ()=>clearTimeout(timer)
            })["RegistrationPopup.useEffect"];
        }
    }["RegistrationPopup.useEffect"], [
        hasClosed
    ]);
    const handleClose = ()=>{
        setIsVisible(false);
        setHasClosed(true);
        sessionStorage.setItem('register_popup_closed', 'true');
    };
    if (!isVisible || status === 'authenticated') return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-x-4 bottom-24 md:bottom-6 md:right-6 md:left-auto md:inset-x-auto z-[100] animate-slideUp max-w-[350px] mx-auto md:mx-0 w-full",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-3xl shadow-2xl shadow-indigo-200 border border-indigo-100 overflow-hidden relative",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleClose,
                    className: "absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaTimes"], {
                        size: 14
                    }, void 0, false, {
                        fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                        lineNumber: 47,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                    lineNumber: 43,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaUserPlus"], {
                                size: 20
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                                lineNumber: 52,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                            lineNumber: 51,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-bold text-slate-900 mb-2 italic",
                            children: "Account Banayein!"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                            lineNumber: 55,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-600 mb-6 leading-relaxed",
                            children: "Apna data hamesha ke liye safe rakhne ke liye register karein aur full features payein."
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                            lineNumber: 56,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/register",
                                    onClick: handleClose,
                                    className: "flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 italic",
                                    children: [
                                        "Register Karein ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaArrowRight"], {
                                            size: 12
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                                            lineNumber: 66,
                                            columnNumber: 45
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                                    lineNumber: 61,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleClose,
                                    className: "py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest",
                                    children: "Baad mein karenge"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                                    lineNumber: 68,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                            lineNumber: 60,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                    lineNumber: 50,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
            lineNumber: 42,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
        lineNumber: 41,
        columnNumber: 9
    }, this);
}
_s(RegistrationPopup, "FtKO28LBsJJiQUDLDmNpLhaTT/A=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"]
    ];
});
_c = RegistrationPopup;
var _c;
__turbopack_context__.k.register(_c, "RegistrationPopup");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/bill/app/dashboard/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next-auth/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-icons/fa/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/store.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$app$2f$components$2f$LanguageSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/app/components/LanguageSelector.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/translations.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$app$2f$dashboard$2f$RegistrationPopup$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
function DashboardLayout({ children }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [isSidebarOpen, setIsSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isMounted, setIsMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Get store values
    const { businessProfile, resetStore, settings } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardLayout.useEffect": ()=>{
            setIsMounted(true);
        }
    }["DashboardLayout.useEffect"], []);
    if (!isMounted) return null;
    // Get current translations based on store setting
    const t = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translations"][settings.language] || __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translations"].en;
    const menuItems = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaFileInvoice"],
            label: t.invoices,
            href: '/dashboard/invoices'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaReceipt"],
            label: 'Tax Invoice',
            href: '/dashboard/invoices/new?type=TAX_INVOICE'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaReceipt"],
            label: 'Bill of Supply',
            href: '/dashboard/invoices/new?type=BILL_OF_SUPPLY'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaReceipt"],
            label: 'Delivery Challan',
            href: '/dashboard/invoices/new?type=DELIVERY_CHALLAN'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaReceipt"],
            label: 'E-Way Bill',
            href: '/dashboard/invoices/new?type=E_WAY_BILL'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaUsers"],
            label: t.customers,
            href: '/dashboard/customers'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaBox"],
            label: t.inventory,
            href: '/dashboard/inventory'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaChartBar"],
            label: t.reports,
            href: '/dashboard/reports'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaCog"],
            label: t.settings,
            href: '/dashboard/settings'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaSignInAlt"],
            label: 'Login',
            href: '/login',
            isAuth: true
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaUserPlus"],
            label: 'Sign Up',
            href: '/register',
            isAuth: true
        }
    ];
    const handleLogout = ()=>{
        resetStore();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signOut"])({
            callbackUrl: '/login'
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#f1f5f9] flex",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: `fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0 shadow-2xl md:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full flex flex-col",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/dashboard",
                                    className: "flex items-center gap-3 group",
                                    onClick: ()=>setIsSidebarOpen(false),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow",
                                            children: businessProfile.logo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: businessProfile.logo,
                                                alt: "Logo",
                                                fill: true,
                                                className: "object-cover"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                lineNumber: 79,
                                                columnNumber: 37
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaStore"], {
                                                    className: "text-white text-lg"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                    lineNumber: 87,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                lineNumber: 86,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                            lineNumber: 77,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                    className: "text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent",
                                                    children: "BillGST"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                    lineNumber: 92,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-slate-500 font-semibold tracking-wider uppercase",
                                                    children: "Professional Billing"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                    lineNumber: 95,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                            lineNumber: 91,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                    lineNumber: 76,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsSidebarOpen(false),
                                    className: "md:hidden p-2 text-slate-400 hover:text-red-500 transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaTimes"], {
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                        lineNumber: 102,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                    lineNumber: 98,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                            lineNumber: 75,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            className: "flex-1 px-4 py-6 space-y-4 overflow-y-auto",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex px-1",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$app$2f$components$2f$LanguageSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        showLabel: true
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                        lineNumber: 110,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                    lineNumber: 109,
                                    columnNumber: 25
                                }, this),
                                menuItems.filter((item)=>!item.isAuth).map((item)=>{
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: item.href,
                                        onClick: ()=>setIsSidebarOpen(false),
                                        className: `
                                        flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group 
                                        border-2 relative overflow-hidden
                                        ${isActive ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold border-indigo-700 shadow-[0_6px_0_0_#4338ca] -translate-y-1' : 'bg-white text-slate-600 font-semibold border-slate-200 shadow-[0_4px_0_0_#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#cbd5e1] hover:text-indigo-600 hover:border-indigo-200 hover:scale-105 active:translate-y-0 active:shadow-none active:scale-95'}
                                    `,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `
                                        p-2.5 rounded-xl transition-all duration-300 relative z-10
                                        ${isActive ? 'bg-white/20 text-white shadow-inner' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110'}
                                    `,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                    className: `text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:rotate-12'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                    lineNumber: 137,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                lineNumber: 130,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-base tracking-wide flex-1 relative z-10",
                                                children: item.label
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                lineNumber: 139,
                                                columnNumber: 37
                                            }, this),
                                            isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute right-4 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse z-10"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                        lineNumber: 144,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shine pointer-events-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                        lineNumber: 145,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        ]
                                    }, item.href, true, {
                                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                        lineNumber: 117,
                                        columnNumber: 33
                                    }, this);
                                }),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pt-6 mt-6 border-t border-slate-200 space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2",
                                            children: "Account Actions"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                            lineNumber: 154,
                                            columnNumber: 29
                                        }, this),
                                        menuItems.filter((item)=>item.isAuth).map((item)=>{
                                            const Icon = item.icon;
                                            const isActive = pathname === item.href;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: item.href,
                                                onClick: ()=>setIsSidebarOpen(false),
                                                className: `
                                            flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group 
                                            border-2 relative overflow-hidden
                                            ${isActive ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold border-emerald-700 shadow-[0_6px_0_0_#047857] -translate-y-1' : 'bg-white text-slate-600 font-semibold border-slate-200 shadow-[0_4px_0_0_#e2e8f0] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#cbd5e1] hover:text-indigo-600 hover:border-indigo-200 hover:scale-105 active:translate-y-0 active:shadow-none active:scale-95'}
                                        `,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `
                                            p-2.5 rounded-xl transition-all duration-300 relative z-10
                                            ${isActive ? 'bg-white/20 text-white shadow-inner' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110'}
                                        `,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                            className: `text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:rotate-12'}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                            lineNumber: 179,
                                                            columnNumber: 45
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                        lineNumber: 172,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-base tracking-wide flex-1 relative z-10",
                                                        children: item.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                        lineNumber: 181,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, item.href, true, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                lineNumber: 159,
                                                columnNumber: 37
                                            }, this);
                                        })
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                    lineNumber: 153,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                            lineNumber: 107,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white",
                                            children: businessProfile.logo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: businessProfile.logo,
                                                alt: "Business Logo",
                                                width: 48,
                                                height: 48,
                                                className: "object-cover w-full h-full"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                lineNumber: 193,
                                                columnNumber: 37
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-lg",
                                                children: businessProfile.name?.charAt(0) || 'B'
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                lineNumber: 201,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                            lineNumber: 191,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-bold text-slate-800 truncate",
                                                    children: businessProfile.name || 'Your Business'
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                    lineNumber: 205,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-slate-500 truncate font-medium bg-slate-100 inline-block px-2 py-0.5 rounded-full mt-1",
                                                    children: businessProfile.gstin || t.setupBusiness
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                    lineNumber: 206,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                            lineNumber: 204,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                    lineNumber: 190,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleLogout,
                                    className: "mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100/80 rounded-xl transition-all border border-red-100 shadow-sm hover:shadow group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaSignOutAlt"], {
                                            className: "group-hover:-translate-x-1 transition-transform"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                            lineNumber: 216,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: t.welcome === 'स्वागत है' ? 'सुरक्षित लॉगआउट' : 'Logout Safe'
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                            lineNumber: 217,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                    lineNumber: 212,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                            lineNumber: 189,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                    lineNumber: 73,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                lineNumber: 69,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-500 shadow-lg border-b border-white/10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between h-12 md:h-16",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/dashboard",
                                            className: "flex items-center gap-2 md:gap-3 group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden shadow-md border-2 border-white/30 group-hover:border-white/60 transition-all flex-shrink-0 bg-white/10 backdrop-blur-sm",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        src: "/logo.png",
                                                        alt: "BillGST Logo",
                                                        fill: true,
                                                        className: "object-cover",
                                                        onError: (e)=>{
                                                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E";
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                        lineNumber: 233,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                    lineNumber: 232,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                            className: "text-sm md:text-lg font-bold text-white tracking-tight leading-none group-hover:text-indigo-100 transition-colors drop-shadow-sm",
                                                            children: businessProfile.name || 'BillGST'
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                            lineNumber: 244,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-indigo-100/90 font-medium hidden md:block",
                                                            children: "Professional Billing"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                            lineNumber: 247,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                    lineNumber: 243,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                            lineNumber: 231,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                        lineNumber: 230,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 md:gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "hidden sm:flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white rounded-full text-xs font-semibold border border-white/20 backdrop-blur-md shadow-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-green-400/50 shadow-lg"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                        lineNumber: 255,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        suppressHydrationWarning: true,
                                                        children: new Date().toLocaleDateString('en-IN', {
                                                            weekday: 'short',
                                                            day: 'numeric',
                                                            month: 'short'
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                        lineNumber: 257,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                lineNumber: 254,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleLogout,
                                                className: "hidden md:flex items-center justify-center w-10 h-10 text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all",
                                                title: "Logout",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaSignOutAlt"], {}, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                    lineNumber: 267,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                lineNumber: 262,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setIsSidebarOpen(true),
                                                className: "md:hidden flex items-center justify-center w-9 h-9 text-white hover:bg-white/20 rounded-lg transition-all border border-white/30 shadow-sm active:scale-95 backdrop-blur-md",
                                                "aria-label": "Open Menu",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaBars"], {
                                                    size: 18
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                    lineNumber: 276,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                                lineNumber: 271,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                        lineNumber: 253,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                                lineNumber: 228,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                            lineNumber: 227,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                        lineNumber: 226,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 p-4 md:p-8 scroll-smooth overflow-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-w-7xl mx-auto animate-fadeIn",
                            children: children
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                            lineNumber: 285,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                        lineNumber: 284,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                lineNumber: 224,
                columnNumber: 13
            }, this),
            isSidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300",
                onClick: ()=>setIsSidebarOpen(false)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                lineNumber: 293,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$app$2f$dashboard$2f$RegistrationPopup$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
                lineNumber: 298,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/bill/app/dashboard/layout.tsx",
        lineNumber: 67,
        columnNumber: 9
    }, this);
}
_s(DashboardLayout, "lwG1JsTU3fhJOi4RLT+vBOlTFIU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"]
    ];
});
_c = DashboardLayout;
var _c;
__turbopack_context__.k.register(_c, "DashboardLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_bill_5929eee2._.js.map