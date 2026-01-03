module.exports=[70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},6461,(e,t,r)=>{t.exports=e.x("zlib",()=>require("zlib"))},49719,(e,t,r)=>{t.exports=e.x("assert",()=>require("assert"))},874,(e,t,r)=>{t.exports=e.x("buffer",()=>require("buffer"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},30056,e=>e.a(async(t,r)=>{try{let t=await e.y("pg");e.n(t),r()}catch(e){r(e)}},!0),57218,e=>e.a(async(t,r)=>{try{let s,o;var n=e.i(30056),i=t([n]);[n]=i.then?(await i)():i;let{Pool:a}=n.default,E=process.env.DATABASE_URL;if(console.log(`DB Init: Environment Variable Type: ${typeof E}`),console.log(`DB Init: Environment Variable Length: ${E?E.length:"NULL"}`),E&&"string"==typeof E){let e=E.trim();e.startsWith('"')&&e.endsWith('"')&&(e=e.slice(1,-1)),e.startsWith("'")&&e.endsWith("'")&&(e=e.slice(1,-1)),e.includes("?")&&(e=e.split("?")[0]),e.length>0&&(o=e)}if(o?console.log(`DB Init: Connection String seems valid (starts with ${o.substring(0,10)}...)`):console.error("DB Init: Connection String is INVALID or EMPTY after sanitization."),o)try{s=new a({connectionString:o,ssl:{rejectUnauthorized:!1}}),console.log("DB Init: Pool created successfully.")}catch(e){console.error("CRITICAL: Failed to create Pool:",e),s={connect:async()=>{throw Error(`Pool Creation Failed: ${e.message}`)},query:async()=>{throw Error("Pool Creation Failed")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}}}else console.error("CRITICAL: DATABASE_URL is missing or invalid!"),s={connect:async()=>{throw console.error("Mock Pool Connect Called"),Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing. Please check Vercel Environment Variables.")},query:async()=>{throw Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing.")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}};let T=async()=>{if(!process.env.DATABASE_URL)return void console.error("Skipping initDB because DATABASE_URL is missing");let e=await s.connect();try{await e.query(`
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
      `)}catch(e){console.log("Migration note: checked invoices & customers columns")}console.log("Database tables created/verified successfully")}finally{e.release()}},A=s;e.s(["default",0,A,"initDB",0,T]),r()}catch(e){r(e)}},!1),54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},92509,(e,t,r)=>{t.exports=e.x("url",()=>require("url"))},21517,(e,t,r)=>{t.exports=e.x("http",()=>require("http"))},24836,(e,t,r)=>{t.exports=e.x("https",()=>require("https"))},27699,(e,t,r)=>{t.exports=e.x("events",()=>require("events"))},66540,e=>e.a(async(t,r)=>{try{var n=e.i(49486),i=e.i(97857),s=e.i(20858),o=t([s]);async function a(e){let t=await (0,i.getServerSession)(s.authOptions);return n.NextResponse.json({status:"check",session_exists:!!t,user:t?.user||null,message:t?"Session is working on server!":"No session found (Unauthorized)",env_secret_set:!0,cookies:e.headers.get("cookie")||"none"})}[s]=o.then?(await o)():o,e.s(["GET",()=>a]),r()}catch(e){r(e)}},!1),2735,e=>e.a(async(t,r)=>{try{var n=e.i(19878),i=e.i(48499),s=e.i(82967),o=e.i(35670),a=e.i(11664),E=e.i(15322),T=e.i(21442),A=e.i(38067),c=e.i(47920),d=e.i(51399),l=e.i(79492),u=e.i(54758),R=e.i(92873),p=e.i(72015),I=e.i(54934),L=e.i(91087),C=e.i(93695);e.i(54423);var N=e.i(88506),U=e.i(66540),D=t([U]);[U]=D.then?(await D)():D;let m=new n.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/test-session/route",pathname:"/api/test-session",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/Desktop/bill/app/api/test-session/route.ts",nextConfigOutput:"",userland:U}),{workAsyncStorage:v,workUnitAsyncStorage:M,serverHooks:O}=m;function S(){return(0,s.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:M})}async function _(e,t,r){m.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/test-session/route";n=n.replace(/\/index$/,"")||"/";let s=await m.prepare(e,t,{srcPage:n,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:U,params:D,nextConfig:S,parsedUrl:_,isDraftMode:v,prerenderManifest:M,routerServerContext:O,isOnDemandRevalidate:h,revalidateOnlyGenerated:g,resolvedPathname:y,clientReferenceManifest:x,serverActionsManifest:F}=s,P=(0,A.normalizeAppPath)(n),f=!!(M.dynamicRoutes[P]||M.routes[y]),w=async()=>((null==O?void 0:O.render404)?await O.render404(e,t,_,!1):t.end("This page could not be found"),null);if(f&&!v){let e=!!M.routes[y],t=M.dynamicRoutes[P];if(t&&!1===t.fallback&&!e){if(S.experimental.adapterPath)return await w();throw new C.NoFallbackError}}let b=null;!f||m.isDev||v||(b=y,b="/index"===b?"/":b);let H=!0===m.isDev||!f,X=f&&!H;F&&x&&(0,E.setReferenceManifestsSingleton)({page:n,clientReferenceManifest:x,serverActionsManifest:F,serverModuleMap:(0,T.createServerModuleMap)({serverActionsManifest:F})});let B=e.method||"GET",k=(0,a.getTracer)(),V=k.getActiveScopeSpan(),q={params:D,prerenderManifest:M,renderOpts:{experimental:{authInterrupts:!!S.experimental.authInterrupts},cacheComponents:!!S.cacheComponents,supportsDynamicResponse:H,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:S.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n)=>m.onRequestError(e,t,n,O)},sharedContext:{buildId:U}},j=new c.NodeNextRequest(e),Y=new c.NodeNextResponse(t),K=d.NextRequestAdapter.fromNodeNextRequest(j,(0,d.signalFromNodeResponse)(t));try{let s=async e=>m.handle(K,q).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=k.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=r.get("next.route");if(i){let t=`${B} ${i}`;e.setAttributes({"next.route":i,"http.route":i,"next.span_name":t}),e.updateName(t)}else e.updateName(`${B} ${n}`)}),E=!!(0,o.getRequestMeta)(e,"minimalMode"),T=async o=>{var a,T;let A=async({previousCacheEntry:i})=>{try{if(!E&&h&&g&&!i)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(o);e.fetchMetrics=q.renderOpts.fetchMetrics;let a=q.renderOpts.pendingWaitUntil;a&&r.waitUntil&&(r.waitUntil(a),a=void 0);let T=q.renderOpts.collectedTags;if(!f)return await (0,R.sendResponse)(j,Y,n,q.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(n.headers);T&&(t[L.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==q.renderOpts.collectedRevalidate&&!(q.renderOpts.collectedRevalidate>=L.INFINITE_CACHE)&&q.renderOpts.collectedRevalidate,i=void 0===q.renderOpts.collectedExpire||q.renderOpts.collectedExpire>=L.INFINITE_CACHE?void 0:q.renderOpts.collectedExpire;return{value:{kind:N.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:i}}}}catch(t){throw(null==i?void 0:i.isStale)&&await m.onRequestError(e,t,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:X,isOnDemandRevalidate:h})},O),t}},c=await m.handleResponse({req:e,nextConfig:S,cacheKey:b,routeKind:i.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:M,isRoutePPREnabled:!1,isOnDemandRevalidate:h,revalidateOnlyGenerated:g,responseGenerator:A,waitUntil:r.waitUntil,isMinimalMode:E});if(!f)return null;if((null==c||null==(a=c.value)?void 0:a.kind)!==N.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(T=c.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});E||t.setHeader("x-nextjs-cache",h?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),v&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,p.fromNodeOutgoingHttpHeaders)(c.value.headers);return E&&f||d.delete(L.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,I.getCacheControlHeader)(c.cacheControl)),await (0,R.sendResponse)(j,Y,new Response(c.value.body,{headers:d,status:c.value.status||200})),null};V?await T(V):await k.withPropagatedContext(e.headers,()=>k.trace(l.BaseServerSpan.handleRequest,{spanName:`${B} ${n}`,kind:a.SpanKind.SERVER,attributes:{"http.method":B,"http.target":e.url}},T))}catch(t){if(t instanceof C.NoFallbackError||await m.onRequestError(e,t,{routerKind:"App Router",routePath:P,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:X,isOnDemandRevalidate:h})}),f)throw t;return await (0,R.sendResponse)(j,Y,new Response(null,{status:500})),null}}e.s(["handler",()=>_,"patchFetch",()=>S,"routeModule",()=>m,"serverHooks",()=>O,"workAsyncStorage",()=>v,"workUnitAsyncStorage",()=>M]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__52fcce5e._.js.map