import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { message } = await request.json();
        const msg = message.toLowerCase();

        let reply = "";

        // Common "How-To" Instructions
        const HOW_TO_ADD_PRODUCT = "Product add karne ke liye: \n1. **Dashboard** par jayein.\n2. **'Add Product'** button (violet color) par click karein.\n3. Details bharke 'Save' kar dein. \n\n*Aap purane bills ki photo khinch kar 'Magic Scan' se bhi items auto-add kar sakte hain!*";
        const HOW_TO_CREATE_INVOICE = "Naya Bill banane ke liye: \n1. **Dashboard** par jayein.\n2. **'New Invoice'** (indigo color) par click karein.\n3. Customer aur items select karke 'Generate' kar dein. \n\n*Direct shortcut: Screen ke bottom mein 'New' button bhi hai.*";
        const HOW_TO_ADD_CUSTOMER = "Customer add karne ke liye: \n1. **Dashboard** par jayein.\n2. **'Add Customer'** (emerald color) button par click karein.\n3. Naam aur phone number dalkar save karein.";

        // Universal Knowledge Base - ADVANCED UPGRADE
        if (msg.includes('vyapar') || msg.includes('viyapar')) {
            reply = "Vyapar ek purani technology hai. **BillGST** usse 10x better hai kyunki:\n\n1. **Online Store:** Aapka khud ka digital catalog.\n2. **Zero-Setup WhatsApp:** Bina number save kiye reminders.\n3. **Modern UI:** Bahut fast aur easy interface.\n4. **Magic AI:** Purane bills se auto-data entry.";
        }
        else if (msg.includes('product') || msg.includes('item') || msg.includes('maal') || msg.includes('स्टॉक') || msg.includes('माल') || msg.includes('entry')) {
            if (msg.includes('add') || msg.includes('kaise') || msg.includes('create') || msg.includes('naya') || msg.includes('jode')) {
                reply = HOW_TO_ADD_PRODUCT;
            } else {
                reply = "Inventory management ab 'Auto-Pilot' par hai. Aap products add karein aur main (AI) unka stock track karunga. Jab maal kam hoga, main low-stock alert de dunga.\n\n" + HOW_TO_ADD_PRODUCT;
            }
        }
        else if (msg.includes('invoice') || msg.includes('bill') || msg.includes('billing') || msg.includes('बिल') || msg.includes('इनवॉइस')) {
            if (msg.includes('kaise') || msg.includes('banaye') || msg.includes('create') || msg.includes('how')) {
                reply = HOW_TO_CREATE_INVOICE;
            } else {
                reply = "BillGST par billing super-fast hai. Aap 5 seconds mein GST bill bana sakte hain. \n\n" + HOW_TO_CREATE_INVOICE;
            }
        }
        else if (msg.includes('customer') || msg.includes('party') || msg.includes('client')) {
            reply = HOW_TO_ADD_CUSTOMER;
        }
        else if (msg.includes('bulk') || msg.includes('reminder') || msg.includes('whatsapp') || msg.includes('saath')) {
            reply = "BillGST ka **Bulk WhatsApp** feature sabse best hai. \n\nCollection Center par jayein aur 'Bulk Remind' dabaein. Sabhi customers ko unka pending balance ek saath WhatsApp ho jayega. No manual work!";
        }
        else if (msg.includes('gst') || msg.includes('report') || msg.includes('return') || msg.includes('जीएसटी')) {
            reply = "Report section mein aapko **GSTR-1, 3B aur Tally XML** export mil jayega. CA ko data bhejna ab boring nahi raha! Sab kuch automatic calculation se hota hai.";
        }
        else if (msg.includes('magic scan') || msg.includes('ocr') || msg.includes('photo')) {
            reply = "Magic Scan hamara flagship AI feature hai. Kisi bhi purane bill ki photo khinchiye aur system use digital items mein convert kar dega. Typing band, Magic shuru!";
        }
        else if (msg.includes('pricing') || msg.includes('cost') || msg.includes('paisa') || msg.includes('free')) {
            reply = "Digital growth sasti honi chahiye! BillGST Free hai (5 bills/mo), aur Premium features sirf ₹99/month se start hote hain. Vyapar jaise mehange software se 80% sasta.";
        }
        else if (msg.includes('hi') || msg.includes('hello') || msg.includes('namaste') || msg.includes('kaun') || msg.includes('help')) {
            reply = "Namaste! 🙏 Main BillGST Advisory AI hoon. \n\nMujhse kuch bhi poochein, jaise:\n- *'Product kaise add karein?'*\n- *'Naya bill kaise banayein?'*\n- *'Low stock kaise check karein?'*";
        }
        else {
            reply = "Maaf kijiye, main ye samajh nahi paaya. Kya aap **Product add karne**, **Bill banane**, ya **WhatsApp reminders** ke baare mein janna chahte hain? \n\nAap BillGST par apna **Digital Online Store** bhi chala sakte hain!";
        }

        return NextResponse.json({ reply });
    } catch (error) {
        return NextResponse.json({ reply: "Maaf kijiye, abhi system busy hai. Kripya thodi der baad koshish karein." }, { status: 500 });
    }
}
