import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; // Allow enough time for AI response without Vercel timeout
export const runtime = 'edge'; // Vercel Edge Runtime allows up to 30s on Hobby plan (Node.js is limited to 10s)

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 401 });
        }

        const body = await req.json();
        const { imageBase64 } = body;
        
        if (!imageBase64) {
            return NextResponse.json({ error: 'Image is missing' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            // 1.5 models are deprecated. Use the working 2.5-pro model.
            model: "gemini-2.5-pro",
            generationConfig: { responseMimeType: "application/json" }
        });

        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

        const prompt = `
You are an advanced AI Data Extractor specifically trained for Indian Expense Receipts, Shop Bills, and messy handwritten notes.
Analyze this image and extract exactly 3 fields: amount, date, and material.
Return ONLY a valid JSON object.

Strict Rules for Indian Contexts:
1. "amount": Find the Final Total, Grand Total, or the largest highlighted number at the VERY BOTTOM right of the bill.
   - Do NOT select 'Rate' or 'Quantity' (like 23.84 or 280.00). Pick the final calculated amount (like 6675.20).
   - Strip all currency symbols (Rs, ₹, /, /-, =, ,). 
   - VERY IMPORTANT: Remove all commas from the number! '6,675.20' MUST become '6675.20'.
   - Output as a clean number string (e.g., "500", "6675.20", "1540.50").

2. "date": Find the transaction date (Date, Dt, Dated:). 
   - Understand formats like '31-Jan-26' and convert them perfectly to YYYY-MM-DD (e.g. '2026-01-31').
   - Convert DD/MM/YYYY or DD-MM-YYYY strictly to "YYYY-MM-DD" (e.g. "05/11/24" is Nov 5th, 2024).
   - If you cannot find any date, output today's date in YYYY-MM-DD.

3. "material": What is this expense for? Look at 'Description of Goods' or Shop details at the top.
   - For example, if it says "Granite Slab" or shop says "Marble & Floor Tiles", output "Granite" or "Tiles".
   - Provide a 1-3 word summary.
   - If items are listed (e.g., Dal, Rice), output "Groceries" or "Kirana".
   - If a shop name strongly hints at the item (e.g., "Apollo Pharmacy" -> "Medicine", "HP Petrol Pump" -> "Petrol").
   - If completely ambiguous, just output the Shop's Name or "Expense".

Output Format: { "amount": "...", "date": "...", "material": "..." }
`;

        const imageParts = [{
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                }
            }
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        
        let jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Vision API Error:", error);
        return NextResponse.json({ error: error.message || 'Vision API failed' }, { status: 500 });
    }
}
