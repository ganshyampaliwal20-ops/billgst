module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},6461,(e,t,r)=>{t.exports=e.x("zlib",()=>require("zlib"))},49719,(e,t,r)=>{t.exports=e.x("assert",()=>require("assert"))},874,(e,t,r)=>{t.exports=e.x("buffer",()=>require("buffer"))},30056,e=>e.a(async(t,r)=>{try{let t=await e.y("pg");e.n(t),r()}catch(e){r(e)}},!0),57218,e=>e.a(async(t,r)=>{try{let a,o;var s=e.i(30056),n=t([s]);[s]=n.then?(await n)():n;let{Pool:i}=s.default,E=process.env.DATABASE_URL;if(console.log(`DB Init: Environment Variable Type: ${typeof E}`),console.log(`DB Init: Environment Variable Length: ${E?E.length:"NULL"}`),E&&"string"==typeof E){let e=E.trim();e.startsWith('"')&&e.endsWith('"')&&(e=e.slice(1,-1)),e.startsWith("'")&&e.endsWith("'")&&(e=e.slice(1,-1)),e.includes("?")&&(e=e.split("?")[0]),e.length>0&&(o=e)}if(o?console.log(`DB Init: Connection String seems valid (starts with ${o.substring(0,10)}...)`):console.error("DB Init: Connection String is INVALID or EMPTY after sanitization."),o)try{a=new i({connectionString:o,ssl:{rejectUnauthorized:!1}}),console.log("DB Init: Pool created successfully.")}catch(e){console.error("CRITICAL: Failed to create Pool:",e),a={connect:async()=>{throw Error(`Pool Creation Failed: ${e.message}`)},query:async()=>{throw Error("Pool Creation Failed")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}}}else console.error("CRITICAL: DATABASE_URL is missing or invalid!"),a={connect:async()=>{throw console.error("Mock Pool Connect Called"),Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing. Please check Vercel Environment Variables.")},query:async()=>{throw Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing.")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}};let T=async()=>{if(!process.env.DATABASE_URL)return void console.error("Skipping initDB because DATABASE_URL is missing");let e=await a.connect();try{await e.query(`
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
      `)}catch(e){console.log("Migration note: checked invoices & customers columns")}console.log("Database tables created/verified successfully")}finally{e.release()}},A=a;e.s(["default",0,A,"initDB",0,T]),r()}catch(e){r(e)}},!1),54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},92509,(e,t,r)=>{t.exports=e.x("url",()=>require("url"))},21517,(e,t,r)=>{t.exports=e.x("http",()=>require("http"))},24836,(e,t,r)=>{t.exports=e.x("https",()=>require("https"))},27699,(e,t,r)=>{t.exports=e.x("events",()=>require("events"))},92396,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.default=function(e){return{id:"credentials",name:"Credentials",type:"credentials",credentials:{},authorize:()=>null,options:e}}},20858,e=>e.a(async(t,r)=>{try{var s=e.i(92396),n=e.i(83599),a=e.i(57218),o=t([a]);[a]=o.then?(await o)():o;let i={secret:"billgst_security_fallback_secret_key_9988",providers:[(0,s.default)({name:"Credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(console.log("Auth Debug [Authorize]: Attempting login for",e?.email),!e?.email||!e?.password)return null;try{let t=(await a.default.query("SELECT * FROM users WHERE email = $1",[e.email])).rows[0];if(!t||!await n.default.compare(e.password,t.password))return null;return{id:t.id.toString(),email:t.email,name:t.name,role:t.role}}catch(e){return console.error("Auth error:",e),null}}})],secret:"billgst_security_fallback_secret_key_9988",debug:!0,callbacks:{jwt:async({token:e,user:t,account:r})=>(console.log("Auth Debug [JWT]: Processing token",{tokenExists:!!e,userExists:!!t,secretLen:41}),t&&(e.role=t.role,e.id=t.id),e),session:async({session:e,token:t})=>(console.log("Auth Debug [Session]: constructing session",{tokenExists:!!t,tokenId:t?.id,sessionUser:!!e?.user}),e?.user&&(e.user.role=t.role,e.user.id=t.id),e)}};e.s(["authOptions",0,i]),r()}catch(e){r(e)}},!1),66680,(e,t,r)=>{t.exports=e.x("node:crypto",()=>require("node:crypto"))},38521,e=>{"use strict";var t=e.i(66680);let r={randomUUID:t.randomUUID},s=new Uint8Array(256),n=s.length,a=[];for(let e=0;e<256;++e)a.push((e+256).toString(16).slice(1));e.s(["v4",0,function(e,o,i){if(r.randomUUID&&!o&&!e)return r.randomUUID();var E=e,T=i;let A=(E=E||{}).random??E.rng?.()??(n>s.length-16&&((0,t.randomFillSync)(s),n=0),s.slice(n,n+=16));if(A.length<16)throw Error("Random bytes length must be >= 16");if(A[6]=15&A[6]|64,A[8]=63&A[8]|128,o){if((T=T||0)<0||T+16>o.length)throw RangeError(`UUID byte range ${T}:${T+15} is out of buffer bounds`);for(let e=0;e<16;++e)o[T+e]=A[e];return o}return function(e,t=0){return(a[e[t+0]]+a[e[t+1]]+a[e[t+2]]+a[e[t+3]]+"-"+a[e[t+4]]+a[e[t+5]]+"-"+a[e[t+6]]+a[e[t+7]]+"-"+a[e[t+8]]+a[e[t+9]]+"-"+a[e[t+10]]+a[e[t+11]]+a[e[t+12]]+a[e[t+13]]+a[e[t+14]]+a[e[t+15]]).toLowerCase()}(A)}],38521)},28603,e=>e.a(async(t,r)=>{try{var s=e.i(49486),n=e.i(57218),a=e.i(38521),o=e.i(97857),i=e.i(20858),E=t([n,i]);async function T(){try{let e=await (0,o.getServerSession)(i.authOptions);if(!e?.user?.id)return s.NextResponse.json({error:"Please create an account or login to continue"},{status:401});let t=await n.default.connect(),r=await t.query("SELECT * FROM customers WHERE created_by = $1 ORDER BY created_at DESC",[e.user.id]);return t.release(),s.NextResponse.json(r.rows)}catch(e){return console.error("Error fetching customers:",e),s.NextResponse.json({error:"Failed to fetch customers"},{status:500})}}async function A(e){let t=await (0,o.getServerSession)(i.authOptions);if(console.log("Customer API Debug: Session Check",{hasSession:!!t,userId:t?.user?.id}),!t?.user?.id)return s.NextResponse.json({error:"Please create an account or login to continue"},{status:401});let r=t.user.id;try{let t=await e.json();console.log("API: Creating customer:",t);let o=await n.default.connect();t.id||(t.id=(0,a.v4)());try{let e=await o.query(`INSERT INTO customers (id, name, email, phone, gstin, address, created_by, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
           RETURNING *`,[t.id,t.name,t.email,t.phone,t.gstin,t.address,r]);return console.log("API: Customer Inserted:",e.rows[0]),o.release(),s.NextResponse.json(e.rows[0])}catch(e){if(e?.code==="42703"){console.log("Customer API: Missing columns detected. Attempting auto-migration..."),await o.query(`
                    ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
                `);let e=await o.query(`INSERT INTO customers (id, name, email, phone, gstin, address, created_by, created_at) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
               RETURNING *`,[t.id,t.name,t.email,t.phone,t.gstin,t.address,r]);return o.release(),s.NextResponse.json(e.rows[0])}throw e}}catch(e){return console.error("API Error creating customer:",e),s.NextResponse.json({error:"Failed to create customer"},{status:500})}}[n,i]=E.then?(await E)():E,e.s(["GET",()=>T,"POST",()=>A]),r()}catch(e){r(e)}},!1),86405,e=>e.a(async(t,r)=>{try{var s=e.i(19878),n=e.i(48499),a=e.i(82967),o=e.i(35670),i=e.i(11664),E=e.i(15322),T=e.i(21442),A=e.i(38067),d=e.i(47920),u=e.i(51399),c=e.i(79492),l=e.i(54758),R=e.i(92873),I=e.i(72015),L=e.i(54934),N=e.i(91087),U=e.i(93695);e.i(54423);var _=e.i(88506),p=e.i(28603),C=t([p]);[p]=C.then?(await C)():C;let S=new s.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/customers/route",pathname:"/api/customers",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/Desktop/bill/app/api/customers/route.ts",nextConfigOutput:"",userland:p}),{workAsyncStorage:M,workUnitAsyncStorage:O,serverHooks:g}=S;function D(){return(0,a.patchFetch)({workAsyncStorage:M,workUnitAsyncStorage:O})}async function m(e,t,r){S.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let s="/api/customers/route";s=s.replace(/\/index$/,"")||"/";let a=await S.prepare(e,t,{srcPage:s,multiZoneDraftMode:!1});if(!a)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:p,params:C,nextConfig:D,parsedUrl:m,isDraftMode:M,prerenderManifest:O,routerServerContext:g,isOnDemandRevalidate:F,revalidateOnlyGenerated:h,resolvedPathname:y,clientReferenceManifest:v,serverActionsManifest:x}=a,P=(0,A.normalizeAppPath)(s),b=!!(O.dynamicRoutes[P]||O.routes[y]),f=async()=>((null==g?void 0:g.render404)?await g.render404(e,t,m,!1):t.end("This page could not be found"),null);if(b&&!M){let e=!!O.routes[y],t=O.dynamicRoutes[P];if(t&&!1===t.fallback&&!e){if(D.experimental.adapterPath)return await f();throw new U.NoFallbackError}}let w=null;!b||S.isDev||M||(w=y,w="/index"===w?"/":w);let X=!0===S.isDev||!b,H=b&&!X;x&&v&&(0,E.setReferenceManifestsSingleton)({page:s,clientReferenceManifest:v,serverActionsManifest:x,serverModuleMap:(0,T.createServerModuleMap)({serverActionsManifest:x})});let V=e.method||"GET",B=(0,i.getTracer)(),q=B.getActiveScopeSpan(),k={params:C,prerenderManifest:O,renderOpts:{experimental:{authInterrupts:!!D.experimental.authInterrupts},cacheComponents:!!D.cacheComponents,supportsDynamicResponse:X,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:D.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,s)=>S.onRequestError(e,t,s,g)},sharedContext:{buildId:p}},$=new d.NodeNextRequest(e),Y=new d.NodeNextResponse(t),j=u.NextRequestAdapter.fromNodeNextRequest($,(0,u.signalFromNodeResponse)(t));try{let a=async e=>S.handle(j,k).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=B.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${V} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${V} ${s}`)}),E=!!(0,o.getRequestMeta)(e,"minimalMode"),T=async o=>{var i,T;let A=async({previousCacheEntry:n})=>{try{if(!E&&F&&h&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await a(o);e.fetchMetrics=k.renderOpts.fetchMetrics;let i=k.renderOpts.pendingWaitUntil;i&&r.waitUntil&&(r.waitUntil(i),i=void 0);let T=k.renderOpts.collectedTags;if(!b)return await (0,R.sendResponse)($,Y,s,k.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,I.toNodeOutgoingHttpHeaders)(s.headers);T&&(t[N.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==k.renderOpts.collectedRevalidate&&!(k.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&k.renderOpts.collectedRevalidate,n=void 0===k.renderOpts.collectedExpire||k.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:k.renderOpts.collectedExpire;return{value:{kind:_.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await S.onRequestError(e,t,{routerKind:"App Router",routePath:s,routeType:"route",revalidateReason:(0,l.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:F})},g),t}},d=await S.handleResponse({req:e,nextConfig:D,cacheKey:w,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:O,isRoutePPREnabled:!1,isOnDemandRevalidate:F,revalidateOnlyGenerated:h,responseGenerator:A,waitUntil:r.waitUntil,isMinimalMode:E});if(!b)return null;if((null==d||null==(i=d.value)?void 0:i.kind)!==_.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(T=d.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});E||t.setHeader("x-nextjs-cache",F?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),M&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,I.fromNodeOutgoingHttpHeaders)(d.value.headers);return E&&b||u.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,L.getCacheControlHeader)(d.cacheControl)),await (0,R.sendResponse)($,Y,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};q?await T(q):await B.withPropagatedContext(e.headers,()=>B.trace(c.BaseServerSpan.handleRequest,{spanName:`${V} ${s}`,kind:i.SpanKind.SERVER,attributes:{"http.method":V,"http.target":e.url}},T))}catch(t){if(t instanceof U.NoFallbackError||await S.onRequestError(e,t,{routerKind:"App Router",routePath:P,routeType:"route",revalidateReason:(0,l.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:F})}),b)throw t;return await (0,R.sendResponse)($,Y,new Response(null,{status:500})),null}}e.s(["handler",()=>m,"patchFetch",()=>D,"routeModule",()=>S,"serverHooks",()=>g,"workAsyncStorage",()=>M,"workUnitAsyncStorage",()=>O]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__6f5138c7._.js.map