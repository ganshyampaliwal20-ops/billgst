const fs = require('fs');
const file = 'f:/bill/lib/subscription.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    /const plan: PlanType = user\.plan_type \|\| 'FREE';/,
    `let plan: PlanType = user.plan_type || 'FREE';
        if (user.created_at) {
            const createdDate = new Date(user.created_at);
            if (new Date() <= new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000)) {
                // Grant all premium features for 1st month
                plan = 'LIFETIME';
            }
        }`
);

fs.writeFileSync(file, code);
