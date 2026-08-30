import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { phone, message, instanceId, apiToken } = await req.json();

        if (!phone || !message || !instanceId || !apiToken) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        const chatId = \\@c.us\;

        const url = \https://api.green-api.com/waInstance\/sendMessage/\\;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, message })
        });

        const data = await response.json();

        if (response.ok && data.idMessage) {
            return NextResponse.json({ success: true, idMessage: data.idMessage });
        } else {
            return NextResponse.json({ error: 'Failed to send message via Green API', details: data }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Green API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
