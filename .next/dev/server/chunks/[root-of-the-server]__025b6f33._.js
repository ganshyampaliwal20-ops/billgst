module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/pg [external] (pg, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/Desktop/bill/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "initDB",
    ()=>initDB
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const { Pool } = __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["default"];
let pool;
let rawConnectionString = process.env.DATABASE_URL;
let connectionString = undefined;
console.log(`DB Init: Environment Variable Type: ${typeof rawConnectionString}`);
console.log(`DB Init: Environment Variable Length: ${rawConnectionString ? rawConnectionString.length : 'NULL'}`);
// 1. Sanitize
if (rawConnectionString && typeof rawConnectionString === 'string') {
    let sanitized = rawConnectionString.trim();
    // Remove quotes if present
    if (sanitized.startsWith('"') && sanitized.endsWith('"')) sanitized = sanitized.slice(1, -1);
    if (sanitized.startsWith("'") && sanitized.endsWith("'")) sanitized = sanitized.slice(1, -1);
    // Remove query parameters (like ?sslmode=require) to prevent conflicts
    if (sanitized.includes('?')) {
        sanitized = sanitized.split('?')[0];
    }
    if (sanitized.length > 0) {
        connectionString = sanitized;
    }
}
if (connectionString) {
    console.log(`DB Init: Connection String seems valid (starts with ${connectionString.substring(0, 10)}...)`);
} else {
    console.error(`DB Init: Connection String is INVALID or EMPTY after sanitization.`);
}
if (!connectionString) {
    console.error('CRITICAL: DATABASE_URL is missing or invalid!');
    // Mock pool that throws clear error
    pool = {
        connect: async ()=>{
            console.error("Mock Pool Connect Called");
            throw new Error(`DATABASE CONFIGURATION ERROR: DATABASE_URL is missing. Please check Vercel Environment Variables.`);
        },
        query: async ()=>{
            throw new Error('DATABASE CONFIGURATION ERROR: DATABASE_URL is missing.');
        },
        on: ()=>{},
        totalCount: 0,
        idleCount: 0,
        waitingCount: 0,
        end: async ()=>{}
    };
} else {
    try {
        // FORCE connectionString to be a string
        pool = new Pool({
            connectionString: connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        });
        console.log("DB Init: Pool created successfully.");
    } catch (err) {
        console.error('CRITICAL: Failed to create Pool:', err);
        // Fallback to error mock
        pool = {
            connect: async ()=>{
                throw new Error(`Pool Creation Failed: ${err.message}`);
            },
            query: async ()=>{
                throw new Error('Pool Creation Failed');
            },
            on: ()=>{},
            totalCount: 0,
            idleCount: 0,
            waitingCount: 0,
            end: async ()=>{}
        };
    }
}
const initDB = async ()=>{
    if (!process.env.DATABASE_URL) {
        console.error('Skipping initDB because DATABASE_URL is missing');
        return;
    }
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'USER',
        phone VARCHAR(20),
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Customers table
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        gstin VARCHAR(15),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        credit_limit DECIMAL(10,2) DEFAULT 0,
        outstanding_balance DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        hsn_code VARCHAR(10),
        unit VARCHAR(20) DEFAULT 'PCS',
        price DECIMAL(10,2) NOT NULL,
        gst_rate DECIMAL(5,2) DEFAULT 18.00,
        stock_quantity INTEGER DEFAULT 0,
        low_stock_alert INTEGER DEFAULT 10,
        category VARCHAR(100),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Invoices table
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id UUID REFERENCES customers(id),
        invoice_date DATE NOT NULL,
        due_date DATE,
        subtotal DECIMAL(10,2) NOT NULL,
        cgst_amount DECIMAL(10,2) DEFAULT 0,
        sgst_amount DECIMAL(10,2) DEFAULT 0,
        igst_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'UNPAID',
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Invoice Items table
      CREATE TABLE IF NOT EXISTS invoice_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        hsn_code VARCHAR(10),
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        gst_rate DECIMAL(5,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL
      );

      -- Payments table
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id UUID REFERENCES invoices(id),
        payment_date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        reference_number VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Stock movements table
      CREATE TABLE IF NOT EXISTS stock_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id),
        movement_type VARCHAR(20) NOT NULL,
        quantity INTEGER NOT NULL,
        reference_type VARCHAR(50),
        reference_id UUID,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Settings table
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
    `);
        try {
            await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'PRODUCT';`);
        } catch (e) {
            console.log('Migration note: checked products.type');
        }
        try {
            await client.query(`
        -- Invoice Columns
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS eway_bill_no VARCHAR(20);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS eway_bill_date TIMESTAMP;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(20);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS distance INTEGER;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS transporter_name VARCHAR(255);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS transporter_id VARCHAR(50);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vehicle_no VARCHAR(20);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS irn VARCHAR(100);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS ack_no VARCHAR(50);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS ack_date TIMESTAMP;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS signed_qrcode TEXT;
        
        -- Customer Columns (Ensure consistency)
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

        -- User Columns for Password Reset
        ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
      `);
        } catch (e) {
            console.log('Migration note: checked invoices & customers columns');
        }
        console.log('Database tables created/verified successfully');
    } finally{
        client.release();
    }
};
const __TURBOPACK__default__export__ = pool;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/Desktop/bill/lib/auth.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "authOptions",
    ()=>authOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// FALLBACK SECRET FOR DEBUGGING
