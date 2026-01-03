module.exports=[70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},6461,(e,t,r)=>{t.exports=e.x("zlib",()=>require("zlib"))},49719,(e,t,r)=>{t.exports=e.x("assert",()=>require("assert"))},874,(e,t,r)=>{t.exports=e.x("buffer",()=>require("buffer"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},30056,e=>e.a(async(t,r)=>{try{let t=await e.y("pg");e.n(t),r()}catch(e){r(e)}},!0),57218,e=>e.a(async(t,r)=>{try{let i,o;var n=e.i(30056),a=t([n]);[n]=a.then?(await a)():a;let{Pool:s}=n.default,E=process.env.DATABASE_URL;if(console.log(`DB Init: Environment Variable Type: ${typeof E}`),console.log(`DB Init: Environment Variable Length: ${E?E.length:"NULL"}`),E&&"string"==typeof E){let e=E.trim();e.startsWith('"')&&e.endsWith('"')&&(e=e.slice(1,-1)),e.startsWith("'")&&e.endsWith("'")&&(e=e.slice(1,-1)),e.includes("?")&&(e=e.split("?")[0]),e.length>0&&(o=e)}if(o?console.log(`DB Init: Connection String seems valid (starts with ${o.substring(0,10)}...)`):console.error("DB Init: Connection String is INVALID or EMPTY after sanitization."),o)try{i=new s({connectionString:o,ssl:{rejectUnauthorized:!1}}),console.log("DB Init: Pool created successfully.")}catch(e){console.error("CRITICAL: Failed to create Pool:",e),i={connect:async()=>{throw Error(`Pool Creation Failed: ${e.message}`)},query:async()=>{throw Error("Pool Creation Failed")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}}}else console.error("CRITICAL: DATABASE_URL is missing or invalid!"),i={connect:async()=>{throw console.error("Mock Pool Connect Called"),Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing. Please check Vercel Environment Variables.")},query:async()=>{throw Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing.")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}};let c=async()=>{if(!process.env.DATABASE_URL)return void console.error("Skipping initDB because DATABASE_URL is missing");let e=await i.connect();try{await e.query(`
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
      `)}catch(e){console.log("Migration note: checked invoices & customers columns")}console.log("Database tables created/verified successfully")}finally{e.release()}},l=i;e.s(["default",0,l,"initDB",0,c]),r()}catch(e){r(e)}},!1),54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},92509,(e,t,r)=>{t.exports=e.x("url",()=>require("url"))},21517,(e,t,r)=>{t.exports=e.x("http",()=>require("http"))},24836,(e,t,r)=>{t.exports=e.x("https",()=>require("https"))},27699,(e,t,r)=>{t.exports=e.x("events",()=>require("events"))},9279,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0})},59188,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={};Object.defineProperty(r,"default",{enumerable:!0,get:function(){return i.default}});var a=e.r(9279);Object.keys(a).forEach(function(e){"default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(n,e)||e in r&&r[e]===a[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return a[e]}})});var i=function(e,t){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=o(void 0);if(r&&r.has(e))return r.get(e);var n={__proto__:null},a=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var i in e)if("default"!==i&&({}).hasOwnProperty.call(e,i)){var s=a?Object.getOwnPropertyDescriptor(e,i):null;s&&(s.get||s.set)?Object.defineProperty(n,i,s):n[i]=e[i]}return n.default=e,r&&r.set(e,n),n}(e.r(97857));function o(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,r=new WeakMap;return(o=function(e){return e?r:t})(e)}Object.keys(i).forEach(function(e){"default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(n,e)||e in r&&r[e]===i[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return i[e]}})})},45865,e=>e.a(async(t,r)=>{try{var n=e.i(59188),a=e.i(20858),i=t([a]);[a]=i.then?(await i)():i;let o=(0,n.default)(a.authOptions);e.s(["GET",()=>o,"POST",()=>o]),r()}catch(e){r(e)}},!1),58471,e=>e.a(async(t,r)=>{try{var n=e.i(19878),a=e.i(48499),i=e.i(82967),o=e.i(35670),s=e.i(11664),E=e.i(15322),c=e.i(21442),l=e.i(38067),u=e.i(47920),d=e.i(51399),T=e.i(79492),A=e.i(54758),R=e.i(92873),p=e.i(72015),I=e.i(54934),L=e.i(91087),C=e.i(93695);e.i(54423);var N=e.i(88506),U=e.i(45865),_=t([U]);[U]=_.then?(await _)():_;let O=new n.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/auth/[...nextauth]/route",pathname:"/api/auth/[...nextauth]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/Desktop/bill/app/api/auth/[...nextauth]/route.js",nextConfigOutput:"",userland:U}),{workAsyncStorage:v,workUnitAsyncStorage:M,serverHooks:m}=O;function D(){return(0,i.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:M})}async function S(e,t,r){O.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/auth/[...nextauth]/route";n=n.replace(/\/index$/,"")||"/";let i=await O.prepare(e,t,{srcPage:n,multiZoneDraftMode:!1});if(!i)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:U,params:_,nextConfig:D,parsedUrl:S,isDraftMode:v,prerenderManifest:M,routerServerContext:m,isOnDemandRevalidate:h,revalidateOnlyGenerated:y,resolvedPathname:f,clientReferenceManifest:g,serverActionsManifest:x}=i,F=(0,l.normalizeAppPath)(n),P=!!(M.dynamicRoutes[F]||M.routes[f]),b=async()=>((null==m?void 0:m.render404)?await m.render404(e,t,S,!1):t.end("This page could not be found"),null);if(P&&!v){let e=!!M.routes[f],t=M.dynamicRoutes[F];if(t&&!1===t.fallback&&!e){if(D.experimental.adapterPath)return await b();throw new C.NoFallbackError}}let w=null;!P||O.isDev||v||(w=f,w="/index"===w?"/":w);let H=!0===O.isDev||!P,X=P&&!H;x&&g&&(0,E.setReferenceManifestsSingleton)({page:n,clientReferenceManifest:g,serverActionsManifest:x,serverModuleMap:(0,c.createServerModuleMap)({serverActionsManifest:x})});let B=e.method||"GET",k=(0,s.getTracer)(),V=k.getActiveScopeSpan(),q={params:_,prerenderManifest:M,renderOpts:{experimental:{authInterrupts:!!D.experimental.authInterrupts},cacheComponents:!!D.cacheComponents,supportsDynamicResponse:H,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:D.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n)=>O.onRequestError(e,t,n,m)},sharedContext:{buildId:U}},j=new u.NodeNextRequest(e),Y=new u.NodeNextResponse(t),K=d.NextRequestAdapter.fromNodeNextRequest(j,(0,d.signalFromNodeResponse)(t));try{let i=async e=>O.handle(K,q).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=k.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==T.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${B} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${B} ${n}`)}),E=!!(0,o.getRequestMeta)(e,"minimalMode"),c=async o=>{var s,c;let l=async({previousCacheEntry:a})=>{try{if(!E&&h&&y&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await i(o);e.fetchMetrics=q.renderOpts.fetchMetrics;let s=q.renderOpts.pendingWaitUntil;s&&r.waitUntil&&(r.waitUntil(s),s=void 0);let c=q.renderOpts.collectedTags;if(!P)return await (0,R.sendResponse)(j,Y,n,q.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(n.headers);c&&(t[L.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==q.renderOpts.collectedRevalidate&&!(q.renderOpts.collectedRevalidate>=L.INFINITE_CACHE)&&q.renderOpts.collectedRevalidate,a=void 0===q.renderOpts.collectedExpire||q.renderOpts.collectedExpire>=L.INFINITE_CACHE?void 0:q.renderOpts.collectedExpire;return{value:{kind:N.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==a?void 0:a.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,A.getRevalidateReason)({isStaticGeneration:X,isOnDemandRevalidate:h})},m),t}},u=await O.handleResponse({req:e,nextConfig:D,cacheKey:w,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:M,isRoutePPREnabled:!1,isOnDemandRevalidate:h,revalidateOnlyGenerated:y,responseGenerator:l,waitUntil:r.waitUntil,isMinimalMode:E});if(!P)return null;if((null==u||null==(s=u.value)?void 0:s.kind)!==N.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(c=u.value)?void 0:c.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});E||t.setHeader("x-nextjs-cache",h?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),v&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,p.fromNodeOutgoingHttpHeaders)(u.value.headers);return E&&P||d.delete(L.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,I.getCacheControlHeader)(u.cacheControl)),await (0,R.sendResponse)(j,Y,new Response(u.value.body,{headers:d,status:u.value.status||200})),null};V?await c(V):await k.withPropagatedContext(e.headers,()=>k.trace(T.BaseServerSpan.handleRequest,{spanName:`${B} ${n}`,kind:s.SpanKind.SERVER,attributes:{"http.method":B,"http.target":e.url}},c))}catch(t){if(t instanceof C.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:F,routeType:"route",revalidateReason:(0,A.getRevalidateReason)({isStaticGeneration:X,isOnDemandRevalidate:h})}),P)throw t;return await (0,R.sendResponse)(j,Y,new Response(null,{status:500})),null}}e.s(["handler",()=>S,"patchFetch",()=>D,"routeModule",()=>O,"serverHooks",()=>m,"workAsyncStorage",()=>v,"workUnitAsyncStorage",()=>M]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__8a640998._.js.map