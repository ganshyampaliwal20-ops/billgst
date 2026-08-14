import { NextResponse } from 'next/server';
import https from 'https';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function fetchGemini(apiKey: string, prompt: string): Promise<string> {
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
            temperature: 0.1,
            responseMimeType: "application/json"
        }
    };

    const modelsToTry = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-2.5-flash'
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s fast timeout per attempt

        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const data = await res.json();
            
            if (res.ok && data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                lastError = new Error(`Model ${modelName} error: ${JSON.stringify(data)}`);
            }
        } catch (e: any) {
            clearTimeout(timeoutId);
            lastError = e;
        }
    }

    throw lastError || new Error("All Gemini models failed");
}

export async function POST(request: Request) {
    let isEn = false;
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ reply: 'Session expired. Kripya wapas login karein.', action: 'REPLY' }, { status: 401 });
        }

        const { message, language, customerNames = [], productNames = [], staffNames = [], businessContext = {} } = await request.json();
        isEn = language === 'en';

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ reply: "Gemini API key is missing. Contact admin." });
        }

        const prompt = `
You are **BillGST AI**, an advanced, highly intelligent, friendly, and expert Business Assistant and Partner.
Your primary role is to help the user manage their business smoothly (invoicing, accounting, inventory, expenses, staff attendance, etc.). 
However, you are NOT just a robot. You act like a smart, helpful human partner (ek samajhdaar dost aur business partner ki tarah). 
You can chat with the user, answer their questions about the business, explain all the features of this app, and even give basic business growth or management tips if they ask.

**Your Capabilities & Features (Use these when the user asks what you can do):**
- 🧾 **Invoicing & Billing**: Create GST/Non-GST bills instantly.
- 👥 **Customer & Supplier Hisaab**: Track balances, add payments, and manage khata.
- 📦 **Inventory Management**: Add and track products and stock levels.
- 💸 **Expense Tracking**: Record daily kharcha (expenses).
- 🙋‍♂️ **Staff Attendance**: Mark staff present/absent with ease.
- 📲 **WhatsApp Reminders**: Send bulk pending payment reminders in one click.
- 🎙️ **Voice Commands**: Work completely via voice instructions!

**Business Context:**
- Sales Today: ₹${businessContext?.salesToday || 0}
- Total Outstanding to collect: ₹${businessContext?.totalOutstanding || 0}
- Low Stock Items: ${businessContext?.lowStock || 'None'}

Customer Names in database: ${customerNames?.join(', ') || 'None'}
Product Names in database: ${productNames?.join(', ') || 'None'}
Staff Names in database: ${staffNames?.join(', ') || 'None'}

User's message: "${message}"

If the user mentions a name that sounds similar to one in the App Context, use the exact name from the App Context to avoid spelling mistakes.

Your task is to determine the user's INTENT and return a JSON payload so the frontend can execute the task.
You support these Actions:
1. "CREATE_INVOICE": The user wants to create a bill/invoice.
2. "MARK_ATTENDANCE": The user wants to mark attendance for staff.
3. "ADD_EXPENSE": The user wants to add an expense/kharcha.
4. "ADD_INVENTORY": The user wants to add an item to inventory/stock.
5. "ADD_CUSTOMER": The user wants to add a new customer or party.
6. "ADD_SUPPLIER": The user wants to add a new supplier.
7. "RECORD_PAYMENT": The user wants to record a payment received from a customer or paid to a supplier (jama karna / payment dena).
8. "GET_BALANCE": The user wants to check the balance of a customer or supplier.
9. "CREATE_PURCHASE": The user wants to create a purchase bill (kharidi).
10. "NAVIGATE": The user just wants to go to a page (e.g. inventory, customers, reports).
11. "REPLY": The user asks a general question, wants to chat, asks what you can do, asks for business advice, or just says Hello. Give a detailed, friendly, human-like answer in the 'reply' field using emojis!
12. "SPEAK_ANSWER": The user asks a question about their business (e.g., "Aaj ki total sale kitni hui?", "Mera kitna paisa baaki hai?"). You will use the provided App Context to generate a conversational answer and put it in 'reply'.
13. "SEND_REMINDERS": The user wants to send WhatsApp payment reminders to all pending customers (e.g., "Sabko reminder bhej do").

You MUST respond ONLY with a valid JSON object matching this structure:
{
  "action": "CREATE_INVOICE" | "MARK_ATTENDANCE" | "ADD_EXPENSE" | "ADD_INVENTORY" | "ADD_CUSTOMER" | "ADD_SUPPLIER" | "RECORD_PAYMENT" | "GET_BALANCE" | "CREATE_PURCHASE" | "NAVIGATE" | "REPLY" | "SPEAK_ANSWER" | "SEND_REMINDERS",
  "payload": { ... },
  "reply": "A helpful response in ${isEn ? 'English' : 'Hinglish'} to be spoken back to the user."
}

Payload rules based on Action:
- For CREATE_INVOICE: payload should be {"customerName": "name or null", "amount": number or null, "items": [{"name": "item name", "qty": number}]}
- For MARK_ATTENDANCE: payload should be {"staffName": "name", "status": "PRESENT" | "ABSENT"}
- For ADD_EXPENSE: payload should be {"description": "desc", "amount": number}
- For ADD_INVENTORY: payload should be {"itemName": "name", "qty": number, "unit": "kg" | "pcs" | "ltr" etc or null}
- For ADD_CUSTOMER: payload should be {"name": "customer name", "phone": "phone number or null"}
- For ADD_SUPPLIER: payload should be {"name": "supplier name", "phone": "phone number or null"}
- For RECORD_PAYMENT: payload should be {"partyName": "name of person", "amount": number, "type": "IN" (received/jama) or "OUT" (paid/diya)}
- For GET_BALANCE: payload should be {"partyName": "name of person"}
- For CREATE_PURCHASE: payload should be {"supplierName": "name or null", "amount": number or null, "items": [{"name": "item name", "qty": number}]}
- For NAVIGATE: payload should be {"path": "/dashboard/inventory" | "/dashboard/customers" | "/dashboard/reports" | "/dashboard/settings" | "/dashboard/expenses" | "/dashboard/staff" | "/dashboard/suppliers" | "/dashboard/purchases"}
- For REPLY: payload MUST be null. (The 'reply' string should contain your conversational answer).

Example User: "Tum kya kya kar sakte ho?"
Output: {"action": "REPLY", "payload": null, "reply": "Main aapka BillGST Assistant hu! 😊 Main aapke business ke saare kaam sambhal sakta hu, jaise:\\n🧾 Bills banana\\n📦 Inventory manage karna\\n💸 Kharcha likhna\\n🙋‍♂️ Staff ki attendance lagana\\n📲 Aur pending customers ko WhatsApp reminder bhejna.\\nBataiye, main aapki kis kaam me madad karu?"}

Example User: "Raju ka 500 ka bill banao 1 mobile bhi daal dena"
Output: {"action": "CREATE_INVOICE", "payload": {"customerName": "Raju", "amount": 500, "items": [{"name": "mobile", "qty": 1}]}, "reply": "Ji bilkul, Raju ka bill me mobile add kar diya hai, kripya save button dabayein."}

Example User: "ganshyam ka 500 expenses me add karo"
Output: {"action": "ADD_EXPENSE", "payload": {"description": "ganshyam", "amount": 500}, "reply": "Ji, Ganshyam ke naam ka 500 rupaye ka expense add karne ke liye add kar diya hai."}

Example User: "Anil ko customer me add karo 9999999999"
Output: {"action": "ADD_CUSTOMER", "payload": {"name": "Anil", "phone": "9999999999"}, "reply": "Ji, Anil ko add karne ke liye add kar diya hai."}

Example User: "Raju ne 500 rupaye jama karaye"
Output: {"action": "RECORD_PAYMENT", "payload": {"partyName": "Raju", "amount": 500, "type": "IN"}, "reply": "Ji, Raju ki 500 rupaye ki jama entry open kar di hai, kripya save karein."}

Example User: "Rahul ka balance batao"
Output: {"action": "GET_BALANCE", "payload": {"partyName": "Rahul"}, "reply": "Ji, main Rahul ka balance check kar raha hu."}

Example User: "Aaj ki sale kitni hui"
Output: {"action": "SPEAK_ANSWER", "payload": null, "reply": "Aaj ki total sale ₹5000 hui hai."}

Example User: "Sabko payment reminder bhej do"
Output: {"action": "SEND_REMINDERS", "payload": null, "reply": "Ji, main sabhi pending customers ko WhatsApp par reminder bhej raha hu."}

Make the "reply" string sound natural, helpful, enthusiastic, and polite in ${isEn ? 'English' : 'Hinglish'}. Use emojis where appropriate. ALWAYS tell the user what you are doing, and if it involves a form, ALWAYS remind them to click the Save button!
Return ONLY the JSON. No markdown backticks.`;

        const responseText = await fetchGemini(apiKey, prompt);
        const jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(jsonStr);
            return NextResponse.json(data);
        } catch (e) {
            console.error("Failed to parse Gemini output:", jsonStr);
            return NextResponse.json({ reply: isEn ? "Sorry, I couldn't understand that. Please say it again." : "Maaf kijiye, main theek se samajh nahi paaya. Kripya dobara bole." });
        }

    } catch (error: any) {
        console.error("AI Chat API Error:", error);
        
        let errorMessage = "Maaf kijiye, abhi system busy hai. Kripya thodi der baad koshish karein.";
        if (error?.message?.includes("429 Too Many Requests") || error?.message?.includes("quota")) {
            errorMessage = "Aapki Gemini AI API Key ki limit (quota) khatam ho gayi hai. Kripya .env.local file mein nayi API key dalein (aistudio.google.com se).";
        } else if (error?.message?.includes("400") || error?.message?.includes("API_KEY_INVALID")) {
            errorMessage = "Aapki Gemini AI API Key galat ya invalid hai. Kripya .env.local check karein aur sahi key dalein.";
        }
        
        if (isEn) {
            errorMessage = "Sorry, the system is busy right now. Please try again later.";
            if (error?.message?.includes("429 Too Many Requests") || error?.message?.includes("quota")) {
                errorMessage = "Your Gemini AI API Key quota is exhausted. Please enter a new key in .env.local.";
            } else if (error?.message?.includes("400") || error?.message?.includes("API_KEY_INVALID")) {
                errorMessage = "Your Gemini AI API Key is invalid. Please check .env.local and enter a valid key.";
            }
        }
        
        return NextResponse.json({ reply: errorMessage }, { status: 500 });
    }
}
