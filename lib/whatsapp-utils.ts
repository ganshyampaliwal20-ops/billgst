export const getVisitingCardText = (profile: any) => {
    if (!profile || !profile.name) return '';
    
    let card = `\n\n🔹 *${profile.name}* 🔹\n`;
    
    let details = [];
    if (profile.phone) details.push(`📞 ${profile.phone}`);
    if (profile.email) details.push(`📧 ${profile.email}`);
    if (details.length > 0) card += details.join(' | ') + '\n';
    
    if (profile.upi_id) {
        const upiLink = `upi://pay?pa=${profile.upi_id}&pn=${encodeURIComponent(profile.name)}`;
        card += `\n💸 *UPI:* ${profile.upi_id}\n`;
        card += `🔗 *Tap to Pay:* ${upiLink}\n`;
    }
    
    card += `\n🙏 _Dhanyawad!_`;
    
    return card;
};
