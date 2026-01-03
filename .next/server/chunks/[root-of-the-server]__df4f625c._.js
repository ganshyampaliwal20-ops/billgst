module.exports=[70406,(e,t,n)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,n)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,n)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,n)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,n)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},93695,(e,t,n)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},30056,e=>e.a(async(t,n)=>{try{let t=await e.y("pg");e.n(t),n()}catch(e){n(e)}},!0),57218,e=>e.a(async(t,n)=>{try{let i,s;var r=e.i(30056),a=t([r]);[r]=a.then?(await a)():a;let{Pool:o}=r.default,E=process.env.DATABASE_URL;if(console.log(`DB Init: Environment Variable Type: ${typeof E}`),console.log(`DB Init: Environment Variable Length: ${E?E.length:"NULL"}`),E&&"string"==typeof E){let e=E.trim();e.startsWith('"')&&e.endsWith('"')&&(e=e.slice(1,-1)),e.startsWith("'")&&e.endsWith("'")&&(e=e.slice(1,-1)),e.includes("?")&&(e=e.split("?")[0]),e.length>0&&(s=e)}if(s?console.log(`DB Init: Connection String seems valid (starts with ${s.substring(0,10)}...)`):console.error("DB Init: Connection String is INVALID or EMPTY after sanitization."),s)try{i=new o({connectionString:s,ssl:{rejectUnauthorized:!1}}),console.log("DB Init: Pool created successfully.")}catch(e){console.error("CRITICAL: Failed to create Pool:",e),i={connect:async()=>{throw Error(`Pool Creation Failed: ${e.message}`)},query:async()=>{throw Error("Pool Creation Failed")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}}}else console.error("CRITICAL: DATABASE_URL is missing or invalid!"),i={connect:async()=>{throw console.error("Mock Pool Connect Called"),Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing. Please check Vercel Environment Variables.")},query:async()=>{throw Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing.")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}};let c=async()=>{if(!process.env.DATABASE_URL)return void console.error("Skipping initDB because DATABASE_URL is missing");let e=await i.connect();try{await e.query(`
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
      `)}catch(e){console.log("Migration note: checked invoices & customers columns")}console.log("Database tables created/verified successfully")}finally{e.release()}},T=i;e.s(["default",0,T,"initDB",0,c]),n()}catch(e){n(e)}},!1),99929,e=>e.a(async(t,n)=>{try{var r=e.i(49486),a=e.i(57218),i=t([a]);async function s(e){try{let t=await e.json(),n={receivedData:t,customerType:typeof t.customer,customerValue:t.customer,customerId:"object"==typeof t.customer?t.customer?.id:t.customer,hasItems:!!t.items,itemsCount:t.items?.length||0,firstItem:t.items?.[0]||null},i=await a.default.connect();return await i.query("SELECT NOW()"),i.release(),r.NextResponse.json({status:"success",message:"Diagnostics completed",diagnostics:n,database:"connected"})}catch(e){return r.NextResponse.json({status:"error",message:e instanceof Error?e.message:"Unknown error",stack:e instanceof Error?e.stack:null},{status:500})}}[a]=i.then?(await i)():i,e.s(["POST",()=>s]),n()}catch(e){n(e)}},!1),31950,e=>e.a(async(t,n)=>{try{var r=e.i(19878),a=e.i(48499),i=e.i(82967),s=e.i(35670),o=e.i(11664),E=e.i(15322),c=e.i(21442),T=e.i(38067),A=e.i(47920),d=e.i(51399),l=e.i(79492),u=e.i(54758),R=e.i(92873),p=e.i(72015),I=e.i(54934),L=e.i(91087),C=e.i(93695);e.i(54423);var N=e.i(88506),U=e.i(99929),D=t([U]);[U]=D.then?(await D)():D;let m=new r.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/invoices/test/route",pathname:"/api/invoices/test",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/Desktop/bill/app/api/invoices/test/route.ts",nextConfigOutput:"",userland:U}),{workAsyncStorage:v,workUnitAsyncStorage:M,serverHooks:O}=m;function S(){return(0,i.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:M})}async function _(e,t,n){m.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/invoices/test/route";r=r.replace(/\/index$/,"")||"/";let i=await m.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:U,params:D,nextConfig:S,parsedUrl:_,isDraftMode:v,prerenderManifest:M,routerServerContext:O,isOnDemandRevalidate:h,revalidateOnlyGenerated:g,resolvedPathname:y,clientReferenceManifest:F,serverActionsManifest:x}=i,P=(0,T.normalizeAppPath)(r),f=!!(M.dynamicRoutes[P]||M.routes[y]),w=async()=>((null==O?void 0:O.render404)?await O.render404(e,t,_,!1):t.end("This page could not be found"),null);if(f&&!v){let e=!!M.routes[y],t=M.dynamicRoutes[P];if(t&&!1===t.fallback&&!e){if(S.experimental.adapterPath)return await w();throw new C.NoFallbackError}}let b=null;!f||m.isDev||v||(b=y,b="/index"===b?"/":b);let H=!0===m.isDev||!f,X=f&&!H;x&&F&&(0,E.setReferenceManifestsSingleton)({page:r,clientReferenceManifest:F,serverActionsManifest:x,serverModuleMap:(0,c.createServerModuleMap)({serverActionsManifest:x})});let B=e.method||"GET",V=(0,o.getTracer)(),k=V.getActiveScopeSpan(),q={params:D,prerenderManifest:M,renderOpts:{experimental:{authInterrupts:!!S.experimental.authInterrupts},cacheComponents:!!S.cacheComponents,supportsDynamicResponse:H,incrementalCache:(0,s.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:S.cacheLife,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,n,r)=>m.onRequestError(e,t,r,O)},sharedContext:{buildId:U}},j=new A.NodeNextRequest(e),Y=new A.NodeNextResponse(t),K=d.NextRequestAdapter.fromNodeNextRequest(j,(0,d.signalFromNodeResponse)(t));try{let i=async e=>m.handle(K,q).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let n=V.getRootSpanAttributes();if(!n)return;if(n.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${n.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=n.get("next.route");if(a){let t=`${B} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${B} ${r}`)}),E=!!(0,s.getRequestMeta)(e,"minimalMode"),c=async s=>{var o,c;let T=async({previousCacheEntry:a})=>{try{if(!E&&h&&g&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await i(s);e.fetchMetrics=q.renderOpts.fetchMetrics;let o=q.renderOpts.pendingWaitUntil;o&&n.waitUntil&&(n.waitUntil(o),o=void 0);let c=q.renderOpts.collectedTags;if(!f)return await (0,R.sendResponse)(j,Y,r,q.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(r.headers);c&&(t[L.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let n=void 0!==q.renderOpts.collectedRevalidate&&!(q.renderOpts.collectedRevalidate>=L.INFINITE_CACHE)&&q.renderOpts.collectedRevalidate,a=void 0===q.renderOpts.collectedExpire||q.renderOpts.collectedExpire>=L.INFINITE_CACHE?void 0:q.renderOpts.collectedExpire;return{value:{kind:N.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:n,expire:a}}}}catch(t){throw(null==a?void 0:a.isStale)&&await m.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:X,isOnDemandRevalidate:h})},O),t}},A=await m.handleResponse({req:e,nextConfig:S,cacheKey:b,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:M,isRoutePPREnabled:!1,isOnDemandRevalidate:h,revalidateOnlyGenerated:g,responseGenerator:T,waitUntil:n.waitUntil,isMinimalMode:E});if(!f)return null;if((null==A||null==(o=A.value)?void 0:o.kind)!==N.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==A||null==(c=A.value)?void 0:c.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});E||t.setHeader("x-nextjs-cache",h?"REVALIDATED":A.isMiss?"MISS":A.isStale?"STALE":"HIT"),v&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,p.fromNodeOutgoingHttpHeaders)(A.value.headers);return E&&f||d.delete(L.NEXT_CACHE_TAGS_HEADER),!A.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,I.getCacheControlHeader)(A.cacheControl)),await (0,R.sendResponse)(j,Y,new Response(A.value.body,{headers:d,status:A.value.status||200})),null};k?await c(k):await V.withPropagatedContext(e.headers,()=>V.trace(l.BaseServerSpan.handleRequest,{spanName:`${B} ${r}`,kind:o.SpanKind.SERVER,attributes:{"http.method":B,"http.target":e.url}},c))}catch(t){if(t instanceof C.NoFallbackError||await m.onRequestError(e,t,{routerKind:"App Router",routePath:P,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:X,isOnDemandRevalidate:h})}),f)throw t;return await (0,R.sendResponse)(j,Y,new Response(null,{status:500})),null}}e.s(["handler",()=>_,"patchFetch",()=>S,"routeModule",()=>m,"serverHooks",()=>O,"workAsyncStorage",()=>v,"workUnitAsyncStorage",()=>M]),n()}catch(e){n(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__df4f625c._.js.map