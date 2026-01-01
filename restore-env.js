
import fs from 'fs';
import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');

const content = `DATABASE_URL="postgresql://postgres.tfewyjcnmwjwsvslvrmo:00GD*%23paliwal@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.tfewyjcnmwjwsvslvrmo:00GD*%23paliwal@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_APP_URL="https://billgst-git-main-ganshyams-projects.vercel.app"
NEXTAUTH_URL="https://billgst-git-main-ganshyams-projects.vercel.app"
NEXTAUTH_SECRET="${secret}"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="gpaliwal59@gmail.com"
SMTP_PASS="4a8d830bf4"
SMTP_FROM_EMAIL="gpaliwal59@gmail.com"
`;

fs.writeFileSync('.env.local', content, { encoding: 'utf8' });
console.log('.env.local has been restored with UTF-8 encoding.');
