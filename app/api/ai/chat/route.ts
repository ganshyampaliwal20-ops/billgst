import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { message } = await request.json();
        const msg = message.toLowerCase();

        let reply = "";

        // Universal Knowledge Base for BillGST & Website Features
        if ((msg.includes('hi') || msg.includes('hello') || msg.includes('namaste')) && msg.length < 15) {
            reply = "Namaste! 🙏 Main BillGST ka expert AI hoon. Main aapki Billing, Inventory, GST returns aur aapke Digital Store setup karne mein madad kar sakta hoon. Aap mujhse kuch bhi puch sakte hain!";
        }
        else if (msg.includes('gst') && (msg.includes('kya') || msg.includes('what') || msg.includes('kaise'))) {
            reply = "GST (Goods & Services Tax) India ka unified tax system hai. BillGST par aap GSTR-1, GSTR-3B aur GSTR-4 reports sirf 1-click mein generate kar sakte hain. Hum regular aur composition dono dealers ko support karte hain.";
        }
        else if (msg.includes('invoice') || msg.includes('bill') || msg.includes('billing')) {
            reply = "BillGST par aap 5 seconds mein professional invoice bana sakte hain. Humare paas multiple templates hain (Classic, Modern, Thermal). Aap Voice Billing ka use karke bol kar bhi bill bana sakte hain!";
        }
        else if (msg.includes('stock') || msg.includes('inventory') || msg.includes('maal')) {
            reply = "Inventory management BillGST ka ek powerhouse feature hai. Aap items add karein, unka stock level track karein, aur 'Low Stock Alert' set karein. Sales hote hi stock apne aap update ho jata hai.";
        }
        else if (msg.includes('whatsapp') || msg.includes('reminder') || msg.includes('msg')) {
            reply = "Humare software mein built-in WhatsApp integration hai. Aap customers को automated payment reminders bhej sakte hain aur seedhe WhatsApp par bill share kar sakte hain.";
        }
        else if (msg.includes('tally') || msg.includes('export')) {
            reply = "Haan! BillGST fully Tally compatible hai. Aap saara data Tally XML format mein export karke apne CA ko de sakte hain, jo seedhe Tally mein import ho jayega.";
        }
        else if (msg.includes('payment') || msg.includes('qr') || msg.includes('upi')) {
            reply = "Aap BillGST mein apni UPI ID set kar sakte hain, jiske baad har bill par ek Smart QR code apne aap print ho jayega. Customers use scan karke turant pay kar sakte hain.";
        }
        else if (msg.includes('pricing') || msg.includes('cost') || msg.includes('paisa') || msg.includes('free')) {
            reply = "Humare 3 plans hain:\n1. **FREE:** Naye businesses ke liye (5 bills/month).\n2. **BASIC (₹30):** Unlimited billing ke liye.\n3. **PREMIUM (₹99):** GST, Magic Scan, aur WhatsApp AI ke saath.\nAap pricing page par jaakar upgrade kar sakte hain.";
        }
        else if (msg.includes('security') || msg.includes('safe') || msg.includes('data')) {
            reply = "Aapka data BillGST par 100% safe aur encrypted hai. Hum Amazon Web Services (AWS) use karte hain aur har din automatic backup lete hain, taaki aapka record kabhi na khoye.";
        }
        else if (msg.includes('magic scan') || msg.includes('ocr') || msg.includes('photo')) {
            reply = "Magic Scan hamara flagship AI feature hai! Aap kisi bhi purane bill ki photo kheenchiye, aur hamara AI usse turant digital invoice mein convert kar dega. Typing ki mehnat khatam!";
        }
        else if (msg.includes('digital store') || msg.includes('online shop') || msg.includes('s/')) {
            reply = "BillGST aapko ek personal Digital Store link deta hai (Jaise: billgst.in/s/your-id). Aap ise WhatsApp par share kar sakte hain aur customers seedhe online order de sakte hain.";
        }
        else if (msg.includes('voice') || msg.includes('bol kar')) {
            reply = "Voice Billing se aap bina keyboard touch kiye bill bana sakte hain. Bas 'Add 2kg Sugar' bolein aur system use apne aap item list mein jod dega. Ye India ka sabse fast billing method hai!";
        }
        else if (msg.includes('mobile') || msg.includes('app') || msg.includes('phone')) {
            reply = "BillGST fully responsive hai, yani aap ise apne Mobile, Tablet ya Laptop kisi bhi device par chala sakte hain. Iska user interface mobile users ke liye special optimize kiya gaya hai.";
        }
        else {
            reply = "Main BillGST AI Assistant hoon aur main aapke software, GST reports, Inventory, aur Digital Store ke har sawal ka jawab de sakta hoon. Kya aap kisi specific feature ke baare mein janna chahte hain?";
        }

        return NextResponse.json({ reply });
    } catch (error) {
        return NextResponse.json({ reply: "Maaf kijiye, abhi system busy hai." }, { status: 500 });
    }
}
