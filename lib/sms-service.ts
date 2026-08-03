/**
 * Central SMS Notification Service for BillGST
 * Supports multiple providers: Fast2SMS, MSG91, 2Factor, or Generic Webhook
 */

export interface SMSPayload {
    phone: string;
    message: string;
    templateId?: string;
    variables?: Record<string, string>;
}

export async function sendTransactionalSMS(payload: SMSPayload): Promise<{ success: boolean; provider?: string; error?: string; messageId?: string }> {
    const rawPhone = (payload.phone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 12 && rawPhone.startsWith('91') ? rawPhone.slice(2) : rawPhone;

    if (!cleanPhone || cleanPhone.length !== 10) {
        return { success: false, error: 'Invalid 10-digit Indian phone number' };
    }

    const fast2smsKey = process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY;
    const msg91Key = process.env.MSG91_AUTH_KEY;
    const twoFactorKey = process.env.TWO_FACTOR_API_KEY;

    // 1. Fast2SMS Quick Transactional / Quick SMS API
    if (fast2smsKey) {
        try {
            const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
                method: 'POST',
                headers: {
                    'authorization': fast2smsKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    route: 'q',
                    message: payload.message,
                    language: 'english',
                    flash: 0,
                    numbers: cleanPhone
                })
            });

            const data = await res.json();
            if (data && data.return === true) {
                return { success: true, provider: 'Fast2SMS', messageId: data.request_id };
            } else {
                console.error('[Fast2SMS] Error response:', data);
                return { success: false, provider: 'Fast2SMS', error: data.message ? (Array.isArray(data.message) ? data.message.join(', ') : data.message) : 'Fast2SMS error' };
            }
        } catch (e: any) {
            console.error('[Fast2SMS] Request failed:', e);
            return { success: false, provider: 'Fast2SMS', error: e.message };
        }
    }

    // 2. 2Factor SMS Gateway
    if (twoFactorKey) {
        try {
            const url = `https://2factor.in/API/V1/${twoFactorKey}/ADDON_SERVICES/SEND/TSMS`;
            const formData = new URLSearchParams();
            formData.append('From', process.env.TWO_FACTOR_SENDER_ID || 'BLGST');
            formData.append('To', cleanPhone);
            formData.append('Msg', payload.message);

            const res = await fetch(url, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data && data.Status === 'Success') {
                return { success: true, provider: '2Factor', messageId: data.Details };
            }
            return { success: false, provider: '2Factor', error: data.Details || '2Factor error' };
        } catch (e: any) {
            return { success: false, provider: '2Factor', error: e.message };
        }
    }

    // 3. MSG91 Gateway
    if (msg91Key) {
        try {
            const res = await fetch('https://api.msg91.com/api/v2/sendsms', {
                method: 'POST',
                headers: {
                    'authkey': msg91Key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sender: process.env.MSG91_SENDER_ID || 'BILGST',
                    route: '4',
                    country: '91',
                    sms: [{ message: payload.message, to: [cleanPhone] }]
                })
            });
            const data = await res.json();
            if (data && (data.type === 'success' || data.status === 'success')) {
                return { success: true, provider: 'MSG91', messageId: data.message };
            }
            return { success: false, provider: 'MSG91', error: data.message || 'MSG91 error' };
        } catch (e: any) {
            return { success: false, provider: 'MSG91', error: e.message };
        }
    }

    // Fallback: If no SMS API key configured in .env yet
    console.log(`[SMS Service] Simulated SMS to +91${cleanPhone}: "${payload.message}" (Set FAST2SMS_API_KEY or MSG91_AUTH_KEY in .env.local to enable real SMS)`);
    return {
        success: true,
        provider: 'Simulated',
        messageId: `sim_${Date.now()}`
    };
}
