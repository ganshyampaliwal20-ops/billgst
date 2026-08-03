import { NextResponse } from 'next/server';
import { sendTransactionalSMS } from '@/lib/sms-service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, message, templateId, variables } = body;

        if (!phone || !message) {
            return NextResponse.json({ success: false, error: 'Phone and message are required' }, { status: 400 });
        }

        const result = await sendTransactionalSMS({
            phone,
            message,
            templateId,
            variables
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error in send-sms route:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

