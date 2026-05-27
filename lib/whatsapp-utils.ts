export const getVisitingCardText = (profile: any) => {
    if (!profile || !profile.name) return '';
    
    let card = `\n\n-------------------------\n`;
    card += `🏢 *${profile.name}*\n`;
    if (profile.owner_name) card += `👤 ${profile.owner_name}\n`;
    if (profile.phone) card += `📞 ${profile.phone}\n`;
    if (profile.email) card += `📧 ${profile.email}\n`;
    if (profile.address) card += `📍 ${profile.address}\n`;
    if (profile.gstin) card += `📄 GSTIN: ${profile.gstin}\n`;
    
    if (profile.upi_id) {
        const upiLink = `upi://pay?pa=${profile.upi_id}&pn=${encodeURIComponent(profile.name)}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;
        card += `\n💳 *Pay via UPI:*\n${profile.upi_id}\n`;
        card += `📲 *Scan to Pay:* \n${qrUrl}\n`;
        card += `🔗 *Tap to Pay:* \n${upiLink}\n`;
    }
    
    card += `-------------------------`;
    
    return card;
};
