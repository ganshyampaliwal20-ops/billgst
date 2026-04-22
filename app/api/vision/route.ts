import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

        const prompt = `
You are an expert OCR AI specialized in analyzing Indian unstructured handwritten receipts, faded shop bills, and standard invoices in both English and Hindi.
Carefully extract three specific fields. Be incredibly smart about context.

1. "amount": The FINAL grand total to be paid. Must be a clean number (e.g. "500", "1540.50"). Do NOT add words, commas, or currency symbols. Ignore sub-totals, discounts, phone numbers, or GST percentages.
2. "date": The date of the transaction. Convert it strictly to "YYYY-MM-DD". If you see "Aaj" or no date is present, guess based on context or leave empty "". Check carefully for dates handwritten in Indian formats (DD/MM/YYYY).
3. "material": What is this bill for? 
   - If not explicitly written, INFER IT logically from the shop's name or items listed (e.g., "M/s Sharma Hardware" -> "Hardware", "Jio" -> "Recharge", "Garg Sweets" -> "Food", "Balaji Travels" -> "Travel", "Doodh" -> "Milk").
   - Read Hindi texts well (e.g., "किराना" -> "Kirana").
   - Limit to 1 to 3 simple summary words.
   - If absolutely unrecognizable, output "Expense".

Output ONLY valid JSON representing those exact 3 keys. No markdown, no extra text.
{ "amount": "...", "date": "...", "material": "..." }
`;

        const imageParts = [
            {
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
