import { NextResponse } from 'next/server';
import https from 'https';

function fetchGemini(apiKey: string, prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: '/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            family: 4 // FORCE IPv4 to bypass Windows IPv6 hanging issues
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(data);
                        const text = parsed.candidates[0].content.parts[0].text;
                        resolve(text);
                    } catch (e) {
                        reject(new Error("Invalid JSON from Gemini: " + data));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        
        // Add a strict timeout of 10 seconds so it NEVER hangs forever
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timed out after 10 seconds'));
        });

        req.write(payload);
        req.end();
    });
}

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ reply: "Gemini API key is missing. Contact admin." });
        }

        const prompt = `You are a smart, helpful billing assistant for BillGST, an Indian retail/wholesale app.
The user is speaking to you via voice typing.
User's message: "${message}"

Your task is to determine the user's INTENT. 
If the user wants to CREATE A BILL or INVOICE for someone, you must extract the customer name and/or amount if present.
If the user wants to navigate to another section (like Inventory, Customers, Settings, Reports, Expenses, Staff), figure that out.
If the user is just asking a question (e.g., "how to use?", "what is e-way bill?"), provide a helpful reply in Hinglish.

You MUST respond ONLY with a valid JSON object matching this structure:
{
  "action": "NAVIGATE" | "REPLY",
  "path": "/dashboard/invoices/new" | "/dashboard/inventory" | "/dashboard/customers" | "/dashboard/reports" | "/dashboard/settings" | "/dashboard/expenses" | "/dashboard/staff" | null,
  "reply": "A helpful response in Hinglish to be spoken back to the user."
}

Rules for path:
- If creating a bill/invoice, path should be "/dashboard/invoices/new".
  - If a customer name is mentioned (e.g., "Rahul ka bill"), append "?customerName=Rahul" to the path.
  - If an amount is mentioned (e.g., "500 ka bill"), append "&amount=500" (or "?amount=500" if no customer).
  - Example: "/dashboard/invoices/new?customerName=Rahul&amount=500"
- If checking stock/inventory: "/dashboard/inventory"
- If checking customers/party: "/dashboard/customers"
- If checking expenses/kharcha: "/dashboard/expenses"
- If checking staff/attendance: "/dashboard/staff"

Make the "reply" sound natural and helpful in Hinglish. e.g. "Ji bilkul, Rahul ka bill bana rahe hain." or "Inventory khol raha hu."
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
        }
        
        return NextResponse.json({ reply: errorMessage }, { status: 500 });
    }
}