// This ensures that even if .env.local is missing, the app uses a consistent secret.
const DEBUG_SECRET = "temp_debug_secret_12345_should_be_in_env";
const authOptions = {
    secret: ("TURBOPACK compile-time value", "billgst_security_fallback_secret_key_9988") || "fallback_dev_secret",
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize (credentials) {
                console.log('Auth Debug [Authorize]: Attempting login for', credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                try {
                    const result = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query('SELECT * FROM users WHERE email = $1', [
                        credentials.email
                    ]);
                    const user = result.rows[0];
                    if (!user) {
                        return null;
                    }
                    const isPasswordValid = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(credentials.password, user.password);
                    if (!isPasswordValid) {
                        return null;
                    }
                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],
    secret: ("TURBOPACK compile-time value", "billgst_security_fallback_secret_key_9988") || DEBUG_SECRET,
    debug: true,
    callbacks: {
        async jwt ({ token, user, account }) {
            console.log('Auth Debug [JWT]: Processing token', {
                tokenExists: !!token,
                userExists: !!user,
                secretLen: (("TURBOPACK compile-time value", "billgst_security_fallback_secret_key_9988") || DEBUG_SECRET).length
            });
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session ({ session, token }) {
            console.log('Auth Debug [Session]: constructing session', {
                tokenExists: !!token,
                tokenId: token?.id,
                sessionUser: !!session?.user
            });
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    }
};
// Safe detection for development vs production
const isDev = ("TURBOPACK compile-time value", "development") === 'development' || ("TURBOPACK compile-time value", "undefined") !== 'undefined' && window.location.hostname === 'localhost' || ("TURBOPACK compile-time value", "https://billgst.in") && ("TURBOPACK compile-time value", "https://billgst.in").includes('localhost');
// Environment Variable Check - Only warn once per server start, and mostly in production
if ("TURBOPACK compile-time truthy", 1) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Desktop/bill/app/api/invoices/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/uuid/dist-node/v4.js [app-route] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/node_modules/next-auth/next/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/bill/lib/auth.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
async function GET() {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
        if (!session?.user?.id) {
            console.error('Invoice GET API Error: Unauthorized access attempt');
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Please create an account or login to continue'
            }, {
                status: 401
            });
        }
        const userId = session.user.id;
        const client = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].connect();
        // Fetch invoices for the user
        const result = await client.query(`
      SELECT i.*, 
             json_build_object('name', c.name, 'email', c.email) as customer,
             (SELECT json_agg(items) FROM invoice_items items WHERE items.invoice_id = i.id) as items
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.created_by = $1
      ORDER BY i.created_at DESC
    `, [
            userId
        ]);
        client.release();
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result.rows);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch invoices'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
    console.log('Invoice API Debug: Session Check', {
        hasSession: !!session,
        userId: session?.user?.id
    });
    if (!session?.user?.id) {
        console.error('Invoice API Error: Unauthorized access attempt');
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Unauthorized'
        }, {
            status: 401
        });
    }
    const userId = session.user.id;
    const client = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].connect();
    let data = {};
    let customerId = '';
    try {
        data = await request.json();
        console.log('Invoice API: Received data:', JSON.stringify(data, null, 2));
        // Ensure ID exists
        if (!data.id) {
            data.id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
        }
        // Extract customer ID - handle both object and string formats
        customerId = typeof data.customer === 'object' ? data.customer.id : data.customer;
        if (!customerId) {
            console.error('Invoice API Error: No customer ID provided');
            throw new Error('Customer ID is required');
        }
        console.log('Invoice API: Extracted customer ID:', customerId);
        // Start Transaction
        await client.query('BEGIN');
        const invoiceResult = await client.query(`
        INSERT INTO invoices (
            id, invoice_number, customer_id, invoice_date, due_date, 
            subtotal, total_amount, igst_amount, cgst_amount, sgst_amount, status, notes, 
            paid_amount, created_by, eway_bill_no, eway_bill_date, transport_mode, distance,
            transporter_name, transporter_id, vehicle_no, irn, ack_no, ack_date, signed_qrcode, type, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, NOW())
        RETURNING id
    `, [
            data.id,
            data.invoice_number,
            customerId,
            data.invoice_date,
            data.due_date || null,
            data.subtotal,
            data.total_amount,
            data.igst_amount || 0,
            data.cgst_amount || 0,
            data.sgst_amount || 0,
            data.status,
            data.notes,
            data.paid_amount || 0,
            userId,
            data.eway_bill_no || null,
            data.eway_bill_date || null,
            data.transport_mode || null,
            data.distance || null,
            data.transporter_name || null,
            data.transporter_id || null,
            data.vehicle_no || null,
            data.irn || null,
            data.ack_no || null,
            data.ack_date || null,
            data.signed_qrcode || null,
            data.type || 'TAX_INVOICE'
        ]);
        const invoiceId = invoiceResult.rows[0].id;
        console.log('Invoice API: Invoice created with ID:', invoiceId);
        // 2. Insert Items
        if (data.items && Array.isArray(data.items)) {
            console.log(`Invoice API: Inserting ${data.items.length} items`);
            for (const item of data.items){
                const quantity = Number(item.quantity);
                const unitPrice = Number(item.unit_price);
                const gstRate = Number(item.gst_rate);
                await client.query(`
                    INSERT INTO invoice_items (
                    invoice_id, product_id, product_name, quantity, unit_price, gst_rate, total_amount
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    invoiceId,
                    item.product_id,
                    item.product_name,
                    quantity,
                    unitPrice,
                    gstRate,
                    quantity * unitPrice
                ]);
                // Update product stock safely if it's a PRODUCT
                if (item.type !== 'SERVICE' && item.product_id) {
                    await client.query(`
                        UPDATE products 
                        SET stock_quantity = COALESCE(stock_quantity, 0) - $1 
                        WHERE id = $2
                    `, [
                        quantity,
                        item.product_id
                    ]);
                }
            }
        }
        console.log('Invoice API: All items inserted successfully');
        await client.query('COMMIT');
        client.release();
        console.log('Invoice API: Transaction committed successfully');
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            id: invoiceId
        });
    } catch (error) {
        // Auto-migration: If column missing error (42703), add columns and retry
        if (error?.code === '42703') {
            console.log('Invoice API: Missing columns detected. Attempting auto-migration...');
            try {
                await client.query('ROLLBACK'); // Rollback failed transaction first
                await client.query(`
                    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(10,2) DEFAULT 0;
                    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(10,2) DEFAULT 0;
                    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(10,2) DEFAULT 0;
                    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'TAX_INVOICE';
                `);
                console.log('Invoice API: Auto-migration successful. Retrying insertion...');
                // Retry Insertion
                await client.query('BEGIN');
                const invoiceResult = await client.query(`
                    INSERT INTO invoices (
                        id, invoice_number, customer_id, invoice_date, due_date, 
                        subtotal, total_amount, igst_amount, cgst_amount, sgst_amount, status, notes, 
                        paid_amount, created_by, eway_bill_no, eway_bill_date, transport_mode, distance,
                        transporter_name, transporter_id, vehicle_no, irn, ack_no, ack_date, signed_qrcode, type, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, NOW())
                    RETURNING id
                `, [
                    data.id,
                    data.invoice_number,
                    customerId,
                    data.invoice_date,
                    data.due_date || null,
                    data.subtotal,
                    data.total_amount,
                    data.igst_amount || 0,
                    data.cgst_amount || 0,
                    data.sgst_amount || 0,
                    data.status,
                    data.notes,
                    data.paid_amount || 0,
                    userId,
                    data.eway_bill_no || null,
                    data.eway_bill_date || null,
                    data.transport_mode || null,
                    data.distance || null,
                    data.transporter_name || null,
                    data.transporter_id || null,
                    data.vehicle_no || null,
                    data.irn || null,
                    data.ack_no || null,
                    data.ack_date || null,
                    data.signed_qrcode || null,
                    data.type || 'TAX_INVOICE'
                ]);
                const invoiceId = invoiceResult.rows[0].id;
                // 2. Insert Items (Retry)
                if (data.items && Array.isArray(data.items)) {
                    for (const item of data.items){
                        const quantity = Number(item.quantity);
                        const unitPrice = Number(item.unit_price);
                        const gstRate = Number(item.gst_rate);
                        await client.query(`
                            INSERT INTO invoice_items (
                            invoice_id, product_id, product_name, quantity, unit_price, gst_rate, total_amount
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                        `, [
                            invoiceId,
                            item.product_id,
                            item.product_name,
                            quantity,
                            unitPrice,
                            gstRate,
                            quantity * unitPrice
                        ]);
                        // Update product stock safely (Retry)
                        if (item.type !== 'SERVICE' && item.product_id) {
                            await client.query(`
                                UPDATE products 
                                SET stock_quantity = COALESCE(stock_quantity, 0) - $1 
                                WHERE id = $2
                            `, [
                                quantity,
                                item.product_id
                            ]);
                        }
                    }
                }
                await client.query('COMMIT');
                client.release();
                return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    id: invoiceId
                });
            } catch (retryError) {
                console.error('Invoice API: Auto-migration failed:', retryError);
            // Fall through to general error handler
            }
        }
        await client.query('ROLLBACK');
        client.release();
        console.error('Invoice API Transaction Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$bill$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: `Database Error: ${error instanceof Error ? error.message : 'Unknown Error'}`,
            details: error instanceof Error ? error.stack : undefined
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__025b6f33._.js.map