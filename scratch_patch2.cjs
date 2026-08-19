const fs = require('fs');
const file = 'f:/bill/lib/pdf-generator.js';
let code = fs.readFileSync(file, 'utf8');

const helper = `export const isUserPremium = (businessDetails) => {
    let premium = ['BASIC_30', 'PREMIUM_99', 'YEARLY_299', 'LIFETIME'].includes(businessDetails?.plan_type);
    if (!premium && businessDetails?.created_at) {
        const createdDate = new Date(businessDetails.created_at);
        const oneMonthLater = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (new Date() <= oneMonthLater) premium = true;
    }
    return premium;
};\n\n`;

if (!code.includes('isUserPremium')) {
    code = helper + code;
}

code = code.replace(/const isPremium = \['BASIC_30', 'PREMIUM_99', 'YEARLY_299', 'LIFETIME'\].includes\(businessDetails\?\.plan_type\);/g, "const isPremium = isUserPremium(businessDetails);");
code = code.replace(/const isPremiumForQR = \['BASIC_30', 'PREMIUM_99', 'YEARLY_299', 'LIFETIME'\].includes\(businessDetails\?\.plan_type\);/g, "const isPremiumForQR = isUserPremium(businessDetails);");

fs.writeFileSync(file, code);
