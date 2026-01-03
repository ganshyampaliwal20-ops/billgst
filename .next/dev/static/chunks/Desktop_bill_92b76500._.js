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
    storage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createJSONStorage"])(()=>("TURBOPACK compile-time truthy", 1) ? localStorage : "TURBOPACK unreachable")
}));
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
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function RegistrationPopup() {
    _s();
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasClosed, setHasClosed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RegistrationPopup.useEffect": ()=>{
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
    if (!isVisible) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-6 right-6 z-[100] animate-slideUp max-w-[350px] w-full px-4 md:px-0",
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
                        lineNumber: 43,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                    lineNumber: 39,
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
                                lineNumber: 48,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                            lineNumber: 47,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-bold text-slate-900 mb-2 italic",
                            children: "Account Banayein!"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                            lineNumber: 51,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-600 mb-6 leading-relaxed",
                            children: "Apna data hamesha ke liye safe rakhne ke liye register karein aur full features payein."
                        }, void 0, false, {
                            fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                            lineNumber: 52,
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
                                            lineNumber: 62,
                                            columnNumber: 45
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                                    lineNumber: 57,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleClose,
                                    className: "py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest",
                                    children: "Baad mein karenge"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                                    lineNumber: 64,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                            lineNumber: 56,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
                    lineNumber: 46,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
            lineNumber: 38,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/bill/app/dashboard/RegistrationPopup.tsx",
        lineNumber: 37,
        columnNumber: 9
    }, this);
}
_s(RegistrationPopup, "V9H5HYKTKopcRNNAcJ3880vcVFU=");
_c = RegistrationPopup;
var _c;
__turbopack_context__.k.register(_c, "RegistrationPopup");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/bill/app/dashboard/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/bill/app/dashboard/layout.tsx'\n\nUnexpected token. Did you mean `{'>'}` or `&gt;`?");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
]);

//# sourceMappingURL=Desktop_bill_92b76500._.js.map