import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const maxDuration = 30; // Max duration for Vercel

export async function POST(req: Request) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY missing' }, { status: 401 });
        }

        const body = await req.json();
        const { transcript, products } = body;

        if (!transcript) {
            return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using 1.5-flash as it's faster and usually has better free tier limits
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a smart billing assistant for an Indian retail shop/wholesaler.
The user said this via voice typing: "${transcript}"

Here is the current inventory of products (JSON format):
${JSON.stringify(products.map((p: any) => ({ id: p.id, name: p.name })), null, 2)}

Your task is to extract which products the user wants to add to the bill, and the quantity.
Rules:
1. Match the spoken words to the closest product name in the inventory. Handle typos and Hindi/Hinglish phrasing (e.g., "do maggi" -> quantity 2 of Maggi).
2. If no quantity is specified, assume 1.
3. You MUST return ONLY a valid JSON array of objects, with NO markdown formatting, NO backticks, NO extra text.
Format:
[
  { "id": "matched_product_id", "quantity": 2 }
]
If no product matches even remotely, return an empty array [].
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        let jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        try {
            const extractedItems = JSON.parse(jsonStr);
            return NextResponse.json({ items: extractedItems });
        } catch (parseError) {
            console.error("Failed to parse Gemini output:", jsonStr);
            return NextResponse.json({ error: 'AI returned invalid data format' }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Voice Billing API Error:", error);
        return NextResponse.json({ error: error.message || 'Voice API failed' }, { status: 500 });
    }
}
