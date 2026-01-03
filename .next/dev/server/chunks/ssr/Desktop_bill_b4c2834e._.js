module.exports = [
"[project]/Desktop/bill/lib/store.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useStore",
    ()=>useStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/zustand/esm/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-hot-toast/dist/index.mjs [app-ssr] (ecmascript)");
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
const useStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["create"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        ...initialState,
        // Action to reset store on Logout
        resetStore: ()=>{
            set(initialState);
            // Also clear local storage manually to be safe
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
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
                const data = await res.json();
                if (Array.isArray(data)) set({
                    invoices: data
                });
            } catch (error) {
                console.error('Failed to fetch invoices:', error);
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
                    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Invoice saved successfully');
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
                const data = await res.json();
                if (Array.isArray(data)) set({
                    customers: data
                });
            } catch (error) {
                console.error('Failed to fetch customers:', error);
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
                    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Customer added successfully');
                    return savedCustomer;
                }
            } catch (error) {
                console.error('Failed to add customer:', error);
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Failed to save customer. Please try again.');
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
                const data = await res.json();
                if (Array.isArray(data)) set({
                    products: data
                });
            } catch (error) {
                console.error('Failed to fetch products:', error);
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
                    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Product added successfully');
                    return savedProduct;
                }
            } catch (error) {
                console.error('Failed to add product:', error);
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Failed to save product. Please try again.');
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
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Product updated successfully');
            } catch (error) {
                console.error('Failed to update product:', error);
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
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
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Product deleted successfully');
                return {
                    success: true
                };
            } catch (error) {
                console.error('Failed to delete product:', error);
                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
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
            const { invoices } = get();
            const now = new Date();
            let filteredInvoices = invoices;
            if (period === 'daily') {
                filteredInvoices = invoices.filter((inv)=>new Date(inv.invoice_date).toDateString() === now.toDateString());
            } else if (period === 'monthly') {
                filteredInvoices = invoices.filter((inv)=>new Date(inv.invoice_date).getMonth() === now.getMonth() && new Date(inv.invoice_date).getFullYear() === now.getFullYear());
            } else if (period === 'weekly') {
                // Simplified weekly logic (last 7 days)
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                filteredInvoices = invoices.filter((inv)=>new Date(inv.invoice_date) >= oneWeekAgo);
            } else if (period === 'yearly') {
                filteredInvoices = invoices.filter((inv)=>new Date(inv.invoice_date).getFullYear() === now.getFullYear());
            } else if (period === 'custom' && customRange?.start && customRange?.end) {
                const start = new Date(customRange.start);
                const end = new Date(customRange.end);
                end.setHours(23, 59, 59, 999); // Include full end day
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
                        totalCost += item.unit_price * 0.8 * item.quantity;
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
    storage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createJSONStorage"])(()=>("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : undefined)
}));
}),
"[project]/Desktop/bill/lib/translations.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/Desktop/bill/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LandingPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/react-icons/fa/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/chart/AreaChart.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/cartesian/Area.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/cartesian/XAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/cartesian/YAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/component/Tooltip.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/recharts/es6/component/ResponsiveContainer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/store.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/translations.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
function LandingPage() {
    const { invoices, customers, products, businessProfile, settings, getAnalytics, getTopProducts, fetchCustomers, fetchProducts, fetchInvoices } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"])();
    const [isClient, setIsClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [period, setPeriod] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('monthly');
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Date());
    // Get translations
    const t = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["translations"][settings.language] || __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$translations$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["translations"].en;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setIsClient(true);
        // Live Clock
        const timer = setInterval(()=>setCurrentTime(new Date()), 1000);
        // Load Data from DB
        fetchCustomers();
        fetchProducts();
        fetchInvoices();
        return ()=>clearInterval(timer);
    }, []);
    if (!isClient) return null;
    // Get Analytics Data
    const { totalSales, totalProfit, invoiceCount } = getAnalytics(period);
    const topProducts = getTopProducts() || [];
    // Get current time greeting
    const getGreeting = ()=>{
        const hour = new Date().getHours();
        if (hour < 12) return t.goodMorning;
        if (hour < 17) return t.goodAfternoon;
        return t.goodEvening;
    };
    // Monthly Trend Data for Chart
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden pb-20",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "bg-gradient-to-r from-indigo-600 to-violet-700 p-4 md:p-6 text-white shadow-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center p-2 backdrop-blur-sm border border-white/30",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full h-full bg-[#38bdf8] rounded-xl flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-white font-black text-xl italic uppercase",
                                            children: "B"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 68,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                        lineNumber: 67,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 66,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-none",
                                            children: businessProfile.name || 'BillGST Business'
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 72,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] md:text-xs font-bold opacity-70 uppercase tracking-[0.2em] mt-1",
                                            children: "Professional Billing"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 75,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 71,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/page.tsx",
                            lineNumber: 65,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/login",
                                    className: "text-xs font-black uppercase px-4 py-2 border border-white/30 rounded-full hover:bg-white/10",
                                    children: "Login"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 79,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/register",
                                    className: "text-xs font-black uppercase px-4 py-2 bg-white text-indigo-700 rounded-full hover:bg-white/90",
                                    children: "Sign Up"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 80,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/page.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/bill/app/page.tsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/bill/app/page.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "max-w-7xl mx-auto p-4 md:p-10 space-y-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 text-slate-500 font-bold text-xs bg-slate-100 w-fit px-4 py-1.5 rounded-full border border-slate-200",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaClock"], {
                                className: "text-orange-500"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 89,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                suppressHydrationWarning: true,
                                children: [
                                    currentTime.toLocaleDateString('en-IN', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short'
                                    }),
                                    " • ",
                                    currentTime.toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/page.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "py-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl md:text-4xl font-black text-slate-800 tracking-tight",
                            children: [
                                getGreeting(),
                                ", ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-orange-500",
                                    children: businessProfile.name || 'Owner'
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 98,
                                    columnNumber: 30
                                }, this),
                                "! 👋"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/page.tsx",
                            lineNumber: 97,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/bill/app/page.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/invoices/new",
                                className: "group",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gradient-to-br from-indigo-500 to-indigo-700 h-[140px] md:h-[180px] rounded-[35px] text-white flex flex-col items-center justify-center gap-4 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.4)] active:scale-95 border-b-[8px] border-indigo-900 border-x border-t border-white/10",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-3 bg-white/20 rounded-2xl backdrop-blur-sm",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaReceipt"], {
                                                className: "text-2xl md:text-3xl"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 108,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 107,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-lg md:text-xl font-black uppercase tracking-tight italic",
                                            children: t.newInvoice
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 110,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 106,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 105,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/customers",
                                className: "group",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gradient-to-br from-emerald-500 to-teal-700 h-[140px] md:h-[180px] rounded-[35px] text-white flex flex-col items-center justify-center gap-4 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.4)] active:scale-95 border-b-[8px] border-emerald-900 border-x border-t border-white/10",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-3 bg-white/20 rounded-2xl backdrop-blur-sm",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaUserPlus"], {
                                                className: "text-2xl md:text-3xl"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 118,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 117,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-lg md:text-xl font-black uppercase tracking-tight italic",
                                            children: t.addCustomer
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 120,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 116,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/inventory",
                                className: "group",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] h-[140px] md:h-[180px] rounded-[35px] text-white flex flex-col items-center justify-center gap-4 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.4)] active:scale-95 border-b-[8px] border-violet-900 border-x border-t border-white/10",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-3 bg-white/20 rounded-2xl backdrop-blur-sm",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaBox"], {
                                                className: "text-2xl md:text-3xl"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 128,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 127,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-lg md:text-xl font-black uppercase tracking-tight italic",
                                            children: t.addProduct
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 125,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/page.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden group text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-2",
                                children: t.analyticsOverview
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm md:text-base font-bold opacity-80 uppercase tracking-[0.3em]",
                                children: "Track your business performance"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 138,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/page.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4 pt-4 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-extrabold text-slate-500 text-sm uppercase tracking-wider",
                                children: [
                                    t.selectPeriod,
                                    ":"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-4 max-w-lg mx-auto",
                                children: [
                                    {
                                        key: 'daily',
                                        label: t.daily
                                    },
                                    {
                                        key: 'weekly',
                                        label: t.weekly
                                    },
                                    {
                                        key: 'monthly',
                                        label: t.monthly
                                    }
                                ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setPeriod(item.key),
                                        className: `flex-1 py-4 rounded-[25px] font-black text-xs md:text-sm uppercase italic transition-all ${period === item.key ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 active:scale-95' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'}`,
                                        children: item.label
                                    }, item.key, false, {
                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 145,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/page.tsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white rounded-[40px] shadow-2xl border border-slate-100 p-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-xl font-black italic text-slate-800 mb-6 uppercase tracking-tight",
                                        children: "Revenue Analytics"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                        lineNumber: 168,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-[300px] w-full",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                            width: "100%",
                                            height: "100%",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AreaChart"], {
                                                data: monthlyTrend,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                                            id: "colorSales",
                                                            x1: "0",
                                                            y1: "0",
                                                            x2: "0",
                                                            y2: "1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                    offset: "5%",
                                                                    stopColor: "#6366f1",
                                                                    stopOpacity: 0.3
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 174,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                    offset: "95%",
                                                                    stopColor: "#6366f1",
                                                                    stopOpacity: 0
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                                    lineNumber: 175,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 173,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 172,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                                        strokeDasharray: "3 3",
                                                        vertical: false,
                                                        stroke: "#f1f5f9"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 178,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["XAxis"], {
                                                        dataKey: "name",
                                                        axisLine: false,
                                                        tickLine: false,
                                                        tick: {
                                                            fill: '#94a3b8',
                                                            fontSize: 10
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 179,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["YAxis"], {
                                                        axisLine: false,
                                                        tickLine: false,
                                                        tick: {
                                                            fill: '#94a3b8',
                                                            fontSize: 10
                                                        },
                                                        hide: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 180,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                        contentStyle: {
                                                            borderRadius: '20px',
                                                            border: 'none',
                                                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                                                            fontWeight: 'bold'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 181,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Area"], {
                                                        type: "monotone",
                                                        dataKey: "sales",
                                                        stroke: "#6366f1",
                                                        strokeWidth: 4,
                                                        fillOpacity: 1,
                                                        fill: "url(#colorSales)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                                        lineNumber: 184,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                                lineNumber: 171,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 170,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/bill/app/page.tsx",
                                        lineNumber: 169,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 167,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-900 rounded-[40px] shadow-2xl p-8 text-white flex flex-col justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-2",
                                                    children: t.totalRevenue
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 194,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                                    className: "text-5xl font-black tabular-nums italic tracking-tighter",
                                                    children: [
                                                        "₹",
                                                        totalSales.toLocaleString()
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 195,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 193,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between pt-8 border-t border-white/10",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-white/40 text-[10px] font-black uppercase tracking-widest mb-1",
                                                            children: t.invoices
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 199,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-2xl font-black italic",
                                                            children: invoiceCount
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 200,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 198,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/dashboard",
                                                    className: "px-8 py-4 bg-white text-indigo-900 font-extrabold rounded-full flex items-center gap-2 hover:bg-slate-100 transition-all text-sm shadow-xl",
                                                    children: [
                                                        "GO TO DASHBOARD ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FaArrowRight"], {}, void 0, false, {
                                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                                            lineNumber: 203,
                                                            columnNumber: 35
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                                    lineNumber: 202,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/bill/app/page.tsx",
                                            lineNumber: 197,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/page.tsx",
                                    lineNumber: 192,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/bill/app/page.tsx",
                                lineNumber: 191,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/bill/app/page.tsx",
                        lineNumber: 166,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/bill/app/page.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/bill/app/page.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=Desktop_bill_b4c2834e._.js.map