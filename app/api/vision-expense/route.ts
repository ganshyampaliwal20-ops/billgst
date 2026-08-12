import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; // Allow enough time for AI response without timeout

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is missing in environment variables' }, { status: 401 });
        }

        const body = await req.json();
        const { imageBase64 } = body;
        
        if (!imageBase64) {
            return NextResponse.json({ error: 'Image data is missing' }, { status: 400 });
        }

        // Extract mime type if present
        let mimeType = "image/jpeg";
        const mimeMatch = imageBase64.match(/^data:([^;]+);base64,/);
        if (mimeMatch && mimeMatch[1]) {
            mimeType = mimeMatch[1];
        }

        // Clean up base64 prefix
        const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, "").trim();

        const prompt = `
You are an expert Data Extractor for Expense Receipts, Invoices, and Bills.
Analyze this receipt/bill image and extract the overall expense details.

Return ONLY a valid JSON object matching this exact structure:
{
  "vendorName": "Name of the shop, restaurant, petrol pump, or supplier (string)",
  "totalAmount": 1500,
  "expenseDate": "YYYY-MM-DD",
  "description": "A short 3-6 word summary of what the expense was for (e.g., 'Lunch at Restaurant', 'Petrol for Car', '2x Chairs, 1x Table') (string)"
}

Strict Rules:
1. "totalAmount": Return the final payable amount as a number (e.g. 1500 or 1500.50). Remove commas, currency symbols, and slashes.
2. "expenseDate": CAREFULLY inspect the bill for a handwritten or printed date (e.g. 20/04/2026, 20-4-26). It is often written at the top right or bottom of the bill. ALWAYS convert to YYYY-MM-DD format. If absolutely no date is found, return today's date in YYYY-MM-DD.
3. "description": Keep it very concise but informative.
4. Return ONLY raw valid JSON. Do not include markdown codeblocks.
`;

        const imageParts = [{
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        }];

        const genAI = new GoogleGenerativeAI(apiKey);
        const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"];
        let responseText = "";
        let lastError = null;
        const maxRetriesPerModel = 3;

        for (const modelName of modelsToTry) {
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: { responseMimeType: "application/json" }
            });

            for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
                try {
                    const result = await model.generateContent([prompt, ...imageParts]);
                    responseText = result.response.text();
                    break;
                } catch (err: any) {
                    lastError = err;
                    console.warn(`Attempt ${attempt} failed for model ${modelName} (vision expense):`, err?.message || err);
                    
                    if (err?.message?.includes('503') || err?.message?.includes('429')) {
                        if (attempt < maxRetriesPerModel) {
                            await sleep(2000 * attempt); // wait before retrying
                        }
                    } else {
                        break; 
                    }
                }
            }
            if (responseText) break;
        }

        if (!responseText) {
            throw lastError || new Error("All AI vision models failed to process the image");
        }

        // Clean up markdown code blocks if present
        let jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }
        
        try {
            const data = JSON.parse(jsonStr);
            const totalNum = Number(String(data.totalAmount ?? data.amount ?? 0).replace(/[^0-9.]/g, '')) || 0;
            return NextResponse.json({
                vendorName: data.vendorName || '',
                totalAmount: totalNum,
                amount: totalNum,
                expenseDate: data.expenseDate || new Date().toISOString().split('T')[0],
                description: data.description || data.vendorName || 'Expense Bill'
            });
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON output:", jsonStr);
            return NextResponse.json({ error: 'AI returned invalid data format' }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Vision Expense API Error:", error);
        return NextResponse.json({ error: error.message || 'Vision API failed' }, { status: 500 });
    }
}
