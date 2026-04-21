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
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

        const prompt = `
You are an expert OCR and data extraction AI explicitly built for Indian shop bills, invoices, and handwritten receipts.
Analyze this receipt (which may be printed, poorly handwritten, or mixed language Hindi/English).
Extract the following information carefully:

1. "amount": Find the FINAL GRAND TOTAL monetary amount. Look for "Grand Total", "Total Amt", "Rs", "Payable". Exclude Subtotals, Phone numbers, or GST %. 
   CRITICAL: Output ONLY digits and decimals. NO commas, NO currency symbols, no spaces (Example: "1500" or "340.50"). If none found, output "".

2. "date": The date written on the bill. Convert it strictly to "YYYY-MM-DD" format. If no date is found, output "".

3. "material": The primary material, item, or general purpose of the expense. 
   - Look in the 'Particulars', 'Description', or 'Items' table. 
   - If handwritten, it might say things like "Cement", "Kharcha", "Petrol", "Chai", "Labor", "Advance", "Food". 
   - DO NOT output the shop's name. If no items are listed, infer from the shop name (e.g. "Verma Sweets" -> "Sweets", "Sharma Hardware" -> "Hardware", "Pooja Travels" -> "Travel"). 
   - Make it a short, clean name (1-3 words). If completely unidentifiable, output "".

Output EXACTLY AND ONLY valid JSON in this structure:
{
    "amount": "1500",
    "date": "2026-03-12",
    "material": "Cement"
}
Do not wrap it in markdown. Do not include any other text. Only JSON.`;

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
