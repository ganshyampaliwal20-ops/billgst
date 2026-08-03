/**
 * Central WhatsApp Utilities for BillGST
 */

export const formatWhatsAppPhone = (rawPhone: string): string => {
    if (!rawPhone) return '';
    const digits = rawPhone.toString().replace(/\D/g, '');
    if (!digits) return '';

    // If already has 12 digits starting with 91 (e.g. 919829012345)
    if (digits.length === 12 && digits.startsWith('91')) {
        return digits;
    }
    // If 11 digits starting with 0 (e.g. 09829012345)
    if (digits.length === 11 && digits.startsWith('0')) {
        return `91${digits.slice(1)}`;
    }
    // Standard 10 digit Indian number (e.g. 9829012345)
    if (digits.length === 10) {
        return `91${digits}`;
    }
    // If longer than 10 digits, slice last 10 and prepend 91
    if (digits.length > 10) {
        return `91${digits.slice(-10)}`;
    }
    return digits;
};

export const openWhatsAppChat = (phone: string, text: string): boolean => {
    const cleanPhone = formatWhatsAppPhone(phone);
    const encodedText = encodeURIComponent(text);
    const url = cleanPhone 
        ? `https://wa.me/${cleanPhone}?text=${encodedText}` 
        : `https://wa.me/?text=${encodedText}`;

    try {
        const opened = window.open(url, '_blank');
        if (!opened || opened.closed || typeof opened.closed === 'undefined') {
            window.location.href = url;
        }
        return true;
    } catch (e) {
        window.location.href = url;
        return true;
    }
};

export const getVisitingCardText = (profile: any) => {
    if (!profile || (!profile.name && !profile.business_name)) return '';
    
    const bizName = profile.business_name || profile.name;
    let card = `\n\n🏢 *${bizName}*\n`;
    
    const details = [];
    if (profile.phone) details.push(`📞 ${profile.phone}`);
    if (profile.email) details.push(`📧 ${profile.email}`);
    if (details.length > 0) card += details.join(' | ') + '\n';
    
    if (profile.upi_id) {
        const upiLink = `upi://pay?pa=${profile.upi_id}&pn=${encodeURIComponent(bizName)}`;
        card += `\n💸 *UPI ID:* ${profile.upi_id}\n`;
        card += `🔗 *Tap to Pay:* ${upiLink}\n`;
    }
    
    card += `\n🙏 _Thank you for doing business with us!_`;
    
    return card;
};
