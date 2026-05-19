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
You are an expert Data Extractor for Indian Wholesale and Supplier Invoices.
Analyze this invoice image and extract the products being purchased.

Return ONLY a valid JSON object matching this exact structure:
{
  "supplierName": "Name of the seller/supplier (string)",
  "invoiceDate": "Date of invoice in YYYY-MM-DD format (string)",
  "invoiceNumber": "Invoice or Bill Number (string)",
  "items": [
    {
      "name": "Product Name (string)",
      "quantity": "Quantity as a number (number)",
      "purchasePrice": "Rate or Price per unit as a number (number)",
      "gstRate": "GST percentage applied (number, e.g. 5, 12, 18, 28, or 0)",
      "totalAmount": "Total amount for this item including or excluding tax based on the bill (number)"
    }
  ]
}

Strict Rules:
1. "items" array: Extract every single product line item from the bill.
2. For numbers (quantity, purchasePrice, gstRate, totalAmount), return actual JSON numbers (e.g., 1500), NOT strings ("1,500").
3. Remove all commas and currency symbols from numbers before parsing them to floats.
4. "gstRate": If CGST is 9% and SGST is 9%, the gstRate is 18. Find the total tax bracket. If no tax is mentioned, put 0.
5. "invoiceDate": Understand Indian dates (DD-MM-YYYY, DD/MM/YY) and ALWAYS convert to YYYY-MM-DD.
6. Return a perfectly valid JSON. Do not include markdown code blocks like \`\`\`json. Just the raw JSON object.
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
        let jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        try {
            const data = JSON.parse(jsonStr);
            return NextResponse.json(data);
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON output:", jsonStr);
            return NextResponse.json({ error: 'AI returned invalid data format' }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Vision Invoice API Error:", error);
        return NextResponse.json({ error: error.message || 'Vision API failed' }, { status: 500 });
    }
}
