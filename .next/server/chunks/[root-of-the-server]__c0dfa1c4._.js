module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},6461,(e,t,r)=>{t.exports=e.x("zlib",()=>require("zlib"))},49719,(e,t,r)=>{t.exports=e.x("assert",()=>require("assert"))},874,(e,t,r)=>{t.exports=e.x("buffer",()=>require("buffer"))},30056,e=>e.a(async(t,r)=>{try{let t=await e.y("pg");e.n(t),r()}catch(e){r(e)}},!0),57218,e=>e.a(async(t,r)=>{try{let o,i;var n=e.i(30056),a=t([n]);[n]=a.then?(await a)():a;let{Pool:s}=n.default,E=process.env.DATABASE_URL;if(console.log(`DB Init: Environment Variable Type: ${typeof E}`),console.log(`DB Init: Environment Variable Length: ${E?E.length:"NULL"}`),E&&"string"==typeof E){let e=E.trim();e.startsWith('"')&&e.endsWith('"')&&(e=e.slice(1,-1)),e.startsWith("'")&&e.endsWith("'")&&(e=e.slice(1,-1)),e.includes("?")&&(e=e.split("?")[0]),e.length>0&&(i=e)}if(i?console.log(`DB Init: Connection String seems valid (starts with ${i.substring(0,10)}...)`):console.error("DB Init: Connection String is INVALID or EMPTY after sanitization."),i)try{o=new s({connectionString:i,ssl:{rejectUnauthorized:!1}}),console.log("DB Init: Pool created successfully.")}catch(e){console.error("CRITICAL: Failed to create Pool:",e),o={connect:async()=>{throw Error(`Pool Creation Failed: ${e.message}`)},query:async()=>{throw Error("Pool Creation Failed")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}}}else console.error("CRITICAL: DATABASE_URL is missing or invalid!"),o={connect:async()=>{throw console.error("Mock Pool Connect Called"),Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing. Please check Vercel Environment Variables.")},query:async()=>{throw Error("DATABASE CONFIGURATION ERROR: DATABASE_URL is missing.")},on:()=>{},totalCount:0,idleCount:0,waitingCount:0,end:async()=>{}};let d=async()=>{if(!process.env.DATABASE_URL)return void console.error("Skipping initDB because DATABASE_URL is missing");let e=await o.connect();try{await e.query(`
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
      `)}catch(e){console.log("Migration note: checked invoices & customers columns")}console.log("Database tables created/verified successfully")}finally{e.release()}},T=o;e.s(["default",0,T,"initDB",0,d]),r()}catch(e){r(e)}},!1),54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},92509,(e,t,r)=>{t.exports=e.x("url",()=>require("url"))},21517,(e,t,r)=>{t.exports=e.x("http",()=>require("http"))},24836,(e,t,r)=>{t.exports=e.x("https",()=>require("https"))},27699,(e,t,r)=>{t.exports=e.x("events",()=>require("events"))},22734,(e,t,r)=>{t.exports=e.x("fs",()=>require("fs"))},88947,(e,t,r)=>{t.exports=e.x("stream",()=>require("stream"))},9279,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0})},59188,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={};Object.defineProperty(r,"default",{enumerable:!0,get:function(){return o.default}});var a=e.r(9279);Object.keys(a).forEach(function(e){"default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(n,e)||e in r&&r[e]===a[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return a[e]}})});var o=function(e,t){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=i(void 0);if(r&&r.has(e))return r.get(e);var n={__proto__:null},a=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if("default"!==o&&({}).hasOwnProperty.call(e,o)){var s=a?Object.getOwnPropertyDescriptor(e,o):null;s&&(s.get||s.set)?Object.defineProperty(n,o,s):n[o]=e[o]}return n.default=e,r&&r.set(e,n),n}(e.r(97857));function i(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,r=new WeakMap;return(i=function(e){return e?r:t})(e)}Object.keys(o).forEach(function(e){"default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(n,e)||e in r&&r[e]===o[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return o[e]}})})},65974,e=>e.a(async(t,r)=>{try{var n=e.i(49486),a=e.i(57218),o=e.i(59188),i=e.i(42337),s=t([a]);async function E(e){try{if(!await (0,o.getServerSession)())return n.NextResponse.json({error:"Unauthorized"},{status:401});let{invoice_id:t,recipient_email:r,message:s}=await e.json();if(!t||!r)return n.NextResponse.json({error:"Invoice ID and recipient email required"},{status:400});let E=await a.default.query(`SELECT i.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = $1`,[t]);if(0===E.rows.length)return n.NextResponse.json({error:"Invoice not found"},{status:404});let d=E.rows[0],T=(await a.default.query("SELECT * FROM invoice_items WHERE invoice_id = $1",[t])).rows,c=i.default.createTransport({service:"gmail",auth:{user:process.env.SMTP_EMAIL,pass:process.env.SMTP_PASSWORD}}),u=T.map(e=>`
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${e.product_name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${e.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${Number(e.unit_price).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${Number(e.total_amount).toFixed(2)}</td>
      </tr>
    `).join(""),A=`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #eee; }
          .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #dee2e6; }
          .total { background: #667eea; color: white; padding: 15px; text-align: right; font-size: 18px; font-weight: bold; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice</h1>
            <p style="margin: 0; opacity: 0.9;">${d.invoice_number}</p>
          </div>
          
          <div class="content">
            <p>Dear ${d.customer_name},</p>
            <p>${s||"Please find your invoice details below."}</p>

            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${d.invoice_number}</p>
              <p><strong>Date:</strong> ${new Date(d.invoice_date).toLocaleDateString("en-IN")}</p>
              ${d.due_date?`<p><strong>Due Date:</strong> ${new Date(d.due_date).toLocaleDateString("en-IN")}</p>`:""}
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Rate</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${u}
              </tbody>
            </table>

            <div class="total">
              Total Amount: ₹${Number(d.total_amount).toLocaleString("en-IN")}
            </div>

            ${d.notes?`<p style="margin-top: 20px;"><strong>Notes:</strong><br>${d.notes}</p>`:""}
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;return await c.sendMail({from:process.env.SMTP_EMAIL,to:r,subject:`Invoice ${d.invoice_number}`,html:A}),n.NextResponse.json({success:!0,message:"Invoice sent successfully via email"})}catch(e){return console.error("Send Email Error:",e),n.NextResponse.json({error:e.message||"Failed to send email"},{status:500})}}[a]=s.then?(await s)():s,e.s(["POST",()=>E]),r()}catch(e){r(e)}},!1),44230,e=>e.a(async(t,r)=>{try{var n=e.i(19878),a=e.i(48499),o=e.i(82967),i=e.i(35670),s=e.i(11664),E=e.i(15322),d=e.i(21442),T=e.i(38067),c=e.i(47920),u=e.i(51399),A=e.i(79492),l=e.i(54758),R=e.i(92873),p=e.i(72015),I=e.i(54934),L=e.i(91087),N=e.i(93695);e.i(54423);var _=e.i(88506),U=e.i(65974),D=t([U]);[U]=D.then?(await D)():D;let S=new n.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/invoices/send-email/route",pathname:"/api/invoices/send-email",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/Desktop/bill/app/api/invoices/send-email/route.ts",nextConfigOutput:"",userland:U}),{workAsyncStorage:M,workUnitAsyncStorage:O,serverHooks:g}=S;function C(){return(0,o.patchFetch)({workAsyncStorage:M,workUnitAsyncStorage:O})}async function m(e,t,r){S.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/invoices/send-email/route";n=n.replace(/\/index$/,"")||"/";let o=await S.prepare(e,t,{srcPage:n,multiZoneDraftMode:!1});if(!o)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:U,params:D,nextConfig:C,parsedUrl:m,isDraftMode:M,prerenderManifest:O,routerServerContext:g,isOnDemandRevalidate:v,revalidateOnlyGenerated:h,resolvedPathname:x,clientReferenceManifest:y,serverActionsManifest:F}=o,b=(0,T.normalizeAppPath)(n),f=!!(O.dynamicRoutes[b]||O.routes[x]),P=async()=>((null==g?void 0:g.render404)?await g.render404(e,t,m,!1):t.end("This page could not be found"),null);if(f&&!M){let e=!!O.routes[x],t=O.dynamicRoutes[b];if(t&&!1===t.fallback&&!e){if(C.experimental.adapterPath)return await P();throw new N.NoFallbackError}}let w=null;!f||S.isDev||M||(w=x,w="/index"===w?"/":w);let X=!0===S.isDev||!f,H=f&&!X;F&&y&&(0,E.setReferenceManifestsSingleton)({page:n,clientReferenceManifest:y,serverActionsManifest:F,serverModuleMap:(0,d.createServerModuleMap)({serverActionsManifest:F})});let V=e.method||"GET",B=(0,s.getTracer)(),q=B.getActiveScopeSpan(),k={params:D,prerenderManifest:O,renderOpts:{experimental:{authInterrupts:!!C.experimental.authInterrupts},cacheComponents:!!C.cacheComponents,supportsDynamicResponse:X,incrementalCache:(0,i.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:C.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n)=>S.onRequestError(e,t,n,g)},sharedContext:{buildId:U}},j=new c.NodeNextRequest(e),$=new c.NodeNextResponse(t),Y=u.NextRequestAdapter.fromNodeNextRequest(j,(0,u.signalFromNodeResponse)(t));try{let o=async e=>S.handle(Y,k).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=B.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==A.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${V} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${V} ${n}`)}),E=!!(0,i.getRequestMeta)(e,"minimalMode"),d=async i=>{var s,d;let T=async({previousCacheEntry:a})=>{try{if(!E&&v&&h&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await o(i);e.fetchMetrics=k.renderOpts.fetchMetrics;let s=k.renderOpts.pendingWaitUntil;s&&r.waitUntil&&(r.waitUntil(s),s=void 0);let d=k.renderOpts.collectedTags;if(!f)return await (0,R.sendResponse)(j,$,n,k.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(n.headers);d&&(t[L.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==k.renderOpts.collectedRevalidate&&!(k.renderOpts.collectedRevalidate>=L.INFINITE_CACHE)&&k.renderOpts.collectedRevalidate,a=void 0===k.renderOpts.collectedExpire||k.renderOpts.collectedExpire>=L.INFINITE_CACHE?void 0:k.renderOpts.collectedExpire;return{value:{kind:_.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==a?void 0:a.isStale)&&await S.onRequestError(e,t,{routerKind:"App Router",routePath:n,routeType:"route",revalidateReason:(0,l.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:v})},g),t}},c=await S.handleResponse({req:e,nextConfig:C,cacheKey:w,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:O,isRoutePPREnabled:!1,isOnDemandRevalidate:v,revalidateOnlyGenerated:h,responseGenerator:T,waitUntil:r.waitUntil,isMinimalMode:E});if(!f)return null;if((null==c||null==(s=c.value)?void 0:s.kind)!==_.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(d=c.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});E||t.setHeader("x-nextjs-cache",v?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),M&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,p.fromNodeOutgoingHttpHeaders)(c.value.headers);return E&&f||u.delete(L.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,I.getCacheControlHeader)(c.cacheControl)),await (0,R.sendResponse)(j,$,new Response(c.value.body,{headers:u,status:c.value.status||200})),null};q?await d(q):await B.withPropagatedContext(e.headers,()=>B.trace(A.BaseServerSpan.handleRequest,{spanName:`${V} ${n}`,kind:s.SpanKind.SERVER,attributes:{"http.method":V,"http.target":e.url}},d))}catch(t){if(t instanceof N.NoFallbackError||await S.onRequestError(e,t,{routerKind:"App Router",routePath:b,routeType:"route",revalidateReason:(0,l.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:v})}),f)throw t;return await (0,R.sendResponse)(j,$,new Response(null,{status:500})),null}}e.s(["handler",()=>m,"patchFetch",()=>C,"routeModule",()=>S,"serverHooks",()=>g,"workAsyncStorage",()=>M,"workUnitAsyncStorage",()=>O]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__c0dfa1c4._.js.map