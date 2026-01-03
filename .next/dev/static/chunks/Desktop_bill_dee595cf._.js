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
"[project]/Desktop/bill/app/components/Navbar3D.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navbar3D
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-icons/fa/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next-auth/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/store.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$app$2f$components$2f$LanguageSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/app/components/LanguageSelector.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/translations.js [app-client] (ecmascript)");
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
function Navbar3D() {
    _s();
    const { status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [isSidebarOpen, setIsSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isScrolled, setIsScrolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { businessProfile, settings, resetStore } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar3D.useEffect": ()=>{
            const handleScroll = {
                "Navbar3D.useEffect.handleScroll": ()=>{
                    setIsScrolled(window.scrollY > 20);
                }
            }["Navbar3D.useEffect.handleScroll"];
            window.addEventListener('scroll', handleScroll);
            return ({
                "Navbar3D.useEffect": ()=>window.removeEventListener('scroll', handleScroll)
            })["Navbar3D.useEffect"];
        }
    }["Navbar3D.useEffect"], []);
    const t = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translations"][settings.language] || __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translations"].en;
    const menuItems = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaLanguage"],
            label: 'Language',
            href: '#',
            isLanguage: true
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaCog"],
            label: 'Setting',
            href: '/dashboard/settings'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaFileInvoice"],
            label: 'Invoice',
            href: '/dashboard/invoices'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaSignInAlt"],
            label: 'Login Page',
            href: '/login'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaUserPlus"],
            label: 'Signup Page',
            href: '/register'
        }
    ];
    const handleLogout = ()=>{
        resetStore();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signOut"])({
            callbackUrl: '/'
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: `fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-500 shadow-lg py-2 md:py-3 border-b border-white/10' : 'bg-transparent py-4 md:py-6'}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: "flex items-center gap-2 md:gap-3 group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden shadow-md border-2 border-white/30 group-hover:border-white/60 transition-all flex-shrink-0 bg-white p-1",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: "/logo.png",
                                                alt: "BillGST Logo",
                                                width: 40,
                                                height: 40,
                                                className: "object-contain"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                                lineNumber: 61,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                            lineNumber: 60,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: `text-sm md:text-xl font-bold tracking-tight leading-none group-hover:text-indigo-100 transition-colors drop-shadow-sm ${isScrolled ? 'text-white' : 'text-indigo-900'}`,
                                                    children: "BillGST"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                                    lineNumber: 70,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: `text-[10px] font-bold uppercase tracking-wider hidden md:block ${isScrolled ? 'text-indigo-100/90' : 'text-slate-500'}`,
                                                    children: "Professional Billing"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                                    lineNumber: 74,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                            lineNumber: 69,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                    lineNumber: 59,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                lineNumber: 58,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 md:gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "hidden md:flex items-center gap-4",
                                        children: status === 'authenticated' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/dashboard",
                                            className: "bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold hover:bg-slate-50 transition shadow-lg",
                                            children: "Dashboard"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                            lineNumber: 85,
                                            columnNumber: 37
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/login",
                                                    className: `text-sm font-bold transition-colors ${isScrolled ? 'text-white' : 'text-slate-700 hover:text-indigo-600'}`,
                                                    children: "Login"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                                    lineNumber: 93,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/register",
                                                    className: "bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg",
                                                    children: "Register Free"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                                    lineNumber: 100,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                        lineNumber: 83,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setIsSidebarOpen(true),
                                        className: `flex items-center justify-center w-10 h-10 rounded-xl transition-all border-2 active:scale-95 shadow-lg ${isScrolled ? 'bg-white/10 text-white border-white/30 hover:bg-white/20' : 'bg-white text-indigo-600 border-indigo-100 hover:bg-slate-50'}`,
                                        "aria-label": "Open Menu",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaBars"], {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                            lineNumber: 118,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                        lineNumber: 110,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                lineNumber: 81,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                        lineNumber: 56,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                    lineNumber: 55,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                lineNumber: 51,
                columnNumber: 13
            }, this),
            isSidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] transition-opacity duration-300",
                onClick: ()=>setIsSidebarOpen(false)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                lineNumber: 127,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: `fixed inset-y-0 right-0 z-[120] w-72 md:w-80 bg-white transform transition-transform duration-300 ease-in-out shadow-[-20px_0_50px_rgba(0,0,0,0.1)] ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full flex flex-col",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 border-b border-slate-100 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaStore"], {
                                                className: "text-white text-lg"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                                lineNumber: 143,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                            lineNumber: 142,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-lg font-bold text-slate-800",
                                            children: "Menu"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                            lineNumber: 145,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                    lineNumber: 141,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsSidebarOpen(false),
                                    className: "p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaTimes"], {
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                        lineNumber: 151,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                    lineNumber: 147,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                            lineNumber: 140,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            className: "flex-1 px-4 py-6 space-y-4 overflow-y-auto",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2",
                                            children: "Language / भाषा"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                            lineNumber: 158,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-slate-50 p-2 rounded-2xl border-2 border-slate-100 shadow-[0_4px_0_0_#e2e8f0]",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$app$2f$components$2f$LanguageSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                showLabel: true
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                                lineNumber: 160,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                            lineNumber: 159,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, "language", true, {
                                    fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                    lineNumber: 157,
                                    columnNumber: 25
                                }, this),
                                [
                                    {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaFileInvoice"],
                                        label: 'Invoice',
                                        href: '/dashboard/invoices'
                                    },
                                    {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaUsers"],
                                        label: 'Customer',
                                        href: '/dashboard/customers'
                                    },
                                    {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaBox"],
                                        label: 'Product',
                                        href: '/dashboard/inventory'
                                    },
                                    {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaChartLine"],
                                        label: 'Report',
                                        href: '/dashboard/reports'
                                    },
                                    {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaCog"],
                                        label: 'Setting',
                                        href: '/dashboard/settings'
                                    },
                                    {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaSignInAlt"],
                                        label: 'Login',
                                        href: '/login'
                                    },
                                    {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaUserPlus"],
                                        label: 'Register',
                                        href: '/register'
                                    }
                                ].map((item)=>{
                                    const Icon = item.icon;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: item.href,
                                        onClick: ()=>setIsSidebarOpen(false),
                                        className: `
                                        flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group 
                                        border-2 relative overflow-hidden bg-white text-slate-600 font-semibold 
                                        border-slate-200 shadow-[0_4px_0_0_#e2e8f0] 
                                        hover:-translate-y-1 hover:shadow-[0_8px_0_0_#cbd5e1] 
                                        hover:text-indigo-600 hover:border-indigo-200 
                                        active:translate-y-0 active:shadow-none active:scale-95
                                    `,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2.5 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors group-hover:scale-110",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                    className: "text-xl transition-transform duration-300 group-hover:rotate-12"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                                    lineNumber: 189,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                                lineNumber: 188,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-base tracking-wide flex-1",
                                                children: item.label
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                                lineNumber: 191,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, item.href, true, {
                                        fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                        lineNumber: 175,
                                        columnNumber: 33
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                            lineNumber: 156,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 border-t border-slate-100",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/settings",
                                onClick: ()=>setIsSidebarOpen(false),
                                className: "flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group border-2 bg-indigo-50 text-indigo-700 font-bold border-indigo-100 shadow-[0_4px_0_0_#e0e7ff] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#c7d2fe] active:translate-y-0 active:shadow-none",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-xl bg-white text-indigo-600 shadow-sm",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaStore"], {
                                            className: "text-lg"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                            lineNumber: 205,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                        lineNumber: 204,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col flex-1 overflow-hidden",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] uppercase tracking-widest text-indigo-400 font-black",
                                                children: "My Business"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                                lineNumber: 208,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm truncate font-bold",
                                                children: businessProfile.name || 'Set Business Name'
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                                lineNumber: 209,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                        lineNumber: 207,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                lineNumber: 199,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                            lineNumber: 198,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 bg-slate-50/50",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] text-center text-slate-400 font-medium italic",
                                children: [
                                    businessProfile.name || 'BillGST',
                                    " - Professional Billing"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                                lineNumber: 216,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                            lineNumber: 215,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                    lineNumber: 138,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/components/Navbar3D.tsx",
                lineNumber: 134,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
_s(Navbar3D, "1KMphFeUd3Pb4ZAYGNqr7ApJPeM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"]
    ];
});
_c = Navbar3D;
var _c;
__turbopack_context__.k.register(_c, "Navbar3D");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/bill/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LandingPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-icons/fa/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/chart/AreaChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/cartesian/Area.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/chart/BarChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/cartesian/Bar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/store.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/translations.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next-auth/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-hot-toast/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$app$2f$components$2f$Navbar3D$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/app/components/Navbar3D.tsx [app-client] (ecmascript)");
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
function LandingPage() {
    _s();
    const { data: session, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { invoices, customers, products, businessProfile, settings, getAnalytics, getTopProducts, fetchCustomers, fetchProducts, fetchInvoices } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"])();
    const [isClient, setIsClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [period, setPeriod] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('monthly');
    const [customRange, setCustomRange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        start: '',
        end: ''
    });
    const [showSetupBanner, setShowSetupBanner] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Date());
    // Get translations
    const t = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translations"][settings.language] || __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translations"].en;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LandingPage.useEffect": ()=>{
            setIsClient(true);
            // Setup Banner State
            const bannerDismissed = localStorage.getItem('setupBannerDismissed');
            if (bannerDismissed) setShowSetupBanner(false);
            // Live Clock
            const timer = setInterval({
                "LandingPage.useEffect.timer": ()=>setCurrentTime(new Date())
            }["LandingPage.useEffect.timer"], 1000);
            // Load Data from DB
            fetchCustomers();
            fetchProducts();
            fetchInvoices();
            return ({
                "LandingPage.useEffect": ()=>clearInterval(timer)
            })["LandingPage.useEffect"];
        }
    }["LandingPage.useEffect"], []);
    const handleProtectedAction = (path)=>{
        if (status === 'authenticated') {
            router.push(path);
        } else {
            __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Please Login or Register to access this feature', {
                icon: '🔒',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff'
                }
            });
            router.push('/login');
        }
    };
    if (!isClient) return null;
    // Get Analytics Data
    const { totalSales, totalProfit, invoiceCount } = getAnalytics(period, customRange);
    const topProducts = getTopProducts() || [];
    const lowStockItems = (products || []).filter((p)=>p.stock_quantity < (p.low_stock_alert || 10)).length;
    // Get current time greeting
    const getGreeting = ()=>{
        const hour = new Date().getHours();
        if (hour < 12) return t.goodMorning;
        if (hour < 17) return t.goodAfternoon;
        return t.goodEvening;
    };
    // Weekly Sales Data for Bar Chart
    const weeklyData = [
        {
            name: 'Mon',
            sales: totalSales * 0.12,
            profit: totalProfit * 0.10
        },
        {
            name: 'Tue',
            sales: totalSales * 0.18,
            profit: totalProfit * 0.15
        },
        {
            name: 'Wed',
            sales: totalSales * 0.15,
            profit: totalProfit * 0.12
        },
        {
            name: 'Thu',
            sales: totalSales * 0.22,
            profit: totalProfit * 0.20
        },
        {
            name: 'Fri',
            sales: totalSales * 0.25,
            profit: totalProfit * 0.28
        },
        {
            name: 'Sat',
            sales: totalSales * 0.05,
            profit: totalProfit * 0.08
        },
        {
            name: 'Sun',
            sales: totalSales * 0.03,
            profit: totalProfit * 0.07
        }
    ];
    // Monthly Trend Data
    const monthlyTrend = [
        {
            name: 'Jan',
            sales: totalSales * 0.6,
            profit: totalProfit * 0.5
        },
        {
            name: 'Feb',
            sales: totalSales * 0.7,
            profit: totalProfit * 0.6
        },
        {
            name: 'Mar',
            sales: totalSales * 0.8,
            profit: totalProfit * 0.7
        },
        {
            name: 'Apr',
            sales: totalSales * 0.9,
            profit: totalProfit * 0.85
        },
        {
            name: 'May',
            sales: totalSales * 0.95,
            profit: totalProfit * 0.9
        },
        {
            name: 'Jun',
            sales: totalSales,
            profit: totalProfit
        }
    ];
    // Calculate Today's Sales
    const today = new Date().toDateString();
    const todaySales = invoices.filter((inv)=>new Date(inv.invoice_date).toDateString() === today).reduce((acc, inv)=>acc + (parseFloat(inv.total_amount) || 0), 0);
    const stats = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaRupeeSign"],
            label: t.todaysSales,
            value: todaySales,
            formattedValue: `₹${todaySales >= 100000 ? (todaySales / 100000).toFixed(1) + 'L' : todaySales.toLocaleString('en-IN')}`,
            subtext: 'vs Yesterday',
            color: 'from-blue-500 to-indigo-600',
            shadow: 'shadow-blue-500/20',
            trend: 'Now',
            trendUp: true,
            href: '/dashboard/reports?period=daily'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaChartLine"],
            label: t.totalRevenue,
            value: totalSales,
            formattedValue: `₹${totalSales >= 100000 ? (totalSales / 100000).toFixed(1) + 'L' : totalSales.toLocaleString('en-IN')}`,
            subtext: `${period === 'daily' ? t.daily : period === 'weekly' ? t.weekly : period === 'monthly' ? t.monthly : t.yearly} Sales`,
            color: 'from-violet-500 to-purple-600',
            shadow: 'shadow-violet-500/20',
            trend: '+12%',
            trendUp: true,
            href: '/dashboard/reports'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaFileInvoice"],
            label: t.invoices,
            value: invoiceCount,
            formattedValue: invoiceCount.toString(),
            subtext: 'Generated',
            color: 'from-emerald-500 to-teal-600',
            shadow: 'shadow-emerald-500/20',
            trend: '+5',
            trendUp: true,
            href: '/dashboard/invoices'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaBox"],
            label: t.lowStock,
            value: lowStockItems,
            formattedValue: lowStockItems.toString(),
            subtext: 'Items Alert',
            color: lowStockItems > 0 ? 'from-red-500 to-rose-600' : 'from-amber-500 to-orange-600',
            shadow: lowStockItems > 0 ? 'shadow-red-500/20' : 'shadow-amber-500/20',
            trend: lowStockItems > 0 ? '⚠️' : '✓',
            trendUp: lowStockItems === 0,
            href: '/dashboard/inventory'
        }
    ];
    // Quick Action Items
    const quickActions = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaReceipt"],
            label: t.newInvoice,
            href: '/dashboard/invoices/new',
            color: 'bg-indigo-500 hover:bg-indigo-600'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaUserPlus"],
            label: t.addCustomer,
            href: '/dashboard/customers',
            color: 'bg-emerald-500 hover:bg-emerald-600'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaBoxOpen"],
            label: t.addProduct,
            href: '/dashboard/inventory',
            color: 'bg-violet-500 hover:bg-violet-600'
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaChartLine"],
            label: t.viewReports,
            href: '/dashboard/reports',
            color: 'bg-amber-500 hover:bg-amber-600'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$app$2f$components$2f$Navbar3D$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/Desktop/bill/app/page.tsx",
                lineNumber: 167,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                style: {
                    paddingTop: '40px'
                },
                className: "pb-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-8 md:space-y-10 px-4 md:px-0 py-6 max-w-7xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col md:flex-row md:items-center justify-between gap-4 py-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 mb-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaClock"], {
                                                    className: "text-amber-500 text-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 174,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs md:text-sm text-gray-500 font-bold bg-white px-5 py-1.5 rounded-full border border-gray-100 shadow-sm flex items-center justify-center gap-2 min-w-[160px]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            suppressHydrationWarning: true,
                                                            className: "truncate",
                                                            children: currentTime.toLocaleDateString('en-IN', {
                                                                weekday: 'short',
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 176,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "w-1 h-1 bg-gray-300 rounded-full mx-1 flex-shrink-0"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 179,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            suppressHydrationWarning: true,
                                                            className: "whitespace-nowrap",
                                                            children: currentTime.toLocaleTimeString('en-IN', {
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 180,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 175,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 173,
                                            columnNumber: 15
                                        }, this),
                                        status === 'authenticated' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-2xl md:text-3xl font-bold text-gray-800",
                                            children: [
                                                getGreeting(),
                                                ", ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-amber-500",
                                                    children: businessProfile.name || 'Owner'
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 187,
                                                    columnNumber: 36
                                                }, this),
                                                "! 👋"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 186,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-2xl md:text-3xl font-bold text-gray-800",
                                            children: [
                                                "Welcome to ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-indigo-600",
                                                    children: "BillGST"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 191,
                                                    columnNumber: 30
                                                }, this),
                                                "! 🚀"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 190,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 172,
                                    columnNumber: 13
                                }, this),
                                status !== 'authenticated' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>router.push('/login'),
                                    className: "flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg font-bold",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaSignInAlt"], {}, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 200,
                                            columnNumber: 17
                                        }, this),
                                        " Login / Register"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 196,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/page.tsx",
                            lineNumber: 171,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-2xl p-4 md:p-8 shadow-lg border border-slate-200",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6",
                                children: quickActions.map((action, index)=>{
                                    const Icon = action.icon;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleProtectedAction(action.href),
                                        className: `${action.color} text-white rounded-2xl p-4 md:p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 shadow-lg min-h-[100px] md:min-h-[120px] border-2 border-white/30 w-full`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-3 md:p-4 bg-white/20 rounded-xl backdrop-blur-sm",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                    className: "text-xl md:text-2xl"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 217,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 216,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm md:text-base font-bold text-center",
                                                children: action.label
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 219,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                        lineNumber: 211,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/page.tsx",
                            lineNumber: 206,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 md:p-8 shadow-xl mx-4 md:mx-0 text-center flex flex-col items-center justify-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl md:text-3xl font-bold text-white tracking-wide",
                                    children: t.analyticsOverview
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 228,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm md:text-base text-indigo-100 font-medium mt-1",
                                    children: "Track your business performance"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 229,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/page.tsx",
                            lineNumber: 227,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-2xl p-4 md:p-5 shadow-lg border border-slate-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs md:text-sm font-bold text-slate-800 mb-3 text-center",
                                    children: [
                                        t.selectPeriod,
                                        ":"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 234,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-2 md:gap-3 flex-wrap justify-center",
                                    children: [
                                        {
                                            key: 'daily',
                                            label: t.daily,
                                            activeColor: 'from-blue-500 to-cyan-500'
                                        },
                                        {
                                            key: 'weekly',
                                            label: t.weekly,
                                            activeColor: 'from-purple-500 to-pink-500'
                                        },
                                        {
                                            key: 'monthly',
                                            label: t.monthly,
                                            activeColor: 'from-indigo-500 to-violet-500'
                                        },
                                        {
                                            key: 'yearly',
                                            label: t.yearly,
                                            activeColor: 'from-emerald-500 to-teal-500'
                                        },
                                        {
                                            key: 'custom',
                                            label: 'Custom',
                                            activeColor: 'from-orange-500 to-amber-500'
                                        }
                                    ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setPeriod(item.key),
                                            className: `flex-1 min-w-[70px] px-3 md:px-5 py-2.5 md:py-3 rounded-xl text-[11px] md:text-sm font-bold transition-all duration-300 ${period === item.key ? `bg-gradient-to-r ${item.activeColor} text-white shadow-lg scale-105` : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'}`,
                                            children: item.label
                                        }, item.key, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 243,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 235,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/page.tsx",
                            lineNumber: 233,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 md:p-8 shadow-lg border border-slate-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-base md:text-lg font-bold text-slate-700 mb-5 md:mb-6 px-4 text-center",
                                    children: t.businessOverview
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 259,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2",
                                    children: stats.map((stat, index)=>{
                                        const Icon = stat.icon;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleProtectedAction(stat.href),
                                            className: "bg-white rounded-2xl p-4 md:p-5 shadow-md border border-slate-100 hover:shadow-xl transition-all duration-300 group min-h-[120px] flex flex-col items-center justify-center text-center hover:scale-[1.02] w-full",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg mb-3 transform group-hover:scale-110 transition-transform`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                        className: "text-xl"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 270,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 269,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-slate-500 text-[10px] md:text-xs font-bold uppercase mb-1 px-1",
                                                    children: stat.label
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 272,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xl md:text-2xl font-extrabold text-slate-800 mb-1",
                                                    children: status === 'authenticated' ? stat.formattedValue : '---'
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 275,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1.5 mt-auto",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stat.trendUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`,
                                                        children: status === 'authenticated' ? stat.trend : 'Login'
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 279,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 278,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, index, true, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 264,
                                            columnNumber: 19
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 260,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/page.tsx",
                            lineNumber: 258,
                            columnNumber: 11
                        }, this),
                        status !== 'authenticated' && showSetupBanner ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-r from-orange-500 to-red-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl shadow-orange-500/20 animate-slideUp relative mx-4 md:mx-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setShowSetupBanner(false);
                                    },
                                    className: "absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors",
                                    "aria-label": "Close banner",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaTimes"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                        lineNumber: 297,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 292,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col md:flex-row items-center gap-3 md:gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-3 bg-white/20 rounded-xl backdrop-blur-sm",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaLock"], {
                                                        className: "text-2xl"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 302,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 301,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                            className: "text-lg md:text-xl font-bold",
                                                            children: "Create Your Account"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 305,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-orange-100 text-sm mt-0.5",
                                                            children: "Register now to start managing your invoices & inventory."
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 306,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 304,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 300,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/login",
                                            className: "px-8 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition shadow-lg text-base md:text-sm whitespace-nowrap min-w-[160px] text-center",
                                            children: "Register Now"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 309,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 299,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/page.tsx",
                            lineNumber: 291,
                            columnNumber: 13
                        }, this) : !businessProfile.gstin && showSetupBanner && status === 'authenticated' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl shadow-indigo-500/20 animate-slideUp relative mx-4 md:mx-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 md:gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2.5 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaStore"], {
                                                    className: "text-lg md:text-2xl"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 320,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 319,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-base md:text-xl font-bold",
                                                        children: t.setupBusiness
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 323,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-indigo-100 text-xs md:text-sm mt-0.5",
                                                        children: "Add GSTIN and details to start invoicing."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 324,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 322,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                        lineNumber: 318,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/dashboard/settings",
                                        className: "px-4 md:px-6 py-2 bg-white text-indigo-600 font-bold rounded-lg md:rounded-xl hover:bg-indigo-50 transition shadow-lg text-xs md:text-sm whitespace-nowrap",
                                        children: t.setupNow
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                        lineNumber: 327,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 317,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/page.tsx",
                            lineNumber: 316,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-white rounded-2xl shadow-soft border border-slate-100 p-6 md:p-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2 px-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-center sm:text-left w-full sm:w-auto",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                            className: "text-sm md:text-lg font-bold text-slate-800 text-center sm:text-left",
                                                            children: t.revenueAnalytics
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 341,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] md:text-xs text-slate-500 font-medium",
                                                            children: "Income vs Profit trends"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 342,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 340,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-center gap-3 text-[9px] md:text-xs bg-slate-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg self-center sm:self-auto",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "w-2 h-2 rounded-full bg-indigo-500"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 346,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-slate-600 font-medium",
                                                                    children: "Sales"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 347,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 345,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "w-2 h-2 rounded-full bg-emerald-500"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 350,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-slate-600 font-medium",
                                                                    children: "Profit"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 351,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 349,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 344,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 339,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-[200px] md:h-[280px] w-full px-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                                width: "100%",
                                                height: "100%",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AreaChart"], {
                                                    data: monthlyTrend,
                                                    margin: {
                                                        right: 20,
                                                        left: -20,
                                                        top: 5,
                                                        bottom: 5
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                                                    id: "colorSales",
                                                                    x1: "0",
                                                                    y1: "0",
                                                                    x2: "0",
                                                                    y2: "1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                            offset: "5%",
                                                                            stopColor: "#4f46e5",
                                                                            stopOpacity: 0.3
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                            lineNumber: 360,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                            offset: "95%",
                                                                            stopColor: "#4f46e5",
                                                                            stopOpacity: 0
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                            lineNumber: 361,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 359,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                                                    id: "colorProfit",
                                                                    x1: "0",
                                                                    y1: "0",
                                                                    x2: "0",
                                                                    y2: "1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                            offset: "5%",
                                                                            stopColor: "#10b981",
                                                                            stopOpacity: 0.3
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                            lineNumber: 364,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                            offset: "95%",
                                                                            stopColor: "#10b981",
                                                                            stopOpacity: 0
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                            lineNumber: 365,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 363,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 358,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                                            strokeDasharray: "3 3",
                                                            vertical: false,
                                                            stroke: "#f1f5f9"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 368,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                                            dataKey: "name",
                                                            axisLine: false,
                                                            tickLine: false,
                                                            tick: {
                                                                fill: '#94a3b8',
                                                                fontSize: 10
                                                            },
                                                            dy: 10
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 369,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                                            axisLine: false,
                                                            tickLine: false,
                                                            tick: {
                                                                fill: '#94a3b8',
                                                                fontSize: 10
                                                            },
                                                            width: 40,
                                                            tickFormatter: (v)=>v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 370,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                            contentStyle: {
                                                                borderRadius: '12px',
                                                                border: 'none',
                                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                                fontSize: '12px'
                                                            },
                                                            formatter: (value)=>[
                                                                    `₹${value.toLocaleString()}`,
                                                                    ''
                                                                ]
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 371,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Area"], {
                                                            type: "monotone",
                                                            dataKey: "sales",
                                                            stroke: "#4f46e5",
                                                            strokeWidth: 2,
                                                            fillOpacity: 1,
                                                            fill: "url(#colorSales)",
                                                            name: "Sales"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 375,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Area"], {
                                                            type: "monotone",
                                                            dataKey: "profit",
                                                            stroke: "#10b981",
                                                            strokeWidth: 2,
                                                            fillOpacity: 1,
                                                            fill: "url(#colorProfit)",
                                                            name: "Profit"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 376,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 357,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 356,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 355,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 338,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-white rounded-xl md:rounded-2xl shadow-soft border border-slate-100 p-6 md:p-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-center mb-4 md:mb-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-sm md:text-lg font-bold text-slate-800 text-center",
                                                        children: t.weeklyPerformance
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 386,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-500 font-medium",
                                                        children: "Sales by day of the week"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 387,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 385,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 384,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-[200px] md:h-[280px] w-full px-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                                width: "100%",
                                                height: "100%",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BarChart"], {
                                                    data: weeklyData,
                                                    barCategoryGap: "20%",
                                                    margin: {
                                                        right: 20,
                                                        left: -20,
                                                        top: 5,
                                                        bottom: 5
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                                            strokeDasharray: "3 3",
                                                            vertical: false,
                                                            stroke: "#f1f5f9"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 393,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                                            dataKey: "name",
                                                            axisLine: false,
                                                            tickLine: false,
                                                            tick: {
                                                                fill: '#94a3b8',
                                                                fontSize: 10
                                                            },
                                                            dy: 10
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 394,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                                            axisLine: false,
                                                            tickLine: false,
                                                            tick: {
                                                                fill: '#94a3b8',
                                                                fontSize: 10
                                                            },
                                                            width: 40,
                                                            tickFormatter: (v)=>v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 395,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                            contentStyle: {
                                                                borderRadius: '12px',
                                                                border: 'none',
                                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                                fontSize: '12px'
                                                            },
                                                            formatter: (value)=>[
                                                                    `₹${value.toLocaleString()}`,
                                                                    ''
                                                                ]
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 396,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                                            dataKey: "sales",
                                                            fill: "#4f46e5",
                                                            radius: [
                                                                4,
                                                                4,
                                                                0,
                                                                0
                                                            ],
                                                            name: "Sales"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 400,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                                            dataKey: "profit",
                                                            fill: "#10b981",
                                                            radius: [
                                                                4,
                                                                4,
                                                                0,
                                                                0
                                                            ],
                                                            name: "Profit"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 401,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 392,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 391,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 390,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 383,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/page.tsx",
                            lineNumber: 336,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-white rounded-xl md:rounded-2xl shadow-soft border border-slate-100 p-6 md:p-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-sm md:text-lg font-bold text-slate-800 mb-4 md:mb-6 text-center",
                                            children: t.topSellingProducts
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 412,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-4 md:space-y-5 px-4",
                                            children: topProducts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col items-center justify-center h-[180px] md:h-[220px] text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-3 bg-slate-50 rounded-full mb-2",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaBox"], {
                                                            className: "text-slate-300 text-xl"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 417,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 416,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-slate-500 font-medium text-sm",
                                                        children: "No sales data yet"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 419,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] md:text-xs text-slate-400 mt-1",
                                                        children: "Start selling to see products here"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 420,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 415,
                                                columnNumber: 19
                                            }, this) : topProducts.slice(0, 5).map((product, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-between mb-1.5 px-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs md:text-sm font-semibold text-slate-700 truncate max-w-[60%]",
                                                                    children: product.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 426,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs md:text-sm font-bold text-slate-900",
                                                                    children: [
                                                                        "₹",
                                                                        product.sales >= 1000 ? (product.sales / 1000).toFixed(1) + 'k' : product.sales.toLocaleString()
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 427,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 425,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-full bg-slate-100 rounded-full h-2 overflow-hidden",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out",
                                                                style: {
                                                                    width: `${product.sales / topProducts[0].sales * 100}%`
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                lineNumber: 430,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 429,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] md:text-xs text-slate-400 mt-1 font-medium",
                                                            children: [
                                                                product.quantity,
                                                                " units sold"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 435,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, index, true, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 424,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 413,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 411,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "lg:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-soft border border-slate-100 overflow-hidden",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-5 md:p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-sm md:text-lg font-bold text-slate-800 text-center w-full md:w-auto pl-2",
                                                    children: t.recentInvoices
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 445,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleProtectedAction('/dashboard/invoices'),
                                                    className: "text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline self-end md:self-auto pr-10",
                                                    children: t.viewReports
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 446,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 444,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "overflow-x-auto",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                className: "w-full min-w-[500px]",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                        className: "bg-indigo-600 text-white",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "text-center py-4 px-4 text-[10px] md:text-sm font-bold uppercase tracking-wider first:rounded-l-lg",
                                                                    children: t.invoices
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 452,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "text-center py-4 px-4 text-[10px] md:text-sm font-bold uppercase tracking-wider",
                                                                    children: t.customer
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 453,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "text-center py-4 px-4 text-[10px] md:text-sm font-bold uppercase tracking-wider",
                                                                    children: t.date
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 454,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "text-center py-4 px-4 text-[10px] md:text-sm font-bold uppercase tracking-wider",
                                                                    children: t.amount
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 455,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "text-center py-4 px-4 text-[10px] md:text-sm font-bold uppercase tracking-wider last:rounded-r-lg",
                                                                    children: t.status
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 456,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 451,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 450,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                        className: "divide-y divide-slate-100",
                                                        children: (invoices || []).length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                colSpan: 5,
                                                                className: "py-8 md:py-10 text-center text-slate-500 font-medium text-xs md:text-sm",
                                                                children: [
                                                                    "No invoices yet. ",
                                                                    status === 'authenticated' ? 'Create your first invoice!' : 'Login to see data.'
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                lineNumber: 462,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 461,
                                                            columnNumber: 23
                                                        }, this) : (invoices || []).slice(0, 5).map((invoice, index)=>{
                                                            const safeTotal = Number(invoice?.total_amount) || 0;
                                                            const safeDate = (d)=>{
                                                                try {
                                                                    const date = new Date(d);
                                                                    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-IN', {
                                                                        day: '2-digit',
                                                                        month: 'short'
                                                                    });
                                                                } catch (e) {
                                                                    return '-';
                                                                }
                                                            };
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                className: "hover:bg-slate-50 transition-colors",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "text-center py-2.5 md:py-3 px-4 text-[10px] md:text-sm font-semibold text-indigo-600",
                                                                        children: [
                                                                            "#",
                                                                            invoice?.invoice_number || 'N/A'
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                        lineNumber: 477,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "text-center py-2.5 md:py-3 px-4 text-[10px] md:text-sm text-slate-700 font-medium truncate max-w-[100px]",
                                                                        children: invoice?.customer?.name || 'Unknown'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                        lineNumber: 478,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "text-center py-2.5 md:py-3 px-4 text-[10px] md:text-sm text-slate-500",
                                                                        children: safeDate(invoice?.invoice_date)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                        lineNumber: 479,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "text-center py-2.5 md:py-3 px-4 text-[10px] md:text-sm text-slate-900 font-bold",
                                                                        children: [
                                                                            "₹",
                                                                            safeTotal >= 1000 ? (safeTotal / 1000).toFixed(1) + 'k' : safeTotal.toLocaleString('en-IN')
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                        lineNumber: 480,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "text-center py-2.5 md:py-3 px-4",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold ${invoice?.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`,
                                                                            children: invoice?.status || 'PAID'
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                            lineNumber: 484,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                        lineNumber: 483,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, index, true, {
                                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                lineNumber: 476,
                                                                columnNumber: 27
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 459,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 449,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 448,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 443,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/page.tsx",
                            lineNumber: 409,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/bill/app/page.tsx",
                    lineNumber: 169,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/page.tsx",
                lineNumber: 168,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(LandingPage, "ck3uqwlO1Z4SLIqMB/3vF8MFdFQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"]
    ];
});
_c = LandingPage;
var _c;
__turbopack_context__.k.register(_c, "LandingPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_bill_dee595cf._.js.map