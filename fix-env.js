import fs from 'fs';
import crypto from 'crypto';

// Random secret for NextAuth
const secret = crypto.randomBytes(32).toString('hex');

const content = `DATABASE_URL="postgresql://postgres.tfewyjcnmwjwsvslvrmo:00GD*%23paliwal@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.tfewyjcnmwjwsvslvrmo:00GD*%23paliwal@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_APP_URL="https://billgst-git-main-ganshyams-projects.vercel.app"
NEXTAUTH_URL="https://billgst-git-main-ganshyams-projects.vercel.app"
NEXTAUTH_SECRET="${secret}"
`;

fs.writeFileSync('.env.local', content);
console.log('.env.local has been completely restored with Live URL and Password.');
