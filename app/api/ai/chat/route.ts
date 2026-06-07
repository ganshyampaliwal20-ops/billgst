import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { message } = await request.json();
        const msg = message.toLowerCase();

        let reply = "";

        // Common "How-To" Instructions
        const HOW_TO_ADD_PRODUCT = "Product add karne ke liye: \n1. **Dashboard** > **Inventory** par jayein.\n2. **'Add Product'** button par click karein.\n3. Details bharke 'Save' kar dein. \n\n*Aap purane bills ki photo khinch kar 'Magic Scan' se bhi items auto-add kar sakte hain!*";
        const HOW_TO_CREATE_INVOICE = "Naya Bill banane ke liye: \n1. **Dashboard** > **Invoices** par jayein.\n2. **'New Invoice'** par click karein.\n3. Customer aur items select karke 'Generate' kar dein. \n\n*Direct shortcut: Screen ke bottom mein 'New' button bhi hai.*";
        const HOW_TO_ADD_CUSTOMER = "Customer add karne ke liye: \n1. **Dashboard** > **Customers** par jayein.\n2. **'Add Customer'** button par click karein.\n3. Naam aur phone number dalkar save karein.";

        // Feature Matchers
        if (msg.includes('vyapar') || msg.includes('viyapar')) {
            reply = "Vyapar ek purani technology hai. **BillGST** usse 10x better hai kyunki:\n\n1. **Online Store:** Aapka khud ka digital catalog.\n2. **Zero-Setup WhatsApp:** Bina number save kiye reminders.\n3. **Modern UI:** Bahut fast aur easy interface.\n4. **Magic AI:** Purane bills se auto-data entry.\n5. **Support:** Live 2-way chat support.";
        }
        else if (msg.includes('product') || msg.includes('item') || msg.includes('maal') || msg.includes('स्टॉक') || msg.includes('माल') || msg.includes('inventory')) {
            if (msg.includes('add') || msg.includes('kaise') || msg.includes('create') || msg.includes('naya') || msg.includes('jode')) {
                reply = HOW_TO_ADD_PRODUCT;
            } else {
                reply = "Inventory management ab 'Auto-Pilot' par hai. Aap products add karein aur main (AI) unka stock track karunga. Jab maal kam hoga, main low-stock alert de dunga.\n\n" + HOW_TO_ADD_PRODUCT;
            }
        }
        else if (msg.includes('invoice') || msg.includes('bill') || msg.includes('billing') || msg.includes('बिल') || msg.includes('इनवॉइस')) {
            if (msg.includes('print') || msg.includes('pdf') || msg.includes('download')) {
                reply = "Bill print karne ke liye:\n1. Kisi bhi invoice ko open karein.\n2. Upar **'Print'** button par click karein.\n3. Direct print nikal jayega!";
            } else {
                reply = "BillGST par billing super-fast hai. Aap 5 seconds mein GST Tax Invoice, Bill of Supply, E-Way Bill ya Delivery Challan bana sakte hain. \n\n" + HOW_TO_CREATE_INVOICE;
            }
        }
        else if (msg.includes('print') || msg.includes('pdf') || msg.includes('download')) {
            reply = "Kisi bhi invoice ko print karne ke liye bas invoice open karein aur top-right mein diye **'Print'** icon par click karein. Aap direct printout nikal sakte hain!";
        }
        else if (msg.includes('quotation') || msg.includes('estimate') || msg.includes('quote')) {
            reply = "Quotation (Estimate) banane ke liye:\n1. **Dashboard** > **Quotations** par jayein.\n2. **'Create Quotation'** par click karein.\n3. Baad mein aap us quotation ko 1-click mein Invoice me convert kar sakte hain!";
        }
        else if (msg.includes('eway') || msg.includes('e-way') || msg.includes('challan') || msg.includes('delivery')) {
            reply = "E-Way Bill ya Delivery Challan banane ke liye Invoices section me 'New Invoice' ke aage drop-down se E-Way Bill select karein.";
        }
        else if (msg.includes('expense') || msg.includes('kharcha') || msg.includes('accounting')) {
            reply = "Kharcha track karne ke liye:\n1. **Dashboard** > **Expenses** par jayein.\n2. **'Add Expense'** par click karke details aur amount dalein.\n3. Aap receipt ki photo bhi AI (Vision) se scan kar sakte hain!";
        }
        else if (msg.includes('staff') || msg.includes('attendance') || msg.includes('employee')) {
            reply = "Staff manage karne ke liye:\n1. **Dashboard** > **Staff & Attendance** par jayein.\n2. Staff members add karein aur unki daily Present/Absent attendance lagayein.\n3. Har month ki automatic salary slip bhi ban jayegi!";
        }
        else if (msg.includes('customer') || msg.includes('party') || msg.includes('client')) {
            reply = HOW_TO_ADD_CUSTOMER;
        }
        else if (msg.includes('bulk') || msg.includes('reminder') || msg.includes('whatsapp') || msg.includes('saath')) {
            reply = "BillGST ka **Bulk WhatsApp** feature sabse best hai. \n\nCustomers section mein jayein aur unhe direct unka pending balance WhatsApp par bhejein. Payment collect karna ab aur bhi asaan!";
        }
        else if (msg.includes('gst') || msg.includes('report') || msg.includes('return') || msg.includes('जीएसटी') || msg.includes('tally')) {
            reply = "GST Returns aur Reports ke liye **GST Returns** tab par jayein. Aapko **GSTR-1, GSTR-3B aur Tally XML** export mil jayega. CA ko data bhejna ab bilkul simple hai!";
        }
        else if (msg.includes('magic scan') || msg.includes('ocr') || msg.includes('photo')) {
            reply = "Magic Scan hamara flagship AI feature hai. Kisi bhi purane bill ki photo khinchiye aur system use digital items mein convert kar dega. Typing band, Magic shuru!";
        }
        else if (msg.includes('support') || msg.includes('help') || msg.includes('chat') || msg.includes('admin') || msg.includes('problem')) {
            reply = "Agar aapko koi technical problem hai toh screen ke bottom-right mein **Green Headset (Support)** icon par click karein. Aap sidhe hamari Admin team se live chat kar sakte hain!";
        }
        else if (msg.includes('refer') || msg.includes('earn') || msg.includes('reward')) {
            reply = "Refer & Earn program ke zariye aap dosto ko invite karke paise kama sakte hain! Dashboard me **Refer & Earn** section par jayein aur apna link share karein.";
        }
        else if (msg.includes('pricing') || msg.includes('cost') || msg.includes('paisa') || msg.includes('free') || msg.includes('plan')) {
            reply = "Digital growth sasti honi chahiye! BillGST Free hai (5 bills/mo), aur Premium features sirf ₹99/month se start hote hain. Dashboard me **Subscription** par jaakar plan upgrade karein.";
        }
        else if (msg.includes('hi') || msg.includes('hello') || msg.includes('namaste') || msg.includes('kaun')) {
            reply = "Namaste! 🙏 Main BillGST ka Advanced Advisory AI hoon. \n\nAapki har dikkat ka solution mere paas hai:\n- *'Quotation kaise banaye?'*\n- *'Expense kaise jode?'*\n- *'Bill print kaise kare?'*\n- *'Staff attendance kaise lagaye?'*\nAap bas poochiye!";
        }
        else {
            reply = "Maaf kijiye, main ye theek se samajh nahi paaya. \n\nAap mujhse kisi bhi naye feature (jaise **Staff Attendance, Expenses, Quotation, ya Print Bill**) ke baare mein pooch sakte hain. \n\nAgar aapko live help chahiye toh niche diye gaye Green Support button par click karke admin se chat karein!";
        }

        return NextResponse.json({ reply });
    } catch (error) {
        return NextResponse.json({ reply: "Maaf kijiye, abhi system busy hai. Kripya thodi der baad koshish karein." }, { status: 500 });
    }
}
