module.exports=[70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},6461,(e,t,r)=>{t.exports=e.x("zlib",()=>require("zlib"))},49719,(e,t,r)=>{t.exports=e.x("assert",()=>require("assert"))},874,(e,t,r)=>{t.exports=e.x("buffer",()=>require("buffer"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},30056,e=>e.a(async(t,r)=>{try{let t=await e.y("pg");e.n(t),r()}catch(e){r(e)}},!0),57218,e=>e.a(async(t,r)=>{try{let s,a;var n=e.i(30056),o=t([n]);[n]=o.then?(await o)():o;let{Pool:i}=n.default,E=process.env.DATABASE_URL;if(console.log(`DB Init: Environment Variable Type: ${typeof E}`),console.log(`DB Init: Environment Variable Length: ${E?E.length:"NULL"}`),E&&"string"==typeof E){let e=E.trim();e.startsWith('"')&&e.endsWith('"')&&(e=e.slice(1,-1)),e.startsWith("'")&&e.endsWith("'")&&(e=e.slice(1,-1)),e.includes("?")&&(e=e.split("?")[0]),e.length>0&&(a=e)}if(a?console.log(`DB Init: Connection String seems valid (starts with ${a.substring(0,10)}...)`):console.error("DB Init: Connection String is INVALID or EMPTY after sanitization."),a)try{s=new i({connectionString:a,ssl:{rejectUnauthorized:!1}}),console.log("DB Init: Pool created successfully.")}catch(e){console.error("CRITICAL: Failed to create Pool:",e),s={connect:async()=>{throw Error(`Pool Creation Failed: ${e.message}`)},query:async()=>{throw Error("Pool Creation Failed")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}}}else console.error("CRITICAL: DATABASE_URL is missing or invalid!"),s={connect:async()=>{throw console.error("Mock Pool Connect Called"),Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing. Please check Vercel Environment Variables.")},query:async()=>{throw Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing.")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}};let c=async()=>{if(!process.env.DATABASE_URL)return void console.error("Skipping initDB because DATABASE_URL is missing");let e=await s.connect();try{await e.query(`
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
    `);try{await e.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'PRODUCT';")}catch(e){console.log("Migration note: checked products.type")}try{await e.query(`
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
      `)}catch(e){console.log("Migration note: checked invoices & customers columns")}console.log("Database tables created/verified successfully")}finally{e.release()}},d=s;e.s(["default",0,d,"initDB",0,c]),r()}catch(e){r(e)}},!1),54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},92509,(e,t,r)=>{t.exports=e.x("url",()=>require("url"))},21517,(e,t,r)=>{t.exports=e.x("http",()=>require("http"))},24836,(e,t,r)=>{t.exports=e.x("https",()=>require("https"))},27699,(e,t,r)=>{t.exports=e.x("events",()=>require("events"))},66680,(e,t,r)=>{t.exports=e.x("node:crypto",()=>require("node:crypto"))},38521,e=>{"use strict";var t=e.i(66680);let r={randomUUID:t.randomUUID},n=new Uint8Array(256),o=n.length,s=[];for(let e=0;e<256;++e)s.push((e+256).toString(16).slice(1));e.s(["v4",0,function(e,a,i){if(r.randomUUID&&!a&&!e)return r.randomUUID();var E=e,c=i;let d=(E=E||{}).random??E.rng?.()??(o>n.length-16&&((0,t.randomFillSync)(n),o=0),n.slice(o,o+=16));if(d.length<16)throw Error("Random bytes length must be >= 16");if(d[6]=15&d[6]|64,d[8]=63&d[8]|128,a){if((c=c||0)<0||c+16>a.length)throw RangeError(`UUID byte range ${c}:${c+15} is out of buffer bounds`);for(let e=0;e<16;++e)a[c+e]=d[e];return a}return function(e,t=0){return(s[e[t+0]]+s[e[t+1]]+s[e[t+2]]+s[e[t+3]]+"-"+s[e[t+4]]+s[e[t+5]]+"-"+s[e[t+6]]+s[e[t+7]]+"-"+s[e[t+8]]+s[e[t+9]]+"-"+s[e[t+10]]+s[e[t+11]]+s[e[t+12]]+s[e[t+13]]+s[e[t+14]]+s[e[t+15]]).toLowerCase()}(d)}],38521)},28603,e=>e.a(async(t,r)=>{try{var n=e.i(49486),o=e.i(57218),s=e.i(38521),a=e.i(97857),i=e.i(20858),E=t([o,i]);async function c(){try{let e=await (0,a.getServerSession)(i.authOptions);if(!e?.user?.id)return n.NextResponse.json({error:"Please create an account or login to continue"},{status:401});let t=await o.default.connect(),r=await t.query("SELECT * FROM customers WHERE created_by = $1 ORDER BY created_at DESC",[e.user.id]);return t.release(),n.NextResponse.json(r.rows)}catch(e){return console.error("Error fetching customers:",e),n.NextResponse.json({error:"Failed to fetch customers"},{status:500})}}async function d(e){let t=await (0,a.getServerSession)(i.authOptions);if(console.log("Customer API Debug: Session Check",{hasSession:!!t,userId:t?.user?.id}),!t?.user?.id)return n.NextResponse.json({error:"Please create an account or login to continue"},{status:401});let r=t.user.id;try{let t=await e.json();console.log("API: Creating customer:",t);let a=await o.default.connect();t.id||(t.id=(0,s.v4)());try{let e=await a.query(`INSERT INTO customers (id, name, email, phone, gstin, address, created_by, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
           RETURNING *`,[t.id,t.name,t.email,t.phone,t.gstin,t.address,r]);return console.log("API: Customer Inserted:",e.rows[0]),a.release(),n.NextResponse.json(e.rows[0])}catch(e){if(e?.code==="42703"){console.log("Customer API: Missing columns detected. Attempting auto-migration..."),await a.query(`
                    ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
                `);let e=await a.query(`INSERT INTO customers (id, name, email, phone, gstin, address, created_by, created_at) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
               RETURNING *`,[t.id,t.name,t.email,t.phone,t.gstin,t.address,r]);return a.release(),n.NextResponse.json(e.rows[0])}throw e}}catch(e){return console.error("API Error creating customer:",e),n.NextResponse.json({error:"Failed to create customer"},{status:500})}}[o,i]=E.then?(await E)():E,e.s(["GET",()=>c,"POST",()=>d]),r()}catch(e){r(e)}},!1),86405,e=>e.a(async(t,r)=>{try{var n=e.i(19878),o=e.i(48499),s=e.i(82967),a=e.i(35670),i=e.i(11664),E=e.i(15322),c=e.i(21442),d=e.i(38067),l=e.i(47920),u=e.i(51399),T=e.i(79492),A=e.i(54758),R=e.i(92873),p=e.i(72015),I=e.i(54934),L=e.i(91087),N=e.i(93695);e.i(54423);var C=e.i(88506),U=e.i(28603),D=t([U]);[U]=D.then?(await D)():D;let _=new n.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/customers/route",pathname:"/api/customers",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/Desktop/bill/app/api/customers/route.ts",nextConfigOutput:"",userland:U}),{workAsyncStorage:h,workUnitAsyncStorage:g,serverHooks:v}=_;function S(){return(0,s.patchFetch)({workAsyncStorage:h,workUnitAsyncStorage:g})}async function m(e,t,r){_.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/customers/route";n=n.replace(/\/index$/,"")||"/";let s=await _.prepare(e,t,{srcPage:n,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:U,params:D,nextConfig:S,parsedUrl:m,isDraftMode:h,prerenderManifest:g,routerServerContext:v,isOnDemandRevalidate:O,revalidateOnlyGenerated:M,resolvedPathname:y,clientReferenceManifest:x,serverActionsManifest:F}=s,f=(0,d.normalizeAppPath)(n),w=!!(g.dynamicRoutes[f]||g.routes[y]),P=async()=>((null==v?void 0:v.render404)?await v.render404(e,t,m,!1):t.end("This page could not be found"),null);if(w&&!h){let e=!!g.routes[y],t=g.dynamicRoutes[f];if(t&&!1===t.fallback&&!e){if(S.experimental.adapterPath)return await P();throw new N.NoFallbackError}}let b=null;!w||_.isDev||h||(b=y,b="/index"===b?"/":b);let H=!0===_.isDev||!w,X=w&&!H;F&&x&&(0,E.setReferenceManifestsSingleton)({page:n,clientReferenceManifest:x,serverActionsManifest:F,serverModuleMap:(0,c.createServerModuleMap)({serverActionsManifest:F})});let B=e.method||"GET",V=(0,i.getTracer)(),q=V.getActiveScopeSpan(),k={params:D,prerenderManifest:g,renderOpts:{experimental:{authInterrupts:!!S.experimental.authInterrupts},cacheComponents:!!S.cacheComponents,supportsDynamicResponse:H,incrementalCache:(0,a.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:S.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n)=>_.onRequestError(e,t,n,v)},sharedContext:{buildId:U}},$=new l.NodeNextRequest(e),j=new l.NodeNextResponse(t),Y=u.NextRequestAdapter.fromNodeNextRequest($,(0,u.signalFromNodeResponse)(t));try{let s=async e=>_.handle(Y,k).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=V.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==T.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=r.get("next.route");if(o){let t=`${B} ${o}`;e.setAttributes({"next.route":o,"http.route":o,"next.span_name":t}),e.updateName(t)}else e.updateName(`${B} ${n}`)}),E=!!(0,a.getRequestMeta)(e,"minimalMode"),c=async a=>{var i,c;let d=async({previousCacheEntry:o})=>{try{if(!E&&O&&M&&!o)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(a);e.fetchMetrics=k.renderOpts.fetchMetrics;let i=k.renderOpts.pendingWaitUntil;i&&r.waitUntil&&(r.waitUntil(i),i=void 0);let c=k.renderOpts.collectedTags;if(!w)return await (0,R.sendResponse)($,j,n,k.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(n.headers);c&&(t[L.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==k.renderOpts.collectedRevalidate&&!(k.renderOpts.collectedRevalidate>=L.INFINITE_CACHE)&&k.renderOpts.collectedRevalidate,o=void 0===k.renderOpts.collectedExpire||k.renderOpts.collectedExpire>=L.INFINITE_CACHE?void 0:k.renderOpts.collectedExpire;return{value:{kind:C.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:o}}}}catch(t){throw(null==o?void 0:o.isStale)&&await _.onRequestError(e,t,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,A.getRevalidateReason)({isStaticGeneration:X,isOnDemandRevalidate:O})},v),t}},l=await _.handleResponse({req:e,nextConfig:S,cacheKey:b,routeKind:o.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:g,isRoutePPREnabled:!1,isOnDemandRevalidate:O,revalidateOnlyGenerated:M,responseGenerator:d,waitUntil:r.waitUntil,isMinimalMode:E});if(!w)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==C.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(c=l.value)?void 0:c.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});E||t.setHeader("x-nextjs-cache",O?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),h&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return E&&w||u.delete(L.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,I.getCacheControlHeader)(l.cacheControl)),await (0,R.sendResponse)($,j,new Response(l.value.body,{headers:u,status:l.value.status||200})),null};q?await c(q):await V.withPropagatedContext(e.headers,()=>V.trace(T.BaseServerSpan.handleRequest,{spanName:`${B} ${n}`,kind:i.SpanKind.SERVER,attributes:{"http.method":B,"http.target":e.url}},c))}catch(t){if(t instanceof N.NoFallbackError||await _.onRequestError(e,t,{routerKind:"App Router",routePath:f,routeType:"route",revalidateReason:(0,A.getRevalidateReason)({isStaticGeneration:X,isOnDemandRevalidate:O})}),w)throw t;return await (0,R.sendResponse)($,j,new Response(null,{status:500})),null}}e.s(["handler",()=>m,"patchFetch",()=>S,"routeModule",()=>_,"serverHooks",()=>v,"workAsyncStorage",()=>h,"workUnitAsyncStorage",()=>g]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__25ae7fb2._.js.map