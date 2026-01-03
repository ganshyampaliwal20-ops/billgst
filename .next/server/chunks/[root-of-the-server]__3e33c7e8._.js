module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},6461,(e,t,r)=>{t.exports=e.x("zlib",()=>require("zlib"))},49719,(e,t,r)=>{t.exports=e.x("assert",()=>require("assert"))},874,(e,t,r)=>{t.exports=e.x("buffer",()=>require("buffer"))},30056,e=>e.a(async(t,r)=>{try{let t=await e.y("pg");e.n(t),r()}catch(e){r(e)}},!0),57218,e=>e.a(async(t,r)=>{try{let a,i;var s=e.i(30056),n=t([s]);[s]=n.then?(await n)():n;let{Pool:o}=s.default,E=process.env.DATABASE_URL;if(console.log(`DB Init: Environment Variable Type: ${typeof E}`),console.log(`DB Init: Environment Variable Length: ${E?E.length:"NULL"}`),E&&"string"==typeof E){let e=E.trim();e.startsWith('"')&&e.endsWith('"')&&(e=e.slice(1,-1)),e.startsWith("'")&&e.endsWith("'")&&(e=e.slice(1,-1)),e.includes("?")&&(e=e.split("?")[0]),e.length>0&&(i=e)}if(i?console.log(`DB Init: Connection String seems valid (starts with ${i.substring(0,10)}...)`):console.error("DB Init: Connection String is INVALID or EMPTY after sanitization."),i)try{a=new o({connectionString:i,ssl:{rejectUnauthorized:!1}}),console.log("DB Init: Pool created successfully.")}catch(e){console.error("CRITICAL: Failed to create Pool:",e),a={connect:async()=>{throw Error(`Pool Creation Failed: ${e.message}`)},query:async()=>{throw Error("Pool Creation Failed")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}}}else console.error("CRITICAL: DATABASE_URL is missing or invalid!"),a={connect:async()=>{throw console.error("Mock Pool Connect Called"),Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing. Please check Vercel Environment Variables.")},query:async()=>{throw Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing.")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}};let T=async()=>{if(!process.env.DATABASE_URL)return void console.error("Skipping initDB because DATABASE_URL is missing");let e=await a.connect();try{await e.query(`
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

      -- Quotations table
      CREATE TABLE IF NOT EXISTS quotations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id UUID REFERENCES customers(id),
        quotation_date DATE NOT NULL,
        valid_until DATE,
        items JSONB NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        cgst_amount DECIMAL(10,2) DEFAULT 0,
        sgst_amount DECIMAL(10,2) DEFAULT 0,
        igst_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(12,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        converted_to_invoice_id UUID REFERENCES invoices(id),
        notes TEXT,
        terms TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Purchase Orders table
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        po_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id UUID REFERENCES customers(id),
        po_date DATE NOT NULL,
        delivery_date DATE,
        items JSONB NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Credit Notes table
      CREATE TABLE IF NOT EXISTS credit_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        credit_note_number VARCHAR(50) UNIQUE NOT NULL,
        original_invoice_id UUID REFERENCES invoices(id),
        customer_id UUID REFERENCES customers(id),
        credit_date DATE NOT NULL,
        items JSONB NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        cgst_amount DECIMAL(10,2) DEFAULT 0,
        sgst_amount DECIMAL(10,2) DEFAULT 0,
        igst_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(12,2) NOT NULL,
        reason TEXT,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Expenses table
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        expense_number VARCHAR(50),
        category VARCHAR(100) NOT NULL,
        vendor_name VARCHAR(200),
        amount DECIMAL(12,2) NOT NULL,
        expense_date DATE NOT NULL,
        payment_method VARCHAR(50),
        receipt_no VARCHAR(100),
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Purchases table  
      CREATE TABLE IF NOT EXISTS purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        purchase_number VARCHAR(50) UNIQUE NOT NULL,
        vendor_name VARCHAR(200) NOT NULL,
        vendor_gstin VARCHAR(15),
        purchase_date DATE NOT NULL,
        items JSONB NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        cgst_amount DECIMAL(10,2) DEFAULT 0,
        sgst_amount DECIMAL(10,2) DEFAULT 0,
        igst_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(12,2) NOT NULL,
        paid_amount DECIMAL(12,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'UNPAID',
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Document Templates table
      CREATE TABLE IF NOT EXISTS document_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_name VARCHAR(100) NOT NULL,
        template_type VARCHAR(50) NOT NULL,
        layout_config JSONB,
        is_default BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
      CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
      CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
      CREATE INDEX IF NOT EXISTS idx_purchase_orders_customer ON purchase_orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice ON credit_notes(original_invoice_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
      CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);
    `);try{await e.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'PRODUCT';"),await e.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2);")}catch(e){console.log("Migration note: checked products columns")}try{await e.query(`
        -- Invoice Columns
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'TAX_INVOICE';
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
      `)}catch(e){console.log("Migration note: checked invoices & customers columns")}console.log("Database tables created/verified successfully")}finally{e.release()}},A=a;e.s(["default",0,A,"initDB",0,T]),r()}catch(e){r(e)}},!1),54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},92509,(e,t,r)=>{t.exports=e.x("url",()=>require("url"))},21517,(e,t,r)=>{t.exports=e.x("http",()=>require("http"))},24836,(e,t,r)=>{t.exports=e.x("https",()=>require("https"))},27699,(e,t,r)=>{t.exports=e.x("events",()=>require("events"))},92396,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.default=function(e){return{id:"credentials",name:"Credentials",type:"credentials",credentials:{},authorize:()=>null,options:e}}},20858,e=>e.a(async(t,r)=>{try{var s=e.i(92396),n=e.i(83599),a=e.i(57218),i=t([a]);[a]=i.then?(await i)():i;let o={secret:"billgst_security_fallback_secret_key_9988",providers:[(0,s.default)({name:"Credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(console.log("Auth Debug [Authorize]: Attempting login for",e?.email),!e?.email||!e?.password)return null;try{let t=(await a.default.query("SELECT * FROM users WHERE email = $1",[e.email])).rows[0];if(!t||!await n.default.compare(e.password,t.password))return null;return{id:t.id.toString(),email:t.email,name:t.name,role:t.role}}catch(e){return console.error("Auth error:",e),null}}})],secret:"billgst_security_fallback_secret_key_9988",debug:!0,callbacks:{jwt:async({token:e,user:t,account:r})=>(console.log("Auth Debug [JWT]: Processing token",{tokenExists:!!e,userExists:!!t,secretLen:41}),t&&(e.role=t.role,e.id=t.id),e),session:async({session:e,token:t})=>(console.log("Auth Debug [Session]: constructing session",{tokenExists:!!t,tokenId:t?.id,sessionUser:!!e?.user}),e?.user&&(e.user.role=t.role,e.user.id=t.id),e)}};e.s(["authOptions",0,o]),r()}catch(e){r(e)}},!1),66540,e=>e.a(async(t,r)=>{try{var s=e.i(49486),n=e.i(97857),a=e.i(20858),i=t([a]);async function o(e){let t=await (0,n.getServerSession)(a.authOptions);return s.NextResponse.json({status:"check",session_exists:!!t,user:t?.user||null,message:t?"Session is working on server!":"No session found (Unauthorized)",env_secret_set:!0,cookies:e.headers.get("cookie")||"none"})}[a]=i.then?(await i)():i,e.s(["GET",()=>o]),r()}catch(e){r(e)}},!1),2735,e=>e.a(async(t,r)=>{try{var s=e.i(19878),n=e.i(48499),a=e.i(82967),i=e.i(35670),o=e.i(11664),E=e.i(15322),T=e.i(21442),A=e.i(38067),d=e.i(47920),u=e.i(51399),c=e.i(79492),l=e.i(54758),R=e.i(92873),L=e.i(72015),I=e.i(54934),N=e.i(91087),U=e.i(93695);e.i(54423);var _=e.i(88506),p=e.i(66540),C=t([p]);[p]=C.then?(await C)():C;let m=new s.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/test-session/route",pathname:"/api/test-session",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/Desktop/bill/app/api/test-session/route.ts",nextConfigOutput:"",userland:p}),{workAsyncStorage:M,workUnitAsyncStorage:O,serverHooks:F}=m;function D(){return(0,a.patchFetch)({workAsyncStorage:M,workUnitAsyncStorage:O})}async function S(e,t,r){m.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let s="/api/test-session/route";s=s.replace(/\/index$/,"")||"/";let a=await m.prepare(e,t,{srcPage:s,multiZoneDraftMode:!1});if(!a)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:p,params:C,nextConfig:D,parsedUrl:S,isDraftMode:M,prerenderManifest:O,routerServerContext:F,isOnDemandRevalidate:g,revalidateOnlyGenerated:v,resolvedPathname:h,clientReferenceManifest:y,serverActionsManifest:x}=a,P=(0,A.normalizeAppPath)(s),b=!!(O.dynamicRoutes[P]||O.routes[h]),f=async()=>((null==F?void 0:F.render404)?await F.render404(e,t,S,!1):t.end("This page could not be found"),null);if(b&&!M){let e=!!O.routes[h],t=O.dynamicRoutes[P];if(t&&!1===t.fallback&&!e){if(D.experimental.adapterPath)return await f();throw new U.NoFallbackError}}let X=null;!b||m.isDev||M||(X=h,X="/index"===X?"/":X);let w=!0===m.isDev||!b,H=b&&!w;x&&y&&(0,E.setReferenceManifestsSingleton)({page:s,clientReferenceManifest:y,serverActionsManifest:x,serverModuleMap:(0,T.createServerModuleMap)({serverActionsManifest:x})});let V=e.method||"GET",B=(0,o.getTracer)(),k=B.getActiveScopeSpan(),q={params:C,prerenderManifest:O,renderOpts:{experimental:{authInterrupts:!!D.experimental.authInterrupts},cacheComponents:!!D.cacheComponents,supportsDynamicResponse:w,incrementalCache:(0,i.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:D.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,s)=>m.onRequestError(e,t,s,F)},sharedContext:{buildId:p}},Y=new d.NodeNextRequest(e),K=new d.NodeNextResponse(t),j=u.NextRequestAdapter.fromNodeNextRequest(Y,(0,u.signalFromNodeResponse)(t));try{let a=async e=>m.handle(j,q).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=B.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${V} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${V} ${s}`)}),E=!!(0,i.getRequestMeta)(e,"minimalMode"),T=async i=>{var o,T;let A=async({previousCacheEntry:n})=>{try{if(!E&&g&&v&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await a(i);e.fetchMetrics=q.renderOpts.fetchMetrics;let o=q.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let T=q.renderOpts.collectedTags;if(!b)return await (0,R.sendResponse)(Y,K,s,q.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,L.toNodeOutgoingHttpHeaders)(s.headers);T&&(t[N.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==q.renderOpts.collectedRevalidate&&!(q.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&q.renderOpts.collectedRevalidate,n=void 0===q.renderOpts.collectedExpire||q.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:q.renderOpts.collectedExpire;return{value:{kind:_.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await m.onRequestError(e,t,{routerKind:"App Router",routePath:s,routeType:"route",revalidateReason:(0,l.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:g})},F),t}},d=await m.handleResponse({req:e,nextConfig:D,cacheKey:X,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:O,isRoutePPREnabled:!1,isOnDemandRevalidate:g,revalidateOnlyGenerated:v,responseGenerator:A,waitUntil:r.waitUntil,isMinimalMode:E});if(!b)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==_.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(T=d.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});E||t.setHeader("x-nextjs-cache",g?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),M&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,L.fromNodeOutgoingHttpHeaders)(d.value.headers);return E&&b||u.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,I.getCacheControlHeader)(d.cacheControl)),await (0,R.sendResponse)(Y,K,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};k?await T(k):await B.withPropagatedContext(e.headers,()=>B.trace(c.BaseServerSpan.handleRequest,{spanName:`${V} ${s}`,kind:o.SpanKind.SERVER,attributes:{"http.method":V,"http.target":e.url}},T))}catch(t){if(t instanceof U.NoFallbackError||await m.onRequestError(e,t,{routerKind:"App Router",routePath:P,routeType:"route",revalidateReason:(0,l.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:g})}),b)throw t;return await (0,R.sendResponse)(Y,K,new Response(null,{status:500})),null}}e.s(["handler",()=>S,"patchFetch",()=>D,"routeModule",()=>m,"serverHooks",()=>F,"workAsyncStorage",()=>M,"workUnitAsyncStorage",()=>O]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__3e33c7e8._.js.map