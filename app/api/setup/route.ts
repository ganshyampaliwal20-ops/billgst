```typescript
import { NextResponse } from 'next/server';
import pg from 'pg';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    let client;
    try {
        console.log("Setup API: Started");
        
        const dbUrl = process.env.DATABASE_URL;
        
        // DEBUG INFO CHECK
        let urlInfo = "Not Parsed";
        let isValidUrl = false;
        try {
            const parsed = new URL(dbUrl || '');
            isValidUrl = true;
            urlInfo = `Protocol: ${ parsed.protocol }, Host: ${ parsed.hostname }, Valid Format: Yes`;
        } catch (e: any) {
            urlInfo = `Parsing Failed: ${ e.message } `;
        }

        if (!isValidUrl || !dbUrl?.startsWith("postgres")) {
            return NextResponse.json({ 
                success: false, 
                error: "Environment Debug: DATABASE_URL is malformed",
                debug: {
                    exists: !!dbUrl,
                    length: dbUrl ? dbUrl.length : 0,
                    url_test: urlInfo,
                    preview: dbUrl ? dbUrl.substring(0, 10) + "..." : "NULL",
                },
                message: "Your Database URL format is incorrect. It should look like 'postgres://user:pass@host...'"
            }, { status: 500 });
        }

        // DIRECT CONNECTION TEST (Bypass lib/db.ts)
        console.log("Setup API: Attempting DIRECT connection...");
        const { Client } = pg;
        client = new Client({
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false }
        });

        await client.connect();
        console.log("Setup API: DB Connected (Direct)");
        
        // 1. Check/Create User
        const userRes = await client.query('SELECT * FROM users LIMIT 1');
        let userId;
        
        if (userRes.rows.length === 0) {
            console.log("Setup API: Creating new Admin User");
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const newUser = await client.query(`
                INSERT INTO users(name, email, password, role)
VALUES('Admin User', 'admin@example.com', '${hashedPassword}', 'ADMIN') 
                RETURNING id
    `);
            userId = newUser.rows[0].id;
        } else {
            console.log("Setup API: User already exists");
            userId = userRes.rows[0].id;
        }

        await client.end();
        
        return NextResponse.json({ 
            success: true, 
            message: 'System Setup Completed Successfully',
            user_id: userId,
            info: 'You can now create invoices.'
        });

    } catch (error) {
        console.error("Setup API Error:", error);
        if (client) { try { await client.end(); } catch(e) {} }
        
        const dbUrl = process.env.DATABASE_URL;

        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown Error',
            stack: error instanceof Error ? error.stack : undefined,
            debug: {
                exists: !!dbUrl,
                type: typeof dbUrl,
                length: dbUrl ? dbUrl.length : 0,
                preview: dbUrl ? dbUrl.substring(0, 10) + "..." : "NULL",
                node_env: process.env.NODE_ENV
            }
        }, { status: 500 });
    }
}
