import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; // Allow enough time for AI response without timeout

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

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // Remove the data:image/jpeg;base64, prefix if present
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

        const prompt = `
You are an expert Data Extractor for Expense Receipts, Invoices, and Bills.
Analyze this receipt/bill image and extract the overall expense details.

Return ONLY a valid JSON object matching this exact structure:
{
  "vendorName": "Name of the shop, restaurant, petrol pump, or supplier (string)",
  "totalAmount": "Final total amount paid on the bill as a number (number)",
  "expenseDate": "Date of the bill in YYYY-MM-DD format (string)",
  "description": "A short 3-6 word summary of what the expense was for (e.g., 'Lunch at Restaurant', 'Petrol for Car', '2x Chairs, 1x Table') (string)"
}

Strict Rules:
1. "totalAmount": Return the final payable amount as an actual JSON number (e.g., 1500), NOT a string ("1,500"). Remove all commas and currency symbols.
2. "expenseDate": Understand Indian dates (DD-MM-YYYY, DD/MM/YY) and ALWAYS convert to YYYY-MM-DD. If no date is found, return today's date in YYYY-MM-DD.
3. "description": Keep it very concise but informative. Mention main items or purpose of expense.
4. Return a perfectly valid JSON. Do not include markdown code blocks like \`\`\`json. Just the raw JSON object.
`;

        const imageParts = [{
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg" // works for most common images
                }
            }
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        
        // Clean up markdown in case the model ignored instructions
        const jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        try {
            const data = JSON.parse(jsonStr);
            return NextResponse.json(data);
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON output:", jsonStr);
            return NextResponse.json({ error: 'AI returned invalid data format' }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Vision Expense API Error:", error);
        return NextResponse.json({ error: error.message || 'Vision API failed' }, { status: 500 });
    }
}
