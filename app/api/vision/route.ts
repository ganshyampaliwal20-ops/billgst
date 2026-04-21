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
Analyze this bill/receipt (could be printed or handwritten in Hindi/English).
Extract the following information:
1. "amount": The grand total monetary amount on the bill (just the pure number). If not found, output "". 
2. "date": The date of the bill in standard "YYYY-MM-DD" format. If not found, output "".
3. "material": The primary material or item name sold/billed (e.g. "Cement", "Sand", "Service", "Labor", "Pipe", "Tent"). Do NOT give the shop's name. Look at the description/particulars. If completely unidentifiable, output "".

Output EXACTLY AND ONLY valid JSON in this structure:
{
    "amount": "150",
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
