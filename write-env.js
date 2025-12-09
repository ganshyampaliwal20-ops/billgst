import fs from 'fs';

// URL encoded password: # -> %23
const content = `DATABASE_URL="postgresql://postgres.tfewyjcnmwjwsvslvrmo:00GD*#paliwal@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.tfewyjcnmwjwsvslvrmo:00GD*#paliwal@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`;

fs.writeFileSync('.env.local', content);
console.log('.env.local updated with encoded password');
