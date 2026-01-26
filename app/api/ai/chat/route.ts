import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { message } = await request.json();
        const msg = message.toLowerCase();

        let reply = "";

        // Smart Response Logic (Hindi/English Mix)
        if (msg.includes('gst') && (msg.includes('kya') || msg.includes('what'))) {
            reply = "GST (Goods and Services Tax) ek indirect tax hai jo India mein 1 July 2017 ko lagu kiya gaya tha. Yeh multi-stage, destination-based tax hai jo har value addition par lagta hai.";
        } else if (msg.includes('invoice') || msg.includes('bill')) {
            reply = "BillGST par naya invoice banane ke liye dashboard par 'New Invoice' button par click karein. Aap hamare 5 templates mein se koi bhi select kar sakte hain settings page se.";
        } else if (msg.includes('stock') || msg.includes('inventory')) {
            reply = "Inventory section mein jaakar aap apna stock add kar sakte hain. Jab aap sales invoice banayenge, toh stock automatically kam ho jayega aur low stock hone par aapko dashboard par alert milega.";
        } else if (msg.includes('tally')) {
            reply = "Haan! BillGST reports section se aap Tally XML export kar sakte hain, jise aapka CA directly Tally mein import kar sakta hai.";
        } else if (msg.includes('payment') || msg.includes('qr')) {
            reply = "Aap Settings mein apna UPI ID daal sakte hain. Iske baad aapke har invoice par auto-generated QR code aayega. Premium users ke liye payment links ki suvidha bhi hai.";
        } else if (msg.includes('hi') || msg.includes('hello') || msg.includes('namaste')) {
            reply = "Namaste! Main BillGST AI Assistant hoon. Main aapki billing, accounting aur GST mein kaise madad kar sakta hoon?";
        } else if (msg.includes('pricing') || msg.includes('cost') || msg.includes('plan')) {
            reply = "Humare paas 3 plans hain: Free (5 Invoices/month), Basic (₹30 for unlimited invoices) aur Premium (₹99 for GST & QR access). Aap pricing page par details dekh sakte hain.";
        } else {
            reply = "Main ek advanced AI hoon jo BillGST ke baare mein jaanta hai. Aap mujhse Billing, Stock management ya GST ke baare mein pooch sakte hain. Main koshish karunga ki aapki sahi madad kar sakun.";
        }

        return NextResponse.json({ reply });
    } catch (error) {
        return NextResponse.json({ reply: "Maaf kijiye, abhi system busy hai." }, { status: 500 });
    }
}
