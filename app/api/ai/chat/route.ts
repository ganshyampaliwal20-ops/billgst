import { NextResponse } from 'next/server';
import https from 'https';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function fetchGemini(apiKey: string, prompt: string): Promise<string> {
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
        }
        
        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid output from Gemini: " + JSON.stringify(data));
        }
    } catch (e: any) {
        clearTimeout(timeoutId);
        throw e;
    }
}

export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ reply: "Aapko pehle login karna hoga." }, { status: 401 });
        }

        const { message } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ reply: "Gemini API key is missing. Contact admin." });
        }

        const prompt = `You are a smart, helpful AI assistant for BillGST, an Indian retail/wholesale app.
The user is speaking to you via voice typing.
User's message: "${message}"

Your task is to determine the user's INTENT and return a JSON payload so the frontend can execute the task.
You support these Actions:
1. "CREATE_INVOICE": The user wants to create a bill/invoice.
2. "MARK_ATTENDANCE": The user wants to mark attendance for staff.
3. "ADD_EXPENSE": The user wants to add an expense/kharcha.
4. "ADD_INVENTORY": The user wants to add an item to inventory/stock.
5. "NAVIGATE": The user just wants to go to a page (e.g. inventory, customers, reports).
6. "REPLY": General question about how to use the app or GST.

You MUST respond ONLY with a valid JSON object matching this structure:
{
  "action": "CREATE_INVOICE" | "MARK_ATTENDANCE" | "ADD_EXPENSE" | "ADD_INVENTORY" | "NAVIGATE" | "REPLY",
  "payload": { ... },
  "reply": "A helpful response in Hinglish to be spoken back to the user. E.g. 'Ji, Raju ka 500 ka bill bana raha hu. Ab bas aap save button dabaiye.'"
}

Payload rules based on Action:
- For CREATE_INVOICE: payload should be {"customerName": "name or null", "amount": number or null, "items": [{"name": "item name", "qty": number}]}
- For MARK_ATTENDANCE: payload should be {"staffName": "name", "status": "PRESENT" | "ABSENT"}
- For ADD_EXPENSE: payload should be {"description": "desc", "amount": number}
- For ADD_INVENTORY: payload should be {"itemName": "name", "qty": number, "unit": "kg" | "pcs" | "ltr" etc or null}
- For NAVIGATE: payload should be {"path": "/dashboard/inventory" | "/dashboard/customers" | "/dashboard/reports" | "/dashboard/settings" | "/dashboard/expenses" | "/dashboard/staff"}
- For REPLY: payload can be null.

Example User: "Raju ka 500 ka bill banao 1 mobile bhi daal dena"
Output: {"action": "CREATE_INVOICE", "payload": {"customerName": "Raju", "amount": 500, "items": [{"name": "mobile", "qty": 1}]}, "reply": "Ji bilkul, Raju ka bill me mobile add kar diya hai, kripya save button dabayein."}

Example User: "ganshyam ka bill banao mobile, watch or laptop ka"
Output: {"action": "CREATE_INVOICE", "payload": {"customerName": "ganshyam", "amount": null, "items": [{"name": "mobile", "qty": 1}, {"name": "watch", "qty": 1}, {"name": "laptop", "qty": 1}]}, "reply": "Ji bilkul, ganshyam ke bill me mobile, watch, aur laptop add kar diya hai."}

Example User: "Rahul ki present laga do"
Output: {"action": "MARK_ATTENDANCE", "payload": {"staffName": "Rahul", "status": "PRESENT"}, "reply": "Ji, Rahul ki aaj ki attendance lagane ke liye form khol raha hu."}

Example User: "Chai pani ka 150 rupya likh lo"
Output: {"action": "ADD_EXPENSE", "payload": {"description": "Chai pani", "amount": 150}, "reply": "Theek hai, 150 rupye kharche mein daal diya hai, ab save dabayein."}

Example User: "Inventry me 1 kg ghee add kar"
Output: {"action": "ADD_INVENTORY", "payload": {"itemName": "ghee", "qty": 1, "unit": "kg"}, "reply": "Ji, inventory me 1 kg ghee add kar diya hai, ab kripya save dabayein."}

Make the "reply" sound natural, helpful, and polite in Hinglish. ALWAYS tell the user what you are doing, and if it involves a form, ALWAYS remind them to click the Save button!
Return ONLY the JSON. No markdown backticks.`;

        const responseText = await fetchGemini(apiKey, prompt);
        const jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(jsonStr);
            return NextResponse.json(data);
        } catch (e) {
            console.error("Failed to parse Gemini output:", jsonStr);
            return NextResponse.json({ reply: "Maaf kijiye, main theek se samajh nahi paaya. Kripya dobara bole." });
        }

    } catch (error: any) {
        console.error("AI Chat API Error:", error);
        
        let errorMessage = "Maaf kijiye, abhi system busy hai. Kripya thodi der baad koshish karein.";
        if (error?.message?.includes("429 Too Many Requests") || error?.message?.includes("quota")) {
            errorMessage = "Aapki Gemini AI API Key ki limit (quota) khatam ho gayi hai. Kripya .env.local file mein nayi API key dalein (aistudio.google.com se).";
        } else if (error?.message?.includes("400") || error?.message?.includes("API_KEY_INVALID")) {
            errorMessage = "Aapki Gemini AI API Key galat ya invalid hai. Kripya .env.local check karein aur sahi key dalein.";
        }
        
        return NextResponse.json({ reply: errorMessage }, { status: 500 });
    }
}
